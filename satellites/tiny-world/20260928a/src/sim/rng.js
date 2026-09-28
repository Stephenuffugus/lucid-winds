// Seeded randomness for the sim. mulberry32; Math.random is banned in src/sim.
export function makeRng(seed) {
  const r = {
    s: seed | 0,
    float() {
      r.s = (r.s + 0x6d2b79f5) | 0;
      let t = Math.imul(r.s ^ (r.s >>> 15), 1 | r.s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
  return r;
}

export const rnd = (w, a, b) => a + w.rng.float() * (b - a);
export const pick = (w, arr) => arr[Math.floor(w.rng.float() * arr.length)];
// pick(w, [a, b]) without the array: the same one draw, the same choice.
export const pick2 = (w, a, b) => (Math.floor(w.rng.float() * 2) ? b : a);
