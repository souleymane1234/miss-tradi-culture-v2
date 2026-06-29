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
    author: 'Comite Miss Tradi-Culture ',
    role: 'Compte officiel',
    time: 'Il y a 2 h',
    isoDate: '2026-05-19T09:07:00.000Z',
    title: 'Pre-inscriptions 2026',
    text: 'Les pre-inscriptions 2026 sont ouvertes. Merci de verifier les conditions et le dossier de candidature avant envoi.',
    imageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    imageAlt: 'Affiche Miss Tradi-Culture ',
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
    text: 'Votre marque peut apparaitre dans le fil officiel Miss Tradi-Culture .',
    imageSrc: '/affuche%20pub%20miss%20tradi.jpg',
    imageAlt: 'Publicite Miss Tradi-Culture ',
    cta: 'Devenir partenaire',
    href: '/partenariat',
  },
]

export function ActualitesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [mockVisible, setMockVisible] = useState(MOCK_PAGE_SIZE)
  const [shareMenuId, setShareMenuId] = useState<string | null>(null)
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null)
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

  useEffect(() => {
    if (!copiedShareId) return
    const timer = window.setTimeout(() => setCopiedShareId(null), 1800)
    return () => window.clearTimeout(timer)
  }, [copiedShareId])

  const toAbsoluteShareUrl = (href: string): string =>
    href.startsWith('http') ? href : `${window.location.origin}${href}`

  const buildShareLinks = (item: Extract<NewsFeedCard, { type: 'post' }>) => {
    const absoluteUrl = toAbsoluteShareUrl(item.detailHref)
    const text = `${item.title} — Miss Tradi-Culture`
    return {
      absoluteUrl,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${absoluteUrl}`)}`,
      facebook: `https://m.facebook.com/sharer.php?u=${encodeURIComponent(absoluteUrl)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(absoluteUrl)}`,
    }
  }

  const handleShare = (item: Extract<NewsFeedCard, { type: 'post' }>) => {
    setShareMenuId((current) => (current === item.id ? null : item.id))
  }

  const copyShareLink = async (item: Extract<NewsFeedCard, { type: 'post' }>) => {
    try {
      await navigator.clipboard.writeText(toAbsoluteShareUrl(item.detailHref))
      setCopiedShareId(item.id)
    } catch {
      setCopiedShareId(null)
    }
  }

  const renderShareMenu = (item: Extract<NewsFeedCard, { type: 'post' }>) => {
    const links = buildShareLinks(item)
    return (
      <div className="actu-card__share-menu" role="dialog" aria-label="Partager l'actualite">
        <button
          type="button"
          className="actu-card__share-close"
          aria-label="Fermer le partage"
          onClick={() => setShareMenuId(null)}
        >
          ×
        </button>
        <div className="actu-card__share-row">
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="actu-card__share-network actu-card__share-network--whatsapp"
            aria-label="Partager sur WhatsApp"
            title="WhatsApp"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.48 0 .12 5.35.12 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.24-1.63a11.9 11.9 0 0 0 5.82 1.49h.01c6.58 0 11.93-5.35 11.93-11.94 0-3.19-1.24-6.19-3.48-8.44Zm-8.45 18.36h-.01a9.9 9.9 0 0 1-5.03-1.37l-.36-.21-3.7.97.99-3.61-.24-.37a9.88 9.88 0 0 1-1.52-5.29C2.2 6.5 6.62 2.08 12.06 2.08c2.64 0 5.12 1.03 6.99 2.9a9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.43 9.88-9.88 9.88Zm5.42-7.42c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.77-1.64-2.07-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.55.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"
              />
            </svg>
          </a>
          <a
            href={links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="actu-card__share-network actu-card__share-network--facebook"
            aria-label="Partager sur Facebook"
            title="Facebook"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.5h3.05V9.4c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.33l-.53 3.5h-2.8V24C19.61 23.09 24 18.1 24 12.07Z"
              />
            </svg>
          </a>
          <a
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            className="actu-card__share-network"
            aria-label="Partager sur X"
            title="X"
          >
            <span aria-hidden="true">𝕏</span>
          </a>
          <button
            type="button"
            className="actu-card__share-network"
            aria-label="Copier le lien"
            title={copiedShareId === item.id ? 'Lien copie' : 'Copier le lien'}
            onClick={() => void copyShareLink(item)}
          >
            <span aria-hidden="true">{copiedShareId === item.id ? '✓' : '🔗'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <main id="actualites" className="actu-page" aria-labelledby="actu-page-title">
      <div className="actu-page__layout">
        <aside className="actu-page__aside" aria-label="Publicites gauche">
          <article className="actu-side-ad">
            <p>Publicite</p>
            <img
              src="/affuche%20pub%20miss%20tradi.jpg"
              alt="Publicite Miss Tradi-Culture "
              loading="lazy"
              decoding="async"
            />
            <a href="/partenariat">Reserver cet espace</a>
          </article>
        </aside>

        <div className="actu-page__inner">
          <header className="actu-page__header">
            <p className="actu-page__eyebrow">Actualites</p>
            <h1 id="actu-page-title">Fil officiel Miss Tradi-Culture </h1>
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

                    {item.reads > 0 ? (
                      <div className="actu-card__stats">
                        <span>{item.reads} lectures</span>
                      </div>
                    ) : null}
                    <footer className="actu-card__footer">
                      <div className="actu-card__share-wrap">
                        <button
                          type="button"
                          className="actu-card__share"
                          onClick={() => handleShare(item)}
                          aria-expanded={shareMenuId === item.id}
                        >
                          Partager
                        </button>
                        {shareMenuId === item.id ? renderShareMenu(item) : null}
                      </div>
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
              alt="Affiche promotionnelle Miss Tradi-Culture "
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
