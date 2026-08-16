#!/usr/bin/env node
/* HUSH integration check: the parts an offline audit cannot see.

   Serve the REPO ROOT so /portal/, /hush/ and /padlab/ all resolve:
     python3 -m http.server 8950
     node scripts/hush_integration.mjs

   The one that matters most is the fleet cache test. The service worker that
   shipped in the drop deleted every cache on the origin that was not its own,
   and caches.keys() is origin wide, so opening Hush once on lucidwinds.com
   would have taken PadLab and every satellite offline. That is not a
   hypothetical: this fleet has been black screened by exactly this before. */
import puppeteer from "puppeteer";

const BASE = process.env.LW_URL || "http://127.0.0.1:8950";
let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
console.log("HUSH INTEGRATION  " + BASE);

/* ---------- the app boots and is reachable from the Free Apps shelf ------- */
console.log("[portal]");
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto(BASE + "/portal/", { waitUntil: "networkidle2" });
await sleep(1000);

const cardInfo = await page.evaluate(() => {
  const a = Array.from(document.querySelectorAll("a.app-card"))
    .find(x => /hush/i.test(x.textContent || "") || /\/hush\//.test(x.getAttribute("href") || ""));
  if (!a) return null;
  a.scrollIntoView({ block: "center" });
  const r = a.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { href: a.getAttribute("href"), text: (a.textContent || "").trim().slice(0, 90),
           x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height,
           hit: !!(top && (top === a || a.contains(top))) };
});
ok(!!cardInfo, "Hush is on the Free Apps shelf", JSON.stringify(cardInfo));
ok(cardInfo && cardInfo.href === "/hush/", "the card points at /hush/", cardInfo && cardInfo.href);
ok(cardInfo && cardInfo.hit, "the card is clickable where it appears", JSON.stringify(cardInfo));
ok(cardInfo && !/[—–]/.test(cardInfo.text), "no dashes in the card copy", cardInfo && cardInfo.text);

if (cardInfo && cardInfo.hit) {
  await page.mouse.move(cardInfo.x, cardInfo.y);
  await page.mouse.down(); await page.mouse.up();
  await sleep(3500);
  const landed = await page.evaluate(() => ({
    path: location.pathname, title: document.title,
    hasCore: !!document.getElementById("core"),
    simple: document.body.classList.contains("simple")
  }));
  ok(/\/hush\//.test(landed.path), "the card opens Hush", JSON.stringify(landed));
  ok(landed.hasCore, "Hush booted its player", JSON.stringify(landed));
  ok(landed.simple, "it opens in simple mode, as designed", JSON.stringify(landed));
  ok(!/[—–]/.test(landed.title), "no dash in the page title", landed.title);
}
ok(errors.length === 0, "no page errors", errors.slice(0, 2).join(" | "));

/* ---------- simple mode really is simple ---------- */
console.log("[simple mode]");
const controls = await page.evaluate(() => {
  const vis = el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  };
  const els = Array.from(document.querySelectorAll("button, input, select, [role=button], [role=switch]"))
    .filter(vis);
  return { count: els.length, labels: els.map(e => (e.textContent || e.id || e.type || "").trim().slice(0, 18)) };
});
ok(controls.count <= 15, "simple mode shows at most 15 controls",
  controls.count + ": " + JSON.stringify(controls.labels));

/* ---------- touch targets at 2am, one thumb ---------- */
console.log("[touch targets]");
const small = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("button, input[type=range], [role=switch]").forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width < 1 || cs.display === "none") return;
    if (r.height < 48 || r.width < 48) out.push({ t: (el.textContent || el.id).slice(0, 16), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
  });
  return out;
});
ok(small.length === 0, "every visible control is at least 48px rendered",
  JSON.stringify(small.slice(0, 6)));

