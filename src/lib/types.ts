// Content contracts for the frontend. Shaped to match what Payload will hand us later, so Phase 3/4
// is a data-source swap (mock -> Local API) and not a component rewrite.
// Superseded by the generated payload-types.ts once collections exist.

// A Payload Media doc, narrowed to what rendering actually needs.
// `blurDataURL` is written on upload by the beforeChange hook in src/collections/Media.ts (and comes
// free from StaticImageData in the mock); absent -> the wrapper skips the blur placeholder.
export type MediaDoc = {
  url: string
  width: number
  height: number
  alt: string
  blurDataURL?: string
}

export type LinkField = {
  label: string
  href?: string
}

// Hero block. The `\n` in heading is an explicit line break (split into block spans at render); a
// Payload textarea field maps to this 1:1.
export type HeroContent = {
  heading: string
  description: string
  button: LinkField
  slides: MediaDoc[]
}

// A case-study card: image + copy + a headline stat + an "Explore" link, on its own tinted ground.
// Each card carries its full palette — ground, keyline, and the two text tones — so a green card and
// a lilac card read as siblings without the section hardcoding either.
export type CaseStudy = {
  image: MediaDoc // also the video poster when `video` is set
  video?: string // optional looping clip URL; replaces the still on the card
  title: string
  body: string
  stat: { value: string; label: string } // e.g. "133%" / "Lead Increase"
  link: LinkField
  bg: string
  border: string
  fg: string // heading + stat value
  muted: string // body + stat label
}

// Who We Are block. `label` is the bracketed eyebrow — the brackets are CSS pseudos, so the CMS
// value is the bare text ("WHO WE ARE"), never the punctuation.
export type WhoWeAreContent = {
  label: string
  heading: string
  description: string
  cards: CaseStudy[]
}

// A service pillar card on the dark ground: title, a row of tagged capabilities, a hook line with an
// arrow link, and the explainer at the bottom. `fg` tints the title; each badge carries its own star
// colour, so the accent trio is data, not CSS.
export type ServicePillar = {
  title: string
  badges: { label: string; color: string }[]
  // \n in hook/title is a hard break the designer set by hand, not a wrap. hookMobile is only set
  // when the mobile breaks differ from desktop's; absent -> hook serves both.
  hook: string
  hookMobile?: string
  body: string
  link: LinkField
  fg: string
}

// Strategy block — dark ground, same label/heading/desc stack as WhoWeAre, three pillars below.
export type StrategyContent = {
  label: string
  heading: string
  description: string
  cards: ServicePillar[]
}

// A team member in the About carousel. `photo` is optional until real headshots exist — the carousel
// renders a placeholder frame when it's absent, so the section ships before the assets do. Maps 1:1 to
// a Payload array row (or a Team-collection relationship) later.
//
// Two crops, same split as ContactContent: the carousel frame is 112:75 landscape at md+ but a
// 430px-tall column below it, so one file can't serve both without gutting the composition.
// `photoMobile` is optional and falls back to `photo`.
export type TeamMember = {
  photo?: MediaDoc
  photoMobile?: MediaDoc
  name: string
  role: string
}

// About Us block — cream ground, same label/heading/desc stack. Below it: the team carousel (one
// member at a time, prev/next arrows) with a dark footer bar carrying the "Our Story" link.
export type AboutContent = {
  label: string
  heading: string
  description: string
  members: TeamMember[]
  story: LinkField
}

// Contact block — brand-pink ground, oversized display heading, two CTAs.
// A social account. `platform` picks the icon (see the Icon registry) — it isn't free text, so a
// Payload select field with these four options maps straight onto it.
export type SocialLink = {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook'
  href?: string
}

export type ContactContent = {
  label: string
  heading: string
  buttons: LinkField[]
  socials: SocialLink[]
  photo: MediaDoc // portrait crop, md+
  photoMobile: MediaDoc // landscape crop, below md
}

// Dark band under Contact — a single paragraph. The `\n` is an authored break (the closing line
// sits on its own row), rendered via whitespace-pre-line.
export type NoteContent = {
  body: string
}

// The whole home page. Shared by the mock and by getHome() so the two can't drift.
export type HomeContent = {
  hero: HeroContent
  whoWeAre: WhoWeAreContent
  strategy: StrategyContent
  about: AboutContent
  contact: ContactContent
  note: NoteContent
}

