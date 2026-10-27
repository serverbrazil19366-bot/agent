# Astra Nexora — Homepage Plan (v1, for approval)

Status: **PLANNING ONLY. No site code yet.** Build starts after approval, hero first.

---

## 0. Blockers

| # | Blocker | Status | Fix |
|---|---------|--------|-----|
| B1 | Akeela source | **Resolved** — `akeela-new-website.zip` received and studied (inventory in §1). | — |
| B2 | Cloud environment network policy blocks `akeeladentalcare.com`, `ankhorlab.com`, `pexels.com`, `images.pexels.com`, `unsplash.com`, `images.unsplash.com`. | Open | Environment settings → Network access → add those 6 domains to Allowed domains (keep "Allow package managers" ticked). Docs: https://code.claude.com/docs/en/cloud-environments#network-access |
| B3 | `./assets` (logo files, favicon) is not in the repo. | Open | Commit `assets/` with the logo files. |

Photo candidates in §3 come from search results only — **not yet eyeballed**. After B2 is fixed I download thumbnails into `/shortlist`, look at every one, and re-confirm picks.

---

## 1. Akeela inventory (from `akeela-new-website.zip`, `index.html` + `style.css` + `script.js`)

### 1.1 Homepage sections (in order) → classes
1. **Header** `.site-header` — fixed, white 94% + `backdrop-filter: blur(18px)`, 88px tall, text logo, nav with orange underline on hover/active, phone link, pill "Book Appointment" button, burger `#menuToggle` → `.mobile-menu` (with Gallery sub-toggle).
2. **Hero** `.hero` — 100vh (min 720px), full-bleed `<img class="hero-slide">` (slideshow code, 1 slide), left-dark gradient `.hero-overlay`, `.hero-location` eyebrow (34px orange line + caps), H1 Manrope 48–92px / -4px tracking with orange `<span>`, description, `.btn-primary` + `.btn-outline`, `.hero-trust` stats row with `.counter[data-target]` and 1px dividers, vertical `.hero-side-label`, `.scroll-indicator`.
3. **Trust bar** `.trust-bar` — dark band, 4 columns (30+ / 20+ / 1996 / T.Nagar).
4. **About** `.about-section` — `.section-grid`: `.image-frame` photo (650px, reveal-left) + content (reveal-right), `.section-eyebrow`, H2 built from `.heading-word` spans + `<em>`, lead + paragraphs, `.text-link →`.
5. **Feature (72 hours)** `.implant-feature` — 720px full-bleed photo + overlay, light eyebrow, H2 with `<strong>`, `.btn-white`, giant 420px "72" watermark `.giant-number` at 5% white.
6. **Experience / journey** `.ak-experience-section` — header row (kicker + H2 with `<em>` / intro p), `.ak-experience-timeline` 4-col grid of `.ak-exp-card` (number 01–04, small glyph icon ✦ ◌ ✧ ↗, label, H3, p, `.ak-exp-line`, bottom caption). Card 3 is `.ak-exp-highlight`.
7. **Services** `.ak-services-premium` — header (label + H2 + intro + "Explore all ↗"), **`.ak-service-signature`** wide card (image with tag + number + category + H3 + link + 3 `.ak-service-signature-points`), then `.ak-service-premium-grid` 3-col of 6 `.ak-service-premium-card` (photo with number + ↗ arrow overlay, category, H3, p, link), and `.ak-services-premium-footer` ("07 TREATMENTS" + line + text).
8. **Doctor** `.doctor-section` — `.doctor-grid` photo with `.doctor-badge` (20+ years), eyebrow, H2 name with `<em>`, H4 role, bio, `.doctor-details` 01/02/03 list, profile link.
9. **Video** `.video-section` — 750px background **image** (no real video yet), overlay, H2 three-line with `<em>`, `.play-button` (not wired to anything).
10. **Credentials** `.home-cert-section` — inline `<style>`, centred head, 4-col grid of 3:4 cards with hover lift + image zoom + gradient caption, "More Certifications" button.
11. **Why** `.why-section` — dark background, 0.8fr/1.2fr grid, heading left, 4 `.why-item` (01–04 + H3 + p) right.
12. **Testimonials** `.ak-testimonials` — left: big number, eyebrow, 3-line H2, divider, intro, signature line; right: `.ak-testimonial-card` (big quote mark, stars, text, avatar initials, name, treatment, card number), progress line, prev/next buttons. Data is a **JS array** in `script.js`, auto-advances every 7s.
13. **Contact** `.contact-section` — white `.contact-card` 1.2fr/0.8fr: eyebrow, H2 with `<em>`, call + WhatsApp buttons; details column (call / email / clinic).
14. **Footer** `.footer` — `#0A2527`, 4 columns (brand + 3 link lists), bottom bar.
15. **Extras**: `.ak-appt-popup` (appointment popup) and an injected "More Info" side tab.

