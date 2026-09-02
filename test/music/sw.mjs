/* GATE P5a — the service worker never caches /music/, and the two new shared
   files ride the stale-while-revalidate rule like music-player.js does.
   sw.js runs in node's vm with a fake `caches`/`fetch`; we dispatch fetch
   events and watch what gets put in a cache. The last check mutates the
   static-asset regex to include mp3 IN MEMORY and asserts /music/ is still
   not cached, which is the whole reason the guard exists (LAW 5).
   Run:  node test/music/sw.mjs */
import { readFileSync } from "fs";
import { runInNewContext } from "vm";

let pass = 0, fail = 0;
const t = (n, ok, d) => { if (ok) { pass++; console.log("  ok    " + n); } else { fail++; console.log("  FAIL  " + n + (d ? "   <- " + d : "")); } };

function worker(src) {
  const handlers = {}, puts = [], fetches = [];
  const mkRes = () => ({ ok: true, status: 200, type: "basic", headers: { get: () => null }, clone() { return mkRes(); } });
  const cache = { match: () => Promise.resolve(undefined), put: (req) => { puts.push(typeof req === "string" ? req : req.url); return Promise.resolve(); }, keys: () => Promise.resolve([]), delete: () => Promise.resolve(true), addAll: () => Promise.resolve(), add: () => Promise.resolve() };
  const sb = {
    caches: { open: () => Promise.resolve(cache), match: () => Promise.resolve(undefined), keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
    fetch: (req) => { fetches.push(typeof req === "string" ? req : req.url); return Promise.resolve(mkRes()); },
    URL, Promise, setTimeout, clearTimeout, console: { log() {}, warn() {}, error() {} }, Response: function () {}, Headers: function () {},
    location: { origin: "https://lucidwinds.com", hostname: "lucidwinds.com", href: "https://lucidwinds.com/sw.js", pathname: "/sw.js" },
    skipWaiting: () => {}, clients: { claim: () => Promise.resolve(), matchAll: () => Promise.resolve([]) }, registration: {},
    addEventListener: (type, fn) => { handlers[type] = fn; }, indexedDB: undefined,
  };
  sb.self = sb; sb.globalThis = sb;
  runInNewContext(src, sb, { filename: "sw.js" });
  return {
    async dispatch(path) {
      let responded = null;
      handlers.fetch({ request: { url: "https://lucidwinds.com" + path, method: "GET", mode: "cors", headers: { get: () => null } }, respondWith(p) { responded = p; } });
      if (responded) { try { await responded; } catch (e) {} }
      await new Promise(r => setTimeout(r, 5));
      return { responded: !!responded, put: puts.some(u => u.endsWith(path)), fetched: fetches.some(u => u.endsWith(path)) };
    },
  };
}

const SRC = readFileSync("sw.js", "utf8");
const w = worker(SRC);
t("harness control: /music-tracks.js takes the s-w-r path (responds, fetches, puts)", await w.dispatch("/music-tracks.js").then(r => r.responded && r.fetched && r.put));
t("harness control: a .png takes the cache-first path (responds, puts)", await w.dispatch("/assets/x.png").then(r => r.responded && r.put));
t("/music-unlocks.js joins the s-w-r rule", await w.dispatch("/music-unlocks.js").then(r => r.responded && r.fetched && r.put));
t("/music-catalog.js joins the s-w-r rule", await w.dispatch("/music-catalog.js").then(r => r.responded && r.fetched && r.put));
t("/music/v1/<shelf>/<file>.mp3 is never put in any cache", await w.dispatch("/music/v1/deepwell/shaft-song.mp3").then(r => !r.put));
t("/music/ is not even claimed by respondWith (network only, browser handles it)", await w.dispatch("/music/v1/deepwell/shaft-song.mp3").then(r => !r.responded));
t("sw.js carries an explicit /music/ guard naming LAW 5", /indexOf\('\/music\/'\)\s*===\s*0[\s\S]{0,80}LAW 5/.test(SRC));

/* the reason the guard exists: a future edit adds mp3 to the static regex */
const MUT = SRC.replace("|woff2?|ttf|otf|eot)$/", "|woff2?|ttf|otf|eot|mp3)$/");
t("mutation applies (static regex found)", MUT !== SRC);
const w2 = worker(MUT);
t("with mp3 added to the static regex, /music/ is STILL not cached (the guard sits above it)", await w2.dispatch("/music/v1/deepwell/shaft-song.mp3").then(r => !r.put));

/* ---- /play/sw.js: the worker that actually controls native pages (scope /play/ wins). It is network-first and
   caches every 200 it fetches, so without a guard a native page would cache audio into sws-play-vN. ---- */
const PLAY = readFileSync("play/sw.js", "utf8");
function playWorker(src) {
  const handlers = {}, puts = [];
  const mkRes = () => ({ ok: true, status: 200, type: "basic", redirected: false, url: "", headers: { get: () => null }, clone() { return mkRes(); } });
  const cache = { match: () => Promise.resolve(undefined), put: (req) => { puts.push(typeof req === "string" ? req : req.url); return Promise.resolve(); }, keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) };
  const sb = { caches: { open: () => Promise.resolve(cache), match: () => Promise.resolve(undefined), keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
    fetch: () => Promise.resolve(mkRes()), URL, Promise, setTimeout, clearTimeout, console: { log() {}, warn() {}, error() {} },
    Response: Object.assign(function () {}, { redirect: () => mkRes() }), location: { origin: "https://lucidwinds.com", href: "https://lucidwinds.com/play/sw.js" },
    skipWaiting: () => Promise.resolve(), clients: { claim: () => Promise.resolve() }, addEventListener: (t, fn) => { handlers[t] = fn; } };
  sb.self = sb; sb.globalThis = sb; runInNewContext(src, sb, { filename: "play/sw.js" });
  return async (path) => { let responded = null; handlers.fetch({ request: { url: "https://lucidwinds.com" + path, method: "GET", mode: "cors", headers: { get: () => null } }, respondWith(p) { responded = p; } });
    if (responded) { try { await responded; } catch (e) {} } await new Promise(r => setTimeout(r, 60));
    return { responded: !!responded, put: puts.some(u => u.endsWith(path)) }; };
}
const pw = playWorker(PLAY);
t("play/sw.js control: /play/shell.js is fetched and cached (network-first put)", await pw("/play/shell.js").then(r => r.responded && r.put));
t("play/sw.js: /music/v1/<shelf>/<file>.mp3 is never put in sws-play cache", await pw("/music/v1/deepwell/shaft-song.mp3").then(r => !r.put));
t("play/sw.js: /music/ is not claimed by respondWith", await pw("/music/v1/deepwell/shaft-song.mp3").then(r => !r.responded));
t("play/sw.js carries the guard naming LAW 5", /indexOf\("\/music\/"\)\s*===\s*0[\s\S]{0,80}LAW 5/.test(PLAY));
t("play/sw.js CACHE bumped past v3 (its header: bump on any shipped change)", /var CACHE = "sws-play-v([4-9]|\d\d+)"/.test(PLAY));
t("play/shell.js registers /play/sw.js with a stamp past v=3", /\/play\/sw\.js\?v=([4-9]|\d\d+)/.test(readFileSync("play/shell.js", "utf8")));

console.log("\nsw gate: " + pass + " ok, " + fail + " failed"); process.exit(fail ? 1 : 0);
