/* assets/js/catalog.js
   LW Private Catalog — single file
   - Slider (auto-removes broken/deleted media)
   - Fiche sheet modal
   - Pricing toggle
   - Copy MPN
   - Technical Viewer overlay (IMG + IFRAME) with safe fallback
*/

(() => {
  // ---------------------------
  // Shared: scroll lock (sheet + viewer)
  // ---------------------------
  let scrollLocks = 0;

  function lockScroll(on) {
    if (on) scrollLocks += 1;
    else scrollLocks = Math.max(0, scrollLocks - 1);

    const locked = scrollLocks > 0;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    document.body.style.overflow = locked ? "hidden" : "";
  }

  // ---------------------------
  // SLIDER
  // ---------------------------
  const mediaRoot = document.getElementById("mediaRoot");
  const dotsWrap = document.getElementById("dots");
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");

  let slides = Array.from(document.querySelectorAll(".slide"));
  let index = 0;
  let dots = [];

  function pauseLeavingVideo() {
    const leavingVideo = slides[index]?.querySelector("video");
    if (leavingVideo && typeof leavingVideo.pause === "function") leavingVideo.pause();
  }

  function rebuildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";

    dots = slides.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "dot" + (i === index ? " is-active" : "");
      d.setAttribute("aria-label", `Go to item ${i + 1}`);
      d.addEventListener("click", () => setActive(i));
      dotsWrap.appendChild(d);
      return d;
    });
  }

  function setActive(i) {
    slides = Array.from(document.querySelectorAll(".slide"));
    if (!slides.length) return;

    pauseLeavingVideo();

    slides.forEach((s) => s.classList.remove("is-active"));
    dots.forEach((d) => d.classList.remove("is-active"));

    index = (i + slides.length) % slides.length;

    slides[index].classList.add("is-active");
    if (dots[index]) dots[index].classList.add("is-active");
  }

  // Remove slides whose file was deleted (prevents "image 3/4" ghost slides)
  function removeBrokenSlides() {
    slides = Array.from(document.querySelectorAll(".slide"));
    if (!slides.length) return;

    let removed = false;

    slides.forEach((fig) => {
      const img = fig.querySelector("img");
      const vid = fig.querySelector("video");

      const remove = () => {
        // keep index stable
        const all = Array.from(document.querySelectorAll(".slide"));
        const idx = all.indexOf(fig);
        fig.remove();
        removed = true;

        // if we removed something before/at current index, adjust
        if (idx >= 0 && idx <= index) index = Math.max(0, index - 1);
      };

      // If already broken (common when cached HTML points to deleted files)
      if (img) {
        // If browser already knows it failed
        if ((img.complete && img.naturalWidth === 0) || !img.getAttribute("src")) remove();
        else img.addEventListener("error", remove, { once: true });
      } else if (vid) {
        // If video has no source or failed
        const src = vid.currentSrc || vid.getAttribute("src") || vid.querySelector("source")?.getAttribute("src");
        if (!src) remove();
        else vid.addEventListener("error", remove, { once: true });
      }
    });

    if (removed) {
      slides = Array.from(document.querySelectorAll(".slide"));
      if (!slides.length) return;
      slides.forEach((s) => s.classList.remove("is-active"));
      index = Math.min(index, slides.length - 1);
      slides[index].classList.add("is-active");
      rebuildDots();
    } else {
      rebuildDots();
    }
  }

  // init slider
  if (slides.length) {
    removeBrokenSlides();
    setActive(0);
  }

  if (prev) prev.addEventListener("click", () => setActive(index - 1));
  if (next) next.addEventListener("click", () => setActive(index + 1));

  // ---------------------------
  // FICHE (SHEET)
  // ---------------------------
  const openBtn = document.getElementById("openSheet");
  const closeBtn = document.getElementById("closeSheet");
  const sheet = document.getElementById("sheet");
  const scrim = document.getElementById("sheetScrim");

  let lastFocusSheet = null;

  function openSheet() {
    if (!sheet || !openBtn) return;
    lastFocusSheet = document.activeElement;

    sheet.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    lockScroll(true);

    const focusable = sheet.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    setTimeout(() => (focusable ? focusable.focus() : sheet.focus()), 0);
  }

  function closeSheet() {
    if (!sheet || !openBtn) return;

    sheet.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
    lockScroll(false);

    if (lastFocusSheet && typeof lastFocusSheet.focus === "function") lastFocusSheet.focus();
  }

  if (openBtn && sheet) openBtn.addEventListener("click", openSheet);
  if (closeBtn) closeBtn.addEventListener("click", closeSheet);
  if (scrim) scrim.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (e) => {
    if (!sheet || sheet.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeSheet();
    }
  });

  // ---------------------------
  // PRICING TOGGLE
  // ---------------------------
  const priceEl = document.getElementById("price");
  const priceSubEl = document.getElementById("priceSub");
  const segBtns = Array.from(document.querySelectorAll(".segBtn"));

  function fmtUSD(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return "";
    return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function applyPriceFrom(btn) {
    if (!btn || !priceEl || !priceSubEl) return;

    const price = btn.dataset.price;
    const metal = btn.dataset.metal || "";
    const weight = btn.dataset.weight || "";

    priceEl.textContent = fmtUSD(price);

    priceSubEl.innerHTML =
      `${metal}${metal && weight ? " · " : ""}${weight}` +
      `<br><span class="sub2">Lead time: 30 days</span>`;

    segBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
  }

  if (segBtns.length) {
    segBtns.forEach((btn) => btn.addEventListener("click", () => applyPriceFrom(btn)));
    applyPriceFrom(segBtns.find((b) => b.classList.contains("is-active")) || segBtns[0]);
  }

  // ---------------------------
  // COPY MPN
  // ---------------------------
  const copyBtn = document.getElementById("copyMPN");
  function getMPN() {
    // Prefer the <dd> under Specifications if present
    const dd = document.querySelector(".spec dd");
    if (dd && dd.textContent.trim()) return dd.textContent.trim();

    // Fallback: pill strong
    const pillStrong = document.querySelector(".pill strong");
    if (pillStrong && pillStrong.textContent.trim()) return pillStrong.textContent.trim();

    return "";
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const mpn = getMPN();
      if (!mpn) return;

      try {
        await navigator.clipboard.writeText(mpn);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy MPN"), 900);
      } catch {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = mpn;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = "Copy MPN"), 900);
        } finally {
          ta.remove();
        }
      }
    });
  }

  // ---------------------------
  // TECHNICAL VIEWER OVERLAY
  // ---------------------------
  const viewer = document.getElementById("techViewer");
  const viewerScrim = document.getElementById("techViewerScrim");
  const viewerClose = document.getElementById("techViewerClose");
  const viewerTitle = document.getElementById("techViewerTitle");
  const viewerOpenNew = document.getElementById("techViewerOpenNew");

  const viewerImg = document.getElementById("techViewerImg");
  const viewerFrame = document.getElementById("techViewerFrame");

  let lastFocusViewer = null;

  function ensureFallbackMsgEl() {
    let el = document.getElementById("techViewerMsg");
    if (el) return el;

    el = document.createElement("div");
    el.id = "techViewerMsg";
    el.style.padding = "14px 16px";
    el.style.fontSize = "13px";
    el.style.opacity = "0.85";
    el.style.display = "none";
    el.textContent =
      "This content cannot be embedded in an iframe on some hosts. Use “Open in new tab”.";
    const body = viewer?.querySelector(".overlayBody");
    if (body) body.prepend(el);
    return el;
  }

  function isImageURL(url) {
    const u = String(url || "").split("#")[0].split("?")[0].toLowerCase();
    return u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".png") || u.endsWith(".webp") || u.endsWith(".gif");
  }

  function openViewer(url, title) {
    if (!viewer) return;

    lastFocusViewer = document.activeElement;

    const safeTitle = title || "Technical viewer";
    viewerTitle.textContent = safeTitle;

    viewerOpenNew.href = url || "#";
    viewer.hidden = false;
    lockScroll(true);

    const msg = ensureFallbackMsgEl();
    msg.style.display = "none";

    // Reset both modes
    if (viewerFrame) {
      viewerFrame.src = "about:blank";
      viewerFrame.style.display = "none";
    }
    if (viewerImg) {
      viewerImg.src = "";
      viewerImg.hidden = true;
      viewerImg.style.display = "";
    }

    if (!url) {
      msg.style.display = "";
      return;
    }

    if (isImageURL(url)) {
      // IMG mode
      if (!viewerImg) return;

      viewerImg.alt = safeTitle;
      viewerImg.hidden = false;

      // If your CSS still only targets ".overlayBody iframe", force sane sizing here
      viewerImg.style.width = "100%";
      viewerImg.style.height = "100%";
      viewerImg.style.objectFit = "contain";
      viewerImg.style.background = "#0b0d10";

      viewerImg.onload = () => (msg.style.display = "none");
      viewerImg.onerror = () => (msg.style.display = "");

      viewerImg.src = url;
    } else {
      // IFRAME mode
      if (!viewerFrame) return;

      viewerFrame.style.display = "block";

      // Some hosts block embedding (X-Frame-Options / CSP). We can’t override that.
      // We do: set src after a tick + show fallback message if it stays blank.
      requestAnimationFrame(() => {
        viewerFrame.src = url;
      });

      // If the iframe gets blocked, browsers often keep it blank. Provide a visible hint.
      setTimeout(() => {
        // If still on same URL but appears empty, show message.
        // (No reliable cross-origin check; this is best-effort.)
        if (!viewer.hidden && viewerFrame.src && viewerFrame.src !== "about:blank") {
          msg.style.display = "";
        }
      }, 900);
    }

    // focus close for keyboard
    setTimeout(() => viewerClose?.focus(), 0);
  }

  function closeViewer() {
    if (!viewer) return;

    viewer.hidden = true;

    // Reset
    if (viewerFrame) {
      viewerFrame.src = "about:blank";
      viewerFrame.style.display = "none";
    }
    if (viewerImg) {
      viewerImg.src = "";
      viewerImg.hidden = true;
    }

    viewerOpenNew.href = "#";
    lockScroll(false);

    if (lastFocusViewer && typeof lastFocusViewer.focus === "function") lastFocusViewer.focus();
  }

  // Delegate clicks: any element with data-viewer-url triggers overlay
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-viewer-url]");
    if (!trigger) return;

    e.preventDefault();

    const url = trigger.getAttribute("data-viewer-url");
    const title = trigger.getAttribute("data-viewer-title") || "Technical viewer";

    openViewer(url, title);
  });

  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewerScrim) viewerScrim.addEventListener("click", closeViewer);

  document.addEventListener("keydown", (e) => {
    // ESC closes viewer first (if open), then sheet
    if (e.key !== "Escape") return;

    if (viewer && !viewer.hidden) {
      e.preventDefault();
      closeViewer();
      return;
    }
  });

  // ---------------------------
  // Final: re-check broken slides after load (covers cached HTML + deleted files)
  // ---------------------------
  window.addEventListener("load", () => {
    removeBrokenSlides();
  });
})();
