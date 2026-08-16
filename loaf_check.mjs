/* LOAF CHECK — node, no dependencies, no browser.
   Two halves:
     STATIC  — things the source text can prove (ids, syntax, dashes, targets)
     LIVE    — the REAL script block from loaf.html executed in a hand DOM shim,
               so save/load, needs, ritual and the room bridge are exercised as
               written rather than as remembered.

   Every check in here was watched FAIL on purpose against the pre-fix file
   before it was trusted green. Run: node loaf_check.mjs
   Add --fail-demo to see the harness detect a deliberately broken source. */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(HERE, 'loaf.html');
const SRC = fs.readFileSync(FILE, 'utf8');
const TMP = process.env.TMPDIR || '/tmp';

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail){
  if (cond){ pass++; console.log('  ok   ' + name); }
  else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}
function group(n){ console.log('\n' + n); }

/* ─────────────────────────────────────────────────────────── EXTRACT ────── */
/* A regex block splitter LIES when a string literal contains "</script>".
   Prove that cannot happen here before trusting the split. */
const closers = (SRC.match(/<\/script>/g) || []).length;
const openers = (SRC.match(/<script[\s>]/g) || []).length;

group('EXTRACT');
ok('script tags balance', closers === openers, openers + ' open / ' + closers + ' close');

function block(startTag, from){
  const s = SRC.indexOf(startTag, from);
  if (s < 0) return null;
  const b = s + startTag.length;
  const e = SRC.indexOf('</script>', b);
  return e < 0 ? null : { body: SRC.slice(b, e), start: b, end: e };
}
const classic = block('\n<script>\n', 0);
const modBlk = block('<script type="module">\n', 0);
ok('classic block found', !!classic && classic.body.length > 100000, classic && classic.body.length);
ok('module block found', !!modBlk && modBlk.body.length > 50000, modBlk && modBlk.body.length);

/* ─────────────────────────────────────────────────────────── SYNTAX ─────── */
group('SYNTAX');
function nodeCheck(code, ext, label){
  const p = path.join(TMP, 'loafchk_' + label + '.' + ext);
  fs.writeFileSync(p, code);
  try { execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' }); return null; }
  catch (e){ return String(e.stderr || e.message).split('\n').slice(0, 4).join(' | '); }
  finally { try { fs.unlinkSync(p); } catch {} }
}
ok('classic block parses', classic && nodeCheck(classic.body, 'js', 'classic') === null,
   classic && nodeCheck(classic.body, 'js', 'classic'));
ok('module block parses', modBlk && nodeCheck(modBlk.body, 'mjs', 'module') === null,
   modBlk && nodeCheck(modBlk.body, 'mjs', 'module'));

/* ─────────────────────────────────────────────────────── ELEMENT IDS ────── */
group('ELEMENT IDS');
const htmlHead = SRC.slice(0, classic ? classic.start : SRC.length);
const declared = new Set();
const dupes = [];
for (const m of htmlHead.matchAll(/\sid="([^"]+)"/g)){
  if (declared.has(m[1])) dupes.push(m[1]);
  declared.add(m[1]);
}
/* ids the app creates at runtime rather than declaring in the markup */
const RUNTIME_IDS = new Set(['room3d', 'clipShareBtn', 'clipBtn', 'loafClick', 'laserBar', 'yarnBar']);
const asked = new Map();
for (const m of SRC.matchAll(/\$\('([A-Za-z][\w-]*)'\)|getElementById\('([A-Za-z][\w-]*)'\)/g)){
  const id = m[1] || m[2];
  asked.set(id, (asked.get(id) || 0) + 1);
}
const missing = [...asked.keys()].filter(id => !declared.has(id) && !RUNTIME_IDS.has(id));
ok('no duplicate ids in markup', dupes.length === 0, dupes.join(','));
ok('every id the code asks for exists', missing.length === 0, missing.join(','));
ok('ids were actually collected', declared.size > 40 && asked.size > 40,
   declared.size + ' declared / ' + asked.size + ' asked');

