"""Builds Sakthi's portfolio from scripts/content.py.

    python3 scripts/build.py

Writes index.html, work/<slug>.html, 404.html, sitemap.xml and robots.txt.
Layout follows a warm editorial portfolio style: cream background, heavy
condensed headings (Phudu), Instrument Sans body, orange accent, dark mode.
"""

import hashlib
import html
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from content import (ABOUT, BRING, EDUCATION, EXPERIENCE, PROFILE, PROJECTS, RESULTS, SERVICES,  # noqa: E402
                     SKILL_TABS, SOFT_SKILLS, STATS, TESTIMONIALS, TICKER, TOOLS, VIDEOS)

SITE = os.environ.get("PORTFOLIO_URL", "https://saktheeswaran.netlify.app/")
WA = f"https://wa.me/{PROFILE['whatsapp']}"
EMAIL = PROFILE["email"]

with open(os.path.join(ROOT, "scripts", "image-dims.json")) as f:
    DIMS = json.load(f)


def esc(t):
    return html.escape(t, quote=False)


def attr(t):
    return html.escape(t, quote=True)


def version(rel):
    with open(os.path.join(ROOT, rel), "rb") as fh:
        return hashlib.sha1(fh.read()).hexdigest()[:10]


def img(key, alt, sizes, prefix="", eager=False, cls=""):
    """Responsive WebP from assets/<key>-w<width>.webp (two widths per image)."""
    w, h = DIMS[key]
    folder = os.path.join(ROOT, "assets", os.path.dirname(key))
    base = os.path.basename(key)
    widths = sorted(int(n.rsplit("-w", 1)[1][:-5]) for n in os.listdir(folder) if n.startswith(base + "-w"))
    srcset = ", ".join(f"{prefix}assets/{key}-w{x}.webp {x}w" for x in widths)
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    c = f' class="{cls}"' if cls else ""
    return (f'<img alt="{attr(alt)}"{c} decoding="async" height="{h}" {load} sizes="{sizes}" '
            f'src="{prefix}assets/{key}-w{widths[-1]}.webp" srcset="{srcset}" width="{w}"/>')


def svg(paths, cls="ic", sw="1.7"):
    return (f'<svg aria-hidden="true" class="{cls}" fill="none" stroke="currentColor" stroke-linecap="round" '
            f'stroke-linejoin="round" stroke-width="{sw}" viewbox="0 0 24 24">{paths}</svg>')


ARROW = svg('<path d="M5 12h14M13 6l6 6-6 6"/>', "ic arrow", "2")
ARROW_UR = svg('<path d="M7 17 17 7M8 7h9v9"/>', "ic arrow", "2")
DOWNLOAD = svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', "ic", "2")
CHECK = svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', "ic check", "2.2")
STAR = '<svg aria-hidden="true" class="star" viewbox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor"/></svg>'
I = {
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    "pin": '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "check": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    "chat": '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "strategy": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12 20 4M16 4h4v4"/>',
    "seo": '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8.5 12.5l2-2 1.5 1.5 2.5-3"/>',
    "web": '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 14l-2 1.5L9 17M15 14l2 1.5-2 1.5"/>',
    "social": '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M12 15.5s-3.5-2-3.5-4.3a1.8 1.8 0 0 1 3.5-.6 1.8 1.8 0 0 1 3.5.6c0 2.3-3.5 4.3-3.5 4.3z"/>',
    "content": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
    "ai": '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M10 12h4M12 10v4"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "moon": '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    "play": '<path d="M8 5v14l11-7z" fill="currentColor"/>',
}
SOCIAL_ICONS = {
    "LinkedIn": '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5V16M8 7.8h.01M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6v3"/>',
    "Instagram": '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
    "WhatsApp": '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
    "Email": I["mail"],
}


def socials(cls="socials"):
    items = [(n, u) for n, u in PROFILE["social"]] + [("WhatsApp", WA), ("Email", f"mailto:{EMAIL}")]
    return f'<div class="{cls}">' + "".join(
        f'<a aria-label="{n}" href="{u}"{"" if u.startswith("mailto") else " rel=\"noopener\" target=\"_blank\""}>{svg(SOCIAL_ICONS[n])}</a>'
        for n, u in items) + "</div>"


