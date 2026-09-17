// Variety (Stephen, Sep 17: "i did a load with 20 that had 4 pairs of white and green socks and it was just a mess").
// The base pairs of a Load (not its decoys) spread across the pattern families and around the hue wheel, so a Load's
// only lookalikes are its decoys, and at low tiers a colour decoy is a clearly different colour, not a neighbour.
import { suite } from './lib.mjs';
import { generateLoad } from '../src/loadgen.js';
import { decode } from '../engine/sockgen.js';

const { ok, done } = suite('variety');
const hueDist = (a, b) => { const d = Math.abs(a - b) % 64; return Math.min(d, 64 - d); };

for (const tier of [0, 1, 2, 3, 5]) {
  let sameFamNear = 0, hueClumps = 0, famOver = 0, loads = 0, decoyShift = Infinity;
  for (let n = 0; n < 40; n++) {
    const L = generateLoad({ seed: `variety-t${tier}-${n}`, mode: 'laundry', size: 'regular', tier });
    loads++;
    const bases = L.pairs.filter((p) => p.decoyOf === null && !p.hero).map((p) => decode(p.seed));
    for (let i = 0; i < bases.length; i++) for (let j = i + 1; j < bases.length; j++) {
      const a = bases[i], b = bases[j];
      const sameLook = a.family === b.family && !(a.family === 'motifScatter' && (a.motif & 15) !== (b.motif & 15));
      if (sameLook && hueDist(a.hue, b.hue) <= 12) sameFamNear++;
    }
    let clump = false;
    for (const s of [0, 1, 2, 3]) for (let h = 0; h < 64 && !clump; h++) if (bases.filter((b) => b.scheme === s && hueDist(b.hue, h) <= 3).length >= 4) clump = true;
    if (clump) hueClumps++;
    const cap = Math.max(2, Math.ceil(bases.length / 5));
    const fam = {};
    for (const b of bases) fam[b.family] = (fam[b.family] || 0) + 1;
    if (Object.values(fam).some((c) => c > cap)) famOver++;
    for (const p of L.pairs) if (p.field === 'palette') decoyShift = Math.min(decoyShift, hueDist(decode(p.seed).hue, decode(L.pairs[p.decoyOf].seed).hue));
  }
  ok(sameFamNear === 0, `tier ${tier}: no two base pairs share a pattern within 67 degrees of hue (${sameFamNear} pairs in ${loads} Loads)`);
  ok(hueClumps === 0, `tier ${tier}: no 34 degree slice of one colour scheme holds four base pairs (${hueClumps} of ${loads} Loads)`);
  ok(famOver === 0, `tier ${tier}: no pattern family takes more than a fifth of the base pairs (${famOver} of ${loads} Loads)`);
  if (tier >= 1 && tier <= 3) ok(decoyShift >= 12, `tier ${tier}: a colour decoy sits at least 67 degrees from its base (min ${decoyShift} steps of 5.6)`);
}
done();
