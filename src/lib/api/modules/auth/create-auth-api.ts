import type { HttpClient } from '../../ports/http-client.port'
import { AUTH_API_PATHS, type AuthApiPaths } from './auth.paths'
import { parseAuthSession } from './parse-auth-session'
import type {
  AuthEnvelopeDto,
  AuthSessionDto,
  LoginBodyDto,
  RefreshBodyDto,
  RegisterWithoutConfirmBodyDto,
} from './auth.types'

export interface AuthApi {
  login(body: LoginBodyDto): Promise<AuthSessionDto>
  registerWithoutConfirm(body: RegisterWithoutConfirmBodyDto): Promise<AuthSessionDto>
  refresh(body: RefreshBodyDto): Promise<AuthSessionDto>
}

function requireSession(res: unknown, context: string): AuthSessionDto {
  const session = parseAuthSession(res)
  if (!session) {
    throw new Error(`Reponse ${context} invalide.`)
  }
  return session
}

export function createAuthApi(http: HttpClient, paths: AuthApiPaths = AUTH_API_PATHS): AuthApi {
  return {
    async login(body) {
      const res = await http.request<AuthEnvelopeDto>({
        method: 'POST',
        path: paths.login,
        body,
      })
      return requireSession(res, 'de connexion')
    },

    async registerWithoutConfirm(body) {
      const res = await http.request<AuthEnvelopeDto>({
        method: 'POST',
        path: paths.registerWithoutConfirm,
        body,
      })
      return requireSession(res, "d'inscription")
    },

    async refresh(body) {
      const res = await http.request<AuthEnvelopeDto>({
        method: 'POST',
        path: paths.refresh,
        body,
      })
      return requireSession(res, 'de rafraichissement')
    },
  }
}
