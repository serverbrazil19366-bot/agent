// Sathya Klassy admin panel: dashboard, orders, products, settings.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const TOKEN = 'sk-admin-token';
  const STATUS = {
    payment_check: 'Check payment', confirmed: 'Confirmed', packed: 'Packed',
    shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  const FLOW = ['payment_check', 'confirmed', 'packed', 'shipped', 'delivered'];
  const pill = (s) => `<span class="pill s-${s}">${STATUS[s] || s}</span>`;
  const ICON = {
    wa: '<svg viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.7L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2zm4.4 11.7c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.7 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></svg>',
  };

  let state = { tab: 'dash', categories: [], settings: null, orderFilter: 'payment_check' };

  // ---------- api ----------
  async function api(path, opts = {}) {
    const res = await fetch('/api/' + path, {
      ...opts,
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (localStorage.getItem(TOKEN) || ''), ...(opts.headers || {}) },
    });
    if (res.status === 401 && !path.startsWith('admin/login')) { logout(); throw new Error('Please log in again'); }
    const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.blob();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ---------- auth ----------
  function logout() {
    try { localStorage.removeItem(TOKEN); } catch {}
    $('#app').hidden = true; $('#login').hidden = false;
  }
  $('#login-form').onsubmit = async (e) => {
    e.preventDefault();
    $('#login-err').textContent = '';
    try {
      const { token } = await api('admin/login', { method: 'POST', body: JSON.stringify({ password: e.target.password.value }) });
      localStorage.setItem(TOKEN, token);
      e.target.reset();
      start();
    } catch (ex) { $('#login-err').textContent = ex.message; }
  };
  $('#logout').onclick = logout;

  // ---------- navigation ----------
  $$('.tabs button').forEach((b) => (b.onclick = () => go(b.dataset.tab)));
  function go(tab) {
    state.tab = tab;
    $$('.tabs button').forEach((b) => (b.dataset.tab === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
    try { sessionStorage.setItem('sk-admin-tab', tab); } catch {}
    ({ dash, orders, products, settings }[tab])();
    scrollTo({ top: 0 });
  }
  const main = () => $('#main');
  const loading = () => (main().innerHTML = '<div class="skeleton" style="height:120px;margin-bottom:14px"></div><div class="skeleton" style="height:300px"></div>');

  // ---------- dashboard ----------
  async function dash() {
    loading();
    let s;
    try { s = await api('admin/stats'); } catch (e) { main().innerHTML = `<p class="notice warn">${esc(e.message)}</p>`; return; }
    badge(s.toVerify);
    const change = s.revenueLastMonth ? Math.round(((s.revenueMonth - s.revenueLastMonth) / s.revenueLastMonth) * 100) : null;
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    main().innerHTML = `
      <div class="page-top">
        <div><h1 class="page">${hello}, Sathya 💗</h1><p class="sub">Here's how the shop is doing.</p></div>
        <button class="btn btn-line" id="csv">${ICON.down} Download orders (Excel)</button>
      </div>
      ${s.sampleCount ? `<p class="notice warn" style="margin:0 0 16px">${s.sampleCount} sample products are showing on the website. Open <b>Products</b> to add your real photos, prices and cost prices.</p>` : ''}
      ${!state.settings?.upiId ? '<p class="notice warn" style="margin:0 0 16px">Add your <b>UPI ID</b> and <b>WhatsApp number</b> in <b>Settings</b> so customers can pay and order.</p>' : ''}
      <div class="kpis">
        <div class="kpi hot"><span>Orders today</span><b>${s.ordersToday}</b><small>${inr(s.revenueToday)} sales</small></div>
        <div class="kpi"><span>Sales this month</span><b>${inr(s.revenueMonth)}</b><small>${s.ordersMonth} orders${change !== null ? ` · ${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}% vs last month` : ''}</small></div>
        <div class="kpi"><span>Estimated profit this month</span><b>${inr(s.profitMonth)}</b><small>${s.profitComplete ? 'Sales minus product cost' : 'Some products have no cost price'}</small></div>
        <div class="kpi"><span>Customers</span><b>${s.customers}</b><small>Different mobile numbers</small></div>
      </div>
      <div class="dash">
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="card"><h2>Sales, last 14 days <small style="font-weight:400;color:var(--muted)">₹ per day</small></h2><div class="chart">${barChart(s.daily)}</div></div>
          <div class="card"><h2>Month by month</h2>
            <div style="overflow-x:auto"><table class="t"><thead><tr><th>Month</th><th class="n">Orders</th><th class="n">Sales</th><th class="n">Est. profit</th></tr></thead><tbody>
            ${s.monthly.slice().reverse().map((m) => `<tr><td>${new Date(m.month + '-15').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</td><td class="n">${m.orders}</td><td class="n">${inr(m.revenue)}</td><td class="n">${inr(m.profit)}</td></tr>`).join('')}
            </tbody></table></div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="card"><h2>To do</h2><div class="todo">
            <button data-f="payment_check"><span>Payments to check</span><b>${s.toVerify}</b></button>
            <button data-f="ship"><span>Orders to pack &amp; ship</span><b>${s.toShip}</b></button>
            <button data-f="shipped"><span>On the way</span><b>${s.statusCounts.shipped}</b></button>
          </div></div>
          <div class="card"><h2>Best sellers this month</h2><div class="rows">
            ${s.bestSellers.map((b) => `<div><span>${esc(b.name)} <small style="color:var(--muted)">× ${b.qty}</small></span><b>${inr(b.revenue)}</b></div>`).join('') || '<p class="sub">No sales yet this month.</p>'}
          </div></div>
          <div class="card"><h2>Low stock</h2><div class="rows">
            ${s.lowStock.map((p) => `<div><span>${esc(p.name)}</span><b style="color:${p.stock ? 'var(--warn)' : 'var(--bad)'}">${p.stock ? p.stock + ' left' : 'Sold out'}</b></div>`).join('') || '<p class="sub">All good 👍</p>'}
          </div></div>
        </div>
      </div>`;
    $('#csv').onclick = downloadCsv;
    $$('.todo button').forEach((b) => (b.onclick = () => { state.orderFilter = b.dataset.f; go('orders'); }));
  }
  function barChart(days) {
    const W = 640, H = 220, padL = 44, padB = 26, padT = 18;
    const max = Math.max(500, ...days.map((d) => d.revenue));
    const step = Math.pow(10, Math.floor(Math.log10(max))) * (max / Math.pow(10, Math.floor(Math.log10(max))) > 5 ? 2 : 1) / 2;
    const top = Math.ceil(max / step) * step;
    const bw = (W - padL) / days.length;
    const y = (v) => padT + (H - padT - padB) * (1 - v / top);
    const ticks = [];
    for (let v = 0; v <= top; v += step) ticks.push(v);
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily sales for the last 14 days">
      ${ticks.map((v) => `<line x1="${padL}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#f3e6ec" stroke-width="1"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10.5" fill="#7a6170">${v >= 1000 ? v / 1000 + 'k' : v}</text>`).join('')}
      ${days.map((d, i) => {
        const x = padL + i * bw + bw * 0.18, w = bw * 0.64, yy = y(d.revenue), last = i === days.length - 1;
        return `<g><title>${d.day}: ${inr(d.revenue)}, ${d.orders} orders</title>
          <rect x="${x}" y="${yy}" width="${w}" height="${Math.max(0, H - padB - yy)}" rx="4" fill="${last ? '#c23f74' : '#f2a9c3'}"/>
          <text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="#7a6170">${Number(d.day.slice(8))}</text></g>`;
      }).join('')}
    </svg>`;
  }
  async function downloadCsv() {
    try {
      const blob = await api('admin/orders/export.csv');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sathya-klassy-orders.csv';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) { toast(e.message); }
  }
  function badge(n) {
    const b = $('#badge-orders');
    b.hidden = !n; b.textContent = n;
  }

  // ---------- orders ----------
  let orderCache = [];
  async function orders() {
    loading();
    try { orderCache = (await api('admin/orders')).orders; } catch (e) { main().innerHTML = `<p class="notice warn">${esc(e.message)}</p>`; return; }
    const count = (f) => orderCache.filter(match(f)).length;
    badge(count('payment_check'));
    const filters = [['all', 'All'], ['payment_check', 'Check payment'], ['ship', 'To ship'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];
    main().innerHTML = `
      <div class="page-top"><div><h1 class="page">Orders</h1><p class="sub">${orderCache.length} orders in total</p></div>
        <input class="search" id="osearch" type="search" placeholder="Search name, phone or order ID" aria-label="Search orders"></div>
      <div class="chips" role="group" aria-label="Filter orders">${filters.map(([k, t]) => `<button class="chip" data-f="${k}" aria-pressed="${state.orderFilter === k}">${t}<b>${count(k)}</b></button>`).join('')}</div>
      <div class="olist" id="olist"></div>`;
    $$('.chips .chip').forEach((c) => (c.onclick = () => { state.orderFilter = c.dataset.f; $$('.chips .chip').forEach((x) => x.setAttribute('aria-pressed', x === c)); list(); }));
    $('#osearch').oninput = list;
    list();
  }
  const match = (f) => (o) => f === 'all' || (f === 'ship' ? ['confirmed', 'packed'].includes(o.status) : o.status === f);
  function list() {
    const term = $('#osearch').value.trim().toLowerCase();
    const items = orderCache.filter(match(state.orderFilter)).filter((o) => !term || [o.id, o.customer.name, o.customer.phone, o.customer.city].join(' ').toLowerCase().includes(term));
    $('#olist').innerHTML = items.map((o) => `
      <button class="orow" data-id="${o.id}">
        <span><b>${esc(o.id)}</b><small>${when(o.createdAt)}</small></span>
        <span class="items"><b>${esc(o.customer.name)} · ${esc(o.customer.city)}</b><small>${o.items.map((i) => esc(i.name) + ' × ' + i.qty).join(', ')}</small></span>
        <span>${pill(o.status)}</span>
        <span class="amt">${inr(o.total)}</span>
      </button>`).join('') || '<div class="empty">No orders here yet.</div>';
    $$('.orow').forEach((r) => (r.onclick = () => openOrder(orderCache.find((o) => o.id === r.dataset.id))));
  }

  function waMessage(o) {
    const site = location.origin;
    const track = `${site}/track?id=${o.id}&phone=${o.customer.phone}`;
    const first = o.customer.name.split(' ')[0];
    const m = {
      payment_check: `Hi ${first}! 💗 Thank you for ordering from Sathya Klassy Fashion. We got your order ${o.id} (${inr(o.total)}) and are checking your payment. We'll confirm soon!`,
      confirmed: `Hi ${first}! 💗 Your Sathya Klassy order ${o.id} is confirmed. We received your payment of ${inr(o.total)}. We'll pack it with love and ship it soon.\nTrack: ${track}`,
      packed: `Hi ${first}! 🎀 Your order ${o.id} is packed and will be shipped soon.\nTrack: ${track}`,
      shipped: `Hi ${first}! 🚚 Your order ${o.id} is shipped!${o.courier ? `\nCourier: ${o.courier}` : ''}${o.awb ? `\nTracking no: ${o.awb}` : ''}${o.trackingUrl ? `\n${o.trackingUrl}` : ''}\nTrack: ${track}`,
      delivered: `Hi ${first}! 💗 Your order ${o.id} is delivered. Hope you love it! Please share a photo or review and tag us on Instagram @${state.settings?.instagram || 'sathya_klassy_fashion'} ✨`,
      cancelled: `Hi ${first}, your order ${o.id} has been cancelled. If you paid, the refund of ${inr(o.total)} will reach the same UPI account within 3 working days. Sorry for the trouble!`,
    };
    return m[o.status];
  }

  function openOrder(o) {
    const c = o.customer;
    const address = `${c.name}\n${c.address}\n${c.city}, ${c.state} - ${c.pincode}\nPhone: ${c.phone}`;
    const cost = o.items.reduce((s, i) => s + (i.cost ?? 0) * i.qty, 0);
    const next = FLOW[FLOW.indexOf(o.status) + 1];
    dialog(`
      <div class="dlg-head"><h2>${esc(o.id)} ${pill(o.status)}</h2><button class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body">
        ${o.status === 'payment_check' ? `<div class="notice warn">Open your bank or UPI app and check that <b>${inr(o.total)}</b> arrived with transaction ID <b>${esc(o.payment.utr)}</b>. Then press <b>Payment received</b>.</div>` : ''}
        <div class="box"><h3>Customer</h3>
          <div style="white-space:pre-line">${esc(address)}</div>
          ${o.note ? `<p style="margin:8px 0 0"><b>Note:</b> ${esc(o.note)}</p>` : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
            <button class="btn btn-line btn-sm" id="copy-addr">Copy address</button>
            <a class="btn btn-line btn-sm" href="tel:+91${c.phone}">Call</a>
            <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="https://wa.me/91${c.phone}">${ICON.wa} Chat</a>
          </div></div>
        <div class="box"><h3>Items</h3><div class="rows">
          ${o.items.map((i) => `<div><span>${esc(i.name)} × ${i.qty}</span><b>${inr(i.price * i.qty)}</b></div>`).join('')}
          <div><span>Shipping</span><span>${o.shipping ? inr(o.shipping) : 'Free'}</span></div>
          <div><b>Total paid</b><b>${inr(o.total)}</b></div>
          <div><span>Product cost · est. profit</span><span>${inr(cost)} · <b style="color:var(--ok)">${inr(o.subtotal - cost)}</b></span></div>
        </div>
        <p style="margin:8px 0 0;font-size:13px">UPI transaction ID: <b>${esc(o.payment.utr)}</b> · ${o.payment.verified ? '<span style="color:var(--ok);font-weight:600">Payment checked ✓</span>' : '<span style="color:var(--warn);font-weight:600">Not checked yet</span>'}</p></div>
        ${o.status !== 'cancelled' ? `
        <div class="box"><h3>Shipping details</h3><div class="fields">
          <label class="f">Courier<input id="courier" value="${esc(o.courier)}" placeholder="Eg. DTDC, India Post"></label>
          <label class="f">Tracking number<input id="awb" value="${esc(o.awb)}"></label>
          <label class="f full">Tracking link <small>optional</small><input id="turl" value="${esc(o.trackingUrl)}" placeholder="https://"></label>
        </div><button class="btn btn-line btn-sm" id="save-ship" style="margin-top:10px">Save shipping details</button></div>` : ''}
        <div class="box"><h3>History</h3><div class="rows">${o.history.map((h) => `<div><span>${STATUS[h.status]}</span><small style="color:var(--muted)">${when(h.at)}</small></div>`).join('')}</div></div>
        <p class="err" id="oerr" role="alert"></p>
      </div>
      <div class="dlg-foot">
        ${o.status !== 'cancelled' && o.status !== 'delivered' ? '<button class="btn btn-bad" id="cancel">Cancel order</button>' : ''}
        <a class="btn btn-wa" id="wa" target="_blank" rel="noopener" href="https://wa.me/91${c.phone}?text=${encodeURIComponent(waMessage(o))}">${ICON.wa} Send WhatsApp update</a>
        ${next ? `<button class="btn btn-pink" id="next">${o.status === 'payment_check' ? 'Payment received ✓' : 'Mark as ' + STATUS[next]}</button>` : ''}
      </div>`);
    $('#copy-addr').onclick = async () => { try { await navigator.clipboard.writeText(address); toast('Address copied'); } catch { toast('Could not copy'); } };
    const save = async (body, msg) => {
      $('#oerr').textContent = '';
      try {
        const { order } = await api('admin/orders/' + o.id, { method: 'PUT', body: JSON.stringify(body) });
        Object.assign(o, order);
        const i = orderCache.findIndex((x) => x.id === o.id); if (i >= 0) orderCache[i] = order;
        toast(msg);
        openOrder(order);
        if (state.tab === 'orders') { list(); badge(orderCache.filter(match('payment_check')).length); }
      } catch (e) { $('#oerr').textContent = e.message; }
    };
    const shipFields = () => $('#courier') ? { courier: $('#courier').value, awb: $('#awb').value, trackingUrl: $('#turl').value } : {};
    if ($('#save-ship')) $('#save-ship').onclick = () => save(shipFields(), 'Saved');
    if ($('#next')) $('#next').onclick = () => {
      if (next === 'shipped' && !$('#awb').value.trim() && !confirm('No tracking number yet. Mark as shipped anyway?')) return;
      save({ status: next, ...shipFields() }, 'Marked as ' + STATUS[next] + '. Now send the WhatsApp update 💬');
    };
    if ($('#cancel')) $('#cancel').onclick = () => {
      if (confirm(`Cancel order ${o.id}? Stock goes back. If the customer paid, refund ${inr(o.total)} to them by UPI.`)) save({ status: 'cancelled' }, 'Order cancelled');
    };
  }

  // ---------- products ----------
  let productCache = [];
  async function products() {
    loading();
    try { const d = await api('admin/products'); productCache = d.products; state.categories = d.categories; }
    catch (e) { main().innerHTML = `<p class="notice warn">${esc(e.message)}</p>`; return; }
    main().innerHTML = `
      <div class="page-top"><div><h1 class="page">Products</h1><p class="sub">${productCache.length} products · tap one to edit</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><input class="search" id="psearch" type="search" placeholder="Search products" aria-label="Search products">
        <button class="btn btn-pink" id="padd">${ICON.plus} Add product</button></div></div>
      <div class="chips" role="group" aria-label="Filter by category"><button class="chip" data-c="" aria-pressed="true">All</button>${state.categories.map((c) => `<button class="chip" data-c="${c.slug}" aria-pressed="false">${esc(c.name)}</button>`).join('')}</div>
      <div class="pgrid" id="pgrid"></div>`;
    let cat = '';
    const draw = () => {
      const term = $('#psearch').value.trim().toLowerCase();
      $('#pgrid').innerHTML = productCache.filter((p) => (!cat || p.category === cat) && (!term || p.name.toLowerCase().includes(term))).map((p) => `
        <button class="pcard ${p.active ? '' : 'off'}" data-id="${p.id}">
          <span class="im">${p.images[0] ? `<img src="${esc(p.images[0])}" alt="" loading="lazy">` : ICON.box}
            ${p.sample ? '<span class="pill s-payment_check">Sample</span>' : !p.active ? '<span class="pill s-cancelled">Hidden</span>' : p.stock === 0 ? '<span class="pill s-cancelled">Sold out</span>' : ''}</span>
          <span class="pb"><b>${esc(p.name)}</b><span>${inr(p.price)}${p.cost !== null && p.cost !== undefined ? ` <small>· cost ${inr(p.cost)}</small>` : ''}</span>
            <small>${p.stock === null || p.stock === undefined ? 'Stock not tracked' : p.stock + ' in stock'}</small></span>
        </button>`).join('') || '<div class="empty" style="grid-column:1/-1">No products found.</div>';
      $$('.pcard').forEach((b) => (b.onclick = () => editProduct(productCache.find((p) => p.id === b.dataset.id))));
    };
    $$('.chips .chip').forEach((c) => (c.onclick = () => { cat = c.dataset.c; $$('.chips .chip').forEach((x) => x.setAttribute('aria-pressed', x === c)); draw(); }));
    $('#psearch').oninput = draw;
    $('#padd').onclick = () => editProduct(null);
    draw();
  }

  function editProduct(p) {
    const isNew = !p;
    p = p || { name: '', category: state.categories[0]?.slug, price: '', mrp: '', cost: '', stock: '', tag: '', description: '', images: [], active: true, featured: false };
    let images = [...(p.images || [])];
    const v = (x) => (x === null || x === undefined ? '' : x);
    dialog(`
      <form id="pform" novalidate>
      <div class="dlg-head"><h2>${isNew ? 'Add product' : 'Edit product'}</h2><button type="button" class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body">
        ${p.sample ? '<p class="notice warn" style="margin:0">This is a sample product. Change the name, price and photos to make it yours, or delete it.</p>' : ''}
        <div><div class="f" style="margin-bottom:6px">Photos <small>first photo is the main one · up to 8</small></div><div class="imgs" id="imgs"></div></div>
        <div class="fields">
          <label class="f full">Product name<input name="name" value="${esc(p.name)}" required maxlength="120"></label>
          <label class="f">Category<select name="category">${state.categories.map((c) => `<option value="${c.slug}" ${c.slug === p.category ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <label class="f">Tag <small>optional, eg. NEW, BESTSELLER</small><input name="tag" value="${esc(p.tag)}" maxlength="20"></label>
          <label class="f">Selling price (₹)<input name="price" type="number" inputmode="numeric" min="1" value="${v(p.price)}" required></label>
          <label class="f">MRP (₹) <small>optional, shown crossed out</small><input name="mrp" type="number" inputmode="numeric" min="0" value="${v(p.mrp)}"></label>
          <label class="f">Your cost (₹) <small>wholesale price, only you see this</small><input name="cost" type="number" inputmode="numeric" min="0" value="${v(p.cost)}"></label>
          <label class="f">Stock <small>leave empty if you don't count</small><input name="stock" type="number" inputmode="numeric" min="0" value="${v(p.stock)}"></label>
          <label class="f full">Description<textarea name="description" maxlength="2000">${esc(p.description)}</textarea></label>
          <label class="check"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Show on home page</label>
          <label class="check"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Show on website</label>
        </div>
        <p id="margin" class="sub" style="margin:0"></p>
        <p class="err" id="perr" role="alert"></p>
      </div>
      <div class="dlg-foot">
        ${isNew ? '' : '<button type="button" class="btn btn-bad" id="pdel">Delete</button>'}
        <button type="submit" class="btn btn-pink" id="psave">Save</button>
      </div></form>`);
    const form = $('#pform');
    const showMargin = () => {
      const price = Number(form.price.value), cost = Number(form.cost.value);
      $('#margin').innerHTML = price && form.cost.value !== '' ? `Profit per piece: <b style="color:${price - cost > 0 ? 'var(--ok)' : 'var(--bad)'}">${inr(price - cost)}</b> (${Math.round(((price - cost) / price) * 100)}% margin)${price < cost * 2.5 ? ' · <span style="color:var(--warn)">Tip: price at least 2.5× cost to cover shipping and ads</span>' : ''}` : '';
    };
    form.price.oninput = form.cost.oninput = showMargin; showMargin();
    const drawImgs = () => {
      $('#imgs').innerHTML = images.map((src, i) => `<div class="im"><img src="${esc(src)}" alt="">${i === 0 ? '<span class="first">Main</span>' : `<button type="button" class="first" data-main="${i}" style="border:0;cursor:pointer">Make main</button>`}<button type="button" data-rm="${i}" aria-label="Remove photo">×</button></div>`).join('')
        + (images.length < 8 ? `<label class="add-img">${ICON.cam}Add photo<input type="file" accept="image/*" multiple hidden id="file"></label>` : '');
      $$('[data-rm]', $('#imgs')).forEach((b) => (b.onclick = () => { images.splice(Number(b.dataset.rm), 1); drawImgs(); }));
      $$('[data-main]', $('#imgs')).forEach((b) => (b.onclick = () => { const [x] = images.splice(Number(b.dataset.main), 1); images.unshift(x); drawImgs(); }));
      if ($('#file')) $('#file').onchange = async (e) => {
        const files = [...e.target.files].slice(0, 8 - images.length);
        for (const f of files) {
          try {
            toast('Uploading photo…');
            const dataUrl = await shrink(f);
            const { url } = await api('admin/upload', { method: 'POST', body: JSON.stringify({ dataUrl }) });
            images.push(url); drawImgs();
          } catch (ex) { $('#perr').textContent = ex.message; }
        }
        toast('Photo added');
      };
    };
    drawImgs();
    form.onsubmit = async (e) => {
      e.preventDefault();
      $('#perr').textContent = '';
      const body = {
        name: form.name.value, category: form.category.value, tag: form.tag.value, price: form.price.value,
        mrp: form.mrp.value, cost: form.cost.value, stock: form.stock.value, description: form.description.value,
        featured: form.featured.checked, active: form.active.checked, images,
      };
      if (!body.name.trim()) { $('#perr').textContent = 'Please enter a product name'; return; }
      if (!(Number(body.price) > 0)) { $('#perr').textContent = 'Please enter the selling price'; return; }
      $('#psave').disabled = true;
      try {
        await api('admin/products' + (isNew ? '' : '/' + p.id), { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(body) });
        closeDialog(); toast('Saved 💗'); products();
      } catch (ex) { $('#perr').textContent = ex.message; $('#psave').disabled = false; }
    };
    if ($('#pdel')) $('#pdel').onclick = async () => {
      if (!confirm(`Delete "${p.name}"? This cannot be undone. (Tip: untick "Show on website" to just hide it.)`)) return;
      try { await api('admin/products/' + p.id, { method: 'DELETE' }); closeDialog(); toast('Deleted'); products(); }
      catch (ex) { $('#perr').textContent = ex.message; }
    };
  }

  // resize photos on the phone before upload: max 1400px, JPEG
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const max = 1400, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = () => reject(new Error('Could not read that photo. Try a JPG or PNG.'));
      img.src = URL.createObjectURL(file);
    });
  }

  // ---------- settings ----------
  async function settings() {
    loading();
    let s;
    try { s = (await api('admin/settings')).settings; state.settings = s; } catch (e) { main().innerHTML = `<p class="notice warn">${esc(e.message)}</p>`; return; }
    main().innerHTML = `
      <div class="page-top"><div><h1 class="page">Settings</h1><p class="sub">Payment, WhatsApp and shipping details shown to customers.</p></div></div>
      <form class="card" id="sform" style="max-width:760px" novalidate>
        <div class="fields">
          <label class="f">UPI ID <small>customers pay to this</small><input name="upiId" value="${esc(s.upiId)}" placeholder="yourname@okaxis"></label>
          <label class="f">Name on UPI<input name="upiName" value="${esc(s.upiName)}"></label>
          <label class="f">WhatsApp number<input name="whatsapp" type="tel" inputmode="numeric" value="${esc(String(s.whatsapp || '').slice(-10))}" placeholder="10-digit number"></label>
          <label class="f">Instagram username<input name="instagram" value="${esc(s.instagram)}"></label>
          <label class="f">Shipping fee (₹)<input name="shippingFee" type="number" min="0" value="${s.shippingFee}"></label>
          <label class="f">Free shipping above (₹)<input name="freeShippingAbove" type="number" min="0" value="${s.freeShippingAbove}"></label>
          <label class="f">Dispatch time (days)<input name="dispatchDays" value="${esc(s.dispatchDays)}"></label>
          <label class="f">Delivery time (days)<input name="deliveryDays" value="${esc(s.deliveryDays)}"></label>
          <label class="f">Low stock alert at<input name="lowStockAt" type="number" min="0" value="${s.lowStockAt}"></label>
          <label class="f">Email <small>optional</small><input name="email" type="email" value="${esc(s.email)}"></label>
          <label class="f full">Top banner text<input name="announcement" value="${esc(s.announcement)}" maxlength="160"></label>
        </div>
        <p class="err" id="serr" role="alert" style="margin-top:12px"></p>
        <button class="btn btn-pink" type="submit" style="margin-top:6px">Save settings</button>
      </form>`;
    $('#sform').onsubmit = async (e) => {
      e.preventDefault();
      $('#serr').textContent = '';
      try {
        const { settings: saved } = await api('admin/settings', { method: 'PUT', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
        state.settings = saved; toast('Settings saved 💗');
      } catch (ex) { $('#serr').textContent = ex.message; }
    };
  }

  // ---------- dialog ----------
  function dialog(html) {
    const d = $('#dlg');
    $('#dlg-body').innerHTML = html;
    $$('[data-close]', d).forEach((b) => (b.onclick = closeDialog));
    if (!d.open) d.showModal();
  }
  function closeDialog() { $('#dlg').close(); }
  $('#dlg').addEventListener('click', (e) => { if (e.target.id === 'dlg') closeDialog(); });

  // ---------- start ----------
  async function start() {
    $('#login').hidden = true; $('#app').hidden = false;
    try { state.settings = (await api('admin/settings')).settings; } catch { return; }
    let tab = 'dash';
    try { tab = sessionStorage.getItem('sk-admin-tab') || 'dash'; } catch {}
    go(tab);
  }
  let token = null;
  try { token = localStorage.getItem(TOKEN); } catch {}
  token ? start() : logout();
})();
