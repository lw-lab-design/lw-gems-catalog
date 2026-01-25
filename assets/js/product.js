(() => {
  "use strict";

  const $ = (q, root=document) => root.querySelector(q);

  function readProductData() {
    const el = $("#productData");
    if (!el) return null;
    try { return JSON.parse(el.textContent.trim() || "{}"); }
    catch { return null; }
  }

  function joinUrl(base, file) {
    if (!base) return file || "";
    if (!file) return base;
    if (/^https?:\/\//i.test(file)) return file;
    const b = base.endsWith("/") ? base : base + "/";
    return b + file.replace(/^\//, "");
  }

  function money(n, currency="USD") {
    if (typeof n !== "number") return "—";
    try {
      return new Intl.NumberFormat("en-US", { style:"currency", currency }).format(n);
    } catch {
      return `$${n.toFixed(2)}`;
    }
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute("hidden", "");
    else el.removeAttribute("hidden");
  }

  const data = readProductData();
  if (!data) return;

  const mediaRoot = $("#mediaRoot");
  const dots = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");

  const openSheetBtn = $("#openSheet");
  const sheet = $("#sheet");
  const sheetScrim = $("#sheetScrim");
  const closeSheetBtn = $("#closeSheet");

  const bottomTitle = $("#bottomTitle");
  const bottomSub = $("#bottomSub");

  const sheetH1 = $("#sheetH1");
  const metaRow = $("#metaRow");

  const priceSeg = $("#priceSeg");
  const priceValue = $("#priceValue");
  const priceSub = $("#priceSub");
  const priceDisclaimer = $("#priceDisclaimer");

  const specGrid = $("#specGrid");

  const nycNetworkLine = $("#nycNetworkLine");
  const appraisalMethod = $("#appraisalMethod");
  const appraisalNote = $("#appraisalNote");

  const btnGia = $("#btnGia");
  const btnXray = $("#btnXray");
  const btn360 = $("#btn360");

  const techViewer = $("#techViewer");
  const techViewerScrim = $("#techViewerScrim");
  const techViewerClose = $("#techViewerClose");
  const techViewerTitle = $("#techViewerTitle");
  const techViewerOpenNew = $("#techViewerOpenNew");
  const techViewerFrame = $("#techViewerFrame");
  const techViewerImg = $("#techViewerImg");
  const techViewerVideo = $("#techViewerVideo");

  // Title strip
  const title = data.title || "—";
  bottomTitle.textContent = `${title} · ${data.subtitle || ""}`.trim();
  bottomSub.textContent = "Documentation-ready. Report-linked. Standards-aligned.";

  // Slides
  const hero = Array.isArray(data.hero) ? data.hero : [];
  const heroUrls = hero.map((f) => joinUrl(data.mediaDir, f)).filter(Boolean);

  let idx = 0;

  function renderSlides() {
    mediaRoot.innerHTML = "";
    heroUrls.forEach((src, i) => {
      const fig = document.createElement("figure");
      fig.className = "slide" + (i === 0 ? " is-active" : "");
      fig.setAttribute("aria-label", `Image ${i+1}`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = `${title} — image ${i+1}`;
      img.loading = i === 0 ? "eager" : "lazy";
      img.decoding = "async";

      fig.appendChild(img);
      mediaRoot.appendChild(fig);
    });

    dots.innerHTML = "";
    heroUrls.forEach((_, i) => {
      const d = document.createElement("div");
      d.className = "dot" + (i === 0 ? " is-on" : "");
      d.addEventListener("click", () => go(i));
      dots.appendChild(d);
    });
  }

  function go(i) {
    const slides = mediaRoot.querySelectorAll(".slide");
    const dotEls = dots.querySelectorAll(".dot");
    if (!slides.length) return;

    idx = (i + slides.length) % slides.length;

    slides.forEach((s, k) => s.classList.toggle("is-active", k === idx));
    dotEls.forEach((d, k) => d.classList.toggle("is-on", k === idx));
  }

  prevBtn?.addEventListener("click", () => go(idx - 1));
  nextBtn?.addEventListener("click", () => go(idx + 1));

  renderSlides();

  // Sheet open/close
  function openSheet() {
    setHidden(sheet, false);
    openSheetBtn?.setAttribute("aria-expanded", "true");
    sheet.querySelector(".sheetPanel")?.focus();
    document.body.style.overflow = "hidden";
  }

  function closeSheet() {
    setHidden(sheet, true);
    openSheetBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  openSheetBtn?.addEventListener("click", openSheet);
  closeSheetBtn?.addEventListener("click", closeSheet);
  sheetScrim?.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (sheet && !sheet.hasAttribute("hidden")) closeSheet();
    if (techViewer && !techViewer.hasAttribute("hidden")) closeTechViewer();
  });

  // Header/meta
  sheetH1.textContent = title;

  metaRow.innerHTML = "";
  [
    `MPN: ${data.mpn || "—"}`,
    `Lead time: ${data.leadTimeDays ? `${data.leadTimeDays} days` : "—"}`
  ].forEach((t) => {
    const span = document.createElement("span");
    span.className = "pill";
    span.textContent = t;
    metaRow.appendChild(span);
  });

  // Pricing
  const pricing = data.pricing || {};
  const currency = pricing.currency || "USD";
  const options = (pricing.options || []).filter(Boolean);

  function setPrice(opt) {
    priceValue.textContent = money(opt?.price, currency);
    const metal = opt?.metal ? opt.metal : "—";
    const weight = opt?.weight ? opt.weight : "";
    priceSub.innerHTML = `${metal}${weight ? ` · ${weight}` : ""}<br>Lead time: ${data.leadTimeDays || "—"} days`;
    priceDisclaimer.textContent = pricing.disclaimer || "";
  }

  priceSeg.innerHTML = "";
  options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "segBtn" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.textContent = opt.label || `Option ${i+1}`;
    b.addEventListener("click", () => {
      priceSeg.querySelectorAll(".segBtn").forEach(x => x.classList.remove("is-active"));
      b.classList.add("is-active");
      setPrice(opt);
    });
    priceSeg.appendChild(b);
  });

  setPrice(options[0] || null);

  // Specs
  function addSpec(label, value) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = (value === undefined || value === null || value === "") ? "—" : String(value);
    row.appendChild(dt);
    row.appendChild(dd);
    specGrid.appendChild(row);
  }

  specGrid.innerHTML = "";
  const selected = options[0] || {};
  addSpec("MPN", data.mpn);
  addSpec("Finished metal", selected.metal ? `${selected.metal} (alt: ${options[1]?.metal || "—"})` : "—");
  addSpec("Approx. metal weight", selected.weight || "—");
  addSpec("Lead time", data.leadTimeDays ? `${data.leadTimeDays} days` : "—");

  const d = data.diamond || {};
  addSpec("Diamond shape", d.shape);
  addSpec("Carat", d.carat);
  addSpec("Color", d.color);
  addSpec("Clarity", d.clarity);
  addSpec("Cut", d.cut);
  addSpec("Polish", d.polish);
  addSpec("Symmetry", d.symmetry);
  addSpec("Fluorescence", d.fluorescence);

  // Appraisal / NYC
  const app = data.appraisal || {};
  nycNetworkLine.textContent = app.nycNetwork || "NYC appraisal network (GIA-aligned workflows).";

  appraisalMethod.innerHTML = "";
  (app.method || []).forEach((li) => {
    const item = document.createElement("li");
    item.textContent = li;
    appraisalMethod.appendChild(item);
  });

  appraisalNote.textContent = app.note || "";

  // Tech Viewer
  function closeTechViewer() {
    setHidden(techViewer, true);

    setHidden(techViewerFrame, true);
    setHidden(techViewerImg, true);
    setHidden(techViewerVideo, true);

    techViewerFrame.src = "about:blank";
    techViewerImg.src = "";

    techViewerVideo.pause();
    techViewerVideo.removeAttribute("src");
    techViewerVideo.load();

    techViewerOpenNew.href = "#";
    setHidden(techViewerOpenNew, true);

    document.body.style.overflow = "";
  }

  function openTechViewer({ title, mode, src, openNewUrl }) {
    techViewerTitle.textContent = title || "Technical viewer";
    setHidden(techViewer, false);
    document.body.style.overflow = "hidden";

    setHidden(techViewerFrame, true);
    setHidden(techViewerImg, true);
    setHidden(techViewerVideo, true);

    if (openNewUrl) {
      techViewerOpenNew.href = openNewUrl;
      setHidden(techViewerOpenNew, false);
    } else {
      setHidden(techViewerOpenNew, true);
    }

    if (mode === "img") {
      techViewerImg.alt = title || "";
      techViewerImg.src = src;
      setHidden(techViewerImg, false);
    } else if (mode === "video") {
      techViewerVideo.src = src;
      setHidden(techViewerVideo, false);
      techViewerVideo.play().catch(() => {});
    } else {
      techViewerFrame.src = src;
      setHidden(techViewerFrame, false);
    }
  }

  techViewerClose?.addEventListener("click", closeTechViewer);
  techViewerScrim?.addEventListener("click", closeTechViewer);

  // Documentation
  const doc = data.documentation || {};
  const giaUrl = joinUrl(data.mediaDir, doc.giaReportImage);
  const xrayUrl = doc.xrayVideoUrl || "";
  const v360 = doc.diamond360Url || "#";

  if (!giaUrl) btnGia?.setAttribute("disabled", "");
  if (!xrayUrl) btnXray?.setAttribute("disabled", "");
  if (btn360) btn360.href = v360;

  btnGia?.addEventListener("click", () => {
    if (!giaUrl) return;
    openTechViewer({
      title: "GIA Report",
      mode: "img",
      src: giaUrl,
      openNewUrl: giaUrl
    });
  });

  btnXray?.addEventListener("click", () => {
    if (!xrayUrl) return;
    openTechViewer({
      title: "X-ray video",
      mode: "video",
      src: xrayUrl,
      openNewUrl: xrayUrl
    });
  });

})();
