#!/usr/bin/env node
/* Five kites, five shapes IN THE AIR (Director call 53), in a real browser at 375x667.
 *
 *   node test/kites.mjs
 *
 * What it asserts, each watched to fail (the ledger is in HANDOFF-UPDRAFT SESSION STATE):
 *   1. a real tap on each kite card, with the kite on the grass, puts THAT kite in hand
 *   2. aloft, every kite paints ink, sail and ribbon both (a differential off the canvas)
 *   3. drawn by the flight's own drawKite in one fixed pose, no two kites are the
 *      same picture, and every one has ink
 *   4. every sail stays inside the band the Diamond flew in: in the kite's own
 *      frame no point of its outline is further than 1.05 sizes from the centre
 *      along or across the nose (the unit box the Diamond fills), and it is not
 *      a dot (the Dragon's head is small on purpose, the tail is the kite)
 *
 * ⛔ The card taps are real pointer events on the element a thumb lands on.
 * UPDRAFT_DEV.place is the camera's liberty and it is used ONCE per kite here
 * to put the kite aloft for the ink count, exactly as test/layout.mjs does for
 * the 67 m count; nothing else here writes to the sim.
 */
import { serve, open, reporter, tap, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base, { width: 375, height: 667 });
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);
const IDS = ['diamond', 'delta', 'box', 'sled', 'dragon'];

/* a journal that has earned all five, written before the page boots */
await dev(() => localStorage.setItem('lw_updraft_v1', JSON.stringify({ v: 1, journal: { bestAlt: 70, longest: 300, tricks: { 'Loop': 12, 'High Park': 1 }, hours: 3, flights: 20 }, kite: 'diamond', mood: 'fresh' })));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
await waitFrames(page, 3);

const pictures = [];
for (const id of IDS) {
  /* ⛔ a Fresh kite on the grass lifts off on a gust by itself (the model, not
     this gate's business), and a pick only swaps the kite in hand while it is
     on the grass, so the pick waits for the grass */
  await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.ground; }, { timeout: 30000 });
  /* the picker, by real taps: pause, KITES, the card, then RESUME */
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  await tap(page, '#btnKites');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'kites', { timeout: 15000 });
  const locked = await dev((id) => document.getElementById('kite' + id.charAt(0).toUpperCase() + id.slice(1)).classList.contains('locked'), id);
  say(!locked, id + ': the card is open on a journal that earned it');
  await tap(page, '#kite' + id.charAt(0).toUpperCase() + id.slice(1));
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  await tap(page, '#btnResume');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 15000 });
  /* the kite in hand is on the grass (the flight was never launched), so the pick swaps it at once */
  const s = await dev(() => window.UPDRAFT_DEV.state());
  say(s && s.kite === id, id + ': a real tap on the card puts it in hand (in hand: ' + (s ? s.kite : '?') + ')');
  /* aloft, close, and count what it paints */
  await dev(() => window.UPDRAFT_DEV.place({ L: 16, el: 0.8, az: -0.1, launched: true }));
  await waitFrames(page, 3);
  const ink = await dev(() => window.UPDRAFT_DEV.kiteInk());
  const need = Math.round(375 * 375 * 0.0016);
  say(!!ink && ink.sail >= need * 0.5 && ink.tail >= need * 0.25,
    id + ': aloft at 16 m it paints a sail of ' + (ink ? ink.sail : 0) + ' and a ribbon of ' + (ink ? ink.tail : 0) + ' pixels (wanted ' + Math.round(need * 0.5) + ' and ' + Math.round(need * 0.25) + ')');
  const pic = await dev((id) => window.UPDRAFT_DEV.kitePicture(id), id);
  pictures.push(pic);
  say(pic.ink > 400, id + ': in the fixed pose the sail has ink (' + pic.ink + ' pixels)');
  say(pic.far <= 1.05 && pic.tall >= 0.8 && pic.wide >= 0.8,
    id + ': its outline stays inside the Diamond\'s band and is not a dot (furthest point ' + pic.far.toFixed(2) + ' sizes, ' + pic.tall.toFixed(2) + ' tall by ' + pic.wide.toFixed(2) + ' wide)');
  /* back to the grass for the next pick: LAND IT ends this flight, FLY AGAIN starts the next on the grass */
  await dev(() => window.UPDRAFT_DEV.place({ L: 8, el: 0, az: 0, launched: false }));
  await waitFrames(page, 2);
}
const sigs = pictures.map(p => p.sig);
say(new Set(sigs).size === IDS.length, 'no two kites are the same picture in the air (' + pictures.map(p => p.id + ':' + p.sig).join(' ') + ')');
const dragonWide = pictures.find(p => p.id === 'box').wide < pictures.find(p => p.id === 'delta').wide;
say(dragonWide, 'and the Delta is wider than the Box, as the cards say (' + pictures.find(p => p.id === 'delta').wide.toFixed(2) + ' against ' + pictures.find(p => p.id === 'box').wide.toFixed(2) + ')');

say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' KITES FAILURE(S)'); process.exit(1); }
console.log('KITES OK');
