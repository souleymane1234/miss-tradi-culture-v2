import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FaLocationDot } from 'react-icons/fa6'
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
  mapEditionDetailForVotePage,
  mapEditionMetaForVotePage,
  type VoteEditionView,
} from '../lib/map-emission'
import { voteRequest } from '../lib/vote-request'
import { resolveVoteEditionId } from '../lib/vote-navigation'
import {
  clampVoteCount,
  formatVotePaymentError,
  getVotePhoneExample,
  getVotePhoneHint,
  isVoteAmountInvalid,
  MAX_VOTES_PER_PAYMENT,
  resolveVoteAmountPerVote,
  validateVotePhoneForProvider,
} from '../lib/vote-payment'
import { isAuthenticated } from '../lib/auth/auth-storage'
import { EditionVideoPlayer } from './EditionVideoPlayer'
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
    orange: 'orangeci',
    moov: 'moovci',
    mtn: 'mtnci',
    wave: 'waveci',
  }
  return map[id]
}

export function VotePage() {
  const queryClient = useQueryClient()
  const candidateId = parseVoteCandidateIdFromPath()
  const editionId = resolveVoteEditionId(candidateId)
  const mockContext = useMemo(
    () => (USE_MOCK_DATA ? resolveVoteContext(candidateId) : null),
    [candidateId],
  )

  const resolvedEmission = useResolvedEmission()
  const pointsPerVote = resolvedEmission.pointsPerVote

  const apiVote = useCandidateFromApi(
    USE_MOCK_DATA ? null : candidateId,
    editionId,
    pointsPerVote,
  )

  const voteAmountPerVote = USE_MOCK_DATA
    ? pointsPerVote
    : resolveVoteAmountPerVote(apiVote.editionDetail)

  const [countryCode, setCountryCode] = useState<string>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [orangeOtp, setOrangeOtp] = useState('')
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
      pointsPerVote,
    )
    const edition: VoteEditionView = apiVote.editionDetail
      ? mapEditionDetailForVotePage(apiVote.editionDetail)
      : mapEditionMetaForVotePage(apiVote.candidateDto.edition)
    return { edition, candidate, rank: apiVote.rank }
  }, [apiVote.candidateDto, apiVote.editionDetail, apiVote.rank, pointsPerVote])

  const context = USE_MOCK_DATA ? mockContext : apiContext

  if (!USE_MOCK_DATA && apiVote.missingEditionId) {
    return (
      <main className="vote-page vote-page--empty">
        <div className="vote-page__shell">
          <h1>Lien de vote incomplet</h1>
          <p>
            Ouvrez la page de vote depuis l&apos;edition en cliquant sur le bouton Voter d&apos;une
            candidate.
          </p>
          <a href="/edition" className="vote-page__back-link">
            Retour aux editions
          </a>
        </div>
      </main>
    )
  }

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
  const photoSrc = candidate.photoSrc?.trim() || '/logo.png'
  const videoSrc = candidate.videoSrc ?? '/videomiss.mp4'
  const total = voteCount * voteAmountPerVote
  const operatorLabel = MOBILE_OPERATORS.find((o) => o.id === operator)?.label ?? ''
  const apiProvider = mapMobileMoneyToApiProvider(operator)
  const phoneExample = getVotePhoneExample(apiProvider)
  const phoneHint = getVotePhoneHint(apiProvider)
  const editionHref = `/edition${edition.year === CURRENT_EDITION_YEAR ? '' : `/${edition.year}`}`

  const handleInitiatePayment = async () => {
    if (!phone.trim()) {
      setPaymentError('Veuillez saisir votre numero de telephone.')
      return
    }
    if (!candidateId) return

    if (!USE_MOCK_DATA && !isAuthenticated()) {
      setPaymentError('Connectez-vous pour initier un paiement de vote.')
      return
    }

    if (!USE_MOCK_DATA && isVoteAmountInvalid(voteAmountPerVote, voteCount)) {
      setPaymentError(
        'Le tarif de vote de cette edition est invalide (0 F CFA). Verifiez voteAmountPerVote cote API.',
      )
      return
    }

    if (voteCount > MAX_VOTES_PER_PAYMENT) {
      setPaymentError(`Maximum ${MAX_VOTES_PER_PAYMENT} votes par paiement.`)
      return
    }

    if (USE_MOCK_DATA) {
      window.alert(
        `Paiement de ${total} F CFA pour ${voteCount} vote(s) en faveur de ${candidate.name} via ${operatorLabel}.`,
      )
      return
    }

    if (operator === 'orange' && !orangeOtp.trim()) {
      setPaymentError('Saisissez le code OTP recu par SMS pour Orange Money.')
      return
    }

    setPaymentError(null)
    setPaymentLoading(true)
    try {
      const phoneValidation = validateVotePhoneForProvider(phone, countryCode, apiProvider)
      if ('error' in phoneValidation) {
        setPaymentError(phoneValidation.error)
        return
      }
      const otp = orangeOtp.replace(/\D/g, '')
      if (operator === 'orange' && otp.length < 4) {
        setPaymentError('Le code OTP Orange Money est invalide.')
        return
      }
      const res = await voteRequest.initiatePayment(candidateId, {
        voteCount: clampVoteCount(voteCount),
        provider: apiProvider,
        phoneNumber: phoneValidation.phone,
        otp: operator === 'orange' ? otp : undefined,
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
        formatVotePaymentError(e, 'Le paiement n\'a pas pu etre initie.'),
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
      await voteRequest.confirmPayment(candidateId, {
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
          <section className="vote-page__hero" aria-label="Profil de la candidate">
            <img className="vote-page__hero-bg" src={photoSrc} alt="" aria-hidden="true" />
            <div className="vote-page__hero-overlay" aria-hidden="true" />

            <div className="vote-page__hero-inner">
              <div className="vote-page__badges">
                <span className="vote-page__badge">Edition {edition.year}</span>
                {rank > 0 && <span className="vote-page__badge">Top {rank}</span>}
              </div>

              <div className="vote-page__identity">
                <img
                  className="vote-page__identity-photo"
                  src={photoSrc}
                  alt={`Photo de ${candidate.name}`}
                  width={120}
                  height={120}
                />
                <div className="vote-page__identity-text">
                  <h1 className="vote-page__name">{candidate.name}</h1>
                  <p className="vote-page__username">@{candidate.username}</p>
                  <p className="vote-page__location">
                    <FaLocationDot aria-hidden="true" />
                    <span>
                      {candidate.city}
                      {candidate.region && candidate.region !== candidate.city
                        ? ` · ${candidate.region}`
                        : ''}
                    </span>
                  </p>
                  {candidate.bio?.trim() && (
                    <p className="vote-page__tagline">{candidate.bio}</p>
                  )}
                  <p className="vote-page__meta-line">
                    <strong>Tradition :</strong> {candidate.tradition}
                    {candidate.age > 0 ? ` · ${candidate.age} ans` : ''}
                  </p>
                  <p className="vote-page__meta-line">
                    <strong>Categorie :</strong> {candidate.mentorName}
                    {' · '}
                    <strong>Tag :</strong> {candidate.mentorSubtitle}
                  </p>
                </div>
              </div>

              <ul className="vote-page__hero-stats">
                <li>
                  <strong>{candidate.votes}</strong>
                  <span>Votes</span>
                </li>
                <li>
                  <strong>{candidate.quizPoints}</strong>
                  <span>Points quiz</span>
                </li>
                <li>
                  <strong>{candidate.points}</strong>
                  <span>Points</span>
                </li>
                <li>
                  <strong>#{rank || '—'}</strong>
                  <span>Classement</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="vote-page__presentation" aria-label="Video de presentation">
            <h2 className="vote-page__presentation-title">Video de presentation</h2>
            <EditionVideoPlayer
              video={{
                url: videoSrc,
                title: candidate.name,
                thumbnailUrl: photoSrc,
              }}
              poster={photoSrc}
            />
          </section>

          <section className="vote-page__checkout" aria-labelledby="vote-form-title">
            <div className="vote-page__form-panel">
              <h2 id="vote-form-title" className="vote-page__form-title">
                Vote pour ton favori
              </h2>
              <p className="vote-page__form-intro">
                Entre ton numero, choisis l&apos;operateur et le nombre de votes. Le paiement
                s&apos;ouvre dans un nouvel onglet si une URL est fournie ; valide ensuite tes
                votes une fois le paiement reussi.
              </p>

              {!USE_MOCK_DATA && voteAmountPerVote <= 0 && (
                <p className="vote-page__form-error" role="alert">
                  Le tarif de vote de cette edition est a 0 F CFA. Le paiement sera refuse par
                  l&apos;API tant que voteAmountPerVote n&apos;est pas configure sur l&apos;edition.
                </p>
              )}

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
                      placeholder={`Ex: ${phoneExample}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      disabled={Boolean(pendingPayment)}
                    />
                  </label>
                </div>

                <p className="vote-page__phone-hint">{phoneHint}</p>

                <fieldset className="vote-page__operators" disabled={Boolean(pendingPayment)}>
                  <legend>Choisis ton Mobile Money</legend>
                  <div className="vote-page__operators-grid">
                    {MOBILE_OPERATORS.map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        className={`vote-page__operator${operator === op.id ? ' vote-page__operator--active' : ''}`}
                        onClick={() => {
                          setOperator(op.id)
                          if (op.id !== 'orange') setOrangeOtp('')
                          setPaymentError(null)
                        }}
                      >
                        <span className="vote-page__operator-logo">
                          <img src={op.logo} alt="" />
                        </span>
                        <span className="vote-page__operator-label">{op.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="vote-page__operator-note">
                    Orange Money necessite le code OTP recu par SMS. MTN, Moov et Wave ne
                    demandent pas d&apos;OTP sur cette page.
                  </p>
                </fieldset>

                {operator === 'orange' && (
                  <label className="vote-page__field vote-page__field--otp">
                    <span>Code OTP Orange Money</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Ex: 123456"
                      value={orangeOtp}
                      onChange={(e) => setOrangeOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      disabled={Boolean(pendingPayment)}
                      maxLength={8}
                    />
                    <span className="vote-page__field-hint">
                      Saisissez le code a usage unique envoye sur votre telephone Orange.
                    </span>
                  </label>
                )}

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
                          onClick={() => setVoteCount((n) => clampVoteCount(n - 1))}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          aria-label="Ajouter un vote"
                          disabled={Boolean(pendingPayment) || voteCount >= MAX_VOTES_PER_PAYMENT}
                          onClick={() => setVoteCount((n) => clampVoteCount(n + 1))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="vote-page__unit-price">
                      Prix unitaire : {voteAmountPerVote} F CFA · max {MAX_VOTES_PER_PAYMENT} votes
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
              <div className="vote-page__recap-candidate">
                <img src={photoSrc} alt="" width={56} height={56} />
                <div>
                  <strong>{candidate.name}</strong>
                  <span>@{candidate.username}</span>
                </div>
              </div>
              <h2 id="vote-recap-title">Recapitulatif</h2>
              <dl className="vote-page__recap-list">
                <div>
                  <dt>Edition</dt>
                  <dd>{edition.title}</dd>
                </div>
                <div>
                  <dt>Candidate</dt>
                  <dd>{candidate.name}</dd>
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
                  <dd>{voteAmountPerVote} F CFA</dd>
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
