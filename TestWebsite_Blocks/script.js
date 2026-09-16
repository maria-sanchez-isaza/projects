/* Fill in a video's relative path to replace that still with a loop.
   The existing image remains its poster, mobile/reduced-motion fallback,
   and the accessible description. Leave empty strings for still images. */
const MEDIA = {
  overview: { video: '' },
  signage: { video: '' },
  capture: { video: '' },
  spatial: { video: '' }
};

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const entries = [];
  const motionAllowed = () => !reduced.matches && !mobile.matches && !navigator.connection?.saveData;

  function update(entry) {
    const allow = motionAllowed() && !entry.failed;
    if (!allow) {
      entry.video.pause(); entry.video.hidden = true; entry.image.hidden = false; entry.button.hidden = true; return;
    }
    if (!entry.video.getAttribute('src')) entry.video.src = entry.source;
    entry.video.hidden = false; entry.image.hidden = true; entry.button.hidden = false;
    if (entry.inView && !entry.userPaused && !document.hidden) {
      entry.video.play().catch(() => { entry.userPaused = true; entry.video.hidden = true; entry.image.hidden = false; entry.button.textContent = 'Play motion'; entry.button.setAttribute('aria-label', 'Play animation'); });
    } else entry.video.pause();
  }
  Object.entries(MEDIA).forEach(([key, config]) => {
    if (!config.video) return;
    const figure = document.querySelector(`[data-media="${key}"]`);
    const image = figure.querySelector('img');
    const button = figure.querySelector('button');
    const video = document.createElement('video');
    video.poster = image.src; video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'metadata'; video.hidden = true;
    video.setAttribute('aria-label', image.alt); figure.insertBefore(video, button);
    const entry = { video, image, button, source: config.video, failed: false, inView: false, userPaused: false }; entries.push(entry);
    button.addEventListener('click', () => { entry.userPaused = !entry.userPaused; button.textContent = entry.userPaused ? 'Play motion' : 'Pause motion'; button.setAttribute('aria-label', `${entry.userPaused ? 'Play' : 'Pause'} ${key} animation`); update(entry); });
    video.addEventListener('error', () => { entry.failed = true; update(entry); });
    const observer = new IntersectionObserver(items => { entry.inView = items[0].isIntersecting; update(entry); }, { threshold: .2 });
    observer.observe(figure); update(entry);
  });
  [reduced, mobile].forEach(query => query.addEventListener('change', () => entries.forEach(update)));
  document.addEventListener('visibilitychange', () => entries.forEach(update));
})();
