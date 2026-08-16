#!/usr/bin/env node
/* PadLab: the Marble tab.

   Serve padlab/ first:
     python3 -m http.server 8931 --directory padlab
     node scripts/padlab_marble.mjs

   The merge claims are what get tested here, not "the tab opens":
   marbles hit on the studio's own sixteenth grid rather than a clock of their
   own, drums bypass the effects while the melody does not, pitch is a scale
   degree so re-keying the studio re-keys the plate, the canvas is not 0x0
   after being built inside a hidden view, the animation stops when you leave
   the tab, and a v3 project from before any of this existed still loads. */
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const BASE = process.env.PADLAB_URL || "http://127.0.0.1:8931/";
const SHOTS = process.env.MB_SHOTS ||
  "/tmp/claude-1000/-workspaces-lucid-winds/f9cbdde3-a22e-4660-b039-acdd48a98f2a/scratchpad/marble";
mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errors.push(m.text()); });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
await page.goto(BASE, { waitUntil: "networkidle2" });
await sleep(1200);

console.log("PADLAB MARBLE  " + BASE);

/* through the splash the way a player does — it exists for the audio unlock */
const sp = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => /let's play|start/i.test(x.textContent));
  if (!b) return null;
  const r = b.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, hit: !!(top && (top === b || b.contains(top))) };
});
ok(sp && sp.hit, "the splash button is reachable", JSON.stringify(sp));
await page.mouse.move(sp.x, sp.y); await page.mouse.down(); await page.mouse.up();
await sleep(1500);

/* ---------- the tab, and the hidden-canvas trap ---------- */
console.log("[the tab]");
const tabs = await page.evaluate(() => [...document.querySelectorAll(".tab")].map(t => t.dataset.view));
ok(tabs.join(",") === "beats,keys,sample,marble", "four tabs, marble last", tabs.join(","));

const clickTab = async v => {
  const b = await page.evaluate(view => {
    const t = [...document.querySelectorAll(".tab")].find(x => x.dataset.view === view);
    const r = t.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, hit: !!(top && (top === t || t.contains(top))) };
  }, v);
  if (b.hit) { await page.mouse.move(b.x, b.y); await page.mouse.down(); await page.mouse.up(); }
  await sleep(600);
  return b;
};
const tabHit = await clickTab("marble");
ok(tabHit.hit, "the marble tab is clickable where it appears", JSON.stringify(tabHit));

const canvas = await page.evaluate(() => {
  const c = document.getElementById("mb-cv");
  const r = c.getBoundingClientRect();
  return { w: c.width, h: c.height, cssW: Math.round(r.width), cssH: Math.round(r.height),
           viewOn: document.getElementById("view-marble").classList.contains("on") };
});
ok(canvas.viewOn, "the view is showing", JSON.stringify(canvas));
ok(canvas.w > 100 && canvas.h > 100,
  "the canvas has real pixels, not the 0x0 a hidden view would have given",
  JSON.stringify(canvas));

/* it must actually PAINT, not merely exist */
const painted = await page.evaluate(() => {
  const c = document.getElementById("mb-cv");
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let lit = 0;
  for (let i = 3; i < d.length; i += 4 * 211) if (d[i] > 8) lit++;
  return lit;
});
ok(painted > 20, "the plate is drawn on it", "lit samples: " + painted);

/* The whole plate has to be inside the frame when the tab first opens. It
   cannot be fitted at boot, because a hidden view has no size to fit to, and
   the first version of this got that wrong and left the corners off screen. */
const framed = await page.evaluate(() => {
  const p = mbPlates[0];
  const corners = [[p.x0, p.y0], [p.x0 + p.w, p.y0], [p.x0 + p.w, p.y0 + p.h], [p.x0, p.y0 + p.h]]
    .map(c => mbIso(c[0], c[1], 0));
  const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys),
           w: mbW, h: mbH, zoom: +mbZoom.toFixed(3) };
});
ok(framed.minX >= -2 && framed.maxX <= framed.w + 2,
  "the plate fits the frame across", JSON.stringify(framed));
ok(framed.minY >= -2 && framed.maxY <= framed.h + 2,
  "and down", JSON.stringify(framed));

