#!/usr/bin/env node
/* Drive padlab/sw.js in a vm with stubbed self/caches/fetch/Response.
   The black-screen law: every respondWith promise must SETTLE with a real
   Response — including "network hangs forever, cache is empty".
   The origin law: activate may only delete padlab-* caches.
   Test windows must exceed the worker's own 8s backstop. */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const SW = fs.readFileSync(path.join(__dirname, "..", "padlab", "sw.js"), "utf8");

function mkResponse(body, init) {
  init = init || {};
  return {
    body: body, status: init.status != null ? init.status : 200,
    ok: (init.status != null ? init.status : 200) >= 200 && (init.status != null ? init.status : 200) < 300,
    redirected: !!init.redirected, url: init.url || "",
    headers: init.headers || {}, __isResponse: true,
    clone() { return mkResponse(body, init); }
  };
}

function buildWorker(scenario) {
  // scenario.fetch(url, opts) -> Promise; scenario.cacheData = {cacheName: {url: response}}
  const handlers = {};
  const deleted = [];
  const cacheData = scenario.cacheData || {};
  const cachesStub = {
    keys: () => Promise.resolve(Object.keys(cacheData)),
    delete: k => { deleted.push(k); delete cacheData[k]; return Promise.resolve(true); },
    open: name => Promise.resolve({
      put: (req, res) => { (cacheData[name] = cacheData[name] || {})[typeof req === "string" ? req : req.url] = res; return Promise.resolve(); },
      add: () => Promise.resolve(),
      match: req => {
        const key = typeof req === "string" ? req : req.url;
        return Promise.resolve((cacheData[name] || {})[key]);
      }
    }),
    match: req => {
      const key = typeof req === "string" ? req : req.url;
      for (const c of Object.values(cacheData)) if (c[key]) return Promise.resolve(c[key]);
      return Promise.resolve(undefined);
    }
  };
  const selfStub = {
    addEventListener: (t, fn) => { handlers[t] = fn; },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve() },
    location: { origin: "https://lucidwinds.com" }
  };
  const RespCtor = function (body, init) { return mkResponse(body, init); };
  RespCtor.redirect = url => mkResponse("", { status: 302, url: url });
  const ctx = {
    self: selfStub, caches: cachesStub, fetch: scenario.fetch,
    Response: RespCtor, URL: URL, setTimeout: setTimeout, clearTimeout: clearTimeout,
    console: console
  };
  vm.createContext(ctx);
  new vm.Script(SW).runInContext(ctx);
  return { handlers, deleted, fetchCalls: scenario.calls };
}

const HANG = () => new Promise(() => {});           // never settles
const FAIL = () => Promise.reject(new Error("net down"));

function settleWithin(promise, ms) {
  return Promise.race([
    promise.then(v => ({ settled: true, value: v }), e => ({ settled: true, rejected: e })),
    new Promise(r => setTimeout(() => r({ settled: false }), ms))
  ]);
}

async function run() {
  let pass = 0, fail = 0;
  const t = (name, ok, detail) => {
    console.log((ok ? "  ✅ " : "  ❌ ") + name + (detail ? "  — " + detail : ""));
    ok ? pass++ : fail++;
  };

  // ---- 1. activate deletes ONLY padlab-* stale caches
  {
    const w = buildWorker({
      fetch: FAIL,
      cacheData: {
        "padlab-shell-v3": {}, "padlab-shell-v4": {}, "padlab-audio-v1": {},
        "lw-main-v7": {}, "dewball-v3": {}, "playshell-v2": {}
      }
    });
    const ev = { waitUntil(p) { this.p = p; } };
    w.handlers.activate(ev);
    await ev.p;
    const foreign = w.deleted.filter(k => k.indexOf("padlab-") !== 0);
    t("activate deletes only padlab-* caches", foreign.length === 0 && w.deleted.length === 1 && w.deleted[0] === "padlab-shell-v3",
      "deleted: " + JSON.stringify(w.deleted));
  }

  // ---- 2..4 fetch scenarios, run concurrently (two involve 8s backstops)
  const jobs = [];

  // 2. navigation, network HANGS, cache EMPTY → must settle with real Response
  jobs.push((async () => {
    const w = buildWorker({ fetch: HANG, cacheData: {} });
    const ev = { request: { url: "https://lucidwinds.com/padlab/", method: "GET", mode: "navigate" }, respondWith(p) { this.p = p; } };
    w.handlers.fetch(ev);
    const r = await settleWithin(ev.p, 10000);
    t("nav + hang + empty cache settles with a real Response",
      r.settled && r.value && r.value.__isResponse,
      r.settled ? ("status " + (r.value && r.value.status)) : "NEVER SETTLED (black screen)");
  })());

  // 3. navigation, network HANGS, cache HAS index.html → cached copy
  jobs.push((async () => {
    const cached = mkResponse("<html>cached</html>");
    const w = buildWorker({ fetch: HANG, cacheData: { "padlab-shell-v4": { "./index.html": cached } } });
    const ev = { request: { url: "https://lucidwinds.com/padlab/", method: "GET", mode: "navigate" }, respondWith(p) { this.p = p; } };
    w.handlers.fetch(ev);
    const r = await settleWithin(ev.p, 10000);
    t("nav + hang + cached shell serves the cached copy",
      r.settled && r.value === cached, r.settled ? "" : "NEVER SETTLED");
  })());

  // 4. navigation, network OK → network response, fetched with cache:'no-cache'
  jobs.push((async () => {
    let opts = null;
    const fresh = mkResponse("<html>fresh</html>");
    const w = buildWorker({ fetch: (u, o) => { opts = o; return Promise.resolve(fresh); }, cacheData: {} });
    const ev = { request: { url: "https://lucidwinds.com/padlab/", method: "GET", mode: "navigate" }, respondWith(p) { this.p = p; } };
    w.handlers.fetch(ev);
    const r = await settleWithin(ev.p, 3000);
    t("nav + network ok returns fresh page via cache:'no-cache'",
      r.settled && r.value === fresh && opts && opts.cache === "no-cache",
      "opts: " + JSON.stringify(opts));
  })());

  // 5. jsDelivr sample, network FAILS, cache empty → settles (504, not undefined)
  jobs.push((async () => {
    const w = buildWorker({ fetch: FAIL, cacheData: {} });
    const ev = { request: { url: "https://cdn.jsdelivr.net/gh/x/y.mp3", method: "GET", mode: "no-cors" }, respondWith(p) { this.p = p; } };
    w.handlers.fetch(ev);
    const r = await settleWithin(ev.p, 3000);
    const ok = r.settled && (r.rejected || (r.value && r.value.__isResponse));
    t("sample + net fail settles (never resolves undefined)", ok && !(r.settled && r.value === undefined),
      r.settled ? (r.rejected ? "rejected (page-level fallback handles it)" : "status " + r.value.status) : "NEVER SETTLED");
  })());

  // 6. same-origin icon, cache miss + network fail → settles with real Response
  jobs.push((async () => {
    const w = buildWorker({ fetch: FAIL, cacheData: {} });
    const ev = { request: { url: "https://lucidwinds.com/padlab/icon-192.png", method: "GET", mode: "no-cors" }, respondWith(p) { this.p = p; } };
    w.handlers.fetch(ev);
    const r = await settleWithin(ev.p, 3000);
    t("same-origin miss + net fail settles with a real Response",
      r.settled && r.value && r.value.__isResponse,
      r.settled ? "status " + (r.value && r.value.status) : "NEVER SETTLED");
  })());

  await Promise.all(jobs);

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
