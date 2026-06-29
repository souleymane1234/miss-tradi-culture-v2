import './Footer.css'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6'

const CURRENT_YEAR = new Date().getFullYear()

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com', label: 'Facebook', icon: FaFacebookF },
  { href: 'https://www.instagram.com', label: 'Instagram', icon: FaInstagram },
  { href: 'https://www.tiktok.com', label: 'TikTok', icon: FaTiktok },
  { href: 'https://www.youtube.com', label: 'YouTube', icon: FaYoutube },
] as const

export function Footer() {
  return (
    <footer className="site-footer" aria-label="Pied de page">
      <div className="site-footer__main">
        <section className="site-footer__brand" aria-label="Marque Miss Tradi-Culture ">
          <a className="site-footer__brand-logo" href="#accueil" aria-label="Accueil">
            <img src="/logo.png" alt="Miss Tradi-Culture " width={56} height={56} />
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
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          <a href="/politique-confidentialite">Politique de confidentialite</a>
          <a href="/cgu">Conditions d'utilisation</a>
          <a href="/politique-cookies">Politique de cookies</a>
          <a href="/mentions-legales">Mentions légales</a>
        </div>
        <p className="site-footer__copy">
          {CURRENT_YEAR} Miss Tradi-Culture . Tous droits reserves.
        </p>
      </div>

      <a className="site-footer__to-top" href="#accueil" aria-label="Retour en haut">
        ^
      </a>
    </footer>
  )
}
