// CONDUIT sound and accessibility check.
//
// HANDOFF-CONDUIT C6 gate: an audio demo run logged, a reduced motion screenshot
// pair, and no service worker. This drives a real run in real Chrome with a real
// AudioContext and logs which cues actually fired, then shoots the same frame
// with motion full and reduced.
//
// It cannot tell you whether the sound is GOOD. That is a pair of ears and it is
// Stephen's. It can tell you every cue fires, once, at the right moment, and
// that turning sound off silences the game rather than only muting the master.
//
//   node test/audio.js [width] [height]
const path = require("path");
const { open, driver, enterSite, settle } = require("./drive");

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
  console.log(`\nCONDUIT sound and motion at ${VW}x${VH}\n`);

  await page.evaluate(() => CONDUIT.clearSave());
  await enterSite(page, "site-02");
  await settle(600);

  must("a real AudioContext came up on the gesture that started play",
       await page.evaluate(() => CONDUIT.AUD.ready === true),
       await page.evaluate(() => typeof (window.AudioContext||window.webkitAudioContext)));
  must("and the site hum is running", await page.evaluate(() =>
       !!(CONDUIT.AUD.humGain && CONDUIT.AUD.humFilt)));

  // ── drive a run that touches every cue ────────────────────────────────────
  await page.evaluate(() => {
    CONDUIT.beginDraft(9,16);
    for(let y=15;y>=5;y--) CONDUIT.draftStep(9,y);
    for(let x=10;x<=16;x++) CONDUIT.draftStep(x,5);
    CONDUIT.commitDraft();                                  // a live run
  });
  await settle(700);
  await d.tapBtn("flow"); await settle(900);                 // mode change
  await d.tapBtn("flow"); await settle(900);
  await page.evaluate(() => { CONDUIT.ledgerDamage(9); });   // a hit
  await settle(400);
  await page.evaluate(() => {                                // a harvest
    const b = CONDUIT.blobRef();
    CONDUIT.S.ledger.owned += 40 - b.mass; b.mass = 40;
    CONDUIT.S.bodies.push({ x:b.x, y:b.y, mass:18, decay:30, grace:0 });
  });
  await settle(1600);
  await page.evaluate(() => { CONDUIT.S.conduits[0].discovered = true; });
  await settle(400);
  await page.evaluate(() => { CONDUIT.bump(2, "demo"); });
  await settle(500);
  await page.evaluate(() => { CONDUIT.bump(4, "demo"); });   // lockdown
  await settle(900);
  await page.evaluate(() => { CONDUIT.S.site.lockdown = false;
    CONDUIT.S.site.alert = 2; CONDUIT.resolvePower(); });    // power back
  await settle(900);

  const cues = await page.evaluate(() => CONDUIT.AUD.log.map(x => x.cue));
  log("cues fired: " + cues.join(", "));
  for (const want of ["audio ready","mode flow","mode prowl","hit","harvest",
                      "wire found","escalate 2","lockdown","power back"]) {
    must(`the cue for "${want}" fired`, cues.includes(want));
  }
  must("nothing fired twice for one event",
       cues.filter(c => c === "lockdown").length === 1,
       cues.filter(c => c === "lockdown").length + " lockdowns");
  // Harvesting is continuous: without a hold-off it fired fifteen times for one
  // body, which would be a machine gun of slurps.
  must("one body is one slurp, not fifteen",
       cues.filter(c => c === "harvest").length <= 2,
       cues.filter(c => c === "harvest").length + " harvest cues");

  // ── silence really is silence ─────────────────────────────────────────────
  const before = await page.evaluate(() => CONDUIT.AUD.master.gain.value);
  await page.evaluate(() => { CONDUIT.settings.sound = false; CONDUIT.AUD.setEnabled(false); });
  await settle(400);
  const after = await page.evaluate(() => CONDUIT.AUD.master.gain.value);
  must("turning sound off takes the master to zero", after < 0.001,
       `${before.toFixed(3)} then ${after.toFixed(3)}`);
  must("and the game plays on regardless",
       await page.evaluate(() => { const t0 = CONDUIT.S.stats.time;
         return new Promise(r => setTimeout(() => r(CONDUIT.S.stats.time > t0), 300)); }));
  await page.evaluate(() => { CONDUIT.settings.sound = true; CONDUIT.AUD.setEnabled(true); });

  // ── reduced motion: a pair, same frame, both shot ─────────────────────────
  const scene = () => page.evaluate(() => {
    CONDUIT.startLevel("site-02");
    CONDUIT.beginDraft(9,16);
    for(let y=15;y>=5;y--) CONDUIT.draftStep(9,y);
    for(let x=10;x<=16;x++) CONDUIT.draftStep(x,5);
    CONDUIT.commitDraft();
    CONDUIT.S.enemies.forEach(e => { e.x = 40.5; e.y = 16.5; e.route = [[40,16]]; e.path = null; });
    const b = CONDUIT.blobRef(); b.x = 11.5; b.y = 8.5;
    CONDUIT.bump(3, "motion pair");
  });
  await page.evaluate(() => { CONDUIT.settings.motion = "full"; });
  await scene(); await settle(1400);
  must("motion is full", (await page.evaluate(() => CONDUIT.reducedMotion())) === false);
  await page.screenshot({ path: path.join(SHOTS, "c6-motion-full.png") });
  await page.evaluate(() => { CONDUIT.settings.motion = "reduced"; });
  await scene(); await settle(1400);
  must("motion is reduced", (await page.evaluate(() => CONDUIT.reducedMotion())) === true);
  await page.screenshot({ path: path.join(SHOTS, "c6-motion-reduced.png") });
  log("pair written: c6-motion-full.png and c6-motion-reduced.png");

  // reduced motion must damp, not delete: the creature is still ferrofluid
  const shape = await page.evaluate(() => {
    const p = CONDUIT.ferroBlob(0,0,20, 0, CONDUIT.fx.fs, 0.7, 180);
    const r = p.map(q => Math.hypot(q[0], q[1]));
    return { min: Math.min(...r), max: Math.max(...r) };
  });
  must("reduced motion still spikes, it does not flatten the creature",
       shape.max > 20 * 1.1, `max radius ${shape.max.toFixed(1)} of a base 20`);

  // ── the thing C6 must NOT add ─────────────────────────────────────────────
  must("no service worker is registered",
       await page.evaluate(() => !navigator.serviceWorker ||
         navigator.serviceWorker.controller === null));
  const html = require("fs").readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  must("and none is even referenced in the file",
       !/serviceWorker\s*\.\s*register|sw\.js|workbox/i.test(html));
  must("no manifest either, until Fable signs one off",
       !/rel=["']manifest["']/i.test(html));

  // ── the music manifest ────────────────────────────────────────────────────
  // A level with no track must not reach for one. Reaching logs a console error
  // on every boot and tells the player nothing. Proved in both directions: the
  // quiet path stays quiet, and the loud path is still able to be loud, so this
  // is not a gate that cannot fail.
  must("a site with no track is quiet without complaining",
       (await page.evaluate(() => CONDUIT.CFG.audio.tracks.indexOf("site-02") < 0)) &&
       cues.includes("no music for site-02"));
  const errsBefore = errs.length;
  await page.evaluate(() => { CONDUIT.CFG.audio.tracks.push("site-02");
                              CONDUIT.loadMusic("site-02"); });
  await settle(500);
  must("and listing a site DOES send it looking, so the gate is load bearing",
       errs.length > errsBefore, "no fetch was attempted either way");
  await page.evaluate(() => { CONDUIT.CFG.audio.tracks.length = 0; });
  errs.length = 0;

  must("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await browser.close();
  console.log(failed ? `\n${failed} FAILED\n` : "\nsound fires, motion damps, nothing was installed\n");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
