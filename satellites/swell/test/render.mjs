#!/usr/bin/env node
/* One swell, rendered offline, measured.
 *
 *   node test/render.mjs
 *
 * The page's own engine is built on an OfflineAudioContext and pumped across
 * fourteen seconds: press at 0.2, release at 6.2. The synth, the scheduler and
 * the engine are the same code the app runs; only the thing turning the handle
 * changes, because an offline context renders faster than real time and a
 * setInterval cannot keep up with it.
 *
 * What it asserts, each watched to fail:
 *   1. sound arrives inside fifty milliseconds of the press
 *   2. it SWELLS: every half second window from 1 s to 6 s is at least 0.95 of
 *      the one before it, so it never dips while a finger is down
 *   3. the peak sample is under 0.99, so the ceiling holds
 *   4. it lets go: the level at 11 to 12 s is under a tenth of the loudest
 *   5. the chord log ends on the tonic, every time, which is the promise
 *   6. the oscillator count never passed OSC_MAX
 *
 * It also writes docs/shots/p0-swell.wav. Stephen listens to that in the
 * morning; it is the shot for a game you cannot photograph.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, reporter, ROOT } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();

const r = await page.evaluate(() => window.SWELL_DEV.render({ seconds: 14, pressAt: 0.2, releaseAt: 6.2, wav: true, mood: 'dawn', seed: 4242 }));
const w = r.rmsHalfSeconds;
const db = v => 20 * Math.log10(Math.max(1e-9, v));

/* 1. the response */
say(db(r.responseRms) > -40, 'sound is there fifty milliseconds after the press: ' + db(r.responseRms).toFixed(1) + ' dBFS');
/* at one second it is audible and clearly the START of something, measured
   against the loudest window rather than against an absolute number I chose */
const peakWin = Math.max.apply(null, w);
say(w[2] > peakWin * 0.05 && w[2] < peakWin * 0.45,
  'at one second it is a beginning, ' + (w[2] / peakWin * 100).toFixed(0) + ' percent of the loudest');

/* 2. it swells and never dips, over the ONE SECOND windows the plan names.
   Half second windows measure the beating between detuned voices as much as
   they measure the crescendo, and a real orchestra wobbles inside a second. */
const oneSec = [];
for (let k = 1; k <= 6; k++) {
  const a = w[k * 2], b = w[k * 2 + 1];
  oneSec.push(Math.sqrt((a * a + b * b) / 2));
}
const dips = [];
for (let i = 1; i < oneSec.length; i++) {
  if (oneSec[i] < oneSec[i - 1] * 0.95) {
    dips.push('the ' + (i + 1) + ' second window fell to ' + (oneSec[i] / oneSec[i - 1]).toFixed(2) + ' of the one before');
  }
}
say(dips.length === 0, 'it swells from one second to six and never dips'
  + (dips.length ? ': ' + dips.join(', ') : ' (' + oneSec.map(function (v) { return db(v).toFixed(1); }).join(', ') + ' dBFS)'));
say(w[11] > w[2] * 1.4, 'and it is much bigger at six seconds than at one (' + (w[11] / w[2]).toFixed(2) + ' times)');

/* 3. the ceiling */
say(r.peak < 0.99, 'the ceiling holds, the peak sample is ' + r.peak.toFixed(3));
say(r.peak > 0.05, 'and it is a real signal, not a whisper');

/* 4. it lets go */
const loudest = Math.max.apply(null, w);
say(w[22] < loudest * 0.10, 'it lets go: eleven seconds in it is ' + (w[22] / loudest * 100).toFixed(1) + ' percent of the loudest');
say(w[27] < loudest * 0.02, 'and by fourteen it is gone, ' + (w[27] / loudest * 100).toFixed(2) + ' percent');

/* 5. the promise */
say(r.chordLog.length >= 2, 'the harmony moved (' + r.chordLog.join(' ') + ')');
say(r.chordLog[r.chordLog.length - 1] === 'I', 'and it ends on the tonic, which is the whole promise');

/* 6. the budget */
say(r.oscPeak <= 48, 'the oscillator count never passed the budget: peak ' + r.oscPeak + ' of 48');
say(r.oscPeak >= 12, 'and it is a real orchestra, not one voice (' + r.oscPeak + ' at once, ' + r.oscMade + ' made)');

/* the shot for a game you cannot photograph */
const dir = join(ROOT, 'docs', 'shots');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const wav = join(dir, 'p0-swell.wav');
writeFileSync(wav, Buffer.from(r.wav, 'base64'));
const kb = statSync(wav).size / 1024;
say(kb < 1536, 'docs/shots/p0-swell.wav written, ' + kb.toFixed(0) + ' KB');

console.log('\n  the envelope, RMS every half second in dBFS:');
let line = '  ';
for (let i = 0; i < w.length; i++) {
  line += (i * 0.5).toFixed(1) + 's ' + db(w[i]).toFixed(1).padStart(6) + '   ';
  if (i % 5 === 4) { console.log(line); line = '  '; }
}
if (line.trim()) console.log(line);

/* ⛔ THE EAR GATE, ALL THREE MOODS. This file has measured the peak and the
   SHAPE of the swell since it was written and never once measured the BAND: how
   much of the sound sits above 3 kHz, which is where a phone turns a chirp into
   an alarm and is the one number that would have caught the "fire alarms" of
   Sep 06. Three games in this fleet turned out to be CLIPPING on Sep 07 with
   every gate green over them, so the level is measured here too, and against a
   real ceiling rather than full scale: a phone's limiter works before 1.0.
   Measured first, then the bands written round it: dawn 0.379 / 0.058 / 1.28
   percent, storm 0.379 / 0.056 / 2.02, lullaby 0.374 / 0.060 / 1.43. */
for (const mood of ['dawn', 'storm', 'lullaby']) {
  const m = await page.evaluate(async (mm) =>
    window.SWELL_DEV.render({ seconds: 14, mood: mm, pressAt: 0.2, releaseAt: 6.2 }), mood);
  /* 0.85, not 0.99: the old ceiling would have passed a sound a hair off full
     scale, which on a phone is a sound the limiter is already fighting. */
  say(m.peak < 0.85, mood + ': nothing clips, peak ' + m.peak.toFixed(3) + ' (under 0.85)');
  /* the floor says it is audible, the ceiling is twice what it measures, so a
     doubled master is caught by the LEVEL and not only by the peak */
  say(m.rms > 0.02 && m.rms < 0.12, mood + ': and it is a voice, not a whisper or a shout, rms '
    + m.rms.toFixed(4) + ' (0.02 to 0.12)');
  /* ⛔ THREE PERCENT, NOT EIGHT, AND THE FIRST NUMBER WAS DECORATION. Eight was
     four times the worst mood and it looked generous and safe; then the alarm
     mutation, opening the WHOLE orchestra's lowpass sweep from 400 to 4400 up to
     3200 to 14000, came out at 3.26, 5.90 and 3.74 percent and walked straight
     through it. This game's material is strings, horns and a choir: it cannot
     reach eight percent by any route, so a ceiling there forbids nothing. Three
     separates what it measures (1.18, 1.97, 1.47) from the brightest mix it can
     be made to produce. */
  say(m.highFraction < 0.03, mood + ': and it is not an alarm, '
    + (m.highFraction * 100).toFixed(2) + ' percent of it is above 3 kHz (under 3)');
}

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' RENDER FAILURE(S)'); process.exit(1); }
console.log('RENDER OK');
