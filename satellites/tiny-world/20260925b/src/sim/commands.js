// sim.command(): the only way the UI changes the world (bible 03 §11).
// Commands are plain data so a journal of them can be replayed.
import { hyp } from './math.js';
import { log, ref, inB, placeStruct, removeStruct, setTerrain, keepPaint, resetWorld, full, flies, GENTLE, wake } from './world.js';
import { reactEquip, reactPlaced, reactEnter, reactPoke, reactPokeThing } from './reactions.js';
import { rebuildGear, equipOn } from './content.js';
import { claimTile, IN as CL_IN, noBuild } from './village.js';
import { spawn, compact, ent, HELD } from './ents.js';
import { setPos } from './spatial.js';
import { nearPoint } from './query.js';
import { CELL } from './spatial.js';
import { usePower, useInstant } from './powers.js';
import { note, undo, creatureOp, thingOp, tileOp } from './undo.js';

// How many creatures stand in the cell of (x, y), counting no further than the crowd cap.
// A name a child typed: no control characters, no double spaces, cut to the bible's length (rules.name.max).
export function cleanName(raw, max) {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw.trim()) {
    const c = ch.codePointAt(0);
    if (c < 32 || (c >= 127 && c < 160)) continue;
    if (ch === ' ' && out.endsWith(' ')) continue;
    out += ch;
    if ([...out].length >= max) break;
  }
  return out.trim();
}

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

// A creature the player has just put down, or let go of, has arrived where it stands: whatever is on that tile
// meets it, the same as if it had walked there. A cow set on a catapult goes up; a slime dropped in lava
// becomes a lava slime. Before this only walking counted, so a child putting a cow on a catapult saw nothing.
function arrived(w, e) {
  const tx = Math.floor(w.E.x[e] / w.T), ty = Math.floor(w.E.y[e] / w.T);
  if (!inB(w, tx, ty)) return;
  const i = ty * w.cols + tx;
  // Let go of high up, it has not arrived anywhere yet: coming down is what arrives (flags.landIsArriving), and
  // answering it here as well would launch a cow off a catapult it is still floating above.
  if (w.R.flags.landIsArriving && w.R.flags.markAfter && w.E.alt[e] > 0) { if (w.rx.lastTile.length > e) w.rx.lastTile[e] = -1; return; }
  if (w.rx.lastTile.length > e) w.rx.lastTile[e] = i;
  w.rx.byHand = true; // (her own hand: a row's world-wide cooldown does not refuse her. reactions.js run())
  reactEnter(w, e, i);
  w.rx.byHand = false;
  if (w.R.flags.markAfter && w.rx.lastTile.length > e) { // (the same rule as the sweep's: update.js enteredSweep)
    const x2 = Math.floor(w.E.x[e] / w.T), y2 = Math.floor(w.E.y[e] / w.T);
    if (inB(w, x2, y2)) w.rx.lastTile[e] = w.E.alt[e] > 0 && w.R.flags.landIsArriving ? -1 : y2 * w.cols + x2;
  }
}

