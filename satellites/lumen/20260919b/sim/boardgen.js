// Seeded board generation (section 6). A board for Night n comes from hash(runSeed, n) and must pass
// the route check (Aperture reachable with at most 2 Mirrors on Nights 1-2, 3 after) and, when a
// score check is supplied (Nights 1-3), the starter-pouch check; otherwise the next sub-seed is tried.
import { DATA } from './data.js';
import { grid, hexDistance, DIRS } from './hex.js';
import { rng } from './rng.js';
import { cast } from './cast.js';
import { parseGemSpec } from './gems.js';
import { hash } from './rng.js';
import { scoreCheck } from './greedy.js';
import LIBRARY from '../data/boards.json' with { type: 'json' };

const PRIMARIES = [1, 2, 4];
const ANY_COLOUR = [1, 2, 4, 3, 5, 6];

export function boardRadius(night, data = DATA) {
  const B = data.rules.board;
  return night >= B.endlessRadiusFromNight ? B.endlessRadius : B.radius;
}

export function featureCount(night, data = DATA) {
  const G = data.features.gen;
  if (night < G.featuresByNight.length) return G.featuresByNight[night];
  const last = G.featuresByNight[G.featuresByNight.length - 1];
  return last + Math.floor((night - (G.featuresByNight.length - 1)) / G.endlessFeatureEvery);
}

export function wallCount(night, data = DATA) {
  const G = data.features.gen;
  return Math.min(G.wallsMax, G.wallsNight1 + G.wallsPerNight * (night - 1));
}

export function routeMirrorLimit(night, data = DATA) {
  const L = data.features.gen.routeMirrorsByNight;
  return L[Math.min(night, L.length - 1)];
}

// Fewest Mirrors that route light from `lanternCell` heading `dir` into any aperture (0-1 BFS).
// A placed Mirror turns light 60 degrees either way; fixed gems act with their own facing (a fixed
// Splitter continues both ways). Returns Infinity when unreachable.
export function mirrorsToAperture(board, lanternCell, dir) {
  const g = grid(board.radius);
  const block = new Uint8Array(g.n);
  for (const c of board.walls) block[c] = 1;
  for (const l of board.lanterns) block[l.cell] = 1;
  const goal = new Uint8Array(g.n);
  for (const a of board.apertures) goal[a.cell] = 1;
  const fixed = new Map((board.fixed || []).map((f) => [f.cell, f]));
  const best = new Float64Array(g.n * 6).fill(Infinity);
  const dq = [[lanternCell, dir, 0]];
  best[lanternCell * 6 + dir] = 0;
  let answer = Infinity;
  while (dq.length) {
    const [cell, d, cost] = dq.shift();
    if (cost > best[cell * 6 + d] || cost >= answer) continue;
    const nx = g.neighbor[cell * 6 + d];
    if (nx < 0 || block[nx]) continue;
    if (goal[nx]) { answer = Math.min(answer, cost); continue; }
    const push = (nd, nc) => {
      const k = nx * 6 + nd;
      if (nc < best[k]) { best[k] = nc; if (nc === cost) dq.unshift([nx, nd, nc]); else dq.push([nx, nd, nc]); }
    };
    const f = fixed.get(nx);
    if (f) {
      // Fixed gems keep their facing (they cannot be moved or turned).
      if (f.cut === 'splitter') { push((d + 5) % 6, cost); push((d + 1) % 6, cost); }
      else if (f.cut === 'mirror') {
        const rel = (((d - f.facing) % 6) + 6) % 6;
        if (rel === 2 || rel === 4) push((((2 * f.facing + 3 - d) % 6) + 6) % 6, cost);
        else push(d, cost); // back or head-on: straight on
      } else push(d, cost);
      continue;
    }
    push(d, cost);
    push((d + 5) % 6, cost + 1);
    push((d + 1) % 6, cost + 1);
  }
  return answer;
}

function connected(g, blocked) {
  let start = -1, open = 0;
  for (let i = 0; i < g.n; i++) if (!blocked[i]) { open++; if (start < 0) start = i; }
  if (start < 0) return true;
  const seen = new Uint8Array(g.n);
  const stack = [start];
  seen[start] = 1;
  let n = 0;
  while (stack.length) {
    const c = stack.pop();
    n++;
    for (let d = 0; d < 6; d++) {
      const nb = g.neighbor[c * 6 + d];
      if (nb >= 0 && !blocked[nb] && !seen[nb]) { seen[nb] = 1; stack.push(nb); }
    }
  }
  return n === open;
}

