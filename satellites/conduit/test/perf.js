// CONDUIT frame budget check.
//
// HANDOFF-CONDUIT C3: hold 60fps on a mid phone, budget update <=5ms and
// draw <=8ms, using a 4x CPU throttle as the proxy. Measured on the busiest
// frame the game can produce, not on an empty map.
//
//   node test/perf.js [throttle]
const { open, driver, settle } = require("./drive");
const RATE = Number(process.argv[2]) || 4;

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

let failed = 0;
const must = (n, c, e="") => { if (c) console.log("  ok   "+n);
  else { failed++; console.log("  FAIL "+n+(e?"  → "+e:"")); } };

(async () => {
  const { browser, page } = await open(844, 390);
  const d = driver(page, 844, 390);
  const cdp = await page.createCDPSession();
  await d.start();
  await lay(page, WIRE_A);
  await lay(page, WIRE_B);
  await page.evaluate(() => {                 // everything on at once, worst case
    CONDUIT.bump(3, "perf");
    const b = CONDUIT.blobRef(); b.x = 13.5; b.y = 9.5;
    CONDUIT.S.lights.forEach(l => l.out = false);
  });
  await settle(1200);
  const CFGdraw = await page.evaluate(() => CONDUIT.CFG.ferro.drawBudgetMs);

  console.log(`\nCONDUIT frame budget, 844x390, two live runs, alarm state\n`);
  // Note on fps: headless shell does not vsync rAF to a display, so it reports
  // ~49fps even unthrottled. The frame RATE here is not a trustworthy proxy for
  // a phone. The update and draw times are, because they are direct CPU
  // measurements of the game's own work, so those are what is asserted.
  const seen = {};
  for (const [label, rate] of [["no throttle", 1], [`${RATE}x CPU throttle`, RATE],
                               ["16x, to force adaptive detail", 16]]) {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    await settle(1500);                       // let the smoothed averages catch up
    const r = await page.evaluate(() => new Promise(res => {
      let n = 0; const t0 = performance.now();
      const tick = () => { n++;
        if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
        else res({ fps: n / ((performance.now() - t0) / 1000),
                   update: CONDUIT.perf.update, draw: CONDUIT.perf.draw,
                   detail: CONDUIT.fx.detail }); };
      requestAnimationFrame(tick);
    }));
    console.log(`  ${label.padEnd(18)} ${r.fps.toFixed(1)} fps` +
                `   update ${r.update.toFixed(2)}ms   draw ${r.draw.toFixed(2)}ms` +
                `   blob detail ${r.detail}`);
    seen[rate] = r;
    if (rate === RATE) {
      must(`update stays inside its 5ms budget at ${RATE}x`, r.update <= 5, r.update.toFixed(2)+"ms");
      must(`draw stays inside its 8ms budget at ${RATE}x`, r.draw <= 8, r.draw.toFixed(2)+"ms");
      must(`the game's own work fits a 60fps frame at ${RATE}x`,
           r.update + r.draw <= 16.7, (r.update+r.draw).toFixed(2)+"ms of 16.7");
    }
  }
  must("adaptive detail engages when the draw budget is exceeded",
       seen[16].draw <= CFGdraw || seen[16].detail < seen[1].detail,
       `draw ${seen[16].draw.toFixed(2)}ms at detail ${seen[16].detail}`);
  must("and it drops resolution, never identity (the outline is still an outline)",
       seen[16].detail >= 24, "detail "+seen[16].detail);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await browser.close();
  console.log(failed ? `\n${failed} FAILED\n` : "\nwithin budget\n");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
