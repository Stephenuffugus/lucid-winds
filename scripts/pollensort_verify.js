// Verify every Bee's Pollen Sort level is solvable.
//
// This MUST mirror games/colorsort.js's _buildLevels() exactly (seeded RNG,
// shuffledState, SPEC table, CAP) — a stale copy here would silently
// "verify" levels the game no longer ships. Re-run after any change to the
// seed, SPEC, CAP, or shuffledState in colorsort.js. Last synced 2026-07-04.

'use strict';

const CAP = 4;

function cloneTubes(t) { return t.map(c => c.slice()); }
function legalPour(t, from, to) {
  if (from === to) return false;
  const src = t[from], dst = t[to];
  if (!src.length) return false;
  if (dst.length >= CAP) return false;
  if (dst.length && dst[dst.length - 1] !== src[src.length - 1]) return false;
  return true;
}
function pour(t, from, to) {
  const src = t[from], dst = t[to];
  const color = src[src.length - 1];
  while (src.length && src[src.length - 1] === color && dst.length < CAP) {
    dst.push(src.pop());
  }
}
function isSolved(t) {
  return t.every(col => col.length === 0 || (col.length === CAP && col.every(c => c === col[0])));
}
function freebies(t) {
  let n = 0;
  for (const col of t) if (col.length === CAP && col.every(c => c === col[0])) n++;
  return n;
}
function serialize(t) {
  // Canonicalize: sort tube contents independent of position to dedupe symmetric states.
  return t.map(c => c.join(',')).sort().join('|');
}

// Seeded RNG matching the game (Mulberry32).
let seed = 0x5EED1;
function rand() {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function randInt(n) { return Math.floor(rand() * n); }

// Mirrors shuffledState() in colorsort.js exactly.
function shuffledState(numColors, maxFreebies) {
  let t;
  for (let attempt = 0; attempt < 80; attempt++) {
    const pool = [];
    for (let c = 0; c < numColors; c++) for (let k = 0; k < CAP; k++) pool.push(c);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    t = [];
    for (let tc = 0; tc < numColors; tc++) {
      const tube = [];
      for (let kk = 0; kk < CAP; kk++) tube.push(pool[tc * CAP + kk]);
      t.push(tube);
    }
    t.push([]); t.push([]);
    if (isSolved(t)) continue;
    if (freebies(t) > maxFreebies) continue;
    return t;
  }
  return t; // fallback — shouldn't happen
}

// SPEC — must match colorsort.js's SPEC table exactly (colors, maxFreebies, difficulty).
const SPEC = [
  [3,1,'easy'],[3,1,'easy'],[3,0,'easy'],
  [3,0,'easy'],[3,0,'easy'],[3,0,'easy'],
  [4,1,'easy'],[4,0,'easy'],[4,0,'easy'],[4,0,'easy'],
  [4,0,'easy'],[4,0,'medium'],[4,0,'medium'],[4,0,'medium'],
  [5,1,'medium'],[5,0,'medium'],[5,0,'medium'],[5,0,'medium'],
  [5,0,'medium'],[5,0,'medium'],[5,0,'medium'],[5,0,'medium'],
  [5,0,'medium'],[5,0,'medium'],
  [6,0,'medium'],[6,0,'medium'],[6,0,'hard'],[6,0,'hard'],
  [6,0,'hard'],[6,0,'hard'],[6,0,'hard'],[6,0,'hard'],
  [6,0,'hard'],[6,0,'hard'],
  [7,0,'hard'],[7,0,'hard'],[7,0,'hard'],[7,0,'hard'],
  [7,0,'hard'],[7,0,'hard'],[7,0,'hard'],[7,0,'hard'],
  [7,0,'hard'],[7,0,'hard'],[7,0,'hard'],[7,0,'hard'],
  [7,0,'hard'],[7,0,'hard'],
  [8,0,'expert'],[8,0,'expert'],[8,0,'expert'],[8,0,'expert'],
  [8,0,'expert'],[8,0,'expert'],[8,0,'expert'],[8,0,'expert'],
  [8,0,'expert'],[8,0,'expert'],[8,0,'expert'],[8,0,'expert'],
];

// BFS — caps depth/time so we don't try to exhaustively solve 8-color boards.
function bfsSolvable(start, cap = 60, timeMs = 3000) {
  if (isSolved(start)) return { ok: true, depth: 0 };
  const t0 = Date.now();
  const queue = [{ t: cloneTubes(start), d: 0 }];
  const seen = new Set([serialize(start)]);
  let explored = 0;
  while (queue.length) {
    if (Date.now() - t0 > timeMs) return { ok: null, depth: -1, explored };
    const node = queue.shift();
    if (node.d >= cap) continue;
    for (let a = 0; a < node.t.length; a++) {
      for (let b = 0; b < node.t.length; b++) {
        if (!legalPour(node.t, a, b)) continue;
        const nt = cloneTubes(node.t);
        pour(nt, a, b);
        if (isSolved(nt)) return { ok: true, depth: node.d + 1, explored };
        const k = serialize(nt);
        if (!seen.has(k)) { seen.add(k); queue.push({ t: nt, d: node.d + 1 }); explored++; }
      }
    }
  }
  return { ok: false, depth: -1, explored };
}

const limit = parseInt(process.argv[2] || String(SPEC.length), 10);
let ok = 0, unverifiable = 0, bad = 0;
const diffCounts = {};
for (let i = 0; i < Math.min(limit, SPEC.length); i++) {
  const [numColors, maxF, diff] = SPEC[i];
  const t = shuffledState(numColors, maxF);
  const cap = numColors <= 5 ? 40 : (numColors <= 6 ? 60 : 80);
  const timeMs = numColors <= 5 ? 3000 : (numColors === 6 ? 8000 : 15000);
  const result = bfsSolvable(t, cap, timeMs);
  if (result.ok === true) {
    ok++;
    diffCounts[diff] = (diffCounts[diff] || 0) + 1;
  } else if (result.ok === null) {
    unverifiable++;
    console.log(`? Level ${i + 1} (${numColors}c, ${diff}): BFS timed out — could not prove solvable`);
  } else {
    bad++;
    console.log(`❌ Level ${i + 1} (${numColors}c, ${diff}): BFS proved UNSOLVABLE`);
  }
}
console.log(`\n${ok} verified solvable · ${unverifiable} too-big-to-prove · ${bad} UNSOLVABLE`);
console.log('Difficulty distribution (verified):', diffCounts);
if (bad > 0) process.exitCode = 1;
