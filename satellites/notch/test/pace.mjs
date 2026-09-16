#!/usr/bin/env node
/* NOTCH's drawing under a slow machine (plans/notch/HANDOFF-NOTCH.md P1; the handoff's "60fps sustained during continuous drag
 * under 4x throttle").
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * Measured as frame pacing with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is
 * Stephen's. Frames are read by the page's own animation frame clock while a real mouse drags.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. under 4x throttle, a continuous two second drag round the bench turns the piece and draws at a median of at most 1000/55 ms
 *      a frame, none longer than 100 ms
 *   2. under 4x throttle, a piece set aside reveals at the same pace
 *   3. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const paceOf = times => {
  const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
  return { n: gaps.length, median: gaps.length ? gaps[Math.floor(gaps.length / 2)] : Infinity, worst: gaps.length ? gaps[gaps.length - 1] : Infinity };
};
const record = page => page.evaluate(() => { window.__frames = []; window.__recording = true; const tick = t => { if (!window.__recording) return; window.__frames.push(t); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
const stop = page => page.evaluate(() => { window.__recording = false; return window.__frames.slice(); });

const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/notch/index.html?seed=4242&', ready: READY }));
await tap(page, '#start');
await sleep(200);
const cdp = await page.createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

/* 1 */
const [cx, cy] = await page.evaluate(() => window.NOTCH.centre());
const before = await page.evaluate(() => window.NOTCH.angle());
await page.mouse.move(cx + 110, cy);
await page.mouse.down();
await record(page);
const t0 = Date.now();
let k = 0;
while (Date.now() - t0 < 2000) {
  /* round and round, a little under a quarter turn a move; the page's angle wraps, so the piece never seats by chance at the
     notch unless the drag ends there, and the gate lets go well away from it */
  const a = (k * 7) * Math.PI / 180;
  await page.mouse.move(cx + 110 * Math.cos(a), cy + 110 * Math.sin(a));
  k++;
}
const drag = paceOf(await stop(page));
const moved = await page.evaluate(() => window.NOTCH.angle());
await page.mouse.move(cx + 110 * Math.cos((k * 7 + 90) * Math.PI / 180), cy + 110 * Math.sin((k * 7 + 90) * Math.PI / 180));
await page.mouse.up();
say(k > 20 && moved !== before && drag.n >= 40 && drag.median <= 1000 / 55 && drag.worst <= 100, 'under 4x CPU throttle, a two second drag (' + k + ' moves) turned the piece and drew a median of ' + drag.median.toFixed(1) + ' ms a frame (at most ' + (1000 / 55).toFixed(1) + '), the longest ' + drag.worst.toFixed(0) + ' ms (at most 100), over ' + drag.n + ' frames');

/* 2: if the drag happened to let go inside the tolerance the piece seated; that round's reveal is let finish and the next round
   is the one set aside */
if ((await page.evaluate(() => window.NOTCH.phase())) !== 'turn') {
  await page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 60000, polling: 'raf' });
  await page.evaluate(() => document.getElementById('next').click());
  await sleep(200);
}
await record(page);
await tap(page, '#aside');
await page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 60000, polling: 'raf' });
const rev = paceOf(await stop(page));
say(rev.n >= 5 && rev.median <= 1000 / 55 && rev.worst <= 100, 'under 4x CPU throttle, the reveal keeps a median of ' + rev.median.toFixed(1) + ' ms a frame, the longest ' + rev.worst.toFixed(0) + ' ms, over ' + rev.n + ' frames');
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
