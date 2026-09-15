#!/usr/bin/env node
/* THE EAR GATE for YONDER (plans/yonder/HANDOFF-YONDER.md P2; the shape of satellites/span/test/audio.mjs), with Y9 read
 * off the walk voice's own sound.
 *
 *   node test/audio.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a first load is muted (G12): a flag put down and a whole walk play nothing, and no numeral is spoken
 *   2. with Sound turned on through its switch, a flag put down plays ONE plant and ONE walk tone and nothing more
 *      through the walk (A1), on a near round and a far round alike
 *   3. Y9 on the page: each walk's tone runs from pitchFor(placement) to pitchFor(target), the engine's linear pitch,
 *      for the same rounds read in Node
 *   4. Y9 in the sound: the walk voice rendered offline from 0 to the far end is measured by zero crossings at five
 *      evenly spaced moments; the frequencies step up by equal hertz (linear) and not by equal ratios
 *   5. every voice passes through the master (half the master, half the rms and the peak)
 *   6. the same render twice gives the same numbers; nothing clips (peak under 0.9); not silence (over 0.05); not an
 *      alarm (under 30 percent of the energy above 3 kHz)
 *   7. a spoken numeral only by a voice on this device: with no local voice nothing is spoken and the round still
 *      completes
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { pitchFor } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const PAGE = { path: '/yonder/index.html?seed=4242&', ready: 'window.YONDER && window.YONDER.ready' };

/* a real drag of the flag to a fraction of the road */
const dragFlag = (page, frac) => page.evaluate(frac => {
  const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
  const a = st.getBoundingClientRect(), x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const x1 = r.left + r.width * (Number(road.dataset.offset) + frac * Number(road.dataset.width));
  const o = x => ({ pointerId: 41, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y0 });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  for (let i = 1; i <= 6; i++) st.dispatchEvent(new PointerEvent('pointermove', o(x0 + (x1 - x0) * i / 6)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const walked = page => page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 }).then(() => sleep(250));
const sounded = page => page.evaluate(() => window.YONDER.audio.sounded());
const clear = page => page.evaluate(() => window.YONDER.audio.clear());

const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], PAGE));
/* a voice on this device (local or not), so a page that spoke would be heard by the laws below.
   ⛔ the first stub handed the page a plain object for a voice, which the browser's own SpeechSynthesisUtterance refuses
   to take; the utterance is stubbed too, so the page meets a voice it can use */
