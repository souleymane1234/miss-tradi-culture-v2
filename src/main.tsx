import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EmissionDataPrefetch } from './components/EmissionDataPrefetch'
import { ApiHttpError } from './lib/api/errors/api-http-error'
import { EMISSION_GC_MS } from './lib/emission-query-options'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './index.css'
import App from './App.tsx'

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && (error.status === 429 || error.status === 401)) {
    return false
  }
  return failureCount < 1
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      gcTime: EMISSION_GC_MS,
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'mtd-react-query-cache',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: EMISSION_GC_MS,
      }}
    >
      <EmissionDataPrefetch />
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
