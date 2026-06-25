import { ApiHttpError } from './api/errors/api-http-error'
import type { VotePaymentProvider } from './api/modules/vote/vote.types'

/** Code USSD Orange Money pour generer un OTP de paiement. */
export const ORANGE_PAYMENT_USSD_CODE = '#144*82#'

const VOTE_PHONE_RULES: Record<
  VotePaymentProvider,
  { pattern: RegExp; example: string; hint: string }
> = {
  mtnci: {
    pattern: /^05\d{8}$/,
    example: '0512345678',
    hint: 'MTN : 10 chiffres commencant par 05 (ex. 0512345678).',
  },
  moovci: {
    pattern: /^01\d{8}$/,
    example: '0112345678',
    hint: 'Moov : 10 chiffres commencant par 01 (ex. 0112345678).',
  },
  orangeci: {
    pattern: /^07\d{8}$/,
    example: '0712345678',
    hint: 'Orange : 10 chiffres commencant par 07 (ex. 0712345678).',
  },
  waveci: {
    pattern: /^0\d{9}$/,
    example: '0700000000',
    hint: 'Wave : 10 chiffres avec le 0 initial (ex. 0700000000).',
  },
}

const COUNTRY_DIAL_CODES: Record<string, string> = {
  CI: '225',
  BF: '226',
  ML: '223',
}

function countryIsoFromLabel(countryCodeLabel: string): string | null {
  const match = countryCodeLabel.match(/\(([A-Z]{2})\)/)
  return match?.[1] ?? null
}

/** Formate le numero pour l'API vote (ex. 0512345678 en Cote d'Ivoire). */
export function normalizeVotePhoneNumber(
  rawPhone: string,
  countryCodeLabel: string,
): string | null {
  let digits = rawPhone.replace(/\D/g, '')
  if (!digits) return null

  const iso = countryIsoFromLabel(countryCodeLabel)
  const dialCode = iso ? COUNTRY_DIAL_CODES[iso] : null

  if (dialCode && digits.startsWith(dialCode) && digits.length > dialCode.length) {
    digits = digits.slice(dialCode.length)
  }

  if (iso === 'CI') {
    if (digits.length === 9) digits = `0${digits}`
    if (digits.length !== 10 || !digits.startsWith('0')) return null
    return digits
  }

  if (digits.length < 8 || digits.length > 15) return null
  return digits
}

export function getVotePhoneHint(provider: VotePaymentProvider): string {
  return VOTE_PHONE_RULES[provider].hint
}

export function getVotePhoneExample(provider: VotePaymentProvider): string {
  return VOTE_PHONE_RULES[provider].example
}

export function validateVotePhoneForProvider(
  rawPhone: string,
  countryCodeLabel: string,
  provider: VotePaymentProvider,
): { phone: string } | { error: string } {
  const normalized = normalizeVotePhoneNumber(rawPhone, countryCodeLabel)
  if (!normalized) {
    return {
      error:
        'Numero invalide. En Cote d\'Ivoire, saisissez 10 chiffres avec le 0 initial.',
    }
  }

  const rule = VOTE_PHONE_RULES[provider]
  if (!rule.pattern.test(normalized)) {
    return { error: rule.hint }
  }

  return { phone: normalized }
}

export function clampVoteCount(count: number): number {
  return Math.max(1, Math.floor(count))
}

export function formatVotePaymentError(error: unknown, fallback: string): string {
  if (!ApiHttpError.isInstance(error)) {
    return error instanceof Error && error.message ? error.message : fallback
  }

  const body = error.responseBody
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    const rawMessage = record.message
    const messageItems = Array.isArray(rawMessage)
      ? rawMessage.map((item) => String(item).trim()).filter(Boolean)
      : typeof rawMessage === 'string' && rawMessage.trim()
        ? [rawMessage.trim()]
        : []
    const errors = Array.isArray(record.errors)
      ? record.errors.map((item) => String(item).trim()).filter(Boolean)
      : []
    const parts: string[] = []
    for (const item of [...messageItems, ...errors]) {
      if (!parts.includes(item)) parts.push(item)
    }
    if (parts.length > 0) {
      const text = parts.join(' — ')
      if (/montant/i.test(text)) {
        return `${text} Verifiez que voteAmountPerVote est configure sur l'edition (actuellement attendu cote API).`
      }
      return text
    }
  }

  return error.message || fallback
}

export function isVoteAmountInvalid(amountPerVote: number, voteCount: number): boolean {
  return amountPerVote <= 0 || voteCount <= 0
}

/** Tarif Mobile Money d'un vote (champ `voteAmountPerVote` sur l'édition). */
export function resolveVoteAmountPerVote(
  edition?: { voteAmountPerVote?: number | null } | null,
): number {
  const value = edition?.voteAmountPerVote
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }
  return 0
}
