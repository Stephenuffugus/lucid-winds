#!/usr/bin/env node
/* TINT's SAME COLOUR, played by real taps and keys against the engine replayed in Node (plans/tint/HANDOFF-TINT.md P1; T5, T8,
 * the reveal contract).
 *
 *   node test/compare.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every round is dealCompare's for the seed: both recipes, the dye, the representation, the answer
 *   2. T8: beside each vat its jug counts are written, the recipe's dye parts and white parts
 *   3. T5: after the pour both cloths are dyed exactly the colour mixLinear gives their recipes, read off the screen's own pixels
 *      at each cloth's centre, and the two cloths are one colour exactly when the answer is the same
 *   4. the reveal contract: the child's choice stays marked through the pour; the paint's words are empty while it pours and name
 *      the true answer once both cloths are dyed, on a right round and a wrong round alike
 *   5. each round's result is scoreCompare's for the choice; with Sound on, one pour a round and no other sound
 *   6. 1366x768 by keys: focus comes to the same colour, Enter answers, focus moves to go on, Enter deals the next round
 *   7. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealCompare, scoreCompare } from '../engine.js';
import { mixLinear, DYES } from '../colour.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.TINT && window.TINT.ready';
const SEED = 4242, ROUNDS = 6;
const deal = dealCompare(rng(SEED >>> 0), { stage: 1, seen: new Set() }).tasks;
const partsText = n => (n % 1 === 0.5 ? Math.floor(n) + ' and a half' : String(n));
const poured = page => page.waitForFunction(() => window.TINT.pourDone(), { timeout: 30000, polling: 'raf' });
const pixelAt = (page, [x, y]) => page.evaluate(([x, y]) => {
  const c = document.elementFromPoint(x, y);
  if (!c || c.tagName !== 'CANVAS') return null;
  const b = c.getBoundingClientRect(), k = c.width / b.width, d = c.getContext('2d').getImageData(Math.round((x - b.left) * k), Math.round((y - b.top) * k), 1, 1).data;
  return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
}, [x, y]);

/* 1 to 5 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/tint/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.TINT.audio.clear());
  await tap(page, '#start');
  await sleep(150);
  const seam = [], jugsBad = [], paintBad = [], contract = [], scored = [];
  for (let i = 0; i < ROUNDS; i++) {
    const want = deal[i], got = await page.evaluate(() => window.TINT.task());
    if (JSON.stringify(got) !== JSON.stringify(want)) seam.push(i + ': page ' + JSON.stringify(got) + ' Node ' + JSON.stringify(want));
    const jugs = await page.evaluate(() => [document.getElementById('jugs-left').textContent, document.getElementById('jugs-right').textContent]);
    for (const [k, side] of [[0, 'left'], [1, 'right']]) {
      const [d, w] = want[side], text = jugs[k];
      if (text.indexOf(partsText(d)) !== 0 || text.indexOf(partsText(w), partsText(d).length) < 0) jugsBad.push(i + ' ' + side + ' writes ' + JSON.stringify(text) + ' for ' + d + ' and ' + w);
    }
    /* right on even rounds, wrong on odd */
    const choice = i % 2 === 0 ? want.answer : (want.answer === 'same' ? 'different' : 'same');
    await tap(page, '#' + choice);
    const during = await page.evaluate(c => ({ pressed: document.getElementById(c).getAttribute('aria-pressed'), truth: document.getElementById('truth').textContent, done: window.TINT.pourDone() }), choice);
    await poured(page);
    await sleep(60);
    const after = await page.evaluate(c => ({ pressed: document.getElementById(c).getAttribute('aria-pressed'), truth: document.getElementById('truth').textContent }), choice);
    const truthWord = want.answer === 'same' ? 'The same colour' : 'A different colour';
    if (during.done || during.truth !== '' || during.pressed !== 'true' || after.pressed !== 'true' || after.truth.indexOf(truthWord) < 0) contract.push(i + ' ' + JSON.stringify({ during, after }));
    const colours = {};
    for (const side of ['left', 'right']) {
      const point = await page.evaluate(sd => window.TINT.clothPoint(sd), side);
      const seen = await pixelAt(page, point), wantHex = mixLinear(DYES[want.dye], want[side][0], want[side][1]).hex;
      colours[side] = seen;
      if (seen !== wantHex) paintBad.push(i + ' ' + side + ' cloth ' + seen + ' for ' + wantHex);
    }
    if ((colours.left === colours.right) !== (want.answer === 'same')) paintBad.push(i + ' cloths ' + colours.left + ' and ' + colours.right + ' for ' + want.answer);
    const res = (await page.evaluate(() => window.TINT.results))[i];
    if (res.choice !== choice || res.correct !== scoreCompare(want, choice).correct) scored.push(i + ' ' + JSON.stringify(res));
    await tap(page, '#next');
    await sleep(100);
  }
  const sounds = await page.evaluate(() => window.TINT.audio.sounded());
  say(seam.length === 0, '375x667 every round is dealCompare\'s for the seed' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(jugsBad.length === 0, '375x667 T8: beside each vat its jug counts are written, dye parts and white parts' + (jugsBad.length ? ': ' + jugsBad.slice(0, 3).join('; ') : ''));
  say(paintBad.length === 0, '375x667 T5: both cloths are dyed exactly mixLinear\'s colour, read off the screen, one colour exactly when the answer is the same' + (paintBad.length ? ': ' + paintBad.slice(0, 3).join('; ') : ''));
  say(contract.length === 0, '375x667 the choice stays marked through the pour; the paint\'s words come only after both cloths are dyed, right or wrong' + (contract.length ? ': ' + contract.slice(0, 2).join('; ') : ''));
  say(scored.length === 0 && sounds.length === ROUNDS && sounds.every(x => x === 'pour'), '375x667 every result is scoreCompare\'s, and with Sound on one pour a round and no other sound (' + JSON.stringify(sounds) + ')' + (scored.length ? ': ' + scored.join('; ') : ''));
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/tint/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const f0 = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await poured(page);
  const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await sleep(150);
  const second = await page.evaluate(() => ({ task: window.TINT.task(), focus: document.activeElement && document.activeElement.id, results: window.TINT.results.length }));
  say(f0 === 'same' && onNext === 'next' && second.focus === 'same' && second.results === 1 && JSON.stringify(second.task) === JSON.stringify(deal[1]), '1366x768 by keys: focus on the same colour, Enter answers, focus to go on, Enter deals the next round (' + JSON.stringify({ f0, onNext, focus: second.focus, results: second.results }) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' COMPARE FAILURE(S)'); process.exit(1); }
console.log('COMPARE OK');
