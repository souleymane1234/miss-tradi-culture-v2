export interface ProfileSocialLinkDto {
  platform: string
  url: string
}

export interface UpdateStudentProfileBodyDto {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
  videoPresentationUrl?: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  address?: string
  city?: string
  country?: string
  profileImage?: string
  coverImage?: string
  interests?: string[]
  socialLinks?: ProfileSocialLinkDto[]
  academicLevel?: string
}

export interface StudentProfileDto extends UpdateStudentProfileBodyDto {
  id?: string
  email?: string
}

export interface StudentProfileEnvelopeDto {
  success: boolean
  message: string
  data?: StudentProfileDto
}
