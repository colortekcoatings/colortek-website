import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas/index.js';
import EnquiriesTool from './sanity/tools/EnquiriesTool.jsx';
import Welcome from './sanity/tools/Welcome.jsx';
import StudioLogo from './sanity/tools/StudioLogo.jsx';

/**
 * The admin panel itself, served at /admin.
 *
 * The sidebar is hand-ordered to read like the website rather than like a
 * database: pages first in the order a visitor meets them, then the two
 * repeatable collections, then settings. The one-off pages are pinned as
 * single entries so the client cannot accidentally create a second home page.
 */
const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'productsPage', 'contactPage', 'faqPage'];

export default defineConfig({
  name: 'colortek',
  title: 'Colortek',

  studio: {
    components: { logo: StudioLogo },
  },

  // Note: do NOT set `theme: buildLegacyTheme(...)`. It is a Sanity v2-era API
  // that replaces the whole theme rather than tinting it, and the current UI
  // components collapse — overlapping text, and the dark theme lost. Tried and
  // reverted. Branding is the logo above; the colours stay as Sanity ships them.


  projectId: '5ih96glo',
  dataset: 'production',

  // No basePath here on purpose: the embedded Studio takes its path from
  // `studioBasePath` in astro.config.mjs, and setting both makes the
  // integration warn that this one is ignored.

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Website')
          .items([
            S.listItem()
              .title('Home page')
              .id('homePage')
              .child(S.document().schemaType('homePage').documentId('homePage')),

            S.listItem()
              .title('About page')
              .id('aboutPage')
              .child(S.document().schemaType('aboutPage').documentId('aboutPage')),

            S.listItem()
              .title('Products page')
              .id('productsPage')
              .child(S.document().schemaType('productsPage').documentId('productsPage')),

            S.listItem()
              .title('Product pages')
              .id('rangePages')
              .child(
                S.documentTypeList('rangePage')
                  .title('Product pages')
                  .defaultOrdering([{ field: 'title', direction: 'asc' }])
              ),

            S.listItem()
              .title('Gallery finishes')
              .id('galleryItems')
              .child(S.documentTypeList('galleryItem').title('Gallery finishes')),

            S.listItem()
              .title('Blog articles')
              .id('blogPosts')
              .child(
                S.documentTypeList('blogPost')
                  .title('Blog articles')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              ),

            S.listItem()
              .title('Contact page')
              .id('contactPage')
              .child(S.document().schemaType('contactPage').documentId('contactPage')),

            S.listItem()
              .title('FAQ page')
              .id('faqPage')
              .child(S.document().schemaType('faqPage').documentId('faqPage')),

            S.divider(),

            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),
    // Query tool — for us, not part of the client's day-to-day.
    visionTool(),
  ],

  // "Enquiries" sits beside Structure in the top bar. It reads through a
  // server-side function so the Netlify key never reaches the browser.
  // "Vision" and "Releases" are developer tools that mean nothing to the
  // client and only invite confusion, so they are removed from the top bar.
  // Vision still works for us at /admin/#/vision if ever needed.
  tools: (prev) => [
    { name: 'welcome', title: 'Start here', component: Welcome },
    ...prev.filter((t) => !['vision', 'releases'].includes(t.name)),
    { name: 'enquiries', title: 'Enquiries', component: EnquiriesTool },
  ],

  schema: {
    types: schemaTypes,
    // Hide the singletons from the global "create new" menu; they are reached
    // through the sidebar entries above and only ever exist once.
    templates: (prev) => prev.filter((t) => !SINGLETONS.includes(t.schemaType)),
  },

  document: {
    // Same guard on the "create" action inside document lists.
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
});
