/**
 * Seeds the Pages `branding` doc.
 * Run: bun run seed:branding   (bun resolves @payload-config via tsconfig paths and auto-loads .env)
 *
 * TOUCHES NOTHING ELSE — same rule as scripts/seed-paid.ts, and the same reason: the home doc is
 * edited in /admin and the database is its source of truth. The only query here is
 * `where slug equals 'branding'`; a broader one is how the other docs get destroyed.
 *
 * No uploads, unlike seed-paid. Every image on /branding is a static import — the hero's 20% photo
 * wash and two decorative doodles — so this script writes one page doc and nothing else.
 *
 * Copy below is duplicated verbatim from src/lib/mock/branding.ts rather than imported: that module
 * is typed against @/lib/types via a tsconfig path bun does not resolve outside the Next pipeline.
 * The duplication is intentional — the mock is still the per-block fallback in src/lib/cms.ts, so
 * keeping the two byte-identical is what makes the CMS swap verifiable by diffing the rendered page.
 *
 * Idempotent — safe to re-run, and a re-run discards hand edits made to this page in /admin (the doc
 * is delete-then-create).
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePages } from '../src/lib/revalidate'

const SLUG = 'branding'

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
    title: 'Branding',
    slug: SLUG,
    // Order here is cosmetic — the page matches blocks by type. Seeded in visual order anyway so the
    // admin reads like the page.
    content: [
      {
        // shared with /paid-advertising: ServiceHero draws both pages off this one block
        blockType: 'paidHero',
        label: 'Brand Visibility Services',
        heading: 'Be the name they think of first.',
        pills: [{ label: 'Socials' }, { label: 'SEO' }, { label: 'OOH' }, { label: 'Events' }],
        description: {
          before:
            'We build a visibility system across search, social, and the physical world where every channel feeds the next. ',
          emphasis: 'The result:',
          after: ' your brand becomes the default choice before prospects ever need you.',
        },
        button: { label: 'LET’S BEGIN' },
      },
      {
        blockType: 'positioning',
        body: {
          before: 'Paid ads rent attention. ',
          emphasis: 'Brand owns it',
          after: '.',
        },
        scratchLabel: 'Scratch To Reveal',
      },
      {
        blockType: 'system',
        label: 'The System',
        heading: 'Three symbiotic channels that\nstrengthen each other.',
        body: {
          before: 'Most agencies run SEO, social, and OOH as three disconnected operations.\n\n',
          emphasis:
            'We engineer them as a single system where every channel drives traffic to the others.',
          after:
            ' We carefully guide potential clients from seeing your billboard, to searching your name, to following your socials.\n\nBy the time they need you, their decision will have already been made.',
        },
        // back to front: Physical is the bottom of the stack, Search starts on top in full colour
        chain: [
          { title: 'Physical', blurb: { before: 'They see you everywhere they go' } },
          { title: 'Social', blurb: { before: 'They trust you before they call' } },
          {
            title: 'Search',
            blurb: { before: 'They ', emphasis: 'find', after: ' you when they need you' },
          },
        ],
      },
      {
        blockType: 'channels',
        label: 'The Channels',
        heading: 'What each channel actually does for your firm.',
        slides: [
          {
            title: 'Search Visibility',
            lede: 'Organic leads that cost you $0 per click, every single month, compounding over time.',
            body: 'We optimize your entire web presence so Google treats you as the authority in your market. Every page we publish, every backlink we earn, every technical fix we implement keeps working for you—for months and years to come. This is the channel that makes your cost per lead drop over time instead of rising.',
            stats: [
              { value: '260%', label: 'Growth in legal SEO investment since 2017' },
              { value: '96%', label: 'Of people seeking legal help start with a search engine' },
            ],
            quote:
              '"The pages we built months ago are still generating calls today. That\'s the difference between renting leads and owning a pipeline."',
          },
          {
            title: 'Social Media',
            lede: 'Authority, relatability, and referrals from people who feel like they already know you.',
            body: 'People hire people they trust. We build your online presence so that when someone in your market asks "know a good lawyer?", your name is the first answer. From creative content generation, to community engagement, to collaborator partnerships, we are constantly testing and adapting your strategy, because that\'s what actually grows an audience.',
            stats: [
              { value: '71%', label: 'Of law firms report gaining new leads through social media' },
              {
                value: '74%',
                label: "Of potential clients check a firm's online profiles before calling",
              },
            ],
            quote:
              '"Social doesn\'t replace ads. It makes everything else work better: SEO clicks convert higher, billboards get searched, referrals come faster."',
          },
          {
            title: 'Out-of-Home',
            lede: 'Physical dominance in your market. The kind of presence that makes competitors irrelevant.',
            body: 'Billboards, events, sponsorships, merchandise, community activations. When your name is on the highway, at community events, on the athletic field, and beyond, you stop being "an option" and become "the only option." Morgan & Morgan didn\'t become the biggest PI firm in America through Google Ads alone. They\'re the largest OOH advertiser in the entire country.',
            stats: [
              { value: '76%', label: 'Of consumers take action after seeing an out-of-home ad' },
              { value: '90%', label: 'Of adults notice OOH advertising monthly' },
            ],
            quote:
              '"Legal services is the fastest-growing OOH spending category in America. The firms investing now are building moats their competitors can\'t replicate."',
          },
        ],
      },
      {
        blockType: 'compound',
        label: 'The Compound Effect',
        heading: 'Every month\nbuilds on the last.',
        body: 'The longer you run brand strategy, the cheaper each lead becomes and the less dependent you are on any single paid channel.',
        phases: [
          {
            period: 'Months 1–6',
            title: 'Foundation',
            body: 'Site optimization.\nContent creation.\nSocial launch.\nOOH placements go live.\nGoogle begins indexing and recognizing your site.\nBrand awareness seeds planted.',
          },
          {
            period: 'Months 6–12',
            title: 'Traction',
            body: 'First organic rankings appear.\nSocial engagement compounds. Brand name searches begin increasing.\nDirect leads start flowing from organic search.',
          },
          {
            period: 'Months 12–18',
            title: 'Momentum',
            body: 'Organic traffic rival paid ad volume.\nCost per acquisition drops.\nReferrals increase with community recognition and social proof.\nAd dependency decreases.',
          },
          {
            period: 'Year 2+',
            title: 'Dominance',
            body: 'Multi-channel acceleration in full effect.\nYou own page one of search, the social media feed, and local recognition.\nCompetitors can’t replicate 18 months of compounding in a single quarter.',
          },
        ],
      },
      {
        // identical to /paid-advertising's pricing, copy included — its own rows so the two pages
        // can diverge without a code change
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
        // this page's own closing band — the break after "brand" is the designer's
        body: 'You have revenue from ads. Now build the brand\nthat makes every future dollar cheaper to acquire.',
      },
    ],
  },
})

console.log(`[seed] created pages/${SLUG} with 8 blocks`)

// One purge, and only this page's path. Points at .env's NEXT_PUBLIC_SITE_URL (localhost) by
// default; to push a seed straight to production:
//   REVALIDATE_BASE_URL=https://laly-new.vercel.app bun run seed:branding
await revalidatePages([SLUG])
console.log(`[seed] requested ISR purge of /${SLUG}`)

// mongoose keeps the Atlas socket open; without this the process hangs.
process.exit(0)
