export const VIDEO_API_PATHS = {
  collection: '/api/v1/video/videos',
} as const

export type VideoApiPaths = typeof VIDEO_API_PATHS
