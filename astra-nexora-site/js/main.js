/* =====================================================
   ASTRA NEXORA — site behaviour
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
    const offset = target === 0 ? 0 : -80;
    if (lenis) {
        lenis.scrollTo(target, { offset, immediate: !!immediate, duration: 1.3 });
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

// Arriving from another page with a #section: land on it once layout has settled
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
    setTimeout(() => { location.href = url.href; }, 300);
});


/* =====================================================
   HEADER — hairline once scrolled, reading progress
===================================================== */

const header = document.getElementById("header");
const progressBar = document.querySelector(".scroll-progress span");

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (progressBar) progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();


/* =====================================================
   MOBILE MENU + SERVICES DROPDOWN
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? "hidden" : "";
}

if (menuToggle) {
    menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
}

if (mobileMenu) {
    mobileMenu.addEventListener("click", event => {
        if (event.target.closest("a")) setMenu(false);
    });
}

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


/* =====================================================
   ACTIVE NAV (home page sections)
===================================================== */

(function () {
    if (!document.body.classList.contains("home")) return;
    const links = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
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
   SPLIT HEADINGS + REVEALS
===================================================== */

function splitWords(element) {

    let index = 0;

    function wrap(word, wrapper) {
        const outer = document.createElement("span");
        const inner = document.createElement("span");
        outer.className = "w";
        inner.style.setProperty("--i", index++);
        if (wrapper) {
            const clone = wrapper.cloneNode(false);
            clone.textContent = word;
            inner.appendChild(clone);
        } else {
            inner.textContent = word;
        }
        outer.appendChild(inner);
        return outer;
    }

    function walk(node, wrapper) {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const fragment = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach(part => {
                    if (!part) return;
                    fragment.appendChild(/^\s+$/.test(part) ? document.createTextNode(" ") : wrap(part, wrapper));
                });
                child.replaceWith(fragment);
            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
                // Each word keeps its own copy of the <em>, so the serif accent survives
                const holder = document.createDocumentFragment();
                walk(child, child);
                while (child.firstChild) holder.appendChild(child.firstChild);
                child.replaceWith(holder);
            }
        });
    }

    element.setAttribute("aria-label", element.textContent.replace(/\s+/g, " ").trim());
    walk(element, null);
    Array.from(element.children).forEach(child => child.setAttribute("aria-hidden", "true"));
    element.classList.add("split-ready");
}

const revealObserver = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add(entry.target.classList.contains("split-ready") ? "split-in" : "is-in");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
    : null;

if (revealObserver) {
    document.querySelectorAll("[data-split]").forEach(el => {
        splitWords(el);
        revealObserver.observe(el);
    });
    document.querySelectorAll("[data-reveal]").forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute("data-reveal"));
        el.style.transitionDelay = (siblings.indexOf(el) % 4) * 90 + "ms";
        revealObserver.observe(el);
    });
} else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-in"));
}


/* =====================================================
   HERO INTRO
===================================================== */

