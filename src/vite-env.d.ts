/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TIMEOUT_MS?: string
  readonly VITE_API_ACCEPT_LANGUAGE?: string
  readonly VITE_API_KEY?: string
  readonly VITE_API_ACCESS_TOKEN?: string
  readonly VITE_EMISSION_ID?: string
  readonly VITE_USE_MOCK_DATA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
