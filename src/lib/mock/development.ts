import type { DevelopmentContent } from '@/lib/types'

// Fallback for the Pages 'development' doc — same contract as mock/branding.ts, and the same reason:
// the page prerenders at build time, so an empty or unreachable database has to render rather than
// fail the build. src/lib/cms.ts falls back to these values a block at a time, so one malformed
// block degrades its own section instead of the page.
//
// Five blocks: Figma 3292:4643 draws the hero, How We Help, Pricing, FAQ, Contact and the closing
// band. Contact is read off the home doc, so it is not here.
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
  // Figma 3304:1848. Card colour and the product mock at each card's foot come from the column, not
  // from here — see HELP_ACCENTS in src/lib/palettes.ts.
  howWeHelp: {
    label: 'How We Help',
    heading: 'Smart solutions for your\nbiggest obstacles',
    // two authored lines, one clause each
    description:
      'Every project is different\u2014they face different problems, and require different solutions.\nThat\u2019s why we get acquainted with the client first, then start building.',
    cards: [
      {
        eyebrow: 'SYSTEMS',
        // the only card title with an authored break; the other two wrap on their own
        title: 'Are you losing leads due\nto inefficiency?',
        steps: [
          'One client was struggling to get business from first-time leads because third-party booking platforms were placing a heavier financial strain on the customer end.',
          'We helped them build their own booking platform, addressing this issue at the source to maximize long-term success.',
        ],
      },
      {
        eyebrow: 'DATA',
        title: 'Do you know where your customers come from?',
        steps: [
          'One client needed help visualizing the return on marketing investments because they couldn\u2019t identify where their highest-quality leads were coming from.',
          'We built an automated lead tracking system, showing crucial customer interaction data at a glance. This project served as the foundation for the robust analytics dashboard we now offer to all active clients.',
        ],
      },
      {
        eyebrow: 'AUTOMATION',
        title: 'How much time do you waste in day-to-day upkeep?',
        steps: [
          'One client was wasting time in office taking calls that weren\u2019t actually going to lead to new business, taking valuable time away from the most valuable leads.',
          'We helped automate their intake process, with a system that intelligently directs low-value leads to a receptionist trained on their brand voice, while forwarding high-value cases directly to the client. This has allowed them field more calls without compromising on regular availability and consistent brand expression.',
        ],
      },
    ],
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
