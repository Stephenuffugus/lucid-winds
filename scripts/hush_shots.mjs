#!/usr/bin/env node
/* HUSH screenshots for the LOOKING pass. A visual change is not done until
   someone has opened the picture.
     python3 -m http.server 8950   (repo root)
     node scripts/hush_shots.mjs
   Also measures the frame rate of each visualizer mode, since the battery
   claim in the handoff (30 fps, and 4 in Void) is only a claim until counted. */
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const BASE = (process.env.LW_URL || "http://127.0.0.1:8950") + "/hush/";
const SHOTS = process.env.HUSH_SHOTS ||
  "/tmp/claude-1000/-workspaces-lucid-winds/f9cbdde3-a22e-4660-b039-acdd48a98f2a/scratchpad/hush";
mkdirSync(SHOTS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: "networkidle2" });
await sleep(1200);

const shot = async (name, act) => {
  if (act) await act();
  await sleep(500);
  await page.screenshot({ path: SHOTS + "/" + name + ".png" });
  console.log("  " + name);
};

console.log("HUSH SHOTS  " + BASE);
await shot("01-front-door");
await shot("02-shortlist", async () => {
  await page.evaluate(() => document.getElementById("elseBtn").click());
});
await shot("03-playing", async () => {
  await page.evaluate(() => { document.getElementById("elseList").classList.remove("on");
    document.getElementById("tonightGo").click(); });
  await sleep(1400);
});
await shot("04-full-mode", async () => {
  await page.evaluate(() => setMode("full"));
});
await shot("05-full-scrolled", async () => {
  await page.evaluate(() => window.scrollTo(0, 700));
});
await shot("06-evidence", async () => {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const p = document.getElementById("p-eq");
    p.querySelector("button").click();
    p.scrollIntoView({ block: "start" });
  });
});
await shot("07-room-calibration", async () => {
  await page.evaluate(() => {
    document.getElementById("p-eq").querySelector("button").click();
    const p = document.getElementById("p-room");
    p.querySelector("button").click();
    p.scrollIntoView({ block: "start" });
  });
});

/* visualizer modes, with the frame rate actually counted */
const modes = await page.evaluate(() =>
  [...document.getElementById("vizBottom").children].map(c => c.dataset.v));
console.log("  viz modes: " + JSON.stringify(modes));
for (const m of modes) {
  await page.evaluate(v => {
    document.getElementById("p-room").querySelector("button").click();
    S.vizMode = v; if (typeof openViz === "function") openViz(); else document.getElementById("vizBtn").click();
  }, m);
  await sleep(900);
  /* Count the app's OWN draws, not requestAnimationFrame. rAF fires at 60 on
     any healthy machine whatever the app does, so counting it would report 60
     for every mode and prove nothing. vloop caps itself, and that cap is the
     battery claim worth checking, so the counter goes on the draw itself. */
  const fps = await page.evaluate(() => new Promise(res => {
    const real = window.drawViz || null;
    let n = 0;
    const cv = document.getElementById("vizcv") ||
               document.querySelector(".viz canvas, #vizWrap canvas, canvas");
    const c2 = cv && cv.getContext("2d");
    if (!c2) { res(-1); return; }
    const realClear = c2.clearRect.bind(c2), realFill = c2.fillRect.bind(c2);
    let counted = false;
    c2.clearRect = function () { if (!counted) { n++; counted = true; setTimeout(() => counted = false, 0); } return realClear.apply(this, arguments); };
    c2.fillRect = function () { if (!counted) { n++; counted = true; setTimeout(() => counted = false, 0); } return realFill.apply(this, arguments); };
    const t0 = performance.now();
    setTimeout(() => {
      c2.clearRect = realClear; c2.fillRect = realFill;
      res(Math.round(n / ((performance.now() - t0) / 1000)));
    }, 3000);
  }));
  await page.screenshot({ path: SHOTS + "/viz-" + m + ".png" });
  console.log("  viz-" + m + "  ~" + fps + " fps");
  await page.evaluate(() => { if (typeof closeViz === "function") closeViz();
    else document.body.classList.remove("viz"); });
  await sleep(300);
}

/* desktop */
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.evaluate(() => { window.scrollTo(0, 0); setMode("simple"); });
await sleep(700);
await page.screenshot({ path: SHOTS + "/08-desktop-simple.png" });
console.log("  08-desktop-simple");

await browser.close();
console.log("shots in " + SHOTS);
