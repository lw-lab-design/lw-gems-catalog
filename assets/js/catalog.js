(() => {
  /* =========================================================
     SLIDER
     ========================================================= */

  const slides = Array.from(document.querySelectorAll('.slide'))
    .filter(slide => {
      const img = slide.querySelector('img');
      return !img || img.getAttribute('src');
    });

  const dotsWrap = document.getElementById('dots');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  let index = 0;
  let dots = [];

  function setActive(i) {
    if (!slides.length) return;

    slides[index].classList.remove('is-active');
    if (dots[index]) dots[index].classList.remove('is-active');

    index = (i + slides.length) % slides.length;

    slides[index].classList.add('is-active');
    if (dots[index]) dots[index].classList.add('is-active');
  }

  if (slides.length && dotsWrap) {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', `Go to image ${i + 1}`);
      d.addEventListener('click', () => setActive(i));
      dotsWrap.appendChild(d);
    });
    dots = Array.from(dotsWrap.children);
  }

  if (prev) prev.addEventListener('click', () => setActive(index - 1));
  if (next) next.addEventListener('click', () => setActive(index + 1));

  if (slides[0]) slides[0].classList.add('is-active');

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
    lastFocus = document.activeElement;
    sheet.hidden = false;
    openBtn?.setAttribute('aria-expanded', 'true');
    lockScroll(true);
  }

  function closeSheet() {
    sheet.hidden = true;
    openBtn?.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    lastFocus?.focus?.();
  }

  openBtn?.addEventListener('click', openSheet);
  closeBtn?.addEventListener('click', closeSheet);
  scrim?.addEventListener('click', closeSheet);

  document.addEventListener('keydown', e => {
    if (!sheet?.hidden && e.key === 'Escape') closeSheet();
  });

  /* =========================================================
     TECHNICAL VIEWER OVERLAY (TOP LAYER)
     ========================================================= */

  const viewer = document.getElementById('techViewer');
  if (!viewer) return;

  const viewerScrim = document.getElementById('techViewerScrim');
  const viewerClose = document.getElementById('techViewerClose');
  const titleEl = document.getElementById('techViewerTitle');
  const frame = document.getElementById('techViewerFrame');
  const openNew = document.getElementById('techViewerOpenNew');

  function openViewer(url, title) {
    titleEl.textContent = title || 'Technical viewer';
    frame.src = url || '';
    openNew.href = url || '#';

    viewer.hidden = false;
    viewer.style.zIndex = 9999;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    viewer.hidden = true;
    frame.src = '';
    openNew.href = '#';

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-viewer-url]');
    if (!trigger) return;

    e.preventDefault();
    openViewer(
      trigger.getAttribute('data-viewer-url'),
      trigger.getAttribute('data-viewer-title')
    );
  });

  viewerClose?.addEventListener('click', closeViewer);
  viewerScrim?.addEventListener('click', closeViewer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !viewer.hidden) closeViewer();
  });
})();
