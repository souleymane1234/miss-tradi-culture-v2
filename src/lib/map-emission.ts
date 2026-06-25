import type {
  EditionCandidateDto,
  EditionFullDetailDto,
  EditionRankingCandidateDto,
  EditionRankingEditionMetaDto,
  EmissionCandidateDetailDto,
  EmissionEditionListItemDto,
} from './api/modules/emission/emission.types'
import type { Candidate, Edition, EditionPrize, EditionSponsor } from '../data/editions'

export function editionYearFromIsoDate(iso: string | null | undefined): number {
  if (!iso?.trim()) return new Date().getFullYear()
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear()
}

export function editionYearFromListItem(item: {
  startDate?: string | null
  createdAt?: string | null
  title: string
}): number {
  if (item.startDate?.trim()) return editionYearFromIsoDate(item.startDate)
  if (item.createdAt?.trim()) return editionYearFromIsoDate(item.createdAt)
  const fromTitle = item.title.match(/\b(20\d{2})\b/)
  if (fromTitle) return Number(fromTitle[1])
  return new Date().getFullYear()
}

function isOpenEditionStatus(status: string): boolean {
  return status === 'OUVERTE' || status === 'EN_COURS'
}

export function isEditionListItemPast(item: {
  status: string
  endDate?: string | null
  isActive: boolean
}): boolean {
  if (item.status === 'CLOTUREE' || item.status === 'TERMINEE') return true
  if (isOpenEditionStatus(item.status)) return false
  if (item.endDate?.trim()) {
    const end = new Date(item.endDate)
    if (!Number.isNaN(end.getTime()) && end < new Date()) return true
  }
  return !item.isActive
}

export function formatEditionDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Dates a confirmer'
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', day: undefined })
  return `${fmt(start)} — ${fmt(end)}`
}

type CandidateLike = Pick<
  EditionCandidateDto,
  | 'user'
  | 'candidateName'
  | 'candidatePreName'
  | 'age'
  | 'countryName'
  | 'residenceCountry'
  | 'category'
  | 'tag'
>

function candidateUserAge(
  c: Pick<EditionCandidateDto, 'age' | 'user'>,
): number {
  if (typeof c.age === 'number' && c.age > 0) return Math.floor(c.age)
  const user = c.user
  if (typeof user.age === 'number' && user.age > 0) return Math.floor(user.age)
  if (!user.dateOfBirth) return 0
  const birth = new Date(user.dateOfBirth)
  if (Number.isNaN(birth.getTime())) return 0
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years -= 1
  return Math.max(0, years)
}

function candidateDisplayName(c: CandidateLike): string {
  const fromFields = [c.candidatePreName, c.candidateName].filter(Boolean).join(' ').trim()
  if (fromFields) return fromFields
  const fromUser = [c.user.firstName, c.user.lastName].filter(Boolean).join(' ').trim()
  return fromUser || c.user.pseudo
}

function candidateUsername(c: CandidateLike): string {
  return c.user.pseudo?.trim() || candidateDisplayName(c)
}

function candidateOriginCountry(c: CandidateLike): string {
  return c.countryName?.trim() || '—'
}

function candidateResidenceCountry(c: CandidateLike): string {
  return c.residenceCountry?.trim() || c.countryName?.trim() || '—'
}

function candidateTraditionLabel(c: CandidateLike): string {
  return c.tag?.name ?? c.category?.name ?? 'Tradition'
}

function candidateCategoryName(c: CandidateLike): string {
  return c.category?.name ?? '—'
}

function candidateTagName(c: CandidateLike): string {
  return c.tag?.name ?? '—'
}

type CandidatePointsLike = Pick<
  EditionCandidateDto,
  'totalVotes' | 'finalistVotes' | 'isFinalist' | 'quizPoints' | 'totalPoints'
>

/** Points totaux : priorité à totalPoints API, sinon votes × pointsPerVote + quizPoints. */
export function resolveCandidateTotalPoints(
  c: CandidatePointsLike,
  pointsPerVote: number,
): number {
  if (typeof c.totalPoints === 'number' && Number.isFinite(c.totalPoints)) {
    return c.totalPoints
  }
  const votes = c.isFinalist ? c.finalistVotes : c.totalVotes
  return votes * pointsPerVote + (c.quizPoints ?? 0)
}

