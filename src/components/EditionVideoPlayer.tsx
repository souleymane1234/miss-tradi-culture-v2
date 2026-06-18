import { useEffect, useRef } from 'react'
import { isYoutubePlayable, toYoutubeEmbedUrl, type PlayableVideo } from '../lib/video-playback'
import './EditionVideoPlayer.css'

type EditionVideoPlayerProps = {
  video: PlayableVideo
  poster?: string | null
  variant?: 'default' | 'hero'
}

export function EditionVideoPlayer({
  video,
  poster,
  variant = 'default',
}: EditionVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isHero = variant === 'hero'
  const youtubeEmbed = isYoutubePlayable(video)
    ? toYoutubeEmbedUrl(video.url, { autoplay: true, mute: true, loop: true })
    : null
  const thumbnail = video.thumbnailUrl?.trim() || poster?.trim() || undefined

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    void el.play().catch(() => {})
  }, [video.url])

  return (
    <div className={`edition-video-player${isHero ? ' edition-video-player--hero' : ''}`}>
      {youtubeEmbed ? (
        <iframe
          className="edition-video-player__iframe"
          src={youtubeEmbed}
          title={video.title?.trim() || "Video de l'edition"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          className="edition-video-player__video"
          src={video.url}
          poster={thumbnail}
          autoPlay
          muted
          loop
          controls={!isHero}
          playsInline
          preload="auto"
          controlsList="nodownload"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
        >
          Votre navigateur ne prend pas en charge la lecture video.
        </video>
      )}
    </div>
  )
}
