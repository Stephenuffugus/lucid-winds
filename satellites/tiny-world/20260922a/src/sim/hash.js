// World hash: a fingerprint of the entire sim state. Same seed + same commands must give the same
// hash on every run and every machine; the harness and the determinism check compare these.
import { GOAL_NAMES, G_MOVE, G_GRAZE, G_BUSH, G_HOUSE, BOOL_FIELDS } from './ents.js';
import { fxShape } from './fx.js';
import { GENTLE } from './world.js';

const f64 = new Float64Array(1), u8 = new Uint8Array(f64.buffer);

function hasher() {
  let a = 0x811c9dc5 | 0, b = 0x01000193 ^ 0x5bd1e995;
  const byte = (x) => {
    a = Math.imul(a ^ x, 0x01000193);
    b = Math.imul(b ^ x, 0x5bd1e995);
    b ^= b >>> 13;
  };
  const h = {
    num(v) {
      if (v === undefined) { byte(0xfe); return h; }
      if (v === null) { byte(0xfd); return h; }
      if (typeof v === 'boolean') { byte(v ? 0xfb : 0xfa); return h; }
      f64[0] = v;
      for (let i = 0; i < 8; i++) byte(u8[i]);
      return h;
    },
    str(s) {
      if (s === undefined || s === null) { byte(0xfc); return h; }
      for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); byte(c & 255); byte(c >>> 8); }
      byte(0);
      return h;
    },
    any(v) {
      if (typeof v === 'string') return h.str(v);
      if (v && typeof v === 'object') {
        for (const k of Object.keys(v).sort()) if (v[k] !== undefined) { h.str(k); h.any(v[k]); } // an undefined field is an absent one
        byte(0xf9);
        return h;
      }
      return h.num(v);
    },
    hex: () => (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0'),
  };
  return h;
}

const ENT_FIELDS = ['x', 'y', 'hp', 'hunger', 'face', 'think', 'cd', 'breedCd', 'born', 'baby', 'flash', 'alt', 'chute', 'bounced',
  'perchT', 'carryT', 'abCd', 'bless', 'frozen', 'healT', 'dead', 'beh', 'blockT', 'pathN', 'pathI', 'pathGoal', 'pathQd', 'pathAt', 'pathFresh', 'pathTopo'];
// The prototype created these fields only when first used; every read treats a missing one as 0 (or
// false), so a missing field hashes as that value. A creature store has every field from birth.
const BOOLS = Object.fromEntries(BOOL_FIELDS.map((f) => [f, true]));
export const LAZY_DEFAULTS = { alt: 0, chute: false, bounced: 0, perchT: 0, carryT: 0, abCd: 0, bless: 0, frozen: 0, healT: 0, dead: false };

