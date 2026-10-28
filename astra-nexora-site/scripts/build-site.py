"""Builds every Astra Nexora page from scripts/content.py.

    python3 scripts/build-site.py

Writes index.html, services/<slug>.html and projects/<slug>.html.
projects/seo-report.html (the dashboard demo) is hand-written and left alone.
Image sizes and blur-up placeholders come from scripts/image-dims.json,
which `npm run images` keeps up to date.

Design v11: bright and modern. White canvas with soft animated blue-violet
gradients, Geist type, rounded cards, and interactive pieces (hero dashboard,
process tabs, work filter) instead of static blocks.
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
    """Inline wordmark: gradient star + Astra Nexora. Swap for the real logo SVG when it arrives."""
    return ('<svg aria-hidden="true" class="logo" viewbox="0 0 200 32">'
            '<defs><linearGradient id="lg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#5676FF"/><stop offset="1" stop-color="#7B4DFF"/></linearGradient></defs>'
            '<path d="M16 1c1.1 7.7 4.3 11.2 12.5 12.5C20.3 14.8 17.1 18.3 16 26c-1.1-7.7-4.3-11.2-12.5-12.5C11.7 12.2 14.9 8.7 16 1z" fill="url(#lg)"/>'
            '<text font-family="Geist, Inter, system-ui, sans-serif" font-size="17" font-weight="600" letter-spacing="-.2" x="38" y="19.5">Astra Nexora</text></svg>')


def btn(label, href, kind="btn-primary", target=False, arrow=True):
    t = ' rel="noopener" target="_blank"' if target else ""
    return f'<a class="btn {kind}" href="{href}"{t}><span>{label}</span>{ARROW if arrow else ""}</a>'


def pill(text):
    return f'<span class="pill"><i aria-hidden="true"></i>{text}</span>'


def section_head(kicker, title_html, lead=None, center=True, title_id=None):
    tid = f' id="{title_id}"' if title_id else ""
    lead_html = f'<p class="lead">{lead}</p>' if lead else ""
    return f'''<div class="shead{" center" if center else ""}" data-reveal="">
{pill(kicker)}
<h2 class="h2"{tid}>{title_html}</h2>
{lead_html}
</div>'''


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
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
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
    return f'''<header class="site-header" id="header">
<div class="nav-shell">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo()}</a>
<nav aria-label="Main" class="desktop-nav">
<div class="nav-dropdown">
<a aria-haspopup="true" class="nav-link nav-dropdown-toggle" href="{home}#services">Services <svg aria-hidden="true" viewbox="0 0 12 12"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg></a>
<div class="nav-dropdown-panel">
<div class="nav-dropdown-grid">
{menu}
</div>
</div>
</div>
<a class="nav-link" href="{home}#process">Process</a>
<a class="nav-link" href="{home}#work">Work</a>
<a class="nav-link" href="{home}#founder">About</a>
<a class="nav-link" href="{home}#faq">FAQ</a>
</nav>
<div class="header-actions">
<a aria-label="WhatsApp {PHONE}" class="icon-btn" href="{WA}" rel="noopener" target="_blank">{WA_ICON}</a>
{btn("Get free audit", f"{home}#contact", "btn-primary btn-sm")}
</div>
<button aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu" class="menu-toggle" id="menuToggle" type="button"><span></span><span></span></button>
</div>
<nav aria-label="Mobile" class="mobile-menu" id="mobileMenu">
<details class="mobile-services"><summary>Services</summary>
{mobile}
</details>
<a href="{home}#process">Process</a>
<a href="{home}#work">Work</a>
<a href="{home}#founder">About</a>
<a href="{home}#faq">FAQ</a>
<a href="{home}#contact">Contact</a>
<div class="mobile-contact">
{btn("Get free audit", f"{home}#contact", "btn-primary")}
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
<div class="footer-grid">
<div class="footer-brand">
<a aria-label="Astra Nexora — home" class="brand" href="{home}#home">{logo()}</a>
<p>A digital marketing studio in Chennai for SEO, websites, branding and performance marketing, planned as one system.</p>
<div class="footer-social">{social}</div>
</div>
<div class="footer-col">
<h2>Services</h2>
{services}
</div>
<div class="footer-col">
<h2>Studio</h2>
<a href="{home}#process">Process</a>
<a href="{home}#work">Work</a>
<a href="{prefix}projects/seo-report.html">Sample SEO report</a>
<a href="{home}#founder">About the founder</a>
<a href="{home}#faq">FAQ</a>
</div>
<div class="footer-col">
<h2>Contact</h2>
<a href="{WA}" rel="noopener" target="_blank">WhatsApp {PHONE}</a>
<a href="mailto:{EMAIL}">{EMAIL}</a>
<p>Chennai, Tamil Nadu<br/>Serving all of India</p>
</div>
</div>
<div class="footer-bottom">
<span>© 2026 Astra Nexora. All rights reserved.</span>
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
<button class="btn btn-primary btn-block" type="submit">{WA_ICON}<span>Send on WhatsApp</span></button>
<p class="form-note">No website yet? Type "none". This opens WhatsApp with your details; nothing is stored here.</p>
</div>
</form>'''


def contact_section(prefix, home):
    social = " · ".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in SOCIAL)
    return f'''<section aria-labelledby="contactTitle" class="section contact" id="contact">
<div class="container contact-grid">
<div class="contact-info" data-reveal="">
{pill("Contact")}
<h2 class="h2" id="contactTitle">Let's build your <span class="grad">next era.</span></h2>
<p class="lead">Tell us about your business. You'll get a clear next step, usually within 24 hours.</p>
<ul class="contact-cards">
<li><a href="{WA}" rel="noopener" target="_blank"><span class="cc-icon wa">{WA_ICON}</span><span><small>WhatsApp</small>{PHONE}</span></a></li>
<li><a href="mailto:{EMAIL}"><span class="cc-icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" viewbox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/></svg></span><span><small>Email</small>{EMAIL}</span></a></li>
<li><span class="cc-static"><span class="cc-icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" viewbox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span><small>Studio</small>Chennai · Serving all of India</span></span></li>
</ul>
<p class="contact-social">Follow: {social}</p>
</div>
<div class="form-card" data-reveal="">
<div class="form-head"><strong>Get your free website audit</strong><span><i aria-hidden="true" class="live-dot"></i>Taking on new projects</span></div>
{audit_form()}
</div>
</div>
</section>'''


def cta_band(prefix, home):
    return f'''<section class="section cta-section">
<div class="container">
<div class="cta-band" data-reveal="">
<div aria-hidden="true" class="cta-glow"></div>
<h2>Ready to grow? <span>Start with a free website audit.</span></h2>
<p>We'll check speed, SEO, Google Business Profile and enquiry paths, and send you a clear list of what to fix first.</p>
<div class="actions">
{btn("Get my free audit", f"{home}#contact", "btn-white")}
{btn("Chat on WhatsApp", WA, "btn-ghost", target=True)}
</div>
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
        f'''<details class="faq-item"{' open=""' if i == 1 else ''}>
<summary><span>{esc(q)}</span><i aria-hidden="true"></i></summary>
<div class="faq-body"><p>{esc(a)}</p></div>
</details>''' for i, (q, a) in enumerate(faqs, 1))


def faq_schema(faqs):
    return {
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs],
    }


def faq_section(faqs, title_html, prefix):
    return f'''<section aria-labelledby="faqTitle" class="section" id="faq">
<div class="container faq-grid">
<div class="faq-side" data-reveal="">
{pill("FAQ")}
<h2 class="h2" id="faqTitle">{title_html}</h2>
<p class="lead">Can't find your answer? Message us on WhatsApp and we'll reply.</p>
{btn("Ask on WhatsApp", WA, "btn-outline", target=True)}
</div>
<div class="faq-list" data-reveal="">
{faq_html(faqs)}
</div>
</div>
</section>'''


# =================================================================== home

def hero_dashboard(p):
    """Hero visual: our real SEO report demo in a browser window, with live
    example widgets floating around it. All numbers are labelled as examples."""
    return f'''<div class="hero-visual" data-tilt="">
<div class="hv-window">
<div class="hv-bar"><span></span><span></span><span></span><em>astranexora.com/seo-report</em></div>
<a class="hv-screen" href="projects/seo-report.html" aria-label="Open the live SEO report dashboard demo">
<img alt="Astra Nexora SEO report dashboard demo" decoding="async" fetchpriority="high" height="1125" sizes="(min-width: 1001px) 900px, 92vw" src="assets/projects/seo-report-dashboard-w1200.webp" srcset="assets/projects/seo-report-dashboard-w800.webp 800w, assets/projects/seo-report-dashboard-w1200.webp 1200w, assets/projects/seo-report-dashboard-w1800.webp 1800w" width="1800"/>
</a>
</div>
<div class="hv-card hv-rank" data-depth="1.4">
<small>Google ranking <b>Example</b></small>
<div class="hv-rank-row"><span class="kw">"dentist in chennai"</span><span class="pos">#<em data-count-from="14" data-count-to="3">14</em></span></div>
<div class="hv-spark"><svg viewbox="0 0 120 32" preserveaspectratio="none"><path d="M2 28 L20 26 L38 24 L56 18 L74 15 L92 9 L118 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></div>
</div>
<div class="hv-card hv-score" data-depth="2">
<svg class="ring" viewbox="0 0 64 64"><circle cx="32" cy="32" r="27"/><circle class="ring-fill" cx="32" cy="32" r="27"/></svg>
<div><strong data-count-from="0" data-count-to="92">0</strong><small>Website health<br/><b>Example audit</b></small></div>
</div>
<div class="hv-card hv-toast" data-depth="2.6" aria-live="off">
<span class="hv-wa">{WA_ICON}</span>
<div><small>New enquiry · WhatsApp</small><p data-toasts='["Hi, can I get a quote for a new website?","Saw your page on Google. Is SEO available?","Need help with Instagram ads for my clinic."]'>Hi, can I get a quote for a new website?</p></div>
</div>
<div class="hv-card hv-bars" data-depth="1.8">
<small>Leads by month <b>Example</b></small>
<div class="bars"><i style="--h:.35"></i><i style="--h:.48"></i><i style="--h:.44"></i><i style="--h:.62"></i><i style="--h:.71"></i><i style="--h:.9"></i></div>
</div>
</div>'''


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

    # Services bento: first two cards are large and carry a photo
    cards = ""
    for i, s in enumerate(SERVICES, 1):
        subs = "".join(f"<li>{esc(n)}</li>" for n, _ in s["includes"][:3])
        big = i <= 2
        media = f'<div class="svc-media img-wrap">{img(s["hero"], s["hero_alt"], "(min-width: 1101px) 40vw, 92vw", p)}</div>' if big else ""
        cards += f'''<a class="svc-card{" big" if big else ""} spot" data-reveal="" href="services/{s["slug"]}.html">
<span class="svc-icon">{icon(s["slug"])}</span>
<h3>{esc(s["title"])}</h3>
<p>{esc(SERVICE_TAGLINES[s["slug"]])}</p>
<ul class="svc-tags">{subs}</ul>
<span class="svc-more">Explore {ARROW}</span>
{media}
</a>
'''

    # Process: interactive tabs
    step_imgs = ["pexels-577210", "pexels-39205089", "pexels-36706460", "pexels-6476246"]
    tabs = ""
    panels = ""
    for i, (t, d, tag) in enumerate(HOME["process"], 1):
        sel = i == 1
        tabs += (f'<button aria-controls="step{i}" aria-selected="{"true" if sel else "false"}" class="ptab" id="tab{i}" role="tab" '
                 f'tabindex="{0 if sel else -1}" type="button"><span>{i:02d}</span><strong>{esc(t)}</strong><i aria-hidden="true"></i></button>\n')
        panels += f'''<div aria-labelledby="tab{i}" class="ppanel{" is-active" if sel else ""}" id="step{i}" role="tabpanel"{"" if sel else " hidden"}>
<div class="ppanel-copy"><span class="ppanel-tag">{esc(tag)}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></div>
<div class="ppanel-media img-wrap">{img(step_imgs[i - 1], "", "(min-width: 1001px) 40vw, 92vw", p)}</div>
</div>
'''

    # Work: filterable grid
    def kind(category):
        c = category.lower()
        return "web" if "web" in c else "brand" if ("brand" in c or "identity" in c) else "seo"

    work = f'''<a class="work-card feature" data-kind="seo" data-reveal="" href="projects/seo-report.html">
<div class="work-media img-wrap">
<img alt="Astra Nexora SEO report dashboard showing organic clicks, enquiries and rankings" class="lqip" decoding="async" height="1125" loading="lazy" sizes="(min-width: 1001px) 60vw, 92vw" src="assets/projects/seo-report-dashboard-w1200.webp" srcset="assets/projects/seo-report-dashboard-w800.webp 800w, assets/projects/seo-report-dashboard-w1200.webp 1200w, assets/projects/seo-report-dashboard-w1800.webp 1800w" width="1800"/>
</div>
<div class="work-body"><div class="work-tags"><span class="tag live"><i aria-hidden="true" class="live-dot"></i>Live demo</span><span class="tag">Analytics &amp; reporting</span></div>
<h3>SEO Report Dashboard</h3><p>The monthly dashboard every SEO client gets: clicks, enquiries, rankings and site health. Shown with sample data.</p><span class="work-go">Open the demo {ARROW}</span></div>
</a>
'''
    for pr in PROJECTS:
        work += f'''<a class="work-card" data-kind="{kind(pr["category"])}" data-reveal="" href="projects/{pr["slug"]}.html">
<div class="work-media img-wrap">{img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 30vw, 92vw", p)}</div>
<div class="work-body"><div class="work-tags"><span class="tag">{esc(pr["category"])}</span><span class="tag soft">Concept</span></div>
<h3>{esc(pr["title"])}</h3><span class="work-go">View project {ARROW}</span></div>
</a>
'''

    compare = [
        ("Starts with", "A design or a fixed package", "An audit of your business and goals"),
        ("Reports on", "Likes and impressions", "Enquiries, leads and rankings you can check"),
        ("You talk to", "An account manager", "The founder, directly"),
        ("Design", "Copy-paste templates", "Built around your brand"),
        ("Channels", "One service in isolation", "SEO, ads, content and web planned together"),
        ("After launch", "Hand-off and goodbye", "Ongoing support and monthly growth plans"),
    ]
    rows = "\n".join(
        f'<div class="cmp-row" data-reveal="" role="row"><span class="cmp-label" role="rowheader">{esc(l)}</span><span class="cmp-them" role="cell">{CROSS}{esc(a)}</span><span class="cmp-us" role="cell">{CHECK}{esc(b)}</span></div>'
        for l, a, b in compare)

    checks = ["Speed & Core Web Vitals", "Mobile experience", "SEO & indexing", "Google Business Profile", "Enquiry paths", "Tracking & analytics"]
    audit_list = "".join(f"<li>{CHECK}{esc(c)}</li>" for c in checks)

    f = HOME["founder"]
    bio = "\n".join(f"<p>{esc(b)}</p>" for b in f["bio"])
    timeline = "\n".join(f'<li><strong>{y}</strong><span>{esc(t)}</span></li>' for y, t in f["timeline"])

    platforms = "".join(f"<li>{esc(x)}</li>" for x in PLATFORMS)

    testimonials = ""
    if TESTIMONIALS:
        quotes = "\n".join(
            f'<figure class="quote" data-reveal=""><blockquote>{esc(q)}</blockquote><figcaption><strong>{esc(n)}</strong>{esc(b)}</figcaption></figure>'
            for q, n, b in TESTIMONIALS)
        testimonials = f'''<section aria-labelledby="feedbackTitle" class="section" id="feedback">
<div class="container">
{section_head("Client voices", 'In their <span class="grad">words.</span>', title_id="feedbackTitle")}
<div class="quotes">{quotes}</div>
</div>
</section>
'''

    body = f'''{header(p, home)}

<main id="main">

<section aria-labelledby="heroTitle" class="hero" id="home">
<div aria-hidden="true" class="hero-bg"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="grid-fade"></span></div>
<div class="container hero-copy">
<a class="hero-pill" href="#contact"><span class="hp-new">Free</span>Website audit for your business {ARROW}</a>
<h1 class="hero-title" id="heroTitle">Marketing that gets<br/>your business <span class="grad">chosen.</span></h1>
<p class="hero-lead">{esc(HOME["hero_lead"])}</p>
<div class="actions center">
{btn("Get a free website audit", "#contact", "btn-primary btn-lg")}
{btn("Explore services", "#services", "btn-outline btn-lg")}
</div>
<ul aria-label="At a glance" class="hero-points">
<li>{CHECK}Founded in Chennai, 2025</li>
<li>{CHECK}8 service areas, one team</li>
<li>{CHECK}Work directly with the founder</li>
</ul>
</div>
<div class="container hero-stage">
{hero_dashboard(p)}
</div>
</section>

<section aria-label="Platforms we work with" class="platforms">
<div class="container">
<p>Platforms we build and run on</p>
<div class="plat-mask"><ul class="plat-track">{platforms}{platforms}</ul></div>
</div>
</section>

<section aria-labelledby="servicesTitle" class="section" id="services">
<div class="container">
{section_head("Services", 'Everything you need to <span class="grad">grow online.</span>', "Eight services, planned together by one team. Pick one, or let us run the whole system.", title_id="servicesTitle")}
<div class="svc-grid">
{cards}</div>
</div>
</section>

<section aria-labelledby="processTitle" class="section tint" id="process">
<div class="container">
{section_head("Process", 'From audit to growth, <span class="grad">in four steps.</span>', "Every project starts with your business goals and ends with numbers you can check.", title_id="processTitle")}
<div class="process" data-reveal="">
<div aria-label="Process steps" class="ptabs" role="tablist">
{tabs}</div>
<div class="ppanels">
{panels}</div>
</div>
</div>
</section>

<section aria-labelledby="workTitle" class="section" id="work">
<div class="container">
<div class="work-head">
{section_head("Work", 'Projects built <span class="grad">to deliver.</span>', "A live reporting demo and concept projects that show how we think. Client case studies are added as clients approve them.", center=False, title_id="workTitle")}
<div aria-label="Filter projects" class="filters" role="group">
<button aria-pressed="true" data-filter="all" type="button">All</button>
<button aria-pressed="false" data-filter="web" type="button">Websites</button>
<button aria-pressed="false" data-filter="brand" type="button">Branding</button>
<button aria-pressed="false" data-filter="seo" type="button">SEO &amp; data</button>
</div>
</div>
<div class="work-grid">
{work}</div>
</div>
</section>

<section aria-labelledby="founderTitle" class="section" id="founder">
<div class="container">
<div class="founder-card">
<div class="founder-media" data-reveal="">
<div class="founder-photo img-wrap">
<img alt="S. Saktheeswaran, Founder and Managing Director of Astra Nexora, at his desk" class="lqip" decoding="async" height="900" loading="lazy" sizes="(min-width: 1001px) 36vw, 92vw" src="assets/founder/sakthi-desk-w720.webp" srcset="assets/founder/sakthi-desk-w480.webp 480w, assets/founder/sakthi-desk-w720.webp 720w" width="720"/>
</div>
<div class="founder-badge"><span class="fb-photo img-wrap"><img alt="" class="lqip" decoding="async" height="900" loading="lazy" sizes="64px" src="assets/founder/sakthi-chair-w480.webp" width="720"/></span><span><strong>{esc(f["name"])}</strong><small>{esc(f["role"])}</small></span></div>
</div>
<div class="founder-copy" data-reveal="">
{pill("Meet the founder")}
<h2 class="h2" id="founderTitle">The vision behind <span class="grad">Astra Nexora.</span></h2>
{bio}
<ol class="founder-steps">
{timeline}
</ol>
<div class="actions">
{btn("Connect on LinkedIn", f["linkedin"], "btn-dark", target=True)}
{btn("Talk to Sakthi", WA, "btn-outline", target=True)}
</div>
</div>
</div>
</div>
</section>

<section aria-labelledby="whyTitle" class="section tint" id="why">
<div class="container">
{section_head("Why Astra Nexora", 'Not your typical <span class="grad">agency.</span>', "How we work differently, side by side.", title_id="whyTitle")}
<div aria-label="Typical agency compared with Astra Nexora" class="compare" role="table">
<div class="cmp-row cmp-head" role="row"><span role="columnheader"></span><span role="columnheader">Typical agency</span><span class="cmp-us-head" role="columnheader">{logo()}<span class="visually-hidden">Astra Nexora</span></span></div>
{rows}
</div>
</div>
</section>

<section aria-labelledby="auditTitle" class="section" id="audit">
<div class="container">
<div class="audit-card" data-reveal="">
<div aria-hidden="true" class="audit-glow"></div>
<div class="audit-copy">
<span class="pill on-dark"><i aria-hidden="true"></i>Free · no obligation</span>
<h2 id="auditTitle">Find out what's holding your website back.</h2>
<p>Send us your website and we'll check the six things that decide whether visitors find you, trust you and get in touch.</p>
{btn("Get my free audit", "#contact", "btn-white btn-lg")}
</div>
<ul class="audit-list">{audit_list}</ul>
</div>
</div>
</section>

{testimonials}{faq_section(HOME["faqs"], 'Questions, <span class="grad">answered.</span>', p)}

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
    fact_html = "\n".join(f'<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k, v in facts)
    return f'''<section class="page-hero" id="home">
<div aria-hidden="true" class="hero-bg"><span class="blob b1"></span><span class="blob b2"></span><span class="grid-fade"></span></div>
<div class="container ph-grid">
<div class="ph-copy">
<nav aria-label="Breadcrumb" class="breadcrumb">{crumb_html}</nav>
{pill(kicker)}
<h1 class="ph-title">{h1}</h1>
<p class="hero-lead">{lead}</p>
<div class="actions">{actions}</div>
</div>
<div class="ph-media img-wrap" data-tilt="">{image_html}</div>
</div>
<div class="container">
<dl class="ph-facts">
{fact_html}
</dl>
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

    h1 = s["h1"].replace("<em>", '<span class="grad">').replace("</em>", "</span>")
    hero = page_hero(
        p, home,
        [("Home", home), ("Services", f"{home}#services"), (s["nav"], None)],
        f"Service {index:02d} · {s['nav']}", h1, esc(s["lead"]),
        btn("Get a free consultation", f"{home}#contact", "btn-primary") + btn("Chat on WhatsApp", WA, "btn-outline", target=True),
        img(s["hero"], s["hero_alt"], "(min-width: 1001px) 44vw, 92vw", p, eager=True) + f'<span class="ph-chip">{icon(s["slug"])}{esc(s["nav"])}</span>',
        s["facts"])

    includes = "\n".join(
        f'<li class="inc-card spot" data-reveal=""><span class="inc-num">{i:02d}</span><h3>{esc(n)}</h3><p>{esc(d)}</p></li>'
        for i, (n, d) in enumerate(s["includes"], 1))
    steps = "\n".join(
        f'<li class="step-card" data-reveal=""><span class="step-num">{i:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></li>'
        for i, (t, d) in enumerate(s["process"], 1))
    deliver = "".join(f"<li>{CHECK}{esc(d)}</li>" for d in s["deliverables"])
    ideal = "".join(f"<li>{esc(t)}</li>" for t in s["ideal"])

    related = ""
    for slug in s["related"]:
        r = SERVICE_BY_SLUG[slug]
        related += f'''<a class="svc-card spot" data-reveal="" href="{r["slug"]}.html">
<span class="svc-icon">{icon(r["slug"])}</span>
<h3>{esc(r["title"])}</h3>
<p>{esc(SERVICE_TAGLINES[r["slug"]])}</p>
<span class="svc-more">Explore {ARROW}</span>
</a>
'''
    prev_s = SERVICES[(index - 2) % len(SERVICES)]
    next_s = SERVICES[index % len(SERVICES)]

    body = f'''{header(p, home)}

<main id="main">

{hero}

<section aria-labelledby="overviewTitle" class="section">
<div class="container split">
<div data-reveal="">
{pill("Why it matters")}
<h2 class="h2" id="overviewTitle">Built for <span class="grad">real growth.</span></h2>
<p class="lead-lg">{esc(s["overview"][0])}</p>
<p class="body-muted">{esc(s["overview"][1])}</p>
<div class="ideal"><small>Ideal for</small><ul class="chips">{ideal}</ul></div>
</div>
<div class="split-media img-wrap" data-reveal="">{img(s["side"], s["side_alt"], "(min-width: 1001px) 44vw, 92vw", p)}</div>
</div>
</section>

<section aria-labelledby="includesTitle" class="section tint">
<div class="container">
{section_head("What's included", f'Everything in <span class="grad">{esc(s["nav"])}.</span>', "Choose the pieces you need, or let us run the whole service for you.", title_id="includesTitle")}
<ul class="inc-grid">
{includes}
</ul>
</div>
</section>

<section aria-labelledby="processTitle" class="section">
<div class="container">
{section_head("How we work", 'A clear process, <span class="grad">start to finish.</span>', "You always know what's happening, what's next and what it's achieving.", title_id="processTitle")}
<ol class="step-grid">
{steps}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="section">
<div class="container">
<div class="deliver-card" data-reveal="">
<div>
<span class="pill on-dark"><i aria-hidden="true"></i>Deliverables</span>
<h2 id="deliverTitle">What you get.</h2>
<p>Every engagement comes with clear deliverables and regular reporting.</p>
{btn("Start a project", f"{home}#contact", "btn-white")}
</div>
<ul class="deliver-list">{deliver}</ul>
</div>
</div>
</section>

{faq_section(s["faqs"], f'Questions about <span class="grad">{esc(s["nav"])}.</span>', p)}

<section aria-labelledby="relatedTitle" class="section tint">
<div class="container">
{section_head("Related", 'Works well <span class="grad">with.</span>', title_id="relatedTitle")}
<div class="related-grid">
{related}</div>
<nav aria-label="More services" class="pager">
<a href="{prev_s["slug"]}.html"><small>← Previous</small><strong>{esc(prev_s["nav"])}</strong></a>
<a href="{next_s["slug"]}.html"><small>Next →</small><strong>{esc(next_s["nav"])}</strong></a>
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
        btn("Start a similar project", f"{home}#contact", "btn-primary") + btn(f"See {svc['nav']}", f"../services/{svc['slug']}.html", "btn-outline"),
        img(pr["hero"], pr["hero_alt"], "(min-width: 1001px) 44vw, 92vw", p, eager=True) + '<span class="ph-chip">Concept project</span>',
        pr["meta"])

    steps = "\n".join(
        f'<li class="step-card" data-reveal=""><span class="step-num">{i:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></li>'
        for i, (t, d) in enumerate(pr["approach"], 1))
    deliver = "".join(f"<li>{CHECK}{esc(d)}</li>" for d in pr["deliverables"])
    goals = "\n".join(f'<li class="inc-card" data-reveal=""><span class="inc-num">{i:02d}</span><h3>{esc(g)}</h3></li>' for i, g in enumerate(pr["goals"], 1))
    nxt = PROJECTS[index % len(PROJECTS)]

    body = f'''{header(p, home)}

<main id="main">

{hero}

<div class="container"><p class="concept-note"><strong>Concept project.</strong> This shows how we would approach this kind of brief. It is not a client case study and has no client results.</p></div>

<section aria-labelledby="challengeTitle" class="section">
<div class="container split">
<div data-reveal="">
{pill("The brief")}
<h2 class="h2" id="challengeTitle">The <span class="grad">challenge.</span></h2>
<p class="lead-lg">{esc(pr["challenge"])}</p>
</div>
<div class="split-media img-wrap" data-reveal="">{img(pr["second"], pr["second_alt"], "(min-width: 1001px) 44vw, 92vw", p)}</div>
</div>
</section>

<section aria-labelledby="approachTitle" class="section tint">
<div class="container">
{section_head("Our approach", 'How we\'d <span class="grad">solve it.</span>', "Four steps, each with a clear outcome before the next one starts.", title_id="approachTitle")}
<ol class="step-grid">
{steps}
</ol>
</div>
</section>

<section aria-labelledby="deliverTitle" class="section">
<div class="container">
<div class="deliver-card" data-reveal="">
<div>
<span class="pill on-dark"><i aria-hidden="true"></i>Scope</span>
<h2 id="deliverTitle">What we'd deliver.</h2>
<p>Part of our {esc(svc["title"])} service.</p>
{btn(f"Explore {svc['nav']}", f"../services/{svc['slug']}.html", "btn-white")}
</div>
<ul class="deliver-list">{deliver}</ul>
</div>
</div>
</section>

<section aria-labelledby="goalsTitle" class="section">
<div class="container">
{section_head("Success measures", 'What success <span class="grad">looks like.</span>', "The goals we'd set and report against for a project like this.", title_id="goalsTitle")}
<ul class="inc-grid goals">
{goals}
</ul>
</div>
</section>

<section class="section">
<div class="container">
<a class="next-card" data-reveal="" href="{nxt["slug"]}.html">
<div class="next-media img-wrap">{img(nxt["hero"], "", "(min-width: 1001px) 40vw, 92vw", p)}</div>
<div class="next-copy"><small>Next project</small><strong>{esc(nxt["title"])}</strong><span class="work-go">View project {ARROW}</span></div>
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
