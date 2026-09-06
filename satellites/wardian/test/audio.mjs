#!/usr/bin/env node
/* THE EAR GATE. Does this jar sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause there was a trill oscillator wired straight into an envelope gain,
 * so a chirp written in the code as 0.022 was a half scale 4 kHz tone chopped
 * at thirty hertz, which is the exact voice of a smoke alarm, on the band where
 * a phone speaker is loudest. Every gate in that game was green, because the
 * loudest thing in it was the one thing no gate had ever rendered.
 *
 * So this gate listens. WARDIAN_TEST.renderAudio renders the jar's LOUDEST
 * MINUTE into an OfflineAudioContext through the same SFX.play the speaker
 * uses, and hands back three numbers:
 *
 *   peak          the loudest sample, so the phone is not clipping
 *   rms           the whole minute's level, so it is audible but not shouting
 *   highFraction  the share of energy above 3 kHz, where an alarm lives
 *
 * ⛔ NEVER MEASURE A WAV MADE FOR THE EAR. A render tool normalises its file,
 * so its peak is the tool's and not the game's: a sibling game measured 0.86
 * off a normalised wav while the game itself was clipping. Everything here is
 * rendered from the game's own function into the offline buffer.
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

const m = await page.evaluate(() => window.WARDIAN_TEST.renderAudio(60));
console.log('  ---   sixty seconds: peak ' + m.peak.toFixed(3) + '  rms ' + m.rms.toFixed(4)
  + '  above 3 kHz ' + (m.highFraction * 100).toFixed(1) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.160 on the loudest minute the code can
   arrange: a mist every 1.2 s, which is faster than the swipe down can be
   repeated, a tonk on the glass every 0.7 s between them, and a chime every ten
   seconds, which would be six discoveries in a minute in a game that gives you
   eleven in a season. Nobody plays this jar that hard. The ceiling is 0.90
   rather than 1.0 because a phone's own limiter starts working before full
   scale and a mix that touches 1.0 in a headless render is already distorting
   on a speaker. Three runs measured 0.152, 0.179 and 0.160: the mist fills its
   noise buffer with Math.random, so the peak jitters by about a fiftieth from
   run to run and a band drawn tight round one run would flake.
   ⛔ This game has NO master gain at all, every voice goes straight to the
   destination, so a fourth sound added carelessly lands on top of the three that
   are here with nothing between it and the speaker. That is what the 0.90
   forbids: there is nowhere to turn anything down after the fact. */
say(m.peak < 0.90, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.90)');
say(m.peak > 0.05, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.05)');

/* 2. THE LEVEL. Measured rms 0.0155, and it held to four figures across three
   runs. The band is 0.005 to 0.06. The floor says a jar on a windowsill can be
   heard at all on a phone at half volume; the ceiling is four times the
   measurement, so it forbids the mist gain being taken from 0.16 towards 1, or
   a fourth voice arriving at the level of the three that are here and doubling
   the bed. */
say(m.rms > 0.005 && m.rms < 0.06, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.005 to 0.06)');

/* 3. NOT AN ALARM, and this is the number to watch in THIS game, because the
   mist is a noise burst through a bandpass centred at 3200 Hz, which is inside
   the alarm band by construction, and misting is the thing a player does most.
   Measured 8.2 percent of the minute's energy above 3 kHz, which is the highest
   of the four games gated this morning and is fine: the mist is a soft wash of
   noise, not a tone, and 3200 with a Q of 0.7 puts most of its skirt below the
   line. The ceiling is 30 percent, under four times the measurement. What it
   forbids: the mist bandpass moved up, its Q narrowed so the low skirt goes
   away and only the whistle is left, or any new voice that is a bare high sine.
   For scale, the cricket that started all this measured 82 percent. */
say(m.highFraction < 0.30, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(1)
  + ' percent of its energy sits above 3 kHz (under 30)');

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
