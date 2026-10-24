// Pop N Lock Part 1 gate (v1.8): Astra's art wired in (art/pnl2, cut by satellites/chaff-wars/tools/cut_art.py).
// [A] art.json lists every shipped file with its real size. [B] in the page: the loader asks for exactly the opponent's
// dance and reaction frames and releases the last opponent's on a new stage; on a fixture grid the joins are exactly the
// orthogonal same coloured pairs (never a diagonal, never Chaff); the rail plays the dance at chain 2, the hit, danger.
// [C] looks at 412 x 915, 375 x 812, 360 x 780, a greyscale board, a dance frame, a hit, danger.
// node p1_gate.mjs [pageFile] [outDir] [noShots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/', PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p1', SHOTS = !process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 500)); } }
console.log('[A] the contract');
const J = JSON.parse(fs.readFileSync(process.env.ARTJSON || DIR + 'art/pnl2/art.json', 'utf8'));   /* ARTJSON: a broken copy, for the fail watch */
{ const listed = Object.keys(J.files), onDisk = [];
  (function walk(d) { for (const f of fs.readdirSync(DIR + 'art/pnl2/' + d)) { const rel = (d ? d + '/' : '') + f; if (fs.statSync(DIR + 'art/pnl2/' + rel).isDirectory()) walk(rel); else if (rel !== 'art.json') onDisk.push(rel); } })('');
  const bad = listed.filter(k => !fs.existsSync(DIR + 'art/pnl2/' + k) || fs.statSync(DIR + 'art/pnl2/' + k).size !== J.files[k].bytes), extra = onDisk.filter(f => !J.files[f]);
  ok('art.json lists every shipped file with its real size, and nothing ships unlisted', bad.length === 0 && extra.length === 0 && listed.length === onDisk.length, JSON.stringify({ bad, extra, n: listed.length })); }
console.log('[B] the page');
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete' && window.CW_DEV.art2().j, { timeout: 60000 });
  return { p, errs }; }
async function stage(p, n) { await p.evaluate(n => window.CW_DEV.beginStage(n), n);
  for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
  await p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; if (M.of) M.of.gravMs = 1e9; }); }
