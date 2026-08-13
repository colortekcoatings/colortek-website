import { defineField, defineType } from 'sanity';

/**
 * Blog articles. New posts appear on /blog/ and in the sitemap automatically,
 * so the client can publish without a developer — which is the whole point of
 * the SEO brief, and the thing the old WordPress site never delivered.
 */
export default defineType({
  name: 'blogPost',
  title: 'Blog article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Article', default: true },
    { name: 'seo', title: 'Search & social' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      description:
        'Generated from the headline. Once an article is published and Google has found it, do not change this — the old address would stop working.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'date',
      group: 'content',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'topic',
      title: 'Topic label',
      type: 'string',
      group: 'content',
      description: 'The small coloured tag, e.g. "Technology" or "Sustainability".',
    }),
    defineField({
      name: 'topicColour',
      title: 'Topic colour',
      type: 'string',
      group: 'content',
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
      initialValue: 'spec-1',
    }),
    defineField({
      name: 'byline',
      title: 'Written by',
      type: 'string',
      group: 'content',
      initialValue: 'Colortek R&D',
    }),
    defineField({
      name: 'excerpt',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown on the blog listing page. Two sentences is plenty.',
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Image description',
          type: 'string',
          description: 'Describe the photo for screen readers and Google Images.',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading time (minutes)',
      type: 'number',
      group: 'content',
      description: 'Roughly 200 words per minute. Leave blank to hide it.',
    }),
    defineField({
      name: 'body',
      title: 'Article',
      type: 'array',
      group: 'content',
      description:
        'Use Heading 2 for section titles — Google reads those to understand what the article covers.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullets', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Address',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
                  }),
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Image description', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: '"In short" bullets',
      type: 'array',
      group: 'content',
      description:
        'The recap box at the end of the article. One line per bullet. These are what an AI answer engine is most likely to quote, so make each one stand alone.',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'railCta',
      title: 'Sidebar call to action',
      type: 'object',
      group: 'content',
      description: 'The small prompt in the left sidebar, alongside the article.',
      fields: [
        defineField({ name: 'title', title: 'Question or prompt', type: 'string', description: 'e.g. "Not sure which chemistry fits your line?"' }),
        defineField({ name: 'linkLabel', title: 'Second link text', type: 'string', description: 'e.g. "Explore our glass coatings"' }),
        defineField({ name: 'linkHref', title: 'Second link address', type: 'string', description: 'e.g. /glass/' }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Search & social',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' },
  },
});
