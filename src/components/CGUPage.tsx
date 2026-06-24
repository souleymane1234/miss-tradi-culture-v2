import './ConcoursPage.css'
import './MentionsLegalesPage.css'

const ARTICLES = [
  {
    title: 'ARTICLE 1 : Acceptation',
    body: [
      "Les présentes conditions générales d'utilisation (CGU) encadrent l'accès et l'utilisation du site https://www.booztech.com/. Toute utilisation du site implique l'acceptation totale et sans réserve des présentes conditions.",
      "En cas de non-acceptation, l'utilisateur doit renoncer à l'accès aux services. BOOZ-TECH se réserve le droit de modifier les CGU à tout moment.",
    ],
  },
  {
    title: 'ARTICLE 2 : Accès au site',
    body: [
      "Le site est accessible gratuitement à tout utilisateur disposant d'un accès internet. Les frais d'accès restent à la charge de l'utilisateur.",
      "L'utilisateur est responsable de ses identifiants et de la mise à jour de ses informations. BOOZ-TECH peut suspendre ou supprimer un compte en cas de non-respect des règles.",
    ],
  },
  {
    title: 'ARTICLE 3 : Collecte des données',
    body: [
      "Le site collecte des données personnelles nécessaires à la création du compte et à l'utilisation des services : adresse IP, email, informations de profil, données de navigation, etc.",
    ],
  },
  {
    title: 'ARTICLE 4 : Utilisateur Premium',
    body: [
      "Les utilisateurs premium bénéficient d'avantages exclusifs : accès à la WebTV, contenus exclusifs, participation à des projets cinématographiques, castings, et autres services.",
    ],
  },
  {
    title: 'ARTICLE 5 : Propriété intellectuelle',
    body: [
      'Tous les contenus du site sont protégés par le droit d\'auteur. Toute reproduction ou exploitation sans autorisation est interdite.',
      "L'utilisateur accorde à BOOZ-TECH un droit d'exploitation des contenus publiés sur la plateforme pour une durée de 5 ans.",
    ],
  },
  {
    title: 'ARTICLE 6 : Responsabilité',
    body: [
      "Le site ne garantit pas l'absence d'erreurs et décline toute responsabilité en cas de dommage lié à son utilisation.",
    ],
  },
  {
    title: 'ARTICLE 7 : Liens hypertextes',
    body: [
      'Les liens externes présents sur le site ne sont pas sous le contrôle de BOOZ-TECH.',
    ],
  },
  {
    title: 'ARTICLE 8 : Protection des mineurs',
    body: [
      'Les mineurs doivent utiliser le site sous la supervision de leurs représentants légaux.',
    ],
  },
  {
    title: 'ARTICLE 9 : Droit applicable',
    body: [
      "Les présentes CGU sont soumises au droit ivoirien. En cas de litige, les tribunaux d'Abidjan sont compétents.",
    ],
  },
] as const

export function CGUPage() {
  return (
    <main className="concours-page mentions-legales-page" aria-labelledby="cgu-title">
      <section className="concours-page__section concours-page__hero mentions-legales-page__hero">
        <div className="concours-page__inner mentions-legales-page__inner">
          <p className="concours-page__eyebrow">Informations légales</p>
          <h1 id="cgu-title">Conditions Générales d&apos;Utilisation</h1>
          <p className="concours-page__lead">
            Règles d&apos;accès et d&apos;utilisation de la plateforme Miss Tradi Culture
            opérée par BOOZ-TECH.
          </p>
        </div>
      </section>

      <section className="concours-page__section mentions-legales-page__content">
        <div className="concours-page__inner mentions-legales-page__inner">
          <div className="mentions-legales-page__sections">
            {ARTICLES.map((article) => (
              <article key={article.title} className="mentions-legales-page__block">
                <h2>{article.title}</h2>
                {article.body.map((paragraph) => (
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
