import { sanityClient } from 'sanity:client';

/**
 * Contact details from Site settings, for pages that show them in their own
 * content (closing buttons, the home contact band, structured data). Base.astro
 * covers the header and footer. Fallbacks are the values at launch, so a
 * missing field never renders an empty link.
 */
export async function getContact() {
  const s = await sanityClient.fetch(
    `*[_id == "siteSettings"][0]{ phone, phoneLink, email, whatsappNumber }`
  );
  const waNumber = s?.whatsappNumber || '919819362380';
  return {
    phone: s?.phone || '+91 98193 62380',
    phoneLink: s?.phoneLink || '+919819362380',
    email: s?.email || 'info@colortek.in',
    wa: (text) => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`,
  };
}
