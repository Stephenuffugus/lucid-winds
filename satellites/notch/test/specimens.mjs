#!/usr/bin/env node
/* NOTCH's village (plans/notch/HANDOFF-NOTCH.md 3.13; CATALOG-PLAN D8; the shape of GLIMPSE's test/specimens.mjs): one carved
 * building a clean TURN session through CORE's collectOnce, twenty four at most, cosmetic, never a count.
 *
 *   node test/specimens.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768 with less motion; the store is the page's own, never written by the gate. Asserted, each watched to
 * fail on a planted fault:
 *   1. the village is shut through the session's twelfth round and opens after it, a clean session, with one building; the round
 *      under it is inert, and go returns to the bench
 *   2. the village shows no digit and no number in any label (N7)
 *   3. a session with three set aside wrongly (right pieces set aside) earns nothing
 *   4. a reload in the middle of a session earns nothing: after it the next clean session opens the village with two
 *   5. twenty six clean sessions hold twenty four buildings, every one a different building and ink, what the store holds and what
 *      is drawn
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { SESSION_LENGTH } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const PAGE = { path: '/notch/index.html?seed=4242&stage=one&', ready: READY };

const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
const { browser, page, errors } = opened;
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const villageNow = () => page.evaluate(() => ({ shown: window.NOTCH.shelf.shown(), cells: window.NOTCH.shelf.cells(), held: window.NOTCH.shelf.held() }));
const revealed = () => page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' });
/* one round by keys: arrows to the notch (a mirror, which stage one never deals, would be set aside), then go on */
async function roundByKeys({ wrong = false } = {}) {
  await page.evaluate(() => document.getElementById('bench').focus());
  if (wrong) await page.evaluate(() => document.getElementById('aside').click());
  else {
    let presses = 0;
    while ((await page.evaluate(() => window.NOTCH.phase())) === 'turn' && presses < 14) {
      const a = await page.evaluate(() => window.NOTCH.angle());
      await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
      presses++;
    }
  }
  await revealed();
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await sleep(40);
}
const close = async () => { await page.evaluate(() => document.getElementById('shelf-go').focus()); await page.keyboard.press('Enter'); await sleep(80); };

await page.evaluate(() => document.getElementById('start').focus());
await page.keyboard.press('Enter');
await sleep(150);
for (let i = 0; i < SESSION_LENGTH - 1; i++) { if ((await villageNow()).shown) break; await roundByKeys(); }
const early = await villageNow();
await roundByKeys();
await sleep(150);
const first = await villageNow();
const inert = await page.evaluate(() => document.getElementById('play').inert);
say(!early.shown && first.shown && first.cells.length === 1 && inert, 'the village is shut through eleven rounds and opens after the twelfth of a clean session with one building, the round inert under it (' + JSON.stringify({ early: early.shown, shown: first.shown, cells: first.cells.length, inert }) + ')');
const words = await page.evaluate(() => { const sh = document.getElementById('shelf'); return (sh.innerText || '') + ' ' + Array.from(sh.querySelectorAll('*')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).join(' '); });
say(!/\d/.test(words), 'the village shows no digit and no number in any label (' + JSON.stringify(words.trim()) + ')');
await close();
const back = await page.evaluate(() => ({ inert: document.getElementById('play').inert, phase: window.NOTCH.phase(), focus: document.activeElement && document.activeElement.id }));
say(!back.inert && back.phase === 'turn' && back.focus === 'bench', 'go returns to the bench, the round live again (' + JSON.stringify(back) + ')');

/* 3: a session with three right pieces set aside */
for (let i = 0; i < SESSION_LENGTH; i++) await roundByKeys({ wrong: i < 3 });
await sleep(150);
const messy = await villageNow();
say(!messy.shown && messy.held === 1, 'a session with three wrong earns nothing (' + JSON.stringify({ shown: messy.shown, held: messy.held }) + ')');

/* 4: a reload in the middle of a session */
for (let i = 0; i < 5; i++) await roundByKeys();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(READY, { timeout: 30000 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.evaluate(() => document.getElementById('start').focus());
await page.keyboard.press('Enter');
await sleep(150);
for (let i = 0; i < SESSION_LENGTH - 1; i++) { if ((await villageNow()).shown) break; await roundByKeys(); }
const short = await villageNow();
await roundByKeys();
await sleep(150);
const second = await villageNow();
say(!short.shown && second.shown && second.cells.length === 2, 'a reload in the middle of a session earns nothing: the village is shut one round short and opens after it with two (' + JSON.stringify({ short: short.shown, shown: second.shown, cells: second.cells.length }) + ')');
await close();

/* 5 */
for (let session = 2; session < 25; session++) {
  for (let i = 0; i < SESSION_LENGTH; i++) await roundByKeys();
  await sleep(60);
  if ((await villageNow()).shown) await close();
}
for (let i = 0; i < SESSION_LENGTH; i++) await roundByKeys();
await sleep(150);
const full = await villageNow();
const kinds = new Set(full.cells.map(c => c.building + '/' + c.ink));
say(full.shown && full.held === 24 && full.cells.length === 24 && kinds.size === 24, 'twenty six clean sessions hold twenty four buildings, every one different (' + full.held + ' held, ' + full.cells.length + ' drawn, ' + kinds.size + ' different)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPECIMENS FAILURE(S)'); process.exit(1); }
console.log('SPECIMENS OK');
