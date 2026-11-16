(async () => {
  const { $, esc, products, card, tilt } = SK;
  const params = new URLSearchParams(location.search);
  let cat = params.get('c') || '';
  const q = $('#q'), sort = $('#sort');
  q.value = params.get('q') || '';
  if (location.hash === '#search') setTimeout(() => q.focus(), 100);
  let data;
  try { data = await products(); } catch (e) { $('#grid').innerHTML = `<p class="notice bad">${esc(e.message)}</p>`; return; }
  const { products: list, categories } = data;
  function chips() {
    $('#chips').innerHTML = [{ slug: '', name: 'All' }, ...categories].map((c) =>
      `<button class="chip" data-c="${c.slug}" aria-pressed="${c.slug === cat}">${esc(c.name)}</button>`).join('');
  }
  function render() {
    const c = categories.find((x) => x.slug === cat);
    $('#title').innerHTML = c ? esc(c.name) : 'Shop <span class="script" style="color:var(--pink-600)">all</span>';
    document.title = (c ? c.name : 'Shop All') + ' · Sathya Klassy Fashion';
    const term = q.value.trim().toLowerCase();
    let items = list.filter((p) => (!cat || p.category === cat) && (!term || (p.name + ' ' + p.description + ' ' + p.tag).toLowerCase().includes(term)));
    if (sort.value === 'low') items.sort((a, b) => a.price - b.price);
    else if (sort.value === 'high') items.sort((a, b) => b.price - a.price);
    else if (sort.value === 'featured') items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    $('#grid').innerHTML = items.map(card).join('') || `<div class="empty" style="grid-column:1/-1">Nothing found${term ? ` for “${esc(term)}”` : ''}. Try another search or category.</div>`;
    $('#count').textContent = items.length + ' products';
    tilt();
  }
  $('#chips').onclick = (e) => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    cat = b.dataset.c; chips(); render();
    const u = new URL(location); cat ? u.searchParams.set('c', cat) : u.searchParams.delete('c'); history.replaceState(null, '', u);
  };
  q.oninput = render; sort.onchange = render;
  chips(); render();
})();
