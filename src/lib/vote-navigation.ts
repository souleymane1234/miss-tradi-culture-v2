const VOTE_EDITION_STORAGE_PREFIX = 'missplayce.voteEdition.'

export function buildVotePageHref(candidateId: string, editionId: string): string {
  const params = new URLSearchParams({ edition: editionId })
  return `/vote/${encodeURIComponent(candidateId)}?${params.toString()}`
}

export function persistVoteEditionId(candidateId: string, editionId: string): void {
  try {
    sessionStorage.setItem(`${VOTE_EDITION_STORAGE_PREFIX}${candidateId}`, editionId)
  } catch {
    /* ignore */
  }
}

export function resolveVoteEditionId(candidateId: string | null): string | null {
  if (!candidateId) return null

  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('edition') ?? params.get('editionId')
  if (fromUrl?.trim()) return fromUrl.trim()

  try {
    const stored = sessionStorage.getItem(`${VOTE_EDITION_STORAGE_PREFIX}${candidateId}`)
    return stored?.trim() || null
  } catch {
    return null
  }
}
