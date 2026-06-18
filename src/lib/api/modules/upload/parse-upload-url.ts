const URL_KEYS = ['url', 'imageUrl', 'videoUrl', 'secureUrl', 'fileUrl', 'publicUrl'] as const

function readUrl(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function parseUploadUrl(body: unknown): string {
  if (!body || typeof body !== 'object') {
    throw new Error('Reponse upload invalide.')
  }

  const root = body as Record<string, unknown>
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null

  for (const source of [data, root]) {
    if (!source) continue
    for (const key of URL_KEYS) {
      const url = readUrl(source[key])
      if (url) return url
    }
  }

  throw new Error('URL du fichier introuvable dans la reponse upload.')
}
