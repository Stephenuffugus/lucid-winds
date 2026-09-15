#!/usr/bin/env node
/* GLIMPSE P1: FLASH, the mask, the pads and the reveal (plans/glimpse/HANDOFF-GLIMPSE.md P1; GL1, GL2, GL3, GL7).
 *
 *   node test/flash.mjs          (in the foreground, under the gate lock)
 *
 * Played by real taps and real keys on ?mode=flash. Every round is replayed in Node from engine.js for the same seed, the
 * tier from the page's own results.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every round is dealSession's for the seed and the tier the page's results give
 *   2. GL7: the round's pads and no more, each a 56 px target a thumb lands on, carrying its numeral and a pattern of that
 *      many dots, laid out at most four to a row
 *   3. the pads cannot be used during the flash or the mask, only after
 *   4. GL1: the mask is drawn on the frame the fireflies go (schedule.flash's hide frame is its mask frame), and the meadow's
 *      pixels in the mask are grass, not night
 *   5. GL2: with Sound on, one blink a flash, whatever the count
 *   6. GL3: while a child decides, nothing on the screen changes: no text, no width, no bar
 *   7. the result is scoreAnswer's for the pad chosen and the time from the fireflies' paint
 *   8. the reveal ends on the true count's numeral, on a right round and a wrong round alike, on the same timing
 *   9. at 1366x768 with no touch: Tab to start, Enter, then Tab to a pad and Enter once the pads wake; focus on next after
 *  10. no sideways scroll; nothing fetched after load; nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';
import { rng, adaptTier } from '../../math/core/pure.js';
import { dealSession, scoreAnswer, padsFor, padRows } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const PAGE = { path: '/glimpse/index.html?seed=' + SEED + '&mode=flash&', ready: READY };
const TIER_CONFIG = { tiers: 5, up: 3, down: 2, start: 0, floor: 0 };

const answerable = page => page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
const revealed = page => page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 }).then(() => sleep(100));
const face = page => page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden'; })
  .map(e => { const r = e.getBoundingClientRect(); return (e.id || e.className || e.tagName) + ':' + Array.from(e.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('') + ':' + Math.round(r.width) + 'x' + Math.round(r.height) + ':' + getComputedStyle(e).opacity; }).join('\n'));
/* the meadow's pixels, sorted into night and grass by the sprites' own colours */
const meadowKind = page => page.evaluate(() => {
  const c = document.getElementById('meadow'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let night = 0, grass = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 97) {
    n++;
    if (Math.abs(d[i] - 0x10) < 6 && Math.abs(d[i + 1] - 0x16) < 6 && Math.abs(d[i + 2] - 0x1f) < 6) night++;
    else if (d[i + 1] > d[i] && d[i + 1] > d[i + 2] && d[i + 1] >= 0x30) grass++;
  }
  return { night: night / n, grass: grass / n };
});

