import './OfficialAppPromo.css'

/** Badges marketing officiels (FR). Remplacer les href par vos fiches App Store / Play Console. */
const APP_STORE_BADGE_BLACK =
  'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/fr-fr?size=250x83'
const APP_STORE_BADGE_WHITE =
  'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/white/fr-fr?size=250x83'
const PLAY_STORE_BADGE_FR =
  'https://play.google.com/intl/fr_fr/badges/static/images/badges/fr_badge_web_generic.png'

const DEFAULT_APP_STORE_HREF = 'https://apps.apple.com/fr/app/'
const DEFAULT_PLAY_STORE_HREF = 'https://play.google.com/store/apps'

type OfficialAppPromoProps = {
  appStoreHref?: string
  playStoreHref?: string
}

export function OfficialAppPromo({
  appStoreHref = DEFAULT_APP_STORE_HREF,
  playStoreHref = DEFAULT_PLAY_STORE_HREF,
}: OfficialAppPromoProps) {
  return (
    <section
      id="application"
      className="official-app"
      aria-labelledby="official-app-title"
    >
      <div className="official-app__inner">
        <p className="official-app__eyebrow">Mobile</p>
        <h2 id="official-app-title" className="official-app__title">
          L&apos;application officielle Miss Tradi Culture
        </h2>
        <p className="official-app__lead">
          L&apos;excellence à portée de main. Suivez l&apos;actualité en temps
          réel, soutenez vos candidates favorites et découvrez les coulisses de
          l&apos;événement.
        </p>

        <div className="official-app__stores">
          <a
            className="official-app__store-link"
            href={appStoreHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <picture>
              <source
                media="(prefers-color-scheme: dark)"
                srcSet={APP_STORE_BADGE_WHITE}
              />
              <img
                className="official-app__badge official-app__badge--apple"
                src={APP_STORE_BADGE_BLACK}
                alt="Télécharger sur l'App Store"
                width={250}
                height={83}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </a>
          <a
            className="official-app__store-link"
            href={playStoreHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="official-app__badge official-app__badge--play"
              src={PLAY_STORE_BADGE_FR}
              alt="Disponible sur Google Play"
              width={564}
              height={168}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      </div>
    </section>
  )
}