const loaded = p => p.evaluate(async () => { for (let w = 0; w < 60; w++) { await new Promise(r => setTimeout(r, 100)); if (performance.getEntriesByType('resource').filter(e => /art\/pnl2\/(dance|react)\//.test(e.name)).length >= 8) return true; } return false; });
const asked = p => p.evaluate(() => [...new Set(performance.getEntriesByType('resource').map(e => e.name).filter(n => /art\/pnl2\/(dance|react)\//.test(n)).map(n => n.replace(/^.*art\/pnl2\//, '').replace(/\?.*$/, '')))]);
try {
  await sleep(500);
  const { p, errs } = await open(412, 915);
  await stage(p, 0); await loaded(p); await sleep(800);
  const a0 = await asked(p), live0 = (await p.evaluate(() => window.CW_DEV.art2())).live;
  const want0 = J.dance['aphid-swarm'].frames.concat(Object.values(J.react['aphid-swarm'])).sort();
  ok('stage 1 asks for exactly the Aphid Swarm\'s dance and reaction frames (8), nobody else\'s', JSON.stringify(a0.sort()) === JSON.stringify(want0) && live0 === 8, JSON.stringify({ a0, live0 }));
  await stage(p, 1); await sleep(1500);
  const a1 = await asked(p), s1 = await p.evaluate(() => window.CW_DEV.art2());
  const want1 = J.dance['gnat-king-cole'].frames.concat(Object.values(J.react['gnat-king-cole']));
  ok('stage 2 asks for the Gnat King Cole\'s frames and holds only those (the Aphid Swarm\'s released)', want1.every(f => a1.includes(f)) && s1.live === 8 && s1.who === 'gnat-king-cole', JSON.stringify({ live: s1.live, who: s1.who, n: a1.length }));
  // joins: a fixture grid (row 12 is the floor): same colour pairs across, down, diagonal, and a pair split by Chaff
  await stage(p, 0); await sleep(300);
  const jn = await p.evaluate(() => { const M = window.CW_DEV.match(), g = M.pf.grid, R = 13, C = 6; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) g[r][c] = 0;
    g[12][0] = 1; g[12][1] = 1;            // across: a join
    g[11][0] = 2; g[10][0] = 2;            // down: a join
    g[11][2] = 3; g[10][3] = 3;            // diagonal: none
    g[12][3] = 4; g[12][4] = 6; g[12][5] = 4;   // Chaff between two of a colour: none
    g[11][4] = 6; g[10][4] = 6;            // Chaff on Chaff: none
    M.pf.fall = null; M.pf.pop = null; M.pf.cur = null; return new Promise(r => setTimeout(() => r(window.CW_DEV.art2().joins), 300)); });
  const js = jn.map(j => j.join(',')).sort();
  ok('the joins are exactly the two orthogonal same coloured pairs: never a diagonal, never through or between Chaff', JSON.stringify(js) === JSON.stringify(['10,0,11,0', '12,0,12,1']), JSON.stringify(js));
  if (SHOTS) await p.screenshot({ path: OUT + '/joins.png' });
  // the rail: a chain of 2 dances, a hit shows for 180 ms, danger holds while the column is high
  await stage(p, 0); await sleep(300);   /* a fresh match after the fixture */
  // drive the rail through the page's own hooks (a real chain needs a real board): read the frame over time
  const dance = await p.evaluate(() => new Promise(res => { const D = window.CW_DEV, seen = []; const R = D.art2().rail;
    R.danceT = -9; R.hitT = -9; R.danger = false; const tStart = performance.now();
    /* a chain of 2 on the rival's board, through the hook resolveTick calls */
    D.railChain(2); setTimeout(() => D.railChainEnd(), 380);   /* a chain of 2 ends about 380 ms later; the loop still plays to its end */
    (function f() { const fr = D.art2().frame; seen.push(fr); if (performance.now() - tStart < 900) requestAnimationFrame(f); else res(seen); })(); }));
  const frames = [...new Set(dance.filter(Boolean))];
  ok('a chain of 2 on the rival\'s board plays its six dance frames, once, then back to the idle portrait', frames.length >= 5 && frames.every(f => /^dance\/aphid-swarm\//.test(f)) && dance[dance.length - 1] === null, JSON.stringify({ n: frames.length, last: dance[dance.length - 1] }));
  const hd = await p.evaluate(async () => { const D = window.CW_DEV; D.railHit(); const a = D.art2().frame; await new Promise(r => setTimeout(r, 300)); const b2 = D.art2().frame;
    const M = D.match(), g = M.of.grid; for (let r = 2; r < 13; r++) g[r][2] = 6; await new Promise(r => setTimeout(r, 300)); const c = D.art2().frame;
    for (let r = 0; r < 13; r++) g[r][2] = 0; await new Promise(r => setTimeout(r, 300)); const d = D.art2().frame; return { a, b: b2, c, d }; });
  ok('a hit shows the hit frame for 180 ms then returns; danger holds while the spawn column is 10 or more high and lets go at 8', hd.a === 'react/aphid-swarm/hit.webp' && hd.b === null && hd.c === 'react/aphid-swarm/danger.webp' && hd.d === null, JSON.stringify(hd));
  // the review's timeline: a chain of 5 with real spacing (383 ms a step) plays the loop ONCE, holds its last pose, never
  // flashes the idle portrait or replays, and lets go when the chain ends
  { await stage(p, 0); await p.evaluate(() => { window.CW_DEV.match().of.react = 1e9; });   /* the live rival's own chain ends would let go of the pose */
    for (let w = 0; w < 40; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().of.state === 'play')) break; }
    const tl = await p.evaluate(() => new Promise(res => { const D = window.CW_DEV, seen = [], t0 = performance.now(); let ended = false;
      D.art2().rail.hitT = -9; D.art2().rail.danger = false; D.railChain(1); D.railChain(2);
      [3, 4, 5].forEach((n, i) => setTimeout(() => D.railChain(n), 383 * (i + 1)));
      setTimeout(() => { D.railChainEnd(); ended = true; }, 1500);
      (function f() { const t = performance.now() - t0; seen.push([Math.round(t), D.art2().frame, ended]); if (t < 1800) requestAnimationFrame(f); else res(seen); })(); }));
    const during = tl.filter(v => !v[2]).map(v => v[1]), after = tl.filter(v => v[2]).slice(3).map(v => v[1]);
    const order = []; for (const fr of during) if (order[order.length - 1] !== fr) order.push(fr);
    const want = J.dance['aphid-swarm'].frames;
    ok('a chain of 5 plays the dance once (d1 to d6), holds the last pose to the chain\'s end with no idle flash or replay, then lets go', JSON.stringify(order) === JSON.stringify(want) && after.every(v => v === null) && after.length > 0, JSON.stringify({ order, after: after.slice(0, 3) })); }
  // the next window's backing, the HYPE meter beside the frame's neon line, the incoming rows above the frames, the
  // speaker corners at one scale (the canvas pixels and the draw calls)
  { await stage(p, 0); await sleep(300);
    const px = await p.evaluate(async () => { const M = window.CW_DEV.match(); M.pf.pending = 14; M.of.pending = 14; M.pf.hype = 0;
      const cv = document.getElementById('game'), c2 = cv.getContext('2d'), calls = [], orig = c2.drawImage;
      c2.drawImage = function (im) { const a = [].slice.call(arguments, 1); if (im && im.src) calls.push({ src: im.src.replace(/^.*art\/pnl2\//, '').replace(/\?.*$/, ''), a }); return orig.apply(this, arguments); };
      await new Promise(r => setTimeout(r, 250)); c2.drawImage = orig;
      const g = (x, y) => [].slice.call(c2.getImageData(x, y, 1, 1).data, 0, 3);
      const strip = y => { const d = c2.getImageData(366, y, 8, 1).data; let m = 0; for (let i = 0; i < 8; i++)m = Math.max(m, d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); return m; };   /* the line wiggles a pixel or two */
      return { next: g(404, 213), neon: [strip(150), strip(300), strip(600)], calls }; });
    const lum = c => Math.max(...c);
    const chaff = px.calls.filter(c => c.src === 'pods/chaff.webp' && c.a.length === 4 && c.a[2] < 16);
    const pl = chaff.filter(c => c.a[1] < 200), rv = chaff.filter(c => c.a[1] >= 200);
    const tl = px.calls.find(c => c.src === 'board/frame.webp' && c.a.length === 8 && c.a[0] === 0 && c.a[1] === 0);
    ok('the next window\'s opening is near black behind the pair (it showed the alley graffiti)', lum(px.next) < 45, JSON.stringify(px.next));
    ok('the painted frame\'s right neon line shows beside the HYPE meter at three heights (the meter covered it)', px.neon.every(v => v >= 90), JSON.stringify(px.neon));
    const nx = a => new Set(a.map(c => c.a[0].toFixed(1))).size;
    ok('the incoming Chaff rows sit above the frames (player under y 84 right of the score, rival under y 336)', nx(pl) === 10 && nx(rv) === 8 && pl.every(c => c.a[1] + c.a[3] <= 84 && c.a[0] >= 200 && c.a[0] + c.a[2] <= 380) && rv.every(c => c.a[1] + c.a[3] <= 336.5 && c.a[0] + c.a[2] <= 540),
      JSON.stringify({ pl: pl.slice(0, 2).map(c => c.a), rv: rv.slice(0, 2).map(c => c.a), n: [nx(pl), nx(rv)] }));
    ok('the frame\'s corner speaker draws at one scale (its 90 x 70 corner slice keeps its shape)', !!tl && tl.a[2] === 90 && tl.a[3] === 70 && Math.abs(tl.a[6] / tl.a[7] - 90 / 70) < 0.01, JSON.stringify(tl && tl.a)); }
  // memory: a new opponent leaves only its own July portraits (and the Keeper's); Solo holds no dance frames
  { await stage(p, 0); await sleep(400); await stage(p, 1); await sleep(400);
    const keys = (await p.evaluate(() => window.CW_DEV.cwKeys())).filter(k => /^char\//.test(k));
    ok('after stage 1 then stage 2 only the Gnat King Cole\'s July portraits stay decoded', keys.length > 0 && keys.every(k => /^char\/(gnat-king-cole|keeper)-/.test(k)), JSON.stringify(keys)); }
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
  if (SHOTS) {
    await p.evaluate(() => { window.CW_DEV.railChain(2); }); await sleep(250); await p.screenshot({ path: OUT + '/dance-mid.png' });
    await p.evaluate(() => { window.CW_DEV.railHit(); }); await sleep(40); await p.screenshot({ path: OUT + '/hit.png' });
    await p.evaluate(() => { const g = window.CW_DEV.match().of.grid; for (let r = 2; r < 13; r++) g[r][2] = 6; }); await sleep(300); await p.screenshot({ path: OUT + '/danger.png' });
    await p.emulateMediaFeatures([]); await p.evaluate(() => { document.getElementById('game').style.filter = 'grayscale(1)'; }); await sleep(200); await p.screenshot({ path: OUT + '/grey.png' });
  }
  await p.close();
  if (SHOTS) for (const [w, h] of [[375, 812], [360, 780]]) { const o = await open(w, h); await stage(o.p, 3); await sleep(1500); await o.p.screenshot({ path: `${OUT}/match-${w}x${h}.png` }); ok(`${w}x${h}: no page errors`, o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p1: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
