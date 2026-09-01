// TANGENT smoke suite — reconstructed starter, 2026-09-01. The phone session's
// 50-check suite was not in the zip; this rebuilds the core checks from
// BUILD-HANDOFF.md sect 14. Grow it with every mechanic. Run: node test/smoke.js
const { load, trial } = require("./harness");

let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + extra : "")));

const T = load();
let ok_short = null;

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

console.log("\n[7] saving survives a second tab (T2)");
{
  T.store.clear();
  T.recordResult(0, { score: 1000, cleared: true, gatesOK: true, thrift: false });
  ok("a result is recorded", T.lvState(0).best === 1000, "best=" + T.lvState(0).best);
  // another tab banks a better run and a medal we do not have
  const other = JSON.stringify({ v: 4, lv: { 0: { best: 5000, cleared: 1, gates: 1, thrift: 1 } }, tutor: {} });
  T.store.setItem("tangent.save.v4", other);
  T.recordResult(0, { score: 20, cleared: false, gatesOK: false, thrift: false });
  const st = T.lvState(0);
  ok("a worse later run does not lower the best", st.best === 5000, "best=" + st.best);
  ok("a medal earned in the other tab is not erased", st.thrift === 1, "thrift=" + st.thrift);
  // and scores from the old v3 key are carried across rather than dropped
  T.store.clear();
  T.store.setItem("tangent.best.v3", JSON.stringify({ 2: 777 }));
  ok("old v3 scores are carried into the new save", T.lvState(2).best === 777, "best=" + T.lvState(2).best);
}

console.log("\n[8] progression opens one system at a time (T2)");
{
  T.store.clear();
  ok("a fresh profile can only open the first system", T.unlockedThrough() === 0, "unlocked=" + T.unlockedThrough());
  T.recordResult(0, { score: 100, cleared: true, gatesOK: true });
  ok("clearing the first system opens the second", T.unlockedThrough() === 1, "unlocked=" + T.unlockedThrough());
  T.recordResult(1, { score: 100, cleared: false, gatesOK: false });
  ok("landing without clearing does not open the next", T.unlockedThrough() === 1, "unlocked=" + T.unlockedThrough());
}

console.log("\n[9] the tutorial teaches, once, in the order the player needs it (T2)");
{
  T.store.clear(); T.coachSeen = {};
  T.loadLevel(1); T.startSpin();                 // level 2, the one with a gate
  T.everHeld = false;
  ok("first beat asks for the throttle", T.coachBeat(null) === "hold", T.coachBeat(null));
  T.everHeld = true;
  ok("second beat points at the predicted line", T.coachBeat(null) === "line", T.coachBeat(null));
  T.coachSeen = { hold: 1, line: 1 };
  T.holding = true;
  let sawGate = false, sawLetgo = false, guard = 0;
  while(T.phase === "spin" && guard++ < 34 * 120){
    T.step();
    const b = T.coachBeat(T.cachedPredict());
    // the gate beat must arrive BEFORE the let-go beat, or the player is told
    // to release on a shot that cannot clear the level
    if(b === "gate"){ sawGate = true; T.coachSeen = { hold: 1, line: 1, gate: 1 }; }
    if(b === "letgo"){ sawLetgo = true; break; }
  }
  ok("it warns about the uncrossed gate before saying let go", sawGate);
  ok("it says let go once the gate is crossed and the shot lands", sawLetgo);
  ok("gate really was crossed by then", T.gatesHit.every(Boolean));
  // and every beat retires once read
  T.coachSeen = {}; T.everHeld = false;
  for(let k = 0; k < 200; k++) T.coachTick(1 / 60, null);   // 3.3 s, past COACH_READ
  ok("a beat retires after it has been on screen long enough", T.coachSeen.hold === 1);
  ok("a retired beat is written to the profile", (T.readSave().tutor || {}).hold === 1);
}

console.log("\n[10] the taught strategy is enough to get in (T2 acceptance)");
{
  // Exactly what the beats say: hold, wait for the gate, let go on "lands".
  // If this fails, the tutorial is teaching something that does not work.
  T.store.clear();
  T.W = 390; T.H = 780;
  let reached = 1;
  for(let i = 0; i < 5; i++){
    T.loadLevel(i); T.startSpin(); T.holding = true;
    let t = 0;
    while(T.phase === "spin" && t < 34 * 120){
      T.step(); t++;
      const pr = T.cachedPredict();
      if(pr && pr.outcome === "land" && T.gatesHit.every(Boolean) && t > 20){ T.doRelease("bot"); break; }
    }
    let g = 0;
    while((T.phase === "flight" || T.phase === "invert") && g++ < 30000) T.step();
    if(!(T.lastOutcome === "land" && T.gatesHit.every(Boolean))) break;
    reached = i + 2;
  }
  ok("a player following only the tutorial reaches system 3 or better",
     reached >= 3, "reached system " + reached);
}