### 1.2 Tokens & fonts
```css
--orange:#F3754B;  --teal:#009DA5;  --dark:#009DA5;  --dark2:#008B92;
--cream:#F8F7F3;   --white:#FFF;    --muted:#667577; --border:rgba(0,157,165,.15);
--font-heading:"Manrope"; --font-body:"DM Sans";   /* Google Fonts, 400–800 */
```
Footer `#0A2527`, hero overlay `rgba(8,35,37,…)`. Container `min(1320px, 90%)`, header inner `min(1440px, 94%)`, `.section-padding` 130px. Pills `border-radius:100px`, cards 16–20px, image frame 4px. Breakpoints are desktop-first (`max-width` 1100 / 1000 / 900 / 768 / 650 / 600 / 520).

**Important: the accent words are not italic.** Every `h2 em` is `font-style: normal` + orange (or teal). The "editorial" look is colour-accent words + heavy tight headings + tiny letter-spaced caps labels — not serif italics.

### 1.3 Interactions (`script.js`)
- Mobile menu toggle; header shadow after 40px scroll
- Scroll reveal: `.reveal` (up 35px), `.reveal-left/-right` (±50px), 1s ease, IntersectionObserver 0.15, adds `.visible`
- Counters: `.counter[data-target]`, 1.8s ease-out cubic, `toLocaleString`
- Active nav link on scroll (`section[id]`)
- Card hover tilt (perspective rotate) on `.service-card` / `.service-featured`
- Experience cards stagger (80ms)
- Testimonial slider (array, 7s auto, prev/next, progress bar, reveal)
- Appointment popup: shows after 5s, **then again every 20s**
- Hero slideshow interval; mobile gallery dropdown
- Contact page: form → `wa.me/…?text=encodeURIComponent(…)` (reuse for our audit form)

### 1.4 Akeela-specific / must change
Copy, dental services, doctor, certificates, clinic address, phone numbers, Akeela WhatsApp number, teal/orange, text-logo (`.brand-akeela`), T.Nagar labels, "72" watermark, appointment wording, links to Akeela sub-pages, testimonial array.

### 1.5 Things in the Akeela code we should NOT carry over (honest)
- **`style.css` is 6,045 lines / 142 KB with 3–4 stacked versions of the same sections** (Services "Structure 2", "V2", "Premium", "Premium Grid"…; Header and Hero headings duplicated). We port only the final, used components into a clean stylesheet — not copy the file.
- Images are **hotlinked** from images.pexels.com / images.unsplash.com in this version (not `assets/stock/*.webp`) — we self-host, as planned.
- Popup every 20 seconds and the injected side tab — annoying, hurts UX/INP; drop.
- Card hover tilt — the "template" feel you want to avoid; replace with a calm image zoom + lift.
- No `prefers-reduced-motion`; `.reveal` content is `opacity:0` with no fallback if JS fails; scroll listeners not passive.
- Desktop-first media queries — we go mobile-first.
- 9–11px uppercase labels (hero stats, eyebrows) — too small for AA readability; we use 12–13px minimum.
- Broken `<img>` attribute in the 4th certificate, a duplicate empty `<footer>`, burger without `aria-expanded`/label.
- Duplicate content: the 72-hour message appears 3× (hero, feature, signature card) and stats appear twice (hero + trust bar). We avoid repeating ourselves.
- Testimonials live in JS (invisible to Google) — ours go in HTML.

---

## 2. Homepage section plan

Animation is always restrained and fully disabled under `prefers-reduced-motion`.

