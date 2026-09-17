import type { Block } from 'payload'

// The four /branding blocks that are this page's own. One file, same call as blocks/paid.ts: these
// exist only as this page's stack and are read as one screen. Mirrors the Branding* types in
// src/lib/types.ts.
//
// Four, not eight, because half the page is already blocks:
//   - the hero is `paidHero` — ServiceHero renders both service pages off PaidHeroContent, so a
//     second identical block would be a second identical converter for the same shape
//   - Pricing, FAQ and the dark closing band reuse `pricing`, `faq` and `note`
// This doc just carries its own rows of those.

// Every section opens with the same bracketed eyebrow. Bare text in the CMS: the brackets are
// authored in the section's JSX, exactly like the home sections put them in CSS.
const labelField: Block['fields'][number] = {
  name: 'label',
  type: 'text',
  required: true,
  admin: { description: 'Bare text. The [ brackets ] and uppercasing are added by the section.' },
}

// The one sentence that changes face mid-way. Used for the positioning line and for "The System"'s
// argument; a factory rather than a constant because Payload sanitizes field configs in place.
const emphasisedSentence = (name: string, description: string): Block['fields'][number] => ({
  name,
  type: 'group',
  admin: { description },
  fields: [
    { name: 'before', type: 'textarea', required: true },
    { name: 'emphasis', type: 'text', required: true },
    {
      name: 'after',
      type: 'textarea',
      required: true,
      admin: { description: 'Starts with the punctuation that closes the emphasised phrase.' },
    },
  ],
})

export const PositioningBlock: Block = {
  slug: 'positioning',
  interfaceName: 'PositioningBlock',
  labels: { singular: 'Positioning Band', plural: 'Positioning Bands' },
  fields: [
    emphasisedSentence(
      'body',
      'One sentence in three parts: the middle one is the medium-weight run set against the serif. Mind the spaces at the joins.',
    ),
    {
      name: 'scratchLabel',
      type: 'text',
      required: true,
      defaultValue: 'Scratch To Reveal',
      admin: {
        description:
          'Printed on the panel covering the copy above. Never seen under reduced motion, where the cover is not drawn at all.',
      },
    },
  ],
}

export const SystemBlock: Block = {
  slug: 'system',
  interfaceName: 'SystemBlock',
  labels: { singular: 'The System', plural: 'The System' },
  fields: [
    labelField,
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      admin: { description: 'Press Enter for the authored break — the designer set two lines.' },
    },
    emphasisedSentence(
      'body',
      'The argument, in three parts: the middle one is the bold thesis. Leave a blank line for a paragraph gap.',
    ),
    {
      name: 'chain',
      type: 'array',
      required: true,
      // Three palettes are drawn by hand, one per row, and the stack's geometry is built for three.
      minRows: 3,
      maxRows: 3,
      admin: {
        description:
          'The three cards, back to front — the last row starts on top, and the deck cycles from there so each takes the front in turn. Each row keeps its own colour, which comes from its position here.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'blurb',
          type: 'group',
          admin: {
            description:
              'Usually just "Before". Fill in Emphasis and After as well to set one word in italics mid-sentence, the way the design does on the front card.',
          },
          fields: [
            { name: 'before', type: 'textarea', required: true },
            {
              name: 'emphasis',
              type: 'text',
              admin: { description: 'Optional. Rendered italic.' },
            },
            {
              name: 'after',
              type: 'textarea',
              admin: { description: 'Only read when Emphasis is filled in.' },
            },
          ],
        },
      ],
    },
  ],
}

export const ChannelsBlock: Block = {
  slug: 'channels',
  interfaceName: 'ChannelsBlock',
  labels: { singular: 'The Channels', plural: 'The Channels' },
  fields: [
    labelField,
    { name: 'heading', type: 'textarea', required: true },
    {
      name: 'slides',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description:
          'One card per channel. The arrows cycle round, so any number works — with one they go nowhere. Every card is laid out at the height of the tallest, so a much longer row grows all three.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'lede',
          type: 'textarea',
          required: true,
          admin: { description: 'The pull-quote under the title, a size up from the paragraph.' },
        },
        { name: 'body', type: 'textarea', required: true },
        {
          name: 'stats',
          type: 'array',
          required: true,
          minRows: 1,
          admin: { description: 'The figures in the panel beside the copy. A pair in the design.' },
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { description: 'The big number, e.g. "260%". Free text — not counted up.' },
            },
            { name: 'label', type: 'textarea', required: true },
          ],
        },
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          admin: { description: 'Closes the panel, under a rule. Type the quotation marks.' },
        },
      ],
    },
  ],
}

export const CompoundBlock: Block = {
  slug: 'compound',
  interfaceName: 'CompoundBlock',
  labels: { singular: 'The Compound Effect', plural: 'The Compound Effect' },
  fields: [
    labelField,
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      admin: { description: 'Press Enter for the authored break — the designer set two lines.' },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: { description: 'Leave a blank line between paragraphs; both gaps are authored.' },
    },
    {
      name: 'phases',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description:
          'The timeline, earliest first. On desktop the section holds the page and each scroll moves one phase; on a phone they are simply listed. Adding a row lengthens both.',
      },
      fields: [
        {
          name: 'period',
          type: 'text',
          required: true,
          admin: { description: 'The rail label and the tab above the card, e.g. "Months 1–6".' },
        },
        {
          name: 'title',
          type: 'textarea',
          required: true,
          admin: { description: 'Every Enter you press is a real line break.' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          admin: { description: 'One bullet per line — every Enter starts a new bullet point.' },
        },
      ],
    },
  ],
}
