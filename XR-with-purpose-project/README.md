# XR, with purpose

A silent 65-second editorial animation for the Week 4 adult learning training proposal. Original 1920 × 1080 SVG composition; scales responsively. No audio, external fonts, runtime packages, or network assets.

## Open immediately

Double-click `XR-with-purpose.html` for the self-contained offline player. It includes all code and the image. Rebuild it with `node package-offline.mjs` after source edits.

## Run

From this folder, run `npm start`, then open http://127.0.0.1:4173. Node.js 20+ is sufficient; no installation or build step is needed. Serve `dist/` on any static host. JavaScript modules require HTTP rather than double-clicking index.html.

## Edit

- `dist/content.js`: wording, seven scene start/end times, palette, duration, export frame rate.
- `dist/composition.js`: pure `renderFrame(seconds)` SVG renderer, typography, positions, shared-element keyframes and easing. The animation ends on Digital Literacy; scene boundaries are configured in content.js.
- `dist/player.js`: transport, clock, timeline and transcript. It stops at 65 seconds and requires Restart to start over. Seeking backward from the end and pressing Play also works.
- `dist/styles.css`: responsive player and control styling.
- `dist/assets/faculty.png`: original AI-generated grayscale faculty cutout with transparency. Generation details in `ASSET.md`.

Space toggles playback when focus is outside a control. Left/right arrows seek one second outside controls; the focused native slider supports fine keyboard adjustments. Scene labels jump to their boundaries. Pause for close reading; the complete text is also below the player. The requested 65-second pacing is dense for a first reading.

## Verification

`npm test` checks all 1,951 30fps timestamps for deterministic forward/backward rendering, scene continuity, assignment coverage, and transport behavior including the non-looping end state. Browser QA additionally covers visual layouts and native controls.

## Future MP4 export

The renderer is independent of browser playback. For frame `n`, render at `n / 30`, for `n = 0..1949`. In a browser capture pipeline, call `window.motion.pause()`, then `window.motion.seek(n / 30)`, wait for the image to load, and capture `#composition` at 1920 × 1080. Encode the PNG sequence with FFmpeg at 30fps and no audio. Alternatively, wrap `renderFrame(useCurrentFrame()/fps)` in a Remotion component using `dangerouslySetInnerHTML`; resolve the relative faculty asset to Remotion's public asset URL. The project itself has no Remotion dependency. No MP4 has been rendered.

The full composition is an original design informed by the supplied visual reference; its exact layout and figures were not copied. Content follows the user's assignment brief.


