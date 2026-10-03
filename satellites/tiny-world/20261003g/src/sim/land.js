// The living land (design 19 A2, design-runs/sep24-plan/LAND-ENGINE.md §2). Once a game minute the pass walks the map,
// sliced over rules.land.passTicks steps, and a tile whose conditions hold for one of its kind's rules (land.json)
// may change, slowly, at the edges: grass beside a pond with no beach becomes reeds, a lone puddle dries. It is the
// world's own doing, never hers: her brush holds a tile (w.hold), and nothing changes under the one she named.
//
// The laws that sit outside the rule table, for every rule: never a tile with a THING on it, never inside the
// village's paint, never a tile with a timer running (mud drying, a row's `sec`), never one she holds, never one a
// named creature stands on or beside, at most one change a tile a minute, and at most `cap` changes a minute across
// the whole map. The roll is a HASH of (tile, minute, seed), so the pass draws nothing from the world's random
// stream: with the switch on and no rule firing, every other system gets exactly the draws it got before.
// Allocation free in the step: the rules are compiled once per world into plain objects and typed arrays.
import { setTerrain, log, ref, isNight, inB, climeAt, swimKind, swimTile, swimStays, swimNear, wake, landLives } from './world.js';
import { addFx } from './fx.js';
import { gatherAny, gather, setPos } from './spatial.js';
import { story, STI } from './story.js';
import { IN } from './village.js';
import { reactLand } from './reactions.js';
import { emitAt, EVI } from './events.js';

// A rule, compiled: the terrain kinds each test matches as a byte per kind (id or tag, decided once here).
function compileRule(w, rule, index) {
  const C = w.C, nT = C.TERR.length, T = C.tags;
  const kinds = (spec) => { // a { kind } or { tag } (or a list of ids and tags, for stops) as a byte per terrain kind
    const out = new Uint8Array(nT);
    const tag = (x) => { const m = T.of([x]); for (let t = 0; t < nT; t++) if ((T.terr0[t] & m[0]) === m[0] && (T.terr1[t] & m[1]) === m[1]) out[t] = 1; };
    // A { tag } is always the tag, a { kind } always the one terrain: `water` is both a terrain and a tag, and "no water
    // beside it" read as the terrain alone would count a puddle ringed by shallows as a lone puddle (found by the
    // pilot's fixtures, 25 Sep). Only a `stops` list names both kinds and tags, an id first.
    if (Array.isArray(spec)) { for (const x of spec) if (C.tid[x] !== undefined) out[C.tid[x]] = 1; else tag(x); }
    else if (spec && spec.kind) out[C.tid[spec.kind]] = 1;
    else if (spec) tag(spec.tag);
    return out;
  };
  const icon = (p) => (C.iconOf[p] === undefined ? -1 : C.iconOf[p]);
  const whoKind = rule.who && rule.who.kind ? C.kid[rule.who.kind] : -1, whoM = rule.who && rule.who.tag ? T.of([rule.who.tag]) : [0, 0];
  const besideM = rule.beside && rule.beside.tag ? T.of([rule.beside.tag]) : [0, 0];
  return {
    i: index, id: rule.id, from: C.tid[rule.from], to: C.tid[rule.to],
    min: Math.max(1, Math.round((rule.days * w.daySec) / 60)), // `days` in game minutes for THIS world's day length
    chance: rule.chance,
    near: rule.near ? kinds(rule.near) : null, nearCount: rule.near ? rule.near.count : -1,
    far: rule.far ? kinds(rule.far) : null, within: rule.far ? rule.far.within : 0,
    stops: rule.stops ? kinds(rule.stops) : null,
    rain: rule.rain === undefined ? -1 : rule.rain ? 1 : 0,
    hot: rule.hot ? 1 : 0, cold: rule.cold ? 1 : 0, // A4: the derived clime at the tile (climeAt), asked after the roll
    night: rule.night === undefined ? -1 : rule.night ? 1 : 0,
    who: rule.who ? 1 : 0, whoKind, whoM0: whoM[0], whoM1: whoM[1], whoCount: rule.who ? rule.who.count : 0,
    keep: rule.keep ? 1 : 0, // A2b: the rule keeps the water count inside its band (only the `water` tag is kept today)
    beside: rule.beside ? 1 : 0, besideId: rule.beside && rule.beside.id ? rule.beside.id : '', besideM0: besideM[0], besideM1: besideM[1],
    keepDelta: 0, // +1 when it makes a water tile, -1 when it takes one, 0 when it moves water to water (worked out below)
    // A7: it may take water a fish lives in (the deep or the shallows, to anything but the deep: a puddle drying to mud), so the
    // veto is asked (of each fish she named near it, lastWater)
    drains: (C.TERR[C.tid[rule.from]].deep === 1 || C.TERR[C.tid[rule.from]].shallow === 1) && C.TERR[C.tid[rule.to]].deep !== 1 ? 1 : 0,
    say: rule.say, picA: icon(rule.pic[0]), picB: icon(rule.pic[1]), picRes: icon(rule.pic[2]),
  };
}

