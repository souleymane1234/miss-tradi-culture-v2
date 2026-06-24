import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { prefetchEmissionEditionDataDeduped } from '../lib/prefetch-emission-data'

/** Précharge les requêtes émission / édition en arrière-plan au lancement. */
export function EmissionDataPrefetch() {
  const queryClient = useQueryClient()

  useEffect(() => {
    void prefetchEmissionEditionDataDeduped(queryClient)
  }, [queryClient])

  return null
}
