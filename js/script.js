/*! ------------------------------------------------
 * Project Name: Rayo - Digital Agency & Personal Portfolio HTML Template
 * Project Description: Elevate your digital presence with Rayo - dynamic and stylish HTML template designed for creative agencies and personal brands. With modern layouts, smooth interactions and a polished aesthetic, Rayo template helps showcase projects, services and expertise with clarity and impact.
 * Tags: mix_design, resume, portfolio, personal page, cv, template, one page, responsive, html5, css3, creative, clean, agency, studio
 * Version: 1.0.0
 * Build Date: July 2025
 * Last Update: July 2025
 * This product is available exclusively on Themeforest
 * Author: mix_design
 * Author URI: https://themeforest.net/user/mix_design
 * File name: app.js
 * ------------------------------------------------
 * * ------------------------------------------------
 * Table of Contents
 * ------------------------------------------------
 *
 * 01. Loader & Loading Animation
 * 02. Lenis Scroll Plugin
 * 03. Typed.js Plugin
 * 04. Header Scroll Behavior
 * 05. Hero #02 Scroll Out Animation
 * 06. Hero #07 Scroll Out Animation
 * 07. Hero #08 Scroll Out Animation
 * 08. SVG Fallback
 * 09. Chrome Smooth Scroll
 * 10. Images Moving Ban
 * 11. Detecting Mobile/Desktop
 * 12. Smooth Scrolling
 * 13. Menu & Hamburger
 * 14. Menu Accordion
 * 15. Layout Masonry
 * 16. Accordion
 * 17. Magnific Popup Video
 * 18. Mailchimp Subscribe Form
 * 19. Contact Form
 * 20. Parallax - Ukiyo Images & Video
 * 21. Pinned Images
 * 22. Stacking Cards
 * 23. Animation - Buttons Common
 * 24. Animation - Text Reveal
 * 25. Animation - Scroll Universal
 * 26. Animation - Images Reveal on Hover
 * 27. Swiper Slider - Testimonials #01
 * 28. Swiper Slider - Testimonials #02
 * 29. Swiper Slider - Inner Pages Demo
 * 30. CountUp - All Counters Options
 * 31. Marquee - Two Lines
 * 32. Marquee - One Line To Right
 * 33. Marquee - One Line To Left
 * 34. SVG DOM Injection
 * 35. Color Switch
 * 36. Scroll to Top Button
 * 37. Parallax Universal
 *
 * ------------------------------------------------
 * Table of Contents End
 * ------------------------------------------------ */

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Flip);

/* ------------------------------------------------
 * 01. Loader & Loading Animation
 * ------------------------------------------------
 * Handled entirely by the standalone js/loader.js (loaded before this
 * file). It tolerates broken images, pages with no .loading-wrap
 * element, and carries a hard safety timeout so the loader can never
 * block the page.
 * ------------------------------------------------ */

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add(e => {
    lenis.raf(1000 * e);
});
gsap.ticker.lagSmoothing(0);

$(window).on("load", function() {
    "use strict";
    if ($(".animated-type").length) {
        new Typed("#typed", {
            stringsElement: "#typed-strings",
            showCursor: true,
            cursorChar: "_",
            loop: true,
            typeSpeed: 70,
            backSpeed: 30,
            backDelay: 2500
        });
    }
});

$(window).on("scroll", function() {
    if ($(window).scrollTop() > 10) {
        $(".joy-header").addClass("is-hidden");
    } else {
        $(".joy-header").removeClass("is-hidden");
    }
});

let hero02FadeOutEl = document.querySelectorAll(".hero-02-static-anim-el");
hero02FadeOutEl.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-02-static__tl-trigger",
            start: "top 14%",
            end: "top 0.2%",
            scrub: { scrub: true, ease: "sine" }
        }
    }).fromTo(e, 
        { transform: "translate3d(0, 0, 0)", scaleY: 1, opacity: 1 }, 
        { transform: "translate3d(0, -5rem, 0)", scaleY: 1.3, opacity: 0 }
    );
});

