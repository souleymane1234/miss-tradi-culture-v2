import './Footer.css'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6'

const CURRENT_YEAR = new Date().getFullYear()

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com', label: 'Facebook', icon: FaFacebookF },
  { href: 'https://www.instagram.com', label: 'Instagram', icon: FaInstagram },
  { href: 'https://www.tiktok.com', label: 'TikTok', icon: FaTiktok },
  { href: 'https://www.youtube.com', label: 'YouTube', icon: FaYoutube },
] as const

const FOOTER_COLUMNS = [
  {
    title: 'Pages',
    links: [
      { href: '#accueil', label: 'Accueil' },
      { href: '#concours', label: 'Le concours' },
      { href: '#actualites', label: 'Actualites' },
      // { href: '#application', label: 'Application' },
      { href: '#contact', label: 'Contact' },
    ],
  },
  {
    title: 'Partenaires',
    links: [
      { href: '#partenaires', label: 'Nos sponsors' },
      { href: '#partenariat', label: 'Devenir partenaire' },
      { href: '#actualites', label: 'Espace presse' },
      { href: '#concours', label: 'Galerie 2026' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { href: '#contact', label: 'Apparitions des talents' },
      { href: '#contact', label: 'Sponsoring et marque' },
      { href: '#contact', label: 'Questions generales' },
      { href: '#contact', label: 'Informations voyage' },
      { href: '#contact', label: 'Licences de diffusion' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="site-footer" aria-label="Pied de page">
      <div className="site-footer__main">
        <section className="site-footer__brand" aria-label="Marque Miss Tradi Culture">
          <a className="site-footer__brand-logo" href="#accueil" aria-label="Accueil">
            <img src="/logo.png" alt="Miss Tradi Culture" width={88} height={88} />
          </a>
          <ul className="site-footer__socials" aria-label="Reseaux sociaux">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="site-footer__columns">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} className="site-footer__column" aria-label={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          <a href="#contact">Politique de confidentialite</a>
          <a href="#contact">Conditions d'utilisation</a>
          <a href="#contact">Politique de cookies</a>
        </div>
        <p className="site-footer__copy">
          {CURRENT_YEAR} Miss Tradi Culture. Tous droits reserves.
        </p>
      </div>

      <a className="site-footer__to-top" href="#accueil" aria-label="Retour en haut">
        ^
      </a>
    </footer>
  )
}
