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
 * Four blocks, not eight: Figma 3292:4643 draws the hero, Pricing, FAQ, Contact and the closing band
 * and nothing between them, and Contact is read off the home doc.
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
        // identical to the other two pages' pricing, copy included — its own rows so the three can
        // diverge without a code change
        blockType: 'pricing',
        label: 'Pricing',
        heading: 'Simple. Transparent.\nPerformance-based.',
        tiers: [
          {
            label: 'One-time Setup',
            price: '$20,000',
            items: [
              { label: 'Business audit' },
              { label: 'Custom Scaling Roadmap' },
              { label: 'Full Website Build' },
              { label: 'Campaign Architecture' },
              { label: 'Tracking Infrastructure' },
              { label: 'Call Handling Setup' },
              { label: 'Reporting Dashboard' },
            ],
          },
          {
            label: 'Per Qualified Lead',
            price: '$1,500',
            badge: 'PAY AS THEY COME IN',
            items: [
              {
                label:
                  'Only qualified leads that pass our filter and match the criteria we agreed on.',
              },
              { label: 'You review every lead in your dashboard.' },
              { label: 'Dispute any you disagree with.' },
              { label: 'Pay as they come in.' },
            ],
          },
        ],
        cta: { label: 'BOOK A CALL' },
      },
      {
        blockType: 'faq',
        label: 'FAQ',
        heading: 'Frequently Asked Questions',
        // The Figma FAQ is five lorem rows with one lorem answer — the copy has not been written.
        // Seeded verbatim rather than invented, so nobody mistakes filler for approved copy.
        items: Array.from({ length: 5 }, () => ({
          question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
          answer: 'This is subtext which appears after expanding the accordion.',
        })),
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
