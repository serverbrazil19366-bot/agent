(() => {
  const { $, esc, inr, icons, api, shop, waLink } = SK;
  const form = $('#form');
  const pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>';
  const STEPS = [
    ['awaiting_payment', 'Waiting for payment', 'The order is placed once your UPI payment reaches us', icons.upi],
    ['confirmed', 'Order placed', 'Payment received. We are getting it ready', icons.check],
    ['packed', 'Packed with love', 'Your order is packed', icons.gift],
    ['shipped', 'Shipped', 'On the way to you', icons.truck],
    ['out_for_delivery', 'Out for delivery', 'Arriving today', pin],
    ['delivered', 'Delivered', 'Enjoy! Tag us on Instagram 💗', icons.home],
  ];
  const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const dayName = (ymd, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(ymd + 'T12:00:00+05:30').toLocaleDateString('en-IN', opts);

  function eta(o) {
    if (o.status === 'delivered') return { big: `Delivered on ${dayName(o.deliveredOn || o.history.at(-1).at.slice(0, 10))}`, small: 'Hope you love it! 💗', tone: 'ok' };
    if (o.status === 'out_for_delivery') return { big: 'Arriving today', small: 'Your order is out for delivery. Keep your phone close.', tone: 'hot' };
    const e = o.estimate;
    if (!e) return null;
    if (e.by) return { big: `Arriving by ${dayName(e.by)}`, small: o.status === 'shipped' ? 'Your order is on the way.' : 'Expected delivery date' };
    return { big: `Expected ${dayName(e.from, { day: 'numeric', month: 'short' })} – ${dayName(e.to)}`, small: 'We will share the exact date when it ships.' };
  }

  async function run(id, phone) {
    $('#err').textContent = '';
    $('#result').innerHTML = '<div class="skeleton" style="height:220px"></div>';
    try {
      const { order: o } = await api(`track?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`);
      const { settings } = await shop();
      const reached = (s) => o.history.find((h) => h.status === s);
      const idx = o.status === 'payment_check' ? 0 : STEPS.findIndex(([s]) => s === o.status);
      const box = eta(o);
      const updates = (o.updates || []).slice().reverse();
      $('#result').innerHTML = `
        <div class="form-card">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:baseline">
            <h2 style="margin:0">Order ${esc(o.id)}</h2><span style="color:var(--muted);font-size:14px">Placed ${when(o.createdAt)}</span>
          </div>
          ${box && !['expired', 'cancelled'].includes(o.status) ? `<div class="eta ${box.tone || ''}"><span class="eta-ic" aria-hidden="true">${o.status === 'delivered' ? icons.home : icons.truck}</span><div><b>${box.big}</b><small>${box.small}</small></div></div>` : ''}
          ${o.status === 'payment_check' ? '<p class="notice warn" style="margin-top:14px">We are checking your payment by hand and will confirm on WhatsApp soon.</p>' : ''}
          ${o.status === 'expired' ? '<p class="notice bad" style="margin-top:14px">Payment was not received in time, so this order was not placed. If money left your account, it will update here by itself once the bank confirms, or message us on WhatsApp.</p>' : o.status === 'cancelled' ? '<p class="notice bad" style="margin-top:14px">This order was cancelled. If you paid, your refund is sent to the same UPI account. Message us on WhatsApp for help.</p>' : `
          <ol class="timeline">
            ${STEPS.map(([s, t, d, ic], i) => {
              const h = reached(s);
              const shippedHere = s === 'shipped' && i <= idx;
              return `<li class="${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><span class="dot">${ic}</span><div><b>${t}</b><small>${h ? when(h.at) + ' · ' : ''}${d}</small>
                ${shippedHere && o.awb ? `<div class="ship-meta">${o.courier ? `<span>${esc(o.courier)}</span>` : ''}<span>Tracking no. <b>${esc(o.awb)}</b> <button type="button" class="remove" data-copy="${esc(o.awb)}">Copy</button></span></div>` : ''}
                ${shippedHere && o.trackingUrl ? `<a class="btn btn-gold track-btn" data-copy="${esc(o.awb || '')}" href="${esc(o.trackingUrl)}" target="_blank" rel="noopener">${icons.truck} Track parcel${o.courier ? ` on ${esc(o.courier)}` : ''}</a><small class="track-hint">Opens the courier's site. Your tracking number is copied, paste it there if asked.</small>` : ''}
                ${shippedHere && updates.length ? `<ul class="ship-log">${updates.map((u) => `<li><b>${esc(u.text)}</b><small>${when(u.at)}</small></li>`).join('')}</ul>` : ''}
              </div></li>`;
            }).join('')}
          </ol>`}
          <div style="border-top:1px dashed var(--line);padding-top:12px;margin-top:6px">
            ${o.items.map((i) => `<div class="totals"><span>${esc(i.name)} × ${i.qty}</span><span>${inr(i.price * i.qty)}</span></div>`).join('')}
            <div class="totals grand" style="margin-top:6px"><span>Total</span><span>${inr(o.total)}</span></div>
          </div>
          ${settings.whatsapp ? `<a class="btn btn-wa" style="margin-top:16px" target="_blank" rel="noopener" href="${waLink(settings.whatsapp, `Hi! Question about my order ${o.id}`)}">${icons.wa} Ask on WhatsApp</a>` : ''}
        </div>`;
      document.querySelectorAll('#result [data-copy]').forEach((el) => el.addEventListener('click', () => {
        const v = el.dataset.copy;
        if (!v) return;
        navigator.clipboard?.writeText(v).then(() => SK.toast('Tracking number copied')).catch(() => {});
      }));
    } catch (e) {
      $('#result').innerHTML = '';
      $('#err').textContent = e.message;
    }
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const id = form.elements.id.value.trim().toUpperCase().replace(/^#/, '');
    const phone = form.elements.phone.value.replace(/\D/g, '').slice(-10);
    if (!/^SK\d{10}$/.test(id)) { $('#err').textContent = 'Order ID looks like SK2611161234'; return; }
    if (phone.length !== 10) { $('#err').textContent = 'Enter your 10-digit mobile number'; return; }
    history.replaceState(null, '', `?id=${id}&phone=${phone}`);
    run(id, phone);
  };
  const p = new URLSearchParams(location.search);
  let last = null;
  try { last = JSON.parse(localStorage.getItem('sk-last-order') || 'null'); } catch {}
  const id = p.get('id') || last?.id, phone = p.get('phone') || last?.phone;
  if (id) form.elements.id.value = id;
  if (phone) form.elements.phone.value = phone;
  if (id && phone) run(id, phone);
})();
