#!/usr/bin/env node
/* DOES A CORRUPT SAVE BRICK A GAME?
     node scripts/corrupt_save_probe.mjs <slug> [<slug>...]

   Standing defect class 3 says a try/catch around JSON.parse is not validation:
   anything that merely parses is truthy, so the crash happens later, often
   silently inside a click handler. That is exactly what killed Shell Shuffle's
   boot, where the Start Game button looked perfect and did nothing forever.

   57 satellites parse a localStorage value without checking its shape. That is a
   RISK, not 57 defects, and the difference matters: blanket-patching 57 games on
   a hunch is how you break working things. So this proves it, one game at a time,
   by actually writing garbage into the save and seeing whether the game still
   boots and whether its primary button still does something.

   The payloads are chosen to survive JSON.parse and then fail on use, which is
   the whole point of the class:
     "5"          parses to a number, so save.foo is undefined
     "null"       parses to null, so save.foo throws
     "[]"         parses to an array, so named fields are undefined
     '{"a":1}'    parses to an object with none of the expected keys
   A payload that fails to parse is NOT interesting: the try/catch handles it.

   RESULT, 2026-08-16: 100 satellites swept, 20 genuinely broken and fixed.
   Four came back as false alarms and are recorded here so nobody chases them
   again. stream-hop boots to 0 buttons and 28 characters normally, so it was
   flagged for matching its own baseline. Flipbook, Petalvex and Vine Runner all
   changed size because a corrupt save also wipes the "you have seen the how to
   play" flag, so the game correctly shows its instructions again — all three were
   screenshotted and are perfectly healthy, with a working Got it or RUN button.
   That is why a smaller screen is a LOOK and only an uncaught error is a defect.
*/
import puppeteer from "puppeteer";
import { readFileSync } from "fs";

const BASE = process.env.LW_URL || "http://localhost:8909";

/* ⛔ THE FIRST VERSION OF THIS PASSED VACUOUSLY. It read the save keys off a
   CLEAN BOOT, and on a clean boot the only key present is `sws_sunbeam_anon_id`
   from the SDK — the game does not write its own save until you have played a
   round. So it corrupted a key none of these games ever parse and reported
   "survives" three times. A probe that cannot fail is not evidence.
   Keys now come from the SOURCE: every string literal handed to localStorage,
   plus the constants those calls resolve through (`var PKEY="pp_profile_v1"`). */
function saveKeysFromSource(slug) {
  const src = readFileSync("satellites/" + slug + "/index.html", "utf8");
  const keys = new Set();
  for (const m of src.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*['"]([^'"]+)['"]/g)) keys.add(m[1]);
  /* the call sites usually pass a variable; resolve the obvious declarations */
  const vars = new Set();
  for (const m of src.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*([A-Za-z_$][\w$]*)\s*[,)]/g)) vars.add(m[1]);
  for (const v of vars) {
    const re = new RegExp("(?:var|let|const)\\s+" + v.replace(/\$/g, "\\$") + "\\s*=\\s*['\"]([^'\"]+)['\"]");
    const hit = src.match(re);
    if (hit) keys.add(hit[1]);
  }
  return [...keys];
}
const PAYLOADS = [["a number", "5"], ["null", "null"], ["an array", "[]"], ["a wrong object", '{"a":1}']];

const slugs = process.argv.slice(2).filter(a => !a.startsWith("--"));
if (!slugs.length) { console.log("usage: node scripts/corrupt_save_probe.mjs <slug> [...]"); process.exit(2); }

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
let bad = 0;

for (const slug of slugs) {
  console.log("\n=== " + slug);
  /* First: a clean boot, to learn the save keys and the baseline. */
  const ctx = await browser.createBrowserContext();
  let page = await ctx.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE + "/satellites/" + slug + "/", { waitUntil: "load", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2600));
  const boot = await page.evaluate(() => Object.keys(localStorage));
  const keys = [...new Set([...saveKeysFromSource(slug), ...boot])];
  const baseline = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll("button,.btn")].filter(e => e.getBoundingClientRect().width > 0).length,
    text: (document.body.innerText || "").trim().length }));
  await ctx.close();
  console.log("  clean boot: " + baseline.buttons + " buttons, " + baseline.text + " chars of text");
  console.log("  keys from source: " + (saveKeysFromSource(slug).join(", ") || "(none)"));
  console.log("  keys after boot:  " + (boot.join(", ") || "(none)"));
  if (!keys.length) { console.log("  NOTHING TO CORRUPT — this probe would pass vacuously, skipping"); continue; }

  for (const [label, payload] of PAYLOADS) {
    const c2 = await browser.createBrowserContext();
    const p2 = await c2.newPage();
    const errs = [];
    p2.on("pageerror", e => errs.push(String(e).split("\n")[0].slice(0, 90)));
    await p2.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    /* seed the corrupt save BEFORE any of the game's script runs */
    await p2.evaluateOnNewDocument((ks, v) => {
      try { for (const k of ks) localStorage.setItem(k, v); } catch (e) {}
    }, keys, payload);
    let crashed = false;
    try {
      await p2.goto(BASE + "/satellites/" + slug + "/", { waitUntil: "load", timeout: 45000 });
      await new Promise(r => setTimeout(r, 2600));
    } catch (e) { crashed = true; }
    const after = await p2.evaluate(() => ({
      buttons: [...document.querySelectorAll("button,.btn")].filter(e => e.getBoundingClientRect().width > 0).length,
      text: (document.body.innerText || "").trim().length })).catch(() => ({ buttons: -1, text: -1 }));
    /* ⛔ THE SECOND WAY THIS PROBE WAS WRONG. It defined a brick purely by the UI
       collapsing, so when the fixture threw four TypeErrors it still reported
       "survives" — the buttons had already been written before the crash. That is
       the exact shape of the Shell Shuffle bug this class exists for: the Start
       Game button ships in the HTML, looks perfect, and does nothing forever.
       An UNCAUGHT ERROR DURING BOOT IS THE FINDING. The UI collapsing is only the
       loud version of it. */
    /* ⛔ THE THIRD WAY THIS PROBE WAS WRONG. `after.buttons === 0` fired even when
       the CLEAN boot also had zero buttons — stream-hop boots to 0 buttons and 28
       characters, so it was reported broken for matching its own baseline exactly.
       Everything is measured RELATIVE to the clean boot now, never absolutely.

       And the two signals are not equal. An uncaught error is a defect, full stop.
       A smaller screen might just be the empty state a corrupt save should produce
       (a drawing app with no book legitimately shows less), so that is reported
       separately as something to LOOK at rather than counted as a defect. */
    const errored = crashed || errs.length > 0;
    const shrank = (baseline.buttons > 0 && after.buttons < Math.ceil(baseline.buttons * 0.5))
                || (baseline.text > 60 && after.text < Math.ceil(baseline.text * 0.4));
    if (errored) bad++;
    console.log("  " + (errored ? "BROKEN  " : shrank ? "LOOK    " : "survives") + "  save = " + label.padEnd(16) +
      after.buttons + "/" + baseline.buttons + " buttons, " + after.text + "/" + baseline.text + " chars" +
      (errs.length ? "   UNCAUGHT: " + errs[0] : shrank ? "   smaller than a clean boot, may just be the empty state" : ""));
    await c2.close();
  }
}
await browser.close();
console.log(bad ? "\n" + bad + " corrupt-save case(s) broke a game" : "\nno corrupt save broke any game tested");
process.exit(bad ? 1 : 0);