def btn(label, href, kind="btn-dark", icon=ARROW, target=False, extra=""):
    t = ' rel="noopener" target="_blank"' if target else ""
    return f'<a class="btn {kind}" href="{href}"{t}{extra}><span>{label}</span>{icon}</a>'


def sec_head(num, kicker, title, lead="", center=False, tid=""):
    return f'''<div class="sec-head{" center" if center else ""}" data-reveal="">
<span aria-hidden="true" class="sec-num">{num}</span>
<span class="kicker">{kicker}</span>
<h2{f' id="{tid}"' if tid else ""}>{title}</h2>
{f'<p class="sec-lead">{lead}</p>' if lead else ""}
</div>'''


def head(title, desc, path, prefix, schema, preload=""):
    pre = f'<link as="image" href="{prefix}assets/{preload}" rel="preload"/>\n' if preload else ""
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, viewport-fit=cover" name="viewport"/>
<title>{esc(title)}</title>
<meta content="{attr(desc)}" name="description"/>
<meta content="index, follow, max-image-preview:large" name="robots"/>
<link href="{SITE}{path}" rel="canonical"/>
<meta content="#F5F1EA" name="theme-color"/>
<meta content="profile" property="og:type"/>
<meta content="{attr(title)}" property="og:title"/>
<meta content="{attr(desc)}" property="og:description"/>
<meta content="{SITE}{path}" property="og:url"/>
<meta content="{SITE}assets/og.jpg" property="og:image"/>
<meta content="summary_large_image" name="twitter:card"/>
<link href="{prefix}assets/favicon.png" rel="icon" type="image/png"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Phudu:wght@600;700;800;900&amp;family=Instrument+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
{pre}<link href="{prefix}css/style.css?v={version("css/style.css")}" rel="stylesheet"/>
<script>(function(d){{d.classList.add("js");if("scrollRestoration"in history)history.scrollRestoration="manual";try{{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))d.setAttribute("data-theme","dark");}}catch(e){{}}}})(document.documentElement);</script>
<script type="application/ld+json">
{json.dumps(schema, indent=1, ensure_ascii=False)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''


def header(prefix, home):
    links = [("About", "about"), ("Skills", "skills"), ("Experience", "experience"), ("Work", "work"),
             ("Services", "services"), ("Videos", "videos"), ("Contact", "contact")]
    nav = "".join(f'<a href="{home}#{a}">{n}</a>' for n, a in links)
    return f'''<header class="site-header" id="header">
<div class="wrap header-in">
<a aria-label="{PROFILE["name"]} home" class="logo" href="{home}#top">SAKTHI<i>.</i></a>
<nav aria-label="Main" class="nav">{nav}</nav>
<div class="h-tools">
<button aria-label="Switch colour theme" class="theme-btn" type="button">{svg(I["moon"], "ic moon")}{svg(I["sun"], "ic sun")}</button>
{btn("Hire Me", f"{home}#contact", "btn-dark btn-sm hire")}
<button aria-controls="menu" aria-expanded="false" aria-label="Open menu" class="burger" type="button"><span></span><span></span></button>
</div>
</div>
<nav aria-label="Mobile" class="menu" id="menu">{nav}<div class="menu-foot">{btn("Hire Me", f"{home}#contact", "btn-accent")}{socials()}</div></nav>
</header>'''


def footer(prefix, home):
    return f'''<footer class="footer">
<div class="wrap foot-in">
<a class="logo" href="{home}#top">SAKTHI<i>.</i></a>
<nav aria-label="Footer">{"".join(f'<a href="{home}#{a}">{n}</a>' for n, a in [("About", "about"), ("Work", "work"), ("Services", "services"), ("Videos", "videos"), ("Contact", "contact")])}</nav>
{socials()}
</div>
<div class="wrap foot-bottom">
<span>© 2026 {PROFILE["name"]}. All rights reserved.</span>
<span>Founder of <a href="{PROFILE["agency"][1]}" rel="noopener" target="_blank">{PROFILE["agency"][0]}</a></span>
</div>
</footer>
<a aria-label="Chat on WhatsApp" class="wa-float" href="{WA}" rel="noopener" target="_blank">{svg(SOCIAL_ICONS["WhatsApp"])}</a>
<script defer src="{prefix}js/vendor/gsap.min.js"></script>
<script defer src="{prefix}js/vendor/ScrollTrigger.min.js"></script>
<script defer src="{prefix}js/vendor/lenis.min.js"></script>
<script defer src="{prefix}js/main.js?v={version("js/main.js")}"></script>
</body>
</html>
'''


def work_card(p, prefix, i, n=None):
    n = n or len(PROJECTS)
    wide = i < 2 or ((n - 2) % 3 == 2 and i >= n - 2)
    return f'''<a class="work-card{" wide" if wide else ""}" data-reveal="" data-tag="{p["tag"]}" href="{prefix}work/{p["slug"]}.html">
<div class="wc-media">{img(p["cover"], p["title"] + " project screenshot", "(min-width: 1001px) 640px, 92vw", prefix)}<span class="wc-go">{ARROW_UR}</span></div>
<div class="wc-body">
<span class="wc-cat">{esc(p["category"])}</span>
<h3>{esc(p["title"])}</h3>
<p>{esc(p["summary"])}</p>
<ul class="chips">{"".join(f"<li>{esc(t)}</li>" for t in p["tools"][:3])}</ul>
</div>
</a>'''


def home():
    p, h = "", ""
    schema = {"@context": "https://schema.org", "@graph": [
        {"@type": "Person", "@id": SITE + "#person", "name": PROFILE["name"], "alternateName": "Sakthi",
         "jobTitle": "Founder & CEO, Astra Nexora", "url": SITE, "email": EMAIL, "image": SITE + "assets/img/sakthi-lean-w900.webp",
         "alumniOf": {"@type": "CollegeOrUniversity", "name": "Einstein College of Arts & Science, Tirunelveli"},
         "address": {"@type": "PostalAddress", "addressRegion": "Tamil Nadu", "addressCountry": "IN"},
         "sameAs": [u for _, u in PROFILE["social"]] + [PROFILE["agency"][1]],
         "worksFor": {"@type": "Organization", "name": "Astra Nexora", "url": PROFILE["agency"][1]},
         "knowsAbout": ["Digital marketing", "SEO", "Local SEO", "Website development", "n8n automation", "WhatsApp automation", "Google Ads", "Meta Ads", "Google Analytics 4"]},
        {"@type": "WebSite", "name": PROFILE["name"] + " Portfolio", "url": SITE},
    ]}
    title = f"{PROFILE['name']} | Founder, SEO & Marketing Automation Expert"
    desc = (f"Portfolio of {PROFILE['name']} (Sakthi), Founder & CEO of Astra Nexora: SEO, AI and n8n marketing "
            "automation, WordPress websites, Google and Meta ads and GA4 reporting.")

    stats = "".join(f'<li><b data-count="{n}">{n}</b><span>{esc(t)}</span></li>' for n, t in STATS)
    ticker = "".join(f"<span>{esc(t)}</span><i>✦</i>" for t in TICKER)
    tabs = "".join(f'<button aria-selected="{"true" if i == 0 else "false"}" class="tab" data-tab="t{i}" role="tab" type="button">{esc(n)}</button>'
                   for i, (n, _) in enumerate(SKILL_TABS))
    panels = "".join(
        f'<div class="panel{" on" if i == 0 else ""}" id="t{i}" role="tabpanel">' + "".join(
            f'<div class="skill"><div class="sk-top"><h3>{esc(a)}</h3><span>{k:02d}</span></div><p>{esc(b)}</p><span class="sk-line"><i></i></span></div>'
            for k, (a, b) in enumerate(items, 1)) + "</div>"
        for i, (_, items) in enumerate(SKILL_TABS))
    tools = "".join(
        f'<li>{f"<img alt=\"\" height=\"28\" loading=\"lazy\" src=\"assets/tools/{k}.webp\" width=\"28\"/>" if k else svg(I["check"])}<span>{esc(n)}</span></li>'
        for n, k in TOOLS)
    soft = "".join(f"<li>{esc(s)}</li>" for s in SOFT_SKILLS)
    exp = "".join(
        f'<li class="xp" data-reveal=""><span class="xp-date">{esc(d)}</span><h3>{esc(r)}</h3><span class="xp-co">{esc(c)}</span>'
        f'{f"<p>{esc(t)}</p>" if t else ""}{"<ul>" + "".join(f"<li>{esc(x)}</li>" for x in pts) + "</ul>" if pts else ""}</li>'
        for d, r, c, t, pts in EXPERIENCE)
    edu = "".join(f'<li class="edu" data-reveal=""><span class="xp-date">{esc(d)}</span><h3>{esc(r)}</h3><span class="xp-co">{esc(c)}</span></li>' for d, r, c in EDUCATION)
    bring = "".join(f'<li>{CHECK}<div><b>{esc(a)}</b><span>{esc(b)}</span></div></li>' for a, b in BRING)
    filters = "".join(f'<button aria-pressed="{"true" if k == "all" else "false"}" class="filter" data-filter="{k}" type="button">{n}</button>'
                      for k, n in [("all", "All"), ("web", "Websites"), ("seo", "SEO"), ("auto", "Automation"), ("social", "Social")])
    works = "\n".join(work_card(x, p, i) for i, x in enumerate(PROJECTS))
    services = "".join(
        f'<li class="svc" data-reveal=""><span class="svc-ic">{svg(I[ic])}</span><h3>{esc(t)}</h3><p>{esc(d)}</p><span aria-hidden="true" class="svc-n">{k:02d}</span></li>'
        for k, (t, d, ic) in enumerate(SERVICES, 1))
    videos = "".join(
        f'''<li class="vid{" tall" if kind == "short" else ""}" data-reveal="">
<button aria-label="Play: {attr(title)}" class="vid-btn" data-yt="{vid}" type="button">
<img alt="" height="360" loading="lazy" src="assets/videos/{vid}.webp" width="480"/>
<span class="vid-play">{svg(I["play"], "ic", "0")}</span>
</button>
<span class="vid-cat">{esc(cat)}</span><h3>{esc(title)}</h3><p>{esc(d)}</p>
</li>''' for vid, kind, cat, title, d in VIDEOS)
    quotes = "".join(
        f'''<li class="quote" data-reveal=""><div class="stars">{STAR * 5}</div><blockquote>“{esc(q)}”</blockquote>
<div class="q-who"><span class="q-av">{esc(n[:1])}</span><div><b>{esc(n)}</b><small>{esc(r)}</small></div></div></li>''' for q, n, r in TESTIMONIALS)
    results = "".join(f'<li><b>{esc(n)}</b><span>{esc(t)}</span></li>' for n, t in [STATS[2]] + RESULTS)
    hero_stats = "".join(f'<li><b>{esc(n)}</b><span>{esc(t)}</span></li>' for n, t in STATS)
    BIG_MARQUEE = "".join("<span>Let's work together</span><i>✦</i>" for _ in range(4))
    options = "".join(f'<option>{esc(t)}</option>' for t, _, _ in SERVICES) + "<option>Job opportunity</option><option>Something else</option>"

    body = f'''{header(p, h)}

<main id="main">

<section class="hero" id="top">
<div aria-hidden="true" class="hero-glow"></div>
<div aria-hidden="true" class="hero-grid-bg"></div>
<div class="wrap hero-in">
<div class="hero-copy">
<span class="avail"><i></i>Available for freelance &amp; full-time work</span>
<p class="hello">Hello, I'm</p>
<h1 class="hero-name"><span class="hn-s">S</span> <span class="hn-line">{esc(PROFILE["first"]).upper()}</span></h1>
<p class="hero-role">{esc(PROFILE["role"])}</p>
<p class="hero-lead">{esc(PROFILE["lead"])}</p>
<div class="actions">
{btn("View My Work", "#work", "btn-dark")}
{btn("Download CV", PROFILE["resume"], "btn-line", DOWNLOAD, target=True)}
</div>
<div class="hero-foot">
<ul class="hero-stats">{hero_stats}</ul>
{socials()}
</div>
</div>
<div class="hero-figure">
<span aria-hidden="true" class="hf-ring"></span>
<span aria-hidden="true" class="hf-sun"></span>
<span aria-hidden="true" class="hf-dots"></span>
<div class="hf-cut">{img("img/sakthi-cut", PROFILE["name"] + ", founder of Astra Nexora", "(min-width: 901px) 440px, 80vw", p, eager=True)}</div>
<svg aria-hidden="true" class="hv-badge" viewbox="0 0 200 200"><defs><path d="M100 100m-72 0a72 72 0 1 1 144 0a72 72 0 1 1-144 0" id="badgePath"/></defs><circle cx="100" cy="100" fill="currentColor" r="98"/><text><textPath href="#badgePath">SEO · AUTOMATION · WEBSITES · GROWTH ·</textPath></text><path class="hb-star" d="M100 74c2.6 15.4 10 22.8 25.4 25.4C110 102 102.6 109.4 100 124.8 97.4 109.4 90 102 74.6 99.4 90 96.8 97.4 89.4 100 74z"/></svg>
<div class="hf-tag hf-tag-a"><b>SEO</b> &amp; Local SEO</div>
<div class="hf-tag hf-tag-b"><b>n8n</b> AI Automation</div>
<div class="hv-chip"><i></i><span><b>Founder &amp; CEO</b>Astra Nexora</span></div>
</div>
</div>
</section>

<div aria-hidden="true" class="ticker"><div class="ticker-track">{ticker}{ticker}</div></div>

<section aria-labelledby="aboutTitle" class="sec about" id="about">
<div class="wrap about-in">
<div class="about-photo" data-reveal="">
<div class="ap-img">{img("img/sakthi-seated", PROFILE["name"] + " portrait", "(min-width: 1001px) 440px, 90vw", p)}</div>
<div class="ap-badge"><b>2+</b><span>Years<br/>active</span></div>
</div>
<div class="about-copy">
{sec_head("01", "Who I am", 'Helping businesses <em>grow online</em> with smart marketing', tid="aboutTitle")}
{"".join(f'<p data-reveal="">{esc(t)}</p>' for t in ABOUT)}
<ul class="facts" data-reveal="">
<li><small>Name</small><b>{esc(PROFILE["name"])}</b></li>
<li><small>Location</small><b>{esc(PROFILE["location"])}</b></li>
<li><small>Education</small><b>BBA, Einstein College</b></li>
<li><small>Email</small><b><a href="mailto:{EMAIL}">{EMAIL}</a></b></li>
</ul>
<ul class="stats" data-reveal="">{stats}</ul>
<div class="actions" data-reveal="">{btn("Get In Touch", "#contact", "btn-dark")}{btn("Download CV", PROFILE["resume"], "btn-line", DOWNLOAD, target=True)}</div>
</div>
</div>
</section>

<section aria-labelledby="skillsTitle" class="sec skills" id="skills">
<div class="wrap">
{sec_head("02", "My expertise", 'Skills &amp; <em>capabilities</em>', tid="skillsTitle")}
<div class="skills-in">
<div class="skills-main" data-reveal="">
<div aria-label="Skill groups" class="tabs" role="tablist">{tabs}</div>
{panels}
</div>
<aside class="skills-side" data-reveal="">
<div class="side-box"><h3>Tools &amp; stack</h3><ul class="tools">{tools}</ul></div>
<div class="side-box"><h3>Soft skills</h3><ul class="chips">{soft}</ul></div>
</aside>
</div>
</div>
</section>

<section aria-labelledby="xpTitle" class="sec experience" id="experience">
<div class="wrap">
{sec_head("03", "Career path", 'Experience &amp; <em>education</em>', tid="xpTitle")}
<div class="xp-in">
<div><span class="col-label">Work experience</span><div class="tl-wrap"><span aria-hidden="true" class="tl-progress"><i></i></span><ol class="timeline main">{exp}</ol></div></div>
<div>
<span class="col-label">Education</span><ul class="timeline">{edu}</ul>
<span class="col-label bring-label">What I bring</span>
<ul class="bring" data-reveal="">{bring}</ul>
<p class="bring-note" data-reveal="">“I don't outsource strategy. I execute it myself.”</p>
</div>
</div>
</div>
</section>

<section aria-labelledby="workTitle" class="sec work" id="work">
<div class="wrap">
<div class="work-head">
{sec_head("04", "Selected work", 'Recent <em>projects</em>', "Real websites, SEO and social media work for businesses.", tid="workTitle")}
<div aria-label="Filter projects" class="filters" data-reveal="">{filters}</div>
</div>
<div class="work-grid">
{works}
</div>
</div>
</section>

<section aria-labelledby="svcTitle" class="sec services" id="services">
<div class="wrap">
<div class="work-head">
{sec_head("05", "What I offer", 'Services I <em>provide</em>', tid="svcTitle")}
<p class="sec-lead side" data-reveal="">End-to-end digital marketing tailored to your goals, from strategy to execution and reporting.</p>
</div>
<ul class="svc-grid">{services}</ul>
</div>
</section>

<section aria-labelledby="vidTitle" class="sec videos" id="videos">
<div class="wrap">
{sec_head("06", "Video work", 'Campaigns &amp; <em>reels</em>', "Marketing videos, promotional shorts and creative content I've produced.", center=True, tid="vidTitle")}
<ul class="vid-grid">{videos}</ul>
</div>
</section>

<section aria-labelledby="qTitle" class="sec quotes" id="testimonials">
<div class="wrap">
{sec_head("07", "Kind words", 'What clients <em>say about me</em>', center=True, tid="qTitle")}
<ul class="results" data-reveal="">{results}</ul>
<ul class="q-grid">{quotes}</ul>
</div>
</section>

<div aria-hidden="true" class="big-marquee"><div class="bm-track">{BIG_MARQUEE}</div></div>

<section aria-labelledby="contactTitle" class="sec contact" id="contact">
<div class="wrap">
<div class="contact-head" data-reveal="">
<span aria-hidden="true" class="sec-num">08</span>
<span class="kicker">Let's connect</span>
<h2 id="contactTitle">Got a project <em>in mind?</em></h2>
<p class="sec-lead">Open to freelance projects and full-time roles. Tell me what you need and I'll reply on WhatsApp.</p>
</div>
<div class="contact-in">
<div class="contact-info" data-reveal="">
<div class="ci-photo">{img("img/sakthi-pockets", PROFILE["name"], "(min-width: 1001px) 480px, 90vw", p)}<span class="ci-tag"><i></i>Usually replies within a day</span></div>
<a class="big-mail" href="mailto:{EMAIL}">{EMAIL}</a>
<ul class="info-list">
<li>{svg(I["pin"])}<div><small>Location</small><b>{esc(PROFILE["location"])}</b></div></li>
<li>{svg(I["chat"])}<div><small>WhatsApp</small><b><a href="{WA}" rel="noopener" target="_blank">Chat with me</a></b></div></li>
<li>{svg(I["check"])}<div><small>Availability</small><b class="ok">Open for projects ✓</b></div></li>
<li>{svg(I["globe"])}<div><small>Agency</small><b><a href="{PROFILE["agency"][1]}" rel="noopener" target="_blank">{PROFILE["agency"][0]}</a></b></div></li>
</ul>
<span class="col-label">Find me on</span>
{socials()}
</div>
<form class="form" data-reveal="" id="contactForm" novalidate="">
<div class="field"><label for="f-name">Your name *</label><input autocomplete="name" id="f-name" name="name" placeholder="Your full name" required="" type="text"/><span class="err" id="f-nameErr"></span></div>
<div class="field"><label for="f-email">Email</label><input autocomplete="email" id="f-email" name="email" placeholder="you@example.com" type="email"/></div>
<div class="field"><label for="f-phone">Phone *</label><input autocomplete="tel" id="f-phone" inputmode="tel" name="phone" placeholder="+91" required="" type="tel"/><span class="err" id="f-phoneErr"></span></div>
<div class="field"><label for="f-service">Looking for</label><select id="f-service" name="service">{options}</select></div>
<div class="field full"><label for="f-msg">Tell me about it *</label><textarea id="f-msg" name="message" placeholder="Your project, goals or the role" required="" rows="4"></textarea><span class="err" id="f-msgErr"></span></div>
<button class="btn btn-accent full" type="submit"><span>Send on WhatsApp</span>{ARROW}</button>
<p class="form-note">This opens WhatsApp with your message filled in. Nothing is stored here.</p>
</form>
</div>
</div>
</section>

</main>

<div aria-hidden="true" class="vid-modal" id="vidModal"><div class="vm-box"><button aria-label="Close video" class="vm-close" type="button">✕</button><div class="vm-frame"></div></div></div>

{footer(p, h)}'''
    return head(title, desc, "", p, schema, preload="img/sakthi-cut-w629.webp") + body


def work_page(pr, i):
    p, h = "../", "../index.html"
    path = f"work/{pr['slug']}.html"
    schema = {"@context": "https://schema.org", "@graph": [
        {"@type": "CreativeWork", "name": pr["title"], "description": pr["summary"], "url": SITE + path,
         "creator": {"@type": "Person", "name": PROFILE["name"], "url": SITE}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": "Work", "item": SITE + "#work"},
            {"@type": "ListItem", "position": 3, "name": pr["title"], "item": SITE + path}]},
    ]}
    meta = "".join(f'<li><small>{esc(k)}</small><b>{esc(v)}</b></li>' for k, v in pr["meta"])
    secs = "".join(f'<div class="cs-row" data-reveal=""><h2><span>{k:02d}</span>{esc(t)}</h2><p>{esc(d)}</p></div>'
                   for k, (t, d) in enumerate(pr["sections"], 1))
    gallery = ""
    if pr["gallery"]:
        figs = "".join(
            f'<figure class="cs-fig{" phone" if g.endswith("-m") else ""}" data-reveal="">{img(g, pr["title"] + " screenshot", "(min-width: 1001px) 900px, 92vw", p)}</figure>'
            for g in pr["gallery"])
        gallery = f'<section class="sec cs-gallery"><div class="wrap gal-grid">{figs}</div></section>'
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    live = btn("Visit live site", pr["live"], "btn-accent", ARROW_UR, target=True) if pr["live"] else ""
    body = f'''{header(p, h)}

<main id="main">
<section class="cs-hero" id="top">
<div class="wrap">
<a class="back" href="{h}#work">← All projects</a>
<span class="kicker">{esc(pr["category"])}</span>
<h1>{esc(pr["title"])}</h1>
<p class="sec-lead">{esc(pr["summary"])}</p>
<ul class="cs-meta">{meta}</ul>
<div class="actions">{live}{btn("Start a project", h + "#contact", "btn-dark")}</div>
</div>
<div class="wrap"><figure class="cs-cover">{img(pr["cover"], pr["title"] + " screenshot", "(min-width: 1001px) 1200px, 94vw", p, eager=True)}</figure></div>
</section>

<section class="sec cs-body">
<div class="wrap cs-in">
<div class="cs-text">{secs}</div>
<aside class="cs-side" data-reveal=""><h3>Tools used</h3><ul class="chips">{"".join(f"<li>{esc(t)}</li>" for t in pr["tools"])}</ul>
<h3>Want something similar?</h3><p>Tell me about your business and goals.</p>{btn("Chat on WhatsApp", WA, "btn-dark btn-sm", target=True)}</aside>
</div>
</section>

{gallery}

<section class="sec next-sec">
<div class="wrap">
<a class="next-card" href="{nxt["slug"]}.html">
<span class="kicker">Next project</span>
<h2>{esc(nxt["title"])}</h2>
<span class="next-go">{ARROW_UR}</span>
</a>
</div>
</section>
</main>

{footer(p, h)}'''
    return head(f"{pr['title']} | {PROFILE['name']}", pr["summary"], path, p, schema) + body


