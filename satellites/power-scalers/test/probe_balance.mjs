/* Difficulty probe: is the gauntlet ladder a real curve or a flat wall?
   Plays the REAL simulate() from index.html. Prints, per rung, the win rate of
   (a) a fresh level-1 character and (b) an auto-player who has climbed to it. */
import { boot, makeOC } from "./harness.mjs";
const { T } = boot();

const N = Number(process.argv[2] || 300);

function fresh(race, lvl) {
  const oc = makeOC(T, { race, level: lvl || 1, statRoll: 40 });
  // a plausible starting spend of the 130 Aether budget
  oc.powers = [
    { key: "energy_blast", tier: "novice", effect: "proc", augments: ["multistrike"] },
    { key: "super_strength", tier: "novice", effect: "buff_str", augments: [] },
  ];
  return oc;
}

function winRate(oc, enemy, n) {
  let w = 0, stale = 0, rounds = 0;
  for (let i = 0; i < n; i++) {
    const r = T.simulate(JSON.parse(JSON.stringify(oc)), T.prepEnemy(enemy));
    if (r.winnerIsA) w++;
    if (r.rounds >= 200) stale++;
    rounds += r.rounds;
  }
  return { p: w / n, stale: stale / n, avgRounds: rounds / n };
}

console.log("== fresh L1 (energy blast novice + super strength) vs each rung ==");
const base = fresh("human", 1);
const freshRow = [];
for (let i = 0; i < T.ENEMIES.length; i++) {
  const e = T.ENEMIES[i];
  const r = winRate(base, e, N);
  freshRow.push(r.p);
  console.log(
    `rung ${String(i + 1).padStart(2)} ${e.name.padEnd(18)} Lv${String(e.level).padStart(2)}  win ${(r.p * 100).toFixed(1).padStart(5)}%  avgRounds ${r.avgRounds.toFixed(1).padStart(5)}  stalemate ${(r.stale * 100).toFixed(1)}%`
  );
}

/* An auto-player: fights the next rung; on a loss, grinds the highest cleared
   rung; spends level-ups on connected tree nodes at random. Measures how many
   fights the whole ladder costs. */
function autoAlloc(oc) {
  let guard = 0;
  while (T.pointsAvail(oc) > 0 && guard++ < 200) {
    const alloc = new Set(oc.tree.allocated);
    const avail = [];
    for (const id of alloc) {
      const n = T.TREE.byId[id];
      for (const nb of n.neighbors) if (!alloc.has(nb)) avail.push(nb);
    }
    if (!avail.length) break;
    // prefer notables/keystones when reachable, else anything
    const good = avail.filter(id => T.TREE.byId[id].type !== "minor");
    const pickFrom = good.length ? good : avail;
    oc.tree.allocated.push(pickFrom[Math.floor(Math.random() * pickFrom.length)]);
  }
}

/* Drives the REAL runGauntlet, so the rewards under test are the shipping
   rewards. (An earlier version of this probe re-implemented the reward maths and
   therefore measured a formula that no longer existed — the exact mistake that
   let the rarity simulator drift from live code twice on this project.) */
function climb(race, spendGlory) {
  const oc = fresh(race, 1);
  T.state.roster = [oc];
  T.state.glory = 0;
  T.state.gauntlet.cleared = -1;
  T.state.gauntlet.champion = oc.id;
  T.state.gauntletFight = null;
  let fights = 0, losses = 0;
  while (T.gauntletCleared() < T.ENEMIES.length - 1 && fights < 4000) {
    const cleared = T.gauntletCleared();
    T.runGauntlet(Math.min(cleared + 1, T.ENEMIES.length - 1));
    fights++;
    const won = T.state.gauntletFight && T.state.gauntletFight.win;
    T.state.gauntletFight = null;
    autoAlloc(oc);
    if (!won) losses++; else losses = 0;
    // stuck: grind the top cleared rung, and buy a level when affordable
    if (losses >= 3 && cleared >= 0) {
      T.runGauntlet(cleared);
      T.state.gauntletFight = null;
      fights++;
      autoAlloc(oc);
    }
    if (spendGlory) {
      const c = T.montageCostG(oc);
      if (T.state.glory >= c) { T.state.glory -= c; T.grantXP(oc, Math.round(T.xpNeeded(oc.level + 1) * 0.7)); autoAlloc(oc); }
    }
  }
  return { fights, level: oc.level, cleared: T.gauntletCleared(), glory: T.state.glory };
}

console.log("\n== auto-player climbs the full ladder (spends Glory on montages) ==");
for (const race of ["human", "draconid", "esper", "revenant"]) {
  const runs = [];
  for (let i = 0; i < 8; i++) runs.push(climb(race, true));
  const done = runs.filter(r => r.cleared === T.ENEMIES.length - 1);
  const avgF = runs.reduce((a, r) => a + r.fights, 0) / runs.length;
  const avgL = runs.reduce((a, r) => a + r.level, 0) / runs.length;
  console.log(
    `${race.padEnd(10)} cleared-all ${done.length}/${runs.length}  avg fights ${avgF.toFixed(0).padStart(4)}  avg end level ${avgL.toFixed(1)}`
  );
}

/* A curve is real if it is monotonic-ish downward for a fixed character. */
let inversions = 0;
for (let i = 1; i < freshRow.length; i++) if (freshRow[i] > freshRow[i - 1] + 0.08) inversions++;
console.log(`\nfresh-character curve inversions (>8pp easier than previous rung): ${inversions}`);