let fadeOutEl = document.querySelectorAll(".hero-02-fade-out-scroll");
fadeOutEl.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".mxd-pinned-fullscreen__tl-trigger",
            start: "top 80%",
            end: "top 10%",
            scrub: { scrub: true, ease: "sine" }
        }
    }).fromTo(e, { opacity: 1 }, { opacity: 0 });
});

let hero07FadeOutEl = document.querySelectorAll(".hero-07-slide-out-scroll");
hero07FadeOutEl.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".mxd-hero-07__tl-trigger",
            start: "top 86%",
            end: "top 10%",
            scrub: { scrub: true, ease: "power4.out" }
        }
    }).fromTo(e, 
        { transform: "translate3d(0, 0, 0)", scaleY: 1 }, 
        { transform: "translate3d(0, -26rem, 0)", scaleY: 0.8 }
    );
});

let hero07FadeOutEl2 = document.querySelectorAll(".hero-07-fade-out-scroll");
hero07FadeOutEl2.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".mxd-hero-07__tl-trigger",
            start: "top 70%",
            end: "top 40%",
            scrub: { scrub: true, ease: "elastic.out(1,0.3)" }
        }
    }).fromTo(e, 
        { opacity: 1, transform: "translate3d(0, 0, 0)" }, 
        { opacity: 0, transform: "translate3d(0, -10rem, 0)" }
    );
});

let hero08SlideOutEl = document.querySelectorAll(".hero-08-slide-out-scroll");
let hero08ScaleOutEl = document.querySelectorAll(".hero-08-scale-out-scroll");

hero08SlideOutEl.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".mxd-hero-08__tl-trigger",
            start: "top 80%",
            end: "top 40%",
            scrub: { scrub: true, ease: "power4.inOut" }
        }
    }).fromTo(e, 
        { transform: "translate3d(0, 0, 0)", opacity: 1 }, 
        { transform: "translate3d(0, -5rem, 0)", opacity: 0 }
    );
});

hero08ScaleOutEl.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".mxd-hero-08__tl-trigger",
            start: "top 40%",
            end: "top 10%",
            scrub: { scrub: true, ease: "power4.inOut" }
        }
    }).fromTo(e, 
        { transform: "translate3d(0, 0, 0)", scaleY: 1, opacity: 1 }, 
        { transform: "translate3d(0, -5rem, 0)", scaleY: 1.2, opacity: 0 }
    );
});

