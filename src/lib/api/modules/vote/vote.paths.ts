export const VOTE_API_PATHS = {
  initiate: (candidateId: string) =>
    `/api/v1/emission/candidates/${encodeURIComponent(candidateId)}/vote/initiate`,
  confirm: (candidateId: string) =>
    `/api/v1/emission/candidates/${encodeURIComponent(candidateId)}/vote`,
} as const

export type VoteApiPaths = typeof VOTE_API_PATHS
