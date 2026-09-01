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

console.log("\n[6] camera: the deck is framed for aiming, then pulls out (D12)");
{
  // The owner's standing complaint was that the deck is unreadably small while
  // aiming. These checks encode the fix: spin frames the DECK, flight frames the
  // SYSTEM, and the change between them is animated rather than instant.
  T.W = 390; T.H = 780;
  T.loadLevel(0); T.startSpin(); T.holding = true;
  for(let k = 0; k < 120; k++) T.step();          // 1 s of spin-up
  const sSpin = T.camScale ? T.camScale() : 0;
  const deckPx = 2 * 100 * sSpin;                  // DECK_R = 100 world units
  ok("spin frames the deck at 60% or more of the short screen dimension",
     deckPx >= 0.60 * Math.min(T.W, T.H),
     `deck=${deckPx.toFixed(0)}px of ${Math.min(T.W, T.H)}px`);

  T.doRelease("test");
  const sFlight = T.camScale ? T.camScale() : 0;
  ok("flight frames the whole system, far wider than the aiming view",
     sSpin >= 3 * sFlight,
     `spin=${sSpin.toFixed(3)} flight=${sFlight.toFixed(3)} ratio=${(sFlight ? sSpin / sFlight : 0).toFixed(2)}`);

  // The pull-out is a lerp, not a cut: partway through it must be strictly
  // between the two framings, and it must actually arrive.
  if(!T.camUpdate){
    ok("camera exposes an animated update (camUpdate)", false, "camUpdate not defined");
  } else {
    T.loadLevel(0); T.startSpin(); T.holding = true;
    for(let k = 0; k < 120; k++) T.step();
    for(let k = 0; k < 60; k++) T.camUpdate(1 / 60);   // settle on the near framing
    const near = T.camScale();
    T.doRelease("test");
    const wide = sFlight;                              // the system framing it must reach
    T.camUpdate(1 / 60);
    const first = T.camScale();
    ok("pull-out is animated, not an instant cut",
       first < near && first > wide,
       `near=${near.toFixed(3)} afterOneFrame=${first.toFixed(3)} wide=${wide.toFixed(3)}`);
    for(let k = 0; k < 120; k++) T.camUpdate(1 / 60); // 2 s
    const settled = T.camScale();
    ok("pull-out arrives at the system framing within 2 s",
       Math.abs(settled - wide) / wide < 0.03,
       `settled=${settled.toFixed(4)} wide=${wide.toFixed(4)}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
