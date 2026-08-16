#!/usr/bin/env node
/* Bandit's Box smoke test.
   Boots the app, sweeps every toy, and asserts on real content — not on
   "no crash". Serve the folder first, e.g.
     python3 -m http.server 8942 -d satellites/bandits-box
     node scripts/banditsbox_smoke.mjs

   Controls are driven by real mouse events at the element's centre after an
   elementFromPoint hit test. el.click() would pass even if the control were
   covered by an overlay, so it is never used here to prove a control works.

   Screenshots land in $BB_SHOTS (default: the session scratchpad) for the
   LOOKING pass. Exit 0 = all green. */
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const BASE = process.env.BB_URL || "http://127.0.0.1:8942/";
const SHOTS = process.env.BB_SHOTS ||
  "/tmp/claude-1000/-workspaces-lucid-winds/f9cbdde3-a22e-4660-b039-acdd48a98f2a/scratchpad/bb";
const W = +(process.env.BB_W || 375), H = +(process.env.BB_H || 667);
mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (cond, label, detail) => {
  if (cond) { pass++; console.log("  ok  " + label); }
  else { fail++; console.log("  RED " + label + (detail ? "  -- " + detail : "")); }
};

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

async function newPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.errors = errors;
  return page;
}

/* Real click: hit test the element's centre, then dispatch mouse+pointer at
   those coordinates. Returns what is actually on top, so a covered control
   fails loudly instead of silently passing. */
async function realClick(page, selector, index) {
  const box = await page.evaluate((sel, idx) => {
    const el = idx == null ? document.querySelector(sel)
                           : document.querySelectorAll(sel)[idx];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return { hidden: true };
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    return { x, y, w: r.width, h: r.height, hit: !!(top && (top === el || el.contains(top))) };
  }, selector, index);
  if (!box || box.hidden || !box.hit) return box;
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.mouse.up();
  return box;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

console.log("BANDIT'S BOX SMOKE  " + BASE + "  " + W + "x" + H);

/* ---------------- boot ---------------- */
console.log("[boot]");
const page = await newPage();
await page.goto(BASE, { waitUntil: "networkidle2" });
ok(await page.$("#intro") !== null, "intro splash present");

// dismiss the splash the way a player does
await realClick(page, "#intro");
await sleep(700);
const introGone = await page.evaluate(() =>
  getComputedStyle(document.getElementById("intro")).display === "none");
ok(introGone, "splash dismissed by a real tap");

const stripCount = await page.evaluate(() => document.querySelectorAll("#strip .tab").length);
ok(stripCount === 22, "22 toy tabs in the picker strip", "got " + stripCount);

/* ---------------- every toy renders real content ---------------- */
console.log("[toys]");
const toys = await page.evaluate(() =>
  Array.from(document.querySelectorAll("#strip .tab")).map(b => b.textContent));

for (let i = 0; i < toys.length; i++) {
  const clicked = await realClick(page, "#strip .tab", i);
  if (!clicked || !clicked.hit) {
    // tab may be scrolled out of the strip's viewport — bring it in and retry
    await page.evaluate(idx => document.querySelectorAll("#strip .tab")[idx]
      .scrollIntoView({ block: "nearest", inline: "center" }), i);
    await sleep(120);
    await realClick(page, "#strip .tab", i);
  }
  await sleep(260);
  const state = await page.evaluate(() => {
    const sec = document.querySelector(".toy.on");
    if (!sec) return { on: false };
    const r = sec.getBoundingClientRect();
    // real content = descendant elements with actual layout, or a drawn canvas
    const kids = Array.from(sec.querySelectorAll("*")).filter(e => {
      const b = e.getBoundingClientRect();
      return b.width > 2 && b.height > 2;
    }).length;
    const cv = sec.querySelector("canvas");
    let painted = null;
    if (cv) {
      try {
        const c = cv.getContext("2d");
        const d = c.getImageData(0, 0, cv.width, cv.height).data;
        let lit = 0;
        for (let p = 3; p < d.length; p += 4 * 97) if (d[p] > 8) lit++;
        painted = lit;
      } catch (e) { painted = -1; }
    }
    return { on: true, id: sec.id, w: r.width, h: r.height, kids, hasCanvas: !!cv, painted };
  });
  const good = state.on && state.w > 100 && state.h > 100 && state.kids >= 3 &&
               (!state.hasCanvas || state.painted === null || state.painted > 0 || state.painted === -1);
  ok(good, "toy " + (i + 1) + "/" + toys.length + " " + toys[i] + " renders content",
    JSON.stringify(state));
}

/* ---------------- 48px touch targets, measured rendered ---------------- */
console.log("[touch targets @" + W + "x" + H + "]");
const small = await page.evaluate(() => {
  const out = [];
  const sels = ["#strip .tab", ".iconbtn", ".testbtn", ".sw", ".done", "#homeGrid .card"];
  sels.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) return;
    if (r.height < 48 || r.width < 48) out.push({ sel, w: +r.width.toFixed(1), h: +r.height.toFixed(1), t: (el.textContent || el.id || "").slice(0, 14) });
  }));
  const seen = {};
  return out.filter(o => { const k = o.sel + o.w + "x" + o.h; if (seen[k]) return false; seen[k] = 1; return true; });
});
ok(small.length === 0, "every touch target is at least 48px rendered",
  small.length ? JSON.stringify(small) : "");

