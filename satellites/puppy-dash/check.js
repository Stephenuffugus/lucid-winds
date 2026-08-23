/* PUPPY DASH — headless check suite.  node check.js
 *
 * No browser for the physics/persistence groups: the real game script runs in
 * a vm with a DOM + canvas stub (house pattern, modelled on
 * satellites/stop-the-light/check.js). Every assertion below was watched FAIL
 * on purpose before it was trusted (break the code it guards, confirm red,
 * restore — see the mutation notes in each group).
 *
 * The touch target group is the one exception: it drives a real headless
 * Chrome at 375x667 against the server already running on :8777, because the
 * house rule is "measure rendered px in a browser, not the CSS declaration."
 * Everything else here has no scale transform to hide behind, so a CSS value
 * IS the rendered value — but touch targets get the real measurement anyway
 * since that is what was explicitly asked for.
 *
 * Exit code 0 = all green, 1 = a failure, 2 = the harness itself is broken.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const FILE = process.env.PD_FILE ? path.resolve(process.env.PD_FILE) : path.join(__dirname, 'index.html');
const SRC = fs.readFileSync(FILE, 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}
function group(n) { console.log('\n== ' + n); }

/* ------------------------------------------------------------ extraction */
function scriptBlocks(src) {
  const out = []; let i = 0;
  for (;;) {
    const a = src.indexOf('<script', i); if (a < 0) break;
    const gt = src.indexOf('>', a); const b = src.indexOf('</script>', gt); if (b < 0) break;
    out.push({ attrs: src.slice(a, gt), body: src.slice(gt + 1, b), line: src.slice(0, a).split('\n').length });
    i = b + 9;
  }
  return out;
}
const BLOCKS = scriptBlocks(SRC);
const INLINE = BLOCKS.filter(b => b.attrs.indexOf('src=') < 0 && b.body.trim().length);
if (INLINE.length < 3) { console.error('harness: expected 3 inline blocks (game, embed protocol, feedback fab), got ' + INLINE.length); process.exit(2); }
const GAME = INLINE[0].body, PROTOCOL = INLINE[1].body, FEEDBACK = INLINE[2].body;

group('syntax');
INLINE.forEach((b, i) => {
  let e = null; try { new vm.Script(b.body, { filename: 'b' + i }); } catch (err) { e = err.message; }
  ok('inline block ' + i + ' (line ' + b.line + ') parses', !e, e);
});

