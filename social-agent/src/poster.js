// Designs the poster as HTML in Astra Nexora's LinkedIn style (white
// background, bold serif headline with a blue highlight, icon cards, a device
// mockup and a blue call-to-action pill) and renders it to a 1080x1350 PNG.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, "..", "assets");
const dataUri = (file, type) =>
  `data:${type};base64,${readFileSync(path.join(assets, file)).toString("base64")}`;

export const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  location: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  chart: '<path d="M5 20v-8M10 20V8M15 20v-6M20 20V4"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  growth: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l8-8"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/>',
  heart: '<path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z"/>',
};
export const ICON_NAMES = Object.keys(ICONS);
export const VISUALS = ["search", "website", "dashboard", "social", "chat"];

const C = { blue: "#0B5CFF", navy: "#0A0B2A", ink: "#1D2340", muted: "#5B6380", line: "#E3E8F3", tint: "#EEF3FF" };

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const icon = (name, cls = "ic") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ICONS.check}</svg>`;

function headlineHtml(headline, highlight) {
  const safe = esc(headline);
  const hl = highlight && esc(highlight.trim());
  const i = hl ? safe.toLowerCase().indexOf(hl.toLowerCase()) : -1;
  if (i < 0) return safe;
  return `${safe.slice(0, i)}<em>${safe.slice(i, i + hl.length)}</em>${safe.slice(i + hl.length)}`;
}

const skel = (w, cls = "") => `<i class="sk ${cls}" style="width:${w}%"></i>`;

// Device mockups, drawn in HTML so every poster gets a crisp, on-brand visual.
function visualHtml(kind, text, brand) {
  const t = esc(text);
  const laptop = (screen) => `<div class="laptop"><div class="screen"><div class="scr">${screen}</div></div><div class="base"></div></div>`;
  const phone = (screen) => `<div class="phone"><div class="notch"></div><div class="pscr">${screen}</div></div>`;
  if (kind === "website") {
    return laptop(`<div class="bar"><b></b><b></b><b></b><span>yourbusiness.com</span></div>
      <div class="site"><div class="site-hero"><div>${skel(90, "dark")}${skel(70, "dark")}${skel(80)}${skel(60)}<span class="btn">${t || "Book Now"}</span></div><div class="ph"></div></div>
      <div class="site-row"><div class="mini">${icon("star")}${skel(80)}${skel(60)}</div><div class="mini">${icon("shield")}${skel(80)}${skel(60)}</div><div class="mini">${icon("phone")}${skel(80)}${skel(60)}</div></div></div>`);
  }
  if (kind === "dashboard") {
    return laptop(`<div class="bar"><b></b><b></b><b></b><span>${t || "Growth report"}</span></div>
      <div class="dash"><div class="kpis"><div class="kpi">${icon("users")}${skel(70)}</div><div class="kpi">${icon("target")}${skel(70)}</div><div class="kpi">${icon("growth")}${skel(70)}</div></div>
      <svg class="line" viewBox="0 0 400 130" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".25"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></linearGradient></defs>
      <path d="M0 115 C40 110 60 100 90 96 S150 80 180 84 S240 60 270 52 S340 30 400 12 V130 H0Z" fill="url(#g)"/><path d="M0 115 C40 110 60 100 90 96 S150 80 180 84 S240 60 270 52 S340 30 400 12" fill="none" stroke="${C.blue}" stroke-width="4"/></svg>
      <div class="bars">${[30, 45, 40, 60, 55, 75, 90].map((h) => `<i style="height:${h}%"></i>`).join("")}</div></div>`);
  }
  if (kind === "social") {
    return phone(`<div class="ig-top"><span class="av">AN</span><div>${skel(60, "dark")}${skel(40)}</div></div>
      <div class="ig-img"><span>${t || "New post"}</span></div>
      <div class="ig-act">${icon("heart")}${icon("chat")}${icon("mail")}</div>${skel(85)}${skel(65)}${skel(75)}`);
  }
  if (kind === "chat") {
    return phone(`<div class="wa-top"><span class="av">AN</span><div><b>${esc(brand.name)}</b><small>online</small></div></div>
      <div class="wa">
        <p class="in">${t || "Hi, are you open today?"}</p>
        <p class="out">Hi! Thanks for reaching out. We're open till 8 pm.</p>
        <p class="out">Would you like to book a slot?</p>
        <div class="chips"><span>Book now</span><span>Call me</span></div>
      </div>`);
  }
  // search (default)
  return laptop(`<div class="srch"><div class="sbox">${icon("search")}<span>${t || "best services near me"}</span></div>
    <div class="tabs"><u>All</u><span>Maps</span><span>Images</span><span>News</span></div>
    <div class="res top"><span class="rank">1</span><div><small>yourbusiness.com</small><b>Your Business - Top result for &ldquo;${t || "services near me"}&rdquo;</b>${skel(95)}${skel(70)}</div><div class="thumb"></div></div>
    <div class="res"><span class="n">2</span><div>${skel(50)}${skel(85)}${skel(60)}</div></div>
    <div class="res"><span class="n">3</span><div>${skel(45)}${skel(80)}</div></div></div>`);
}

export function posterHtml({ post, brand }) {
  const p = post.poster;
  const isPhone = p.visual === "social" || p.visual === "chat";
  const inter = dataUri("fonts/inter-latin-wght-normal.woff2", "font/woff2");
  const serif = dataUri("fonts/PlayfairDisplay-wght.ttf", "font/ttf");
  const [first, ...rest] = brand.name.toUpperCase().split(" ");
  const wordmark = `${esc(first)} <span>${esc(rest.join(" "))}</span>`;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(${inter}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: Serif; src: url(${serif}); font-weight: 400 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; }
body { font-family: Inter, sans-serif; color: ${C.ink}; overflow: hidden; position: relative;
  background: radial-gradient(60% 45% at 92% 38%, #E4ECFF 0%, rgba(228,236,255,0) 70%), radial-gradient(50% 35% at 0% 100%, #F0F4FF 0%, rgba(240,244,255,0) 70%), #fff;
  padding: 64px 70px 56px; display: flex; flex-direction: column; }
.ic { width: 1em; height: 1em; display: block; }

header { display: flex; justify-content: space-between; align-items: flex-start; }
.wm { font-weight: 800; font-size: 40px; letter-spacing: .01em; color: ${C.navy}; line-height: 1; }
.wm span, .fwm span { color: ${C.blue}; }
.wm small { display: block; margin-top: 12px; font-size: 17px; font-weight: 500; letter-spacing: .26em; color: ${C.navy}; }
.pillars { border-left: 4px solid ${C.blue}; padding-left: 20px; font-size: 17px; letter-spacing: .26em; line-height: 1.55; color: ${C.navy}; text-transform: uppercase; }

.hero { position: relative; z-index: 3; margin-top: 46px; }
.kicker { font-size: 21px; letter-spacing: .3em; text-transform: uppercase; color: ${C.navy}; font-weight: 500; }
h1 { font-family: Serif; font-weight: 800; font-size: 92px; line-height: 1.02; letter-spacing: -.02em; color: ${C.navy}; margin-top: 18px; width: 620px; }
h1 em { font-style: normal; color: ${C.blue}; }
.rule { width: 70px; height: 4px; background: ${C.blue}; border-radius: 2px; margin: 26px 0 18px; }
.sub { font-size: 28px; line-height: 1.3; width: 560px; color: ${C.ink}; }
.badges { position: absolute; right: -6px; top: 70px; width: 300px; display: grid; gap: 22px; }
.badge { background: rgba(255,255,255,.92); border: 1px solid ${C.line}; border-radius: 18px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 18px 40px rgba(11,40,120,.10); }
.badge:nth-child(2) { margin-left: -24px; margin-right: 24px; }
.badge .ic { font-size: 40px; color: ${C.blue}; flex: none; }
.badge > div { flex: 1; }
.badge b { font-size: 22px; line-height: 1.15; color: ${C.navy}; display: block; }
.badge small { display: block; margin-top: 4px; color: #18A957; font-weight: 700; font-size: 16px; letter-spacing: .04em; }
.spark { flex: none; display: flex; gap: 4px; align-items: flex-end; height: 34px; }
.spark i { width: 7px; background: ${C.blue}; border-radius: 2px; }

.mid { flex: 1; min-height: 0; display: grid; grid-template-columns: 410px 1fr; gap: 20px; margin-top: 34px; }
.feats { display: grid; gap: 18px; align-content: center; position: relative; z-index: 2; }
.feat { display: flex; gap: 20px; align-items: center; background: rgba(255,255,255,.94); border: 1px solid ${C.line}; border-radius: 18px; padding: 20px 22px; box-shadow: 0 10px 30px rgba(11,40,120,.06); }
.feat .tile { flex: none; width: 70px; height: 70px; border-radius: 16px; background: ${C.tint}; color: ${C.blue}; display: grid; place-items: center; font-size: 36px; }
.feat b { display: block; font-size: 24px; color: ${C.navy}; line-height: 1.15; }
.feat p { font-size: 19px; line-height: 1.3; color: ${C.muted}; margin-top: 6px; }
.vis { position: relative; }

.laptop { position: absolute; right: -150px; bottom: 0; width: 680px; transform: perspective(1800px) rotateY(-14deg) rotateX(3deg); transform-origin: right bottom; filter: drop-shadow(0 40px 50px rgba(11,30,90,.22)); }
.screen { background: #12162A; border-radius: 26px 26px 6px 6px; padding: 16px; height: 390px; }
.scr { background: #fff; height: 100%; border-radius: 8px; overflow: hidden; font-size: 16px; }
.base { height: 26px; margin: 0 -46px; background: linear-gradient(#EEF1F6, #BFC6D3); border-radius: 0 0 30px 30px; }
.sk { display: block; height: 10px; border-radius: 6px; background: #E6EAF2; margin-top: 9px; }
.sk.dark { background: #C9D2E6; height: 14px; }
.bar { display: flex; gap: 7px; align-items: center; padding: 12px 16px; border-bottom: 1px solid ${C.line}; }
.bar b { width: 11px; height: 11px; border-radius: 50%; background: #D6DCE8; }
.bar span { margin-left: 12px; color: ${C.muted}; font-size: 15px; background: #F3F5FA; border-radius: 20px; padding: 4px 16px; }

.srch { padding: 22px 26px; }
.sbox { display: flex; align-items: center; gap: 12px; border: 1px solid ${C.line}; border-radius: 30px; padding: 12px 20px; box-shadow: 0 4px 14px rgba(0,0,0,.06); color: ${C.navy}; font-size: 18px; }
.sbox .ic { font-size: 20px; color: ${C.blue}; }
.tabs { display: flex; gap: 22px; margin: 14px 6px 6px; color: ${C.muted}; font-size: 14px; }
.tabs u { color: ${C.blue}; text-decoration: none; border-bottom: 3px solid ${C.blue}; padding-bottom: 4px; }
.res { display: flex; gap: 14px; align-items: flex-start; padding: 12px 10px; }
.res > div:nth-child(2) { flex: 1; }
.res.top { background: #fff; border: 2px solid #CFDCFF; border-radius: 12px; box-shadow: 0 10px 26px rgba(11,92,255,.14); margin-top: 8px; }
.res small { color: #3C7A3F; font-size: 13px; }
.res b { display: block; color: ${C.blue}; font-size: 18px; margin-top: 2px; line-height: 1.2; }
.rank { flex: none; width: 30px; height: 30px; border-radius: 50%; background: #F5B400; color: #fff; font-weight: 800; display: grid; place-items: center; font-size: 15px; }
.n { flex: none; width: 30px; text-align: center; color: #A3AAC0; font-weight: 600; }
.thumb { flex: none; width: 92px; height: 70px; border-radius: 8px; background: linear-gradient(135deg, #CFE0FF, #8FB2FF); }

.site { padding: 20px 24px; }
.site-hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: center; }
.btn { display: inline-block; margin-top: 16px; background: ${C.blue}; color: #fff; font-weight: 700; padding: 10px 22px; border-radius: 24px; font-size: 15px; }
.ph { height: 170px; border-radius: 12px; background: linear-gradient(135deg, #DCE7FF, #9DBBFF); }
.site-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 22px; }
.mini { border: 1px solid ${C.line}; border-radius: 10px; padding: 12px; }
.mini .ic { font-size: 22px; color: ${C.blue}; }

.dash { padding: 18px 22px; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.kpi { border: 1px solid ${C.line}; border-radius: 10px; padding: 12px; }
.kpi .ic { font-size: 22px; color: ${C.blue}; }
.line { width: 100%; height: 130px; margin-top: 16px; }
.bars { display: flex; gap: 12px; align-items: flex-end; height: 70px; margin-top: 8px; }
.bars i { flex: 1; background: #CFDCFF; border-radius: 4px 4px 0 0; }
.bars i:last-child { background: ${C.blue}; }

.phone { position: absolute; right: 40px; bottom: 0; width: 300px; height: 560px; background: #12162A; border-radius: 44px; padding: 14px; transform: rotate(6deg); filter: drop-shadow(0 40px 50px rgba(11,30,90,.25)); }
.notch { position: absolute; top: 14px; left: 50%; width: 100px; height: 22px; margin-left: -50px; background: #12162A; border-radius: 0 0 14px 14px; z-index: 2; }
.pscr { background: #fff; height: 100%; border-radius: 32px; overflow: hidden; padding: 40px 18px 18px; font-size: 15px; }
.av { flex: none; width: 40px; height: 40px; border-radius: 50%; background: ${C.blue}; color: #fff; font-weight: 800; font-size: 14px; display: grid; place-items: center; }
.ig-top, .wa-top { display: flex; gap: 10px; align-items: center; }
.ig-top > div { flex: 1; }
.ig-img { margin: 14px -18px 12px; height: 250px; background: linear-gradient(135deg, ${C.blue}, #6E9BFF); display: grid; place-items: center; padding: 20px; text-align: center; color: #fff; font-family: Serif; font-size: 30px; line-height: 1.05; }
.ig-act { display: flex; gap: 14px; font-size: 26px; color: ${C.navy}; }
.wa-top { margin: -10px -18px 0; padding: 12px 18px; background: #F1F4F9; }
.wa-top b { display: block; color: ${C.navy}; font-size: 15px; }
.wa-top small { color: #18A957; font-size: 12px; }
.wa { display: grid; gap: 10px; margin-top: 16px; }
.wa p { max-width: 86%; padding: 10px 13px; border-radius: 14px; line-height: 1.3; font-size: 14.5px; color: ${C.navy}; }
.wa .in { background: #F1F4F9; border-top-left-radius: 4px; }
.wa .out { background: #DCF8E6; justify-self: end; border-top-right-radius: 4px; }
.chips { display: flex; gap: 8px; justify-content: flex-end; }
.chips span { border: 1.5px solid ${C.blue}; color: ${C.blue}; border-radius: 16px; padding: 6px 12px; font-size: 13px; font-weight: 600; }

.benefits { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 30px; padding: 22px 0; border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; position: relative; z-index: 2; background: rgba(255,255,255,.85); }
.ben { display: flex; align-items: center; gap: 14px; padding: 0 18px; border-left: 1px solid ${C.line}; }
.ben:first-child { border-left: 0; padding-left: 0; }
.ben .tile { flex: none; width: 58px; height: 58px; border-radius: 50%; background: ${C.tint}; color: ${C.blue}; display: grid; place-items: center; font-size: 28px; }
.ben span { font-size: 20px; font-weight: 600; color: ${C.navy}; line-height: 1.2; }

footer { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
.fwm { font-weight: 800; font-size: 40px; color: ${C.navy}; line-height: 1; white-space: nowrap; }
.fwm small { display: block; font-family: Serif; font-weight: 500; font-size: 30px; color: ${C.ink}; margin-top: 8px; }
.fwm em { display: block; font-style: normal; font-weight: 500; font-size: 17px; color: ${C.muted}; margin-top: 10px; letter-spacing: .02em; }
.cta-wrap { text-align: right; }
.cta { display: inline-flex; align-items: center; gap: 14px; background: ${C.blue}; color: #fff; font-weight: 600; font-size: 25px; padding: 20px 36px; border-radius: 40px; box-shadow: 0 14px 30px rgba(11,92,255,.3); }
.cta svg { width: 26px; height: 26px; }
.services { margin-top: 14px; font-size: 14px; letter-spacing: .18em; color: ${C.muted}; white-space: nowrap; }
</style></head><body>
<header>
  <div class="wm">${wordmark}<small>DIGITAL GROWTH PARTNER</small></div>
  <div class="pillars">Strategy<br>Technology<br>Automation<br>Growth</div>
</header>
<section class="hero">
  <div class="kicker">${esc(p.kicker)}</div>
  <h1>${headlineHtml(p.headline, p.highlight)}</h1>
  <div class="rule"></div>
  ${p.subline ? `<p class="sub">${esc(p.subline)}</p>` : ""}
  ${isPhone ? "" : `<div class="badges">${(p.badges ?? []).slice(0, 3).map((b) => `<div class="badge">${icon(b.icon)}<div><b>${esc(b.label)}</b><small>&#8599; Growing</small></div><span class="spark"><i style="height:35%"></i><i style="height:55%"></i><i style="height:75%"></i><i style="height:100%"></i></span></div>`).join("")}</div>`}
</section>
<section class="mid">
  <div class="feats">${(p.points ?? []).slice(0, 3).map((f) => `<div class="feat"><span class="tile">${icon(f.icon)}</span><div><b>${esc(f.title)}</b><p>${esc(f.text)}</p></div></div>`).join("")}</div>
  <div class="vis">${visualHtml(p.visual, p.visualText, brand)}</div>
</section>
<section class="benefits">${(p.benefits ?? []).slice(0, 4).map((b) => `<div class="ben"><span class="tile">${icon(b.icon)}</span><span>${esc(b.label)}</span></div>`).join("")}</section>
<footer>
  <div class="fwm">${wordmark}<small>Build smarter. Grow stronger.</small><em>${esc(brand.websiteLabel)} &middot; ${esc(brand.instagramHandle)}</em></div>
  <div class="cta-wrap"><span class="cta">${esc(p.cta)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
  <div class="services">WEBSITE &nbsp;|&nbsp; SEO &nbsp;|&nbsp; AUTOMATION &nbsp;|&nbsp; AI SOLUTIONS</div></div>
</footer>
</body></html>`;
}

export async function renderPoster(html, outFile) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // Long copy squeezes the middle row; shrink the headline, then the
    // subline, until the cards and mockup keep enough room.
    await page.evaluate(() => {
      const mid = document.querySelector(".mid");
      const feats = document.querySelector(".feats");
      const fits = () => mid.clientHeight >= Math.max(440, feats.scrollHeight);
      const shrink = (el, min, step) => {
        if (!el) return;
        let s = parseFloat(getComputedStyle(el).fontSize);
        while (!fits() && s > min) { s -= step; el.style.fontSize = `${s}px`; }
      };
      shrink(document.querySelector("h1"), 64, 4);
      shrink(document.querySelector(".sub"), 22, 2);
    });
    await page.screenshot({ path: outFile, type: "png" });
  } finally {
    await browser.close();
  }
}
