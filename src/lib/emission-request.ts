import type {
  ListEditionCandidatesQuery,
  ListEmissionEditionsQuery,
  ListEmissionsQuery,
} from './api/modules/emission/emission.types'
import { emissionApi } from '../services/api-client'

const MIN_INTERVAL_MS = 450

let requestChain: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

function waitForSlot(): Promise<void> {
  const delay = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt))
  if (delay === 0) return Promise.resolve()
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay)
  })
}

function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = async () => {
    await waitForSlot()
    lastRequestAt = Date.now()
    return task()
  }
  const result = requestChain.then(run, run)
  requestChain = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

export const emissionRequest = {
  list(params?: ListEmissionsQuery) {
    return throttled(() => emissionApi.list(params))
  },
  getById(emissionId: string) {
    return throttled(() => emissionApi.getById(emissionId))
  },
  listEditions(emissionId: string, params?: ListEmissionEditionsQuery) {
    return throttled(() => emissionApi.listEditions(emissionId, params))
  },
  getActiveEdition(emissionId: string) {
    return throttled(() => emissionApi.getActiveEdition(emissionId))
  },
  getEditionById(editionId: string) {
    return throttled(() => emissionApi.getEditionById(editionId))
  },
  getEditionCandidates(editionId: string, params?: ListEditionCandidatesQuery) {
    return throttled(() => emissionApi.getEditionCandidates(editionId, params))
  },
  getCandidateById(candidateId: string) {
    return throttled(() => emissionApi.getCandidateById(candidateId))
  },
  applyToEdition(
    editionId: string,
    body: Parameters<typeof emissionApi.applyToEdition>[1],
  ) {
    return throttled(() => emissionApi.applyToEdition(editionId, body))
  },
  listCategories(params?: Parameters<typeof emissionApi.listCategories>[0]) {
    return throttled(() => emissionApi.listCategories(params))
  },
  listTags(params?: Parameters<typeof emissionApi.listTags>[0]) {
    return throttled(() => emissionApi.listTags(params))
  },
}
