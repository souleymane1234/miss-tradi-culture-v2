export interface NewsPaginationDto {
  current_page: number
  total_pages: number
  per_page: number
  total_items: number
}

export interface NewsCategoryDto {
  id: string
  name: string
}

export interface NewsItemDto {
  id: string
  contentType: string
  title: string
  summary?: string | null
  mainImage?: string | null
  author?: string | null
  publishedAt?: string | null
  slug?: string | null
  views?: number | null
  category?: NewsCategoryDto | null
  moduleName?: string | null
}

export interface NewsAdItemDto {
  id: string
  contentType: 'ad'
  type?: 'BANNER' | 'VIDEO' | string | null
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  thumbnailUrl?: string | null
  targetUrl?: string | null
  isActive?: boolean | null
  displayOrder?: number | null
}

export type NewsFeedItemDto = NewsItemDto | NewsAdItemDto

export interface NewsListQuery {
  category?: string
  module?: string
  search?: string
  sortBy?: 'date' | 'popularity' | string
  sortOrder?: 'asc' | 'desc' | string
  page?: number
  limit?: number
}

export interface NewsListEnvelopeDto {
  success: boolean
  message: string
  data: NewsFeedItemDto[]
  pagination: NewsPaginationDto
}

export function isNewsContentItem(row: NewsFeedItemDto): row is NewsItemDto {
  return row.contentType === 'news'
}

export function isNewsAdItem(row: NewsFeedItemDto): row is NewsAdItemDto {
  return row.contentType === 'ad'
}
