import { useQuery } from '@tanstack/react-query'
import { DEFAULT_VOTE_UNIT_PRICE, USE_MOCK_DATA } from '../config/app-config'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import { emissionRequest } from '../lib/emission-request'
import {
  mapEditionFullDetailToEdition,
  mapEditionListItemToTab,
  findCandidateInEditionDetail,
  mergeCandidateWithEditionDetail,
  type EditionCatalogTab,
} from '../lib/map-emission'
import { resolveConfiguredEmissionId } from '../lib/resolve-latest-emission'

const EDITION_LIST_PARAMS = { page: 1, limit: 50 } as const
const RANKING_PARAMS = { page: 1, limit: 100 } as const
const EMISSION_LIST_PARAMS = { page: 1, limit: 50, isPublic: true } as const
const EMISSION_STALE_MS = 5 * 60_000

function shouldRetryEmission(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && error.status === 429) return false
  return failureCount < 1
}

export const emissionQueryKeys = {
  emissionsList: ['emission', 'list', 'public'] as const,
  emission: (id: string) => ['emission', id] as const,
  editions: (id: string) => ['emission', id, 'editions'] as const,
  editionDetail: (editionId: string) => ['edition', editionId] as const,
  editionRanking: (editionId: string) => ['edition', editionId, 'ranking'] as const,
  candidate: (candidateId: string) => ['candidate', candidateId] as const,
}

/** Dernière émission publique (ou VITE_EMISSION_ID si défini). */
export function useResolvedEmission() {
  const listQuery = useQuery({
    queryKey: emissionQueryKeys.emissionsList,
    queryFn: () => emissionRequest.list(EMISSION_LIST_PARAMS),
    enabled: !USE_MOCK_DATA,
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const selected = listQuery.data?.data
    ? resolveConfiguredEmissionId(listQuery.data.data)
    : null

  const detailQuery = useQuery({
    queryKey: selected ? emissionQueryKeys.emission(selected.id) : ['emission', 'none'],
    queryFn: () => emissionRequest.getById(selected!.id),
    enabled: !USE_MOCK_DATA && Boolean(selected?.id),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const pointsPerVote =
    detailQuery.data?.data.pointsPerVote ??
    selected?.pointsPerVote ??
    DEFAULT_VOTE_UNIT_PRICE

  const emissionDescription =
    detailQuery.data?.data.description?.trim() ||
    selected?.description?.trim() ||
    ''

  return {
    emission: selected,
    emissionDescription,
    pointsPerVote,
    isLoading: listQuery.isLoading || (Boolean(selected) && detailQuery.isLoading),
    isError: listQuery.isError || detailQuery.isError,
    error: listQuery.error ?? detailQuery.error,
  }
}

export function useEmissionEditionsCatalog(emissionId: string | null) {
  return useQuery({
    queryKey: emissionId ? emissionQueryKeys.editions(emissionId) : ['emission', 'editions', 'none'],
    queryFn: async (): Promise<EditionCatalogTab[]> => {
      const res = await emissionRequest.listEditions(emissionId as string, EDITION_LIST_PARAMS)
      return res.data.map(mapEditionListItemToTab).sort((a, b) => b.year - a.year)
    },
    enabled: !USE_MOCK_DATA && Boolean(emissionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })
}

export function useEditionFromApi(editionId: string | null, pointsPerVote: number) {
  const detailQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionDetail(editionId) : ['edition', 'none'],
    queryFn: () => emissionRequest.getEditionById(editionId as string),
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const rankingQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionRanking(editionId) : ['edition', 'ranking', 'none'],
    queryFn: () => emissionRequest.getEditionRanking(editionId as string, RANKING_PARAMS),
    enabled: !USE_MOCK_DATA && Boolean(editionId) && Boolean(detailQuery.data?.data),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const isLoading = detailQuery.isLoading
  const isError = detailQuery.isError
  const error = detailQuery.error

  const edition =
    detailQuery.data?.data && editionId
      ? mapEditionFullDetailToEdition(
          detailQuery.data.data,
          rankingQuery.data?.data ?? [],
          pointsPerVote,
        )
      : null

  return {
    edition,
    editionDetail: detailQuery.data?.data ?? null,
    isLoading,
    isError,
    isRankingLoading: rankingQuery.isLoading,
    error,
    refetch: detailQuery.refetch,
  }
}

export function useCandidateFromApi(candidateId: string | null, pointsPerVote: number) {
  const candidateQuery = useQuery({
    queryKey: candidateId ? emissionQueryKeys.candidate(candidateId) : ['candidate', 'none'],
    queryFn: () => emissionRequest.getCandidateById(candidateId as string),
    enabled: !USE_MOCK_DATA && Boolean(candidateId),
    staleTime: 30_000,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const editionId = candidateQuery.data?.data.editionId ?? null

  const editionDetailQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionDetail(editionId) : ['edition', 'none'],
    queryFn: () => emissionRequest.getEditionById(editionId as string),
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: 30_000,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const rankingQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionRanking(editionId) : ['edition', 'ranking', 'none'],
    queryFn: () => emissionRequest.getEditionRanking(editionId as string, RANKING_PARAMS),
    enabled: !USE_MOCK_DATA && Boolean(editionId) && Boolean(editionDetailQuery.data?.data),
    staleTime: 30_000,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const editionDetail = editionDetailQuery.data?.data ?? null
  const fullFromEdition =
    editionDetail && candidateId ? findCandidateInEditionDetail(editionDetail, candidateId) : null
  const candidateSummary = candidateQuery.data?.data ?? null
  const mergedCandidate = mergeCandidateWithEditionDetail(candidateSummary, fullFromEdition)
  const rank = rankingQuery.data?.data.find((row) => row.id === candidateId)?.rank ?? 0

  return {
    candidateDto: mergedCandidate,
    editionMeta: candidateSummary?.edition ?? editionDetail ?? null,
    rank: rank > 0 ? rank : 0,
    isLoading: candidateQuery.isLoading || editionDetailQuery.isLoading,
    isError: candidateQuery.isError && !mergedCandidate,
    error: candidateQuery.error ?? editionDetailQuery.error,
    pointsPerVote,
  }
}
