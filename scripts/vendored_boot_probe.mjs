#!/usr/bin/env node
/* DOES EACH VENDORED GAME ACTUALLY BOOT AT ITS NEW SAME ORIGIN URL, AND CAN THE
   PLAYER SEE A WAY OUT?
   ---------------------------------------------------------------------------
     python3 -m http.server 8951 &        (from the repo root)
     node scripts/vendored_boot_probe.mjs
     node scripts/vendored_boot_probe.mjs --selftest

   The static audit says the exit EXISTS in the source. That is not the same as
   the player being able to see it, and moving a game to a new url is exactly
   where an absolute path quietly 404s. So this opens the real url and asks:

     1. did anything throw, or fail to load (a 404 on a subresource is a finding,
        not a warning: it is how a moved game breaks)
     2. is window.SWS_EXIT defined by the time the page settles
     3. is there a VISIBLE control the player can press to leave, measured as
        RENDERED pixels via elementFromPoint at its centre, never el.click()
     4. what does it look like — a shot is written for every game, because a
        green check is not a look

   ⛔ Touch emulation is mandatory. A screenshot taken without isMobile+hasTouch
   photographs the desktop branch of every `(pointer:coarse)` media query, and
   that has already produced one reported bug that did not exist.
   ⚠️ Headless Chrome here has NO EMOJI FONT. Empty boxes are the container, not
   the game.                                                                   */

import puppeteer from "puppeteer";
import { mkdirSync, writeFileSync, existsSync } from "fs";

const BASE = process.env.LW_URL || "http://127.0.0.1:8951";
const OUT = process.env.SHOT_DIR ||
  "/tmp/claude-1000/-workspaces-lucid-winds/fcd5c63c-d7b6-4b77-ad07-cf78b7c31f3a/scratchpad/vendored-shots";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PAGES = [
  ["tomato-man",         "/satellites/tomato-man/"],
  ["abduct-a-chameleon", "/satellites/abduct-a-chameleon/"],
  ["abduct-3d",          "/satellites/abduct-a-chameleon/abduct-3d.html"],
  ["glyph-forge",        "/satellites/glyph-forge/"],
  ["litter-bug",         "/satellites/litter-bug/"],
  ["sweet-spot",         "/satellites/sweet-spot/"],
  ["tarot-run",          "/satellites/tarot-run/"],
  ["sixfold",            "/satellites/sixfold/"],
  ["letter-launch",      "/satellites/letter-launch/"],
  ["skitterlings",       "/satellites/skitterlings/"],
  ["wild-wardens",       "/satellites/wild-wardens/"],
  ["tally",              "/satellites/tally/"],
];

/* A control counts only if the point a thumb would land on actually hits it. */
const VISIBLE_EXIT = `(() => {
  const words = /back|exit|arcade|portal|sky wolf|quit|leave|home|◄|←/i;
  const out = [];
  for (const el of document.querySelectorAll('button,a,[role="button"],[onclick],.btn')) {
    const t = ((el.textContent||'') + ' ' + (el.getAttribute('aria-label')||'') + ' ' + (el.id||'')).trim();
    if (!words.test(t)) continue;
    const r = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    if (r.width < 6 || r.height < 6) continue;
    if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) continue;
    const x = r.left + r.width/2, y = r.top + r.height/2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
    const hit = document.elementFromPoint(x, y);
    if (!hit || !(el === hit || el.contains(hit) || hit.contains(el))) continue;
    out.push({ text: t.slice(0,40).replace(/\\s+/g,' '), w: Math.round(r.width), h: Math.round(r.height) });
  }
  return out;
})()`;

