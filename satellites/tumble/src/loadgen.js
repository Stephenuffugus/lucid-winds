// The Load generator (DESIGN 3, 5). A Load = { seed, mode, size, tier }.
// Pure: no DOM, no three.js. The same inputs always give the same Load (DESIGN 9.7, 15.10).

import { sha256 } from '../engine/sha256.js';
import {
  decode, mutate, specKey, diffFields, palettesDistinct, paletteColors, RHYTHM_FAMILIES, ASYMMETRIC, MOTIFS, FAMILIES, DE_FLOOR, MODES,
  motifIndex, motifMirror, motifDensity,
} from '../engine/sockgen.js';
import { deltaE } from '../engine/color.js';
import { LENGTH_LADDER, silhouettesForTier, SILHOUETTES } from './silhouettes.js';
import { rng32 } from './mathx.js';

export const SIZES = { small: 10, regular: 20, heavy: 35, mountain: 50 };
export const SIZE_NAMES = { small: 'Small', regular: 'Regular', heavy: 'Heavy', mountain: 'Mountain' };
export const MAX_TILES = 64;

// Tier rises with Loads completed in that mode, capped at (Eyes pegs + 2) (DESIGN 5).
const TIER_AT = [0, 2, 4, 7, 10, 14, 19, 25, 32, 40];
export function tierFor(loadsInMode, eyesPegs) {
  let t = 0;
  for (let i = 0; i < TIER_AT.length; i++) if (loadsInMode >= TIER_AT[i]) t = i;
  return Math.max(0, Math.min(9, t, eyesPegs + 2));
}

// DESIGN 5 table, filled in where it gives a range.
export function tierParams(tier) {
  const t = Math.max(0, Math.min(9, tier));
  const fields = t === 0 ? [] : t <= 3 ? ['palette'] : t <= 6 ? ['palette', 'silhouette', 'stripeRhythm'] : ['palette', 'silhouette', 'stripeRhythm', 'mirror', 'heelToeContrast'];
  return {
    tier: t,
    decoyRatio: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9][t],
    decoyFields: fields,
    insideOut: [0, 0, 0.1, 0.1, 0.2, 0.25, 0.3, 0.33, 0.36, 0.4][t],
    silhouettes: silhouettesForTier(t),
    // 5.625 degrees per step. A colour decoy at low tiers is a clearly different colour (67 degrees, green against
    // yellow or blue), not a neighbour (Stephen, Sep 17: four white and green pairs in one Load); the hard tiers close in.
    hueSteps: t <= 3 ? 12 : t <= 6 ? 8 : t === 7 ? 5 : t === 8 ? 4 : 3,   // 67.5, 45, 28.1, 22.5, 16.9 degrees
    lintFog: t >= 6,
    kidShare: 0.12,
    conditionShare: t < 2 ? 0 : 0.22,
  };
}

// Which bits of the 6-bit stripe rhythm each family actually paints (engine/sockgen.js paint()).
// bits 0-1 period, 2-3 duty, 4 double, 5 alternate colours.
export const RHYTHM_VISIBLE = {
  stripe: (r) => r,
  chevron: (r) => r & 0b101111,
  polka: (r) => r & 0b101111,
  argyle: (r) => ((r & 3) >= 2 ? 1 : 0),
  plaid: (r) => r & 3,
  fairIsle: (r) => r & 0b110011,
  gradient: (r) => r & 3,
};

// The fields a viewer can actually see for this sock, so two different keys never look the same.
export function visualSignature(spec) {
  const parts = [spec.silhouette, spec.patternFamily % FAMILIES.length, spec.palette, spec.cuffStyle, spec.heelToeContrast, spec.size, spec.condition];
  const fam = spec.family;
  const vis = RHYTHM_VISIBLE[fam];
  if (vis) parts.push('r' + vis(spec.stripeRhythm));
  if (fam === 'motifScatter') {
    const shape = motifIndex(spec.motif);
    const mirror = ASYMMETRIC.has(MOTIFS[shape]) ? motifMirror(spec.motif) : 0;
    parts.push('m' + shape + '.' + mirror + '.' + motifDensity(spec.motif));
  }
  if (spec.hero) parts.push('h' + spec.hero);
  return parts.join(',');
}

// Can `field` make a visible decoy of this spec?
export function decoyApplies(spec, field) {
  if (spec.hero) return false;
  switch (field) {
    case 'palette': return true;
    case 'silhouette': return LENGTH_LADDER.includes(spec.silhouette);
    case 'stripeRhythm': return RHYTHM_FAMILIES.has(spec.family);
    case 'mirror': return spec.family === 'motifScatter' && ASYMMETRIC.has(spec.motifShape);
    case 'heelToeContrast': return true;
    default: return false;
  }
}

