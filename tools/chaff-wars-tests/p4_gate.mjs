// Pop N Lock Part 4 gate (v1.12): records carry their rules, input and difficulty; the first three rivals are lessons;
// the fixed seed suite reproduces and the first three rivals keep their speeds.
// [A] a won stage and a solo best write records: rules standard, the input profile from the settings, the difficulty
//     (the stage's fall and q, or the mode), the build. [B] lessons: a fresh player sees the lesson on stage 1 to 3's
//     intro card (STAGE n · LESSON) and in the count, and a loss says Try this; stage 4 keeps its taunt; the player's own
//     pop, chain and cancel each mark their lesson, then the pests' own lines come back, after a reload too.
// [C] the regression suite: stages 1 to 3 x seeds 1 to 6 with the July yardstick and Math.random seeded per match: two
//     runs agree and match the stored baseline; the first three rivals still fall at 0.80, 0.95 and 1.15 cells a second.
// node p4_gate.mjs [pageFile] [outDir] [noShots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/';
const PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p4', SHOTS = !process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 700)); } }
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
/* the stored baseline of the fixed seed suite (v1.12): [stage, seed, result, player score, rival score, sim ms] */
const BASE = [[0,1,"win",4340,140,21984],[0,2,"win",3680,0,21744],[0,3,"win",3980,0,18128],[0,4,"win",4520,280,18928],[0,5,"win",6500,0,21552],[0,6,"win",5040,1180,23440],[1,1,"win",4040,100,18800],[1,2,"win",3940,140,25120],[1,3,"win",3520,0,15488],[1,4,"win",4000,40,17216],[1,5,"win",4930,140,23488],[1,6,"win",3720,40,19040],[2,1,"win",3200,0,17952],[2,2,"win",3680,100,18928],[2,3,"win",3040,40,12528],[2,4,"win",4920,180,18688],[2,5,"win",1670,0,13456],[2,6,"win",5020,180,19136]];
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h, pre) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((pre) => { try { if (sessionStorage.getItem('gate_keep')) return; sessionStorage.setItem('gate_keep', '1'); localStorage.setItem('lwfb_explained', '1'); localStorage.removeItem('cw_prog'); if (pre) localStorage.setItem('cw_set', pre); else localStorage.removeItem('cw_set'); } catch (e) {} }, pre || null);
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
  const cdp = await p.target().createCDPSession();
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  return { p, errs, T }; }
const until = async (p, fn, arg, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 9000)) { if (await p.evaluate(fn, arg)) return true; await sleep(100); } return false; };
const toFight = p => until(p, () => window.CW_DEV.match().phase === 'fight');
/* every fillText for a while: just its text */
const spy = (p, ms) => p.evaluate(async (ms) => { const c2 = document.getElementById('game').getContext('2d'), orig = c2.fillText, seen = [];
  c2.fillText = function (t) { seen.push(String(t)); return orig.apply(this, arguments); }; await new Promise(r => setTimeout(r, ms)); c2.fillText = orig; return [...new Set(seen)]; }, ms);
/* the July yardstick (cadence 430 ms, 15 percent blunders) on a fixed seed, Math.random seeded per match */
const suite = (p, stages, seeds, pending) => p.evaluate((stages, seeds, pending) => { const D = window.CW_DEV, out = [];
  const seeded = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const s0 = D.start; if (pending) D.start = function (a, c) { const r = s0.call(this, a, c); D.match().pf.pending = pending; return r; };   /* Chaff already on its way */
  try { for (const st of stages) for (const sd of seeds) { const keep = Math.random; Math.random = seeded(sd * 7919 + st); let m; try { m = D.playMatch(st, sd, { cadence: 430, pBlunder: 0.15, maxMs: 80000 }); } finally { Math.random = keep; }
      out.push([st, sd, m.result, m.pf, m.of, m.ms]); } } finally { D.start = s0; }
  return out; }, stages, seeds, pending || 0);
