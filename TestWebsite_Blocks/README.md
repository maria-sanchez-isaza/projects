# Tosolini — cinematic blocks prototype

A separate static prototype. The existing `TestWebsite` prototype is unchanged.

## Open locally

- Double-click `OPEN_WEBSITE.cmd`. With Node.js installed, this opens http://127.0.0.1:4174.
- Or double-click `index.html` directly. No installation or build is required.
- From this folder, `node server.mjs --open` also starts the local preview.

## Structure

- `index.html`: hero, three cinematic service blocks, additional services, clients, about, and contact.
- `styles.css`: typography, alternating desktop compositions, and stacked mobile layouts.
- `script.js`: optional future video loops. Currently all four media blocks use still images.
- `assets/`: the four supplied PNGs and official logo artwork.

This design uses normal page scrolling, without pinned sections or video scrubbing. On desktop, service copy sits left / right / left, opposite the characters. On mobile, copy follows the full-width image.

## Replace a still with a loop

Place a short web-ready MP4 in `assets/`, then edit the corresponding entry at the top of `script.js`:

```js
signage: { video: 'assets/signage-loop.mp4' }
```

Available keys: `overview`, `signage`, `capture`, `spatial`. Empty strings keep the still. Keep the PNGs: they provide posters and fallbacks. Use the same 16:9 composition to preserve text placement.

Configured loops are muted, play only while visible, and have a pause control. Small screens, reduced-motion preferences, data-saving mode, and failed media use stills. The current still-only version has no animation dependencies or external requests.

## Iterate or deploy

Edit copy directly in HTML and colors/spacing in CSS. Contact links currently open an email to paolo@tosolini.com; there is no backend or contact form. Supporting sections are prototype copy; client names and contact information were referenced from https://www.tosolini.com/ and should be reviewed before publication.

For GitHub Pages or Cloudflare Pages, publish `index.html`, `styles.css`, `script.js`, and `assets/`. No build command is needed. Local server helpers and `.review/` are not needed for deployment.

## Review

Checked at 1440px, 390px, and 320px widths: image order, horizontal overflow, navigation, direct-file loading, reduced-motion behavior, and browser errors. Local review artifacts are in `.review/` and excluded by `.gitignore`.
