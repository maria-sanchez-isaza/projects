# Tosolini Productions — live showroom

This is a separate one-page version of the [TestWebsite2 prototype](https://maria-sanchez-isaza.github.io/projects/TestWebsite2/). It uses the existing showroom GLB and local Three.js modules from the parent directory. The original comparison viewer and source model are unchanged.

Serve the **repository root** as a static site, then open `/tosolini-3d/`. For example:

```sh
python -m http.server 8080
```

Open `http://localhost:8080/tosolini-3d/`. For GitHub Pages or Cloudflare Pages, publish the repository root so the relative `../assets/`, `../vendor/`, and `../render-effects.js` paths remain available. There is no build step or external runtime dependency.

The small **3D tuning** button appears while the showroom is visible. Click it to show or hide the seven live renderer controls; add `?renderDebug=1` to open the panel on load. The sliders start at exposure **0.71**, ambient **0.84**, key light **2.25**, saturation **0.92**, contrast **0.99**, bloom **0.13**, and reflections **0.32** on every page load. Adjustments are session-only.

The exported `Intro` clip plays once, followed by the looping `Idle_Loop`. Scroll between the overview, signage, capture, and spatial sections, or use their chapter links to move directly through the camera positions. The remaining services, clients, and contact sections use ordinary HTML/CSS.
