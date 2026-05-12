import { HeroVideo } from './HeroVideo'
import { PromoBanner } from './PromoBanner'
import { SectionBridge } from './SectionBridge'
import { PartnersTrustCarousel } from './PartnersTrustCarousel'
import './ConcoursPage.css'
import './PartenariatPage.css'

const PACKS = [
  {
    titre: 'Partenaire Bronze',
    points: ['Logo sur le site', 'Mention reseaux sociaux', 'Acces espace presse'],
  },
  {
    titre: 'Partenaire Argent',
    points: ['Pack Bronze +', 'Stand sur village partenaires', 'Bandeau fil actualites'],
  },
  {
    titre: 'Partenaire Or',
    points: ['Pack Argent +', 'Naming segment TV / web', 'Hospitality finale'],
  },
] as const

export function PartenariatPage() {
  return (
    <main className="concours-page" aria-labelledby="partenariat-title">
      <HeroVideo />
      <PromoBanner />
      <SectionBridge variant="ribbon" />

      <section id="partenaires" className="concours-page__stack">
        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner">
            <p className="concours-page__eyebrow">Partenariat</p>
            <h1 id="partenariat-title">Associez votre marque a Miss Tradi Culture</h1>
            <p className="concours-page__lead">
              Visibilite nationale, resonance culturelle et public engage : le concours
              offre un cadre premium pour valoriser votre entreprise ou votre institution.
            </p>
            <div className="concours-page__actions">
              <a href="/#contact" className="partenariat-page__cta-link">
                Nous contacter
              </a>
              <a href="/concours">Decouvrir le concours</a>
            </div>
            <img
              className="concours-page__hero-image"
              src="/banner%20pub%20miss%20tradi.jpg"
              alt="Visuel partenariat Miss Tradi Culture"
            />
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Pourquoi nous rejoindre</h2>
            <ul className="concours-page__list">
              <li>Audience qualifiee et attachee aux valeurs de tradition et de modernite.</li>
              <li>Couverture mediatique et presence sur les reseaux tout au long de l&apos;edition.</li>
              <li>Evenements physiques : castings, soirees, finale et actions avec les candidates.</li>
              <li>Equipe dediee pour co-construire votre activation de marque.</li>
            </ul>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Nos packs partenaires</h2>
            <p className="partenariat-page__intro">
              Des formules modulables pour s&apos;adapter a vos objectifs de notoriete et
              d&apos;engagement.
            </p>
            <div className="partenariat-page__packs">
              {PACKS.map((pack) => (
                <article key={pack.titre} className="partenariat-page__pack">
                  <h3>{pack.titre}</h3>
                  <ul>
                    {pack.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge variant="wave" />

        <PartnersTrustCarousel includeAnchorId={false} />

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Comment ca se passe</h2>
            <div className="concours-page__timeline">
              <article className="concours-page__step">
                <p className="concours-page__step-date">Etape 1</p>
                <h3>Echange et brief</h3>
                <p>Nous definissons vos objectifs, votre cible et le niveau de visibilite souhaite.</p>
              </article>
              <article className="concours-page__step">
                <p className="concours-page__step-date">Etape 2</p>
                <h3>Proposition sur mesure</h3>
                <p>Devis clair avec supports media, evenementiel et contenus associes.</p>
              </article>
              <article className="concours-page__step">
                <p className="concours-page__step-date">Etape 3</p>
                <h3>Activation</h3>
                <p>Mise en ligne des contenus, suivi pendant le concours et bilan post-evenement.</p>
              </article>
            </div>
            <p className="partenariat-page__footer-cta">
              <a className="concours-page__inline-link" href="/#contact">
                Demander une proposition partenaire
              </a>
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
