import type { NewsListEnvelopeDto, NewsListQuery } from './api/modules/news/news.types'
import { newsApi } from '../services/api-client'

/** Espace minimal entre deux GET /news (rate limit Railway). */
const MIN_INTERVAL_MS = 450

let requestChain: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

function waitForSlot(): Promise<void> {
  const now = Date.now()
  const delay = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestAt))
  if (delay === 0) return Promise.resolve()
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay)
  })
}

/** File d'attente serialisee pour eviter les rafales 429 sur /api/v1/news. */
export function fetchNewsListThrottled(params: NewsListQuery): Promise<NewsListEnvelopeDto> {
  const task = async () => {
    await waitForSlot()
    lastRequestAt = Date.now()
    return newsApi.list(params)
  }

  const result = requestChain.then(task, task)
  requestChain = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}
