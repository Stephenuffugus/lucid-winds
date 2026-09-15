#!/usr/bin/env node
/* CREASE P2: Mode 3 HALFWAY (plans/crease/HANDOFF-CREASE.md 3.7 and P2; the handoff's build step 5).
 *
 *   node test/halfway.mjs          (in the foreground, under the gate lock)
 *
 * A fraction; the strip from 0 to 1 with its middle fold; the child sends the clip to the left of the fold (less than a
 * half) or to the right (more); after five right in a row a third choice, exactly half, joins them and stays for the run.
 * Six seconds pass without a choice and the reveal runs anyway, with no mark and nothing said, and nothing on the screen
 * ever counts those seconds (G5). Played by real taps and real keys on ?mode=halfway; every task is Node's replay.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: less and more are 56 px targets a thumb lands on, exactly half is not on the screen before a
 *      streak; nothing on the console, nothing fetched after load, no sideways scroll
 *   2. every task is Node's replay in HALFWAY mode, on a whole of 1
 *   3. each choice is recorded with engine.js's judgeHalf as the truth, and the reveal puts the truth's clip at the true
 *      place with the same fade whichever side was chosen
 *   4. five choices in a row that match the truth bring exactly half onto the screen as a 56 px target; a wrong choice
 *      after that does not take it away
 *   5. a round left alone for six seconds reveals itself, is recorded as timed out and as neither right nor wrong, and
 *      changes neither the streak nor the tier
 *   6. nothing on the screen changes during those six seconds: no text, no width, no bar (G5)
 *   7. at 1366x768 with no touch: Tab to less or more, Enter chooses, next by Enter
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng, fromNormalized, adaptTier } from '../../math/core/pure.js';
import { freshRun, generateTask, judgeHalf, TIER_CONFIG } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.CREASE && window.CREASE.ready';
const PAGE = { path: '/crease/index.html?seed=' + SEED + '&mode=halfway&', ready: READY };

/* HALFWAY's tasks do not depend on the tier, only on whether exactly half is open; the gate answers the first five right,
   so it opens from the sixth round (openFrom) */
const replay = (n, openFrom) => {
  const r = rng(SEED >>> 0);
  let state = freshRun({ grade: 3, mode: 'halfway' });
  const out = [];
  for (let i = 0; i < n; i++) { state.halfOpen = i >= openFrom; const step = generateTask(r, state); out.push(step.task); state = step.state; }
  return out;
};
const shownOnScreen = (page, sel) => page.evaluate(sel => {
  const e = document.querySelector(sel);
  if (!e) return false;
  const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
}, sel);
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 }).then(() => sleep(120));
const lastResult = page => page.evaluate(() => window.CREASE.results[window.CREASE.results.length - 1] || null);
/* everything a child could read as a clock: every element's text and its box, as a string */
const face = page => page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => {
  const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden';
}).map(e => { const r = e.getBoundingClientRect(); return (e.id || e.className || e.tagName) + ':' + Array.from(e.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('') + ':' + Math.round(r.width) + 'x' + Math.round(r.height) + ':' + getComputedStyle(e).opacity; }).join('\n'));

