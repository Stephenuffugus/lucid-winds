/* DEWBALL STORE RAWS (13 Nov 2026). Captures from the REAL game, served as it is on 127.0.0.1:8777, in LANDSCAPE
   (the way the game says to play it) at a phone's 915 x 412 CSS, device scale 2, so each raw is 1830 x 824 and fits
   the kit frame's window (graphics.py composes the frame and the headline; compose.mjs only makes portrait frames).

   How the moments are reached. The page runs with ?dbtest=1, the game's own probe mode: Math.random is seeded, the
   frame loop stops, and window.DB_DEV steps the real engine. A greedy bot then PLAYS each world from its start size,
   always rolling at the nearest thing the ball can pick up (DB_DEV.canEat), giving up on a target it cannot reach in
   two seconds. Every pickup, gate, size fact and result below happened in that run; nothing is set by hand except the
   camera, which in probe mode never turns by itself (the game's own note at DB_DEV.setCam), so it is aimed down the
   ball's path before each capture. The world row and the Grove come from the save those runs wrote.
   ?nomusic=1 keeps the soundtrack's "New song" card out of the pictures (the Play app shows it after some play).
   Two things are changed in the picture and nothing else: this box has no colour emoji font, so emoji glyphs are
   removed from the page text before each capture and from the gate signs' canvas text (on a phone they are colour icons), and lucidwinds.com is blocked
   (the Sunbeam script and the soundtrack draw nothing in the Play app anyway; the game itself is served locally).
   Each raw is checked before it is kept: a capture whose centre is near black, or flat, is reported and not saved.
   Run:  node store/dewball-play/shoot.mjs [--worlds 1,2,3,4,5,6,7] [--clean]   then  python3 store/dewball-play/graphics.py */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const BASE = 'http://127.0.0.1:8777/satellites/dewball/index.html?dbtest=1&dbseed=4242&nomusic=1';
const CLEAN = process.argv.includes('--clean');   /* key art for the feature graphic: the same run with the HUD, toasts and sticks hidden, saved to raw/clean/ */
const OUT = '/workspaces/lucid-winds/store/dewball-play/raw/' + (CLEAN ? 'clean/' : ''); fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const WORLDS = String(arg('worlds', '1,2,3,4,5,6,7')).split(',').map(Number);
const W = 915, H = 412, DPR = 2;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--force-color-profile=srgb'] });
const errors = [];
const p = await browser.newPage();
await p.setViewport({ width: W, height: H, isMobile: true, hasTouch: true, deviceScaleFactor: DPR });
p.on('pageerror', e => errors.push(String(e.message || e).slice(0, 160)));
const cdp0 = await p.createCDPSession(); await cdp0.send('Network.setBypassServiceWorker', { bypass: true });   /* or the worker fetches past the block below */
await p.setRequestInterception(true);
p.on('request', r => (/lucidwinds\.com|sunbeam-sdk|music-unlocks|music-catalog|feedback\.js|gstatic/.test(r.url()) ? r.abort() : r.continue()));
/* the Play app: the game's inTWA test reads document.referrer */
await p.evaluateOnNewDocument(() => { try { Object.defineProperty(Document.prototype, 'referrer', { get: () => 'android-app://com.skywolfstudio.dewball/' }); } catch (e) {} });
/* the gate signs are words drawn on a canvas, with an emoji in front: strip it there too (the picture change above) */
await p.evaluateOnNewDocument(() => { const f = CanvasRenderingContext2D.prototype.fillText; const re = /[\u{1F000}-\u{1FAFF}]\uFE0F?\s?|[\u2600-\u27BF]\uFE0F\s?|[\u26A0\u26A1\u2B50\u2728\u23F1]\s?/gu;
  CanvasRenderingContext2D.prototype.fillText = function (t, x, y, m) { t = String(t).replace(re, ''); return m === undefined ? f.call(this, t, x, y) : f.call(this, t, x, y, m); }; });