// Build the decoy seed for a base seed by mutating exactly one field (DESIGN 3.2, 7).
export function makeDecoy(baseSeed, field, rand, params, allowedSils) {
  const spec = decode(baseSeed);
  switch (field) {
    case 'palette': {
      const dir = rand() < 0.5 ? -1 : 1;
      for (let extra = 0; extra < 20; extra++) {
        const steps = params.hueSteps + extra;
        for (const d of [dir, -dir]) {
          const hue = (spec.hue + d * steps + 64) & 63;
          const pal = (spec.scheme << 6) | hue;
          if (palettesDistinct(spec.palette, pal, DE_FLOOR)) return mutate(baseSeed, 'palette', pal);
        }
      }
      return null;
    }
    case 'silhouette': {
      const i = LENGTH_LADDER.indexOf(spec.silhouette);
      const opts = [LENGTH_LADDER[i - 1], LENGTH_LADDER[i + 1]].filter((x) => x !== undefined && allowedSils.includes(x));
      if (!opts.length) return null;
      return mutate(baseSeed, 'silhouette', opts[Math.floor(rand() * opts.length)]);
    }
    case 'stripeRhythm': {
      // change the period, in a way this family actually paints (argyle only knows narrow or wide)
      const vis = RHYTHM_VISIBLE[spec.family] || ((r) => r);
      const p = spec.stripeRhythm & 3;
      const choices = [0, 1, 2, 3].filter((q) => q !== p && vis((spec.stripeRhythm & ~3) | q) !== vis(spec.stripeRhythm));
      if (!choices.length) return null;
      const q = choices[Math.floor(rand() * choices.length)];
      return mutate(baseSeed, 'stripeRhythm', (spec.stripeRhythm & ~3) | q);
    }
    case 'mirror': // bit 4 of the motif field, see MOTIFS in engine/sockgen.js
      return mutate(baseSeed, 'motif', spec.motif ^ 16);
    case 'heelToeContrast': {
      // the heel and toe colour must change by the same floor as a colour decoy, for every viewer
      const opts = [0, 1, 2, 3].filter((q) => q !== spec.heelToeContrast && heelDistinct(spec, spec.heelToeContrast, q));
      if (!opts.length) return null;
      return mutate(baseSeed, 'heelToeContrast', opts[Math.floor(rand() * opts.length)]);
    }
    default: return null;
  }
}

function seedInt(s) { return parseInt(sha256(s).slice(0, 8), 16); }

export function heelColour(spec, level, mode) {
  const pal = paletteColors(spec.palette, mode);
  return [pal.body, pal.body.map((c) => c * 0.72), pal.accent2, pal.accent][level];
}
export function heelDistinct(spec, a, b) {
  for (const m of MODES) if (deltaE(heelColour(spec, a, m), heelColour(spec, b, m), m) < DE_FLOOR) return false;
  return true;
}

