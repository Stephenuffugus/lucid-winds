// Deciding (01 §5-6, M1-3): perception buckets filled at most once per think, and behaviours scored by
// utility; the highest wins, the current one gets +10 so creatures do not dither. Scores are the bible's
// table; what each behaviour does is the prototype's. A behaviour's score reads buckets, never the world.
import { rnd } from '../rng.js';
import { reach, dist, isNight, struct, removeStruct, inB, hiddenIn } from '../world.js';
import { nearest, nearestHuman, findStruct, findGrass } from '../query.js';
import { gatherAny } from '../spatial.js';
import { hunts, huntsKind, armed, balk } from '../combat.js';
import { ent, goalMove, goalEnt, G_MOVE, G_ATTACK, G_ABDUCT, G_GRAZE, G_BUSH, G_HOUSE, G_MATE, G_JOIN, G_FETCH, G_STORE, G_BUILD, G_TAKE } from '../ents.js';
import { wander } from './move.js';
import { effect, SRC, BLOCK } from '../harm.js';
import { story, STI, NO, kindIcon } from '../story.js';
import { reactWhile } from '../reactions.js';

// Scan filters, f(w, e, o): e is the creature deciding, o a candidate (slots). Named functions, not
// per-call closures, so a decision allocates nothing.
export const fHumanGrounded = (w, e, o) => w.E.kind[o] === 'human' && !(w.E.alt[o] > 0);
// Filters are pure, so their tests are ordered cheapest first (the kind tests before reach()).
const fThreat = (w, e, o) => (w.E.hunger[o] > w.R.ai.threatHunger || w.C.S[w.E.kind[o]].diet === 'none' || w.E.anger[o] === w.slotH[e]) && hunts(w, o, e);
const fHuntsMe = (w, e, o) => hunts(w, o, e);
// What an armed person picks a fight with (design 15 A1). Not "anything that could eat me": a danger, by the
// same test everyone else uses to decide what to run from (hungry hunter, a monster, or it already hit me), plus
// anything that is at this moment attacking a person or a pet. That second half is the first helping behaviour in
// the game, and it is what a child expects of somebody holding a sword.
const fArmedTarget = (w, e, o) => fThreat(w, e, o) || (defending(w, o) && reach(w, e, o));
function defending(w, o) {
  const E = w.E;
  if (E.goalKind[o] !== G_ATTACK) return false;
  const kinds = w.C.kinds, k = E.goalB[o];
  if (k < 0 || k >= kinds.length) return false;
  const sp = w.C.S[kinds[k]];
  return (kinds[k] === 'human' || !!sp.pet) && E.kind[o] !== 'human'; // a person defending another person is not a target
}
// A guardian's target: an enemy, a hunt-everything creature, or a non-human after a human. goalB is the
// target's kind even after the target has died, as the prototype read goal.t.kind.
const fGuardTarget = (w, e, o) => (w.C.S[w.E.kind[o]].enemy || w.C.S[w.E.kind[o]].hunts === 'all' ||
  (w.E.goalKind[o] === G_ATTACK && w.E.goalB[o] === w.C.kid.human && w.E.kind[o] !== 'human')) && reach(w, e, o);
const fHurtHuman = (w, e, o) => w.E.kind[o] === 'human' && w.E.hp[o] < w.C.S.human.hp * w.R.ai.healerHurt;
const fHuman = (w, e, o) => w.E.kind[o] === 'human';
const fReachableHuman = (w, e, o) => w.E.kind[o] === 'human' && reach(w, e, o);
const fPrey = (w, e, o) => hunts(w, e, o) && !(w.E.kind[e] === 'human' && w.E.hunger[e] < w.R.needs.humanHunts) && !inCover(w, e, o);
// Design 15 C1 (Tall grass): something small, or a baby, standing in cover is only found close up.
function inCover(w, e, o) {
  if (!w.R.flags.cover || !hiddenIn(w, o)) return false;
  const E = w.E, dx = E.x[e] - E.x[o], dy = E.y[e] - E.y[o], r = w.R.ai.coverSee;
  return dx * dx + dy * dy > r * r;
}
const fMate = (w, e, o) => w.E.kind[o] === w.E.kind[e] && !w.E.baby[o] && w.E.hunger[o] < w.R.needs.hungry && w.E.breedCd[o] <= 0;
// Thing filters, f(s).
const sFreeHome = (s) => s.def.home && s.occ < s.def.home;
const sFood = (s) => s.def.food && s.food >= 1;
// Something lying on the ground (T7 makes one for every weapon and gear piece: a thing called item:<id>).
const sLoose = (s) => !!s.def.item;



