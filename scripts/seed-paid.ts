/**
 * Seeds the Pages `paid-advertising` doc and the four product mocks it renders.
 * Run: bun run seed   (bun resolves @payload-config via tsconfig paths and auto-loads .env)
 *
 * TOUCHES NOTHING ELSE. The home doc is edited in /admin and the database is its source of truth —
 * this script must never delete, rewrite or prune anything outside the four files listed below and
 * the one page doc. Its predecessor (scripts/seed-home.ts, in git history) rebuilt BOTH docs and
 * pruned every Media doc it had not just uploaded; running that today would wipe the home copy and
 * every image behind it. It was deleted rather than left lying around.
 *
 * Copy below is duplicated verbatim from src/lib/mock/paid.ts rather than imported: that module
 * static-imports .webp files, which bun cannot resolve outside the Next pipeline — importing it
 * would kill this script at parse time. The duplication is intentional: the mock is still the
 * per-block fallback in src/lib/cms.ts, so keeping the two byte-identical is what makes the CMS swap
 * verifiable by diffing the rendered page.
 *
 * Idempotent — safe to re-run, and a re-run discards hand edits made to this page in /admin (the
 * doc is delete-then-create). It re-uploads the four mocks to Vercel Blob every time.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PAID_FAQ } from '../src/lib/mock/paid-faq'
import { revalidatePages } from '../src/lib/revalidate'

// fileURLToPath, not bun's import.meta.dir — keeps this runnable under both `bun run seed` and the
// `payload run` fallback (which executes on Node).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SLUG = 'paid-advertising'

// Media and Pages both purge the ISR cache in afterChange/afterDelete. This run touches ~10 docs and
// every one of them would POST a purge for the same path, so they are suppressed and one purge fires
// at the end instead.
const NO_REVALIDATE = { skipRevalidation: true }

const payload = await getPayload({ config })

// Delete-then-create rather than reuse-if-present: Payload appends a suffix on filename collision
// (website-1.webp), so a plain re-run would leave orphaned duplicates. Scoped to one filename at a
// time, so it can only ever touch the four files this script owns.
//
// `relPath` is relative to public/. Returns the new doc id.
async function upload(relPath: string, alt: string): Promise<string> {
  const filename = path.basename(relPath)

  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    pagination: false,
  })
  for (const stale of found.docs) {
    await payload.delete({ collection: 'media', id: stale.id, context: NO_REVALIDATE })
  }

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    context: NO_REVALIDATE,
    filePath: path.join(ROOT, 'public', relPath),
  })
  // Dimensions double as the sharp smoke test: nullxnull on an image means sharp isn't reaching
  // Payload, and the adapter will drop that doc rather than emit sizes="NaNpx".
  console.log(`[seed] uploaded ${filename} -> ${doc.width}x${doc.height}`)
  return String(doc.id)
}

// ponytail: no prune. The home page's media lives in this same collection and a Media doc carries no
// record of which page uses it, so "delete everything this run didn't upload" is not a question this
// script can answer safely any more. Ceiling: renaming one of the four files below strands its old
// Media doc and its blob object — delete that one by hand in /admin.

// Replace only this page's doc. `where slug equals` and nothing else — a broader query here is how
// the home doc gets destroyed.
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

// Only the four "what you get" mocks are Media docs. The hero photo and the grid texture stay static
// imports in the page: they are ground textures with empty alt, i.e. design rather than content.
const panelShots: string[] = []
for (const [file, alt] of [
  ['website.webp', 'Preview of a conversion-optimised landing page'],
  ['calls.webp', 'Call attribution breakdown and total call count widgets'],
  ['dashboard.webp', 'Lead dashboard showing call volume over time'],
  ['refund.webp', 'Full refund card marked zero risk'],
] as const) {
  panelShots.push(await upload(`paid-advertising/${file}`, alt))
}

await payload.create({
  collection: 'pages',
  // suppressed like the uploads above — the explicit purge at the foot of this file covers it, and
  // without this the doc's own afterChange hook fires a second, identical POST
  context: NO_REVALIDATE,
  data: {
    title: 'Paid Advertising',
    slug: SLUG,
    // Order here is cosmetic — the page matches blocks by type. Seeded in visual order anyway so the
    // admin reads like the page.
    content: [
      {
        blockType: 'paidHero',
        label: 'Pay Per Performance',
        heading: 'You only pay when we deliver.',
        // star tints come from the row position (PILL_COLORS), so these are labels only
        pills: [
          { label: 'Google Ads' },
          { label: 'Microsoft Ads' },
          { label: 'TikTok Ads' },
          { label: 'Meta Ads' },
        ],
        // one sentence in three parts — the middle one is the bold Neue Haas run the designer put
        // mid-sentence. Mind the trailing space and the leading full stop.
        description: {
          before:
            'We build your website, run your ads, handle your calls, filter your leads, and only send you the ones worth signing. ',
          emphasis: 'You pay per qualified lead',
          after: '. If we don’t deliver in 6 months, you get your setup fee back.',
        },
        // href omitted: no destination yet, so Button renders inert.
        button: { label: 'LET’S BEGIN' },
      },
      {
        blockType: 'guarantee',
        // the break is authored — the designer set two lines
        body: 'Zero leads in 6 months?\nFull refund. No questions asked.',
        scratchLabel: 'Scratch To Reveal',
      },
      {
        blockType: 'whatYouGet',
        label: 'What You Get',
        heading: 'Everything built, managed, and filtered for you.',
        // layout order: wide, the pair, wide — the page indexes these four slots
        panels: [
          {
            title: 'A brand new website, built to convert.',
            body: 'Included in your setup fee. We design and develop a conversion-optimized website from scratch: fast, mobile-first, and engineered specifically to turn ad clicks into phone calls and form submissions. No templates. No DIY builders. A custom site built for your practice.',
            image: panelShots[0],
          },
          {
            title: 'We answer every call and filter every lead.',
            body: 'Our team handles every inbound call and form submission generated by your campaigns. We qualify each one using criteria we define together at onboarding. Junk calls, tire kickers, wrong practice area? We filter them out. You only hear from leads worth your time.',
            image: panelShots[1],
          },
          {
            title: 'A real-time dashboard to track, dispute, and pay as you go.',
            body: "No surprise invoices. Your dashboard shows every lead as it comes in, with full transparency. See your lead count, review details, dispute any lead you disagree with, and pay throughout the month. You're always in control of what you owe.",
            image: panelShots[2],
          },
          {
            title: 'Money-back guarantee. Zero risk.',
            body: "If we don't generate a single qualified lead within 6 months of campaign launch, your $20,000 setup fee is refunded in full. You maintain your minimum ad spend, we do the rest. If it doesn't work, you walk away whole.",
            image: panelShots[3],
          },
        ],
      },
      {
        blockType: 'results',
        label: 'Results',
        heading: 'The numbers speak.',
        // the \n is a desktop-only break — on a phone the same copy wraps to the card
        stats: [
          { value: '31', label: 'Qualified leads generated in a\nsingle month for one client' },
          { value: '$0', label: "What you owe\nif we don't deliver in 6 months" },
          { value: '100%', label: 'Of our revenue\ntied to your results' },
        ],
      },
      {
        blockType: 'pricing',
        label: 'Pricing',
        // the break after "Transparent." is authored
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
            // filling this in is also what gives the card the brand keyline and glow
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
        // imported, not duplicated: paid-faq.ts has no .webp imports, so bun can load it
        items: PAID_FAQ,
      },
      {
        blockType: 'note',
        // this page's own qualifier band — the home doc's note says something else
        body: 'You have revenue from ads. Now build the brand that makes every future dollar cheaper to acquire.',
      },
    ],
  },
})

console.log(`[seed] created pages/${SLUG} with 7 blocks`)

// One purge for the whole run, and only this page's path — the home doc was not touched. Points at
// .env's NEXT_PUBLIC_SITE_URL (localhost) by default; to push a seed straight to production:
//   REVALIDATE_BASE_URL=https://laly-new.vercel.app bun run seed
await revalidatePages([SLUG])
console.log(`[seed] requested ISR purge of /${SLUG}`)

// mongoose keeps the Atlas socket open; without this the process hangs.
process.exit(0)