// opts: { seed, mode, size, tier, oddBin: [{ sockSeed }], heroes: [hero defs owned], patternFirst, sizeCount }
export function generateLoad(opts) {
  const seed = String(opts.seed);
  const params = tierParams(opts.tier || 0);
  const rand = rng32(seedInt(seed + '|rng'));
  const nPairs = opts.sizeCount || SIZES[opts.size || 'regular'] || 20;
  const allowedSils = params.silhouettes;
  const pairs = [];
  const sigs = new Set();
  const keys = new Set();
  const specs = [];

  const clash = (spec) => {
    if (keys.has(specKey(spec)) || sigs.has(visualSignature(spec))) return true;
    // unrelated designs that differ only by colour must still be clearly different colours
    for (const o of specs) {
      const d = diffFields(spec, o).filter((f) => f !== 'pairId');
      if (d.length === 0) return true;
      if (d.length === 1 && d[0] === 'palette' && !palettesDistinct(spec.palette, o.palette)) return true;
    }
    return false;
  };
  const accept = (spec) => { keys.add(specKey(spec)); sigs.add(visualSignature(spec)); specs.push(spec); };

  // Spread (Stephen, Sep 17: "a load with 20 that had 4 pairs of white and green socks and it was just a mess"): the
  // base designs are spread across the pattern families and around the hue wheel, so a Load's only lookalikes are its
  // decoys. The same pattern within 67 degrees of hue reads as the same sock; one colour scheme keeps at most three
  // designs inside any 67 degree slice; no family takes more than a fifth of the base pairs.
  const bases = [];
  const famCap = Math.max(2, Math.ceil((nPairs - Math.round(nPairs * params.decoyRatio)) / 5));
  const hueDist = (a, b) => { const d = Math.abs(a - b) % 64; return Math.min(d, 64 - d); };
  // level 2 = the whole rule, level 1 = only "not the same sock", level 0 = anything that is not a clash
  const spreadOk = (spec, level) => {
    if (level === 0) return true;
    let fam = 0, near = 0;
    for (const o of bases) {
      const dh = hueDist(spec.hue, o.hue);
      if (o.family === spec.family) {
        fam++;
        const sameShape = spec.family !== 'motifScatter' || motifIndex(spec.motif) === motifIndex(o.motif);
        if (sameShape && dh <= 12) return false;
      }
      if (o.scheme === spec.scheme && dh <= 6) near++;
    }
    return level === 1 || (fam < famCap && near < 2);
  };

  const baseSeed = (tag) => {
    for (let a = 0; a < 900; a++) {
      const s = sha256(`${seed}|${tag}|${a}`);
      const sp = decode(s);
      if (!allowedSils.includes(sp.silhouette)) continue;
      if (sp.size === 1 && rand() > params.kidShare) continue;
      if (sp.condition !== 0 && rand() > params.conditionShare) continue;
      if (clash(sp)) continue;
      // the whole spread rule for the first 400 candidates, then only "not the same sock", then anything (a Load
      // that cannot spread further still fills)
      if (!spreadOk(sp, a < 400 ? 2 : a < 800 ? 1 : 0)) continue;
      return s;
    }
    throw new Error('loadgen: could not find a base design for ' + tag);
  };

  // heroes owned: about one pair in ten is a hero, chosen by spawnWeight (DESIGN 8, 9.5)
  const heroPool = (opts.heroes || []).filter((h) => h.rarity !== 'odd' && (h.spawnWeight || 0) > 0 && h.source !== 'reunion' && h.source !== 'portal');
  let heroPairs = heroPool.length ? Math.max(1, Math.round(nPairs * 0.1)) : 0;
  const usedHeroes = new Set();
  const pickHero = (pool) => {
    const avail = pool.filter((h) => !usedHeroes.has(h.id));
    const tot = avail.reduce((a, h) => a + (h.spawnWeight || 1), 0);
    let r = rand() * tot;
    for (const h of avail) { r -= h.spawnWeight || 1; if (r <= 0) { usedHeroes.add(h.id); return h; } }
    return avail[0] || null;
  };

  const nDecoys = Math.round(nPairs * params.decoyRatio);
  let fields = params.decoyFields.slice();
  if (opts.patternFirst) {
    // DESIGN 12 pattern first: decoys never differ by hue alone
    fields = fields.filter((f) => f !== 'palette' && f !== 'heelToeContrast');
    if (!fields.length && params.decoyRatio > 0) fields = ['stripeRhythm'];
  }

  // base pairs first, then decoys of randomly chosen bases
  const nBase = nPairs - nDecoys;
  for (let i = 0; i < nBase; i++) {
    if (heroPairs > 0 && i % 7 === 3) {
      const h = pickHero(heroPool);
      if (h) {
        heroPairs--;
        const hs = 'hero:' + h.id;
        const sp = decode(hs);
        sp.silhouette = SILHOUETTES.findIndex((s) => s.key === h.silhouette);
        pairs.push({ seed: hs, hero: h.id, decoyOf: null, field: null });
        keys.add(specKey(sp));
        continue;
      }
    }
    let s;
    if (opts.patternFirst && fields.length && i < nDecoys) {
      // pattern first: pick bases with room for many pattern variants (a length ladder AND a stripe rhythm),
      // so the decoy share holds without colour
      let best = null, bestScore = -1;
      for (let a = 0; a < 60; a++) {
        const c = baseSeed(`pair${i}.${a}`);
        const sp = decode(c);
        const score = fields.filter((f) => decoyApplies(sp, f)).length + (sp.family === 'argyle' ? 0 : 0.5);
        if (score > bestScore) { best = c; bestScore = score; }
        if (score >= Math.min(2.5, fields.length)) break;
      }
      s = best;
    } else s = baseSeed(`pair${i}`);
    accept(decode(s));
    bases.push(decode(s));
    pairs.push({ seed: s, hero: null, decoyOf: null, field: null });
  }
  // a decoy imitates any pair already in the Load (a decoy of a decoy is still one field away from
  // the pair it copies), which is what lets tier 9 reach 90% without running out of variants
  let made = 0, guard = 0;
  while (made < nDecoys && guard++ < nDecoys * 60) {
    const bi = Math.floor(rand() * pairs.length);
    const base = pairs[bi];
    if (!base || base.hero) continue;
    const bs = decode(base.seed);
    const applicable = fields.filter((f) => decoyApplies(bs, f));
    if (!applicable.length) continue;
    const field = applicable[Math.floor(rand() * applicable.length)];
    const ds = makeDecoy(base.seed, field, rand, params, allowedSils);
    if (!ds) continue;
    const dsp = decode(ds);
    if (clash(dsp)) continue;
    accept(dsp);
    pairs.push({ seed: ds, hero: null, decoyOf: bi, field });
    made++;
  }
  // if the tier's fields could not reach the ratio, fill with plain pairs so the size holds
  while (pairs.length < nPairs) {
    const s = baseSeed(`fill${pairs.length}`);
    accept(decode(s));
    bases.push(decode(s));
    pairs.push({ seed: s, hero: null, decoyOf: null, field: null });
  }

  // odd socks: 1 to 3; 30% chance one mates with something in the Odd Bin (DESIGN 5)
  // Any odd sock whose twin already waits in the Bin is a Reunion, however it got into the Load.
  const odd = [];
  let nOdd = 1 + Math.floor(rand() * 3);
  const binSeeds = new Set((opts.oddBin || []).map((b) => b && b.sockSeed).filter(Boolean));
  const bin = [...binSeeds].filter((s) => !keys.has(specKey(decode(s))));
  const wantReunion = bin.length > 0 && rand() < 0.3;
  const portal = !!opts.portalHero;
  // a portal Load keeps slot 0 for its stranger, so the reunion needs another slot (keeps the 30% rate)
  if (portal && wantReunion && nOdd < 2) nOdd = 2;
  const reunionAt = !wantReunion ? -1 : portal ? 1 + Math.floor(rand() * (nOdd - 1)) : Math.floor(rand() * nOdd);
  const reunionSeed = wantReunion ? bin[Math.floor(rand() * bin.length)] : null;
  const oddHeroes = (opts.heroes || []).filter((h) => h.rarity === 'odd' && h.source === 'pack');
  const usedOdd = new Set();
  const pushOdd = (seed, hero, reunion) => {
    const sp = decode(seed);
    keys.add(specKey(sp));
    sigs.add(visualSignature(sp));
    usedOdd.add(seed);
    odd.push({ seed, reunion: reunion || binSeeds.has(seed), hero });
  };
  for (let i = 0; i < nOdd; i++) {
    if (i === 0 && portal) {
      // a portal Load (DESIGN 9.6 page 8): one sock that belongs to no one
      pushOdd('hero:' + opts.portalHero, opts.portalHero, false);
      continue;
    }
    if (i === reunionAt && reunionSeed && !usedOdd.has(reunionSeed)) {
      pushOdd(reunionSeed, decode(reunionSeed).hero || null, true);
      continue;
    }
    if (oddHeroes.length && rand() < 0.35) {
      const avail = oddHeroes.filter((h) => !usedOdd.has('hero:' + h.id) && 'hero:' + h.id !== reunionSeed);
      const h = avail.length ? pickHero(avail) : null;
      if (h) { pushOdd('hero:' + h.id, h.id, false); continue; }
    }
    const s = baseSeed(`odd${i}`);
    accept(decode(s));
    bases.push(decode(s));
    usedOdd.add(s);
    odd.push({ seed: s, reunion: binSeeds.has(s), hero: null });
  }

  // the socks themselves, shuffled; inside out by tier (heroes only when allowed)
  const socks = [];
  const heroDef = new Map((opts.heroes || []).map((h) => [h.id, h]));
  const ioAllowed = (heroId) => !heroId || ((heroDef.get(heroId) || {}).conditionAllowed || []).includes('insideOut');
  pairs.forEach((p, i) => {
    for (let k = 0; k < 2; k++) socks.push({ seed: p.seed, pair: i, odd: null, insideOut: ioAllowed(p.hero) && rand() < params.insideOut, hero: p.hero });
  });
  odd.forEach((o, i) => socks.push({ seed: o.seed, pair: null, odd: i, insideOut: ioAllowed(o.hero) && rand() < params.insideOut * 0.5, hero: o.hero }));
  for (let i = socks.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [socks[i], socks[j]] = [socks[j], socks[i]]; }

  const tiles = new Set(socks.map((s) => s.seed));
  if (tiles.size > MAX_TILES) throw new Error(`loadgen: ${tiles.size} tiles > ${MAX_TILES}`);
  return { seed, mode: opts.mode || 'laundry', size: opts.size || 'regular', tier: params.tier, params, pairs, odd, socks, tiles: [...tiles], fog: opts.mode === 'rush' && params.lintFog };
}

// Daily Load: seed = SHA-256 of the date (DESIGN 9.7). Same date, same Load, on every device.
// The Daily is always built pattern first (no colour only decoys), so the accessibility toggle never makes
// two players' Dailies differ. It uses no Odd Bin and no hero packs, and never feeds the Odd Bin (applyResults).
export function dailyLoad(dateStr, mode) {
  const seed = sha256('tumble-daily|' + dateStr);
  const tier = 3 + (parseInt(seed.slice(0, 2), 16) % 4);
  return generateLoad({ seed, mode, size: 'regular', tier, oddBin: [], heroes: [], patternFirst: true, daily: dateStr });
}

export function localDateString(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