// Nothing alive can hunt creature e (no creature of a kind that hunts its kind is listed, or it is a human while
// the harm table forbids attacking it): a threat scan would find nothing, so it is skipped. The same answer, without visiting a crowd.
function noHunters(w, e) {
  if (effect(w, e, SRC.attack) === BLOCK) return true; // nothing may attack it (harm.js)
  const H = w.C.huntersOf[w.C.kid[w.E.kind[e]]], kc = w.kindCount;
  for (let i = 0; i < H.length; i++) if (kc[H[i]] > 0) return false;
  return true;
}
// No enemy and no hunt-everything creature is listed: then a guardian's only possible targets are non-humans after
// a human, all of them in w.atkList (ents.js goalEnt). They are walked with nearestAt's rule (the least distance,
// ties to the lower id): the same answer as the ring scan, without visiting a crowd of allies.
function noFoes(w) {
  const F = w.C.foeKinds, kc = w.kindCount;
  for (let i = 0; i < F.length; i++) if (kc[F[i]] > 0) return false;
  return true;
}
function guardFromList(w, e, r) {
  const E = w.E, id = E.id, x = E.x[e], y = E.y[e], hk = w.C.kid.human, L = w.atkList, B = w.qp;
  let best = -1, n = 0;
  B[0] = x; B[1] = y; B[2] = r;
  for (let k = 0; k < w.nAtk; k++) {
    const o = L[k];
    if (!(E.goalKind[o] === G_ATTACK && E.goalB[o] === hk && E.kind[o] !== 'human')) { w.atkIn[o] = 0; continue; } // not after a human any more
    L[n++] = o;
    if (o === e || E.dead[o] || E.inside[o] || E.perch[o]) continue;
    const dx = x - E.x[o], dy = y - E.y[o], d = Math.sqrt(dx * dx + dy * dy);
    if (!(d < B[2] || (d === B[2] && best >= 0 && id[o] < id[best]))) continue;
    if (reach(w, e, o)) { B[2] = d; best = o; }
  }
  w.nAtk = n;
  if (w.onScan !== null) w.onScan(e, r, fGuardTarget, best); // tools/nearest-fixture.mjs checks every answer
  return best;
}
function none(w, e, r, f) { if (w.onScan !== null) { w.qp[0] = w.E.x[e]; w.qp[1] = w.E.y[e]; w.onScan(e, r, f, -1); } return -1; }

// ---------- perception: buckets, each computed at most once per think, on first use ----------
const P_THREAT = 0, P_ARMED = 1, P_GUARD = 2, P_HURT = 3, P_HUMAN = 4, P_RAID = 5, P_PREY = 6, P_MATE = 7, P_GROUNDED = 8, P_HOME = 9, P_FOOD = 10, P_GRASS = 11, P_CROP = 12;
const NB = 13;
// The creature a bucket holds (slot or -1), a thing (as its handle, 0 for none) or a grass tile (or -1).
function see(w, e, b) {
  const P = w.perc;
  if (P.stamp[b] === P.think) return P.val[b];
  const A = w.R.ai;
  let v;
  if (b === P_THREAT) v = noHunters(w, e) ? none(w, e, A.threatScan, fThreat) : nearest(w, e, A.threatScan, fThreat);
  else if (b === P_ARMED) {
    // Nothing hunts this creature, so there is nothing to fight — unless the defending rule is on and something
    // is attacking one of ours, which is the one case the "no hunters" shortcut cannot see (design 15 A1).
    const D = w.R.flags.armedDefends, f = D ? fArmedTarget : fHuntsMe;
    v = noHunters(w, e) && !(D && w.nAtk > 0) ? none(w, e, A.armedScan, f) : nearest(w, e, A.armedScan, f);
  }
  else if (b === P_GUARD) v = noFoes(w) ? guardFromList(w, e, A.allyScan) : nearest(w, e, A.allyScan, fGuardTarget);
  else if (b === P_HURT) v = nearestHuman(w, e, A.healerScan, fHurtHuman);
  else if (b === P_HUMAN) v = nearestHuman(w, e, A.allyFollowScan, fHuman);
  else if (b === P_RAID) v = nearestHuman(w, e, A.enemyScan, fReachableHuman);
  else if (b === P_PREY) v = nearest(w, e, A.huntScan, fPrey);
  else if (b === P_MATE) v = nearest(w, e, w.R.breed.scan, fMate);
  else if (b === P_GROUNDED) v = nearestHuman(w, e, w.R.ufo.seekScan, fHumanGrounded);
  else if (b === P_HOME) { const s = findStruct(w, e, A.homeScan, sFreeHome); v = s ? s.h : 0; }
  else if (b === P_FOOD) { const s = findStruct(w, e, w.C.S[w.E.kind[e]].diet === 'herb' ? A.herbFoodScan : A.omniFoodScan, sFood); v = s ? s.h : 0; }
  else if (b === P_CROP) v = findGrass(w, e, true); // design 15 C1: a ripe field, for those who do not graze
  else v = findGrass(w, e); // P_GRASS (each candidate tile draws one random number)
  P.val[b] = v; P.stamp[b] = P.think;
  return v;
}
// sc: where a behaviour's score() leaves its score (a number returned from a call the engine does not
// inline would be boxed; score() returns only whether it is available).
export function createPerception(w) { w.perc = { think: 0, val: new Float64Array(NB), stamp: new Float64Array(NB).fill(-1), bad: -1, take: 0, sc: new Float64Array(1) }; }
const put = (w, s) => { w.perc.sc[0] = s; return true; };

