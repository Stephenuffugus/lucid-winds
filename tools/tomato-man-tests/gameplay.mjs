/* Tomato Man's real gameplay in numbers (6 Nov): THE SEED TOSS and SUN CRITTERS through the game's own update, clock held, no image opened.
 *   (cd /workspaces/Tomato_Man && python3 -m http.server 8778 >/dev/null 2>&1 &)     serve the clone first
 *   node tools/tomato-man-tests/gameplay.mjs [seed|critters|run|runbot|hero|planet|split]
 * Ends GAMEPLAY OK or GAMEPLAY FAILED. One browser at a time on this box. */
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const only = process.argv[2] || null;
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 120000 });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const TUT = ['move','shade','aloe','find','dash','seed','critter','mirage','shadeDrop','checkpoint','burn','hot','spf','cart','cloud','planet','wilt','ice','lunge','eclipse'];
const SEEN = JSON.stringify({ seenHowto: true, tut: Object.fromEntries(TUT.map(k => [k, true])) });
await page.evaluateOnNewDocument(s => { try { localStorage.setItem('tomatoman_save_v1', s); } catch (e) {} }, SEEN);
await page.goto('http://localhost:8778/?tmtest=1', { waitUntil: 'networkidle0', timeout: 90000 });
await new Promise(r => setTimeout(r, 900));
let bad = 0;
const say = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const ev = (fn, ...a) => page.evaluate(fn, ...a);
/* a helper in the page: an open sunny spot far from any shade at the sun's centre swing */
await ev(() => { window.__sunny = (R) => { const T = __TM, r = T._run(), L = r.L; for (let y = L.worldH - 200; y > 200; y -= 37) for (let x = 200; x < L.worldW - 200; x += 41) { let ok = true; for (let a = 0; a < 6.28 && ok; a += 0.5) { if (T.shadedGeom(x + Math.cos(a) * (R || 90), y + Math.sin(a) * (R || 90))) ok = false; } if (ok && !T.shadedGeom(x, y)) return { x, y }; } return null; }; });

/* a sunny point about d px from a critter whose straight line to it is in the light too, so it can charge */
await ev(() => { window.__sunNear = (c, d) => { const T = __TM; for (const k of [1, 0.85, 1.15, 0.7, 1.3]) for (let a = 0; a < 6.28; a += 0.26) { const x = c.x + Math.cos(a) * d * k, y = c.y + Math.sin(a) * d * k; let ok = true; for (let q = 1; q <= 12 && ok; q++) if (T.shadedGeom(c.x + (x - c.x) * q / 12, c.y + (y - c.y) * q / 12)) ok = false; if (ok) return { x, y }; } return { x: c.x + d, y: c.y }; }; });