/* And at a desktop width, which is where the first version of the fit fell
   over: it only ever fitted to width, so on a wide screen the zoom clamped at
   1 and the plate grew taller than the box it lives in. A phone sized test
   passed the whole time. */
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await sleep(500);
await page.evaluate(() => { mbFitted = false; mbResize(); mbFitOnce(); });
await sleep(400);
const wide = await page.evaluate(() => {
  const p = mbPlates[0];
  const c = [[p.x0, p.y0], [p.x0 + p.w, p.y0], [p.x0 + p.w, p.y0 + p.h], [p.x0, p.y0 + p.h]]
    .map(q => mbIso(q[0], q[1], 0));
  const xs = c.map(q => q[0]), ys = c.map(q => q[1]);
  return { minX: Math.round(Math.min(...xs)), maxX: Math.round(Math.max(...xs)),
           minY: Math.round(Math.min(...ys)), maxY: Math.round(Math.max(...ys)),
           w: Math.round(mbW), h: Math.round(mbH), zoom: +mbZoom.toFixed(3) };
});
ok(wide.minX >= -2 && wide.maxX <= wide.w + 2 && wide.minY >= -2 && wide.maxY <= wide.h + 2,
  "the plate fits the frame at desktop width too", JSON.stringify(wide));
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });
await sleep(400);
await page.evaluate(() => { mbFitted = false; mbResize(); mbFitOnce(); });
await sleep(300);

/* ---------- placing a marble ---------- */
console.log("[placing]");
const place = await page.evaluate(() => {
  const c = document.getElementById("mb-cv");
  const r = c.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 };
});
await page.mouse.move(place.x, place.y);
await page.mouse.down(); await page.mouse.up();
await sleep(400);
const afterTap = await page.evaluate(() => ({ n: mbMarbles.length, m: mbMarbles[0] }));
ok(afterTap.n === 1, "tapping the plate drops a marble", JSON.stringify(afterTap));
ok(afterTap.m && afterTap.m.type === "bass" && afterTap.m.phase === 0,
  "it takes the type selected in the dock", JSON.stringify(afterTap.m));

/* ---------- one clock: the grid decides, not a second transport ---------- */
console.log("[one clock]");
const timing = await page.evaluate(async () => {
  // a marble on every shelf, so all five periods are exercised at once
  mbMarbles = [0, 1, 2, 3, 4].map((sh, i) => ({ gx: i, gy: i, type: "hat", shelf: sh, deg: 0, phase: 0, lastHit: -9 }));
  const hits = [];
  const realPlay = window.mbPlayHit;
  window.mbPlayHit = function (m, t) { hits.push({ shelf: m.shelf, t: +t.toFixed(6) }); };
  const g0 = grid;
  if (!isPlaying) startBeat();
  await new Promise(r => setTimeout(r, 4200));
  stopBeat();
  window.mbPlayHit = realPlay;
  const six = 60 / tempo / 4;
  const per = {};
  [0, 1, 2, 3, 4].forEach(sh => {
    const ts = hits.filter(h => h.shelf === sh).map(h => h.t).sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < ts.length; i++) gaps.push(+(ts[i] - ts[i - 1]).toFixed(4));
    per[sh] = { count: ts.length, gaps: gaps.slice(0, 3) };
  });
  return { six: +six.toFixed(5), tempo, per, total: hits.length, gridMoved: grid > g0 };
});
ok(timing.total > 0, "marbles sound while the transport runs", JSON.stringify(timing).slice(0, 120));
/* a 1/16 marble every 1 sixteenth, a 1/8 every 2, a 1/4 every 4, and so on */
[[0, 1], [1, 2], [2, 4], [3, 8]].forEach(([shelf, mult]) => {
  const info = timing.per[shelf];
  const want = timing.six * mult;
  const good = info.count > 1 && info.gaps.every(g => Math.abs(g - want) < 0.0005);
  ok(good, "shelf " + shelf + " hits every " + mult + " sixteenth" + (mult > 1 ? "s" : ""),
    JSON.stringify({ want: +want.toFixed(4), got: info.gaps }));
});

/* phase: half a period out means exactly half a period later */
const phased = await page.evaluate(async () => {
  mbMarbles = [
    { gx: 1, gy: 1, type: "hat", shelf: 2, deg: 0, phase: 0, lastHit: -9 },
    { gx: 2, gy: 2, type: "snare", shelf: 2, deg: 0, phase: 0.5, lastHit: -9 }
  ];
  const hits = [];
  const real = window.mbPlayHit;
  window.mbPlayHit = function (m, t) { hits.push({ type: m.type, t }); };
  if (!isPlaying) startBeat();
  await new Promise(r => setTimeout(r, 3000));
  stopBeat();
  window.mbPlayHit = real;
  const hat = hits.filter(h => h.type === "hat").map(h => h.t).sort((a, b) => a - b);
  const sn = hits.filter(h => h.type === "snare").map(h => h.t).sort((a, b) => a - b);
  if (!hat.length || !sn.length) return { hat: hat.length, sn: sn.length };
  const six = 60 / tempo / 4;
  const off = sn.find(t => t > hat[0]) - hat[0];
  return { offset: +off.toFixed(5), halfPeriod: +(2 * six).toFixed(5) };
});
ok(phased.offset !== undefined && Math.abs(phased.offset - phased.halfPeriod) < 0.0005,
  "a marble half a period out lands exactly half a period later", JSON.stringify(phased));

