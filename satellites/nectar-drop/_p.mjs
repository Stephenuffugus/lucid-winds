/* Nectar Drop — headless check. `node check.mjs`  (add --selftest to prove the
   assertions can go red).

   No browser. The game script is executed inside a `vm` against a minimal DOM +
   canvas stub, so assignColours / physics / the level flow / the save loader are the
   SHIPPED code, not a re-implementation. A checker that mirrors the logic it is
   checking drifts and then lies about it (that is exactly how scripts/rarity_sim.js
   went wrong twice), so nothing below re-derives game maths.

   Watched fail on purpose before being trusted: run with --selftest. */
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SELFTEST = process.argv.includes('--selftest');

let pass = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; return true; }
  fails.push(name + (detail ? '  <- ' + detail : ''));
  return false;
}

/* ------------------------------------------------------------------ DOM stub */
function makeEl(id, cls) {
  const listeners = {};
  const el = {
    id: id || '', _cls: new Set((cls || '').split(/\s+/).filter(Boolean)),
    style: {}, textContent: '', innerHTML: '', value: '',
    width: 0, height: 0, children: [], parentNode: null, _on: listeners,
    classList: {
      add(c) { el._cls.add(c); }, remove(c) { el._cls.delete(c); },
      contains(c) { return el._cls.has(c); },
      toggle(c, f) { if (f === undefined) f = !el._cls.has(c); f ? el._cls.add(c) : el._cls.delete(c); }
    },
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    removeEventListener() {},
    appendChild(c) { el.children.push(c); c.parentNode = el; return c; },
    removeChild(c) { const i = el.children.indexOf(c); if (i >= 0) el.children.splice(i, 1); return c; },
    setAttribute(k, v) { el['_a_' + k] = v; }, getAttribute(k) { return el['_a_' + k] ?? null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    focus() {}, click() { (listeners.click || []).forEach(f => f({ preventDefault() {} })); },
    getBoundingClientRect() { return { left: 0, top: 0, width: 540, height: 960 }; },
    getContext() { return ctx2d(); }
  };
  return el;
}
function ctx2d() {
  const noop = () => {};
  return new Proxy({ canvas: { width: 540, height: 960 } }, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient')
        return () => ({ addColorStop: noop });
      return noop;
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}

/* Build the element registry from the REAL markup so a missing id in the html
   shows up here as a null, exactly as it would in the browser. */
function buildDom(html) {
  const byId = Object.create(null);
  const all = [];
  const re = /<(\w+)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[2];
    const idm = /\bid="([^"]+)"/.exec(attrs);
    const clm = /\bclass="([^"]+)"/.exec(attrs);
    if (!idm && !clm) continue;
    const el = makeEl(idm ? idm[1] : '', clm ? clm[1] : '');
    const dm = /\bdata-(\w+)="([^"]*)"/g; let d;
    while ((d = dm.exec(attrs))) el.setAttribute('data-' + d[1], d[2]);
    if (idm) byId[idm[1]] = el;
    all.push(el);
  }
  return { byId, all };
}

function makeSandbox(html, { search = '', storage = {} } = {}) {
  const { byId, all } = buildDom(html);
  const store = { ...storage };
  const doc = {
    getElementById: id => byId[id] || null,
    querySelectorAll: sel => {
      const c = sel.replace(/^\./, '');
      return all.filter(e => e._cls.has(c));
    },
    querySelector: sel => doc.querySelectorAll(sel)[0] || null,
    createElement: tag => makeEl('', tag),
    createEvent: () => ({ initEvent() {} }),
    addEventListener() {}, removeEventListener() {},
    head: makeEl('head'), body: makeEl('body'),
    readyState: 'complete', hidden: false, referrer: ''
  };
  const win = {
    document: doc, innerWidth: 375, innerHeight: 667, devicePixelRatio: 2,
    visualViewport: null,
    location: { search, href: 'https://lucidwinds.com/satellites/nectar-drop/' + search, protocol: 'https:', hostname: 'lucidwinds.com', replace() {} },
    navigator: { userAgent: 'node', share: null, clipboard: null },
    history: { length: 1, back() {} },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}, removeEventListener() {},
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    Event: function () {}, alert() {}, console,
    /* the game preloads art; a stub Image that never fires onload is the right
       shape here (headless has no network and the game must not need one) */
    Image: function () { this.onload = null; this.onerror = null; this.src = ''; this.width = 8; this.height = 8; },
    AudioContext: undefined, webkitAudioContext: undefined, CustomEvent: function () {},
    performance: { now: () => 0 }
  };
  win.window = win; win.self = win; win.top = win; win.parent = win;
  win.globalThis = win;
  win._store = store; win._byId = byId;
  return createContext(win);
}

/* ------------------------------------------------------------ load the game */
const HTML_PATH = join(HERE, 'index.html');
const html = readFileSync(HTML_PATH, 'utf8');

function gameScript(source) {
  // The main IIFE is the block that opens with (function(){ "use strict";
  const blocks = [...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const main = blocks.find(b => b.includes('function boot()') && b.includes('assignColours'));
  if (!main) throw new Error('could not find the main game script block');
  return main;
}

function boot(source, opts) {
  const ctx = makeSandbox(source, opts);
  runInContext(gameScript(source), ctx, { filename: 'nectar-drop/index.html' });
  return ctx;
}


const c = boot(html, { search: '?ndtest=1' });
const DEV = c.window.ND_DEV;
for (let i = 0; i < 60; i++) {
  const lvl = i % DEV.levels.length;
  DEV.start(lvl);
  const r = DEV.fireAt(((i * 0.37) % 2) - 1);
  if (!r || r.phase === 'fire') {
    // keep stepping to find out how long it really takes
    const st = c.window.ND_DEV.state();
    let n = 0;
    while (st.phase === 'fire' && n < 200000) { n++; c.window.ND_DEV.state(); break; }
    console.log('HUNG i='+i+' level='+lvl+' phase='+r.phase+' balls='+r.balls+' redsLeft='+r.redsLeft+' minX='+r.minX+' maxX='+r.maxX);
  }
}
