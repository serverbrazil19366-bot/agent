/* =====================================================
   ASTRA NEXORA — site behaviour (v11)
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

function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
}

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
    const links = Array.from(document.querySelectorAll('.desktop-nav a.nav-link[href^="#"]'));
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
   HERO — intro, counters, toasts, pointer tilt
===================================================== */

(function () {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    if (animate) {
        gsap.timeline({ defaults: { ease: "expo.out" } })
            .from(".hero-pill", { y: 16, autoAlpha: 0, duration: 1 }, 0)
            .from(".hero-title", { y: 40, autoAlpha: 0, duration: 1.3 }, 0.08)
            .from(".hero-lead, .hero-copy .actions, .hero-points", { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.25)
            .from(".hv-window", { y: 80, rotateX: 14, autoAlpha: 0, duration: 1.6, ease: "power4.out", transformPerspective: 1600 }, 0.45)
            .from(".hv-card", { y: 30, scale: 0.92, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "back.out(1.6)" }, 1);

        // The window settles flat as you scroll
        gsap.to(".hv-window", {
            rotateX: 0, ease: "none",
            scrollTrigger: { trigger: ".hero-stage", start: "top 85%", end: "top 30%", scrub: true }
        });
    }

    // Example counters (rank 14 → 3, health 0 → 92)
    function count(el) {
        const from = parseFloat(el.dataset.countFrom);
        const to = parseFloat(el.dataset.countTo);
        if (reduceMotion) { el.textContent = to; return; }
        const start = performance.now();
        const duration = 2200;
        (function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(from + (to - from) * eased);
            if (p < 1) requestAnimationFrame(step);
        })(start);
    }

    setTimeout(() => {
        hero.querySelectorAll("[data-count-to]").forEach(count);
        hero.querySelector(".hv-score")?.classList.add("is-on");
    }, reduceMotion ? 0 : 1300);

    // Rotating example WhatsApp enquiries
    const toast = hero.querySelector("[data-toasts]");
    if (toast && !reduceMotion) {
        const messages = JSON.parse(toast.dataset.toasts);
        let i = 0;
        setInterval(() => {
            toast.classList.add("swap");
            setTimeout(() => {
                i = (i + 1) % messages.length;
                toast.textContent = messages[i];
                toast.classList.remove("swap");
            }, 350);
        }, 3800);
    }

    // Pointer tilt: the window tilts, cards float at different depths
    const visual = hero.querySelector("[data-tilt]");
    if (visual && finePointer && animate) {
        const win = visual.querySelector(".hv-window");
        const cards = Array.from(visual.querySelectorAll("[data-depth]"));
        const rx = gsap.quickTo(win, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(win, "rotationY", { duration: 0.8, ease: "power3" });
        const movers = cards.map(card => ({
            depth: parseFloat(card.dataset.depth),
            x: gsap.quickTo(card, "x", { duration: 0.9, ease: "power3" }),
            y: gsap.quickTo(card, "y", { duration: 0.9, ease: "power3" })
        }));
        hero.addEventListener("pointermove", e => {
            const r = visual.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rx(-py * 6);
            ry(px * 8);
            movers.forEach(m => { m.x(px * 14 * m.depth); m.y(py * 10 * m.depth); });
        });
        hero.addEventListener("pointerleave", () => {
            rx(0); ry(0);
            movers.forEach(m => { m.x(0); m.y(0); });
        });
    }
})();


/* =====================================================
   CARD SPOTLIGHT — soft light follows the pointer
===================================================== */

if (finePointer && !reduceMotion) {
    document.querySelectorAll(".spot").forEach(card => {
        card.addEventListener("pointermove", e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - r.left) + "px");
            card.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
    });
}


/* =====================================================
   PROCESS TABS — click, arrow keys, auto-advance
===================================================== */

(function () {
    const process = document.querySelector(".process");
    if (!process) return;

    const tabs = Array.from(process.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));
    let current = 0;
    let timer = null;

    function select(i, focus) {
        current = (i + tabs.length) % tabs.length;
        tabs.forEach((tab, k) => {
            const on = k === current;
            tab.setAttribute("aria-selected", String(on));
            tab.tabIndex = on ? 0 : -1;
            panels[k].hidden = !on;
            panels[k].classList.toggle("is-active", on);
        });
        // Restart the progress line on the active tab
        const bar = tabs[current].querySelector("i");
        if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
        if (focus) tabs[current].focus();
    }

    function start() {
        if (reduceMotion) return;
        stop();
        timer = setInterval(() => select(current + 1), 6000);
    }

    function stop() {
        clearInterval(timer);
        timer = null;
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => { select(i); start(); });
        tab.addEventListener("keydown", e => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(current + 1, true); start(); }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(current - 1, true); start(); }
        });
    });

    process.addEventListener("mouseenter", () => { stop(); process.classList.add("is-paused"); });
    process.addEventListener("mouseleave", () => { start(); process.classList.remove("is-paused"); });
    process.addEventListener("focusin", () => { stop(); process.classList.add("is-paused"); });

    // Only run the timer while the section is on screen
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(entries => {
            entries[0].isIntersecting ? start() : stop();
        }, { threshold: 0.3 }).observe(process);
    }
})();


/* =====================================================
   WORK FILTER
===================================================== */

(function () {
    const buttons = document.querySelectorAll(".filters [data-filter]");
    const cards = document.querySelectorAll(".work-card[data-kind]");
    if (!buttons.length) return;

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
            cards.forEach(card => {
                const show = filter === "all" || card.dataset.kind === filter;
                card.classList.toggle("is-hidden", !show);
                if (show && !reduceMotion && hasGsap) {
                    gsap.fromTo(card, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" });
                }
            });
            if (hasGsap) ScrollTrigger.refresh();
        });
    });
})();


/* =====================================================
   SCROLL MOTION (GSAP)
===================================================== */

if (animate) {
    // Inner page hero image settles in
    document.querySelectorAll(".ph-media").forEach(media => {
        gsap.from(media, { y: 40, rotate: 2, autoAlpha: 0, duration: 1.4, ease: "expo.out", delay: 0.2 });
        const image = media.querySelector("img");
        if (image) gsap.fromTo(image, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: "expo.out", delay: 0.2 });
    });

    // Founder photo: gentle parallax
    const founderImg = document.querySelector(".founder-photo img");
    if (founderImg) {
        gsap.fromTo(founderImg, { yPercent: -5, scale: 1.1 }, {
            yPercent: 5, scale: 1.1, ease: "none",
            scrollTrigger: { trigger: ".founder-photo", start: "top bottom", end: "bottom top", scrub: true }
        });
    }

    // Comparison: the "us" column checks pop in one by one
    gsap.utils.toArray(".cmp-us .check").forEach(check => {
        gsap.from(check, {
            scale: 0, duration: 0.6, ease: "back.out(2)",
            scrollTrigger: { trigger: check, start: "top 90%", once: true }
        });
    });
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

        window.open("https://wa.me/918838417707?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
})();

})();
