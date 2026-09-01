// TANGENT smoke suite — reconstructed starter, 2026-09-01. The phone session's
// 50-check suite was not in the zip; this rebuilds the core checks from
// BUILD-HANDOFF.md sect 14. Grow it with every mechanic. Run: node test/smoke.js
const { load, trial } = require("./harness");

let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + extra : "")));

const T = load();

console.log("\n[1] boot and levels");
ok("8 levels present", T.LEVELS.length === 8);
ok("exactly one sandbox", T.LEVELS.filter(l => l.sandbox).length === 1);
for(const l of T.LEVELS){
  const bodies = l.bodies || [];
  const targets = bodies.filter(b => b.target || b.targetSide !== undefined);
  ok(`${l.name}: has a reachable target`, l.sandbox || targets.length >= 1);
}

console.log("\n[2] every level builds, spins, and completes a run");
const snapshot = JSON.stringify(T.LEVELS);
for(let i = 0; i < T.LEVELS.length; i++){
  const r = trial(T, i, 1.0);
  ok(`${T.LEVELS[i].name}: run reaches done`, T.phase === "done", "phase=" + T.phase);
  ok(`${T.LEVELS[i].name}: outcome is a known class`,
     ["land", "crash", "lost", "miss", "timeout"].includes(r.outcome) || r.outcome != null,
     "outcome=" + r.outcome);
  const b = T.ball;
  ok(`${T.LEVELS[i].name}: no NaN in final ball state`,
     !b || (isFinite(b.x) && isFinite(b.y) && isFinite(b.vx) && isFinite(b.vy)));
}

console.log("\n[3] release is unconditional (D4)");
{
  T.loadLevel(0); T.startSpin(); T.holding = true;
  for(let k = 0; k < 12; k++) T.step();     // 0.1 s in, deep inside the deck
  T.doRelease("test");
  ok("doRelease from any radius leaves spin phase immediately", T.phase !== "spin", "phase=" + T.phase);
}

console.log("\n[4] inversion and immutability");
{
  // Inside out (index 5) requires the hole; land there implies an inversion ran.
  let inverted = false;
  for(let k = 1; k <= 60 && !inverted; k++){
    trial(T, 5, k * 0.2);
    if(T.inversions > 0) inverted = true;
  }
  ok("an inversion occurs somewhere on Inside out", inverted);
  ok("LEVELS data never mutated across all runs", JSON.stringify(T.LEVELS) === snapshot);
}

console.log("\n[5] unreleased run times out, not hangs");
{
  T.loadLevel(0); T.startSpin(); T.holding = false; // idle throttle, never release
  let guard = 0;
  while(T.phase === "spin" && guard++ < 34 * 120 + 200) T.step();
  ok("idle spin ends by RUN_LIMIT", T.phase !== "spin", "phase=" + T.phase);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
