// Shared field groups
import seo from './objects/seo.js';

// One-off pages (exactly one of each exists)
import siteSettings from './singletons/siteSettings.js';
import homePage from './singletons/homePage.js';
import faqPage, { qa } from './singletons/faqPage.js';

// Repeatable content
import rangePage, { system } from './documents/rangePage.js';
import blogPost from './documents/blogPost.js';
import galleryItem from './documents/galleryItem.js';

export const schemaTypes = [
  // objects
  seo,
  qa,
  system,
  // singletons
  siteSettings,
  homePage,
  faqPage,
  // documents
  rangePage,
  blogPost,
  galleryItem,
];
