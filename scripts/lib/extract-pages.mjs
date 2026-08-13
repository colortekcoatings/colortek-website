/**
 * The three remaining bespoke pages: About, Products and Contact.
 *
 * Two things are deliberately NOT extracted here:
 *   - the list of coating ranges on the Products page, which is generated from
 *     the five range documents so adding a range needs one edit, not two
 *   - the phone number, email and office addresses on Contact, which live in
 *     Site settings because the footer uses them too
 */

export function makePageExtractor({ read, strip, decode, toNewUrl, uploadImage }) {
  const seo = (html) => {
    const t = html.match(/<title>([\s\S]*?)<\/title>/);
    const d = html.match(/<meta name="description" content="([^"]*)"/);
    return {
      _type: 'seo',
      title: t ? decode(t[1]) : '',
      description: d ? decode(d[1]) : '',
      noindex: false,
    };
  };

  /** Strip the red-dot span before flattening, or headings end in " .". */
  const heading = (raw) => strip((raw || '').replace(/<span class="dot">[^<]*<\/span>/, ''));

  /** Paragraphs -> Portable Text, one block each. */
  const paragraphs = (html, keyPrefix) => {
    const blocks = [];
    const re = /<p>([\s\S]*?)<\/p>/g;
    let m;
    while ((m = re.exec(html))) {
      const text = strip(m[1]);
      if (!text) continue;
      blocks.push({
        _key: `${keyPrefix}p${blocks.length}`,
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [{ _key: `${keyPrefix}p${blocks.length}s`, _type: 'span', text, marks: [] }],
      });
    }
    return blocks;
  };

  const stats = (html, keyPrefix) => {
    const out = [];
    const re = /<span class="stat__value">([\s\S]*?)<\/span>\s*<span class="stat__label">([\s\S]*?)<\/span>/g;
    let m;
    while ((m = re.exec(html))) {
      const raw = m[1];
      const em = raw.match(/<em>([\s\S]*?)<\/em>/);
      let value = strip(raw.replace(/<em>[\s\S]*?<\/em>/, ''));
      let suffix = em ? strip(em[1]) : '';
      if (!em && value.endsWith('+')) {
        value = value.slice(0, -1).trim();
        suffix = '+';
      }
      out.push({
        _key: `${keyPrefix}s${out.length}`,
        value,
        suffix,
        label: strip(m[2]),
        plain: /data-count-plain/.test(raw),
      });
    }
    return out;
  };

  const cta = (html) => {
    const t = html.match(/<h2 class="cta-final__title"[^>]*>([\s\S]*?)<\/h2>/);
    const l = html.match(/<p class="cta-final__lead"[^>]*>([\s\S]*?)<\/p>/);
    return { title: t ? heading(t[1]) : '', lead: l ? strip(l[1]) : '' };
  };

  /* ------------------------------------------------------------- About ---- */
  async function extractAbout() {
    const html = read('about.html');

    const h1 = html.match(/<h1 class="hero__title">([\s\S]*?)<\/h1>/);
    let line1 = '', line2 = '';
    if (h1) {
      const parts = h1[1].replace(/<span class="dot">[^<]*<\/span>/, '').split(/<br\s*\/?>/);
      line1 = strip(parts[0] || '');
      line2 = strip(parts[1] || '');
    }
    const sub = html.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);

    const facts = [];
    const factRe = /<div class="fact"><dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd><\/div>/g;
    let f;
    while ((f = factRe.exec(html)))
      facts.push({ _key: `fact${facts.length}`, label: strip(f[1]), value: strip(f[2]) });

    const storyTitle = html.match(/<h2 class="story__title">([\s\S]*?)<\/h2>/);
    const storyCopy = html.match(/<div class="story__copy"[^>]*>([\s\S]*?)<\/div>/);
    const quote = html.match(/<p class="story__tagline">([\s\S]*?)<\/p>/);
    const storyImg = html.match(/<figure class="story__media"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?alt="([^"]*)"[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>/);

    // Everything except the pull quote becomes the story body.
    const bodyHtml = storyCopy
      ? storyCopy[1].replace(/<p class="story__tagline">[\s\S]*?<\/p>/, '').replace(/<h2[\s\S]*?<\/h2>/, '')
      : '';

    const vHead = html.match(/<h2 class="section-head__title">([\s\S]*?)<\/h2>\s*<p class="section-head__lead">([\s\S]*?)<\/p>[\s\S]*?vplayer/);
    const poster = html.match(/<div class="vplayer"[\s\S]*?poster="([^"]+)"/) || html.match(/poster="([^"]+)"/);
    const ytId = html.match(/data-youtube="([^"]+)"/);

    const whyHead = html.match(/<h2 class="section-head__title">Why[\s\S]*?<\/h2>\s*<p class="section-head__lead">([\s\S]*?)<\/p>/);
    const whyTitle = html.match(/<h2 class="section-head__title">(Why[\s\S]*?)<\/h2>/);
    const whyCards = [];
    const cardRe = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
    let c;
    while ((c = cardRe.exec(html)) && whyCards.length < 6)
      whyCards.push({ _key: `why${whyCards.length}`, title: strip(c[1]), body: strip(c[2]) });

    // --- vision, mission, values -------------------------------------
    const vmvTitle = html.match(/<h2 class="section-head__title">(Vision[\s\S]*?)<\/h2>/);
    const vmvPanels = [];
    for (const raw of html.split('<article class="vmv__panel"').slice(1)) {
      const panel = raw.slice(0, raw.indexOf('</article>'));
      const t = panel.match(/<h3 class="vmv__title"[^>]*>([\s\S]*?)<\/h3>/);
      const col = panel.match(/--tag: var\(--([\w-]+)\)/);
      const b = panel.match(/<p>([\s\S]*?)<\/p>/);
      vmvPanels.push({
        _key: `vmv${vmvPanels.length}`,
        title: t ? strip(t[1]) : '',
        colour: col ? col[1] : 'spec-1',
        body: b ? strip(b[1]) : '',
      });
    }
    const valuesBlock = html.match(/<div class="tags tags--values"[\s\S]*?<\/div>/);
    const values = valuesBlock
      ? [...valuesBlock[0].matchAll(/<span class="tag"[^>]*>([\s\S]*?)<\/span>/g)].map((m) => strip(m[1]))
      : [];

    // --- timeline -----------------------------------------------------
    const tlTitle = html.match(/<h2 class="section-head__title">(Twenty[\s\S]*?)<\/h2>/);
    const milestones = [];
    const msRe = /<li class="jms"[^>]*><span class="jms__year">([\s\S]*?)<\/span><p>([\s\S]*?)<\/p><\/li>/g;
    let ms;
    while ((ms = msRe.exec(html)))
      milestones.push({ _key: `ms${milestones.length}`, year: strip(ms[1]), text: strip(ms[2]) });
    const range = html.match(/<div class="jpin__meta"[^>]*>\s*<span>([\s\S]*?)<\/span>/);

    // --- second story block -------------------------------------------
    // The page has two story blocks; the second is "Engineered in-house" and
    // carries an extra class ("story story--flip"), so the split has to match
    // the class prefix rather than an exact string.
    const storyBlocks = html.split(/<div class="story(?: story--flip)?"/).slice(1);
    let second = {};
    if (storyBlocks.length > 1) {
      const b = storyBlocks[1];
      const t = b.match(/<h2 class="story__title">([\s\S]*?)<\/h2>/);
      const copy = b.match(/<div class="story__copy"[^>]*>([\s\S]*?)<\/div>/);
      const img = b.match(/<img src="([^"]+)"[\s\S]*?alt="([^"]*)"/);
      const cap = b.match(/<figcaption>([\s\S]*?)<\/figcaption>/);
      const btn = b.match(/<a class="btn[^"]*" href="([^"]+)">([\s\S]*?)<span class="arrow"/);
      second = {
        secondStoryTitle: t ? heading(t[1]) : '',
        secondStoryBody: paragraphs(
          copy ? copy[1].replace(/<h2[\s\S]*?<\/h2>/, '').replace(/<p class="story__cta">[\s\S]*?<\/p>/, '') : '',
          'story2'
        ),
        secondStoryImage: img
          ? { ...(await uploadImage(img[1], strip(img[2]))), ...(cap ? { caption: strip(cap[1]) } : {}) }
          : undefined,
        secondStoryCtaLabel: btn ? strip(btn[2]) : '',
        secondStoryCtaHref: btn ? toNewUrl(btn[1]) : '',
      };
    }

    return {
      _id: 'aboutPage',
      _type: 'aboutPage',
      vmvHeading: vmvTitle ? heading(vmvTitle[1]) : '',
      vmvPanels,
      values,
      timelineHeading: tlTitle ? heading(tlTitle[1]) : '',
      timelineRange: range ? strip(range[1]) : '',
      milestones,
      ...second,
      headingLine1: line1,
      headingLine2: line2,
      intro: sub ? strip(sub[1]) : '',
      facts,
      storyTitle: storyTitle ? heading(storyTitle[1]) : '',
      storyBody: paragraphs(bodyHtml, 'story'),
      storyQuote: quote ? strip(quote[1]) : '',
      storyImage: storyImg
        ? { ...(await uploadImage(storyImg[1], strip(storyImg[2]))), caption: strip(storyImg[3]) }
        : undefined,
      video: {
        heading: vHead ? heading(vHead[1]) : '',
        lead: vHead ? strip(vHead[2]) : '',
        youtubeId: ytId ? ytId[1] : '',
        poster: poster ? await uploadImage(poster[1], 'Inside the Colortek plant') : undefined,
      },
      stats: stats(html, 'about'),
      whyHeading: whyTitle ? heading(whyTitle[1]) : '',
      whyLead: whyHead ? strip(whyHead[1]) : '',
      whyCards,
      cta: cta(html),
      seo: seo(html),
    };
  }

  /* ---------------------------------------------------------- Products ---- */
  async function extractProducts() {
    const html = read('products.html');

    const h1 = html.match(/<h1 class="hero__title[^"]*">([\s\S]*?)<\/h1>/);
    const sub = html.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);

    const capHead = html.match(/<h2 class="section-head__title">([\s\S]*?)<\/h2>\s*<p class="section-head__lead">([\s\S]*?)<\/p>[\s\S]*?cap-cards/);
    // Split on the card boundary rather than one big regex: each card holds an
    // image, a kicker, a title and a list of tags, and the colour comes from
    // --group (not --tag, which is what the first attempt looked for and why
    // this imported zero cards).
    const caps = [];
    for (const raw of html.split('<article class="cap-card"').slice(1)) {
      const card = raw.slice(0, raw.indexOf('</article>'));
      const colour = card.match(/--group: var\(--([\w-]+)\)/);
      const img = card.match(/<img src="([^"]+)"[\s\S]*?alt="([^"]*)"/);
      const kicker = card.match(/<p class="cap-card__kicker">([\s\S]*?)<\/p>/);
      const title = card.match(/<h3 class="cap-card__title">([\s\S]*?)<\/h3>/);
      const tags = [...card.matchAll(/<span class="tag">([\s\S]*?)<\/span>/g)].map((t) => strip(t[1]));
      caps.push({
        _key: `cap${caps.length}`,
        colour: colour ? colour[1] : 'spec-1',
        kicker: kicker ? strip(kicker[1]) : '',
        title: title ? strip(title[1]) : '',
        tags,
        image: img ? await uploadImage(img[1], strip(img[2])) : undefined,
      });
    }

    const stepHead = html.match(/<h2 class="section-head__title">(From brief[\s\S]*?)<\/h2>\s*<p class="section-head__lead">([\s\S]*?)<\/p>/);
    const steps = [];
    const stepRe = /<span class="rail__num"[^>]*>([\s\S]*?)<\/span>\s*<h3 class="rail__title">([\s\S]*?)<\/h3>\s*<p class="rail__text">([\s\S]*?)<\/p>/g;
    let st;
    while ((st = stepRe.exec(html)))
      steps.push({ _key: `step${steps.length}`, number: strip(st[1]), title: strip(st[2]), body: strip(st[3]) });

    return {
      _id: 'productsPage',
      _type: 'productsPage',
      heading: h1 ? heading(h1[1]) : '',
      intro: sub ? strip(sub[1]) : '',
      capabilitiesHeading: capHead ? heading(capHead[1]) : '',
      capabilitiesLead: capHead ? strip(capHead[2]) : '',
      capabilities: caps,
      stepsHeading: stepHead ? heading(stepHead[1]) : '',
      stepsLead: stepHead ? strip(stepHead[2]) : '',
      steps,
      cta: cta(html),
      seo: seo(html),
    };
  }

  /* ----------------------------------------------------------- Contact ---- */
  async function extractContact() {
    const html = read('contact.html');

    const h1 = html.match(/<h1 class="hero__title">([\s\S]*?)<\/h1>/);
    const sub = html.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);

    const channels = [];
    const chRe = /<a class="channel" href="([^"]+)"[\s\S]*?<span class="channel__label">([\s\S]*?)<\/span>\s*<span class="channel__value">([\s\S]*?)<\/span>\s*<span class="channel__hint">([\s\S]*?)<span class="arrow"/g;
    let ch;
    while ((ch = chRe.exec(html))) {
      const href = ch[1];
      const kind = href.startsWith('tel:') ? 'phone' : href.includes('wa.me') ? 'whatsapp' : 'email';
      const wa = href.match(/\?text=([^"]*)/);
      channels.push({
        _key: `ch${channels.length}`,
        kind,
        label: strip(ch[2]),
        value: strip(ch[3]),
        hint: strip(ch[4]),
        ...(kind === 'whatsapp' && wa ? { whatsappText: decodeURIComponent(wa[1]) } : {}),
      });
    }

    const formHead = html.match(/<h2 class="section-head__title">([\s\S]*?)<\/h2>/);
    const options = [];
    const optRe = /<option[^>]*>([\s\S]*?)<\/option>/g;
    let o;
    while ((o = optRe.exec(html))) {
      const v = strip(o[1]);
      if (v) options.push(v);
    }

    return {
      _id: 'contactPage',
      _type: 'contactPage',
      heading: h1 ? heading(h1[1]) : '',
      intro: sub ? strip(sub[1]) : '',
      channels,
      formHeading: formHead ? heading(formHead[1]) : '',
      substrateOptions: options,
      seo: seo(html),
    };
  }

  return { extractAbout, extractProducts, extractContact };
}
