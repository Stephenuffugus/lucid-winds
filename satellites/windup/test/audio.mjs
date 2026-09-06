#!/usr/bin/env node
/* THE EAR GATE. Does this music box sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause there was a trill oscillator wired straight into an envelope gain,
 * so a chirp written in the code as 0.022 was a half scale 4 kHz tone chopped
 * at thirty hertz, on the band where a phone speaker is loudest. Every gate in
 * that game was green, because counting voices says nothing about their level.
 *
 * So this gate listens. WINDUP_TEST.renderAudio renders the LOUDEST PASSAGE the
 * box can make into an OfflineAudioContext through the same buildAudio, tine,
 * bed and bedTicks the speaker hears, plate and limiter and ceiling and all,
 * and hands back three numbers:
 *
 *   peak          the loudest sample, so the phone is not clipping
 *   rms           the level of the whole take, so it is audible not shouting
 *   highFraction  the share of energy above 3 kHz, where an alarm lives
 *
 * The passage is the crank held at the speed bedLevel clamps to plus all
 * fifteen tines struck together every two steps for ten seconds, which is the
 * loudest strip a player can punch, played faster than a hand can turn.
 *
 * ⛔ NEVER MEASURE A WAV MADE FOR THE EAR. tools/tinewav.mjs NORMALISES the file
 * it writes, so its peak is the tool's and not the game's: a reading of 0.86 off
 * that file once said the game was loud on a day the game was clipping, which is
 * a different fault. Everything here comes off the game's own functions.
 *
 * ⛔⛔ WHAT THIS GATE FOUND THE HOUR IT WAS WRITTEN. The waveshaper on the end of
 * the chain, the node whose comment calls it the ceiling, had the curve
 * 0.95 * tanh(1.6x) / tanh(1.6), whose SLOPE AT THE ORIGIN IS 1.649. It was a
 * four and a third decibel BOOST on everything quiet enough not to reach its
 * knee, so CONFIG.MASTER 0.5 was really 0.82. And it ran with oversample '2x',
 * whose reconstruction filter rings past the curve's own bound. Together they
 * rendered PEAK 1.364, RMS 0.335 on the passage below: clipping, on the fleet's
 * quietest game, four days after the fire alarm. Fixed Sep 07 (unity slope,
 * memoryless shaper): 0.744 and 0.216.
 */
import { serve, open, reporter } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base);
const { fails, say } = reporter();

say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));

const m = await page.evaluate(() => window.WINDUP_TEST.renderAudio(10));
console.log('  ---   ten seconds, fifteen tines every two steps, crank flat out:'
  + '  peak ' + m.peak.toFixed(3) + '  rms ' + m.rms.toFixed(4)
  + '  above 3 kHz ' + (m.highFraction * 100).toFixed(2) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.744, which is not a coincidence: it is exactly
   the value of the ceiling's own curve at full scale, so the shaper is now a
   real bound and the number is the design rather than an accident of the take.
   The band is 0.90 rather than 1.0 because a phone's limiter starts working
   before full scale and a mix that touches 1.0 in a headless render is already
   distorting on a speaker. What it forbids, all three measured: the 1.364 of
   the boosting curve, the 1.022 the 2x oversampler rang to over a 0.744 bound,
   and any voice added AFTER the ceiling, which would not be bounded at all. */
say(m.peak < 0.90, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.90)');
say(m.peak > 0.10, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.10)');

/* 2. THE LEVEL. Measured rms 0.2161 on a passage no melody is: fifteen notes at
   once, sixteen times, over the crank. The band is 0.02 to 0.30. The floor says
   the box is audible on a phone at half volume in a room with people in it. The
   ceiling is set BELOW the 0.335 this measured while the ceiling node was
   boosting, so the same class of fault is caught by the level as well as by the
   peak; CONFIG.MASTER doubled to 1.0 also goes through it. */
say(m.rms > 0.02 && m.rms < 0.30, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.02 to 0.30)');

/* 3. NOT AN ALARM. Measured 1.33 percent of the take's energy above 3 kHz. A
   comb is fifteen sines from 262 to 1046 Hz with two inharmonic partials each;
   the only things up there at all are the shimmer at twelve times the
   fundamental, the pin's three millisecond click above CLICK_HP_HZ and the
   pin wheel's 2200 Hz tick. The render is deterministic, seed and hole index and
   all, so the number is the same on every run and the band can be close: 3
   percent, a little over twice the measurement. ⛔ IT WAS 6 AND THAT WAS
   DECORATION. The mutation written to turn it red, SHIMMER_GAIN 0.03 to 0.5,
   which is a sixteen times louder ring at twelve times the fundamental,
   measured 4.67 percent and went straight through 6. At 3 it is red. What the
   band forbids: SHIMMER_GAIN opened past about a quarter, the pin click's
   highpass raised with its level, the pin wheel's 2200 Hz tick moved into the
   whistle band, or any new voice that is a bare high sine. */
say(m.highFraction < 0.03, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 3)');

/* 4. AND THE BED ON ITS OWN IS A BED. The crank's noise loop and pin wheel
   ticks with no tines over them measured peak 0.033, rms 0.0070. It is mostly
   high, 33 percent above 3 kHz, which is what a ratchet is, and it is allowed
   to be because at this level it is under everything. The band says it must
   stay under everything: a bed that reaches 0.15 is a hiss the player hears
   instead of the music. */
const bed = await page.evaluate(() => window.WINDUP_TEST.renderAudio(10, { rows: 0, crank: 8 }));
console.log('  ---   the crank alone: peak ' + bed.peak.toFixed(3) + '  rms ' + bed.rms.toFixed(4)
  + '  above 3 kHz ' + (bed.highFraction * 100).toFixed(1) + ' percent');
say(bed.rms > 0.001, 'the crank is there at all: rms ' + bed.rms.toFixed(4) + ' (over 0.001)');
say(bed.peak < 0.15, 'and it stays under the music: peak ' + bed.peak.toFixed(3) + ' (under 0.15)');

await browser.close();
site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
