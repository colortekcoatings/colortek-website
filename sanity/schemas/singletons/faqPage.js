import { defineField, defineType } from 'sanity';

/**
 * One question and answer.
 *
 * The answer is rich text rather than plain, because 4 of the 12 existing
 * answers link to other pages and those internal links carry real SEO value.
 * Google permits a small set of HTML tags inside a FAQ answer, so the editor
 * offers exactly that set and no more.
 */
export const qa = defineType({
  name: 'qa',
  title: 'Question',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'Write it the way a customer would actually ask it.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description:
        'You can link to other pages — those links help your search ranking. Google reads this exact text, so keep it accurate and self-contained.',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullets', value: 'bullet' }],
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
                    type: 'string',
                    description: 'e.g. /products/ or https://example.com',
                    validation: (Rule) => Rule.required(),
                  }),
                ],
              },
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'question', answer: 'answer' },
    prepare: ({ title, answer }) => ({
      title,
      subtitle: (answer?.[0]?.children || []).map((c) => c.text).join(''),
    }),
  },
});

/**
 * FAQ page.
 *
 * Questions are stored once here. The page renders them twice — as the visible
 * accordion, and inside the FAQPage structured data that Google and the AI
 * answer engines read. Google requires those two to match; storing one copy is
 * what guarantees they cannot drift apart when the client edits.
 */
export default defineType({
  name: 'faqPage',
  title: 'FAQ page',
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
      description: 'A red dot is added automatically at the end.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro line under the heading',
      type: 'text',
      rows: 2,
      group: 'content',
    }),
    defineField({
      name: 'groups',
      title: 'Question groups',
      type: 'array',
      group: 'content',
      description:
        'The page is split into coloured sections. Drag to reorder groups, or the questions inside them.',
      of: [
        {
          type: 'object',
          name: 'faqGroup',
          fields: [
            defineField({
              name: 'title',
              title: 'Group name',
              type: 'string',
              description: 'e.g. "Products & finishes"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'hint',
              title: 'Line under the group name',
              type: 'string',
              description: 'e.g. "What we coat, and how it can look."',
            }),
            defineField({
              name: 'colour',
              title: 'Accent colour',
              type: 'string',
              description: 'The coloured bar beside the group name.',
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
              name: 'questions',
              title: 'Questions in this group',
              type: 'array',
              of: [{ type: 'qa' }],
              validation: (Rule) => Rule.min(1),
            }),
          ],
          preview: {
            select: { title: 'title', questions: 'questions' },
            prepare: ({ title, questions }) => ({
              title,
              subtitle: `${questions?.length || 0} question${questions?.length === 1 ? '' : 's'}`,
            }),
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'seo',
      title: 'Search & social',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'FAQ page' }),
  },
});
