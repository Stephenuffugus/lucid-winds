// One simulation step of dt seconds: the prototype's update().
import { rnd, pick2 } from './rng.js';
import { hyp, dsin, clamp } from './math.js';
import { log, ref, markDirty, tileOf, struct, flies, swims, inWater, reach, dist } from './world.js';
import { spawn, ent, compact, G_MOVE, G_ATTACK, G_ABDUCT, G_GRAZE, G_BUSH, G_HOUSE, G_MATE } from './ents.js';
import { nearestAt, findStruct } from './query.js';
import { die, hurt, hit, isFoe } from './combat.js';
import { decide } from './ai/decide.js';
import { step, servePaths } from './ai/move.js';
import { MV_WALK, MV_RUN, MV_CHASE, MV_ABDUCT, MV_GRAZE, MV_FOOD, MV_HOME, MV_MATE } from './content.js';
import { drop, land } from './ai/ufo.js';
import { addFx, ageFx } from './fx.js';
import { setPos, gather, gatherAny } from './spatial.js';

const fFoe = (w, e, o) => isFoe(w, o); // what archer towers shoot
const sTower = (s) => s.def.shoot; // what a parachuting human steers to

// One step. Creatures are slots (ents.js); the loops run over w.order, the spawn order, re-reading w.count
// so a creature born this step is updated this step too, as in the prototype (PLAN fact F1).
export function update(w, dt) {
  const C = w.C, S = C.S, R = w.R, T = w.T, tid = C.tid, E = w.E;
  w.time += dt;
  w.dt = dt;
  const night = (w.time % R.daySec) / R.daySec > R.nightFrac;

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
    if (s.def.food && s.food < R.food.max) s.food += dt / R.food.regrowSec;
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
      if (!(E.bless[e] > 0)) { E.hp[e] -= TP.dps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) die(w, e, 'tornado'); }
    }
  }
  let nt = 0;
  for (let k = 0; k < tws.length; k++) if (tws[k].t > 0) tws[nt++] = tws[k];
  if (nt < tws.length) tws.length = nt; // only when a tornado ends
  if (w.rainT > 0) w.rainT -= dt;
  if (w.shake > 0) w.shake -= dt;
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
  const kind = E.kind[e], sp = C.S[kind];
  E.cd[e] -= dt; E.breedCd[e] -= dt; E.flash[e] -= dt; E.think[e] -= dt;
  if (E.baby[e] && w.time - E.born[e] > R.breed.babySec) E.baby[e] = false;
  const k = tileOf(w, e), t = k < 0 ? -1 : w.terr[k], wet = inWater(w, e), cold = (C.TERR[t] || {}).cold && !sp.snow; // t: terrAt()
  E.hunger[e] = Math.min(N.hungerMax, E.hunger[e] + sp.hr * dt * (cold ? N.coldHunger : 1) * (E.inside[e] ? N.insideHunger : 1));
  if (wet && (sp.diet === 'filter' || (sp.amph && sp.diet === 'herb'))) E.hunger[e] = Math.max(0, E.hunger[e] - N.filterFeed * dt);
  if (kind === 'human' && E.hunger[e] > N.humanHungerCap) E.hunger[e] = N.humanHungerCap;
  if (E.hunger[e] >= N.hungerMax) { E.hp[e] -= N.starveDps * dt; if (E.hp[e] <= 0) { die(w, e, 'starved'); return; } }
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
  if (!gk) return;
  if (gk === G_MOVE) goMove(w, e);
  else if (gk === G_ATTACK) goAttack(w, e);
  else if (gk === G_ABDUCT) goAbduct(w, e);
  else if (gk === G_GRAZE) goGraze(w, e);
  else if (gk === G_BUSH) goBush(w, e);
  else if (gk === G_HOUSE) goHouse(w, e);
  else if (gk === G_MATE) goMate(w, e);
}

// A UFO's timers: the abduction cooldown, and dropping its passenger when the carry time is up.
function ufoCarry(w, e) {
  const E = w.E, U = w.R.ufo;
  E.abCd[e] = (E.abCd[e] || 0) - w.dt;
  if (E.cargo[e]) {
    E.carryT[e] -= w.dt;
    if (E.carryT[e] <= 0) { const o = ent(w, E.cargo[e]); E.cargo[e] = 0; E.abCd[e] = U.cooldown; E.goalKind[e] = 0; if (o >= 0) drop(w, o, E.x[e], E.y[e]); }
  }
}

// Aboard a UFO: bail out if the UFO is gone, dead, or no longer carrying this creature.
function aboard(w, e) {
  const E = w.E, u = ent(w, -E.inside[e]);
  if (u < 0) drop(w, e, E.dropX[e], E.dropY[e]); // the UFO is gone: bail out where it was
  else if (E.dead[u] || E.cargo[u] !== w.slotH[e]) drop(w, e, E.x[u], E.y[u]);
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
  E.hp[e] = Math.min(maxHp, E.hp[e] + R.regen.home * w.dt);
  if (E.hunger[e] > R.ai.homeLeaveHunger || (!night && E.hp[e] >= maxHp * R.ai.homeLeaveHp)) { struct(w, E.inside[e]).occ--; E.inside[e] = 0; E.think[e] = 0; }
}