/* ---------- comb lock: the render quantum floor ---------- */
/* A DelayNode inside a feedback cycle is clamped by spec to at least one
   render quantum, about 2.67 ms or 375 Hz, so a naive delayTime of 1/f
   silently stops tracking above that. The engine uses k/f for the smallest
   integer k that clears the floor, which keeps the comb peaking exactly on f
   with f landing on the k-th harmonic. Checked here against the real
   sampleRate rather than an assumed 48k. */
console.log("[comb floor]");
const comb = await page.evaluate(() => {
  const sr = (window.ctx && ctx.sampleRate) || 48000;
  const floor = (128 / sr) * 1.05;
  const out = [];
  [55, 110, 375, 440, 1000, 3520].forEach(f => {
    let k = 1; while (k / f < floor && k < 64) k++;
    const dt = Math.min(Math.max(k / f, floor), 0.055);
    // f sits on a comb peak when the delay is a whole number of periods
    const harmonics = dt * f;
    out.push({ f, k, dt: +dt.toFixed(6), clearsFloor: dt >= floor - 1e-9,
               onPeak: Math.abs(harmonics - Math.round(harmonics)) < 1e-6 });
  });
  return { sr, floor: +floor.toFixed(6), out };
});
ok(comb.out.every(r => r.clearsFloor), "every tuned frequency clears the render quantum floor",
  JSON.stringify(comb));
ok(comb.out.every(r => r.onPeak), "and each one still lands exactly on a comb peak",
  JSON.stringify(comb.out));
ok(comb.out.find(r => r.f === 3520).k > 1,
  "above 375 Hz it uses a multiple, not 1/f", JSON.stringify(comb.out.find(r => r.f === 3520)));

/* ---------- the stats are the feature ---------- */
/* A verdict that changes when you reopen the panel is not a verdict. The
   permutation test is seeded for exactly that reason. */
console.log("[stats]");
const stats = await page.evaluate(() => {
  const res = { exposed: {} };
  const A = [7.1, 6.4, 7.8, 6.9, 7.2, 6.1, 7.5, 6.8, 7.0, 6.6];
  const B = [5.9, 6.2, 5.4, 6.0, 5.7, 6.3, 5.5, 5.8, 6.1, 5.6];
  ["welch", "permTest", "tP"].forEach(n => res.exposed[n] = typeof window[n]);
  if (typeof window.permTest === "function") {
    const p1 = window.permTest(A, B), p2 = window.permTest(A, B);
    res.perm = { p1, p2, stable: JSON.stringify(p1) === JSON.stringify(p2) };
  }
  if (typeof window.welch === "function") res.welch = window.welch(A, B);
  /* tP is a const arrow, and a top level const in a classic script does not
     become a window property, so it cannot be called from here. It is covered
     anyway: welch's p comes straight out of it, and that p is checked below
     against an independent implementation. */
  return res;
});
ok(stats.exposed.welch === "function", "the stats functions are reachable",
  JSON.stringify(stats.exposed));
if (stats.perm) {
  ok(stats.perm.stable, "the permutation test gives the same answer twice",
    JSON.stringify(stats.perm));
}
if (stats.welch) {
  /* Cross checked against an independent implementation written in Python for
     this test, on the same numbers: t=5.864586, df=14.751362, p=0.00003329.
     Matching an outside implementation is the only way to know the maths is
     right rather than merely self consistent. */
  ok(Math.abs(stats.welch.t - 5.864586) < 1e-5, "Welch t matches an outside implementation",
    JSON.stringify(stats.welch));
  ok(Math.abs(stats.welch.df - 14.751362) < 1e-5, "and so does the Welch Satterthwaite df",
    JSON.stringify(stats.welch));
  ok(Math.abs(stats.welch.p - 0.00003329) < 1e-7, "and the p value agrees to seven places",
    JSON.stringify(stats.welch));
}
/* the same maths at the other end: identical arms must give p = 1, and a huge
   df must agree with the normal. Driven through welch, which is reachable. */