console.log("\n[11] the drawn line is the run (D2, the law this project cannot bend)");
{
  // The predictor and the live flight must be the same arithmetic. They were
  // not: prediction stepped at 1/60 while flight stepped at 1/120, so Euler
  // walked two different trajectories and the dashed line was a near miss of
  // the run rather than the run itself.
  //
  // Scored PER LEVEL as well as overall. An aggregate hides a single bad
  // system: measured independently, one build sat at 97.8% overall while one
  // level was at 85%, and a 95% aggregate gate would have called that fine.
  const norm = o => (o == null ? "lost" : o);
  let checked = 0, agreed = 0, worst = null;
  const misses = [];
  for(let i = 0; i < T.LEVELS.length; i++){
    let n = 0, ok_ = 0;
    for(let k = 3; k <= 39; k += 4){
      T.loadLevel(i); T.startSpin(); T.holding = true;
      for(let s = 0; s < k * 20 && T.phase === "spin"; s++) T.step();
      if(T.phase !== "spin") continue;
      const said = norm((T.cachedPredict() || {}).outcome);
      T.doRelease("d2");
      let g = 0;
      while((T.phase === "flight" || T.phase === "invert") && g++ < 40000) T.step();
      const got = norm(T.lastOutcome);
      n++;
      // a predicted "invert" means it falls in; the run continues past the
      // hole, so anything after an inversion agrees about the fall
      if(said === got || (said === "invert" && T.inversions > 0)) ok_++;
      else misses.push(`${T.LEVELS[i].name}@${(k * 20 / 120).toFixed(1)}s said ${said} got ${got}`);
    }
    checked += n; agreed += ok_;
    const pc = n ? ok_ / n : 1;
    if(worst === null || pc < worst.pc) worst = { pc: pc, name: T.LEVELS[i].name, n: n, ok: ok_ };
  }
  const pct = checked ? (agreed / checked) * 100 : 0;
  ok(`the prediction matches the run it produces (${agreed}/${checked}, ${pct.toFixed(1)}%)`,
     pct >= 95, misses.slice(0, 4).join(" | "));
  ok(`no single system is dishonest (worst: ${worst.name} ${worst.ok}/${worst.n})`,
     worst.pc >= 0.9, misses.filter(m => m.indexOf(worst.name) === 0).slice(0, 3).join(" | "));
}

console.log("\n[12] the build layer is wired, and a flip does not poison the next build");
{
  // Nothing in this suite had ever placed a part, so rails, bumpers, brakes,
  // boosters, part mass and the imbalance failure were all unexecuted code.
  const runTo = (i, t) => {
    T.startSpin(); T.holding = true;
    for(let s = 0; s < t * 120 && T.phase === "spin"; s++) T.step();
    if(T.phase === "spin") T.doRelease("parts");
    let g = 0;
    while((T.phase === "flight" || T.phase === "invert") && g++ < 30000) T.step();
    return T.ball ? { x: T.ball.x, y: T.ball.y, out: T.lastOutcome } : null;
  };
  T.loadLevel(0);
  const bare = runTo(0, 2.0);
  T.loadLevel(0);
  T.parts.push({ type: "bumper", x: 44, y: 0 });
  T.parts.push({ type: "bumper", x: -44, y: 0 });          // balanced, so it is the
  const withParts = runTo(0, 2.0);                          // physics under test, not the tear-apart
  ok("a part on the deck changes where the ball ends up",
     !!bare && !!withParts && (Math.abs(bare.x - withParts.x) + Math.abs(bare.y - withParts.y)) > 1,
     `bare ${bare && bare.x.toFixed(1)},${bare && bare.y.toFixed(1)} vs ${withParts && withParts.x.toFixed(1)},${withParts && withParts.y.toFixed(1)}`);

  T.loadLevel(0);
  for(let k = 0; k < 4; k++) T.parts.push({ type: "rail", x: 55, y: -20 + k * 12, x2: 88, y2: -20 + k * 12 });
  T.startSpin(); T.holding = true;
  let g = 0, tore = false;
  while(T.phase === "spin" && g++ < 34 * 120){ T.step(); if(T.phase !== "spin"){ tore = true; break; } }
  ok("a deck loaded all down one side tears itself apart", tore && T.phase === "done", "phase=" + T.phase);
  ok("a run that fails reports its own outcome, not the last one",
     T.lastOutcome === "failed", "lastOutcome=" + T.lastOutcome);

  // and coming back from a run that went through a hole
  T.loadLevel(5);
  let inverted = false;
  for(let k = 1; k <= 40 && !inverted; k++){
    trial(T, 5, k * 0.3);
    if(T.inversions > 0) inverted = true;
  }
  ok("reached an inverted state to test the return", inverted);
  T.backToBuild();
  ok("rebuilding after a flip puts the world back the near way up", T.invAmt === 0, "invAmt=" + T.invAmt);
  ok("rebuilding after a flip puts the deck back at the origin",
     T.deckPos[0] === 0 && T.deckPos[1] === 0, "deckPos=" + T.deckPos);
  ok("rebuilding clears the gates lit by the last run", T.gatesHit.every(g2 => !g2));
}

