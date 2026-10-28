"""Builds every Astra Nexora page from scripts/content.py.

    python3 scripts/build-site.py

Writes index.html, services/<slug>.html and projects/<slug>.html.
projects/seo-report.html (the dashboard demo) is hand-written and left alone.
Image sizes and blur-up placeholders come from scripts/image-dims.json,
which `npm run images` keeps up to date.

Design v13: red-orange and deep red with navy, condensed uppercase headings
(Oswald) over a serif body (Crimson Text), split colour-panel heroes, white
cards on light grey, a navy founder band and a red contact block.
"""


import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from content import HOME, PROJECTS, SERVICES  # noqa: E402

SITE = "https://astranexora.netlify.app/"
WA = "https://wa.me/918838417707"
EMAIL = "info.astranexora@gmail.com"
SOCIAL = [
    ("Instagram", "https://www.instagram.com/astranexora2025/"),
    ("LinkedIn", "https://www.linkedin.com/company/astra-nexora/"),
    ("Facebook", "https://www.facebook.com/share/18aqEXcEde/"),
]
SERVICE_TAGLINES = {
    "seo": "Rank on Google, maps and AI search",
    "social-media-marketing": "Grow and engage your audience",
    "performance-marketing": "Google, Meta and LinkedIn ads",
    "content-marketing": "Copy, design and video",
    "website-development": "Fast websites that convert",
    "branding": "Identities and personal brands",
    "email-lead-generation": "Funnels, email and nurturing",
    "ai-automation": "Chatbots, n8n and WhatsApp",
}
SERVICE_BY_SLUG = {s["slug"]: s for s in SERVICES}

# Platforms named in the service descriptions; shown as plain text, not as client logos
PLATFORMS = ["Google Search", "Google Ads", "Meta Ads", "LinkedIn", "WordPress", "Wix", "Shopify", "WhatsApp Business", "n8n", "Google Analytics"]

# Real client quotes go here once approved: (quote, name, business · city).
# The section stays off the page while this list is empty.
TESTIMONIALS = []

with open(os.path.join(ROOT, "scripts", "image-dims.json")) as f:
    DIMS = json.load(f)

WA_ICON = ('<svg aria-hidden="true" viewbox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z" fill="currentColor"></path></svg>')
ARROW = '<svg aria-hidden="true" class="arrow" viewbox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>'
CHECK = '<svg aria-hidden="true" class="check" viewbox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>'
CROSS = '<svg aria-hidden="true" class="cross" viewbox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>'

ICON_PATHS = {
    "seo": '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8.5 12.5l2-2 1.5 1.5 2.5-3"/>',
    "social-media-marketing": '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M12 15.5s-3.5-2-3.5-4.3a1.8 1.8 0 0 1 3.5-.6 1.8 1.8 0 0 1 3.5.6c0 2.3-3.5 4.3-3.5 4.3z"/>',
    "performance-marketing": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12 20 4M16 4h4v4"/>',
    "content-marketing": '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    "website-development": '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M9 14l-2 1.5L9 17M15 14l2 1.5-2 1.5"/>',
    "branding": '<path d="M12 3 4 8.5 12 21l8-12.5z"/><path d="M4 8.5h16M9 8.5 12 21l3-12.5"/>',
    "email-lead-generation": '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    "ai-automation": '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M10 12h4M12 10v4"/>',
}


def icon(slug):
    return (f'<svg aria-hidden="true" class="icon" fill="none" stroke="currentColor" stroke-linecap="round" '
            f'stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 24 24">{ICON_PATHS[slug]}</svg>')


def esc(text):
    return html.escape(text, quote=False)


def attr(text):
    return html.escape(text, quote=True)


def strip_tags(text):
    return re.sub(r"<[^>]+>", "", text)


def img(base, alt, sizes, prefix, eager=False, cls=""):
    """Responsive WebP with a blur-up placeholder (painted on the frame by main.js)."""
    w, h, lqip = DIMS[base]
    srcset = ", ".join([
        f"{prefix}assets/stock/{base}-w480.webp 480w",
        f"{prefix}assets/stock/{base}-w800.webp 800w",
        f"{prefix}assets/stock/{base}-w1200.webp 1200w",
        f"{prefix}assets/stock/{base}-w2000.webp {w}w",
    ])
    if eager:
        load, classes, lq = 'fetchpriority="high"', cls, ""
    else:
        load, classes, lq = 'loading="lazy"', ("lqip " + cls).strip(), f' data-lqip="{lqip}"'
    c = f' class="{classes}"' if classes else ""
    return (f'<img alt="{attr(alt)}"{c}{lq} decoding="async" height="{h}" {load} sizes="{sizes}" '
            f'src="{prefix}assets/stock/{base}-w1200.webp" srcset="{srcset}" width="{w}"/>')


def logo(prefix="", colour=False):
    """Wordmark from the Astra Nexora logo: name + tagline, set as text."""
    return '<span class="logo-text">AstraNexora<small>Next Era in Digital Marketing</small></span>'


def btn(label, href, kind="btn-white", target=False, arrow=True):
    t = ' rel="noopener" target="_blank"' if target else ""
    a = f'<i class="btn-ic">{ARROW}</i>' if arrow else ""
    return f'<a class="btn {kind}" href="{href}"{t}><span>{label}</span>{a}</a>'


def svg(paths, cls="icon"):
    return (f'<svg aria-hidden="true" class="{cls}" fill="none" stroke="currentColor" stroke-linecap="round" '
            f'stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 24 24">{paths}</svg>')


I_MAIL = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'
I_PHONE = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'
I_PIN = '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'
I_CHAT = '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>'
I_SHARE = '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>'
I_USER = '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
I_GLOBE = '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
I_BRIEF = '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'
I_GROW = '<path d="M3 20h18M6 16l4-4 3 3 6-7"/><path d="M15 8h4v4"/>'
I_TARGET = '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12 20 4M16 4h4v4"/>'
I_EDIT = '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'


SOCIAL_ICONS = {
    "Instagram": svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>'),
    "LinkedIn": svg('<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5V16M8 7.8h.01M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6v3"/>'),
    "Facebook": svg('<path d="M14 21v-8h3l.5-3.5H14V7.8c0-1 .3-1.8 1.8-1.8h1.8V3a24 24 0 0 0-2.7-.1C12.2 2.9 10.5 4.5 10.5 7.4v2.1H7.5V13h3v8"/>'),
}


# =================================================================== shared

def heading(kicker, title, lead=None, center=False, title_id=None, light=False, cls=""):
    """Taeled-style section title: small serif label, condensed uppercase heading."""
    tid = f' id="{title_id}"' if title_id else ""
    lead_html = f'<p class="sec-lead">{lead}</p>' if lead else ""
    classes = " ".join(c for c in ["sec-title", "center" if center else "", "light" if light else "", cls] if c)
    return f'''<div class="{classes}" data-reveal="">
<span class="sub">{kicker}</span>
<h2{tid}>{title}</h2>
{lead_html}
</div>'''


def shapes(cls=""):
    """Decorative outline triangle, arc and wave used on the coloured panels."""
    return f'''<div aria-hidden="true" class="shapes {cls}">
<svg class="sh-tri" viewbox="0 0 40 36"><path d="M20 3 37 33H3z" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>
<svg class="sh-arc" viewbox="0 0 40 40"><path d="M6 30A16 16 0 0 1 30 8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3.2"/></svg>
<svg class="sh-wave" viewbox="0 0 60 16"><path d="M2 12c6-10 10-10 14 0s8 10 14 0 10-10 14 0 8 10 14 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.6"/></svg>
</div>'''