// Lava, drowning, drying out, spike traps. Returns true if the creature died.
function hazards(w, e, t, wet) {
  const E = w.E, R = w.R, H = R.hazard, dt = w.dt, sp = w.C.S[E.kind[e]];
  const k = tileOf(w, e), s = k < 0 ? null : w.grid[k], br = s && s.def.bridge; // s: structAt()
  if (t === w.C.tid.lava && !br && !sp.lavaProof) { E.hp[e] -= H.lavaDps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) { die(w, e, 'lava'); return true; } }
  if (wet && !sp.water && !swims(w, e)) { E.hp[e] -= H.drownDps * dt; if (E.hp[e] <= 0) { die(w, e, 'drowned'); return true; } }
  if (sp.water && !wet) { E.hp[e] -= H.dryDps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) { die(w, e, 'dried'); return true; } }
  if (s && s.def.spikes && isFoe(w, e)) { E.hp[e] -= H.spikeDps * dt; E.flash[e] = R.fx.hazardFlash; if (E.hp[e] <= 0) { die(w, e, 'spikes'); return true; } }
  return false;
}

// A healer heals every hurt human within reach, with a heart now and then.
function heal(w, e) {
  const E = w.E, R = w.R, HL = R.healer, maxHp = w.C.S.human.hp, dt = w.dt;
  E.healT[e] = (E.healT[e] || 0) - dt;
  // Every hurt human within reach is healed (one human's healing does not change another's, so the order does
  // not matter); the heart goes to the first of them in spawn order, the lowest id, as in the prototype.
  const n = gatherAny(w, E.x[e], E.y[e], HL.radius), near = w.near, id = E.id;
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
    E.inside[o] = -w.slotH[e];
    E.cargo[e] = w.slotH[o]; E.carryT[e] = rnd(w, U.carry[0], U.carry[1]); E.goalKind[e] = 0; E.think[e] = 0;
    addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamGrab);
    log(w, 'log.abducted', { a: ref(w, o) });
  } else { w.tgt[0] = E.x[o]; w.tgt[1] = E.y[o]; step(w, e, MV_ABDUCT); }
}

function goGraze(w, e) { // goalX, goalY: the tile
  const E = w.E, R = w.R, T = w.T, gx = E.goalX[e], gy = E.goalY[e];
  w.tgt[0] = gx * T + 4; w.tgt[1] = gy * T + 5;
  if (step(w, e, MV_GRAZE)) {
    const i = gy * w.cols + gx;
    if (w.terr[i] === w.C.tid.grass && w.eaten[i] <= 0) {
      w.eaten[i] = R.graze.regrowSec; markDirty(w, i); E.hunger[e] = Math.max(0, E.hunger[e] - R.needs.grazeFeed);
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
    s.food--; E.hunger[e] = Math.max(0, E.hunger[e] - R.food.eat); E.goalKind[e] = 0; E.think[e] = R.ai.eatThink;
  }
}

function goHouse(w, e) {
  const E = w.E, T = w.T, s = struct(w, E.goalA[e]);
  if (!s || s.occ >= s.def.home) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  w.tgt[0] = s.tx * T + 4; w.tgt[1] = s.ty * T + 6;
  if (step(w, e, MV_HOME) || hyp(s.tx * T + 4 - E.x[e], s.ty * T + 6 - E.y[e]) < w.R.move.homeReach) { E.inside[e] = s.h; s.occ++; E.goalKind[e] = 0; }
}

function goMate(w, e) {
  const E = w.E, R = w.R, kind = E.kind[e], o = ent(w, E.goalA[e]);
  if (o < 0 || E.dead[o] || E.inside[o] || E.breedCd[o] > 0) { E.goalKind[e] = 0; E.think[e] = 0; return; }
  if (dist(w, e, o) < R.breed.contact) {
    const b = spawn(w, kind, E.x[e], E.y[e], true);
    E.breedCd[e] = E.breedCd[o] = w.C.S[kind].breed; E.hunger[e] += R.breed.hungerCost; E.hunger[o] += R.breed.hungerCost; E.goalKind[e] = 0;
    if (b >= 0) {
      E.hunger[b] = R.breed.babyHunger;
      addFx(w, 'heart', E.x[e], E.y[e] - 10, R.fx.heart);
      log(w, E.name[b] ? 'log.bornNamed' : 'log.born', { name: E.name[b], kind });
    }
  } else { w.tgt[0] = E.x[o]; w.tgt[1] = E.y[o]; step(w, e, MV_MATE); }
}
