/**
 * Pull the five substrate pages out of the old HTML.
 *
 * Two shapes exist and both have to work:
 *   - tabbed   (glass 7 sectors, plastics 6, metal 2) — a tab strip, each tab
 *     holding one or more coating systems
 *   - single   (ceramics, 3d) — one system, no tabs at all
 *
 * The single-product pages are not a special case in the schema: they are
 * simply a page with an empty sectors list, so the client could add tabs to
 * Ceramics later without a developer.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The sector tabs carry inline SVGs. Rather than storing raw markup in the
 * CMS, each one is matched back to the icon file it came from by comparing
 * path data — so the client picks "Wine glass" from a list instead of
 * pasting SVG. All 15 in the old site match a file in assets/icons.
 */
function buildIconFingerprints(iconDir) {
  const byPath = new Map();
  for (const file of readdirSync(iconDir)) {
    if (!file.endsWith('.svg')) continue;
    const svg = readFileSync(join(iconDir, file), 'utf8');
    const d = svg.match(/\sd="([^"]{20,})"/);
    if (d) byPath.set(d[1].slice(0, 60), file.slice(0, -4));
  }
  return byPath;
}

export function makeRangeExtractor({ read, strip, decode, toNewUrl, uploadImage, iconDir }) {
  const iconPrints = buildIconFingerprints(iconDir);
  let iconsMatched = 0;
  let iconsMissed = 0;

  const iconFor = (svgMarkup) => {
    const d = svgMarkup?.match(/\sd="([^"]+)"/);
    const hit = d ? iconPrints.get(d[1].slice(0, 60)) : undefined;
    if (hit) iconsMatched++;
    else iconsMissed++;
    return hit;
  };

  /** One <section class="catpanel"> -> the coating systems inside it. */
  async function extractSystems(panelHtml, keyPrefix) {
    const systems = [];

    // Split rather than regex-match. A system is a catpanel__grid followed by
    // its glance strip, and both contain nested <div>s — a non-greedy regex
    // closes on the first inner </div> and silently captures nothing, which
    // is exactly how the spec tiles went missing the first time round.
    const segments = panelHtml.split(/<div class="catpanel__grid/).slice(1);

    for (const raw of segments) {
      const segment = '<div class="catpanel__grid' + raw;
      const glanceStart = segment.indexOf('<div class="glance">');
      const block = glanceStart === -1 ? segment : segment.slice(0, glanceStart);
      const glanceHtml = glanceStart === -1 ? '' : segment.slice(glanceStart);
      const i = systems.length;

      const title = block.match(/<h2 class="catpanel__title">([\s\S]*?)<span class="catpanel__sub">([\s\S]*?)<\/span>/);
      if (!title) continue;

      const text = block.match(/<p class="catpanel__text">([\s\S]*?)<\/p>/);
      const img = block.match(/<img src="([^"]+)"[^>]*alt="([^"]*)"/);
      const capKicker = block.match(/<figcaption class="pmedia__cap">\s*<span>([\s\S]*?)<\/span>/);
      const capStrong = block.match(/<figcaption class="pmedia__cap">[\s\S]*?<strong>([\s\S]*?)<\/strong>/);

      const features = [];
      const featRe = /<li><strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span><\/li>/g;
      let f;
      while ((f = featRe.exec(block))) {
        features.push({
          _key: `${keyPrefix}s${i}f${features.length}`,
          title: strip(f[1]),
          detail: strip(f[2]),
        });
      }

      const glance = [];
      const glanceRe = /<div class="glance__tile"><span>([\s\S]*?)<\/span><strong>([\s\S]*?)<\/strong><\/div>/g;
      let gt;
      while ((gt = glanceRe.exec(glanceHtml))) {
        glance.push({
          _key: `${keyPrefix}s${i}g${glance.length}`,
          label: strip(gt[1]),
          value: strip(gt[2]),
        });
      }

      const image = img ? await uploadImage(img[1], strip(img[2])) : undefined;
      if (image) {
        if (capKicker) image.captionKicker = strip(capKicker[1]);
        if (capStrong) image.caption = strip(capStrong[1]);
      }

      systems.push({
        _key: `${keyPrefix}s${i}`,
        _type: 'system',
        name: strip(title[1]),
        tagline: strip(title[2]),
        body: text ? strip(text[1]) : '',
        image,
        features,
        glance,
      });
    }
    return systems;
  }

  /** The scrolling strip of production photos near the bottom of each page. */
  async function extractGallery(html, keyPrefix) {
    const head = html.match(
      /<div class="section-head section-head--sub section-head--split"[^>]*>\s*<div>\s*<h2 class="section-head__title">([\s\S]*?)<\/h2>\s*<p class="section-head__lead">([\s\S]*?)<\/p>/
    );
    // Splitting rather than matching: the group contains nested <div>s, so a
    // non-greedy regex stops at the first closing tag and finds one image
    // instead of all of them. The marquee also repeats its row to loop
    // seamlessly, so only the first group is read.
    const track = html.match(/<div class="industry-marquee__track">([\s\S]*?)<\/section>/);
    const firstGroup = track
      ? track[1].split(/<div class="industry-marquee__group"[^>]*>/)[1]
      : null;

    const images = [];
    if (firstGroup) {
      const imgRe = /<img src="([^"]+)"[^>]*alt="([^"]*)"/g;
      let m;
      while ((m = imgRe.exec(firstGroup))) {
        const up = await uploadImage(m[1], strip(m[2]));
        if (up) images.push({ ...up, _key: `${keyPrefix}gal${images.length}` });
      }
    }

    return {
      title: head ? strip(head[1].replace(/<span class="dot">\.<\/span>/, '')) : '',
      lead: head ? strip(head[2]) : '',
      images,
    };
  }

  /** The certification panel — written once per page, shown in flagged sectors. */
  function extractCompliance(html, keyPrefix) {
    const block = html.match(/<div class="catpanel__compliance">([\s\S]*?)<\/div>\s*<\/section>/);
    if (!block) return undefined;
    const b = block[1];
    const head = b.match(/<h2 class="section-head__title">([\s\S]*?)<\/h2>\s*<p class="section-head__lead">([\s\S]*?)<\/p>/);
    const creds = [];
    const credRe = /<strong>([\s\S]*?)<\/strong>\s*<span>([\s\S]*?)<\/span>\s*<em>([\s\S]*?)<\/em>/g;
    let c;
    while ((c = credRe.exec(b)))
      creds.push({ _key: `${keyPrefix}cred${creds.length}`, name: strip(c[1]), detail: strip(c[2]), reference: strip(c[3]) });
    const foot = b.match(/<p class="cert-plate__foot">([\s\S]*?)<a href="[^"]*">([\s\S]*?)<span class="arrow"/);
    return {
      title: head ? strip(head[1].replace(/<span class="dot">\.<\/span>/, '')) : '',
      lead: head ? strip(head[2]) : '',
      credentials: creds,
      footNote: foot ? strip(foot[1]) : '',
      footLinkLabel: foot ? strip(foot[2]) : '',
    };
  }

  /** The closing band at the bottom of the page. */
  function extractCta(html) {
    const t = html.match(/<h2 class="cta-final__title"[^>]*>([\s\S]*?)<\/h2>/);
    const l = html.match(/<p class="cta-final__lead"[^>]*>([\s\S]*?)<\/p>/);
    const w = html.match(/wa\.me\/\d+\?text=([^"]*)/);
    return {
      title: t ? strip(t[1].replace(/<span class="dot">[.?]<\/span>/, '')) : '',
      lead: l ? strip(l[1]) : '',
      whatsappText: w ? decodeURIComponent(w[1]) : '',
    };
  }

  extractRange.stats = () => ({ iconsMatched, iconsMissed });

  async function extractRange(file, slug) {
    const html = read(file);
    const key = slug.replace(/[^a-z0-9]/g, '');

    const h1 = html.match(/<h1 class="hero__title">([\s\S]*?)<\/h1>/);
    const sub = html.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);
    const art = html.match(/<img class="range-hero__art" src="([^"]+)"/);
    const title = html.match(/<title>([\s\S]*?)<\/title>/);
    const desc = html.match(/<meta name="description" content="([^"]*)"/);

    // Tabs, where the page has them.
    const tabs = [];
    const tabRe =
      /<button class="sector[^"]*" role="tab" id="tab-([\w-]+)"[^>]*>([\s\S]*?)<span>([\s\S]*?)<\/span>\s*<\/button>/g;
    let t;
    while ((t = tabRe.exec(html)))
      tabs.push({ anchor: t[1], icon: iconFor(t[2]), label: strip(t[3]) });

    const sectors = [];
    for (const tab of tabs) {
      const panel = html.match(
        new RegExp(`<section class="catpanel" id="panel-${tab.anchor}"[\\s\\S]*?>([\\s\\S]*?)</section>`)
      );
      if (!panel) continue;
      const i = sectors.length;
      sectors.push({
        _key: `${key}sec${i}`,
        _type: 'sector',
        label: tab.label,
        anchor: { _type: 'slug', current: tab.anchor },
        icon: tab.icon,
        // The certification block was moved inside a single sector by hand —
        // the REACH/TSCA references belong to ISOTRAP, so cosmetics only.
        compliance: /catpanel__compliance/.test(panel[1]),
        products: await extractSystems(panel[1], `${key}sec${i}`),
      });
    }

    // Single-product pages: one catpanel, no tabs.
    let standalone = [];
    if (!tabs.length) {
      const panel = html.match(/<section class="catpanel">([\s\S]*?)<\/section>/);
      if (panel) standalone = await extractSystems(panel[1], `${key}solo`);
    }

    return {
      _id: `range-${slug}`,
      _type: 'rangePage',
      title: h1 ? strip(h1[1].replace(/<span class="dot">\.<\/span>/, '')) : '',
      slug: { _type: 'slug', current: slug },
      intro: sub ? strip(sub[1]) : '',
      heroImage: art ? await uploadImage(art[1], '') : undefined,
      sectors,
      standaloneProducts: standalone,
      complianceBlock: extractCompliance(html, key),
      cta: extractCta(html),
      gallery: await extractGallery(html, key),
      seo: {
        _type: 'seo',
        title: title ? decode(title[1]) : '',
        description: desc ? decode(desc[1]) : '',
        noindex: false,
      },
    };
  }

  return extractRange;
}
