// Code node "Clean & Dedupe Leads" (Run Once for All Items)
// Flattens the Outscraper response, normalises fields, drops leads already in
// the Leads Log sheet, and treats social/directory links as "no website".
const NOT_A_WEBSITE = [
  'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
  'youtube.com', 'wa.me', 'whatsapp.com', 'linktr.ee', 'justdial.com',
  'practo.com', 'sulekha.com', 'indiamart.com', 'google.com', 'goo.gl',
  'business.site', 'g.page', 'lybrate.com', 'clinicspots.com',
];

function toDomain(url) {
  if (!url) return '';
  const m = String(url).trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .match(/^([a-z0-9.-]+\.[a-z]{2,})/);
  return m ? m[1] : '';
}

function isRealSite(domain) {
  return domain && !NOT_A_WEBSITE.some(d => domain === d || domain.endsWith('.' + d));
}

const logRows = $('Read Leads Log').all().map(i => i.json);
const seenPlaces = new Set(logRows.map(r => r.place_id).filter(Boolean));
const seenDomains = new Set(logRows.map(r => r.domain).filter(Boolean));

const raw = $('Search Google Maps').first().json.data || [];
const places = raw.flat();

const out = [];
const batchDomains = new Set();
for (const p of places) {
  if (!p || !p.name) continue;
  if (p.business_status && p.business_status !== 'OPERATIONAL') continue;
  const placeId = p.place_id || p.google_id || '';
  if (placeId && seenPlaces.has(placeId)) continue;

  let website = (p.site || p.website || '').trim();
  let domain = toDomain(website);
  let note = '';
  if (website && !isRealSite(domain)) {
    note = `listed link is not a real website (${domain})`;
    website = '';
    domain = '';
  }
  if (domain) {
    if (seenDomains.has(domain) || batchDomains.has(domain)) continue;
    batchDomains.add(domain);
    if (!/^https?:\/\//i.test(website)) website = 'https://' + website;
  }

  out.push({
    json: {
      business_name: p.name,
      website,
      domain,
      phone: p.phone || '',
      address: p.full_address || p.address || '',
      rating: p.rating ?? '',
      reviews: p.reviews ?? '',
      place_id: placeId,
      note,
    },
  });
}
return out;
