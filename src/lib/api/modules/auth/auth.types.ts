export interface LoginBodyDto {
  email: string
  password: string
}

export interface RegisterWithoutConfirmBodyDto {
  email: string
  password: string
  firstName?: string | null
  lastName?: string | null
}

export interface RefreshBodyDto {
  refreshToken: string
}

export interface AuthUserDto {
  id: string
  email: string
  role?: string
  emailVerifie?: boolean
  premiumActif?: boolean
  studentProfileId?: string | null
  phoneNumber?: string | null
  firstName?: string | null
  lastName?: string | null
  profileImage?: string | null
  dateOfBirth?: string | null
  city?: string | null
  country?: string | null
}

export interface AuthSessionDto {
  accessToken: string
  refreshToken?: string | null
  user?: AuthUserDto | null
}

export interface AuthEnvelopeDto {
  success: boolean
  message: string
  data?: {
    accessToken?: string
    refreshToken?: string
    user?: AuthUserDto
  }
}
