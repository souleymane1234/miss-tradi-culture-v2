import type {
  ConfirmVotePaymentInput,
  InitiateVotePaymentInput,
} from './api/modules/vote/vote.types'
import { voteApi } from '../services/api-client'

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

/** Paiement Mobile Money pour voter (initiate + confirm). */
export const voteRequest = {
  initiatePayment(candidateId: string, input: InitiateVotePaymentInput) {
    return throttled(() => voteApi.initiatePayment(candidateId, input))
  },
  confirmPayment(candidateId: string, input: ConfirmVotePaymentInput) {
    return throttled(() => voteApi.confirmPayment(candidateId, input))
  },
}
