import { useEffect, useMemo, useRef, useState } from 'react'
import { USE_MOCK_NEWS } from '../config/app-config'
import { isNewsRateLimitError, useNewsFeedInfinite } from '../hooks/use-news-queries'
import { mapFeedItemsToCards, type NewsFeedCard } from '../lib/map-news'
import './ActualitesPage.css'

const MOCK_PAGE_SIZE = 5

const MOCK_FEED: NewsFeedCard[] = [
  {
    id: 'p-1',
    type: 'post',
    author: 'Comite Miss Tradi Culture',
    role: 'Compte officiel',
    time: 'Il y a 2 h',
    isoDate: '2026-05-19T09:07:00.000Z',
    title: 'Pre-inscriptions 2026',
    text: 'Les pre-inscriptions 2026 sont ouvertes. Merci de verifier les conditions et le dossier de candidature avant envoi.',
    imageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    imageAlt: 'Affiche Miss Tradi Culture',
    likes: 248,
    reads: 1820,
    slug: 'pre-inscriptions-2026',
    detailHref: '/actualites/pre-inscriptions-2026',
  },
  {
    id: 'p-2',
    type: 'post',
    author: 'Equipe Communication',
    role: 'Actualite evenement',
    time: 'Il y a 4 h',
    isoDate: '2026-02-20T09:20:00.000Z',
    title: 'Soiree de presentation',
    text: 'Retour en images sur la soiree de presentation des candidates. Merci a tous les partenaires pour le soutien.',
    imageSrc: '/banner%20pub%20miss%20tradi.jpg',
    imageAlt: 'Banniere publicitaire Miss Tradi',
    likes: 179,
    reads: 1460,
    slug: 'soiree-presentation',
    detailHref: '/actualites/soiree-presentation',
  },
  {
    id: 'a-1',
    type: 'ad',
    label: 'Sponsorise',
    title: 'Espace publicitaire',
    text: 'Votre marque peut apparaitre dans le fil officiel Miss Tradi Culture.',
    imageSrc: '/affuche%20pub%20miss%20tradi.jpg',
    imageAlt: 'Publicite Miss Tradi Culture',
    cta: 'Devenir partenaire',
    href: '/partenariat',
  },
]

