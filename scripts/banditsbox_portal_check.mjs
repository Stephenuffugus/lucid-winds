#!/usr/bin/env node
/* Portal integration + fleet-cache safety for Bandit's Box.
   Serve the REPO ROOT (so /portal/, /satellites/ and /padlab/ all resolve):
     python3 -m http.server 8950
     node scripts/banditsbox_portal_check.mjs

   HOW THE PORTAL ACTUALLY ROUTES (read from the delegated click handler on
   2026-08-16, correcting the planning note that said otherwise):
     /play/<id>.html            -> framed, srcdoc shell
     https://stephenuffugus...  -> framed, iframe src
     anything else, /satellites/<id>/ included -> falls through and NAVIGATES
                                  TOP LEVEL. No iframe, no recovery timer.
   So Bandit's Box is a top-level navigation, and its exit affordance has to
   work off the referrer rather than a parent frame. The embed protocol block
   still ships because it costs nothing and is correct if the routing ever
   changes.

   Also: beta:true renders data-indev="1", which puts the card behind the
   tester dev gate. Unlocked here with the same key the app itself uses.

   Two things are proved that a unit test cannot:
   1. The card really opens the app from the arcade, and the way back works.
   2. Installing Bandit's Box service worker does NOT wipe other caches on the
      origin. caches.keys() is origin-wide; one bad activate handler takes the
      whole fleet offline. */
import puppeteer from "puppeteer";

const BASE = process.env.LW_URL || "http://127.0.0.1:8950";
let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

console.log("PORTAL CHECK  " + BASE);

/* ---------- 1. the card is on the grid and opens framed ---------- */
console.log("[portal card]");
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
// beta cards are behind the tester gate; unlock it the way a tester does
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
await page.goto(BASE + "/portal/", { waitUntil: "networkidle2" });
await sleep(1200);

const card = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll("*")).filter(e =>
    e.children.length === 0 && /Bandit/i.test(e.textContent || ""));
  if (!els.length) return null;
  let el = els[0];
  // climb to the clickable card
  let hop = 0;
  while (el && hop++ < 6 && !(el.onclick || el.tagName === "A" || el.tagName === "BUTTON" ||
        (el.className && String(el.className).indexOf("card") >= 0))) el = el.parentElement;
  if (!el) return null;
  el.scrollIntoView({ block: "center" });
  const r = el.getBoundingClientRect();
  return { text: (el.textContent || "").trim().slice(0, 70), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
});
ok(!!card, "Bandit's Box card is on the arcade grid", JSON.stringify(card));

if (card) {
  await sleep(400);
  const fresh = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("*")).filter(e =>
      e.children.length === 0 && /Bandit/i.test(e.textContent || ""));
    let el = els[0], hop = 0;
    while (el && hop++ < 6 && !(el.onclick || el.tagName === "A" || el.tagName === "BUTTON" ||
          (el.className && String(el.className).indexOf("card") >= 0))) el = el.parentElement;
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2,
             hit: !!(top && (top === el || el.contains(top) || top.contains(el))) };
  });
  ok(fresh.hit, "card is actually clickable where it appears", JSON.stringify(fresh));
  await page.mouse.move(fresh.x, fresh.y);
  await page.mouse.down(); await page.mouse.up();
  // top-level navigation: give it time to land and settle
  await sleep(4000);

  const landed = await page.evaluate(() => ({
    url: location.pathname + location.search,
    title: document.title,
    toys: document.querySelectorAll("#strip .tab").length,
    referrer: document.referrer,
    back: !!document.getElementById("swsBack") &&
          getComputedStyle(document.getElementById("swsBack")).display !== "none"
  }));
  ok(/\/satellites\/bandits-box\//.test(landed.url),
    "card navigates to Bandit's Box", JSON.stringify(landed));
  ok(/\?v=/.test(landed.url), "the versioned url is what the card opened",
    landed.url);
  ok(landed.toys === 21, "the app booted with all 21 toys", JSON.stringify(landed));
  ok(landed.back === true, "back arrow shows because we came from the portal",
    JSON.stringify(landed));

  // through the splash first — it covers the app until tapped, by design
  await page.mouse.move(187, 400);
  await page.mouse.down(); await page.mouse.up();
  await sleep(900);

  // and the way back actually returns to the arcade
  const backHit = await page.evaluate(() => {
    const b = document.getElementById("swsBack");
    const r = b.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { hit: !!(top && (top === b || b.contains(top))), x: r.left + r.width / 2, y: r.top + r.height / 2,
             covering: top ? (top.id || top.tagName) : null };
  });
  if (backHit.hit) {
    await page.mouse.move(backHit.x, backHit.y);
    await page.mouse.down(); await page.mouse.up();
    await sleep(2500);
  }
  const returned = await page.evaluate(() => location.pathname);
  ok(/\/portal\//.test(returned), "back arrow returns to the arcade",
    returned + " (hit=" + JSON.stringify(backHit) + ")");
}
ok(errors.length === 0, "no page errors on the portal", errors.slice(0, 2).join(" | "));
await page.close();

/* ---------- 2. fleet cache safety ---------- */
console.log("[fleet caches]");
const p2 = await browser.newPage();
// prime a PadLab-owned cache, plus a decoy from a third app
await p2.goto(BASE + "/padlab/", { waitUntil: "domcontentloaded" });
await p2.evaluate(async () => {
  const a = await caches.open("padlab-shell-v9");
  await a.put("/padlab/index.html", new Response("padlab shell"));
  const b = await caches.open("someothergame-v3");
  await b.put("/x", new Response("decoy"));
});
const before = await p2.evaluate(() => caches.keys());
ok(before.includes("padlab-shell-v9") && before.includes("someothergame-v3"),
  "seeded other apps' caches", JSON.stringify(before));

// now install Bandit's Box worker and let it activate
await p2.goto(BASE + "/satellites/bandits-box/", { waitUntil: "networkidle2" });
await p2.evaluate(async () => {
  const reg = await navigator.serviceWorker.register("./sw.js?v=1");
  await navigator.serviceWorker.ready;
  return reg.active ? "active" : "pending";
});
await sleep(2500);
const after = await p2.evaluate(() => caches.keys());
ok(after.includes("padlab-shell-v9"), "PadLab cache survived Bandit's Box install",
  JSON.stringify(after));
ok(after.includes("someothergame-v3"), "third-party cache survived too",
  JSON.stringify(after));
ok(after.some(k => k.indexOf("banditsbox-") === 0), "Bandit's Box made its own cache",
  JSON.stringify(after));
await p2.close();

await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
