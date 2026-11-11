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

  // false = no card needed: you paste leads into the sheet (business_name + website)
  //         and everything else is automatic.
  // true  = also search Google Places automatically every morning (needs a billing
  //         account on the Cloud project + "Places API (New)" enabled on the key).
  USE_PLACES: false,

  // One area is searched per day, in rotation. Places returns at most 60
  // results per search, so several small areas give far more leads than one city.
  BUSINESS_TYPE: 'Dental clinic',
  AREAS: [
    'T. Nagar, Chennai', 'Adyar, Chennai', 'Anna Nagar, Chennai', 'Velachery, Chennai',
    'Mylapore, Chennai', 'Tambaram, Chennai', 'Porur, Chennai', 'Nungambakkam, Chennai',
    'Kodambakkam, Chennai', 'Ashok Nagar, Chennai', 'Chromepet, Chennai', 'OMR, Chennai',
    'Perambur, Chennai', 'Vadapalani, Chennai', 'Besant Nagar, Chennai', 'Guindy, Chennai',
  ],
  CITY_FOR_EMAIL: 'Chennai',

  EMAILS_PER_DAY: 20,        // hard cap; consumer Gmail allows 100 recipients/day
  SPEED_THRESHOLD_S: 3,      // only email sites slower than this (Speed Index, mobile)
  SEND_MODE: 'draft',        // 'draft' = Gmail drafts for you to review. Change to 'send' when happy.
  WORK_HOURS: [10, 18],      // IST; emails only go out inside these hours, Mon–Fri
  GREETING: 'Hi Doctor',     // the website rarely shows the owner's name, so keep it general

  SENDER_NAME: 'S. Saktheeswaran',
  AGENCY_SITE: 'https://astranexora.netlify.app',
  PERSONAL_SITE: 'https://saktheeswaran.netlify.app',
};

const SHEET = 'Leads';
const COLS = ['added_on', 'status', 'business_name', 'website', 'domain', 'phone', 'address',
  'rating', 'place_id', 'speed_index', 'perf_score', 'lcp', 'email', 'email_found_on',
  'contacted_on', 'note'];
// status: (empty = just pasted) | new | duplicate | no_website | fast | audit_failed | no_email | drafted | sent | opted_out | replied

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
  if (CONFIG.USE_PLACES) ScriptApp.newTrigger('findLeads').timeBased().everyDays(1).atHour(9).create();
  ScriptApp.newTrigger('processNext').timeBased().everyMinutes(10).create();
  SpreadsheetApp.getUi().alert('Setup done. ' + (CONFIG.USE_PLACES ? 'Leads are searched daily around 9 AM; ' :
    'Paste leads (business_name + website) into the Leads tab; ') +
    'emails go out every 10 min between ' + CONFIG.WORK_HOURS.join(':00–') + ':00, Mon–Fri. ' +
    'Mode: ' + CONFIG.SEND_MODE.toUpperCase());
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Astra Outreach')
    .addItem('Find leads now', 'findLeadsNow')
    .addItem('Process next lead now', 'processNextNow')
    .addSeparator()
    .addItem('Setup / reset triggers', 'setup')
    .addToUi();
}
function findLeadsNow() {
  if (!CONFIG.USE_PLACES) {
    SpreadsheetApp.getUi().alert('USE_PLACES is false. Paste leads into the Leads tab: business_name in column C, website in column D. Leave status empty.');
    return;
  }
  findLeads(true);
}
function processNextNow() { processNext(true); }

// ───────────────────────────── 1. find leads ─────────────────────────────

