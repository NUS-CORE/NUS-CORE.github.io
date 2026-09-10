/* WorldSlider project page helpers.
   1. Videos are only fetched once they come near the viewport (data-src -> src),
      so a page with dozens of clips still loads fast.
   2. Off-screen videos are paused; on-screen ones autoplay muted and loop.
   3. Simple tab groups for the galleries. */
(function () {
  "use strict";

  function attach(video) {
    if (video.dataset.loaded) return;
    var src = video.getAttribute("data-src");
    if (src) {
      var source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
    }
    video.dataset.loaded = "1";
  }

  var NEAR = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          attach(e.target);
          NEAR.unobserve(e.target);
        }
      });
    },
    { rootMargin: "400px 0px" }
  );

  var VISIBLE = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          attach(v);
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    },
    { threshold: 0.15 }
  );

  function register(root) {
    (root || document).querySelectorAll("video[data-src]").forEach(function (v) {
      v.muted = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.loop = true;
      v.preload = "none";
      NEAR.observe(v);
      VISIBLE.observe(v);
    });
  }

  /* Tab groups: <div class="ws-tabs" data-tabs="gallery"> with .ws-tab[data-panel]
     switching sibling .ws-panel[data-panel] elements. */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (bar) {
      var name = bar.getAttribute("data-tabs");
      var panels = document.querySelectorAll('.ws-panel[data-tabs="' + name + '"]');
      bar.querySelectorAll(".ws-tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
          bar.querySelectorAll(".ws-tab").forEach(function (t) {
            t.classList.toggle("is-active", t === tab);
          });
          panels.forEach(function (p) {
            var on = p.getAttribute("data-panel") === tab.getAttribute("data-panel");
            p.hidden = !on;
            if (on) register(p);
            else p.querySelectorAll("video").forEach(function (v) { v.pause(); });
          });
        });
      });
    });
  }


  /* A video shown small beside a figure stays readable through fullscreen. */
  function initFigures() {
    document.querySelectorAll(".ws-fs").forEach(function (btn) {
      var media = document.querySelector(btn.getAttribute("data-target"));
      if (!media || !media.requestFullscreen) { btn.hidden = true; return; }
      btn.addEventListener("click", function () {
        media.requestFullscreen().catch(function () {});
      });
    });
  }

  /* Carousel: <div class="ws-carousel" data-carousel> holding a .ws-carousel-track of
     .ws-slide figures, prev/next buttons and a .ws-carousel-nav of .ws-tab buttons.
     Off-screen slides are clipped by the viewport, so the visibility observer above
     pauses them and starts the one slid into view. */
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var track = root.querySelector(".ws-carousel-track");
      var slides = track.querySelectorAll(".ws-slide");
      var dots = root.querySelectorAll(".ws-carousel-nav .ws-tab");
      var viewport = root.querySelector(".ws-carousel-viewport");
      var index = 0;

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = "translateX(-" + index * 100 + "%)";
        dots.forEach(function (d, k) {
          d.classList.toggle("is-active", k === index);
          d.setAttribute("aria-pressed", k === index ? "true" : "false");
        });
        slides.forEach(function (sl, k) {
          sl.setAttribute("aria-hidden", k === index ? "false" : "true");
          var v = sl.querySelector("video");
          if (v) {
            if (k === index) { attach(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
            else if (!v.paused) v.pause();
          }
        });
      }

      root.querySelector(".is-prev").addEventListener("click", function () { go(index - 1); });
      root.querySelector(".is-next").addEventListener("click", function () { go(index + 1); });
      dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });

      root.tabIndex = 0;
      root.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { go(index - 1); e.preventDefault(); }
        if (e.key === "ArrowRight") { go(index + 1); e.preventDefault(); }
      });

      /* swipe / drag: commit on a 40px horizontal move, mouse and touch alike */
      var x0 = null;
      viewport.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
      viewport.addEventListener("pointerup", function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0; x0 = null;
        if (dx <= -40) go(index + 1);
        else if (dx >= 40) go(index - 1);
      });
      viewport.addEventListener("pointercancel", function () { x0 = null; });

      go(0);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    register(document);
    initTabs();
    initFigures();
    initCarousels();
  });

  window.WorldSlider = { register: register };
})();
