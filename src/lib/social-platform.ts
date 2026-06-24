import type { IconType } from 'react-icons'
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaLinkedinIn,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const

const PLATFORM_ICONS: Record<string, IconType> = {
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  twitter: FaXTwitter,
  x: FaXTwitter,
  whatsapp: FaWhatsapp,
}

export function normalizeSocialPlatform(platform: string): string {
  const key = platform.trim().toLowerCase()
  if (key === 'x') return 'twitter'
  return key
}

export function getSocialPlatformIcon(platform: string): IconType {
  return PLATFORM_ICONS[normalizeSocialPlatform(platform)] ?? FaLink
}

export function getSocialPlatformLabel(platform: string): string {
  const normalized = normalizeSocialPlatform(platform)
  const match = SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === normalized)
  if (match) return match.label
  if (!platform.trim()) return 'Reseau social'
  return platform.trim()
}
