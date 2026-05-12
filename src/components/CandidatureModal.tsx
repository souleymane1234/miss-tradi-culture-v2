import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import './CandidatureModal.css'

type CandidatureModalProps = {
  open: boolean
  onClose: () => void
}

export function CandidatureModal({ open, onClose }: CandidatureModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [sent, setSent] = useState(false)

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
    if (open) {
      setSent(false)
      panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    }
  }, [open])

  const closeTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
    closeTimerRef.current = window.setTimeout(() => {
      onClose()
      setSent(false)
      closeTimerRef.current = undefined
    }, 2200)
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
        ref={panelRef}
        className="candidature-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="candidature-modal__close"
          onClick={onClose}
          aria-label="Fermer le formulaire"
        >
          ×
        </button>

        <header className="candidature-modal__header">
          <img
            className="candidature-modal__logo"
            src="/logo.png"
            alt=""
            width={64}
            height={64}
          />
          <div>
            <p className="candidature-modal__eyebrow">Miss Tradi Culture 2026</p>
            <h2 id={titleId} className="candidature-modal__title">
              Candidature
            </h2>
            <p className="candidature-modal__subtitle">
              Remplissez le formulaire ci-dessous. Notre equipe vous recontactera.
            </p>
          </div>
        </header>

        {sent ? (
          <div className="candidature-modal__success" role="status">
            <p className="candidature-modal__success-icon" aria-hidden="true">
              ✓
            </p>
            <p className="candidature-modal__success-title">Merci !</p>
            <p className="candidature-modal__success-text">
              Votre candidature a bien ete enregistree. Nous vous contacterons tres
              bientot.
            </p>
          </div>
        ) : (
        <form className="candidature-modal__form" onSubmit={onSubmit}>
          <div className="candidature-modal__row">
            <label className="candidature-modal__field">
              <span>Prenom</span>
              <input name="prenom" type="text" required autoComplete="given-name" />
            </label>
            <label className="candidature-modal__field">
              <span>Nom</span>
              <input name="nom" type="text" required autoComplete="family-name" />
            </label>
          </div>

          <div className="candidature-modal__row">
            <label className="candidature-modal__field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="candidature-modal__field">
              <span>Telephone</span>
              <input name="tel" type="tel" required autoComplete="tel" />
            </label>
          </div>

          <div className="candidature-modal__row">
            <label className="candidature-modal__field">
              <span>Date de naissance</span>
              <input name="naissance" type="date" required />
            </label>
            <label className="candidature-modal__field">
              <span>Ville</span>
              <input name="ville" type="text" required autoComplete="address-level2" />
            </label>
          </div>

          <label className="candidature-modal__field candidature-modal__field--full">
            <span>Region / pays</span>
            <input name="region" type="text" required />
          </label>

          <label className="candidature-modal__field candidature-modal__field--full">
            <span>Parlez-nous de vous (motivation, experience)</span>
            <textarea name="message" rows={4} required />
          </label>

          <label className="candidature-modal__check">
            <input name="accepte" type="checkbox" required />
            <span>
              J&apos;accepte le reglement du concours et la politique de confidentialite.
            </span>
          </label>

          <div className="candidature-modal__actions">
            <button type="button" className="candidature-modal__btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="candidature-modal__btn-primary">
              Envoyer ma candidature
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
