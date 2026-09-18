// Deciding (01 §5-6, M1-3): perception buckets filled at most once per think, and behaviours scored by
// utility; the highest wins, the current one gets +10 so creatures do not dither. Scores are the bible's
// table; what each behaviour does is the prototype's. A behaviour's score reads buckets, never the world.
import { rnd } from '../rng.js';
import { reach, dist } from '../world.js';
import { nearest, findStruct, findGrass } from '../query.js';
import { hunts, armed } from '../combat.js';
import { ent, goalMove, goalEnt, G_MOVE, G_ATTACK, G_ABDUCT, G_GRAZE, G_BUSH, G_HOUSE, G_MATE } from '../ents.js';
import { wander } from './move.js';

// Scan filters, f(w, e, o): e is the creature deciding, o a candidate (slots). Named functions, not
// per-call closures, so a decision allocates nothing.
export const fHumanGrounded = (w, e, o) => w.E.kind[o] === 'human' && !(w.E.alt[o] > 0);
const fThreat = (w, e, o) => hunts(w, o, e) && (w.E.hunger[o] > w.R.ai.threatHunger || w.C.S[w.E.kind[o]].diet === 'none' || w.E.anger[o] === w.slotH[e]);
const fHuntsMe = (w, e, o) => hunts(w, o, e);
// A guardian's target: an enemy, a hunt-everything creature, or a non-human after a human. goalB is the
// target's kind even after the target has died, as the prototype read goal.t.kind.
const fGuardTarget = (w, e, o) => reach(w, e, o) && (w.C.S[w.E.kind[o]].enemy || w.C.S[w.E.kind[o]].hunts === 'all' ||
  (w.E.goalKind[o] === G_ATTACK && w.E.goalB[o] === w.C.kid.human && w.E.kind[o] !== 'human'));
const fHurtHuman = (w, e, o) => w.E.kind[o] === 'human' && w.E.hp[o] < w.C.S.human.hp * w.R.ai.healerHurt;
const fHuman = (w, e, o) => w.E.kind[o] === 'human';
const fReachableHuman = (w, e, o) => w.E.kind[o] === 'human' && reach(w, e, o);
const fPrey = (w, e, o) => hunts(w, e, o) && !(w.E.kind[e] === 'human' && w.E.hunger[e] < w.R.needs.humanHunts);
const fMate = (w, e, o) => w.E.kind[o] === w.E.kind[e] && !w.E.baby[o] && w.E.hunger[o] < w.R.needs.hungry && w.E.breedCd[o] <= 0;
// Thing filters, f(s).
const sFreeHome = (s) => s.def.home && s.occ < s.def.home;
const sFood = (s) => s.def.food && s.food >= 1;



