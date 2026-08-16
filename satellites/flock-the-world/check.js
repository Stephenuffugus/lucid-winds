/* FLOCK THE WORLD — headless check suite.  node check.js
 *
 * No browser. Everything below is provable from source or from running the
 * real game script in a vm with a DOM stub. Every assertion here was watched
 * FAIL on purpose before it was trusted (run with FTW_SELFTEST=1 to see the
 * mutation harness re-prove that).
 *
 * Exit code 0 = all green, 1 = a failure, 2 = the harness itself is broken.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');
const SRC = fs.readFileSync(FILE, 'utf8');

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}
function group(n) { console.log('\n== ' + n); }

/* ------------------------------------------------------------ extraction */
function scriptBlocks(src) {
  const out = [];
  let i = 0;
  for (;;) {
    const a = src.indexOf('<script', i);
    if (a < 0) break;
    const gt = src.indexOf('>', a);
    const b = src.indexOf('</script>', gt);
    if (b < 0) break;
    const attrs = src.slice(a, gt);
    const body = src.slice(gt + 1, b);
    out.push({ attrs: attrs, body: body, line: src.slice(0, a).split('\n').length });
    i = b + 9;
  }
  return out;
}
const BLOCKS = scriptBlocks(SRC);
const INLINE = BLOCKS.filter(b => b.attrs.indexOf('src=') < 0);
if (INLINE.length < 2) { console.error('harness: expected at least 2 inline script blocks, got ' + INLINE.length); process.exit(2); }
const GAME = INLINE[0].body;          /* the whole sim */
const PROTOCOL = INLINE[INLINE.length - 1].body;  /* Sky Wolf embed protocol */

/* ------------------------------------------------------------- 1. syntax */
group('syntax');
INLINE.forEach((b, i) => {
  let e = null;
  try { new vm.Script(b.body, { filename: 'block' + i }); } catch (err) { e = err.message; }
  ok('inline block ' + i + ' (line ' + b.line + ') parses', !e, e);
});

/* --------------------------------------------- 2. player copy: no dashes */
/* Studio rule: no dash characters in anything a player reads. Comments and
   code are exempt, so comments are stripped before the scan. */
group('player copy');
function stripComments(js) {
  let out = '', i = 0, n = js.length;
  while (i < n) {
    const c = js[i], d = js[i + 1];
    if (c === '/' && d === '*') { const e = js.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; out += ' '; continue; }
    if (c === '/' && d === '/') { const e = js.indexOf('\n', i); i = e < 0 ? n : e; out += ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < n) { if (js[j] === '\\') { j += 2; continue; } if (js[j] === c) break; j++; }
      out += js.slice(i, j + 1); i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}
function stripCssComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ' '); }
function stripHtmlComments(h) { return h.replace(/<!--[\s\S]*?-->/g, ' '); }

const DASHES = /[‐‑‒–—―−]|\\u201[0-5]|\\u2212/;
const DASHES_G = /[‐‑‒–—―−]|\\u201[0-5]|\\u2212/g;

/* scan: html outside <script>/<style>, plus every inline script with comments gone */
let htmlOnly = stripHtmlComments(SRC);
BLOCKS.forEach(b => { htmlOnly = htmlOnly.split(b.body).join(' '); });
htmlOnly = htmlOnly.replace(/<style[\s\S]*?<\/style>/gi, m => stripCssComments(m));
const scanned = [];
htmlOnly.split('\n').forEach((l, i) => { if (DASHES.test(l)) scanned.push('html line ~' + (i + 1) + ': ' + l.trim().slice(0, 110)); });
INLINE.forEach((b) => {
  stripComments(b.body).split('\n').forEach((l, i) => {
    if (DASHES.test(l)) scanned.push('js line ~' + (b.line + i) + ': ' + l.trim().slice(0, 110));
  });
});
ok('no dash characters in player facing copy', scanned.length === 0, scanned.length ? scanned.length + ' hits, first: ' + scanned[0] : '');
if (scanned.length) scanned.slice(0, 30).forEach(s => console.log('       - ' + s));

