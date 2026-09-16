#!/usr/bin/env node
/* THE EAR GATE for NOTCH (plans/notch/HANDOFF-NOTCH.md P2; the handoff's "seat thunk is the best sound in the game"; the shape of
 * satellites/hush/test/audio.mjs).
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * One thunk a round is test/reveal.mjs's law; this gate is the sound itself and the drag's tick.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a round turned and seated plays nothing
 *   2. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the same
 *      numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30 percent above 3 kHz)
 *   3. with Sound on, a drag through 90 degrees ticks at least once and never more than once each 15 degrees
 *   4. a device whose audio throws: with Sound on the piece still seats and its reveal completes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const PATH = '/notch/index.html?seed=4242&';
const soundOn = async page => {
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
};
async function seatByKeys(page) {
  await page.evaluate(() => document.getElementById('bench').focus());
  let presses = 0;
  while ((await page.evaluate(() => window.NOTCH.phase())) === 'turn' && presses < 14) {
    const a = await page.evaluate(() => window.NOTCH.angle());
    await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
    presses++;
  }
  return page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' }).then(() => true, () => false);
}

/* 1 and 2 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: PATH, ready: READY }));
  const hook = await page.evaluate(() => !!(window.NOTCH.audio && window.NOTCH.audio.renderLoud));
  say(hook, 'the page exposes what its audio did (NOTCH.audio)');
  await page.evaluate(() => document.getElementById('start').click());
  await sleep(150);
  const seated = await seatByKeys(page);
  const played = await page.evaluate(() => window.NOTCH.audio.sounded().length);
  say(seated && played === 0, 'a first load is muted: a round turned and seated played nothing (' + played + ')');
  if (hook) {
    const full = await page.evaluate(() => window.NOTCH.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.NOTCH.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const r = half.rms / full.rms;
    say(r > 0.47 && r < 0.53 && half.peak < full.peak * 0.55, 'every voice passes through the master: halving it halves the rms and the peak (' + r.toFixed(3) + ')');
    const again = await page.evaluate(() => window.NOTCH.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    say(rel(again.peak, full.peak) < 1e-5 && rel(again.rms, full.rms) < 1e-5, 'the same render twice gives the same numbers');
    say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
    say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
  }
  say(errors.length === 0, 'first load: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  await soundOn(page);
  await tap(page, '#start');
  await sleep(150);
  /* a round whose piece starts 90 degrees or more off, so the drag can go 90 without seating */
  let task = await page.evaluate(() => window.NOTCH.task());
  for (let k = 0; k < 12 && Math.abs(task.startAngle) < 90; k++) {
    await seatByKeys(page);
    await page.evaluate(() => document.getElementById('next').click());
    await sleep(100);
    task = await page.evaluate(() => window.NOTCH.task());
  }
  await page.evaluate(() => window.NOTCH.audio.clear());
  const [cx, cy] = await page.evaluate(() => window.NOTCH.centre());
  const R = 110, from = await page.evaluate(() => window.NOTCH.angle());
  /* pointer travel of 90 degrees toward the notch, in 3 degree moves */
  const dir = from > 0 ? 1 : -1, start = -dir * 45;
  await page.mouse.move(cx + R * Math.cos(start * Math.PI / 180), cy + R * Math.sin(start * Math.PI / 180));
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) { const a = start + dir * 3 * i; await page.mouse.move(cx + R * Math.cos(a * Math.PI / 180), cy + R * Math.sin(a * Math.PI / 180)); }
  const turned = Math.abs(from - (await page.evaluate(() => window.NOTCH.angle())));
  const ticks = (await page.evaluate(() => window.NOTCH.audio.sounded())).filter(x => x === 'tick').length;
  await page.mouse.up();
  say(Math.abs(task.startAngle) >= 90 && turned >= 85 && ticks >= 1 && ticks <= Math.floor(turned / 15) + 1, 'with Sound on, a drag through ' + turned.toFixed(0) + ' degrees ticks ' + ticks + ' times (at least once, at most ' + (Math.floor(turned / 15) + 1) + ')');
  say(errors.length === 0, 'drag: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4 */
{
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[3], { path: PATH, ready: READY }));
  await soundOn(page);
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await page.evaluate(() => document.getElementById('start').click());
  await sleep(150);
  const done = await seatByKeys(page);
  const res = await page.evaluate(() => window.NOTCH.results[0]);
  say(done && !!res && res.seated, 'a device whose audio throws: the piece still seats and its reveal completes (' + JSON.stringify({ done, seated: res && res.seated }) + ')');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