def head(title, description, path, prefix, schemas, preload=None, body_class="site"):
    pre = ""
    if preload:
        w = DIMS[preload][0]
        pre = (f'<link as="image" fetchpriority="high" href="{prefix}assets/stock/{preload}-w1200.webp" imagesizes="(min-width: 1001px) 55vw, 100vw" '
               f'imagesrcset="{prefix}assets/stock/{preload}-w480.webp 480w, {prefix}assets/stock/{preload}-w800.webp 800w, '
               f'{prefix}assets/stock/{preload}-w1200.webp 1200w, {prefix}assets/stock/{preload}-w2000.webp {w}w" rel="preload" type="image/webp"/>\n')
    ld = "".join(
        f'<script type="application/ld+json">\n{json.dumps(s, indent=2, ensure_ascii=False)}\n</script>\n' for s in schemas)
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, viewport-fit=cover" name="viewport"/>
<title>{esc(title)}</title>
<meta content="{attr(description)}" name="description"/>
<meta content="#000000" name="theme-color"/>
<link href="{SITE}{path}" rel="canonical"/>
<meta content="website" property="og:type"/>
<meta content="Astra Nexora" property="og:site_name"/>
<meta content="{attr(title)}" property="og:title"/>
<meta content="{attr(title)}" name="twitter:title"/>
<meta content="{attr(description)}" name="twitter:description"/>
<meta content="{SITE}assets/og-image.jpg" name="twitter:image"/>
<meta content="Astra Nexora: Next Era in Digital Marketing" property="og:image:alt"/>
<meta content="{attr(description)}" property="og:description"/>
<meta content="{SITE}{path}" property="og:url"/>
<meta content="{SITE}assets/og-image.jpg" property="og:image"/>
<meta content="1200" property="og:image:width"/>
<meta content="630" property="og:image:height"/>
<meta content="en_IN" property="og:locale"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="index, follow, max-image-preview:large, max-snippet:-1" name="robots"/>
<link href="{prefix}assets/favicon-48.png" rel="icon" sizes="48x48" type="image/png"/>
<link href="{prefix}assets/favicon-192.png" rel="icon" sizes="192x192" type="image/png"/>
<link href="{prefix}assets/favicon.png" rel="apple-touch-icon"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&amp;family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&amp;display=swap" rel="stylesheet"/>
{pre}<link href="{prefix}css/style.css" rel="stylesheet"/>
<script>(function(d){{d.classList.add("js");if("scrollRestoration"in history)history.scrollRestoration="manual";try{{if(!sessionStorage.getItem("an-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){{d.classList.add("preload");sessionStorage.setItem("an-seen","1");}}}}catch(e){{}}}})(document.documentElement);</script>
{ld}</head>
<body class="{body_class}">
<a class="skip-link" href="#main">Skip to content</a>
<div aria-hidden="true" class="page-curtain"></div>
<div aria-hidden="true" class="preloader"><div class="pl-inner"><span class="pl-name">AstraNexora</span><span class="pl-tag">Next Era in Digital Marketing</span><i class="pl-bar"></i></div></div>
'''


def header(prefix, home):
    menu = "\n".join(
        f'<a href="{prefix}services/{s["slug"]}.html"><span class="mi">{icon(s["slug"])}</span><span><strong>{esc(s["nav"])}</strong>'
        f'<small>{esc(SERVICE_TAGLINES[s["slug"]])}</small></span></a>'
        for s in SERVICES)
    mobile = "\n".join(f'<a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a>' for s in SERVICES)
    return f'''<div class="topbar">
<div class="wrap topbar-inner">
<div class="tb-left">
<a href="mailto:{EMAIL}">{svg(I_MAIL)}{EMAIL}</a>
<a href="{WA}" rel="noopener" target="_blank">{svg(I_CHAT)}Chat on WhatsApp</a>
</div>
<p class="tb-right">{svg(I_PIN)}Tamil Nadu · Serving all of India</p>
</div>
</div>
<header class="site-header" id="header">
<div class="wrap header-inner">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo(prefix)}</a>
<nav aria-label="Main" class="desktop-nav">
<a class="nav-link" href="{home}#home">Home<i>.</i></a>
<a class="nav-link" href="{home}#about">About<i>.</i></a>
<div class="nav-dropdown">
<a aria-haspopup="true" class="nav-link nav-dropdown-toggle" href="{home}#services">Services<i>.</i></a>
<div class="nav-dropdown-panel">
<div class="nav-dropdown-grid">
{menu}
</div>
</div>
</div>
<a class="nav-link" href="{home}#work">Work<i>.</i></a>
<a class="nav-link" href="{prefix}blog/index.html">Blog<i>.</i></a>
<a class="nav-link" href="{home}#contact">Contact<i>.</i></a>
</nav>
<div class="header-tools">
<a aria-label="Chat on WhatsApp" class="ht-icon" href="{WA}" rel="noopener" target="_blank">{WA_ICON}</a>
<a aria-label="Email {EMAIL}" class="ht-icon" href="mailto:{EMAIL}">{svg(I_MAIL)}</a>
{btn("Free audit", f"{home}#contact", "btn-red btn-sm header-cta")}
<button aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu" class="menu-toggle" id="menuToggle" type="button"><span></span><span></span><span></span></button>
</div>
</div>
<nav aria-label="Mobile" class="mobile-menu" id="mobileMenu">
<a href="{home}#home">Home<i>.</i></a>
<a href="{home}#about">About<i>.</i></a>
<details class="mobile-services"><summary>Services<i>.</i></summary>
{mobile}
</details>
<a href="{home}#work">Work<i>.</i></a>
<a href="{prefix}blog/index.html">Blog<i>.</i></a>
<a href="{home}#founder">Founder<i>.</i></a>
<a href="{home}#faq">FAQ<i>.</i></a>
<a href="{home}#contact">Contact<i>.</i></a>
<div class="mobile-contact">
{btn("Get a free audit", f"{home}#contact", "btn-red")}
<a href="{WA}" rel="noopener" target="_blank">Chat on WhatsApp</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
</div>
</nav>
</header>'''


def footer(prefix, home):
    services = "\n".join(f'<li><a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a></li>' for s in SERVICES)
    social = "\n".join(f'<a aria-label="{n}" href="{u}" rel="noopener" target="_blank">{SOCIAL_ICONS[n]}</a>' for n, u in SOCIAL)
    work = "\n".join(f'<li><a href="{prefix}projects/{pr["slug"]}.html">{esc(pr["title"])}</a></li>' for pr in PROJECTS[:3])
    return f'''<footer class="footer">
<div class="wrap footer-grid">
<div class="footer-brand">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo(prefix)}</a>
<p>A digital marketing agency in Tamil Nadu for SEO, websites, branding and performance marketing, planned as one system.</p>
<div class="social">{social}</div>
</div>
<div class="footer-col">
<h3>Services<i>.</i></h3>
<ul>{services}</ul>
</div>
<div class="footer-col">
<h3>Contact us<i>.</i></h3>
<ul class="footer-contact">
<li>{svg(I_CHAT)}<a href="{WA}" rel="noopener" target="_blank">Chat on WhatsApp</a></li>
<li>{svg(I_MAIL)}<a href="mailto:{EMAIL}">{EMAIL}</a></li>
<li>{svg(I_PIN)}<span>Tamil Nadu, India<br/>Serving clients across India</span></li>
</ul>
</div>
<div class="footer-col">
<h3>Our work<i>.</i></h3>
<ul>
<li><a href="{prefix}projects/seo-report.html">SEO report dashboard</a></li>
{work}
</ul>
</div>
</div>
<div aria-hidden="true" class="wrap footer-mark"><span>AstraNexora</span></div>
<div class="footer-bottom">
<div class="wrap fb-inner">
<span>© 2026 Astra Nexora. All rights reserved.</span>
<nav aria-label="Footer"><a href="{home}#about">About</a><a href="{home}#services">Services</a><a href="{prefix}blog/index.html">Blog</a><a href="{home}#faq">FAQ</a><a href="{home}#contact">Contact</a></nav>
</div>
</div>
</footer>

<a aria-label="Chat with Astra Nexora on WhatsApp" class="float-whatsapp" href="{WA}" rel="noopener" target="_blank">{WA_ICON}</a>
<button aria-label="Back to top" class="to-top" type="button"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></button>'''


def scripts(prefix):
    return f'''
<script defer src="{prefix}js/vendor/gsap.min.js"></script>
<script defer src="{prefix}js/vendor/ScrollTrigger.min.js"></script>
<script defer src="{prefix}js/vendor/lenis.min.js"></script>
<script defer src="{prefix}js/main.js"></script>
</body>
</html>
'''


def field(name, label, ic, typ="text", required=True, extra=""):
    req = ' required=""' if required else ""
    err = f'<span aria-live="polite" class="form-error" id="{name}Error"></span>' if required else ""
    desc = f' aria-describedby="{name}Error"' if required else ""
    return f'''<div class="form-field">
<label for="{name}">{svg(ic)}<span>{label}</span></label>
<input{desc} id="{name}" name="{name}" type="{typ}"{req}{extra}/>
{err}
</div>'''


def audit_form():
    opts = ["Free website audit"] + [s["title"] for s in SERVICES] + ["Something else"]
    options = "\n".join(f'<option value="{attr(o)}">{esc(o)}</option>' for o in opts)
    return f'''<form class="audit-form" id="auditForm" novalidate="">
{field("name", "Your name", I_USER, extra=' autocomplete="name" placeholder="Full name"')}
{field("phone", "Mobile number", I_PHONE, "tel", extra=' autocomplete="tel" inputmode="tel" placeholder="+91"')}
{field("company", "Company name", I_BRIEF, extra=' autocomplete="organization" placeholder="Your business"')}
{field("website", "Website", I_GLOBE, extra=' autocomplete="url" inputmode="url" placeholder="yourbusiness.com or none"')}
{field("email", "Email (optional)", I_MAIL, "email", required=False, extra=' autocomplete="email" inputmode="email" placeholder="you@company.com"')}
<div class="form-field">
<label for="service">{svg(I_TARGET)}<span>Service</span></label>
<select id="service" name="service">
{options}
</select>
</div>
<div class="form-field full">
<label for="message">{svg(I_EDIT)}<span>Message (optional)</span></label>
<textarea id="message" name="message" placeholder="A line about your goals" rows="2"></textarea>
</div>
<div class="form-actions">
<button class="btn btn-red" type="submit"><span>Send on WhatsApp</span><i class="btn-ic">{ARROW}</i></button>
<p class="form-note">This opens WhatsApp with your details filled in. Nothing is stored here.</p>
</div>
</form>'''


def contact_section():
    return f'''<section aria-labelledby="contactTitle" class="contact" id="contact">
<div aria-hidden="true" class="dot-map"><i style="--x:22%;--y:38%"></i><i style="--x:47%;--y:30%"></i><i style="--x:69%;--y:52%"></i><i style="--x:80%;--y:70%"></i><i style="--x:58%;--y:76%"></i></div>
<div class="wrap contact-inner">
<div class="contact-card" data-reveal="">
<span class="sub">Get in touch</span>
<h2 id="contactTitle">Contact us<i>.</i></h2>
<p class="contact-intro">Tell us about your business and we'll send back a free website audit on WhatsApp.</p>
{audit_form()}
</div>
<div class="contact-side" data-reveal="">
<h3>Free website audit<i>.</i></h3>
<p>We review your website, Google presence and competitors, and show you what to fix first. No obligation.</p>
<ul class="contact-list">
<li>{svg(I_CHAT)}<div><small>WhatsApp</small><a href="{WA}" rel="noopener" target="_blank">Chat with us now</a></div></li>
<li>{svg(I_MAIL)}<div><small>Email</small><a href="mailto:{EMAIL}">{EMAIL}</a></div></li>
<li>{svg(I_PIN)}<div><small>Based in</small><span>Tamil Nadu, India</span></div></li>
</ul>
<p class="contact-status"><i aria-hidden="true" class="live-dot"></i>Replies usually within 24 hours</p>
</div>
</div>
</section>'''


def breadcrumb_schema(items):
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": n, "item": SITE + p}
            for i, (n, p) in enumerate(items, 1)
        ],
    }


def faq_schema(faqs):
    return {
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs],
    }


def faq_section(faqs, title):
    items = "\n".join(
        f'''<details class="faq-item"{' open=""' if i == 1 else ''}>
<summary><span class="faq-n">{i:02d}</span><span class="faq-q">{esc(q)}</span><i aria-hidden="true"></i></summary>
<div class="faq-a"><p>{esc(a)}</p></div>
</details>''' for i, (q, a) in enumerate(faqs, 1))
    return f'''<section aria-labelledby="faqTitle" class="sec faq" id="faq">
<div class="wrap faq-grid">
<div class="faq-side">
{heading("FAQ", title, "Can't find your answer? Message us on WhatsApp and we'll reply.", title_id="faqTitle")}
{btn("Ask on WhatsApp", WA, "btn-red", target=True)}
</div>
<div class="faq-list" data-reveal="">
{items}
</div>
</div>
</section>'''


def cta_band(home):
    points = ["Free website audit", "Reply within 24 hours", "No obligation"]
    steps = [("01", "Share your website"), ("02", "We review it"), ("03", "You get a fix list")]
    return f'''<section aria-labelledby="ctaTitle" class="cta">
<div class="wrap">
<div class="cta-card" data-reveal="">
<div aria-hidden="true" class="cta-deco">{shapes("sh-cta")}<i class="cta-glow"></i></div>
<div class="cta-copy">
<span class="sub">Free · no obligation</span>
<h2 id="ctaTitle">Find out what's holding your <span class="box">website back.</span></h2>
<ul class="cta-points">{"".join(f"<li>{CHECK}{p}</li>" for p in points)}</ul>
</div>
<div class="cta-side">
<ol class="cta-steps">{"".join(f'<li><b>{n}</b><span>{t}</span></li>' for n, t in steps)}</ol>
<div class="actions">
{btn("Get my free audit", f"{home}#contact", "btn-white")}
{btn("Chat on WhatsApp", WA, "btn-line", target=True)}
</div>
</div>
</div>
</div>
</section>'''


def svc_card(i, title, text, href=None, ic=None, sub=None):
    tag_open, tag_close = (f'<a class="svc-card" data-reveal="" href="{href}">', "</a>") if href else ('<li class="svc-card" data-reveal="">', "</li>")
    icon_html = f'<span class="svc-icon">{ic}</span>' if ic else f'<span class="svc-icon num">{i:02d}</span>'
    sub_html = f'<small>{esc(sub)}</small>' if sub else ""
    more = f'<span class="svc-more">Read more {ARROW}</span>' if href else ""
    return f'''{tag_open}
{icon_html}
<div class="svc-body">{sub_html}<h3>{esc(title)}</h3><p>{esc(text)}</p>{more}</div>
<span aria-hidden="true" class="svc-big">{i:02d}</span>
{tag_close}'''


def steps_list(items, with_tags=False):
    out = ""
    for i, it in enumerate(items, 1):
        t, d = it[0], it[1]
        tg = f'<small>{esc(it[2])}</small>' if with_tags and len(it) > 2 else ""
        out += f'''<li class="bar" data-reveal="">
<div class="bar-head"><h3>{esc(t)}</h3><span>Step {i:02d}</span></div>
<p>{esc(d)}</p>{tg}
<div aria-hidden="true" class="bar-track"><i style="--d:{i}"></i></div>
</li>
'''
    return out


def timeline(items):
    out = "".join(
        f'''<li class="tl-step" data-reveal=""><span class="tl-dot">{i:02d}</span><h3>{esc(it[0])}</h3><p>{esc(it[1])}</p></li>'''
        for i, it in enumerate(items, 1))
    return f'<div class="tl"><span aria-hidden="true" class="tl-line"><i></i></span><ol class="tl-steps">{out}</ol></div>'


def step_cards(items):
    return "\n".join(
        f'''<li class="step-card" data-reveal=""><span class="sc-n">{i:02d}</span><h3>{esc(it[0])}</h3><p>{esc(it[1])}</p></li>'''
        for i, it in enumerate(items, 1))


def work_card(href, image_html, cat, label, title, text, more="View project"):
    return f'''<a class="work-card" data-reveal="" href="{href}">
<div class="work-media img-wrap">{image_html}</div>
<div class="work-body">
<p class="work-meta"><span>{esc(label)}</span><i>/</i><b>{esc(cat)}</b></p>
<h3>{esc(title)}</h3>
<p>{esc(text)}</p>
<span class="work-more">{more} {ARROW}</span>
</div>
</a>'''


def dashboard_card(prefix):
    image = (f'<img alt="Astra Nexora SEO report dashboard showing organic clicks, enquiries and rankings" class="lqip" decoding="async" height="1125" '
             f'loading="lazy" sizes="(min-width: 1001px) 400px, 94vw" src="{prefix}assets/projects/seo-report-dashboard-w800.webp" '
             f'srcset="{prefix}assets/projects/seo-report-dashboard-w800.webp 800w, {prefix}assets/projects/seo-report-dashboard-w1200.webp 1200w" width="1800"/>')
    return work_card(f"{prefix}projects/seo-report.html", image, "Analytics", "Live demo", "SEO Report Dashboard",
                     "The monthly dashboard every SEO client gets: clicks, enquiries, rankings and site health. Shown with sample data.")


# =================================================================== home

def home_page(posts=()):
    p, home = "", ""

    org = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": SITE + "#organization",
                "name": "Astra Nexora",
                "alternateName": ["AstraNexora", "Astra Nexora Digital Marketing"],
                "slogan": "Next Era in Digital Marketing",
                "description": "Astra Nexora (AstraNexora) is a digital marketing agency in Tamil Nadu, India for SEO, websites, branding, social media, performance marketing and AI automation.",
                "url": SITE,
                "logo": {"@type": "ImageObject", "url": SITE + "assets/brand/logo-square.png", "width": 512, "height": 512},
                "image": SITE + "assets/og-image.jpg",
                "email": EMAIL,
                "foundingDate": "2025",
                "foundingLocation": "Tamil Nadu, India",
                "founder": {"@type": "Person", "name": HOME["founder"]["name"], "jobTitle": HOME["founder"]["role"],
                            "sameAs": [HOME["founder"]["linkedin"]]},
                "sameAs": [u for _, u in SOCIAL],
            },
            {
                "@type": "WebSite",
                "@id": SITE + "#website",
                "name": "Astra Nexora",
                "alternateName": ["AstraNexora", "Astra Nexora Digital Marketing"],
                "url": SITE,
                "publisher": {"@id": SITE + "#organization"},
                "inLanguage": "en-IN",
            },
            {
                "@type": "ProfessionalService",
                "@id": SITE + "#service",
                "name": "Astra Nexora",
                "description": "Digital marketing agency in Tamil Nadu, India: " + ", ".join(s["title"] for s in SERVICES) + ".",
                "url": SITE,
                "image": SITE + "assets/og-image.jpg",
                "email": EMAIL,
                "parentOrganization": {"@id": SITE + "#organization"},
                "address": {"@type": "PostalAddress", "addressRegion": "Tamil Nadu", "addressCountry": "IN"},
                "areaServed": {"@type": "Country", "name": "India"},
                "makesOffer": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": s["title"], "url": SITE + f"services/{s['slug']}.html"}} for s in SERVICES],
                "sameAs": [u for _, u in SOCIAL],
            },
        ],
    }
    faq = {"@context": "https://schema.org", **faq_schema(HOME["faqs"])}

    title = "Astra Nexora | Digital Marketing & SEO Agency in Tamil Nadu"
    desc = ("Astra Nexora (AstraNexora) is a digital marketing agency in Tamil Nadu, India: SEO, websites, branding, "
            "social media, Google & Meta ads and AI automation.")

    cards = "\n".join(svc_card(i, s["title"], SERVICE_TAGLINES[s["slug"]] + ". " + strip_tags(s["lead"]).split(". ")[0] + ".",
                               f"services/{s['slug']}.html", icon(s["slug"]))
                      for i, s in enumerate(SERVICES, 1))

    work = dashboard_card(p) + "\n" + "\n".join(
        work_card(f"projects/{pr['slug']}.html", img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 400px, 94vw", p),
                  pr["category"], "Concept", pr["title"], pr["summary"])
        for pr in PROJECTS)

    f = HOME["founder"]
    timeline_html = "".join(f'<li><b>{y}</b><span>{esc(t)}</span></li>' for y, t in f["timeline"])

    principles = "\n".join(
        f'<li class="pr-item" data-reveal=""><span class="pr-n">{i:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></li>'
        for i, (_, t, d) in enumerate(HOME["principles"], 1))

    info = [
        (I_CHAT, "Want a quick answer? Tap to", "chat with us on WhatsApp", WA, True),
        (I_MAIL, "Prefer email? Send your brief or questions to", EMAIL, f"mailto:{EMAIL}", False),
        (I_SHARE, "Follow our work and tips on", "Instagram, LinkedIn, Facebook", "#founder", False),
        (I_PIN, "Based in Tamil Nadu, working with businesses across", "all of India", "#contact", False),
    ]
    info_html = "\n".join(
        f'<li class="info-card" data-reveal=""><span class="info-ic">{svg(ic)}</span>{svg(ic, "info-ghost")}'
        f'<p>{esc(t)} <a href="{h}"{" rel=\"noopener\" target=\"_blank\"" if blank else ""}>{esc(v)}</a></p></li>'
        for ic, t, v, h, blank in info)


    body = f'''{header(p, home)}

<main id="main">

<section aria-labelledby="heroTitle" class="hero" id="home">
<div class="hero-panel">
<div aria-hidden="true" class="hero-deco">{shapes("sh-hero")}<span class="hero-dots"></span><span class="hero-beam"></span></div>
<div class="hero-copy">
<p class="hero-cats"><span>SEO</span><span>Websites</span><span>Branding</span><span>Performance Ads</span></p>
<h1 class="hero-title" id="heroTitle"><span class="ln"><span>Marketing that</span></span> <span class="ln"><span class="box">gets you chosen.</span></span></h1>
<p class="hero-lead">{esc(HOME["hero_lead"])}</p>
<div class="actions">
{btn("Our services", "#services", "btn-white")}
{btn("Free audit", "#contact", "btn-white")}
</div>
</div>
</div>
<div class="hero-photo img-wrap">
{img("pexels-39190577", "Marketing team reviewing results on a large screen", "(min-width: 1001px) 55vw, 100vw", p, eager=True)}
</div>
</section>

<section aria-labelledby="aboutTitle" class="sec about" id="about">
<div class="wrap about-grid">
<div class="collage" data-reveal="">
<span aria-hidden="true" class="tri tri-a"></span>
<span aria-hidden="true" class="tri tri-b"></span>
<div class="col-big img-wrap clip-reveal">{img("pexels-39205089", "Team planning a marketing strategy around a table", "(min-width: 1001px) 40vw, 90vw", p)}</div>
<div class="col-small img-wrap">{img("pexels-6476246", "Reviewing campaign results on a tablet", "(min-width: 1001px) 20vw, 50vw", p)}</div>
<div class="col-badge"><b>2025</b><span>Founded in Tamil Nadu</span></div>
</div>
<div class="about-copy">
{heading("About us", 'Few reasons why you should <span class="hl">choose us.</span>', title_id="aboutTitle")}
<p data-reveal="">{esc(HOME["about"][0])}</p>
<div class="about-feats" data-reveal="">
<div class="af">{svg(I_GROW, "af-ghost")}<h3>Business growth</h3><p>Every page, post and ad is planned around the enquiries it should bring in.</p></div>
<div class="af">{svg(I_TARGET, "af-ghost")}<h3>Our mission</h3><p>Help businesses build a digital presence that looks premium and earns trust.</p></div>
</div>
<div class="about-sign" data-reveal="">
{btn("Meet the founder", "#founder", "btn-red")}
<p><b>{esc(f["name"])}</b><span>{esc(f["role"])}</span></p>
</div>
</div>
</div>
</section>

<section aria-labelledby="servicesTitle" class="sec services" id="services">
<div aria-hidden="true" class="floaters"><i class="f1"></i><i class="f2"></i><i class="f3"></i><i class="f4"></i></div>
<div aria-hidden="true" class="svc-bg img-wrap">{img("pexels-577210", "", "40vw", p)}</div>
<div class="wrap">
{heading("Services", 'Expand your digital <span class="hl">presence with us.</span>', "Eight services, planned together by one team. Pick one, or let us run the whole system.", center=True, title_id="servicesTitle")}
<div class="svc-grid">
{cards}
</div>
</div>
</section>

<section aria-labelledby="processTitle" class="sec process" id="process">
<div class="wrap process-grid">
<div class="process-copy">
{heading("Our process", 'How we grow your <span class="hl">business.</span>', "Every step has a clear outcome before the next one starts, so you always know what's happening and why.", title_id="processTitle")}
<ol class="bars">
{steps_list(HOME["process"])}</ol>
</div>
<div class="process-photo img-wrap clip-reveal">
{img("pexels-36706460", "Developer building a client website on two monitors", "(min-width: 1001px) 40vw, 94vw", p)}
<div class="pp-card"><b>Free</b><span>Website audit to start</span></div>
</div>
</div>
</section>

<section aria-label="Ways to reach us" class="info">
<ul class="wrap info-grid">
{info_html}
</ul>
</section>

<section aria-labelledby="founderTitle" class="sec founder" id="founder">
<div aria-hidden="true" class="orbs"><i></i><i></i></div>
<div class="wrap founder-grid">
<div class="founder-visual" data-reveal="">
<span aria-hidden="true" class="fv-frame"></span>
<div class="fv-photo img-wrap clip-reveal"><img alt="S. Saktheeswaran, Founder and Managing Director of Astra Nexora" class="lqip" decoding="async" height="900" loading="lazy" sizes="(min-width: 1001px) 460px, 90vw" src="assets/founder/sakthi-chair-w720.webp" srcset="assets/founder/sakthi-chair-w480.webp 480w, assets/founder/sakthi-chair-w720.webp 720w" width="720"/></div>
<div class="fv-desk img-wrap"><img alt="Sakthi at his desk in the Astra Nexora studio" class="lqip" decoding="async" height="900" loading="lazy" sizes="220px" src="assets/founder/sakthi-desk-w480.webp" width="720"/></div>
<svg aria-hidden="true" class="fv-ring" viewbox="0 0 200 200"><defs><path d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" id="ringPath"/></defs><text><textPath href="#ringPath">ASTRA NEXORA · NEXT ERA IN DIGITAL MARKETING ·</textPath></text></svg>
<div class="fv-badge"><b>Since 2025</b><span>Founder &amp; MD</span></div>
</div>
<div class="founder-copy">
{heading("Meet the founder", f'{esc(f["name"])}<span class="hl">.</span>', title_id="founderTitle", light=True)}
<p class="founder-role" data-reveal="">{esc(f["role"])}</p>
<p class="founder-lead" data-reveal="">{esc(f["bio"][0])}</p>
<p class="founder-p" data-reveal="">{esc(f["bio"][1])} When you work with Astra Nexora, you work with him directly.</p>
<ul class="founder-skills" data-reveal="">{"".join(f"<li>{x}</li>" for x in ["Digital marketing", "SEO", "Website development", "WordPress & Wix", "Branding", "Content creation"])}</ul>
<ol class="founder-time" data-reveal="">{timeline_html}</ol>
<div class="actions" data-reveal="">
{btn("Talk to Sakthi", WA, "btn-white", target=True)}
{btn("LinkedIn", f["linkedin"], "btn-line", target=True)}
</div>
</div>
</div>
</section>

<section aria-labelledby="principlesTitle" class="sec principles" id="principles">
<div aria-hidden="true" class="floaters"><i class="f1"></i><i class="f2"></i><i class="f3"></i><i class="f4"></i></div>
<div class="wrap">
{heading("Why it works", 'Helping brands grow <span class="hl">with clarity.</span>', center=True, title_id="principlesTitle")}
<ul class="pr-grid">
{principles}
</ul>
</div>
</section>

<section aria-labelledby="workTitle" class="sec work" id="work">
<div aria-hidden="true" class="floaters"><i class="f1"></i><i class="f2"></i><i class="f3"></i><i class="f4"></i></div>
<div class="wrap">
{heading("Our work", 'Projects built <span class="hl">to deliver.</span>', "A live reporting demo and concept projects that show how we think. Client case studies are added as clients approve them.", center=True, title_id="workTitle")}
<div class="work-grid">
{work}
</div>
</div>
</section>

{blog_section(posts, p) if posts else ""}

{faq_section(HOME["faqs"], 'Questions, <span class="hl">answered.</span>')}

{contact_section()}

</main>

{footer(p, home)}
'''
    return head(title, desc, "", p, [org, faq], preload="pexels-39190577", body_class="site home") + body + scripts(p)


# =================================================================== inner pages

def page_hero(home, crumbs, kicker, h1, lead, actions, image_html):
    crumb_html = "".join(
        f'<a href="{href}">{esc(name)}</a><span aria-hidden="true">/</span>' if href else f'<span aria-current="page">{esc(name)}</span>'
        for name, href in crumbs)
    return f'''<section class="hero page-hero" id="home">
<div class="hero-panel">
<div aria-hidden="true" class="hero-deco">{shapes("sh-hero")}<span class="hero-dots"></span><span class="hero-beam"></span></div>
<div class="hero-copy">
<nav aria-label="Breadcrumb" class="breadcrumb">{crumb_html}</nav>
<p class="hero-cats"><span>{kicker}</span></p>
<h1 class="hero-title">{h1}</h1>
<p class="hero-lead">{lead}</p>
<div class="actions">{actions}</div>
</div>
</div>
<div class="hero-photo img-wrap">{image_html}</div>
</section>'''


def split_title(text):
    """Puts the <em> part of a heading in the hero box."""
    if "<em>" in text:
        a, rest = text.split("<em>", 1)
        b, c = rest.split("</em>", 1)
        return f'<span class="ln"><span>{a.strip()}</span></span> <span class="ln"><span class="box">{b}{c}</span></span>'
    return f'<span class="ln"><span>{text}</span></span>'


def facts_row(facts):
    items = "\n".join(f'<li class="info-card fact" data-reveal=""><small>{esc(k)}</small><strong>{esc(v)}</strong></li>' for k, v in facts)
    return f'''<section aria-label="Key facts" class="info">
<ul class="wrap info-grid">
{items}
</ul>
</section>'''


def service_page(s, index):
    p, home = "../", "../index.html"
    path = f"services/{s['slug']}.html"
    title = f"{s['title']} | Astra Nexora"
    desc = strip_tags(s["lead"])

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": s["title"],
                "serviceType": s["title"],
                "description": desc,
                "url": SITE + path,
                "provider": {"@type": "ProfessionalService", "name": "Astra Nexora", "url": SITE},
                "areaServed": {"@type": "Country", "name": "India"},
                "hasOfferCatalog": {"@type": "OfferCatalog", "name": s["title"], "itemListElement": [
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "description": d}} for n, d in s["includes"]]},
            },
            breadcrumb_schema([("Home", ""), ("Services", "#services"), (s["title"], path)]),
            faq_schema(s["faqs"]),
        ],
    }

    hero = page_hero(
        home,
        [("Home", home), ("Services", f"{home}#services"), (s["nav"], None)],
        f"Service {index:02d} · {esc(s['nav'])}", split_title(s["h1"]), esc(s["lead"]),
        btn("Free consultation", f"{home}#contact", "btn-white") + btn("WhatsApp", WA, "btn-white", target=True),
        img(s["hero"], s["hero_alt"], "(min-width: 1001px) 55vw, 100vw", p, eager=True))

    includes = "\n".join(svc_card(i, n, d) for i, (n, d) in enumerate(s["includes"], 1))
    deliver = "".join(f"<li>{CHECK}{esc(d)}</li>" for d in s["deliverables"])
    ideal = "".join(f"<li>{esc(t)}</li>" for t in s["ideal"])

    related = "\n".join(
        work_card(f'{SERVICE_BY_SLUG[slug]["slug"]}.html',
                  img(SERVICE_BY_SLUG[slug]["hero"], SERVICE_BY_SLUG[slug]["hero_alt"], "(min-width: 1001px) 400px, 94vw", p),
                  SERVICE_BY_SLUG[slug]["nav"], "Service", SERVICE_BY_SLUG[slug]["title"], SERVICE_TAGLINES[slug] + ".", "Explore service")
        for slug in s["related"])
    prev_s = SERVICES[(index - 2) % len(SERVICES)]
    next_s = SERVICES[index % len(SERVICES)]

    body = f'''{header(p, home)}

<main id="main">

{hero}

{facts_row(s["facts"])}

<section aria-labelledby="overviewTitle" class="sec overview">
<div class="wrap ov-grid">
<div class="ov-media" data-reveal="">
<span aria-hidden="true" class="tri tri-a"></span>
<div class="ov-photo img-wrap img-reveal">{img(s["side"], s["side_alt"], "(min-width: 1001px) 45vw, 92vw", p)}</div>
<div class="ov-badge"><span class="svc-icon">{icon(s["slug"])}</span><div><b>Service {index:02d}</b><span>{esc(s["nav"])}</span></div></div>
</div>
<div class="about-copy">
{heading("Why it matters", esc(s["overview"][0]), title_id="overviewTitle", cls="small")}
<p data-reveal="">{esc(s["overview"][1])}</p>
<div class="ideal" data-reveal=""><h3>Ideal for<i>.</i></h3><ul class="chips">{ideal}</ul></div>
</div>
</div>
</section>

<section aria-labelledby="includesTitle" class="sec services">
<div class="wrap">
{heading("What's included", f'Everything in <span class="hl">{esc(s["nav"])}.</span>', "Choose the pieces you need, or let us run the whole service for you.", center=True, title_id="includesTitle")}
<ul class="svc-grid">
{includes}
</ul>
</div>
</section>

<section aria-labelledby="processTitle" class="sec steps-sec">
<div class="wrap">
{heading("How we work", 'A clear process, <span class="hl">start to finish.</span>', "You always know what's happening, what's next and what it's achieving.", center=True, title_id="processTitle")}
{timeline(s["process"])}
</div>
</section>

<section aria-labelledby="deliverTitle" class="sec deliver">
<div class="wrap deliver-grid">
{heading("Deliverables", 'What you <span class="hl">get.</span>', "Every engagement comes with clear deliverables and regular reporting.", title_id="deliverTitle", light=True)}
<ul class="deliver-list" data-reveal="">{deliver}</ul>
</div>
</section>

{faq_section(s["faqs"], f'Questions about <span class="hl">{esc(s["nav"])}.</span>')}

<section aria-labelledby="relatedTitle" class="sec work">
<div class="wrap">
{heading("Related", 'Works well <span class="hl">with.</span>', center=True, title_id="relatedTitle")}
<div class="work-grid">
{related}
</div>
<nav aria-label="More services" class="pager">
<a href="{prev_s["slug"]}.html"><small>‹ Previous</small><strong>{esc(prev_s["nav"])}</strong></a>
<a href="{next_s["slug"]}.html"><small>Next ›</small><strong>{esc(next_s["nav"])}</strong></a>
</nav>
</div>
</section>

{cta_band(home)}

</main>

{footer(p, home)}
'''
    return head(title, desc, path, p, [schema], preload=s["hero"]) + body + scripts(p)


def project_page(pr, index):
    p, home = "../", "../index.html"
    path = f"projects/{pr['slug']}.html"
    title = f"{pr['title']} — Concept Project | Astra Nexora"
    svc = SERVICE_BY_SLUG[pr["related"]]

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "CreativeWork", "name": pr["title"], "description": pr["summary"], "genre": "Concept project",
             "creator": {"@type": "Organization", "name": "Astra Nexora", "url": SITE}},
            breadcrumb_schema([("Home", ""), ("Work", "#work"), (pr["title"], path)]),
        ],
    }

    hero = page_hero(
        home,
        [("Home", home), ("Work", f"{home}#work"), (pr["title"], None)],
        f"Concept project · {esc(pr['category'])}", f'<span class="ln"><span class="box">{esc(pr["title"])}</span></span>', esc(pr["summary"]),
        btn("Start a similar project", f"{home}#contact", "btn-white") + btn(f"See {svc['nav']}", f"../services/{svc['slug']}.html", "btn-white"),
        img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 55vw, 100vw", p, eager=True))

    deliver = "".join(f"<li>{CHECK}{esc(d)}</li>" for d in pr["deliverables"])
    goals = "\n".join(f'<li class="pr-item" data-reveal=""><span class="pr-n">{i:02d}</span><h3>{esc(g)}</h3></li>' for i, g in enumerate(pr["goals"], 1))
    nxt = PROJECTS[index % len(PROJECTS)]

    body = f'''{header(p, home)}

<main id="main">

{hero}

{facts_row(pr["meta"])}

<div class="wrap note-wrap"><p class="concept-note"><strong>Concept project.</strong> This shows how we would approach this kind of brief. It is not a client case study and has no client results.</p></div>

<section aria-labelledby="challengeTitle" class="sec brief">
<div class="wrap">
<div class="brief-wrap">
<div class="brief-photo img-wrap img-reveal">{img(pr["second"], pr["second_alt"], "(min-width: 1001px) 1240px, 94vw", p)}</div>
<div class="brief-card" data-reveal="">
{heading("The brief", 'The <span class="hl">challenge.</span>', title_id="challengeTitle", cls="small")}
<p>{esc(pr["challenge"])}</p>
</div>
</div>
</div>
</section>

<section aria-labelledby="approachTitle" class="sec services">
<div class="wrap">
{heading("Our approach", 'How we\'d <span class="hl">solve it.</span>', "Four steps, each with a clear outcome before the next one starts.", center=True, title_id="approachTitle")}
<ol class="step-grid">
{step_cards(pr["approach"])}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="sec deliver">
<div class="wrap deliver-grid">
{heading("Scope", 'What we\'d <span class="hl">deliver.</span>', f"Part of our {esc(svc['title'])} service.", title_id="deliverTitle", light=True)}
<ul class="deliver-list" data-reveal="">{deliver}</ul>
</div>
</section>

<section aria-labelledby="goalsTitle" class="sec principles">
<div class="wrap">
{heading("Success measures", 'What success <span class="hl">looks like.</span>', "The goals we'd set and report against for a project like this.", center=True, title_id="goalsTitle")}
<ul class="pr-grid two">
{goals}
</ul>
</div>
</section>

<section aria-labelledby="nextTitle" class="sec work">
<div class="wrap">
{heading("Next project", 'Keep <span class="hl">exploring.</span>', center=True, title_id="nextTitle")}
<div class="work-grid one">
{work_card(f"{nxt['slug']}.html", img(nxt["hero"], nxt["hero_alt"], "(min-width: 1001px) 600px, 94vw", p), nxt["category"], "Concept", nxt["title"], nxt["summary"])}
</div>
</div>
</section>

{cta_band(home)}

</main>

{footer(p, home)}
'''
    return head(title, pr["summary"], path, p, [schema], preload=pr["hero"]) + body + scripts(p)


def not_found_page():
    p, home = "/", "/index.html"
    body = f'''{header(p, home)}

<main id="main">
<section class="hero page-hero" id="home">
<div class="hero-panel">
<div aria-hidden="true" class="hero-deco">{shapes("sh-hero")}<span class="hero-dots"></span><span class="hero-beam"></span></div>
<div class="hero-copy">
<p class="hero-cats"><span>Error 404</span></p>
<h1 class="hero-title"><span class="ln"><span>This page</span></span> <span class="ln"><span class="box">isn't here.</span></span></h1>
<p class="hero-lead">The link may be old or mistyped. Head back home, or tell us what you were looking for on WhatsApp.</p>
<div class="actions">{btn("Go to home", "/", "btn-white")}{btn("Chat on WhatsApp", WA, "btn-white", target=True)}</div>
</div>
</div>
<div class="hero-photo img-wrap">{img("pexels-7598019", "", "(min-width: 1001px) 55vw, 100vw", p, eager=True)}</div>
</section>
</main>

{footer(p, home)}
'''
    return (head("Page not found | Astra Nexora", "This page could not be found.", "404.html", p, [])
            .replace('<meta content="index, follow, max-image-preview:large, max-snippet:-1" name="robots"/>', '<meta content="noindex" name="robots"/>')
            + body + scripts(p))


def llms_txt(posts=()):
    lines = [
        "# Astra Nexora",
        "",
        "> Astra Nexora (AstraNexora) is a digital marketing agency in Tamil Nadu, India. Tagline: Next Era in Digital Marketing. "
        "Founded in 2025 by S. Saktheeswaran (Sakthi), Founder & Managing Director. Serves businesses across India.",
        "",
        "## Services",
    ]
    lines += [f"- [{s['title']}]({SITE}services/{s['slug']}.html): {SERVICE_TAGLINES[s['slug']]}" for s in SERVICES]
    lines += ["", "## Work", f"- [SEO report dashboard (sample data)]({SITE}projects/seo-report.html)"]
    lines += [f"- [{pr['title']} (concept project)]({SITE}projects/{pr['slug']}.html)" for pr in PROJECTS]
    if posts:
        lines += ["", "## Blog"] + [f"- [{strip_tags(x['title'])}]({SITE}blog/{x['slug']}.html): {x['description']}" for x in posts]
    lines += ["", "## Contact", f"- Website: {SITE}", f"- Email: {EMAIL}", f"- WhatsApp: {WA}",
              "- Instagram: https://www.instagram.com/astranexora2025/", "- LinkedIn: https://www.linkedin.com/company/astra-nexora/", ""]
    return "\n".join(lines)


# =================================================================== blog
# Posts live in scripts/posts/<slug>.md: a small "key: value" header between
# --- lines, then the body in a simple Markdown subset (## / ### headings,
# paragraphs, - and 1. lists, > quotes, **bold**, *italic*, [links](url)).
# Header keys: title (wrap the boxed part in <em>), seo_title (optional, under
# ~45 characters), description, date (YYYY-MM-DD), category, image + image_alt
# (a key from assets/stock), services (comma-separated slugs), draft: true.

POSTS_DIR = os.path.join(ROOT, "scripts", "posts")
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def md_inline(text):
    text = esc(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"<em>\1</em>", text)

    def link(m):
        label, href = m.group(1), m.group(2)
        ext = href.startswith("http") and "astranexora" not in href
        return f'<a href="{href}"{" rel=\"noopener\" target=\"_blank\"" if ext else ""}>{label}</a>'
    return re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def md_to_html(text):
    """Returns (html, [(id, heading)]) for the post body."""
    out, toc = [], []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = [l.rstrip() for l in block.strip().split("\n")]
        first = lines[0]
        if first.startswith("### "):
            out.append(f"<h3>{md_inline(first[4:])}</h3>")
        elif first.startswith("## "):
            hid = slugify(first[3:])
            toc.append((hid, first[3:]))
            out.append(f'<h2 id="{hid}">{md_inline(first[3:])}</h2>')
        elif all(re.match(r"[-*] ", l) for l in lines):
            out.append("<ul>" + "".join(f"<li>{md_inline(l[2:])}</li>" for l in lines) + "</ul>")
        elif all(re.match(r"\d+\. ", l) for l in lines):
            out.append("<ol>" + "".join(f"<li>{md_inline(l.split('. ', 1)[1])}</li>" for l in lines) + "</ol>")
        elif all(l.startswith(">") for l in lines):
            out.append("<blockquote><p>" + md_inline(" ".join(l.lstrip("> ") for l in lines)) + "</p></blockquote>")
        else:
            out.append("<p>" + md_inline(" ".join(lines)) + "</p>")
    return "\n".join(out), toc


def load_posts():
    posts = []
    if not os.path.isdir(POSTS_DIR):
        return posts
    for name in sorted(os.listdir(POSTS_DIR)):
        if not name.endswith(".md"):
            continue
        raw = open(os.path.join(POSTS_DIR, name), encoding="utf-8").read()
        _, header_block, body = raw.split("---", 2)
        meta = {}
        for line in header_block.strip().split("\n"):
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
        if meta.get("draft") == "true":
            continue
        meta["slug"] = name[:-3]
        meta["html"], meta["toc"] = md_to_html(body)
        words = len(re.findall(r"\w+", body))
        meta["minutes"] = max(1, round(words / 200))
        y, m, d = meta["date"].split("-")
        meta["date_label"] = f"{int(d)} {MONTHS[int(m) - 1]} {y}"
        meta["services"] = [x.strip() for x in meta.get("services", "").split(",") if x.strip()]
        posts.append(meta)
    return sorted(posts, key=lambda p: p["date"], reverse=True)


def post_card(post, prefix):
    return work_card(f"{prefix}blog/{post['slug']}.html",
                     img(post["image"], post["image_alt"], "(min-width: 1001px) 400px, 94vw", prefix),
                     post["category"], post["date_label"], strip_tags(post["title"]), post["description"], "Read post")


def blog_section(posts, prefix, title="Latest from <span class=\"hl\">the blog.</span>", kicker="Blog"):
    cards = "\n".join(post_card(p, prefix) for p in posts[:3])
    return f'''<section aria-labelledby="blogTitle" class="sec work blog-latest" id="blog">
<div class="wrap">
{heading(kicker, title, "Practical guides on SEO, websites and marketing for growing businesses.", center=True, title_id="blogTitle")}
<div class="work-grid">
{cards}
</div>
<div class="center-cta">{btn("All blog posts", f"{prefix}blog/index.html", "btn-red")}</div>
</div>
</section>'''


def blog_index_page(posts):
    p, home = "../", "../index.html"
    path = "blog/"
    title = "Blog: SEO, Websites & Digital Marketing Guides | Astra Nexora"
    desc = "Practical guides from Astra Nexora on SEO, websites, branding, ads and AI marketing for businesses in India."
    schema = {"@context": "https://schema.org", "@graph": [
        {"@type": "Blog", "name": "Astra Nexora Blog", "url": SITE + path, "publisher": {"@type": "Organization", "name": "Astra Nexora", "url": SITE},
         "blogPost": [{"@type": "BlogPosting", "headline": strip_tags(x["title"]), "url": SITE + f"blog/{x['slug']}.html", "datePublished": x["date"]} for x in posts]},
        breadcrumb_schema([("Home", ""), ("Blog", path)]),
    ]}
    hero = page_hero(home, [("Home", home), ("Blog", None)], "Blog · Guides",
                     '<span class="ln"><span>Ideas that help you</span></span> <span class="ln"><span class="box">get chosen.</span></span>',
                     "Practical guides on SEO, websites, branding and marketing, written for business owners, not marketers.",
                     btn("Free website audit", f"{home}#contact", "btn-white") + btn("WhatsApp", WA, "btn-white", target=True),
                     img("pexels-4467737", "Writing marketing notes next to a laptop", "(min-width: 1001px) 55vw, 100vw", p, eager=True))
    cards = "\n".join(post_card(x, p) for x in posts) or '<p class="sec-lead">The first posts are on the way.</p>'
    body = f'''{header(p, home)}

<main id="main">

{hero}

<section aria-labelledby="postsTitle" class="sec work">
<div class="wrap">
{heading("All posts", 'Guides and <span class="hl">insights.</span>', center=True, title_id="postsTitle")}
<div class="work-grid posts">
{cards}
</div>
</div>
</section>

{cta_band(home)}

</main>

{footer(p, home)}
'''
    return head(title, desc, path, p, [schema], preload="pexels-4467737") + body + scripts(p)


def post_page(post, posts):
    p, home = "../", "../index.html"
    path = f"blog/{post['slug']}.html"
    plain = strip_tags(post["title"])
    title = f"{post.get('seo_title', plain)} | Astra Nexora"
    f = HOME["founder"]
    schema = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "headline": plain, "description": post["description"], "url": SITE + path,
         "datePublished": post["date"], "dateModified": post.get("updated", post["date"]),
         "image": SITE + f"assets/stock/{post['image']}-w1200.webp", "articleSection": post["category"],
         "author": {"@type": "Person", "name": f["name"], "jobTitle": f["role"], "sameAs": [f["linkedin"]]},
         "publisher": {"@type": "Organization", "name": "Astra Nexora", "logo": {"@type": "ImageObject", "url": SITE + "assets/brand/logo-square.png"}},
         "mainEntityOfPage": SITE + path},
        breadcrumb_schema([("Home", ""), ("Blog", "blog/"), (plain, path)]),
    ]}
    hero = page_hero(home, [("Home", home), ("Blog", "index.html"), (post["category"], None)],
                     f"{esc(post['category'])} · {post['minutes']} min read", split_title(post["title"]), esc(post["description"]),
                     btn("Free website audit", f"{home}#contact", "btn-white") + btn("Ask on WhatsApp", WA, "btn-white", target=True),
                     img(post["image"], post["image_alt"], "(min-width: 1001px) 55vw, 100vw", p, eager=True))
    toc = "".join(f'<li><a href="#{hid}">{esc(h)}</a></li>' for hid, h in post["toc"])
    svc = "".join(f'<li><a href="../services/{s}.html">{icon(s)}<span>{esc(SERVICE_BY_SLUG[s]["nav"])}</span></a></li>' for s in post["services"] if s in SERVICE_BY_SLUG)
    url = SITE + path
    share = (f'<a href="https://wa.me/?text={html.escape(plain + " " + url, quote=True).replace(" ", "%20")}" rel="noopener" target="_blank">WhatsApp</a>'
             f'<a href="https://www.linkedin.com/sharing/share-offsite/?url={url}" rel="noopener" target="_blank">LinkedIn</a>'
             f'<a href="https://www.facebook.com/sharer/sharer.php?u={url}" rel="noopener" target="_blank">Facebook</a>')
    others = [x for x in posts if x["slug"] != post["slug"] and x["image"] != post["image"]][:3]
    more = ""
    if others:
        more = f'''<section aria-labelledby="moreTitle" class="sec work">
<div class="wrap">
{heading("Keep reading", 'More from <span class="hl">the blog.</span>', center=True, title_id="moreTitle")}
<div class="work-grid">
{"".join(post_card(x, p) for x in others)}
</div>
</div>
</section>'''
    body = f'''{header(p, home)}

<main id="main">

{hero}

<section class="sec post">
<div class="wrap post-grid">
<article class="prose" data-reveal="">
<p class="post-meta"><span>{post["date_label"]}</span><span>{post["minutes"]} min read</span><span>By {esc(f["name"])}</span></p>
{post["html"]}
<div class="post-share"><b>Share this post</b>{share}</div>
<div class="author-box">
<img alt="{esc(f["name"])}" decoding="async" height="900" loading="lazy" src="../assets/founder/sakthi-chair-w480.webp" width="720"/>
<div><small>Written by</small><h3>{esc(f["name"])}</h3><p>{esc(f["role"])}, Astra Nexora. Works on SEO, websites, branding and content for businesses across India.</p>
<a href="{f["linkedin"]}" rel="noopener" target="_blank">LinkedIn {ARROW}</a></div>
</div>
</article>
<aside class="post-side">
{f'<div class="side-card"><h3>In this post<i>.</i></h3><ol class="toc">{toc}</ol></div>' if toc else ""}
<div class="side-card dark"><h3>Free website audit<i>.</i></h3><p>Send your website and we'll show you what to fix first. No obligation.</p>{btn("Get my audit", f"{home}#contact", "btn-white btn-sm")}</div>
{f'<div class="side-card"><h3>Related services<i>.</i></h3><ul class="side-svc">{svc}</ul></div>' if svc else ""}
</aside>
</div>
</section>

{more}

{cta_band(home)}

</main>

{footer(p, home)}
'''
    return head(title, post["description"], path, p, [schema], preload=post["image"]) + body + scripts(p)



def main():
    posts = load_posts()
    with open(os.path.join(ROOT, "index.html"), "w") as f:
        f.write(home_page(posts))
    os.makedirs(os.path.join(ROOT, "blog"), exist_ok=True)
    with open(os.path.join(ROOT, "blog", "index.html"), "w") as f:
        f.write(blog_index_page(posts))
    for post in posts:
        with open(os.path.join(ROOT, "blog", f"{post['slug']}.html"), "w") as f:
            f.write(post_page(post, posts))
    os.makedirs(os.path.join(ROOT, "services"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "projects"), exist_ok=True)
    for i, s in enumerate(SERVICES, 1):
        with open(os.path.join(ROOT, "services", f"{s['slug']}.html"), "w") as f:
            f.write(service_page(s, i))
    for i, pr in enumerate(PROJECTS, 1):
        with open(os.path.join(ROOT, "projects", f"{pr['slug']}.html"), "w") as f:
            f.write(project_page(pr, i))
    with open(os.path.join(ROOT, "404.html"), "w") as f:
        f.write(not_found_page())
    with open(os.path.join(ROOT, "_headers"), "w") as f:
        f.write("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n"
                "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n"
                "/css/*\n  Cache-Control: public, max-age=86400\n/js/*\n  Cache-Control: public, max-age=86400\n")
    with open(os.path.join(ROOT, "llms.txt"), "w") as f:
        f.write(llms_txt(posts))
    urls = [""] + ["blog/"] + [f"blog/{x['slug']}.html" for x in posts] + [f"services/{s['slug']}.html" for s in SERVICES] + [f"projects/{pr['slug']}.html" for pr in PROJECTS] + ["projects/seo-report.html"]
    with open(os.path.join(ROOT, "sitemap.xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        f.write("".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls))
        f.write("</urlset>\n")
    with open(os.path.join(ROOT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n")
    print(f"Built index.html, {len(SERVICES)} service pages, {len(PROJECTS)} project pages, {len(posts)} blog posts, sitemap.xml and robots.txt")


if __name__ == "__main__":
    main()
