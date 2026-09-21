// One simulation step of dt seconds: the prototype's update().
import { rnd, pick2 } from './rng.js';
import { hyp, dsin, clamp } from './math.js';
import { log, ref, markDirty, tileOf, struct, flies, swims, inWater, reach, dist, isNight, removeStruct, onFlowers, setTerrain, speciesCapOf } from './world.js';
import { spawn, breedCdOf, ent, compact, HELD, G_MOVE, G_ATTACK, G_ABDUCT, G_GRAZE, G_BUSH, G_HOUSE, G_MATE, G_JOIN, G_FETCH, G_STORE, G_BUILD, G_TAKE, G_CARE, G_WATER, G_DOUSE } from './ents.js';
import { nearestAt, findStruct } from './query.js';
import { die, hurt, hit, isFoe, meal } from './combat.js';
import { decide } from './ai/decide.js';
import { step, servePaths } from './ai/move.js';
import { MV_WALK, MV_RUN, MV_CHASE, MV_ABDUCT, MV_GRAZE, MV_FOOD, MV_HOME, MV_MATE } from './content.js';
import { drop, land } from './ai/ufo.js';
import { addFx, ageFx } from './fx.js';
import { setPos, gather, gatherAny } from './spatial.js';
import { allowed, effect, mark, SRC, WARN, NONE } from './harm.js';
import { emit, emitAt, EVI } from './events.js';
import { story, storyOf, STI, NO, kindIcon } from './story.js';
import { reactPlaced, reactPower, layEgg } from './reactions.js';
import { fireTick, reactEnter, reactClock, reactBeam } from './reactions.js';
import { villageTick, finishBuild , equipVillager } from './village.js';
import { command } from './commands.js';

const fFoe = (w, e, o) => isFoe(w, o); // what archer towers shoot
const sTower = (s) => s.def.shoot; // what a parachuting human steers to

// One step. Creatures are slots (ents.js); the loops run over w.order, the spawn order, re-reading w.count
// so a creature born this step is updated this step too, as in the prototype (PLAN fact F1).
export function update(w, dt) {
  const C = w.C, S = C.S, R = w.R, T = w.T, tid = C.tid, E = w.E;
  w.time += dt;
  w.dt = dt;
  const night = isNight(w);
  // Reactions (14 §5): the clock trigger fires once when the light changes, never every tick; then fire burns,
  // spreads, goes out in rain and grows back.
  if (w.rx.wasNight === undefined) w.rx.wasNight = night;
  if (night !== w.rx.wasNight) { w.rx.wasNight = night; reactClock(w, night ? 'dusk' : 'dawn'); if (!night) visitor(w); }
  fireTick(w, dt);
  stormTick(w, dt);
  villageTick(w, dt); // the village's job board (14 §7 item 13)

  // Eaten grass regrows: the listed tiles only (the same countdown per tile as sweeping every tile; only the
  // order the renderer hears about regrown tiles in changes).
  const eaten = w.eaten, list = w.eatenList, inList = w.eatenIn;
  let ne = 0;
  for (let k = 0; k < w.eatenN; k++) {
    const i = list[k];
    if (eaten[i] > 0) {
      eaten[i] -= dt;
      if (eaten[i] <= 0) { eaten[i] = 0; markDirty(w, i); inList[i] = 0; continue; }
      list[ne++] = i;
    } else inList[i] = 0; // zeroed by Rain or new terrain since it was listed
  }
  w.eatenN = ne;

  // Things: food regrows, archer towers shoot.
  const TW = R.tower;
  const structs = w.structs;
  for (let k = 0; k < structs.length; k++) {
    const s = structs[k];
    if (s.def.food && s.food < R.food.max && (!s.def.dock || byWater(w, s))) s.food += dt / R.food.regrowSec; // (a dock fills only beside water)
    if (s.def.hatch && R.flags.eggs && !s.cooked) { // design 17: an egg, on its own clock (saved and hashed as every thing's cd is)
      s.cd += dt;
      if (s.cd >= s.def.hatchSec) { if (hatch(w, s)) k--; else s.cd = s.def.hatchSec - 5; } // no room for another yet: it waits and tries again
    }
    if (s.def.shoot) {
      s.cd -= dt;
      if (s.manned > 0) s.manned -= dt;
      if (s.cd <= 0) {
        s.cd = TW.scanCd;
        const cx = s.tx * T + 4, cy = s.ty * T + 4;
        w.qp[0] = cx; w.qp[1] = cy;
        const t = nearestAt(w, -1, TW.range, fFoe);
        if (t >= 0) {
          s.cd = s.manned > 0 ? TW.mannedCd : TW.cd;
          const a = addFx(w, 'arrow', cx, cy - 3, R.fx.arrow); a.x2 = E.x[t]; a.y2 = E.y[t] - 4;
          emit(w, EVI.shot, cx, cy, -1);
          hurt(w, t, TW.dmg);
          if (E.hp[t] <= 0) die(w, t, 'tower');
        }
      }
    }
  }

  servePaths(w); // last step's path requests, at most rules.path.perTick searches (ai/move.js)
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (!E.dead[e]) creature(w, e, dt, night);
  }

  // Tornadoes wander, fling and hurt whatever they touch.
  const TP = C.P.twister, tws = w.twisters;
  for (let q = 0; q < tws.length; q++) {
    const tw = tws[q];
    tw.t -= dt;
    if (w.rng.float() < TP.turnChance) { tw.vx = rnd(w, -TP.speed, TP.speed); tw.vy = rnd(w, -TP.speed, TP.speed); }
    tw.x = clamp(4, w.W - 4, tw.x + tw.vx * dt); tw.y = clamp(4, w.H - 4, tw.y + tw.vy * dt);
    // Everyone within reach, in spawn order (each fling draws two random numbers). A fling moves only the
    // creature flung, so gathering first finds the same creatures the prototype's loop did.
    const n = gather(w, tw.x, tw.y, TP.radius), near = w.near;
    for (let k = 0; k < n; k++) {
      const e = near[k];
      if (!(!E.dead[e] && !E.inside[e] && hyp(E.x[e] - tw.x, E.y[e] - tw.y) < TP.radius)) continue;
      const fx = clamp(2, w.W - 2, E.x[e] + rnd(w, -TP.throwSpeed, TP.throwSpeed) * dt); // x's draw first, as before
      setPos(w, e, fx, clamp(2, w.H - 2, E.y[e] + rnd(w, -TP.throwSpeed, TP.throwSpeed) * dt));
      if (!(E.bless[e] > 0)) { E.hp[e] -= allowed(w, e, SRC.power, TP.dps * dt); E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) die(w, e, 'tornado'); }
    }
  }
  let nt = 0;
  for (let k = 0; k < tws.length; k++) if (tws[k].t > 0) tws[nt++] = tws[k];
  if (nt < tws.length) tws.length = nt; // only when a tornado ends
  if (w.rainT > 0) w.rainT -= dt;
  if (w.shake > 0) w.shake -= dt;
  enteredSweep(w); // design 14 §5: whoever really changed tile this step, however they were moved
  compact(w);
  ageFx(w, dt);
}

