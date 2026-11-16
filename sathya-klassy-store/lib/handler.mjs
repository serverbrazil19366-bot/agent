// All /api/* routes for the shop. Used by the Netlify function and by the
// local dev server, so both behave the same.
//
// Payment flow (no gateway, no fees):
// 1. Customer places an order → status "awaiting_payment" with a unique
//    amount (₹307.14: the paise identify the order) and 10 minutes to pay.
// 2. Sathya's bank sends her a "credited" SMS. A forwarder app on her phone
//    posts only that SMS to /api/payments/sms with a secret key.
// 3. We match the exact amount (+ UTR) to the waiting order and only then
//    mark it "confirmed" — the customer sees "Order placed" only now.

import crypto from 'node:crypto';
import { getStore } from './store.mjs';
import { CATEGORIES, DEFAULT_SETTINGS, SAMPLE_PRODUCTS } from './seed.mjs';
import { parseBankSms, rupees } from './payments.mjs';
import { publicKey, validSubscription, addDevice, listDevices, removeDevice, pushAll } from './push.mjs';

const STATUSES = ['awaiting_payment', 'payment_check', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'expired'];
const UNPAID = new Set(['awaiting_payment', 'expired']);
const PAY_WINDOW_MS = 10 * 60 * 1000;
const LATE_WINDOW_MS = 24 * 3600 * 1000; // a late payment can still revive an expired order
const IST_OFFSET = 330 * 60 * 1000;

// ---------- helpers ----------
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
const fail = (status, error) => json({ error }, status);

const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max);
const money = (v) => Math.max(0, Math.round(Number(v) || 0));
const intOrNull = (v) => (v === '' || v === null || v === undefined ? null : Math.max(0, Math.round(Number(v) || 0)));
const phone10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);
const slugify = (s) => clean(s, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
const newId = (n = 10) => crypto.randomBytes(n).toString('hex').slice(0, n);
const istDay = (iso) => new Date(new Date(iso).getTime() + IST_OFFSET).toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const sameSecret = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

async function readBody(req, limit = 6_000_000) {
  const text = await req.text();
  if (text.length > limit) throw Object.assign(new Error('Request too large'), { status: 413 });
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error('Invalid request'), { status: 400 }); }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

// ---------- rate limits (stored, so they hold across server instances) ----------
function clientKey(req) {
  const ip = req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  return crypto.createHash('sha256').update('sk-ip:' + ip).digest('hex').slice(0, 20); // never store the raw IP
}
async function limit(store, req, bucket, max, windowSec) {
  const slot = Math.floor(Date.now() / (windowSec * 1000));
  const key = `rl/${bucket}/${clientKey(req)}-${slot}`;
  const n = ((await store.getJSON(key))?.n || 0) + 1;
  await store.setJSON(key, { n, until: (slot + 1) * windowSec * 1000 });
  if (n > max) throw Object.assign(new Error('Too many tries. Please wait a few minutes and try again.'), { status: 429 });
}

// ---------- phone notifications for the admin app (Web Push) ----------
// Only a short summary goes in the notification (no phone number, no address);
// full details stay inside the password-protected admin.
async function notify(store, title, body, url = '/admin/#orders', tag) {
  try { return await pushAll(store, { title, body, url, tag }); } catch (e) { console.error(e); return 0; }
}
const orderLine = (o) => o.items.map((i) => `${i.name} × ${i.qty}`).join(', ');

// ---------- admin auth ----------
const MIN_PASSWORD = 10;
function secret() {
  const s = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD;
  return s ? 'sk-admin:' + s : null;
}
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
function makeToken() {
  const exp = String(Date.now() + 3 * 24 * 3600 * 1000);
  return exp + '.' + sign(exp);
}
function validToken(req) {
  if (!secret()) return false;
  const h = req.headers.get('authorization') || '';
  const [exp, sig] = (h.startsWith('Bearer ') ? h.slice(7) : '').split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(exp)), got = Buffer.from(sig);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

// ---------- data access ----------
async function getSettings(store) {
  return { ...DEFAULT_SETTINGS, ...((await store.getJSON('settings')) || {}) };
}