export function ActualitesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [mockVisible, setMockVisible] = useState(MOCK_PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadMoreLockRef = useRef(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 600)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const feedQuery = useNewsFeedInfinite({ search })
  const fetchNextPageRef = useRef(feedQuery.fetchNextPage)
  fetchNextPageRef.current = feedQuery.fetchNextPage

  const apiItems = useMemo(() => {
    if (!feedQuery.data) return []
    return feedQuery.data.pages.flatMap((page) => mapFeedItemsToCards(page.data))
  }, [feedQuery.data])

  const mockItems = useMemo(() => MOCK_FEED.slice(0, mockVisible), [mockVisible])

  const items = USE_MOCK_NEWS ? mockItems : apiItems
  const hasMore = USE_MOCK_NEWS
    ? mockVisible < MOCK_FEED.length
    : Boolean(feedQuery.hasNextPage)

  const isLoading = !USE_MOCK_NEWS && feedQuery.isLoading
  const isError = !USE_MOCK_NEWS && feedQuery.isError
  const isRateLimited = isError && isNewsRateLimitError(feedQuery.error)
  const isFetchingMore = !USE_MOCK_NEWS && feedQuery.isFetchingNextPage

  useEffect(() => {
    if (!feedQuery.isFetchingNextPage) {
      loadMoreLockRef.current = false
    }
  }, [feedQuery.isFetchingNextPage])

  useEffect(() => {
    const target = sentinelRef.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return

        if (USE_MOCK_NEWS) {
          setMockVisible((n) => Math.min(n + MOCK_PAGE_SIZE, MOCK_FEED.length))
          return
        }

        if (loadMoreLockRef.current || !feedQuery.hasNextPage || feedQuery.isFetchingNextPage) {
          return
        }

        loadMoreLockRef.current = true
        void fetchNextPageRef.current()
      },
      { rootMargin: '120px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, feedQuery.hasNextPage, feedQuery.isFetchingNextPage])

  return (
    <main id="actualites" className="actu-page" aria-labelledby="actu-page-title">
      <div className="actu-page__layout">
        <aside className="actu-page__aside" aria-label="Publicites gauche">
          <article className="actu-side-ad">
            <p>Publicite</p>
            <img
              src="/affuche%20pub%20miss%20tradi.jpg"
              alt="Publicite Miss Tradi Culture"
              loading="lazy"
              decoding="async"
            />
            <a href="/partenariat">Reserver cet espace</a>
          </article>
        </aside>

        <div className="actu-page__inner">
          <header className="actu-page__header">
            <p className="actu-page__eyebrow">Actualites</p>
            <h1 id="actu-page-title">Fil officiel Miss Tradi Culture</h1>
            <p>
              Retrouvez toutes les publications, annonces et espaces publicitaires dans un fil
              continu.
            </p>

            {!USE_MOCK_NEWS && (
              <div className="actu-page__toolbar">
                <label className="actu-page__search">
                  <span className="visually-hidden">Rechercher une actualite</span>
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Rechercher une actualite…"
                    autoComplete="off"
                  />
                </label>
              </div>
            )}
          </header>

          {isLoading ? (
            <p className="actu-page__status">Chargement des actualites…</p>
          ) : null}

          {isError ? (
            <p className="actu-page__status actu-page__status--error" role="alert">
              {isRateLimited
                ? 'Trop de requetes vers le serveur. Patientez quelques secondes puis rechargez la page.'
                : 'Impossible de charger le fil. Verifiez votre connexion puis rechargez la page.'}
            </p>
          ) : null}

          {!isLoading && !isError && items.length === 0 ? (
            <p className="actu-page__status">Aucune actualite pour le moment.</p>
          ) : null}

          <ul className="actu-page__feed">
            {items.map((item) => (
              <li key={item.id}>
                {item.type === 'post' ? (
                  <article className="actu-card">
                    <div className="actu-card__top">
                      <div className="actu-card__avatar" aria-hidden="true">
                        {item.author.slice(0, 1)}
                      </div>
                      <div>
                        <p className="actu-card__author">{item.author}</p>
                        <p className="actu-card__meta">
                          {item.role}
                          {item.time ? ` · ${item.time}` : null}
                        </p>
                      </div>
                    </div>

                    <h2 className="actu-card__headline">{item.title}</h2>
                    <p className="actu-card__text">{item.text}</p>

                    {item.imageSrc ? (
                      <img
                        className="actu-card__image"
                        src={item.imageSrc}
                        alt={item.imageAlt ?? ''}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}

                    <div className="actu-card__stats">
                      {item.reads > 0 ? <span>{item.reads} lectures</span> : null}
                    </div>
                    <footer className="actu-card__footer">
                      <a className="actu-card__read" href={item.detailHref}>
                        Lire la publication
                      </a>
                    </footer>
                  </article>
                ) : (
                  <article className="actu-ad">
                    <p className="actu-ad__label">{item.label}</p>
                    <img
                      className="actu-ad__image"
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      loading="lazy"
                      decoding="async"
                    />
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.cta}
                    </a>
                  </article>
                )}
              </li>
            ))}
          </ul>

          <div className="actu-page__loading" aria-live="polite">
            {hasMore || isFetchingMore ? (
              <>
                <p>
                  {isFetchingMore
                    ? 'Chargement…'
                    : 'Faites defiler pour charger plus de publications…'}
                </p>
                <div ref={sentinelRef} className="actu-page__sentinel" aria-hidden="true" />
              </>
            ) : items.length > 0 ? (
              <p>Vous etes a jour.</p>
            ) : null}
          </div>
        </div>

        <aside className="actu-page__aside" aria-label="Publicites droite">
          <article className="actu-side-ad">
            <p>Annonce</p>
            <img
              src="/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg"
              alt="Affiche promotionnelle Miss Tradi Culture"
              loading="lazy"
              decoding="async"
            />
            <a href="/#contact">Nous contacter</a>
          </article>
        </aside>
      </div>
    </main>
  )
}
