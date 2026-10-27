/* =====================================================
   ASTRA NEXORA — site behaviour
   Works without the vendor libraries (GSAP, ScrollTrigger,
   Lenis): every animated element has a CSS fallback state,
   and reduced-motion visitors get the static page.
===================================================== */

(function () {

"use strict";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const animate = hasGsap && !reduceMotion;

if (hasGsap) gsap.registerPlugin(ScrollTrigger);


/* =====================================================
   ALWAYS OPEN AT THE TOP
   Browsers restore the old scroll position on load and on
   back/forward; pages should open at their hero unless the
   link asked for a section (#contact etc.).
===================================================== */

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function scrollToStart() {
    if (!location.hash) window.scrollTo(0, 0);
}

scrollToStart();

window.addEventListener("pageshow", event => {
    document.querySelector(".page-curtain")?.classList.remove("is-active");
    if (event.persisted) scrollToStart();
});


/* =====================================================
   SMOOTH SCROLL
===================================================== */

let lenis = null;

if (animate && window.Lenis) {

    lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: false });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

}

function scrollToTarget(target, immediate) {

    const offset = target === 0 ? 0 : -90;

    if (lenis) {
        lenis.scrollTo(target, { offset, immediate: !!immediate, duration: 1.4 });
        return;
    }

    if (target === 0) {
        window.scrollTo({ top: 0, behavior: immediate || reduceMotion ? "auto" : "smooth" });
        return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate || reduceMotion ? "auto" : "smooth" });

}

// In-page anchors
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

// Arriving from another page with a #section: land on it once the layout has settled
window.addEventListener("load", () => {

    if (hasGsap) ScrollTrigger.refresh();

    if (location.hash && location.hash !== "#home") {
        const target = document.querySelector(location.hash);
        if (target) requestAnimationFrame(() => scrollToTarget(target, true));
    }

});


/* =====================================================
   PAGE TRANSITIONS
   A short fade to ink before going to another page.
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
    setTimeout(() => { location.href = url.href; }, 380);

});


/* =====================================================
   HEADER — glass on scroll, hides going down, progress line
===================================================== */

const header = document.getElementById("header");
const progressBar = document.querySelector(".scroll-progress span");
const toTop = document.querySelector(".to-top");
const toTopRing = document.querySelector(".to-top-ring");
const RING = 125.7;

let lastY = 0;

function onScroll() {

    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(y / max, 1) : 0;

    if (header) {
        header.classList.toggle("scrolled", y > 40);
    }

    if (progressBar) progressBar.style.transform = "scaleX(" + progress + ")";

    if (toTop) {
        toTop.classList.toggle("show", y > 600);
        if (toTopRing) toTopRing.style.strokeDashoffset = String(RING * (1 - progress));
    }

    lastY = y;

}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (toTop) toTop.addEventListener("click", () => scrollToTarget(0));


/* =====================================================
   MOBILE MENU + SERVICES DROPDOWN
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function setMenu(open) {

    if (!menuToggle || !mobileMenu) return;

    mobileMenu.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    header.classList.remove("is-hidden");
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

    const links = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"], .desktop-nav a[href*="index.html#"]'));
    if (!links.length || !document.body.classList.contains("home")) return;

    const sections = links
        .map(link => document.getElementById(link.getAttribute("href").split("#")[1]))
        .filter(Boolean);

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
   The tiny placeholder is painted on the image's frame
   straight away; the real photo fades in over it.
===================================================== */

document.querySelectorAll("img.lqip").forEach(img => {

    const placeholder = img.dataset.lqip;

    if (placeholder && img.parentElement) {
        img.parentElement.style.backgroundImage = "url(" + placeholder + ")";
    }

    const done = () => img.classList.add("is-loaded");

    if (img.complete && img.naturalWidth) done();
    else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
    }

});


/* =====================================================
   SPLIT HEADINGS — words rise in when they enter the view
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
            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "BR") {
                return;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // Each word gets its own copy of the <em>, so gradient text survives the split
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
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" })
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
   INTRO — preloader (first visit only) then hero reveal
===================================================== */

const preloader = document.getElementById("preloader");