function compareCandidatesByRanking(
  a: EditionCandidateDto,
  b: EditionCandidateDto,
  pointsPerVote: number,
): number {
  const pointsA = resolveCandidateTotalPoints(a, pointsPerVote)
  const pointsB = resolveCandidateTotalPoints(b, pointsPerVote)
  if (pointsB !== pointsA) return pointsB - pointsA
  const votesA = a.isFinalist ? a.finalistVotes : a.totalVotes
  const votesB = b.isFinalist ? b.finalistVotes : b.totalVotes
  if (votesB !== votesA) return votesB - votesA
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

/** Tous les candidats VALIDE d'une édition (candidates + finalists, dédoublonnés). */
export function collectEditionCandidates(detail: EditionFullDetailDto): EditionCandidateDto[] {
  const byId = new Map<string, EditionCandidateDto>()
  for (const c of [...detail.candidates, ...detail.finalists]) {
    if (c.status === 'VALIDE' || c.status === 'ACCEPTE') {
      byId.set(c.id, c)
    }
  }
  return [...byId.values()]
}

export function findCandidateInEditionDetail(
  detail: EditionFullDetailDto,
  candidateId: string,
): EditionCandidateDto | null {
  return collectEditionCandidates(detail).find((c) => c.id === candidateId) ?? null
}

function isEditionPast(endDate: string, isActive: boolean): boolean {
  const end = new Date(endDate)
  if (!Number.isNaN(end.getTime()) && end < new Date()) return true
  return !isActive
}

function mapSponsors(sponsors: EditionFullDetailDto['sponsors']): EditionSponsor[] {
  const tiers: EditionSponsor['tier'][] = ['principal', 'or', 'argent', 'bronze']
  return (sponsors ?? []).map((s, index) => ({
    name: s.name,
    logoSrc: s.logoUrl || '/trustCaroussel/port-9.png',
    tier: tiers[index] ?? 'bronze',
  }))
}

function mapPrizes(lots: EditionFullDetailDto['lots']): EditionPrize[] {
  return (lots ?? []).map((lot) => ({
    title: lot.title,
    description: lot.description,
  }))
}

function mapRulesSummary(gameRules: string | null | undefined, principles: string | null | undefined): string[] {
  const chunks = [gameRules, principles]
    .filter((s): s is string => Boolean(s?.trim()))
    .flatMap((s) => s.split(/\n+/).map((line) => line.trim()).filter(Boolean))
  return chunks.length > 0 ? chunks : ['Reglement disponible sur demande.']
}

export function mapEditionCandidateToCandidate(
  c: EditionCandidateDto,
  _rank: number,
  pointsPerVote: number,
): Candidate {
  const votes = c.isFinalist ? c.finalistVotes : c.totalVotes
  const quizPoints = c.quizPoints ?? 0
  return {
    id: c.id,
    name: candidateDisplayName(c),
    username: candidateUsername(c),
    age: candidateUserAge(c),
    region: candidateOriginCountry(c),
    city: candidateResidenceCountry(c),
    photoSrc: c.candidatePicture,
    bio: c.description,
    tradition: candidateTraditionLabel(c),
    votes,
    points: resolveCandidateTotalPoints(c, pointsPerVote),
    quizPoints,
    mentorName: candidateCategoryName(c),
    mentorSubtitle: candidateTagName(c),
    videoSrc: c.video?.url ?? undefined,
  }
}

/** Liste ordonnée depuis GET /emission/editions/:id/candidates (déjà triée par totalPoints). */
export function buildEditionCandidatesFromList(
  candidates: EditionCandidateDto[],
  pointsPerVote: number,
): Candidate[] {
  return candidates.map((c, index) =>
    mapEditionCandidateToCandidate(c, index + 1, pointsPerVote),
  )
}

export function mapRankingCandidateToCandidate(
  c: EditionRankingCandidateDto,
  rank: number,
  pointsPerVote: number,
): Candidate {
  return mapEditionCandidateToCandidate(c, rank, pointsPerVote)
}

/** Fusionne le détail édition (données complètes) et le classement (rangs officiels). */
export function buildEditionCandidates(
  detail: EditionFullDetailDto,
  ranking: EditionRankingCandidateDto[],
  pointsPerVote: number,
): Candidate[] {
  const detailById = new Map(collectEditionCandidates(detail).map((c) => [c.id, c]))

  if (ranking.length > 0) {
    return [...ranking]
      .sort((a, b) => a.rank - b.rank)
      .map((row) => {
        const full = detailById.get(row.id)
        const merged = full ? { ...row, ...full, rank: row.rank } : row
        return mapEditionCandidateToCandidate(merged, row.rank, pointsPerVote)
      })
  }

  return collectEditionCandidates(detail)
    .sort((a, b) => compareCandidatesByRanking(a, b, pointsPerVote))
    .map((c, index) => mapEditionCandidateToCandidate(c, index + 1, pointsPerVote))
}

export type EditionCatalogTab = {
  year: number
  editionId: string
  status: Edition['status']
  title: string
  imageUrl: string | null
}

export function mapEditionListItemToTab(item: EmissionEditionListItemDto): EditionCatalogTab {
  const past = isEditionListItemPast(item)
  return {
    year: editionYearFromListItem(item),
    editionId: item.id,
    status: past ? 'past' : 'current',
    title: item.title,
    imageUrl: item.imageUrl?.trim() || null,
  }
}

export function mapEditionFullDetailToEdition(
  detail: EditionFullDetailDto,
  ranking: EditionRankingCandidateDto[],
  pointsPerVote: number,
  candidatesList?: EditionCandidateDto[],
): Edition {
  const year = editionYearFromIsoDate(detail.startDate)
  const past = isEditionPast(detail.endDate, detail.isActive)
  const candidates =
    candidatesList && candidatesList.length > 0
      ? buildEditionCandidatesFromList(candidatesList, pointsPerVote)
      : buildEditionCandidates(detail, ranking, pointsPerVote)

  const winner = candidates.find((c) =>
    detail.finalists.some((f) => f.id === c.id && f.isFinalist),
  )

  const descriptionText =
    detail.description?.trim() ||
    detail.principles?.trim() ||
    detail.gameRules?.trim() ||
    ''

  return {
    year,
    status: past ? 'past' : 'current',
    title: detail.title,
    theme: detail.principles?.trim() || descriptionText.slice(0, 80) || detail.title,
    tagline: descriptionText || detail.title,
    description: descriptionText,
    coverImageSrc: detail.imageUrl?.trim() || '',
    videoSrc: detail.video?.url ?? '/videomiss.mp4',
    videoPosterSrc: detail.imageUrl?.trim() || '/miss.jpg',
    dates:
      detail.startDate?.trim() && detail.endDate?.trim()
        ? formatEditionDateRange(detail.startDate, detail.endDate)
        : 'Dates a confirmer',
    location: detail.emissionName,
    candidateCount: candidates.length,
    candidates,
    winnerId: winner?.id,
    prizes: mapPrizes(detail.lots),
    rulesSummary: mapRulesSummary(detail.gameRules, detail.principles),
    rulesDocumentHref: '#contact',
    sponsors: mapSponsors(detail.sponsors),
    highlights: [
      `${candidates.length} candidates`,
      detail.currentStage ? `Phase : ${detail.currentStage}` : 'Edition en cours',
      past ? 'Edition terminee' : 'Vote en ligne ouvert',
    ],
  }
}

export type VoteEditionView = Pick<
  Edition,
  'year' | 'title' | 'theme' | 'tagline' | 'dates' | 'location'
>

export function mapEditionMetaForVotePage(edition: EditionRankingEditionMetaDto): VoteEditionView {
  return {
    year: editionYearFromIsoDate(edition.startDate),
    title: edition.title,
    theme: edition.principles?.trim() || edition.title,
    tagline: edition.principles?.trim() || edition.title,
    dates: formatEditionDateRange(edition.startDate, edition.endDate),
    location: edition.title,
  }
}

export function mapEditionDetailForVotePage(detail: EditionFullDetailDto): VoteEditionView {
  const description =
    detail.description?.trim() ||
    detail.principles?.trim() ||
    detail.gameRules?.trim() ||
    detail.title

  return {
    year: editionYearFromIsoDate(detail.startDate),
    title: detail.title,
    theme: detail.principles?.trim() || description,
    tagline: description,
    dates:
      detail.startDate?.trim() && detail.endDate?.trim()
        ? formatEditionDateRange(detail.startDate, detail.endDate)
        : 'Dates a confirmer',
    location: detail.emissionName?.trim() || detail.title,
  }
}

export function findCandidateRankInEdition(
  detail: EditionFullDetailDto,
  candidateId: string,
  pointsPerVote: number,
  candidatesList?: EditionCandidateDto[],
): number {
  if (candidatesList && candidatesList.length > 0) {
    const index = candidatesList.findIndex((c) => c.id === candidateId)
    return index >= 0 ? index + 1 : 0
  }

  const candidates = buildEditionCandidates(detail, [], pointsPerVote)
  const index = candidates.findIndex((candidate) => candidate.id === candidateId)
  return index >= 0 ? index + 1 : 0
}

export function findCandidateInEditionList(
  candidates: EditionCandidateDto[],
  candidateId: string,
): EditionCandidateDto | null {
  return candidates.find((c) => c.id === candidateId) ?? null
}

export function mapCandidateDetailToCandidate(
  d: EmissionCandidateDetailDto,
  rank: number,
  pointsPerVote: number,
): Candidate {
  return mapEditionCandidateToCandidate(
    {
      id: d.id,
      editionId: d.editionId,
      video: d.video,
      candidatePicture: d.candidatePicture,
      description: d.description,
      candidateName: d.candidateName,
      candidatePreName: d.candidatePreName,
      documentUrls: d.documentUrls,
      countryId: d.countryId,
      countryName: d.countryName,
      residenceCountryId: d.residenceCountryId,
      residenceCountry: d.residenceCountry,
      age: d.age,
      status: d.status,
      isFinalist: d.isFinalist,
      totalVotes: d.totalVotes,
      finalistVotes: d.finalistVotes ?? 0,
      quizPoints: d.quizPoints,
      totalPoints: d.totalPoints,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      user: d.user,
      category: d.category,
      tag: d.tag,
    },
    rank,
    pointsPerVote,
  )
}

/** Fusionne le résumé candidat et la fiche complète issue du détail édition. */
export function mergeCandidateWithEditionDetail(
  summary: EmissionCandidateDetailDto | null | undefined,
  full: EditionCandidateDto | null | undefined,
): EmissionCandidateDetailDto | null {
  if (!summary && !full) return null
  if (!full) return summary ?? null

  const edition =
    summary?.edition ??
    ({
      id: full.editionId,
      title: '',
      status: full.status,
      currentStage: '',
      startDate: full.createdAt,
      endDate: full.updatedAt,
      createdAt: full.createdAt,
      lots: [],
      gameRules: '',
      principles: '',
      sponsors: [],
    } satisfies EditionRankingEditionMetaDto)

  return {
    id: full.id,
    editionId: full.editionId,
    video: full.video,
    candidatePicture: full.candidatePicture,
    description: full.description,
    candidateName: full.candidateName ?? summary?.candidateName,
    candidatePreName: full.candidatePreName ?? summary?.candidatePreName,
    documentUrls: full.documentUrls ?? summary?.documentUrls,
    countryId: full.countryId ?? summary?.countryId,
    countryName: full.countryName ?? summary?.countryName,
    residenceCountryId: full.residenceCountryId ?? summary?.residenceCountryId,
    residenceCountry: full.residenceCountry ?? summary?.residenceCountry,
    age: full.age ?? summary?.age,
    status: full.status,
    isFinalist: full.isFinalist,
    totalVotes: full.totalVotes,
    finalistVotes: full.finalistVotes ?? summary?.finalistVotes,
    quizPoints: full.quizPoints ?? summary?.quizPoints,
    totalPoints: full.totalPoints ?? summary?.totalPoints,
    createdAt: full.createdAt,
    updatedAt: full.updatedAt,
    user: full.user,
    category: full.category ?? summary?.category,
    tag: full.tag ?? summary?.tag,
    edition,
  }
}