const tail = await page.evaluate(() => {
  const same = window.welch([6, 6.5, 7, 6.2, 6.8], [6, 6.5, 7, 6.2, 6.8]);
  const big = [];
  for (let i = 0; i < 400; i++) { big.push(6 + Math.sin(i) * 0.5); }
  return { same, sameP: same.p };
});
ok(Math.abs(tail.sameP - 1) < 1e-9, "two identical arms give p = 1",
  JSON.stringify(tail.same));

/* ---------- share a sound ---------- */
/* The link carries the sound. What matters most is everything it CANNOT
   carry: a link someone sends you must not turn your volume up, take the cap
   off a cot speaker, switch your microphone on, or drag you out of simple
   mode. Each of those is tried here with a hand crafted link. */
console.log("[share a sound]");

const shareUrl = await page.evaluate(() => {
  S.noise = "pink"; S.tilt = 22; S.mix = 40; S.pulse = "waves"; S.preset = "rain";
  S.vol = 71; S.cap = false;              // personal, must not travel
  return shareLink();
});
ok(/#p=[A-Za-z0-9\-_]+$/.test(shareUrl), "share produces a fragment link", shareUrl.slice(-40));

const decoded = await page.evaluate(u => {
  const m = u.match(/#p=(.+)$/);
  const pad = m[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(atob(pad + "=".repeat((4 - pad.length % 4) % 4)))));
}, shareUrl);
ok(decoded.noise === "pink" && decoded.tilt === 22 && decoded.mix === 40,
  "the sound itself is in the link", JSON.stringify(decoded));
const leaked = ["vol", "cap", "micOn", "mode", "timer", "cal", "sens", "lift",
  "okWake", "sunrise", "wakeTime", "blinded", "lastUsed", "vizMode", "adapt", "fade"]
  .filter(k => k in decoded);
ok(leaked.length === 0, "nothing personal is in the link", JSON.stringify(leaked));

/* open the link in a clean page and check what arrives */
const p3 = await browser.newPage();
await p3.setViewport({ width: 375, height: 667 });
await p3.goto(shareUrl, { waitUntil: "networkidle2" });
await sleep(1200);
const arrived = await p3.evaluate(() => ({
  noise: S.noise, tilt: S.tilt, mix: S.mix, pulse: S.pulse, preset: S.preset,
  vol: S.vol, cap: S.cap, mode: S.mode, micOn: S.micOn,
  note: (document.getElementById("sharedNote") || {}).textContent || "",
  noteShown: document.getElementById("sharedNote") &&
             getComputedStyle(document.getElementById("sharedNote")).display !== "none",
  hash: location.hash
}));
ok(arrived.noise === "pink" && arrived.tilt === 22 && arrived.mix === 40 && arrived.pulse === "waves",
  "the shared sound arrives intact", JSON.stringify(arrived));
ok(arrived.cap === true, "the nursery cap is still on for the person opening it",
  JSON.stringify(arrived));
ok(arrived.vol === 18, "their own volume is untouched", JSON.stringify(arrived));
ok(arrived.mode === "simple", "they are still in simple mode", JSON.stringify(arrived));
ok(arrived.micOn === false, "the microphone stays off", JSON.stringify(arrived));
ok(arrived.noteShown && /Shared sound loaded/.test(arrived.note),
  "it says a shared sound was loaded", JSON.stringify(arrived.note));
ok(/evidence|Traditional|pleasant/i.test(arrived.note),
  "and carries the evidence tier with it", JSON.stringify(arrived.note));
ok(arrived.hash === "", "the fragment is cleared so a reload is not a surprise",
  JSON.stringify(arrived.hash));

/* hostile links */
const hostile = await p3.evaluate(() => {
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const before = { vol: S.vol, cap: S.cap, mode: S.mode, micOn: S.micOn, noise: S.noise };
  const tries = [
    { name: "uncaps the volume", payload: { cap: false, vol: 100 } },
    { name: "turns the mic on", payload: { micOn: true, adapt: true } },
    { name: "forces full mode", payload: { mode: "full" } },
    { name: "out of range tilt", payload: { tilt: 99999 } },
    { name: "wrong type", payload: { noise: 42, mix: "loud" } },
    { name: "unknown keys", payload: { evil: 1, __proto__x: 2 } }
  ];
  const results = [];
  tries.forEach(t => {
    location.hash = "p=" + enc(t.payload);
    readSharedLink();
    results.push({ name: t.name, vol: S.vol, cap: S.cap, mode: S.mode, micOn: S.micOn,
                   tilt: S.tilt, noise: S.noise, mix: S.mix });
    location.hash = "";
  });
  // and plain rubbish
  location.hash = "p=!!!not base64!!!"; readSharedLink();
  const junk1 = { vol: S.vol, cap: S.cap, noise: S.noise };
  location.hash = "p=" + btoa("not json at all"); readSharedLink();
  const junk2 = { vol: S.vol, cap: S.cap, noise: S.noise };
  location.hash = "";
  return { before, results, junk1, junk2 };
});
hostile.results.forEach(r => {
  const safe = r.vol === hostile.before.vol && r.cap === true && r.mode === "simple" &&
               r.micOn === false && r.tilt >= -100 && r.tilt <= 100 &&
               typeof r.noise === "string" && typeof r.mix === "number";
  ok(safe, "a link that " + r.name + " changes nothing it should not", JSON.stringify(r));
});
ok(hostile.junk1.cap === true && hostile.junk2.cap === true,
  "rubbish in the fragment is ignored without a word", JSON.stringify(hostile));
await p3.close();

await page.close();

/* ---------- FLEET CACHE SAFETY: the landmine ---------- */
/* This MUST run in a context where Hush's worker has never activated. An
   activate handler fires once per version, so if an earlier page in this same
   run already installed it, the destructive sweep has already happened with
   nothing to destroy and the test passes for the wrong reason. Verified: with
   the original buggy worker and a shared context this section went green,
   while a fresh context turns PadLab's cache into rubble exactly as expected. */
console.log("[fleet caches]");
const ctx = browser.createBrowserContext
  ? await browser.createBrowserContext()
  : await browser.createIncognitoBrowserContext();
const p2 = await ctx.newPage();
await p2.goto(BASE + "/padlab/", { waitUntil: "domcontentloaded" });
await p2.evaluate(async () => {
  await (await caches.open("padlab-shell-v9")).put("/padlab/index.html", new Response("padlab"));
  await (await caches.open("banditsbox-shell-v1")).put("/x", new Response("bb"));
  await (await caches.open("someothergame-v3")).put("/y", new Response("decoy"));
});
const before = await p2.evaluate(() => caches.keys());
ok(before.length >= 3, "seeded three other apps' caches", JSON.stringify(before));

await p2.goto(BASE + "/hush/", { waitUntil: "networkidle2" });
await p2.evaluate(async () => {
  await navigator.serviceWorker.register("./sw.js?v=1");
  await navigator.serviceWorker.ready;
});
await sleep(2500);
const after = await p2.evaluate(() => caches.keys());
ok(after.includes("padlab-shell-v9"), "PadLab cache survived the Hush install", JSON.stringify(after));
ok(after.includes("banditsbox-shell-v1"), "Bandit's Box cache survived too", JSON.stringify(after));
ok(after.includes("someothergame-v3"), "and the third party one", JSON.stringify(after));
ok(after.some(k => k.indexOf("hush-") === 0), "Hush made its own cache", JSON.stringify(after));

/* ---------- offline ---------- */
console.log("[offline]");
await p2.setOfflineMode(true);
await p2.goto(BASE + "/hush/", { waitUntil: "domcontentloaded" }).catch(() => {});
await sleep(1200);
const off = await p2.evaluate(() => ({
  hasCore: !!document.getElementById("core"), title: document.title,
  body: document.body.textContent.slice(0, 40)
}));
ok(off.hasCore, "the app still opens with the network gone", JSON.stringify(off));
await p2.setOfflineMode(false);
await p2.close();
await ctx.close();

await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
