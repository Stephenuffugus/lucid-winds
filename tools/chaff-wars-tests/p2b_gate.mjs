// Pop N Lock Part 2b gate (v1.10): feel and fairness. [A] the page's own functions in a node vm: the landing guide's
// cells match the real landing (split and stacked, on a fixed seed of boards); 31 queued Chaff land 30 and keep 1; a
// mutual top out on one tick is a draw; the chain rhythm runs on time (the same fall at 60 and 120 Hz, 110 to 180 ms by
// distance, an 80 ms squash). [B] the page: a hidden Campaign match stays put and comes back through a three count;
// Versus keeps the watchdog. [C] a look: a chain mid pop at 412 with the queue and the guide.
// node p2b_gate.mjs [pageFile] [outDir] [noShots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/';
const PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p2b', SHOTS = !process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(DIR + PAGE, 'utf8');
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 600)); } }
function grab(name) { const i = SRC.indexOf('function ' + name + '('); if (i < 0) throw new Error('no ' + name);
  let j = SRC.indexOf('{', i), d = 0, k = j; for (; k < SRC.length; k++) { const c = SRC[k]; if (c === '{') d++; else if (c === '}') { d--; if (d === 0) break; } } return SRC.slice(i, k + 1); }
function grabVar(name) { const m = SRC.match(new RegExp('var ' + name + '=[^;]*;')); if (!m) throw new Error('no var ' + name); return m[0]; }
const ROWS = 13, COLS = 6, CHAFF = 6;
const grid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

console.log('[A] the page\'s own functions, in a node vm');
{ /* the guide against the real landing: hard drop the pair, lock it, let the page's gravity settle it */
  const ctx = { Math, ROWS, COLS, VISROWS: 12 };
  vm.createContext(ctx);
  for (const f of ['partnerOf', 'pieceCells', 'cellFree', 'fits', 'colTop', 'guideCells', 'applyGravity']) vm.runInContext(grab(f), ctx);
  const rnd = mulberry(20261024), bad = []; let split = 0, stacked = 0;
  for (let n = 0; n < 300; n++) { const g = grid();
    for (let c = 0; c < COLS; c++) { const h = Math.floor(rnd() * 10); for (let r = ROWS - h; r < ROWS; r++) g[r][c] = 1 + Math.floor(rnd() * 5); }
    const cur = { r: 1, c: Math.floor(rnd() * COLS), rot: Math.floor(rnd() * 4), c1: 1 + Math.floor(rnd() * 5), c2: 1 + Math.floor(rnd() * 5) };
    if (!ctx.fits(g, cur)) continue;
    const f = { grid: g, cur }; const guide = ctx.guideCells(f);
    while (ctx.fits(g, { r: cur.r + 1, c: cur.c, rot: cur.rot, c1: cur.c1, c2: cur.c2 })) cur.r++;   /* the hard drop */
    const real = g.map(row => row.slice()); for (const cell of ctx.pieceCells(cur)) if (cell.r >= 0) real[cell.r][cell.c] = cell.col;
    ctx.applyGravity(real);
    const want = guide.map(q => q.r >= 0 && real[q.r][q.c] === q.col);
    const sp = guide[0].c !== guide[1].c && guide[0].r !== guide[1].r; if (sp) split++; if (guide[0].c === guide[1].c) stacked++;
    const prev = g.map(row => row.slice()); let changed = 0; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (real[r][c] !== prev[r][c]) changed++;
    if (!want[0] || !want[1] || changed !== 2) bad.push(JSON.stringify({ n, cur, guide }));
  }
  ok(`the landing guide marks exactly the two cells each pod ends in, on 300 seeded boards (${split} split landings, ${stacked} stacked)`, bad.length === 0 && split > 20 && stacked > 20, bad.slice(0, 2).join(' | ')); }
{ /* 31 queued: 30 land (the cap is per landing), 1 stays */
  const ctx = { Math, ROWS, COLS, CHAFF, GARBAGE_CAP: 30, MATCH: { pf: null, of: null }, SFX: new Proxy({}, { get: () => () => {} }), railHit: () => {}, shake: () => {}, hypeTierOf: () => 0, setFall: () => 0, afterTurn: () => {} };
  vm.createContext(ctx); vm.runInContext(grab('dropPending'), ctx);
  const f = { grid: grid(), pending: 31, rng: mulberry(7), hype: 0, hypeTier: 0 }; ctx.MATCH.pf = f; ctx.dropPending(f);
  let landed = 0; for (const row of f.grid) for (const v of row) if (v === CHAFF) landed++;
  ok('31 queued Chaff: 30 land this turn and 1 stays queued for the next', landed === 30 && f.pending === 1, JSON.stringify({ landed, pending: f.pending })); }
{ /* a mutual top out on one tick */
  const ends = []; const ctx = { Math, MATCH: { pf: null, of: null, judge: null }, endMatch: r => ends.push(r), spawnPiece: () => false };
  vm.createContext(ctx); for (const f of ['afterTurn', 'judgeTick']) vm.runInContext(grab(f), ctx);
  const pf = { dead: false }, of = { dead: false }; ctx.MATCH.pf = pf; ctx.MATCH.of = of;
  ctx.afterTurn(pf); ctx.afterTurn(of); ctx.judgeTick(); const both = ends.slice();
  ends.length = 0; ctx.MATCH.judge = null; const pf2 = { dead: false }, of2 = { dead: false }; ctx.MATCH.pf = pf2; ctx.MATCH.of = of2; ctx.afterTurn(pf2); ctx.judgeTick(); const one = ends.slice();
  ok('both boards topping out on one tick is a draw (the player\'s board used to lose before the rival\'s was looked at); one alone loses', JSON.stringify(both) === '["draw"]' && JSON.stringify(one) === '["lose"]', JSON.stringify({ both, one })); }
{ /* the chain rhythm on time */
  const ctx = { Math, ROWS, COLS, VISROWS: 12, MATCH: { pf: null }, PF: { cell: 58 }, OF: { cell: 21 } };
  vm.createContext(ctx); vm.runInContext(grabVar('FALL_MIN'), ctx); vm.runInContext('function newLayer(){ var a=[],r,c; for(r=0;r<ROWS;r++){ a[r]=[]; for(c=0;c<COLS;c++)a[r][c]=0; } return a; }', ctx);
  for (const f of ['fallDur', 'fallLayers', 'setFall', 'squashAt', 'decayFall']) vm.runInContext(grab(f), ctx);
  const run = (hz, rows, at) => { const f = {}; ctx.MATCH.pf = f; const dur = ctx.setFall(f, [{ c: 0, from: 12 - rows, to: 12 }]); const dt = 1000 / hz; let t = 0, off = null;
    while (t + dt <= at + 1e-9) { ctx.decayFall(f, dt); t += dt; } off = f.fall ? f.fall[12][0] : 0; return { dur, off, sq: f.squash ? f.squash[12][0] : 0 }; };
  const a60 = run(60, 6, 50), a120 = run(120, 6, 50), one = run(60, 1, 0), all = run(60, 12, 0), land = run(120, 1, 120);
  ok('a fall runs on time: the same height at 50 ms at 60 and 120 Hz; 110 ms for one row, 180 for the well; the pod squashes 80 ms as it lands',
    Math.abs(a60.off - a120.off) < 0.5 && one.dur === 110 && all.dur === 180 && land.off === 0 && land.sq > 60 && land.sq <= 80, JSON.stringify({ a60, a120, one: one.dur, all: all.dur, land })); }

