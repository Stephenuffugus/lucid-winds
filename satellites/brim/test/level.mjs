#!/usr/bin/env node
/* BRIM P2: Mode 4 LEVEL, the split (plans/brim/HANDOFF-BRIM.md P2; the handoff's build step 7, B9: "the waterline holds
 * perfectly still while the glass re etches. This is the most important animation in the game.")
 *
 *   node test/level.mjs          (in the foreground, under the gate lock)
 *
 * One glass holds the target's water, etched into its parts; the goal above names the same amount in more parts; the child
 * picks how many pieces to cut each part into; the glass re etches, the child's split first and the true split second, and
 * the water never moves. Played by real taps and keys on ?mode=level. (4a, spot the twin, is not in this build: section 13.)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every round is dealSession's LEVEL task for the seed: the glass's fraction, the goal and the true split
 *   2. one glass on the bench; its water stands at the target exactly from the start, drawn to the pixel; it is etched into
 *      the target's parts, every line at its own place
 *   3. the five split controls are 56 px targets a thumb lands on, all on the screen at 320
 *   4. through every frame of the re etching the waterline does not move (half a pixel at most)
 *   5. the child's split is etched first and exactly (the truth's lines show nothing until it is fully drawn), then the
 *      true split, exactly
 *   6. the result is right only for the true split, and the caption is the fact (the target is the same as the goal)
 *   7. a right split and a wrong one re etch on the same timing
 *   8. with less motion both etchings are full on the reveal's first frame and the water still does not move
 *   9. at 1366x768 with no touch: Tab to start, Enter, Tab to a split, Enter, focus on next
 *  10. nothing fetched after load; no sideways scroll; nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession } from '../engine.js';
import { caption } from '../content.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.BRIM && window.BRIM.ready';
const PAGE = { path: '/brim/index.html?seed=' + SEED + '&grade=4&mode=level&', ready: READY };
const text = f => f.n + '/' + f.d;
const val = f => f.n / f.d;
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(100));
const tasks = dealSession(rng(SEED >>> 0), { mode: 'level', grade: 4, session: 0 });
const linesAt = (list, parts, inner) => list.length === parts - 1 && list.every((l, k) => Math.abs(l.up - (k + 1) / parts * inner) <= 1);
/* every frame of the re etching, queued after the page's own frame */
const arm = page => page.evaluate(() => {
  window.__frames = [];
  const onClick = e => {
    if (!e.target.closest || !e.target.closest('.split')) return;
    window.removeEventListener('click', onClick, true);
    setTimeout(() => {
      const t0 = performance.now();
      const grab = t => {
        const g = window.BRIM.glassNow();
        window.__frames.push({ t, waterTop: g.waterTop, mark: g.mark.length ? g.mark[0].o : null, truth: g.truth.length ? g.truth[0].o : null });
        if (!window.BRIM.revealDone() && performance.now() - t0 < 10000) requestAnimationFrame(grab);
      };
      requestAnimationFrame(grab);
    }, 0);
  };
  window.addEventListener('click', onClick, true);
});