// ---------- perception: buckets, each computed at most once per think, on first use ----------
const P_THREAT = 0, P_ARMED = 1, P_GUARD = 2, P_HURT = 3, P_HUMAN = 4, P_RAID = 5, P_PREY = 6, P_MATE = 7, P_GROUNDED = 8, P_HOME = 9, P_FOOD = 10, P_GRASS = 11;
const NB = 12;
// The creature a bucket holds (slot or -1), a thing (as its handle, 0 for none) or a grass tile (or -1).
function see(w, e, b) {
  const P = w.perc;
  if (P.stamp[b] === P.think) return P.val[b];
  const A = w.R.ai;
  let v;
  if (b === P_THREAT) v = nearest(w, e, A.threatScan, fThreat);
  else if (b === P_ARMED) v = nearest(w, e, A.armedScan, fHuntsMe);
  else if (b === P_GUARD) v = nearest(w, e, A.allyScan, fGuardTarget);
  else if (b === P_HURT) v = nearest(w, e, A.healerScan, fHurtHuman);
  else if (b === P_HUMAN) v = nearest(w, e, A.allyFollowScan, fHuman);
  else if (b === P_RAID) v = nearest(w, e, A.enemyScan, fReachableHuman);
  else if (b === P_PREY) v = nearest(w, e, A.huntScan, fPrey);
  else if (b === P_MATE) v = nearest(w, e, w.R.breed.scan, fMate);
  else if (b === P_GROUNDED) v = nearest(w, e, w.R.ufo.seekScan, fHumanGrounded);
  else if (b === P_HOME) { const s = findStruct(w, e, A.homeScan, sFreeHome); v = s ? s.h : 0; }
  else if (b === P_FOOD) { const s = findStruct(w, e, w.C.S[w.E.kind[e]].diet === 'herb' ? A.herbFoodScan : A.omniFoodScan, sFood); v = s ? s.h : 0; }
  else v = findGrass(w, e); // P_GRASS (each candidate tile draws one random number)
  P.val[b] = v; P.stamp[b] = P.think;
  return v;
}
// sc: where a behaviour's score() leaves its score (a number returned from a call the engine does not
// inline would be boxed; score() returns only whether it is available).
export function createPerception(w) { w.perc = { think: 0, val: new Float64Array(NB), stamp: new Float64Array(NB).fill(-1), bad: -1, sc: new Float64Array(1) }; }
const put = (w, s) => { w.perc.sc[0] = s; return true; };

// Who it would face: a threat in reach, or whoever last hit it (anger is forgotten once that creature is
// gone, dead, inside, out of range or out of reach, and at once if it is a human while Safe is on).
function badOne(w, e) {
  const E = w.E, A = w.R.ai, ang = ent(w, E.anger[e]);
  if (ang >= 0 && w.safe && E.kind[ang] === 'human') E.anger[e] = 0;
  if (E.anger[e] && (ang < 0 || E.dead[ang] || E.inside[ang] || dist(w, e, ang) > A.angerRange || !reach(w, e, ang))) E.anger[e] = 0;
  const threat = see(w, e, P_THREAT);
  return threat >= 0 ? threat : E.anger[e] ? ang : -1;
}
// Brave enough to fight it? The prototype's rule (species strength, humans only when armed); the bible's
// power formula waits for M2-5's gear engine (QUESTIONS Q12).
function brave(w, e, bad) {
  const S = w.C.S, kind = w.E.kind[e], sp = S[kind], bs = S[w.E.kind[bad]];
  return (kind === 'human' && armed(w, e)) || (sp.atk > 0 && kind !== 'human' && sp.atk * sp.hp >= bs.atk * bs.hp * w.R.ai.braveRatio);
}

