/* =========================================================
   catalog.js — LW Private Catalog
   Includes:
   - Slider (images)
   - Fiche (sheet) open/close
   - Pricing toggle
   - Technical Viewer Overlay (generic) with IMG + IFRAME modes
   ========================================================= */

(() => {
  // ---------- SLIDER ----------
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsWrap = document.getElementById("dots");
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");

  let index = 0;
  let dots = [];

  function setActive(i) {
    if (!slides.length) return;

    // pause any <video> when leaving a slide
    const leavingVideo = slides[index]?.querySelector("video");
    if (leavingVideo) leavingVideo.pause();

    slides[index].classList.remove("is-active");
    if (dots[index]) dots[index].classList.remove("is-active");

    index = (i + slides.length) % slides.length;

    slides[index].classList.add("is-active");
    if (dots[index]) dots[index].classList.add("is-active");
  }

  // dots
  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "dot" + (i === 0 ? " is-active" : "");
      d.setAttribute("aria-label", `Go to item ${i + 1}`);
      d.addEventListener("click", () => setActive(i));
      dotsWrap.appendChild(d);
    });
    dots = Array.from(dotsWrap.children);
  }

  if (prev) prev.addEventListener("click", () => setActive(index - 1));
  if (next) next.addEventListener("click", () => setActive(index + 1));

  // ---------- FICHE (SHEET) ----------
  const openBtn = document.getElementById("openSheet");
  const closeBtn = document.getElementById("closeSheet");
  const sheet = document.getElementById("sheet");
  const scrim = document.getElementById("sheetScrim");

  if (!sheet || !openBtn) return;

  let lastFocus = null;

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function openSheet() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    lockScroll(true);

    // focus first interactive element in the panel
    const focusable = sheet.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    setTimeout(() => (focusable ? focusable.focus() : sheet.focus()), 0);
  }

  function closeSheet() {
    sheet.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");

    // If technical viewer is open, keep scroll locked; otherwise unlock.
    const techViewer = document.getElementById("techViewer");
    const techOpen = techViewer && !techViewer.hidden;
    lockScroll(techOpen);

    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openBtn.addEventListener("click", openSheet);
  if (closeBtn) closeBtn.addEventListener("click", closeSheet);
  if (scrim) scrim.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (e) => {
    if (sheet.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeSheet();
    }
  });

  // ---------- PRICING TOGGLE ----------
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

    // preserve current layout
    priceSubEl.innerHTML = `${metal}${metal && weight ? " · " : ""}${weight}<br><span class="sub2">Lead time: 30 days</span>`;

    segBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
  }

  if (segBtns.length) {
    segBtns.forEach((btn) => {
      btn.addEventListener("click", () => applyPriceFrom(btn));
    });

    // initial: active button or first
    applyPriceFrom(segBtns.find((b) => b.classList.contains("is-active")) || segBtns[0]);
  }

  /* =========================================================
     Technical Viewer Overlay (generic) — IMG + IFRAME modes
     Requirements in HTML:
       - #techViewer
       - #techViewerScrim
       - #techViewerClose
       - #techViewerTitle
       - #techViewerOpenNew
       - #techViewerImg   (img)
       - #techViewerFrame (iframe)
     Triggers:
       Any element with:
         data-viewer-url="..."
         data-viewer-title="..."
     ========================================================= */

  const viewer = document.getElementById("techViewer");
  if (!viewer) return;

  const viewerScrim = document.getElementById("techViewerScrim");
  const viewerClose = document.getElementById("techViewerClose");
  const viewerTitle = document.getElementById("techViewerTitle");
  const viewerOpenNew = document.getElementById("techViewerOpenNew");
  const viewerFrame = document.getElementById("techViewerFrame");
  const viewerImg = document.getElementById("techViewerImg");

  function isImageUrl(url) {
    const u = (url || "").toLowerCase();
    return (
      u.endsWith(".jpg") ||
      u.endsWith(".jpeg") ||
      u.endsWith(".png") ||
      u.endsWith(".webp")
    );
  }

  function openViewer(url, title) {
    const safeUrl = url || "";
    const safeTitle = title || "Technical viewer";

    if (viewerTitle) viewerTitle.textContent = safeTitle;
    if (viewerOpenNew) viewerOpenNew.href = safeUrl || "#";

    // Choose rendering mode
    if (isImageUrl(safeUrl)) {
      // IMAGE MODE
      if (viewerFrame) {
        viewerFrame.src = "";
        viewerFrame.hidden = true;
      }
      if (viewerImg) {
        viewerImg.src = safeUrl;
        viewerImg.alt = safeTitle;
        viewerImg.hidden = false;
      }
    } else {
      // IFRAME MODE (HTML/PDF/360)
      if (viewerImg) {
        viewerImg.src = "";
        viewerImg.alt = "";
        viewerImg.hidden = true;
      }
      if (viewerFrame) {
        viewerFrame.hidden = false;
        viewerFrame.src = safeUrl;
      }
    }

    viewer.hidden = false;
    lockScroll(true);
  }

  function closeViewer() {
    viewer.hidden = true;

    if (viewerFrame) viewerFrame.src = "";
    if (viewerImg) {
      viewerImg.src = "";
      viewerImg.alt = "";
      viewerImg.hidden = true;
    }
    if (viewerOpenNew) viewerOpenNew.href = "#";

    // If fiche is open, keep scroll locked; otherwise unlock.
    lockScroll(!sheet.hidden);
  }

  // Delegated click for any technical viewer trigger
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-viewer-url]");
    if (!trigger) return;

    e.preventDefault();
    openViewer(
      trigger.getAttribute("data-viewer-url"),
      trigger.getAttribute("data-viewer-title")
    );
  });

  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewerScrim) viewerScrim.addEventListener("click", closeViewer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !viewer.hidden) {
      e.preventDefault();
      closeViewer();
    }
  });
})();