// A loose item set down on the nearest tile that can hold one, from (tx, ty) outwards (design 14 §3, §7 T7).
// Returns the thing, or null when nothing within two rings is free. This is the only way an item reaches the
// ground, and it is what lets a hat meet a snowman: reactPlaced looks at whatever is already standing near by.
function putItem(w, c, item, tx, ty) {
  if (!w.C.BLD['item:' + item]) return null;
  for (let r = 0; r <= 2; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = tx + dx, y = ty + dy;
    if (!inB(w, x, y) || w.grid[y * w.cols + x]) continue;
    placeStruct(w, 'item:' + item, x, y);
    const put = w.grid[y * w.cols + x];
    if (!put) continue; // lava, or water without a bridge (world.js placeStruct)
    note(w, c, ['unbuild', put.h]); // before the reaction, the same order as the build case
    reactPlaced(w, put, true); // design 14 §5: a hat let go on a snowman
    return put;
  }
  return null;
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
      if (e >= 0) {
        log(w, 'log.arrived', { a: ref(w, e) }); note(w, c, ['unplace', w.slotH[e]]);
        if (w.R.flags.liveThings) arrived(w, e);
      }
      return;
    }
    case 'paint': {
      const t = tid[c.terrain];
      for (let k = 0; k < c.tiles.length; k += 2) {
        const tx = c.tiles[k], ty = c.tiles[k + 1];
        if (!inB(w, tx, ty)) continue;
        const i = ty * w.cols + tx;
        // Design 19 A1: her brush wins. The tile is hers for brushHoldMin (after the undo note, so Undo gives back the
        // hold it had), and a paint that changes nothing still says "mine".
        const mine = w.R.flags.land && !c.world; // (the starter world's own paint says `world`: it is not hers to hold)
        if (w.terr[i] === t) { if (mine) w.hold[i] = w.R.land.brushHoldMin; continue; }
        const s = w.grid[i], sunk = s && (t === tid.lava || (t === tid.water && !s.def.bridge));
        if (sunk) note(w, c, thingOp(s)); // (undo puts the tile back first, then the thing on it)
        note(w, c, tileOp(w, i));
        keepPaint(w, w.terr[i], t); // (design 19 A2b: the water her brush adds or takes away)
        setTerrain(w, tx, ty, t);
        if (mine) w.hold[i] = w.R.land.brushHoldMin;
        if (sunk) { removeStruct(w, tx, ty); noBuild(w, i); }
      }
      return;
    }
    case 'build':
      for (let k = 0; k < c.tiles.length; k += 2) {
        const tx = c.tiles[k], ty = c.tiles[k + 1], had = inB(w, tx, ty) && w.grid[ty * w.cols + tx];
        placeStruct(w, c.thing, tx, ty);
        const s = inB(w, tx, ty) && w.grid[ty * w.cols + tx];
        if (s && !had) { note(w, c, ['unbuild', s.h]); reactPlaced(w, s, c.tiles.length <= 2); } // design 14 §5: a thing put down beside another (one tile is a tap; more is a pour)
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
      if (w.grid[i]) { if (w.grid[i].def.village && w.R.village.quitOnErase !== false) w.vg.quit = 1; note(w, c, thingOp(w.grid[i])); removeStruct(w, tx, ty); noBuild(w, i); } // (14 §1 rule 8: the village never puts it back, its own flag included)
      else if (!hitAny && w.terr[i] !== tid.grass) { note(w, c, tileOp(w, i)); keepPaint(w, w.terr[i], tid.grass); setTerrain(w, tx, ty, tid.grass); if (w.R.flags.land) w.hold[i] = w.R.land.brushHoldMin; }
      return;
    }
    case 'lift': { // the Hand picks up creature c.h (design 14 §3): out of the world, frozen, until dropped
      const e = ent(w, c.h), E = w.E;
      if (e < 0 || E.dead[e] || E.inside[e]) return; // gone, or in a house or a UFO
      if (w.R.flags.sleeps) wake(w, e, false); // design 18 A5: picked up is awake
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
      if (w.R.flags.liveThings) arrived(w, e);
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
      if (!putItem(w, c, c.item, tx, ty)) log(w, 'log.noRoom');
      return;
    }
    case 'give': {
      const gx = Math.floor(c.x / T), gy = Math.floor(c.y / T);
      if (!inB(w, gx, gy)) return;
      const e = nearPoint(w, c.x, c.y, R.giveRadius);
      // Nobody to hand it to: it is set down where the finger was, and meets whatever is standing there
      // (design 14 §5). Before this, a hat tapped on a snowman did nothing at all.
      if (e < 0) { if (w.R.flags.putDown && putItem(w, c, c.item, gx, gy)) return; log(w, 'log.giveMiss'); return; }
      const G = w.E.gear[e];
      if (!w.C.WEAP[c.item] && !w.C.GEAR[c.item]) return; // a command naming something that is not in the content: do nothing, never throw
      note(w, c, ['gear', w.slotH[e], { ...G }]);
      // Into its slot, replacing whatever was worn there (design 14 §7 T10). One rule, shared with the rows that
      // give things (design 18 A9, content.js equipOn); the Hand is the one that may swap.
      const name = equipOn(w, e, c.item, true);
      if (name) log(w, 'log.gotItem', { a: ref(w, e), item: name });
      reactEquip(w, e, c.item); // design 14 §5: a crown on a chicken
      return;
    }
    // The Hand taps somebody, or something (design 17): the one gesture a child can repeat as often as she likes.
    case 'poke': { const e = ent(w, c.h); if (e >= 0) reactPoke(w, e); return; }
    case 'pokeThing': { if (inB(w, c.tx, c.ty)) reactPokeThing(w, w.grid[c.ty * w.cols + c.tx]); return; }
    case 'power': {
      const P = w.C.P[c.id];
      if (P.use === 'instant') useInstant(w, c.id);
      else usePower(w, c.id, c.x, c.y);
      return;
    }
    // The child names a creature (design 14 §7 T11). A named creature is somebody: Pets safe guards it, the eraser
    // spares it, and the Scrapbook remembers it. The name is cleaned and cut to rules.name.max here, in the sim,
    // so a save can never hold something the sentence builder would choke on.
    case 'rename': {
      const e = ent(w, c.h);
      if (e < 0) return;
      const name = cleanName(c.name, w.R.name.max);
      note(w, c, ['name', w.slotH[e], w.E.name[e], w.E.named[e]]);
      if (!name) { w.E.name[e] = undefined; w.E.named[e] = 0; log(w, 'log.unnamed'); return; }
      w.E.name[e] = name;
      w.E.named[e] = 1;
      log(w, 'log.named', { name, kind: w.E.kind[e] });
      return;
    }
    // The player paints permission (design 14 §7 item 13). A village only ever stands where this paint is.
    case 'claim': {
      for (let k = 0; k < c.tiles.length; k += 2) {
        const tx = c.tiles[k], ty = c.tiles[k + 1];
        if (!inB(w, tx, ty)) continue;
        const i = ty * w.cols + tx, was = w.claim[i] & CL_IN;
        claimTile(w, tx, ty, c.on !== false);
        if (was !== (w.claim[i] & CL_IN)) note(w, c, ['claim', i, was ? 1 : 0]);
      }
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