// One creature's step: needs, then the one state it is in (aboard a UFO, falling, perched, at home), then
// hazards, healing, deciding and its goal. Each state and goal is a small function of its own, so the
// engine optimizes this after a few thousand calls and the first time a rare path runs it costs only that
// path's function its optimized code. Helpers read the step length from w.dt: a number passed as an
// argument to a function that is not inlined gets boxed (M1-1 slice 5).
export function creature(w, e, dt, night) {
  const C = w.C, R = w.R, E = w.E, N = R.needs;
  if (E.inside[e] === HELD) return; // in the player's hand: time stands still for it
  const kind = E.kind[e], sp = C.S[kind];
  E.cd[e] -= dt; E.breedCd[e] -= dt; E.flash[e] -= dt; E.think[e] -= dt;
  if (E.calm[e] > 0) E.calm[e] -= dt;
  if (E.folT[e] > 0) { E.folT[e] -= dt; if (E.folT[e] <= 0) E.fol[e] = 0; }
  if (E.baby[e] && w.time - E.born[e] > R.breed.babySec) E.baby[e] = false;
  const k = tileOf(w, e), t = k < 0 ? -1 : w.terr[k], wet = inWater(w, e), cold = (C.TERR[t] || {}).cold && !sp.snow; // t: terrAt()
  E.hunger[e] = Math.min(N.hungerMax, E.hunger[e] + sp.hr * dt * (cold ? N.coldHunger : 1) * (E.inside[e] ? N.insideHunger : 1));
  if (wet && (sp.diet === 'filter' || (sp.amph && sp.diet === 'herb'))) E.hunger[e] = Math.max(0, E.hunger[e] - N.filterFeed * dt);
  if (kind === 'human' && E.hunger[e] > N.humanHungerCap) E.hunger[e] = N.humanHungerCap;
  if (E.satedT[e] > 0) E.satedT[e] = Math.max(0, E.satedT[e] - dt); // design 15 B1: the rest after a meal
  // Design 17: a hen lays by herself now and then, which is the accident path for eggs (no nest needed). Each on
  // her own clock, from the world's tick and her own id, so it needs no timer of its own and no save.
  if (sp.lays && R.flags.eggs && !E.baby[e] && !E.inside[e] && (w.tick + E.id[e] * 131) % w.layEvery === 0) layEgg(w, e, false);
  if (E.bigT[e] > 0) { // design 17: a giant, until it is not. It goes back with a puff.
    E.bigT[e] -= dt;
    if (E.bigT[e] <= 0) { E.bigT[e] = 0; if (!E.inside[e]) { addFx(w, 'magic', E.x[e], E.y[e] - 4, R.fx.heart); emitAt(w, EVI.land, e); log(w, 'log.shrank', { a: ref(w, e) }); } }
  }
  // Design 15 C1: big feet flatten a field back to bare drills.
  if (R.flags.crops && sp.size === 'big' && k >= 0 && C.TERR[t].trample !== undefined && w.terr[k] !== C.tid[C.TERR[t].trample]) {
    setTerrain(w, k % w.cols, (k / w.cols) | 0, C.tid[C.TERR[t].trample]);
  }
  // An empty belly takes the same time to kill whatever the creature is (needs.starveSec). The old flat rate
  // killed a creature in its own hp in seconds, so an owl starved in six and a dragon in eighty. Gentle: never (harm.js).
  if (E.hunger[e] >= N.hungerMax) { E.hp[e] -= allowed(w, e, SRC.need, (R.flags.hungerFair ? sp.hp / N.starveSec : N.starveDps) * dt); if (E.hp[e] <= 0) { die(w, e, 'starved'); return; } }
  if (sp.ufo) ufoCarry(w, e);
  if (E.inside[e] < 0) { aboard(w, e); return; } // carried by a UFO
  if (E.alt[e] > 0) { falling(w, e); return; }
  if (E.perch[e] && perched(w, e)) return;
  if (E.inside[e]) { atHome(w, e, night); return; } // in a house
  if (!flies(w, e) && hazards(w, e, t, wet)) return; // died
  const G = E.gear[e];
  if (E.hp[e] < sp.hp && (E.hunger[e] < R.regen.hungerBelow || G.amulet)) E.hp[e] = Math.min(sp.hp, E.hp[e] + (G.amulet ? R.regen.amulet : R.regen.rate) * dt);
  if (sp.heals) heal(w, e);
  if (E.bless[e] > 0) E.bless[e] -= dt;
  if (E.frozen[e] > 0) { E.frozen[e] -= dt; return; }
  // Staggered thinking (01 §6, M1-3): a creature decides only on its own step of every thinkEvery (offset by
  // its id, so the load is spread evenly), and only once its think timer has run out (the prototype's
  // rhythms: wander 1 to 3 s, idle, eating). "Decide again at once" means at its next own step.
  if (E.think[e] <= 0 && (w.tick + E.id[e]) % R.ai.thinkEvery === 0) decide(w, e);
  const gk = E.goalKind[e];
  if (gk) {
    if (gk === G_MOVE) goMove(w, e);
    else if (gk === G_ATTACK) goAttack(w, e);
    else if (gk === G_ABDUCT) goAbduct(w, e);
    else if (gk === G_GRAZE) goGraze(w, e);
    else if (gk === G_BUSH) goBush(w, e);
    else if (gk === G_HOUSE) goHouse(w, e);
    else if (gk === G_MATE) goMate(w, e);
    else if (gk === G_JOIN) goJoin(w, e);
    else if (gk === G_FETCH) goFetch(w, e);
    else if (gk === G_STORE) goStore(w, e);
    else if (gk === G_BUILD) goBuild(w, e);
    else if (gk === G_TAKE) goTake(w, e);
    else if (gk === G_CARE) goCare(w, e);
    else if (gk === G_WATER) goWater(w, e);
    else if (gk === G_DOUSE) goDouse(w, e);
  }
}

