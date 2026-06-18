import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  persistAuthSession,
} from '../lib/auth/auth-storage'
import {
  createAppHttpClient,
  createAuthApi,
  createEmissionApi,
  createNewsApi,
  createReferentielApi,
  createUploadApi,
  createVideoApi,
} from '../lib/api'

const httpClient = createAppHttpClient({
  getToken: () => getAccessToken(),
  refreshAccessToken: async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null
    try {
      const authApi = createAuthApi(
        createAppHttpClient({ defaultHeaders: httpClientDefaultHeaders() }),
      )
      const session = await authApi.refresh({ refreshToken })
      persistAuthSession(session)
      return session.accessToken
    } catch {
      clearAuthTokens()
      return null
    }
  },
})

function httpClientDefaultHeaders(): Record<string, string> {
  const fromEnv: Record<string, string> = {}
  const apiKey = import.meta.env.VITE_API_KEY
  if (typeof apiKey === 'string' && apiKey.trim()) {
    fromEnv['X-Api-Key'] = apiKey.trim()
  }
  return fromEnv
}

export const authApi = createAuthApi(httpClient)
export const emissionApi = createEmissionApi(httpClient)
export const newsApi = createNewsApi(httpClient)
export const uploadApi = createUploadApi({ getToken: () => getAccessToken() })
export const videoApi = createVideoApi(httpClient)
export const referentielApi = createReferentielApi(httpClient)
