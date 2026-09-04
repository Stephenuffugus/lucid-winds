/**
 * Seeded randomness. Every random number in Keepsies comes from here.
 *
 * `Math.random` anywhere inside `src/` fails the determinism gate, which injects
 * it on purpose to prove it can catch it (HANDOFF-KEEPSIES 5.5). One stream per
 * subsystem so that adding a cosmetic roll never shifts the match dice: a new
 * consumer that eats from the wrong stream flips every canary downstream, which
 * is the seeded stream law the fleet learned on the wire engine.
 *
 * mulberry32: 32 bit state, integer ops only, identical on every engine.
 */

/** @typedef {{next: () => number, int: (n:number) => number, range: (a:number,b:number)=>number, pick: (arr:any[])=>any, state: () => number, seed: number}} Rng */

/**
 * @param {number} seed any 32 bit integer
 * @returns {Rng}
 */
export function makeRng(seed) {
  let a = seed | 0;
  const next = () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    seed: seed | 0,
    next,
    /** integer in [0, n) */
    int: (n) => Math.floor(next() * n),
    /** float in [a, b) */
    range: (lo, hi) => lo + next() * (hi - lo),
    /** one element of a non empty array */
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    /** the raw state, so a snapshot can restore a stream mid match */
    state: () => a | 0
  };
}

/** Restore a stream that was saved with `state()`. */
export function restoreRng(state) {
  return makeRng(state | 0);
}

/** FNV-1a over a string, so a stream name becomes a seed offset deterministically. */
export function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h | 0;
}

/**
 * The four streams. A subsystem takes its own and never touches another's.
 * @param {number} seed
 * @returns {{match: Rng, drops: Rng, cosmetic: Rng, ai: Rng}}
 */
export function makeStreams(seed) {
  const s = seed | 0;
  return {
    match: makeRng(s ^ hashString('match')),
    drops: makeRng(s ^ hashString('drops')),
    cosmetic: makeRng(s ^ hashString('cosmetic')),
    ai: makeRng(s ^ hashString('ai'))
  };
}