$(function() {
    if (!Modernizr.svg) {
        $("img[src*='svg']").attr("src", function() {
            return $(this).attr("src").replace(".svg", ".png");
        });
    }
    try {
        $.browserSelector();
        if ($("html").hasClass("chrome")) {
            $.smoothScroll();
        }
    } catch (e) {}

    $("img, a").on("dragstart", function(e) {
        e.preventDefault();
    });

    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $("html").addClass("touch");
    } else {
        $("html").addClass("no-touch");
    }

    /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /MSIE 10/i.test(navigator.userAgent) || /Edge\/\d+/.test(navigator.userAgent);

    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(e) {
        if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
            var t = $(this.hash);
            t = t.length ? t : $("[name=" + this.hash.slice(1) + "]");
            if (t.length) {
                e.preventDefault();
                $("html, body").animate({ scrollTop: t.offset().top }, 1000, function() {
                    var e = $(t);
                    e.focus();
                    if (e.is(":focus")) return false;
                    e.attr("tabindex", "-1");
                    e.focus();
                });
            }
        }
    });

    $(".joy-nav__wrap").each(function() {
        let e = $(this).find(".joy-nav__hamburger"),
            t = $(this).find(".hamburger__line"),
            a = $(this).find(".joy-menu__contain"),
            r = $(this).find(".hamburger__base"),
            o = $(this).find(".joy-menu__wrapper"),
            n = $(this).find(".joy-menu__base"),
            i = $(this).find(".main-menu__item"),
            s = $(this).find(".menu-promo__video"),
            l = $(this).find(".menu-fade-in");

        function c(t) {
            let o = Flip.getState(r);
            if (t) {
                r.appendTo(a);
            } else {
                r.appendTo(e);
            }
            Flip.from(o, { ease: "power4.inOut", duration: 0.8 });
        }

        let d = gsap.timeline({ paused: true });

        function p(t) {
            if (!d.isActive()) {
                if (t) {
                    d.play();
                    e.addClass("nav-open");
                } else {
                    d.reverse();
                    e.removeClass("nav-open");
                }
            }
        }

        d.set(o, { display: "flex" });
        d.from(n, { opacity: 0, duration: 0.6, ease: "none", onStart: () => { c(true); } });
        d.to(t.eq(0), { y: 5, duration: 0.16 }, "<");
        d.to(t.eq(1), { y: -5, duration: 0.16 }, "<");
        d.to(t.eq(0), { rotate: 45, duration: 0.16 }, 0.2);
        d.to(t.eq(1), { rotate: -45, duration: 0.16 }, 0.2);
        d.add("fade-in-up")
         .from(i, { opacity: 0, yPercent: 50, duration: 0.2, stagger: { amount: 0.2 }, onReverseComplete: () => { c(false); } }, "fade-in-up")
         .from(s, { opacity: 0, yPercent: 20, duration: 0.2 }, "fade-in-up");
        d.from(l, { opacity: 0, duration: 0.3 });

        e.on("click", function(event) {
            event.preventDefault();
            $(this).hasClass("nav-open") ? p(false) : p(true);
        });

        n.on("click", function() {
            p(false);
        });

        $(document).on("keydown", function(e) {
            if (e.key === "Escape") p(false);
        });

        window.addEventListener("beforeunload", e => {
            p(false);
        });
    });

    $(".joy-nav__hamburger").on("click", function() {
        if ($(".joy-nav__hamburger").hasClass("nav-open")) {
            $(".joy-header").addClass("menu-is-visible");
        } else {
            setTimeout(function() {
                $(".joy-header").removeClass("menu-is-visible");
            }, 1100);
        }
    });

    var e = function(e, t) {
        this.el = e || {};
        this.multiple = t || false;
        this.el.find(".main-menu__toggle").on("click", { el: this.el, multiple: this.multiple }, this.dropdown);
    };

    e.prototype.dropdown = function(e) {
        var t = e.data.el;
        var $this = $(this),
            $next = $this.next();
        $next.slideToggle();
        $this.parent().toggleClass("open");
        if (!e.data.multiple) {
            t.find(".submenu").not($next).slideUp().parent().removeClass("open");
        }
    };

    new e($("#main-menu"), false);

    $(".mxd-projects-masonry__gallery").imagesLoaded().progress(function() {
        $(".mxd-projects-masonry__gallery").masonry("layout");
        ScrollTrigger.refresh();
    });

    $(".mxd-accordion__title").on("click", function(e) {
        e.preventDefault();
        var t = $(this);
        if (!t.hasClass("accordion-active")) {
            $(".mxd-accordion__content").slideUp(400);
            $(".mxd-accordion__title").removeClass("accordion-active");
            $(".mxd-accordion__arrow").removeClass("accordion-rotate");
        }
        t.toggleClass("accordion-active");
        t.next().slideToggle();
        $(".mxd-accordion__arrow", this).toggleClass("accordion-rotate");
    });

    $("#showreel-trigger").magnificPopup({
        type: "iframe",
        mainClass: "mfp-fade",
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false,
        callbacks: {
            beforeOpen: function() {
                $("body").addClass("overflow-hidden");
                lenis.stop();
            },
            close: function() {
                $("body").removeClass("overflow-hidden");
                lenis.start();
            }
        }
    });

    $(".notify-form").ajaxChimp({
        callback: function(e) {
            if (e.result === "success") {
                $(".notify").find(".form").addClass("is-hidden");
                $(".notify").find(".subscription-ok").addClass("is-visible");
                setTimeout(function() {
                    $(".notify").find(".subscription-ok").removeClass("is-visible");
                    $(".notify").find(".form").delay(300).removeClass("is-hidden");
                    $(".notify-form").trigger("reset");
                }, 5000);
            } else if (e.result === "error") {
                $(".notify").find(".form").addClass("is-hidden");
                $(".notify").find(".subscription-error").addClass("is-visible");
                setTimeout(function() {
                    $(".notify").find(".subscription-error").removeClass("is-visible");
                    $(".notify").find(".form").delay(300).removeClass("is-hidden");
                    $(".notify-form").trigger("reset");
                }, 5000);
            }
        },
        url: "https://club.us10.list-manage.com/subscribe/post?u=e8d650c0df90e716c22ae4778&amp;id=54a7906900&amp;f_id=00b64ae4f0"
    });

    $("#contact-form").submit(function() {
        var e = $(this);
        $.ajax({
            type: "POST",
            url: "mail.php",
            data: e.serialize()
        }).done(function() {
            $(".contact").find(".form").addClass("is-hidden");
            $(".contact").find(".form__reply").addClass("is-visible");
            setTimeout(function() {
                $(".contact").find(".form__reply").removeClass("is-visible");
                $(".contact").find(".form").delay(300).removeClass("is-hidden");
                e.trigger("reset");
            }, 5000);
        });
        return false;
    });
});

