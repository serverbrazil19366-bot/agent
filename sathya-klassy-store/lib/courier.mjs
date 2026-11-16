// Automatic courier tracking through Ship24 (detects the courier from the
// tracking number; DTDC, India Post, Delhivery, Blue Dart and more).
// Free plan: 10 new shipments a month. Set on Netlify:
//   SHIP24_API_KEY          from the Ship24 dashboard (required)
//   SHIP24_WEBHOOK_SECRET   optional, for instant updates via webhook
//   SHIP24_MONTHLY_LIMIT    optional, default 10 (the free plan)
// Without a key, or when the month's free shipments are used, nothing breaks:
// the customer still gets the "Track parcel" button and Sathya's own updates.

const BASE = process.env.SHIP24_BASE_URL || 'https://api.ship24.com'; // override only for local tests
const REFRESH_MS = 2 * 3600 * 1000;

export const autoTrackingReady = () => Boolean(process.env.SHIP24_API_KEY);
const limit = () => Number(process.env.SHIP24_MONTHLY_LIMIT || 10);
const monthKey = () => 'meta/ship24-' + new Date(Date.now() + 330 * 60000).toISOString().slice(0, 7);

export async function usage(store) {
  return { used: (await store.getJSON(monthKey()))?.n || 0, limit: limit(), ready: autoTrackingReady() };
}

const MILESTONES = new Set(['pending', 'info_received', 'in_transit', 'out_for_delivery', 'failed_attempt', 'available_for_pickup', 'delivered', 'exception']);

// turn one Ship24 "tracking" object into what we keep on the order
export function readTracking(t) {
  const s = t?.shipment || {};
  const events = (Array.isArray(t?.events) ? t.events : []).slice(0, 40).map((e) => ({
    at: String(e.occurrenceDatetime || '').slice(0, 25),
    text: String(e.status || '').replace(/[<>]/g, '').slice(0, 140),
    place: String(e.location || '').replace(/[<>]/g, '').slice(0, 80),
    milestone: MILESTONES.has(e.statusMilestone) ? e.statusMilestone : '',
  })).filter((e) => e.text);
  const eta = s.delivery?.estimatedDeliveryDate || s.delivery?.courierEstimatedDeliveryDate?.to || null;
  return {
    milestone: MILESTONES.has(s.statusMilestone) ? s.statusMilestone : 'pending',
    events,
    eta: eta && /^\d{4}-\d{2}-\d{2}/.test(eta) ? eta.slice(0, 10) : null,
    courierCode: events.length ? String((t.events.find((e) => e.courierCode) || {}).courierCode || '').slice(0, 40) : '',
  };
}

async function call(o) {
  const res = await fetch(BASE + '/public/v1/trackers/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8', authorization: 'Bearer ' + process.env.SHIP24_API_KEY },
    body: JSON.stringify({
      trackingNumber: o.awb.replace(/\s+/g, ''),
      clientTrackerId: o.id,
      orderNumber: o.id,
      destinationCountryCode: 'IN',
      destinationPostCode: o.customer.pincode,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error('Ship24 ' + res.status);
  const data = await res.json();
  return data?.data?.trackings?.[0];
}

// start tracking when an order ships (counts 1 of the month's free shipments)
export async function startTracking(store, o) {
  if (!autoTrackingReady() || !o.awb) return { started: false, reason: 'off' };
  if (o.auto?.awb === o.awb) return { started: true };
  const u = await usage(store);
  if (u.used >= u.limit) { o.auto = { off: 'limit', awb: o.awb }; return { started: false, reason: 'limit' }; }
  await store.setJSON(monthKey(), { n: u.used + 1 });
  o.auto = { awb: o.awb, checkedAt: 0 };
  try { o.auto = { ...o.auto, ...readTracking(await call(o)), checkedAt: Date.now() }; }
  catch (e) { o.auto.error = String(e.message).slice(0, 80); }
  return { started: true };
}

// refresh an order that is being tracked (no extra cost: same tracker)
export async function refreshTracking(o, force = false) {
  if (!autoTrackingReady() || !o.auto || o.auto.off || !o.awb || o.auto.awb !== o.awb) return false;
  if (!force && Date.now() - (o.auto.checkedAt || 0) < REFRESH_MS) return false;
  try { o.auto = { ...o.auto, ...readTracking(await call(o)), checkedAt: Date.now(), error: undefined }; return true; }
  catch (e) { o.auto.checkedAt = Date.now(); o.auto.error = String(e.message).slice(0, 80); return true; }
}
