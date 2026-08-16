#!/usr/bin/env node
/* Portal thumb for Bandit's Box: a clean square shot of the raccoon on the
   night theme, no app chrome — matching how the rest of the arcade grid
   reads. Serve the app first, then:
     node scripts/banditsbox_thumb.mjs
   Writes portal-assets/thumbs/bandits-box.png (must stay under 150KB). */
import puppeteer from "puppeteer";
import { writeFileSync, statSync } from "fs";

const BASE = process.env.BB_URL || "http://127.0.0.1:8942/";
const OUT = "portal-assets/thumbs/bandits-box.png";
const SIZE = 512;

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: "networkidle2" });

// through the splash the way a player does
await page.mouse.move(SIZE / 2, SIZE / 2);
await page.mouse.down(); await page.mouse.up();
await new Promise(r => setTimeout(r, 800));

await page.evaluate(() => {
  S.theme = "night"; applyS();
  showToy("coon");
  // strip the chrome so the thumb is art, not a screenshot of a UI
  document.querySelector(".topbar").style.display = "none";
  document.getElementById("strip").style.display = "none";
  document.querySelectorAll(".hint").forEach(h => h.style.display = "none");
});
await new Promise(r => setTimeout(r, 700));

const buf = await page.screenshot({ type: "png" });
writeFileSync(OUT, buf);
await browser.close();

const kb = statSync(OUT).size / 1024;
console.log("wrote " + OUT + "  " + kb.toFixed(1) + " KB");
if (kb > 150) { console.error("TOO BIG: portal thumbs must stay under 150KB"); process.exit(1); }
