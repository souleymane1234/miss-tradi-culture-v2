import { useRevealOnView } from '../hooks/useRevealOnView'
import './AdventureSection.css'

const AFFICHE_SRC = '/miss.jpg'

export function AdventureSection() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      id="candidature"
      className={`adv-section${isVisible ? ' adv-section--visible' : ''}`}
      aria-labelledby="adv-section-title"
    >
      <div className="adv-section__inner">
        <div className="adv-section__content">
          <p className="adv-section__eyebrow">L&apos;aventure d&apos;une vie</p>
          <h2 id="adv-section-title" className="adv-section__title">
            <span className="adv-section__title-line">Devenez la prochaine</span>
            <span className="adv-section__title-accent">Miss Tradi-Culture</span>
          </h2>
          <p className="adv-section__body">
            Osez vivre une expérience inoubliable. Découvrez les critères de
            candidature et lancez-vous dans la compétition prestigieuse.
          </p>
          <h3 className="adv-section__subhead">Comment postuler</h3>
          <p className="adv-section__apply-hint">
            Toutes les étapes et le dossier à fournir sont détaillés dans la
            rubrique concours.
          </p>
          <a className="adv-section__cta" href="/concours">
            Voir les critères et postuler
          </a>
        </div>
        <figure className="adv-section__figure">
          <img
            className="adv-section__img"
            src={AFFICHE_SRC}
            alt="Miss Tradi — comment postuler"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  )
}