/* --------------------------------------------------------- player copy */
group('player copy: no dash characters');
function stripComments(js) {
  let out = '', i = 0, n = js.length;
  while (i < n) {
    const c = js[i], d = js[i + 1];
    if (c === '/' && d === '*') { const e = js.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; out += ' '; continue; }
    if (c === '/' && d === '/') { const e = js.indexOf('\n', i); i = e < 0 ? n : e; out += ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1; while (j < n) { if (js[j] === '\\') { j += 2; continue; } if (js[j] === c) break; j++; }
      out += js.slice(i, j + 1); i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}
const DASHES = /[‐‑‒–—―−]/;
let htmlOnly = SRC.replace(/<!--[\s\S]*?-->/g, ' ');
BLOCKS.forEach(b => { if (b.body.length) htmlOnly = htmlOnly.split(b.body).join(' '); });
htmlOnly = htmlOnly.replace(/<style[\s\S]*?<\/style>/gi, m => m.replace(/\/\*[\s\S]*?\*\//g, ' '));
const dashHits = [];
htmlOnly.split('\n').forEach((l, i) => { if (DASHES.test(l)) dashHits.push('html ~' + (i + 1) + ': ' + l.trim().slice(0, 100)); });
INLINE.forEach(b => stripComments(b.body).split('\n').forEach((l, i) => { if (DASHES.test(l)) dashHits.push('js ~' + (b.line + i) + ': ' + l.trim().slice(0, 100)); }));
ok('no dash characters in player facing copy (comments exempt)', dashHits.length === 0, dashHits.slice(0, 4).join(' | '));

/* ----------------------------------------------------- embed protocol */
group('sky wolf embed protocol + tester gate + feedback fab');
ok('the tester wall script tag is present (this game is gated)', /<script src="\/dev-gate\.js/.test(SRC));
ok('framing is detected without a query flag', /parent\s*!==\s*window/.test(PROTOCOL));
ok('posts ready at parse time', /postMessage\(\{sws:'ready'\}/.test(PROTOCOL));
ok('posts ready again on the load event', /addEventListener\('load'[\s\S]{0,140}sws:'ready'/.test(PROTOCOL));
ok('SWS_EXIT posts close when framed', /sws:'close'/.test(PROTOCOL));
ok('SWS_EXIT falls back to referrer history', /document\.referrer/.test(PROTOCOL) && /history\.back\(\)/.test(PROTOCOL));
ok('SWS_EXIT has a portal fallback', /location\.replace\('https:\/\/lucidwinds\.com\/portal\//.test(PROTOCOL));
ok('a findable exit button is wired to SWS_EXIT', /window\.SWS_EXIT\(\)/.test(PROTOCOL));
ok('the manifest is linked', /<link rel="manifest" href="manifest\.webmanifest">/.test(SRC));
ok('the feedback fab mounts with the fleet path and version', /feedback\.js\?v=7/.test(FEEDBACK));
ok('the feedback fab is homed top right (this game paints its own bottom right controls)', /home:\s*'top-right'/.test(FEEDBACK));
ok('the feedback fab is tagged with this game\'s slug', /game:\s*'puppy-dash'/.test(FEEDBACK));

/* ------------------------------------------------- economy stays a stub */
group('economy stays a TODO stub (no Firebase, no Sunbeams wired here)');
ok('the TODO[economy] marker is still present', /TODO\[economy\]/.test(GAME));
ok('gameOver logs a run summary instead of minting anything', /\[pd economy stub\]/.test(GAME));
ok('no Firebase call sites were added (comments mentioning it for context are fine)', !/firebase\.|firestore\.|initializeApp\(|getFirestore\(/i.test(stripComments(GAME)));
ok('no Sunbeam mint call sites were added', !/Sunbeam\.(earn|mint)|_sbCapEarn/.test(GAME));

/* ----------------------------------------------------------- run the game */
group('boot: the game loads headless');
const store = {};
function ctx2d() {
  const p = new Proxy({}, { get: (t2, k) => (k in t2 ? t2[k] : (t2[k] = function () { return p; })) });
  return p;
}
function makeGenericEl() {
  const e = {
    style: {}, className: '', id: '', width: 0, height: 0, _h: {}, _ih: '', _tc: '', onclick: null,
    classList: { _s: {}, contains(c) { return !!this._s[c]; }, add(c) { this._s[c] = 1; }, remove(c) { delete this._s[c]; }, toggle(c, v) { if (v === undefined) v = !this._s[c]; if (v) this._s[c] = 1; else delete this._s[c]; return !!this._s[c]; } },
    appendChild(c) { return c; }, removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); }, removeEventListener() {},
    querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 176, height: 176 }),
    getContext: () => ctx2d(),
  };
  Object.defineProperty(e, 'innerHTML', { get() { return this._ih; }, set(v) { this._ih = v; } });
  Object.defineProperty(e, 'textContent', { get() { return this._tc; }, set(v) { this._tc = v; } });
  return e;
}
function makeCtx(opts) {
  opts = opts || {};
  Object.keys(opts.storage || {}).forEach(k => { store[k] = opts.storage[k]; });
  const els = {};
  function el(id) {
    if (els[id]) return els[id];
    const e = makeGenericEl();
    e.id = id;
    e.getBoundingClientRect = () => ({ left: 0, top: 0, width: 375, height: 667 });
    return (els[id] = e);
  }
  const ctx = {
    console, Math, Date, JSON, Set, Map, Array, Object, String, Number, Boolean, isFinite, isNaN, parseInt, parseFloat, Error, Proxy,
    performance: { now: () => Date.now() },
    setTimeout: () => 0, clearTimeout: () => {},
    requestAnimationFrame: () => 1, cancelAnimationFrame: () => {},
    devicePixelRatio: 1, addEventListener() {}, removeEventListener() {},
    navigator: { share: null, clipboard: null },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    location: { search: opts.search || '', pathname: '/satellites/puppy-dash/' },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    document: {
      getElementById: el,
      createElement: () => makeGenericEl(),
      documentElement: {},
      addEventListener() {}, hidden: false,
      querySelector: () => null, querySelectorAll: () => []
    }
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.parent = ctx;
  vm.createContext(ctx);
  let boom = null;
  try { vm.runInContext(GAME, ctx); } catch (e) { boom = e; }
  return { ctx, el, store, boom };
}

let H = null;
try { H = makeCtx({ storage: { pd_test: '1' } }); } catch (e) { H = { boom: e }; }
ok('the game script loads headless with no exception', !H.boom, H.boom && (H.boom.message + '\n' + H.boom.stack));

if (!H.boom) {
  const PD = H.ctx.PD;
  ok('the pd_test hook attaches when asked for', !!PD && typeof PD.update === 'function');

  if (PD) {
    /* ------------------------------------------------------- CFG sanity */
    group('CFG sanity');
    const C = PD.CFG;
    ok('spd0 < spdMax (speed actually ramps up)', C.spd0 < C.spdMax, C.spd0 + ' < ' + C.spdMax);
    ok('spawnMin < spawn0 (rows tighten with distance, never loosen)', C.spawnMin < C.spawn0, C.spawnMin + ' < ' + C.spawn0);
    ok('spawnMin is a positive interval', C.spawnMin > 0, C.spawnMin);
    ok('jumpV and jumpG are positive (a real arc, not a flat line or a black hole)', C.jumpV > 0 && C.jumpG > 0, C.jumpV + ', ' + C.jumpG);
    ok('slideTime is positive', C.slideTime > 0, C.slideTime);
    ok('contactOffset is positive (a hit resolves onto the dog, not before it)', C.contactOffset > 0, C.contactOffset);
    ok('laneHitDist is under one full lane (an adjacent lane cannot false trigger)', C.laneHitDist > 0 && C.laneHitDist < 1, C.laneHitDist);
    ok('jetCooldown is longer than jetDur (the jetpack is not permanently up)', C.jetCooldown > C.jetDur, C.jetCooldown + ' > ' + C.jetDur);
    ok('magnetCooldown is longer than magnetDur', C.magnetCooldown > C.magnetDur, C.magnetCooldown + ' > ' + C.magnetDur);
    ok('magnetGrab reaches every lane regardless of player position (> 2 lane widths)', C.magnetGrab > 2, C.magnetGrab);
    ok('a golden biscuit is worth more than a plain one', C.biscuitValueGold > C.biscuitValue, C.biscuitValueGold + ' > ' + C.biscuitValue);
    ok('goldChance is a real probability, not guaranteed or impossible', C.goldChance > 0 && C.goldChance < 1, C.goldChance);
    ok('DOG_SLIDE is lower than DOG_STAND (sliding actually lowers the hitbox)', PD.DOG_SLIDE < PD.DOG_STAND, PD.DOG_SLIDE + ' < ' + PD.DOG_STAND);

    /* --------------------------------------- obstacles map onto the verbs */
    group('every obstacle maps onto one of the three verbs, all three covered');
    const VERBS = ['jump', 'slide', 'dodge'];
    const actions = PD.OBSTACLES.map(o => o.action);
    ok('every obstacle action is jump, slide or dodge', actions.every(a => VERBS.indexOf(a) >= 0), actions.join(','));
    ok('all three verbs are actually used by at least one obstacle', VERBS.every(v => actions.indexOf(v) >= 0), actions.join(','));
    ok('OB_VBOX has exactly the three verbs, no orphan or missing box', Object.keys(PD.OB_VBOX).sort().join(',') === VERBS.slice().sort().join(','), Object.keys(PD.OB_VBOX).join(','));
    ok('there are 6 obstacles: the original 4 plus the puddle and trash can (P4 content)', PD.OBSTACLES.length === 6, PD.OBSTACLES.length);
    const byId = {}; PD.OBSTACLES.forEach(o => byId[o.id] = o.action);
    ok('puddle is a jump obstacle', byId.puddle === 'jump', byId.puddle);
    ok('trashcan is a dodge obstacle', byId.trashcan === 'dodge', byId.trashcan);
    ok('hydrant, cone and puddle are all jump (3 jump obstacles)', actions.filter(a => a === 'jump').length === 3, actions.filter(a => a === 'jump').length);
    ok('wall and trashcan are both dodge (2 dodge obstacles)', actions.filter(a => a === 'dodge').length === 2, actions.filter(a => a === 'dodge').length);

    /* ---------------------------------- swept contact cannot tunnel ---- */
    group('swept contact cannot tunnel at spdMax');
    ok('the collision resolves on a swept crossing (prev frame below the line, this frame at or past it), not a narrow band a big step could jump clean over',
      /py\s*<\s*cY\s*&&\s*ob\.y\s*>=\s*cY/.test(GAME));
    PD.reset();
    /* update() recomputes state.speed from state.dist every frame (the ramp),
       so a direct state.speed assignment gets clobbered on the first line of
       the next update() call. Push dist past the ramp instead to reach spdMax
       for real, through the actual ramp formula. */
    PD.state.dist = PD.CFG.rampDist * 10;
    PD.state.laneF = 1; PD.state.targetLane = 1;
    PD.state.spawnT = 999; PD.state.jetSpawnT = 999; PD.state.magnetSpawnT = 999;
    PD.state.objs.length = 0;
    PD.state.objs.push({ kind: 'ob', o: { id: 'wall', action: 'dodge' }, lane: 1, y: PD.L.HY, resolved: false });
    /* an oversized single-frame dt no real frame could ever pass (loop()
       clamps dt at 0.04); if the swept check secretly depended on step size
       instead of the prev/next straddle, a jump this large would blow clean
       through the contact zone with nothing ever detecting it. */
    PD.update(6.0);
    /* gameOver() returns before the objs array is ever filtered, so the
       pushed obstacle is still sitting right there with resolved flipped */
    ok('the crossing obstacle is marked resolved, not silently skipped', PD.state.objs[0] && PD.state.objs[0].resolved === true, 'objs[0]=' + JSON.stringify(PD.state.objs[0]));
    ok('a same lane dodge box crossed at max speed still ends the run (the hit was not skipped)', PD.state.mode === 'over', 'mode=' + PD.state.mode);

    /* ----------------------------- jump/slide clear with real margin --- */
    group('jump clears a jump box, slide clears a slide box, with margin');
    PD.reset();
    PD.state.spawnT = 999; PD.state.jetSpawnT = 999; PD.state.magnetSpawnT = 999; // isolate the arc from random spawns
    PD.doJump();
    let apexJS = 0;
    for (let i = 0; i < 400 && PD.state.jump >= 0; i++) { PD.update(0.01); const jS = PD.state.jump / PD.L.S; if (jS > apexJS) apexJS = jS; if (PD.state.jump <= 0 && i > 3) break; }
    const jumpBoxTop = PD.OB_VBOX.jump[1];
    ok('a full jump clears the jump obstacle box top with a comfortable margin', apexJS > jumpBoxTop + 0.2, 'apex=' + apexJS.toFixed(3) + ' box top=' + jumpBoxTop);
    ok('jump apex lands near the spec\'s documented ~1.3 S', Math.abs(apexJS - 1.3) < 0.15, apexJS.toFixed(3));
    const slideBoxBottom = PD.OB_VBOX.slide[0];
    ok('a slide keeps the dog box under the slide obstacle box bottom with margin', PD.DOG_SLIDE < slideBoxBottom - 0.2, 'slide dogTop=' + PD.DOG_SLIDE + ' box bottom=' + slideBoxBottom);
    ok('slide height lands near the spec\'s documented ~0.55 S', Math.abs(PD.DOG_SLIDE - 0.55) < 0.05, PD.DOG_SLIDE);

    /* -------------------------------- a lane over obstacle never kills - */
    group('an obstacle one lane over never kills');
    PD.reset();
    PD.state.laneF = 1; PD.state.targetLane = 1;
    PD.state.spawnT = 999; PD.state.jetSpawnT = 999; PD.state.magnetSpawnT = 999;
    PD.state.objs.length = 0;
    PD.state.objs.push({ kind: 'ob', o: { id: 'wall', action: 'dodge' }, lane: 0, y: PD.L.HY, resolved: false }); // worst case hazard, one lane over
    PD.update(4.0); // enough simulated time for it to cross the contact line and get filtered out
    ok('an obstacle one full lane away from the player never triggers game over', PD.state.mode === 'play', 'mode=' + PD.state.mode);
    PD.reset();
    PD.state.laneF = 1; PD.state.targetLane = 1;
    PD.state.spawnT = 999; PD.state.jetSpawnT = 999; PD.state.magnetSpawnT = 999;
    PD.state.objs.length = 0;
    PD.state.objs.push({ kind: 'ob', o: { id: 'wall', action: 'dodge' }, lane: 1, y: PD.L.HY, resolved: false }); // same lane, sanity control
    PD.update(4.0);
    ok('control: the SAME setup in the player\'s own lane does end the run (the test above is not just vacuously green)', PD.state.mode === 'over', 'mode=' + PD.state.mode);

    /* ------------------------------------------------------- persistence */
    group('persistence: read modify write, survives reload, two tabs do not clobber');
    delete store.pd_save;
    const W1 = makeCtx({ storage: { pd_test: '1' } });
    ok('a fresh boot with no save starts at zero best/stash', W1.ctx.PD.state.best === 0 && W1.ctx.PD.state.totalStash === 0);
    const saved1 = W1.ctx.PD.pdWrite({ bestCandidate: 120, stashAdd: 8, animal: 'fox', mute: true });
    ok('a first save writes best, stash, animal and mute', saved1.best === 120 && saved1.stash === 8 && saved1.animal === 'fox' && saved1.mute === true, JSON.stringify(saved1));

    /* "reload": a brand new vm context booting from the SAME localStorage blob */
    const W2 = makeCtx({ storage: { pd_test: '1', pd_save: W1.store.pd_save } });
    ok('a reload restores the persisted best distance', W2.ctx.PD.state.best === 120, W2.ctx.PD.state.best);
    ok('a reload restores the persisted total stash', W2.ctx.PD.state.totalStash === 8, W2.ctx.PD.state.totalStash);
    ok('a reload restores the chosen animal', W2.ctx.PD.state.animal.id === 'fox', W2.ctx.PD.state.animal.id);
    ok('a reload applies the persisted mute state to the mute button', W2.el('muteBtn').textContent === '🔇', W2.el('muteBtn').textContent);

    /* two tabs: another tab writes a bigger save WHILE this context is open.
       Without read modify write, this tab's next pdWrite would overwrite disk
       with whatever it loaded at boot (120/8), rolling the other tab's numbers
       BACK. That is the bug this test exists to catch. */
    W2.store.pd_save = JSON.stringify({ best: 500, stash: 50, animal: 'fox', mute: true });
    const after = W2.ctx.PD.pdWrite({ bestCandidate: 90, stashAdd: 3 });
    ok('another tab\'s higher best distance is never rolled back', after.best === 500, 'best=' + after.best);
    ok('another tab\'s stash is not clobbered; this tab ADDS its own delta on top', after.stash === 53, 'stash=' + after.stash);

    /* corrupt save must not brick boot or writes */
    let bad = null, W3 = null;
    try { W3 = makeCtx({ storage: { pd_test: '1', pd_save: 'not json{{{' } }); } catch (e) { bad = e.message; }
    ok('a corrupt save does not throw on boot', !bad && W3 && !W3.boom, bad || (W3 && W3.boom && W3.boom.message));
    if (W3 && !W3.boom) {
      let wrote = null;
      try { W3.ctx.PD.pdWrite({ bestCandidate: 10, stashAdd: 1 }); } catch (e) { wrote = e.message; }
      ok('a corrupt save can still be written over safely', !wrote, wrote);
      ok('the corrupt blob is replaced by a sane one', JSON.parse(W3.store.pd_save).best === 10);
    }
  }
}

/* --------------------------------------------------------------------
   touch targets: real headless Chrome at 375x667, RENDERED px, not the
   CSS declaration. This game has no stage scale transform (unlike the
   other satellites this pattern was written for), so a declared px here
   is already the rendered value in principle — this is the empirical
   proof of that, against the live server already running on :8777.
   -------------------------------------------------------------------- */
function finish() {
  console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'all ' + pass + ' checks passed'));
  if (fail) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
}
(async () => {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch (e) { fail++; fails.push('touch target browser check :: puppeteer not installed'); console.log('  FAIL touch target browser check :: puppeteer not installed'); finish(); return; }
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--mute-audio'] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:8777/satellites/puppy-dash/?probe=' + Math.random(), { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 700));
    await page.evaluate(() => { const b = document.getElementById('startBtn'); if (b) b.click(); });
    await new Promise(r => setTimeout(r, 300));
    const rects = await page.evaluate(() => {
      const ids = ['pauseBtn', 'muteBtn', 'dbg'];
      const out = {};
      ids.forEach(id => { const el = document.getElementById(id); if (el) { const r = el.getBoundingClientRect(); out[id] = { w: Math.round(r.width), h: Math.round(r.height) }; } });
      return out;
    });
    await browser.close();
    group('touch targets: rendered px in a real browser at 375x667');
    ['pauseBtn', 'muteBtn', 'dbg'].forEach(id => {
      const r = rects[id];
      ok(id + ' renders at least 48x48 rendered px', !!r && r.w >= 48 && r.h >= 48, JSON.stringify(r));
    });
    finish();
  } catch (e) {
    if (browser) { try { await browser.close(); } catch (e2) {} }
    fail++; fails.push('touch target browser check could not run :: ' + e.message);
    console.log('  FAIL touch target browser check could not run :: ' + e.message);
    finish();
  }
})();
