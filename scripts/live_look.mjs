#!/usr/bin/env node
/* A look at what actually shipped, on the live site, in the states nobody has
   opened yet: both portal shelves, the new cards as a player sees them, and
   each app at desktop width as well as on a phone.
     node scripts/live_look.mjs
   Screenshots only. Reading them is the job; this just takes them. */
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const BASE = process.env.LW_URL || "https://lucidwinds.com";
const SHOTS = process.env.LOOK_SHOTS ||
  "/tmp/claude-1000/-workspaces-lucid-winds/f9cbdde3-a22e-4660-b039-acdd48a98f2a/scratchpad/live";
mkdirSync(SHOTS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

async function shoot(name, url, w, h, act) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    await sleep(1500);
    if (act) await act(page);
    await page.screenshot({ path: SHOTS + "/" + name + ".png" });
    console.log("  " + name + "  " + w + "x" + h);
  } catch (e) { console.log("  " + name + "  FAILED " + e.message.slice(0, 60)); }
  await page.close();
}

console.log("LIVE LOOK  " + BASE);

/* the portal, both shelves, at phone and desktop */
await shoot("portal-phone", BASE + "/portal/", 375, 667);
await shoot("portal-desktop", BASE + "/portal/", 1280, 900);
await shoot("portal-freeapps", BASE + "/portal/", 375, 667, async p => {
  await p.evaluate(() => {
    const a = [...document.querySelectorAll("a.app-card")].find(x => /hush/i.test(x.textContent));
    if (a) a.scrollIntoView({ block: "center" });
  });
  await sleep(600);
});
await shoot("portal-banditscard", BASE + "/portal/", 375, 667, async p => {
  await p.evaluate(() => {
    const els = [...document.querySelectorAll("*")].filter(e =>
      e.children.length === 0 && /Bandit/i.test(e.textContent || ""));
    if (els[0]) els[0].scrollIntoView({ block: "center" });
  });
  await sleep(900);
});

/* the apps at desktop width, which nobody has looked at */
await shoot("bandits-desktop", BASE + "/satellites/bandits-box/", 1280, 900, async p => {
  await p.mouse.move(640, 450); await p.mouse.down(); await p.mouse.up();
  await sleep(900);
});
await shoot("hush-desktop", BASE + "/hush/", 1280, 900);
await shoot("padlab-marble-desktop", BASE + "/padlab/", 1280, 900, async p => {
  const b = await p.evaluate(() => {
    const x = [...document.querySelectorAll("button")].find(t => /let's play|start/i.test(t.textContent));
    if (!x) return null; const r = x.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (b) { await p.mouse.move(b.x, b.y); await p.mouse.down(); await p.mouse.up(); await sleep(1400); }
  await p.evaluate(() => {
    const t = [...document.querySelectorAll(".tab")].find(x => x.dataset.view === "marble");
    if (t) t.click();
  });
  await sleep(1400);
});

/* Hush states never opened: the wake screen and the sunrise ramp */
await shoot("hush-okwake", BASE + "/hush/", 375, 667, async p => {
  await p.evaluate(() => {
    setMode("full");
    S.okWake = true; S.wakeTime = "07:00"; save(); syncUI();
    const panel = document.getElementById("p-wake") ||
      [...document.querySelectorAll(".panel")].find(x => /wake/i.test(x.textContent));
    if (panel) { panel.querySelector("button").click(); panel.scrollIntoView({ block: "start" }); }
  });
  await sleep(900);
});
await shoot("hush-trials", BASE + "/hush/", 375, 667, async p => {
  await p.evaluate(() => {
    setMode("full");
    const panel = [...document.querySelectorAll(".panel")].find(x => /trial|experiment/i.test(x.textContent));
    if (panel) { panel.querySelector("button").click(); panel.scrollIntoView({ block: "start" }); }
  });
  await sleep(900);
});

await browser.close();
console.log("shots in " + SHOTS);