/* ---------------- the switch wall goes through feel() ---------------- */
/* It used to call the synth directly, which meant it could never take a
   recording and kept private copies of the ripple and buzz. Flipping a switch
   must now produce a ripple like every other sound in the app. */
console.log("[switch wall]");
await page.evaluate(() => showToy("wall"));
await sleep(500);
const wallBefore = await page.evaluate(() => document.querySelectorAll("#fx .rip").length);
const sw = await page.evaluate(() => {
  const el = document.querySelector(".wsw");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { x: r.left + r.width / 2, y: r.top + r.height / 2,
           checked: el.getAttribute("aria-checked"),
           hit: !!(top && (top === el || el.contains(top))) };
});
ok(sw && sw.hit, "a wall switch is reachable where it appears", JSON.stringify(sw));
if (sw && sw.hit) {
  await page.mouse.move(sw.x, sw.y); await page.mouse.down(); await page.mouse.up();
  await sleep(200);
  const after = await page.evaluate(() => ({
    checked: document.querySelector(".wsw").getAttribute("aria-checked"),
    rips: document.querySelectorAll("#fx .rip").length
  }));
  ok(after.checked === "true", "flipping a switch toggles it", JSON.stringify(after));
  ok(after.rips > wallBefore, "flipping a switch makes a ripple, so it went through feel()",
    JSON.stringify({ before: wallBefore, after: after.rips }));
}

/* ---------------- selected state is visible ---------------- */
console.log("[visible state]");
// the selected toy tab must be inside the strip's visible box, not parked
// off screen after jumping to a toy at the far end
/* Park the strip back at the start FIRST. Without this the assertion passes
   trivially, because the sweep above already left the strip scrolled to the
   far end where the last tab happens to be visible. */
await page.evaluate(() => { showToy("coon"); document.getElementById("strip").scrollLeft = 0; });
await sleep(250);
const preScroll = await page.evaluate(() => document.getElementById("strip").scrollLeft);
ok(preScroll === 0, "strip parked at the start before the check", String(preScroll));
await page.evaluate(() => showToy("latch"));
await sleep(900);
const tabVis = await page.evaluate(() => {
  const strip = document.getElementById("strip");
  const sel = strip.querySelector('.tab[aria-selected="true"]');
  const s = strip.getBoundingClientRect(), t = sel.getBoundingClientRect();
  return { label: sel.textContent, inView: t.left >= s.left - 1 && t.right <= s.right + 1 };
});
ok(tabVis.inView, "selected toy tab is scrolled into view", JSON.stringify(tabVis));

