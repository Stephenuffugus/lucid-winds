#!/usr/bin/env node
/* THE EAR GATE for GLIMPSE (plans/glimpse/HANDOFF-GLIMPSE.md 3.1, GL2; the shape of satellites/brim/test/audio.mjs).
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * GL2, the handoff's easiest fatal mistake: one sound a flash, never one a firefly, so no child counts by ear.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a flash and its round play nothing
 *   2. with Sound turned on through its switch, every flash in every mode plays exactly one blink, whatever its count, from
 *      one firefly to a SPREAD of ten and ten
 *   3. every voice passes through the master (half the master, half the rms and the peak); the same render twice gives the
 *      same numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an alarm (under 30 percent above 3 kHz)
 *   4. a device whose audio throws: with Sound on the flash still shows, the pads wake and a round completes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const pageFor = mode => ({ path: '/glimpse/index.html?seed=4242&mode=' + mode + '&', ready: READY });
const answerable = page => page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
const revealed = page => page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 }).then(() => sleep(100));
const soundOn = async page => {
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
};
const firstPad = page => page.evaluate(() => document.querySelector('.pad').dataset.value);

/* 1 and 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor('flash')));
  const hook = await page.evaluate(() => !!(window.GLIMPSE.audio && window.GLIMPSE.audio.renderLoud));
  say(hook, 'the page exposes what its audio did (GLIMPSE.audio)');
  await tap(page, '#start');
  await answerable(page);
  say((await page.evaluate(() => window.GLIMPSE.audio.sounded())).length === 0, 'a first load is muted: a flash played nothing');
  if (hook) {
    const full = await page.evaluate(() => window.GLIMPSE.audio.renderLoud(20, 1));
    const half = await page.evaluate(() => window.GLIMPSE.audio.renderLoud(20, 0.5));
    console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
    const r = half.rms / full.rms;
    say(r > 0.47 && r < 0.53 && half.peak < full.peak * 0.55, 'every voice passes through the master: halving it halves the rms and the peak (' + r.toFixed(3) + ')');
    const again = await page.evaluate(() => window.GLIMPSE.audio.renderLoud(20, 1));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
    say(rel(again.peak, full.peak) < 1e-5 && rel(again.rms, full.rms) < 1e-5, 'the same render twice gives the same numbers');
    say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
    say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
  }
  say(errors.length === 0, 'first load: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 2 */
for (const mode of ['flash', 'groups', 'frame', 'spread']) {
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], pageFor(mode)));
  await tap(page, '#start');
  await answerable(page);
  await soundOn(page);
  const rows = [];
  for (let i = 0; i < 4; i++) {
    await tap(page, '.pad[data-value="' + (await firstPad(page)) + '"]');
    await revealed(page);
    await page.evaluate(() => window.GLIMPSE.audio.clear());
    await tap(page, '#next');
    await page.waitForFunction(i => window.GLIMPSE.round() === i + 1, { timeout: 10000 }, i);
    await answerable(page);
    const x = await page.evaluate(() => window.GLIMPSE.current());
    rows.push({ count: x.mode === 'spread' ? x.a.n + x.b.n : x.count, sounds: await page.evaluate(() => window.GLIMPSE.audio.sounded()) });
  }
  say(rows.every(x => x.sounds.join() === 'blink'), mode + ': with Sound on, every flash plays one blink whatever its count (' + rows.map(x => x.count + ' fireflies, ' + x.sounds.length).join('; ') + ')');
  say(errors.length === 0, mode + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4 */
{
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[1], pageFor('flash')));
  await soundOn(page);
  await page.evaluate(() => { const Bad = function () { throw new Error('no audio on this device'); }; window.AudioContext = Bad; window.webkitAudioContext = Bad; });
  await tap(page, '#start');
  const woke = await answerable(page).then(() => true, () => false);
  if (woke) await tap(page, '.pad[data-value="' + (await firstPad(page)) + '"]');
  const done = await revealed(page).then(() => true, () => false);
  const n = await page.evaluate(() => window.GLIMPSE.results.length);
  const shown = (await page.evaluate(() => window.GLIMPSE.flashLog())).length;
  say(woke && done && n === 1 && shown === 1, 'a device whose audio throws: the flash shows, the pads wake and the round completes (' + JSON.stringify({ shown, woke, done, results: n }) + ')');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
