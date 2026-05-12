import './HeroVideo.css'

const DEFAULT_SRC = '/videomiss.mp4'

type HeroVideoProps = {
  src?: string
}

export function HeroVideo({ src = DEFAULT_SRC }: HeroVideoProps) {
  return (
    <div className="site-hero-video">
      <video
        className="site-hero-video__media"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Vidéo de présentation Miss Tradi Culture"
      />
      <div className="site-hero-video__overlay">
        <p className="site-hero-video__subtitle">Miss Tradi Culture 2026</p>
        <h1 className="site-hero-video__title">Celebre la beaute, l'elegance et la culture</h1>
      </div>
    </div>
  )
}
