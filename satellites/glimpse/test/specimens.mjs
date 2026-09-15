#!/usr/bin/env node
/* GLIMPSE's field journal (plans/glimpse/HANDOFF-GLIMPSE.md 3.10 and P3; the shape of the catalog's earlier specimens gates):
 * one sketched page a run through CORE's collectOnce, twenty four at most, cosmetic, never a count shown.
 *
 *   node test/specimens.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768 with less motion; the store is the page's own, never written by the gate.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the journal does not open before the run's last round, and opens on the next after it, holding one page
 *   2. go closes it onto the next round, whose flash had waited for it; the next run's end holds two, another sketch in
 *      another ink
 *   3. a reload in the middle of a run earns nothing: after it the journal is shut one round short of the run and opens after
 *      it with three
 *   4. the journal shows no digit and no number in any label
 *   5. twenty six runs hold twenty four pages, every one a different sketch and ink, what the store holds and what is drawn
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const PAGE = { path: '/glimpse/index.html?seed=4242&mode=flash&count=12&', ready: READY };
const RUN = 12;

const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
const { browser, page, errors } = opened;
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const journalNow = () => page.evaluate(() => ({ shown: window.GLIMPSE.shelf.shown(), cells: window.GLIMPSE.shelf.cells(), held: window.GLIMPSE.shelf.held() }));
/* one round by keys: the pads wake with focus on the first, Enter answers, focus goes to next, Enter moves on */
const roundByKeys = async () => {
  await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 });
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await sleep(40);
};
const closeJournal = async () => { await page.evaluate(() => document.getElementById('shelf-go').focus()); await page.keyboard.press('Enter'); await sleep(80); };
const start = async () => { await page.evaluate(() => document.getElementById('start').focus()); await page.keyboard.press('Enter'); await sleep(150); };

await start();
/* ⛔ plant sp1 (a page every round) timed out here: a journal open early leaves the next round waiting under it, so the loop
   stops the moment the journal opens and the law below says so */
for (let i = 0; i < RUN - 1; i++) { if ((await journalNow()).shown) break; await roundByKeys(); }
const early = await journalNow();
await roundByKeys();
await sleep(150);
const first = await journalNow();
say(!early.shown && first.shown && first.cells.length === 1, 'the journal is shut after eleven rounds of twelve and opens on the next after the twelfth, holding one page (' + JSON.stringify({ early: early.shown, shown: first.shown, cells: first.cells.length }) + ')');
const words = await page.evaluate(() => { const sh = document.getElementById('shelf'); return (sh.innerText || '') + ' ' + Array.from(sh.querySelectorAll('*')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).join(' '); });
say(!/\d/.test(words), 'the journal shows no digit and no number in any label (' + JSON.stringify(words.trim()) + ')');
const waited = await page.evaluate(() => window.GLIMPSE.phase());
await closeJournal();
const woke = await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 }).then(() => true, () => false);
say(waited === 'waiting' && woke, 'while the journal is open the next round waits, and after go its flash comes (' + JSON.stringify({ waited, woke }) + ')');
for (let i = 0; i < RUN; i++) await roundByKeys();
await sleep(150);
const second = await journalNow();
say(second.shown && second.cells.length === 2 && second.cells[1].shape !== second.cells[0].shape && second.cells[1].ink !== second.cells[0].ink, 'the next run\'s end holds two, the second another sketch in another ink (' + JSON.stringify(second.cells) + ')');
await closeJournal();

for (let i = 0; i < 5; i++) await roundByKeys();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(READY, { timeout: 30000 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await start();
for (let i = 0; i < RUN - 1; i++) await roundByKeys();
const short = await journalNow();
await roundByKeys();
await sleep(150);
const third = await journalNow();
say(!short.shown && third.shown && third.cells.length === 3, 'a reload in the middle of a run earns nothing: the journal is shut one round short and opens after it with three (' + JSON.stringify({ short: short.shown, shown: third.shown, cells: third.cells.length }) + ')');
await closeJournal();

for (let run = 3; run < 25; run++) {
  for (let i = 0; i < RUN; i++) await roundByKeys();
  await sleep(80);
  await closeJournal();
}
for (let i = 0; i < RUN; i++) await roundByKeys();
await sleep(150);
const full = await journalNow();
const kinds = new Set(full.cells.map(c => c.shape + '/' + c.ink));
say(full.shown && full.held === 24 && full.cells.length === 24 && kinds.size === 24, 'twenty six runs hold twenty four pages, every one a different sketch and ink (' + full.held + ' held, ' + full.cells.length + ' drawn, ' + kinds.size + ' different)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPECIMENS FAILURE(S)'); process.exit(1); }
console.log('SPECIMENS OK');
