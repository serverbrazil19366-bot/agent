// Push alerts for Astra Leads.
//   GET  /api/vapid      → public key the app subscribes with (keys are created once and kept in Netlify Blobs)
//   POST /api/subscribe  { t, subscription }  → remembers this phone for the pairing token t
//   POST /api/notify     { t, title, body }   → sends a push to every phone paired with t (called by Apps Script)
// No secrets live in this repo: the token is made by your Apps Script, and only its SHA-256 is stored here.
import webpush from 'web-push';
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

let store = () => getStore('astra-leads-push');
export const _setStoreForTests = f => { store = f; };
const hash = t => createHash('sha256').update(String(t)).digest('hex');
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });

async function vapid() {
  const s = store();
  let keys = await s.get('vapid', { type: 'json' });
  if (!keys) { keys = webpush.generateVAPIDKeys(); await s.setJSON('vapid', keys); }
  return keys;
}

export default async (req) => {
  const route = new URL(req.url).pathname.split('/').pop();
  if (req.method === 'OPTIONS') return new Response(null, { headers: {
    'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST' } });

  if (route === 'vapid') return json({ publicKey: (await vapid()).publicKey });

  let data = {};
  try { data = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
  const t = String(data.t || '');
  if (t.length < 20) return json({ error: 'missing token' }, 401);
  const key = 'subs-' + hash(t);
  const s = store();

  if (route === 'subscribe') {
    const sub = data.subscription;
    if (!sub || !sub.endpoint || !/^https:\/\//.test(sub.endpoint)) return json({ error: 'bad subscription' }, 400);
    const list = (await s.get(key, { type: 'json' })) || [];
    const next = list.filter(x => x.endpoint !== sub.endpoint).concat([sub]).slice(-5);
    await s.setJSON(key, next);
    return json({ ok: true, devices: next.length });
  }

  if (route === 'notify') {
    const list = (await s.get(key, { type: 'json' })) || [];
    if (!list.length) return json({ ok: false, error: 'no paired phone yet' }, 404);
    const keys = await vapid();
    webpush.setVapidDetails('https://astranexora.netlify.app', keys.publicKey, keys.privateKey);
    const payload = JSON.stringify({ title: String(data.title || 'Astra Leads').slice(0, 120),
      body: String(data.body || '').slice(0, 300), tag: String(data.tag || 'reply') });
    const keep = [];
    let sent = 0;
    for (const sub of list) {
      try { await webpush.sendNotification(sub, payload, { TTL: 86400, urgency: 'high' }); keep.push(sub); sent++; }
      catch (e) { if (e.statusCode !== 404 && e.statusCode !== 410) keep.push(sub); }
    }
    if (keep.length !== list.length) await s.setJSON(key, keep);
    return json({ ok: sent > 0, sent });
  }
  return json({ error: 'not found' }, 404);
};

export const config = { path: ['/api/vapid', '/api/subscribe', '/api/notify'] };
