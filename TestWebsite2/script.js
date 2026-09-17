/* Replace the video in index.html; tune chapter timings here as fractions of its duration. */
(() => {
  'use strict';
  const CONFIG = {
    scrollScreens: 6.5,
    chapters: [
      { id: 'intro', start: 0, end: .115, side: 'intro', at: 0 },
      { id: 'signage', start: .16, end: .385, side: 'left', at: .255 },
      { id: 'capture', start: .435, end: .70, side: 'right', at: .58 },
      { id: 'spatial', start: .835, end: 1, side: 'left', at: .92 }
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
  const short = matchMedia('(max-height: 600px)');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  let enhanced = false, ready = false, failed = false, duration = 0;
  let targetProgress = 0, smoothProgress = 0, desiredTime = 0, raf = 0, lastTick = 0;
  let activePanel = '', startY = 0, distance = 1;

  // Add future chapter loops here and a matching data-loop layer in the HTML.
  const LOOPS = { intro: 'assets/loops/intro-expressive.mp4', signage: 'assets/loops/signage-expressive.mp4' };
  const loopLayers = [...document.querySelectorAll('[data-loop]')];
  const motionButton = document.querySelector('#motion-button');
  let motionPaused = false;
  const motionAllowed = () => !reduced.matches && !navigator.connection?.saveData;
  function updateLoops() {
    let anyVisible = false;
    for (const layer of loopLayers) {
      const inline = layer.classList.contains('ambient-inline');
      const chapter = CONFIG.chapters.find(c => c.id === layer.dataset.loop);
      const selected = enhanced
        ? !inline && smoothProgress >= chapter.start && smoothProgress <= chapter.end
        : inline || layer.dataset.loop === 'intro';
      layer.hidden = !selected;
      const bounds = layer.getBoundingClientRect();
      const visible = selected && bounds.width > 0 && bounds.bottom > 86 && bounds.top < innerHeight;
      anyVisible ||= visible;
      const clip = layer.querySelector('video');
      const play = visible && motionAllowed() && !motionPaused && !document.hidden;
      if (!motionAllowed()) layer.classList.remove('is-playing');
      if (play && !clip.dataset.failed) {
        if (!clip.getAttribute('src')) { clip.src = LOOPS[layer.dataset.loop]; clip.muted = true; }
        if (clip.paused && !clip.dataset.pending) {
          clip.dataset.pending = 'true';
          clip.play().then(() => {
            delete clip.dataset.pending;
            // Recheck visibility/preferences if they changed while play was pending.
            updateLoops();
          }).catch(() => { delete clip.dataset.pending; });
        }
      } else clip.pause();
    }
    motionButton.hidden = !motionAllowed() || !anyVisible;
  }
  loopLayers.forEach(layer => {
    const clip = layer.querySelector('video');
    clip.addEventListener('playing', () => layer.classList.add('is-playing'));
    clip.addEventListener('error', () => { clip.dataset.failed = 'true'; layer.classList.remove('is-playing'); });
  });
  motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.textContent = motionPaused ? 'Resume animation' : 'Pause animation';
    updateLoops();
  });
  // Hold the journey camera at the loop compositions, move only between chapters.
  function journeyProgress(p) {
    const stops = [[0, 0], [.115, 0], [.16, 109 / 449], [.385, 109 / 449], [.435, .435], [1, 1]];
    for (let i = 1; i < stops.length; i++) {
      const [x, y] = stops[i], [px, py] = stops[i - 1];
      if (p <= x) return py + (y - py) * (p - px) / (x - px);
    }
    return 1;
  }

  function layout() {
    const wasEnhanced = enhanced;
    enhanced = !reduced.matches && !narrow.matches && !short.matches && !navigator.connection?.saveData && !failed;
    root.classList.toggle('scrub-mode', enhanced);
    if (enhanced) {
      experience.style.height = `${CONFIG.scrollScreens * 100}svh`;
      video.preload = 'auto'; video.controls = false; video.pause();
      if (!video.getAttribute('src')) video.src = video.dataset.src;
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
      video.preload = 'metadata';
      if (wasEnhanced && ready) video.currentTime = 0;
    }
    activePanel = ''; measure(); onScroll(); updateLoops();
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
      try { video.currentTime = desiredTime; } catch { /* Metadata can race with a source change. */ }
    }
  }
  function tick(now) {
    raf = 0;
    if (!enhanced) return;
    const dt = Math.min(.05, (now - (lastTick || now - 16)) / 1000); lastTick = now;
    smoothProgress += (targetProgress - smoothProgress) * (1 - Math.exp(-CONFIG.smoothing * dt));
    if (Math.abs(smoothProgress - targetProgress) < .00025) smoothProgress = targetProgress;
    desiredTime = clamp(journeyProgress(smoothProgress) * duration, 0, Math.max(0, duration - .04));
    seekLatest();
    drawCopy(smoothProgress); updateLoops();
    if (Math.abs(smoothProgress - targetProgress) > .00025) raf = requestAnimationFrame(tick);
  }
  function onScroll() {
    updateLoops();
    if (!enhanced) return;
    targetProgress = clamp((window.scrollY - startY) / distance);
    if (!raf) { lastTick = 0; raf = requestAnimationFrame(tick); }
  }
  function jumpTo(id) {
    const chapter = CONFIG.chapters.find(c => c.id === id);
    const destination = document.getElementById(id);
    if (!(enhanced && chapter) && !destination) return false;
    // Navigation bypasses both browser smooth scrolling and our scrub easing.
    // Cancel any pending scroll tick, including one from a previous jump.
    cancelAnimationFrame(raf); raf = 0; lastTick = 0;
    measure();
    if (enhanced && chapter) {
      window.scrollTo({ top: startY + chapter.at * distance, behavior: 'instant' });
    } else {
      const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      const margin = parseFloat(getComputedStyle(destination).scrollMarginTop) || 0;
      window.scrollTo({ top: destination.getBoundingClientRect().top + window.scrollY - padding - margin, behavior: 'instant' });
    }
    if (enhanced) {
      targetProgress = smoothProgress = clamp((window.scrollY - startY) / distance);
      desiredTime = clamp(journeyProgress(smoothProgress) * duration, 0, Math.max(0, duration - .04));
      // Supersede an in-flight seek rather than showing its intermediate target.
      if (ready && !failed) {
        try { video.currentTime = desiredTime; } catch { /* Retry when metadata is ready. */ }
      }
      drawCopy(smoothProgress);
    }
    updateLoops();
    if (enhanced && chapter) history.replaceState(null, '', `#${id}`);
    else if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    return true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const id = link.getAttribute('href').slice(1);
      if (jumpTo(id)) {
        event.preventDefault();
        if (link.classList.contains('skip-link')) {
          const destination = document.getElementById(id);
          destination.setAttribute('tabindex', '-1');
          destination.focus({ preventScroll: true });
          destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
        }
      }
    });
  });
  video.addEventListener('loadedmetadata', () => {
    duration = video.duration; ready = Number.isFinite(duration) && duration > 0;
    status.textContent = ''; onScroll();
    if (enhanced && location.hash) jumpTo(location.hash.slice(1));
  });
  video.addEventListener('loadeddata', () => { if (enhanced) { drawCopy(smoothProgress); seekLatest(); } });
  video.addEventListener('seeked', () => {
    if (!enhanced) return;
    drawCopy(smoothProgress);
    // A single outstanding seek: discard intermediate scroll events, render the latest target.
    seekLatest();
  });
  video.addEventListener('error', () => {
    failed = true; layout(); playButton.hidden = true;
    status.textContent = 'The film is unavailable. Explore our capabilities below.';
  });
  video.addEventListener('play', () => { if (enhanced) video.pause(); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  reduced.addEventListener('change', layout); narrow.addEventListener('change', layout); short.addEventListener('change', layout);
  navigator.connection?.addEventListener('change', layout);
  document.addEventListener('visibilitychange', () => { updateLoops(); if (!document.hidden) { measure(); onScroll(); } });
  layout(); drawCopy(0);
})();


