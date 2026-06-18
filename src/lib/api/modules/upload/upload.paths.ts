export const UPLOAD_API_PATHS = {
  image: '/api/v1/uploads/image',
  video: '/api/v1/uploads/video',
} as const

export type UploadApiPaths = typeof UPLOAD_API_PATHS
