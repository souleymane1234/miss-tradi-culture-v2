import { USE_MOCK_NEWS } from '../config/app-config'
import { isNewsRateLimitError, useNewsApercu } from '../hooks/use-news-queries'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './ActualitesAccess.css'

const ACTUALITES_VOIR_PLUS_HREF = '/actualites'

const APERCU_ACTUALITES = [
  {
    id: '1',
    imageSrc: 'https://picsum.photos/seed/mtc-act-1/640/400',
    imageAlt: 'Illustration — ouverture des inscriptions',
    category: 'Concours',
    date: '12 mars 2026',
    isoDate: '2026-03-12',
    title: 'Ouverture des inscriptions Miss Tradi-Culture  2026',
    excerpt:
      'Dossier, critères d’éligibilité et dates limites : tout ce qu’il faut savoir pour postuler.',
    href: `${ACTUALITES_VOIR_PLUS_HREF}#inscriptions`,
  },
  {
    id: '2',
    imageSrc: 'https://picsum.photos/seed/mtc-act-2/640/400',
    imageAlt: 'Illustration — soirée de présentation',
    category: 'Événement',
    date: '28 février 2026',
    isoDate: '2026-02-28',
    title: 'Soirée de présentation des candidates',
    excerpt:
      'Un moment fort entre tradition et modernité : ambiance, tenues et premières impressions du jury.',
    href: `${ACTUALITES_VOIR_PLUS_HREF}#evenements`,
  },
  {
    id: '3',
    imageSrc: 'https://picsum.photos/seed/mtc-act-3/640/400',
    imageAlt: 'Illustration — partenaires',
    category: 'Communiqué',
    date: '15 février 2026',
    isoDate: '2026-02-15',
    title: 'Nos partenaires renforcent l’édition 2026',
    excerpt:
      'Entreprises et associations qui soutiennent la visibilité du concours et des actions culturelles.',
    href: `${ACTUALITES_VOIR_PLUS_HREF}#partenaires`,
  },
] as const

export function ActualitesAccess() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  const newsQuery = useNewsApercu(3)

  const items = USE_MOCK_NEWS ? [...APERCU_ACTUALITES] : newsQuery.items

  return (
    <section
      ref={ref}
      id="actualites"
      className={`act-access${isVisible ? ' act-access--visible' : ''}`}
      aria-labelledby="act-access-title"
    >
      <div className="act-access__inner">
        <header className="act-access__header">
          <div className="act-access__headline">
            <p className="act-access__eyebrow">Restez informés</p>
            <h2 id="act-access-title" className="act-access__title">
              L&apos;actualité Miss Tradi-Culture 
            </h2>
          </div>
          <p className="act-access__intro">
            Annonces officielles, événements et coulisses du concours tout ce
            qui compte pour suivre l&apos;aventure au plus près.
          </p>
        </header>

        {newsQuery.isLoading && !USE_MOCK_NEWS ? (
          <p className="act-access__loading">Chargement des actualites…</p>
        ) : null}

        {newsQuery.isError && !USE_MOCK_NEWS ? (
          <p className="act-access__error" role="alert">
            {isNewsRateLimitError(newsQuery.error)
              ? 'Actualites temporairement indisponibles (limite serveur). Reessayez dans un instant.'
              : 'Impossible de charger les actualites pour le moment.'}
          </p>
        ) : null}

        <ul className="act-access__grid" id="actualites-apercu">
          {items.map((item) => (
            <li key={item.id} className="act-access__card-item">
              <article className="act-access__news-card">
                <div className="act-access__news-visual">
                  <img
                    className="act-access__news-img"
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    width={640}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="act-access__news-body">
                  <div className="act-access__news-meta">
                    <span className="act-access__news-cat">{item.category}</span>
                    <time dateTime={item.isoDate}>{item.date}</time>
                  </div>
                  <h3 className="act-access__news-title">{item.title}</h3>
                  <p className="act-access__news-excerpt">{item.excerpt}</p>
                  <a className="act-access__news-link" href={item.href}>
                    Lire la suite
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="act-access__actions">
          <a
            className="act-access__cta"
            href={ACTUALITES_VOIR_PLUS_HREF}
            id="actualites-voir-plus"
          >
            Voir plus d&apos;actualités
          </a>
        </div>
      </div>
    </section>
  )
}
