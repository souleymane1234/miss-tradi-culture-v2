import { HeroVideo } from './components/HeroVideo'
import { AdventureSection } from './components/AdventureSection'
import { MissTradiDescription } from './components/MissTradiDescription'
import { Navbar } from './components/Navbar'
import { ActualitesAccess } from './components/ActualitesAccess'
import { ActualitesPage } from './components/ActualitesPage'
import { ConcoursPage } from './components/ConcoursPage'
import { PartenariatPage } from './components/PartenariatPage'
import { EditionPage } from './components/EditionPage'
import { VotePage } from './components/VotePage'
import { PartnersTrustCarousel } from './components/PartnersTrustCarousel'
import { OfficialAppPromo } from './components/OfficialAppPromo'
import { PromoBanner } from './components/PromoBanner'
import { SectionBridge } from './components/SectionBridge'
import { Footer } from './components/Footer'
import './App.css'

function App() {
  const isActualitesPage = window.location.pathname.startsWith('/actualites')
  const isConcoursPage = window.location.pathname.startsWith('/concours')

  const isPartenariatPage = window.location.pathname.startsWith('/partenariat')
  const isEditionPage = window.location.pathname.startsWith('/edition')
  const isVotePage = window.location.pathname.startsWith('/vote')

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