// Who it would face: a threat in reach, or whoever last hit it (anger is forgotten once that creature is
// gone, dead, inside, out of range or out of reach, and at once if it cannot be attacked: harm.js).
function badOne(w, e) {
  const E = w.E, A = w.R.ai, ang = ent(w, E.anger[e]);
  if (ang >= 0 && effect(w, ang, SRC.attack) === BLOCK) E.anger[e] = 0;
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

// A weapon lying about (the loose thing carries the item's id; weapons.json says which ids are weapons).
const sWeaponOf = (w) => (s) => !!s.def.item && !!w.C.WEAP[s.def.item];
// Is this worth picking up? Its slot must be empty: a weapon if the hands are empty, a gear piece if that slot is.
export function wants(w, e, s) {
  const id = s.def.item, G = w.E.gear[e], wp = w.C.WEAP[id];
  if (wp) return !G.weapon;
  const g = w.C.GEAR[id];
  return !!g && !G[g.slot];
}
// One creature in three is the curious one, always the same one (design 15 A4; personalities take this over in B2).
const curious = (w, e) => w.E.id[e] % 3 === 0;

// Design 15 A4b: will this creature pick THIS item up, right now? Its species list says which items, and each
// rule says when: always, only while Safe is off (monsters arming themselves), or Safe off and after dark (the
// ninja). A species with no list in creatures.json never picks anything up, which is most of them.
export function canGrab(w, e, id) {
  const rules = w.C.GRAB[w.E.kind[e]];
  if (!rules) return false;
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    // when: 0 always · 1 only while Safe is off · 2 Safe off and after dark
    if (!(r.when === 0 || (r.when === 1 ? !w.safe : !w.safe && isNight(w)))) continue;
    if (r.weapons && w.C.WEAP[id]) return true;
    if (r.gear && w.C.GEAR[id]) return true;
    if (r.ids && r.ids.has(id)) return true;
    if (r.tags) { const t = w.C.ITAG[id]; if (t) for (let k = 0; k < r.tags.length; k++) if (t.has(r.tags[k])) return true; }
  }
  return false;
}

// Design 15 B1: is there food here for another mouth? Two readings of the same question, both on the ground
// within rules.graze.searchTiles: enough of it is grass still standing (breed.grazeFrac of every tile in the
// square), and there is enough of that grass to go round the mouths already on it (breed.grazePerHead tiles
// each). The second is what actually holds a flock: grass grows back faster than a few dozen sheep can eat it,
// so without it a field of any size fills to the species cap (measured, tools/balance.mjs).
function foodForAnother(w, e) {
  const E = w.E, B = w.R.breed, T = w.T, n = w.R.graze.searchTiles;
  const cx = Math.floor(E.x[e] / T), cy = Math.floor(E.y[e] / T);
  let good = 0;
  for (let y = cy - n; y <= cy + n; y++) for (let x = cx - n; x <= cx + n; x++) {
    if (!inB(w, x, y)) continue;
    const i = y * w.cols + x;
    if (w.C.TERR[w.terr[i]].graze && w.eaten[i] <= 0) good++;
  }
  const side = n * 2 + 1;
  if (good < B.grazeFrac * side * side) return false;
  let mouths = 0;
  if (B.grazePerHead > 0) { // (0 turns this reading off and leaves the first one)
    const r = n * T, kind = E.kind[e], m = gatherAny(w, E.x[e], E.y[e], r);
    for (let k = 0; k < m; k++) { const o = w.near[k]; if (!E.dead[o] && !E.inside[o] && E.kind[o] === kind) mouths++; }
  }
  return good >= mouths * B.grazePerHead;
}