// Compiled once per world (its day length decides the minutes), on the first step that asks.
export function compileLand(w) {
  const L = w.R.land, C = w.C, nT = C.TERR.length;
  const rules = L.rules.map((rule, k) => compileRule(w, rule, k));
  const wet = (t) => ((C.tags.terr0[t] & w.water0) | (C.tags.terr1[t] & w.water1)) !== 0;
  for (const r of rules) if (r.keep) r.keepDelta = (wet(r.to) ? 1 : 0) - (wet(r.from) ? 1 : 0);
  // Each kind's rules in file order, as a run in `order`: first[t] and count[t] (a kind with no rules costs one read).
  const first = new Int32Array(nT), count = new Int32Array(nT), order = [];
  for (let t = 0; t < nT; t++) { first[t] = order.length; for (const r of rules) if (r.from === t) order.push(r); count[t] = order.length - first[t]; }
  const minuteTicks = Math.round(60 / w.R.tickSec), passTicks = Math.max(1, Math.min(L.passTicks, minuteTicks));
  w.land = {
    rules, order, first, count, minuteTicks, passTicks,
    rowsPerTick: Math.ceil(w.rows / passTicks),
    cap: Math.max(L.perMinute, Math.round(w.nTiles / L.perMinuteArea)),
    timed: new Int32Array(w.nTiles), timedStamp: 0,
    fired: new Int32Array(rules.length), // times each rule changed a tile (read by dev/land-untouched.mjs; not saved)
    wet: new Uint8Array(nT), keepLive: -1, // A2b: which kinds carry `water`, and the tiles of them now (-1: not counted yet)
  };
  for (let t = 0; t < nT; t++) w.land.wet[t] = wet(t) ? 1 : 0;
  return w.land;
}

// The roll: a number in [0, 1) for this tile this minute, from the tile, the minute and the world's seed (the house
// pattern of powers.js tileFrac, with the minute mixed in). Never the world's stream.
function roll(w, i, minute) {
  let h = (i * 2654435761 + minute * 97 + w.seed * 40503) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13;
  return (h >>> 8) / 16777216;
}

