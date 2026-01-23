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

    const leavingVideo = slides[index]?.querySelector("video");
    if (leavingVideo) leavingVideo.pause();

    slides[index].classList.remove("is-active");
    if (dots[index]) dots[index].classList.remove("is-active");

    index = (i + slides.length) % slides.length;

    slides[index].classList.add("is-active");
    if (dots[index]) dots[index].classList.add("is-active");
  }

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

    const focusable = sheet.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    setTimeout(() => (focusable ? focusable.focus() : sheet.focus()), 0);
  }

  function closeSheet() {
    sheet.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
    lockScroll(false);
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
    priceSubEl.innerHTML =
      `${metal}${metal && weight ? " · " : ""}${weight}` +
      `<br><span class="sub2">Lead time: 30 days</span>`;

    segBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
  }

  if (segBtns.length) {
    segBtns.forEach((btn) => btn.addEventListener("click", () => applyPriceFrom(btn)));
    applyPriceFrom(segBtns.find((b) => b.classList.contains("is-active")) || segBtns[0]);
  }

  // ---------- TECH VIEWER (IMG or IFRAME) ----------
  const viewer = document.getElementById("techViewer");
  if (!viewer) return;

  const viewerScrim = document.getElementById("techViewerScrim");
  const viewerClose = document.getElementById("techViewerClose");
  const titleEl = document.getElementById("techViewerTitle");
  const openNew = document.getElementById("techViewerOpenNew");
  const frame = document.getElementById("techViewerFrame");
  const img = document.getElementById("techViewerImg");

  // Small inline note (created once)
  let noteEl = viewer.querySelector("[data-tech-note]");
  if (!noteEl) {
    noteEl = document.createElement("div");
    noteEl.setAttribute("data-tech-note", "1");
    noteEl.style.cssText =
      "padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.08);" +
      "font-size:12px;opacity:.78;display:none;";
    // insert note right under header
    const header = viewer.querySelector(".overlayHeader");
    header?.insertAdjacentElement("afterend", noteEl);
  }

  let lastFocusViewer = null;
  let iframeFallbackTimer = null;

  function isImageUrl(url) {
    const u = String(url || "").toLowerCase();
    return u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".png") || u.endsWith(".webp") || u.startsWith("data:image/");
  }

  function showNote(msg) {
    if (!noteEl) return;
    if (!msg) {
      noteEl.style.display = "none";
      noteEl.textContent = "";
      return;
    }
    noteEl.textContent = msg;
    noteEl.style.display = "block";
  }

  function lockScrollOn() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  function lockScrollOff() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function openViewer(url, title) {
    lastFocusViewer = document.activeElement;

    const safeTitle = title || "Technical viewer";
    const safeUrl = url || "";

    titleEl.textContent = safeTitle;
    openNew.href = safeUrl || "#";

    // reset
    showNote("");
    if (iframeFallbackTimer) window.clearTimeout(iframeFallbackTimer);
    iframeFallbackTimer = null;

    // IMG mode
    if (isImageUrl(safeUrl)) {
      if (frame) {
        frame.src = "";
        frame.hidden = true;
      }
      if (img) {
        img.src = safeUrl;
        img.alt = safeTitle;
        img.hidden = false;
      }
      viewer.hidden = false;
      lockScrollOn();
      viewerClose?.focus?.();
      return;
    }

    // IFRAME mode
    if (img) {
      img.src = "";
      img.hidden = true;
    }
    if (frame) {
      frame.hidden = false;
      frame.src = safeUrl;
    }

    viewer.hidden = false;
    lockScrollOn();
    viewerClose?.focus?.();

    // If the host blocks embedding, Safari often stays blank.
    // We can’t bypass that, but we can detect “no load” quickly and guide to new tab.
    iframeFallbackTimer = window.setTimeout(() => {
      // If user still sees blank after 1.2s, show guidance.
      showNote("This content cannot be embedded in an iframe on some hosts. Use “Open in new tab”.");
    }, 1200);
  }

  function closeViewer() {
    viewer.hidden = true;
    showNote("");
    if (iframeFallbackTimer) window.clearTimeout(iframeFallbackTimer);
    iframeFallbackTimer = null;

    if (frame) {
      frame.src = "";
      frame.hidden = false;
    }
    if (img) {
      img.src = "";
      img.hidden = true;
    }

    openNew.href = "#";
    lockScrollOff();

    if (lastFocusViewer && typeof lastFocusViewer.focus === "function") {
      lastFocusViewer.focus();
    }
  }

  // Click delegation: any element with data-viewer-url opens overlay
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-viewer-url]");
    if (!trigger) return;

    e.preventDefault();
    openViewer(
      trigger.getAttribute("data-viewer-url"),
      trigger.getAttribute("data-viewer-title") || trigger.textContent?.trim()
    );
  });

  viewerClose?.addEventListener("click", closeViewer);
  viewerScrim?.addEventListener("click", closeViewer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && viewer && !viewer.hidden) {
      e.preventDefault();
      closeViewer();
    }
  });

  // If iframe DOES load, remove warning note
  frame?.addEventListener("load", () => {
    showNote("");
    if (iframeFallbackTimer) window.clearTimeout(iframeFallbackTimer);
    iframeFallbackTimer = null;
  });

  // Optional: Copy MPN
  const copyBtn = document.getElementById("copyMPN");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const mpn = document.querySelector(".pill strong")?.textContent?.trim() || "";
      if (!mpn) return;
      try {
        await navigator.clipboard.writeText(mpn);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy MPN"), 1200);
      } catch {
        // fallback: do nothing
      }
    });
  }
})();
