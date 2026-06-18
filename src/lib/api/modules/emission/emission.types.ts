/**
 * Enveloppes JSON renvoyées par l’API Missplayce (liste paginée vs ressource unique).
 */
export interface ApiPaginationDto {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_items: number;
}

export interface EmissionListEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionListItemDto[];
  pagination: ApiPaginationDto;
}

export interface EmissionDetailEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionDetailDto;
}

export interface EditionListEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionEditionListItemDto[];
  pagination: ApiPaginationDto;
}

export interface ActiveEditionEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionActiveEditionDto | null;
}

export interface PeopleGroupEthnieDto {
  id: string;
  peopleGroupId: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
}

export interface PeopleGroupDto {
  id: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
  ethnies: PeopleGroupEthnieDto[];
}

export interface PeopleGroupsEnvelopeDto {
  success: boolean;
  message: string;
  data: PeopleGroupDto[];
  pagination: ApiPaginationDto;
}

export interface EmissionCategoryTagDto {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
}

export interface EmissionCategoryDto {
  id: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
  tags: EmissionCategoryTagDto[];
}

export interface EmissionCategoriesEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionCategoryDto[];
  pagination: ApiPaginationDto;
}

export interface EmissionTagsEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionCategoryTagDto[];
  pagination: ApiPaginationDto;
}

