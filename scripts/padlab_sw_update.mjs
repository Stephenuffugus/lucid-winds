#!/usr/bin/env node
/* Does a returning PadLab user actually GET the update?

   This fleet has been black screened by exactly this before: a service worker
   holding an old shell, a host that serves day old HTML, and a bare sw.js url
   the edge pins for a week. Bumping SHELL_VERSION and the registration query
   is the fix, but bumping them is not evidence that it works.

   So: serve the OLD build, let its worker install and take control the way a
   real visit does, then replace the files in place on the same origin, the way
   a deploy does, reload, and check the player is looking at the new app and
   not a cached ghost of the old one.

   Runs its own server on port 8962 and swaps the files itself:
     node scripts/padlab_sw_update.mjs */
import puppeteer from "puppeteer";
import { mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync, existsSync } from "fs";
import { execSync } from "child_process";
import { createServer } from "http";
import { extname, join } from "path";

const DIR = "/tmp/claude-1000/-workspaces-lucid-winds/f9cbdde3-a22e-4660-b039-acdd48a98f2a/scratchpad/swtest";
const PORT = 8962;
const BASE = "http://127.0.0.1:" + PORT + "/";
const PRE_MARBLE = "914dda45^";      // the commit before the marble merge

let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (existsSync(DIR)) rmSync(DIR, { recursive: true });
mkdirSync(DIR, { recursive: true });
for (const f of ["manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
  try { copyFileSync("padlab/" + f, join(DIR, f)); } catch (e) {}
}
// dev-gate.js lives at the repo root on the real site
try { copyFileSync("dev-gate.js", join(DIR, "dev-gate.js")); } catch (e) {}

function installOld() {
  writeFileSync(join(DIR, "index.html"), execSync("git show " + PRE_MARBLE + ":padlab/index.html"));
  writeFileSync(join(DIR, "sw.js"), execSync("git show " + PRE_MARBLE + ":padlab/sw.js"));
}
function installNew() {
  copyFileSync("padlab/index.html", join(DIR, "index.html"));
  copyFileSync("padlab/sw.js", join(DIR, "sw.js"));
}

/* A deliberately unhelpful host: it answers with the same
   stale-while-revalidate style caching headers the real one uses, so a bare
   fetch is allowed to come back old. */
const TYPES = { ".html": "text/html", ".js": "application/javascript",
  ".png": "image/png", ".webmanifest": "application/manifest+json" };
let pinnedOldSw = null;   // set to the old sw.js bytes to imitate an edge that
                          // has pinned that exact url for a week
const server = createServer((req, res) => {
  const [p0, q] = req.url.split("?");
  let p = p0 === "/" ? "/index.html" : p0;
  /* The host edge pins a given sw.js url for seven days. A bumped ?v= is a
     DIFFERENT url and so escapes the pin; the old one keeps serving old bytes
     no matter what is on disk. That is the whole reason for the lockstep bump,
     and it is imitated here so the reason can be demonstrated rather than
     asserted. */
  if (pinnedOldSw && p === "/sw.js" && (q || "") === "v=9") {
    res.writeHead(200, { "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=604800" });
    res.end(pinnedOldSw);
    return;
  }
  const file = join(DIR, p);
  try {
    const body = readFileSync(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=86400"
    });
    res.end(body);
  } catch (e) { res.writeHead(404); res.end("no"); }
});
await new Promise(r => server.listen(PORT, "127.0.0.1", r));

console.log("PADLAB SERVICE WORKER UPDATE  " + BASE);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915 });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });

/* ---------- the visit before the deploy ---------- */
console.log("[before the deploy]");
installOld();
/* through the splash: PadLab boots, and therefore registers its worker, only
   after the first gesture, because that gesture is what unlocks audio */
