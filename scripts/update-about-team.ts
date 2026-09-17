/**
 * One-off: reorders the home page's About Us team and rewrites their role lines.
 * Run: bun run update:about   (bun resolves @payload-config via tsconfig paths and auto-loads .env)
 *
 * TOUCHES ONE FIELD. Unlike the seed scripts this is not delete-then-create — the home doc is
 * edited in /admin and the database is its source of truth. It reads the home doc, finds its About
 * block, rebuilds that block's `members` array in the order below with the new `role` text, and
 * writes the doc back. Photos, names and every other block are carried through untouched.
 *
 * Matching is by `name`. If any name below isn't in the doc, or the doc has a member not listed
 * here, it stops before writing — so a renamed or extra member in /admin is never silently dropped.
 *
 * Copy mirrors src/lib/mock/home.ts (the fallback); keep the two in step.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const TEAM: { name: string; role: string }[] = [
  { name: 'Cindy Ripoll', role: 'The trusty team leader\nand your first point of contact.' },
  { name: 'Francesca Sequani', role: 'The operations master\nmaking everything run smoothly.' },
  { name: 'Ramon Ripoll', role: 'The design wizard keeping\nyour brand’s look fresh.' },
  { name: 'Leo Sequani', role: 'The adept innovator helping your\nbrand function—on and offline.' },
  { name: 'Adam Jobson', role: 'The dedicated wordsmith\nmanaging your messaging.' },
  { name: 'Nicole Cheer', role: 'The social media guru keeping\nyour community engaged.' },
  { name: 'Harry Mussotte', role: 'The pro videographer capturing\neye-catching content.' },
  { name: 'Diya Afreen', role: 'The ads expert maximizing\nyour conversion potential.' },
]

const payload = await getPayload({ config })

// depth 0: upload relations stay as ids, which is exactly what goes back in on update
const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  depth: 0,
  pagination: false,
})
const home = docs[0]
if (!home) throw new Error('[about] no pages/home doc found')

const content = home.content.map((block) => {
  if (block.blockType !== 'about') return block

  const byName = new Map(block.members.map((m) => [m.name, m]))
  const missing = TEAM.filter((t) => !byName.has(t.name)).map((t) => t.name)
  const extra = block.members.filter((m) => !TEAM.some((t) => t.name === m.name)).map((m) => m.name)
  if (missing.length || extra.length) {
    throw new Error(
      `[about] names don't match — nothing written.\n  not in the doc: ${missing.join(', ') || '—'}\n  not in this script: ${extra.join(', ') || '—'}`,
    )
  }

  console.log('[about] before:', block.members.map((m) => m.name).join(' → '))
  const members = TEAM.map((t) => ({ ...byName.get(t.name)!, role: t.role }))
  console.log('[about] after: ', members.map((m) => m.name).join(' → '))
  return { ...block, members }
})

if (!home.content.some((b) => b.blockType === 'about')) throw new Error('[about] home doc has no About block')

// The Pages afterChange hook purges the cached home page on its own, so no explicit revalidate.
await payload.update({ collection: 'pages', id: home.id, data: { content }, depth: 0 })
console.log('[about] updated pages/home')
process.exit(0)
