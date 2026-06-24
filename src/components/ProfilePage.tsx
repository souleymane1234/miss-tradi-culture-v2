import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiHttpError } from '../lib/api'
import type { AuthUserDto } from '../lib/api/modules/auth/auth.types'
import type { UpdateStudentProfileBodyDto } from '../lib/api/modules/profile/profile.types'
import { getAuthUser, mergeAuthUserFromProfile } from '../lib/auth/auth-storage'
import { mergeProfileUpdate } from '../lib/merge-profile-update'
import { useIsAuthenticated, useLogoutMutation } from '../hooks/use-candidature-queries'
import { useStudentProfileQuery, useUpdateProfileMutation } from '../hooks/use-profile-queries'
import { uploadApi } from '../services/api-client'
import { SOCIAL_PLATFORM_OPTIONS } from '../lib/social-platform'
import { ProfileSocialLinks } from './ProfileSocialLinks'
import { ProfilePresentationVideo } from './ProfilePresentationVideo'
import './ProfilePage.css'

type SocialLinkFormItem = {
  platform: string
  url: string
}

type ProfileFormState = {
  firstName: string
  lastName: string
  phoneNumber: string
  bio: string
  videoPresentationUrl: string
  dateOfBirth: string
  gender: string
  nationality: string
  address: string
  city: string
  country: string
  profileImage: string
  coverImage: string
  interestsText: string
  academicLevel: string
  socialLinks: SocialLinkFormItem[]
}

function buildSocialLinks(user: AuthUserDto): SocialLinkFormItem[] {
  if (user.socialLinks?.length) {
    return user.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
    }))
  }
  return [{ platform: 'linkedin', url: '' }]
}

function buildSocialLinksFromPayload(
  submitted: UpdateStudentProfileBodyDto,
  fallback: SocialLinkFormItem[],
): SocialLinkFormItem[] {
  if (submitted.socialLinks?.length) {
    return submitted.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
    }))
  }
  return fallback
}

function buildInitialForm(user: AuthUserDto): ProfileFormState {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phoneNumber: user.phoneNumber ?? '',
    bio: user.bio ?? '',
    videoPresentationUrl: user.videoPresentationUrl ?? '',
    dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
    gender: user.gender ?? '',
    nationality: user.nationality ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    country: user.country ?? '',
    profileImage: user.profileImage ?? '',
    coverImage: user.coverImage ?? '',
    interestsText: (user.interests ?? []).join(', '),
    academicLevel: user.academicLevel ?? '',
    socialLinks: buildSocialLinks(user),
  }
}

function toUpdatePayload(form: ProfileFormState): UpdateStudentProfileBodyDto {
  const interests = form.interestsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const socialLinks = form.socialLinks
    .map((link) => ({
      platform: link.platform.trim() || 'linkedin',
      url: link.url.trim(),
    }))
    .filter((link) => link.url.length > 0)

  const payload: UpdateStudentProfileBodyDto = {
    firstName: form.firstName.trim() || undefined,
    lastName: form.lastName.trim() || undefined,
    phoneNumber: form.phoneNumber.trim() || undefined,
    bio: form.bio.trim() || undefined,
    videoPresentationUrl: form.videoPresentationUrl.trim() || undefined,
    dateOfBirth: form.dateOfBirth || undefined,
    gender: form.gender || undefined,
    nationality: form.nationality.trim() || undefined,
    address: form.address.trim() || undefined,
    city: form.city.trim() || undefined,
    country: form.country.trim() || undefined,
    profileImage: form.profileImage.trim() || undefined,
    coverImage: form.coverImage.trim() || undefined,
    academicLevel: form.academicLevel.trim() || undefined,
    interests: interests.length > 0 ? interests : undefined,
    socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
  }

  return payload
}

