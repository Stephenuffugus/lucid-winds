#!/usr/bin/env node
/* THE EAR, IN TWO HALVES: the MODEL and the SAMPLES.
 *
 *   node test/audio.mjs
 *   node test/audio.mjs --over=STRAIN_AT=0     the watched failure: the whine
 *                                              then sounds at every tension
 *
 * PART ONE, the model. The AUDIO layer's pure part, levelsFor(st), is read out
 * of index.html and run over scripted flights in Node, no speaker, no browser.
 * What it asserts, each watched to fail:
 *   1. the wind bed's gain rises with the gust: the loudest bed sample sits on
 *      a stronger gust than the quietest, over a whole Blustery flight
 *   2. the whine is present ONLY above STRAIN_AT: every sample under it is
 *      silent, and there is at least one sample above it that is not
 *   3. the whine's pitch rises with tension
 *   4. the peak of bed plus whine stays under 0.99
 *   5. the bed on the grass is quieter than the bed aloft
 *
 * ⛔ AND EVERY ONE OF THOSE CAN BE TRUE OF A FIRE ALARM. levelsFor is a model of
 * what the gains SHOULD be; it says nothing about what leaves the speaker. On
 * Sep 06 Stephen said the fleet's sound effects "sounded like fire alarms. They
 * made everybody in my house flinch and scared my animals," and the cause was an
 * oscillator wired straight into an envelope gain in a game whose every gate was
 * green. On Sep 07 the same family bit twice more: a voice started at t0 whose
 * envelope's first setValueAtTime was 45 ms later, and A FRESH GainNode'S GAIN
 * IS ONE, so for that long it went to the master at full scale.
 *
 * So PART TWO listens to the SAMPLES. UPDRAFT_DEV.renderAudio renders the
 * loudest flight into an OfflineAudioContext through the real ensure, tick,
 * crack, chord and thud, and reads peak, rms and the share of energy above 3 kHz
 * off the buffer. The --over flag rewrites the SIM text for part one only; part
 * two always drives the page as it ships.
 *
 * ⛔ NEVER MEASURE A WAV MADE FOR THE EAR. A render tool normalises its file, so
 * its peak is the tool's and not the game's: a sibling game measured 0.86 off a
 * normalised wav on a day it was clipping.
 */
import { serve, open as openPage, reporter } from './harness.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
function extract(a, b) { const i = HTML.indexOf(a), j = HTML.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing ' + a); return HTML.slice(i + a.length, j); }
let SIM = extract('// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
const AUD_START = HTML.indexOf('var AUDIO = (function () {');
const AUD_END = HTML.indexOf('\n})();', AUD_START) + '\n})();'.length;
const AUD = HTML.slice(AUD_START, AUD_END);
const overArg = process.argv.find(a => a.startsWith('--over='));
if (overArg) for (const kv of overArg.slice(7).split(',')) {
  const [k, v] = kv.split('=');
  const re = new RegExp('(\\b' + k + '\\s*:\\s*)(-?[0-9]*\\.?[0-9]+)');
  if (!re.test(SIM)) throw new Error('override key not found: ' + k);
  SIM = SIM.replace(re, '$1' + v);
}
const S = new Function('window', SIM + '\n' + AUD + '\nreturn { CONFIG, newFlight, runScript, rhythm, AUDIO };')({});
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* a Blustery flight with gusts, held, leaning, released, sampled every 0.05 s */
const st = S.newFlight({ mood: 'blustery', seed: 5, wind: { gusts: true, thermal: false, turb: false }, L: 40, el: 0.5, launched: true });
const samples = [];
S.runScript(st, [{ t: 0, hold: true, lean: 0 }, { t: 6, hold: false, lean: 0 }, { t: 9, hold: true, lean: 0.6 }, { t: 14, hold: false, lean: 0 }], 30,
  s => { const lv = S.AUDIO.levelsFor(s); samples.push({ t: s.t, gust: s.gust, tN: s.tN, strain: s.strain, bed: lv.bed, whine: lv.whine, hz: lv.hz, ended: s.ended }); }, 0.05);
const live = samples.filter(s => !s.ended);
say(live.length > 100, 'the flight gave ' + live.length + ' samples before it ended (' + (st.ended || 'still flying') + ')');
const loud = live.reduce((a, b) => b.bed > a.bed ? b : a), quiet = live.reduce((a, b) => b.bed < a.bed ? b : a);
say(loud.gust > quiet.gust + 0.1 && loud.bed > quiet.bed + 0.02, 'the bed rises with the gust: ' + loud.bed.toFixed(3) + ' at gust ' + loud.gust.toFixed(2) + ', ' + quiet.bed.toFixed(3) + ' at gust ' + quiet.gust.toFixed(2));
const under = live.filter(s => s.tN < S.CONFIG.STRAIN_AT), over = live.filter(s => s.tN >= S.CONFIG.STRAIN_AT);
say(under.length > 20 && under.every(s => s.whine === 0), 'the whine is silent under STRAIN_AT (' + under.length + ' samples, loudest ' + Math.max(...under.map(s => s.whine)).toFixed(3) + ')');
say(over.length > 3 && over.every(s => s.whine > 0), 'and sounds above it (' + over.length + ' samples, quietest ' + (over.length ? Math.min(...over.map(s => s.whine)).toFixed(3) : '?') + ')');
const lowT = live.filter(s => s.tN < 0.3), highT = live.filter(s => s.tN >= S.CONFIG.STRAIN_AT);
say(lowT.length && highT.length && Math.min(...highT.map(s => s.hz)) > Math.max(...lowT.map(s => s.hz)), 'the whine\'s pitch rises with tension');
say(Math.max(...live.map(s => s.bed + s.whine)) < 0.99, 'the peak stays under 0.99 (' + Math.max(...live.map(s => s.bed + s.whine)).toFixed(3) + ')');
const grass = S.newFlight({ mood: 'fresh', seed: 1, wind: { gusts: false, thermal: false, turb: false } });
const aloft = S.newFlight({ mood: 'fresh', seed: 1, wind: { gusts: false, thermal: false, turb: false }, L: 30, el: 0.8, launched: true });
say(S.AUDIO.levelsFor(grass).bed < S.AUDIO.levelsFor(aloft).bed, 'the bed on the grass is quieter than aloft (' + S.AUDIO.levelsFor(grass).bed.toFixed(3) + ' vs ' + S.AUDIO.levelsFor(aloft).bed.toFixed(3) + ')');
say(S.AUDIO.levelsFor(null).bed > 0 && S.AUDIO.levelsFor(null).whine === 0, 'no flight is a soft bed and no whine');

/* ---------------------------------------------------------- PART TWO, the ear
   Eight seconds of the loudest flight this sky can make, at the code's OWN
   ceilings: a gale, aloft, with the line at breaking tension, so levelsFor
   hands back its capped 0.28 bed and its capped 0.12 whine for the whole take,
   and the line cracking, the thud of a landing and the three note chord of a
   record all on the same instant halfway through. ⛔ THIS SKY HAS NO MASTER GAIN
   AND NO LIMITER: every voice connects straight to the destination, so anything
   added is added to the peak with nothing to catch it, which is exactly why the
   numbers below want watching. */
const site = await serve();
const { browser, page, errors } = await openPage(site.base);
say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));
const m = await page.evaluate(() => window.UPDRAFT_DEV.renderAudio(8));
console.log('  ---   eight seconds of the loudest flight: peak ' + m.peak.toFixed(3)
  + '  rms ' + m.rms.toFixed(4) + '  above 3 kHz ' + (m.highFraction * 100).toFixed(2) + ' percent');