// ---------- behaviours ----------
// id, the most it can score (for stopping early), score(w, e): whether it is available now (its score
// left in w.perc.sc[0]),
// act(w, e): sets the goal. `bad` is computed once per think by the first behaviour that needs it.
export const B_FLEE = 1, B_FIGHT = 2, B_SHELTER = 3, B_RAID = 4, B_GUARD = 5, B_EAT = 6, B_HUNT = 7, B_MATE = 8, B_IDLE = 9;
const hungerScore = (w, e) => put(w, 35 + w.E.hunger[e] / 2);
const BEHAVIOURS = [
  { id: B_FLEE, max: 90, // run from a threat it will not fight
    score(w, e) { const b = w.perc.bad; return b >= 0 && !(brave(w, e, b) && reach(w, e, b)) ? put(w, 90) : false; },
    act(w, e) {
      const E = w.E, A = w.R.ai, bad = w.perc.bad, ex = E.x[e], ey = E.y[e], dx = ex - E.x[bad], dy = ey - E.y[bad];
      const d = Math.sqrt(dx * dx + dy * dy) || 1; // dist(w, e, bad), written out (see below)
      const fx = ex + (dx / d) * A.fleeDist, fy = ey + (dy / d) * A.fleeDist;
      E.goalKind[e] = G_MOVE; E.goalX[e] = Math.max(4, Math.min(w.W - 4, fx)); E.goalY[e] = Math.max(4, Math.min(w.H - 4, fy)); E.goalRun[e] = 1;
    } },
  { id: B_FIGHT, max: 85, // a threat it will fight; an armed human: anything that hunts humans; a guardian: its target
    score(w, e) {
      const b = w.perc.bad, E = w.E;
      if (b >= 0) return brave(w, e, b) && reach(w, e, b) ? put(w, 85) : false;
      if (E.kind[e] === 'human' && armed(w, e)) return see(w, e, P_ARMED) >= 0 ? put(w, 85) : false;
      if (w.C.S[E.kind[e]].ally) return see(w, e, P_GUARD) >= 0 ? put(w, 85) : false;
      return false;
    },
    act(w, e) { const b = w.perc.bad; goalEnt(w, e, G_ATTACK, b >= 0 ? b : w.E.kind[e] === 'human' ? see(w, e, P_ARMED) : see(w, e, P_GUARD)); } },
  { id: B_SHELTER, max: 60, // a human, not too hungry, at night or hurt: a house with room
    score(w, e) {
      const E = w.E, R = w.R, A = R.ai;
      if (!(E.kind[e] === 'human' && E.hunger[e] < A.homeHungerBelow)) return false;
      if (!((w.time % R.daySec) / R.daySec > R.nightFrac || E.hp[e] < w.C.S.human.hp * A.homeHpBelow)) return false;
      return see(w, e, P_HOME) ? put(w, 60) : false;
    },
    act(w, e) { const h = see(w, e, P_HOME); w.E.goalKind[e] = G_HOUSE; w.E.goalA[e] = h; } },
  { id: B_RAID, max: 55, // an enemy, Safe off: a human it can reach
    score(w, e) { return w.C.S[w.E.kind[e]].enemy && !w.safe && see(w, e, P_RAID) >= 0 ? put(w, 55) : false; },
    act(w, e) { goalEnt(w, e, G_ATTACK, see(w, e, P_RAID)); } },
  { id: B_GUARD, max: 50, // a guardian: stay within reach of a (hurt, for healers) human
    score(w, e) {
      if (!w.C.S[w.E.kind[e]].ally) return false;
      const h = guardHuman(w, e);
      if (h < 0) return false;
      const E = w.E, dx = E.x[e] - E.x[h], dy = E.y[e] - E.y[h];
      return Math.sqrt(dx * dx + dy * dy) > w.R.ai.guardDist ? put(w, 50) : false; // dist(w, e, h)
    },
    act(w, e) {
      const E = w.E, A = w.R.ai, h = guardHuman(w, e);
      const gx = E.x[h] + rnd(w, -A.guardJitter, A.guardJitter), gy = E.y[h] + rnd(w, -A.guardJitter, A.guardJitter);
      E.goalKind[e] = G_MOVE; E.goalX[e] = gx; E.goalY[e] = gy; E.goalRun[e] = 1;
      E.think[e] = A.guardThink;
    } },
  { id: B_EAT, max: 85, // hungry: a food thing, else (grazers) grass
    score(w, e) {
      const E = w.E, sp = w.C.S[E.kind[e]];
      if (!(E.hunger[e] > w.R.needs.hungry && !sp.water) || (sp.diet !== 'herb' && sp.diet !== 'omni')) return false;
      const food = see(w, e, P_FOOD);
      if (sp.diet === 'herb') { const g = see(w, e, P_GRASS); if (!food && g < 0) return false; } // both looked at, as the prototype did
      else if (!food) return false;
      return hungerScore(w, e);
    },
    act(w, e) {
      const E = w.E, food = see(w, e, P_FOOD);
      if (food) { E.goalKind[e] = G_BUSH; E.goalA[e] = food; return; }
      const g = see(w, e, P_GRASS);
      E.goalKind[e] = G_GRAZE; E.goalX[e] = g % w.cols; E.goalY[e] = (g - E.goalX[e]) / w.cols;
    } },
  { id: B_HUNT, max: 85, // hungry hunters: the nearest prey (humans only above 55)
    score(w, e) {
      const E = w.E;
      if (!(E.hunger[e] > w.R.needs.hungry && w.C.S[E.kind[e]].hunts)) return false;
      return see(w, e, P_PREY) >= 0 && hungerScore(w, e);
    },
    act(w, e) { goalEnt(w, e, G_ATTACK, see(w, e, P_PREY)); } },
  { id: B_MATE, max: 30, // fed, healthy adults ready to breed, under both caps
    score(w, e) {
      const E = w.E, B = w.R.breed, kind = E.kind[e], sp = w.C.S[kind];
      if (!(sp.breed && !E.baby[e] && E.hunger[e] < w.R.needs.hungry && E.breedCd[e] <= 0 && E.hp[e] >= sp.hp * B.hpFrac)) return false;
      // w.kindCount counts creatures that died this step too, as the prototype's filter did before compaction.
      return see(w, e, P_MATE) >= 0 && w.count < B.popCap && w.kindCount[w.C.kid[kind]] < B.speciesCap ? put(w, 30) : false;
    },
    act(w, e) { goalEnt(w, e, G_MATE, see(w, e, P_MATE)); } },
  { id: B_IDLE, max: 10, // nothing to do: stand a while or wander (enemies always wander)
    score(w) { return put(w, 10); },
    act(w, e) {
      const E = w.E, A = w.R.ai, sp = w.C.S[E.kind[e]];
      if (sp.enemy) { wander(w, e); return; }
      const chance = sp.ally ? A.allyIdleChance : A.idleChance, t = sp.ally ? A.allyIdleThink : A.idleThink;
      if (w.rng.float() < chance) { E.goalKind[e] = 0; E.think[e] = rnd(w, t[0], t[1]); }
      else wander(w, e);
    } },
];
const HYSTERESIS = 10;
// The human a guardian stays with: for healers the nearest hurt one within 300 px, else the nearest within 400.
function guardHuman(w, e) {
  let h = w.C.S[w.E.kind[e]].heals ? see(w, e, P_HURT) : -1;
  if (h < 0) h = see(w, e, P_HUMAN);
  return h;
}

