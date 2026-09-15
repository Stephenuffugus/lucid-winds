#!/usr/bin/env node
/* THE EAR GATE for CORE's audio (00-CORE-handoff 2.6; plans/math/HANDOFF-CORE.md 3.6).
 *
 *   node test/audio.mjs
 *
 * Shape from satellites/fathom/test/audio.mjs: the loudest pattern a round can
 * make is rendered OFFLINE through the same voice builders the speaker uses, and
 * three numbers are read off the buffer (peak, rms, the share of energy above
 * 3 kHz, where an alarm lives). Never a wav made for the ear: a render tool
 * normalises its file.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a whole round by thumb plays nothing
 *   2. with Sound turned on through its switch, one commit plays ONE placing
 *      sound and ONE reveal sound, whatever the answer (A1: a quantity is never
 *      a count of sounds; reveal rule 4: the same on every path)
 *   3. every voice passes through the master: the loud pattern rendered at
 *      master 1.0 and 0.5 halves in rms AND in peak. ⛔ The noise is SEEDED for
 *      both renders from the first line of this gate (Wardian's peak law was a
 *      coin toss for a week because its two renders heard two different noises)
 *   4. nothing clips (peak under 0.9) and it is not silence (peak over 0.05)
 *   5. it is not an alarm: under 30 percent of the energy above 3 kHz
 */
import { serve, open, reporter, tap, SIZES, sleep } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

async function roundByThumb(page) {
  await page.evaluate(() => {
    const stone = document.querySelector('#stage .lw-stone'), st = document.getElementById('stage');
    const sr = stone.getBoundingClientRect(), b = st.getBoundingClientRect();
    const sx = sr.left + sr.width / 2, sy = sr.top + sr.height / 2, tx = b.left + CORE_DEMO.pixelFor(0.4);
    const fire = (type, x) => stone.dispatchEvent(new PointerEvent(type,
      { pointerId: 51, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: sy }));
    fire('pointerdown', sx); fire('pointermove', (sx + tx) / 2); fire('pointermove', tx); fire('pointerup', tx);
  });
  await page.waitForFunction(() => CORE_DEMO.revealDone(), { timeout: 30000 });
}

const { browser, page, errors } = await open(s.base, SIZES[1]);
const hook = await page.evaluate(() => !!(window.CORE_DEMO && CORE_DEMO.audio && CORE_DEMO.audio.sounded));
say(hook, 'the demo exposes what its audio did (CORE_DEMO.audio)');
if (hook) {
  await roundByThumb(page);
  const silent = await page.evaluate(() => CORE_DEMO.audio.sounded());
  say(silent.length === 0, 'a first load is muted: a whole round played nothing (' + JSON.stringify(silent) + ')');

  await tap(page, '.lw-settings-open');
  await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close');
  await page.evaluate(() => CORE_DEMO.next());
  await sleep(150);
  await page.evaluate(() => CORE_DEMO.audio.clear());
  await roundByThumb(page);
  const played = await page.evaluate(() => CORE_DEMO.audio.sounded());
  const count = n => played.filter(p => p === n).length;
  say(count('place') === 1 && count('reveal') === 1 && played.length === 2,
    'with Sound on, one commit plays one placing sound and one reveal sound (' + JSON.stringify(played) + ')');

  const full = await page.evaluate(() => CORE_DEMO.audio.renderLoud(20, 1));
  const half = await page.evaluate(() => CORE_DEMO.audio.renderLoud(20, 0.5));
  console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4)
    + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
  const ratio = half.rms / full.rms;
  say(ratio > 0.47 && ratio < 0.53, 'every voice passes through the master: halving it halves the level (ratio ' + ratio.toFixed(3) + ')');
  say(half.peak < full.peak * 0.55, 'and the peak comes down with it: ' + full.peak.toFixed(3) + ' to ' + half.peak.toFixed(3));
  /* ⛔ not exact equality: Chrome's offline renderer is not bit identical from one render to the next. A probe of
     three renders of the same seeded pattern read peaks 0.24540889, 0.24540892, 0.24540888 and rms agreeing to eleven
     digits, so the first version of this law went red on float jitter. Unseeded noise moves a peak by far more than
     one part in a hundred thousand; the planted Math.random is what proves this bound can still see it. */
  const again = await page.evaluate(() => CORE_DEMO.audio.renderLoud(20, 1));
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
