#!/usr/bin/env node
/* A contact sheet of every thumbnail in the studio, at the size a player sees.

   "The thumbnails are all different" is a judgement about the SET, and you
   cannot judge a set by opening files one at a time. This lays them all out in
   one image, in the same frame the arcade grid uses, so the mixture is visible
   at a glance: which are painted, which are screenshots, which are portrait
   inside a square hole, which are so dark they read as empty tiles.

     node scripts/thumb_contact_sheet.mjs
   Writes contact-thumbs.png (and -screenshots.png) to the scratchpad. */
import puppeteer from "puppeteer";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const OUT = process.env.SHEET_OUT ||
  "/tmp/claude-1000/-workspaces-lucid-winds/f9cbdde3-a22e-4660-b039-acdd48a98f2a/scratchpad/studio";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

async function sheet(dir, outName, cols = 8) {
  const files = readdirSync(dir).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  const cells = files.map(f => {
    const b64 = readFileSync(dir + "/" + f).toString("base64");
    const mime = /\.png$/i.test(f) ? "image/png" : /\.webp$/i.test(f) ? "image/webp" : "image/jpeg";
    return `<figure><div class="shot"><img src="data:${mime};base64,${b64}"></div>
      <figcaption>${f.replace(/\.(png|jpe?g|webp)$/i, "")}</figcaption></figure>`;
  }).join("");

  const page = await browser.newPage();
  await page.setViewport({ width: cols * 150 + 40, height: 1000, deviceScaleFactor: 1 });
  /* the frame matches the arcade card: a fixed box with object-fit cover, which
     is what makes a portrait image inside a square hole show as a crop */
  await page.setContent(`<style>
    body{margin:0;padding:16px;background:#0b0d10;font:11px/1.3 system-ui;color:#8b939d}
    .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px}
    figure{margin:0}
    .shot{aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:#15171c;
      border:1px solid #262a31}
    .shot img{width:100%;height:100%;object-fit:cover;display:block}
    figcaption{margin-top:4px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  </style><div class="grid">${cells}</div>`, { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 900));
  const h = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: cols * 150 + 40, height: Math.min(h + 40, 20000), deviceScaleFactor: 1 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: OUT + "/" + outName, fullPage: true });
  console.log("  " + outName + "  " + files.length + " tiles");
  await page.close();
}

console.log("CONTACT SHEETS");
await sheet("portal-assets/thumbs", "contact-thumbs.png");
await sheet("portal-assets/screenshots", "contact-screenshots.png");
await browser.close();
console.log("in " + OUT);
