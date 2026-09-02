/* GATE P7 — the toast, measured on a 375x667 phone viewport, on three
   satellites and three natives (one native with NO shelf, to prove silence).
   Computed pointer-events is none; rendered height <= 44px; gone within 3.5s;
   no dash of any kind in its text (LAW 13); prefers-reduced-motion yields no
   transition. Then SCREENSHOTS with the toast showing, written to --shots
   (default /tmp/music-shots), which a human or Fable must LOOK at.
   Run:  node test/music/ui.mjs [--shots <dir>] */
import { readFileSync, mkdirSync } from "fs";
import puppeteer from "puppeteer";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SHOTS = arg("--shots", "/tmp/music-shots"); mkdirSync(SHOTS, { recursive: true });
const CATSRC = readFileSync("/tmp/music-fixture/music-catalog.js", "utf8");
const GAMES = [
  { id: "deepwell",        url: "/satellites/deepwell/",        shelf: true },
  { id: "greenhouse-pinball", url: "/satellites/greenhouse-pinball/", shelf: true },   // NOT tarot-run: vendored, no include by design
  { id: "flock-the-world", url: "/satellites/flock-the-world/", shelf: true },
  { id: "chess",           url: "/play/chess.html",             shelf: true },
  { id: "klondike",        url: "/play/klondike.html",          shelf: true },
  { id: "sudoku",          url: "/play/sudoku.html",            shelf: false },   // puzzle: no family folder in the fixture
];
let pass = 0, fail = 0;
const t = (n, ok, d) => { if (ok) { pass++; console.log("  ok    " + n); } else { fail++; console.log("  FAIL  " + n + (d ? "   <- " + d : "")); } };
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"] });

async function boot(g, reduced) {
  const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
  await page.setBypassServiceWorker(true);
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
  if (reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setRequestInterception(true);
  page.on("request", r => { if (/\/music-catalog\.js(\?|$)/.test(r.url())) r.respond({ status: 200, contentType: "application/javascript", body: CATSRC }); else r.continue(); });
  await page.goto("http://127.0.0.1:8777" + g.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await new Promise(r => setTimeout(r, 700));
  const before = await page.evaluate(() => !!document.getElementById("sws-music-toast"));
  /* a synthetic pointerdown on document: opens the toast gate without hitting any game control */
  await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
  await new Promise(r => setTimeout(r, 120));
  const m = await page.evaluate(() => {
    const el = document.getElementById("sws-music-toast"); if (!el) return null;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { text: el.textContent, pe: cs.pointerEvents, pos: cs.position, h: r.height, top: r.top, w: r.width, cx: r.left + r.width / 2, transition: cs.transitionProperty, animation: cs.animationName };
  });
  return { ctx, page, m, before };
}

for (const g of GAMES) {
  const { ctx, page, m, before } = await boot(g, false);
  if (g.shelf) t(g.id + "  no toast before the first interaction", !before);
  if (!g.shelf) { t(g.id + "  no shelf: no toast at all", !m); await page.screenshot({ path: SHOTS + "/" + g.id + ".png" }); await ctx.close(); continue; }
  t(g.id + "  toast present after the first tap", !!m);
  if (m) {
    t(g.id + "  pointer-events none, position fixed", m.pe === "none" && m.pos === "fixed");
    t(g.id + "  rendered height <= 44px (" + m.h.toFixed(1) + ")", m.h <= 44);
    t(g.id + "  centred horizontally (cx " + m.cx.toFixed(0) + " of 375)", Math.abs(m.cx - 187.5) < 4);
    t(g.id + "  sits in the top band (top " + m.top.toFixed(0) + ")", m.top >= 4 && m.top <= 24);
    t(g.id + "  text has no dash of any kind: " + JSON.stringify(m.text), !/[-–—]/.test(m.text));
    t(g.id + "  fits the width (" + m.w.toFixed(0) + " <= 338)", m.w <= 375 * 0.9 + 1);
  }
  await page.screenshot({ path: SHOTS + "/" + g.id + ".png" });
  await new Promise(r => setTimeout(r, 3000));
  t(g.id + "  gone by 3.7s", !(await page.evaluate(() => !!document.getElementById("sws-music-toast"))));
  await ctx.close();
}
/* reduced motion: one game is enough, the style path is shared */
{ const { ctx, m } = await boot(GAMES[0], true);
  t("prefers-reduced-motion: no transition, no animation on the toast", m && (m.transition === "all" || m.transition === "none" || m.transition === "") && m.transition !== "opacity" && (!m.animation || m.animation === "none"), m && JSON.stringify({ transition: m.transition, animation: m.animation }));
  await ctx.close(); }
await browser.close();
console.log("\nui gate: " + pass + " ok, " + fail + " failed   shots in " + SHOTS); process.exit(fail ? 1 : 0);