async function allProducts(store) {
  let keys = await store.list('products/');
  if (!keys.length && !(await store.getJSON('meta/seeded'))) {
    const now = nowIso();
    await Promise.all(SAMPLE_PRODUCTS.map((p, i) => {
      const id = newId(8);
      return store.setJSON('products/' + id, {
        id, slug: slugify(p.name) + '-' + id.slice(0, 4), active: true,
        createdAt: new Date(Date.parse(now) - i * 1000).toISOString(), ...p,
      });
    }));
    await store.setJSON('meta/seeded', { at: now });
    keys = await store.list('products/');
  }
  const list = (await mapLimit(keys, 8, (k) => store.getJSON(k))).filter(Boolean);
  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

async function allOrders(store) {
  await sweep(store);
  const keys = await store.list('orders/');
  const list = (await mapLimit(keys, 10, (k) => store.getJSON(k))).filter(Boolean);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function changeStock(store, items, sign) {
  for (const i of items) {
    const p = await store.getJSON('products/' + i.productId);
    if (p && p.stock !== null && p.stock !== undefined) await store.setJSON('products/' + p.id, { ...p, stock: Math.max(0, p.stock + sign * i.qty) });
  }
}

// Orders waiting for money are indexed under pending/<id> (and late/<id> after
// the 10 minutes run out) so matching a payment never scans every order.
async function sweep(store) {
  const now = Date.now();
  for (const key of await store.list('pending/')) {
    const p = await store.getJSON(key);
    if (!p || p.expiresAt > now) continue;
    const id = key.slice(8);
    const o = await store.getJSON('orders/' + id);
    await store.delete(key);
    if (o && o.status === 'awaiting_payment') {
      o.status = 'expired';
      o.history.push({ status: 'expired', at: nowIso(), note: 'No payment in 10 minutes' });
      await store.setJSON('orders/' + id, o);
      await changeStock(store, o.items, +1);
      await store.setJSON('late/' + id, { payablePaise: p.payablePaise, until: now + LATE_WINDOW_MS });
    }
  }
  for (const key of await store.list('late/')) {
    const l = await store.getJSON(key);
    if (!l || l.until < now) await store.delete(key);
  }
}

const publicProduct = ({ cost, ...p }) => p;
const publicSettings = (s) => ({
  shopName: s.shopName, tagline: s.tagline, announcement: s.announcement,
  upiId: s.upiId, upiName: s.upiName, whatsapp: s.whatsapp, instagram: s.instagram, email: s.email,
  shippingFee: s.shippingFee, freeShippingAbove: s.freeShippingAbove,
  dispatchDays: s.dispatchDays, deliveryDays: s.deliveryDays,
});

function productFromInput(input, existing = {}) {
  const name = clean(input.name ?? existing.name, 120);
  if (!name) throw Object.assign(new Error('Product name is required'), { status: 400 });
  const category = CATEGORIES.some((c) => c.slug === input.category) ? input.category : existing.category || CATEGORIES[0].slug;
  const price = money(input.price ?? existing.price);
  if (!price) throw Object.assign(new Error('Price must be more than ₹0'), { status: 400 });
  const images = Array.isArray(input.images ?? existing.images)
    ? (input.images ?? existing.images).filter((u) => typeof u === 'string' && /^(\/api\/img\/[a-z0-9]+|\/assets\/products\/[a-z0-9-]+\.webp)$/.test(u)).slice(0, 8)
    : [];
  return {
    ...existing, name, category, price,
    mrp: intOrNull(input.mrp ?? existing.mrp),
    cost: intOrNull(input.cost ?? existing.cost),
    stock: intOrNull(input.stock ?? existing.stock),
    tag: clean(input.tag ?? existing.tag, 20).toUpperCase(),
    description: clean(input.description ?? existing.description, 2000),
    images,
    active: input.active === undefined ? existing.active ?? true : Boolean(input.active),
    featured: input.featured === undefined ? Boolean(existing.featured) : Boolean(input.featured),
    sample: input.sample === undefined ? Boolean(existing.sample) && !input.name : false,
    updatedAt: nowIso(),
  };
}

function customerView(o) {
  return {
    id: o.id, createdAt: o.createdAt, status: o.status, history: o.history,
    items: o.items.map(({ cost, ...i }) => i), subtotal: o.subtotal, shipping: o.shipping, total: o.total,
    payable: o.payment.payable, expiresAt: o.payment.expiresAt,
    name: o.customer.name.split(' ')[0], city: o.customer.city,
    courier: o.courier, awb: o.awb, trackingUrl: o.trackingUrl,
    paid: o.payment.verified,
  };
}

// ---------- public: orders ----------
async function createOrder(req, store) {
  await limit(store, req, 'order', 8, 600);
  const body = await readBody(req, 50_000);
  if (body.website) return fail(400, 'Could not place order'); // bot trap
  const c = body.customer || {};
  const customer = {
    name: clean(c.name, 80), phone: phone10(c.phone), email: clean(c.email, 120),
    address: clean(c.address, 400), city: clean(c.city, 60), state: clean(c.state, 60),
    pincode: String(c.pincode ?? '').replace(/\D/g, '').slice(0, 6),
  };
  if (!customer.name) return fail(400, 'Please enter your name');
  if (!/^[6-9]\d{9}$/.test(customer.phone)) return fail(400, 'Please enter a valid 10-digit mobile number');
  if (!customer.address || !customer.city || !customer.state) return fail(400, 'Please enter your full address');
  if (!/^[1-9]\d{5}$/.test(customer.pincode)) return fail(400, 'Please enter a valid 6-digit pincode');
  const settings = await getSettings(store);
  if (!settings.upiId) return fail(503, 'Online payment is not set up yet. Please order on WhatsApp.');

  const wanted = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!wanted.length) return fail(400, 'Your cart is empty');
  await sweep(store);
  const products = await allProducts(store);
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = [];
  for (const w of wanted) {
    const p = byId.get(String(w.id));
    const qty = Math.min(20, Math.max(1, Math.round(Number(w.qty) || 1)));
    if (!p || !p.active) return fail(409, 'One of the items is no longer available. Please refresh your cart.');
    if (p.stock !== null && p.stock !== undefined && p.stock < qty)
      return fail(409, p.stock > 0 ? `Only ${p.stock} left of "${p.name}"` : `"${p.name}" is out of stock`);
    items.push({ productId: p.id, name: p.name, price: p.price, cost: p.cost ?? null, qty, image: p.images?.[0] || null });
  }
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingFee;
  const total = subtotal + shipping;
  if (body.expectedTotal !== undefined && money(body.expectedTotal) !== total)
    return fail(409, 'Prices changed since you opened the page. Please check your cart.');

  // unique paise so the bank SMS points to exactly one order
  const taken = new Set();
  for (const k of [...(await store.list('pending/')), ...(await store.list('late/'))]) taken.add((await store.getJSON(k))?.payablePaise);
  const free = Array.from({ length: 99 }, (_, i) => total * 100 + i + 1).filter((p) => !taken.has(p));
  if (!free.length) return fail(503, 'Many people are paying right now. Please try again in a minute.');
  const payablePaise = free[crypto.randomInt(free.length)];

  let id;
  for (let tries = 0; tries < 6; tries++) {
    id = 'SK' + istDay(nowIso()).slice(2).replace(/-/g, '') + String(crypto.randomInt(1000, 10000));
    if (!(await store.getJSON('orders/' + id))) break;
  }
  const now = nowIso();
  const expiresAt = Date.now() + PAY_WINDOW_MS;
  const accessKey = newId(24);
  const order = {
    id, createdAt: now, customer, items, subtotal, shipping, total, note: clean(body.note, 300),
    payment: { method: 'upi', payable: rupees(payablePaise), payablePaise, expiresAt, utr: '', verified: false, source: '' },
    accessKey, status: 'awaiting_payment', history: [{ status: 'awaiting_payment', at: now }],
    courier: '', awb: '', trackingUrl: '',
  };
  await store.setJSON('orders/' + id, order);
  await store.setJSON('pending/' + id, { payablePaise, expiresAt });
  await changeStock(store, items, -1); // held for 10 minutes
  return json({ order: customerView(order), key: accessKey, upi: { id: settings.upiId, name: settings.upiName || settings.shopName } }, 201);
}

async function orderForCustomer(store, id, key) {
  if (!/^SK\d{10}$/.test(id) || !/^[a-f0-9]{24}$/.test(String(key || ''))) return null;
  const o = await store.getJSON('orders/' + id);
  return o && o.accessKey && sameSecret(o.accessKey, key) ? o : null;
}

async function orderStatus(req, url, store, id) {
  await limit(store, req, 'poll', 400, 600);
  if (Math.random() < 0.25) await sweep(store);
  const o = await orderForCustomer(store, id, url.searchParams.get('k'));
  if (!o) return fail(404, 'Order not found');
  if (o.status === 'awaiting_payment' && o.payment.expiresAt < Date.now()) await sweep(store);
  const fresh = await store.getJSON('orders/' + id);
  return json({ order: customerView(fresh) });
}

// customer says "I have paid" but no SMS matched yet → Sathya checks by hand
async function claimPaid(req, store, id) {
  await limit(store, req, 'claim', 5, 600);
  const body = await readBody(req, 2000);
  const o = await orderForCustomer(store, id, body.k);
  if (!o) return fail(404, 'Order not found');
  const utr = String(body.utr ?? '').replace(/\s/g, '');
  if (!/^[0-9]{12}$/.test(utr)) return fail(400, 'Enter the 12-digit UPI reference (UTR) from your payment app');
  if (o.status === 'awaiting_payment' || o.status === 'expired') {
    if (o.status === 'expired') await changeStock(store, o.items, -1);
    o.status = 'payment_check';
    o.payment.claimedUtr = utr;
    o.history.push({ status: 'payment_check', at: nowIso(), note: 'Customer says paid' });
    await store.setJSON('orders/' + id, o);
    await notify(store, `⚠️ Check payment · ₹${o.payment.payable}`, `${o.id}: customer says paid (UPI ref ${utr}) but no bank SMS matched. Check your bank.`, `/admin/#order-${o.id}`, o.id);
    // keep it matchable for the late SMS
    await store.delete('pending/' + id);
    await store.setJSON('late/' + id, { payablePaise: o.payment.payablePaise, until: Date.now() + LATE_WINDOW_MS });
  }
  return json({ order: customerView(o) });
}

async function track(req, url, store) {
  await limit(store, req, 'track', 30, 600);
  const id = clean(url.searchParams.get('id'), 20).toUpperCase().replace(/^#/, '');
  const ph = phone10(url.searchParams.get('phone'));
  if (!/^SK\d{10}$/.test(id) || ph.length !== 10) return fail(400, 'Enter your order ID (like SK2611161234) and mobile number');
  const o = await store.getJSON('orders/' + id);
  if (!o || o.customer.phone !== ph) return fail(404, 'No order found with that ID and mobile number');
  return json({ order: customerView(o) });
}

// ---------- payments: bank SMS webhook ----------
async function confirmPaid(store, o, utr, source) {
  if (o.status === 'expired') await changeStock(store, o.items, -1); // revived by a late payment
  o.payment.verified = true;
  o.payment.utr = utr || o.payment.utr;
  o.payment.source = source;
  o.payment.paidAt = nowIso();
  if (['awaiting_payment', 'payment_check', 'expired'].includes(o.status)) {
    o.status = 'confirmed';
    o.history.push({ status: 'confirmed', at: nowIso(), note: source === 'bank-sms' ? 'Payment received (bank SMS)' : 'Payment received' });
  }
  await store.setJSON('orders/' + o.id, o);
  await store.delete('pending/' + o.id);
  await store.delete('late/' + o.id);
  await notify(store, `🛍️ New order · ₹${o.payment.payable} paid`, `${o.id} · ${o.customer.name.split(' ')[0]}, ${o.customer.city}\n${orderLine(o)}`, `/admin/#order-${o.id}`, o.id);
}

async function smsWebhook(req, url, store) {
  const key = process.env.PAYMENT_WEBHOOK_KEY || '';
  if (key.length < 24) return fail(503, 'Payment check is not set up');
  const given = req.headers.get('x-sk-key') || url.searchParams.get('key') || '';
  if (!sameSecret(given, key)) { await limit(store, req, 'hookbad', 10, 3600); return fail(401, 'Unauthorized'); }
  await limit(store, req, 'hook', 120, 600);

  const type = req.headers.get('content-type') || '';
  let message = '';
  const raw = (await req.text()).slice(0, 4000);
  if (type.includes('json')) { try { const b = JSON.parse(raw); message = b.message ?? b.text ?? b.msg ?? b.body ?? b.sms ?? ''; } catch {} }
  else if (type.includes('form')) { const f = new URLSearchParams(raw); message = f.get('message') || f.get('text') || f.get('msg') || f.get('body') || ''; }
  else message = raw;

  const p = parseBankSms(message);
  await store.setJSON('meta/last-sms', { at: nowIso(), ok: p.ok, reason: p.reason || null });
  if (!p.ok) return json({ ignored: p.reason }); // the SMS text itself is never stored

  const payKey = 'payments/' + (p.utr || 'nr-' + crypto.createHash('sha256').update(message).digest('hex').slice(0, 16));
  if (await store.getJSON(payKey)) return json({ duplicate: true });

  await sweep(store);
  let match = null;
  for (const idx of ['pending/', 'late/']) {
    for (const k of await store.list(idx)) {
      if ((await store.getJSON(k))?.payablePaise === p.amountPaise) { match = k.slice(idx.length); break; }
    }
    if (match) break;
  }
  const record = { utr: p.utr, amount: rupees(p.amountPaise), at: nowIso(), orderId: null };
  if (match) {
    const o = await store.getJSON('orders/' + match);
    if (o && !o.payment.verified) { await confirmPaid(store, o, p.utr, 'bank-sms'); record.orderId = o.id; }
  }
  await store.setJSON(payKey, record);
  if (!record.orderId) await notify(store, `💰 ₹${record.amount} received, no matching order`, `${p.utr ? `UPI ref ${p.utr}. ` : ''}Open Settings → Bank payments to link or refund it.`, '/admin/#settings');
  return json({ matched: Boolean(record.orderId) });
}

// ---------- admin ----------
async function updateOrder(req, store, id) {
  const body = await readBody(req, 20_000);
  const o = await store.getJSON('orders/' + id);
  if (!o) return fail(404, 'Order not found');
  for (const k of ['courier', 'awb', 'trackingUrl', 'adminNote']) if (body[k] !== undefined) o[k] = clean(body[k], 300);
  if (body.status && body.status !== o.status) {
    if (!STATUSES.includes(body.status) || body.status === 'awaiting_payment' || body.status === 'expired') return fail(400, 'Unknown status');
    if (o.status === 'cancelled') return fail(409, 'A cancelled order cannot be reopened.');
    if (body.status === 'confirmed' && !o.payment.verified) {
      await confirmPaid(store, o, o.payment.claimedUtr || '', 'manual');
      return json({ order: await store.getJSON('orders/' + id) });
    }
    if (UNPAID.has(o.status) && body.status !== 'cancelled') return fail(409, 'Confirm the payment first.');
    if (body.status === 'cancelled') {
      if (o.status !== 'expired') await changeStock(store, o.items, +1);
      await store.delete('pending/' + id); await store.delete('late/' + id);
    }
    o.status = body.status;
    o.history.push({ status: body.status, at: nowIso(), note: clean(body.note, 200) });
  }
  o.updatedAt = nowIso();
  await store.setJSON('orders/' + id, o);
  return json({ order: o });
}

async function listPayments(store) {
  const keys = await store.list('payments/');
  const list = (await mapLimit(keys, 10, (k) => store.getJSON(k))).filter(Boolean).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 100);
  return json({ payments: list, lastSms: await store.getJSON('meta/last-sms'), webhookReady: (process.env.PAYMENT_WEBHOOK_KEY || '').length >= 24 });
}

async function attachPayment(req, store, ref) {
  const body = await readBody(req, 2000);
  const payKey = 'payments/' + ref;
  const pay = await store.getJSON(payKey);
  if (!pay) return fail(404, 'Payment not found');
  if (pay.orderId) return fail(409, 'This payment is already linked to ' + pay.orderId);
  const o = await store.getJSON('orders/' + clean(body.orderId, 20).toUpperCase());
  if (!o) return fail(404, 'Order not found');
  if (o.payment.verified) return fail(409, 'That order is already paid');
  await confirmPaid(store, o, pay.utr, 'manual');
  pay.orderId = o.id;
  await store.setJSON(payKey, pay);
  return json({ ok: true });
}

async function stats(store) {
  const [orders, products, settings] = await Promise.all([allOrders(store), allProducts(store), getSettings(store)]);
  const live = orders.filter((o) => o.payment.verified && o.status !== 'cancelled');
  const today = istDay(nowIso());
  const month = today.slice(0, 7);
  const lastMonthDate = new Date(Date.parse(month + '-01T00:00:00Z') - 86400000).toISOString().slice(0, 7);
  const sum = (list, f) => list.reduce((s, o) => s + f(o), 0);
  const itemCost = (o) => o.items.reduce((s, i) => s + (i.cost ?? 0) * i.qty, 0);
  const inMonth = (m) => live.filter((o) => istDay(o.createdAt).startsWith(m));
  const thisMonth = inMonth(month);
  const daily = [];
  for (let d = 13; d >= 0; d--) {
    const day = istDay(new Date(Date.now() - d * 86400000).toISOString());
    const list = live.filter((o) => istDay(o.createdAt) === day);
    daily.push({ day, orders: list.length, revenue: sum(list, (o) => o.total) });
  }
  const monthly = [];
  for (let m = 5; m >= 0; m--) {
    const dt = new Date(Date.parse(month + '-15T00:00:00Z'));
    dt.setUTCMonth(dt.getUTCMonth() - m);
    const key = dt.toISOString().slice(0, 7), list = inMonth(key);
    monthly.push({ month: key, orders: list.length, revenue: sum(list, (o) => o.total), profit: sum(list, (o) => o.subtotal - itemCost(o)) });
  }
  const best = new Map();
  for (const o of thisMonth) for (const i of o.items) {
    const b = best.get(i.productId) || { productId: i.productId, name: i.name, qty: 0, revenue: 0 };
    b.qty += i.qty; b.revenue += i.qty * i.price; best.set(i.productId, b);
  }
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]));
  const payments = (await mapLimit(await store.list('payments/'), 10, (k) => store.getJSON(k))).filter(Boolean);
  return json({
    today,
    ordersToday: live.filter((o) => istDay(o.createdAt) === today).length,
    revenueToday: sum(live.filter((o) => istDay(o.createdAt) === today), (o) => o.total),
    revenueMonth: sum(thisMonth, (o) => o.total),
    revenueLastMonth: sum(inMonth(lastMonthDate), (o) => o.total),
    ordersMonth: thisMonth.length,
    profitMonth: sum(thisMonth, (o) => o.subtotal - itemCost(o)),
    profitComplete: thisMonth.every((o) => o.items.every((i) => i.cost !== null && i.cost !== undefined)),
    toVerify: statusCounts.payment_check,
    toShip: statusCounts.confirmed + statusCounts.packed,
    waitingPayment: statusCounts.awaiting_payment,
    unmatchedPayments: payments.filter((p) => !p.orderId).length,
    statusCounts, daily, monthly,
    bestSellers: [...best.values()].sort((a, b) => b.qty - a.qty).slice(0, 6),
    lowStock: products.filter((p) => p.active && p.stock !== null && p.stock !== undefined && p.stock <= settings.lowStockAt)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock })).sort((a, b) => a.stock - b.stock),
    productCount: products.length,
    sampleCount: products.filter((p) => p.sample).length,
    customers: new Set(live.map((o) => o.customer.phone)).size,
  });
}

