/* CrazyGames check, on top of pub_verify.mjs: the ZIP inside an IFRAME, the way their
   site frames it, with their SDK either blocked or replaced by a local stub that writes
   down every call. Nothing leaves the machine: every request that is not the ZIP's own
   folder is aborted and recorded, and the SDK request is answered locally.

   node publish/tools/cg_check.mjs publish/dist/<game>-crazygames.zip <blocked|stub|stub-error> <W>x<H> [--shot <png>]

   ASSERTIONS
     P  the recipe reaches the round-over screen inside the iframe
     E  zero page errors and zero console errors from the game's frame
     N  no request to any host but the game's own folder and sdk.crazygames.com
     L  no <a href> in the page that leads off the game's own folder
     S  (stub) init is called first, and nothing else reaches the SDK before it resolves
     S  (stub) gameplayStart and gameplayStop alternate, the first is a start
     S  (stub) requestAd only while gameplay is stopped, and only at the round end
     S  (stub) audio suspended while the ad plays, the blocker gone and audio back after,
        both when the ad finishes (stub) and when it fails (stub-error)
   The recipe is the same one pub_verify plays, driven inside the frame. */
import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync, rmSync } from "fs";
import { execSync } from "child_process";
import { join, extname, resolve, basename, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const zipPath = resolve(process.argv[2]);
const mode = process.argv[3] || "stub";
const [VW, VH] = (process.argv[4] || "800x600").split("x").map(Number);
const shotAt = process.argv.includes("--shot") ? process.argv[process.argv.indexOf("--shot") + 1] : null;
const zipName = basename(zipPath, ".zip");
const slug = zipName.replace(/-crazygames$/, "");
const root = join("/tmp/claude-1000/crazygames", `${zipName}-${mode}-${VW}x${VH}`);
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
execSync(`unzip -q ${JSON.stringify(zipPath)} -d ${JSON.stringify(root)}`);

const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png",
  ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".svg":"image/svg+xml", ".webp":"image/webp",
  ".json":"application/json", ".mp3":"audio/mpeg", ".ogg":"audio/ogg", ".wav":"audio/wav",
  ".woff":"font/woff", ".woff2":"font/woff2", ".ttf":"font/ttf", ".ico":"image/x-icon" };
const PORT = 9300 + Math.floor(Math.random() * 400);
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const p = join(root, url === "/" ? "index.html" : url);
  if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": MIME[extname(p).toLowerCase()] || "application/octet-stream" });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(PORT, "127.0.0.1", r));
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SDK = "https://sdk.crazygames.com/crazygames-sdk-v3.js";

/* the stub: the v3 surface the adapter touches, every call logged with a clock */
const STUB = `(function(){
  var log = window.__cgLog = [], ready = false, playing = false, t0 = Date.now();
  var fail = ${mode === "stub-error" ? "true" : "false"};
  function rec(n, extra){ log.push({ n: n, t: Date.now() - t0, ready: ready, x: extra || null }); }
  function guard(n){ rec(n); }
  window.CrazyGames = { SDK: {
    environment: "uninitialized",
    init: function(){ rec("init"); var S = this; return new Promise(function(r){ setTimeout(function(){ S.environment = "crazygames"; ready = true; rec("init:resolved"); r(); }, 150); }); },
    game: {
      settings: { muteAudio: false, disableChat: false },
      addSettingsChangeListener: function(){ rec("addSettingsChangeListener"); },
      gameplayStart: function(){ guard("gameplayStart"); },
      gameplayStop: function(){ guard("gameplayStop"); },
      loadingStart: function(){ guard("loadingStart"); },
      loadingStop: function(){ guard("loadingStop"); },
      happytime: function(){ guard("happytime"); }
    },
    ad: {
      requestAd: function(type, cb){
        rec("requestAd:" + type);
        setTimeout(function(){
          if (fail) { rec("adError"); cb && cb.adError && cb.adError({ code: "adblock", message: "stub" }); after(); return; }
          rec("adStarted"); cb && cb.adStarted && cb.adStarted();
          setTimeout(function(){
            var c = (window.__cgCtxs || []).map(function(x){ return x.state; });
            rec("during", { ctx: c, blocker: !!document.querySelector('div[aria-hidden="true"][style*="2147483647"]') });
            rec("adFinished"); cb && cb.adFinished && cb.adFinished(); after();
          }, 600);
        }, 200);
        function after(){ setTimeout(function(){
          var c = (window.__cgCtxs || []).map(function(x){ return x.state; });
          rec("after", { ctx: c, blocker: !!document.querySelector('div[aria-hidden="true"][style*="2147483647"]') });
        }, 400); }
      },
      hasAdblock: function(){ return Promise.resolve(false); }
    }
  } };
})();`;

