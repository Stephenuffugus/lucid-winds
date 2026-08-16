#!/usr/bin/env node
/* Can a visitor actually FIND everything in the studio?

   The arcade's category tabs used to filter the 67 in-repo games and silently
   drop all 113 satellites, so every flagship was reachable only by scrolling
   the whole A-Z or knowing its name. This drives the real tab row and asserts
   that every game turns up somewhere other than All.

     python3 -m http.server 8950     (repo root)
     node scripts/portal_navigation.mjs */
import puppeteer from "puppeteer";

const BASE = process.env.LW_URL || "http://127.0.0.1:8950";
let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915 });
const errs = [];
page.on("pageerror", e => errs.push(e.message.slice(0, 120)));
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
await page.goto(BASE + "/portal/", { waitUntil: "domcontentloaded" });
await sleep(2500);

console.log("PORTAL NAVIGATION  " + BASE);

/* ---------- the catalogue ---------- */
const cat = await page.evaluate(() => ({
  sats: FEATURED.filter(g => !g.hub).length,
  games: GAMES.length,
  tagged: FEATURED.filter(g => !g.hub && g.cat).length,
  tabs: [...document.querySelectorAll("#tabs button")].map(b => b.dataset.c)
}));
ok(cat.tagged === cat.sats, "every satellite carries a category",
  cat.tagged + " of " + cat.sats);
console.log("  (" + (cat.sats + cat.games) + " games, " + cat.tabs.length + " tabs)");

/* ---------- click every tab like a visitor, count what appears ---------- */
async function clickTab(c) {
  const box = await page.evaluate(key => {
    const b = [...document.querySelectorAll("#tabs button")].find(x => x.dataset.c === key);
    if (!b) return null;
    b.scrollIntoView({ block: "center", inline: "center" });
    const r = b.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2,
             hit: !!(top && (top === b || b.contains(top))) };
  }, c);
  if (!box) return null;
  if (box.hit) { await page.mouse.move(box.x, box.y); await page.mouse.down(); await page.mouse.up(); }
  await sleep(500);
  return Object.assign(box, await page.evaluate(() => ({
    shown: document.querySelectorAll("#garden .card").length,
    names: [...document.querySelectorAll("#garden .card .nm")].map(n => n.textContent)
  })));
}

console.log("[every tab shows something]");
const seen = new Set();
const perTab = {};
for (const c of cat.tabs) {
  if (c === "fav") continue;                       // empty until a player hearts something
  const r = await clickTab(c);
  ok(r && r.hit, "tab " + c + " is clickable where it appears", JSON.stringify(r && { hit: r.hit }));
  perTab[c] = r ? r.shown : 0;
  if (r) r.names.forEach(n => { if (c !== "all") seen.add(n); });
  if (c !== "all" && c !== "indev" && c !== "new") {
    ok(r && r.shown > 0, "tab " + c + " is not empty", (r ? r.shown : 0) + " cards");
  }
}
console.log("  per tab: " + JSON.stringify(perTab));

/* ---------- the point: nothing is stranded in All ---------- */
console.log("[nothing is only reachable by scrolling everything]");
const all = await clickTab("all");
const stranded = all.names.filter(n => !seen.has(n));
ok(stranded.length === 0,
  "every game appears under a tab other than All",
  stranded.length + " stranded" + (stranded.length ? ": " + stranded.slice(0, 8).join(", ") : ""));

/* the flagships specifically, since they are what the complaint was about */
const FLAG = ["Jumping Jimothy", "Dewball", "Aura Farm", "Litter Bug", "The Attic",
              "Abduct a Chameleon", "Flock the World", "Bandit's Box", "Whack Box", "LOAF"];
const missingFlags = FLAG.filter(f => all.names.includes(f) && !seen.has(f));
ok(missingFlags.length === 0, "the flagships are all reachable by category",
  JSON.stringify(missingFlags));

/* ---------- search still works ---------- */
console.log("[search]");
const searched = await page.evaluate(async () => {
  const i = document.getElementById("gsearch");
  i.value = "raccoon"; i.dispatchEvent(new Event("input", { bubbles: true }));
  await new Promise(r => setTimeout(r, 500));
  return [...document.querySelectorAll("#garden .card .nm")].map(n => n.textContent).slice(0, 5);
});
ok(searched.length > 0, "search by a word from a description still finds games",
  JSON.stringify(searched));

ok(errs.length === 0, "no page errors", errs.slice(0, 2).join(" | "));
await browser.close();
console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
