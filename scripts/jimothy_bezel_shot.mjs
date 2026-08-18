/* Shoot Jimothy at DESKTOP sizes, which is the only place the bezel exists.
   node scripts/jimothy_bezel_shot.mjs [baseurl]
   ⛔ Phone width is NOT a test of this change: the bezel is suppressed when
   there is no spare width, so a phone shot proves only that it stayed hidden. */
import p from "puppeteer";
import { mkdirSync } from "fs";
const BASE = process.argv[2] || "http://127.0.0.1:8777";
const OUT = "/tmp/claude-1000/-workspaces-lucid-winds/fcd5c63c-d7b6-4b77-ad07-cf78b7c31f3a/scratchpad/jimothy";
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VIEWS = [
  ["fullhd", 1920, 1080], ["laptop", 1366, 768], ["phone", 390, 844],
];
const b = await p.launch({ headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
for (const [name, w, h] of VIEWS) {
  const pg = await b.newPage();
  const mobile = w < 700;
  await pg.emulate({ viewport: { width: w, height: h, isMobile: mobile, hasTouch: mobile },
    userAgent: mobile ? "Mozilla/5.0 (Linux; Android 14; Pixel 9) Mobile" : "Mozilla/5.0 (X11; Linux x86_64) Chrome/128" });
  const errs = [];
  pg.on("pageerror", e => errs.push(String(e).split("\n")[0].slice(0, 120)));
  await pg.goto(BASE + "/satellites/stream-hop/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(4500);
  const state = await pg.evaluate(() => {
    const bz = document.getElementById("bezel");
    const shown = bz && [...bz.querySelectorAll(".bz")].find(e => e.classList.contains("show"));
    const st = document.getElementById("stage");
    const r = st ? st.getBoundingClientRect() : null;
    return { exists: !!bz, on: !!(bz && bz.classList.contains("on")),
      img: shown ? (shown.style.backgroundImage || "").slice(0, 70) : null,
      spare: r ? Math.round(innerWidth - r.width) : null };
  });
  await pg.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`${name.padEnd(7)} ${w}x${h}  bezel=${state.on ? "ON " : "off"}  spare=${state.spare}px  ${state.img || ""}`);
  errs.slice(0, 3).forEach(e => console.log("        ERROR " + e));
  await pg.close();
}
await b.close();
console.log("\nshots: " + OUT);
