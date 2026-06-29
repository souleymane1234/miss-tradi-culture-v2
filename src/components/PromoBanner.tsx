import { useCallback, useState } from 'react'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './PromoBanner.css'

const DEFAULT_FILENAME = 'banner pub miss tradi.jpg'
const DEFAULT_SRC =
  '/' + encodeURIComponent(DEFAULT_FILENAME).replace(/%2F/g, '/')

type PromoBannerProps = {
  src?: string
  alt?: string
}

export function PromoBanner({
  src = DEFAULT_SRC,
  alt = 'Bannière promotionnelle Miss Tradi-Culture ',
}: PromoBannerProps) {
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>()
  const [imageLoaded, setImageLoaded] = useState(false)

  const markImageLoaded = useCallback(() => {
    setImageLoaded((done) => (done ? done : true))
  }, [])

  const reveal = imageLoaded && isVisible

  return (
    <div
      ref={ref}
      className={`site-promo-banner${reveal ? ' site-promo-banner--reveal' : ''}`}
    >
      <img
        className="site-promo-banner__img"
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) {
            markImageLoaded()
          }
        }}
        onLoad={markImageLoaded}
        onError={markImageLoaded}
      />
    </div>
  )
}
