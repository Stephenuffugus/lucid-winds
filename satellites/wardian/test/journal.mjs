/* The words, counted. The Jarwright's voice is a rule, not a mood: short
   sentences, concrete, warm, no dashes, no exclamation points, and she never
   tells the player to do anything.
   Node only. It reads the shipped file, so a line that never reaches the page
   is not a line this gate can pass. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const A = '// ---- SIM_EXPORT_START ----', B = '// ---- SIM_EXPORT_END ----';
const SIM = HTML.slice(HTML.indexOf(A) + A.length, HTML.indexOf(B));
const S = new Function(SIM + '\nreturn {FLORA,FLORA_ORDER,FAUNA,FAUNA_ORDER,CONFIG};')();

/* WORDS lives outside the SIM markers, so it is read on its own */
const wStart = HTML.indexOf('var WORDS = {');
const wEnd = HTML.indexOf('function lettersEarned');
say(wStart > 0 && wEnd > wStart, 'the words are in the shipped file');
const WORDS = new Function(HTML.slice(wStart, wEnd) + '\nreturn WORDS;')();

const lines = [];
for (const k in WORDS.species) lines.push(['species ' + k, WORDS.species[k]]);
WORDS.hints.forEach((h, i) => lines.push(['hint ' + i, h]));
WORDS.letters.forEach(l => lines.push(['letter ' + l.at, l.text]));
lines.push(['the locked line', WORDS.locked]);

say(lines.length >= 24, 'there are at least twenty four written lines (' + lines.length + ')');

const sentences = t => t.split(/[.?]\s+|[.?]$/).filter(x => x.trim().length > 1).length;
const words = t => t.trim().split(/\s+/).length;

const bad = { dash: [], bang: [], len: [], sent: [], absolute: [], order: [] };
for (const [name, t] of lines) {
  if (/[-‐-―−]/.test(t)) bad.dash.push(name);
  if (t.indexOf('!') >= 0) bad.bang.push(name);
  const w = words(t);
  if (w < 12 || w > 60) bad.len.push(name + ' (' + w + ' words)');
  const sn = sentences(t);
  if (sn < 2 || sn > 4) bad.sent.push(name + ' (' + sn + ' sentences)');
  if (/\b(always|never|forever)\b/i.test(t)) bad.absolute.push(name);
}
say(bad.dash.length === 0, 'no dash in any of them' + (bad.dash.length ? ': ' + bad.dash.join(', ') : ''));
say(bad.bang.length === 0, 'no exclamation point in any of them' + (bad.bang.length ? ': ' + bad.bang.join(', ') : ''));
say(bad.len.length === 0, 'every line is twelve to sixty words' + (bad.len.length ? ': ' + bad.len.join(', ') : ''));
say(bad.sent.length === 0, 'and two to four sentences' + (bad.sent.length ? ': ' + bad.sent.join(', ') : ''));
say(bad.absolute.length === 0, 'and she does not say always, never or forever'
  + (bad.absolute.length ? ': ' + bad.absolute.join(', ') : ''));

/* she never tells the player what to do */
const imperative = lines.filter(([n, t]) => /(^|\.\s+)(Tap|Swipe|Press|Water|Mist|Buy|Go|Click|Try|Make sure|You must|You should)\b/.test(t)
  && n.indexOf('hint') < 0);
say(imperative.length === 0, 'and the species pages and letters never give an order'
  + (imperative.length ? ': ' + imperative.map(x => x[0]).join(', ') : ''));

/* every living thing has a page */
const all = S.FLORA_ORDER.concat(S.FAUNA_ORDER);
const missing = all.filter(k => !WORDS.species[k]);
say(missing.length === 0, 'every one of the eleven has a page' + (missing.length ? ': ' + missing.join(', ') : ' (' + all.length + ')'));
const extra = Object.keys(WORDS.species).filter(k => all.indexOf(k) < 0);
say(extra.length === 0, 'and no page belongs to something that is not in the jar'
  + (extra.length ? ': ' + extra.join(', ') : ''));

/* the page says something true about the species */
const tells = [['fern', /roll|watch spring|open/i], ['vine', /wall|tendril|curl/i],
  ['mushroom', /dark|night|morning/i], ['dewsprout', /drop|bead|air/i],
  ['mooncap', /moon/i], ['frostfern', /cold|winter/i], ['sunburst', /summer|light/i],
  ['springtail', /mould|hop|dust/i], ['pillbug', /roll|bead/i], ['glowbeetle', /light|dark|driftwood/i],
  ['moss', /spring|bark|cross/i]];
const wrong = tells.filter(([k, re]) => !re.test(WORDS.species[k]));
say(wrong.length === 0, 'and each page says the thing that species actually does'
  + (wrong.length ? ': ' + wrong.map(w => w[0]).join(', ') : ''));

/* the letters arrive in the order the jar earns them */
const want = ['first', 'day7', 'rare', 'day30', 'full'];
say(JSON.stringify(WORDS.letters.map(l => l.at)) === JSON.stringify(want),
  'the letters are in milestone order (' + WORDS.letters.map(l => l.at).join(', ') + ')');
say(WORDS.from === 'The Jarwright', 'and they are signed by the Jarwright');
say(WORDS.hints.length >= 8, 'there are at least eight hints (' + WORDS.hints.length + ')');

/* a hint about every system the player has to find on their own */
const systems = [['misting', /swipe/i], ['nothing dies', /die|sleep/i], ['the clock', /hours|dark outside/i],
  ['spores', /spore/i], ['edit mode', /hold/i], ['weather', /sky|settings/i]];
const unhinted = systems.filter(([n, re]) => !WORDS.hints.some(h => re.test(h)));
say(unhinted.length === 0, 'and a hint for every system a player has to find'
  + (unhinted.length ? ': ' + unhinted.map(u => u[0]).join(', ') : ''));

console.log('');
if (fails.length) { console.log(fails.length + ' JOURNAL FAILURE(S)'); process.exit(1); }
console.log('JOURNAL OK');
