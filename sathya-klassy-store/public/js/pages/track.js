(() => {
  const { $, esc, inr, icons, api, shop, waLink } = SK;
  const form = $('#form');
  const STEPS = [
    ['awaiting_payment', 'Waiting for payment', 'The order is placed once your UPI payment reaches us', icons.upi],
    ['confirmed', 'Order placed', 'Payment received. We are getting it ready', icons.check],
    ['packed', 'Packed with love', 'Your order is packed', icons.gift],
    ['shipped', 'Shipped', 'On the way to you', icons.truck],
    ['delivered', 'Delivered', 'Enjoy! Tag us on Instagram 💗', icons.home],
  ];
  const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  async function run(id, phone) {
    $('#err').textContent = '';
    $('#result').innerHTML = '<div class="skeleton" style="height:220px"></div>';
    try {
      const { order: o } = await api(`track?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`);
      const { settings } = await shop();
      const reached = (s) => o.history.find((h) => h.status === s);
      const idx = o.status === 'payment_check' ? 0 : STEPS.findIndex(([s]) => s === o.status);
      $('#result').innerHTML = `
        <div class="form-card">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:baseline">
            <h2 style="margin:0">Order ${esc(o.id)}</h2><span style="color:var(--muted);font-size:14px">Placed ${when(o.createdAt)}</span>
          </div>
          ${o.status === 'payment_check' ? '<p class="notice warn" style="margin-top:14px">We are checking your payment by hand and will confirm on WhatsApp soon.</p>' : ''}
          ${o.status === 'expired' ? '<p class="notice bad" style="margin-top:14px">Payment was not received in time, so this order was not placed. If money left your account, it will update here by itself once the bank confirms, or message us on WhatsApp.</p>' : o.status === 'cancelled' ? '<p class="notice bad" style="margin-top:14px">This order was cancelled. If you paid, your refund is sent to the same UPI account. Message us on WhatsApp for help.</p>' : `
          <ol class="timeline">
            ${STEPS.map(([s, t, d, ic], i) => {
              const h = reached(s);
              return `<li class="${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><span class="dot">${ic}</span><div><b>${t}</b><small>${h ? when(h.at) + ' · ' : ''}${d}</small>
                ${s === 'shipped' && o.awb && i <= idx ? `<br><small>Courier: <b>${esc(o.courier || '')}</b> · Tracking no: <b>${esc(o.awb)}</b>${o.trackingUrl ? ` · <a href="${esc(o.trackingUrl)}" target="_blank" rel="noopener">Track with courier</a>` : ''}</small>` : ''}</div></li>`;
            }).join('')}
          </ol>`}
          <div style="border-top:1px dashed var(--line);padding-top:12px;margin-top:6px">
            ${o.items.map((i) => `<div class="totals"><span>${esc(i.name)} × ${i.qty}</span><span>${inr(i.price * i.qty)}</span></div>`).join('')}
            <div class="totals grand" style="margin-top:6px"><span>Total</span><span>${inr(o.total)}</span></div>
          </div>
          ${settings.whatsapp ? `<a class="btn btn-wa" style="margin-top:16px" target="_blank" rel="noopener" href="${waLink(settings.whatsapp, `Hi! Question about my order ${o.id}`)}">${icons.wa} Ask on WhatsApp</a>` : ''}
        </div>`;
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
