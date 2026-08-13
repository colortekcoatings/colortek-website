import { defineField, defineType } from 'sanity';

/**
 * A contact form submission, copied into Sanity so the client can read it in
 * the admin panel without a Netlify account.
 *
 * Written by netlify/functions/submission-created.mjs, which Netlify calls
 * automatically whenever the form is submitted. Netlify still keeps its own
 * copy and still emails info@colortek.in — this is an additional record, not
 * a replacement, so an enquiry survives even if one of the two is lost.
 *
 * Read-only in the panel: these are things a customer wrote, not content to
 * be edited. The client can read, search, export and delete — not rewrite.
 */
export default defineType({
  name: 'enquiry',
  title: 'Enquiry',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'company', title: 'Company', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'substrate', title: 'Substrate', type: 'string' }),
    defineField({ name: 'message', title: 'Message', type: 'text', rows: 6 }),
    defineField({ name: 'receivedAt', title: 'Received', type: 'datetime' }),
    defineField({
      name: 'netlifyId',
      title: 'Netlify reference',
      type: 'string',
      description: 'Used to avoid storing the same submission twice.',
      hidden: true,
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: 'receivedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'name', company: 'company', message: 'message', receivedAt: 'receivedAt' },
    prepare: ({ title, company, message, receivedAt }) => ({
      title: [title || 'No name', company].filter(Boolean).join(' — '),
      subtitle: [
        receivedAt
          ? new Date(receivedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '',
        (message || '').slice(0, 60),
      ]
        .filter(Boolean)
        .join('  ·  '),
    }),
  },
});
