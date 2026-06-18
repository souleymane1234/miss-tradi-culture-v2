import type { HttpClient } from '../../ports/http-client.port'
import { VIDEO_API_PATHS, type VideoApiPaths } from './video.paths'
import type {
  CreateVideoBodyDto,
  CreateVideoEnvelopeDto,
  CreatedVideoDto,
  VideoListEnvelopeDto,
  VideoListQuery,
} from './video.types'

export interface VideoApi {
  create(body: CreateVideoBodyDto): Promise<CreatedVideoDto>
  list(params?: VideoListQuery): Promise<VideoListEnvelopeDto>
}

function normalizeCreatedVideo(body: CreateVideoEnvelopeDto | CreatedVideoDto): CreatedVideoDto {
  if ('id' in body && typeof body.id === 'string') {
    return body as CreatedVideoDto
  }
  const data = (body as CreateVideoEnvelopeDto).data
  if (data?.id) return data
  throw new Error('Reponse de creation video invalide.')
}

export function createVideoApi(http: HttpClient, paths: VideoApiPaths = VIDEO_API_PATHS): VideoApi {
  return {
    async create(body) {
      const res = await http.request<CreateVideoEnvelopeDto | CreatedVideoDto>({
        method: 'POST',
        path: paths.collection,
        body,
      })
      return normalizeCreatedVideo(res)
    },
    list(params) {
      return http.request<VideoListEnvelopeDto>({
        method: 'GET',
        path: paths.collection,
        query: {
          categoryId: params?.categoryId,
          search: params?.search,
          premiumOnly: params?.premiumOnly,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },
  }
}