function heroIntro() {

    const lines = document.querySelectorAll(".hero-title .line > span");

    if (!lines.length) return;

    if (!animate) {
        lines.forEach(line => { line.style.transform = "none"; });
        return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });

    timeline
        .fromTo(lines, { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.3, stagger: 0.12 }, 0.1)
        .from(".hero-head > .eyebrow", { y: 20, autoAlpha: 0, duration: 1 }, 0)
        .from(".hero-lead, .hero-actions, .hero-stats li", { y: 30, autoAlpha: 0, duration: 1.1, stagger: 0.07 }, 0.4)
        .from("[data-hero-media]", { y: 80, autoAlpha: 0, duration: 1.6, ease: "power4.out" }, 0.45)
        .from(".hero-card", { y: 30, autoAlpha: 0, duration: 1.1 }, 1);

}

function finishIntro() {
    if (!preloader) return;
    preloader.classList.add("is-done");
    setTimeout(() => preloader.remove(), 950);
}

if (preloader && !root.classList.contains("no-preload")) {

    try { sessionStorage.setItem("an-intro", "1"); } catch (e) { /* private mode */ }

    if (lenis) lenis.stop();

    setTimeout(() => {
        finishIntro();
        if (lenis) lenis.start();
        setTimeout(heroIntro, 200);
    }, 1150);

} else {

    if (preloader) preloader.remove();
    heroIntro();

}


/* =====================================================
   SCROLL-DRIVEN MOTION (GSAP)
===================================================== */