async function probe(browser, id, urlPath) {
  const page = await browser.newPage();
  await page.emulate({
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Mobile Safari/537.36",
  });
  const errors = [], missing = [];
  page.on("pageerror", e => errors.push(String(e).split("\n")[0].slice(0, 160)));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 160)); });
  page.on("requestfailed", r => missing.push(r.url().replace(BASE, "") + " (" + (r.failure()?.errorText||"?") + ")"));
  page.on("response", r => { if (r.status() >= 400) missing.push(r.url().replace(BASE, "") + " (" + r.status() + ")"); });

  let status = 0;
  try {
    const resp = await page.goto(BASE + urlPath, { waitUntil: "domcontentloaded", timeout: 45000 });
    status = resp ? resp.status() : 0;
  } catch (e) { errors.push("navigation: " + e.message.split("\n")[0]); }

  await sleep(3500);                       /* settle; never networkidle on a streaming page */
  let exits = [], hasFn = false, title = "", dead = null, textLen = 0;
  try {
    hasFn = await page.evaluate("typeof window.SWS_EXIT === 'function'");
    exits  = await page.evaluate(VISIBLE_EXIT);
    title  = await page.title();
    /* ⛔ Status 200 + no console errors + an exit button is THREE green signals
       on a page reading "Unmatched Route - Page could not be found". Wild
       Wardens shipped exactly that. A boot probe that cannot see a dead app
       screen is not a boot probe. */
    const body = await page.evaluate("(document.body && document.body.innerText || '').slice(0, 4000)");
    textLen = body.trim().length;
    const m = body.match(/unmatched route|page could not be found|page not found|cannot (?:GET|find)|404 not found|application error|failed to load|something went wrong/i);
    if (m) dead = m[0];
    if (!dead && textLen < 2 && !(await page.evaluate("!!document.querySelector('canvas,svg,img')"))) dead = "blank page, no text and no canvas";
  } catch (e) { errors.push("evaluate: " + e.message.split("\n")[0]); }

  mkdirSync(OUT, { recursive: true });
  try { await page.screenshot({ path: `${OUT}/${id}.png` }); } catch (e) { errors.push("shot: " + e.message); }
  await page.close();

  /* A 404 on an analytics beacon is noise; a 404 on the game's own file is the finding. */
  const real = missing.filter(u => !/google|gtag|analytics|fonts\.|firebase|onrender|vercel|favicon/i.test(u));
  return { id, urlPath, status, title, hasFn, exits, dead, textLen, errors: [...new Set(errors)], missing: [...new Set(real)] };
}

async function selftest() {
  let pass = 0, fail = 0;
  const t = (n, ok) => ok ? (pass++, console.log("  ok   " + n)) : (fail++, console.log("  FAIL " + n));
  const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.emulate({ viewport: { width: 390, height: 844, isMobile: true, hasTouch: true }, userAgent: "test" });

  await p.setContent(`<body style="margin:0"><button id="a" style="width:100px;height:50px">Back</button></body>`);
  t("finds a visible exit", (await p.evaluate(VISIBLE_EXIT)).length === 1);

  await p.setContent(`<body style="margin:0"><button id="a" style="width:100px;height:50px;display:none">Back</button></body>`);
  t("a hidden exit does NOT count", (await p.evaluate(VISIBLE_EXIT)).length === 0);

  await p.setContent(`<body style="margin:0"><button id="a" style="position:fixed;left:0;top:0;width:100px;height:50px">Back</button>
    <div style="position:fixed;inset:0;background:#000;z-index:9"></div></body>`);
  t("an exit COVERED by an overlay does NOT count", (await p.evaluate(VISIBLE_EXIT)).length === 0);

  await p.setContent(`<body style="margin:0"><button style="width:100px;height:50px">Play</button></body>`);
  t("an unrelated button is not mistaken for an exit", (await p.evaluate(VISIBLE_EXIT)).length === 0);

  await p.setContent(`<body><script>window.matchMedia('(pointer:coarse)').matches&&(document.title='touch')</script></body>`);
  t("touch emulation is really on", (await p.title()) === "touch");

  const DEAD = /unmatched route|page could not be found|page not found|cannot (?:GET|find)|404 not found|application error|failed to load|something went wrong/i;
  t("recognises the Expo dead screen", DEAD.test("Unmatched Route Page could not be found."));
  t("recognises a bare 404 screen",    DEAD.test("404 Not Found"));
  t("does not fire on ordinary game copy",
    !DEAD.test("Tap a number, then an operator. Hit the target to bank it.") &&
    !DEAD.test("Find every way to clear the level"));

  await b.close();
  console.log(`\nselftest: ${pass} ok, ${fail} failed`);
  return fail;
}

if (process.argv.includes("--selftest")) process.exit(await selftest() ? 1 : 0);

const only = process.argv.slice(2).filter(a => !a.startsWith("--"));
const list = only.length ? PAGES.filter(p => only.includes(p[0])) : PAGES;
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
let bad = 0;
for (const [id, u] of list) {
  const r = await probe(browser, id, u);
  const ok = r.status === 200 && !r.errors.length && !r.missing.length && !r.dead;
  if (!ok) bad++;
  console.log(`${ok ? "OK   " : "LOOK "} ${id.padEnd(20)} ${String(r.status).padEnd(4)} exitFn=${r.hasFn ? "y" : "n"} visibleExits=${r.exits.length}  "${r.title.slice(0,42)}"`);
  if (r.dead) console.log(`        DEAD    the page says: "${r.dead}"`);
  if (r.exits.length) console.log(`        exit: ${r.exits.map(e => `"${e.text}" ${e.w}x${e.h}`).join(" | ").slice(0,150)}`);
  else console.log(`        note: no exit on the BOOT screen (may sit behind a modal or on the menu) - read the shot`);
  for (const e of r.errors.slice(0, 4))  console.log(`        ERROR   ${e}`);
  for (const m of r.missing.slice(0, 6)) console.log(`        MISSING ${m}`);
}
await browser.close();
console.log(`\nshots: ${OUT}`);
process.exit(bad ? 1 : 0);
