export const NEWS_API_PATHS = {
  list: '/api/v1/news',
} as const

export type NewsApiPaths = typeof NEWS_API_PATHS
