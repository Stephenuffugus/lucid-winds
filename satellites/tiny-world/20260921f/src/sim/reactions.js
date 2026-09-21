// Reactions (design 14 §5). One data file, src/data/reactions.json, says what happens when two things meet: a row
// names a trigger, tags or ids for A and B, optional conditions, a scope, and a list of effects. The player never
// sees the table; they see lightning hit a pond and every swimmer float up, and they go looking for what else works.
//
// The rules this file keeps, all from 14 §5:
//   triggers    the only six: hit, enter, power, equip, placed, clock. Nothing else raises a reaction.
//   matching    rows in file order, FIRST MATCH WINS for that trigger instance.
//   once/while  `once` fires and then that (row, A, B) pair is on cooldown (rules.react.cooldownSec, default 10 s);
//               `while` holds as long as the condition holds and is re-checked on the wearer's think tick only.
//   scope       explicit per row: the target only, a radius, or the connected tiles of a terrain (flood fill, capped).
//   chains      an effect may raise another trigger; depth <= 3, and a row cannot fire twice in one chain.
//   budget      at most rules.react.tileCap tile effects per tick world-wide; the overflow is dropped in file order.
//   safety      the filter runs on EFFECTS, not rows (14 §6): the reaction still happens to look at, and the parts
//               that would hurt a guarded creature are converted by harm.js (SRC.reaction).
//   caps        a reaction that spawns respects the world's population caps; over the cap the spawn is skipped and
//               the rest of the row still runs.
// Nothing here allocates per step: the scratch is made once per world, the cooldown key is built only when a row
// actually matches (a visible event, not a loop), and the target list is a typed array reused every time.
import { ent, spawn, goalMove, G_NONE } from './ents.js';
import { storyRow } from './story.js';
import { log, setTerrain, removeStruct, placeStruct, inB, speciesCapOf } from './world.js';
import { rebuildGear, GEAR_SLOTS } from './content.js';
import { allowed, SRC } from './harm.js';
import { addFx } from './fx.js';
import { emit, emitAt, EVI } from './events.js';
import { gatherAny } from './spatial.js';
import { setPos } from './spatial.js';

export const TRIG = { hit: 0, enter: 1, power: 2, equip: 3, placed: 4, clock: 5, meet: 6, poke: 7 };
export const TRIGS = Object.keys(TRIG);
const NO = -1;
// The verbs that only show something. Every other verb changes the world and reports how much it changed.
const COSMETIC = { fx: 1, sound: 1 };

// ---------- compiling ----------
// The rows as the sim reads them: masks and ids resolved once, grouped by trigger so a trigger walks only its own.
export function compileReactions(C) {
  const T = C.tags, byTrig = TRIGS.map(() => []);
  const rows = (C.RX || []).map((r, i) => {
    const side = (s) => {
      const m = s && s.tags ? T.of(s.tags) : [0, 0];
      // wears: one named piece of gear (a row about the TOP HAT, not about hats). kinds: a short list of creature
      // kinds, for a row that is about squirrels and foxes and cats but has no tag that says so (12 tag slots left).
      return { m0: m[0], m1: m[1], id: (s && s.id) || null, kind: s && s.kind ? s.kind : null, terrain: s && s.terrain ? s.terrain : null,
        wears: (s && s.wears) || null, kinds: s && s.kinds ? new Set(s.kinds) : null, ids: s && s.ids ? new Set(s.ids) : null };
    };
    const row = {
      i, id: r.id, when: r.when, a: side(r.a), b: side(r.b),
      needs: r.needs || null,
      globalCd: r.globalCooldownSec || 0, // one firing anywhere in the world per this many seconds
      sayEvery: r.sayEverySec || 0, sayNamed: r.sayNamed || null,
      scope: r.scope,
      mode: r.mode === 'while' ? 'while' : 'once',
      cooldownSec: r.cooldownSec === undefined ? null : r.cooldownSec,
      effects: r.effects,
      // What changes the world, and what only shows it (flags.honestRows, fire()): a row whose every real verb
      // turned out to change nothing has nothing to show and nothing to say.
      each: !!r.each,
      subst: r.effects.filter((e) => !COSMETIC[e.do]),
      cosm: r.effects.filter((e) => COSMETIC[e.do]),
      say: r.say || null,
      trig: TRIG[r.when],
    };
    // The three pictures the row's own story record carries (a + b -> what came of it), resolved once.
    row.a.pic = picOf(C, r.pic && r.pic[0]);
    row.b.pic = picOf(C, r.pic && r.pic[1]);
    row.res = picOf(C, r.pic && r.pic[2]);
    // The masks a scope needs, worked out once: the terrain a fill follows, and the creatures it may take.
    const sc = row.scope;
    if (sc.terrain) { const m = T.of([sc.terrain]); sc.m0 = m[0]; sc.m1 = m[1]; }
    if (sc.only && sc.only.tags) { const m = T.of(sc.only.tags); sc.onlyM0 = m[0]; sc.onlyM1 = m[1]; }
    if (row.trig === undefined) throw new Error(`reactions.json: ${r.id} has no such trigger "${r.when}"`);
    byTrig[row.trig].push(row);
    return row;
  });
  // What each trigger's rows could possibly match on, so a trigger can say "no row cares about this" before it
  // builds anything: the ids and terrains its rows name, the union of the tag masks they ask for, and whether any
  // row matches anything at all. This is what keeps the enter trigger (every creature, every tile it walks onto)
  // off the step's critical path.
  const idx = byTrig.map((rows) => {
    const ids = new Set(), kinds = new Set(), terrs = new Set();
    let m0 = 0, m1 = 0, any = false;
    for (const r of rows) {
      const b = r.b;
      if (b.id) ids.add(b.id);
      if (b.ids) for (const k of b.ids) ids.add(k);
      if (b.kind) kinds.add(b.kind);
      if (b.kinds) for (const k of b.kinds) kinds.add(k);
      if (b.terrain) terrs.add(b.terrain);
      m0 |= b.m0; m1 |= b.m1;
      if (!b.id && !b.ids && !b.kind && !b.kinds && !b.terrain && !b.wears && !b.m0 && !b.m1) any = true;
      if (b.wears) any = true; // what is worn is not in the cheap tile test: let the row be asked
    }
    // Who a meet row is about, so nobody else ever walks the spatial hash (that walk cost +24% to +44% when every
    // thinking creature did it, Sep 20). By kind, by a short list of kinds, or by TAG: a row about `bird` or about
    // whoever is a `giant` is asked of the creature's own mask first, which is two ANDs and no walk.
    const aKinds = new Set(), aMasks = [];
    let aAny = false, aGear = false;
    for (const r of rows) {
      const A = r.a;
      if (A.kind) aKinds.add(A.kind);
      else if (A.id) aKinds.add(A.id); // a creature's id is its kind
      else if (A.wears) aGear = true; // whoever wears one named piece
      else if (A.m0 || A.m1) aMasks.push([A.m0, A.m1]);
      else aAny = true;
    }
    // A row whose A side names tags is about the SPECIES that carries them, worked out here once per kind, or about
    // whoever is a giant right now. (Not about what a creature happens to be wearing: asking that would mean
    // building every thinking creature's whole mask on every think, which is the cost this index exists to avoid.)
    // ... or about whoever is WEARING something that carries them (the sheep suit's `wool`, the flower crown's
    // `plant`). Almost nobody wears anything, so that is asked only of a creature with something on (seven reads),
    // and only when no species carries the tag by birth.
    const aKindOk = new Uint8Array(C.kinds.length);
    let aGiant = false;
    for (const m of aMasks) {
      const g0 = m[0] & ~T.giant0, g1 = m[1] & ~T.giant1; // the mask without the giant bit
      if (g0 !== m[0] || g1 !== m[1]) { aGiant = true; if (!g0 && !g1) continue; }
      let some = false;
      for (let ki = 0; ki < C.kinds.length; ki++) if ((T.kind0[ki] & g0) === g0 && (T.kind1[ki] & g1) === g1) { aKindOk[ki] = 1; some = true; }
      if (!some) aGear = true;
    }
    return { ids, kinds, terrs, m0, m1, any, aKinds, aMasks, aKindOk, aGiant, aGear, aAny, n: rows.length };
  });
  // Two sets: what the while rows name by tag as well as by id, and the id-only set this used to build.
  // rules.flags.whileTags picks between them at run time (compiling knows the content, not the rules).
  return { rows, byTrig, idx, whileGear: whileGearIds(C, byTrig[TRIG.equip]), whileGearById: whileGearIds(C, byTrig[TRIG.equip], true) };
}
// The gear a `while` row names, so a creature's think tick can ask one question instead of walking every row.
function whileGearIds(C, rows, idsOnly) {
  const ids = new Set(), T = C.tags;
  for (const r of rows || []) {
    if (r.mode !== 'while') continue;
    if (r.a.id) { ids.add(r.a.id); continue; }
    if (idsOnly) continue;
    // A while row may name TAGS instead of one id (the lute is `music`, the lantern and torch are `light`).
    // Collecting only ids left those rows out of this set, so the cheap "does it carry anything a while row
    // names" test always said no and reactWhile never ran them: the lute calmed monsters once, on the tap that
    // handed it over, and never again (found Sep 20). Resolved once, at compile, not per step.
    if (!r.a.m0 && !r.a.m1) continue;
    for (const id of Object.keys(C.GEAR)) if ((((T.gear0[id] || 0) & r.a.m0) === r.a.m0) && (((T.gear1[id] || 0) & r.a.m1) === r.a.m1)) ids.add(id);
    for (const id of Object.keys(C.WEAP)) if ((((T.weapon0[id] || 0) & r.a.m0) === r.a.m0) && (((T.weapon1[id] || 0) & r.a.m1) === r.a.m1)) ids.add(id);
  }
  return ids;
}

// A picture a row names, as an index into C.icons: "creature:wolf", "thing:tower", "gear:crown", "icon:chute",
// and (design 18 A4) "weapon:pan", "power:freeze", "terrain:tallgrass". A creature is its own kind index; a piece
// of gear and a weapon are the loose one lying on the ground; everything else is registered under its own name
// (content.js compileIcons).
function picOf(C, ref) {
  if (!ref) return -1;
  const [kind, id] = ref.split(':');
  if (kind === 'creature') return C.kid[id] === undefined ? -1 : C.kid[id];
  const key = kind === 'gear' || kind === 'weapon' ? 'thing:item:' + id : kind === 'icon' ? id : ref;
  return C.iconOf[key] === undefined ? -1 : C.iconOf[key];
}