// The enter trigger (design 14 §5), in one sweep after everything that moves a creature has moved it: its own
// step, a tornado's fling, the crowd pushing it apart. One place, in spawn order, so it is deterministic, and it
// fires only when the feet really changed tile. The tile each creature stood on is scratch, never saved; a loaded
// world rebuilds it from where everyone is standing (save.js), so nothing fires just because a world was opened.
export function enteredSweep(w) {
  const R = w.rx, E = w.E;
  if (!R.R.idx[1].n) return; // TRIG.enter
  if (R.lastTile.length < w.cap) {
    const bigger = new Int32Array(w.cap);
    bigger.fill(-1);
    bigger.set(R.lastTile);
    R.lastTile = bigger;
  }
  const last = R.lastTile, T = w.T, cols = w.cols;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (E.dead[e]) continue;
    // Written out rather than tileOf(w, e): this runs for every creature on every step, and the call plus the
    // divisions showed in the 2,000 creature bench.
    const x = E.x[e], y = E.y[e];
    if (x < 0 || y < 0 || x >= w.W || y >= w.H) continue;
    const i = ((y / T) | 0) * cols + ((x / T) | 0);
    // Indoors, aboard a UFO or in the air, nothing is entered — but the mark still follows the creature, so
    // that it means the same thing as the one a loaded world rebuilds from where everybody is standing. It did
    // not, and a world saved while a pig was in a house then played on differently (found by save-check's
    // play-on once a row fired on ordinary ground; design 15 C1's pig in the mud).
    // flags.landIsArriving: clearing the mark while a creature is off the ground makes coming down count as
    // ARRIVING, so a cow flung onto a cactus, into a pond or onto another catapult sets off what standing there
    // would, and a chain can run THROUGH a landing. It was parked off on Sep 20 because a saved world played on
    // differently with it on. That was never this line's fault: see the note after reactEnter below, and
    // tools/land-fuzz.mjs, which is the gate for it.
    if (E.inside[e] || E.alt[e] > 0) { last[e] = w.R.flags.landIsArriving && !E.inside[e] ? -1 : i; continue; }
    if (i === last[e]) continue;
    R.landing = last[e] === -1 && w.R.flags.landIsArriving; // it came down out of the air (a row may ask: needs.landing)
    last[e] = i;
    reactEnter(w, e, i);
    R.landing = false;
    // What it walked into may have MOVED it (a bounce pad throws somebody up onto a roost; a catapult flings a
    // cow two tiles along). The mark was written before that, so it still named the tile it left, and the next
    // sweep then raised an `enter` for wherever it had been put, as if it had walked there. A world saved in
    // that one step rebuilt the mark from where the creature was standing (markTiles) and raised nothing, so the
    // saved world played on differently: a human thrown onto a cactus said "ouch" in the world that kept
    // running and not in the one that was loaded. THIS is the divergence that parked landIsArriving on Sep 20
    // (it makes landings, so it makes this far more often), found on Sep 21 by saving a world full of bounce
    // pads every 90 steps. The mark is the tile the creature is on when the sweep leaves it, which is exactly
    // what a loaded world rebuilds.
    if (w.R.flags.markAfter) {
      const x2 = E.x[e], y2 = E.y[e];
      if (x2 >= 0 && y2 >= 0 && x2 < w.W && y2 < w.H) last[e] = E.alt[e] > 0 && w.R.flags.landIsArriving && !E.inside[e] ? -1 : ((y2 / T) | 0) * cols + ((x2 / T) | 0);
    }
  }
}

// An egg hatches into a baby of whoever laid it (design 17). Returns true when it did (the thing is gone).
function hatch(w, s) {
  const C = w.C, kind = s.who > 0 && C.kinds[s.who - 1] ? C.kinds[s.who - 1] : s.def.hatch;
  // Eggs wait while there are already plenty (rules.react.layCap, far under the species cap: sixty chickens in a
  // six tile pen is soup). It never vanishes: it sits there, and hatches when there is room.
  if (w.count >= w.R.breed.popCap || w.kindCount[C.kid[kind]] >= Math.min(w.R.react.layCap, speciesCapOf(w))) return false;
  const x = s.tx * w.T + 4, y = s.ty * w.T + 6;
  removeStruct(w, s.tx, s.ty);
  const b = spawn(w, kind, x, y, true);
  if (b < 0) return true;
  w.E.hunger[b] = w.R.breed.babyHunger;
  addFx(w, 'heart', x, y - 8, w.R.fx.heart);
  emitAt(w, EVI.birth, b);
  log(w, s.name ? 'log.hatchedNamed' : 'log.hatched', { kind, name: s.name });
  story(w, STI.birth, x, y, b, -1, -1, C.iconOf['thing:egg'] === undefined ? NO : C.iconOf['thing:egg'], NO, kindIcon(w, b), w.lastLog);
  return true;
}
// Is there water (deep, shallow) on any of the eight tiles round this thing? A dock fills only beside it.
function byWater(w, s) {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const tx = s.tx + dx, ty = s.ty + dy;
    if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) continue;
    const tt = w.C.TERR[w.terr[ty * w.cols + tx]];
    if (tt.deep === 1 || tt.shallow === 1) return true;
  }
  return false;
}

// A UFO's timers: the abduction cooldown, and dropping its passenger when the carry time is up.
function ufoCarry(w, e) {
  const E = w.E, U = w.R.ufo;
  E.abCd[e] = (E.abCd[e] || 0) - w.dt;
  if (E.cargo[e]) {
    E.carryT[e] -= w.dt;
    if (E.carryT[e] <= 0) { const o = ent(w, E.cargo[e]); E.cargo[e] = 0; E.abCd[e] = U.cooldown; E.goalKind[e] = 0; if (o >= 0) drop(w, o, E.x[e], E.y[e], STI.returned); }
  }
}

// Aboard a UFO: bail out if the UFO is gone, dead, or no longer carrying this creature.
function aboard(w, e) {
  const E = w.E, u = ent(w, -E.inside[e]);
  if (u < 0) drop(w, e, E.dropX[e], E.dropY[e], STI.rescued); // the UFO is gone: bail out where it was
  else if (E.dead[u] || E.cargo[u] !== w.slotH[e]) drop(w, e, E.x[u], E.y[u], E.dead[u] ? STI.rescued : STI.returned);
}

