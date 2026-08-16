#!/usr/bin/env node
/* Portal thumbnail for a HANDOFF-11 game. Square, from the REAL running game,
   under the 150KB the arcade grid requires.

     python3 -m http.server 8951 --bind 127.0.0.1
     node scripts/handoff11_thumb.mjs deepwell
     node scripts/handoff11_thumb.mjs deepwell --steps=tapcenter,wait:900,tapcenter
     node scripts/handoff11_thumb.mjs deepwell --hide=".topbar,#hint"

   Shoot the GAME, not its menu: walk to a frame that shows what the game looks
   like when you are playing it, then hide the chrome so the tile reads as art
   rather than as a screenshot of a UI. If the PNG lands over 150KB the script
   re-encodes at a smaller capture size instead of shipping a heavy tile, since
   the portal grid loads a hundred of these at once. */
import puppeteer from "puppeteer";
import { writeFileSync, statSync, mkdirSync, existsSync } from "fs";

const id = process.argv[2];
if (!id) { console.log("usage: node scripts/handoff11_thumb.mjs <gameid> [--steps=...] [--hide=sel,sel]"); process.exit(1); }

const BASE = process.env.LW_URL || "http://127.0.0.1:8951";
const OUTDIR = "portal-assets/thumbs";
const OUT = OUTDIR + "/" + id + ".png";
const LIMIT = 150 * 1024;
const stepArg = (process.argv.find(a => a.startsWith("--steps=")) || "").split("=")[1] || "";
const hideArg = (process.argv.find(a => a.startsWith("--hide=")) || "").split("=")[1] || "";
const sleep = ms => new Promise(r => setTimeout(r, ms));
if (!existsSync(OUTDIR)) mkdirSync(OUTDIR, { recursive: true });

async function shoot(size) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
    await page.goto(BASE + "/satellites/" + id + "/?probe=" + Math.floor(Math.random() * 1e9),
      { waitUntil: "domcontentloaded", timeout: 20000 });
    await sleep(1500);
    for (const s of (stepArg ? stepArg.split(",") : [])) {
      if (s === "tapcenter") await page.mouse.click(size / 2, size / 2);
      else if (s.startsWith("tap:")) { const [, x, y] = s.split(":"); await page.mouse.click(Number(x), Number(y)); }
      else if (s.startsWith("key:")) await page.keyboard.press(s.split(":")[1]);
      else if (s.startsWith("wait")) await sleep(Number(s.split(":")[1] || 700));
      await sleep(300);
    }
    if (hideArg) {
      await page.evaluate(sels => {
        for (const sel of sels.split(",")) {
          document.querySelectorAll(sel.trim()).forEach(el => { el.style.visibility = "hidden"; });
        }
      }, hideArg);
      await sleep(300);
    }
    return await page.screenshot({ type: "png" });
  } finally {
    await browser.close();
  }
}

let size = 512;
let buf = await shoot(size);
while (buf.length > LIMIT && size > 256) {
  size = Math.round(size * 0.8);
  console.log("  " + (buf.length / 1024).toFixed(0) + "KB is over the 150KB grid limit, recapturing at " + size + "px");
  buf = await shoot(size);
}
writeFileSync(OUT, buf);
const kb = statSync(OUT).size / 1024;
console.log("  " + OUT + "  " + size + "px  " + kb.toFixed(1) + "KB  " + (kb <= 150 ? "under the limit" : "STILL OVER, hand optimise"));
console.log("\nOPEN IT. A thumb nobody looked at is how a menu screenshot ends up on the shelf.");
process.exit(kb <= 150 ? 0 : 1);