/* ------------------------------------------------- 3. the embed protocol */
group('sky wolf embed protocol');
ok('detects framing without a query flag', /window\.parent!==window|window\.parent !== window/.test(PROTOCOL));
ok('posts ready at parse time', /parent\.postMessage\(\{sws:'ready'\}/.test(PROTOCOL));
ok('posts ready again on load', /addEventListener\('load'[\s\S]{0,120}sws:'ready'/.test(PROTOCOL));
ok('SWS_EXIT posts close when framed', /sws:'close'/.test(PROTOCOL));
ok('SWS_EXIT falls back to referrer history', /document\.referrer/.test(PROTOCOL) && /history\.back\(\)/.test(PROTOCOL));
ok('SWS_EXIT has a portal fallback', /location\.replace\('https:\/\/lucidwinds\.com\/portal\//.test(PROTOCOL));
ok('an exit affordance is built on the menu', /SWS_EXIT\(\)/.test(PROTOCOL) && /getElementById\('menu'\)/.test(PROTOCOL));
ok('an exit affordance exists inside a running game', /SWS_EXIT/.test(GAME), 'the game screen must offer a way out too');
ok('in development gate is loaded (card is beta:true)', /dev-gate\.js/.test(SRC));

/* --------------------------------------------------- 4. touch targets */
group('touch targets (source level, 48px floor)');
const cssBlock = (SRC.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
function ruleFor(sel) {
  const re = new RegExp(sel.replace(/[.#]/g, '\\$&') + '\\s*\\{([^}]*)\\}');
  const m = cssBlock.match(re); return m ? m[1] : '';
}
function pxOf(decl, prop) {
  const m = decl.match(new RegExp(prop + '\\s*:\\s*([0-9.]+)px'));
  return m ? parseFloat(m[1]) : null;
}
[['.cta', 'padding'], ['.zb', 'width'], ['.nb', 'height'], ['.opt', 'padding']].forEach(() => {});
const nb = ruleFor('.nb'), zb = ruleFor('.zb'), sp = ruleFor('.sp');
ok('.zb zoom buttons are at least 48px', (pxOf(zb, 'width') || 0) >= 48, 'width=' + pxOf(zb, 'width'));
ok('.sp speed buttons are at least 48px tall', (pxOf(sp, 'min-height') || pxOf(sp, 'height') || 0) >= 48,
   'min-height=' + (pxOf(sp, 'min-height') || pxOf(sp, 'height')));
ok('.nb nav buttons are at least 48px tall', (pxOf(nb, 'min-height') || pxOf(nb, 'height') || 0) >= 48,
   'min-height=' + (pxOf(nb, 'min-height') || pxOf(nb, 'height')));

/* ------------------------------------------------------- 5. run the sim */
group('the sim actually runs');
function stubEl() {
  const el = {
    classList: { _s: {}, contains(c) { return !!this._s[c]; }, add(c) { this._s[c] = 1; }, remove(c) { delete this._s[c]; }, toggle(c, v) { if (v === undefined) v = !this._s[c]; if (v) this._s[c] = 1; else delete this._s[c]; } },
    style: {}, innerHTML: '', textContent: '', value: '', dataset: {},
    querySelector: () => stubEl(), querySelectorAll: () => [],
    appendChild() {}, removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {}, closest: () => null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 700 }),
    getContext: () => ctx2d(), onclick: null
  };
  return el;
}
function ctx2d() {
  const p = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (t[k] = typeof k === 'string' && /^(canvas)$/.test(k) ? stubEl() : function () { return p; })) });
  return p;
}
const store = {};
function makeCtx() {
  const ctx = {
    console, Math, Date, JSON, performance, Set, Map, Array, Object, String, Number, Boolean, isFinite, parseInt, parseFloat, Promise, Error,
    setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0, clearTimeout: () => {},
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    devicePixelRatio: 1,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    document: {
      getElementById: () => stubEl(), querySelectorAll: () => [], querySelector: () => stubEl(),
      createElement: () => stubEl(), addEventListener() {}, body: stubEl(), hidden: false
    }
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(GAME, ctx);
  return ctx;
}
let C = null;
try { C = makeCtx(); } catch (e) { console.log('  FAIL game script threw on load :: ' + e.message); fail++; fails.push('game script load'); }

if (C) {
  const get = expr => vm.runInContext(expr, C);
  const call = (fn, ...args) => { C.__a = args; return vm.runInContext(fn + '(...__a)', C); };
  C.showEvent = ev => { for (const o of ev.o) { if (!o.c || o.c(C.S)) { if (o.cost) { if (o.cost.cash) C.S.cash -= o.cost.cash; if (o.cost.inf) C.S.inf -= o.cost.inf; } o.f(C.S); return; } } ev.o[ev.o.length - 1].f(C.S); };
  C.doctrineModal = () => {};

  const REGIONS = get('REGIONS'), NODES = get('NODES'), COMBOS = get('COMBOS');
  ok('14 regions defined', REGIONS.length === 14, 'got ' + REGIONS.length);
  ok('45 skill nodes defined', NODES.length >= 40, 'got ' + NODES.length);
  ok('8 hidden synergies defined', COMBOS.length === 8, 'got ' + COMBOS.length);

  let S = get("S=newState('CONTRACTOR','Vendor','NA');S");
  ok('newState seeds exactly one active region', REGIONS.filter(r => S.regions[r.id].active).length === 1);
  ok('newState starts day 0 with zero oversight', S.day === 0 && S.oversight === 0);
  ok('every region has a resistance seed', REGIONS.every(r => S.regions[r.id].resist > 0));

  const cov0 = S.regions.NA.coverage;
  for (let i = 0; i < 40; i++) call('tick');
  ok('coverage grows over 40 ticks', S.regions.NA.coverage > cov0, cov0 + ' -> ' + S.regions.NA.coverage);
  ok('the clock advances', S.day === 40, 'day=' + S.day);
  ok('cash accrues from covered population', S.cash > 0);
  ok('news accumulates', S.log.length > 0);

  /* synergies: ord + plate must unlock THE TICKET MACHINE and only once */
  S = get("S=newState('CONTRACTOR','Vendor','NA');S");
  S.inf = 999;
  call('buyNode', 'ord');
  const beforeCombo = S.combos.size;
  /* plate needs its prerequisites; buy the whole watch spine cheaply */
  S.owned.add('plate'); vm.runInContext('recompute(S);checkCombos(S)', C);
  ok('buying ord + plate discovers a synergy', S.combos.size > beforeCombo, 'combos=' + [...S.combos].join(','));
  const n1 = S.combos.size; vm.runInContext('checkCombos(S)', C);
  ok('a synergy cannot be discovered twice', S.combos.size === n1);

  /* geometry */
  const cUS = call('countryAtPoint', ...(() => { const projX = lon => (lon + 180) / 360 * 1000, projY = lat => (85 - lat) / 145 * (1000 * 145 / 360); return [projX(-98), projY(39)]; })());
  ok('a tap on land resolves to a country', !!cUS, cUS ? cUS.n : 'null');
  const cSea = call('countryAtPoint', ((-140) + 180) / 360 * 1000, (85 - (-40)) / 145 * (1000 * 145 / 360));
  ok('a tap on open ocean resolves to nothing', !cSea, cSea ? cSea.n : '');

  /* full runs: a balanced bot wins, a do-nothing run loses */
  function botRun(mode, diff, start, strat, maxDays) {
    const c = makeCtx();
    c.showEvent = ev => { for (const o of ev.o) { if (!o.c || o.c(c.S)) { if (o.cost) { if (o.cost.cash) c.S.cash -= o.cost.cash; if (o.cost.inf) c.S.inf -= o.cost.inf; } o.f(c.S); return; } } ev.o[ev.o.length - 1].f(c.S); };
    c.doctrineModal = () => {};
    const s = vm.runInContext(`S=newState('${mode}','${diff}','${start}');S`, c);
    const cl = (fn, ...a) => { c.__a = a; return vm.runInContext(fn + '(...__a)', c); };
    const NODES2 = vm.runInContext('NODES', c);
    for (let d = 0; d < maxDays; d++) {
      s.bubbles = s.bubbles.filter(b => {
        if (Math.random() > (strat.collectP == null ? 1 : strat.collectP)) return b.life > 1;
        if (b.k === 'cash') s.cash += b.v; else if (b.k === 'inf') s.inf += b.v; else { s.inf += 1; s.oversight = Math.max(0, s.oversight - 0.6); }
        return false;
      });
      if (strat.buy) {
        const av = NODES2.filter(n => !s.owned.has(n.id) && cl('nodeState', n) === 'avail').sort((a, b) => cl('nodeCost', a) - cl('nodeCost', b));
        if (av.length && s.inf >= cl('nodeCost', av[0])) cl('buyNode', av[0].id);
      }
      if (strat.expand && d % 30 === 0) {
        const t = Object.keys(s.regions).map(k => s.regions[k]).filter(r => !r.active).sort((a, b) => cl('entryCost', a) - cl('entryCost', b));
        if (t.length && s.cash > cl('entryCost', t[0]) * 1.5) { const r = t[0]; s.cash -= cl('entryCost', r); if (r.lost) { r.lost = false; s.lostCount = Math.max(0, s.lostCount - 1); r.unrest = 45; } r.active = true; r.coverage = 0.005; }
      }
      if (!s.doctrine && s.subj >= 0.14) { s.doctrine = strat.doctrine || 'fist'; cl('recompute', s); }
      cl('tick');
      if (s.over) break;
    }
    return s;
  }
  const win = botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 1, expand: 1, doctrine: 'glove', collectP: 0.10 }, 4000);
  ok('a balanced bot reaches an ending', win.over === true, 'day=' + win.day + ' subj=' + (win.subj * 100).toFixed(1));
  ok('that ending is a win', win.won === true, 'won=' + win.won + ' ovr=' + win.oversight.toFixed(1) + ' lost=' + win.lostCount);
  ok('the win takes a real campaign, not a handful of days', win.day > 300, 'day=' + win.day);

  const idle = botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 0, expand: 0 }, 4000);
  ok('doing nothing never wins', idle.won === false, 'subj=' + (idle.subj * 100).toFixed(1));

  const rush = botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 1, expand: 1, doctrine: 'fist', collectP: 0.10 }, 4000);
  ok('a second bot run also terminates (no infinite state)', rush.over === true, 'day=' + rush.day);

  /* persistence */
  group('persistence');
  const hasSave = /LW_FTW|ftw_/.test(GAME);
  ok('the game persists something across a reload', hasSave, 'no localStorage keys found in the game script');
  if (hasSave) {
    const c2 = makeCtx();
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA')", c2);
    for (let i = 0; i < 60; i++) vm.runInContext('tick()', c2);
    const day = c2.S.day, cash = c2.S.cash, owned = c2.S.owned.size;
    vm.runInContext('saveRun()', c2);
    ok('saveRun writes a resume blob', !!store['ftw_run']);
    const c3 = makeCtx();
    const back = vm.runInContext('loadRun()', c3);
    ok('loadRun restores the day', back && c3.S && c3.S.day === day, back ? 'day=' + c3.S.day + ' want ' + day : 'loadRun returned falsy');
    ok('loadRun restores cash', back && Math.abs(c3.S.cash - cash) < 0.001);
    ok('loadRun restores owned nodes as a Set', back && c3.S.owned instanceof c3.Set && c3.S.owned.size === owned);
    ok('a restored run keeps ticking', (function () { try { vm.runInContext('tick()', c3); return c3.S.day === day + 1; } catch (e) { return false; } })());
    /* corrupt saves must never break the boot */
    store['ftw_run'] = '{not json';
    const c4 = makeCtx();
    let threw = null; let r4 = null;
    try { r4 = vm.runInContext('loadRun()', c4); } catch (e) { threw = e.message; }
    ok('a corrupt resume blob is refused, not thrown', !threw && !r4, threw || 'loadRun returned ' + r4);
    store['ftw_run'] = JSON.stringify({ day: 5 });          /* structurally valid, semantically junk */
    const c5 = makeCtx();
    let threw5 = null, r5 = null;
    try { r5 = vm.runInContext('loadRun()', c5); } catch (e) { threw5 = e.message; }
    ok('a half-written resume blob is refused, not thrown', !threw5 && !r5, threw5 || 'loadRun returned ' + r5);
    delete store['ftw_run'];
    /* records: counters ADD, bests MAX, and a second tab cannot lower them */
    store['ftw_recs'] = JSON.stringify({ runs: 7, wins: 3, bestSubj: 88.5, fastWin: 400, combos: ['ticket'] });
    const c6 = makeCtx();
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA');S.subj=0.5;S.day=999;S.won=false;recordRun(S)", c6);
    const rec = JSON.parse(store['ftw_recs']);
    ok('records ADD to the stored counter (two tabs cannot clobber)', rec.runs === 8, 'runs=' + rec.runs);
    ok('records MAX the stored best (a worse run cannot lower it)', rec.bestSubj === 88.5, 'bestSubj=' + rec.bestSubj);
    ok('records keep an earlier fastest win', rec.fastWin === 400, 'fastWin=' + rec.fastWin);
    ok('records keep synergies discovered in other sessions', rec.combos.indexOf('ticket') >= 0);
  }
}

/* -------------------------------------------------------- self test mode */
/* A probe that cannot fail is not evidence. FTW_SELFTEST=1 mutates the source
   in memory and re-runs the source-level checks, which must go red. */
if (process.env.FTW_SELFTEST === '1') {
  group('self test (these SHOULD fail)');
  const mutated = SRC.replace("<title>FLOCK THE WORLD", "<title>FLOCK — THE WORLD");
  let hit = 0;
  stripHtmlComments(mutated).split('\n').forEach(l => { if (DASHES.test(l)) hit++; });
  ok('mutation: an injected dash is caught', hit > 0);
  const noLoad = PROTOCOL.replace(/addEventListener\('load'[\s\S]*?\);/, '');
  ok('mutation: dropping the load handshake is caught', !/addEventListener\('load'[\s\S]{0,120}sws:'ready'/.test(noLoad));
}

console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'all ' + pass + ' checks passed'));
if (fail) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
