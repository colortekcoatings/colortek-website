import { defineField, defineType } from 'sanity';

/**
 * Site-wide details. Edited once here, used everywhere — the footer, the
 * mobile menu, the contact page, and the Organization structured data that
 * tells Google and the AI engines who this company is.
 *
 * Changing the phone number here changes it in all 19 places it appears.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact details', default: true },
    { name: 'offices', title: 'Offices' },
    { name: 'defaults', title: 'Search defaults' },
  ],
  fields: [
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      group: 'contact',
      description: 'Shown in the footer, menu and contact page. Format: +91 98193 62380',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phoneLink',
      title: 'Phone number for the "call" button',
      type: 'string',
      group: 'contact',
      description:
        'Same number with no spaces or brackets, so phones can dial it. Format: +919819362380',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      group: 'contact',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      group: 'contact',
      description: 'Digits only, including country code, no plus sign. Format: 919819362380',
    }),
    defineField({
      name: 'offices',
      title: 'Offices',
      type: 'array',
      group: 'offices',
      of: [
        {
          type: 'object',
          name: 'office',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Head office & plant"' }),
            defineField({ name: 'city', title: 'City', type: 'string' }),
            defineField({ name: 'address', title: 'Full address', type: 'text', rows: 4 }),
          ],
          preview: { select: { title: 'city', subtitle: 'label' } },
        },
      ],
    }),
    defineField({
      name: 'footerBlurb',
      title: 'Footer description',
      type: 'text',
      rows: 3,
      group: 'defaults',
      description: 'The short paragraph next to the logo in the footer.',
    }),
    defineField({
      name: 'footerAddress',
      title: 'Footer address',
      type: 'text',
      rows: 3,
      group: 'defaults',
      description:
        'The postal address in the footer of every page. Put each line on its own line.',
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default share image',
      type: 'image',
      group: 'defaults',
      options: { hotspot: true },
      description:
        'Used when a page has no share image of its own. This is what appears on WhatsApp and LinkedIn.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
});
