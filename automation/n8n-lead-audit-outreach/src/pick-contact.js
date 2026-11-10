// Code node "Pick Decision Maker" (Run Once for Each Item)
// Chooses the best email from the Hunter.io domain search: an owner/founder/
// doctor first, then any senior person, then a generic inbox like info@.
const lead = $('Extract Speed Metrics').item.json;
const emails = ($json.data && $json.data.emails) || [];

const TITLE = /(founder|co-?founder|ceo|owner|proprietor|director|managing|partner|chief|principal|doctor|\bdr\b|dentist|surgeon|md\b)/i;
const usable = emails.filter(e => e.value && (!e.verification || e.verification.status !== 'invalid'));
const rank = e =>
  (TITLE.test(e.position || '') ? 100 : 0) +
  (e.seniority === 'executive' ? 50 : 0) +
  (e.type === 'personal' ? 20 : 0) +
  (e.verification && e.verification.status === 'valid' ? 10 : 0) +
  (e.confidence || 0) / 10;
usable.sort((a, b) => rank(b) - rank(a));
const best = usable[0];

// Suggest a call day two working days from now ("Thursday", "Monday", ...)
const d = new Date();
let added = 0;
while (added < 2) {
  d.setDate(d.getDate() + 1);
  if (d.getDay() !== 0 && d.getDay() !== 6) added++;
}
const callDay = d.toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' });

if (!best) {
  const err = $json.error ? ` (${$json.error.message || 'Hunter error'})` : '';
  return { json: { ...lead, status: 'no_email', note: ('no email found on ' + lead.domain + err).slice(0, 200) } };
}

const first = (best.first_name || '').trim();
return {
  json: {
    ...lead,
    email: best.value,
    first_name: first,
    greeting_name: first || 'there',
    contact_name: [best.first_name, best.last_name].filter(Boolean).join(' '),
    email_position: best.position || (best.type === 'generic' ? 'generic inbox' : ''),
    call_day: callDay,
    status: 'ready',
  },
};
