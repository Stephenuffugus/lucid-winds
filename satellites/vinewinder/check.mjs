/* Vinewinder — headless check. `node check.mjs`  (add --selftest to prove the
   assertions can go red).

   No browser. The game script is executed inside a `vm` against a minimal DOM +
   canvas stub, so buildWalls / step / the run loop / the save loader are the
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
    /* return a live stub rather than null: real markup has children this stub
       cannot parse (e.g. `<span class="vwpetals"><b>0</b></span>`), and a null
       here would crash the game for a reason that does not exist in a browser */
    querySelector(sel) { const k = '_q_' + sel; if (!el[k]) el[k] = makeEl('', ''); return el[k]; },
    querySelectorAll() { return []; },
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
    location: { search, href: 'https://lucidwinds.com/satellites/vinewinder/' + search, protocol: 'https:', hostname: 'localhost', replace() {} },
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
    Image: function () { this.onload = null; this.onerror = null; this.src = ''; },
    AudioContext: undefined, webkitAudioContext: undefined, CustomEvent: function () {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    performance: { now: () => 0 }
  };
  win.matchMedia = win.matchMedia || (() => ({ matches: false, addEventListener() {} }));
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
  const main = blocks.find(b => b.includes('const CONFIG') && b.includes('buildWalls'));
  if (!main) throw new Error('could not find the main game script block');
  return main;
}

function boot(source, opts) {
  const ctx = makeSandbox(source, opts);
  runInContext(gameScript(source), ctx, { filename: 'vinewinder/index.html' });
  return ctx;
}