// One candidate layout from a sub-seed. Returns null if it cannot be built.
function layout(seed, night, sub, opts, data) {
  const R = rng(seed, 'board', night, sub);
  const radius = opts.radius ?? boardRadius(night, data);
  const g = grid(radius);
  const G = data.features.gen;
  const used = new Set();
  const edge = g.edge.slice();
  const inward = (c) => [0, 1, 2, 3, 4, 5].filter((d) => g.neighbor[c * 6 + d] >= 0 && g.ring[g.neighbor[c * 6 + d]] < radius);

  // Features for this Night (walls are separate and always present).
  const available = data.features.features.filter((f) => f.id !== 'wall' && f.firstNight <= night).map((f) => f.id);
  const want = Math.min(featureCount(night, data), available.length);
  const features = [];
  while (features.length < want) { const f = R.pick(available); if (!features.includes(f)) features.push(f); }
  const has = (f) => features.includes(f);

  // Lanterns: one per deck emitter group (Prism Lamp: three); Twin Lantern feature adds a second.
  const groups = Math.max(1, opts.emitterGroups || 1);
  const lanternCount = groups === 1 && has('twinLantern') ? 2 : groups;
  const lanterns = [];
  for (let i = 0; i < lanternCount; i++) {
    const free = edge.filter((c) => !used.has(c) && inward(c).length && lanterns.every((l) => hexDistance(g, l.cell, c) >= 2));
    if (!free.length) return null;
    const cell = R.pick(free);
    used.add(cell);
    lanterns.push({ cell, dir: R.pick(inward(cell)) });
  }
  // Apertures: at least minLanternApertureDist from every lantern.
  const far = (c) => lanterns.every((l) => hexDistance(g, l.cell, c) >= G.minLanternApertureDist);
  const apertures = [];
  const apCount = has('secondAperture') ? 2 : 1;
  for (let i = 0; i < apCount; i++) {
    const free = edge.filter((c) => !used.has(c) && far(c) && apertures.every((a) => hexDistance(g, a.cell, c) >= 2));
    if (!free.length) return null;
    const cell = R.pick(free);
    used.add(cell);
    let color = 7;
    if (i === 0 && has('coloredAperture')) {
      // Only colours the Lantern's light can answer (a red Lantern never faces a green Aperture).
      const lit = opts.lanternColors ?? 7;
      const [lo, hi] = G.primaryApertureNights;
      const pool = (night >= lo && night <= hi ? PRIMARIES : ANY_COLOUR).filter((c) => (c & lit) !== 0);
      color = pool.length ? R.pick(pool) : 7;
    }
    apertures.push({ cell, color });
  }
  // Walls, never sealing a region.
  const blocked = new Uint8Array(g.n);
  const walls = [];
  const nWalls = wallCount(night, data);
  let guard = 0;
  while (walls.length < nWalls && guard++ < 200) {
    const c = R.int(g.n);
    if (used.has(c)) continue;
    blocked[c] = 1;
    if (!connected(g, blocked)) { blocked[c] = 0; continue; }
    used.add(c);
    walls.push(c);
  }
  const interior = () => [...Array(g.n).keys()].filter((c) => !used.has(c) && g.ring[c] < radius);
  const openCells = () => [...Array(g.n).keys()].filter((c) => !used.has(c));
  const fixed = [];
  if (has('fixedGem')) {
    const cells = interior();
    if (cells.length) {
      const cell = R.pick(cells);
      used.add(cell);
      const { cut, stone } = parseGemSpec(R.pick(G.fixedGems));
      fixed.push({ cell, cut, stone, tier: G.fixedGemTier, inclusion: null, facing: R.int(6), fixed: true });
    }
  }
  const sprinkle = (n) => { const out = []; const cells = openCells(); while (out.length < n && cells.length) out.push(cells.splice(R.int(cells.length), 1)[0]); return out.sort((a, b) => a - b); };
  const dark = has('darkCell') ? sprinkle(G.darkCells) : [];
  const bright = has('brightCell') ? sprinkle(G.brightCells) : [];
  const fog = has('fog') ? sprinkle(G.fogCells) : [];
  if (opts.darkHalf) {
    // Penumbra: every cell strictly on one side of a line through the centre, seeded.
    const k = R.int(6);
    const [vx, vy] = [1.5 * DIRS[k][0], Math.sqrt(3) * (DIRS[k][1] + DIRS[k][0] / 2)];
    for (let c = 0; c < g.n; c++) {
      if (used.has(c) || dark.includes(c)) continue;
      const p = g.pixel(c);
      if (p.x * vx + p.y * vy > 1e-9) dark.push(c);
    }
    dark.sort((a, b) => a - b);
  }
  walls.sort((a, b) => a - b);
  return { radius, night, sub, features, lanterns, apertures, walls, dark, bright, fog, fixed };
}

// The inputs the Night 1-3 score check depends on. A board library built for other inputs is stale.
export function libraryKey(lanternId, data = DATA) {
  const deck = data.lantern[lanternId];
  // behaviour only: display names and rule texts can change without invalidating the library
  const cuts = data.cuts.map(({ id, fn, rarity, param, values, shared, exact, divisor, faces, headOn, facing }) => ({ id, fn, rarity, param, values, shared, exact, divisor, faces, headOn, facing }));
  const stones = data.stones.map(({ id, channels, neutral }) => ({ id, channels, neutral }));
  return hash(JSON.stringify([data.features.gen, data.targets.nights.slice(0, data.features.gen.scoreCheck.untilNight), data.rules.night,
    data.rules.board, deck.emitters, deck.pouch, data.pouches, cuts, stones, data.rules.sympathy, data.rules.strike]));
}

