import type { HttpClient } from '../../ports/http-client.port'
import { REFERENTIEL_API_PATHS, type ReferentielApiPaths } from './referentiel.paths'
import type { PaysListEnvelopeDto } from './referentiel.types'

export interface ReferentielApi {
  listPays(): Promise<PaysListEnvelopeDto>
}

export function createReferentielApi(
  http: HttpClient,
  paths: ReferentielApiPaths = REFERENTIEL_API_PATHS,
): ReferentielApi {
  return {
    listPays() {
      return http.request<PaysListEnvelopeDto>({
        method: 'GET',
        path: paths.pays,
      })
    },
  }
}
