#!/usr/bin/env node
/* CREASE P2: C4, the stacked reveal (plans/crease/HANDOFF-CREASE.md section 4 and P2).
 *
 *   node test/stack.mjs          (in the foreground, under the gate lock)
 *
 * An equivalence chain is three equal fractions on three rounds in a row. On the chain's third round the reveal stacks all
 * three over the one point they share. Seed 7 deals the chain 1/2, 2/4, 3/6 as rounds 1 to 3 in FREEHAND and in CREASE mode,
 * read in Node from engine.js, so the gate plays real rounds to it by real drags.
 *
 * Asserted, each watched to fail on a planted fault, in FREEHAND and CREASE mode at 320 and 412:
 *   1. the rounds before the chain's third reveal nothing stacked
 *   2. before the third round's clip goes down nothing is stacked (C5)
 *   3. its reveal stacks the chain's three fractions, in the chain's order, as Node dealt them, fully shown
 *   4. over one point: the column stands on the truth's clip
 *   5. every label inside the board and on the screen, none over another
 *   6. the round after it has nothing stacked; nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { freshRun, generateTask } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 7;
const READY = 'window.CREASE && window.CREASE.ready';

/* the chain's third round does not depend on the tier; the replay is the generator alone */
const replay = (mode, n) => {
  const r = rng(SEED >>> 0);
  let state = freshRun({ grade: 3, mode });
  const out = [];
  for (let i = 0; i < n; i++) { const step = generateTask(r, state); out.push(step.task); state = step.state; }
  return out;
};
const dragClip = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 307, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  for (let i = 1; i <= 6; i++) st.dispatchEvent(new PointerEvent('pointermove', o(x0 + (x1 - x0) * i / 6)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 }).then(() => sleep(150));
const stackNow = page => page.evaluate(() => {
  const st = document.getElementById('stack');
  if (!st) return null;
  const box = e => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
  const truth = document.getElementById('truth-clip');
  return { opacity: Number(getComputedStyle(st).opacity), column: box(st), truth: truth ? box(truth) : null,
    labels: Array.from(st.querySelectorAll('.stack-label')).map(e => Object.assign({ text: e.textContent }, box(e))),
    scene: box(document.getElementById('scene')), vw: innerWidth };
});

for (const mode of ['freehand', 'crease']) {
  const tasks = replay(mode, 6);
  const k = tasks.findIndex(t => t.stackReveal);
  const want = k >= 2 ? tasks.slice(k - 2, k + 1).map(t => t.numerator + '/' + t.denominator) : [];
  say(k === 2 && tasks[k].chainStep === 3, mode + ' the premise: seed ' + SEED + ' deals a chain whose third round is round 3 (' + want.join(', ') + ')');
  if (k < 2) continue;
  for (const size of [SIZES[0], SIZES[2]]) {
    const at = mode + ' ' + size.name;
    const { browser, page, errors } = await open(s.base, Object.assign({}, size, { path: '/crease/index.html?seed=' + SEED + '&mode=' + mode + '&', ready: READY }));
    await tap(page, '#start');
    await sleep(250);
    const before = [];
    let beforeCommit = 'not reached', shown = null, dealt = null, after = 'not reached';
    for (let i = 0; i <= k + 1; i++) {
      if (i) { await tap(page, '#next'); await sleep(250); }
      if (i === k) {
        dealt = await page.evaluate(() => window.CREASE.task());
        beforeCommit = await stackNow(page);
      }
      /* ⛔ the first version read the round after before its clip went down, when no reveal exists, so a stack on EVERY
         later reveal (plant s7) passed; it now plays that round and reads its reveal */
      if (i === k + 1) { const pre = await stackNow(page); await dragClip(page, 0.4); await revealed(page); after = pre === null ? await stackNow(page) : pre; break; }
      await dragClip(page, 0.4);
      await revealed(page);
      if (i < k) before.push(await stackNow(page));
      else shown = await stackNow(page);
    }
    say(before.length === k && before.every(x => x === null), at + ' the rounds before the chain\'s third reveal nothing stacked (' + before.map(x => x ? 'STACKED' : 'none').join(', ') + ')');
    say(beforeCommit === null && dealt && dealt.stackReveal, at + ' before the third round\'s clip goes down nothing is stacked (C5)');
    const texts = shown ? shown.labels.map(l => l.text) : [];
    say(!!shown && texts.join() === want.join() && shown.opacity > 0.99, at + ' its reveal stacks the chain\'s three fractions in order, fully shown (' + JSON.stringify(texts) + ', opacity ' + (shown ? shown.opacity : '') + ')');
    if (shown) {
      const mid = b => (b.l + b.r) / 2;
      const off = shown.truth ? Math.abs(mid(shown.column) - mid(shown.truth)) : Infinity;
      say(off <= 1 && shown.labels.every(l => Math.abs(mid(l) - mid(shown.truth)) <= 1), at + ' over one point: the column and every label stand on the truth\'s clip (' + off.toFixed(2) + ' px)');
      const outside = shown.labels.filter(l => l.l < shown.scene.l || l.r > shown.scene.r || l.t < shown.scene.t || l.b > shown.scene.b || l.l < 0 || l.r > shown.vw);
      const over = shown.labels.slice(1).filter((l, i) => l.t < shown.labels[i].b - 0.5);
      say(outside.length === 0 && over.length === 0, at + ' every label inside the board and on the screen, none over another (' + outside.length + ' outside, ' + over.length + ' over)');
    }
    say(after === null, at + ' the round after it has nothing stacked, before its clip goes down or in its reveal' + (after ? ' (' + JSON.stringify(after.labels.map(l => l.text)) + ')' : ''));
    say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
    await browser.close();
  }
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' STACK FAILURE(S)'); process.exit(1); }
console.log('STACK OK');
