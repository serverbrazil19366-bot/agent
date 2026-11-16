// Flower effects: soft falling petals behind every page, a flower burst that
// flies to the cart on "Add to cart", and a flower shower when an order is placed.
// Everything switches off when the visitor asks for reduced motion.
window.FX = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PINKS = ['#f7b6cc', '#f29cbc', '#f9cddd', '#e86d9b', '#fbd3e1', '#ffffff'];
  const GOLDS = ['#e9c77b', '#d9b25e', '#f3e2b5'];

  // one sakura flower: 5 notched petals + gold centre
  function flower(ctx, r, color, center = '#e9c77b') {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(r * 0.55, -r * 0.25, r * 0.7, -r * 0.85, r * 0.16, -r);
      ctx.lineTo(0, -r * 0.82);
      ctx.lineTo(-r * 0.16, -r);
      ctx.bezierCurveTo(-r * 0.7, -r * 0.85, -r * 0.55, -r * 0.25, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = center;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  function petal(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r, -r, r, r * 0.6, 0, r);
    ctx.bezierCurveTo(-r, r * 0.6, -r, -r, 0, -r);
    ctx.fill();
  }

  // ---------- burst / shower layer (on top of the page) ----------
  let top, tctx, parts = [], running = false;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function ensureTop() {
    if (top) return;
    top = document.createElement('canvas');
    top.setAttribute('aria-hidden', 'true');
    top.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:95';
    document.body.appendChild(top);
    tctx = top.getContext('2d');
    const size = () => { top.width = innerWidth * dpr; top.height = innerHeight * dpr; tctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
  }
  function loop() {
    if (!parts.length) { running = false; tctx.clearRect(0, 0, innerWidth, innerHeight); return; }
    tctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
      p.x += p.vx + Math.sin(p.t * 0.05 + p.seed) * p.sway; p.y += p.vy;
      p.rot += p.vr; p.t++; p.life--;
      const fade = Math.min(1, p.life / 30);
      tctx.save();
      tctx.globalAlpha = fade;
      tctx.translate(p.x, p.y);
      tctx.rotate(p.rot);
      tctx.scale(1, 0.35 + Math.abs(Math.cos(p.t * 0.06 + p.seed)) * 0.65); // 3D flip
      p.kind === 'flower' ? flower(tctx, p.r, p.c) : petal(tctx, p.r, p.c);
      tctx.restore();
    }
    requestAnimationFrame(loop);
  }
  function add(list) {
    if (reduce) return;
    ensureTop();
    parts.push(...list);
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function burst(x, y, n = 22, power = 7) {
    add(Array.from({ length: n }, () => {
      const a = rnd(0, Math.PI * 2), s = rnd(power * 0.4, power);
      return {
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - power * 0.35, g: 0.16, drag: 0.95, sway: 0.4,
        r: rnd(5, 11), c: Math.random() < 0.18 ? pick(GOLDS) : pick(PINKS), kind: Math.random() < 0.55 ? 'flower' : 'petal',
        rot: rnd(0, 6), vr: rnd(-0.15, 0.15), t: 0, seed: rnd(0, 9), life: rnd(55, 90) | 0,
      };
    }));
  }
  function shower(n = 140) {
    const w = innerWidth;
    add(Array.from({ length: n }, (_, i) => ({
      x: rnd(-20, w + 20), y: rnd(-innerHeight * 0.9, -20), vx: rnd(-0.6, 0.6), vy: rnd(1.5, 3.5), g: 0.015, drag: 0.995, sway: rnd(0.6, 1.4),
      r: rnd(7, 15), c: Math.random() < 0.15 ? pick(GOLDS) : pick(PINKS), kind: Math.random() < 0.65 ? 'flower' : 'petal',
      rot: rnd(0, 6), vr: rnd(-0.06, 0.06), t: 0, seed: i, life: rnd(260, 380) | 0,
    })));
    // side cannons
    burst(0, innerHeight * 0.7, 30, 13); burst(innerWidth, innerHeight * 0.7, 30, 13);
  }

  // flower that flies from a button to the cart icon
  const FLOWER_SVG = '<svg viewBox="-12 -12 24 24" width="34" height="34" aria-hidden="true"><g fill="#e86d9b">' +
    [0, 72, 144, 216, 288].map((d) => `<path transform="rotate(${d})" d="M0 0C5.5-2.5 7-8.5 1.6-10L0-8.2-1.6-10C-7-8.5-5.5-2.5 0 0z"/>`).join('') +
    '</g><circle r="2.4" fill="#e9c77b"/></svg>';
  function flyToCart(fromEl) {
    const cartBtn = document.getElementById('cart-btn');
    if (!fromEl || !cartBtn) return;
    const a = fromEl.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    burst(sx, sy, 18, 6);
    if (reduce) return bump(cartBtn);
    const ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    const el = document.createElement('div');
    el.innerHTML = FLOWER_SVG;
    el.style.cssText = `position:fixed;left:0;top:0;z-index:96;pointer-events:none;transform:translate(${sx - 17}px,${sy - 17}px);filter:drop-shadow(0 6px 8px rgba(194,63,116,.35))`;
    document.body.appendChild(el);
    const mx = (sx + ex) / 2 + (ex > sx ? -60 : 60), my = Math.min(sy, ey) - 120;
    const frames = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, u = 1 - t;
      const x = u * u * sx + 2 * u * t * mx + t * t * ex, y = u * u * sy + 2 * u * t * my + t * t * ey;
      frames.push({ transform: `translate(${x - 17}px,${y - 17}px) rotate(${t * 540}deg) scale(${1.3 - t * 0.7})`, opacity: t > 0.92 ? 0.4 : 1 });
    }
    el.animate(frames, { duration: 820, easing: 'cubic-bezier(.45,.05,.55,.95)' }).onfinish = () => {
      el.remove(); bump(cartBtn); burst(ex, ey, 10, 4);
    };
  }
  function bump(el) {
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }

  // ---------- soft petals behind every page ----------
  function ambient() {
    if (reduce || document.getElementById('petals')) return; // the home hero has its own
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
    document.body.prepend(c);
    const ctx = c.getContext('2d');
    let list = [], w, h;
    const size = () => {
      w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      list = Array.from({ length: Math.round(Math.min(22, Math.max(9, w / 60))) }, (_, i) => mk(true, i));
    };
    const mk = (any, i = 0) => ({ x: rnd(0, w), y: any ? rnd(0, h) : -20, vy: rnd(0.25, 0.7), vx: rnd(-0.25, 0.25), r: rnd(4, 8), c: pick(PINKS.slice(0, 5)), rot: rnd(0, 6), vr: rnd(-0.015, 0.015), seed: i + rnd(0, 9), kind: Math.random() < 0.3 ? 'flower' : 'petal' });
    size(); addEventListener('resize', size);
    let on = true;
    document.addEventListener('visibilitychange', () => { on = !document.hidden; if (on) requestAnimationFrame(tick); });
    function tick(t) {
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;
      for (const p of list) {
        p.y += p.vy; p.x += p.vx + Math.sin(t / 1400 + p.seed) * 0.35; p.rot += p.vr;
        if (p.y > h + 20) Object.assign(p, mk(false, p.seed));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.4 + Math.abs(Math.cos(t / 900 + p.seed)) * 0.6);
        p.kind === 'flower' ? flower(ctx, p.r, p.c) : petal(ctx, p.r, p.c);
        ctx.restore();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  return { burst, shower, flyToCart, bump, ambient, flower, petal, reduce };
})();
