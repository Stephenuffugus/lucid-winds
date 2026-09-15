#!/usr/bin/env node
/* THE EAR GATE for GAUGE (plans/gauge/HANDOFF-GAUGE.md P2: "the detent a place higher each level"; the shape of TINT's
 * test/audio.mjs). One detent a move is test/zoom.mjs's law; this gate is the sound itself.
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a WHICH IS MORE round answered and revealed plays nothing
 *   2. the detent is a place higher each level: detent0 to detent3, each rendered offline on its own and its pitch counted off the
 *      samples, rise by at least a semitone a level
 *   3. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the same
 *      numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30 percent above 3 kHz)
 *   4. a device whose audio throws: with Sound on a round still reveals and go on comes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const PATH = '/gauge/index.html?seed=4242&';

/* 1 to 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const hook = await page.evaluate(() => !!(window.GAUGE.audio && window.GAUGE.audio.renderLoud && window.GAUGE.audio.pitchOf));
  say(hook, 'the page exposes what its audio did (GAUGE.audio, with renderLoud and pitchOf)');
  await tap(page, '#start');
  await sleep(200);
  await tap(page, '#left');
  await page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 20000, polling: 'raf' });
  const played = await page.evaluate(() => window.GAUGE.audio.sounded().length);
  say(played === 0, 'a first load is muted: a round answered and revealed played nothing (' + played + ')');
  if (hook) {
    const pitches = await page.evaluate(async () => { const out = []; for (const n of ['detent0', 'detent1', 'detent2', 'detent3']) out.push(await window.GAUGE.audio.pitchOf(n)); return out; });
    const semitone = Math.pow(2, 1 / 12);
    const rising = pitches.every((p, i) => i === 0 || p >= pitches[i - 1] * semitone * 0.99) && pitches[0] > 100 && pitches[3] < 3000;
    say(rising, 'the detent is a place higher each level: detent0 to detent3 measure ' + pitches.map(p => Math.round(p) + ' Hz').join(', ') + ', each at least a semitone above the last');
    const full = await page.evaluate(() => window.GAUGE.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.GAUGE.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const r = half.rms / full.rms;
    say(r > 0.45 && r < 0.55 && half.peak < full.peak * 0.6, 'every voice passes through the master: halving it halves the rms and the peak (' + r.toFixed(3) + ')');
    const again = await page.evaluate(() => window.GAUGE.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    say(rel(again.rms, full.rms) < 0.01 && rel(again.peak, full.peak) < 0.01, 'the same render twice gives the same numbers (rms ' + full.rms.toFixed(4) + ' and ' + again.rms.toFixed(4) + ')');
    say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
    say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
  }
  say(errors.length === 0, 'first load: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4 */
{
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await tap(page, '#start');
  await sleep(200);
  await tap(page, '#right');
  const done = await page.waitForFunction(() => window.GAUGE.revealDone() && getComputedStyle(document.getElementById('next')).visibility !== 'hidden', { timeout: 20000, polling: 'raf' }).then(() => true, () => false);
  say(done, 'a device whose audio throws: the round still reveals and go on comes (' + done + ')');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
