#!/usr/bin/env node
/* THE EAR GATE for BRIM (plans/brim/HANDOFF-BRIM.md 3.1 and P2; the shape of satellites/crease/test/audio.mjs).
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a glass chosen and its reveal play nothing
 *   2. with Sound turned on through its switch, MATCHING: a glass chosen plays one tap and one pour, and the reveal one
 *      settle, and nothing more, on a right round and a wrong one alike
 *   3. LEVEL: a split chosen plays one tap, one ring and one settle, and no pour (the water never moves)
 *   4. the level ring is two partials at exactly two to one, measured off the ring rendered offline (within half a percent)
 *   5. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the
 *      same numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30 percent above 3 kHz)
 *   6. a device whose audio throws: with Sound on the glass is chosen, the reveal completes and next comes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { scoreChoice } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.BRIM && window.BRIM.ready';
const pageFor = mode => ({ path: '/brim/index.html?seed=4242&grade=4&mode=' + mode + '&', ready: READY });
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(250));
const sounded = page => page.evaluate(() => window.BRIM.audio.sounded());
const clear = page => page.evaluate(() => window.BRIM.audio.clear());
const soundOn = async page => {
  await tap(page, '.lw-settings-open');
  await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close');
  await sleep(120);
};

/* 1, 2, 4, 5 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor('matching')));
  const hook = await page.evaluate(() => !!(window.BRIM.audio && window.BRIM.audio.renderLoud && window.BRIM.audio.ringPeaks));
  say(hook, 'the page exposes what its audio did (BRIM.audio)');
  if (hook) {
    await tap(page, '#start');
    await sleep(200);
    await tap(page, '#left');
    await revealed(page);
    const silent = await sounded(page);
    say(silent.length === 0, 'a first load is muted: a glass chosen and its reveal played nothing (' + JSON.stringify(silent) + ')');
    await soundOn(page);
    await tap(page, '#next');
    await sleep(250);
    const paths = [];
    for (const wrong of [false, true]) {
      await clear(page);
      const pair = await page.evaluate(() => window.BRIM.pair());
      const larger = scoreChoice(pair, 'left').larger === 'right' ? 'right' : 'left';
      const side = wrong ? (larger === 'left' ? 'right' : 'left') : larger;
      await tap(page, '#' + side);
      await revealed(page);
      paths.push({ played: await sounded(page), correct: (await page.evaluate(() => window.BRIM.results[window.BRIM.results.length - 1])).correct });
      await tap(page, '#next');
      await sleep(250);
    }
    say(paths[0].correct === true && paths[1].correct === false, 'the premise: one round right and one wrong (' + paths.map(p => p.correct).join(', ') + ')');
    for (const [i, p] of paths.entries()) say(p.played.join() === 'tap,pour,settle', 'with Sound on, a ' + (i ? 'wrong' : 'right') + ' round plays one tap, one pour and one settle and nothing more (' + JSON.stringify(p.played) + ')');
    const peaks = await page.evaluate(() => window.BRIM.audio.ringPeaks());
    const ratio = peaks[1] / peaks[0];
    say(Math.abs(ratio - 2) <= 0.01, 'the level ring is two partials at two to one (' + peaks.join(' and ') + ' Hz, ratio ' + ratio.toFixed(4) + ')');
    const full = await page.evaluate(() => window.BRIM.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.BRIM.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const r = half.rms / full.rms;
    say(r > 0.47 && r < 0.53 && half.peak < full.peak * 0.55, 'every voice passes through the master: halving it halves the rms and the peak (' + r.toFixed(3) + ', ' + full.peak.toFixed(3) + ' to ' + half.peak.toFixed(3) + ')');
    const again = await page.evaluate(() => window.BRIM.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    say(rel(again.peak, full.peak) < 1e-5 && rel(again.rms, full.rms) < 1e-5, 'the same render twice gives the same numbers');
    say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
    say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
  }
  say(errors.length === 0, 'MATCHING nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor('level')));
  await tap(page, '#start');
  await sleep(200);
  await soundOn(page);
  await clear(page);
  await tap(page, '#splits .split[data-k="3"]');
  await revealed(page);
  const played = await sounded(page);
  say(played.join() === 'tap,ring,settle', 'LEVEL: a split chosen plays one tap, one ring and one settle, and no pour (' + JSON.stringify(played) + ')');
  say(errors.length === 0, 'LEVEL nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 */
{
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[1], pageFor('matching')));
  await tap(page, '#start');
  await sleep(200);
  await soundOn(page);
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await tap(page, '#left');
  const done = await revealed(page).then(() => true, () => false);
  const next = await page.evaluate(() => { const b = document.getElementById('next'); return !b.hidden && getComputedStyle(b).visibility !== 'hidden'; });
  const n = await page.evaluate(() => window.BRIM.results.length);
  say(done && next && n === 1, 'a device whose audio throws: the glass is chosen, the reveal completes and next comes (' + JSON.stringify({ done, next, results: n }) + ')');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
