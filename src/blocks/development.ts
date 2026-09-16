import type { Block } from 'payload'

// Mirrors HowWeHelpContent + HowWeHelpCard in src/lib/types.ts.
//
// No accent field and no widget field, unlike StrategyBlock: the design draws one colour and one
// product mock per column, so both come from the card's position in the row. An editor moving a card
// moves its colour and its mock with it, which is what the design means by "the lilac one".
export const HowWeHelpBlock: Block = {
  slug: 'howWeHelp',
  interfaceName: 'HowWeHelpBlock',
  labels: { singular: 'How We Help', plural: 'How We Help' },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Bare text. The [ brackets ] and uppercasing are CSS.' },
    },
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      admin: { description: 'Press Enter for an authored line break.' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Press Enter for the break — the two clauses are set on their own lines.',
      },
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      // Three across at md+, and there are only three mocks drawn; a fourth would restart the
      // colours and reuse the first mock on a row the design has no spec for.
      maxRows: 3,
      admin: {
        description:
          'Left to right. Position picks the card’s colour and which product mock sits at its foot — reordering here reorders both.',
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
          admin: { description: 'One word above the question — SYSTEMS, DATA, AUTOMATION.' },
        },
        {
          name: 'title',
          type: 'textarea',
          required: true,
          admin: { description: 'The client’s question. Press Enter for an authored line break.' },
        },
        {
          name: 'steps',
          type: 'array',
          required: true,
          minRows: 1,
          // The rail between the numbers is drawn for a pair; a third would hang off nothing.
          maxRows: 2,
          admin: { description: 'Numbered in order: the problem, then what we built.' },
          fields: [{ name: 'text', type: 'textarea', required: true }],
        },
      ],
    },
  ],
}

// Mirrors OurMethodContent + MethodStep in src/lib/types.ts.
export const OurMethodBlock: Block = {
  slug: 'ourMethod',
  interfaceName: 'OurMethodBlock',
  labels: { singular: 'Our Method', plural: 'Our Method' },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Bare text. The [ brackets ] and uppercasing are CSS.' },
    },
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      admin: { description: 'Press Enter for an authored line break.' },
    },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description:
          'One row each, top to bottom. The “1—”, “2—” numbering comes from this order, so moving a row renumbers it.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'The adjective, full stop included — “Customized.”' },
        },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
  ],
}
