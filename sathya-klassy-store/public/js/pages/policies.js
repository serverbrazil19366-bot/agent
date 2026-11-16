SK.shop().then(({ settings: s }) => {
  document.querySelectorAll('[data-s]').forEach((el) => {
    const k = el.dataset.s, v = s[k];
    if (v === undefined || v === '') return;
    el.textContent = typeof v === 'number' ? SK.inr(v) : v;
  });
}).catch(() => {});
