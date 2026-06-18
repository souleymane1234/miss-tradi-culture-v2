import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { USE_MOCK_DATA } from '../config/app-config'
import {
  CURRENT_EDITION_YEAR,
  parseVoteCandidateIdFromPath,
  resolveVoteContext,
} from '../data/editions'
import {
  emissionQueryKeys,
  useCandidateFromApi,
  useResolvedEmission,
} from '../hooks/use-emission-queries'
import { ApiHttpError, type VotePaymentProvider } from '../lib/api'
import {
  mapCandidateDetailToCandidate,
  mapEditionMetaForVotePage,
  type VoteEditionView,
} from '../lib/map-emission'
import { emissionRequest } from '../lib/emission-request'
import './ConcoursPage.css'
import './VotePage.css'

const COUNTRY_CODES = ['+225 (CI)', '+226 (BF)', '+223 (ML)'] as const

const MOBILE_OPERATORS = [
  { id: 'orange', label: 'Orange Money', logo: '/orange.png' },
  { id: 'moov', label: 'Moov Money', logo: '/moov.png' },
  { id: 'mtn', label: 'MTN Money', logo: '/mtn.jpg' },
  { id: 'wave', label: 'Wave', logo: '/wave.png' },
] as const

type OperatorId = (typeof MOBILE_OPERATORS)[number]['id']

function mapMobileMoneyToApiProvider(id: OperatorId): VotePaymentProvider {
  const map: Record<OperatorId, VotePaymentProvider> = {
    orange: 'ORANGE',
    moov: 'MOOV',
    mtn: 'MTN',
    wave: 'WAVE',
  }
  return map[id]
}

