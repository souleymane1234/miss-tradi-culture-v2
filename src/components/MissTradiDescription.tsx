import { useRevealOnView } from '../hooks/useRevealOnView'
import './MissTradiDescription.css'

export function MissTradiDescription() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      className={`mtd-desc${isVisible ? ' mtd-desc--visible' : ''}`}
      aria-labelledby="mtd-desc-title"
    >
      <div className="mtd-desc__inner">
        <div className="mtd-desc__headline">
          <div className="mtd-desc__headline-text">
            <p className="mtd-desc__eyebrow">À propos</p>
            <h2 id="mtd-desc-title" className="mtd-desc__title">
              Miss Tradi Culture
            </h2>
          </div>
          <a className="mtd-desc__cta-link" href="#concours">
            Découvrir le concours
          </a>
        </div>

        <p className="mtd-desc__summary">
          Concours qui célèbre beauté, élégance et traditions : nous valorisons
          le patrimoine vivant et offrons une vitrine aux jeunes femmes engagées
          pour leur territoire, entre transmission, fierté et événements
          fédérateurs.
        </p>

        <ul className="mtd-desc__highlights">
          <li>
            <span className="mtd-desc__highlight-label">Tradition</span>
            Coutumes, tenues et symboles de notre diversité.
          </li>
          <li>
            <span className="mtd-desc__highlight-label">Rayonnement</span>
            Visibilité pour projets et causes qui comptent.
          </li>
          <li>
            <span className="mtd-desc__highlight-label">Communauté</span>
            Liens candidates, partenaires et public.
          </li>
        </ul>
      </div>
    </section>
  )
}
