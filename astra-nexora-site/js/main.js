/* =====================================================
   ASTRA NEXORA — INTERACTIONS
   Ported from the Akeela Dental Care script.js
===================================================== */

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function setMenu(open) {
    mobileMenu.classList.toggle("open", open);
    document.getElementById("header").classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (menuToggle && mobileMenu) {

    menuToggle.addEventListener("click", () => {
        setMenu(!mobileMenu.classList.contains("open"));
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
            setMenu(false);
            menuToggle.focus();
        }
    });

}


/* =====================================================
   HEADER SCROLL
===================================================== */

const header = document.getElementById("header");

const progressBar = document.querySelector(".scroll-progress span");

function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 40);

    if (progressBar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    }
}

if (header) {
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
}


/* =====================================================
   HERO IMAGE SETTLE
===================================================== */

const hero = document.querySelector(".hero");
const heroImage = document.querySelector(".hero-background img");

if (hero && heroImage) {

    const markLoaded = () =>
        requestAnimationFrame(() => hero.classList.add("is-loaded"));

    if (heroImage.complete) {
        markLoaded();
    } else {
        heroImage.addEventListener("load", markLoaded, { once: true });
        heroImage.addEventListener("error", markLoaded, { once: true });
    }

}


/* =====================================================
   HERO VIDEO (desktop only, after the photo has painted)
===================================================== */

const heroVideo = document.querySelector(".hero-video");
const heroVideoToggle = document.querySelector(".hero-video-toggle");

function canUseHeroVideo() {
    const connection = navigator.connection || {};
    return heroVideo &&
        heroVideo.dataset.src &&
        !prefersReducedMotion &&
        !connection.saveData &&
        window.matchMedia("(min-width: 769px)").matches;
}

function setVideoPaused(paused) {
    if (paused) {
        heroVideo.pause();
    } else {
        heroVideo.play().catch(() => {});
    }
    heroVideoToggle.setAttribute("aria-pressed", String(paused));
    heroVideoToggle.querySelector(".hero-video-toggle-label").textContent =
        paused ? "Play video" : "Pause video";
}

if (canUseHeroVideo()) {

    window.addEventListener("load", () => {

        heroVideo.preload = "auto";

        heroVideo.src = heroVideo.dataset.src;

        heroVideo.play().then(() => {

            heroVideo.classList.add("is-playing");

            if (heroVideoToggle) heroVideoToggle.hidden = false;

        }).catch(() => {});

        // No file yet, or it failed: keep the photo, show nothing extra
        heroVideo.addEventListener("error", () => heroVideo.remove(), { once: true });

    }, { once: true });

    if (heroVideoToggle) {
        heroVideoToggle.addEventListener("click", () => {
            setVideoPaused(!heroVideo.paused);
        });
    }

}


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-clip");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {

    revealElements.forEach(element => element.classList.add("visible"));

} else {

    const revealObserver = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.15
        }

    );

    revealElements.forEach(element => revealObserver.observe(element));

}


/* =====================================================
   COUNTER ANIMATION
   The real number is in the HTML (for no-JS and SEO);
   it only counts up when motion is allowed.
===================================================== */

const counters = document.querySelectorAll(".counter");

function runCounter(counter) {

    const target = parseInt(counter.dataset.target, 10);

    const duration = 1800;

    const startTime = performance.now();

    function updateCounter(currentTime) {

        const elapsed = currentTime - startTime;

        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);

        counter.textContent = String(Math.floor(target * eased));

        if (progress < 1) {

            requestAnimationFrame(updateCounter);

        } else {

            counter.textContent = String(target);

        }

    }

    requestAnimationFrame(updateCounter);

}

if (!prefersReducedMotion && "IntersectionObserver" in window) {

    const counterObserver = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                runCounter(entry.target);

                counterObserver.unobserve(entry.target);

            });

        },

        {
            threshold: 0.6
        }

    );

    counters.forEach(counter => {

        counter.textContent = "0";

        counterObserver.observe(counter);

    });

}


/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections = document.querySelectorAll("section[id]");

const navLinks = document.querySelectorAll(".desktop-nav a");

function updateActiveNav() {

    let current = "";

    sections.forEach(section => {

        if (window.scrollY >= section.offsetTop - 150) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + current
        );

    });

}

window.addEventListener("scroll", updateActiveNav, { passive: true });

updateActiveNav();


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
    let autoSlide = null;

    function show(index) {

        current = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.hidden = i !== current;
        });

        if (progress) {
            progress.style.width = ((current + 1) / slides.length * 100) + "%";
        }

        if (counter) {
            counter.textContent = String(current + 1).padStart(2, "0");
        }

        if (!prefersReducedMotion) {
            card.classList.remove("changing");
            void card.offsetWidth;
            card.classList.add("changing");
        }

    }

    function stop() {
        clearInterval(autoSlide);
        autoSlide = null;
    }

    function start() {
        if (prefersReducedMotion || slides.length < 2) return;
        stop();
        autoSlide = setInterval(() => show(current + 1), 7000);
    }

    if (next) next.addEventListener("click", () => { show(current + 1); start(); });
    if (prev) prev.addEventListener("click", () => { show(current - 1); start(); });

    // Pause while the reader is on the card
    section.addEventListener("mouseenter", stop);
    section.addEventListener("mouseleave", start);
    section.addEventListener("focusin", stop);
    section.addEventListener("focusout", start);

    show(0);
    start();

})();


/* =====================================================
   BRAND VIDEO MODAL
===================================================== */

