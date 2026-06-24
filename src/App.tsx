import { HeroVideo } from './components/HeroVideo'
import { AdventureSection } from './components/AdventureSection'
import { MissTradiDescription } from './components/MissTradiDescription'
import { Navbar } from './components/Navbar'
import { ActualitesAccess } from './components/ActualitesAccess'
import { ActualiteDetailPage } from './components/ActualiteDetailPage'
import { ActualitesPage } from './components/ActualitesPage'
import { ConcoursPage } from './components/ConcoursPage'
import { PartenariatPage } from './components/PartenariatPage'
import { EditionPage } from './components/EditionPage'
import { VotePage } from './components/VotePage'
import { PlayPage } from './components/PlayPage'
import { PartnersTrustCarousel } from './components/PartnersTrustCarousel'
import { OfficialAppPromo } from './components/OfficialAppPromo'
import { PromoBanner } from './components/PromoBanner'
import { SectionBridge } from './components/SectionBridge'
import { ProfilePage } from './components/ProfilePage'
import { MentionsLegalesPage } from './components/MentionsLegalesPage'
import { CGUPage } from './components/CGUPage'
import { PolitiqueCookiesPage } from './components/PolitiqueCookiesPage'
import { PolitiqueConfidentialitePage } from './components/PolitiqueConfidentialitePage'
import { Footer } from './components/Footer'
import './App.css'

function App() {
  const pathname = window.location.pathname
  const isActualitesDetail = /^\/actualites\/[^/]+\/?$/.test(pathname)
  const isActualitesPage = pathname === '/actualites' || pathname === '/actualites/'
  const isConcoursPage = window.location.pathname.startsWith('/concours')

  const isPartenariatPage = window.location.pathname.startsWith('/partenariat')
  const isEditionPage = window.location.pathname.startsWith('/edition')
  const isVotePage = window.location.pathname.startsWith('/vote')
  const isPlayPage = window.location.pathname.startsWith('/play')
  const isProfilPage = window.location.pathname.startsWith('/profil')
  const isMentionsLegalesPage =
    window.location.pathname === '/mentions-legales' ||
    window.location.pathname === '/mentions-legales/'
  const isCGUPage =
    window.location.pathname === '/cgu' || window.location.pathname === '/cgu/'
  const isPolitiqueCookiesPage =
    window.location.pathname === '/politique-cookies' ||
    window.location.pathname === '/politique-cookies/'
  const isPolitiqueConfidentialitePage =
    window.location.pathname === '/politique-confidentialite' ||
    window.location.pathname === '/politique-confidentialite/'

  if (isProfilPage) {
    return (
      <>
        <Navbar />
        <ProfilePage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isActualitesDetail) {
    return (
      <>
        <Navbar />
        <ActualiteDetailPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isActualitesPage) {
    return (
      <>
        <Navbar />
        <ActualitesPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isConcoursPage) {
    return (
      <>
        <Navbar />
        <ConcoursPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isPartenariatPage) {
    return (
      <>
        <Navbar />
        <PartenariatPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isEditionPage) {
    return (
      <>
        <Navbar />
        <EditionPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isVotePage) {
    return (
      <>
        <Navbar />
        <VotePage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isPlayPage) {
    return (
      <>
        <Navbar />
        <PlayPage />
      </>
    )
  }

  if (isMentionsLegalesPage) {
    return (
      <>
        <Navbar />
        <MentionsLegalesPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isCGUPage) {
    return (
      <>
        <Navbar />
        <CGUPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isPolitiqueCookiesPage) {
    return (
      <>
        <Navbar />
        <PolitiqueCookiesPage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  if (isPolitiqueConfidentialitePage) {
    return (
      <>
        <Navbar />
        <PolitiqueConfidentialitePage />
        <div className="ticks"></div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <section id="accueil">
        <HeroVideo />
        <PromoBanner />
        <SectionBridge variant="ribbon" />
        <MissTradiDescription />
        <SectionBridge variant="wave" />
        <AdventureSection />
      </section>

      <SectionBridge variant="wave" />
      <ActualitesAccess />
      <SectionBridge variant="ribbon" />
      <PartnersTrustCarousel />
      <SectionBridge variant="wave" />
      <OfficialAppPromo />
      <SectionBridge variant="wave" />

      <div className="ticks"></div>

      <div className="ticks"></div>
      <Footer />
    </>
  )
}

export default App
