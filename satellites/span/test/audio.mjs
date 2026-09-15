#!/usr/bin/env node
/* THE EAR GATE for SPAN's seat (plans/span/HANDOFF-SPAN.md P2; the shape of satellites/math/core/test/audio.mjs).
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * The loudest pattern a child can make is rendered OFFLINE through the same voice builder the speaker uses, and
 * three numbers are read off the buffer: peak, rms, and the share of energy above 3 kHz, where an alarm lives.
 * Never a wav made for the ear: a render tool normalises its file.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a stone put on and a span laid by thumb play nothing
 *   2. with Sound turned on through its switch, a stone put on plays ONE seat, a long press that puts five on
 *      plays ONE seat (A1: a quantity is never a count of sounds), and a laid span plays one seat and nothing more
 *      through its reveal (the same on every path)
 *   3. every voice passes through the master: the loud pattern at master 1.0 and 0.5 halves in rms AND in peak.
 *      ⛔ The noise is seeded, so the two renders hear the same noise (the Wardian scar)
 *   4. the same render twice gives the same numbers to one part in a hundred thousand
 *   5. nothing clips (peak under 0.9) and it is not silence (peak over 0.05)
 *   6. it is not an alarm: under 30 percent of the energy above 3 kHz
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const PAGE = { path: '/span/index.html?seed=4242&', ready: 'window.SPAN && window.SPAN.ready' };

/* a real drag from the stone supply to the blank's pier, and a real long press on the supply */
const drop = page => page.evaluate(() => {
  const src = document.querySelector('#supply .stone-source');
  const side = document.querySelector('#equation .term[data-blank]').dataset.side, pier = document.getElementById('pier-' + side);
  const a = src.getBoundingClientRect(), b = pier.getBoundingClientRect();
  const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 81, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  fire('pointerdown', a.left + a.width / 2, a.top + a.height / 2);
  fire('pointermove', b.left + b.width / 2, b.top + 30);
  fire('pointerup', b.left + b.width / 2, b.top + 30);
});
async function longPress(page) {
  const at = await page.evaluate(() => { const r = document.querySelector('#supply .stone-source').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const fire = type => page.evaluate((type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 82, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), type, at[0], at[1]);
  await fire('pointerdown');
  await sleep(800);
  await fire('pointerup');
  await sleep(150);
}
const layAndWait = async page => {
  await tap(page, '#lay');
  await page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 });
  await sleep(300);
};
const sounded = page => page.evaluate(() => window.SPAN.audio.sounded());
const clear = page => page.evaluate(() => window.SPAN.audio.clear());

const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], PAGE));
const hook = await page.evaluate(() => !!(window.SPAN && window.SPAN.audio && window.SPAN.audio.sounded && window.SPAN.audio.renderLoud));
say(hook, 'the page exposes what its audio did (SPAN.audio)');
if (hook) {
  await tap(page, '#start');
  await sleep(200);
  await drop(page);
  await sleep(150);
  await layAndWait(page);
  const silent = await sounded(page);
  say(silent.length === 0, 'a first load is muted: a stone put on and a span laid played nothing (' + JSON.stringify(silent) + ')');

  await tap(page, '.lw-settings-open');
  await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close');
  await tap(page, '#next');
  await sleep(250);

  await clear(page);
  await drop(page);
  await sleep(200);
  const one = await sounded(page);
  say(one.length === 1 && one[0] === 'seat', 'with Sound on, a stone put on the pier plays one seat (' + JSON.stringify(one) + ')');

  await clear(page);
  await longPress(page);
  const five = await sounded(page);
  const count = await page.evaluate(() => Number(document.querySelector('#equation .term[data-blank]').dataset.count));
  say(five.length === 1 && five[0] === 'seat' && count === 6,
    'a long press that puts five on plays ONE seat, never one a stone (A1) (' + JSON.stringify(five) + ', the blank now ' + count + ')');

  await clear(page);
  await layAndWait(page);
  const laid = await sounded(page);
  say(laid.length === 1 && laid[0] === 'seat', 'a laid span plays one seat and nothing more through its reveal (' + JSON.stringify(laid) + ')');

  const full = await page.evaluate(() => window.SPAN.audio.renderLoud(20, 1));
  const half = await page.evaluate(() => window.SPAN.audio.renderLoud(20, 0.5));
  console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4)
    + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
  const ratio = half.rms / full.rms;
  say(ratio > 0.47 && ratio < 0.53, 'every voice passes through the master: halving it halves the level (ratio ' + ratio.toFixed(3) + ')');
  say(half.peak < full.peak * 0.55, 'and the peak comes down with it: ' + full.peak.toFixed(3) + ' to ' + half.peak.toFixed(3));
  const again = await page.evaluate(() => window.SPAN.audio.renderLoud(20, 1));
  const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
  const dPeak = rel(again.peak, full.peak), dRms = rel(again.rms, full.rms);
  say(dPeak < 1e-5 && dRms < 1e-5, 'and the same render twice gives the same numbers to one part in a hundred thousand, the noise is seeded (peak off by '
    + dPeak.toExponential(1) + ', rms by ' + dRms.toExponential(1) + ')');
  say(full.peak < 0.9, 'nothing clips: peak ' + full.peak.toFixed(3) + ' (under 0.90)');
  say(full.peak > 0.05, 'and it is not silence: peak ' + full.peak.toFixed(3) + ' (over 0.05)');
  say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
}
say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
