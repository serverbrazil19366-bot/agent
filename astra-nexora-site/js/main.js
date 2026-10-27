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

function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 40);
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
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right");

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
