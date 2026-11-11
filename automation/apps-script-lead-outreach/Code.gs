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
  OSM_TAGS: ['amenity=dentist', 'healthcare=dentist'],
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
  NTFY_TOPIC: '',            // phone alerts for replies via the free ntfy app; '' = setup makes a private one
  WHATSAPP_LINKS: false,     // true = also make one-click wa.me links in the sheet
  WEBSITE_PITCH: true,       // clinics with NO website: email a "let me build your website" pitch (if they have an email)

  SENDER_NAME: 'S. Saktheeswaran',
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
  'sent_text', 'reply_text', 'replied_on'];
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
  const topic = ntfyTopic_();
  console.log('Phone alerts: install the free "ntfy" app and subscribe to this topic: ' + topic);
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
  props.setProperty('areaIndex', String(idx + 1));

  let found, label;
  if (CONFIG.LEAD_SOURCE === 'places') {
    const area = CONFIG.AREAS[idx % CONFIG.AREAS.length];
    label = area;
    found = searchPlaces_(CONFIG.BUSINESS_TYPE + ' in ' + area)
      .filter(p => !p.businessStatus || p.businessStatus === 'OPERATIONAL')
      .map(p => ({ id: p.id, name: (p.displayName && p.displayName.text) || '', website: p.websiteUri || '',
        phone: p.nationalPhoneNumber || '', address: p.formattedAddress || '', rating: p.rating || '',
        email: '', city: area.split(',').pop().trim() }));
  } else {
    const city = CONFIG.OSM_CITIES[idx % CONFIG.OSM_CITIES.length];
    label = city.name + ' (OpenStreetMap)';
    found = osmToLeads(searchOsm_(city.bbox).elements || [], city.name);
  }

  const added = addLeads_(found, 'source: ' + label);
  const msg = 'Find leads: ' + label + ' → ' + found.length + ' found, ' + added + ' new';
  log_(msg);
  if (manual) { try { SpreadsheetApp.getActive().toast(msg, 'Astra Outreach', 10); } catch (e) {} }
}

/** Appends leads that aren't in the sheet yet (by place id or website domain). Returns how many. */
function addLeads_(leads, note) {
  const sh = sheet_();
  const rows = readRows_(sh);
  const seenPlaces = new Set(rows.map(r => r.place_id).filter(String));
  const seenDomains = new Set(rows.map(r => r.domain).filter(String));
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
      email: p.email, email_found_on: p.email ? 'OpenStreetMap' : '', note: n, city: p.city,
    }));
  });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, COLS.length).setValues(add);
  return add.length;
}