/* swing must reach marbles, because they ride the same tPlay the pads do */
const swung = await page.evaluate(async () => {
  const before = swing;
  swing = 50;
  mbMarbles = [{ gx: 1, gy: 1, type: "hat", shelf: 0, deg: 0, phase: 0, lastHit: -9 }];
  const hits = [];
  const real = window.mbPlayHit;
  window.mbPlayHit = function (m, t) { hits.push(t); };
  if (!isPlaying) startBeat();
  await new Promise(r => setTimeout(r, 2600));
  stopBeat();
  window.mbPlayHit = real; swing = before;
  const ts = hits.sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < ts.length; i++) gaps.push(+(ts[i] - ts[i - 1]).toFixed(5));
  const uniq = [...new Set(gaps.map(g => g.toFixed(4)))];
  return { gaps: gaps.slice(0, 6), distinct: uniq.length };
});
ok(swung.distinct >= 2, "with swing on, sixteenths are no longer evenly spaced",
  JSON.stringify(swung));

/* ---------- one graph: drums bypass the effects, melody does not ---------- */
console.log("[one graph]");
const routing = await page.evaluate(() => {
  const seen = { drum: 0, instr: 0 };
  const dReal = drumBus.connect ? null : null;
  const origConnect = GainNode.prototype.connect;
  GainNode.prototype.connect = function (dest) {
    if (dest === drumBus) seen.drum++;
    if (dest === instrBus) seen.instr++;
    return origConnect.apply(this, arguments);
  };
  const t = ct() + 0.05;
  mbPlayHit({ type: "bass", shelf: 2, deg: 0, phase: 0 }, t);
  mbPlayHit({ type: "snare", shelf: 2, deg: 0, phase: 0 }, t);
  mbPlayHit({ type: "hat", shelf: 2, deg: 0, phase: 0 }, t);
  const drumsOnly = { ...seen };
  mbPlayHit({ type: "melody", shelf: 2, deg: 0, phase: 0 }, t);
  const withMelody = { ...seen };
  GainNode.prototype.connect = origConnect;
  return { drumsOnly, withMelody };
});
ok(routing.drumsOnly.drum >= 3 && routing.drumsOnly.instr === 0,
  "bass, snare and hat go to the drum bus and bypass the effects",
  JSON.stringify(routing.drumsOnly));
ok(routing.withMelody.instr === 1,
  "the melody goes through the instrument bus, so it gets reverb and delay",
  JSON.stringify(routing.withMelody));

/* ---------- one musical brain: degrees, not fixed semitones ---------- */
console.log("[one scale]");
const keyed = await page.evaluate(() => {
  const before = { keyRoot, scaleName };
  keyRoot = 0; scaleName = "Minor Pentatonic"; rebuildScale();
  const inC = [0, 1, 2, 3].map(d => mbMidiOf(d));
  keyRoot = 5; rebuildScale();
  const inF = [0, 1, 2, 3].map(d => mbMidiOf(d));
  keyRoot = before.keyRoot; scaleName = before.scaleName; rebuildScale();
  return { inC, inF };
});
ok(JSON.stringify(keyed.inC) !== JSON.stringify(keyed.inF),
  "changing the studio's key moves every marble with it", JSON.stringify(keyed));
ok(keyed.inC.every((n, i) => i === 0 || n > keyed.inC[i - 1]),
  "degrees climb", JSON.stringify(keyed.inC));

/* ---------- show my beat ---------- */
console.log("[show my beat]");
const ghosts = await page.evaluate(() => {
  const p = pat();
  p.tracks[0] = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
  p.tracks[1] = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
  mbShowBeat = true; mbRebuildGhosts();
  const on = mbGhosts.length;
  const kinds = [...new Set(mbGhosts.map(g => g.type))];
  const serial = JSON.stringify(collectState().marble.marbles);
  mbShowBeat = false; mbRebuildGhosts();
  return { on, off: mbGhosts.length, kinds, serialHasGhosts: /ghost/.test(serial) };
});
ok(ghosts.on === 6, "the current pattern becomes ghost marbles", JSON.stringify(ghosts));
ok(ghosts.kinds.includes("bass") && ghosts.kinds.includes("snare"),
  "kick and snare tracks map to their own marble types", JSON.stringify(ghosts.kinds));