(function () {
    const lines = document.querySelectorAll(".hero-title .line > span");
    if (!lines.length) return;

    if (!animate) {
        lines.forEach(line => { line.style.transform = "none"; });
        return;
    }

    gsap.timeline({ defaults: { ease: "expo.out" } })
        .fromTo(lines, { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.4, stagger: 0.1 }, 0.1)
        .from(".hero-meta > div", { y: 14, autoAlpha: 0, duration: 1, stagger: 0.06 }, 0)
        .from(".hero-lead, .hero-foot .actions", { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.5)
        .from("[data-hero-media]", { y: 60, autoAlpha: 0, duration: 1.4, ease: "power4.out" }, 0.6);
})();


/* =====================================================
   SCROLL-DRIVEN MOTION (GSAP)
===================================================== */

if (animate) {

    const mm = gsap.matchMedia();

    // Hero film: the frame widens to the full page as you scroll into it
    const heroMedia = document.querySelector(".hero [data-hero-media]");
    if (heroMedia) {
        mm.add("(min-width: 1001px)", () => {
            const tween = gsap.fromTo(heroMedia,
                { clipPath: "inset(0% 8% 0% 8% round 14px)" },
                {
                    clipPath: "inset(0% 0% 0% 0% round 14px)", ease: "none",
                    scrollTrigger: { trigger: heroMedia, start: "top 90%", end: "top 20%", scrub: true }
                });
            return () => tween.kill();
        });
        gsap.fromTo(heroMedia.querySelectorAll("img, video"), { yPercent: -5, scale: 1.1 }, {
            yPercent: 5, scale: 1.1, ease: "none",
            scrollTrigger: { trigger: heroMedia, start: "top bottom", end: "bottom top", scrub: true }
        });
    }

    // Inner page hero image: opens from the centre
    document.querySelectorAll(".page-media").forEach(media => {
        gsap.fromTo(media,
            { clipPath: "inset(12% 10% 12% 10% round 14px)" },
            { clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.6, ease: "expo.out", delay: 0.2 });
        const image = media.querySelector("img");
        if (image) gsap.fromTo(image, { scale: 1.2 }, { scale: 1, duration: 2, ease: "expo.out", delay: 0.2 });
    });

    // Statement: words light up as you read down
    document.querySelectorAll("[data-statement]").forEach(text => {
        const words = text.textContent.trim().split(/\s+/);
        text.innerHTML = words.map(w => '<span class="sw">' + w + "</span>").join(" ");
        const spans = text.querySelectorAll(".sw");
        ScrollTrigger.create({
            trigger: text, start: "top 80%", end: "bottom 45%", scrub: true,
            onUpdate: self => {
                const lit = Math.round(self.progress * spans.length);
                spans.forEach((s, i) => { s.style.opacity = i < lit ? "1" : ""; });
            }
        });
    });

    // Parallax frames and images
    document.querySelectorAll("[data-parallax]").forEach(el => {
        const amount = parseFloat(el.dataset.parallax) * 100;
        gsap.fromTo(el, { yPercent: -amount }, {
            yPercent: amount, ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    document.querySelectorAll(".parallax-img, [data-parallax-img]").forEach(img => {
        gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
            yPercent: 6, scale: 1.14, ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    // Case images settle as they arrive
    gsap.utils.toArray(".case-media img").forEach(image => {
        gsap.fromTo(image, { scale: 1.15 }, {
            scale: 1, ease: "none",
            scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "center center", scrub: true }
        });
    });

    // Founder: photo wipes up, second photo slides in, name underlined, timeline steps in
    const founder = document.querySelector("[data-founder-media]");
    if (founder) {
        const photo = founder.querySelector(".founder-photo");
        gsap.timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: founder, start: "top 78%", once: true }
        })
            .fromTo(photo, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 })
            .from(photo, { scale: 1.06, duration: 1.8 }, 0)
            .from(".founder-photo-alt", { x: 60, y: 50, rotate: 6, autoAlpha: 0, duration: 1.4 }, 0.5);

        if (finePointer) {
            const rx = gsap.quickTo(photo, "rotationX", { duration: 0.6, ease: "power3" });
            const ry = gsap.quickTo(photo, "rotationY", { duration: 0.6, ease: "power3" });
            founder.addEventListener("pointermove", e => {
                const r = founder.getBoundingClientRect();
                ry(((e.clientX - r.left) / r.width - 0.5) * 8);
                rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
            });
            founder.addEventListener("pointerleave", () => { rx(0); ry(0); });
        }

        gsap.to(".founder-underline path", {
            strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut",
            scrollTrigger: { trigger: ".founder-role", start: "top 85%", once: true }
        });

        gsap.from("[data-timeline] li", {
            x: -24, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
            scrollTrigger: { trigger: "[data-timeline]", start: "top 85%", once: true }
        });
    }

    // Next project banner drifts
    document.querySelectorAll(".next-bg").forEach(bg => {
        gsap.fromTo(bg, { yPercent: -6 }, {
            yPercent: 6, ease: "none",
            scrollTrigger: { trigger: bg.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

} else {
    document.querySelectorAll(".founder-underline path").forEach(path => { path.style.strokeDashoffset = "0"; });
}


/* =====================================================
   SERVICES — the row's photo follows the pointer
===================================================== */

(function () {
    const preview = document.querySelector(".svc-preview");
    const rows = document.querySelectorAll(".svc-row a[data-preview]");
    if (!preview || !rows.length || !finePointer || reduceMotion) return;

    const image = preview.querySelector("img");
    let x = 0, y = 0, tx = 0, ty = 0, running = false;

    function tick() {
        x += (tx - x) * 0.14;
        y += (ty - y) * 0.14;
        preview.style.transform = "translate(" + (x - 150) + "px," + (y - 112) + "px)";
        if (running) requestAnimationFrame(tick);
    }

    rows.forEach(row => {
        row.addEventListener("pointerenter", e => {
            image.src = row.dataset.preview;
            tx = x = e.clientX;
            ty = y = e.clientY;
            preview.classList.add("is-on");
            if (!running) { running = true; requestAnimationFrame(tick); }
        });
        row.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; });
        row.addEventListener("pointerleave", () => {
            preview.classList.remove("is-on");
            running = false;
        });
    });

    // Warm the cache so the first hover isn't blank
    window.addEventListener("load", () => {
        rows.forEach(row => { const i = new Image(); i.src = row.dataset.preview; });
    }, { once: true });
})();


/* =====================================================
   HERO VIDEO (desktop only, after the photo has painted)
===================================================== */

(function () {
    const video = document.querySelector(".hero-video");
    const toggle = document.querySelector(".hero-video-toggle");
    const connection = navigator.connection || {};

    if (!video || !video.dataset.src || reduceMotion || connection.saveData ||
        !window.matchMedia("(min-width: 769px)").matches) return;

    function setPaused(paused) {
        paused ? video.pause() : video.play().catch(() => {});
        toggle.setAttribute("aria-pressed", String(paused));
        toggle.querySelector(".hero-video-toggle-label").textContent = paused ? "Play" : "Pause";
    }

    window.addEventListener("load", () => {
        video.preload = "auto";
        video.src = video.dataset.src;
        video.play().then(() => {
            video.classList.add("is-playing");
            if (toggle) toggle.hidden = false;
        }).catch(() => {});
        video.addEventListener("error", () => video.remove(), { once: true });
    }, { once: true });

    if (toggle) toggle.addEventListener("click", () => setPaused(!video.paused));
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
