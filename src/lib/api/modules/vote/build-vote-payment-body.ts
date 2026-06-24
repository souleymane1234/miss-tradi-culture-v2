import type {
  ConfirmVotePaymentBody,
  ConfirmVotePaymentInput,
  InitiateVotePaymentBody,
  InitiateVotePaymentInput,
} from './vote.types'

const MAX_VOTES = 8

function clampVoteCount(count: number): number {
  return Math.min(MAX_VOTES, Math.max(1, Math.floor(count)))
}

/**
 * Construit le JSON POST vote/initiate — uniquement voteCount, provider, phoneNumber, otp?.
 * Le montant est calculé côté API (voteCount × voteAmountPerVote).
 */
export function buildInitiateVotePaymentBody(
  input: InitiateVotePaymentInput,
): InitiateVotePaymentBody {
  const voteCount = clampVoteCount(input.voteCount)
  const phoneNumber = input.phoneNumber.trim()
  const provider = input.provider
  const otp = input.otp?.trim()

  if (otp) {
    return { voteCount, provider, phoneNumber, otp }
  }

  return { voteCount, provider, phoneNumber }
}

export function buildConfirmVotePaymentBody(
  input: ConfirmVotePaymentInput,
): ConfirmVotePaymentBody {
  return {
    transactionId: input.transactionId.trim(),
    voteCount: clampVoteCount(input.voteCount),
  }
}
