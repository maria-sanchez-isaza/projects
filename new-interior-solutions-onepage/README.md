# New Interior Solutions — one-page website

Double-click **index.html** to open the website. Keep this entire folder together when moving or sharing it.

The site runs directly from `file://`. All images, fonts, styling, scripts, and the project video are included locally. It does not use WordPress, PHP, a database, a server, package installation, APIs, analytics, or internet-loaded assets.

The carousel includes all ten original homepage images, with a living-room image moved to the opening position. It advances every six seconds; use the pause/play and arrow buttons, left/right keyboard arrows, or swipe on a touchscreen. It pauses for interaction and respects reduced-motion preferences. The construction video has native playback controls and works offline.

Contact links open your configured email or phone application. Sending an email or placing a call requires the usual connection; browsing the website does not.

## Files

- `index.html`: page content
- `styles.css`: layout, colors, responsive styling
- `fonts.css`: local font declarations
- `script.js`: standalone carousel
- `assets/`: original website images, local fonts, and video
- `CONTENT-SOURCES.md`: editorial source notes

The original WordPress backup was read and its selected assets copied. No original backup files were edited.

## Verification

Tested in Chrome using `file://` with browser networking disabled, at desktop (1440px), tablet (820px), mobile (390px), and small mobile (320px) widths, plus 200% text sizing. No horizontal overflow, broken images, JavaScript errors, or HTTP requests. Verified carousel buttons, wrapping, keyboard controls, contact navigation, and local video playback.
