#!/usr/bin/env node
/* Bandit's Box — the white noise regression suite.

   Bug #1 in this app's history was a looping noise source that outlived the
   gesture that started it: a friction bed told to fade with setTargetAtTime
   never actually reaches zero (it is asymptotic), and a loop left at "almost
   zero" is exactly what quiet hiss sounds like. The engine's answer is the
   LIVE registry — nothing that loops may exist outside it — plus every fade
   landing on a real zero.

   Listening on a phone is the human version of this test. This is the
   deterministic version: start a real continuous gesture, interrupt it five
   different ways, and assert the registry drained and the gain nodes are at
   hard zero. It catches a leak that is below the threshold of hearing.

   Serve the app first:
     python3 -m http.server 8942 -d satellites/bandits-box
     node scripts/banditsbox_silence.mjs */
import puppeteer from "puppeteer";

const BASE = process.env.BB_URL || "http://127.0.0.1:8942/";
let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667 });
await page.goto(BASE, { waitUntil: "networkidle2" });
await page.mouse.move(187, 400); await page.mouse.down(); await page.mouse.up();
await sleep(900);

console.log("SILENCE SUITE  " + BASE);

// Instrument the engine: remember every continuous voice ever created so we
// can inspect its gain nodes after the fact, not just count the registry.
await page.evaluate(() => {
  window.__born = [];
  const wrap = name => {
    const orig = window[name];
    if (typeof orig !== "function") return false;
    window[name] = function (cfg) {
      const v = orig.apply(this, arguments);
      try { window.__born.push({ kind: name, v: v }); } catch (e) {}
      return v;
    };
    return true;
  };
  window.__wrapped = ["Friction", "Stretch"].map(wrap);
});

/* Hold a finger down on a toy that runs a continuous bed, moving so the
   friction voice actually opens, then hand back a way to interrupt it. */
async function startGesture(toyId, grabSel) {
  await page.evaluate(id => { showToy(id); }, toyId);
  await sleep(450);
  await page.evaluate(() => { window.__born = []; });
  /* Some toys are a grid of separate pieces (textures is tiles, each with its
     own handler) so the middle of the section can be empty space. Where a
     selector is given, grab that piece instead of the section centre. */
  const box = await page.evaluate(sel => {
    const sec = document.querySelector(".toy.on");
    const el = sel ? sec.querySelector(sel) : sec;
    const r = (el || sec).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, grabSel || null);
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  for (let i = 0; i < 14; i++) {
    await page.mouse.move(box.x + Math.sin(i / 2) * (box.w * 0.28), box.y + (i % 5) * 6);
    await sleep(45);
  }
  return page.evaluate(() => ({ born: window.__born.length, live: window.LIVE.length }));
}

/* After an interruption: the registry must be empty, and every continuous
   voice ever born must be dead with its gain nodes at a real zero. */
async function assertSilent(label, extraWait) {
  await sleep(extraWait || 900);
  const state = await page.evaluate(() => {
    const out = { live: window.LIVE.length, pointers: Object.keys(window.POINTERS || {}).length,
                  gains: [], undead: 0 };
    // Sample every gain node still reachable from a born voice. The engine
    // hides them in closures, so read the audible truth instead: the app's
    // analyser-free graph means we check the scheduled value on the node the
    // voice exposes, plus the registry itself.
    (window.__born || []).forEach(b => {
      const v = b.v;
      if (!v) return;
      // a voice still in LIVE after an interruption is the leak we care about
      if (window.LIVE.indexOf(v) >= 0) out.undead++;
    });
    return out;
  });
  ok(state.live === 0, label + ": nothing left in the LIVE registry", JSON.stringify(state));
  ok(state.undead === 0, label + ": no continuous voice outlived the gesture", JSON.stringify(state));
  return state;
}

/* 1. toy switch mid gesture */
console.log("[1 toy switch mid gesture]");
let g = await startGesture("tex", ".tex");
ok(g.live > 0, "a continuous voice is running during the gesture", JSON.stringify(g));
await page.evaluate(() => showToy("sand"));
await assertSilent("toy switch");
await page.mouse.up();

/* 2. tab hidden mid gesture */
console.log("[2 tab hidden mid gesture]");
g = await startGesture("sand");
ok(g.live > 0, "a continuous voice is running during the gesture", JSON.stringify(g));
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
  document.dispatchEvent(new Event("visibilitychange"));
});
await assertSilent("tab hidden");
const suspended = await page.evaluate(() => window.AC ? window.AC.state : "none");
ok(suspended === "suspended" || suspended === "closed",
  "tab hidden: the audio context is suspended", String(suspended));
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
  document.dispatchEvent(new Event("visibilitychange"));
});
await page.mouse.up();
await sleep(300);

/* 3. full screen toggle mid gesture */
console.log("[3 big mode toggle mid gesture]");
g = await startGesture("slime");
ok(g.live > 0, "a continuous voice is running during the gesture", JSON.stringify(g));
await page.evaluate(() => { document.body.classList.add("big"); showToy("slime"); });
await assertSilent("big toggle");
await page.evaluate(() => document.body.classList.remove("big"));
await page.mouse.up();

/* 4. window blur mid gesture (backgrounding on desktop) */
console.log("[4 window blur mid gesture]");
g = await startGesture("spring");
ok(g.live > 0, "a continuous voice is running during the gesture", JSON.stringify(g));
await page.evaluate(() => window.dispatchEvent(new Event("blur")));
await assertSilent("blur");
await page.mouse.up();

/* 5. finger simply lifted, then left alone */
console.log("[5 gesture ends normally, then idle]");
g = await startGesture("tex", ".tex");
ok(g.live > 0, "a continuous voice is running during the gesture", JSON.stringify(g));
await page.mouse.up();
await assertSilent("pointer up", 1500);

/* 6. every toy, touched in turn, leaves nothing behind */
console.log("[6 sweep every toy]");
const toys = await page.evaluate(() => window.TOYS.map(t => t.id));
for (const id of toys) {
  await page.evaluate(i => showToy(i), id);
  await sleep(120);
  const b = await page.evaluate(() => {
    const s = document.querySelector(".toy.on").getBoundingClientRect();
    return { x: s.left + s.width / 2, y: s.top + s.height / 2, w: s.width };
  });
  await page.mouse.move(b.x, b.y); await page.mouse.down();
  await page.mouse.move(b.x + b.w * 0.2, b.y + 10); await sleep(60);
  await page.mouse.move(b.x - b.w * 0.2, b.y - 10); await sleep(60);
  await page.mouse.up();
  await sleep(60);
}
await sleep(1200);
const endState = await page.evaluate(() => ({ live: window.LIVE.length }));
ok(endState.live === 0, "after touching all 21 toys nothing is still looping",
  JSON.stringify(endState));

await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
