import type { AuthSessionDto, AuthUserDto } from './auth.types'

function readToken(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseAuthUser(value: unknown): AuthUserDto | null {
  if (!value || typeof value !== 'object') return null
  const o = value as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.email !== 'string') return null
  return {
    id: o.id,
    email: o.email,
    role: typeof o.role === 'string' ? o.role : undefined,
    emailVerifie: typeof o.emailVerifie === 'boolean' ? o.emailVerifie : undefined,
    premiumActif: typeof o.premiumActif === 'boolean' ? o.premiumActif : undefined,
    studentProfileId: typeof o.studentProfileId === 'string' ? o.studentProfileId : null,
    phoneNumber: typeof o.phoneNumber === 'string' ? o.phoneNumber : null,
    firstName: typeof o.firstName === 'string' ? o.firstName : null,
    lastName: typeof o.lastName === 'string' ? o.lastName : null,
    profileImage: typeof o.profileImage === 'string' ? o.profileImage : null,
    dateOfBirth: typeof o.dateOfBirth === 'string' ? o.dateOfBirth : null,
    city: typeof o.city === 'string' ? o.city : null,
    country: typeof o.country === 'string' ? o.country : null,
  }
}

/** Extrait tokens + user depuis login / register / refresh. */
export function parseAuthSession(body: unknown): AuthSessionDto | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root

  const accessToken = readToken(data, 'accessToken') ?? readToken(root, 'accessToken')
  if (!accessToken) return null

  const refreshToken =
    readToken(data, 'refreshToken') ?? readToken(root, 'refreshToken') ?? null

  const user = parseAuthUser(data.user ?? root.user)

  return { accessToken, refreshToken, user }
}