| Astra section | Reuses Akeela component |
|---|---|
| Header | `.site-header` + `.mobile-menu` |
| Hero | `.hero` + `.hero-overlay` + `.hero-trust` counters |
| Pillars band | `.trust-bar` |
| About | `.about-section` / `.image-frame` |
| Signature SEO | `.implant-feature` (full-bleed + giant watermark) |
| Journey | `.ak-experience-section` / `.ak-exp-card` |
| Services | `.ak-services-premium` header + `.ak-service-premium-grid` + footer bar (signature card dropped — see 2.6) |
| Founder | `.doctor-section` + `.doctor-badge` |
| Video | `.video-section` (wired to a real `<video>`) |
| Client work | `.home-cert-section` grid, adapted to 2 large cards |
| Why | `.why-section` (dark) |
| Feedback | `.ak-testimonials` (data moved to HTML) — hidden until real quotes |
| FAQ | new, styled in the same system |
| CTA + form | `.contact-section` / `.contact-card` + Akeela `contact.js` WhatsApp logic |
| Footer | `.footer` |

### 2.1 Header
- Logo (`logo-horizontal.png`; header is white like Akeela, so the colour logo), nav: Services · Work · About · FAQ · Contact, WhatsApp number link (replaces Akeela phone link), pill button "Free audit ↗".
- Reuses: Akeela `.site-header` (blur + shadow on scroll) + mobile menu, plus `aria-expanded` on the burger.

### 2.2 Hero — full-bleed photo + stats
- **Purpose**: say what we are, where, and give one clear action.
- Eyebrow: `✦ Digital marketing agency · Chennai`
- Headline options:
  - A (yours): "Transforming brands into digital *powerhouses*."
  - **B (recommended)**: "Marketing that works as *one system*."
  - C: "Be found. Be chosen. *Grow.*"
- Sub: "SEO, websites, social media and automation — planned, built and reported by one team, so you see results in leads, not likes."
- CTAs: **Get a free website audit** (primary) · Chat on WhatsApp (secondary, ghost)
- Stats row (Akeela `.hero-trust`): `2025 — Founded in Chennai` · `6 — Brands served` · `India — Clients across the country`
- Vertical side label (Akeela `.hero-side-label`): `NEXT ERA IN DIGITAL MARKETING`. Scroll indicator kept.
- Photo: hero slot (§3). Akeela's left-dark gradient, recoloured to navy `rgba(5,10,48,…)`, so white text passes AA.
- Animation: Akeela `.reveal` stagger on text; image settles 1.04→1 over ~1.2s; "6" counts up once (the year does not count — counting up to 2025 looks silly).

### 2.2b Pillars band (Akeela `.trust-bar`)
- Navy band, 4 columns, no fake numbers: **Search** — SEO, local SEO & GBP · **Websites** — WordPress & custom · **Brand & Social** — identity and content · **Automation** — n8n, WhatsApp, reports.
- This replaces the "4 service pillars" stat (a number that says nothing) with the pillars themselves.
- Perf: hero image preloaded (`<link rel="preload" as="image" imagesrcset=…>`), `fetchpriority="high"`, explicit width/height.

### 2.3 About — text + photo
- H2: "Not scattered services. *One connected system.*"
- Copy: "Most businesses buy SEO from one vendor, a website from another and social media from a third — and nobody owns the result. Astra Nexora plans your search, website, content and automation together, so every piece pushes the same goal: more of the right enquiries."
- Link: "How we work →" (scrolls to Journey)
- Photo: strategy meeting (§3). Reuses Akeela about block (text left / photo right, photo with offset frame).
- Animation: photo reveals with a clip-path wipe; text fade-up.

### 2.4 Signature service — SEO & Local SEO
- Label: `Signature service`
- H2: "Get found *first* — on Google and on the map."
- Copy: "We fix what stops Google from trusting your site, build pages around what your customers actually search, and keep your Google Business Profile working for you. Every month you get a plain-English report: calls, enquiries and rankings."
- Bullets (star bullets): Technical SEO & site speed · Local SEO & Google Business Profile · Service pages and content · Monthly lead-based reports
- CTA: "Check my website for free"
- Photo: laptop with search/analytics data. Reuses Akeela `.implant-feature` (full-bleed photo, overlay, white button); the giant "72" watermark becomes a giant ✦ star at 5% white.
- The bullets sit as a 4-item row like Akeela's `.ak-service-signature-points`.
- No promises of "#1 ranking" or timelines.

