// The service worker, driven in a VM (studio rule: page level tests never see the worker's own fetches).
// Every fetch path must settle with a real Response, even on a hung network, and activation must
// delete only this game's old caches (caches are origin wide).
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import vm from 'vm';

const { ok, done } = suite('sw');
const src = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function makeEnv(fetchMode) {
  const handlers = {};
  const stores = new Map();
  const keyOf = (r) => (typeof r === 'string' ? new URL(r, 'https://lucidwinds.com/satellites/tumble/').href : r.url).split('?')[0];
  const cacheObj = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      put: async (req, res) => { m.set(keyOf(req), res); },
      add: async (req) => { const r = await env.fetch(req); if (!r || !r.ok) throw new Error('add failed'); m.set(keyOf(req), r); },
      match: async (req) => m.get(keyOf(req)),
    };
  };
  class Response { constructor(body, init = {}) { this.body = body; this.status = init.status || 200; this.ok = this.status >= 200 && this.status < 300; this.type = 'basic'; } clone() { return this; } }
  class Request { constructor(url) { this.url = new URL(url, 'https://lucidwinds.com/satellites/tumble/').href; this.method = 'GET'; } }
  const env = {
    self: {
      location: new URL('https://lucidwinds.com/satellites/tumble/sw.js'),
      addEventListener: (t, f) => { handlers[t] = f; },
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async (n) => cacheObj(n),
      keys: async () => [...stores.keys()],
      delete: async (n) => stores.delete(n),
      match: async (req) => { for (const m of stores.values()) { const r = m.get(keyOf(req)); if (r) return r; } return undefined; },
    },
    fetch: (req) => {
      if (fetchMode === 'hang') return new Promise(() => {});
      if (fetchMode === 'fail') return Promise.reject(new TypeError('offline'));
      return Promise.resolve(new Response('ok:' + (req.url || req)));
    },
    Response, Request, URL, setTimeout, Promise, console,
  };
  env.self.caches = env.caches;
  vm.createContext(env);
  vm.runInContext(src, env);
  return { env, handlers, stores, cacheObj };
}

async function dispatchFetch(E, url, method = 'GET') {
  let responded = null;
  const ev = { request: { url, method }, respondWith: (p) => { responded = p; } };
  E.handlers.fetch(ev);
  if (!responded) return { handled: false };
  const settled = await Promise.race([responded.then((r) => ({ r })), new Promise((res) => setTimeout(() => res({ timeout: true }), 8000))]);
  return { handled: true, ...settled };
}

// install and activate
{
  const E = makeEnv('ok');
  E.stores.set('tumble-local-old', new Map());
  E.stores.set('lucidwinds-shell-v9', new Map());
  E.stores.set('keepsies-v3', new Map());
  let wait;
  E.handlers.install({ waitUntil: (p) => { wait = p; } });
  await wait;
  const local = [...E.stores.keys()].find((k) => k.startsWith('tumble-local-2'));
  ok(local && E.stores.get(local).size > 20, `install precaches the game (${local && E.stores.get(local).size} files)`);
  const cdn = E.stores.get('tumble-cdn-v1');
  ok(cdn && [...cdn.keys()].some((k) => /three@0\.186\.0\/build\/three\.core\.js/.test(k)) && [...cdn.keys()].some((k) => /rapier\.mjs/.test(k)), `install also stores the pinned engine modules (${cdn ? cdn.size : 0})`);
  E.handlers.activate({ waitUntil: (p) => { wait = p; } });
  await wait;
  ok(!E.stores.has('tumble-local-old'), 'activate deletes this game\'s old cache');
  ok(E.stores.has('lucidwinds-shell-v9') && E.stores.has('keepsies-v3'), 'and leaves every other game\'s cache alone');
  const hit = await dispatchFetch(E, 'https://lucidwinds.com/satellites/tumble/src/game.js');
  ok(hit.handled && hit.r && hit.r.ok, 'a local file is served from the cache');
  const out = await dispatchFetch(E, 'https://lucidwinds.com/portal/index.html');
  ok(!out.handled, 'pages outside the game are not intercepted');
  const post = await dispatchFetch(E, 'https://lucidwinds.com/satellites/tumble/x', 'POST');
  ok(!post.handled, 'non GET requests are not intercepted');
}
// a hung network settles
{
  const E = makeEnv('hang');
  const t0 = Date.now();
  const miss = await dispatchFetch(E, 'https://lucidwinds.com/satellites/tumble/nothing-cached.js');
  ok(miss.handled && miss.r && miss.r.status === 503 && !miss.timeout, `a local miss on a hung network settles with a 503 in ${Date.now() - t0} ms`);
  const t1 = Date.now();
  const cdn = await dispatchFetch(E, 'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js');
  ok(cdn.handled && cdn.r && cdn.r.status === 503 && !cdn.timeout, `a CDN miss on a hung network settles in ${Date.now() - t1} ms`);
}
// an offline network falls back to the CDN cache
{
  const E = makeEnv('fail');
  await E.cacheObj('tumble-cdn-v1').put('https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js', new E.env.Response('cached three'));
  const cdn = await dispatchFetch(E, 'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js');
  ok(cdn.r && cdn.r.body === 'cached three', 'offline, the CDN module comes from the cache');
}
done();
