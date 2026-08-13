/**
 * One-off import: lifts the content out of the hand-written HTML and into
 * Sanity, so the client opens the admin panel and finds their real site
 * waiting rather than empty forms.
 *
 * Safe to re-run — every document uses a fixed _id and is written with
 * createOrReplace, so a second run overwrites rather than duplicating.
 *
 *   node scripts/import-content.mjs
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRangeExtractor } from './lib/extract-ranges.mjs';
import { makeGalleryExtractor } from './lib/extract-gallery.mjs';
import { makeBlogExtractor } from './lib/extract-blog.mjs';
import { makePageExtractor } from './lib/extract-pages.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OLD_SITE = join(HERE, '..', '..', 'colertek');

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error(
    '\n  Missing SANITY_WRITE_TOKEN.\n\n' +
      '  1. sanity.io/manage -> Colortek -> API -> Tokens -> Add API token\n' +
      '  2. Name it "Content import", permission "Editor"\n' +
      '  3. Copy .env.example to .env and paste the token in\n' +
      '  4. Run: node --env-file=.env scripts/import-content.mjs\n'
  );
  process.exit(1);
}

const client = createClient({
  projectId: '5ih96glo',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

const read = (f) => readFileSync(join(OLD_SITE, f), 'utf8');

/* ------------------------------------------------------------- images ---- */
/**
 * Upload an image from the old site and return a Sanity image reference.
 *
 * Sanity de-duplicates by content hash, so re-running the import re-uses the
 * existing asset instead of piling up copies. Results are cached in memory so
 * an image used on five pages is only uploaded once per run.
 */
const assetCache = new Map();
let uploaded = 0;
let reused = 0;

// DRY_RUN=1 skips uploads and Sanity writes, so the parsing can be checked
// without a token and without touching the real content.
const DRY = process.env.DRY_RUN === '1';

async function uploadImage(relPath, alt) {
  if (!relPath) return undefined;
  if (DRY) {
    uploaded++;
    return { _type: 'image', asset: { _type: 'reference', _ref: 'dry' }, ...(alt ? { alt } : {}) };
  }
  // Blog articles sit in a subfolder and reference "../assets/...". Without
  // stripping that prefix the path resolves outside the site folder, the file
  // is not found, and the image is skipped — which is how all six article
  // cover images went missing on the first run.
  const clean = relPath.replace(/^\/+/, '').replace(/^(\.\.\/)+/, '');

  if (!assetCache.has(clean)) {
    let buf;
    try {
      buf = readFileSync(join(OLD_SITE, clean));
    } catch {
      console.log(`    ! missing image, skipped: ${clean}`);
      assetCache.set(clean, null);
      return undefined;
    }
    const asset = await client.assets.upload('image', buf, {
      filename: clean.split('/').pop(),
    });
    if (asset._id) uploaded++;
    assetCache.set(clean, asset._id);
    process.stdout.write('.');
  } else {
    reused++;
  }

  const id = assetCache.get(clean);
  if (!id) return undefined;

  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: id },
    ...(alt ? { alt } : {}),
  };
}
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8594;/g, '→')
    .trim();
const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

/**
 * The old site linked to "glass.html#liquor"; the new one serves "/glass/".
 * Any link lifted out of the old HTML has to be rewritten, or it imports a
 * dead address into the CMS — invisible in the panel, 404 on the site, and
 * in the FAQ's case also wrong inside the structured data sent to Google.
 */
const URL_MAP = {
  'index.html': '/',
  'about.html': '/about/',
  'products.html': '/products/',
  'glass.html': '/glass/',
  'plastics.html': '/plastics/',
  'metal.html': '/metal/',
  'ceramics.html': '/ceramics/',
  '3d.html': '/3d/',
  'contact.html': '/contact/',
  'catalogue.html': '/gallery/',
  'faq.html': '/faq/',
  'blog.html': '/blog/',
  'thanks.html': '/thanks/',
};

