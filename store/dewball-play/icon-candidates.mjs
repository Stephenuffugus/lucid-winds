/* renders icon-candidates-src.html to icon-candidates/: candidate-<n>-512.png and candidate-<n>-maskable-512.png.
   Needs the repo served on 127.0.0.1:8777. Respect /home/codespace/lw-drafts/QUIET; one browser at a time. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = '/workspaces/lucid-winds/store/dewball-play/icon-candidates/'; fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const p = await browser.newPage(); await p.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
p.on('pageerror', e => console.log('pageerror', e.message));
for (const c of [1, 2, 3]) for (const mask of [0, 1]) {
  await p.goto('http://127.0.0.1:8777/store/dewball-play/icon-candidates-src.html?c=' + c + '&mask=' + mask, { waitUntil: 'load' });
  await p.waitForFunction('window.DONE', { timeout: 60000 });
  const f = OUT + 'candidate-' + c + (mask ? '-maskable' : '') + '-512.png';
  await (await p.$('canvas')).screenshot({ path: f }); console.log(f);
}
await browser.close();
