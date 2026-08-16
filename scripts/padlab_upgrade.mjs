#!/usr/bin/env node
/* PadLab upgrade path: does a project saved by the OLD build survive the new one?

   Stephen and his daughter have been using PadLab since early August, so there
   are real v3 projects sitting in IndexedDB on their devices. The marble merge
   bumped the format to v4. Making up a v3 object by hand and feeding it to
   applyStateVars proves very little, because the object I invent is the object
   I already believe in. This drives the ACTUAL pre-merge build, saves a real
   project out of it, then loads that exact bytes-on-disk project into the new
   build and checks nothing was lost.

   Serve both:
     python3 -m http.server 8961 --directory <old build>   (git show 914dda45^:padlab/index.html)
     python3 -m http.server 8950                            (repo root, for /padlab/)
     node scripts/padlab_upgrade.mjs */
import puppeteer from "puppeteer";

const OLD = process.env.OLD_URL || "http://127.0.0.1:8961/";
const NEW = process.env.NEW_URL || "http://127.0.0.1:8950/padlab/";
let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

async function open(url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 });
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  await page.goto(url, { waitUntil: "networkidle2" });
  await sleep(1200);
  const b = await page.evaluate(() => {
    const x = [...document.querySelectorAll("button")].find(t => /let's play|start/i.test(t.textContent));
    if (!x) return null; const r = x.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (b) { await page.mouse.move(b.x, b.y); await page.mouse.down(); await page.mouse.up(); await sleep(1600); }
  page.errs = errs;
  return page;
}

console.log("PADLAB UPGRADE PATH");
console.log("  old: " + OLD);
console.log("  new: " + NEW);

/* ---------- make a real project in the OLD build ---------- */
console.log("[the old build]");
const oldPage = await open(OLD);
const oldVer = await oldPage.evaluate(() => collectState().v);
ok(oldVer === 3, "the old build really is v3", "v" + oldVer);
ok(await oldPage.evaluate(() => typeof window.mbMarbles === "undefined"),
  "and really has no marble code in it");

/* do the things a person actually does: pick a groove, edit steps, change
   tempo and key, switch slot, tweak a pad */
const project = await oldPage.evaluate(() => {
  tempo = 128; swing = 32; keyRoot = 5; scaleName = "Minor Pentatonic"; scaleLock = true;
  curSlot = 2; octaveShift = 1; chordMode = true; drumKit = "classic";
  const p = pat();
  p.tracks[0] = [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0];
  p.tracks[1] = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0];
  p.tracks[2] = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1];
  p.mutes[3] = true;
  pads[0].vol = 0.72; pads[0].tune = -3; pads[0].rev = true;
  currentInstId = "piano";
  return JSON.parse(JSON.stringify(collectState()));
});
ok(project.v === 3 && !("marble" in project),
  "a project saved by the old build has no marble key", JSON.stringify(Object.keys(project)).slice(0, 90));
await oldPage.close();

/* ---------- load those exact bytes into the NEW build ---------- */
console.log("[the new build]");
const newPage = await open(NEW);
const newVer = await newPage.evaluate(() => collectState().v);
ok(newVer === 4, "the new build is v4", "v" + newVer);

const restored = await newPage.evaluate(async proj => {
  /* Put marbles on the plate FIRST. Loading a v3 project has to CLEAR them,
     not merely default when there is nothing there: without that branch, one
     project's marbles bleed into the next, and a test that starts from an
     empty plate would never notice. */
  mbMarbles = [
    { gx: 1, gy: 1, type: "bass", shelf: 2, deg: 0, phase: 0, lastHit: -9 },
    { gx: 2, gy: 2, type: "hat", shelf: 1, deg: 0, phase: 0.5, lastHit: -9 }
  ];
  mbPlates = [{ x0: 0, y0: 0, w: 16, h: 16 }, { x0: 19, y0: 0, w: 16, h: 16 }];
  mbShowBeat = true;
  // put it where the app's own autosave would have left it, then restore the
  // way the app restores, rather than poking state directly
  await idbSet("project", proj);
  const back = await idbGet("project");
  applyStateVars(back);
  refreshAllUI();
  return {
    tempo, swing, keyRoot, scaleName, curSlot, octaveShift, chordMode,
    currentInstId,
    track0: pat().tracks[0].join(""),
    track2: pat().tracks[2].join(""),
    mute3: pat().mutes[3],
    padVol: pads[0].vol, padTune: pads[0].tune, padRev: pads[0].rev,
    marbles: mbMarbles.length, plates: mbPlates.length, showBeat: mbShowBeat,
    tempoField: document.getElementById("tempo").value
  };
}, project);

ok(restored.tempo === 128 && restored.swing === 32, "tempo and swing came back",
  JSON.stringify({ t: restored.tempo, s: restored.swing }));
ok(restored.keyRoot === 5 && restored.scaleName === "Minor Pentatonic",
  "key and scale came back", JSON.stringify(restored));
ok(restored.track0 === "1000001010000000", "the kick pattern is intact", restored.track0);
ok(restored.track2 === "1010101010101011", "so is the hat pattern", restored.track2);
ok(restored.mute3 === true, "a muted track stays muted");
ok(Math.abs(restored.padVol - 0.72) < 0.001 && restored.padTune === -3 && restored.padRev === true,
  "per pad volume, tune and reverse survive", JSON.stringify(restored));
ok(restored.curSlot === 2 && restored.octaveShift === 1 && restored.chordMode === true,
  "slot, octave and chord mode survive", JSON.stringify(restored));
ok(String(restored.tempoField) === "128", "and the UI shows it, not just the variable",
  String(restored.tempoField));

/* the new part must default cleanly rather than throwing or arriving broken */
ok(restored.marbles === 0,
  "loading an old project CLEARS marbles left over from the last one",
  String(restored.marbles));
ok(restored.plates === 1, "and puts the plate back to one", String(restored.plates));
ok(restored.showBeat === false, "and turns show my beat off", String(restored.showBeat));

/* and the marble tab is usable straight afterwards, not left in a bad state */
const usable = await newPage.evaluate(async () => {
  [...document.querySelectorAll(".tab")].find(t => t.dataset.view === "marble").click();
  await new Promise(r => setTimeout(r, 700));
  const c = document.getElementById("mb-cv");
  mbMarbles.push({ gx: 2, gy: 3, type: "hat", shelf: 1, deg: 0, phase: 0, lastHit: -9 });
  await new Promise(r => setTimeout(r, 400));
  const st = collectState();
  return { w: c.width, h: c.height, saved: st.marble.marbles.length, v: st.v };
});
ok(usable.w > 100 && usable.h > 100, "the marble canvas sized itself after the old load",
  JSON.stringify(usable));
ok(usable.saved === 1 && usable.v === 4, "and the project saves forward as v4",
  JSON.stringify(usable));

/* ---------- and the round trip the other way: v4 export, re-import ---------- */
const roundTrip = await newPage.evaluate(async () => {
  const st = collectState();
  const json = JSON.stringify(st);           // what Export project writes
  const back = JSON.parse(json);
  applyStateVars(back); refreshAllUI();
  return { tempo, marbles: mbMarbles.length, track0: pat().tracks[0].join("") };
});
ok(roundTrip.tempo === 128 && roundTrip.marbles === 1 &&
   roundTrip.track0 === "1000001010000000",
  "a v4 project exports and imports without loss", JSON.stringify(roundTrip));

ok(newPage.errs.length === 0, "no errors during the upgrade",
  newPage.errs.slice(0, 3).join(" | "));
await newPage.close();

await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
