// Pop N Lock Part 2a gate (v1.9): input. [A] the page's own functions in a node vm: the repeat scheduler (Fast and
// Relaxed, last side wins, a hold through a spawn), the rotation buffer, the kick table (walls, ledges, the top, the
// floor kick, a one column shaft, no climb), the landing window (300 ms, two resets, the 650 cap, a soft drop, a lower
// landing gets a fresh window, a floor kick does not). [B] the page with REAL touches (CDP): every tray button, the
// board's tap, drags and flick, holds let go on blur and hide, the mirrored tray, 56 px buttons and the board above the
// tray at 412, 375 x 667 and 360. [C] thumb shots at 412 and 360.
// node p2a_gate.mjs [pageFile] [outDir] [noShots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/';
const PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p2a', SHOTS = !process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(DIR + PAGE, 'utf8');
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 600)); } }
function grab(name) { const i = SRC.indexOf('function ' + name + '('); if (i < 0) throw new Error('no ' + name);
  let j = SRC.indexOf('{', i), d = 0, k = j; for (; k < SRC.length; k++) { const c = SRC[k]; if (c === '{') d++; else if (c === '}') { d--; if (d === 0) break; } } return SRC.slice(i, k + 1); }
function grabVar(name) { const m = SRC.match(new RegExp('var ' + name + '=[^;]*;')); if (!m) throw new Error('no var ' + name); return m[0]; }
const ROWS = 13, COLS = 6;
const grid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const fill = (g, c, from) => { for (let r = from; r < ROWS; r++) g[r][c] = 1; return g; };

console.log('[A] the page\'s own input functions, in a node vm');
{ /* the repeat scheduler: moves recorded on a 1 ms simulation clock */
  const run = (relaxed, script, until) => { const calls = []; let T = 0, play = true;
    const ctx = { Math, SET: { relaxed }, playable: () => play, pf: () => ({}), moveP: (f, d) => { calls.push([T, d]); return true; } };
    vm.createContext(ctx); vm.runInContext(grabVar('REP_FAST') + grabVar('INP'), ctx);
    for (const f of ['repProfile', 'repPress', 'repRelease', 'repTick']) vm.runInContext(grab(f), ctx);
    /* time runs in 1 ms ticks; the tick at T brings the clock from T-1 to T, then the events of time T happen */
    T = 0; if (script[0]) script[0](ctx, v => { play = v; });
    for (T = 1; T <= until; T++) { ctx.repTick(1); if (script[T]) script[T](ctx, v => { play = v; }); }
    return calls; };
  const fast = run(false, { 0: c => c.repPress(-1) }, 220).map(v => v[0]), relaxed = run(true, { 0: c => c.repPress(-1) }, 300).map(v => v[0]);
  ok('a held arrow moves at once, then at 105 ms and every 33 ms (Fast, the July ruling), on simulation time', JSON.stringify(fast.slice(0, 5)) === '[0,105,138,171,204]', JSON.stringify(fast));
  ok('Relaxed held moves: at once, then at 160 ms and every 50 ms', JSON.stringify(relaxed.slice(0, 4)) === '[0,160,210,260]', JSON.stringify(relaxed));
  const rel = run(false, { 0: c => c.repPress(1), 150: c => c.repRelease(1) }, 400);
  ok('letting go stops the repeats (none after 150 ms)', rel.every(v => v[0] <= 150) && rel.length === 3, JSON.stringify(rel));
  const both = run(false, { 0: c => c.repPress(-1), 50: c => c.repPress(1), 100: c => c.repRelease(1) }, 260);
  ok('the last pressed side wins, and letting it go hands back to the held side with a fresh delay (next left at 205)', JSON.stringify(both.slice(0, 4)) === '[[0,-1],[50,1],[205,-1],[238,-1]]', JSON.stringify(both));
  const thru = run(false, { 0: (c, setPlay) => c.repPress(-1), 100: (c, setPlay) => setPlay(false), 300: (c, setPlay) => setPlay(true) }, 340);
  ok('a hold carries through a spawn: no moves while no pair is in play, the next pair slides on the same beat (303)', JSON.stringify(thru.map(v => v[0])) === '[0,303,336]', JSON.stringify(thru)); }

