#!/usr/bin/env node
/* TINT's FILL THE VAT, played by real taps and keys against the engine replayed in Node (plans/tint/HANDOFF-TINT.md P2; 3.9, T1,
 * T5, T6).
 *
 *   node test/fill.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every order is dealFill's for the seed, and its words say what it is: a scaled order asks how much white for its dye; a
 *      rinse says the small vat's rinse and the bigger vat's dye
 *   2. 3.9: the ratio table is there before any answer with the recipe as its first row; each add a row appends the next whole
 *      multiple of the recipe; many rows scroll inside the table and the page does not grow past the screen
 *   3. the stepper moves the white in halves and never under nothing
 *   4. T5: a scaled order answered right pours two cloths exactly the same mixLinear colour and the paint says they match; answered
 *      wrong, two different colours and the paint says they do not
 *   5. a rinse answered with the small vat's rinse is right, and the page says a rinse does not grow with the vat
 *   6. every result is scoreFill's; with Sound on, one pour a round and no other sound
 *   7. 1366x768 by keys: focus comes to more white, Enter adds white, Tab reaches pour, Enter pours, focus moves to go on
 *   8. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealFill, scoreFill } from '../engine.js';
import { mixLinear, DYES } from '../colour.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.TINT && window.TINT.ready';
const SEED = 4242;
const deal = dealFill(rng(SEED >>> 0), { stage: 1, seen: new Set() }).tasks;
const firstRinse = deal.findIndex(t => t.kind === 'rinse'), ROUNDS = Math.max(4, firstRinse + 1);
const parts = n => (n % 1 === 0.5 ? Math.floor(n) + ' and a half' : String(n));
const done = page => page.waitForFunction(() => window.TINT.fillDone(), { timeout: 20000, polling: 'raf' });
const setWhiteByTaps = async (page, target) => {
  for (let k = 0; k < Math.round(target / 0.5); k++) await tap(page, '#white-more');
};

/* 1 to 6 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/tint/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.TINT.audio.clear());
  await tap(page, '#start-fill');
  await sleep(200);
  const seam = [], words = [], table = [], stepper = [], paint = [], rinse = [], scored = [];
  for (let i = 0; i < ROUNDS; i++) {
    const want = deal[i], got = await page.evaluate(() => window.TINT.fillTask());
    if (JSON.stringify(got) !== JSON.stringify(want)) seam.push(i + ': page ' + JSON.stringify(got) + ' Node ' + JSON.stringify(want));
    const order = await page.evaluate(() => document.getElementById('order').textContent);
    if (want.kind === 'rinse' ? !(order.indexOf('rinsed with ' + parts(want.fixed)) >= 0 && order.indexOf('takes ' + parts(want.dye)) >= 0) : !(order.indexOf('takes ' + parts(want.dye) + ' dye') >= 0 && /How much white/.test(order))) words.push(i + ' ' + want.kind + ' says ' + JSON.stringify(order));
    if (i === 0) {
      const before = await page.evaluate(() => Array.from(document.querySelectorAll('#table-body tr')).map(tr => Array.from(tr.children).map(td => td.textContent)));
      if (JSON.stringify(before) !== JSON.stringify([[parts(want.recipe[0]), parts(want.recipe[1])]])) table.push('first row ' + JSON.stringify(before));
      for (let k = 0; k < 9; k++) await tap(page, '#add-row');
      const after = await page.evaluate(() => ({ rows: Array.from(document.querySelectorAll('#table-body tr')).map(tr => Array.from(tr.children).map(td => td.textContent)), scrolls: (() => { const s = document.getElementById('table-scroll'); return s.scrollHeight > s.clientHeight; })(), page: document.documentElement.scrollHeight - innerHeight }));
      const wantRows = Array.from({ length: 10 }, (_, k) => [parts(want.recipe[0] * (k + 1)), parts(want.recipe[1] * (k + 1))]);
      if (JSON.stringify(after.rows) !== JSON.stringify(wantRows) || !after.scrolls) table.push('after nine adds ' + JSON.stringify(after));
      await tap(page, '#white-less');
      const floor = await page.evaluate(() => window.TINT.white());
      await tap(page, '#white-more'); await tap(page, '#white-more'); await tap(page, '#white-more');
      const three = await page.evaluate(() => window.TINT.white());
      await tap(page, '#white-less'); await tap(page, '#white-less'); await tap(page, '#white-less');
      if (floor !== 0 || three !== 1.5) stepper.push(JSON.stringify({ floor, three }));
    }
    /* right on even rounds, a half jug too much on odd */
    const right = i % 2 === 0 || want.kind === 'rinse';
    const target = right ? want.answer : want.answer + 0.5;
    await setWhiteByTaps(page, target);
    await tap(page, '#fill-pour');
    await done(page);
    await sleep(60);
    const res = (await page.evaluate(() => window.TINT.results))[i];
    if (res.choice !== target || res.correct !== scoreFill(want, target).correct) scored.push(i + ' ' + JSON.stringify(res));
    const truth = await page.evaluate(() => document.getElementById('fill-truth').textContent);
    if (want.kind === 'rinse') {
      if (!res.correct || truth.indexOf('does not grow') < 0 || truth.indexOf(parts(want.fixed)) < 0) rinse.push(i + ' ' + JSON.stringify({ correct: res.correct, truth }));
    } else {
      const colours = await page.evaluate(() => window.TINT.fillColours());
      const dye = DYES[want.dyeName], mine = mixLinear(dye, want.dye, target).hex, recipe = mixLinear(dye, want.recipe[0], want.recipe[1]).hex;
      const pixels = await page.evaluate(() => ['cloth-mine', 'cloth-recipe'].map(id => { const c = document.getElementById(id), d = c.getContext('2d').getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data; return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); }));
      const says = truth.indexOf(right ? 'It matches the recipe' : 'It does not match the recipe') >= 0;
      if (pixels[0] !== mine || pixels[1] !== recipe || (pixels[0] === pixels[1]) !== right || !says || colours.mine !== mine) paint.push(i + ' ' + JSON.stringify({ pixels, mine, recipe, right, truth }));
    }
    await tap(page, '#next');
    await sleep(120);
  }
  const sounds = await page.evaluate(() => window.TINT.audio.sounded());
  say(seam.length === 0, '375x667 every order is dealFill\'s for the seed' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(words.length === 0 && firstRinse >= 0, '375x667 each order says what it is, a scaled order or a rinse (the first rinse is round ' + firstRinse + ')' + (words.length ? ': ' + words.join('; ') : ''));
  say(table.length === 0, '375x667 3.9: the ratio table starts at the recipe, each add a row appends the next multiple, and ten rows scroll inside it' + (table.length ? ': ' + table.join('; ') : ''));
  say(stepper.length === 0, '375x667 the stepper moves the white in halves and never under nothing' + (stepper.length ? ': ' + stepper.join('; ') : ''));
  say(paint.length === 0, '375x667 T5: a scaled order pours both cloths in mixLinear\'s exact colours, one colour and a match when right, two and no match when wrong' + (paint.length ? ': ' + paint.slice(0, 2).join('; ') : ''));
  say(rinse.length === 0, '375x667 a rinse answered with the small vat\'s rinse is right, and a rinse does not grow with the vat' + (rinse.length ? ': ' + rinse.join('; ') : ''));
  say(scored.length === 0 && sounds.length === ROUNDS && sounds.every(x => x === 'pour'), '375x667 every result is scoreFill\'s, one pour a round and no other sound (' + JSON.stringify(sounds) + ')' + (scored.length ? ': ' + scored.join('; ') : ''));
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 7 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/tint/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start-fill').focus());
  await page.keyboard.press('Enter');
  await sleep(200);
  const f0 = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  const white = await page.evaluate(() => window.TINT.white());
  await page.keyboard.press('Tab');
  const f1 = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await done(page);
  const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(f0 === 'white-more' && white === 0.5 && f1 === 'fill-pour' && onNext === 'next', '1366x768 by keys: focus on more white, Enter adds a half, Tab reaches pour, Enter pours, focus to go on (' + JSON.stringify({ f0, white, f1, onNext }) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' FILL FAILURE(S)'); process.exit(1); }
console.log('FILL OK');
