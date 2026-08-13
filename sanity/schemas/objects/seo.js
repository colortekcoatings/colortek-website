import { defineField, defineType } from 'sanity';

/**
 * Reused on every page. These are the fields that decide how the page appears
 * in Google, and what ChatGPT / Perplexity / AI Overviews quote about it.
 *
 * Labels and descriptions are written for a non-technical editor — this is the
 * screen the client will actually spend their time in.
 */
export default defineType({
  name: 'seo',
  title: 'Search & social',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Page title (shown in Google)',
      type: 'string',
      description:
        'The blue clickable headline in Google results. Aim for 50–60 characters — longer gets cut off. Example: "Glass Coatings | Colortek"',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .warning('Over 60 characters usually gets cut off in Google.'),
    }),
    defineField({
      name: 'description',
      title: 'Description (shown under the title in Google)',
      type: 'text',
      rows: 3,
      description:
        'The grey summary under the title. Aim for 140–160 characters. Write it as a sentence that makes someone want to click.',
      validation: (Rule) =>
        Rule.required()
          .max(160)
          .warning('Over 160 characters usually gets cut off in Google.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Share image',
      type: 'image',
      description:
        'The picture that appears when this page is shared on WhatsApp, LinkedIn or Facebook. Ideally 1200×630 pixels. If left empty, the site-wide default is used.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noindex',
      title: 'Hide this page from Google',
      type: 'boolean',
      description:
        'Leave OFF for normal pages. Turn ON only for pages you do not want found in search, such as the thank-you page.',
      initialValue: false,
    }),
  ],
});
