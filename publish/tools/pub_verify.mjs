/* PUB1 step 2: prove a publisher ZIP. Not "it built" - unzip it, serve it the way a
   network serves it, play a round on a 375x667 phone with real pointer events, and
   assert the things a reviewer or a player would find.

   node publish/tools/pub_verify.mjs publish/dist/<game>-<target>.zip [--keep]

   ASSERTIONS (any failure exits non-zero and names the game):
     A  zero requests to lucidwinds.com or stephenuffugus.github.io
     B  zero 404s or failed loads of the ZIP's own files
     C  the network SDK script tag is present verbatim, with the game id
     D  window.__pubAd exists, is NOT called before the round ends, and IS called at it
     E  zero console errors and zero uncaught page errors
     F  no visible portal exit and no visible Sunbeam or Lucid Winds copy
     G  the recipe reached a round-over screen
     H  no horizontal overflow at 375x667; every tap target measured in rendered px
     I  every game-sized <canvas> is actually rendered (not display:none, not zero size)

   ⛔ I exists because Bloom Breaker and Garden Guard PASSED A-H with their playfield
   hidden: the builder's exit sniffer had read `<canvas id="game">` out of an HTML
   comment and hidden it. The game over card is DOM, so the round still "ended", and
   the marketing pass photographed a black table. A green gate is not a look, and a
   gate that cannot see the game is not a gate.

   ⛔ The ZIP is served from its OWN root, on its own port, with nothing else on the
   origin. That is the whole point: an absolute `/music-unlocks.js` resolves against the
   network's server, not ours, and only a bare root makes that 404 visible. */
import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join, extname, resolve, basename, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SHOTS = join(REPO, "publish", "shots");
import { tmpdir } from "os";
const TMP = process.env.PUB_TMP || join(tmpdir(), "pub1-verify");
const MIME = { ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript", ".css":"text/css",
  ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".svg":"image/svg+xml",
  ".webp":"image/webp", ".json":"application/json", ".mp3":"audio/mpeg", ".ogg":"audio/ogg", ".wav":"audio/wav",
  ".woff":"font/woff", ".woff2":"font/woff2", ".ttf":"font/ttf", ".webmanifest":"application/manifest+json",
  ".glb":"model/gltf-binary", ".mp4":"video/mp4", ".ico":"image/x-icon", ".txt":"text/plain" };

const zipPath = resolve(process.argv[2]);
const keep = process.argv.includes("--keep");
/* --offline blocks every request that is not the ZIP's own origin. For ITERATING on a
   recipe only: the network SDK pulls a full ad stack (IMA, doubleclick, Azerion) on
   every boot and that is slow and non-deterministic. The C assertions read the shipped
   HTML, never the network, so they still hold. A ZIP is signed off with a run WITHOUT
   this flag. */
const offline = process.argv.includes("--offline");
const zipName = basename(zipPath, ".zip");                  // <game>-<target>
const target = zipName.slice(zipName.lastIndexOf("-") + 1);
const slug = zipName.slice(0, zipName.lastIndexOf("-"));
const root = join(TMP, zipName);

rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
mkdirSync(SHOTS, { recursive: true });
execSync(`unzip -q ${JSON.stringify(zipPath)} -d ${JSON.stringify(root)}`);

const PORT = 8900 + (Math.abs([...zipName].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)) % 90);
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let p = join(root, url === "/" ? "index.html" : url);
  if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) {
    res.writeHead(404, { "content-type": "text/plain" }); return res.end("404");
  }
  res.writeHead(200, { "content-type": MIME[extname(p).toLowerCase()] || "application/octet-stream" });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(PORT, "127.0.0.1", r));
const ORIGIN = `http://127.0.0.1:${PORT}`;

const html = readFileSync(join(root, "index.html"), "utf8");
const SDK_URL = target === "gm" ? "https://api.gamemonetize.com/sdk.js"
                                : "https://html5.api.gamedistribution.com/main.min.js";
const OPTS = target === "gm" ? "SDK_OPTIONS" : "GD_OPTIONS";

const fail = [], warn = [], note = {};
const A = (ok, id, msg) => { if (!ok) fail.push(`${id}  ${msg}`); return ok; };

/* C: the SDK, checked in the shipped HTML, not in the running page (a blocked network
   must not be able to turn a missing tag into a pass) */
A(html.includes(SDK_URL), "C1", `SDK url ${SDK_URL} missing from index.html`);
A(html.includes(OPTS), "C2", `window.${OPTS} block missing`);
const gid = (html.match(/"gameId":\s*"([^"]*)"/) || html.match(/gameId:\s*"([^"]*)"/) || [])[1];
note.gameId = gid;
A(!!gid, "C3", "no gameId in the SDK options");