const themeState = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('#themeRow .testbtn'));
  const on = btns.filter(b => b.getAttribute("aria-pressed") === "true");
  const styleOf = b => { const c = getComputedStyle(b); return c.backgroundColor + "|" + c.borderColor + "|" + c.boxShadow; };
  const onStyle = on.length ? styleOf(on[0]) : null;
  const offStyles = btns.filter(b => b.getAttribute("aria-pressed") !== "true").map(styleOf);
  return { count: on.length, distinct: onStyle !== null && !offStyles.includes(onStyle) };
});
ok(themeState.count === 1, "exactly one theme is marked selected", JSON.stringify(themeState));
ok(themeState.distinct, "the selected theme looks different from the others",
  JSON.stringify(themeState));

/* ---------------- the balloon ---------------- */
/* The one toy where waiting is the point, so what matters is that holding
   grows it, letting go early just sputters, and going past the limit is a
   joke rather than a failure the player could have avoided. */
console.log("[balloon]");
await page.evaluate(() => { S.calm = false; showToy("bln"); });
await sleep(600);

async function blnPress(ms) {
  const box = await page.evaluate(() => {
    const el = document.getElementById("blnBody");
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2,
             hit: !!(top && (top === el || el.contains(top) || top.id === "blnSvg")) };
  });
  if (!box.hit) return box;
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await sleep(ms);
  const mid = await page.evaluate(() => ({ r: window.blnR, live: window.LIVE.length }));
  await page.mouse.up();
  return Object.assign(box, { mid });
}

const startR = await page.evaluate(() => window.blnR);
const shortHold = await blnPress(700);
ok(shortHold.hit, "the balloon is reachable", JSON.stringify(shortHold));
ok(shortHold.mid.r > startR, "holding blows the balloon up",
  JSON.stringify({ from: startR, to: shortHold.mid.r }));
ok(shortHold.mid.live > 0, "the rising note is a real continuous voice",
  JSON.stringify(shortHold.mid));
await sleep(1400);
const afterShort = await page.evaluate(() => ({ r: window.blnR, fly: !!window.blnFly, live: window.LIVE.length }));
ok(!afterShort.fly, "letting go early does not send it flying", JSON.stringify(afterShort));
ok(Math.abs(afterShort.r - startR) < 1.5, "it sputters back down to where it started",
  JSON.stringify(afterShort));
ok(afterShort.live === 0, "and the note stops", JSON.stringify(afterShort));

// hold past the limit: it should leave, then a fresh balloon comes back
const longHold = await blnPress(3200);
ok(longHold.mid.r >= 70, "a long hold reaches the point where it lets go",
  JSON.stringify(longHold.mid));
await sleep(300);
const flying = await page.evaluate(() => ({ fly: !!window.blnFly }));
ok(flying.fly, "past the limit it flies off instead of bursting on you",
  JSON.stringify(flying));
await sleep(4000);
const recovered = await page.evaluate(() => ({
  fly: !!window.blnFly, r: window.blnR, live: window.LIVE.length,
  visible: +document.getElementById("blnBody").getAttribute("opacity")
}));
ok(!recovered.fly, "the flight ends on its own", JSON.stringify(recovered));
ok(recovered.live === 0, "nothing is left looping after the flight", JSON.stringify(recovered));
ok(recovered.visible > 0.4, "a fresh balloon comes back", JSON.stringify(recovered));

// calm motion clips the flight
await page.evaluate(() => { S.calm = true; });
await blnPress(3200);
await sleep(500);
const calm = await page.evaluate(() => ({ fly: !!window.blnFly }));
ok(!calm.fly, "calm motion skips the flight", JSON.stringify(calm));
await page.evaluate(() => { S.calm = false; });
await sleep(600);

/* ---------------- favourites ---------------- */
console.log("[favourites]");
await page.evaluate(() => { S.favs = []; saveS(); orderStrip(); showToy("coon"); });
await sleep(300);
const firstBefore = await page.evaluate(() =>
  document.querySelector("#strip .tab").getAttribute("data-id"));

