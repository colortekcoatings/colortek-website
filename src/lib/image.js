import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

const builder = createImageUrlBuilder(sanityClient);

/**
 * Build a Sanity CDN image URL.
 *
 * Images are served from Sanity rather than downloaded into the build for a
 * deliberate reason: it moves per-visitor image traffic off Netlify's 15GB
 * credit budget and onto Sanity's 100GB asset allowance. That lifts the site's
 * free-tier headroom from roughly 5,000 to 85,000 visits a month.
 *
 * Sanity resizes and converts to WebP/AVIF on the fly, so a 3MB photo the
 * client uploads is delivered as a ~40KB image at the size actually needed.
 */
export const urlFor = (source) => builder.image(source);

/**
 * A ready-to-use src/srcset pair for a responsive <img>.
 * `widths` are the rendered CSS widths we want covered.
 */
export function responsive(source, { width, widths, quality = 78 } = {}) {
  if (!source?.asset) return null;

  const base = urlFor(source).auto('format').quality(quality);
  const sizes = widths || [width, width * 2].filter(Boolean);

  return {
    src: base.width(width || sizes[0]).url(),
    srcset: sizes.map((w) => `${base.width(w).url()} ${w}w`).join(', '),
  };
}

/** Alt text lives on the image object itself, so it travels with the picture. */
export const altOf = (source, fallback = '') => source?.alt || fallback;
