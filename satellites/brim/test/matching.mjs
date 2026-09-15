#!/usr/bin/env node
/* BRIM P1: MATCHING and the reveal (plans/brim/HANDOFF-BRIM.md P1; the handoff's build steps 1, 3 and 4, B1 and B7).
 *
 *   node test/matching.mjs          (in the foreground, under the gate lock)
 *
 * Played by real taps and real keys on ?mode=matching. Every pair is replayed in Node from engine.js for the same seed,
 * sessions back to back.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: start and both glasses are 56 px targets a thumb lands on
 *   2. B7: the two glasses are the same box and the same drawn glass (size, border, corner, background), their tops level
 *      (the plan's 3.12 asks for outline pixels; this reads the boxes and computed styles, which draw those pixels)
 *   3. B1: before a choice both glasses hold no water, not after a hover over one, not with a glass focused, and not at
 *      the click itself (read in a capture listener before the page's own)
 *   4. every round's pair is dealSession's for the seed, fourteen rounds crossing a session's end
 *   5. the result is scoreChoice's for the side tapped
 *   6. the chosen glass fills first: the other glass shows no water until the chosen one has reached its level
 *   7. both glasses end exactly at their fractions, drawn to the pixel
 *   8. the caption is the fact composed by content.js (the larger first), and names no verdict
 *   9. a right round and a wrong round fill on the same curve
 *  10. with less motion the fill is instant: both glasses are at their levels on the first frame of the reveal
 *  11. next is a 56 px target after the reveal; no sideways scroll; nothing fetched after load; nothing on the console
 *  12. at 1366x768 with no touch: Tab to start, Enter, Enter chooses the focused glass, focus is on next, Enter moves on
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession, scoreChoice } from '../engine.js';
import { caption } from '../content.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.BRIM && window.BRIM.ready';
const PAGE = { path: '/brim/index.html?seed=' + SEED + '&grade=4&mode=matching&count=24&', ready: READY };

const replay = n => {
  const r = rng(SEED >>> 0), out = [];
  for (let k = 0; out.length < n; k++) out.push(...dealSession(r, { mode: 'matching', grade: 4, session: k }));
  return out.slice(0, n);
};
const text = f => f.n + '/' + f.d;
const val = f => f.n / f.d;
const waters = page => page.evaluate(() => ['left', 'right'].map(id => {
  const w = document.querySelector('#' + id + ' .water'), g = document.querySelector('#' + id + ' .glass');
  return { h: w.getBoundingClientRect().height, vis: getComputedStyle(w).visibility, level: Number(w.dataset.level || 0), inner: g.clientHeight, drawn: parseFloat(w.style.height || '0') };
}));
const dry = list => list.every(w => w.h < 0.5 && w.vis === 'hidden');
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(100));
/* the glasses at the click, before the page's handler, and every frame of the reveal after the page's own frame */
const arm = page => page.evaluate(() => {
  window.__atClick = null;
  window.__levels = [];
  const onClick = e => {
    if (!e.target.closest || !e.target.closest('.vessel')) return;
    window.removeEventListener('click', onClick, true);
    window.__atClick = ['left', 'right'].map(id => { const w = document.querySelector('#' + id + ' .water'); return { h: w.getBoundingClientRect().height, vis: getComputedStyle(w).visibility }; });
    setTimeout(() => {
      const t0 = performance.now();
      const grab = t => {
        window.__levels.push({ t, left: window.BRIM.level('left'), right: window.BRIM.level('right') });
        if (!window.BRIM.revealDone() && performance.now() - t0 < 10000) requestAnimationFrame(grab);
      };
      requestAnimationFrame(grab);
    }, 0);
  };
  window.addEventListener('click', onClick, true);
});

