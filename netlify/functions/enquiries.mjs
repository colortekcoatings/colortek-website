/**
 * Enquiries API for the admin panel.
 *
 * Lets the client read, export and delete form submissions from inside
 * /admin, without needing a Netlify account of their own.
 *
 * SECURITY — the two rules this file exists to enforce:
 *
 *   1. The Netlify API token lives ONLY here, in a server-side environment
 *      variable. It is never sent to the browser. A token in client-side code
 *      is readable by anyone who views source.
 *
 *   2. Every request is checked against Sanity before anything is returned.
 *      The caller sends their Sanity session token; we ask Sanity who they are
 *      and whether they are a member of this project. No valid Sanity login,
 *      no data. Without this the endpoint would be an open, unauthenticated
 *      dump of every customer enquiry.
 */

const SANITY_PROJECT_ID = '5ih96glo';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/** Confirm the caller is a real, logged-in member of the Sanity project. */
async function verifySanityUser(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return { ok: false, reason: 'No credentials supplied' };

  // Ask Sanity to identify the token holder.
  const meRes = await fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) return { ok: false, reason: 'Not signed in to the admin panel' };
  const me = await meRes.json();
  if (!me?.id) return { ok: false, reason: 'Not signed in to the admin panel' };

  // Being a valid Sanity user is not enough — they must belong to THIS project.
  const aclRes = await fetch(
    `https://api.sanity.io/v2021-06-07/projects/${SANITY_PROJECT_ID}/acl`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!aclRes.ok) return { ok: false, reason: 'No access to this project' };

  return { ok: true, user: me.name || me.email || me.id };
}

export default async function handler(request) {
  const NETLIFY_TOKEN = process.env.NETLIFY_API_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!NETLIFY_TOKEN || !SITE_ID) {
    return json(500, {
      error:
        'Not configured. Add NETLIFY_API_TOKEN and NETLIFY_SITE_ID as environment variables in Netlify.',
    });
  }

  const auth = await verifySanityUser(request);
  if (!auth.ok) return json(401, { error: auth.reason });

  const nf = (path, init) =>
    fetch(`https://api.netlify.com/api/v1${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${NETLIFY_TOKEN}`, ...(init?.headers || {}) },
    });

  const url = new URL(request.url);

  // --- delete one submission -------------------------------------------
  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'Missing submission id' });
    const res = await nf(`/submissions/${id}`, { method: 'DELETE' });
    if (!res.ok) return json(res.status, { error: 'Could not delete that submission' });
    return json(200, { deleted: id });
  }

  // --- list submissions -------------------------------------------------
  const res = await nf(`/sites/${SITE_ID}/submissions?per_page=200`);
  if (!res.ok) return json(res.status, { error: 'Could not read submissions from Netlify' });

  const raw = await res.json();
  const submissions = raw.map((s) => ({
    id: s.id,
    date: s.created_at,
    name: s.data?.name || s.name || '',
    company: s.data?.company || '',
    email: s.data?.email || s.email || '',
    phone: s.data?.phone || '',
    substrate: s.data?.substrate || '',
    message: s.data?.message || '',
  }));

  return json(200, { submissions });
}

export const config = { path: '/api/enquiries' };