// Per world: the scratch every reaction runs in. None of it is saved (a reload forgets what is on cooldown, which
// only ever means a reaction may happen again sooner) and none of it is hashed.
// A world that has just been loaded starts from where its creatures are standing, so opening a world raises no
// enter reactions that the world which kept running would not have raised (design 14 §1 rule 6).
export function markTiles(w) {
  const R = w.rx, E = w.E;
  R.lastTile = new Int32Array(w.cap).fill(-1);
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k], x = E.x[e], y = E.y[e];
    if (E.dead[e] || x < 0 || y < 0 || x >= w.W || y >= w.H) continue; // indoors and in the air too (update.js enteredSweep)
    if (w.R.flags.landIsArriving && !E.inside[e] && E.alt[e] > 0) continue; // in the air: no mark, the same as the sweep leaves
    R.lastTile[e] = ((y / w.T) | 0) * w.cols + ((x / w.T) | 0);
  }
}

export function createReactions(w) {
  w.rx = {
    R: compileReactions(w.C),
    cool: new Map(), // "row|aHandle|bHandle" -> the time it is free again
    coolSweep: 0,
    depth: 0, // how deep in a chain we are
    thinker: -1, took: false, // the creature that is deciding right now, and whether a verb took its goal (ai/decide.js)
    // Every field this scratch ever carries is here from the start. One added later (R.landing was, for a day)
    // changes the object's shape while the step's hottest functions are reading it, and the engine throws their
    // optimized code away: gc-check saw the whole step running unoptimized, 2 KB a step of boxed numbers.
    landing: false, byHand: false, cancel: false, wasNight: undefined,
    chain: [], // the rows that have fired in this chain, by index
    tiles: 0, tileTick: -1, // tile effects spent this tick
    targets: new Int32Array(256), tN: 0, // the creatures an effect acts on
    met: new Int32Array(24), metD: new Float64Array(24), // who a creature has noticed, nearest first (reactMeet)
    tileList: new Int32Array(256), tileN: 0, // the tiles it acts on
    fill: new Int32Array(1024), seen: new Int32Array(0), seenStamp: 0, // flood fill scratch
    A: side(), B: side(),
    lastTile: new Int32Array(w.R.flags.liveThings === false ? 0 : w.cap).fill(-1), // the tile each creature stood on last step (scratch; rebuilt on load)
    n: 0, fired: {}, // reactions fired, and how many of each row: the scenes print it (tools/parity.mjs)
    did: {}, duds: {}, // per row: how much its verbs really changed, and how often it matched and changed nothing
    // A reaction raised from inside a verb (a thing a row makes lands beside something that answers it) runs in
    // the same scratch. One frame per depth keeps what the outer row was about, so its later verbs and its
    // sentence are still about the right two things (putThing).
    frames: Array.from({ length: w.R.react.maxDepth + 1 }, () => ({ A: side(), B: side(), targets: new Int32Array(256), tN: 0, tileList: new Int32Array(256), tileN: 0 })),
  };
  w.rx.seen = new Int32Array(w.nTiles);
}
const clampW = (w, x) => Math.max(3, Math.min(w.W - 3, x));
const clampH = (w, y) => Math.max(3, Math.min(w.H - 3, y));
function side() { return { m0: 0, m1: 0, id: null, kind: null, terrain: null, e: -1, thing: null, tile: -1, x: 0, y: 0 }; }

// ---------- the triggers ----------
// A weapon or an element lands on a creature.
export function reactHit(w, a, t, weapId) {
  const R = w.rx, T = w.C.tags;
  fillCreature(w, R.A, a);
  if (weapId) { R.A.id = weapId; R.A.m0 |= T.weapon0[weapId] || 0; R.A.m1 |= T.weapon1[weapId] || 0; }
  fillCreature(w, R.B, t);
  R.cancel = false;
  run(w, TRIG.hit, w.E.x[t], w.E.y[t]);
  return !!R.cancel;
}
// A UFO's beam reaching for someone (14 §5: a tinfoil hat sends it sliding off). Returns true when a row said no.
export function reactBeam(w, ufo, target) {
  const R = w.rx;
  fillCreature(w, R.A, ufo);
  R.A.id = 'beam'; // the beam, not the saucer: a row names it by id
  fillCreature(w, R.B, target);
  R.cancel = false;
  run(w, TRIG.hit, w.E.x[target], w.E.y[target]);
  return !!R.cancel;
}

