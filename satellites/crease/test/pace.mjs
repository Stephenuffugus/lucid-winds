#!/usr/bin/env node
/* CREASE's reveal under a slow machine (plans/crease/HANDOFF-CREASE.md P3; the handoff's test gate 9).
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * Measured as frame pacing with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box, the only machine a gate
 * has; a real school Chromebook is Stephen's.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. under 4x CPU throttle, the frames of a reveal come at a median of at most 1000/55 ms apart, and no frame waits more
 *      than 100 ms
 *   2. at every frame of it the truth's clip stands at the opacity the steady curve says (min(1, t / 0.6 of the reveal)),
 *      within 0.02, read on the same frame's time
 *   3. with less motion (the device's wish, and separately the settings switch), the reveal still happens in order: the
 *      truth fades in over at least three frames and reaches full before any crease shows, and the creases end at full
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.CREASE && window.CREASE.ready';
const PATH = '/crease/index.html?seed=4242&mode=freehand&';
const REVEAL = 900;

/* the clip put down, and every frame after it recorded on its own rAF time, queued after the page's reveal frame */
const plantAt = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 241, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  window.__frames = [];
  const grab = t => {
    const truth = document.getElementById('truth-clip'), creases = Array.from(document.querySelectorAll('#strip .crease'));
    window.__frames.push({ t, truth: truth ? Number(truth.style.opacity) : null, crease: creases.length ? Math.max(...creases.map(c => Number(c.style.opacity))) : null });
    if (!window.CREASE.revealDone() || window.__frames.length < 3) requestAnimationFrame(grab);
  };
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
  requestAnimationFrame(grab);
}, frac);
const revealOf = async page => {
  await page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 60000 });
  return { frames: await page.evaluate(() => window.__frames), result: await page.evaluate(() => window.CREASE.results[window.CREASE.results.length - 1]) };
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
  const { frames, result } = await revealOf(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const during = frames.filter(f => f.t >= result.revealAt && f.t <= result.revealAt + REVEAL);
  const gaps = during.slice(1).map((f, i) => f.t - during[i].t).sort((a, b) => a - b);
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : Infinity, worst = gaps.length ? gaps[gaps.length - 1] : Infinity;
  say(gaps.length >= 20 && median <= 1000 / 55 && worst <= 100, 'under 4x CPU throttle the reveal\'s frames come a median of ' + median.toFixed(1) + ' ms apart (at most ' + (1000 / 55).toFixed(1) + '), the longest wait ' + worst.toFixed(0) + ' ms (at most 100), over ' + gaps.length + ' frames');
  const off = during.filter(f => f.truth !== null).map(f => { const p = Math.min(1, Math.max(0, f.t - result.revealAt) / REVEAL); return Math.abs(f.truth - Math.min(1, p / 0.6)); });
  const worstOff = off.length ? Math.max(...off) : Infinity;
  say(off.length >= 20 && worstOff <= 0.02, 'and at every frame the truth\'s clip is at the opacity the steady curve says (largest miss ' + worstOff.toFixed(3) + ' over ' + off.length + ' frames)');
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
  await plantAt(page, 0.9);
  const { frames } = await revealOf(page);
  const seen = frames.filter(f => f.truth !== null);
  const between = new Set(seen.map(f => f.truth).filter(o => o > 0.001 && o < 0.999).map(o => o.toFixed(3)));
  /* ⛔ the first version wanted the frame where the truth first reached full strictly before the frame where a crease first
     showed; the truth is full at 60 percent of the reveal and the creases start just after, so one frame landing past 60
     percent holds both, and the law went red on a page in the right order. The order is a law of every frame: wherever a
     crease shows, the truth is already full. */
  const outOfOrder = seen.filter(f => f.crease > 0.001 && f.truth < 0.999).length;
  const creaseAt = seen.findIndex(f => f.crease > 0.001);
  const last = seen[seen.length - 1];
  const shortened = seen.length && (seen[seen.length - 1].t - seen[0].t) < REVEAL;
  say(between.size >= 2 && creaseAt > 0 && outOfOrder === 0 && last && last.crease >= 0.999 && shortened,
    'when ' + how + ', the reveal is shorter and still in order: the truth passes ' + between.size + ' opacities between none and full (at least 2), is full on every frame a crease shows (' + outOfOrder + ' frames out of order, creases from frame ' + creaseAt + '), and the creases end full');
  say(errors.length === 0, 'when ' + how + ', nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
