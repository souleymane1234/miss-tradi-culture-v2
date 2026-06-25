import type {
  ConfirmVotePaymentBody,
  ConfirmVotePaymentInput,
  InitiateVotePaymentBody,
  InitiateVotePaymentInput,
} from './vote.types'

function normalizeVoteCount(count: number): number {
  return Math.max(1, Math.floor(count))
}

/**
 * Construit le JSON POST vote/initiate — uniquement voteCount, provider, phoneNumber, otp?.
 * Le montant est calculé côté API (voteCount × voteAmountPerVote).
 */
export function buildInitiateVotePaymentBody(
  input: InitiateVotePaymentInput,
): InitiateVotePaymentBody {
  const voteCount = normalizeVoteCount(input.voteCount)
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
    voteCount: normalizeVoteCount(input.voteCount),
  }
}