await p.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 });
await p.waitForFunction('window.DB_DEV && window.DB_DEV.notes', { timeout: 60000 });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle2' });
await p.waitForFunction('window.DB_DEV && window.DB_DEV.notes', { timeout: 60000 });
const STRIP = () => {
  /* colour emoji only: the pictographs, and the older symbols when they carry the emoji selector, plus the few the
     game writes bare (warning, lightning, star, sparkles). Stars, the pause bars and the note sign stay: the box draws them. */
  const re = /[\u{1F000}-\u{1FAFF}]\uFE0F?\s?|[\u2600-\u27BF]\uFE0F\s?|[\u26A0\u26A1\u2B50\u2728\u23F1]\s?/gu;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const v = n.nodeValue; const out = v.replace(re, ''); if (out !== v) n.nodeValue = out; }
};
/* a capture is kept only if its middle is neither black nor flat */
async function snap(name, opts) {
  opts = opts || {};
  await p.evaluate(STRIP);
  if (CLEAN) await p.evaluate(() => { ['hud', 'toast', 'combo', 'stickL', 'stickR', 'threat', 'introCard'].forEach(id => { const e = document.getElementById(id); if (e) e.style.visibility = 'hidden'; }); });
  await p.evaluate(() => { window.DB_DEV.render(); });
  await sleep(opts.wait || 300);
  const buf = await p.screenshot({ type: 'png' });
  const st = await p.evaluate(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = 200; c.height = 90; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 200, 90);
    const d = g.getImageData(40, 15, 120, 60).data; let s = 0, s2 = 0, n = 0; for (let i = 0; i < d.length; i += 4) { const y = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; s += y; s2 += y * y; n++; }
    const m = s / n; return { mean: Math.round(m), sd: Math.round(Math.sqrt(s2 / n - m * m)) }; }, buf.toString('base64'));
  const bad = st.mean < 18 || st.sd < 6;
  if (bad && !opts.overlay) { console.log('  REJECTED ' + name + ' (centre mean ' + st.mean + ', sd ' + st.sd + ')'); return false; }
  fs.writeFileSync(OUT + name + '.png', buf); console.log('  raw/' + name + '.png  centre mean ' + st.mean + ' sd ' + st.sd); return true;
}
/* the bot: play sim seconds of the real engine, then return what happened */
const play = (secs, aimPitch, stopOn) => p.evaluate((secs, aimPitch, stopOn) => {
  const D = window.DB_DEV, B = window.__bot || (window.__bot = { tgt: null, best: 1e9, since: 0, ban: {}, t: 0 });
  const ev = { facts: [], gates: [], over: false };
  let gatesOpen = (D.state().gates || []).map(g => g.open);
  const dt = 1 / 30, steps = Math.round(secs / dt);
  for (let i = 0; i < steps; i++) {
    if (i % 8 === 0) {
      const s = D.state(); if (s.over) { ev.over = true; break; }
      const bx = s.ballX, bz = s.ballY;
      if (B.tgt) { const dd = Math.hypot(B.tgt.x - bx, B.tgt.z - bz); const still = s.objects.some(o => o.x === B.tgt.x && o.z === B.tgt.z);
        if (!still) B.tgt = null; else if (dd < B.best * 0.9) { B.best = dd; B.since = 0; } else if ((B.since += 8 * dt) > 2) { B.ban[B.tgt.x + ',' + B.tgt.z] = 1; B.tgt = null; } }
      if (!B.tgt) { let bd = 1e18, bo = null; for (const o of s.objects) { if (!D.canEat(o.s) || B.ban[o.x + ',' + o.z]) continue; const d2 = (o.x - bx) * (o.x - bx) + (o.z - bz) * (o.z - bz); const sc = d2 / (o.s * o.s); if (sc < bd) { bd = sc; bo = o; } }
        if (bo) { B.tgt = { x: bo.x, z: bo.z }; B.best = Math.hypot(bo.x - bx, bo.z - bz); B.since = 0; } }
      if (B.tgt) { const dx = B.tgt.x - bx, dz = B.tgt.z - bz, L = Math.hypot(dx, dz) || 1; D.roll(dx / L, dz / L); D.aimAt(B.tgt.x, B.tgt.z, aimPitch); }
      else D.roll(Math.sin(B.t), Math.cos(B.t));
      const go = (s.gates || []).map(g => g.open); go.forEach((o, gi) => { if (o && !gatesOpen[gi]) ev.gates.push({ i: gi, x: s.gates[gi].x, z: s.gates[gi].z, need: s.gates[gi].need }); }); gatesOpen = go;
      if (stopOn && stopOn.gate && ev.gates.length) { ev.stopped = 'gate'; break; }
    }
    D.step(dt); B.t += dt;
    const n = D.notes(); if (n.shown && n.text && ev.facts.indexOf(n.text) < 0) ev.facts.push(n.text);
    if (stopOn && stopOn.fact && n.shown && n.cur && n.cur.kind === 'fact' && n.t - (window.__factAt || 0) > 0.6) { ev.stopped = 'fact'; ev.fact = n.text; break; }
    if (n.cur && n.cur.kind === 'fact') { if (!window.__factAt) window.__factAt = n.t; } else window.__factAt = 0;
  }
  const s = D.state(); return { ev, D: +s.D.toFixed(1), timer: Math.round(s.timer), over: s.over || ev.over, n: s.absorbCount };
}, secs, aimPitch, stopOn || null);
const startWorld = n => p.evaluate(n => { const D = window.DB_DEV; window.__bot = null; const id = D.start(n === 7 ? 'zen' : 'level', n); D.endFirstRun(); return id; }, n);
const waitModels = () => p.waitForFunction(() => window.DB_DEV.meshes().loading === 0, { timeout: 240000, polling: 1000 }).catch(() => console.log('  models still loading after 240 s'));
const hideIntro = () => p.evaluate(() => { const c = document.getElementById('introCard'); if (c) c.classList.remove('show'); });
const settle = () => p.evaluate(() => { window.DB_DEV.camSettle(); });
/* the world numbers DB_DEV uses: 1 Crumb Country, 2 Toybox Peaks, 3 Night Garden, 4 Bazaar Lane, 5 Starfall Bay,
   6 The Whole World, 7 Dream Meadow (zen) */