const images = document.querySelectorAll(".parallax-img"),
      imagesSmall = document.querySelectorAll(".parallax-img-small"),
      video = document.querySelectorAll(".parallax-video");

new Ukiyo(images, { scale: 1.5, speed: 1.5, externalRAF: false });
new Ukiyo(imagesSmall, { scale: 1.2, speed: 1.5, externalRAF: false });
new Ukiyo(video, { scale: 1.5, speed: 1.5, externalRAF: false });

$(".mxd-pinned").each(function(e) {
    let t = $(this).find(".mxd-pinned__text-item"),
        a = $(this).find(".mxd-pinned__img-item");

    function r(e) {
        t.removeClass("is-active");
        a.removeClass("is-active");
        t.eq(e).addClass("is-active");
        a.eq(e).addClass("is-active");
    }

    r(0);

    t.each(function(e) {
        ScrollTrigger.create({
            trigger: $(this),
            start: "top center",
            end: "bottom center",
            onToggle: t => {
                if (t) r(e);
            }
        });
    });
});

/* ------------------------------------------------
 * Stacking cards (one pin + timeline PER .stack-wrapper)
 * ------------------------------------------------
 * FIX: the old code did document.querySelectorAll(".stack-item") and
 * used document.querySelector(".stack-wrapper"). With two stacks on the
 * page (Services + Press Releases) that meant:
 *   - the pin length was calculated from ALL cards (7) instead of the 4
 *     cards in the first stack, so the last Services card sat pinned for
 *     ~2000px of dead scroll after it had already landed;
 *   - the Press Releases stack was never pinned and its cards stayed
 *     piled on top of each other.
 * Each wrapper now measures and pins only its own cards.
 * ------------------------------------------------ */
document.querySelectorAll(".stack-wrapper").forEach(function (wrapper) {
    const cards = wrapper.querySelectorAll(".stack-item");
    if (!cards.length) return;

    // Pin ONLY the card area (.services-stack), not the whole wrapper.
    // The wrapper also contains .stack-offset (a ~136px empty spacer); pinning
    // the wrapper put that blank space above the cards while pinned, pushing
    // the bottom of every card below the fold.
    const stack = wrapper.querySelector(".services-stack") || cards[0].parentElement,
          animation = gsap.timeline(),
          EDGE_GAP = 24;   // min breathing room (px) above/below a card

    // The visible card is the inner box; .stack-item only adds bottom padding.
    const innerOf = () => cards[0].firstElementChild || cards[0];

    let cardHeight;

    // Cards slide in from below the stack; without clipping they would peek
    // out under the first card now that the stack is centered on screen.
    stack.style.overflow = "hidden";

    function initCards() {
        animation.clear();

        // Desktop: if the card is taller than the screen, shrink the stack so
        // the whole card (title + text + tags) always fits in the viewport.
        stack.style.height = "";
        if (window.innerWidth >= 992) {
            const padBottom = cards[0].offsetHeight - innerOf().offsetHeight,
                  fit = window.innerHeight - EDGE_GAP * 2 + padBottom;
            if (fit < stack.offsetHeight) {
                stack.style.height = Math.max(fit, 480) + "px";
            }
        }

        cardHeight = cards[0].offsetHeight;
        cards.forEach((e, t) => {
            if (t > 0) {
                gsap.set(e, { y: t * cardHeight });
                animation.to(e, { y: 0, duration: 0.5 * t, ease: "none" }, 0);
            }
        });
    }
    initCards();

    ScrollTrigger.create({
        trigger: stack,
        // Pin point = vertical CENTER of the visible card on the screen
        // (falls back to the top edge if the card is taller than the screen).
        start: () => `top ${Math.max(0, (window.innerHeight - innerOf().offsetHeight) / 2)}px`,
        pin: true,
        end: () => `+=${cards.length * cardHeight}`,
        scrub: true,
        animation: animation,
        invalidateOnRefresh: true
    });
    ScrollTrigger.addEventListener("refreshInit", initCards);
});

