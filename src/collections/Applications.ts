import type { CollectionConfig } from 'payload'

// Every application sent through /careers/<slug>. Written only by /api/careers/apply (Payload's
// local API, which skips access control); the email to CAREERS_EMAIL is still how the team hears
// about one — this is the record behind it: the list, the status, and the duplicate check.
//
// No public access: read/update/delete fall to Payload's default (any logged-in admin user), and
// create is closed off entirely so nobody can POST straight to /api/applications.
//
// The role is kept as slug + title text rather than a relationship: a role gets closed or deleted
// long before its applications stop mattering, and the record should still say what was applied for.
// Files are names only — the files themselves ride on the email, not in storage.
//
// One application per email per role, enforced by the unique index as well as the route's own
// lookup, so two submits racing each other can't both land. Delete a record to let that person
// apply to that role again.
export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Application', plural: 'Applications' },
  access: { create: () => false },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'roleTitle', 'status', 'email', 'createdAt'],
    description:
      'Everyone who applied through the site. Files are in the email sent to the careers inbox. Delete an application to let that person apply to the same role again.',
  },
  defaultSort: '-createdAt',
  indexes: [{ fields: ['roleSlug', 'email'], unique: true }],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Reviewing', value: 'reviewing' },
            { label: 'Interview', value: 'interview' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Hired', value: 'hired' },
          ],
        },
        { name: 'roleTitle', label: 'Role', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'roleSlug', type: 'text', required: true, index: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
        // Stored lowercased by the route, so the duplicate check doesn't care how it was typed.
        { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
        { name: 'phone', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'linkedin', label: 'LinkedIn', type: 'text', admin: { readOnly: true } },
        { name: 'portfolioUrl', label: 'Portfolio link', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'files',
      type: 'array',
      labels: { singular: 'File', plural: 'Files' },
      admin: { readOnly: true, description: 'Names only — the files are attached to the email.' },
      fields: [{ name: 'name', type: 'text' }],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal notes for the team. Never shown to the applicant.' },
    },
  ],
}
