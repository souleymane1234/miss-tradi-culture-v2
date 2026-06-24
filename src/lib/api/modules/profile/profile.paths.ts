export const PROFILE_API_PATHS = {
  getUser: '/api/v1/profile/user',
  updateUser: '/api/v1/profile/user',
} as const

export type ProfileApiPaths = typeof PROFILE_API_PATHS