try {
  await sleep(500);
  console.log('[A] records');
  { const o = await open(412, 915, JSON.stringify({ relaxed: true, flick: true }));
    await o.p.evaluate(() => window.CW_DEV.beginStage(0)); await toFight(o.p);
    await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.score = 2468; M.of.dead = true; M.judge = { of: true }; });
    await until(o.p, () => !!window.CW_DEV.prog().recs['aphid-swarm'], null, 9000); const rec = await o.p.evaluate(() => window.CW_DEV.prog().recs['aphid-swarm'] || null);
    ok('a won stage writes its record: rules standard, the input profile from the settings (relaxed, flick), the stage\'s fall and q, the build', !!rec && rec.rules === 'standard' && rec.input && rec.input.rep === 'relaxed' && rec.input.flick === true && rec.input.mirror === false && rec.diff && rec.diff.stage === 'aphid-swarm' && rec.diff.fall === 0.8 && rec.diff.q === 0.08 && rec.v === 'v1.12' && rec.score === 2468, JSON.stringify(rec));
    /* Solo from the title by a real touch, then a best */
    await o.p.evaluate(() => { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); document.getElementById('s-title').classList.add('on'); });
    await sleep(150); const xy = await o.p.evaluate(() => { const e = document.getElementById('b-solo'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await o.T('touchStart', [[xy[0], xy[1], 71]]); await sleep(40); await o.T('touchEnd', [[xy[0], xy[1], 71]]);
    const solo = await until(o.p, () => window.CW_DEV.match().mode === 'solo' && window.CW_DEV.match().phase === 'fight', null, 9000);
    await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.score = 4321; M.pf.dead = true; M.judge = { pf: true }; });
    await until(o.p, () => !!window.CW_DEV.prog().recs.solo, null, 9000); const rs = await o.p.evaluate(() => { const P = window.CW_DEV.prog(); return { rec: P.recs.solo || null, best: P.soloBest }; });
    ok('a solo best writes its record: the score, rules standard, the input profile, the mode', solo && !!rs.rec && rs.best === 4321 && rs.rec.score === 4321 && rs.rec.rules === 'standard' && rs.rec.input.rep === 'relaxed' && rs.rec.diff && rs.rec.diff.mode === 'solo', JSON.stringify({ solo, rs }));
    ok('records: no page errors', o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  console.log('[B] the first three rivals are lessons');
  { const o = await open(412, 915); const L = await o.p.evaluate(() => [0, 1, 2, 3].map(i => window.CW_DEV.lesson(i)));
    const W = await o.p.evaluate(() => [0, 1, 2, 3].map(i => window.CW_DEV.words(i)));
    const piece = t => t.length > 3;
    const sawLesson = (seen, i) => seen.some(t => piece(t) && L[i] && L[i].t.indexOf(t) >= 0), sawTaunt = (seen, i) => seen.some(t => piece(t) && ('"' + W[i].taunt + '"').indexOf(t) >= 0 && W[i].taunt.indexOf(t.replace(/"/g, '')) >= 0);
    const intro = []; for (let i = 0; i < 4; i++) { await o.p.evaluate(k => window.CW_DEV.intro(k), i); await sleep(120); intro.push(await spy(o.p, 160)); if (SHOTS && i === 1) await o.p.screenshot({ path: `${OUT}/intro-lesson-412.png` }); }
    ok('a fresh player sees the lesson on stage 1, 2 and 3\'s intro card under STAGE n · LESSON, never the taunt', [0, 1, 2].every(i => !!L[i] && sawLesson(intro[i], i) && !sawTaunt(intro[i], i) && intro[i].includes('STAGE ' + (i + 1) + ' · LESSON')), JSON.stringify([0, 1, 2].map(i => ({ lesson: !!L[i], saw: sawLesson(intro[i], i), taunt: sawTaunt(intro[i], i), tag: intro[i].filter(t => /^STAGE/.test(t)) }))));
    ok('stage 4 is no lesson: its intro card keeps the taunt and the plain tag', !L[3] && sawTaunt(intro[3], 3) && intro[3].includes('STAGE 4'), JSON.stringify({ l3: L[3], tags: intro[3].filter(t => /^STAGE/.test(t)) }));
    await o.p.evaluate(() => window.CW_DEV.beginStage(0)); await until(o.p, () => window.CW_DEV.match().phase === 'count', null, 9000); const cnt = await spy(o.p, 300);
    ok('the count before stage 1 shows the lesson too', sawLesson(cnt, 0) && !sawTaunt(cnt, 0), JSON.stringify(cnt.slice(0, 8)));
    await toFight(o.p); await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.dead = true; M.judge = { pf: true }; });
    await until(o.p, () => /^Try this|^"/.test(document.getElementById('go-line').textContent) && document.getElementById('s-go').classList.contains('on'), null, 12000);
    const tip = await o.p.evaluate(() => document.getElementById('go-line').textContent);
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/result-lesson-412.png` });
    ok('a loss to stage 1 while the lesson is still to learn says Try this and the lesson (Again replays it)', tip === 'Try this: ' + L[0].t, JSON.stringify(tip));
    await sleep(1200); const paint = await o.p.evaluate(() => { const g = id => { const cs = getComputedStyle(document.getElementById(id)); return { pos: cs.position, z: cs.zIndex, sh: cs.textShadow }; }; return { lab: g('go-lab'), line: g('go-line'), banner: g('go-banner') }; });
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/result-lesson-412-settled.png` });
    ok('the pest\'s name and the tip paint above the banner art (positioned, z 1 over its z 0) with a dark halo on the bright wall', ['lab', 'line'].every(k => paint[k].pos !== 'static' && +paint[k].z >= 1 && paint[k].sh !== 'none') && paint.banner.pos === 'absolute' && +paint.banner.z === 0, JSON.stringify(paint));
    /* the player's own skills: the yardstick's pops and chains on stages 1 to 3, and a real cancel: three pods on the
       floor, a pair of their colour beside them, Chaff on its way, the DROP button touched (a five pod pop = 100 points = 1 Chaff) */
    const before = await o.p.evaluate(() => window.CW_DEV.prog().lessons); await suite(o.p, [0, 1, 2], [1]); const mid = await o.p.evaluate(() => window.CW_DEV.prog().lessons);
    await o.p.evaluate(() => window.CW_DEV.beginStage(2)); await toFight(o.p);
    await o.p.evaluate(() => { const M = window.CW_DEV.match(), f = M.pf; f.gravMs = 1e9; M.of.react = 1e9; for (let r = 0; r < f.grid.length; r++) for (let c = 0; c < f.grid[r].length; c++) f.grid[r][c] = 0;
      const B = f.grid.length - 1; f.grid[B][0] = f.grid[B][1] = f.grid[B][2] = 1; f.cur.c = 3; f.cur.rot = 0; f.cur.c1 = 1; f.cur.c2 = 1; f.pending = 6; f.carry = 0; });
    const dxy = await o.p.evaluate(() => { const r = document.getElementById('dropbtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await o.T('touchStart', [[dxy[0], dxy[1], 81]]); await sleep(60); await o.T('touchEnd', [[dxy[0], dxy[1], 81]]);
    await until(o.p, () => !!window.CW_DEV.prog().lessons.cancel, null, 5000); const after = await o.p.evaluate(() => ({ L: window.CW_DEV.prog().lessons, n: window.CW_DEV.match().pf.cancelN, pend: window.CW_DEV.match().pf.pending }));
    ok('the player\'s own pop, chain and cancel each mark their lesson (the cancel from a real DROP onto a five pod group with Chaff coming)', Object.keys(before).length === 0 && mid.pop === true && mid.chain === true && !mid.cancel && after.L.cancel === true && after.n >= 1, JSON.stringify({ before, mid, after }));
    const back = []; for (let i = 0; i < 3; i++) { await o.p.evaluate(k => window.CW_DEV.intro(k), i); await sleep(120); back.push(await spy(o.p, 160)); }
    const L2 = await o.p.evaluate(() => [0, 1, 2].map(i => window.CW_DEV.lesson(i)));
    ok('once shown, the lessons stop: the three intro cards show the pests\' taunts and the plain tag again', L2.every(x => x === null) && [0, 1, 2].every(i => sawTaunt(back[i], i) && !sawLesson(back[i], i) && back[i].includes('STAGE ' + (i + 1))), JSON.stringify({ L2, tags: back.map(s => s.filter(t => /^STAGE/.test(t))) }));
    await o.p.evaluate(() => window.CW_DEV.beginStage(0)); await toFight(o.p); await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.dead = true; M.judge = { pf: true }; });
    await until(o.p, () => document.getElementById('s-go').classList.contains('on') && /^"/.test(document.getElementById('go-line').textContent), null, 12000);
    const tip2 = await o.p.evaluate(() => document.getElementById('go-line').textContent);
    await o.p.reload({ waitUntil: 'domcontentloaded' }); await o.p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
    const kept = await o.p.evaluate(() => ({ lessons: window.CW_DEV.prog().lessons, l0: window.CW_DEV.lesson(0) }));
    ok('and a loss after that shows the pest\'s line, and the lessons stay learned after a reload', tip2 === '"' + W[0].taunt + '"' && kept.l0 === null && kept.lessons.pop && kept.lessons.chain && kept.lessons.cancel, JSON.stringify({ tip2, kept }));
    ok('lessons: no page errors', o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  { const o = await open(375, 548, JSON.stringify({ bigText: true })); const res = [];
    for (let i = 0; i < 3; i++) { await o.p.evaluate(k => window.CW_DEV.intro(k), i); await sleep(120);
      const y = await o.p.evaluate(async () => { const c2 = document.getElementById('game').getContext('2d'), orig = c2.fillText; let hy = null;
        c2.fillText = function (t, x, yy) { if (String(t) === 'tap to start') hy = c2.getTransform().d * yy + c2.getTransform().f; return orig.apply(this, arguments); };
        await new Promise(r => setTimeout(r, 160)); c2.fillText = orig; return hy; }); res.push(y); }
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/intro-lesson-375x548-bigtext.png` });
    ok('on an iPhone SE in Safari with Larger text each lesson leaves the intro\'s hint above the tray (y 832 or less)', res.every(y => y != null && y <= 832), JSON.stringify(res));
    await o.p.close(); }
  console.log('[C] the regression suite');
  { const o = await open(412, 915); const r1 = await suite(o.p, [0, 1, 2], [1, 2, 3, 4, 5, 6]), r2 = await suite(o.p, [0, 1, 2], [1, 2, 3, 4, 5, 6]);
    const falls = await o.p.evaluate(() => window.CW_DEV.roster().slice(0, 3).map(s => s.fall));
    if (!BASE) console.log('BASE (paste into the gate): ' + JSON.stringify(r1));
    ok('the fixed seed suite (stages 1 to 3, seeds 1 to 6, the July yardstick, Math.random seeded) reproduces: two runs agree', JSON.stringify(r1) === JSON.stringify(r2) && r1.length === 18, JSON.stringify({ r1: r1.slice(0, 3), r2: r2.slice(0, 3) }));
    ok('the fixed seed suite matches its stored baseline (a change to the first three rivals or the engine shows here)', !!BASE && JSON.stringify(r1) === JSON.stringify(BASE), JSON.stringify(r1.filter((x, i) => !BASE || JSON.stringify(x) !== JSON.stringify(BASE[i])).slice(0, 4)));
    ok('the first three rivals keep their speeds: 0.80, 0.95 and 1.15 cells a second', JSON.stringify(falls) === JSON.stringify([0.8, 0.95, 1.15]), JSON.stringify(falls));
    ok('suite: no page errors', o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p4: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
