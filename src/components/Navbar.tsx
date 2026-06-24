import { useEffect, useState } from 'react'
import { isAuthenticated } from '../lib/auth/auth-storage'
import { useIsAuthenticated, useLogoutMutation } from '../hooks/use-candidature-queries'
import { AuthModal } from './AuthModal'
import './Navbar.css'

const SCROLL_SOLID_THRESHOLD_PX = 32

const NAV_LINKS = [
  { id: 'accueil', href: (homePrefix: string) => `${homePrefix}accueil`, label: 'Accueil' },
  { id: 'actualites', href: () => '/actualites', label: 'Actualites' },
  { id: 'concours', href: () => '/concours', label: 'Le concours' },
  { id: 'edition', href: () => '/edition', label: 'Edition' },
  { id: 'play', href: () => '/play', label: 'Play' },
  { id: 'partenariat', href: () => '/partenariat', label: 'Partenariat' },
  { id: 'contact', href: (homePrefix: string) => `${homePrefix}contact`, label: 'Contact' },
] as const

function isNavLinkActive(
  linkId: (typeof NAV_LINKS)[number]['id'],
  pathname: string,
  hash: string,
): boolean {
  const isHomePage = pathname === '/' || pathname === ''

  switch (linkId) {
    case 'accueil':
      return isHomePage && (!hash || hash === '#accueil')
    case 'contact':
      return isHomePage && hash === '#contact'
    case 'actualites':
      return pathname === '/actualites' || pathname.startsWith('/actualites/')
    case 'concours':
      return pathname.startsWith('/concours')
    case 'edition':
      return pathname.startsWith('/edition')
    case 'play':
      return pathname.startsWith('/play')
    case 'partenariat':
      return pathname.startsWith('/partenariat')
    default:
      return false
  }
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { data: authenticated = isAuthenticated() } = useIsAuthenticated()
  const logoutMutation = useLogoutMutation()

  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [hash, setHash] = useState(() => window.location.hash)
  const isActualitesPage =
    pathname === '/actualites' ||
    pathname === '/actualites/' ||
    /^\/actualites\/[^/]+\/?$/.test(pathname)
  const isConcoursPage = pathname.startsWith('/concours')
  const isEditionPage = pathname.startsWith('/edition')
  const isPlayPage = pathname.startsWith('/play')
  const isPartenariatPage = pathname.startsWith('/partenariat')
  const isVotePage = pathname.startsWith('/vote')
  const isProfilPage = pathname.startsWith('/profil')
  const isMentionsLegalesPage =
    pathname === '/mentions-legales' || pathname === '/mentions-legales/'
  const isCGUPage = pathname === '/cgu' || pathname === '/cgu/'
  const isPolitiqueCookiesPage =
    pathname === '/politique-cookies' || pathname === '/politique-cookies/'
  const isPolitiqueConfidentialitePage =
    pathname === '/politique-confidentialite' ||
    pathname === '/politique-confidentialite/'
  const homePrefix =
    isActualitesPage ||
    isConcoursPage ||
    isEditionPage ||
    isPlayPage ||
    isPartenariatPage ||
    isVotePage ||
    isProfilPage ||
    isMentionsLegalesPage ||
    isCGUPage ||
    isPolitiqueCookiesPage ||
    isPolitiqueConfidentialitePage
      ? '/#'
      : '#'
  useEffect(() => {
    const syncLocation = () => {
      setPathname(window.location.pathname)
      setHash(window.location.hash)
    }
    syncLocation()
    window.addEventListener('popstate', syncLocation)
    window.addEventListener('hashchange', syncLocation)
    return () => {
      window.removeEventListener('popstate', syncLocation)
      window.removeEventListener('hashchange', syncLocation)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isSolid =
    isActualitesPage ||
    isConcoursPage ||
    isPlayPage ||
    isPartenariatPage ||
    isVotePage ||
    isProfilPage ||
    isMentionsLegalesPage ||
    isCGUPage ||
    isPolitiqueCookiesPage ||
    isPolitiqueConfidentialitePage ||
    scrolled ||
    menuOpen

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setMenuOpen(false)
        if (isProfilPage) {
          window.location.href = '/'
        }
      },
    })
  }

  return (
    <>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <header className={`site-navbar${isSolid ? ' site-navbar--solid' : ''}`}>
        <a
          className="site-navbar__brand"
          href="/#accueil"
          onClick={() => setMenuOpen(false)}
        >
          <img
            className="site-navbar__logo"
            src="/logo.png"
            width={72}
            height={72}
            alt=""
          />
        </a>

        <button
          type="button"
          className="site-navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navbar-menu"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-navbar__toggle-bar" />
          <span className="site-navbar__toggle-bar" />
          <span className="site-navbar__toggle-bar" />
        </button>

        <nav
          id="site-navbar-menu"
          className={`site-navbar__nav${menuOpen ? ' site-navbar__nav--open' : ''}`}
          aria-label="Navigation principale"
        >
          <ul className="site-navbar__list">
            {NAV_LINKS.map((link) => {
              const href = link.href(homePrefix)
              const active = isNavLinkActive(link.id, pathname, hash)
              return (
                <li key={link.id}>
                  <a
                    className={`site-navbar__link${active ? ' site-navbar__link--active' : ''}`}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}

            {authenticated ? (
              <>
                <li>
                  <a
                    className={`site-navbar__link${isProfilPage ? ' site-navbar__link--active' : ''}`}
                    href="/profil"
                    onClick={() => setMenuOpen(false)}
                    aria-current={isProfilPage ? 'page' : undefined}
                  >
                    Profil
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className="site-navbar__btn site-navbar__btn--ghost"
                    disabled={logoutMutation.isPending}
                    onClick={handleLogout}
                  >
                    {logoutMutation.isPending ? 'Deconnexion…' : 'Deconnexion'}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  type="button"
                  className="site-navbar__btn site-navbar__btn--primary"
                  onClick={() => {
                    setMenuOpen(false)
                    setLoginOpen(true)
                  }}
                >
                  Connexion
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  )
}
