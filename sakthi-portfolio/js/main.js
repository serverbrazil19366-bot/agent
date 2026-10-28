/* =====================================================
   SAKTHI — portfolio behaviour
   Works without the vendor libraries; reduced-motion
   visitors get the static page.
===================================================== */

(function () {
"use strict";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const animate = hasGsap && !reduce;
if (hasGsap) gsap.registerPlugin(ScrollTrigger);
if (animate) document.querySelectorAll(".svc, .work-card, .vid, .quote, .xp, .edu, .cs-fig").forEach(el => el.removeAttribute("data-reveal"));

/* ---------- always open at the top ---------- */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function toTop() {
    if (location.hash && location.hash !== "#top") return;
    scrollTo(0, 0);
    const h = document.getElementById("header");
    if (h && h.scrollIntoView) h.scrollIntoView({ block: "start", behavior: "instant" });
}
toTop();
addEventListener("load", toTop);
addEventListener("pageshow", e => { if (e.persisted) toTop(); });

/* ---------- smooth scroll ---------- */
let lenis = null;
if (animate && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}
function goTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.2 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 80, behavior: reduce ? "auto" : "smooth" });
}
document.addEventListener("click", e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = url.hash === "#top" ? 0 : document.querySelector(url.hash);
    if (t === null) return;
    e.preventDefault();
    setMenu(false);
    goTo(t);
});

/* ---------- header ---------- */
const header = document.getElementById("header");
let lastY = 0;
function onScroll() {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 20);
    if (y < 300) document.querySelectorAll(".nav a.active").forEach(a => a.classList.remove("active"));
    header.classList.toggle("hide", y > 400 && y > lastY && !menu.classList.contains("open"));
    lastY = y;
}
addEventListener("scroll", onScroll, { passive: true });

const burger = document.querySelector(".burger");
const menu = document.getElementById("menu");
function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); closeVideo(); } });
onScroll();

// Active section in the menu (home page)
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
if (navLinks.length && "IntersectionObserver" in window) {
    const map = new Map(navLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove("active"));
        const l = map.get(en.target.id);
        if (l) l.classList.add("active");
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ---------- theme ---------- */
document.querySelector(".theme-btn").addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") !== "dark";
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
});

/* ---------- reveals + counters ---------- */
if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(el => {
        const sib = [...el.parentElement.children].filter(c => c.hasAttribute("data-reveal"));
        el.style.transitionDelay = (sib.indexOf(el) % 4) * 90 + "ms";
        io.observe(el);
    });

    const cio = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        const el = en.target, raw = el.textContent, n = parseInt(raw, 10), suffix = raw.replace(/^\d+/, "");
        const t0 = performance.now();
        (function step(t) {
            const p = Math.min((t - t0) / 1400, 1);
            el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) requestAnimationFrame(step);
        })(t0);
    }), { threshold: 0.6 });
    document.querySelectorAll(".stats b, .results b, .float-card b").forEach(b => { if (/^\d/.test(b.textContent)) cio.observe(b); });
} else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("in"));
}

/* ---------- skill tabs ---------- */
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", String(t === tab)));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === tab.dataset.tab));
}));
// Draw the first panel's lines once it is on screen
const firstPanel = document.querySelector(".panel.on");
if (firstPanel && "IntersectionObserver" in window && !reduce) {
    firstPanel.classList.remove("on");
    firstPanel.style.display = "grid";
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { firstPanel.style.display = ""; firstPanel.classList.add("on"); o.disconnect(); } }, { threshold: 0.3 }).observe(firstPanel);
}

/* ---------- project filter ---------- */
document.querySelectorAll(".filter").forEach(f => f.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(x => x.setAttribute("aria-pressed", String(x === f)));
    document.querySelectorAll(".work-card").forEach(card => {
        const show = f.dataset.filter === "all" || card.dataset.tag === f.dataset.filter;
        card.classList.toggle("is-hidden", !show);
        if (show && !reduce) card.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.22,1,.36,1)" });
    });
}));

/* ---------- video modal (YouTube loads only on click) ---------- */
const modal = document.getElementById("vidModal");
function closeVideo() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modal.querySelector(".vm-frame").innerHTML = "";
}
document.querySelectorAll(".vid-btn").forEach(b => b.addEventListener("click", () => {
    const box = modal.querySelector(".vm-box");
    box.classList.toggle("short", b.closest(".vid").classList.contains("tall"));
    modal.querySelector(".vm-frame").innerHTML =
        '<iframe allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video" src="https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0"></iframe>';
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector(".vm-close").focus();
}));
if (modal) {
    modal.addEventListener("click", e => { if (e.target === modal || e.target.closest(".vm-close")) closeVideo(); });
}

