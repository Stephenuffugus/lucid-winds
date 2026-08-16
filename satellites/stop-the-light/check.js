/* STOP THE LIGHT — headless check suite.  node check.js
 *
 * No browser. The real game script runs in a vm with a DOM stub and a PUMPED
 * clock: requestAnimationFrame is captured and performance.now is fake, so the
 * actual frame loop runs and real rounds are played, banked and lost here.
 *
 * Every assertion was watched FAIL on purpose (STL_FILE=<mutated copy> re-proves
 * that on demand). Exit 0 green, 1 a failure, 2 the harness itself is broken.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const FILE = process.env.STL_FILE ? path.resolve(process.env.STL_FILE) : path.join(__dirname, 'index.html');
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
if (INLINE.length < 3) { console.error('harness: expected 3 inline blocks, got ' + INLINE.length); process.exit(2); }
const PROTOCOL = INLINE[0].body, GAME = INLINE[1].body, SUNBEAM = INLINE[2].body;

group('syntax');
INLINE.forEach((b, i) => {
  let e = null; try { new vm.Script(b.body, { filename: 'b' + i }); } catch (err) { e = err.message; }
  ok('inline block ' + i + ' (line ' + b.line + ') parses', !e, e);
});

/* --------------------------------------------------------- player copy */
group('player copy');
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
const DASHES = /[‐‑‒–—―−]|\\u201[0-5]|\\u2212/;
let htmlOnly = SRC.replace(/<!--[\s\S]*?-->/g, ' ');
BLOCKS.forEach(b => { if (b.body.length) htmlOnly = htmlOnly.split(b.body).join(' '); });
htmlOnly = htmlOnly.replace(/<style[\s\S]*?<\/style>/gi, m => m.replace(/\/\*[\s\S]*?\*\//g, ' '));
const hits = [];
htmlOnly.split('\n').forEach((l, i) => { if (DASHES.test(l)) hits.push('html ~' + (i + 1) + ': ' + l.trim().slice(0, 100)); });
INLINE.forEach(b => stripComments(b.body).split('\n').forEach((l, i) => { if (DASHES.test(l)) hits.push('js ~' + (b.line + i) + ': ' + l.trim().slice(0, 100)); }));
ok('no dash characters in player facing copy', hits.length === 0, hits.slice(0, 4).join(' | '));

/* ----------------------------------------------------- embed protocol */
group('sky wolf embed protocol');
ok('framing is detected without a query flag', /parent!==window|parent !== window/.test(PROTOCOL) && !/SWS_EMBED\s*&&\s*parent!==window\s*\)\s*\{\s*try\{\s*parent\.postMessage\(\{sws:'ready'/.test(PROTOCOL));
ok('posts ready at parse time', /postMessage\(\{sws:'ready'\}/.test(PROTOCOL));
ok('posts ready again on the load event', /addEventListener\('load'[\s\S]{0,140}sws:'ready'/.test(PROTOCOL));
ok('SWS_EXIT posts close when framed', /sws:'close'/.test(PROTOCOL));
ok('SWS_EXIT falls back to referrer history', /document\.referrer/.test(PROTOCOL) && /history\.back\(\)/.test(PROTOCOL));
ok('SWS_EXIT has a portal fallback', /location\.replace\('https:\/\/lucidwinds\.com\/portal\//.test(PROTOCOL));
ok('the exit is wired to a button the player can see', /b-exit/.test(GAME));
ok('in development gate is loaded (card is beta:true)', /dev-gate\.js/.test(SRC));

/* ------------------------------------------------------ touch targets */
/* the stage is 540x960 scaled to fit; at 375x667 the scale is 0.6944, so a
   rendered pixel is css*0.6944 and the 48px floor needs 69.2 css px. */
group('touch targets (rendered px at 375x667)');
const css = (SRC.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const SCALE = Math.min(375 / 540, 667 / 960);
function rule(sel) { const m = css.match(new RegExp('(?:^|[\\n};])\\s*' + sel.replace(/[.#]/g, '\\$&') + '\\s*\\{([^}]*)\\}')); return m ? m[1] : ''; }
function px(decl, prop) { const m = decl.match(new RegExp('(?:^|;|\\s)' + prop + '\\s*:\\s*([0-9.]+)px')); return m ? parseFloat(m[1]) : null; }
[['.btn', 'min-height'], ['#pausebtn', 'height'], ['.settingline', 'min-height']].forEach(([sel, prop]) => {
  const v = px(rule(sel), prop), r = v == null ? 0 : v * SCALE;
  ok(sel + ' renders at least 48px (' + r.toFixed(1) + 'px)', r >= 48, 'css ' + prop + '=' + v);
});

/* ----------------------------------------------------- run the game */
group('the game actually plays');
const store = {};
function makeCtx(opts) {
  opts = opts || {};
  Object.keys(opts.storage || {}).forEach(k => { store[k] = opts.storage[k]; });
  let t = 1000;                         /* fake performance clock, ms */
  let rafCb = null;
  const els = {};
  function el(id) {
    if (els[id]) return els[id];
    const e = {
      id: id, _h: {}, style: {}, innerHTML: '', textContent: '', value: '', dataset: {},
      firstChild: { nodeValue: '' }, disabled: false,
      classList: { _s: {}, contains(c) { return !!this._s[c]; }, add(c) { this._s[c] = 1; }, remove(c) { delete this._s[c]; }, toggle(c, v) { if (v === undefined) v = !this._s[c]; if (v) this._s[c] = 1; else delete this._s[c]; } },
      addEventListener(t2, f) { (this._h[t2] = this._h[t2] || []).push(f); },
      removeEventListener() {}, setAttribute() {}, getAttribute() { return null; },
      appendChild() {}, querySelector: () => null, querySelectorAll: () => [],
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 667 }),
      getContext: () => ctx2d()
    };
    e.parentNode = { className: 'settingline', _h: {}, addEventListener(t2, f) { (this._h[t2] = this._h[t2] || []).push(f); }, setAttribute() {}, classList: e.classList };
    return (els[id] = e);
  }
  function ctx2d() {
    const p = new Proxy({}, { get: (t2, k) => (k in t2 ? t2[k] : (t2[k] = function () { return p; })) });
    return p;
  }
  const ctx = {
    console, Math, Date, JSON, Set, Map, Array, Object, String, Number, Boolean, isFinite, isNaN, parseInt, parseFloat, Error,
    performance: { now: () => t },
    setTimeout: (f) => { return 0; }, clearTimeout: () => {},
    requestAnimationFrame: f => { rafCb = f; return 1; }, cancelAnimationFrame: () => {},
    devicePixelRatio: 1, addEventListener() {}, removeEventListener() {}, navigator: { share: null, clipboard: null },
    matchMedia: () => ({ matches: false }),
    location: { search: opts.search || '', pathname: '/satellites/stop-the-light/' },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    document: { getElementById: el, addEventListener() {}, hidden: false, querySelector: () => null, querySelectorAll: () => [] }
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  ctx.parent = ctx;
  vm.createContext(ctx);
  vm.runInContext(SUNBEAM, ctx);
  vm.runInContext(GAME, ctx);
  return {
    ctx: ctx, el: el, store: store,
    pump(seconds) { const steps = Math.max(1, Math.round(seconds / 0.016)); for (let i = 0; i < steps; i++) { t += 16; if (rafCb) { const f = rafCb; rafCb = null; f(); } } },
    click(id, type) { const e = el(id), h = (e._h[type || 'click'] || []); h.forEach(f => f({ preventDefault() {}, stopPropagation() {} })); return h.length; },
    clickRow(id) { const e = el(id), h = (e.parentNode._h.click || []); h.forEach(f => f({ preventDefault() {} })); return h.length; },
    now: () => t
  };
}

let H = null, boom = null;
try { H = makeCtx({ storage: { stl_test: '1' } }); } catch (e) { boom = e.message; }
ok('the game script loads headless', !!H && !boom, boom);

if (H) {
  const STL = H.ctx.STL;
  ok('the test hook attaches when asked for', !!STL && typeof STL.launch === 'function');

  if (STL) {
    const G = STL.state;
    /* --- tuning tables --- */
    const rv = [1,2,3,4,5,6,7,8,9,10,11,12].map(STL.tune.roundValue);
    ok('round values climb every round', rv.every((v, i) => i === 0 || v > rv[i - 1]), rv.join(','));
    const bd = [1,2,3,4,5,6,7,8,9,10,15,20].map(STL.tune.bandDeg);
    ok('the band narrows overall', bd[9] < bd[0] && bd[11] < bd[9], bd.join(','));
    ok('round 6 is a real breather (wider band than round 5)', bd[5] > bd[4], bd[4] + ' -> ' + bd[5]);
    ok('the band never shrinks below the floor', Math.min.apply(null, bd) >= 13, bd.join(','));

    /* --- the fairness floor, measured the way the game measures it --- */
    let worstB = 1e9, worstH = 1e9, worstR = 0;
    for (let r = 1; r <= 21; r++) {
      STL.launch('free');
      H.pump(0.1);
      STL.setRound(r);
      const m = STL.measure(), b = m.band, h = m.heart;
      if (b < worstB) { worstB = b; worstR = r; }
      if (h < worstH) worstH = h;
    }
    ok('every sampled round clears the 62ms band floor', worstB >= 62, 'worst ' + worstB.toFixed(0) + 'ms at round ' + worstR);
    ok('every sampled round clears the 40ms heart floor', worstH >= 40, 'worst ' + worstH.toFixed(0) + 'ms');

    /* --- a real chain: heart, bank, arithmetic --- */
    delete store.stl_stats; delete store.stl_best; delete store.stl_moments;
    STL.launch('free'); H.pump(0.8);
    ok('a launched run is on the play screen and running', G.phase === 'run' || G.phase === 'ready', 'phase=' + G.phase);
    STL.aim('heart');
    ok('a heart pays triple the round value', G.pot === STL.tune.roundValue(1) * 3, 'pot=' + G.pot);
    H.pump(2.0);
    ok('the choice opens after the stop beat', G.phase === 'choice', 'phase=' + G.phase);
    const potWas = G.pot;
    H.click('ch-again'); H.pump(0.8);
    ok('go again starts the next round with the pot intact', G.chainRound === 2 && G.pot === potWas, 'round=' + G.chainRound + ' pot=' + G.pot);
    STL.aim('band'); H.pump(2.0);
    ok('a band hit pays the round value', G.pot === potWas + STL.tune.roundValue(2), 'pot=' + G.pot);
    const banked = G.pot;
    H.click('ch-bank'); H.pump(0.2);
    ok('banking moves the pot into the run total', G.runTotal === banked, 'runTotal=' + G.runTotal);
    ok('banking spends the firefly', G.fireflies === 2, 'fireflies=' + G.fireflies);
    ok('banking writes lifetime stats', (JSON.parse(store.stl_stats || '{}').banks || 0) === 1, store.stl_stats);
    ok('a bank pays sunbeams under the fleet cap', (JSON.parse(store['sw_sb_stop-the-light'] || '{}').n || 0) > 0, store['sw_sb_stop-the-light']);

    /* --- a miss burns the pot, not the banked total --- */
    H.pump(0.8); STL.aim('miss'); H.pump(2.0);
    ok('a miss loses the unbanked pot only', G.pot === 0 && G.runTotal === banked, 'pot=' + G.pot + ' total=' + G.runTotal);
    ok('a miss spends a firefly', G.fireflies === 1, 'fireflies=' + G.fireflies);

    /* --- the run ends after the third firefly --- */
    H.pump(0.8); STL.aim('miss'); H.pump(2.0);
    ok('the run ends when the fireflies run out', G.phase === 'idle', 'phase=' + G.phase);
    ok('the summary screen is the one showing', H.el('s-sum').classList.contains('on'));
    ok('the personal best is stored', (parseInt(store.stl_best, 10) || 0) === banked, 'best=' + store.stl_best);

    /* --- tire out --- */
    STL.launch('free'); H.pump(0.8);
    const fl = G.fireflies;
    H.pump(14);
    ok('a firefly that is never tapped tires out and is spent', G.fireflies < fl || G.hit === 'miss', 'revs=' + G.revs.toFixed(2) + ' phase=' + G.phase);

    /* --- the nightly ring is the same ring for everyone --- */
    const a = makeCtx({ storage: { stl_test: '1' } });
    a.ctx.STL.launch('daily'); a.pump(0.1);
    const b2 = makeCtx({ storage: { stl_test: '1' } });
    b2.ctx.STL.launch('daily'); b2.pump(0.1);
    ok('the nightly ring runs the same rhythm on two devices',
      a.ctx.STL.state.rhythmK === b2.ctx.STL.state.rhythmK && Math.abs(a.ctx.STL.state.rhythmPhase - b2.ctx.STL.state.rhythmPhase) < 1e-12);
    ok('the nightly ring places the same first band',
      Math.abs(a.ctx.STL.state.bandC - b2.ctx.STL.state.bandC) < 1e-12,
      a.ctx.STL.state.bandC + ' vs ' + b2.ctx.STL.state.bandC);
    const f1 = makeCtx({ storage: { stl_test: '1' } }); f1.ctx.STL.launch('free'); f1.pump(0.1);
    const f2 = makeCtx({ storage: { stl_test: '1' } }); f2.ctx.STL.launch('free'); f2.pump(0.1);
    ok('a free run is NOT the nightly ring', f1.ctx.STL.state.bandC !== f2.ctx.STL.state.bandC || f1.ctx.STL.state.rhythmPhase !== f2.ctx.STL.state.rhythmPhase);
  }

  /* ------------------------------------------------------- persistence */
  group('persistence');
  /* two tabs: a second session must ADD to counters and MAX bests, never
     overwrite them with whatever it happened to load at boot */
  const T = makeCtx({ storage: { stl_test: '1', stl_stats: JSON.stringify({ runs: 9, banks: 9, deepest: 12, totalBanked: 5000, hearts: 4 }), stl_best: '4321' } });
  T.ctx.STL.launch('free'); T.pump(0.8);
  T.ctx.STL.aim('band'); T.pump(2.0); T.click('ch-bank'); T.pump(0.2);
  const st = JSON.parse(store.stl_stats || '{}');
  ok('another tab cannot reset the run counter', st.runs >= 10, 'runs=' + st.runs);
  ok('another tab cannot reset the bank counter', st.banks >= 10, 'banks=' + st.banks);
  ok('another tab cannot lower the deepest round', st.deepest >= 12, 'deepest=' + st.deepest);
  ok('another tab cannot lower the lifetime total', st.totalBanked >= 5000, 'totalBanked=' + st.totalBanked);
  T.ctx.STL.state.fireflies = 1;
  T.pump(0.8); T.ctx.STL.aim('miss'); T.pump(2.0);
  ok('a smaller run cannot lower the stored personal best', (parseInt(store.stl_best, 10) || 0) >= 4321, 'best=' + store.stl_best);

  /* corrupt saves must not brick the boot or the settings */
  let bad = null, C2 = null;
  try {
    C2 = makeCtx({ storage: { stl_test: '1', stl_set: '5', stl_stats: '[1,2,3]', stl_moments: '"nope"', stl_seen: '12', stl_best: 'abc' } });
  } catch (e) { bad = e.message; }
  ok('a corrupt save does not throw on boot', !bad, bad);
  if (C2) {
    let flip = null;
    try { C2.clickRow('tg-sound'); } catch (e) { flip = e.message; }
    ok('settings still work after a corrupt save', !flip, flip);
    let played = null;
    try { C2.ctx.STL.launch('free'); C2.pump(0.8); C2.ctx.STL.aim('band'); C2.pump(2.0); C2.click('ch-bank'); C2.pump(0.2); }
    catch (e) { played = e.message; }
    ok('a round still plays after a corrupt save', !played, played);
    ok('the corrupt stats blob is replaced by a sane one', (JSON.parse(store.stl_stats || 'null') || {}).banks >= 1, store.stl_stats);
  }

  /* the nightly ring: streak and share text */
  group('nightly ring');
  const D = makeCtx({ storage: { stl_test: '1' } });
  delete store.stl_streak; delete store.stl_daily; delete store.stl_moments;
  D.ctx.STL.launch('daily'); D.pump(0.8);
  D.ctx.STL.aim('band'); D.pump(2.0); D.click('ch-bank'); D.pump(0.2);
  D.ctx.STL.state.fireflies = 1; D.pump(0.8); D.ctx.STL.aim('miss'); D.pump(2.0);
  ok('the nightly ring locks after one run', !!store.stl_daily, store.stl_daily);
  ok('a first nightly ring starts a streak of one', D.ctx.STL.streak().n === 1, JSON.stringify(D.ctx.STL.streak()));
  const sh = D.ctx.STL.share();
  ok('the run produces a shareable result', /Stop the Light/.test(sh) && /sparks/.test(sh), JSON.stringify(sh));
  ok('the shareable result carries no dash characters', !DASHES.test(sh), JSON.stringify(sh));
  ok('the nightly earn moment fires once per day', (JSON.parse(store.stl_moments || '{}').daily_date || '') !== '');
  /* yesterday's streak continues, an older one restarts */
  const yk = (function () { const d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); })();
  delete store.stl_daily;
  store.stl_streak = JSON.stringify({ last: yk, n: 4, best: 4 });
  const D2 = makeCtx({ storage: { stl_test: '1' } });
  D2.ctx.STL.launch('daily'); D2.pump(0.8); D2.ctx.STL.aim('miss'); D2.pump(2.0);
  D2.ctx.STL.state.fireflies = 1; D2.pump(0.8); D2.ctx.STL.aim('miss'); D2.pump(2.0);
  ok('a ring played the next night extends the streak', D2.ctx.STL.streak().n === 5, JSON.stringify(D2.ctx.STL.streak()));
  delete store.stl_daily;
  store.stl_streak = JSON.stringify({ last: '2020-01-01', n: 9, best: 9 });
  const D3 = makeCtx({ storage: { stl_test: '1' } });
  D3.ctx.STL.launch('daily'); D3.pump(0.8); D3.ctx.STL.aim('miss'); D3.pump(2.0);
  D3.ctx.STL.state.fireflies = 1; D3.pump(0.8); D3.ctx.STL.aim('miss'); D3.pump(2.0);
  ok('a broken streak restarts at one but keeps its best', D3.ctx.STL.streak().n === 1 && D3.ctx.STL.streak().best === 9, JSON.stringify(D3.ctx.STL.streak()));

  /* the pause must not eat the payoff beat */
  group('pause');
  const P = makeCtx({ storage: { stl_test: '1' } });
  P.ctx.STL.launch('free'); P.pump(0.8);
  P.ctx.STL.aim('heart');
  P.click('pausebtn'); P.pump(3.0);
  ok('a pause holds the result timer', P.ctx.STL.state.phase === 'paused', 'phase=' + P.ctx.STL.state.phase);
  P.click('pz-resume'); P.pump(0.1);
  ok('resuming does not fast forward straight past the payoff', P.ctx.STL.state.phase === 'stop', 'phase=' + P.ctx.STL.state.phase);
  P.pump(2.0);
  ok('the choice still opens after the resumed beat', P.ctx.STL.state.phase === 'choice', 'phase=' + P.ctx.STL.state.phase);
}

console.log('\n' + (fail ? 'FAILED ' + fail + ' of ' + (pass + fail) : 'all ' + pass + ' checks passed'));
if (fail) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