ok(ghosts.off === 0, "turning it off clears them");
ok(!ghosts.serialHasGhosts, "ghosts are never saved into the project");

/* ---------- state ---------- */
console.log("[state]");
const round = await page.evaluate(() => {
  mbMarbles = [{ gx: 3, gy: 4, type: "melody", shelf: 1, deg: 2, phase: 0.25, lastHit: -9 }];
  mbPlates = [{ x0: 0, y0: 0, w: 16, h: 16 }, { x0: 19, y0: 0, w: 16, h: 16 }];
  mbShowBeat = true;
  const st = collectState();
  mbMarbles = []; mbPlates = [{ x0: 0, y0: 0, w: 16, h: 16 }]; mbShowBeat = false;
  applyStateVars(st);
  return { v: st.v, n: mbMarbles.length, m: mbMarbles[0], plates: mbPlates.length, show: mbShowBeat,
           runtimeStripped: st.marble.marbles[0].lastHit === undefined };
});
ok(round.v === 4, "the project format is bumped to v4", String(round.v));
ok(round.n === 1 && round.m.deg === 2 && round.m.phase === 0.25 && round.m.type === "melody",
  "marbles survive a save and load", JSON.stringify(round));
ok(round.plates === 2, "so do extra plates", String(round.plates));
ok(round.show === true, "and the show my beat setting", String(round.show));
ok(round.runtimeStripped, "runtime fields are not written into the project");

const v3 = await page.evaluate(() => {
  mbMarbles = [{ gx: 1, gy: 1, type: "bass", shelf: 2, deg: 0, phase: 0, lastHit: -9 }];
  const old = collectState();
  delete old.marble; old.v = 3;
  let threw = null;
  try { applyStateVars(old); } catch (e) { threw = e.message; }
  return { threw, n: mbMarbles.length, plates: mbPlates.length };
});
ok(!v3.threw && v3.n === 0 && v3.plates === 1,
  "a project from before the marble tab still loads, with an empty plate",
  JSON.stringify(v3));

/* ---------- battery: the animation stops when you leave ---------- */
console.log("[battery]");
/* Count real draws rather than reading mbRaf: it is a top level let, so it is
   not a window property, and an assertion that cannot see it would pass on
   undefined without proving anything. Drawing or not drawing is the thing
   that actually costs battery anyway. */
const countDraws = async ms => page.evaluate(t => new Promise(res => {
  const c = document.getElementById("mb-cv").getContext("2d");
  const real = c.drawImage.bind(c);
  let n = 0;
  c.drawImage = function () { n++; return real.apply(this, arguments); };
  setTimeout(() => { c.drawImage = real; res(n); }, t);
}), ms);

await clickTab("beats");
await sleep(400);
const drawsAway = await countDraws(1000);
ok(drawsAway === 0, "leaving the tab stops the animation dead", "draws while away: " + drawsAway);

await clickTab("marble");
await sleep(400);
const drawsHere = await countDraws(1000);
ok(drawsHere > 10, "coming back starts it again", "draws while here: " + drawsHere);

/* ---------- the other three tabs are untouched ---------- */
console.log("[no collateral damage]");
for (const v of ["beats", "keys", "sample"]) {
  await clickTab(v);
  const state = await page.evaluate(view => {
    const sec = document.getElementById("view-" + view);
    const r = sec.getBoundingClientRect();
    return { on: sec.classList.contains("on"), w: Math.round(r.width), h: Math.round(r.height),
             kids: sec.querySelectorAll("*").length };
  }, v);
  ok(state.on && state.w > 200 && state.kids > 10, v + " still works", JSON.stringify(state));
}

/* ---------- shots ---------- */
await clickTab("marble");
await page.evaluate(() => { document.getElementById("mb-demo").click(); });
await sleep(1500);
await page.screenshot({ path: SHOTS + "/marble-demo.png" });
await page.evaluate(() => { stopBeat(); mbShowBeat = true; mbRebuildGhosts();
  document.getElementById("mb-showbeat").setAttribute("aria-pressed", "true"); });
await sleep(700);
await page.screenshot({ path: SHOTS + "/marble-showbeat.png" });
await page.evaluate(() => { mbTilt = 0.2; mbZoom = 0.42; mbCamDirty = true; });
await sleep(600);
await page.screenshot({ path: SHOTS + "/marble-worst-angle.png" });
console.log("  shots written");

ok(errors.length === 0, "no console errors anywhere in the run", errors.slice(0, 3).join(" | "));

await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
console.log("shots in " + SHOTS);
process.exit(fail ? 1 : 0);
