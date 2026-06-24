import type { HttpClient } from '../../ports/http-client.port'
import { PROFILE_API_PATHS, type ProfileApiPaths } from './profile.paths'
import { parseStudentProfileEnvelope } from './parse-student-profile'
import type {
  StudentProfileDto,
  StudentProfileEnvelopeDto,
  UpdateStudentProfileBodyDto,
} from './profile.types'

export interface ProfileApi {
  getUser(): Promise<StudentProfileDto>
  updateUser(body: UpdateStudentProfileBodyDto): Promise<StudentProfileDto>
}

function requireStudentProfile(res: unknown, context: string): StudentProfileDto {
  const profile = parseStudentProfileEnvelope(res)
  if (!profile) {
    throw new Error(`Reponse ${context} invalide.`)
  }
  return profile
}

export function createProfileApi(
  http: HttpClient,
  paths: ProfileApiPaths = PROFILE_API_PATHS,
): ProfileApi {
  return {
    async getUser() {
      const res = await http.request<StudentProfileEnvelopeDto>({
        method: 'GET',
        path: paths.getUser,
      })
      return requireStudentProfile(res, 'du profil')
    },

    async updateUser(body) {
      const res = await http.request<StudentProfileEnvelopeDto>({
        method: 'PUT',
        path: paths.updateUser,
        body,
      })
      return requireStudentProfile(res, 'de mise a jour du profil')
    },
  }
}
