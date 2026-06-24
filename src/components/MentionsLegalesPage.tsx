import './ConcoursPage.css'
import './MentionsLegalesPage.css'

const SECTIONS = [
  {
    title: "1. Conditions d'utilisation",
    body: "L'utilisation du site implique l'acceptation pleine et entière des conditions générales d'utilisation. Celles-ci peuvent être modifiées à tout moment.",
  },
  {
    title: '2. Informations',
    body: "Les informations présentes sur le site sont fournies à titre indicatif et ne sauraient engager la responsabilité de BOOZ-TECH en cas d'erreur ou d'omission.",
  },
  {
    title: '3. Interactivité',
    body: 'Les utilisateurs peuvent publier du contenu sous leur responsabilité. BOOZ-TECH se réserve le droit de supprimer tout contenu non conforme sans préavis.',
  },
  {
    title: '4. Propriété intellectuelle',
    body: 'Tous les éléments du site sont protégés par le droit de propriété intellectuelle. Toute reproduction sans autorisation est interdite et constitue une contrefaçon.',
  },
  {
    title: '5. Liens',
    body: [
      'BOOZ-TECH décline toute responsabilité concernant les contenus accessibles via des liens externes.',
      'Les liens vers ce site sont autorisés sous réserve de respecter les règles définies et de ne pas créer de confusion.',
    ],
  },
  {
    title: '6. Confidentialité',
    body: "Chaque utilisateur dispose d'un droit d'accès, de rectification et d'opposition concernant ses données personnelles.",
  },
] as const

export function MentionsLegalesPage() {
  return (
    <main className="concours-page mentions-legales-page" aria-labelledby="mentions-legales-title">
      <section className="concours-page__section concours-page__hero mentions-legales-page__hero">
        <div className="concours-page__inner mentions-legales-page__inner">
          <p className="concours-page__eyebrow">Informations légales</p>
          <h1 id="mentions-legales-title">Mentions légales</h1>
          <p className="concours-page__lead">
            Conditions d&apos;utilisation, propriété intellectuelle et traitement des données
            personnelles sur Miss Tradi Culture.
          </p>
        </div>
      </section>

      <section className="concours-page__section mentions-legales-page__content">
        <div className="concours-page__inner mentions-legales-page__inner">
          <div className="mentions-legales-page__sections">
            {SECTIONS.map((section) => (
              <article key={section.title} className="mentions-legales-page__block">
                <h2>{section.title}</h2>
                {Array.isArray(section.body) ? (
                  section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>{section.body}</p>
                )}
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
