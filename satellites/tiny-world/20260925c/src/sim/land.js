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
import { setTerrain, log, isNight, inB } from './world.js';
import { addFx } from './fx.js';
import { gatherAny } from './spatial.js';
import { story, STI } from './story.js';
import { IN } from './village.js';

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
    night: rule.night === undefined ? -1 : rule.night ? 1 : 0,
    who: rule.who ? 1 : 0, whoKind, whoM0: whoM[0], whoM1: whoM[1], whoCount: rule.who ? rule.who.count : 0,
    keep: rule.keep ? 1 : 0, // A2b: the rule keeps the water count inside its band (only the `water` tag is kept today)
    beside: rule.beside ? 1 : 0, besideId: rule.beside && rule.beside.id ? rule.beside.id : '', besideM0: besideM[0], besideM1: besideM[1],
    keepDelta: 0, // +1 when it makes a water tile, -1 when it takes one, 0 when it moves water to water (worked out below)
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
function namedNear(w, cx, cy) {
  const n = gatherAny(w, cx, cy, 12), near = w.near, E = w.E;
  for (let k = 0; k < n; k++) { const o = near[k]; if (E.named[o] && !E.inside[o] && !E.dead[o]) return true; }
  return false;
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

// One step of the pass (update.js, right after the fire). Behind flags.land.
export function landTick(w) {
  if (!w.R.flags.land) return;
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
        const cx = tx * T + 4, cy = ty * T + 4;
        if (r.who && !whoNear(w, r, cx, cy)) continue;
        if (r.beside && !besideThing(w, r, tx, ty)) continue;
        // A2b, `keep`: the pond may wander a tile at a time and never grow or shrink past the band round her baseline.
        if (r.keepDelta > 0 && M.keepLive >= w.keepWater + w.R.land.keepBand) continue;
        if (r.keepDelta < 0 && M.keepLive <= w.keepWater - w.R.land.keepBand) continue;
        if (w.landN >= M.cap) break; // the cap: nothing more changes this minute (the ages still count on)
        if (namedNear(w, cx, cy)) break; // never under or beside the one she named
        w.landN++;
        M.fired[r.i]++;
        M.keepLive += M.wet[r.to] - M.wet[t];
        setTerrain(w, tx, ty, r.to);
        addFx(w, 'magic', cx, cy, w.R.fx.heart);
        log(w, r.say);
        story(w, STI.land, cx, cy, -1, -1, -1, r.picA, r.picB, r.picRes, w.lastLog);
        break; // one change a tile a minute
      }
    }
  }
}
