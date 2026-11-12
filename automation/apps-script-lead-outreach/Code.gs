/**
 * Astra Nexora: free lead audit & outreach (Google Apps Script)
 *
 * Runs inside a Google Sheet, on Google's servers, at no cost:
 *   1. findLeads()   once a weekday: Google Places search → "Leads" tab
 *   2. processNext() every 10 min, 10:00–18:00: PageSpeed mobile audit →
 *      find an email on the clinic's own website → Gmail draft or send
 *
 * Setup: see README.md. Then run setup() once.
 */

const CONFIG = {
  // Google Cloud API key with "PageSpeed Insights API" enabled. Needs NO billing / card.
  GOOGLE_API_KEY: 'PASTE_YOUR_API_KEY_HERE',

  // Where new leads come from, every weekday at ~9 AM:
  //   'osm'    = OpenStreetMap: free, no key, no card. One city per day, in rotation.
  //   'places' = Google Places: best data, but needs a billing account (card).
  //   'manual' = you paste business_name + website into the Leads tab yourself.
  // Rows you paste by hand are always processed too, whatever the source.
  LEAD_SOURCE: 'osm',

  // OpenStreetMap: what to look for, and where. bbox = south,west,north,east.
  // What kinds of business to look for. Each search only keeps businesses that list a website,
  // so every lead can be audited and emailed. `one`/`many`/`who` fill in the email wording.
  // Remove a line to stop targeting that industry. Big chains (OSM "brand" tag) are skipped.
  TARGETS: [
    { key: 'dental', tags: ['amenity=dentist', 'healthcare=dentist'], one: 'dental clinic', many: 'dental clinics', who: 'patients', greeting: 'Hi Doctor' },
    { key: 'clinic', tags: ['amenity=clinic', 'amenity=doctors', 'healthcare=clinic'], one: 'clinic', many: 'clinics', who: 'patients', greeting: 'Hi Doctor' },
    { key: 'hotel', tags: ['tourism=hotel', 'tourism=guest_house'], one: 'hotel', many: 'hotels', who: 'guests', greeting: 'Hello' },
    { key: 'restaurant', tags: ['amenity=restaurant', 'amenity=cafe'], one: 'restaurant', many: 'restaurants', who: 'customers', greeting: 'Hello' },
    { key: 'school', tags: ['amenity=school', 'amenity=college', 'amenity=kindergarten'], one: 'school', many: 'schools', who: 'parents', greeting: 'Hello' },
    { key: 'gym', tags: ['leisure=fitness_centre', 'leisure=sports_centre'], one: 'gym', many: 'gyms', who: 'members', greeting: 'Hello' },
    { key: 'salon', tags: ['shop=beauty', 'shop=hairdresser'], one: 'salon', many: 'salons', who: 'customers', greeting: 'Hello' },
    { key: 'shop', tags: ['shop'], one: 'store', many: 'stores', who: 'customers', greeting: 'Hello' },
    { key: 'office', tags: ['office'], one: 'business', many: 'businesses', who: 'customers', greeting: 'Hello' },
  ],
  DEFAULT_CATEGORY: 'dental',  // used for leads that have no category (older rows, pasted rows)
  OSM_WEBSITE_ONLY: true,      // true = skip businesses without a website (they can't be emailed)
  OSM_CITIES: [
    { name: 'Chennai', bbox: '12.80,80.05,13.25,80.35' },
    { name: 'Coimbatore', bbox: '10.90,76.85,11.15,77.10' },
    { name: 'Madurai', bbox: '9.85,78.03,10.00,78.20' },
    { name: 'Tiruchirappalli', bbox: '10.70,78.60,10.90,78.80' },
    { name: 'Salem', bbox: '11.58,78.07,11.73,78.23' },
    { name: 'Puducherry', bbox: '11.87,79.76,11.99,79.86' },
    { name: 'Vellore', bbox: '12.87,79.07,12.99,79.19' },
    { name: 'Tirunelveli', bbox: '8.66,77.65,8.78,77.78' },
    { name: 'Erode', bbox: '11.30,77.66,11.39,77.77' },
    { name: 'Thanjavur', bbox: '10.74,79.08,10.83,79.18' },
    { name: 'Bengaluru', bbox: '12.85,77.48,13.08,77.75' },
    { name: 'Hyderabad', bbox: '17.30,78.35,17.50,78.60' },
    { name: 'Kochi', bbox: '9.90,76.22,10.07,76.36' },
  ],

  // Google Places only: one area is searched per day, in rotation.
  BUSINESS_TYPE: 'Dental clinic',
  AREAS: [
    'T. Nagar, Chennai', 'Adyar, Chennai', 'Anna Nagar, Chennai', 'Velachery, Chennai',
    'Mylapore, Chennai', 'Tambaram, Chennai', 'Porur, Chennai', 'Nungambakkam, Chennai',
    'Kodambakkam, Chennai', 'Ashok Nagar, Chennai', 'Chromepet, Chennai', 'OMR, Chennai',
    'Perambur, Chennai', 'Vadapalani, Chennai', 'Besant Nagar, Chennai', 'Guindy, Chennai',
  ],
  CITY_FOR_EMAIL: 'Chennai',   // used when a lead has no city (e.g. pasted by hand)
  AGENCY_LOCATION: 'Chennai',  // where Astra Nexora is, shown in your signature

  EMAILS_PER_DAY: 20,        // hard cap; consumer Gmail allows 100 recipients/day
  SPEED_THRESHOLD_S: 3,      // only email sites slower than this (Speed Index, mobile)
  SEND_MODE: 'draft',        // 'draft' = Gmail drafts for you to review. Change to 'send' when happy.
  WORK_HOURS: [10, 18],      // IST; emails only go out inside these hours, Mon–Fri
  GREETING: 'Hi Doctor',     // the website rarely shows the owner's name, so keep it general
  FOLLOWUP_AFTER_DAYS: 3,    // one short follow-up if they haven't replied; 0 = never
  SIGNATURE_PHONE: '',       // optional, e.g. '+91 98xxx xxxxx'; shown under your name
  APP_URL: '',               // optional separate phone app with push alerts (see astra-leads-app); '' = not used
  ACCESS_KEY: '',            // optional fixed private key for the app link (else one is generated)
  WEB_APP_URL: '',           // paste the "Web app URL" (ends in /exec) from Deploy → New deployment
  WHATSAPP_LINKS: false,     // true = also make one-click wa.me links in the sheet
  WEBSITE_PITCH: true,       // clinics with NO website: email a "let me build your website" pitch (if they have an email)

  SENDER_NAME: 'S. Saktheeswaran',
  SENDER_EMAIL: 'astranexora.connect@gmail.com',  // emails only go out when the script runs as this account
  AGENCY_SITE: 'https://astranexora.netlify.app',
  PERSONAL_SITE: 'https://saktheeswaran.netlify.app',
  // Proof of past work, linked in every email. Set to '' to leave it out.
  PORTFOLIO_URL: 'https://saktheeswaran.netlify.app/#work',
  CASE_STUDY_NAME: '',       // optional: a client to mention by name (only with their OK)
  CASE_STUDY_URL: '',
};

const SHEET = 'Leads';
const COLS = ['added_on', 'status', 'business_name', 'website', 'domain', 'phone', 'address',
  'rating', 'place_id', 'speed_index', 'perf_score', 'lcp', 'email', 'email_found_on',
  'contacted_on', 'note', 'city', 'top_fixes', 'thread_ids', 'followup_on', 'pitch', 'whatsapp', 'wa_sent_on',
  'sent_text', 'reply_text', 'replied_on', 'answered_on', 'category'];
// pitch: 'speed' (has a slow website) | 'website' (no website: offer to build one)
// whatsapp: one-click wa.me link with the message already typed, for you to send by hand
// status: (empty = just pasted) | new | duplicate | no_website | fast | audit_failed | no_email | drafted | sent |
//         followed_up | replied (set automatically when they answer) | bounced | opted_out |
//         call_booked | won | lost (set by you, from the phone dashboard or by typing)

const NOT_A_WEBSITE = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
  'youtube.com', 'wa.me', 'whatsapp.com', 'linktr.ee', 'justdial.com', 'practo.com', 'sulekha.com',
  'indiamart.com', 'google.com', 'goo.gl', 'business.site', 'g.page', 'lybrate.com', 'clinicspots.com'];
const FREE_MAIL = ['gmail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
  'rediffmail.com', 'live.com', 'icloud.com', 'zoho.com', 'zohomail.in'];

// ───────────────────────────── setup & menu ─────────────────────────────

function setup() {
  if (!CONFIG.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY.indexOf('PASTE') === 0) {
    throw new Error('Paste your Google API key into CONFIG.GOOGLE_API_KEY first.');
  }
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('Asia/Kolkata');
  let sh = ss.getSheetByName(SHEET);
  if (!sh) sh = ss.insertSheet(SHEET);
  sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold');
  sh.setFrozenRows(1);

  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  if (CONFIG.LEAD_SOURCE !== 'manual') ScriptApp.newTrigger('findLeads').timeBased().everyDays(1).atHour(9).create();
  ScriptApp.newTrigger('processNext').timeBased().everyMinutes(10).create();
  appToken_();
  ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(18).nearMinute(30).create();
  // toast, not alert: an alert blocks until someone clicks OK in the sheet and
  // the run times out when setup is started from the script editor.
  const msg = 'Setup done. ' + (CONFIG.LEAD_SOURCE !== 'manual' ? 'Leads (' + CONFIG.LEAD_SOURCE + ') are searched daily around 9 AM; ' :
    'Paste leads (business_name + website) into the Leads tab; ') +
    'emails go out every 10 min between ' + CONFIG.WORK_HOURS.join(':00–') + ':00, Mon–Fri. ' +
    'Mode: ' + CONFIG.SEND_MODE.toUpperCase();
  ss.toast(msg, 'Astra Outreach', 15);
  console.log(msg);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Astra Outreach')
    .addItem('Find leads now', 'findLeadsNow')
    .addItem('Process next lead now', 'processNextNow')
    .addItem('Fill WhatsApp links', 'fillWhatsAppLinks')
    .addSeparator()
    .addItem('Setup / reset triggers', 'setup')
    .addToUi();
}
function findLeadsNow() {
  if (CONFIG.LEAD_SOURCE === 'manual') {
    SpreadsheetApp.getUi().alert('LEAD_SOURCE is manual. Paste leads into the Leads tab: business_name in column C, website in column D. Leave status empty.');
    return;
  }
  findLeads(true);
}
function processNextNow() { processNext(true); }

// ───────────────────────────── 1. find leads ─────────────────────────────