// e: the deciding creature's slot.
export function decide(w, e) {
  const E = w.E, sp = w.C.S[E.kind[e]];
  E.think[e] = w.R.ai.think;
  if (sp.ufo) { ufo(w, e); return; }
  const P = w.perc;
  P.think++;
  P.bad = badOne(w, e);
  // Behaviours in order of the most they can score; stop once none left could beat the best (a later one
  // could still be the current one, +10). Equal scores keep the earlier one: the prototype's order.
  const cur = E.beh[e];
  let best = -1, pick = null;
  for (let k = 0; k < BEHAVIOURS.length; k++) {
    const b = BEHAVIOURS[k];
    if (best >= b.max + HYSTERESIS) break;
    if (!b.score(w, e)) continue;
    let s = P.sc[0];
    if (b.id === cur) s += HYSTERESIS;
    if (s > best) { best = s; pick = b; }
  }
  E.beh[e] = pick.id;
  pick.act(w, e);
}

// A UFO (keep exactly): carrying someone, fly to a random point; cooling down, wander; else go for the
// nearest human not in the air, anywhere within 600 px.
function ufo(w, e) {
  const E = w.E, R = w.R;
  if (E.cargo[e]) {
    if (!E.goalKind[e]) goalMove(w, e, rnd(w, R.ufo.cargoMargin, w.W - R.ufo.cargoMargin), rnd(w, R.ufo.cargoMargin, w.H - R.ufo.cargoMargin), 1);
    return;
  }
  if (E.abCd[e] > 0) { wander(w, e); return; }
  const P = w.perc;
  P.think++;
  const h = see(w, e, P_GROUNDED);
  if (h >= 0) { goalEnt(w, e, G_ABDUCT, h); return; }
  wander(w, e);
}