function displayName(user: AuthUserDto | null, form: ProfileFormState): string {
  const full = [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
  if (full) return full
  if (user?.email) return user.email.split('@')[0] ?? 'Utilisateur'
  return 'Utilisateur'
}

function initials(form: ProfileFormState, user: AuthUserDto | null): string {
  const first = form.firstName.trim()[0] ?? ''
  const last = form.lastName.trim()[0] ?? ''
  const fromName = `${first}${last}`.toUpperCase()
  if (fromName) return fromName
  return (user?.email ?? '?').slice(0, 2).toUpperCase()
}

export function ProfilePage() {
  const { data: authenticated } = useIsAuthenticated()
  const logoutMutation = useLogoutMutation()
  const updateMutation = useUpdateProfileMutation()
  const profileQuery = useStudentProfileQuery(Boolean(authenticated))

  const [form, setForm] = useState<ProfileFormState | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [uploadingField, setUploadingField] = useState<'profileImage' | 'coverImage' | 'video' | null>(
    null,
  )

  const user = useMemo(() => getAuthUser(), [authenticated, updateMutation.isSuccess, profileQuery.data])

  useEffect(() => {
    if (!authenticated) {
      setForm(null)
      return
    }

    const authUser = getAuthUser()
    if (!authUser) return

    if (profileQuery.isLoading) return

    if (profileQuery.data) {
      const merged = mergeProfileUpdate(authUser, profileQuery.data, {})
      mergeAuthUserFromProfile(merged)
      setForm(buildInitialForm(merged))
      return
    }

    if (profileQuery.isError) {
      setForm(buildInitialForm(authUser))
    }
  }, [authenticated, profileQuery.data, profileQuery.isLoading, profileQuery.isError])

  if (!authenticated || !user) {
    return (
      <main className="profile-page" aria-labelledby="profile-title">
        <div className="profile-page__inner">
          <h1 id="profile-title">Mon profil</h1>
          <p className="profile-page__lead">Connectez-vous pour acceder a votre espace personnel.</p>
          <a className="profile-page__btn-primary" href="/#accueil">
            Retour a l&apos;accueil
          </a>
        </div>
      </main>
    )
  }

  if (!form) {
    return (
      <main className="profile-page" aria-labelledby="profile-title">
        <div className="profile-page__inner">
          <h1 id="profile-title">Mon profil</h1>
          <p className="profile-page__lead">
            {profileQuery.isError
              ? 'Impossible de charger votre profil pour le moment.'
              : 'Chargement de votre profil…'}
          </p>
        </div>
      </main>
    )
  }

  const updateField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    setFeedback(null)
  }

  const updateSocialLink = (index: number, partial: Partial<SocialLinkFormItem>) => {
    setForm((prev) => {
      if (!prev) return prev
      const socialLinks = prev.socialLinks.map((link, i) =>
        i === index ? { ...link, ...partial } : link,
      )
      return { ...prev, socialLinks }
    })
    setFeedback(null)
  }

  const addSocialLink = () => {
    setForm((prev) => {
      if (!prev) return prev
      const usedPlatforms = new Set(prev.socialLinks.map((link) => link.platform))
      const nextPlatform =
        SOCIAL_PLATFORM_OPTIONS.find((option) => !usedPlatforms.has(option.value))?.value ??
        'linkedin'
      return {
        ...prev,
        socialLinks: [...prev.socialLinks, { platform: nextPlatform, url: '' }],
      }
    })
    setFeedback(null)
  }

  const removeSocialLink = (index: number) => {
    setForm((prev) => {
      if (!prev) return prev
      if (prev.socialLinks.length <= 1) {
        return { ...prev, socialLinks: [{ platform: 'linkedin', url: '' }] }
      }
      return {
        ...prev,
        socialLinks: prev.socialLinks.filter((_, i) => i !== index),
      }
    })
    setFeedback(null)
  }

  const handleFileUpload = async (
    field: 'profileImage' | 'coverImage' | 'videoPresentationUrl',
    file: File | undefined,
  ) => {
    if (!file) return
    setUploadingField(
      field === 'videoPresentationUrl' ? 'video' : field === 'profileImage' ? 'profileImage' : 'coverImage',
    )
    setFeedback(null)
    try {
      const url =
        field === 'videoPresentationUrl'
          ? await uploadApi.uploadVideo(file)
          : await uploadApi.uploadImage(file)
      updateField(field, url)
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof ApiHttpError
            ? err.message
            : 'Echec de l&apos;envoi du fichier. Reessayez.',
      })
    } finally {
      setUploadingField(null)
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)
    try {
      const payload = toUpdatePayload(form)
      await updateMutation.mutateAsync(payload)
      const savedUser = getAuthUser()
      if (savedUser) {
        const nextForm = buildInitialForm(savedUser)
        setForm({
          ...nextForm,
          socialLinks: buildSocialLinksFromPayload(payload, nextForm.socialLinks),
        })
      }
      setFeedback({ type: 'success', message: 'Profil mis a jour avec succes.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof ApiHttpError
            ? err.message
            : 'Impossible de mettre a jour le profil pour le moment.',
      })
    }
  }

  return (
    <main className="profile-page" aria-labelledby="profile-title">
      <div className="profile-page__inner">
        <p className="profile-page__eyebrow">Espace personnel</p>
        <h1 id="profile-title">Mon profil</h1>
        <p className="profile-page__lead">
          Mettez a jour vos informations personnelles et votre presentation.
        </p>

        <section className="profile-page__card profile-page__summary" aria-label="Apercu du profil">
          {form.coverImage.trim() && (
            <div className="profile-page__cover" aria-hidden="true">
              <img src={form.coverImage.trim()} alt="" />
            </div>
          )}

          <div className="profile-page__summary-body">
            <div className="profile-page__avatar" aria-hidden="true">
              {form.profileImage ? (
                <img src={form.profileImage} alt="" width={96} height={96} />
              ) : (
                <span>{initials(form, user)}</span>
              )}
            </div>
            <div className="profile-page__details">
              <h2>{displayName(user, form)}</h2>
              <p className="profile-page__email">{user.email}</p>
              <ProfileSocialLinks links={form.socialLinks} />
            </div>
          </div>

          {form.videoPresentationUrl.trim() && (
            <div className="profile-page__presentation">
              <p className="profile-page__presentation-label">Video de presentation</p>
              <ProfilePresentationVideo url={form.videoPresentationUrl} />
            </div>
          )}
        </section>

        {feedback && (
          <p
            className={`profile-page__feedback profile-page__feedback--${feedback.type}`}
            role="alert"
          >
            {feedback.message}
          </p>
        )}

        <form className="profile-page__form" onSubmit={onSubmit}>
          <section className="profile-page__section">
            <h3>Identite</h3>
            <div className="profile-page__grid">
              <label className="profile-page__field">
                <span>Prenom</span>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className="profile-page__field">
                <span>Nom</span>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  autoComplete="family-name"
                />
              </label>
              <label className="profile-page__field">
                <span>Telephone</span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  autoComplete="tel"
                  placeholder="+2250102030405"
                />
              </label>
              <label className="profile-page__field">
                <span>Date de naissance</span>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </label>
              <label className="profile-page__field">
                <span>Genre</span>
                <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                  <option value="">Choisir…</option>
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </label>
              <label className="profile-page__field">
                <span>Niveau academique</span>
                <input
                  type="text"
                  value={form.academicLevel}
                  onChange={(e) => updateField('academicLevel', e.target.value)}
                  placeholder="Licence 3"
                />
              </label>
            </div>
          </section>

          <section className="profile-page__section">
            <h3>Localisation</h3>
            <div className="profile-page__grid">
              <label className="profile-page__field profile-page__field--full">
                <span>Adresse</span>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  autoComplete="street-address"
                />
              </label>
              <label className="profile-page__field">
                <span>Ville</span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  autoComplete="address-level2"
                />
              </label>
              <label className="profile-page__field">
                <span>Pays</span>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  autoComplete="country-name"
                />
              </label>
              <label className="profile-page__field">
                <span>Nationalite</span>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="profile-page__section">
            <h3>Presentation</h3>
            <label className="profile-page__field profile-page__field--full">
              <span>Bio</span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Parlez de vous en quelques lignes…"
              />
            </label>
            <label className="profile-page__field profile-page__field--full">
              <span>Centres d&apos;interet</span>
              <input
                type="text"
                value={form.interestsText}
                onChange={(e) => updateField('interestsText', e.target.value)}
                placeholder="Informatique, Programmation, Intelligence Artificielle"
              />
            </label>
            <div className="profile-page__social-editor">
              <div className="profile-page__social-editor-head">
                <span>Reseaux sociaux</span>
                <ProfileSocialLinks
                  links={form.socialLinks}
                  className="profile-page__social-preview"
                />
              </div>

              <div className="profile-page__social-rows">
                {form.socialLinks.map((link, index) => (
                  <div className="profile-page__social-row" key={`social-${index}`}>
                    <label className="profile-page__field">
                      <span>Plateforme</span>
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, { platform: e.target.value })}
                      >
                        {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="profile-page__field">
                      <span>Lien du profil</span>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                        placeholder="https://..."
                      />
                    </label>
                    <button
                      type="button"
                      className="profile-page__social-remove"
                      onClick={() => removeSocialLink(index)}
                      aria-label={`Supprimer le reseau social ${index + 1}`}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="profile-page__social-add" onClick={addSocialLink}>
                + Ajouter un reseau social
              </button>
            </div>
          </section>

          <section className="profile-page__section">
            <h3>Medias</h3>
            <div className="profile-page__media-grid">
              <div className="profile-page__media-card">
                <span className="profile-page__media-label">Photo de profil</span>
                {form.profileImage && (
                  <img
                    className="profile-page__media-preview"
                    src={form.profileImage}
                    alt="Apercu photo de profil"
                  />
                )}
                <label className="profile-page__upload-btn">
                  {uploadingField === 'profileImage' ? 'Envoi…' : 'Choisir une image'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploadingField !== null}
                    onChange={(e) => void handleFileUpload('profileImage', e.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="profile-page__media-card">
                <span className="profile-page__media-label">Image de couverture</span>
                {form.coverImage && (
                  <img
                    className="profile-page__media-preview profile-page__media-preview--cover"
                    src={form.coverImage}
                    alt="Apercu couverture"
                  />
                )}
                <label className="profile-page__upload-btn">
                  {uploadingField === 'coverImage' ? 'Envoi…' : 'Choisir une image'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploadingField !== null}
                    onChange={(e) => void handleFileUpload('coverImage', e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            <label className="profile-page__field profile-page__field--full">
              <span>URL video de presentation</span>
              <input
                type="url"
                value={form.videoPresentationUrl}
                onChange={(e) => updateField('videoPresentationUrl', e.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="profile-page__upload-btn profile-page__upload-btn--inline">
              {uploadingField === 'video' ? 'Envoi video…' : 'Ou envoyer une video'}
              <input
                type="file"
                accept="video/*"
                hidden
                disabled={uploadingField !== null}
                onChange={(e) => void handleFileUpload('videoPresentationUrl', e.target.files?.[0])}
              />
            </label>
          </section>

          <div className="profile-page__actions">
            <button
              type="submit"
              className="profile-page__btn-primary"
              disabled={updateMutation.isPending || uploadingField !== null}
            >
              {updateMutation.isPending ? 'Enregistrement…' : 'Enregistrer le profil'}
            </button>
            <a className="profile-page__btn-secondary" href="/concours">
              Deposer une candidature
            </a>
            <button
              type="button"
              className="profile-page__btn-logout"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              {logoutMutation.isPending ? 'Deconnexion…' : 'Se deconnecter'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
