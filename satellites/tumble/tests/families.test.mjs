// SIX PATTERN FAMILIES, FOR VERSION 2 SEEDS ONLY (DESIGN-T2 5.2): herringbone, basketweave, windowpane, pinstripe,
// tweed, lattice. "Each: its painter, its rhythm parameters, a colour blind check, and its DECOY rule (what one field
// change makes a convincing near twin)."
//
// The DECOY rule rests on one claim per family, RHYTHM_VISIBLE in src/loadgen.js: which bits of the stripe rhythm the
// painter really paints. A rhythm decoy changes those, and the look-alike check compares only those, so the claim
// has to be EXACT: a bit it names must change the picture, a bit it does not name must not. This file proves it by
// painting, bit by bit. The colour blind check holds each new family to the weakest family already shipped, at heap
// size, over every palette and all four ways of seeing.
import { suite } from './lib.mjs';
import { decode, paint, seedFrom, bytesHash, sockName, FAMILY_FUSS, GEN_FAMILIES, NEW_FAMILIES, FAMILIES, FAMILY_NAMES, RHYTHM_FAMILIES, MODES } from '../engine/sockgen.js';
import { deltaE } from '../engine/color.js';
import { RHYTHM_VISIBLE, generateLoad, visualSignature } from '../src/loadgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const { ok, done } = suite('families');
const masks48 = SILHOUETTES.map((s) => buildMask(s, 48));
const masks128 = SILHOUETTES.map((s) => buildMask(s, 128));
const specFor = (fam, pal, r, tag = '') => {
  const sp = decode(seedFrom(`families|${fam}|${pal}|${tag}`) + '~g.2');
  sp.family = fam; sp.patternFamily = GEN_FAMILIES[2].indexOf(fam);
  sp.palette = pal; sp.hue = pal & 63; sp.scheme = pal >> 6; sp.stripeRhythm = r; sp.condition = 0; sp.silhouette = 1;
  return sp;
};

// ---------- the list ----------
ok(GEN_FAMILIES[2].length === 16 && FAMILIES.every((f, i) => GEN_FAMILIES[2][i] === f) && NEW_FAMILIES.every((f, i) => GEN_FAMILIES[2][10 + i] === f),
  'version 2 is the ten, then the six: every one of its 16 values has a family of its own');
ok(NEW_FAMILIES.every((f) => FAMILY_NAMES[f] && RHYTHM_VISIBLE[f] && RHYTHM_FAMILIES.has(f)), 'each has a name, a rhythm it paints and a decoy rule');
ok(GEN_FAMILIES[2].every((f) => FAMILY_FUSS[f] >= 1 && FAMILY_FUSS[f] <= 5), 'every family has a fussiness for the share card, so a herringbone is not ranked as plain as a solid');
{
  // and a sock of each one is CALLED something: the card, the Drawer search and the pop all read sockName
  const bad = [];
  for (let i = 0; i < 3000; i++) {
    const sp = decode(seedFrom('fam-name-' + i) + '~g.2');
    const n = sockName(sp);
    if (/undefined|null|NaN|  /.test(n) || n.split(' ').length < 3) bad.push(`${sp.family}: "${n}"`);
  }
  ok(!bad.length, `every version 2 sock has a proper name${bad.length ? ': ' + [...new Set(bad)].slice(0, 4).join(', ') : ' (3000 seeds, all sixteen families)'}`);
}
{
  const s = seedFrom('families-decode');
  const pf = (hex) => decode(hex).patternFamily;
  // find seeds with each high value, and check version 1 still wraps while version 2 does not
  let wrapped = 0, own = 0;
  for (let i = 0; i < 400; i++) {
    const hex = seedFrom('fam-wrap-' + i), p = pf(hex);
    if (p < 10) continue;
    if (decode(hex).family === FAMILIES[p % 10]) wrapped++;
    if (decode(hex + '~g.2').family === NEW_FAMILIES[p - 10]) own++;
  }
  ok(wrapped > 50 && own === wrapped, `values 10 to 15 still wrap for an unmarked seed (${wrapped}) and have their own family for a marked one (${own})`);
  void s;
}

