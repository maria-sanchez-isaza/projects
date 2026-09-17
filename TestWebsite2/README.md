# Tosolini Productions — website prototype

The existing design, content, sticky desktop showroom journey, and responsive service sections are preserved. Intro and Interactive Signage now use fixed-camera ambient loops. The original Blender showroom and source renders are preserved. Stronger character animations are saved in separate Blender copies under `../Website_Loop_Assets/expressive/`.

## Preview

Double-click `OPEN_WEBSITE.cmd`, or run `node server.mjs` and open http://127.0.0.1:4173. No build or package installation is required. The server supports video byte ranges. Directly opening `index.html` also works.

## Playback

- Desktop: the Intro plays on arrival. Scroll through the showroom journey to Signage, where a second loop plays with the camera held still. Capture and Spatial retain scroll-controlled footage.
- Signage copy sits on the left to leave the touchscreen user visible on the right.
- Phones and short screens: normal page flow, inline hero and Signage loops, full 16:9 framing.
- Both loops use muted inline native playback; offscreen clips and background tabs pause. The fixed Pause animation button pauses both loops and remains available beside the mobile sections.
- Reduced motion and data-saving mode show posters and normal-flow content, without initiating video downloads. Changing reduced motion while open stops playback immediately.
- If autoplay is blocked or a loop fails to load, its poster remains visible. Resume animation provides a user-initiated playback attempt. Without JavaScript, the page shows stills and service content.
- The showroom film remains available as a normal link on the mobile/static layout.

## Assets and reproduction

The active loops are rendered from separate `Intro_Expressive.blend` and `Signage_Expressive.blend` projects in `../Website_Loop_Assets/expressive/`. They derive from `Tosolini_Showroom_Scroll_Journey_v4_Premium.blend`, whose SHA256 is unchanged. The presenter lifts his hand, points/swipes across the touchscreen, and returns it to his side. The overview also includes a scanner sweep and a VR hand gesture. The wrist travels approximately 60 cm through the animation.

Both sequences are 1280 × 720, 96 unique frames, 24 fps, 4 seconds. Frame 97 is the closing endpoint and is excluded from export. Build verification checks fixed camera transforms at every frame and matching start/end poses; image verification checks the wrap against normal frame-to-frame variation.

`assets/loops/intro-expressive.mp4` and `signage-expressive.mp4` use H.264, CRF 19, yuv420p, fast-start metadata, and no audio. Matching JPEGs provide static fallbacks. The previous subtle loops are retained as `intro.mp4` and `signage.mp4` for comparison. `assets/showroom-journey.mp4` (~2.75 MB) is the existing optimized, silent camera journey. The original `AI-Reneder-Test.mp4` is also preserved.

To regenerate the current website encodes after rendering:

```powershell
./tools/encode-expressive-loops.ps1 -Ffmpeg 'C:/path/to/ffmpeg.exe'
```

The Blender build/render scripts and their instructions are in `../Website_Loop_Assets/expressive/README.md`. The older `encode-loops.ps1` only regenerates the previous subtle loops.

## Future loops

`script.js` keeps chapter timings in `CONFIG.chapters` and loop URLs in `LOOPS`. To add Capture or Spatial: encode a matching MP4/poster, add a `LOOPS` entry, add a `.ambient-layer` with matching `data-loop` to the stage and an `.ambient-inline` to its mobile article, then add the corresponding camera hold to `journeyProgress()`. Playback, visibility, pause, reduced-motion, and failure handling are shared. The journey mapping holds Intro at its first frame and Signage at source frame 110 while their chapter copy is visible.

Styles, typography, colors, and responsive layouts remain in `styles.css`. Content and accessible video posters are in `index.html`.

## Verification and hosting

Local checks and screenshots are under `.review/`; `loops-review.cjs` checks Chromium autoplay, muted inline playback, 4-second wraparound, pause/resume, offscreen pause, chapter navigation, 390/320 px mobile layouts, and reduced-motion handling. `../Website_Loop_Assets/expressive/verify-images.py` compares the new source frame differences and seam, while `verify-rig.py` checks the evaluated hand travel, endpoint, and camera. Safari/iOS and Firefox need device/browser smoke testing before production publishing.

Publish `index.html`, `styles.css`, `script.js`, and `assets/` together. Keep `.review/`, source PNG sequences, Blender projects, and development tools out of the published site. Nothing has been deployed.


