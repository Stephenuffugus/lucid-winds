// Damage, death, and who hunts whom. Creatures are slots (ents.js).
import { log, ref, daysOf, reach, struct, dist, placeStruct, removeStruct, inB } from './world.js';
import { villageLost } from './village.js';
import { spawn } from './ents.js';
import { addFx } from './fx.js';
import { effect, mark, SRC, BLOCK } from './harm.js';
import { wander } from './ai/move.js';
import { emitAt, EVI } from './events.js';
import { story, STI, NO, kindIcon } from './story.js';
import { reactHit } from './reactions.js';

// killer: the slot of whoever landed the blow, or -1.
export function die(w, e, cause, killer = -1) {
  const E = w.E;
  if (E.dead[e]) return;
  villageLost(w, e, cause); // a village remembers what keeps killing its people (village.js)
  E.dead[e] = true;
  if (E.inside[e]) { if (E.inside[e] > 0) struct(w, E.inside[e]).occ--; E.inside[e] = 0; } // (a UFO's hold kept no count anyone read)
  addFx(w, 'bones', E.x[e], E.y[e], w.R.fx.bones);
  if (E.named[e]) grave(w, e); // somebody the child named is remembered where they fell (design 14 §7 T11)
  emitAt(w, EVI.death, e);
  log(w, 'log.died.' + cause, { a: ref(w, e), b: ref(w, killer), days: daysOf(w, e) });
  const why = w.C.deathIcon[cause], by = why === -2 ? (killer >= 0 ? kindIcon(w, killer) : NO) : why === undefined ? NO : why;
  story(w, STI.death, E.x[e], E.y[e], e, killer, -1, by, kindIcon(w, e), w.C.iconOf.bones, w.lastLog); // (cause) + (it) -> bones
  if (killer >= 0) {
    if (E.kind[killer] === 'zombie' && E.kind[e] === 'human') {
      const z = spawn(w, 'zombie', E.x[e], E.y[e]);
      if (z >= 0) {
        log(w, 'log.zombie', { a: ref(w, e), days: daysOf(w, e) });
        story(w, STI.zombie, E.x[z], E.y[z], z, killer, e, kindIcon(w, killer), kindIcon(w, e), kindIcon(w, z), w.lastLog); // zombie + human -> zombie
      }
    } else if (w.C.S[E.kind[killer]].diet !== 'none') {
      meal(w, killer, w.R.needs.killFeed);
      // Design 15 B1: a pack eats one sheep, not five. Everyone of the killer's own kind standing by the kill
      // gets most of a meal out of it too, and shows a heart.
      if (w.R.flags.killShare) {
        const N = w.R.needs, r = N.shareRange, kind = E.kind[killer];
        for (let j = 0; j < w.count; j++) {
          const o = w.order[j];
          if (o === killer || o === e || E.dead[o] || E.inside[o] || E.kind[o] !== kind) continue;
          const dx = E.x[o] - E.x[e], dy = E.y[o] - E.y[e];
          if (dx * dx + dy * dy > r * r) continue;
          meal(w, o, N.killFeed * N.shareFrac);
          addFx(w, 'heart', E.x[o], E.y[o] - 6, w.R.fx.heart);
        }
      }
    }
  }
}

// A meal (design 15 B1): it fills the belly, it settles the creature for a while (it starts no hunt while
// satedT runs), and it counts towards what a predator needs before it raises young.
export function meal(w, e, amount) {
  const E = w.E, R = w.R;
  E.hunger[e] = Math.max(0, E.hunger[e] - amount);
  if (R.flags.sated) E.satedT[e] = R.needs.satedSec;
  if (E.feeds[e] < 255) E.feeds[e]++;
}

const UNARMED = Object.freeze({}); // weapon fields all absent: fists

// Mitigation order: bless, shield block chance, armor (leather -1 min 1, iron /2, diamond /3, rounded up).
export function hurt(w, t, dmg) {
  const E = w.E, G = E.gear[t];
  if (E.bless[t] > 0) { addFx(w, 'block', E.x[t], E.y[t] - 9, w.R.fx.block); emitAt(w, EVI.block, t); return 0; }
  if (G.shield && w.rng.float() < G.shield) { addFx(w, 'block', E.x[t], E.y[t] - 9, w.R.fx.block); emitAt(w, EVI.block, t); return 0; }
  const a = G.armor || (G.shell ? 1 : 0); // a turtle shell takes a knock like leather (design 14 §7 T10)
  if (a === 1) dmg = Math.max(1, dmg - 1);
  else if (a === 2) dmg = Math.ceil(dmg / 2);
  else if (a === 3) dmg = Math.ceil(dmg / 3);
  E.hp[t] -= dmg;
  E.flash[t] = w.R.combat.hitFlash;
  emitAt(w, EVI.hit, t);
  return dmg;
}

