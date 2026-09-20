// sim.command(): the only way the UI changes the world (bible 03 §11).
// Commands are plain data so a journal of them can be replayed.
import { hyp } from './math.js';
import { log, ref, inB, placeStruct, removeStruct, setTerrain, resetWorld, full, flies, GENTLE } from './world.js';
import { reactEquip, reactPlaced } from './reactions.js';
import { spawn, compact, ent, HELD } from './ents.js';
import { setPos } from './spatial.js';
import { nearPoint } from './query.js';
import { CELL } from './spatial.js';
import { usePower, useInstant } from './powers.js';
import { note, undo, creatureOp, thingOp, tileOp } from './undo.js';

// How many creatures stand in the cell of (x, y), counting no further than the crowd cap.
function inCell(w, x, y) {
  const cx = Math.max(0, Math.min(w.gw - 1, Math.floor(x / CELL))), cy = Math.max(0, Math.min(w.gh - 1, Math.floor(y / CELL)));
  let n = 0;
  for (let o = w.cellHead[cy * w.gw + cx]; o >= 0 && n < w.R.tools.crowdCap; o = w.cnext[o]) n++;
  return n;
}
// The same point in the nearest cell with room, ring by ring (rows top to bottom, left to right), into w.pp;
// false if no cell has room (the population cap stops placement long before).
function roomNear(w, x, y, cap) {
  const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), ox = x - cx * CELL, oy = y - cy * CELL, last = Math.max(w.gw, w.gh);
  for (let k = 1; k <= last; k++) for (let yy = cy - k; yy <= cy + k; yy++) for (let xx = cx - k; xx <= cx + k; xx += yy === cy - k || yy === cy + k ? 1 : 2 * k) {
    const px = Math.min(w.W - 1, Math.max(1, xx * CELL + ox)), py = Math.min(w.H - 1, Math.max(1, yy * CELL + oy));
    if (xx * CELL < 0 || yy * CELL < 0 || xx * CELL >= w.W || yy * CELL >= w.H || inCell(w, px, py) >= cap) continue;
    w.pp[0] = px; w.pp[1] = py;
    return true;
  }
  return false;
}