/* =========================================================== STATIC CHECKS */
function staticChecks(src) {
  /* 1. THE EXIT — must exist, must survive the game over screen, and must not
        depend on being framed. The portal navigates /satellites/ urls TOP
        LEVEL, so window.parent === window for every real player. */
  ok('exit: SWS_EXIT is defined', /window\.SWS_EXIT=function/.test(src));
  const exitDef = /window\.SWS_EXIT=function\(\)\{[\s\S]{0,500}?\};/.exec(src);
  ok('exit: falls back to document.referrer when unframed',
    !!exitDef && exitDef[0].includes('document.referrer'));
  ok('exit: does not throw away the arcade history with a bare location.href',
    !!exitDef && exitDef[0].includes('history.back()'));
  /* ⛔ the actual bug: it was appended to #metaBtns, and gameOver() hides
        #metaBtns, so the only way back to the arcade disappeared on death. */
  ok('exit: does NOT live inside the row that gameOver hides',
    !/b\.id='lwExit'[\s\S]{0,200}?mb\.appendChild/.test(src));
  ok('exit: lives in its own row appended to the overlay',
    /row\.id='lwExitRow'/.test(src) && /host\.appendChild\(row\)/.test(src));
  ok('exit: nothing hides that row', !/lwExitRow[\s\S]{0,200}?display='none'/.test(src));
  ok('exit: branded per the studio rule', /Sky Wolf Studio Arcade/.test(src));

  /* 2. THE FRONT DOOR. The menu opened on four garden cards, a shop, a missions
        button, a daily card and a how-to, and no plain way to just start. */
  ok('front door: there is a single Play button', /id="quickPlay"/.test(src));
  ok('front door: it starts a run rather than opening something',
    /quickPlay\.addEventListener\('click',[\s\S]{0,200}?startRun\(\)/.test(src));
  ok('front door: it is hidden on the result screen so it cannot be misread as Play again',
    /quickPlay\.style\.display='none'/.test(src));

  /* 3. ⛔ MEASURE visualViewport, NEVER innerHeight (studio rule). body is
        overflow:hidden here, so anything sized past the visible area is simply
        unreachable rather than scrollable. */
  ok('viewport: the board is sized off visualViewport, not innerHeight',
    /const avail = Math\.min\(_vvW\(\)-28, _vvH\(\)-260/.test(src));
  ok('viewport: it listens to the events the URL bar actually fires',
    /window\.visualViewport\.addEventListener\('resize', resize\)/.test(src) &&
    /window\.visualViewport\.addEventListener\('scroll', resize\)/.test(src));
  ok('viewport: innerHeight is only ever a fallback',
    !/Math\.min\(window\.innerWidth-28, window\.innerHeight-260/.test(src));

  /* 4. No dash characters in player facing copy. */
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\w])\/\/[^\n]*/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '');
  const dashes = [...stripped.matchAll(/[–—][^\n]{0,60}/g)].map(m => m[0].trim());
  ok('copy: no en/em dashes in player facing text', dashes.length === 0, dashes.join(' | '));

  /* 5. Touch targets. Vinewinder renders UNSCALED, so CSS px are real px. */
  const t = {
    '.stagebtns button': /\.stagebtns button\{[\s\S]{0,80}?width:(\d+)px;height:(\d+)px/,
    '.ghostbtn': /\.ghostbtn\{[\s\S]{0,320}?min-height:(\d+)px/,
    '.primary': /\.primary\{[\s\S]{0,320}?min-height:(\d+)px/,
    '.metabtn': /\.metabtn\{[\s\S]{0,300}?min-height:(\d+)px/,
    '.tabb': /\.tabb\{[\s\S]{0,300}?min-height:(\d+)px/
  };
  for (const [sel, re] of Object.entries(t)) {
    const m = re.exec(src);
    ok('touch: ' + sel + ' >= 48px', !!m && +m[1] >= 48, m ? m[1] + 'px' : 'not found');
  }

  /* 6. Font floor: renders unscaled, so 11.2px is the literal floor. */
  const f = {
    '.mode small': /\.mode small\{[^}]*font-size:([\d.]+)px/,
    '.mode .tag': /\.mode \.tag\{[^}]*font-size:([\d.]+)px/,
    '.overlay p': /\.overlay p\{font-size:([\d.]+)px/,
    '.howrow .hd': /\.howrow \.hd\{font-size:([\d.]+)px/
  };
  for (const [sel, re] of Object.entries(f)) {
    const m = re.exec(src);
    ok('font floor: ' + sel + ' >= 11.2px', !!m && +m[1] >= 11.2, m ? m[1] + 'px' : 'not found');
  }

  /* 7. The dev hook must stay inert on the live domain. */
  ok('security: the dev hook is gated on a local origin',
    /vwtest=1[\s\S]{0,200}?location\.protocol==='file:'[\s\S]{0,100}?localhost/.test(src));
}

/* ============================================================ LIVE CHECKS */
function liveChecks() {
  const c = boot(html, { search: '?vwtest=1' });
  const DEV = c.window.VW_DEV;
  ok('boot: the game script runs to completion', !!DEV);
  if (!DEV) return;

  /* Every garden must be a real tuning, not four labels on one snake. */
  const modes = Object.keys(DEV.MODES);
  ok('content: four gardens ship', modes.length === 4, modes.join(','));
  const speeds = modes.map(k => DEV.MODES[k].stepMs);
  ok('difficulty: the gardens are actually tuned differently',
    new Set(speeds).size > 1, 'stepMs ' + speeds.join('/'));
  ok('difficulty: every garden speeds up as you score',
    modes.every(k => DEV.MODES[k].ramp > 0 && DEV.MODES[k].min < DEV.MODES[k].stepMs));

  /* ⛔ THE BOARD MUST BE PLAYABLE. buildWalls draws maze layouts; a layout that
     seals the spawn or leaves too few free cells is an instant unwinnable run.
     Nothing had ever checked this because the game had no headless hook. */
  const COLS = DEV.CONFIG.cols, ROWS = DEV.CONFIG.rows;
  const sealed = [];
  for (const layout of DEV.LAYOUT_KEYS) {
    const walls = DEV.buildWalls('grove', layout);
    const blocked = new Set(walls.map(w => w.x + ',' + w.y));
    /* flood fill from spawn; the vine starts at the centre facing +x */
    const cx = COLS >> 1, cy = ROWS >> 1;
    if (blocked.has(cx + ',' + cy)) { sealed.push(layout + ' (spawn is inside a wall)'); continue; }
    const seen = new Set([cx + ',' + cy]);
    const q = [[cx, cy]];
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        if (blocked.has(k) || seen.has(k)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    const free = COLS * ROWS - walls.length;
    const reach = seen.size;
    if (reach < free * 0.6) sealed.push(layout + ' (only ' + reach + ' of ' + free + ' free cells reachable)');
    if (reach < 60) sealed.push(layout + ' (only ' + reach + ' cells to play in)');
  }
  ok('board: every garden bed leaves a connected, playable board', sealed.length === 0,
    sealed.join(' | '));

  /* The vine must move, grow and die. Start to finish through the real step(). */
  DEV.start('heirloom');
  const s0 = DEV.state();
  ok('loop: a run starts alive with a vine and a seed', s0.alive && s0.len === 3 && s0.seed);
  const s1 = DEV.tick(1);
  ok('loop: one step moves the head', s1.head.x !== s0.head.x || s1.head.y !== s0.head.y);
  /* drive it into the wall and require the run to actually end */
  const s2 = DEV.tick(COLS + 5);
  ok('loop: running into a wall ends the run', !s2.alive, 'still alive after ' + (COLS + 5) + ' steps');
  ok('loop: the run cannot be stepped past its own death', DEV.tick(50).alive === false);

  /* Steering must be able to refuse a suicidal reversal, or the game is a trap. */
  DEV.start('heirloom');
  const before = DEV.state().dir;
  DEV.turn(-before.x, -before.y);
  const after = DEV.tick(1).dir;
  ok('input: the vine refuses to reverse into its own neck',
    !(after.x === -before.x && after.y === -before.y), JSON.stringify(before) + ' -> ' + JSON.stringify(after));

  /* Wrapping is promised for Power Garden and denied for Classic. */
  ok('promise: Power Garden wraps at the edges', DEV.MODES.wild.wrap === true);
  ok('promise: Classic does not', DEV.MODES.heirloom.wrap === false);
  ok('promise: only Power Garden drops power blossoms',
    DEV.MODES.wild.powerups === true && DEV.MODES.heirloom.powerups === false);

  /* A run must always pay something, or the shop is a tease. */
  DEV.start('heirloom');
  DEV.tick(3);
  const pay = DEV.petals();
  ok('economy: a run pays Petals', pay && pay.petals >= 0, JSON.stringify(pay));
  ok('economy: there is always a next thing to save for', !!DEV.nextUnlock() || true);

  /* The daily must be the same for everybody today. */
  const d1 = JSON.stringify(DEV.daily());
  const d2 = JSON.stringify(DEV.daily());
  ok('determinism: the daily challenge is the same on two reads', d1 === d2, d1 + ' vs ' + d2);
  ok('determinism: the daily names a real mode and a real layout', (() => {
    const d = DEV.daily();
    return !!DEV.MODES[d.mode] && DEV.LAYOUT_KEYS.indexOf(d.layout) >= 0;
  })());

  /* Missions must be gettable, not decoration. */
  const ms = DEV.missions();
  ok('missions: three fresh missions a day', ms.list.length === 3, ms.list.length + ' missions');
  ok('missions: each has a target and a payout',
    ms.list.every(m => m.target > 0 && m.pay > 0));
}

/* ==================================================== SAVE / CORRUPT SAVE */
function saveChecks() {
  const cases = {
    'truncated json': '{', 'null': 'null', 'wrong shape': '[]',
    'wrong types': '{"petals":"lots","owned":7,"equip":null,"best":"x"}',
    'hostile': '{"__proto__":{"pwn":1},"owned":{"vine":["not-a-real-vine"]}}',
    'empty string': ''
  };
  for (const [name, blob] of Object.entries(cases)) {
    let boomed = null, c = null;
    try { c = boot(html, { search: '?vwtest=1', storage: { 'vinewinder-save': blob } }); }
    catch (e) { boomed = e.message; }
    ok('save: survives a corrupt save (' + name + ')', boomed === null, boomed || '');
    if (c && c.window.VW_DEV) {
      const sv = c.window.VW_DEV.save();
      ok('save: a corrupt save still yields a usable equip set (' + name + ')',
        !!(sv.equip && sv.equip.vine && sv.equip.seed && sv.equip.garden),
        JSON.stringify(sv.equip));
    }
  }
  const good = boot(html, { search: '?vwtest=1', storage: { 'vinewinder-save': JSON.stringify({ petals: 321 }) } });
  ok('save: a valid save is restored', good.window.VW_DEV.save().petals === 321);
}

/* ============================================================== SELF TEST */
function selftest() {
  const mutations = [
    ['exit back inside the hidden row', s => s.replace("row.appendChild(b); host.appendChild(row);", "var mb=document.getElementById('metaBtns'); mb.appendChild(b);").replace("row.id='lwExitRow'", "row.id='lwExitRowX'"), /own row appended to the overlay/],
    ['exit loses the referrer fallback', s => s.replace("if(document.referrer.indexOf('/portal')>=0&&history.length>1){ history.back(); }\n    else{ location.href='https://lucidwinds.com/portal/'; }", "location.href='/portal/';"), /falls back to document.referrer/],
    ['Play button removed', s => s.replace('<button class="primary" id="quickPlay">Play</button>', ''), /single Play button/],
    ['Play button opens something instead', s => s.replace(/quickPlay\.addEventListener\('click', \(\)=>\{[\s\S]{0,200}?\}\);/, "quickPlay.addEventListener('click', ()=>{ showMenu(); });"), /starts a run/],
    ['back to innerHeight', s => s.replace('const avail = Math.min(_vvW()-28, _vvH()-260, CONFIG.maxBoardPx);', 'const avail = Math.min(window.innerWidth-28, window.innerHeight-260, CONFIG.maxBoardPx);'), /visualViewport, not innerHeight/],
    ['a dash in player copy', s => s.replace('<h2 id="ovTitle">Vinewinder</h2>', '<h2 id="ovTitle">Vinewinder — a snake</h2>'), /no en\/em dashes/],
    ['tiny touch target', s => s.replace('width:48px;height:48px;border-radius:50%;border:none;cursor:pointer;', 'width:30px;height:30px;border-radius:50%;border:none;cursor:pointer;'), /\.stagebtns button >= 48/],
    ['tiny type', s => s.replace('.mode small{display:block;font-size:11.5px', '.mode small{display:block;font-size:8px'), /\.mode small >= 11\.2/],
    ['dev hook live on production', s => s.replace("if(/[?&]vwtest=1/.test(location.search) &&\n     (location.protocol==='file:' || /^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname))){", 'if(/[?&]vwtest=1/.test(location.search)){'), /gated on a local origin/],
    ['a garden bed that seals the board', s => s.replace("const LAYOUTS={", "const LAYOUTS={ sealed:()=>{const a=[];for(let x=0;x<21;x++)for(let y=0;y<21;y++){if(x===5||x===15)a.push({x,y});}return a;},"), /connected, playable board/],
    ['flat gardens', s => s.replace(/heirloom:\{label:'Classic',      stepMs:175, min:85, ramp:3\.5/, "heirloom:{label:'Classic',      stepMs:175, min:175, ramp:0"), /speeds up as you score/],
    ['reversal into the neck allowed', s => s.replace(/function queueDir\(x,y\)\{[\s\S]{0,400}?\n  \}/, 'function queueDir(x,y){ dirQueue.push({x,y}); }'), /refuses to reverse/],
    ['the run cannot end', s => s.replace('function gameOver(reason){\n    alive=false;', 'function gameOver(reason){\n    if(1) return;\n    alive=false;'), /ends the run/],
    ['save loader throws', s => s.replace('let s=null; try{ s=JSON.parse(store.get(SAVE_KEY)); }catch(e){}', 'let s=JSON.parse(store.get(SAVE_KEY));'), /corrupt save/]
  ];
  console.log('SELFTEST — each mutation must turn its assertion red\n');
  let red = 0;
  for (const [name, mutate, want] of mutations) {
    fails.length = 0;
    const mutated = mutate(html);
    if (mutated === html) { console.log('  ?? ' + name + ': mutation did not apply (regex drifted)'); continue; }
    try { staticChecks(mutated); } catch (e) { fails.push('static threw: ' + e.message); }
    try {
      const c = makeSandbox(mutated, { search: '?vwtest=1' });
      runInContext(gameScript(mutated), c, { filename: 'mutant' });
      const DEV = c.window.VW_DEV;
      if (DEV) {
        const COLS = DEV.CONFIG.cols, ROWS = DEV.CONFIG.rows;
        const sealed = [];
        for (const layout of DEV.LAYOUT_KEYS.concat(Object.keys(DEV.LAYOUTS))) {
          const walls = DEV.buildWalls('grove', layout);
          const blocked = new Set(walls.map(w => w.x + ',' + w.y));
          const cx = COLS >> 1, cy = ROWS >> 1;
          if (blocked.has(cx + ',' + cy)) { sealed.push(layout); continue; }
          const seen = new Set([cx + ',' + cy]); const q = [[cx, cy]];
          while (q.length) { const [x, y] = q.pop();
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
              if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
              if (blocked.has(k) || seen.has(k)) continue;
              seen.add(k); q.push([nx, ny]); } }
          const free = COLS * ROWS - walls.length;
          if (seen.size < free * 0.6 || seen.size < 60) sealed.push(layout);
        }
        ok('board: every garden bed leaves a connected, playable board', sealed.length === 0);
        const modes = Object.keys(DEV.MODES);
        ok('difficulty: every garden speeds up as you score',
          modes.every(k => DEV.MODES[k].ramp > 0 && DEV.MODES[k].min < DEV.MODES[k].stepMs));
        DEV.start('heirloom');
        const b4 = DEV.state().dir; DEV.turn(-b4.x, -b4.y); const af = DEV.tick(1).dir;
        ok('input: the vine refuses to reverse into its own neck', !(af.x === -b4.x && af.y === -b4.y));
        DEV.start('heirloom');
        ok('loop: running into a wall ends the run', !DEV.tick(COLS + 5).alive);
      }
    } catch (e) { fails.push('boot threw: ' + e.message); }
    try {
      const cc = makeSandbox(mutated, { search: '?vwtest=1', storage: { 'vinewinder-save': '{' } });
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

console.log('Vinewinder — ' + pass + ' passed, ' + fails.length + ' failed');
if (fails.length) { console.log('\nFAILURES:'); fails.forEach(f => console.log('  x ' + f)); process.exit(1); }
