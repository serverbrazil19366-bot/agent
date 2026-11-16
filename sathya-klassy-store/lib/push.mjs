// Phone notifications for the admin app (Web Push, free, no third-party app).
// The signing keys (VAPID) are created once and kept in the site's private
// storage, or taken from VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY if set.
// Each phone that turns on alerts is saved under push/<hash>.
import crypto from 'node:crypto';
import * as webpush from 'web-push';

let ready;
async function vapid(store) {
  if (ready) return ready;
  let keys = process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
    ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
    : await store.getJSON('meta/vapid');
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    await store.setJSON('meta/vapid', keys);
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@sathyaklassy.invalid', keys.publicKey, keys.privateKey);
  ready = keys;
  return keys;
}

export async function publicKey(store) {
  return (await vapid(store)).publicKey;
}

const subKey = (endpoint) => 'push/' + crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 32);

export function validSubscription(s) {
  return s && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1000
    && s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string'
    && s.keys.p256dh.length < 200 && s.keys.auth.length < 100;
}

export async function addDevice(store, sub, label) {
  const key = subKey(sub.endpoint);
  await store.setJSON(key, { sub: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, label: String(label || 'Phone').slice(0, 60), at: new Date().toISOString() });
  return key.slice(5);
}

export async function listDevices(store) {
  const out = [];
  for (const k of await store.list('push/')) {
    const d = await store.getJSON(k);
    if (d) out.push({ id: k.slice(5), label: d.label, at: d.at });
  }
  return out;
}

export async function removeDevice(store, id) {
  if (/^[a-f0-9]{32}$/.test(id)) await store.delete('push/' + id);
}

// payload: { title, body, url, tag }. Returns how many phones got it.
export async function pushAll(store, payload) {
  await vapid(store);
  let sent = 0;
  for (const k of await store.list('push/')) {
    const d = await store.getJSON(k);
    if (!d) continue;
    try {
      await webpush.sendNotification(d.sub, JSON.stringify(payload), { TTL: 24 * 3600, urgency: 'high', timeout: 5000 });
      sent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await store.delete(k); // phone unsubscribed or app removed
      else console.error('push failed', e.statusCode || e.message);
    }
  }
  return sent;
}
