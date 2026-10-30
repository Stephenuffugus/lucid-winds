#!/usr/bin/env node
/* Shoot the play screen at chosen steps of the sample room climb, at 412 x 915 and 360 x 780, 3 device px per CSS px,
 * touch on (BUILD-PLAN.md T0.8a shots: play top, mid, bottom). The climb is driven the way the play gate drives it:
 * the loop held, real key events, SB_DEV.step(n) between them. Prints each file and where the fleet music chip landed.
 * THEN OPEN THE IMAGES AND LOOK.
 *
 *   node tools/shutterbug-tests/shots-play.mjs <outdir> <name>:<step> [<name>:<step> ...] [--sizes=412x915,360x780]
 *        [--query=fit=crop] [--strip=R,A]   (--strip: after stepping, hold those strip controls with real touches)
 * Serve the repo root first: (cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &) */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';

const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const args = process.argv.slice(2);
const out = args[0];
const marks = args.slice(1).filter(a => !a.startsWith('--')).map(a => { const [n, s] = a.split(':'); return { name: n, step: Number(s) }; });
const sizes = ((args.find(a => a.startsWith('--sizes=')) || '--sizes=412x915,360x780').slice(8)).split(',').map(s => s.split('x').map(Number));
const query = (args.find(a => a.startsWith('--query=')) || '').slice(8);
const strip = (args.find(a => a.startsWith('--strip=')) || '').slice(8).split(',').filter(Boolean);
const climb = JSON.parse(readFileSync('/workspaces/lucid-winds/satellites/shutterbug/test/climb-sample-room.json', 'utf8'));
const KEYS = { 1: 'ArrowLeft', 2: 'ArrowRight', 4: 'KeyZ' };
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu'] });
let failed = false;
try {
  for (const [w, h] of sizes) {
    for (const mark of marks) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
      await page.goto('http://localhost:8777/satellites/shutterbug/' + (query ? '?' + query : ''), { waitUntil: 'networkidle0', timeout: 30000 });
      await page.waitForFunction(() => window.SB_DEV, { timeout: 20000 });
      await page.evaluate(() => window.SB_DEV.hold(true));
      const r = await page.evaluate(() => { const b = document.getElementById('sample').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
      await page.touchscreen.tap(r.x, r.y);
      let done = 0, down = 0;
      for (const [n, mask] of climb.runs) {
        if (done >= mark.step) break;
        for (const bit of [1, 2, 4]) if ((down & bit) && !(mask & bit)) await page.keyboard.up(KEYS[bit]);
        for (const bit of [1, 2, 4]) if (!(down & bit) && (mask & bit)) await page.keyboard.down(KEYS[bit]);
        down = mask;
        const k = Math.min(n, mark.step - done);
        await page.evaluate(k => window.SB_DEV.step(k), k);
        done += k;
      }
      for (const bit of [1, 2, 4]) if (down & bit) await page.keyboard.up(KEYS[bit]);
      const fingers = [];
      for (const sel of strip) {
        const c = await page.evaluate(sel => { const b = document.querySelector(sel); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width * 0.75, y: r.top + r.height / 2 }; }, sel === 'R' ? '#rocker' : sel === 'L' ? '#rocker' : sel === 'A' ? '#btnA' : '#btnB');
        if (c) fingers.push(await page.touchscreen.touchStart(sel === 'L' ? c.x - (c.x - 0) * 0.5 : c.x, c.y));
      }
      await new Promise(r2 => setTimeout(r2, 700));
      const chip = await page.evaluate(() => {
        const el = [...document.querySelectorAll('body *')].find(e => /music/i.test(e.id || '') && e.getBoundingClientRect().width > 20) || [...document.querySelectorAll('button, a, div')].find(e => e.textContent.trim() === '\u266b Music' || /^.\s*Music$/.test(e.textContent.trim()));
        if (!el) return 'no chip';
        const b = el.getBoundingClientRect();
        return Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height);
      });
      const file = `${out}/${mark.name}-${w}x${h}.png`;
      await page.screenshot({ path: file });
      for (const f of fingers) await f.end();
      if (errors.length) failed = true;
      console.log(`${file}  step ${done}  chip ${chip}  ${errors.length ? 'ERRORS: ' + errors.join(' ; ') : '(no page errors)'}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
