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
import { ent, spawn, goalMove, G_NONE, CLIMBED, HOPPED } from './ents.js';
import { storyRow } from './story.js';
import { log, setTerrain, removeStruct, placeStruct, inB, capOf, climeAt, isNight, asleep, wake, favourite, pass, flies, SLEEP_DAWN, SLEEP_DUSK } from './world.js';
import { rebuildGear, equipOn, GEAR_SLOTS } from './content.js';
import { allowed, SRC } from './harm.js';
import { addFx } from './fx.js';
import { emit, emitAt, EVI } from './events.js';
import { gatherAny } from './spatial.js';
import { setPos } from './spatial.js';
import { snapTile } from './ai/ufo.js';

export const TRIG = { hit: 0, enter: 1, power: 2, equip: 3, placed: 4, clock: 5, meet: 6, poke: 7, eat: 8, land: 9 }; // (design 19 A3 appended `land`)
export const TRIGS = Object.keys(TRIG);
// Design 19 F3.1 (flag handLands): a creature her hand let go of high up is owed its meeting when it comes down. The
// debt is kept in the cooldown table ("hand|" + its handle -> the latest time it can still land), because that table is
// saved (v7): a world saved while it falls plays on exactly as the one that kept running. commands.js handMeet sets it,
// handLanded pays it, save.js reads it back.
export const HAND_KEY = 'hand|';
const NO = -1;
// The verbs that only show something. Every other verb changes the world and reports how much it changed.
const COSMETIC = { fx: 1, sound: 1 };

