/**
 * The six blog articles.
 *
 * The table of contents in the sidebar is NOT imported — it is generated from
 * the article's own headings at render time. Storing it would mean a client
 * renaming a heading leaves a contents entry pointing nowhere.
 */
import { readdirSync } from 'node:fs';
import { htmlToPortableText } from './html-to-portable-text.mjs';

export function makeBlogExtractor({ read, strip, decode, toNewUrl, uploadImage, blogDir }) {
  return async function extractBlog() {
    const files = readdirSync(blogDir).filter((f) => f.endsWith('.html')).sort();
    const posts = [];

    for (const file of files) {
      const slug = file.slice(0, -5);
      const html = read(`blog/${file}`);
      const key = slug.replace(/[^a-z0-9]/g, '').slice(0, 12);

      // Body: everything inside <article class="article">, minus the trailing
      // "In short" aside, which becomes its own field.
      const articleStart = html.indexOf('<article class="article">');
      const articleEnd = html.indexOf('</article>', articleStart);
      let bodyHtml = articleStart === -1 ? '' : html.slice(articleStart, articleEnd);

      const asideAt = bodyHtml.indexOf('<aside');
      const asideHtml = asideAt === -1 ? '' : bodyHtml.slice(asideAt);
      if (asideAt !== -1) bodyHtml = bodyHtml.slice(0, asideAt);

      const summary = [];
      const liRe = /<li>([\s\S]*?)<\/li>/g;
      let li;
      while ((li = liRe.exec(asideHtml))) summary.push(strip(li[1]));

      const title = html.match(/<h1 class="article__title">([\s\S]*?)<\/h1>/);
      const lead = html.match(/<p class="article__lead">([\s\S]*?)<\/p>/);

      // The meta line is four spans: topic, date, reading time, byline.
      // Reading them individually rather than flattening the whole line —
      // Date.parse() on "Technology 24 June 2026 2 min read Colortek R&D"
      // returns NaN, which is how every article imported with no date.
      const meta = html.match(/<p class="article__meta">([\s\S]*?)<\/p>/);
      const spans = meta ? [...meta[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map((m) => strip(m[1])) : [];
      const topicText = meta?.[1].match(/class="article__topic"[^>]*>([\s\S]*?)<\/span>/);
      const bylineText = meta?.[1].match(/class="article__byline"[^>]*>([\s\S]*?)<\/span>/);
      const tagColour = meta?.[1].match(/--tag: var\(--([\w-]+)\)/);
      const dateSpan = spans.find((s) => /\d{1,2}\s+\w+\s+\d{4}/.test(s));
      const readSpan = spans.find((s) => /\bmin\b/.test(s));
      const cover = html.match(/<figure class="ahero__media">[\s\S]*?<img src="([^"]+)"[^>]*alt="([^"]*)"/);
      const coverCap = html.match(/<figure class="ahero__media">[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>/);
      const seoTitle = html.match(/<title>([\s\S]*?)<\/title>/);
      const seoDesc = html.match(/<meta name="description" content="([^"]*)"/);

      const railTitle = html.match(/<p class="railcta__title">([\s\S]*?)<\/p>/);
      const railLink = html.match(/<a class="railcta__alt" href="([^"]+)">([\s\S]*?)<span class="arrow"/);

      const mins = readSpan?.match(/(\d+)\s*min/);

      // Format from local date parts, not toISOString(). Date.parse gives
      // local midnight; converting that to UTC from IST (+5:30) rolls back to
      // the previous evening, so every article imported one day early.
      const d = dateSpan ? new Date(Date.parse(dateSpan)) : null;
      const publishedAt =
        d && !Number.isNaN(d.getTime())
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          : undefined;

      posts.push({
        _id: `post-${slug}`,
        _type: 'blogPost',
        // The red dot is a <span> the layout adds back; leaving it in the
        // stored title flattens to a stray " ." on the end.
        title: title ? strip(title[1].replace(/<span class="dot">[^<]*<\/span>/, '')) : slug,
        slug: { _type: 'slug', current: slug },
        excerpt: lead ? strip(lead[1]) : '',
        topic: topicText ? strip(topicText[1]) : '',
        topicColour: tagColour ? tagColour[1] : undefined,
        byline: bylineText ? strip(bylineText[1]) : '',
        readingTime: mins ? Number(mins[1]) : undefined,
        publishedAt,
        coverImage: cover
          ? {
              ...(await uploadImage(cover[1], strip(cover[2]))),
              ...(coverCap ? { caption: strip(coverCap[1]) } : {}),
            }
          : undefined,
        body: htmlToPortableText(bodyHtml, key, toNewUrl),
        summary,
        railCta: {
          title: railTitle ? strip(railTitle[1]) : '',
          linkLabel: railLink ? strip(railLink[2]) : '',
          linkHref: railLink ? toNewUrl(railLink[1]) : '',
        },
        seo: {
          _type: 'seo',
          title: seoTitle ? decode(seoTitle[1]) : '',
          description: seoDesc ? decode(seoDesc[1]) : '',
          noindex: false,
        },
      });
    }

    return posts;
  };
}
