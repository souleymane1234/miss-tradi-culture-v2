import { useMemo, useState } from 'react'
import {
  CURRENT_EDITION_YEAR,
  parseVoteCandidateIdFromPath,
  resolveVoteContext,
} from '../data/editions'
import './ConcoursPage.css'
import './VotePage.css'

const VOTE_UNIT_PRICE = 10
const COUNTRY_CODES = ['+225 (CI)', '+226 (BF)', '+223 (ML)'] as const

const MOBILE_OPERATORS = [
  { id: 'orange', label: 'Orange Money', logo: '/orange.png' },
  { id: 'moov', label: 'Moov Money', logo: '/moov.png' },
  { id: 'mtn', label: 'MTN Money', logo: '/mtn.jpg' },
  { id: 'wave', label: 'Wave', logo: '/wave.png' },
] as const

type OperatorId = (typeof MOBILE_OPERATORS)[number]['id']

export function VotePage() {
  const candidateId = parseVoteCandidateIdFromPath()
  const context = useMemo(() => resolveVoteContext(candidateId), [candidateId])

  const [countryCode, setCountryCode] = useState<string>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState<OperatorId>('mtn')
  const [voteCount, setVoteCount] = useState(1)

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
  const total = voteCount * VOTE_UNIT_PRICE
  const operatorLabel = MOBILE_OPERATORS.find((o) => o.id === operator)?.label ?? ''
  const editionHref = `/edition${edition.year === CURRENT_EDITION_YEAR ? '' : `/${edition.year}`}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      window.alert('Veuillez saisir votre numero de telephone.')
      return
    }
    window.alert(
      `Paiement de ${total} F CFA pour ${voteCount} vote(s) en faveur de ${candidate.name} via ${operatorLabel}.`,
    )
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
              <span className="vote-page__rank">Rang #{rank}</span>
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
                  <strong>Tradition :</strong> {candidate.tradition} · {candidate.city},{' '}
                  {candidate.region} · {candidate.age} ans
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
                    <strong>#{rank}</strong>
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

              <form id="vote-form" className="vote-page__form" onSubmit={handleSubmit}>
                <div className="vote-page__field-row">
                  <label className="vote-page__field">
                    <span>Indicatif</span>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
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
                    />
                  </label>
                </div>

                <fieldset className="vote-page__operators">
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
                          onClick={() => setVoteCount((n) => Math.max(1, n - 1))}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          aria-label="Ajouter un vote"
                          onClick={() => setVoteCount((n) => n + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="vote-page__unit-price">Prix unitaire : {VOTE_UNIT_PRICE} F CFA</p>
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
                  <dd>{VOTE_UNIT_PRICE} F CFA</dd>
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
              <button type="submit" form="vote-form" className="vote-page__pay-btn">
                Valider et payer
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
