#!/usr/bin/env node
/* Sound is the score: the ticks are counted in the SOUND, not in a variable.
 *
 *   node test/audio.mjs
 *
 * The page renders a throw's ticks and plunk into an offline buffer through
 * the same two functions the speaker hears, and this reads the buffer back:
 * an onset wherever the 5 ms RMS envelope rises above 0.06 after having fallen
 * below 0.015. What it asserts, each watched to fail (the ledger has the
 * columns):
 *   1. a ten skip throw renders ten onsets and then one more, the plunk
 *   2. the perfect seventeen skip throw, whose trill closes to 67 ms between
 *      hits, still renders seventeen separate ticks and the plunk: the trill
 *      is audible as a trill and not as a smear
 *   3. every tick onset lands within 16 ms of its skip's own time from the
 *      model, and the plunk after the last of them
 *   4. the peak stays under 0.99, so nothing clips
 *   5. and a throw with no skips renders the plunk alone
 *   6. a throw that ends slow sinks a beat AFTER its last tick, because the
 *      model's sink time for a slow ending is the last hit itself and the
 *      plunk buried the last tick of the trill (found by this gate)
 *
 * The render is a dev hook by necessity: an offline context is not a speaker.
 * Everything it renders is produced by the functions the real throw uses.
 */
import { serve, open, reporter, tap, sleep } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const render = spec => page.evaluate(spec => window.GERPLUNK_DEV.renderAudio(spec), spec);

say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));

/* 1. a ten skip throw */
const ten = await render({ v: 5.5, theta: 20, spin: 1, stone: 'skimmer', seed: 99 });
say(ten.skips === 10, 'the middling throw is a ten skip throw: ' + ten.skips + ' skips');
say(ten.onsets.length === ten.skips + 1, 'it renders one onset per skip and one for the plunk: ' + ten.onsets.length + ' onsets for ' + ten.skips + ' skips');

/* 2. the trill */
const perfect = await render({ v: 12, theta: 20, spin: 1, stone: 'skimmer', seed: 99 });
say(perfect.skips >= 15, 'the perfect throw has a trill to hear: ' + perfect.skips + ' skips');
say(perfect.onsets.length === perfect.skips + 1, 'and every tick of the trill is its own onset: ' + perfect.onsets.length + ' onsets for ' + perfect.skips + ' skips');
const lastGap = perfect.events.length > 1 ? perfect.events[perfect.events.length - 1] - perfect.events[perfect.events.length - 2] : 0;
say(lastGap > 0 && lastGap < 0.09, 'the last two hits are under 90 ms apart, which is the trill: ' + (lastGap * 1000).toFixed(0) + ' ms');

/* 3. the onsets land on the skips */
let worst = 0;
for (let i = 0; i < Math.min(perfect.events.length, perfect.onsets.length); i++) {
  const gap = Math.abs(perfect.onsets[i] - perfect.events[i]);
  if (gap > worst) worst = gap;
}
/* the ear lags the schedule by the tick's own 6 ms attack plus up to one 5 ms
   window before the envelope crosses the threshold, so the tolerance is 16 ms;
   a tick scheduled at frame time on this box would miss by 100 or more */
say(worst <= 0.016, 'every tick lands within 16 ms of its skip: worst ' + (worst * 1000).toFixed(1) + ' ms');
const plunkAt = perfect.onsets[perfect.onsets.length - 1];
say(perfect.onsets.length > 0 && plunkAt >= perfect.sink - 0.012 && plunkAt <= perfect.sink + 0.03,
  'and the plunk lands at the sink: ' + (plunkAt * 1000).toFixed(0) + ' ms against ' + (perfect.sink * 1000).toFixed(0) + ' (' + perfect.ended + ')');
/* ⛔ the finding this gate made the hour it was written: a throw that ends
   slow sinks AT its last hit in the model, so the plunk buried the last tick.
   The page gives it a beat; the beat has to be there in the sound. */
say(perfect.ended === 'slow' && perfect.sink - perfect.time > 0.1, 'a stone that ran out of speed goes under a beat after its last tick: ' + ((perfect.sink - perfect.time) * 1000).toFixed(0) + ' ms');

/* 7. THE BED IS NOT AN ALARM (Stephen, Sep 06: "they sounded like fire alarms,
   they made everybody in my house flinch"). Twelve seconds of the seeded
   ambience with a loon forced into the window, rendered offline through the
   same functions the speaker uses: it has to be quiet, it has to be there, and
   the share of its energy above 3 kHz, where a phone speaker turns a chirp into
   a smoke detector, has to be small. The old cricket put most of the bed's
   energy up there. */
const bed = await page.evaluate(() => window.GERPLUNK_DEV.renderAmbience(7, 12));
say(bed.rms > 0.0015, 'the bed is there at all: rms ' + bed.rms.toFixed(4));
/* ⛔ 0.06, and the mutation that has to turn this red is the WIRING: the old
   cricket's trill oscillator fed the envelope gain directly, so a 0.022 chirp
   was a half scale tone. Putting the old pitch and rate back at the new level
   stays green (9.9 percent, 0.026), which is the point: the pitch was never the
   fault, the level was. */
say(bed.peak < 0.06, 'and it stays a bed, peak ' + bed.peak.toFixed(3) + ' (under 0.06)');
say(bed.highFraction < 0.25, 'and it is not an alarm: ' + (bed.highFraction * 100).toFixed(1) + ' percent of its energy sits above 3 kHz (under 25)');
/* 4. nothing clips */
say(perfect.peak < 0.99 && ten.peak < 0.99, 'the peak stays under 0.99: ' + perfect.peak.toFixed(3) + ' and ' + ten.peak.toFixed(3));
say(perfect.peak > 0.2, 'and it is not silence either: ' + perfect.peak.toFixed(3));

/* 5. a sink alone */
const sink = await render({ v: 12, theta: 45, spin: 1, stone: 'skimmer', seed: 99 });
say(sink.skips === 0 && sink.onsets.length === 1, 'a throw that never skips renders the plunk alone: ' + sink.onsets.length + ' onset for ' + sink.skips + ' skips');

/* 6. the spit: a perfect throw turned twenty degrees left runs up on the stones
   and CLICKS, one onset, at the beach, with no bob beat before it */
const beached = await render({ v: 12, theta: 20, spin: 1, stone: 'skimmer', seed: 99, yaw: -20 });
say(beached.ended === 'beached' && beached.skips > 0 && beached.skips < perfect.skips, 'turned into the lee the perfect throw beaches on the spit after ' + beached.skips + ' skips (' + beached.ended + ')');
say(beached.onsets.length === beached.skips + 1, 'and the click is its own onset: ' + beached.onsets.length + ' onsets for ' + beached.skips + ' skips');
say(Math.abs(beached.sink - beached.time) < 1e-9, 'a beached stone stops when it lands, no bob beat: sink ' + (beached.sink * 1000).toFixed(0) + ' ms against ' + (beached.time * 1000).toFixed(0));

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
