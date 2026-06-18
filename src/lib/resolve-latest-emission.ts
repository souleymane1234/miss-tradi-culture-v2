import type { EmissionListItemDto } from './api/modules/emission/emission.types'
import { EMISSION_ID } from '../config/app-config'

function emissionTimestamp(item: EmissionListItemDto): number {
  const raw = item.updatedAt || item.createdAt
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Choisit l'émission publique la plus récente (priorité aux émissions avec éditions, puis Miss Tradi). */
export function pickLatestPublicEmission(items: EmissionListItemDto[]): EmissionListItemDto | null {
  const publicItems = items.filter((e) => e.isPublic)
  if (publicItems.length === 0) return null

  const withEditions = publicItems.filter((e) => e.editions.length > 0)
  const missTradi = (withEditions.length > 0 ? withEditions : publicItems).filter((e) =>
    /miss\s*tradi/i.test(e.title),
  )
  const pool = missTradi.length > 0 ? missTradi : withEditions.length > 0 ? withEditions : publicItems

  return [...pool].sort((a, b) => emissionTimestamp(b) - emissionTimestamp(a))[0] ?? null
}

export function resolveConfiguredEmissionId(
  items: EmissionListItemDto[],
): EmissionListItemDto | null {
  if (EMISSION_ID) {
    const forced = items.find((e) => e.id === EMISSION_ID)
    if (forced) return forced
  }
  return pickLatestPublicEmission(items)
}
