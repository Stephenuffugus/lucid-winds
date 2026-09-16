#!/usr/bin/env node
/* GAUGE's instrument case (plans/gauge/HANDOFF-GAUGE.md section 4; the shape of satellites/brim/test/specimens.mjs): one instrument
 * a run through CORE's collectOnce, twenty four at most, cosmetic, never a count shown, never a child's rule (GA7).
 *
 *   node test/specimens.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768 with less motion on SAME VALUE (a run of twelve); the store is the page's own, never written by the
 * gate.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the case does not open before the run's last round, and opens on the next after it, holding one instrument
 *   2. go closes it onto a live round; the next run's end holds two, the second another instrument in another metal
 *   3. a reload in the middle of a run earns nothing: the run after it ends with three
 *   4. earning changes nothing a child plays for: the results the page keeps grow by the round played
 *   5. the case shows no digit and no number in any label
 *   6. twenty six runs hold twenty four instruments, every one a different instrument and metal
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const PAGE = { path: '/gauge/index.html?seed=4242&mode=same&', ready: READY };
const RUN = 12;

const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
const { browser, page, errors } = opened;
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const caseNow = () => page.evaluate(() => ({ shown: window.GAUGE.instruments.shown(), cells: window.GAUGE.instruments.cells() }));
/* one round by keys: the same value chosen, the reveal, go on; nothing more once the case is open (CREASE's sp5) */
const roundByKeys = async () => {
  if (await page.evaluate(() => window.GAUGE.instruments.shown())) return;
  await page.evaluate(() => document.getElementById('same-yes').focus());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 30000 });
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await sleep(40);
};
const closeCase = async () => { await page.evaluate(() => document.getElementById('case-go').focus()); await page.keyboard.press('Enter'); await sleep(80); };
const start = async () => { await page.evaluate(() => document.getElementById('start-same').focus()); await page.keyboard.press('Enter'); await sleep(150); };

await start();
for (let i = 0; i < RUN - 1; i++) await roundByKeys();
const early = await caseNow();
const before = await page.evaluate(() => window.GAUGE.results.length);
await roundByKeys();
await sleep(150);
const first = await caseNow();
say(!early.shown && first.shown && first.cells.length === 1, 'the case is shut after eleven rounds of twelve and opens on the next after the twelfth, holding one instrument (' + JSON.stringify({ early: early.shown, shown: first.shown, cells: first.cells.length }) + ')');
const after = await page.evaluate(() => window.GAUGE.results.length);
say(after === before + 1, 'earning changes nothing a child plays for: the results grew by the round played (' + before + ' to ' + after + ')');
const words = await page.evaluate(() => {
  const c = document.getElementById('case');
  return (c.innerText || '') + ' ' + Array.from(c.querySelectorAll('*')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).join(' ');
});
say(!/\d/.test(words), 'the case shows no digit and no number in any label (' + JSON.stringify(words.trim()) + ')');

await closeCase();
const live = await page.evaluate(() => ({ shown: window.GAUGE.instruments.shown(), next: getComputedStyle(document.getElementById('next')).visibility, revealDone: window.GAUGE.revealDone(), inert: document.getElementById('play').inert }));
say(!live.shown && live.next === 'hidden' && !live.revealDone && !live.inert, 'go closes the case onto a live round (' + JSON.stringify(live) + ')');
for (let i = 0; i < RUN; i++) await roundByKeys();
await sleep(150);
const second = await caseNow();
say(second.shown && second.cells.length === 2 && second.cells[1].shape !== second.cells[0].shape && second.cells[1].metal !== second.cells[0].metal,
  'the next run\'s end holds two, the second another instrument in another metal (' + JSON.stringify(second.cells) + ')');
await closeCase();

for (let i = 0; i < 5; i++) await roundByKeys();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(READY, { timeout: 30000 });
await start();
/* ⛔ CREASE's plant sp5: the case must still be shut one round short of the run after a reload */
for (let i = 0; i < RUN - 1; i++) await roundByKeys();
const short = await caseNow();
await roundByKeys();
await sleep(150);
const third = await caseNow();
say(!short.shown && third.shown && third.cells.length === 3, 'a reload in the middle of a run earns nothing: after it the case is shut one round short of the run and opens after it with three (' + JSON.stringify({ short: short.shown, shown: third.shown, cells: third.cells.length }) + ')');
await closeCase();

for (let run = 3; run < 25; run++) {
  for (let i = 0; i < RUN; i++) await roundByKeys();
  await sleep(80);
  await closeCase();
}
for (let i = 0; i < RUN; i++) await roundByKeys();
await sleep(150);
const full = await caseNow();
const pairs = new Set(full.cells.map(c => c.shape + '/' + c.metal));
/* ⛔ CREASE's plant sp3: counting drawn cells cannot see a store past twenty four; the law reads what the store holds too */
const held = await page.evaluate(() => window.GAUGE.instruments.held());
say(full.shown && held === 24 && full.cells.length === 24 && pairs.size === 24, 'twenty six runs hold twenty four instruments, every one a different instrument and metal (' + held + ' held, ' + full.cells.length + ' drawn, ' + pairs.size + ' different)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPECIMENS FAILURE(S)'); process.exit(1); }
console.log('SPECIMENS OK');