/* hold a tab that is NOT first and NOT the open toy, so a stray tap would be
   visible as a toy change */
async function holdTab(id, ms) {
  const b = await page.evaluate(i => {
    const el = document.querySelector('#strip .tab[data-id="' + i + '"]');
    el.scrollIntoView({ block: "nearest", inline: "center" });
    return null;
  }, id);
  await sleep(250);
  const box = await page.evaluate(i => {
    const el = document.querySelector('#strip .tab[data-id="' + i + '"]');
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2,
             hit: !!(top && (top === el || el.contains(top))) };
  }, id);
  if (!box.hit) return box;
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await sleep(ms);
  await page.mouse.up();
  await sleep(350);
  return box;
}

const openBefore = await page.evaluate(() => curToy);
const held = await holdTab("sand", 800);
ok(held.hit, "the tab being held is reachable", JSON.stringify(held));
const afterHold = await page.evaluate(() => ({
  favs: S.favs.slice(), first: document.querySelector("#strip .tab").getAttribute("data-id"),
  open: curToy, starred: document.querySelector('#strip .tab[data-id="sand"]').classList.contains("fav")
}));
ok(afterHold.favs.includes("sand"), "holding a tab pins it", JSON.stringify(afterHold));
ok(afterHold.first === "sand", "a pinned toy moves to the front of the strip",
  JSON.stringify(afterHold));
ok(afterHold.starred, "the pinned tab is marked", JSON.stringify(afterHold));
ok(afterHold.open === openBefore,
  "holding to pin does NOT also switch to that toy", JSON.stringify({ was: openBefore, now: afterHold.open }));

// a short tap still just opens the toy — this is the one that catches a
// swallow flag left set by the hold
await page.evaluate(() => showToy("coon"));
await sleep(300);
const tapBox = await holdTab("sand", 60);   // a 60ms press is a tap, not a hold
ok(tapBox.hit, "the tab is reachable for a normal tap", JSON.stringify(tapBox));
const tapped = await page.evaluate(() => ({ open: curToy, favs: S.favs.slice() }));
ok(tapped.open === "sand", "a normal tap still opens the toy", JSON.stringify(tapped));
ok(tapped.favs.includes("sand"), "and a tap does not unpin it", JSON.stringify(tapped));

// cap at three, oldest drops
await page.evaluate(() => { S.favs = ["pop", "slime", "wrap"]; saveS(); orderStrip(); });
await holdTab("gear", 800);
const capped = await page.evaluate(() => S.favs.slice());
ok(capped.length === 3 && capped.includes("gear") && !capped.includes("pop"),
  "pinning a fourth drops the oldest", JSON.stringify(capped));

// unpin
await holdTab("gear", 800);
const unpinned = await page.evaluate(() => S.favs.slice());
ok(!unpinned.includes("gear"), "holding a pinned tab unpins it", JSON.stringify(unpinned));

// the rest of the strip keeps the catalogue order
const orderOK = await page.evaluate(() => {
  const ids = Array.from(document.querySelectorAll("#strip .tab")).map(t => t.dataset.id);
  const favCount = S.favs.length;
  const rest = ids.slice(favCount);
  const canon = TOYS.map(t => t.id).filter(i => S.favs.indexOf(i) < 0);
  return { same: JSON.stringify(rest) === JSON.stringify(canon), rest: rest.slice(0, 4) };
});
ok(orderOK.same, "unpinned toys keep the order they have always had",
  JSON.stringify(orderOK));

// and pins come back after a reload
await page.evaluate(() => { S.favs = ["sand", "slime"]; saveS(); });
await sleep(300);
const pageF = await newPage();
await pageF.goto(BASE, { waitUntil: "networkidle2" });
await realClick(pageF, "#intro");
await sleep(700);
const afterReload = await pageF.evaluate(() => ({
  favs: S.favs.slice(),
  order: Array.from(document.querySelectorAll("#strip .tab")).slice(0, 2).map(t => t.dataset.id)
}));
ok(JSON.stringify(afterReload.order) === JSON.stringify(["sand", "slime"]),
  "pinned toys are still at the front after a reload", JSON.stringify(afterReload));
