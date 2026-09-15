#!/usr/bin/env node
/* HUSH's pace through a full approach (plans/hush/HANDOFF-HUSH.md P3: "the pace gate through a full approach"; 3.8's decode stall
 * law). Measured with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is Stephen's.
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768 on Careful from the edge of the clearing to the settle, the gate pressing from Node's replay of the run
 * and never from the page's state. Asserted, each watched to fail on a planted fault:
 *   1. under 4x CPU throttle, over the whole approach, the page's frames come a median of at most 1000/55 ms apart and no frame
 *      waits more than 100 ms
 *   2. no decode stall: every frame on which the creature is drawn at a new tier (steps 3, 6, 9, 12 and 15) comes within 100 ms of
 *      the frame before it, because every tier and pose was drawn at boot
 *   3. the approach reaches the settle and the page settles
 *   4. with less motion the settle still holds two seconds and settles, and go on comes
 *   5. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes, SETTLE } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const LINK = '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&';
const run = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
const median = xs => { const a = xs.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : Infinity; };

async function approachByKeys(page) {
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  for (let i = 0; i < run.length; i++) {
    await page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.i === k && l.paintedAt !== null; }, { timeout: 30000, polling: 'raf' }, i);
    if (run[i].type === 'go') await page.keyboard.press('Space');
    await page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 30000, polling: 'raf' }, i);
    if ((await page.evaluate(() => window.HUSH.steps())) >= SETTLE) break;
  }
}

/* 1 to 3 under throttle */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: LINK, ready: READY }));
  const cdp = await page.target().createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  /* every frame's time and the tier drawn on it, read by a frame watcher that only reads */
  await page.evaluate(() => {
    window.__frames = [];
    const tick = t => { window.__frames.push({ t, tier: window.HUSH.tier(), phase: window.HUSH.phase() }); if (window.HUSH.phase() !== 'settled') requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await approachByKeys(page);
  const settledOk = await page.waitForFunction(() => window.HUSH.phase() === 'settled', { timeout: 30000, polling: 'raf' }).then(() => true, () => false);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const frames = await page.evaluate(() => window.__frames.slice());
  const gaps = frames.slice(1).map((f, i) => f.t - frames[i].t);
  const mid = median(gaps), worst = gaps.length ? Math.max(...gaps) : Infinity;
  say(frames.length > 200 && mid <= 1000 / 55 && worst <= 100, '1366x768 under 4x CPU throttle, over a full approach, frames come a median of ' + mid.toFixed(1) + ' ms apart (at most ' + (1000 / 55).toFixed(1) + ') and the longest wait is ' + worst.toFixed(1) + ' ms (at most 100), over ' + frames.length + ' frames');
  const changes = [];
  for (let i = 1; i < frames.length; i++) if (frames[i].tier !== frames[i - 1].tier) changes.push({ to: frames[i].tier, gap: frames[i].t - frames[i - 1].t });
  const stalls = changes.filter(c => c.gap > 100);
  say(changes.length >= 5 && stalls.length === 0, '1366x768 no decode stall: every frame that draws a new tier comes within 100 ms of the one before (' + JSON.stringify(changes.map(c => c.to + ':' + c.gap.toFixed(0))) + ')');
  say(settledOk, '1366x768 the approach reaches the settle and the page settles (' + (await page.evaluate(() => ({ steps: window.HUSH.steps(), phase: window.HUSH.phase() }))).phase + ')');
  say(errors.length === 0, '1366x768 throttled: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4: less motion */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: LINK, ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  /* ⛔ the watcher used to ride requestAnimationFrame and it stopped recording after the last settle: the page read phase
     "settled" while the watcher had never seen it, so the hold measured zero. A liveness probe must never ride rAF (it is not
     a liveness ticket, it is a drawing ticket, and the settle draws nothing). It rides a timer now. */
  await page.evaluate(() => {
    window.__phases = [];
    let last = null;
    window.__phaseTimer = setInterval(() => {
      const p = window.HUSH.phase();
      if (p !== last) { window.__phases.push({ p, t: performance.now() }); last = p; }
    }, 10);
  });
  await approachByKeys(page);
  const settled = await page.waitForFunction(() => window.HUSH.phase() === 'settled' && !document.getElementById('next').hidden, { timeout: 30000, polling: 'raf' }).then(() => true, () => false);
  const phases = await page.evaluate(() => { clearInterval(window.__phaseTimer); return window.__phases.slice(); });
  /* ⛔ the first run printed a zero with the whole phase list, which the log then cut at 280 characters, so the zero named
     nothing. The hold is measured between the LAST settle and the settled that follows it, and the line carries the tail and
     whether each mark was seen at all. */
  const lastAt = p => { for (let i = phases.length - 1; i >= 0; i--) if (phases[i].p === p) return phases[i]; return null; };
  const a = lastAt('settle'), b = lastAt('settled');
  const held = a && b && b.t > a.t ? b.t - a.t : 0;
  /* what the gate saw, so a zero names its cause instead of hiding it */
  const seen = await page.evaluate(() => ({ steps: window.HUSH.steps(), phase: window.HUSH.phase(), trials: window.HUSH.trials().length, living: window.HUSH.living.shown(), next: !document.getElementById('next').hidden }));
  say(settled && held >= 2000, '1366x768 with less motion the settle still holds ' + held.toFixed(0) + ' ms (two seconds or more), settles, and go on comes (' + JSON.stringify(Object.assign({ settled, sawSettle: !!a, sawSettled: !!b, tail: phases.slice(-8).map(x => x.p), frames: phases.length }, seen)) + ')');
  say(errors.length === 0, 'less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
