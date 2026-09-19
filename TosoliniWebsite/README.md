# Tosolini Productions — self-contained website

This is the self-contained working version of the Tosolini Productions one-page website. The showroom GLB, local Three.js modules, post-processing code, logo, and Spatial Computing thumbnails are all stored inside this folder.

Serve this folder as the static site root. For example, run this from inside the folder:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080/`. For GitHub Pages, publish this folder as the site root. There is no build step, and runtime assets do not depend on files outside this folder.

The small **3D tuning** button appears while the showroom is visible. Click it to show or hide the seven live renderer controls; add `?renderDebug=1` to open the panel on load. The sliders start at exposure **0.71**, ambient **0.84**, key light **2.25**, saturation **0.92**, contrast **0.99**, bloom **0.13**, and reflections **0.32** on every page load. Adjustments are session-only.

The exported `Intro` clip plays once, followed by the looping `Idle_Loop`. Scrolling between the overview, signage, capture, and spatial sections preserves the original camera behavior. Chapter and in-page navigation links cut immediately to the saved target camera position. The remaining services, clients, and contact sections use ordinary HTML/CSS.