for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  if (size.width === 375) {
    await page.evaluate(() => {
      window.__mask = [];
      const watch = () => { if (window.GLIMPSE.phase() === 'mask' && window.__mask.length < 40) { const c = document.getElementById('meadow'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let g = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 97) { n++; if (d[i + 1] > d[i] && d[i + 1] > d[i + 2] && d[i + 1] >= 0x30) g++; } window.__mask.push(g / n); } requestAnimationFrame(watch); };
      requestAnimationFrame(watch);
    });
  }
  await tap(page, '#start');
  const rounds = size.width === 375 ? 6 : 2, rows = [];
  for (let i = 0; i < rounds; i++) {
    if (i) { await tap(page, '#next'); }
    await page.waitForFunction(i => window.GLIMPSE.round() === i, { timeout: 10000 }, i);
    const early = await page.evaluate(() => Array.from(document.querySelectorAll('.pad')).every(b => b.getAttribute('aria-disabled') === 'true'));
    await answerable(page);
    /* ⛔ the first version replayed each round at the tier the results so far give; the page deals a whole session at the
       tier it has when the session starts, so every round of session 0 is dealt at tier 0 */
    const r = rng(SEED >>> 0);
    const deal = dealSession(r, { mode: 'flash', tier: adaptTier([], TIER_CONFIG), session: 0 });
    const got = await page.evaluate(() => window.GLIMPSE.current());
    const pads = await page.evaluate(() => Array.from(document.querySelectorAll('#pads .pad-row')).map(row => Array.from(row.querySelectorAll('.pad')).map(b => { const rr = b.getBoundingClientRect(); return { v: b.dataset.value, num: b.querySelector('.pad-num').textContent, dots: b.querySelector('canvas') ? b.querySelector('canvas').dataset.dots : null, w: rr.width, h: rr.height }; })));
    const wantRows = padRows(padsFor(got)).map(row => row.map(String));
    const gotRows = pads.map(row => row.map(p => p.v));
    const padsOk = JSON.stringify(gotRows) === JSON.stringify(wantRows) && pads.flat().every(p => p.num === p.v && p.dots === p.v);
    const small = [];
    for (const v of wantRows.flat()) { const c = await centre(page, '.pad[data-value="' + v + '"]'); if (!c || c.w < 56 || c.h < 56 || !c.onTop) small.push(v); }
    const f0 = await face(page); await sleep(700); const f1 = await face(page);
    const truth = got.answer, side = i % 2 === 0 ? truth : (truth === 5 ? 4 : truth + 1);
    const log = (await page.evaluate(() => window.GLIMPSE.flashLog())).find(x => x.round === i);
    await tap(page, '.pad[data-value="' + side + '"]');
    const result = await page.evaluate(() => window.GLIMPSE.results[window.GLIMPSE.results.length - 1]);
    await revealed(page);
    const shown = await page.evaluate(() => { const t = document.getElementById('truth'); return t.hidden ? null : t.textContent; });
    rows.push({ i, got, deal: deal[i], early, padsOk, small, still: f0 === f1, log, result, shown, side, truth });
  }
  const seamOff = rows.filter(x => !x.deal || x.got.count !== x.deal.count || x.got.arrangement !== x.deal.arrangement || JSON.stringify(x.got.dots) !== JSON.stringify(x.deal.dots));
  say(seamOff.length === 0, at + ' every round is dealSession\'s for the seed and tier (' + rows.map(x => x.got.arrangement + ' ' + x.got.count + (seamOff.includes(x) ? ' OFF' : '')).join(', ') + ')');
  say(rows.every(x => x.padsOk && x.small.length === 0), at + ' GL7: the round\'s pads and no more, four to a row at most, each a 56 px target with its numeral and that many dots' + (rows.some(x => x.small.length) ? ' (small: ' + rows.map(x => x.small.join(',')).join(' ') + ')' : ''));
  say(rows.every(x => x.early), at + ' the pads sleep through the flash and the mask');
  say(rows.every(x => x.log && x.log.maskedAt !== null && x.log.maskedAt === x.log.hiddenAt), at + ' GL1: the mask is drawn on the frame the fireflies go (' + rows.map(x => x.log && (x.log.maskedAt - x.log.hiddenAt)).join(', ') + ')');
  say(rows.every(x => x.still), at + ' GL3: while a child decides, nothing on the screen changes');
  say(rows.every(x => { const s = scoreAnswer(x.got, x.side, x.result.rt); return x.result.answer === x.side && x.result.correct === s.correct && x.result.climbs === s.climbs && x.result.rt > 0; }), at + ' the result is scoreAnswer\'s for the pad and the time from paint (' + rows.map(x => Math.round(x.result.rt) + ' ms').join(', ') + ')');
  say(rows.every(x => x.shown === String(x.truth)), at + ' the reveal ends on the true count\'s numeral, right or wrong (' + rows.map(x => x.shown + (x.side === x.truth ? '' : ' after ' + x.side)).join(', ') + ')');
  if (size.width === 375) {
    const mask = await page.evaluate(() => window.__mask);
    say(mask.length >= 3 && mask.every(g => g > 0.3), '375x667 GL1: every frame of the mask is grass on the meadow, not night (' + mask.length + ' frames, least ' + (mask.length ? Math.min(...mask).toFixed(2) : 'none') + ')');
  }
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 5: one blink a flash */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], PAGE));
  const { browser, page, errors } = opened;
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await tap(page, '#start');
  const played = [];
  for (let i = 0; i < 4; i++) {
    if (i) await tap(page, '#next');
    await page.waitForFunction(i => window.GLIMPSE.round() === i, { timeout: 10000 }, i);
    await page.evaluate(() => window.GLIMPSE.audio.clear());
    await answerable(page);
    const count = (await page.evaluate(() => window.GLIMPSE.current())).count;
    played.push({ count, sounds: await page.evaluate(() => window.GLIMPSE.audio.sounded()) });
    await tap(page, '.pad[data-value="1"]');
    await revealed(page);
  }
  say(played.every(p => p.sounds.join() === 'blink'), '375x667 GL2: with Sound on, one blink a flash, whatever the count (' + played.map(p => p.count + ':' + p.sounds.length).join(', ') + ')');
  say(errors.length === 0, '375x667 sound: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 9 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (let i = 0; i < 12; i++) { const id = await page.evaluate(() => document.activeElement && document.activeElement.id); if (id === 'start') break; await page.keyboard.press('Tab'); }
  await page.keyboard.press('Enter');
  await answerable(page);
  const focusOnPad = await page.evaluate(() => !!document.activeElement && document.activeElement.classList.contains('pad'));
  await page.keyboard.press('Enter');
  const done = await page.waitForFunction(() => window.GLIMPSE.results.length > 0, { timeout: 5000 }).then(() => true, () => false);
  await revealed(page).catch(() => {});
  const focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(focusOnPad && done && focus === 'next', '1366x768 keyboard: Tab to start, Enter, the first pad takes focus when the pads wake, Enter answers, focus on next after (' + JSON.stringify({ focusOnPad, done, focus }) + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' FLASH FAILURE(S)'); process.exit(1); }
console.log('FLASH OK');
