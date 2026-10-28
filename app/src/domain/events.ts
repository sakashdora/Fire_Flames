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
    format: 'On-campus event',
    tagline: 'Strategic cricket franchise building and live bidding simulation',
    description: 'Build a cricket franchise through a live auction. Balance your bids, shape your squad and explain your strategy.',
    venue: 'Srusti Academy · venue details to follow',
    capacity: null,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 4,
    prizePoolPaise: 800000,
    prizePoolDisplay: '₹8,000',
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: false, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 individual · opening later' }
    ],
    gates: ['official_payment_profile', 'published_schedule', 'individual_allocation_policy'],
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
    format: 'On-campus event',
    tagline: 'Creative marketing defense, turnaround pitches and competitive ad battles',
    description: 'Put your branding skills to work in a team challenge. Develop your pitch, present your ideas and answer the jury’s questions.',
    venue: 'Srusti Academy · venue details to follow',
    capacity: null,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 3,
    prizePoolPaise: 450000,
    prizePoolDisplay: '₹4,500',
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: false, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 individual · opening later' }
    ],
    gates: ['official_payment_profile', 'published_schedule', 'individual_allocation_policy'],
    image: '/brand/brand-war-960.webp'
  },
  {
    id: 'efest-e-trivia',
    slug: 'e-trivia',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'E-Trivia',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'On-campus event',
    tagline: 'Fast-paced entrepreneurship, technology and business trivia',
    description: 'Test your knowledge of entrepreneurship and business in a team quiz.',
    venue: 'Srusti Academy · venue details to follow',
    capacity: null,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 4,
    prizePoolPaise: 450000,
    prizePoolDisplay: '₹4,500',
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: false, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 individual · opening later' }
    ],
    gates: ['official_payment_profile', 'published_schedule', 'individual_allocation_policy'],
    image: '/brand/e-trivia-960.webp'
  },
  {
    id: 'efest-treasure-hunt',
    slug: 'treasure-hunt',
    organizerSlug: 'ed-cell',
    organizerName: 'ED Cell',
    track: 'e-fest',
    name: 'Treasure Hunt',
    dates: ['2026-11-13', '2026-11-14'],
    datesDisplay: '13–14 November 2026',
    format: 'On-campus event',
    tagline: 'Physical and logical checkpoint riddle solving across campus',
    description: 'Follow clues and solve challenges together. The first teams to complete the hunt compete for the top prizes.',
    venue: 'Srusti Academy · venue details to follow',
    capacity: null,
    capacityUnit: 'team',
    teamMin: 2,
    teamMax: 4,
    prizePoolPaise: 700000,
    prizePoolDisplay: '₹7,000',
    priceOptions: [
      { mode: 'team', amount_paise: 9900, enabled: false, label: '₹99 per Team' },
      { mode: 'individual', amount_paise: 5900, enabled: false, label: '₹59 individual · opening later' }
    ],
    gates: ['official_payment_profile', 'published_schedule', 'individual_allocation_policy'],
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
    format: 'On-campus event',
    tagline: 'Student venture market stalls and real customer transactions',
    description: 'Set up a student venture stall and bring your ideas to a campus audience.',
    venue: 'Srusti Academy · venue details to follow',
    capacity: 10,
    capacityUnit: 'stall',
    prizePoolPaise: 300000,
    prizePoolDisplay: '₹3,000',
    priceOptions: [
      { mode: 'stall', amount_paise: 29900, enabled: false, label: '₹299 per Stall' }
    ],
    gates: ['official_payment_profile', 'published_schedule'],
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
    format: 'On-campus event',
    tagline: 'Project prototypes, startup ideas, and working model showcases',
    description: 'Present your business idea or working prototype to the jury and share the problem it solves.',
    venue: 'Srusti Academy · venue details to follow',
    capacity: 10,
    capacityUnit: 'entry',
    prizePoolPaise: 900000,
    prizePoolDisplay: '₹9,000',
    priceOptions: [
      { mode: 'entry', amount_paise: 19900, enabled: false, label: '₹199 per Entry' }
    ],
    gates: ['official_payment_profile', 'published_schedule'],
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
    description: 'Kalinga BGMI Clash brings 24 teams to campus for a ₹10,000 tournament. Final device instructions, match format and scoring rules will be announced before play.',
    venue: 'Srusti Academy · venue details to follow',
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
    tagline: 'Free Fire tournament · details to follow',
    description: 'Free Fire clash details and its share of the earlier advertised combined ₹20,000 remain unconfirmed. Details will be published once approved by college organizers.',
    venue: 'Srusti Academy · venue details to follow',
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
