import type { Block } from 'payload'

// The /careers page's own two blocks. The hero is the shared Service Hero (paidHero) and the role
// list comes from the Roles collection — these carry only the copy around them. Mirrors
// CareersAboutContent / OpenRolesContent in src/lib/types.ts.

const labelField: Block['fields'][number] = {
  name: 'label',
  type: 'text',
  required: true,
  admin: { description: 'Bare text. The [ brackets ] and uppercasing are added by the page.' },
}

export const CareersAboutBlock: Block = {
  slug: 'careersAbout',
  interfaceName: 'CareersAboutBlock',
  labels: { singular: 'Careers — About', plural: 'Careers — About' },
  fields: [
    labelField,
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      admin: { description: 'Press Enter for an authored line break.' },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: { description: 'Leave a blank line between paragraphs.' },
    },
    {
      name: 'services',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      admin: {
        description: 'The cards under the copy, left to right. The card colour comes from its position.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
  ],
}

export const OpenRolesBlock: Block = {
  slug: 'openRoles',
  interfaceName: 'OpenRolesBlock',
  labels: { singular: 'Careers — Open Roles', plural: 'Careers — Open Roles' },
  fields: [
    labelField,
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The roles themselves are managed under Collections → Open Roles, not here.',
      },
    },
    {
      name: 'empty',
      type: 'text',
      required: true,
      admin: { description: 'The dashed line under the list, e.g. "More roles will appear here as they open."' },
    },
  ],
}
