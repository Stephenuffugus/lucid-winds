// One function per cut behaviour, dispatched on cuts[].fn (never on a gem id).
// Signature: (k, b, gem, p) -> outputs[] where each output is { b, route: 'move'|'store'|'score', emitted }.
//   k: the cast kernel (child creation, colour setting with Red Moon, beam ending, compiled hooks)
//   b: the arriving beam (mutated in place when it continues)
//   gem: the prepared gem (for facing, Lens fires)
//   p: { eff, sc, facing, headOn, useSettings }  (Echo re-runs pass useSettings: false and Rough values)
// A cut that ends the arriving beam calls k.kill(b, reason); it never emits events itself, so the
// kernel can report every strike with the final, post-Sympathy numbers.
import { popcount, whenHolds } from './settings.js';

const mod6 = (x) => ((x % 6) + 6) % 6;

// Mirror plate facing f: struck when (d - f) mod 6 is 2, 3 or 4 (any direction when all faces
// reflect). Oblique hits leave in (2f + 3 - d) mod 6 (a 60-degree turn); a head-on hit is a strike that
// no 60/120-degree turn fits, so the beam carries on straight (R5, data `headOn`).
export function mirrorStrikes(d, f, allFaces) {
  if (allFaces) return true;
  const k = mod6(d - f);
  return k === 2 || k === 3 || k === 4;
}
export const mirrorOut = (d, f) => mod6(2 * f + 3 - d);

const move = (b) => ({ b, route: 'move', emitted: false });

export const CUT_FNS = {
  reflect(k, b, gem, p) {
    const rel = mod6(b.dir - p.facing);
    if (rel === 3 || rel === 0) { // head-on (R5): a strike no 60/120-degree turn fits
      if (p.headOn === 'absorb') { k.kill(b, 'absorbed'); return []; }
      if (p.headOn !== 'reflect') return [move(b)]; // 'pass': the beam carries on straight
    }
    b.dir = mirrorOut(b.dir, p.facing);
    return [move(b)];
  },

  amplify(k, b, gem, p) {
    b.intensity += p.eff;
    return [move(b)];
  },

  split(k, b, gem, p) {
    const d = b.dir, I = b.intensity, c = b.color, h = k.h;
    let colors = [c, c];
    let intensity = Math.ceil(I / 2);
    if (p.useSettings && h.splitColors && whenHolds(h.splitColors.when, gem, c)) { colors = h.splitColors.colors; intensity = I; }
    if (p.useSettings && h.splitFraction && whenHolds(h.splitFraction.when, gem, c)) intensity = Math.ceil((h.splitFraction.num * I) / h.splitFraction.den); // R6
    k.kill(b, 'split');
    const out = [];
    const c1 = k.makeChild(b, mod6(d - 1), colors[0], intensity);
    if (c1) out.push(move(c1));
    const c2 = k.makeChild(b, mod6(d + 1), colors[1], intensity);
    if (c2) out.push(move(c2));
    return out;
  },

  filter(k, b, gem, p) {
    const nc = b.color & p.sc;
    if (nc === 0) { k.kill(b, 'filter'); return []; }
    if (!k.setColor(b, nc)) { k.kill(b, 'color'); return []; }
    b.focus10 += p.eff;
    return [move(b)];
  },

  disperse(k, b, gem, p) {
    const c = b.color;
    if (popcount(c) <= 1) return [move(b)]; // R7: a single colour passes straight; not an emission
    const d = b.dir;
    k.kill(b, 'split');
    const out = [];
    const legs = [[1, mod6(d - 1)], [2, d], [4, mod6(d + 1)]];
    for (const [bit, dir] of legs) {
      if ((c & bit) === 0) continue;
      const ch = k.makeChild(b, dir, bit, b.intensity);
      if (ch) out.push({ b: ch, route: 'move', emitted: p.useSettings });
    }
    return out;
  },

  store(k, b, gem, p) {
    if (gem.firesUsed >= k.h.lensFires) { k.kill(b, 'lost'); return []; }
    return [{ b, route: 'store', emitted: false }];
  },

  resonate(k, b, gem, p) {
    b.focus10 += p.eff; // the kernel passes the shared / exact value already weighted (0 when none applies)
    return [move(b)];
  },

  echo(k, b) {
    return [move(b)]; // the kernel resolves Echo itself (history lookup and Rough re-run)
  },

  tint(k, b, gem, p) {
    if (!k.setColor(b, b.color | p.sc)) { k.kill(b, 'color'); return []; }
    return [move(b)];
  },

  absorb(k, b, gem, p) {
    k.scoreGeode(b, gem, p); // R14: scored inside the cut, before any per-strike addition
    k.kill(b, 'geode');
    return [];
  },
};
