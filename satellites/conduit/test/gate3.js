// CONDUIT C3 gate shots.
//
// HANDOFF-CONDUIT C3, the screenshot ritual: shoot (a) the player's normal view
// mid heist, (b) Flow with two live wires, (c) the worst shot you can compose on
// purpose. Then open all three, name three faults in each, and fix or ticket
// every one. A green test is not a look.
//
//   node test/gate3.js <tag>
const path = require("path");
const { open, driver, settle } = require("./drive");

const SHOTS = path.join(__dirname, "..", "docs", "shots");
const tag = process.argv[2] || "gate3";

// The designed solve, so the frame has real work in it rather than an empty map.
const WIRE_A = [[9,16]];
for (let y = 15; y >= 5; y--) WIRE_A.push([9, y]);
for (let x = 10; x <= 16; x++) WIRE_A.push([x, 5]);
const WIRE_B = [[22,21]];
for (let y = 20; y >= 16; y--) WIRE_B.push([22, y]);
for (let x = 21; x >= 18; x--) WIRE_B.push([x, 16]);
for (let y = 15; y >= 9; y--) WIRE_B.push([18, y]);
for (let x = 17; x >= 12; x--) WIRE_B.push([x, 9]);
WIRE_B.push([12, 8]);

const lay = (page, tiles) => page.evaluate(t => {
  CONDUIT.beginDraft(t[0][0], t[0][1]);
  for (let i = 1; i < t.length; i++) CONDUIT.draftStep(t[i][0], t[i][1]);
  CONDUIT.commitDraft();
}, tiles);

(async () => {
  // (a) mid heist, from where the player stands
  {
    const { browser, page } = await open(844, 390);
    const d = driver(page, 844, 390);
    await d.start();
    await lay(page, WIRE_A);
    await lay(page, WIRE_B);
    await page.evaluate(() => {                   // stand in the trap room, working
      const b = CONDUIT.blobRef(); b.x = 13.5; b.y = 9.5;
      CONDUIT.S.enemies[0].x = 17.5; CONDUIT.S.enemies[0].y = 6.5;
      CONDUIT.S.enemies[0].face = 2.4;
    });
    await settle(1400);
    await page.screenshot({ path: path.join(SHOTS, `${tag}-a-heist.png`) });
    const st = await d.read();
    console.log(`  a  mid heist, ${st.live} live runs, alert ${st.alert}, body ${st.mass.toFixed(0)}`);
    await browser.close();
  }

  // (b) Flow with two live wires
  {
    const { browser, page } = await open(844, 390);
    const d = driver(page, 844, 390);
    await d.start();
    // Park the patrols off the runs first: the point of this frame is two LIVE
    // wires, and a guard standing on one when it energises zaps it dead.
    await page.evaluate(() => {
      CONDUIT.S.enemies[0].x = 7.5;  CONDUIT.S.enemies[0].y = 11.5;
      CONDUIT.S.enemies[1].x = 40.5; CONDUIT.S.enemies[1].y = 16.5;
      CONDUIT.S.enemies.forEach(e => { e.route = [[e.x|0, e.y|0]]; e.path = null; });
    });
    await lay(page, WIRE_A);
    await lay(page, WIRE_B);
    await d.enterFlow(12000);
    await settle(1800);
    await page.screenshot({ path: path.join(SHOTS, `${tag}-b-flow.png`) });
    const st = await d.read();
    console.log(`  b  flow, ${st.live} live runs, devices ${st.devices.join(",") || "none"}`);
    await browser.close();
  }

  // (c) the worst frame I can compose on purpose: the smallest screen, the
  // creature thin and half inside a vent, everything dark under a lockdown, a
  // wire discovered and another mid reclaim, at the edge of the camera clamp.
  {
    const { browser, page } = await open(320, 568);
    const d = driver(page, 320, 568);
    await d.start();
    await lay(page, WIRE_A);
    await lay(page, WIRE_B);
    await page.evaluate(() => {
      const b = CONDUIT.blobRef();
      CONDUIT.S.ledger.owned += 18 - b.mass; b.mass = 18;   // thin enough for the vent
      b.x = 18.5; b.y = 14.2;                               // half into it
      CONDUIT.S.conduits[0].discovered = true;
      CONDUIT.startReclaim(CONDUIT.S.conduits[1]);
      CONDUIT.bump(4, "worst case");
      CONDUIT.S.toast = "Lockdown, power is cut";
      CONDUIT.S.toastT = 9;
    });
    await settle(900);
    await page.screenshot({ path: path.join(SHOTS, `${tag}-c-worst.png`) });
    const st = await d.read();
    console.log(`  c  worst case, lockdown ${st.lockdown}, body ${st.mass.toFixed(0)},` +
                ` discovered ${st.discovered}, leak ${st.leak}`);
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
