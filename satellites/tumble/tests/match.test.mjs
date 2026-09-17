// DESIGN 15.3: 10,000 generated pairs+decoys per tier; every decoy differs in exactly one field;
// every pair passes the contrast floor. Plus: no two designs in a Load look the same.
import { suite } from './lib.mjs';
import { generateLoad, tierParams, visualSignature, SIZES } from '../src/loadgen.js';
import { decode, diffFields, specKey, palettesDistinct, paletteDistance, MODES, DE_FLOOR, FIELDS } from '../engine/sockgen.js';

const { ok, done } = suite('match');
const t0 = performance.now();
for (let tier = 0; tier <= 9; tier++) {
  const P = tierParams(tier);
  let pairs = 0, decoys = 0, badField = 0, badContrast = 0, lookAlike = 0, keyClash = 0, sizeWrong = 0, odd = 0, oddBad = 0, io = 0, socks = 0, silOut = 0;
  const fieldCount = {};
  let minDe = Infinity;
  for (let n = 0; pairs < 10000; n++) {
    const L = generateLoad({ seed: `match-t${tier}-${n}`, mode: 'laundry', size: 'regular', tier, patternFirst: n % 5 === 4 });
    if (L.pairs.length !== SIZES.regular) sizeWrong++;
    const seen = new Map();
    for (const p of L.pairs) {
      pairs++;
      const sp = decode(p.seed);
      if (!P.silhouettes.includes(sp.silhouette)) silOut++;
      const sig = visualSignature(sp);
      if (seen.has(sig)) lookAlike++;
      seen.set(sig, p);
      if (p.decoyOf !== null) {
        decoys++;
        const base = decode(L.pairs[p.decoyOf].seed);
        const d = diffFields(base, sp).filter((f) => f !== 'pairId');
        if (d.length !== 1) badField++;
        fieldCount[p.field] = (fieldCount[p.field] || 0) + 1;
        if (d[0] === 'palette') {
          if (!palettesDistinct(base.palette, sp.palette)) badContrast++;
          for (const m of MODES) minDe = Math.min(minDe, paletteDistance(base.palette, sp.palette, m));
          if (n % 5 === 4) badField++; // pattern first never makes a colour only decoy
        }
        if (visualSignature(base) === sig) lookAlike++;
        if (specKey(base) === specKey(sp)) keyClash++;
      }
    }
    // any two designs that differ only in colour are clearly different colours
    const specs = L.pairs.map((p) => decode(p.seed));
    for (let a = 0; a < specs.length; a++) for (let b = a + 1; b < specs.length; b++) {
      const d = diffFields(specs[a], specs[b]).filter((f) => f !== 'pairId');
      if (d.length === 1 && d[0] === 'palette' && !palettesDistinct(specs[a].palette, specs[b].palette)) badContrast++;
    }
    for (const o of L.odd) {
      odd++;
      const k = specKey(decode(o.seed));
      if (L.pairs.some((p) => specKey(decode(p.seed)) === k)) oddBad++;
    }
    for (const s of L.socks) { socks++; if (s.insideOut) io++; }
  }
  const ratio = decoys / pairs;
  ok(badField === 0, `tier ${tier}: every one of ${decoys} decoys differs from its base in exactly one field (${JSON.stringify(fieldCount)})`);
  ok(badContrast === 0, `tier ${tier}: every colour only difference clears the floor (dE2000 >= ${DE_FLOOR} for all four viewers${decoys ? ', min ' + (minDe === Infinity ? 'n/a' : minDe.toFixed(1)) : ''})`);
  ok(lookAlike === 0 && keyClash === 0, `tier ${tier}: no two designs in a Load look alike (${lookAlike}) or share a key (${keyClash})`);
  ok(Math.abs(ratio - P.decoyRatio) < 0.03, `tier ${tier}: decoy ratio ${ratio.toFixed(3)} (target ${P.decoyRatio})`);
  ok(sizeWrong === 0 && silOut === 0, `tier ${tier}: Loads hold 20 pairs and only tier silhouettes ${JSON.stringify(P.silhouettes)}`);
  ok(oddBad === 0 && odd / (pairs / 20) >= 1 && odd / (pairs / 20) <= 3, `tier ${tier}: odd socks have no mate in the Load (${(odd / (pairs / 20)).toFixed(2)} per Load)`);
  ok(Math.abs(io / socks - P.insideOut * (socks - odd) / socks - P.insideOut * 0.5 * odd / socks) < 0.02, `tier ${tier}: inside out share ${(io / socks).toFixed(3)} (target about ${P.insideOut})`);
}
console.log(`  info  ${((performance.now() - t0) / 1000).toFixed(1)} s`);

// matching is by the whole key: two socks of a pair match; base and decoy never do
const L = generateLoad({ seed: 'match-keys', tier: 6, size: 'heavy' });
let pairsOk = true, decoyOk = true;
const byPair = new Map();
for (const s of L.socks) if (s.pair !== null) { const k = specKey(decode(s.seed)); byPair.set(s.pair, [...(byPair.get(s.pair) || []), k]); }
for (const [, ks] of byPair) if (ks.length !== 2 || ks[0] !== ks[1]) pairsOk = false;
for (const p of L.pairs) if (p.decoyOf !== null && specKey(decode(p.seed)) === specKey(decode(L.pairs[p.decoyOf].seed))) decoyOk = false;
ok(pairsOk, 'both socks of every pair carry the same key');
ok(decoyOk, 'no decoy carries its base key');
ok(FIELDS.reduce((a, f) => a + f.bits, 0) === 37, 'the spec is 37 bits wide, as DESIGN 7 lists');
done();