### 2.5 Journey — 4 steps
- H2: "From audit to *growth*, in four steps."
- 01 **Audit** — We check your website, Google profile and competitors, and show you exactly what's holding you back.
- 02 **Strategy** — A clear plan: which pages, keywords, channels and automations matter for your business.
- 03 **Build** — We build or fix the website, set up tracking and launch your search and social work.
- 04 **Grow & report** — Monthly improvements, and reports that count leads and enquiries — not likes.
- Layout: Akeela `.ak-exp-card` ×4 (number, glyph, label, H3, p, line, bottom caption). Glyphs: ✦ on all four (brand star) instead of Akeela's mixed ✦ ◌ ✧ ↗. Card 4 "Grow & report" gets the `.ak-exp-highlight` treatment (that's the outcome). Bottom captions: FREE · NO OBLIGATION / KEYWORDS · PAGES · CHANNELS / WEBSITE · TRACKING · LAUNCH / LEADS, NOT LIKES.
- No photo here (keeps the photo budget for sections that need it).
- Animation: Akeela 80ms stagger on reveal.

### 2.6 Services — photo cards
- H2: "Everything your brand needs to *grow online*."
- **Recommendation: 6 cards, no signature card.** Akeela shows "Fixed Teeth in 72 Hours" three times (hero, feature, signature card). SEO already has the full-bleed feature section, so a second SEO signature card would just repeat it. Use Akeela's 3-col `.ak-service-premium-grid` (3×2 desktop, 2-col tablet, 1-col mobile) and its footer bar ("06 SERVICES"). "Free website audit" is an offer, not a service — it lives in the hero, SEO feature and final CTA.
  1. **SEO & Local SEO** — Rank for the searches that bring paying customers.
  2. **Website Development** — Fast WordPress and custom sites built to convert.
  3. **Social Media & Branding** — A consistent brand and content people remember.
  4. **AI & Marketing Automation** — n8n workflows, WhatsApp follow-ups and automated reports.
  5. **Healthcare & Dental Marketing** — Patient-focused websites and local SEO for clinics and labs.
  6. **Google Business Profile** — Set up, optimised and managed to win the map pack.
- Each card: photo (4:3, srcset), title, one line, "Learn more →" (links to `#contact` until service pages exist).
- Reuses: Akeela `.ak-service-premium-card` (number + ↗ on the photo, category caps, H3, p, link). Animation: image 1.00→1.05 zoom + 6px lift on hover (no tilt), fade-up stagger on reveal.

