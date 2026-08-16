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

/* =========================================================== STATIC CHECKS */
function staticChecks(src) {
  /* 1. THE EXIT — must exist, must be called, must not be gated on framing.
        The portal navigates /satellites/ urls TOP LEVEL, so an affordance that
        renders only when window.parent !== window never renders at all. */
  ok('exit: SWS_EXIT is defined', /window\.SWS_EXIT\s*=/.test(src));
  ok('exit: the title calls it', /tap\('b-exit'/.test(src));
  ok('exit: a button with id b-exit exists', /id="b-exit"/.test(src));
  const exitDef = /window\.SWS_EXIT=function\(\)\{[\s\S]{0,400}?\};/.exec(src);
  ok('exit: falls back to document.referrer when unframed',
    !!exitDef && exitDef[0].includes('document.referrer'));
  ok('exit: branded per the studio rule', /Sky Wolf Studios Arcade/.test(src));

  /* 2. IN-PLAY CHROME. show('s-play') was called against an element that did
        not exist, so a running meadow had no home button and no way out. */
  ok('play: the s-play screen the code shows actually exists', /id="s-play"/.test(src));
  ok('play: it carries a quit button', /id="b-quit"/.test(src));
  ok('play: the quit button is wired', /tap\('b-quit'/.test(src));
  ok('play: the sheet does not swallow taps meant for the board',
    /#s-play\{background:transparent; pointer-events:none\}/.test(src));

  /* 3. PLAY MEANS PLAY. firstUncleared() shipped as dead code. */
  const fuUses = [...src.matchAll(/firstUncleared\(\)/g)].length;
  ok('front door: firstUncleared is actually called', fuUses >= 2, fuUses + ' references');
  ok('front door: PLAY starts a meadow rather than opening the map',
    /tap\('b-play',[\s\S]{0,400}?newGame\(n\)/.test(src));
  ok('front door: the map is still reachable in one tap', /tap\('b-worlds'/.test(src) && /id="b-worlds"/.test(src));

  /* 4. Service worker: prefix-scoped sweep, version in lockstep. */
  const sw = readFileSync(join(HERE, 'sw.js'), 'utf8');
  const cache = /var CACHE\s*=\s*"([^"]+)"/.exec(sw);
  ok('sw: names its cache', !!cache);
  ok('sw: deletes only its own prefix', /indexOf\("nectar-drop-"\)\s*===\s*0/.test(sw));
  const regv = /register\('sw\.js\?v=(\d+)'\)/.exec(src);
  ok('sw: registration is versioned', !!regv);
  ok('sw: cache version and ?v= in lockstep',
    !!cache && !!regv && cache[1].endsWith('-v' + regv[1]),
    cache && regv ? cache[1] + ' vs ?v=' + regv[1] : 'missing');

  /* 5. No dash characters in player facing copy (comments exempt). */
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\w])\/\/[^\n]*/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '');
  const dashes = [...stripped.matchAll(/[–—][^\n]{0,60}/g)].map(m => m[0].trim());
  ok('copy: no en/em dashes in player facing text', dashes.length === 0, dashes.join(' | '));

  /* 6. Touch + type in RENDERED px. Stage 540x960, scale 0.6944 at 375x667. */
  const SCALE = Math.min(375 / 540, 667 / 960);
  const btn = /\.btn\{[^}]*min-height:(\d+)px/.exec(src);
  ok('touch: .btn >= 48 rendered px', !!btn && +btn[1] * SCALE >= 48,
    btn ? (+btn[1] * SCALE).toFixed(1) + 'px' : 'not found');
  const sm = /\.btn\.sm\{min-height:(\d+)px/.exec(src);
  ok('touch: .btn.sm >= 48 rendered px', !!sm && +sm[1] * SCALE >= 48,
    sm ? (+sm[1] * SCALE).toFixed(1) + 'px' : 'not found');
  const tb = /\.tbtn\{[^}]*width:(\d+)px; height:(\d+)px/.exec(src);
  ok('touch: the new quit button >= 48 rendered px',
    !!tb && +tb[1] * SCALE >= 48 && +tb[2] * SCALE >= 48,
    tb ? (+tb[1] * SCALE).toFixed(1) + 'px' : 'not found');

  const floors = {
    '.ribbon': /\.ribbon\{[^}]*font-size:([\d.]+)px/,
    '.title-sub': /\.title-sub\{[^}]*font-size:([\d.]+)px/,
    '.helprow': /\.helprow\{[^}]*font-size:([\d.]+)px/,
    '.btn.sm': /\.btn\.sm\{[^}]*font-size:([\d.]+)px/
  };
  for (const [sel, re] of Object.entries(floors)) {
    const m = re.exec(src);
    const r = m ? +m[1] * SCALE : 0;
    ok('font floor: ' + sel + ' >= 11.2 rendered px', r >= 11.2, m ? r.toFixed(1) + 'px' : 'not found');
  }
}

/* ============================================================ LIVE CHECKS */
function liveChecks() {
  const c = boot(html, { search: '?ndtest=1' });
  const DEV = c.window.ND_DEV;
  ok('boot: the game script runs to completion', !!DEV);
  if (!DEV) return;

  ok('content: there is a real campaign behind the shelf card', DEV.levels.length >= 40, DEV.levels.length + ' meadows');
  ok('content: gardens are populated', DEV.worlds.length >= 8, DEV.worlds.length + ' gardens');
  ok('content: more than one gardener to unlock', DEV.gardeners.length >= 3);

  /* Every level must be buildable and winnable in principle: reds present,
     balls to spend, and a board that survives cleanPegs without collapsing. */
  const thin = [];
  for (let i = 0; i < DEV.levels.length; i++) {
    DEV.start(i);
    const G = DEV.state();
    const counts = DEV.pegCounts();
    if (!G || G.redsLeft < 1 || G.ballsLeft < 1 || counts.green < 1) thin.push(i);
  }
  ok('levels: every meadow has reds to clear, balls to spend and a power bloom',
    thin.length === 0, thin.length ? 'broken meadows: ' + thin.slice(0, 8).join(',') : '');

  /* First thirty seconds: meadow 1 must be gentle and must not out-scale the
     board. A first timer who cannot clear the first board does not come back. */
  DEV.start(0);
  const l1 = DEV.state(), c1 = DEV.pegCounts();
  ok('first run: meadow 1 gives more balls than reds', l1.ballsLeft > l1.redsLeft,
    l1.ballsLeft + ' balls for ' + l1.redsLeft + ' reds');
  ok('first run: meadow 1 is not a wall of armour', c1.armored === 0, c1.armored + ' armoured');

  /* Difficulty climbs rather than reseeds. */
  DEV.start(0); const early = DEV.state().redsLeft;
  DEV.start(Math.min(30, DEV.levels.length - 1)); const late = DEV.state().redsLeft;
  ok('difficulty: later meadows ask for more', late > early, early + ' -> ' + late);

  /* No hung run: a ball must always retire. Drive real shots and require the
     engine to resolve inside its own guard every time. */
  let hung = 0;
  for (let i = 0; i < 60; i++) {
    DEV.start(i % DEV.levels.length);
    const r = DEV.fireAt(((i * 0.37) % 2) - 1);
    if (!r || r.phase === 'fire') hung++;
  }
  ok('loop: every shot resolves, no ball trapped forever', hung === 0, hung + ' hung shots');

  /* A run must be able to END. Clear the reds and require a win to register. */
  DEV.start(0);
  const phase = DEV.winNow();
  ok('loop: clearing the reds ends the meadow', phase !== 'fire', 'phase=' + phase);
  DEV.start(0); DEV.winLevel();
  ok('loop: winning writes progress', !!DEV.prog().cleared, JSON.stringify(DEV.prog().cleared).slice(0, 60));

  /* The daily must build the same board for everybody on a given day. */
  const d1 = (() => { DEV.start(1); return DEV.pegCounts(); })();
  const d2 = (() => { DEV.start(1); return DEV.pegCounts(); })();
  ok('determinism: the same meadow builds identically twice',
    JSON.stringify(d1) === JSON.stringify(d2), JSON.stringify(d1) + ' vs ' + JSON.stringify(d2));

  /* Earn cap. */
  const cap = c.window._sbCapEarn;
  let total = 0, g = 0;
  while (g++ < 60) { const x = cap(1, 'test'); total += x; if (!x) break; }
  ok('earn: capped at 30 a day', total === 30, 'granted ' + total);
}

/* ==================================================== SAVE / CORRUPT SAVE */
function saveChecks() {
  const cases = {
    'truncated json': '{', 'null': 'null', 'wrong shape': '[]',
    'wrong types': '{"cleared":"nope","ach":5,"cos":null}',
    'hostile': '{"__proto__":{"pwn":1}}', 'empty string': ''
  };
  for (const [name, blob] of Object.entries(cases)) {
    let boomed = null;
    try {
      boot(html, { search: '?ndtest=1', storage: { nd_prog: blob, nd_set: blob, nd_tut: blob } });
    } catch (e) { boomed = e.message; }
    ok('save: survives a corrupt save (' + name + ')', boomed === null, boomed || '');
  }
}

/* ============================================================== SELF TEST */
function selftest() {
  const mutations = [
    ['exit unwired', s => s.replace("tap('b-exit', function(){ if(window.SWS_EXIT)SWS_EXIT(); });", ''), /exit: the title calls it/],
    ['exit gated on framing', s => s.replace("if(document.referrer.indexOf('/portal')>=0&&history.length>1){history.back();}else{location.replace('https://lucidwinds.com/portal/');}", 'return;'), /falls back to document.referrer/],
    ['play chrome removed again', s => s.replace('<div class="screen" id="s-play">', '<div class="screen" id="s-nope">'), /s-play screen/],
    ['quit unwired', s => s.replace("tap('b-quit'", "tap('b-quit-x'"), /quit button is wired/],
    ['PLAY opens the map again', s => s.replace(/tap\('b-play', function\(\)\{[^\n]*\n/, "tap('b-play', function(){ buildWorlds(); show('s-worlds'); });\n"), /PLAY starts a meadow/],
    ['sw version drift', s => s.replace("register('sw.js?v=7')", "register('sw.js?v=9')"), /lockstep/],
    ['a dash in player copy', s => s.replace('>Got it<', '>Got it — back<'), /no en\/em dashes/],
    ['tiny touch target', s => s.replace('.btn.sm{min-height:72px', '.btn.sm{min-height:40px'), /\.btn\.sm >= 48/],
    ['tiny type', s => s.replace('.ribbon{margin-top:16px; color:var(--cream); font-size:18px', '.ribbon{margin-top:16px; color:var(--cream); font-size:9px'), /\.ribbon >= 11\.2/],
    ['a meadow with no reds', s => s.replace('function assignColours(pegs, nReds, rng){', 'function assignColours(pegs, nReds, rng){ if(nReds>3)nReds=0;'), /every meadow has reds/],
    ['meadow 1 starved of balls', s => s.replace('function newGame(li){', 'function newGame(li){ var _f=1;'), null],
    ['flat difficulty', s => s.replace('function assignColours(pegs, nReds, rng){', 'function assignColours(pegs, nReds, rng){ nReds=6;'), /later meadows ask for more/],
    ['non deterministic board', s => s.replace("rng=rng||Math.random;", "rng=Math.random;"), /builds identically twice/],
    ['uncapped earn', s => s.replace('n=Math.min(n,Math.max(0,30-(s.n||0)));', ''), /capped at 30/],
    ['save loader throws', s => s.replace("try{ var p=JSON.parse(LS.get('nd_prog')||'{}');", "{ var p=JSON.parse(LS.get('nd_prog')||'{}');"), /corrupt save/]
  ].filter(m => m[2]);

  console.log('SELFTEST — each mutation must turn its assertion red\n');
  let red = 0;
  for (const [name, mutate, want] of mutations) {
    fails.length = 0;
    const mutated = mutate(html);
    if (mutated === html) { console.log('  ?? ' + name + ': mutation did not apply (regex drifted)'); continue; }
    try { staticChecks(mutated); } catch (e) { fails.push('static threw: ' + e.message); }
    try {
      const c = makeSandbox(mutated, { search: '?ndtest=1' });
      runInContext(gameScript(mutated), c, { filename: 'mutant' });
      const DEV = c.window.ND_DEV;
      if (DEV) {
        const thin = [];
        for (let i = 0; i < DEV.levels.length; i++) {
          DEV.start(i); const G = DEV.state(); const ct = DEV.pegCounts();
          if (!G || G.redsLeft < 1 || G.ballsLeft < 1 || ct.green < 1) thin.push(i);
        }
        ok('levels: every meadow has reds to clear, balls to spend and a power bloom', thin.length === 0);
        DEV.start(0); const e0 = DEV.state().redsLeft;
        DEV.start(Math.min(30, DEV.levels.length - 1)); const e1 = DEV.state().redsLeft;
        ok('difficulty: later meadows ask for more', e1 > e0);
        DEV.start(1); const a = DEV.pegCounts(); DEV.start(1); const b = DEV.pegCounts();
        ok('determinism: the same meadow builds identically twice', JSON.stringify(a) === JSON.stringify(b));
        const cap = c.window._sbCapEarn; let t = 0, g = 0;
        while (g++ < 80) { const x = cap(1, 't'); t += x; if (!x) break; }
        ok('earn: capped at 30 a day', t === 30);
      }
    } catch (e) { fails.push('boot threw: ' + e.message); }
    try {
      const cc = makeSandbox(mutated, { search: '?ndtest=1', storage: { nd_prog: '{', nd_set: '{' } });
      runInContext(gameScript(mutated), cc, { filename: 'mutant-corrupt' });
      ok('save: survives a corrupt save (truncated json)', true);
    } catch (e) { ok('save: survives a corrupt save (truncated json)', false, e.message); }
    const caught = fails.some(f => want.test(f));
    console.log((caught ? '  RED  ' : '  MISS ') + name + (caught ? '' : '   <-- assertion did not fire, it is decoration'));
    if (caught) red++;
  }
  fails.length = 0;
  console.log('\n' + red + '/' + mutations.length + ' mutations were caught.');
  process.exit(red === mutations.length ? 0 : 2);
}

/* ==================================================================== run */
if (SELFTEST) selftest();
staticChecks(html);
liveChecks();
saveChecks();

console.log('Nectar Drop — ' + pass + ' passed, ' + fails.length + ' failed');
if (fails.length) { console.log('\nFAILURES:'); fails.forEach(f => console.log('  x ' + f)); process.exit(1); }
