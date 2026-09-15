#!/usr/bin/env node
/* CREASE's specimens (plans/crease/HANDOFF-CREASE.md 3.9 and P3): one folded paper specimen a run through CORE's collectOnce,
 * twenty four at most, cosmetic, never a count shown.
 *
 *   node test/specimens.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768 with less motion, so twenty five runs fit a gate's time; the store is the page's own, never
 * written by the gate.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the shelf does not open before the run's last round, and opens on the next after it, holding one specimen
 *   2. go closes it onto a live round; the next run's end holds two, the second another shape on another paper
 *   3. a reload in the middle of a run earns nothing: the run after it ends with three, not four
 *   4. earning changes nothing a child plays for: the tier and the results the page keeps are the same either side of it
 *   5. the shelf shows no digit and no number in any label
 *   6. twenty five runs hold twenty four specimens, every one a different shape and paper pair
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.CREASE && window.CREASE.ready';
const PAGE = { path: '/crease/index.html?seed=4242&mode=freehand&count=10&', ready: READY };

const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
const { browser, page, errors } = opened;
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const shelfNow = () => page.evaluate(() => ({ shown: window.CREASE.shelf.shown(), cells: window.CREASE.shelf.cells() }));
/* one round by keys: the clip down where it stands, the reveal, next */
const roundByKeys = async () => {
  await page.evaluate(() => document.querySelector('#strip .lw-stone').focus());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 });
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await sleep(40);
};
const closeShelf = async () => { await page.evaluate(() => document.getElementById('shelf-go').focus()); await page.keyboard.press('Enter'); await sleep(80); };
const start = async () => { await page.evaluate(() => document.getElementById('start').focus()); await page.keyboard.press('Enter'); await sleep(150); };

await start();
/* 1 */
for (let i = 0; i < 9; i++) await roundByKeys();
const early = await shelfNow();
const before = await page.evaluate(() => ({ tier: window.CREASE.tier(), n: window.CREASE.results.length }));
await roundByKeys();
await sleep(150);
const first = await shelfNow();
say(!early.shown && first.shown && first.cells.length === 1, 'the shelf is shut after nine rounds of ten and opens on the next after the tenth, holding one specimen (' + JSON.stringify({ early: early.shown, shown: first.shown, cells: first.cells.length }) + ')');
/* 4 */
const after = await page.evaluate(() => ({ tier: window.CREASE.tier(), n: window.CREASE.results.length }));
say(after.n === before.n + 1 && after.tier === (await page.evaluate(() => window.CREASE.tier())), 'earning changes nothing a child plays for: the results grew by the round played and the tier is the page\'s own (' + JSON.stringify([before, after]) + ')');
/* 5 */
const words = await page.evaluate(() => {
  const sh = document.getElementById('shelf');
  const text = sh.innerText || '';
  const labels = Array.from(sh.querySelectorAll('*')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).join(' ');
  return text + ' ' + labels;
});
say(!/\d/.test(words), 'the shelf shows no digit and no number in any label (' + JSON.stringify(words.trim()) + ')');

/* 2 */
await closeShelf();
const live = await page.evaluate(() => ({ shelf: window.CREASE.shelf.shown(), next: getComputedStyle(document.getElementById('next')).visibility, revealDone: window.CREASE.revealDone() }));
say(!live.shelf && live.next === 'hidden' && !live.revealDone, 'go closes the shelf onto a live round (' + JSON.stringify(live) + ')');
for (let i = 0; i < 10; i++) await roundByKeys();
await sleep(150);
const second = await shelfNow();
say(second.shown && second.cells.length === 2 && second.cells[1].shape !== second.cells[0].shape && second.cells[1].paper !== second.cells[0].paper,
  'the next run\'s end holds two, the second another shape on another paper (' + JSON.stringify(second.cells) + ')');
await closeShelf();

/* 3 */
for (let i = 0; i < 5; i++) await roundByKeys();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(READY, { timeout: 30000 });
await start();
for (let i = 0; i < 10; i++) await roundByKeys();
await sleep(150);
const third = await shelfNow();
say(third.shown && third.cells.length === 3, 'a reload in the middle of a run earns nothing: the run after it ends with three (' + third.cells.length + ')');
await closeShelf();

/* 6 */
for (let run = 3; run < 25; run++) {
  for (let i = 0; i < 10; i++) await roundByKeys();
  await sleep(80);
  await closeShelf();
}
for (let i = 0; i < 10; i++) await roundByKeys();
await sleep(150);
const full = await shelfNow();
const pairs = new Set(full.cells.map(c => c.shape + '/' + c.paper));
say(full.shown && full.cells.length === 24 && pairs.size === 24, 'twenty six runs hold twenty four specimens, every one a different shape and paper pair (' + full.cells.length + ' held, ' + pairs.size + ' different)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPECIMENS FAILURE(S)'); process.exit(1); }
console.log('SPECIMENS OK');
