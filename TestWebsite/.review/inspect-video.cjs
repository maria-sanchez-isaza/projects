const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/masan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'tmp'), { recursive: true });
  const browser = await chromium.launchPersistentContext(path.join(__dirname, 'browser-profile'), { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, viewport: { width: 1440, height: 900 }, env: { ...process.env, TEMP: path.join(__dirname, 'tmp'), TMP: path.join(__dirname, 'tmp') } });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173');
  const metadata = await page.evaluate(async () => {
    const v = document.createElement('video'); v.src = 'AI-Reneder-Test.mp4'; v.muted = true; v.preload = 'auto'; window.probeVideo = v;
    await new Promise((resolve, reject) => { v.onloadeddata = resolve; v.onerror = reject; });
    return { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
  });
  console.log('VIDEO', JSON.stringify(metadata));
  const captures = [];
  for (const p of [0, .10, .20, .255, .35, .45, .58, .68, .78, .92, .995]) {
    const data = await page.evaluate(async p => {
      const v = window.probeVideo; const t = Math.min(v.duration - .05, Math.max(.01, p * v.duration));
      await new Promise(resolve => { v.onseeked = resolve; v.currentTime = t; });
      const c = document.createElement('canvas'); c.width = 1280; c.height = Math.round(1280 * v.videoHeight / v.videoWidth); c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', .88);
    }, p);
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    fs.writeFileSync(path.join(__dirname, `video-${Math.round(p * 1000)}.jpg`), buffer);
    const name = p === 0 ? 'overview' : p === .255 ? 'signage' : p === .58 ? 'capture' : p === .92 ? 'spatial' : null;
    if (name) fs.writeFileSync(path.join(root, 'assets', name + '.jpg'), buffer);
    captures.push({ p, data });
  }
  const sheet = await page.evaluate(async captures => {
    const c = document.createElement('canvas'); c.width = 1280; c.height = 3 * 205; const ctx = c.getContext('2d'); ctx.fillStyle = '#fafbf8'; ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < captures.length; i++) { const img = new Image(); img.src = captures[i].data; await img.decode(); const x = i % 4 * 320, y = Math.floor(i / 4) * 205; ctx.drawImage(img, x, y, 320, 180); ctx.fillStyle = '#111'; ctx.font = '14px Arial'; ctx.fillText(Math.round(captures[i].p * 100) + '%', x + 8, y + 198); }
    return c.toDataURL('image/png');
  }, captures);
  fs.writeFileSync(path.join(__dirname, 'video-contact-sheet.png'), Buffer.from(sheet.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(__dirname, 'video-metadata.json'), JSON.stringify(metadata, null, 2));
  await page.reload(); await page.waitForTimeout(1200); await page.screenshot({ path: path.join(__dirname, 'desktop-opening.png') });
  await browser.close();
})();