def not_found():
    p, h = "/", "/index.html"
    body = f'''{header(p, h)}
<main id="main"><section class="cs-hero nf"><div class="wrap"><span class="kicker">Error 404</span><h1>This page <em>isn't here.</em></h1>
<p class="sec-lead">The link may be old or mistyped.</p><div class="actions">{btn("Go home", "/", "btn-dark")}</div></div></section></main>
{footer(p, h)}'''
    return head(f"Page not found | {PROFILE['name']}", "Page not found.", "404.html", p, {"@context": "https://schema.org", "@type": "WebPage"}).replace(
        '<meta content="index, follow, max-image-preview:large" name="robots"/>', '<meta content="noindex" name="robots"/>') + body


def main():
    with open(os.path.join(ROOT, "index.html"), "w") as f:
        f.write(home())
    os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    for i, pr in enumerate(PROJECTS):
        with open(os.path.join(ROOT, "work", f"{pr['slug']}.html"), "w") as f:
            f.write(work_page(pr, i))
    with open(os.path.join(ROOT, "404.html"), "w") as f:
        f.write(not_found())
    urls = [""] + [f"work/{x['slug']}.html" for x in PROJECTS]
    with open(os.path.join(ROOT, "sitemap.xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                + "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    with open(os.path.join(ROOT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n")
    print(f"Built index.html, {len(PROJECTS)} project pages, 404, sitemap and robots")


if __name__ == "__main__":
    main()
