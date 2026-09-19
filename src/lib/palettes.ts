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
// dark* = Figma 3503:3609, the section on the dark theme ground: same wash and stop, the wash rising
// out of #151414 instead of cream, and the copy lifted to the pale end of each hue.
export const HELP_ACCENTS = [
  { wash: '#E2C5DF', stop: '30%', fg: '#443B43', body: '#716370', badge: '#716370', rail: '#CBB1C9', darkFg: '#F6EEF5', darkBody: '#F3E8F2' },
  { wash: '#B5B449', stop: '30%', fg: '#313008', body: '#57570F', badge: '#807F0D', rail: '#B5B449', darkFg: '#E6E6C6', darkBody: '#D3D39C' },
  { wash: '#F2BA63', stop: '45%', fg: '#302514', body: '#614A28', badge: '#795D32', rail: '#C7964A', darkFg: '#F7D6A1', darkBody: '#F5C882' },
] as const

// A colour that follows the shared section theme: `light` on the light ground, `dark` on the dark
// one, keyed off the same --section-dark-progress as the ground. The progress flips 0/1; styles.css
// transitions any element whose inline style reads it, on the ground's clock, so the two can never
// drift. Don't put it inside a gradient — background-image cannot transition (see HowWeHelp).
// Outside a SectionTheme the variable is unset and this is just `light`.
export const themed = (light: string, dark: string) =>
  `color-mix(in srgb, ${light}, ${dark} calc(var(--section-dark-progress, 0) * 100%))`

// Dark case-study state, Figma 3501:2293. Key by the CMS-resolved background, not card order.
export const CARD_DARK_PALETTES: Record<string, { bg: string; fg: string; muted: string }> = {
  [CARD_PALETTES.olive.bg.toLowerCase()]: { bg: 'rgba(202,202,134,0.11)', fg: '#e6e6c6', muted: '#dddcb1' },
  [CARD_PALETTES.lilac.bg.toLowerCase()]: { bg: 'rgba(243,232,242,0.07)', fg: '#f6eef5', muted: '#f3e8f2' },
}

// Readable versions of the Strategy accents while its shared ground is still light.
export const STRATEGY_LIGHT_ACCENTS: Record<string, string> = {
  [STRATEGY_ACCENTS.lilac]: '#716370',
  [STRATEGY_ACCENTS.amber]: '#795D32',
  [STRATEGY_ACCENTS.olive]: '#57570F',
}
