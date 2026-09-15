#!/usr/bin/env node
/* BRIM's fill under a slow machine (plans/brim/HANDOFF-BRIM.md P3; the handoff's test gate "60fps during fill under 4x
 * throttle; prefers-reduced-motion makes fill instant").
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * Measured as frame pacing with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is
 * Stephen's.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. under 4x CPU throttle, the frames of a fill come at a median of at most 1000/55 ms apart, and no frame waits more
 *      than 100 ms
 *   2. at every frame of it the chosen glass stands at the level render.js's levelAt says for that frame's time (within 0.01
 *      of the glass), read on the same frame
 *   3. with less motion (the device's wish, and separately the settings switch) the fill is instant: both glasses at their
 *      levels on the reveal's first frame, and next still comes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { levelAt } from '../render.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.BRIM && window.BRIM.ready';
const PATH = '/brim/index.html?seed=4242&grade=4&mode=matching&';
const REVEAL = 1400;
const val = f => f.n / f.d;

/* the glass chosen, and every frame after it recorded on its own rAF time, queued after the page's own frame */
const chooseAndRecord = (page, side) => page.evaluate(side => {
  window.__frames = [];
  const grab = t => {
    window.__frames.push({ t, left: window.BRIM.level('left'), right: window.BRIM.level('right') });
    if (!window.BRIM.revealDone() || window.__frames.length < 3) requestAnimationFrame(grab);
  };
  document.getElementById(side).click();
  requestAnimationFrame(grab);
}, side);
const doneOf = async page => {
  await page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 60000 });
  return { frames: await page.evaluate(() => window.__frames), result: await page.evaluate(() => window.BRIM.results[window.BRIM.results.length - 1]), pair: await page.evaluate(() => window.BRIM.pair()) };
};

/* 1 and 2 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(300);
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await chooseAndRecord(page, 'left');
  const { frames, result, pair } = await doneOf(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const during = frames.filter(f => f.t >= result.revealAt && f.t <= result.revealAt + REVEAL);
  const gaps = during.slice(1).map((f, i) => f.t - during[i].t).sort((a, b) => a - b);
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : Infinity, worst = gaps.length ? gaps[gaps.length - 1] : Infinity;
  say(gaps.length >= 20 && median <= 1000 / 55 && worst <= 100, 'under 4x CPU throttle the fill\'s frames come a median of ' + median.toFixed(1) + ' ms apart (at most ' + (1000 / 55).toFixed(1) + '), the longest wait ' + worst.toFixed(0) + ' ms (at most 100), over ' + gaps.length + ' frames');
  const v = val(pair.left);
  const off = during.map(f => { const p = Math.min(1, Math.max(0, f.t - result.revealAt) / REVEAL); return Math.abs(f.left - levelAt(v, Math.min(1, p / 0.5))); });
  const worstOff = off.length ? Math.max(...off) : Infinity;
  say(off.length >= 20 && worstOff <= 0.01, 'and at every frame the chosen glass stands where levelAt says for that frame (largest miss ' + worstOff.toFixed(4) + ' of the glass over ' + off.length + ' frames)');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
for (const [how, set] of [['the device asks for less motion', 'media'], ['the settings switch asks for less motion', 'switch']]) {
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  if (set === 'media') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  else {
    await tap(page, '.lw-settings-open'); await sleep(120);
    await tap(page, '.lw-settings [data-key="reducedMotion"]');
    await tap(page, '.lw-settings-close'); await sleep(120);
  }
  await chooseAndRecord(page, 'right');
  const { frames, pair } = await doneOf(page);
  const first = frames[0];
  const nextShown = await page.evaluate(() => { const b = document.getElementById('next'); return !b.hidden && getComputedStyle(b).visibility !== 'hidden'; });
  say(!!first && first.left === val(pair.left) && first.right === val(pair.right) && nextShown, 'when ' + how + ', the fill is instant: both glasses at their levels on the reveal\'s first frame, and next comes (' + JSON.stringify(first) + ')');
  say(errors.length === 0, 'when ' + how + ', nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
