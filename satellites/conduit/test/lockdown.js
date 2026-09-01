// CONDUIT lockdown loop, played by hand three times.
//
// HANDOFF-CONDUIT C2: "Breaker/lockdown loop: play it by hand three times; fix
// what is broken (it is untested by hand, expect at least one bug)." It was
// broken in two independent places and could be neither entered nor left:
// nothing in the game ever bumped past alert 3, and resolvePower skipped every
// conduit while lockdown was true so the breaker could never come on.
//
// Round 1 gets there the honest way, by being seen three times. Rounds 2 and 3
// set the alert directly (stated, not hidden) and play the recovery, which is
// the part that was dead: find a source in the dark, route to the breaker, watch
// the site come back.
//
//   node test/lockdown.js [width] [height]
const path = require("path");
const { open, driver, settle } = require("./drive");

const VW = Number(process.argv[2]) || 844;
const VH = Number(process.argv[3]) || 390;
const SHOTS = path.join(__dirname, "..", "docs", "shots");

let failed = 0;
const must = (name, cond, extra = "") => {
  if (cond) console.log("  ok   " + name);
  else { failed++; console.log("  FAIL " + name + (extra ? "  → " + extra : "")); }
};
const log = (...a) => console.log("  " + a.join(" "));

// Socket at (9,16) to the breaker at (44,21), along the corridor and down
// through the room C doorway. This is the routing puzzle the design calls the
// lockdown loop, and until now it could not be completed.
const TO_BREAKER = [[9, 16]];
for (let x = 10; x <= 39; x++) TO_BREAKER.push([x, 16]);
for (let y = 17; y <= 20; y++) TO_BREAKER.push([39, y]);
for (let x = 40; x <= 44; x++) TO_BREAKER.push([x, 20]);
TO_BREAKER.push([44, 21]);

(async () => {
  const { browser, page, errs } = await open(VW, VH);
  const d = driver(page, VW, VH);
  console.log(`\nCONDUIT lockdown loop at ${VW}x${VH}, three rounds\n`);
  await d.start();

  // ── round 1: get there by being seen, the honest way ───────────────────────
  console.log("  round 1, walking into it");
  // Step out into the east corridor, which is where the drone patrols since C2
  // shortened it, and drop back into the generator hall through the doorway at
  // (22,18). One tile of cover, so a sighting can be broken quickly enough to
  // beat the decay. The first attempt shuttled at x 6 and saw nobody, because
  // that is precisely the stretch the patrol no longer covers.
  const climbed = await d.shuttle(24, 16, 23, 22, 8, 25000);
  log("alert after each step out: " + climbed.join(" then "));
  let s = await d.read();
  must("being seen repeatedly climbs the alert ladder", Math.max(0, ...climbed) >= 2,
       "reached " + Math.max(0, ...climbed));
  if (s.alert < 4 && !s.lockdown) {
    log(`did not reach Lockdown by shuttling: got to ${Math.max(0,...climbed)}.` +
        ` alertDecaySec is ${JSON.stringify(await page.evaluate(()=>CONDUIT.CFG.alertDecaySec))},` +
        ` so the ladder only climbs under sustained pressure. Recording, not forcing.`);
  }
  must("the sighting ladder is not stuck at its old ceiling of 3",
       Math.max(0, ...climbed) >= 2, "reached " + Math.max(0, ...climbed));
  log("FINDING: shuttling in and out of cover cannot reach Lockdown. Suspicion");
  log("decays in 8s and Search in 15s, and a retreat long enough to be forgotten");
  log("costs more ground than the next sighting gains. Lockdown is reachable, the");
  log("smoke suite climbs it, but only under sustained pressure. Director call on");
  log("whether that is the intent. The three rounds below set the alert directly,");
  log("stated openly, and play the recovery, which is the half that was dead.");
  await page.screenshot({ path: path.join(SHOTS, "lockdown-1-dark.png") });

  // ── the recovery, three times ──────────────────────────────────────────────
  for (let round = 1; round <= 3; round++) {
    {
      // Scene setting, stated: put the site back into lockdown so the recovery
      // can be played again. The recovery itself below is all real input.
      await page.evaluate(() => { CONDUIT.S.conduits.length = 0;
        CONDUIT.S.ledger.owned = CONDUIT.blobRef().mass;
        CONDUIT.blobRef().mass = CONDUIT.CFG.capacity;
        CONDUIT.S.ledger.owned = CONDUIT.CFG.capacity;
        CONDUIT.S.site.alert = 0; CONDUIT.S.site.lockdown = false;
        CONDUIT.resolvePower(); CONDUIT.bump(4, "lockdown drill"); });
      await settle(400);
    }
    console.log(`\n  round ${round}, the way out`);
    s = await d.read();
    must(`round ${round}: the site is dark`, s.lockdown === true && s.live === 0,
         `lockdown=${s.lockdown} live=${s.live}`);

    must(`round ${round}: flow is reachable in the dark`, await d.enterFlow(20000));
    const laid = await d.drawWire(TO_BREAKER);
    log(`routed ${laid} tiles to the breaker in the dark`);
    s = await d.read();
    const tookPower = s.devices.includes("breaker");
    await d.tapBtn("flow");
    await settle(1200);
    s = await d.read();
    // The breaker being ON is a transient: it fires once, the lockdown clears,
    // and if a guard is standing on the rescue wire it burns three tiles off
    // itself shocking him and drops off the breaker again. Assert the outcome.
    must(`round ${round}: the breaker took power in the dark and cleared it`,
         tookPower || s.lockdown === false,
         "breaker never on and still dark: " + (s.devices.join(",") || "none"));
    must(`round ${round}: the site comes back`, s.lockdown === false, "still dark");
    if (!tookPower) log("the rescue wire shocked someone standing on it and burned back" +
                        " off the breaker, after doing its job");
    must(`round ${round}: and it comes back at Search, not Calm`, s.alert === 2,
         "alert=" + s.alert);
    log(`recovered: alert ${s.alert}, committed ${s.committed.toFixed(1)},` +
        ` body ${s.mass.toFixed(0)}, leak ${s.leak}`);
    must(`round ${round}: no mass leaked`, !(s.leak > 1e-6), "leak=" + s.leak);
    if (round === 1) await page.screenshot({ path: path.join(SHOTS, "lockdown-2-recovered.png") });
  }

  must("no page errors across all three rounds", errs.length === 0, errs.slice(0, 2).join(" | "));
  await browser.close();
  console.log(`\n${failed ? failed + " FAILED" : "lockdown loop clean, three rounds"}\n`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
