import './ConcoursPage.css'
import './MentionsLegalesPage.css'

const SECTIONS = [
  {
    title: 'Préambule',
    body: [
      'BOOZ-TECH met à disposition le site https://www.booztech.com/ afin de favoriser les interactions culturelles et audiovisuelles. Les utilisateurs peuvent consulter des offres et interagir via leur profil.',
    ],
  },
  {
    title: 'A. Introduction',
    body: [
      "La protection de vos données personnelles est essentielle. En utilisant ce site, vous acceptez l'utilisation de cookies et le traitement de vos données conformément à cette politique.",
    ],
  },
  {
    title: 'B. Collecte d\'informations',
    body: [
      'Nous collectons différentes données : adresse IP, localisation, navigateur, informations de profil, email, données de navigation, informations de paiement et contenus publiés.',
    ],
  },
  {
    title: 'C. Utilisation des données',
    body: [
      'Vos données sont utilisées pour gérer le site, personnaliser votre expérience, fournir les services, envoyer des notifications et améliorer la sécurité.',
      'Elles peuvent aussi servir à des communications marketing si vous y avez consenti.',
    ],
  },
  {
    title: 'D. Divulgation',
    body: [
      'Vos données peuvent être partagées avec nos employés, partenaires ou autorités légales uniquement lorsque cela est nécessaire.',
    ],
  },
  {
    title: 'E. Transferts internationaux',
    body: [
      'Les données publiées peuvent être accessibles mondialement via Internet.',
    ],
  },
  {
    title: 'F. Conservation',
    body: [
      'Vos données sont conservées uniquement pendant la durée nécessaire ou selon les obligations légales.',
    ],
  },
  {
    title: 'G. Sécurité',
    body: [
      'Nous mettons en place des mesures techniques pour protéger vos données, mais la transmission via Internet reste imparfaitement sécurisée.',
    ],
  },
  {
    title: 'H. Amendements',
    body: [
      'Cette politique peut être mise à jour à tout moment. Nous vous recommandons de la consulter régulièrement.',
    ],
  },
  {
    title: 'I. Vos droits',
    body: [
      "Conformément à la loi ivoirienne (n°2013-450), vous disposez des droits d'accès, de rectification, d'opposition et de suppression de vos données.",
    ],
  },
  {
    title: 'J. Sites tiers',
    body: [
      'Nous ne sommes pas responsables des politiques de confidentialité des sites externes liés.',
    ],
  },
  {
    title: 'K. Mise à jour',
    body: [
      'Vous pouvez demander la modification ou la mise à jour de vos informations personnelles à tout moment.',
    ],
  },
] as const

export function PolitiqueConfidentialitePage() {
  return (
    <main className="concours-page mentions-legales-page" aria-labelledby="confidentialite-title">
      <section className="concours-page__section concours-page__hero mentions-legales-page__hero">
        <div className="concours-page__inner mentions-legales-page__inner">
          <p className="concours-page__eyebrow">Informations légales</p>
          <h1 id="confidentialite-title">Politique de confidentialité</h1>
          <p className="concours-page__lead">
            Protection et traitement de vos données personnelles sur Miss Tradi Culture
            opéré par BOOZ-TECH.
          </p>
        </div>
      </section>

      <section className="concours-page__section mentions-legales-page__content">
        <div className="concours-page__inner mentions-legales-page__inner">
          <div className="mentions-legales-page__sections">
            {SECTIONS.map((section) => (
              <article key={section.title} className="mentions-legales-page__block">
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>

          <p className="mentions-legales-page__meta">
            Date de dernière modification : 16/04/2026 — © 2026 BOOZ-TECH. Tous droits réservés.
          </p>
        </div>
      </section>
    </main>
  )
}