// Falling (a parachute steers to a tower within reach, or drifts), then landing.
function falling(w, e) {
  const E = w.E, U = w.R.ufo, T = w.T, dt = w.dt;
  E.alt[e] -= (E.chute[e] ? U.chuteFall : U.freeFall) * dt;
  if (E.chute[e]) {
    const tw = E.kind[e] === 'human' && findStruct(w, e, U.steerScan, sTower);
    if (tw) {
      const gx = tw.tx * T + 4 - E.x[e], gy = tw.ty * T + 5 - E.y[e], gd = hyp(gx, gy) || 1, v = Math.min(gd, U.steerSpeed * dt);
      setPos(w, e, E.x[e] + (gx / gd) * v, E.y[e] + (gy / gd) * v);
    } else setPos(w, e, clamp(2, w.W - 2, E.x[e] + dsin(w.time * U.driftFreq + E.born[e]) * U.driftSpeed * dt), E.y[e]);
  }
  if (E.alt[e] <= 0) { E.alt[e] = 0; land(w, e); }
}

// On an archer tower: keeps watch, heals, and hops down when the time is up. Returns false when the tower
// is gone (the creature carries on with its step), true otherwise.
function perched(w, e) {
  const E = w.E, R = w.R, U = R.ufo, dt = w.dt, pt = struct(w, E.perch[e]);
  if (!pt) { E.perch[e] = 0; return false; }
  E.perchT[e] -= dt; pt.manned = R.tower.mannedHold; E.hp[e] = Math.min(w.C.S[E.kind[e]].hp, E.hp[e] + R.regen.perch * dt);
  if (E.perchT[e] <= 0) { E.perch[e] = 0; E.alt[e] = U.hopAlt; E.chute[e] = false; setPos(w, e, clamp(3, w.W - 3, E.x[e] + pick2(w, -U.hopShift, U.hopShift)), E.y[e]); }
  return true;
}

// In a house (removing a house empties it, so the handle is always live): heals; leaves when hungry, or
// by day once healed.
function atHome(w, e, night) {
  const E = w.E, R = w.R, maxHp = w.C.S[E.kind[e]].hp;
  // (A damaged save can name a house that is not there: found by save-check's flipped bytes, Sep 21. It steps
  // out of nowhere rather than throwing; a world that was never damaged cannot reach this.)
  const home = struct(w, E.inside[e]);
  if (!home) { E.inside[e] = 0; E.think[e] = 0; return; }
  E.hp[e] = Math.min(maxHp, E.hp[e] + R.regen.home * w.dt);
  if (E.hunger[e] > R.ai.homeLeaveHunger || (!night && E.hp[e] >= maxHp * R.ai.homeLeaveHp)) { home.occ--; E.inside[e] = 0; E.think[e] = 0; }
}

// Design 15 C2: a thunderstorm. The cloud drifts on the heading it was born with, keeps the rain going while it
// lasts, and every few seconds picks one tile under it and strikes it. What is on the tile decides how likely it
// is to be the one: a lightning rod takes almost every strike, and takes it harmlessly; a creature carrying
// metal is next; a tinfoil hat is never struck at all. Every draw is from the world's own stream, so two worlds
// that saw the same storm see the same strikes.
function stormTick(w, dt) {
  if (!w.storms.length) return;
  const R = w.R, P = w.C.P.storm, S = R.storm, T = w.T, E = w.E;
  for (let k = w.storms.length - 1; k >= 0; k--) {
    const c = w.storms[k];
    c.px = c.x; c.py = c.y;
    c.x = Math.max(4, Math.min(w.W - 4, c.x + c.vx * dt));
    c.y = Math.max(4, Math.min(w.H - 4, c.y + c.vy * dt));
    c.t -= dt;
    w.rainT = Math.max(w.rainT, 1); // it rains while it is overhead
    c.next -= dt;
    if (c.next <= 0) {
      c.next = rnd(w, P.strikeEvery[0], P.strikeEvery[1]);
      strike(w, c);
    }
    if (c.t <= 0) w.storms.splice(k, 1);
  }
}
function strike(w, c) {
  const R = w.R, P = w.C.P.storm, S = R.storm, T = w.T, E = w.E;
  const r = P.radius, tx0 = Math.max(0, Math.floor((c.x - r) / T)), tx1 = Math.min(w.cols - 1, Math.floor((c.x + r) / T));
  const ty0 = Math.max(0, Math.floor((c.y - r) / T)), ty1 = Math.min(w.rows - 1, Math.floor((c.y + r) / T));
  // Every tile under the cloud gets a weight, and one is drawn in proportion. The creature that made a tile
  // heavy is remembered with it, so the strike lands on whoever was carrying the metal.
  let total = 0;
  const tiles = w.stormTiles, weights = w.stormW, who = w.stormWho;
  let n = 0;
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const dx = tx * T + 4 - c.x, dy = ty * T + 4 - c.y;
    if (dx * dx + dy * dy > r * r) continue;
    const i = ty * w.cols + tx, s = w.grid[i];
    let weight = S.bare, target = -1;
    if (s) weight = s.def.rod ? S.rod : (s.def.block || s.def.light || s.def.home) ? S.tall : S.bare;
    for (let q = 0; q < w.count; q++) {
      const e = w.order[q];
      if (E.inside[e] || E.dead[e]) continue;
      if (Math.floor(E.x[e] / T) !== tx || Math.floor(E.y[e] / T) !== ty) continue;
      const G = E.gear[e], hat = G.head && w.C.GEAR[G.head];
      if (hat && (hat.tags || EMPTY).indexOf('foil') >= 0) { weight = S.foil; target = -1; break; }
      if (metalOn(w, e)) { weight = Math.max(weight, S.metal); target = e; }
    }
    if (weight <= 0) continue;
    if (n === tiles.length) break;
    tiles[n] = i; weights[n] = weight; who[n] = target; total += weight; n++;
  }
  if (!n || total <= 0) return;
  // A rod under the cloud takes the strike nearly every time (design 15 C2 asks for four in five): with a
  // hundred and fifty tiles of bare ground under a cloud, no per-tile weight can do that on its own, so the
  // rod is drawn for first and the weights decide the rest.
  let at = -1;
  if (w.rng.float() < S.rodShare) {
    let rods = 0;
    for (let q = 0; q < n; q++) if (weights[q] === S.rod) rods++;
    if (rods) {
      let want = Math.floor(w.rng.float() * rods);
      for (let q = 0; q < n; q++) if (weights[q] === S.rod && want-- === 0) { at = q; break; }
    }
  }
  if (at < 0) {
    let pick = w.rng.float() * total;
    for (at = 0; at < n - 1; at++) { pick -= weights[at]; if (pick <= 0) break; }
  }
  const i = tiles[at], tx = i % w.cols, ty = (i / w.cols) | 0, x = tx * T + 4, y = ty * T + 4;
  addFx(w, 'bolt', x, y, w.R.fx.bolt);
  emit(w, EVI.bolt, x, y, 0);
  const s = w.grid[i];
  if (s && s.def.rod) { w.stormHits.rod++; log(w, 'log.rodStruck'); if (w.R.flags.rodStillStrikes) reactPower(w, 'storm', x, y); return; } // it goes to earth: nothing is hurt
  // What the bolt found, for the tools: the sim never reads these back (world.js stormHits).
  let standing = 0, foiled = 0;
  for (let q = 0; q < w.count; q++) {
    const e = w.order[q];
    if (E.inside[e] || E.dead[e] || Math.floor(E.x[e] / T) !== tx || Math.floor(E.y[e] / T) !== ty) continue;
    standing++;
    const G = E.gear[e], hat = G.head && w.C.GEAR[G.head];
    if (hat && (hat.tags || EMPTY).indexOf('foil') >= 0) foiled++;
  }
  if (foiled) w.stormHits.foil++;
  else if (who[at] >= 0) w.stormHits.metal++;
  else if (standing) w.stormHits.bare++;
  else w.stormHits.ground++;
  reactPower(w, 'storm', x, y); // design 14 §5: rows answer the strike (glass, metal, ponds)
  const hit2 = who[at] >= 0 ? who[at] : -1;
  for (let q = 0; q < w.count; q++) {
    const e = w.order[q];
    if (E.inside[e] || E.dead[e]) continue;
    if (hyp(E.x[e] - x, E.y[e] - 4 - y) > w.T) continue;
    const dmg = allowed(w, e, SRC.power, P.dmg);
    if (dmg > 0) { E.hp[e] -= dmg; E.flash[e] = w.R.fx.powerFlash; if (E.hp[e] <= 0) { log(w, 'log.struck', { a: ref(w, e) }); die(w, e, 'lightning'); } }
  }
  void hit2;
}
const EMPTY = [];
// Is this creature carrying or wearing metal? (design 15 A6's storm_metal row asks the same question.)
function metalOn(w, e) {
  const C = w.C, G = w.E.gear[e];
  const wp = G.weapon && C.WEAP[G.weapon];
  if (wp && (wp.tags || EMPTY).indexOf('metal') >= 0) return true;
  for (const slot of ['head', 'body', 'back', 'hand', 'feet', 'charm']) {
    const id = G[slot], g = id && C.GEAR[id];
    if (g && (g.tags || EMPTY).indexOf('metal') >= 0) return true;
  }
  return false;
}

