// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// URLs must match what Google already has indexed for the live WordPress site:
// /glass/, /plastics/, /metal/, /ceramics/, /3d/, /contact/ — directory paths
// with a trailing slash, not .html files. Astro's default 'directory' format
// produces exactly that, so six of the nine existing URLs carry over untouched.
export default defineConfig({
  site: 'https://colortek.in',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // Note: do NOT add an Astro `redirects` entry for /admin. With
  // trailingSlash: 'always' the key is normalised to '/admin/', so the rule
  // points that path at itself — a redirect loop on the admin panel. Tried
  // and reverted. The Netlify rules in public/_redirects handle /admin and
  // /admin-panel in production; in local dev, type the trailing slash.
  //
  // Note: do NOT add vite.optimizeDeps.exclude for the Sanity packages. It
  // stops the stale-cache warning but breaks Studio hydration entirely —
  // the panel renders blank. Tried and reverted. If the dev cache goes stale
  // after a schema change, run `npm run fresh` instead.

  integrations: [
    sanity({
      projectId: '5ih96glo',
      dataset: 'production',
      // Content is read at build time, so the CDN cache would only ever serve
      // us staler data than the API. Off means a publish is live on next build.
      useCdn: false,
      // The client asked for /admin-panel; /admin is the real route and
      // /admin-panel redirects to it (see public/_redirects).
      studioBasePath: '/admin',
    }),
    react(),
    sitemap({
      // The studio is a private tool, not a page for Google to index.
      filter: (page) => !page.includes('/admin'),
    }),
  ],
});