/* ---------- contact form → WhatsApp ---------- */
const form = document.getElementById("contactForm");
if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const v = n => (form.elements[n] ? form.elements[n].value.trim() : "");
    const set = (n, msg) => {
        const el = form.elements[n];
        el.setAttribute("aria-invalid", msg ? "true" : "false");
        const err = document.getElementById(el.id + "Err");
        if (err) err.textContent = msg;
    };
    set("name", v("name") ? "" : "Please enter your name.");
    set("phone", v("phone").replace(/\D/g, "").length >= 10 ? "" : "Please enter a phone number with at least 10 digits.");
    set("message", v("message") ? "" : "Please add a short message.");
    const bad = form.querySelector('[aria-invalid="true"]');
    if (bad) { bad.focus(); return; }
    const text = ["Hi Sakthi, I found your portfolio.", "", "Name: " + v("name"), "Phone: " + v("phone"),
        "Email: " + (v("email") || "-"), "Looking for: " + v("service"), "", v("message")].join("\n");
    const url = "https://wa.me/918838417707?text=" + encodeURIComponent(text);
    const tab = window.open(url, "_blank");
    if (tab) tab.opener = null; else location.href = url;
});

/* ---------- motion ---------- */
if (animate) {
    // Scroll progress line
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    // Hero: entrance, then the photo and name drift apart as you scroll
    if (document.querySelector(".hero")) {
        gsap.timeline({ defaults: { ease: "expo.out" } })
            .from(".avail, .hello", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.1)
            .from(".hero-name", { yPercent: 40, autoAlpha: 0, duration: 1.3 }, 0.25)
            .from(".hero-role, .hero-tags span, .hero-lead, .hero-copy .actions, .hero-copy .socials", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.05 }, 0.5)
            .from(".hv-photo", { clipPath: "inset(100% 0 0 0 round 999px 999px 30px 30px)", duration: 1.6, ease: "expo.inOut" }, 0.15)
            .from(".hv-photo img", { scale: 1.3, duration: 2 }, 0.3)
            .from(".hv-back", { x: -26, y: -26, autoAlpha: 0, duration: 1.4 }, 0.7)
            .from(".hv-line", { x: 24, y: 22, autoAlpha: 0, duration: 1.4 }, 0.8)
            .from(".hv-dots", { scale: 0.4, autoAlpha: 0, duration: 1.2 }, 0.9)
            .from(".hv-badge", { scale: 0, rotate: -180, duration: 1.4, ease: "back.out(1.6)" }, 1)
            .from(".hv-chip", { y: 30, autoAlpha: 0, duration: 1 }, 1.1)
            .from(".hero-ghost", { xPercent: 20, autoAlpha: 0, duration: 1.6 }, 0.3);
        const st = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
        gsap.to(".hero-ghost", { xPercent: -25, ease: "none", scrollTrigger: st });
        gsap.to(".hv-stage", { yPercent: -12, ease: "none", scrollTrigger: st });
        gsap.to(".hv-photo img", { yPercent: 8, scale: 1.1, ease: "none", scrollTrigger: st });
        gsap.to(".hero-name", { xPercent: -6, ease: "none", scrollTrigger: st });
        gsap.to(".hero-copy", { autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    }

    // Section headings: words rise one after another
    document.querySelectorAll(".sec-head h2, .contact-head h2").forEach(h2 => {
        h2.setAttribute("aria-label", h2.textContent.replace(/\s+/g, " ").trim());
        const wrap = node => [...node.childNodes].forEach(ch => {
            if (ch.nodeType === 3) {
                const frag = document.createDocumentFragment();
                ch.textContent.split(/(\s+)/).forEach(part => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                    const w = document.createElement("span"), inner = document.createElement("span");
                    w.className = "w"; inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
                });
                ch.replaceWith(frag);
            } else if (ch.nodeType === 1) wrap(ch);
        });
        wrap(h2);
        gsap.from(h2.querySelectorAll(".w > span"), {
            yPercent: 110, rotate: 4, duration: 1.1, ease: "expo.out", stagger: 0.05,
            scrollTrigger: { trigger: h2, start: "top 88%", once: true }
        });
    });

    // Big outline numbers drift
    document.querySelectorAll(".sec-num").forEach(n => gsap.fromTo(n, { y: 80 }, { y: -60, ease: "none", scrollTrigger: { trigger: n.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));

    // Ticker: speeds up and leans with scroll velocity
    const tick = document.querySelector(".ticker-track");
    if (tick) {
        const anim = tick.getAnimations()[0];
        ScrollTrigger.create({ onUpdate: self => {
            const v = self.getVelocity() / 600;
            if (anim) anim.playbackRate = Math.max(-4, Math.min(4, 1 + Math.abs(v))) * (self.direction < 0 ? -1 : 1);
            gsap.to(".ticker", { skewY: Math.max(-4, Math.min(4, v * 0.6)), duration: 0.4, overwrite: true });
            clearTimeout(tick._rest);
            tick._rest = setTimeout(() => {
                gsap.to(".ticker", { skewY: 0, duration: 0.8, ease: "power3.out" });
                if (anim) anim.playbackRate = 1;
            }, 160);
        } });
    }

    // Photos: wipe in, then a gentle parallax
    gsap.utils.toArray(".ap-img, .ci-photo, .cs-cover, .cs-fig").forEach(box => {
        gsap.fromTo(box, { clipPath: "inset(18% 12% 18% 12% round 22px)" }, {
            clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: box, start: "top 85%", once: true }
        });
        const im = box.querySelector("img");
        if (im) gsap.fromTo(im, { yPercent: -6, scale: 1.16 }, { yPercent: 6, scale: 1.16, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Cards arrive in batches
    const batch = (sel, from) => (gsap.set(sel, from), ScrollTrigger.batch(sel, {
        start: "top 90%", once: true,
        onEnter: els => gsap.to(els, { x: 0, y: 0, rotate: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.1, overwrite: true })
    }));
    batch(".svc", { y: 80, rotate: 2.5, autoAlpha: 0 });
    batch(".work-card", { y: 90, autoAlpha: 0 });
    batch(".vid", { y: 70, autoAlpha: 0 });
    batch(".skill", { y: 40, autoAlpha: 0 });
    gsap.utils.toArray(".quote").forEach((q, k) => gsap.fromTo(q, { x: k % 2 ? 80 : -80, autoAlpha: 0 }, {
        x: 0, autoAlpha: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: q, start: "top 90%", once: true }
    }));
    gsap.utils.toArray(".work-card .wc-media img").forEach(im => gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: im.closest(".work-card"), start: "top bottom", end: "bottom top", scrub: true } }));

    // Experience: the line fills as you read down the timeline
    const tl = document.querySelector(".tl-progress i");
    if (tl) gsap.fromTo(tl, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline.main", start: "top 70%", end: "bottom 60%", scrub: true } });
    gsap.utils.toArray(".timeline .xp, .timeline .edu").forEach(x => gsap.fromTo(x, { x: 60, autoAlpha: 0 }, {
        x: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: x, start: "top 90%", once: true }
    }));

    // "Let's work together" strip moves with the page
    const bm = document.querySelector(".bm-track");
    if (bm) gsap.fromTo(bm, { xPercent: 0 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".big-marquee", start: "top bottom", end: "bottom top", scrub: true } });

    // Next-project card grows into view
    const next = document.querySelector(".next-card");
    if (next) gsap.fromTo(next, { scale: 0.9, borderRadius: 60 }, { scale: 1, borderRadius: 30, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 55%", scrub: true } });

    if (fine) {
        // Buttons lean toward the cursor
        document.querySelectorAll(".btn").forEach(b => {
            b.addEventListener("pointermove", e => {
                const r = b.getBoundingClientRect();
                gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.2, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.5, ease: "power3.out" });
            });
            b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
        });
        // Cursor dot that grows over links
        const dot = document.createElement("div");
        dot.className = "cursor off";
        dot.setAttribute("aria-hidden", "true");
        document.body.appendChild(dot);
        const qx = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3" });
        const qy = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3" });
        addEventListener("pointermove", e => {
            qx(e.clientX); qy(e.clientY);
            dot.classList.remove("off");
            dot.classList.toggle("big", !!e.target.closest("a, button, select, input, textarea, label"));
        });
        document.addEventListener("pointerleave", () => dot.classList.add("off"));
        // Hero frame tilts with the mouse; layers move by depth
        const hero = document.querySelector(".hero");
        if (hero) hero.addEventListener("pointermove", e => {
            const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
            gsap.to(".hv-photo", { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 900, duration: 0.8, ease: "power3.out" });
            gsap.to(".hv-back", { x: 26 + x * 18, y: 26 + y * 18, duration: 1, ease: "power3.out" });
            gsap.to(".hv-line", { x: -24 - x * 26, y: -22 - y * 26, duration: 1, ease: "power3.out" });
            gsap.to(".hv-dots", { x: x * -30, y: y * -30, duration: 1.2, ease: "power3.out" });
        });
        // Cards tilt slightly under the cursor
        document.querySelectorAll(".work-card, .svc, .quote").forEach(card => {
            card.addEventListener("pointermove", e => {
                const r = card.getBoundingClientRect();
                gsap.to(card, { y: -8, rotateY: ((e.clientX - r.left) / r.width - 0.5) * 6, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 6, transformPerspective: 1000, duration: 0.5, ease: "power3.out" });
            });
            card.addEventListener("pointerleave", () => gsap.to(card, { y: 0, rotateY: 0, rotateX: 0, duration: 0.7, ease: "power3.out" }));
        });
    }
    addEventListener("load", () => ScrollTrigger.refresh());
}

})();
