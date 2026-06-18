import type { EmissionCategoryDto, EmissionCategoryTagDto } from './api/modules/emission/emission.types'
import {
  FALLBACK_CATEGORIES,
  getFallbackTagsForCategory,
} from '../data/candidature-referentiel-fallback'
import { emissionRequest } from './emission-request'

const REFERENTIEL_LIMIT = 100

function sortCategories(items: EmissionCategoryDto[]): EmissionCategoryDto[] {
  return items.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function sortReferentielTags(tags: EmissionCategoryTagDto[]): EmissionCategoryTagDto[] {
  return tags.filter((t) => t.active).sort((a, b) => a.sortOrder - b.sortOrder)
}

/** Référentiel complet des catégories (indépendant de l'édition). */
export async function fetchReferentielCategories(): Promise<EmissionCategoryDto[]> {
  const res = await emissionRequest.listCategories({ page: 1, limit: REFERENTIEL_LIMIT })
  const list = sortCategories(res.data)
  return list.length > 0 ? list : FALLBACK_CATEGORIES
}

/** Tags actifs d'une catégorie (référentiel global). */
export async function fetchReferentielTags(categoryId: string): Promise<EmissionCategoryTagDto[]> {
  const res = await emissionRequest.listTags({
    categoryId,
    page: 1,
    limit: REFERENTIEL_LIMIT,
  })
  const list = sortReferentielTags(res.data)
  if (list.length > 0) return list
  return getFallbackTagsForCategory(categoryId)
}