{ /* the rotation buffer */
  const run = (presses, spawnAt) => { const rots = []; const ctx = { Math, hap: () => {}, playable: () => false, MATCH: { phase: 'fight' }, pf: () => ({}), tryRotate: (f, d) => { rots.push(d); return true; } };
    vm.createContext(ctx); vm.runInContext(grabVar('REP_FAST') + grabVar('INP'), ctx); for (const f of ['rotPress', 'rotBuffered']) vm.runInContext(grab(f), ctx);
    for (const [t, d] of presses) { ctx.INP.clock = t; ctx.rotPress(d); } for (const t of spawnAt) { ctx.INP.clock = t; ctx.rotBuffered({}); } return rots; };
  const a = run([[1000, 1]], [1120]), b = run([[1000, 1]], [1121]), c = run([[1000, 1], [1050, -1]], [1100, 1110]);
  ok('a turn pressed with no pair in play turns the next pair if it spawns within 120 ms (and not at 121), the latest press wins, once', JSON.stringify([a, b, c]) === '[[1],[],[-1]]', JSON.stringify({ a, b, c })); }

/* the kick table and the landing window on the page's own geometry */
function fieldCtx() { const locks = []; const ctx = { Math, locks, T: 0, ROWS, COLS, SFX: new Proxy({}, { get: () => () => {} }), SPAWN_COL: 2, VISROWS: 12,
    decayFall: () => {}, hypeTierOf: () => 0, colHeights: () => [0, 0, 0, 0, 0, 0], aiUpdate: () => {}, resolveTick: () => {}, MATCH: { mode: 'campaign', phase: 'fight' } };
  ctx.lockPiece = f => { locks.push(ctx.T); f.state = 'resolve'; f.cur = null; };
  vm.createContext(ctx);
  for (const v of ['KICKS', 'LAND_MS']) vm.runInContext(grabVar(v), ctx);
  for (const f of ['partnerOf', 'pieceCells', 'cellFree', 'fits', 'moveP', 'tryRotate', 'onGround', 'lowRow', 'landTick', 'landReset', 'tickField']) vm.runInContext(grab(f), ctx);
  return ctx; }
const field = (g, cur, o) => Object.assign({ grid: g, cur, state: 'play', ai: false, softHold: false, gravMs: 1e9, gravAcc: 0, floats: [], flashDanger: 0, chainGlow: 0, hype: 0, land: { on: false, t: 0, age: -1, low: -1, resets: 0 } }, o || {});
{ const cases = [
    ['the left wall: turning the second pod left shoves the pair one column right', grid(), { r: 6, c: 0, rot: 0 }, -1, { r: 6, c: 1, rot: 3 }],
    ['the right wall: turning it right shoves the pair one column left', grid(), { r: 6, c: 5, rot: 0 }, 1, { r: 6, c: 4, rot: 1 }],
    ['the floor: turning the second pod down lifts the pair one row (the floor kick)', grid(), { r: 12, c: 2, rot: 1 }, 1, { r: 11, c: 2, rot: 2 }],
    ['a stack below: the same floor kick off a stack', fill(grid(), 2, 9), { r: 8, c: 2, rot: 1 }, 1, { r: 7, c: 2, rot: 2 }],
    ['a ledge: a taller column on the right shoves the pair one column left', fill(grid(), 3, 6), { r: 6, c: 2, rot: 0 }, 1, { r: 6, c: 1, rot: 1 }],
    ['the top: turning the second pod up into the hidden row works', grid(), { r: 1, c: 2, rot: 1 }, -1, { r: 1, c: 2, rot: 0 }],
    ['a one column shaft: a sideways turn fails, the pair stays', fill(fill(grid(), 1, 4), 3, 4), { r: 8, c: 2, rot: 0 }, 1, { r: 8, c: 2, rot: 0 }],
    ['the other way in the shaft fails too', fill(fill(grid(), 1, 4), 3, 4), { r: 8, c: 2, rot: 0 }, -1, { r: 8, c: 2, rot: 0 }],
    ['never a climb: blocked both ways, v1.8 hopped the pair up onto the shorter neighbour; it stays', fill(fill(grid(), 1, 5), 3, 8), { r: 8, c: 2, rot: 0 }, 1, { r: 8, c: 2, rot: 0 }]];
  const bad = [];
  for (const [name, g, cur, dir, want] of cases) { const ctx = fieldCtx(), f = field(g, Object.assign({ c1: 1, c2: 2 }, cur)); ctx.tryRotate(f, dir);
    const got = { r: f.cur.r, c: f.cur.c, rot: f.cur.rot }; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(name + ' -> ' + JSON.stringify(got)); }
  ok('the kick table: ' + cases.length + ' cases land where the table says (walls, ledges, the top, floor kicks, a one column shaft, no climb)', bad.length === 0, bad.join(' | ')); }
{ /* the landing window: 1 ms ticks through the page's own tickField */
  const run = (g, cur, o, script, until) => { const ctx = fieldCtx(), f = field(g, Object.assign({ c1: 1, c2: 2 }, cur), o); ctx.MATCH.pf = f;
    /* the pair sits where it is put at time 0; the tick at T brings the clock from T-1 to T, then the events of time T */
    for (ctx.T = 1; ctx.T <= until && f.cur; ctx.T++) { ctx.tickField(f, 1, false); if (f.cur && script[ctx.T]) script[ctx.T](ctx, f); }
    return ctx.locks[0]; };
  const floor = () => grid(), at = { r: 12, c: 2, rot: 0 };
  const plain = run(floor(), at, {}, {}, 2000);
  const two = run(floor(), at, {}, { 100: (c, f) => c.moveP(f, 1), 200: (c, f) => c.moveP(f, -1), 300: (c, f) => c.moveP(f, 1) }, 2000);
  const cap = run(floor(), at, {}, { 250: (c, f) => c.moveP(f, 1), 500: (c, f) => c.moveP(f, -1) }, 2000);
  const soft = run(floor(), at, { softHold: true }, {}, 2000);
  ok('a pair that touches down locks 300 ms later when nobody touches it', plain === 300, plain);
  ok('two moves while it is down restart the wait (100, 200: locks at 500); a third does not', two === 500, two);
  ok('however it is moved it locks 650 ms after its first touchdown (moves at 250 and 500 would have run to 800)', cap === 650, cap);
  ok('a held soft drop locks it 40 ms after touchdown', soft === 40, soft);
  const lower = run(fill(grid(), 3, 8), { r: 7, c: 3, rot: 0 }, { gravMs: 50 }, { 200: (c, f) => c.moveP(f, -1) }, 3000);
  ok('walking off a ledge and landing lower gives a fresh window (it lands about 450 and locks 300 later, past the old 650)', lower > 700 && lower < 820, lower);
  const kick = run(floor(), { r: 12, c: 2, rot: 1 }, { gravMs: 50 }, { 100: (c, f) => c.tryRotate(f, 1), 200: (c, f) => c.tryRotate(f, 1), 300: (c, f) => c.tryRotate(f, 1), 400: (c, f) => c.tryRotate(f, 1), 500: (c, f) => c.tryRotate(f, 1), 600: (c, f) => c.tryRotate(f, 1) }, 3000);
  ok('turning it over and over on the floor (floor kicks, hops) never buys a fresh window: locked by 650', kick != null && kick <= 650, kick);
  /* a player board in play with no pair (a fixture, a dev hook) must not throw: a throw in update() stops the game loop for good */
  { const ctx = fieldCtx(), f = field(grid(), null); ctx.MATCH.pf = f; let err = null; try { ctx.tickField(f, 16, false); } catch (e) { err = String(e); }
    ok('a board in play with no pair ticks without a throw (the landing window read a null pair and froze the game loop)', err === null, err); } }

