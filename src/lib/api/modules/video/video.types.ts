export type VideoSourceType = 'YOUTUBE' | 'UPLOAD' | 'VIMEO' | string

export interface CreateVideoBodyDto {
  title: string
  url: string
  sourceType: VideoSourceType
  categoryId?: string | null
  premiumRequired?: boolean
  status?: string
  duration?: number
  description?: string | null
  tags?: string[]
  thumbnailUrl?: string | null
}

export interface CreatedVideoDto {
  id: string
  title: string
  url: string
  sourceType: VideoSourceType
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateVideoEnvelopeDto {
  success?: boolean
  message?: string
  data?: CreatedVideoDto
  id?: string
}

export interface VideoListItemDto {
  id: string
  title: string
  url: string
  sourceType: VideoSourceType
  premiumRequired: boolean
  status: string
  createdAt: string
  duration?: number | null
  description?: string | null
  tags: string[]
  views: number
  thumbnailUrl?: string | null
  likesCount?: number
  commentsCount?: number
}

export interface VideoListQuery {
  categoryId?: string
  search?: string
  premiumOnly?: boolean
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
}

export interface VideoListEnvelopeDto {
  success: boolean
  message: string
  data: VideoListItemDto[]
  pagination: {
    current_page: number
    total_pages: number
    per_page: number
    total_items: number
  }
}