function findLeads(manual) {
  if (!manual && isWeekend_()) return;
  if (CONFIG.LEAD_SOURCE === 'manual') return;
  // Use up the leads already in the sheet first. Search again only when fewer than
  // one day's worth of unprocessed leads is left, so the daily emails never run dry.
  if (!manual) {
    const pending = readRows_(sheet_()).filter(r => r.status === 'new' || (!r.status && (r.business_name || r.website))).length;
    if (pending >= CONFIG.EMAILS_PER_DAY) { log_('Find leads skipped: ' + pending + ' leads still waiting'); return; }
  }
  const props = PropertiesService.getScriptProperties();
  const idx = Number(props.getProperty('areaIndex') || 0);

  const want = CONFIG.EMAILS_PER_DAY * 2;
  const started = Date.now();
  let added = 0, found = 0, tried = 0, i = idx;
  const labels = [];
  if (CONFIG.LEAD_SOURCE === 'places') {
    const area = CONFIG.AREAS[idx % CONFIG.AREAS.length];
    const res = searchPlaces_(CONFIG.BUSINESS_TYPE + ' in ' + area)
      .filter(p => !p.businessStatus || p.businessStatus === 'OPERATIONAL')
      .map(p => ({ id: p.id, name: (p.displayName && p.displayName.text) || '', website: p.websiteUri || '',
        phone: p.nationalPhoneNumber || '', address: p.formattedAddress || '', rating: p.rating || '',
        email: '', city: area.split(',').pop().trim(), category: CONFIG.DEFAULT_CATEGORY }));
    found = res.length; added = addLeads_(res, 'source: ' + area); labels.push(area); i = idx + 1;
  } else {
    // keep going through the city list until there are enough new leads, the list is done, or ~4 min pass
    while (added < want && tried < CONFIG.OSM_CITIES.length && Date.now() - started < 4 * 60 * 1000) {
      const city = CONFIG.OSM_CITIES[i % CONFIG.OSM_CITIES.length];
      let res = [];
      try { res = osmToLeads(searchOsm_(city.bbox).elements || [], city.name, CONFIG.TARGETS); }
      catch (e) { log_('Search failed for ' + city.name + ': ' + e.message); }
      if (CONFIG.OSM_WEBSITE_ONLY) res = res.filter(l => l.website);
      const n = addLeads_(res, 'source: ' + city.name + ' (OpenStreetMap)');
      found += res.length; added += n; tried++; i++;
      labels.push(city.name + ' ' + n);
    }
  }
  props.setProperty('areaIndex', String(i));
  const label = labels.join(', ');
  const msg = 'Find leads: ' + label + ' → ' + found + ' found, ' + added + ' new';
  props.setProperty('lastFind', Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm') + ' · ' + label + ' (' + added + ' new)');
  log_(msg);
  if (manual) { try { SpreadsheetApp.getActive().toast(msg, 'Astra Outreach', 10); } catch (e) {} }
}

/** Appends leads that aren't in the sheet yet (by place id or website domain). Returns how many. */
function addLeads_(leads, note) {
  const sh = sheet_();
  const rows = readRows_(sh);
  const arch = archivedKeys_();
  const seenPlaces = new Set(rows.map(r => r.place_id).filter(String).concat(arch.places));
  const seenDomains = new Set(rows.map(r => r.domain).filter(String).concat(arch.domains));
  const now = today_();
  const add = [];
  leads.forEach(p => {
    if (!p.id || !p.name || seenPlaces.has(p.id)) return;
    let website = String(p.website || '').trim();
    let domain = toDomain(website);
    let n = note;
    if (website && !isRealSite(domain)) { n += '; listed link is ' + domain; website = ''; domain = ''; }
    if (domain && seenDomains.has(domain)) return;
    if (domain) { seenDomains.add(domain); if (!/^https?:\/\//i.test(website)) website = 'https://' + website; }
    seenPlaces.add(p.id);
    add.push(rowFrom_({
      added_on: now, status: domain ? 'new' : 'no_website', business_name: p.name,
      website, domain, phone: p.phone, address: p.address, rating: p.rating, place_id: p.id,
      email: p.email, email_found_on: p.email ? 'OpenStreetMap' : '', note: n, city: p.city, category: p.category || '',
    }));
  });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, COLS.length).setValues(add);
  return add.length;
}

function searchOsm_(bbox) {
  const parts = [];
  CONFIG.TARGETS.forEach(t => t.tags.forEach(tag => {
    const kv = tag.split('=');
    const sel = kv.length > 1 ? '["' + kv[0] + '"="' + kv[1] + '"]' : '["' + kv[0] + '"]';
    const sites = CONFIG.OSM_WEBSITE_ONLY ? ['["website"]', '["contact:website"]'] : [''];
    sites.forEach(w => parts.push('nwr' + sel + w + '["name"](' + bbox + ');'));
  }));
  const query = '[out:json][timeout:50];(' + parts.join('') + ');out tags center;';
  const mirrors = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter'];
  const errors = [];
  for (const url of mirrors) {
    try {
      const res = UrlFetchApp.fetch(url, { method: 'post', payload: { data: query }, muteHttpExceptions: true,
        headers: { Accept: 'application/json' } });
      if (res.getResponseCode() === 200) return JSON.parse(res.getContentText());
      errors.push(url + ' ' + res.getResponseCode());
    } catch (e) { errors.push(url + ' ' + e.message); }
  }
  throw new Error('OpenStreetMap search failed: ' + errors.join(' | '));
}

function searchPlaces_(query) {
  const fields = ['places.id', 'places.displayName', 'places.formattedAddress', 'places.websiteUri',
    'places.nationalPhoneNumber', 'places.businessStatus', 'places.rating', 'nextPageToken'].join(',');
  const out = [];
  let pageToken = '';
  for (let page = 0; page < 3; page++) {
    const body = { textQuery: query, pageSize: 20, languageCode: 'en', regionCode: 'IN' };
    if (pageToken) body.pageToken = pageToken;
    const res = UrlFetchApp.fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'post', contentType: 'application/json', payload: JSON.stringify(body),
      headers: { 'X-Goog-Api-Key': CONFIG.GOOGLE_API_KEY, 'X-Goog-FieldMask': fields },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() !== 200) throw new Error('Places API ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
    const json = JSON.parse(res.getContentText());
    (json.places || []).forEach(p => out.push(p));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
    Utilities.sleep(2000);
  }
  return out;
}

// ─────────────────────────── 2. audit & contact ───────────────────────────

function processNext(manual) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const started = Date.now();
    PropertiesService.getScriptProperties().setProperty('lastRun', Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'));
    const sh = sheet_();
    const rows = readRows_(sh);
    const today = today_();
    checkReplies_(sh, rows);   // every 10 minutes, evenings and weekends too
    if (!manual && (isWeekend_() || !inWorkHours_())) return;
    const doneToday = rows.filter(r => String(r.contacted_on).indexOf(today) === 0 ||
      String(r.followup_on).indexOf(today) === 0).length;
    if (doneToday >= CONFIG.EMAILS_PER_DAY) return;
    if (CONFIG.SEND_MODE === 'send' && MailApp.getRemainingDailyQuota() < 1) return;
    if (sendOneFollowup_(sh, rows)) return;   // follow-ups first, one email per run
    prepareManualRows_(sh, rows);
    const contacted = new Set(rows.filter(r => r.email && ['sent', 'drafted', 'followed_up', 'opted_out', 'replied', 'bounced'].indexOf(r.status) >= 0)
      .map(r => String(r.email).toLowerCase()));

    // Work through leads until one email goes out or ~4 min pass (limit is 6).
    for (const r of rows) {
      if (Date.now() - started > 4 * 60 * 1000) break;
      let contactedNow = false;
      if (r.status === 'new') contactedNow = handleLead_(r, contacted);
      else if (r.status === 'no_website' && !r.pitch && CONFIG.WEBSITE_PITCH) contactedNow = handleNoSite_(r, contacted);
      else continue;
      writeRow_(sh, r);
      if (contactedNow) break;
    }
  } finally {
    lock.releaseLock();
  }
}

/** Rows you pasted by hand (empty status) become 'new' / 'no_website', deduped by domain. */
function prepareManualRows_(sh, rows) {
  const seen = new Set(rows.filter(r => r.status && r.domain).map(r => r.domain));
  rows.forEach(r => {
    if (r.status || !(r.business_name || r.website)) return;
    let domain = toDomain(r.website);
    if (domain && !isRealSite(domain)) { r.note = appendNote_(r.note, 'listed link is ' + domain); domain = ''; r.website = ''; }
    r.domain = domain;
    if (domain && !/^https?:\/\//i.test(r.website)) r.website = 'https://' + r.website.trim();
    r.added_on = r.added_on || today_();
    if (!domain) r.status = 'no_website';
    else if (seen.has(domain)) { r.status = 'duplicate'; }
    else { r.status = 'new'; seen.add(domain); }
    writeRow_(sh, r);
  });
}

/** Returns true if an email was sent or drafted. Mutates r. */
function handleLead_(r, contacted) {
  const audit = pageSpeed_(r.website);
  if (audit.error) { r.status = 'audit_failed'; r.note = appendNote_(r.note, audit.error); return false; }
  r.speed_index = audit.speedIndex; r.perf_score = audit.score; r.lcp = audit.lcp;
  r.top_fixes = (audit.fixes || []).join(' | ');
  if (audit.speedIndexS <= CONFIG.SPEED_THRESHOLD_S) { r.status = 'fast'; return false; }

  let found = findEmailOnSite_(r.website, r.domain);
  // fall back to an email that came with the lead (e.g. listed on OpenStreetMap)
  if (!found && r.email && /@/.test(r.email)) found = { email: r.email.trim(), page: r.email_found_on || 'lead source' };
  if (!found) { r.status = 'no_email'; return false; }
  if (contacted.has(found.email.toLowerCase())) { r.status = 'no_email'; r.note = appendNote_(r.note, 'email already contacted via another listing'); return false; }
  r.email = found.email; r.email_found_on = found.page;

  r.pitch = 'speed';
  deliver_(r, buildEmail_(r), contacted);
  return true;
}

/** Clinic without a website: pitch building one, if we have an email for them. */
function handleNoSite_(r, contacted) {
  r.pitch = 'website';
  if (CONFIG.WHATSAPP_LINKS) r.whatsapp = r.whatsapp || whatsappLink(r.phone, whatsappText(r, CONFIG));
  const email = String(r.email || '').trim();
  if (!/@/.test(email) || contacted.has(email.toLowerCase())) return false;  // phone / WhatsApp only
  const m = websitePitchCopy(r, CONFIG);
  deliver_(r, { subject: m.subject, html: m.html, text: htmlToText(m.html) }, contacted);
  return true;
}

/** Stops sending if the script is running under a different Google account. */
function checkSender_() {
  if (!CONFIG.SENDER_EMAIL) return;
  const me = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  if (me && me !== CONFIG.SENDER_EMAIL.toLowerCase()) {
    throw new Error('This script is running as ' + me + ', not ' + CONFIG.SENDER_EMAIL + '. No email was sent. ' +
      'Open the Apps Script project while signed in as ' + CONFIG.SENDER_EMAIL + ' and run setup again.');
  }
}

function deliver_(r, mail, contacted) {
  checkSender_();
  const draft = GmailApp.createDraft(r.email, mail.subject, mail.text, { htmlBody: mail.html, name: CONFIG.SENDER_NAME });
  if (CONFIG.SEND_MODE === 'send') {
    const msg = draft.send();
    r.thread_ids = msg.getThread().getId();
    r.status = 'sent';
  } else {
    r.status = 'drafted';
  }
  r.contacted_on = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
  r.sent_text = String(mail.text).slice(0, 3000);
  if (CONFIG.WHATSAPP_LINKS) r.whatsapp = whatsappLink(r.phone, whatsappText(r, CONFIG));
  contacted.add(String(r.email).toLowerCase());
}

/** One-off: move leads nobody can be emailed about (no website and no email) to an "Archive" tab.
 *  Nothing is deleted. Archived businesses are never added again by later searches. */
function archiveUncontactable() {
  const ss = SpreadsheetApp.getActive();
  const sh = sheet_();
  const rows = readRows_(sh);
  const dead = r => r.status === 'no_website' && !/@/.test(r.email || '');
  const go = rows.filter(dead), keep = rows.filter(r => !dead(r));
  if (!go.length) { log_('Nothing to archive.'); return 0; }
  let ar = ss.getSheetByName('Archive');
  if (!ar) { ar = ss.insertSheet('Archive'); ar.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold'); ar.setFrozenRows(1); }
  ar.getRange(ar.getLastRow() + 1, 1, go.length, COLS.length).setValues(go.map(rowFrom_));
  sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), COLS.length).clearContent();
  if (keep.length) sh.getRange(2, 1, keep.length, COLS.length).setValues(keep.map(rowFrom_));
  const msg = 'Archived ' + go.length + ' leads with no website and no email. ' + keep.length + ' leads kept.';
  log_(msg);
  try { ss.toast(msg, 'Astra Outreach', 10); } catch (e) {}
  return go.length;
}

/** place_ids and domains already in the Archive tab, so searches don't add them again. */
function archivedKeys_() {
  const ar = SpreadsheetApp.getActive().getSheetByName('Archive');
  if (!ar || ar.getLastRow() < 2) return { places: [], domains: [] };
  const v = ar.getRange(2, 1, ar.getLastRow() - 1, COLS.length).getValues();
  const pi = COLS.indexOf('place_id'), di = COLS.indexOf('domain');
  return { places: v.map(x => String(x[pi])).filter(Boolean), domains: v.map(x => String(x[di])).filter(Boolean) };
}

/** One-off: add WhatsApp links to rows that have a phone number but no link yet. */
function fillWhatsAppLinks() {
  const sh = sheet_();
  let n = 0;
  readRows_(sh).forEach(r => {
    if (r.whatsapp || !r.phone) return;
    if (['no_website', 'sent', 'followed_up', 'drafted'].indexOf(r.status) < 0) return;
    if (r.status === 'no_website') r.pitch = r.pitch || 'website';
    const link = whatsappLink(r.phone, whatsappText(r, CONFIG));
    if (!link) return;
    r.whatsapp = link; writeRow_(sh, r); n++;
  });
  log_('WhatsApp links added: ' + n);
  try { SpreadsheetApp.getActive().toast('WhatsApp links added: ' + n, 'Astra Outreach', 10); } catch (e) {}
}

function pageSpeed_(url) {
  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=PERFORMANCE&strategy=MOBILE' +
    '&url=' + encodeURIComponent(url) + '&key=' + encodeURIComponent(CONFIG.GOOGLE_API_KEY);
  let res;
  try { res = UrlFetchApp.fetch(api, { muteHttpExceptions: true }); }
  catch (e) { return { error: 'PageSpeed timeout/error: ' + e.message }; }
  if (res.getResponseCode() !== 200) return { error: 'PageSpeed ' + res.getResponseCode() };
  return parsePageSpeed(JSON.parse(res.getContentText()));
}

function findEmailOnSite_(website, domain) {
  const base = website.replace(/\/+$/, '').replace(/^(https?:\/\/[^/]+).*$/, '$1');
  const pages = [website, base + '/contact', base + '/contact-us', base + '/contactus', base + '/about', base + '/about-us'];
  const tried = new Set();
  for (const page of pages) {
    if (tried.has(page)) continue;
    tried.add(page);
    let html;
    try {
      const res = UrlFetchApp.fetch(page, { muteHttpExceptions: true, followRedirects: true,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; site-audit)' } });
      if (res.getResponseCode() !== 200) continue;
      html = res.getContentText();
    } catch (e) { continue; }
    const email = pickEmail(extractEmails(html), domain);
    if (email) return { email, page };
  }
  return null;
}

function buildEmail_(r) {
  const m = emailCopy(r, CONFIG);
  return { subject: m.subject, html: m.html, text: htmlToText(m.html) };
}

/** Short, patient-focused first email. Pure, so it can be unit-tested. */
function emailCopy(r, cfg) {
  const name = r.business_name || r.domain;
  const secs = String(r.speed_index || '').replace(/\s*s$/, '');
  const report = 'https://pagespeed.web.dev/analysis?url=' + encodeURIComponent(r.website) + '&form_factor=mobile';
  const fixes = String(r.top_fixes || '').split(' | ').filter(Boolean).length;
  const subject = 'Question about ' + name + "'s website";
  const T = targetOf(r, cfg);
  const html =
    '<p>' + esc_(T.greeting) + ',</p>' +
    "<p>I ran " + esc_(name) + "'s website through Google's mobile speed test today. On a typical phone connection, " +
    'it takes about <b>' + esc_(secs) + ' seconds</b> before the page shows up.</p>' +
    '<p>Most ' + esc_(T.who) + ' search for a ' + esc_(T.one) + ' near them on their phone and tap the first two or three results. ' +
    "Google's own research found that more than half of mobile visitors leave if a page takes over 3 seconds, " +
    'so some of those ' + esc_(T.who) + ' go straight back and pick the next ' + esc_(T.one) + '.</p>' +
    '<p>You can see the result yourself here: <a href="' + report + '">Google PageSpeed report for ' + esc_(r.domain) + '</a></p>' +
    (cfg.CASE_STUDY_URL ? '<p>I built the website and SEO for <a href="' + cfg.CASE_STUDY_URL + '">' + esc_(cfg.CASE_STUDY_NAME) +
      '</a>, a dental clinic in Chennai' + (cfg.PORTFOLIO_URL ? ', and you can see my other projects <a href="' +
      cfg.PORTFOLIO_URL + '">here</a>' : '') + '.</p>'
      : cfg.PORTFOLIO_URL ? '<p>You can see my projects <a href="' + cfg.PORTFOLIO_URL + '">here</a>' +
        (cfg.PERSONAL_SITE ? ', and my full profile on <a href="' + cfg.PERSONAL_SITE + '">my portfolio</a>' : '') + '.</p>' : '') +
    '<p>I\'ve noted ' + (fixes >= 2 ? '2 simple fixes' : 'a simple fix') + ' for your site. ' +
    'Shall I send ' + (fixes >= 2 ? 'them' : 'it') + ' over? It\'s free. Just reply "yes".</p>' +
    '<p>' + esc_(cfg.SENDER_NAME) + '<br>Astra Nexora, ' + esc_(cfg.AGENCY_LOCATION) +
    (cfg.SIGNATURE_PHONE ? '<br>' + esc_(cfg.SIGNATURE_PHONE) : '') + '<br>' +
    cfg.AGENCY_SITE.replace(/^https?:\/\//, '') + '</p>' +
    '<p style="color:#888;font-size:12px">P.S. If this isn\'t relevant, reply "no" and I won\'t email again.</p>';
  return { subject, html };
}

function followupCopy(r, cfg) {
  const name = r.business_name || r.domain;
  const greet = targetOf(r, cfg).greeting;
  if (r.pitch === 'website') {
    return { subject: 'Re: A website for ' + name, html:
      '<p>' + esc_(greet) + ',</p>' +
      '<p>Just checking you saw my note about a website for ' + esc_(name) + '. I\'m happy to put together a free ' +
      'sample design so you can see how it would look. Reply "yes" and I\'ll send it.</p>' +
      '<p>' + esc_(cfg.SENDER_NAME) + '<br>Astra Nexora' +
      (cfg.PORTFOLIO_URL ? '<br>Projects: ' + cfg.PORTFOLIO_URL.replace(/^https?:\/\//, '') : '') +
      (cfg.PERSONAL_SITE ? '<br>Portfolio: ' + cfg.PERSONAL_SITE.replace(/^https?:\/\//, '') : '') + '</p>' };
  }
  const subject = 'Re: Question about ' + name + "'s website";
  const html =
    '<p>' + esc_(greet) + ',</p>' +
    "<p>Just checking you saw my note about " + esc_(name) + "'s website taking about " +
    esc_(String(r.speed_index || '').replace(/\s*s$/, '')) + ' seconds to show up on mobile.</p>' +
    '<p>The fixes are quick and I\'m happy to share them free. Reply "yes" and I\'ll send them today.</p>' +
    '<p>' + esc_(cfg.SENDER_NAME) + '<br>Astra Nexora' +
    (cfg.PORTFOLIO_URL ? '<br>Projects: ' + cfg.PORTFOLIO_URL.replace(/^https?:\/\//, '') : '') +
    (cfg.PERSONAL_SITE ? '<br>Portfolio: ' + cfg.PERSONAL_SITE.replace(/^https?:\/\//, '') : '') + '</p>';
  return { subject, html };
}

/** First email for a clinic that has no website. */
function websitePitchCopy(r, cfg) {
  const name = r.business_name;
  const city = r.city || cfg.CITY_FOR_EMAIL;
  const subject = 'A website for ' + name;
  const T = targetOf(r, cfg);
  const html =
    '<p>' + esc_(T.greeting) + ',</p>' +
    '<p>I came across ' + esc_(name) + ' while looking at ' + esc_(T.many) + ' in ' + esc_(city) +
    ", and noticed it doesn't have a website yet.</p>" +
    '<p>Most ' + esc_(T.who) + ' now check a ' + esc_(T.one) + ' online before they call or visit. Without a website they only see a name and a ' +
    'phone number, and many choose one they can learn more about: what you offer, photos and reviews.</p>' +
    '<p>I build simple, fast websites for local businesses, with WhatsApp enquiries, Google Maps directions and service pages, ' +
    'so new ' + esc_(T.who) + ' can find and trust you before they call.</p>' +
    (cfg.PORTFOLIO_URL ? '<p>You can see my projects <a href="' + cfg.PORTFOLIO_URL + '">here</a>' +
      (cfg.PERSONAL_SITE ? ', and my full profile on <a href="' + cfg.PERSONAL_SITE + '">my portfolio</a>' : '') + '.</p>' : '') +
    '<p>Shall I put together a free sample design for ' + esc_(name) + '? Just reply "yes".</p>' +
    '<p>' + esc_(cfg.SENDER_NAME) + '<br>Astra Nexora, ' + esc_(cfg.AGENCY_LOCATION) +
    (cfg.SIGNATURE_PHONE ? '<br>' + esc_(cfg.SIGNATURE_PHONE) : '') + '<br>' +
    cfg.AGENCY_SITE.replace(/^https?:\/\//, '') + '</p>' +
    '<p style="color:#888;font-size:12px">P.S. If this isn\'t relevant, reply "no" and I won\'t email again.</p>';
  return { subject, html };
}

/** The WhatsApp message for this lead (you send it yourself from the link). */
function whatsappText(r, cfg) {
  const name = r.business_name || r.domain;
  const who = targetOf(r, cfg).greeting.replace(/^Hi /, 'Hello ') + ', I\'m ' + cfg.SENDER_NAME.replace(/^S\.\s*/, '') + ' from Astra Nexora, ' + cfg.AGENCY_LOCATION + '. ';
  const work = cfg.PORTFOLIO_URL ? ' You can see my work here: ' + cfg.PORTFOLIO_URL : '';
  if (r.pitch === 'website' || !r.website) {
    return who + 'I noticed ' + name + " doesn't have a website yet. I build simple clinic websites with WhatsApp " +
      'booking and Google Maps, so new customers can find and trust you before they call. ' +
      'Shall I share a free sample design for ' + name + '?' + work;
  }
  return who + 'I emailed you about ' + name + "'s website taking about " +
    String(r.speed_index || '').replace(/\s*s$/, '') + ' seconds to load on mobile, which loses customers who search on ' +
    'their phone. I\'ve noted 2 quick fixes. Shall I share them here? It\'s free.' + work;
}

/** wa.me link for an Indian number; '' if the number can't be used. */
function whatsappLink(phone, text) {
  let d = String(phone || '').split(/[;,/]/)[0].replace(/\D/g, '');
  if (d.length === 11 && d[0] === '0') d = d.slice(1);
  if (d.length === 10) d = '91' + d;
  if (!(d.length === 12 && d.indexOf('91') === 0)) return '';
  if (!/^91[6-9]/.test(d)) return '';   // Indian mobiles start with 6-9; landlines have no WhatsApp
  return 'https://wa.me/' + d + '?text=' + encodeURIComponent(text);
}

function htmlToText(html) {
  return html.replace(/<a href="([^"]+)">([^<]*)<\/a>/g, (m, url, txt) => txt === 'here' ? 'here (' + url + ')' : txt + ' (' + url + ')').replace(/<br>/g, '\n').replace(/<\/p>/g, '\n\n')
    .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').trim();
}

/** Sends at most one follow-up per run. Returns true if one went out. */
function sendOneFollowup_(sh, rows) {
  if (CONFIG.SEND_MODE !== 'send' || !(CONFIG.FOLLOWUP_AFTER_DAYS > 0)) return false;
  const cutoff = Date.now() - CONFIG.FOLLOWUP_AFTER_DAYS * 24 * 3600 * 1000;
  for (const r of rows) {
    if (r.status !== 'sent' || !r.email || !r.contacted_on) continue;
    const sentAt = new Date(String(r.contacted_on).replace(' ', 'T') + ':00+05:30').getTime();
    if (!(sentAt < cutoff)) continue;
    checkSender_();
    const m = followupCopy(r, CONFIG);
    const msg = GmailApp.createDraft(r.email, m.subject, htmlToText(m.html), { htmlBody: m.html, name: CONFIG.SENDER_NAME }).send();
    r.thread_ids = [r.thread_ids, msg.getThread().getId()].filter(Boolean).join(',');
    r.status = 'followed_up';
    r.sent_text = (r.sent_text ? r.sent_text + '\n\n--- follow-up ---\n' : '') + htmlToText(m.html);
    r.followup_on = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
    writeRow_(sh, r);
    return true;
  }
  return false;
}

/** Marks rows 'replied' (or 'bounced'), saves the conversation, and pings your phone.
 *  One Gmail search per run, so it's cheap enough to run every 10 minutes. */
function checkReplies_(sh, rows) {
  const live = ['sent', 'followed_up', 'replied', 'call_booked'];
  const watch = {};
  rows.forEach(r => {
    if (live.indexOf(r.status) < 0 || !r.thread_ids) return;
    String(r.thread_ids).split(',').forEach(id => { if (id) watch[id] = r; });
  });
  if (!Object.keys(watch).length) return;
  const me = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  const fmt = d => Utilities.formatDate(d, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
  const threads = GmailApp.search('newer_than:4d -from:me', 0, 100);
  threads.forEach(t => {
    const r = watch[t.getId()];
    if (!r || live.indexOf(r.status) < 0) return;
    const msgs = t.getMessages();
    const ours = msgs.filter(m => me && m.getFrom().toLowerCase().indexOf(me) >= 0);
    const theirs = msgs.filter(m => ours.indexOf(m) < 0);
    if (!theirs.length) return;
    const last = theirs[theirs.length - 1];
    const when = fmt(last.getDate());
    const seen = [r.replied_on, r.answered_on].filter(Boolean).sort().pop() || '';
    const isNew = (r.status === 'sent' || r.status === 'followed_up') || when > seen;
    if (!isNew || when === r.replied_on) return;
    const bounced = /mailer-daemon|postmaster/i.test(last.getFrom());
    if (r.status === 'sent' || r.status === 'followed_up') r.status = bounced ? 'bounced' : 'replied';
    r.replied_on = when;
    r.reply_text = stripQuoted(last.getPlainBody()).slice(0, 3000);
    if (!r.sent_text && ours.length) r.sent_text = stripQuoted(ours[0].getPlainBody()).slice(0, 3000);
    r.note = appendNote_(r.note, (bounced ? 'bounced ' : 'reply ') + today_());
    writeRow_(sh, r);
    if (!bounced) {
      try {
        const label = GmailApp.getUserLabelByName('Astra Lead Reply') || GmailApp.createLabel('Astra Lead Reply');
        t.addLabel(label); t.markImportant(); t.moveToInbox(); last.star();
      } catch (e) {}
      notify_('Reply from ' + (r.business_name || r.domain), (r.city ? r.city + ' · ' : '') + 'Tap to read it.');
    }
  });
}

/** Send an email from the dashboard: a reply in the same Gmail thread if they've written,
 *  otherwise a new email. Records it on the lead. */
function sendFromDashboard(row, to, subject, body) {
  const sh = sheet_();
  row = Number(row);
  if (!(row >= 2 && row <= sh.getLastRow())) throw new Error('bad row');
  body = String(body || '').trim();
  to = String(to || '').trim();
  if (!body) throw new Error('The message is empty.');
  const hole = body.match(/\[[^\]]{2,40}\]/);
  if (hole) throw new Error('Fill in ' + hole[0] + ' before sending.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('Add a valid email address.');
  checkSender_();
  const r = readRows_(sh).filter(x => x._row === row)[0];
  const me = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  const html = '<div>' + esc_(body).replace(/\n/g, '<br>') + '</div>';
  const opts = { htmlBody: html, name: CONFIG.SENDER_NAME };
  let their = null;
  String(r.thread_ids || '').split(',').filter(Boolean).reverse().some(id => {
    let t; try { t = GmailApp.getThreadById(id); } catch (e) { return false; }
    if (!t) return false;
    const msgs = t.getMessages().filter(m => !(me && m.getFrom().toLowerCase().indexOf(me) >= 0));
    if (msgs.length) { their = msgs[msgs.length - 1]; return true; }
    return false;
  });
  const now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
  if (their && (!r.email || to.toLowerCase() === String(r.email).toLowerCase())) {
    their.reply(body, opts);
  } else {
    const subj = String(subject || '').trim() || ('About ' + (r.business_name || r.domain) + "'s website");
    const msg = GmailApp.createDraft(to, subj, body, opts).send();
    r.thread_ids = [r.thread_ids, msg.getThread().getId()].filter(Boolean).join(',');
    if (['', 'new', 'no_website', 'no_email', 'fast', 'audit_failed', 'duplicate'].indexOf(r.status) >= 0) {
      r.status = 'sent'; r.contacted_on = r.contacted_on || now; r.pitch = r.pitch || (r.website ? 'speed' : 'website');
    }
  }
  r.email = r.email || to;
  r.sent_text = ((r.sent_text ? r.sent_text + '\n\n' : '') + '--- You · ' + now + ' ---\n' + body).slice(-6000);
  r.answered_on = now;
  writeRow_(sh, r);
  return { ok: true, at: now };
}

/** Private pairing token shared by this script and your phone app. */
function appToken_() {
  if (CONFIG.ACCESS_KEY) return CONFIG.ACCESS_KEY;
  const props = PropertiesService.getScriptProperties();
  let t = props.getProperty('appToken');
  if (!t) { t = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''); props.setProperty('appToken', t); }
  return t;
}

/** Push alert to the Astra Leads app on your phone. */
function notify_(title, message) {
  if (!CONFIG.APP_URL) return;
  try {
    const res = UrlFetchApp.fetch(CONFIG.APP_URL.replace(/\/$/, '') + '/api/notify', { method: 'post',
      contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ t: appToken_(), title: title, body: message }) });
    console.log('Alert: ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 120));
  } catch (e) { console.log('Alert failed: ' + e.message); }
}

/** Run after deploying the web app: prints the link to open once on your phone. */
function appLink() {
  let url = CONFIG.WEB_APP_URL;
  if (!url) { try { url = ScriptApp.getService().getUrl(); } catch (e) {} }
  if (!url || !/\/exec$/.test(url)) throw new Error('Deploy → New deployment → Web app (access: Anyone), ' +
    'then paste the Web app URL (ends in /exec) into WEB_APP_URL at the top, save, and run appLink again.');
  const link = CONFIG.APP_URL ? CONFIG.APP_URL.replace(/\/$/, '') + '/#url=' + encodeURIComponent(url) + '&t=' + appToken_()
    : url + '?t=' + appToken_();
  console.log('Your Astra Leads app link (open on phone or laptop, then Add to Home Screen): ' + link);
  const me = Session.getEffectiveUser().getEmail();
  if (me) {
    MailApp.sendEmail({ to: me, subject: 'Your Astra Leads app link', name: 'Astra Outreach', htmlBody:
      '<p>Open this on your phone, then add it to your home screen:</p>' +
      '<p style="font-size:18px"><a href="' + link + '"><b>Open Astra Leads</b></a></p>' +
      '<p style="color:#888;font-size:12px">This link contains your private key. Don\'t share or forward it.</p>' });
    console.log('Also emailed to ' + me + '. Open that email on your phone and tap "Open Astra Leads".');
  }
  return link;
}

/** Run once from the editor to check that alerts reach your phone. */
function testNotification() {
  notify_('Astra Leads test', 'Reply alerts are working.');
}

// ─────────────────────── pure helpers (unit-tested) ───────────────────────

/** Keeps only the new part of an email reply (drops the quoted earlier message). */
function stripQuoted(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const out = [];
  for (const line of lines) {
    if (/^\s*On .{4,200}wrote:\s*$/i.test(line) || /^\s*-{2,}\s*Original Message/i.test(line) ||
        /^\s*From:\s.+/i.test(line) && out.length) break;
    if (/^\s*>/.test(line)) continue;
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Which target (industry) an OpenStreetMap element belongs to; null if none. */
function osmCategory(tags, targets) {
  for (const t of targets || []) {
    for (const tag of t.tags) {
      const kv = tag.split('=');
      if (kv.length > 1 ? tags[kv[0]] === kv[1] : (tags[kv[0]] && tags[kv[0]] !== 'no')) return t.key;
    }
  }
  return null;
}

/** Overpass (OpenStreetMap) elements → lead objects. Skips big chains (brand tags). */
function osmToLeads(elements, city, targets) {
  return elements.filter(e => e.tags && e.tags.name && !e.tags['brand:wikidata'] && !e.tags.brand).map(e => {
    const t = e.tags;
    const addr = [t['addr:housenumber'], t['addr:street'], t['addr:suburb'] || t['addr:district'],
      t['addr:city'] || city, t['addr:postcode']].filter(Boolean).join(', ');
    return {
      id: 'osm:' + e.type + '/' + e.id,
      name: t.name,
      website: t.website || t['contact:website'] || t.url || '',
      phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
      address: addr,
      rating: '',
      email: (t.email || t['contact:email'] || '').split(';')[0].trim(),
      city: t['addr:city'] || city,
      category: targets ? (osmCategory(t, targets) || '') : '',
    };
  });
}

/** The industry wording for a lead (falls back to DEFAULT_CATEGORY, then to plain "business"). */
function targetOf(r, cfg) {
  const ts = cfg.TARGETS || [];
  return ts.filter(t => t.key === r.category)[0] || ts.filter(t => t.key === cfg.DEFAULT_CATEGORY)[0] ||
    { key: '', one: 'business', many: 'businesses', who: 'customers', greeting: cfg.GREETING || 'Hello' };
}

function toDomain(url) {
  if (!url) return '';
  const m = String(url).trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '')
    .match(/^([a-z0-9.-]+\.[a-z]{2,})/);
  return m ? m[1] : '';
}

function isRealSite(domain) {
  return !!domain && !NOT_A_WEBSITE.some(d => domain === d || domain.slice(-(d.length + 1)) === '.' + d);
}

function parsePageSpeed(json) {
  const lh = json && json.lighthouseResult;
  if (!lh || !lh.audits || !lh.audits['speed-index'] || lh.audits['speed-index'].numericValue == null) {
    return { error: (json && json.error && json.error.message) || (lh && lh.runtimeError && lh.runtimeError.message) || 'no Lighthouse result' };
  }
  const si = lh.audits['speed-index'];
  const lcp = lh.audits['largest-contentful-paint'] || {};
  const s = Math.round(si.numericValue / 100) / 10;
  const nb = v => String(v || '').replace(/ /g, ' ');
  return {
    speedIndexS: s,
    speedIndex: nb(si.displayValue) || s + ' s',
    lcp: nb(lcp.displayValue),
    score: lh.categories && lh.categories.performance ? Math.round(lh.categories.performance.score * 100) : '',
    fixes: Object.keys(lh.audits).map(k => lh.audits[k])
      .filter(a => a.details && a.details.type === 'opportunity' && a.details.overallSavingsMs > 300)
      .sort((x, y) => y.details.overallSavingsMs - x.details.overallSavingsMs)
      .slice(0, 2)
      .map(a => a.title + ' (~' + (Math.round(a.details.overallSavingsMs / 100) / 10) + ' s)'),
  };
}

/** Finds plain, mailto: and Cloudflare-obfuscated emails in an HTML page. */
function extractEmails(html) {
  const found = [];
  const cf = /data-cfemail="([0-9a-f]+)"/gi;
  let m;
  while ((m = cf.exec(html))) found.push(cfDecode(m[1]));
  const text = html.replace(/&#64;|&#x40;|\s*\[at\]\s*|\s*\(at\)\s*/gi, '@').replace(/%40/g, '@');
  const re = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  while ((m = re.exec(text))) found.push(m[0]);
  const bad = /\.(png|jpe?g|gif|webp|svg|css|js)$|@(example|domain|email|sentry|wixpress|sentry-next)\.|^(no-?reply|user|name|your|test)@/i;
  const seen = {};
  return found.map(e => e.toLowerCase().replace(/^mailto:/, '').replace(/[.,;]+$/, ''))
    .filter(e => !bad.test(e) && !seen[e] && (seen[e] = true));
}

function cfDecode(hex) {
  const key = parseInt(hex.substr(0, 2), 16);
  let s = '';
  for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ key);
  return s;
}

/** Prefer an address on the clinic's own domain, then a free-mail inbox.
 *  Ignores other domains (usually the web designer's credit in the footer). */
function pickEmail(emails, domain) {
  const own = emails.filter(e => { const d = e.split('@')[1]; return d === domain || d.slice(-(domain.length + 1)) === '.' + domain; });
  const free = emails.filter(e => FREE_MAIL.indexOf(e.split('@')[1]) >= 0);
  const rank = e => /^(dr|doctor|owner|founder|ceo|director|admin)/.test(e) ? 0 : /^(info|contact|hello|appointments?|care|enquir)/.test(e) ? 1 : 2;
  const pool = own.length ? own : free;
  return pool.sort((a, b) => rank(a) - rank(b))[0] || '';
}

// ─────────────────── reply templates (run in the dashboards too) ───────────────────
var FIX_WORDS = {
  'Properly size images': 'Your photos are much larger than a phone screen needs. Resizing and compressing them makes the page load faster without any visible change.',
  'Serve images in next-gen formats': 'Saving the photos in a modern format (WebP) makes them about a third of the size, with the same quality.',
  'Efficiently encode images': 'Compressing the photos properly cuts their size without any visible change.',
  'Defer offscreen images': 'Photos further down the page can load only when the visitor scrolls to them, so the top of the page appears first.',
  'Eliminate render-blocking resources': 'Some style and script files have to download before anything shows on screen. Loading them later lets visitors see the page straight away.',
  'Reduce unused JavaScript': 'The site loads code it never uses on this page. Removing it means less to download on a phone connection.',
  'Reduce unused CSS': 'The site loads styling for features it does not use. Trimming it speeds up the first view.',
  'Reduce initial server response time': 'The hosting server is slow to answer. Better hosting or page caching fixes this.',
  'Avoid multiple page redirects': 'The address jumps through several redirects before the page loads. Pointing it straight to the final page saves time.',
  'Enable text compression': 'Turning on compression on the server makes every page smaller to download.',
  'Minify JavaScript': 'Shrinking the code files makes them faster to download.',
  'Minify CSS': 'Shrinking the style files makes them faster to download.',
  'Preconnect to required origins': 'Telling the browser early about outside services (fonts, maps) saves time on every visit.',
  'Avoid enormous network payloads': 'The page is very heavy for a phone. Cutting large photos, videos and scripts brings it down.'
};
function astraFix(f) {
  var m = String(f).match(/^(.*?)\s*\(~([\d.]+) s\)$/), title = m ? m[1] : String(f), save = m ? m[2] : '';
  return (FIX_WORDS[title] || title + '.') + (save ? ' (Google estimates this saves about ' + save + ' seconds.)' : '');
}
function astraTemplates(l, S) {
  var name = l.name || 'your business';
  var hi = (l.greeting || 'Hello') + ',\n\n';
  var d1 = (S.days && S.days[0]) || 'Monday', d2 = (S.days && S.days[1]) || 'Tuesday';
  var sig = '\n\nBest regards,\n' + S.sender + '\nAstra Nexora, ' + S.location + (S.phone ? '\n' + S.phone : '') + (S.projects ? '\nMy work: ' + S.projects : '');
  var fixes = String(l.fixes || '').split(' | ').filter(Boolean);
  var site = l.pitch ? l.pitch === 'website' : !l.domain;
  var list = [];
  if (!site) list.push({ id: 'fixes', label: 'Send the fixes', body:
    hi + 'Thank you for getting back to me. Here ' + (fixes.length > 1 ? 'are the ' + fixes.length + ' fixes' : 'is the fix') + ' for ' + name + "'s website:\n\n" +
    (fixes.length ? fixes.map(function (f, i) { return (i + 1) + '. ' + astraFix(f); }).join('\n\n') : '1. [describe the fix]') +
    '\n\nTogether these should bring the mobile load time down noticeably. Your web developer can make these changes, or my team can do it for you in 2 to 3 days.' +
    '\n\nWould a quick 10-minute call on ' + d1 + ' or ' + d2 + ' work to go through it?' + sig });
  if (site) list.push({ id: 'sample', label: 'Yes to a sample design', body:
    hi + 'Thank you! I will put together a sample homepage design for ' + name + ' and send it to you within 2 days.' +
    '\n\nSo it looks like your clinic, could you share:\n- your clinic logo, if you have one\n- the main treatments you offer\n- 2 or 3 photos of the clinic or the team' +
    '\n\nYou can simply reply to this email with them.' + sig });
  list.push({ id: 'price', label: 'Answer a price question', body:
    hi + 'Thank you for asking.\n\n' +
    (site ? 'A complete website for ' + name + ', with treatment pages, WhatsApp booking, Google Maps directions and basic Google SEO, costs [your price], one time. Hosting and domain for the first year are [included / extra].'
          : 'Fixing the speed issues on ' + name + "'s website costs [your price], one time. That includes the fixes above, testing on mobile, and a before-and-after Google report.") +
    '\n\nShall we do a quick 10-minute call on ' + d1 + ' or ' + d2 + ' so I can understand exactly what you need?' + sig });
  list.push({ id: 'call', label: 'Book a call', body:
    hi + 'Thank you. Shall we do a quick 10-minute call so I can understand what you need? I am free on ' + d1 + ' or ' + d2 +
    ', anytime between 11 am and 6 pm.\n\nPlease let me know a time that works for you, or share the best number to reach you.' + sig });
  list.push({ id: 'close', label: 'Polite close (not interested)', body:
    hi + 'Thank you for letting me know. No problem at all, and I will not send any more emails.\n\nIf you ever want help with ' + name +
    "'s website later, just reply to this email. Wishing you and the team all the best." + sig });
  list.push({ id: 'blank', label: 'Write my own', body: hi + sig });
  return list;
}
function astraPick(l, list) {
  var t = String(l.reply || '');
  var want = /\b(price|cost|charges?|how much|rate|fees?|budget|quote)\b/i.test(t) ? 'price'
    : /^\s*no\b|not interested|don'?t (email|contact)|unsubscribe|remove me|stop/i.test(t) ? 'close'
    : /\b(call|phone|talk|meet|number)\b/i.test(t) && !/\byes\b/i.test(t) ? 'call'
    : (l.pitch ? l.pitch === 'website' : !l.domain) ? 'sample' : 'fixes';
  for (var i = 0; i < list.length; i++) if (list[i].id === want) return i;
  return 0;
}

/** The template functions as browser source, so both dashboards use the same text. */
function templateJs_() {
  return 'var FIX_WORDS = ' + JSON.stringify(FIX_WORDS) + ';\n' + astraFix.toString() + '\n' +
    astraTemplates.toString() + '\n' + astraPick.toString() + '\n';
}

// ───────────────────────────── sheet helpers ─────────────────────────────

function sheet_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  if (!sh) throw new Error('Run setup() first.');
  return sh;
}
function readRows_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, COLS.length).getValues().map((v, i) => {
    const r = { _row: i + 2 };
    COLS.forEach((c, j) => { r[c] = v[j] instanceof Date ? Utilities.formatDate(v[j], 'Asia/Kolkata', 'yyyy-MM-dd HH:mm') : String(v[j]); });
    return r;
  });
}
function rowFrom_(o) {
  return COLS.map(c => {
    const v = o[c] == null ? '' : String(o[c]);
    // keep phone numbers like +91 98400 ... as text, not formulas/numbers
    return c === 'phone' && v && v[0] !== "'" ? "'" + v : v;
  });
}
function writeRow_(sh, r) { sh.getRange(r._row, 1, 1, COLS.length).setValues([rowFrom_(r)]); }
function appendNote_(note, add) { return (note ? note + '; ' : '') + String(add).slice(0, 200); }
function today_() { return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd'); }
function hourIST_() { return Number(Utilities.formatDate(new Date(), 'Asia/Kolkata', 'H')); }
function isWeekend_() { const d = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'u'); return d === '6' || d === '7'; }
function inWorkHours_() { const h = hourIST_(); return h >= CONFIG.WORK_HOURS[0] && h < CONFIG.WORK_HOURS[1]; }
function callDay_() {
  const d = new Date();
  let added = 0;
  while (added < 2) { d.setDate(d.getDate() + 1); const w = Utilities.formatDate(d, 'Asia/Kolkata', 'u'); if (w !== '6' && w !== '7') added++; }
  return Utilities.formatDate(d, 'Asia/Kolkata', 'EEEE');
}
function esc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function log_(msg) { console.log(msg); }


// ─────────────────────── 3. phone dashboard & daily digest ───────────────────────
// Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
// Every request must carry your private pairing token, so the data stays yours.
// Then run appLink() and open the printed link once on your phone (Astra Leads app).

function doGet(e) {
  const p = (e && e.parameter) || {};
  const ok = p.t && p.t === appToken_();
  const out = obj => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  if (!ok) return p.api ? out({ error: 'not paired: open the link from appLink again' }) :
    HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:24px">This link is missing your private key. ' +
      'In Apps Script, run <b>appLink</b>: it emails you the full link. Open that email on your phone and tap it.</p>');
  try {
    if (p.api === 'data') return out(dashboardData_());
    if (p.api === 'page') return out({ html: p.view === 'mobile' ? dashboardHtml_(dashboardData_()) : desktopHtml_(desktopData_()) });
    if (p.view === 'desktop') return HtmlService.createHtmlOutput(desktopHtml_(desktopData_()))
      .setTitle('Astra Leads: Daily dashboard').addMetaTag('viewport', 'width=device-width, initial-scale=1');
    if (p.api === 'mark') { markLead(p.row, p.status); return out({ ok: true }); }
  } catch (err) { return out({ error: err.message }); }
  return HtmlService.createHtmlOutput(dashboardHtml_(dashboardData_()))
    .setTitle('Astra Leads').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Buttons on the dashboard when it's opened from the Netlify page (outside script.google.com).
 *  Body: {"t": key, "fn": "markLead" | "sendFromDashboard", "args": [...]} sent as text/plain. */
function doPost(e) {
  const out = obj => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  let req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return out({ error: 'bad request' }); }
  if (!req.t || req.t !== appToken_()) return out({ error: 'not paired' });
  const fns = { markLead: markLead, sendFromDashboard: sendFromDashboard };
  if (!fns[req.fn]) return out({ error: 'unknown action' });
  try { return out({ ok: true, result: fns[req.fn].apply(null, req.args || []) }); }
  catch (err) { return out({ error: err.message }); }
}

/** Called from the dashboard buttons. */
function markLead(row, status) {
  const allowed = ['call_booked', 'won', 'lost', 'opted_out', 'replied'];
  if (allowed.indexOf(status) < 0) throw new Error('bad status');
  const sh = sheet_();
  row = Number(row);
  if (!(row >= 2 && row <= sh.getLastRow())) throw new Error('bad row');
  const r = readRows_(sh).filter(x => x._row === row)[0];
  r.status = status;
  r.note = appendNote_(r.note, status + ' ' + today_());
  writeRow_(sh, r);
  return true;
}

function markWhatsAppSent(row) {
  const sh = sheet_();
  row = Number(row);
  if (!(row >= 2 && row <= sh.getLastRow())) throw new Error('bad row');
  const r = readRows_(sh).filter(x => x._row === row)[0];
  r.wa_sent_on = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
  writeRow_(sh, r);
  return true;
}

function dashboardData_() {
  const rows = readRows_(sheet_());
  let me = '';
  try { me = Session.getEffectiveUser().getEmail(); } catch (e) {}
  return summarize(rows, today_(), me, CONFIG.EMAILS_PER_DAY);
}

/** What the reply templates need: who you are and two call days. Pure. */
function tplSettings_(today) {
  const days = [];
  const d = new Date(today + 'T12:00:00Z');
  while (days.length < 2) {
    d.setUTCDate(d.getUTCDate() + 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) days.push(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][w]);
  }
  return { sender: CONFIG.SENDER_NAME, location: CONFIG.AGENCY_LOCATION, phone: CONFIG.SIGNATURE_PHONE,
    projects: CONFIG.PORTFOLIO_URL, days: days };
}

/** Pure: sheet rows → numbers and lists for the dashboard and the digest. */
function summarize(rows, today, me, perDay) {
  const day = d => String(d || '').slice(0, 10);
  const weekAgo = new Date(new Date(today + 'T00:00:00Z').getTime() - 6 * 864e5).toISOString().slice(0, 10);
  const contacted = rows.filter(r => r.contacted_on);
  const answered = ['replied', 'call_booked', 'won', 'lost'];
  const byStatus = {};
  rows.forEach(r => { const k = r.status || 'pasted'; byStatus[k] = (byStatus[k] || 0) + 1; });
  const gmail = r => {
    const ids = String(r.thread_ids || '').split(',').filter(Boolean);
    return ids.length ? 'https://mail.google.com/mail/?authuser=' + encodeURIComponent(me) + '#all/' + ids[ids.length - 1] : '';
  };
  const card = r => ({ row: r._row, name: r.business_name || r.domain, city: r.city, email: r.email, phone: r.phone,
    pitch: r.pitch, status: r.status, when: r.contacted_on, gmail: gmail(r), fixes: r.top_fixes, website: r.website,
    sent: r.sent_text, reply: r.reply_text, replied_on: r.replied_on, answered_on: r.answered_on, domain: r.domain,
    greeting: targetOf(r, CONFIG).greeting, category: r.category });
  const waitingAnswer = r => !r.answered_on || (!!r.replied_on && r.answered_on < r.replied_on);
  const byReply = (a, b) => String(b.replied_on || b.contacted_on).localeCompare(String(a.replied_on || a.contacted_on));
  return {
    today,
    perDay,
    sentToday: rows.filter(r => day(r.contacted_on) === today || day(r.followup_on) === today).length,
    sentWeek: contacted.filter(r => day(r.contacted_on) >= weekAgo).length,
    contacted: contacted.length,
    answered: contacted.filter(r => answered.indexOf(r.status) >= 0).length,
    won: byStatus.won || 0,
    calls: byStatus.call_booked || 0,
    waiting: rows.filter(r => r.status === 'new' || (!r.status && (r.business_name || r.website))).length,
    byStatus,
    replies: rows.filter(r => (r.status === 'replied' && waitingAnswer(r)) ||
      (r.status === 'call_booked' && r.answered_on && r.replied_on > r.answered_on)).sort(byReply).map(card),
    talking: rows.filter(r => r.status === 'replied' && !waitingAnswer(r)).sort(byReply).map(card),
    calls_list: rows.filter(r => r.status === 'call_booked').sort(byReply).map(card),
    tpl: tplSettings_(today),
    recent: contacted.slice().sort((a, b) => String(b.contacted_on).localeCompare(String(a.contacted_on))).slice(0, 15).map(card),
  };
}

/** Evening email to yourself: the day's numbers and who to answer. */
function dailyDigest() {
  if (isWeekend_()) return;
  const d = dashboardData_();
  const me = Session.getEffectiveUser().getEmail();
  if (!me) return;
  let url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) {}
  const li = a => a.map(c => '<li><b>' + esc_(c.name) + '</b> (' + esc_(c.city || '') + ')' +
    (c.reply ? ': <i>' + esc_(String(c.reply).slice(0, 140)) + '</i>' : '') +
    (c.gmail ? ' · <a href="' + c.gmail + '">open email</a>' : '') + '</li>').join('');
  const html =
    '<h2 style="margin:0 0 8px">Astra Outreach: ' + d.today + '</h2>' +
    '<p>Sent today: <b>' + d.sentToday + '</b> / ' + d.perDay + ' · This week: <b>' + d.sentWeek + '</b> · ' +
    'Replies so far: <b>' + d.answered + '</b> of ' + d.contacted + ' · Leads waiting: <b>' + d.waiting + '</b></p>' +
    (d.replies.length ? '<h3>Reply to these (' + d.replies.length + ')</h3><ul>' + li(d.replies) + '</ul>' : '<p>No replies waiting.</p>') +
    (d.calls_list.length ? '<h3>Calls booked</h3><ul>' + li(d.calls_list) + '</ul>' : '') +
    (url ? '<p><a href="' + url + '">Open the dashboard</a></p>' : '');
  MailApp.sendEmail({ to: me, subject: 'Astra Outreach: ' + d.sentToday + ' sent, ' + d.replies.length + ' to reply',
    htmlBody: html, name: 'Astra Outreach' });
}

function dashboardHtml_(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0f172a">
<title>Astra Leads</title>
<style>
:root{--bg:#f6f7fb;--card:#fff;--ink:#0f172a;--mute:#64748b;--line:#e5e7eb;--accent:#4f46e5;--good:#059669;--bad:#dc2626;--them:#eef2ff;--us:#f1f5f9}
@media (prefers-color-scheme:dark){:root{--bg:#0b1020;--card:#141a2e;--ink:#e5e7eb;--mute:#94a3b8;--line:#243049;--accent:#818cf8;--good:#34d399;--bad:#f87171;--them:#1e2550;--us:#1a2238}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
header{padding:18px 16px 6px}h1{margin:0;font-size:22px}header p{margin:2px 0 0;color:var(--mute);font-size:13px}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:10px 16px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}
.stat b{display:block;font-size:24px}.stat span{color:var(--mute);font-size:12px}.stat.hot{border-color:var(--accent)}
.bar{height:6px;background:var(--line);border-radius:3px;margin-top:8px;overflow:hidden}.bar i{display:block;height:100%;background:var(--accent)}
nav{display:flex;gap:6px;padding:8px 16px;overflow-x:auto;position:sticky;top:0;background:var(--bg);z-index:2}
nav button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 12px;font-size:14px;white-space:nowrap}
nav button.on{background:var(--accent);border-color:var(--accent);color:#fff}
section{padding:4px 16px 24px}.empty{color:var(--mute);text-align:center;padding:24px}
.item{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin:10px 0}
.item h3{margin:0;font-size:16px}.meta{color:var(--mute);font-size:13px;margin-top:2px;word-break:break-word}
.msg{border-radius:12px;padding:10px 12px;margin-top:10px;font-size:14px;white-space:pre-wrap;word-break:break-word}
.msg.them{background:var(--them)}.msg.us{background:var(--us)}
.msg small{display:block;color:var(--mute);font-size:12px;margin-bottom:4px;white-space:normal}
details{margin-top:10px}summary{color:var(--accent);font-size:14px;cursor:pointer}
.fix{font-size:13px;margin-top:8px}.row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.btn{flex:1 1 auto;text-align:center;text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:14px;color:var(--ink);background:transparent;cursor:pointer}
.btn.pri{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.good{color:var(--good);border-color:var(--good)}.btn.bad{color:var(--bad);border-color:var(--bad)}
.pill{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:var(--mute);margin-left:6px;vertical-align:middle}
.done{opacity:.45}
.comp{margin-top:10px;display:none}.comp.on{display:block}
.comp select,.comp textarea,.comp input{width:100%;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:9px;font:inherit;margin-top:6px}
.comp textarea{min-height:240px;line-height:1.45}
.counts{display:grid;grid-template-columns:1fr auto;gap:6px 12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}
</style></head><body>
<header><h1>Astra Leads</h1><p id="sub"></p></header>
<div class="stats" id="stats"></div>
<nav id="tabs"></nav>
<section id="list"></section>
<script>
${templateJs_()}
var D = ${json};
var TABS = [['replies','Replies ('+D.replies.length+')'],['calls','Calls ('+D.calls_list.length+')'],['recent','Sent'],['pipeline','Pipeline']];
var cur = 'replies';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function stat(n,l,extra,cls){return '<div class="stat '+(cls||'')+'"><b>'+n+'</b><span>'+l+'</span>'+(extra||'')+'</div>';}
function msg(cls,label,text){return text?'<div class="msg '+cls+'"><small>'+esc(label)+'</small>'+esc(text)+'</div>':'';}
function render(){
  document.getElementById('sub').textContent = D.today + ' · pull down or reopen to refresh';
  var pct = Math.min(100, Math.round(100*D.sentToday/Math.max(1,D.perDay)));
  var rate = D.contacted ? Math.round(100*D.answered/D.contacted) : 0;
  document.getElementById('stats').innerHTML =
    stat(D.replies.length,'Replies to answer','',D.replies.length?'hot':'') +
    stat(D.sentToday+' / '+D.perDay,'Emails today','<div class="bar"><i style="width:'+pct+'%"></i></div>') +
    stat(D.answered+' <small style="font-size:13px">('+rate+'%)</small>','Replied, all time') +
    stat(D.calls+' · '+D.won,'Calls booked · Won') +
    stat(D.sentWeek,'Sent this week') + stat(D.waiting,'Leads waiting');
  document.getElementById('tabs').innerHTML = TABS.map(function(t){
    return '<button class="'+(t[0]===cur?'on':'')+'" onclick="cur=\\''+t[0]+'\\';render()">'+t[1]+'</button>';}).join('');
  var L = document.getElementById('list');
  if (cur==='pipeline'){
    var keys = Object.keys(D.byStatus).sort(function(a,b){return D.byStatus[b]-D.byStatus[a];});
    L.innerHTML = '<div class="counts">'+keys.map(function(k){return '<span>'+esc(k)+'</span><b>'+D.byStatus[k]+'</b>';}).join('')+'</div>';
    return;
  }
  var items = cur==='replies'?D.replies:cur==='calls'?D.calls_list:D.recent;
  if (!items.length){ L.innerHTML = '<p class="empty">'+(cur==='replies'?'No replies waiting yet. You\\'ll get a phone alert when one comes in.':'Nothing here right now.')+'</p>'; return; }
  L.innerHTML = items.map(function(c,i){
    var h = '<div class="item" id="it'+cur+i+'"><h3>'+esc(c.name)+'<span class="pill">'+esc(c.pitch==='website'?'website build':(c.pitch||''))+'</span></h3>'+
      '<div class="meta">'+esc([c.city,c.email,c.phone].filter(Boolean).join(' · '))+'</div>';
    if (cur==='recent') {
      h += '<div class="meta">Emailed '+esc(c.when)+' · '+esc(c.status)+'</div>';
      h += c.sent ? '<details><summary>What you sent</summary>'+msg('us','You · '+(c.when||''),c.sent)+'</details>' : '';
    } else {
      h += c.reply ? msg('them','They replied · '+(c.replied_on||''),c.reply) : '<div class="meta">Replied: open the email to read it.</div>';
      h += c.sent ? '<details><summary>What you sent</summary>'+msg('us','You · '+(c.when||''),c.sent)+'</details>' : '';
      if (c.fixes && c.pitch!=='website') h += '<div class="fix"><b>Fixes to send:</b> '+esc(c.fixes)+'</div>';
    }
    h += '<div class="row">';
    if (c.gmail) h += '<a class="btn pri" target="_blank" href="'+esc(c.gmail)+'">'+(cur==='recent'?'Open email':'Reply in Gmail')+'</a>';
    if (c.phone && cur!=='recent') h += '<a class="btn" href="tel:'+esc(String(c.phone).split(/[;,]/)[0].replace(/[^+\\d]/g,''))+'">Call</a>';
    if (cur==='replies') h += '<button class="btn pri" onclick="compose('+i+')">✉ Reply</button>';
    if (cur==='replies') h += '<button class="btn good" onclick="mark('+c.row+',\\'call_booked\\','+i+')">Call booked</button>'+
      '<button class="btn bad" onclick="mark('+c.row+',\\'lost\\','+i+')">Not interested</button>';
    if (cur==='calls') h += '<button class="btn good" onclick="mark('+c.row+',\\'won\\','+i+')">Won 🎉</button>'+
      '<button class="btn bad" onclick="mark('+c.row+',\\'lost\\','+i+')">Lost</button>';
    h += '</div>';
    if (cur==='replies') h += '<div class="comp" id="comp'+i+'"></div>';
    return h+'</div>';
  }).join('');
}
var TPLS={};
function compose(i){var c=D.replies[i],box=document.getElementById('comp'+i);
  if(box.className.indexOf('on')>=0){box.className='comp';return;}
  var L=astraTemplates(c,D.tpl);TPLS[i]=L;var pick=astraPick(c,L);
  box.innerHTML='<input id="to'+i+'" value="'+esc(c.email||'')+'">'+
    '<select onchange="document.getElementById(\\'tx'+i+'\\').value=TPLS['+i+'][this.value].body">'+
    L.map(function(t,k){return '<option value="'+k+'"'+(k===pick?' selected':'')+'>'+esc(t.label)+'</option>';}).join('')+'</select>'+
    '<textarea id="tx'+i+'">'+esc(L[pick].body)+'</textarea>'+
    '<div class="row"><button class="btn pri" id="sb'+i+'" onclick="sendIt('+i+')">Send</button></div>';
  box.className='comp on';}
function sendIt(i){var c=D.replies[i],b=document.getElementById('sb'+i),to=document.getElementById('to'+i).value,body=document.getElementById('tx'+i).value;
  if(!confirm('Send this reply to '+to+'?'))return;b.disabled=true;b.textContent='Sending…';
  google.script.run.withSuccessHandler(function(r){b.textContent='Sent ✓';var el=document.getElementById('it'+cur+i);if(el)el.className+=' done';})
   .withFailureHandler(function(e){b.disabled=false;b.textContent='Send';alert('Not sent: '+e.message);}).sendFromDashboard(c.row,to,'',body);}
function mark(row,status,i){ var el=document.getElementById('it'+cur+i); if(el) el.className+=' done';
  google.script.run.withFailureHandler(function(e){alert('Could not save: '+e.message);}).markLead(row,status); }
render();
</script></body></html>`;
}


// ─────────────────────── 4. laptop daily dashboard (?view=desktop) ───────────────────────

function desktopData_() {
  const rows = readRows_(sheet_());
  let me = '';
  try { me = Session.getEffectiveUser().getEmail(); } catch (e) {}
  const d = desktopSummary(rows, today_(), me, CONFIG);
  const props = PropertiesService.getScriptProperties();
  let triggers = 0, left = '';
  try { triggers = ScriptApp.getProjectTriggers().length; } catch (e) {}
  try { left = MailApp.getRemainingDailyQuota(); } catch (e) {}
  const idx = Number(props.getProperty('areaIndex') || 0);
  d.health = { lastRun: props.getProperty('lastRun') || '', lastFind: props.getProperty('lastFind') || '',
    nextCity: CONFIG.LEAD_SOURCE === 'osm' ? CONFIG.OSM_CITIES[idx % CONFIG.OSM_CITIES.length].name :
      CONFIG.LEAD_SOURCE === 'places' ? CONFIG.AREAS[idx % CONFIG.AREAS.length] : 'manual',
    triggers, gmailLeft: left };
  return d;
}

/** Pure: everything the laptop dashboard shows. */
function desktopSummary(rows, today, me, cfg) {
  const base = summarize(rows, today, me, cfg.EMAILS_PER_DAY);
  const day = d => String(d || '').slice(0, 10);
  const days = [];
  for (let i = 13; i >= 0; i--) days.push(new Date(new Date(today + 'T00:00:00Z').getTime() - i * 864e5).toISOString().slice(0, 10));
  const daily = days.map(d => ({ day: d,
    first: rows.filter(r => day(r.contacted_on) === d).length,
    followups: rows.filter(r => day(r.followup_on) === d).length }));
  const cities = {};
  rows.forEach(r => {
    const c = r.city || 'Unknown';
    const x = cities[c] || (cities[c] = { city: c, leads: 0, website: 0, emailed: 0, replied: 0, noSite: 0 });
    x.leads++;
    if (r.domain) x.website++;
    if (r.status === 'no_website') x.noSite++;
    if (r.contacted_on) x.emailed++;
    if (['replied', 'call_booked', 'won', 'lost'].indexOf(r.status) >= 0) x.replied++;
  });
  const has = st => rows.filter(r => st.indexOf(r.status) >= 0).length;
  const audited = rows.filter(r => r.speed_index || r.status === 'fast' || r.status === 'audit_failed').length;
  const funnel = [
    ['Leads found', rows.length],
    ['Have a website', rows.filter(r => r.domain).length],
    ['Audited', audited],
    ['Emailed', rows.filter(r => r.contacted_on).length],
    ['Replied', has(['replied', 'call_booked', 'won', 'lost'])],
    ['Call booked', has(['call_booked', 'won'])],
    ['Won', has(['won'])],
  ];
  const cutoff = new Date(new Date(today + 'T00:00:00Z').getTime() - (cfg.FOLLOWUP_AFTER_DAYS || 3) * 864e5).toISOString().slice(0, 10);
  const gmail = r => {
    const ids = String(r.thread_ids || '').split(',').filter(Boolean);
    return ids.length ? 'https://mail.google.com/mail/?authuser=' + encodeURIComponent(me) + '#all/' + ids[ids.length - 1] : '';
  };
  const leads = rows.filter(r => r.business_name || r.website).map(r => ({
    row: r._row, name: r.business_name || r.domain, city: r.city, status: r.status || 'pasted', pitch: r.pitch,
    website: r.website, domain: r.domain, email: r.email, phone: r.phone, address: r.address,
    speed: r.speed_index, score: r.perf_score, lcp: r.lcp, fixes: r.top_fixes,
    added: r.added_on, emailed: r.contacted_on, followup: r.followup_on, replied: r.replied_on,
    reply: r.reply_text, sent: r.sent_text, note: r.note, gmail: gmail(r), answered: r.answered_on,
    greeting: targetOf(r, cfg).greeting, category: r.category,
    report: r.website ? 'https://pagespeed.web.dev/analysis?url=' + encodeURIComponent(r.website) + '&form_factor=mobile' : '' }));
  const fmtT = v => String(v || '').slice(11, 16);
  const events = [];
  rows.forEach(r => {
    const n = r.business_name || r.domain;
    if (day(r.contacted_on) === today) events.push({ t: fmtT(r.contacted_on), k: 'Email sent', n, p: r.pitch });
    if (day(r.followup_on) === today) events.push({ t: fmtT(r.followup_on), k: 'Follow-up sent', n, p: r.pitch });
    if (day(r.replied_on) === today) events.push({ t: fmtT(r.replied_on), k: r.status === 'bounced' ? 'Bounced' : 'Reply received', n, p: r.pitch });
    if (day(r.answered_on) === today) events.push({ t: fmtT(r.answered_on), k: 'You replied', n, p: r.pitch });
  });
  events.sort((a, b) => b.t.localeCompare(a.t));
  const addedToday = rows.filter(r => day(r.added_on) === today).length;
  const pitches = ['speed', 'website'].map(p => {
    const em = rows.filter(r => r.pitch === p && r.contacted_on);
    const rep = em.filter(r => ['replied', 'call_booked', 'won', 'lost'].indexOf(r.status) >= 0).length;
    return { pitch: p, emailed: em.length, replied: rep, rate: em.length ? Math.round(100 * rep / em.length) : 0,
      calls: em.filter(r => r.status === 'call_booked' || r.status === 'won').length, won: em.filter(r => r.status === 'won').length };
  });
  const speeds = rows.map(r => parseFloat(r.speed_index)).filter(v => v > 0);
  const fixCount = {};
  rows.forEach(r => String(r.top_fixes || '').split(' | ').filter(Boolean).forEach(f => {
    const t = f.replace(/\s*\(~[\d.]+ s\)$/, ''); fixCount[t] = (fixCount[t] || 0) + 1; }));
  const speed = { audited: speeds.length, avg: speeds.length ? Math.round(10 * speeds.reduce((a, b) => a + b, 0) / speeds.length) / 10 : 0,
    slow: speeds.filter(v => v > cfg.SPEED_THRESHOLD_S).length,
    fixes: Object.keys(fixCount).map(k => [k, fixCount[k]]).sort((a, b) => b[1] - a[1]).slice(0, 5) };
  const followList = rows.filter(r => r.status === 'sent' && day(r.contacted_on)).map(r => ({ n: r.business_name || r.domain,
    emailed: r.contacted_on, due: day(r.contacted_on) <= cutoff })).sort((a, b) => String(a.emailed).localeCompare(String(b.emailed))).slice(0, 8);
  const queue = rows.filter(r => r.status === 'new' || (r.status === 'no_website' && !r.pitch && /@/.test(r.email || '')))
    .slice(0, 8).map(r => ({ n: r.business_name || r.domain, c: r.city, p: r.status === 'new' ? 'speed audit' : 'website pitch' }));
  return Object.assign(base, {
    events, addedToday, pitches, speed, followList, queue,
    daily, funnel, leads,
    cities: Object.keys(cities).map(k => cities[k]).sort((a, b) => b.leads - a.leads),
    followupsDue: rows.filter(r => r.status === 'sent' && day(r.contacted_on) && day(r.contacted_on) <= cutoff).length,
    settings: { from: cfg.SENDER_EMAIL, mode: cfg.SEND_MODE, perDay: cfg.EMAILS_PER_DAY, hours: cfg.WORK_HOURS.join(':00–') + ':00',
      source: cfg.LEAD_SOURCE, followupDays: cfg.FOLLOWUP_AFTER_DAYS, threshold: cfg.SPEED_THRESHOLD_S },
  });
}

function desktopHtml_(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Astra Leads: Daily dashboard</title>
<style>
:root{--bg:#f5f6fa;--card:#fff;--ink:#0f172a;--ink2:#334155;--mute:#64748b;--line:#e5e7eb;--grid:#eef0f4;--accent:#4f46e5;--accent2:#c7d2fe;--good:#047857;--bad:#b91c1c;--them:#eef2ff;--us:#f1f5f9;--chip:#f1f5f9}
@media (prefers-color-scheme:dark){:root{--bg:#0b1020;--card:#121933;--ink:#e5e7eb;--ink2:#cbd5e1;--mute:#94a3b8;--line:#243049;--grid:#1c2440;--accent:#818cf8;--accent2:#3730a3;--good:#34d399;--bad:#f87171;--them:#1e2550;--us:#1a2238;--chip:#1a2238}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
header{display:flex;align-items:center;gap:16px;padding:18px 24px;border-bottom:1px solid var(--line);background:var(--card);position:sticky;top:0;z-index:5}
header h1{margin:0;font-size:20px}header .sub{color:var(--mute);font-size:13px}header .sp{flex:1}
.btn{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:9px;padding:7px 12px;font:inherit;cursor:pointer;text-decoration:none;display:inline-block}
.btn.pri{background:var(--accent);border-color:var(--accent);color:#fff}.btn.good{color:var(--good);border-color:var(--good)}.btn.bad{color:var(--bad);border-color:var(--bad)}
main{max-width:1400px;margin:0 auto;padding:20px 24px 40px;display:grid;gap:16px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
.kpi b{display:block;font-size:26px;letter-spacing:-.02em}.kpi span{color:var(--mute);font-size:12px}.kpi.hot{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}
.grid2{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}.grid3{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}
@media (max-width:980px){.grid2,.grid3{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;min-width:0}
.card h2{margin:0 0 4px;font-size:15px}.card .hint{color:var(--mute);font-size:12px;margin-bottom:12px}
svg text{fill:var(--mute);font-size:11px}
.tip{position:fixed;pointer-events:none;background:var(--ink);color:var(--card);padding:6px 9px;border-radius:8px;font-size:12px;display:none;z-index:20}
.fun{display:grid;grid-template-columns:120px 1fr 48px;gap:8px 10px;align-items:center}
.fun .bar{height:14px;background:var(--grid);border-radius:4px;overflow:hidden}.fun .bar i{display:block;height:100%;background:var(--accent);border-radius:0 4px 4px 0}
.fun b{text-align:right}.fun span{color:var(--ink2)}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--mute);font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;user-select:none}td.num,th.num{text-align:right}
tbody tr{cursor:pointer}tbody tr:hover{background:var(--grid)}
.st{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;background:var(--chip);color:var(--ink2);white-space:nowrap}
.st.replied,.st.call_booked{background:var(--accent);color:#fff}.st.won{background:var(--good);color:#fff}
.tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
.tools input,.tools select{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:9px;padding:7px 10px;font:inherit}
.tools input{flex:1;min-width:200px}.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid var(--line);background:var(--card);color:var(--ink2);border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.tablewrap{overflow:auto;max-height:620px}
.needs .item{border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px}
.msg{border-radius:10px;padding:9px 11px;margin-top:8px;white-space:pre-wrap;word-break:break-word}.msg.them{background:var(--them)}.msg.us{background:var(--us)}
.msg small{display:block;color:var(--mute);font-size:11px;margin-bottom:3px;white-space:normal}
.row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.mute{color:var(--mute)}.empty{color:var(--mute);padding:16px 0}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(520px,100%);background:var(--card);border-left:1px solid var(--line);box-shadow:-10px 0 30px rgba(0,0,0,.15);padding:20px;overflow:auto;transform:translateX(100%);transition:transform .2s;z-index:10}
.drawer.open{transform:none}.drawer h3{margin:0 0 4px;font-size:18px}
dl{display:grid;grid-template-columns:110px 1fr;gap:6px 12px;margin:14px 0}dt{color:var(--mute)}dd{margin:0;word-break:break-word}
details summary{cursor:pointer;color:var(--accent)}
.tl{list-style:none;margin:0;padding:0;max-height:260px;overflow:auto}.tl li{display:grid;grid-template-columns:46px 1fr;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)}
.tl time{color:var(--mute);font-variant-numeric:tabular-nums}.tl .k{color:var(--mute);font-size:12px}
.kv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px}.kv dt{color:var(--mute)}.kv dd{margin:0}
.ok{color:var(--good)}.warn{color:var(--bad)}
.compose{margin-top:16px;border-top:1px solid var(--line);padding-top:14px}.compose h4{margin:0 0 8px}
.compose label{display:block;color:var(--mute);font-size:12px;margin:8px 0 4px}
.compose input,.compose select,.compose textarea{width:100%;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:9px;padding:8px 10px;font:inherit}
.compose textarea{min-height:260px;resize:vertical;line-height:1.5}
.compose .note{color:var(--mute);font-size:12px;margin-top:6px}
</style></head><body>
<header><div><h1>Astra Leads</h1><div class="sub" id="sub"></div></div><div class="sp"></div>
<a class="btn" href="javascript:location.reload()">↻ Refresh</a></header>
<main>
  <div class="kpis" id="kpis"></div>
  <div class="grid3" style="grid-template-columns:1fr 1fr 1fr">
    <div class="card"><h2>Today</h2><div class="hint" id="todayHint">What happened today</div><ul class="tl" id="today"></ul></div>
    <div class="card"><h2>Coming up</h2><div class="hint">Follow-ups and the next leads in the queue</div><div id="coming"></div></div>
    <div class="card"><h2>System</h2><div class="hint">Is everything running?</div><dl class="kv" id="health"></dl></div>
  </div>
  <div class="grid2">
    <div class="card"><h2>Emails sent: last 14 days</h2><div class="hint">First emails, with follow-ups stacked on top. Daily limit shown as a dashed line.</div><div id="daily"></div></div>
    <div class="card"><h2>Funnel</h2><div class="hint">From lead found to client won</div><div class="fun" id="funnel"></div></div>
  </div>
  <div class="grid2" style="grid-template-columns:1fr 1fr">
    <div class="card"><h2>Pitch performance</h2><div class="hint">Which email gets more replies</div><table id="pitches"></table></div>
    <div class="card"><h2>Website speed insights</h2><div class="hint">From the clinics you've audited</div><div id="speedbox"></div></div>
  </div>
  <div class="grid3">
    <div class="card needs"><h2>Needs you today</h2><div class="hint">Replies to answer and calls you've booked</div><div id="needs" style="max-height:560px;overflow:auto"></div></div>
    <div class="card"><h2>By city</h2><div class="hint">Where your leads are</div><div class="tablewrap" style="max-height:360px"><table id="cities"></table></div></div>
  </div>
  <div class="card"><h2>All leads</h2><div class="hint">Click a lead to see everything about it</div>
    <div class="tools"><input id="q" placeholder="Search name, email, phone, website…"><select id="city"></select><div class="chips" id="chips"></div></div>
    <div class="tablewrap"><table id="leads"></table></div></div>
  <div class="card mute" id="settings"></div>
</main>
<aside class="drawer" id="drawer"></aside><div class="tip" id="tip"></div>
<script>
${templateJs_()}
var D = ${json};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var tip=document.getElementById('tip');
function showTip(e,html){tip.innerHTML=html;tip.style.display='block';tip.style.left=Math.min(e.clientX+12,innerWidth-200)+'px';tip.style.top=(e.clientY+12)+'px';}
function hideTip(){tip.style.display='none';}
document.getElementById('sub').textContent='Daily dashboard · '+D.today+' · updated '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
// KPIs
var rate=D.contacted?Math.round(100*D.answered/D.contacted):0;
function kpi(n,l,hot){return '<div class="kpi'+(hot?' hot':'')+'"><b>'+n+'</b><span>'+l+'</span></div>';}
document.getElementById('kpis').innerHTML=kpi(D.replies.length,'Replies to answer',D.replies.length)+kpi(D.sentToday+' / '+D.perDay,'Emails today')+
  kpi(D.sentWeek,'Sent this week')+kpi(D.contacted,'Emailed, all time')+kpi(D.answered+' ('+rate+'%)','Replied')+
  kpi(D.calls,'Calls booked')+kpi(D.won,'Won')+kpi(D.waiting,'Leads waiting')+kpi(D.followupsDue,'Follow-ups due')+kpi(D.byStatus.no_website||0,'No website (call list)');
// daily chart (stacked: first + follow-ups), single scale
(function(){var W=640,H=220,L=28,B=26,T=10,n=D.daily.length,max=Math.max(D.perDay,1);
 D.daily.forEach(function(d){max=Math.max(max,d.first+d.followups);});
 max=Math.max(5,Math.ceil(max*1.1/5)*5);
 var bw=(W-L)/n,s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Emails sent per day">';
 for(var g=0;g<=4;g++){var v=Math.round(max*g/4),y=H-B-(H-B-T)*v/max;s+='<line x1="'+L+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="var(--grid)"/><text x="'+(L-6)+'" y="'+(y+4)+'" text-anchor="end">'+v+'</text>';}
 var ly=H-B-(H-B-T)*D.perDay/max;s+='<line x1="'+L+'" x2="'+W+'" y1="'+ly+'" y2="'+ly+'" stroke="var(--mute)" stroke-dasharray="4 4"/><text x="'+W+'" y="'+(ly-4)+'" text-anchor="end">limit '+D.perDay+'</text>';
 D.daily.forEach(function(d,i){var x=L+i*bw+bw*0.2,w=bw*0.6,h1=(H-B-T)*d.first/max,h2=(H-B-T)*d.followups/max,y1=H-B-h1;
  if(d.first)s+='<rect x="'+x+'" y="'+y1+'" width="'+w+'" height="'+h1+'" rx="'+(d.followups?0:4)+'" fill="var(--accent)"/>';
  if(d.followups)s+='<rect x="'+x+'" y="'+(y1-h2-2)+'" width="'+w+'" height="'+h2+'" rx="4" fill="var(--accent2)"/>';
  s+='<rect class="hit" data-i="'+i+'" x="'+(L+i*bw)+'" y="'+T+'" width="'+bw+'" height="'+(H-B-T)+'" fill="transparent"/>';
  if(i%2===n%2||i===n-1)s+='<text x="'+(x+w/2)+'" y="'+(H-8)+'" text-anchor="middle">'+d.day.slice(5)+'</text>';});
 var el=document.getElementById('daily');el.innerHTML=s+'</svg><div class="mute" style="font-size:12px;margin-top:6px"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--accent)"></span> First emails &nbsp; <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--accent2)"></span> Follow-ups</div>';
 el.querySelectorAll('.hit').forEach(function(r){r.addEventListener('mousemove',function(e){var d=D.daily[r.dataset.i];showTip(e,'<b>'+d.day+'</b><br>First emails: '+d.first+'<br>Follow-ups: '+d.followups);});r.addEventListener('mouseleave',hideTip);});})();
// today, coming up, system
(function(){var ul=document.getElementById('today');document.getElementById('todayHint').textContent=D.addedToday?D.addedToday+' new leads added today':'What happened today';
 ul.innerHTML=D.events.length?D.events.map(function(e){return '<li><time>'+esc(e.t)+'</time><div><b>'+esc(e.n)+'</b><div class="k">'+esc(e.k)+(e.p?' · '+esc(e.p):'')+'</div></div></li>';}).join(''):'<li class="empty" style="display:block">Nothing yet today.</li>';
 var c='';c+='<b style="font-size:13px">Follow-ups</b>'+(D.followList.length?'<ul class="tl" style="max-height:120px">'+D.followList.map(function(f){return '<li><time>'+esc(String(f.emailed).slice(5,10))+'</time><div>'+esc(f.n)+'<div class="k">'+(f.due?'due now':'emailed '+esc(f.emailed))+'</div></div></li>';}).join('')+'</ul>':'<div class="empty" style="padding:6px 0">None waiting.</div>');
 c+='<b style="font-size:13px;display:block;margin-top:10px">Next in queue</b>'+(D.queue.length?'<ul class="tl" style="max-height:120px">'+D.queue.map(function(q){return '<li><time>·</time><div>'+esc(q.n)+'<div class="k">'+esc(q.c||'')+' · '+esc(q.p)+'</div></div></li>';}).join('')+'</ul>':'<div class="empty" style="padding:6px 0">Queue empty: the next city is searched at 9 AM.</div>');
 document.getElementById('coming').innerHTML=c;
 var H=D.health||{};function row(k,v){return '<dt>'+k+'</dt><dd>'+v+'</dd>';}
 var ran=H.lastRun?'<span class="ok">●</span> '+esc(H.lastRun):'<span class="warn">● never</span>';
 document.getElementById('health').innerHTML=row('Last run',ran)+row('Triggers',H.triggers>=3?'<span class="ok">'+H.triggers+' active</span>':'<span class="warn">'+(H.triggers||0)+' (run setup)</span>')+
  row('Last lead search',esc(H.lastFind||'not yet'))+row('Next city',esc(H.nextCity||''))+row('Gmail sends left today',esc(H.gmailLeft))+
  row('Sending from',esc(D.settings.from||''))+row('Mode','<b>'+esc(D.settings.mode)+'</b>');})();
// pitch performance + speed insights
document.getElementById('pitches').innerHTML='<thead><tr><th>Pitch</th><th class="num">Emailed</th><th class="num">Replied</th><th class="num">Reply rate</th><th class="num">Calls</th><th class="num">Won</th></tr></thead><tbody>'+
 D.pitches.map(function(p){return '<tr style="cursor:default"><td>'+(p.pitch==='speed'?'Speed fix':'Website build')+'</td><td class="num">'+p.emailed+'</td><td class="num">'+p.replied+'</td><td class="num"><b>'+p.rate+'%</b></td><td class="num">'+p.calls+'</td><td class="num">'+p.won+'</td></tr>';}).join('')+'</tbody>';
(function(){var s=D.speed,el=document.getElementById('speedbox');if(!s.audited){el.innerHTML='<div class="empty">No audits yet.</div>';return;}
 var top=s.fixes.length?s.fixes[0][1]:1;
 el.innerHTML='<div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px"><div class="kpi"><b>'+s.audited+'</b><span>Sites audited</span></div><div class="kpi"><b>'+s.avg+' s</b><span>Average mobile load</span></div><div class="kpi"><b>'+Math.round(100*s.slow/s.audited)+'%</b><span>Slower than '+D.settings.threshold+' s</span></div></div>'+
  '<b style="font-size:13px">Most common problems</b><div class="fun" style="grid-template-columns:1fr 120px 30px;margin-top:8px">'+s.fixes.map(function(f){return '<span>'+esc(f[0])+'</span><div class="bar"><i style="width:'+Math.round(100*f[1]/top)+'%"></i></div><b>'+f[1]+'</b>';}).join('')+'</div>';})();
// funnel
(function(){var top=Math.max(1,D.funnel[0][1]);document.getElementById('funnel').innerHTML=D.funnel.map(function(f){
 return '<span>'+esc(f[0])+'</span><div class="bar"><i style="width:'+Math.max(f[1]?2:0,Math.round(100*f[1]/top))+'%"></i></div><b>'+f[1]+'</b>';}).join('');})();
// needs you
(function(){var list=D.replies.concat(D.calls_list);var el=document.getElementById('needs');
 if(!list.length){el.innerHTML='<div class="empty">Nothing waiting. New replies show up here (and in Gmail, starred).</div>';return;}
 el.innerHTML=list.map(function(c){return '<div class="item"><b>'+esc(c.name)+'</b> <span class="st '+esc(c.status)+'">'+esc(c.status.replace('_',' '))+'</span>'+
  '<div class="mute">'+esc([c.city,c.email,c.phone].filter(Boolean).join(' · '))+'</div>'+
  (c.reply?'<div class="msg them"><small>They replied · '+esc(c.replied_on||'')+'</small>'+esc(c.reply)+'</div>':'')+
  (c.sent?'<details style="margin-top:6px"><summary>What you sent</summary><div class="msg us"><small>You · '+esc(c.when||'')+'</small>'+esc(c.sent)+'</div></details>':'')+
  (c.fixes&&c.pitch!=='website'?'<div style="margin-top:6px"><b>Fixes to send:</b> '+esc(c.fixes)+'</div>':'')+
  '<div class="row"><button class="btn pri" onclick="openLead('+c.row+',true)">✉ Write reply</button>'+(c.gmail?'<a class="btn" target="_blank" href="'+esc(c.gmail)+'">Open in Gmail</a>':'')+
  (c.status==='replied'?'<button class="btn good" onclick="mark('+c.row+',\\'call_booked\\',this)">Call booked</button><button class="btn bad" onclick="mark('+c.row+',\\'lost\\',this)">Not interested</button>':
   '<button class="btn good" onclick="mark('+c.row+',\\'won\\',this)">Won 🎉</button><button class="btn bad" onclick="mark('+c.row+',\\'lost\\',this)">Lost</button>')+'</div></div>';}).join('');})();
// cities
document.getElementById('cities').innerHTML='<thead><tr><th>City</th><th class="num">Leads</th><th class="num">Website</th><th class="num">No site</th><th class="num">Emailed</th><th class="num">Replied</th></tr></thead><tbody>'+
 D.cities.map(function(c){return '<tr data-city="'+esc(c.city)+'"><td>'+esc(c.city)+'</td><td class="num">'+c.leads+'</td><td class="num">'+c.website+'</td><td class="num">'+c.noSite+'</td><td class="num">'+c.emailed+'</td><td class="num">'+c.replied+'</td></tr>';}).join('')+'</tbody>';
document.querySelectorAll('#cities tbody tr').forEach(function(tr){tr.onclick=function(){document.getElementById('city').value=tr.dataset.city;draw();document.getElementById('leads').scrollIntoView({behavior:'smooth'});};});
// leads table
var fStatus='all',sortKey='emailed',sortDir=-1;
var statuses=['all'].concat(Object.keys(D.byStatus).sort(function(a,b){return D.byStatus[b]-D.byStatus[a];}));
document.getElementById('city').innerHTML='<option value="">All cities</option>'+D.cities.map(function(c){return '<option>'+esc(c.city)+'</option>';}).join('');
function chips(){document.getElementById('chips').innerHTML=statuses.map(function(s){return '<button class="chip'+(s===fStatus?' on':'')+'" data-s="'+esc(s)+'">'+esc(s.replace('_',' '))+(s==='all'?'':' '+D.byStatus[s])+'</button>';}).join('');
 document.querySelectorAll('.chip').forEach(function(b){b.onclick=function(){fStatus=b.dataset.s;chips();draw();};});}
var cols=[['name','Clinic'],['city','City'],['status','Status'],['pitch','Pitch'],['speed','Speed'],['email','Email'],['phone','Phone'],['emailed','Emailed'],['replied','Replied']];
function draw(){var q=document.getElementById('q').value.toLowerCase(),city=document.getElementById('city').value;
 var rows=D.leads.filter(function(l){return (fStatus==='all'||l.status===fStatus)&&(!city||l.city===city)&&
  (!q||[l.name,l.email,l.phone,l.website,l.city].join(' ').toLowerCase().indexOf(q)>=0);});
 rows.sort(function(a,b){var x=String(a[sortKey]||''),y=String(b[sortKey]||'');if(sortKey==='speed'){x=parseFloat(x)||0;y=parseFloat(y)||0;return (x-y)*sortDir;}return x.localeCompare(y)*sortDir;});
 document.getElementById('leads').innerHTML='<thead><tr>'+cols.map(function(c){return '<th data-k="'+c[0]+'">'+c[1]+(sortKey===c[0]?(sortDir>0?' ▲':' ▼'):'')+'</th>';}).join('')+'</tr></thead><tbody>'+
  (rows.length?rows.slice(0,500).map(function(l){return '<tr data-row="'+l.row+'"><td><b>'+esc(l.name)+'</b><div class="mute" style="font-size:12px">'+esc(l.domain||'no website')+'</div></td><td>'+esc(l.city)+'</td><td><span class="st '+esc(l.status)+'">'+esc(l.status.replace('_',' '))+'</span></td><td>'+esc(l.pitch||'')+'</td><td>'+esc(l.speed||'')+'</td><td>'+esc(l.email||'')+'</td><td>'+esc(String(l.phone||'').split(';')[0])+'</td><td>'+esc(l.emailed||'')+'</td><td>'+esc(l.replied||'')+'</td></tr>';}).join(''):
  '<tr><td colspan="9" class="empty">No leads match.</td></tr>')+'</tbody>';
 document.querySelectorAll('#leads th').forEach(function(th){th.onclick=function(){if(sortKey===th.dataset.k)sortDir=-sortDir;else{sortKey=th.dataset.k;sortDir=1;}draw();};});
 document.querySelectorAll('#leads tbody tr[data-row]').forEach(function(tr){tr.onclick=function(){openLead(+tr.dataset.row);};});}
document.getElementById('q').oninput=draw;document.getElementById('city').onchange=draw;chips();draw();
// drawer
var dr=document.getElementById('drawer');
function openLead(row,focusCompose){var l=D.leads.filter(function(x){return x.row===row;})[0];if(!l)return;
 function f(k,v){return v?'<dt>'+k+'</dt><dd>'+v+'</dd>':'';}
 dr.innerHTML='<button class="btn" style="float:right" onclick="dr.classList.remove(\\'open\\')">Close ✕</button><h3>'+esc(l.name)+'</h3><span class="st '+esc(l.status)+'">'+esc(l.status.replace('_',' '))+'</span>'+
  '<dl>'+f('City',esc(l.city))+f('Website',l.website?'<a target="_blank" href="'+esc(l.website)+'">'+esc(l.domain)+'</a>':'')+f('Email',esc(l.email))+f('Phone',esc(l.phone))+f('Address',esc(l.address))+
  f('Pitch',esc(l.pitch))+f('Speed',l.speed?esc(l.speed)+(l.score?' · score '+esc(l.score)+'/100':'')+(l.lcp?' · LCP '+esc(l.lcp):''):'')+f('Fixes',esc(l.fixes))+
  f('Added',esc(l.added))+f('Emailed',esc(l.emailed))+f('Follow-up',esc(l.followup))+f('Replied',esc(l.replied))+f('Notes',esc(l.note))+'</dl>'+
  (l.reply?'<div class="msg them"><small>They replied · '+esc(l.replied)+'</small>'+esc(l.reply)+'</div>':'')+
  (l.sent?'<div class="msg us"><small>You sent · '+esc(l.emailed)+'</small>'+esc(l.sent)+'</div>':'')+
  '<div class="row">'+(l.gmail?'<a class="btn pri" target="_blank" href="'+esc(l.gmail)+'">Open in Gmail</a>':'')+(l.report?'<a class="btn" target="_blank" href="'+esc(l.report)+'">PageSpeed report</a>':'')+'</div>'+
  '<div class="row"><button class="btn good" onclick="mark('+l.row+',\\'call_booked\\',this)">Call booked</button><button class="btn good" onclick="mark('+l.row+',\\'won\\',this)">Won</button>'+
  '<button class="btn bad" onclick="mark('+l.row+',\\'lost\\',this)">Lost</button><button class="btn bad" onclick="mark('+l.row+',\\'opted_out\\',this)">Opted out</button></div>'+
  composer(l);
 dr.classList.add('open');wireComposer(l);
 if(focusCompose){var ta=document.getElementById('cBody');if(ta){ta.scrollIntoView({block:'center'});ta.focus();}}}
var TPL=[];
function composer(l){TPL=astraTemplates(l,D.tpl);var pick=astraPick(l,TPL);var inThread=!!l.reply;
 var subj=l.emailed?'Re: Question about '+l.name+"'s website":(l.domain?'Question about '+l.name+"'s website":'A website for '+l.name);
 return '<div class="compose"><h4>'+(inThread?'Reply to '+esc(l.name):'Send an email to '+esc(l.name))+'</h4>'+
  (l.answered?'<div class="note">You last wrote to them on '+esc(l.answered)+'.</div>':'')+
  '<label>To</label><input id="cTo" value="'+esc(l.email||'')+'" placeholder="doctor@clinic.com">'+
  (inThread?'':'<label>Subject</label><input id="cSubj" value="'+esc(subj)+'">')+
  '<label>Template</label><select id="cTpl">'+TPL.map(function(t,i){return '<option value="'+i+'"'+(i===pick?' selected':'')+'>'+esc(t.label)+'</option>';}).join('')+'</select>'+
  '<label>Message (edit anything before sending)</label><textarea id="cBody">'+esc(TPL[pick].body)+'</textarea>'+
  '<div class="row"><button class="btn pri" id="cSend">Send from '+esc(D.settings.from||'Gmail')+'</button></div>'+
  '<div class="note">'+(inThread?'Goes as a reply in the same Gmail thread.':'Goes as a new email.')+' Anything in [square brackets] must be filled in first.</div></div>';}
function wireComposer(l){var sel=document.getElementById('cTpl');if(!sel)return;
 sel.onchange=function(){var ta=document.getElementById('cBody');if(ta.dataset.edited&&!confirm('Replace your edits with this template?')){return;}ta.value=TPL[+sel.value].body;ta.dataset.edited='';};
 document.getElementById('cBody').oninput=function(){this.dataset.edited='1';};
 document.getElementById('cSend').onclick=function(){var b=this,to=document.getElementById('cTo').value.trim(),body=document.getElementById('cBody').value,
  sj=document.getElementById('cSubj');var hole=body.match(/\\[[^\\]]{2,40}\\]/);
  if(hole){alert('Fill in '+hole[0]+' first.');return;} if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(to)){alert('Add a valid email address.');return;}
  if(!confirm('Send this email to '+to+'?'))return;b.disabled=true;b.textContent='Sending…';
  google.script.run.withSuccessHandler(function(res){b.textContent='Sent ✓ '+res.at;l.answered=res.at;l.email=l.email||to;
    l.sent=(l.sent?l.sent+'\\n\\n':'')+'--- You · '+res.at+' ---\\n'+body;if(['new','no_website','no_email','fast','audit_failed','pasted'].indexOf(l.status)>=0){l.status='sent';l.emailed=l.emailed||res.at;}
    D.replies=D.replies.filter(function(x){return x.row!==l.row;});draw();})
   .withFailureHandler(function(e){b.disabled=false;b.textContent='Send';alert('Not sent: '+e.message);})
   .sendFromDashboard(l.row,to,sj?sj.value:'',body);};}
document.addEventListener('keydown',function(e){if(e.key==='Escape')dr.classList.remove('open');});
function mark(row,status,btn){btn.disabled=true;btn.textContent='Saving…';
 google.script.run.withSuccessHandler(function(){btn.textContent='Saved ✓';var l=D.leads.filter(function(x){return x.row===row;})[0];if(l)l.status=status;draw();})
  .withFailureHandler(function(e){btn.disabled=false;btn.textContent='Retry';alert('Could not save: '+e.message);}).markLead(row,status);}
var S=D.settings;document.getElementById('settings').innerHTML='Settings: mode <b>'+esc(S.mode)+'</b> · up to <b>'+S.perDay+'</b> emails/day, '+esc(S.hours)+' Mon–Fri · leads from <b>'+esc(S.source)+'</b> · follow-up after <b>'+S.followupDays+'</b> days · speed threshold <b>'+S.threshold+' s</b>';
</script></body></html>`;
}
