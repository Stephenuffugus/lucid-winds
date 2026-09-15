#!/usr/bin/env node
/* TINT's colour as the child sees it (plans/tint/HANDOFF-TINT.md 3.3, T7; section 7: a swatch is a flat fill of exactly the mixed
 * colour). Every read is the page's own pixels.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every dye drawn in a recipe's band has a CIE lightness of 35 or under
 *   2. T7 on the screen: over a SAME COLOUR session, every round whose answer is different shows two cloths 2.5 or more apart in
 *      lightness, and every same round two cloths of one colour
 *   3. every cloth is one flat colour across its middle, never dithered or blended
 *   4. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { lightness } from '../colour.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.TINT && window.TINT.ready';
const ROUNDS = 20;

const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/tint/index.html?seed=4242&', ready: READY }));
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await tap(page, '#start');
await sleep(200);
const dyeBad = [], gapBad = [], flatBad = [];
for (let i = 0; i < ROUNDS; i++) {
  const task = await page.evaluate(() => window.TINT.task());
  /* the recipe's dye band: the bottom of the left vat's middle column, before the pour */
  const band = await page.evaluate(() => {
    const c = document.getElementById('vat-left'), d = c.getContext('2d').getImageData(Math.floor(c.width / 2), Math.floor(c.height * 0.55), 1, 1).data;
    return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
  });
  if (task.representation === 'continuous' && !(lightness(band) <= 35)) dyeBad.push(i + ' ' + task.dye + ' drawn ' + band + ' lightness ' + lightness(band).toFixed(1));
  await page.evaluate(() => document.getElementById('same').click());
  await page.waitForFunction(() => window.TINT.pourDone(), { timeout: 10000, polling: 'raf' });
  await sleep(40);
  const cloths = await page.evaluate(() => ['left', 'right'].map(sd => {
    const c = document.getElementById('vat-' + sd), b = c.getBoundingClientRect(), [x, y] = window.TINT.clothPoint(sd), k = c.width / b.width;
    const cx = Math.round((x - b.left) * k), cy = Math.round((y - b.top) * k), span = Math.round(12 * k);
    const d = c.getContext('2d').getImageData(cx - span, cy - span, 2 * span, 2 * span).data, set = new Set();
    for (let q = 0; q < d.length; q += 4) set.add('#' + [d[q], d[q + 1], d[q + 2]].map(v => v.toString(16).padStart(2, '0')).join(''));
    return Array.from(set);
  }));
  cloths.forEach((set, k) => { if (set.length !== 1) flatBad.push(i + (k ? ' right' : ' left') + ' ' + set.length + ' colours'); });
  if (cloths[0].length === 1 && cloths[1].length === 1) {
    const g = Math.abs(lightness(cloths[0][0]) - lightness(cloths[1][0]));
    if (task.answer === 'different' && !(g >= 2.5)) gapBad.push(i + ' ' + JSON.stringify(task.left) + ' vs ' + JSON.stringify(task.right) + ' in ' + task.dye + ' ' + g.toFixed(2) + ' apart');
    if (task.answer === 'same' && cloths[0][0] !== cloths[1][0]) gapBad.push(i + ' a same round shows ' + cloths[0][0] + ' and ' + cloths[1][0]);
  }
  await page.evaluate(() => document.getElementById('next').click());
  await sleep(60);
}
say(dyeBad.length === 0, '375x667 every dye drawn in a recipe band has lightness 35 or under' + (dyeBad.length ? ': ' + dyeBad.slice(0, 3).join('; ') : ''));
say(gapBad.length === 0, '375x667 T7: every different round\'s cloths are 2.5 or more apart in lightness and every same round\'s one colour, over ' + ROUNDS + ' rounds' + (gapBad.length ? ': ' + gapBad.slice(0, 3).join('; ') : ''));
say(flatBad.length === 0, '375x667 every cloth is one flat colour across its middle' + (flatBad.length ? ': ' + flatBad.slice(0, 3).join('; ') : ''));
say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
