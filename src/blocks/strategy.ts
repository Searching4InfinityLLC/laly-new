import type { Block } from 'payload'
import { linkField } from './fields'
import { STRATEGY_ACCENTS } from '@/lib/palettes'

// Mirrors StrategyContent + ServicePillar in src/lib/types.ts.
export const StrategyBlock: Block = {
  slug: 'strategy',
  interfaceName: 'StrategyBlock',
  labels: { singular: 'Strategy', plural: 'Strategy' },
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
      admin: { description: 'One paragraph — it wraps to the column on its own.' },
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      // Three across at md+, so a fourth would drop to a second row the design has no spec for.
      maxRows: 3,
      fields: [
        {
          name: 'title',
          type: 'textarea',
          required: true,
          admin: { description: 'Press Enter for the break — the subject always lands on line 2.' },
        },
        {
          name: 'badges',
          type: 'array',
          required: true,
          minRows: 1,
          // four across is what the frame draws (2017:5084); a fifth wraps and restarts the tints
          maxRows: 4,
          admin: {
            description:
              'Capability pills, up to four. The star tint comes from the row position, not from here — every card runs the same green/lilac/pink/amber row.',
          },
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        {
          name: 'hook',
          type: 'textarea',
          required: true,
          admin: {
            description:
              'The "if you..." sentence. Press Enter for a hard break — these are set by hand, not wrapped.',
          },
        },
        {
          name: 'hookMobile',
          type: 'textarea',
          admin: {
            description:
              'Only fill this in when the mobile breaks differ from desktop. Empty = hook is used at every width.',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          admin: { description: 'The explainer at the foot of the card. Line breaks render as spaces.' },
        },
        linkField(),
        {
          name: 'accent',
          type: 'select',
          required: true,
          defaultValue: 'lilac',
          options: Object.keys(STRATEGY_ACCENTS),
          admin: { description: 'Tints the title and the card’s hover glow.' },
        },
      ],
    },
  ],
}
