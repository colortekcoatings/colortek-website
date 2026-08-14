import React from 'react';

/**
 * "Enquiries" screen — a signpost, not an inbox.
 *
 * Enquiries were briefly stored in Sanity so they could be listed here, and
 * that had to be undone: Sanity's free plan only allows PUBLIC datasets, so
 * those records — names, emails, phone numbers — were readable by anyone who
 * knew the project ID, and that ID appears in every image URL on the site.
 *
 * They now live only where they are private: emailed on arrival, and kept in
 * Netlify's dashboard behind its login.
 *
 * Plain HTML rather than @sanity/ui: their v4 layout components did not apply
 * spacing here, and hand-written markup keeps this screen independent of their
 * component library.
 */

const RED = '#e31e24';
const FORMS_URL = 'https://app.netlify.com/projects/colortek-site/forms';

const S = {
  page: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '48px 32px 96px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
    color: '#17191d',
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
  h1: { margin: '10px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' },
  card: {
    marginTop: 28,
    border: '1px solid #e4e6e9',
    borderRadius: 12,
    padding: '24px 26px',
    background: '#fff',
  },
  p: { margin: '0 0 14px', fontSize: 15, color: '#3d434a' },
  button: {
    display: 'inline-block',
    marginTop: 6,
    padding: '11px 20px',
    borderRadius: 8,
    background: RED,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
  },
  aside: {
    marginTop: 18,
    borderLeft: `3px solid #e4e6e9`,
    padding: '4px 0 4px 18px',
  },
  small: { margin: 0, fontSize: 13.5, color: '#6b7178' },
  strong: { fontWeight: 700, color: '#17191d' },
};

export default function EnquiriesTool() {
  return (
    <div style={S.page}>
      <p style={S.kicker}>Colortek</p>
      <h1 style={S.h1}>Enquiries</h1>

      <div style={S.card}>
        <p style={S.p}>
          Every message sent through the contact form arrives by email at{' '}
          <span style={S.strong}>info@colortek.in</span>, usually within a minute
          of being sent.
        </p>
        <p style={S.p}>
          A full history is kept in Netlify, where you can search it and export
          everything to a spreadsheet.
        </p>
        <a style={S.button} href={FORMS_URL} target="_blank" rel="noopener noreferrer">
          Open the enquiry inbox →
        </a>
      </div>

      <div style={S.aside}>
        <p style={{ ...S.small, fontWeight: 700, color: '#17191d', marginBottom: 6 }}>
          Why enquiries are not listed on this screen
        </p>
        <p style={S.small}>
          This panel stores website content, which is public by design. Enquiries
          contain personal details — names, email addresses and phone numbers — so
          they are kept separately, behind a login, rather than alongside content
          that anyone can read.
        </p>
      </div>
    </div>
  );
}
