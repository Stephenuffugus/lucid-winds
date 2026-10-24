// Pop N Lock Part 0 gate (v1.7, 24 Oct 2026): the five verified bugs (plans/pop-n-lock/BUILD-PLAN-OCT24.md).
// [A] node vm over the page's OWN functions (tickField, decayFall, hypeTierOf, addHype, finishResolve, pulled out of
//     index.html as they are): HYPE 80 after 16 ms is 79.98, the rival's glow 1 after 16 ms is 0.98, an All Clear bonus
//     survives a plain lock and is spent once, on the next chain.
// [B] the page in headless Chrome with REAL touches (CDP Input.dispatchTouchEvent, never el.click()): a cancelled 10 px,
//     100 ms touch rotates and drops nothing; a held arrow repeats first AT 105 ms; a lock mid drag hands no soft drop on.
// [C] the look: a match with HYPE past WARM, holding, shot at 412 x 915.
// node p0_gate.mjs [pageFile] [outDir]      (pageFile default: the live index.html; a broken copy for the fail watch)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/';
const PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p0';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(DIR + PAGE, 'utf8');
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 500)); } }
function grab(name) { const i = SRC.indexOf('function ' + name + '('); if (i < 0) throw new Error('no ' + name);
  let j = SRC.indexOf('{', i), d = 0, k = j; for (; k < SRC.length; k++) { const c = SRC[k]; if (c === '{') d++; else if (c === '}') { d--; if (d === 0) break; } } return SRC.slice(i, k + 1); }
function grabVar(name) { const m = SRC.match(new RegExp('var ' + name + '=[^;]*;')); if (!m) throw new Error('no var ' + name); return m[0]; }

console.log('[A] the page\'s own tick and resolve functions, in a node vm');
{ const ctx = { Math, MATCH: null, RULES: { classic: false }, SFX: new Proxy({}, { get: () => () => {} }), _mpGarbage: () => {}, dropPending: () => {},
    boardEmpty: () => false, aiUpdate: () => {}, resolveTick: () => {}, colHeights: () => [0, 0, 0, 0, 0, 0], SPAWN_COL: 2, VISROWS: 12,
    ROWS: 13, COLS: 6, addSap: () => {}, railChainEnd: () => {}, lockPiece: () => {} };
  vm.createContext(ctx);
  for (const v of ['HYPE_TIERS', 'TARGET_POINTS', 'ALLCLEAR_NUIS', 'LAND_MS']) vm.runInContext(grabVar(v), ctx);
  for (const f of ['hypeTierOf', 'addHype', 'decayFall', 'tickField', 'finishResolve', 'partnerOf', 'pieceCells', 'cellFree', 'fits', 'onGround', 'lowRow', 'landTick']) vm.runInContext(grab(f), ctx);
  /* v1.9: a pair high in a tall empty well, so the gravity checks count the rows it falls (the landing window never fires) */
  const tall = () => Array.from({ length: 13 }, () => Array(6).fill(0)), air = () => ({ r: -400, c: 2, rot: 0, c1: 1, c2: 1 });
  const field = o => Object.assign({ floats: [], hype: 0, hypeTier: 0, chainGlow: 0, flashDanger: 0, state: 'idle', score: 0, carry: 0, pending: 0, allBonus: false, grid: [] }, o);
  const pf = field({ hype: 80 }), of = field({ chainGlow: 1 });
  ctx.MATCH = { pf, of, phase: 'fight', mode: 'campaign', powers: false }; pf.hypeTier = ctx.hypeTierOf(80);
  ctx.tickField(pf, 16, false); ctx.tickField(of, 16, true);
  ok('HYPE 80 after 16 ms is 79.98 (1.3 a second; it read the 16 ms as 16 s and fell to 59)', Math.abs(pf.hype - 79.98) < 0.005, pf.hype);
  ok('the rival\'s chain glow 1 after 16 ms is 0.98 (it was gone in under a millisecond)', Math.abs(of.chainGlow - 0.982) < 0.003, of.chainGlow);
  // All Clear: a plain lock (no chain) keeps the bonus; the next chain spends it, once
  const a = field({ allBonus: true }), b = field({});
  ctx.MATCH = { pf: a, of: b, phase: 'fight', mode: 'campaign', powers: false };
  a.res = { score: 0, chain: 0, cleared: 0 }; ctx.finishResolve(a); const keep = a.allBonus, after0 = b.pending;
  a.res = { score: 40, chain: 1, cleared: 4 }; ctx.finishResolve(a); const spent = !a.allBonus, after1 = b.pending;
  a.res = { score: 40, chain: 1, cleared: 4 }; ctx.finishResolve(a); const after2 = b.pending;
  const bonus = ctx.TARGET_POINTS * ctx.ALLCLEAR_NUIS / ctx.TARGET_POINTS;
  // the soft drop backlog: 600 ms saved up on an 833 ms stage, then the soft drop engages
  { const g = field({ state: 'play', gravMs: 833, gravAcc: 600, softHold: true, cur: air(), grid: tall(), land: { on: false, t: 0, age: -1, low: -1, resets: 0 } }); const r0 = g.cur.r;
    ctx.MATCH = { pf: g, of: null, phase: 'fight', mode: 'campaign', powers: false }; ctx.tickField(g, 16, false); const steps = g.cur.r - r0;
    ok('starting a soft drop drops at most one row at once, then speeds the fall (it spent 600 ms of slow fall as 15 rows in one frame)', steps === 1, steps); }
  // the review: the clamp must never throw a frame's time away (the soft drop at 40 ms a row, every stage's own rate)
  { const rate = (gravMs, soft, frames) => { const g = field({ state: 'play', gravMs, gravAcc: 0, softHold: soft, cur: air(), grid: tall(), land: { on: false, t: 0, age: -1, low: -1, resets: 0 } }); const r0 = g.cur.r;
      ctx.MATCH = { pf: g, of: null, phase: 'fight', mode: 'campaign', powers: false }; for (let i = 0; i < frames; i++) ctx.tickField(g, 1000 / 60, false); return g.cur.r - r0; };
    const soft = rate(833, true, 60), st11 = rate(151.5, false, 600);
    ok('a held soft drop falls a row every 40 ms at 60 Hz (25 a second) and stage 11 keeps its 151.5 ms row (66 in 10 s)', soft >= 24 && soft <= 26 && st11 >= 65 && st11 <= 67, JSON.stringify({ soft, st11 })); }
  ok('an All Clear bonus survives a lock with no clear and is spent once, on the next chain', keep && after0 === 0 && spent && after1 >= bonus && after2 - after1 < bonus,
    JSON.stringify({ keep, after0, spent, after1, after2, bonus })); }

