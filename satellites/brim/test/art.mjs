#!/usr/bin/env node
/* BRIM's sprites and colours on the page (plans/brim/HANDOFF-BRIM.md section 7 and 3.15): what draw.js puts where, read off
 * the canvases' own pixels and the elements' boxes and computed colours, never off a class name.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the first screen with no mode named: four doors, each its own door sprite drawn and a 56 px target; a link naming
 *      LEVEL shows one door, drawn as LEVEL's
 *   2. B5: the two waters differ in CIE lightness by 20 or more (teal and plum, not red and green), and every glass carries
 *      its fraction under it
 *   3. the shelf at 375 and 320 after a run: one bottle drawn, at least 36 px across, the frame and go on the screen
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.BRIM && window.BRIM.ready';

const drawn = (page, sel) => page.evaluate(sel => {
  const c = document.querySelector(sel);
  if (!c || c.tagName !== 'CANVAS' || !c.width || !c.height) return null;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return { sprite: c.dataset.sprite, pixels: n };
}, sel);
/* CIE L* from a computed rgb() colour */
const lightness = rgb => {
  const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
};

/* 1 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/brim/index.html?seed=4242&', ready: READY }));
  const { page, errors } = opened;
  const bits = [];
  for (const [sel, want] of [['#start', 'doorMatching'], ['#start-half', 'doorHalf'], ['#start-brim', 'doorBrim'], ['#start-level', 'doorLevel']]) {
    const d = await drawn(page, sel + ' canvas'), c = await centre(page, sel);
    if (!d || d.sprite !== want || d.pixels < 40 || !c || c.w < 56 || c.h < 56 || !c.onTop) bits.push(sel + ' ' + JSON.stringify(d) + ' ' + (c ? Math.round(c.w) + 'x' + Math.round(c.h) + (c.onTop ? '' : ' COVERED') : 'no target'));
  }
  say(bits.length === 0, '375x667 with no mode named, four doors, each its own picture drawn and a 56 px target' + (bits.length ? ': ' + bits.join('; ') : ''));
  /* 2 */
  await tap(page, '#start');
  await sleep(200);
  const look = await page.evaluate(() => ({
    left: getComputedStyle(document.querySelector('#left .water')).backgroundColor,
    right: getComputedStyle(document.querySelector('#right .water')).backgroundColor,
    labels: ['left', 'right'].map(id => { const g = document.querySelector('#' + id + ' .glass').getBoundingClientRect(), l = document.querySelector('#' + id + ' .label').getBoundingClientRect(); return { under: l.top >= g.bottom - 0.5 && l.left < g.right && l.right > g.left, text: document.querySelector('#' + id + ' .label').textContent }; })
  }));
  const dl = Math.abs(lightness(look.left) - lightness(look.right));
  say(dl >= 20 && look.labels.every(l => l.under && /\d/.test(l.text)), '375x667 B5: the two waters differ by ' + dl.toFixed(1) + ' in CIE lightness (at least 20; ' + look.left + ' and ' + look.right + '), and each glass carries its fraction under it');
  say(errors.length === 0, '375x667 doors: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
  const named = await open(s.base, Object.assign({}, SIZES[1], { path: '/brim/index.html?seed=4242&mode=level&', ready: READY }));
  const one = await drawn(named.page, '#start canvas');
  const others = await named.page.evaluate(() => ['start-half', 'start-brim', 'start-level'].filter(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width > 0 && r.height > 0; }));
  say(!!one && one.sprite === 'doorLevel' && one.pixels > 40 && others.length === 0, '375x667 a link naming LEVEL shows one door, drawn as LEVEL\'s (' + (one ? one.sprite : 'none') + ', others shown: ' + others.join(',') + ')');
  await named.browser.close();
}

/* 3 */
for (const size of [SIZES[1], SIZES[0]]) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, { path: '/brim/index.html?seed=4242&mode=matching&count=12&', ready: READY }));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  for (let i = 0; i < 12; i++) {
    await tap(page, '#left');
    await page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 });
    await sleep(60);
    await tap(page, '#next');
    await sleep(120);
  }
  await sleep(300);
  const m = await page.evaluate(() => {
    const c = document.getElementById('shelf-canvas'), r = c.getBoundingClientRect(), f = document.querySelector('.shelf-frame').getBoundingClientRect(), g = document.getElementById('shelf-go').getBoundingClientRect();
    const vh = window.visualViewport ? visualViewport.height : innerHeight, vw = window.visualViewport ? visualViewport.width : innerWidth;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k] > 0) n++;
    return { cell: Number(c.dataset.cell) * (r.width / c.width), pixels: n, onScreen: f.left >= 0 && f.right <= vw && f.top >= 0 && g.bottom <= vh, shown: !document.getElementById('shelf').hidden, cells: window.BRIM.shelf.cells().length };
  });
  say(m.shown && m.cells === 1 && m.pixels > 100 && m.cell >= 36 && m.onScreen, at + ' the shelf shows one bottle drawn, ' + m.cell.toFixed(0) + ' px across (at least 36), the frame and go on the screen (' + JSON.stringify(m) + ')');
  say(errors.length === 0, at + ' shelf: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
