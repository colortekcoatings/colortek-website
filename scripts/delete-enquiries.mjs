/**
 * Removes every enquiry document from Sanity.
 *
 * Enquiries were briefly copied into Sanity so they could be read in the admin
 * panel. Sanity's free plan only allows PUBLIC datasets, which made those
 * records — names, emails, phone numbers — readable by anyone who knew the
 * project ID, and that ID appears in every image URL on the site.
 *
 * Enquiries now live in Netlify only: emailed on arrival and searchable in the
 * Netlify dashboard, both of which are private.
 *
 *   node --env-file=.env scripts/delete-enquiries.mjs
 */
import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error('\n  Missing SANITY_WRITE_TOKEN. Run with:\n    node --env-file=.env scripts/delete-enquiries.mjs\n');
  process.exit(1);
}

const client = createClient({
  projectId: '5ih96glo', dataset: 'production',
  apiVersion: '2024-01-01', token, useCdn: false,
});

const ids = await client.fetch(`*[_type == "enquiry"]._id`);
if (!ids.length) {
  console.log('\n  No enquiry documents found — nothing to delete.\n');
  process.exit(0);
}

const tx = client.transaction();
for (const id of ids) {
  tx.delete(id);
  tx.delete(`drafts.${id}`);
}
await tx.commit();

const left = await client.fetch(`count(*[_type == "enquiry"])`);
console.log(`\n  Deleted ${ids.length} enquiry document(s). Remaining: ${left}\n`);
