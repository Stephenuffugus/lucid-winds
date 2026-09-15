/* GATE: the root worker survives the host's 429 lockout (2026-09-15, Stephen: "half the time the arcade wont load").
   Hostinger's CDN edge answers a visitor who loads a lot with HTTP 429 and an empty body. sw.js runs in node's vm with a
   fake `caches` and `fetch` (the shape of test/music/sw.mjs); navigations are dispatched and what is served and cached is read.
   Asserted, each watched to fail on a planted fault (the last block runs the old handler in memory):
     1. a navigation answered 200 is served and cached
     2. a navigation answered 429 with a good saved page serves the saved page, and the 429 is never cached
     3. a navigation answered 429 with a saved copy that is itself a 429 (poisoned before the fix) serves the 429, not the
        poisoned copy, and never hangs
     4. a navigation answered 503 with a good saved page serves the saved page
   Run:  node test/sw-lockout.mjs */
import { readFileSync } from "fs";
import { runInNewContext } from "vm";

let pass = 0, fail = 0;
const t = (n, ok, d) => { if (ok) { pass++; console.log("  ok    " + n); } else { fail++; console.log("  FAIL  " + n + (d ? "   <- " + d : "")); } };

const res = (status, tag) => ({ ok: status >= 200 && status < 300, status, type: "basic", redirected: false, url: "", tag, headers: { get: () => null }, clone() { return res(status, tag); } });