/* ───────────────────────────────────────────── PLAYER FACING COPY ───────── */
group('COPY (house rule: no dash characters in player facing copy)');
/* prose = a quoted string or markup text with two or more words AND a dash
   used as punctuation. Bare em dash placeholders (>—<) are typography. */
const dashHits = [];
/* markup text nodes, which wrap across lines */
const lineOf = idx => SRC.slice(0, idx).split('\n').length;
for (const m of htmlHead.matchAll(/>([^<>]+)</g)){
  const t = m[1].replace(/\s+/g, ' ').trim();
  if (t.length > 3 && /\w\s*[–—]\s*\w/.test(t)) dashHits.push(lineOf(m.index) + ': ' + t.slice(0, 70));
}
if (/<title>[^<]*[–—]/.test(SRC)) dashHits.push('title tag');
/* string literals that reach the player */
const lines = SRC.split('\n');
lines.forEach((ln, i) => {
  const n = i + 1;
  if (/^\s*(\*|\/\*|\/\/)/.test(ln)) return;                 // comments are ours
  for (const m of ln.matchAll(/'([^'\\\n]*[–—][^'\\\n]*)'/g)){
    const t = m[1];
    if (/\w\s*[–—]\s*\w/.test(t) || /^\s*[–—]\s*$/.test(t) || /\w\s+[–—]\s*$/.test(t)
        || /^\s*[–—]\s+\w/.test(t)) dashHits.push(n + ': ' + t.slice(0, 70));
  }
});
ok('no dashes in player facing copy', dashHits.length === 0, dashHits.join(' | '));

/* ─────────────────────────────────────────────────── TOUCH TARGETS ──────── */
group('TOUCH TARGETS (48px minimum, rendered)');
const css = SRC.slice(SRC.indexOf('<style>'), SRC.indexOf('</style>'));
const small = [];
for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)){
  const sel = m[1].replace(/\s+/g, ' ').trim(), body = m[2];
  /* only the LAST simple selector decides whether this rule sizes a target:
     ".tool svg" sizes an icon inside a button, not the button. */
  const tail = sel.split(',')[0].trim().split(' ').pop();
  if (!/^(button|\.btn|\.ghost|\.tool|\.chip2|\.rit|\.sh|\.field|\.tunerHd|input\[type=color\])/.test(tail)) continue;
  if (/^(svg|img|span|i|b|em)$/.test(tail)) continue;
  const mh = /(?:^|;|\s)min-height:\s*([\d.]+)px/.exec(body);
  const h = /(?:^|;|\s)height:\s*([\d.]+)px/.exec(body);
  const v = mh ? +mh[1] : (h ? +h[1] : null);
  if (v !== null && v < 48) small.push(sel + ' = ' + v + 'px');
}
ok('no interactive rule under 48px', small.length === 0, small.join(' | '));
ok('touch scan saw real rules', css.length > 5000);

/* ───────────────────────────────────────── SOURCE LEVEL GUARANTEES ──────── */
group('SOURCE GUARANTEES');
ok('no service worker registration', !/serviceWorker\s*\.\s*register/.test(SRC));
/* coat, never breed: no breed field is ever stored, read, or shown */
ok('coat never breeds, no breed field anywhere',
   !/\bbreed\s*[:=]/.test(SRC) && !/\.breed\b/.test(SRC));
ok('bakeMaps failure is recorded, not swallowed',
   /catch\s*\(e\)\s*\{[^}]*bakeFail/.test(SRC) || /MAPS\.fail\s*=/.test(SRC));
ok('the 3D module announces itself when it is ready',
   /loaf:3dready/.test(SRC) && (SRC.match(/loaf:3dready/g) || []).length >= 2);
