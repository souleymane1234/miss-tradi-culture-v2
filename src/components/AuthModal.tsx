import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { ApiHttpError } from '../lib/api'
import { useLoginMutation, useRegisterMutation } from '../hooks/use-candidature-queries'
import './CandidatureModal.css'

type AuthModalProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

type RegisterConsents = {
  cgu: boolean
  privacy: boolean
  cookies: boolean
  media: boolean
}

const EMPTY_CONSENTS: RegisterConsents = {
  cgu: false,
  privacy: false,
  cookies: false,
  media: false,
}

const REGISTER_CONSENT_ITEMS = [
  {
    key: 'cgu' as const,
    text: "J'accepte les Conditions Generales d'Utilisation et je declare en avoir pris connaissance*",
    linkLabel: 'Lire les CGU',
    href: '/#contact',
  },
  {
    key: 'privacy' as const,
    text: "J'accepte la politique de confidentialite et je declare en avoir pris connaissance*",
    linkLabel: 'Lire la politique de confidentialite',
    href: '/#contact',
  },
  {
    key: 'cookies' as const,
    text: "J'accepte la politique de cookies et je declare en avoir pris connaissance*",
    linkLabel: 'Lire la politique de cookies',
    href: '/#contact',
  },
  {
    key: 'media' as const,
    text: "J'autorise MISS TRADI CULTURE et partenaires a utiliser mes images et mes videos et leur garanti contre toutes reclamations provenant des droits des tiers*",
    linkLabel: 'Lire les mentions legales',
    href: '/#contact',
  },
] as const

function allConsentsAccepted(consents: RegisterConsents): boolean {
  return consents.cgu && consents.privacy && consents.cookies && consents.media
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const titleId = useId()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerFirstName, setRegisterFirstName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [consents, setConsents] = useState<RegisterConsents>(EMPTY_CONSENTS)
  const [error, setError] = useState<string | null>(null)
  const [consentError, setConsentError] = useState<string | null>(null)

  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleEscape)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = prev
    }
  }, [open, handleEscape])

  useEffect(() => {
    if (!open) return
    setAuthMode('login')
    setEmail('')
    setPassword('')
    setRegisterFirstName('')
    setRegisterLastName('')
    setConsents(EMPTY_CONSENTS)
    setError(null)
    setConsentError(null)
  }, [open])

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiHttpError ? err.message : 'Connexion impossible. Verifiez vos identifiants.',
      )
    }
  }

  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!allConsentsAccepted(consents)) {
      setConsentError('Toutes les mentions doivent etre cochees pour poursuivre l\'inscription.')
      return
    }
    setConsentError(null)
    try {
      await registerMutation.mutateAsync({
        email: email.trim(),
        password,
        firstName: registerFirstName.trim() || undefined,
        lastName: registerLastName.trim() || undefined,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiHttpError
          ? err.message
          : 'Inscription impossible. Verifiez les champs ou utilisez un autre email.',
      )
    }
  }

  if (!open) return null

  return (
    <div
      className="candidature-modal"
      role="presentation"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose()
      }}
    >
      <div
        className="candidature-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="candidature-modal__close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <header className="candidature-modal__header">
          <img className="candidature-modal__logo" src="/logo.png" alt="" width={64} height={64} />
          <div>
            <p className="candidature-modal__eyebrow">Miss Tradi Culture</p>
            <h2 id={titleId} className="candidature-modal__title">
              {authMode === 'login' ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="candidature-modal__subtitle">
              {authMode === 'login'
                ? 'Connectez-vous avec votre compte Missplayce.'
                : 'Creez un compte pour acceder a votre profil et postuler.'}
            </p>
          </div>
        </header>

        {error && (
          <p className="candidature-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="candidature-modal__auth-tabs" role="tablist" aria-label="Authentification">
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'login'}
            className={`candidature-modal__auth-tab${authMode === 'login' ? ' candidature-modal__auth-tab--active' : ''}`}
            onClick={() => {
              setAuthMode('login')
              setError(null)
              setConsentError(null)
            }}
          >
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'register'}
            className={`candidature-modal__auth-tab${authMode === 'register' ? ' candidature-modal__auth-tab--active' : ''}`}
            onClick={() => {
              setAuthMode('register')
              setConsents(EMPTY_CONSENTS)
              setError(null)
              setConsentError(null)
            }}
          >
            Inscription
          </button>
        </div>

        <form className="candidature-modal__form" onSubmit={authMode === 'login' ? onLogin : onRegister}>
          {authMode === 'register' && (
            <div className="candidature-modal__row">
              <label className="candidature-modal__field">
                <span>Prenom</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={registerFirstName}
                  onChange={(e) => setRegisterFirstName(e.target.value)}
                />
              </label>
              <label className="candidature-modal__field">
                <span>Nom</span>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={registerLastName}
                  onChange={(e) => setRegisterLastName(e.target.value)}
                />
              </label>
            </div>
          )}

          <label className="candidature-modal__field candidature-modal__field--full">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="candidature-modal__field candidature-modal__field--full">
            <span>Mot de passe</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {authMode === 'register' && (
            <div className="candidature-modal__consents">
              {REGISTER_CONSENT_ITEMS.map((item) => (
                <label key={item.key} className="candidature-modal__check">
                  <input
                    type="checkbox"
                    checked={consents[item.key]}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setConsents((prev) => {
                        const next = { ...prev, [item.key]: checked }
                        if (allConsentsAccepted(next)) {
                          setConsentError(null)
                        }
                        return next
                      })
                    }}
                  />
                  <span>
                    {item.text}{' '}
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.linkLabel}
                    </a>
                  </span>
                </label>
              ))}
              {consentError && (
                <p className="candidature-modal__consents-error" role="alert">
                  {consentError}
                </p>
              )}
              <p className="candidature-modal__consents-hint">
                Renseignez votre e-mail et votre mot de passe, puis cochez toutes les cases
                obligatoires.
              </p>
            </div>
          )}

          <div className="candidature-modal__actions">
            <button type="button" className="candidature-modal__btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="candidature-modal__btn-primary"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending
                ? 'Patientez…'
                : authMode === 'login'
                  ? 'Se connecter'
                  : 'Creer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