(function () {

    const openButton = document.querySelector("[data-video-open]");
    const modal = document.getElementById("videoModal");

    if (!openButton || !modal || typeof modal.showModal !== "function") return;

    const video = modal.querySelector("video");
    const closeButton = modal.querySelector(".video-modal-close");

    video.addEventListener("error", () => modal.classList.add("is-missing"));

    openButton.addEventListener("click", () => {

        if (!video.getAttribute("src")) {
            video.src = video.dataset.src;
        }

        modal.showModal();

        video.play().catch(() => {});

    });

    function close() {
        video.pause();
        modal.close();
    }

    closeButton.addEventListener("click", close);

    modal.addEventListener("click", e => {
        if (e.target === modal) close();
    });

    modal.addEventListener("close", () => {
        video.pause();
        openButton.focus();
    });

})();


/* =====================================================
   FREE AUDIT FORM → WHATSAPP
   Nothing is stored; the form opens WhatsApp with the
   details pre-filled (same approach as Akeela contact.js).
===================================================== */

(function () {

    const form = document.getElementById("auditForm");

    if (!form) return;

    const whatsappNumber = "918838417707";

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
        const phoneDigits = phone.replace(/\D/g, "");

        setError("name", name ? "" : "Please enter your name.");
        setError("phone", phoneDigits.length >= 10 ? "" : "Please enter a phone number with at least 10 digits.");

        if (!name || phoneDigits.length < 10) {
            form.querySelector('[aria-invalid="true"]').focus();
            return;
        }

        const lines = [
            "Hi Astra Nexora, I'd like to talk about a project.",
            "",
            "Name: " + name,
            "Phone: " + phone,
            "Email: " + (value("email") || "-"),
            "Website: " + (value("website") || "-"),
            "Interested in: " + (value("service") || "-")
        ];

        const message = value("message");
        if (message) lines.push("", message);

        window.open(
            "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(lines.join("\n")),
            "_blank",
            "noopener"
        );

    });

})();


/* =====================================================
   PROJECT FILTER
===================================================== */

(function () {

    const buttons = document.querySelectorAll(".project-filters [data-filter]");
    const items = document.querySelectorAll(".project-item");

    if (!buttons.length) return;

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const filter = button.dataset.filter;

            buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));

            items.forEach(item => {
                item.hidden = filter !== "all" && item.dataset.category !== filter;
                item.classList.add("visible");
            });

            document.querySelector(".project-grid").classList.toggle("is-filtered", filter !== "all");

        });

    });

})();


/* =====================================================
   PREMIUM LAYER
   Everything below is progressive: the page works without it,
   and motion-heavy parts are skipped for reduced motion.
===================================================== */

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
});


/* ---------- Word-by-word heading reveal ---------- */

(function () {

    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const headings = document.querySelectorAll("[data-split]");

    function splitNode(node, counter) {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const parts = child.textContent.split(/(\s+)/);
                const frag = document.createDocumentFragment();
                parts.forEach(part => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(" "));
                        return;
                    }
                    const outer = document.createElement("span");
                    outer.className = "w";
                    const inner = document.createElement("span");
                    inner.textContent = part;
                    inner.style.setProperty("--i", counter.i++);
                    outer.appendChild(inner);
                    frag.appendChild(outer);
                });
                child.replaceWith(frag);
            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
                splitNode(child, counter);
            }
        });
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("split-in");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    headings.forEach(h => {
        h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
        splitNode(h, { i: 0 });
        h.querySelectorAll(".w").forEach(w => w.setAttribute("aria-hidden", "true"));
        h.classList.add("split-ready");
        observer.observe(h);
    });

})();


/* ---------- Parallax (hero media and framed images) ---------- */

(function () {

    if (prefersReducedMotion) return;

    const items = Array.from(document.querySelectorAll("[data-parallax], .hero-background"));

    if (!items.length) return;

    let ticking = false;

    function update() {
        const vh = window.innerHeight;
        items.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > vh + 200) return;
            const speed = parseFloat(el.dataset.parallaxSpeed || "0.15");
            const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
            // Framed images move inside their frame; everything else moves itself
            const target = el.classList.contains("split-frame") ? el.querySelector("img") : el;
            if (target) target.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
        });
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });

    update();

})();


/* ---------- Magnetic buttons ---------- */

(function () {

    if (prefersReducedMotion || !finePointer) return;

    document.querySelectorAll(".magnetic").forEach(el => {

        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.22;
            const y = (e.clientY - r.top - r.height / 2) * 0.32;
            el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
        });

        el.addEventListener("pointerleave", () => {
            el.style.transform = "";
        });

    });

})();


/* ---------- Cursor spotlight on cards ---------- */

(function () {

    if (!finePointer) return;

    document.querySelectorAll(".spotlight").forEach(card => {
        card.addEventListener("pointermove", e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - r.left) + "px");
            card.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
    });

})();


/* ---------- Back to top with progress ring ---------- */

(function () {

    const button = document.querySelector(".to-top");

    if (!button) return;

    const ring = button.querySelector(".to-top-ring");
    const length = 125.7;

    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        button.classList.toggle("show", window.scrollY > 600);
        if (ring) ring.style.strokeDashoffset = String(length - length * progress);
    }

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    window.addEventListener("scroll", update, { passive: true });

    update();

})();


/* ---------- Services dropdown: Escape closes it ---------- */

(function () {

    document.querySelectorAll(".nav-dropdown").forEach(dropdown => {
        dropdown.addEventListener("keydown", e => {
            if (e.key !== "Escape") return;
            const toggle = dropdown.querySelector(".nav-dropdown-toggle");
            toggle.focus();
            toggle.blur();
        });
    });

})();