const browser = await puppeteer.launch({ headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--mute-audio"] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });

const errs = [], bad = [], ours = [], offsite = [], browserNoise = [];
if (offline) {
  await page.setRequestInterception(true);
  page.on("request", r => { r.url().startsWith(ORIGIN) || /^(data|blob):/.test(r.url()) ? r.continue() : r.abort(); });
}
page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 240)); });
page.on("pageerror", e => errs.push("PAGEERROR " + String(e).slice(0, 240)));
page.on("request", r => {
  const u = r.url();
  if (/lucidwinds\.com|stephenuffugus\.github\.io/.test(u)) ours.push(u);
  else if (!u.startsWith(ORIGIN) && !/^(data|blob):/.test(u)) offsite.push(u);
});
/* the browser asks for /favicon.ico on its own; nothing in the game references it,
   so a 404 there is the browser's, not a broken asset. Recorded, never a failure. */
const note404 = (u, why) => {
  if (!u.startsWith(ORIGIN)) return;
  const path = u.replace(ORIGIN, "");
  (path === "/favicon.ico" ? browserNoise : bad).push(path + " :: " + why);
};
page.on("requestfailed", r => note404(r.url(), (r.failure() || {}).errorText));
page.on("response", r => { if (r.status() >= 400) note404(r.url(), "HTTP " + r.status()); });

const h = {
  page, ORIGIN,
  wait: (ms) => new Promise(r => setTimeout(r, ms)),
  tap: async (x, y) => { await page.touchscreen.tap(x, y); await h.wait(160); },
  /* ⛔ never el.click() to prove a control works: tap the middle of its rendered box,
     the way a thumb does, so a control covered by an overlay fails like it would. */
  /* ⛔ scroll it into view first, the way a thumb does. Jimothy's How to play card is
     taller than the phone and its Back button sits below the fold: getBoundingClientRect
     still returns a size for it, so a naive check called it visible and the tap landed
     off screen, forever. */
  tapSel: async (sel, idx = 0) => {
    const box = await page.evaluate((s, i) => {
      const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[i];
      if (!e) return null;
      const r0 = e.getBoundingClientRect();
      if (r0.bottom < 0 || r0.top > innerHeight || r0.right < 0 || r0.left > innerWidth) {
        e.scrollIntoView({ block: "center" });
      }
      const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2,
               onScreen: r.top >= -2 && r.bottom <= innerHeight + 2 };
    }, sel, idx);
    if (!box) throw new Error("tapSel: nothing visible for " + sel);
    if (!box.onScreen) throw new Error("tapSel: " + sel + " will not come on screen");
    await page.touchscreen.tap(box.x, box.y); await h.wait(200); return true;
  },
  tapText: async (re) => {
    const box = await page.evaluate((src, flags) => {
      const rx = new RegExp(src, flags);
      const els = [...document.querySelectorAll("button,a,[onclick],[role=button],.btn,div,span,li,label,p,h1,h2,h3,h4,td")]
        .filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
          return r.width > 8 && r.height > 8 && s.visibility !== "hidden" && s.display !== "none" &&
                 +s.opacity > 0.05 && rx.test((e.textContent || "").trim()) &&
                 ![...e.children].some(c => rx.test((c.textContent || "").trim())); });
      if (!els.length) return null;
      const r = els[0].getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: els[0].textContent.trim().slice(0, 40) };
    }, re.source, re.flags.replace("g", ""));
    if (!box) throw new Error("tapText: no visible element matching " + re);
    await page.touchscreen.tap(box.x, box.y); await h.wait(240); return box.t;
  },
  /* a thumb HOLDS a d-pad, it does not tap it 40 times. Several games only move while
     the pad is down, so a recipe without this cannot walk anywhere. */
  hold: async (sel, ms) => {
    const box = await page.evaluate((s) => {
      const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[0];
      if (!e) return null; const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, sel);
    if (!box) throw new Error("hold: nothing visible for " + sel);
    await page.touchscreen.touchStart(box.x, box.y);
    await h.wait(ms);
    await page.touchscreen.touchEnd();
    await h.wait(80);
  },
  holdXY: async (x, y, ms) => {
    await page.touchscreen.touchStart(x, y); await h.wait(ms); await page.touchscreen.touchEnd(); await h.wait(80);
  },
  /* keyboard, for games that document one. A touch that ENDS on a button activates it,
     so a long hold on a d pad can land on a game over card that opened under the finger
     and dismiss the very screen the run was played to reach. A key cannot mis-tap. */
  press: async (key) => { await page.keyboard.press(key); await h.wait(120); },
  holdKey: async (key, ms) => {
    await page.keyboard.down(key); await h.wait(ms); await page.keyboard.up(key); await h.wait(60);
  },
  drag: async (x1, y1, x2, y2, steps = 12) => {
    await page.touchscreen.touchStart(x1, y1);
    for (let i = 1; i <= steps; i++)
      await page.touchscreen.touchMove(x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps);
    await page.touchscreen.touchEnd(); await h.wait(160);
  },
  adCalls: () => page.evaluate(() => window.__pubAdCalls | 0),
  shot: (tag) => page.screenshot({ path: join(SHOTS, `${zipName}-${tag}.png`) })
};

