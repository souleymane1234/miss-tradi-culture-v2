import { USE_MOCK_NEWS } from '../config/app-config'
import { useNewsArticle } from '../hooks/use-news-queries'
import { formatNewsDate } from '../lib/map-news'
import './ActualiteDetailPage.css'

const MOCK_ARTICLES: Record<
  string,
  {
    title: string
    summary: string
    imageSrc?: string
    author: string
    category: string
    publishedAt: string
  }
> = {
  'pre-inscriptions-2026': {
    title: 'Pre-inscriptions 2026',
    summary:
      'Les pre-inscriptions 2026 sont ouvertes. Merci de verifier les conditions et le dossier de candidature avant envoi.',
    imageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    author: 'Comite Miss Tradi Culture',
    category: 'Compte officiel',
    publishedAt: '2026-05-19T09:07:00.000Z',
  },
}

function parseSlugFromPath(): string | null {
  const match = window.location.pathname.match(/^\/actualites\/([^/]+)\/?$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

export function ActualiteDetailPage() {
  const slug = parseSlugFromPath()
  const articleQuery = useNewsArticle(slug)
  const mockArticle = slug && USE_MOCK_NEWS ? MOCK_ARTICLES[slug] : null
  const apiArticle = articleQuery.data

  const isLoading = !USE_MOCK_NEWS && articleQuery.isLoading
  const article = mockArticle
    ? {
        title: mockArticle.title,
        summary: mockArticle.summary,
        imageSrc: mockArticle.imageSrc,
        author: mockArticle.author,
        category: mockArticle.category,
        publishedAt: mockArticle.publishedAt,
        views: 0,
      }
    : apiArticle
      ? {
          title: apiArticle.title,
          summary: apiArticle.summary?.trim() || apiArticle.title,
          imageSrc: apiArticle.mainImage ?? undefined,
          author: apiArticle.author?.trim() || 'Miss Tradi Culture',
          category: apiArticle.category?.name ?? 'Actualite',
          publishedAt: apiArticle.publishedAt ?? '',
          views: apiArticle.views ?? 0,
        }
      : null

  if (isLoading) {
    return (
      <main className="actu-detail">
        <div className="actu-detail__inner">
          <p className="actu-detail__status">Chargement de l&apos;actualite…</p>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="actu-detail">
        <div className="actu-detail__inner">
          <a href="/actualites" className="actu-detail__back">
            ← Retour aux actualites
          </a>
          <h1>Actualite introuvable</h1>
          <p>Ce contenu n&apos;existe plus ou le lien est incorrect.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="actu-detail">
      <div className="actu-detail__inner">
        <a href="/actualites" className="actu-detail__back">
          ← Retour aux actualites
        </a>

        <article className="actu-detail__article">
          {article.imageSrc ? (
            <div className="actu-detail__hero">
              <img src={article.imageSrc} alt={article.title} />
            </div>
          ) : null}

          <div className="actu-detail__body">
            <p className="actu-detail__category">{article.category}</p>
            <h1>{article.title}</h1>

            <ul className="actu-detail__meta">
              <li>{formatNewsDate(article.publishedAt)}</li>
              <li>{article.author}</li>
              {article.views > 0 ? <li>{article.views} lectures</li> : null}
            </ul>

            <div className="actu-detail__content">
              <p>{article.summary}</p>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
