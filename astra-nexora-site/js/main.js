/* =====================================================
   ASTRA NEXORA — site behaviour (v12)
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

if (!location.hash) window.scrollTo(0, 0);

window.addEventListener("pageshow", event => {
    document.querySelector(".page-curtain")?.classList.remove("is-active");
    if (event.persisted && !location.hash) window.scrollTo(0, 0);
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

function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
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
   HERO — intro and gentle photo parallax
===================================================== */

if (animate && document.querySelector(".hero-frame")) {
    gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".chev-l i", { x: 30, autoAlpha: 0, duration: 0.8, stagger: 0.03 }, 0)
        .from(".chev-r i", { x: -30, autoAlpha: 0, duration: 0.8, stagger: 0.03 }, 0)
        .from(".ht-word", { yPercent: 60, autoAlpha: 0, duration: 1.3, stagger: 0.12 }, 0.1)
        .from(".ht-orb", { scale: 0.4, rotate: -90, autoAlpha: 0, duration: 1.4 }, 0.2)
        .from(".hero-lead, .hero-actions", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.45)
        .from(".hero-frame .pixels i", { scale: 0, duration: 0.6, stagger: 0.05, ease: "back.out(2)" }, 0.3)
        .from(".hero-stats li", { x: -30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.6);

    gsap.fromTo(".hero-photo img", { yPercent: -8, scale: 1.15 }, {
        yPercent: 8, scale: 1.15, ease: "none",
        scrollTrigger: { trigger: ".hero-photo", start: "top bottom", end: "bottom top", scrub: true }
    });
}

if (animate) {
    // Black-and-white photos drift slightly as they pass
    document.querySelectorAll(".about-photo img, .ph-photo img").forEach(img => {
        gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, {
            yPercent: 5, scale: 1.1, ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    const founderImg = document.querySelector(".founder-photo img");
    if (founderImg) {
        gsap.fromTo(founderImg, { yPercent: -6, scale: 1.12 }, {
            yPercent: 6, scale: 1.12, ease: "none",
            scrollTrigger: { trigger: ".founder-frame", start: "top bottom", end: "bottom top", scrub: true }
        });
    }

    // Service numbers slide up as each column arrives
    gsap.utils.toArray(".svc-num").forEach(num => {
        gsap.from(num, {
            yPercent: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: num, start: "top 92%", once: true }
        });
    });

    // Marquee: speeds up while you scroll
    const tracks = document.querySelectorAll(".mq-track");
    if (tracks.length && lenis) {
        lenis.on("scroll", e => {
            const rate = 1 + Math.min(Math.abs(e.velocity) / 6, 4);
            tracks.forEach(t => t.getAnimations().forEach(a => { a.playbackRate = rate; }));
        });
    }
}


/* =====================================================
   STATS — count up once in view
===================================================== */

(function () {
    const nums = Array.from(document.querySelectorAll(".hero-stats strong")).filter(el => /^\d+$/.test(el.textContent.trim()));
    if (!nums.length || reduceMotion || !("IntersectionObserver" in window)) return;

    nums.forEach(el => {
        const target = el.textContent.trim();
        const to = parseInt(target, 10);
        const from = to > 1000 ? to - 25 : 0;
        const pad = target.length;
        el.textContent = String(from).padStart(pad, "0");
        new IntersectionObserver((entries, obs) => {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            const start = performance.now();
            (function step(now) {
                const p = Math.min((now - start) / 1600, 1);
                const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
                el.textContent = String(v).padStart(pad, "0");
                if (p < 1) requestAnimationFrame(step);
            })(start);
        }).observe(el);
    });
})();


/* =====================================================
   WORK SLIDER — buttons, arrow keys, swipe, autoplay
===================================================== */

(function () {
    const slider = document.querySelector("[data-slider]");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".slide"));
    const count = slider.querySelector(".slider-count b");
    let current = 0;
    let timer = null;

    function show(i) {
        current = (i + slides.length) % slides.length;
        slides.forEach((slide, k) => {
            const on = k === current;
            slide.classList.toggle("is-active", on);
            slide.setAttribute("aria-hidden", String(!on));
            slide.querySelectorAll("a").forEach(a => { a.tabIndex = on ? 0 : -1; });
        });
        if (count) count.textContent = String(current + 1).padStart(2, "0");
    }

    function start() {
        if (reduceMotion) return;
        stop();
        timer = setInterval(() => show(current + 1), 6000);
    }

    function stop() {
        clearInterval(timer);
    }

    slider.querySelector(".sl-prev").addEventListener("click", () => { show(current - 1); start(); });
    slider.querySelector(".sl-next").addEventListener("click", () => { show(current + 1); start(); });
    slider.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") { show(current - 1); start(); }
        if (e.key === "ArrowRight") { show(current + 1); start(); }
    });

    let x0 = null;
    slider.addEventListener("pointerdown", e => { x0 = e.clientX; });
    slider.addEventListener("pointerup", e => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        if (Math.abs(dx) > 50) { show(current + (dx < 0 ? 1 : -1)); start(); }
        x0 = null;
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);

    show(0);
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(entries => { entries[0].isIntersecting ? start() : stop(); }, { threshold: 0.3 }).observe(slider);
    }
})();


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

        window.open("https://wa.me/918838417707?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
})();

})();