const browser = await puppeteer.launch({ headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage();
await page.setViewport({ width: VW, height: VH, deviceScaleFactor: 1, isMobile: VW < 500, hasTouch: true });
const errs = [], offsite = [];
await page.setRequestInterception(true);
page.on("request", r => {
  const u = r.url();
  if (u.startsWith(ORIGIN) || /^(data|blob|about):/.test(u)) return r.continue();
  if (u.split("?")[0] === SDK) {
    if (mode === "blocked") return r.abort("blockedbyclient");
    return r.respond({ status: 200, contentType: "text/javascript", body: STUB });
  }
  offsite.push(u); r.abort();
});
page.on("pageerror", e => errs.push("PAGEERROR " + String(e).slice(0, 200)));
page.on("console", m => { if (m.type() === "error" && !/favicon|ERR_BLOCKED_BY_CLIENT|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });

/* the frame fills the viewport at 0,0, so the recipe's screen coordinates are the
   frame's coordinates */
await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#111;overflow:hidden">
<iframe id="g" src="${ORIGIN}/" style="position:fixed;left:0;top:0;width:${VW}px;height:${VH}px;border:0"
 allow="autoplay; fullscreen" ></iframe></body></html>`);
await new Promise(r => setTimeout(r, 400));
const frame = page.frames().find(f => f.url().startsWith(ORIGIN));
const fpage = { evaluate: (...a) => frame.evaluate(...a), touchscreen: page.touchscreen, keyboard: page.keyboard };
const h = {
  wait: ms => new Promise(r => setTimeout(r, ms)),
  tap: async (x, y) => { await page.touchscreen.tap(Math.min(x, VW - 10), Math.min(y, VH - 10)); await h.wait(160); },
  tapSel: async (sel, idx = 0) => {
    const b = await frame.evaluate((s, i) => { const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[i];
      if (!e) return null; e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel, idx);
    if (!b) throw new Error("tapSel: nothing visible for " + sel);
    await page.touchscreen.tap(b.x, b.y); await h.wait(200); return true;
  },
  tapText: async re => {
    const b = await frame.evaluate((src, flags) => { const rx = new RegExp(src, flags);
      const els = [...document.querySelectorAll("button,a,[onclick],[role=button],.btn,div,span,li,label,p,h1,h2,h3,h4,td")]
        .filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
          return r.width > 8 && r.height > 8 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05 &&
            rx.test((e.textContent || "").trim()) && ![...e.children].some(c => rx.test((c.textContent || "").trim())); });
      if (!els.length) return null; const r = els[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
      re.source, re.flags.replace("g", ""));
    if (!b) throw new Error("tapText: no visible element matching " + re);
    await page.touchscreen.tap(b.x, b.y); await h.wait(240); return true;
  },
  press: async k => { await page.keyboard.press(k); await h.wait(120); },
  holdKey: async (k, ms) => { await page.keyboard.down(k); await h.wait(ms); await page.keyboard.up(k); },
  drag: async (x1, y1, x2, y2, steps = 12) => { await page.touchscreen.touchStart(x1, y1);
    for (let i = 1; i <= steps; i++) await page.touchscreen.touchMove(x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps);
    await page.touchscreen.touchEnd(); await h.wait(160); },
  adCalls: () => frame.evaluate(() => window.__pubAdCalls | 0)
};

const fail = [];
const recipe = await import(pathToFileURL(join(REPO, "publish", "recipes", slug + ".mjs")).href);
let reached = false, shotTaken = false, adBeforeEnd = -1;
try {
  await frame.waitForFunction(() => document.readyState === "complete", { timeout: 30000 });
  await h.wait(2500);
  const shotTimer = shotAt ? setTimeout(async () => { try { await page.screenshot({ path: shotAt }); shotTaken = true; } catch {} }, 7000) : null;
  const playP = recipe.play(fpage, h);
  await playP;
  if (shotTimer && !shotTaken) { clearTimeout(shotTimer); }
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) { if (await recipe.isRoundOver(fpage)) { reached = true; break; } await h.wait(400); }
  await h.wait(2000);   /* let the stub's ad run to its end */
} catch (e) { fail.push("P0  recipe threw: " + String(e).slice(0, 200)); }
if (!reached) fail.push("P   the recipe never reached the round-over screen in the iframe");

const links = await frame.evaluate((o) => [...document.querySelectorAll("a[href]")].map(a => a.href)
  .filter(u => !u.startsWith(o) && !/^(javascript:|#|data:|blob:)/.test(u)), ORIGIN);
if (links.length) fail.push("L   links lead out: " + links.slice(0, 3).join(" "));
if (offsite.length) fail.push("N   requests left for: " + [...new Set(offsite.map(u => u.split("/").slice(0, 3).join("/")))].join(" "));
if (errs.length) fail.push("E   " + errs.length + " error(s): " + [...new Set(errs)].slice(0, 3).join(" | "));
const adCalls = await h.adCalls();
if (adCalls < 1) fail.push("P   __pubAd never called at the round end");

let log = [];
if (mode !== "blocked") {
  log = await frame.evaluate(() => window.__cgLog || []);
  const names = log.map(e => e.n);
  if (names[0] !== "init") fail.push("S1  the first SDK call is not init: " + names[0]);
  const early = log.filter(e => !e.ready && e.n !== "init");
  if (early.length) fail.push("S1b calls before init resolved: " + early.map(e => e.n).join(","));
  let playing = false, seenStart = false;
  for (const e of log) {
    if (e.n === "gameplayStart") { if (playing) fail.push("S2  gameplayStart twice at " + e.t); playing = true; seenStart = true; }
    if (e.n === "gameplayStop") { if (!playing) fail.push("S2  gameplayStop without a start at " + e.t); playing = false; }
    if (e.n.startsWith("requestAd")) {
      if (playing) fail.push("S3  requestAd during gameplay at " + e.t);
      if (e.n !== "requestAd:midgame") fail.push("S3b unexpected ad type " + e.n);
    }
    if (e.n === "during" && (e.x.ctx.some(s => s === "running") || !e.x.blocker))
      fail.push("S4  during the ad: audio " + JSON.stringify(e.x.ctx) + " blocker " + e.x.blocker);
    if (e.n === "after" && (e.x.blocker || e.x.ctx.some(s => s === "suspended")))
      fail.push("S5  after the ad: audio " + JSON.stringify(e.x.ctx) + " blocker " + e.x.blocker);
  }
  if (!seenStart) fail.push("S2b gameplayStart never called");
  if (!names.some(n => n.startsWith("requestAd"))) fail.push("S3c no ad was requested at the round end");
  if (!names.includes("after")) fail.push("S5b the ad never finished in the log");
}
await browser.close(); server.close();
rmSync(root, { recursive: true, force: true });
const order = log.map(e => e.n + (e.x ? JSON.stringify(e.x) : "")).join(" > ");
console.log(JSON.stringify({ zip: zipName, mode, size: `${VW}x${VH}`, reached, adCalls, shot: shotTaken ? shotAt : null,
  offsite: [...new Set(offsite)], order, fail }, null, 1));
console.log(fail.length ? `FAIL ${zipName} ${mode} ${VW}x${VH}` : `PASS ${zipName} ${mode} ${VW}x${VH}`);
process.exit(fail.length ? 1 : 0);
