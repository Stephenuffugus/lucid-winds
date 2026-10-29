#!/usr/bin/env node
/* Shoot a page headless at the two phone sizes the fleet looks at: 412 x 915 and 360 x 780, at 3 device px
 * per CSS px, touch on, like a real phone. Prints the file and any page error. THEN OPEN THE IMAGE AND LOOK.
 *
 *   node tools/shutterbug-tests/shoot.mjs                                       the game on the local server
 *   node tools/shutterbug-tests/shoot.mjs <url> <outdir> --wait=1500 --tap=200,700 --tap=60,860
 *
 * Serve the repo root first (the worker and fetch need http, not file://):
 *   (cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &)
 * Chrome lives in /workspaces/sws-tools (puppeteer installed 29 Oct 2026, its Chrome in ~/.cache/puppeteer, the
 * shared libraries from apt). All three survive a codespace stop, none survives a container rebuild: if this
 * script says it cannot find Chrome, run `cd /workspaces/sws-tools && npx --yes puppeteer browsers install chrome`
 * and `sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1
 * libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2t64 libpango-1.0-0 libcairo2 libnss3 libxss1 libgtk-3-0`.
 * One browser at a time on this two core box. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');

const args = process.argv.slice(2);
const plain = args.filter(a => !a.startsWith('--'));
const url = plain[0] || 'http://localhost:8777/satellites/shutterbug/';
const out = plain[1] || '/tmp/claude-1000/shutterbug-shots';
const wait = Number((args.find(a => a.startsWith('--wait=')) || '--wait=800').slice(7));
const taps = args.filter(a => a.startsWith('--tap=')).map(a => a.slice(6).split(',').map(Number));
const sizes = [[412, 915], [360, 780]];
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu'] });
let failed = false;
try {
  for (const [w, h] of sizes) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    for (const [x, y] of taps) { await page.touchscreen.tap(x, y); await new Promise(r => setTimeout(r, 300)); }
    await new Promise(r => setTimeout(r, wait));
    const file = `${out}/shot-${w}x${h}.png`;
    await page.screenshot({ path: file });
    if (errors.length) failed = true;
    console.log(`${file}  ${errors.length ? 'ERRORS: ' + errors.join(' ; ') : '(no page errors)'}`);
    await page.close();
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
