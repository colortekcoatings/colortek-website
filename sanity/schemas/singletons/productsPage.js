import { defineField, defineType } from 'sanity';

/**
 * Products page.
 *
 * The list of coating ranges is NOT stored here — it is generated from the
 * five product range pages, so adding a range in the panel makes it appear
 * here automatically rather than needing two edits that can fall out of step.
 */
export default defineType({
  name: 'productsPage',
  title: 'Products page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'steps', title: 'Brief to production' },
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
      name: 'capabilitiesHeading',
      title: 'Capabilities — heading',
      type: 'string',
      group: 'content',
      description: 'e.g. "One partner, every finish"',
    }),
    defineField({ name: 'capabilitiesLead', title: 'Capabilities — line underneath', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'capabilities',
      title: 'Capability cards',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'kicker', title: 'Small label above the title', type: 'string', description: 'e.g. "Process"' }),
            defineField({ name: 'title', title: 'Card title', type: 'string', description: 'e.g. "How it cures"' }),
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', title: 'Image description', type: 'string', validation: (R) => R.required() }),
              ],
            }),
            defineField({
              name: 'tags',
              title: 'Tags',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'The small pills under the title, e.g. "1K stoving", "UV curing".',
            }),
            defineField({
              name: 'colour',
              title: 'Accent colour',
              type: 'string',
              options: {
                list: [
                  { title: 'Red', value: 'spec-1' },
                  { title: 'Orange', value: 'spec-2' },
                  { title: 'Yellow', value: 'spec-3' },
                  { title: 'Green', value: 'spec-4' },
                  { title: 'Teal', value: 'spec-5' },
                  { title: 'Blue', value: 'spec-6' },
                  { title: 'Purple', value: 'spec-7' },
                ],
              },
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'kicker', media: 'image' },
          },
        },
      ],
    }),

    defineField({
      name: 'stepsHeading',
      title: 'Heading',
      type: 'string',
      group: 'steps',
      description: 'e.g. "From brief to production"',
    }),
    defineField({ name: 'stepsLead', title: 'Line underneath', type: 'string', group: 'steps' }),
    defineField({
      name: 'steps',
      title: 'The steps',
      type: 'array',
      group: 'steps',
      description:
        'Shown as a numbered line across the page. Four works best — more will wrap.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Number', type: 'string', description: 'e.g. "01"' }),
            defineField({ name: 'title', title: 'Step name', type: 'string' }),
            defineField({ name: 'body', title: 'Explanation', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        },
      ],
      validation: (Rule) => Rule.max(4).warning('More than four steps will wrap awkwardly.'),
    }),

    defineField({
      name: 'cta',
      title: 'Closing call to action',
      type: 'object',
      group: 'content',
      fields: [
        defineField({ name: 'title', title: 'Heading', type: 'string' }),
        defineField({ name: 'lead', title: 'Paragraph', type: 'text', rows: 2 }),
      ],
    }),

    defineField({ name: 'seo', title: 'Search & social', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Products page' }) },
});
