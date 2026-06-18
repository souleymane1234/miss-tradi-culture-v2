import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { isYoutubePlayable, toYoutubeEmbedUrl } from '../lib/video-playback'
import { videoApi } from '../services/api-client'
import './PlayPage.css'

const PAGE_LIMIT = 10

export function PlayPage() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const query = useInfiniteQuery({
    queryKey: ['videos', 'feed'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      videoApi.list({
        page: pageParam,
        limit: PAGE_LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    getNextPageParam: (last) => {
      const { current_page, total_pages } = last.pagination
      return current_page < total_pages ? current_page + 1 : undefined
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const videos = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.filter((v) => v.status === 'EN_LIGNE')) ?? [],
    [query.data],
  )

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLVideoElement>('.play-page__video'))
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            void video.play().catch(() => {})
          } else {
            video.pause()
          }
        }
      },
      { threshold: [0.25, 0.7] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [videos.length])

  useEffect(() => {
    const sentinel = document.getElementById('play-feed-sentinel')
    if (!sentinel) return
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && query.hasNextPage && !query.isFetchingNextPage) {
          void query.fetchNextPage()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observerRef.current.observe(sentinel)
    return () => observerRef.current?.disconnect()
  }, [query])

  if (query.isLoading) {
    return (
      <main className="play-page play-page--state">
        <p>Chargement des videos…</p>
      </main>
    )
  }

  if (query.isError) {
    return (
      <main className="play-page play-page--state">
        <p>Impossible de charger les videos.</p>
      </main>
    )
  }

  if (videos.length === 0) {
    return (
      <main className="play-page play-page--state">
        <p>Aucune video disponible.</p>
      </main>
    )
  }

  return (
    <main className="play-page" aria-label="Feed videos">
      <div className="play-page__feed">
        {videos.map((video) => {
          const youtubeEmbed = isYoutubePlayable(video)
            ? toYoutubeEmbedUrl(video.url, { autoplay: true, mute: true })
            : null
          return (
            <article key={video.id} className="play-page__item">
              {youtubeEmbed ? (
                <iframe
                  className="play-page__iframe"
                  src={youtubeEmbed}
                  title={video.title}
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="play-page__video"
                  src={video.url}
                  poster={video.thumbnailUrl ?? undefined}
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                  loop
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </article>
          )
        })}
        <div id="play-feed-sentinel" />
      </div>
    </main>
  )
}