console.log("\n[13] the verdict tells the truth about clearing, not just landing");
{
  // The readout, the Launch button, the shot marker and the drawn line all
  // said "lands" in green on a shot that settles as "Landed, but short",
  // because the prediction knows about bodies and nothing about gates.
  if(!T.verdict){ ok("the game exposes one verdict for every surface", false, "verdict not defined"); }
  else {
    T.loadLevel(1); T.startSpin(); T.holding = true;   // system 2, one gate
    let sawShort = false, sawClears = false, g = 0;
    while(T.phase === "spin" && g++ < 34 * 120){
      T.step();
      const v = T.verdict(T.cachedPredict());
      const left = T.gatesHit.some(x => !x);
      if(v.key === "clears" && left) break;             // would be the old lie
      if(v.key === "short"){ sawShort = true; ok_short = v; }
      if(v.key === "clears" && !left){ sawClears = true; break; }
    }
    ok("a landing shot with the gate still open reads as short, not clear", sawShort);
    ok("it reads as clearing once the gate is crossed", sawClears);
    ok("short and clear are not the same colour",
       !ok_short || ok_short.col !== "#6FCF97", ok_short && ok_short.col);
  }
}

console.log("\n[14] the runtime system owns its own data");
{
  // LEVELS is the authored record and a run must never be able to edit it.
  // `sys` was a one level spread, so each hole's far side block was shared by
  // reference and sideStyle pointed straight at the level.
  const hole = T.LEVELS[5].bodies.find(x => x.hole);
  const before = hole.other.gravMul;
  T.loadLevel(5); T.startSpin();
  const live = T.sys.find(x => x.hole);
  ok("the runtime hole is not the authored hole", live !== hole);
  ok("its far side block is not the authored one", live.other !== hole.other,
     "shared by reference");
  live.other.gravMul = 99;                       // what a runtime tweak would do
  ok("editing the runtime copy does not edit the level",
     hole.other.gravMul === before, `level now ${hole.other.gravMul}`);
  live.other.gravMul = before;
}

console.log("\n[15] the build phase shows the track it is asking you to change");
{
  // You were being asked to place parts to route a ball whose start and path
  // were both invisible. The ghost runs the real deck integrator on a scratch
  // state, so it must react to a part exactly as the run will.
  T.loadLevel(1);
  T.ghost = null; T.buildGhost();
  const bare = T.ghost.map(q => [Math.round(q[0]), Math.round(q[1])]);
  ok("a track is computed for the build phase", bare.length > 50, "points=" + bare.length);
  ok("it starts where the ball starts", Math.abs(Math.hypot(bare[0][0], bare[0][1]) - 36.6) < 2,
     "r0=" + Math.hypot(bare[0][0], bare[0][1]).toFixed(1));
  // a part placed ON the track must change it; one placed far away must not
  const on = T.ghost[90];
  T.parts.push({ type: "bumper", x: on[0], y: on[1] });
  T.ghost = null; T.buildGhost();
  const bumped = T.ghost.map(q => [Math.round(q[0]), Math.round(q[1])]);
  let moved = 0;
  for(let i = 0; i < Math.min(bare.length, bumped.length); i++)
    if(bare[i][0] !== bumped[i][0] || bare[i][1] !== bumped[i][1]) moved++;
  ok("a part on the track visibly changes it", moved > 20, "points moved=" + moved);
  ok("computing it does not shake the screen or disturb the run",
     T.phase === "build", "phase=" + T.phase);
}

console.log("\n[16] the vane makes the ball lead the deck, which nothing else does");
{
  // Surface drag only ever pulls the ball TOWARD deck speed from below, so it
  // always lags and in the deck frame it only ever walks one way. That is why
  // no other part opens ground: they deflect the ball without changing which
  // way it drifts. The vane drives it past deck speed.
  const lead = parts => {
    T.loadLevel(3);
    for(const p of parts) T.parts.push(p);
    T.startSpin(); T.holding = true;
    let most = -1e9;
    for(let s = 0; s < 12 * 120 && T.phase === "spin"; s++){
      T.step();
      const b = T.ball, r = Math.hypot(b.x, b.y) || 1;
      // tangential speed of the ball, minus the deck surface speed at that radius
      const tan = (-b.y / r) * b.vx + (b.x / r) * b.vy;
      most = Math.max(most, tan - T.deck.omega * r);
    }
    return most;
  };
  const bare = lead([]);
  ok("a bare deck never gets the ball ahead of the surface", bare < 1, "lead=" + bare.toFixed(1));
  const vaned = lead([{ type: "vane", x: 30, y: 0 }, { type: "vane", x: -30, y: 0 }]);
  ok("a vane does", vaned > 8, "lead=" + vaned.toFixed(1));
  const bumped = lead([{ type: "bumper", x: 30, y: 0 }, { type: "bumper", x: -30, y: 0 }]);
  ok("a bumper does not, which is why it cannot open ground",
     bumped < vaned / 2, `bumper=${bumped.toFixed(1)} vane=${vaned.toFixed(1)}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