// Lava, drowning, drying out, spike traps. Returns true if the creature died. A creature Safe guards or Gentle covers
// is warned first (design 14 §6): no damage for rules.harm.warnSec of unbroken exposure, a "!" over it meanwhile, so a
// hand can lift it out.
function hazards(w, e, t, wet) {
  const E = w.E, R = w.R, H = R.hazard, dt = w.dt, sp = w.C.S[E.kind[e]];
  const k = tileOf(w, e), s = k < 0 ? null : w.grid[k], br = s && s.def.bridge; // s: structAt()
  const shallow = w.R.flags.shallows && w.C.TERR[t] && w.C.TERR[t].shallow === 1; // design 15 C1: wet enough for a fish, too shallow to drown in
  const lava = t === w.C.tid.lava && !br && !sp.lavaProof, drown = wet && !sp.water && !swims(w, e), dry = sp.water && !wet && !shallow;
  if (!(lava || drown || dry)) E.hazT[e] = 0;
  else if (hazardHolds(w, e)) { /* warned, or spared: no damage this step */ }
  else {
    if (lava) { E.hp[e] -= H.lavaDps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) { die(w, e, 'lava'); return true; } }
    if (drown) { E.hp[e] -= H.drownDps * dt; if (E.hp[e] <= 0) { die(w, e, 'drowned'); return true; } }
    if (dry) { E.hp[e] -= H.dryDps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) { die(w, e, 'dried'); return true; } }
  }
  if (s && s.def.spikes && isFoe(w, e)) { E.hp[e] -= H.spikeDps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) { die(w, e, 'spikes'); return true; } }
  return false;
}

// A hazard's grace (harm.js): true while it may not hurt e this step. For a warned creature: the first warnSec of
// unbroken exposure, with a "!" at its start and every warnEvery seconds.
function hazardHolds(w, e) {
  const fx = effect(w, e, SRC.hazard);
  if (fx !== WARN) return fx >= NONE; // spared outright, or hurt now
  const E = w.E, HM = w.R.harm, was = E.hazT[e], now = was + w.dt;
  E.hazT[e] = now;
  if (now > HM.warnSec) return false;
  if (was === 0 || Math.floor(was / HM.warnEvery) !== Math.floor(now / HM.warnEvery)) { addFx(w, 'warn', E.x[e], E.y[e] - 10, w.R.fx.warn); emitAt(w, EVI.warn, e); }
  return true;
}

// A healer heals every hurt human within reach, with a heart now and then.
function heal(w, e) {
  const E = w.E, R = w.R, HL = R.healer, maxHp = w.C.S.human.hp, dt = w.dt;
  E.healT[e] = (E.healT[e] || 0) - dt;
  if (w.nHumans === 0) return; // no one to heal
  // Every hurt human within reach is healed (one human's healing does not change another's, so the order does
  // not matter); the heart goes to the first of them in spawn order, the lowest id, as in the prototype. With few
  // humans the human list is walked, not the crowd round the healer (healers in a crowd froze the game).
  const few = w.nHumans <= 64, n = few ? w.nHumans : gatherAny(w, E.x[e], E.y[e], HL.radius), near = few ? w.humans : w.near, id = E.id;
  let first = -1;
  for (let j = 0; j < n; j++) {
    const o = near[j];
    if (!(E.kind[o] === 'human' && !E.dead[o] && !E.inside[o] && E.hp[o] < maxHp && dist(w, e, o) < HL.radius)) continue;
    E.hp[o] = Math.min(maxHp, E.hp[o] + HL.rate * dt);
    if (first < 0 || id[o] < id[first]) first = o;
  }
  if (first >= 0 && E.healT[e] <= 0) { E.healT[e] = HL.heartEvery; addFx(w, 'heart', E.x[first], E.y[first] - 10, R.fx.healHeart); }
}