export function VotePage() {
  const queryClient = useQueryClient()
  const candidateId = parseVoteCandidateIdFromPath()
  const mockContext = useMemo(
    () => (USE_MOCK_DATA ? resolveVoteContext(candidateId) : null),
    [candidateId],
  )

  const resolvedEmission = useResolvedEmission()
  const amountPerVote = resolvedEmission.pointsPerVote

  const apiVote = useCandidateFromApi(USE_MOCK_DATA ? null : candidateId, amountPerVote)

  const [countryCode, setCountryCode] = useState<string>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState<OperatorId>('mtn')
  const [voteCount, setVoteCount] = useState(1)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [pendingPayment, setPendingPayment] = useState<{
    transactionId: string
    voteCount: number
  } | null>(null)

  const apiContext = useMemo(() => {
    if (!apiVote.candidateDto) return null
    const candidate = mapCandidateDetailToCandidate(
      apiVote.candidateDto,
      apiVote.rank,
      amountPerVote,
    )
    const edition: VoteEditionView = mapEditionMetaForVotePage(apiVote.candidateDto.edition)
    return { edition, candidate, rank: apiVote.rank }
  }, [apiVote.candidateDto, apiVote.rank, amountPerVote])

  const context = USE_MOCK_DATA ? mockContext : apiContext

  if (!USE_MOCK_DATA && apiVote.isLoading) {
    return (
      <main className="vote-page vote-page--empty">
        <div className="vote-page__shell">
          <p>Chargement de la candidate…</p>
        </div>
      </main>
    )
  }

  if (!context) {
    return (
      <main className="vote-page vote-page--empty">
        <div className="vote-page__shell">
          <h1>Candidate introuvable</h1>
          <p>Le lien de vote est invalide ou la candidate n&apos;existe plus.</p>
          <a href="/edition" className="vote-page__back-link">
            Retour aux editions
          </a>
        </div>
      </main>
    )
  }

  const { edition, candidate, rank } = context
  const videoSrc = candidate.videoSrc ?? '/videomiss.mp4'
  const total = voteCount * amountPerVote
  const operatorLabel = MOBILE_OPERATORS.find((o) => o.id === operator)?.label ?? ''
  const editionHref = `/edition${edition.year === CURRENT_EDITION_YEAR ? '' : `/${edition.year}`}`

  const handleInitiatePayment = async () => {
    if (!phone.trim()) {
      setPaymentError('Veuillez saisir votre numero de telephone.')
      return
    }
    if (!candidateId) return

    if (USE_MOCK_DATA) {
      window.alert(
        `Paiement de ${total} F CFA pour ${voteCount} vote(s) en faveur de ${candidate.name} via ${operatorLabel}.`,
      )
      return
    }

    setPaymentError(null)
    setPaymentLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      if (!digits) {
        setPaymentError('Numero de telephone invalide.')
        return
      }
      const res = await emissionRequest.initiateCandidateVote(candidateId, {
        voteCount,
        provider: mapMobileMoneyToApiProvider(operator),
        amountPerVote,
        phoneNumber: digits,
      })
      const txId = res.data?.id
      if (!txId) {
        setPaymentError('Reponse serveur inattendue.')
        return
      }
      setPendingPayment({ transactionId: txId, voteCount })
      const payUrl = res.data.paymentUrl?.trim()
      if (payUrl) window.open(payUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      setPaymentError(
        e instanceof ApiHttpError ? e.message : 'Le paiement n\'a pas pu etre initie.',
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleConfirmVotes = async () => {
    if (!candidateId || !pendingPayment) return
    setPaymentError(null)
    setConfirmLoading(true)
    try {
      await emissionRequest.confirmCandidateVote(candidateId, {
        transactionId: pendingPayment.transactionId,
        voteCount: pendingPayment.voteCount,
      })
      setPendingPayment(null)
      void queryClient.invalidateQueries({ queryKey: emissionQueryKeys.candidate(candidateId) })
      window.alert('Votes enregistres avec succes !')
    } catch (e) {
      setPaymentError(
        e instanceof ApiHttpError ? e.message : 'Enregistrement des votes impossible.',
      )
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingPayment) {
      void handleConfirmVotes()
      return
    }
    void handleInitiatePayment()
  }

  return (
    <main className="vote-page" id="vote">
      <div className="vote-page__shell">
        <a href={editionHref} className="vote-page__back">
          ← Retour a l&apos;edition {edition.year}
        </a>

        <div className="vote-page__stack">
          <section className="vote-page__edition-block" aria-label="Edition">
            <p className="vote-page__eyebrow">Edition {edition.year}</p>
            <h1 className="vote-page__edition-title">{edition.title}</h1>
            <p className="vote-page__edition-theme">{edition.theme}</p>
            <p className="vote-page__edition-meta">
              {edition.dates} · {edition.location}
            </p>
            <p className="vote-page__edition-desc">{edition.tagline}</p>
          </section>

          <section className="vote-page__profile" aria-label="Candidate">
            <div className="vote-page__profile-head">
              <span className="vote-page__rank">Rang #{rank || '—'}</span>
              <h2>{candidate.name}</h2>
              <p className="vote-page__username">@{candidate.username}</p>
            </div>

            <div className="vote-page__profile-body">
              <div className="vote-page__media">
                <img src={candidate.photoSrc} alt={candidate.name} className="vote-page__photo" />
                <div className="vote-page__video-box">
                  <video
                    src={videoSrc}
                    poster={candidate.photoSrc}
                    controls
                    playsInline
                    preload="metadata"
                    className="vote-page__video"
                  />
                </div>
              </div>

              <div className="vote-page__profile-details">
                <p className="vote-page__bio">{candidate.bio}</p>
                <p className="vote-page__tradition">
                  <strong>Tradition :</strong> {candidate.tradition}
                  {candidate.age > 0 ? ` · ${candidate.age} ans` : ''}
                </p>
                <p className="vote-page__tradition">
                  <strong>Origine :</strong> {candidate.region}
                  {' · '}
                  <strong>Residence :</strong> {candidate.city}
                </p>

                <ul className="vote-page__stats">
                  <li>
                    <span>Points total</span>
                    <strong>{candidate.points}</strong>
                  </li>
                  <li>
                    <span>Points quiz</span>
                    <strong>{candidate.quizPoints}</strong>
                  </li>
                  <li>
                    <span>Votes</span>
                    <strong>{candidate.votes}</strong>
                  </li>
                  <li>
                    <span>Rang</span>
                    <strong>#{rank || '—'}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="vote-page__checkout" aria-labelledby="vote-form-title">
            <div className="vote-page__form-panel">
              <h2 id="vote-form-title" className="vote-page__form-title">
                Vote pour ton favori
              </h2>
              <p className="vote-page__form-intro">
                Saisis ton numero, choisis ton operateur Mobile Money, selectionne le nombre de
                votes puis valide le paiement.
              </p>

              {paymentError && (
                <p className="vote-page__form-error" role="alert">
                  {paymentError}
                </p>
              )}

              {pendingPayment && (
                <p className="vote-page__form-pending" role="status">
                  Paiement initie. Valide sur ton telephone, puis clique sur « Confirmer les votes ».
                </p>
              )}

              <form id="vote-form" className="vote-page__form" onSubmit={handleSubmit}>
                <div className="vote-page__field-row">
                  <label className="vote-page__field">
                    <span>Indicatif</span>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={Boolean(pendingPayment)}
                    >
                      {COUNTRY_CODES.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="vote-page__field vote-page__field--grow">
                    <span>Numero de telephone</span>
                    <input
                      type="tel"
                      placeholder="Ex: 0700000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      disabled={Boolean(pendingPayment)}
                    />
                  </label>
                </div>

                <fieldset className="vote-page__operators" disabled={Boolean(pendingPayment)}>
                  <legend>Choisis ton Mobile Money</legend>
                  <div className="vote-page__operators-grid">
                    {MOBILE_OPERATORS.map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        className={`vote-page__operator${operator === op.id ? ' vote-page__operator--active' : ''}`}
                        onClick={() => setOperator(op.id)}
                      >
                        <span className="vote-page__operator-logo">
                          <img src={op.logo} alt="" />
                        </span>
                        <span className="vote-page__operator-label">{op.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="vote-page__operator-note">
                    Orange Money peut demander un OTP non gere sur ce site. Pour un paiement plus
                    fluide, privilegie Moov, MTN ou Wave.
                  </p>
                </fieldset>

                <div className="vote-page__votes-row">
                  <div className="vote-page__votes-box">
                    <span className="vote-page__votes-label">Nombre de votes</span>
                    <div className="vote-page__votes-control">
                      <span className="vote-page__votes-value">{voteCount}</span>
                      <div className="vote-page__votes-actions">
                        <button
                          type="button"
                          aria-label="Retirer un vote"
                          disabled={Boolean(pendingPayment)}
                          onClick={() => setVoteCount((n) => Math.max(1, n - 1))}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          aria-label="Ajouter un vote"
                          disabled={Boolean(pendingPayment)}
                          onClick={() => setVoteCount((n) => n + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="vote-page__unit-price">
                      Prix unitaire : {amountPerVote} F CFA
                    </p>
                  </div>

                  <aside className="vote-page__quiz">
                    <div className="vote-page__quiz-head">
                      <h3>Quiz candidates</h3>
                      <span className="vote-page__quiz-badge">+ points bonus</span>
                    </div>
                    <p>
                      1 quiz gratuit par jour. Quiz payant : 500 F CFA. Connecte-toi pour gagner
                      des points supplementaires.
                    </p>
                  </aside>
                </div>
              </form>
            </div>

            <aside className="vote-page__recap" aria-labelledby="vote-recap-title">
              <h2 id="vote-recap-title">Recapitulatif</h2>
              <dl className="vote-page__recap-list">
                <div>
                  <dt>Edition</dt>
                  <dd>{edition.title}</dd>
                </div>
                <div>
                  <dt>Candidate</dt>
                  <dd>{candidate.username}</dd>
                </div>
                <div>
                  <dt>Numero</dt>
                  <dd>{phone ? `${countryCode.split(' ')[0]} ${phone}` : '—'}</dd>
                </div>
                <div>
                  <dt>Votes</dt>
                  <dd>{voteCount}</dd>
                </div>
                <div>
                  <dt>Prix unitaire</dt>
                  <dd>{amountPerVote} F CFA</dd>
                </div>
                <div>
                  <dt>Mobile Money</dt>
                  <dd>{operatorLabel}</dd>
                </div>
              </dl>
              <div className="vote-page__recap-total">
                <span>Total</span>
                <strong>{total} F CFA</strong>
              </div>
              <button
                type="submit"
                form="vote-form"
                className="vote-page__pay-btn"
                disabled={paymentLoading || confirmLoading}
              >
                {pendingPayment
                  ? confirmLoading
                    ? 'Confirmation…'
                    : 'Confirmer les votes'
                  : paymentLoading
                    ? 'Paiement en cours…'
                    : 'Valider et payer'}
              </button>
              <p className="vote-page__recap-note">
                Paiement securise via Mobile Money (API Miss Track)
              </p>
            </aside>
          </section>
        </div>
      </div>
    </main>
  )
}
