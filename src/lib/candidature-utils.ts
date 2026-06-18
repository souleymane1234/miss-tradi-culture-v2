export const CANDIDATURE_PHOTO_MAX_BYTES = 2 * 1024 * 1024
export const CANDIDATURE_VIDEO_MAX_BYTES = 30 * 1024 * 1024

const PHOTO_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'])

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function validateCandidaturePhotoFile(file: File): string | null {
  if (!PHOTO_MIME_TYPES.has(file.type)) {
    return 'Format photo non pris en charge (JPEG, PNG, WebP ou GIF).'
  }
  if (file.size > CANDIDATURE_PHOTO_MAX_BYTES) {
    return `La photo depasse 2 Mo (${formatFileSize(file.size)}).`
  }
  return null
}

export function validateCandidatureVideoFile(file: File): string | null {
  if (!VIDEO_MIME_TYPES.has(file.type)) {
    return 'Format video non pris en charge (MP4, MOV ou WebM).'
  }
  if (file.size > CANDIDATURE_VIDEO_MAX_BYTES) {
    return `La video depasse 30 Mo (${formatFileSize(file.size)}).`
  }
  return null
}

export type CandidatureFormInput = {
  pseudo: string
  candidatePreName: string
  candidateName: string
  birthDate: string
  photoFile: File
  description: string
  videoFile: File
  videoTitle: string
  countryId: string
  residenceCountryId: string
  categoryId: string
  tagId: string
}