// How many of the eight neighbours are of the kinds in `k`. Off the map counts as not.
function countNear(w, tx, ty, k) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if ((dx | dy) === 0) continue;
    const x = tx + dx, y = ty + dy;
    if (x >= 0 && y >= 0 && x < w.cols && y < w.rows && k[w.terr[y * w.cols + x]]) n++;
  }
  return n;
}
// Is any tile of the kinds in `k` within the square of radius r (the tile itself left out)?
function anyWithin(w, tx, ty, r, k) {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if ((dx | dy) === 0) continue;
    const x = tx + dx, y = ty + dy;
    if (x >= 0 && y >= 0 && x < w.cols && y < w.rows && k[w.terr[y * w.cols + x]]) return true;
  }
  return false;
}
// Somebody she named on the tile or beside it (12 px round its middle): the land leaves that tile alone.
// (Design 19 G3.2: a mouthful asks it too, update.js grazeWear.)
export function namedNear(w, cx, cy) {
  const n = gatherAny(w, cx, cy, 12), near = w.near, E = w.E;
  for (let k = 0; k < n; k++) { const o = near[k]; if (E.named[o] && !E.inside[o] && !E.dead[o]) return true; }
  return false;
}
// Design 19 G3.1: may the ground of tile i change by itself now, for a thing that becomes ground (bones nobody ate,
// 75 s on, are meadow: update.js hatch)? The pass's own laws for one tile, asked once: never a tile she holds, never
// inside the village's paint, never one with a timer running, never under or beside the one she named; and never the
// water (its amount is hers, A2b) nor rock (a mountain is not ground a flower comes up in).
export function groundMay(w, i) {
  const t = w.terr[i], T = w.C.tags;
  if (w.hold[i] || (w.claim[i] & IN) || t === w.C.tid.rock) return false;
  if (((T.terr0[t] & w.water0) | (T.terr1[t] & w.water1)) !== 0) return false;
  for (let k = 0; k < w.tmr.length; k++) if (w.tmr[k].i === i) return false;
  return !namedNear(w, (i % w.cols) * w.T + 4, ((i / w.cols) | 0) * w.T + 4);
}
// `who`: that many creatures of the kind or tag on the tile or beside it, at this minute.
function whoNear(w, r, cx, cy) {
  const n = gatherAny(w, cx, cy, 12), near = w.near, E = w.E, C = w.C;
  let c = 0;
  for (let k = 0; k < n; k++) {
    const o = near[k];
    if (E.dead[o] || E.inside[o]) continue;
    const ki = C.kid[E.kind[o]];
    if (r.whoKind >= 0 ? ki !== r.whoKind : ((C.tags.kind0[ki] & r.whoM0) !== r.whoM0 || (C.tags.kind1[ki] & r.whoM1) !== r.whoM1)) continue;
    if (++c >= r.whoCount) return true;
  }
  return false;
}
// `beside`: a thing of that id or tag on the tile or one of its eight neighbours.
function besideThing(w, r, tx, ty) {
  const T = w.C.tags;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const x = tx + dx, y = ty + dy;
    if (!inB(w, x, y)) continue;
    const s = w.grid[y * w.cols + x];
    if (!s) continue;
    if (r.besideId ? s.type === r.besideId : ((T.thing0[s.type] & r.besideM0) === r.besideM0 && (T.thing1[s.type] & r.besideM1) === r.besideM1 && (r.besideM0 | r.besideM1) !== 0)) return true;
  }
  return false;
}

// ---------- Design 19 A7: the veto and the rescue (Astra N0 and B4, bar 11: nothing she loves can be lost to the land) ----------
// "Water" here is water that swimmer can live in (world.js swimTile: the deep, and the shallows for a tiny one; never the swamp),
// and "near" is within rules.land.rescueTiles tiles of it, the square round it, as a rule's `far` is. Where it may go, what ends its
// bubble and the water near it are water that LASTS (world.js swimStays, flag waterLasts: never a puddle her rain left, which is
// path again within a minute).
//
// (a) The veto (flag `waterVeto`): the pass never takes the last water near a swimmer she named. The tile under it or beside it
// was the land's to leave alone already (namedNear); this is the water a tile or more off it, while it is out of the water
// (flopping on the bank, floating in its bubble) and that water is all it has. True: leave tile i as it is this minute (it may
// still become water of another kind: the next rule is asked). Only after the roll, and only for a rule that drains (rare).
function lastWater(w, i, tx, ty, to) {
  if (!w.R.flags.waterVeto) return false;
  const E = w.E, T = w.T, Rt = w.R.land.rescueTiles | 0;
  const n = gatherAny(w, tx * T + 4, ty * T + 4, (Rt + 1) * T), near = w.near;
  for (let k = 0; k < n; k++) {
    const o = near[k];
    if (!E.named[o] || E.inside[o] || E.dead[o]) continue;
    const sp = w.C.S[E.kind[o]];
    if (!sp.water || !swimTile(w, sp, i) || swimKind(w, sp, to)) continue; // not its water now, or its water still after
    const ox = ((E.x[o] | 0) / T) | 0, oy = ((E.y[o] | 0) / T) | 0; // (whole numbers: this runs rarely, and is never optimized)
    if (ox - tx > Rt || tx - ox > Rt || oy - ty > Rt || ty - oy > Rt) continue;
    if (!swimNear(w, sp, ox, oy, Rt, i)) return true;
  }
  return false;
}

