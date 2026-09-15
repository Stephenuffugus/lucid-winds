#!/usr/bin/env node
/* GLIMPSE's sprites and colours (plans/glimpse/HANDOFF-GLIMPSE.md section 7 and 3.9, GL8): what the sprite table says and what
 * the page draws from it, read off canvas pixels, never off a class name.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock; its first law reads the table in Node)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. GL8: the blue and amber fireflies' main colours differ by 20 or more in CIE lightness, in the sprite table
 *   2. a FLASH round's meadow shows the glow drawn (blue pixels during the flash), and the grass mask after it
 *   3. the journal at 375 and 320 after a run: one page drawn, at least 36 px across, the frame and go on the screen
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { PALETTE } from '../sprites.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const lightness = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
};

/* 1 */
{
  const dl = Math.abs(lightness(PALETTE[4]) - lightness(PALETTE[7]));
  say(dl >= 20, 'GL8: the blue and amber fireflies differ by ' + dl.toFixed(1) + ' in CIE lightness (at least 20; ' + PALETTE[4] + ' and ' + PALETTE[7] + ')');
}

/* 2 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=4242&mode=flash&', ready: READY }));
  const { page, errors } = opened;
  await page.evaluate(() => {
    window.__seen = { flash: 0, mask: 0 };
    const count = test => { const c = document.getElementById('meadow'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (test(d[i], d[i + 1], d[i + 2])) n++; return n; };
    const watch = () => {
      const ph = window.GLIMPSE.phase();
      if (ph === 'flash') window.__seen.flash = Math.max(window.__seen.flash, count((r, g, b) => b > 180 && r < 120));
      if (ph === 'mask') window.__seen.mask = Math.max(window.__seen.mask, count((r, g, b) => g > r && g > b && g > 0x30));
      if (ph !== 'answer') requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  });
  await tap(page, '#start');
  await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
  const seen = await page.evaluate(() => window.__seen);
  say(seen.flash > 50 && seen.mask > 1000, '375x667 the flash draws the blue glow and the mask draws grass on the meadow (' + JSON.stringify(seen) + ' pixels)');
  say(errors.length === 0, '375x667 flash: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 3 */
for (const size of [SIZES[1], SIZES[0]]) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, { path: '/glimpse/index.html?seed=4242&mode=flash&count=12&', ready: READY }));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  for (let i = 0; i < 12; i++) {
    await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
    await page.evaluate(() => document.querySelector('.pad').click());
    await page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 });
    await page.evaluate(() => document.getElementById('next').click());
    await sleep(80);
  }
  await sleep(300);
  const m = await page.evaluate(() => {
    const c = document.getElementById('shelf-canvas'), r = c.getBoundingClientRect(), f = document.querySelector('.shelf-frame').getBoundingClientRect(), g = document.getElementById('shelf-go').getBoundingClientRect();
    const vh = window.visualViewport ? visualViewport.height : innerHeight, vw = window.visualViewport ? visualViewport.width : innerWidth;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k] > 0) n++;
    return { cell: Number(c.dataset.cell) * (r.width / c.width), pixels: n, onScreen: f.left >= 0 && f.right <= vw && f.top >= 0 && g.bottom <= vh, shown: !document.getElementById('shelf').hidden, cells: window.GLIMPSE.shelf.cells().length };
  });
  say(m.shown && m.cells === 1 && m.pixels > 100 && m.cell >= 36 && m.onScreen, at + ' the journal shows one page drawn, ' + m.cell.toFixed(0) + ' px across (at least 36), the frame and go on the screen (' + JSON.stringify(m) + ')');
  say(errors.length === 0, at + ' journal: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
