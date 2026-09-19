// The Greedy policy core: "best single placement by preview Lux". Shared by the board generator's score
// check (Nights 1-3: the Greedy bot with the untouched starter pouch must reach the target in at least
// 60% of 200 shuffles) and by the harness bots. Pure and deterministic.
import { DATA } from './data.js';
import { rng } from './rng.js';
import { grid } from './hex.js';
import { cast } from './cast.js';
import { segments } from './trace.js';
import { inclusionFlags } from './settings.js';

// For each empty cell some beam enters in the preview: the set of directions it is entered with.
export function litMap(events, radius) {
  const m = new Map();
  for (const s of segments(events, radius)) {
    for (const c of s.cells) {
      let set = m.get(c);
      if (!set) m.set(c, (set = new Set()));
      set.add(s.dir);
    }
  }
  return m;
}

// Facings worth trying for a gem at a cell entered from `dirs`: a Mirror only matters where a lit
// direction meets its face obliquely (f = d + 2 or d + 4); a Lens or an emitting gem tries all six.
export function usefulFacings(gem, dirs, data = DATA) {
  const def = data.cut[gem.cut];
  const f = inclusionFlags(gem.inclusion || null, data);
  if (def.fn === 'reflect' && !f.emitAtStart && !f.rotateAfterStrike) {
    const out = new Set();
    for (const d of dirs) { out.add((d + 2) % 6); out.add((d + 4) % 6); }
    return [...out].sort((a, b) => a - b);
  }
  if (def.facing || f.emitAtStart || f.rotateAfterStrike) return [0, 1, 2, 3, 4, 5];
  return [0];
}

const kindKey = (g) => `${g.cut}|${g.stone}|${g.tier}|${g.inclusion || ''}`;

// Best single placement of a hand gem on a lit empty cell. `board` is a cast() board (mutated then
// restored), `hand` a list of gem specs, `blocked(cell)` says a cell cannot take a gem.
// Returns { index, cell, facing, lux } or null when nothing raises preview Lux by at least minGain.
export function bestSingle(board, hand, ctx, blocked, data = DATA, minGain = 1) {
  const base = cast(board, { ...ctx, events: true }, data);
  const lit = litMap(base.events, board.radius);
  const cells = [...lit.keys()].filter((c) => !blocked(c)).sort((a, b) => a - b);
  let best = null;
  const tried = new Set();
  for (let i = 0; i < hand.length; i++) {
    const gm = hand[i];
    const key = kindKey(gm);
    if (tried.has(key)) continue;
    tried.add(key);
    for (const cell of cells) {
      for (const facing of usefulFacings(gm, lit.get(cell), data)) {
        board.gems.push({ cell, cut: gm.cut, stone: gm.stone, tier: gm.tier | 0, inclusion: gm.inclusion || null, facing, gemId: gm.gemId | 0, nightsSurvived: gm.nightsSurvived | 0 });
        const lux = cast(board, { ...ctx, events: false }, data).lux;
        board.gems.pop();
        if (!best || lux > best.lux) best = { index: i, cell, facing, lux };
      }
    }
  }
  return best && best.lux >= base.lux + minGain ? { ...best, base: base.lux } : null;
}

// One Night played by Greedy with a fresh pouch (the board score check). Returns true on a clear.
// b: a generated board; pouch: gem specs; emitters: resolved Lantern beams.
export function greedyNight(b, pouch, emitters, target, seed, data = DATA) {
  const R = data.rules;
  const g = grid(b.radius);
  const R0 = rng(seed, 'scorecheck');
  const pile = pouch.map((x, i) => ({ ...x, gemId: i }));
  R0.shuffle(pile);
  const hand = [];
  const isMirror = (x) => data.cut[x.cut].fn === 'reflect';
  const draw = (n) => { for (let k = 0; k < n && pile.length; k++) hand.push(pile.shift()); };
  draw(R.night.handSize);
  let have = hand.filter(isMirror).length;
  while (have < R.night.openingMirrors) {
    const j = pile.findIndex(isMirror);
    const i = hand.map(isMirror).lastIndexOf(false);
    if (j < 0 || i < 0) break;
    const t = hand[i]; hand[i] = pile[j]; pile[j] = t;
    have++;
  }
  const board = {
    radius: b.radius, walls: b.walls, dark: b.dark, bright: b.bright, fog: b.fog, emitters,
    apertures: b.apertures, gems: b.fixed.map((f, i) => ({ ...f, gemId: 1e6 + i })),
  };
  const taken = new Uint8Array(g.n);
  for (const c of b.walls) taken[c] = 1;
  for (const l of b.lanterns) taken[l.cell] = 1;
  for (const a of b.apertures) taken[a.cell] = 1;
  for (const f of b.fixed) taken[f.cell] = 1;
  const blocked = (c) => taken[c] === 1;
  let lux = 0;
  for (let c = 0; c < R.night.casts; c++) {
    const ctx = { settings: [], eclipse: null, lanternRules: [], castNumber: c + 1 };
    const limit = c === 0 ? R.night.placementsFirst : R.night.placementsLater;
    for (let p = 0; p < limit && hand.length; p++) {
      const best = bestSingle(board, hand, ctx, blocked, data);
      if (!best) break;
      const gm = hand.splice(best.index, 1)[0];
      board.gems.push({ cell: best.cell, cut: gm.cut, stone: gm.stone, tier: 0, inclusion: null, facing: best.facing, gemId: gm.gemId, nightsSurvived: 0 });
      taken[best.cell] = 1;
    }
    lux += cast(board, { ...ctx, events: false }, data).lux;
    if (lux >= target) return true;
    draw(Math.max(0, R.night.handSize - hand.length));
  }
  return false;
}

// Section 6 score check: Greedy with the untouched starter pouch clears the target in at least
// passRate of `shuffles` shuffles. Stops as soon as the outcome is decided (exactly the same verdict).
export function scoreCheck(b, pouch, emitters, target, seedBase, data = DATA) {
  const S = data.features.gen.scoreCheck;
  const need = Math.ceil(S.passRate * S.shuffles);
  let pass = 0, fail = 0;
  for (let i = 0; i < S.shuffles; i++) {
    if (greedyNight(b, pouch, emitters, target, `${seedBase}:${i}`, data)) pass++; else fail++;
    if (pass >= need) return { ok: true, pass, fail, tried: i + 1 };
    if (fail > S.shuffles - need) return { ok: false, pass, fail, tried: i + 1 };
  }
  return { ok: pass >= need, pass, fail, tried: S.shuffles };
}