function findLeads(manual) {
  if (!manual && isWeekend_()) return;
  const props = PropertiesService.getScriptProperties();
  const idx = Number(props.getProperty('areaIndex') || 0);
  const area = CONFIG.AREAS[idx % CONFIG.AREAS.length];
  props.setProperty('areaIndex', String(idx + 1));

  const sh = sheet_();
  const rows = readRows_(sh);
  const seenPlaces = new Set(rows.map(r => r.place_id).filter(String));
  const seenDomains = new Set(rows.map(r => r.domain).filter(String));

  const places = searchPlaces_(CONFIG.BUSINESS_TYPE + ' in ' + area);
  const now = today_();
  const add = [];
  places.forEach(p => {
    if (!p.id || seenPlaces.has(p.id)) return;
    if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') return;
    let website = (p.websiteUri || '').trim();
    let domain = toDomain(website);
    let note = 'area: ' + area;
    if (website && !isRealSite(domain)) { note += '; listed link is ' + domain; website = ''; domain = ''; }
    if (domain && seenDomains.has(domain)) return;
    if (domain) seenDomains.add(domain);
    seenPlaces.add(p.id);
    add.push(rowFrom_({
      added_on: now, status: domain ? 'new' : 'no_website',
      business_name: (p.displayName && p.displayName.text) || '',
      website, domain, phone: p.nationalPhoneNumber || '', address: p.formattedAddress || '',
      rating: p.rating || '', place_id: p.id, note,
    }));
  });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, COLS.length).setValues(add);
  log_('findLeads: ' + area + ' → ' + places.length + ' found, ' + add.length + ' new');
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
    if (!manual && (isWeekend_() || !inWorkHours_())) return;
    const started = Date.now();
    const sh = sheet_();
    const rows = readRows_(sh);
    const today = today_();
    const doneToday = rows.filter(r => String(r.contacted_on).indexOf(today) === 0).length;
    if (doneToday >= CONFIG.EMAILS_PER_DAY) return;
    if (CONFIG.SEND_MODE === 'send' && MailApp.getRemainingDailyQuota() < 1) return;
    prepareManualRows_(sh, rows);
    const contacted = new Set(rows.filter(r => r.email && ['sent', 'drafted', 'opted_out', 'replied'].indexOf(r.status) >= 0)
      .map(r => String(r.email).toLowerCase()));

    // Work through 'new' rows until one email goes out or ~4 min pass (limit is 6).
    for (const r of rows) {
      if (r.status !== 'new') continue;
      if (Date.now() - started > 4 * 60 * 1000) break;
      const contactedNow = handleLead_(r, contacted);
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
  if (audit.speedIndexS <= CONFIG.SPEED_THRESHOLD_S) { r.status = 'fast'; return false; }

  const found = findEmailOnSite_(r.website, r.domain);
  if (!found) { r.status = 'no_email'; return false; }
  if (contacted.has(found.email.toLowerCase())) { r.status = 'no_email'; r.note = appendNote_(r.note, 'email already contacted via another listing'); return false; }
  r.email = found.email; r.email_found_on = found.page;

  const mail = buildEmail_(r);
  if (CONFIG.SEND_MODE === 'send') {
    GmailApp.sendEmail(r.email, mail.subject, mail.text, { htmlBody: mail.html, name: CONFIG.SENDER_NAME });
    r.status = 'sent';
  } else {
    GmailApp.createDraft(r.email, mail.subject, mail.text, { htmlBody: mail.html, name: CONFIG.SENDER_NAME });
    r.status = 'drafted';
  }
  r.contacted_on = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
  contacted.add(r.email.toLowerCase());
  return true;
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
  const callDay = callDay_();
  const subject = 'Quick fix for ' + r.business_name + "'s mobile conversion drop?";
  const html =
    '<p>' + esc_(CONFIG.GREETING) + ',</p>' +
    '<p>I was reviewing a few local clinics in ' + esc_(CONFIG.CITY_FOR_EMAIL) + ' and looked at your website (' + esc_(r.domain) + ').</p>' +
    "<p>I ran Google's own Lighthouse performance test on it, on mobile. Your page takes <strong>" + esc_(r.speed_index) +
    '</strong> to visibly load (Speed Index), and its mobile performance score is <strong>' + esc_(r.perf_score) + '/100</strong>. ' +
    'Anything above 3 seconds usually means a big share of mobile visitors leave before they see your page, which also wastes your local SEO effort.</p>' +
    '<p>I run <strong>Astra Nexora</strong>, a conversion optimisation and automation agency here in Tamil Nadu. ' +
    'We fix exactly these technical leaks without big-agency budgets.</p>' +
    "<p>I've written down a 2-step fix for this speed problem. Are you open to a quick 10-minute call on " + callDay + ' to go through it?</p>' +
    '<p>Best regards,<br><strong>' + esc_(CONFIG.SENDER_NAME) + '</strong><br>Founder &amp; CEO, Astra Nexora<br>' +
    '<a href="' + CONFIG.AGENCY_SITE + '">' + CONFIG.AGENCY_SITE.replace(/^https?:\/\//, '') + '</a> · ' +
    '<a href="' + CONFIG.PERSONAL_SITE + '">' + CONFIG.PERSONAL_SITE.replace(/^https?:\/\//, '') + '</a></p>' +
    '<p style="color:#888;font-size:12px">You can check the result yourself at pagespeed.web.dev. ' +
    'If this isn\'t useful, just reply "no" and I won\'t email again.</p>';
  const text = html.replace(/<br>/g, '\n').replace(/<\/p>/g, '\n\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
  return { subject, html, text };
}

// ─────────────────────── pure helpers (unit-tested) ───────────────────────

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
