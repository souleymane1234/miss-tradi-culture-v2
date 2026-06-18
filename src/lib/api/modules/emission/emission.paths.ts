/**
 * Chemins relatifs à {@link ApiEnvironment.baseUrl} (sans slash final sur l’origine).
 */
export const EMISSION_API_PATHS = {
  collection: "/api/v1/emission",
  byId: (id: string) => `/api/v1/emission/${encodeURIComponent(id)}`,
  editions: (id: string) => `/api/v1/emission/${encodeURIComponent(id)}/editions`,
  activeEdition: (id: string) => `/api/v1/emission/${encodeURIComponent(id)}/active-edition`,
  /** Détail complet d’une édition (candidates, finalists, lots, etc.). */
  editionById: (editionId: string) => `/api/v1/emission/editions/${encodeURIComponent(editionId)}`,
  /** POST candidature à une édition (Bearer requis). */
  editionApply: (editionId: string) =>
    `/api/v1/emission/editions/${encodeURIComponent(editionId)}/apply`,
  /** Classement paginé des candidates (rangs serveur). */
  editionRanking: (editionId: string) =>
    `/api/v1/emission/editions/${encodeURIComponent(editionId)}/ranking`,
  /** Liste paginée des candidates d'une édition (status, catégorie, tag). */
  editionCandidates: (editionId: string) =>
    `/api/v1/emission/editions/${encodeURIComponent(editionId)}/candidates`,
  /** Quiz actifs d'une édition (JWT requis). */
  editionQuizzes: (editionId: string) =>
    `/api/v1/emission/editions/${encodeURIComponent(editionId)}/quizzes`,
  /** Quiz gratuit quotidien pour l'utilisateur connecté (JWT requis). */
  editionFreeDailyQuiz: (editionId: string) =>
    `/api/v1/emission/editions/${encodeURIComponent(editionId)}/quizzes/free-daily`,
  /** Acheter/enregistrer une tentative payée pour un quiz d'édition. */
  editionQuizPaidAttempt: (quizId: string) =>
    `/api/v1/emission/edition-quizzes/${encodeURIComponent(quizId)}/paid-attempt`,
  /** Soumettre les réponses d'un quiz d'édition. */
  editionQuizSubmit: (quizId: string) =>
    `/api/v1/emission/edition-quizzes/${encodeURIComponent(quizId)}/submit`,
  /** Détail d’une candidature par son id (lien /vote/:id sans query). */
  candidateById: (candidateId: string) =>
    `/api/v1/emission/candidates/${encodeURIComponent(candidateId)}`,
  candidateVoteInitiate: (candidateId: string) =>
    `/api/v1/emission/candidates/${encodeURIComponent(candidateId)}/vote/initiate`,
  candidateVoteConfirm: (candidateId: string) =>
    `/api/v1/emission/candidates/${encodeURIComponent(candidateId)}/vote`,
  peopleGroups: () => "/api/v1/emission/referentiel/people-groups",
  categories: () => "/api/v1/emission/referentiel/categories",
  tags: () => "/api/v1/emission/referentiel/tags",
} as const;

export type EmissionApiPaths = typeof EMISSION_API_PATHS;
