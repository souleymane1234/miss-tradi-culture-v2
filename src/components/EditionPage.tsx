import { useEffect, useMemo, useRef, useState } from 'react'
import { useRevealOnView } from '../hooks/useRevealOnView'
import { HeroVideo } from './HeroVideo'
import { PromoBanner } from './PromoBanner'
import { SectionBridge } from './SectionBridge'
import {
  CURRENT_EDITION_YEAR,
  EDITIONS,
  type Candidate,
  type Edition,
} from '../data/editions'
import './ConcoursPage.css'
import './EditionPage.css'

const SPONSOR_TIER_LABEL: Record<Edition['sponsors'][number]['tier'], string> = {
  principal: 'Partenaire principal',
  or: 'Or',
  argent: 'Argent',
  bronze: 'Bronze',
}

function parseEditionYearFromPath(): number | null {
  const match = window.location.pathname.match(/^\/edition\/(\d{4})\/?$/)
  if (!match) return null
  const year = Number(match[1])
  return EDITIONS.some((e) => e.year === year) ? year : null
}

function CrownIcon() {
  return (
    <svg
      className="edition-page__candidate-rank-icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M5 16L3 7l5.5 4L12 4l3.5 7L21 7l-2 9H5zm2.7 2h8.6l1 3H6.7l1-3z"
      />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  )
}

function CandidateCard({
  candidate,
  rank,
  isWinner,
  isPastEdition,
  onPlayVideo,
  onVote,
}: {
  candidate: Candidate
  rank: number
  isWinner: boolean
  isPastEdition: boolean
  onPlayVideo: (candidate: Candidate) => void
  onVote: (candidate: Candidate) => void
}) {
  const mentorInitial = candidate.mentorName.charAt(0).toUpperCase()

  return (
    <article className="edition-page__candidate">
      <img
        className="edition-page__candidate-bg"
        src={candidate.photoSrc}
        alt=""
        loading="lazy"
      />
      <div className="edition-page__candidate-overlay" aria-hidden="true" />

      <span className="edition-page__candidate-rank">
        <CrownIcon />
        #{rank}
      </span>

      {isWinner && (
        <span className="edition-page__candidate-winner-tag">Gagnante</span>
      )}

      <button
        type="button"
        className="edition-page__candidate-play"
        aria-label={`Lire la video de ${candidate.name}`}
        onClick={() => onPlayVideo(candidate)}
      >
        <PlayIcon />
      </button>

      <div className="edition-page__candidate-footer">
        <h3 className="edition-page__candidate-username">{candidate.username}</h3>
        <p className="edition-page__candidate-stats">
          {candidate.votes} vote · {candidate.points} points
        </p>
        <p className="edition-page__candidate-quiz">Points quiz : {candidate.quizPoints}</p>

        <div className="edition-page__candidate-mentor">
          <div className="edition-page__candidate-mentor-avatar-container">
            <span className="edition-page__candidate-mentor-avatar" aria-hidden="true">
              {mentorInitial}
            </span>
          </div>

          <div>
            <strong>{candidate.mentorName}</strong>
            <span>{candidate.mentorSubtitle}</span>
          </div>
        </div>

        <div className="edition-page__candidate-actions">
          <button
            type="button"
            className="edition-page__candidate-btn edition-page__candidate-btn--video"
            onClick={() => onPlayVideo(candidate)}
          >
            Voir video
          </button>
          <button
            type="button"
            className="edition-page__candidate-btn edition-page__candidate-btn--vote"
            disabled={isPastEdition}
            onClick={() => onVote(candidate)}
          >
            {isPastEdition ? 'Cloture' : 'Voter'}
          </button>
        </div>
      </div>
    </article>
  )
}


