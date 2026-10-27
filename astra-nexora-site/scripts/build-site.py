"""Builds every Astra Nexora page from scripts/content.py.

    python3 scripts/build-site.py

Writes index.html, services/<slug>.html and projects/<slug>.html.
projects/seo-report.html (the dashboard demo) is hand-written and left alone.
Image sizes and blur-up placeholders come from scripts/image-dims.json,
which `npm run images` keeps up to date.
"""

import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from content import HOME, PROJECTS, SERVICES  # noqa: E402

SITE = "https://astranexora.com/"
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

with open(os.path.join(ROOT, "scripts", "image-dims.json")) as f:
    DIMS = json.load(f)

WA_ICON = ('<svg aria-hidden="true" viewbox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z" fill="currentColor"></path></svg>')
CHAT_ICON = ('<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z"></path></svg>')

ICONS = {
    "compass": '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    "spark": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8"/>',
    "gem": '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M12 21 8 9l4-6 4 6z"/>',
    "handshake": '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5 5 0 0 1 6 .8L21 7"/><path d="M3 7l3.6-1.6a5 5 0 0 1 5.4 1.1"/><path d="M3 15l3 3 3-3"/>',
    "bolt": '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
}


def esc(text):
    return html.escape(text, quote=False)


def attr(text):
    return html.escape(text, quote=True)


def strip_tags(text):
    return re.sub(r"<[^>]+>", "", text)


def img(base, alt, sizes, prefix, eager=False, extra_cls=""):
    """Responsive WebP with a blur-up placeholder (applied to its wrapper by main.js)."""
    w, h, lqip = DIMS[base]
    srcset = ", ".join([
        f"{prefix}assets/stock/{base}-w480.webp 480w",
        f"{prefix}assets/stock/{base}-w800.webp 800w",
        f"{prefix}assets/stock/{base}-w1200.webp 1200w",
        f"{prefix}assets/stock/{base}-w2000.webp {w}w",
    ])
    if eager:
        load = 'fetchpriority="high"'
        cls = extra_cls
    else:
        load = 'loading="lazy"'
        cls = ("lqip " + extra_cls).strip()
    c = f' class="{cls}"' if cls else ""
    lq = "" if eager else f' data-lqip="{lqip}"'
    return (f'<img alt="{attr(alt)}"{c}{lq} decoding="async" height="{h}" {load} sizes="{sizes}" '
            f'src="{prefix}assets/stock/{base}-w1200.webp" srcset="{srcset}" width="{w}"/>')


def btn(label, href, kind="btn-primary", extra="", target=False):
    t = ' rel="noopener" target="_blank"' if target else ""
    return (f'<a class="btn {kind} magnetic{(" " + extra) if extra else ""}" href="{href}"{t}>'
            f'<span>{label}</span><span aria-hidden="true" class="btn-icon"><span>↗</span><span>↗</span></span></a>')


def eyebrow(text, light=False):
    return f'<span class="eyebrow{" light" if light else ""}">{text}</span>'


# =================================================================== shared