let elements = document.querySelectorAll(".btn-anim .btn-caption");
elements.forEach(e => {
    let t = e.innerText;
    e.innerHTML = "";
    let a = document.createElement("div");
    a.classList.add("btn-anim__block");
    for (let char of t) {
        let s = document.createElement("span");
        s.innerText = char.trim() === "" ? " " : char;
        s.classList.add("btn-anim__letter");
        a.appendChild(s);
    }
    e.appendChild(a);
    e.appendChild(a.cloneNode(true));
});

elements.forEach(e => {
    e.addEventListener("mouseover", () => {
        e.classList.remove("play");
    });
});

const splitTypes = document.querySelectorAll(".reveal-type");
splitTypes.forEach((e, t) => {
    const a = new SplitType(e, { types: "words, chars" });
    gsap.from(a.chars, {
        scrollTrigger: { trigger: e, start: "top 80%", end: "top 20%", scrub: true, markers: false },
        opacity: 0.2,
        stagger: 0.1
    });
});

const animInUp = document.querySelectorAll(".reveal-in-up");
animInUp.forEach((e, t) => {
    const a = new SplitType(e);
    gsap.from(a.chars, {
        scrollTrigger: { trigger: e, start: "top 90%", end: "top 20%", scrub: true },
        transformOrigin: "top left",
        y: 10,
        stagger: 0.2,
        delay: 0.2,
        duration: 2
    });
});

const animateRotation = document.querySelectorAll(".animate-rotation");
animateRotation.forEach(e => {
    var t = $(e).data("value");
    gsap.fromTo(e, 
        { ease: "sine", rotate: 0 }, 
        { rotate: t, scrollTrigger: { trigger: e, scrub: true, toggleActions: "play none none reverse" } }
    );
});

const animateInUp = document.querySelectorAll(".anim-uni-in-up");
animateInUp.forEach(e => {
    gsap.fromTo(e, 
        { opacity: 0, y: 50, ease: "sine" }, 
        { y: 0, opacity: 1, scrollTrigger: { trigger: e, toggleActions: "play none none reverse" } }
    );
});

const animateInUpFront = document.querySelectorAll(".anim-uni-scale-in");
animateInUpFront.forEach(e => {
    gsap.fromTo(e, 
        { opacity: 1, y: 50, scale: 1.2, ease: "sine" }, 
        { y: 0, x: 0, opacity: 1, scale: 1, scrollTrigger: { trigger: e, toggleActions: "play none none reverse" } }
    );
});

const animateInUpRight = document.querySelectorAll(".anim-uni-scale-in-right");
animateInUpRight.forEach(e => {
    gsap.fromTo(e, 
        { opacity: 1, y: 50, x: -70, scale: 1.2, ease: "sine", duration: 5 }, 
        { y: 0, x: 0, opacity: 1, scale: 1, scrollTrigger: { trigger: e, toggleActions: "play none none reverse" } }
    );
});

const animateInUpLeft = document.querySelectorAll(".anim-uni-scale-in-left");
animateInUpLeft.forEach(e => {
    gsap.fromTo(e, 
        { opacity: 1, y: 50, x: 70, scale: 1.2, ease: "sine" }, 
        { y: 0, x: 0, opacity: 1, scale: 1, scrollTrigger: { trigger: e, toggleActions: "play none none reverse" } }
    );
});

