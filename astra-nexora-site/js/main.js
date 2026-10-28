/* =====================================================
   ASTRA NEXORA — site behaviour (v13)
   Works without the vendor libraries (GSAP, ScrollTrigger,
   Lenis): every animated element has a CSS fallback state,
   and reduced-motion visitors get the static page.
===================================================== */

(function () {

"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const animate = hasGsap && !reduceMotion;

if (hasGsap) gsap.registerPlugin(ScrollTrigger);


/* =====================================================
   ALWAYS OPEN AT THE TOP
   Pages open at their hero unless the link asked for a
   section (#contact etc.), including on back/forward.
===================================================== */

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// scrollIntoView also scrolls any page this site is embedded in (a preview
// frame), which window.scrollTo alone cannot reach.
function toPageTop() {
    if (location.hash && location.hash !== "#home") return;
    window.scrollTo(0, 0);
    const top = document.querySelector(".topbar, .dash-topbar") || document.body;
    if (top && top.scrollIntoView) top.scrollIntoView({ block: "start", behavior: "instant" });
}

toPageTop();
document.addEventListener("DOMContentLoaded", toPageTop);
window.addEventListener("load", toPageTop);

window.addEventListener("pageshow", event => {
    document.querySelector(".page-curtain")?.classList.remove("is-active");
    if (event.persisted) toPageTop();
});


/* =====================================================
   SMOOTH SCROLL + ANCHORS
===================================================== */

let lenis = null;

if (animate && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target, immediate) {
    const offset = target === 0 ? 0 : -96;
    if (lenis) {
        lenis.scrollTo(target, { offset, immediate: !!immediate, duration: 1.2 });
        return;
    }
    const top = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate || reduceMotion ? "auto" : "smooth" });
}

document.addEventListener("click", event => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || event.defaultPrevented) return;

    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || url.origin !== location.origin || !url.hash) return;

    const target = url.hash === "#home" ? 0 : document.querySelector(url.hash);
    if (target === null) return;

    event.preventDefault();
    setMenu(false);
    scrollToTarget(target);
    history.pushState(null, "", url.hash);
});

window.addEventListener("load", () => {
    if (hasGsap) ScrollTrigger.refresh();
    if (location.hash && location.hash !== "#home") {
        const target = document.querySelector(location.hash);
        if (target) requestAnimationFrame(() => scrollToTarget(target, true));
    }
});


/* =====================================================
   PAGE TRANSITIONS — a short white fade between pages
===================================================== */

const curtain = document.querySelector(".page-curtain");

document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || !curtain || reduceMotion || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname) return;

    event.preventDefault();
    curtain.classList.add("is-active");
    setTimeout(() => { location.href = url.href; }, 260);
});


/* =====================================================
   HEADER + MOBILE MENU
===================================================== */

const header = document.getElementById("header");

const toTop = document.querySelector(".to-top");

// The header sits over the hero, then sticks as a black bar once the hero is passed
function onScroll() {
    if (header) header.classList.toggle("stuck", window.scrollY > 260);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 700);
}

if (toTop) toTop.addEventListener("click", () => scrollToTarget(0));

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (menuToggle) {
    menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
}

if (mobileMenu) {
    mobileMenu.addEventListener("click", event => {
        if (event.target.closest("a")) setMenu(false);
    });
}

document.addEventListener("click", event => {
    if (mobileMenu && mobileMenu.classList.contains("open") && !event.target.closest(".site-header")) setMenu(false);
});

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (mobileMenu && mobileMenu.classList.contains("open")) {
        setMenu(false);
        menuToggle.focus();
    }
    const dropdown = document.activeElement && document.activeElement.closest(".nav-dropdown");
    if (dropdown) dropdown.querySelector(".nav-dropdown-toggle").focus();
});

window.matchMedia("(min-width: 1101px)").addEventListener("change", e => {
    if (e.matches) setMenu(false);
});

// Active link for the home page sections
(function () {
    if (!document.body.classList.contains("home")) return;
    const links = Array.from(document.querySelectorAll('.desktop-nav a.nav-link[href^="#"]:not([href="#home"])'));
    const sections = links.map(link => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);

    function update() {
        let current = "";
        sections.forEach(section => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.35) current = section.id;
        });
        links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + current));
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
})();


/* =====================================================
   IMAGES — blur-up placeholders
===================================================== */

document.querySelectorAll("img.lqip").forEach(img => {
    if (img.dataset.lqip && img.parentElement) {
        img.parentElement.style.backgroundImage = "url(" + img.dataset.lqip + ")";
    }
    const done = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) done();
    else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
    }
});


