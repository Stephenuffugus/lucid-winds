/* Aura Farm test harness.
   Boots the real game script inside a node vm with a hand rolled DOM shim, so
   the logic under test is the shipped logic and not a copy of it. No browser,
   no jsdom.

   The game's top level `const`/`let` bindings are script scoped and therefore
   invisible from outside the vm, exactly as in a browser. To reach them we
   append a small epilogue to the SAME script, which puts live accessors on the
   context. That keeps every test hook out of the shipped file. */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const GAME_FILE = path.join(HERE, '..', 'index.html');

export function readSource() {
  return fs.readFileSync(GAME_FILE, 'utf8');
}

/* The game lives in the last <script> block, the one that opens 'use strict'. */
export function extractGameScript(html) {
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const game = blocks.find(b => b.includes("'use strict'") && b.includes('AURA FARM'));
  if (!game) throw new Error('could not find the game script block');
  return game;
}

/* ---------------- DOM shim ---------------- */
function makeClassList(el) {
  const set = new Set();
  return {
    add: (...c) => c.forEach(x => set.add(x)),
    remove: (...c) => c.forEach(x => set.delete(x)),
    contains: c => set.has(c),
    toggle: (c, force) => {
      const on = force === undefined ? !set.has(c) : !!force;
      if (on) set.add(c); else set.delete(c);
      return on;
    },
    _set: set,
    get value() { return [...set].join(' '); },
  };
}

function makeStyle() {
  const s = {};
  Object.defineProperty(s, 'setProperty', { value: (k, v) => { s[k] = v; }, enumerable: false });
  Object.defineProperty(s, 'removeProperty', { value: k => { delete s[k]; }, enumerable: false });
  return s;
}

function makeElement(tag, id) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    id: id || '',
    style: makeStyle(),
    dataset: {},
    textContent: '',
    _innerHTML: '',
    _children: [],
    _listeners: {},
    disabled: false,
    onclick: null,
    offsetWidth: 100,
    _className: '',
  };
  el.classList = makeClassList(el);
  Object.defineProperty(el, 'className', {
    get() { return el._className || el.classList.value; },
    set(v) { el._className = v; el.classList._set.clear(); String(v).split(/\s+/).filter(Boolean).forEach(c => el.classList._set.add(c)); },
  });
  Object.defineProperty(el, 'innerHTML', {
    get() { return el._innerHTML; },
    set(v) { el._innerHTML = String(v); el._children.length = 0; },
  });
  Object.defineProperty(el, 'children', { get() { return el._children; } });
  Object.defineProperty(el, 'firstChild', { get() { return el._children[0] || null; } });
  el.appendChild = c => { el._children.push(c); c._parent = el; return c; };
  el.remove = () => {
    const p = el._parent;
    if (p) { const i = p._children.indexOf(el); if (i >= 0) p._children.splice(i, 1); }
  };
  el.querySelector = () => null;
  el.querySelectorAll = () => [];
  el.addEventListener = (t, fn) => { (el._listeners[t] = el._listeners[t] || []).push(fn); };
  el.removeEventListener = () => {};
  el.dispatch = (t, ev) => (el._listeners[t] || []).forEach(fn => fn(ev || {}));
  el.getContext = () => makeCtx();
  el.setAttribute = () => {};
  el.getAttribute = () => null;
  return el;
}

/* A canvas 2d context that records nothing and throws nowhere. */
function makeCtx() {
  const noop = () => {};
  const grad = { addColorStop: noop };
  return new Proxy({
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    measureText: () => ({ width: 10 }),
    setTransform: noop,
    getImageData: () => ({ data: [0, 0, 0, 0] }),
  }, {
    get(t, k) {
      if (k in t) return t[k];
      if (typeof k === 'string') return noop;
      return undefined;
    },
    set() { return true; },
  });
}

export function makeLocalStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: k => { map.delete(k); },
    clear: () => map.clear(),
    _map: map,
    _dump: () => Object.fromEntries(map),
  };
}

