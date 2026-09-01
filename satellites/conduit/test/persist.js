// CONDUIT persistence, across a real page reload.
//
// The smoke suite exercises the save path headless against an in memory store,
// which proves the merge rules. It cannot prove the thing that actually matters
// to a player: that closing the tab and coming back does not lose the run. This
// drives real localStorage in real Chrome and reloads the page between writing
// and reading, so nothing is taken on trust.
//
//   node test/persist.js [width] [height]
const path = require("path");
const { open, driver, settle, URL } = require("./drive");

const VW = Number(process.argv[2]) || 844;
const VH = Number(process.argv[3]) || 390;
const SHOTS = path.join(__dirname, "..", "docs", "shots");

let failed = 0;
const must = (n, c, e = "") => { if (c) console.log("  ok   " + n);
  else { failed++; console.log("  FAIL " + n + (e ? "  → " + e : "")); } };
const log = (...a) => console.log("  " + a.join(" "));

(async () => {
  const { browser, page, errs } = await open(VW, VH);
  const d = driver(page, VW, VH);
  console.log(`\nCONDUIT persistence across a reload, ${VW}x${VH}\n`);

  await page.evaluate(() => CONDUIT.clearSave());
  must("the store really is localStorage in a browser, not the memory fallback",
       await page.evaluate(() => typeof localStorage !== "undefined"));

  // ── a run, suspended, then the page thrown away ────────────────────────────
  await d.start();
  await page.evaluate(() => {
    CONDUIT.startLevel("site-02");
    CONDUIT.beginDraft(9,16);
    for(let y=15;y>=5;y--) CONDUIT.draftStep(9,y);
    for(let x=10;x<=16;x++) CONDUIT.draftStep(x,5);
    CONDUIT.commitDraft();
    const b = CONDUIT.blobRef(); b.x = 12.5; b.y = 9.5;
  });
  await settle(1500);
  const before = await page.evaluate(() => {
    const S = CONDUIT.S, b = CONDUIT.blobRef();
    return { level:S.level, mass:b.mass, x:b.x, y:b.y, owned:S.ledger.owned,
             tiles:S.conduits[0] ? S.conduits[0].path.length : 0,
             cost:S.conduits[0] ? S.conduits[0].cost : 0,
             time:S.stats.time, alert:S.site.alert };
  });
  must("suspending writes the run", await page.evaluate(() => CONDUIT.suspendRun()));
  log(`suspended: ${before.level}, ${before.tiles} tiles laid, body ${before.mass.toFixed(1)},` +
      ` ${before.time.toFixed(1)}s in`);

  // the honest part: throw the page away entirely
  await page.reload({ waitUntil: "load" });
  await settle(400);
  must("after a reload the game starts fresh, as it should",
       await page.evaluate(() => CONDUIT.S.stats.time < 1));
  must("but the suspended run is still on disk",
       await page.evaluate(() => !!CONDUIT.readSave().run));

  must("and it comes back", await page.evaluate(() => CONDUIT.resumeRun()));
  const after = await page.evaluate(() => {
    const S = CONDUIT.S, b = CONDUIT.blobRef();
    return { level:S.level, mass:b.mass, x:b.x, y:b.y, owned:S.ledger.owned,
             tiles:S.conduits[0] ? S.conduits[0].path.length : 0,
             cost:S.conduits[0] ? S.conduits[0].cost : 0,
             time:S.stats.time, alert:S.site.alert, leak:S.ledger.leak };
  });
  must("on the same site", after.level === before.level, after.level);
  must("with the body where it stood",
       Math.abs(after.x-before.x) < 1e-9 && Math.abs(after.y-before.y) < 1e-9,
       `${after.x},${after.y}`);
  must("and the mass it had", Math.abs(after.mass-before.mass) < 1e-9,
       `${before.mass} then ${after.mass}`);
  must("the wire still laid, tile for tile",
       after.tiles === before.tiles && Math.abs(after.cost-before.cost) < 1e-9,
       `${before.tiles}/${before.cost} then ${after.tiles}/${after.cost}`);
  must("the ledger intact", Math.abs(after.owned-before.owned) < 1e-9);
  // within a frame or two: the loop is live and steps between the resume and
  // the read, which is not the clock restarting
  must("the clock not restarted", Math.abs(after.time-before.time) < 0.1,
       `${before.time.toFixed(3)} then ${after.time.toFixed(3)}`);
  must("and no mass leaked across the reload", !(after.leak > 1e-6), "leak="+after.leak);
  await page.screenshot({ path: path.join(SHOTS, "c5-resumed.png") });

  // ── residue and traits across a reload ─────────────────────────────────────
  await page.evaluate(() => {
    CONDUIT.clearSave();
    CONDUIT.writeSave({ residueDelta: 120 });
    CONDUIT.buyTrait("splice");
  });
  const spent = await page.evaluate(() => CONDUIT.readSave().residue);
  await page.reload({ waitUntil: "load" });
  await settle(300);
  const kept = await page.evaluate(() => ({ residue: CONDUIT.readSave().residue,
    splice: CONDUIT.traitRank(CONDUIT.readSave(), "splice") }));
  must("residue survives a reload", kept.residue === spent, `${spent} then ${kept.residue}`);
  must("and so does what you bought with it", kept.splice === 1);
  must("and a new run starts with it live",
       await page.evaluate(() => { CONDUIT.startLevel("site-01");
         return CONDUIT.S.player.traits.splice === true; }));

  // ── two tabs, which is the case that eats saves ────────────────────────────
  // Over file:// Chrome gives every document an opaque origin, so two tabs do
  // not share localStorage at all and the interesting case cannot happen. Serve
  // the same file over http, where they do, and test it for real.
  {
    const http = require("http"), fs = require("fs");
    const ROOT = path.join(__dirname, "..");
    const server = http.createServer((req, res) => {
      const f = path.join(ROOT, req.url === "/" ? "index.html" : req.url.replace(/^\//, ""));
      fs.readFile(f, (e, dta) => {
        if (e) { res.writeHead(404); res.end(); }
        else { res.writeHead(200, { "Content-Type": "text/html" }); res.end(dta); }
      });
    });
    await new Promise(r => server.listen(0, "127.0.0.1", r));
    const url = `http://127.0.0.1:${server.address().port}/index.html`;
    const a = await browser.newPage(), b2 = await browser.newPage();
    for (const pg of [a, b2]) {
      await pg.setViewport({ width: VW, height: VH, isMobile: true, hasTouch: true });
      await pg.goto(url, { waitUntil: "load" });
    }
    await settle(300);
    await a.evaluate(() => CONDUIT.clearSave());
    must("served over http, the two tabs share one store",
         await b2.evaluate(() => { CONDUIT.writeSave({ residueDelta: 1 });
           return CONDUIT.readSave().residue === 1; }));
    await a.evaluate(() => CONDUIT.clearSave());
    await a.evaluate(() => CONDUIT.writeSave({ residueDelta: 30 }));
    await b2.evaluate(() => CONDUIT.writeSave({ residueDelta: 40 }));
    await a.evaluate(() => CONDUIT.writeSave({ traits: { insulation: 1 } }));
    const merged = await b2.evaluate(() => CONDUIT.readSave());
    must("two tabs writing add up instead of clobbering", merged.residue === 70,
         "residue=" + merged.residue);
    must("and neither loses what the other bought", merged.traits.insulation === 1,
         JSON.stringify(merged.traits));
    await a.evaluate(() => CONDUIT.clearSave());
    await a.close(); await b2.close();
    server.close();
  }

  await page.evaluate(() => CONDUIT.clearSave());
  must("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await browser.close();
  console.log(failed ? `\n${failed} FAILED\n` : "\nthe save survives being closed\n");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
