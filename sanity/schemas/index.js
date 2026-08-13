// Shared field groups
import seo from './objects/seo.js';

// One-off pages (exactly one of each exists)
import siteSettings from './singletons/siteSettings.js';
import homePage from './singletons/homePage.js';
import faqPage, { qa } from './singletons/faqPage.js';
import productsPage from './singletons/productsPage.js';
import contactPage from './singletons/contactPage.js';
import aboutPage from './singletons/aboutPage.js';

// Repeatable content
import rangePage, { system } from './documents/rangePage.js';
import blogPost from './documents/blogPost.js';
import galleryItem from './documents/galleryItem.js';
import enquiry from './documents/enquiry.js';

export const schemaTypes = [
  // objects
  seo,
  qa,
  system,
  // singletons
  siteSettings,
  homePage,
  aboutPage,
  productsPage,
  contactPage,
  faqPage,
  // documents
  rangePage,
  blogPost,
  galleryItem,
  enquiry,
];