// --- /paid-advertising ---------------------------------------------------------------------------
// Same contract shape as the home blocks: one type per section, each one the exact set of strings an
// editor can change. Everything the design fixes — the pill tints, the panel widths, the 1/2/1 panel
// grid, the stat-card gradient — stays in the page and is not modelled here.

// A sentence that changes voice mid-way — a 24px Neue Haas phrase set inside the 28px serif. The
// designer does it in both service heroes and again in the branding scratch band, so it is three
// fields rather than one string plus a markup parser. `emphasis` is the run that switches face; the
// other two are the plain text either side of it.
export type EmphasisedSentence = {
  before: string
  emphasis: string
  after: string
}

// The hero's sentence. /paid-advertising and /branding both set one phrase in the other face, so
// this is EmphasisedSentence with the switch made optional: /development (Figma 3292:4657) is one
// flat paragraph with no run in Neue Haas at all, and ServiceHero simply skips the <strong> when
// `emphasis` is absent rather than the page inventing a phrase to bold.
export type HeroSentence = {
  before: string
  emphasis?: string
  after?: string // only read when `emphasis` is filled in
}

export type PaidHeroContent = {
  label: string
  heading: string
  pills: string[] // star tints come from PILL_COLORS by position
  description: HeroSentence
  button: LinkField
}

// The refund band under the hero. `body`'s \n is the authored two-line break; `scratchLabel` is the
// prompt printed on the scratch cover that hides it.
export type GuaranteeContent = {
  body: string
  scratchLabel: string
}

export type PaidPanel = {
  title: string
  body: string
  image: MediaDoc // flat export of the Figma product mock, not a live widget
}

// "What you get" — exactly four panels, because the section's 1 / 2 / 1 grid is drawn by hand and
// each slot has its own width. Fewer or more falls back to the mock (see toWhatYouGetContent).
export type WhatYouGetContent = {
  label: string
  heading: string
  panels: PaidPanel[]
}

// Results — three stat cards. The \n in a label is a desktop-only break (mobile lets it wrap).
export type ResultsContent = {
  label: string
  heading: string
  stats: { value: string; label: string }[]
}

// `badge` is the tab straddling a card's top edge; the card also takes the brand keyline and glow
// when it's set, so this one field is what makes a tier the highlighted one.
export type PricingTier = {
  label: string
  price: string
  badge?: string
  items: string[]
}

// One CTA for both cards — the design repeats the same button, so it is one field, not one per tier.
export type PricingContent = {
  label: string
  heading: string
  tiers: PricingTier[]
  cta: LinkField
}

export type FaqContent = {
  label: string
  heading: string
  items: { question: string; answer: string }[]
}

// The whole /paid-advertising page. `contact` is deliberately absent — that section is read off the
// home doc so one edit moves both pages (see the page component).
export type PaidContent = {
  hero: PaidHeroContent
  guarantee: GuaranteeContent
  whatYouGet: WhatYouGetContent
  results: ResultsContent
  pricing: PricingContent
  faq: FaqContent
  note: NoteContent
}

// The band under the hero — the same scratch panel /paid-advertising covers its refund promise with,
// so it carries the label printed on that panel. Its own type rather than an inline shape on
// BrandingContent, because src/lib/cms.ts converts it on its own like every other section.
export type PositioningContent = {
  body: EmphasisedSentence
  scratchLabel: string
}

// The /branding page, section by section as they are built. It reuses PaidHeroContent rather than
// cloning it — Figma draws one hero component for both service pages, and ServiceHero renders it for
// both. `positioning` is the same scratch band /paid-advertising puts its refund promise in, so it
// carries a scratchLabel too; its copy switches face mid-sentence where paid's breaks in two.
export type BrandingContent = {
  hero: PaidHeroContent
  positioning: PositioningContent
  system: SystemContent
  channels: ChannelsContent
  compound: CompoundContent
  // Figma draws Pricing and FAQ identically on both service pages, so these reuse the /paid types.
  // Its own copy of the values, not an import of the paid mock: the two pages are separate docs once
  // the CMS lands, and a fallback that silently tracked the other page's would hide that.
  pricing: PricingContent
  faq: FaqContent
  note: NoteContent
}

