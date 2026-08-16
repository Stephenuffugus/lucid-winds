#!/usr/bin/env node
/* One serialized verification pass over a HANDOFF-11 game. Run from the repo
   root with the site already being served:

     python3 -m http.server 8951 --bind 127.0.0.1
     node scripts/handoff11_verify.mjs deepwell

   Runs, in order, stopping nothing but reporting everything:
     1. static gates          (scripts/handoff11_gates.mjs)
     2. the game's own suite  (node satellites/<id>/sim.js --test)
     3. assertion floor       (>= 80, counted from the suite output, not guessed)
     4. boot check            (real browser, uncaught errors, is anything drawn)
     5. tap targets           (scripts/handoff11_tap.mjs, 48px rendered)
     6. service worker audit  (scripts/sw_purge_audit.js, fleet safety)

   SERIALIZED ON PURPOSE. Two browsers or two sweeps at once on this 2 core box
   make gates disagree with each other, which is worse than no gate: it teaches
   you to rerun until green. One thing at a time, every time. */
import { execSync, spawnSync } from "child_process";
import { existsSync } from "fs";
import puppeteer from "puppeteer";

const id = process.argv[2];
if (!id) { console.log("usage: node scripts/handoff11_verify.mjs <gameid>"); process.exit(1); }
const BASE = process.env.LW_URL || "http://127.0.0.1:8951";
const dir = "satellites/" + id + "/";
const results = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? "  PASS  " : "  FAIL  ") + name + (detail ? "   " + detail : ""));
}

console.log("VERIFY " + id.toUpperCase() + "\n");

/* 1. static gates */
const g = spawnSync("node", ["scripts/handoff11_gates.mjs", id], { encoding: "utf8" });
const gFails = (g.stdout.match(/^\s+FAIL /gm) || []).length;
record("static gates", g.status === 0, gFails ? gFails + " failure(s), rerun the gate script to read them" : "clean");

/* 2 + 3. the game's own assertion suite, headless */
if (!existsSync(dir + "sim.js")) {
  record("assertion suite", false, "sim.js missing");
} else {
  const t = spawnSync("node", [dir + "sim.js", "--test"], { encoding: "utf8", timeout: 300000 });
  const out = (t.stdout || "") + (t.stderr || "");
  // accept the harness shapes the plans specify: "PASSED n / FAILED m" or "n passed, m failed"
  const m = out.match(/PASSED\s+(\d+)\s*\/\s*FAILED\s+(\d+)/i) ||
            out.match(/(\d+)\s+passed[,\s]+(\d+)\s+failed/i);
  if (!m) {
    record("assertion suite", false, "could not parse a pass/fail count from --test output");
  } else {
    const passed = Number(m[1]), failed = Number(m[2]);
    record("assertion suite", failed === 0 && t.status === 0, passed + " passed, " + failed + " failed");
    record("assertion floor (>=80)", passed >= 80, passed + " assertions");
  }
}

/* 4. boot check in a real browser: does it run, and does it draw anything */
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
try {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const errs = [];
  page.on("pageerror", e => errs.push(e.message.split("\n")[0].slice(0, 110)));
  page.on("console", m2 => {
    if (m2.type() !== "error") return;
    const t2 = m2.text();
    if (/404|Failed to load resource|net::ERR/.test(t2)) return;
    errs.push(t2.slice(0, 110));
  });
  await page.goto(BASE + "/" + dir + "?probe=" + Math.floor(Math.random() * 1e9),
    { waitUntil: "domcontentloaded", timeout: 20000 });
  await sleep(1600);
  record("boots without uncaught errors", errs.length === 0, errs.length ? errs[0] : "");

  /* "is anything drawn" without trusting rAF: measure real ink. A blank page
     and a broken page both load fine; only pixels tell them apart. */
  const ink = await page.evaluate(() => {
    const cv = document.querySelector("canvas");
    const bodyText = (document.body.innerText || "").trim().length;
    const els = document.body.querySelectorAll("*").length;
    let canvasInk = -1;
    if (cv) {
      try {
        const c = cv.getContext("2d");
        if (c) {
          const d = c.getImageData(0, 0, Math.min(cv.width, 300), Math.min(cv.height, 300)).data;
          const first = [d[0], d[1], d[2]];
          let diff = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i] !== first[0] || d[i + 1] !== first[1] || d[i + 2] !== first[2]) { diff++; }
          }
          canvasInk = diff;
        }
      } catch (e) { canvasInk = -2; }
    }
    return { bodyText, els, canvasInk, hasCanvas: !!cv };
  });
  const drew = ink.bodyText > 20 || ink.canvasInk > 500;
  record("draws something (not a blank page)", drew,
    "text " + ink.bodyText + " chars, " + ink.els + " elements" +
    (ink.hasCanvas ? ", canvas ink " + ink.canvasInk : ", no canvas"));

  /* the exit affordance the portal contract requires */
  const hasExit = await page.evaluate(() => typeof window.SWS_EXIT === "function");
  record("SWS_EXIT present (portal contract)", hasExit, hasExit ? "" : "no exit affordance");
  await ctx.close();
} finally {
  await browser.close();
}

/* 5. tap targets */
const tp = spawnSync("node", ["scripts/handoff11_tap.mjs", id], { encoding: "utf8", timeout: 180000 });
const tapLine = (tp.stdout || "").split("\n").find(l => l.includes("visible controls")) || "";
record("touch targets 48px + reachable", tp.status === 0, tapLine.trim());

/* 6. fleet safety */
const sw = spawnSync("node", ["scripts/sw_purge_audit.js"], { encoding: "utf8", timeout: 120000 });
record("service worker fleet audit", sw.status === 0, sw.status === 0 ? "no worker deletes another app's caches" : "see sw_purge_audit output");

const failed = results.filter(r => !r.pass);
console.log("\n" + id.toUpperCase() + ": " + (results.length - failed.length) + "/" + results.length + " checks passed");
if (failed.length) console.log("BLOCKED: " + failed.map(f => f.name).join(", "));
console.log("\nThese checks do not replace the LOOKING pass. Run handoff11_shoot.mjs and open the images.");
process.exit(failed.length ? 1 : 0);
