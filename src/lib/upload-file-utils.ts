/** Taille maximale pour tout envoi video (candidature, profil, etc.). */
export const MAX_VIDEO_FILE_BYTES = 50 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/** Refuse les videos au-dela de 50 Mo avant tout upload. */
export function validateVideoFileSize(file: File): string | null {
  if (file.size > MAX_VIDEO_FILE_BYTES) {
    return `La video depasse 50 Mo (${formatFileSize(file.size)}). Choisissez un fichier plus leger.`
  }
  return null
}

const PHOTO_EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

const VIDEO_EXT_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  m4v: 'video/x-m4v',
}

function inferMimeFromName(name: string, map: Record<string, string>): string | null {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return null
  return map[ext] ?? null
}

/** Garantit un type MIME pour les fichiers sans metadata (ex. certaines photos iPhone). */
export function normalizeUploadFile(file: File, kind: 'photo' | 'video'): File {
  if (file.type) return file
  const fallback =
    kind === 'photo'
      ? inferMimeFromName(file.name, PHOTO_EXT_MIME) ?? 'image/jpeg'
      : inferMimeFromName(file.name, VIDEO_EXT_MIME) ?? 'video/mp4'
  return new File([file], file.name, { type: fallback, lastModified: file.lastModified })
}
