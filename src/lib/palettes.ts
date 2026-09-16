// Card colour tables. These are design, not content: an editor picks a named palette in the admin
// and the hexes live here, so a new card can't ship an unreadable ink-on-ground pair or a hex typo.
// Add a key and it appears in the admin select automatically (the blocks derive their options from
// Object.keys) — but the frontend still has to be able to read it, so eyeball contrast first.

// Who We Are case-study cards. Spread straight onto CaseStudy — the four keys ARE the four fields.
export const CARD_PALETTES = {
  olive: { bg: '#caca86', border: '#57570F', fg: '#313008', muted: '#57570F' },
  lilac: { bg: '#f3e8f2', border: '#716370', fg: '#443B43', muted: '#716370' },
} as const

// Strategy pillars. One colour each: it tints the title and mixes the card's hover glow.
export const STRATEGY_ACCENTS = {
  lilac: '#E5CBE2',
  amber: '#DFA854',
  olive: '#B5B449',
} as const

// The arrow ring's colour while its card is hovered, keyed by that card's accent. Not the accent
// itself — the client picked a deeper step of each: lilac → #CBB1C9 (accent-2/30), amber → #C7964A
// (secondary/40), olive → #807F0D (accent-1/20).
// Keyed by the resolved hex because that is all a card carries by render time (ServicePillar.fg),
// so this needs no CMS field. An accent with no entry keeps the resting #D1C1B7 on hover.
export const STRATEGY_ARROW_HOVER: Partial<Record<string, string>> = {
  [STRATEGY_ACCENTS.lilac]: '#CBB1C9',
  [STRATEGY_ACCENTS.amber]: '#C7964A',
  [STRATEGY_ACCENTS.olive]: '#807F0D',
}

// Badge star tints, by position. Every pillar in the design runs this row in this order, so the
// tint is layout rather than per-badge content and doesn't belong in the CMS at all. Cycles, so a
// fifth badge starts over rather than rendering an invisible star.
//
// Four, not three: the Strategy frame (2017:5084) went to four pills a card and draws the same
// green/lilac/pink/amber run the service heroes use — so these are PILL_COLORS' values. Kept as its
// own name because it is a different design decision that happens to agree today.
export const BADGE_COLORS = ['#A2A11C', '#CBB1C9', '#FF8A88', '#F5C882'] as const

// /paid-advertising hero pills. Same deal as BADGE_COLORS — the tint follows the position in the
// row, not the ad platform, so the CMS stores four labels and nothing else.
export const PILL_COLORS = ['#A2A11C', '#CBB1C9', '#FF8A88', '#F5C882'] as const

// The warm ember wash the dark sections put behind a panel: near-black on the left, full brand pink
// at the right edge. The hero pills fade it out to 0.1; every panel that uses it holds 0.25 the
// whole way, so this is that flat version. Same 90deg stops in Figma either way.
export const EMBER_WASH =
  'linear-gradient(90deg, rgba(28,25,23,0.25) 35%, rgba(85,47,42,0.25) 65%, rgba(141,68,60,0.25) 85%, rgba(255,111,97,0.25) 100%)'

// /development "How We Help" cards (Figma 3304:1853). One entry per column, and the column is what
// picks it — the design runs lilac/olive/amber left to right the way BADGE_COLORS runs its trio, so
// this is layout and the CMS stores no accent field. Cycles, so a fourth card starts over.
//
// `stop` is where the card's #FFFCF9 top gives way to the wash: the amber card holds the cream
// longer because its copy runs three lines deeper.
export const HELP_ACCENTS = [
  { wash: '#E2C5DF', stop: '30%', fg: '#443B43', body: '#716370', badge: '#716370', rail: '#CBB1C9' },
  { wash: '#B5B449', stop: '30%', fg: '#313008', body: '#57570F', badge: '#807F0D', rail: '#B5B449' },
  { wash: '#F2BA63', stop: '45%', fg: '#302514', body: '#614A28', badge: '#795D32', rail: '#C7964A' },
] as const