await pageF.close();
await page.evaluate(() => { S.favs = []; saveS(); orderStrip(); });

/* ---------------- settings persist (the window.storage landmine) --------- */
console.log("[persistence]");
await page.evaluate(() => { S.theme = "paper"; S.grip = 0.83; saveS(); });
await sleep(200);
const stored = await page.evaluate(() => localStorage.getItem("bandit-set"));
ok(!!stored && stored.indexOf("paper") > 0, "settings written to localStorage",
  String(stored).slice(0, 60));

const page2 = await newPage();
await page2.goto(BASE, { waitUntil: "networkidle2" });
await realClick(page2, "#intro");
await sleep(600);
const restored = await page2.evaluate(() => ({
  theme: S.theme, grip: S.grip,
  domTheme: document.body.getAttribute("data-theme")
}));
ok(restored.theme === "paper" && Math.abs(restored.grip - 0.83) < 0.01,
  "settings survive a reload", JSON.stringify(restored));
ok(restored.domTheme === "paper", "restored theme is applied to the DOM",
  String(restored.domTheme));
await page2.close();

/* ---------------- the app never waits on audio ---------------- */
console.log("[audio blocked]");
const page3 = await newPage();
await page3.evaluateOnNewDocument(() => {
  // simulate a browser that refuses Web Audio outright
  window.AudioContext = undefined; window.webkitAudioContext = undefined;
});
await page3.goto(BASE, { waitUntil: "networkidle2" });
await realClick(page3, "#intro");
await sleep(500);
await realClick(page3, "#strip .tab", 2);
await sleep(300);
const blocked = await page3.evaluate(() => {
  const sec = document.querySelector(".toy.on");
  return { on: !!sec, id: sec && sec.id, audioOK: window.audioOK === true,
    kids: sec ? sec.querySelectorAll("*").length : 0 };
});
ok(blocked.on && blocked.kids > 3, "toys still render with Web Audio unavailable",
  JSON.stringify(blocked));
ok(page3.errors.length === 0, "no console errors with audio blocked",
  page3.errors.slice(0, 2).join(" | "));
await page3.close();

/* ---------------- framed: the portal handshake ---------------- */
console.log("[embed protocol]");
const host = await newPage();
/* Navigate to the app's origin FIRST, then replace the document. setContent
   keeps the current origin, so the iframe below is same-origin and we can
   both receive its postMessages and hit-test inside it. A host page on
   about:blank has an opaque origin and can do neither. */
await host.goto(BASE, { waitUntil: "domcontentloaded" });
await host.setContent("<!DOCTYPE html><body style='margin:0'></body>");
await host.evaluate(url => {
  window.__msgs = [];
  window.addEventListener("message", e => { if (e.data && e.data.sws) window.__msgs.push(e.data.sws); });
  const f = document.createElement("iframe");
  f.src = url; f.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0";
  document.body.appendChild(f);
}, BASE);
await sleep(2200);
const msgs = await host.evaluate(() => window.__msgs);
ok(msgs.includes("ready"), "posts {sws:'ready'} to the parent when framed",
  JSON.stringify(msgs));

const backShown = await host.evaluate(() => {
  const d = document.querySelector("iframe").contentDocument;
  if (!d) return "no-access";
  const b = d.getElementById("swsBack");
  return b ? getComputedStyle(b).display !== "none" : null;
});
ok(backShown === true, "back arrow is visible when framed", String(backShown));

/* Dismiss the splash inside the frame first — it covers the whole app until
   tapped, by design (the audio unlock gesture). Verified: without this the
   back arrow hit test correctly reports #intro on top. */
await host.mouse.move(W / 2, H / 2);
await host.mouse.down();
await host.mouse.up();
await sleep(800);

/* Drive the exit through the frame's own coordinate space: hit test at the
   button centre, then click whatever is actually there. */
