import type { DevelopmentContent } from '@/lib/types'

// Fallback for the Pages 'development' doc — same contract as mock/branding.ts, and the same reason:
// the page prerenders at build time, so an empty or unreachable database has to render rather than
// fail the build. src/lib/cms.ts falls back to these values a block at a time, so one malformed
// block degrades its own section instead of the page.
//
// Four blocks, not eight: Figma 3292:4643 draws the hero, Pricing, FAQ, Contact and the closing band
// and nothing between them. The sections the other two service pages have in that gap have not been
// designed yet, so nothing here stands in for them — the page is short on purpose.
//
// Keep byte-identical to scripts/seed-development.ts, which writes the same copy into the doc — that
// is what makes the CMS swap verifiable by diffing the rendered page.
export const development: DevelopmentContent = {
  // Figma 3292:4644
  hero: {
    label: 'Digital Software Development',
    heading: 'We build the tools, you reap the benefits',
    // Verbatim from the frame (3292:4652).
    pills: ['UX/UI', '3D', 'CRM', 'Apps'],
    description: {
      // No emphasis run at all on this hero, unlike the other two — 3292:4657 is one flat paragraph
      // in New Spirit, so `emphasis`/`after` stay unset and ServiceHero skips the <strong>.
      before:
        'Most businesses rely on third-party software to meet their marketing goals, even if those tools aren’t a good fit. We develop custom software based on how your business works—and where it’s falling short.',
    },
    button: { label: 'LET’S BEGIN' },
  },
  // Figma 3292:4806. Identical to /branding's and /paid-advertising's pricing block, copy included —
  // kept as its own values rather than an import of either mock so the three pages can diverge
  // without a refactor.
  pricing: {
    label: 'Pricing',
    // the break after "Transparent." is authored, not a wrap
    heading: 'Simple. Transparent.\nPerformance-based.',
    tiers: [
      {
        label: 'One-time Setup',
        price: '$20,000',
        items: [
          'Business audit',
          'Custom Scaling Roadmap',
          'Full Website Build',
          'Campaign Architecture',
          'Tracking Infrastructure',
          'Call Handling Setup',
          'Reporting Dashboard',
        ],
      },
      {
        label: 'Per Qualified Lead',
        price: '$1,500',
        badge: 'PAY AS THEY COME IN',
        items: [
          'Only qualified leads that pass our filter and match the criteria we agreed on.',
          'You review every lead in your dashboard.',
          'Dispute any you disagree with.',
          'Pay as they come in.',
        ],
      },
    ],
    cta: { label: 'BOOK A CALL' },
  },
  // Figma 3292:4826 — the same FAQ instance the other two service pages carry.
  faq: {
    label: 'FAQ',
    heading: 'Frequently Asked Questions',
    // ponytail: the Figma FAQ is five lorem rows with one lorem answer — the copy has not been
    // written. Shipped verbatim rather than invented, so nobody mistakes filler for approved copy.
    items: Array.from({ length: 5 }, () => ({
      question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
      answer: 'This is subtext which appears after expanding the accordion.',
    })),
  },
  // Figma 3292:4851 — the same closing band the other two pages use, and on this frame the designer
  // left /paid-advertising's line rather than writing a development one. 458 is the Figma text
  // width, and it is what breaks the line.
  note: {
    body: 'We’re looking for firms ready to scale. If you have the ad budget and want leads that actually convert, let’s talk.',
  },
}
