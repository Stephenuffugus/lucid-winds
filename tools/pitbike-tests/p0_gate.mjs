// Pit Bike Rally Part 0 gate (v1.8, 24 Oct 2026): protected earnings and versioned records.
// Serves a copy of the game (default: the upstream clone) and drives the REAL modules in a browser through the dev hook:
//  A. a v1.7 save (v 2) loads as v 3 and every field it had round trips byte for byte, in memory and after saveNow;
//  B. finishRace on a career race and on a time trial leaves G.wear untouched, on a free race it adds wear (the guard);
//  C. a real time trial driven by the autopilot stamps pv 1 on its record and its ghost; a real career race driven to the
//     line leaves the wear untouched, then the garage is shot (look).
// node p0_gate.mjs [gameDir] [outDir]     one browser at a time (2 cores)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = process.argv[2] || '/workspaces/skywolf-pitbike-rally', OUT = process.argv[3] || '/tmp/claude-1000/pb/p0';
const PORT = 8790 + Math.floor(Math.random() * 100);
const sleep = t => new Promise(r => setTimeout(r, t));
require('fs').mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 700)); } }
/* a v1.7 save as a real player has it: bought and equipped parts with wear, colours, medals, trophies, a ghost, a career
   mid season, a streak, time trial records */
const FIX = { v: 2, wallet: 12345, owned: ['eng0', 'exh0', 'crb0', 'tir0', 'sus0', 'grs0', 'frm0', 'brk0', 'nit0', 'arm0', 'eng1', 'tir1', 'grs1', 'brk1'],
  equipped: { engine: 'eng1', exhaust: 'exh0', carb: 'crb0', tires: 'tir1', susp: 'sus0', gears: 'grs1', frame: 'frm0', brakes: 'brk1', nitro: 'nit0', armor: 'arm0' },
  ownedColors: ['red', 'blue', 'green', 'orange'], color: 'orange', plate: 23, skin: 'base',
  best: { '0:0': 41234, '1:2': 77001 }, medals: { '0:0': ['gold', 'silver', 'bronze'], '3:1': ['bronze'] }, wear: { eng1: 12, tir1: 30.5, brk1: 4 },
  ghosts: { '0:0': { ms: 13010, hz: 10, pts: [1, 2, 0.5, 3, 4, 0.6, 5, 6, 0.7, 7, 8, 0.8, 9, 10, 0.9, 11, 12, 1.0, 13, 14, 1.1] } },
  tt: { '0:0': { best: 12950, medals: ['bronze', 'silver'] } }, career: { id: 'rookie', round: 2, pts: [17, 14, 8, 6], log: [1, 2] },
  trophies: { rookie: 2 }, wins: 9, races: 31, earnings: 45678, trackIndex: 0, variant: 0, muted: true,
  sunbeamDay: '2026-10-23', sunbeamEarnedToday: 7, dailyLast: '2026-10-23', dailyStreak: 4, title: 'Weekend Warrior' };
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
try {
  await sleep(600);
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: 915, height: 412, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(f => { if (!sessionStorage.getItem('fixed')) { localStorage.setItem('skywolf.pitbikerally.save.v1', JSON.stringify(f)); sessionStorage.setItem('fixed', '1'); } }, FIX);
  await p.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.__PBR && window.__PBR.S && window.__PBR.S.G && window.__PBR.S.currentScreen === 'menu' && document.getElementById('menu-stats').textContent.length > 0 /* boot ran setScreen('menu') */, { timeout: 60000 });
  console.log('[A] a v1.7 save round trips');
  const A = await p.evaluate(() => { const G = window.__PBR.S.G, o = {};
    for (const k in G) o[k] = (G[k] instanceof Set) ? Array.from(G[k]) : G[k]; window.__PBR.saveNow();
    return { mem: o, disk: JSON.parse(localStorage.getItem('skywolf.pitbikerally.save.v1')) }; });
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y), setEq = (x, y) => same([...x].sort(), [...y].sort());
  const diffs = where => Object.keys(FIX).filter(k => k !== 'v' && !((k === 'owned' || k === 'ownedColors') ? setEq(where[k] || [], FIX[k]) : same(where[k], FIX[k])));
  ok('loaded: v 3, physV 1, an empty bestPv', A.mem.v === 3 && A.mem.physV === 1 && same(A.mem.bestPv, {}), JSON.stringify({ v: A.mem.v, physV: A.mem.physV, bestPv: A.mem.bestPv }));
  ok('in memory every field of the v1.7 save is unchanged', diffs(A.mem).length === 0, JSON.stringify(diffs(A.mem)));
  ok('written back, every field of the v1.7 save is unchanged byte for byte', diffs(A.disk).length === 0 && A.disk.v === 3 && A.disk.physV === 1, JSON.stringify(diffs(A.disk)));
  console.log('[B] wear: the career and the time trial wear nothing, the free race wears the bought parts');
  const B = await p.evaluate(() => { const H = window.__PBR, G = H.S.G, snap = () => JSON.stringify(G.wear), out = {};
    const run = (opts) => { const w0 = snap(); H.startRace(0, 0, opts); H.finishRace(); return { before: w0, after: snap() }; };
    out.career = run({ career: true }); out.careerWas = !!H.S.race.career;
    out.tt = run({ tt: true }); out.ttWas = !!H.S.race.tt;
    out.race = run({}); out.raceWas = !H.S.race.tt && !H.S.race.career;
    return out; });
  ok('a career race (finished through finishRace) leaves the wear as it was', B.careerWas && B.career.before === B.career.after, JSON.stringify(B.career));
  ok('a time trial leaves the wear as it was', B.ttWas && B.tt.before === B.tt.after, JSON.stringify(B.tt));
  const wb = JSON.parse(B.race.before), wa = JSON.parse(B.race.after);
  ok('a free race adds wear to every bought part equipped (eng1, tir1, grs1, brk1)', B.raceWas && ['eng1', 'tir1', 'grs1', 'brk1'].every(k => (wa[k] || 0) > (wb[k] || 0)), JSON.stringify(B.race));
  if (process.env.SKIPC !== '1') {
  console.log('[C] the real thing: an autopilot time trial and an autopilot career race');
  const C1 = await p.evaluate(async () => { const H = window.__PBR, S = H.S; H.autopilot = true;
    H.startRace(0, 0, { tt: true, quick: true }); H.setScreen('race');
    const t0 = performance.now(); while (performance.now() - t0 < 150000 && S.race.active) await new Promise(r => setTimeout(r, 250));
    const key = '0:0'; return { done: !S.race.active, rec: S.G.tt[key], ghostPv: S.G.ghosts[key] && S.G.ghosts[key].pv, ghostMs: S.G.ghosts[key] && S.G.ghosts[key].ms,
      disk: JSON.parse(localStorage.getItem('skywolf.pitbikerally.save.v1')).tt[key] }; });
  ok('an autopilot time trial finishes and its record carries pv 1 (memory and disk)', C1.done && C1.rec && C1.rec.pv === 1 && C1.disk && C1.disk.pv === 1, JSON.stringify(C1));
  ok('its ghost carries pv 1 when the lap beat the old ghost, and the old best is kept when it did not', C1.done && (C1.ghostPv === 1 ? C1.ghostMs < 13010 : C1.ghostMs === 13010), JSON.stringify(C1));
  const C2 = await p.evaluate(async () => { const H = window.__PBR, S = H.S; H.autopilot = true;
    const w0 = JSON.stringify(S.G.wear), r0 = S.G.career ? S.G.career.round : null;
    H.startRace(0, 0, { career: true, quick: true }); H.setScreen('race');
    const t0 = performance.now(); while (performance.now() - t0 < 200000 && S.race.active) await new Promise(r => setTimeout(r, 250));
    return { done: !S.race.active, career: S.race.career, w0, w1: JSON.stringify(S.G.wear), r0, r1: S.G.career ? S.G.career.round : null }; });
  ok('an autopilot career race to the line leaves the wear as it was and moves the season on', C2.done && C2.career && C2.w0 === C2.w1 && C2.r1 === C2.r0 + 1, JSON.stringify(C2));
  await p.evaluate(() => { window.__PBR.autopilot = false; window.__PBR.setScreen('garage'); });
  await sleep(1200); await p.screenshot({ path: OUT + '/garage-after-career.png' });
  }
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pitbike p0: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
