// DEMO MODE for the shareable preview. Pretends to be the /api backend inside
// the browser, so the shop and admin can be tried without a server.
// Data is kept only in this browser (localStorage). Not used on the real site.
// In the demo, a "bank SMS" is simulated 10 seconds after the customer opens
// the payment screen, so the whole pay → confirmed flow can be seen.
(() => {
  const SEED = __SEED__;
  __PARSER__
  const KEY = 'sk-demo-db-v3';
  const DEMO_PAY_AFTER_MS = 10000;
  const now = () => new Date().toISOString();
  const rid = (n = 8) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => (b % 36).toString(36)).join('');
  const hex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => (b % 16).toString(16)).join('');
  const IST = 330 * 60000;
  const istDay = (iso) => new Date(Date.parse(iso) + IST).toISOString().slice(0, 10);
  const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

  function fresh() {
    const t = Date.now();
    return {
      settings: { ...SEED.DEFAULT_SETTINGS, upiId: 'sathya.demo@example', whatsapp: '' },
      products: SEED.SAMPLE_PRODUCTS.map((p, i) => {
        const id = rid();
        return { id, slug: slugify(p.name) + '-' + id.slice(0, 4), active: true, createdAt: new Date(t - i * 1000).toISOString(), ...p };
      }),
      orders: [],
      payments: [],
    };
  }
  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { db = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  save();

  const ok = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  const no = (status, error) => ok({ error }, status);
  const pub = ({ cost, ...p }) => p;
  const view = (o) => ({
    id: o.id, createdAt: o.createdAt, status: o.status, history: o.history,
    items: o.items.map(({ cost, ...i }) => i), subtotal: o.subtotal, shipping: o.shipping, total: o.total,
    payable: o.payment.payable, expiresAt: o.payment.expiresAt,
    name: o.customer.name.split(' ')[0], city: o.customer.city, courier: o.courier, awb: o.awb, trackingUrl: o.trackingUrl,
    paid: o.payment.verified,
  });
  const n = (v) => (v === '' || v === null || v === undefined ? null : Math.max(0, Math.round(Number(v) || 0)));
  const stock = (items, sign) => items.forEach((i) => { const p = db.products.find((x) => x.id === i.productId); if (p && p.stock !== null) p.stock = Math.max(0, p.stock + sign * i.qty); });

  function confirmPaid(o, utr, source) {
    if (o.status === 'expired') stock(o.items, -1);
    Object.assign(o.payment, { verified: true, utr, source, paidAt: now() });
    o.status = 'confirmed';
    o.history.push({ status: 'confirmed', at: now(), note: source === 'bank-sms' ? 'Payment received (bank SMS)' : 'Payment received' });
  }
  function sweep() {
    for (const o of db.orders) {
      if (o.status !== 'awaiting_payment') continue;
      if (Date.now() - Date.parse(o.createdAt) > DEMO_PAY_AFTER_MS) { // simulated bank SMS
        const utr = String(400000000000 + Math.floor(Math.random() * 99999999999));
        confirmPaid(o, utr, 'bank-sms');
        db.payments.unshift({ utr, amount: o.payment.payable, at: now(), orderId: o.id });
      } else if (o.payment.expiresAt < Date.now()) {
        o.status = 'expired'; o.history.push({ status: 'expired', at: now() }); stock(o.items, +1);
      }
    }
    save();
  }

  function stats() {
    sweep();
    const live = db.orders.filter((o) => o.payment.verified && o.status !== 'cancelled');
    const today = istDay(now()), month = today.slice(0, 7);
    const cost = (o) => o.items.reduce((s, i) => s + (i.cost ?? 0) * i.qty, 0);
    const inM = (m) => live.filter((o) => istDay(o.createdAt).startsWith(m));
    const tm = inM(month);
    const lmKey = new Date(Date.parse(month + '-01') - 864e5).toISOString().slice(0, 7);
    const daily = [];
    for (let d = 13; d >= 0; d--) {
      const day = istDay(new Date(Date.now() - d * 864e5).toISOString());
      const l = live.filter((o) => istDay(o.createdAt) === day);
      daily.push({ day, orders: l.length, revenue: l.reduce((s, o) => s + o.total, 0) });
    }
    const monthly = [];
    for (let m = 5; m >= 0; m--) {
      const dt = new Date(Date.parse(month + '-15')); dt.setUTCMonth(dt.getUTCMonth() - m);
      const k = dt.toISOString().slice(0, 7), l = inM(k);
      monthly.push({ month: k, orders: l.length, revenue: l.reduce((s, o) => s + o.total, 0), profit: l.reduce((s, o) => s + o.subtotal - cost(o), 0) });
    }
    const best = new Map();
    for (const o of tm) for (const i of o.items) {
      const b = best.get(i.productId) || { productId: i.productId, name: i.name, qty: 0, revenue: 0 };
      b.qty += i.qty; b.revenue += i.qty * i.price; best.set(i.productId, b);
    }
    const sc = Object.fromEntries(['awaiting_payment', 'payment_check', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'expired'].map((s) => [s, db.orders.filter((o) => o.status === s).length]));
    const tdy = live.filter((o) => istDay(o.createdAt) === today);
    return {
      today, ordersToday: tdy.length, revenueToday: tdy.reduce((s, o) => s + o.total, 0),
      revenueMonth: tm.reduce((s, o) => s + o.total, 0), revenueLastMonth: inM(lmKey).reduce((s, o) => s + o.total, 0),
      ordersMonth: tm.length, profitMonth: tm.reduce((s, o) => s + o.subtotal - cost(o), 0), profitComplete: true,
      toVerify: sc.payment_check, toShip: sc.confirmed + sc.packed, waitingPayment: sc.awaiting_payment,
      unmatchedPayments: db.payments.filter((p) => !p.orderId).length, statusCounts: sc, daily, monthly,
      bestSellers: [...best.values()].sort((a, b) => b.qty - a.qty).slice(0, 6),
      lowStock: db.products.filter((p) => p.active && p.stock !== null && p.stock <= db.settings.lowStockAt).map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
      productCount: db.products.length, sampleCount: db.products.filter((p) => p.sample).length,
      customers: new Set(live.map((o) => o.customer.phone)).size,
    };
  }

  async function route(method, path, body) {
    const parts = path.split('?')[0].split('/').filter(Boolean);
    const q = new URLSearchParams(path.split('?')[1] || '');
    if (parts[0] === 'settings') return ok({ settings: db.settings, categories: SEED.CATEGORIES });
    if (parts[0] === 'products' && method === 'GET') {
      const list = db.products.filter((p) => p.active).map(pub);
      if (parts[1]) { const p = list.find((x) => x.slug === parts[1] || x.id === parts[1]); return p ? ok({ product: p }) : no(404, 'Product not found'); }
      return ok({ products: list, categories: SEED.CATEGORIES });
    }
    if (parts[0] === 'orders' && method === 'POST' && !parts[1]) {
      const c = body.customer || {};
      const items = [];
      for (const w of body.items || []) {
        const p = db.products.find((x) => x.id === w.id);
        if (!p) return no(409, 'One of the items is no longer available. Please refresh your cart.');
        if (p.stock !== null && p.stock < w.qty) return no(409, `Only ${p.stock} left of "${p.name}"`);
        items.push({ productId: p.id, name: p.name, price: p.price, cost: p.cost, qty: w.qty, image: p.images[0] || null });
      }
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const shipping = subtotal >= db.settings.freeShippingAbove ? 0 : db.settings.shippingFee;
      const total = subtotal + shipping;
      const payablePaise = total * 100 + 1 + Math.floor(Math.random() * 99);
      const id = 'SK' + istDay(now()).slice(2).replace(/-/g, '') + String(1000 + Math.floor(Math.random() * 9000));
      const o = {
        id, createdAt: now(), customer: { ...c, phone: String(c.phone).slice(-10) }, items, subtotal, shipping, total, note: body.note || '',
        payment: { method: 'upi', payable: rupees(payablePaise), payablePaise, expiresAt: Date.now() + 10 * 60000, utr: '', verified: false, source: '' },
        accessKey: hex(24), status: 'awaiting_payment', history: [{ status: 'awaiting_payment', at: now() }], courier: '', awb: '', trackingUrl: '',
      };
      db.orders.unshift(o); stock(items, -1); save();
      return ok({ order: view(o), key: o.accessKey, upi: { id: db.settings.upiId, name: db.settings.upiName } }, 201);
    }
    if (parts[0] === 'orders' && parts[2] === 'status') {
      sweep();
      const o = db.orders.find((x) => x.id === parts[1] && x.accessKey === q.get('k'));
      return o ? ok({ order: view(o) }) : no(404, 'Order not found');
    }
    if (parts[0] === 'orders' && parts[2] === 'paid') {
      const o = db.orders.find((x) => x.id === parts[1] && x.accessKey === body.k);
      if (!o) return no(404, 'Order not found');
      if (!/^[0-9]{12}$/.test(String(body.utr || ''))) return no(400, 'Enter the 12-digit UPI reference (UTR) from your payment app');
      if (!o.payment.verified) { o.status = 'payment_check'; o.payment.claimedUtr = body.utr; o.history.push({ status: 'payment_check', at: now() }); save(); }
      return ok({ order: view(o) });
    }
    if (parts[0] === 'track') {
      sweep();
      const o = db.orders.find((x) => x.id === String(q.get('id') || '').toUpperCase() && x.customer.phone === String(q.get('phone') || '').replace(/\D/g, '').slice(-10));
      return o ? ok({ order: view(o) }) : no(404, 'No order found with that ID and mobile number');
    }
    if (parts[0] !== 'admin') return no(404, 'Not found');
    if (parts[1] === 'login') return body.password === 'demo' ? ok({ token: 'demo' }) : no(401, 'Wrong password. In this demo the password is: demo');
    const [, section, id] = parts;
    if (section === 'stats') return ok(stats());
    if (section === 'settings') {
      if (method === 'PUT') {
        const w = String(body.whatsapp || '').replace(/\D/g, '');
        Object.assign(db.settings, body, {
          whatsapp: w ? '91' + w.slice(-10) : '',
          shippingFee: n(body.shippingFee) ?? db.settings.shippingFee,
          freeShippingAbove: n(body.freeShippingAbove) ?? db.settings.freeShippingAbove,
          lowStockAt: n(body.lowStockAt) ?? db.settings.lowStockAt,
        });
        save();
      }
      return ok({ settings: db.settings });
    }
    if (section === 'payments') {
      if (method === 'GET') return ok({ payments: db.payments.slice(0, 100), lastSms: db.payments[0] ? { at: db.payments[0].at, ok: true } : null, webhookReady: true, notifyReady: true });
      if (id === 'test') return ok({ result: parseBankSms(body.message) });
      const pay = db.payments.find((p) => p.utr === id);
      const o = db.orders.find((x) => x.id === String(body.orderId || '').toUpperCase());
      if (!pay || !o) return no(404, 'Order not found');
      confirmPaid(o, pay.utr, 'manual'); pay.orderId = o.id; save();
      return ok({ ok: true });
    }
    if (section === 'products') {
      if (method === 'GET') return ok({ products: db.products, categories: SEED.CATEGORIES });
      const fields = (b, e = {}) => ({ ...e, name: b.name, category: b.category, tag: String(b.tag || '').toUpperCase(), price: n(b.price), mrp: n(b.mrp), cost: n(b.cost), stock: n(b.stock),
        description: b.description, images: b.images || [], featured: !!b.featured, active: !!b.active, sample: false, updatedAt: now() });
      if (method === 'POST') { const pid = rid(); const p = { id: pid, slug: slugify(body.name) + '-' + pid.slice(0, 4), createdAt: now(), ...fields(body) }; db.products.unshift(p); save(); return ok({ product: p }, 201); }
      const i = db.products.findIndex((p) => p.id === id);
      if (i < 0) return no(404, 'Product not found');
      if (method === 'PUT') { db.products[i] = fields(body, db.products[i]); save(); return ok({ product: db.products[i] }); }
      if (method === 'DELETE') { db.products.splice(i, 1); save(); return ok({ ok: true }); }
    }
    if (section === 'orders') {
      sweep();
      if (id === 'export.csv') {
        const rows = [['Order ID', 'Status', 'Name', 'Phone', 'City', 'Paid'], ...db.orders.filter((o) => o.payment.verified).map((o) => [o.id, o.status, o.customer.name, o.customer.phone, o.customer.city, o.payment.payable])];
        return new Response(rows.map((r) => r.join(',')).join('\n'), { headers: { 'content-type': 'text/csv' } });
      }
      if (method === 'GET') return ok({ orders: db.orders.map(({ accessKey, ...o }) => o) });
      const o = db.orders.find((x) => x.id === id);
      if (!o) return no(404, 'Order not found');
      for (const k of ['courier', 'awb', 'trackingUrl']) if (body[k] !== undefined) o[k] = body[k];
      if (body.status && body.status !== o.status) {
        if (o.status === 'cancelled') return no(409, 'A cancelled order cannot be reopened.');
        if (body.status === 'confirmed' && !o.payment.verified) { confirmPaid(o, o.payment.claimedUtr || '', 'manual'); save(); return ok({ order: o }); }
        if (body.status === 'cancelled' && o.status !== 'expired') stock(o.items, +1);
        o.status = body.status; o.history.push({ status: body.status, at: now() });
      }
      save();
      return ok({ order: o });
    }
    if (section === 'push') return id === 'devices' ? ok({ devices: [] }) : no(503, 'Phone alerts work in the real SK Admin app, not in this demo.');
    if (section === 'upload') return ok({ url: body.dataUrl }, 201); // demo: keep the photo inline
    return no(404, 'Not found');
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, opts = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const m = /(?:^|\/)api\/(.*)$/.exec(url.replace(location.origin, ''));
    if (!m) return realFetch(input, opts);
    let body = {};
    try { body = opts.body ? JSON.parse(opts.body) : {}; } catch {}
    await new Promise((r) => setTimeout(r, 120));
    return route((opts.method || 'GET').toUpperCase(), m[1], body);
  };
  // the preview frame blocks confirm() dialogs; in the demo every confirm says yes
  window.confirm = () => true;

  window.SK_DEMO = { reset() { try { localStorage.removeItem(KEY); localStorage.removeItem('sk-cart-v1'); localStorage.removeItem('sk-pending-order'); } catch {} location.reload(); } };
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.setAttribute('role', 'note');
    bar.style.cssText = 'background:#2b1520;color:#f3e2b5;font:500 12.5px/1.4 Poppins,system-ui,sans-serif;text-align:center;padding:8px 16px;position:relative;z-index:80';
    bar.innerHTML = 'Demo preview · sample products · no real payment: the bank SMS is simulated 10 s after you open the pay screen · admin password: <b>demo</b> · <button style="background:none;border:0;color:#f19bbb;text-decoration:underline;cursor:pointer;font:inherit;padding:0">Reset demo</button>';
    bar.querySelector('button').onclick = () => window.SK_DEMO.reset();
    document.body.prepend(bar);
  });
})();
