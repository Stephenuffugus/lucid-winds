#!/usr/bin/env node
/* THE LOOKING PASS for the HANDOFF-11 games. A visual change is not done until
   somebody has opened the image (CLAUDE.md law). This takes the shots; a human
   or the agent then READS them and names three things wrong.

   Serve the repo root first (absolute paths must resolve):
     python3 -m http.server 8951
     node scripts/handoff11_shoot.mjs deepwell
     node scripts/handoff11_shoot.mjs deepwell --steps=tapcenter,wait,tapcenter

   Shoots BOTH viewports on purpose: on 2026-08-16 two production defects were
   invisible at phone width and obvious at desktop width. Phone 390x844 is the
   design target, desktop 1280x800 is where the layout falls apart.

   Console errors are captured and printed, because a screenshot of a broken
   page still looks like a screenshot.

   ⚠️ READ THIS BEFORE FILING A BUG FROM ONE OF THESE IMAGES: headless Chrome in
   this container has NO EMOJI FONT. Every emoji renders as an empty box. That
   tofu is an artifact of the screenshot environment and is NOT a defect in the
   page. I nearly filed eleven of them against Silt. If a missing glyph is the
   finding, confirm it is not an emoji before reporting it. */
import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const id = process.argv[2];
if (!id) { console.log("usage: node scripts/handoff11_shoot.mjs <gameid> [--steps=...] [--test]"); process.exit(1); }

const BASE = process.env.LW_URL || "http://127.0.0.1:8951";
const OUT = (process.env.SHOT_DIR ||
  "/tmp/claude-1000/-workspaces-lucid-winds/5d3fb669-7586-4960-ab47-ebc7334caf3a/scratchpad/shots") + "/" + id;
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const stepArg = (process.argv.find(a => a.startsWith("--steps=")) || "").split("=")[1] || "";
const steps = stepArg ? stepArg.split(",") : [];
const testMode = process.argv.includes("--test");
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VIEWS = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 }
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

console.log("LOOKING PASS  " + id);
for (const v of VIEWS) {
  // a fresh context per view: service worker and localStorage state from the
  // previous shot would make the second view lie about first load
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: 2 });
  const errs = [];
  page.on("pageerror", e => errs.push("uncaught: " + e.message.split("\n")[0].slice(0, 120)));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/404|Failed to load resource|net::ERR/.test(t)) return;
    errs.push("console: " + t.slice(0, 120));
  });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });

  /* Hush and PadLab live at the site root. The first version of this script
     hardcoded /satellites/ and happily shot a 404 page, reporting "no console
     errors" about it, which is exactly the kind of green that teaches you
     nothing. Accept a path or a bare id. */
  const SDIR = id.indexOf("/") >= 0 ? id.replace(/^\/+|\/+$/g, "")
    : (existsSync("satellites/" + id) ? "satellites/" + id : id);
  const url = BASE + "/" + SDIR + "/?probe=" + Math.floor(Math.random() * 1e9) + (testMode ? "&test=1" : "");
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  await sleep(1400);   // never networkidle2: a game that keeps drawing never idles

  const shot = async label => {
    const f = OUT + "/" + v.name + "-" + label + ".png";
    writeFileSync(f, await page.screenshot({ type: "png" }));
    console.log("  " + f);
  };
  await shot("01-open");

  let n = 1;
  for (const s of steps) {
    n++;
    if (s === "tapcenter") { await page.mouse.click(v.width / 2, v.height / 2); }
    else if (s === "tapbottom") { await page.mouse.click(v.width / 2, v.height - 80); }
    else if (s.startsWith("tap:")) {
      const [, x, y] = s.split(":");
      await page.mouse.click(Number(x), Number(y));
    } else if (s.startsWith("key:")) {
      await page.keyboard.press(s.split(":")[1]);
    } else if (s.startsWith("wait")) {
      await sleep(Number(s.split(":")[1] || 900));
    }
    await sleep(500);
    await shot(String(n).padStart(2, "0") + "-" + s.replace(/[^a-z0-9]/gi, ""));
  }

  console.log("  " + v.name + ": " + (errs.length ? errs.length + " ERROR(S)" : "no console errors"));
  for (const e of errs.slice(0, 6)) console.log("     " + e);
  await ctx.close();
}

await browser.close();
console.log("\nNow OPEN the images and name three things wrong. A green run is not a look.");
