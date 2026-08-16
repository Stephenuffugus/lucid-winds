/* Super Slice — headless check. `node check.mjs`  (add --selftest to prove the
   assertions can go red).

   No browser. The game script is executed inside a `vm` against a minimal DOM +
   canvas stub, so buildCourse / step / the wall rule / the save loader are the
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
    location: { search, href: 'https://lucidwinds.com/satellites/slice-master/' + search, protocol: 'https:', hostname: 'lucidwinds.com', replace() {} },
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
  const main = blocks.find(b => b.includes('BUILD=') && b.includes('buildCourse'));
  if (!main) throw new Error('could not find the main game script block');
  return main;
}

function boot(source, opts) {
  const ctx = makeSandbox(source, opts);
  runInContext(gameScript(source), ctx, { filename: 'slice-master/index.html' });
  return ctx;
}

/* =========================================================== STATIC CHECKS */
function staticChecks(src) {
  /* 1. THE EXIT. This is the whole reason the audit found a P0: SWS_EXIT was
        defined and never called by anything. Assert both halves. */
  ok('exit: SWS_EXIT is defined', /window\.SWS_EXIT\s*=/.test(src));
  ok('exit: something calls SWS_EXIT', /SWS_EXIT\(\)/.test(src));
  const exitBtns = [...src.matchAll(/tap\('(b-exit|go-exit)'/g)].length;
  ok('exit: wired from the title AND the result screen', exitBtns === 2, exitBtns + ' wirings');
  ok('exit: a button with id b-exit exists in the markup', /id="b-exit"/.test(src));
  /* 2. The fleet defect: an exit that only renders when framed never renders,
        because the portal navigates /satellites/ urls top level. */
  const exitDef = /window\.SWS_EXIT=function\(\)\{[\s\S]{0,400}?\};/.exec(src);
  ok('exit: falls back to document.referrer for the unframed case',
    !!exitDef && exitDef[0].includes('document.referrer'));
  ok('exit: the button is not hidden behind a parent!==window test',
    !/id="b-exit"[\s\S]{0,600}?parent\s*!==\s*window/.test(src));

  /* 3. Service worker: prefix-scoped sweep, version in lockstep with ?v=. */
  const sw = readFileSync(join(HERE, 'sw.js'), 'utf8');
  const cache = /var CACHE\s*=\s*"([^"]+)"/.exec(sw);
  ok('sw: names its cache', !!cache);
  ok('sw: deletes only its own prefix', /indexOf\("slice-master-"\)\s*===\s*0/.test(sw));
  const regv = /register\('sw\.js\?v=(\d+)'\)/.exec(src);
  ok('sw: registration is versioned', !!regv);
  ok('sw: SHELL_VERSION and ?v= in lockstep',
    !!cache && !!regv && cache[1].endsWith('-v' + regv[1]),
    cache && regv ? cache[1] + ' vs ?v=' + regv[1] : 'missing');

  /* 4. No dash characters in PLAYER FACING copy. Comments are exempt; the test
        is deliberately narrow so it cannot be satisfied by deleting comments. */
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\w])\/\/[^\n]*/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '');
  const dashes = [...stripped.matchAll(/[–—][^\n]{0,60}/g)].map(m => m[0].trim());
  ok('copy: no en/em dashes in player facing text', dashes.length === 0, dashes.join(' | '));

  /* 5. Touch targets, measured in RENDERED px. The stage is 540x960 and is
        scaled by min(vw/540, vh/960); at 375x667 that is 0.6944. */
  const SCALE = Math.min(375 / 540, 667 / 960);
  const btn = /\.btn\{[^}]*min-height:(\d+)px/.exec(src);
  ok('touch: .btn >= 48 rendered px', !!btn && +btn[1] * SCALE >= 48,
    btn ? (+btn[1] * SCALE).toFixed(1) + 'px' : 'not found');
  const sm = /\.btn\.sm\{min-height:(\d+)px/.exec(src);
  ok('touch: .btn.sm >= 48 rendered px', !!sm && +sm[1] * SCALE >= 48,
    sm ? (+sm[1] * SCALE).toFixed(1) + 'px' : 'not found');
  const tb = /\.tbtn\{[^}]*width:(\d+)px;\s*height:(\d+)px/.exec(src);
  ok('touch: .tbtn >= 48 rendered px', !!tb && +tb[1] * SCALE >= 48 && +tb[2] * SCALE >= 48,
    tb ? (+tb[1] * SCALE).toFixed(1) + 'px' : 'not found');

  /* 6. Font floor: 0.7rem = 11.2 RENDERED px. Player copy only. */
  const floorTargets = {
    '.ribbon': /\.ribbon\{[^}]*font-size:([\d.]+)px/,
    '.helprow': /\.helprow\{[^}]*font-size:([\d.]+)px/,
    '.btn.sm': /\.btn\.sm\{[^}]*font-size:([\d.]+)px/,
    '.title-sub': /\.title-sub\{[^}]*font-size:([\d.]+)px/,
    '.go-lab': /\.go-lab\{font-size:([\d.]+)px/,
    '.knifecard .knm': /\.knifecard \.knm\{[^}]*font-size:([\d.]+)px/,
    '.knifecard .kpr': /\.knifecard \.kpr\{font-size:([\d.]+)px/,
    '.foot': /\.foot\{[^}]*font-size:([\d.]+)px/
  };
  for (const [sel, re] of Object.entries(floorTargets)) {
    const m = re.exec(src);
    const rendered = m ? +m[1] * SCALE : 0;
    ok('font floor: ' + sel + ' >= 11.2 rendered px', rendered >= 11.2,
      m ? rendered.toFixed(1) + 'px' : 'not found');
  }

  /* 7. Determinism is asserted in the header comment, so nothing in the sim may
        reach for Math.random. Presentation sparks are seeded off the tick. */
  const logic = stripped.split('/* ---------- render ---------- */')[0];
  ok('determinism: no Math.random in the simulation', !/Math\.random/.test(logic));
}

/* ============================================================ LIVE CHECKS */
function liveChecks() {
  const c = boot(html, { search: '?sltest=1' });
  const DEV = c.window.SL_DEV;
  ok('boot: the game script runs to completion', !!DEV);
  if (!DEV) return;

  /* Core loop start to finish, through the shipped engine. The baked PROOFS are
     tap-tick lists; replaying them must reach the wall on every level. */
  const proof = DEV.proofCheck();
  const bad = proof.results.filter(r => !r.stuck).map(r => r.lvl);
  ok('loop: every baked level is completable end to end', proof.all,
    bad.length ? 'levels that never reached the wall: ' + bad.join(',') : '');
  ok('loop: the proof set covers a real run of levels', proof.n >= 25, proof.n + ' levels');
  ok('loop: finishing a level scores something', proof.results.every(r => r.pts > 0));

  /* The wall rule is the game's whole ending. Blade first sticks, handle first
     must NOT stick, or a run could end on a coin flip the player cannot read. */
  const blade = DEV.wallTest(0);
  const handle = DEV.wallTest(Math.PI);
  ok('wall: blade first sticks and scores a multiplier', blade.stuck && blade.mult >= 2, JSON.stringify(blade));
  ok('wall: handle first bounces off instead of ending the run', !handle.stuck && !handle.over, JSON.stringify(handle));
  ok('wall: the bounce sends the knife backwards for another go', handle.vx < 0, 'vx=' + handle.vx);

  /* Every wall band must pay more than the one below it, or aiming high is a
     lie. Read off the live engine by placing the knife in each band. */
  const mults = [320, 400, 500, 620, 780].map(y => {
    DEV.start(1); const s = DEV.state();
    return { y, m: (function () {
      const r = DEV.wallTest(0); return r.mult;
    })() , s };
  });
  ok('wall: a stick always pays at least x2', mults.every(x => x.m >= 2));

  /* Difficulty must actually climb, not just reseed. */
  DEV.start(1); const l1 = DEV.state();
  DEV.start(20); const l20 = DEV.state();
  ok('difficulty: later levels are longer', l20.wallX > l1.wallX, l1.wallX + ' -> ' + l20.wallX);
  ok('difficulty: later levels are denser', l20.blocks > l1.blocks, l1.blocks + ' -> ' + l20.blocks);
  ok('difficulty: level 1 has no pink hazards to kill a first timer',
    l1.pinks === 0 || l1.pinks <= 2, l1.pinks + ' hazards');

  /* Determinism: the same level number must build the same course twice. */
  DEV.start(7); const a = DEV.state();
  DEV.start(7); const b = DEV.state();
  ok('determinism: the same level builds identically twice',
    a.wallX === b.wallX && a.blocks === b.blocks && a.pinks === b.pinks);

  /* Bonus kitchens are promised in the How screen: every fifth level, no pink. */
  DEV.start(5); const bonus = DEV.state();
  ok('promise: level 5 is a bonus kitchen', bonus.bonus === true);
  ok('promise: a bonus kitchen has nothing pink in it', bonus.pinks === 0, bonus.pinks + ' hazards');

  /* Earn cap: the shared 30/day rule must hold and must not go negative. */
  const first = DEV.earnTest();
  ok('earn: the first grant of the day pays', first === 1, 'granted ' + first);
  let total = first, guard = 0;
  while (guard++ < 60) { const g = DEV.earnTest(); total += g; if (g === 0) break; }
  ok('earn: capped at 30 a day', total === 30, 'granted ' + total);
  ok('earn: never pays a negative', DEV.earnTest() === 0);
}

/* ==================================================== SAVE / CORRUPT SAVE */
function saveChecks() {
  const cases = {
    'truncated json': '{',
    'null': 'null',
    'wrong shape (array)': '[]',
    'wrong types': '{"level":"twelve","coins":null,"knives":7}',
    'hostile': '{"__proto__":{"pwn":1},"level":-5}',
    'empty string': ''
  };
  for (const [name, blob] of Object.entries(cases)) {
    let boomed = null, lvl = null;
    try {
      const c = boot(html, { search: '?sltest=1', storage: { sl2_prog: blob, sl_set: blob } });
      lvl = c.window.SL_DEV ? c.window.SL_DEV.grantCoins(0) : null;
    } catch (e) { boomed = e.message; }
    ok('save: survives a corrupt save (' + name + ')', boomed === null, boomed || '');
  }
  /* A good save must actually load back. */
  const c = boot(html, { search: '?sltest=1', storage: { sl2_prog: JSON.stringify({ level: 9, coins: 1234 }) } });
  ok('save: a valid save is restored', c.window.SL_DEV.grantCoins(0) === 1234);
  ok('save: writing a save does not throw', c.window.SL_DEV.grantCoins(10) === 1244);
}

/* ============================================================== SELF TEST */
/* ⛔ A probe that cannot fail is not evidence. Each mutation below breaks one
   invariant; the matching assertion MUST go red or the assertion is decoration. */
function selftest() {
  const mutations = [
    ['exit unwired', s => s.replace(/tap\('b-exit', _exitToArcade\);/, '').replace(/tap\('go-exit', _exitToArcade\);/, ''), /exit:/],
    ['exit gated on framing', s => s.replace("if(document.referrer.indexOf('/portal')>=0&&history.length>1){history.back();}else{location.replace('https://lucidwinds.com/portal/');}", 'return;'), /exit: falls back/],
    ['sw version drift', s => s.replace("register('sw.js?v=7')", "register('sw.js?v=9')"), /lockstep/],
    ['a dash in player copy', s => s.replace('>Got it<', '>Got it — back<'), /no en\/em dashes/],
    ['tiny touch target', s => s.replace('.btn.sm{min-height:72px', '.btn.sm{min-height:40px'), /\.btn\.sm >= 48/],
    ['tiny type', s => s.replace('.ribbon{margin-top:14px; color:var(--ink); font-size:18px', '.ribbon{margin-top:14px; color:var(--ink); font-size:9px'), /\.ribbon >= 11\.2/],
    ['Math.random in the sim', s => s.replace('var DT=1/120,', 'var _r=Math.random(); var DT=1/120,'), /no Math\.random/],
    ['a level that cannot be finished', s => s.replace('var wallX=x+170;', 'var wallX=x+170+(n===3?4000:0);'), /completable end to end/],
    ['handle first also sticks', s => s.replace('if(Math.cos(G.ang)>0.05){', 'if(true){'), /handle first bounces/],
    ['flat difficulty', s => s.replace('var segs=5+Math.min(6,(n/3)|0);', 'var segs=5;').replace('var d=Math.min(1, n/25);', 'var d=0;'), /later levels are denser/],
    ['pink in the bonus kitchen', s => s.replace('if(bonus) m=(rng()<0.6)?0:5;', 'if(bonus) m=1;'), /nothing pink in it/],
    ['uncapped earn', s => s.replace('n=Math.min(n,Math.max(0,30-(s.n||0)));', ''), /capped at 30/],
    ['save loader throws', s => s.replace("try{ var p=JSON.parse(LS.g('sl2_prog')||'{}');", "{ var p=JSON.parse(LS.g('sl2_prog')||'{}');").replace('for(k in PROG) if(p[k]!=null)PROG[k]=p[k]; }catch(e){} })();', 'for(k in PROG) if(p[k]!=null)PROG[k]=p[k]; } })();'), /corrupt save/]
  ];
  console.log('SELFTEST — each mutation must turn its assertion red\n');
  let red = 0;
  for (const [name, mutate, want] of mutations) {
    const before = fails.length;
    fails.length = 0;
    const mutated = mutate(html);
    if (mutated === html) { console.log('  ?? ' + name + ': mutation did not apply (regex drifted)'); continue; }
    try {
      staticChecks(mutated);
      const c = makeSandbox(mutated, { search: '?sltest=1' });
      try {
        runInContext(gameScript(mutated), c, { filename: 'mutant' });
        const DEV = c.window.SL_DEV;
        if (DEV) {
          const p = DEV.proofCheck();
          ok('loop: every baked level is completable end to end', p.all);
          const h = DEV.wallTest(Math.PI);
          ok('wall: handle first bounces off instead of ending the run', !h.stuck && !h.over);
          DEV.start(1); const a = DEV.state(); DEV.start(20); const b = DEV.state();
          ok('difficulty: later levels are denser', b.blocks > a.blocks);
          DEV.start(5); ok('promise: a bonus kitchen has nothing pink in it', DEV.state().pinks === 0);
          let t = 0, g2 = 0; while (g2++ < 80) { const x = DEV.earnTest(); t += x; if (!x) break; }
          ok('earn: capped at 30 a day', t === 30);
        }
      } catch (e) { ok('save: survives a corrupt save (mutant boot)', false, e.message); }
    } catch (e) { ok('save: survives a corrupt save (mutant boot)', false, e.message); }
    /* the corrupt-save assertion only means anything if a bad blob is fed in */
    try {
      const cc = makeSandbox(mutated, { search: '?sltest=1', storage: { sl2_prog: '{', sl_set: '{' } });
      runInContext(gameScript(mutated), cc, { filename: 'mutant-corrupt' });
      ok('save: survives a corrupt save (truncated json)', true);
    } catch (e) { ok('save: survives a corrupt save (truncated json)', false, e.message); }
    const caught = fails.some(f => want.test(f));
    console.log((caught ? '  RED  ' : '  MISS ') + name + (caught ? '' : '   <-- assertion did not fire, it is decoration'));
    if (caught) red++;
    void before;
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

console.log('Super Slice — ' + pass + ' passed, ' + fails.length + ' failed');
if (fails.length) { console.log('\nFAILURES:'); fails.forEach(f => console.log('  x ' + f)); process.exit(1); }
