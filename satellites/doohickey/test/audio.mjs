#!/usr/bin/env node
/* THE EAR GATE. Does this kitchen sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause was an oscillator wired straight into an envelope gain, so a chirp
 * written in the code as 0.022 was a half scale 4 kHz tone chopped at thirty
 * hertz, which is the voice of a smoke detector, on the band where a phone
 * speaker is loudest. Every gate in that game was green. On Sep 07 the same
 * family bit twice more, in two other games, in a subtler form: an oscillator
 * started at t0 whose envelope's first setValueAtTime was 45 ms later, and A
 * FRESH GainNode'S GAIN IS ONE, so for that long the voice went to the master at
 * full scale. Counting voices catches none of it.
 *
 * So this gate listens. DOOHICKEY_TEST.renderAudio renders the loudest run the
 * board can make into an OfflineAudioContext through the same play, tone, noise
 * and env the speaker hears, master and limiter and all, and hands back:
 *
 *   peak          the loudest sample, so the phone is not clipping
 *   rms           the level of the whole run, so it is audible not shouting
 *   highFraction  the share of energy above 3 kHz, where an alarm lives
 *
 * The run is a marble ticking sixteen times a second, a domino every eighth so
 * the clack ladder climbs to its top step and stays there, and every other voice
 * the board owns over the top: louder and busier than any machine a player can
 * build. Numbers are stable to four places run to run even though the noise
 * buffers are random, because the level is set by the envelopes and not by the
 * samples.
 *
 * ⛔ NEVER MEASURE A WAV MADE FOR THE EAR. A render tool normalises its file, so
 * its peak is the tool's and not the game's: a sibling game measured 0.86 off a
 * normalised wav on a day it was clipping. Everything here is the game's own
 * functions rendering into the offline buffer.
 */
import { serve, open, reporter } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base);
const { fails, say } = reporter();

say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));

const m = await page.evaluate(() => window.DOOHICKEY_TEST.renderAudio(8));
console.log('  ---   eight seconds of the loudest run: peak ' + m.peak.toFixed(3)
  + '  rms ' + m.rms.toFixed(4) + '  above 3 kHz ' + (m.highFraction * 100).toFixed(2) + ' percent');

/* 1. NOTHING CLIPS. Measured 0.240 with a limiter at minus twelve doing the
   work. The ceiling is 0.60 rather than 1.0 because a phone's own limiter
   starts working well before full scale. ⛔ WHAT IT FORBIDS, MEASURED: the fire
   alarm family. Delay every envelope in this module by 45 ms behind the
   oscillator it shapes, which is the exact fault found in two sibling games on
   Sep 07, and this run renders a PEAK OF 1.878 and an rms of 0.355. It also
   forbids any voice connected after the limiter, which would not be limited. */
say(m.peak < 0.60, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.60)');
say(m.peak > 0.05, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.05)');

/* 2. THE LEVEL. Measured rms 0.0351, and it is 0.0351 on every run. The band is
   0.008 to 0.055. The floor says a player hears the machine at all on a phone at
   half volume with the fleet's music chip playing beside it. The ceiling is set
   just above the measurement ON PURPOSE and it is the tightest band here,
   because the peak alone cannot see a level change that the limiter absorbs:
   the master raised from 0.6 to 1.0 measures peak 0.399, which walks through the
   band above it, and rms 0.0586, which does not. */
say(m.rms > 0.008 && m.rms < 0.055, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.008 to 0.055)');

/* 3. NOT AN ALARM. Measured 3.64 percent of the run's energy above 3 kHz. This
   board is a 196 Hz clack ladder, a 90 Hz thunk, a 180 to 760 boing and a bell
   whose top partial is 2637 Hz, all of it under the split; what little sits
   above it is the tail of the bell and the marble's tick. The ceiling is 10
   percent, near three times the measurement. What it forbids, measured: the bell
   moved up an octave, which is a bare high sine and is what an alarm is, takes
   this run to 25.7 percent. What it does NOT catch on its own is a bandpass
   moved up on the tick or the click, because those two voices are tiny, and
   that is what assertion 4 is for. */
say(m.highFraction < 0.10, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 10)');

/* 4. THE TWO BRIGHT VOICES ARE TINY, AND THAT IS THE ONLY REASON THEY ARE
   ALLOWED TO BE BRIGHT. The click is a 2400 Hz burst and the marble's tick runs
   to 2500 Hz, and on their own they measure 36 and 38 percent of their energy
   above 3 kHz, which is alarm country. They are safe for one reason only: they
   are tiny. Over several runs the click measured 0.0045 to 0.0092 peak and the
   tick 0.0060 to 0.0117, and these two are the only numbers in this file that
   move, because a burst that short is a fresh random buffer and its loudest
   sample is a coin toss. The bands are 0.03 and 0.04, wide enough for the draw
   and far too tight for a level change. What they say is that these voices must
   STAY under everything: a click of this colour at a tenth of full scale is
   precisely the sound that made a house flinch on Sep 06. */
const click = await page.evaluate(() => window.DOOHICKEY_TEST.renderAudio(4, { only: 'click', every: 0.5 }));
const tick = await page.evaluate(() => window.DOOHICKEY_TEST.renderAudio(4, { only: 'tick', every: 0.5, arg: 400 }));
console.log('  ---   the two bright voices alone: click peak ' + click.peak.toFixed(4)
  + ' (' + (click.highFraction * 100).toFixed(0) + ' percent high), tick peak ' + tick.peak.toFixed(4)
  + ' (' + (tick.highFraction * 100).toFixed(0) + ' percent high)');
say(click.peak > 0.001 && click.peak < 0.03, 'the click is there and it is tiny: peak ' + click.peak.toFixed(4) + ' (0.001 to 0.03)');
say(tick.peak > 0.001 && tick.peak < 0.04, 'the marble tick is there and it is tiny: peak ' + tick.peak.toFixed(4) + ' (0.001 to 0.04)');

/* 5. AND THE BELL, THE ONE VOICE THE WHOLE GAME IS AIMED AT, IS THE LOUDEST
   THING ON THE BOARD AND STILL UNDER HALF SCALE. Measured 0.219 peak struck
   twice a second, which nothing does. */
const ding = await page.evaluate(() => window.DOOHICKEY_TEST.renderAudio(4, { only: 'ding', every: 0.5 }));
say(ding.peak > 0.05 && ding.peak < 0.45, 'the bell rings and does not shout: peak ' + ding.peak.toFixed(3) + ' (0.05 to 0.45)');

await browser.close();
site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