// Article filenames, so a bare "1k-stoving-vs-2k-pu.html" — how an article
// links to a sibling in the same folder — resolves to /blog/<slug>/ rather
// than being left as a dead .html address.
const BLOG_SLUGS = new Set(
  readdirSync(join(OLD_SITE, 'blog'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => f.slice(0, -5))
);

function toNewUrl(href = '') {
  const withPath = href.match(/^(?:\.\.\/)?blog\/([\w-]+)\.html(#[\w-]*)?$/);
  if (withPath) return `/blog/${withPath[1]}/${withPath[2] || ''}`;

  const m = href.match(/^(?:\.\.\/)?([\w.-]+\.html)(#[\w-]*)?$/);
  if (!m) return href;

  const mapped = URL_MAP[m[1]];
  if (mapped) return `${mapped}${m[2] || ''}`;

  const slug = m[1].slice(0, -5);
  if (BLOG_SLUGS.has(slug)) return `/blog/${slug}/${m[2] || ''}`;

  console.log(`    ! unmapped link left as-is: ${href}`);
  return href;
}

/* ---------------------------------------------------------------- FAQ ---- */
/**
 * Turn a single paragraph of simple HTML into Portable Text, preserving the
 * links. The visible answers link to /products/ and similar; the JSON-LD copy
 * had them flattened to plain text, so reading the visible markup is what
 * keeps that internal linking alive.
 */
function htmlToBlocks(html, keyPrefix) {
  const children = [];
  const markDefs = [];
  const re = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|([^<]+)|<[^>]+>/g;
  let m;
  let i = 0;
  while ((m = re.exec(html))) {
    if (m[1] !== undefined) {
      const key = `${keyPrefix}link${i++}`;
      markDefs.push({ _key: key, _type: 'link', href: toNewUrl(m[1]) });
      children.push({ _key: `${keyPrefix}s${children.length}`, _type: 'span', text: decode(m[2]), marks: [key] });
    } else if (m[3] !== undefined) {
      const text = decode(m[3]);
      if (text) children.push({ _key: `${keyPrefix}s${children.length}`, _type: 'span', text, marks: [] });
    }
  }
  return [{ _key: `${keyPrefix}b0`, _type: 'block', style: 'normal', markDefs, children }];
}

function extractFaq() {
  const html = read('faq.html');

  // Read the visible accordion, not the JSON-LD — the visible copy is the one
  // that still has its links. The page is split into coloured groups, so the
  // structure is preserved rather than flattened into one long list.
  const groups = [];
  let totalQuestions = 0;
  let withLinks = 0;

  const groupRe =
    /<h2 class="faqgrp__title" style="--tag: var\(--([\w-]+)\)">([\s\S]*?)<\/h2>\s*<p class="faqgrp__hint">([\s\S]*?)<\/p>([\s\S]*?)(?=<div class="faqgrp"|<\/section>)/g;
  let g;
  while ((g = groupRe.exec(html))) {
    const gi = groups.length;
    const questions = [];
    const itemRe =
      /<summary class="faq__q"><h3>([\s\S]*?)<\/h3><\/summary>\s*<div class="faq__a">\s*<p>([\s\S]*?)<\/p>/g;
    let q;
    while ((q = itemRe.exec(g[4]))) {
      const qi = questions.length;
      const answer = htmlToBlocks(q[2].trim(), `g${gi}q${qi}`);
      if (answer[0].markDefs.length) withLinks++;
      questions.push({
        _key: `g${gi}q${qi}`,
        _type: 'qa',
        question: strip(q[1]),
        answer,
      });
    }
    totalQuestions += questions.length;
    groups.push({
      _key: `grp${gi}`,
      _type: 'faqGroup',
      title: strip(g[2]),
      hint: strip(g[3]),
      colour: g[1],
      questions,
    });
  }
  if (!groups.length) throw new Error('No FAQ groups found in faq.html');

  console.log(
    `  (${groups.length} groups, ${totalQuestions} questions, ${withLinks} with links preserved)`
  );

  const heading = html.match(/<h1[^>]*class="hero__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
  const intro = html.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);
  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  const desc = html.match(/<meta name="description" content="([^"]*)"/);

  return {
    _id: 'faqPage',
    _type: 'faqPage',
    // strip() leaves a space where the red dot span was, so trim after cutting it
    heading: heading ? strip(heading[1]).replace(/\.$/, '').trim() : 'Questions, answered',
    intro: intro ? strip(intro[1]) : '',
    groups,
    seo: {
      _type: 'seo',
      title: title ? decode(title[1]) : '',
      description: desc ? decode(desc[1]) : '',
      noindex: false,
    },
  };
}

/* ------------------------------------------------------- Site settings ---- */
function extractSettings() {
  const html = read('contact.html');
  const blurb = read('index.html').match(
    /<div class="footer__brand">[\s\S]*?<p>([\s\S]*?)<\/p>/
  );

  const offices = [];
  const officeRe =
    /<h3 class="office__city">([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3 class="office__city">|<\/section>)/g;
  let m;
  while ((m = officeRe.exec(html))) {
    const addr = m[2].match(/<address[^>]*>([\s\S]*?)<\/address>/);
    offices.push({
      _key: `office${offices.length}`,
      _type: 'office',
      city: strip(m[1]),
      label: offices.length === 0 ? 'Head office & plant' : 'Regional office',
      address: addr ? strip(addr[1]) : '',
    });
  }

  return {
    _id: 'siteSettings',
    _type: 'siteSettings',
    phone: '+91 98193 62380',
    phoneLink: '+919819362380',
    email: 'info@colortek.in',
    whatsappNumber: '919819362380',
    footerBlurb: blurb ? strip(blurb[1]) : '',
    offices,
  };
}

/* -------------------------------------------------------------- Home ----- */
async function extractHome() {
  const html = read('index.html');
  const kicker = html.match(/<p class="hero__kicker">([\s\S]*?)<\/p>/);
  const h1 = html.match(/<h1 class="hero__title">([\s\S]*?)<\/h1>/);
  const sub = html.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);
  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  const desc = html.match(/<meta name="description" content="([^"]*)"/);

  // The headline is split across a <br> so it stacks the same on every screen.
  let line1 = '', line2 = '';
  if (h1) {
    const parts = h1[1].replace(/<span class="dot">\.<\/span>/, '').split(/<br\s*\/?>/);
    line1 = strip(parts[0] || '');
    line2 = strip(parts[1] || '');
  }

  const stats = [];
  const statRe =
    /<span class="stat__value">([\s\S]*?)<\/span>\s*<span class="stat__label">([\s\S]*?)<\/span>/g;
  let s;
  while ((s = statRe.exec(html))) {
    const raw = s[1];
    const em = raw.match(/<em>([\s\S]*?)<\/em>/);
    const plain = /data-count-plain/.test(raw);
    let value = strip(raw.replace(/<em>[\s\S]*?<\/em>/, ''));
    let suffix = em ? strip(em[1]) : '';
    if (!em && value.endsWith('+')) {
      value = value.slice(0, -1).trim();
      suffix = '+';
    }
    stats.push({
      _key: `stat${stats.length}`,
      value,
      suffix,
      label: strip(s[2]),
      plain,
    });
  }

  // The three full-screen photo panels between the hero and the stats strip.
  const panels = [];
  const panelRe =
    /<article class="panel">\s*<img class="panel__media" src="([^"]+)"[\s\S]*?alt="([^"]*)"[\s\S]*?<h2 class="panel__title">([\s\S]*?)<\/h2>\s*<p class="panel__sub">([\s\S]*?)<\/p>[\s\S]*?<a class="btn btn--paper" href="([^"]+)">([\s\S]*?)<span class="arrow"/g;
  let pn;
  while ((pn = panelRe.exec(html))) {
    panels.push({
      _key: `panel${panels.length}`,
      title: strip(pn[3].replace(/<span class="dot">\.<\/span>/, '')),
      body: strip(pn[4]),
      ctaHref: toNewUrl(pn[5]),
      ctaLabel: strip(pn[6]),
      image: await uploadImage(pn[1], strip(pn[2])),
    });
  }

  const industries = [];
  const indRe =
    /<a class="industry-marquee__link" href="([^"]+)"[^>]*><figure><div class="thumb"><img src="([^"]+)"[^>]*alt="([^"]*)"><\/div><figcaption>([\s\S]*?)<\/figcaption>/g;
  let ind;
  const seen = new Set();
  const rawIndustries = [];
  while ((ind = indRe.exec(html))) {
    if (seen.has(ind[4])) continue; // the marquee duplicates its row for the loop
    seen.add(ind[4]);
    rawIndustries.push({ href: ind[1], src: ind[2], alt: ind[3], label: ind[4] });
  }
  for (const r of rawIndustries) {
    industries.push({
      _key: `ind${industries.length}`,
      label: strip(r.label),
      href: toNewUrl(r.href),
      image: await uploadImage(r.src, strip(r.alt)),
    });
  }

  return {
    panels,
    industries,
    _id: 'homePage',
    _type: 'homePage',
    kicker: kicker ? strip(kicker[1]) : '',
    headingLine1: line1,
    headingLine2: line2,
    heroSub: sub ? strip(sub[1]) : '',
    stats,
    seo: {
      _type: 'seo',
      title: title ? decode(title[1]) : '',
      description: desc ? decode(desc[1]) : '',
      noindex: false,
    },
  };
}

