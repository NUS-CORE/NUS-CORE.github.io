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

  document.addEventListener("DOMContentLoaded", function () {
    register(document);
    initTabs();
    initFigures();
  });

  window.WorldSlider = { register: register };
})();