// Goals. step() moves toward the point in w.tgt.
function goMove(w, e) {
  const E = w.E;
  w.tgt[0] = E.goalX[e]; w.tgt[1] = E.goalY[e];
  if (step(w, e, E.goalRun[e] ? MV_RUN : MV_WALK)) E.goalKind[e] = 0;
}

function goAttack(w, e) {
  const E = w.E, o = ent(w, E.goalA[e]);
  if (o < 0 || E.dead[o] || E.inside[o] || !reach(w, e, o)) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  const wp = w.C.WEAP[E.gear[e].weapon], range = (wp && wp.range) || w.R.combat.defaultRange;
  if (dist(w, e, o) <= range) { E.face[e] = E.x[o] < E.x[e] ? -1 : 1; if (E.cd[e] <= 0) hit(w, e, o); }
  else { w.tgt[0] = E.x[o]; w.tgt[1] = E.y[o]; step(w, e, MV_CHASE); }
}

function goAbduct(w, e) {
  const E = w.E, U = w.R.ufo, o = ent(w, E.goalA[e]);
  if (o < 0 || E.dead[o] || E.inside[o] || E.perch[o] || E.alt[o] > 0) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  if (dist(w, e, o) < U.grab) {
    // Design 14 §5: the beam meets what it is reaching for first. A row may send it sliding off (a tinfoil hat).
    if (reactBeam(w, e, o)) { E.goalKind[e] = 0; E.think[e] = 0; E.abCd[e] = U.cooldown; return; }
    E.inside[o] = -w.slotH[e];
    E.cargo[e] = w.slotH[o]; E.carryT[e] = rnd(w, U.carry[0], U.carry[1]); E.goalKind[e] = 0; E.think[e] = 0;
    addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamGrab);
    emitAt(w, EVI.beam, o);
    log(w, 'log.abducted', { a: ref(w, o) });
    story(w, STI.abducted, E.x[o], E.y[o], o, e, -1, kindIcon(w, e), kindIcon(w, o), w.C.iconOf.beam, w.lastLog); // UFO + it -> beamed up
  } else { w.tgt[0] = E.x[o]; w.tgt[1] = E.y[o]; step(w, e, MV_ABDUCT); }
}

function goGraze(w, e) { // goalX, goalY: the tile
  const E = w.E, R = w.R, T = w.T, gx = E.goalX[e], gy = E.goalY[e];
  w.tgt[0] = gx * T + 4; w.tgt[1] = gy * T + 5;
  if (step(w, e, MV_GRAZE)) {
    const i = gy * w.cols + gx;
    const gt = w.C.TERR[w.terr[i]];
    if (gt.eatTo !== undefined && R.flags.crops) { // design 15 C1: a ripe field is picked, and starts again
      E.hunger[e] = Math.max(0, E.hunger[e] - R.food.eat);
      setTerrain(w, gx, gy, w.C.tid[gt.eatTo]);
      emitAt(w, EVI.eat, e);
      E.goalKind[e] = 0; E.think[e] = R.ai.eatThink;
      return;
    }
    if (gt.graze && w.eaten[i] <= 0) {
      w.eaten[i] = R.graze.regrowSec / (gt.regrowMul || 1); markDirty(w, i); E.hunger[e] = Math.max(0, E.hunger[e] - R.needs.grazeFeed);
      emitAt(w, EVI.eat, e);
      if (!w.eatenIn[i]) { w.eatenIn[i] = 1; w.eatenList[w.eatenN++] = i; }
    }
    E.goalKind[e] = 0; E.think[e] = R.ai.eatThink;
  }
}

function goBush(w, e) {
  const E = w.E, R = w.R, T = w.T, s = struct(w, E.goalA[e]);
  if (!s || s.food < 1) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  w.tgt[0] = s.tx * T + 4; w.tgt[1] = s.ty * T + 5;
  if (hyp(s.tx * T + 4 - E.x[e], s.ty * T + 5 - E.y[e]) < R.food.reach || step(w, e, MV_FOOD)) {
    // A campfire's cooking was set, saved and hashed and then read by nothing at all, so the row said it and
    // nothing came of it (found Sep 20). Design 14 §5 promised the eaters show a heart: a cooked meal goes
    // further, and it says so.
    const cooked = R.flags.cookedFeeds && s.cooked;
    s.food--; meal(w, e, R.food.eat * (cooked ? R.food.cookedMul : 1));
    if (cooked) { s.cooked = 0; addFx(w, 'heart', E.x[e], E.y[e] - 8, R.fx.heart); }
    E.goalKind[e] = 0; E.think[e] = R.ai.eatThink; // a meal, as a kill is (15 B1)
    emitAt(w, EVI.eat, e);
  }
}

function goHouse(w, e) {
  const E = w.E, T = w.T, s = struct(w, E.goalA[e]);
  if (!s || s.occ >= s.def.home) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  w.tgt[0] = s.tx * T + 4; w.tgt[1] = s.ty * T + 6;
  if (step(w, e, MV_HOME) || hyp(s.tx * T + 4 - E.x[e], s.ty * T + 6 - E.y[e]) < w.R.move.homeReach) { E.inside[e] = s.h; s.occ++; E.goalKind[e] = 0; }
}

