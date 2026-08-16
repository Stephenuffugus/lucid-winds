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

/* ---------- the shelves ---------- */
/* A storefront rather than a wall: curated rows first, the full A-Z last. */
console.log("[shelves]");
const shelves = await page.evaluate(() => {
  const out = [...document.querySelectorAll(".shelf")].map(s => ({
    title: s.querySelector(".shelf-h").firstChild.textContent.trim(),
    cards: s.querySelectorAll(".card").length,
    inDev: !!s.querySelector(".badge.beta"),
    chips: s.querySelectorAll(".kind").length
  }));
  return out;
});
ok(shelves.length >= 8, "the page opens on shelves, not a wall", shelves.length + " shelves");
ok(shelves[0].title.toLowerCase().includes("start"), "the first shelf tells you where to start",
  shelves[0].title);
const nw = shelves.find(s => /^new$/i.test(s.title));
ok(nw && !nw.inDev, "New holds shipped games, not works in progress",
  JSON.stringify(nw));
const catShelf = shelves.find(s => /action/i.test(s.title));
ok(catShelf && catShelf.chips === 0,
  "a category shelf does not repeat its own name on every tile", JSON.stringify(catShelf));
ok(shelves[0].chips > 0, "a mixed shelf does still label its tiles", JSON.stringify(shelves[0]));

/* a shelf shows one game per series: five Super Slice tiles in a row read as
   a rendering fault rather than a catalogue */
const dupes = await page.evaluate(() => {
  const bad = [];
  document.querySelectorAll(".shelf").forEach(s => {
    const fams = {};
    [...s.querySelectorAll(".nm")].forEach(n => {
      const f = n.textContent.split(" ").slice(0, 2).join(" ").toLowerCase();
      fams[f] = (fams[f] || 0) + 1;
    });
    Object.keys(fams).forEach(f => { if (fams[f] > 1)
      bad.push(s.querySelector(".shelf-h").firstChild.textContent.trim() + ": " + f + " x" + fams[f]); });
  });
  return bad;
});
ok(dupes.length === 0, "no shelf shows the same series twice", JSON.stringify(dupes));
const wallHasAll = await page.evaluate(() =>
  [...document.querySelectorAll("#garden .nm")].filter(n => /^Super Slice/.test(n.textContent)).length);
ok(wallHasAll === 5, "but the full list still has every one of them", String(wallHasAll));

/* every control on a card has to stay reachable: the chip landed on top of the
   info button the first time and made it unclickable */
const corners = await page.evaluate(() => {
  const c = document.querySelector(".shelf .card");
  c.scrollIntoView({ block: "center" });
  const hit = el => { if (!el) return null;
    const r = el.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!(t && (t === el || el.contains(t))); };
  return { info: hit(c.querySelector(".info-btn")), fav: hit(c.querySelector(".fav-btn")),
           kind: hit(c.querySelector(".kind")) };
});
ok(corners.info !== false && corners.fav !== false && corners.kind !== false,
  "nothing on a card is covering anything else", JSON.stringify(corners));

/* See all jumps to the wall with the tab chosen */
const jumped = await page.evaluate(async () => {
  const b = document.querySelector('.shelf [data-jump="puzzle"]');
  if (!b) return null;
  b.click();
  await new Promise(r => setTimeout(r, 700));
  const on = document.querySelector("#tabs button.on");
  return { tab: on && on.dataset.c, shown: document.querySelectorAll("#garden .card").length };
});
ok(jumped && jumped.tab === "puzzle", "See all switches the wall to that category",
  JSON.stringify(jumped));

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
