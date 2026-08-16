#!/usr/bin/env node
/* Render HUSH PWA icons from the app's own mark: three concentric rings, the
   same shapes the app already draws for its runtime manifest. Run from the
   repo root:  node scripts/hush_icons.mjs

   Maskable variant pulls the mark into the central safe zone, because Android
   crops maskable icons to a shape of its choosing. */
import puppeteer from "puppeteer";
import { writeFileSync } from "fs";

const OUT = "hush/";
const BG = "#0E1220", FG = "#F2B872";

function svg(scale, radius) {
  const off = (512 - 512 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${radius}" fill="${BG}"/>
    <g transform="translate(${off} ${off}) scale(${scale})">
      <circle cx="256" cy="256" r="150" fill="none" stroke="${FG}" stroke-width="10" opacity=".35"/>
      <circle cx="256" cy="256" r="104" fill="none" stroke="${FG}" stroke-width="14" opacity=".6"/>
      <circle cx="256" cy="256" r="52" fill="${FG}"/>
    </g></svg>`;
}

// radius is in the 512 viewBox: 112 is the familiar rounded square, and the
// maskable one is square because the platform supplies its own shape
const jobs = [
  { file: "icon-192.png", size: 192, scale: 1, radius: 112 },
  { file: "icon-512.png", size: 512, scale: 1, radius: 112 },
  { file: "icon-maskable-512.png", size: 512, scale: 0.72, radius: 0 }
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
for (const j of jobs) {
  await page.setViewport({ width: j.size, height: j.size, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}
     svg{display:block;width:${j.size}px;height:${j.size}px}</style>` + svg(j.scale, j.radius),
    { waitUntil: "load" });
  const buf = await page.screenshot({ omitBackground: true, type: "png" });
  writeFileSync(OUT + j.file, buf);
  console.log("wrote " + OUT + j.file + "  (" + j.size + "px, " + buf.length + " bytes)");
}
await browser.close();
