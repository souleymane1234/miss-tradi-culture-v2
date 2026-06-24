import { queryOptions } from '@tanstack/react-query'
import { ApiHttpError } from './api/errors/api-http-error'
import { emissionQueryKeys } from './emission-query-keys'
import { emissionRequest } from './emission-request'
import { mapEditionListItemToTab } from './map-emission'

export const EMISSION_STALE_MS = 5 * 60_000
export const EMISSION_GC_MS = 30 * 60_000

const EDITION_LIST_PARAMS = { page: 1, limit: 50 } as const
const EMISSION_LIST_PARAMS = { page: 1, limit: 50, isPublic: true } as const

function shouldRetryEmission(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && error.status === 429) return false
  return failureCount < 1
}

const sharedEmissionQueryOptions = {
  staleTime: EMISSION_STALE_MS,
  gcTime: EMISSION_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: shouldRetryEmission,
} as const

export const emissionQueries = {
  list: () =>
    queryOptions({
      queryKey: emissionQueryKeys.emissionsList,
      queryFn: () => emissionRequest.list(EMISSION_LIST_PARAMS),
      ...sharedEmissionQueryOptions,
    }),

  emission: (emissionId: string) =>
    queryOptions({
      queryKey: emissionQueryKeys.emission(emissionId),
      queryFn: () => emissionRequest.getById(emissionId),
      ...sharedEmissionQueryOptions,
    }),

  editionsCatalog: (emissionId: string) =>
    queryOptions({
      queryKey: emissionQueryKeys.editions(emissionId),
      queryFn: async () => {
        const res = await emissionRequest.listEditions(emissionId, EDITION_LIST_PARAMS)
        return res.data.map(mapEditionListItemToTab).sort((a, b) => b.year - a.year)
      },
      ...sharedEmissionQueryOptions,
    }),

  editionDetail: (editionId: string) =>
    queryOptions({
      queryKey: emissionQueryKeys.editionDetail(editionId),
      queryFn: () => emissionRequest.getEditionById(editionId),
      ...sharedEmissionQueryOptions,
    }),

  candidate: (candidateId: string) =>
    queryOptions({
      queryKey: emissionQueryKeys.candidate(candidateId),
      queryFn: () => emissionRequest.getCandidateById(candidateId),
      staleTime: 30_000,
      gcTime: EMISSION_GC_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: shouldRetryEmission,
    }),
}
