import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { USE_MOCK_DATA } from '../config/app-config'
import { FALLBACK_PAYS } from '../data/candidature-referentiel-fallback'
import { persistAuthSession, isAuthenticated, clearAuthTokens } from '../lib/auth/auth-storage'
import { ApiHttpError } from '../lib/api'
import {
  fetchReferentielCategories,
  fetchReferentielTags,
} from '../lib/fetch-referentiel-candidature'
import { submitCandidature } from '../lib/submit-candidature'
import type { CandidatureFormInput } from '../lib/candidature-utils'
import { authApi, referentielApi } from '../services/api-client'

const REF_STALE_MS = 30 * 60_000

export const candidatureQueryKeys = {
  pays: ['referentiel', 'pays'] as const,
  categories: ['emission', 'referentiel', 'categories'] as const,
  tags: (categoryId: string | null) => ['emission', 'referentiel', 'tags', categoryId] as const,
  authSession: ['auth', 'session'] as const,
}

export function useIsAuthenticated() {
  return useQuery({
    queryKey: candidatureQueryKeys.authSession,
    queryFn: () => isAuthenticated(),
    staleTime: 0,
  })
}

function useAuthMutation<TInput>(
  mutationFn: (input: TInput) => ReturnType<typeof authApi.login>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: TInput) => {
      const session = await mutationFn(input)
      persistAuthSession(session)
      return session
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidatureQueryKeys.authSession })
    },
  })
}

export function useLoginMutation() {
  return useAuthMutation((input: { email: string; password: string }) => authApi.login(input))
}

export function useRegisterMutation() {
  return useAuthMutation(
    (input: { email: string; password: string; firstName?: string; lastName?: string }) =>
      authApi.registerWithoutConfirm(input),
  )
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      clearAuthTokens()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidatureQueryKeys.authSession })
    },
  })
}

export function usePaysQuery(enabled = true) {
  return useQuery({
    queryKey: candidatureQueryKeys.pays,
    queryFn: async () => {
      const res = await referentielApi.listPays()
      const list = res.data.filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      return list.length > 0 ? list : FALLBACK_PAYS
    },
    enabled: enabled && !USE_MOCK_DATA,
    staleTime: REF_STALE_MS,
  })
}

/** Catégories actives du référentiel (toujours la liste complète). */
export function useEmissionCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: candidatureQueryKeys.categories,
    queryFn: fetchReferentielCategories,
    enabled: enabled && !USE_MOCK_DATA,
    staleTime: REF_STALE_MS,
  })
}

/** Tags actifs d'une catégorie (référentiel global). */
export function useEmissionTagsQuery(categoryId: string | null) {
  return useQuery({
    queryKey: candidatureQueryKeys.tags(categoryId),
    queryFn: () => fetchReferentielTags(categoryId as string),
    enabled: !USE_MOCK_DATA && Boolean(categoryId),
    staleTime: REF_STALE_MS,
  })
}

export function useSubmitCandidatureMutation() {
  return useMutation({
    mutationFn: async (input: { editionId: string; form: CandidatureFormInput }) => {
      if (USE_MOCK_DATA) {
        await new Promise((r) => window.setTimeout(r, 600))
        return { success: true, message: 'Candidature enregistree (demo).' }
      }
      return submitCandidature(input.editionId, input.form)
    },
    retry: (count, error) => {
      if (ApiHttpError.isInstance(error) && (error.status === 401 || error.status === 400)) {
        return false
      }
      return count < 1
    },
  })
}
