import {
  getSocialPlatformIcon,
  getSocialPlatformLabel,
} from '../lib/social-platform'
import './ProfileSocialLinks.css'

export interface ProfileSocialLinkItem {
  platform: string
  url: string
}

interface ProfileSocialLinksProps {
  links: ProfileSocialLinkItem[]
  className?: string
}

export function ProfileSocialLinks({ links, className }: ProfileSocialLinksProps) {
  const visibleLinks = links.filter((link) => link.url.trim().length > 0)
  if (visibleLinks.length === 0) return null

  const rootClass = ['profile-social-links', className].filter(Boolean).join(' ')

  return (
    <ul className={rootClass} aria-label="Reseaux sociaux">
      {visibleLinks.map((link, index) => {
        const Icon = getSocialPlatformIcon(link.platform)
        const label = getSocialPlatformLabel(link.platform)
        return (
          <li key={`${link.platform}-${index}`}>
            <a href={link.url.trim()} target="_blank" rel="noreferrer" aria-label={label}>
              <Icon aria-hidden="true" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
