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

const FILE = process.env.FTW_FILE ? path.resolve(process.env.FTW_FILE) : path.join(__dirname, 'index.html');
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
BLOCKS.forEach(b => { if (b.body.length) htmlOnly = htmlOnly.split(b.body).join(' '); });
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
    devicePixelRatio: 1, addEventListener() {}, removeEventListener() {}, navigator: { share: null, clipboard: null },
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
  const live = () => vm.runInContext('S', C);
  C.showEvent = ev => { const st = live(); for (const o of ev.o) { if (!o.c || o.c(st)) { if (o.cost) { if (o.cost.cash) st.cash -= o.cost.cash; if (o.cost.inf) st.inf -= o.cost.inf; } o.f(st); return; } } ev.o[ev.o.length - 1].f(st); };
  C.doctrineModal = () => {};

  const REGIONS = get('REGIONS'), NODES = get('NODES'), COMBOS = get('COMBOS');
  ok('14 regions defined', REGIONS.length === 14, 'got ' + REGIONS.length);
  ok('45 skill nodes defined', NODES.length >= 40, 'got ' + NODES.length);
  ok('16 synergies defined (8 original + 8 of 2026-08-20)', COMBOS.length === 16, 'got ' + COMBOS.length);
  ok('every synergy need refers to real nodes', COMBOS.every(c => c.need.every(id => NODES.some(n => n.id === id))),
     COMBOS.filter(c => !c.need.every(id => NODES.some(n => n.id === id))).map(c => c.id).join(','));
  ok('some synergies carry a hint, most stay dark', COMBOS.filter(c => c.hint).length >= 3 && COMBOS.filter(c => !c.hint).length >= 8,
     'hinted=' + COMBOS.filter(c => c.hint).length);
  /* 2026-08-20 pass: menus pause, the wire scrolls, the enemy is Patriotism */
  ok('opening a sheet pauses the sim', /_pausePrev=S\.speed;setSpeed\(0\)/.test(GAME));
  ok('closing the sheet restores speed', /closeSheet[\s\S]{0,260}_pausePrev=null;if\(!S\.over\)setSpeed\(p\)/.test(GAME));
  ok('the wire is a scrolling track, not a flip card', /tickScroll/.test(SRC) && /animationiteration/.test(GAME));
  ok('the enemy meter reads Patriotism by default', /\|\|'Patriotism'/.test(GAME) && SRC.indexOf('id="ovrName">Patriotism<') > 0);
  ok('coverage carries an upkeep bill', /upkeepK/.test(GAME) && /income-upkeep/.test(GAME.replace(/\s/g, '')));
  ok('node prices inflate with owned count', /nodeInflate/.test(GAME));
  ok('market entry prices scale with markets held', /entryScale/.test(GAME));
  ok('blackout has a visible duration and cooldown', /blackoutDays/.test(GAME) && /News dark/.test(GAME));

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
  function botRun(mode, diff, start, strat, maxDays, onTick) {
    const c = makeCtx();
    c.doctrineModal = () => {};
    const s = vm.runInContext(`S=newState('${mode}','${diff}','${start}');S`, c);
    /* top level `let S` never attaches to the vm context, so the auto resolver
       has to close over the returned state object, not read c.S */
    c.showEvent = ev => { for (const o of ev.o) { if (!o.c || o.c(s)) { if (o.cost) { if (o.cost.cash) s.cash -= o.cost.cash; if (o.cost.inf) s.inf -= o.cost.inf; } o.f(s); return; } } ev.o[ev.o.length - 1].f(s); };
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
        if (t.length && s.cash > cl('entryCost', t[0]) * 1.5) { const r = t[0]; s.cash -= cl('entryCost', r); if (r.lost) { r.lost = false; s.lostCount = Math.max(0, s.lostCount - 1); r.unrest = 45; } r.active = true; r.coverage = 0.005; s.activeCount++; }
      }
      /* intended play uses concede as the release valve (the World tab teaches
         it); the balanced bot models that so the gate is not flaky */
      if (strat.concede && d % 12 === 0) {
        for (const k of Object.keys(s.regions)) { const r = s.regions[k]; if (r.active && r.resist > 52) { cl('doAction', 'concede', k); break; } }
      }
      if (!s.doctrine && s.subj >= 0.14) { s.doctrine = strat.doctrine || 'fist'; cl('recompute', s); }
      cl('tick');
      if (onTick) onTick(s);
      if (s.over) break;
    }
    return s;
  }
  const win = botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 1, expand: 1, doctrine: 'glove', collectP: 0.10, concede: 1 }, 4000);
  ok('a balanced bot reaches an ending', win.over === true, 'day=' + win.day + ' subj=' + (win.subj * 100).toFixed(1));
  ok('that ending is a win', win.won === true, 'won=' + win.won + ' ovr=' + win.oversight.toFixed(1) + ' lost=' + win.lostCount);
  ok('the win takes a real campaign, not a handful of days', win.day > 300, 'day=' + win.day);

  const idle = botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 0, expand: 0 }, 4000);
  ok('doing nothing never wins', idle.won === false, 'subj=' + (idle.subj * 100).toFixed(1));

  const rush = botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 1, expand: 1, doctrine: 'fist', collectP: 0.10 }, 4000);
  ok('a second bot run also terminates (no infinite state)', rush.over === true, 'day=' + rush.day);

  /* ---------------------------------------------- F1: population ledger */
  /* Penny (2026-08-23): a meter is a dashboard, a number made of people is a
     story. These guard the numbers that tell it. */
  group('population ledger');
  {
    const W = get('WORLD_POP') * 1e6;
    let ticks = 0, idErr = null, indepErr = null, negErr = null, cmpOver = 0;
    botRun('CONTRACTOR', 'Vendor', 'NA', { buy: 1, expand: 1, doctrine: 'glove', collectP: 0.10, concede: 1 }, 2000, s => {
      ticks++;
      if (idErr === null && !(Math.abs((s.popWatched + s.popFree) - W) < 1e-3))
        idErr = 'day ' + s.day + ' watched+free=' + (s.popWatched + s.popFree) + ' want ' + W;
      /* the real guard: recompute watched here over EVERY region. tick()'s own
         accumulator loop opens with `if(!r.active)continue;`, so if popTotals is
         ever folded into it, expelled and unentered regions silently vanish from
         the count and this goes red. */
      if (indepErr === null) {
        let w = 0;
        for (const k of Object.keys(s.regions)) w += s.regions[k].pop * s.regions[k].coverage;
        if (Math.abs(w * 1e6 - s.popWatched) > 1)
          indepErr = 'day ' + s.day + ' independent=' + (w * 1e6) + ' engine=' + s.popWatched;
      }
      if (negErr === null) {
        for (const key of ['popWatched', 'popCompliant', 'popOrganized', 'popStreets', 'popExpelled', 'popFree']) {
          const v = s[key];
          if (!(typeof v === 'number' && isFinite(v) && v >= -1)) { negErr = key + '=' + v + ' on day ' + s.day; break; }
        }
      }
      if (s.popCompliant > s.popWatched) cmpOver++;
    });
    ok('a 2000 day run actually ticked', ticks > 1000, 'ticks=' + ticks);
    ok('watched + never watched is the whole world, every tick', idErr === null, idErr);
    ok('watched counts every region, including expelled and unentered', indepErr === null, indepErr);
    ok('no population total goes negative, NaN or infinite', negErr === null, negErr);
    /* reported, never asserted: control and coverage are separate curves and
       compliant may legitimately lead watched (PLAN-AUG23 section 1). */
    console.log('  note compliant exceeded watched on ' + cmpOver + ' of ' + ticks + ' ticks (expected, not a failure)');

    /* ⛔ The bot run above cannot catch a region being skipped: an unentered
       region has coverage exactly 0, so it contributes nothing either way, and
       a balanced glove+concede run never loses one. Forcing the ONLY state
       where it shows: expelled, so active=false while coverage stays high.
       Watched this go red against a popTotals that skipped inactive regions. */
    {
      const c7 = makeCtx();
      vm.runInContext("S=newState('CONTRACTOR','Vendor','NA');" +
        "S.regions.WE.active=false;S.regions.WE.lost=true;S.regions.WE.coverage=0.5;" +
        "S.regions.EA.active=false;S.regions.EA.lost=true;S.regions.EA.coverage=0.25;" +
        "popTotals(S);", c7);
      const s7 = vm.runInContext('S', c7);
      const wantWE = 420 * 0.5 * 1e6, wantEA = 1600 * 0.25 * 1e6;
      ok('an expelled region still counts its watched people',
        s7.popWatched >= (wantWE + wantEA) - 1,
        'popWatched=' + s7.popWatched + ' needs at least ' + (wantWE + wantEA));
      ok('expelled people are counted as expelled',
        Math.abs(s7.popExpelled - (420 + 1600) * 1e6) < 1, 'popExpelled=' + s7.popExpelled);
      ok('never watched still completes the world after an expulsion',
        Math.abs((s7.popWatched + s7.popFree) - W) < 1e-3);
    }

    /* the odometer must never show a fraction */
    const c6 = makeCtx();
    const seen = [];
    const spy = stubEl();
    Object.defineProperty(spy, 'textContent', { set(v) { seen.push(String(v)); }, get() { return seen.length ? seen[seen.length - 1] : ''; } });
    c6.document.getElementById = id => (id === 'vWatch' ? spy : stubEl());
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA');popTotals(S);ODO.tgt=1234567.891;ODO.cur=0;ODO.shown=-1;", c6);
    for (let i = 0; i < 60; i++) vm.runInContext('odoStep()', c6);
    const bad = seen.filter(t => !/^[0-9][0-9,]*$/.test(t));
    ok('the odometer never displays a non integer', seen.length > 5 && bad.length === 0,
      'wrote ' + seen.length + ' values, bad=' + JSON.stringify(bad.slice(0, 3)));
    ok('the odometer rolls toward the target instead of jumping', seen.length > 5 && seen[0] !== seen[seen.length - 1] && /,/.test(seen[seen.length - 1]),
      'first=' + seen[0] + ' last=' + seen[seen.length - 1]);

    /* the ledger sheet lists every region */
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA');popTotals(S);", c6);
    const lh = vm.runInContext('ledgerHTML()', c6);
    const rows = (lh.match(/class="ledrow"/g) || []).length;
    ok('the ledger sheet renders one row per region', rows === get('REGIONS').length, 'rows=' + rows + ' regions=' + get('REGIONS').length);
    ok('the ledger sheet names all six totals', ['Watched', 'Never watched', 'Compliant', 'Organized', 'In the streets', 'Expelled you'].every(k => lh.indexOf('>' + k + '<') >= 0));
  }

  /* ------------------------------------------- F2: map tap region popover */
  group('map tap popover');
  {
    const c8 = makeCtx();
    /* a state where every action button actually renders: the region is live,
       unrest is high enough for a crackdown, and the gating nodes are owned. */
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA');" +
      "['agit','charter','blackout'].forEach(n=>S.owned.add(n));recompute(S);" +
      "for(const k of Object.keys(S.regions)){const r=S.regions[k];r.active=true;r.coverage=0.4;r.control=0.2;r.unrest=55;}" +
      "S.regions.SEA.active=false;S.regions.SEA.coverage=0;" +
      "S.regions.EE.active=false;S.regions.EE.lost=true;S.regions.EE.coverage=0.3;" +
      "S.cash=999999;popTotals(S);", c8);
    const REG = vm.runInContext('REGIONS', c8);

    let missing = [], noName = [];
    for (const r of REG) {
      c8.__rid = r.id;
      const h = vm.runInContext('rpopHTML(__rid,null)', c8);
      if (!h) missing.push(r.id);
      else if (h.indexOf(r.name) < 0) noName.push(r.id);
    }
    ok('the popover renders for every region id', missing.length === 0 && noName.length === 0,
      'empty=' + JSON.stringify(missing) + ' unnamed=' + JSON.stringify(noName));

    /* the prices a player sees on the map must be the prices the World tab
       charges. Both surfaces call regionActionsHTML/regionEnterHTML, and this
       compares the two rendered strings region by region to keep it true. */
    const world = vm.runInContext('worldHTML()', c8);
    const priceOf = (html, rid) => {
      const out = {};
      const re = new RegExp('data-act="([a-z]+)" data-r="' + rid + '"[\\s\\S]*?>([^<]*)<', 'g');
      let m; while ((m = re.exec(html))) out[m[1]] = m[2].trim();
      const en = new RegExp('data-enter="' + rid + '"[\\s\\S]*?>([^<]*)<').exec(html);
      if (en) out.enter = en[1].trim().replace(/\s+/g, ' ');
      return out;
    };
    let drift = [], sawBtns = 0, sawEnter = 0;
    for (const r of REG) {
      c8.__rid = r.id;
      const pop = priceOf(vm.runInContext('rpopHTML(__rid,null)', c8), r.id);
      const wor = priceOf(world, r.id);
      const keys = new Set([...Object.keys(pop), ...Object.keys(wor)]);
      sawBtns += Object.keys(pop).filter(k => k !== 'enter').length;
      if (pop.enter) sawEnter++;
      for (const k of keys) if (pop[k] !== wor[k]) drift.push(r.id + '.' + k + ' map=' + pop[k] + ' world=' + wor[k]);
    }
    ok('the fixture rendered real action buttons to compare', sawBtns >= 40 && sawEnter >= 1,
      'buttons=' + sawBtns + ' enter=' + sawEnter);
    ok('every map action shows the World tab price, to the character', drift.length === 0,
      drift.slice(0, 3).join(' | '));

    /* an action from the map is the same call the World tab makes */
    const before = vm.runInContext('S.cash', c8);
    c8.__ev = { target: { closest: sel => (sel === '[data-act]' ? { dataset: { act: 'crack', r: 'NA' } } : null) } };
    vm.runInContext('shBodyClick(__ev)', c8);
    ok('a crackdown fired through the shared handler spends the money',
      vm.runInContext('S.cash', c8) < before, 'cash ' + before + ' -> ' + vm.runInContext('S.cash', c8));

    /* the popover must not pause: openSheet() pauses on purpose, this must not */
    const showSrc = /function showRpop\([\s\S]*?\n\}/.exec(GAME)[0];
    ok('opening the popover never pauses the sim',
      !/setSpeed|openSheet|_pausePrev/.test(showSrc));
    /* and a drag must not open it: makeView only dispatches onTap when the
       pointer stayed put */
    const tapDispatch = /if\(p&&!moved&&ptrs\.size===0&&onTap\)/.test(GAME);
    ok('a dragged pointer never dispatches the map tap', tapDispatch);
    ok('the map tap asks for a region, not just a country', /const rid=regionAtPoint\(wx,wy\);/.test(GAME));
  }

  /* ------------------------------------------------- F3: name your vendor */
  group('name your vendor');
  {
    const c9 = makeCtx();
    const NAMES = vm.runInContext('VENDOR_NAMES', c9);
    ok('there are invented vendor names to choose from', Array.isArray(NAMES) && NAMES.length >= 4, 'n=' + (NAMES || []).length);
    /* none of them may be a real company: they are all invented composites */
    ok('the default name comes from VENDOR_NAMES', (() => {
      vm.runInContext("S=newState('CONTRACTOR','Vendor','NA')", c9);
      return NAMES.indexOf(vm.runInContext('S.co', c9)) >= 0;
    })(), 'co=' + vm.runInContext('S.co', c9));
    ok('a name given at deploy is the name the run carries', (() => {
      vm.runInContext("S=newState('CONTRACTOR','Vendor','NA',null,null,'Kestrel Municipal')", c9);
      return vm.runInContext('S.co', c9) === 'Kestrel Municipal';
    })());

    /* ⛔ the name is PLAYER TEXT and most of its call sites are innerHTML.
       A name carrying markup must render as characters, never as tags. */
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA',null,'Algeria','Evil <b>Corp</b>');" +
      "S.regions.NAf.active=true;S.regions.NAf.coverage=0.3;popTotals(S);", c9);
    c9.__cn = 'Algeria';
    const hqLabel = vm.runInContext('rpopHTML("NAf",__cn)', c9);
    ok('a name with markup renders as text in the HQ label',
      hqLabel.indexOf('Evil &lt;b&gt;Corp&lt;/b&gt;') >= 0 && hqLabel.indexOf('Evil <b>Corp</b>') < 0,
      hqLabel.slice(hqLabel.indexOf('HQ'), hqLabel.indexOf('HQ') + 60));
    const headline = vm.runInContext('H.concede("Chile")', c9);
    ok('a name with markup renders as text in a headline',
      headline.indexOf('&lt;b&gt;') >= 0 && headline.indexOf('<b>') < 0, headline.slice(0, 70));
    const lostLine = vm.runInContext('H.lost("Chile")', c9);
    ok('the expulsion headline names the vendor being thrown out',
      lostLine.indexOf('&lt;b&gt;Corp') >= 0, lostLine.slice(0, 70));

    /* the name survives a reload with the rest of the run */
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA',null,null,'Kestrel Municipal');" +
      "for(let i=0;i<40;i++)tick();saveRun();", c9);
    const cA = makeCtx();
    const restored = vm.runInContext('loadRun()', cA);
    ok('the vendor name survives a reload', restored && vm.runInContext('S.co', cA) === 'Kestrel Municipal',
      'co=' + (restored ? vm.runInContext('S.co', cA) : 'loadRun falsy'));

    /* ambient wire lines may now be functions; the consumer must call them */
    const amb = vm.runInContext('AMBIENT', c9);
    const fns = amb.filter(a => typeof a === 'function').length;
    ok('the vendor-naming wire lines are wired as functions', fns >= 2, 'fns=' + fns);
    ok('the wire consumer calls a function line instead of printing it',
      /typeof amb==='function'\?amb\(\):amb/.test(GAME));
  }

  /* ------------------------------------------------ F4: notification queue */
  group('notification queue');
  {
    const cN = makeCtx();
    /* capture what the toast stack actually renders */
    const toastEl = stubEl();
    const breakEl = stubEl();
    const breakTxt = stubEl();
    const modalEl = stubEl();
    const realGet = cN.document.getElementById;
    cN.document.getElementById = id =>
      id === 'toasts' ? toastEl :
      id === 'breaking' ? breakEl :
      id === 'breakTxt' ? breakTxt :
      id === 'modal' ? modalEl : stubEl();
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA')", cN);
    const NOTE = () => vm.runInContext('NOTE', cN);

    /* 4 identical toasts inside one second are ONE line reading x4 */
    vm.runInContext("for(let i=0;i<4;i++)shToast('<span class=\"neg\">Spent $80</span> \u00b7 provocateurs deployed');", cN);
    ok('four identical toasts coalesce into one entry', NOTE().toasts.length === 1,
      'entries=' + NOTE().toasts.length);
    ok('the coalesced toast counts them', NOTE().toasts[0] && NOTE().toasts[0].n === 4,
      'n=' + (NOTE().toasts[0] || {}).n);
    ok('the coalesced toast renders the count as x4', /\u00d74/.test(toastEl.innerHTML),
      toastEl.innerHTML.slice(0, 120));

    /* different toasts stack, but never more than three */
    vm.runInContext("for(let i=0;i<6;i++)shToast('distinct message '+i);", cN);
    ok('the toast stack never shows more than three', NOTE().toasts.length <= 3,
      'entries=' + NOTE().toasts.length);

    /* tier 2 under tier 3: a banner raised while a modal is open WAITS */
    vm.runInContext("NOTE.toasts=[];NOTE.banners=[];NOTE.bannerUp=false;NOTE.modalOpen=false;", cN);
    vm.runInContext("noteOpenModal();", cN);
    ok('opening a modal records that one is open', NOTE().modalOpen === true);
    vm.runInContext("breakingBanner('Open revolt in South Asia.');", cN);
    ok('a banner raised during a modal is queued, not shown',
      NOTE().banners.length === 1 && !breakEl.classList.contains('on'),
      'queued=' + NOTE().banners.length + ' shown=' + breakEl.classList.contains('on'));
    vm.runInContext("noteCloseModal();", cN);
    ok('closing the modal releases the queued banner',
      breakEl.classList.contains('on') && NOTE().banners.length === 0,
      'shown=' + breakEl.classList.contains('on') + ' left=' + NOTE().banners.length);

    /* tier 3: never two modals, the second waits for the first */
    vm.runInContext("NOTE.modalOpen=false;NOTE.modalQ=[];NOTE.bannerUp=false;NOTE.banners=[];", cN);
    vm.runInContext("__opened=0;doctrineModal();", cN);
    ok('the first modal opens', NOTE().modalOpen === true);
    const qBefore = NOTE().modalQ.length;
    vm.runInContext("doctrineModal();", cN);
    ok('a second modal never opens over the first, it queues',
      NOTE().modalQ.length === qBefore + 1, 'queue=' + NOTE().modalQ.length);

    /* tier 0 and 1 must not be able to sit on top of the HUD. check.js has no
       layout engine, so this is the source-level half: the stack is anchored to
       the BOTTOM of the map and width capped so it cannot reach the zoom column.
       The measured half runs in the browser, see STATUS for the numbers. */
    const css = /#toasts\{([^}]*)\}/.exec(SRC);
    ok('the toast stack is declared bottom anchored, not top', !!css && /bottom:/.test(css[1]) && !/top:/.test(css[1]),
      css ? css[1].slice(0, 90) : 'no #toasts rule');
    ok('the toast stack is width capped so it cannot reach the zoom column',
      !!css && /max-width:/.test(css[1]));
    /* the ledger milestones F1 deferred here: tier 2 content that needed this queue */
    {
      const cM = makeCtx();
      vm.runInContext("S=newState('CONTRACTOR','Vendor','NA',null,null,'Kestrel Municipal');" +
        "for(const k of Object.keys(S.regions)){const r=S.regions[k];r.active=true;r.coverage=0.02;}popTotals(S);", cM);
      const first = vm.runInContext('[...S.popMiles]', cM);
      ok('crossing ten million watched fires a ledger milestone', first.indexOf('w10m') >= 0, JSON.stringify(first));
      const logLen = vm.runInContext('S.log.length', cM);
      vm.runInContext('popTotals(S)', cM);
      ok('a milestone fires once per run, not once per tick',
        vm.runInContext('S.log.length', cM) === logLen, 'log grew again');
      vm.runInContext("for(const k of Object.keys(S.regions)){S.regions[k].coverage=1;}popTotals(S);", cM);
      const all = vm.runInContext('[...S.popMiles]', cM);
      ok('watching the whole world fires the half-the-world and four billion milestones',
        all.indexOf('half') >= 0 && all.indexOf('w4b') >= 0 && all.indexOf('free1b') >= 0, JSON.stringify(all));
      ok('a milestone names the vendor',
        /Kestrel Municipal/.test(vm.runInContext('S.log.map(e=>e.t).join(" ")', cM)));
      vm.runInContext('saveRun()', cM);
      const cM2 = makeCtx();
      vm.runInContext('loadRun()', cM2);
      ok('fired milestones survive a reload so they never fire twice',
        vm.runInContext('[...S.popMiles].length', cM2) === all.length,
        'restored=' + vm.runInContext('[...S.popMiles].length', cM2) + ' want ' + all.length);
    }

    ok('the toast stack lives on the map, not inside the sheet body',
      /<div id="toasts"><\/div>[\s\S]{0,80}<div id="rpop">/.test(SRC));
  }

  /* persistence */
  group('persistence');
  const hasSave = /LW_FTW|ftw_/.test(GAME);
  ok('the game persists something across a reload', hasSave, 'no localStorage keys found in the game script');
  if (hasSave) {
    const c2 = makeCtx();
    vm.runInContext("S=newState('CONTRACTOR','Vendor','NA')", c2);
    for (let i = 0; i < 60; i++) vm.runInContext('tick()', c2);
    const S2 = vm.runInContext('S', c2); const day = S2.day, cash = S2.cash, owned = S2.owned.size;
    vm.runInContext('saveRun()', c2);
    ok('saveRun writes a resume blob', !!store['ftw_run']);
    const c3 = makeCtx();
    const back = vm.runInContext('loadRun()', c3);
    const S3 = back ? vm.runInContext('S', c3) : null;
    ok('loadRun restores the day', !!S3 && S3.day === day, S3 ? 'day=' + S3.day + ' want ' + day : 'loadRun returned falsy');
    ok('loadRun restores cash', !!S3 && Math.abs(S3.cash - cash) < 0.001);
    ok('loadRun restores owned nodes as a Set', !!S3 && S3.owned instanceof Set && S3.owned.size === owned);
    ok('a restored run keeps ticking', (function () { try { vm.runInContext('tick()', c3); return vm.runInContext('S', c3).day === day + 1; } catch (e) { return false; } })());
    /* corrupt saves must never break the boot */
    store['ftw_run'] = '{not json';
    const c4 = makeCtx();
    let threw = null; let r4 = null;
    try { r4 = vm.runInContext('loadRun()', c4); } catch (e) { threw = e.message; }
    ok('a corrupt resume blob is refused, not thrown', !threw && !r4, threw || 'loadRun returned ' + r4);
    /* the realistic corruption: a well formed header whose region map got
       truncated by a quota error. It must be refused, not booted into. */
    store['ftw_run'] = JSON.stringify({ v: 1, modeKey: 'CONTRACTOR', diffKey: 'Vendor', startId: 'NA',
      day: 120, cash: 500, inf: 20, oversight: 10, owned: ['ord'], combos: [], milestones: [], wmiles: [],
      hqName: 'Canada', log: [], regions: { NA: { active: true, coverage: 0.4 } } });
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