function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop formulas running when opened in Excel
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
async function ordersCsv(store) {
  const orders = (await allOrders(store)).filter((o) => o.payment.verified || o.status === 'payment_check');
  const head = ['Order ID', 'Date (IST)', 'Status', 'Name', 'Phone', 'City', 'State', 'Pincode', 'Items', 'Subtotal', 'Shipping', 'Total', 'Paid', 'Item cost', 'UTR', 'Payment', 'Courier', 'AWB'];
  const rows = orders.map((o) => [
    o.id, new Date(Date.parse(o.createdAt) + IST_OFFSET).toISOString().replace('T', ' ').slice(0, 16), o.status,
    o.customer.name, o.customer.phone, o.customer.city, o.customer.state, o.customer.pincode,
    o.items.map((i) => `${i.name} x${i.qty}`).join('; '), o.subtotal, o.shipping, o.total, o.payment.payable,
    o.items.reduce((s, i) => s + (i.cost ?? 0) * i.qty, 0), o.payment.utr || o.payment.claimedUtr || '',
    o.payment.verified ? 'verified (' + (o.payment.source || 'manual') + ')' : 'to check', o.courier, o.awb,
  ]);
  return new Response('﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n'), {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="sathya-klassy-orders-${istDay(nowIso())}.csv"`, 'cache-control': 'no-store' },
  });
}

async function upload(req, store) {
  const body = await readBody(req, 6_000_000);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.dataUrl || ''));
  if (!m) return fail(400, 'Upload a JPG, PNG or WebP image');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4_000_000) return fail(413, 'Image is too large (max 4 MB)');
  const sig = buf.subarray(0, 12).toString('hex');
  const real = sig.startsWith('ffd8ff') || sig.startsWith('89504e47') || (sig.startsWith('52494646') && buf.subarray(8, 12).toString() === 'WEBP');
  if (!real) return fail(400, 'That file is not a real image');
  const id = newId(16);
  await store.setBinary('img/' + id, buf, m[1]);
  return json({ url: '/api/img/' + id }, 201);
}

// ---------- router ----------
export async function handle(req) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const method = req.method;
  try {
    const store = await getStore();

    if (parts[0] === 'settings' && method === 'GET')
      return json({ settings: publicSettings(await getSettings(store)), categories: CATEGORIES }, 200, { 'cache-control': 'public, max-age=60' });
    if (parts[0] === 'products' && method === 'GET') {
      const list = (await allProducts(store)).filter((p) => p.active).map(publicProduct);
      if (parts[1]) {
        const p = list.find((x) => x.slug === parts[1] || x.id === parts[1]);
        return p ? json({ product: p }) : fail(404, 'Product not found');
      }
      return json({ products: list, categories: CATEGORIES }, 200, { 'cache-control': 'public, max-age=30' });
    }
    if (parts[0] === 'orders') {
      if (method === 'POST' && !parts[1]) return await createOrder(req, store);
      if (method === 'GET' && parts[2] === 'status') return await orderStatus(req, url, store, parts[1]);
      if (method === 'POST' && parts[2] === 'paid') return await claimPaid(req, store, parts[1]);
    }
    if (parts[0] === 'track' && method === 'GET') return await track(req, url, store);
    if (parts[0] === 'payments' && parts[1] === 'sms' && method === 'POST') return await smsWebhook(req, url, store);
    if (parts[0] === 'img' && parts[1] && method === 'GET') {
      if (!/^[a-f0-9]{16}$/.test(parts[1])) return fail(404, 'Not found');
      const img = await store.getBinary('img/' + parts[1]);
      if (!img) return fail(404, 'Not found');
      return new Response(img.data, { headers: { 'content-type': img.type, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
    }

    if (parts[0] === 'admin') {
      if (parts[1] === 'login' && method === 'POST') {
        const pw = process.env.ADMIN_PASSWORD || '';
        if (pw.length < MIN_PASSWORD) return fail(503, `Set a strong ADMIN_PASSWORD (at least ${MIN_PASSWORD} characters) on Netlify first`);
        await limit(store, req, 'login', 6, 900);
        const body = await readBody(req, 2000);
        if (!sameSecret(body.password || '', pw)) {
          await new Promise((r) => setTimeout(r, 900));
          return fail(401, 'Wrong password');
        }
        return json({ token: makeToken() });
      }
      if (!validToken(req)) return fail(401, 'Please log in again');

      const [, section, id] = parts;
      if (section === 'stats' && method === 'GET') return await stats(store);
      if (section === 'settings') {
        if (method === 'GET') return json({ settings: await getSettings(store) });
        if (method === 'PUT') {
          const b = await readBody(req, 20_000);
          const next = { ...(await getSettings(store)) };
          for (const k of ['shopName', 'tagline', 'announcement', 'upiName', 'instagram', 'email', 'dispatchDays', 'deliveryDays']) if (b[k] !== undefined) next[k] = clean(b[k], 160);
          if (b.upiId !== undefined) {
            const u = clean(b.upiId, 80);
            if (u && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(u)) return fail(400, 'UPI ID looks wrong (example: name@okaxis)');
            next.upiId = u;
          }
          if (b.whatsapp !== undefined) {
            const w = String(b.whatsapp).replace(/\D/g, '');
            if (w && !/^(91)?[6-9]\d{9}$/.test(w)) return fail(400, 'WhatsApp number should be a 10-digit Indian mobile number');
            next.whatsapp = w ? '91' + w.slice(-10) : '';
          }
          for (const k of ['shippingFee', 'freeShippingAbove', 'lowStockAt']) if (b[k] !== undefined) next[k] = money(b[k]);
          await store.setJSON('settings', next);
          return json({ settings: next });
        }
      }
      if (section === 'products') {
        if (method === 'GET' && !id) return json({ products: await allProducts(store), categories: CATEGORIES });
        if (method === 'POST' && !id) {
          const b = await readBody(req, 50_000);
          const pid = newId(8);
          const p = { id: pid, slug: slugify(b.name) + '-' + pid.slice(0, 4), createdAt: nowIso(), ...productFromInput({ ...b, sample: false }) };
          await store.setJSON('products/' + pid, p);
          return json({ product: p }, 201);
        }
        if (id && /^[a-z0-9]+$/.test(id)) {
          const existing = await store.getJSON('products/' + id);
          if (!existing) return fail(404, 'Product not found');
          if (method === 'PUT') {
            const p = productFromInput(await readBody(req, 50_000), existing);
            await store.setJSON('products/' + id, p);
            return json({ product: p });
          }
          if (method === 'DELETE') { await store.delete('products/' + id); return json({ ok: true }); }
        }
      }
      if (section === 'orders') {
        if (method === 'GET' && id === 'export.csv') return await ordersCsv(store);
        if (method === 'GET' && !id) return json({ orders: (await allOrders(store)).map(({ accessKey, ...o }) => o) });
        if (method === 'PUT' && id && /^SK\d{10}$/.test(id)) return await updateOrder(req, store, id);
      }
      if (section === 'payments') {
        if (method === 'GET' && !id) return await listPayments(store);
        if (method === 'POST' && id === 'test') {
          const b = await readBody(req, 4000);
          return json({ result: parseBankSms(b.message) });
        }
        if (method === 'PUT' && id && /^[a-z0-9-]{6,40}$/.test(id)) return await attachPayment(req, store, id);
      }
      if (section === 'push') {
        if (method === 'GET' && id === 'key') return json({ key: await publicKey(store) });
        if (method === 'GET' && id === 'devices') return json({ devices: await listDevices(store) });
        if (method === 'POST' && id === 'subscribe') {
          const b = await readBody(req, 5000);
          if (!validSubscription(b.subscription)) return fail(400, 'This phone could not turn on alerts');
          if ((await listDevices(store)).length >= 10) return fail(409, 'Up to 10 phones can get alerts. Remove one first.');
          return json({ id: await addDevice(store, b.subscription, clean(b.label, 60)) });
        }
        if (method === 'POST' && id === 'test') {
          await limit(store, req, 'pushtest', 6, 600);
          const n = await notify(store, '✅ Alerts are on', 'You will get a notification for every paid order.', '/admin/', 'test');
          return n ? json({ sent: n }) : fail(409, 'No phone has alerts turned on yet');
        }
        if (method === 'DELETE' && parts[3]) { await removeDevice(store, parts[3]); return json({ ok: true }); }
      }
      if (section === 'upload' && method === 'POST') return await upload(req, store);
    }
    return fail(404, 'Not found');
  } catch (e) {
    if (e.status) return fail(e.status, e.message);
    console.error(e);
    return fail(500, 'Something went wrong. Please try again.');
  }
}
