/** Providers Mobile Money attendus par POST …/vote/initiate (cf. OpenAPI InitiateVotePaymentDto). */
export type VotePaymentProvider = 'mtnci' | 'moovci' | 'waveci' | 'orangeci'

/** Body exact envoyé à l'API — aucun amount / amountPerVote (montant calculé serveur). */
export interface InitiateVotePaymentBody {
  voteCount: number
  provider: VotePaymentProvider
  phoneNumber: string
  otp?: string
}

export interface InitiateVotePaymentInput {
  voteCount: number
  provider: VotePaymentProvider
  phoneNumber: string
  otp?: string
}

export interface InitiateVotePaymentTransactionDto {
  id: string
  transactionType: string
  provider: string
  amount: number
  status: string
  reference: string
  phoneNumber: string
  paymentUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface InitiateVotePaymentEnvelopeDto {
  success: boolean
  message: string
  data: InitiateVotePaymentTransactionDto
}

export interface ConfirmVotePaymentBody {
  transactionId: string
  voteCount: number
}

export interface ConfirmVotePaymentInput {
  transactionId: string
  voteCount: number
}

export interface VoteRecordDto {
  id: string
  editionId: string
  candidateId: string
  userId: string
  transactionId: string
  createdAt: string
}

export interface ConfirmVotePaymentEnvelopeDto {
  success: boolean
  message: string
  data: VoteRecordDto[]
}
