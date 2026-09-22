(() => {
  'use strict';
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.slide')];
  const controls = carousel.querySelector('.carousel-controls');
  const toggle = carousel.querySelector('.play-toggle');
  const counter = carousel.querySelector('.slide-count');
  const status = carousel.querySelector('.carousel-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = !motion.matches;
  let timer;
  let hovered = false;
  let touchStart = null;
  let toggleBeforePointer = null;
  controls.hidden = false;
  function show(index, announce = false) {
    slides[current].hidden = true;
    current = (index + slides.length) % slides.length;
    slides[current].hidden = false;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    if (announce) status.textContent = `Image ${current + 1} of ${slides.length}: ${slides[current].querySelector('img').alt}`;
  }
  function schedule() {
    clearInterval(timer);
    if (playing && !hovered && !document.hidden) timer = setInterval(() => show(current + 1), 6000);
  }
  function updatePlay() {
    toggle.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
    toggle.firstElementChild.textContent = playing ? 'Ⅱ' : '▷';
    schedule();
  }
  function step(direction) { playing = false; show(current + direction, true); updatePlay(); }
  carousel.querySelector('.previous').addEventListener('click', () => step(-1));
  carousel.querySelector('.next').addEventListener('click', () => step(1));
  toggle.addEventListener('pointerdown', () => { toggleBeforePointer = playing; });
  toggle.addEventListener('pointercancel', () => { toggleBeforePointer = null; });
  toggle.addEventListener('blur', () => { toggleBeforePointer = null; });
  toggle.addEventListener('click', () => {
    playing = !(toggleBeforePointer ?? playing);
    toggleBeforePointer = null;
    updatePlay();
  });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { playing = false; updatePlay(); });
  carousel.querySelector('.slides').addEventListener('touchstart', event => {
    touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }, { passive: true });
  carousel.querySelector('.slides').addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { if (motion.matches) { playing = false; updatePlay(); } });
  updatePlay();
})();
