#!/usr/bin/env node
/* THE EAR GATE for HUSH (plans/hush/HANDOFF-HUSH.md H4 and section 4; the shape of satellites/glimpse/test/audio.mjs).
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * H4: a false alarm is a dry snap, never a startle or an alarm. How many sounds a trial plays is test/step.mjs's law; this gate
 * is the sound itself.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): four trials with presses play nothing
 *   2. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the same
 *      numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30 percent above 3 kHz)
 *   3. a device whose audio throws: with Sound on, a press on a go pose is still a hit and the creature still comes a step
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const PATH = '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&';
const run = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
const poseUp = (page, i) => page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.i === k && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' }, i);
const scored = (page, i) => page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 20000, polling: 'raf' }, i);
const soundOn = async page => {
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
};

/* 1 and 2 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const hook = await page.evaluate(() => !!(window.HUSH.audio && window.HUSH.audio.renderLoud));
  say(hook, 'the page exposes what its audio did (HUSH.audio)');
  await tap(page, '#start');
  for (let i = 0; i < 4; i++) { await poseUp(page, i); await tap(page, '#stone'); await scored(page, i); }
  const muted = await page.evaluate(() => ({ sounded: window.HUSH.audio.sounded().length, outcomes: window.HUSH.trials().map(t => t.outcome) }));
  say(muted.sounded === 0 && muted.outcomes.length === 4, 'a first load is muted: four trials with presses played nothing (' + JSON.stringify(muted) + ')');
  if (hook) {
    const full = await page.evaluate(() => window.HUSH.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.HUSH.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const r = half.rms / full.rms;
    say(r > 0.47 && r < 0.53 && half.peak < full.peak * 0.55, 'every voice passes through the master: halving it halves the rms and the peak (' + r.toFixed(3) + ')');
    const again = await page.evaluate(() => window.HUSH.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    /* the snap and the breath are noise drawn at render time, so the same render twice is the same only within the noise */
    say(rel(again.peak, full.peak) < 0.25 && rel(again.rms, full.rms) < 0.05, 'the same render twice gives the same loudness, within the noise the snap and the breath are made of (rms ' + full.rms.toFixed(4) + ' and ' + again.rms.toFixed(4) + ')');
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
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await tap(page, '#start');
  const firstGo = run.findIndex(t => t.type === 'go');
  let reached = true;
  for (let i = 0; i <= firstGo && reached; i++) {
    reached = await poseUp(page, i).then(() => true, () => false);
    if (reached && i === firstGo) await tap(page, '#stone');
    if (reached) reached = await scored(page, i).then(() => true, () => false);
  }
  const t = reached ? (await page.evaluate(() => window.HUSH.trials()))[firstGo] : null;
  say(reached && !!t && t.outcome === 'hit' && t.stepsAfter >= 1, 'a device whose audio throws: a press on a go pose is still a hit and the creature still comes a step (' + JSON.stringify(t && { outcome: t.outcome, steps: t.stepsAfter }) + ')');
  const real = errors.filter(e => !/no audio on this device/.test(e));
  say(real.length === 0, 'audio that throws: nothing else landed on the console' + (real.length ? ': ' + real[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
