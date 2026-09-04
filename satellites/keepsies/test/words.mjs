/**
 * The words a marble is described with, measured against the marbles.
 *
 *   node test/words.mjs
 *
 * DESIGN 20 shows integrity, hardness and weight as WORDS rather than numbers,
 * which is the right call and also a trap: a word ladder is written by hand, the
 * catalogue is generated, and nothing makes the two agree. The first weight
 * ladder in collection.js topped out at 25 grams. Nothing in this game weighs 25
 * grams. Fifty eight of sixty five marbles printed "barely there", including
 * every steelie, and two of the four words could never appear at all.
 *
 * So this gate holds the vocabulary to three rules:
 *
 *   1. EVERY WORD IS REACHABLE. A rung no marble lands on is dead copy.
 *   2. NO WORD SWALLOWS THE CATALOGUE. If one rung covers more than 80 percent
 *      of the marbles the ladder has collapsed and is telling the player nothing.
 *   3. THE LADDER IS MONOTONIC. Heavier marbles never get a lighter word.
 *
 * It is a data gate, not a taste gate. It cannot tell you the words are good. It
 * can tell you they are being used.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { bodySpec } from '../src/core/marbleBody.js?v=20260904d';
import { weightWord, hardnessWord } from '../src/meta/words.js?v=20260904d';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(ROOT, 'src/data/marbles.json'), 'utf8'));

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* the ladders, and what they are asked about */
const LADDERS = [
  {
    what: 'weight',
    // the whole vocabulary, written out here so a rung deleted from the function
    // is caught as an unreachable word rather than quietly disappearing
    words: ['barely there', 'light, and quick off the thumb', 'the usual heft',
      'heavy in the hand', 'arrives, and stays'],
    of: (m) => weightWord(bodySpec(m, T)),
    order: (m) => bodySpec(m, T).mass
  },
  {
    what: 'hardness',
    words: ['chips easily', 'takes its chances', 'holds together', 'endures', 'shrugs it off'],
    of: (m) => hardnessWord(bodySpec(m, T).hardness),
    order: (m) => bodySpec(m, T).hardness
  }
];

for (const L of LADDERS) {
  console.log('\n' + L.what);
  const seen = {};
  const rows = C.marbles.map(m => ({ name: m.name, word: L.of(m), key: L.order(m) }));
  for (const r of rows) (seen[r.word] || (seen[r.word] = [])).push(r);

  const missing = L.words.filter(w => !seen[w]);
  say(missing.length === 0, '1. every word is reachable from the catalogue'
    + (missing.length ? ', these are not: ' + missing.join(', ') : ''));

  const stray = Object.keys(seen).filter(w => L.words.indexOf(w) < 0);
  say(stray.length === 0, '   and the function prints no word this gate does not know about'
    + (stray.length ? ': ' + stray.join(', ') : ''));

  let worst = '', worstPct = 0;
  for (const w of Object.keys(seen)) {
    const pct = 100 * seen[w].length / rows.length;
    if (pct > worstPct) { worstPct = pct; worst = w; }
    console.log('    ' + String(seen[w].length).padStart(3) + '  ' + w);
  }
  say(worstPct <= 80, '2. no single word swallows the catalogue: the widest is "' + worst
    + '" at ' + worstPct.toFixed(1) + ' percent, the ceiling is 80');

  const sorted = rows.slice().sort((a, b) => a.key - b.key);
  let breaks = 0, example = '';
  for (let i = 1; i < sorted.length; i++) {
    const a = L.words.indexOf(sorted[i - 1].word), b = L.words.indexOf(sorted[i].word);
    if (b < a) { breaks++; if (!example) example = sorted[i - 1].name + ' then ' + sorted[i].name; }
  }
  say(breaks === 0, '3. the ladder never goes backwards: ' + breaks + ' inversions'
    + (example ? ', first at ' + example : ''));
}

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nWORDS FAILED'); process.exit(1); }
console.log('WORDS OK');