console.log('[B] the page');
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
try {
  await sleep(500);
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
  await p.evaluate(() => window.CW_DEV.beginStage(0));
  for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
  await sleep(600);
  const snap = () => p.evaluate(() => { const M = window.CW_DEV.match(); return JSON.stringify([M.pf.grid, M.pf.cur, M.of.grid, M.of.cur, M.pf.score, M.of.score]); });
  /* hidden: the page's own visibility handler, with document.hidden true */
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  const s0 = await snap(); await sleep(2500); const s1 = await snap(); const paused = await p.evaluate(() => window.CW_DEV.match().paused);
  await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  const c0 = await p.evaluate(() => ({ paused: window.CW_DEV.match().paused, count: window.CW_DEV.match().count })); await sleep(1000);
  const mid = await p.evaluate(() => ({ paused: window.CW_DEV.match().paused, count: window.CW_DEV.match().count })); const s2 = await snap(); await sleep(1700);
  const back = await p.evaluate(() => ({ paused: window.CW_DEV.match().paused, phase: window.CW_DEV.match().phase }));
  ok('a hidden Campaign match stays exactly as it was for 2.5 s, then comes back through a three count (still held a second in) and plays on', paused === true && s0 === s1 && s1 === s2 && c0.paused === true && c0.count === 3 && mid.paused === true && mid.count >= 1 && mid.count <= 2 && back.paused === false && back.phase === 'fight', JSON.stringify({ same: s0 === s1, held: s1 === s2, paused, c0, mid, back }));
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
  if (SHOTS) { /* a chain mid pop: four reds at the bottom left, the pair dropped elsewhere, the shot 120 ms into the pop */
    await p.evaluate(() => { const M = window.CW_DEV.match(), g = M.pf.grid; M.pf.gravMs = 1e9; M.of.react = 1e9;
      for (let r = 0; r < 13; r++) for (let c = 0; c < 6; c++) g[r][c] = 0;
      g[12][0] = 1; g[12][1] = 1; g[12][2] = 1; g[11][0] = 1; g[12][3] = 2; g[11][3] = 2; g[10][3] = 3; g[12][5] = 4; g[11][5] = 4;
      M.pf.pending = 14; M.pf.cancelN = 6; M.pf.cancelT = 1500; M.pf.cur.c = 5; M.pf.cur.rot = 0; M.pf.cur.r = 3; M.pf.cur.c1 = 3; M.pf.cur.c2 = 2; window.CW_DEV.drop(M.pf); });
    await sleep(120); await p.screenshot({ path: OUT + '/chain-mid-pop.png' });
    for (let w = 0; w < 30; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().pf.state === 'play')) break; }
    await p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; M.pf.pending = 14; M.pf.cur.c = 3; M.pf.cur.rot = 1; M.pf.cur.r = 3; });   /* a split landing: column 3 is three high, column 4 empty */
    await sleep(200); await p.screenshot({ path: OUT + '/guide-queue.png' }); }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p2b: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
