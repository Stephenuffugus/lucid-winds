/* Get INTO a run and shoot the bezel there. The title screen is not the test:
   during a run the sides follow the neighbourhood you are actually crossing.

   ⛔ `typeof window.G === "object" && window.G` cannot tell "no such variable"
   from "a run has not started", because G is declared as null. Drive the real
   buttons instead of probing for state that is not there yet. */
import p from "puppeteer";
import { mkdirSync } from "fs";
const BASE = process.argv[2] || "http://127.0.0.1:8777";
const OUT = "/tmp/claude-1000/-workspaces-lucid-winds/fcd5c63c-d7b6-4b77-ad07-cf78b7c31f3a/scratchpad/jimothy";
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const b = await p.launch({ headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const pg = await b.newPage();
await pg.setViewport({ width: 1920, height: 1080 });
const errs = []; pg.on("pageerror", e => errs.push(String(e).split("\n")[0].slice(0, 120)));
await pg.goto(BASE + "/satellites/stream-hop/", { waitUntil: "domcontentloaded" });
await sleep(4000);

async function visibleButtons() {
  return pg.evaluate(() => [...document.querySelectorAll("button,.btn,[onclick]")]
    .map(el => { const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
      return { t: (el.textContent || "").trim().slice(0, 28), id: el.id,
        x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
        ok: r.width > 8 && r.height > 8 && c.display !== "none" && c.visibility !== "hidden" && +c.opacity > 0.05 };
    }).filter(o => o.ok));
}
async function clickText(re, label) {
  /* ⛔ SCROLL FIRST. The how-to panel is 1538px of content in a 960px stage with
     overflow:hidden, so "Got it, let's hop" sits below the fold at y=1659 on a
     1080 screen. Clicking its reported coordinates clicked nothing at all, six
     times, and looked exactly like a dead button. The panel scrolls; the driver
     did not. */
  await pg.evaluate((src) => {
    const rx = new RegExp(src, "i");
    const el = [...document.querySelectorAll("button,.btn,[onclick]")].find(e => {
      const r = e.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && getComputedStyle(e).display !== "none" &&
        (rx.test((e.textContent || "").trim()) || rx.test(e.id));
    });
    if (el) el.scrollIntoView({ block: "center" });
  }, re.source);
  await sleep(400);
  const btns = await visibleButtons();
  const hit = btns.find(o => re.test(o.t) || re.test(o.id));
  if (!hit) { console.log(`  no button for ${label}; saw: ` + btns.map(o => o.t || o.id).join(" | ").slice(0, 150)); return false; }
  await pg.mouse.click(hit.x, hit.y);
  console.log(`  clicked ${label}: "${hit.t || hit.id}"`);
  await sleep(1600);
  return true;
}

await pg.mouse.click(960, 540); await sleep(1800);      /* dismiss the splash */
/* ⛔ A daily reward dialog ("Claim / Later") sits on top of the title screen on
   a fresh profile and swallows everything behind it. That dialog is itself the
   daily-return system that has to come out of the paid Steam build. */
await clickText(/^later$/i, "dismiss the daily claim");
/* ⛔ The five play modes are NOT on the title screen. It deliberately carries
   five buttons only and every mode lives behind GAMES. Then a how-to-play gate
   sits in front of a first run, so keep pressing forward until #s-play is on
   rather than assuming a fixed number of screens. */
const FORWARD = /^games$|endless|adventure|campaign|classic|got it|let.s hop|^(play|start|go|begin|continue)$/i;
for (let step = 0; step < 8; step++) {
  const on = await pg.evaluate(() => [...document.querySelectorAll(".screen.on")].map(e => e.id).join(","));
  if (on.includes("s-play")) { console.log(`  reached the run after ${step} steps`); break; }
  if (!(await clickText(FORWARD, `step ${step + 1} (on ${on})`))) break;
  await sleep(900);
}
await sleep(3000);

/* hop a few times so the run actually advances into a zone */
for (let i = 0; i < 14; i++) { await pg.keyboard.press("ArrowUp"); await sleep(230); }
await sleep(1500);

const state = await pg.evaluate(() => {
  const bz = document.getElementById("bezel");
  const shown = bz && [...bz.querySelectorAll(".bz")].find(e => e.classList.contains("show"));
  let zone = "no run";
  try { if (window.G) zone = window.G.zone; } catch (e) {}
  return { zone, img: shown ? (shown.style.backgroundImage || "") : null,
           screen: [...document.querySelectorAll(".screen.on")].map(e => e.id).join(",") };
});
await pg.screenshot({ path: `${OUT}/in-run.png` });
console.log(`screen=${state.screen}  zone=${state.zone}  ${state.img}`);
errs.slice(0, 3).forEach(e => console.log("  ERROR " + e));
await b.close();