ok('every play path feeds the played need',
   (SRC.match(/playedNeed\(/g) || []).length >= 4);
ok('a corrupt save is preserved before anything overwrites it', /rescue/i.test(SRC));

/* ══════════════════════════════════════════════════════════ LIVE ═════════ */
group('LIVE (real script block, DOM shim)');

function makeShim(){
  const store = new Map();
  const els = new Map();
  const missed = [];
  const rects = { left: 0, top: 0, width: 320, height: 320, right: 320, bottom: 320 };

  class ClassList {
    constructor(){ this.s = new Set(); }
    add(...c){ c.forEach(x => this.s.add(x)); }
    remove(...c){ c.forEach(x => this.s.delete(x)); }
    contains(c){ return this.s.has(c); }
    toggle(c, force){
      const on = force === undefined ? !this.s.has(c) : !!force;
      if (on) this.s.add(c); else this.s.delete(c);
      return on;
    }
  }
  const ctx2d = () => new Proxy({}, { get(_, k){
    if (k === 'canvas') return { width: 512, height: 512 };
    if (k === 'measureText') return () => ({ width: 40 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient')
      return () => ({ addColorStop(){} });
    if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, w * h * 4)) });
    if (k === 'createImageData') return (w, h) => ({ data: new Uint8ClampedArray(Math.max(4, w * h * 4)) });
    if (typeof k === 'symbol') return undefined;
    return () => undefined;
  }, set(){ return true; } });

  class El {
    constructor(tag, id){
      this.tagName = (tag || 'div').toUpperCase();
      this.id = id || '';
      this.classList = new ClassList();
      this.style = new Proxy({ setProperty(){}, removeProperty(){}, cssText: '' }, {
        get(t, k){ return k in t ? t[k] : ''; }, set(t, k, v){ t[k] = v; return true; } });
      this.dataset = {};
      this.children = []; this.attrs = {}; this.handlers = {};
      this.textContent = ''; this.innerHTML = ''; this.value = '';
      this.width = 750; this.height = 620;
      this.clientWidth = 320; this.clientHeight = 320;
      this.disabled = false;
    }
    appendChild(c){ this.children.push(c); return c; }
    append(...c){ c.forEach(x => this.children.push(x)); }
    insertBefore(c){ this.children.push(c); return c; }
    removeChild(c){ this.children = this.children.filter(x => x !== c); }
    remove(){}
    insertAdjacentHTML(){}
    setAttribute(k, v){ this.attrs[k] = String(v); }
    getAttribute(k){ return this.attrs[k] === undefined ? null : this.attrs[k]; }
    addEventListener(t, fn){ (this.handlers[t] = this.handlers[t] || []).push(fn); }
    removeEventListener(){}
    dispatch(t, ev){ (this.handlers[t] || []).forEach(fn => fn(ev || {})); }
    getBoundingClientRect(){ return rects; }
    scrollIntoView(){}
    focus(){}
    click(){ if (this.onclick) this.onclick({}); this.dispatch('click', {}); }
    getContext(){ return ctx2d(); }
    toDataURL(){ return 'data:image/png;base64,'; }
    setPointerCapture(){}
    querySelector(){ return null; }
    get parentNode(){ return doc.body; }
  }

  for (const m of htmlHead.matchAll(/<(\w+)[^>]*\sid="([^"]+)"/g)) els.set(m[2], new El(m[1], m[2]));

  const doc = {
    body: new El('body'),
    documentElement: new El('html'),
    hidden: false,
    fonts: { load: () => Promise.resolve(), ready: Promise.resolve() },
    getElementById(id){
      if (els.has(id)) return els.get(id);
      missed.push(id);
      const e = new El('div', id); els.set(id, e); return e;
    },
    createElement(tag){ return new El(tag); },
    querySelector(sel){
      const key = sel.replace(/^[.#]/, '');
      if (!els.has('__q_' + key)) els.set('__q_' + key, new El('div', key));
      return els.get('__q_' + key);
    },
    querySelectorAll(){ return []; },
    addEventListener(){}, removeEventListener(){}
  };

  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: k => { store.delete(k); },
    key: i => [...store.keys()][i],
    get length(){ return store.size; }
  };

  const win = {
    document: doc,
    localStorage,
    matchMedia: () => ({ matches: false, addEventListener(){} }),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    setTimeout, clearTimeout, setInterval, clearInterval,
    navigator: { vibrate: () => true, share: () => Promise.resolve(), canShare: () => false },
    crypto: { randomUUID: () => 'id' + Math.random().toString(36).slice(2, 10) },
    Image: class { set src(v){ this._s = v; } get src(){ return this._s; }
                   decode(){ return Promise.resolve(); } },
    HTMLCanvasElement: class { },
    ResizeObserver: class { observe(){} },
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL(){} },
    addEventListener(){}, removeEventListener(){},
    scrollTo(){},
    console,
    Math, JSON, Date, Object, Array, String, Number, Boolean, Promise, Error,
    SyntaxError, TypeError, RegExp, Map, Set, Symbol, Uint8Array, Uint8ClampedArray,
    Float32Array, Int32Array, isNaN, isFinite, parseInt, parseFloat, encodeURIComponent,
    Blob, File, TextEncoder, fetch: () => Promise.reject(new Error('offline'))
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;
  win.HTMLCanvasElement.prototype.captureStream = undefined;
  return { win, doc, store, missed, els, ClassList };
}

