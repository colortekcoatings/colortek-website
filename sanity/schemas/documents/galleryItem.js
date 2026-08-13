import { defineField, defineType } from 'sanity';

/**
 * One finish in the gallery (45 of them today).
 *
 * The three tag fields drive the filter bar on /gallery/. They are dropdown
 * lists rather than free text on purpose: if one item said "Metallic" and
 * another "metallic", the filter would treat them as two different finishes
 * and quietly hide results.
 */
export default defineType({
  name: 'galleryItem',
  title: 'Gallery finish',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Finish name',
      type: 'string',
      description: 'e.g. "Gold and silver flasks"',
      validation: (Rule) => Rule.required(),
    }),
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
          description: 'Describe it for screen readers and Google Images.',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'system',
      title: 'Coating system',
      type: 'string',
      description: 'Which product produced this finish, e.g. ISOTRAP or INSHINE. Shown under the name.',
    }),
    defineField({
      name: 'substrate',
      title: 'Substrate',
      type: 'string',
      description: 'What material is being coated.',
      options: {
        list: ['Glass', 'Plastics', 'Metal', 'Ceramics', '3D'],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'finishes',
      title: 'Finish types',
      type: 'array',
      description: 'Tick every one that applies — an item can have more than one.',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Metallic', 'Gloss', 'Matte', 'Opaque', 'Glitter', 'Pearl',
          'Crackle', 'Gradient', 'Print', 'Transparent', 'Casting resin',
        ],
      },
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'industries',
      title: 'Industries',
      type: 'array',
      description: 'Tick every one that applies.',
      of: [{ type: 'string' }],
      options: {
        // These must match the filter buttons on /gallery/ exactly. A value
        // that is not in this list becomes a finish nobody can filter to.
        list: [
          'Cosmetics', 'Perfumery', 'Liquor', 'Packaging', 'Tableware',
          'Bottleware', 'Cookware', 'Appliances', 'Industrial',
          'Architectural', 'Medical', 'Jewellery', 'Artifacts',
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Sort position',
      type: 'number',
      description: 'Lower numbers appear first. Leave blank to sort alphabetically.',
    }),
  ],
  orderings: [
    { title: 'Manual order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Substrate', name: 'substrateAsc', by: [{ field: 'substrate', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'substrate', media: 'image' },
  },
});
