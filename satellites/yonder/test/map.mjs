#!/usr/bin/env node
/* YONDER's map and its runs (plans/yonder/HANDOFF-YONDER.md 3.10 and P3; CATALOG-PLAN D8): one piece a run through
 * collectOnce, about thirty assembling westward.
 *
 *   node test/map.mjs          (in the foreground, under the gate lock)
 *
 * A FLAG run is `count` rounds; a race is one run. Runs are played by thumb, and what the map draws and what the store
 * keeps are read off the page, its canvas and localStorage. The cap law starts from a store of 29 written before the
 * page loads, the one precondition the gate writes; the law it asserts is what play does to it.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a reload in the middle of a run adds no piece
 *   2. a FLAG run of count rounds played through ends on the map: one piece drawn on the canvas and one in the store,
 *      and a 56 px go that returns to the road
 *   3. a second run adds a second piece, drawn WEST of the first (to its left on the same row)
 *   4. a race run to square 10 adds a piece too
 *   5. never more than 30 pieces: a store of 29 holds 30 after a run and still 30 after another
 *   6. nothing on the console, nothing fetched after load
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.YONDER && window.YONDER.ready';
const PATH = '/yonder/index.html?seed=4242&count=10&';
const SQ = n => '#track .square[data-n="' + n + '"]';

const saved = page => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('lw:yonder:save')); } catch (e) { return null; } });
const pieces = rec => (rec && Array.isArray(rec.collect) ? rec.collect : []);
/* the cells of the map's canvas that hold a drawn piece, by reading its pixels: a cell is drawn when it is not clear */
const drawnCells = page => page.evaluate(() => {
  const m = document.getElementById('map');
  if (!m || m.hidden) return null;
  const c = document.getElementById('map-canvas'), ctx = c.getContext('2d'), cell = Number(c.dataset.cell), cols = Number(c.dataset.cols), rows = Number(c.dataset.rows);
  const out = [];
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const d = ctx.getImageData(k * cell + cell / 2 - 1, r * cell + cell / 2 - 1, 2, 2).data;
    if (d[3] > 0) out.push({ row: r, col: k });
  }
  return out;
});
const dragFlag = page => page.evaluate(() => {
  const st = document.querySelector('#road .lw-stone'), a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const o = x => ({ pointerId: 131, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x0 + 90)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x0 + 90)));
});
async function playRound(page) {
  await dragFlag(page);
  await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 });
  await sleep(80);
  await tap(page, '#next');
  await sleep(150);
}
async function playRun(page) {
  const n = await page.evaluate(() => window.YONDER.runLength());
  for (let i = 0; i < n; i++) await playRound(page);
  await sleep(250);
}

/* 1: a reload in the middle of a run, on its own page */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  await playRound(page);
  await playRound(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  say(pieces(await saved(page)).length === 0, 'a reload in the middle of a run adds no piece (' + JSON.stringify(pieces(await saved(page))) + ')');
  say(errors.length === 0, 'the reload: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 2, 3 and 4 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  await playRun(page);
  const one = await drawnCells(page), store1 = pieces(await saved(page));
  say(!!one && one.length === 1 && store1.length === 1, 'a FLAG run played through ends on the map, one piece drawn and one in the store ('
    + (one ? one.length + ' drawn' : 'no map') + ', ' + JSON.stringify(store1) + ')');
  const go = await centre(page, '#map-go');
  say(!!go && go.w >= 56 && go.h >= 56 && go.onTop, 'the map\'s go is a 56 px target a thumb lands on' + (go ? ' (' + Math.round(go.w) + 'x' + Math.round(go.h) + ')' : ' (missing)'));
  if (go) {
    await tap(page, '#map-go');
    await sleep(250);
    const back = await page.evaluate(() => ({ map: document.getElementById('map').hidden, play: document.getElementById('play').hidden }));
    say(back.map && !back.play, 'go returns to the road (' + JSON.stringify(back) + ')');
    await playRun(page);
    const two = await drawnCells(page), store2 = pieces(await saved(page));
    say(!!two && two.length === 2 && store2.length === 2 && two[0].row === two[1].row && Math.min(...two.map(c => c.col)) < Math.max(...two.map(c => c.col)),
      'a second run adds a second piece, on the same row (' + (two ? JSON.stringify(two) : 'no map') + ', ' + JSON.stringify(store2) + ')');
    const order = await page.evaluate(() => window.YONDER.mapCells());
    say(order.length === 2 && order[1].col < order[0].col, 'and the later piece is drawn west of the first (' + JSON.stringify(order) + ')');
    await tap(page, '#map-go');
    await sleep(250);
  }
  /* ⛔ SPAN's viaduct scar, repeated here: the first version asserted G2 after the reload below, and the reload's own
     requests turned it red. G2 is asserted on this page before it is ever reloaded. */
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, 'nothing is fetched after load (' + g2.detail + ')');
  /* 4: the race */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  await tap(page, '#start-race');
  await sleep(200);
  for (let guard = 0; guard < 30; guard++) {
    const st = await page.evaluate(() => window.YONDER.race.state());
    if (st.pos >= 10) break;
    if (st.remaining === 0) await tap(page, '#card');
    else { await page.evaluate(sel => document.querySelector(sel).scrollIntoView({ inline: 'nearest' }), SQ(st.pos + 1)); await tap(page, SQ(st.pos + 1)); }
    await sleep(100);
  }
  await sleep(300);
  const three = await drawnCells(page), store3 = pieces(await saved(page));
  say(!!three && three.length === 3 && store3.length === 3, 'a race run to square 10 adds a piece and shows the map (' + (three ? three.length + ' drawn' : 'no map') + ', ' + JSON.stringify(store3) + ')');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 5: the cap, from a store of 29 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const { browser, page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluate(() => {
    const rec = JSON.parse(localStorage.getItem('lw:yonder:save') || 'null') || { v: 1, adapt: {}, settings: { muted: true, reducedMotion: false, allModes: false, highContrast: false } };
    rec.v = 1;
    rec.collect = Array.from({ length: 29 }, (_, i) => 'piece-' + (i + 1));
    localStorage.setItem('lw:yonder:save', JSON.stringify(rec));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  await tap(page, '#start');
  await sleep(200);
  await playRun(page);
  const after1 = pieces(await saved(page)).length, drawn1 = await drawnCells(page);
  await tap(page, '#map-go');
  await sleep(250);
  await playRun(page);
  const after2 = pieces(await saved(page)).length, drawn2 = await drawnCells(page);
  say(after1 === 30 && after2 === 30 && !!drawn1 && drawn1.length === 30 && !!drawn2 && drawn2.length === 30,
    'never more than 30 pieces: 29 and a run is 30, and another run is still 30 (' + after1 + ' then ' + after2 + ' in the store, '
    + (drawn1 ? drawn1.length : 'none') + ' then ' + (drawn2 ? drawn2.length : 'none') + ' drawn)');
  say(errors.length === 0, 'the cap: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' MAP FAILURE(S)'); process.exit(1); }
console.log('MAP OK');