// --- /development --------------------------------------------------------------------------------

// One "How We Help" card: a client problem and what we built for it. `title` carries the designer's
// own line break; `steps` are the two numbered paragraphs — the problem, then the fix.
//
// No colour and no widget here. The design runs lilac/olive/amber left to right with one specific
// mock per column, so both come from the card's position in the row (HELP_ACCENTS / HELP_WIDGETS),
// the same rule BADGE_COLORS follows on /home.
export type HowWeHelpCard = {
  eyebrow: string
  title: string
  steps: string[]
}

// "How We Help" (Figma 3304:1848) — cream ground, the usual label/heading/description stack, then
// three case-study cards across. Heading and description both carry authored breaks.
export type HowWeHelpContent = {
  label: string
  heading: string
  description: string
  cards: HowWeHelpCard[]
}

// One "Our Method" row: the adjective and the paragraph that backs it. The "1—" is NOT here — it is
// the row's position in the list, so reordering renumbers rather than stranding a 3 above a 2.
export type MethodStep = {
  title: string
  body: string
}

// "Our Method" (Figma 3318:2717) — the darkest ground on the site, label and heading, then the rows.
// `heading` carries an authored break. No description: the frame's paragraph was cut on review.
export type OurMethodContent = {
  label: string
  heading: string
  steps: MethodStep[]
}

// The third service page (Figma 3292:4643), and the shortest of the three: the frame draws the hero,
// How We Help, Our Method, Contact and the closing band — no Pricing and no FAQ, unlike the other
// two service pages. Its own type rather than an alias of a slice of BrandingContent, so the two can
// diverge as the rest of this page gets drawn.
//
// `contact` is deliberately absent here too: that section is read off the home doc so one edit moves
// all three service pages.
export type DevelopmentContent = {
  hero: PaidHeroContent
  howWeHelp: HowWeHelpContent
  ourMethod: OurMethodContent
  note: NoteContent
}

// "The Compound Effect" — label/heading/copy on the left, one phase card in the middle, and a
// vertical rail of the phases on the right that selects it. The rail renders every phase; the card
// renders whichever is selected, and skips its title/body while a phase has no copy yet.
export type CompoundContent = {
  label: string
  heading: string // \n is the designer's hard break
  body: string // \n\n are authored paragraph gaps
  phases: CompoundPhase[]
}

export type CompoundPhase = {
  period: string // the rail label, and the tab above the card
  title?: string
  body?: string
}

// "The Channels" — label/heading over a one-card carousel, arrows either side. One slide per channel;
// the arrows wrap, so the count is whatever the CMS gives (with 1 they are inert).
export type ChannelsContent = {
  label: string
  heading: string
  slides: ChannelSlide[]
}

// `lede` is the serif pull-quote under the title, `body` the smaller sans paragraph. `stats` is a
// pair in the design but not fixed here — the panel stacks however many it is given.
export type ChannelSlide = {
  title: string
  lede: string
  body: string
  stats: { value: string; label: string }[]
  quote: string
}

// "The System" — label/heading over a two-column row: the argument on the left, three stacked cards
// on the right, cycling so each takes the front in turn. Ordered back-to-front: the last row starts
// on top, and the deck rotates from there.
export type SystemContent = {
  label: string
  heading: string // \n is the designer's hard break
  body: EmphasisedSentence // \n\n are authored paragraph gaps
  chain: SystemCard[]
}

// One card in the stack. `blurb` is a plain string on the two behind and an EmphasisedSentence on
// the one in front — the design changes face mid-sentence for one italic word there and nowhere
// else. Not a tuple pinning that to the third row: the deck cycles which card is in front, and the
// CMS writes all three rows through the same field, so which one carries the emphasis is content.
export type SystemCard = { title: string; blurb: string | EmphasisedSentence }

// Header global. socials/copyright are only rendered by the mobile dropdown (Figma 3038:1661) —
// the desktop bar is nav-only, so they stay optional and that variant just doesn't get them.
export type HeaderContent = {
  nav: Required<LinkField>[]
  socials?: SocialLink[]
  copyright?: string
}

// Footer global — logo + nav column + contact column + copyright line.
export type FooterContent = {
  nav: Required<LinkField>[]
  email: string
  phone: string
  copyright: string
}