// A creature's feet enter a tile (and whatever thing stands on it). Called only when the tile really changed.
export function reactEnter(w, e, tile) {
  const R = w.rx, s = w.grid[tile], idx = R.R.idx[TRIG.enter];
  if (!idx.n) return;
  if (!idx.any) { // could any row care about this tile at all? (the cheap test, before anything is built)
    const t = w.terr[tile];
    const m0 = w.C.tags.terr0[t] | (s ? w.C.tags.thing0[s.type] || 0 : 0);
    const m1 = w.C.tags.terr1[t] | (s ? w.C.tags.thing1[s.type] || 0 : 0);
    if (!(m0 & idx.m0) && !(m1 & idx.m1) && !(s && idx.ids.has(s.type)) && !idx.terrs.has(w.C.TERR[t].id)) return;
  }
  fillCreature(w, R.A, e);
  fillTile(w, R.B, tile, s);
  run(w, TRIG.enter, w.E.x[e], w.E.y[e]);
}
// A player power resolves at a point.
export function reactPower(w, id, x, y) {
  const R = w.rx, T = w.C.tags, P = w.C.P[id];
  const setA = () => { reset(R.A); R.A.id = id; R.A.m0 = T.power0[id] || 0; R.A.m1 = T.power1[id] || 0; R.A.x = x; R.A.y = y; };
  const tx = Math.floor(x / w.T), ty = Math.floor(y / w.T);
  setA();
  if (inB(w, tx, ty)) fillTile(w, R.B, ty * w.cols + tx, w.grid[ty * w.cols + tx]);
  else reset(R.B);
  run(w, TRIG.power, x, y);
  // A power resolves at a point, and a point has both ground and whoever is standing on it. The second raise is
  // what lets a row say "lightning likes swords" or "the wind takes whoever is holding an umbrella" (design 15 A6).
  const who = nearAt(w, x, y, (P && P.radius) || w.R.react.powerReach);
  if (who < 0) return;
  setA();
  fillCreature(w, R.B, who);
  run(w, TRIG.power, w.E.x[who], w.E.y[who]);
}
// The nearest creature to a point, within r (spawn order breaks ties, so it is the same one every time).
function nearAt(w, x, y, r) {
  const n = gatherAny(w, x, y, r), near = w.near, E = w.E;
  let best = -1, bd = r * r;
  for (let k = 0; k < n; k++) {
    const o = near[k];
    if (E.inside[o] || E.dead[o]) continue;
    const dx = E.x[o] - x, dy = E.y[o] - y, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
// Gear is given to a creature, or picked up by one.
export function reactEquip(w, e, itemId) {
  const R = w.rx, T = w.C.tags;
  reset(R.A); R.A.id = itemId; R.A.m0 = (T.gear0[itemId] || 0) | (T.weapon0[itemId] || 0); R.A.m1 = (T.gear1[itemId] || 0) | (T.weapon1[itemId] || 0);
  fillCreature(w, R.B, e);
  run(w, TRIG.equip, w.E.x[e], w.E.y[e]);
}
// The child's own finger (design 17): a tap with the Hand on a creature or on a thing. It is the one gesture she
// can repeat as often as she likes, which is what makes a row she found by accident into one she can show
// somebody. A is the poke itself; B is who, or what, was poked.
export function reactPoke(w, e) {
  const R = w.rx;
  if (!R.R.idx[TRIG.poke].n || !w.R.flags.pokes || e < 0 || w.E.dead[e] || w.E.inside[e]) return false;
  reset(R.A); R.A.id = 'poke';
  fillCreature(w, R.B, e);
  return run(w, TRIG.poke, w.E.x[e], w.E.y[e]);
}
export function reactPokeThing(w, s) {
  const R = w.rx;
  if (!R.R.idx[TRIG.poke].n || !w.R.flags.pokes || !s) return false;
  reset(R.A); R.A.id = 'poke';
  fillThing(w, R.B, s);
  return run(w, TRIG.poke, s.tx * w.T + 4, s.ty * w.T + 4);
}
// A hen lays an egg beside her (design 17): by herself now and then (update.js), or because she was poked (the
// `lay` verb). Not if she is hungry or frightened or in the air, not with an egg already within a few tiles, and
// not past the world's egg cap. The egg remembers whose it is, and her name if she has one.
export function layEgg(w, e, poked) {
  const E = w.E, R = w.R, T = w.T;
  if (!R.flags.eggs || E.dead[e] || E.inside[e] || E.alt[e] > 0 || E.baby[e]) return false;
  if (!poked && (E.hunger[e] > R.needs.hungry || E.beh[e] === 1 /* fleeing */)) return false;
  // The allowance is counted for HER kind (duck eggs waiting for room used to fill the whole world's six, and the
  // hens then never laid again and died out: the review of Sep 21), and she does not lay by herself at all while
  // there are already as many of her kind as the world lets hatch.
  const mine = w.C.kid[E.kind[e]] + 1;
  let eggs = 0;
  for (let k = 0; k < w.structs.length; k++) { const s = w.structs[k]; if (s.type === 'egg' && (s.who || 0) === mine) eggs++; }
  if (eggs >= R.react.eggCap) return false;
  if (!poked && w.kindCount[mine - 1] >= Math.min(R.react.layCap, speciesCapOf(w))) return false;
  const tx = Math.floor(E.x[e] / T), ty = Math.floor(E.y[e] / T), near = R.react.layNear;
  if (!poked) for (let dy = -near; dy <= near; dy++) for (let dx = -near; dx <= near; dx++) { const x = tx + dx, y = ty + dy; if (inB(w, x, y) && w.grid[y * w.cols + x] && w.grid[y * w.cols + x].type === 'egg') return false; }
  const put = putThing(w, 'egg', tx, ty);
  if (!put) return false;
  put.who = w.C.kid[E.kind[e]] + 1;
  if (E.named[e]) put.name = E.name[e];
  addFx(w, 'heart', E.x[e], E.y[e] - 8, R.fx.heart);
  emitAt(w, EVI.land, e);
  if (!poked) { log(w, 'log.laid', { a: { name: E.name[e], kind: E.kind[e] } }); storyRow(w, -1, E.x[e], E.y[e], e, -1, w.C.kid[E.kind[e]], w.C.iconOf.heart, w.C.iconOf['thing:egg'], w.lastLog); }
  return true;
}
// A thing is placed, or appears, within rules.react.placedTiles tiles of another thing.
export function reactPlaced(w, s, byHand) {
  const R = w.rx, near = w.R.react.placedTiles, T = w.T;
  if (!R.R.idx[TRIG.placed].n) return;
  R.byHand = !!byHand; // (a row may ask: needs.hand. Set for the whole of this placing, cleared at the end.)
  underFeet(w, s);
  // The tiles around it, not every thing in the world: a world with thousands of things places just as fast.
  for (let ty = s.ty - near; ty <= s.ty + near; ty++) for (let tx = s.tx - near; tx <= s.tx + near; tx++) {
    if (!inB(w, tx, ty)) continue;
    const o = w.grid[ty * w.cols + tx];
    if (!o || o === s) continue;
    fillThing(w, R.A, s);
    fillThing(w, R.B, o);
    run(w, TRIG.placed, s.tx * T + 4, s.ty * T + 4);
  }
  // And it meets the ground it was put down on: a campfire on snow is a row, not a special case (design 15 A6).
  fillThing(w, R.A, s);
  fillTile(w, R.B, s.ty * w.cols + s.tx, null);
  run(w, TRIG.placed, s.tx * T + 4, s.ty * T + 4);
  R.byHand = false;
}
// A thing put down UNDER somebody: whoever is standing on that tile has arrived at it, exactly as if they had
// walked onto it. It is the first thing a child tries (the mushroom under the dog, the bounce pad under the cow)
// and it used to do nothing until the creature left and came back, because its mark already named the tile.
function underFeet(w, s) {
  if (!w.R.flags.pokes || s.def.block || !w.rx.lastTile.length) return;
  const i = s.ty * w.cols + s.tx, x = s.tx * w.T + 4, y = s.ty * w.T + 4, E = w.E, T = w.T;
  const n = gatherAny(w, x, y, T), near = w.near, who = [];
  for (let k = 0; k < n; k++) { const e = near[k]; if (!E.dead[e] && !E.inside[e] && !(E.alt[e] > 0) && Math.floor(E.y[e] / T) * w.cols + Math.floor(E.x[e] / T) === i) who.push(e); }
  // In the order they were born, never the order the spatial hash hands them back (that differs in a loaded world).
  who.sort((p, q) => E.id[p] - E.id[q]);
  // Raised here and now, not left for the next sweep: a world saved in between would rebuild the mark from where
  // they stand and never raise it (the fault tools/land-fuzz.mjs exists for).
  for (const e of who) {
    if (E.dead[e]) continue;
    reactEnter(w, e, i);
    const x2 = Math.floor(E.x[e] / T), y2 = Math.floor(E.y[e] / T);
    if (w.rx.lastTile.length > e && inB(w, x2, y2)) w.rx.lastTile[e] = E.alt[e] > 0 && w.R.flags.landIsArriving ? -1 : y2 * w.cols + x2;
  }
}
// Dawn, dusk, a full moon: checked once per event, never per tick. A clock event belongs to the WORLD, not to
// two things that met, so every row naming it fires, in file order, not only the first (14 §5's first-match-wins
// is about one meeting). Its B side is empty, so every clock row matches every clock event: under first-match
// the game could only ever hold ONE dawn row, and sunrise_undead was it. That is why the troll turning to stone
// at dawn, the werewolf and the vampire in the sun were all blocked behind one line (found Sep 20).
// flags.clockAll off: the old single row, which is how a world recorded before this is reproduced.
export function reactClock(w, what) {
  const R = w.rx, x = w.W / 2, y = w.H / 2;
  reset(R.A); R.A.id = what;
  reset(R.B);
  if (w.R.flags.clockAll === false) { run(w, TRIG.clock, x, y); return; }
  const rows = R.R.byTrig[TRIG.clock];
  for (let i = 0; i < rows.length; i++) {
    if (R.depth >= w.R.react.maxDepth) return;
    const row = rows[i];
    reset(R.A); R.A.id = what; reset(R.B); // a row that fired may have raised a chain that overwrote A and B
    if (!matches(w, row, R.A, row.a) || !matches(w, row, R.B, row.b) || !needsOk(w, row)) continue;
    if (R.chain.indexOf(row.i) >= 0) continue; // a row fires once in a chain
    const key = row.id + '|' + handleOf(w, R.A) + '|' + handleOf(w, R.B);
    if (row.mode === 'once' && onCooldown(w, row, key)) continue;
    fire(w, row, key, x, y);
  }
}

// Two creatures near each other, on the thinking one's own think tick and nowhere else (design team, Sep 20).
// A is the one thinking, B is who it noticed. Bounded three ways so a crowd cannot cost the step: it walks only
// the spatial hash within rules.react.meetR, it stops at the FIRST row that fires, and it costs one branch when
// the game holds no meet rows at all. Deterministic: think ticks are staggered on a fixed schedule and the hash
// is walked in its own fixed order, so a replay meets the same creature.
export function reactMeet(w, e) {
  const R = w.rx, idx = R.R.idx[TRIG.meet];
  if (!idx.n || !w.R.flags.meet) return;
  const E = w.E;
  if (E.inside[e] || E.dead[e]) return;
  if (!idx.aAny && !idx.aKinds.has(E.kind[e])) { // no meet row names this kind: is one about a tag its species carries, or about giants?
    if (!w.R.flags.pokes) return;
    let mine = idx.aKindOk[w.C.kid[E.kind[e]]] === 1 || (idx.aGiant && E.bigT[e] > 0);
    if (!mine && idx.aGear && hasOn(w, e)) { // it has something on: is any meet row about that very thing?
      fillCreature(w, R.A, e);
      const rows = R.R.byTrig[TRIG.meet];
      for (let k = 0; k < rows.length && !mine; k++) { const A = rows[k].a; if (A.wears ? wearing(w, e, A.wears) : (A.m0 || A.m1) && (R.A.m0 & A.m0) === A.m0 && (R.A.m1 & A.m1) === A.m1) mine = true; }
    }
    if (!mine) return; // (never walk the hash for nobody)
  }
  const n = gatherAny(w, E.x[e], E.y[e], w.R.react.meetR), near = w.near;
  if (!n) return;
  const list = R.met, d2 = R.metD;
  let m = 0;
  for (let k = 0; k < n && m < list.length; k++) {
    const o = near[k];
    if (o === e || E.inside[o] || E.dead[o]) continue;
    const dx = E.x[o] - E.x[e], dy = E.y[o] - E.y[e], d = dx * dx + dy * dy;
    // The spatial hash hands back whole CELLS (16 px), and its own comment says callers still test the distance.
    // This one did not, so creatures "met" from up to three cells off: a goat ate a flower crown from five tiles
    // away (the review of Sep 21).
    if (w.R.flags.exactReach && d > w.R.react.meetR * w.R.react.meetR) continue;
    let at = m;
    while (at > 0 && (d2[at - 1] > d || (d2[at - 1] === d && E.id[list[at - 1]] > E.id[o]))) { list[at] = list[at - 1]; d2[at] = d2[at - 1]; at--; }
    list[at] = o; d2[at] = d; m++;
  }
  if (!m) return;
  fillCreature(w, R.A, e); // once: a fire returns immediately, so nothing can overwrite it mid loop
  for (let k = 0; k < m; k++) {
    const o = list[k];
    fillCreature(w, R.B, o);
    if (run(w, TRIG.meet, E.x[o], E.y[o])) return; // one meeting a think, so a crowd is not a cascade
  }
}

// `while` rows (14 §5): an effect that holds as long as the condition holds, re-checked on the wearer's think
// tick and nowhere else. For Test 1 these are worn things: what a creature carries meets the creature itself
// (a teddy bear keeps an ogre peaceful while it is held). No cooldown: it is not an event, it is a state.
export function reactWhile(w, e) {
  const R = w.rx, rows = R.R.byTrig[TRIG.equip], E = w.E, C = w.C, want = w.R.flags.whileTags === false ? R.R.whileGearById : R.R.whileGear;
  if (!want.size) return;
  const g = E.gear[e];
  let carries = false; // nearly every creature carries nothing a while row names: one walk of its gear, then out
  const GK = C.gearKeys; // (indexed, not for-of: this runs for every creature on every think, and the iterator was the step's biggest allocation)
  for (let q = 0; q < GK.length; q++) { const k = GK[q], v = g[k]; if (v && want.has(typeof v === 'string' ? v : k)) { carries = true; break; } }
  if (!carries) return;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (row.mode !== 'while') continue;
    fillCreature(w, R.B, e);
    if (!matches(w, row, R.B, row.b) || !needsOk(w, row)) continue;
    let found = false;
    const GK2 = C.gearKeys;
    for (let q = 0; q < GK2.length; q++) {
      const k = GK2[q], v = g[k];
      if (!v) continue;
      const id = typeof v === 'string' ? v : k;
      reset(R.A);
      R.A.id = id; R.A.m0 = (C.tags.gear0[id] || 0) | (C.tags.weapon0[id] || 0) | (C.tags.gear0[k] || 0);
      R.A.m1 = (C.tags.gear1[id] || 0) | (C.tags.weapon1[id] || 0) | (C.tags.gear1[k] || 0);
      if (matches(w, row, R.A, row.a)) { found = true; break; }
    }
    if (!found) continue;
    scope(w, row, E.x[e], E.y[e]);
    R.depth++;
    if (w.R.flags.honestRows) { // the same honesty as fire(): a lantern with no undead near it shows nothing and counts as nothing
      let did = 0;
      for (const eff of row.subst) { const verb = VERBS[eff.do]; if (verb) did += verb(w, row, eff, E.x[e], E.y[e]) | 0; }
      if (row.subst.length && !did) { R.depth--; R.duds[row.id] = (R.duds[row.id] || 0) + 1; continue; }
      R.did[row.id] = (R.did[row.id] || 0) + did;
      for (const eff of row.cosm) { const verb = VERBS[eff.do]; if (verb) verb(w, row, eff, E.x[e], E.y[e]); }
    } else for (const eff of row.effects) { const verb = VERBS[eff.do]; if (verb) verb(w, row, eff, E.x[e], E.y[e]); }
    R.depth--;
    R.n++;
    R.fired[row.id] = (R.fired[row.id] || 0) + 1;
  }
}

function copySide(to, from) { to.m0 = from.m0; to.m1 = from.m1; to.id = from.id; to.kind = from.kind; to.terrain = from.terrain; to.e = from.e; to.thing = from.thing; to.tile = from.tile; to.x = from.x; to.y = from.y; }
function reset(s) { s.m0 = 0; s.m1 = 0; s.id = null; s.kind = null; s.terrain = null; s.e = -1; s.thing = null; s.tile = -1; s.x = 0; s.y = 0; }
function fillCreature(w, s, e) {
  reset(s);
  if (e < 0) return;
  const E = w.E, kind = E.kind[e], C = w.C;
  const ki = C.kid[kind];
  s.e = e; s.kind = kind; s.id = kind; s.m0 = C.tags.kind0[ki]; s.m1 = C.tags.kind1[ki];
  const g = E.gear[e], keys = C.gearKeys;
  for (let q = 0; q < keys.length; q++) { // what it wears counts as its own tags: a tinfoil hat makes its wearer foil
    const k = keys[q], v = g[k];
    if (!v) continue;
    const id = typeof v === 'string' ? v : k;
    s.m0 |= (C.tags.gear0[id] || 0) | (C.tags.weapon0[id] || 0) | (C.tags.gear0[k] || 0);
    s.m1 |= (C.tags.gear1[id] || 0) | (C.tags.weapon1[id] || 0) | (C.tags.gear1[k] || 0);
  }
  if (E.bigT[e] > 0) { s.m0 |= C.tags.giant0; s.m1 |= C.tags.giant1; } // a giant is a giant whatever it was (design 17)
  s.x = E.x[e]; s.y = E.y[e];
}
function fillTile(w, s, tile, st) {
  reset(s);
  s.tile = tile;
  const t = w.terr[tile];
  s.m0 = w.C.tags.terr0[t]; s.m1 = w.C.tags.terr1[t];
  s.terrain = w.C.TERR[t].id;
  if (st) { s.thing = st; s.id = st.type; s.m0 |= w.C.tags.thing0[st.type] || 0; s.m1 |= w.C.tags.thing1[st.type] || 0; }
  s.x = (tile % w.cols) * w.T + 4; s.y = Math.floor(tile / w.cols) * w.T + 4;
}
function fillThing(w, s, st) {
  reset(s);
  s.thing = st; s.id = st.type; s.tile = st.ty * w.cols + st.tx;
  const t = w.terr[s.tile];
  s.m0 = (w.C.tags.thing0[st.type] || 0) | w.C.tags.terr0[t];
  s.m1 = (w.C.tags.thing1[st.type] || 0) | w.C.tags.terr1[t];
  s.x = st.tx * w.T + 4; s.y = st.ty * w.T + 4;
}

// ---------- matching ----------
function matches(w, row, s, side2) {
  if ((s.m0 & side2.m0) !== side2.m0 || (s.m1 & side2.m1) !== side2.m1) return false;
  if (side2.id && s.id !== side2.id) return false;
  if (side2.ids && !side2.ids.has(s.id)) return false;
  if (side2.kind && s.kind !== side2.kind) return false;
  if (side2.kinds && !side2.kinds.has(s.kind)) return false;
  if (side2.terrain && s.terrain !== side2.terrain) return false;
  if (side2.wears && !(s.e >= 0 && wearing(w, s.e, side2.wears))) return false;
  return true;
}
// Is it wearing or holding anything at all? (Seven reads, asked before anything dearer.)
function hasOn(w, e) {
  const g = w.E.gear[e];
  if (!g) return false;
  if (g.weapon) return true;
  for (let k = 0; k < GEAR_SLOTS.length; k++) if (g[GEAR_SLOTS[k]]) return true; // (indexed: a for-of here allocated on every think of every creature)
  return false;
}
// Is this creature wearing or holding this very thing?
export function wearing(w, e, id) {
  const g = w.E.gear[e];
  if (!g) return false;
  for (let k = 0; k < GEAR_SLOTS.length; k++) if (g[GEAR_SLOTS[k]] === id) return true; // (a worn piece: validate-data refuses `wears` naming a weapon)
  return false;
}
// A row's conditions. Only the one a row actually asks for is here: the design also lists night, terrain and Safe
// off, and each is one line the day a row wants it (the coverage gate refuses code that nothing runs).
function needsOk(w, row) {
  const n = row.needs;
  if (!n) return true;
  if (n.raining !== undefined && n.raining !== w.rainT > 0) return false;
  if (n.named !== undefined) { const R = w.rx, e = R.B.e >= 0 ? R.B.e : R.A.e; if (n.named !== !!(e >= 0 && w.E.named[e])) return false; } // somebody the child named
  if (n.landing !== undefined && n.landing !== !!w.rx.landing) return false; // it came down out of the air, it did not walk here
  if (n.walks !== undefined) { const e = w.rx.A.e; if (n.walks !== !(e >= 0 && (w.C.S[w.E.kind[e]].fly || w.E.gear[e].wings))) return false; } // its feet touch the ground (a UFO over a pond has touched nothing)
  if (n.hand !== undefined && n.hand !== !!w.rx.byHand) return false; // the child's own hand put it down, not the world's (a village, a spill)
  if (n.looks !== undefined && n.looks !== !(w.rx.A.thing && w.R.react.lookSkip.indexOf(w.rx.A.thing.type) >= 0)) return false; // worth walking over for (not a fence)
  return true;
}
const handleOf = (w, s) => (s.e >= 0 ? w.slotH[s.e] : s.thing ? -s.thing.h : s.tile >= 0 ? -1000000 - s.tile : 0);
function onCooldown(w, row, key) {
  const until = w.rx.cool.get(key);
  return until !== undefined && until > w.time;
}
function setCooldown(w, row, key) {
  const R = w.rx, sec = row.cooldownSec === null ? w.R.react.cooldownSec : row.cooldownSec;
  if (sec <= 0) return;
  R.cool.set(key, w.time + sec);
  if (R.cool.size > w.R.react.coolMax) { // sweep what has run out, oldest first (insertion order)
    for (const [k, t] of R.cool) { if (t <= w.time) R.cool.delete(k); if (R.cool.size <= w.R.react.coolMax / 2) break; }
  }
}

// The heart: walk this trigger's rows in file order, fire the first that matches.
function run(w, trig, x, y) {
  const R = w.rx;
  if (R.depth >= w.R.react.maxDepth) return false;
  const rows = R.R.byTrig[trig];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!matches(w, row, R.A, row.a) || !matches(w, row, R.B, row.b)) continue;
    if (!needsOk(w, row)) continue;
    if (R.chain.indexOf(row.i) >= 0) continue; // a row fires once in a chain
    // (Keyed by the row's ID. It was its place in the file, so every row added above it slid a saved world's
    // cooldowns onto its neighbours for their last few seconds.)
    const key = row.id + '|' + handleOf(w, R.A) + '|' + handleOf(w, R.B);
    if (row.mode === 'once' && onCooldown(w, row, key)) continue;
    if (row.globalCd && !R.byHand && onCooldown(w, row, row.id + '|*')) continue; // once anywhere per globalCooldownSec (her own hand goes through: what she does on purpose always works)
    if (fire(w, row, key, x, y)) { if (row.globalCd) R.cool.set(row.id + '|*', w.time + row.globalCd); return true; } // first match wins, unless it turned out to be about nothing
  }
  return false;
}

