/* ==========================================================
   UKM Olahraga Futsal POLIJE - script.js
   Fitur:
   1. Header menempel di atas + bayangan saat di-scroll
   2. Lightbox galeri (klik foto, panah kiri/kanan, Esc)
   3. Tombol "Kembali ke atas" melayang
   4. Animasi muncul saat di-scroll (scroll reveal)
   5. Tahun otomatis di footer
   6. Penanganan gambar yang gagal dimuat
   7. Menu mobile: tautan halaman aktif otomatis terlihat

   Cara pakai: tambahkan sebelum </body> di setiap halaman HTML:
   <script src="script.js" defer></script>
   (Semua CSS tambahan sudah disisipkan otomatis oleh file ini.)
   ========================================================== */

(function () {
  "use strict";

  /* ---------- Pengaturan ---------- */
  var CONFIG = {
    stickyHeader: true,      // header tetap di atas saat scroll
    backToTopAfter: 400,     // tombol ke atas muncul setelah scroll sekian px
    lightboxSelectors: ".gallery img, .card img, .achievement img, .prestasi-list img, .team img, .hero figure img, .about-home figure img, .profil figure img"
  };

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- CSS tambahan (disisipkan otomatis) ---------- */
  function injectStyles() {
    var css = "" +
      /* Header menempel */
      (CONFIG.stickyHeader
        ? ".site-header{position:sticky;top:0;z-index:50;transition:box-shadow .2s ease}" +
          ".site-header.is-scrolled{box-shadow:0 4px 14px rgba(0,0,0,.25)}" +
          "html{scroll-padding-top:110px}"
        : "") +

      /* Scroll reveal */
      ".reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}" +
      ".reveal.is-visible{opacity:1;transform:none}" +

      /* Gambar yang bisa diklik */
      ".js-zoomable{cursor:zoom-in}" +
      ".js-zoomable:focus-visible{outline:3px solid #5B8DEF;outline-offset:3px}" +

      /* Gambar gagal dimuat */
      "img.img-error{background:#E4E4E4;min-height:80px;object-fit:contain;color:transparent}" +

      /* Tombol kembali ke atas */
      ".back-to-top{position:fixed;right:20px;bottom:20px;z-index:60;width:48px;height:48px;" +
        "display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;line-height:1;" +
        "color:#000;background:#FFCC00;border:2px solid #050A30;border-radius:50%;cursor:pointer;" +
        "opacity:0;visibility:hidden;transform:translateY(12px);" +
        "transition:opacity .2s ease,transform .2s ease,visibility .2s,background-color .15s ease}" +
      ".back-to-top.is-show{opacity:1;visibility:visible;transform:none}" +
      ".back-to-top:hover{background:#FFD94D}" +
      ".back-to-top:focus-visible{outline:3px solid #5B8DEF;outline-offset:3px}" +

      /* Lightbox */
      ".lightbox{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;" +
        "justify-content:center;gap:12px;padding:56px 64px 32px;background:rgba(5,10,48,.92);" +
        "opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s}" +
      ".lightbox.is-open{opacity:1;visibility:visible}" +
      ".lightbox img{max-width:100%;max-height:78vh;object-fit:contain;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.5)}" +
      ".lightbox-caption{max-width:720px;color:#fff;font-size:14px;text-align:center}" +
      ".lightbox-count{color:#D0D0D0;font-size:13px}" +
      ".lightbox button{position:absolute;width:44px;height:44px;display:flex;align-items:center;justify-content:center;" +
        "font-size:24px;line-height:1;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.4);" +
        "border-radius:50%;cursor:pointer;transition:background-color .15s ease}" +
      ".lightbox button:hover{background:rgba(255,255,255,.28)}" +
      ".lightbox button:focus-visible{outline:3px solid #FFCC00;outline-offset:2px}" +
      ".lightbox-close{top:16px;right:16px}" +
      ".lightbox-prev{left:12px;top:50%;transform:translateY(-50%)}" +
      ".lightbox-next{right:12px;top:50%;transform:translateY(-50%)}" +
      ".lightbox.is-single .lightbox-prev,.lightbox.is-single .lightbox-next,.lightbox.is-single .lightbox-count{display:none}" +
      "body.no-scroll{overflow:hidden}" +
      "@media (max-width:640px){.lightbox{padding:56px 12px 24px}" +
        ".lightbox-prev{left:6px}.lightbox-next{right:6px}}" +

      /* Hormati preferensi gerak */
      "@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}" +
        ".back-to-top,.lightbox{transition:none}}";

    var style = document.createElement("style");
    style.setAttribute("data-by", "script.js");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- 1. Header: bayangan saat scroll ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header || !CONFIG.stickyHeader) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 3. Tombol kembali ke atas ---------- */
  function initBackToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Kembali ke atas");
    btn.innerHTML = "&uarr;";
    document.body.appendChild(btn);

    var ticking = false;
    function update() {
      btn.classList.toggle("is-show", window.scrollY > CONFIG.backToTopAfter);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      // Pindahkan fokus ke awal halaman agar pengguna keyboard tidak "tertinggal"
      var skip = document.querySelector(".skip-link");
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ---------- 4. Scroll reveal ---------- */
  function initReveal() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    var selector = [
      ".section > h2",
      ".section > p",
      ".about-home > figure",
      ".about-home > div",
      ".card-grid > li",
      ".gallery > li",
      ".prestasi-list > li",
      ".achievement-list > li",
      ".panel",
      ".profil > div",
      ".profil > figure",
      ".cta > *"
    ].join(",");

    var items = document.querySelectorAll(selector);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) {
      // Jeda bertahap untuk item bersaudara (maks. 5 langkah)
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(index, 5) * 80 + "ms";
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ---------- 5. Tahun otomatis di footer ---------- */
  function initYear() {
    var small = document.querySelector(".footer-copy small");
    if (!small) return;
    small.innerHTML = "&copy; " + new Date().getFullYear() + " UKM Olahraga Futsal POLIJE";
  }

  /* ---------- 6. Gambar gagal dimuat ---------- */
  function initImageFallback() {
    document.querySelectorAll("img").forEach(function (img) {
      function markError() {
        img.classList.add("img-error");
      }
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
        markError();
      } else {
        img.addEventListener("error", markError, { once: true });
      }
    });
  }

  /* ---------- 7. Menu mobile: tautan aktif terlihat ---------- */
  function initNavScroll() {
    var current = document.querySelector('.main-nav a[aria-current="page"]');
    var nav = document.querySelector(".main-nav");
    if (!current || !nav) return;
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = current.offsetLeft - nav.clientWidth / 2 + current.offsetWidth / 2;
    }
  }

  /* ---------- 2. Lightbox ---------- */
  function initLightbox() {
    var images = Array.prototype.slice.call(document.querySelectorAll(CONFIG.lightboxSelectors))
      .filter(function (img) { return !img.closest(".brand"); });
    if (!images.length) return;

    // Bangun elemen lightbox
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Penampil foto");
    box.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Tutup">&times;</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Foto sebelumnya">&#8249;</button>' +
      '<img alt="">' +
      '<button type="button" class="lightbox-next" aria-label="Foto berikutnya">&#8250;</button>' +
      '<p class="lightbox-caption"></p>' +
      '<p class="lightbox-count" aria-live="polite"></p>';
    document.body.appendChild(box);

    var bigImg = box.querySelector("img");
    var caption = box.querySelector(".lightbox-caption");
    var count = box.querySelector(".lightbox-count");
    var btnClose = box.querySelector(".lightbox-close");
    var btnPrev = box.querySelector(".lightbox-prev");
    var btnNext = box.querySelector(".lightbox-next");

    var group = [];      // daftar foto dalam grup yang sama
    var index = 0;
    var lastFocus = null;

    // Grup = kelompok foto dalam satu section / daftar yang sama
    function getGroup(img) {
      var container = img.closest("section") || document.body;
      return images.filter(function (i) { return container.contains(i); });
    }

    function show(i) {
      index = (i + group.length) % group.length;
      var img = group[index];
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt;
      caption.textContent = img.alt;
      count.textContent = (index + 1) + " / " + group.length;
    }

    function open(img) {
      lastFocus = document.activeElement;
      group = getGroup(img);
      box.classList.toggle("is-single", group.length < 2);
      show(group.indexOf(img));
      box.classList.add("is-open");
      document.body.classList.add("no-scroll");
      btnClose.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // Pasang pemicu pada tiap foto
    images.forEach(function (img) {
      img.classList.add("js-zoomable");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.addEventListener("click", function () { open(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(img);
        }
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(index - 1); });
    btnNext.addEventListener("click", function () { show(index + 1); });

    // Klik area gelap di luar foto/tombol = tutup
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    // Keyboard: Esc, panah, dan Tab terjebak di dalam dialog
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowLeft" && group.length > 1) {
        show(index - 1);
      } else if (e.key === "ArrowRight" && group.length > 1) {
        show(index + 1);
      } else if (e.key === "Tab") {
        var focusable = Array.prototype.slice.call(box.querySelectorAll("button"))
          .filter(function (b) { return b.offsetParent !== null; });
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Geser (swipe) di layar sentuh
    var touchStartX = null;
    box.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (touchStartX === null || group.length < 2) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------- Jalankan semua ---------- */
  function init() {
    injectStyles();
    initHeader();
    initImageFallback();
    initLightbox();
    initBackToTop();
    initReveal();
    initYear();
    initNavScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
