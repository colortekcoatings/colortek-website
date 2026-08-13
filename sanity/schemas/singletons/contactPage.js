import { defineField, defineType } from 'sanity';

/**
 * Contact page.
 *
 * The phone number, email and office addresses are NOT here — they live in
 * Site settings, because they also appear in the footer and mobile menu.
 * Storing them twice would let the footer and the contact page disagree.
 */
export default defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & social' },
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Page heading',
      type: 'string',
      group: 'content',
      description: 'A red dot is added automatically.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'intro', title: 'Line under the heading', type: 'text', rows: 2, group: 'content' }),

    defineField({
      name: 'channels',
      title: 'Contact tiles',
      type: 'array',
      group: 'content',
      description:
        'The three boxes at the top: Call, WhatsApp and Email. The number and address come from Site settings — only the wording is set here.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'kind',
              title: 'Type',
              type: 'string',
              description: 'Decides which icon is shown and what the tile links to.',
              options: {
                list: [
                  { title: 'Phone call', value: 'phone' },
                  { title: 'WhatsApp', value: 'whatsapp' },
                  { title: 'Email', value: 'email' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'label', title: 'Small label', type: 'string', description: 'e.g. "Call"' }),
            defineField({
              name: 'value',
              title: 'Main text',
              type: 'string',
              description: 'Leave blank to use the number or address from Site settings.',
            }),
            defineField({ name: 'hint', title: 'Line underneath', type: 'string', description: 'e.g. "Monday to Saturday, 9:30 to 18:30 IST"' }),
            defineField({
              name: 'whatsappText',
              title: 'Pre-filled WhatsApp message',
              type: 'string',
              hidden: ({ parent }) => parent?.kind !== 'whatsapp',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'hint' } },
        },
      ],
      validation: (Rule) => Rule.max(3).warning('More than three tiles will wrap.'),
    }),

    defineField({
      name: 'formHeading',
      title: 'Form heading',
      type: 'string',
      group: 'content',
      description: 'e.g. "Send an enquiry"',
    }),
    defineField({
      name: 'substrateOptions',
      title: 'Substrate choices in the form',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'The dropdown a visitor picks from when describing their part.',
    }),

    defineField({ name: 'seo', title: 'Search & social', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Contact page' }) },
});
