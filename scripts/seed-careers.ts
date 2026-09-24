/**
 * Seeds the Pages `careers` doc and the Brand Strategist role.
 * Run: bun run seed:careers   (bun resolves @payload-config via tsconfig paths and auto-loads .env)
 *
 * TOUCHES NOTHING ELSE. Pages: only `where slug equals 'careers'`, delete-then-create like the other
 * seeds. Roles: upserts by slug — a role with the same slug is replaced, every other role (added in
 * /admin since) is left alone.
 *
 * Copy is imported from src/lib/mock/careers.ts (image-free, like mock/paid-faq.ts), so the seed and
 * the fallback can't drift.
 *
 * Idempotent — safe to re-run, and a re-run discards /admin edits to the careers doc and to the
 * seeded role.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { careers, roles } from '../src/lib/mock/careers'
import { revalidatePages } from '../src/lib/revalidate'

const SLUG = 'careers'
const NO_REVALIDATE = { skipRevalidation: true }

const payload = await getPayload({ config })

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

const { hero, about, openRoles } = careers
await payload.create({
  collection: 'pages',
  context: NO_REVALIDATE,
  data: {
    title: 'Careers',
    slug: SLUG,
    content: [
      {
        blockType: 'paidHero',
        label: hero.label,
        heading: hero.heading,
        pills: hero.pills.map((label) => ({ label })),
        description: hero.description,
        button: hero.button,
      },
      { blockType: 'careersAbout', ...about },
      { blockType: 'openRoles', ...openRoles },
    ],
  },
})
console.log('[seed] created pages/careers')

for (const [i, role] of roles.entries()) {
  const data = {
    title: role.title,
    slug: role.slug,
    status: 'open' as const,
    order: i,
    summary: role.summary,
    pay: role.pay,
    tags: role.tags.map((label) => ({ label })),
    about: role.about,
    responsibilities: role.responsibilities.map((text) => ({ text })),
    requirements: role.requirements.map((text) => ({ text })),
    details: role.details,
  }
  const found = await payload.find({
    collection: 'roles',
    where: { slug: { equals: role.slug } },
    limit: 1,
    pagination: false,
  })
  if (found.docs[0]) {
    await payload.update({ collection: 'roles', id: found.docs[0].id, data, context: NO_REVALIDATE })
    console.log(`[seed] updated roles/${role.slug}`)
  } else {
    await payload.create({ collection: 'roles', data, context: NO_REVALIDATE })
    console.log(`[seed] created roles/${role.slug}`)
  }
}

await revalidatePages(['careers', ...roles.map((r) => `careers/${r.slug}`)])
console.log('[seed] done')
process.exit(0)
