import type { EmissionCategoryDto, EmissionCategoryTagDto } from '../lib/api/modules/emission/emission.types'
import type { PaysDto } from '../lib/api/modules/referentiel/referentiel.types'

const NOW = '2026-01-01T00:00:00.000Z'

/** Référentiel local utilisé si l'API ne renvoie aucune donnée. */
export const FALLBACK_PAYS: PaysDto[] = [
  { id: 'fb-pays-ci', code: 'CI', name: "Côte d'Ivoire", active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-fr', code: 'FR', name: 'France', active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-sn', code: 'SN', name: 'Sénégal', active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-ml', code: 'ML', name: 'Mali', active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-bf', code: 'BF', name: 'Burkina Faso', active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-gh', code: 'GH', name: 'Ghana', active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-gn', code: 'GN', name: 'Guinée', active: true, createdAt: NOW, updatedAt: NOW },
  { id: 'fb-pays-tg', code: 'TG', name: 'Togo', active: true, createdAt: NOW, updatedAt: NOW },
]

function tag(
  id: string,
  categoryId: string,
  name: string,
  code: string,
  sortOrder: number,
): EmissionCategoryTagDto {
  return { id, categoryId, name, code, active: true, sortOrder }
}

export const FALLBACK_CATEGORIES: EmissionCategoryDto[] = [
  {
    id: 'fb-cat-akan',
    name: 'Akan',
    code: 'AKAN',
    active: true,
    sortOrder: 1,
    tags: [
      tag('fb-tag-baoule', 'fb-cat-akan', 'Baoulé', 'BAOULE', 1),
      tag('fb-tag-agni', 'fb-cat-akan', 'Agni', 'AGNI', 2),
      tag('fb-tag-abbe', 'fb-cat-akan', 'Abbé', 'ABBE', 3),
      tag('fb-tag-attie', 'fb-cat-akan', 'Attié', 'ATTIE', 4),
    ],
  },
  {
    id: 'fb-cat-krou',
    name: 'Krou',
    code: 'KROU',
    active: true,
    sortOrder: 2,
    tags: [
      tag('fb-tag-bete', 'fb-cat-krou', 'Bété', 'BETE', 1),
      tag('fb-tag-we', 'fb-cat-krou', 'Wé', 'WE', 2),
      tag('fb-tag-dida', 'fb-cat-krou', 'Dida', 'DIDA', 3),
    ],
  },
  {
    id: 'fb-cat-mande',
    name: 'Mandé',
    code: 'MANDE',
    active: true,
    sortOrder: 3,
    tags: [
      tag('fb-tag-malinke', 'fb-cat-mande', 'Malinké', 'MALINKE', 1),
      tag('fb-tag-dioula', 'fb-cat-mande', 'Dioula', 'DIOULA', 2),
    ],
  },
  {
    id: 'fb-cat-gur',
    name: 'Gur',
    code: 'GUR',
    active: true,
    sortOrder: 4,
    tags: [
      tag('fb-tag-senoufo', 'fb-cat-gur', 'Sénoufo', 'SENOUFO', 1),
      tag('fb-tag-lobi', 'fb-cat-gur', 'Lobi', 'LOBI', 2),
    ],
  },
  {
    id: 'fb-cat-volta',
    name: 'Voltaïque',
    code: 'VOLTA',
    active: true,
    sortOrder: 5,
    tags: [
      tag('fb-tag-gouro', 'fb-cat-volta', 'Gouro', 'GURO', 1),
      tag('fb-tag-yaoure', 'fb-cat-volta', 'Yaouré', 'YAOURE', 2),
    ],
  },
]

export function getFallbackTagsForCategory(categoryId: string): EmissionCategoryTagDto[] {
  const category = FALLBACK_CATEGORIES.find((c) => c.id === categoryId)
  return category?.tags ?? []
}