// Design 15 B3: going to somebody of its own kind — a hungry little one to feed, or one to stand about with.
// Which of the two it is comes from what the pair are, not from a flag: a grown one beside a hungry baby
// passes it a meal, and everyone else plays.
function goCare(w, e) {
  const E = w.E, R = w.R, C = R.care, o = ent(w, E.goalA[e]);
  if (o < 0 || E.dead[o] || E.inside[o] || w.perc.bad >= 0) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  if (dist(w, e, o) > C.reach) { w.tgt[0] = E.x[o]; w.tgt[1] = E.y[o]; step(w, e, MV_WALK); return; }
  E.face[e] = E.x[o] < E.x[e] ? -1 : 1;
  // Design 15 B3: carrying food, beside somebody much hungrier — it hands it over.
  if (R.flags.share && E.carry[e] === 1 && E.hunger[o] >= E.hunger[e] + C.shareGap) {
    E.carry[e] = 0;
    E.hunger[o] = Math.max(0, E.hunger[o] - R.food.eat);
    addFx(w, 'heart', E.x[o], E.y[o] - 8, R.fx.heart);
    emitAt(w, EVI.eat, o);
    log(w, 'log.shared', { a: ref(w, e), b: ref(w, o) });
    story(w, STI.fed, E.x[o], E.y[o], e, o, -1, kindIcon(w, e), w.C.whyIcon.hungry, kindIcon(w, o), w.lastLog);
    E.goalKind[e] = 0; E.think[e] = R.ai.eatThink;
    return;
  }
  // Or badly hurt — then it simply stands with them, and says nothing.
  if (R.flags.stay && E.hp[o] < w.C.S[E.kind[o]].hp * C.stayHp) { E.goalKind[e] = 0; E.think[e] = C.playSec; return; }
  if (E.baby[o] && !E.baby[e] && E.hunger[o] > C.feedHungry && E.hunger[e] < C.feedFed) {
    // A meal passed across: what the little one gains, the grown one goes without.
    const give = Math.min(C.feedPass, R.needs.hungerMax - E.hunger[e]);
    E.hunger[o] = Math.max(0, E.hunger[o] - give); E.hunger[e] += give;
    addFx(w, 'heart', E.x[o], E.y[o] - 8, R.fx.heart);
    emitAt(w, EVI.eat, o);
    log(w, 'log.fed', { a: ref(w, e), b: ref(w, o) });
    story(w, STI.fed, E.x[o], E.y[o], e, o, -1, kindIcon(w, e), w.C.whyIcon.hungry, kindIcon(w, o), w.lastLog);
    E.goalKind[e] = 0; E.think[e] = R.ai.eatThink;
    return;
  }
  // A game: they stand together until the creature thinks again (ai/decide.js sets that clock when it picks
  // the behaviour), with a heart every so often to say so. The beat comes from the world clock and the
  // creature's own id, so it needs no timer of its own: healT belongs to the healers.
  if ((w.tick + E.id[e]) % Math.max(1, Math.round(C.playHeart / R.tickSec)) === 0) addFx(w, 'heart', E.x[e], E.y[e] - 8, R.fx.healHeart);
}

// Design 15 B3: fetching water (the well, a barrel, the fountain), and carrying it to a fire.
function goWater(w, e) {
  const E = w.E, R = w.R;
  // Close enough, not standing on it: a well is a thing you cannot walk into (as goFetch does with a bush).
  if (hyp(E.goalX[e] - E.x[e], E.goalY[e] - E.y[e]) < R.care.reach + R.food.reach) {
    E.carry[e] = 2; // water, not food (the village's own carrying is carry === 1)
    E.goalKind[e] = 0; E.think[e] = 0;
    return;
  }
  w.tgt[0] = E.goalX[e]; w.tgt[1] = E.goalY[e];
  step(w, e, MV_FOOD);
}
function goDouse(w, e) {
  const E = w.E, R = w.R, T = w.T;
  if (E.carry[e] !== 2) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  if (hyp(E.goalX[e] - E.x[e], E.goalY[e] - E.y[e]) >= R.care.reach) { // near enough to throw it on
    w.tgt[0] = E.goalX[e]; w.tgt[1] = E.goalY[e];
    step(w, e, MV_FOOD);
    return;
  }
  const tx = Math.floor(E.goalX[e] / T), ty = Math.floor(E.goalY[e] / T);
  if (tx >= 0 && ty >= 0 && tx < w.cols && ty < w.rows) {
    const i = ty * w.cols + tx;
    if (w.burn[i] > 0) {
      w.burn[i] = 0;
      addFx(w, 'block', E.goalX[e], E.goalY[e], R.fx.block);
      emitAt(w, EVI.freeze, e);
      log(w, 'log.doused', { a: ref(w, e) });
      storyOf(w, STI.fed, e, w.C.iconOf.drop, w.C.iconOf.fire, kindIcon(w, e), w.lastLog);
    }
  }
  E.carry[e] = 0; E.goalKind[e] = 0; E.think[e] = 0;
}

// Somebody new walks in over the hill (rules.visit). A village that began with two people has nobody to meet,
// and the honest fix for that is not a family tree the sim does not have: it is a stranger, now and then, who
// joins in. One random draw a day, at first light, and never in the first few minutes of a first world. They
// walk in from the edge nearest the others, never appear in the middle (design 10: arrivals walk in).
function visitor(w) {
  const V = w.R.visit, E = w.E;
  if (!w.R.flags.visitor || !V) return;
  if (w.rng.float() >= V.chance) return;
  let folk = 0, sx = 0, sy = 0;
  for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (E.kind[e] === 'human' && !E.dead[e]) { folk++; sx += E.x[e]; sy += E.y[e]; } }
  if (folk < V.minFolk || folk >= speciesCapOf(w) || w.count >= w.R.breed.popCap) return;
  sx /= folk; sy /= folk;
  // The nearest edge to where the people are, then the first walkable tile in from it.
  const left = sx, right = w.W - sx, top = sy, bottom = w.H - sy;
  const m = Math.min(left, right, top, bottom);
  let x = sx, y = sy;
  if (m === left) x = 4; else if (m === right) x = w.W - 4; else if (m === top) y = 4; else y = w.H - 4;
  // Along the edge until the ground is something a person can stand on (no water, no lava, nothing in the way).
  const ok = (px, py) => {
    const tx = Math.floor(px / w.T), ty = Math.floor(py / w.T);
    if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) return false;
    const i = ty * w.cols + tx, t = w.terr[i], tt = w.C.TERR[t], st = w.grid[i];
    if (!tt || tt.deep === 1 || t === w.C.tid.lava || t === w.C.tid.rock) return false;
    return !(st && st.def.block);
  };
  let found = ok(x, y);
  for (let tries = 1; !found && tries < 24; tries++) {
    const d = (tries % 2 ? tries : -tries) * w.T;
    if (m === left || m === right) y = clamp(4, w.H - 4, sy + d); else x = clamp(4, w.W - 4, sx + d);
    found = ok(x, y);
  }
  if (!found) return; // an island world with no shore near the village: nobody comes today
  const e = spawn(w, 'human', x, y, false);
  if (e < 0) return;
  log(w, 'log.arrived', { a: ref(w, e) });
  story(w, STI.landed, E.x[e], E.y[e], e, -1, -1, w.C.whyIcon.hungry, NO, kindIcon(w, e), w.lastLog);
}

