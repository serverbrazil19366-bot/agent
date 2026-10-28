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

    // Hero: the film drifts and zooms slowly, the copy lifts away as you leave
    const heroBg = document.querySelector(".hero-bg");
    if (heroBg) {
        gsap.to(heroBg, {
            yPercent: 18, scale: 1.08, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
        gsap.to("[data-hero-content]", {
            y: -80, autoAlpha: 0, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "30% top", end: "90% top", scrub: true }
        });
        gsap.to(".spin-badge", {
            y: 120, rotate: 90, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
    }

    // Services: the showcase pins and shows one service at a time
    mm.add("(min-width: 1001px)", () => {
        const showcase = document.querySelector(".showcase");
        if (!showcase) return;
        const items = Array.from(showcase.querySelectorAll(".sc-item"));
        const images = Array.from(showcase.querySelectorAll(".sc-img"));
        const count = showcase.querySelector(".sc-count");
        const track = showcase.querySelector(".sc-track i");
        const n = items.length;
        let current = -1;

        function show(i) {
            if (i === current) return;
            current = i;
            items.forEach((item, k) => item.classList.toggle("is-active", k === i));
            images.forEach((image, k) => image.classList.toggle("is-active", k === i));
            if (count) count.textContent = String(i + 1).padStart(2, "0");
            if (track) track.style.setProperty("--p", ((i + 1) / n).toFixed(3));
        }

        showcase.classList.add("is-pinned");
        show(0);
        const header = document.getElementById("header");
        const trigger = ScrollTrigger.create({
            trigger: showcase,
            start: () => "top top+=" + ((header ? header.offsetHeight : 80) + 20),
            end: () => "+=" + (n - 1) * window.innerHeight * 0.55,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: self => show(Math.min(n - 1, Math.floor(self.progress * n)))
        });
        return () => { trigger.kill(); showcase.classList.remove("is-pinned"); };
    });

    // Founder: frame slides into place, tag pops in, journey line fills
    if (document.querySelector(".founder-frame")) {
        gsap.from(".founder-frame", {
            x: -30, y: -30, autoAlpha: 0, duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: ".founder-media", start: "top 75%", once: true }
        });
        gsap.from(".founder-tag", {
            scale: 0.6, autoAlpha: 0, duration: 0.9, ease: "back.out(1.8)", delay: 0.8,
            scrollTrigger: { trigger: ".founder-media", start: "top 75%", once: true }
        });
        gsap.fromTo(".journey-line i", { "--p": 0 }, {
            "--p": 1, ease: "none",
            scrollTrigger: { trigger: ".journey", start: "top 85%", end: "bottom 60%", scrub: true }
        });
        gsap.from(".founder-facts dd", {
            y: 30, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: ".founder-facts", start: "top 85%", once: true }
        });
    }

    // Work: vertical scroll drives the horizontal gallery on desktop
    mm.add("(min-width: 1001px)", () => {
        const work = document.querySelector(".work");
        const gallery = document.querySelector(".gallery");
        const track = document.querySelector(".gal-track");
        const bar = document.querySelector(".gal-bar");
        if (!work || !gallery || !track) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
            x: () => -distance(), ease: "none",
            scrollTrigger: {
                trigger: gallery, start: "center center", end: () => "+=" + distance(),
                pin: work, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
                onUpdate: self => { if (bar) bar.style.setProperty("--p", self.progress.toFixed(3)); }
            }
        });
        return () => tween.kill();
    });

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
   SERVICES SHOWCASE — the sticky photo follows the service in view
===================================================== */

(function () {
    const items = Array.from(document.querySelectorAll(".sc-item"));
    const images = Array.from(document.querySelectorAll(".sc-img"));
    if (!items.length || !("IntersectionObserver" in window)) return;

    function activate(i) {
        items.forEach(item => item.classList.toggle("is-active", item.dataset.i === i));
        images.forEach(image => image.classList.toggle("is-active", image.dataset.i === i));
    }

    const showcase = document.querySelector(".showcase");
    const io = new IntersectionObserver(entries => {
        if (showcase && showcase.classList.contains("is-pinned")) return;
        entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target.dataset.i); });
    }, { rootMargin: "-45% 0px -45% 0px" });

    items.forEach(item => io.observe(item));
})();


/* =====================================================
   SPACE SECTIONS — twinkling star field on a canvas
   Drawn at the screen's pixel density so stars stay sharp;
   each canvas only animates while its section is on screen.
===================================================== */

(function () {
    const sections = document.querySelectorAll(".space");
    if (!sections.length) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d");
    const glow = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.18, "rgba(214,224,255,.85)");
    glow.addColorStop(0.45, "rgba(142,162,255,.18)");
    glow.addColorStop(1, "rgba(142,162,255,0)");
    sctx.fillStyle = glow;
    sctx.fillRect(0, 0, 64, 64);

    const fields = [];

    sections.forEach(section => {
        const layer = document.createElement("div");
        layer.className = "space-stars";
        layer.setAttribute("aria-hidden", "true");
        const canvas = document.createElement("canvas");
        layer.appendChild(canvas);
        section.prepend(layer);

        const ctx = canvas.getContext("2d");
        let stars = [], w = 0, h = 0;

        function resize() {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            if (!w || !h) return;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            const total = Math.min(Math.round(w * h / 4200), 480);
            stars = Array.from({ length: total }, () => {
                const bright = Math.random() < 0.07;
                return {
                    x: Math.random() * w, y: Math.random() * h,
                    r: bright ? 1.1 + Math.random() * 1.1 : 0.3 + Math.random() * 0.8,
                    base: bright ? 0.6 : 0.2 + Math.random() * 0.5,
                    amp: 0.2 + Math.random() * 0.5,
                    speed: 0.5 + Math.random() * 2,
                    phase: Math.random() * Math.PI * 2,
                    bright,
                    color: Math.random() < 0.3 ? "#C9D4FF" : "#FFFFFF"
                };
            });
        }

        function draw(t) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                const a = Math.max(0, Math.min(1, s.base + s.amp * Math.sin(t * s.speed + s.phase)));
                ctx.globalAlpha = a;
                if (s.bright) {
                    const size = s.r * 9 * (0.75 + a * 0.4);
                    ctx.drawImage(sprite, s.x - size / 2, s.y - size / 2, size, size);
                    if (a > 0.85) {
                        ctx.globalAlpha = (a - 0.85) * 4;
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(s.x - size * 0.9, s.y - 0.3, size * 1.8, 0.6);
                        ctx.fillRect(s.x - 0.3, s.y - size * 0.9, 0.6, size * 1.8);
                    }
                } else {
                    ctx.fillStyle = s.color;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        }

        resize();
        draw(0);
        fields.push({ section, resize, draw, visible: false });
    });

    let timer = null;
    window.addEventListener("resize", () => {
        clearTimeout(timer);
        timer = setTimeout(() => fields.forEach(f => { f.resize(); f.draw(performance.now() / 1000); }), 150);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const field = fields.find(f => f.section === entry.target);
            if (field) field.visible = entry.isIntersecting;
        });
    });
    fields.forEach(f => io.observe(f.section));

    (function loop(now) {
        const t = now / 1000;
        fields.forEach(f => { if (f.visible) f.draw(t); });
        requestAnimationFrame(loop);
    })(performance.now());
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
