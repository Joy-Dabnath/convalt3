/* ------------------------------------------------
 * loader.js — standalone preloader controller
 *
 * Works with zero dependencies. If GSAP / imagesLoaded
 * happen to be loaded, it uses them; if not, it falls
 * back to CSS transitions and window.load.
 *
 * Guarantees the loader ALWAYS hides:
 *   - broken/404 images no longer block it
 *   - a hard safety timeout is always armed
 *
 * Fires: document -> "loader:done"
 * ------------------------------------------------ */
(function () {
  "use strict";

  var CONFIG = {
    minDuration: 900,   // never flash by faster than this (ms)
    maxDuration: 6000,  // hard cap — loader hides no matter what (ms)
    holdAt100: 350,     // pause on "100%" before sliding away (ms)
    removeAfter: 900    // remove from DOM flow after the slide (ms)
  };

  var loader = document.getElementById("loader");
  if (!loader) return;

  var countEl = loader.querySelector(".count__text");
  var html = document.documentElement;
  var started = Date.now();
  var progress = 0;
  var finished = false;
  var tickTimer = null;
  var safetyTimer = null;

  var hasGsap = typeof window.gsap !== "undefined";

  html.classList.add("is-loading");
  if (!hasGsap) html.classList.add("no-gsap");

  /* ---------- 01. Counter ---------- */

  function render(value) {
    if (countEl) countEl.textContent = String(Math.floor(value));
  }

  function tick() {
    if (finished) return;
    // Ease toward 90% while assets load; the last 10% is the real finish.
    var step = Math.max(0.4, (90 - progress) * 0.06);
    progress = Math.min(progress + step, 90);
    render(progress);
    tickTimer = setTimeout(tick, 60 + Math.random() * 80);
  }

  function runToEnd(done) {
    clearTimeout(tickTimer);
    var from = progress;
    var start = Date.now();
    var span = 320;

    (function step() {
      var t = Math.min((Date.now() - start) / span, 1);
      progress = from + (100 - from) * t;
      render(progress);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        render(100);
        setTimeout(done, CONFIG.holdAt100);
      }
    })();
  }

  /* ---------- 02. Hide + reveal ---------- */

  function revealPage() {
    var fadeItems = document.querySelectorAll(".loading__fade");

    // FIX: the old code used querySelector(".loading-wrap"), which grabbed
    // only the FIRST wrap. index.html has two, so the second block's items
    // never animated. Collect them all.
    var items = [];
    document.querySelectorAll(".loading-wrap").forEach(function (wrap) {
      wrap.querySelectorAll(".loading__item").forEach(function (item) {
        items.push(item);
      });
    });

    if (hasGsap) {
      if (items.length) {
        window.gsap.set(items, { opacity: 0 });
        window.gsap.to(items, {
          duration: 1.1,
          ease: "power4",
          startAt: { y: 120 },
          y: 0,
          opacity: 1,
          delay: 0.15,
          stagger: 0.08
        });
      }
      if (fadeItems.length) {
        window.gsap.set(fadeItems, { opacity: 0 });
        window.gsap.to(fadeItems, { duration: 0.8, opacity: 1, delay: 0.5 });
      }
    } else {
      html.classList.add("is-revealed");
    }

    document.dispatchEvent(new CustomEvent("loader:done"));
  }

  function hide() {
    loader.classList.add("is-hiding");
    html.classList.remove("is-loading");
    revealPage();

    setTimeout(function () {
      loader.classList.add("loaded");
    }, CONFIG.removeAfter);
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);

    var waited = Date.now() - started;
    var delay = Math.max(0, CONFIG.minDuration - waited);

    setTimeout(function () {
      runToEnd(hide);
    }, delay);
  }

  /* ---------- 03. Readiness detection ---------- */

  function watchAssets() {
    // Preferred: imagesLoaded with "always" (fires even on broken images).
    if (typeof window.imagesLoaded === "function") {
      window.imagesLoaded(document.body).on("always", finish);
      return;
    }

    // Fallback: window load event.
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }
  }

  /* ---------- 04. Boot ---------- */

  tick();
  watchAssets();
  safetyTimer = setTimeout(finish, CONFIG.maxDuration);
})();