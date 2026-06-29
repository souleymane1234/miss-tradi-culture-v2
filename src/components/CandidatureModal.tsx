import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { USE_MOCK_DATA } from '../config/app-config'
import { validateVideoFileSize } from '../lib/upload-file-utils'
import { VideoLimitModal } from './VideoLimitModal'
import {
  formatFileSize,
  validateCandidaturePhotoFile,
  validateCandidatureVideoFile,
  CANDIDATURE_PHOTO_MAX_BYTES,
  CANDIDATURE_VIDEO_MAX_BYTES,
} from '../lib/candidature-utils'
import type { AuthUserDto } from '../lib/api'
import { ApiHttpError } from '../lib/api'
import { getAuthUser, isAuthenticated } from '../lib/auth/auth-storage'
import {
  useEmissionCategoriesQuery,
  useEmissionTagsQuery,
  useLoginMutation,
  useRegisterMutation,
  usePaysQuery,
  useSubmitCandidatureMutation,
} from '../hooks/use-candidature-queries'
import './CandidatureModal.css'

type CandidatureModalProps = {
  open: boolean
  onClose: () => void
  editionId: string | null
  editionTitle?: string
  emissionTitle?: string
}

type FormState = {
  pseudo: string
  candidatePreName: string
  candidateName: string
  birthDate: string
  description: string
  videoTitle: string
  countryId: string
  residenceCountryId: string
  categoryId: string
  tagId: string
}

const EMPTY_FORM: FormState = {
  pseudo: '',
  candidatePreName: '',
  candidateName: '',
  birthDate: '',
  description: '',
  videoTitle: '',
  countryId: '',
  residenceCountryId: '',
  categoryId: '',
  tagId: '',
}

function prefillFormFromUser(user: AuthUserDto, prev: FormState): FormState {
  const birthDate = user.dateOfBirth?.slice(0, 10) ?? ''
  return {
    ...prev,
    candidatePreName: user.firstName?.trim() || prev.candidatePreName,
    candidateName: user.lastName?.trim() || prev.candidateName,
    birthDate: birthDate || prev.birthDate,
  }
}

function initialFormState(): FormState {
  const user = getAuthUser()
  if (isAuthenticated() && user) {
    return prefillFormFromUser(user, { ...EMPTY_FORM })
  }
  return { ...EMPTY_FORM }
}

function computeAgeFromBirthDate(birthDate: string): number {
  if (!birthDate.trim()) return 0
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDelta = today.getMonth() - birth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return Math.max(0, age)
}

