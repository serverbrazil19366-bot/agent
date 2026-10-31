// Designs the poster as HTML in the Astra Nexora brand and renders it to a
// 1080x1350 PNG (4:5 works in the Instagram, Facebook and LinkedIn feeds).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, "..", "assets");
const dataUri = (file, type) =>
  `data:${type};base64,${readFileSync(path.join(assets, file)).toString("base64")}`;

// Colours come from astra-nexora-site/css/style.css.
const THEMES = {
  navy:  { bg: "#0A0F2C", bg2: "#1729A0", ink: "#FFFFFF", muted: "#B4BCD6", accent: "#A9B8FF", card: "rgba(255,255,255,.06)", line: "rgba(169,184,255,.25)", logo: "white" },
  blue:  { bg: "#1729A0", bg2: "#0A0F2C", ink: "#FFFFFF", muted: "#D5DCFF", accent: "#A9B8FF", card: "rgba(10,15,44,.28)",   line: "rgba(255,255,255,.22)",  logo: "white" },
  light: { bg: "#EEF1FF", bg2: "#FFFFFF", ink: "#0A0F2C", muted: "#555E78", accent: "#1729A0", card: "#FFFFFF",               line: "#D4DAF2",                logo: "dark" },
};
export const THEME_NAMES = Object.keys(THEMES);

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function headlineHtml(headline, highlight) {
  const safe = esc(headline);
  const hl = highlight && esc(highlight.trim());
  if (!hl || !safe.toLowerCase().includes(hl.toLowerCase())) return safe;
  const i = safe.toLowerCase().indexOf(hl.toLowerCase());
  return `${safe.slice(0, i)}<em>${safe.slice(i, i + hl.length)}</em>${safe.slice(i + hl.length)}`;
}

function bodyHtml(format, p) {
  if (format === "myth" && p.points.length >= 2) {
    return `<div class="myth">
      <div class="mf"><span class="tag bad">MYTH</span><p>${esc(p.points[0])}</p></div>
      <div class="mf"><span class="tag good">FACT</span><p>${esc(p.points[1])}</p></div>
    </div>`;
  }
  if ((format === "tips" || format === "checklist") && p.points.length) {
    const mark = (i) => (format === "checklist" ? "&#10003;" : String(i + 1).padStart(2, "0"));
    return `<ol class="points ${format}">${p.points
      .slice(0, 4)
      .map((t, i) => `<li><span class="n">${mark(i)}</span><span>${esc(t)}</span></li>`)
      .join("")}</ol>`;
  }
  if (format === "question") return `<div class="bigq" aria-hidden="true">?</div>`;
  return `<div class="bigq quote" aria-hidden="true">&ldquo;</div>`;
}

export function posterHtml({ post, pillar, brand, theme = "navy" }) {
  const t = THEMES[theme] ?? THEMES.navy;
  const p = post.poster;
  const big = pillar.format === "quote" || pillar.format === "question";
  const logo = dataUri("brand/an-mark-white.png", "image/png");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Oswald; src: url(${dataUri("fonts/Oswald-wght.ttf", "font/ttf")}); font-weight: 200 700; }
