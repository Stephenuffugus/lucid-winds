/* GATE P5b / P6 — real pages, real browser. Each game boots TWICE from a clean
   profile: once with ?nomusic=1 (the baseline, LAW 11) and once live, with
   request interception serving the FIXTURE catalog at /music-catalog.js so
   nothing in the repo has to be live for the test. Asserts, per game: the
   expected shelf's first track is in the ledger by id; a toast appeared and
   then left; the only element the module added to <body> is that toast; and
   the live run produced ZERO console errors the baseline did not.
     node test/music/inject.mjs                       six natives: 3 board + 3 card, picked from the catalog
     node test/music/inject.mjs --sat deepwell,tarot-run
     node test/music/inject.mjs --play chess,cribbage
   Exit 1 on any failure. Needs the static server on 127.0.0.1:8777. */
import { readFileSync } from "fs";
import { runInNewContext } from "vm";
import puppeteer from "puppeteer";
import { catalog } from "../../scripts/catalog.mjs";

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1].split(",").filter(Boolean) : null; };
const CATSRC = readFileSync("/tmp/music-fixture/music-catalog.js", "utf8");
const win = {}; runInNewContext(CATSRC, { window: win }); const CAT = win.LW_MUSIC_CATALOG;
const cat = catalog();
const shelfFor = (id) => CAT.shelves.find(s => s.games.includes(id)) || null;

let games = [];
if (arg("--sat")) games.push(...arg("--sat").map(s => ({ id: s, url: "/satellites/" + s + "/", kind: "sat" })));
if (arg("--play")) games.push(...arg("--play").map(s => ({ id: s, url: "/play/" + s + ".html", kind: "play" })));
if (!games.length) {
  const pick = (c) => cat.nat.filter(g => g.cat === c && shelfFor(g.id)).slice(0, 3).map(g => ({ id: g.id, url: "/play/" + g.id + ".html", kind: "play" }));
  games = [...pick("board"), ...pick("card")];
}
const BASE = "http://127.0.0.1:8777";
try { await fetch(BASE + "/music-tracks.js"); } catch { console.error("static server not answering on 8777"); process.exit(2); }

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"] });
let pass = 0, fail = 0;
const t = (n, ok, d) => { if (ok) { pass++; console.log("  ok    " + n); } else { fail++; console.log("  FAIL  " + n + (d ? "   <- " + d : "")); } };

async function run(g, live) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  /* /play/sw.js calls clients.claim() on activate and takes over the page mid-load; from then on the page's fetches
     are made BY THE WORKER and request interception never sees them, so the fixture catalog was not served and
     the real server 404ed. Chess only passed because its catalog fetch beat the worker's activation. Bypass the
     worker for the test; the worker itself is gated separately in test/music/sw.mjs. (LAW 3: owner = the harness) */
  await page.setBypassServiceWorker(true);
  await page.setViewport({ width: 375, height: 667 });
  const errors = new Set();
  page.on("pageerror", e => errors.add("pageerror: " + String(e.message || e).split("\n")[0]));
  page.on("console", m => { if (m.type() === "error") errors.add("console: " + m.text().split("\n")[0]); });
  await page.setRequestInterception(true);
  page.on("request", r => { if (/\/music-catalog\.js(\?|$)/.test(r.url())) r.respond({ status: 200, contentType: "application/javascript", body: CATSRC }); else r.continue(); });
  const url = BASE + g.url + (live ? "" : (g.url.includes("?") ? "&" : "?") + "nomusic=1");
  try { await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 }); } catch (e) { errors.add("goto: " + e.message.split("\n")[0]); }
  await new Promise(r => setTimeout(r, 900));
  const pre = await page.evaluate(() => !!document.getElementById("sws-music-toast"));
  await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));   // the toast waits for a first tap
  await new Promise(r => setTimeout(r, 120));
  const early = await page.evaluate(() => ({ toast: !!document.getElementById("sws-music-toast"), ids: [...document.body.children].map(c => c.id || c.tagName) }));
  early.pre = pre;
  await new Promise(r => setTimeout(r, 3300));
  const late = await page.evaluate(() => ({
    toast: !!document.getElementById("sws-music-toast"),
    ids: [...document.body.children].map(c => c.id || c.tagName),
    ledger: (() => { try { return JSON.parse(localStorage.getItem("sws_game_unlocks") || "[]"); } catch { return []; } })(),
    loaded: !!window.SWSMusic,
  }));
  await ctx.close();
  return { errors, early, late };
}

for (const g of games) {
  const shelf = shelfFor(g.id);
  const A = await run(g, false), B = await run(g, true);
  const newErr = [...B.errors].filter(e => !A.errors.has(e));
  const label = g.kind + ":" + g.id;
  t(label + "  module loaded", B.late.loaded, "window.SWSMusic absent");
  if (shelf) {
    t(label + "  ledger has " + shelf.tracks[0].id, B.late.ledger.some(e => e.id === shelf.tracks[0].id), "ledger=" + JSON.stringify(B.late.ledger.map(e => e.id)));
    t(label + "  no toast before the first tap", !B.early.pre);
    t(label + "  toast appeared after the first tap", B.early.toast);
    t(label + "  toast gone by ~4s", !B.late.toast);
  } else {
    t(label + "  no shelf in fixture: ledger empty, no toast", B.late.ledger.length === 0 && !B.early.toast);
  }
  const added = B.late.ids.filter(x => !A.late.ids.includes(x));
  t(label + "  body gained nothing but the toast", added.every(x => x === "sws-music-toast"), "added=" + JSON.stringify(added));
  t(label + "  zero NEW console errors vs baseline", newErr.length === 0, newErr.slice(0, 2).join(" | "));
  t(label + "  baseline (?nomusic=1) wrote no ledger", A.late.ledger.length === 0);
}
await browser.close();
console.log("\ninject gate: " + pass + " ok, " + fail + " failed  (" + games.length + " games x 2 boots)"); process.exit(fail ? 1 : 0);
