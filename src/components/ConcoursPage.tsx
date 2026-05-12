import { useState } from 'react'
import { HeroVideo } from './HeroVideo'
import { PromoBanner } from './PromoBanner'
import { SectionBridge } from './SectionBridge'
import { PartnersTrustCarousel } from './PartnersTrustCarousel'
import { CandidatureModal } from './CandidatureModal'
import './ConcoursPage.css'

const ETAPES = [
  {
    titre: 'Pre-inscriptions',
    periode: 'Du 01 au 30 juin 2026',
    details: "Depot en ligne du dossier de candidature et verification d'eligibilite.",
  },
  {
    titre: 'Pre-selections regionales',
    periode: 'Juillet 2026',
    details: 'Castings regionaux et entretiens avec le comite de selection.',
  },
  {
    titre: 'Bootcamp des candidates',
    periode: 'Aout 2026',
    details: 'Formation scene, expression orale, culture generale et image publique.',
  },
  {
    titre: 'Grande finale',
    periode: 'Septembre 2026',
    details: 'Soiree officielle avec jury, partenaires et diffusion mediatique.',
  },
] as const

const CRITERES = [
  'Avoir 18 ans ou plus a la date de la finale.',
  'Partager les valeurs de culture, d’elegance et de leadership.',
  "Etre disponible pour les activites officielles du concours.",
  'Completer le dossier de candidature avec les pieces demandees.',
] as const

const FAQ = [
  {
    question: 'Comment deposer ma candidature ?',
    reponse:
      "Remplissez le formulaire en ligne puis joignez les pieces demandees. Vous recevrez un email de confirmation.",
  },
  {
    question: 'Le concours est-il ouvert a toutes les regions ?',
    reponse:
      'Oui. Les castings sont organises par zones et la finale regroupe les candidates retenues.',
  },
  {
    question: 'Puis-je devenir partenaire ou sponsor ?',
    reponse:
      "Oui. L'equipe partenariats propose des packs media et presence evenementielle.",
  },
] as const

export function ConcoursPage() {
  const [candidatureOpen, setCandidatureOpen] = useState(false)

  return (
    <main className="concours-page" aria-labelledby="concours-title">
      <CandidatureModal open={candidatureOpen} onClose={() => setCandidatureOpen(false)} />
      <HeroVideo />
      <PromoBanner />
      <SectionBridge variant="ribbon" />

      <section id="concours" className="concours-page__stack">
        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner">
            <p className="concours-page__eyebrow">Le concours</p>
            <h1 id="concours-title">Miss Tradi Culture 2026</h1>
            <p className="concours-page__lead">
              Une competition qui celebre la beaute, l&apos;elegance et
              l&apos;identite culturelle. Retrouvez le calendrier, les criteres et
              les informations officielles de participation.
            </p>
            <div className="concours-page__actions">
              <button
                type="button"
                className="concours-page__btn-primary"
                onClick={() => setCandidatureOpen(true)}
              >
                Deposer ma candidature
              </button>
              <a href="/actualites">Voir les actualites</a>
            </div>
            <img
              className="concours-page__hero-image"
              src="/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg"
              alt="Affiche officielle Miss Tradi Culture"
            />
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Les etapes du concours</h2>
            <div className="concours-page__timeline">
              {ETAPES.map((etape) => (
                <article key={etape.titre} className="concours-page__step">
                  <p className="concours-page__step-date">{etape.periode}</p>
                  <h3>{etape.titre}</h3>
                  <p>{etape.details}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Criteres de participation</h2>
            <ul className="concours-page__list">
              {CRITERES.map((critere) => (
                <li key={critere}>{critere}</li>
              ))}
            </ul>
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Partenariats et sponsoring</h2>
            <PartnersTrustCarousel />
            <p>
              Associez votre marque a un evenement a forte visibilite nationale
              et regionale.
            </p>
            <a className="concours-page__inline-link" href="/#partenariat">
              Devenir partenaire
            </a>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Questions frequentes</h2>
            <div className="concours-page__faq">
              {FAQ.map((item) => (
                <article key={item.question} className="concours-page__faq-item">
                  <h3>{item.question}</h3>
                  <p>{item.reponse}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