/* =====================================================
   REVEALS
===================================================== */

if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    document.querySelectorAll("[data-reveal]").forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute("data-reveal"));
        el.style.transitionDelay = (siblings.indexOf(el) % 4) * 80 + "ms";
        io.observe(el);
    });
} else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-in"));
}


/* =====================================================
   HERO — intro and gentle parallax
===================================================== */

if (animate && document.querySelector(".hero")) {
    gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-panel", { clipPath: "inset(0 100% 0 0)", duration: 1.2, ease: "expo.inOut" }, 0)
        .from(".hero-photo", { clipPath: "inset(0 0 0 100%)", duration: 1.4, ease: "expo.inOut" }, 0.15)
        .from(".hero-photo img", { scale: 1.25, duration: 2 }, 0.3)
        .from(".hero-cats span, .breadcrumb", { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.75)
        .fromTo(".hero-title .ln > span", { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.12 }, 0.85)
        .from(".hero-title .box", { backgroundColor: "rgba(10,15,44,0)", duration: 0.8 }, 1.3)
        .from(".hero-lead, .hero-copy .actions .btn", { y: 26, autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.05)
        .from(".hero-deco .shapes svg", { scale: 0, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "back.out(2)" }, 1.1)
        .from(".hero-ghost", { xPercent: -20, autoAlpha: 0, duration: 1.8 }, 0.9)
        .from(".site-header .brand, .site-header .nav-link, .header-tools > *", { y: -20, autoAlpha: 0, duration: 0.8, stagger: 0.04 }, 0.6);

    gsap.to(".hero-photo img", {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero-ghost", {
        xPercent: 18, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
}

if (animate) {
    // Collage: the small photo and the triangles drift against the big one
    document.querySelectorAll(".collage").forEach(collage => {
        const st = { trigger: collage, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(collage.querySelector(".col-small"), { y: 60 }, { y: -40, ease: "none", scrollTrigger: st });
        gsap.fromTo(collage.querySelectorAll(".tri"), { y: -40, rotate: -8 }, { y: 50, rotate: 8, ease: "none", scrollTrigger: st });
    });

    document.querySelectorAll(".process-photo img, .col-big img, .founder-desk img").forEach(img => {
        gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
            yPercent: 6, scale: 1.14, ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    // Faded card numbers rise as the cards arrive
    gsap.utils.toArray(".svc-big").forEach(num => {
        gsap.from(num, {
            yPercent: 60, autoAlpha: 0, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: num.parentElement, start: "top 88%", once: true }
        });
    });

    const fc = document.querySelector(".fc-photo");
    if (fc) {
        gsap.from(fc, {
            scale: 0.6, rotate: -20, autoAlpha: 0, duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: fc, start: "top 85%", once: true }
        });
    }
}


/* =====================================================
   FREE AUDIT FORM → WHATSAPP
   Nothing is stored; the form opens WhatsApp with the
   details filled in.
===================================================== */

(function () {
    const form = document.getElementById("auditForm");
    if (!form) return;

    function value(name) {
        const field = form.elements[name];
        return field ? field.value.trim() : "";
    }

    function setError(name, message) {
        const field = form.elements[name];
        const error = document.getElementById(name + "Error");
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (error) error.textContent = message;
    }

    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = value("name");
        const phone = value("phone");
        const company = value("company");
        const website = value("website");
        const digits = phone.replace(/\D/g, "");

        setError("name", name ? "" : "Please enter your name.");
        setError("phone", digits.length >= 10 ? "" : "Please enter a mobile number with at least 10 digits.");
        setError("company", company ? "" : "Please enter your company name.");
        setError("website", website ? "" : "Please enter your website (or type \"none\").");

        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const lines = [
            "Hi Astra Nexora, I'd like a free website audit.",
            "",
            "Name: " + name,
            "Mobile: " + phone,
            "Company: " + company,
            "Website: " + website,
            "Email: " + (value("email") || "-"),
            "Service: " + (value("service") || "-")
        ];

        const message = value("message");
        if (message) lines.push("", "Message: " + message);

        const url = "https://wa.me/918838417707?text=" + encodeURIComponent(lines.join("\n"));
        // New tab where allowed; if pop-ups are blocked, go to WhatsApp in this tab
        const tab = window.open(url, "_blank");
        if (tab) tab.opener = null;
        else window.location.href = url;
    });
})();

})();