if (!only || only === 'seed') {
  const a = await ev(() => { const T = __TM; T.hold(true); T.startLevel(0); T.seek(0.5); const r = T._run(), b = document.getElementById('bSeed').getBoundingClientRect(), d = document.getElementById('bDash').getBoundingClientRect(); return { seeds: r.seeds, txt: document.getElementById('cSeed').textContent, b: { l: b.left, r: b.right, t: b.top, bo: b.bottom, w: b.width }, d: { l: d.left, r: d.right, t: d.top, bo: d.bottom } }; });
  say(a.seeds === 3 && a.txt === '3', 'three seeds a level, the button says ' + a.txt);
  say(a.b.w >= 48 && a.b.l >= 206 && a.b.r <= a.d.l + 1 && a.b.bo > a.d.t && a.b.t < a.d.bo, 'SEED stands beside DASH, on the right half: x ' + a.b.l.toFixed(0) + ' to ' + a.b.r.toFixed(0) + ', DASH from ' + a.d.l.toFixed(0));
  const b = await ev(() => { const T = __TM, r = T._run(), s = window.__sunny(120); T.P.x = s.x; T.P.y = s.y; T.P.face = -Math.PI / 2; T.P.exp = 0; r.graceT = 0; r.screenT = 99; T.seek(0.05); const f = r.feel, tx = T.P.x, ty = T.P.y - f.seedRange; const before = T.shadedGeom(tx, ty); T.toss(); const n = r.seeds, flying = r.tosses.length; T.seek(f.seedRange / f.seedSpeed + 0.3); const sp = r.saplings[0]; const on = sp ? { x: sp.x, y: sp.y, r: sp.r } : null, shaded = T.shadedGeom(tx, ty), edge = T.shadedGeom(tx + 40, ty); T.seek(1.8); const still = r.saplings.length; T.seek(1.1); const after = r.saplings.length, shadedAfter = T.shadedGeom(tx, ty); return { before, n, flying, on, tx, ty, shaded, edge, still, after, shadedAfter, R: f.saplingR }; });
  say(b.n === 2 && b.flying === 1, 'a tap throws a seed: ' + b.n + ' left, one in the air');
  say(!!b.on && Math.abs(b.on.x - b.tx) < 1 && Math.abs(b.on.y - b.ty) < 1, 'a sapling sprouts where it lands, the facing way: ' + JSON.stringify(b.on));
  say(!b.before && b.shaded && b.edge, 'its small round shade makes shade of open sun (radius ' + b.R + ')');
  say(b.still === 1 && b.after === 0 && !b.shadedAfter, 'and it lasts three seconds: alive at about 2.2 s, gone at 3.3');
  const c = await ev(() => { const T = __TM; T.hold(true); T.startLevel(0); T.seek(0.5); const r = T._run(), s = window.__sunny(120); T.P.x = s.x; T.P.y = s.y; r.graceT = 0; r.screenT = 0; T.P.face = -Math.PI / 2; T.P.exp = 0; r.saplings.length = 0; const f = r.feel; /* stand on it: a sapling at his feet */ r.saplings.push({ x: s.x, y: s.y, t: 0, r: f.saplingR }); T.seek(2.2); const under = T.P.exp; T.seek(1.1); const out = T.P.exp; return { under, out }; });
  say(c.under === 0 && c.out > 0, 'standing on one cools him: exposure ' + c.under.toFixed(1) + ' under it, ' + c.out.toFixed(1) + ' after it wilts');
  const d = await ev(() => { const T = __TM; T.hold(true); T.startLevel(0); T.seek(0.5); const r = T._run(); r.screenT = 99; T.toss(); T.toss(); T.toss(); const none = r.seeds; T.toss(); const flying = r.tosses.length; const txt = document.getElementById('cSeed').textContent, empty = document.getElementById('bSeed').classList.contains('empty'); T.seek(0.1); r.screenT = 0; T.burn(); const afterBurn = r.seeds; r.seeds = 0; const L = r.L, cp = L.checkpoints[1] || L.checkpoints[0]; r.cpHit = []; T.P.x = cp[0]; T.P.y = cp[1]; r.screenT = 9; T.seek(0.05); const afterCp = r.seeds; return { none, flying, txt, empty, afterBurn, afterCp }; });
  say(d.none === 0 && d.flying === 3 && d.txt === '0' && d.empty, 'the fourth tap throws nothing, the button shows 0 and empty');
  say(d.afterBurn === 3, 'a respawn hands the three back');
  say(d.afterCp === 3, 'and a checkpoint refills them');
  const e = await ev(() => { const T = __TM, i = T.LEVELS.findIndex(l => l.sun && l.sun.lunge); T.hold(true); T.startLevel(i); const r = T._run(); r.screenT = 999; let g = 0; while (r.lunge.state !== 'warn' && g++ < 900) T.seek(1 / 60); const reach = r.lunge.reach, warned = r.lunge.state; T.P.face = 0; T.toss(); T.seek(0.2); const burst = r.lunge.calm, st0 = r.lunge.state, n = r.bursts; let strike = 0; for (let k = 0; k < 110; k++) { T.seek(1 / 60); if (r.lunge.state !== 'idle') strike++; } const calmLeft = r.lunge.calm; g = 0; while (r.lunge.state === 'idle' && g++ < 400) T.seek(1 / 60); const next = r.lunge.state, wait = g / 60, sap = r.saplings.length; return { name: T.LEVELS[i].name, reach, warned, burst, st0, n, strike, calmLeft, next, wait, sap }; });
  say(e.warned === 'warn' && e.burst > 1.5 && e.st0 === 'idle' && e.n === 1, 'in ' + e.name + ': a seed into the ring (reach ' + e.reach + ') bursts the lunge: calm ' + (e.burst || 0).toFixed(2) + ' s, the state ' + e.st0);
  say(e.strike === 0 && e.next === 'warn' && e.wait < 0.6, 'two seconds of calm, no strike in them, then it winds up again');
  say(e.sap === 0, 'and that seed grows no sapling');
  const f = await ev(() => { const T = __TM; T.hold(true); T.startLevel(0); T.seek(0.5); T.toss(); T.seek(0.15); T.seek(0.3); T.render(); return true; });
  say(f === true, 'a sapling and a seed in the air draw without an error');
}
if (!only || only === 'critters') {
  const list = await ev(() => { const T = __TM; T.hold(true); const out = []; T.LEVELS.forEach((L, i) => { T.startLevel(i); const r = T._run(); const near = r.critters.filter(c => c.kind === 'scorpion').map(c => { const d = (p) => Math.hypot(c.x - p[0], c.y - p[1]); return Math.min(d(L.start), d(L.exit), ...(L.checkpoints || []).map(d)); }); out.push({ i, w: L.world, s: r.critters.filter(c => c.kind === 'scorpion').length, m: r.critters.filter(c => c.kind === 'mirage').length, near: near.length ? Math.min(...near) : null, shaded: r.critters.filter(c => c.kind === 'scorpion' && T.shadedGeom(c.x, c.y)).length }); }); return out; });
  console.log('levels by world and index: ' + list.map(l => l.w + ':' + l.s + (l.m ? '+m' : '')).join(' '));
  say(list.filter(l => l.w === 0).every(l => l.s === 0 && l.m === 0), 'Morning Tide stays the sun alone');
  say(list.filter(l => l.w > 0).some(l => l.s > 0) && list.some(l => l.m > 0), 'scorpions from Midday Blaze, the mirage from the Dunes');
  say(list.every(l => l.near === null || l.near >= 240), 'no scorpion lives within 240 px of a start, a checkpoint or the flag (nearest ' + Math.min(...list.filter(l => l.near !== null).map(l => l.near)).toFixed(0) + ')');
  say(list.every(l => l.shaded === 0), 'every scorpion starts in the light');
  const i2 = list.find(l => l.s > 0).i;
  const g = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(), c = r.critters.find(q => q.kind === 'scorpion'); T.seek(1.2); r.graceT = 0; r.screenT = 0;
    /* patrol: it walks its lane */ T.P.x = 40; T.P.y = 40; T.P.exp = 0; r.screenT = 99; let walked = 0, lx = c.x, ly = c.y; for (let q = 0; q < 90; q++) { T.seek(1 / 60); walked += Math.hypot(c.x - lx, c.y - ly); lx = c.x; ly = c.y; } const st0 = c.state; r.screenT = 0;
    /* hunt: in the sun near it */ const near = window.__sunNear(c, 200); T.P.x = near.x; T.P.y = near.y; const sunny = !T.shadedGeom(T.P.x, T.P.y); T.P.exp = 0; const d0 = Math.hypot(T.P.x - c.x, T.P.y - c.y); T.seek(0.5); const hunt = c.state, d1 = Math.hypot(T.P.x - c.x, T.P.y - c.y), exp1 = T.P.exp; T.P.exp = 0;
    /* a sting */ T.P.x = c.x + 10; T.P.y = c.y; T.P.vx = 0; T.P.vy = 0; const e0 = T.P.exp; T.seek(0.05); const stung = T.P.exp - e0, stateAfter = c.state; T.P.exp = 0;
    return { walked, st0, sunny, hunt, d0, d1, stung, stateAfter, exp1 }; }, i2);
  say(g.st0 === 'patrol' && g.walked > 30, 'a scorpion patrols its lane: ' + g.walked.toFixed(0) + ' px in 1.5 s');
  say(g.sunny && g.hunt === 'hunt' && g.d1 < g.d0, 'it hunts him in the sun: ' + g.d0.toFixed(0) + ' px down to ' + g.d1.toFixed(0) + ' in half a second');
  say(g.stung >= 30, 'a sting costs ' + g.stung.toFixed(0) + ' exposure, then it backs off (' + g.stateAfter + ')');
  const h = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(), c = r.critters.find(q => q.kind === 'scorpion'); T.seek(1.2); r.graceT = 0; r.screenT = 0; const near = window.__sunNear(c, 170); T.P.x = near.x; T.P.y = near.y; T.P.exp = 0; T.seek(0.25); const st0 = c.state;
    /* into shade: a sapling at his feet is shade too */ r.saplings.push({ x: T.P.x, y: T.P.y, t: 0, r: 80 }); T.seek(0.2); const st1 = c.state; let k = 0; while (c.state !== 'patrol' && k++ < 300) T.seek(1 / 60); const backAfter = k / 60, atHome = Math.hypot(c.x - c.hx, c.y - c.hy); return { st0, st1, backAfter, atHome }; }, i2);
  say(h.st0 === 'hunt' && h.st1 !== 'hunt', 'reaching shade loses it: ' + h.st0 + ' to ' + h.st1);
  say(h.backAfter < 3 && h.atHome < 1, 'it sinks and comes back to its lane in ' + h.backAfter.toFixed(1) + ' s');
  const j = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(), c = r.critters.find(q => q.kind === 'scorpion'); T.seek(1.2); r.graceT = 0; r.screenT = 99; T.P.x = c.x; T.P.y = c.y + 120; T.P.face = -Math.PI / 2; T.toss(); T.seek(0.3); const pinned = c.pin, x0 = c.x, y0 = c.y; T.seek(1.5); const held = Math.hypot(c.x - x0, c.y - y0), left = c.pin; T.seek(0.5); const free = c.pin; return { pinned, held, left, free, sap: r.saplings.length }; }, i2);
  say(j.pinned > 1.4 && j.held === 0 && j.left > 0, 'a seed pins one for two seconds: pinned ' + j.pinned.toFixed(2) + ', it moved ' + j.held.toFixed(1) + ' px in 1.5 s');
  say(j.free <= 0, 'and it gets up again');
  const iM = list.find(l => l.m > 0).i;
  const m = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(), c = r.critters.find(q => q.kind === 'mirage'); r.critters = [c]; T.seek(1.2); r.graceT = 0; r.screenT = 0; const s = window.__sunny(160) || { x: T.P.x, y: T.P.y }; T.P.x = s.x; T.P.y = s.y; T.P.exp = 0; const f = r.feel; T.keys.d = true; const pos = []; for (let k = 0; k < 36; k++) { T.P.exp = 0; T.seek(1 / 60); pos.push({ x: T.P.x, y: T.P.y, t: r.t }); } T.keys.d = false; const on = c.on, back = pos.find(q => Math.abs(q.t - (r.t - f.mirageDelay)) < 0.02), off = back ? Math.hypot(c.x - back.x, c.y - back.y) : null; const d0 = Math.hypot(T.P.x - c.x, T.P.y - c.y); /* stops: it walks up to him and stings */ const n0 = r.stings || 0; for (let k = 0; k < 90; k++) { T.P.exp = 0; T.seek(1 / 60); } const stung = (r.stings || 0) > n0 ? 1 : 0; const sapl = (r.saplings.push({ x: T.P.x, y: T.P.y, t: 0, r: 80 }), T.seek(0.1), c.on); return { on, off, d0, stung, sapl }; }, iM);
  say(m.on && m.off !== null && m.off < 12, 'a heat mirage walks his last steps a third of a second behind: ' + (m.off === null ? '?' : m.off.toFixed(1)) + ' px off where he was, ' + m.d0.toFixed(0) + ' px behind him');
  say(m.stung === 1, 'stand still in the sun and it catches him');
  say(m.sapl === false, 'reaching shade dissolves it');
  const n = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(); T.seek(1.2); r.graceT = 0; r.screenT = 99; const c = r.critters[0]; T.P.x = c.x + 80; T.P.y = c.y; T.seek(0.1); T.render(); c.pin = 1; T.render(); c.pin = 0; c.sink = 0.2; T.render(); c.sink = 0; return true; }, i2);
  say(n === true, 'run, pin and sink all draw without an error');
}
if (only === 'run' || only === 'runbot') {
  /* THE RUN (7 Nov, TOMATO_MAN_RUN_BUILD_PLAN.md B6): the runner bot through the real update at 60 Hz, the clock held: it holds up,
     fires, and steers to the nearest band of shade ahead (a greedy pick every 0.25 s); a run ends at the burn (THE SUN WON) or
     at 240 s. Twenty seeds in world 0; the median distance before a burn is the number the plan tunes to (400 to 800 m) */
  const r0 = await ev(() => { const T = __TM; T.hold(true); T.startRun(1234, 0); const r = T._run(); return { isRun: !!r.isRun, bands: r.L.casters.length, seeds: r.seeds, name: r.L.name, bestT: document.getElementById('runBestT') ? document.getElementById('runBestT').textContent : null, plate: !!document.querySelector('#tEndless.runPlate'), marks: ['tm-mote', 'tm-gull', 'tm-crab', 'tm-mile-500', 'tm-mile-5000'].map(id => !!document.getElementById(id)), rp: Object.keys(window.__TM_RP || {}).length }; });
  say(r0.isRun && r0.bands >= 10 && r0.seeds === 6, 'a run starts: ' + r0.bands + ' bands made ahead, a pouch of ' + r0.seeds + ', ' + r0.name);
  say(r0.plate && r0.marks.every(Boolean), 'the title wears her RUN plate and her marks are in the page (' + r0.marks.join(',') + ')');
  const one = await ev((seed) => { const T = __TM; T.hold(true); T.startRun(seed, 0); const r = T._run(), P = T.P, k = T.keys; r.graceT = 0; let t = 0, pick = 0, tx = P.x;
    while (T._mode() === 'play' && t < 240) { if (t >= pick) { pick = t + 0.25; let best = null, bd = 1e9; for (const c of r.L.casters) { const cx = c[0] === 'R' ? c[1] + c[3] / 2 : c[1], cy = c[2]; const dy = P.y - cy; if (dy < 40) continue; const d = Math.abs(dy) + Math.abs(cx - P.x) * 0.6; if (d < bd) { bd = d; best = cx; } } tx = best === null ? P.x : best; }
      k.w = true; k.a = tx < P.x - 24; k.d = tx > P.x + 24; k.r = true; T.update(1 / 60); t += 1 / 60; }
    k.w = k.a = k.d = k.r = false; return { m: Math.floor(r.dist / 10), t: Math.round(t), mode: T._mode(), world: r.L.world, miles: r.miles, pins: r.pins || 0, motes: r.motes.length, gulls: r.gulls.length }; }, 777);
  say(one.mode === 'win' || one.t >= 240, 'one run plays through to its end: ' + one.m + ' m in ' + one.t + ' s, ' + one.mode + ', world ' + one.world + ', mile ' + one.miles + ', pinned ' + one.pins);
  const card = await ev(() => { const T = __TM; T.render(); return { title: document.getElementById('winTitle').textContent, time: document.getElementById('winTime').textContent, screen: document.querySelector('.show') ? document.querySelector('.show').id : '' }; });
  say(card.title === 'THE SUN WON' && /\d m/.test(card.time), 'the card says THE SUN WON with the distance: ' + card.time.slice(0, 40));
  if (only === 'runbot') {
    const ms = [];
    for (let s = 1; s <= 20; s++) { const q = await ev((seed) => { const T = __TM; T.hold(true); T.startRun(seed, 0); const r = T._run(), P = T.P, k = T.keys; r.graceT = 0; let t = 0, pick = 0, tx = P.x;
      while (T._mode() === 'play' && t < 240) { if (t >= pick) { pick = t + 0.25; let best = null, bd = 1e9; for (const c of r.L.casters) { const cx = c[0] === 'R' ? c[1] + c[3] / 2 : c[1], cy = c[2]; const dy = P.y - cy; if (dy < 40) continue; const d = Math.abs(dy) + Math.abs(cx - P.x) * 0.6; if (d < bd) { bd = d; best = cx; } } tx = best === null ? P.x : best; }
        k.w = true; k.a = tx < P.x - 24; k.d = tx > P.x + 24; k.r = true; T.update(1 / 60); t += 1 / 60; }
      k.w = k.a = k.d = k.r = false; return Math.floor(r.dist / 10); }, 1000 + s * 37); ms.push(q); }
    ms.sort((a, b) => a - b); const med = ms[10];
    console.log('runner bot, 20 seeds in world 0, metres before the burn: ' + ms.join(' ') + ' | median ' + med);
    say(med >= 400 && med <= 800, 'the bot\'s world 0 median is ' + med + ' m (400 to 800)');
  }
}
if (only === 'hero') {
  /* THE HERO (7 Nov, chapter 10): a produce body walks on the tomato's rig. Pickle in the open, facing east: its five sheets load,
     the walk frame changes with the stride (a still body could not), the dash frame differs again, and the figure's pixels on the
     game canvas are green where the tomato's are red; a hat sits on it without an error */
  await ev(() => { const T = __TM; T.hold(true); T.look('pickle', 'none'); T.startLevel(0); });
  let loaded = false; for (let k = 0; k < 60 && !loaded; k++) { loaded = await ev(() => { const T = __TM; return ['s', 'se', 'e', 'ne', 'n'].every(d => { const i = T.A('hero_pickle_' + d); return i && i.naturalWidth === 1024 && i.naturalHeight === 512; }); }); if (!loaded) await new Promise(r => setTimeout(r, 250)); }
  say(loaded, 'the pickle\'s five bearing sheets load lazily, 1024 by 512 each');
  const box = (body) => ev((body) => { const T = __TM; T.hold(true); T.look(body, 'none'); T.startLevel(0); T.seek(0.5); const r = T._run(), s = window.__sunny(120); r.graceT = 0; r.screenT = 99; T.P.x = s.x; T.P.y = s.y; T.P.exp = 0; T.P.face = 0; T.P.vx = 120; T.P.vy = 0; T.P.sx = T.P.sy = 1; r.idleT = 0;
    const cv = document.getElementById('game'), g = cv.getContext('2d'), DPR = cv.width / cv.clientWidth, cam = T._cam(); cam.x = T.P.x - cv.clientWidth / 2; cam.y = T.P.y - cv.clientHeight / 2;   /* the camera does not follow a teleport while the clock is held */
    const grab = () => { T.render(); const x = Math.round((T.P.x - cam.x - 32) * DPR), y = Math.round((T.P.y - cam.y - 32) * DPR), w = Math.round(64 * DPR); return Array.from(g.getImageData(x, y, w, w).data); };
    /* her cell drawn alone at the same size: the figure's pixels on the game canvas should match this body's cell and not the other's */
    const cellPx = (key, cell) => { const img = T.A(key), o = document.createElement('canvas'), w = Math.round(64 * DPR); o.width = o.height = w; const q = o.getContext('2d'); if (img) q.drawImage(img, (cell % 4) * (img.width / 4), Math.floor(cell / 4) * (img.height / 2), img.width / 4, img.height / 2, 0, 0, w, w); return Array.from(q.getImageData(0, 0, w, w).data); };
    const match = (box, cell) => { let n = 0, sum = 0; for (let i = 0; i < cell.length; i += 4) { if (cell[i + 3] < 250) continue; n++; sum += Math.abs(box[i] - cell[i]) + Math.abs(box[i + 1] - cell[i + 1]) + Math.abs(box[i + 2] - cell[i + 2]); } return { n, mean: n ? sum / n : 999 }; };
    r.stride = 0; const walk1 = grab(); r.stride = 20; const walk2 = grab(); r.stride = 34; const walk3 = grab(); T.P.dashT = r.feel.dashDur - 0.5; const dash = grab(); T.P.dashT = 0;
    const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 60) n++; return n; };
    const own = match(walk1, cellPx(body === 'tomato' ? 'hero_e' : 'hero_' + body + '_e', 1)), other = match(walk1, cellPx(body === 'tomato' ? 'hero_pickle_e' : 'hero_e', 1));
    return { dWalk: diff(walk1, walk2), dWalkWalk: diff(walk2, walk3), dWalkDash: diff(walk2, dash), own, other }; }, body);
  const pk = await box('pickle'), tm = await box('tomato');
  say(pk.dWalk > 80 && pk.dWalkWalk > 80 && pk.dWalkDash > 80, 'the pickle\'s frames change with the stride and the dash (walk 1 to 2: ' + pk.dWalk + ' px, 2 to 3: ' + pk.dWalkWalk + ', walk to dash: ' + pk.dWalkDash + ')');
  say(pk.own.n > 1500 && pk.own.mean < 30 && pk.other.mean > pk.own.mean * 3, 'on the canvas the pickle IS her pickle cell (' + pk.own.n + ' figure px, mean colour gap ' + pk.own.mean.toFixed(1) + '; against the tomato\'s cell ' + pk.other.mean.toFixed(1) + ')');
  say(tm.own.mean < 30 && tm.other.mean > tm.own.mean * 3, 'and the tomato is still the tomato (gap ' + tm.own.mean.toFixed(1) + ', against the pickle ' + tm.other.mean.toFixed(1) + ')');
  const hat = await ev(() => { const T = __TM; T.hold(true); T.look('cherry', 'cap'); T.startLevel(0); T.seek(0.3); const r = T._run(); T.P.face = -Math.PI / 2; r.stride = 20; T.P.vx = 0; T.P.vy = -120; T.render(); T.P.face = Math.PI; T.render(); return { body: T.save.cosmetics.body, hat: T.save.cosmetics.hat }; });
  say(hat.body === 'cherry' && hat.hat === 'cap', 'a cherry in a cap walks north and west without an error');
  const heads = await ev(() => { const T = __TM; return ['strawberry', 'bellpepper', 'pickle', 'sunburn'].map(b => { const i = T.A('bhead_' + b); return i ? i.naturalWidth : 0; }); });
  say(heads.every(w => w === 384 || w === 0), 'the builder heads that are loaded are her 384 px faces (' + heads.join(',') + ')');
}
if (only === 'planet') {
  /* PLANET TOMATÓ (7 Nov, Stephen's name): once in a Dunes or Eclipse level a tomato moon crosses; its circle is shade while it passes */
  const idx = await ev(() => { const T = __TM; return { d: T.LEVELS.findIndex(l => l.world === 3), e: T.LEVELS.findIndex(l => l.world === 4 && l.sun.dark), z: T.LEVELS.findIndex(l => !l.world) }; });
  const a = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(); return { has: !!r.planet, st: r.planet && r.planet.state, at: r.planet && r.planet.at, name: r.L.name }; }, idx.d);
  const z = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); return __TM._run().planet; }, idx.z);
  say(a.has && a.st === 'wait' && a.at >= 9 && a.at <= 13 && z === null, 'a Dunes level has a planet waiting (' + a.name + ', at ' + a.at + ' s); a Morning Tide level has none');
  const b = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(); r.graceT = 0; T.P.exp = 0; r.screenT = 999; let t = 0;
    while (r.planet.state === 'wait' && t < 20) { T.update(1 / 60); t += 1 / 60; } const appr = r.planet.state, y0 = r.planet.y, py = T.P.y; T.render();
    let tA = 0; while (r.planet.state === 'approach' && tA < 2) { T.update(1 / 60); tA += 1 / 60; } const pass = r.planet.state; T.render();
    const pl = r.planet, x1 = pl.x; T.update(1 / 60); const moved = Math.abs(pl.x - x1), centre = T.shadedGeom(pl.x, pl.y), out = T.shadedGeom(pl.x - pl.dir * (pl.r + 30), pl.y), cue = document.getElementById('cue').textContent;
    r.screenT = 0; T.P.exp = 0; const e0 = T.P.exp, inside = []; for (let k = 0; k < 60; k++) { T.P.x = pl.x; T.P.y = pl.y; T.P.vx = T.P.vy = 0; T.update(1 / 60); inside.push(T.shadedGeom(T.P.x, T.P.y)); } const e1 = T.P.exp;
    let tP = 0, leaveDrawn = false; while (r.planet.state !== 'done' && tP < 40) { T.P.x = Math.max(40, Math.min(r.L.worldW - 40, pl.x)); T.P.y = Math.max(200, pl.y); T.update(1 / 60); tP += 1 / 60; if (r.planet.state === 'leave' && !leaveDrawn) { leaveDrawn = true; T.render(); } } T.render();
    return { appr, dy: py - y0, pass, moved, centre, out, cue, e0, e1, allIn: inside.every(Boolean), tP, done: r.planet.state, afterShade: T.shadedGeom(pl.x, pl.y), leaveDrawn }; }, idx.d);
  say(b.appr === 'approach' && Math.abs(b.dy - 140) < 1, 'at its time it approaches from one side, ' + b.dy + ' px above him');
  say(b.pass === 'pass' && b.moved > 2 && b.centre && !b.out, 'then it passes: the circle moves ' + b.moved.toFixed(1) + ' px a step, shade at its centre, sun a step past its rim');
  say(b.cue.indexOf('Planet Tomató') >= 0, 'the cue line says ' + JSON.stringify(b.cue));
  say(b.allIn && b.e1 <= b.e0 + 0.01, 'standing in it for a second he stays in shade (exposure ' + b.e0.toFixed(1) + ' to ' + b.e1.toFixed(1) + ')');
  say(b.done === 'done' && b.tP < 20 && !b.afterShade && b.leaveDrawn, 'it leaves by the far side in ' + b.tP.toFixed(1) + ' s and its shade goes with it (approach, pass and leave all drawn)');
  const c = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(); return { has: !!r.planet, dark: !!r.dark, name: r.L.name }; }, idx.e);
  say(c.has && c.dark, 'an Eclipse level has one too, beside its dark windows (' + c.name + ')');
  const d = await ev(() => { const T = __TM; T.hold(true); T.startRun(5, 3); return __TM._run().planet; });
  say(d === null, 'the run has none');
}
if (only === 'split') {
  /* THE SPLIT (7 Nov, Stephen): in the Dunes and the Eclipse the awnings stand in two lanes; each has its own sway clock */
  const lv = await ev(() => { const T = __TM; const out = []; T.LEVELS.forEach((L, i) => { if (!(L.world === 3 || L.world === 4)) return; const R = L.casters.filter(c => c[0] === 'R').sort((a, b) => b[2] - a[2]); const cx = R.map(c => c[1] + c[3] / 2); const gaps = cx.slice(1).map((x, k) => Math.abs(x - cx[k]));
      const inside = (p) => L.casters.some(c => c[0] === 'R' && p[0] >= c[1] && p[0] <= c[1] + c[3] && p[1] >= c[2] - 10 && p[1] <= c[2] + c[4] + 10);
      out.push({ i, name: L.name, n: R.length, wide: gaps.filter(g => g >= 480).length, gaps, clocks: R.filter(c => c.length > 6 && (c[6] || c[7] !== 1)).length, cpsOn: L.checkpoints.filter(inside).length, cps: L.checkpoints.length, inBounds: R.every(c => c[1] >= 0 && c[1] + c[3] <= L.worldW) }); }); return out; });
  console.log(lv.map(l => l.i + ':' + l.name + ' lanes ' + l.wide + '/' + (l.n - 1) + ' clocks ' + l.clocks + ' cps ' + l.cpsOn + '/' + l.cps).join(' | '));
  say(lv.length === 9 && lv.every(l => l.wide >= l.n - 3), 'in all nine Dunes and Eclipse levels the awnings stand in two lanes 500 px apart (all but the start and exit steps)');
  say(lv.every(l => l.cpsOn === l.cps - (l.i === 25 ? 2 : 0) && l.inBounds), 'every checkpoint that stood on an awning still does (The Long Dark keeps its two dark ones), every awning inside its level');
  say(lv.every(l => l.clocks >= l.n - 3), 'every moved awning carries its own sway clock');
  const sw = await ev((i) => { const T = __TM; T.hold(true); T.startLevel(i); const r = T._run(), L = r.L; r.screenT = 999; T.seek(3);
    /* two swayed awnings: the lean of each shade (its swept vector) at the same moment; and the start awning leans with the sun */
    const R = L.casters.map((c, k) => ({ c, k })).filter(o => o.c.c0 !== 'U' && o.c[0] === 'R');
    const lean = (k) => { const poly = r.shadePolys[k]; let minY = 1e9, maxY = -1e9; for (const p of poly) { minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); } const tip = poly.filter(p => p.y < minY + 1), base = poly.filter(p => p.y > maxY - 1), mx = a => a.reduce((s, p) => s + p.x, 0) / a.length; return Math.atan2(mx(tip) - mx(base), maxY - minY); };
    const leans = R.map(o => ({ k: o.k, ph: o.c[6] || 0, sp: o.c[7] || 1, lean: lean(o.k) }));
    const sunLean = Math.atan2(Math.cos(r.az + Math.PI), -Math.sin(r.az + Math.PI));
    const spread = Math.max(...leans.map(l => l.lean)) - Math.min(...leans.map(l => l.lean));
    const fixed = leans.find(l => l.ph === 0 && l.sp === 1);
    return { spread, n: leans.length, fixedLean: fixed ? fixed.lean : null, sunLean, name: L.name }; }, lv[0].i);
  say(sw.spread > 0.15, 'in ' + sw.name + ' at 3 s the shades lean apart by ' + (sw.spread * 180 / Math.PI).toFixed(0) + ' degrees across the awnings');
  say(sw.fixedLean !== null && Math.abs(Math.atan2(Math.sin(sw.fixedLean - sw.sunLean), Math.cos(sw.fixedLean - sw.sunLean))) < 0.2, 'and the start awning leans with the sun (' + (sw.fixedLean * 180 / Math.PI).toFixed(0) + ' vs ' + (sw.sunLean * 180 / Math.PI).toFixed(0) + ')');
  const play = await ev((idx) => { const T = __TM; const out = []; for (const i of idx) { T.hold(true); T.startLevel(i); const r = T._run(), L = r.L; r.screenT = 999; T.seek(2); T.render(); const on = L.casters.some(c => c[0] === 'R' && r.cp.x >= c[1] && r.cp.x <= c[1] + c[3] && r.cp.y >= c[2] - 10 && r.cp.y <= c[2] + c[4] + 10); out.push({ i, name: L.name, cp: [r.cp.x, r.cp.y], on, shaded: T.shadedGeom(r.cp.x, r.cp.y), startShaded: T.shadedGeom(L.start[0], L.start[1]) }); } return out; }, lv.map(l => l.i));
  console.log(play.map(p => p.i + ':' + (p.on ? 'on' : 'off') + (p.shaded ? '+shade' : '-shade') + (p.startShaded ? ' start+' : ' start-')).join(' '));
  say(play.every(p => p.startShaded && (!p.on || p.shaded)), 'each of the nine levels runs two seconds and draws, its start in shade and its first checkpoint too where it stands on an awning');
  /* the walk order: facing north the frames go 1,3,2,4 by the stride; south 1,2,4,3 */
  const wo = await ev(() => { const T = __TM; T.hold(true); T.look('tomato', 'none'); T.startLevel(0); T.seek(0.3); const r = T._run(); r.idleT = 0; T.P.vx = 0; T.P.vy = -120; T.P.face = -Math.PI / 2; T.P.sx = T.P.sy = 1;
    const cv = document.getElementById('game'), g = cv.getContext('2d'), DPR = cv.width / cv.clientWidth, cam = T._cam(); cam.x = T.P.x - cv.clientWidth / 2; cam.y = T.P.y - cv.clientHeight / 2; const w = Math.round(64 * DPR);
    const grab = () => { T.render(); return g.getImageData(Math.round((T.P.x - cam.x - 32) * DPR), Math.round((T.P.y - cam.y - 32) * DPR), w, w).data; };
    const cellPx = (cell) => { const img = T.A('hero_n'), o = document.createElement('canvas'); o.width = o.height = w; const q = o.getContext('2d'); q.drawImage(img, (cell % 4) * (img.width / 4), Math.floor(cell / 4) * (img.height / 2), img.width / 4, img.height / 2, 0, 0, w, w); return q.getImageData(0, 0, w, w).data; };
    const best = (box) => { let bi = -1, bm = 1e9; for (let c = 1; c <= 4; c++) { const cell = cellPx(c); let n = 0, s = 0; for (let i = 0; i < cell.length; i += 4) { if (cell[i + 3] < 250) continue; n++; s += Math.abs(box[i] - cell[i]) + Math.abs(box[i + 1] - cell[i + 1]) + Math.abs(box[i + 2] - cell[i + 2]); } const m = s / n; if (m < bm) { bm = m; bi = c; } } return bi; };
    const seq = []; for (const st of [0, 14, 28, 42]) { r.stride = st; seq.push(best(grab())); } return seq; });
  say(wo.join(',') === '1,3,2,4', 'walking north the frames land 1,3,2,4 by the stride (left, right, left, right): ' + wo.join(','));
}
say(errs.length === 0, 'page errors ' + errs.length + ' ' + errs.slice(0, 3).join(' | ').slice(0, 300));
console.log(bad ? 'GAMEPLAY FAILED ' + bad : 'GAMEPLAY OK');
await browser.close();
process.exit(bad ? 1 : 0);
