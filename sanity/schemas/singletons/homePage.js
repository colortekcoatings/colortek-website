import { defineField, defineType } from 'sanity';

/**
 * Home page.
 *
 * The industry tiles each carry a link into a specific sector tab — clicking
 * "Liquor" opens /glass/#liquor with that tab already selected. That mapping
 * is editable here rather than hardcoded, so adding an industry does not need
 * a developer.
 */
export default defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Top of page', default: true },
    { name: 'panels', title: 'Scrolling panels' },
    { name: 'stats', title: 'Numbers strip' },
    { name: 'industries', title: 'Industries we serve' },
    { name: 'seo', title: 'Search & social' },
  ],
  fields: [
    defineField({ name: 'kicker', title: 'Small line above the headline', type: 'string', group: 'hero', description: 'e.g. "Specialty coatings since 2000"' }),
    defineField({
      name: 'headingLine1',
      title: 'Headline — first line',
      type: 'string',
      group: 'hero',
      description: 'The tagline, e.g. "Colorful". Splitting it in two keeps the stacked look on every screen size.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'headingLine2', title: 'Headline — second line', type: 'string', group: 'hero', description: 'e.g. "innovation". A red dot is added automatically.' }),
    defineField({ name: 'heroSub', title: 'Paragraph under the headline', type: 'text', rows: 3, group: 'hero' }),

    defineField({
      name: 'panels',
      title: 'Full-screen scrolling panels',
      type: 'array',
      group: 'panels',
      description: 'The large photo panels below the headline. Drag to reorder.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Heading', type: 'string', description: 'A red dot is added automatically at the end.', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Paragraph', type: 'text', rows: 3 }),
            defineField({
              name: 'image',
              title: 'Background photo',
              type: 'image',
              options: { hotspot: true },
              description: 'Use the crop tool to set which part stays visible on a phone.',
              fields: [defineField({ name: 'alt', title: 'Image description', type: 'string', validation: (R) => R.required() })],
              validation: (R) => R.required(),
            }),
            defineField({ name: 'ctaLabel', title: 'Button text', type: 'string' }),
            defineField({ name: 'ctaHref', title: 'Button link', type: 'string', description: 'e.g. /about/ or /contact/' }),
          ],
          preview: { select: { title: 'title', media: 'image' } },
        },
      ],
    }),

    defineField({
      name: 'stats',
      title: 'Numbers strip',
      type: 'array',
      group: 'stats',
      description: 'The four boxes. The second one is highlighted in red.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'string', description: 'e.g. "25", "750", "ISO 9001"' }),
            defineField({ name: 'suffix', title: 'After the number', type: 'string', description: 'e.g. "+" or "MT". Leave blank if none.' }),
            defineField({ name: 'label', title: 'Description', type: 'string', description: 'e.g. "Years in specialty coatings"' }),
            defineField({
              name: 'plain',
              title: 'This is a standard number, not a quantity',
              type: 'boolean',
              description:
                'Turn ON for things like ISO 9001, so it is not written as "9,001" with a comma.',
              initialValue: false,
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
      validation: (Rule) => Rule.max(4).warning('More than four will wrap onto a second row.'),
    }),

    defineField({
      name: 'industries',
      title: 'Industry tiles',
      type: 'array',
      group: 'industries',
      description: 'The scrolling row of photos. Each links into a product page.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Industry name', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Image description', type: 'string', validation: (R) => R.required() })],
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'href',
              title: 'Where it links to',
              type: 'string',
              description:
                'Include the tab if you want one opened, e.g. /glass/#liquor opens the Glass page on the Liquor tab.',
              validation: (R) => R.required(),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'href', media: 'image' } },
        },
      ],
    }),

    defineField({ name: 'seo', title: 'Search & social', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Home page' }) },
});
