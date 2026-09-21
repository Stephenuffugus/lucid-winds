// Undo (design 14 §3): takes back the player's place, paint, build, give and erase, rules.undo.steps (20) steps, the newest
// first. A step is one touch: the game gives every command a touch its gesture id `g`, so one Undo takes back a whole drag.
// Every command that changes the world records how to take the change back (an op); only commands carrying `g` are
// recorded (the tools' carry none). An erased creature comes back with its identity: kind, name, looks, gear, health,
// hunger, age and serial id (a new slot and handle; nothing that pointed at it follows it back). Powers, settings and the
// Hand are not undone (03 §11). The history is neither saved nor hashed: a world opened from a save has none.
import { spawn, compact, ent } from './ents.js';
import { placeStruct, removeStruct, setTerrain, struct, markDirty, log, ref } from './world.js';
import { newGear } from './content.js';

// The fields an erased creature keeps (its identity and condition); the rest start afresh, as for a creature just placed.
const KEEP = ['id', 'hp', 'hunger', 'face', 'breedCd', 'born', 'baby', 'bless', 'frozen', 'healT', 'abCd', 'named'];

export function note(w, c, op) {
  if (c.g === undefined) return;
  const U = w.undo, top = U[U.length - 1];
  if (top && top.g === c.g) { top.ops.push(op); return; }
  U.push({ g: c.g, ops: [op] });
  if (U.length > w.R.undo.steps) U.shift();
}

// A creature as an undo op can bring it back (taken before it is removed).
export function creatureOp(w, e) {
  const E = w.E, keep = {};
  for (const f of KEEP) keep[f] = E[f][e];
  return ['creature', E.kind[e], E.x[e], E.y[e], keep, E.name[e], E.over[e] ? { ...E.over[e] } : undefined, { ...E.gear[e] }, w.slotH[e]];
}
// A thing as an undo op can put it back (occupants are never restored: a house comes back empty).
export const thingOp = (s) => ['thing', s.type, s.tx, s.ty, s.food, s.cd, s.manned, s.h, s.who, s.name, s.day, s.cooked]; // (who, name, day: whose grave, whose egg)
export const tileOp = (w, i) => ['tile', i, w.terr[i], w.eaten[i]];

// Takes back the latest step. Returns false when there was none.
export function undo(w) {
  const step = w.undo.pop();
  if (!step) return false;
  for (let k = step.ops.length - 1; k >= 0; k--) apply(w, step.ops[k]);
  log(w, 'log.undone');
  return true;
}

// A creature or thing that undo brought back has a new handle: the older steps that name the old one now name it.
function remap(w, kind, from, to) {
  for (const step of w.undo) for (const op of step.ops) if (op[0] === kind && op[1] === from) op[1] = to;
}

function apply(w, op) {
  const E = w.E;
  switch (op[0]) {
    case 'unplace': { const e = ent(w, op[1]); if (e >= 0 && !E.dead[e]) { E.dead[e] = true; compact(w); } return; }
    case 'unbuild': { const s = struct(w, op[1]); if (s) removeStruct(w, s.tx, s.ty); return; }
    // A name taken back: the name it had and whether the child had given it (14 §7 T11).
    case 'name': { const e = ent(w, op[1]); if (e >= 0) { E.name[e] = op[2]; E.named[e] = op[3]; } return; }
    // Permission painted or taken back (14 §7 item 13).
    case 'claim': { const i = op[1]; if (op[2]) w.claim[i] |= 1; else w.claim[i] &= ~1; return; }
    case 'gear': { const e = ent(w, op[1]); if (e >= 0) { const g = newGear(w.C); for (const k of w.C.gearKeys) g[k] = op[2][k]; E.gear[e] = g; } return; }
    case 'tile': {
      const i = op[1], tx = i % w.cols, ty = (i - tx) / w.cols;
      if (w.terr[i] !== op[2]) setTerrain(w, tx, ty, op[2]);
      w.eaten[i] = op[3];
      if (op[3] > 0 && !w.eatenIn[i]) { w.eatenIn[i] = 1; w.eatenList[w.eatenN++] = i; } // its regrowth timer runs again
      markDirty(w, i);
      return;
    }
    case 'thing': {
      const [, type, tx, ty, food, cd, manned, was, who, name, day, cooked] = op, i = ty * w.cols + tx;
      if (w.grid[i]) return; // something else stands there now
      placeStruct(w, type, tx, ty);
      const s = w.grid[i];
      // (An erased egg that Undo brings back is still whoever's it was: it used to come back nobody's, and a
      // duck's egg hatched a chicken. The review of Sep 21.)
      if (s) { s.food = food; s.cd = cd; s.manned = manned; s.who = who || 0; s.name = name; s.day = day || 0; s.cooked = cooked || 0; remap(w, 'unbuild', was, s.h); }
      return;
    }
    case 'creature': {
      const [, kind, x, y, keep, name, over, gear, was] = op, e = spawn(w, kind, x, y); // (only a baby can be refused)
      for (const f of KEEP) E[f][e] = keep[f];
      E.name[e] = name; E.over[e] = over;
      const g = newGear(w.C);
      for (const k of w.C.gearKeys) g[k] = gear[k];
      E.gear[e] = g;
      remap(w, 'unplace', was, w.slotH[e]); remap(w, 'gear', was, w.slotH[e]);
      log(w, 'log.back', { a: ref(w, e) });
      return;
    }
    default: throw new Error('unknown undo op ' + op[0]);
  }
}