// One thing cooked: the flag a saved world keeps, and the heart that says it happened.
function cookOne(w, s) {
  if (!s.def.food || s.cooked) return 0;
  s.cooked = 1;
  addFx(w, 'heart', s.tx * w.T + 4, s.ty * w.T - 2, w.R.fx.heart);
  return 1;
}

// A thing put on the ground by the world itself, on the nearest tile from (tx, ty) that can hold one. It raises
// `placed`, exactly as a thing the child puts down does, so the world's own hands work the same as theirs.
// Bounded by the same tile budget every other tile effect spends, so a row cannot carpet the map.
function putThing(w, type, tx, ty) {
  const R = w.rx;
  if (R.tileTick !== w.tick) { R.tileTick = w.tick; R.tiles = 0; }
  if (R.tiles >= w.R.react.tileCap) return null;
  for (let r = 0; r <= 2; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = tx + dx, y = ty + dy;
    if (!inB(w, x, y) || w.grid[y * w.cols + x]) continue;
    placeStruct(w, type, x, y);
    const put = w.grid[y * w.cols + x];
    if (!put) continue; // lava, or water without a bridge
    R.tiles++;
    // What the new thing lands beside may answer it, and that reaction runs in the same scratch as the row
    // that made the thing. Keep what this row was about, so its later verbs and its sentence still are.
    const fr = R.frames[Math.min(R.depth, R.frames.length - 1)];
    copySide(fr.A, R.A); copySide(fr.B, R.B);
    fr.tN = R.tN; fr.targets.set(R.targets.subarray(0, R.tN));
    fr.tileN = R.tileN; fr.tileList.set(R.tileList.subarray(0, R.tileN));
    reactPlaced(w, put);
    copySide(R.A, fr.A); copySide(R.B, fr.B);
    R.tN = fr.tN; R.targets.set(fr.targets.subarray(0, fr.tN));
    R.tileN = fr.tileN; R.tileList.set(fr.tileList.subarray(0, fr.tileN));
    return put;
  }
  return null;
}

// ---------- firing ----------
function fire(w, row, key, x, y) {
  const R = w.rx;
  // The targets, by the row's scope, taken before the effects run (an effect may kill or move them), and before
  // the cooldown, because a row that turns out to be about nobody must not fire at all.
  scope(w, row, x, y);
  // A row that names WHO it is about (scope.only) and found nobody has nothing to say. Every one of those rows
  // acts only on creatures (follow, calm, stun, become), so the creature count is the test; a radius scope fills
  // its tile list whether or not anybody is standing on it. Before this, every dawn in every world announced
  // "Skeletons hate the morning" whether or not a skeleton existed, and the same for every parade with nobody
  // to parade (found Sep 20, when a second dawn row started announcing a troll waking in worlds with no troll).
  if (w.R.flags.quietRows !== false && !R.tN && !R.tileN) return false; // it reached nobody and no ground
  if (w.R.flags.quietRows !== false && row.scope.only && !R.tN) return false; // it named who it was about and they are not here
  if (row.mode === 'once') setCooldown(w, row, key);
  R.depth++;
  R.chain.push(row.i);
  if (w.R.flags.honestRows) {
    // The verbs that change the world go first and say how much they changed. A row that matched, reached
    // somebody, and then changed nothing at all (a `follow` whose only target was the leader itself, a `cook`
    // with nothing to cook, a `terrain` that was already that ground) has nothing to show and nothing to say:
    // it steps aside exactly as a row that reached nobody does, and the next row gets its turn. Before this,
    // "The cat has spotted a mouse" printed over a cat that did not move (found Sep 21: three of the first
    // seven meet rows were like that, and their fixtures only asked whether the row had fired).
    let did = 0;
    const each = w.R.flags.clockLands && (row.trig === TRIG.clock || row.each); // (what is SHOWN happens where each target is: atEach, below)
    for (const eff of row.subst) { const verb = VERBS[eff.do]; if (verb) did += (eff.on ? onOne(w, row, eff, verb, x, y) : verb(w, row, eff, x, y)) | 0; }
    if (row.subst.length && !did) {
      R.duds[row.id] = (R.duds[row.id] || 0) + 1;
      if (row.mode === 'once') R.cool.delete(key);
      R.chain.pop();
      R.depth--;
      return false;
    }
    R.did[row.id] = (R.did[row.id] || 0) + did;
    for (const eff of row.cosm) { const verb = VERBS[eff.do]; if (verb) { if (eff.on) onOne(w, row, eff, verb, x, y); else if (each) atEach(w, row, eff, verb); else verb(w, row, eff, x, y); } }
  } else {
    for (const eff of row.effects) {
      const verb = VERBS[eff.do];
      if (verb) verb(w, row, eff, x, y);
    }
  }
  R.n++;
  R.fired[row.id] = (R.fired[row.id] || 0) + 1;
  // The sentence: at most once per `sayEverySec` when a row says so (a heart every poke, the caption once a minute,
  // or the News is noise), and with the thing's own name when it has one (a grave remembers who).
  const sayKey = row.id + '|say';
  const quiet = row.sayEvery > 0 && onCooldown(w, row, sayKey);
  if (row.say && !quiet) {
    const th = R.B.thing && R.B.thing.name ? R.B.thing : null;
    log(w, th && row.sayNamed ? row.sayNamed : row.say, { a: R.A.e >= 0 ? { name: w.E.name[R.A.e], kind: w.E.kind[R.A.e] } : null, b: R.B.e >= 0 ? { name: w.E.name[R.B.e], kind: w.E.kind[R.B.e] } : null, name: th ? th.name : undefined });
    if (row.sayEvery > 0) R.cool.set(sayKey, w.time + row.sayEvery);
  }
  // One story record for the reaction itself (14 §4's "one event record, four uses"): the Because card, the
  // sparkle, the status line and the Scrapbook all read the same thing.
  storyRow(w, row.i, x, y, R.A.e, R.B.e, row.a.pic, row.b.pic, row.res, row.say && !quiet ? w.lastLog : null);
  R.chain.pop();
  R.depth--;
  return true;
}

