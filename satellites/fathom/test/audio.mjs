#!/usr/bin/env node
/* THE EAR GATE. Does this cave sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause there was a trill oscillator wired straight into an envelope gain,
 * so a chirp written in the code as 0.022 was a half scale 4 kHz tone chopped
 * at thirty hertz, which is the exact voice of a smoke alarm, on the band where
 * a phone speaker is loudest. Every gate in that game was green. Fathom counts
 * VOICES, and a voice count says nothing at all about how loud a voice is.
 *
 * So this gate listens. FATHOM_DEV.renderAudio renders the cave's LOUDEST
 * MINUTE into an OfflineAudioContext through the same start, ping, hum,
 * singback, pickup, caught, bindLurkers, updateLurkers and ambient the speaker
 * uses, drone and echo bus and all, and hands back three numbers:
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

const m = await page.evaluate(() => window.FATHOM_DEV.renderAudio(60));
console.log('  ---   sixty seconds: peak ' + m.peak.toFixed(3) + '  rms ' + m.rms.toFixed(4)
  + '  above 3 kHz ' + (m.highFraction * 100).toFixed(1) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.422 on the loudest minute the code can arrange:
   eight lurkers at zero distance, a stone every half second into an echo bus
   with the room at its longest, a hum on its own cooldown, a singback at full
   volume, a pickup a second and a catch every eight. The ceiling is 0.90 rather
   than 1.0 because a phone's own limiter starts working before full scale and a
   mix that touches 1.0 in a headless render is already distorting on a speaker.
   ⛔ THE FIRST TIME THIS RAN IT MEASURED 1.293 AND WENT RED, and it was right:
   the singback started its second and third sine at t0 while their envelopes
   began 45 and 90 ms later, so both went to the master at AMPLITUDE ONE for
   that long. Fixed Sep 07 (a voice starts when its envelope starts), 1.293 to
   0.422. Raising the master from 0.8 to 1.0 breaks this again, and so does the
   next envelope that starts after the oscillator it is supposed to shape. */
say(m.peak < 0.90, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.90)');
say(m.peak > 0.10, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.10)');

/* 2. THE LEVEL. Measured rms 0.0449. The band is 0.010 to 0.12. The floor says
   a diver can hear the cave at all on a phone at half volume in a room with
   other people in it; the ceiling is set BELOW the 0.126 this measured while
   the singback was blasting, so the same class of fault is caught by the level
   as well as by the peak, and a doubled master or a slither gain pushed from
   0.35 towards 1 goes straight through it. */
say(m.rms > 0.010 && m.rms < 0.12, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.010 to 0.12)');

/* 3. NOT AN ALARM. Measured 0.29 percent of the minute's energy above 3 kHz.
   This cave is a 55 Hz drone, brown noise slithers through a 300 Hz bandpass,
   an 880 to 440 ping and a low passed burst: it belongs below 3 kHz, and the
   only thing up there at all is the drip's 2400 Hz opening. The ceiling is 10
   percent, thirty times the measurement and still far below anything that reads
   as a chirp (the cricket that started all this measured 82 percent). What it
   forbids: a drip moved up an octave, a slither bandpass moved into the whistle
   band, or any new voice that is a bare high sine. */
say(m.highFraction < 0.10, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 10)');

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
