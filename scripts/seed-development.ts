/**
 * Seeds the Pages `development` doc.
 * Run: bun run seed:development   (bun resolves @payload-config via tsconfig paths and auto-loads .env)
 *
 * TOUCHES NOTHING ELSE — same rule as scripts/seed-branding.ts, and the same reason: the home doc is
 * edited in /admin and the database is its source of truth. The only query here is
 * `where slug equals 'development'`; a broader one is how the other docs get destroyed.
 *
 * No uploads. The one image on /development is the hero's 20% photo wash, a static import.
 *
 * Four blocks: Figma 3292:4643 draws the hero, How We Help, Our Method, Contact and the closing
 * band, and Contact is read off the home doc. Unlike the other two service pages, the frame draws no
 * Pricing and no FAQ.
 *
 * Copy below is duplicated verbatim from src/lib/mock/development.ts rather than imported: that
 * module is typed against @/lib/types via a tsconfig path bun does not resolve outside the Next
 * pipeline. The duplication is intentional — the mock is still the per-block fallback in
 * src/lib/cms.ts, so keeping the two byte-identical is what makes the CMS swap verifiable by diffing
 * the rendered page.
 *
 * Idempotent — safe to re-run, and a re-run discards hand edits made to this page in /admin (the doc
 * is delete-then-create).
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePages } from '../src/lib/revalidate'

const SLUG = 'development'

// The doc's own afterChange hook would fire a purge; suppressed so the explicit one at the foot of
// this file is the only request.
const NO_REVALIDATE = { skipRevalidation: true }

const payload = await getPayload({ config })

// Replace only this page's doc.
const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: SLUG } },
  limit: 1,
  pagination: false,
})
for (const doc of existing.docs) {
  await payload.delete({ collection: 'pages', id: doc.id, context: NO_REVALIDATE })
  console.log(`[seed] deleted existing pages/${doc.slug}`)
}

await payload.create({
  collection: 'pages',
  context: NO_REVALIDATE,
  data: {
    title: 'Development',
    slug: SLUG,
    // Order here is cosmetic — the page matches blocks by type. Seeded in visual order anyway so the
    // admin reads like the page.
    content: [
      {
        // shared with the other two service pages: ServiceHero draws all three off this one block
        blockType: 'paidHero',
        label: 'Digital Software Development',
        heading: 'We build the tools, you reap the benefits',
        // Verbatim from the frame (3292:4652).
        pills: [{ label: 'UX/UI' }, { label: '3D' }, { label: 'CRM' }, { label: 'Apps' }],
        description: {
          // No emphasis run on this hero, unlike the other two — one flat paragraph, so the bold
          // phrase and its tail are left blank and the section renders no <strong>.
          before:
            'Most businesses rely on third-party software to meet their marketing goals, even if those tools aren’t a good fit. We develop custom software based on how your business works—and where it’s falling short.',
        },
        button: { label: 'LET’S BEGIN' },
      },
      {
        // Figma 3304:1848 — this page's own block. Colour and the product mock at each card's foot
        // come from the column, not from the row data.
        blockType: 'howWeHelp',
        label: 'How We Help',
        heading: 'Smart solutions for your\nbiggest obstacles',
        description:
          'Every project is different\u2014they face different problems, and require different solutions.\nThat\u2019s why we get acquainted with the client first, then start building.',
        cards: [
          {
            eyebrow: 'SYSTEMS',
            title: 'Are you losing leads due\nto inefficiency?',
            steps: [
              {
                text: 'One client was struggling to get business from first-time leads because third-party booking platforms were placing a heavier financial strain on the customer end.',
              },
              {
                text: 'We helped them build their own booking platform, addressing this issue at the source to maximize long-term success.',
              },
            ],
          },
          {
            eyebrow: 'DATA',
            title: 'Do you know where your customers come from?',
            steps: [
              {
                text: 'One client needed help visualizing the return on marketing investments because they couldn\u2019t identify where their highest-quality leads were coming from.',
              },
              {
                text: 'We built an automated lead tracking system, showing crucial customer interaction data at a glance. This project served as the foundation for the robust analytics dashboard we now offer to all active clients.',
              },
            ],
          },
          {
            eyebrow: 'AUTOMATION',
            title: 'How much time do you waste in day-to-day upkeep?',
            steps: [
              {
                text: 'One client was wasting time in office taking calls that weren\u2019t actually going to lead to new business, taking valuable time away from the most valuable leads.',
              },
              {
                text: 'We helped automate their intake process, with a system that intelligently directs low-value leads to a receptionist trained on their brand voice, while forwarding high-value cases directly to the client. This has allowed them field more calls without compromising on regular availability and consistent brand expression.',
              },
            ],
          },
        ],
      },
      {
        // Figma 3318:2717 — this page's own block. Row numbering is the array order, not a field.
        blockType: 'ourMethod',
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
      {
        blockType: 'note',
        // The frame carries /paid-advertising's line — the designer has not written a development
        // one. Seeded as drawn.
        body: 'We’re looking for firms ready to scale. If you have the ad budget and want leads that actually convert, let’s talk.',
      },
    ],
  },
})

console.log(`[seed] created pages/${SLUG} with 4 blocks`)

// One purge, and only this page's path. Points at .env's NEXT_PUBLIC_SITE_URL (localhost) by
// default; to push a seed straight to production:
//   REVALIDATE_BASE_URL=https://laly-new.vercel.app bun run seed:development
await revalidatePages([SLUG])
console.log(`[seed] requested ISR purge of /${SLUG}`)

// mongoose keeps the Atlas socket open; without this the process hangs.
process.exit(0)