console.log('[B] the page, with real touches');
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
  const cdp = await p.target().createCDPSession();
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  return { p, errs, T }; }
const fresh = async p => { await p.evaluate(() => { window.CW_DEV.beginStage(0); });
  for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
  return p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; if (M.of) M.of.gravMs = 1e9; M.of.react = 1e9; return { r: M.pf.cur.r, c: M.pf.cur.c, rot: M.pf.cur.rot }; }); };
const cur = p => p.evaluate(() => { const M = window.CW_DEV.match(), f = M.pf; let n = 0; for (const row of f.grid) for (const v of row) if (v) n++;
  return { r: f.cur && f.cur.r, c: f.cur && f.cur.c, rot: f.cur && f.cur.rot, state: f.state, soft: !!f.softHold, pods: n, dir: window.CW_DEV.inp().dir }; });
const rects = p => p.evaluate(() => { const o = {}; for (const id of ['c-left', 'c-down', 'c-right', 'c-rotccw', 'c-rot', 'dropbtn']) { const r = document.getElementById(id).getBoundingClientRect(); o[id] = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left }; }
  const t = document.getElementById('tray').getBoundingClientRect(), g = document.getElementById('game').getBoundingClientRect(), s = g.width / 540;
  o.trayTop = t.top; o.foot = g.top + 840 * s; o.s = s; o.boardTop = g.top + 112 * s; o.cell = 58 * s; o.board = { x: g.left + (16 + 58 * 3) * s, y: g.top + (112 + 58 * 6) * s }; return o; });
