#!/usr/bin/env node
/* THE EAR GATE for CREASE (plans/crease/HANDOFF-CREASE.md P2 and 3.8; the shape of satellites/yonder/test/audio.mjs).
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a clip put down and its reveal play nothing
 *   2. with Sound turned on through its switch, FREEHAND: a clip put down plays one set, one knock and one settle and
 *      nothing more, on a right round and a wrong one alike (the reveal contract: the same on every path)
 *   3. CREASE mode: each fold that changes the strip plays one crease; a fold less at one part and a fold more at twelve
 *      play nothing; a round on a strip creased into many parts still plays one settle (A1)
 *   4. HALFWAY: a side chosen plays set, knock, settle; a round left alone plays knock and settle and no set
 *   5. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the
 *      same numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30 percent above 3 kHz)
 *   6. a device whose audio throws: with Sound on the clip goes down, the reveal completes and next comes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.CREASE && window.CREASE.ready';
const pageFor = mode => ({ path: '/crease/index.html?seed=4242&' + (mode ? 'mode=' + mode + '&' : ''), ready: READY });

const dragClip = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 311, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  for (let i = 1; i <= 6; i++) st.dispatchEvent(new PointerEvent('pointermove', o(x0 + (x1 - x0) * i / 6)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 }).then(() => sleep(250));
const sounded = page => page.evaluate(() => window.CREASE.audio.sounded());
const clear = page => page.evaluate(() => window.CREASE.audio.clear());
const last = page => page.evaluate(() => window.CREASE.results[window.CREASE.results.length - 1] || null);
const soundOn = async page => {
  await tap(page, '.lw-settings-open');
  await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close');
  await sleep(120);
};

/* 1, 2, 5: FREEHAND */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor('')));
  const hook = await page.evaluate(() => !!(window.CREASE.audio && window.CREASE.audio.renderLoud && window.CREASE.audio.sounded));
  say(hook, 'the page exposes what its audio did (CREASE.audio)');
  if (hook) {
    await tap(page, '#start');
    await sleep(200);
    await dragClip(page, 0.5);
    await revealed(page);
    const silent = await sounded(page);
    say(silent.length === 0, 'a first load is muted: a clip put down and its reveal played nothing (' + JSON.stringify(silent) + ')');
    await soundOn(page);
    await tap(page, '#next');
    await sleep(250);
    const paths = [];
    for (const far of [false, true]) {
      await clear(page);
      const t = await page.evaluate(() => window.CREASE.task());
      const truth = t.numerator / t.denominator / t.whole;
      await dragClip(page, far ? (truth > 0.5 ? 0.02 : 0.98) : truth);
      await revealed(page);
      paths.push({ played: await sounded(page), correct: (await last(page)).correct });
      await tap(page, '#next');
      await sleep(250);
    }
    say(paths[0].correct === true && paths[1].correct === false, 'the premise: the near round scored right and the far one wrong (' + paths.map(p => p.correct).join(', ') + ')');
    for (const [i, p] of paths.entries()) {
      say(p.played.join() === 'set,knock,settle', 'with Sound on, a ' + (i ? 'wrong' : 'right') + ' round plays one set, one knock and one settle and nothing more (' + JSON.stringify(p.played) + ')');
    }
    const full = await page.evaluate(() => window.CREASE.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.CREASE.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const ratio = half.rms / full.rms;
    say(ratio > 0.47 && ratio < 0.53 && half.peak < full.peak * 0.55, 'every voice passes through the master: halving it halves the rms and the peak (' + ratio.toFixed(3) + ', ' + full.peak.toFixed(3) + ' to ' + half.peak.toFixed(3) + ')');
    const again = await page.evaluate(() => window.CREASE.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    say(rel(again.peak, full.peak) < 1e-5 && rel(again.rms, full.rms) < 1e-5, 'the same render twice gives the same numbers');
    say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
    say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
  }
  say(errors.length === 0, 'FREEHAND nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3: CREASE mode */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor('crease')));
  await tap(page, '#start');
  await sleep(200);
  await soundOn(page);
  await clear(page);
  for (let i = 0; i < 3; i++) { await tap(page, '#fold-more'); await sleep(80); }
  for (let i = 0; i < 4; i++) { await tap(page, '#fold-less'); await sleep(80); }
  const small = await sounded(page);
  say(small.join() === 'crease,crease,crease,crease,crease,crease', 'three folds more and three less play one crease each, and a fold less at one part plays nothing (' + small.length + ' played)');
  await clear(page);
  for (let i = 0; i < 12; i++) { await tap(page, '#fold-more'); await sleep(60); }
  const parts = await page.evaluate(() => Number(document.getElementById('strip').dataset.parts));
  const big = await sounded(page);
  say(parts === 12 && big.length === 11 && big.every(x => x === 'crease'), 'eleven folds to twelve parts play eleven creases and a fold more at twelve plays nothing (' + big.length + ' played, ' + parts + ' parts)');
  await clear(page);
  await dragClip(page, 0.5);
  await revealed(page);
  const creased = await page.evaluate(() => document.querySelectorAll('#strip .crease').length);
  const round = await sounded(page);
  say(round.join() === 'set,knock,settle' && creased >= 1, 'a clip put down on a creased strip plays one set, one knock and one settle, whatever the creases (' + JSON.stringify(round) + ', ' + creased + ' creases)');
  say(errors.length === 0, 'CREASE mode nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4: HALFWAY */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor('halfway')));
  await tap(page, '#start');
  await sleep(200);
  await soundOn(page);
  await clear(page);
  await tap(page, '#less');
  await revealed(page);
  const chose = await sounded(page);
  say(chose.join() === 'set,knock,settle', 'HALFWAY: a side chosen plays set, knock and settle (' + JSON.stringify(chose) + ')');
  await tap(page, '#next');
  await sleep(250);
  await clear(page);
  const n = await page.evaluate(() => window.CREASE.results.length);
  const came = await page.waitForFunction(n => window.CREASE.results.length > n && window.CREASE.revealDone(), { timeout: 12000 }, n).then(() => true, () => false);
  await sleep(250);
  const alone = await sounded(page), res = await last(page);
  say(came && res.timedOut && alone.join() === 'knock,settle', 'HALFWAY: a round left alone plays knock and settle and no set (' + JSON.stringify(alone) + ', timed out ' + (res && res.timedOut) + ')');
  say(errors.length === 0, 'HALFWAY nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6: audio that throws */
{
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[1], pageFor('')));
  await tap(page, '#start');
  await sleep(200);
  await soundOn(page);
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await dragClip(page, 0.5);
  const done = await revealed(page).then(() => true, () => false);
  const next = await page.evaluate(() => { const b = document.getElementById('next'); return !b.hidden && getComputedStyle(b).visibility !== 'hidden'; });
  const n = await page.evaluate(() => window.CREASE.results.length);
  say(done && next && n === 1, 'a device whose audio throws: the clip goes down, the reveal completes and next comes (' + JSON.stringify({ done, next, results: n }) + ')');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
