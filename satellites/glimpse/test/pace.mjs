#!/usr/bin/env node
/* GLIMPSE's drawing under a slow machine (plans/glimpse/HANDOFF-GLIMPSE.md 3.8; the handoff's test gate "60fps with 24 glowing
 * dots on screen").
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * Measured as frame pacing with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is
 * Stephen's. No v1 mode shows 24 fireflies at once, so the gate drives the drawing path every mode uses (the glow blitted at a
 * whole pixel, no blur) with 24 moving fireflies through the page's own hook.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. under 4x CPU throttle, 24 moving fireflies draw at a median of at most 1000/55 ms a frame, no frame waiting past 100 ms
 *   2. under 4x CPU throttle, a SPREAD round's reveal (the most fireflies a v1 round lands) keeps the same pace
 *   3. with less motion the reveal is instant: the numeral is up and next comes within the hold
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const paceOf = times => {
  const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
  return { n: gaps.length, median: gaps.length ? gaps[Math.floor(gaps.length / 2)] : Infinity, worst: gaps.length ? gaps[gaps.length - 1] : Infinity };
};

/* 1 and 2 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=4242&mode=spread&', ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const p24 = paceOf(await page.evaluate(() => window.GLIMPSE.paceTest(24, 1500)));
  say(p24.n >= 40 && p24.median <= 1000 / 55 && p24.worst <= 100, 'under 4x CPU throttle, 24 moving fireflies draw a median of ' + p24.median.toFixed(1) + ' ms a frame (at most ' + (1000 / 55).toFixed(1) + '), the longest ' + p24.worst.toFixed(0) + ' ms (at most 100), over ' + p24.n + ' frames');
  await page.evaluate(() => {
    window.__frames = [];
    const grab = t => { window.__frames.push(t); if (!window.GLIMPSE.revealDone()) requestAnimationFrame(grab); };
    requestAnimationFrame(grab);
    document.querySelector('.pad').click();
  });
  await page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 60000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const rev = paceOf(await page.evaluate(() => window.__frames));
  const fireflies = await page.evaluate(() => { const x = window.GLIMPSE.current(); return x.a.n + x.b.n; });
  say(rev.n >= 20 && rev.median <= 1000 / 55 && rev.worst <= 100, 'under 4x CPU throttle, a SPREAD reveal of ' + fireflies + ' fireflies keeps a median of ' + rev.median.toFixed(1) + ' ms a frame, the longest ' + rev.worst.toFixed(0) + ' ms, over ' + rev.n + ' frames');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=4242&mode=flash&', ready: READY }));
  const { browser, page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
  const t0 = Date.now();
  await page.evaluate(() => document.querySelector('.pad').click());
  const numeral = await page.waitForFunction(() => !document.getElementById('truth').hidden, { timeout: 5000 }).then(() => Date.now() - t0, () => null);
  const done = await page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 5000 }).then(() => Date.now() - t0, () => null);
  say(numeral !== null && numeral < 300 && done !== null && done < 1200, 'with less motion the reveal is instant: the numeral in ' + numeral + ' ms and next in ' + done + ' ms (the hold is 450)');
  say(errors.length === 0, 'less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