const tapAt = async (T, x, y, ms) => { await T('touchStart', [[x, y, 7]]); await sleep(ms || 40); await T('touchEnd', []); await sleep(80); };
try {
  await sleep(500);
  // 1. geometry at three phones
  for (const [w, h] of [[412, 915], [375, 667], [360, 780]]) { const o = await open(w, h); await fresh(o.p); const R = await rects(o.p);
    const ids = ['c-left', 'c-down', 'c-right', 'c-rotccw', 'c-rot', 'dropbtn'], small = ids.filter(id => R[id].h < 56 - 0.5 || R[id].w < 48);
    ok(`${w}x${h}: all six tray buttons are at least 56 px tall and 48 wide (rendered), and the board's frame foot is above the tray`, small.length === 0 && R.foot <= R.trayTop + 0.5, JSON.stringify({ small, foot: Math.round(R.foot), trayTop: Math.round(R.trayTop), s: +R.s.toFixed(3), h: Math.round(R['c-left'].h) }));
    if (w === 412 || w === 360) ok(`${w}x${h}: the board keeps v1.8's scale (the width fit)`, Math.abs(R.s - w / 540) < 0.002, R.s);
    await o.p.close(); }
  const { p, errs, T } = await open(412, 915);
  let R = await rects(p);
  // 2. the arrows: a tap moves one column, a hold runs to the wall
  { await fresh(p); const a = await cur(p); await tapAt(T, R['c-left'].x, R['c-left'].y, 50); const b1 = await cur(p); await tapAt(T, R['c-right'].x, R['c-right'].y, 50); const b2 = await cur(p);
    await T('touchStart', [[R['c-left'].x, R['c-left'].y, 3]]); await sleep(450); const held = await cur(p); await T('touchEnd', []); await sleep(80); const after = await cur(p);
    ok('LEFT and RIGHT taps move exactly one column each; a held LEFT runs the pair to the wall; letting go stops the scheduler', b1.c === a.c - 1 && b2.c === a.c && held.c === 0 && after.dir === 0, JSON.stringify({ a: a.c, b1: b1.c, b2: b2.c, held: held.c, dir: after.dir })); }
  // 3. SOFT: held, the pair falls fast; let go, it stops
  { await fresh(p); const a = await cur(p); await T('touchStart', [[R['c-down'].x, R['c-down'].y, 4]]); await sleep(300); const mid = await cur(p); await T('touchEnd', []); await sleep(100); const b1 = await cur(p); await sleep(300); const b2 = await cur(p);
    ok('a held SOFT drops the pair fast (5 rows or more in 300 ms on a stage that falls once a second here), letting go stops it', mid.soft && mid.r - a.r >= 5 && !b1.soft && b2.r === b1.r, JSON.stringify({ a: a.r, mid: mid.r, soft: mid.soft, b1: b1.r, b2: b2.r })); }
  // 4. the turns
  { await fresh(p); await tapAt(T, R['c-rot'].x, R['c-rot'].y); const a = await cur(p); await tapAt(T, R['c-rotccw'].x, R['c-rotccw'].y); const b1 = await cur(p);
    ok('ROTATE R turns the pair right once, ROTATE L turns it back', a.rot === 1 && b1.rot === 0, JSON.stringify({ a: a.rot, b: b1.rot })); }
  // 5. DROP: exactly one pair, and the next pair is not dropped
  { const s0 = await fresh(p); const pods0 = (await cur(p)).pods; await tapAt(T, R['dropbtn'].x, R['dropbtn'].y); await sleep(900); const a = await cur(p);
    ok('a tap on DROP drops one pair: two more pods on the board and the next pair waits at the top', a.pods === pods0 + 2 && a.state === 'play' && a.r === 1, JSON.stringify({ pods0, a })); }
  // 6. the board: a tap turns, a sideways drag follows, a mostly vertical drag with sideways wobble never moves a column
  { await fresh(p); const a = await cur(p); await tapAt(T, R.board.x, R.board.y, 60); const t1 = await cur(p);
    await T('touchStart', [[R.board.x, R.board.y, 5]]); for (let k = 1; k <= 6; k++) { await T('touchMove', [[R.board.x - R.cell * 2.2 * k / 6, R.board.y, 5]]); await sleep(20); } await T('touchEnd', []); await sleep(80); const d1 = await cur(p);
    await T('touchStart', [[R.board.x, R.board.y, 6]]); for (let k = 1; k <= 6; k++) { await T('touchMove', [[R.board.x + 24 * k / 6, R.board.y + 40 * k / 6, 6]]); await sleep(20); } await T('touchEnd', []); await sleep(80); const d2 = await cur(p);
    ok('on the board a tap turns the pair, a sideways drag of 2.2 cells moves it 2 columns, and a 40 px drag down with 24 px of wobble moves no column', t1.rot === a.rot + 1 && d1.c === a.c - 2 && d2.c === d1.c, JSON.stringify({ a, t1: t1.rot, d1: d1.c, d2: d2.c })); }
  // 7. a long drag down soft drops while held; the flick up does nothing unless the setting is on
  { await fresh(p); await T('touchStart', [[R.board.x, R.board.y, 8]]); for (let k = 1; k <= 6; k++) { await T('touchMove', [[R.board.x, R.board.y + R.cell * 2 * k / 6, 8]]); await sleep(20); } const mid = await cur(p); await T('touchEnd', []); await sleep(80); const aft = await cur(p);
    await fresh(p); const f0 = await cur(p); await T('touchStart', [[R.board.x, R.board.y, 9]]); for (let k = 1; k <= 4; k++) { await T('touchMove', [[R.board.x, R.board.y - 18 * k, 9]]); await sleep(15); } await T('touchEnd', []); await sleep(200); const f1 = await cur(p);
    await p.evaluate(() => window.CW_DEV.setting('flick', true)); await fresh(p); const g0 = await cur(p);
    await T('touchStart', [[R.board.x, R.board.y, 10]]); for (let k = 1; k <= 4; k++) { await T('touchMove', [[R.board.x, R.board.y - 18 * k, 10]]); await sleep(15); } await T('touchEnd', []); await sleep(200); const g1 = await cur(p);
    await p.evaluate(() => window.CW_DEV.setting('flick', false));
    ok('a drag down soft drops while held and lets go after; a flick up drops nothing by default and hard drops with the setting on', mid.soft && !aft.soft && f1.pods === f0.pods && f1.state === 'play' && g1.pods === g0.pods + 2, JSON.stringify({ mid: mid.soft, aft: aft.soft, f0: f0.pods, f1: f1.pods, g0: g0.pods, g1: g1.pods })); }
  // 8. holds let go when the window loses focus or the page hides
  { await fresh(p); await T('touchStart', [[R['c-right'].x, R['c-right'].y, 11]]); await sleep(60);
    const before = await cur(p); await p.evaluate(() => window.dispatchEvent(new Event('blur'))); const c0 = (await cur(p)).c; await sleep(400); const after = await cur(p); await T('touchEnd', []); await sleep(60);
    await fresh(p); await T('touchStart', [[R['c-down'].x, R['c-down'].y, 12]]); await sleep(60); const s1 = await cur(p);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; });
    const s2 = await cur(p); await T('touchEnd', []); await sleep(60);
    ok('a held RIGHT stops when the window loses focus; a held SOFT lets go when the page hides', before.dir === 1 && after.dir === 0 && after.c === c0 && s1.soft && !s2.soft, JSON.stringify({ before: before.dir, after, c0, s1: s1.soft, s2: s2.soft })); }
  // 9. the mirrored tray
  { const m = await p.evaluate(() => { window.CW_DEV.setting('mirror', true); const d = document.getElementById('dropbtn').getBoundingClientRect().left, l = document.getElementById('c-rotccw').getBoundingClientRect().left; window.CW_DEV.setting('mirror', false); const d2 = document.getElementById('dropbtn').getBoundingClientRect().left; return { d, l, d2 }; });
    ok('Drop button on the left puts DROP first in its row, and back', m.d < m.l && m.d2 > m.l, JSON.stringify(m)); }
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
  // [C] thumb shots
  if (SHOTS) for (const [w, h] of [[412, 915], [360, 780]]) { const o = w === 412 ? { p } : await open(w, h); await fresh(o.p); const Rr = await rects(o.p);
    await o.p.evaluate((x, y) => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;z-index:99;pointer-events:none;width:46px;height:58px;border-radius:50%;background:rgba(232,190,160,.55);border:2px solid rgba(120,80,60,.6);left:' + (x - 23) + 'px;top:' + (y - 22) + 'px;transform:rotate(-24deg)'; document.body.appendChild(d); }, Rr['dropbtn'].x + 6, Rr['dropbtn'].y + 6);
    await o.p.evaluate((x, y) => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;z-index:99;pointer-events:none;width:46px;height:58px;border-radius:50%;background:rgba(232,190,160,.55);border:2px solid rgba(120,80,60,.6);left:' + (x - 23) + 'px;top:' + (y - 22) + 'px;transform:rotate(24deg)'; document.body.appendChild(d); }, Rr['c-left'].x - 6, Rr['c-left'].y + 6);
    await sleep(200); await o.p.screenshot({ path: `${OUT}/thumbs-${w}x${h}.png` }); if (o.p !== p) await o.p.close(); }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p2a: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
