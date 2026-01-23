(() => {
  /* =========================================================
     SLIDER
     ========================================================= */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  let index = 0;
  let dots = [];

  function setActive(i) {
    if (!slides.length) return;

    slides[index]?.classList.remove('is-active');
    dots[index]?.classList.remove('is-active');

    index = (i + slides.length) % slides.length;

    slides[index]?.classList.add('is-active');
    dots[index]?.classList.add('is-active');
  }

  if (slides.length && dotsWrap) {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', `Go to item ${i + 1}`);
      d.addEventListener('click', () => setActive(i));
      dotsWrap.appendChild(d);
    });
    dots = Array.from(dotsWrap.children);
  }

  prev?.addEventListener('click', () => setActive(index - 1));
  next?.addEventListener('click', () => setActive(index + 1));

  slides[0]?.classList.add('is-active');

  /* =========================================================
     FICHE (SHEET)
     ========================================================= */
  const openBtn = document.getElementById('openSheet');
  const closeBtn = document.getElementById('closeSheet');
  const sheet = document.getElementById('sheet');
  const scrim = document.getElementById('sheetScrim');

  let lastFocus = null;

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function openSheet() {
    if (!sheet) return;
    lastFocus = document.activeElement;
    sheet.hidden = false;
    openBtn?.setAttribute('aria-expanded', 'true');
    lockScroll(true);
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
    openBtn?.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    lastFocus?.focus?.();
  }

  openBtn?.addEventListener('click', openSheet);
  closeBtn?.addEventListener('click', closeSheet);
  scrim?.addEventListener('click', closeSheet);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet && !sheet.hidden) closeSheet();
  });

  /* =========================================================
     TECH VIEWER (generic overlay) + fallback for blocked iframes
     ========================================================= */
  const viewer = document.getElementById('techViewer');
  if (!viewer) return;

  const viewerScrim = document.getElementById('techViewerScrim');
  const viewerClose = document.getElementById('techViewerClose');
  const titleEl = document.getElementById('techViewerTitle');
  const frame = document.getElementById('techViewerFrame');
  const openNew = document.getElementById('techViewerOpenNew');

  let fallbackTimer = null;

  function clearFallback() {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function closeViewer() {
    clearFallback();
    viewer.hidden = true;
    if (frame) frame.src = '';
    if (openNew) openNew.href = '#';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // If an embed is blocked, we won’t be able to reliably detect it via JS (cross-origin),
  // so we apply a safe timed fallback: if after N ms there’s no load event, open new tab.
  function openViewer(url, title) {
    clearFallback();

    const safeUrl = url || '';
    titleEl.textContent = title || 'Technical viewer';
    openNew.href = safeUrl || '#';

    viewer.hidden = false;
    viewer.style.zIndex = 9999;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // default: try embed
    if (frame) {
      frame.src = safeUrl;

      // If it loads, cancel fallback
      const onLoad = () => clearFallback();
      frame.addEventListener('load', onLoad, { once: true });

      // fallback window: 1200ms (tunable)
      // If blocked, iframe often never fires load or renders blank; we open new tab.
      fallbackTimer = setTimeout(() => {
        // Only fallback for known interactive 360 viewer domains (or HTML pages).
        const u = safeUrl.toLowerCase();
        const isLikelyBlocked =
          u.includes('cloudfront.net') ||
          u.endsWith('.html') ||
          u.includes('vision360');

        if (isLikelyBlocked) {
          window.open(safeUrl, '_blank', 'noopener');
          // optional: keep overlay open with "Open in new tab" visible, or close:
          // closeViewer();
        }
      }, 1200);
    }
  }

  viewerClose?.addEventListener('click', closeViewer);
  viewerScrim?.addEventListener('click', closeViewer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !viewer.hidden) closeViewer();
  });

  // Delegated triggers (buttons/links with data-viewer-url)
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-viewer-url]');
    if (!trigger) return;

    e.preventDefault();
    openViewer(
      trigger.getAttribute('data-viewer-url'),
      trigger.getAttribute('data-viewer-title') || trigger.textContent?.trim()
    );
  });
})();
