import { isYoutubePlayable, toYoutubeEmbedUrl, type PlayableVideo } from '../lib/video-playback'
import './ProfilePresentationVideo.css'

type ProfilePresentationVideoProps = {
  url: string
}

export function ProfilePresentationVideo({ url }: ProfilePresentationVideoProps) {
  const trimmed = url.trim()
  if (!trimmed) return null

  const video: PlayableVideo = {
    url: trimmed,
    title: 'Video de presentation',
  }
  const youtubeEmbed = isYoutubePlayable(video) ? toYoutubeEmbedUrl(trimmed) : null

  return (
    <div className="profile-presentation-video">
      {youtubeEmbed ? (
        <iframe
          className="profile-presentation-video__iframe"
          src={youtubeEmbed}
          title="Video de presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video
          className="profile-presentation-video__video"
          src={trimmed}
          controls
          playsInline
          preload="metadata"
        >
          Votre navigateur ne prend pas en charge la lecture video.
        </video>
      )}
    </div>
  )
}
