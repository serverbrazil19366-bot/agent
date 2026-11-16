// Checkout: address → unique UPI amount → wait for the bank to confirm → placed.
(async () => {
  const { $, esc, inr, icons, api, shop, cart, cartLines, shippingFor, thumb, waLink, toast } = SK;
  const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
  const PENDING = 'sk-pending-order';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const app = $('#app');
  let settings;

  // a payment already in progress on this phone? go straight back to it
  const resume = store.get(PENDING);
  if (resume && resume.id && resume.key) {
    settings = (await shop()).settings;
    return payScreen(resume);
  }

  const form = $('#form');
  $('#state').innerHTML = '<option value="">Choose state</option>' + STATES.map((s) => `<option${s === 'Tamil Nadu' ? ' selected' : ''}>${s}</option>`).join('');
  const saved = store.get('sk-address');
  if (saved) for (const k of ['name', 'phone', 'address', 'city', 'pincode', 'state']) if (saved[k]) form.elements[k].value = saved[k];

  let total = 0, lines = [];
  async function render() {
    const [{ lines: l, subtotal }, s] = await Promise.all([cartLines(), shop()]);
    lines = l; settings = s.settings;
    if (!lines.length) {
      app.innerHTML = `<div class="empty" style="padding:80px 10px">${icons.bag}<h1 style="font-family:var(--serif)">Your cart is empty</h1><p>Add something cute first!</p><a class="btn btn-pink" href="/shop">Go to shop</a></div>`;
      return false;
    }
    const ship = shippingFor(subtotal, settings);
    total = subtotal + ship;
    $('#summary').innerHTML = lines.map((x) => `
      <div class="line" style="grid-template-columns:56px 1fr auto">${thumb(x.p)}<div><b>${esc(x.p.name)}</b><small>${x.qty} × ${inr(x.p.price)}</small></div><b>${inr(x.p.price * x.qty)}</b></div>`).join('') + `
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px">
        <div class="totals"><span>Subtotal</span><span>${inr(subtotal)}</span></div>
        <div class="totals"><span>Shipping</span><span>${ship ? inr(ship) : 'Free'}</span></div>
        <div class="totals grand"><span>Total</span><span>${inr(total)}</span></div>
        ${ship ? `<small style="color:var(--muted)">Add ${inr(settings.freeShippingAbove - subtotal)} more for free shipping. <a href="/shop">Shop more</a></small>` : ''}
      </div>`;
    const btn = $('#place');
    if (!settings.upiId) {
      btn.disabled = true;
      $('#err').innerHTML = settings.whatsapp
        ? `Online payment is being set up. <a target="_blank" rel="noopener" href="${waLink(settings.whatsapp, 'Hi! I want to order:\n' + lines.map((x) => `• ${x.p.name} × ${x.qty}`).join('\n') + '\nTotal: ' + inr(total))}">Order on WhatsApp</a>`
        : 'Online payment is being set up. Please try again soon.';
    } else btn.textContent = `Continue to pay ${inr(total)}`;
    return true;
  }
  if (!(await render())) return;
  document.addEventListener('cart:change', render);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const err = $('#err');
    err.textContent = '';
    const phone = String(f.phone).replace(/\D/g, '').slice(-10);
    const problems = [];
    if (!f.name.trim()) problems.push('your name');
    if (!/^[6-9]\d{9}$/.test(phone)) problems.push('a valid 10-digit mobile number');
    if (!f.address.trim() || !f.city.trim() || !f.state) problems.push('your full address');
    if (!/^[1-9]\d{5}$/.test(f.pincode)) problems.push('a 6-digit pincode');
    if (problems.length) { err.textContent = 'Please enter ' + problems.join(', ') + '.'; return; }
    const btn = $('#place');
    btn.disabled = true; btn.textContent = 'Getting your payment ready…';
    try {
      const res = await api('orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: { name: f.name, phone, address: f.address, city: f.city, state: f.state, pincode: f.pincode },
          note: f.note, website: f.website, expectedTotal: total,
          items: lines.map((x) => ({ id: x.id, qty: x.qty })),
        }),
      });
      store.set('sk-address', { name: f.name, phone, address: f.address, city: f.city, state: f.state, pincode: f.pincode });
      const pending = { id: res.order.id, key: res.key, phone, upi: res.upi };
      store.set(PENDING, pending);
      document.removeEventListener('cart:change', render);
      payScreen(pending, res.order);
    } catch (ex) {
      err.textContent = ex.message;
      btn.disabled = false; btn.textContent = `Continue to pay ${inr(total)}`;
    }
  };

  // ---------- step 2: pay & wait ----------
  async function payScreen(pending, order) {
    scrollTo({ top: 0 });
    let timer, poll, claimed = false;
    const stop = () => { clearInterval(timer); clearTimeout(poll); };
    try { order = order || (await api(`orders/${pending.id}/status?k=${pending.key}`)).order; }
    catch { store.del(PENDING); location.reload(); return; }

    function draw(o) {
      if (o.paid) return placed(o);
      if (o.status === 'expired') return expired(o);
      if (o.status === 'payment_check') claimed = true;
      const upi = pending.upi || { id: settings.upiId, name: settings.upiName || settings.shopName };
      const link = `upi://pay?pa=${encodeURIComponent(upi.id)}&pn=${encodeURIComponent(upi.name)}&am=${o.payable}&cu=INR&tn=${encodeURIComponent('Order ' + o.id)}`;
      let qrSvg = '';
      try { const qr = qrcode(0, 'M'); qr.addData(link); qr.make(); qrSvg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch {}
      const mobile = matchMedia('(pointer: coarse)').matches;
      app.innerHTML = `
        <div class="pay-wrap">
          <div class="form-card pay-card">
            <span class="eyebrow">Order ${esc(o.id)}</span>
            <h1 class="pay-title">Pay <span class="pay-amount">₹${esc(o.payable)}</span></h1>
            <p class="pay-why">Please pay <b>exactly ₹${esc(o.payable)}</b>. The paise help us match your payment to your order automatically.</p>
            <div class="upi">
              <div class="qr" role="img" aria-label="UPI QR code to pay ₹${esc(o.payable)}">${qrSvg}</div>
              <div style="display:flex;flex-direction:column;gap:6px;min-width:0">
                <span style="color:var(--muted);font-size:13px">Pay to UPI ID</span>
                <span class="upi-id">${esc(upi.id)} <button type="button" class="remove" id="copy-upi">Copy</button></span>
                <span style="font-size:13px;color:var(--muted)">Scan with GPay, PhonePe, Paytm or any UPI app.</span>
              </div>
            </div>
            ${mobile ? `<a class="btn btn-gold btn-block" style="margin-top:16px" href="${link}">${icons.upi} Pay ₹${esc(o.payable)} with UPI app</a>` : ''}
            <div class="wait" role="status" aria-live="polite">
              <span class="pulse" aria-hidden="true"></span>
              <div><b>${claimed ? 'We are checking your payment' : 'Waiting for your payment…'}</b>
                <small>${claimed ? 'We will confirm on WhatsApp soon. This page also updates by itself.' : 'This page updates by itself as soon as the money reaches us.'}</small></div>
              ${claimed ? '' : '<span class="countdown" id="cd"></span>'}
            </div>
            <div id="claim"></div>
          </div>
          <p class="secure-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> Your order is placed only after your payment is received. Never share your UPI PIN or OTP with anyone.</p>
          <button type="button" class="remove" id="cancel-pay" style="align-self:center">Change my cart</button>
        </div>`;
      $('#copy-upi').onclick = async () => { try { await navigator.clipboard.writeText(upi.id); toast('UPI ID copied'); } catch {} };
      $('#cancel-pay').onclick = () => { stop(); store.del(PENDING); location.href = '/shop'; };
      const tick = () => {
        const left = Math.max(0, o.expiresAt - Date.now());
        if ($('#cd')) $('#cd').textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
        if (!claimed && Date.now() - Date.parse(o.createdAt) > 3 * 60000 && !$('#claim').dataset.on) showClaim(o);
      };
      clearInterval(timer); timer = setInterval(tick, 1000); tick();
    }

    function showClaim(o) {
      const box = $('#claim');
      box.dataset.on = '1';
      box.innerHTML = `
        <details class="claim"><summary>I have paid, but this is still waiting</summary>
          <p>Bank messages can take a few minutes. If money left your account, enter the 12-digit UPI reference (UTR) from your payment app and we will check it by hand.</p>
          <label class="f">UPI reference (UTR)<input id="utr" inputmode="numeric" maxlength="12" placeholder="Eg. 412345678901"></label>
          <p class="err" id="claim-err" role="alert"></p>
          <button type="button" class="btn btn-ghost" id="claim-btn">Send for checking</button>
        </details>`;
      $('#claim-btn').onclick = async () => {
        try {
          const r = await api(`orders/${o.id}/paid`, { method: 'POST', body: JSON.stringify({ k: pending.key, utr: $('#utr').value }) });
          claimed = true; draw(r.order);
        } catch (e) { $('#claim-err').textContent = e.message; }
      };
    }

    function expired(o) {
      stop();
      app.innerHTML = `
        <div class="success">
          <h1>Payment not received</h1>
          <p>We did not receive ₹${esc(o.payable)} within 15 minutes, so the order was not placed and nothing was booked.</p>
          <p style="color:var(--muted);font-size:14px">If money already left your account, don't worry: it updates here by itself when the bank confirms, or message us with order ID <b>${esc(o.id)}</b>.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px">
            <button class="btn btn-pink" id="again">Try again</button>
            ${settings.whatsapp ? `<a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(settings.whatsapp, `Hi! I paid for order ${o.id} but it says not received.`)}">${icons.wa} Message us</a>` : ''}
          </div>
        </div>`;
      $('#again').onclick = () => { store.del(PENDING); location.reload(); };
      poll = setTimeout(check, 20000); // a late bank SMS can still confirm it
    }

    function placed(o) {
      stop();
      store.del(PENDING);
      cart.clear();
      store.set('sk-last-order', { id: o.id, phone: pending.phone });
      const msg = `Hi Sathya Klassy! 💗 I placed order ${o.id} and paid ₹${o.payable}.`;
      app.innerHTML = `
        <div class="success">
          <div class="tick">${icons.check}</div>
          <h1>Order placed, ${esc(o.name)}!</h1>
          <p>We received your payment of <b>₹${esc(o.payable)}</b>. We'll pack it with love and send updates on WhatsApp.</p>
          <div class="order-id">${esc(o.id)}</div>
          <p style="color:var(--muted);font-size:14px">Save this order ID to track your order.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:12px">
            <a class="btn btn-pink" href="/track?id=${encodeURIComponent(o.id)}&phone=${pending.phone}">Track order</a>
            ${settings.whatsapp ? `<a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(settings.whatsapp, msg)}">${icons.wa} Say hi on WhatsApp</a>` : ''}
          </div>
        </div>`;
      scrollTo({ top: 0 });
      if (window.FX) { FX.shower(); setTimeout(() => FX.shower(60), 1400); }
    }

    async function check() {
      try {
        const { order: o } = await api(`orders/${pending.id}/status?k=${pending.key}`);
        if (o.paid) return placed(o);
        if (o.status === 'expired') { if (!app.querySelector('#again')) expired(o); else poll = setTimeout(check, 20000); return; }
        if (o.status === 'payment_check' && !claimed) { claimed = true; draw(o); }
      } catch {}
      poll = setTimeout(check, document.hidden ? 8000 : 4000);
    }
    draw(order);
    if (!order.paid) poll = setTimeout(check, 4000);
  }
})();
