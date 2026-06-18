import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import {
  isNewsContentItem,
  type NewsFeedItemDto,
  type NewsItemDto,
  type NewsListEnvelopeDto,
} from './api/modules/news/news.types'

function matchesArticle(row: NewsFeedItemDto, slugOrId: string): row is NewsItemDto {
  return isNewsContentItem(row) && (row.slug === slugOrId || row.id === slugOrId)
}

function scanItems(items: NewsFeedItemDto[], slugOrId: string): NewsItemDto | null {
  const match = items.find((row) => matchesArticle(row, slugOrId))
  return match ?? null
}

export function findArticleInNewsCache(
  queryClient: QueryClient,
  slugOrId: string,
): NewsItemDto | null {
  const queries = queryClient.getQueriesData<
    NewsFeedItemDto[] | NewsListEnvelopeDto | InfiniteData<NewsListEnvelopeDto>
  >({
    queryKey: ['news'],
  })

  for (const [, data] of queries) {
    if (!data) continue

    if (Array.isArray(data)) {
      const hit = scanItems(data, slugOrId)
      if (hit) return hit
      continue
    }

    if ('pages' in data && Array.isArray(data.pages)) {
      for (const page of data.pages) {
        const hit = scanItems(page.data, slugOrId)
        if (hit) return hit
      }
      continue
    }

    if ('data' in data && Array.isArray(data.data)) {
      const hit = scanItems(data.data, slugOrId)
      if (hit) return hit
    }
  }

  return null
}

export function getCachedNewsFeedItems(queryClient: QueryClient): NewsItemDto[] {
  const infinite = queryClient.getQueryData<InfiniteData<NewsListEnvelopeDto>>([
    'news',
    'infinite',
    'news',
    '',
    '',
    10,
    'date',
    'desc',
  ])

  if (infinite?.pages.length) {
    return infinite.pages.flatMap((page) => page.data.filter(isNewsContentItem))
  }

  const list = queryClient.getQueriesData<NewsFeedItemDto[]>({ queryKey: ['news'] })
  for (const [, data] of list) {
    if (Array.isArray(data) && data.length > 0) {
      return data.filter(isNewsContentItem)
    }
  }

  return []
}