export interface VideoDto {
  id: string;
  title: string;
  url: string;
  sourceType: string;
  categoryId: string | null;
  premiumRequired: boolean;
  status: string;
  duration: number;
  description: string | null;
  tags: string[];
  views: number;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EditionLotDto {
  title: string;
  imageUrl: string;
  description: string;
}

export interface EditionSponsorDto {
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
}

export interface EmissionSocialLinkDto {
  platform: string;
  url: string;
  logoUrl?: string | null;
}

export interface EditionPreviewCandidateDto {
  pseudo: string;
  candidateName: string;
  candidatePreName: string;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  candidatePicture?: string;
  previewImageUrl?: string;
}

export interface EditionQuizSummaryDto {
  id: string;
  editionId: string;
  title: string;
  description: string;
  active: boolean;
  difficulty: string;
  totalQuestions: number;
}

export interface QuizAnswerDto {
  id: string;
  label: string;
  order: number;
}

export interface QuizQuestionDto {
  id: string;
  quizId: string;
  title: string;
  question: string;
  type: string;
  contentType: string;
  contentUrl: string | null;
  points: number;
  order: number;
  answers: QuizAnswerDto[];
}

export interface EditionQuizPlayableDto extends EditionQuizSummaryDto {
  hasUnusedPaidAttempt: boolean;
  questions: QuizQuestionDto[];
}

/** Édition imbriquée dans GET /emission (liste). */
export interface EmissionNestedEditionDto {
  id: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  status: string;
  isPublic?: boolean;
  currentStage: string;
  startDate: string;
  endDate: string;
  stageStartDate?: string | null;
  stageEndDate?: string | null;
  createdAt: string;
  lots?: EditionLotDto[] | null;
  gameRules?: string | null;
  principles?: string | null;
  sponsors?: EditionSponsorDto[] | null;
  video?: VideoDto | null;
  previewCandidateImageUrls?: string[];
  previewCandidates?: EditionPreviewCandidateDto[];
  candidatesCount?: number;
  hasApplied?: boolean;
  applicationStatus?: string | null;
  isAccepted?: boolean;
}

export interface EmissionListItemDto {
  id: string;
  title: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  socialLinks?: EmissionSocialLinkDto[];
  status?: string;
  description: string;
  pointsPerVote: number;
  isActive: boolean;
  isPublic: boolean;
  adminApprovedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  video: VideoDto | null;
  editions: EmissionNestedEditionDto[];
}

/** Détail émission : videoId à la racine ; pas d’objet video complet dans l’exemple. */
export interface EmissionDetailDto {
  id: string;
  title: string;
  description: string;
  videoId: string | null;
  pointsPerVote: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  activeEdition: EmissionActiveEditionDto | null;
}

/** Édition « active » (détail émission ou endpoint active-edition). */
export interface EmissionActiveEditionDto {
  id: string;
  title: string;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  status: string;
  currentStage?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  lots: EditionLotDto[];
  gameRules: string;
  principles: string;
  sponsors: EditionSponsorDto[];
  video: VideoDto | null;
}

/** Item de GET /emission/:id/editions (champs candidature + pagination). */
export interface EmissionEditionListItemDto {
  id: string;
  emissionId: string;
  emissionName: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  description: string | null;
  lots: EditionLotDto[] | null;
  gameRules: string | null;
  principles: string | null;
  sponsors: EditionSponsorDto[] | null;
  status: string;
  currentStage: string;
  finalistsCount: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  video?: VideoDto | null;
  hasApplied: boolean;
  applicationStatus?: "EN_ATTENTE" | "VALIDE" | "REFUSEE" | null;
  isAccepted: boolean;
}

export interface ListEmissionsQuery {
  isActive?: boolean;
  /** Statut métier de l'émission (ex. APPROUVEE, EN_ATTENTE). */
  status?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

export interface ListEmissionEditionsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListPeopleGroupsQuery {
  page?: number;
  limit?: number;
}

export interface ListEmissionCategoriesQuery {
  editionId?: string;
  page?: number;
  limit?: number;
}

export interface ListEmissionTagsQuery {
  categoryId?: string;
  editionId?: string;
  page?: number;
  limit?: number;
}

/** POST /emission/editions/:editionId/apply */
export interface ApplyToEditionBodyDto {
  pseudo: string;
  candidateName: string;
  candidatePreName: string;
  /** API field name (ISO date, ex: 2002-05-18). */
  age: string;
  candidatePicture: string;
  description: string;
  videoId: string;
  countryId: string;
  residenceCountryId: string;
  categoryId: string;
  tagId: string;
  /** Documents justificatifs (CNI, autorisation, etc.) quand l'édition les exige. */
  documentUrls?: string[];
}

export interface ApplyToEditionResponseDto {
  id: string;
  editionId: string;
  video?: VideoDto | null;
  candidatePicture: string;
  description: string;
  candidateName?: string;
  candidatePreName?: string;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  status: string;
  isFinalist?: boolean;
  totalVotes?: number;
  finalistVotes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyToEditionEnvelopeDto {
  success: boolean;
  message: string;
  data: ApplyToEditionResponseDto;
}

export interface EditionCandidateUserDto {
  id?: string;
  userId?: string;
  lastName: string;
  firstName: string;
  pseudo: string;
  /** Âge en années si fourni par l’API. */
  age?: number | null;
  /** ISO date — utilisé pour calculer l’âge si `age` est absent. */
  dateOfBirth?: string | null;
}

export interface EditionCandidateCategoryDto {
  category: {
    id: string;
    name: string;
    code: string;
    active: boolean;
    sortOrder: number;
  };
  tags: EmissionCategoryTagDto[];
}

/** Candidature rattachée à une édition (GET /emission/editions/:id). */
export interface EditionCandidateDto {
  id: string;
  editionId: string;
  userId?: string;
  video?: VideoDto | null;
  candidatePicture: string;
  description: string;
  candidateName?: string;
  candidatePreName?: string;
  documentUrls?: string[] | null;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  age?: number | null;
  status: string;
  isFinalist: boolean;
  totalVotes: number;
  finalistVotes: number;
  quizPoints?: number;
  createdAt: string;
  updatedAt: string;
  user: EditionCandidateUserDto;
  /** Référentiel candidature (si inclus par l’API). */
  category?: { id: string; name: string } | null;
  tag?: { id: string; name: string } | null;
}

/** GET /emission/candidates/:id — candidat + édition imbriquée. */
export interface EmissionCandidateDetailDto {
  id: string;
  editionId: string;
  video?: VideoDto | null;
  videoId?: string | null;
  candidatePicture: string;
  description: string;
  candidateName?: string;
  candidatePreName?: string;
  documentUrls?: string[] | null;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  age?: number | null;
  status: string;
  isFinalist: boolean;
  totalVotes: number;
  finalistVotes?: number;
  quizPoints?: number;
  createdAt: string;
  updatedAt: string;
  user: EditionCandidateUserDto;
  edition: EditionRankingEditionMetaDto;
  /** Référentiel candidature (si inclus par l'API). */
  category?: { id: string; name: string; code?: string } | null;
  tag?: { id: string; name: string; code?: string } | null;
}

export interface EmissionCandidateDetailEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionCandidateDetailDto;
}

/** Détail complet d’une édition (candidates + finalists + méta). */
export interface EditionFullDetailDto {
  id: string;
  emissionId: string;
  emissionName: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  description: string;
  lots: EditionLotDto[];
  gameRules: string;
  principles: string;
  sponsors: EditionSponsorDto[];
  video?: VideoDto | null;
  status: string;
  isPublic?: boolean;
  currentStage: string;
  finalistsCount?: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  stageStartDate?: string | null;
  stageEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
  hasApplied?: boolean;
  applicationStatus?: "EN_ATTENTE" | "VALIDE" | "REFUSEE" | null;
  isAccepted: boolean;
  myCandidateId?: string | null;
  candidateCategories?: EditionCandidateCategoryDto[];
  candidates: EditionCandidateDto[];
  finalists: EditionCandidateDto[];
}

export interface EditionFullDetailEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionFullDetailDto;
}

/** Métadonnées d’édition renvoyées avec le classement. */
export interface EditionRankingEditionMetaDto {
  id: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  isPaidEdition?: boolean;
  status: string;
  currentStage: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  lots: EditionLotDto[];
  gameRules: string;
  principles: string;
  sponsors: EditionSponsorDto[];
  video?: VideoDto | null;
}

/** Entrée de classement : même schéma candidat + rang officiel. */
export interface EditionRankingCandidateDto extends EditionCandidateDto {
  rank: number;
}

export interface EditionQuizzesEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionQuizPlayableDto[];
}

export interface EditionFreeDailyQuizEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionQuizPlayableDto;
}

export interface EditionQuizPaidAttemptEnvelopeDto {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface EditionQuizSubmitAnswerDto {
  questionId: string;
  answerId?: string;
  answerIds?: string[];
  textAnswer?: string;
}

export interface EditionQuizSubmitBodyDto {
  candidateId: string;
  answers: EditionQuizSubmitAnswerDto[];
}

export interface EditionQuizSubmitEnvelopeDto {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface EditionRankingEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionRankingCandidateDto[];
  pagination: ApiPaginationDto;
  edition: EditionRankingEditionMetaDto;
}

export interface ListEditionRankingQuery {
  page?: number;
  limit?: number;
}

export interface ListEditionCandidatesQuery {
  page?: number;
  limit?: number;
  tagId?: string;
}

export interface EditionCandidatesDataDto {
  requireDocuments: boolean;
  candidates: EditionCandidateDto[];
}

export interface EditionCandidatesEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionCandidatesDataDto;
  pagination: ApiPaginationDto;
}

/** POST …/candidates/:id/vote/initiate */
export type VotePaymentProvider = "MTN" | "MOOV" | "WAVE" | "ORANGE";

export interface VoteInitiateBodyDto {
  voteCount: number;
  provider: VotePaymentProvider;
  amountPerVote: number;
  phoneNumber: string;
}

export interface VoteInitiateTransactionDto {
  id: string;
  transactionType: string;
  provider: string;
  amount: number;
  status: string;
  reference: string;
  phoneNumber: string;
  paymentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VoteInitiateEnvelopeDto {
  success: boolean;
  message: string;
  data: VoteInitiateTransactionDto;
}

/** POST …/candidates/:id/vote */
export interface VoteConfirmBodyDto {
  transactionId: string;
  voteCount: number;
}

export interface VoteRecordDto {
  id: string;
  editionId: string;
  candidateId: string;
  userId: string;
  transactionId: string;
  createdAt: string;
}

export interface VoteConfirmEnvelopeDto {
  success: boolean;
  message: string;
  data: VoteRecordDto[];
}
