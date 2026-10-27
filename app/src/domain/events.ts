export interface PriceOption {
  mode: 'team' | 'individual' | 'stall' | 'entry';
  amount_paise: number | null;
  enabled: boolean;
  label: string;
}

export interface EventItem {
  id: string;
  slug: string;
  organizerSlug: 'ed-cell' | 'srustiprosar';
  organizerName: string;
  track: 'e-fest' | 'esports';
  name: string;
  sourceAlias?: string;
  dates: string[];
  datesDisplay: string;
  format: string;
  tagline: string;
  description: string;
  venue: string;
  capacity: number | null;
  capacityUnit: 'team' | 'entry' | 'stall' | 'individual';
  teamMin?: number;
  teamMax?: number;
  startersRequired?: number;
  substituteSlots?: number;
  substituteRequired?: boolean | null; // explicitly pending/unresolved
  iglRequired?: number;
  queryPhone?: string;
  prizePoolPaise?: number | null;
  prizePoolDisplay?: string;
  priceOptions: PriceOption[];
  gates: string[];
  image: string;
  scoringChart?: { place: number; points: number }[];
  scoringNotes?: string;
}

export const EVENT_CATALOGUE: EventItem[] = [
  // --- E-Fest Events (ED Cell) ---
  {
    id: 'efest-ipl',
    slug: 'ipl-auction',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'IPL Auction',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'Campus Hall Auction Room',
    tagline: 'Strategic cricket franchise building and live bidding simulation',
    description: 'Test your sports management, analytics, and high-pressure bidding instincts in our flagship IPL-style simulation.',
    venue: 'Auditorium Hall A',
    capacity: 32,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 4,
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: true, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 per Solo (Gated allocation policy)' }
    ],
    gates: ['individual_allocation_policy'],
    image: '/brand/ipl-auction-960.webp'
  },
  {
    id: 'efest-brand-war',
    slug: 'brand-war',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'Brand War',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'Case Presentation & Pitch Arena',
    tagline: 'Creative marketing defense, turnaround pitches and competitive ad battles',
    description: 'Rebrand troubled products, create live campaigns, and pitch against rival teams in fast-paced marketing rounds.',
    venue: 'Seminar Room 2',
    capacity: 24,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 4,
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: true, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 per Solo (Gated allocation policy)' }
    ],
    gates: ['individual_allocation_policy'],
    image: '/brand/brand-war-960.webp'
  },
  {
    id: 'efest-e-trivia',
    slug: 'e-trivia',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'E-Trivia',
    dates: ['2026-11-13'],
    datesDisplay: '13 November 2026',
    format: 'Multi-round Buzzer & Tech Quiz',
    tagline: 'Fast-paced entrepreneurship, technology and business trivia',
    description: 'A rapid quiz spanning startup lore, tech history, economics, and pop-business culture with strict buzzer rules.',
    venue: 'Conference Hall B',
    capacity: 40,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 3,
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: true, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 per Solo (Gated allocation policy)' }
    ],
    gates: ['individual_allocation_policy'],
    image: '/brand/e-trivia-960.webp'
  },
  {
    id: 'efest-treasure-hunt',
    slug: 'treasure-hunt',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'Treasure Hunt',
    dates: ['2026-11-14'],
    datesDisplay: '14 November 2026',
    format: 'Campus-wide Timed Clue Trail',
    tagline: 'Physical and logical checkpoint riddle solving across campus',
    description: 'Solve cipher puzzles and sprint across campus checkpoints verified in real-time by stationed marshals.',
    venue: 'Campus Grounds & Central Quad',
    capacity: 50,
    capacityUnit: 'team',
    teamMin: 3,
    teamMax: 5,
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: true, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 per Solo (Gated allocation policy)' }
    ],
    gates: ['individual_allocation_policy'],
    image: '/brand/treasure-hunt-960.webp'
  },
  {
    id: 'efest-srusti-bazar',
    slug: 'srusti-bazar',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'Srusti Bazar',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'Live Trade & Food Stalls',
    tagline: 'Student venture market stalls and real customer transactions',
    description: 'Showcase student culinary, craft, or commercial ventures with assigned commercial stall infrastructure.',
    venue: 'Campus Courtyard Stalls',
    capacity: 15,
    capacityUnit: 'stall',
    priceOptions: [
      { mode: 'stall', amount_paise: 29900, enabled: true, label: '₹299 per Stall' }
    ],
    gates: [],
    image: '/brand/srusti-bazar-960.webp'
  },
  {
    id: 'efest-srusti-exhibition',
    slug: 'srusti-exhibition',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'Srusti Exhibition',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'Innovation & Project Gallery',
    tagline: 'Project prototypes, startup ideas, and working model showcases',
    description: 'Exhibit working models, software systems, and sustainable hardware innovations for jury evaluation.',
    venue: 'Exhibition Gallery 1',
    capacity: 25,
    capacityUnit: 'entry',
    priceOptions: [
      { mode: 'entry', amount_paise: 19900, enabled: true, label: '₹199 per Entry' }
    ],
    gates: [],
    image: '/brand/srusti-exhibition-960.webp'
  },

  // --- Kurukshetra Esports (Srustiprosar) ---
  {
    id: 'esports-bgmi',
    slug: 'bgmi',
    organizerSlug: 'srustiprosar',
    organizerName: 'Srustiprosar',
    track: 'esports',
    name: 'Kalinga BGMI Clash — Season 1',
    sourceAlias: 'KALINGA CLASH 2K26',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'OFFLINE venue-based LAN arena',
    tagline: 'Official offline BGMI tournament: 24 teams, 4 starters + 1 substitute slot, ₹10,000 pool',
    description: 'Battle across Miramar and Erangel in organizer-controlled tournament setups with full referee oversight, station hardware sign-offs, and BGIS 2026 placement scoring.',
    venue: 'High-Performance Esports Lab / LAN Arena',
    capacity: 24,
    capacityUnit: 'team',
    teamMin: 4,
    teamMax: 5,
    startersRequired: 4,
    substituteSlots: 1,
    substituteRequired: null, // explicitly unresolved
    iglRequired: 1,
    queryPhone: '8260555312',
    prizePoolPaise: 1000000,
    prizePoolDisplay: '₹10,000 Total Pool',
    priceOptions: [
      { mode: 'team', amount_paise: null, enabled: false, label: 'Entry Fee Pending College Approval' }
    ],
    gates: [
      'entry_fee_unresolved (Checkout disabled; no official payment QR)',
      'substitute_mandatory_status_pending',
      'device_hardware_instructions_pending',
      'kill_multiplier_and_tiebreak_rules_pending (Final scoring gated)'
    ],
    image: '/brand/kurukshetra-esports-960.webp',
    scoringChart: [
      { place: 1, points: 10 },
      { place: 2, points: 6 },
      { place: 3, points: 5 },
      { place: 4, points: 4 },
      { place: 5, points: 3 },
      { place: 6, points: 2 },
      { place: 7, points: 1 },
      { place: 8, points: 1 },
      { place: 9, points: 0 },
      { place: 10, points: 0 },
      { place: 11, points: 0 },
      { place: 12, points: 0 },
      { place: 13, points: 0 },
      { place: 14, points: 0 },
      { place: 15, points: 0 },
      { place: 16, points: 0 }
    ],
    scoringNotes: 'Placement chart transcribed from BGIS 2026 reference. Kill points, tie-break rules, and placements 17–24 are explicitly unresolved and gate final results publication.'
  },
  {
    id: 'esports-free-fire',
    slug: 'free-fire',
    organizerSlug: 'srustiprosar',
    organizerName: 'Srustiprosar',
    track: 'esports',
    name: 'Kurukshetra Free Fire',
    dates: [],
    datesDisplay: 'Dates Unconfirmed',
    format: 'Venue-based Battle Royale',
    tagline: 'Squad survival battle on mobile rigs',
    description: 'Free Fire clash details and its share of the earlier advertised combined ₹20,000 remain unconfirmed. Details will be published once approved by college organizers.',
    venue: 'LAN Arena 2',
    capacity: null,
    capacityUnit: 'team',
    priceOptions: [
      { mode: 'team', amount_paise: null, enabled: false, label: 'Pending Organizer Brief' }
    ],
    gates: [
      'dates_unconfirmed',
      'prize_share_unconfirmed',
      'entry_fee_unconfirmed',
      'rules_unconfirmed'
    ],
    image: '/brand/kurukshetra-640.webp'
  }
];
