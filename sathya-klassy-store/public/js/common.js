// Shared code for every storefront page: header, footer, cart, product cards,
// 3D tilt, falling petals, toast. Plain JS, no build step.

const SK = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

  // ---------- icons ----------
  const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const icons = {
    bag: svg('<path d="M5 8h14l-1.3 12.2a1 1 0 0 1-1 .8H7.3a1 1 0 0 1-1-.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    truck: svg('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    heart: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    gift: svg('<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3.5 8 4.2 8.5 8 12 8zm0 0s1.5-4.5 4-3.8S15.5 8 12 8z"/>'),
    shield: svg('<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'),
    sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.4"'),
    upi: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>'),
    box: svg('<path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>'),
    home: svg('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    insta: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor"/>'),
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.7L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.7 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.5z"/></svg>',
  };

  // category art used until real photos are uploaded
  const art = {
    'hair-clips': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22c0-6 5-10 18-10s18 4 18 10v4H14z" fill="currentColor" fill-opacity=".15"/><path d="M16 26v12M22 26v18M28 26v20M36 26v20M42 26v18M48 26v12"/><path d="M14 26h36"/><circle cx="32" cy="17" r="3" fill="currentColor"/></svg>',
    jewellery: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c2 16 10 24 20 24s18-8 20-24"/><path d="M32 36v5"/><path d="m32 41 6 8-6 8-6-8z" fill="currentColor" fill-opacity=".2"/><circle cx="20" cy="27" r="1.6" fill="currentColor"/><circle cx="44" cy="27" r="1.6" fill="currentColor"/></svg>',
    'bangles-earrings': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><ellipse cx="26" cy="36" rx="16" ry="16" /><ellipse cx="26" cy="36" rx="11" ry="11" stroke-opacity=".5"/><path d="M50 12v8"/><circle cx="50" cy="26" r="6" fill="currentColor" fill-opacity=".2"/><path d="M50 32v6"/><circle cx="50" cy="41" r="3" fill="currentColor"/></svg>',
    'chocolate-bouquets': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 30 32 58l14-28z" fill="currentColor" fill-opacity=".15"/><circle cx="22" cy="22" r="6"/><circle cx="32" cy="16" r="6"/><circle cx="42" cy="22" r="6"/><circle cx="32" cy="27" r="5"/><path d="m26 44 12 0"/></svg>',
    'gift-hampers': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="24" width="44" height="10" rx="2"/><path d="M13 34v20h38V34" fill="currentColor" fill-opacity=".15"/><path d="M32 24v30M32 24s-4-12-11-10 1 10 11 10zm0 0s4-12 11-10-1 10-11 10z"/></svg>',
    combos: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="20" width="40" height="34" rx="6" fill="currentColor" fill-opacity=".15"/><path d="M26 32a6 6 0 1 1 8 5.7c-1.4.5-2 1.4-2 2.8V42"/><circle cx="32" cy="47" r="1.4" fill="currentColor"/><path d="M22 20l4-8M42 20l-4-8M32 12V8"/></svg>',
  };
  const tones = [
    ['#fde4ee', '#f7c3d6', '#c23f74'], ['#fff1dc', '#f3d6a1', '#a37a26'], ['#f8e6f6', '#e4c1e6', '#8a3d8f'],
    ['#ffe9e4', '#f8c4b8', '#b54a3a'], ['#eaf3ff', '#c9dcf6', '#3d64a3'], ['#fdeee4', '#f4cdb3', '#9a5a2c'],
  ];
  function thumb(p, size = '') {
    if (p.images && p.images[0]) return `<div class="thumb ${size}"><img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>`;
    const i = [...String(p.id || p.name)].reduce((s, c) => s + c.charCodeAt(0), 0) % tones.length;
    const [a, b, c] = tones[i];
    return `<div class="thumb ${size}"><div class="ph" style="--ph1:${a};--ph2:${b};--ph3:${c}" role="img" aria-label="${esc(p.name)}">${art[p.category] || art.combos}</div></div>`;
  }

  // ---------- API ----------
  async function api(path, opts = {}) {
    const res = await fetch('/api/' + path, { headers: { 'content-type': 'application/json' }, ...opts });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
  }
  let shopPromise, productsPromise;
  const shop = () => (shopPromise ||= api('settings'));
  const products = () => (productsPromise ||= api('products'));

  // ---------- cart (saved in this browser) ----------
  const KEY = 'sk-cart-v1';
  const cart = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } },
    write(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} cart.changed(); },
    add(id, qty = 1) {
      const items = cart.read();
      const it = items.find((x) => x.id === id);
      if (it) it.qty = Math.min(20, it.qty + qty); else items.push({ id, qty });
      cart.write(items);
    },
    set(id, qty) { cart.write(cart.read().map((x) => (x.id === id ? { ...x, qty } : x)).filter((x) => x.qty > 0)); },
    clear() { cart.write([]); },
    count() { return cart.read().reduce((s, x) => s + x.qty, 0); },
    changed() {
      const n = cart.count();
      $$('[data-cart-count]').forEach((b) => { b.textContent = n || ''; b.dataset.count = n; });
      if ($('#drawer.open')) renderDrawer();
      document.dispatchEvent(new CustomEvent('cart:change'));
    },
  };
  async function cartLines() {
    const { products: list } = await products();
    const byId = new Map(list.map((p) => [p.id, p]));
    const lines = cart.read().map((x) => ({ ...x, p: byId.get(x.id) })).filter((x) => x.p);
    const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
    return { lines, subtotal };
  }
  const shippingFor = (subtotal, s) => (subtotal === 0 || subtotal >= s.freeShippingAbove ? 0 : s.shippingFee);

  // ---------- layout ----------
  const NAV = [['/', 'Home'], ['/shop', 'Shop all'], ['/shop?c=hair-clips', 'Hair Clips'], ['/shop?c=gift-hampers', 'Gift Hampers'], ['/track', 'Track order']];
  function layout() {
    const here = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') + location.search;
    const header = `
      <div class="announce" id="announce">Shipping all over India · Free shipping above ₹499</div>
      <header class="header"><div class="wrap">
        <a class="brand" href="/" aria-label="Sathya Klassy Fashion home">
          <img src="/assets/favicon-192.png" alt="" width="52" height="52">
          <span class="brand-name"><b>Sathya Klassy</b><span>Fashion</span></span>
        </a>
        <nav class="nav" id="nav" aria-label="Main">
          ${NAV.map(([h, t]) => `<a href="${h}" ${here === h ? 'aria-current="page"' : ''}>${t}</a>`).join('')}
        </nav>
        <div class="header-actions">
          <a class="icon-btn" href="/shop#search" aria-label="Search products">${icons.search}</a>
          <button class="icon-btn" id="cart-btn" aria-label="Open cart">${icons.bag}<span class="badge" data-cart-count></span></button>
          <button class="icon-btn menu-btn" id="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav">${icons.menu}</button>
        </div>
      </div></header>`;
    const footer = `
      <footer class="footer"><div class="wrap">
        <div class="f-brand">
          <img src="/assets/favicon-192.png" alt="" width="72" height="72">
          <p><b style="color:#fff">Sathya Klassy Fashion</b><br>Cute hair accessories, daily-wear jewellery, chocolate bouquets and gift hampers. Packed with love, shipped all over India.</p>
        </div>
        <div><h4>Shop</h4>
          <a href="/shop?c=hair-clips">Hair Clips</a><a href="/shop?c=jewellery">Jewellery</a>
          <a href="/shop?c=chocolate-bouquets">Chocolate Bouquets</a><a href="/shop?c=gift-hampers">Gift Hampers</a>
          <a href="/shop?c=combos">Combos &amp; Mystery Packs</a></div>
        <div><h4>Help</h4>
          <a href="/track">Track your order</a><a href="/policies#shipping">Shipping</a>
          <a href="/policies#returns">Replacements</a><a href="/policies#privacy">Privacy</a></div>
        <div><h4>Say hi</h4>
          <a href="#" data-wa-link>WhatsApp us</a>
          <a href="https://www.instagram.com/sathya_klassy_fashion/" target="_blank" rel="noopener" data-insta-link>Instagram</a></div>
      </div><div class="copy">© ${new Date().getFullYear()} Sathya Klassy Fashion · Made with love in Tamil Nadu</div></footer>
      <div class="scrim" id="scrim"></div>
      <aside class="drawer" id="drawer" aria-label="Your cart" aria-hidden="true">
        <div class="drawer-head"><h2>Your cart</h2><button class="icon-btn" id="drawer-close" aria-label="Close cart">${icons.close}</button></div>
        <div class="drawer-body" id="drawer-body"></div>
        <div class="drawer-foot" id="drawer-foot"></div>
      </aside>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
      <a class="wa-float" href="#" data-wa-link aria-label="Chat on WhatsApp" hidden>${icons.wa}</a>`;
    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);

    const nav = $('#nav'), scrim = $('#scrim'), menuBtn = $('#menu-btn');
    const closeAll = () => { nav.classList.remove('open'); $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); menuBtn.setAttribute('aria-expanded', 'false'); };
    menuBtn.onclick = () => { nav.classList.add('open'); scrim.classList.add('show'); menuBtn.setAttribute('aria-expanded', 'true'); };
    scrim.onclick = closeAll;
    $('#drawer-close').onclick = closeAll;
    $('#cart-btn').onclick = openCart;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    cart.changed();

    shop().then(({ settings: s }) => {
      if (s.announcement) $('#announce').textContent = s.announcement;
      if (s.whatsapp) {
        $$('[data-wa-link]').forEach((a) => { a.href = waLink(s.whatsapp, 'Hi Sathya Klassy! 💗 I have a question.'); a.target = '_blank'; a.rel = 'noopener'; a.hidden = false; });
      } else $$('[data-wa-link]').forEach((a) => (a.hidden = true));
      if (s.instagram) $$('[data-insta-link]').forEach((a) => (a.href = 'https://www.instagram.com/' + encodeURIComponent(s.instagram) + '/'));
    }).catch(() => {});
  }
  const waLink = (num, text) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

  function openCart() {
    $('#drawer').classList.add('open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('show');
    renderDrawer();
    setTimeout(() => $('#drawer-close').focus(), 50);
  }
  async function renderDrawer() {
    const body = $('#drawer-body'), foot = $('#drawer-foot');
    const [{ lines, subtotal }, { settings: s }] = await Promise.all([cartLines(), shop()]);
    if (!lines.length) {
      body.innerHTML = `<div class="empty">${icons.bag}<p>Your cart is empty.<br>Let's find something cute!</p><a class="btn btn-pink" href="/shop">Start shopping</a></div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = lines.map((l) => `
      <div class="line">${thumb(l.p)}
        <div><b>${esc(l.p.name)}</b><small>${inr(l.p.price)}</small><br>
          <span class="qty"><button data-q="${l.id}" data-d="-1" aria-label="One less">−</button><span>${l.qty}</span><button data-q="${l.id}" data-d="1" aria-label="One more">+</button></span>
        </div>
        <div style="text-align:right"><b>${inr(l.p.price * l.qty)}</b><button class="remove" data-rm="${l.id}">Remove</button></div>
      </div>`).join('');
    const ship = shippingFor(subtotal, s);
    const left = s.freeShippingAbove - subtotal;
    foot.innerHTML = `
      <div class="ship-meter">${left > 0 ? `Add <b>${inr(left)}</b> more for <b>free shipping</b>` : '<b>Yay! You get free shipping</b> 🎉'}
        <div class="meter"><i style="width:${Math.min(100, (subtotal / s.freeShippingAbove) * 100)}%"></i></div></div>
      <div class="totals"><span>Subtotal</span><span>${inr(subtotal)}</span></div>
      <div class="totals"><span>Shipping</span><span>${ship ? inr(ship) : 'Free'}</span></div>
      <div class="totals grand"><span>Total</span><span>${inr(subtotal + ship)}</span></div>
      <a class="btn btn-pink btn-block" href="/checkout">Checkout · Pay by UPI</a>`;
    $$('[data-q]', body).forEach((b) => (b.onclick = () => {
      const it = cart.read().find((x) => x.id === b.dataset.q);
      if (it) cart.set(it.id, Math.min(20, it.qty + Number(b.dataset.d)));
    }));
    $$('[data-rm]', body).forEach((b) => (b.onclick = () => cart.set(b.dataset.rm, 0)));
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ---------- product card ----------
  function card(p) {
    const off = p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    const out = p.stock === 0;
    return `
      <article class="card" data-tilt>
        <a class="cover" href="/product?p=${encodeURIComponent(p.slug)}">
          ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}
          ${off >= 5 ? `<span class="off">${off}% OFF</span>` : ''}
          ${thumb(p)}
          <div class="card-body"><h3>${esc(p.name)}</h3>
            <div class="price"><b>${inr(p.price)}</b>${p.mrp && p.mrp > p.price ? `<s>${inr(p.mrp)}</s>` : ''}</div>
          </div>
        </a>
        <div class="card-body" style="padding-top:0">
          ${out ? '<div class="soldout">Sold out · back soon</div>' : `<button class="add" data-add="${p.id}">${icons.bag} Add to cart</button>`}
        </div>
        <span class="shine"></span>
      </article>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    cart.add(b.dataset.add, 1);
    b.classList.add('done');
    b.innerHTML = `${icons.check} Added`;
    toast('Added to cart 💗');
    setTimeout(() => { b.classList.remove('done'); b.innerHTML = `${icons.bag} Add to cart`; }, 1600);
  });

  // ---------- effects ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function tilt(root = document) {
    if (reduce || !finePointer) return;
    $$('[data-tilt]', root).forEach((el) => {
      if (el.dataset.tiltOn) return;
      el.dataset.tiltOn = '1';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
        el.style.setProperty('--sx', x * 100 + '%');
        el.style.setProperty('--sy', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  function reveal() {
    const els = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  // falling cherry-blossom petals on a canvas
  function petals(canvas) {
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    let w, h, list = [], running = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(38, Math.max(14, w / 34)));
      list = Array.from({ length: n }, () => make(true));
    };
    const colors = ['#f7b6cc', '#f9cddd', '#f29cbc', '#fde4ee', '#e9c77b'];
    function make(anywhere) {
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : -20,
        s: 5 + Math.random() * 8, vy: 0.35 + Math.random() * 0.8, vx: -0.3 + Math.random() * 0.6,
        a: Math.random() * Math.PI * 2, va: -0.02 + Math.random() * 0.04, flip: Math.random() * Math.PI,
        c: colors[(Math.random() * colors.length) | 0],
      };
    }
    function draw(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.8 + 0.2); // 3D flutter
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s, -p.s, p.s, p.s * 0.6, 0, p.s);
      ctx.bezierCurveTo(-p.s, p.s * 0.6, -p.s, -p.s, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }
    function tick(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of list) {
        p.y += p.vy; p.x += p.vx + Math.sin((t / 1000) + p.flip) * 0.3; p.a += p.va; p.flip += 0.03;
        if (p.y > h + 20 || p.x < -30 || p.x > w + 30) Object.assign(p, make(false));
        draw(p);
      }
      requestAnimationFrame(tick);
    }
    resize();
    addEventListener('resize', resize);
    new IntersectionObserver(([en]) => { const was = running; running = en.isIntersecting; if (running && !was) requestAnimationFrame(tick); }).observe(canvas);
    requestAnimationFrame(tick);
  }

  layout();
  return { $, $$, esc, inr, icons, art, api, shop, products, cart, cartLines, shippingFor, card, thumb, tilt, reveal, petals, toast, openCart, waLink };
})();
