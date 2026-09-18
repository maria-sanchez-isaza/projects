# GLB vs Video comparison

Serve this folder with any static HTTP server, then open index.html. For example:

```sh
python -m http.server 4183
```

Open http://localhost:4183/. Opening index.html directly via file:// is not supported by browser module/loading security.

All model, video, Three.js modules, Meshopt decoder, and licenses are local. No build step or CDN is needed. The original GLB camera and controls are retained. The viewer uses a room environment, warm key light, soft shadow map, tone mapping, and a small half-resolution bloom and color pass. Replay both restores the original camera and starts both intros together. The video plays once and holds its last frame; the GLB then continues its idle loop. The panels are equal 16:9 sizes and stack below 900px.

Open `http://localhost:4183/?renderDebug=1` to show developer sliders for exposure, ambient and key light, saturation, contrast, bloom, and reflections. The tuning panel is hidden by default.

Source assets are copied byte-for-byte; the original viewer, model, video, and Blender project were not edited by this comparison page.
