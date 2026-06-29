import './ConcoursPage.css'
import './MentionsLegalesPage.css'

const SECTIONS = [
  {
    title: 'Introduction',
    body: [
      'Lors de la consultation de https://www.booztech.com/, des cookies peuvent être déposés sur votre appareil. Ils permettent notamment de vous identifier et d\'améliorer votre expérience utilisateur.',
    ],
  },
  {
    title: '1. À propos des cookies',
    body: [
      'Les cookies permettent de mémoriser vos préférences, faciliter la navigation et améliorer l\'expérience utilisateur. Ils peuvent être temporaires (session) ou persistants.',
    ],
  },
  {
    title: '2. Contenu d\'un cookie',
    body: [
      'Un cookie est un fichier texte contenant un identifiant unique et des informations anonymes permettant au site de reconnaître votre navigateur.',
    ],
  },
  {
    title: '3. Gestion des cookies',
    body: [
      'Vous pouvez bloquer ou supprimer les cookies via les paramètres de votre navigateur. Cependant, certaines fonctionnalités du site pourraient être limitées.',
    ],
  },
  {
    title: '4. Utilisation des cookies',
    body: [
      'Nous utilisons des cookies pour identifier les utilisateurs, améliorer les performances du site et personnaliser votre expérience.',
    ],
  },
  {
    title: '5. Types de cookies',
    body: [
      'Cookies nécessaires : indispensables au fonctionnement du site.',
      'Cookies de fonctionnalité : permettent de mémoriser vos préférences.',
      'Cookies de sécurité : protègent vos données et empêchent les fraudes.',
      'Cookies de performance : analysent l\'utilisation du site pour l\'améliorer.',
      'Cookies publicitaires : adaptent les contenus et publicités à vos intérêts.',
      'Cookies tiers : déposés par des services externes (YouTube, Facebook, etc.).',
    ],
  },
  {
    title: 'Marketing comportemental',
    body: [
      'Les cookies peuvent être utilisés pour afficher des contenus et publicités adaptés à vos centres d\'intérêt, sans identification personnelle directe.',
    ],
  },
  {
    title: 'Divulgation',
    body: [
      'Les données issues des cookies ne sont pas vendues et ne sont transmises que dans le cadre d\'obligations légales.',
    ],
  },
] as const

export function PolitiqueCookiesPage() {
  return (
    <main className="concours-page mentions-legales-page" aria-labelledby="cookies-title">
      <section className="concours-page__section concours-page__hero mentions-legales-page__hero">
        <div className="concours-page__inner mentions-legales-page__inner">
          <p className="concours-page__eyebrow">Informations légales</p>
          <h1 id="cookies-title">Politique de cookies</h1>
          <p className="concours-page__lead">
            Informations sur l&apos;utilisation des cookies sur Miss Tradi-Culture 
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
