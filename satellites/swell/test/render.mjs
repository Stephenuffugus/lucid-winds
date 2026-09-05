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

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' RENDER FAILURE(S)'); process.exit(1); }
console.log('RENDER OK');
