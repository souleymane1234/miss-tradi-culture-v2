import './HeroVideo.css'

const DEFAULT_SRC = '/videomiss.mp4'
const DEFAULT_SUBTITLE = 'Miss Tradi Culture 2026'
const DEFAULT_TITLE = "Celebre la beaute, l'elegance et la culture"

type HeroVideoProps = {
  src?: string
  poster?: string
  subtitle?: string
  title?: string
  /** Lecture avec controles (video de presentation d'edition) */
  controls?: boolean
}

export function HeroVideo({
  src = DEFAULT_SRC,
  poster,
  subtitle = DEFAULT_SUBTITLE,
  title = DEFAULT_TITLE,
  controls = false,
}: HeroVideoProps) {
  return (
    <div className={`site-hero-video${controls ? ' site-hero-video--controls' : ''}`}>
      <video
        className="site-hero-video__media"
        src={src}
        poster={poster}
        autoPlay={!controls}
        muted={!controls}
        loop={!controls}
        controls={controls}
        playsInline
        preload="metadata"
        aria-label="Video de presentation Miss Tradi Culture"
      />
      <div className="site-hero-video__overlay">
        <p className="site-hero-video__subtitle">{subtitle}</p>
        <h1 className="site-hero-video__title">{title}</h1>
      </div>
    </div>
  )
}
