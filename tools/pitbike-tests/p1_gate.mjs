// Pit Bike Rally Part 1 gate (v1.9): the analog throttle, driven with REAL touch events (CDP Input.dispatchTouchEvent,
// never el.click()). Landscape 915 x 412 at DPR 2 (and 800 x 360 for the layout and the thumb shot).
//  pull 20 px: throttle 0.15..0.35; pull 56 px: throttle 1; a slow push up held 200 ms: brake > 0.5, no nitro;
//  a flick up from the gas: nitro once, brake 0 on every frame, the gas back where the thumb settles; the left NITRO
//  while the right thumb holds full gas (two touches at once): nitro, gas still 1; lift both: throttle 0;
//  Classic: the GAS button still gives full gas; an older save is offered the card once and keeps Classic;
//  every control 48 CSS px or more after layout; thumb shots with a drawn thumb.
// node p1_gate.mjs [gameDir] [outDir] [only]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = process.argv[2] || '/workspaces/skywolf-pitbike-rally', OUT = process.argv[3] || '/tmp/claude-1000/pb/p1', SHOTS = !process.argv[4];
const PORT = 8790 + Math.floor(Math.random() * 100);
const sleep = t => new Promise(r => setTimeout(r, t));
require('fs').mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 600)); } }
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h, save) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(s => { if (!sessionStorage.getItem('fixed')) { localStorage.clear(); if (s) localStorage.setItem('skywolf.pitbikerally.save.v1', s); sessionStorage.setItem('fixed', '1'); } }, save || null);
  await p.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.__PBR && window.__PBR.S && window.__PBR.S.G && window.__PBR.S.currentScreen === 'menu' && document.getElementById('menu-stats').textContent.length > 0 /* boot ran setScreen('menu') */, { timeout: 60000 });
  const cdp = await p.target().createCDPSession();
  return { p, errs, cdp };
}
const T = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 9, radiusY: 9, force: 1 })) });
/* moves one frame apart (17 ms) without waiting on each round trip: every point arrives as its own touchmove (Chrome
   merges moves inside one frame, and an awaited CDP call costs ~50 ms here, which reads as a slow thumb) */
const burst = (cdp, id, x, ys, y0) => Promise.all(ys.map((d, i) => new Promise(res => setTimeout(() => res(T(cdp, 'touchMove', [[x, y0 + d, id]])), 17 * i))));
const race = p => p.evaluate(async () => { const H = window.__PBR, S = H.S; H.startRace(0, 0, { tt: true, quick: true }); H.setScreen('race');
  const t0 = performance.now(); while (!S.race.started && performance.now() - t0 < 8000) await new Promise(r => setTimeout(r, 50));
  S.bikes[0].nitro = 3; return S.race.started; });
