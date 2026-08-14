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

/** Every built-in action that can make one of the singleton pages disappear. */
const REMOVES_A_PAGE = [
  'delete',
  'duplicate',
  'unpublish',
  'unpublishVersion',
  'discardChanges',
  'discardVersion',
];

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

  // "Releases" and "Scheduled drafts" let a team stage a batch of changes and
  // publish them at a set time. Colortek publishes one edit at a time, and the
  // feature has a sharp edge: with the view switched to "Published", pressing +
  // fails with "Cannot create a published document — choose a destination",
  // which is meaningless to a non-technical editor. Off, so new documents are
  // always plain drafts.
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },

  // No basePath here on purpose: the embedded Studio takes its path from
  // `studioBasePath` in astro.config.mjs, and setting both makes the
  // integration warn that this one is ignored.

  plugins: [
    structureTool({
      // Note: Sanity has no setting to auto-select a document, so the pane
      // beside this list is empty until the editor picks a page. Making a
      // document the root instead would remove the list entirely, which is
      // worse. The "Start here" screen is the landing view for this reason.
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

  // The one-off pages must not be removable. "Delete" and "Duplicate" were
  // already blocked, but that left a hole: Unpublish turns the page into a
  // draft, and Discard changes then deletes the draft — two ordinary-looking
  // clicks and the home page is gone. That happened. Every action that can
  // remove one of these pages is blocked below.
  //
  // "Restore" is deliberately kept: it is how an earlier version is brought
  // back from History, which is the client's undo button.
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({ action }) => !REMOVES_A_PAGE.includes(action))
        : prev,
  },
});