function searchOsm_(bbox) {
  const parts = CONFIG.OSM_TAGS.map(t => { const kv = t.split('='); return 'nwr["' + kv[0] + '"="' + kv[1] + '"](' + bbox + ');'; });
  const query = '[out:json][timeout:90];(' + parts.join('') + ');out tags center;';
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

function deliver_(r, mail, contacted) {
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
  const html =
    '<p>' + esc_(cfg.GREETING) + ',</p>' +
    "<p>I ran " + esc_(name) + "'s website through Google's mobile speed test today. On a typical phone connection, " +
    'it takes about <b>' + esc_(secs) + ' seconds</b> before the page shows up.</p>' +
    '<p>Most patients search "dentist near me" on their phone and tap the first two or three clinics. ' +
    "Google's own research found that more than half of mobile visitors leave if a page takes over 3 seconds, " +
    'so some of those patients go straight back and pick the next clinic.</p>' +
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
  if (r.pitch === 'website') {
    return { subject: 'Re: A website for ' + name, html:
      '<p>' + esc_(cfg.GREETING) + ',</p>' +
      '<p>Just checking you saw my note about a website for ' + esc_(name) + '. I\'m happy to put together a free ' +
      'sample design so you can see how it would look. Reply "yes" and I\'ll send it.</p>' +
      '<p>' + esc_(cfg.SENDER_NAME) + '<br>Astra Nexora' +
      (cfg.PORTFOLIO_URL ? '<br>Projects: ' + cfg.PORTFOLIO_URL.replace(/^https?:\/\//, '') : '') +
      (cfg.PERSONAL_SITE ? '<br>Portfolio: ' + cfg.PERSONAL_SITE.replace(/^https?:\/\//, '') : '') + '</p>' };
  }
  const subject = 'Re: Question about ' + name + "'s website";
  const html =
    '<p>' + esc_(cfg.GREETING) + ',</p>' +
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
  const html =
    '<p>' + esc_(cfg.GREETING) + ',</p>' +
    '<p>I came across ' + esc_(name) + ' while looking at dental clinics in ' + esc_(city) +
    ", and noticed it doesn't have a website yet.</p>" +
    '<p>Most patients now check a clinic online before they call. Without a website they only see a name and a ' +
    'phone number, and many choose a clinic they can learn more about: the doctor, the treatments, photos and reviews.</p>' +
    '<p>I build simple, fast websites for clinics, with WhatsApp booking, Google Maps directions and treatment pages, ' +
    'so new patients can find and trust you before they call.</p>' +
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
  const who = 'Hello Doctor, I\'m ' + cfg.SENDER_NAME.replace(/^S\.\s*/, '') + ' from Astra Nexora, ' + cfg.AGENCY_LOCATION + '. ';
  const work = cfg.PORTFOLIO_URL ? ' You can see my work here: ' + cfg.PORTFOLIO_URL : '';
  if (r.pitch === 'website' || !r.website) {
    return who + 'I noticed ' + name + " doesn't have a website yet. I build simple clinic websites with WhatsApp " +
      'booking and Google Maps, so new patients can find and trust you before they call. ' +
      'Shall I share a free sample design for ' + name + '?' + work;
  }
  return who + 'I emailed you about ' + name + "'s website taking about " +
    String(r.speed_index || '').replace(/\s*s$/, '') + ' seconds to load on mobile, which loses patients who search on ' +
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
  const watch = {};
  rows.forEach(r => {
    if ((r.status !== 'sent' && r.status !== 'followed_up') || !r.thread_ids) return;
    String(r.thread_ids).split(',').forEach(id => { if (id) watch[id] = r; });
  });
  if (!Object.keys(watch).length) return;
  const me = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  const threads = GmailApp.search('newer_than:4d -from:me', 0, 100);
  threads.forEach(t => {
    const r = watch[t.getId()];
    if (!r || (r.status !== 'sent' && r.status !== 'followed_up')) return;
    const msgs = t.getMessages();
    const ours = msgs.filter(m => me && m.getFrom().toLowerCase().indexOf(me) >= 0);
    const theirs = msgs.filter(m => ours.indexOf(m) < 0);
    if (!theirs.length) return;
    const last = theirs[theirs.length - 1];
    const bounced = /mailer-daemon|postmaster/i.test(last.getFrom());
    r.status = bounced ? 'bounced' : 'replied';
    r.replied_on = Utilities.formatDate(last.getDate(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
    r.reply_text = stripQuoted(last.getPlainBody()).slice(0, 3000);
    if (!r.sent_text && ours.length) r.sent_text = stripQuoted(ours[0].getPlainBody()).slice(0, 3000);
    r.note = appendNote_(r.note, r.status + ' ' + today_());
    writeRow_(sh, r);
    if (!bounced) notify_('Reply from ' + (r.business_name || r.domain),
      (r.city ? r.city + ' · ' : '') + 'Tap to read it in your dashboard.', t.getId());
  });
}

function ntfyTopic_() {
  if (CONFIG.NTFY_TOPIC) return CONFIG.NTFY_TOPIC;
  const props = PropertiesService.getScriptProperties();
  let t = props.getProperty('ntfyTopic');
  if (!t) { t = 'astra-' + Utilities.getUuid().replace(/-/g, '').slice(0, 16); props.setProperty('ntfyTopic', t); }
  return t;
}

/** Push notification to your phone through ntfy.sh (free app, no account). */
function notify_(title, message, threadId) {
  let click = '';
  try { click = ScriptApp.getService().getUrl() || ''; } catch (e) {}
  if (!click && threadId) click = 'https://mail.google.com/mail/#all/' + threadId;
  try {
    UrlFetchApp.fetch('https://ntfy.sh/', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ topic: ntfyTopic_(), title: title, message: message, tags: ['bell'], priority: 4, click: click }) });
  } catch (e) { console.log('notify failed: ' + e.message); }
}

/** Run once from the editor to check that alerts reach your phone. */
function testNotification() {
  notify_('Astra Outreach test', 'Phone alerts are working. Topic: ' + ntfyTopic_(), '');
  console.log('Sent a test alert to topic ' + ntfyTopic_());
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

/** Overpass (OpenStreetMap) elements → lead objects. */
function osmToLeads(elements, city) {
  return elements.filter(e => e.tags && e.tags.name).map(e => {
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
    };
  });
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
// Deploy → New deployment → Web app → Execute as: Me, Who has access: Only myself.
// Open the URL on your phone and "Add to Home Screen". Same Google account as the sheet.

function doGet() {
  return HtmlService.createHtmlOutput(dashboardHtml_(dashboardData_()))
    .setTitle('Astra Leads')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
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
  try { me = Session.getActiveUser().getEmail(); } catch (e) {}
  return summarize(rows, today_(), me, CONFIG.EMAILS_PER_DAY);
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
    sent: r.sent_text, reply: r.reply_text, replied_on: r.replied_on });
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
    replies: rows.filter(r => r.status === 'replied').sort(byReply).map(card),
    calls_list: rows.filter(r => r.status === 'call_booked').sort(byReply).map(card),
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
.counts{display:grid;grid-template-columns:1fr auto;gap:6px 12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}
</style></head><body>
<header><h1>Astra Leads</h1><p id="sub"></p></header>
<div class="stats" id="stats"></div>
<nav id="tabs"></nav>
<section id="list"></section>
<script>
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
    if (cur==='replies') h += '<button class="btn good" onclick="mark('+c.row+',\\'call_booked\\','+i+')">Call booked</button>'+
      '<button class="btn bad" onclick="mark('+c.row+',\\'lost\\','+i+')">Not interested</button>';
    if (cur==='calls') h += '<button class="btn good" onclick="mark('+c.row+',\\'won\\','+i+')">Won 🎉</button>'+
      '<button class="btn bad" onclick="mark('+c.row+',\\'lost\\','+i+')">Lost</button>';
    return h+'</div></div>';
  }).join('');
}
function mark(row,status,i){ var el=document.getElementById('it'+cur+i); if(el) el.className+=' done';
  google.script.run.withFailureHandler(function(e){alert('Could not save: '+e.message);}).markLead(row,status); }
render();
</script></body></html>`;
}
