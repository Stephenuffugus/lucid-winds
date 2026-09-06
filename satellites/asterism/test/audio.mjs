#!/usr/bin/env node
/* THE EAR GATE. Does this sky sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause there was a trill oscillator wired straight into an envelope gain,
 * so a chirp written in the code as 0.022 was a half scale 4 kHz tone chopped
 * at thirty hertz, which is the exact voice of a smoke alarm, on the band where
 * a phone speaker is loudest. Every gate in that game was green. Asterism
 * counts VOICES, and a voice count says nothing at all about how loud a voice
 * is.
 *
 * So this gate listens. ASTERISM_DEV.renderAudio renders the sky's LOUDEST
 * MINUTE into an OfflineAudioContext through the same start, chime, scratch and
 * swell the speaker uses, air tone and all, and hands back three numbers:
 *
 *   peak          the loudest sample, so the phone is not clipping
 *   rms           the whole minute's level, so it is audible but not shouting
 *   highFraction  the share of energy above 3 kHz, where an alarm lives
 *
 * ⛔ NEVER MEASURE A WAV MADE FOR THE EAR. A render tool normalises its file,
 * so its peak is the tool's and not the game's: a sibling game measured 0.86
 * off a normalised wav while the game itself was clipping. Everything here is
 * rendered from the game's own functions into the offline buffer.
 *
 * The bands below are written around what was MEASURED, and each says what it
 * forbids. A band drawn round today's number with no thought about what it
 * would catch is decoration.
 */
import { serve, open, reporter } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();

say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));

const m = await page.evaluate(() => window.ASTERISM_DEV.renderAudio(60));
console.log('  ---   sixty seconds: peak ' + m.peak.toFixed(3) + '  rms ' + m.rms.toFixed(4)
  + '  above 3 kHz ' + (m.highFraction * 100).toFixed(1) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.372 on the loudest minute the code can arrange:
   a star chimed four times a second across the chime's whole magnitude range, a
   scratch twice a second on top of it, a myth swell every six seconds, over the
   air tone the whole app sits in. Nobody draws that fast. The ceiling is 0.90
   rather than 1.0 because a phone's own limiter starts working before full
   scale and a mix that touches 1.0 in a headless render is already distorting
   on a speaker.
   ⛔ THE FIRST TIME THIS RAN IT MEASURED 1.907 AND WENT RED, and it was right:
   the swell started its second and third sine at t0 while their envelopes began
   80 and 160 ms later, so both went to the master at AMPLITUDE ONE for that
   long. Every other gate in this game was green through it, the voice count
   included. Fixed Sep 07 (a voice starts when its envelope starts), 1.907 to
   0.372. Raising the master from 0.9 to 1.0 breaks this again, and so does the
   next envelope that starts after the oscillator it is supposed to shape. */
say(m.peak < 0.90, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.90)');
say(m.peak > 0.05, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.05)');

/* 2. THE LEVEL. Measured rms 0.0491. The band is 0.010 to 0.12. The floor says
   a star can be heard at all on a phone at half volume with a window open; the
   ceiling is set BELOW the 0.139 this measured while the swell was blasting, so
   the same class of fault is caught by the level as well as by the peak, and a
   doubled master or a chime peak taken from 0.22 towards 1 goes straight
   through it. */
say(m.rms > 0.010 && m.rms < 0.12, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.010 to 0.12)');

/* 3. NOT AN ALARM. Measured 0.35 percent of the minute's energy above 3 kHz.
   This sky is a 340 Hz low passed air tone, a chime between 330 and 880, a
   2 kHz bandpassed scratch and a swell at 110 to 220: it belongs below 3 kHz,
   and the only thing near the band at all is the scratch's skirt. The ceiling
   is 10 percent, nearly thirty times the measurement and still far below
   anything that reads as a chirp (the cricket that started all this measured 82
   percent). What it forbids: a chime pitched up into the whistle band, the
   scratch bandpass moved from 2000 to 5000, or any new voice that is a bare
   high sine. */
say(m.highFraction < 0.10, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 10)');

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
