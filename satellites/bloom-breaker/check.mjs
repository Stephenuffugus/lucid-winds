/* Bloom Breaker — headless check. `node check.mjs`  (add --selftest to prove the
   assertions can go red).

   No browser. The game script is executed inside a `vm` against a minimal DOM +
   canvas stub, so the level table / isWinnable / the store loader / the front door are the
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
    location: { search, href: 'https://lucidwinds.com/satellites/bloom-breaker/' + search, protocol: 'https:', hostname: 'localhost', replace() {} },
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
  const main = blocks.find(b => b.includes('function boot()') && b.includes('LEVELS'));
  if (!main) throw new Error('could not find the main game script block');
  return main;
}

function boot(source, opts) {
  const ctx = makeSandbox(source, opts);
  runInContext(gameScript(source), ctx, { filename: 'bloom-breaker/index.html' });
  return ctx;
}

/* =========================================================== STATIC CHECKS */
function staticChecks(src) {
  /* 1. THE EXIT. Present and correct in this game already; assert it stays so.
        The portal navigates /satellites/ urls TOP LEVEL, so an affordance gated
        on window.parent !== window would never render. */
  ok('exit: SWS_EXIT is defined', /window\.SWS_EXIT\s*=/.test(src));
  ok('exit: the exit button calls it', /el\('exitBtn'\)\.onclick=function\(\)\{ window\.SWS_EXIT\(\); \}/.test(src));
  const exitDef = /window\.SWS_EXIT=function\(\)\{[\s\S]{0,400}?\};/.exec(src);
  ok('exit: falls back to document.referrer when unframed',
    !!exitDef && exitDef[0].includes('document.referrer'));
  ok('exit: shown on the menu, hidden during play so a stray thumb cannot quit',
    /el\('exitBtn'\)\.style\.display=\(S\.state==='MENU'\)\?'flex':'none'/.test(src));

  /* 2. THE FLEET FAB. /feedback.js parks the satellite mini fab bottom-right at
        96px; #actionBtn (LAUNCH) is 88px tall at bottom 18px, so they overlap
        and the fab's z-index of 2147482000 beats the button's 20. This game is
        on the studio list of pages where the fab covers a control. Assert the
        local override that moves it off. */
  ok('fab: bloom breaker overrides the fleet fab position',
    /\.lwfb-fab\.lwfb-mini\{[^}]*left:12px !important/.test(src));
  ok('fab: the override actually clears the right rail',
    /\.lwfb-fab\.lwfb-mini\{[^}]*right:auto !important/.test(src));
  /* and prove the geometry it is correcting, so the numbers cannot silently
     drift out from under the override */
  const ab = /#actionBtn\{[^}]*?bottom:calc\((\d+)px[^)]*\)[^}]*?height:(\d+)px/.exec(src);
  ok('fab: the LAUNCH button geometry is still what the override assumes', !!ab,
    ab ? ab[0] : 'actionBtn geometry changed, re-check the overlap');
  if (ab) {
    const btnTop = +ab[1] + +ab[2];            // 18 + 88 = 106 from the bottom
    const fabBottom = 96;                       // feedback.js mini fab
    ok('fab: without the override the fab WOULD cover LAUNCH', fabBottom < btnTop,
      'fab bottom ' + fabBottom + ' vs button top ' + btnTop);
  }

  /* 3. THE FRONT DOOR. PLAY used to mean "open a menu that opens a menu". */
  ok('front door: PLAY starts a game rather than opening the pace picker',
    /el\('btnPlay'\)\.onclick=function\(\)\{[\s\S]{0,400}?startGame\(diff, idx\)/.test(src));
  ok('front door: the pace and level pickers are still one tap away',
    /el\('btnLevels'\)\.onclick/.test(src) && /id="btnLevels"/.test(src));
  ok('front door: PLAY resumes at the furthest unlocked level',
    /store\.unlockedLevel\|0\)-1/.test(src));

  /* 4. No dash characters in player facing copy. */
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\w])\/\/[^\n]*/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '');
  const dashes = [...stripped.matchAll(/[–—][^\n]{0,60}/g)].map(m => m[0].trim());
  ok('copy: no en/em dashes in player facing text', dashes.length === 0, dashes.join(' | '));

  /* 5. Touch targets. Bloom Breaker renders UNSCALED (no stage transform), so
        these px are real screen px at 375x667. */
  const t = {
    '.btn': /\.btn\{ min-height:(\d+)px/,
    '.btn.ghost': /\.btn\.ghost\{[^}]*min-height:(\d+)px/,
    '.btn.sm': /\.btn\.sm\{[^}]*min-height:(\d+)px/,
    '.exit-link': /\.exit-link\{[^}]*min-height:(\d+)px/,
    '#pauseBtn': /#pauseBtn\{[^}]*width:(\d+)px/,
    '#actionBtn': /#actionBtn\{[^}]*width:(\d+)px/,
    '.seg button': /\.seg button\{ min-height:(\d+)px/
  };
  for (const [sel, re] of Object.entries(t)) {
    const m = re.exec(src);
    ok('touch: ' + sel + ' >= 48px', !!m && +m[1] >= 48, m ? m[1] + 'px' : 'not found');
  }
  /* the settings toggle is 32px tall, but the whole 56px row is the tap target */
  ok('touch: the settings toggle is tapped through its 56px row, not the 32px pill',
    /\.setrow\{[^}]*min-height:56px/.test(src) && /row\.onclick=function\(\)/.test(src));

  /* 6. localStorage: two tabs clobber a wholesale write. This game writes the
        whole store, so at minimum it must load defensively field by field. */
  ok('save: the loader type checks every field instead of trusting the blob',
    /if\(typeof p\.coins==='number'\)/.test(src) && /if\(typeof p\.unlockedLevel==='number'\)/.test(src));
  ok('save: unlockedLevel is clamped to the real level table',
    /clamp\(Math\.floor\(p\.unlockedLevel\),1,LEVELS\.length\)/.test(src));
  ok('save: owned skins are whitelisted against the real catalogue',
    /valid\[id\]&&list\.indexOf\(id\)<0/.test(src));

  /* 7. The dev bridge must stay inert on the live domain. */
  ok('security: the dev bridge is gated on a local origin',
    /bbtest=1[\s\S]{0,160}?location\.protocol==='file:'[\s\S]{0,80}?localhost/.test(src));
}

/* ============================================================ LIVE CHECKS */
function liveChecks() {
  const c = boot(html, { search: '?bbtest=1' });
  const DEV = c.window.BB_DEV;
  ok('boot: the game script runs to completion', !!DEV);
  if (!DEV) return;

  ok('content: there is a real campaign behind the shelf card', DEV.LEVELS.length >= 16,
    DEV.LEVELS.length + ' levels');
  ok('content: the campaign ends somewhere', DEV.LEVELS.some(l => l.boss));

  /* EVERY level must be finishable. isWinnable is the game's own answer to
     "can this grid be cleared", so ask it about every shipped grid rather than
     re-deriving the rule here. */
  const unwinnable = [];
  DEV.LEVELS.forEach(function (lv, i) {
    if (!lv.grid) return;
    if (!DEV.isWinnable(lv.grid)) unwinnable.push(i + 1);
  });
  ok('levels: every shipped level can actually be cleared', unwinnable.length === 0,
    unwinnable.length ? 'unwinnable: ' + unwinnable.join(',') : '');

  /* Endless must not generate a dead level either. Sample deeply. */
  const badEndless = [];
  for (let n = 1; n <= 60; n++) {
    const lv = DEV.genEndlessLevel ? DEV.genEndlessLevel(n) : null;
    if (lv && lv.grid && !DEV.isWinnable(lv.grid)) badEndless.push(n);
  }
  ok('endless: 60 generated levels are all clearable', badEndless.length === 0,
    badEndless.length ? 'dead at depth: ' + badEndless.slice(0, 8).join(',') : '');

  /* The boss must not be able to dead-end. The comment at bossHeartVulnerable
     says the shell opens once every bomb is spent; assert the promise holds. */
  ok('boss: the fight cannot dead-end when the bombs run out',
    /bossBombsLeft\(\)===0/.test(html));

  /* Start a run and prove the state machine leaves the menu. */
  DEV.start('normal');
  ok('loop: starting a game leaves the menu', DEV.S.state !== 'MENU', 'state=' + DEV.S.state);
  ok('loop: a run begins with bricks on the board', DEV.S.bricks.length > 0);
  ok('loop: a run begins with lives', DEV.S.lives > 0, 'lives=' + DEV.S.lives);
  DEV.launch();
  ok('loop: launching puts a ball in play', DEV.S.balls.length > 0);

  /* Difficulty is a real axis, not three labels on the same tuning. */
  DEV.start('chill'); const chill = { lives: DEV.S.lives, w: DEV.S.paddle && DEV.S.paddle.w };
  DEV.start('hard'); const hard = { lives: DEV.S.lives, w: DEV.S.paddle && DEV.S.paddle.w };
  ok('difficulty: chill really is gentler than hard', chill.lives > hard.lives,
    chill.lives + ' lives vs ' + hard.lives);
  ok('difficulty: the paddle actually changes width', chill.w > hard.w,
    chill.w + ' vs ' + hard.w);

  /* Clearing the board must end the level, not strand the player. */
  DEV.start('normal');
  DEV.clearLevel();
  const before = DEV.S.levelIndex;
  DEV.advanceLevel();
  ok('loop: clearing a level advances rather than stalling', DEV.S.levelIndex !== before || DEV.S.state === 'WIN',
    'level ' + before + ' -> ' + DEV.S.levelIndex + ' state ' + DEV.S.state);
}

/* ==================================================== SAVE / CORRUPT SAVE */
function saveChecks() {
  const cases = {
    'truncated json': '{', 'null': 'null', 'wrong shape': '[]',
    'wrong types': '{"coins":"lots","unlockedLevel":"x","owned":3,"settings":9}',
    'out of range': '{"coins":-999,"unlockedLevel":99999}',
    'hostile': '{"__proto__":{"pwn":1},"owned":{"paddle":["not-a-real-skin"]}}',
    'empty string': ''
  };
  for (const [name, blob] of Object.entries(cases)) {
    let boomed = null, c = null;
    try { c = boot(html, { search: '?bbtest=1', storage: { lw_brickbreaker_v1: blob } }); }
    catch (e) { boomed = e.message; }
    ok('save: survives a corrupt save (' + name + ')', boomed === null, boomed || '');
    if (c && c.window.BB_DEV) {
      ok('save: a corrupt save leaves sane coins (' + name + ')', c.window.BB_DEV.coins() >= 0,
        'coins=' + c.window.BB_DEV.coins());
    }
  }
  const good = boot(html, { search: '?bbtest=1', storage: { lw_brickbreaker_v1: JSON.stringify({ coins: 777, unlockedLevel: 4 }) } });
  ok('save: a valid save is restored', good.window.BB_DEV.coins() === 777);
}

/* ============================================================== SELF TEST */
function selftest() {
  const mutations = [
    ['exit unwired', s => s.replace("el('exitBtn').onclick=function(){ window.SWS_EXIT(); };", ''), /exit button calls it/],
    ['exit gated on framing', s => s.replace("if(document.referrer.indexOf('/portal')>=0&&history.length>1){history.back();}else{location.replace('https://lucidwinds.com/portal/');}", 'return;'), /falls back to document.referrer/],
    ['exit left live over the playfield', s => s.replace("el('exitBtn').style.display=(S.state==='MENU')?'flex':'none';", "el('exitBtn').style.display='flex';"), /hidden during play/],
    ['fab override removed', s => s.replace('right:auto !important; left:12px !important;', ''), /overrides the fleet fab position/],
    ['PLAY opens a menu again', s => s.replace(/el\('btnPlay'\)\.onclick=function\(\)\{ audioInit\(\); audioResume\(\);\n[\s\S]{0,200}?startGame\(diff, idx\); \};/, "el('btnPlay').onclick=function(){ S.state='DIFF'; show('scr-diff'); };"), /PLAY starts a game/],
    ['a dash in player copy', s => s.replace('>Resume<', '>Resume — now<'), /no en\/em dashes/],
    ['tiny touch target', s => s.replace('.btn.ghost{ background:var(--coal2); color:var(--cream); box-shadow:0 4px 0 #0e120c;\n  border:1px solid #3a4230; font-size:16px; min-height:48px; }', '.btn.ghost{ background:var(--coal2); color:var(--cream); box-shadow:0 4px 0 #0e120c;\n  border:1px solid #3a4230; font-size:16px; min-height:30px; }'), /\.btn\.ghost >= 48/],
    ['save loader trusts the blob', s => s.replace("if(typeof p.coins==='number') d.coins=Math.max(0,Math.floor(p.coins));", 'd.coins=p.coins;'), /type checks every field/],
    ['unlockedLevel unclamped', s => s.replace('if(typeof p.unlockedLevel==="number")', 'if(0)').replace("if(typeof p.unlockedLevel==='number') d.unlockedLevel=clamp(Math.floor(p.unlockedLevel),1,LEVELS.length);", 'd.unlockedLevel=p.unlockedLevel;'), /clamped to the real level table/],
    ['dev bridge live on production', s => s.replace("if(/[?&]bbtest=1/.test(location.search) && (location.protocol==='file:' || /^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname))){", 'if(/[?&]bbtest=1/.test(location.search)){'), /gated on a local origin/],
    ['flat difficulty', s => s.replace("chill:  { name:'Chill',  base:470, lives:5, pw:116, ramp:0.03 },", "chill:  { name:'Chill',  base:760, lives:2, pw:76, ramp:0.08 },"), /chill really is gentler/],
    ['an unwinnable level ships', s => s.replace('function isWinnable(grid){', 'function isWinnable(grid){ if(grid&&grid.length>3) return false;'), /every shipped level can actually be cleared/]
  ];
  console.log('SELFTEST — each mutation must turn its assertion red\n');
  let red = 0;
  for (const [name, mutate, want] of mutations) {
    fails.length = 0;
    const mutated = mutate(html);
    if (mutated === html) { console.log('  ?? ' + name + ': mutation did not apply (regex drifted)'); continue; }
    try { staticChecks(mutated); } catch (e) { fails.push('static threw: ' + e.message); }
    try {
      const c = makeSandbox(mutated, { search: '?bbtest=1' });
      runInContext(gameScript(mutated), c, { filename: 'mutant' });
      const DEV = c.window.BB_DEV;
      if (DEV) {
        const bad = [];
        DEV.LEVELS.forEach(function (lv, i) { if (lv.grid && !DEV.isWinnable(lv.grid)) bad.push(i + 1); });
        ok('levels: every shipped level can actually be cleared', bad.length === 0);
        DEV.start('chill'); const a = DEV.S.lives;
        DEV.start('hard'); const b = DEV.S.lives;
        ok('difficulty: chill really is gentler than hard', a > b);
      } else {
        ok('security: the dev bridge is gated on a local origin', true);
      }
    } catch (e) { fails.push('boot threw: ' + e.message); }
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

console.log('Bloom Breaker — ' + pass + ' passed, ' + fails.length + ' failed');
if (fails.length) { console.log('\nFAILURES:'); fails.forEach(f => console.log('  x ' + f)); process.exit(1); }
