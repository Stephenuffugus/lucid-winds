/* CORE, the pure half (plans/math/HANDOFF-CORE.md 3.2).
 *
 * Everything the nine games share that can be computed without a screen lives
 * here, and Node imports this very file for the gates, so a law in
 * test/pure.mjs is a law about what a Chromebook runs.
 *
 * ⛔ Nothing in this file names document, window, Date, performance,
 * Math.random or setTimeout. tools/lint.mjs refuses it. Randomness is always an
 * rng handed in, so a gate can replay any round from its seed.
 */

/* ---- rng ---- */
/* mulberry32, the fleet's stream (satellites/wardian/index.html, makeRNG). Same
   seed, same draws, in Node and in the browser. */
export function rng(seed) {
  let a = seed >>> 0;
  const r = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = n => Math.floor(r() * n);
  r.range = (lo, hi) => lo + r() * (hi - lo);
  r.state = () => a >>> 0;
  return r;
}