// (b) The rescue (flag `waterRescue`): her brush (a paint, or the eraser's grass) is about to make tile i ground of kind t. A
// swimmer she named that the stroke would leave on ground it cannot live on (the tile under it, whatever water is beside: no
// `enter` answers a tile that changes under a fish, so fish_flop_home never takes it home, and 2 of 24 named koi dried on the
// tile she painted with the pond a tile away) or with no water near at all, goes FIRST, before the stroke lands: at once to
// the nearest water on the map it can live in, a sparkle where it was and one where it is now. An errand cannot take it there
// (a fish on land dries in 2.5 s, three tiles: never past the three tiles a rescue needs). With no such water on the map at all,
// it goes into its bubble for rescueSec instead (bubbleT, saved), and floats where it is, its hunger and the dry ground waiting,
// until there is water (bubbleTick, below; releaseBubbles, when her brush makes water).
export function rescueFor(w, i, t) {
  const tt = w.C.TERR[w.terr[i]], nt = w.C.TERR[t];
  if (!w.R.flags.waterRescue || !(tt.deep === 1 || tt.shallow === 1) || !nt || nt.deep === 1) return; // (no fish's water now, or every fish's still)
  const E = w.E, T = w.T, Rt = w.R.land.rescueTiles | 0, tx = i % w.cols, ty = (i / w.cols) | 0;
  const n = gather(w, tx * T + 4, ty * T + 4, (Rt + 1) * T); // (in the order they were born: a loaded world rescues in the same order)
  if (n === 0) return;
  const who = Array.from(w.near.subarray(0, n)); // (a command, not the step: it may allocate)
  for (const o of who) {
    if (!E.named[o] || E.inside[o] || E.dead[o]) continue;
    const sp = w.C.S[E.kind[o]];
    if (!sp.water || !swimTile(w, sp, i) || swimKind(w, sp, t)) continue; // not its water now, or its water still after
    const ox = Math.floor(E.x[o] / T), oy = Math.floor(E.y[o] / T);
    if (Math.abs(ox - tx) > Rt || Math.abs(oy - ty) > Rt) continue;
    if ((ox !== tx || oy !== ty) && swimNear(w, sp, ox, oy, Rt, i)) continue; // not under the stroke, and water near it still
    rescue(w, o, i, true);
  }
}
// ...and when her brush makes water anywhere, whoever she named is floating in a bubble and can live in it goes to the nearest
// water at once.
export function releaseBubbles(w) {
  if (!w.R.flags.waterRescue) return;
  const E = w.E;
  for (let q = 0; q < w.count; q++) {
    const e = w.order[q];
    if (!(E.bubbleT[e] > 0) || E.inside[e] || E.dead[e]) continue;
    const k = nearestWater(w, e, -1);
    if (k >= 0) homeTo(w, e, k, true);
  }
}
// One step of one floating in its bubble (update.js creature): its time runs down; standing in water it can live in that lasts (Undo
// gave its pond back) it is home and the bubble goes; and once a second it looks over the map for water that lasts (a thaw, the land's
// rain on a beach: never a puddle her rain left, swimStays) and goes there at once. True while it is still in its bubble. (Aboard a
// UFO it is the UFO's, until it lets it go.)
export function bubbleTick(w, e) {
  if (!w.R.flags.waterRescue || w.E.inside[e]) return false;
  const E = w.E, T = w.T, tx = Math.floor(E.x[e] / T), ty = Math.floor(E.y[e] / T);
  if (inB(w, tx, ty) && swimStays(w, w.C.S[E.kind[e]], ty * w.cols + tx)) { E.bubbleT[e] = 0; return false; }
  E.bubbleT[e] = Math.max(0, E.bubbleT[e] - w.dt);
  if (E.bubbleT[e] > 0 && (w.tick + E.id[e]) % Math.round(1 / w.R.tickSec) === 0) {
    const k = nearestWater(w, e, -1);
    if (k >= 0) { homeTo(w, e, k, false); return false; }
  }
  return E.bubbleT[e] > 0;
}
// Rescue swimmer e: to the nearest water (homeTo), or, with none on the map, into its bubble. `said`: her brush did it, so the
// world answers her in words, when there is something to tell: it went to OTHER water (further than rescueTiles: a hop to the
// next tile of its own pond, out of the way of her brush, is the sparkles alone), or into its bubble.
function rescue(w, e, skip, said) {
  const E = w.E, x0 = E.x[e], y0 = E.y[e], Rt = w.R.land.rescueTiles | 0;
  const k = nearestWater(w, e, skip);
  addFx(w, 'magic', x0, y0 - 4, w.R.fx.heart);
  if (k >= 0) {
    const ox = Math.floor(x0 / w.T), oy = Math.floor(y0 / w.T), kx = k % w.cols, ky = (k / w.cols) | 0;
    homeTo(w, e, k, said && (Math.abs(kx - ox) > Rt || Math.abs(ky - oy) > Rt));
    return;
  }
  settle(w, e);
  E.bubbleT[e] = w.R.land.rescueSec;
  emitAt(w, EVI.chute, e);
  if (said) log(w, 'log.waterBubble', { a: ref(w, e) });
}
// Where her hand leaves one it puts down: awake (nobody is asleep in a world without design 18's sleep), going nowhere, on the
// ground (a fish in the middle of a hop home is taken home now), no warning running.
function settle(w, e) {
  const E = w.E;
  wake(w, e, false);
  E.goalKind[e] = 0; E.pathN[e] = 0; E.pathQd[e] = 0; E.blockT[e] = 0; E.errT[e] = 0; E.hazT[e] = 0; E.think[e] = 0;
  E.alt[e] = 0; E.chute[e] = false; E.bounced[e] = 0;
}
// To tile k of water, at once (as the touchdown's snap puts a fish, ai/ufo.js, with no reach), out of its bubble. Its tile mark
// moves with it: it did not walk in, so no `enter` answers the move, and a world saved now rebuilds the same mark from where it is.
function homeTo(w, e, k, said) {
  const E = w.E, T = w.T, x = (k % w.cols) * T + 4, y = ((k / w.cols) | 0) * T + 5;
  settle(w, e);
  E.bubbleT[e] = 0;
  setPos(w, e, x, y); E.px[e] = x; E.py[e] = y;
  if (w.rx.lastTile.length > e) w.rx.lastTile[e] = k;
  addFx(w, 'magic', x, y - 4, w.R.fx.heart); emitAt(w, EVI.magic, e);
  if (said) log(w, 'log.waterRescue', { a: ref(w, e) });
}
// The nearest tile on the map of water swimmer e can live in that lasts (swimStays: never a puddle her rain left), tile `skip` left
// out; -1 for none. Nearest by distance from its own tile, ring by ring as far as the whole map, the first in ring and tile order on
// a tie. (Measured against "of two as near, the one
// with more water round it": over her pond, 12 seeds, her drag of sand across the deep made 23 hops plain and 47 that way, because
// her pond's rim of shallows is the nearest water off the deep and out of the drag's way. Whole numbers.)
function nearestWater(w, e, skip) {
  const E = w.E, T = w.T, sp = w.C.S[E.kind[e]], cols = w.cols, rows = w.rows, cx = ((E.x[e] | 0) / T) | 0, cy = ((E.y[e] | 0) / T) | 0, last = cols > rows ? cols : rows;
  let best = -1, bd = 0x7fffffff;
  for (let ring = 0; ring <= last && ring * ring <= bd; ring++) {
    for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx += (ring === 0 || dy === -ring || dy === ring) ? 1 : 2 * ring) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const i = y * cols + x, d = dx * dx + dy * dy;
      if (i === skip || d >= bd || !swimStays(w, sp, i)) continue;
      best = i; bd = d;
    }
  }
  return best;
}

