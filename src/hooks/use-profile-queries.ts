import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthUser, mergeAuthUserFromProfile } from '../lib/auth/auth-storage'
import { mergeProfileUpdate } from '../lib/merge-profile-update'
import type { UpdateStudentProfileBodyDto } from '../lib/api/modules/profile/profile.types'
import { profileApi } from '../services/api-client'
import { candidatureQueryKeys } from './use-candidature-queries'

export const profileQueryKeys = {
  student: ['profile', 'student'] as const,
}

export function useStudentProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileQueryKeys.student,
    queryFn: () => profileApi.getUser(),
    enabled,
    staleTime: 60_000,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateStudentProfileBodyDto) => profileApi.updateUser(body),
    onSuccess: (profile, submitted) => {
      const current = getAuthUser()
      if (current) {
        mergeAuthUserFromProfile(mergeProfileUpdate(current, profile, submitted))
      } else {
        mergeAuthUserFromProfile(profile)
      }
      void queryClient.invalidateQueries({ queryKey: candidatureQueryKeys.authSession })
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.student })
    },
  })
}
