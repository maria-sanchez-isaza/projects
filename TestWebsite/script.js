/* Replace the video in index.html; tune chapter timings here as fractions of its duration. */
(() => {
  'use strict';
  const CONFIG = {
    scrollScreens: 6.5,
    chapters: [
      { id: 'intro', start: 0, end: .115, side: 'intro', at: 0 },
      { id: 'signage', start: .16, end: .34, side: 'left', at: .255 },
      { id: 'capture', start: .47, end: .65, side: 'right', at: .58 },
      { id: 'spatial', start: .81, end: 1, side: 'left', at: .92 }
    ],
    fade: .026,
    smoothing: 12,
    seekTolerance: .035
  };
  const root = document.documentElement;
  const experience = document.querySelector('.experience');
  const scene = document.querySelector('.scene');
  const video = document.querySelector('#showroom-video');
  const panels = [...document.querySelectorAll('[data-panel]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter]')];
  const bar = document.querySelector('#journey-progress');
  const label = document.querySelector('#journey-label');
  const status = document.querySelector('#video-status');
  const playButton = document.querySelector('#film-button');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 767px)');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  let enhanced = false, ready = false, failed = false, duration = 0;
  let targetProgress = 0, smoothProgress = 0, desiredTime = 0, raf = 0, lastTick = 0;
  let activePanel = '', startY = 0, distance = 1, seekingSince = 0;

  function layout() {
    const wasEnhanced = enhanced;
    enhanced = !reduced.matches && !narrow.matches && !navigator.connection?.saveData && !failed;
    root.classList.toggle('scrub-mode', enhanced);
    if (enhanced) {
      experience.style.height = `${CONFIG.scrollScreens * 100}svh`;
      video.controls = false; video.pause();
      document.querySelector('.fallback-pillars').setAttribute('aria-hidden', 'true');
      document.querySelector('.fallback-pillars').inert = true;
    } else {
      experience.style.height = '';
      document.querySelector('.fallback-pillars').removeAttribute('aria-hidden');
      document.querySelector('.fallback-pillars').inert = false;
      panels.forEach(panel => { panel.style.opacity = ''; panel.style.transform = ''; });
      panels[0].removeAttribute('aria-hidden'); panels[0].inert = false;
      panels.slice(1).forEach(panel => { panel.setAttribute('aria-hidden', 'true'); panel.inert = true; });
      video.pause();
      if (wasEnhanced && ready) video.currentTime = 0;
    }
    measure(); onScroll();
  }
  function measure() {
    startY = experience.getBoundingClientRect().top + window.scrollY - document.querySelector('.site-header').offsetHeight;
    distance = Math.max(1, experience.offsetHeight - scene.offsetHeight);
  }
  function opacityFor(chapter, progress) {
    if (chapter.id === 'intro') return clamp((chapter.end - progress) / CONFIG.fade);
    return Math.min(clamp((progress - chapter.start) / CONFIG.fade), chapter.end === 1 ? 1 : clamp((chapter.end - progress) / CONFIG.fade));
  }
  function drawCopy(progress) {
    if (!enhanced) return;
    let winner = null, maximum = 0;
    CONFIG.chapters.forEach(chapter => {
      const opacity = opacityFor(chapter, progress);
      const panel = panels.find(p => p.dataset.panel === chapter.id);
      panel.style.opacity = opacity.toFixed(3);
      panel.style.transform = `translateY(calc(-48% + ${(1 - opacity) * 12}px))`;
      if (opacity > maximum) { winner = chapter; maximum = opacity; }
    });
    const id = maximum > .25 ? winner.id : '';
    scene.dataset.side = maximum > .05 ? winner.side : 'none';
    scene.style.setProperty('--copy-opacity', maximum);
    if (id !== activePanel) {
      activePanel = id;
      panels.forEach(panel => {
        const active = panel.dataset.panel === id;
        panel.dataset.active = String(active); panel.setAttribute('aria-hidden', String(!active)); panel.inert = !active;
      });
      chapterLinks.forEach(a => { if (a.dataset.chapter === id) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    }
    bar.style.transform = `scaleX(${progress})`;
    label.textContent = progress > .97 ? 'Keep exploring below' : 'Scroll to explore';
  }
  function seekLatest() {
    if (!enhanced || !ready || failed || video.seeking) return;
    if (Math.abs(video.currentTime - desiredTime) > CONFIG.seekTolerance) {
      seekingSince = performance.now();
      try { video.currentTime = desiredTime; } catch { /* Metadata can race with a source change. */ }
    }
  }
  function tick(now) {
    raf = 0;
    if (!enhanced) return;
    const dt = Math.min(.05, (now - (lastTick || now - 16)) / 1000); lastTick = now;
    smoothProgress += (targetProgress - smoothProgress) * (1 - Math.exp(-CONFIG.smoothing * dt));
    if (Math.abs(smoothProgress - targetProgress) < .00025) smoothProgress = targetProgress;
    desiredTime = clamp(smoothProgress * duration, 0, Math.max(0, duration - .04));
    seekLatest();
    if (!ready) drawCopy(smoothProgress);
    if (Math.abs(smoothProgress - targetProgress) > .00025) raf = requestAnimationFrame(tick);
  }
  function onScroll() {
    if (!enhanced) return;
    targetProgress = clamp((window.scrollY - startY) / distance);
    if (!raf) { lastTick = 0; raf = requestAnimationFrame(tick); }
  }
  function jumpTo(id) {
    const chapter = CONFIG.chapters.find(c => c.id === id);
    if (!enhanced || !chapter) return false;
    window.scrollTo({ top: startY + chapter.at * distance, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    return true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (jumpTo(link.getAttribute('href').slice(1))) event.preventDefault();
    });
  });
  video.addEventListener('loadedmetadata', () => {
    duration = video.duration; ready = Number.isFinite(duration) && duration > 0;
    status.textContent = ''; onScroll();
    if (enhanced && location.hash) jumpTo(location.hash.slice(1));
  });
  video.addEventListener('loadeddata', () => { if (enhanced) { drawCopy(duration ? video.currentTime / duration : 0); seekLatest(); } });
  video.addEventListener('seeked', () => {
    if (!enhanced) return;
    drawCopy(duration ? video.currentTime / duration : 0);
    // A single outstanding seek: discard intermediate scroll events, render the latest target.
    seekLatest();
  });
  video.addEventListener('error', () => {
    failed = true; layout(); playButton.hidden = true;
    status.textContent = 'The film is unavailable. Explore our capabilities below.';
  });
  playButton.addEventListener('click', async () => {
    video.controls = true;
    try { await video.play(); playButton.hidden = true; } catch { status.textContent = 'Use the video controls to play the film.'; }
  });
  video.addEventListener('play', () => { if (enhanced) video.pause(); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  reduced.addEventListener('change', layout); narrow.addEventListener('change', layout);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { measure(); onScroll(); } });
  layout(); drawCopy(0);
})();
