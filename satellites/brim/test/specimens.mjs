#!/usr/bin/env node
/* BRIM's bottles (plans/brim/HANDOFF-BRIM.md 3.9 and P3; the shape of satellites/crease/test/specimens.mjs): one bottle a run
 * through CORE's collectOnce, twenty four at most, cosmetic, never a count shown.
 *
 *   node test/specimens.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768 with less motion; the store is the page's own, never written by the gate.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the shelf does not open before the run's last round, and opens on the next after it, holding one bottle
 *   2. go closes it onto a live round; the next run's end holds two, the second another shape in another glass
 *   3. a reload in the middle of a run earns nothing: the run after it ends with three
 *   4. earning changes nothing a child plays for: the results the page keeps grow by the round played
 *   5. the shelf shows no digit and no number in any label
 *   6. twenty six runs hold twenty four bottles, every one a different shape and glass
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.BRIM && window.BRIM.ready';
const PAGE = { path: '/brim/index.html?seed=4242&mode=matching&count=12&', ready: READY };
const RUN = 12;

const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
const { browser, page, errors } = opened;
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const shelfNow = () => page.evaluate(() => ({ shown: window.BRIM.shelf.shown(), cells: window.BRIM.shelf.cells() }));
/* one round by keys: the left glass chosen, the reveal, next */
const roundByKeys = async () => {
  await page.evaluate(() => document.getElementById('left').focus());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 });
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await sleep(40);
};
const closeShelf = async () => { await page.evaluate(() => document.getElementById('shelf-go').focus()); await page.keyboard.press('Enter'); await sleep(80); };
const start = async () => { await page.evaluate(() => document.getElementById('start').focus()); await page.keyboard.press('Enter'); await sleep(150); };

await start();
for (let i = 0; i < RUN - 1; i++) await roundByKeys();
const early = await shelfNow();
const before = await page.evaluate(() => window.BRIM.results.length);
await roundByKeys();
await sleep(150);
const first = await shelfNow();
say(!early.shown && first.shown && first.cells.length === 1, 'the shelf is shut after eleven rounds of twelve and opens on the next after the twelfth, holding one bottle (' + JSON.stringify({ early: early.shown, shown: first.shown, cells: first.cells.length }) + ')');
const after = await page.evaluate(() => window.BRIM.results.length);
say(after === before + 1, 'earning changes nothing a child plays for: the results grew by the round played (' + before + ' to ' + after + ')');
const words = await page.evaluate(() => {
  const sh = document.getElementById('shelf');
  return (sh.innerText || '') + ' ' + Array.from(sh.querySelectorAll('*')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).join(' ');
});
say(!/\d/.test(words), 'the shelf shows no digit and no number in any label (' + JSON.stringify(words.trim()) + ')');

await closeShelf();
const live = await page.evaluate(() => ({ shelf: window.BRIM.shelf.shown(), next: getComputedStyle(document.getElementById('next')).visibility, revealDone: window.BRIM.revealDone() }));
say(!live.shelf && live.next === 'hidden' && !live.revealDone, 'go closes the shelf onto a live round (' + JSON.stringify(live) + ')');
for (let i = 0; i < RUN; i++) await roundByKeys();
await sleep(150);
const second = await shelfNow();
say(second.shown && second.cells.length === 2 && second.cells[1].shape !== second.cells[0].shape && second.cells[1].glass !== second.cells[0].glass,
  'the next run\'s end holds two, the second another shape in another glass (' + JSON.stringify(second.cells) + ')');
await closeShelf();

for (let i = 0; i < 5; i++) await roundByKeys();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(READY, { timeout: 30000 });
await start();
/* ⛔ CREASE's plant sp5: looking only after a whole run cannot tell an early bottle from the right one; the shelf must still
   be shut one round short of the run */
for (let i = 0; i < RUN - 1; i++) await roundByKeys();
const short = await shelfNow();
await roundByKeys();
await sleep(150);
const third = await shelfNow();
say(!short.shown && third.shown && third.cells.length === 3, 'a reload in the middle of a run earns nothing: after it the shelf is shut one round short of the run and opens after it with three (' + JSON.stringify({ short: short.shown, shown: third.shown, cells: third.cells.length }) + ')');
await closeShelf();

for (let run = 3; run < 25; run++) {
  for (let i = 0; i < RUN; i++) await roundByKeys();
  await sleep(80);
  await closeShelf();
}
for (let i = 0; i < RUN; i++) await roundByKeys();
await sleep(150);
const full = await shelfNow();
const pairs = new Set(full.cells.map(c => c.shape + '/' + c.glass));
/* ⛔ CREASE's plant sp3: counting drawn cells cannot see a store past twenty four; the law reads what the store holds too */
const held = await page.evaluate(() => window.BRIM.shelf.held());
say(full.shown && held === 24 && full.cells.length === 24 && pairs.size === 24, 'twenty six runs hold twenty four bottles, every one a different shape and glass (' + held + ' held, ' + full.cells.length + ' drawn, ' + pairs.size + ' different)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPECIMENS FAILURE(S)'); process.exit(1); }
console.log('SPECIMENS OK');