def head(title, description, path, prefix, schemas, preload=None, body_class="site"):
    pre = ""
    if preload:
        w = DIMS[preload][0]
        pre = (f'<link as="image" fetchpriority="high" href="{prefix}assets/stock/{preload}-w1200.webp" imagesizes="(min-width: 1001px) 50vw, 100vw" '
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
<meta content="#03061C" name="theme-color"/>
<link href="{SITE}{path}" rel="canonical"/>
<meta content="website" property="og:type"/>
<meta content="Astra Nexora" property="og:site_name"/>
<meta content="{attr(title)}" property="og:title"/>
<meta content="{attr(description)}" property="og:description"/>
<meta content="{SITE}{path}" property="og:url"/>
<meta content="{SITE}assets/og-image.jpg" property="og:image"/>
<meta content="1200" property="og:image:width"/>
<meta content="630" property="og:image:height"/>
<meta content="en_IN" property="og:locale"/>
<meta content="summary_large_image" name="twitter:card"/>
<link href="{prefix}assets/favicon.png" rel="icon" type="image/png"/>
<link href="{prefix}assets/favicon.png" rel="apple-touch-icon"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Sora:wght@500;600;700&amp;display=swap" rel="stylesheet"/>
{pre}<link href="{prefix}css/style.css" rel="stylesheet"/>
<script>(function(d){{d.classList.add("js");if("scrollRestoration"in history)history.scrollRestoration="manual";try{{if(location.hash||sessionStorage.getItem("an-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("no-preload")}}catch(e){{}}}})(document.documentElement);</script>
{ld}</head>
<body class="{body_class}">
<a class="skip-link" href="#main">Skip to content</a>
<div aria-hidden="true" class="page-curtain"></div>
'''


def header(prefix, home):
    menu = "\n".join(
        f'<a href="{prefix}services/{s["slug"]}.html"><b>{i:02d}</b><strong>{esc(s["nav"])}</strong>'
        f'<small>{esc(SERVICE_TAGLINES[s["slug"]])}</small></a>'
        for i, s in enumerate(SERVICES, 1))
    mobile = "\n".join(f'<a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a>' for s in SERVICES)
    return f'''<header class="site-header" id="header">
<div class="header-inner">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">
<img alt="Astra Nexora" class="logo-light" height="34" src="{prefix}assets/logo-horizontal-white.png"/>
</a>
<nav aria-label="Main" class="desktop-nav">
<a href="{home}#about">About</a>
<div class="nav-dropdown">
<a aria-haspopup="true" class="nav-dropdown-toggle" href="{home}#services">Services <i aria-hidden="true">▾</i></a>
<div class="nav-dropdown-panel">
<div class="nav-dropdown-grid">
{menu}
</div>
<div class="nav-dropdown-foot"><span>Not sure where to start?</span><a href="{home}#contact">Get a free website audit ↗</a></div>
</div>
</div>
<a href="{home}#work">Work</a>
<a href="{home}#founder">Founder</a>
<a href="{home}#faq">FAQ</a>
<a href="{home}#contact">Contact</a>
</nav>
<div class="header-actions">
<a aria-label="Chat on WhatsApp: +91 88384 17707" class="header-call" href="{WA}" rel="noopener" target="_blank">{CHAT_ICON}<span>+91 88384 17707</span></a>
{btn("Free audit", f"{home}#contact", "btn-primary", "header-cta")}
</div>
<button aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu" class="menu-toggle" id="menuToggle" type="button"><span></span><span></span><span></span></button>
<div aria-hidden="true" class="scroll-progress"><span></span></div>
</div>
<nav aria-label="Mobile" class="mobile-menu" id="mobileMenu">
<a href="{home}#about">About</a>
<details class="mobile-services"><summary>Services</summary>
{mobile}
</details>
<a href="{home}#work">Work</a>
<a href="{home}#founder">Founder</a>
<a href="{home}#faq">FAQ</a>
<a href="{home}#contact">Contact</a>
<div class="mobile-contact">
<a href="{WA}" rel="noopener" target="_blank">WhatsApp +91 88384 17707</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
{btn("Get a free website audit", f"{home}#contact")}
</div>
</nav>
</header>'''


def footer(prefix, home):
    services = "\n".join(f'<a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a>' for s in SERVICES)
    social = "\n".join(f'<li><a href="{u}" rel="noopener" target="_blank">{n}</a></li>' for n, u in SOCIAL)
    return f'''<footer class="footer">
<div class="container">
<div class="footer-main">
<div class="footer-brand">
<a aria-label="Astra Nexora — home" href="{home}#home"><img alt="Astra Nexora" height="34" loading="lazy" src="{prefix}assets/logo-horizontal-white.png"/></a>
<p>A digital marketing agency in Chennai helping businesses build powerful digital identities through creativity, strategy and measurable growth.</p>
<ul aria-label="Social media" class="footer-social">
{social}
</ul>
</div>
<div class="footer-links">
<h2>Services</h2>
{services}
</div>
<div class="footer-links">
<h2>Explore</h2>
<a href="{home}#about">About</a>
<a href="{home}#work">Work</a>
<a href="{prefix}projects/seo-report.html">Sample SEO report</a>
<a href="{home}#founder">Founder</a>
<a href="{home}#faq">FAQ</a>
</div>
<div class="footer-links">
<h2>Contact</h2>
<a href="{WA}" rel="noopener" target="_blank">WhatsApp +91 88384 17707</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
<p>Chennai · Serving all of India</p>
</div>
</div>
<div aria-hidden="true" class="footer-wordmark">ASTRA NEXORA</div>
<div class="footer-bottom">
<span>© 2026 Astra Nexora. All rights reserved.</span>
<span>Creative. Strategic. Growth Driven.</span>
</div>
</div>
</footer>

<a aria-label="Chat with Astra Nexora on WhatsApp" class="float-whatsapp" href="{WA}" rel="noopener" target="_blank">{WA_ICON}<span>Chat with us</span></a>
<button aria-label="Back to top" class="to-top" type="button"><svg aria-hidden="true" viewbox="0 0 44 44"><circle class="to-top-track" cx="22" cy="22" r="20"></circle><circle class="to-top-ring" cx="22" cy="22" r="20"></circle></svg><span aria-hidden="true">↑</span></button>'''


def scripts(prefix):
    return f'''
<script defer src="{prefix}js/vendor/gsap.min.js"></script>
<script defer src="{prefix}js/vendor/ScrollTrigger.min.js"></script>
<script defer src="{prefix}js/vendor/lenis.min.js"></script>
<script defer src="{prefix}js/main.js"></script>
</body>
</html>
'''


def cta_contact(prefix, home, with_form=True):
    """Closing section: big headline, contact lines and (on home) the audit form."""
    social = "".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a> · ' for n, u in SOCIAL).rstrip(" · ")
    if with_form:
        opts = ["Free website audit"] + [s["title"] for s in SERVICES] + ["Something else"]
        options = "\n".join(f'<option value="{attr(o)}">{esc(o)}</option>' for o in opts)
        form = f'''<div class="form-card" data-reveal="">
<form class="audit-form" id="auditForm" novalidate="">
<div class="form-field">
<label for="name">Your name</label>
<input aria-describedby="nameError" autocomplete="name" id="name" name="name" required="" type="text"/>
<span aria-live="polite" class="form-error" id="nameError"></span>
</div>
<div class="form-field">
<label for="phone">Phone / WhatsApp</label>
<input aria-describedby="phoneError" autocomplete="tel" id="phone" inputmode="tel" name="phone" required="" type="tel"/>
<span aria-live="polite" class="form-error" id="phoneError"></span>
</div>
<div class="form-field">
<label for="email">Email <small>(optional)</small></label>
<input autocomplete="email" id="email" inputmode="email" name="email" type="email"/>
</div>
<div class="form-field">
<label for="website">Website <small>(optional)</small></label>
<input autocomplete="url" id="website" inputmode="url" name="website" placeholder="yourbusiness.com" type="text"/>
</div>
<div class="form-field full">
<label for="service">What do you need?</label>
<select id="service" name="service">
{options}
</select>
</div>
<div class="form-field full">
<label for="message">Tell us about your project <small>(optional)</small></label>
<textarea id="message" name="message" rows="4"></textarea>
</div>
<div class="form-actions">
<button class="btn btn-primary magnetic" type="submit"><span>Send on WhatsApp</span><span aria-hidden="true" class="btn-icon"><span>↗</span><span>↗</span></span></button>
<p class="form-note">Opens WhatsApp with your details filled in. Nothing is stored on this site.</p>
</div>
</form>
</div>'''
    else:
        form = f'''<div class="form-card" data-reveal="">
<p class="lead">Tell us about your business on WhatsApp or email. We'll reply with a clear next step, usually within 24 hours.</p>
<div class="hero-actions" style="margin-top:24px">
{btn("Chat on WhatsApp", WA, "btn-primary", target=True)}
{btn("Fill in the audit form", f"{home}#contact", "btn-ghost")}
</div>
</div>'''
    return f'''<section aria-labelledby="contactTitle" class="section dark" id="contact">
<div aria-hidden="true" class="glow" style="right:-20vw;top:-10vw"></div>
<div class="container contact-grid">
<div class="contact-info">
{eyebrow("Let's build your next era", True)}
<h2 class="contact-title" data-split="" id="contactTitle">Ready to build something <em>remarkable?</em></h2>
<span class="contact-status"><i aria-hidden="true" class="live-dot"></i>Currently accepting projects · replies within 24 hours</span>
<div class="contact-lines">
<div><span>WhatsApp</span><a href="{WA}" rel="noopener" target="_blank">+91 88384 17707</a></div>
<div><span>Email</span><a href="mailto:{EMAIL}">{EMAIL}</a></div>
<div><span>Studio</span><p>Chennai, Tamil Nadu · Serving all of India</p></div>
<div><span>Follow</span><p>{social}</p></div>
</div>
</div>
{form}
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


def faq_html(faqs):
    return "\n".join(
        f'''<details class="faq-item"{' open=""' if i == 0 else ''}>
<summary><span>{esc(q)}</span><i aria-hidden="true"></i></summary>
<p>{esc(a)}</p>
</details>''' for i, (q, a) in enumerate(faqs))


def faq_schema(faqs):
    return {
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs],
    }


# =================================================================== home

def home_page():
    p, home = "", ""
    s_count = len(SERVICES)

    org = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": SITE + "#organization",
                "name": "Astra Nexora",
                "slogan": "Creative. Strategic. Growth Driven.",
                "url": SITE,
                "logo": SITE + "assets/logo-horizontal.png",
                "email": EMAIL,
                "telephone": "+91-88384-17707",
                "foundingDate": "2025",
                "foundingLocation": "Chennai, India",
                "founder": {"@type": "Person", "name": HOME["founder"]["name"], "jobTitle": HOME["founder"]["role"],
                            "sameAs": [HOME["founder"]["linkedin"]]},
                "sameAs": [u for _, u in SOCIAL],
            },
            {
                "@type": "ProfessionalService",
                "@id": SITE + "#service",
                "name": "Astra Nexora",
                "description": "Digital marketing agency in Chennai: " + ", ".join(s["title"] for s in SERVICES) + ".",
                "url": SITE,
                "image": SITE + "assets/og-image.jpg",
                "email": EMAIL,
                "telephone": "+91-88384-17707",
                "parentOrganization": {"@id": SITE + "#organization"},
                "address": {"@type": "PostalAddress", "addressLocality": "Chennai", "addressRegion": "Tamil Nadu", "addressCountry": "IN"},
                "areaServed": {"@type": "Country", "name": "India"},
                "makesOffer": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": s["title"], "url": SITE + f"services/{s['slug']}.html"}} for s in SERVICES],
                "sameAs": [u for _, u in SOCIAL],
            },
        ],
    }
    faq = {"@context": "https://schema.org", **faq_schema(HOME["faqs"])}

    title = "Digital Marketing & SEO Agency in Chennai | Astra Nexora"
    desc = ("Astra Nexora is a digital marketing agency in Chennai for SEO, social media, Google and Meta ads, "
            "content, websites, branding, lead generation and AI marketing automation.")

    hero_lines = "\n".join(f'<span class="line"><span>{l}</span></span>' for l in HOME["hero_h1"])
    stats = "\n".join(f"<li><strong>{esc(a)}</strong><span>{esc(b)}</span></li>" for a, b in HOME["stats"])

    marquee_items = "".join(f'{esc(s["nav"])} <i>✦</i> ' for s in SERVICES)

    stack = ""
    for i, s in enumerate(SERVICES, 1):
        chips = "".join(f"<li>{esc(n)}</li>" for n, _ in s["includes"])
        stack += f'''<article class="stack-card spotlight" data-cursor="view">
<div class="stack-card-body">
<div class="stack-top"><span class="stack-num">{i:02d}</span><span class="stack-count">{i:02d} / {s_count:02d}</span></div>
<h3>{esc(s["title"])}</h3>
<p>{esc(s["lead"])}</p>
<ul aria-label="Includes" class="chips">{chips}</ul>
{btn("Explore service", f"services/{s['slug']}.html", "btn-white")}
</div>
<div class="stack-media img-wrap">{img(s["hero"], s["hero_alt"], "(min-width: 1001px) 45vw, 92vw", p)}</div>
</article>
'''

    process = "\n".join(
        f'''<li class="process-item" data-reveal="">
<span class="process-num">{i:02d}</span>
<h3>{esc(t)}</h3>
<div><p>{esc(d)}</p><span class="process-tag">{esc(tag)}</span></div>
</li>''' for i, (t, d, tag) in enumerate(HOME["process"], 1))

    work = f'''<article class="work-card feature" data-cursor="view">
<div class="work-card-media img-wrap">
<img alt="Astra Nexora SEO report dashboard showing organic clicks, enquiries and rankings" class="lqip" decoding="async" height="1125" loading="lazy" sizes="(min-width: 1001px) 640px, 82vw" src="assets/projects/seo-report-dashboard-w1200.webp" srcset="assets/projects/seo-report-dashboard-w800.webp 800w, assets/projects/seo-report-dashboard-w1200.webp 1200w, assets/projects/seo-report-dashboard-w1800.webp 1800w" width="1800"/>
<span class="work-badge live"><i aria-hidden="true" class="live-dot"></i>LIVE DEMO</span>
</div>
<div class="work-card-body">
<small>Analytics &amp; Reporting</small>
<h3>SEO Report Dashboard</h3>
<p>The monthly dashboard every SEO client gets: clicks, enquiries, rankings, Business Profile and site health. Shown with sample data.</p>
<a class="link-arrow work-card-link" href="projects/seo-report.html">Open the dashboard <span aria-hidden="true">→</span></a>
</div>
</article>
'''
    for pr in PROJECTS:
        work += f'''<article class="work-card" data-cursor="view">
<div class="work-card-media img-wrap">{img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 460px, 82vw", p)}<span class="work-badge">CONCEPT</span></div>
<div class="work-card-body">
<small>{esc(pr["category"])}</small>
<h3>{esc(pr["title"])}</h3>
<p>{esc(pr["summary"])}</p>
<a class="link-arrow work-card-link" href="projects/{pr["slug"]}.html">View project <span aria-hidden="true">→</span></a>
</div>
</article>
'''

    bento = ""
    for i, (icon, t, d) in enumerate(HOME["principles"]):
        accent = " accent" if i == 0 else ""
        bento += f'''<article class="bento-card spotlight{accent}" data-reveal="">
<span class="bento-icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 24 24">{ICONS[icon]}</svg></span>
<h3>{esc(t)}</h3>
<p>{esc(d)}</p>
</article>
'''

    f = HOME["founder"]
    timeline = "\n".join(f"<li><strong>{y}</strong><span>{esc(t)}</span></li>" for y, t in f["timeline"])
    bio = "\n".join(f"<p>{esc(b)}</p>" for b in f["bio"])

    body = f'''<div aria-hidden="true" class="preloader" id="preloader">
<div class="preloader-inner">
<span class="preloader-star">✦</span>
<div class="preloader-word">{"".join(f'<span style="animation-delay:{i * 0.04:.2f}s">{c if c != " " else "&nbsp;"}</span>' for i, c in enumerate("ASTRA NEXORA"))}</div>
<div class="preloader-bar"><span></span></div>
</div>
</div>

{header(p, home)}

<main id="main">

<section aria-labelledby="heroTitle" class="hero" id="home">
<div class="hero-media" data-hero-media="">
<img alt="Team reviewing marketing analytics on a laptop during a meeting" decoding="async" fetchpriority="high" height="1080" sizes="100vw" src="assets/stock/pexels-7147921-poster-w1200.webp" srcset="assets/stock/pexels-7147921-poster-w480.webp 480w, assets/stock/pexels-7147921-poster-w800.webp 800w, assets/stock/pexels-7147921-poster-w1200.webp 1200w, assets/stock/pexels-7147921-poster-w2000.webp 1920w" width="1920"/>
<!-- Desktop-only background video (Pexels 7147921, see assets/video/CREDITS.md). The poster above is its first frame. -->
<video aria-hidden="true" class="hero-video" data-src="assets/video/hero.mp4" loop="" muted="" playsinline="" preload="none"></video>
</div>
<div aria-hidden="true" class="hero-shade"></div>
<button aria-pressed="false" class="hero-video-toggle" hidden="" type="button"><span aria-hidden="true" class="hero-video-toggle-icon"></span><span class="hero-video-toggle-label">Pause video</span></button>
<div class="hero-content" data-hero-content="">
{eyebrow("Digital marketing agency · Chennai", True)}
<h1 class="hero-title" id="heroTitle">
{hero_lines}
</h1>
<div class="hero-bottom">
<div>
<p class="hero-lead">{esc(HOME["hero_lead"])}</p>
<div class="hero-actions" style="margin-top:26px">
{btn("Get a free website audit", "#contact")}
{btn("Explore services", "#services", "btn-ghost")}
</div>
<ul aria-label="Astra Nexora at a glance" class="hero-stats" style="margin-top:34px">
{stats}
</ul>
</div>
<div style="display:grid;gap:22px;justify-items:end">
<aside aria-label="Free website audit" class="hero-card">
<span class="hero-card-status"><i aria-hidden="true" class="live-dot"></i>Accepting projects</span>
<strong>Free website audit</strong>
<p>Send us your website and get a clear list of what to fix first.</p>
<a class="link-arrow" href="#contact">Get my audit <span aria-hidden="true">→</span></a>
</aside>
<span aria-hidden="true" class="scroll-cue"><i></i>Scroll</span>
</div>
</div>
</div>
</section>

<div aria-hidden="true" class="marquee">
<div class="marquee-row" data-marquee="1"><span>{marquee_items}</span><span>{marquee_items}</span></div>
<div class="marquee-row outline" data-marquee="-1"><span>{marquee_items}</span><span>{marquee_items}</span></div>
</div>

<section aria-labelledby="aboutTitle" class="section sheet" id="about">
<div class="container">
{eyebrow("About Astra Nexora")}
<h2 class="visually-hidden" id="aboutTitle">About Astra Nexora</h2>
<p class="statement-text" data-statement="" style="margin-top:30px">{esc(HOME["statement"])}</p>
<div class="statement-grid">
<div class="statement-media">
<div class="frame frame-tall img-wrap" data-parallax="-0.06">{img("pexels-39205089", "Team planning a marketing strategy around a table", "(min-width: 1001px) 22vw, 46vw", p)}</div>
<div class="frame frame-tall img-wrap" data-parallax="0.06">{img("pexels-6476246", "Team reviewing a campaign chart on a tablet", "(min-width: 1001px) 22vw, 46vw", p)}</div>
<div class="badge-float"><strong>2025</strong><span>Founded<br/>in Chennai</span></div>
</div>
<div class="statement-copy" data-reveal="">
{"".join(f"<p>{esc(t)}</p>" for t in HOME["about"])}
<p>Founded in 2025, we work with businesses across India from our base in Chennai.</p>
<a class="link-arrow" href="#process">See how we work <span aria-hidden="true">→</span></a>
</div>
</div>
</div>
</section>

<section aria-labelledby="servicesTitle" class="section dark" id="services">
<div aria-hidden="true" class="glow" style="left:-25vw;top:0"></div>
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("Our services", True)}
<h2 class="title" data-split="" id="servicesTitle" style="margin-top:22px">Digital growth. <em>Powered by strategy.</em></h2>
</div>
<p class="lead">We combine creativity, data and technology to help businesses strengthen their digital presence, reach the right audience and generate meaningful growth.</p>
</div>
<div class="stack">
{stack}</div>
</div>
</section>

<section aria-labelledby="processTitle" class="section sheet paper" id="process">
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("The process")}
<h2 class="title" data-split="" id="processTitle" style="margin-top:22px">From audit to <em>growth,</em> in four steps.</h2>
</div>
<p class="lead">Every project begins with understanding your business goals and ends with results you can measure.</p>
</div>
<ol class="process">
<span aria-hidden="true" class="process-fill"><span></span></span>
{process}
</ol>
</div>
</section>

<section aria-labelledby="workTitle" class="section dark work" id="work">
<div class="container work-intro">
{eyebrow("Our work", True)}
<h2 class="title" data-split="" id="workTitle">Projects built to <em>deliver.</em></h2>
<p class="lead" style="max-width:620px">A live reporting demo and concept projects that show how we approach websites, brands and search. Client case studies will be added as clients approve them.</p>
<span class="work-hint">Scroll to explore →</span>
</div>
<div class="work-track-wrap">
<div class="work-track">
{work}</div>
</div>
</section>

<section aria-labelledby="founderTitle" class="section sheet" id="founder">
<div class="container founder-grid">
<div class="founder-photo img-wrap" data-reveal="">
<img alt="S. Saktheeswaran, Founder and Managing Director of Astra Nexora" class="lqip" data-parallax-img="" decoding="async" height="1600" loading="lazy" sizes="(min-width: 1001px) 40vw, 92vw" src="assets/founder/sakthi-w1000.webp" srcset="assets/founder/sakthi-w600.webp 600w, assets/founder/sakthi-w1000.webp 999w" width="999"/>
<div class="badge-float"><strong>2019</strong><span>Started in<br/>digital marketing</span></div>
</div>
<div class="founder-copy">
{eyebrow("Meet the founder")}
<h2 class="title" data-split="" id="founderTitle">The vision behind <em>Astra Nexora.</em></h2>
<p class="founder-role">{esc(f["name"])}<small>{esc(f["role"])}</small></p>
{bio}
<ol class="timeline">
{timeline}
</ol>
<div>{btn("Connect on LinkedIn", f["linkedin"], "btn-outline-dark", target=True)}</div>
</div>
</div>
</section>

<section aria-labelledby="whyTitle" class="section dark">
<div aria-hidden="true" class="glow" style="right:-25vw;bottom:-10vw"></div>
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("Why Astra Nexora", True)}
<h2 class="title" data-split="" id="whyTitle" style="margin-top:22px">What sets <em>us apart.</em></h2>
</div>
<p class="lead">Six principles behind every project we take on.</p>
</div>
<div class="bento">
{bento}</div>
</div>
</section>

<section aria-labelledby="filmTitle" class="film">
<div class="film-media" data-parallax="0.12">{img("pexels-3126361-poster", "", "100vw", p)}</div>
<div class="film-content">
{eyebrow("The brand", True)}
<h2 class="film-title" id="filmTitle">Creative. Strategic.<br/><em>Growth driven.</em></h2>
<button aria-label="Watch the Astra Nexora brand film" class="play-ring" data-cursor="view" data-video-open="" type="button">
<svg aria-hidden="true" viewbox="0 0 150 150"><defs><path d="M75,75 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" id="ring"></path></defs><text><textPath href="#ring">PLAY BRAND FILM ✦ PLAY BRAND FILM ✦ </textPath></text></svg>
<span aria-hidden="true">▶</span>
</button>
</div>
</section>

<!-- Brand film player. TODO: add the astronaut film at assets/brand-video.mp4 -->
<dialog aria-label="Astra Nexora brand film" class="video-modal" id="videoModal">
<button aria-label="Close video" class="video-modal-close" type="button">×</button>
<video controls="" data-src="assets/brand-video.mp4" playsinline="" preload="none"></video>
<p class="video-modal-message">The brand film is coming soon.</p>
</dialog>

<!-- TODO: replace each placeholder slide with a real, approved quote (name, business, city). -->
<section aria-labelledby="feedbackTitle" class="section sheet testimonials-section" id="feedback" style="margin-top:8px">
<div class="container t-grid">
<div>
{eyebrow("Client voices")}
<h2 class="title" data-split="" id="feedbackTitle" style="margin-top:22px">Real clients. <em>Real words.</em></h2>
<p class="lead" style="margin-top:20px">We only publish feedback our clients have read and approved.</p>
<div class="testimonial-nav">
<button aria-label="Previous feedback" data-testimonial-prev="" type="button">←</button>
<button aria-label="Next feedback" data-testimonial-next="" type="button">→</button>
</div>
</div>
<div>
<div aria-live="polite" class="testimonial-card">
<div aria-hidden="true" class="testimonial-quote-mark">“</div>
<ul class="testimonial-slides">
{"".join(f'<li class="testimonial-slide"{"" if i == 1 else " hidden"}><blockquote class="testimonial-text">TODO: Client quote {i} — waiting for an approved quote.</blockquote><div class="testimonial-person"><div aria-hidden="true" class="testimonial-avatar">C{i}</div><div class="testimonial-details"><strong>Client name</strong><span>Business · City</span></div></div></li>' for i in (1, 2, 3))}
</ul>
<div aria-hidden="true" class="testimonial-count">01</div>
</div>
<div aria-hidden="true" class="testimonial-progress"><span></span></div>
</div>
</div>
</section>

<section aria-labelledby="faqTitle" class="section sheet paper" id="faq">
<div class="container faq-grid">
<div>
{eyebrow("FAQ")}
<h2 class="title" data-split="" id="faqTitle" style="margin-top:22px">Questions, <em>answered.</em></h2>
<p class="lead" style="margin-top:20px">Everything you need to know before we start building together.</p>
</div>
<div>
{faq_html(HOME["faqs"])}
</div>
</div>
</section>

{cta_contact(p, home)}

</main>

{footer(p, home)}
'''
    return head(title, desc, "", p, [org, faq], body_class="site home") + body + scripts(p)


# =================================================================== service page

def service_page(s, index):
    p, home = "../", "../index.html"
    num = f"{index:02d}"
    path = f"services/{s['slug']}.html"
    title = f"{s['title']} in Chennai | Astra Nexora"
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

    facts = "\n".join(f"<li><span>{esc(k)}</span><strong>{esc(v)}</strong></li>" for k, v in s["facts"])
    ideal = "".join(f"<li>{esc(t)}</li>" for t in s["ideal"])
    includes = "\n".join(
        f'''<article class="include-card spotlight" data-reveal="">
<span class="include-num">{i:02d}</span>
<h3>{esc(n)}</h3>
<p>{esc(d)}</p>
</article>''' for i, (n, d) in enumerate(s["includes"], 1))
    process = "\n".join(
        f'''<li class="process-item" data-reveal="">
<span class="process-num">{i:02d}</span>
<h3>{esc(t)}</h3>
<div><p>{esc(d)}</p></div>
</li>''' for i, (t, d) in enumerate(s["process"], 1))
    deliver = "\n".join(f'<li><span aria-hidden="true">✓</span>{esc(d)}</li>' for d in s["deliverables"])

    related = ""
    for slug in s["related"]:
        r = SERVICE_BY_SLUG[slug]
        related += f'''<a class="related-card" data-cursor="view" data-reveal="" href="{r["slug"]}.html">
<div class="work-card-media img-wrap">{img(r["hero"], r["hero_alt"], "(min-width: 901px) 30vw, 92vw", p)}</div>
<div class="related-body"><div><small>{SERVICES.index(r) + 1:02d}</small><h3>{esc(r["title"])}</h3></div><span aria-hidden="true" class="round-arrow">↗</span></div>
</a>
'''
    prev_s = SERVICES[(index - 2) % len(SERVICES)]
    next_s = SERVICES[index % len(SERVICES)]

    body = f'''{header(p, home)}

<main id="main">

<section class="page-hero" id="home">
<div aria-hidden="true" class="glow" style="right:-20vw;top:-20vw"></div>
<span aria-hidden="true" class="page-number">{num}</span>
<div class="container">
<div class="page-hero-grid">
<div>
<nav aria-label="Breadcrumb" class="breadcrumb"><a href="{home}">Home</a><span aria-hidden="true">/</span><a href="{home}#services">Services</a><span aria-hidden="true">/</span><span aria-current="page">{esc(s["nav"])}</span></nav>
{eyebrow(f"Service {num} · {esc(s['nav'])}", True)}
<h1 data-split="">{s["h1"]}</h1>
<p class="page-hero-lead">{esc(s["lead"])}</p>
<div class="page-hero-actions">
{btn("Get a free consultation", f"{home}#contact")}
{btn("Chat on WhatsApp", WA, "btn-ghost", target=True)}
</div>
</div>
<div class="page-hero-media img-wrap" data-hero-media="">{img(s["hero"], s["hero_alt"], "(min-width: 1001px) 40vw, 92vw", p, eager=True)}</div>
</div>
<ul class="facts">
{facts}
</ul>
</div>
</section>

<section aria-labelledby="overviewTitle" class="section sheet">
<div class="container overview-grid">
<div class="overview-copy">
{eyebrow("Why it matters")}
<h2 class="title" data-split="" id="overviewTitle">Built for <em>real growth.</em></h2>
<p class="big">{esc(s["overview"][0])}</p>
<p>{esc(s["overview"][1])}</p>
<h3 class="visually-hidden">Ideal for</h3>
<ul aria-label="Ideal for" class="tags">{ideal}</ul>
</div>
<div class="frame frame-tall img-wrap" data-reveal="">{img(s["side"], s["side_alt"], "(min-width: 1001px) 42vw, 92vw", p, extra_cls="parallax-img")}</div>
</div>
</section>

<section aria-labelledby="includesTitle" class="section dark">
<div aria-hidden="true" class="glow" style="left:-25vw;top:10%"></div>
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("What's included", True)}
<h2 class="title" data-split="" id="includesTitle" style="margin-top:22px">Everything in <em>{esc(s["nav"])}.</em></h2>
</div>
<p class="lead">Choose the pieces you need, or let us run the whole service for you.</p>
</div>
<div class="include-grid">
{includes}
</div>
</div>
</section>

<section aria-labelledby="processTitle" class="section sheet paper">
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("How we work")}
<h2 class="title" data-split="" id="processTitle" style="margin-top:22px">A clear process, <em>start to finish.</em></h2>
</div>
<p class="lead">You always know what's happening, what's next and what it's achieving.</p>
</div>
<ol class="process">
<span aria-hidden="true" class="process-fill"><span></span></span>
{process}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="section sheet" style="margin-top:8px">
<div class="container deliver-grid">
<div>
{eyebrow("What you get")}
<h2 class="title" data-split="" id="deliverTitle" style="margin-top:22px">Deliverables you can <em>hold us to.</em></h2>
<p class="lead" style="margin:20px 0 30px">Every engagement comes with clear deliverables and regular reporting.</p>
{btn("Start a project", f"{home}#contact")}
</div>
<ul class="deliver-list" data-reveal="">
{deliver}
</ul>
</div>
</section>

<section aria-labelledby="faqTitle" class="section sheet paper" style="margin-top:8px">
<div class="container faq-grid">
<div>
{eyebrow("FAQ")}
<h2 class="title" data-split="" id="faqTitle" style="margin-top:22px">Questions about <em>{esc(s["nav"])}.</em></h2>
<p class="lead" style="margin-top:20px">Something else on your mind? Message us on WhatsApp and we'll answer.</p>
</div>
<div>
{faq_html(s["faqs"])}
</div>
</div>
</section>

<section aria-labelledby="relatedTitle" class="section dark">
<div class="container">
<div class="section-head">
{eyebrow("Works well with", True)}
<h2 class="title" data-split="" id="relatedTitle">Related <em>services.</em></h2>
</div>
<div class="related-grid">
{related}</div>
<nav aria-label="More services" class="pager">
<a href="{prev_s["slug"]}.html"><span>← Previous service</span><strong>{esc(prev_s["nav"])}</strong></a>
<a href="{next_s["slug"]}.html"><span>Next service →</span><strong>{esc(next_s["nav"])}</strong></a>
</nav>
</div>
</section>

{cta_contact(p, home, with_form=False)}

</main>

{footer(p, home)}
'''
    return head(title, desc, path, p, [schema], preload=s["hero"]) + body + scripts(p)


# =================================================================== project page

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
    meta = "\n".join(f"<li><span>{esc(k)}</span><strong>{esc(v)}</strong></li>" for k, v in pr["meta"])
    approach = "\n".join(
        f'''<li class="process-item" data-reveal="">
<span class="process-num">{i:02d}</span>
<h3>{esc(t)}</h3>
<div><p>{esc(d)}</p></div>
</li>''' for i, (t, d) in enumerate(pr["approach"], 1))
    deliver = "\n".join(f'<li><span aria-hidden="true">✓</span>{esc(d)}</li>' for d in pr["deliverables"])
    goals = "\n".join(f'<li class="goal-card" data-reveal=""><span>{i:02d}</span><p>{esc(g)}</p></li>' for i, g in enumerate(pr["goals"], 1))
    nxt = PROJECTS[index % len(PROJECTS)]

    body = f'''{header(p, home)}

<main id="main">

<section class="page-hero" id="home">
<div aria-hidden="true" class="glow" style="right:-20vw;top:-20vw"></div>
<div class="container">
<div class="page-hero-grid">
<div>
<nav aria-label="Breadcrumb" class="breadcrumb"><a href="{home}">Home</a><span aria-hidden="true">/</span><a href="{home}#work">Work</a><span aria-hidden="true">/</span><span aria-current="page">{esc(pr["title"])}</span></nav>
{eyebrow(f"Concept project · {esc(pr['category'])}", True)}
<h1 data-split="">{esc(pr["title"])}</h1>
<p class="page-hero-lead">{esc(pr["summary"])}</p>
</div>
<div class="page-hero-media img-wrap" data-hero-media="">{img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 40vw, 92vw", p, eager=True)}<span class="work-badge">CONCEPT PROJECT</span></div>
</div>
<ul class="facts four">
{meta}
</ul>
<p class="concept-note" style="margin-top:24px"><span aria-hidden="true">✦</span><span><b>This is a concept project.</b> It shows how we would approach this type of brief. It is not a client case study and contains no client results.</span></p>
</div>
</section>

<section aria-labelledby="challengeTitle" class="section sheet">
<div class="container overview-grid">
<div class="overview-copy">
{eyebrow("The brief")}
<h2 class="title" data-split="" id="challengeTitle">The <em>challenge.</em></h2>
<p class="big">{esc(pr["challenge"])}</p>
</div>
<div class="frame frame-tall img-wrap" data-reveal="">{img(pr["second"], pr["second_alt"], "(min-width: 1001px) 42vw, 92vw", p, extra_cls="parallax-img")}</div>
</div>
</section>

<section aria-labelledby="approachTitle" class="section sheet paper" style="margin-top:8px">
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("Our approach")}
<h2 class="title" data-split="" id="approachTitle" style="margin-top:22px">How we'd <em>solve it.</em></h2>
</div>
<p class="lead">Four steps, each with a clear outcome before the next one starts.</p>
</div>
<ol class="process">
<span aria-hidden="true" class="process-fill"><span></span></span>
{approach}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="section sheet" style="margin-top:8px">
<div class="container deliver-grid">
<div>
{eyebrow("Scope")}
<h2 class="title" data-split="" id="deliverTitle" style="margin-top:22px">What we'd <em>deliver.</em></h2>
<p class="lead" style="margin-top:20px">Part of our <a class="link-arrow" href="../services/{svc["slug"]}.html">{esc(svc["title"])} <span aria-hidden="true">→</span></a></p>
</div>
<ul class="deliver-list" data-reveal="">
{deliver}
</ul>
</div>
</section>

<section aria-labelledby="goalsTitle" class="section sheet paper" style="margin-top:8px">
<div class="container">
<div class="section-head split-head">
<div>
{eyebrow("Success measures")}
<h2 class="title" data-split="" id="goalsTitle" style="margin-top:22px">What success <em>looks like.</em></h2>
</div>
<p class="lead">The goals we'd set and report against for a project like this.</p>
</div>
<ul class="goal-grid">
{goals}
</ul>
</div>
</section>

<div style="height:8px"></div>
<a aria-label="Next project: {attr(nxt["title"])}" class="next-project" data-cursor="view" href="{nxt["slug"]}.html">
<div class="bg" data-parallax="0.1">{img(nxt["hero"], "", "100vw", p)}</div>
<div class="next-project-content"><small>Next project</small><strong>{esc(nxt["title"])}</strong><i aria-hidden="true">→</i></div>
</a>

{cta_contact(p, home, with_form=False)}

</main>

{footer(p, home)}
'''
    return head(title, pr["summary"], path, p, [schema], preload=pr["hero"]) + body + scripts(p)


def main():
    with open(os.path.join(ROOT, "index.html"), "w") as f:
        f.write(home_page())
    os.makedirs(os.path.join(ROOT, "services"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "projects"), exist_ok=True)
    for i, s in enumerate(SERVICES, 1):
        with open(os.path.join(ROOT, "services", f"{s['slug']}.html"), "w") as f:
            f.write(service_page(s, i))
    for i, pr in enumerate(PROJECTS, 1):
        with open(os.path.join(ROOT, "projects", f"{pr['slug']}.html"), "w") as f:
            f.write(project_page(pr, i))
    print(f"Built index.html, {len(SERVICES)} service pages and {len(PROJECTS)} project pages")


if __name__ == "__main__":
    main()
