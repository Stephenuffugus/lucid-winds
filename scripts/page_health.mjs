#!/usr/bin/env node
/* Does every page on this site actually parse and boot?

   Extracting <script> blocks with a regex and running them through vm is fast
   and it lies: a </script> inside a string literal truncates the block and the
   checker reports a syntax error in a file that is perfectly fine. That
   happened on stream-hop during this session, and a false alarm that says
   "your app is broken" is worse than no checker, because the next person
   learns to ignore it.

   So this asks the only authority that counts. It loads each page in a real
   browser and reports uncaught errors. Serve the repo root first:
     python3 -m http.server 8950
     node scripts/page_health.mjs            (the apps that matter)
     node scripts/page_health.mjs --all      (every satellite too)

   404s for optional assets are ignored on purpose: they are a deployment
   question, not a "does this page run" question. */
import puppeteer from "puppeteer";
import { readdirSync, existsSync } from "fs";

const BASE = process.env.LW_URL || "http://127.0.0.1:8950";
const ALL = process.argv.includes("--all");

const core = ["/portal/", "/padlab/", "/hush/", "/satellites/bandits-box/", "/play/", "/"];
let pages = core.slice();
if (ALL) {
  for (const d of readdirSync("satellites")) {
    if (existsSync("satellites/" + d + "/index.html")) pages.push("/satellites/" + d + "/");
  }
  pages = [...new Set(pages)];
}

let bad = 0, good = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

console.log("PAGE HEALTH  " + BASE + (ALL ? "  (every satellite)" : "  (core apps)"));

for (const path of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 });
  const errs = [];
  page.on("pageerror", e => errs.push("uncaught: " + e.message.split("\n")[0].slice(0, 110)));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/404|Failed to load resource|net::ERR/.test(t)) return;   // asset, not code
    errs.push("console: " + t.slice(0, 110));
  });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  let shape = {};
  try {
    /* domcontentloaded, then settle. networkidle2 never fires for a page that
       keeps streaming (a 3D game, a long poll), and waiting on it reports a
       perfectly healthy app as a timeout. slice-3d loads in about a second and
       was flagged dead by exactly that. */
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000);
    shape = await page.evaluate(() => ({
      title: (document.title || "").slice(0, 34),
      // did anything actually get built, or is this a white page with a <body>?
      painted: document.body.innerText.trim().length > 0 ||
               !!document.querySelector("canvas, svg, img, input, button")
    }));
  } catch (e) { errs.push("load: " + e.message.slice(0, 90)); }

  const okNow = errs.length === 0 && shape.painted;
  if (okNow) { good++; console.log("  ok   " + (path + "                                   ").slice(0, 35) + (shape.title || "")); }
  else {
    bad++;
    console.log("  RED  " + (path + "                                   ").slice(0, 35) +
      (shape.painted === false ? "[nothing painted] " : "") + (errs[0] || ""));
    errs.slice(1, 3).forEach(e => console.log("       " + e));
  }
  await page.close();
}

await browser.close();
console.log("\n" + good + " healthy, " + bad + " to look at");
process.exit(bad ? 1 : 0);
