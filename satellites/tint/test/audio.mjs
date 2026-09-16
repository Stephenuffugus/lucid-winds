#!/usr/bin/env node
/* THE EAR GATE for TINT (plans/tint/HANDOFF-TINT.md P2; the shape of satellites/hush/test/audio.mjs). One sound a round is
 * test/compare.mjs's and test/scales.mjs's law; this gate is the sound itself.
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a SAME COLOUR round answered and poured plays nothing
 *   2. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the same
 *      loudness within the noise the pour is made of; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30
 *      percent above 3 kHz)
 *   3. a device whose audio throws: with Sound on a round still pours to its end and go on comes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.TINT && window.TINT.ready';
const PATH = '/tint/index.html?seed=4242&';

/* 1 and 2 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const hook = await page.evaluate(() => !!(window.TINT.audio && window.TINT.audio.renderLoud));
  say(hook, 'the page exposes what its audio did (TINT.audio)');
  await tap(page, '#start');
  await sleep(200);
  await tap(page, '#same');
  await page.waitForFunction(() => window.TINT.pourDone(), { timeout: 20000, polling: 'raf' });
  const played = await page.evaluate(() => window.TINT.audio.sounded().length);
  say(played === 0, 'a first load is muted: a round answered and poured played nothing (' + played + ')');
  if (hook) {
    const full = await page.evaluate(() => window.TINT.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.TINT.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const r = half.rms / full.rms;
    say(r > 0.45 && r < 0.55 && half.peak < full.peak * 0.6, 'every voice passes through the master: halving it halves the rms and the peak (' + r.toFixed(3) + ')');
    const again = await page.evaluate(() => window.TINT.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    say(rel(again.rms, full.rms) < 0.05 && rel(again.peak, full.peak) < 0.25, 'the same render twice gives the same loudness within the pour\'s noise (rms ' + full.rms.toFixed(4) + ' and ' + again.rms.toFixed(4) + ')');
    say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
    say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
  }
  say(errors.length === 0, 'first load: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
{
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await tap(page, '#start');
  await sleep(200);
  await tap(page, '#different');
  const done = await page.waitForFunction(() => window.TINT.pourDone() && !document.getElementById('next').hidden, { timeout: 20000, polling: 'raf' }).then(() => true, () => false);
  say(done, 'a device whose audio throws: the round still pours to its end and go on comes (' + done + ')');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
