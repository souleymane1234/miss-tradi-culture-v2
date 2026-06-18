import type { AuthSessionDto, AuthUserDto } from '../api/modules/auth/auth.types'

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

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken())
}
