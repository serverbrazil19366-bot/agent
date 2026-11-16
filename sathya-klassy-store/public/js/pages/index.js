(async () => {
  const { $, esc, inr, icons, art, products, card, thumb, tilt, reveal, petals } = SK;
  petals($('#petals'));
  $('#trust').innerHTML = `<span>${icons.truck} All India shipping</span><span>${icons.shield} Safe UPI payment</span><span>${icons.heart} Packed with love</span>`;
  const words = ['Claw clips', 'Flower clips', 'Daily-wear jewellery', 'Chocolate bouquets', 'Gift hampers', 'Mystery packs', 'Bangles & earrings'];
  $('#marquee').innerHTML = [...words, ...words].map((w) => `<span>${w}</span>`).join('');
  reveal();
  try {
    const { products: list, categories } = await products();
    $('#cats').innerHTML = categories.map((c, ci) => {
      const items = list.filter((p) => p.category === c.slug);
      const pics = items.filter((p) => p.images && p.images[0]).slice(0, 3);
      const from = items.length ? Math.min(...items.map((p) => p.price)) : 0;
      const [t1, t2] = SK.CAT_TONES[c.slug] || ['#fde4ee', '#f6bfd3'];
      return `
      <a class="cat-card" href="/shop?c=${c.slug}" data-tilt style="--c1:${t1};--c2:${t2};--d:${ci * 0.08}s">
        <span class="cat-mark" aria-hidden="true">${art[c.slug] || ''}</span>
        <span class="cat-text">
          <span class="cat-meta">${items.length} styles${from ? ` · from ${inr(from)}` : ''}</span>
          <b>${esc(c.name)}</b>
          <span class="cat-go">Shop now <span aria-hidden="true">→</span></span>
        </span>
        <span class="fan" aria-hidden="true">${pics.map((p) => `<img src="${esc(p.images[0])}" alt="" loading="lazy">`).join('')}</span>
      </a>`;
    }).join('');
    const featured = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)].slice(0, 8);
    $('#featured').innerHTML = featured.map(card).join('') || '<p>New products coming soon!</p>';
    // 3D ring of products
    const ring = featured.slice(0, 8);
    const n = Math.max(ring.length, 1);
    const radius = matchMedia('(max-width: 900px)').matches ? 200 : 270;
    $('#carousel').innerHTML = ring.map((p, i) => `
      <a class="c-card" href="/product?p=${encodeURIComponent(p.slug)}" style="transform: rotateY(${(360 / n) * i}deg) translateZ(${radius}px)" tabindex="-1" aria-hidden="true">
        ${thumb(p)}<span class="c-info"><b>${esc(p.name)}</b><span>${inr(p.price)}</span></span></a>`).join('');
    tilt();
  } catch (e) {
    $('#featured').innerHTML = `<p class="notice bad">${esc(e.message)}</p>`;
  }
})();
