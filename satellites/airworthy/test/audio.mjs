#!/usr/bin/env node
/* THE EAR GATE. Does this hangar sound like a smoke detector.
 *
 *   node test/audio.mjs
 *
 * On Sep 06 Stephen said of a sibling game that the sound effects "sounded like
 * fire alarms. They made everybody in my house flinch and scared my animals."
 * The cause was an oscillator wired straight into an envelope gain, so a chirp
 * written in the code as 0.022 was a half scale 4 kHz tone chopped at thirty
 * hertz, which is the voice of a smoke detector, on the band where a phone
 * speaker is loudest. Every gate in that game was green. On Sep 07 the same
 * family bit twice more in a subtler form: a voice started at t0 whose envelope's
 * first setValueAtTime was 45 ms later, and A FRESH GainNode'S GAIN IS ONE, so
 * for that long it went to the master at full scale.
 *
 * test/sound.mjs beside this file counts rushes and reads their gain off the
 * live graph. ⛔ A COUNT SAYS NOTHING ABOUT A LEVEL, and neither does a gain
 * value read off one node in the middle of a chain. This gate reads the SAMPLES.
 * AIRWORTHY_TEST.renderAudio renders the loudest flight into an
 * OfflineAudioContext through the same rush, flutter, whistle and play the
 * speaker hears, master and all, and hands back:
 *
 *   peak          the loudest sample, so the phone is not clipping
 *   rms           the level of the whole flight, so it is audible not shouting
 *   highFraction  the share of energy above 3 kHz, where an alarm lives
 *
 * The flight is the rush held at level 1, which setRush scales to 0.17, the
 * flutter held at 1, which is a plane veering as hard as it can for twelve
 * seconds, the whistle of the call every second and a half, a crease and a snap
 * twice a second, a toss, a landing and the six kid clap over the top. No hand
 * flies anything this busy.
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

const m = await page.evaluate(() => window.AIRWORTHY_TEST.renderAudio(12));
console.log('  ---   twelve seconds of the loudest flight: peak ' + m.peak.toFixed(3)
  + '  rms ' + m.rms.toFixed(4) + '  above 3 kHz ' + (m.highFraction * 100).toFixed(2) + ' percent');

/* 1. NOTHING CLIPS, AND NOTHING SHOUTS. Measured 0.063, and over six runs it
   moved between 0.059 and 0.066 with one run at 0.087, because every burst here
   is a fresh random buffer and the loudest sample is the tail of that draw. The
   band is 0.18, twice the worst run seen. ⛔ WHAT IT FORBIDS, MEASURED: move
   only the envelope in noise() 45 ms behind the buffer it shapes, which is the
   exact fault found in two sibling games on Sep 07, and this flight renders 0.453
   with 42 percent of its energy up in the alarm band. Open the rush from 0.17 to
   0.8 and it renders 0.203. It also forbids any voice connected past the master,
   which nothing would scale. */
say(m.peak < 0.18, 'nothing clips and nothing shouts: peak ' + m.peak.toFixed(3) + ' (under 0.18)');
say(m.peak > 0.02, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.02)');

/* 2. THE LEVEL. Measured rms 0.0164, and unlike the peak this one is steady to
   four places, because twelve seconds of noise averages its own draw out. The
   band is 0.004 to 0.030. The floor says a hangar full of paper is audible on a
   phone at half volume with the fleet's music chip playing beside it, and this
   is the QUIETEST of the four games measured on Sep 07, so the floor matters as
   much as the ceiling here. The ceiling is set below every level fault measured:
   the master raised from 0.5 to 1.0 gives 0.0329, the rush opened to 0.8 gives
   0.0515, the envelope fault gives 0.0425. The peak alone sees none of the
   first. */
say(m.rms > 0.004 && m.rms < 0.030, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.004 to 0.030)');

/* 3. NOT AN ALARM. Measured 8.3 percent of the flight's energy above 3 kHz,
   which is the highest of the four games and is what a hangar full of paper is:
   the rush is a bandpass at 700 to 1400 Hz but paper's own voice is a hiss. The
   ceiling is 13 percent. What it forbids, measured: the crease's band moved from
   2600 to 7000 Hz with a level to match gives 15.3 percent, the rush opened up
   gives 17.6, and the envelope fault gives 42.2. */
say(m.highFraction < 0.13, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 13)');

/* 4. THE TWO VOICES THAT LIVE IN THE ALARM'S OWN BAND ARE ALLOWED THERE ONLY
   BECAUSE THEY ARE TINY. The snap is a bandpass burst at 4200 Hz, which is
   within a few hundred hertz of a real smoke detector, and 63 percent of its
   energy sits above the split; the crease is at 2600 and measures 56 percent.
   They are safe at 0.021 and 0.015 peak and they would not be safe anywhere
   near a tenth of full scale. These two bands are the ones that would have
   caught Sep 06 in this game: the whole flight's share above 3 kHz does NOT move
   enough when one quiet voice is made loud (the snap taken from 0.11 to 0.6 puts
   the flight at 11.8 percent, which walks through assertion 3), and the snap
   alone does not walk through this.
   ⛔ THIRTY EVENTS, NOT SIX. Six snaps in six seconds measured anywhere from
   0.021 to 0.039 depending on the draw, which is a band nobody can set. Thirty
   of them, and the loudest sample settles: over six runs the snap measured 0.051
   to 0.056 and the crease 0.056 to 0.070. The bands are 0.10 and 0.12, twice the
   worst run, and the snap taken from 0.11 to 0.6 renders about 0.28. */
const snap = await page.evaluate(() => window.AIRWORTHY_TEST.renderAudio(6, { only: 'snap', every: 0.2 }));
const crease = await page.evaluate(() => window.AIRWORTHY_TEST.renderAudio(6, { only: 'crease', every: 0.2 }));
console.log('  ---   the two bright voices alone: snap peak ' + snap.peak.toFixed(4)
  + ' (' + (snap.highFraction * 100).toFixed(0) + ' percent high), crease peak ' + crease.peak.toFixed(4)
  + ' (' + (crease.highFraction * 100).toFixed(0) + ' percent high)');
say(snap.peak > 0.005 && snap.peak < 0.10, 'the snap is there and it is tiny: peak ' + snap.peak.toFixed(4) + ' (0.005 to 0.10)');
say(crease.peak > 0.005 && crease.peak < 0.12, 'the crease is there and it is tiny: peak ' + crease.peak.toFixed(4) + ' (0.005 to 0.12)');

await browser.close();
site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