const PITCH = +arg('pitch', 0.6);
const PLAN = { 1: [0.35, 0.7], 2: [0.4, 0.75], 3: [0.4, 0.75], 4: [0.4, 0.75], 5: [0.4, 0.75], 6: [0.4, 0.75], 7: [0.5, 1] };
for (const n of WORLDS) {
  const id = await startWorld(n); await waitModels(); await hideIntro();
  const info = await p.evaluate(() => { const s = window.DB_DEV.state(); return { timer: s.timer, D: s.D }; });
  const total = n === 7 ? 150 : info.timer; console.log('world ' + n + ' ' + id + ' clock ' + Math.round(total) + ' s, start ' + info.D + ' cm');
  /* the intro card itself, once, at the start */
  if (n === 1 || n === 6) { await p.evaluate(() => { const c = document.getElementById('introCard'); if (c) c.classList.add('show'); }); await settle(); await snap('w' + n + '-intro'); await hideIntro(); }
  let t = 0, k = 0, factShot = false, gateShot = false;
  for (const frac of PLAN[n]) {
    const until = total * frac - 3;
    while (t < until) {
      const r = await play(Math.min(10, until - t), PITCH, { fact: !factShot && t > 12, gate: !gateShot }); t += 10;
      if (r.over) break;
      if (r.ev.stopped === 'gate') { gateShot = true; const g = r.ev.gates[0];
        await p.evaluate(g => { window.DB_DEV.aimAt(g.x, g.z, 0.55); }, g); await settle(); await snap('w' + n + '-gate-' + Math.round(t)); console.log('   gate opened at ' + g.need + ' cm'); }
      if (r.ev.stopped === 'fact') { factShot = true; await settle(); await snap('w' + n + '-fact-' + Math.round(t)); console.log('   fact: ' + r.ev.fact + ' at ' + r.D + ' cm'); }
    }
    const r = await play(3, PITCH); t += 3;
    if (r.over) { console.log('  run over at ' + Math.round(t) + ' s'); break; }
    await settle(); await snap('w' + n + '-' + (k++) + '-' + Math.round(r.D) + 'cm');
    console.log('   t ' + Math.round(t) + ' s, ball ' + r.D + ' cm, ' + r.n + ' picked up, facts ' + JSON.stringify(r.ev.facts.slice(-2)));
  }
  /* play the clock out, then the result card the game shows */
  if (n !== 7) { let r; for (let g = 0; g < 60; g++) { r = await play(10, PITCH); if (r.over) break; }
    await sleep(600); await snap('w' + n + '-result', { overlay: true });
    const res = await p.evaluate(() => ({ title: document.getElementById('resTitle').textContent, body: document.getElementById('resBody').textContent, stars: document.getElementById('resStars').textContent, unlock: document.getElementById('resUnlock').textContent }));
    console.log('   result ' + JSON.stringify(res));
  } else { await p.evaluate(() => window.DB_DEV.endRun()); }
}
/* the menu and the Grove from the save the runs wrote */
await p.evaluate(() => { ['howto', 'pauseOv', 'result', 'skins', 'collect'].forEach(id => { const e = document.getElementById(id); if (e) e.classList.add('hidden'); }); const q = document.getElementById('pQuit'); if (q) q.click(); });
await p.evaluate(() => { const b = document.querySelector('#resBtns button:last-child'); if (b) b.click(); });
await sleep(800); await p.evaluate(() => { document.getElementById('menu').classList.remove('hidden'); });
await snap('menu', { overlay: true });
await p.evaluate(() => document.getElementById('mCollect').click()); await sleep(600); await snap('grove', { overlay: true });
await p.evaluate(() => document.getElementById('collectBack').click()); await sleep(300);
await p.evaluate(() => document.getElementById('mSkins').click()); await sleep(600); await snap('skins', { overlay: true });
console.log('save', await p.evaluate(() => JSON.stringify(window.DB_DEV.save().worlds)));
console.log('page errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
