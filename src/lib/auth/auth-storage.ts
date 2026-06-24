import type { AuthSessionDto, AuthUserDto } from '../api/modules/auth/auth.types'

import type { ProfileSocialLinkDto } from '../api/modules/profile/profile.types'

const ACCESS_TOKEN_KEY = 'missplayce.accessToken'
const REFRESH_TOKEN_KEY = 'missplayce.refreshToken'
const USER_KEY = 'missplayce.user'

function readEnvAccessToken(): string | null {
  const value = import.meta.env.VITE_API_ACCESS_TOKEN
  if (typeof value !== 'string' || !value.trim()) return null
  return value.trim()
}

export function getAccessToken(): string | null {
  return readEnvAccessToken() ?? localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getAuthUser(): AuthUserDto | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUserDto
  } catch {
    return null
  }
}

export function setAuthTokens(accessToken: string, refreshToken?: string | null): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function setAuthUser(user: AuthUserDto | null): void {
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function persistAuthSession(session: AuthSessionDto): void {
  setAuthTokens(session.accessToken, session.refreshToken)
  if (session.user) setAuthUser(session.user)
}

export function mergeAuthUser(partial: Partial<AuthUserDto>): void {
  const current = getAuthUser()
  if (!current) return
  const defined = Object.fromEntries(
    Object.entries(partial).filter(([, value]) => value !== undefined),
  ) as Partial<AuthUserDto>
  setAuthUser({ ...current, ...defined })
}

export function mergeAuthUserFromProfile(profile: {
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  bio?: string | null
  videoPresentationUrl?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  profileImage?: string | null
  coverImage?: string | null
  interests?: string[] | null
  socialLinks?: ProfileSocialLinkDto[] | null
  academicLevel?: string | null
  email?: string | null
}): void {
  mergeAuthUser({
    firstName: profile.firstName ?? undefined,
    lastName: profile.lastName ?? undefined,
    phoneNumber: profile.phoneNumber ?? undefined,
    bio: profile.bio ?? undefined,
    videoPresentationUrl: profile.videoPresentationUrl ?? undefined,
    dateOfBirth: profile.dateOfBirth ?? undefined,
    gender: profile.gender ?? undefined,
    nationality: profile.nationality ?? undefined,
    address: profile.address ?? undefined,
    city: profile.city ?? undefined,
    country: profile.country ?? undefined,
    profileImage: profile.profileImage ?? undefined,
    coverImage: profile.coverImage ?? undefined,
    interests: profile.interests ?? undefined,
    socialLinks: profile.socialLinks ?? undefined,
    academicLevel: profile.academicLevel ?? undefined,
    email: profile.email ?? undefined,
  })
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken())
}
