export type PlayableVideo = {
  url: string
  sourceType?: string | null
  title?: string | null
  thumbnailUrl?: string | null
}

export function isYoutubePlayable(video: PlayableVideo): boolean {
  return (
    video.sourceType === 'YOUTUBE' ||
    video.url.includes('youtube.com') ||
    video.url.includes('youtu.be')
  )
}

export function toYoutubeEmbedUrl(
  url: string,
  options?: { autoplay?: boolean; mute?: boolean; loop?: boolean },
): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null

    if (u.hostname.includes('youtube.com')) {
      id = u.searchParams.get('v')
    } else if (u.hostname.includes('youtu.be')) {
      id = u.pathname.replace(/^\//, '') || null
    }

    if (!id) return null

    const params = new URLSearchParams({ rel: '0', playsinline: '1' })
    if (options?.autoplay) params.set('autoplay', '1')
    if (options?.mute) params.set('mute', '1')
    if (options?.loop) {
      params.set('loop', '1')
      params.set('playlist', id)
    }

    return `https://www.youtube.com/embed/${id}?${params.toString()}`
  } catch {
    return null
  }
}