function CandidateVideoModal({
  candidate,
  onClose,
}: {
  candidate: Candidate
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSrc = candidate.videoSrc ?? '/videomiss.mp4'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    const video = videoRef.current
    video?.play().catch(() => {})

    return () => {
      window.removeEventListener('keydown', onKey)
      video?.pause()
    }
  }, [onClose, candidate.id])

  return (
    <div className="edition-page__modal" role="presentation" onClick={onClose}>
      <dialog
        className="edition-page__modal-dialog edition-page__modal-dialog--video"
        open
        aria-labelledby="candidate-video-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="edition-page__modal-close"
          aria-label="Fermer"
          onClick={onClose}
        >
          ×
        </button>
        <div className="edition-page__modal-video-wrap">
          <video
            ref={videoRef}
            className="edition-page__modal-video"
            src={videoSrc}
            poster={candidate.photoSrc}
            controls
            playsInline
            preload="metadata"
          >
            Votre navigateur ne prend pas en charge la lecture video.
          </video>
        </div>
        <div className="edition-page__modal-video-info">
          <h2 id="candidate-video-title">{candidate.name}</h2>
          <p className="edition-page__modal-video-username">@{candidate.username}</p>
          <p className="edition-page__modal-video-meta">
            {candidate.tradition} · {candidate.city}, {candidate.region}
          </p>
        </div>
      </dialog>
    </div>
  )
}