/* the CHILD frame specifically — after setContent the host's own main frame
   still reports BASE as its url, so matching on url alone picks the wrong one */
const frame = host.mainFrame().childFrames()[0];
const hitInfo = frame ? await frame.evaluate(() => {
  const b = document.getElementById("swsBack");
  const r = b.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { hit: !!(top && (top === b || b.contains(top))),
           x: r.left + r.width / 2, y: r.top + r.height / 2 };
}) : null;
ok(hitInfo && hitInfo.hit === true, "back arrow is actually on top (hit test)",
  JSON.stringify(hitInfo));
if (hitInfo && hitInfo.hit) {
  await host.mouse.move(hitInfo.x, hitInfo.y);
  await host.mouse.down();
  await host.mouse.up();
}
await sleep(400);
const afterExit = await host.evaluate(() => window.__msgs);
ok(afterExit.includes("close"), "back arrow posts {sws:'close'}", JSON.stringify(afterExit));
await host.close();

/* ---------------- unframed: no dead-end button ---------------- */
const backHidden = await page.evaluate(() =>
  getComputedStyle(document.getElementById("swsBack")).display === "none");
ok(backHidden, "back arrow stays hidden when opened directly");

/* ---------------- screenshots for the LOOKING pass ---------------- */
console.log("[shots]");
const shots = [
  ["picker", async () => { await realClick(page, "#homeBtn"); await sleep(400); }],
  ["toy-coon", async () => { await page.evaluate(() => document.getElementById("home").classList.remove("on"));
                             await page.evaluate(() => showToy("coon")); await sleep(400); }],
  ["toy-pop", async () => { await page.evaluate(() => showToy("pop")); await sleep(400); }],
  ["toy-slime", async () => { await page.evaluate(() => showToy("slime")); await sleep(400); }],
  ["toy-seq", async () => { await page.evaluate(() => showToy("seq")); await sleep(400); }],
  ["theme-paper", async () => { await page.evaluate(() => { S.theme = "paper"; applyS(); }); await sleep(300); }],
  ["theme-mono", async () => { await page.evaluate(() => { S.theme = "mono"; applyS(); }); await sleep(300); }],
  ["theme-contrast", async () => { await page.evaluate(() => { S.theme = "contrast"; applyS(); }); await sleep(300); }],
  ["theme-night", async () => { await page.evaluate(() => { S.theme = "night"; applyS(); }); await sleep(300); }],
  ["toy-bln", async () => { await page.evaluate(() => showToy("bln")); await sleep(600); }],
  ["toy-bln-full", async () => {
      const b = await page.evaluate(() => {
        const r = document.getElementById("blnBody").getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await page.mouse.move(b.x, b.y); await page.mouse.down(); await sleep(2400);
    }],
  ["toy-bln-after", async () => { await page.mouse.up(); await sleep(700); }],
  ["favourites", async () => {
      await page.evaluate(() => { S.favs = ["sand", "slime", "pop"]; saveS(); orderStrip();
        document.getElementById("strip").scrollLeft = 0; showToy("coon"); });
      await sleep(500);
    }],
  ["settings", async () => { await realClick(page, "#gearBtn"); await sleep(450); }],
  ["big-mode", async () => { await page.evaluate(() => { document.getElementById("sheet").classList.remove("on"); });
                             await sleep(200); await page.evaluate(() => document.body.classList.add("big")); await sleep(400); }]
];
for (const [name, act] of shots) {
  try { await act(); await page.screenshot({ path: SHOTS + "/" + name + ".png" }); console.log("  shot " + name); }
  catch (e) { console.log("  shot " + name + " FAILED " + e.message); }
}

/* ---------------- console cleanliness on the main run ---------------- */
console.log("[console]");
ok(page.errors.length === 0, "no console errors during the full sweep",
  page.errors.slice(0, 3).join(" | "));

await page.close();
await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
console.log("shots in " + SHOTS);
process.exit(fail ? 1 : 0);
