import { getAuthUser } from '../lib/auth/auth-storage'
import { useIsAuthenticated, useLogoutMutation } from '../hooks/use-candidature-queries'
import './ProfilePage.css'

function displayName(user: ReturnType<typeof getAuthUser>): string {
  if (!user) return 'Utilisateur'
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return full || user.email.split('@')[0] || 'Utilisateur'
}

function initials(user: ReturnType<typeof getAuthUser>): string {
  if (!user) return '?'
  const first = user.firstName?.trim()?.[0] ?? ''
  const last = user.lastName?.trim()?.[0] ?? ''
  const fromName = `${first}${last}`.toUpperCase()
  if (fromName) return fromName
  return user.email.slice(0, 2).toUpperCase()
}

export function ProfilePage() {
  const { data: authenticated } = useIsAuthenticated()
  const logoutMutation = useLogoutMutation()
  const user = getAuthUser()

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

  return (
    <main className="profile-page" aria-labelledby="profile-title">
      <div className="profile-page__inner">
        <p className="profile-page__eyebrow">Espace personnel</p>
        <h1 id="profile-title">Mon profil</h1>

        <section className="profile-page__card" aria-label="Informations du compte">
          <div className="profile-page__avatar" aria-hidden="true">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" width={96} height={96} />
            ) : (
              <span>{initials(user)}</span>
            )}
          </div>

          <div className="profile-page__details">
            <h2>{displayName(user)}</h2>
            <dl className="profile-page__meta">
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              {user.firstName && (
                <div>
                  <dt>Prenom</dt>
                  <dd>{user.firstName}</dd>
                </div>
              )}
              {user.lastName && (
                <div>
                  <dt>Nom</dt>
                  <dd>{user.lastName}</dd>
                </div>
              )}
              {user.dateOfBirth && (
                <div>
                  <dt>Date de naissance</dt>
                  <dd>{user.dateOfBirth.slice(0, 10)}</dd>
                </div>
              )}
              {user.city && (
                <div>
                  <dt>Ville</dt>
                  <dd>{user.city}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        <div className="profile-page__actions">
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
      </div>
    </main>
  )
}