function worker(src, { net, saved }) {
  const handlers = {}, puts = [];
  const store = saved ? new Map([["https://lucidwinds.com/portal/", saved]]) : new Map();
  const key = r => typeof r === "string" ? r : r.url;
  const cache = { match: r => Promise.resolve(store.get(key(r))), put: (r, v) => { puts.push({ url: key(r), status: v.status }); store.set(key(r), v); return Promise.resolve(); }, keys: () => Promise.resolve([]), delete: () => Promise.resolve(true), add: () => Promise.resolve() };
  function Response(body, init) { return Object.assign(res((init && init.status) || 200, "offline page"), { body }); }
  Response.redirect = () => res(302, "redirect");
  const sb = {
    caches: { open: () => Promise.resolve(cache), match: r => cache.match(r), keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
    fetch: () => Promise.resolve(net), URL, Promise, setTimeout, clearTimeout, console: { log() {}, warn() {}, error() {} }, Response, Headers: function () {},
    location: { origin: "https://lucidwinds.com", hostname: "lucidwinds.com", href: "https://lucidwinds.com/sw.js", pathname: "/sw.js" },
    skipWaiting: () => {}, clients: { claim: () => Promise.resolve(), matchAll: () => Promise.resolve([]) }, registration: {},
    addEventListener: (type, fn) => { handlers[type] = fn; }, indexedDB: undefined
  };
  sb.self = sb; sb.globalThis = sb;
  runInNewContext(src, sb, { filename: "sw.js" });
  return async () => {
    let responded = null;
    handlers.fetch({ request: { url: "https://lucidwinds.com/portal/", method: "GET", mode: "navigate", headers: { get: () => null } }, respondWith(p) { responded = p; } });
    const served = await Promise.race([responded, new Promise(r => setTimeout(() => r("HUNG"), 1500))]);
    await new Promise(r => setTimeout(r, 20));
    return { served, puts };
  };
}

async function laws(src, label) {
  const out = [];
  let r = await worker(src, { net: res(200, "fresh") })();
  out.push(["a navigation answered 200 is served and cached", r.served && r.served.tag === "fresh" && r.puts.some(p => p.status === 200), JSON.stringify({ served: r.served && r.served.tag, puts: r.puts })]);
  r = await worker(src, { net: res(429, "lockout"), saved: res(200, "saved") })();
  out.push(["a navigation answered 429 with a good saved page serves the saved page and caches nothing", r.served && r.served.tag === "saved" && r.puts.length === 0, JSON.stringify({ served: r.served && r.served.tag, puts: r.puts })]);
  r = await worker(src, { net: res(429, "lockout"), saved: res(429, "poisoned") })();
  out.push(["a 429 with a poisoned saved copy serves the 429, not the poisoned copy, and never hangs", r.served !== "HUNG" && r.served && r.served.tag === "lockout" && r.puts.length === 0, JSON.stringify({ served: r.served === "HUNG" ? "HUNG" : r.served && r.served.tag, puts: r.puts })]);
  r = await worker(src, { net: res(503, "down"), saved: res(200, "saved") })();
  out.push(["a navigation answered 503 with a good saved page serves the saved page", r.served && r.served.tag === "saved", JSON.stringify({ served: r.served && r.served.tag })]);
  return out.map(([n, ok, d]) => [label + n, ok, d]);
}

const SRC = readFileSync("sw.js", "utf8");
for (const [n, ok, d] of await laws(SRC, "")) t(n, ok, d);

/* the plant: the handler as it stood before the fix, rebuilt in memory; laws 2 and 4 must go red on it */
const OLD = SRC.replace(/\n\s*if \(!response\.ok && response\.type !== 'opaqueredirect'\) \{[\s\S]*?\n\s*return;\n\s*\}/, "");
t("plant applies (the not ok branch found and removed in memory)", OLD !== SRC);
const planted = await laws(OLD, "PLANT ");
t("PLANT: the old handler fails law 2 (it served or cached the 429)", !planted[1][1], planted[1][2]);
t("PLANT: the old handler fails law 4", !planted[3][1], planted[3][2]);

/* ---- /play/sw.js, the worker that controls the /play/ game shell: a 429 or 5xx on a script, a style or a page is answered
   from a cached copy when one exists, and passed through when none does ---- */
const PLAY = readFileSync("play/sw.js", "utf8");
function playWorker(src, { net, saved }) {
  const handlers = {}, puts = [];
  const store = saved ? new Map([["https://lucidwinds.com/play/shell.js?v=9", saved]]) : new Map();
  const key = r => typeof r === "string" ? r : r.url;
  const cache = { match: r => Promise.resolve(store.get(key(r))), put: (r, v) => { puts.push({ url: key(r), status: v.status }); return Promise.resolve(); }, keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) };
  function Response(body, init) { return Object.assign(res((init && init.status) || 200, "offline page"), { body }); }
  Response.redirect = () => res(302, "redirect");
  const sb = { caches: { open: () => Promise.resolve(cache), match: r => cache.match(r), keys: () => Promise.resolve([]), delete: () => Promise.resolve(true) },
    fetch: () => Promise.resolve(net), URL, Promise, setTimeout, clearTimeout, console: { log() {}, warn() {}, error() {} }, Response,
    location: { origin: "https://lucidwinds.com", href: "https://lucidwinds.com/play/sw.js" },
    skipWaiting: () => Promise.resolve(), clients: { claim: () => Promise.resolve() }, addEventListener: (ty, fn) => { handlers[ty] = fn; } };
  sb.self = sb; sb.globalThis = sb; runInNewContext(src, sb, { filename: "play/sw.js" });
  return async () => {
    let responded = null;
    handlers.fetch({ request: { url: "https://lucidwinds.com/play/shell.js?v=9", method: "GET", mode: "cors", headers: { get: () => null } }, respondWith(p) { responded = p; } });
    const served = await Promise.race([responded, new Promise(r => setTimeout(() => r("HUNG"), 1500))]);
    await new Promise(r => setTimeout(r, 20));
    return { served, puts };
  };
}
async function playLaws(src) {
  const out = [];
  let r = await playWorker(src, { net: res(429, "lockout"), saved: res(200, "saved") })();
  out.push(["play/sw.js: a 429 on a cached script serves the cached copy and caches nothing", r.served && r.served.tag === "saved" && r.puts.length === 0, JSON.stringify({ served: r.served && r.served.tag, puts: r.puts })]);
  r = await playWorker(src, { net: res(503, "down"), saved: res(200, "saved") })();
  out.push(["play/sw.js: a 503 on a cached script serves the cached copy", r.served && r.served.tag === "saved", JSON.stringify({ served: r.served && r.served.tag })]);
  r = await playWorker(src, { net: res(429, "lockout") })();
  out.push(["play/sw.js: a 429 with nothing cached passes the 429 through and never hangs", r.served !== "HUNG" && r.served && r.served.tag === "lockout", JSON.stringify({ served: r.served === "HUNG" ? "HUNG" : r.served && r.served.tag })]);
  r = await playWorker(src, { net: res(200, "fresh") })();
  out.push(["play/sw.js: a 200 is served and cached", r.served && r.served.tag === "fresh" && r.puts.length === 1, JSON.stringify({ served: r.served && r.served.tag, puts: r.puts })]);
  return out;
}
for (const [n, ok, d] of await playLaws(PLAY)) t(n, ok, d);
const PLAY_OLD = PLAY.replace(/\n\s*if \(res && \(res\.status === 429 \|\| res\.status >= 500\)\) \{[\s\S]*?\n\s*\}/, "");
t("plant applies to play/sw.js (the lockout branch found and removed in memory)", PLAY_OLD !== PLAY);
const playPlanted = await playLaws(PLAY_OLD);
t("PLANT: the old play/sw.js fails the 429 law", !playPlanted[0][1], playPlanted[0][2]);
t("PLANT: the old play/sw.js fails the 503 law", !playPlanted[1][1], playPlanted[1][2]);

console.log("\nsw lockout gate: " + pass + " ok, " + fail + " failed"); process.exit(fail ? 1 : 0);
