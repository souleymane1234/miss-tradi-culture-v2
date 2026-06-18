import type { NewsAdItemDto, NewsFeedItemDto, NewsItemDto } from './api/modules/news/news.types'
import { isNewsAdItem, isNewsContentItem } from './api/modules/news/news.types'

export type NewsPostCard = {
  id: string
  type: 'post'
  author: string
  role: string
  time: string
  isoDate: string
  title: string
  text: string
  imageSrc?: string
  imageAlt?: string
  likes: number
  reads: number
  slug: string
  detailHref: string
}

export type NewsAdCard = {
  id: string
  type: 'ad'
  label: string
  title: string
  text: string
  imageSrc: string
  imageAlt: string
  cta: string
  href: string
}

export type NewsFeedCard = NewsPostCard | NewsAdCard

export function newsDetailPath(slugOrId: string): string {
  return `/actualites/${encodeURIComponent(slugOrId)}`
}

export function formatNewsDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatNewsRelativeTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "A l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Il y a ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return diffD === 1 ? 'Hier' : `Il y a ${diffD} jours`
  return formatNewsDate(iso)
}

const FALLBACK_NEWS_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'

export function mapNewsItemToPost(item: NewsItemDto): NewsPostCard {
  const slug = item.slug ?? item.id
  return {
    id: item.id,
    type: 'post',
    author: item.author?.trim() || 'Miss Tradi Culture',
    role: item.category?.name ?? 'Actualite',
    time: formatNewsRelativeTime(item.publishedAt),
    isoDate: item.publishedAt ?? '',
    title: item.title,
    text: item.summary?.trim() || item.title,
    imageSrc: item.mainImage ?? undefined,
    imageAlt: item.title,
    likes: 0,
    reads: item.views ?? 0,
    slug,
    detailHref: newsDetailPath(slug),
  }
}

export function mapNewsAdToCard(item: NewsAdItemDto): NewsAdCard {
  const imageSrc = item.imageUrl ?? item.thumbnailUrl ?? FALLBACK_NEWS_IMAGE
  return {
    id: item.id,
    type: 'ad',
    label: item.type === 'VIDEO' ? 'Video sponsorisee' : 'Sponsorise',
    title: item.title?.trim() || 'Espace publicitaire',
    text: item.description?.trim() || 'Decouvrez cette offre partenaire.',
    imageSrc,
    imageAlt: item.title ?? 'Publicite',
    cta: 'En savoir plus',
    href: item.targetUrl?.trim() || '/partenariat',
  }
}

export function mapFeedItemToCard(item: NewsFeedItemDto): NewsFeedCard | null {
  if (isNewsContentItem(item)) return mapNewsItemToPost(item)
  if (isNewsAdItem(item)) return mapNewsAdToCard(item)
  return null
}

export function mapFeedItemsToCards(items: NewsFeedItemDto[]): NewsFeedCard[] {
  return items.map(mapFeedItemToCard).filter((item): item is NewsFeedCard => item !== null)
}

export type NewsApercuCard = {
  id: string
  imageSrc: string
  imageAlt: string
  category: string
  date: string
  isoDate: string
  title: string
  excerpt: string
  href: string
}

export function mapNewsItemToApercu(item: NewsItemDto): NewsApercuCard {
  const slug = item.slug ?? item.id
  return {
    id: item.id,
    imageSrc: item.mainImage ?? FALLBACK_NEWS_IMAGE,
    imageAlt: item.title,
    category: item.category?.name ?? 'Actualite',
    date: formatNewsDate(item.publishedAt),
    isoDate: item.publishedAt ?? '',
    title: item.title,
    excerpt: item.summary ?? '',
    href: newsDetailPath(slug),
  }
}
