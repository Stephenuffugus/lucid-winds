// The village (design 14 §7 item 13, the stretch): a village that exists ONLY where the player painted
// permission. It never rebuilds what the player took away, it never builds outside the paint, and it does one
// job at a time. Everything here is deterministic: the site scan walks the claimed tiles in the order they were
// painted, and nothing rolls the world's random stream.
//
// The paint is a byte per tile (world.js w.claim): IN, BUILT, NOBUILD.
import { inB, placeStruct, struct, markDirty, log } from './world.js';
import { rebuildGear } from './content.js';

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
  learn(w); // what it has worked out from what keeps happening to it
  if (vg.cd > 0) vg.cd -= dt;
  if (vg.site >= 0 || vg.cd > 0) return;
  const plan = planOf(w);
  if (vg.next >= plan.length) { grow(w); return; } // this age is built: grow up, or wait until there are enough of them
  if (vg.store < V.buildFood) return; // it eats first
  const site = siteFor(w, plan[vg.next]);
  if (site < 0) { vg.cd = V.jobCd; return; }
  vg.site = site;
  vg.worker = 0;
}

// What this village is building now. Without the switch it is the one old four thing plan, for ever, which is
// what Stephen saw: "I drew area where they could build but nobody's built any houses, mansions or Castle stuff."
export function planOf(w) {
  const V = w.R.village;
  if (!w.R.flags.villageGrows || !V.ages) return V.plan;
  return (V.ages[Math.min(w.vg.age || 0, V.ages.length - 1)] || V.ages[0]).plan;
}
// How big the village counts as: the folk in it, and what it has found. A crystal standing on painted ground is
// worth people (rules.village.crystalFolk), which is the answer to "I've seen no point of the gems": a village
// that has one grows up sooner.
export function villageSize(w) {
  const V = w.R.village, E = w.E;
  let folk = 0;
  for (let k = 0; k < w.count; k++) if (E.vill[w.order[k]] && !E.dead[w.order[k]]) folk++;
  let gems = 0;
  for (const s of w.structs) if ((s.def.tags || EMPTY).indexOf('shiny') >= 0 && s.def.light && (w.claim[s.ty * w.cols + s.tx] & IN)) gems++;
  return folk + gems * (V.crystalFolk || 0);
}
// The age's plan is finished. If enough of them are standing, it becomes the next kind of place and starts the
// next plan; if not, it simply waits, and nothing it already built is ever built again.
function grow(w) {
  const V = w.R.village, vg = w.vg;
  if (!w.R.flags.villageGrows || !V.ages) return;
  const at = Math.min(vg.age || 0, V.ages.length - 1);
  if (at >= V.ages.length - 1) return; // a kingdom is as big as it gets
  const nextAge = V.ages[at + 1];
  if (villageSize(w) < nextAge.folk) {
    // Say it once per age, so a child who has built everything knows what it is waiting for instead of watching
    // nothing happen (Stephen, Sep 20: "nobody's built any houses, mansions or Castle stuff so I don't understand").
    if (vg.told !== at + 1) { vg.told = at + 1; log(w, 'log.villageWants', { name: nextAge.name }); }
    vg.cd = V.jobCd;
    return;
  }
  vg.age = at + 1;
  vg.next = 0;
  vg.cd = V.jobCd;
  log(w, 'log.villageGrew', { name: nextAge.name });
}
const EMPTY = [];

// What a village has learned the hard way (Stephen, Sep 20: "if a town keeps getting killed by tigers, they
// invent a spear and they start getting spears so they can defend themselves"). It remembers what keeps killing
// its people, and past a count it works something out and hands it round. Nothing here rolls the world's random
// stream: it is a counter and a threshold, so two worlds that lost the same people learn the same things.
export const LEARN_SPEARS = 1, LEARN_SNORKEL = 2;
// One of them died. Only what the village could do something about is counted.
export function villageLost(w, e, cause) {
  const vg = w.vg;
  if (!vg.flag || !w.E.vill[e] || !w.R.flags.villageLearns) return;
  if (cause === 'killed') vg.lostTo = (vg.lostTo || 0) + 1;
  else if (cause === 'drowned') vg.lostWet = (vg.lostWet || 0) + 1;
}
// Hand it to everybody who belongs to the village, and to anybody who joins later (update.js, on arrival).
export function equipVillager(w, e) {
  const vg = w.vg, L = vg.learned || 0, G = w.E.gear[e];
  if (!w.R.flags.villageLearns || !L) return;
  if ((L & LEARN_SPEARS) && !G.weapon) G.weapon = w.R.village.learn.weapon;
  if ((L & LEARN_SNORKEL) && !G.head) { G.head = w.R.village.learn.head; rebuildGear(w, e); }
}
// Checked with the job board: has enough gone wrong to work something out?
function learn(w) {
  const V = w.R.village, vg = w.vg, E = w.E;
  if (!w.R.flags.villageLearns) return;
  const was = vg.learned || 0;
  let now = was;
  if ((vg.lostTo || 0) >= V.learn.toFight) now |= LEARN_SPEARS;
  if ((vg.lostWet || 0) >= V.learn.toSwim) now |= LEARN_SNORKEL;
  if (now === was) return;
  vg.learned = now;
  for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (E.vill[e] && !E.dead[e]) equipVillager(w, e); }
  log(w, now & ~was & LEARN_SPEARS ? 'log.learnSpears' : 'log.learnSnorkel');
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
  const type = planOf(w)[vg.next];
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