@font-face { font-family: Crimson; src: url(${dataUri("fonts/CrimsonText-Regular.ttf", "font/ttf")}); font-weight: 400; }
@font-face { font-family: Crimson; src: url(${dataUri("fonts/CrimsonText-SemiBold.ttf", "font/ttf")}); font-weight: 600; }
@font-face { font-family: Crimson; src: url(${dataUri("fonts/CrimsonText-Italic.ttf", "font/ttf")}); font-style: italic; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; }
body {
  font-family: Crimson, Georgia, serif; color: ${t.ink}; overflow: hidden; position: relative;
  background: radial-gradient(120% 80% at 100% 0%, ${t.bg2} 0%, ${t.bg} 55%);
  padding: 84px 88px 72px; display: flex; flex-direction: column;
}
body::before { /* faint grid, like the site hero */
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(${t.line} 1px, transparent 1px), linear-gradient(90deg, ${t.line} 1px, transparent 1px);
  background-size: 90px 90px; opacity: .35;
  mask-image: linear-gradient(180deg, #000 0%, transparent 70%);
}
body::after { content: ""; position: absolute; right: -180px; bottom: -180px; width: 520px; height: 520px; border-radius: 50%; border: 2px solid ${t.line}; }
header, main, footer { position: relative; z-index: 1; }
header { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 18px; font-family: Oswald; font-weight: 600; font-size: 30px; letter-spacing: .14em; text-transform: uppercase; }
.brand img { height: 46px; ${t.logo === "dark" ? "filter: brightness(0) saturate(100%) invert(12%) sepia(64%) saturate(4200%) hue-rotate(228deg);" : ""} }
.pill { font-family: Oswald; font-weight: 500; font-size: 24px; letter-spacing: .16em; text-transform: uppercase; padding: 12px 26px; border-radius: 100px; border: 2px solid ${t.accent}; color: ${t.accent}; }
main { flex: 1; min-height: 0; margin: 48px 0 40px; display: flex; flex-direction: column; justify-content: center; gap: 40px; }
.kicker { font-family: Oswald; font-weight: 500; font-size: 28px; letter-spacing: .22em; text-transform: uppercase; color: ${t.accent}; display: flex; align-items: center; gap: 20px; }
.kicker::before { content: ""; width: 56px; height: 3px; background: ${t.accent}; }
h1 { font-family: Oswald; font-weight: 700; text-transform: uppercase; line-height: 1.02; letter-spacing: -.005em; font-size: ${big ? 124 : 96}px; text-wrap: balance; }
h1 em { font-style: normal; color: ${t.accent}; }
.sub { font-size: ${big ? 44 : 38}px; line-height: 1.3; color: ${t.muted}; max-width: 860px; text-wrap: pretty; }
.points { list-style: none; display: grid; gap: 18px; }
.points li { display: flex; align-items: center; gap: 28px; background: ${t.card}; border: 1px solid ${t.line}; border-radius: 18px; padding: 24px 30px; font-size: 36px; line-height: 1.2; font-weight: 600; }
.points .n { flex: none; font-family: Oswald; font-weight: 600; font-size: 34px; color: ${t.accent}; min-width: 52px; }
.myth { display: grid; gap: 22px; }
.mf { background: ${t.card}; border: 1px solid ${t.line}; border-radius: 18px; padding: 28px 32px; display: grid; gap: 12px; }
.mf p { font-size: 37px; line-height: 1.25; font-weight: 600; }
.tag { font-family: Oswald; font-weight: 600; font-size: 24px; letter-spacing: .18em; justify-self: start; padding: 6px 16px; border-radius: 8px; }
.tag.bad { background: #E5484D; color: #fff; }
.tag.good { background: #2FB37A; color: #fff; }
.bigq { font-family: Oswald; font-weight: 700; font-size: 200px; line-height: .8; color: ${t.accent}; opacity: .9; }
.bigq.quote { font-family: Crimson; font-size: 300px; line-height: .6; }
footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding-top: 34px; border-top: 2px solid ${t.line}; }
.cta { max-width: 520px; font-family: Oswald; font-weight: 600; font-size: 34px; line-height: 1.15; text-transform: uppercase; letter-spacing: .04em; }
.cta small { display: block; font-family: Crimson; font-style: italic; font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 26px; color: ${t.muted}; margin-top: 6px; }
.contact { flex: none; white-space: nowrap; text-align: right; font-family: Oswald; font-weight: 400; font-size: 24px; letter-spacing: .06em; color: ${t.muted}; line-height: 1.5; }
</style></head><body>
<header>
  <div class="brand"><img src="${logo}" alt=""><span>${esc(brand.name)}</span></div>
  <div class="pill">${esc(pillar.name)}</div>
</header>
<main>
  ${big ? bodyHtml(pillar.format, p) : ""}
  <div class="kicker">${esc(p.kicker)}</div>
  <h1>${headlineHtml(p.headline, p.highlight)}</h1>
  ${p.subline ? `<p class="sub">${esc(p.subline)}</p>` : ""}
  ${big ? "" : bodyHtml(pillar.format, p)}
</main>
<footer>
  <div class="cta">${esc(p.cta)}<small>${esc(brand.tagline)}</small></div>
  <div class="contact">${esc(brand.websiteLabel)}<br>${esc(brand.instagramHandle)}<br>WhatsApp ${esc(brand.whatsapp)}</div>
</footer>
</body></html>`;
}

export async function renderPoster(html, outFile) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // Shrink the headline if the copy runs long, so nothing spills off the poster.
    await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const main = document.querySelector("main");
      const fits = () => main.scrollHeight <= main.clientHeight + 1;
      let size = parseFloat(getComputedStyle(h1).fontSize);
      while (!fits() && size > 56) { size -= 4; h1.style.fontSize = `${size}px`; }
      for (const el of document.querySelectorAll(".points li, .mf p, .sub")) {
        let s = parseFloat(getComputedStyle(el).fontSize);
        while (!fits() && s > 26) { s -= 2; el.style.fontSize = `${s}px`; }
      }
    });
    await page.screenshot({ path: outFile, type: "png" });
  } finally {
    await browser.close();
  }
}
