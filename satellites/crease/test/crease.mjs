#!/usr/bin/env node
/* CREASE P2: Mode 1 CREASE (plans/crease/HANDOFF-CREASE.md P2; the handoff's build step 4, C6 and C8).
 *
 *   node test/crease.mjs          (in the foreground, under the gate lock)
 *
 * The child folds the strip into equal parts with two controls, the creases appear, the clip snaps to them, and the round
 * is put down and revealed as in FREEHAND. Played by real taps, real drags and real keys on ?mode=crease. Every task is
 * replayed in Node from engine.js for the same seed, the tier from the page's own results.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: fold more, fold less and the clip are 56 px targets a thumb lands on; nothing on the console or
 *      fetched after load; no sideways scroll
 *   2. before any fold the strip holds only its wholes' own ends (none on a strip of one), unlabelled; each tap on fold more
 *      makes whole times parts equal parts, every crease at its own k over that count to the pixel (C6), and fold less
 *      takes a fold away; never fewer than one part
 *   3. no crease carries a label while the child folds or places the clip (C8)
 *   4. the clip snaps: let go anywhere, it rests on a crease or an end, as value, as drawn and as reported
 *   5. the task is Node's replay; the result is engine.js's scoreAttempt; the reveal creases the strip into the true
 *      denominator's parts with the true crease alone labelled, as in FREEHAND
 *   6. folded into the denominator's parts with the clip on the numerator's crease, the round scores no error at all
 *   7. at 1366x768 with no touch: Tab to fold more, Enter three times, Tab to the clip, one arrow press moves one part,
 *      Enter puts it down
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng, fromNormalized, adaptTier } from '../../math/core/pure.js';
import { freshRun, generateTask, scoreAttempt, TIER_CONFIG } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.CREASE && window.CREASE.ready';
const PAGE = { path: '/crease/index.html?seed=' + SEED + '&mode=crease&', ready: READY };

function replay(results, n) {
  const r = rng(SEED >>> 0);
  let state = freshRun({ grade: 3, mode: 'crease' });
  const tasks = [];
  for (let i = 0; i < n; i++) {
    state.tier = adaptTier(results.slice(0, i).map(x => x.correct), TIER_CONFIG);
    const step = generateTask(r, state);
    tasks.push(step.task);
    state = step.state;
  }
  return tasks;
}
/* the creases on the strip now, as drawn: where each stands and whether it carries a label */
const creases = page => page.evaluate(() => {
  const el = document.getElementById('strip');
  return { W: el.getBoundingClientRect().width, offset: Number(el.dataset.offset), width: Number(el.dataset.width), whole: Number(el.dataset.whole),
    parts: Number(el.dataset.parts),
    list: Array.from(el.querySelectorAll('.crease')).filter(c => getComputedStyle(c).display !== 'none').map(c => ({ x: parseFloat(c.style.left),
      labelled: !!(c.querySelector('.crease-label') && c.querySelector('.crease-label').textContent.trim()), visible: Number(getComputedStyle(c).opacity) > 0.01 })) };
});
const foldsRight = (c, parts) => {
  const count = c.whole * parts;
  const g = { offsetPct: c.offset, widthPct: c.width };
  const off = c.list.filter((x, k) => Math.abs(x.x - fromNormalized((k + 1) / count, g, c.W)) > 0.5).length;
  return { ok: c.list.length === count - 1 && off === 0 && c.list.every(x => x.visible), count, off };
};
const dragClip = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 201, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  for (let i = 1; i <= 6; i++) st.dispatchEvent(new PointerEvent('pointermove', o(x0 + (x1 - x0) * i / 6)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 }).then(() => sleep(120));