export function EditionPage() {
  const initialYear = parseEditionYearFromPath() ?? CURRENT_EDITION_YEAR
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [videoCandidate, setVideoCandidate] = useState<Candidate | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>('all')

  const edition = useMemo(
    () => EDITIONS.find((e) => e.year === selectedYear) ?? EDITIONS[0],
    [selectedYear],
  )

  const regions = useMemo(
    () => [...new Set(edition.candidates.map((c) => c.region))].sort(),
    [edition],
  )

  const filteredCandidates = useMemo(() => {
    if (regionFilter === 'all') return edition.candidates
    return edition.candidates.filter((c) => c.region === regionFilter)
  }, [edition, regionFilter])

  const rankedCandidates = useMemo(
    () => [...filteredCandidates].sort((a, b) => b.points - a.points),
    [filteredCandidates],
  )

  const handleVote = (candidate: Candidate) => {
    window.location.href = `/vote/${candidate.id}`
  }

  const selectEdition = (year: number) => {
    setSelectedYear(year)
    setRegionFilter('all')
    setVideoCandidate(null)
    const path = year === CURRENT_EDITION_YEAR ? '/edition' : `/edition/${year}`
    window.history.replaceState(null, '', path)
  }

  const isPast = edition.status === 'past'
  const { ref: presentationRef, isVisible: presentationVisible } =
    useRevealOnView<HTMLElement>()

  return (
    <main className="concours-page edition-page" aria-labelledby="edition-title">
      {videoCandidate && (
        <CandidateVideoModal
          candidate={videoCandidate}
          onClose={() => setVideoCandidate(null)}
        />
      )}

      <HeroVideo
        key={edition.year}
        src={edition.videoSrc}
        poster={edition.videoPosterSrc}
        subtitle={`Edition ${edition.year}`}
        title={edition.theme}
      />
      <PromoBanner />
      <SectionBridge variant="ribbon" />

      <section id="edition" className="concours-page__stack">
        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner">
            <p className="concours-page__eyebrow">Edition</p>
            <h1 id="edition-title">{edition.title}</h1>
            <p className="concours-page__lead">{edition.tagline}</p>

            <div className="edition-page__year-tabs" role="tablist" aria-label="Choisir une edition">
              {EDITIONS.map((e) => (
                <button
                  key={e.year}
                  type="button"
                  role="tab"
                  aria-selected={e.year === selectedYear}
                  className={`edition-page__year-tab${e.year === selectedYear ? ' edition-page__year-tab--active' : ''}${e.status === 'current' ? ' edition-page__year-tab--current' : ''}`}
                  onClick={() => selectEdition(e.year)}
                >
                  {e.year}
                  {e.status === 'current' && (
                    <span className="edition-page__year-tab-label">En cours</span>
                  )}
                </button>
              ))}
            </div>

            <ul className="edition-page__highlights">
              {edition.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section
          key={`presentation-${selectedYear}`}
          ref={presentationRef}
          className={`concours-page__section edition-page__presentation-section${presentationVisible ? ' edition-page__presentation-section--visible' : ''}`}
        >
          <div className="edition-page__presentation">
            <h2>Presentation de l&apos;edition {edition.year}</h2>
            <div className="edition-page__presentation-grid">
              <div className="edition-page__presentation-visual">
                <img
                  src="/miss.jpg"
                  alt={`Visuel ${edition.title}`}
                  loading="lazy"
                />
              </div>
              <div className="edition-page__presentation-content">
                <p className="concours-page__eyebrow edition-page__theme">{edition.theme}</p>
                <dl className="edition-page__meta edition-page__meta--presentation">
                  <div className="edition-page__meta-card">
                    <dt>Dates</dt>
                    <dd>{edition.dates}</dd>
                  </div>
                  <div className="edition-page__meta-card">
                    <dt>Lieu</dt>
                    <dd>{edition.location}</dd>
                  </div>
                  <div className="edition-page__meta-card">
                    <dt>Candidates</dt>
                    <dd>{edition.candidateCount} participantes</dd>
                  </div>
                  <div className="edition-page__meta-card">
                    <dt>Statut</dt>
                    <dd>{isPast ? 'Edition terminee' : 'Edition en cours'}</dd>
                  </div>
                </dl>
                <p className="edition-page__description">{edition.description}</p>
              </div>
            </div>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section edition-page__candidates-section" id="candidates">
          <div className="edition-page__candidates-wrap">
            <h2>
              {isPast ? 'Les candidates de l\'edition' : 'Les candidates en lice'}
            </h2>
            <p className="edition-page__section-intro">
              {isPast
                ? 'Retrouvez les participantes de cette edition. Cliquez sur une candidate pour voir son profil.'
                : 'Decouvrez les candidates selectionnees pour cette edition. Cliquez sur une carte pour en savoir plus.'}
            </p>

            {regions.length > 1 && (
              <div className="edition-page__filters">
                <label htmlFor="edition-region-filter" className="edition-page__filter-label">
                  Filtrer par region
                </label>
                <select
                  id="edition-region-filter"
                  className="edition-page__filter-select"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <option value="all">Toutes les regions</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="edition-page__candidates-grid">
              {rankedCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={index + 1}
                  isWinner={edition.winnerId === candidate.id}
                  isPastEdition={isPast}
                  onPlayVideo={setVideoCandidate}
                  onVote={handleVote}
                />
              ))}
            </div>
            {filteredCandidates.length === 0 && (
              <p className="edition-page__empty">Aucune candidate pour ce filtre.</p>
            )}
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Lots et recompenses</h2>
            <div className="edition-page__prizes">
              {edition.prizes.map((prize) => (
                <article key={prize.title} className="edition-page__prize">
                  <h3>{prize.title}</h3>
                  <p>{prize.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Reglement</h2>
            <ul className="concours-page__list edition-page__rules">
              {edition.rulesSummary.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <a className="concours-page__inline-link" href={edition.rulesDocumentHref}>
              Telecharger le reglement complet (PDF)
            </a>
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Sponsors de l&apos;edition {edition.year}</h2>
            <p className="edition-page__section-intro">
              Merci a nos partenaires qui accompagnent chaque edition du concours.
            </p>
            <div className="edition-page__sponsors">
              {edition.sponsors.map((sponsor) => (
                <article key={`${sponsor.name}-${sponsor.logoSrc}`} className="edition-page__sponsor">
                  <img src={sponsor.logoSrc} alt={sponsor.name} loading="lazy" />
                  <p>{sponsor.name}</p>
                  <span className="edition-page__sponsor-tier">
                    {SPONSOR_TIER_LABEL[sponsor.tier]}
                  </span>
                </article>
              ))}
            </div>
            <a className="concours-page__inline-link edition-page__partner-link" href="/partenariat">
              Devenir sponsor
            </a>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Autres editions</h2>
            <p className="edition-page__section-intro">
              Parcourez les editions precedentes du concours Miss Tradi Culture.
            </p>
            <div className="edition-page__history">
              {EDITIONS.filter((e) => e.year !== selectedYear).map((past) => (
                <article key={past.year} className="edition-page__history-card">
                  <img src={past.coverImageSrc} alt="" loading="lazy" />
                  <div>
                    <h3>{past.title}</h3>
                    <p>{past.theme}</p>
                    <ul>
                      {past.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="edition-page__history-btn"
                      onClick={() => selectEdition(past.year)}
                    >
                      Voir l&apos;edition {past.year}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {!isPast && (
          <>
            <SectionBridge variant="wave" />
            <section className="concours-page__section">
              <div className="concours-page__inner">
                <h2>Vous aussi, participez</h2>
                <p className="edition-page__section-intro">
                  Les pre-inscriptions pour l&apos;edition {CURRENT_EDITION_YEAR} sont ouvertes.
                </p>
                <div className="concours-page__actions">
                  <a href="/concours" className="concours-page__btn-primary edition-page__cta">
                    Deposer ma candidature
                  </a>
                  <a href="/actualites">Suivre les actualites</a>
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
