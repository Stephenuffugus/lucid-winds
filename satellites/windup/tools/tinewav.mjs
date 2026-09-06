#!/usr/bin/env node
/* THE ONE THING NO GATE CAN DO: make a sound a person can listen to.
 *
 *   node tools/tinewav.mjs
 *
 * Renders one C4, one C5 and the first bar of Twinkle at the auto tempo into
 * docs/shots/p0-tine.wav, which Stephen listens to in the morning. The design
 * says one note must sound like a memory, and that is his ear and not an
 * assertion. Everything the gates CAN say is in test/tine.mjs.
 *
 * ⛔ mono at the full sample rate rather than stereo at half. Halving the rate
 * would fold the shimmer partial of the top tine, at twelve times a C6, back
 * down into the middle of the tune as an audible whistle: a file made to be
 * judged by ear must not have an artefact in it that the game does not.
 */
import { serve, open, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SR = 44100;
const site = await serve();
const { browser, page } = await open(site.base, { width: 375, height: 667 });

const rendered = await page.evaluate(async (SR) => {
  const S = window.WINDUP_TEST.sim();
  const per = 60 / window.WINDUP_TEST.config().AUTO_BPM / 2;
  const strip = S.newStrip(S.STARTERS.twinkle);
  const secs = 10.0;
  const ctx = new OfflineAudioContext(2, Math.round(SR * secs), SR);
  const A = window.WINDUP_TEST.buildAudio(ctx);
  /* one low note on its own, then one an octave up, then the tune */
  window.WINDUP_TEST.tine(A, 0, 0.05, 0);
  window.WINDUP_TEST.tine(A, 7, 2.6, 1);
  const start = 5.0;
  let n = 0;
  for (let i = 0; i < strip.holes.length; i++) {
    const t = start + strip.holes[i][0] * per;
    if (t > secs - 0.4) break;
    window.WINDUP_TEST.tine(A, strip.holes[i][1], t, i);
    n++;
  }
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  const mono = new Array(L.length);
  let peak = 0;
  for (let i = 0; i < L.length; i++) {
    const v = (L[i] + R[i]) / 2;
    mono[i] = v;
    if (Math.abs(v) > peak) peak = Math.abs(v);
  }
  return { mono, peak, notes: n, seconds: secs };
}, SR);

await browser.close();
site.close();

/* 16 bit PCM, written by hand: no library for forty four bytes of header */
const n = rendered.mono.length;
const bytes = Buffer.alloc(44 + n * 2);
bytes.write('RIFF', 0);
bytes.writeUInt32LE(36 + n * 2, 4);
bytes.write('WAVE', 8);
bytes.write('fmt ', 12);
bytes.writeUInt32LE(16, 16);
bytes.writeUInt16LE(1, 20);          /* PCM */
bytes.writeUInt16LE(1, 22);          /* mono */
bytes.writeUInt32LE(SR, 24);
bytes.writeUInt32LE(SR * 2, 28);
bytes.writeUInt16LE(2, 32);
bytes.writeUInt16LE(16, 34);
bytes.write('data', 36);
bytes.writeUInt32LE(n * 2, 40);
/* normalised to a comfortable listening level, never past full scale */
const gain = rendered.peak > 0 ? Math.min(3, 0.86 / rendered.peak) : 1;
for (let i = 0; i < n; i++) {
  const v = Math.max(-1, Math.min(1, rendered.mono[i] * gain));
  bytes.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
}
/* ⛔ MEASURE THE FILE YOU ARE ASKING A PERSON TO LISTEN TO. A wav that is ten
   seconds of the wrong note, or of one note played twice, wastes the only ear
   in the studio. Autocorrelation over a window of each note says what pitch is
   actually in there. */
function pitchAt(samples, from, seconds) {
  const a = Math.round(from * SR), n = Math.round(seconds * SR);
  const lo = Math.round(SR / 1200), hi = Math.round(SR / 150);
  let best = 0, bestLag = lo;
  for (let lag = lo; lag <= hi; lag++) {
    let s = 0;
    for (let i = 0; i < n - lag; i += 2) s += samples[a + i] * samples[a + i + lag];
    if (s > best) { best = s; bestLag = lag; }
  }
  return SR / bestLag;
}
const heardLow = pitchAt(rendered.mono, 0.15, 0.35);
const heardHigh = pitchAt(rendered.mono, 2.7, 0.35);
const wantLow = 261.63, wantHigh = 523.25;
const offLow = Math.abs(heardLow - wantLow) / wantLow * 100;
const offHigh = Math.abs(heardHigh - wantHigh) / wantHigh * 100;
console.log('  the first note measures ' + heardLow.toFixed(1) + ' Hz (middle C is '
  + wantLow + ', off by ' + offLow.toFixed(1) + ' percent)');
console.log('  the second measures ' + heardHigh.toFixed(1) + ' Hz (the C above is '
  + wantHigh + ', off by ' + offHigh.toFixed(1) + ' percent)');
if (offLow > 3 || offHigh > 3) {
  console.log('REFUSING TO WRITE IT: the file does not contain the notes it claims');
  process.exit(1);
}

const out = join(ROOT, 'docs', 'shots', 'p0-tine.wav');
writeFileSync(out, bytes);
console.log('  p0-tine.wav  ' + (bytes.length / 1024).toFixed(0) + ' KB  '
  + rendered.seconds + ' s mono at ' + SR + ', peak ' + rendered.peak.toFixed(3)
  + ' lifted by ' + gain.toFixed(2) + ', ' + rendered.notes + ' notes of Twinkle');
if (bytes.length > 1024 * 1024) { console.log('OVER THE 1 MB LIMIT'); process.exit(1); }
if (rendered.peak < 0.02) { console.log('THE FILE IS SILENT'); process.exit(1); }
console.log('WAV OK');