// How many people already belong to the village.
function folk(w) { let n = 0; for (let k = 0; k < w.count; k++) if (w.E.vill[w.order[k]]) n++; return n; }

// ---------- behaviours ----------
// id, the most it can score (for stopping early), score(w, e): whether it is available now (its score
// left in w.perc.sc[0]),
// act(w, e): sets the goal. `bad` is computed once per think by the first behaviour that needs it.
export const B_FLEE = 1, B_FIGHT = 2, B_SHELTER = 3, B_RAID = 4, B_GUARD = 5, B_EAT = 6, B_HUNT = 7, B_MATE = 8, B_IDLE = 9, B_FOLLOW = 10;
export const B_JOIN = 11, B_BUILD = 12, B_GATHER = 13; // the village (14 §7 item 13)
export const B_TAKE = 14; // picking something up off the ground (design 15 A4)
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
  { id: B_FOLLOW, max: 90, // a reaction set it following someone (14 §5: the crown's parade)
    // max is only the early-break's upper bound, not what this scores (70): sitting here with a lower max would
    // stop the walk before eating and hunting for a creature that is already scoring well, and change decisions
    // that have nothing to do with following.
    score(w, e) {
      const E = w.E;
      if (!(E.fol[e] && E.folT[e] > 0)) return false;
      const lead = ent(w, E.fol[e]);
      if (lead < 0 || E.inside[lead]) { E.fol[e] = 0; E.folT[e] = 0; return false; }
      return put(w, 70);
    },
    act(w, e) {
      const E = w.E, A = w.R.ai, lead = ent(w, E.fol[e]);
      const gx = E.x[lead] + rnd(w, -A.guardJitter, A.guardJitter), gy = E.y[lead] + rnd(w, -A.guardJitter, A.guardJitter);
      E.goalKind[e] = G_MOVE; E.goalX[e] = gx; E.goalY[e] = gy; E.goalRun[e] = 0;
      E.think[e] = A.guardThink;
    } },
  // Design 15 A4: something on the ground it wants. Two reasons, and they are not the same behaviour at all:
  //   92  "grab it!"  unarmed, something dangerous about, and a weapon on the ground nearer than the danger.
  //   20  "ooh"       safe and fed, the slot empty, and curious about it (until personalities land, one creature
  //                   in three, by its own id, so the same one is always the curious one).
  // Nothing is reserved: two may walk to the same sword. Whoever arrives first takes it and the other shrugs.
  { id: B_TAKE, max: 92,
    score(w, e) {
      const E = w.E, R = w.R;
      if (!R.flags.take) return false;
      // A4a was people only. A4b reads the species' own `grabs` list (content.js), so a goblin takes a dagger
      // while Safe is off and a zombie keeps any hat it walks into. With flags.grabs off, only people take.
      if (R.flags.grabs ? !w.C.GRAB[E.kind[e]] : E.kind[e] !== 'human') return false;
      const mine = (s) => !R.flags.grabs || canGrab(w, e, s.def.item);
      const bad = w.perc.bad;
      if (bad >= 0 && !armed(w, e)) { // grab it
        const s = findStruct(w, e, R.ai.takeGrabScan, (s) => sWeaponOf(w)(s) && mine(s));
        if (s) {
          const E2 = w.E, dx = E2.x[e] - (s.tx * w.T + 4), dy = E2.y[e] - (s.ty * w.T + 4);
          const toItem = Math.sqrt(dx * dx + dy * dy), toBad = dist(w, e, bad);
          if (toItem < toBad) { w.perc.take = s.h; return put(w, 92); }
        }
      }
      if (bad >= 0 || E.hunger[e] > R.needs.hungry) return false; // frightened or hungry: not now
      if (!curious(w, e)) return false;
      const s2 = findStruct(w, e, R.ai.takeOohScan, (s) => sLoose(s) && wants(w, e, s) && mine(s));
      if (!s2) return false;
      w.perc.take = s2.h;
      return put(w, 20);
    },
    act(w, e) {
      const s = struct(w, w.perc.take);
      if (!s) return;
      w.E.goalKind[e] = G_TAKE; w.E.goalA[e] = s.h; w.E.goalRun[e] = w.perc.bad >= 0 ? 1 : 0;
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
      if (!(isNight(w) || E.hp[e] < w.C.S.human.hp * A.homeHpBelow)) return false;
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
      // Design 15 C1: people and the other omnivores do not graze, but they will pick a ripe field.
      else if (!food && !(w.R.flags.crops && see(w, e, P_CROP) >= 0)) return false;
      return hungerScore(w, e);
    },
    act(w, e) {
      const E = w.E, food = see(w, e, P_FOOD), sp = w.C.S[E.kind[e]];
      if (food) { E.goalKind[e] = G_BUSH; E.goalA[e] = food; return; }
      const g = sp.diet === 'herb' ? see(w, e, P_GRASS) : see(w, e, P_CROP);
      E.goalKind[e] = G_GRAZE; E.goalX[e] = g % w.cols; E.goalY[e] = (g - E.goalX[e]) / w.cols;
    } },
  { id: B_HUNT, max: 85, // hungry hunters: the nearest prey (humans only above 55)
    score(w, e) {
      const E = w.E;
      // Design 15 B1: enough is enough. After a meal a hunter rests (satedT) even once it is hungry again, so
      // a pack does not take the whole flock in an afternoon.
      if (w.R.flags.sated && E.satedT[e] > 0) return false;
      if (!(E.hunger[e] > w.R.needs.hungry && w.C.S[E.kind[e]].hunts)) return false;
      return see(w, e, P_PREY) >= 0 && hungerScore(w, e);
    },
    act(w, e) { goalEnt(w, e, G_ATTACK, see(w, e, P_PREY)); } },
  { id: B_MATE, max: 30, // fed, healthy adults ready to breed, under both caps
    score(w, e) {
      const E = w.E, B = w.R.breed, kind = E.kind[e], sp = w.C.S[kind];
      if (!(sp.breed && !E.baby[e] && E.hunger[e] < w.R.needs.hungry && E.breedCd[e] <= 0 && E.hp[e] >= sp.hp * B.hpFrac)) return false;
      // w.kindCount counts creatures that died this step too, as the prototype's filter did before compaction.
      if (!(see(w, e, P_MATE) >= 0 && w.count < B.popCap && w.kindCount[w.C.kid[kind]] < B.speciesCap)) return false;
      // Design 15 B1: young are born where there is food for them. A hunter has to have caught two meals since
      // its last litter; a grazer wants half the ground round it still standing.
      // Hunters proper (diet carn) and grazers (diet herb) each have their own test. Omnivores — people, bears,
      // pigs — are left with the old rule: they eat anything, so neither reading says much about them, and a
      // village that cannot have children is not what this ticket is for.
      if (w.R.flags.bornFed) {
        if (sp.diet === 'carn') { if (E.feeds[e] < B.feedsPerLitter) return false; }
        else if (sp.diet === 'herb' && !foodForAnother(w, e)) return false;
      }
      return put(w, 30);
    },
    act(w, e) { goalEnt(w, e, G_MATE, see(w, e, P_MATE)); } },
  // The village (design 14 §7 item 13), all below mating and above idling: a person joins a flag it can see,
  // takes the one job that is posted, and carries food to the flag. Nothing here is above eating or fleeing, so a
  // villager still runs from a wolf and still goes to eat.
  { id: B_BUILD, max: 24,
    score(w, e) {
      const E = w.E, vg = w.vg;
      if (!E.vill[e] || vg.site < 0) return false;
      if (vg.worker && vg.worker !== w.slotH[e]) return false;
      return put(w, 24);
    },
    act(w, e) {
      const E = w.E, vg = w.vg, i = vg.site;
      vg.worker = w.slotH[e];
      E.goalKind[e] = G_BUILD; E.goalX[e] = (i % w.cols) * w.T + 4; E.goalY[e] = ((i / w.cols) | 0) * w.T + 6; E.goalRun[e] = 0;
    } },
  { id: B_GATHER, max: 22,
    score(w, e) {
      const E = w.E, V = w.R.village;
      if (!E.vill[e] || w.vg.store >= V.storeMax) return false;
      if (E.carry[e]) return put(w, 22);
      return see(w, e, P_FOOD) ? put(w, 22) : false;
    },
    act(w, e) {
      const E = w.E;
      if (E.carry[e]) { const f = struct(w, w.vg.flag); if (!f) return; E.goalKind[e] = G_STORE; E.goalX[e] = f.tx * w.T + 4; E.goalY[e] = f.ty * w.T + 6; E.goalRun[e] = 0; return; }
      const food = see(w, e, P_FOOD);
      if (food) { E.goalKind[e] = G_FETCH; E.goalA[e] = food; }
    } },
  { id: B_JOIN, max: 25,
    score(w, e) {
      const E = w.E, V = w.R.village;
      if (E.kind[e] !== 'human' || E.vill[e] || !w.vg.flag) return false;
      const f = struct(w, w.vg.flag);
      if (!f) return false;
      const dx = E.x[e] - (f.tx * w.T + 4), dy = E.y[e] - (f.ty * w.T + 4);
      if (dx * dx + dy * dy > V.joinScan * V.joinScan) return false;
      return folk(w) < V.maxFolk ? put(w, 25) : false;
    },
    act(w, e) {
      const E = w.E, f = struct(w, w.vg.flag);
      if (!f) return;
      E.goalKind[e] = G_JOIN; E.goalX[e] = f.tx * w.T + 4; E.goalY[e] = f.ty * w.T + 6; E.goalRun[e] = 0;
    } },
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