// Starter pouch and emitters for a Lantern, as the score check sees them (untouched, Rough, no Inclusions).
export function scoreCheckInputs(lanternId, b, data = DATA) {
  const deck = data.lantern[lanternId];
  const list = data.pouches[deck.pouch.base].slice();
  for (const r of deck.pouch.remove) { const i = list.indexOf(r); if (i >= 0) list.splice(i, 1); }
  list.push(...deck.pouch.add);
  const pouch = list.map((spec) => ({ ...parseGemSpec(spec), tier: 0, inclusion: null }));
  const groups = deck.emitters;
  const halve = groups.length === 1 && b.lanterns.length > 1;
  const emitters = [];
  b.lanterns.forEach((l, i) => {
    for (const beam of groups[i % groups.length]) {
      let I = beam.intensity + (deck.perGem ? deck.perGem * b.fixed.length : 0);
      if (halve) I = Math.max(1, Math.floor(I / 2));
      emitters.push({ cell: l.cell, dir: l.dir, color: beam.color, intensity: I, focus10: beam.focus10 });
    }
  });
  return { pouch, emitters };
}

export function lanternColorsOf(lanternId, data = DATA) {
  let c = 0;
  for (const group of data.lantern[lanternId].emitters) for (const beam of group) c |= beam.color;
  return c;
}

// Procedural generation with both checks, re-rolling sub-seeds (used live and to build the library).
// opts: { lantern, emitterGroups, darkHalf, lanternColors, scoreCheck: bool, radius }
export function generateBoardFresh(seed, night, opts = {}, data = DATA) {
  const G = data.features.gen;
  const limit = routeMirrorLimit(night, data);
  const lantern = opts.lantern || 'candle';
  let fallback = null;
  for (let sub = 0; sub < G.maxRerolls; sub++) {
    const b = layout(seed, night, sub, opts, data);
    if (!b) continue;
    const routes = b.lanterns.map((l) => mirrorsToAperture(b, l.cell, l.dir));
    if (routes.some((m) => m > limit)) continue;
    if (night > G.straightLineAllowedUntilNight && straightOpen(b)) continue;
    if (!fallback) fallback = b;
    let sc = null;
    if (opts.scoreCheck && night <= G.scoreCheck.untilNight) {
      const { pouch, emitters } = scoreCheckInputs(lantern, b, data);
      sc = scoreCheck(b, pouch, emitters, data.targets.nights[night - 1], `${seed}:${night}:${sub}`, data);
      if (!sc.ok) continue;
    }
    b.checks = { routeMirrors: Math.max(...routes), scoreCheck: sc ? `${sc.pass}/${sc.pass + sc.fail}` : null, source: 'fresh' };
    return b;
  }
  if (fallback) { fallback.checks = { routeMirrors: -1, scoreCheck: null, source: 'fallback' }; return fallback; }
  throw new Error(`no valid board for night ${night}`);
}

// Entry `idx` of the library for (lantern, night): the layout it was validated as.
export function libraryBoard(lantern, night, idx, opts = {}, data = DATA) {
  const [i, sub] = LIBRARY.lanterns[lantern].nights[night][idx];
  const seed = `lib:${lantern}:${night}:${i}`;
  const b = layout(seed, night, sub, { ...opts, lantern }, data);
  b.checks = { routeMirrors: routeMirrorLimit(night, data), scoreCheck: 'library', source: `library ${i}/${sub}`, seed };
  return b;
}

// The board for Night `night` of run `seed`. Nights covered by the score check come from the
// pre-validated library when it matches the current data (see harness/boardlib.js); otherwise they
// are generated and checked live. Later Nights are generated live (route check only).
export function generateBoard(seed, night, opts = {}, data = DATA) {
  const G = data.features.gen;
  const lantern = opts.lantern || 'candle';
  const lib = opts.noLibrary ? null : LIBRARY.lanterns?.[lantern];
  // anyLibraryKey (harness tuning only): use the library even though targets changed since it was built.
  if (night <= G.scoreCheck.untilNight && lib && (opts.anyLibraryKey || lib.key === libraryKey(lantern, data)) && lib.nights[night]?.length && !opts.darkHalf) {
    const list = lib.nights[night];
    return libraryBoard(lantern, night, hash(seed, 'board', night) % list.length, opts, data);
  }
  return generateBoardFresh(seed, night, { ...opts, scoreCheck: opts.scoreCheck ?? night <= G.scoreCheck.untilNight }, data);
}

// True when light from some lantern reaches an aperture with no placed gems at all.
export function straightOpen(b) {
  const emitters = b.lanterns.map((l) => ({ cell: l.cell, dir: l.dir, color: 7, intensity: 10, focus10: 10 }));
  const res = cast({ radius: b.radius, walls: b.walls, dark: [], bright: [], fog: [], emitters, apertures: b.apertures.map((a) => ({ cell: a.cell, color: 7 })), gems: (b.fixed || []).map((f, i) => ({ ...f, gemId: i })) }, { events: false });
  return res.scores.length > 0;
}