let recipe = null;
const rpath = join(REPO, "publish", "recipes", slug + ".mjs");
if (existsSync(rpath)) {
  /* ⛔ A recipe that reaches the win screen by CALLING the win function has proved
     nothing: __pubAd is hooked to that function, so the assertion would pass on a game
     no thumb could ever finish. A round is played with pointer events or it is not
     played. This lint is the guard, and it fails the ZIP, not the recipe. */
  const rsrc = readFileSync(rpath, "utf8");
  const banned = [/\bwindow\.__pubAd\b/, /_sbCapEarn/, /\.click\s*\(\s*\)/, /dispatchEvent/,
    /\b(gameOver|endRun|endRound|endGame|winLevel|winGame|showResults|showResult|completeLevel|showWin)\s*\(/];
  /* the lint reads the recipe's CODE, not its header comment and not its meta block:
     a recipe whose meta says hook "_sbCapEarn" is describing the build, not calling it */
  const body = rsrc.replace(/^\s*\/\*[\s\S]*?\*\//, "").replace(/export const meta[\s\S]*?\};?/, "");
  const hit = banned.find(rx => rx.test(body));
  if (hit) fail.push("G1  recipe drives the game by calling its own code (" + hit + "), not by touch");
  if (!/h\.(tap|tapSel|tapText|drag|wait)/.test(rsrc)) fail.push("G2  recipe never touches the screen");
  recipe = await import(pathToFileURL(rpath).href);
}

let reached = false, adAtEnd = 0, adBefore = 0;
try {
  /* domcontentloaded, not networkidle2: with the real SDK in the page the network never
     really goes quiet (the ad stack keeps beaconing), so networkidle2 spent thirty
     seconds a run waiting for something that was never going to happen. The request and
     console listeners are attached before the navigation either way, so nothing is
     missed by starting the clock earlier. */
  await page.goto(ORIGIN + "/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await h.wait(3000);
  await h.shot("1boot");
  A(await page.evaluate(() => typeof window.__pubAd === "function"), "D1", "window.__pubAd is not defined");
  adBefore = await h.adCalls();

  if (recipe && recipe.play) {
    await recipe.play(page, h);
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) {
      if (await recipe.isRoundOver(page)) { reached = true; break; }
      await h.wait(400);
    }
    if (!reached) reached = await recipe.isRoundOver(page);
    await h.wait(700);
    adAtEnd = await h.adCalls();
    await h.shot("3end");
  } else {
    warn.push("no recipe at publish/recipes/" + slug + ".mjs, round end not driven");
  }
} catch (e) {
  fail.push("G0  recipe threw: " + String(e).slice(0, 300));
  try { await h.shot("3end"); } catch {}
}

/* F + H: what is on the screen at the end, measured, not assumed */
const seen = await page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; };
  const text = [...document.querySelectorAll("body *")].filter(vis)
    .filter(e => ![...e.children].length).map(e => (e.textContent || "").trim()).filter(Boolean);
  const tap = [...document.querySelectorAll('button,[onclick],a,[role="button"],input,select,.btn,.key')].filter(vis);
  return {
    exit: text.filter(t => /sky wolf studio arcade|all sky wolf games|all games|^[◄←<\s]*arcade\s*$|back to sky wolf/i.test(t)),
    brand: text.filter(t => /lucid winds/i.test(t)),
    /* F1 only sees the END screen. Blooming Words keeps its exit in a menu that is closed
       by then, so it passed with "← All Sky Wolf games" alive one tap away. Every element
       whose OWN text is a portal exit must ITSELF be display:none (our CSS hides the
       button, not its menu), whatever screen is up. */
    exitAnywhere: [...document.querySelectorAll("button,a,[onclick],[role=button],.btn,div,span,li")]
      .filter(e => ![...e.children].some(c => /sky wolf|arcade|all games/i.test(c.textContent || "")))
      .filter(e => /sky wolf studio arcade|all sky wolf games|all games|^[◄←<\s]*arcade\s*$|back to sky wolf/i.test((e.textContent || "").trim()))
      .filter(e => getComputedStyle(e).display !== "none" && !(e.parentElement && e.parentElement.tagName === "BUTTON" && getComputedStyle(e.parentElement).display === "none"))
      .map(e => (e.tagName + "#" + (e.id || e.className)) + " " + (e.textContent || "").trim().slice(0, 30)),
    econ: text.filter(t => /sunbeam|\bdew (?:drops?|currency)\b/i.test(t)),   /* not a bare "dew": the game is CALLED Dew Snip */
    music: !!document.getElementById("sws-music-art") || /unlocked a song/i.test(document.body.innerText || ""),
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    hiddenCanvas: (() => {
      /* the PLAYFIELD is the largest canvas by attribute size; a small icon canvas inside
         a closed menu is legitimately 0x0 and must not fail the build */
      const cs = [...document.querySelectorAll("canvas")].filter(c => c.width >= 100 && c.height >= 100);
      const big = cs.reduce((a, c) => (!a || c.width * c.height > a.width * a.height) ? c : a, null);
      return cs.filter(c => { const r = c.getBoundingClientRect(), pv = c.parentElement && c.parentElement.getBoundingClientRect();
        const selfHidden = getComputedStyle(c).display === "none" && pv && pv.width > 0 && pv.height > 0;
        return selfHidden || (c === big && r.width === 0 && r.height === 0); })
        .map(c => "#" + (c.id || c.className || "canvas") + " " + c.width + "x" + c.height + " display:" + getComputedStyle(c).display);
    })(),
    under48: tap.map(e => { const r = e.getBoundingClientRect();
      return { id: e.id || e.className || e.tagName, w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter(t => t.w < 48 || t.h < 48),
    title: document.title
  };
});

A(ours.length === 0, "A", `${ours.length} request(s) to our own domains: ${[...new Set(ours)].slice(0,3).join(" ")}`);
A(bad.length === 0, "B", `${bad.length} own-file failure(s): ${[...new Set(bad)].slice(0, 4).join(" | ")}`);
/* the browser's own favicon 404 shows up here too, and in --offline every blocked
   offsite request logs one. Neither is the game's. */
/* the ad stack's own noise is not the game's: GameDistribution's stack tried to frame
   google.com inside a report-only CSP and Chrome logged it as a console error. It is
   non-deterministic (Picnic Panic gd failed on it once in twelve runs) and it is theirs. */
const realErrs = errs.filter(e => !(browserNoise.length && /status of 404/.test(e)))
                     .filter(e => !(offline && /Failed to load resource|ERR_FAILED|ERR_BLOCKED/.test(e)))
                     .filter(e => !/report-only Content Security Policy/i.test(e));
A(realErrs.length === 0, "E", `${realErrs.length} console error(s): ${[...new Set(realErrs)].slice(0, 3).join(" | ")}`);
A(seen.exit.length === 0, "F1", `portal exit still visible: ${JSON.stringify(seen.exit.slice(0, 3))}`);
A(seen.exitAnywhere.length === 0, "F1b", `portal exit alive on a closed screen: ${JSON.stringify(seen.exitAnywhere.slice(0, 3))}`);
A(seen.brand.length === 0, "F2", `Lucid Winds copy on screen: ${JSON.stringify(seen.brand.slice(0, 3))}`);
if (seen.econ.length) warn.push(`economy words still in visible copy: ${JSON.stringify(seen.econ.slice(0, 3))}`);
A(!seen.music, "F3", "the music unlock card is in the build");
A(!/lucid winds|sky wolf/i.test(seen.title), "F4", `brand still in <title>: ${seen.title}`);
A(!seen.overflowX, "H1", "the page scrolls sideways at 375x667");
A(seen.hiddenCanvas.length === 0, "I", `game canvas hidden in the build: ${seen.hiddenCanvas.join(", ")}`);
if (recipe) {
  A(reached, "G", "the recipe did not reach a round-over screen");
  A(adBefore === 0, "D2", `__pubAd fired ${adBefore} time(s) BEFORE the round ended`);
  A(adAtEnd >= 1, "D3", "__pubAd was never called at the round end");
}
if (seen.under48.length) warn.push(`${seen.under48.length} tap target(s) under 48px: ` +
  seen.under48.slice(0, 4).map(t => `${t.id} ${t.w}x${t.h}`).join(", "));
if (offsite.length) note.offsite = [...new Set(offsite.map(u => u.split("/").slice(0, 3).join("/")))];

await browser.close();
server.close();
if (!keep) rmSync(root, { recursive: true, force: true });

const out = {
  zip: zipPath.replace(REPO + "/", ""), slug, target,
  zipKB: Math.round(statSync(zipPath).size / 1024),
  gameId: note.gameId, hook: recipe && recipe.meta ? recipe.meta.hook : null,
  roundEndReached: reached, adCallsBefore: adBefore, adCallsAtEnd: adAtEnd,
  offline, offsiteHosts: note.offsite || [], browserNoise, warn, fail
};
writeFileSync(join(SHOTS, zipName + ".json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
console.log(fail.length ? `\nFAIL ${zipName}: ${fail.length} assertion(s)` : `\nPASS ${zipName}  ${out.zipKB} KB  ad at round end: ${adAtEnd}`);
process.exit(fail.length ? 1 : 0);
