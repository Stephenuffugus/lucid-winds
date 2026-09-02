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
  await new Promise(r => setTimeout(r, 2200));   // the chip places ~900ms after load, once the HUD exists
  /* P11: measure the CARD and the CHIP on the real page before dismissing the card */
  const moment = await page.evaluate(() => {
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; };
    const card = document.getElementById("sws-music-card"), chip = document.getElementById("sws-music-chip"), shellBtn = document.getElementById("shell-music-btn");
    const listen = document.getElementById("sws-music-listen"), later = document.getElementById("sws-music-later");
    /* a control that covers 90%+ of the viewport is a backdrop (a full screen canvas), which the corner search rightly
       looks through; only smaller controls count as collisions */
    const area = innerWidth * innerHeight;
    const controls = [...document.querySelectorAll("button,a,[role=button],canvas")].filter(e => { const r = e.getBoundingClientRect(); return e !== chip && !(card && card.contains(e)) && r.width > 4 && r.width * r.height < area * 0.9; });
    const hits = (el) => { if (!el) return []; const a = rect(el); return controls.filter(c => { const b = rect(c); return a.x < b.r && a.r > b.x && a.y < b.b && a.b > b.y; }).map(c => (c.id || c.tagName) + ":" + (c.textContent || "").trim().slice(0, 12)); };
    return { card: !!card, cardText: card ? card.textContent : "", cardRect: card ? rect(card) : null, listen: listen ? rect(listen) : null, later: later ? rect(later) : null,
      chip: chip ? rect(chip) : null, chipHits: hits(chip), shellBtn: !!shellBtn, chipText: chip ? chip.textContent : "" };
  });
  if (moment.card) await page.screenshot({ path: SHOTS + "/" + g.id + "-card.png" });
  await page.evaluate(() => { const b = document.getElementById("sws-music-later"); if (b) b.click(); });
  await new Promise(r => setTimeout(r, 150));
  const before = await page.evaluate(() => !!document.getElementById("sws-music-toast"));
  /* a deliberate Tier 1 grant makes a toast (mid round style) so its geometry can still be measured */
  await page.evaluate(() => { try { const c = window.LW_MUSIC_CATALOG; const sh = c.shelves.find(s => s.games.includes(window.SWSMusic.id())); if (sh) window.SWSMusic.unlock(sh.slug, sh.tracks[sh.tracks.length - 1].id); } catch (e) {} });
  await new Promise(r => setTimeout(r, 120));
  const m = await page.evaluate(() => {
    const el = document.getElementById("sws-music-toast"); if (!el) return null;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { text: el.textContent, pe: cs.pointerEvents, pos: cs.position, h: r.height, top: r.top, w: r.width, cx: r.left + r.width / 2, transition: cs.transitionProperty, animation: cs.animationName };
  });
  return { ctx, page, m, before, moment };
}

for (const g of GAMES) {
  const { ctx, page, m, before, moment } = await boot(g, false);
  if (g.shelf) {
    t(g.id + "  the CARD is up at boot", moment.card);
    t(g.id + "  card copy: Congratulations + no dash of any kind", /Congratulations/.test(moment.cardText) && !/[-–—]/.test(moment.cardText));
    t(g.id + "  card sits inside the viewport at the bottom (" + (moment.cardRect ? Math.round(moment.cardRect.b) : "?") + ")", moment.cardRect && moment.cardRect.b <= 667.5 && moment.cardRect.y >= 0 && moment.cardRect.w >= 374);
    t(g.id + "  Listen now and Later are each 48px+ tall, measured (" + (moment.listen ? Math.round(moment.listen.h) : "?") + "/" + (moment.later ? Math.round(moment.later.h) : "?") + ")", moment.listen && moment.later && moment.listen.h >= 48 && moment.later.h >= 48);
    t(g.id + "  no toast before the card is dismissed", !before);
  }
  if (moment.chip) {
    t(g.id + "  chip 48px+ tall and 96px+ wide, measured (" + Math.round(moment.chip.w) + "x" + Math.round(moment.chip.h) + ")", moment.chip.h >= 48 && moment.chip.w >= 96);
    t(g.id + "  chip not in the bottom right (feedback fab) corner", !(moment.chip.r > 375 - 60 && moment.chip.b > 667 - 60));
    t(g.id + "  chip overlaps no game control", moment.chipHits.length === 0, moment.chipHits.join(", "));
    t(g.id + "  chip says Music, no dash", /Music/.test(moment.chipText) && !/[-–—]/.test(moment.chipText));
  } else t(g.id + "  no chip only because the shell has its own button", moment.shellBtn);
  if (!g.shelf) { t(g.id + "  no shelf: no toast at all", !m); await page.screenshot({ path: SHOTS + "/" + g.id + ".png" }); await ctx.close(); continue; }
  t(g.id + "  a mid round grant toasts (after the card was dismissed)", !!m);
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