export function CandidatureModal({
  open,
  onClose,
  editionId,
  editionTitle,
  emissionTitle,
}: CandidatureModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerFirstName, setRegisterFirstName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [videoLimitMessage, setVideoLimitMessage] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const refsEnabled = open && !USE_MOCK_DATA

  const paysQuery = usePaysQuery(refsEnabled)
  const categoriesQuery = useEmissionCategoriesQuery(refsEnabled)
  const tagsQuery = useEmissionTagsQuery(form.categoryId || null)
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const submitMutation = useSubmitCandidatureMutation()

  const tagsForCategory = useMemo(() => {
    if (USE_MOCK_DATA) return [{ id: 'mock-tag', name: 'Baoule' }]
    if (tagsQuery.data && tagsQuery.data.length > 0) return tagsQuery.data
    const cat = categoriesQuery.data?.find((c) => c.id === form.categoryId)
    return (cat?.tags ?? []).filter((t) => t.active).sort((a, b) => a.sortOrder - b.sortOrder)
  }, [categoriesQuery.data, form.categoryId, tagsQuery.data])

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
    setForm((prev) => ({ ...prev, categoryId: '', tagId: '' }))
  }, [open])

  useEffect(() => {
    if (open) {
      setSent(false)
      setError(null)
      setAuthMode('login')
      setForm(initialFormState())
      setPhotoFile(null)
      setVideoFile(null)
      setAuthenticated(isAuthenticated())
      if (photoInputRef.current) photoInputRef.current.value = ''
      if (videoInputRef.current) videoInputRef.current.value = ''
      panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  const handlePhotoFileChange = (file: File | null) => {
    if (!file) {
      setPhotoFile(null)
      return
    }
    const validationError = validateCandidaturePhotoFile(file)
    if (validationError) {
      setError(validationError)
      if (photoInputRef.current) photoInputRef.current.value = ''
      return
    }
    setError(null)
    setPhotoFile(file)
  }

  const handleVideoFileChange = (file: File | null) => {
    if (!file) {
      setVideoFile(null)
      return
    }
    const sizeError = validateVideoFileSize(file)
    if (sizeError) {
      setVideoLimitMessage(sizeError)
      if (videoInputRef.current) videoInputRef.current.value = ''
      return
    }
    const validationError = validateCandidatureVideoFile(file)
    if (validationError) {
      setError(validationError)
      if (videoInputRef.current) videoInputRef.current.value = ''
      return
    }
    setError(null)
    setVideoFile(file)
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'categoryId') next.tagId = ''
      return next
    })
  }

  const handleAuthSuccess = (user?: AuthUserDto | null) => {
    setAuthenticated(true)
    if (user) {
      setForm((prev) => prefillFormFromUser(user, prev))
    }
  }

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      const session = await loginMutation.mutateAsync({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      handleAuthSuccess(session.user)
    } catch (err) {
      setError(
        err instanceof ApiHttpError ? err.message : 'Connexion impossible. Verifiez vos identifiants.',
      )
    }
  }

  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      const session = await registerMutation.mutateAsync({
        email: loginEmail.trim(),
        password: loginPassword,
        firstName: registerFirstName.trim() || undefined,
        lastName: registerLastName.trim() || undefined,
      })
      handleAuthSuccess(session.user)
    } catch (err) {
      setError(
        err instanceof ApiHttpError
          ? err.message
          : 'Inscription impossible. Verifiez les champs ou utilisez un autre email.',
      )
    }
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!editionId && !USE_MOCK_DATA) {
      setError('Aucune edition ouverte pour les candidatures.')
      return
    }

    if (!authenticated && !USE_MOCK_DATA) {
      setError('Connectez-vous pour deposer votre candidature.')
      return
    }

    const candidateAge = computeAgeFromBirthDate(form.birthDate)
    if (candidateAge < 18) {
      setError('Candidature refusee : vous devez avoir au moins 18 ans pour participer au concours.')
      return
    }

    if (!USE_MOCK_DATA) {
      if (!photoFile) {
        setError('Veuillez selectionner une photo portrait.')
        return
      }
      if (!videoFile) {
        setError('Veuillez selectionner une video de presentation.')
        return
      }
      const photoErr = validateCandidaturePhotoFile(photoFile)
      if (photoErr) {
        setError(photoErr)
        return
      }
      const videoErr = validateCandidatureVideoFile(videoFile)
      if (videoErr) {
        setError(videoErr)
        return
      }
    }

    try {
      await submitMutation.mutateAsync({
        editionId: editionId ?? 'mock-edition',
        form: {
          ...form,
          photoFile:
            photoFile ??
            new File([new Uint8Array([0])], 'demo.jpg', { type: 'image/jpeg' }),
          videoFile:
            videoFile ??
            new File([new Uint8Array([0])], 'demo.mp4', { type: 'video/mp4' }),
        },
      })
      setSent(true)
      window.setTimeout(() => {
        onClose()
        setSent(false)
      }, 2800)
    } catch (err) {
      setError(
        err instanceof ApiHttpError
          ? err.message
          : 'Envoi impossible. Verifiez les champs et reessayez.',
      )
    }
  }

  if (!open) return null

  const showLogin = !authenticated && !USE_MOCK_DATA
  const loadingRefs =
    paysQuery.isLoading ||
    categoriesQuery.isLoading ||
    (Boolean(form.categoryId) && tagsQuery.isLoading)

  return (
    <>
      {videoLimitMessage && (
        <VideoLimitModal
          message={videoLimitMessage}
          onClose={() => setVideoLimitMessage(null)}
        />
      )}

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
            <p className="candidature-modal__eyebrow">
              {emissionTitle ?? 'Miss Tradi-Culture '}
            </p>
            <h2 id={titleId} className="candidature-modal__title">
              Candidature
            </h2>
            <p className="candidature-modal__subtitle">
              {editionTitle
                ? `Edition : ${editionTitle}`
                : 'Remplissez le formulaire pour postuler a l\'edition en cours.'}
            </p>
          </div>
        </header>

        {error && (
          <p className="candidature-modal__error" role="alert">
            {error}
          </p>
        )}

        {sent ? (
          <div className="candidature-modal__success" role="status">
            <p className="candidature-modal__success-icon" aria-hidden="true">
              ✓
            </p>
            <p className="candidature-modal__success-title">Merci !</p>
            <p className="candidature-modal__success-text">
              Votre candidature a bien ete soumise. Elle sera examinee par le comite.
            </p>
          </div>
        ) : showLogin ? (
          <>
            <div className="candidature-modal__auth-tabs" role="tablist" aria-label="Authentification">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                className={`candidature-modal__auth-tab${authMode === 'login' ? ' candidature-modal__auth-tab--active' : ''}`}
                onClick={() => {
                  setAuthMode('login')
                  setError(null)
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
                  setError(null)
                }}
              >
                Inscription
              </button>
            </div>

            <form
              className="candidature-modal__form"
              onSubmit={authMode === 'login' ? onLogin : onRegister}
            >
              <p className="candidature-modal__hint">
                {authMode === 'login'
                  ? 'Connectez-vous avec votre compte Missplayce pour deposer une candidature.'
                  : 'Creez un compte etude pour postuler. Aucune verification email requise.'}
              </p>

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
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </label>
              <label className="candidature-modal__field candidature-modal__field--full">
                <span>Mot de passe</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </label>
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
          </>
        ) : (
          <form className="candidature-modal__form" onSubmit={onSubmit}>
            {loadingRefs && !USE_MOCK_DATA && (
              <p className="candidature-modal__hint">Chargement des listes…</p>
            )}

            <label className="candidature-modal__field candidature-modal__field--full">
              <span>Pseudo / nom de scene</span>
              <input
                required
                value={form.pseudo}
                onChange={(e) => updateField('pseudo', e.target.value)}
                autoComplete="nickname"
              />
            </label>

            <div className="candidature-modal__row">
              <label className="candidature-modal__field">
                <span>Prenom</span>
                <input
                  required
                  value={form.candidatePreName}
                  onChange={(e) => updateField('candidatePreName', e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className="candidature-modal__field">
                <span>Nom</span>
                <input
                  required
                  value={form.candidateName}
                  onChange={(e) => updateField('candidateName', e.target.value)}
                  autoComplete="family-name"
                />
              </label>
            </div>

            <div className="candidature-modal__row">
              <label className="candidature-modal__field">
                <span>Date de naissance</span>
                <input
                  type="date"
                  required
                  value={form.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                />
              </label>
            </div>

            <div className="candidature-modal__file-block">
              <label className="candidature-modal__field candidature-modal__field--full">
                <span>Photo portrait (max {formatFileSize(CANDIDATURE_PHOTO_MAX_BYTES)})</span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required={!USE_MOCK_DATA}
                  onChange={(e) => handlePhotoFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {photoFile && (
                <p className="candidature-modal__file-meta">
                  {photoFile.name} · {formatFileSize(photoFile.size)}
                </p>
              )}
              {photoPreviewUrl && (
                <img
                  className="candidature-modal__photo-preview"
                  src={photoPreviewUrl}
                  alt="Apercu portrait"
                />
              )}
            </div>

            <div className="candidature-modal__file-block">
              <label className="candidature-modal__field candidature-modal__field--full">
                <span>
                  Video de presentation (max {formatFileSize(CANDIDATURE_VIDEO_MAX_BYTES)})
                </span>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                  required={!USE_MOCK_DATA}
                  onChange={(e) => handleVideoFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {videoFile && (
                <p className="candidature-modal__file-meta">
                  {videoFile.name} · {formatFileSize(videoFile.size)}
                </p>
              )}
            </div>

            <label className="candidature-modal__field candidature-modal__field--full">
              <span>Titre de la video de presentation</span>
              <input
                required
                value={form.videoTitle}
                onChange={(e) => updateField('videoTitle', e.target.value)}
                placeholder="Ma video de candidature"
              />
            </label>

            <div className="candidature-modal__row">
              <label className="candidature-modal__field">
                <span>Pays d&apos;origine</span>
                <select
                  required
                  value={form.countryId}
                  onChange={(e) => updateField('countryId', e.target.value)}
                  disabled={USE_MOCK_DATA || paysQuery.isLoading}
                >
                  <option value="">
                    {paysQuery.isLoading ? 'Chargement…' : 'Choisir…'}
                  </option>
                  {(USE_MOCK_DATA
                    ? [
                        { id: 'ci', name: "Cote d'Ivoire" },
                        { id: 'fr', name: 'France' },
                      ]
                    : (paysQuery.data ?? [])
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {!USE_MOCK_DATA && paysQuery.isError && (
                  <span className="candidature-modal__field-hint candidature-modal__field-hint--error">
                    Impossible de charger les pays.
                  </span>
                )}
              </label>
              <label className="candidature-modal__field">
                <span>Pays de residence</span>
                <select
                  required
                  value={form.residenceCountryId}
                  onChange={(e) => updateField('residenceCountryId', e.target.value)}
                  disabled={USE_MOCK_DATA || paysQuery.isLoading}
                >
                  <option value="">
                    {paysQuery.isLoading ? 'Chargement…' : 'Choisir…'}
                  </option>
                  {(USE_MOCK_DATA
                    ? [
                        { id: 'ci', name: "Cote d'Ivoire" },
                        { id: 'fr', name: 'France' },
                      ]
                    : (paysQuery.data ?? [])
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="candidature-modal__row">
              <label className="candidature-modal__field">
                <span>Tradition / categorie</span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  disabled={USE_MOCK_DATA || categoriesQuery.isLoading}
                >
                  <option value="">
                    {categoriesQuery.isLoading ? 'Chargement…' : 'Choisir…'}
                  </option>
                  {(USE_MOCK_DATA
                    ? [{ id: 'mock-cat', name: 'Akan', tags: [{ id: 'mock-tag', name: 'Baoule' }] }]
                    : (categoriesQuery.data ?? [])
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {!USE_MOCK_DATA && categoriesQuery.isError && (
                  <span className="candidature-modal__field-hint candidature-modal__field-hint--error">
                    Impossible de charger les categories.
                  </span>
                )}
              </label>
              <label className="candidature-modal__field">
                <span>Ethnie / tag</span>
                <select
                  required
                  value={form.tagId}
                  onChange={(e) => updateField('tagId', e.target.value)}
                  disabled={
                    USE_MOCK_DATA
                      ? !form.categoryId
                      : !form.categoryId || tagsQuery.isLoading
                  }
                >
                  <option value="">Choisir…</option>
                  {(USE_MOCK_DATA
                    ? [{ id: 'mock-tag', name: 'Baoule' }]
                    : tagsForCategory
                  ).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="candidature-modal__field candidature-modal__field--full">
              <span>Presentation / motivation</span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
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
              <button
                type="submit"
                className="candidature-modal__btn-primary"
                disabled={submitMutation.isPending || (!editionId && !USE_MOCK_DATA)}
              >
                {submitMutation.isPending ? 'Envoi…' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  )
}
