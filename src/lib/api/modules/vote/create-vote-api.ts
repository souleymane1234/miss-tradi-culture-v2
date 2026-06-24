import type { HttpClient } from '../../ports/http-client.port'
import {
  buildConfirmVotePaymentBody,
  buildInitiateVotePaymentBody,
} from './build-vote-payment-body'
import { VOTE_API_PATHS, type VoteApiPaths } from './vote.paths'
import type {
  ConfirmVotePaymentEnvelopeDto,
  ConfirmVotePaymentInput,
  InitiateVotePaymentEnvelopeDto,
  InitiateVotePaymentInput,
} from './vote.types'

export interface VoteApi {
  initiatePayment(
    candidateId: string,
    input: InitiateVotePaymentInput,
  ): Promise<InitiateVotePaymentEnvelopeDto>
  confirmPayment(
    candidateId: string,
    input: ConfirmVotePaymentInput,
  ): Promise<ConfirmVotePaymentEnvelopeDto>
}

export function createVoteApi(
  http: HttpClient,
  paths: VoteApiPaths = VOTE_API_PATHS,
): VoteApi {
  return {
    initiatePayment(candidateId, input) {
      return http.request<InitiateVotePaymentEnvelopeDto>({
        method: 'POST',
        path: paths.initiate(candidateId),
        body: buildInitiateVotePaymentBody(input),
      })
    },

    confirmPayment(candidateId, input) {
      return http.request<ConfirmVotePaymentEnvelopeDto>({
        method: 'POST',
        path: paths.confirm(candidateId),
        body: buildConfirmVotePaymentBody(input),
      })
    },
  }
}
