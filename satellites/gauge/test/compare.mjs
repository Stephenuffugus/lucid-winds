#!/usr/bin/env node
/* GAUGE's WHICH IS MORE, played by real taps and keys against the engine replayed in Node (plans/gauge/HANDOFF-GAUGE.md P1; GA1,
 * GA3, the reveal contract).
 *
 *   node test/compare.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every round is generateComparisonSet's for the seed, the first 0.7 vs 0.2, and the cards show the decimals exactly as dealt,
 *      in tabular lining figures
 *   2. GA3: the same is on every round, a 56 px target, and so are both cards
 *   3. the reveal contract: the choice stays marked; the one that is more (both, and the same, when they are equal) is lit only after
 *      the answer, on right and wrong rounds alike
 *   4. every result's truth is Node's, and the code the page holds after the run is classifyRun's on the same answers
 *   5. with Sound on, one detent a round and no other sound
 *   6. 1366x768 by keys: focus comes to the left card, Enter answers, focus moves to go on, Enter deals the next round
 *   7. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, centre, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { generateComparisonSet, classifyRun, predict } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const SEED = 4242;
const set = generateComparisonSet(rng(SEED >>> 0));
const revealed = page => page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 20000, polling: 'raf' });

/* 1 to 5 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.GAUGE.audio.clear());
  await tap(page, '#start');
  await sleep(150);
  const seam = [], targets = [], contract = [], truths = [], answers = [];
  for (let i = 0; i < set.length; i++) {
    const want = set[i];
    const shown = await page.evaluate(() => ({ left: document.getElementById('left').textContent, right: document.getElementById('right').textContent, figures: getComputedStyle(document.getElementById('left')).fontVariantNumeric }));
    if (shown.left !== want.left || shown.right !== want.right || !/tabular-nums/.test(shown.figures)) seam.push(i + ' shows ' + JSON.stringify(shown) + ' for ' + want.left + ' vs ' + want.right);
    if (i < 3) for (const sel of ['#left', '#right', '#same']) { const c = await centre(page, sel); if (!c || c.w < 56 || c.h < 56 || !c.onTop) targets.push(i + ' ' + sel); }
    /* answer as the L rule would, so the run has a pattern to hear; the truth comes from Node */
    const answer = predict.L(want), truth = predict.truth(want);
    answers.push({ item: { left: want.left, right: want.right }, answer });
    const sel = '#' + answer;
    await tap(page, sel);
    const during = await page.evaluate(() => document.querySelectorAll('.is-more').length);
    await revealed(page);
    const after = await page.evaluate(sl => ({ pressed: document.querySelector(sl).getAttribute('aria-pressed'), lit: Array.from(document.querySelectorAll('.is-more')).map(e => e.id).sort() }), sel);
    const wantLit = truth === 'same' ? ['left', 'right', 'same'] : [truth];
    if (during !== 0 || after.pressed !== 'true' || JSON.stringify(after.lit) !== JSON.stringify(wantLit)) contract.push(i + ' ' + JSON.stringify({ during, after, wantLit }));
    const res = (await page.evaluate(() => window.GAUGE.results))[i];
    if (res.truth !== truth || res.answer !== answer || res.correct !== (answer === truth)) truths.push(i + ' ' + JSON.stringify(res));
    await tap(page, '#next');
    await sleep(80);
  }
  const code = await page.evaluate(() => window.GAUGE.code());
  const sounds = await page.evaluate(() => window.GAUGE.audio.sounded());
  say(seam.length === 0 && set[0].left === '0.7' && set[0].right === '0.2', '375x667 every round is Node\'s set for the seed and the cards show its decimals as dealt, in tabular figures' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(targets.length === 0, '375x667 GA3: both cards and the same are 56 px targets a thumb lands on' + (targets.length ? ': ' + targets.join(', ') : ''));
  say(contract.length === 0, '375x667 the choice stays marked and the larger is lit only after the answer, right or wrong' + (contract.length ? ': ' + contract.slice(0, 2).join('; ') : ''));
  say(truths.length === 0 && code === classifyRun(answers) && code === 'L', '375x667 every truth is Node\'s, and the page holds classifyRun\'s code for the run (' + code + ')' + (truths.length ? ': ' + truths.slice(0, 2).join('; ') : ''));
  say(sounds.length === set.length && sounds.every(x => x === 'detent'), '375x667 one detent a round and no other sound (' + sounds.length + ' for ' + set.length + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const f0 = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await revealed(page);
  const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await sleep(150);
  const second = await page.evaluate(() => ({ focus: document.activeElement && document.activeElement.id, item: window.GAUGE.item(), results: window.GAUGE.results.length }));
  say(f0 === 'left' && onNext === 'next' && second.focus === 'left' && second.results === 1 && second.item.left === set[1].left, '1366x768 by keys: focus on the left card, Enter answers, focus to go on, Enter deals the next round (' + JSON.stringify({ f0, onNext, focus: second.focus }) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' COMPARE FAILURE(S)'); process.exit(1); }
console.log('COMPARE OK');
