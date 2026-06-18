import type { HttpClient } from '../../ports/http-client.port'
import { NEWS_API_PATHS, type NewsApiPaths } from './news.paths'
import type { NewsListEnvelopeDto, NewsListQuery } from './news.types'

export interface NewsApi {
  list(params?: NewsListQuery): Promise<NewsListEnvelopeDto>
}

export function createNewsApi(http: HttpClient, paths: NewsApiPaths = NEWS_API_PATHS): NewsApi {
  return {
    list(params) {
      return http.request<NewsListEnvelopeDto>({
        method: 'GET',
        path: paths.list,
        query: {
          category: params?.category,
          module: params?.module,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },
  }
}