/* 6. NOTHING CLIPS. Measured 0.371, and over six runs it moved between 0.361 and
   0.421 because the wind bed is a fresh random walk each time. The band is 0.70,
   a little over one and a half times the worst run seen, and low enough that the
   faults below cross it. ⛔ WHAT IT FORBIDS, ALL MEASURED BY MUTATING THE PAGE:
   drop `whineGain.gain.value = 0` and let the fresh node keep its default gain
   of ONE, which is the Sep 07 fault exactly, and this renders 0.985; drop
   `gn.gain.value = 0` in the chord, whose three oscillators all start at t0 while
   their envelopes begin 0, 60 and 120 ms later, and it renders about 3.0; raise
   the whine cap from 0.12 to 0.5 and it renders 0.751.
   ⛔ THAT CHORD IS THE FATHOM SHAPE, LINE FOR LINE. Three sines started
   together, three envelopes staggered by tens of milliseconds. The only thing
   standing between this game and the 1.293 Fathom measured is the single
   `gn.gain.value = 0` that runs before the first setTargetAtTime, because a
   fresh GainNode's gain is one. Nobody delete that line. */
say(m.peak < 0.70, 'nothing clips: peak ' + m.peak.toFixed(3) + ' (under 0.70)');
say(m.peak > 0.05, 'and it is not silence: peak ' + m.peak.toFixed(3) + ' (over 0.05)');

/* 7. THE LEVEL. Measured rms 0.1034, steady to three places over six runs
   (0.1028 to 0.1036), because eight seconds of wind averages its own draw out.
   The band is 0.02 to 0.125. This is the loudest of the four games measured on
   Sep 07 and the ceiling is deliberately close, one and a fifth times the
   measurement, because the peak is a poor witness for a bed: raise the bed cap
   from 0.28 to 0.9 and the peak only reaches 0.509, which walks through
   assertion 6, while the rms goes to 0.1299, which does not walk through this.
   The whine cap raised gives 0.357 and the chord fault 0.174. */
say(m.rms > 0.02 && m.rms < 0.125, 'it is audible but not shouting: rms ' + m.rms.toFixed(4) + ' (0.02 to 0.125)');

/* 8. NOT AN ALARM. Measured 0.75 percent of the flight's energy above 3 kHz,
   the lowest of the four games and exactly what this sky should be: a brown
   noise bed through a lowpass that never opens past about 2 kHz, a sine whine
   that runs 200 to 900 Hz, a lowpassed thud and a three note chord at 330 to
   495 Hz. The ceiling is 4 percent, five times the measurement. What it forbids,
   measured: move the whine's pitch band from 200 plus 700 to 2000 plus 4000,
   which is a bare sine sweeping through the smoke detector's own octave, and
   this reads 64 percent. What it does NOT catch is the crack's highpass moved
   from 1800 to 5000 (0.77 percent), because the crack is brown noise and has
   almost nothing up there to pass; that voice is guarded by its level, not by
   its colour. */
say(m.highFraction < 0.04, 'it is not an alarm: ' + (m.highFraction * 100).toFixed(2)
  + ' percent of its energy sits above 3 kHz (under 4)');

/* 9. AND THE BED WITH NO FLIGHT UNDER IT, which is what the title screen and
   every menu play, is a fifth of the flight and not silence: measured rms
   0.0200, steady to three places. The band says the menus stay a background and
   the flight stays the event. */
const idle = await page.evaluate(() => window.UPDRAFT_DEV.renderAudio(8, { quiet: 1 }));
say(idle.rms > 0.005 && idle.rms < 0.04, 'the menu bed is a background, not the flight: rms '
  + idle.rms.toFixed(4) + ' (0.005 to 0.04)');

await browser.close();
site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
