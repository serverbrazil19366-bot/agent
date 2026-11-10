// Code node "Extract Speed Metrics" (Run Once for Each Item)
// Pulls Speed Index, LCP and the performance score out of the PageSpeed
// response and decides whether the site is slow enough to email about.
const lead = $('Loop Over Leads').item.json;
const threshold = Number($('Config').first().json.speed_threshold_s) || 3;
const lh = $json.lighthouseResult;

if (!lh || !lh.audits || !lh.audits['speed-index']) {
  const reason = ($json.error && ($json.error.message || JSON.stringify($json.error))) || 'no Lighthouse result';
  return { json: { ...lead, status: 'audit_failed', note: String(reason).slice(0, 200) } };
}

const si = lh.audits['speed-index'];
const lcp = lh.audits['largest-contentful-paint'] || {};
const score = lh.categories && lh.categories.performance
  ? Math.round(lh.categories.performance.score * 100) : '';
const speedIndexS = Math.round((si.numericValue / 1000) * 10) / 10;

return {
  json: {
    ...lead,
    speed_index: (si.displayValue || `${speedIndexS} s`).replace(/ /g, ' '),
    speed_index_s: speedIndexS,
    lcp: (lcp.displayValue || '').replace(/ /g, ' '),
    perf_score: score,
    status: speedIndexS > threshold ? 'slow' : 'fast',
  },
};
