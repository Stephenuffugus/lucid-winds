/* Regenerate a portal thumb from the game's LIVE title screen.
   540x960 viewport, 480x480 crop centred on the title, jpeg q82, must land
   under 150KB (reference_thumbnail_perf).
   node scripts/refresh_thumb.mjs <slug> <out.jpg> [titleSelector]            */
import puppeteer from "puppeteer"; import fs from "fs";
const [slug, out, sel] = process.argv.slice(2);
const PORT = process.env.PORT || 8777;
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const p = await br.newPage();
await p.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
await p.goto(`http://127.0.0.1:${PORT}/satellites/${slug}/?probe=` + Math.random(), { waitUntil: "domcontentloaded" });
await new Promise(r => setTimeout(r, 3500));
/* The feedback chip parks anywhere the yield logic sends it, including the
   top-left corner (Burrow Bowl). Baked into a storefront thumb it is a bug
   that never goes away, so it is hidden before the shot. */
await p.evaluate(() => document.querySelectorAll(".lwfb-fab,.lwfb-fab-x").forEach(e => e.style.setProperty("display", "none", "important")));
await new Promise(r => setTimeout(r, 300));
const cy = await p.evaluate((sel) => {
  const cands = sel ? [sel] : [".title-word", ".title-main", ".title h1", "h1", ".title", ".title-sub"];
  for (const s of cands) {
    const el = document.querySelector(s); if (!el) continue;
    const b = el.getBoundingClientRect(); if (b.width < 20 || b.height < 8) continue;
    return b.top + b.height / 2;
  }
  return 300;
}, sel);
const y = Math.max(0, Math.min(960 - 480, cy - 150));
await p.screenshot({ path: out, type: "jpeg", quality: 82, clip: { x: 30, y, width: 480, height: 480 } });
const kb = fs.statSync(out).size / 1024;
console.log(`${slug}: crop y=${Math.round(y)}  ${kb.toFixed(1)} KB  ${kb < 150 ? "OK" : "TOO BIG"}`);
await br.close();
