/**
 * One-off: replaces the /paid-advertising FAQ rows with the copy in src/lib/mock/paid-faq.ts.
 * Run: bun run update:paid-faq   (bun resolves @payload-config via tsconfig paths and auto-loads .env)
 *
 * TOUCHES ONE FIELD, like update-about-team.ts: reads the paid-advertising doc, swaps the FAQ block's
 * `items`, writes the doc back. The block's label/heading and every other block are carried through.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { PAID_FAQ } from '../src/lib/mock/paid-faq'

const payload = await getPayload({ config })

// depth 0: upload relations stay as ids, which is exactly what goes back in on update
const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'paid-advertising' } },
  limit: 1,
  depth: 0,
  pagination: false,
})
const page = docs[0]
if (!page) throw new Error('[faq] no pages/paid-advertising doc found')
if (!page.content.some((b) => b.blockType === 'faq')) throw new Error('[faq] paid doc has no FAQ block')

const content = page.content.map((block) => (block.blockType === 'faq' ? { ...block, items: PAID_FAQ } : block))

// The Pages afterChange hook purges the cached page on its own, so no explicit revalidate.
await payload.update({ collection: 'pages', id: page.id, data: { content }, depth: 0 })
console.log(`[faq] updated pages/paid-advertising — ${PAID_FAQ.length} rows`)
process.exit(0)
