// All /api/* routes for the shop. Used by the Netlify function and by the
// local dev server, so both behave the same.

import crypto from 'node:crypto';
import { getStore } from './store.mjs';
import { CATEGORIES, DEFAULT_SETTINGS, SAMPLE_PRODUCTS } from './seed.mjs';

const STATUSES = ['payment_check', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const IST_OFFSET = 330 * 60 * 1000;

// ---------- helpers ----------
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
const fail = (status, error) => json({ error }, status);

const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const money = (v) => Math.max(0, Math.round(Number(v) || 0));
const intOrNull = (v) => (v === '' || v === null || v === undefined ? null : Math.max(0, Math.round(Number(v) || 0)));
const phone10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);
const slugify = (s) => clean(s, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
const newId = (n = 10) => crypto.randomBytes(n).toString('hex').slice(0, n);
const istDay = (iso) => new Date(new Date(iso).getTime() + IST_OFFSET).toISOString().slice(0, 10);

async function readBody(req, limit = 6_000_000) {
  const text = await req.text();
  if (text.length > limit) throw Object.assign(new Error('Request too large'), { status: 413 });
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

// ---------- auth ----------
function secret() {
  const s = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD;
  return s ? 'sk-admin:' + s : null;
}
function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}
function makeToken() {
  const exp = String(Date.now() + 7 * 24 * 3600 * 1000);
  return exp + '.' + sign(exp);
}
function validToken(req) {
  if (!secret()) return false;
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}
function samePassword(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

// ---------- data access ----------
async function getSettings(store) {
  const saved = (await store.getJSON('settings')) || {};
  return { ...DEFAULT_SETTINGS, ...saved };
}

async function allProducts(store) {
  let keys = await store.list('products/');
  if (!keys.length && !(await store.getJSON('meta/seeded'))) {
    const now = new Date().toISOString();
    await Promise.all(SAMPLE_PRODUCTS.map((p, i) => {
      const id = newId(8);
      return store.setJSON('products/' + id, {
        id, slug: slugify(p.name) + '-' + id.slice(0, 4), images: [], active: true,
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
  const keys = await store.list('orders/');
  const list = (await mapLimit(keys, 10, (k) => store.getJSON(k))).filter(Boolean);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    ? (input.images ?? existing.images).filter((u) => typeof u === 'string' && /^\/api\/img\/[a-z0-9]+$/.test(u)).slice(0, 8)
    : [];
  return {
    ...existing,
    name,
    category,
    price,
    mrp: intOrNull(input.mrp ?? existing.mrp),
    cost: intOrNull(input.cost ?? existing.cost),
    stock: intOrNull(input.stock ?? existing.stock),
    tag: clean(input.tag ?? existing.tag, 20).toUpperCase(),
    description: clean(input.description ?? existing.description, 2000),
    images,
    active: input.active === undefined ? existing.active ?? true : Boolean(input.active),
    featured: input.featured === undefined ? Boolean(existing.featured) : Boolean(input.featured),
    sample: input.sample === undefined ? Boolean(existing.sample) && !input.name : false,
    updatedAt: new Date().toISOString(),
  };
}

// ---------- public routes ----------
async function createOrder(req, store) {
  const body = await readBody(req, 50_000);
  if (body.website) return fail(400, 'Could not place order'); // honeypot
  const c = body.customer || {};
  const customer = {
    name: clean(c.name, 80),
    phone: phone10(c.phone),
    email: clean(c.email, 120),
    address: clean(c.address, 400),
    city: clean(c.city, 60),
    state: clean(c.state, 60),
    pincode: String(c.pincode ?? '').replace(/\D/g, '').slice(0, 6),
  };
  if (!customer.name) return fail(400, 'Please enter your name');
  if (!/^[6-9]\d{9}$/.test(customer.phone)) return fail(400, 'Please enter a valid 10-digit mobile number');
  if (!customer.address || !customer.city || !customer.state) return fail(400, 'Please enter your full address');
  if (!/^[1-9]\d{5}$/.test(customer.pincode)) return fail(400, 'Please enter a valid 6-digit pincode');
  const utr = String(body.utr ?? '').replace(/\s/g, '').slice(0, 30);
  if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) return fail(400, 'Please enter the UPI transaction ID (UTR) from your payment app');

  const wanted = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!wanted.length) return fail(400, 'Your cart is empty');
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
  const settings = await getSettings(store);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingFee;
  const total = subtotal + shipping;
  if (body.expectedTotal !== undefined && money(body.expectedTotal) !== total)
    return fail(409, 'Prices changed since you opened the page. Please check your cart and pay ₹' + total.toLocaleString('en-IN'));

  let id;
  for (let tries = 0; tries < 5; tries++) {
    const d = istDay(new Date().toISOString()).slice(2).replace(/-/g, '');
    id = 'SK' + d + String(crypto.randomInt(1000, 9999));
    if (!(await store.getJSON('orders/' + id))) break;
  }
  const now = new Date().toISOString();
  const order = {
    id, createdAt: now, customer, items, subtotal, shipping, total,
    note: clean(body.note, 300),
    payment: { method: 'upi', utr, verified: false },
    status: 'payment_check',
    history: [{ status: 'payment_check', at: now }],
    courier: '', awb: '', trackingUrl: '',
  };
  await store.setJSON('orders/' + id, order);
  await Promise.all(items.map(async (i) => {
    const p = byId.get(i.productId);
    if (p.stock !== null && p.stock !== undefined) {
      const fresh = (await store.getJSON('products/' + p.id)) || p;
      await store.setJSON('products/' + p.id, { ...fresh, stock: Math.max(0, (fresh.stock ?? 0) - i.qty) });
    }
  }));
  return json({ ok: true, order: trackView(order) }, 201);
}

function trackView(o) {
  return {
    id: o.id, createdAt: o.createdAt, status: o.status, history: o.history,
    items: o.items.map(({ cost, ...i }) => i), subtotal: o.subtotal, shipping: o.shipping, total: o.total,
    name: o.customer.name.split(' ')[0], city: o.customer.city,
    courier: o.courier, awb: o.awb, trackingUrl: o.trackingUrl,
    paymentVerified: o.payment.verified,
  };
}

async function track(url, store) {
  const id = clean(url.searchParams.get('id'), 20).toUpperCase().replace(/^#/, '');
  const ph = phone10(url.searchParams.get('phone'));
  if (!/^SK\d{10}$/.test(id) || ph.length !== 10) return fail(400, 'Enter your order ID (like SK2611161234) and mobile number');
  const o = await store.getJSON('orders/' + id);
  if (!o || o.customer.phone !== ph) return fail(404, 'No order found with that ID and mobile number');
  return json({ order: trackView(o) });
}

// ---------- admin routes ----------
async function updateOrder(req, store, id) {
  const body = await readBody(req, 20_000);
  const o = await store.getJSON('orders/' + id);
  if (!o) return fail(404, 'Order not found');
  const now = new Date().toISOString();
  if (body.paymentVerified !== undefined) o.payment.verified = Boolean(body.paymentVerified);
  for (const k of ['courier', 'awb', 'trackingUrl', 'adminNote']) if (body[k] !== undefined) o[k] = clean(body[k], 300);
  if (body.status && body.status !== o.status) {
    if (!STATUSES.includes(body.status)) return fail(400, 'Unknown status');
    if (o.status === 'cancelled') return fail(409, 'A cancelled order cannot be reopened. Create a new order instead.');
    if (body.status === 'cancelled') {
      await Promise.all(o.items.map(async (i) => {
        const p = await store.getJSON('products/' + i.productId);
        if (p && p.stock !== null && p.stock !== undefined) await store.setJSON('products/' + p.id, { ...p, stock: p.stock + i.qty });
      }));
    }
    if (body.status === 'confirmed') o.payment.verified = true;
    o.status = body.status;
    o.history.push({ status: body.status, at: now, note: clean(body.note, 200) });
  }
  o.updatedAt = now;
  await store.setJSON('orders/' + id, o);
  return json({ order: o });
}

async function stats(store) {
  const [orders, products, settings] = await Promise.all([allOrders(store), allProducts(store), getSettings(store)]);
  const live = orders.filter((o) => o.status !== 'cancelled');
  const today = istDay(new Date().toISOString());
  const month = today.slice(0, 7);
  const lastMonthDate = new Date(Date.parse(month + '-01T00:00:00Z') - 86400000).toISOString().slice(0, 7);
  const sum = (list, f) => list.reduce((s, o) => s + f(o), 0);
  const itemCost = (o) => o.items.reduce((s, i) => s + (i.cost ?? 0) * i.qty, 0);
  const costKnown = (o) => o.items.every((i) => i.cost !== null && i.cost !== undefined);
  const inMonth = (m) => live.filter((o) => istDay(o.createdAt).startsWith(m));
  const thisMonth = inMonth(month);
  const lastMonth = inMonth(lastMonthDate);

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
    const key = dt.toISOString().slice(0, 7);
    const list = inMonth(key);
    monthly.push({ month: key, orders: list.length, revenue: sum(list, (o) => o.total), profit: sum(list, (o) => o.subtotal - itemCost(o)) });
  }
  const best = new Map();
  for (const o of thisMonth) for (const i of o.items) {
    const b = best.get(i.productId) || { productId: i.productId, name: i.name, qty: 0, revenue: 0 };
    b.qty += i.qty; b.revenue += i.qty * i.price; best.set(i.productId, b);
  }
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]));
  return json({
    today,
    ordersToday: live.filter((o) => istDay(o.createdAt) === today).length,
    revenueToday: sum(live.filter((o) => istDay(o.createdAt) === today), (o) => o.total),
    revenueMonth: sum(thisMonth, (o) => o.total),
    revenueLastMonth: sum(lastMonth, (o) => o.total),
    ordersMonth: thisMonth.length,
    profitMonth: sum(thisMonth, (o) => o.subtotal - itemCost(o)),
    profitComplete: thisMonth.every(costKnown),
    toVerify: statusCounts.payment_check,
    toShip: statusCounts.confirmed + statusCounts.packed,
    statusCounts,
    daily,
    monthly,
    bestSellers: [...best.values()].sort((a, b) => b.qty - a.qty).slice(0, 6),
    lowStock: products.filter((p) => p.active && p.stock !== null && p.stock !== undefined && p.stock <= settings.lowStockAt)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock })).sort((a, b) => a.stock - b.stock),
    productCount: products.length,
    sampleCount: products.filter((p) => p.sample).length,
    customers: new Set(live.map((o) => o.customer.phone)).size,
  });
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
async function ordersCsv(store) {
  const orders = await allOrders(store);
  const head = ['Order ID', 'Date (IST)', 'Status', 'Name', 'Phone', 'City', 'State', 'Pincode', 'Items', 'Subtotal', 'Shipping', 'Total', 'Item cost', 'UTR', 'Payment verified', 'Courier', 'AWB'];
  const rows = orders.map((o) => [
    o.id, new Date(Date.parse(o.createdAt) + IST_OFFSET).toISOString().replace('T', ' ').slice(0, 16), o.status,
    o.customer.name, o.customer.phone, o.customer.city, o.customer.state, o.customer.pincode,
    o.items.map((i) => `${i.name} x${i.qty}`).join('; '), o.subtotal, o.shipping, o.total,
    o.items.reduce((s, i) => s + (i.cost ?? 0) * i.qty, 0), o.payment.utr, o.payment.verified ? 'yes' : 'no', o.courier, o.awb,
  ]);
  const csv = [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  return new Response('﻿' + csv, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="sathya-klassy-orders-${istDay(new Date().toISOString())}.csv"`, 'cache-control': 'no-store' },
  });
}

async function upload(req, store) {
  const body = await readBody(req, 6_000_000);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.dataUrl || ''));
  if (!m) return fail(400, 'Upload a JPG, PNG or WebP image');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4_000_000) return fail(413, 'Image is too large (max 4 MB)');
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

    // public
    if (parts[0] === 'settings' && method === 'GET') {
      return json({ settings: publicSettings(await getSettings(store)), categories: CATEGORIES }, 200, { 'cache-control': 'public, max-age=60' });
    }
    if (parts[0] === 'products' && method === 'GET') {
      const list = (await allProducts(store)).filter((p) => p.active).map(publicProduct);
      if (parts[1]) {
        const p = list.find((x) => x.slug === parts[1] || x.id === parts[1]);
        return p ? json({ product: p }) : fail(404, 'Product not found');
      }
      return json({ products: list, categories: CATEGORIES }, 200, { 'cache-control': 'public, max-age=30' });
    }
    if (parts[0] === 'orders' && method === 'POST' && !parts[1]) return await createOrder(req, store);
    if (parts[0] === 'track' && method === 'GET') return await track(url, store);
    if (parts[0] === 'img' && parts[1] && method === 'GET') {
      if (!/^[a-z0-9]+$/.test(parts[1])) return fail(404, 'Not found');
      const img = await store.getBinary('img/' + parts[1]);
      if (!img) return fail(404, 'Not found');
      return new Response(img.data, { headers: { 'content-type': img.type, 'cache-control': 'public, max-age=31536000, immutable' } });
    }

    // admin
    if (parts[0] === 'admin') {
      if (parts[1] === 'login' && method === 'POST') {
        if (!process.env.ADMIN_PASSWORD) return fail(503, 'Admin password is not set up yet (ADMIN_PASSWORD on Netlify)');
        const body = await readBody(req, 2000);
        if (!samePassword(body.password || '', process.env.ADMIN_PASSWORD)) {
          await new Promise((r) => setTimeout(r, 800));
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
          const cur = await getSettings(store);
          const next = { ...cur };
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
          const p = { id: pid, slug: slugify(b.name) + '-' + pid.slice(0, 4), createdAt: new Date().toISOString(), ...productFromInput({ ...b, sample: false }) };
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
          if (method === 'DELETE') {
            await store.delete('products/' + id);
            return json({ ok: true });
          }
        }
      }
      if (section === 'orders') {
        if (method === 'GET' && id === 'export.csv') return await ordersCsv(store);
        if (method === 'GET' && !id) return json({ orders: await allOrders(store) });
        if (method === 'PUT' && id && /^SK\d{10}$/.test(id)) return await updateOrder(req, store, id);
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
