import type { AuthUserDto } from './api/modules/auth/auth.types'
import type {
  StudentProfileDto,
  UpdateStudentProfileBodyDto,
} from './api/modules/profile/profile.types'

function hasItems<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0
}

function mergeSocialLinks(
  current: AuthUserDto['socialLinks'],
  response: StudentProfileDto['socialLinks'],
  submitted?: UpdateStudentProfileBodyDto['socialLinks'],
): AuthUserDto['socialLinks'] {
  if (hasItems(submitted)) return submitted

  const currentLinks = current ?? []
  const responseLinks = response ?? []

  if (hasItems(responseLinks) && responseLinks.length >= currentLinks.length) {
    return responseLinks
  }
  if (hasItems(currentLinks)) return currentLinks
  if (hasItems(responseLinks)) return responseLinks
  return undefined
}

/** Fusionne la reponse API avec les donnees envoyees quand l'API omet certains champs. */
export function mergeProfileUpdate(
  current: AuthUserDto,
  response: StudentProfileDto,
  submitted: UpdateStudentProfileBodyDto,
): AuthUserDto {
  return {
    ...current,
    ...response,
    firstName: response.firstName ?? submitted.firstName ?? current.firstName,
    lastName: response.lastName ?? submitted.lastName ?? current.lastName,
    phoneNumber: response.phoneNumber ?? submitted.phoneNumber ?? current.phoneNumber,
    bio: response.bio ?? submitted.bio ?? current.bio,
    videoPresentationUrl:
      response.videoPresentationUrl ?? submitted.videoPresentationUrl ?? current.videoPresentationUrl,
    dateOfBirth: response.dateOfBirth ?? submitted.dateOfBirth ?? current.dateOfBirth,
    gender: response.gender ?? submitted.gender ?? current.gender,
    nationality: response.nationality ?? submitted.nationality ?? current.nationality,
    address: response.address ?? submitted.address ?? current.address,
    city: response.city ?? submitted.city ?? current.city,
    country: response.country ?? submitted.country ?? current.country,
    profileImage: response.profileImage ?? submitted.profileImage ?? current.profileImage,
    coverImage: response.coverImage ?? submitted.coverImage ?? current.coverImage,
    academicLevel: response.academicLevel ?? submitted.academicLevel ?? current.academicLevel,
    socialLinks: mergeSocialLinks(current.socialLinks, response.socialLinks, submitted.socialLinks),
    interests: hasItems(response.interests)
      ? response.interests
      : hasItems(submitted.interests)
        ? submitted.interests
        : current.interests,
    email: response.email ?? current.email,
  }
}
