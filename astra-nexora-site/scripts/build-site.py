"""Builds every Astra Nexora page from scripts/content.py.

    python3 scripts/build-site.py

Writes index.html, services/<slug>.html and projects/<slug>.html.
projects/seo-report.html (the dashboard demo) is hand-written and left alone.
Image sizes and blur-up placeholders come from scripts/image-dims.json,
which `npm run images` keeps up to date.

Design: editorial. White page, near-black type, one brand blue, numbered
sections divided by hairlines. Headings in Inter Tight with Instrument
Serif italic for the accent word (<em> in content.py).
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

# Real client quotes go here once approved: (quote, name, business · city).
# The section stays off the page while this list is empty.
TESTIMONIALS = []

with open(os.path.join(ROOT, "scripts", "image-dims.json")) as f:
    DIMS = json.load(f)

WA_ICON = ('<svg aria-hidden="true" viewbox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z" fill="currentColor"></path></svg>')
ARROW = '<svg aria-hidden="true" class="arrow" viewbox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"/></svg>'


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
    """Inline wordmark: four-point star + ASTRA NEXORA in currentColor.
    Swap for the real logo SVG when it arrives."""
    return ('<svg aria-hidden="true" class="logo" viewbox="0 0 236 36">'
            '<path class="logo-star" d="M18 2c1.2 8.6 4.8 12.6 14 14-9.2 1.4-12.8 5.4-14 14-1.2-8.6-4.8-12.6-14-14 9.2-1.4 12.8-5.4 14-14z"/>'
            '<text font-family="Inter Tight, Inter, system-ui, sans-serif" font-size="17" font-weight="600" letter-spacing="2.6" x="42" y="23.5">'
            'ASTRA NEXORA</text></svg>')


def btn(label, href, kind="btn-dark", target=False):
    t = ' rel="noopener" target="_blank"' if target else ""
    return f'<a class="btn {kind}" href="{href}"{t}><span>{label}</span>{ARROW}</a>'


def label(num, text):
    """Section label: hairline, (number) and name, the editorial way of marking a section."""
    return f'<div class="label"><span>({num})</span><span>{text}</span></div>'




# =================================================================== shared

def head(title, description, path, prefix, schemas, preload=None, body_class="site"):
    pre = ""
    if preload:
        w = DIMS[preload][0]
        pre = (f'<link as="image" fetchpriority="high" href="{prefix}assets/stock/{preload}-w1200.webp" imagesizes="100vw" '
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
<meta content="#FFFFFF" name="theme-color"/>
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
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&amp;family=Inter:wght@400;500;600&amp;family=Instrument+Serif:ital@0;1&amp;display=swap" rel="stylesheet"/>
{pre}<link href="{prefix}css/style.css" rel="stylesheet"/>
<script>(function(d){{d.classList.add("js");if("scrollRestoration"in history)history.scrollRestoration="manual";}})(document.documentElement);</script>
{ld}</head>
<body class="{body_class}">
<a class="skip-link" href="#main">Skip to content</a>
<div aria-hidden="true" class="page-curtain"></div>
'''


def header(prefix, home):
    menu = "\n".join(
        f'<a href="{prefix}services/{s["slug"]}.html"><span>{i:02d}</span><strong>{esc(s["nav"])}</strong>'
        f'<small>{esc(SERVICE_TAGLINES[s["slug"]])}</small></a>'
        for i, s in enumerate(SERVICES, 1))
    mobile = "\n".join(f'<a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a>' for s in SERVICES)
    return f'''<header class="site-header" id="header">
<div class="header-inner">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo()}</a>
<nav aria-label="Main" class="desktop-nav">
<a href="{home}#about">About</a>
<div class="nav-dropdown">
<a aria-haspopup="true" class="nav-dropdown-toggle" href="{home}#services">Services</a>
<div class="nav-dropdown-panel">
<div class="nav-dropdown-grid">
{menu}
</div>
</div>
</div>
<a href="{home}#work">Work</a>
<a href="{home}#founder">Founder</a>
<a href="{home}#faq">FAQ</a>
</nav>
<div class="header-actions">
<a class="header-link" href="{WA}" rel="noopener" target="_blank">{PHONE}</a>
{btn("Let's talk", f"{home}#contact")}
</div>
<button aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu" class="menu-toggle" id="menuToggle" type="button"><span></span><span></span></button>
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
<a href="{WA}" rel="noopener" target="_blank">WhatsApp {PHONE}</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
</div>
</nav>
</header>'''


def footer(prefix, home):
    services = "\n".join(f'<a href="{prefix}services/{s["slug"]}.html">{esc(s["nav"])}</a>' for s in SERVICES)
    social = "\n".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in SOCIAL)
    return f'''<footer class="footer">
<div class="container">
<div class="footer-top">
<p class="footer-cta">Have a project in mind?<br/><a href="{home}#contact">Let's talk <em>today.</em></a></p>
<div class="footer-cols">
<div class="footer-col">
<h2>Services</h2>
{services}
</div>
<div class="footer-col">
<h2>Studio</h2>
<a href="{home}#about">About</a>
<a href="{home}#work">Work</a>
<a href="{prefix}projects/seo-report.html">Sample SEO report</a>
<a href="{home}#founder">Founder</a>
<a href="{home}#faq">FAQ</a>
</div>
<div class="footer-col">
<h2>Contact</h2>
<a href="{WA}" rel="noopener" target="_blank">WhatsApp {PHONE}</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
<p>Chennai, Tamil Nadu<br/>Serving all of India</p>
</div>
<div class="footer-col">
<h2>Follow</h2>
{social}
</div>
</div>
</div>
<a aria-label="Astra Nexora — back to top" class="footer-wordmark" href="{home}#home">ASTRA NEXORA</a>
<div class="footer-bottom">
<span>© 2026 Astra Nexora</span>
<span>Creative. Strategic. Growth driven.</span>
</div>
</div>
</footer>

<a aria-label="Chat with Astra Nexora on WhatsApp" class="float-whatsapp" href="{WA}" rel="noopener" target="_blank">{WA_ICON}</a>'''


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
<input aria-describedby="nameError" autocomplete="name" id="name" name="name" required="" type="text"/>
<span aria-live="polite" class="form-error" id="nameError"></span>
</div>
<div class="form-field">
<label for="phone">Mobile number</label>
<input aria-describedby="phoneError" autocomplete="tel" id="phone" inputmode="tel" name="phone" placeholder="+91" required="" type="tel"/>
<span aria-live="polite" class="form-error" id="phoneError"></span>
</div>
<div class="form-field">
<label for="company">Company name</label>
<input aria-describedby="companyError" autocomplete="organization" id="company" name="company" required="" type="text"/>
<span aria-live="polite" class="form-error" id="companyError"></span>
</div>
<div class="form-field">
<label for="website">Website</label>
<input aria-describedby="websiteError" autocomplete="url" id="website" inputmode="url" name="website" placeholder="yourbusiness.com" required="" type="text"/>
<span aria-live="polite" class="form-error" id="websiteError"></span>
</div>
<div class="form-field">
<label for="email">Email <small>(optional)</small></label>
<input autocomplete="email" id="email" inputmode="email" name="email" type="email"/>
</div>
<div class="form-field">
<label for="service">Service</label>
<select id="service" name="service">
{options}
</select>
</div>
<div class="form-field full">
<label for="message">Message <small>(optional)</small></label>
<textarea id="message" name="message" rows="2"></textarea>
</div>
<div class="form-actions">
<button class="btn btn-blue" type="submit"><span>Send on WhatsApp</span>{ARROW}</button>
<p class="form-note">No website yet? Type "none". Opens WhatsApp with your details, nothing is stored here.</p>
</div>
</form>'''


def contact_section(prefix, home, with_form=True):
    social = " · ".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in SOCIAL)
    lines = f'''<dl class="contact-lines">
<div><dt>WhatsApp</dt><dd><a href="{WA}" rel="noopener" target="_blank">{PHONE}</a></dd></div>
<div><dt>Email</dt><dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd></div>
<div><dt>Studio</dt><dd>Chennai, Tamil Nadu · Serving all of India</dd></div>
<div><dt>Follow</dt><dd>{social}</dd></div>
</dl>'''
    if with_form:
        right = f'<div class="contact-form" data-reveal="">{audit_form()}</div>'
    else:
        right = f'''<div class="contact-form" data-reveal="">
<p class="lead">Tell us about your business on WhatsApp or email. You'll get a clear next step, usually within 24 hours.</p>
<div class="actions">
{btn("Chat on WhatsApp", WA, "btn-blue", target=True)}
{btn("Fill in the audit form", f"{home}#contact", "btn-line")}
</div>
</div>'''
    return f'''<section aria-labelledby="contactTitle" class="section contact" id="contact">
<div class="container">
{label("✦", "Contact")}
<h2 class="contact-title" data-split="" id="contactTitle">Let's build your <em>next era.</em></h2>
<div class="contact-grid">
<div class="contact-info">
<p class="status"><i aria-hidden="true" class="live-dot"></i>Taking on new projects · replies within 24 hours</p>
{lines}
</div>
{right}
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


def faq_html(faqs):
    return "\n".join(
        f'''<details class="faq-item">
<summary><span class="faq-num">{i:02d}</span><span>{esc(q)}</span><i aria-hidden="true"></i></summary>
<p>{esc(a)}</p>
</details>''' for i, (q, a) in enumerate(faqs, 1))


def faq_schema(faqs):
    return {
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs],
    }


def steps_html(items):
    """Process / approach steps: numbered columns with a top rule that fills on scroll."""
    return "\n".join(
        f'''<li class="step" data-reveal="">
<span class="step-num">{i:02d}</span>
<h3>{esc(it[0])}</h3>
<p>{esc(it[1])}</p>
{f'<span class="step-tag">{esc(it[2])}</span>' if len(it) > 2 else ''}
</li>''' for i, it in enumerate(items, 1))


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

    hero_lines = "\n".join(f'<span class="line"><span>{l}</span></span>' for l in HOME["hero_h1"])

    # Services: an index list; the photo follows the pointer on desktop
    services = ""
    for i, s in enumerate(SERVICES, 1):
        subs = " · ".join(n for n, _ in s["includes"][:4])
        services += f'''<li class="svc-row" data-reveal="">
<a href="services/{s["slug"]}.html" data-preview="assets/stock/{s["hero"]}-w800.webp">
<span class="svc-num">{i:02d}</span>
<span class="svc-name">{esc(s["title"])}</span>
<span class="svc-subs">{esc(subs)}</span>
<span class="svc-go">{ARROW}</span>
</a>
</li>
'''

    # Work: featured live demo, then concept projects in a two-column grid
    work = f'''<article class="case case-feature" data-reveal="">
<a class="case-link" href="projects/seo-report.html">
<div class="case-media img-wrap">
<img alt="Astra Nexora SEO report dashboard showing organic clicks, enquiries and rankings" class="lqip" decoding="async" height="1125" loading="lazy" sizes="(min-width: 1320px) 1280px, 94vw" src="assets/projects/seo-report-dashboard-w1200.webp" srcset="assets/projects/seo-report-dashboard-w800.webp 800w, assets/projects/seo-report-dashboard-w1200.webp 1200w, assets/projects/seo-report-dashboard-w1800.webp 1800w" width="1800"/>
<span class="case-view" aria-hidden="true">Open demo</span>
</div>
<div class="case-meta">
<h3>SEO Report Dashboard</h3>
<span>Analytics &amp; reporting</span>
<span>Live demo · sample data</span>
</div>
</a>
</article>
'''
    for pr in PROJECTS:
        work += f'''<article class="case" data-reveal="">
<a class="case-link" href="projects/{pr["slug"]}.html">
<div class="case-media img-wrap">{img(pr["hero"], pr["hero_alt"], "(min-width: 901px) 46vw, 94vw", p)}<span class="case-view" aria-hidden="true">View</span></div>
<div class="case-meta">
<h3>{esc(pr["title"])}</h3>
<span>{esc(pr["category"])}</span>
<span>Concept</span>
</div>
</a>
</article>
'''

    principles = "\n".join(
        f'''<li data-reveal=""><span>{i:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></li>'''
        for i, (_, t, d) in enumerate(HOME["principles"], 1))

    checks = [
        ("Speed & Core Web Vitals", "How fast your pages load on a real phone, and what's slowing them down."),
        ("Mobile experience", "Whether your site is easy to read, tap and navigate on a small screen."),
        ("SEO & indexing", "Titles, headings, content and technical issues that affect your rankings."),
        ("Google Business Profile", "How you appear on Google Maps and in local search for your area."),
        ("Enquiry paths", "Forms, WhatsApp and call buttons: how easily a visitor can reach you."),
        ("Tracking & analytics", "Whether Analytics and Search Console measure what matters."),
    ]
    audit = "\n".join(
        f'<li data-reveal=""><span>{i:02d}</span><div><h3>{esc(t)}</h3><p>{esc(d)}</p></div></li>'
        for i, (t, d) in enumerate(checks, 1))

    f = HOME["founder"]
    timeline = "\n".join(f"<li><strong>{y}</strong><span>{esc(t)}</span></li>" for y, t in f["timeline"])
    bio = "\n".join(f"<p>{esc(b)}</p>" for b in f["bio"])

    stats = "\n".join(f"<div><dt>{esc(b)}</dt><dd>{esc(a)}</dd></div>" for a, b in HOME["stats"])

    testimonials = ""
    if TESTIMONIALS:
        quotes = "\n".join(
            f'<figure class="quote" data-reveal=""><blockquote>{esc(q)}</blockquote><figcaption><strong>{esc(n)}</strong>{esc(b)}</figcaption></figure>'
            for q, n, b in TESTIMONIALS)
        testimonials = f'''<section aria-labelledby="feedbackTitle" class="section" id="feedback">
<div class="container">
{label("✦", "Client voices")}
<h2 class="title" data-split="" id="feedbackTitle">In their <em>words.</em></h2>
<div class="quotes">{quotes}</div>
</div>
</section>
'''

    body = f'''{header(p, home)}

<main id="main">

<section aria-labelledby="heroTitle" class="hero" id="home">
<div class="container">
<dl class="hero-meta">
{stats}
</dl>
<h1 class="hero-title" id="heroTitle">
{hero_lines}
</h1>
<div class="hero-foot">
<p class="hero-lead">{esc(HOME["hero_lead"])}</p>
<div class="actions">
{btn("Get a free website audit", "#contact", "btn-blue")}
{btn("See our work", "#work", "btn-line")}
</div>
</div>
</div>
<div class="container hero-stage">
<div class="hero-media" data-hero-media="">
<img alt="Team reviewing marketing analytics on a laptop during a meeting" decoding="async" fetchpriority="high" height="1080" sizes="(min-width: 1320px) 1280px, 94vw" src="assets/stock/pexels-7147921-poster-w1200.webp" srcset="assets/stock/pexels-7147921-poster-w480.webp 480w, assets/stock/pexels-7147921-poster-w800.webp 800w, assets/stock/pexels-7147921-poster-w1200.webp 1200w, assets/stock/pexels-7147921-poster-w2000.webp 1920w" width="1920"/>
<!-- Desktop-only video (Pexels 7147921, see assets/video/CREDITS.md). The poster above is its first frame. -->
<video aria-hidden="true" class="hero-video" data-src="assets/video/hero.mp4" loop="" muted="" playsinline="" preload="none"></video>
<button aria-pressed="false" class="hero-video-toggle" hidden="" type="button"><span aria-hidden="true" class="hero-video-toggle-icon"></span><span class="hero-video-toggle-label">Pause</span></button>
</div>
</div>
</section>

<section aria-labelledby="aboutTitle" class="section" id="about">
<div class="container">
{label("01", "About")}
<h2 class="visually-hidden" id="aboutTitle">About Astra Nexora</h2>
<p class="statement" data-statement="">{esc(HOME["statement"])}</p>
<div class="about-grid">
<div class="about-media">
<div class="frame img-wrap" data-parallax="-0.05">{img("pexels-39205089", "Team planning a marketing strategy around a table", "(min-width: 1001px) 30vw, 92vw", p)}</div>
<div class="frame img-wrap" data-parallax="0.05">{img("pexels-6476246", "Team reviewing a campaign chart on a tablet", "(min-width: 1001px) 22vw, 60vw", p)}</div>
</div>
<div class="about-copy" data-reveal="">
{"".join(f"<p>{esc(t)}</p>" for t in HOME["about"])}
<a class="text-link" href="#process">How we work {ARROW}</a>
</div>
</div>
</div>
</section>

<section aria-labelledby="servicesTitle" class="section services" id="services">
<div class="container">
{label("02", "Services")}
<div class="head">
<h2 class="title" data-split="" id="servicesTitle">Digital growth, <em>powered by strategy.</em></h2>
<p class="lead">Eight services, planned together. Pick one, or let us run the whole system.</p>
</div>
<ul class="svc-list">
{services}</ul>
</div>
<div aria-hidden="true" class="svc-preview"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /></div>
</section>

<section aria-labelledby="processTitle" class="section paper" id="process">
<div class="container">
{label("03", "Process")}
<div class="head">
<h2 class="title" data-split="" id="processTitle">From audit to growth, <em>in four steps.</em></h2>
<p class="lead">Every project starts with your business goals and ends with numbers you can check.</p>
</div>
<ol class="steps" data-steps="">
{steps_html(HOME["process"])}
</ol>
</div>
</section>

<section aria-labelledby="workTitle" class="section" id="work">
<div class="container">
{label("04", "Work")}
<div class="head">
<h2 class="title" data-split="" id="workTitle">Selected <em>work.</em></h2>
<p class="lead">A live reporting demo and concept projects that show how we think. Client case studies are added as clients approve them.</p>
</div>
<div class="cases">
{work}</div>
</div>
</section>

<section aria-labelledby="founderTitle" class="section paper founder" id="founder">
<div class="container">
{label("05", "Founder")}
<div class="founder-grid">
<div class="founder-media" data-founder-media="">
<div class="founder-photo img-wrap">
<img alt="S. Saktheeswaran, Founder and Managing Director of Astra Nexora, at his desk" class="lqip" data-parallax-img="" decoding="async" height="900" loading="lazy" sizes="(min-width: 1001px) 40vw, 92vw" src="assets/founder/sakthi-desk-w720.webp" srcset="assets/founder/sakthi-desk-w480.webp 480w, assets/founder/sakthi-desk-w720.webp 720w" width="720"/>
</div>
<div class="founder-photo-alt img-wrap">
<img alt="S. Saktheeswaran sitting in a leather armchair" class="lqip" decoding="async" height="900" loading="lazy" sizes="(min-width: 1001px) 16vw, 38vw" src="assets/founder/sakthi-chair-w480.webp" srcset="assets/founder/sakthi-chair-w480.webp 480w, assets/founder/sakthi-chair-w720.webp 720w" width="720"/>
</div>
</div>
<div class="founder-copy">
<h2 class="title" data-split="" id="founderTitle">The vision behind <em>Astra Nexora.</em></h2>
<p class="founder-role"><span class="founder-name">{esc(f["name"])}<svg aria-hidden="true" class="founder-underline" preserveaspectratio="none" viewbox="0 0 200 12"><path d="M2 8 C 50 2, 110 2, 198 6"></path></svg></span><small>{esc(f["role"])}</small></p>
{bio}
<ol class="timeline" data-timeline="">
{timeline}
</ol>
{btn("Connect on LinkedIn", f["linkedin"], "btn-line", target=True)}
</div>
</div>
</div>
</section>

<section aria-labelledby="whyTitle" class="section" id="why">
<div class="container">
{label("06", "Why us")}
<div class="head">
<h2 class="title" data-split="" id="whyTitle">What sets <em>us apart.</em></h2>
<p class="lead">Six principles behind every project we take on.</p>
</div>
<ol class="principles">
{principles}
</ol>
</div>
</section>

<section aria-labelledby="auditTitle" class="section ink" id="audit">
<div class="container">
{label("07", "Free audit")}
<div class="audit-grid">
<div class="audit-copy">
<h2 class="title" data-split="" id="auditTitle">Find out what's holding your <em>website back.</em></h2>
<p class="lead">Send us your website and we'll check the six things that decide whether visitors find you, trust you and get in touch. Free, with no obligation.</p>
{btn("Get my free audit", "#contact", "btn-blue")}
</div>
<ol class="checks">
{audit}
</ol>
</div>
</div>
</section>

{testimonials}<section aria-labelledby="faqTitle" class="section" id="faq">
<div class="container">
{label("08", "FAQ")}
<div class="faq-grid">
<h2 class="title" data-split="" id="faqTitle">Questions, <em>answered.</em></h2>
<div class="faq-list">
{faq_html(HOME["faqs"])}
</div>
</div>
</div>
</section>

{contact_section(p, home)}

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

    facts = "\n".join(f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in s["facts"])
    ideal = ", ".join(s["ideal"])
    includes = "\n".join(
        f'<li data-reveal=""><span>{i:02d}</span><h3>{esc(n)}</h3><p>{esc(d)}</p></li>'
        for i, (n, d) in enumerate(s["includes"], 1))
    deliver = "\n".join(f'<li>{esc(d)}</li>' for d in s["deliverables"])

    related = ""
    for slug in s["related"]:
        r = SERVICE_BY_SLUG[slug]
        related += f'''<article class="case" data-reveal="">
<a class="case-link" href="{r["slug"]}.html">
<div class="case-media img-wrap">{img(r["hero"], r["hero_alt"], "(min-width: 901px) 30vw, 94vw", p)}<span class="case-view" aria-hidden="true">View</span></div>
<div class="case-meta"><h3>{esc(r["title"])}</h3><span>{SERVICES.index(r) + 1:02d}</span></div>
</a>
</article>
'''
    prev_s = SERVICES[(index - 2) % len(SERVICES)]
    next_s = SERVICES[index % len(SERVICES)]

    body = f'''{header(p, home)}

<main id="main">

<section class="page-hero" id="home">
<div class="container">
<nav aria-label="Breadcrumb" class="breadcrumb"><a href="{home}">Home</a><span aria-hidden="true">/</span><a href="{home}#services">Services</a><span aria-hidden="true">/</span><span aria-current="page">{esc(s["nav"])}</span></nav>
{label(num, "Service")}
<h1 class="page-title" data-split="">{s["h1"]}</h1>
<div class="page-foot">
<p class="hero-lead">{esc(s["lead"])}</p>
<div class="actions">
{btn("Get a free consultation", f"{home}#contact", "btn-blue")}
{btn("Chat on WhatsApp", WA, "btn-line", target=True)}
</div>
</div>
<dl class="facts">
{facts}
</dl>
</div>
<div class="container">
<div class="page-media img-wrap" data-hero-media="">{img(s["hero"], s["hero_alt"], "(min-width: 1320px) 1280px, 94vw", p, eager=True)}</div>
</div>
</section>

<section aria-labelledby="overviewTitle" class="section">
<div class="container">
{label("01", "Overview")}
<div class="split">
<h2 class="title" data-split="" id="overviewTitle">Built for <em>real growth.</em></h2>
<div class="split-copy" data-reveal="">
<p class="big">{esc(s["overview"][0])}</p>
<p>{esc(s["overview"][1])}</p>
<p class="ideal"><strong>Ideal for</strong> {esc(ideal)}</p>
</div>
</div>
<div class="wide-media img-wrap" data-reveal="">{img(s["side"], s["side_alt"], "(min-width: 1320px) 1280px, 94vw", p, cls="parallax-img")}</div>
</div>
</section>

<section aria-labelledby="includesTitle" class="section paper">
<div class="container">
{label("02", "What's included")}
<div class="head">
<h2 class="title" data-split="" id="includesTitle">Everything in <em>{esc(s["nav"])}.</em></h2>
<p class="lead">Choose the pieces you need, or let us run the whole service for you.</p>
</div>
<ol class="principles">
{includes}
</ol>
</div>
</section>

<section aria-labelledby="processTitle" class="section">
<div class="container">
{label("03", "Process")}
<div class="head">
<h2 class="title" data-split="" id="processTitle">A clear process, <em>start to finish.</em></h2>
<p class="lead">You always know what's happening, what's next and what it's achieving.</p>
</div>
<ol class="steps" data-steps="">
{steps_html(s["process"])}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="section ink">
<div class="container">
{label("04", "Deliverables")}
<div class="split">
<h2 class="title" data-split="" id="deliverTitle">What you <em>get.</em></h2>
<div>
<ul class="deliver-list" data-reveal="">
{deliver}
</ul>
{btn("Start a project", f"{home}#contact", "btn-blue")}
</div>
</div>
</div>
</section>

<section aria-labelledby="faqTitle" class="section">
<div class="container">
{label("05", "FAQ")}
<div class="faq-grid">
<h2 class="title" data-split="" id="faqTitle">Questions about <em>{esc(s["nav"])}.</em></h2>
<div class="faq-list">
{faq_html(s["faqs"])}
</div>
</div>
</div>
</section>

<section aria-labelledby="relatedTitle" class="section paper">
<div class="container">
{label("06", "Related")}
<h2 class="title" data-split="" id="relatedTitle">Works well <em>with.</em></h2>
<div class="cases three">
{related}</div>
<nav aria-label="More services" class="pager">
<a href="{prev_s["slug"]}.html"><span>Previous</span><strong>{esc(prev_s["nav"])}</strong></a>
<a href="{next_s["slug"]}.html"><span>Next</span><strong>{esc(next_s["nav"])}</strong></a>
</nav>
</div>
</section>

{contact_section(p, home, with_form=False)}

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
    meta = "\n".join(f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in pr["meta"])
    deliver = "\n".join(f'<li>{esc(d)}</li>' for d in pr["deliverables"])
    goals = "\n".join(f'<li data-reveal=""><span>{i:02d}</span><p>{esc(g)}</p></li>' for i, g in enumerate(pr["goals"], 1))
    nxt = PROJECTS[index % len(PROJECTS)]

    body = f'''{header(p, home)}

<main id="main">

<section class="page-hero" id="home">
<div class="container">
<nav aria-label="Breadcrumb" class="breadcrumb"><a href="{home}">Home</a><span aria-hidden="true">/</span><a href="{home}#work">Work</a><span aria-hidden="true">/</span><span aria-current="page">{esc(pr["title"])}</span></nav>
{label("✦", "Concept project · " + esc(pr["category"]))}
<h1 class="page-title" data-split="">{esc(pr["title"])}</h1>
<div class="page-foot">
<p class="hero-lead">{esc(pr["summary"])}</p>
<p class="concept-note"><strong>Concept project.</strong> It shows how we would approach this kind of brief. It is not a client case study and has no client results.</p>
</div>
<dl class="facts four">
{meta}
</dl>
</div>
<div class="container">
<div class="page-media img-wrap" data-hero-media="">{img(pr["hero"], pr["hero_alt"], "(min-width: 1320px) 1280px, 94vw", p, eager=True)}</div>
</div>
</section>

<section aria-labelledby="challengeTitle" class="section">
<div class="container">
{label("01", "The brief")}
<div class="split">
<h2 class="title" data-split="" id="challengeTitle">The <em>challenge.</em></h2>
<div class="split-copy" data-reveal=""><p class="big">{esc(pr["challenge"])}</p></div>
</div>
<div class="wide-media img-wrap" data-reveal="">{img(pr["second"], pr["second_alt"], "(min-width: 1320px) 1280px, 94vw", p, cls="parallax-img")}</div>
</div>
</section>

<section aria-labelledby="approachTitle" class="section paper">
<div class="container">
{label("02", "Approach")}
<div class="head">
<h2 class="title" data-split="" id="approachTitle">How we'd <em>solve it.</em></h2>
<p class="lead">Four steps, each with a clear outcome before the next one starts.</p>
</div>
<ol class="steps" data-steps="">
{steps_html(pr["approach"])}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="section ink">
<div class="container">
{label("03", "Scope")}
<div class="split">
<h2 class="title" data-split="" id="deliverTitle">What we'd <em>deliver.</em></h2>
<div>
<ul class="deliver-list" data-reveal="">
{deliver}
</ul>
<a class="text-link" href="../services/{svc["slug"]}.html">Part of {esc(svc["title"])} {ARROW}</a>
</div>
</div>
</div>
</section>

<section aria-labelledby="goalsTitle" class="section">
<div class="container">
{label("04", "Success measures")}
<div class="head">
<h2 class="title" data-split="" id="goalsTitle">What success <em>looks like.</em></h2>
<p class="lead">The goals we'd set and report against for a project like this.</p>
</div>
<ol class="principles goals">
{goals}
</ol>
</div>
</section>

<a aria-label="Next project: {attr(nxt["title"])}" class="next-project" href="{nxt["slug"]}.html">
<div class="next-bg" data-parallax="0.08">{img(nxt["hero"], "", "100vw", p)}</div>
<div class="container next-inner"><span>Next project</span><strong>{esc(nxt["title"])}</strong>{ARROW}</div>
</a>

{contact_section(p, home, with_form=False)}

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
