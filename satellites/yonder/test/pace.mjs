#!/usr/bin/env node
/* YONDER's walk under a slow machine (plans/yonder/HANDOFF-YONDER.md 3.11; the handoff's test gate 10).
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * "60 fps during the walk under 4x throttle" is measured as frame pacing with Emulation.setCPUThrottlingRate 4 in
 * headless Chrome on this box, the only machine a gate has; a real school Chromebook is Stephen's (section 11).
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. under 4x CPU throttle, the frames of a walk come at a median of at most 1000/55 ms apart, and no frame waits more
 *      than 100 ms
 *   2. the traveler is drawn where the steady walk says at every frame of it (within 2 px of flag + (truth - flag) * t)
 *   3. with less motion (the device's wish, and separately the settings switch), the walk still conveys position: the
 *      traveler is seen at three or more distinct places, every one between the flag and the truth, in order, ending
 *      on the truth
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.YONDER && window.YONDER.ready';
const PATH = '/yonder/index.html?seed=4242&road=100&';

const plantAt = (page, frac) => page.evaluate(frac => {
  const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(road.dataset.offset) + frac * Number(road.dataset.width));
  const o = x => ({ pointerId: 141, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  window.__frames = [];
  const grab = () => {
    const t = document.getElementById('traveler');
    window.__frames.push({ t: performance.now(), x: t.hidden ? null : parseFloat(t.style.left) });
    if (!window.YONDER.walkDone() || window.__frames.length < 3) requestAnimationFrame(grab);
  };
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
  requestAnimationFrame(grab);
}, frac);
const walkOf = async page => {
  await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 60000 });
  return { frames: await page.evaluate(() => window.__frames), walk: await page.evaluate(() => window.YONDER.walk()), result: await page.evaluate(() => window.YONDER.results[window.YONDER.results.length - 1]) };
};

/* 1 and 2 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(300);
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await plantAt(page, 0.9);
  const { frames, walk, result } = await walkOf(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const during = frames.filter(f => f.t >= result.revealAt && f.t <= result.revealAt + walk.walkMs);
  const gaps = during.slice(1).map((f, i) => f.t - during[i].t).sort((a, b) => a - b);
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : Infinity, worst = gaps.length ? gaps[gaps.length - 1] : Infinity;
  say(gaps.length >= 20 && median <= 1000 / 55 && worst <= 100, 'under 4x CPU throttle the walk\'s frames come a median of ' + median.toFixed(1) + ' ms apart (at most ' + (1000 / 55).toFixed(1) + '), the longest wait ' + worst.toFixed(0) + ' ms (at most 100), over ' + gaps.length + ' frames');
  const off = during.filter(f => f.x !== null).map(f => { const p = Math.min(1, Math.max(0, (f.t - result.revealAt) / walk.walkMs)); return Math.abs(f.x - (walk.from + (walk.to - walk.from) * p)); });
  const worstOff = off.length ? Math.max(...off) : Infinity;
  say(off.length >= 20 && worstOff <= 2, 'and at every frame the traveler is where the steady walk says (largest miss ' + worstOff.toFixed(2) + ' px over ' + off.length + ' frames)');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
for (const [how, set] of [['the device asks for less motion', 'media'], ['the settings switch asks for less motion', 'switch']]) {
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  if (set === 'media') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  else {
    await tap(page, '.lw-settings-open'); await sleep(120);
    await tap(page, '.lw-settings [data-key="reducedMotion"]');
    await tap(page, '.lw-settings-close'); await sleep(120);
  }
  await tap(page, '#start');
  await sleep(300);
  await plantAt(page, 0.9);
  const { frames, walk } = await walkOf(page);
  const xs = frames.filter(f => f.x !== null).map(f => Math.round(f.x * 10) / 10);
  const places = Array.from(new Set(xs));
  const lo = Math.min(walk.from, walk.to) - 0.5, hi = Math.max(walk.from, walk.to) + 0.5, dir = Math.sign(walk.to - walk.from);
  const ordered = xs.every((x, i) => i === 0 || dir * (x - xs[i - 1]) >= -0.05);
  say(places.length >= 3 && xs.every(x => x >= lo && x <= hi) && ordered && Math.abs(xs[xs.length - 1] - walk.to) <= 1,
    'when ' + how + ', the traveler still walks: ' + places.length + ' distinct places between the flag and the truth, in order, ending on the truth (' + walk.walkMs + ' ms)');
  say(errors.length === 0, 'when ' + how + ', nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
