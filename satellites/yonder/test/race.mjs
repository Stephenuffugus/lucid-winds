#!/usr/bin/env node
/* YONDER Mode 1, THE RACE (plans/yonder/HANDOFF-YONDER.md P2 step 3; the handoff's test gates 5 and 6, Y1, Y2, Y7, Y10).
 *
 *   node test/race.mjs          (in the foreground, under the gate lock)
 *
 * Played by real taps and real keys on ?mode=race. The cards the page must deal come from engine.js's raceMoves in Node
 * for the same seed.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: the race start, the card, every square and the again control are 56 px targets a thumb lands
 *      on (a square once scrolled into its strip); the page does not scroll sideways; nothing on the console or fetched
 *   2. Y10: the ten squares share one row at every size, the start square too, and the strip scrolls sideways instead
 *   3. the card shows the engine's deal, card after card
 *   4. Y2: with a count on the card and no input, the traveler does not move; a tap two squares ahead moves nothing; a tap
 *      on the card while the count is unwalked turns nothing; each tap on the next square moves exactly one square; the
 *      card lies face down again when its count is walked
 *   5. Y7: each square reached shows its numeral large, and with Sound on and a voice on this device names it, one name
 *      and one step sound per square
 *   6. a whole race by thumb reaches square 10, where the card stops turning and again starts a new race at the start
 *   7. at 1366x768 with no touch: a whole race by keys alone, one Enter on a square per square moved
 *   8. Y1 as drawn: no element of the race is round (a radius of 45 percent of its short side) and none is turned
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { raceMoves } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const PAGE = { path: '/yonder/index.html?seed=' + SEED + '&mode=race&', ready: 'window.YONDER && window.YONDER.ready' };
const DEAL = raceMoves(rng(SEED >>> 0), 400);
const SQ = n => '#track .square[data-n="' + n + '"]';
const state = page => page.evaluate(() => window.YONDER.race.state());
const rowOf = page => page.evaluate(() => Array.from(document.querySelectorAll('#track .square')).map(e => Math.round(e.getBoundingClientRect().top)));
const roundThings = page => page.evaluate(() => Array.from(document.querySelectorAll('#race, #race *')).filter(e => {
  const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  if (r.width < 2 || r.height < 2 || cs.display === 'none') return false;
  const radius = Math.max(...['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'].map(k => parseFloat(cs[k]) || 0));
  const turned = cs.transform !== 'none' && (() => { const m = new DOMMatrix(cs.transform); return Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6; })();
  return radius >= 0.45 * Math.min(r.width, r.height) || turned;
}).map(e => e.id || e.className));

for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  await page.evaluate(() => {
    const voice = { name: 'probe', lang: 'en-US', localService: true, default: true, voiceURI: 'probe' };
    window.__said = [];
    /* the browser's own utterance refuses a plain object for a voice (the ear gate's scar) */
    window.SpeechSynthesisUtterance = function (text) { this.text = text; this.voice = null; };
    Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [voice] });
    Object.defineProperty(window.speechSynthesis, 'speak', { value: u => window.__said.push(u.text) });
  });
  const start = await centre(page, '#start');
  say(!!start && start.w >= 56 && start.h >= 56 && start.onTop, at + ' the start is a 56 px target');
  await tap(page, '#start');
  await sleep(250);
  if (size.width === 375) {
    await tap(page, '.lw-settings-open'); await sleep(120);
    await tap(page, '.lw-settings [data-key="muted"]');
    await tap(page, '.lw-settings-close'); await sleep(120);
    await page.evaluate(() => window.YONDER.audio.clear());
  }
  const rows = await rowOf(page);
  say(rows.length === 11 && rows.every(t => Math.abs(t - rows[0]) <= 1), at + ' the start square and the ten squares share one row (Y10) (' + Array.from(new Set(rows)).join(', ') + ')');
  const wrap = await page.evaluate(() => { const t = document.getElementById('track'), st = document.getElementById('strip'); return { wrap: getComputedStyle(t).flexWrap, scroll: getComputedStyle(st).overflowX }; });
  say(wrap.wrap === 'nowrap' && (wrap.scroll === 'auto' || wrap.scroll === 'scroll'), at + ' the track never wraps and its strip scrolls sideways (' + wrap.wrap + ', ' + wrap.scroll + ')');
  const small = [];
  for (const sel of ['#card'].concat(Array.from({ length: 10 }, (_, i) => SQ(i + 1)))) {
    const r = await centre(page, sel);
    if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing'));
  }
  say(small.length === 0, at + ' the card and every square are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));
  /* ⛔ centre scrolls each square into view; put the strip back where the page keeps it */
  await page.evaluate(() => window.YONDER.race.refresh());

  /* a whole race by thumb, with the laws of Y2 asked at every card */
  const y2 = [], dealt = [], named = [];
  let guard = 0;
  while ((await state(page)).pos < 10 && guard++ < 20) {
    await tap(page, '#card');
    await sleep(120);
    const st = await state(page);
    dealt.push(st.remaining === 0 ? null : Number(st.face));
    if (st.remaining <= 0) { y2.push('the card did not turn at ' + st.pos); break; }
    await sleep(guard === 1 ? 2500 : 300);
    const still = await state(page);
    if (still.pos !== st.pos) y2.push('the traveler moved from ' + st.pos + ' to ' + still.pos + ' with no input');
    if (st.pos + 2 <= 10) {
      await page.evaluate(sel => document.querySelector(sel).scrollIntoView({ inline: 'nearest' }), SQ(st.pos + 2));
      await tap(page, SQ(st.pos + 2));
      await sleep(80);
      if ((await state(page)).pos !== st.pos) y2.push('a tap two squares ahead moved the traveler at ' + st.pos);
    }
    await tap(page, '#card');
    await sleep(80);
    const again = await state(page);
    if (again.face !== st.face || again.remaining !== st.remaining || again.flips.length !== st.flips.length) y2.push('the card turned again with its count unwalked at ' + st.pos);
    let left = st.remaining;
    while (left > 0) {
      const before = await state(page);
      await tap(page, SQ(before.pos + 1));
      await sleep(80);
      const after = await state(page);
      if (after.pos !== before.pos + 1) { y2.push('a tap on square ' + (before.pos + 1) + ' moved from ' + before.pos + ' to ' + after.pos); break; }
      const big = await page.$eval('#race-number', e => e.textContent);
      if (big !== String(after.pos)) y2.push('square ' + after.pos + ' shows ' + JSON.stringify(big) + ' large');
      named.push(after.pos);
      left = after.remaining;
      if (after.pos >= 10) break;
    }
    const down = await state(page);
    if (down.remaining === 0 && down.face !== 'down') y2.push('the card lay face up after its count at ' + down.pos);
  }
  const fin = await state(page);
  say(y2.length === 0, at + ' no input moves nothing, a tap two ahead moves nothing, the card does not turn over an unwalked count, each tap on the next square moves one, and the card lies down after its count (Y2)' + (y2.length ? ': ' + y2.slice(0, 3).join('; ') : ''));
  const want = DEAL.slice(0, dealt.length);
  say(dealt.length > 0 && dealt.join() === want.join(), at + ' the cards are the engine\'s deal (' + dealt.join('') + ', the engine ' + want.join('') + ')');
  say(fin.pos === 10 && named.join() === '1,2,3,4,5,6,7,8,9,10', at + ' a whole race by thumb reaches 10 one square at a time, each numeral shown large (' + named.join(',') + ')');
  if (size.width === 375) {
    const said = await page.evaluate(() => window.__said.slice());
    const sounds = await page.evaluate(() => window.YONDER.audio.sounded());
    say(said.join() === named.join(), at + ' with Sound on, each square reached is named once by the local voice (' + said.join(',') + ')');
    say(sounds.filter(x => x === 'step').length === named.length && sounds.filter(x => x === 'flip').length === dealt.length,
      at + ' one step sound a square and one flip sound a card (' + sounds.join(',') + ')');
  }
  /* a race is a run: the map shows at the finish, and go returns to the squares */
  const mapShown = await page.evaluate(() => !document.getElementById('map').hidden);
  say(mapShown, at + ' at square 10 the map shows');
  if (mapShown) { await tap(page, '#map-go'); await sleep(150); }
  await tap(page, '#card');
  await sleep(80);
  say((await state(page)).flips.length === dealt.length, at + ' at square 10 the card turns no more');
  const ag = await centre(page, '#race-again');
  say(!!ag && ag.w >= 56 && ag.h >= 56 && ag.onTop, at + ' again is a 56 px target at the finish');
  const round = await roundThings(page);
  say(round.length === 0, at + ' nothing in the race is round or turned (Y1)' + (round.length ? ': ' + round.join(', ') : ''));
  if (ag) { await tap(page, '#race-again'); await sleep(150); }
  const reset = await state(page);
  say(reset.pos === 0 && reset.face === 'down' && reset.races === 1, at + ' again puts the traveler back at the start with the card face down (' + JSON.stringify({ pos: reset.pos, face: reset.face, races: reset.races }) + ')');
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the Chromebook, by keys alone ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  const rows = await rowOf(page);
  let presses = 0, cards = 0;
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', { key: 'Tab', until: '#card' }], () => true);
  for (let guard = 0; guard < 40 && (await state(page)).pos < 10; guard++) {
    const st = await state(page);
    if (st.remaining === 0) { await page.keyboard.press('Enter'); cards++; continue; }
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.dataset.n);
    await page.keyboard.press('Enter');
    presses++;
    const after = await state(page);
    if (Number(focused) !== st.pos + 1 || after.pos !== st.pos + 1) break;
  }
  const fin = await state(page);
  say(rows.every(t => Math.abs(t - rows[0]) <= 1), '1366x768 keyboard the squares share one row (Y10)');
  say(kb.ok && fin.pos === 10 && presses === fin.steps.length && presses === 10 && cards === fin.flips.length,
    '1366x768 keyboard a whole race by keys alone: Enter turns the card, focus goes to the next square, one Enter a square (' + presses + ' presses for ' + fin.steps.length + ' squares, ' + cards + ' cards, ' + kb.detail + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' RACE FAILURE(S)'); process.exit(1); }
console.log('RACE OK');
