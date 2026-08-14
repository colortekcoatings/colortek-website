import React from 'react';

/**
 * The screen the client lands on.
 *
 * Written in plain HTML and CSS rather than @sanity/ui components. Their v4
 * Stack/Text components did not apply spacing here — the layout collapsed and
 * text overlapped — and hand-written markup means this screen is not coupled
 * to their component library at all. It also gives full control of the design.
 */

const RED = '#e31e24';
const INK = '#17191d';

const S = {
  page: {
    maxWidth: 920,
    margin: '0 auto',
    padding: '48px 32px 96px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
    color: INK,
    lineHeight: 1.55,
  },
  kicker: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: RED,
  },
  h1: { margin: '10px 0 0', fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' },
  lead: { margin: '12px 0 0', fontSize: 16, color: '#5b6169', maxWidth: '62ch' },
  h2: {
    margin: '48px 0 0',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8a9099',
  },
  grid: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 14,
  },
  card: {
    border: '1px solid #e4e6e9',
    borderRadius: 12,
    padding: '20px 22px',
    background: '#fff',
  },
  step: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  num: {
    flex: '0 0 26px',
    height: 26,
    borderRadius: '50%',
    background: RED,
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 700 },
  cardBody: { margin: '6px 0 0', fontSize: 14, color: '#5b6169' },
  noteList: { marginTop: 18, display: 'grid', gap: 10 },
  note: {
    borderLeft: `3px solid ${RED}`,
    background: '#fafafa',
    borderRadius: '0 8px 8px 0',
    padding: '14px 18px',
  },
  help: {
    marginTop: 40,
    border: '1px solid #e4e6e9',
    borderRadius: 12,
    padding: '20px 22px',
    background: '#fff',
  },
  link: { color: RED, fontWeight: 600 },
};

const STEPS = [
  {
    title: 'Change some words',
    body: 'Pick a page from the list on the left. Click into any box, type your change, then press Publish at the bottom right.',
  },
  {
    title: 'Change a photo',
    body: 'Click the picture you want to replace, choose Upload, and pick a new one. Add a short description of the photo — it is read aloud to blind visitors and helps the picture show up in Google Images.',
  },
  {
    title: 'Add a blog article',
    body: 'Blog articles, then the + button. Fill in the headline, summary, cover photo and text, then Publish. It appears on the website by itself.',
  },
  {
    title: 'Help your Google ranking',
    body: 'Every page has a “Search & social” tab — the title and description Google shows. Keep the title under 60 characters and the description under 160; the panel warns you if you go over.',
  },
];

const NOTES = [
  ['Nothing is live until you press Publish', 'Your edits save automatically as a draft that only you can see. The website does not change until you Publish.'],
  ['Changes take about a minute to appear', 'After publishing, the website rebuilds itself. Give it a minute, then refresh the page you changed.'],
  ['You cannot break the layout', 'You can change any words and any pictures. The design stays exactly as it is — there is no way to move things out of place.'],
];

export default function Welcome() {
  return (
    <div style={S.page}>
      <p style={S.kicker}>Colortek</p>
      <h1 style={S.h1}>Your website, in your hands.</h1>
      <p style={S.lead}>
        This is where you change what appears on colortek.in — the words, the
        photos, and the wording Google and AI assistants show about your company.
      </p>

      <h2 style={S.h2}>How to do the usual things</h2>
      <div style={S.grid}>
        {STEPS.map((s, i) => (
          <div key={s.title} style={S.card}>
            <div style={S.step}>
              <div style={S.num}>{i + 1}</div>
              <div>
                <p style={S.cardTitle}>{s.title}</p>
                <p style={S.cardBody}>{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={S.h2}>Worth knowing</h2>
      <div style={S.noteList}>
        {NOTES.map(([title, body]) => (
          <div key={title} style={S.note}>
            <p style={S.cardTitle}>{title}</p>
            <p style={S.cardBody}>{body}</p>
          </div>
        ))}
      </div>

      <div style={S.help}>
        <p style={S.cardTitle}>Stuck, or something looks wrong?</p>
        <p style={S.cardBody}>
          Email Gaatha at{' '}
          <a style={S.link} href="mailto:digimarketing@gaa-tha.com">
            digimarketing@gaa-tha.com
          </a>
          . Nothing you do here can damage the website permanently — every change
          can be undone.
        </p>
      </div>
    </div>
  );
}
