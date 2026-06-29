import { useMemo, useState } from 'react'
import { USE_MOCK_DATA } from '../config/app-config'
import {
  useEmissionEditionsCatalog,
  useResolvedEmission,
} from '../hooks/use-emission-queries'
import { HeroVideo } from './HeroVideo'
import { PromoBanner } from './PromoBanner'
import { SectionBridge } from './SectionBridge'
import { PartnersTrustCarousel } from './PartnersTrustCarousel'
import { CandidatureModal } from './CandidatureModal'
import './ConcoursPage.css'

const ETAPES = [
  'Phase 1 : Preselection',
  'Phase 2 : Telerealite',
  'Phase 3 : Competition',
  'Phase 4 : Caravane miss',
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
  const resolvedEmission = useResolvedEmission()
  const catalogQuery = useEmissionEditionsCatalog(
    USE_MOCK_DATA ? null : (resolvedEmission.emission?.id ?? null),
  )

  const applyEdition = useMemo(() => {
    const catalog = catalogQuery.data ?? []
    return catalog.find((e) => e.status === 'current') ?? catalog[0] ?? null
  }, [catalogQuery.data])

  return (
    <main className="concours-page" aria-labelledby="concours-title">
      <CandidatureModal
        open={candidatureOpen}
        onClose={() => setCandidatureOpen(false)}
        editionId={applyEdition?.editionId ?? null}
        editionTitle={applyEdition?.title}
        emissionTitle={resolvedEmission.emission?.title}
      />
      <HeroVideo />
      <PromoBanner />
      <SectionBridge variant="ribbon" />

      <section id="concours" className="concours-page__stack">
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

        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner">
            <p className="concours-page__eyebrow">Le concours</p>
            <h1 id="concours-title">Miss Tradi-Culture  2026</h1>
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
              alt="Affiche officielle Miss Tradi-Culture "
            />
          </div>
        </section>

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <h2>Les etapes du concours</h2>
            <div className="concours-page__timeline">
              {ETAPES.map((etape) => (
                <article key={etape} className="concours-page__step">
                  <h3>{etape}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge variant="ribbon" />

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