for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const small = [];
  for (const sel of ['#fold-more', '#fold-less', '#strip .lw-stone']) {
    const r = await centre(page, sel);
    if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing'));
  }
  say(small.length === 0, at + ' fold more, fold less and the clip are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));
  const task = replay([], 1)[0];
  const pageTask = await page.evaluate(() => window.CREASE.task());
  say(pageTask.numerator === task.numerator && pageTask.denominator === task.denominator && pageTask.whole === task.whole && pageTask.mode === 'crease',
    at + ' the task is Node\'s replay in CREASE mode (' + pageTask.numerator + '/' + pageTask.denominator + ' of ' + pageTask.whole + ')');
  const none = await creases(page);
  /* one part a whole: on a strip longer than one only the wholes' own ends are creased, and on a strip of one nothing */
  say(none.list.length === none.whole - 1 && none.parts === 1 && none.list.every(x => !x.labelled), at + ' before any fold the strip holds only its wholes\' ends (' + none.list.length + ' creases on a whole of ' + none.whole + ', ' + none.parts + ' part)');

  /* folds: more, more, more, less, then as many as the denominator needs */
  const seen = [];
  for (const [ctl, want] of [['#fold-more', 2], ['#fold-more', 3], ['#fold-more', 4], ['#fold-less', 3]]) {
    await tap(page, ctl);
    await sleep(120);
    const c = await creases(page), f = foldsRight(c, want);
    seen.push({ ctl, want, parts: c.parts, ok: f.ok, labelled: c.list.some(x => x.labelled) });
  }
  say(seen.every(x => x.ok && x.parts === x.want), at + ' each fold makes equal creases at their own places, and fold less takes one away (C6) (' + JSON.stringify(seen.map(x => x.parts + (x.ok ? '' : ' OFF'))) + ')');
  say(seen.every(x => !x.labelled), at + ' no crease carries a label while the child folds (C8)');
  for (let i = 0; i < 6; i++) { await tap(page, '#fold-less'); await sleep(60); }
  const floor = await creases(page);
  say(floor.parts === 1 && floor.list.length === floor.whole - 1, at + ' folding back never goes below one part (' + floor.parts + ')');

  /* fold to the denominator and put the clip near the numerator's crease: it snaps there and scores no error */
  for (let i = 1; i < task.denominator; i++) { await tap(page, '#fold-more'); await sleep(60); }
  const aim = task.numerator / task.denominator / task.whole + 0.35 / (task.whole * task.denominator);
  await dragClip(page, Math.min(1, aim));
  await sleep(60);
  const snapped = await page.evaluate(() => { const el = document.getElementById('strip'); return { v: window.CREASE.results.length ? window.CREASE.results[window.CREASE.results.length - 1].value : null, px: parseFloat(el.querySelector('.lw-stone').style.left) }; });
  const c = await creases(page);
  const onEdge = snapped.v !== null && Math.abs(snapped.v * c.whole * c.parts - Math.round(snapped.v * c.whole * c.parts)) < 1e-9;
  const drawnAt = fromNormalized(snapped.v || 0, { offsetPct: c.offset, widthPct: c.width }, c.W);
  say(onEdge && Math.abs(snapped.px - drawnAt) <= 0.5, at + ' the clip let go between creases rests on one, as value and as drawn (' + (snapped.v !== null ? (snapped.v * c.whole * c.parts).toFixed(3) + ' parts' : 'no result') + ')');
  await revealed(page);
  const result = await page.evaluate(() => window.CREASE.results[window.CREASE.results.length - 1]);
  const want = scoreAttempt(task, result.placement, task.tier);
  say(result.pae === want.pae && result.correct === want.correct, at + ' the result is engine.js\'s scoreAttempt (' + JSON.stringify({ pae: result.pae, correct: result.correct }) + ')');
  say(Math.abs(result.pae) < 1e-12 && result.correct, at + ' folded to the denominator with the clip on the numerator\'s crease, the round scores no error (' + result.pae + ')');
  const after = await creases(page);
  const trueParts = task.whole * task.denominator;
  const labelled = after.list.map((x, k) => ({ k: k + 1, labelled: x.labelled })).filter(x => x.labelled);
  say(after.list.length === trueParts - 1 && labelled.length === 1 && labelled[0].k === task.numerator,
    at + ' the reveal creases the strip into the true denominator\'s parts with the true crease alone labelled (' + after.list.length + ' creases, labelled ' + JSON.stringify(labelled) + ')');
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the Chromebook, by keys ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', { key: 'Tab', until: '#fold-more' }, { key: 'Enter', times: 3 },
    { key: 'Tab', until: '#strip .lw-stone' }, 'ArrowRight'], () => true);
  const one = await page.evaluate(() => { const el = document.getElementById('strip'); return { parts: Number(el.dataset.parts), whole: Number(el.dataset.whole), v: Number(el.querySelector('.lw-stone').getAttribute('aria-valuenow')) }; });
  const step = 1 / (one.whole * one.parts);
  say(kb.ok && one.parts === 4 && Math.abs(one.v - step) < 0.006, '1366x768 keyboard Tab to fold more, Enter three times makes four parts, and one arrow press moves the clip one part (' + JSON.stringify(one) + ', ' + kb.detail + ')');
  await page.keyboard.press('Enter');
  const done = await page.waitForFunction(() => window.CREASE.results.length > 0, { timeout: 10000 }).then(() => true, () => false);
  say(done, '1366x768 keyboard Enter puts the clip down');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CREASE FAILURE(S)'); process.exit(1); }
console.log('CREASE OK');