/* ---------------- boot ---------------- */
/* Returns { ctx, T } where T reaches the game's script scoped state. */
export function boot(opts = {}) {
  const src = opts.source || extractGameScript(readSource());
  const els = new Map();
  const getEl = id => {
    if (!els.has(id)) els.set(id, makeElement('div', id));
    return els.get(id);
  };
  /* Pre-create the ids the game touches, so shapes are stable. */
  ['cv', 'hud', 'hudRow3', 'dayLbl', 'timeLbl', 'essenceLbl', 'comboLbl', 'quotaFill',
    'quotaTxt', 'focusFill', 'orb', 'menuBtns', 'artBtns', 'npcPanel', 'npcName',
    'npcGroup', 'peakBadge', 'npcMood', 'moodMarker', 'chargeFill', 'chargeTxt',
    'npcActions', 'toasts', 'modal', 'modalContent', 'vignette', 'flash', 'banner',
    'specCard', 'sndBtn'].forEach(getEl);

  const timers = [];
  const localStorage = opts.localStorage || makeLocalStorage(opts.storage);

  const win = {
    innerWidth: opts.W || 390,
    innerHeight: opts.H || 844,
    devicePixelRatio: 2,
    localStorage,
    addEventListener: (t, fn) => { (win._l = win._l || {}), (win._l[t] = win._l[t] || []).push(fn); },
    removeEventListener: () => {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    performance: { now: () => Date.now() },
    AudioContext: undefined,
    webkitAudioContext: undefined,
    Sunbeam: undefined,
    parent: null, // set below
    postMessage: () => {},
    location: { pathname: '/satellites/aura-farm/', href: 'https://lucidwinds.com/satellites/aura-farm/', replace: h => { win.location.href = h; win._replaced = h; } },
    history: { length: opts.historyLength === undefined ? 2 : opts.historyLength, back: () => { win._wentBack = true; } },
    _posted: [],
  };
  win.parent = opts.framed ? { postMessage: (m) => win._posted.push(m) } : win;
  win.self = win;
  win.window = win;

  const doc = {
    getElementById: getEl,
    createElement: t => makeElement(t),
    addEventListener: (t, fn) => { (doc._l = doc._l || {}), (doc._l[t] = doc._l[t] || []).push(fn); },
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    hidden: false,
    referrer: opts.referrer || '',
    body: makeElement('body'),
  };

  const sandbox = {
    window: win, document: doc, localStorage,
    performance: win.performance,
    requestAnimationFrame: win.requestAnimationFrame,
    cancelAnimationFrame: win.cancelAnimationFrame,
    setTimeout: win.setTimeout, clearTimeout: win.clearTimeout,
    setInterval: win.setInterval, clearInterval: win.clearInterval,
    console,
    Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, Error,
    parent: win.parent,
    location: win.location,
    history: win.history,
    navigator: { userAgent: 'node' },
    isNaN, parseInt, parseFloat,
  };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);

  /* Live accessors into the game's script scope. Kept in the test, not shipped. */
  const epilogue = `
  ;globalThis.__T = {
    get run(){ return typeof run!=='undefined' ? run : undefined },
    set run(v){ run = v },
    get meta(){ return meta }, set meta(v){ meta = v },
    get mode(){ return mode }, set mode(v){ mode = v },
    get selected(){ return selected }, set selected(v){ selected = v },
    get modalOpen(){ return modalOpen },
    ROSTER, EMOTIONS, EMO_KEYS, VENUES, ACTIONS, SHOP, RELICS, MILESTONES, TIERS,
    GROUPS, TRAITS, NPC_TRAITS, WEATHERS,
    quotaFor, emotionOf, tierOf, npcDef, venueById, hasTrait,
    newRun, freshNpc, migrateRun, saveRun, loadRun, saveMeta,
    startGame, harvest, doAction, glean, update, endDay, nextDay, gameOver, ending,
    titleScreen, showModal, closeModal, toast, updateHud, renderPanel,
    repLean, repRecordRun, tributePrice, genContracts, cprog, completeContract,
    rollDay, composeLetter, buyItem, useArt, shooMara, updateMara, ensureMara,
    checkBloom, yieldMult, karma, setsDone, focusCap, actUsable,
    get particles(){ return particles },
    get cooldowns(){ return cooldowns }, set cooldowns(v){ cooldowns = v },
    _has: function(n){ try { return eval('typeof '+n) !== 'undefined'; } catch(e){ return false; } },
    _get: function(n){ try { return eval(n); } catch(e){ return undefined; } },
    _run: function(code){ return eval(code); }
  };`;

  vm.runInContext(src + epilogue, ctx, { filename: 'aura-farm.js' });
  return { ctx, T: ctx.__T, win, doc, els, localStorage, timers, getEl };
}

/* ---------------- tiny assert kit ---------------- */
export const results = { pass: 0, fail: 0, failures: [] };
export function check(name, fn) {
  try {
    fn();
    results.pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    results.fail++;
    results.failures.push({ name, err: e });
    console.log('  FAIL ' + name + '\n         ' + (e && e.message ? e.message : e));
  }
}
export function group(title) { console.log('\n' + title); }
export function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'expected') + ': got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));
}
export function ok(v, msg) { if (!v) throw new Error(msg || 'expected truthy, got ' + JSON.stringify(v)); }
export function notOk(v, msg) { if (v) throw new Error(msg || 'expected falsy, got ' + JSON.stringify(v)); }
export function gte(a, b, msg) { if (!(a >= b)) throw new Error((msg || 'expected') + ': ' + a + ' >= ' + b); }
export function lte(a, b, msg) { if (!(a <= b)) throw new Error((msg || 'expected') + ': ' + a + ' <= ' + b); }
export function throws(fn, msg) {
  let threw = false;
  try { fn(); } catch (e) { threw = true; }
  if (!threw) throw new Error(msg || 'expected a throw');
}
export function noThrow(fn, msg) {
  try { fn(); } catch (e) { throw new Error((msg || 'expected no throw') + ', got: ' + e.message); }
}
export function report() {
  console.log('\n' + '='.repeat(56));
  console.log(results.fail ? `FAILED  ${results.fail} failing, ${results.pass} passing`
    : `PASSED  ${results.pass} assertions`);
  console.log('='.repeat(56));
  return results.fail === 0;
}