// A clock row belongs to the whole world, so it has no place of its own: reactClock can only hand it the middle
// of the map. Until Sep 21 that is where every dawn row's picture, sound and spawn happened, however far away
// the troll it had just turned to stone was standing, which is why dawn had nothing to look at. The verbs that
// happen AT a place (fx, sound, spawn, makeThing) now happen where each of the row's targets is, bounded by
// rules.react.eachCap so a dawn over a thousand skeletons is not a thousand puffs. A row may ask for the same
// (`each: true`) on any trigger.
function atEach(w, row, eff, verb) {
  const R = w.rx, E = w.E, cap = w.R.react.eachCap, T = w.T;
  let did = 0;
  const tN = Math.min(R.tN, cap);
  for (let k = 0; k < tN; k++) { const e = R.targets[k]; did += verb(w, row, eff, E.x[e], E.y[e]) | 0; }
  return did;
}

// Send a creature somewhere for a while (ai/decide.js B_ERRAND does the going). It decides again at its next own
// think tick, so the errand competes with everything else it might want, fear first.
function errand(w, e, x, y, sec) {
  const E = w.E;
  E.errX[e] = x; E.errY[e] = y; E.errT[e] = sec;
  if (e !== w.rx.thinker) E.think[e] = 0;
}

// One verb of a row may act on just one of the two who met, whatever the row's scope is (`on: "a"` or `on: "b"`):
// a cat that has seen a mouse goes after it AND the mouse runs, which is two verbs with two different subjects.
// The picture and the sound of it happen where that one is standing.
function onOne(w, row, eff, verb, x, y) {
  const R = w.rx, who = eff.on === 'a' ? R.A : R.B;
  if (who.e < 0) return 0;
  const n = R.tN, first = R.targets[0];
  R.tN = 1; R.targets[0] = who.e;
  const did = verb(w, row, eff, w.E.x[who.e], w.E.y[who.e]);
  R.tN = n; R.targets[0] = first;
  return did;
}

// Who and what the effects act on. Fills R.targets (creature slots) and R.tileList (tile indexes).
function scope(w, row, x, y) {
  const R = w.rx, sc = row.scope;
  R.tN = 0; R.tileN = 0;
  if (sc.kind === 'world') { // every tile of a terrain, wherever it is: an instant power acts on all of it
    const m0 = sc.m0 || 0, m1 = sc.m1 || 0, cap = Math.min(sc.max || w.R.react.tileCap, w.R.react.tileCap);
    for (let i = 0; i < w.nTiles && R.tileN < cap; i++) {
      const t = w.terr[i];
      if ((w.C.tags.terr0[t] & m0) !== m0 || (w.C.tags.terr1[t] & m1) !== m1) continue;
      R.tileList[R.tileN++] = i;
    }
    creaturesOnTiles(w);
    return;
  }
  if (sc.kind === 'a') { if (R.A.e >= 0) R.targets[R.tN++] = R.A.e; if (R.A.tile >= 0) R.tileList[R.tileN++] = R.A.tile; return; }
  if (sc.kind === 'b') { if (R.B.e >= 0) R.targets[R.tN++] = R.B.e; if (R.B.tile >= 0) R.tileList[R.tileN++] = R.B.tile; return; }
  if (sc.kind === 'radius') {
    const n = gatherAny(w, x, y, sc.r), near = w.near, E = w.E;
    for (let k = 0; k < n && R.tN < R.targets.length; k++) {
      const o = near[k];
      if (E.inside[o] || E.dead[o]) continue;
      if (w.R.flags.exactReach) { const ddx = E.x[o] - x, ddy = E.y[o] - y; if (ddx * ddx + ddy * ddy > sc.r * sc.r) continue; } // (within r, not merely in a cell r touches: see reactMeet)
      if (sc.only && !only(w, sc, o)) continue;
      R.targets[R.tN++] = o;
    }
    // `max`: only the nearest few (ties to the lower id, so a replay and a loaded world pick the same ones; the
    // spatial hash hands them back in insertion order, which is not the same in both).
    if (sc.max > 0 && R.tN > sc.max) {
      const T = R.targets, m = R.tN;
      for (let a = 1; a < m; a++) { // insertion sort by distance then id: the list is a few dozen at most
        const o = T[a], dx = E.x[o] - x, dy = E.y[o] - y, d = dx * dx + dy * dy;
        let b = a - 1;
        while (b >= 0) { const q = T[b], qx = E.x[q] - x, qy = E.y[q] - y, qd = qx * qx + qy * qy; if (qd < d || (qd === d && E.id[q] < E.id[o])) break; T[b + 1] = q; b--; }
        T[b + 1] = o;
      }
      R.tN = sc.max;
    }
    tilesInRadius(w, x, y, sc.r, sc);
  } else if (sc.kind === 'fill') {
    fillTiles(w, R.B.tile, sc, Math.min(sc.max || w.R.react.tileCap, w.R.react.tileCap));
    creaturesOnTiles(w);
  } else { // 'target'
    if (R.B.e >= 0) R.targets[R.tN++] = R.B.e;
    if (R.B.tile >= 0) R.tileList[R.tileN++] = R.B.tile;
  }
}
// A scope may take only some of the creatures it reached: a kind, or tags (the crown's parade is chickens).
// A scope may take only some of the creatures it reached: the kind a row names (the crown's parade is chickens),
// the tags it names (the dawn only troubles the undead), or the same kind as whatever the row met (a bell on a
// sheep is followed by sheep, not by every animal in the field).
function only(w, sc, e) {
  const rule = sc.only, E = w.E;
  if (rule.kind && E.kind[e] !== rule.kind) return false;
  if (rule.sameKind && E.kind[e] !== E.kind[w.rx.B.e >= 0 ? w.rx.B.e : e]) return false;
  if (rule.calm && !(E.calm[e] > 0)) return false; // whoever is at peace (the moon's panther is, all night; a wild one is not)
  if (rule.tags) {
    const C = w.C, ki = C.kid[E.kind[e]];
    let m0 = C.tags.kind0[ki], m1 = C.tags.kind1[ki];
    // What it wears counts as its own tags here too, as it always has when a row MATCHES (fillCreature). A scope
    // read only the species, so no row could ever say "whoever is wearing the amulet": the same fault as the
    // while rows that could only name an id. (Both judges, Sep 20; the line was still true on Sep 21.)
    if (w.R.flags.onlySeesGear) {
      const g = E.gear[e], GK = C.gearKeys;
      for (let q = 0; q < GK.length; q++) { // (indexed: a `while` row with scope.only asks this of everyone near its wearer on every think)
        const k = GK[q], v = g[k];
        if (!v) continue;
        const id = typeof v === 'string' ? v : k;
        m0 |= (C.tags.gear0[id] || 0) | (C.tags.weapon0[id] || 0) | (C.tags.gear0[k] || 0);
        m1 |= (C.tags.gear1[id] || 0) | (C.tags.weapon1[id] || 0) | (C.tags.gear1[k] || 0);
      }
    }
    if ((m0 & sc.onlyM0) !== sc.onlyM0 || (m1 & sc.onlyM1) !== sc.onlyM1) return false;
  }
  return true;
}
function tilesInRadius(w, x, y, r, sc) {
  const R = w.rx, T = w.T, m0 = sc.m0 || 0, m1 = sc.m1 || 0;
  const tx0 = Math.max(0, Math.floor((x - r) / T)), tx1 = Math.min(w.cols - 1, Math.floor((x + r) / T));
  const ty0 = Math.max(0, Math.floor((y - r) / T)), ty1 = Math.min(w.rows - 1, Math.floor((y + r) / T));
  for (let ty = ty0; ty <= ty1 && R.tileN < R.tileList.length; ty++) for (let tx = tx0; tx <= tx1 && R.tileN < R.tileList.length; tx++) {
    const i = ty * w.cols + tx;
    if ((w.C.tags.terr0[w.terr[i]] & m0) !== m0 || (w.C.tags.terr1[w.terr[i]] & m1) !== m1) continue;
    R.tileList[R.tileN++] = i;
  }
}
// The connected tiles of one terrain tag, from the tile the reaction landed on: a flood fill, capped (14 §5).
function fillTiles(w, from, sc, cap) {
  const R = w.rx;
  if (from < 0) return;
  const m0 = sc.m0 || 0, m1 = sc.m1 || 0;
  R.seenStamp++;
  let head = 0, n = 0;
  R.fill[n++] = from; R.seen[from] = R.seenStamp;
  while (head < n && R.tileN < cap) {
    const i = R.fill[head++];
    if ((w.C.tags.terr0[w.terr[i]] & m0) !== m0 || (w.C.tags.terr1[w.terr[i]] & m1) !== m1) continue;
    R.tileList[R.tileN++] = i;
    const tx = i % w.cols, ty = (i / w.cols) | 0;
    for (let d = 0; d < 4; d++) {
      const nx = tx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = ty + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (!inB(w, nx, ny)) continue;
      const j = ny * w.cols + nx;
      if (R.seen[j] === R.seenStamp || n >= R.fill.length) continue;
      R.seen[j] = R.seenStamp;
      R.fill[n++] = j;
    }
  }
}
function creaturesOnTiles(w) {
  const R = w.rx, E = w.E, T = w.T;
  for (let k = 0; k < w.count && R.tN < R.targets.length; k++) {
    const e = w.order[k];
    if (E.inside[e] || E.dead[e]) continue;
    const i = Math.floor(E.y[e] / T) * w.cols + Math.floor(E.x[e] / T);
    for (let j = 0; j < R.tileN; j++) if (R.tileList[j] === i) { R.targets[R.tN++] = e; break; }
  }
}