// ---------- compiling ----------
// The rows as the sim reads them: masks and ids resolved once, grouped by trigger so a trigger walks only its own.
export function compileReactions(C) {
  const T = C.tags, byTrig = TRIGS.map(() => []);
  const rows = (C.RX || []).map((r, i) => {
    // Design 18 A3: `is` and `not` are TRAITS (what a creature is: small, sociable, named), compiled once into
    // two bit masks. They cost no tag, because every one of them is read from data the creature already carries.
    const traitsOf = (list) => { let m = 0; for (const t of list || []) m |= C.traits.bit[t]; return m; }; // (validate-data refuses an unknown one)
    const side = (s) => {
      const m = s && s.tags ? T.of(s.tags) : [0, 0];
      // wears: one named piece of gear (a row about the TOP HAT, not about hats). kinds: a short list of creature
      // kinds, for a row that is about squirrels and foxes and cats but has no tag that says so (12 tag slots left).
      return { m0: m[0], m1: m[1], id: (s && s.id) || null, kind: s && s.kind ? s.kind : null, terrain: s && s.terrain ? s.terrain : null,
        wears: (s && s.wears) || null, kinds: s && s.kinds ? new Set(s.kinds) : null, ids: s && s.ids ? new Set(s.ids) : null,
        sameKind: !!(s && s.sameKind), // (design 18 B5: the same kind as the other one of the two; a meet row's B only)
        trAll: traitsOf(s && s.is), trNone: traitsOf(s && s.not) };
    };
    const row = {
      i, id: r.id, when: r.when, a: side(r.a), b: side(r.b),
      needs: r.needs || null,
      count: null, // (design 18 A10: how many of a kind must be near by; filled below)
      globalCd: r.globalCooldownSec || 0, // one firing anywhere in the world per this many seconds
      sayEvery: r.sayEverySec || 0, sayNamed: r.sayNamed || null, sayNamedOn: r.sayNamedOn || null,
      sayKey: r.id + '|say', sayWithKey: r.sayWith ? r.sayWith + '|say' : null, // (design 19, the G3.1 review round: fire(), flag sayWith)
      also: !!r.also, // (design 19 F3.11: it fires and lets the next row have its turn too)
      scope: r.scope,
      mode: r.mode === 'while' ? 'while' : 'once',
      cooldownSec: r.cooldownSec === undefined ? null : r.cooldownSec,
      effects: r.effects,
      // What changes the world, and what only shows it (flags.honestRows, fire()): a row whose every real verb
      // turned out to change nothing has nothing to show and nothing to say.
      each: !!r.each,
      at: null, // (design 18 A6, filled below: the sites a clock row runs at)
      subst: r.effects.filter((e) => !COSMETIC[e.do]),
      cosm: r.effects.filter((e) => COSMETIC[e.do]),
      fol: r.when === 'meet' ? r.effects.find((e) => e.do === 'follow') || null : null, // (design 19, the second review of F3.11: flag errandPassesBy, fire())
      // (design 19, the G4b review round: a row that hops a swimmer up AND sends it to the water, fish_flop_home and fish_flop_lawn,
      // takes it home only as far as a hop can: flag flopReach, the launch and visit verbs)
      home: r.effects.some((e) => e.do === 'launch') && r.effects.some((e) => e.do === 'visit' && e.to === 'water'),
      folOn: null, // (and, for a follow `on` one side, that side's key in the scratch, 'A' or 'B': filled below)
      say: r.say || null,
      trig: TRIG[r.when],
    };
    if (row.fol && row.fol.on) row.folOn = row.fol.on.toUpperCase();
    // The three pictures the row's own story record carries (a + b -> what came of it), resolved once.
    row.a.pic = picOf(C, r.pic && r.pic[0]);
    row.b.pic = picOf(C, r.pic && r.pic[1]);
    row.res = picOf(C, r.pic && r.pic[2]);
    // Design 19, the review before deploy line 2 (flag `picWho`): "who:a" and "who:b" are the picture of the one the row
    // is about, whoever it is, read when it fires (whoPic). A row about many kinds had to show one of them: the sheep on
    // the shade row for the deer that were 109 of its 132 walks in her world, the hen for the ducks and geese that were 38
    // of 57 of hers, the rabbit for the goose, the otter and the duck that sat with the capybara, and her named cat on the
    // snow got "Button does not like the snow." beside a sheep. (0: the picture as written; 1: A's; 2: B's.)
    row.whoA = whoOf(r.pic && r.pic[0]); row.whoB = whoOf(r.pic && r.pic[1]); row.whoR = whoOf(r.pic && r.pic[2]);
    // Design 18 A1: where a `visit` sends somebody, worked out once. `to` may be "water" or "fire" as it always
    // could, and now a list of terrains, a terrain TAG, a list of things or a thing TAG. Resolved here so the
    // walk itself compares numbers (it runs twice a day, so the engine never optimizes it, and unoptimized code
    // boxes every fraction it touches).
    // (Design 19, the review of F3.9: a `perchNear` may name what it goes up the same way, `to: {thing: [..]}` or
    // `{thingTag}`: the cat goes up a TREE, not a well; and a visit `to: "fire"` knows a fire by its `fire` tag, so the
    // one her hand put down, a torch as much as a campfire, is somewhere it goes: flags perchClimbs and visitPlaced.)
    // (Design 19 A5: a `migrate` names where the herd goes the same way a visit does, and is compiled the same.)
    for (const eff of r.effects) if ((eff.do === 'visit' || eff.do === 'perchNear' || eff.do === 'migrate') && eff.to && typeof eff.to === 'object') {
      if (eff.to.terrain) eff.vTerr = new Set(eff.to.terrain.map((id) => C.tid[id]));
      if (eff.to.terrainTag) { const m = T.of([eff.to.terrainTag]); eff.vT0 = m[0]; eff.vT1 = m[1]; }
      if (eff.to.thing) eff.vThing = new Set(eff.to.thing);
      if (eff.to.thingTag) { const m = T.of([eff.to.thingTag]); eff.vH0 = m[0]; eff.vH1 = m[1]; }
    } else if (eff.do === 'visit' && eff.to === 'fire') { const m = T.of(['fire']); eff.vH0 = m[0]; eff.vH1 = m[1]; }
    // The masks a scope needs, worked out once: the terrain a fill follows, and the creatures it may take.
    const sc = row.scope;
    if (sc.terrain) { const m = T.of([sc.terrain]); sc.m0 = m[0]; sc.m1 = m[1]; }
    if (sc.only && sc.only.tags) { const m = T.of(sc.only.tags); sc.onlyM0 = m[0]; sc.onlyM1 = m[1]; }
    if (sc.only) { sc.onlyAll = traitsOf(sc.only.is); sc.onlyNone = traitsOf(sc.only.not); } // (A3: a scope may take only the little ones)
    // Design 18 A10: a row may ask for company — three frogs, three wolves, six villagers — worked out here once.
    // Design 19 A3: the ground under the point, as a terrain id or a tag (compiled once).
    if (r.needs && r.needs.ground !== undefined) { const g = r.needs.ground; row.ground = C.tid[g] !== undefined ? { tid: C.tid[g], m0: 0, m1: 0 } : { tid: -1, m0: T.of([g])[0], m1: T.of([g])[1] }; }
    if (r.needs && r.needs.count) {
      const c = r.needs.count, m = c.tags ? T.of(c.tags) : [0, 0];
      row.count = { kind: c.kind, m0: m[0], m1: m[1], all: traitsOf(c.is), none: traitsOf(c.not), r: c.r, min: c.min || 0, max: c.max || -1 }; // (design 19 0.3: max -1 is none; the validator refuses a max under 1)
    }
    if (sc.only && sc.only.ids) sc.onlyIds = new Set(sc.only.ids); // (A6: and a scope of THINGS names them by id)
    // Design 18 A6: a clock row may run once per SITE — every third flower, a patch of meadow — instead of once
    // at the middle of the map. The ids and tags it names, resolved here, so the walk itself compares numbers.
    if (r.at) {
      // (design 19, his calls of 30 Sep: `village: false` leaves the village's paint out of the places, flag atVillage, atSites)
      row.at = { max: Math.max(1, r.at.max | 0), ids: r.at.things && r.at.things.ids ? new Set(r.at.things.ids) : null, terr: r.at.terrain ? new Set(r.at.terrain.map((id) => C.tid[id])) : null, m0: 0, m1: 0, noVillage: r.at.village === false };
      if (r.at.things && r.at.things.tags) { const m = T.of(r.at.things.tags); row.at.m0 = m[0]; row.at.m1 = m[1]; }
    } else row.at = null;
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
  if (!ref || ref === 'who:a' || ref === 'who:b') return -1; // (who is about: whoPic, when the row fires)
  const [kind, id] = ref.split(':');
  if (kind === 'creature') return C.kid[id] === undefined ? -1 : C.kid[id];
  const key = kind === 'gear' || kind === 'weapon' ? 'thing:item:' + id : kind === 'icon' ? id : ref;
  return C.iconOf[key] === undefined ? -1 : C.iconOf[key];
}

const whoOf = (ref) => (ref === 'who:a' ? 1 : ref === 'who:b' ? 2 : 0);
// The picture of the one a firing row is about (1: A, 2: B): its kind's own, as the story record's actors carry it
// (story.js). Nobody there (a row about the ground or a thing on that side): no picture.
function whoPic(w, who, fallback) {
  if (!who || !w.R.flags.picWho) return fallback;
  const e = who === 1 ? w.rx.A.e : w.rx.B.e;
  return e >= 0 ? w.C.kid[w.E.kind[e]] : -1;
}

// Design 19, F3.7 his call (flag `slideStops`): whether a slide that says `stops` would go where it cannot (`launch`).
// His 26 Sep: "ducks and geese should slide like penguins", so they went from the skid into `ice_slide` (30 px, always to
// the right, design 18's), which asked nothing of the way: her ducks and geese penned on ice slid out over her fence on 7
// of 9 slides (her world, 5 min, seeds 7 11 1 2, `dev/f37-skid.mjs --scen pen --penkinds duck,goose`), where the skid
// had kept them in. The skid's fence walk (skidStops) alone was not enough: a shut skid is a hop on the spot, and a shut
// slide as one was a 1 px hop with a star, 60 to 104 a minute in that pen, 97 in 100 of them on the spot, the world
// saying "A duck slid across the ice on its tummy." over a duck that had not moved. A slide goes along the ice or not at
// all: if it would come down in the pond or in lava (the guard in `launch` makes that a hop on the spot), or any tile it
// would cross or come down on is shut to a step (pass: a fence, a wall, a house, rock), it does not happen: no hop, no
// star, no words (the row changed nothing, flags.honestRows). Only a row that says `stops` (the revised `ice_slide`, since
// 19; it goes to the right, with no `across` or `away`); the design 18 row and every other slide do not. Allocates nothing.
// The review of 16eedf7 (flag `slideEdge`): and the east edge of the world shuts it as her fence does. The slide's 30 px
// were cut back to the edge and nothing was asked when that left it in its own column: a duck walking down ice in the last
// two columns went up 36 times in 39 by 0 to 5 px, with a star and "A duck slid across the ice on its tummy." over a duck
// that had not moved (the review's probe, an S world, seeds 1 to 3). A slide the edge would cut short does not happen.
function slideShut(w, e, eff) {
  const E = w.E, T = w.T, dx = eff.px || 0;
  if (!(dx > 0) || eff.across || eff.away || (w.R.flags.gust && w.C.S[E.kind[e]].water)) return false; // (to the right only; a fish jumps where it is)
  if (w.R.flags.slideEdge && E.x[e] + dx > w.W - 3) return true; // (the edge of the world: setPos keeps everyone 3 px inside it)
  const x1 = Math.max(3, Math.min(w.W - 3, E.x[e] + dx)), li = Math.floor(E.y[e] / T) * w.cols + Math.floor(x1 / T), lt = w.C.TERR[w.terr[li]];
  if (w.R.flags.pokes && lt && (lt.deep === 1 || w.terr[li] === w.C.tid.lava)) return true;
  const c1 = Math.floor(x1 / T), alt = E.alt[e];
  let shut = false;
  E.alt[e] = 0; // (asked with its feet on the ground: pass() lets anything in the air through)
  for (let c = Math.floor(E.x[e] / T) + 1; c <= c1; c++) if (!pass(w, e, c * T + (T >> 1), E.y[e])) { shut = true; break; }
  E.alt[e] = alt;
  return shut;
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
    handUntil: -1, // design 19 F3.1: the latest time a creature her hand let go of may still be coming down (commands.js handLanded)
    chain: [], // the rows that have fired in this chain, by index
    tiles: 0, tileTick: -1, // tile effects spent this tick
    targets: new Int32Array(256), tN: 0, // the creatures an effect acts on
    met: new Int32Array(24), metD: new Float64Array(24), // who a creature has noticed, nearest first (reactMeet)
    tileList: new Int32Array(256), tileN: 0, // the tiles it acts on
    fill: new Int32Array(1024), seen: new Int32Array(0), seenStamp: 0, // flood fill scratch
    A: side(), B: side(),
    lastTile: new Int32Array(w.R.flags.liveThings === false ? 0 : w.cap).fill(-1), // the tile each creature stood on last step (scratch; rebuilt on load)
    // Design 18 A1: FIRST BEDTIME WINS. Every clock row fires, so one creature can match three of them. While a
    // clock event is being run, whoever an earlier row has already sent somewhere is stamped here, and `visit`
    // and `perchNear` step over them. File order is therefore the priority: the named one's favourite place
    // first, then pets, then herds, then the rest. Scratch only: never a creature field, never saved, never hashed.
    claimed: new Int32Array(0), claimStamp: 0, claimNext: 0, // (sized at the first clock event: the store is empty now)
    n: 0, fired: {}, // reactions fired, and how many of each row: the scenes print it (tools/parity.mjs)
    did: {}, duds: {}, // per row: how much its verbs really changed, and how often it matched and changed nothing
    // A reaction raised from inside a verb (a thing a row makes lands beside something that answers it) runs in
    // the same scratch. One frame per depth keeps what the outer row was about, so its later verbs and its
    // sentence are still about the right two things (putThing).
    frames: Array.from({ length: w.R.react.maxDepth + 1 }, () => ({ A: side(), B: side(), targets: new Int32Array(256), tN: 0, tileList: new Int32Array(256), tileN: 0 })),
    landWho: new Int32Array(32), // design 19 A3: who stands on or beside a tile the land just changed (reactLand), scratch
    powA: side(), powB: side(), // design 19 G5.5: the power a row at places answered, kept across its places (powerSites)
    line: new Int32Array(256), lineD: new Int32Array(256), // design 19 A5: who goes on a migration, the leader first and then the line behind it, and how far each stood from the leader (migrate), scratch
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
  if (w.R.flags.sleeps) wake(w, t, false); // design 18 A5: a blow wakes whoever it lands on, before any row reads them
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
  if (!w.R.flags.pokes || e < 0 || w.E.dead[e] || w.E.inside[e]) return false;
  reset(R.A); R.A.id = 'poke';
  fillCreature(w, R.B, e);
  // Design 18 pack 5: the rows are read FIRST and the waking comes after, so a poke row may ask whether it was
  // asleep when her finger landed (`is: [asleep]`, the gargoyle on the roof opening its eyes). `stateTraits`
  // reads the world as it is at the moment a row is matched, not a snapshot taken earlier, so waking first made
  // `asleep` unaskable by the one trigger that most wants to ask it. Her finger still wakes it either way, and
  // `launch` wakes whoever it throws in any case (nobody stays asleep through being thrown in the air).
  // (the "are there any poke rows at all" early-out that used to stand here is gone with the reorder: it was a
  // branch only a world with design 17 switched off could take, so no scene could ever walk it, and `run` over
  // an empty trigger list is already nothing.)
  const n = run(w, TRIG.poke, w.E.x[e], w.E.y[e]);
  if (w.R.flags.sleeps) wake(w, e, false);
  return n;
}
export function reactPokeThing(w, s) {
  const R = w.rx;
  if (!R.R.idx[TRIG.poke].n || !w.R.flags.pokes || !s) return false;
  reset(R.A); R.A.id = 'poke';
  fillThing(w, R.B, s);
  return run(w, TRIG.poke, s.tx * w.T + 4, s.ty * w.T + 4);
}
// The ground changed by itself (design 19 A3, LAND-ENGINE §4): raised ONLY by the land's pass, right after it changes a
// tile (her brush and a row's terrain verb raise nothing). A is the NEW ground (its terrain and tags, and the rule's
// id, so a row can name one rule or anything that makes swamp); B is first the tile itself, then each creature on it
// or beside it (12 px), in the order they were born and never the spatial hash's (a loaded world picks the same).
export function reactLand(w, ruleId, tile) {
  const R = w.rx;
  if (!R.R.idx[TRIG.land].n) return; // no land rows: one read
  const T = w.T, x = (tile % w.cols) * T + 4, y = ((tile / w.cols) | 0) * T + 4;
  const setA = () => { reset(R.A); fillTile(w, R.A, tile, null); R.A.id = ruleId; };
  setA(); fillTile(w, R.B, tile, w.grid[tile]); run(w, TRIG.land, x, y);
  const n = gatherAny(w, x, y, 12), near = w.near, E = w.E, who = R.landWho;
  let m = 0;
  for (let k = 0; k < n && m < who.length; k++) { const o = near[k]; if (!E.dead[o] && !E.inside[o]) who[m++] = o; }
  // in birth order (a handful at most: an insertion sort, allocation free)
  for (let a = 1; a < m; a++) { const o = who[a]; let b = a - 1; while (b >= 0 && E.id[who[b]] > E.id[o]) { who[b + 1] = who[b]; b--; } who[b + 1] = o; }
  const cap = Math.min(m, w.R.react.eachCap);
  for (let k = 0; k < cap; k++) { const o = who[k]; if (E.dead[o] || E.inside[o]) continue; setA(); fillCreature(w, R.B, o); run(w, TRIG.land, E.x[o], E.y[o]); }
}
// Something was EATEN (design 18 A8): a serving from a food thing, a tile of grass, a ripe field picked. A is
// the eater and B is what it ate, which is a thing or the ground. Never raised for PREY: what a hunter catches
// is a kill, and the rows about that are the ones design 15 already wrote.
export function reactEat(w, e, tile, st) {
  const R = w.rx;
  if (!w.R.flags.eats || !R.R.idx[TRIG.eat].n || w.E.dead[e] || w.E.inside[e]) return;
  fillCreature(w, R.A, e);
  if (st) fillThing(w, R.B, st); else fillTile(w, R.B, tile, w.grid[tile]);
  run(w, TRIG.eat, w.E.x[e], w.E.y[e]);
}
// Design 19 G7.6 (flag `eatsCatch`, raised by combat.js die): and what a hunter CATCHES is eaten too, the meal its kill gives it.
// A is the hunter and B the one it caught (dead by now; its slot holds it until the step's sweep). The design's "the hunt happens
// in the engine already; the row is the three pictures and the sentence": a row about the pair is the picture of the catch, a
// heart over the heron and "A heron caught a frog.". Design 18 A8 raised nothing for prey, and with the flag off it still does not.
export function reactCatch(w, e, prey) {
  const R = w.rx;
  if (!w.R.flags.eats || !R.R.idx[TRIG.eat].n || w.E.dead[e] || w.E.inside[e]) return;
  fillCreature(w, R.A, e);
  fillCreature(w, R.B, prey);
  run(w, TRIG.eat, w.E.x[e], w.E.y[e]);
}

// A hen lays an egg beside her (design 17): by herself now and then (update.js), or because she was poked (the
// `lay` verb). Not if she is hungry or frightened or in the air, not with an egg already within a few tiles, and
// not past the world's egg cap. The egg remembers whose it is, and her name if she has one.
// Design 19 G4 (flag `worldLays`): a row that lays on the ground it names lays as she does by herself (`byRow`, the `lay`
// verb): not while there are already as many of her kind as the world lets hatch, and not with that egg within a few
// tiles. Her finger (a poke) lays past them. WATER-LIFE P1 and P2 were written on exactly that ("layEgg does
// the rest: at most 6 eggs of a kind, none within 3 tiles, fewer than 8 of the kind alive"), and the verb passed `poked`
// for every row: her untouched world (seed 7, 30 min) grew 25 fish eggs from `fish_roe`, 13 of them on the grass (the
// search for a free tile beside the last one), and said "This egg is waiting." 21 times for fish alone. Not the hunger:
// the row's own trigger is why she lays (a hen that has just eaten, a fish come to the shallows).
export function layEgg(w, e, poked, byRow) {
  const E = w.E, R = w.R, T = w.T;
  if (!R.flags.eggs || E.dead[e] || E.inside[e] || E.alt[e] > 0 || E.baby[e]) return false;
  if (!poked && (E.hunger[e] > R.needs.hungry || E.beh[e] === 1 /* fleeing */)) return false;
  const limits = !poked || (!!byRow && R.flags.worldLays);
  // The allowance is counted for HER kind (duck eggs waiting for room used to fill the whole world's six, and the
  // hens then never laid again and died out: the review of Sep 21), and she does not lay by herself at all while
  // there are already as many of her kind as the world lets hatch.
  const mine = w.C.kid[E.kind[e]] + 1;
  // Design 19 G1.6 (WATER-LIFE E6): a species may lay a thing of its own (`lays: "frogspawn"`), which hatches into
  // what THAT thing says (a tadpole), not into its layer. Counted by its type; an egg is counted by whose it is.
  const lay = w.R.flags.ownEggs && typeof w.C.S[E.kind[e]].lays === 'string' ? w.C.S[E.kind[e]].lays : 'egg', own = lay === 'egg' ? mine : 0;
  let eggs = 0;
  for (let k = 0; k < w.structs.length; k++) { const s = w.structs[k]; if (s.type === lay && (s.who || 0) === own) eggs++; }
  if (eggs >= R.react.eggCap) return false;
  if (limits && w.kindCount[mine - 1] >= Math.min(R.react.layCap, capOf(w, E.kind[e]))) return false;
  const tx = Math.floor(E.x[e] / T), ty = Math.floor(E.y[e] / T), near = R.react.layNear;
  if (limits) for (let dy = -near; dy <= near; dy++) for (let dx = -near; dx <= near; dx++) { const x = tx + dx, y = ty + dy; if (inB(w, x, y) && w.grid[y * w.cols + x] && w.grid[y * w.cols + x].type === lay) return false; }
  // Design 19 G4 (flag `spawnInWater`): a thing of her own that hatches a SWIMMER (frogspawn, a tadpole) is laid in the
  // water she is standing in, on that tile, or not at all. A frog lays by herself wherever she stands, and the tadpole
  // out of spawn on the lawn dried where it hatched (her world with a lily pond painted, seed 7, 30 min: 2 of 3 spawn
  // on the grass, 1 tadpole dried). Water here is ground a swimmer lives on (deep or shallow) that can hold a thing.
  // And a swimmer's own egg the same (the G5.8 + G5.9 review round, flag `roeInWater`; an egg hatches into whoever laid it). A
  // fish's egg is a plain `egg`, which this passed by, so when the tile under the fish held a thing putThing laid the egg on the
  // nearest free tile: in her first world a little fish came onto the shallows where bones lay and its egg went onto the grass two
  // tiles off, with "Fish eggs in the shallows." (seed 1, 184 s). Untouched, 30 min, seeds 1 to 6, as G4 left it: 2, 0, 1, 3, 1
  // and 1 fish eggs off the water.
  const ownSwims = lay === 'egg' && R.flags.roeInWater;
  if ((lay !== 'egg' && R.flags.spawnInWater) || ownSwims) {
    const hk = ownSwims ? E.kind[e] : w.C.BLD[lay].hatch, i = ty * w.cols + tx, t = inB(w, tx, ty) ? w.terr[i] : -1, tt = t >= 0 ? w.C.TERR[t] : null;
    if (typeof hk === 'string' && w.C.S[hk] && w.C.S[hk].water && (!tt || !(tt.deep === 1 || tt.shallow === 1) || t === w.C.tid.water || w.grid[i])) return false;
  }
  const put = putThing(w, lay, tx, ty);
  if (!put) return false;
  put.who = own;
  if (E.named[e]) put.name = E.name[e];
  addFx(w, 'heart', E.x[e], E.y[e] - 8, R.fx.heart);
  emitAt(w, EVI.land, e);
  if (!poked) { log(w, 'log.laid', { a: { name: E.name[e], kind: E.kind[e] } }); storyRow(w, -1, E.x[e], E.y[e], e, -1, w.C.kid[E.kind[e]], w.C.iconOf.heart, w.C.iconOf['thing:' + lay], w.lastLog); }
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
  // This firing's mark: whoever an earlier row sends somewhere is claimed, and no later row sends them anywhere
  // else. The store is empty when the scratch is made and grows as creatures are born, so it is sized here,
  // twice a day, and never in the step.
  // (claimNext never goes back, so dusk's marks are not still standing at dawn; claimStamp is 0 between events.)
  if (w.R.flags.visitAny) { if (R.claimed.length < w.cap) R.claimed = new Int32Array(w.cap); R.claimStamp = ++R.claimNext; }
  const rows = R.R.byTrig[TRIG.clock];
  for (let i = 0; i < rows.length; i++) {
    if (R.depth >= w.R.react.maxDepth) return;
    const row = rows[i];
    reset(R.A); R.A.id = what; reset(R.B); // a row that fired may have raised a chain that overwrote A and B
    if (!matches(w, row, R.A, row.a) || !matches(w, row, R.B, row.b)) continue;
    // A row that happens AT places asks what it needs at each of them, not once at the middle of the map: three
    // villagers at THIS well, not three anywhere (design 18 A6 and A10 together).
    const sited = w.R.flags.thingScope && row.at;
    if (!sited && !needsOk(w, row, x, y)) continue;
    if (R.chain.indexOf(row.i) >= 0) continue; // a row fires once in a chain
    const key = row.id + '|' + handleOf(w, R.A) + '|' + handleOf(w, R.B);
    if (row.mode === 'once' && onCooldown(w, row, key)) continue;
    // Once anywhere per globalCooldownSec, as run() has always kept it for every other trigger. A clock row never
    // looked, so the first clock row to carry one (design 18 E4's festival, gcd 900 so a party hat stays special)
    // would have been a party every dusk, with nothing to say the key was being ignored.
    if (row.globalCd && onCooldown(w, row, row.id + '|*')) continue;
    // Design 18 A6: a row may happen AT places instead of at the middle of the map — every third flower, a
    // patch of meadow — and then it fires once for each of them, with the picture and the sound and whatever it
    // makes happening there. Different places each day: the stride is walked from an offset that moves on with
    // the day, so it is not the same three flowers every night.
    const fired = sited ? atSites(w, row, key) : fire(w, row, key, x, y);
    if (sited) { reset(R.A); R.A.id = what; reset(R.B); }
    if (fired && row.globalCd) R.cool.set(row.id + '|*', w.time + row.globalCd);
  }
  R.claimStamp = 0; // the clock event is over: outside it nobody is claimed
}

// The places a clock row happens at (design 18 A6). Things are walked in the order they were put down and
// terrain in tile order, both in a fixed stride, so a loaded world picks exactly the same places as the one
// that kept running. Nothing is allocated: the candidates are counted in one walk and taken in a second.
// Whether it happened anywhere (a global cooldown is kept per clock event, not per place).
function atSites(w, row, key) {
  const R = w.rx, at = row.at, T = w.T;
  const day = Math.floor(w.time / w.daySec);
  let fired = false;
  if (at.terr) { // a strided walk of the map, never more than tileReads reads
    const reads = Math.min(w.nTiles, w.R.react.siteReads);
    const step = Math.max(1, Math.floor(w.nTiles / reads));
    // Design 19 (the D1 review, 25 Sep): the walk STARTS at a tile that moves on with the day. It always started at
    // tile 0, so on a map of more than siteReads tiles only every step-th tile could ever be a place: on L (128 by
    // 128, step 4) the columns 1, 2 and 3 of every four, and a three by three swamp at x 21 to 23 never brought a
    // frog. S (step 1) is untouched (flag `strideMoves`).
    // And the pick among the tiles a start finds moves on by that start's own turns, not by the day (the fix round's
    // review, 25 Sep): with both taken from the day, a start r only came round on days r, r + step, r + 2 step, so its
    // pick only ever landed on every gcd(step, every)th of its tiles. Two strips of reeds 400 px apart on M, both on
    // odd columns: one brought frogs and the other none in forty days (L and XL the same, fixture
    // every-patch-has-its-turn). Counted in the start's turns ((day - i0) / step, a whole number: law 11), its pick
    // runs through all its tiles, so with at.max 1 every matching tile is offered once in `step` times `every` days.
    const stride = w.R.flags.strideMoves, i0 = stride ? day % step : 0;
    // Design 19, the G5.8 + G5.9 review round (flag `climeSites`): a row that needs heat or cold (A4's `hot`, `cold`)
    // finds its places among the warm (or cold) tiles of its ground, as it finds them among its ground's kind. The warmth
    // was asked only AFTER the pick, so a first light asked one tile, and a cold one was that morning gone: in her first
    // world 7 of her village's path tiles are warm by its campfire, and a sandbox she painted south of the village (tiles
    // that sort after them) took the picks, one a morning, and no lizard came in the half hour (seeds 7, 11 and 1; an
    // eight tile stone path the same). The same for a seal on cold sand and a camel on hot sand. Twice a day, and only a
    // tile of the row's ground is asked (climeAt: 49 reads); nothing is allocated.
    const nd = row.needs, clime = w.R.flags.climeSites && nd !== null && (nd.hot !== undefined || nd.cold !== undefined);
    // Design 19, his calls of 30 Sep (flag `atVillage`): a row whose `at` says `village: false` finds its places outside the village's
    // paint (w.claim's IN bit, 1: decide.js onClaim reads it the same way), as the land pass keeps out of it by law. The moles came up
    // in her village's trampled yard, her first bare ground: 15 and 13 of her 23 and 21 in the half hour ("im not sure why moles only
    // pop up in the village. we can make it work."). Asked in both walks, so the count and the stride are over the same tiles.
    const out = at.noVillage && w.R.flags.atVillage;
    let n = 0;
    for (let i = i0; i < w.nTiles; i += step) if (at.terr.has(w.terr[i]) && (!clime || climeOk(w, nd, i)) && !(out && (w.claim[i] & 1))) n++;
    if (!n) return false;
    const want = Math.min(at.max, n), every = Math.max(1, Math.floor(n / want));
    const off = (stride ? (day - i0) / step : day) % every;
    let seen = 0, took = 0;
    for (let i = i0; i < w.nTiles && took < want; i += step) {
      if (!at.terr.has(w.terr[i]) || (clime && !climeOk(w, nd, i)) || (out && (w.claim[i] & 1))) continue;
      if ((seen++ + off) % every) continue;
      const px = (i % w.cols) * T + 4, py = ((i / w.cols) | 0) * T + 4;
      reset(R.A); R.A.id = row.a.id; reset(R.B);
      if (!needsOk(w, row, px, py)) continue; // what it needs, asked HERE
      took++;
      if (fire(w, row, key, px, py)) fired = true;
    }
    return fired;
  }
  let n = 0;
  for (let k = 0; k < w.structs.length; k++) if (atThingOk(w, at, w.structs[k])) n++;
  if (!n) return false;
  const want = Math.min(at.max, n), every = Math.max(1, Math.floor(n / want)), off = day % every;
  let seen = 0, took = 0;
  for (let k = 0; k < w.structs.length && took < want; k++) {
    const st = w.structs[k];
    if (!atThingOk(w, at, st)) continue;
    if ((seen++ + off) % every) continue;
    reset(R.A); R.A.id = row.a.id; reset(R.B);
    if (!needsOk(w, row, st.tx * T + 4, st.ty * T + 4)) continue; // what it needs, asked HERE
    took++;
    if (fire(w, row, key, st.tx * T + 4, st.ty * T + 4)) fired = true;
  }
  return fired;
}
// Design 19 G5.5 (flag `powerAt`, run() above): the rain is an instant power and has no place of its own, so its trigger is
// raised at the middle of the map (powers.js useInstant), where a row about the ground only ever met the one tile there: the
// worms that come up out of the dirt and the mud after rain, and the snails out of the mud, came up on her lawn or never
// (CIRCLE-OF-LIFE §4's "power rain on dirt|mud"). A row that says where (`at`) happens at its places, as a clock row does
// (atSites: the strided walk that moves on with the day), and A and B are the power's again after it, so an `also` row's
// places leave the rows after it the rain they matched on (atSites clears both at each place). Allocates nothing.
function powerSites(w, row, key) {
  const R = w.rx;
  copySide(R.powA, R.A); copySide(R.powB, R.B);
  const fired = atSites(w, row, key);
  copySide(R.A, R.powA); copySide(R.B, R.powB);
  return fired;
}
// (flag `climeSites`, atSites above) Is this tile as hot, or as cold, as the row needs? needsOk's own two clauses, asked of
// a tile instead of a point.
function climeOk(w, n, i) {
  const c = climeAt(w, i);
  return (n.hot === undefined || (c > 0) === n.hot) && (n.cold === undefined || (c < 0) === n.cold);
}
function atThingOk(w, at, st) {
  if (at.ids) return at.ids.has(st.type);
  return ((w.C.tags.thing0[st.type] || 0) & at.m0) === at.m0 && ((w.C.tags.thing1[st.type] || 0) & at.m1) === at.m1;
}

// Two creatures near each other, on the thinking one's own think tick and nowhere else (design team, Sep 20).
// A is the one thinking, B is who it noticed. Bounded three ways so a crowd cannot cost the step: it walks only
// the spatial hash within rules.react.meetR, it stops at the FIRST row that fires, and it costs one branch when
// the game holds no meet rows at all. Deterministic: think ticks are staggered on a fixed schedule and the hash
// is walked in its own fixed order, so a replay meets the same creature.
export function reactMeet(w, e) {
  const R = w.rx, idx = R.R.idx[TRIG.meet];
  if (!idx.n || !w.R.flags.meet) return false;
  const E = w.E;
  if (E.inside[e] || E.dead[e]) return false;
  if (!meetsAny(w, e, idx)) return false; // (never walk the hash for nobody)
  const m = metNear(w, e, false), list = R.met;
  if (!m) return false;
  fillCreature(w, R.A, e); // once: a fire returns immediately, so nothing can overwrite it mid loop
  for (let k = 0; k < m; k++) {
    const o = list[k];
    fillCreature(w, R.B, o);
    if (run(w, TRIG.meet, E.x[o], E.y[o])) return true; // one meeting a think, so a crowd is not a cascade
  }
  return false;
}
// Is any meet row about this creature as A? Its kind, a tag its species carries, a giant, or something it has on.
function meetsAny(w, e, idx) {
  const R = w.rx, E = w.E;
  if (idx.aAny || idx.aKinds.has(E.kind[e])) return true;
  // no meet row names this kind: is one about a tag its species carries, or about giants?
  if (!w.R.flags.pokes) return false;
  let mine = idx.aKindOk[w.C.kid[E.kind[e]]] === 1 || (idx.aGiant && E.bigT[e] > 0);
  if (!mine && idx.aGear && hasOn(w, e)) { // it has something on: is any meet row about that very thing?
    fillCreature(w, R.A, e);
    const rows = R.R.byTrig[TRIG.meet];
    for (let k = 0; k < rows.length && !mine; k++) { const A = rows[k].a; if (A.wears ? wearing(w, e, A.wears) : (A.m0 || A.m1) && (R.A.m0 & A.m0) === A.m0 && (R.A.m1 & A.m1) === A.m1) mine = true; }
  }
  return mine;
}
// Who stands within rules.react.meetR of e, nearest first (ties by id), into R.met; returns how many. `noticing`: only
// those that would notice somebody on a think of their own just now (design 19 F3.1, reactMetBy): on the ground,
// awake, not frozen, not perched, not a UFO.
function metNear(w, e, noticing) {
  const R = w.rx, E = w.E;
  const n = gatherAny(w, E.x[e], E.y[e], w.R.react.meetR), near = w.near;
  const list = R.met, d2 = R.metD;
  let m = 0;
  for (let k = 0; k < n && m < list.length; k++) {
    const o = near[k];
    if (o === e || E.inside[o] || E.dead[o]) continue;
    if (noticing && (E.alt[o] > 0 || E.perch[o] || E.frozen[o] > 0 || (w.R.flags.sleeps && asleep(w, o)) || w.C.S[E.kind[o]].ufo)) continue;
    const dx = E.x[o] - E.x[e], dy = E.y[o] - E.y[e], d = dx * dx + dy * dy;
    // The spatial hash hands back whole CELLS (16 px), and its own comment says callers still test the distance.
    // This one did not, so creatures "met" from up to three cells off: a goat ate a flower crown from five tiles
    // away (the review of Sep 21).
    if (w.R.flags.exactReach && d > w.R.react.meetR * w.R.react.meetR) continue;
    let at = m;
    while (at > 0 && (d2[at - 1] > d || (d2[at - 1] === d && E.id[list[at - 1]] > E.id[o]))) { list[at] = list[at - 1]; d2[at] = d2[at - 1]; at--; }
    list[at] = o; d2[at] = d; m++;
  }
  return m;
}
// Design 19 F3.1 (flag handMeetsBack): the other half of her gesture. What her hand put down met nobody (reactMeet
// above, with it as A), so whoever is standing beside it meets IT, nearest first, as each would on a think of its own,
// and the first meeting that happens is the one (one meeting for one gesture, as a think has one). A meeting was only
// ever the creature's own, so a grown sheep she put down beside a hen waited on the hen's next think and on the world's
// 20 s for `hen_and_the_flock`: in her opening world, a grown sheep put 10 px from a hen once a minute by day, the hen
// went with it inside a minute 1 and 3 times in 19 (seeds 7 and 11, the review of ad1d5c2), a yard bird 4 and 7 in 15
// (dev/f3-flock.mjs --sheep); with this, 15 of 15 inside 0.1 s. Only commands.js calls this, with byHand set.
export function reactMetBy(w, e) {
  const R = w.rx, idx = R.R.idx[TRIG.meet];
  if (!idx.n || !w.R.flags.meet) return false;
  const E = w.E;
  if (E.inside[e] || E.dead[e]) return false;
  const m = metNear(w, e, true), list = R.met;
  for (let k = 0; k < m; k++) {
    const o = list[k];
    if (E.dead[o] || E.inside[o] || !meetsAny(w, o, idx)) continue;
    fillCreature(w, R.A, o); fillCreature(w, R.B, e);
    if (run(w, TRIG.meet, E.x[e], E.y[e])) return true;
  }
  return false;
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
    if (!matches(w, row, R.B, row.b) || !needsOk(w, row, E.x[e], E.y[e])) continue;
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
  // Design 18 B5: the same kind as the other one of the two. A duckling walks behind ITS mother, never behind
  // the hen standing next to her. One comparison; `scope.only.sameKind` says the same thing about a crowd.
  // Only a meet row's B may ask for it (validate-data), and a meet row fills A before it asks B.
  if (side2.sameKind && w.R.flags.traits && s.kind !== w.rx.A.kind) return false;
  // Design 18 A3: what it IS. Asked last, because everything above it is cheaper.
  // Design 19 G3.4 (flag `namedThings`): a thing the one she named left behind carries its name (the egg her named hen
  // laid), so it is `named`, and it is nothing else a creature is: `egg_thief`'s B is `not: [named]`, and the fox passes
  // her named hen's egg by. Without the flag a thing is no trait at all, as before (a row asking one of it never matches).
  if (w.R.flags.traits && (side2.trAll || side2.trNone) && (s.e < 0 && s.thing && w.R.flags.namedThings ? !thingTraitsOk(w, s.thing, side2.trAll, side2.trNone) : !traitsOk(w, s.e, side2.trAll, side2.trNone))) return false;
  return true;
}
// (flag `namedThings`, above) The one trait a thing can carry: `named`, when the one she named left it.
function thingTraitsOk(w, st, all, none) {
  const t = st.name ? w.C.traits.bit.named : 0;
  return (t & all) === all && (t & none) === 0;
}
// Does this creature carry all of `all` and none of `none`? (design 18 A3.) The species half was worked out once
// per kind at load; the state half is seven reads, and is asked every time rather than only when a row names one
// of them, so that this has no branch a world could fail to take.
function traitsOk(w, e, all, none) {
  if (e < 0) return false; // a trait is something a creature IS: a tile and a thing are neither
  const C = w.C, t = C.traits.kind[C.kid[w.E.kind[e]]] | stateTraits(w, e);
  return (t & all) === all && (t & none) === 0;
}
// What a creature is right NOW, as trait bits. Branch free on purpose: every trait costs the same, and none of
// them is a branch that the scenes might never take (the coverage gate is right to refuse those).
function stateTraits(w, e) {
  const E = w.E, B = w.C.traits.bit, ins = E.inside[e];
  // Design 18 A5: really asleep, which is not the same as sent to bed (the errand is the walk there).
  const nap = (E.sleepT[e] !== 0) & (E.errT[e] <= 0);
  return (-nap & B.asleep) | (-(E.was[e] !== '') & B.changed) | (-(E.named[e] !== 0) & B.named) | (-(E.baby[e] !== 0) & B.baby) | (-(E.baby[e] === 0) & B.adult)
    | (-(E.bigT[e] > 0) & B.giant) | (-(E.calm[e] > 0) & B.calm)
    | (-(ins > 0) & B.indoors) | (-(ins === 0) & B.outdoors) // (held in her hand is neither in nor out)
    | (-(E.hunger[e] > w.R.needs.hungry) & B.hungry); // design 19 G1.8 (WATER-LIFE E8): the heron that found no dinner leaves
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
function needsOk(w, row, x, y) {
  const n = row.needs;
  if (!n) return true;
  // Design 18 A10: enough of them near by. Measured exactly, because the spatial hash answers in whole cells
  // (the law that let a goat eat a flower crown from five tiles away).
  if (n.count !== undefined && w.R.flags.counts && !enough(w, row, x, y)) return false;
  if (n.raining !== undefined && n.raining !== w.rainT > 0) return false;
  // Design 18 A2: after dark, or before it. This validator-allowed key had no branch here at all, so a row that
  // asked for night ran all day and said nothing about it; validate-data now refuses any key needsOk cannot answer.
  if (n.night !== undefined && w.R.flags.needsNight && n.night !== isNight(w)) return false;
  if (n.named !== undefined) { const R = w.rx, e = R.B.e >= 0 ? R.B.e : R.A.e; if (n.named !== !!(e >= 0 && w.E.named[e])) return false; } // somebody the child named
  if (n.landing !== undefined && n.landing !== !!w.rx.landing) return false; // it came down out of the air, it did not walk here
  if (n.walks !== undefined) { const e = w.rx.A.e; if (n.walks !== !(e >= 0 && (w.C.S[w.E.kind[e]].fly || w.E.gear[e].wings))) return false; } // its feet touch the ground (a UFO over a pond has touched nothing)
  if (n.hand !== undefined && n.hand !== !!w.rx.byHand) return false; // the child's own hand put it down, not the world's (a village, a spill)
  if (n.looks !== undefined && n.looks !== !(w.rx.A.thing && w.R.react.lookSkip.indexOf(w.rx.A.thing.type) >= 0)) return false; // worth walking over for (not a fence)
  // Design 19 A3: the ground under the point is this kind (or carries this tag), and has been what it is so many days
  // (w.age, in game minutes: `days` times this world's day over sixty). With the land switched off no tile ages, so
  // a row that waits days waits for ever: the validator lets only a design 19 row ask it.
  if (n.ground !== undefined) { const i = tileIndex(w, x, y), g = row.ground; if (i < 0 || (g.tid >= 0 ? w.terr[i] !== g.tid : ((w.C.tags.terr0[w.terr[i]] & g.m0) !== g.m0 || (w.C.tags.terr1[w.terr[i]] & g.m1) !== g.m1))) return false; }
  if (n.days !== undefined) { const i = tileIndex(w, x, y); if (i < 0 || w.age[i] < Math.round((n.days * w.daySec) / 60)) return false; }
  // Design 19 A4: hot or cold where it is happening, derived from the map (world.js climeAt: near lava or fire, near snow or ice).
  if (n.hot !== undefined) { const i = tileIndex(w, x, y); if (i < 0 || (climeAt(w, i) > 0) !== n.hot) return false; }
  if (n.cold !== undefined) { const i = tileIndex(w, x, y); if (i < 0 || (climeAt(w, i) < 0) !== n.cold) return false; }
  return true;
}
// The tile under a point, or -1 off the map (design 19 A3: needs.ground and needs.days read it).
function tileIndex(w, x, y) { const tx = Math.floor(x / w.T), ty = Math.floor(y / w.T); return tx >= 0 && ty >= 0 && tx < w.cols && ty < w.rows ? ty * w.cols + tx : -1; }
// How many creatures of the kind a row named are within r of where it is happening (design 18 A10).
function enough(w, row, x, y) {
  const c = row.count, E = w.E, n = gatherAny(w, x, y, c.r), near = w.near, r2 = c.r * c.r;
  let found = 0;
  for (let k = 0; k < n; k++) {
    const o = near[k];
    if (E.dead[o] || E.inside[o]) continue;
    const dx = E.x[o] - x, dy = E.y[o] - y;
    if (dx * dx + dy * dy > r2) continue;
    if (c.kind && E.kind[o] !== c.kind) continue;
    if (c.m0 || c.m1) { const ki = w.C.kid[E.kind[o]]; if ((w.C.tags.kind0[ki] & c.m0) !== c.m0 || (w.C.tags.kind1[ki] & c.m1) !== c.m1) continue; }
    if ((c.all || c.none) && !traitsOk(w, o, c.all, c.none)) continue;
    ++found;
    if (c.max < 0) { if (found >= c.min) return true; continue; }
    if (found >= c.max) return false; // design 19 0.3: "fewer than max of them near" (the arrivals cap themselves)
  }
  return c.max >= 0 && found >= c.min;
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
  let any = false; // (design 19 F3.11, flag `also`: a row marked `also` fires and the walk goes on to the next row)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!matches(w, row, R.A, row.a) || !matches(w, row, R.B, row.b)) continue;
    // Design 19 G5.5 (flag `powerAt`): a row about a power that falls everywhere at once (the rain: validate-data lets `at`
    // only on such a row) happens at its places, as a clock row does, and only on the power's first raise (the ground at
    // the middle of the map), never again for whoever stands there (the second raise, B a creature). What it needs is asked
    // at each place (atSites).
    const sited = row.at !== null && trig === TRIG.power && w.R.flags.powerAt;
    if (sited ? R.B.e >= 0 : !needsOk(w, row, x, y)) continue;
    if (R.chain.indexOf(row.i) >= 0) continue; // a row fires once in a chain
    // (Keyed by the row's ID. It was its place in the file, so every row added above it slid a saved world's
    // cooldowns onto its neighbours for their last few seconds.)
    const key = row.id + '|' + handleOf(w, R.A) + '|' + handleOf(w, R.B);
    if (row.mode === 'once' && onCooldown(w, row, key)) continue;
    if (row.globalCd && !R.byHand && onCooldown(w, row, row.id + '|*')) continue; // once anywhere per globalCooldownSec (her own hand goes through: what she does on purpose always works)
    if (sited ? powerSites(w, row, key) : fire(w, row, key, x, y)) { // first match wins, unless it turned out to be about nothing (or the row says `also`)
      if (row.globalCd) R.cool.set(row.id + '|*', w.time + row.globalCd);
      if (!(row.also && w.R.flags.also)) return true;
      any = true;
    }
  }
  return any;
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
  if (w.R.flags.quietRows !== false && row.scope.only && !R.tN && row.scope.kind !== 'things') return false; // it named who it was about and they are not here
  // Design 19, the second review of F3.11 (flag `errandPassesBy`): one on its way somewhere passes the others by. With
  // `errandNoFollow` a meeting on the way never made one on an errand a follower, but a row with anything else in it still
  // fired round the refused follow: `a_dog_and_a_lamb` calmed the lamb, put a heart over it and said "The dog has decided
  // the lamb is its own." while her dog walked on past it to her new door, following nobody; `pets_and_the_flock` the same
  // ("Pip keeps a sheep company."); `goose_chases` sent the person running and said "The goose chased the person off." over
  // a goose walking on to its dawn drink. Her world, a dog and a cat by her house and 12 houses she put down by hand (seeds
  // 1 to 7 and 11): 49, 8 and 23 (`chases_bugs`) such sentences; 30 minutes untouched (seeds 7 and 11): 13 of the goose's
  // (dev/f311-lies.mjs). A meet row that would make somebody follow, where everyone it would make a follower is on its way
  // somewhere, is not about them: before any of its effects, it does nothing and says nothing, and the next row has its turn.
  if (row.fol && w.R.flags.errandNoFollow && w.R.flags.errandPassesBy && allOnTheirWay(w, row)) return false;
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
    // Design 18 A6: in a row about THINGS, what is made and what is shown happens at each of them (the squirrel
    // comes out of the tree that was knocked on, not out of the woodpecker).
    const atThing = w.R.flags.thingScope && row.scope.kind === 'things';
    for (const eff of row.subst) { const verb = VERBS[eff.do]; if (verb) did += (eff.on ? onOne(w, row, eff, verb, x, y) : atThing && AT_SITE[eff.do] ? atTiles(w, row, eff, verb) : verb(w, row, eff, x, y)) | 0; }
    if (row.subst.length && !did) {
      R.duds[row.id] = (R.duds[row.id] || 0) + 1;
      if (row.mode === 'once') R.cool.delete(key);
      R.chain.pop();
      R.depth--;
      return false;
    }
    R.did[row.id] = (R.did[row.id] || 0) + did;
    // Design 19 D0: a row that happens AT a place and names nobody it is about (no `scope.only`: a frog out of the
    // reeds, made by the row, so it was nobody's target) shows its picture at the place, where the frog now is,
    // whoever else its reach happened to take in. Before this the sparkle went to each target, so with nobody there
    // it went nowhere, and (the D1 review, 25 Sep) with a butterfly or a fish already standing on the tile it went on
    // THEM and not on the newcomer: 12 of 19 and 15 of 21 arrivals in her untouched world. A sited row that names
    // who it is about (the festival's villagers) still shows its picture on each of them (flag `siteFx`).
    const atSite = each && row.at && (!R.tN || !row.scope.only) && w.R.flags.thingScope && w.R.flags.siteFx;
    for (const eff of row.cosm) { const verb = VERBS[eff.do]; if (verb) { if (eff.on) onOne(w, row, eff, verb, x, y); else if (atThing) atTiles(w, row, eff, verb); else if (each && !atSite) atEach(w, row, eff, verb); else verb(w, row, eff, x, y); } }
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
  // Design 19, the G3.1 review round (flag `sayWith`): rows that say one sentence about one happening for different kinds, each
  // with its own picture (the crow's, the hen's, the duck's bones rows), keep ONE minute between them: `sayWith` names the row
  // whose minute this one's sentence shares. As one row the picture was the crow's for every bird (all 12 and 15 of its cards
  // in her first world, seeds 7 and 11, were a duck, a goose or a hen); split with a minute each, it could be said three
  // times in one. The key is the row's own, worked out once (compile), unless it says whose it shares.
  const sayKey = row.sayWithKey !== null && w.R.flags.sayWith ? row.sayWithKey : row.sayKey;
  const quiet = row.sayEvery > 0 && onCooldown(w, row, sayKey);
  if (row.say && !quiet) {
    // Design 19, the review of F3.4 (flag `groundAboutA`): a row about the GROUND that somebody walked onto (B is no
    // creature and the row names no thing: the snow, the ice, the shallows) is about that one, whatever thing lies on
    // the tile. A grave is the only thing with a name, and it is flat, so the farm walks over it: a grave on the snow
    // took the named sentence for a goat she never named ("a goat does not like the snow."), and her named cat walking
    // onto snow with anything at all on it got the plain words. A row whose B names the thing (the grave's own rows)
    // still says the thing's name.
    const ground = w.R.flags.namedA && w.R.flags.groundAboutA && R.A.e >= 0 && R.B.e < 0 && !row.b.id && !row.b.ids;
    const th = !ground && R.B.thing && R.B.thing.name ? R.B.thing : null;
    // Design 18 B5: a row may have a second sentence for when the one it is about is somebody the child NAMED,
    // the same way a grave keeps the name of whoever lies in it. Nothing that shipped before this can reach it:
    // every `sayNamed` row until now is about a thing, and a thing is never a creature (flag `namedSay`).
    const knownB = !th && w.R.flags.namedSay && R.B.e >= 0 && w.E.named[R.B.e] !== 0;
    // Design 19 F3.4 (flag `namedA`): when B is ground (an `enter` row: no creature, no thing), the one it is about is A,
    // so the one she named walking onto the snow gets its own sentence ("{A} does not like the snow.").
    // (and `sayNamedOn: "a"`: a meet row about A, the dog that barks the wolf off or the cat up the tree)
    const knownA = !th && w.R.flags.namedA && ((R.B.e < 0 && !R.B.thing) || ground || row.sayNamedOn === 'a') && R.A.e >= 0 && w.E.named[R.A.e] !== 0;
    log(w, (th || (knownB && row.sayNamedOn !== 'a') || knownA) && row.sayNamed ? row.sayNamed : row.say, { a: R.A.e >= 0 ? { name: w.E.name[R.A.e], kind: w.E.kind[R.A.e] } : null, b: R.B.e >= 0 ? { name: w.E.name[R.B.e], kind: w.E.kind[R.B.e] } : null, name: th ? th.name : undefined });
    if (row.sayEvery > 0) R.cool.set(sayKey, w.time + row.sayEvery);
  }
  // One story record for the reaction itself (14 §4's "one event record, four uses"): the Because card, the
  // sparkle, the status line and the Scrapbook all read the same thing.
  storyRow(w, row.i, x, y, R.A.e, R.B.e, whoPic(w, row.whoA, row.a.pic), whoPic(w, row.whoB, row.b.pic), whoPic(w, row.whoR, row.res), row.say && !quiet ? w.lastLog : null);
  R.chain.pop();
  R.depth--;
  return true;
}

// (flag `flopReach`, launch and visit) A swimmer standing on ground it cannot live on (a fish on the lawn or the sand), with its
// feet on the ground: pass() lets anything in the air through.
function stranded(w, e) {
  return !!w.C.S[w.E.kind[e]].water && !(w.E.alt[e] > 0) && !pass(w, e, w.E.x[e], w.E.y[e]);
}

// (flag `errandPassesBy`, fire() above) Whether everyone a meet row's follow would make a follower (as the `follow` verb
// takes them: its `on` side, else the row's targets, never the one they would follow) is on an errand, and there is
// somebody. It runs on every meeting that matches such a row, so it reads the scratch and allocates nothing.
function allOnTheirWay(w, row) {
  const R = w.rx, E = w.E, eff = row.fol, lead = eff.lead === 'a' && w.R.flags.honestRows ? R.A.e : R.B.e;
  if (lead < 0) return false;
  let n = 0;
  if (row.folOn) { const e = R[row.folOn].e; return e >= 0 && e !== lead && E.errT[e] > 0; } // (the goose, `on: "a"`)
  for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (e === lead) continue; if (!(E.errT[e] > 0)) return false; n++; }
  return n > 0;
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

// The same for a row whose scope is THINGS (design 18 A6): it happens at each of them, bounded the same way.
const AT_SITE = { fx: 1, sound: 1, spawn: 1, makeThing: 1 };
function atTiles(w, row, eff, verb) {
  const R = w.rx, T = w.T, cap = w.R.react.eachCap, n = Math.min(R.tileN, cap);
  let did = 0;
  for (let k = 0; k < n; k++) { const i = R.tileList[k]; did += verb(w, row, eff, (i % w.cols) * T + 4, ((i / w.cols) | 0) * T + 4) | 0; }
  return did;
}

// Send a creature somewhere for a while (ai/decide.js B_ERRAND does the going). It decides again at its next own
// think tick, so the errand competes with everything else it might want, fear first.
function errand(w, e, x, y, sec) {
  const E = w.E;
  E.errX[e] = x; E.errY[e] = y; E.errT[e] = sec;
  if (e !== w.rx.thinker) E.think[e] = 0;
}

// Is this thing one a `visit` goes to (`to: {thing: [..]}` or `{thingTag}`, compiled to vThing and vH0/vH1)? Asked of
// every thing its ring search passes, and of the thing her finger poked (design 19 F1, flag visitPoked).
function visitsThing(w, eff, st) {
  const tg = w.C.tags;
  return !!((eff.vThing && eff.vThing.has(st.type)) ||
    (eff.vH0 !== undefined && ((tg.thing0[st.type] || 0) & eff.vH0) === eff.vH0 && ((tg.thing1[st.type] || 0) & eff.vH1) === eff.vH1));
}

// Design 19, the review of F3.9 (flag `perchClimbs`, perchNear above): each target goes up the perch nearest to where it
// stands that it could walk to, of those the row names. A flier, one in the air, indoors or already up is not climbing.
// (flag `climbNoBeam`: and a climb draws no beam. The green block is the UFO's drop and a bounce pad's; the cat's climb
// drew it on 8 of 8 and 9 of 9 perches in her world, as the skid did before `groundHops`.)
// (A climb is a meeting's or a step's, never a clock event's, so it has no bedtime claim to keep: A1's mark is not asked.)
function climb(w, eff) {
  const R = w.rx, E = w.E, U = w.R.ufo, T = w.T, only = eff.vThing || eff.vH0 !== undefined;
  let n = 0;
  for (let k = 0; k < R.tN; k++) {
    const e = R.targets[k];
    if (E.inside[e] || E.perch[e] || E.alt[e] > 0 || E.dead[e] || flies(w, e)) continue;
    const cx = (E.x[e] / T) | 0, cy = (E.y[e] / T) | 0;
    let best = null, bd = eff.r * eff.r;
    for (let q = 0; q < w.structs.length; q++) {
      const s = w.structs[q];
      if (!s.def.shoot && !(w.R.flags.perchAnything && s.def.perch)) continue;
      if (only && !visitsThing(w, eff, s)) continue;
      const dx = s.tx * T + 4 - E.x[e], dy = s.ty * T + 4 - E.y[e], d = dx * dx + dy * dy;
      if (d < bd && walkable(w, e, cx, cy, s.tx, s.ty)) { bd = d; best = s; }
    }
    if (!best) continue; // nothing it can get up: the row changed nothing for it (and with nobody else, says nothing)
    n++;
    // (flag `climbsDown`, climbDown below: it keeps where it stood, and comes down on that side)
    if (w.R.flags.climbsDown) { E.dropX[e] = E.x[e]; E.dropY[e] = E.y[e]; E.bounced[e] = CLIMBED; }
    E.perch[e] = best.h; E.perchT[e] = U.perchSec; E.alt[e] = 0; E.chute[e] = false; E.goalKind[e] = G_NONE;
    setPos(w, e, best.tx * T + 4, best.ty * T + 6);
    best.manned = U.perchSec;
    emitAt(w, EVI.perch, e);
    if (!w.R.flags.climbNoBeam) addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop);
  }
  return n;
}
// The straight way from tile (x0, y0) to tile (x1, y1), one tile at a time and always along a side (never across a corner,
// so no diagonal gap in a fence lets it through): every tile of it but the first (where it stands) and the last (the thing
// it goes up, which is solid to walk INTO) asked as a step asks it, with its feet on the ground. Whole numbers throughout.
function walkable(w, e, x0, y0, x1, y1) {
  const T = w.T | 0, h = (T >> 1) | 0, ax = Math.abs(x1 - x0) | 0, ay = Math.abs(y1 - y0) | 0, sx = x1 > x0 ? 1 : -1, sy = y1 > y0 ? 1 : -1;
  let x = x0 | 0, y = y0 | 0, ix = 0, iy = 0;
  while (ix < ax || iy < ay) {
    if ((1 + 2 * ix) * ay < (1 + 2 * iy) * ax) { x += sx; ix++; } else { y += sy; iy++; } // (the side the line leaves by first)
    if (x === x1 && y === y1) return true;
    if (!pass(w, e, x * T + h, y * T + h)) return false;
  }
  return true;
}

// Design 19, the second review of F3.9 (flag `climbsDown`): a climber comes down where it went up. When its 15 s were up it
// hopped 8 px to one side onto whatever tile lay there (update.js perched, the archer's hop off a tower) and the UFO's
// touchdown (ai/ufo.js land) snapped it to the nearest open tile, whichever side of a fence that was: a tree inside her pen
// against its west fence put her named cat OUTSIDE, beside the wolf (4 to 6 of 10 in her own world, 24 of 40 in the
// review's pen), and a person beside the tree had it land on her head (20 of 20). climb() keeps where it stood (dropX,
// dropY) and marks it CLIMBED (so its touchdown is a plain one, as groundHops'). It comes down on the tile beside the perch
// on the straight way it came (where it stood, if it stood beside it); if she has shut that tile while it was up, on the
// side of the perch nearest by foot from where it stood (a walk four ways over tiles a step would take, within 12 tiles);
// with neither, it stays up and asks again when the next perchSec is up (a perch heals, so waiting hurts nobody). It is
// never put down on the far side of anything. Returns false when it stays up. Whole numbers in the loops.
export function climbDown(w, e, pt) {
  const E = w.E, T = w.T | 0, cols = w.cols | 0, px = pt.tx | 0, py = pt.ty | 0;
  const sx = Math.floor(E.dropX[e] / T) | 0, sy = Math.floor(E.dropY[e] / T) | 0, s0 = (sy * cols + sx) | 0;
  let q = besideOnTheWay(cols, sx, sy, px, py);
  if (q === s0 ? pass(w, e, E.dropX[e], E.dropY[e]) : pass(w, e, (q % cols) * T + 4, ((q / cols) | 0) * T + 5)) {
    if (q === s0) setPos(w, e, E.dropX[e], E.dropY[e]); else setPos(w, e, (q % cols) * T + 4, ((q / cols) | 0) * T + 5);
    return true;
  }
  q = nearestSideByFoot(w, e, sx, sy, px, py);
  if (q < 0) return false;
  setPos(w, e, (q % cols) * T + 4, ((q / cols) | 0) * T + 5);
  return true;
}
// The tile before (x1, y1) on walkable()'s straight way from (x0, y0): the side of the perch it came up by. (x0, y0) itself
// when it stood beside the perch, or on it (a perch that does not block, the apple tree).
function besideOnTheWay(cols, x0, y0, x1, y1) {
  const ax = Math.abs(x1 - x0) | 0, ay = Math.abs(y1 - y0) | 0, sx = x1 > x0 ? 1 : -1, sy = y1 > y0 ? 1 : -1;
  let x = x0 | 0, y = y0 | 0, ix = 0, iy = 0, bx = x, by = y;
  while (ix < ax || iy < ay) {
    bx = x; by = y;
    if ((1 + 2 * ix) * ay < (1 + 2 * iy) * ax) { x += sx; ix++; } else { y += sy; iy++; }
  }
  return (by * cols + bx) | 0;
}
// A walk from where it stood (four ways, over the tiles a step would take, within 12 tiles of the perch, in the flood
// fill's scratch): the first tile beside the perch it reaches, or -1 (where it stood is shut too, or no side is open).
function nearestSideByFoot(w, e, sx, sy, px, py) {
  const R = w.rx, T = w.T | 0, h = (T >> 1) | 0, cols = w.cols | 0, cap = R.fill.length | 0, reach = 12;
  if (!pass(w, e, sx * T + h, sy * T + h)) return -1;
  R.seenStamp++;
  let head = 0, n = 0;
  R.fill[n++] = (sy * cols + sx) | 0; R.seen[(sy * cols + sx) | 0] = R.seenStamp;
  while (head < n) {
    const i = R.fill[head++] | 0, tx = (i % cols) | 0, ty = (i / cols) | 0;
    if (Math.abs(tx - px) + Math.abs(ty - py) === 1) return i;
    for (let d = 0; d < 4; d++) {
      const nx = (tx + (d === 0 ? 1 : d === 1 ? -1 : 0)) | 0, ny = (ty + (d === 2 ? 1 : d === 3 ? -1 : 0)) | 0;
      if (!inB(w, nx, ny) || Math.abs(nx - px) > reach || Math.abs(ny - py) > reach) continue;
      const j = (ny * cols + nx) | 0;
      if (R.seen[j] === R.seenStamp || n >= cap) continue;
      R.seen[j] = R.seenStamp;
      if (pass(w, e, nx * T + h, ny * T + h)) R.fill[n++] = j;
    }
  }
  return -1;
}

// The nap a `visit ... then: "sleep"` sets (design 18 A5): the same rules the `sleep` verb keeps, for one
// creature, either where it stands (`orHere`, nothing in reach) or when its errand to bed ends.
function sleepHere(w, e, eff, midHop = false) {
  const E = w.E;
  if (!w.R.flags.sleeps || E.dead[e] || E.inside[e] || (E.alt[e] > 0 && !midHop) || E.bigT[e] > 0) return false; // (midHop: bedtime's own, above)
  const until = eff.until === 'dawn' ? SLEEP_DAWN : eff.until === 'dusk' ? SLEEP_DUSK : eff.sec > 0 ? eff.sec : 0;
  if (!until || E.sleepT[e] === until) return false;
  E.sleepT[e] = until;
  if (!(E.errT[e] > 0)) favourite(w, e); // asleep where it stands (A14); one that is walking to bed records it on arrival
  return true;
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
  // Design 18 A6: the row is about THINGS — the trees within reach of the woodpecker, not whoever is standing
  // under them. They are kept as their tiles, which is what a thing IS to the grid, so `ignite` and `douse` read
  // them as they always have; `removeThing` takes each of them, and what is SHOWN or made happens at each one.
  if (sc.kind === 'things') {
    if (!w.R.flags.thingScope) return;
    const r2 = sc.r * sc.r, cap = Math.min(sc.max || w.R.react.tileCap, w.R.react.tileCap), T = w.T;
    for (let k = 0; k < w.structs.length && R.tileN < cap; k++) {
      const st = w.structs[k], dx = st.tx * T + 4 - x, dy = st.ty * T + 4 - y;
      if (dx * dx + dy * dy > r2) continue;
      if (sc.only && !onlyThing(w, sc, st)) continue;
      R.tileList[R.tileN++] = st.ty * w.cols + st.tx;
    }
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
  // Design 18 A3: and only what they ARE (the little fish behind the whale, never the shark that also carries `fish`).
  if (w.R.flags.traits && (sc.onlyAll || sc.onlyNone) && !traitsOk(w, e, sc.onlyAll, sc.onlyNone)) return false;
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
// Which THINGS a scope takes (design 18 A6): the ids it names, or the tags they carry.
function onlyThing(w, sc, st) {
  const rule = sc.only;
  if (rule.ids && !sc.onlyIds.has(st.type)) return false;
  if (rule.tags) {
    const m0 = w.C.tags.thing0[st.type] || 0, m1 = w.C.tags.thing1[st.type] || 0;
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
      // Design 18 pack 4: the side chosen may be an ITEM and not a creature — an equip row's A is the gear and a
      // poke row's A is the finger, and `reset` leaves both at 0, 0, which is a real corner of a real map. So a
      // poked skunk, which is inside its own row's radius, ran to the bottom right corner every single time.
      // Nobody runs from nothing: whoever the row is about steps aside instead (the same guard `follow` keeps).
      if (from.e < 0 && from.tile < 0) continue;
      if (from.e === e || E.inside[e] || E.alt[e] > 0 || E.perch[e]) continue;
      // Design 19 F3.2 (flag fleeWakes): nobody runs away asleep, as nobody is thrown in the air asleep (`launch`). A sheep
      // asleep where dusk left it, sent running by a zombie at its side, slid 20 px with the z still rising over its
      // head (her opening world, early in the night, when most of the flock sleeps). One on its way to bed is awake
      // already: it keeps its bedtime and walks on to bed when the run is over.
      if (w.R.flags.fleeWakes && w.R.flags.sleeps && asleep(w, e)) wake(w, e, false);
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
      // Design 19 F3.3 (flag followKeeps): a follow never cuts short a follow of the SAME one. The dog walks with the ewe
      // it met for design 17's 20 s (`a_dog_and_a_lamb`); on its next think it meets that ewe again, the lamb row is
      // waiting its 45 s, and `pets_and_the_flock` (10 s) answered the same pair and halved the walk: a kept dog in her
      // world, 30 minutes, 14 and 30 times (dev/f3-pets.mjs). Somebody else to follow still takes the whole new time.
      const sec = eff.sec || w.R.react.followSec, keeps = w.R.flags.followKeeps, h = w.slotH[lead];
      // Design 19, the review of F3.11 (flag `errandNoFollow`): a meeting on the way does not turn one that is on its way
      // somewhere into a follower. With `placedCalls` a pet called to her new door left the sheep it kept company, and on its
      // way met the next sheep of the flock (`pets_and_the_flock`, another pair, so no cooldown held it) and followed that one
      // instead, a follow scoring 70 against the errand's 22 (her world, dev/f311-door.mjs, the other two switches on and this
      // one off: 75 of 105 pets sent got to the door; with it, 90 of 100). The row steps aside for it (it changed nothing), as
      // `errandKeeps` has the ground do.
      const onWay = w.R.flags.errandNoFollow && row.trig === TRIG.meet;
      for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (e === lead || (onWay && E.errT[e] > 0)) continue; E.folT[e] = keeps && E.fol[e] === h && E.folT[e] > sec ? E.folT[e] : sec; E.fol[e] = h; E.think[e] = 0; n++; }
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
    // Design 19, the review of F3.9 (flag `placedLetsSleep`, as the visit verb): what she puts down calls nobody who is asleep
    // or on the way to bed over to look at it. With the fire row leaving them alone, `come_and_look` (design 17) took them
    // instead, and that is any thing at all she puts down by night: her sleeping named sheep got up, walked its 3 s to the
    // campfire and fell asleep there, and her cat walking to bed was turned to it and lay down by it.
    const letsSleep = w.R.flags.placedLetsSleep && row.trig === TRIG.placed;
    let went = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (w.R.flags.pokes && (E.goalKind[e] === 2 /* G_ATTACK */ || E.beh[e] === 1 /* B_FLEE */ || E.frozen[e] > 0)) continue; // hunting, fleeing or held: it has better things to do
      if (letsSleep && E.sleepT[e] !== 0) continue; // asleep, or walking to bed: left alone
      // Design 19, the second review of F3.11 (flag `calledOnce`): what she puts down calls each one once. `pets_new_doorstep`
      // (`also`) sends her pets to the new door for its 8 s, then the walk goes on to `come_and_look` (design 17: the nearest
      // three within 50 px walk over for 3 s), which sent the same pet again, to the middle of the house, for 3 s: the pets'
      // time at the door was 3 s whenever she put the house down within 50 px of them, and in her world that is most of the
      // time (a dog 54 px off with its person: 2 of 10 seeds; houses 3 to 7 tiles from a pet: dev/f311-door.mjs). One already
      // on its way to this very thing for longer is left to it, as a follow never cuts short a follow of the same one.
      if (w.R.flags.calledOnce && row.trig === TRIG.placed && E.errT[e] > hold && Math.abs(E.errX[e] - tx) <= T + (T >> 1) && Math.abs(E.errY[e] - ty) <= T + (T >> 1)) continue;
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
      // Design 18 A13: it remembers what it WAS the first time something changed it, so Bless can put anything
      // back the way giants already taught her. A chain remembers the first one, not the last. **A CURE IS NOT
      // A DISGUISE**: a row that carries `forget` records nothing, so Bless never turns a cured zombie back
      // into a zombie; and becoming what it was again clears the memory, because nothing has changed now.
      if (w.R.flags.reverts) {
        if (eff.forget) E.was[e] = '';
        else if (eff.kind === E.was[e]) E.was[e] = '';
        else if (!E.was[e]) E.was[e] = was;
      }
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
      // Design 18 A11: `any` is a list and the world picks, on its own stream, so an old source gets new tenants
      // (the bush that only ever held hedgehogs) and a replay picks the same ones.
      const kind = eff.kind || (w.R.flags.spawnAny && eff.any && eff.any.length ? eff.any[Math.floor(w.rng.float() * eff.any.length) % eff.any.length] : eff.any && eff.any[0]);
      // A row a child can set off forty times (a rabbit out of a hat) must not be a way round the caps a birth keeps.
      if (w.R.flags.pokes && w.C.kid[kind] !== undefined && w.kindCount[w.C.kid[kind]] >= Math.min(eff.cap || 9999, capOf(w, kind))) return made;
      if (w.count >= cap) return made; // quietly: the player did not ask for this one, so the world never says it is full
      const sp = eff.spread || 6;
      const i = spawn(w, kind, clampW(w, x + (k % 3) * sp - sp), clampH(w, y + (((k / 3) | 0) - 1) * sp));
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
    // Design 19, the second review of F3.11 (flag `roostHolds`): a power or her finger never throws one off its perch. The
    // hop left it marked perched wherever it came down: a duck `bird_roost` had put up on her new roof hopped in the rain,
    // came down, and the touchdown (ai/ufo.js land) snapped it off the house tile to the tile north, where it stood drawn
    // 7 px up with no shadow, "on tower watch", until its perch time ran out and it hopped off to a random side (8 of 8
    // seeds; her world, rain every 37 s for 30 min, seeds 7 and 11: 5 and 1 ducks left like that on S, 1 and 7 on M); design
    // 17's gust push the same (8 of 8); and her finger on her cat up a tree lost the mark F3.9's `climbsDown` keeps, so it
    // came down 9 px off the tree still perched, then off to any side, her fence or not (6 of 6; dev/f311-roost.mjs,
    // dev/f311-roost.mjs --by gust, the review's probes). One on its roost stays on it in the weather, as it does from a
    // `flee`; and her finger never throws one down out of a tree it CLIMBED (its way down is kept in that mark). Her finger
    // on anything else up on a perch still hops it where it is (design 18's `poke_gargoyle`, the statue on the roof opening
    // its eyes; the archer on her tower): a flier comes down on its perch, and so does one that stands where a step could
    // not take it (`hopsInPlace`, below).
    const roost = w.R.flags.roostHolds && (row.trig === TRIG.power || row.trig === TRIG.poke);
    // Design 19, the second review of F3.11 (flag `hopsInPlace`): and a hop a power or her finger gives where it stands
    // comes down where it stood, even where a step could not take it now. A duck standing within a scarecrow's reach (which
    // keeps birds off: pass() refuses it there) hopped in the rain and the touchdown snapped it 30 px away (6 of 6 seeds,
    // dev/f311-scarecrow.mjs; the review: a duck in the village wheat by the scarecrow, 33 px). Only for one standing where
    // pass() says no, asked before it goes up (with its feet on the ground: pass() lets anything in the air through), so
    // every other hop comes down exactly as before; its touchdown is marked HOPPED and land() does not move it.
    const inPlace = w.R.flags.hopsInPlace && eff.chute === false && (row.trig === TRIG.power || row.trig === TRIG.poke);
    // Design 19, the G4b review round (flag `flopReach`): a fish on dry ground is hopped home only when the hop can land it in the
    // water. The hop is what takes it home: it goes up where it stands (a fish is never thrown sideways, `gust` above) and the
    // touchdown puts it on the nearest ground it can live on within rules.ufo.snapTiles (ai/ufo.js snapTile), which for a fish
    // is the water. Past that it came down where it stood, walked, and dried 1 to 3 s after the world said "The fish flopped
    // back to the water." (her first world, S, seeds 7 and 11, a goldfish on every third lawn tile of her opening view: 51 of
    // 81 drops in the review of fa1497b, 44 of 69 on each seed in dev/g4b-review.mjs lawn; a painted pond, a goldfish 8 to 16
    // tiles east of it, and a world with no water at all, every one). With no water a hop could land it in, the hop does not happen and the row has changed
    // nothing for it (and the walk to the water, the `visit` after it, is not set either: a fish on the grass walks about
    // 16 px a second and dries in about 2.5 s, 40 px, and a hop reaches seven tiles, 56 px): it dries as a fish on land always
    // did, and the world says that, not that it got home. Only a row that hops a swimmer AND sends it to the water (`home`).
    const homeReach = w.R.flags.flopReach && row.home;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e]) continue;
      if (homeReach && stranded(w, e) && snapTile(w, e) < 0) continue; // (no water a hop could land it in: the row changed nothing for it)
      if (roost && E.perch[e] && (row.trig === TRIG.power || E.bounced[e] === CLIMBED)) continue; // (on its roost it stays: the row changed nothing for it)
      if (eff.stops && w.R.flags.slideStops && slideShut(w, e, eff)) continue; // (a slide whose way is shut does not happen: slideShut)
      const stoodShut = inPlace && E.alt[e] === 0 && !pass(w, e, E.x[e], E.y[e]);
      if (w.R.flags.sleeps) wake(w, e, false); // design 18 A5: nobody stays asleep through being thrown in the air
      n++;
      E.alt[e] = eff.alt; E.chute[e] = eff.chute !== false; E.goalKind[e] = G_NONE; E.think[e] = 0; // (chute: false is a bounce, not a flight)
      // `away`: flung away from the other one of the two (a giant's blow), not always to the right.
      let dx = (eff.px || 0) * (eff.away && R.A.e >= 0 && R.A.e !== e && E.x[R.A.e] > E.x[e] ? -1 : 1);
      // Design 19 F3.7 `across`: on over the tile it just stepped onto (it came in at one edge, so the far side is the way it
      // was going): a sheep crossing a frozen pond skids ACROSS it. Only a row that says so; nothing that shipped does.
      if (eff.across && R.B.tile >= 0) dx = (eff.px || 0) * (((R.B.tile % w.cols) + 0.5) * w.T >= E.x[e] ? 1 : -1);
      if (w.R.flags.gust) {
        if (eff.away && R.A.e < 0 && row.trig === TRIG.power) dx = (eff.px || 0) * (R.A.x > E.x[e] ? -1 : 1); // away from where a power landed
        if (w.C.S[E.kind[e]].water) dx = 0; // a fish is never blown (or punted) onto the shore: it jumps where it is
      }
      // Nobody is flung into a pond or into lava: if that is where it would come down, it goes straight up instead.
      if (dx && w.R.flags.pokes) {
        const lx = Math.max(3, Math.min(w.W - 3, E.x[e] + dx)), li = Math.floor(E.y[e] / w.T) * w.cols + Math.floor(lx / w.T), lt = w.C.TERR[w.terr[li]];
        if (lt && (lt.deep === 1 || w.terr[li] === w.C.tid.lava)) dx = 0;
      }
      // Design 19, the review of F3.7 (flag `skidStops`): a skid goes along the ground, so it stops at whatever a walker cannot
      // walk through. It went 14 px on over the tile it stepped onto, whatever stood beyond, and carried her flock over the
      // fence of her closed pen paved with ice (her named sheep outside on 4 of 4 seeds) and a wolf over it into the sheep.
      // Each tile it would cross, and the one it would come down on, is asked as a step asks it (pass: a fence, a wall, a
      // house, rock, deep water); if one is shut, the skid is a hop on the spot, as the pond and lava guard above makes it.
      // (Asked with its feet on the ground: pass() lets anything in the air through, and it is already up, eff.alt, above.)
      if (dx && eff.across && w.R.flags.skidStops) {
        const T = w.T, c0 = Math.floor(E.x[e] / T), c1 = Math.floor(Math.max(3, Math.min(w.W - 3, E.x[e] + dx)) / T), s = c1 > c0 ? 1 : -1;
        E.alt[e] = 0;
        for (let c = c0 + s; c1 !== c0 && c !== c1 + s; c += s) if (!pass(w, e, c * T + (T >> 1), E.y[e])) { dx = 0; break; }
        E.alt[e] = eff.alt;
      }
      setPos(w, e, Math.max(3, Math.min(w.W - 3, E.x[e] + dx)), E.y[e]);
      // (a hop in the wind is not a beam: the green mark is a UFO's and a bounce pad's). Design 19, the review of F3.5 (flag
      // `pokeHopNoBeam`): nor is a hop from her finger. Every walker hops when poked since F3.5, so the UFO's green block
      // stood under the game's most common gesture; a poke row's bounce (chute: false) draws none.
      // Design 19, the review of F3.7 (flag `groundHops`): nor is the hop the ground gives whoever walks onto it (an `enter` row
      // about the ground: the ice, the shallows, the mud; not a bounce pad's or the hay's, which name their thing). Every ice
      // skid drew the UFO's green block (38 under 38 skids) and touched down as a UFO drop: one that came down within 7 px of
      // a person on her feet bounced 9 px up off her head, the person blinking as if hit (below).
      const ground = w.R.flags.groundHops && eff.chute === false && row.trig === TRIG.enter && !row.b.id && !row.b.ids;
      // Design 19, the deploy line 2b look (flag `worldHopNoBeam`): nor is the world's own hop, the one a clock row or a meet row
      // gives (the little fish jumping for the morning sun, the hens at first light, the owls and bats at dusk; the frog's snap at
      // a bug, the cat's pounce, the kangaroo's box). Every little fish in a pond jumped at first light on the UFO's green block,
      // with the hens: 14 blocks on one first light of her untouched world, and a heron coming to the shallows at that very first
      // light (G5.1) stood among them (dev/look-19e.mjs).
      const own = w.R.flags.worldHopNoBeam && eff.chute === false && (row.trig === TRIG.clock || row.trig === TRIG.meet);
      const bounce = eff.chute === false && ((w.R.flags.gust && row.trig === TRIG.power) || (w.R.flags.pokeHopNoBeam && row.trig === TRIG.poke) || ground || own);
      if (!bounce) addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop);
      // Design 19, the second review of F3.5 (flag `pokeHopLands`): a hop from her finger comes down where it stood. The
      // touchdown (ufo.js land) bounces whatever lands within bounceScan of a person on her feet 9 px up off her head and
      // the person blinks as if hurt (a parachute's joke, design 14 §5): beside a person every poke did, 14 to 20% of her
      // pokes on her own people. A poke row's bounce is marked as bounced already, so land() takes the plain touchdown and
      // clears the mark. (Coming down IN the hay still bounces: that is hay_landing, a row, and it is true.)
      // (and, flag `groundHops`, so is the ground's hop: a plain touchdown where it came down)
      // Design 19, the review of F3.11 (flag `powerHopLands`): and so is a power's hop (the ducks in the rain, the gust's push).
      // `ducks_love_rain` hops every duck in the world 6 px up where it stands, and a duck by a person on her feet came down
      // on her head 35 of 36 times, the person blinking as if hurt and the News saying "A duck landed on the person's head
      // and bounced off." (a duck 2 to 6 px beside a person, rain by day, seeds 1 to 12; dev/f311-head.mjs).
      if ((w.R.flags.pokeHopLands && eff.chute === false && row.trig === TRIG.poke) || ground || (w.R.flags.powerHopLands && eff.chute === false && row.trig === TRIG.power)) E.bounced[e] = 1;
      if (stoodShut && dx === 0) E.bounced[e] = HOPPED; // (flag `hopsInPlace`, above: it comes down where it stood)
      emitAt(w, EVI.chute, e);
    }
    return n;
  },
  // The thing that met is gone (a burnt bush).
  removeThing(w, row, eff) {
    // Design 18 A6: a row whose scope is THINGS takes every one of them (they are kept as their tiles).
    if (w.R.flags.thingScope && row.scope.kind === 'things') {
      const R = w.rx;
      let n = 0;
      for (let k = 0; k < R.tileN; k++) { const i = R.tileList[k], st = w.grid[i]; if (st) { removeStruct(w, i % w.cols, (i / w.cols) | 0); n++; } }
      return n;
    }
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
    // Design 18 pack 3: a squirrel buries a nut every two and a half minutes for ever, so the wood it grows
    // needs a ceiling. `needs.count` counts CREATURES, so the cap lives in the verb's own check, which is
    // where `layEgg` keeps its egg cap for the same reason. It counts what is already standing, of the kinds
    // the row names, and makes nothing over the line.
    if (eff.cap && eff.capOf) {
      let have = 0;
      for (let k = 0; k < w.structs.length; k++) if (eff.capOf.indexOf(w.structs[k].type) >= 0) have++;
      if (have >= eff.cap) return 0;
    }
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
      // Design 18 pack 2: `plain` is BIG TO LOOK AT and nothing else. A pufferfish puffs for five seconds, and
      // measured before this existed, those five seconds made it a GIANT and `giant_scares` emptied the pond
      // round it. A plain big is kept in the SIGN of the field, the way `sleepT` keeps its two kinds of sleep,
      // so nothing grows a fifth creature field (law 10). Every `bigT > 0` test in the game therefore answers
      // no for it, which is the whole point: the four giant rows do not know it happened.
      else if (eff.plain && w.R.flags.plainBig) { if (E.bigT[e] > 0) continue; E.bigT[e] = Math.min(E.bigT[e], -eff.sec); }
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
  // Whoever was poked lays an egg, if she is somebody who lays (creatures.json `lays`). A row that lays ON a ground it
  // names (the fish's shallows, the frog's pads: design 19 G4) lays as she does by herself (layEgg, flag `worldLays`); her
  // poke lays past that, and design 18's hen fed from a food thing (`fed_hen_lays`) lays as it shipped (with the limits,
  // the eggs lying about in her world halved and the G3.4 fox took none in 15 min on 2 of 5 seeds: QUESTIONS Q50 G4).
  lay(w, row, eff) {
    const R = w.rx, E = w.E, byRow = row.trig !== TRIG.poke && row.b.terrain !== null;
    let n = 0;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (w.C.S[E.kind[e]].lays && layEgg(w, e, true, byRow)) n++; }
    return n;
  },
  // The thing that was met is that much nearer to hatching (an egg that is poked wobbles, and hurries).
  // Design 19 G5.14 (flag `hurryGrows`): and a thing that grows into a thing or into the ground (design 18 A12's sapling, G3.1's
  // bones, G5.13's molehill: `hatch: { sec, into }`) is hurried on its own clock, and grows as it would have by itself (update.js
  // hatch): bones a dung beetle walks onto are a meadow tile where the land may change, and elsewhere simply gone (land.js
  // groundMay: never her paint, the village's, the water or beside the one she named). It read `hatchSec`, which only an egg has,
  // so it set the clock to NaN and the thing never grew again; no row hurried one before the beetles ("The beetles cleaned the bones.").
  hurry(w, row, eff) {
    const s = w.rx.B.thing;
    if (!s || !s.def.hatch) return 0;
    s.cd = Math.min(w.R.flags.hurryGrows && typeof s.def.hatch === 'object' ? s.def.hatch.sec : s.def.hatchSec, s.cd + eff.sec);
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
    const any = !!w.R.flags.visitAny, toWater = eff.to === 'water', toThing = !!(eff.to && (eff.to.thing || eff.to.thingTag));
    // Design 19 F1 (the review of ead3b4f): a visit her FINGER set off on a thing goes to THAT thing, when it is one of
    // the things the visit goes to. Before this each one sent went to the such thing nearest to IT, and the search starts
    // one tile out, so with two benches in her village, poking one sent the person already sitting on it off to the
    // other, and the world said "They came over to rest a moment." (her world, three benches two tiles apart by her door,
    // by day every 15 s for 20 min, seeds 7 and 11: 58 of 87 and 52 of 88 people sent to a bench she had not poked;
    // dev/f1-pokes.mjs --benches 3). Somebody already standing on it has nowhere to go: it is
    // not sent, and with nobody else the row has changed nothing and says nothing (honest rows). Flag `visitPoked`.
    // (The search below is the ring search held to the one ring that holds that thing and to its one tile, so where
    // they stand when they get there is worked out exactly as for any other visit: beside it if it cannot be walked
    // through, three px into it if it can.)
    // Design 19, the review of F3.9 (flag `visitPlaced`): and a visit a PLACING set off goes to the thing she put down (the
    // placed row's A), when it is one of the things the visit goes to, as a poke's goes to the thing poked. Before this each
    // one sent went to the such thing nearest to IT: a campfire she lit sent the gentle ones to her pen's campfire whenever
    // they stood nearer that one (her world, 80 fires lit round her pen and meadow by day, seeds 7 and 11: 58 of 341 sent
    // walked AWAY from hers, up to 52 px), and a torch she lit sent 191 of 193 to some campfire (a `to: "fire"` visit only
    // ever knew the campfires, `w.fires`), while the world said "They gather round the fire." over her torch. A fire visit
    // knows a fire by its tag (compiled above), so her torch is somewhere it goes; a bench, a house, the dragon's gold the
    // same (the bench rows, the pets' new doorstep, the dragon's hoard).
    const placed = w.R.flags.visitPlaced && row.trig === TRIG.placed && R.A.thing && (toThing ? any : eff.to === 'fire') && visitsThing(w, eff, R.A.thing) ? R.A.thing : null;
    const own = (w.R.flags.visitPoked && any && toThing && row.trig === TRIG.poke && R.B.thing && visitsThing(w, eff, R.B.thing) ? R.B.thing : null) || (toThing ? placed : null);
    // Design 19, the review of F3.9 (flag `placedLetsSleep`): a thing put down never sends off whoever is asleep or on its
    // way to bed. The errand un-slept them (asleep() is a nap with no errand), they walked to her fire and fell asleep
    // again THERE, where favourite() writes the place the one she named sleeps: her named sheep asleep early in the
    // night 3 tiles from a campfire she lit, sent to it and asleep beside it on 5 of 6 nights (seeds 7 and 11, three
    // nights each: its place moved on one), her named cat on its way to bed turned to the fire on 4 of 6. The old cat
    // row's `follow` never took a sleeper; a visit did. Whoever is awake still comes (it is her hand, by night too).
    const letsSleep = w.R.flags.placedLetsSleep && row.trig === TRIG.placed;
    // Design 19 F3.4, the second review round (flag `errandKeeps`): the ground a creature steps onto never turns round one
    // that is already on its way somewhere. Its errand is why it is walking over that ground at all. Before this, a sheep
    // `sheep_snow_hay` had sent off for the hay ("The sheep went looking for somewhere warm.") stepped onto the next snow
    // tile on the way, got a huh and was sent back to the grass by `back_to_the_grass` (her world, seeds 7 11 1 2 3,
    // 30 min: 20 of the 40 sent; dev/f34-named.mjs hay), the same row answered its own walker again on every snow tile
    // of the walk back, and a cat on its way to a bench nap could be turned back too. An `enter` row still answers anybody who
    // walked onto that ground on its own. A fish on dry ground goes home whatever it was doing (`to: water` is left out).
    const keeps = w.R.flags.errandKeeps && row.trig === TRIG.enter && !toWater;
    // Design 19, the second review of F3.11 (flag `bedFromTree`): bedtime calls down one that climbed a tree. The bedtime
    // rows fire once, at the instant of dusk, and a visit passes over anyone up on a perch, so her named cat that went up a
    // tree from a wolf (F3.9's `cat_up_a_tree`, its 15 s) just before the sun set came down into a night with no bedtime and
    // wandered it: in her world with her named cat (dev/f311-nights.mjs, 24 seeds, three nights each) 4 of the 7 nights it
    // missed were a tree at dusk (2 of 6 with this review's other switches off). A climber (its way down is F3.9's
    // `climbsDown`) is sent to bed as anybody is, and its time up the tree ends now: it comes down on its side at the next
    // step and walks on to bed (with nowhere in reach to go, `orHere`, it falls asleep up its tree). Only a visit that puts
    // it to sleep (the bedtime rows); a flier's roost and the archer's tower are not a climb and are passed over, as ever.
    const bedDown = w.R.flags.bedFromTree && w.R.flags.climbsDown && row.trig === TRIG.clock && eff.then === 'sleep';
    // Design 19 G3.3 (flag `bedMidHop`): and bedtime takes one that is coming down from a small hop at that instant. A visit
    // passes over anyone in the air, so her named cat that pounced at a butterfly a fifth of a second before the sun set
    // had no bedtime that night and wandered it (her first world, seed 3: `the-one` went red when G3.3's rabbits, mice,
    // frogs and fish moved the world's stream; the fault is older). One coming down from a hop that is already lower than a
    // waking hop is as good as on the ground: it is sent to bed and walks there when it lands. The ones that woke
    // at this very light (asleep until dusk by its log: a raccoon) have their waking hop at exactly that height and are
    // left as they always were, so her named raccoon is not put back to bed at dusk. (freeFall 14 a second: a waking hop
    // is at its own height only on the step it woke.)
    const bedHop = w.R.flags.bedMidHop && row.trig === TRIG.clock && eff.then === 'sleep';
    let n = 0;
    // In the order they were born: the spatial hash hands a crowd back in an order a loaded world does not share,
    // and the cap below would then choose different creatures in the two.
    const T2 = R.targets, m = R.tN;
    for (let a = 1; a < m; a++) { const o = T2[a]; let b = a - 1; while (b >= 0 && E.id[T2[b]] > E.id[o]) { T2[b + 1] = T2[b]; b--; } T2[b + 1] = o; }
    for (let k = 0; k < R.tN && n < cap; k++) {
      const e = R.targets[k];
      const midHop = bedHop && E.alt[e] > 0 && E.alt[e] < w.R.react.wakeHop;
      if (E.inside[e] || (E.alt[e] > 0 && !midHop) || (E.perch[e] && !(bedDown && E.bounced[e] === CLIMBED)) || E.frozen[e] > 0 || E.goalKind[e] === 2 /* attacking */) continue;
      if (keeps && E.errT[e] > 0) continue; // on its way somewhere (or standing a moment where it was sent): not turned round
      if (letsSleep && E.sleepT[e] !== 0) continue; // asleep, or walking to bed (a nap set, an errand on): left alone
      const sp = w.C.S[E.kind[e]];
      if (any && R.claimStamp && R.claimed.length > e && R.claimed[e] === R.claimStamp) continue; // an earlier clock row has it (A1: first bedtime wins)
      // Not the hunters (a dawn that walks wolves and lambs to the same pond is a daily cull, the fault dawn_frost
      // was thrown out for), not monsters, not what flies or swims.
      // Design 18 A1: a SWIMMER is no longer skipped outright — it may be sent to liquid ground, and to nothing
      // else (the ring below refuses any tile that is not deep or shallow for it). The hunter rule is unchanged
      // and still belongs to `to: water` alone.
      if (sp.ufo || (!any && sp.water) || (eff.to === 'water' && (sp.fly || sp.enemy || sp.diet === 'carn' || sp.hunts === 'all'))) continue;
      // Design 19, the G4b review round (flag `flopReach`, launch above): a fish the hop home passed over (no water in a hop's
      // reach) is not sent on a walk it cannot finish before it dries. (One the hop took is in the air, and passed over above.)
      if (w.R.flags.flopReach && row.home && toWater && stranded(w, e)) continue;
      if (any && sp.water && toThing) continue; // a fish cannot go to a barn
      let bx = -1, by = -1, bd = r * r;
      // Design 18 A14: to the place it likes best. Only the one she NAMED has one, and only once it is sure of
      // it; anybody else, and anybody not sure yet, is left for the ordinary bedtime row further down the file.
      if (eff.to === 'fav') {
        if (!w.R.flags.favourites || E.favTile[e] < 0 || E.favN[e] < w.R.react.favWalk) continue;
        const ft = E.favTile[e], fx2 = (ft % w.cols) * T + 4, fy2 = ((ft / w.cols) | 0) * T + 5;
        const ddx = fx2 - E.x[e], ddy = fy2 - E.y[e];
        if (ddx * ddx + ddy * ddy > r * r) continue; // its place is too far off to walk to tonight
        bx = fx2; by = fy2; bd = ddx * ddx + ddy * ddy;
      }
      else if (eff.to === 'fire') {
        if (placed) { const f = placed, dx = f.tx * T + 4 - E.x[e], dy = f.ty * T + 4 - E.y[e], d = dx * dx + dy * dy; if (d < bd) { bd = d; bx = f.tx * T + 4 + (dx > 0 ? -7 : 7); by = f.ty * T + 6; } } // (hers, and only hers)
        else for (let q = 0; q < w.fires.length; q++) { const f = w.fires[q], dx = f.tx * T + 4 - E.x[e], dy = f.ty * T + 4 - E.y[e], d = dx * dx + dy * dy; if (d < bd) { bd = d; bx = f.tx * T + 4 + (dx > 0 ? -7 : 7); by = f.ty * T + 6; } }
      } else {
        // (Whole numbers throughout: this runs twice a day, so the engine never optimizes it, and unoptimized code
        // puts every fraction it touches on the heap. gc-check saw half a kilobyte a step from this loop alone.)
        const ex = E.x[e] | 0, ey = E.y[e] | 0, cx = (ex / T) | 0, cy = (ey / T) | 0, rt = Math.ceil(r / T) | 0, cols = w.cols | 0;
        let ibd = (r * r) | 0;
        // (the thing she poked: only its ring, and only its tile in it; standing on it already, ring 0, there is no ring
        // to search and it has nowhere to go, as below)
        const ox = own ? (own.tx - cx) | 0 : 0, oy = own ? (own.ty - cy) | 0 : 0;
        const r0 = own ? Math.max(Math.abs(ox), Math.abs(oy)) | 0 : 1, r1 = own ? r0 : rt;
        for (let ring = r0; ring >= 1 && ring <= r1 && bx < 0; ring++) for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx += (dy === -ring || dy === ring) ? 1 : 2 * ring) {
          if (own && (dx !== ox || dy !== oy)) continue;
          const tx = cx + dx, ty = cy + dy;
          if (tx < 0 || ty < 0 || tx >= cols || ty >= w.rows) continue;
          const i = ty * cols + tx, tt = w.C.TERR[w.terr[i]], st = w.grid[i];
          let ok = tt.deep === 1 || tt.shallow === 1 || (st && st.def.water);
          if (any && !toWater) { // design 18 A1: the ground she painted, or the thing she put down
            const ti = w.terr[i], tg = w.C.tags;
            ok = !!((eff.vTerr && eff.vTerr.has(ti)) ||
              (eff.vT0 !== undefined && (tg.terr0[ti] & eff.vT0) === eff.vT0 && (tg.terr1[ti] & eff.vT1) === eff.vT1) ||
              (st && visitsThing(w, eff, st)));
            if (ok && sp.water && !(tt.deep === 1 || tt.shallow === 1)) ok = false; // a swimmer goes to liquid ground only
          }
          if (!ok) continue;
          // A thing that cannot be walked through is stood BESIDE, on the visitor's side, as a campfire is.
          // Design 19, the second review of F3.11 (flag `homeBeside`): and so is a home the visitor may not go into, when it
          // is the thing she put down (pass() lets only people into a home). Her dog called to her new door was aimed 3 px
          // past the middle of the house, inside it: it walked into the wall, stood pressed to it until the steering gave
          // up, wandered off and came back, over and over, and its 8 s at the door (`pets_new_doorstep`'s hold) were
          // never seen: a dog 60 px off stood still at its place 0.7 to 2.5 s on 8 of 9 seeds, the same with a hold of 1 s
          // (dev/f311-hold.mjs). A barn at dusk, the old visits to a home, are left as they are.
          const blocks = any && st && (st.def.block || (placed && w.R.flags.homeBeside && st.def.home && E.kind[e] !== 'human'));
          const px = tx * T + 4, py = ty * T + 5, ddx = px - ex, ddy = py - ey, d = ddx * ddx + ddy * ddy;
          // And an errand calls itself arrived six px out (ai/decide.js B_ERRAND), which on an eight px tile can
          // leave a crab standing on the grass BESIDE the sand it was sent to. So the aim is three px past the
          // middle of the tile, away from the visitor: stopping six short of that still lands it in the tile.
          const ax = any && !blocks ? px + (ddx > 0 ? 3 : ddx < 0 ? -3 : 0) : px, ay = any && !blocks ? py + (ddy > 0 ? 3 : ddy < 0 ? -3 : 0) : py;
          if (d < ibd) { ibd = d; bx = blocks ? px + (ddx > 0 ? -7 : 7) : ax; by = blocks ? ty * T + 6 : ay; }
        }
        bd = ibd;
      }
      // Design 18 A5: with nowhere in reach and `orHere`, it does the `then` where it stands, so a world with no
      // barn in it still has sleeping sheep.
      if (bx < 0) {
        if (!(any && eff.orHere && eff.then === 'sleep' && sleepHere(w, e, eff, midHop))) continue; // (a climber with nowhere to go falls asleep up its tree)
        if (R.claimStamp && R.claimed.length > e) R.claimed[e] = R.claimStamp;
        n++;
        continue;
      }
      if (any && R.claimStamp && R.claimed.length > e) R.claimed[e] = R.claimStamp; // it is going somewhere: no later row sends it anywhere else
      // Long enough to walk there and stand a moment (never longer than visitMax). An errand, so it still sees the
      // wolf on the way; with the switch off, the old way: its thinking held for the length of the walk.
      const forSec = Math.min(w.R.react.visitMax, Math.sqrt(bd) / Math.max(4, sp.spd * w.C.mv[0]) + (eff.hold || w.R.react.visitSec));
      // Design 19 G4b (flag `visitEdge`): a place in the last column or row of the world is reached. The aim, three px past the
      // middle of the tile, was held 3 px inside the world, and an errand calls itself arrived six px out, so one sent to the
      // last column stopped on the tile before it: a turtle on the shallows beside a beach at the east edge stood at 375 px
      // at dusk, the sand begins at 376, and it laid nothing and slept on the shallows (S, M, L and XL alike; the west and
      // north edges the same). Held 1 px inside, it stops in the tile. Nobody stands there: setPos keeps them 3 px in.
      const mg = w.R.flags.visitEdge ? 1 : 3, gx = Math.max(mg, Math.min(w.W - mg, bx)), gy = Math.max(mg, Math.min(w.H - mg, by));
      if (w.R.flags.errands) errand(w, e, gx, gy, forSec);
      else { goalMove(w, e, gx, gy, 0); E.think[e] = forSec; }
      if (E.perch[e]) E.perchT[e] = 0; // (flag `bedFromTree`, above: only a climber at bedtime gets here up a tree; it comes down first)
      // Design 19, the review of F3.11 (flag `placedCalls`): a thing put down calls whoever it sends away from whoever they
      // were following. A follow scores 70 and an errand 22 (ai/decide.js), so a pet keeping the flock company (F3.3's
      // `pets_and_the_flock`, design 17's `a_dog_and_a_lamb`) or a cat after a bug went on following and never came, while
      // the world said "The pets come to see the new door.": her world, a dog and a cat by her house and 96 houses she put
      // down 3 to 7 tiles from one by day, 24 of the 90 pets sent never got any nearer the door, every one of them following
      // a sheep, a person, a bug or the other pet, and 28 of 45 sentences printed with no pet at the door (dev/f311-door.mjs).
      // The follow ends; a row that meets them again later starts a new one.
      if (w.R.flags.placedCalls && row.trig === TRIG.placed) { E.fol[e] = 0; E.folT[e] = 0; }
      if (eff.calm) E.calm[e] = Math.max(E.calm[e], eff.calm); // the truce of the waterhole: nobody hunts on the way to a drink
      // And it goes to sleep when it gets there (design 18 A5): the nap is set now and takes hold when the
      // errand ends, which is the walk to the barn and then the sleeping in it, told with one field.
      if (eff.then === 'sleep') sleepHere(w, e, eff, midHop);
      n++;
    }
    return n;
  },
  // Design 19 A5 (LAND-ENGINE §6, flag `migrate`): a herd sets off together for ground it can live on, IN A LINE. A visit and a
  // follow in one. Who goes is whoever a visit would send (not indoors or held, high in the air, up a perch, held still, in a
  // fight) and is awake: one asleep or on its way to bed is left to sleep (a sleeper follows nobody, so the line would set off
  // without it). Never the UFO, and never a swimmer: a fish cannot walk to the next pond, and a line of them would press on the
  // shore. In the order they were born, the LEADER is the one she named, else the oldest, and the one she named is never left
  // behind: when it is in the herd and cannot go now, nobody goes. The leader's nearest tile of `to` (the places a visit's `to`
  // names, compiled the same), by ring scan as far as `r`, the whole map when the row says nothing: with none, or one within
  // `minTiles`, the row steps aside (the ground they want is next door, and that is grazing, not a migration), changing nothing
  // and saying nothing (honest rows). The leader walks there on an errand (it still sees a wolf on the way, and picks the walk
  // up again after) for the walk and the row's `hold` s more, never longer than rules.react.migrateMax, and stops following
  // whoever it followed. The rest walk behind it ONE AFTER ANOTHER, the one nearest the leader first, each following the one in
  // front of it for as long (a `follow` makes a ball round one leader; this makes a string of sheep), and all of them start
  // now. The hold is how long the line has to come up behind the leader: on the way a line stretches about a tile and a half a
  // sheep, and when the follow ends each one stays where it stands (with a visit's 3 s the tail of eight stopped about ten tiles
  // short: validate-data asks every row for its hold). At most visitCap of them, and the one she named always. (A migration is
  // an errand: with design 17's `errands` off there is none.)
  migrate(w, row, eff) {
    if (!w.R.flags.migrate || !w.R.flags.errands) return 0;
    const R = w.rx, E = w.E, T = w.T, L = R.line, T2 = R.targets, m = R.tN, cols = w.cols | 0, rws = w.rows | 0, tg = w.C.tags;
    for (let a = 1; a < m; a++) { const o = T2[a]; let b = a - 1; while (b >= 0 && E.id[T2[b]] > E.id[o]) { T2[b + 1] = T2[b]; b--; } T2[b + 1] = o; }
    // (Coming down from a small hop is as good as on the ground, as at bedtime (visit, flag bedMidHop): every sleeper wakes at
    // first light with a waking hop, so a dawn migration would otherwise take nobody who slept the night.)
    let n = 0, li = -1;
    for (let k = 0; k < m; k++) {
      const e = T2[k], sp = w.C.S[E.kind[e]];
      if (sp.ufo || sp.water) continue;
      if (E.inside[e] || E.dead[e] || E.alt[e] > w.R.react.wakeHop || E.perch[e] || E.frozen[e] > 0 || E.goalKind[e] === 2 /* attacking */ || E.sleepT[e] !== 0 ||
        (R.claimStamp && R.claimed.length > e && R.claimed[e] === R.claimStamp)) {
        if (E.named[e]) return 0; // the one she named cannot go now: nobody leaves it behind
        continue;
      }
      if (li < 0 && E.named[e]) li = n;
      L[n++] = e;
    }
    if (!n) return 0;
    if (li < 0) li = 0;
    const e0 = L[li]; // the leader to the front, the rest still in the order they were born
    for (let k = li; k > 0; k--) L[k] = L[k - 1];
    L[0] = e0;
    // Its nearest place, found as a visit finds one. (Whole numbers throughout: this runs rarely, so the engine never optimizes
    // it, and unoptimized code puts every fraction it touches on the heap.)
    const ex = E.x[e0] | 0, ey = E.y[e0] | 0, cx = (ex / T) | 0, cy = (ey / T) | 0;
    const rr = (eff.r > 0 ? Math.min(eff.r, w.W + w.H) : w.W + w.H) | 0, rt = Math.min(Math.ceil(rr / T) | 0, Math.max(cols, rws)) | 0; // (no tile is further than that)
    let ibd = (rr * rr) | 0, bx = -1, by = -1, ring0 = -1;
    for (let ring = 0; ring <= rt && bx < 0; ring++) for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx += (dy === -ring || dy === ring) ? 1 : 2 * ring) {
      const tx = cx + dx, ty = cy + dy;
      if (tx < 0 || ty < 0 || tx >= cols || ty >= rws) continue;
      const i = ty * cols + tx, ti = w.terr[i], st = w.grid[i];
      if (!((eff.vTerr && eff.vTerr.has(ti)) ||
        (eff.vT0 !== undefined && (tg.terr0[ti] & eff.vT0) === eff.vT0 && (tg.terr1[ti] & eff.vT1) === eff.vT1) ||
        (st && visitsThing(w, eff, st)))) continue;
      // Where it stands when it gets there, as for a visit: beside a thing that cannot be walked through, on its own side, and
      // otherwise three px past the middle of the tile, away from where it set out (an errand calls itself arrived six px out).
      const blocks = st && st.def.block, px = tx * T + 4, py = ty * T + 5, ddx = px - ex, ddy = py - ey, d = ddx * ddx + ddy * ddy;
      if (d < ibd) { ibd = d; ring0 = ring; bx = blocks ? px + (ddx > 0 ? -7 : 7) : px + (ddx > 0 ? 3 : ddx < 0 ? -3 : 0); by = blocks ? ty * T + 6 : py + (ddy > 0 ? 3 : ddy < 0 ? -3 : 0); }
    }
    if (bx < 0 || ring0 < eff.minTiles) return 0; // nowhere to go, or the ground they want is next door: grazing, not a migration
    // The line: nearest the leader first (ties in the order they were born). Each distance read once: a position is a fraction.
    const LD = R.lineD;
    for (let k = 1; k < n; k++) { const o = L[k], ox = (E.x[o] | 0) - ex, oy = (E.y[o] | 0) - ey; LD[k] = ox * ox + oy * oy; }
    for (let a = 2; a < n; a++) {
      const o = L[a], d = LD[a];
      let b = a - 1;
      while (b >= 1 && LD[b] > d) { L[b + 1] = L[b]; LD[b + 1] = LD[b]; b--; }
      L[b + 1] = o; LD[b + 1] = d;
    }
    const sec = Math.min(w.R.react.migrateMax, Math.sqrt(ibd) / Math.max(4, w.C.S[E.kind[e0]].spd * w.C.mv[0]) + eff.hold);
    const mg = w.R.flags.visitEdge ? 1 : 3, gx = Math.max(mg, Math.min(w.W - mg, bx)), gy = Math.max(mg, Math.min(w.H - mg, by));
    E.fol[e0] = 0; E.folT[e0] = 0; // (a follow scores over an errand: the leader follows nobody now)
    errand(w, e0, gx, gy, sec);
    if (R.claimStamp && R.claimed.length > e0) R.claimed[e0] = R.claimStamp; // (a clock row's: no later row sends it anywhere else)
    let went = 1, prev = e0;
    for (let k = 1; k < n; k++) {
      const e = L[k];
      if (went >= w.R.react.visitCap && !E.named[e]) continue;
      E.fol[e] = w.slotH[prev]; E.folT[e] = sec; E.think[e] = 0;
      // Design 19 E1 + E2 (flag `lineErrands`): and each one in the line is on its way there too, for as long. A follow scores 70
      // and an errand 22, so the line is the line; but one on its way somewhere passes the others by (errandNoFollow, errandKeeps)
      // and goes on to the place when the line breaks. With only the follow, her world took the line apart: a duck walking to the
      // other pond met a sheep and went where the flock went (hen_and_the_flock, 8 s), and the ducks behind it followed it off.
      // Her first world, a puddle ten tiles from her pond drying under three ducks (dev/e1-e2-herds.mjs --scene ducks, seeds 1 to
      // 8, minute 20, E2's hold 45): every one in the line got into the pond on 3 of 8 with the follow alone, 7 of 8 with this.
      if (w.R.flags.lineErrands) errand(w, e, gx, gy, sec);
      if (R.claimStamp && R.claimed.length > e) R.claimed[e] = R.claimStamp;
      prev = e; went++;
    }
    return went;
  },
  // Asleep (design 18 A5). `sec`, or `until: "dawn"` or `"dusk"`. It stays where it is and stops grazing, herding
  // and wandering, and its EYES STAY OPEN: the threat scan runs as it does awake and it is up and running before
  // anything it would run from arrives (ai/decide.js; the law is that a blind walk is a cull).
  // Never anybody RUNNING (a nap in the middle of that is the cull the law is about), in the air, indoors, or a
  // giant. Anybody FIGHTING may be: the design's never-list says otherwise and the pillow is the reason it does
  // not (QUESTIONS Q34) — every creature a blow lands on is fighting or running by then, so with `fighting` in
  // the list `pillow_sleepy` matched twelve times and put nobody to sleep. What that word protected is kept by
  // the two laws either side of it: a blow wakes whoever it lands on, and a sleeper wakes at its next think if
  // it would run.
  sleep(w, row, eff) {
    if (!w.R.flags.sleeps) return 0;
    const R = w.rx, E = w.E;
    const until = eff.until === 'dawn' ? SLEEP_DAWN : eff.until === 'dusk' ? SLEEP_DUSK : eff.sec > 0 ? eff.sec : 0;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.dead[e] || E.inside[e] || E.alt[e] > 0 || E.bigT[e] > 0) continue;
      if (E.beh[e] === 1 /* B_FLEE */) continue;
      if (E.sleepT[e] === until) continue; // already sleeping exactly this sleep: nothing changed
      E.sleepT[e] = until;
      E.goalKind[e] = G_NONE; E.think[e] = 0; E.errT[e] = 0; // it is here, and it stays here
      favourite(w, e); // design 18 A14: it fell asleep HERE
      if (e === R.thinker) R.took = true;
      n++;
    }
    return n;
  },
  // Something is put ON somebody (design 18 A9): a lamp handed round a village, a party hat, the crown a crow
  // takes off a head. It goes through the same one rule the Hand's own give uses (content.js equipOn), so who
  // can wear what is one rule; a slot that is already full means the row changed nothing and steps aside, and
  // the Hand stays the only one that may swap what she has already put on somebody.
  // It raises `equip`, so a village that finds a lute calms the monsters at its gate without a line of code.
  give(w, row, eff) {
    if (!w.R.flags.gives) return 0;
    const R = w.rx, E = w.E;
    // `from`: what one of the two is WEARING moves onto the other (the crow and the shiny thing).
    if (eff.from) {
      const from = eff.from === 'a' ? R.A : R.B, to = eff.from === 'a' ? R.B : R.A;
      if (from.e < 0 || to.e < 0 || E.dead[from.e] || E.dead[to.e]) return 0;
      const g = E.gear[from.e], v = g[eff.slot];
      if (!v) return 0;
      const id = typeof v === 'string' ? v : eff.slot;
      if (!equipOn(w, to.e, id, false)) return 0;
      g[eff.slot] = 0;
      rebuildGear(w, from.e);
      reactEquip(w, to.e, id);
      return 1;
    }
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.dead[e] || E.inside[e]) continue;
      // `any`: the world picks one, on its own stream, so a replay hands out the same things.
      const id = eff.item || (eff.any && eff.any.length ? eff.any[Math.floor(w.rng.float() * eff.any.length) % eff.any.length] : null);
      if (!id || !equipOn(w, e, id, false)) continue;
      n++;
      reactEquip(w, e, id);
      if (n === eff.max) break; // (design 18 E4: a party hands out three hats, not one each)
    }
    return n;
  },
  // Back to whatever it was before something changed it (design 18 A13). Her undo for the whole design: the
  // moon's panther, the frog in the crown, the slime that caught fire, the wolf under the full moon. It clears
  // the memory, so Bless twice is not Bless and then Bless again.
  revert(w, row, eff) {
    if (!w.R.flags.reverts) return 0;
    const R = w.rx, E = w.E, C = w.C;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k], was = E.was[e];
      if (!was || !C.S[was] || E.kind[e] === was) continue;
      const hp = E.hp[e], max = C.S[E.kind[e]].hp, from = E.kind[e];
      E.kind[e] = was;
      E.hp[e] = Math.max(1, (hp / max) * C.S[was].hp);
      E.was[e] = '';
      w.kindCount[C.kid[from]]--;
      w.kindCount[C.kid[was]]++;
      if (from === 'human' || was === 'human') { // the list of people follows it across, as `become` keeps it
        let h = 0;
        for (let j = 0; j < w.count; j++) if (E.kind[w.order[j]] === 'human') w.humans[h++] = w.order[j];
        w.nHumans = h;
      }
      addFx(w, 'magic', E.x[e], E.y[e], w.R.fx.heart);
      n++;
    }
    return n;
  },
  // Gone, with a small puff (design 18 A7). It is NOT a death: no bones, no grave, no "somebody was lost", and
  // the village learns nothing from it, because the only things that leave this way are the small visitors of
  // the night and the day (the fireflies at dawn, the bees at dusk). It refuses anybody the child named, anybody
  // wearing or holding anything, anybody indoors, a giant, and anybody something has changed: each of those is
  // somebody she would look for again.
  vanish(w, row, eff) {
    if (!w.R.flags.vanish) return 0;
    const R = w.rx, E = w.E;
    let n = 0;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.dead[e] || E.named[e] || E.inside[e] || E.bigT[e] > 0 || E.was[e] || hasOn(w, e)) continue;
      addFx(w, 'magic', E.x[e], E.y[e] - 4, w.R.fx.heart);
      E.dead[e] = true; // swept at the end of the step (ents.js compact), the way the eraser does it
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
    const claimed = (e) => w.R.flags.visitAny && R.claimStamp && R.claimed.length > e && R.claimed[e] === R.claimStamp; // A1: first bedtime wins
    // Design 19, the review of F3.9 (flag `perchClimbs`): one on its own feet that goes up something because of whom it met
    // or what it walked onto (a meet or an enter row, no `alt`: not a bounce, not a flight) CLIMBS, and climbing is walking.
    // As built the search ran from where the two met, which on a meet row is the OTHER one: the cat met a wolf and went up
    // the tree nearest the WOLF (with a tree 30 px behind the cat and one 45 px past the wolf it went 48 px, past the wolf;
    // one 56 px behind it, 70 from the wolf, was out of reach), and setPos carried it over whatever lay between: her named
    // cat in her closed pen, a wolf outside the fence and a tree outside, went up that tree and came down OUTSIDE her pen
    // (3 of 3 seeds), the F3.7 skid's fault again. Now each climber searches from where IT stands, and only a perch it could
    // walk to: every tile of the straight way there (not its own, not the perch's) asked as a step asks it (fence, wall,
    // deep water, rock: shut). And (the review) `to` holds it to what the row names: the cat up a TREE, not a bench or a well.
    // (`to` is a climb's alone: the validator refuses it on a flight or a bounce, which go up whatever is nearest; with the
    // switch off a climb is the old search too, and `to` is not read.)
    if (w.R.flags.perchClimbs && !eff.alt && (row.trig === TRIG.meet || row.trig === TRIG.enter)) return climb(w, eff);
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
      for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (E.inside[e] || E.perch[e] || claimed(e)) continue; E.alt[e] = eff.alt; E.chute[e] = !!w.C.S[E.kind[e]].humanoid; E.goalKind[e] = G_NONE; if (R.claimStamp && R.claimed.length > e) R.claimed[e] = R.claimStamp; n++; }
      return n;
    }
    // (flag `worldHopNoBeam`, the deploy line 2b look: and the birds going up to roost at dusk, the owls and the bats at first
    // light, and the ducks onto a roof the village has just built go up with no UFO beam: a clock row's roost and a placed
    // one's are the world's own, as its hops are in `launch`. In her untouched half hour, seeds 7 and 11, 140 and 112 beams
    // under sparrows going up to roost, 24 and 26 under owls (up at dusk, to roost at first light) and 27 and 22 under ducks
    // onto a new roof, now none; dev/deploy2b-beams.mjs)
    const beam = !(w.R.flags.worldHopNoBeam && (row.trig === TRIG.clock || row.trig === TRIG.placed));
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e] || E.perch[e] || claimed(e)) continue;
      n++;
      if (R.claimStamp && R.claimed.length > e) R.claimed[e] = R.claimStamp;
      E.perch[e] = best.h; E.perchT[e] = U.perchSec; E.alt[e] = 0; E.chute[e] = false; E.goalKind[e] = G_NONE;
      setPos(w, e, best.tx * T + 4, best.ty * T + 6);
      best.manned = U.perchSec;
      emitAt(w, EVI.perch, e);
      if (beam) addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop);
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
    if (w.R.flags.sleeps) wake(w, e, false); // design 18 A5: standing in fire wakes it, whatever the harm table then does
    const dmg = allowed(w, e, SRC.reaction, F.dps * dt);
    if (dmg > 0) { E.hp[e] -= dmg; E.flash[e] = w.R.fx.hazardFlash; }
  }
}
