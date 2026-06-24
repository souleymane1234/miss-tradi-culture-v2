import type { QueryClient } from '@tanstack/react-query'
import { USE_MOCK_DATA } from '../config/app-config'
import { emissionQueries } from './emission-query-options'
import type { EditionCatalogTab } from './map-emission'
import { resolveConfiguredEmissionId } from './resolve-latest-emission'

let prefetchInFlight: Promise<void> | null = null

function resolveEditionIdFromPath(catalog: EditionCatalogTab[]): string | null {
  const yearMatch = window.location.pathname.match(/^\/edition\/(\d{4})\/?$/)
  if (yearMatch) {
    const year = Number(yearMatch[1])
    return catalog.find((c) => c.year === year)?.editionId ?? null
  }
  if (window.location.pathname === '/edition' || window.location.pathname === '/edition/') {
    const current = catalog.find((c) => c.status === 'current') ?? catalog[0]
    return current?.editionId ?? null
  }
  return null
}

async function prefetchEditionChain(queryClient: QueryClient, editionId: string): Promise<void> {
  await queryClient.prefetchQuery(emissionQueries.editionDetail(editionId))
}

/** Précharge émission + catalogue + édition courante via React Query. */
export async function prefetchEmissionEditionData(queryClient: QueryClient): Promise<void> {
  if (USE_MOCK_DATA) return

  await queryClient.prefetchQuery(emissionQueries.list())

  const list = queryClient.getQueryData(emissionQueries.list().queryKey)
  const selected = list?.data ? resolveConfiguredEmissionId(list.data) : null
  if (!selected?.id) return

  const [catalog] = await Promise.all([
    queryClient.fetchQuery(emissionQueries.editionsCatalog(selected.id)),
    queryClient.prefetchQuery(emissionQueries.emission(selected.id)),
  ])

  const editionId =
    resolveEditionIdFromPath(catalog) ??
    catalog.find((c) => c.status === 'current')?.editionId ??
    catalog[0]?.editionId ??
    null

  if (!editionId) return

  await prefetchEditionChain(queryClient, editionId)
}

export function prefetchEmissionEditionDataDeduped(queryClient: QueryClient): Promise<void> {
  if (prefetchInFlight) return prefetchInFlight

  prefetchInFlight = prefetchEmissionEditionData(queryClient)
    .catch(() => {
      // la page gère son propre état de chargement
    })
    .finally(() => {
      prefetchInFlight = null
    })

  return prefetchInFlight
}

/** Précharge une édition (changement d'onglet année). */
export function prefetchEditionById(queryClient: QueryClient, editionId: string): Promise<void> {
  if (USE_MOCK_DATA || !editionId) return Promise.resolve()
  return prefetchEditionChain(queryClient, editionId)
}