for (const size of [SIZES[0], SIZES[1]]) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const small = [];
  for (const k of [2, 3, 4, 5, 6]) {
    const sel = '#splits .split[data-k="' + k + '"]', r = await centre(page, sel);
    const onScreen = await page.evaluate(sel => { const b = document.querySelector(sel).getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight; }, sel);
    if (!r || r.w < 56 || r.h < 56 || !r.onTop || !onScreen) small.push(k + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') + (onScreen ? '' : ' OFF SCREEN') : ' missing'));
  }
  say(small.length === 0, at + ' the five split controls are 56 px targets a thumb lands on, all on the screen' + (small.length ? ': ' + small.join(', ') : ''));
  const curves = [];
  const rounds = size.width === 375 ? 4 : 2;
  for (let i = 0; i < rounds; i++) {
    if (i) { await tap(page, '#next'); await sleep(200); }
    const want = tasks[i];
    const shown = await page.evaluate(() => ({ num: document.querySelector('#left .num').textContent, den: document.querySelector('#left .den').textContent,
      goal: document.querySelector('#goal .num').textContent + '/' + document.querySelector('#goal .den').textContent,
      right: getComputedStyle(document.getElementById('right')).display, level: window.BRIM.level('left'),
      drawn: parseFloat(document.querySelector('#left .water').style.height), task: window.BRIM.pair() }));
    say(shown.num + '/' + shown.den === text(want.target) && shown.goal === text(want.want) && shown.task.split === want.split,
      at + ' round ' + (i + 1) + ': the glass, the goal and the true split are dealSession\'s (' + shown.num + '/' + shown.den + ' to ' + shown.goal + ' by ' + shown.task.split + ', Node ' + text(want.target) + ' to ' + text(want.want) + ' by ' + want.split + ')');
    const g0 = await page.evaluate(() => window.BRIM.glassNow());
    say(shown.right === 'none' && shown.level === val(want.target) && Math.abs(shown.drawn - val(want.target) * g0.inner) <= 1 && linesAt(g0.mark, want.target.d, g0.inner) && g0.truth.length === 0,
      at + ' round ' + (i + 1) + ': one glass, its water at ' + text(want.target) + ' from the start, etched into ' + want.target.d + ' parts at their places (' + g0.mark.length + ' lines)');
    const k = i % 2 === 0 ? want.split : [2, 3, 4, 5, 6].find(x => x !== want.split);
    await arm(page);
    await tap(page, '#splits .split[data-k="' + k + '"]');
    await revealed(page);
    const frames = await page.evaluate(() => window.__frames);
    const tops = frames.map(f => f.waterTop), still = tops.length ? Math.max(...tops) - Math.min(...tops) : Infinity;
    say(frames.length >= 3 && still <= 0.5 && Math.abs(tops[0] - g0.waterTop) <= 0.5, at + ' round ' + (i + 1) + ': through every frame of the re etching the waterline does not move (' + still.toFixed(2) + ' px over ' + frames.length + ' frames)');
    const g1 = await page.evaluate(() => window.BRIM.glassNow());
    const truthEarly = frames.filter(f => f.truth > 0 && f.mark < 1).length;
    say(truthEarly === 0 && linesAt(g1.mark, want.target.d * k, g1.inner) && g1.mark.every(l => l.o === 1) && linesAt(g1.truth, want.target.d * want.split, g1.inner) && g1.truth.every(l => l.o === 1),
      at + ' round ' + (i + 1) + ': the split into ' + k + ' is etched first and exactly, the true split into ' + want.split + ' second and exactly (' + truthEarly + ' early frames, ' + g1.mark.length + ' and ' + g1.truth.length + ' lines)');
    const result = await page.evaluate(() => window.BRIM.results[window.BRIM.results.length - 1]);
    const cap = await page.evaluate(() => document.getElementById('caption').textContent);
    say(result.split === k && result.correct === (k === want.split) && cap === caption(want.target, want.want, true),
      at + ' round ' + (i + 1) + ': the result is right only for the true split, and the caption is the fact (' + JSON.stringify({ split: k, correct: result.correct, caption: cap }) + ')');
    curves.push({ correct: result.correct, frames: frames.map(f => ({ dt: f.t - result.revealAt, m: f.mark })) });
  }
  if (size.width === 375) {
    const a = curves.find(c => c.correct), b = curves.find(c => !c.correct);
    let worst = 0, n = 0;
    if (a && b) for (const x of a.frames.filter(f => f.dt > 0 && f.dt < 700)) {
      for (let k = 0; k + 1 < b.frames.length; k++) if (b.frames[k].dt <= x.dt && x.dt <= b.frames[k + 1].dt) {
        const y = b.frames[k].m + (b.frames[k + 1].m - b.frames[k].m) * (x.dt - b.frames[k].dt) / ((b.frames[k + 1].dt - b.frames[k].dt) || 1);
        worst = Math.max(worst, Math.abs(x.m - y)); n++; break;
      }
    }
    say(!!a && !!b && n >= 10 && worst < 0.05, at + ' a right split and a wrong one re etch on the same timing (largest difference ' + worst.toFixed(3) + ' over ' + n + ' frames)');
  }
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 8 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  const top0 = (await page.evaluate(() => window.BRIM.glassNow())).waterTop;
  await arm(page);
  await tap(page, '#splits .split[data-k="3"]');
  await revealed(page);
  const frames = await page.evaluate(() => window.__frames);
  say(!!frames[0] && frames[0].mark === 1 && frames[0].truth === 1 && frames.every(f => Math.abs(f.waterTop - top0) <= 0.5), '375x667 with less motion both etchings are full on the first frame and the water does not move (' + JSON.stringify(frames[0]) + ')');
  say(errors.length === 0, '375x667 less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 9 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', { key: 'Tab', until: '#splits .split[data-k="3"]' }, 'Enter'], () => window.BRIM.results.length > 0);
  const first = await page.evaluate(() => window.BRIM.results[0] || null);
  say(kb.ok && !!first && first.byKey && first.split === 3, '1366x768 keyboard Tab to start, Enter, Tab to a split, Enter (' + kb.detail + ')');
  await revealed(page);
  const focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(focus === 'next', '1366x768 keyboard once the re etching is done, focus is on next (' + focus + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' LEVEL FAILURE(S)'); process.exit(1); }
console.log('LEVEL OK');
