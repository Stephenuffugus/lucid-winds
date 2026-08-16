#!/usr/bin/env node
/* Render Bandit's Box PWA icons from the app's own raccoon mark.
   One source of truth for the artwork: the SVG string below matches the
   intro splash in index.html. Run from the repo root:
     node scripts/banditsbox_icons.mjs
   Writes icon-192.png, icon-512.png, icon-maskable-512.png into
   satellites/bandits-box/.

   Maskable note: Android crops maskable icons to an arbitrary shape and only
   the central 80% is guaranteed visible, so that variant draws the same
   raccoon smaller inside a full-bleed field. */
import puppeteer from "puppeteer";
import { writeFileSync } from "fs";

const OUT = "satellites/bandits-box/";
const BG = "#1B1822";

// the raccoon, drawn on a 100x100 viewBox — same shapes as the app splash
const RACCOON = `
  <circle cx="30" cy="26" r="13" fill="#6E677C"/><circle cx="70" cy="26" r="13" fill="#6E677C"/>
  <circle cx="50" cy="52" r="34" fill="#7A7389"/>
  <path d="M22 48 C26 36,40 33,45 45 C48 52,42 60,33 60 C25 60,21 55,22 48 Z" fill="#2A2434"/>
  <path d="M78 48 C74 36,60 33,55 45 C52 52,58 60,67 60 C75 60,79 55,78 48 Z" fill="#2A2434"/>
  <circle cx="37" cy="48" r="7" fill="#F4EFE6"/><circle cx="63" cy="48" r="7" fill="#F4EFE6"/>
  <circle cx="37" cy="49" r="3.6" fill="#1E1926"/><circle cx="63" cy="49" r="3.6" fill="#1E1926"/>
  <ellipse cx="50" cy="70" rx="16" ry="12" fill="#DED7CB"/>
  <path d="M45 65 Q50 61 55 65 Q52 70 50 70 Q48 70 45 65 Z" fill="#332C3E"/>`;

/* scale: 1 fills the tile, 0.78 pulls the mark into the maskable safe zone.
   radius: rounded corners for the plain icons, square full bleed for maskable
   (the platform supplies the shape). */
function svg(scale, radius) {
  const off = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="${radius}" fill="${BG}"/>
    <g transform="translate(${off} ${off}) scale(${scale})">${RACCOON}</g>
  </svg>`;
}

/* radius is in viewBox units, not pixels — anything over 50 collapses the
   tile to a circle, and a circle with transparent corners composites to black
   on an iOS home screen. 22 is the familiar rounded square. */
const jobs = [
  { file: "icon-192.png", size: 192, scale: 0.92, radius: 22 },
  { file: "icon-512.png", size: 512, scale: 0.92, radius: 22 },
  { file: "icon-maskable-512.png", size: 512, scale: 0.7, radius: 0 }
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();

for (const j of jobs) {
  await page.setViewport({ width: j.size, height: j.size, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}
     svg{display:block;width:${j.size}px;height:${j.size}px}</style>` + svg(j.scale, j.radius),
    { waitUntil: "load" }
  );
  const buf = await page.screenshot({ omitBackground: true, type: "png" });
  writeFileSync(OUT + j.file, buf);
  console.log("wrote " + OUT + j.file + "  (" + j.size + "px, " + buf.length + " bytes)");
}

await browser.close();