for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  const start = await centre(page, '#start');
  await tap(page, '#start');
  await sleep(250);
  const small = [];
  for (const [sel, r] of [['#start', start], ['#left', await centre(page, '#left')], ['#right', await centre(page, '#right')]]) {
    if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing'));
  }
  say(small.length === 0, at + ' start and both glasses are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));
  const twins = await page.evaluate(() => {
    const g = id => { const e = document.querySelector('#' + id + ' .glass'), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return { w: r.width, h: r.height, top: r.top, look: [cs.borderLeftWidth, cs.borderBottomWidth, cs.borderTopWidth, cs.borderBottomLeftRadius, cs.borderBottomRightRadius, cs.backgroundColor, cs.borderLeftColor].join('|') }; };
    return { left: g('left'), right: g('right') };
  });
  say(twins.left.w === twins.right.w && twins.left.h === twins.right.h && Math.abs(twins.left.top - twins.right.top) < 0.5 && twins.left.look === twins.right.look,
    at + ' B7: the two glasses are the same box and the same drawn glass, their tops level (' + JSON.stringify([twins.left.w, twins.left.h, twins.right.w, twins.right.h]) + ')');

  const all = replay(14), rounds = size.width === 375 ? 14 : 2, curves = [];
  for (let i = 0; i < rounds; i++) {
    if (i) { await tap(page, '#next'); await sleep(200); }
    const want = all[i], got = await page.evaluate(() => window.BRIM.pair());
    const seam = text(got.left) === text(want.left) && text(got.right) === text(want.right);
    say(seam, at + ' round ' + (i + 1) + ': the pair is dealSession\'s (' + text(got.left) + ' vs ' + text(got.right) + ', Node ' + text(want.left) + ' vs ' + text(want.right) + ')');
    const before = await waters(page);
    await page.evaluate(() => { const g = document.querySelector('#left .glass'), r = g.getBoundingClientRect();
      for (const type of ['pointerover', 'pointermove', 'mouseover', 'mousemove']) g.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerType: 'mouse' })); });
    const hovered = await waters(page);
    await page.evaluate(() => document.getElementById('right').focus());
    const focused = await waters(page);
    const larger = scoreChoice(want, 'left').larger;
    const side = i % 2 === 0 ? (larger === 'right' ? 'right' : 'left') : (larger === 'right' ? 'left' : 'right');
    await arm(page);
    await tap(page, '#' + side);
    await revealed(page);
    const atClick = await page.evaluate(() => window.__atClick);
    say(dry(before) && dry(hovered) && dry(focused) && !!atClick && dry(atClick), at + ' round ' + (i + 1) + ': B1, no water before the choice, after a hover, with a glass focused, or at the click (' + JSON.stringify({ before: dry(before), hovered: dry(hovered), focused: dry(focused), atClick: !!atClick && dry(atClick) }) + ')');
    const result = await page.evaluate(() => window.BRIM.results[window.BRIM.results.length - 1]);
    const score = scoreChoice(want, side);
    say(result.side === side && result.correct === score.correct && result.larger === score.larger, at + ' round ' + (i + 1) + ': the result is scoreChoice\'s for ' + side + ' (' + JSON.stringify({ correct: result.correct, larger: result.larger }) + ')');
    const other = side === 'left' ? 'right' : 'left', levels = await page.evaluate(() => window.__levels);
    const early = levels.filter(f => f[other] > 0 && f[side] < val(want[side]) - 1e-9);
    const firstChosen = levels.findIndex(f => f[side] > 0), firstOther = levels.findIndex(f => f[other] > 0);
    say(levels.length >= 3 && firstChosen >= 0 && firstOther > firstChosen && early.length === 0, at + ' round ' + (i + 1) + ': the chosen glass fills first, the other only once it has reached its level (frames ' + firstChosen + ' then ' + firstOther + ', ' + early.length + ' early)');
    const done = await waters(page);
    const exact = ['left', 'right'].map((k, j) => ({ k, level: done[j].level, want: val(want[k]), px: Math.abs(done[j].drawn - val(want[k]) * done[j].inner) }));
    say(exact.every(e => e.level === e.want && e.px <= 1), at + ' round ' + (i + 1) + ': both glasses end exactly at their fractions, drawn to the pixel (' + exact.map(e => e.k + ' ' + e.level.toFixed(4) + ' of ' + e.want.toFixed(4) + ', ' + e.px.toFixed(2) + ' px').join('; ') + ')');
    const cap = await page.evaluate(() => document.getElementById('caption').textContent);
    const big = val(want.left) >= val(want.right) ? want.left : want.right, little = big === want.left ? want.right : want.left;
    const fact = caption(big, little, val(want.left) === val(want.right));
    say(cap === fact && !/correct|wrong|right|incorrect|try again|oops/i.test(cap), at + ' round ' + (i + 1) + ': the caption is the fact (' + JSON.stringify(cap) + ', composed ' + JSON.stringify(fact) + ')');
    curves.push({ correct: result.correct, frames: levels.map(f => ({ dt: f.t - result.revealAt, n: f[side] / val(want[side]) })) });
  }
  if (size.width === 375) {
    const a = curves.find(c => c.correct), b = curves.find(c => !c.correct);
    let worst = 0, n = 0;
    if (a && b) for (const x of a.frames.filter(f => f.dt > 0 && f.dt < 700)) {
      for (let k = 0; k + 1 < b.frames.length; k++) if (b.frames[k].dt <= x.dt && x.dt <= b.frames[k + 1].dt) {
        const y = b.frames[k].n + (b.frames[k + 1].n - b.frames[k].n) * (x.dt - b.frames[k].dt) / ((b.frames[k + 1].dt - b.frames[k].dt) || 1);
        worst = Math.max(worst, Math.abs(x.n - y)); n++; break;
      }
    }
    say(!!a && !!b && n >= 10 && worst < 0.05, at + ' a right round and a wrong round fill on the same curve (largest difference ' + worst.toFixed(3) + ' over ' + n + ' frames)');
  }
  const nx = await centre(page, '#next');
  say(!!nx && nx.w >= 56 && nx.h >= 56 && nx.onTop, at + ' next is a 56 px target after the reveal');
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 10 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  const want = replay(1)[0];
  await arm(page);
  await tap(page, '#left');
  await revealed(page);
  const first = (await page.evaluate(() => window.__levels))[0];
  say(!!first && first.left === val(want.left) && first.right === val(want.right), '375x667 with less motion the fill is instant: both glasses at their levels on the reveal\'s first frame (' + JSON.stringify(first) + ')');
  say(errors.length === 0, '375x667 less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 12 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', 'Enter'], () => window.BRIM.results.length > 0);
  const first = await page.evaluate(() => window.BRIM.results[0] || null);
  say(kb.ok && !!first && first.byKey && first.side === 'left', '1366x768 keyboard Tab to start, Enter, Enter chooses the focused glass (' + kb.detail + ')');
  await revealed(page);
  const focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(focus === 'next', '1366x768 keyboard once the reveal is done, focus is on next (' + focus + ')');
  await page.keyboard.press('Enter');
  const moved = await page.waitForFunction(() => window.BRIM.round() === 1, { timeout: 10000 }).then(() => true, () => false);
  const back = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(moved && back === 'left', '1366x768 keyboard Enter on next deals the next round with focus on the left glass (' + back + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' MATCHING FAILURE(S)'); process.exit(1); }
console.log('MATCHING OK');