for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const small = [];
  for (const sel of ['#less', '#more']) {
    const r = await centre(page, sel);
    if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) : ' missing'));
  }
  say(small.length === 0, at + ' less and more are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));
  say(!(await shownOnScreen(page, '#half')), at + ' exactly half is not on the screen before a streak');

  if (size.width === 375) {
    /* five right in a row, then one wrong: exactly half is on the screen from the sixth round's start, and still on the
       seventh's after the wrong sixth.
       ⛔ the first version read #half after each reveal, before next deals the round that shows it, so it wanted half one
       round too early and went red on a page doing what the plan says (half joins the round after the fifth right) */
    const tasks = replay(7, 5), rows = [], halfAtStart = [];
    for (let i = 0; i < 7; i++) {
      if (i) { await tap(page, '#next'); await sleep(200); }
      halfAtStart.push(await shownOnScreen(page, '#half'));
      const t = await page.evaluate(() => window.CREASE.task());
      const want = tasks[i];
      const truth = judgeHalf(want);
      const same = t.numerator === want.numerator && t.denominator === want.denominator && t.whole === 1 && t.mode === 'halfway';
      /* right while i < 5, a wrong side on the sixth, then right again */
      let choice = truth;
      if (i === 5) choice = truth === 'more' ? 'less' : 'more';
      const sel = '#' + choice;
      if (!(await shownOnScreen(page, sel))) choice = truth === 'more' ? 'more' : 'less';
      const t0 = await page.evaluate(() => performance.now());
      await page.evaluate(() => {
        window.__fade = [];
        const grab = () => {
          const c = document.getElementById('truth-clip');
          window.__fade.push({ t: performance.now(), o: c ? Number(getComputedStyle(c).opacity) : 0 });
          if (!window.CREASE.revealDone() || window.__fade.length < 3) requestAnimationFrame(grab);
        };
        requestAnimationFrame(grab);
      });
      await tap(page, '#' + choice);
      await revealed(page);
      const res = await lastResult(page);
      const place = await page.evaluate(() => { const el = document.getElementById('strip'); return { W: el.getBoundingClientRect().width, o: Number(el.dataset.offset), w: Number(el.dataset.width), x: parseFloat(document.getElementById('truth-clip').style.left) }; });
      const truthAt = fromNormalized(want.numerator / want.denominator, { offsetPct: place.o, widthPct: place.w }, place.W);
      rows.push({ i, same, choice, truth, res, truthOk: Math.abs(place.x - truthAt) <= 1, fade: await page.evaluate(() => window.__fade), revealAt: res && res.revealAt, t0 });
    }
    say(rows.every(x => x.same), at + ' every task is Node\'s replay in HALFWAY mode on a whole of 1 (' + rows.map(x => x.same ? 'ok' : 'OFF').join(',') + ')');
    say(rows.every(x => x.res && x.res.choice === x.choice && x.res.truth === x.truth && x.res.correct === (x.choice === x.truth) && !x.res.timedOut),
      at + ' each choice is recorded with judgeHalf as the truth (' + JSON.stringify(rows.map(x => x.res && [x.res.choice, x.res.truth, x.res.correct])) + ')');
    say(rows.every(x => x.truthOk), at + ' and the reveal puts the truth\'s clip at the true place');
    const curve = x => x.fade.filter(f => f.t >= x.revealAt).map(f => ({ dt: f.t - x.revealAt, o: f.o }));
    const a = curve(rows[4]), b = curve(rows[5]);
    let worst = 0, n = 0;
    for (const p of a) for (let k = 0; k + 1 < b.length; k++) if (b[k].dt <= p.dt && p.dt <= b[k + 1].dt) { worst = Math.max(worst, Math.abs(p.o - (b[k].o + (b[k + 1].o - b[k].o) * (p.dt - b[k].dt) / ((b[k + 1].dt - b[k].dt) || 1)))); n++; break; }
    say(n >= 8 && worst < 0.06, at + ' a right choice and a wrong one reveal on the same fade (largest difference ' + worst.toFixed(3) + ' over ' + n + ' frames)');
    const halfTarget = await centre(page, '#half');
    say(halfAtStart.slice(0, 5).every(x => !x) && halfAtStart[5] && halfAtStart[6] && !!halfTarget && halfTarget.w >= 56 && halfTarget.h >= 56 && halfTarget.onTop,
      at + ' five right in a row bring exactly half onto the next round\'s screen as a 56 px target, and the wrong sixth does not take it away (at each round\'s start ' + JSON.stringify(halfAtStart) + ')');

    /* a round left alone for six seconds: no mark, no change to the streak or the tier, nothing counting on the screen */
    await tap(page, '#next');
    await sleep(250);
    const before = await page.evaluate(() => ({ streak: window.CREASE.streak(), tier: window.CREASE.tier(), n: window.CREASE.results.length }));
    const face0 = await face(page);
    await sleep(3000);
    const face1 = await face(page);
    say(face0 === face1, at + ' nothing on the screen changes while the seconds pass: no text, width or bar (G5)');
    const timedOut = await page.waitForFunction(n => window.CREASE.results.length > n, { timeout: 6000 }, before.n).then(() => true, () => false);
    await revealed(page).catch(() => {});
    const res = await lastResult(page);
    const afterIt = await page.evaluate(() => ({ streak: window.CREASE.streak(), tier: window.CREASE.tier() }));
    say(timedOut && !!res && res.timedOut === true && res.correct === null && res.choice === null,
      at + ' a round left alone reveals itself within six seconds and is recorded as timed out, neither right nor wrong (' + JSON.stringify(res && { timedOut: res.timedOut, correct: res.correct, choice: res.choice }) + ')');
    say(afterIt.streak === before.streak && afterIt.tier === before.tier, at + ' and changes neither the streak nor the tier (' + JSON.stringify([before.streak, afterIt.streak, before.tier, afterIt.tier]) + ')');

    /* ⛔ plant h2 (a round left alone counted as wrong) planted nothing against the law above: one timeout after this run
       leaves the tier where it was whichever way it is counted. A second timeout in a row lowers a tier that counts them
       and not one that leaves them out; the law first proves the two readings differ on the rounds played, then holds the
       page's tier to the one that leaves them out */
    await tap(page, '#next');
    await sleep(250);
    const n2 = await page.evaluate(() => window.CREASE.results.length);
    await page.waitForFunction(n => window.CREASE.results.length > n, { timeout: 9000 }, n2).catch(() => {});
    await revealed(page).catch(() => {});
    const all = await page.evaluate(() => window.CREASE.results);
    const pageTier = await page.evaluate(() => window.CREASE.tier());
    const leftOut = adaptTier(all.filter(x => !x.timedOut).map(x => x.correct), TIER_CONFIG);
    const countedWrong = adaptTier(all.map(x => (x.timedOut ? false : x.correct)), TIER_CONFIG);
    say(all.filter(x => x.timedOut).length === 2 && leftOut !== countedWrong, at + ' the premise: after two rounds left alone, leaving them out and counting them wrong give different tiers (' + leftOut + ' and ' + countedWrong + ')');
    say(pageTier === leftOut, at + ' two rounds left alone in a row do not lower the tier: the page\'s tier is adaptTier on the rounds a child answered (' + pageTier + ', Node ' + leftOut + ')');
  }
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
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', { key: 'Tab', until: '#more' }, 'Enter'], () => window.CREASE.results.length > 0);
  const res = await page.evaluate(() => window.CREASE.results[0] || null);
  say(kb.ok && !!res && res.choice === 'more', '1366x768 keyboard Tab to more and Enter chooses it (' + kb.detail + ', ' + JSON.stringify(res && res.choice) + ')');
  await page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 });
  await sleep(120);
  const focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  const moved = await page.waitForFunction(() => window.CREASE.round() === 1, { timeout: 5000 }).then(() => true, () => false);
  say(focus === 'next' && moved, '1366x768 keyboard next has focus after the reveal and Enter moves on (' + focus + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' HALFWAY FAILURE(S)'); process.exit(1); }
console.log('HALFWAY OK');
