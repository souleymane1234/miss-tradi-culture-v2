import { useQuery } from '@tanstack/react-query'
import { DEFAULT_VOTE_UNIT_PRICE, USE_MOCK_DATA } from '../config/app-config'
import { emissionQueries } from '../lib/emission-query-options'
import {
  findCandidateInEditionDetail,
  findCandidateInEditionList,
  findCandidateRankInEdition,
  mapEditionFullDetailToEdition,
  mergeCandidateWithEditionDetail,
} from '../lib/map-emission'
import { resolveConfiguredEmissionId } from '../lib/resolve-latest-emission'

export { emissionQueryKeys } from '../lib/emission-query-keys'
export { emissionQueries } from '../lib/emission-query-options'

/** Dernière émission publique (ou VITE_EMISSION_ID si défini). */
export function useResolvedEmission() {
  const listQuery = useQuery({
    ...emissionQueries.list(),
    enabled: !USE_MOCK_DATA,
  })

  const selected = listQuery.data?.data
    ? resolveConfiguredEmissionId(listQuery.data.data)
    : null

  const detailQuery = useQuery({
    ...emissionQueries.emission(selected?.id ?? ''),
    enabled: !USE_MOCK_DATA && Boolean(selected?.id),
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
    ...emissionQueries.editionsCatalog(emissionId ?? ''),
    enabled: !USE_MOCK_DATA && Boolean(emissionId),
  })
}

export function useEditionFromApi(editionId: string | null, pointsPerVote: number) {
  const detailQuery = useQuery({
    ...emissionQueries.editionDetail(editionId ?? ''),
    enabled: !USE_MOCK_DATA && Boolean(editionId),
  })

  const candidatesQuery = useQuery({
    ...emissionQueries.editionCandidates(editionId ?? ''),
    enabled: !USE_MOCK_DATA && Boolean(editionId),
  })

  const isLoading = detailQuery.isLoading || candidatesQuery.isLoading
  const isError = detailQuery.isError || candidatesQuery.isError
  const error = detailQuery.error ?? candidatesQuery.error

  const candidatesList = candidatesQuery.data?.data.candidates ?? []
  const myCandidateId = candidatesQuery.data?.data.myCandidateId ?? null

  const edition =
    detailQuery.data?.data && editionId
      ? mapEditionFullDetailToEdition(
          detailQuery.data.data,
          [],
          pointsPerVote,
          candidatesList,
        )
      : null

  return {
    edition,
    editionDetail: detailQuery.data?.data ?? null,
    candidatesList,
    myCandidateId,
    isLoading,
    isError,
    error,
    refetch: async () => {
      await Promise.all([detailQuery.refetch(), candidatesQuery.refetch()])
    },
  }
}

export function useCandidateFromApi(
  candidateId: string | null,
  editionId: string | null,
  pointsPerVote: number,
) {
  const editionDetailQuery = useQuery({
    ...emissionQueries.editionDetail(editionId ?? ''),
    enabled: !USE_MOCK_DATA && Boolean(candidateId) && Boolean(editionId),
  })

  const candidatesQuery = useQuery({
    ...emissionQueries.editionCandidates(editionId ?? ''),
    enabled: !USE_MOCK_DATA && Boolean(candidateId) && Boolean(editionId),
  })

  const editionDetail = editionDetailQuery.data?.data ?? null
  const candidatesList = candidatesQuery.data?.data.candidates ?? []
  const fullFromList =
    candidateId && candidatesList.length > 0
      ? findCandidateInEditionList(candidatesList, candidateId)
      : null
  const fullFromEdition =
    editionDetail && candidateId
      ? findCandidateInEditionDetail(editionDetail, candidateId)
      : null
  const fullFromEditionOrList = fullFromList ?? fullFromEdition
  const mergedCandidate = fullFromEditionOrList
    ? mergeCandidateWithEditionDetail(undefined, fullFromEditionOrList)
    : null

  const rank =
    editionDetail && candidateId
      ? findCandidateRankInEdition(
          editionDetail,
          candidateId,
          pointsPerVote,
          candidatesList.length > 0 ? candidatesList : undefined,
        )
      : 0

  return {
    candidateDto: mergedCandidate,
    editionDetail,
    rank: rank > 0 ? rank : 0,
    isLoading: editionDetailQuery.isLoading || candidatesQuery.isLoading,
    isError:
      (editionDetailQuery.isError || candidatesQuery.isError) && !mergedCandidate,
    error: editionDetailQuery.error ?? candidatesQuery.error,
    missingEditionId: Boolean(candidateId) && !editionId,
    pointsPerVote,
  }
}
