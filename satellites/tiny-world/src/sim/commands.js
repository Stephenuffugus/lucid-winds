// sim.command(): the only way the UI changes the world (bible 03 §11).
// Commands are plain data so a journal of them can be replayed.
import { hyp } from './math.js';
import { log, ref, inB, placeStruct, removeStruct, setTerrain, resetWorld } from './world.js';
import { spawn, compact } from './ents.js';
import { nearPoint } from './query.js';
import { usePower, useInstant } from './powers.js';

export function command(w, c) {
  const T = w.T, tid = w.C.tid, R = w.R.tools;
  switch (c.t) {
    case 'place': { // x,y = the tap point; the creature's feet land a little lower
      if (!inB(w, Math.floor(c.x / T), Math.floor(c.y / T))) return;
      const e = spawn(w, c.kind, c.x, c.y + R.spawnDrop);
      if (e >= 0) log(w, 'log.arrived', { a: ref(w, e) });
      return;
    }
    case 'paint': {
      const t = tid[c.terrain];
      for (let k = 0; k < c.tiles.length; k += 2) {
        const tx = c.tiles[k], ty = c.tiles[k + 1];
        if (!inB(w, tx, ty)) continue;
        const i = ty * w.cols + tx;
        if (w.terr[i] === t) continue;
        const s = w.grid[i];
        setTerrain(w, tx, ty, t);
        if (s && (t === tid.lava || (t === tid.water && !s.def.bridge))) removeStruct(w, tx, ty);
      }
      return;
    }
    case 'build':
      for (let k = 0; k < c.tiles.length; k += 2) placeStruct(w, c.thing, c.tiles[k], c.tiles[k + 1]);
      return;
    case 'erase': { // tile: false once this drag has already cleared this tile
      const tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
      if (!inB(w, tx, ty)) return;
      let hitAny = false;
      const E = w.E;
      for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (!E.inside[e] && hyp(E.x[e] - c.x, E.y[e] - 4 - c.y) < R.eraseRadius) { E.dead[e] = true; hitAny = true; } }
      compact(w);
      if (!c.tile) return;
      const i = ty * w.cols + tx;
      if (w.grid[i]) removeStruct(w, tx, ty);
      else if (!hitAny && w.terr[i] !== tid.grass) setTerrain(w, tx, ty, tid.grass);
      return;
    }
    case 'give': {
      if (!inB(w, Math.floor(c.x / T), Math.floor(c.y / T))) return;
      const e = nearPoint(w, c.x, c.y, R.giveRadius);
      if (e < 0) { log(w, 'log.giveMiss'); return; }
      const wp = w.C.WEAP[c.item], G = w.E.gear[e];
      if (wp) { G.weapon = c.item; log(w, 'log.gotItem', { a: ref(w, e), item: wp.name }); }
      else { const g = w.C.GEAR[c.item]; Object.assign(G, g.effects); log(w, 'log.gotItem', { a: ref(w, e), item: g.name }); }
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
      return;
    case 'clear':
      resetWorld(w);
      log(w, 'log.clear');
      return;
    default:
      throw new Error('unknown command ' + c.t);
  }
}
