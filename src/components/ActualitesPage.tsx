import { useEffect, useMemo, useRef, useState } from 'react'
import './ActualitesPage.css'

type PostItem = {
  id: string
  type: 'post'
  author: string
  role: string
  time: string
  text: string
  imageSrc?: string
  imageAlt?: string
  likes: number
  reads: number
}

type AdItem = {
  id: string
  type: 'ad'
  label: string
  title: string
  text: string
  imageSrc: string
  imageAlt: string
  cta: string
}

type FeedItem = PostItem | AdItem

const PAGE_SIZE = 5

const FEED_ITEMS: FeedItem[] = [
  {
    id: 'p-1',
    type: 'post',
    author: 'Comite Miss Tradi Culture',
    role: 'Compte officiel',
    time: 'Il y a 2 h',
    text: 'Les pre-inscriptions 2026 sont ouvertes. Merci de verifier les conditions et le dossier de candidature avant envoi.',
    imageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    imageAlt: 'Affiche Miss Tradi Culture',
    likes: 248,
    reads: 1820,
  },
  {
    id: 'p-2',
    type: 'post',
    author: 'Equipe Communication',
    role: 'Actualite evenement',
    time: 'Il y a 4 h',
    text: 'Retour en images sur la soiree de presentation des candidates. Merci a tous les partenaires pour le soutien.',
    imageSrc: '/banner%20pub%20miss%20tradi.jpg',
    imageAlt: 'Banniere publicitaire Miss Tradi',
    likes: 179,
    reads: 1460,
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
  },
  {
    id: 'p-3',
    type: 'post',
    author: 'Direction Artistique',
    role: 'Backstage',
    time: 'Hier',
    text: 'Preparation des tenues traditionnelles en cours. Le shooting officiel arrive tres bientot.',
    imageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    imageAlt: 'Visuel backstage Miss Tradi',
    likes: 321,
    reads: 2350,
  },
  {
    id: 'p-4',
    type: 'post',
    author: 'Miss Tradi Culture',
    role: 'Annonce',
    time: 'Hier',
    text: 'Le calendrier preliminaire des selections regionales est disponible. Restez connectes pour les horaires officiels.',
    likes: 137,
    reads: 1190,
  },
  {
    id: 'a-2',
    type: 'ad',
    label: 'Publicite',
    title: 'Pack Visibilite 2026',
    text: 'Associez votre marque a un evenement de culture et de rayonnement national.',
    imageSrc: '/banner%20pub%20miss%20tradi.jpg',
    imageAlt: 'Banniere offre sponsoring',
    cta: 'Voir les packs',
  },
  {
    id: 'p-5',
    type: 'post',
    author: 'Cellule Presse',
    role: 'Communique',
    time: 'Il y a 2 jours',
    text: 'Le dossier presse officiel sera mis en ligne apres la conference de lancement.',
    likes: 95,
    reads: 860,
  },
  {
    id: 'p-6',
    type: 'post',
    author: 'Equipe Partenariats',
    role: 'Partenaires',
    time: 'Il y a 2 jours',
    text: 'Merci aux marques qui rejoignent cette edition. De nouveaux partenaires seront annonces cette semaine.',
    imageSrc: '/affuche%20pub%20miss%20tradi.jpg',
    imageAlt: 'Annonce partenaires',
    likes: 204,
    reads: 1710,
  },
]

export function ActualitesPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const visibleItems = useMemo(() => FEED_ITEMS.slice(0, visibleCount), [visibleCount])
  const hasMore = visibleCount < FEED_ITEMS.length

  useEffect(() => {
    const target = sentinelRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore) {
            setVisibleCount((current) => Math.min(current + PAGE_SIZE, FEED_ITEMS.length))
          }
        })
      },
      { rootMargin: '360px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore])

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
            <a href="/#partenariat">Reserver cet espace</a>
          </article>
          <article className="actu-side-ad">
            <p>Sponsorise</p>
            <img
              src="/banner%20pub%20miss%20tradi.jpg"
              alt="Banniere sponsorisee Miss Tradi Culture"
              loading="lazy"
              decoding="async"
            />
            <a href="/#partenariat">Voir les offres</a>
          </article>
        </aside>

        <div className="actu-page__inner">
        <header className="actu-page__header">
          <p className="actu-page__eyebrow">Actualites</p>
          <h1 id="actu-page-title">Fil officiel Miss Tradi Culture</h1>
          <p>
            Retrouvez toutes les publications, annonces et espaces publicitaires dans un
            fil continu.
          </p>
        </header>

        <ul className="actu-page__feed">
          {visibleItems.map((item) => (
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
                        {item.role} · {item.time}
                      </p>
                    </div>
                  </div>

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
                    <span>{item.likes} j'aime</span>
                    <span>{item.reads} lectures</span>
                  </div>
                  <div className="actu-card__actions">
                    <button type="button" className="actu-card__like">
                      <span aria-hidden="true">❤</span> J'aime
                    </button>
                    <a className="actu-card__read" href="/actualites">
                      Lire la publication
                    </a>
                  </div>
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
                  <a href="/#partenariat">{item.cta}</a>
                </article>
              )}
            </li>
          ))}
        </ul>

        <div className="actu-page__loading" aria-live="polite">
          {hasMore ? (
            <>
              <p>Faites defiler pour charger plus de publications...</p>
              <div ref={sentinelRef} className="actu-page__sentinel" aria-hidden="true" />
            </>
          ) : (
            <p>Vous etes a jour.</p>
          )}
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
          <article className="actu-side-ad">
            <p>Pack entreprise</p>
            <img
              src="/banner%20pub%20miss%20tradi.jpg"
              alt="Pack publicitaire entreprise"
              loading="lazy"
              decoding="async"
            />
            <a href="/#partenariat">Demander un devis</a>
          </article>
        </aside>
      </div>
    </main>
  )
}
