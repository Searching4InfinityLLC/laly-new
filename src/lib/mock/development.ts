import type { DevelopmentContent } from '@/lib/types'

// Fallback for the Pages 'development' doc — same contract as mock/branding.ts, and the same reason:
// the page prerenders at build time, so an empty or unreachable database has to render rather than
// fail the build. src/lib/cms.ts falls back to these values a block at a time, so one malformed
// block degrades its own section instead of the page.
//
// Four blocks: Figma 3292:4643 draws the hero, How We Help, Our Method, Contact and the closing
// band. Contact is read off the home doc, so it is not here — and unlike the other two service
// pages, the frame draws no Pricing and no FAQ.
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
  // Figma 3318:2717. The "1—" numbering is the row's position, not a value — see OurMethod.tsx.
  ourMethod: {
    label: 'our method',
    heading: 'Don’t compromise\non quality',
    steps: [
      {
        title: 'Customized.',
        body:
          'We’re not following templates or offering a limited set of services. We’re building bespoke solutions for the real problems your business faces.',
      },
      {
        title: 'Functional.',
        body:
          'Every tool we create undergoes rigorous testing and quality control. Because we control the process from concept to execution, we know exactly how our software needs to work, and we ensure that it does.',
      },
      {
        title: 'Clean.',
        body:
          'Our development team is dedicated to ensuring every tool is efficient and user-friendly, with a clean and professional interface. We handle the confusing stuff in the background so the front-facing product is easy to use.',
      },
      {
        title: 'Needs-Based.',
        body:
          'Rest assured: we don’t just use tech for tech’s sake. We’re not looking to clutter your systems with redundant technology for the sake of trendiness. Instead, we’re finding the gaps in your process, and building software to fill them.',
      },
    ],
  },
  // Figma 3292:4851 — the same closing band the other two pages use, and on this frame the designer
  // left /paid-advertising's line rather than writing a development one. 458 is the Figma text
  // width, and it is what breaks the line.
  note: {
    body: 'We’re looking for firms ready to scale. If you have the ad budget and want leads that actually convert, let’s talk.',
  },
}
