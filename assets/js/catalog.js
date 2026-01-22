(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  if (!slides.length) return;

  let index = 0;

  // create dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'dot' + (i === 0 ? ' is-active' : '');
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });

  const dots = Array.from(dotsWrap.children);

  function go(i) {
    slides[index].classList.remove('is-active');
    dots[index].classList.remove('is-active');

    index = (i + slides.length) % slides.length;

    slides[index].classList.add('is-active');
    dots[index].classList.add('is-active');
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
})();
