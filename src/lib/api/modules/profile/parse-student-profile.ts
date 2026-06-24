import type { ProfileSocialLinkDto, StudentProfileDto } from './profile.types'

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

export function parseSocialLinks(value: unknown): ProfileSocialLinkDto[] | undefined {
  if (value == null) return undefined

  let raw: unknown = value
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw) as unknown
    } catch {
      return undefined
    }
  }

  if (!Array.isArray(raw)) return undefined

  const links = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const platform =
        readString(o.platform) ?? readString(o.platformName) ?? readString(o.name) ?? ''
      const url = readString(o.url) ?? readString(o.link) ?? readString(o.href) ?? ''
      if (!platform || !url) return null
      return { platform, url }
    })
    .filter((item): item is ProfileSocialLinkDto => item !== null)

  return links.length > 0 ? links : undefined
}

function readProfileSource(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (o.studentProfile && typeof o.studentProfile === 'object') {
    return o.studentProfile as Record<string, unknown>
  }
  if (o.profile && typeof o.profile === 'object') {
    return o.profile as Record<string, unknown>
  }
  return o
}

export function parseStudentProfile(data: unknown): StudentProfileDto | null {
  const source = readProfileSource(data)
  if (!source) return null

  const profile: StudentProfileDto = {
    id: readString(source.id),
    email: readString(source.email),
    firstName: readString(source.firstName),
    lastName: readString(source.lastName),
    phoneNumber: readString(source.phoneNumber),
    bio: readString(source.bio),
    videoPresentationUrl: readString(source.videoPresentationUrl),
    dateOfBirth: readString(source.dateOfBirth),
    gender: readString(source.gender),
    nationality: readString(source.nationality),
    address: readString(source.address),
    city: readString(source.city),
    country: readString(source.country),
    profileImage: readString(source.profileImage),
    coverImage: readString(source.coverImage),
    academicLevel: readString(source.academicLevel),
    interests: readStringArray(source.interests),
    socialLinks: parseSocialLinks(source.socialLinks ?? source.socialLink),
  }

  const hasValue = Object.values(profile).some((value) => value !== undefined)
  return hasValue ? profile : null
}

export function parseStudentProfileEnvelope(body: unknown): StudentProfileDto | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const data = root.data ?? root
  return parseStudentProfile(data)
}
