// PHASE 8, TOMORROW (DESIGN-T2): "the Odd Bin leaves a note when a mate is one Load away (data) · yesterday's last
// Load is still folded on the dryer top when she comes back · the cat has moved."
//
// THE NOTE MUST BE TRUE. A Laundry Day Load used to roll its seed the moment it started, so nothing could know what the
// next one held. Now the next seed waits in the save (`nextSeed`, app.js), and the reunion is drawn from the seed's
// OWN stream (loadgen), so whether the next Load brings a mate home does not depend on the size or the tier she picks
// at the door. The answers warned against teasing ("no come back tomorrow copy"): a note that is not true is a tease.
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { generateLoad } from '../src/loadgen.js';
import { sha256 } from '../engine/sha256.js';
import { NOTE_LINES, noteLine, mateIsNext } from '../src/tomorrow.js';

const { ok, done } = suite('tomorrow');
const SIZES = ['small', 'regular', 'heavy', 'mountain'];
const binFrom = (i, n) => generateLoad({ seed: 'binsrc-' + i, mode: 'laundry', size: 'regular', tier: 2 }).pairs.slice(0, n).map((p) => ({ sockSeed: p.seed }));

{
  // the rest of every Load is what it was: the PAIRS of 60 Loads with socks in the Bin, recorded before the change
  const golden = JSON.parse(readFileSync(new URL('./golden-bin-pairs.json', import.meta.url))).rows;
  const moved = golden.filter((g, i) => {
    const L = generateLoad({ seed: g.seed, mode: 'laundry', size: g.size, tier: g.tier, oddBin: binFrom(i, g.bin) });
    return sha256(JSON.stringify(L.pairs.map((p) => [p.seed, p.hero || null, p.decoyOf === undefined ? null : p.decoyOf]))) !== g.pairs;
  });
  ok(!moved.length, `the pairs of every Load are what they were (${golden.length} Loads with socks in the Bin)${moved.length ? ': ' + moved.map((g) => g.seed).join(', ') : ''}`);
}
{
  // the reunion is the SEED's: the same answer at every size and tier she could pick at the door
  let split = 0, yes = 0;
  const N = 200;
  for (let i = 0; i < N; i++) {
    const oddBin = binFrom(i, 1 + (i % 3));
    const answers = new Set();
    for (const size of SIZES) for (const tier of [0, 4, 8]) answers.add(mateIsNext(generateLoad({ seed: 'next-' + i, mode: 'laundry', size, tier, oddBin })));
    if (answers.size > 1) split++;
    if (answers.has(true)) yes++;
  }
  ok(split === 0, `whether the next Load brings a mate home is the seed's alone, at every size and tier (${split} of ${N} seeds changed with the size)`);
  // and the design's rate holds: 30 percent of Loads with someone waiting in the Bin
  ok(Math.abs(yes / N - 0.3) < 0.08, `a mate comes home in about 30 percent of Loads with someone waiting (${Math.round((yes / N) * 100)} percent)`);
}
{
  // the note: short handwritten lines, the copy laws, no promise of a time ("tomorrow", "soon") because the next Load
  // is whenever she plays it
  const bad = NOTE_LINES.filter((l) => !l || l.length > 60 || /[—–!]|\s-\s/.test(l) || /\b(tomorrow|soon|tonight|come back|hurry)\b/i.test(l));
  const picks = new Set(Array.from({ length: 200 }, (_, i) => noteLine('load|' + i)));
  ok(NOTE_LINES.length >= 6 && !bad.length && picks.size >= Math.min(6, NOTE_LINES.length), `the Odd Bin's notes are short, kind and name no time (${NOTE_LINES.length}; ${picks.size} used)${bad.length ? ': ' + bad.join(' | ') : ''}`);
}

done();
