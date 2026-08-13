/**
 * The 45 gallery finishes.
 *
 * Each card carries its filter tags as data attributes. The pipe-separated
 * ones become arrays; the searchable text is NOT imported because the page
 * regenerates it from the fields — storing it would mean a client editing a
 * title leaves a stale search index behind.
 */
export function makeGalleryExtractor({ read, strip, uploadImage }) {
  return async function extractGallery() {
    const html = read('catalogue.html');

    // Split on the card boundary rather than regex-matching across nested
    // markup — the same failure that lost the spec tiles and gallery photos.
    const cards = html.split(/<article class="ccard"/).slice(1);

    const items = [];
    const seenIndustries = new Set();
    const seenFinishes = new Set();

    for (const raw of cards) {
      const card = '<article class="ccard"' + raw;
      const end = card.indexOf('</article>');
      const block = end === -1 ? card : card.slice(0, end);

      const attr = (n) => {
        const m = block.match(new RegExp(`data-${n}="([^"]*)"`));
        return m ? m[1] : '';
      };
      const split = (v) => v.split('|').map((x) => x.trim()).filter(Boolean);

      const name = block.match(/<h3 class="ccard__name">([\s\S]*?)<\/h3>/);
      const system = block.match(/<p class="ccard__system">([\s\S]*?)<\/p>/);
      const img = block.match(/<img src="([^"]+)"[^>]*alt="([^"]*)"/);

      const finishes = split(attr('finish'));
      const industries = split(attr('industry'));
      finishes.forEach((f) => seenFinishes.add(f));
      industries.forEach((i) => seenIndustries.add(i));

      const i = items.length;
      items.push({
        _id: `gallery-${i.toString().padStart(2, '0')}-${(name ? strip(name[1]) : 'item')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')}`,
        _type: 'galleryItem',
        title: name ? strip(name[1]) : '',
        system: system ? strip(system[1]) : '',
        substrate: attr('substrate'),
        finishes,
        industries,
        order: i,
        image: img ? await uploadImage(img[1], strip(img[2])) : undefined,
      });
    }

    return {
      items,
      vocab: {
        finishes: [...seenFinishes].sort(),
        industries: [...seenIndustries].sort(),
      },
    };
  };
}