async function throughSplash() {
  const b = await page.evaluate(() => {
    const x = [...document.querySelectorAll("button")].find(t => /let's play|start/i.test(t.textContent));
    if (!x) return null; const r = x.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (b) { await page.mouse.move(b.x, b.y); await page.mouse.down(); await page.mouse.up(); }
  await sleep(2500);
}
await page.goto(BASE, { waitUntil: "networkidle2" });
await sleep(1000);
await throughSplash();
/* bounded: serviceWorker.ready never rejects, it just hangs, so waiting on it
   unguarded turns a failed registration into a dead test rather than a red one */
const first = await page.evaluate(async () => {
  const ready = await Promise.race([
    navigator.serviceWorker.ready.then(r => ({ ok: true, active: !!r.active })),
    new Promise(r => setTimeout(() => r({ ok: false }), 8000))
  ]);
  const regs = await navigator.serviceWorker.getRegistrations();
  return { readyOk: ready.ok, active: !!ready.active,
           regs: regs.map(r => ({ scope: r.scope, script: (r.active||r.installing||r.waiting||{}).scriptURL,
                                  state: (r.active||r.installing||r.waiting||{}).state })),
           controlled: !!navigator.serviceWorker.controller,
           marble: !!document.querySelector('.tab[data-view="marble"]'),
           caches: await caches.keys() };
});
if (!first.readyOk) console.log("  (diagnostic) " + JSON.stringify(first));
ok(first.active && first.controlled, "the old worker installed and took control",
  JSON.stringify(first));
ok(!first.marble, "the old build has no marble tab, as expected", String(first.marble));
ok(first.caches.some(c => /padlab-shell-v9/.test(c)),
  "and it cached the old shell", JSON.stringify(first.caches));

/* ---------- deploy happens ---------- */
console.log("[deploy]");
installNew();
console.log("  files replaced on the same origin");

/* ---------- the visit after ---------- */
console.log("[the returning visit]");
await page.reload({ waitUntil: "networkidle2" });
await sleep(1200);
await throughSplash();
await sleep(1500);
const second = await page.evaluate(() => ({
  marble: !!document.querySelector('.tab[data-view="marble"]'),
  tabs: [...document.querySelectorAll(".tab")].map(t => t.dataset.view)
}));
ok(second.marble, "the returning player gets the NEW app, not a cached ghost",
  JSON.stringify(second));

// and once the new worker has taken over, the old shell is gone and only ours remain
await sleep(2500);
const after = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return { caches: await caches.keys(),
           script: reg && reg.active ? reg.active.scriptURL : null };
});
ok(/sw\.js\?v=10/.test(after.script || ""),
  "the versioned worker is the one running", String(after.script));
ok(after.caches.includes("padlab-shell-v10"), "the new shell is cached",
  JSON.stringify(after.caches));
ok(!after.caches.includes("padlab-shell-v9"), "the old shell was cleaned up",
  JSON.stringify(after.caches));
ok(after.caches.every(c => c.indexOf("padlab-") === 0),
  "and nothing outside padlab-* was touched", JSON.stringify(after.caches));

/* ---------- and it still works with the network gone ---------- */
console.log("[offline after the update]");
await page.setOfflineMode(true);
await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
await sleep(1500);
const off = await page.evaluate(() => ({
  marble: !!document.querySelector('.tab[data-view="marble"]'),
  body: document.body.textContent.slice(0, 30)
}));
ok(off.marble, "offline still serves the new app", JSON.stringify(off));
await page.setOfflineMode(false);

/* ---------- and now show the bump is what did it ---------- */
/* Same deploy, but with a build that forgot to bump the registration query.
   The edge is still serving old bytes on that url, so the player is stuck. */
console.log("[what happens without the bump]");
pinnedOldSw = execSync("git show " + PRE_MARBLE + ":padlab/sw.js");
const stuckPage = await browser.newPage();
await stuckPage.setViewport({ width: 412, height: 915 });
await stuckPage.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });

async function splashOn(pg) {
  const b = await pg.evaluate(() => {
    const x = [...document.querySelectorAll("button")].find(t => /let's play|start/i.test(t.textContent));
    if (!x) return null; const r = x.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (b) { await pg.mouse.move(b.x, b.y); await pg.mouse.down(); await pg.mouse.up(); }
  await sleep(2500);
}

// old build first, so the old worker is in charge
installOld();
await stuckPage.goto(BASE, { waitUntil: "networkidle2" });
await sleep(800); await splashOn(stuckPage);

// deploy the new app but leave the registration pointing at the pinned url
installNew();
writeFileSync(join(DIR, "index.html"),
  readFileSync(join(DIR, "index.html"), "utf8").replace('sw.js?v=10', 'sw.js?v=9'));
await stuckPage.reload({ waitUntil: "networkidle2" });
await sleep(1000); await splashOn(stuckPage);
await sleep(2500);

const stuck = await stuckPage.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return { script: reg && reg.active ? reg.active.scriptURL : null,
           caches: await caches.keys() };
});
ok(/v=9/.test(stuck.script || ""), "without the bump the pinned old worker is still in charge",
  String(stuck.script));
ok(stuck.caches.includes("padlab-shell-v9") && !stuck.caches.includes("padlab-shell-v10"),
  "and the shell never moved on, which is the bug the bump prevents",
  JSON.stringify(stuck.caches));
await stuckPage.close();

await browser.close();
server.close();
rmSync(DIR, { recursive: true, force: true });
console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
