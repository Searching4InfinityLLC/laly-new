import type { CollectionConfig } from 'payload'
import { revalidatePages } from '../lib/revalidate'

// The job openings behind /careers and /careers/<slug>. A collection rather than an array on the
// careers page doc: each role is its own page, gets its own URL in an ad, and is added, closed and
// deleted on its own — that is CRUD, which is what a collection is.
//
// Slug is `roles`, not `jobs`: Payload already owns `jobs` for its task queue (Config['jobs'] in
// payload-types.ts), and a collection of the same name reads like it is part of that.
//
// Mirrors Role in src/lib/types.ts; src/lib/cms.ts (toRole) is the only place the two meet.

// A role renders on the landing list AND on its own page, so a save purges both. A renamed slug
// also purges the old URL, or it keeps serving the prerendered page until the ISR window lapses.
const affects = (slug?: string | null, previous?: string | null): string[] =>
  ['careers', slug && `careers/${slug}`, previous && previous !== slug && `careers/${previous}`].filter(
    (s): s is string => Boolean(s),
  )

export const Roles: CollectionConfig = {
  slug: 'roles',
  labels: { singular: 'Open Role', plural: 'Open Roles' },
  // Public read, same as Pages — the frontend queries these with no user. Writes fall to Payload's
  // default (any logged-in admin user).
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'pay', 'order', 'updatedAt'],
    description:
      'Every open role is listed on /careers and has its own page at /careers/<slug>. Set Status to Closed to take a role down without losing its copy.',
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, context }) => {
        if (!context?.skipRevalidation) await revalidatePages(affects(doc.slug, previousDoc?.slug))
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, context }) => {
        if (!context?.skipRevalidation) await revalidatePages(affects(doc.slug))
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "Brand Strategist".' } },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: {
            description:
              'The URL: /careers/<slug>. Lowercase words joined by hyphens, e.g. "brand-strategist". Changing it breaks any ad already pointing at the old one.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'open',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ],
          admin: { description: 'Closed roles leave the list and their page 404s.' },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Lower numbers list first.' },
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'One sentence. Shown on the role card on /careers and under the heading on the role page.',
      },
    },
    {
      name: 'pay',
      type: 'text',
      required: true,
      admin: { description: 'As it should read, e.g. "$40–$50/hour".' },
    },
    {
      name: 'tags',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      labels: { singular: 'Tag', plural: 'Tags' },
      admin: {
        description:
          'Short facts, e.g. Remote / 1099 Contractor / 20–25 hrs/week. The pay is added after these automatically, so the hero holds four pills.',
      },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'about',
      type: 'textarea',
      required: true,
      admin: { description: '"About the role". Leave a blank line between paragraphs.' },
    },
    {
      name: 'responsibilities',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
      admin: { description: '"What you’ll do" — one bullet per row, top to bottom.' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'requirements',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
      admin: { description: '"What we’re looking for" — one bullet per row, top to bottom.' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'details',
      type: 'array',
      labels: { singular: 'Detail', plural: 'Details' },
      admin: {
        description: 'The "Position details" panel beside the description, e.g. Compensation / Location / Hours.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