// Design 14 §6: a blocked attack shows. A creature that would go for a guarded one close by (a person under Safe, a pet
// under Pets safe, within rules.harm.balkRadius), and is hostile or hungry enough to, balks instead of ignoring it:
// "?" over it (one at a time), then it wanders off. It never sets out after one (01: under Safe the hunt reads as ignore).
function wouldBalk(w, e) {
  const E = w.E, sp = w.C.S[E.kind[e]];
  if (!(sp.enemy || sp.hunts === 'all' || E.hunger[e] > w.R.needs.hungry)) return false;
  return nearest(w, e, w.R.harm.balkRadius, fBalk) >= 0;
}
const fBalk = (w, a, b) => huntsKind(w, a, b) && effect(w, b, SRC.attack) === BLOCK;

// e: the deciding creature's slot.
export function decide(w, e) {
  const E = w.E, sp = w.C.S[E.kind[e]];
  E.think[e] = w.R.ai.think;
  if (sp.ufo) { ufo(w, e); return; }
  if (w.C.canBalk[w.C.kid[E.kind[e]]] && (w.safe || w.petsSafe) && E.goalKind[e] !== G_ATTACK && wouldBalk(w, e)) { balk(w, e); return; }
  const P = w.perc;
  P.think++;
  reactWhile(w, e); // design 14 §5: `while` rows are re-checked on the wearer's think tick and nowhere else
  P.bad = badOne(w, e);
  // Behaviours in order of the most they can score; stop once none left could beat the best (a later one
  // could still be the current one, +10). Equal scores keep the earlier one: the prototype's order.
  const cur = E.beh[e];
  let best = -1, pick = null;
  for (let k = 0; k < BEHAVIOURS.length; k++) {
    const b = BEHAVIOURS[k];
    if (best >= b.max + HYSTERESIS) break;
    if (E.calm[e] > 0 && (b.id === B_FIGHT || b.id === B_HUNT || b.id === B_RAID)) continue; // peaceful (14 §5)
    if (!b.score(w, e)) continue;
    let s = P.sc[0];
    if (b.id === cur) s += HYSTERESIS;
    if (s > best) { best = s; pick = b; }
  }
  E.beh[e] = pick.id;
  pick.act(w, e);
  if (pick.id !== cur) why(w, e, pick.id);
}

// Design 14 §4: a creature that changes what it is doing for a reason shows the reason (a story record, output only): the
// threat it flees, hunger, night or its wounds (going home), love.
function why(w, e, b) {
  const E = w.E, W = w.C.whyIcon, x = E.x[e], y = E.y[e];
  if (b === B_FLEE) { const bad = w.perc.bad; story(w, STI.fled, x, y, e, bad, -1, bad >= 0 ? kindIcon(w, bad) : NO, NO, NO, null); }
  else if (b === B_EAT || b === B_HUNT) story(w, STI.hungry, x, y, e, -1, -1, W.hungry, NO, NO, null);
  else if (b === B_SHELTER) story(w, STI.shelter, x, y, e, -1, -1, isNight(w) ? W.night : W.hurt, NO, NO, null);
  else if (b === B_MATE) story(w, STI.love, x, y, e, -1, -1, W.love, NO, NO, null);
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
