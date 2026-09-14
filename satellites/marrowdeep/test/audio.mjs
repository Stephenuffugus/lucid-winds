#!/usr/bin/env node
/* THE EAR GATE. Does the deep sound like a smoke detector.
 *
 *   node test/audio.mjs        (under the gate lock: it opens a browser)
 *
 * Three games in this fleet shipped clipped with every gate green on Sep 07,
 * because a fresh GainNode's gain is ONE and a voice count says nothing about
 * how loud a voice is; a fourth had chirps that "made everybody in my house
 * flinch". So this gate listens, in the form Fathom's does.
 *
 * MD_DEV.renderAudio renders the LOUDEST MINUTE the game can make (a Depth V
 * boss round every six seconds: tumbles, surges, a pass and a fail, Strain, a
 * break, four strikes, a death, Renown, Marrow, a drop and a Trait) into an
 * OfflineAudioContext through the SAME VOICES and the same 0.7 master the
 * speaker uses. MD_DEV.audioRoll renders every voice once, alone, spaced, which
 * catches a voice the loud minute never plays (won, wiped, legacy, scar, bench).
 *
 * ⛔ NEVER MEASURE A WAV MADE FOR THE EAR. tools/ear.mjs writes one for
 * listening; a render tool that normalises hands back its own peak. Everything
 * measured here comes out of the game's own functions into the offline buffer.
 *
 * Each band below says what was MEASURED and what it forbids.
 */
import { serve, open, reporter } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();

say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));

const m = await page.evaluate(() => window.MD_DEV.renderAudio(60));
console.log('  ---   the loud minute: peak ' + m.peak.toFixed(3) + '  rms ' + m.rms.toFixed(4)
  + '  above 3 kHz ' + (m.highFraction * 100).toFixed(2) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.337 (Sep 14, the score on the clock). The ceiling is 0.90, not 1.0: a
   phone's limiter starts before full scale, so a mix touching 1.0 headless is
   already distorting on a speaker. What it forbids: an envelope that starts
   after its oscillator (the voice plays at gain one until it does), a master
   doubled and doubled again, a voice's peak written as 1. */
say(m.peak < 0.90, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.90)');
say(m.peak > 0.10, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.10)');

/* 2. THE LEVEL. Measured rms 0.0457 over the minute. The floor says the deep can
   be heard on a phone at half volume in a room with people in it; the ceiling
   is under three times the measurement, so a mix pushed to shouting is caught by
   its level as well as its peak. */
say(m.rms > 0.010 && m.rms < 0.12, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.010 to 0.12)');

/* 3. NOT AN ALARM. Measured 0.09 percent of the minute's energy above 3 kHz, by
   the one pole difference in renderAudio. This game is wood ticks through a
   1800 Hz lowpass, low sines and triangles, a 2600 Hz chain snap: it belongs
   under 3 kHz. The ceiling is 10 percent, the fleet's line (Fathom's), far
   under the 82 percent the cricket that started all this measured. What it
   forbids: a surge or a drop moved up into the whistle band, a square wave
   where a triangle was, a bare high sine. */
say(m.highFraction < 0.10, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 10)');

/* 4. EVERY VOICE ALONE. Measured peaks 0.037 (tumble) to 0.304 (death), and a
   high share of at most 1.09 percent (surge). A voice alone over 0.5 is a half
   scale event, which is the class that makes a room flinch even when the minute
   averages it away; a voice under 0.01 has gone silent (a voice with no
   envelope target, or one wired to nothing). The window for each voice is its
   own 1.6 seconds in the roll, measured in the page. */
const voices = await page.evaluate(async () => {
  const roll = await window.MD_DEV.audioRoll();
  const d = roll.samples, sr = roll.sampleRate, out = [];
  roll.names.forEach((name, i) => {
    const a = Math.floor((0.4 + i * roll.gap - 0.05) * sr);
    const b = Math.min(d.length, Math.floor((0.4 + (i + 1) * roll.gap - 0.05) * sr));
    let peak = 0, sum = 0, hi = 0, prev = d[a - 1] || 0;
    for (let k = a; k < b; k++) { const v = d[k]; if (Math.abs(v) > peak) peak = Math.abs(v); sum += v * v; hi += (v - prev) * (v - prev); prev = v; }
    out.push({ name, peak, high: sum > 0 ? hi / sum : 0 });
  });
  return out;
});
const loud = voices.filter(v => v.peak >= 0.5), mute = voices.filter(v => v.peak <= 0.01), shrill = voices.filter(v => v.high >= 0.10);
const fmt = v => v.name + ' ' + v.peak.toFixed(3);
say(voices.length > 0 && loud.length === 0, 'no voice alone reaches half scale (' + voices.length + ' voices, loudest '
  + fmt(voices.slice().sort((x, y) => y.peak - x.peak)[0] || { name: 'none', peak: 0 }) + ')' + (loud.length ? ': ' + loud.map(fmt).join(', ') : ''));
say(voices.length > 0 && mute.length === 0, 'and none has gone silent' + (mute.length ? ': ' + mute.map(fmt).join(', ') : ''));
say(voices.length > 0 && shrill.length === 0, 'and none of them alone is an alarm (under 10 percent above 3 kHz)'
  + (shrill.length ? ': ' + shrill.map(v => v.name + ' ' + (v.high * 100).toFixed(1) + ' percent').join(', ') : ''));

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
