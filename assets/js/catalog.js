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

    // pausa cualquier video al salir de un slide
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

    // foco al primer elemento interactivo dentro del panel
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

    // Respeta tu layout actual
    priceSubEl.innerHTML = `${metal}${metal && weight ? " · " : ""}${weight}<br><span class="sub2">Lead time: 30 days</span>`;

    segBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
  }

  if (segBtns.length) {
    segBtns.forEach((btn) => {
      btn.addEventListener("click", () => applyPriceFrom(btn));
    });

    // inicial: el que ya venga marcado como activo o el primero
    applyPriceFrom(segBtns.find((b) => b.classList.contains("is-active")) || segBtns[0]);
  }
})();