const stubVoice = (pg, local) => pg.evaluate(local => {
  const voice = { name: 'probe', lang: 'en-US', localService: local, default: true, voiceURI: 'probe' };
  window.__said = [];
  window.SpeechSynthesisUtterance = function (text) { this.text = text; this.voice = null; };
  /* configurable, so a law can swap in a voice that throws (the first stub could not be redefined) */
  Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [voice], configurable: true, writable: true });
  Object.defineProperty(window.speechSynthesis, 'speak', { value: u => window.__said.push({ text: u.text, local: !!(u.voice && u.voice.localService) }), configurable: true, writable: true });
}, local);
await stubVoice(page, true);
const hook =await page.evaluate(() => !!(window.YONDER && window.YONDER.audio && window.YONDER.audio.renderLoud && window.YONDER.audio.renderWalk && window.YONDER.audio.tones));
say(hook, 'the page exposes what its audio did (YONDER.audio)');
if (hook) {
  await tap(page, '#start');
  await sleep(200);
  await dragFlag(page, 0.6);
  await walked(page);
  const silent = await sounded(page), words = await page.evaluate(() => window.YONDER.spoken());
  say(silent.length === 0 && words.length === 0, 'a first load is muted: a flag put down and its walk played nothing and spoke nothing (' + JSON.stringify(silent) + ', ' + words.length + ' spoken)');

  await tap(page, '.lw-settings-open');
  await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close');
  await tap(page, '#next');
  await sleep(250);

  const rounds = [];
  for (const frac of [null, 0.95]) {
    await clear(page);
    const target = await page.evaluate(() => Number(document.getElementById('target').textContent));
    await dragFlag(page, frac === null ? Math.min(1, target / 100 + 0.02) : frac);
    await walked(page);
    rounds.push({ played: await sounded(page), result: await page.evaluate(() => window.YONDER.results[window.YONDER.results.length - 1]) });
    await tap(page, '#next');
    await sleep(250);
  }
  for (const [k, rd] of rounds.entries()) {
    say(rd.played.join() === 'plant,walk', 'with Sound on, round ' + (k + 2) + ' (' + (k ? 'far' : 'near') + '): a flag put down plays one plant and one walk tone and nothing more through its walk (' + JSON.stringify(rd.played) + ')');
  }
  const tones = await page.evaluate(() => window.YONDER.audio.tones());
  const results = await page.evaluate(() => window.YONDER.results);
  /* ⛔ the first version read every walk on the road to 100; this page plays the road to 10, each walk's own road is its max */
  const off = results.map((r, i) => ({ r, t: tones[i] })).filter(({ r, t }) => !t || Math.abs(t.from - pitchFor(r.placement, r.max)) > 1e-6 || Math.abs(t.to - pitchFor(r.target, r.max)) > 1e-6);
  say(tones.length === results.length && off.length === 0, 'each walk\'s tone runs from pitchFor(placement) to pitchFor(target), read in Node (' + tones.length + ' walks, ' + off.length + ' off)');

  const heard = await page.evaluate(() => window.YONDER.audio.renderWalk());
  const steps = heard.slice(1).map((f, i) => f - heard[i]);
  const linear = steps.every(d => Math.abs(d - steps[0]) <= 0.04 * Math.abs(steps[0])) && steps[0] > 0;
  const ratios = heard.slice(1).map((f, i) => f / heard[i]);
  const notRatio = Math.abs(ratios[0] - ratios[ratios.length - 1]) > 0.05;
  say(heard.length === 5 && linear && notRatio, 'the walk voice rendered from 0 to the far end steps up by equal hertz, not equal ratios (Y9) (' + heard.map(f => f.toFixed(0)).join(', ') + ' Hz)');

  const full = await page.evaluate(() => window.YONDER.audio.renderLoud(20, 1));
  const half = await page.evaluate(() => window.YONDER.audio.renderLoud(20, 0.5));
  console.log('  ---   twenty loud seconds: peak ' + full.peak.toFixed(3) + '  rms ' + full.rms.toFixed(4) + '  above 3 kHz ' + (full.highFraction * 100).toFixed(1) + ' percent');
  const ratio = half.rms / full.rms;
  say(ratio > 0.47 && ratio < 0.53 && half.peak < full.peak * 0.55, 'every voice passes through the master: halving it halves the rms and the peak (' + ratio.toFixed(3) + ', ' + full.peak.toFixed(3) + ' to ' + half.peak.toFixed(3) + ')');
  const again = await page.evaluate(() => window.YONDER.audio.renderLoud(20, 1));
  const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
  say(rel(again.peak, full.peak) < 1e-5 && rel(again.rms, full.rms) < 1e-5, 'the same render twice gives the same numbers');
  say(full.peak < 0.9 && full.peak > 0.05, 'nothing clips and it is not silence: peak ' + full.peak.toFixed(3) + ' (between 0.05 and 0.90)');
  say(full.highFraction < 0.3, 'it is not an alarm: ' + (full.highFraction * 100).toFixed(1) + ' percent of its energy above 3 kHz (under 30)');
}
say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();

/* 7: a device with only a server voice, one with a local voice, and one whose voice throws, all with Sound on.
   ⛔ the page's speech once threw inside the walk's frame and the walk never arrived; a voice that throws must leave the
   round whole */
for (const [name, local] of [['a server voice only', false], ['a local voice', true], ['a voice that throws', 'throws']]) {
  const b = await open(s.base, Object.assign({}, SIZES[1], PAGE));
  await stubVoice(b.page, local !== false);
  if (local === 'throws') await b.page.evaluate(() => Object.defineProperty(window.speechSynthesis, 'speak', { value: () => { throw new Error('this voice is broken'); } }));
  await tap(b.page, '.lw-settings-open');
  await sleep(120);
  await tap(b.page, '.lw-settings [data-key="muted"]');
  await tap(b.page, '.lw-settings-close');
  await tap(b.page, '#start');
  await sleep(200);
  await tap(b.page, '#next').catch(() => {});
  await dragFlag(b.page, 0.5);
  await walked(b.page);
  const said = await b.page.evaluate(() => window.__said);
  const done = await b.page.evaluate(() => window.YONDER.walkDone());
  if (local === 'throws') say(done, 'with ' + name + ' the round still completes, the walk arrives and next comes (walk done ' + done + ')');
  else if (local) say(said.length >= 1 && said.every(x => x.local), 'with a local voice the numeral is spoken, and only by that voice (' + JSON.stringify(said) + ')');
  else say(said.length === 0 && done, 'with ' + name + ' nothing is spoken and the round still completes (' + said.length + ' spoken, walk done ' + done + ')');
  await b.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