// ---------- the decoy rule: RHYTHM_VISIBLE is exactly what the painter paints ----------
{
  const wrong = [];
  for (const fam of NEW_FAMILIES) {
    const vis = RHYTHM_VISIBLE[fam];
    for (let bit = 0; bit < 6; bit++) {
      const claims = vis(1 << bit) !== 0 || vis(0) !== vis(1 << bit);
      let changes = false;
      // several palettes and base rhythms, on EVERY silhouette: a claim that holds on a crew sock can fail on a baby
      // sock, whose narrower leg rounds two periods to the same repeat (basketweave did, 23 Sep)
      const perSil = [];
      for (let sil = 0; sil < SILHOUETTES.length; sil++) {
        let silChanges = false;
        for (const [pal, base] of [[20, 0], [100, 5], [170, 18], [230, 41]]) {
          const a = { ...specFor(fam, pal, base, 'bits'), silhouette: sil }, b = { ...specFor(fam, pal, base ^ (1 << bit), 'bits'), silhouette: sil };
          if (bytesHash(paint(a, masks48[sil], { size: 48 })) !== bytesHash(paint(b, masks48[sil], { size: 48 }))) silChanges = true;
        }
        perSil.push(silChanges);
        if (silChanges) changes = true;
      }
      if (claims !== changes) wrong.push(`${fam} bit ${bit}: claimed ${claims}, paints ${changes}`);
      else if (claims && perSil.some((c) => !c)) wrong.push(`${fam} bit ${bit}: invisible on ${perSil.map((c, i) => (c ? null : SILHOUETTES[i].key)).filter(Boolean).join(', ')}`);
    }
  }
  ok(!wrong.length, `each family's rhythm claim is exact, bit by bit${wrong.length ? ': ' + wrong.join(' | ') : ''}`);
  // and so a period decoy (what makeDecoy changes) is always a visible near twin
  let same = 0, n = 0;
  for (const fam of NEW_FAMILIES) for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) {
    if (p === q) continue;
    for (let sil = 0; sil < SILHOUETTES.length; sil++) {
      const a = { ...specFor(fam, 60, p | 4, 'period'), silhouette: sil }, b = { ...specFor(fam, 60, q | 4, 'period'), silhouette: sil };
      if (RHYTHM_VISIBLE[fam](a.stripeRhythm) === RHYTHM_VISIBLE[fam](b.stripeRhythm)) continue;
      n++;
      if (bytesHash(paint(a, masks48[sil], { size: 48 })) === bytesHash(paint(b, masks48[sil], { size: 48 }))) same++;
    }
  }
  ok(n > 0 && same === 0, `every period change paints a different sock, on every silhouette (${n} pairs, ${same} identical)`);
}

// ---------- the colour blind check, against the weakest family already shipped ----------
{
  const share = (fam, pal, mode) => {
    const sp = specFor(fam, pal, (pal * 7) & 63, 'vis');
    const a = paint(sp, masks128[1], { size: 128, mode }), b = paint({ ...sp, family: 'solid' }, masks128[1], { size: 128, mode });
    let n = 0, t = 0;
    for (let i = 0; i < a.length; i += 4) { if (!a[i + 3]) continue; t++; if (deltaE([a[i], a[i + 1], a[i + 2]], [b[i], b[i + 1], b[i + 2]]) >= 10) n++; }
    return n / t;
  };
  const p5 = (fam) => { const v = []; for (let pal = 0; pal < 256; pal += 9) for (const m of MODES) v.push(share(fam, pal, m)); v.sort((a, b) => a - b); return v[Math.floor(v.length * 0.05)]; };
  const shipped = ['stripe', 'polka', 'chevron'].map((f) => ({ f, v: p5(f) })).sort((a, b) => a.v - b.v)[0];
  const weak = NEW_FAMILIES.map((f) => ({ f, v: p5(f) })).filter((x) => x.v < shipped.v);
  ok(!weak.length, `every new family shows at least as well as the weakest shipped one (${shipped.f}, ${(shipped.v * 100).toFixed(1)} percent of the sock at the 5th percentile, all four ways of seeing)${weak.length ? ': ' + weak.map((x) => `${x.f} ${(x.v * 100).toFixed(1)}`).join(', ') : ''}`);
}

// ---------- version 2 Loads: the new families turn up, spread, and their decoys hold ----------
{
  let seen = new Set(), famOver = 0, lookAlike = 0, decoys = 0, identical = 0;
  for (let n = 0; n < 60; n++) {
    const L = generateLoad({ seed: `fam-load-${n}`, mode: 'laundry', size: 'regular', tier: 3 + (n % 7), gen: 2 });
    const bases = L.pairs.filter((p) => p.decoyOf === null && !p.hero).map((p) => decode(p.seed));
    for (const b of bases) seen.add(b.family);
    const fam = {};
    for (const b of bases) fam[b.family] = (fam[b.family] || 0) + 1;
    if (Object.values(fam).some((c) => c > Math.max(2, Math.ceil(bases.length / 5)))) famOver++;
    for (const p of L.pairs) {
      if (p.decoyOf === null) continue;
      const d = decode(p.seed), b = decode(L.pairs[p.decoyOf].seed);
      if (!NEW_FAMILIES.includes(b.family)) continue;
      decoys++;
      if (visualSignature(d) === visualSignature(b)) lookAlike++;
      const bb = { ...b, seed: d.seed };
      if (bytesHash(paint(d, masks48[d.silhouette], { size: 48 })) === bytesHash(paint(bb, masks48[bb.silhouette], { size: 48 })) && d.silhouette === b.silhouette) identical++;
    }
  }
  ok(NEW_FAMILIES.every((f) => seen.has(f)), `all six turn up in version 2 Loads (${NEW_FAMILIES.filter((f) => seen.has(f)).length} of 6)`);
  ok(famOver === 0, 'no family takes more than a fifth of a Load\'s base pairs, with sixteen to spread across');
  ok(decoys > 20 && lookAlike === 0 && identical === 0, `every decoy of a new family is a real near twin: never the same look, never the same paint (${decoys} decoys)`);
}

done();
