/* ==================================================================
 * cinematic.js — scroll-driven film layer
 * ------------------------------------------------------------------
 * Plays the Convalt film as a WebP frame sequence on a fixed canvas
 * behind the page, with the scroll position acting as the transport
 * control. This is how mont-fort.com gets its feel: not real-time
 * 3D, but pre-rendered footage that the reader scrubs.
 *
 * Why frames and not <video>: browsers cannot seek an inter-frame
 * encoded video accurately enough to scrub without stutter. Decoded
 * stills can be drawn on any frame, so the motion stays locked to
 * the scroll.
 *
 * Load order: after custom.js (needs nothing from it, but the
 * loader should already be on screen), and after three-motion.js.
 * No markup changes required — the stage is created here.
 *
 * Override anything by declaring window.CINEMATIC_CONFIG before
 * this file loads.
 * ================================================================== */
(function () {
  "use strict";

  /* ---------- 01. Configuration ---------- */

  var DEFAULTS = {
    /* Frame sets. Mobile is half the frame count at half the width. */
    desktop: { dir: "media/frames/desktop/", count: 360 },
    mobile: { dir: "media/frames/mobile/", count: 180 },
    prefix: "f_",
    pad: 4,
    ext: ".webp",

    /* Shown before the sequence is usable, and used whole when the
       reader has asked for reduced motion. */
    poster: "media/poster.jpg",

    /* Breakpoint for choosing the mobile set. */
    mobileWidth: 768,

    /* How hard the film chases the scroll. Lower is heavier and more
       cinematic; 1 would snap instantly. */
    smooth: 0.1,

    /* Default wash strength over the film, 0–1. Per-section values
       come from data-cine-scrim in the markup. */
    scrim: 0.55,

    /* Scroll-to-film mapping. null is linear: the film runs once,
       evenly, from the top of the page to the bottom.
       To hold the film still while a text section is read, or to
       linger on a shot, give an array of [scrollProgress, filmProgress]
       pairs, both 0–1 and both increasing. A pair sharing its film
       value with the next pair is a hold. Example:
         stops: [[0, 0], [0.25, 0.3], [0.4, 0.3], [1, 1]]
       runs the first third of the film over the first quarter of the
       page, freezes it while the reader passes 25%–40%, then plays
       the rest out to the footer. */
    stops: null,

    /* Frames are fetched coarse-first: every Nth frame, then the gaps.
       The whole film is scrubbable within a second or two, and sharpens
       as the rest arrive. */
    stride: 12,
    concurrency: 6
  };

  var cfg = Object.assign({}, DEFAULTS, window.CINEMATIC_CONFIG || {});

  /* ---------- 02. Bail-outs ---------- */

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var probe = document.createElement("canvas");
  if (!probe.getContext || !probe.getContext("2d")) return;

  /* Fine-grained control needs a pointer; a save-data connection or a
     low-memory device gets the poster instead of 16 MB of frames. */
  var conn = navigator.connection || {};
  var lowPower =
    conn.saveData === true ||
    /2g/.test(conn.effectiveType || "") ||
    (navigator.deviceMemory && navigator.deviceMemory < 2);

  var isMobile = window.innerWidth < cfg.mobileWidth;
  var set = isMobile ? cfg.mobile : cfg.desktop;

  /* ---------- 03. Stage ---------- */

  var stage = document.createElement("div");
  stage.className = "cine-stage";
  stage.setAttribute("aria-hidden", "true");

  var scrim = document.createElement("div");
  scrim.className = "cine-scrim";
  scrim.setAttribute("aria-hidden", "true");

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d", { alpha: false });
  stage.appendChild(canvas);

  document.body.insertBefore(scrim, document.body.firstChild);
  document.body.insertBefore(stage, document.body.firstChild);

  /* Static path: poster only, no sequence, no scroll binding. */
  if (reduceMotion || lowPower) {
    stage.style.backgroundImage = 'url("' + cfg.poster + '")';
    stage.removeChild(canvas);
    root.classList.add("cine-ready", "cine-static");
    return;
  }

  stage.style.backgroundImage = 'url("' + cfg.poster + '")';

  /* ---------- 04. Frame store ---------- */

  var total = set.count;
  var frames = new Array(total);
  var loaded = new Array(total);
  var queued = new Array(total);
  var inFlight = 0;
  var loadedCount = 0;
  var queue = [];

  function src(i) {
    var n = String(i + 1);
    while (n.length < cfg.pad) n = "0" + n;
    return set.dir + cfg.prefix + n + cfg.ext;
  }

  function enqueue(i) {
    if (i < 0 || i >= total || queued[i]) return;
    queued[i] = true;
    queue.push(i);
  }

  function pump() {
    while (inFlight < cfg.concurrency && queue.length) {
      load(queue.shift());
    }
  }

  function load(i) {
    inFlight++;
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      frames[i] = img;
      loaded[i] = true;
      loadedCount++;
      inFlight--;
      if (loadedCount === 1) ready();
      pump();
    };
    img.onerror = function () {
      /* A missing frame is skipped, not fatal — the player falls back
         to the nearest frame it does have. */
      inFlight--;
      pump();
    };
    img.src = src(i);
  }

  /* Coarse pass first, then every remaining frame in order. */
  (function buildQueue() {
    var i;
    for (i = 0; i < total; i += cfg.stride) enqueue(i);
    for (i = 0; i < total; i++) enqueue(i);
  })();

  var readyFired = false;
  function ready() {
    if (readyFired) return;
    readyFired = true;
    resize();
    root.classList.add("cine-ready");
  }

  /* ---------- 05. Scroll to film position ---------- */

  function scrollProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return Math.min(Math.max(window.scrollY / max, 0), 1);
  }

  function mapToFilm(p) {
    var stops = cfg.stops;
    if (!stops || stops.length < 2) return p;

    for (var i = 0; i < stops.length - 1; i++) {
      var a = stops[i];
      var b = stops[i + 1];
      if (p <= b[0]) {
        var span = b[0] - a[0];
        var t = span <= 0 ? 0 : (p - a[0]) / span;
        return a[1] + (b[1] - a[1]) * Math.min(Math.max(t, 0), 1);
      }
    }
    return stops[stops.length - 1][1];
  }

  /* ---------- 06. Per-section scrim ---------- */

  var scrimTargets = [];
  var scrimValue = cfg.scrim;
  var scrimShown = -1;

  function collectScrimTargets() {
    scrimTargets = [];
    document.querySelectorAll("[data-cine-scrim]").forEach(function (el) {
      var v = parseFloat(el.getAttribute("data-cine-scrim"));
      if (!isNaN(v)) scrimTargets.push({ el: el, value: v });
    });
  }

  function updateScrim() {
    var target = cfg.scrim;
    var mid = window.innerHeight * 0.5;

    for (var i = 0; i < scrimTargets.length; i++) {
      var r = scrimTargets[i].el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        target = scrimTargets[i].value;
        break;
      }
    }

    scrimValue += (target - scrimValue) * 0.06;
    if (Math.abs(scrimValue - scrimShown) > 0.004) {
      scrimShown = scrimValue;
      scrim.style.setProperty("--cine-scrim", scrimValue.toFixed(3));
    }
  }

  /* ---------- 07. Draw ---------- */

  var current = 0;   /* smoothed film position, 0–1 */
  var drawn = -1;    /* last frame index painted */
  var vw = 0;
  var vh = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    drawn = -1;
  }

  function nearestLoaded(i) {
    if (loaded[i]) return i;
    for (var d = 1; d < total; d++) {
      if (loaded[i - d]) return i - d;
      if (loaded[i + d]) return i + d;
    }
    return -1;
  }

  function paint(index) {
    var img = frames[index];
    if (!img) return;

    var cw = canvas.width;
    var ch = canvas.height;
    var scale = Math.max(cw / img.width, ch / img.height);
    var w = img.width * scale;
    var h = img.height * scale;

    ctx.drawImage(img, (cw - w) * 0.5, (ch - h) * 0.5, w, h);
  }

  /* ---------- 08. Loop ---------- */

  var running = true;
  var lastW = window.innerWidth;
  var lastH = window.innerHeight;

  function tick() {
    if (!running) return requestAnimationFrame(tick);

    if (window.innerWidth !== lastW || window.innerHeight !== lastH) {
      lastW = window.innerWidth;
      lastH = window.innerHeight;
      resize();
    }

    var target = mapToFilm(scrollProgress());
    current += (target - current) * cfg.smooth;
    if (Math.abs(target - current) < 0.0002) current = target;

    var index = Math.round(current * (total - 1));
    index = Math.min(Math.max(index, 0), total - 1);

    /* Keep the frames just ahead of the reader at the front of the
       queue, so a fast scroll doesn't outrun the loader. */
    for (var i = 1; i <= 4; i++) {
      if (!queued[index + i]) {
        queued[index + i] = true;
        queue.unshift(index + i);
      }
    }
    pump();

    if (index !== drawn) {
      var use = nearestLoaded(index);
      if (use >= 0) {
        paint(use);
        drawn = index;
      }
    }

    updateScrim();
    requestAnimationFrame(tick);
  }

  /* ---------- 09. Boot ---------- */

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
  });

  window.addEventListener("orientationchange", resize);

  collectScrimTargets();
  document.addEventListener("loader:done", collectScrimTargets);

  resize();
  pump();
  requestAnimationFrame(tick);

  /* Small console handle for tuning without editing the file. */
  window.cinematic = {
    config: cfg,
    frames: function () {
      return loadedCount + "/" + total;
    },
    seek: function (p) {
      current = Math.min(Math.max(p, 0), 1);
    }
  };
})();