// Links are hashed by where they point: a live creature by its place in spawn order (-2 once gone), a
// thing by its tile, a UFO's passenger link as -1 minus the UFO's place (0 once the UFO is gone). The goal
// is hashed field by field as the prototype-shaped object {kind, x, y, tx, ty, run, t, s} (absent fields
// as undefined), so the hash of a world is the same as before goals became flat fields.
export function worldHash(w) {
  const h = hasher();
  h.num(w.cols).num(w.rows).num(w.tick).num(w.time).num(w.rng.s).num(w.safe).num(w.rainT).num(w.shake).num(w.nextId);
  // The settings of design 14 (day length, Gentle, Pets safe, first world), only when they differ from the sim's own
  // defaults (rules.world.sim), so every world recorded before them keeps its hash (14 §9.1).
  const d = w.R.world.sim;
  if (w.daySec !== d.daySec || GENTLE[w.gentle] !== d.gentle || w.petsSafe !== d.petsSafe || w.first !== d.first) h.num(w.daySec).num(w.gentle).num(w.petsSafe).num(w.first);
  for (let i = 0; i < w.terr.length; i++) h.num(w.terr[i]);
  for (let i = 0; i < w.eaten.length; i++) h.num(w.eaten[i]);
  h.num(w.structs.length);
  for (const s of w.structs) { h.str(s.type).num(s.tx).num(s.ty).num(s.occ).num(s.food).num(s.cd).num(s.manned); if (s.cooked) h.str('cooked'); if (s.def.hatch && s.who) h.str('egg').str(w.C.kinds[s.who - 1]); } // (whose egg it is decides what hatches: design 17)
  // Fire and the terrain waiting to turn back (14 §7 T9), in the order they are listed, and only when there is
  // any: a world with nothing alight hashes as it did before T9.
  if (w.burnN) { h.str('burn').num(w.burnN); for (let k = 0; k < w.burnN; k++) h.num(w.burnList[k]).num(w.burn[w.burnList[k]]); }
  if (w.tmr.length) { h.str('tmr').num(w.tmr.length); for (const t of w.tmr) h.num(t.i).num(t.t).num(t.to); }
  // The village (design 17): painted ground, and everything the job board remembers. It decides what gets built and
  // by whom, and until Sep 21 no gate looked at any of it: a saved village could have played on differently and
  // nothing would have said so (the review). Only when there is one, so every older world keeps its hash.
  if (w.R.flags.hashVillage && (w.claimN || w.vg.flag)) {
    const vg = w.vg;
    h.str('vg').num(w.claimN);
    for (let k = 0; k < w.claimN; k++) h.num(w.claimList[k]).num(w.claim[w.claimList[k]]);
    h.num(vg.flag ? vg.flag % w.nTiles : -1).num(vg.store).num(vg.next).num(vg.site).num(vg.cd).num(vg.age).num(vg.founding || 0).num(vg.quit || 0)
      .num(vg.lostTo || 0).num(vg.lostWet || 0).num(vg.learned || 0).num(vg.idle || 0).num(vg.posted || 0).num(Math.round(vg.near || 0)).num(vg.said || 0).num(vg.told === undefined ? -1 : vg.told);
  }
  const E = w.E, idx = new Map();
  for (let k = 0; k < w.count; k++) idx.set(w.slotH[w.order[k]], k);
  const eKey = (k) => (k ? (idx.has(k) ? idx.get(k) : -2) : null);
  const sKey = (k) => (k ? (k < 0 ? -1 - (idx.has(-k) ? idx.get(-k) : -1) : k % w.nTiles) : null);
  const U = undefined;
  h.num(w.count);
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    h.num(E.id[e]).str(E.kind[e]).str(E.name[e]);
    for (const f of ENT_FIELDS) { const v = E[f][e]; h.num(f in BOOLS ? v === 1 : v); } // flags hash as the booleans they were
    if (E.hazT[e] !== 0) h.str('hazT').num(E.hazT[e]); // (design 14 §6) zero for anyone not being warned: worlds from before it keep their hashes
    // Reactions (design 14 §5): zero for anyone not following and not calmed, so a world where no row has fired
    // hashes exactly as it did before T9.
    if (E.fol[e] !== 0 || E.folT[e] !== 0) h.str('fol').num(eKey(E.fol[e])).num(E.folT[e]);
    if (E.calm[e] !== 0) h.str('calm').num(E.calm[e]);
    if (E.errT[e] > 0) h.str('err').num(E.errT[e]).num(E.errX[e]).num(E.errY[e]); // (design 17) nobody in an older world was on an errand
    if (E.bigT[e] > 0) h.str('big').num(E.bigT[e]); // (design 17) nobody in an older world was ever a giant
    if (E.sleepT[e] !== 0) h.str('zz').num(E.sleepT[e]); // (design 18 A5) nobody in an older world was asleep
    if (E.was[e]) h.str('was').str(E.was[e]); // (design 18 A13) nothing in an older world remembered being something else
    if (E.favTile[e] >= 0) h.str('fav').num(E.favTile[e]).num(E.favN[e]); // (design 18 A14) nobody in an older world had a place of their own
    if (E.named[e]) h.str('named'); // (14 §7 T11) nobody in a world from before it was named, so those keep their hashes
    h.any(E.over[e] || null).any(E.gear[e]);
    const g = E.goalKind[e];
    if (!g) h.num(null);
    else {
      h.str(GOAL_NAMES[g]);
      if (g === G_MOVE) h.num(E.goalX[e]).num(E.goalY[e]).num(U).num(U).num(E.goalRun[e] ? 1 : U).num(null).num(null);
      else if (g === G_GRAZE) h.num(U).num(U).num(E.goalX[e]).num(E.goalY[e]).num(U).num(null).num(null);
      else if (g === G_BUSH || g === G_HOUSE) h.num(U).num(U).num(U).num(U).num(U).num(null).num(sKey(E.goalA[e]));
      else h.num(U).num(U).num(U).num(U).num(U).num(eKey(E.goalA[e])).num(null);
    }
    h.num(eKey(E.anger[e])).num(eKey(E.cargo[e])).num(sKey(E.inside[e])).num(sKey(E.perch[e]));
    for (let j = 0, K = w.R.path.waypoints; j < E.pathN[e]; j++) h.num(w.pathPts[e * K + j]); // its path
  }
  h.num(w.twisters.length);
  for (const t of w.twisters) h.num(t.x).num(t.y).num(t.t).num(t.vx).num(t.vy);
  h.num(w.fxN);
  for (let k = 0; k < w.fxN; k++) h.any(fxShape(w.fx[k])); // hashed in the prototype's shape
  return h.hex();
}