if (animate) {

    const mm = gsap.matchMedia();

    // Hero: the film frame opens out to full width as you scroll into it
    const heroStage = document.querySelector(".hero-stage");
    if (heroStage) {
        mm.add("(min-width: 1101px)", () => {
            const tween = gsap.fromTo("[data-hero-media]",
                { clipPath: "inset(0% 6% 0% 6% round 36px)" },
                {
                    clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none",
                    scrollTrigger: { trigger: heroStage, start: "top 85%", end: "top 15%", scrub: true }
                });
            return () => tween.kill();
        });
        gsap.fromTo(".hero-media > img, .hero-media > video", { yPercent: -6, scale: 1.12 }, {
            yPercent: 6, scale: 1.12, ease: "none",
            scrollTrigger: { trigger: heroStage, start: "top bottom", end: "bottom top", scrub: true }
        });
    }

    // Inner page hero image: wipes open, then drifts
    document.querySelectorAll(".page-hero-media").forEach(media => {
        gsap.fromTo(media,
            { clipPath: "inset(18% 12% 18% 12% round 28px)" },
            { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.6, ease: "expo.out", delay: 0.15 });
        const image = media.querySelector("img");
        if (image) {
            gsap.fromTo(image, { scale: 1.25 }, { scale: 1, duration: 2, ease: "expo.out", delay: 0.15 });
        }
    });

    if (document.querySelector(".page-hero")) {
        gsap.from(".page-hero .facts li, .page-hero .concept-note", {
            y: 30, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.5
        });
    }

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

    // Process line fills as you scroll through the steps
    document.querySelectorAll(".process").forEach(list => {
        const fill = list.querySelector(".process-fill span");
        if (!fill) return;
        gsap.to(fill, {
            scaleY: 1, ease: "none",
            scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 55%", scrub: true }
        });
    });

    // Parallax
    document.querySelectorAll("[data-parallax]").forEach(el => {
        const amount = parseFloat(el.dataset.parallax) * 100;
        gsap.fromTo(el, { yPercent: -amount }, {
            yPercent: amount, ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    document.querySelectorAll(".parallax-img, [data-parallax-img]").forEach(img => {
        gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, {
            yPercent: 7, scale: 1.16, ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    // Image frames open up as they arrive
    gsap.utils.toArray(".stack-media, .work-card-media, .related-card .work-card-media").forEach(frame => {
        const image = frame.querySelector("img");
        if (!image) return;
        gsap.fromTo(image, { scale: 1.2 }, {
            scale: 1, ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "center center", scrub: true }
        });
    });

    // Bento / include cards: soft 3D tilt-in
    gsap.utils.toArray(".bento-card, .include-card, .goal-card, .audit-item").forEach((card, i) => {
        gsap.fromTo(card,
            { y: 40, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", delay: (i % 3) * 0.08,
                scrollTrigger: { trigger: card, start: "top 92%", once: true }
            });
        card.removeAttribute("data-reveal");
        card.classList.add("is-in");
    });

    // Founder: photo wipes up, second photo and badge drop in,
    // name gets underlined, timeline steps in one by one
    const founder = document.querySelector("[data-founder-media]");
    if (founder) {
        const photo = founder.querySelector(".founder-photo");
        const tl = gsap.timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: founder, start: "top 78%", once: true }
        });
        tl.fromTo(photo, { clipPath: "inset(100% 0% 0% 0% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.5 })
            .from(photo, { scale: 1.08, duration: 1.8 }, 0)
            .from(".founder-orbit", { scale: 0.6, autoAlpha: 0, duration: 1.6 }, 0.2)
            .from(".founder-photo-alt", { x: 80, y: 60, rotate: 10, autoAlpha: 0, duration: 1.4 }, 0.55)
            .from(".founder-badge", { scale: 0.6, autoAlpha: 0, duration: 1, ease: "back.out(1.8)" }, 0.9);

        // Gentle 3D tilt that follows the pointer
        if (finePointer) {
            const rx = gsap.quickTo(photo, "rotationX", { duration: 0.6, ease: "power3" });
            const ry = gsap.quickTo(photo, "rotationY", { duration: 0.6, ease: "power3" });
            founder.addEventListener("pointermove", e => {
                const r = founder.getBoundingClientRect();
                ry(((e.clientX - r.left) / r.width - 0.5) * 10);
                rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
            });
            founder.addEventListener("pointerleave", () => { rx(0); ry(0); });
        }

        gsap.to(".founder-underline path", {
            strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut",
            scrollTrigger: { trigger: ".founder-role", start: "top 85%", once: true }
        });

        gsap.from("[data-timeline] li", {
            x: -30, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.15,
            scrollTrigger: { trigger: "[data-timeline]", start: "top 85%", once: true }
        });
    }

    mm.add("(min-width: 1001px)", () => {

        // Service cards stack: each one sinks back as the next slides over it
        const cards = gsap.utils.toArray(".stack-card");
        cards.forEach((card, i) => {
            const next = cards[i + 1];
            if (!next) return;
            gsap.to(card, {
                scale: 0.94, ease: "none",
                scrollTrigger: { trigger: next, start: "top bottom", end: "top 120px", scrub: true }
            });
        });

        // Work gallery: vertical scroll drives a horizontal track
        const work = document.querySelector(".work");
        const wrap = document.querySelector(".work-track-wrap");
        const track = document.querySelector(".work-track");

        if (work && wrap && track) {
            work.classList.add("is-pinned");
            const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
            const tween = gsap.to(track, {
                x: () => -distance(), ease: "none",
                scrollTrigger: {
                    trigger: wrap, start: "center center", end: () => "+=" + distance(),
                    pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
                }
            });
            return () => { tween.kill(); work.classList.remove("is-pinned"); };
        }

    });

}


// Without GSAP the signature line is simply shown
if (!animate) {
    document.querySelectorAll(".founder-underline path").forEach(path => { path.style.strokeDashoffset = "0"; });
}


/* =====================================================
   POINTER EFFECTS — magnetic buttons, spotlight
===================================================== */

if (finePointer && !reduceMotion) {

    // Magnetic buttons
    document.querySelectorAll(".magnetic").forEach(el => {
        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.12;
            const y = (e.clientY - r.top - r.height / 2) * 0.18;
            el.style.transform = "translate(" + x + "px," + y + "px)";
        });
        el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    // Spotlight cards follow the pointer
    document.querySelectorAll(".spotlight").forEach(card => {
        card.addEventListener("pointermove", e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - r.left) + "px");
            card.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
    });

}


/* =====================================================
   STAR FIELDS — twinkling star canvas
   Stars are drawn at the screen's pixel density so they stay
   sharp; each canvas only animates while it is on screen.
===================================================== */

(function () {

    const layers = Array.from(document.querySelectorAll(".cosmos"));
    if (!layers.length) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // One soft glow sprite, reused for every bright star
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

    // Light sections get small blue stars instead of white ones
    const lightSprite = document.createElement("canvas");
    lightSprite.width = lightSprite.height = 64;
    const lctx = lightSprite.getContext("2d");
    const lglow = lctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    lglow.addColorStop(0, "rgba(46,75,224,.95)");
    lglow.addColorStop(0.2, "rgba(86,118,255,.55)");
    lglow.addColorStop(0.5, "rgba(142,162,255,.12)");
    lglow.addColorStop(1, "rgba(142,162,255,0)");
    lctx.fillStyle = lglow;
    lctx.fillRect(0, 0, 64, 64);

    function makeField(canvas) {

        const ctx = canvas.getContext("2d");
        const light = canvas.dataset.tone === "light";
        const glowSprite = light ? lightSprite : sprite;
        const colors = light ? ["#2E4BE0", "#5676FF", "#1729A0"] : ["#FFFFFF", "#C9D4FF"];
        const density = light ? 16000 : 5200;
        let stars = [];
        let w = 0;
        let h = 0;

        function resize() {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            if (!w || !h) return;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            const count = Math.min(Math.round(w * h / density), 420);
            stars = Array.from({ length: count }, () => {
                const bright = Math.random() < 0.09;
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: bright ? 1.1 + Math.random() * 1.2 : 0.35 + Math.random() * 0.75,
                    base: (bright ? 0.55 : 0.25 + Math.random() * 0.45) * (light ? 0.55 : 1),
                    amp: 0.25 + Math.random() * 0.5,
                    speed: 0.6 + Math.random() * 2.2,
                    phase: Math.random() * Math.PI * 2,
                    bright,
                    color: colors[Math.floor(Math.random() * colors.length)]
                };
            });
        }

        function draw(t) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                const a = Math.max(0, Math.min(1, s.base + s.amp * Math.sin(t * s.speed + s.phase)));
                if (s.bright) {
                    const size = s.r * 9 * (0.75 + a * 0.4);
                    ctx.globalAlpha = a;
                    ctx.drawImage(glowSprite, s.x - size / 2, s.y - size / 2, size, size);
                    // thin cross flare on the brightest moments
                    if (a > 0.8) {
                        ctx.globalAlpha = (a - 0.8) * 2.5;
                        ctx.fillStyle = light ? "#2E4BE0" : "#fff";
                        ctx.fillRect(s.x - size * 0.9, s.y - 0.35, size * 1.8, 0.7);
                        ctx.fillRect(s.x - 0.35, s.y - size * 0.9, 0.7, size * 1.8);
                    }
                } else {
                    ctx.globalAlpha = a;
                    ctx.fillStyle = s.color;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        }

        return { resize, draw };
    }

    const fields = new Map();
    const visible = new Set();

    layers.forEach(layer => {
        const canvas = layer.querySelector(".star-canvas");
        if (!canvas) return;
        const field = makeField(canvas);
        field.resize();
        field.draw(0);
        fields.set(layer, field);
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => fields.forEach(f => { f.resize(); f.draw(performance.now() / 1000); }), 150);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const layer = entry.target;
            entry.isIntersecting ? visible.add(layer) : visible.delete(layer);
        });
    });

    layers.forEach(layer => io.observe(layer));

    (function loop(now) {
        const t = now / 1000;
        visible.forEach(layer => { const f = fields.get(layer); if (f) f.draw(t); });
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
        toggle.querySelector(".hero-video-toggle-label").textContent = paused ? "Play video" : "Pause video";
    }

    window.addEventListener("load", () => {

        video.preload = "auto";
        video.src = video.dataset.src;

        video.play().then(() => {
            video.classList.add("is-playing");
            if (toggle) toggle.hidden = false;
        }).catch(() => {});

        // No file, or it failed: keep the photo
        video.addEventListener("error", () => video.remove(), { once: true });

    }, { once: true });

    if (toggle) toggle.addEventListener("click", () => setPaused(!video.paused));

})();


/* =====================================================
   CLIENT FEEDBACK SLIDER
   Slides live in the HTML (crawlable); this only switches them.
===================================================== */

(function () {

    const section = document.querySelector(".testimonials-section");
    if (!section) return;

    const card = section.querySelector(".testimonial-card");
    const slides = Array.from(section.querySelectorAll(".testimonial-slide"));
    const progress = section.querySelector(".testimonial-progress span");
    const counter = section.querySelector(".testimonial-count");
    const prev = section.querySelector("[data-testimonial-prev]");
    const next = section.querySelector("[data-testimonial-next]");

    if (!slides.length) return;

    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => { slide.hidden = i !== current; });
        if (progress) progress.style.width = ((current + 1) / slides.length * 100) + "%";
        if (counter) counter.textContent = String(current + 1).padStart(2, "0");
        if (!reduceMotion) {
            card.classList.remove("changing");
            void card.offsetWidth;
            card.classList.add("changing");
        }
    }

    function stop() {
        clearInterval(timer);
        timer = null;
    }

    function start() {
        if (reduceMotion || slides.length < 2) return;
        stop();
        timer = setInterval(() => show(current + 1), 7000);
    }

    if (next) next.addEventListener("click", () => { show(current + 1); start(); });
    if (prev) prev.addEventListener("click", () => { show(current - 1); start(); });

    section.addEventListener("mouseenter", stop);
    section.addEventListener("mouseleave", start);
    section.addEventListener("focusin", stop);
    section.addEventListener("focusout", start);

    show(0);
    start();

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
