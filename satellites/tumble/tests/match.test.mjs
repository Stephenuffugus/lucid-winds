// DESIGN 15.3: 10,000 generated pairs+decoys per tier; every decoy differs in exactly one field;
// every pair passes the contrast floor. Plus: no two designs in a Load look the same.
import { suite } from './lib.mjs';
import { generateLoad, tierParams, visualSignature, SIZES, heelDistinct } from '../src/loadgen.js';
import { decode, diffFields, specKey, palettesDistinct, paletteDistance, MODES, DE_FLOOR, FIELDS, paint, bytesHash, NEW_FAMILIES } from '../engine/sockgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

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

// every decoy PAINTS differently from the design it copies (same yarn noise for both, so only the field differs)
{
  const masks = SILHOUETTES.map((s) => buildMask(s, 48));
  let checked = 0, same = 0, heelFail = 0;
  const bad = [], newFam = {};
  for (let tier = 4; tier <= 9; tier++) {
    for (let n = 0; n < 25; n++) {
      const L = generateLoad({ seed: `paint-t${tier}-${n}`, tier, size: 'regular', patternFirst: n % 3 === 2 });
      for (const p of L.pairs) {
        if (p.decoyOf === null) continue;
        const dsp = decode(p.seed), bsp = decode(L.pairs[p.decoyOf].seed);
        bsp.seed = dsp.seed;
        const a = paint(dsp, masks[dsp.silhouette], { size: 48 }), b = paint(bsp, masks[bsp.silhouette], { size: 48 });
        checked++;
        if (NEW_FAMILIES.includes(bsp.family)) newFam[bsp.family] = (newFam[bsp.family] || 0) + 1;
        if (bytesHash(a) === bytesHash(b) && dsp.silhouette === bsp.silhouette) { same++; if (bad.length < 3) bad.push(p.field + ' ' + p.seed.slice(-24)); }
        if (p.field === 'heelToeContrast' && !heelDistinct(bsp, bsp.heelToeContrast, dsp.heelToeContrast)) heelFail++;
      }
    }
  }
  ok(same === 0, `all ${checked} decoys paint differently from the design they copy (${same} identical ${bad.join(', ')})`);
  ok(heelFail === 0, 'every heel and toe decoy clears the colour floor for all four viewers');
  // version 2 Loads (DESIGN-T2 5.2): the six new families are IN what this measured, each with its decoys
  ok(NEW_FAMILIES.every((f) => newFam[f] >= 5), `and that includes decoys of all six version 2 families (${NEW_FAMILIES.map((f) => f + ' ' + (newFam[f] || 0)).join(', ')})`);
}

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
