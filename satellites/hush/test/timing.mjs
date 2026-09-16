#!/usr/bin/env node
/* HUSH P1: the pose's timing and reaction time from paint (plans/hush/HANDOFF-HUSH.md 3.12 and section 8 of the handoff: "signal
 * duration within ±20 ms of spec under 4x throttle"; "RT captured from paint, not schedule: inject an artificial 100 ms render
 * delay and confirm RT does not shift").
 *
 *   node test/timing.mjs          (in the foreground, under the gate lock)
 *
 * Measured with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is Stephen's.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at no throttle, the page's own pose path is shown for each of the eleven duration levels, 400 to 1200 ms by 80, within 20 ms
 *   2. the same under 4x CPU throttle (if the frame this box measures under throttle is longer than 40 ms, the bound is out of
 *      reach by arithmetic and the line says so with the interval)
 *   3. a go pose whose paint is held 100 ms (the drawing stalls on its show frame): the pose was painted 100 ms or more after it
 *      was asked for, and its reaction time is the press less the paint, 100 ms or more short of the press less the ask
 *   4. every trial played is shown for its duration within 20 ms
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const LEVELS = Array.from({ length: 11 }, (_, i) => 400 + i * 80);
const expected = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
const goAt = expected.map((t, i) => (t.type === 'go' ? i : -1)).filter(i => i >= 0);

const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&', ready: READY }));
const { browser, page, errors } = opened;

const measure = async () => {
  const rows = [];
  for (const d of LEVELS) {
    const f = await page.evaluate(ms => window.HUSH.poseOnce(ms), d);
    rows.push({ d, shown: f.hiddenAt - f.shownAt, interval: f.interval });
  }
  return rows;
};
const line = rows => rows.map(r => r.d + ' shown ' + r.shown.toFixed(0)).join(', ');
const within = rows => rows.every(r => Math.abs(r.shown - r.d) <= 20);

/* 1 and 2, before the door, while nothing else draws */
const plain = await measure();
say(within(plain), 'at no throttle, each duration level is shown for its length within 20 ms (' + line(plain) + ')');
const cdp = await page.createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const slow = await measure();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
const worstFrame = Math.max(...slow.map(r => r.interval));
say(within(slow), 'under 4x CPU throttle, each duration level is shown for its length within 20 ms (' + line(slow) + '; the frame measured ' + worstFrame.toFixed(1) + ' ms' + (worstFrame > 40 ? ', over 40, so 20 ms is out of reach by arithmetic' : '') + ')');

/* 3: the first go pose's drawing stalls 100 ms on its show frame */
await tap(page, '#start');
const target = goAt[0];
await page.waitForFunction(k => window.HUSH.phase() === 'gap' && window.HUSH.trials().length === k, { timeout: 20000, polling: 'raf' }, target);
await page.evaluate(() => {
  const draw = CanvasRenderingContext2D.prototype.drawImage;
  window.__stall = { armed: true, fired: false };
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    const l = window.HUSH.live();
    if (window.__stall.armed && l && l.paintedAt === null && window.HUSH.phase() === 'pose') {
      window.__stall.armed = false; window.__stall.fired = true;
      const t0 = performance.now(); while (performance.now() - t0 < 100) { /* the stall */ }
    }
    return draw.apply(this, args);
  };
});
await page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.i === k && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' }, target);
await tap(page, '#stone');
await page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 20000, polling: 'raf' }, target);
const fired = await page.evaluate(() => window.__stall.fired);
const t = (await page.evaluate(() => window.HUSH.trials()))[target];
const late = t.paintedAt - t.requestedAt, fromAsk = t.stepAt - t.requestedAt;
say(fired && t.outcome === 'hit' && late >= 100 && t.rtMs === t.stepAt - t.paintedAt && fromAsk - t.rtMs >= 100,
  'a pose held 100 ms on its show frame is painted ' + late.toFixed(0) + ' ms after it was asked for, and its reaction time ' + (t.rtMs === null ? 'null' : t.rtMs.toFixed(0)) + ' ms is from the paint, not the ask (' + fromAsk.toFixed(0) + ' ms)' + (fired ? '' : ' (the stall never fired)'));

/* 4 */
await page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 30000, polling: 'raf' }, target + 2);
const played = await page.evaluate(() => window.HUSH.trials());
const off = played.filter((x, i) => i !== target && Math.abs(x.shownMs - x.durationMs) > 20);
say(played.length >= 3 && off.length === 0, 'every trial played is shown for its duration within 20 ms (' + played.map(x => x.durationMs + ' shown ' + x.shownMs.toFixed(0)).join(', ') + ')');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' TIMING FAILURE(S)'); process.exit(1); }
console.log('TIMING OK');
