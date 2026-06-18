const STAGE_LABELS: Record<string, string> = {
  INSCRIPTION: 'Inscriptions ouvertes',
  PRESELECTION: 'Preselections',
  BOOTCAMP: 'Bootcamp',
  FINALE: 'Grande finale',
  CLOTURE: 'Edition cloturee',
}

export function formatEditionStage(stage: string | null | undefined): string | null {
  if (!stage?.trim()) return null
  return STAGE_LABELS[stage] ?? stage.replace(/_/g, ' ').toLowerCase()
}

export function formatFcfa(amount: number | null | undefined): string | null {
  if (amount == null) return null
  return `${amount.toLocaleString('fr-FR')} FCFA`
}