export function hit(w, a, t) {
  const E = w.E;
  if (E.perch[t] || E.alt[t] > 0) { E.goalKind[a] = 0; return; }
  if (effect(w, t, SRC.attack) === BLOCK) { balk(w, a); return; }
  const d = dist(w, a, t), wp = w.C.WEAP[E.gear[a].weapon] || UNARMED;
  let dmg = w.C.S[E.kind[a]].atk + (wp.dmg || 0);
  if (wp.shot && d > w.R.combat.meleeReach) {
    dmg = wp.shot;
    const f = addFx(w, 'arrow', E.x[a], E.y[a] - 4, w.R.fx.arrow); f.x2 = E.x[t]; f.y2 = E.y[t] - 4; f.col = wp.col;
    emitAt(w, EVI.shot, a);
  }
  if (E.baby[a]) dmg = Math.ceil(dmg / 2);
  if (wp.harmless) { // a pillow or a bubble wand: the swing, the sound and the picture, and nobody is hurt
    if (w.R.flags.hitFirst) reactHit(w, a, t, E.gear[a].weapon); // a pillow can still set a row off
    addFx(w, 'block', E.x[t], E.y[t] - 9, w.R.fx.block);
    emitAt(w, EVI.hit, t);
    E.cd[a] = wp.cd || w.R.combat.defaultCd;
    return;
  }
  // design 14 §5: what the blow was made of met what it landed on. First, so a row may turn it away.
  const turned = w.R.flags.hitFirst ? reactHit(w, a, t, E.gear[a].weapon) : false;
  if (!turned) hurt(w, t, dmg);
  if (!w.R.flags.hitFirst) reactHit(w, a, t, E.gear[a].weapon);
  E.anger[t] = w.slotH[a];
  E.cd[a] = wp.cd || w.R.combat.defaultCd;
  if (!turned && E.hp[t] <= 0) die(w, t, 'killed', a);
}

// An attack the harm table blocks (a guarded target, 14 §6): the attacker shows "?", forgets it and wanders off.
export function balk(w, a) {
  const E = w.E;
  E.goalKind[a] = 0; E.anger[a] = 0;
  mark(w, 'huh', E.x[a], E.y[a] - 10, w.R.fx.huh);
  wander(w, a);
}

// Diet filter plus the harm table: nothing hunts a creature an attack cannot touch (a human under Safe, a pet under
// Pets safe).
export function hunts(w, a, b) {
  return huntsKind(w, a, b) && effect(w, b, SRC.attack) !== BLOCK;
}
// Its diet and reach alone: whether a would hunt b if nothing protected b.
export function huntsKind(w, a, b) {
  const E = w.E, h = w.C.S[E.kind[a]].hunts;
  if (!h || !(h === 'all' ? E.kind[b] !== E.kind[a] : h.includes(E.kind[b]))) return false;
  return reach(w, a, b);
}

export const isFoe = (w, e) => w.C.S[w.E.kind[e]].enemy || w.C.S[w.E.kind[e]].hunts === 'all';
export const armed = (w, e) => !!w.E.gear[e].weapon;

// A grave for a creature the child had named: an ordinary thing on the nearest free tile, carrying who it was and
// what day it was. A world keeps rules.grave.max of them, oldest first, so a bad day cannot fill a meadow with
// stones; max 0 turns them off entirely (which is how a world recorded before graves is reproduced).
function grave(w, e) {
  const G = w.R.grave, E = w.E;
  if (!(G.max > 0)) return;
  const T = w.T, tx0 = Math.floor(E.x[e] / T), ty0 = Math.floor(E.y[e] / T);
  let put = null;
  for (let r = 0; r <= 2 && !put; r++) for (let dy = -r; dy <= r && !put; dy++) for (let dx = -r; dx <= r && !put; dx++) {
    const tx = tx0 + dx, ty = ty0 + dy;
    if (!inB(w, tx, ty) || w.grid[ty * w.cols + tx]) continue;
    placeStruct(w, 'grave', tx, ty);
    put = w.grid[ty * w.cols + tx] || null;
  }
  if (!put) return;
  put.who = w.slotH[e];
  put.name = E.name[e];
  put.day = Math.floor(w.time / w.daySec) + 1;
  while (w.graves.length > G.max) { const old = w.graves[0]; removeStruct(w, old.tx, old.ty); }
  log(w, 'log.grave', { a: ref(w, e) });
}