/* -------------------------------------------------------------- run ----- */
const faq = extractFaq();
const settings = extractSettings();

const extractRange = makeRangeExtractor({
  read, strip, decode, toNewUrl, uploadImage,
  iconDir: join(OLD_SITE, 'assets', 'icons'),
});

process.stdout.write('  uploading images ');
const home = await extractHome();

const RANGES = [
  ['glass.html', 'glass'],
  ['plastics.html', 'plastics'],
  ['metal.html', 'metal'],
  ['ceramics.html', 'ceramics'],
  ['3d.html', '3d'],
];
const extractGalleryItems = makeGalleryExtractor({ read, strip, uploadImage });
const { items: galleryItems, vocab } = await extractGalleryItems();

const extractBlog = makeBlogExtractor({
  read, strip, decode, toNewUrl, uploadImage,
  blogDir: join(OLD_SITE, 'blog'),
});
const posts = await extractBlog();

const pages = makePageExtractor({ read, strip, decode, toNewUrl, uploadImage });
const aboutPage = await pages.extractAbout();
const productsPage = await pages.extractProducts();
const contactPage = await pages.extractContact();

const ranges = [];
for (const [file, slug] of RANGES) ranges.push(await extractRange(file, slug));
process.stdout.write('\n');

console.log('\nExtracted from the existing site:');
console.log(`  FAQ           ${faq.groups.length} groups, ${faq.groups.reduce((n, g) => n + g.questions.length, 0)} questions`);
console.log(`  Site settings ${settings.offices.length} offices, phone + email`);
console.log(`  Home page     ${home.stats.length} stat tiles, ${home.panels.length} panels, ${home.industries.length} industry tiles`);
for (const r of ranges) {
  const systems = r.sectors.reduce((n, s) => n + s.products.length, 0) + r.standaloneProducts.length;
  console.log(
    `  ${('/' + r.slug.current + '/').padEnd(14)}${String(r.sectors.length).padStart(2)} sectors, ` +
    `${systems} systems, ${r.gallery.images.length} gallery photos`
  );
}
console.log(`  About page    ${aboutPage.facts.length} facts, ${aboutPage.storyBody.length} paragraphs, ${aboutPage.stats.length} numbers, ${aboutPage.whyCards.length} cards`);
console.log(`  Products page ${productsPage.capabilities.length} capability cards, ${productsPage.steps.length} steps`);
console.log(`  Contact page  ${contactPage.channels.length} tiles, ${contactPage.substrateOptions.length} substrate options`);
console.log(`  Blog          ${posts.length} articles, ${posts.reduce((n,p)=>n+p.body.length,0)} content blocks`);
console.log(`  Gallery       ${galleryItems.length} finishes`);
console.log(`                finishes used: ${vocab.finishes.join(', ')}`);
console.log(`                industries used: ${vocab.industries.join(', ')}`);
const ic = extractRange.stats();
console.log(`  Tab icons     ${ic.iconsMatched} matched to icon files, ${ic.iconsMissed} unmatched`);
console.log(`  Images        ${uploaded} uploaded, ${reused} reused`);

const docs = [faq, settings, home, aboutPage, productsPage, contactPage, ...ranges, ...galleryItems, ...posts];

if (DRY) {
  console.log('\n  DRY RUN — nothing written to Sanity.\n');
  process.exit(0);
}

const tx = client.transaction();
for (const doc of docs) {
  tx.createOrReplace(doc);
  // Sanity keeps a separate draft copy, and the editor shows the draft when
  // one exists. Writing only the published copy leaves an editor staring at
  // stale content — and, once the schema has changed, at an "unknown field"
  // warning. Clearing the draft makes the imported version the one they see.
  tx.delete(`drafts.${doc._id}`);
}

await tx.commit();
console.log(`\n✓ Imported ${docs.length} documents (and cleared their drafts).`);
console.log('  Refresh the admin panel to see it.\n');
