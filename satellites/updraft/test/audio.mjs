#!/usr/bin/env node
/* The ear, offline. The AUDIO layer's pure part, levelsFor(st), is read out of
 * index.html and run over scripted flights in Node, no speaker, no browser.
 *
 *   node test/audio.mjs
 *   node test/audio.mjs --over=STRAIN_AT=0     the watched failure: the whine
 *                                              then sounds at every tension
 *
 * What it asserts, each watched to fail:
 *   1. the wind bed's gain rises with the gust: the loudest bed sample sits on
 *      a stronger gust than the quietest, over a whole Blustery flight
 *   2. the whine is present ONLY above STRAIN_AT: every sample under it is
 *      silent, and there is at least one sample above it that is not
 *   3. the whine's pitch rises with tension
 *   4. the peak of bed plus whine stays under 0.99
 *   5. the bed on the grass is quieter than the bed aloft
 */
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
console.log('');
if (fails.length) { console.log(fails.length + ' AUDIO FAILURE(S)'); process.exit(1); }
console.log('AUDIO OK');