if (document.querySelector(".animate-card-2")) {
    gsap.set(".animate-card-2", { y: 50, opacity: 0 });
    ScrollTrigger.batch(".animate-card-2", {
        interval: 0.1,
        batchMax: 2,
        duration: 3,
        onEnter: e => gsap.to(e, { opacity: 1, y: 0, ease: "sine", stagger: { each: 0.15, grid: [1, 2] }, overwrite: true }),
        onLeave: e => gsap.set(e, { opacity: 1, y: 0, overwrite: true }),
        onEnterBack: e => gsap.to(e, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
        onLeaveBack: e => gsap.set(e, { opacity: 0, y: 50, overwrite: true })
    });
    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-2", { y: 0, opacity: 1 }));
}

if (document.querySelector(".animate-card-3")) {
    gsap.set(".animate-card-3", { y: 50, opacity: 0 });
    ScrollTrigger.batch(".animate-card-3", {
        interval: 0.1,
        batchMax: 3,
        duration: 3,
        onEnter: e => gsap.to(e, { opacity: 1, y: 0, ease: "sine", stagger: { each: 0.15, grid: [1, 3] }, overwrite: true }),
        onLeave: e => gsap.set(e, { opacity: 1, y: 0, overwrite: true }),
        onEnterBack: e => gsap.to(e, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
        onLeaveBack: e => gsap.set(e, { opacity: 0, y: 50, overwrite: true })
    });
    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-3", { y: 0, opacity: 1 }));
}

if (document.querySelector(".animate-card-4")) {
    gsap.set(".animate-card-4", { y: 50, opacity: 0 });
    ScrollTrigger.batch(".animate-card-4", {
        interval: 0.1,
        batchMax: 4,
        delay: 1000,
        onEnter: e => gsap.to(e, { opacity: 1, y: 0, ease: "sine", stagger: { each: 0.15, grid: [1, 4] }, overwrite: true }),
        onLeave: e => gsap.set(e, { opacity: 1, y: 0, overwrite: true }),
        onEnterBack: e => gsap.to(e, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
        onLeaveBack: e => gsap.set(e, { opacity: 0, y: 50, overwrite: true })
    });
    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-4", { y: 0, opacity: 1 }));
}

if (document.querySelector(".animate-card-5")) {
    gsap.set(".animate-card-5", { y: 50, opacity: 0 });
    ScrollTrigger.batch(".animate-card-5", {
        interval: 0.1,
        batchMax: 5,
        delay: 1000,
        onEnter: e => gsap.to(e, { opacity: 1, y: 0, ease: "sine", stagger: { each: 0.15, grid: [1, 5] }, overwrite: true }),
        onLeave: e => gsap.set(e, { opacity: 1, y: 0, overwrite: true }),
        onEnterBack: e => gsap.to(e, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
        onLeaveBack: e => gsap.set(e, { opacity: 0, y: 50, overwrite: true })
    });
    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-5", { y: 0, opacity: 1 }));
}

let toBottomEl = document.querySelectorAll(".anim-top-to-bottom");
toBottomEl.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".fullwidth-text__tl-trigger",
            start: "top 99%",
            end: "top 24%",
            scrub: { scrub: true, ease: "none" }
        }
    }).fromTo(e, 
        { transform: "translate3d(0, -100%, 0)" }, 
        { transform: "translate3d(0, 0, 0)" }
    );
});

const docStyle = getComputedStyle(document.documentElement),
      zoomInContainer = document.querySelectorAll(".anim-zoom-in-container"),
      zoomOutContainer = document.querySelectorAll(".anim-zoom-out-container");

zoomInContainer.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: e,
            start: "top 82%",
            end: "top 14%",
            scrub: { scrub: true, ease: "power4.inOut" }
        }
    }).fromTo(e, 
        { borderRadius: "200px", transform: "scale3d(0.94, 1, 1)" }, 
        { borderRadius: docStyle.getPropertyValue("--_radius-l"), transform: "scale3d(1, 1, 1)" }
    );
});

zoomOutContainer.forEach(e => {
    gsap.timeline({
        scrollTrigger: {
            trigger: e,
            start: "top 82%",
            end: "top 14%",
            scrub: { scrub: true, ease: "power4.inOut" }
        }
    }).fromTo(e, 
        { borderRadius: "200px", transform: "scale3d(1.14, 1, 1)" }, 
        { borderRadius: docStyle.getPropertyValue("--_radius-l"), transform: "scale3d(1, 1, 1)" }
    );
});

