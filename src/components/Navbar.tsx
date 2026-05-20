import { useEffect, useState } from 'react'
import './Navbar.css'

const SCROLL_SOLID_THRESHOLD_PX = 32

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isActualitesPage = window.location.pathname.startsWith('/actualites')
  const isConcoursPage = window.location.pathname.startsWith('/concours')
  const isEditionPage = window.location.pathname.startsWith('/edition')
  const isPlayPage = window.location.pathname.startsWith('/play')
  const isPartenariatPage = window.location.pathname.startsWith('/partenariat')
  const isVotePage = window.location.pathname.startsWith('/vote')
  const homePrefix =
    isActualitesPage ||
    isConcoursPage ||
    isEditionPage ||
    isPlayPage ||
    isPartenariatPage ||
    isVotePage
      ? '/#'
      : '#'
  const navLinks = [
    { href: `${homePrefix}accueil`, label: 'Accueil' },
    // { href: `${homePrefix}application`, label: 'Application' },
    { href: '/actualites', label: 'Actualites' },
    { href: '/concours', label: 'Le concours' },
    { href: '/edition', label: 'Edition' },
    { href: '/play', label: 'Play' },
    { href: '/partenariat', label: 'Partenariat' },
    { href: `${homePrefix}contact`, label: 'Contact' },
  ] as const

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
    scrolled ||
    menuOpen

  return (
    <header
      className={`site-navbar${isSolid ? ' site-navbar--solid' : ''}`}
    >
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
        {/* <span className="site-navbar__title">Miss Tradi Culture</span> */}
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
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <a
                className="site-navbar__link"
                href={href}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
