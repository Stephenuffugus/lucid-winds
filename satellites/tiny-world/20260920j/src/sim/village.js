// The village (design 14 §7 item 13, the stretch): a village that exists ONLY where the player painted
// permission. It never rebuilds what the player took away, it never builds outside the paint, and it does one
// job at a time. Everything here is deterministic: the site scan walks the claimed tiles in the order they were
// painted, and nothing rolls the world's random stream.
//
// The paint is a byte per tile (world.js w.claim): IN, BUILT, NOBUILD.
import { inB, placeStruct, struct, markDirty } from './world.js';

export const IN = 1, BUILT = 2, NOBUILD = 4;

export function claimTile(w, tx, ty, on) {
  if (!inB(w, tx, ty)) return;
  const i = ty * w.cols + tx;
  if (on) {
    if (w.claim[i] & IN) return;
    if (countClaimed(w) >= w.R.village.maxTiles) return;
    w.claim[i] |= IN;
    if (w.claimN < w.claimList.length) w.claimList[w.claimN++] = i;
  } else w.claim[i] &= ~IN;
  markDirty(w, i);
}
function countClaimed(w) { let n = 0; for (let k = 0; k < w.claimN; k++) if (w.claim[w.claimList[k]] & IN) n++; return n; }

// The player took a thing away: whatever stood here, the village never puts anything here again (14 §1 rule 8).
export function noBuild(w, i) { if (w.claim[i] & BUILT) w.claim[i] = (w.claim[i] & ~BUILT) | NOBUILD; }

// Every step: the job board. One job at a time — a site is posted, one villager takes it, and the plan only ever
// moves forward, so a thing the player erases is never rebuilt.
export function villageTick(w, dt) {
  const V = w.R.village, vg = w.vg;
  if (!vg.flag) return;
  const flag = struct(w, vg.flag);
  if (!flag) { // the flag is gone: the village dissolves, and the folk go back to being people
    vg.flag = 0; vg.site = -1; vg.worker = 0;
    for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (w.E.vill[e]) { w.E.vill[e] = 0; w.E.carry[e] = 0; w.E.work[e] = 0; } }
    return;
  }
  if (vg.cd > 0) vg.cd -= dt;
  if (vg.site >= 0 || vg.cd > 0) return;
  if (vg.next >= V.plan.length) return; // the plan is finished; it never starts again
  if (vg.store < V.buildFood) return; // it eats first
  const site = siteFor(w, V.plan[vg.next]);
  if (site < 0) { vg.cd = V.jobCd; return; }
  vg.site = site;
  vg.worker = 0;
}

// Where the next thing goes: the first claimed tile, in paint order, that is free, not burning, not forbidden,
// and not right beside another thing (rules.village.spaceTiles), so the village does not build a wall of huts.
export function siteFor(w, type) {
  const V = w.R.village, space = V.spaceTiles;
  for (let k = 0; k < w.claimN; k++) {
    const i = w.claimList[k];
    if (!(w.claim[i] & IN) || (w.claim[i] & NOBUILD)) continue;
    if (w.grid[i] || w.burn[i] > 0) continue;
    const tx = i % w.cols, ty = (i / w.cols) | 0;
    if (w.terr[i] === w.C.tid.water || w.terr[i] === w.C.tid.lava) continue;
    let crowded = false;
    for (let dy = -space; dy <= space && !crowded; dy++) for (let dx = -space; dx <= space; dx++) {
      if (!dx && !dy) continue;
      const nx = tx + dx, ny = ty + dy;
      if (inB(w, nx, ny) && w.grid[ny * w.cols + nx]) { crowded = true; break; }
    }
    if (crowded) continue;
    return i;
  }
  return -1;
}

// A villager finished the job it was standing on.
export function finishBuild(w, e) {
  const V = w.R.village, vg = w.vg, i = vg.site;
  if (i < 0) return;
  const type = V.plan[vg.next];
  placeStruct(w, type, i % w.cols, (i / w.cols) | 0);
  if (w.grid[i]) w.claim[i] |= BUILT;
  vg.store = Math.max(0, vg.store - V.buildFood);
  vg.next++;      // forward only: what the player takes away is never rebuilt
  vg.site = -1;
  vg.worker = 0;
  vg.cd = V.jobCd;
  w.E.work[e] = 0;
  return w.grid[i] || null;
}
