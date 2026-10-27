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