### 2.7 Meet the founder
- H2: "Meet the *founder*."
- Name: S. Saktheeswaran (Sakthi) — Founder & Managing Director
- Copy: `TODO — needs 3–4 true lines from you`: background, why you started Astra Nexora in 2025, what you personally handle for clients.
- Pull line: "When you work with Astra Nexora, you talk to the person doing the work." (only if true)
- Photo: your portrait (needed). Reuses Akeela `.doctor-section`; `.doctor-badge` says "Founder & MD" (Akeela's says "20+ years" — we have no equivalent, so no number). `.doctor-details` 01/02/03 = SEO strategy · Web builds · Automation (only what you personally lead). Faint large star behind the photo.

### 2.8 Brand video
- H2: "The *next era* of digital marketing."
- Your astronaut video, click-to-play (no autoplay with sound). Poster frame = a still from the video (WebP). Video lazy-loaded, never part of LCP.
- Reuses: Akeela `.video-section` (in Akeela it's still a placeholder image and the play button does nothing — we wire it to a real `<video>` in a modal/inline player). Navy section — this is the one "space" moment on the page.

### 2.9 Client work
- H2: "Work we're *proud* of."
- Akeela Dental Care and Ankhor Dental Lab live-site screenshots in clean CSS device frames (laptop + phone), each with a label `Client work`, one line on what we did (scope to be confirmed by you), and a "Visit site ↗" link.
- Other clients (ProPedoZR, Simpladent, Guggulr, Cura Dental Foundation): text-only list **only after written permission**. No logos without permission.
- Reuses: Akeela `.home-cert-section` (centred head, hover lift + zoom, gradient caption), changed from 4 portrait cards to 2 wide cards. Don't use client screenshots in Akeela's 3:4 crop — websites need 16:10.

### 2.10 Why Astra Nexora — 4 points + photo
- H2: "Why brands choose *Astra Nexora*."
- ✦ **One team for SEO, web and automation** — No hand-offs between vendors, no blame game.
- ✦ **Reports built on leads, not likes** — We measure calls, enquiries and bookings.
- ✦ **AI-assisted, human-led** — AI speeds up the work; people make the decisions.
- ✦ **Direct access to the founder** — You talk to the person responsible for your results.
- Reuses: Akeela `.why-section` exactly (dark band, heading left, 4 numbered items right). Akeela's version has no photo; I'd add one only if the page feels text-heavy at that point — decide when we get there. (Slot 10 in §3 is therefore optional.)

### 2.11 Client feedback
- Real quotes only. **If no approved quotes exist at launch, the section is hidden** (kept in HTML behind a flag/comment with `TODO`). An empty slider or a "coming soon" box looks worse than no section.
- Reuses: Akeela `.ak-testimonials` (card, progress line, prev/next) with quotes in HTML, not a JS array; auto-advance pauses on hover/focus and is off for reduced motion. Stars only if the quote is from a real Google review.

### 2.12 FAQ (new — recommended)
- Why: high-intent SEO content, enables FAQPage schema, answers pricing/process doubts before the CTA. Akeela-style accordion (native `<details>`, accessible).
- Draft questions: What does the free website audit include? · Do you work only with businesses in Chennai? · How long does SEO take to show results? · Do you build on WordPress or custom code? · What does marketing automation mean for a small business? · How do we get started?
- Answers drafted at build time, reviewed by you (no promises/timelines you can't stand behind).

### 2.13 CTA + contact
- H2: "Start with a free *website audit*."
- Copy: "Tell us about your business. We'll review your website and Google presence and send you a clear list of what to fix first — free, no obligation."
- Form: Name · Business name · Website (optional) · Phone · What do you need? (select) · Message. Submit → opens `https://wa.me/918838417707?text=<prefilled details>`. Nothing is stored on a server.
- Side: WhatsApp +91 88384 17707 button. Email shown only once info@astranexora.com actually works.
- Layout: Akeela `.contact-card` (left: eyebrow, H2, buttons; right column becomes the form + WhatsApp/email details). Form logic ported from Akeela `Contact/contact.js` (`wa.me` + `encodeURIComponent`).
- Akeela's contact card sits on a light background; I'd put it over one dark workspace photo with navy overlay so the page ends strong (slot 11). Optional — can stay light like Akeela.

### 2.14 Footer
- White logo, tagline "Next Era in Digital Marketing", service links, contact, LinkedIn/Instagram, © 2025–2026 Astra Nexora.

---

## 3. Photo shortlist (search-based, NOT yet visually verified — B2)

All Pexels photos are under the Pexels licence. Unsplash: only "Free" photos (some Unsplash results are paid Unsplash+ — every pick is checked before download). ★ = current lean, to be confirmed when I can actually see them.

| Slot | Option A | Option B | Lean / why |
|------|----------|----------|------------|
| 1 Hero | ★ [Pexels 35184837 — South Asian web developer at work in office (Masud Gaanwala)](https://www.pexels.com/photo/professional-web-developer-at-work-in-office-35184837/) | [Pexels 7698802 — coworkers looking at a laptop in a meeting](https://www.pexels.com/photo/coworkers-looking-at-a-laptop-in-a-meeting-7698802/) | A: South Asian subject, real work, not cheesy. Must check it has calm negative space on one side for the headline. See risk R5. |
| 2 About / strategy | ★ [Unsplash K0aM-ztA76Q — team around a whiteboard, modern office](https://unsplash.com/photos/team-collaborating-around-a-whiteboard-in-a-modern-office-K0aM-ztA76Q) | [Unsplash rgKX4o2xSqI — team at whiteboard during a meeting](https://unsplash.com/photos/team-collaborating-around-a-whiteboard-during-a-meeting-rgKX4o2xSqI) | Real planning scene, fits "one connected system". Check licence (free vs Unsplash+). |
| 3 Signature SEO | ★ [Pexels 12969403 — laptop showing analytics dashboard](https://www.pexels.com/photo/close-up-shot-of-a-laptop-computer-12969403/) | [Pexels 34804005 — laptop with data analysis interface (Daniil Komov)](https://www.pexels.com/photo/laptop-displaying-coding-and-data-analysis-interface-34804005/) | A is tagged SEO / web performance — closest to "search data". |
| 4 Card: SEO & Local SEO | ★ [Pexels 577210 — close-up of laptop with graphs](https://www.pexels.com/photo/close-up-photo-of-gray-laptop-577210/) | [Pexels search: SEO audit](https://www.pexels.com/search/seo%20audit/) (pick after viewing) | Avoid "SEO" letter-tile clichés. |
| 5 Card: Website dev | ★ [Pexels 36706460 — developer coding in modern office](https://www.pexels.com/photo/developer-working-on-code-in-a-modern-office-36706460/) | [Pexels 5926380 — programmer on laptop, cropped](https://www.pexels.com/photo/crop-unrecognizable-male-programmer-working-on-laptop-in-office-5926380/) | Don't reuse the hero photographer's set here, or hero and card look identical. |
| 6 Card: Social & branding | ★ [Pexels 7598011 — brand documents + Pantone cards on desk](https://www.pexels.com/photo/branding-company-documents-on-desk-7598011/) | [Pexels 7598019 — brand strategy & design set](https://www.pexels.com/photo/pictures-of-brand-strategy-and-design-7598019/) | Avoid 8970684 — it has readable text in the photo. Same set = consistent tone. |
| 7 Card: AI & automation | ★ [Unsplash oYzjGQ7LCVE — laptop + phone on desk, software open](https://unsplash.com/photos/laptop-and-phone-on-a-desk-with-coding-software-open-oYzjGQ7LCVE) | [Unsplash eId5vdwRdQc — desk with tablet, phone, laptop](https://unsplash.com/photos/a-desk-with-tablet-phone-and-laptop-eId5vdwRdQc) | Weakest slot: no good "automation" photo found. Better idea: **your own screenshot of a real n8n workflow** on a laptop, photographed or framed. Real > stock here. |
| 8 Card: Healthcare & dental | ★ [Pexels 4270093 — dentist showing X-ray on tablet (Cedric Fauntleroy)](https://www.pexels.com/photo/man-in-gray-scrub-suit-holding-white-tablet-computer-4270093/) | [Pexels 4270080 — same series](https://www.pexels.com/photo/man-in-gray-scrub-suit-using-white-tablet-computer-4270080/) | Digital + clinic in one frame — exactly the message. |
| 9 Card: Google Business Profile | ★ [Pexels 35969 — Google Maps on Android phone](https://www.pexels.com/photo/person-using-google-maps-application-through-black-android-smartphone-35969/) | [Pexels search: local business (Tiruchirappalli shop listing)](https://www.pexels.com/search/local%20business/) | B is a real Tamil Nadu local shop — more human, more Indian. Need to view first. |
| 10 Why Astra Nexora (optional) | ★ [Pexels 36733327 — business team at office table](https://www.pexels.com/photo/business-team-in-a-meeting-at-office-table-36733327/) | [Pexels 7876755 — team looking at laptop](https://www.pexels.com/photo/a-team-at-the-room-looking-at-the-laptop-7876755/) | |
| 11 CTA background | ★ [Unsplash IUKdnYUlDco — dimly lit desk, laptop + monitor](https://unsplash.com/photos/a-dimly-lit-desk-with-a-laptop-and-monitor-IUKdnYUlDco) | [Unsplash teRVpNnlR_c — dark office with computer](https://unsplash.com/photos/a-dark-office-space-with-computer-and-desk-teRVpNnlR_c) | Dark = navy overlay sits well. Warm lamp light needs a slight cool grade to match the set. |
| 12 OG image (1200×630) | Built from hero photo + logo + headline | — | |
| — Founder | **Your photo** | | |
| — Video poster | Still from your astronaut video | | |
| — Client work | Akeela + Ankhor screenshots | | |

Consistency rule for the final set: natural daylight or soft office light, slightly cool-neutral white balance, no neon/RGB lighting, no heavy saturation. If a photo is warm, it gets a light consistent grade during WebP conversion (same settings for all).

Pipeline (after approval): download originals → `sharp` → `assets/stock/<source>-<id>-w800|w1200|w2000.webp` → `srcset` + `sizes`, `loading="lazy"` + `decoding="async"` below the fold, hero preloaded, explicit width/height everywhere (CLS 0). `assets/stock/CREDITS.md`: file, source URL, photographer, licence, date downloaded.

---

## 4. Design decisions

### 4.1 Colour tokens (contrast checked against white)

```css
:root {
  --ink:          #050A30; /* navy — headings, dark sections, footer */
  --brand:        #1729A0; /* logo blue — primary buttons, links (11.3:1 on white) */
  --brand-bright: #2E4BE0; /* hover, italic accent words (6.6:1 on white — AA) */
  --brand-light:  #5676FF; /* ONLY on navy (5.0:1) or decorative — fails AA on white (3.9:1) */
  --paper:        #FFFFFF; /* dominant background */
  --paper-alt:    #F4F6FB; /* alternating section background, cool off-white */
  --line:         #E2E6F0; /* borders, dividers */
  --text:         #1B1F3B; /* body text */
  --muted:        #5B6280; /* secondary text (6.0:1 on white) */
  --on-dark:      #FFFFFF;
  --on-dark-muted:#B9C0E0;
}
```

How logo blue replaces Akeela's teal/orange (token-by-token):

| Akeela | Role in Akeela | Astra |
|---|---|---|
| `--teal` / `--dark` `#009DA5` | headings, body colour, logo, dark bands | headings & body → `--ink` / `--text`; dark bands (trust bar, why) → `--ink` |
| `--orange` `#F3754B` | buttons, `<em>` accent words, eyebrow lines, nav underline | buttons → `--brand`; accent words & eyebrow lines → `--brand-bright` on white, `--brand-light` on navy |
| `#0A2527`, `rgba(8,35,37,…)` | footer, hero/feature overlays | `--ink` `#050A30`, `rgba(5,10,48,…)` |
| `--cream` `#F8F7F3` | light section bg | `--paper-alt` `#F4F6FB` |
| `--muted` `#667577` | secondary text | `--muted` `#5B6280` |

Why headings go navy (not logo blue): Akeela gets its punch from two hues — teal words + orange accent. With one hue, blue headings + blue accent words would blur together. Navy headings + bright-blue accent words keeps that same contrast. **No second hue** — a warm accent would fight the logo; the photos bring the warmth.

### 4.2 Fonts — recommendation: keep Sora + Inter

Studying the source settled this: Akeela's accent words are **not italic** — `h2 em { font-style: normal; color: orange }`. The editorial feel comes from heavy, tightly tracked headings + coloured accent words + small spaced caps labels. So Sora's missing italic doesn't matter, and no serif is needed.

- **Sora 600/700** for headings — replaces Manrope. Sora is wider, so Akeela's `letter-spacing:-4px` on the 92px H1 needs to become roughly -0.035em, and headline line breaks get re-tuned.
- **Inter 400/500/600** for body/UI — replaces DM Sans.
- Accent words: `<em>` in `--brand-bright`, upright, same as Akeela.
- Self-hosted subset WOFF2 (Akeela loads 9 Google weights; we load ~4 files), `font-display: swap`, preload the H1 weight.
- Why not just keep Manrope + DM Sans? They work, but then Astra Nexora reads as "Akeela in blue". Sora gives the agency its own voice while the layout stays the same.

### 4.3 Buttons
- Primary: Akeela `.btn-primary` shape kept — pill (`border-radius:100px`), 15px × 21px padding, label + ↗. Fill `--brand`, white text, Inter 600 at **14px** (Akeela uses 12px — too small). Hover: `--brand-bright`, lift 3px, soft blue shadow, arrow nudges.
- Secondary: transparent, 1.5px `--ink` border (white border on dark/photo). Hover: fills.
- WhatsApp: secondary style with the small WhatsApp icon; **not** a big green button — green would break the palette.
- Focus: 3px `--brand-bright` outline with 2px offset on every interactive element.

### 4.4 Star motif (the ✦ from the logo)
Akeela already has the slots for it: the 34px orange line before every eyebrow, the ✦ glyph in experience cards, and the giant "72" watermark. Used in exactly these places:
1. Eyebrow labels: short `--brand-bright` line + small ✦ (`—✦ SIGNATURE SERVICE`)
2. Journey card glyphs (all four)
3. Giant 5%-white ✦ watermark in the SEO feature (replaces "72") and faint large star behind the founder photo
4. Favicon / OG image

Not used: as a background pattern, as particles, as a cursor, or animated "shooting stars". Needs the SVG logo (B3) to extract the exact shape.

### 4.5 Motion budget
Kept from Akeela: `.reveal` / `.reveal-left` / `.reveal-right` (IntersectionObserver), counter, header shadow on scroll, active-nav-on-scroll, journey stagger, testimonial slider. Toned down: reveal distance 35/50px → 24/32px, 1s → 0.8s. Added: hero image settle, card image zoom. Removed: card tilt, timed popup, side tab. Content stays visible if JS fails (`.js` class gate). All off under `prefers-reduced-motion: reduce`.

---

## 5. What I need from you

1. ~~Akeela source~~ — received ✔
2. **Network access** for `akeeladentalcare.com`, `ankhorlab.com`, `pexels.com`, `images.pexels.com`, `unsplash.com`, `images.unsplash.com` — blocker for photos.
3. **Logo files** in `assets/` + **SVG logo** (current `logo-original.jpeg` is low quality — an SVG is needed for a sharp header logo and to extract the star). Ask your designer for the vector (AI/SVG/PDF).
4. **Your photo** — professional portrait, ideally 2 shots (one portrait, one at work), min 2000px, natural light. A real photo shoot of you working would also beat stock for the hero (see R5).
5. **Founder bio** — 3–4 true lines.
6. **Astronaut video** file (MP4) — I'll compress to a web version and make the poster.
7. **Screenshots** of Akeela + Ankhor (or network access so I take them myself at 1440px + 390px).
8. **Scope per client** — what exactly you did for Akeela and Ankhor (website? SEO? GBP? social?).
9. **Client permissions** in writing — which of the 6 names can be shown, and whether logos are allowed.
10. **Testimonials** — real quotes with name + business + permission (WhatsApp screenshots are fine as proof). None = section hidden.
11. **"6 brands" stat** — confirm all 6 are paying/real clients. If not, change the stat.
12. **Social URLs** — LinkedIn + Instagram for `sameAs`.
13. **Address** — street address or at least area in Chennai (needed for ProfessionalService schema + local SEO). Also: is the email live yet?
14. **Headline choice** — A, B or C (§2.2).

---

## 6. Risks & honest pushback

- **R1 — Akeela's code is the right design, but not clean code to copy.** 142 KB CSS with stacked duplicate versions, desktop-first, no reduced-motion, hotlinked images. Copy-pasting it would carry all of that into Astra. Plan: port the final components faithfully (same look, spacing, interactions) into a clean ~25–35 KB mobile-first stylesheet. You should see "Akeela, but blue and agency" — not a different design.
- **R2 — Headline is generic.** "Transforming brands into digital powerhouses" is exactly what template agencies write. It's a claim with nothing behind it. "Marketing that works as one system" is specific to your actual pitch.
- **R3 — Stats are thin.** "2025 founded" announces that the agency is new; "4 service pillars" isn't an achievement (so it moved into the pillars band, §2.2b). Honest and fine, but they won't impress. Better long-term: a real result from Akeela/Ankhor (e.g. "+X% calls from Google", from their GBP insights, with permission). Until then, keep the row small and quiet, not a big counter showpiece.
- **R4 — Stock photos on an agency site.** On Akeela, stock works because patients expect clinic imagery. On an agency site, buyers look for proof — real work, real people. Stock should set mood; **the founder photo and client screenshots must carry the trust.** Those two inputs matter more than any stock pick.
- **R5 — "Team" photos can imply a team you don't have.** A hero showing 6 people at screens suggests a 6-person office. If Astra Nexora is mostly you + freelancers, prefer work-scene photos (hands, screens, one person) over big-team shots. Copy says "one team", not "our 20 experts".
- **R6 — Testimonials and client logos may be empty at launch.** Plan handles it (hide the section), but the page must still feel complete without them — that's why Client work + Founder are strong sections.
- **R7 — Service overlap.** SEO is both the signature block and card 1; GBP is both inside SEO and card 6. Acceptable, but card copy must not repeat the signature block word-for-word.
- **R8 — Video weight.** An astronaut video can easily be 20–50 MB. It must be compressed (~3–6 MB, 1080p H.264 + poster), click-to-play, and lazy — otherwise Core Web Vitals fail.
- **R9 — Email.** Don't show `info@astranexora.com` until it receives mail. A dead email on a marketing agency site is a bad first impression.
- **R10 — Fonts.** 2 families, ~4 self-hosted files; preload the H1 weight or LCP slips.
- **R11 — Your brief says Akeela self-hosts WebP in `assets/stock/`; this zip doesn't.** The version you sent hotlinks Pexels/Unsplash. If the live Akeela has the `assets/stock/` version, that's a newer build than this zip; send it if you want me to copy that exact image pipeline. Otherwise I'll build the pipeline fresh (sharp → WebP w800/1200/2000).

---

## 7. Build order after approval

1. Fix B2–B3 (network + logo files).
2. Photo download → view → final picks → WebP pipeline → CREDITS.md.
3. **Hero** (+ header) → you review on Live Server.
4. Then section by section: About → Signature SEO → Journey → Services → Founder → Video → Client work → Why → FAQ → CTA → Footer → (Testimonials when quotes exist).
5. SEO/schema/OG, accessibility + Lighthouse pass.

File structure: `index.html`, `assets/css/style.css`, `assets/js/main.js`, `assets/brand/`, `assets/stock/`, `assets/fonts/`, `assets/video/`.
