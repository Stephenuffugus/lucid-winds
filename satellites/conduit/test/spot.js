/* CONDUIT — CAN A GUARD EVER SEE YOU?
     node satellites/conduit/test/spot.js

   ⛔⛔ WHY THIS FILE EXISTS. On 2026-09-03 the Director reported the game as
   unplayable: "enemies dont even capture or attack, they have a red meter that
   fills and nothing happens, and its hard to even get their attention cuz they
   ignore you." Fourteen harnesses were green at the time, smoke.js and drive.js
   among them, because not one of them asserted the single thing the whole
   stealth game rests on: that standing in front of a guard gets you caught.

   The cause was arithmetic, not logic. Spot fills at 1/spotSecondsBlob[tier]
   per second and decays at spotDecay per second:

       exposed   (tier 0)  fill 1/0.8 = 1.25 /s   decay 0.5 /s   fills in 0.8s
       concealed (tier 1)  fill 1/2.5 = 0.40 /s   decay 0.5 /s   NEVER FILLS

   and 38% of site-01's walkable tiles are concealed, which is where a stealth
   player spends the entire game. The meter could not reach 1 there, so hunt was
   never entered, so the damage path at index.html:1195 (which works, and which
   this file also proves) was unreachable. The game had no fail state a careful
   player could ever meet, and no guard whose attention could be caught.

   THE LAW THIS FILE ENCODES: the slowest fill must beat the decay, with margin,
   or the meter is a decoration. Assert the ARITHMETIC, not only the outcome, so
   a later tuning pass cannot quietly re-break it. */
const { load } = require("./harness.js");
let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  → " + extra : "")));
const IN = { ax: 0, ay: 0 };

/* 1. the arithmetic, per tier, before any simulation */
{
  const C = load(); C.newGame("site-01");
  const CFG = C.CFG, decay = CFG.spotDecay;
  for (const tier of [0, 1]) {
    const fill = 1 / (CFG.spotSecondsBlob[tier] * (1 / CFG.sizeSpotFactor(100)));
    ok("tier " + tier + ": fill " + fill.toFixed(2) + "/s beats decay " + decay.toFixed(2) + "/s",
       fill > decay, "fill " + fill.toFixed(3) + " <= decay " + decay.toFixed(3) + ", the meter cannot fill");
    ok("tier " + tier + ": fill beats decay by at least 1.5x",
       fill >= decay * 1.5, "ratio " + (fill / decay).toFixed(2) + "x");
  }
}

/* 2. a guard walking into a stationary player must spot, then hunt */
{
  const C = load(); C.newGame("site-01");
  const S = C.S, e = S.enemies[0], b = C.blobRef();
  for (let i = 0; i < 60; i++) C.step(1 / 30, IN);
  const p = e.path && e.pi < e.path.length ? e.path[Math.min(e.pi + 3, e.path.length - 1)] : null;
  if (p) { b.x = p[0] + 0.5; b.y = p[1] + 0.5; }
  let spotted = -1, hunted = -1, peak = 0;
  for (let i = 0; i < 900; i++) {
    C.step(1 / 30, IN);
    peak = Math.max(peak, e.spot || 0);
    if (spotted < 0 && e.spot >= 1) spotted = i;
    if (hunted < 0 && e.state === "hunt") hunted = i;
  }
  ok("a guard walking onto a still player spots it inside 30s", spotted >= 0,
     "peak spot " + peak.toFixed(3) + " after 900 frames, never reached 1");
  ok("and then hunts", hunted >= 0, "state stayed " + e.state);
  ok("and the site alert rises off 0", S.site.alert > 0, "alert " + S.site.alert);
}

/* 3. the fail state exists: a hunting guard in contact drains the blob */
{
  const C = load(); C.newGame("site-01");
  const S = C.S, e = S.enemies[0], b = C.blobRef(), m0 = b.mass;
  for (let i = 0; i < 900 && !S.result; i++) {
    e.state = "hunt"; e.x = b.x + 0.5; e.y = b.y;
    C.step(1 / 30, IN);
  }
  ok("contact with a hunter costs mass", b.mass < m0, "mass unchanged at " + b.mass);
  ok("and a run can actually be lost", !!(S.result && S.result.ok === false),
     "result " + JSON.stringify(S.result));
}

/* 4. and it is still possible to hide */
{
  const C = load(); C.newGame("site-01");
  const S = C.S, e = S.enemies[0], b = C.blobRef();
  e.spot = 0.9; b.x = S.bounds.x0 + 1; b.y = S.bounds.y1 - 1;
  e.x = S.bounds.x1 - 1; e.y = S.bounds.y0 + 1;
  for (let i = 0; i < 300; i++) C.step(1 / 30, IN);
  ok("a guard across the site forgets you", e.spot < 0.5, "spot still " + e.spot.toFixed(2));
}

console.log("\nspot: " + pass + " ok, " + fail + " failed");
process.exit(fail ? 1 : 0);