// A tile effect may only spend from this tick's budget (14 §5); the overflow is dropped, in file order, which is
// the order rows run in, so two worlds with the same seed drop the same tiles.
function tileBudget(w, want) {
  const R = w.rx;
  if (R.tileTick !== w.tick) { R.tileTick = w.tick; R.tiles = 0; }
  const left = Math.max(0, w.R.react.tileCap - R.tiles);
  const take = Math.min(want, left);
  R.tiles += take;
  return take;
}

// ---------- the effect verbs ----------
// Every verb is small and generic: a row adds no code. `w.rx.targets` and `w.rx.tileList` are what it acts on.
export const VERBS = {
  // Damage, always through the harm table as a reaction (14 §6): a guarded human is singed, not hurt.
  damage(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k], dmg = allowed(w, e, SRC.reaction, eff.hp);
      if (dmg > 0) { E.hp[e] -= dmg; E.flash[e] = w.R.combat.hitFlash; }
    }
    return R.tN; // whoever it reached: under Safe the harm table turns the hurt aside, and the reaction still shows (14 §6)
  },
  // Held still where they stand (the freeze power's own field), and floating if they are in water.
  stun(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; E.frozen[e] = Math.max(E.frozen[e], eff.sec); E.goalKind[e] = G_NONE; }
    return R.tN;
  },
  // Peaceful: it stops wanting to fight for a while (ai/decide.js reads E.calm).
  calm(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; E.calm[e] = Math.max(E.calm[e], eff.sec); E.goalKind[e] = G_NONE; E.think[e] = 0; }
    return R.tN;
  },
  // Run from the other one of the two who met (or from the side the row names, `from`), for a few seconds. Fear is
  // as common a feeling as calm, and until this verb the only way to show it was to freeze somebody on the spot.
  // The goal is held (E.think) or the creature's next think tick would replace it after one step.
  flee(w, row, eff) {
    const R = w.rx, E = w.E, A = w.R.ai;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      const from = eff.from === 'a' || R.B.e === e ? R.A : R.B; // from the side the row names, else from the other one of the two
      if (from.e === e || E.inside[e] || E.alt[e] > 0 || E.perch[e]) continue;
      const dx = E.x[e] - from.x, dy = E.y[e] - from.y, d = Math.sqrt(dx * dx + dy * dy) + 0.001; // (never zero: two on exactly the same point)
      goalMove(w, e, clampW(w, E.x[e] + (dx / d) * A.fleeDist), clampH(w, E.y[e] + (dy / d) * A.fleeDist), 1);
      E.think[e] = eff.sec;
      if (e === R.thinker) R.took = true; // (ai/decide.js: it is deciding right now, and this IS its decision)
      n++;
    }
    return n;
  },
  // Follow whoever set this off (ai/decide.js B_FOLLOW), for a while or until they are gone.
  follow(w, row, eff) {
    const R = w.rx, E = w.E;
    // Whoever the row met leads, unless the row says the one who set it off does (`lead: "a"`): a dog that has
    // seen a cat goes after the cat, and the cat is the row's A side.
    const lead = eff.lead === 'a' && w.R.flags.honestRows ? R.A.e : R.B.e;
    if (lead >= 0) {
      let n = 0;
      for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (e === lead) continue; E.fol[e] = w.slotH[lead]; E.folT[e] = eff.sec || w.R.react.followSec; E.think[e] = 0; n++; }
      return n;
    }
    // A `placed` row meets a THING, never a creature, so there is nobody to walk behind: they walk to the thing
    // instead. Without this the dog and the toy, and the bird and the crown, both announced themselves and then
    // nothing happened at all (found Sep 20).
    // The thing that was just PUT DOWN when this is a placed row (a sign calls the herd to the sign, not to the house
    // it was put beside), else the thing that was met.
    const s = row.trig === TRIG.placed && w.R.flags.exactReach ? R.A.thing : R.B.thing || R.A.thing;
    if (!s || !w.R.flags.walkToThings) return 0;
    const T = w.T, tx = s.tx * T + 4, ty = s.ty * T + 5;
    const hold = eff.hold || Math.min(eff.sec || 0, w.R.react.walkSec); // (`hold`: long enough to get there, for a row that calls them from further off)
    let went = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (w.R.flags.pokes && (E.goalKind[e] === 2 /* G_ATTACK */ || E.beh[e] === 1 /* B_FLEE */ || E.frozen[e] > 0)) continue; // hunting, fleeing or held: it has better things to do
      went++;
      if (w.R.flags.errands) { errand(w, e, tx, ty, hold); continue; } // it goes, and still sees what is round it (ai/decide.js B_ERRAND)
      goalMove(w, e, tx, ty, 0); E.think[e] = hold;
      if (e === R.thinker) R.took = true;
    }
    return went;
  },
  // Turn into another kind, keeping where it stands and its name (a slime crossing lava).
  become(w, row, eff) {
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (!w.C.S[eff.kind] || E.kind[e] === eff.kind) continue;
      n++;
      const was = E.kind[e], hp = E.hp[e], max = w.C.S[was].hp;
      E.kind[e] = eff.kind;
      E.hp[e] = Math.max(1, (hp / max) * w.C.S[eff.kind].hp);
      // The counts the sim keeps by kind, and the list of humans, follow it across (ents.js keeps both).
      w.kindCount[w.C.kid[was]]--;
      w.kindCount[w.C.kid[eff.kind]]++;
      if (was === 'human' || eff.kind === 'human') {
        let h = 0;
        for (let j = 0; j < w.count; j++) if (E.kind[w.order[j]] === 'human') w.humans[h++] = w.order[j];
        w.nHumans = h;
      }
      addFx(w, 'magic', E.x[e], E.y[e], w.R.fx.heart);
    }
    return n;
  },
  // A new creature at the place; the world's caps still hold (14 §5).
  spawn(w, row, eff, x, y) {
    const cap = w.R.tools.placeCap;
    const n = Math.min(eff.n === undefined ? 1 : eff.n, 8);
    let made = 0;
    for (let k = 0; k < n; k++) {
      // A row a child can set off forty times (a rabbit out of a hat) must not be a way round the caps a birth keeps.
      if (w.R.flags.pokes && w.C.kid[eff.kind] !== undefined && w.kindCount[w.C.kid[eff.kind]] >= Math.min(eff.cap || 9999, speciesCapOf(w))) return made;
      if (w.count >= cap) return made; // quietly: the player did not ask for this one, so the world never says it is full
      const sp = eff.spread || 6;
      const i = spawn(w, eff.kind, clampW(w, x + (k % 3) * sp - sp), clampH(w, y + (((k / 3) | 0) - 1) * sp));
      if (i < 0) return made;
      if (eff.tame) w.E.calm[i] = w.R.react.tameSec;
      // `wear: "a"`: it comes wearing the loose item that set this off (the snowman STANDS UP IN the hat, so the
      // golem can be poked for its rabbit, which is the best thirty seconds on the first screen).
      if (eff.wear && w.R.flags.pokes) {
        const st = eff.wear === 'a' ? w.rx.A.thing : w.rx.B.thing, id = st && st.def.item, g = id && w.C.GEAR[id];
        if (g) { w.E.gear[i][g.slot] = g.id; rebuildGear(w, i); }
      }
      emitAt(w, EVI.birth, i);
      made++;
    }
    return made;
  },
  // The tiles this row scoped become another terrain, and (with sec) turn back later: a walkable ice bridge.
  terrain(w, row, eff) {
    const R = w.rx, to = w.C.tid[eff.to]; // (validate-data refuses a row naming a terrain that is not there)
    const take = tileBudget(w, R.tileN);
    let n = 0;
    for (let k = 0; k < take; k++) {
      const i = R.tileList[k], was = w.terr[i];
      if (was === to) continue;
      setTerrain(w, i % w.cols, (i / w.cols) | 0, to);
      if (eff.sec > 0) w.tmr.push({ i, t: eff.sec, to: was });
      n++;
    }
    return n;
  },
  // Set the tiles alight (basic fire, below).
  ignite(w, row, eff) {
    const R = w.rx;
    const take = tileBudget(w, R.tileN);
    let n = 0;
    for (let k = 0; k < take; k++) if (ignite(w, R.tileList[k], eff.sec)) n++;
    return n;
  },
  // Cooked food: a thing with food becomes worth more, and eaters show a heart (T9's campfire row).
  cook(w, row, eff) {
    const R = w.rx, s = eff.which === 'a' ? R.A.thing : R.B.thing;
    if (s) return cookOne(w, s);
    // An `equip` row has gear on one side and a creature on the other, so NEITHER side is a thing and the chef
    // cooked nothing, ever, while the row fired and the sentence printed (found Sep 20). A cook with nothing
    // handed to them cooks what is around them instead.
    if (!w.R.flags.chefCooks || R.B.e < 0) return 0;
    const E = w.E, T = w.T, r = eff.r || w.R.react.cookR, x = E.x[R.B.e], y = E.y[R.B.e];
    let n = 0;
    for (const o of w.structs) {
      if (!o.def.food || o.cooked) continue;
      const dx = o.tx * T + 4 - x, dy = o.ty * T + 4 - y;
      if (dx * dx + dy * dy <= r * r) n += cookOne(w, o);
    }
    return n;
  },
  // Up into the air with a parachute (a launched cow, design 14 §5), using the machinery the UFO already uses.
  launch(w, row, eff) {
    const R = w.rx, E = w.E, U = w.R.ufo;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e]) continue;
      n++;
      E.alt[e] = eff.alt; E.chute[e] = eff.chute !== false; E.goalKind[e] = G_NONE; E.think[e] = 0; // (chute: false is a bounce, not a flight)
      // `away`: flung away from the other one of the two (a giant's blow), not always to the right.
      let dx = (eff.px || 0) * (eff.away && R.A.e >= 0 && R.A.e !== e && E.x[R.A.e] > E.x[e] ? -1 : 1);
      if (w.R.flags.gust) {
        if (eff.away && R.A.e < 0 && row.trig === TRIG.power) dx = (eff.px || 0) * (R.A.x > E.x[e] ? -1 : 1); // away from where a power landed
        if (w.C.S[E.kind[e]].water) dx = 0; // a fish is never blown (or punted) onto the shore: it jumps where it is
      }
      // Nobody is flung into a pond or into lava: if that is where it would come down, it goes straight up instead.
      if (dx && w.R.flags.pokes) {
        const lx = Math.max(3, Math.min(w.W - 3, E.x[e] + dx)), li = Math.floor(E.y[e] / w.T) * w.cols + Math.floor(lx / w.T), lt = w.C.TERR[w.terr[li]];
        if (lt && (lt.deep === 1 || w.terr[li] === w.C.tid.lava)) dx = 0;
      }
      setPos(w, e, Math.max(3, Math.min(w.W - 3, E.x[e] + dx)), E.y[e]);
      if (!(w.R.flags.gust && row.trig === TRIG.power && eff.chute === false)) addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop); // (a hop in the wind is not a beam: the green mark is a UFO's and a bounce pad's)
      emitAt(w, EVI.chute, e);
    }
    return n;
  },
  // The thing that met is gone (a burnt bush).
  removeThing(w, row, eff) {
    const s = eff && eff.which === 'a' ? w.rx.A.thing : w.rx.B.thing;
    if (!s || w.grid[s.ty * w.cols + s.tx] !== s) return 0;
    removeStruct(w, s.tx, s.ty);
    return 1;
  },
  // The opposite of removeThing, and the reason nothing in this world ever left anything behind: the engine
  // could destroy a thing and never make one. `id` names it, or `any` is a list and the world picks (on w.rng,
  // so a replay makes the same one). It lands on the nearest tile that can hold it and raises `placed`, so
  // whatever it comes down beside answers it. (Design team, Sep 20: five lenses asked for this verb.)
  makeThing(w, row, eff, x, y) {
    if (!w.R.flags.makeThing) return 0;
    let type = eff.id;
    if (!type && eff.any && eff.any.length) type = eff.any[Math.floor(w.rng.float() * eff.any.length) % eff.any.length];
    let made = 0; // (validate-data refuses a row naming a thing that is not there)
    for (let k = 0; k < (eff.n || 1); k++) {
      const t2 = k && eff.any && eff.any.length ? eff.any[Math.floor(w.rng.float() * eff.any.length) % eff.any.length] : type;
      const put = putThing(w, t2, Math.floor(x / w.T) + (k ? [1, -1, 0, 0, 1, -1][k % 6] : 0), Math.floor(y / w.T) + (k ? [0, 0, 1, -1, 1, -1][k % 6] : 0));
      if (put) made++;
    }
    return made;
  },
  // And the opposite of handing something over: take what a creature is wearing or holding off it and leave it
  // on the ground as an ordinary loose item. Fifteen hats could go on and not one could ever come off, which is
  // why the crow and the crown, the imp and the hat and every theft in the design bible were unwritable.
  // `slot` names one (head, body, back, hand, feet, charm, weapon), else the first thing it is wearing goes.
  dropGear(w, row, eff) {
    if (!w.R.flags.dropGear) return 0;
    const R = w.rx, E = w.E, C = w.C, T = w.T;
    const px0 = R.A.x, py0 = R.A.y; // (read once: what lands raises `placed`, in a frame of its own)
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.dead[e] || E.inside[e]) continue;
      const g = E.gear[e];
      let slot = null, id = null;
      if (eff.slot) { const v = g[eff.slot]; if (v) { slot = eff.slot; id = typeof v === 'string' ? v : eff.slot; } }
      else for (const kk of C.gearKeys) { const v = g[kk]; if (v) { slot = kk; id = typeof v === 'string' ? v : kk; break; } }
      if (!slot) continue;
      // `throw`: it lands that many px away, the way the thrower is facing (a ball thrown for a dog). It comes down
      // FIRST and leaves the hand second: a ball thrown at a pond found no tile to land on, and was gone for ever
      // (the review of Sep 21). With nowhere to land where it was thrown it lands at their feet; with nowhere there
      // either, they keep hold of it.
      // `away` on a power's row: it is carried off downwind, straight away from where the power landed (Gust), and
      // somebody standing right on that spot loses it the way they are facing.
      let lx = eff.throw ? clampW(w, E.x[e] + E.face[e] * eff.throw) : E.x[e], ly = E.y[e];
      if (eff.throw && eff.away && row.trig === TRIG.power) {
        const dx = E.x[e] - px0, dy = E.y[e] - py0, d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1) { lx = clampW(w, E.x[e] + (dx / d) * eff.throw); ly = clampH(w, E.y[e] + (dy / d) * eff.throw); }
      }
      const put = putThing(w, 'item:' + id, Math.floor(lx / T), Math.floor(ly / T)) || (eff.throw ? putThing(w, 'item:' + id, Math.floor(E.x[e] / T), Math.floor(E.y[e] / T)) : null);
      if (!put) continue;
      n++;
      g[slot] = 0;
      rebuildGear(w, e);
      addFx(w, 'block', E.x[e], E.y[e] - 9, w.R.fx.block);
    }
    return n;
  },
  // ---------- design 17's verbs ----------
  // A GIANT for a while: drawn twice the size, tagged `giant` while it lasts (fillCreature), and it pops back with a
  // puff (update.js). Children build big, pile big and want the enormous one, and until this the game had no size
  // vocabulary at all.
  size(w, row, eff) {
    if (!w.R.flags.giants) return 0;
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e] || w.C.S[E.kind[e]].ufo) continue;
      if (eff.set) { if (!(E.bigT[e] > 0)) continue; E.bigT[e] = eff.sec; } // `set`: the time it has left, exactly (Bless makes a giant small again: her undo)
      else E.bigT[e] = Math.max(E.bigT[e], eff.sec);
      n++;
    }
    return n;
  },
  // A bite out of the food thing that was met: it has one serving fewer, and grows it back as food does. A row
  // that goes on to do something with the bite puts this FIRST, so an empty thing makes the whole row a dud.
  bite(w, row, eff) {
    const s = w.rx.B.thing;
    if (!s || !s.def.food || s.food < 1) return 0;
    s.food -= 1;
    return 1;
  },
  // Knock knock: the first one at home in the thing that was poked steps outside (and goes back in when it likes).
  comeOut(w, row, eff) {
    const s = w.rx.B.thing, E = w.E;
    if (!s || !s.def.home || s.occ < 1) return 0;
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (E.inside[e] !== s.h || E.dead[e]) continue;
      E.inside[e] = 0; s.occ--; E.think[e] = 2; E.goalKind[e] = G_NONE;
      addFx(w, 'warn', E.x[e], E.y[e] - 10, w.R.fx.warn);
      emitAt(w, EVI.land, e);
      return 1;
    }
    return 0;
  },
  // Whoever was poked lays an egg, if she is somebody who lays (creatures.json `lays`).
  lay(w, row, eff) {
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (w.C.S[E.kind[e]].lays && layEgg(w, e, true)) n++; }
    return n;
  },
  // The thing that was met is that much nearer to hatching (an egg that is poked wobbles, and hurries).
  hurry(w, row, eff) {
    const s = w.rx.B.thing;
    if (!s || !s.def.hatch) return 0;
    s.cd = Math.min(s.def.hatchSec, s.cd + eff.sec);
    return 1;
  },
  // A meal from nowhere (a fish on the line, a flower crown).
  feed(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; E.hunger[e] = Math.max(0, E.hunger[e] - (eff.amount || w.R.food.eat)); }
    return R.tN;
  },
  // Made well again, with a heart.
  heal(w, row, eff) {
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k], max = w.C.S[E.kind[e]].hp; if (E.hp[e] >= max) continue; E.hp[e] = Math.min(max, E.hp[e] + (eff.hp || max)); n++; }
    return n;
  },
  // In the mood: ready to pair off as soon as it finds one of its own (the species and world caps still hold,
  // ai/decide.js B_MATE). Flowers do this.
  love(w, row, eff) {
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (E.baby[e] || !w.C.S[E.kind[e]].breed || w.C.S[E.kind[e]].humanoid) continue; E.breedCd[e] = 0; E.think[e] = 0; n++; addFx(w, 'heart', E.x[e], E.y[e] - 10, w.R.fx.heart); }
    return n;
  },
  // The ground in scope comes on a stage (a field, a meadow out of grass with `meadow: true`), and the food
  // things standing on it are full again. A watering can, a burst barrel.
  grow(w, row, eff) {
    const R = w.rx, take = tileBudget(w, R.tileN), tid = w.C.tid;
    let n = 0;
    for (let k = 0; k < take; k++) {
      const i = R.tileList[k], def = w.C.TERR[w.terr[i]], st = w.grid[i];
      if (def.growsTo !== undefined) { setTerrain(w, i % w.cols, (i / w.cols) | 0, tid[def.growsTo]); n++; }
      else if (eff.meadow && w.terr[i] === tid.grass) { setTerrain(w, i % w.cols, (i / w.cols) | 0, tid.meadow); n++; }
      if (st && st.def.food && st.food < w.R.food.max) { st.food = w.R.food.max; n++; }
    }
    return n;
  },
  // Fire in scope goes out.
  douse(w, row, eff) {
    const R = w.rx;
    let n = 0;
    for (let k = 0; k < R.tileN; k++) { const i = R.tileList[k]; if (w.burn[i] > 0) { w.burn[i] = 0; n++; addFx(w, 'block', (i % w.cols) * w.T + 4, ((i / w.cols) | 0) * w.T + 4, w.R.fx.block); } }
    return n;
  },
  // Walk to the nearest water (open water, the shallows, a well, a fountain, a trough) or the nearest campfire
  // within r, and stand there a moment. The dawn drink and the fire at dusk: no thirst meter, no penalty, just a
  // TELL that makes a pond the middle of a world (design 15 C5). Bounded: rules.react.visitCap creatures a firing.
  visit(w, row, eff) {
    const R = w.rx, E = w.E, T = w.T, r = eff.r, cap = w.R.react.visitCap;
    let n = 0;
    // In the order they were born: the spatial hash hands a crowd back in an order a loaded world does not share,
    // and the cap below would then choose different creatures in the two.
    const T2 = R.targets, m = R.tN;
    for (let a = 1; a < m; a++) { const o = T2[a]; let b = a - 1; while (b >= 0 && E.id[T2[b]] > E.id[o]) { T2[b + 1] = T2[b]; b--; } T2[b + 1] = o; }
    for (let k = 0; k < R.tN && n < cap; k++) {
      const e = R.targets[k];
      if (E.inside[e] || E.alt[e] > 0 || E.perch[e] || E.frozen[e] > 0 || E.goalKind[e] === 2 /* attacking */) continue;
      const sp = w.C.S[E.kind[e]];
      // Not the hunters (a dawn that walks wolves and lambs to the same pond is a daily cull, the fault dawn_frost
      // was thrown out for), not monsters, not what flies or swims.
      if (sp.water || sp.ufo || (eff.to === 'water' && (sp.fly || sp.enemy || sp.diet === 'carn' || sp.hunts === 'all'))) continue;
      let bx = -1, by = -1, bd = r * r;
      if (eff.to === 'fire') {
        for (let q = 0; q < w.fires.length; q++) { const f = w.fires[q], dx = f.tx * T + 4 - E.x[e], dy = f.ty * T + 4 - E.y[e], d = dx * dx + dy * dy; if (d < bd) { bd = d; bx = f.tx * T + 4 + (dx > 0 ? -7 : 7); by = f.ty * T + 6; } }
      } else {
        // (Whole numbers throughout: this runs twice a day, so the engine never optimizes it, and unoptimized code
        // puts every fraction it touches on the heap. gc-check saw half a kilobyte a step from this loop alone.)
        const ex = E.x[e] | 0, ey = E.y[e] | 0, cx = (ex / T) | 0, cy = (ey / T) | 0, rt = Math.ceil(r / T) | 0, cols = w.cols | 0;
        let ibd = (r * r) | 0;
        for (let ring = 1; ring <= rt && bx < 0; ring++) for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx += (dy === -ring || dy === ring) ? 1 : 2 * ring) {
          const tx = cx + dx, ty = cy + dy;
          if (tx < 0 || ty < 0 || tx >= cols || ty >= w.rows) continue;
          const i = ty * cols + tx, tt = w.C.TERR[w.terr[i]], st = w.grid[i];
          if (!(tt.deep === 1 || tt.shallow === 1 || (st && st.def.water))) continue;
          const px = tx * T + 4, py = ty * T + 5, ddx = px - ex, ddy = py - ey, d = ddx * ddx + ddy * ddy;
          if (d < ibd) { ibd = d; bx = px; by = py; }
        }
        bd = ibd;
      }
      if (bx < 0) continue;
      // Long enough to walk there and stand a moment (never longer than visitMax). An errand, so it still sees the
      // wolf on the way; with the switch off, the old way: its thinking held for the length of the walk.
      const forSec = Math.min(w.R.react.visitMax, Math.sqrt(bd) / Math.max(4, sp.spd * w.C.mv[0]) + (eff.hold || w.R.react.visitSec));
      if (w.R.flags.errands) errand(w, e, clampW(w, bx), clampH(w, by), forSec);
      else { goalMove(w, e, clampW(w, bx), clampH(w, by), 0); E.think[e] = forSec; }
      if (eff.calm) E.calm[e] = Math.max(E.calm[e], eff.calm); // the truce of the waterhole: nobody hunts on the way to a drink
      n++;
    }
    return n;
  },
  // What it is wearing is eaten, gone, not put down (a goat and a flower crown). `slot` names one, as dropGear.
  eatGear(w, row, eff) {
    if (!w.R.flags.dropGear) return 0;
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k], g = E.gear[e], slot = eff.slot; // (always a worn slot: nobody eats a sword)
      if (!g[slot]) continue;
      g[slot] = 0;
      rebuildGear(w, e);
      addFx(w, 'block', E.x[e], E.y[e] - 9, w.R.fx.block);
      n++;
    }
    return n;
  },
  // Pictures and sounds: these always happen, whatever the harm table said about the rest (14 §6).
  fx(w, row, eff, x, y) {
    if (eff.every && w.tick % Math.round(eff.every / w.R.tickSec)) return; // a `while` row's picture, now and then
    addFx(w, eff.id, x, y, eff.sec);
  },
  // Land on the nearest thing that can be perched on (14 §5: a bounce pad by a tower), the way a parachute does.
  perchNear(w, row, eff, x, y) {
    const R = w.rx, E = w.E, U = w.R.ufo, T = w.T;
    let best = null, bd = eff.r * eff.r;
    for (const s of w.structs) {
      if (!s.def.shoot && !(w.R.flags.perchAnything && s.def.perch)) continue;
      const dx = s.tx * T + 4 - x, dy = s.ty * T + 4 - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = s; }
    }
    // Nothing to land on: they still go up. The row used to fire, say "the bounce pad throws them up onto the
    // tower", and leave the child watching somebody walk on (found Sep 20).
    let n = 0;
    if (!best) {
      if (!w.R.flags.bounceAnyway || !eff.alt) return 0;
      for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (E.inside[e] || E.perch[e]) continue; E.alt[e] = eff.alt; E.chute[e] = !!w.C.S[E.kind[e]].humanoid; E.goalKind[e] = G_NONE; n++; }
      return n;
    }
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e] || E.perch[e]) continue;
      n++;
      E.perch[e] = best.h; E.perchT[e] = U.perchSec; E.alt[e] = 0; E.chute[e] = false; E.goalKind[e] = G_NONE;
      setPos(w, e, best.tx * T + 4, best.ty * T + 6);
      best.manned = U.perchSec;
      emitAt(w, EVI.perch, e);
      addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop);
    }
    return n;
  },
  // The thing that set this off does not happen (the UFO's beam slides off a tinfoil hat): the caller asks.
  deflect(w) { w.rx.cancel = true; return 1; },
  sound(w, row, eff, x, y) { if (EVI[eff.id] !== undefined) emit(w, EVI[eff.id], x, y, 0); },
};

