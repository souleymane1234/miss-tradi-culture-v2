export type Candidate = {
  id: string
  name: string
  username: string
  age: number
  region: string
  city: string
  photoSrc: string
  bio: string
  tradition: string
  votes: number
  points: number
  quizPoints: number
  mentorName: string
  mentorSubtitle: string
  videoSrc?: string
}

type CandidateInput = Omit<
  Candidate,
  'username' | 'votes' | 'points' | 'quizPoints' | 'mentorName' | 'mentorSubtitle'
> &
  Partial<Pick<Candidate, 'username' | 'votes' | 'points' | 'quizPoints' | 'mentorName' | 'mentorSubtitle'>>

function enrichCandidates(list: CandidateInput[]): Candidate[] {
  const votePresets = [452, 418, 386, 352, 328, 301, 276, 254, 230, 210, 195, 180]
  const pointPresets = [4520, 4180, 3860, 3520, 3280, 3010, 2760, 2540, 2300, 2100, 1950, 1800]

  return list.map((item, index) => {
    const slug = item.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')

    return {
      username: item.username ?? `${slug}_${String(index + 1).padStart(2, '0')}`,
      votes: item.votes ?? votePresets[index] ?? 150,
      points: item.points ?? pointPresets[index] ?? 1500,
      quizPoints: item.quizPoints ?? 0,
      mentorName: item.mentorName ?? 'Krou',
      mentorSubtitle: item.mentorSubtitle ?? 'Dida',
      videoSrc: item.videoSrc ?? '/videomiss.mp4',
      ...item,
    }
  })
}

export type EditionPrize = {
  title: string
  description: string
}

export type EditionSponsor = {
  name: string
  logoSrc: string
  tier: 'principal' | 'or' | 'argent' | 'bronze'
}

export type Edition = {
  year: number
  status: 'current' | 'past'
  title: string
  theme: string
  tagline: string
  description: string
  coverImageSrc: string
  videoSrc: string
  videoPosterSrc: string
  dates: string
  location: string
  candidateCount: number
  candidates: Candidate[]
  winnerId?: string
  prizes: EditionPrize[]
  rulesSummary: string[]
  rulesDocumentHref: string
  sponsors: EditionSponsor[]
  highlights: string[]
}

const CANDIDATE_PHOTO = (seed: string) =>
  `https://picsum.photos/seed/mtc-${seed}/480/640`