function goMate(w, e) {
  const E = w.E, R = w.R, kind = E.kind[e], o = ent(w, E.goalA[e]);
  if (o < 0 || E.dead[o] || E.inside[o] || E.breedCd[o] > 0) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  if (dist(w, e, o) < R.breed.contact) {
    // Design 15 B1: the species cap is read again here, not only when the pair set out. Several pairs can be on
    // their way at once, so a flock used to overshoot its cap by a handful (measured: 61 to 65 sheep against a
    // cap of 60, tools/balance.mjs). The pair still pair off; there is simply no lamb over the cap.
    const full = R.flags.capAtBirth && (w.count >= R.breed.popCap || w.kindCount[w.C.kid[kind]] >= speciesCapOf(w));
    const b = full ? -1 : spawn(w, kind, E.x[e], E.y[e], true);
    // Design 15 C1: a meadow is where things pair off. A pair standing in the flowers is ready again sooner,
    // so a flock on a meadow raises about half as many young again as one on plain grass.
    const cd = breedCdOf(w, kind) / (R.flags.meadow && onFlowers(w, e) ? R.breed.meadowMul : 1);
    E.breedCd[e] = E.breedCd[o] = cd; E.hunger[e] += R.breed.hungerCost; E.hunger[o] += R.breed.hungerCost; E.goalKind[e] = 0;
    if (b >= 0) {
      E.hunger[b] = R.breed.babyHunger;
      E.feeds[e] = E.feeds[o] = 0; // both parents start counting meals towards the next litter again (15 B1)
      addFx(w, 'heart', E.x[e], E.y[e] - 10, R.fx.heart);
      emitAt(w, EVI.birth, b);
      log(w, E.name[b] ? 'log.bornNamed' : 'log.born', { name: E.name[b], kind });
      story(w, STI.birth, E.x[b], E.y[b], b, e, o, kindIcon(w, e), kindIcon(w, o), kindIcon(w, b), w.lastLog); // a parent + the other -> the baby
    }
  } else { w.tgt[0] = E.x[o]; w.tgt[1] = E.y[o]; step(w, e, MV_MATE); }
}

// ---------- the village (design 14 §7 item 13) ----------
// Walking to the flag to join it; once there, this person belongs to the village until the flag is gone.
function goJoin(w, e) {
  const E = w.E, V = w.R.village, f = struct(w, w.vg.flag);
  if (!f) { E.goalKind[e] = 0; return; }
  const fx = f.tx * w.T + 4, fy = f.ty * w.T + 6;
  if (Math.abs(E.x[e] - fx) + Math.abs(E.y[e] - fy) < V.joinReach) {
    E.vill[e] = w.vg.flag;
    equipVillager(w, e); // whoever joins gets what the village has already worked out
    E.goalKind[e] = 0; E.think[e] = 0;
    log(w, 'log.joined', { a: ref(w, e) });
    storyOf(w, STI.shelter, e, w.C.iconOf['thing:flag'], -1, -1, w.lastLog);
    return;
  }
  w.tgt[0] = fx; w.tgt[1] = fy;
  step(w, e, MV_HOME);
}
// Going to a food thing to pick one up for the village.
function goFetch(w, e) {
  const E = w.E, s = struct(w, E.goalA[e]);
  if (!s || !s.def.food || s.food < 1) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  const tx = s.tx * w.T + 4, ty = s.ty * w.T + 6;
  if (hyp(s.tx * w.T + 4 - E.x[e], s.ty * w.T + 5 - E.y[e]) < w.R.food.reach) {
    s.food -= 1;
    E.carry[e] = 1;
    E.goalKind[e] = 0; E.think[e] = 0;
    return;
  }
  w.tgt[0] = tx; w.tgt[1] = ty;
  step(w, e, MV_FOOD);
}
// Carrying it back to the flag.
function goStore(w, e) {
  const E = w.E, V = w.R.village, f = struct(w, w.vg.flag);
  if (!f) { E.goalKind[e] = 0; E.carry[e] = 0; return; }
  const fx = f.tx * w.T + 4, fy = f.ty * w.T + 6;
  if (Math.abs(E.x[e] - fx) + Math.abs(E.y[e] - fy) < V.joinReach) {
    E.carry[e] = 0;
    w.vg.store = Math.min(V.storeMax, w.vg.store + 1);
    E.goalKind[e] = 0; E.think[e] = 0;
    addFx(w, 'heart', fx, fy - 8, w.R.fx.heart);
    return;
  }
  w.tgt[0] = fx; w.tgt[1] = fy;
  step(w, e, MV_HOME);
}
// Standing on the posted site until the thing is built.
function goBuild(w, e) {
  const E = w.E, V = w.R.village, vg = w.vg;
  if (vg.site < 0) { E.goalKind[e] = 0; E.work[e] = 0; return; }
  const bx = E.goalX[e], by = E.goalY[e];
  if (Math.abs(E.x[e] - bx) + Math.abs(E.y[e] - by) >= V.joinReach) { w.tgt[0] = bx; w.tgt[1] = by; step(w, e, MV_HOME); return; }
  E.work[e] += w.dt;
  if (E.work[e] < V.buildSec) return;
  const made = finishBuild(w, e);
  E.goalKind[e] = 0; E.think[e] = 0;
  if (made) { log(w, 'log.built', { a: ref(w, e), item: made.def.name }); reactPlaced(w, made); }
}

// Walking over to something lying on the ground and picking it up (design 15 A4). Nothing is reserved: two may
// walk to the same sword, the first to arrive takes it, and the other shows "?" and gives up on it for now —
// that little disappointment is the story.
function goTake(w, e) {
  const E = w.E, R = w.R, s = struct(w, E.goalA[e]);
  if (!s || !s.def.item) { // somebody else got there first
    E.goalKind[e] = 0; E.think[e] = R.ai.think;
    mark(w, 'huh', E.x[e], E.y[e] - 10, R.fx.huh);
    return;
  }
  const tx = s.tx * w.T + 4, ty = s.ty * w.T + 6;
  if (hyp(tx - E.x[e], ty - E.y[e]) >= R.ai.takeReach) { w.tgt[0] = tx; w.tgt[1] = ty; step(w, e, E.goalRun[e] ? MV_RUN : MV_WALK); return; }
  const id = s.def.item;
  removeStruct(w, s.tx, s.ty);
  // Through the same door as being handed something, so every row still fires (a chicken that picks up the crown
  // starts the parade).
  command(w, { t: 'give', item: id, x: E.x[e], y: E.y[e] - 4 });
  E.goalKind[e] = 0; E.think[e] = 0;
}
