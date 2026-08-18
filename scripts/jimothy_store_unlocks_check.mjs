#!/usr/bin/env node
/* DOES A BOUGHT BUILD EARN ITS COSTUMES BY PLAYING, AND IS THE FREE BUILD UNTOUCHED?
   node scripts/jimothy_store_unlocks_check.mjs [baseurl]

   On the free web build five costumes come off a seven day return streak and six
   more need a code. Fine for a free game, wrong for one somebody bought: 35
   calendar days plus a code hunt to reach content they already own. STORE_UNLOCKS
   puts them on a campaign ladder when __STEAM_BUILD is set, and the codes still work.

   ⛔ TESTS BEHAVIOUR, NOT INTERNALS. The whole game lives inside a closure, so
   PROG, CHARS, achCheck and every function here are unreachable from page scope.
   A first version of this file asserted on them and died on the first line with
   "isStoreBuild is not defined". Drive the UI and read the DOM, which is also
   what the player actually sees.
   ⛔ BOTH builds are asserted. A check that only proves the Steam build changed
   cannot tell you whether it broke the free one, and the free one is live. */
import p from "puppeteer";
const BASE = process.argv[2] || "http://127.0.0.1:8777";
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (n, ok, extra) => ok ? (pass++, console.log("  ok   " + n))
                              : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + String(extra).slice(0, 110) : "")));

const b = await p.launch({ headless: "new", args: ["--no-sandbox"] });

async function boot(steam, maxLevel) {
  const pg = await b.newPage();
  await pg.setViewport({ width: 390, height: 844 });
  await pg.evaluateOnNewDocument((isSteam, lv) => {
    if (isSteam) window.__STEAM_BUILD = true;
    try {
      const raw = JSON.parse(localStorage.getItem("sh_prog") || "{}");
      raw.adv = { maxLevel: lv, stars: {} };
      raw.caps = 0;
      localStorage.setItem("sh_prog", JSON.stringify(raw));
    } catch (e) {}
  }, steam, maxLevel);
  await pg.goto(BASE + "/satellites/stream-hop/", { waitUntil: "domcontentloaded" });
  await sleep(4200);
  return pg;
}

/* click a visible control by its label, scrolling it into view first */
async function tap(pg, rx, label) {
  await pg.evaluate((src) => {
    const re = new RegExp(src, "i");
    const el = [...document.querySelectorAll("button,.btn,[onclick]")].find(e => {
      const r = e.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && getComputedStyle(e).display !== "none" &&
        (re.test((e.textContent || "").trim()) || re.test(e.id));
    });
    if (el) el.scrollIntoView({ block: "center" });
  }, rx.source);
  await sleep(350);
  const hit = await pg.evaluate((src) => {
    const re = new RegExp(src, "i");
    const el = [...document.querySelectorAll("button,.btn,[onclick]")].find(e => {
      const r = e.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && getComputedStyle(e).display !== "none" &&
        (re.test((e.textContent || "").trim()) || re.test(e.id));
    });
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, rx.source);
  if (!hit) { console.log(`        (no control for ${label})`); return false; }
  await pg.mouse.click(hit.x, hit.y);
  await sleep(1300);
  return true;
}

async function openBin(pg) {
  /* ⛔ ONE CLICK IS NOT ENOUGH. The splash holds for a minimum time, so a single
     click fired right after boot races it and silently does nothing; the run
     then reads a screen that never changed. Keep tapping until it is gone. */
  for (let i = 0; i < 10; i++) {
    const onSplash = await pg.evaluate(() => {
      const el = document.getElementById("s-splash");
      return !!(el && el.classList.contains("on"));
    });
    if (!onSplash) break;
    await pg.mouse.click(195, 422);
    await sleep(700);
  }
  await sleep(900);
  await tap(pg, /^later$/, "dismiss any daily claim");
  await tap(pg, /prize bin/i, "Prize Bin");
  return pg.evaluate(() => {
    const txt = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
    const on = [...document.querySelectorAll(".screen.on")].map(e => e.id).join(",");
    /* ⛔ A HIDDEN SCREEN STILL HAS TEXT. innerText falls back to textContent on a
       display:none element, so reading #s-skins while it is closed returns the
       whole panel including copy the render functions never touched. That made
       one assertion pass VACUOUSLY on a run where the Prize Bin never opened.
       Report `opened` and let the caller refuse to judge anything if it is false. */
    const el = document.getElementById("s-skins");
    const opened = !!(el && el.classList.contains("on"));
    const body = opened ? (el.innerText || "") : "";
    return { screen: on, opened: opened, weeklyHeader: txt("weekly-h"), codeHeader: txt("code-h"),
             /* ⛔ NUMBERED. The static blurb legitimately reads "Clear Adventure
                levels and they are yours", so an unnumbered match flagged the
                page's own correct copy as an outstanding requirement. Only a
                numbered condition means something is still locked. */
             hasLevelCopy: /clear adventure level \d+/i.test(body),
             hasStreakCopy: /days? in a row|come back tomorrow|show up seven/i.test(body),
             bodySample: body.replace(/\s+/g, " ").slice(0, 200) };
  });
}

/* ---------- the bought build, fresh campaign ---------- */
console.log("\nSTEAM BUILD, fresh save");
let pg = await boot(true, 1);
let popup = await pg.evaluate(() => {
  const el = document.getElementById("reward-ov");
  return !!(el && getComputedStyle(el).display !== "none");
});
t("NO daily reward popup on a bought build", popup === false);
let bin = await openBin(pg);
t("the Prize Bin opens", /s-skins/.test(bin.screen || ""), bin.screen);
t("it states a real condition", bin.hasLevelCopy === true, bin.bodySample);
t("it does NOT talk about a return streak", bin.hasStreakCopy === false, bin.bodySample);
t("the weekly header is rewritten", /earn these by playing/i.test(bin.weeklyHeader || ""), bin.weeklyHeader);
t("the code header offers a second door", /earn these, or use a code/i.test(bin.codeHeader || ""), bin.codeHeader);
await pg.close();

/* ---------- the bought build, campaign cleared ---------- */
console.log("\nSTEAM BUILD, campaign cleared (maxLevel 101)");
pg = await boot(true, 101);
bin = await openBin(pg);
t("the Prize Bin actually opened", bin.opened === true, "screen=" + bin.screen);
if (!bin.opened) { console.log("        ⛔ skipping the copy assertions: nothing was on screen to read"); fail++; }
else t("nothing is still asking to be cleared", bin.hasLevelCopy === false, bin.bodySample);
const done = bin.opened ? await pg.evaluate(() => {
  const b = (document.getElementById("s-skins") || document.body).innerText || "";
  return { allWeekly: /every one of them is yours|nothing left on the ladder|earned every one/i.test(b),
           sample: b.replace(/\s+/g, " ").slice(0, 220) };
}) : { allWeekly: false, sample: "the bin never opened" };
if (bin.opened) t("the ladder reports itself finished", done.allWeekly === true, done.sample);
await pg.close();

/* ---------- the free build, which must be untouched ---------- */
console.log("\nFREE WEB BUILD (baseline, must not change)");
pg = await boot(false, 101);
bin = await openBin(pg);
t("the free build still talks about the streak", bin.hasStreakCopy === true, bin.bodySample);
t("no ladder copy leaks into the free build", bin.hasLevelCopy === false, bin.bodySample);
t("the free header is unchanged", /come back for these/i.test(bin.weeklyHeader || ""), bin.weeklyHeader);
t("the free code header is unchanged", /codes unlock these/i.test(bin.codeHeader || ""), bin.codeHeader);
await pg.close();

await b.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