const link = document.querySelectorAll(".hover-reveal__item"),
      linkHoverReveal = document.querySelectorAll(".hover-reveal__content"),
      linkImages = document.querySelectorAll(".hover-reveal__image");

for (let e = 0; e < link.length; e++) {
    link[e].addEventListener("mousemove", t => {
        linkHoverReveal[e].style.opacity = 1;
        linkHoverReveal[e].style.transform = "translate(-80%, -50% )";
        linkImages[e].style.transform = "scale(1, 1)";
        linkHoverReveal[e].style.left = t.clientX + "px";
    });
    link[e].addEventListener("mouseleave", t => {
        linkHoverReveal[e].style.opacity = 0;
        linkHoverReveal[e].style.transform = "translate(-80%, -50%)";
        linkImages[e].style.transform = "scale(1, 1.4)";
    });
}

const testimonialsSlider = document.querySelector("testimonials-slider");
if (!testimonialsSlider) {
    new Swiper(".swiper-testimonials", {
        slidesPerView: "auto",
        grabCursor: true,
        spaceBetween: 30,
        autoplay: true,
        delay: 3000,
        speed: 1000,
        loop: true,
        parallax: true,
        loopFillGroupWithBlank: true,
        pagination: { el: ".swiper-pagination", type: "fraction" },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
}

const testimonialsSlider2 = document.querySelector("testimonials-slider-2");
if (!testimonialsSlider2) {
    new Swiper(".swiper-testimonials-2", {
        slidesPerView: 1,
        grabCursor: true,
        effect: "fade",
        spaceBetween: 30,
        autoplay: true,
        delay: 3000,
        speed: 1000,
        loop: true,
        parallax: true,
        loopFillGroupWithBlank: true,
        pagination: { el: ".swiper-pagination", type: "fraction" },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
}

const innerDemoSlider = document.querySelector("mxd-demo-swiper");
if (!innerDemoSlider) {
    new Swiper(".mxd-demo-swiper", {
        breakpoints: {
            640: { slidesPerView: 1, spaceBetween: 30 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1600: { slidesPerView: 3, spaceBetween: 30 }
        },
        loop: true,
        parallax: true,
        autoplay: { disableOnInteraction: false, enabled: true },
        grabCursor: true,
        speed: 600,
        centeredSlides: true,
        keyboard: { enabled: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
}

const optionsNormal = { enableScrollSpy: true },
      optionsDecimal = { decimalPlaces: 1, enableScrollSpy: true },
      optionsDecimalTwo = { decimalPlaces: 2, enableScrollSpy: true },
      optionsPercent = { suffix: "%", enableScrollSpy: true },
      optionsK = { suffix: "K", enableScrollSpy: true },
      optionsPlus = { suffix: "+", enableScrollSpy: true };

const initMarquees = () => {
    const e = [...document.querySelectorAll(".marquee--gsap")];
    if (e) {
        const t = { top: { el: null, width: 0 }, bottom: { el: null, width: 0 } };
        e.forEach(e => {
            t.top.el = e.querySelector(".marquee__top");
            t.bottom.el = e.querySelector(".marquee__bottom");
            t.top.width = t.top.el.offsetWidth;
            t.bottom.width = t.bottom.el.offsetWidth;
            t.top.el.innerHTML += t.top.el.innerHTML;
            t.bottom.el.innerHTML += t.bottom.el.innerHTML;
            
            let a = gsap.timeline()
                        .add(marquee(t.top.el, 30, "-=50%"), 0)
                        .add(marquee(t.bottom.el, 30, "+=50%"), 0),
                r = gsap.to(a, { duration: 1.5, timeScale: 1, paused: true }),
                o = gsap.utils.clamp(1, 6);
                
            ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: e => {
                    a.timeScale(o(Math.abs(e.getVelocity() / 200)));
                    r.invalidate().restart();
                }
            });
        });
    }
};

const marquee = (e, t, a) => {
    let r = gsap.utils.wrap(0, 50);
    return gsap.to(e, {
        duration: t,
        ease: "none",
        x: a,
        modifiers: { x: e => (a = r(parseFloat(e)) + "%") },
        repeat: -1
    });
};
initMarquees();


const initMarquee = () => {
    const e = [...document.querySelectorAll(".marquee-right--gsap")];
    if (e) {
        const t = { el: null, width: 0 };
        e.forEach(e => {
            t.el = e.querySelector(".marquee__toright");
            t.width = t.el.offsetWidth;
            t.el.innerHTML += t.el.innerHTML;
            
            let a = gsap.timeline().add(marqueeRight(t.el, 30, "+=50%"), 0),
                r = gsap.to(a, { duration: 1.5, timeScale: 1, paused: true }),
                o = gsap.utils.clamp(1, 6);
                
            ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: e => {
                    a.timeScale(o(Math.abs(e.getVelocity() / 200)));
                    r.invalidate().restart();
                }
            });
        });
    }
};

const marqueeRight = (e, t, a) => {
    let r = gsap.utils.wrap(0, 50);
    return gsap.to(e, {
        duration: t,
        ease: "none",
        x: a,
        modifiers: { x: e => (a = r(parseFloat(e)) + "%") },
        repeat: -1
    });
};
initMarquee();

const initMarqueeLeft = () => {
    const e = [...document.querySelectorAll(".marquee-left--gsap")];
    if (e) {
        const t = { el: null, width: 0 };
        e.forEach(e => {
            t.el = e.querySelector(".marquee__toleft");
            t.width = t.el.offsetWidth;
            t.el.innerHTML += t.el.innerHTML;
            
            let a = gsap.timeline().add(marquee(t.el, 30, "-=50%"), 0),
                r = gsap.to(a, { duration: 1.5, timeScale: 1, paused: true }),
                o = gsap.utils.clamp(1, 6);
                
            ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: e => {
                    a.timeScale(o(Math.abs(e.getVelocity() / 200)));
                    r.invalidate().restart();
                }
            });
        });
    }
};
initMarqueeLeft();

var mySVGsToInject = document.querySelectorAll("img.inject-me"),
    injectorOptions = {
        evalScripts: "once",
        pngFallback: "assets/png",
        each: function(e) {}
    };
    
SVGInjector(mySVGsToInject, injectorOptions, function(e) {
    console.log("We injected " + e + " SVG(s)!");
});

const themeBtn = document.querySelector("#color-switcher");

function getCurrentTheme() {
    let e = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (localStorage.getItem("template.theme")) {
        e = localStorage.getItem("template.theme");
    }
    return e;
}

function loadTheme(e) {
    const t = document.querySelector(":root");
    themeBtn.innerHTML = e === "light" 
        ? '<i class="ph-bold ph-moon-stars"></i>' 
        : '<i class="ph-bold ph-sun-horizon"></i>';
    t.setAttribute("color-scheme", `${e}`);
}

themeBtn.addEventListener("click", () => {
    let e = getCurrentTheme();
    e = e === "dark" ? "light" : "dark";
    localStorage.setItem("template.theme", `${e}`);
    loadTheme(e);
});

window.addEventListener("DOMContentLoaded", () => {
    loadTheme(getCurrentTheme());
});

const toTop = document.querySelector(".btn-to-top");
$(".btn-to-top").each(function() {
    toTop.addEventListener("click", function(e) {
        e.preventDefault();
    });
    toTop.addEventListener("click", () => {
        gsap.to(window, { scrollTo: 0, ease: "power4.inOut", duration: 1.3 });
    });
    gsap.set(toTop, { opacity: 0 });
    gsap.to(toTop, {
        opacity: 1,
        autoAlpha: 1,
        scrollTrigger: {
            trigger: "body",
            start: "top -20%",
            end: "top -20%",
            toggleActions: "play none reverse none"
        }
    });
});

gsap.to("[data-speed]", {
    y: (e, t) => (1 - parseFloat(t.getAttribute("data-speed"))) * ScrollTrigger.maxScroll(window),
    ease: "none",
    scrollTrigger: {
        start: 0,
        end: "max",
        invalidateOnRefresh: true,
        scrub: 0
    }
});