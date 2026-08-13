import { defineField, defineType } from 'sanity';

/**
 * About page.
 *
 * The video field takes either an uploaded file or a YouTube link — whichever
 * is filled in, the player adapts. That is what lets the client swap the
 * placeholder footage for the real thing themselves when it arrives, with no
 * developer involved.
 */
export default defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Top of page', default: true },
    { name: 'story', title: 'Story' },
    { name: 'vmv', title: 'Vision & values' },
    { name: 'timeline', title: 'Timeline' },
    { name: 'story2', title: 'Second story' },
    { name: 'video', title: 'Factory film' },
    { name: 'stats', title: 'Numbers strip' },
    { name: 'why', title: 'Why Colortek' },
    { name: 'seo', title: 'Search & social' },
  ],
  fields: [
    defineField({
      name: 'headingLine1',
      title: 'Heading — first line',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'headingLine2', title: 'Heading — second line', type: 'string', group: 'content', description: 'A red dot is added automatically.' }),
    defineField({ name: 'intro', title: 'Paragraph under the heading', type: 'text', rows: 3, group: 'content' }),
    defineField({
      name: 'facts',
      title: 'Fact strip',
      type: 'array',
      group: 'content',
      description: 'The small labelled facts under the heading, e.g. "Established — 2000, family-owned".',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
    }),

    defineField({ name: 'storyTitle', title: 'Story heading', type: 'string', group: 'story', description: 'A red dot is added automatically.' }),
    defineField({
      name: 'storyBody',
      title: 'Story',
      type: 'array',
      group: 'story',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [] }],
    }),
    defineField({ name: 'storyQuote', title: 'Pull quote', type: 'text', rows: 2, group: 'story', description: 'The italic line at the end, e.g. the company motto.' }),
    defineField({
      name: 'storyImage',
      title: 'Story photo',
      type: 'image',
      group: 'story',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Image description', type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
      ],
    }),

    defineField({
      name: 'vmvHeading',
      title: 'Heading',
      type: 'string',
      group: 'vmv',
      description: 'e.g. "Vision, mission, values". A red dot is added automatically.',
    }),
    defineField({
      name: 'vmvPanels',
      title: 'Vision & mission',
      type: 'array',
      group: 'vmv',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Panel title', type: 'string', description: 'e.g. "Vision"' }),
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 5 }),
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
          preview: { select: { title: 'title', subtitle: 'body' } },
        },
      ],
    }),
    defineField({
      name: 'values',
      title: 'Company values',
      type: 'array',
      group: 'vmv',
      description: 'The coloured pills under vision and mission. Each gets the next colour automatically.',
      of: [{ type: 'string' }],
    }),

    defineField({
      name: 'timelineHeading',
      title: 'Heading',
      type: 'string',
      group: 'timeline',
      description: 'A red dot is added automatically.',
    }),
    defineField({
      name: 'timelineRange',
      title: 'Range marker',
      type: 'string',
      group: 'timeline',
      description: 'The small label at the bottom of the timeline, e.g. "2000 → 2026".',
    }),
    defineField({
      name: 'milestones',
      title: 'Milestones',
      type: 'array',
      group: 'timeline',
      description: 'Drag to reorder. Colours cycle automatically, so just add in date order.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'year', title: 'Year', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'text', title: 'What happened', type: 'text', rows: 2, validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'year', subtitle: 'text' } },
        },
      ],
    }),

    defineField({
      name: 'secondStoryTitle',
      title: 'Heading',
      type: 'string',
      group: 'story2',
      description: 'e.g. "Engineered in-house". A red dot is added automatically.',
    }),
    defineField({
      name: 'secondStoryBody',
      title: 'Text',
      type: 'array',
      group: 'story2',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [] }],
    }),
    defineField({
      name: 'secondStoryImage',
      title: 'Photo',
      type: 'image',
      group: 'story2',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Image description', type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
      ],
    }),
    defineField({ name: 'secondStoryCtaLabel', title: 'Button text', type: 'string', group: 'story2' }),
    defineField({ name: 'secondStoryCtaHref', title: 'Button link', type: 'string', group: 'story2', description: 'e.g. /products/' }),

    defineField({
      name: 'video',
      title: 'Factory film',
      type: 'object',
      group: 'video',
      description:
        'Fill in EITHER a YouTube link OR upload a file. YouTube is recommended: it keeps the site light and the player only loads if someone presses play.',
      fields: [
        defineField({ name: 'heading', title: 'Section heading', type: 'string' }),
        defineField({ name: 'lead', title: 'Line underneath', type: 'string' }),
        defineField({
          name: 'youtubeId',
          title: 'YouTube video ID',
          type: 'string',
          description:
            'Just the code after "v=" in a YouTube link. For youtube.com/watch?v=dQw4w9WgXcQ that is dQw4w9WgXcQ.',
        }),
        defineField({
          name: 'file',
          title: 'Or upload a video file',
          type: 'file',
          description: 'MP4, 16:9. Only used if no YouTube ID is set above.',
          options: { accept: 'video/mp4' },
        }),
        defineField({
          name: 'poster',
          title: 'Still image before play',
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Image description', type: 'string' })],
        }),
      ],
    }),

    defineField({
      name: 'stats',
      title: 'Numbers strip',
      type: 'array',
      group: 'stats',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'string' }),
            defineField({ name: 'suffix', title: 'After the number', type: 'string', description: 'e.g. "+" or "MT"' }),
            defineField({ name: 'label', title: 'Description', type: 'string' }),
            defineField({
              name: 'plain',
              title: 'This is a standard number, not a quantity',
              type: 'boolean',
              description: 'Turn ON for things like ISO 9001, so it is not written with a comma.',
              initialValue: false,
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
      validation: (Rule) => Rule.max(4).warning('More than four will wrap onto a second row.'),
    }),

    defineField({ name: 'whyHeading', title: 'Heading', type: 'string', group: 'why' }),
    defineField({ name: 'whyLead', title: 'Line underneath', type: 'text', rows: 2, group: 'why' }),
    defineField({
      name: 'whyCards',
      title: 'Cards',
      type: 'array',
      group: 'why',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Medal', value: 'medal' },
                  { title: 'Flask', value: 'flask' },
                  { title: 'Seal / certified', value: 'seal-check' },
                  { title: 'Lightning', value: 'lightning' },
                  { title: 'Test tube', value: 'test-tube' },
                  { title: 'Target', value: 'target' },
                  { title: 'Shield', value: 'shield-check' },
                  { title: 'Sparkle', value: 'sparkle' },
                ],
              },
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        },
      ],
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
  preview: { prepare: () => ({ title: 'About page' }) },
});
