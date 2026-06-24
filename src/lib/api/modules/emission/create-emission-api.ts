import type { HttpClient } from '../../ports/http-client.port'
import { EMISSION_API_PATHS, type EmissionApiPaths } from './emission.paths'
import type {
  ActiveEditionEnvelopeDto,
  ApplyToEditionBodyDto,
  ApplyToEditionEnvelopeDto,
  EditionCandidatesEnvelopeDto,
  EditionFullDetailEnvelopeDto,
  EditionListEnvelopeDto,
  EmissionCandidateDetailEnvelopeDto,
  EmissionCategoriesEnvelopeDto,
  EmissionDetailEnvelopeDto,
  EmissionListEnvelopeDto,
  EmissionTagsEnvelopeDto,
  ListEditionCandidatesQuery,
  ListEmissionCategoriesQuery,
  ListEmissionEditionsQuery,
  ListEmissionTagsQuery,
  ListEmissionsQuery,
} from './emission.types'

export interface EmissionApi {
  list(params?: ListEmissionsQuery): Promise<EmissionListEnvelopeDto>
  getById(emissionId: string): Promise<EmissionDetailEnvelopeDto>
  listEditions(
    emissionId: string,
    params?: ListEmissionEditionsQuery,
  ): Promise<EditionListEnvelopeDto>
  getActiveEdition(emissionId: string): Promise<ActiveEditionEnvelopeDto>
  getEditionById(editionId: string): Promise<EditionFullDetailEnvelopeDto>
  getEditionCandidates(
    editionId: string,
    params?: ListEditionCandidatesQuery,
  ): Promise<EditionCandidatesEnvelopeDto>
  getCandidateById(candidateId: string): Promise<EmissionCandidateDetailEnvelopeDto>
  applyToEdition(editionId: string, body: ApplyToEditionBodyDto): Promise<ApplyToEditionEnvelopeDto>
  listCategories(params?: ListEmissionCategoriesQuery): Promise<EmissionCategoriesEnvelopeDto>
  listTags(params?: ListEmissionTagsQuery): Promise<EmissionTagsEnvelopeDto>
}

export function createEmissionApi(
  http: HttpClient,
  paths: EmissionApiPaths = EMISSION_API_PATHS,
): EmissionApi {
  return {
    list(params) {
      return http.request<EmissionListEnvelopeDto>({
        method: 'GET',
        path: paths.collection,
        query: {
          isActive: params?.isActive,
          status: params?.status,
          isPublic: params?.isPublic,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },

    getById(emissionId) {
      return http.request<EmissionDetailEnvelopeDto>({
        method: 'GET',
        path: paths.byId(emissionId),
      })
    },

    listEditions(emissionId, params) {
      return http.request<EditionListEnvelopeDto>({
        method: 'GET',
        path: paths.editions(emissionId),
        query: {
          status: params?.status,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },

    getActiveEdition(emissionId) {
      return http.request<ActiveEditionEnvelopeDto>({
        method: 'GET',
        path: paths.activeEdition(emissionId),
      })
    },

    getEditionById(editionId) {
      return http.request<EditionFullDetailEnvelopeDto>({
        method: 'GET',
        path: paths.editionById(editionId),
      })
    },

    getEditionCandidates(editionId, params) {
      return http.request<EditionCandidatesEnvelopeDto>({
        method: 'GET',
        path: paths.editionCandidates(editionId),
        query: {
          page: params?.page,
          limit: params?.limit,
          tagId: params?.tagId,
        },
      })
    },

    getCandidateById(candidateId) {
      return http.request<EmissionCandidateDetailEnvelopeDto>({
        method: 'GET',
        path: paths.candidateById(candidateId),
      })
    },

    applyToEdition(editionId, body) {
      return http.request<ApplyToEditionEnvelopeDto>({
        method: 'POST',
        path: paths.editionApply(editionId),
        body,
      })
    },

    listCategories(params) {
      return http.request<EmissionCategoriesEnvelopeDto>({
        method: 'GET',
        path: paths.categories(),
        query: {
          editionId: params?.editionId,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },

    listTags(params) {
      return http.request<EmissionTagsEnvelopeDto>({
        method: 'GET',
        path: paths.tags(),
        query: {
          categoryId: params?.categoryId,
          editionId: params?.editionId,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },
  }
}
