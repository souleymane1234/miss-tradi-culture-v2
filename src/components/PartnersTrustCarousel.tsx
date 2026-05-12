import './PartnersTrustCarousel.css'

const TRUST_LOGO_COUNT = 10

const TRUST_LOGOS = Array.from({ length: TRUST_LOGO_COUNT }, (_, i) => ({
  id: `port-${i + 1}`,
  src: `/trustCaroussel/port-${i + 1}.png`,
}))

type PartnersTrustCarouselProps = {
  /** Ancre #partenaires (accueil). Desactive sur pages dediees qui ont deja l'ancre. */
  includeAnchorId?: boolean
}

export function PartnersTrustCarousel({ includeAnchorId = true }: PartnersTrustCarouselProps) {
  const loopLogos = [...TRUST_LOGOS, ...TRUST_LOGOS]

  return (
    <section
      {...(includeAnchorId ? { id: 'partenaires' } : {})}
      className="partners-trust"
      aria-labelledby="partners-trust-title"
    >
      <div className="partners-trust__inner">
        <header className="partners-trust__header">
          <p className="partners-trust__eyebrow">Partenariat</p>
          <h2 id="partners-trust-title" className="partners-trust__title">
            Nos partenaires
          </h2>
          <p className="partners-trust__intro">
            Entreprises et structures qui soutiennent Miss Tradi Culture et
            donnent de la visibilité à l&apos;édition.
          </p>
        </header>

        <div
          className="partners-trust__viewport"
          role="region"
          aria-label="Défilement des logos partenaires"
        >
          <div className="partners-trust__track">
            {loopLogos.map((logo, index) => (
              <div key={`${logo.id}-${index}`} className="partners-trust__slide">
                <img
                  className="partners-trust__logo"
                  src={logo.src}
                  alt=""
                  width={200}
                  height={120}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