// ---------- basic fire (14 §7 T9: burn, spread, extinguish, regrow) ----------
export function ignite(w, i, sec) {
  if (i < 0 || i >= w.nTiles) return false;
  const F = w.R.fire;
  const t = w.terr[i], s = w.grid[i];
  const flammable = (w.C.tags.terr0[t] & w.rxFlam0) === w.rxFlam0 && (w.C.tags.terr1[t] & w.rxFlam1) === w.rxFlam1;
  const thingFlam = !!s && ((w.C.tags.thing0[s.type] || 0) & w.rxFlam0) === w.rxFlam0 && ((w.C.tags.thing1[s.type] || 0) & w.rxFlam1) === w.rxFlam1;
  if (!flammable && !thingFlam) return false;
  if (w.burn[i] > 0) return false;
  // Design 17: a well, a fountain, a barrel or a trough does not burn, and the fire that reaches for it goes out
  // where it stands (fireTick puts the reaching tile out). A barrel by the huts is a fire break that works alone.
  if (s && s.def.water && w.R.flags.waterFights) return false;
  w.burn[i] = sec || F.burnSec;
  if (w.burnN < w.burnList.length) w.burnList[w.burnN++] = i;
  emit(w, EVI.boom, (i % w.cols) * w.T + 4, ((i / w.cols) | 0) * w.T + 4, 0);
  return true;
}
// Every step: fire burns, spreads, goes out in rain, and what burnt away grows back.
export function fireTick(w, dt) {
  const F = w.R.fire, T = w.T;
  let write = 0;
  for (let k = 0; k < w.burnN; k++) {
    const i = w.burnList[k];
    if (w.burn[i] <= 0) continue;
    w.burn[i] -= dt * (w.rainT > 0 ? F.rainOut : 1);
    if (w.burn[i] <= 0) { burnOut(w, i); continue; }
    // Hurt whoever stands in it, through the harm table (a reaction, 14 §6).
    // Spread to a neighbour, on the sim's own random stream so two worlds burn the same way.
    // Design 15 C1: some ground catches faster than others (tall grass, `catch` in terrain.json).
    const burning = w.C.TERR[w.terr[i]];
    if (w.rng.float() < F.spread * (burning.catch || 1) * dt && !(w.R.flags.fireCap && w.fireSpent >= F.maxTilesPerIgnition)) {
      const tx = i % w.cols, ty = (i / w.cols) | 0, d = Math.floor(w.rng.float() * 4);
      const nx = tx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = ty + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (inB(w, nx, ny)) {
        const j = ny * w.cols + nx, wet = w.grid[j] && w.grid[j].def.water && w.R.flags.waterFights;
        if (wet) { w.burn[i] = 0; addFx(w, 'block', tx * T + 4, ty * T + 4, w.R.fx.block); emit(w, EVI.freeze, tx * T + 4, ty * T + 4, 0); burnOut(w, i); continue; } // it reached for the well and went out
        if (ignite(w, j, 0)) w.fireSpent++;
      }
    }
    w.burnList[write++] = i;
  }
  w.burnN = write;
  if (w.burnN) burnCreatures(w, dt);
  else w.fireSpent = 0; // nothing is alight any more: the next fire starts with its whole allowance
  // Timed terrain: ice melts back to water, burnt ground grows back.
  // Design 15 C1: a field still growing comes on faster while it rains (rules.crops.rainMul).
  const wet = w.rainT > 0 && w.R.flags.crops ? w.R.crops.rainMul : 1;
  for (let k = w.tmr.length - 1; k >= 0; k--) {
    const t = w.tmr[k];
    t.t -= dt * (wet > 1 && w.C.TERR[w.terr[t.i]].growsTo !== undefined ? wet : 1);
    if (t.t > 0) continue;
    // Taken off the list BEFORE the ground changes: setTerrain may add a clock of its own (crops growing into
    // their next stage, design 15 C1), and splicing after that would have removed the new one instead.
    w.tmr.splice(k, 1);
    setTerrain(w, t.i % w.cols, (t.i / w.cols) | 0, t.to);
  }
}
function burnOut(w, i) {
  const F = w.R.fire, tx = i % w.cols, ty = (i / w.cols) | 0, s = w.grid[i];
  if (s && ((w.C.tags.thing0[s.type] || 0) & w.rxFlam0) === w.rxFlam0 && ((w.C.tags.thing1[s.type] || 0) & w.rxFlam1) === w.rxFlam1) removeStruct(w, tx, ty);
  const was = w.terr[i];
  if ((w.C.tags.terr0[was] & w.rxFlam0) === w.rxFlam0 && (w.C.tags.terr1[was] & w.rxFlam1) === w.rxFlam1) {
    // Design 15 C1: fire leaves ash, and ash flowers. What burned comes back better than it was, which is why
    // a child sets fire to things twice. (flags.ash off: the old bare dirt, growing back into what it was.)
    if (w.R.flags.ash) {
      setTerrain(w, tx, ty, w.C.tid.ash);
      w.tmr.push({ i, t: F.ashSec, to: w.C.tid.meadow });
    } else {
      setTerrain(w, tx, ty, w.C.tid.dirt);
      w.tmr.push({ i, t: F.regrowSec, to: was }); // it grows back
    }
  }
  addFx(w, 'boom', tx * w.T + 4, ty * w.T + 4, 0.3);
}
function burnCreatures(w, dt) {
  const E = w.E, T = w.T, F = w.R.fire;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (E.inside[e] || E.dead[e] || E.alt[e] > 0) continue;
    const i = Math.floor(E.y[e] / T) * w.cols + Math.floor(E.x[e] / T);
    if (i < 0 || i >= w.nTiles || w.burn[i] <= 0) continue;
    const dmg = allowed(w, e, SRC.reaction, F.dps * dt);
    if (dmg > 0) { E.hp[e] -= dmg; E.flash[e] = w.R.fx.hazardFlash; }
  }
}