export function command(w, c) {
  const T = w.T, tid = w.C.tid, R = w.R.tools;
  switch (c.t) {
    case 'place': { // x,y = the tap point; the creature's feet land a little lower
      if (!inB(w, Math.floor(c.x / T), Math.floor(c.y / T))) return;
      if (full(w)) return;
      // A 16 px cell already holding crowdCap creatures takes no more: this one lands in the nearest cell with room
      // (QUESTIONS Q16: a pile of thousands on one spot made every scan from inside it visit the whole pile).
      let x = c.x, y = c.y + R.spawnDrop;
      if (inCell(w, x, y) >= R.crowdCap) { if (!roomNear(w, x, y, R.crowdCap)) return; x = w.pp[0]; y = w.pp[1]; }
      const e = spawn(w, c.kind, x, y);
      if (e >= 0) { log(w, 'log.arrived', { a: ref(w, e) }); note(w, c, ['unplace', w.slotH[e]]); }
      return;
    }
    case 'paint': {
      const t = tid[c.terrain];
      for (let k = 0; k < c.tiles.length; k += 2) {
        const tx = c.tiles[k], ty = c.tiles[k + 1];
        if (!inB(w, tx, ty)) continue;
        const i = ty * w.cols + tx;
        if (w.terr[i] === t) continue;
        const s = w.grid[i], sunk = s && (t === tid.lava || (t === tid.water && !s.def.bridge));
        if (sunk) note(w, c, thingOp(s)); // (undo puts the tile back first, then the thing on it)
        note(w, c, tileOp(w, i));
        setTerrain(w, tx, ty, t);
        if (sunk) removeStruct(w, tx, ty);
      }
      return;
    }
    case 'build':
      for (let k = 0; k < c.tiles.length; k += 2) {
        const tx = c.tiles[k], ty = c.tiles[k + 1], had = inB(w, tx, ty) && w.grid[ty * w.cols + tx];
        placeStruct(w, c.thing, tx, ty);
        const s = inB(w, tx, ty) && w.grid[ty * w.cols + tx];
        if (s && !had) { note(w, c, ['unbuild', s.h]); reactPlaced(w, s); } // design 14 §5: a thing put down beside another
      }
      return;
    case 'erase': { // tile: false once this drag has already cleared this tile
      const tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
      if (!inB(w, tx, ty)) return;
      let hitAny = false;
      const E = w.E;
      // spare: handles the eraser must leave (a named creature on its first touch, design 14 §3; the UI decides).
      for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (!E.inside[e] && hyp(E.x[e] - c.x, E.y[e] - 4 - c.y) < R.eraseRadius && !(c.spare && c.spare.includes(w.slotH[e]))) { note(w, c, creatureOp(w, e)); E.dead[e] = true; hitAny = true; } }
      compact(w);
      if (!c.tile) return;
      const i = ty * w.cols + tx;
      if (w.grid[i]) { note(w, c, thingOp(w.grid[i])); removeStruct(w, tx, ty); }
      else if (!hitAny && w.terr[i] !== tid.grass) { note(w, c, tileOp(w, i)); setTerrain(w, tx, ty, tid.grass); }
      return;
    }
    case 'lift': { // the Hand picks up creature c.h (design 14 §3): out of the world, frozen, until dropped
      const e = ent(w, c.h), E = w.E;
      if (e < 0 || E.dead[e] || E.inside[e]) return; // gone, or in a house or a UFO
      E.inside[e] = HELD; E.perch[e] = 0; E.alt[e] = 0; E.chute[e] = false; E.bounced[e] = 0; E.goalKind[e] = 0; E.pathN[e] = 0; E.pathQd[e] = 0; E.blockT[e] = 0; E.hazT[e] = 0;
      log(w, 'log.lifted', { a: ref(w, e) });
      return;
    }
    case 'drop': { // ... and lets it go at (c.x, c.y): a humanoid by parachute from high up, a flier flies on, anything else hops down
      const e = ent(w, c.h), E = w.E, H = w.R.hand;
      if (e < 0 || E.inside[e] !== HELD) return;
      const x = Math.max(1, Math.min(w.W - 1, c.x)), y = Math.max(1, Math.min(w.H - 1, c.y));
      E.inside[e] = 0; setPos(w, e, x, y); E.px[e] = x; E.py[e] = y; E.think[e] = 0;
      if (!flies(w, e)) { const hum = w.C.S[E.kind[e]].humanoid; E.alt[e] = hum ? H.dropAlt : H.hopAlt; E.chute[e] = !!hum; }
      return;
    }
    case 'liftItem': { // the Hand picks up the loose item on tile (c.tx, c.ty) (design 14 §3)
      if (!inB(w, c.tx, c.ty)) return;
      const s = w.grid[c.ty * w.cols + c.tx];
      if (s && s.def.item) removeStruct(w, c.tx, c.ty);
      return;
    }
    case 'dropItem': { // ... and lets it go at (c.x, c.y): onto the creature there (given), else onto the ground nearby
      const tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
      if (!inB(w, tx, ty) || !w.C.BLD['item:' + c.item]) return;
      if (nearPoint(w, c.x, c.y, R.giveRadius) >= 0) { command(w, { t: 'give', item: c.item, x: c.x, y: c.y }); return; }
      for (let r = 0; r <= 2; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { // the nearest tile a thing can lie on
        const x = tx + dx, y = ty + dy;
        if (!inB(w, x, y)) continue;
        const had = w.grid[y * w.cols + x];
        placeStruct(w, 'item:' + c.item, x, y);
        const put = w.grid[y * w.cols + x];
        if (!had && put) { reactPlaced(w, put); return; } // design 14 §5: a hat let go on a snowman
      }
      return;
    }
    case 'give': {
      if (!inB(w, Math.floor(c.x / T), Math.floor(c.y / T))) return;
      const e = nearPoint(w, c.x, c.y, R.giveRadius);
      if (e < 0) { log(w, 'log.giveMiss'); return; }
      const wp = w.C.WEAP[c.item], G = w.E.gear[e];
      note(w, c, ['gear', w.slotH[e], { ...G }]);
      if (wp) { G.weapon = c.item; log(w, 'log.gotItem', { a: ref(w, e), item: wp.name }); }
      else { const g = w.C.GEAR[c.item]; Object.assign(G, g.effects); log(w, 'log.gotItem', { a: ref(w, e), item: g.name }); }
      reactEquip(w, e, c.item); // design 14 §5: a crown on a chicken
      return;
    }
    case 'power': {
      const P = w.C.P[c.id];
      if (P.use === 'instant') useInstant(w, c.id);
      else usePower(w, c.id, c.x, c.y);
      return;
    }
    case 'setting':
      if (c.key === 'safe') { w.safe = !!c.value; log(w, w.safe ? 'log.safeOn' : 'log.safeOff'); }
      else if (c.key === 'gentle' && GENTLE.includes(c.value)) { w.gentle = GENTLE.indexOf(c.value); log(w, 'log.gentle.' + c.value); }
      else if (c.key === 'petsSafe') { w.petsSafe = !!c.value; log(w, w.petsSafe ? 'log.petsSafeOn' : 'log.petsSafeOff'); }
      return;
    case 'undo': // takes back the latest step of the player's (undo.js)
      undo(w);
      return;
    case 'clear':
      resetWorld(w);
      log(w, 'log.clear');
      return;
    default:
      throw new Error('unknown command ' + c.t);
  }
}
