import { defineField, defineType } from 'sanity';

/**
 * One coating system — ISOTRAP, AQUATRAP, METACOAT and so on.
 *
 * Named rather than inline so it can be shared: tabbed pages hold theirs
 * inside a sector, single-product pages (Ceramics, 3D) hold one directly.
 */
export const system = defineType({
  name: 'system',
  title: 'Coating system',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'System name',
      type: 'string',
      description: 'e.g. ISOTRAP',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'One-line description',
      type: 'string',
      description: 'Sits beside the name, e.g. "The 1K stoving lacquer for cosmetic glass".',
    }),
    defineField({ name: 'body', title: 'Description', type: 'text', rows: 4 }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Image description',
          type: 'string',
          description:
            'For screen readers and Google Images, e.g. "Faceted glass caps in gold and copper finishes".',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'captionKicker',
          title: 'Caption label',
          type: 'string',
          description: 'Small text above the caption, e.g. "Patented system".',
        }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
      ],
    }),
    defineField({
      name: 'features',
      title: 'Key features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Feature', type: 'string' }),
            defineField({ name: 'detail', title: 'Explanation', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'detail' } },
        },
      ],
    }),
    defineField({
      name: 'glance',
      title: 'Spec tiles',
      type: 'array',
      description: 'The three boxes under the description. Keep values short.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Chemistry"' }),
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "1K solvent thermoset"' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
      validation: (Rule) => Rule.max(3).warning('More than three tiles will wrap awkwardly.'),
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'tagline', media: 'image' } },
});

/**
 * The five substrate pages — Glass, Plastics, Metal, Ceramics, 3D.
 *
 * One schema drives all five. Glass has 7 sectors, Plastics 6, Metal 2;
 * Ceramics and 3D have none and show a single system directly. That is not a
 * special case in code — it is simply an empty sectors list, so tabs could be
 * added to Ceramics later without a developer.
 *
 * The slug is locked: /glass/, /plastics/, /metal/, /ceramics/ and /3d/ are
 * already indexed by Google from the old WordPress site.
 */
export default defineType({
  name: 'rangePage',
  title: 'Product range page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'sectors', title: 'Coating systems' },
    { name: 'seo', title: 'Search & social' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page heading',
      type: 'string',
      group: 'content',
      description: 'The large word at the top of the page, e.g. "Glass".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      readOnly: true,
      description:
        'Locked. Google has had this address indexed since 2024 — changing it would lose the page’s search ranking.',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Cut-out image (top right)',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      description: 'The floating product image beside the heading.',
    }),
    defineField({
      name: 'sectors',
      title: 'Application sectors',
      type: 'array',
      group: 'sectors',
      description:
        'Each one becomes a tab. Drag to reorder — the first is the tab that opens by default. ' +
        'Leave empty for a single-product page.',
      of: [
        {
          type: 'object',
          name: 'sector',
          fields: [
            defineField({
              name: 'label',
              title: 'Tab name',
              type: 'string',
              description: 'Short — it has to fit in a tab, e.g. "Cosmetics".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'anchor',
              title: 'Link name',
              type: 'slug',
              description:
                'Used for direct links like /glass/#liquor. The home page industry tiles point at these, so avoid renaming.',
              options: { source: 'label' },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Tab icon',
              type: 'string',
              description: 'The small symbol shown above the tab name.',
              options: {
                list: [
                  { title: 'Sparkle', value: 'sparkle' },
                  { title: 'Layers', value: 'stack-simple' },
                  { title: 'Wine glass', value: 'wine' },
                  { title: 'Window frame', value: 'frame-corners' },
                  { title: 'Fork & knife', value: 'fork-knife' },
                  { title: 'Four-point star', value: 'star-four' },
                  { title: 'Sun', value: 'sun' },
                  { title: 'Droplet', value: 'drop' },
                  { title: 'Paint brush', value: 'paint-brush' },
                  { title: 'Paint roller', value: 'paint-roller' },
                  { title: 'Bottle', value: 'beer-bottle' },
                  { title: 'Cooking pot', value: 'cooking-pot' },
                  { title: 'Shield', value: 'shield-check' },
                  { title: 'Flask', value: 'flask' },
                  { title: 'Medal', value: 'medal' },
                ],
              },
              initialValue: 'sparkle',
            }),
            defineField({
              name: 'products',
              title: 'Coating systems in this sector',
              type: 'array',
              of: [{ type: 'system' }],
            }),
            defineField({
              name: 'compliance',
              title: 'Show the certification block in this sector',
              type: 'boolean',
              description:
                'Only turn this ON where the certificates actually apply. The REACH and TSCA references belong to ISOTRAP, so on the Glass page this is Cosmetics only.',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'label', products: 'products' },
            prepare: ({ title, products }) => ({
              title,
              subtitle: `${products?.length || 0} system${products?.length === 1 ? '' : 's'}`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'standaloneProducts',
      title: 'Coating system',
      type: 'array',
      group: 'sectors',
      description:
        'Used only when there are no application sectors above — Ceramics and 3D have a single system each, shown without a tab strip.',
      of: [{ type: 'system' }],
      hidden: ({ document }) => (document?.sectors?.length || 0) > 0,
    }),
    defineField({
      name: 'complianceBlock',
      title: 'Certification block',
      type: 'object',
      group: 'sectors',
      description:
        'Shown inside whichever sectors have "Show the certification block" switched on. Written once here rather than per sector.',
      fields: [
        defineField({ name: 'title', title: 'Heading', type: 'string', description: 'e.g. "Certified for export". A red dot is added automatically.' }),
        defineField({ name: 'lead', title: 'Line under the heading', type: 'text', rows: 2 }),
        defineField({
          name: 'credentials',
          title: 'Certificates',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'name', title: 'Certificate', type: 'string', description: 'e.g. "REACH (EU)"' }),
                defineField({ name: 'detail', title: 'What it covers', type: 'string' }),
                defineField({ name: 'reference', title: 'Reference number', type: 'string', description: 'e.g. "SGS MAN:HL:1548009535"' }),
              ],
              preview: { select: { title: 'name', subtitle: 'reference' } },
            },
          ],
        }),
        defineField({ name: 'footNote', title: 'Note underneath', type: 'string' }),
        defineField({ name: 'footLinkLabel', title: 'Link text', type: 'string', description: 'e.g. "Request datasheets"' }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Closing call to action',
      type: 'object',
      group: 'content',
      description: 'The band at the very bottom of the page.',
      fields: [
        defineField({ name: 'title', title: 'Heading', type: 'string', description: 'e.g. "Coating glass? Start here". A red dot is added automatically.' }),
        defineField({ name: 'lead', title: 'Paragraph', type: 'text', rows: 2 }),
        defineField({ name: 'whatsappText', title: 'Pre-filled WhatsApp message', type: 'string', description: 'What the visitor’s WhatsApp opens with, e.g. "Hi Colortek, I need a glass coating."' }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Finishes strip',
      type: 'object',
      group: 'content',
      description: 'The scrolling row of real production photos near the bottom of the page.',
      fields: [
        defineField({
          name: 'title',
          title: 'Heading',
          type: 'string',
          description: 'e.g. "The finishes, on ceramic". A red dot is added automatically.',
        }),
        defineField({ name: 'lead', title: 'Line under the heading', type: 'string' }),
        defineField({
          name: 'images',
          title: 'Photos',
          type: 'array',
          of: [
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Image description',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Search & social',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'heroImage' },
  },
});