{ /* v1.9: the held arrow runs on the ONE repeat scheduler (simulation time). The v1.7 claim still holds: the press moves at
     once, the first repeat lands AT 105 ms (it waited 138), then every 33 ms */
  const calls = []; let now = 0;
  const ctx = { Math, SET: { relaxed: false }, playable: () => true, pf: () => ({}), moveP: () => { calls.push(now); return true; } };
  vm.createContext(ctx); vm.runInContext(grabVar('REP_FAST') + grabVar('INP'), ctx);
  for (const f of ['repProfile', 'repPress', 'repRelease', 'repTick']) vm.runInContext(grab(f), ctx);
  ctx.repPress(1); for (now = 1; now <= 200; now++) ctx.repTick(1);
  ok('a held arrow moves at once, repeats first AT 105 ms (it waited 138), then every 33 ms (the page\'s scheduler, simulation time)', JSON.stringify(calls.slice(0, 4)) === JSON.stringify([0, 105, 138, 171]), JSON.stringify(calls)); }

console.log('[B] the page, with real touches');
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
  const cdp = await p.target().createCDPSession();
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  /* the game lives in a strict closure: the dev hook's live MATCH is the only way in (CW_DEV.match, ?cwdev=1 only) */
  const fresh = async () => { await p.evaluate(() => { window.CW_DEV.beginStage(0); });   /* a match as the game starts one: intro, count, fight */
    for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
    return p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; if (M.of) M.of.gravMs = 1e9; return { rot: M.pf.cur && M.pf.cur.rot, c: M.pf.cur && M.pf.cur.c, phase: M.phase }; }); };
  // a point on the player's board, in CSS px (the board geometry is read from the page's own source line)
  const PFm = SRC.match(/var PF=\{x:(\d+),y:(\d+),cell:(\d+)\}/), PF = { x: +PFm[1], y: +PFm[2], cell: +PFm[3] };
  const board = await p.evaluate(PF => { const cv = document.getElementById('game'), r = cv.getBoundingClientRect(), s = r.width / 540; return { x: r.left + (PF.x + PF.cell * 3) * s, y: r.top + (PF.y + PF.cell * 6) * s, cell: PF.cell * s }; }, PF);
  // 1. a cancelled touch: 10 px, 100 ms, then the browser cancels it
  { const s0 = await fresh(); await sleep(200);
    await T('touchStart', [[board.x, board.y, 1]]); await sleep(50); await T('touchMove', [[board.x + 6, board.y + 8, 1]]); await sleep(50);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await sleep(150);
    const s1 = await p.evaluate(() => { const M = window.CW_DEV.match(); return { rot: M.pf.cur && M.pf.cur.rot, c: M.pf.cur && M.pf.cur.c, locked: !M.pf.cur, soft: !!M.pf.softHold }; });
    ok('a cancelled 10 px, 100 ms touch rotates nothing and drops nothing', s0.rot != null && s1.rot === s0.rot && !s1.locked && !s1.soft, JSON.stringify({ s0, s1 })); }
  // 3. a piece that locks mid drag hands no soft drop (and no drag) to the next piece
  { const fr = await fresh(); await sleep(200);
    await p.evaluate((fr) => { const M = window.CW_DEV.match(); window.__ev = ['fresh ' + JSON.stringify(fr) + ' now ' + M.pf.state + ' r' + (M.pf.cur ? M.pf.cur.r : '-')]; const cv = document.getElementById('game');
      ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(k => cv.addEventListener(k, e => window.__ev.push(k[7] + Math.round(e.clientY) + (M.pf.softHold ? 'S' : '')), true)); }, fr);
    await T('touchStart', [[board.x, board.y, 3]]); await sleep(40);
    /* drag down until the soft drop engages, and read it at once: from then the piece falls a row every 40 ms and locks */
    let mid = { soft: false };
    for (let k = 1; k <= 5 && !mid.soft; k++) { await T('touchMove', [[board.x, board.y + board.cell * 0.6 * k, 3]]);
      mid = await p.evaluate(() => { const M = window.CW_DEV.match(); if (!window.__p0) window.__p0 = M.pf.cur; window.__ev.push('[' + M.pf.state + ' r' + (M.pf.cur ? M.pf.cur.r : '-') + ' g' + M.pf.gravMs + ' ph' + M.phase + ']'); return { soft: !!M.pf.softHold, same: M.pf.cur === window.__p0 }; }); }
    for (let w = 0; w < 60; w++) { await sleep(50); if (await p.evaluate(() => { const M = window.CW_DEV.match(); return M.pf.state === 'play' && !!M.pf.cur && M.pf.cur !== window.__p0; })) break; }
    const aft = await p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; return { soft: !!M.pf.softHold, c: M.pf.cur && M.pf.cur.c, locks: (M.pf.cur && M.pf.cur !== window.__p0) ? 1 : 0 }; });
    await T('touchMove', [[board.x + board.cell * 2.2, board.y + board.cell * 2.4, 3]]); await sleep(120);   /* the same finger slides two columns */
    const fol = await p.evaluate(() => { const M = window.CW_DEV.match(); return { c: M.pf.cur && M.pf.cur.c }; });
    await T('touchEnd', []); await sleep(60);
    ok('a lock in the middle of a soft drop drag hands neither the soft drop nor the drag to the next piece', mid.soft && mid.same && aft.locks > 0 && !aft.soft && fol.c === aft.c, JSON.stringify({ mid, aft, fol, ev: '' }) + ' ' + JSON.stringify(await p.evaluate(() => window.__ev))); }
  // the ALL CITY HYPE banner fits the board (it popped to 73 px, 750 px wide on a 540 canvas, and overprinted HYPE: ILL)
  { await fresh(); const fw = await p.evaluate(async () => { const M = window.CW_DEV.match(), c2 = document.getElementById('game').getContext('2d'), seen = [];
      const orig = c2.fillText; c2.fillText = function (t, x, y) { if (/ALL CITY|HYPE:/.test(t)) seen.push({ t, w: c2.measureText(t).width, y, font: c2.font }); return orig.apply(this, arguments); };
      M.pf.hype = 99; M.pf.hypeTier = 4; M.pf.floats.push({ x: 0, y: 0, txt: 'HYPE: ILL!', life: 0.9, big: true, fld: M.pf }); M.pf.floats.push({ x: 0, y: 0, txt: 'ALL CITY HYPE! +500', life: 1.4, big: true, fld: M.pf });
      await new Promise(r => setTimeout(r, 400)); c2.fillText = orig; return seen; });
    const PFw = PF.cell * 6 + 20, wid = Math.max(...fw.map(v => v.w)), bandOverlap = (() => { const a = fw.filter(v => /ALL CITY/.test(v.t)), b = fw.filter(v => /HYPE:/.test(v.t)); return a.some(x => b.some(y => Math.abs(x.y - y.y) < 20)); })();
    ok('the ALL CITY HYPE banner fits the board and never overprints the tier float (it ran 750 px wide)', fw.length > 0 && wid <= PFw + 1 && !bandOverlap, JSON.stringify({ wid: Math.round(wid), PFw, n: fw.length, bandOverlap, sample: fw.slice(0, 2) })); }
  // [C] the look: HYPE past WARM, holding while the match runs
  { await fresh(); await p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; M.pf.hype = 46; M.pf.hypeTier = 2; });
    await sleep(2000); const h = await p.evaluate(() => { const M = window.CW_DEV.match(); return { hype: +M.pf.hype.toFixed(1), tier: M.pf.hypeTier, phase: M.phase }; });
    await p.screenshot({ path: OUT + '/hype-holding.png' });
    ok('HYPE set to 46 is still past WARM two seconds into a running match (about 43; it used to vanish in 35 ms)', h.hype > 40 && h.hype < 46 && h.tier >= 2, JSON.stringify(h)); }
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p0: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
