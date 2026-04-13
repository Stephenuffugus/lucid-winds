'use strict';
// Mulberry32 seeded RNG
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  const r = mulberry32(seed);
  return {
    next: r,
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    range: (min, max) => r() * (max - min) + min,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    // Weighted pick over {key: weight}
    weighted: (obj) => {
      const keys = Object.keys(obj);
      let total = 0;
      for (const k of keys) total += obj[k];
      let roll = r() * total;
      for (const k of keys) {
        roll -= obj[k];
        if (roll <= 0) return k;
      }
      return keys[keys.length - 1];
    }
  };
}

module.exports = { mulberry32, makeRng };