const bike = p => p.evaluate(() => { const b = window.__PBR.S.bikes[0]; return { th: b.throttle, br: b.brake, n: b.nitro, nT: b.nitroT }; });
async function watch(p, ms) {   // every frame for ms: the max brake and the bike's nitro count
  return p.evaluate(ms => new Promise(res => { const b = window.__PBR.S.bikes[0]; let mb = 0, mn = b.nitro; const t0 = performance.now();
    (function f() { mb = Math.max(mb, b.brake); mn = Math.min(mn, b.nitro); if (performance.now() - t0 < ms) requestAnimationFrame(f); else res({ maxBrake: mb, minNitro: mn, th: b.throttle }); })(); }), ms);
}
try {
  await sleep(600);
  // ---------------------------------------------------------------- analog, a fresh save
  console.log('[1] the stick under the right thumb (a fresh save starts on Analog)');
  { const { p, errs, cdp } = await open(915, 412);
    const ctl = await p.evaluate(() => ({ ctl: window.__PBR.S.G.ctl, cls: document.body.classList.contains('ctl-analog'), card: document.getElementById('ctl-card').classList.contains('show') }));
    ok('a fresh save is on Analog and is not offered the card', ctl.ctl === 'analog' && ctl.cls && !ctl.card, JSON.stringify(ctl));
    ok('the race starts', await race(p), 'no start');
    const X = 700, Y = 220;
    await T(cdp, 'touchStart', [[X, Y, 1]]); await sleep(60);
    for (let d = 5; d <= 20; d += 5) { await T(cdp, 'touchMove', [[X, Y + d, 1]]); await sleep(16); }
    await sleep(120); const a20 = await bike(p);
    ok('a 20 px pull reads a throttle between 0.15 and 0.35', a20.th >= 0.15 && a20.th <= 0.35 && a20.br === 0, JSON.stringify(a20));
    for (let d = 25; d <= 56; d += 8) { await T(cdp, 'touchMove', [[X, Y + d, 1]]); await sleep(16); }
    await T(cdp, 'touchMove', [[X, Y + 56, 1]]); await sleep(120); const a56 = await bike(p);
    ok('a 56 px pull reads full throttle', a56.th === 1, JSON.stringify(a56));
    // a flick up from the gas and back: nitro once, no brake on any frame, the gas where the thumb settles
    for (const d of [52, 48, 44, 40]) { await T(cdp, 'touchMove', [[X, Y + d, 1]]); await sleep(80); }   /* a slow drift up the gas side first */
    await sleep(200);
    const n0 = (await bike(p)).n, w = watch(p, 700);
    /* a quick thumb flick: 80 px up as fast as the events go (no sleeps: on a loaded box sleeps stretch a flick into a
       push), then back down to the gas; the page's own sample times are reported */
    await p.evaluate(() => { window.__flk = performance.now(); });
    await Promise.all([20, 0, -20, -40, -20].map(d => T(cdp, 'touchMove', [[X, Y + d, 1]])));   /* up and the turn, back to back: a real thumb turns within a frame */
    for (const d of [0, 20, 40]) { await T(cdp, 'touchMove', [[X, Y + d, 1]]); await sleep(16); }
    const fw = await w; await sleep(100); const af = await bike(p);
    const seen = await p.evaluate(async () => { const m = await import(document.querySelector('script[type=module]').src.replace(/main\.js.*$/, 'input.js'));   /* src/ upstream, src-<hash>/ vendored */ return { flicks: m.thrState.flicks, smp: m.thrState.smp.filter(q => q.t * 1000 >= window.__flk - 5).map(q => Math.round(q.t * 1000 - window.__flk) + 'ms:' + Math.round(q.y)) }; });
    ok('a flick up from the gas fires nitro once and never brakes', af.n === n0 - 1 && af.nT > 0 && fw.maxBrake === 0, JSON.stringify({ n0, af, fw, seen }));
    ok('after the flick the gas is back where the thumb settled (40 px)', Math.abs(af.th - Math.pow((40 - 8) / 48, 1.2)) < 0.02, JSON.stringify(af));
    // a slow push up held 200 ms: the brake, and no nitro
    await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
    const n1 = (await bike(p)).n;
    for (let d = 40; d >= -40; d -= 5) { await T(cdp, 'touchMove', [[X, Y + d, 1]]); await sleep(20); }
    await sleep(200); const ab = await bike(p);
    ok('a slow push up held 200 ms brakes above 0.5 and fires no nitro', ab.br > 0.5 && ab.th === 0 && ab.n === n1, JSON.stringify({ n1, ab }));
    await T(cdp, 'touchEnd', [[X, Y - 40, 1]]); await sleep(120); const a0 = await bike(p);
    ok('lifting the thumb: no gas, no brake', a0.th === 0 && a0.br === 0, JSON.stringify(a0));
    /* the review's misfires (v1.9 rebuild): fast moves that STAY are a brake or a coast, never nitro */
    const gesture = async (from, moves, holdMs) => { await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
      await T(cdp, 'touchStart', [[X, Y, 5]]); await sleep(40); for (let d = 10; d <= from; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 5]]); await sleep(16); }
      await sleep(150); const nA = (await bike(p)).n; const w = watch(p, holdMs + 200);
      await Promise.all(moves.map(d => T(cdp, 'touchMove', [[X, Y + d, 5]]))); await sleep(holdMs);
      const mid = await bike(p), fw = await w; await T(cdp, 'touchEnd', []); await sleep(100); return { nA, mid, fw }; };
    const hb = await gesture(40, [20, 0, -20, -45], 260);
    ok('a fast move from gas to brake that is HELD brakes and never fires nitro (the review: it fired nitro and locked the brake out)', hb.mid.n === hb.nA && hb.mid.br > 0.5 && hb.mid.th === 0, JSON.stringify(hb));
    const lc = await gesture(56, [40, 20, 0], 250);
    ok('a quick lift from full gas to the middle coasts and never fires nitro', lc.mid.n === lc.nA && lc.mid.th === 0 && lc.mid.br === 0, JSON.stringify(lc));
    /* the re-review's cases: a hard brake whose thumb relaxes, a brake dab that rests at its top, the lightest brake */
    const twoPhase = async (from, fast, slow, holdMs) => { await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
      await T(cdp, 'touchStart', [[X, Y, 5]]); await sleep(40); for (let d = 10; d <= from; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 5]]); await sleep(16); }
      await sleep(150); const nA = (await bike(p)).n; const w = watch(p, holdMs + 400);
      await Promise.all(fast.map(d => T(cdp, 'touchMove', [[X, Y + d, 5]])));
      for (const [d, ms] of slow) { await sleep(ms); await T(cdp, 'touchMove', [[X, Y + d, 5]]); }
      await sleep(holdMs); const mid = await bike(p), fw = await w; await T(cdp, 'touchEnd', []); await sleep(100); return { nA, mid, fw }; };
    const rx = await twoPhase(56, [20, -20, -60, -75], [[-70, 30], [-65, 30], [-60, 30], [-57, 30]], 300);
    ok('a hard brake whose thumb relaxes 18 px while still braking fires no nitro (the re-review: 116 of 400 did)', rx.mid.n === rx.nA && rx.mid.br > 0.5, JSON.stringify(rx));
    const dab = await twoPhase(40, [20, 0, -20, -45], [[-45, 150], [-20, 30], [10, 30], [40, 30]], 150);
    ok('a brake dab that rests 150 ms at the top brakes and fires no nitro', dab.mid.n === dab.nA && dab.fw.maxBrake > 0.3, JSON.stringify(dab));
    { const fsm = require('fs'), srcDir = fsm.existsSync(DIR + '/src/physics.js') ? DIR + '/src' : DIR + '/' + fsm.readFileSync(DIR + '/index.html', 'utf8').match(/(src-[a-z0-9]+)\/main\.js/)[1];
      const phys = fsm.readFileSync(srcDir + '/physics.js', 'utf8');   /* the deceleration constants, read from the game's own physics file */
      const kB = +phys.match(/b\.speed - (\d+) \* \(1 \+ \(st\.brake/)[1], kC = +phys.match(/b\.speed = Math\.max\(0, b\.speed - (\d+) \* dt\)/)[1];
      await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; }); await T(cdp, 'touchStart', [[X, Y, 9]]); await sleep(40);
      for (const d of [-4, -8, -11]) { await T(cdp, 'touchMove', [[X, Y + d, 9]]); await sleep(40); } await sleep(260);
      const lb = await bike(p); await T(cdp, 'touchEnd', []); await sleep(80);
      ok(`the lightest brake (11 px up) slows at least as hard as letting go: brake x ${kB} >= the ${kC} coast (physics.js)`, lb.br > 0 && lb.br * kB >= kC - 0.5, JSON.stringify({ lb, kB, kC })); }
    const wg = await (async () => { await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
      await T(cdp, 'touchStart', [[X, Y, 5]]); await sleep(40); for (let d = 10; d <= 90; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 5]]); await sleep(16); }
      await sleep(150); const nA = (await bike(p)).n; const w = watch(p, 500);
      await burst(cdp, 5, X, [60, 30, 40, 50], Y); await sleep(200);   /* fast up, the turn at once, back down: all on the gas side */
      const mid = await bike(p), fw = await w; await T(cdp, 'touchEnd', []); await sleep(100); return { nA, mid, fw }; })();
    ok('a fast wiggle that stays on the gas side (90, 30, back to 50) never fires nitro', wg.mid.n === wg.nA && wg.mid.th > 0.4 && wg.mid.br === 0, JSON.stringify(wg));
    const os9 = await (async () => { await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
      await T(cdp, 'touchStart', [[X, Y, 5]]); await sleep(40); for (let d = 10; d <= 50; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 5]]); await sleep(16); }
      await sleep(150); const nA = (await bike(p)).n; await burst(cdp, 5, X, [30, 10, -9, -5], Y); await sleep(250);
      const mid = await bike(p); await T(cdp, 'touchEnd', []); await sleep(100); return { nA, mid }; })();
    ok('a quick lift that overshoots the middle by 9 px and settles back 4 px coasts and never fires nitro', os9.mid.n === os9.nA, JSON.stringify(os9));
    const ov = await gesture(80, [60, 40, 30], 250);
    ok('easing a fast overshoot back to half gas never fires nitro', ov.mid.n === ov.nA && ov.mid.th > 0.2 && ov.mid.br === 0, JSON.stringify(ov));
    { await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; }); await T(cdp, 'touchStart', [[X, Y, 6]]); await sleep(40);
      for (let d = 10; d <= 40; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 6]]); await sleep(16); } await sleep(150);
      const nA = (await bike(p)).n; await Promise.all([20, 0, -20, -40, -32].map(d => T(cdp, 'touchMove', [[X, Y + d, 6]])));   /* up, and the turn at once */
      for (const d of [-22, -12, -4, 6, 20, 40]) { await sleep(45); await T(cdp, 'touchMove', [[X, Y + d, 6]]); }   /* then a slow, gentle way back */
      await sleep(80); const fr = await bike(p); await T(cdp, 'touchEnd', []); await sleep(80);
      ok('a flick followed by a slow return still fires nitro, once (the review: it braked instead)', fr.n === nA - 1, JSON.stringify({ nA, fr })); }
    /* a thumb landing low: the full pull fits above the bottom edge */
    { const H = await p.evaluate(() => innerHeight); await T(cdp, 'touchStart', [[X, H - 40, 7]]); await sleep(60);
      for (const y of [H - 30, H - 20, H - 10, H - 2]) { await T(cdp, 'touchMove', [[X, y, 7]]); await sleep(16); } await sleep(120);
      const lo = await bike(p); await T(cdp, 'touchEnd', []); await sleep(80);
      ok('a thumb landing 40 px over the bottom edge still reaches full gas at the edge (the review: capped at 0.62)', lo.th >= 0.99, JSON.stringify(lo)); }
    /* no nitro while paused: the right thumb stays on the stick, another finger taps pause, then the stick thumb flicks (a
       touch's moves keep going to the element it started on, under the pause card) */
    { const pb = await p.evaluate(() => { const r = document.getElementById('btn-pause').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
      await T(cdp, 'touchStart', [[X, Y, 10]]); await sleep(40); for (let d = 10; d <= 40; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 10]]); await sleep(16); }
      /* Chrome makes no click from a second finger's tap while another finger is down, so pause the way the II button does */
      await p.evaluate(() => { window.__PBR.S.paused = true; document.getElementById('pause-ov').classList.add('show'); }); await sleep(200);
      const paused = await p.evaluate(() => window.__PBR.S.paused), nP = (await bike(p)).n;
      await Promise.all([20, 0, -20, -40, -20].map(d => T(cdp, 'touchMove', [[X, Y + d, 10]])));
      for (const d of [0, 20, 40]) { await T(cdp, 'touchMove', [[X, Y + d, 10]]); await sleep(20); } await sleep(120);
      const nQ = (await bike(p)).n; await T(cdp, 'touchEnd', []); await sleep(80);
      ok('a flick while the race is paused (the thumb kept on the stick under the pause card) fires no nitro', paused === true && nQ === nP, JSON.stringify({ paused, nP, nQ }));
      await p.evaluate(() => { const S = window.__PBR.S; S.paused = false; document.getElementById('pause-ov').classList.remove('show'); }); }
    // the left NITRO while the right thumb holds full gas: two touches at once
    await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitroT = 0; b.nitro = 3; });
    await T(cdp, 'touchStart', [[X, Y, 2]]); await sleep(40);
    for (let d = 10; d <= 60; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 2]]); await sleep(16); }
    await sleep(100);
    const nb = await p.evaluate(() => { const r = document.getElementById('btn-nitro-l').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; });
    const n2 = (await bike(p)).n;
    await T(cdp, 'touchStart', [[X, Y + 60, 2], [nb.x, nb.y, 3]]); await sleep(90); const mid = await bike(p);
    await T(cdp, 'touchMove', [[X, Y + 60, 2]]); await sleep(90); const aft = await bike(p);   /* the left thumb lifts (a touchEnd lifts every finger) */
    ok('the left NITRO fires while the right thumb keeps full gas', mid.n === n2 - 1 && mid.th === 1 && aft.th === 1, JSON.stringify({ n2, mid, aft }));
    await T(cdp, 'touchEnd', []); await sleep(120); const ae = await bike(p);
    ok('lifting both: throttle 0', ae.th === 0 && ae.br === 0, JSON.stringify(ae));
    ok('no page errors (analog)', errs.length === 0, JSON.stringify(errs));
    await p.close(); }
  // ---------------------------------------------------------------- an older save keeps Classic and is offered the card once
  console.log('[2] an older save: Classic, the card once, the GAS button still works');
  { const OLD = JSON.stringify({ v: 2, wallet: 900, owned: ['eng0'], equipped: { engine: 'eng0' }, ownedColors: ['red'], color: 'red', best: {}, medals: {}, wear: {}, ghosts: {}, tt: {}, career: null, trophies: {}, wins: 1, races: 3, earnings: 900 });
    const { p, errs, cdp } = await open(915, 412, OLD);
    const st = await p.evaluate(() => ({ ctl: window.__PBR.S.G.ctl, ask: window.__PBR.S.G.ctlAsk, card: document.getElementById('ctl-card').classList.contains('show') }));
    ok('a save from before v1.9 keeps Classic and shows the card', st.ctl === 'classic' && st.ask === true && st.card, JSON.stringify(st));
    const kb = await p.evaluate(() => { const r = document.getElementById('ctl-keep').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
    await T(cdp, 'touchStart', [[kb.x, kb.y, 1]]); await sleep(60); await T(cdp, 'touchEnd', []); await sleep(300);
    const st2 = await p.evaluate(() => ({ ctl: window.__PBR.S.G.ctl, ask: window.__PBR.S.G.ctlAsk, card: document.getElementById('ctl-card').classList.contains('show'), disk: JSON.parse(localStorage.getItem('skywolf.pitbikerally.save.v1')) }));
    ok('KEEP THE BUTTONS (a real tap): Classic kept, the card gone and remembered', st2.ctl === 'classic' && !st2.ask && !st2.card && st2.disk.ctl === 'classic' && st2.disk.ctlAsk === false, JSON.stringify({ ctl: st2.ctl, ask: st2.ask, card: st2.card }));
    ok('the race starts', await race(p), 'no start');
    const g = await p.evaluate(() => { const r = document.getElementById('btn-gas').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
    await T(cdp, 'touchStart', [[g.x, g.y, 1]]); await sleep(150); const cg = await bike(p);
    await T(cdp, 'touchEnd', []); await sleep(120); const cg0 = await bike(p);
    ok('Classic: holding GAS is full throttle, letting go is none', g.w >= 48 && cg.th === 1 && cg0.th === 0, JSON.stringify({ g, cg, cg0 }));
    ok('no page errors (classic)', errs.length === 0, JSON.stringify(errs));
    await p.close(); }
  // ---------------------------------------------------------------- layout and thumb shots at 412 and 360 tall
  console.log('[3] 48 px targets and thumb shots');
  for (const [w, h] of [[915, 412], [800, 360], [740, 360], [667, 375]]) {
    const { p, errs, cdp } = await open(w, h); await race(p);
    await p.evaluate(() => { const b = window.__PBR.S.bikes[0]; b.nitro = 6; }); await sleep(200);   /* the most pips a rider can hold */
    const L = await p.evaluate(() => { const out = {}; for (const id of ['btn-nitro-l', 'btn-pause', 'thr-zone', 'joy-zone']) { const r = document.getElementById(id).getBoundingClientRect(); out[id] = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }
      const pr = document.getElementById('btn-pause').getBoundingClientRect(), tz = document.getElementById('thr-zone').getBoundingClientRect(), nl = document.getElementById('btn-nitro-l').getBoundingClientRect(), jz = document.getElementById('joy-zone').getBoundingClientRect();
      out.thrUnderPause = tz.top >= pr.bottom - 1; out.joyUnderNitro = jz.top >= nl.bottom - 1;
      /* nothing in the top HUD row may sit on the left NITRO, its pips, restart or pause */
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const keep = ['btn-nitro-l', 'nitro-pips', 'btn-restart', 'btn-pause'].map(id => document.getElementById(id)).filter(e => e && getComputedStyle(e).display !== 'none').map(e => [e.id, e.getBoundingClientRect()]);
      out.over = []; for (const c of document.querySelectorAll('.hud-top .chip')) { if (getComputedStyle(c).display === 'none') continue; const cr = c.getBoundingClientRect(); for (const [id, r] of keep) if (hit(cr, r)) out.over.push(c.id + ' on ' + id); }
      return out; });
    ok(`${w}x${h}: the left NITRO and pause are 48 px or more; the stick zone starts under pause, the steer zone under NITRO`,
      L['btn-nitro-l'].w >= 48 && L['btn-nitro-l'].h >= 48 && L['btn-pause'].w >= 48 && L.thrUnderPause && L.joyUnderNitro, JSON.stringify(L));
    ok(`${w}x${h}: no top HUD chip sits on the left NITRO, its pips, restart or pause`, L.over.length === 0, JSON.stringify(L.over));
    if (SHOTS) {
      const X = Math.round(w * 0.78), Y = Math.round(h * 0.52);
      await T(cdp, 'touchStart', [[X, Y, 1]]); await sleep(40); for (let d = 10; d <= 40; d += 10) { await T(cdp, 'touchMove', [[X, Y + d, 1]]); await sleep(16); }
      const jx = Math.round(w * 0.2), jy = Math.round(h * 0.6); await T(cdp, 'touchStart', [[X, Y + 40, 1], [jx, jy, 2]]); await T(cdp, 'touchMove', [[X, Y + 40, 1], [jx + 30, jy, 2]]);
      await sleep(300);
      // draw the thumbs where the touches are (a shot of a control without the thumb lies about what it covers)
      await p.evaluate((pts) => { for (const [x, y] of pts) { const d = document.createElement('div'); d.className = 'gate-thumb';
        d.style.cssText = `position:fixed;left:${x - 26}px;top:${y - 34}px;width:52px;height:68px;border-radius:26px 26px 22px 22px;background:rgba(232,190,160,.72);border:2px solid rgba(120,80,60,.8);z-index:99;pointer-events:none`; document.body.appendChild(d); } },
        [[X, Y + 40], [jx + 30, jy]]);
      await p.screenshot({ path: `${OUT}/thumbs-${w}x${h}.png` });
      await T(cdp, 'touchEnd', []);
    }
    ok(`${w}x${h}: no page errors`, errs.length === 0, JSON.stringify(errs));
    await p.close();
  }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pitbike p1: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