export const EDITIONS: Edition[] = [
  {
    year: 2026,
    status: 'current',
    title: 'Miss Tradi-Culture  2026',
    theme: 'Heritage et rayonnement',
    tagline: "L'edition qui celebre les racines et l'audace d'une nouvelle generation.",
    description:
      "Pour cette sixieme edition, le concours met en lumiere les talents feminins qui portent haut la culture traditionnelle. Bootcamp, defiles, masterclass et grande finale : un parcours exigeant et festif a travers tout le pays.",
    coverImageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    videoSrc: '/videomiss.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: 'Juin — Septembre 2026',
    location: 'Castings nationaux · Finale a Abidjan',
    candidateCount: 8,
    candidates: enrichCandidates([
      {
        id: '2026-aicha',
        username: 'Elegance_Grace_02',
        votes: 452,
        points: 4520,
        name: 'Aicha Konate',
        age: 22,
        region: 'Lagunes',
        city: 'Abidjan',
        photoSrc: CANDIDATE_PHOTO('2026-aicha'),
        tradition: 'Pagne baoule brode',
        bio: "Etudiante en communication, Aicha defend un projet de valorisation des tissus traditionnels aupres des jeunes.",
      },
      {
        id: '2026-fatou',
        name: 'Fatou Diallo',
        age: 24,
        region: 'Savanes',
        city: 'Korhogo',
        photoSrc: CANDIDATE_PHOTO('2026-fatou'),
        tradition: 'Danse senoufo',
        bio: "Artiste scenique et animatrice culturelle, elle souhaite ouvrir un centre d'echange intergenerationnel.",
      },
      {
        id: '2026-mariam',
        name: 'Mariam Ouattara',
        age: 21,
        region: 'Vallée du Bandama',
        city: 'Bouake',
        photoSrc: CANDIDATE_PHOTO('2026-mariam'),
        tradition: 'Coiffure traditionnelle',
        bio: 'Creatrice de mode, Mariam fusionne silhouettes contemporaines et ornements ancestraux.',
      },
      {
        id: '2026-aminata',
        name: 'Aminata Traore',
        age: 23,
        region: 'Montagnes',
        city: 'Man',
        photoSrc: CANDIDATE_PHOTO('2026-aminata'),
        tradition: 'Masques dan',
        bio: "Porte-parole associatif, elle milite pour l'acces des jeunes filles aux metiers d'art.",
      },
      {
        id: '2026-salimata',
        name: 'Salimata Bamba',
        age: 25,
        region: 'Bas-Sassandra',
        city: 'San-Pedro',
        photoSrc: CANDIDATE_PHOTO('2026-salimata'),
        tradition: 'Chants de pirogue',
        bio: "Chanteuse et entrepreneure, elle developpe une ligne de cosmetiques inspires des plantes locales.",
      },
      {
        id: '2026-kenza',
        name: 'Kenza N\'Guessan',
        age: 20,
        region: 'Zanzan',
        city: 'Bondoukou',
        photoSrc: CANDIDATE_PHOTO('2026-kenza'),
        tradition: 'Art lobi',
        bio: "Etudiante en histoire de l'art, Kenza documente les savoir-faire artisanaux de sa region.",
      },
      {
        id: '2026-rosine',
        name: 'Rosine Kouame',
        age: 26,
        region: 'Comoe',
        city: 'Abengourou',
        photoSrc: CANDIDATE_PHOTO('2026-rosine'),
        tradition: 'Poterie akan',
        bio: 'Designer et formatrice, elle anime des ateliers de transmission aux lyceennes.',
      },
      {
        id: '2026-clarisse',
        name: 'Clarisse Yao',
        age: 22,
        region: 'Goh',
        city: 'Gagnoa',
        photoSrc: CANDIDATE_PHOTO('2026-clarisse'),
        tradition: 'Textile bete',
        bio: "Influenceuse culturelle, Clarisse produit des capsules video sur les fetes traditionnelles.",
      },
    ]),
    prizes: [
      {
        title: 'Couronne Miss Tradi-Culture  2026',
        description: 'Titre officiel, sash, diademe et contrat d\'ambassadrice culturelle (12 mois).',
      },
      {
        title: 'Voyage decouverte patrimoine',
        description: 'Sejour de 7 jours pour deux personnes, offert par un partenaire tourisme.',
      },
      {
        title: 'Bourse projet culturel',
        description: 'Financement jusqu\'a 3 000 000 FCFA pour un projet associatif ou artistique.',
      },
      {
        title: 'Pack image & media',
        description: 'Shooting professionnel, coaching communication et visibilite sur les reseaux officiels.',
      },
    ],
    rulesSummary: [
      'Avoir entre 18 et 30 ans a la date de la finale.',
      'Resider en Cote d\'Ivoire ou justifier d\'un lien culturel avec le pays.',
      'Ne pas avoir ete finaliste d\'une edition Miss Tradi-Culture  precedente.',
      'Participer a l\'integralite du calendrier officiel (bootcamp, defiles, actions partenaires).',
      'Respecter la charte ethique, l\'image publique et les consignes du comite d\'organisation.',
    ],
    rulesDocumentHref: '#contact',
    sponsors: [
      { name: 'Partenaire Principal', logoSrc: '/trustCaroussel/port-1.png', tier: 'principal' },
      { name: 'Sponsor Or', logoSrc: '/trustCaroussel/port-2.png', tier: 'or' },
      { name: 'Sponsor Or', logoSrc: '/trustCaroussel/port-3.png', tier: 'or' },
      { name: 'Sponsor Argent', logoSrc: '/trustCaroussel/port-4.png', tier: 'argent' },
      { name: 'Sponsor Bronze', logoSrc: '/trustCaroussel/port-5.png', tier: 'bronze' },
    ],
    highlights: [
      '8 candidates pre-selectionnees',
      'Bootcamp national a Bouake',
      'Finale televisee en septembre',
    ],
  },
  {
    year: 2025,
    status: 'past',
    title: 'Miss Tradi-Culture  2025',
    theme: 'Racines et modernite',
    tagline: "L'edition qui a reuni 12 candidates de 8 regions.",
    description:
      "La cinquieme edition a accueilli un record de participantes et une finale devant plus de 2 000 spectateurs. Le jury a recompense l'engagement culturel et la qualite des projets sociaux portes par les candidates.",
    coverImageSrc: '/banner%20pub%20miss%20tradi.jpg',
    videoSrc: '/videomiss.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: 'Mai — Aout 2025',
    location: 'Finale a Yamoussoukro',
    candidateCount: 12,
    winnerId: '2025-blessing',
    candidates: enrichCandidates([
      {
        id: '2025-blessing',
        name: 'Blessing Akoto',
        age: 24,
        region: 'Lagunes',
        city: 'Abidjan',
        photoSrc: CANDIDATE_PHOTO('2025-blessing'),
        tradition: 'Kente contemporain',
        bio: "Miss Tradi-Culture  2025. Elle a lance une collecte de tenues traditionnelles pour les lycees.",
      },
      {
        id: '2025-naomi',
        name: 'Naomi Guei',
        age: 22,
        region: 'Woroba',
        city: 'Duekoue',
        photoSrc: CANDIDATE_PHOTO('2025-naomi'),
        tradition: 'Sculpture bois',
        bio: '1ere dauphine. Artiste plasticienne et animatrice d\'ateliers creatifs.',
      },
      {
        id: '2025-grace',
        name: 'Grace Kouassi',
        age: 23,
        region: 'Lacs',
        city: 'Yamoussoukro',
        photoSrc: CANDIDATE_PHOTO('2025-grace'),
        tradition: 'Danse gouro',
        bio: '2e dauphine. Professeure de danse et promotrice de spectacles jeunesse.',
      },
      {
        id: '2025-irene',
        name: 'Irene Coulibaly',
        age: 25,
        region: 'Savanes',
        city: 'Ferkessedougou',
        photoSrc: CANDIDATE_PHOTO('2025-irene'),
        tradition: 'Bogolan',
        bio: 'Finaliste. Elle exporte des creations textiles vers les marches ouest-africains.',
      },
      {
        id: '2025-diane',
        name: 'Diane Sanogo',
        age: 21,
        region: 'Sassandra-Marahoue',
        city: 'Daloa',
        photoSrc: CANDIDATE_PHOTO('2025-diane'),
        tradition: 'Perles baoule',
        bio: 'Finaliste. Creatrice de bijoux et fondatrice d\'une micro-entreprise feminine.',
      },
      {
        id: '2025-lydia',
        name: 'Lydia Toure',
        age: 26,
        region: 'Denguele',
        city: 'Odienné',
        photoSrc: CANDIDATE_PHOTO('2025-lydia'),
        tradition: 'Chants mandingues',
        bio: 'Finaliste. Chanteuse et mediatrice culturelle dans les ecoles rurales.',
      },
    ]),
    prizes: [
      { title: 'Couronne 2025', description: 'Remise a Blessing Akoto lors de la grande finale.' },
      { title: 'Bourse projet', description: '2 500 000 FCFA pour le projet culturel de la gagnante.' },
    ],
    rulesSummary: [
      'Reglement officiel 2025 — edition cloturee.',
    ],
    rulesDocumentHref: '#contact',
    sponsors: [
      { name: 'Partenaire 2025', logoSrc: '/trustCaroussel/port-6.png', tier: 'principal' },
      { name: 'Sponsor Or', logoSrc: '/trustCaroussel/port-7.png', tier: 'or' },
      { name: 'Sponsor Argent', logoSrc: '/trustCaroussel/port-8.png', tier: 'argent' },
    ],
    highlights: [
      '12 candidates · 8 regions',
      'Gagnante : Blessing Akoto',
      'Finale a Yamoussoukro',
    ],
  },
  {
    year: 2024,
    status: 'past',
    title: 'Miss Tradi-Culture  2024',
    theme: 'Eclat des traditions',
    tagline: "Quatrieme edition, premiere diffusion en direct sur les reseaux.",
    description:
      "Edition charniere avec une couverture mediatique renforcee et l'ouverture du village partenaires. Les candidates ont porte des tenues inspirees de quatre grands peuples ivoiriens.",
    coverImageSrc: '/affiche%20miss%20tradi_Plan%20de%20travail%201.jpg',
    videoSrc: '/videomiss.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: 'Juin — Septembre 2024',
    location: 'Finale a Abidjan',
    candidateCount: 10,
    winnerId: '2024-esperance',
    candidates: enrichCandidates([
      {
        id: '2024-esperance',
        name: 'Esperance N\'Dri',
        age: 23,
        region: 'Lagunes',
        city: 'Abidjan',
        photoSrc: CANDIDATE_PHOTO('2024-esperance'),
        tradition: 'Pagne wax revisite',
        bio: "Miss Tradi-Culture  2024. Ambassadrice de l'edition et referente des actions solidaires.",
      },
      {
        id: '2024-vanessa',
        name: 'Vanessa Ble',
        age: 22,
        region: 'Montagnes',
        city: 'Danane',
        photoSrc: CANDIDATE_PHOTO('2024-vanessa'),
        tradition: 'Masque guere',
        bio: 'Dauphine. Documentariste en devenir sur les fetes de fin d\'annee.',
      },
      {
        id: '2024-prisca',
        name: 'Prisca Moh',
        age: 24,
        region: 'Comoe',
        city: 'Aboisso',
        photoSrc: CANDIDATE_PHOTO('2024-prisca'),
        tradition: 'Vannerie',
        bio: 'Finaliste. Artisane et formatrice en economie circulaire.',
      },
      {
        id: '2024-julie',
        name: 'Julie Anoma',
        age: 21,
        region: 'Goh-Djiboua',
        city: 'Divo',
        photoSrc: CANDIDATE_PHOTO('2024-julie'),
        tradition: 'Danse bete',
        bio: 'Finaliste. Etudiante en tourisme culturel.',
      },
    ]),
    prizes: [
      { title: 'Couronne 2024', description: 'Remise a Esperance N\'Dri.' },
      { title: 'Prix du public', description: 'Vote en ligne remporte par Vanessa Ble.' },
    ],
    rulesSummary: ['Reglement officiel 2024 — edition cloturee.'],
    rulesDocumentHref: '#contact',
    sponsors: [
      { name: 'Partenaire 2024', logoSrc: '/trustCaroussel/port-9.png', tier: 'principal' },
      { name: 'Sponsor Or', logoSrc: '/trustCaroussel/port-10.png', tier: 'or' },
    ],
    highlights: [
      '10 candidates',
      'Gagnante : Esperance N\'Dri',
      'Premiere diffusion live',
    ],
  },
]

export const CURRENT_EDITION_YEAR = 2026

export function getEditionByYear(year: number): Edition | undefined {
  return EDITIONS.find((e) => e.year === year)
}

export function getCurrentEdition(): Edition {
  return getEditionByYear(CURRENT_EDITION_YEAR) ?? EDITIONS[0]
}

export function getCandidateRank(edition: Edition, candidateId: string): number {
  const sorted = [...edition.candidates].sort((a, b) => b.points - a.points)
  const index = sorted.findIndex((c) => c.id === candidateId)
  return index === -1 ? 0 : index + 1
}

export function resolveVoteContext(candidateId: string | null): {
  edition: Edition
  candidate: Candidate
  rank: number
} | null {
  if (!candidateId) return null

  for (const edition of EDITIONS) {
    const candidate = edition.candidates.find((c) => c.id === candidateId)
    if (candidate) {
      return {
        edition,
        candidate,
        rank: getCandidateRank(edition, candidateId),
      }
    }
  }

  return null
}

export function parseVoteCandidateIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/vote\/([^/]+)\/?$/)
  return match?.[1] ?? null
}