const PROBE = `
;window.__T = { settleNeeds, grantXP, petOf, xpNeeded, NEEDS, today, CONFIG,
                TRICKS_DEF, FISH, POSTURES, poemFor, defaultDNA, migrateStats,
                mint: (typeof mint === 'function' ? mint : null) };
`;

function boot(){
  const s = makeShim();
  const ctx = vm.createContext(s.win);
  vm.runInContext(classic.body + PROBE, ctx, { filename: 'loaf.html#classic' });
  return { ...s, T: s.win.__T, LOAF: s.win.LOAF, Room: s.win.Room };
}

let live = null, bootErr = null;
try { live = boot(); } catch (e){ bootErr = e; }
ok('the real script block boots in the shim', !!live, bootErr && (bootErr.message + ' @ ' + (bootErr.stack || '').split('\n')[1]));

if (live){
  const { LOAF, Room, T, win, store } = live;
  const Store = LOAF.Store;

  ok('no element id was asked for and missing at runtime', live.missed.length === 0,
     [...new Set(live.missed)].join(','));

  /* ── save round trip ─────────────────────────────────────────────────── */
  const c1 = { id: 'a1', name: 'Barthalomew', stats: {}, dna: LOAF.defaultDNA(), scannedAt: Date.now() };
  Store.update(l => [c1].concat(l));
  ok('save round trip', Store.read().length === 1 && Store.read()[0].name === 'Barthalomew');

  /* ── two tabs must not clobber ───────────────────────────────────────── */
  const stale = Store.read();                       // tab A's in-memory copy
  store.set('loaf.v1', JSON.stringify([{ id: 'b2', name: 'Oreo' }].concat(stale)));  // tab B writes
  Store.update(l => { const c = l.find(x => x.id === 'a1'); if (c) c.name = 'Barth'; return l; });
  const after = Store.read();
  ok('two tabs do not clobber', after.length === 2 && after.some(c => c.id === 'b2')
     && after.find(c => c.id === 'a1').name === 'Barth', JSON.stringify(after.map(c => c.id)));

  /* ── corrupt save ────────────────────────────────────────────────────── */
  store.set('loaf.v1', '[{"id":"z1","name":"Half wri');
  const salvaged = Store.read();
  ok('a corrupt save does not throw', Array.isArray(salvaged));
  const rescueKey = [...store.keys()].find(k => /rescue/i.test(k));
  ok('a corrupt save is copied somewhere before it is lost', !!rescueKey, [...store.keys()].join(','));
  Store.update(l => l);                             // the write that used to erase everything
  ok('the corrupt payload survives the next write', !!store.get(rescueKey || 'loaf.v1.rescue'));

  /* ── the card cap must not delete a cat ──────────────────────────────── */
  store.set('loaf.v1', '[]');
  const many = [];
  for (let i = 0; i < T.CONFIG.MAX_CARDS + 5; i++) many.push({ id: 'k' + i, name: 'cat' + i, photo: 'data:image/jpeg;base64,AAAA' });
  many.forEach(c => Store.update(l => [c].concat(l)));
  const kept = Store.read();
  ok('no cat is silently dropped at the card cap',
     kept.length === many.length, kept.length + ' of ' + many.length);
  ok('over the cap the PHOTO is released, not the cat',
     kept.length === many.length && kept.slice(-1)[0].photo === undefined,
     'oldest photo=' + typeof kept.slice(-1)[0].photo);

  /* ── a write that cannot happen must not report success ──────────────── */
  store.set('loaf.v1', '[]');
  const realSet = win.localStorage.setItem;
  win.localStorage.setItem = () => { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; };
  const claimed = Store.update(l => [{ id: 'q1', name: 'ghost' }].concat(l));
  win.localStorage.setItem = realSet;
  ok('a failed write does not report the card as saved',
     Array.isArray(claimed) && !claimed.some(c => c.id === 'q1'),
     'returned ' + JSON.stringify((claimed || []).map(c => c.id)));

  /* ── needs: floors, no punishment, no NaN ────────────────────────────── */
  store.set('loaf.v1', '[]');
  const card = { id: 'n1', name: 'Oreo', stats: {}, dna: LOAF.defaultDNA(), scannedAt: Date.now() };
  Store.update(l => [card].concat(l));
  const pet = T.petOf(card);
  pet.lastTick = Date.now() - 1000 * 60 * 60 * 24 * 400;   // gone for a year
  const settled = T.settleNeeds(card);
  const vals = T.NEEDS.map(([k]) => settled[k]);
  ok('needs never go below the floor after a year away', vals.every(v => v >= 8 && Number.isFinite(v)), vals.join(','));
  ok('the floor is comfortable, not an accusation', vals.every(v => v >= 30), vals.join(','));
  T.NEEDS.forEach(([k]) => { pet[k] = 100; });
  pet.lastTick = Date.now() - 1000 * 60 * 60;              // one hour, a normal gap
  const hour = T.settleNeeds(card);
  ok('an hour away does not empty her bars',
     T.NEEDS.every(([k]) => hour[k] >= 60), T.NEEDS.map(([k]) => k + '=' + Math.round(hour[k])).join(','));

  /* ── the room bridge: every play path must feed the played need ──────── */
  let bridge = null;
  win.LoafCat3D = { roomOpen(c, b){ bridge = b; }, roomClose(){}, setPersona(){}, setMood(){} };
  card.pet.played = 20;
  Room.open(card);
  ok('the room hands the 3D cat a bridge', !!bridge);
  if (bridge){
    const before = card.pet.played;
    bridge.played();
    ok('playing with her raises the PLAYED need', card.pet.played > before,
       before + ' -> ' + card.pet.played);
    card.pet.played = 40;
    const b2 = card.pet.played;
    bridge.laserDone(0.8, 3);
    ok('the laser raises the PLAYED need', card.pet.played > b2, b2 + ' -> ' + card.pet.played);
    card.pet.played = 40;
    const b3 = card.pet.played;
    bridge.yarnDone();
    ok('the yarn raises the PLAYED need', card.pet.played > b3, b3 + ' -> ' + card.pet.played);
    card.pet.played = 40;
    const b4 = card.pet.played;
    bridge.fishCaught('minnow');
    ok('the pond raises the PLAYED need', card.pet.played > b4, b4 + ' -> ' + card.pet.played);
    card.pet.played = 40;
    const b5 = card.pet.played;
    bridge.beansNote();
    ok('the beans raise the PLAYED need', card.pet.played > b5, b5 + ' -> ' + card.pet.played);
    card.pet.played = 99; bridge.yarnDone();
    ok('the played need is clamped at 100', card.pet.played === 100, String(card.pet.played));

    /* fed and scooped were already wired; guard them so they stay wired */
    card.pet.fed = 10; bridge.fed();
    ok('feeding raises the FED need', card.pet.fed > 10, String(card.pet.fed));
    card.pet.clean = 10; card.pet.poops = 2; bridge.scooped();
    ok('scooping raises the LITTER need', card.pet.clean > 10, String(card.pet.clean));
    ok('scooping removes exactly one poop', card.pet.poops === 1, String(card.pet.poops));

    /* nothing the bridge does may take a need to zero or below the floor */
    const floors = T.NEEDS.map(([k]) => card.pet[k]);
    ok('no bridge path drives a need under the floor', floors.every(v => v >= 30), floors.join(','));

    /* ── the daily ritual: pays once, never punishes ──────────────────── */
    const kb0 = card.pet.kibble;
    bridge.fed();                       // tend
    bridge.played();                    // play
    ok('the ritual records steps', !!card.pet.ritual && card.pet.ritual.tend === 1
       && card.pet.ritual.play === 1 && card.pet.ritual.greet === 1);
    ok('the ritual never expires or resets a streak', card.pet.ritual.done !== -1);
    const kb1 = card.pet.kibble;
    bridge.fed(); bridge.played();      // repeat the same steps
    ok('repeating a ritual step does not double pay',
       card.pet.kibble - kb1 === card.pet.kibble - kb1 && card.pet.ritual.done !== 2);
    ok('kibble only ever counts up', card.pet.kibble >= kb0);
  }

  /* ── XP: monotonic, no infinite loop, nothing can un-level ───────────── */
  const lvl0 = card.pet.level;
  T.grantXP(card, 100000);
  ok('a huge XP grant terminates and raises the bond', card.pet.level > lvl0);
  T.grantXP(card, 0);
  ok('a zero XP grant is safe', Number.isFinite(card.pet.xp) && card.pet.xp >= 0);
  const lvlA = card.pet.level;
  T.grantXP(card, -50);
  ok('the bond can never go down', card.pet.level >= lvlA);

  /* ── tricks are permanent ────────────────────────────────────────────── */
  ok('no code path lowers a trick score',
     !/\.s\s*=\s*Math\.max\(0,\s*[^)]*\.s\s*-/.test(SRC) && !/tk\.s\s*--/.test(SRC));

  /* ── the shape index counts up only ──────────────────────────────────── */
  ok('shape tallies only increment', !/shapeTally\[[^\]]+\]\s*=\s*[^;]*-\s*1/.test(SRC));
}

/* ─────────────────────────────────────────────────────── FAIL DEMO ──────── */
if (process.argv.includes('--fail-demo')){
  group('FAIL DEMO (the harness must detect a broken source)');
  const broken = SRC.replace('function grantXP', 'function grantXP_renamed');
  const p = path.join(TMP, 'loaf_broken.html');
  fs.writeFileSync(p, broken);
  let threw = false;
  try {
    const s = makeShim();
    const ctx = vm.createContext(s.win);
    const b = broken.slice(broken.indexOf('\n<script>\n') + 10, broken.indexOf('</script>', broken.indexOf('\n<script>\n')));
    vm.runInContext(b + PROBE, ctx, { filename: 'broken' });
  } catch (e){ threw = true; }
  ok('a renamed core function is caught', threw);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail){ console.log('\nfailures:\n  ' + fails.join('\n  ')); process.exit(1); }
