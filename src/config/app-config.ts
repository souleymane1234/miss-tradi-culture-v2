function readEnvString(key: string): string | undefined {
  const value = import.meta.env[key as keyof ImportMetaEnv]
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return value.trim()
}

const emissionId = readEnvString('VITE_EMISSION_ID') ?? ''
const useMockFlag = readEnvString('VITE_USE_MOCK_DATA') === 'true'

/** Identifiant de l'émission Miss Tradi Culture côté API. */
export const EMISSION_ID = emissionId

/** Données locales éditions/votes uniquement si explicitement demandé. */
export const USE_MOCK_EDITIONS = useMockFlag

/** Alias historique — concerne éditions et votes uniquement. */
export const USE_MOCK_DATA = USE_MOCK_EDITIONS

/** Actualités mock uniquement si explicitement demandé (sinon API /api/v1/news). */
export const USE_MOCK_NEWS = useMockFlag

export const DEFAULT_VOTE_UNIT_PRICE = 10
