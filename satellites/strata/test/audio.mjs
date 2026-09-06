#!/usr/bin/env node
/* THE EAR GATE. Does this dig sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause there was a trill oscillator wired straight into an envelope gain,
 * so a chirp written in the code as 0.022 was a half scale 4 kHz tone chopped
 * at thirty hertz, which is the exact voice of a smoke alarm, on the band where
 * a phone speaker is loudest. Every gate in that game was green, because the
 * loudest thing in it was the one thing no gate had ever rendered. Strata's own
 * dig gate reads the EVENT LOG, which says which sounds fired and nothing at
 * all about how loud they were.
 *
 * So this gate listens. STRATA_TEST.renderAudio renders the dig's LOUDEST
 * PASSAGE into an OfflineAudioContext through the same AUDIO.play and
 * AUDIO.grainFor the speaker uses, and hands back three numbers:
 *
 * ⛔ TWENTY SECONDS, NOT SIXTY, and the rates are the ones a full minute would
 * use. At 180 grains a second, three nodes each, a minute of this schedule
 * builds sixteen thousand nodes and the render stops being a gate and becomes
 * a hang. These are RATE statistics, not duration statistics: the sibling gate
 * in fathom measured the same peak and rms at six, twenty and sixty seconds of
 * one schedule to within a thousandth. Twenty seconds of the ceiling IS the
 * ceiling.
 *
 *   peak          the loudest sample, so the phone is not clipping
 *   rms           the whole passage's level, so it is audible but not shouting
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

const m = await page.evaluate(() => window.STRATA_TEST.renderAudio(20));
console.log('  ---   twenty seconds at the ceiling rates: peak ' + m.peak.toFixed(3) + '  rms ' + m.rms.toFixed(4)
  + '  above 3 kHz ' + (m.highFraction * 100).toFixed(1) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.344 at the code's OWN ceilings rather than at a
   polite guess: grainFor caps at three grains a call and onMove calls it once a
   frame, so half the window is 180 shhh a second, the most hiss this game can
   physically make; the other half is the pick, which fires a tak on any move
   over two cells, once a frame; a run of tik over the middle; and the
   punctuation of a very good dig on top of both. The ceiling is 0.90 rather
   than 1.0 because a phone's own limiter starts working before full scale and a
   mix that touches 1.0 in a headless render is already distorting on a speaker.
   Raising the master from 0.65 to 1.0, which is the single easiest thing
   anybody will do to this file, breaks it, and so does a fourth loud voice
   added to a mix that is already stacking nine grains at a time. */
say(m.peak < 0.90, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.90)');
say(m.peak > 0.05, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.05)');

/* 2. THE LEVEL. Measured rms 0.0287. The band is 0.008 to 0.10. The floor says
   a brush on sandstone can be heard at all on a phone at half volume; the
   ceiling is three and a half times the measurement, so it forbids a doubled
   master, or the shhh peak taken from 0.045 towards the tak's 0.30, which would
   turn a hiss into a hose. */
say(m.rms > 0.008 && m.rms < 0.10, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.008 to 0.10)');

/* 3. NOT AN ALARM, and this is the number to watch in THIS game. The brush is
   `shhh`, a noise burst through a HIGH PASS at 5200 Hz, and it is the sound the
   player makes most: a sustained hiss with all of its energy in the band a
   phone speaker shouts. Measured 26.5 percent above 3 kHz, by a long way the
   highest of the four games gated this morning, and it is the number to keep an
   eye on: a quarter of this game's loudest passage is up in the band a phone
   pushes hardest. It passes because a hiss is not a tone (there is no pitch in
   it to lock onto, which is what makes an alarm an alarm) and because the level
   is low, 0.0287 rms. The ceiling is 40 percent, half again above the
   measurement. What it forbids: raising the shhh peak, raising its 5200 Hz high
   pass, moving the tik's 2600 Hz bandpass up into the whistle band, or adding a
   sustained TONE up there. For scale, the cricket that started all this measured
   82 percent. If Stephen ever says the brush is harsh, this is the number to
   bring the design conversation to. */
say(m.highFraction < 0.40, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(1)
  + ' percent of its energy sits above 3 kHz (under 40)');

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
