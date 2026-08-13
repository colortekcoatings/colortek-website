/**
 * Copies each contact form submission into Sanity.
 *
 * Netlify calls a function with this exact filename automatically whenever a
 * form is submitted — no wiring, no webhook to configure. The name is the
 * contract, so do not rename this file.
 *
 * Why copy it at all: Netlify already stores the submission and emails
 * info@colortek.in. Writing a second copy into Sanity is what lets the client
 * read enquiries inside the admin panel, using their normal Sanity login —
 * no Netlify account, and no custom authentication for us to get wrong.
 *
 * The write token is server-side only. It never reaches the browser.
 */

const PROJECT_ID = '5ih96glo';
const DATASET = 'production';

export default async function handler(request) {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) {
    console.error('SANITY_WRITE_TOKEN is not set — enquiry not copied to Sanity.');
    // 200 on purpose: Netlify has already stored and emailed the submission,
    // and failing here would make it look to the visitor as if the form broke.
    return new Response('Missing token', { status: 200 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response('Bad payload', { status: 200 });
  }

  const s = payload?.payload || payload || {};
  const data = s.data || {};

  // Ignore anything that is not the enquiry form.
  if (s.form_name && s.form_name !== 'enquiry') {
    return new Response('Ignored', { status: 200 });
  }

  const doc = {
    // Deterministic id from Netlify's own submission id, so a retried delivery
    // updates the same document instead of creating a duplicate.
    _id: `enquiry-${s.id || Date.now()}`,
    _type: 'enquiry',
    name: data.name || s.name || '',
    company: data.company || '',
    email: data.email || s.email || '',
    phone: data.phone || '',
    substrate: data.substrate || '',
    message: data.message || '',
    receivedAt: s.created_at || new Date().toISOString(),
    netlifyId: s.id || '',
  };

  try {
    const res = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
      }
    );
    if (!res.ok) {
      console.error('Sanity rejected the enquiry:', res.status, await res.text());
    }
  } catch (e) {
    console.error('Could not reach Sanity:', e.message);
  }

  return new Response('OK', { status: 200 });
}
