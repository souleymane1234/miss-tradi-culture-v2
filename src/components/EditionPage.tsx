import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { USE_MOCK_DATA } from '../config/app-config'
import {
  CURRENT_EDITION_YEAR,
  EDITIONS,
  type Candidate,
  type Edition,
} from '../data/editions'
import {
  useEditionFromApi,
  useEmissionEditionsCatalog,
  useResolvedEmission,
} from '../hooks/use-emission-queries'
import { formatEditionStage, formatFcfa } from '../lib/edition-presentation'
import { prefetchEditionById } from '../lib/prefetch-emission-data'
import { buildVotePageHref, persistVoteEditionId } from '../lib/vote-navigation'
import { CandidatureModal } from './CandidatureModal'
import { EditionVideoPlayer } from './EditionVideoPlayer'
import { HeroVideo } from './HeroVideo'
import './HeroVideo.css'
import { PromoBanner } from './PromoBanner'
import { SectionBridge } from './SectionBridge'
import './ConcoursPage.css'
import './EditionPage.css'

function parseEditionIdFromPath(
  catalog: { editionId: string; year: number; status?: string }[],
): string | null {
  const yearMatch = window.location.pathname.match(/^\/edition\/(\d{4})\/?$/)
  if (yearMatch) {
    const year = Number(yearMatch[1])
    return catalog.find((c) => c.year === year)?.editionId ?? null
  }
  if (window.location.pathname === '/edition' || window.location.pathname === '/edition/') {
    const current = catalog.find((c) => c.status === 'current') ?? catalog[0]
    return current?.editionId ?? null
  }
  return null
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
  isMine,
  isPastEdition,
  onPlayVideo,
  onVote,
}: {
  candidate: Candidate
  rank: number
  isWinner: boolean
  isMine?: boolean
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

      {isMine && (
        <span className="edition-page__candidate-winner-tag">Ma candidature</span>
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
          {candidate.votes} votes · {candidate.points} points
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

type EditionInfoModalKind = 'lots' | 'reglement' | 'principes' | 'participantes'

function EditionInfoModal({
  kind,
  edition,
  isPast,
  onClose,
}: {
  kind: EditionInfoModalKind
  edition: Edition
  isPast: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const titleByKind: Record<EditionInfoModalKind, string> = {
    lots: 'Lots',
    reglement: 'Reglement du jeu',
    principes: 'Principes du jeu',
    participantes: isPast ? 'Participantes de l’edition' : 'Participantes en lice',
  }

  return (
    <div className="edition-page__modal" role="presentation" onClick={onClose}>
      <dialog
        className="edition-page__modal-dialog"
        open
        aria-labelledby="edition-info-modal-title"
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

        <div className="edition-page__modal-content">
          <h2 id="edition-info-modal-title">{titleByKind[kind]}</h2>

          {kind === 'lots' && (
            <div className="edition-page__modal-list">
              {edition.prizes.map((prize) => (
                <article key={prize.title} className="edition-page__modal-item">
                  <h3>{prize.title}</h3>
                  <p>{prize.description || '—'}</p>
                </article>
              ))}
            </div>
          )}

          {kind === 'reglement' && (
            <ul className="edition-page__modal-bullets">
              {edition.rulesSummary.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          )}

          {kind === 'principes' && (
            <p className="edition-page__modal-text">
              {edition.theme || 'Les principes seront communiques prochainement.'}
            </p>
          )}

          {kind === 'participantes' && (
            <div className="edition-page__modal-list">
              {edition.candidates.map((candidate) => (
                <article key={candidate.id} className="edition-page__modal-item">
                  <h3>{candidate.name}</h3>
                  <p>
                    {candidate.tradition} · {candidate.region}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}


export function EditionPage() {
  const queryClient = useQueryClient()
  const resolvedEmission = useResolvedEmission()
  const catalogQuery = useEmissionEditionsCatalog(
    USE_MOCK_DATA ? null : (resolvedEmission.emission?.id ?? null),
  )
  const pointsPerVote = resolvedEmission.pointsPerVote

  const catalog = USE_MOCK_DATA
    ? EDITIONS.map((e) => ({
        year: e.year,
        editionId: String(e.year),
        status: e.status,
        title: e.title,
        imageUrl: e.coverImageSrc,
      }))
    : (catalogQuery.data ?? [])

  const defaultTab = catalog.find((c) => c.status === 'current') ?? catalog[0]
  const initialEditionId = parseEditionIdFromPath(catalog) ?? defaultTab?.editionId ?? null

  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(initialEditionId)
  const [videoCandidate, setVideoCandidate] = useState<Candidate | null>(null)
  const [infoModal, setInfoModal] = useState<EditionInfoModalKind | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [candidatureOpen, setCandidatureOpen] = useState(false)

  const selectedTab =
    catalog.find((c) => c.editionId === selectedEditionId) ?? defaultTab ?? catalog[0]
  const selectedYear = selectedTab?.year ?? CURRENT_EDITION_YEAR

  const apiEditionId = USE_MOCK_DATA ? null : (selectedTab?.editionId ?? null)

  const {
    edition: apiEdition,
    editionDetail,
    myCandidateId,
    isLoading: editionLoading,
    isError: editionError,
  } = useEditionFromApi(apiEditionId, pointsPerVote)

  const edition = useMemo(() => {
    if (USE_MOCK_DATA) {
      return EDITIONS.find((e) => e.year === selectedYear) ?? EDITIONS[0]
    }
    return apiEdition
  }, [selectedYear, apiEdition])

  useEffect(() => {
    if (USE_MOCK_DATA || catalog.length === 0) return
    const fromPath = parseEditionIdFromPath(catalog)
    if (fromPath && fromPath !== selectedEditionId) {
      setSelectedEditionId(fromPath)
      return
    }
    if (!catalog.some((c) => c.editionId === selectedEditionId) && defaultTab) {
      setSelectedEditionId(defaultTab.editionId)
    }
  }, [catalog, defaultTab, selectedEditionId])

  const regions = useMemo(
    () => [...new Set((edition?.candidates ?? []).map((c) => c.region))].sort(),
    [edition],
  )

  const filteredCandidates = useMemo(() => {
    const list = edition?.candidates ?? []
    if (regionFilter === 'all') return list
    return list.filter((c) => c.region === regionFilter)
  }, [edition, regionFilter])

  const rankedCandidates = useMemo(
    () => [...filteredCandidates].sort((a, b) => b.points - a.points),
    [filteredCandidates],
  )

  const handleVote = (candidate: Candidate) => {
    if (!selectedEditionId) {
      window.location.href = `/vote/${candidate.id}`
      return
    }
    persistVoteEditionId(candidate.id, selectedEditionId)
    window.location.href = buildVotePageHref(candidate.id, selectedEditionId)
  }

  const selectEdition = (editionId: string, year: number) => {
    setSelectedEditionId(editionId)
    setRegionFilter('all')
    setVideoCandidate(null)
    void prefetchEditionById(queryClient, editionId)
    const canonical = catalog.find((c) => c.status === 'current') ?? catalog[0]
    const path =
      canonical && editionId === canonical.editionId ? '/edition' : `/edition/${year}`
    window.history.replaceState(null, '', path)
  }

  const isPast = edition?.status === 'past'

  /** imageUrl de l'édition sélectionnée uniquement */
  const editionImageUrl = useMemo(() => {
    if (!selectedTab?.editionId) return ''
    const fromDetail = edition?.coverImageSrc?.trim()
    const fromCatalog = selectedTab.imageUrl?.trim()
    const fromEmissionList = resolvedEmission.emission?.editions
      .find((e) => e.id === selectedTab.editionId)
      ?.imageUrl?.trim()
    return fromDetail || fromCatalog || fromEmissionList || ''
  }, [
    edition?.coverImageSrc,
    resolvedEmission.emission?.editions,
    selectedTab?.editionId,
    selectedTab?.imageUrl,
  ])

  /** Description de la dernière émission résolue */
  const emissionDescription =
    resolvedEmission.emissionDescription ||
    (USE_MOCK_DATA
      ? 'Le grand rendez-vous des ambassadrices de la culture et du style ivoirien.'
      : '')

  const presentation = useMemo(() => {
    const image =
      editionDetail?.imageUrl?.trim() ||
      editionImageUrl ||
      edition?.coverImageSrc?.trim() ||
      ''

    if (editionDetail) {
      const description =
        editionDetail.description?.trim() ||
        editionDetail.principles?.trim() ||
        edition?.description ||
        ''
      const principles =
        editionDetail.principles?.trim() &&
        editionDetail.description?.trim() &&
        editionDetail.principles.trim() !== editionDetail.description.trim()
          ? editionDetail.principles.trim()
          : ''

      return {
        eyebrow: editionDetail.emissionName,
        title: editionDetail.title,
        description,
        principles,
        imageUrl: image,
        editionVideo: editionDetail.video?.url?.trim() ? editionDetail.video : null,
        stage: formatEditionStage(editionDetail.currentStage),
        dates: edition?.dates ?? 'Dates a confirmer',
        candidateCount: edition?.candidateCount ?? editionDetail.candidates.length,
        candidaturePrice: editionDetail.isPaidEdition
          ? formatFcfa(editionDetail.candidaturePrice)
          : null,
        quizPrice:
          editionDetail.quizEnabled && editionDetail.quizPrice != null
            ? formatFcfa(editionDetail.quizPrice)
            : null,
        voteAmountPerVote:
          editionDetail.voteAmountPerVote != null && editionDetail.voteAmountPerVote > 0
            ? formatFcfa(editionDetail.voteAmountPerVote)
            : null,
        statusLabel: isPast ? 'Edition terminee' : 'Edition en cours',
      }
    }

    return {
      eyebrow: resolvedEmission.emission?.title ?? 'Miss Tradi Culture',
      title: edition?.title ?? '',
      description: edition?.description || emissionDescription,
      principles: edition?.theme ?? '',
      imageUrl: image,
      editionVideo: null,
      stage: isPast ? 'Edition terminee' : 'Edition en cours',
      dates: edition?.dates ?? 'Dates a confirmer',
      candidateCount: edition?.candidateCount ?? 0,
      candidaturePrice: null as string | null,
      quizPrice: null as string | null,
      voteAmountPerVote: null as string | null,
      statusLabel: isPast ? 'Edition terminee' : 'Edition en cours',
    }
  }, [
    edition,
    editionDetail,
    editionImageUrl,
    emissionDescription,
    isPast,
    resolvedEmission.emission?.title,
  ])

  if (
    !USE_MOCK_DATA &&
    (resolvedEmission.isLoading || catalogQuery.isLoading || editionLoading)
  ) {
    return (
      <main className="concours-page edition-page edition-page--loading">
        <div className="edition-page__shell">
          <p>Chargement des editions…</p>
        </div>
      </main>
    )
  }

  if (!USE_MOCK_DATA && (resolvedEmission.isError || !resolvedEmission.emission)) {
    return (
      <main className="concours-page edition-page edition-page--error">
        <div className="edition-page__shell">
          <h1>Emission indisponible</h1>
          <p>Impossible de charger l&apos;emission. Reessayez plus tard.</p>
          <a href="/">Retour a l&apos;accueil</a>
        </div>
      </main>
    )
  }

  if (!edition) {
    return (
      <main className="concours-page edition-page edition-page--error">
        <div className="edition-page__shell">
          <h1>Edition indisponible</h1>
          <p>
            {editionError || catalogQuery.isError
              ? 'Impossible de charger les donnees. Reessayez plus tard.'
              : catalog.length === 0
                ? 'Aucune edition publiee pour cette emission.'
                : 'Aucune edition trouvee.'}
          </p>
          <a href="/">Retour a l&apos;accueil</a>
        </div>
      </main>
    )
  }

  const yearTabs = catalog

  return (
    <main className="concours-page edition-page" aria-labelledby="edition-title">
      <CandidatureModal
        open={candidatureOpen}
        onClose={() => setCandidatureOpen(false)}
        editionId={selectedTab?.editionId ?? null}
        editionTitle={selectedTab?.title ?? edition.title}
        emissionTitle={resolvedEmission.emission?.title}
      />
      {videoCandidate && (
        <CandidateVideoModal
          candidate={videoCandidate}
          onClose={() => setVideoCandidate(null)}
        />
      )}
      {infoModal && (
        <EditionInfoModal
          kind={infoModal}
          edition={edition}
          isPast={isPast}
          onClose={() => setInfoModal(null)}
        />
      )}

      {presentation.editionVideo ? (
        <section
          className="edition-page__edition-hero"
          aria-label="Video de l'edition"
        >
          <EditionVideoPlayer
            key={presentation.editionVideo.id ?? presentation.editionVideo.url}
            video={presentation.editionVideo}
            poster={presentation.imageUrl}
            variant="hero"
          />
          <div className="site-hero-video__overlay">
            <p className="site-hero-video__subtitle">
              {resolvedEmission.emission?.title ?? presentation.eyebrow ?? 'Miss Tradi Culture'}
            </p>
            <h1 className="site-hero-video__title">{`Edition ${edition.year}`}</h1>
          </div>
        </section>
      ) : (
        <HeroVideo
          key={`${edition.year}-${presentation.imageUrl}`}
          imageSrc={
            presentation.imageUrl ||
            edition.coverImageSrc ||
            edition.videoPosterSrc ||
            undefined
          }
          imageAlt={`Visuel edition ${edition.year}`}
          subtitle={resolvedEmission.emission?.title ?? presentation.eyebrow ?? 'Miss Tradi Culture'}
          title={`Edition ${edition.year}`}
        />
      )}

      <PromoBanner />
      <SectionBridge variant="ribbon" />

      <section id="edition" className="concours-page__stack">
        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner">
            <p className="concours-page__eyebrow">
              {resolvedEmission.emission?.title ?? 'Edition'}
            </p>
            <h1 id="edition-title">{edition.title}</h1>
            <p className="concours-page__lead">{edition.tagline}</p>

            <div className="edition-page__year-tabs" role="tablist" aria-label="Choisir une edition">
              {yearTabs.map((e) => (
                <button
                  key={e.editionId}
                  type="button"
                  role="tab"
                  aria-selected={e.editionId === selectedTab?.editionId}
                  className={`edition-page__year-tab${e.editionId === selectedTab?.editionId ? ' edition-page__year-tab--active' : ''}${e.status === 'current' ? ' edition-page__year-tab--current' : ''}`}
                  onClick={() => selectEdition(e.editionId, e.year)}
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

        <section key={`presentation-${selectedYear}`} className="concours-page__section edition-page__presentation-section">
          <div className="edition-page__presentation">
            <div className="edition-page__presentation-grid">
              <div className="edition-page__presentation-content">
                <p className="edition-page__presentation-eyebrow">{presentation.eyebrow}</p>
                <h2 className="edition-page__presentation-title">{presentation.title}</h2>
                <p className="edition-page__presentation-vote-line">
                  {presentation.voteAmountPerVote
                    ? `Chaque vote compte — ${presentation.voteAmountPerVote} par vote.`
                    : 'Chaque vote compte.'}
                </p>
                {presentation.description && <p className="edition-page__presentation-lead">{presentation.description}</p>}
                {presentation.principles && (
                  <p id="edition-principes" className="edition-page__presentation-sub">
                    {presentation.principles}
                  </p>
                )}
                <ul className="edition-page__presentation-list" aria-label="Informations edition">
                  <li>
                    <span>Dates</span>
                    <strong>{presentation.dates}</strong>
                  </li>
                  <li>
                    <span>Candidates</span>
                    <strong>{presentation.candidateCount}</strong>
                  </li>
                  <li>
                    <span>Statut</span>
                    <strong>{presentation.statusLabel}</strong>
                  </li>
                  <li>
                    <span>Inscription</span>
                    <strong>{presentation.candidaturePrice ?? 'Tarif a confirmer'}</strong>
                  </li>
                  {presentation.quizPrice && (
                    <li>
                      <span>Quiz</span>
                      <strong>{presentation.quizPrice}</strong>
                    </li>
                  )}
                  {presentation.voteAmountPerVote && (
                    <li>
                      <span>Vote</span>
                      <strong>{presentation.voteAmountPerVote}</strong>
                    </li>
                  )}
                </ul>
                <p className="edition-page__presentation-status">
                  {presentation.stage ?? presentation.statusLabel} — completez le formulaire pour postuler.
                </p>

                <div className="edition-page__presentation-sponsors-inline" aria-label="Sponsors">
                  {edition.sponsors.map((sponsor) => (
                    <img
                      key={`${sponsor.name}-${sponsor.logoSrc}`}
                      src={sponsor.logoSrc}
                      alt={sponsor.name}
                      loading="lazy"
                    />
                  ))}
                </div>

                <nav className="edition-page__presentation-links" aria-label="Acces rapides edition">
                  <button type="button" onClick={() => setInfoModal('lots')}>Lots</button>
                  <button type="button" onClick={() => setInfoModal('reglement')}>Reglement du jeu</button>
                  <button type="button" onClick={() => setInfoModal('principes')}>Principes du jeu</button>
                </nav>
              </div>

              <article className="edition-page__presentation-image-card" aria-label="Photo de l'edition">
                {presentation.imageUrl ? (
                  <img
                    src={presentation.imageUrl}
                    alt={`Photo ${presentation.title}`}
                    loading="lazy"
                    className="edition-page__presentation-image"
                  />
                ) : (
                  <div
                    className="edition-page__presentation-visual-placeholder"
                    role="img"
                    aria-label={`Photo ${presentation.title}`}
                  />
                )}
              </article>
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
                  isMine={myCandidateId === candidate.id}
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

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Autres editions</h2>
            <p className="edition-page__section-intro">
              Parcourez les editions precedentes du concours Miss Tradi Culture.
            </p>
            <div className="edition-page__history">
              {catalog
                .filter((tab) => tab.editionId !== selectedTab?.editionId)
                .map((tab) => {
                  const mockEdition = USE_MOCK_DATA
                    ? EDITIONS.find((e) => e.year === tab.year)
                    : null
                  const nestedCover = resolvedEmission.emission?.editions.find(
                    (e) => e.id === tab.editionId,
                  )?.imageUrl
                  return (
                    <article key={tab.editionId} className="edition-page__history-card">
                      <img
                        src={mockEdition?.coverImageSrc ?? nestedCover ?? '/miss.jpg'}
                        alt=""
                        loading="lazy"
                      />
                      <div>
                        <h3>{mockEdition?.title ?? tab.title}</h3>
                        <p>{mockEdition?.theme ?? tab.title}</p>
                        {mockEdition && (
                          <ul>
                            {mockEdition.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        )}
                        <button
                          type="button"
                          className="edition-page__history-btn"
                          onClick={() => selectEdition(tab.editionId, tab.year)}
                        >
                          Voir l&apos;edition {tab.year}
                        </button>
                      </div>
                    </article>
                  )
                })}
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
                  <button
                    type="button"
                    className="concours-page__btn-primary edition-page__cta"
                    onClick={() => setCandidatureOpen(true)}
                  >
                    Deposer ma candidature
                  </button>
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
