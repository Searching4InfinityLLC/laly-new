import type { CollectionConfig } from 'payload'
import { revalidatePages } from '../lib/revalidate'
import { AboutBlock } from '../blocks/about'
import { ChannelsBlock, CompoundBlock, PositioningBlock, SystemBlock } from '../blocks/branding'
import { ContactBlock } from '../blocks/contact'
import { HowWeHelpBlock } from '../blocks/development'
import { HeroBlock } from '../blocks/hero'
import { NoteBlock } from '../blocks/note'
import {
  FaqBlock,
  GuaranteeBlock,
  PaidHeroBlock,
  PricingBlock,
  ResultsBlock,
  WhatYouGetBlock,
} from '../blocks/paid'
import { StrategyBlock } from '../blocks/strategy'
import { WhoWeAreBlock } from '../blocks/whoWeAre'

// Which routes a saved doc invalidates. Its own, always — plus both service pages when it's the home
// doc, because they render the home contact block (see those page components).
const affects = (slug: string): string[] =>
  slug === 'home' ? ['home', 'paid-advertising', 'branding', 'development'] : [slug]

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  // Purge the prerendered html on every save, so /admin edits show up on Vercel immediately instead
  // of whenever the hour-long ISR window happens to lapse. See src/lib/revalidate.ts.
  //
  // skipRevalidation is for bulk writers: scripts/seed-paid.ts touches ~10 docs in one run and would
  // otherwise fire a purge of the same path for each. It sets the flag and purges once at the end.
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (!context?.skipRevalidation) await revalidatePages(affects(doc.slug))
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
  // No versions/drafts at this stage: they'd add _status, create _pages_versions, switch the admin
  // to Save-Draft/Publish (so a seeded doc could sit unpublished and invisible), and need draft
  // handling in getHomeHero — none of it testable without a preview route. Adding them later is
  // additive with no data migration; existing docs count as published.
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Admin-panel label only. Not rendered.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "The route. The home page is 'home'; every other doc is served at /<slug> — 'paid-advertising', 'branding' and 'development' are the ones that exist.",
      },
    },
    {
      name: 'content',
      type: 'blocks',
      required: true,
      minRows: 1,
      admin: {
        description:
          'Pages render these by type, not by the order below — section order is fixed in code, so dragging rows here changes nothing on the site. Deleting a row does: that section falls back to its placeholder copy. The list offers every block in the project; each page only reads the ones it renders (Hero/Who We Are/Strategy/About/Contact/Note on home, Service Hero/Guarantee/What You Get/Results/Pricing/FAQ/Note on paid-advertising, Service Hero/Positioning/The System/The Channels/The Compound Effect/Pricing/FAQ/Note on branding, Service Hero/How We Help/Pricing/FAQ/Note on development).',
      },
      blocks: [
        HeroBlock,
        WhoWeAreBlock,
        StrategyBlock,
        AboutBlock,
        ContactBlock,
        NoteBlock,
        PaidHeroBlock,
        GuaranteeBlock,
        WhatYouGetBlock,
        ResultsBlock,
        PricingBlock,
        FaqBlock,
        PositioningBlock,
        SystemBlock,
        ChannelsBlock,
        CompoundBlock,
        HowWeHelpBlock,
      ],
    },
  ],
}
