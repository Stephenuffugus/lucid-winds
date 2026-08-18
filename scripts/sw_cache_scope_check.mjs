#!/usr/bin/env node
/* DOES THIS SERVICE WORKER DELETE OTHER APPS' CACHES?
   --------------------------------------------------
   node scripts/sw_cache_scope_check.mjs <file.js> [...]
   node scripts/sw_cache_scope_check.mjs --fleet
   node scripts/sw_cache_scope_check.mjs --selftest

   `caches` is ORIGIN-wide, not per-directory. The usual activate handler

       keys.filter(k => k !== CACHE).map(k => caches.delete(k))

   therefore deletes the cache of every OTHER app on the same origin. On
   lucidwinds.com that is the arcade shell, Lucid Winds itself, PadLab and Hush.
   This is not hypothetical: a dropped-in sw.js wiped the fleet once already.

   This does not read the source and guess. It RUNS the activate handler against
   a fake `caches` holding a sibling app's cache, and asserts the sibling is
   still there afterwards. --selftest proves it can fail by feeding it a
   deliberately unscoped worker.                                              */

import fs from "fs";
import path from "path";
import { runInNewContext } from "vm";

/* ⛔ THESE MUST NOT BE REAL FLEET CACHE NAMES. The first version of this file
   used the arcade's, PadLab's and Hush's actual names, so a worker correctly
   deleting its OWN stale cache was reported as killing a neighbour. Three false
   positives out of three hits. Foreign names only.                            */
const SIBLINGS = ["neighbour-one-v1", "neighbour-two-v7", "third-party-shell-v3"];

async function survivors(src, ownCaches) {
  const handlers = {};
  const deleted = [];
  const present = new Set([...SIBLINGS, ...ownCaches]);

  const noopCache = { addAll: async () => {}, add: async () => {}, put: async () => {},
                      match: async () => undefined, keys: async () => [] };
  const sandbox = {
    console, URL, Response, Request, Promise, setTimeout, clearTimeout, fetch: async () => new Response(""),
    caches: {
      keys: async () => [...present],
      delete: async k => { deleted.push(k); return present.delete(k); },
      open: async () => noopCache,
      match: async () => undefined,
    },
    clients: { claim: async () => {} },
  };
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self.addEventListener = (t, fn) => { (handlers[t] ||= []).push(fn); };
  sandbox.addEventListener = sandbox.self.addEventListener;
  sandbox.self.skipWaiting = async () => {};
  sandbox.skipWaiting = sandbox.self.skipWaiting;
  sandbox.self.registration = { scope: "https://lucidwinds.com/satellites/x/" };
  sandbox.location = new URL("https://lucidwinds.com/satellites/x/sw.js");

  runInNewContext(src, sandbox, { timeout: 5000 });

  for (const fn of handlers.activate || []) {
    const waits = [];
    await fn({ waitUntil: p => waits.push(p) });
    await Promise.all(waits);
  }
  return { deleted, present: [...present], ranActivate: !!(handlers.activate || []).length };
}

async function checkOne(file) {
  const src = fs.readFileSync(file, "utf8");
  /* the app's own current cache name, plus a stale one it SHOULD clean up */
  const m = src.match(/(?:const|var|let)\s+CACHE(?:_NAME)?\s*=\s*["'`]([^"'`]+)["'`]/);
  const own = m ? m[1] : null;
  const stale = own ? own.replace(/[0-9]+$/, "") + "0-old" : "unknown-old";
  const r = await survivors(src, own ? [own, stale] : [stale]);

  const killedSiblings = SIBLINGS.filter(s => !r.present.includes(s));
  const cleanedSelf = own ? !r.present.includes(stale) : null;

  return { file, own, ranActivate: r.ranActivate, killedSiblings, cleanedSelf,
           ok: r.ranActivate && killedSiblings.length === 0 };
}

async function report(files) {
  let bad = 0;
  for (const f of files) {
    let r;
    try { r = await checkOne(f); }
    catch (e) { console.log(`ERROR   ${f}  ${e.message.split("\n")[0]}`); bad++; continue; }
    const tag = !r.ranActivate ? "NO-ACT " : r.ok ? "SCOPED " : "WIPES  ";
    if (!r.ok) bad++;
    console.log(`${tag} ${path.relative(process.cwd(), f).padEnd(52)} own=${(r.own||"?").padEnd(22)}` +
      (r.killedSiblings.length ? ` KILLS ${r.killedSiblings.join(" ")}` :
       r.cleanedSelf === false ? " (warning: does not clean its OWN stale cache)" : ""));
  }
  return bad;
}

async function selftest() {
  const UNSCOPED = `const CACHE='demo-v2';
    self.addEventListener('activate', e => e.waitUntil(
      caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));`;
  const SCOPED = `const CACHE='demo-v2'; const OWNED=/^demo-/;
    self.addEventListener('activate', e => e.waitUntil(
      caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE&&OWNED.test(k)).map(k=>caches.delete(k))))));`;
  const LAZY = `const CACHE='demo-v2'; /* never cleans anything up */`;

  const tmp = "/tmp/sw-selftest-" + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const w = (n, s) => { const p = path.join(tmp, n); fs.writeFileSync(p, s); return p; };

  let pass = 0, fail = 0;
  const t = (n, ok) => ok ? (pass++, console.log("  ok   " + n)) : (fail++, console.log("  FAIL " + n));

  const bad = await checkOne(w("bad.js", UNSCOPED));
  t("an unscoped worker is caught", !bad.ok && bad.killedSiblings.length === SIBLINGS.length);
  const good = await checkOne(w("good.js", SCOPED));
  t("a scoped worker passes", good.ok && good.killedSiblings.length === 0);
  t("a scoped worker still cleans its OWN stale cache", good.cleanedSelf === true);
  const lazy = await checkOne(w("lazy.js", LAZY));
  t("a worker with no activate handler is not called clean", !lazy.ok && !lazy.ranActivate);

  /* the bug this file shipped with: a fixture name that IS the app's own name */
  t("no sibling fixture name collides with a real fleet cache prefix",
    !SIBLINGS.some(s2 => /^(sws|lw|padlab|hush|play|dewball|jimothy|orivex|blobworks)-/.test(s2)));
  const OWNPREFIX = `const CACHE='neighbour-one-v9'; const OWNED=/^neighbour-one-/;
    self.addEventListener('activate', e => e.waitUntil(
      caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE&&OWNED.test(k)).map(k=>caches.delete(k))))));`;
  const collide = await checkOne(w("collide.js", OWNPREFIX));
  t("a worker whose own prefix matches a fixture is reported honestly",
    collide.killedSiblings.includes("neighbour-one-v1"));

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\nselftest: ${pass} ok, ${fail} failed`);
  return fail;
}

const argv = process.argv.slice(2);
if (argv[0] === "--selftest") process.exit(await selftest() ? 1 : 0);
let files = argv.filter(a => !a.startsWith("--"));
if (argv.includes("--fleet")) {
  const roots = ["satellites", "padlab", "hush", "party", "."];
  const seen = new Set();
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!/node_modules|\.git/.test(p) && p.split("/").length < 5) walk(p); }
      else if (/^sw\.js$/.test(e.name)) seen.add(p); } };
    walk(r);
  }
  files = [...seen].sort();
}
if (!files.length) { console.error("usage: sw_cache_scope_check.mjs <file...> | --fleet | --selftest"); process.exit(2); }
process.exit(await report(files) ? 1 : 0);
