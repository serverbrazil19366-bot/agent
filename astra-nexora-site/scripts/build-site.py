"""Builds every Astra Nexora page from scripts/content.py.

    python3 scripts/build-site.py

Writes index.html, services/<slug>.html and projects/<slug>.html.
projects/seo-report.html (the dashboard demo) is hand-written and left alone.
Image sizes and blur-up placeholders come from scripts/image-dims.json,
which `npm run images` keeps up to date.

Design v12: light grey canvas framed by visible grid lines, pixel-block
accents in brand blue, Urbanist type, black-and-white photography, bold blue
bands, and interactive pieces (work slider, process cards, marquee).
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
PHONE = "+91 88384 17707"
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


def logo():
    """Inline wordmark: star + astra nexora. Swap for the real logo SVG when it arrives."""
    return ('<svg aria-hidden="true" class="logo" viewbox="0 0 200 32">'
            '<path class="logo-star" d="M16 1c1.1 7.7 4.3 11.2 12.5 12.5C20.3 14.8 17.1 18.3 16 26c-1.1-7.7-4.3-11.2-12.5-12.5C11.7 12.2 14.9 8.7 16 1z"/>'
            '<text font-family="Urbanist, Inter, system-ui, sans-serif" font-size="19" font-weight="700" letter-spacing="-.3" x="37" y="20">astra nexora</text></svg>')


def btn(label, href, kind="btn-primary", target=False, arrow=True):
    t = ' rel="noopener" target="_blank"' if target else ""
    return f'<a class="btn {kind}" href="{href}"{t}><span>{label}</span>{ARROW if arrow else ""}</a>'


# =================================================================== shared

STAR = ('<svg aria-hidden="true" class="star" viewbox="0 0 32 32"><path d="M16 1c1.1 7.7 4.3 11.2 12.5 12.5C20.3 14.8 17.1 18.3 16 26'
        'c-1.1-7.7-4.3-11.2-12.5-12.5C11.7 12.2 14.9 8.7 16 1z" fill="currentColor"/></svg>')


def tag(text, dark=True):
    """Small square-marked label used above headings (the 'pixel' tag)."""
    return f'<span class="tag{" dark" if dark else ""}"><i aria-hidden="true"></i>{text}</span>'


def heading(kicker, title, lead=None, center=False, title_id=None, cls=""):
    tid = f' id="{title_id}"' if title_id else ""
    lead_html = f'<p class="lead">{lead}</p>' if lead else ""
    return f'''<div class="head{" center" if center else ""}{(" " + cls) if cls else ""}" data-reveal="">
{tag(kicker, dark=False)}
<h2 class="h2"{tid}>{title}</h2>
{lead_html}
</div>'''


def pixels(cls):
    """Decorative pixel-block cluster."""
    return f'<div aria-hidden="true" class="pixels {cls}"><i></i><i></i><i></i><i></i><i></i><i></i></div>'


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
<meta content="#F3F4F6" name="theme-color"/>
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
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&amp;family=Space+Grotesk:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
{pre}<link href="{prefix}css/style.css" rel="stylesheet"/>
<script>(function(d){{d.classList.add("js");if("scrollRestoration"in history)history.scrollRestoration="manual";}})(document.documentElement);</script>
{ld}</head>
<body class="{body_class}">
<a class="skip-link" href="#main">Skip to content</a>
<div aria-hidden="true" class="page-curtain"></div>
'''


def header(prefix, home):
    menu = "\n".join(
        f'<a href="{prefix}services/{s["slug"]}.html"><span class="mi">{icon(s["slug"])}</span><span><strong>{esc(s["nav"])}</strong>'
        f'<small>{esc(SERVICE_TAGLINES[s["slug"]])}</small></span></a>'
        for s in SERVICES)
    mobile = "\n".join(f'<a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a>' for s in SERVICES)
    return f'''<div class="topbar">
<div class="frame topbar-inner">
<a href="mailto:{EMAIL}">{EMAIL}</a>
<span class="tb-center">{STAR}<span>Now taking projects · <b>Free website audit</b></span>{STAR}</span>
<a href="{WA}" rel="noopener" target="_blank">{PHONE}</a>
</div>
</div>
<header class="site-header" id="header">
<div class="frame header-inner">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo()}</a>
<nav aria-label="Main" class="desktop-nav">
<a class="nav-link" href="{home}#home">Home</a>
<a class="nav-link" href="{home}#about">About</a>
<div class="nav-dropdown">
<a aria-haspopup="true" class="nav-link nav-dropdown-toggle" href="{home}#services">Services</a>
<div class="nav-dropdown-panel">
<div class="nav-dropdown-grid">
{menu}
</div>
</div>
</div>
<a class="nav-link" href="{home}#work">Work</a>
<a class="nav-link" href="{home}#faq">FAQ</a>
<a class="nav-link" href="{home}#contact">Contact</a>
</nav>
{btn("Start a project", f"{home}#contact", "btn-dark header-cta")}
<button aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu" class="menu-toggle" id="menuToggle" type="button"><span></span><span></span></button>
</div>
<nav aria-label="Mobile" class="mobile-menu" id="mobileMenu">
<a href="{home}#about">About</a>
<details class="mobile-services"><summary>Services</summary>
{mobile}
</details>
<a href="{home}#work">Work</a>
<a href="{home}#process">Process</a>
<a href="{home}#faq">FAQ</a>
<a href="{home}#contact">Contact</a>
<div class="mobile-contact">
{btn("Start a project", f"{home}#contact", "btn-dark")}
<a href="{WA}" rel="noopener" target="_blank">WhatsApp {PHONE}</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
</div>
</nav>
</header>'''


def footer(prefix, home):
    services = "\n".join(f'<li><a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a></li>' for s in SERVICES)
    social = "\n".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in SOCIAL)
    return f'''<footer class="footer">
<div class="frame">
<div class="footer-cta">
<h2>Let's build your <span>next era.</span></h2>
{btn("Start a project", f"{home}#contact", "btn-blue btn-lg")}
</div>
<div class="footer-grid">
<div class="footer-brand">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo()}</a>
<p>A digital marketing studio in Chennai for SEO, websites, branding and performance marketing, planned as one system.</p>
</div>
<div class="footer-col">
<h3>Services</h3>
<ul class="footer-two">{services}</ul>
</div>
<div class="footer-col">
<h3>Contact</h3>
<a href="{WA}" rel="noopener" target="_blank">WhatsApp {PHONE}</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
<p>Chennai, Tamil Nadu · Serving all of India</p>
</div>
<div class="footer-col">
<h3>Follow</h3>
{social}
<a href="{prefix}projects/seo-report.html">Sample SEO report</a>
</div>
</div>
<div class="footer-bottom">
<span>© 2026 Astra Nexora. All rights reserved.</span>
<span>Creative. Strategic. Growth driven.</span>
</div>
</div>
</footer>

<a aria-label="Chat with Astra Nexora on WhatsApp" class="float-whatsapp" href="{WA}" rel="noopener" target="_blank">{WA_ICON}</a>
<button aria-label="Back to top" class="to-top" type="button"><svg aria-hidden="true" viewbox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></button>'''


def scripts(prefix):
    return f'''
<script defer src="{prefix}js/vendor/gsap.min.js"></script>
<script defer src="{prefix}js/vendor/ScrollTrigger.min.js"></script>
<script defer src="{prefix}js/vendor/lenis.min.js"></script>
<script defer src="{prefix}js/main.js"></script>
</body>
</html>
'''


def audit_form():
    opts = ["Free website audit"] + [s["title"] for s in SERVICES] + ["Something else"]
    options = "\n".join(f'<option value="{attr(o)}">{esc(o)}</option>' for o in opts)
    return f'''<form class="audit-form" id="auditForm" novalidate="">
<div class="form-field">
<label for="name">Your name</label>
<input aria-describedby="nameError" autocomplete="name" id="name" name="name" placeholder="Full name" required="" type="text"/>
<span aria-live="polite" class="form-error" id="nameError"></span>
</div>
<div class="form-field">
<label for="phone">Mobile number</label>
<input aria-describedby="phoneError" autocomplete="tel" id="phone" inputmode="tel" name="phone" placeholder="+91" required="" type="tel"/>
<span aria-live="polite" class="form-error" id="phoneError"></span>
</div>
<div class="form-field">
<label for="company">Company name</label>
<input aria-describedby="companyError" autocomplete="organization" id="company" name="company" placeholder="Your business" required="" type="text"/>
<span aria-live="polite" class="form-error" id="companyError"></span>
</div>
<div class="form-field">
<label for="website">Website</label>
<input aria-describedby="websiteError" autocomplete="url" id="website" inputmode="url" name="website" placeholder="yourbusiness.com" required="" type="text"/>
<span aria-live="polite" class="form-error" id="websiteError"></span>
</div>
<div class="form-field">
<label for="email">Email <small>(optional)</small></label>
<input autocomplete="email" id="email" inputmode="email" name="email" placeholder="you@company.com" type="email"/>
</div>
<div class="form-field">
<label for="service">Service</label>
<select id="service" name="service">
{options}
</select>
</div>
<div class="form-field full">
<label for="message">Message <small>(optional)</small></label>
<textarea id="message" name="message" placeholder="A line about your goals" rows="2"></textarea>
</div>
<div class="form-actions">
<button class="btn btn-dark btn-block" type="submit"><span>Send on WhatsApp</span>{ARROW}</button>
<p class="form-note">No website yet? Type "none". This opens WhatsApp with your details; nothing is stored here.</p>
</div>
</form>'''


def contact_section(prefix, home):
    social = " · ".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in SOCIAL)
    return f'''<section aria-labelledby="contactTitle" class="contact" id="contact">
<div class="frame contact-inner">
<div class="contact-card" data-reveal="">
{tag("Get in touch", dark=False)}
<h2 class="h2" id="contactTitle">Get your free <span class="hl">website audit.</span></h2>
{audit_form()}
</div>
<div class="contact-side" data-reveal="">
<div aria-hidden="true" class="dot-map"></div>
<ul class="contact-list">
<li><span>WhatsApp</span><a href="{WA}" rel="noopener" target="_blank">{PHONE}</a></li>
<li><span>Email</span><a href="mailto:{EMAIL}">{EMAIL}</a></li>
<li><span>Studio</span><p>Chennai, Tamil Nadu · Serving all of India</p></li>
<li><span>Follow</span><p>{social}</p></li>
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


def faq_section(faqs, title, prefix, num="FAQ"):
    items = "\n".join(
        f'''<details class="faq-item"{' open=""' if i == 1 else ''}>
<summary><span class="faq-n">{i:02d}</span><span class="faq-q">{esc(q)}</span><i aria-hidden="true"></i></summary>
<div class="faq-a"><p>{esc(a)}</p></div>
</details>''' for i, (q, a) in enumerate(faqs, 1))
    return f'''<section aria-labelledby="faqTitle" class="block" id="faq">
<div class="frame">
<div class="block-head">{heading(num, title, "Can't find your answer? Message us on WhatsApp and we'll reply.", title_id="faqTitle")}</div>
<div class="faq-list">
{items}
</div>
</div>
</section>'''


def marquee():
    words = ["STRATEGY", "CREATIVITY", "GROWTH", "SEARCH", "BRANDING"]
    row = "".join(f'<span>{w}</span><i aria-hidden="true">{STAR}</i>' for w in words)
    return f'''<section aria-hidden="true" class="marquee">
<div class="mq-row"><div class="mq-track">{row}{row}</div></div>
<div class="mq-row reverse"><div class="mq-track">{row}{row}</div></div>
</section>'''


def cta_band(prefix, home):
    return f'''<section class="cta">
<div class="frame cta-inner">
{pixels("px-cta")}
<div>
{tag("Free · no obligation")}
<h2>Find out what's holding your <span class="hl">website back.</span></h2>
</div>
<div class="actions">
{btn("Get my free audit", f"{home}#contact", "btn-white btn-lg")}
{btn("Chat on WhatsApp", WA, "btn-line-light btn-lg", target=True)}
</div>
</div>
</section>'''


# =================================================================== home

def home_page():
    p, home = "", ""

    org = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": SITE + "#organization",
                "name": "Astra Nexora",
                "slogan": "Creative. Strategic. Growth Driven.",
                "url": SITE,
                "logo": SITE + "assets/og-image.jpg",
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

    chev_l = "".join(f'<i style="--d:{(13 - k) * .12:.2f}">‹</i>' for k in range(14))
    chev_r = "".join(f'<i style="--d:{k * .12:.2f}">›</i>' for k in range(14))

    stats = [
        ("2025", "Founded in Chennai", '<path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6"/>'),
        ("08", "Service areas under one roof", '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
        ("1:1", "You work directly with the founder", '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    ]
    stat_html = "\n".join(
        f'<li><span class="st-icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24">{ic}</svg></span>'
        f'<div><strong>{esc(a)}</strong><small>{esc(b)}</small></div></li>'
        for a, b, ic in stats)

    platforms = "".join(f'<li>{esc(x)}</li>' for x in PLATFORMS[:8])

    # Services: columns with huge outlined numbers
    cols = ""
    for i, s in enumerate(SERVICES, 1):
        subs = "".join(f"<li>{esc(n)}</li>" for n, _ in s["includes"][:4])
        cols += f'''<a class="svc-col" data-reveal="" href="services/{s["slug"]}.html">
{tag(esc(s["nav"]))}
<span aria-hidden="true" class="svc-num">{i:02d}</span>
<h3>{esc(s["title"])}</h3>
<ul>{subs}</ul>
<span class="svc-go">Explore {ARROW}</span>
</a>
'''

    # Work: slider with overlay info box
    slides = f'''<li class="slide is-active">
<div class="slide-media img-wrap"><img alt="Astra Nexora SEO report dashboard showing organic clicks, enquiries and rankings" class="lqip" decoding="async" height="1125" loading="lazy" sizes="(min-width: 1001px) 1240px, 94vw" src="assets/projects/seo-report-dashboard-w1200.webp" srcset="assets/projects/seo-report-dashboard-w800.webp 800w, assets/projects/seo-report-dashboard-w1200.webp 1200w, assets/projects/seo-report-dashboard-w1800.webp 1800w" width="1800"/></div>
<div class="slide-info">
<h3>SEO Report Dashboard</h3>
<p>The monthly dashboard every SEO client gets: clicks, enquiries, rankings, Business Profile and site health. Shown with sample data.</p>
<dl><div><dt>Live demo</dt><dd>Sample data</dd></div><div><dt>Type</dt><dd>Analytics</dd></div><div><dt>Stack</dt><dd>GA4 · GSC</dd></div></dl>
<a class="slide-link" href="projects/seo-report.html">Open the demo {ARROW}</a>
</div>
</li>
'''
    for pr in PROJECTS:
        meta = dict(pr["meta"])
        slides += f'''<li class="slide">
<div class="slide-media img-wrap">{img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 1240px, 94vw", p)}</div>
<div class="slide-info">
<h3>{esc(pr["title"])}</h3>
<p>{esc(pr["summary"])}</p>
<dl><div><dt>Concept</dt><dd>Not a client</dd></div><div><dt>Type</dt><dd>{esc(pr["category"])}</dd></div><div><dt>Platform</dt><dd>{esc(meta.get("Platform", meta.get("Services", "—")).split(",")[0])}</dd></div></dl>
<a class="slide-link" href="projects/{pr["slug"]}.html">View project {ARROW}</a>
</div>
</li>
'''

    # Process: cards with small UI mock-ups drawn in CSS
    mocks = [
        '<div class="mock mock-audit"><span style="--w:.86"></span><span style="--w:.52"></span><span style="--w:.7"></span><span style="--w:.34"></span><b>Audit score</b></div>',
        '<div class="mock mock-flow"><span class="on">Goals</span><span>Keywords</span><span class="on">Pages</span><span>Channels</span><span class="on">Priorities</span></div>',
        '<div class="mock mock-site"><i></i><i></i><i></i><span class="hero-b"></span><span class="l"></span><span class="l s"></span><span class="btn-b"></span></div>',
        '<div class="mock mock-grow"><i style="--h:.3"></i><i style="--h:.42"></i><i style="--h:.5"></i><i style="--h:.66"></i><i class="on" style="--h:.92"></i></div>',
    ]
    steps = ""
    for i, (t, d, tg) in enumerate(HOME["process"], 1):
        steps += f'''<li class="step" data-reveal="">
{mocks[i - 1]}
<div class="step-cap"><span>//{i:02d}</span><h3>{esc(t)}</h3></div>
<p>{esc(d)}</p>
<small>{esc(tg)}</small>
</li>
'''

    compare_them = ["Starts with a design or a fixed package", "Reports likes and impressions",
                    "You talk to an account manager", "Copy-paste templates",
                    "One service in isolation", "Hand-off after launch"]
    compare_us = ["Starts with an audit of your business and goals", "Reports enquiries, leads and rankings",
                  "You talk to the founder, directly", "Designed around your brand",
                  "SEO, ads, content and web planned together", "Ongoing support and monthly growth plans"]
    them = "".join(f"<li>{CROSS}{esc(x)}</li>" for x in compare_them)
    us = "".join(f"<li>{CHECK}{esc(x)}</li>" for x in compare_us)

    features = ""
    feat_icons = ['<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>', '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
                  '<path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/>', '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>']
    for i, (_, t, d) in enumerate(HOME["principles"][:4]):
        features += f'''<li class="feat" data-reveal=""><span class="feat-icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 24 24">{feat_icons[i]}</svg></span><h3>{esc(t)}</h3><p>{esc(d)}</p></li>
'''

    f = HOME["founder"]
    timeline = "".join(f'<li><b>{y}</b><span>{esc(t)}</span></li>' for y, t in f["timeline"])

    body = f'''{header(p, home)}

<main id="main">

<section aria-labelledby="heroTitle" class="hero" id="home">
<div class="frame hero-frame">
{pixels("px-hero-a")}
{pixels("px-hero-b")}
<div aria-hidden="true" class="chev chev-l">{chev_l}</div>
<h1 class="hero-title" id="heroTitle"><span class="ht-word">We grow</span><span aria-hidden="true" class="ht-orb"><span class="orb">{STAR}</span></span><span class="ht-word">brands</span></h1>
<div aria-hidden="true" class="chev chev-r">{chev_r}</div>
<p class="hero-lead">{esc(HOME["hero_lead"])}</p>
<div class="actions hero-actions">
{btn("Explore services", "#services", "btn-white")}
{btn("Get a free audit", "#contact", "btn-dark")}
</div>
</div>
<div class="frame hero-split">
<ul class="hero-stats">
{stat_html}
</ul>
<div class="hero-photo img-wrap" data-parallax-wrap="">
{img("pexels-39205089", "Team planning a marketing strategy around a table", "(min-width: 1001px) 60vw, 94vw", p, eager=True)}
{pixels("px-photo")}
</div>
</div>
</section>

<section aria-label="Platforms we work on" class="platforms">
<div class="frame plat-grid">
<p>//Platforms<br/>we work on</p>
<ul>{platforms}</ul>
</div>
</section>

<section aria-labelledby="aboutTitle" class="block" id="about">
<div class="frame">
<div class="about-top" data-reveal="">
{tag("About us", dark=False)}
<h2 class="about-statement" id="aboutTitle">We build marketing as one connected system, <span class="inline-img img-wrap">{img("pexels-6476246", "", "160px", p)}</span> planned together and measured on the enquiries it brings in.</h2>
</div>
<div class="about-row">
<div class="about-copy" data-reveal="">
{"".join(f"<p>{esc(t)}</p>" for t in HOME["about"])}
</div>
<div class="about-photo img-wrap" data-reveal="">{img("pexels-7598011", "Brand strategy notes and sketches on a desk", "(min-width: 1001px) 50vw, 94vw", p, cls="bw")}</div>
</div>
</div>
</section>

<section aria-labelledby="servicesTitle" class="block" id="services">
<div class="frame">
<div class="block-head">{heading("Services", 'We plan. We build. <span class="hl">We grow.</span>', "Eight services, planned together by one team. Pick one, or let us run the whole system.", center=True, title_id="servicesTitle")}</div>
<div class="svc-cols">
{cols}</div>
</div>
</section>

<section aria-labelledby="workTitle" class="block work" id="work">
<div class="frame">
<div class="block-head split">{heading("Our work", 'Projects built <span class="hl">to deliver.</span>', title_id="workTitle")}<p class="lead">A live reporting demo and concept projects that show how we think. Client case studies are added as clients approve them.</p></div>
<div class="slider" data-slider="">
<ul class="slides">
{slides}</ul>
<div class="slider-nav">
<span class="slider-count"><b>01</b> / {len(PROJECTS) + 1:02d}</span>
<button aria-label="Previous project" class="sl-prev" type="button">‹</button>
<button aria-label="Next project" class="sl-next" type="button">›</button>
</div>
</div>
</div>
</section>

<section aria-labelledby="processTitle" class="block" id="process">
<div class="frame process">
<div class="process-side" data-reveal="">
{tag("Process", dark=False)}
<h2 class="h2" id="processTitle">Combine creativity <span class="hl">with strategy.</span></h2>
<p class="lead">Every step is designed for clarity, impact and results you can check.</p>
{btn("Start a project", "#contact", "btn-dark")}
</div>
<ol class="steps">
{steps}</ol>
</div>
</section>

{marquee()}

<section aria-labelledby="whyTitle" class="block" id="why">
<div class="frame">
<div class="block-head">{heading("The difference", 'Why choose <span class="hl">Astra Nexora.</span>', center=True, title_id="whyTitle")}</div>
<div class="compare">
<div class="cmp-card" data-reveal=""><h3>Other agencies</h3><ul>{them}</ul></div>
<div class="cmp-card us" data-reveal=""><h3>{logo()}<span class="visually-hidden">Astra Nexora</span></h3><ul>{us}</ul></div>
</div>
<div class="center-cta">{btn("Get started", "#contact", "btn-dark")}</div>
</div>
</section>

<section aria-labelledby="founderTitle" class="founder" id="founder">
<div class="frame founder-frame">
<div class="founder-photo img-wrap">
<img alt="S. Saktheeswaran, Founder and Managing Director of Astra Nexora, at his desk" class="lqip bw" decoding="async" height="900" loading="lazy" sizes="(min-width: 1001px) 1240px, 94vw" src="assets/founder/sakthi-desk-w720.webp" srcset="assets/founder/sakthi-desk-w480.webp 480w, assets/founder/sakthi-desk-w720.webp 720w" width="720"/>
</div>
{pixels("px-founder")}
<div class="founder-card" data-reveal="">
{tag("Meet the founder")}
<h2 id="founderTitle">{esc(f["name"])}</h2>
<p class="founder-role">{esc(f["role"])}</p>
<p>{esc(f["bio"][0])}</p>
<ol class="founder-time">{timeline}</ol>
<div class="founder-foot">
<a class="founder-link" href="{f["linkedin"]}" rel="noopener" target="_blank">LinkedIn {ARROW}</a>
<a class="founder-link" href="{WA}" rel="noopener" target="_blank">Talk to Sakthi {ARROW}</a>
</div>
</div>
</div>
</section>

<section aria-labelledby="growTitle" class="block" id="principles">
<div class="frame">
<div class="block-head split">{heading("Why it works", 'Helping brands grow <span class="hl">with clarity.</span>', title_id="growTitle")}<p class="lead">The principles behind every project we take on.</p></div>
<ul class="feats">
{features}</ul>
</div>
</section>

{faq_section(HOME["faqs"], 'Questions, <span class="hl">answered.</span>', p)}

{contact_section(p, home)}

</main>

{footer(p, home)}
'''
    return head(title, desc, "", p, [org, faq], body_class="site home") + body + scripts(p)


# =================================================================== inner pages

def page_hero(prefix, home, crumbs, kicker, h1, lead, actions, image_html, facts):
    crumb_html = "".join(
        f'<a href="{href}">{esc(name)}</a><span aria-hidden="true">/</span>' if href else f'<span aria-current="page">{esc(name)}</span>'
        for name, href in crumbs)
    fact_html = "\n".join(f'<li><span>{esc(k)}</span><strong>{esc(v)}</strong></li>' for k, v in facts)
    return f'''<section class="page-hero" id="home">
<div class="frame ph-frame">
{pixels("px-hero-a")}
<nav aria-label="Breadcrumb" class="breadcrumb">{crumb_html}</nav>
{tag(kicker)}
<h1 class="ph-title">{h1}</h1>
<div class="ph-foot">
<p class="hero-lead">{lead}</p>
<div class="actions">{actions}</div>
</div>
</div>
<div class="frame ph-split">
<ul class="ph-facts">
{fact_html}
</ul>
<div class="ph-photo img-wrap">{image_html}{pixels("px-photo")}</div>
</div>
</section>'''


def service_page(s, index):
    p, home = "../", "../index.html"
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

    h1 = s["h1"].replace("<em>", '<span class="hl">').replace("</em>", "</span>")
    hero = page_hero(
        p, home,
        [("Home", home), ("Services", f"{home}#services"), (s["nav"], None)],
        f"Service {index:02d} · {s['nav']}", h1, esc(s["lead"]),
        btn("Get a free consultation", f"{home}#contact", "btn-dark") + btn("Chat on WhatsApp", WA, "btn-white", target=True),
        img(s["hero"], s["hero_alt"], "(min-width: 1001px) 60vw, 94vw", p, eager=True),
        s["facts"])

    includes = "\n".join(
        f'''<li class="svc-col static" data-reveal=""><span aria-hidden="true" class="svc-num">{i:02d}</span><h3>{esc(n)}</h3><p>{esc(d)}</p></li>'''
        for i, (n, d) in enumerate(s["includes"], 1))
    steps = "\n".join(
        f'<li class="step simple" data-reveal=""><div class="step-cap"><span>//{i:02d}</span><h3>{esc(t)}</h3></div><p>{esc(d)}</p></li>'
        for i, (t, d) in enumerate(s["process"], 1))
    deliver = "".join(f"<li>{CHECK}{esc(d)}</li>" for d in s["deliverables"])
    ideal = "".join(f"<li>{esc(t)}</li>" for t in s["ideal"])

    related = ""
    for slug in s["related"]:
        r = SERVICE_BY_SLUG[slug]
        related += f'''<a class="rel-card" data-reveal="" href="{r["slug"]}.html">
<div class="rel-media img-wrap">{img(r["hero"], r["hero_alt"], "(min-width: 1001px) 30vw, 94vw", p)}</div>
<div class="rel-body">{tag(esc(r["nav"]))}<h3>{esc(r["title"])}</h3><span class="svc-go">Explore {ARROW}</span></div>
</a>
'''
    prev_s = SERVICES[(index - 2) % len(SERVICES)]
    next_s = SERVICES[index % len(SERVICES)]

    body = f'''{header(p, home)}

<main id="main">

{hero}

<section aria-labelledby="overviewTitle" class="block">
<div class="frame">
<div class="about-top" data-reveal="">
{tag("Why it matters", dark=False)}
<h2 class="about-statement" id="overviewTitle">{esc(s["overview"][0])}</h2>
</div>
<div class="about-row">
<div class="about-copy" data-reveal="">
<p>{esc(s["overview"][1])}</p>
<div class="ideal"><small>Ideal for</small><ul class="chips">{ideal}</ul></div>
</div>
<div class="about-photo img-wrap" data-reveal="">{img(s["side"], s["side_alt"], "(min-width: 1001px) 50vw, 94vw", p, cls="bw")}</div>
</div>
</div>
</section>

<section aria-labelledby="includesTitle" class="block">
<div class="frame">
<div class="block-head">{heading("What's included", f'Everything in <span class="hl">{esc(s["nav"])}.</span>', "Choose the pieces you need, or let us run the whole service for you.", center=True, title_id="includesTitle")}</div>
<ul class="svc-cols">
{includes}
</ul>
</div>
</section>

<section aria-labelledby="processTitle" class="block">
<div class="frame process">
<div class="process-side" data-reveal="">
{tag("How we work", dark=False)}
<h2 class="h2" id="processTitle">A clear process, <span class="hl">start to finish.</span></h2>
<p class="lead">You always know what's happening, what's next and what it's achieving.</p>
{btn("Start a project", f"{home}#contact", "btn-dark")}
</div>
<ol class="steps">
{steps}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="deliver">
<div class="frame deliver-inner">
{pixels("px-cta")}
<div data-reveal="">
{tag("Deliverables")}
<h2 id="deliverTitle">What you <span class="hl">get.</span></h2>
<p>Every engagement comes with clear deliverables and regular reporting.</p>
</div>
<ul class="deliver-list" data-reveal="">{deliver}</ul>
</div>
</section>

{faq_section(s["faqs"], f'Questions about <span class="hl">{esc(s["nav"])}.</span>', p)}

<section aria-labelledby="relatedTitle" class="block">
<div class="frame">
<div class="block-head">{heading("Related", 'Works well <span class="hl">with.</span>', center=True, title_id="relatedTitle")}</div>
<div class="rel-grid">
{related}</div>
<nav aria-label="More services" class="pager">
<a href="{prev_s["slug"]}.html"><small>‹ Previous</small><strong>{esc(prev_s["nav"])}</strong></a>
<a href="{next_s["slug"]}.html"><small>Next ›</small><strong>{esc(next_s["nav"])}</strong></a>
</nav>
</div>
</section>

{cta_band(p, home)}

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
        p, home,
        [("Home", home), ("Work", f"{home}#work"), (pr["title"], None)],
        f"Concept project · {pr['category']}", esc(pr["title"]), esc(pr["summary"]),
        btn("Start a similar project", f"{home}#contact", "btn-dark") + btn(f"See {svc['nav']}", f"../services/{svc['slug']}.html", "btn-white"),
        img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 60vw, 94vw", p, eager=True),
        pr["meta"])

    steps = "\n".join(
        f'<li class="step simple" data-reveal=""><div class="step-cap"><span>//{i:02d}</span><h3>{esc(t)}</h3></div><p>{esc(d)}</p></li>'
        for i, (t, d) in enumerate(pr["approach"], 1))
    deliver = "".join(f"<li>{CHECK}{esc(d)}</li>" for d in pr["deliverables"])
    goals = "\n".join(
        f'<li class="svc-col static" data-reveal=""><span aria-hidden="true" class="svc-num">{i:02d}</span><h3>{esc(g)}</h3></li>'
        for i, g in enumerate(pr["goals"], 1))
    nxt = PROJECTS[index % len(PROJECTS)]

    body = f'''{header(p, home)}

<main id="main">

{hero}

<div class="frame note-frame"><p class="concept-note"><strong>Concept project.</strong> This shows how we would approach this kind of brief. It is not a client case study and has no client results.</p></div>

<section aria-labelledby="challengeTitle" class="block">
<div class="frame">
<div class="about-top" data-reveal="">
{tag("The brief", dark=False)}
<h2 class="about-statement" id="challengeTitle">{esc(pr["challenge"])}</h2>
</div>
<div class="about-photo wide img-wrap" data-reveal="">{img(pr["second"], pr["second_alt"], "(min-width: 1001px) 1240px, 94vw", p, cls="bw")}</div>
</div>
</section>

<section aria-labelledby="approachTitle" class="block">
<div class="frame process">
<div class="process-side" data-reveal="">
{tag("Our approach", dark=False)}
<h2 class="h2" id="approachTitle">How we'd <span class="hl">solve it.</span></h2>
<p class="lead">Four steps, each with a clear outcome before the next one starts.</p>
{btn("Start a similar project", f"{home}#contact", "btn-dark")}
</div>
<ol class="steps">
{steps}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="deliver">
<div class="frame deliver-inner">
{pixels("px-cta")}
<div data-reveal="">
{tag("Scope")}
<h2 id="deliverTitle">What we'd <span class="hl">deliver.</span></h2>
<p>Part of our {esc(svc["title"])} service.</p>
</div>
<ul class="deliver-list" data-reveal="">{deliver}</ul>
</div>
</section>

<section aria-labelledby="goalsTitle" class="block">
<div class="frame">
<div class="block-head">{heading("Success measures", 'What success <span class="hl">looks like.</span>', "The goals we'd set and report against for a project like this.", center=True, title_id="goalsTitle")}</div>
<ul class="svc-cols four">
{goals}
</ul>
</div>
</section>

<section class="block">
<div class="frame">
<a class="next-proj" data-reveal="" href="{nxt["slug"]}.html">
<div class="slide-media img-wrap">{img(nxt["hero"], "", "(min-width: 1001px) 1240px, 94vw", p)}</div>
<div class="slide-info"><small>Next project</small><h3>{esc(nxt["title"])}</h3><span class="slide-link">View project {ARROW}</span></div>
</a>
</div>
</section>

{cta_band(p, home)}

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
