/**
 * Convert article HTML into Portable Text, the format Sanity stores rich text
 * in. Handles what the six articles actually contain and nothing more:
 * h2, h3, paragraphs, bullet and numbered lists, pull quotes, links, bold
 * and italic.
 *
 * Block-level elements are found by scanning for their opening tags and
 * pairing them with their matching close, rather than by regex. Nested markup
 * defeats a non-greedy regex — it closes on the first inner tag and silently
 * captures nothing, which is how the spec tiles and gallery photos went
 * missing earlier in this project.
 */

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#8594;/g, '→');

/** Find the content of the element opening at `from`, honouring nesting. */
function readElement(html, tag, from) {
  const open = new RegExp(`<${tag}\\b[^>]*>`, 'g');
  const close = new RegExp(`</${tag}>`, 'g');
  open.lastIndex = from;
  const first = open.exec(html);
  if (!first) return null;

  let depth = 1;
  let pos = first.index + first[0].length;
  const start = pos;

  while (depth > 0) {
    open.lastIndex = pos;
    close.lastIndex = pos;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) return null;
    if (o && o.index < c.index) {
      depth++;
      pos = o.index + o[0].length;
    } else {
      depth--;
      pos = c.index + c[0].length;
      if (depth === 0) {
        return { inner: html.slice(start, c.index), end: pos, attrs: first[0] };
      }
    }
  }
  return null;
}

/** Inline markup -> Portable Text spans, preserving links, bold and italic. */
function toSpans(html, keyPrefix, toNewUrl) {
  const children = [];
  const markDefs = [];
  let linkN = 0;

  const walk = (fragment, marks) => {
    const token =
      /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<(strong|b)>([\s\S]*?)<\/\3>|<(em|i)>([\s\S]*?)<\/\5>|<br\s*\/?>/i;
    let rest = fragment;

    while (rest) {
      const m = rest.match(token);
      if (!m) {
        pushText(rest, marks);
        return;
      }
      pushText(rest.slice(0, m.index), marks);

      if (m[1] !== undefined) {
        const key = `${keyPrefix}l${linkN++}`;
        markDefs.push({ _key: key, _type: 'link', href: toNewUrl(m[1]) });
        walk(m[2], [...marks, key]);
      } else if (m[3]) {
        walk(m[4], [...marks, 'strong']);
      } else if (m[5]) {
        walk(m[6], [...marks, 'em']);
      } else {
        pushText(' ', marks); // <br> becomes a space; blocks handle real breaks
      }
      rest = rest.slice(m.index + m[0].length);
    }
  };

  const pushText = (raw, marks) => {
    const text = decodeEntities(raw.replace(/<[^>]+>/g, ''));
    if (!text) return;
    children.push({
      _key: `${keyPrefix}s${children.length}`,
      _type: 'span',
      text,
      marks: [...marks],
    });
  };

  walk(html, []);
  return { children, markDefs };
}

const block = (style, html, key, toNewUrl, listItem) => {
  const { children, markDefs } = toSpans(html, key, toNewUrl);
  if (!children.length) return null;
  return {
    _key: key,
    _type: 'block',
    style,
    markDefs,
    children,
    ...(listItem ? { listItem, level: 1 } : {}),
  };
};

export function htmlToPortableText(html, keyPrefix, toNewUrl = (x) => x) {
  const blocks = [];
  let i = 0;
  let n = 0;

  while (i < html.length) {
    const next = html.slice(i).match(/<(h2|h3|p|ul|ol|blockquote)\b[^>]*>/i);
    if (!next) break;
    const tag = next[1].toLowerCase();
    const at = i + next.index;
    const el = readElement(html, tag, at);
    if (!el) break;

    if (tag === 'ul' || tag === 'ol') {
      const listItem = tag === 'ul' ? 'bullet' : 'number';
      let j = 0;
      while (j < el.inner.length) {
        const li = el.inner.slice(j).match(/<li\b[^>]*>/i);
        if (!li) break;
        const item = readElement(el.inner, 'li', j + li.index);
        if (!item) break;
        const b = block('normal', item.inner, `${keyPrefix}b${n++}`, toNewUrl, listItem);
        if (b) blocks.push(b);
        j = item.end;
      }
    } else {
      const style = tag === 'blockquote' ? 'blockquote' : tag === 'p' ? 'normal' : tag;
      const b = block(style, el.inner, `${keyPrefix}b${n++}`, toNewUrl);
      if (b) blocks.push(b);
    }
    i = el.end;
  }

  return blocks;
}
