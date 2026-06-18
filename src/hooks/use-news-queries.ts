import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { USE_MOCK_NEWS } from '../config/app-config'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import {
  isNewsContentItem,
  type NewsItemDto,
  type NewsListQuery,
} from '../lib/api/modules/news/news.types'
import { findArticleInNewsCache, getCachedNewsFeedItems } from '../lib/news-cache'
import { mapNewsItemToApercu } from '../lib/map-news'
import { fetchNewsListThrottled } from '../lib/news-request'

export const NEWS_PAGE_SIZE = 10
const NEWS_STALE_MS = 5 * 60_000
const NEWS_GC_MS = 30 * 60_000
const MAX_ARTICLE_LOOKUP_PAGES = 2

export const newsQueryKeys = {
  list: (params?: NewsListQuery) =>
    [
      'news',
      'list',
      params?.module ?? 'news',
      params?.category ?? '',
      params?.search ?? '',
      params?.page ?? 1,
      params?.limit ?? NEWS_PAGE_SIZE,
      params?.sortBy ?? 'date',
      params?.sortOrder ?? 'desc',
    ] as const,
  infinite: (params?: Omit<NewsListQuery, 'page'>) =>
    [
      'news',
      'infinite',
      params?.module ?? 'news',
      params?.category ?? '',
      params?.search ?? '',
      params?.limit ?? NEWS_PAGE_SIZE,
      params?.sortBy ?? 'date',
      params?.sortOrder ?? 'desc',
    ] as const,
  article: (slugOrId: string) => ['news', 'article', slugOrId] as const,
}

function shouldRetryNewsRequest(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && error.status === 429) return false
  return failureCount < 1
}

const sharedNewsQueryOptions = {
  staleTime: NEWS_STALE_MS,
  gcTime: NEWS_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  retry: shouldRetryNewsRequest,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
} as const

export function useNewsList(limit = 3, module = 'news') {
  const queryClient = useQueryClient()
  const cached = getCachedNewsFeedItems(queryClient)

  return useQuery({
    queryKey: newsQueryKeys.list({ limit, module, page: 1, sortBy: 'date', sortOrder: 'desc' }),
    queryFn: async () => {
      const res = await fetchNewsListThrottled({
        page: 1,
        limit,
        module,
        sortBy: 'date',
        sortOrder: 'desc',
      })
      return res.data
    },
    enabled: !USE_MOCK_NEWS && cached.length < limit,
    initialData: cached.length >= limit ? cached.slice(0, limit) : undefined,
    ...sharedNewsQueryOptions,
  })
}

export function useNewsApercu(limit = 3) {
  const queryClient = useQueryClient()
  const cached = getCachedNewsFeedItems(queryClient)
  const query = useNewsList(limit, 'news')

  const source =
    cached.length >= limit ? cached.slice(0, limit) : (query.data ?? []).filter(isNewsContentItem)

  return {
    ...query,
    isLoading: query.isLoading && source.length === 0,
    items: source.map((item) => mapNewsItemToApercu(item)),
  }
}

async function findNewsArticleBySlugOrId(
  slugOrId: string,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<NewsItemDto | null> {
  const fromCache = findArticleInNewsCache(queryClient, slugOrId)
  if (fromCache) return fromCache

  let totalPages = 1
  for (let page = 1; page <= totalPages && page <= MAX_ARTICLE_LOOKUP_PAGES; page += 1) {
    const res = await fetchNewsListThrottled({
      page,
      limit: 50,
      module: 'news',
      sortBy: 'date',
      sortOrder: 'desc',
    })
    totalPages = res.pagination.total_pages
    const match = res.data.find(
      (row) => isNewsContentItem(row) && (row.slug === slugOrId || row.id === slugOrId),
    )
    if (match && isNewsContentItem(match)) return match
  }

  return null
}

export function useNewsArticle(slugOrId: string | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: slugOrId ? newsQueryKeys.article(slugOrId) : ['news', 'article', 'none'],
    queryFn: () => findNewsArticleBySlugOrId(slugOrId as string, queryClient),
    enabled: !USE_MOCK_NEWS && Boolean(slugOrId),
    ...sharedNewsQueryOptions,
  })
}

export function useNewsFeedInfinite(options?: {
  search?: string
  category?: string
  sortBy?: 'date' | 'popularity'
}) {
  const search = options?.search?.trim() || undefined
  const category = options?.category?.trim() || undefined
  const sortBy = options?.sortBy ?? 'date'

  return useInfiniteQuery({
    queryKey: newsQueryKeys.infinite({ module: 'news', search, category, sortBy, sortOrder: 'desc' }),
    queryFn: async ({ pageParam }) =>
      fetchNewsListThrottled({
        page: pageParam,
        limit: NEWS_PAGE_SIZE,
        module: 'news',
        search,
        category,
        sortBy,
        sortOrder: 'desc',
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination
      return current_page < total_pages ? current_page + 1 : undefined
    },
    enabled: !USE_MOCK_NEWS,
    ...sharedNewsQueryOptions,
  })
}

export function isNewsRateLimitError(error: unknown): boolean {
  return ApiHttpError.isInstance(error) && error.status === 429
}
