export const emissionQueryKeys = {
  emissionsList: ['emission', 'list', 'public'] as const,
  emission: (id: string) => ['emission', id] as const,
  editions: (id: string) => ['emission', id, 'editions'] as const,
  editionDetail: (editionId: string) => ['edition', editionId] as const,
  candidate: (candidateId: string) => ['candidate', candidateId] as const,
}
