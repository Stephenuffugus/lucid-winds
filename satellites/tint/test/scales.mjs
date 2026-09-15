#!/usr/bin/env node
/* TINT's DOES IT SCALE, played by real taps against the engine replayed in Node (plans/tint/HANDOFF-TINT.md P2 and 3.8; T1, T2).
 *
 *   node test/scales.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every item is dealScales's for the seed, and a session of ten holds exactly four that scale (T2)
 *   2. the situation shown is the item's own words
 *   3. the demonstration lands on the answer: its model counts to the item's actual answer (things under one clock finish at the
 *      single time; the heat's fixed part plus a part a jug; the big square's tiles; rows times their count; the gap's second mark),
 *      and the demonstration canvas is drawn (not blank) once it is over
 *   4. the reveal contract: the choice stays marked, the answer and why are written only once the demonstration is over, on a right
 *      and a wrong round alike
 *   5. every result is scoreScales's; with Sound on, one knock a round and no other sound
 *   6. with less motion the demonstration is over within 150 ms
 *   7. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealScales, scoreScales } from '../engine.js';
import { SITUATIONS } from '../content.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.TINT && window.TINT.ready';
const SEED = 4242;
const deal = dealScales(rng(SEED >>> 0));
const landsOn = m => (m.kind === 'clock' ? m.total : m.kind === 'affine' ? m.fixed + m.per * m.jugs : m.kind === 'tiles' ? m.big * m.big : m.kind === 'rows' ? m.rows * m.per : m.kind === 'gap' ? m.to[0] : null);
const demoDone = page => page.waitForFunction(() => window.TINT.demoDone(), { timeout: 20000, polling: 'raf' });

/* 1 to 5 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/tint/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.TINT.audio.clear());
  await tap(page, '#start-scales');
  await sleep(200);
  const seam = [], words = [], lands = [], contract = [], scored = [];
  for (let i = 0; i < deal.length; i++) {
    const want = deal[i], got = await page.evaluate(() => window.TINT.scalesTask());
    if (JSON.stringify(got) !== JSON.stringify(want)) seam.push(i + ': page ' + JSON.stringify(got) + ' Node ' + JSON.stringify(want));
    const shown = await page.evaluate(() => document.getElementById('situation').textContent);
    if (shown !== SITUATIONS[want.id].ask) words.push(i + ' ' + want.id + ' shows ' + JSON.stringify(shown));
    const rightChoice = want.isProportional ? 'scales' : 'not';
    const choice = i % 2 === 0 ? rightChoice : (rightChoice === 'scales' ? 'not' : 'scales');
    const button = choice === 'scales' ? '#scales-yes' : '#scales-no';
    await tap(page, button);
    const during = await page.evaluate(b => ({ pressed: document.querySelector(b).getAttribute('aria-pressed'), truth: document.getElementById('scales-truth').textContent, done: window.TINT.demoDone() }), button);
    await demoDone(page);
    await sleep(60);
    const after = await page.evaluate(b => ({ pressed: document.querySelector(b).getAttribute('aria-pressed'), truth: document.getElementById('scales-truth').textContent }), button);
    if (during.done || during.truth !== '' || during.pressed !== 'true' || after.pressed !== 'true' || after.truth.indexOf(String(want.actual)) < 0 || after.truth.indexOf(SITUATIONS[want.id].why) < 0) contract.push(i + ' ' + JSON.stringify({ during, after }));
    const model = await page.evaluate(() => window.TINT.demoModel());
    const drawn = await page.evaluate(() => { const c = document.getElementById('demo'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let k = 0; k < d.length; k += 4 * 13) if (!(d[k] === 0xf6 && d[k + 1] === 0xef && d[k + 2] === 0xe3)) n++; return n; });
    if (!model || landsOn(model) !== want.actual || drawn < 20) lands.push(i + ' ' + want.id + ' model ' + JSON.stringify(model) + ' lands on ' + (model && landsOn(model)) + ' for ' + want.actual + ', ' + drawn + ' drawn samples');
    const res = (await page.evaluate(() => window.TINT.results))[i];
    if (res.choice !== choice || res.correct !== scoreScales(want, choice).correct) scored.push(i + ' ' + JSON.stringify(res));
    await tap(page, '#next');
    await sleep(100);
  }
  const sounds = await page.evaluate(() => window.TINT.audio.sounded());
  say(seam.length === 0 && deal.filter(t => t.isProportional).length === 4, '375x667 every item is dealScales\'s for the seed, four of ten that scale' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(words.length === 0, '375x667 each situation shows its own words' + (words.length ? ': ' + words.join('; ') : ''));
  say(lands.length === 0, '375x667 3.8: every demonstration counts to the item\'s actual answer and is drawn once it is over' + (lands.length ? ': ' + lands.slice(0, 3).join('; ') : ''));
  say(contract.length === 0, '375x667 the choice stays marked, and the answer and why come only once the demonstration is over, right or wrong' + (contract.length ? ': ' + contract.slice(0, 2).join('; ') : ''));
  say(scored.length === 0 && sounds.length === deal.length && sounds.every(x => x === 'knock'), '375x667 every result is scoreScales\'s, one knock a round and no other sound (' + JSON.stringify(sounds) + ')' + (scored.length ? ': ' + scored.join('; ') : ''));
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/tint/index.html?seed=' + SEED + '&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start-scales');
  await sleep(200);
  const t0 = Date.now();
  await tap(page, '#scales-no');
  const ms = await demoDone(page).then(() => Date.now() - t0, () => null);
  say(ms !== null && ms <= 150, '375x667 with less motion the demonstration is over within 150 ms (' + ms + ' ms)');
  say(errors.length === 0, 'less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SCALES FAILURE(S)'); process.exit(1); }
console.log('SCALES OK');