// One step of the pass (update.js, right after the fire). Behind flags.land.
export function landTick(w) {
  if (!w.R.flags.land) return;
  // Design 19 A8: and while the parent's switch has this world's land resting, the pass is not walked at all: no tile changes by
  // itself, no tile ages and her brush's hold does not run down, so when it is switched on again the land goes on from where it
  // stopped, catching nothing up. (The switch also clears the water count's scratch: the first step after it counts the ground
  // afresh, as a world loaded from a save does, so the two play on the same.)
  if (!landLives(w)) return;
  const M = w.land || compileLand(w);
  const m = w.tick % M.minuteTicks, minute = (w.tick / M.minuteTicks) | 0;
  if (m === 0) w.landN = 0; // a new minute: the cap starts again (landN is saved, so a world saved mid sweep plays on the same)
  // A2b: the water count, from the ground itself (which is saved) at the start of every minute and whenever the
  // scratch is new (a loaded world), kept up to date as the pass changes tiles.
  if (m === 0 || M.keepLive < 0) { let n = 0; for (let i = 0; i < w.nTiles; i++) n += M.wet[w.terr[i]]; M.keepLive = n; }
  if (m >= M.passTicks) return;
  // The tiles with a timer running, stamped afresh on every slice from w.tmr (which IS saved), so a world loaded in
  // the middle of a sweep knows them as well as the one that kept running.
  const stamp = ++M.timedStamp;
  for (let k = 0; k < w.tmr.length; k++) M.timed[w.tmr[k].i] = stamp;
  const cols = w.cols, rows = w.rows, T = w.T, age = w.age, hold = w.hold, terr = w.terr, grid = w.grid, claim = w.claim;
  const raining = w.rainT > 0 ? 1 : 0, night = isNight(w) ? 1 : 0, off = minute % rows;
  const r0 = m * M.rowsPerTick, r1 = Math.min(rows, r0 + M.rowsPerTick);
  for (let rr = r0; rr < r1; rr++) {
    const ty = (off + rr) % rows; // a different row first each minute, so a capped minute does not always starve the same end of the map
    for (let tx = 0; tx < cols; tx++) {
      const i = ty * cols + tx;
      if (age[i] < 255) age[i]++; // once a minute per tile, whatever else happens
      if (hold[i]) { hold[i]--; continue; } // hers: the land leaves it alone while it lasts
      const t = terr[i], rn = M.count[t];
      if (!rn || grid[i] || (claim[i] & IN) || M.timed[i] === stamp) continue;
      const f0 = M.first[t];
      for (let q = 0; q < rn; q++) {
        const r = M.order[f0 + q];
        if (age[i] < r.min) continue;
        if (r.rain >= 0 && raining !== r.rain) continue;
        if (r.night >= 0 && night !== r.night) continue;
        if (r.near !== null) { const n = countNear(w, tx, ty, r.near); if (r.nearCount === 0 ? n > 0 : n < r.nearCount) continue; }
        if (r.stops !== null && countNear(w, tx, ty, r.stops) > 0) continue;
        if (roll(w, i, minute + r.i * 7919) >= r.chance) continue; // the roll before the dear tests (each rule its own roll)
        if (r.far !== null && anyWithin(w, tx, ty, r.within, r.far)) continue;
        if (r.hot && climeAt(w, i) <= 0) continue;
        if (r.cold && climeAt(w, i) >= 0) continue;
        const cx = tx * T + 4, cy = ty * T + 4;
        if (r.who && !whoNear(w, r, cx, cy)) continue;
        if (r.beside && !besideThing(w, r, tx, ty)) continue;
        // A2b, `keep`: the pond may wander a tile at a time and never grow or shrink past the band round her baseline.
        if (r.keepDelta > 0 && M.keepLive >= w.keepWater + w.R.land.keepBand) continue;
        if (r.keepDelta < 0 && M.keepLive <= w.keepWater - w.R.land.keepBand) continue;
        if (w.landN >= M.cap) break; // the cap: nothing more changes this minute (the ages still count on)
        if (namedNear(w, cx, cy)) break; // never under or beside the one she named
        if (r.drains && lastWater(w, i, tx, ty, r.to)) continue; // A7: nor the last water of a swimmer she named
        w.landN++;
        M.fired[r.i]++;
        M.keepLive += M.wet[r.to] - M.wet[t];
        setTerrain(w, tx, ty, r.to);
        addFx(w, 'magic', cx, cy, w.R.fx.heart);
        log(w, r.say);
        story(w, STI.land, cx, cy, -1, -1, -1, r.picA, r.picB, r.picRes, w.lastLog);
        reactLand(w, r.id, i); // A3: and whatever lives there answers it (a frog to the new reeds, the flock off the flood)
        break; // one change a tile a minute
      }
    }
  }
}
