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
