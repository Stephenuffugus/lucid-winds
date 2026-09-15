#!/usr/bin/env node
/* GLIMPSE P2: GROUPS, FRAME and SPREAD, and the doors (plans/glimpse/HANDOFF-GLIMPSE.md P2; the handoff's section 4).
 *
 *   node test/modes.mjs          (in the foreground, under the gate lock)
 *
 * Played by real taps on ?mode=groups, ?mode=frame and ?mode=spread. Every round is replayed in Node from engine.js for the
 * same seed (session 0 is dealt at tier 0).
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every round is dealSession's for its mode and the seed
 *   2. each mode's pads and no more: GROUPS 5 to 10, FRAME 0 to 10, SPREAD's three pictures; a numeral pad carries its
 *      numeral and that many dots, a SPREAD pad its own picture; all 56 px targets a thumb lands on
 *   3. the result is scoreAnswer's for the pad chosen
 *   4. the reveal ends on the round's answer (FRAME's complement, the missing count), and SPREAD's on both swarms' counts
 *   5. FRAME: at a complement's reveal every empty cell of the frame glows, read off the meadow's pixels
 *   6. SPREAD: the left swarm is drawn blue and the right amber, read off the meadow's pixels (GL8)
 *   7. with no mode named, four doors, each drawn and a 56 px target; a link naming a mode shows one
 *   8. FRAME's eleven pads fit at 320: on the screen, no sideways scroll
 *   9. nothing fetched after load; nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession, scoreAnswer, padsFor, padRows, TENFRAME_STEP } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const answerable = page => page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
const revealed = page => page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 }).then(() => sleep(100));
const key = x => JSON.stringify(x.mode === 'spread' ? [x.roundType, x.a.n, x.b.n, x.a.dots, x.b.dots] : [x.count, x.parts || null, x.ask, x.answer, x.dots]);
const wrongOf = (x, pads) => pads.find(v => v !== x.answer);
const pixel = (page, fx, fy) => page.evaluate((fx, fy) => {
  const c = document.getElementById('meadow'), W = c.clientWidth, k = c.width / W;
  const d = c.getContext('2d').getImageData(Math.round(fx * k), Math.round(fy * k), 1, 1).data;
  return [d[0], d[1], d[2]];
}, fx, fy);

for (const mode of ['groups', 'frame', 'spread']) {
  const at = '375x667 ' + mode;
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=' + SEED + '&mode=' + mode + '&', ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  const deal = dealSession(rng(SEED >>> 0), { mode, tier: 0, session: 0 });
  const rows = [];
  let lit = null, colours = null;
  for (let i = 0; i < 4; i++) {
    if (i) await tap(page, '#next');
    await page.waitForFunction(i => window.GLIMPSE.round() === i, { timeout: 10000 }, i);
    await answerable(page);
    const got = await page.evaluate(() => window.GLIMPSE.current());
    const wantPads = padsFor(got), wantRows = padRows(wantPads).map(r => r.map(String));
    const pads = await page.evaluate(() => Array.from(document.querySelectorAll('#pads .pad-row')).map(row => Array.from(row.querySelectorAll('.pad')).map(b => ({
      v: b.dataset.value, num: b.querySelector('.pad-num') ? b.querySelector('.pad-num').textContent : null,
      dots: b.querySelector('canvas') ? b.querySelector('canvas').dataset.dots || null : null, symbol: b.querySelector('canvas') ? b.querySelector('canvas').dataset.symbol || null : null }))));
    const padsOk = JSON.stringify(pads.map(r => r.map(p => p.v))) === JSON.stringify(wantRows)
      && pads.flat().every(p => (/^\d+$/.test(p.v) ? p.num === p.v && p.dots === p.v : p.symbol === p.v));
    const small = [];
    for (const v of wantRows.flat()) { const c = await centre(page, '.pad[data-value="' + v + '"]'); if (!c || c.w < 56 || c.h < 56 || !c.onTop) small.push(v); }
    let choice = i % 2 === 0 ? got.answer : wrongOf(got, wantPads);
    /* ⛔ plant mo1 (FRAME with no zero pad) threw here, on a tap at a pad that was never drawn; a missing pad is the pads law's
       failure, recorded above, so the gate answers with a pad that is there and plays on to say so */
    if (!(await page.$('.pad[data-value="' + choice + '"]'))) {
      const there = await page.evaluate(() => { const b = document.querySelector('.pad'); return b ? b.dataset.value : null; });
      choice = there !== null && /^\d+$/.test(there) ? Number(there) : there;
    }
    await tap(page, '.pad[data-value="' + choice + '"]');
    const result = await page.evaluate(() => window.GLIMPSE.results[window.GLIMPSE.results.length - 1]);
    await revealed(page);
    const shown = await page.evaluate(() => { const t = document.getElementById('truth'); return t.hidden ? null : t.textContent; });
    if (mode === 'frame' && got.ask === 'complement' && lit === null && got.count < 10) {
      const W = await page.evaluate(() => document.getElementById('meadow').clientWidth), cell = TENFRAME_STEP * W, d0 = got.dots[0];
      const empties = [];
      for (let c = got.count; c < 10; c++) empties.push(await pixel(page, d0.x * W + (c % 5) * cell, d0.y * W + Math.floor(c / 5) * cell));
      /* PALETTE 8, the amber halo: red well over blue */
      lit = { count: got.count, cells: empties.length, glowing: empties.filter(([r, g, b]) => r > 100 && r > b + 50).length };
    }
    if (mode === 'spread' && colours === null) {
      colours = await page.evaluate(() => {
        const c = document.getElementById('meadow'), W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data;
        const side = (x0, x1) => { let blue = 0, amber = 0; for (let y = 0; y < H; y += 2) for (let x = x0; x < x1; x += 2) { const i = (y * W + x) * 4; if (d[i + 2] > 200 && d[i] < 180) blue++; if (d[i] > 200 && d[i + 2] < 140) amber++; } return { blue, amber }; };
        return { left: side(0, Math.floor(W / 2)), right: side(Math.ceil(W / 2), W) };
      });
    }
    rows.push({ i, got, deal: deal[i], padsOk, small, choice, result, shown });
  }
  say(rows.every(x => key(x.got) === key(x.deal)), at + ' every round is dealSession\'s (' + rows.map(x => (key(x.got) === key(x.deal) ? 'ok' : 'OFF')).join(',') + ')');
  say(rows.every(x => x.padsOk && x.small.length === 0), at + ' the mode\'s pads and no more, each with its numeral and dots or its own picture, 56 px targets' + (rows.some(x => x.small.length) ? ' (small: ' + rows.map(x => x.small.join(',')).join(' ') + ')' : ''));
  say(rows.every(x => { const sc = scoreAnswer(x.got, x.choice, x.result.rt); return x.result.answer === x.choice && x.result.correct === sc.correct && x.result.climbs === sc.climbs; }), at + ' the result is scoreAnswer\'s for the pad chosen (' + rows.map(x => String(x.choice) + (x.result.correct ? ' right' : ' wrong')).join(', ') + ')');
  const truthOf = x => (mode === 'spread' ? x.got.a.n + '   ' + x.got.b.n : String(x.got.answer));
  say(rows.every(x => x.shown === truthOf(x)), at + ' the reveal ends on the round\'s answer (' + rows.map(x => JSON.stringify(x.shown)).join(', ') + ')');
  if (mode === 'frame') say(!!lit && lit.glowing === lit.cells, at + ' at a complement\'s reveal every empty cell of the frame glows (' + JSON.stringify(lit) + ')');
  if (mode === 'spread') say(!!colours && colours.left.blue > 20 && colours.left.amber === 0 && colours.right.amber > 20 && colours.right.blue === 0, at + ' the left swarm is blue and the right amber (' + JSON.stringify(colours) + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 7 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=' + SEED + '&', ready: READY }));
  const bits = [];
  for (const [sel, want] of [['#start', 'flash'], ['#start-groups', 'groups'], ['#start-frame', 'frame'], ['#start-spread', 'spread']]) {
    const d = await opened.page.evaluate(sel => { const c = document.querySelector(sel + ' canvas'); if (!c) return null; const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] > 150) n++; return { door: c.dataset.door, lit: n }; }, sel);
    const c = await centre(opened.page, sel);
    if (!d || d.door !== want || d.lit < 20 || !c || c.w < 56 || c.h < 56 || !c.onTop) bits.push(sel + ' ' + JSON.stringify(d));
  }
  say(bits.length === 0, '375x667 with no mode named, four doors, each drawn and a 56 px target' + (bits.length ? ': ' + bits.join('; ') : ''));
  say(opened.errors.length === 0, '375x667 doors: nothing landed on the console' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.browser.close();
  const named = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=' + SEED + '&mode=spread&', ready: READY }));
  const shown = await named.page.evaluate(() => ['start', 'start-groups', 'start-frame', 'start-spread'].filter(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width > 0; }));
  const which = await named.page.evaluate(() => document.querySelector('#start canvas').dataset.door);
  say(JSON.stringify(shown) === '["start"]' && which === 'spread', '375x667 a link naming SPREAD shows one door, drawn as SPREAD\'s (' + JSON.stringify(shown) + ', ' + which + ')');
  await named.browser.close();
}

/* 8 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[0], { path: '/glimpse/index.html?seed=' + SEED + '&mode=frame&', ready: READY }));
  const { page, errors } = opened;
  await tap(page, '#start');
  await answerable(page);
  const off = await page.evaluate(() => Array.from(document.querySelectorAll('.pad')).filter(b => { const r = b.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth || r.width < 56 || r.height < 56; }).map(b => b.dataset.value));
  const count = await page.evaluate(() => document.querySelectorAll('.pad').length);
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  say(count === 11 && off.length === 0 && sideways <= 1, '320x568 FRAME\'s eleven pads fit: on the screen, 56 px each, no sideways scroll (' + JSON.stringify({ count, off, sideways }) + ')');
  say(errors.length === 0, '320x568 FRAME: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' MODES FAILURE(S)'); process.exit(1); }
console.log('MODES OK');
