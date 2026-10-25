// Pop N Lock Part 3b gate (v1.12): the canvas HUD in real px and the launch gate's sweep.
// [A] a live campaign match at 412 x 915, 375 x 812, 360 x 780, a phone in Safari with its bars (390 x 664) and Larger text:
//     every canvas text renders 12 CSS px or more, no two HUD labels overlap, the HYPE readout names its tier with pips,
//     the danger X is drawn; the intro card, the countdown and the outro text at 360. [B] the menus at 200 percent text
//     overflow nowhere. [C] looks at 412, 360, 390 x 664 and Larger text, and the intro card at 360.
// node p3b_gate.mjs [pageFile] [outDir] [noShots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/';
const PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p3b', SHOTS = !process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 700)); } }
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h, pre) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((pre) => { try { localStorage.setItem('lwfb_explained', '1'); if (pre) localStorage.setItem('cw_set', pre); else localStorage.removeItem('cw_set'); } catch (e) {} }, pre || null);
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
  return { p, errs }; }
async function match(p, stage) { await p.evaluate(n => window.CW_DEV.beginStage(n), stage);
  for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
  await p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; M.of.react = 1e9; M.pf.pending = 14; M.of.pending = 13; M.pf.cancelN = 6; M.pf.cancelT = 1e9;
    M.pf.hype = 70; M.pf.hypeTier = 3; M.pf.flashDanger = 1e9; M.of.flashDanger = 1e9;
    M.pf.floats.push({ x: 0, y: 0, txt: 'FRESH x2', life: 50, big: true, fld: M.pf }); M.of.floats.push({ x: 0, y: 0, txt: 'DENIED', life: 50, big: true, fld: M.of }); }); }
/* every fillText for a while: its text, size, place and box (from measureText and the align) */
const spy = (p, ms) => p.evaluate(async (ms) => { const c2 = document.getElementById('game').getContext('2d'), orig = c2.fillText, seen = [];
  c2.fillText = function (t, x, y) { const m = /(\d+(?:\.\d+)?)px/.exec(c2.font), fs = m ? +m[1] : 0, w = c2.measureText(t).width, al = c2.textAlign, tr = c2.getTransform();
    const x0 = (al === 'center' ? x - w / 2 : al === 'right' || al === 'end' ? x - w : x); seen.push({ t: String(t), fs, x0: tr.a * x0 + tr.e, y: tr.d * y + tr.f, w: w * tr.a, sc: tr.a }); return orig.apply(this, arguments); };
  await new Promise(r => setTimeout(r, ms)); c2.fillText = orig; return { seen, S: window.CW_DEV.comfort().s, hud: JSON.parse(JSON.stringify(window.CW_DEV.hud())) }; }, ms);
try {
  await sleep(500);
  const sweep = [[412, 915, null], [375, 812, null], [360, 780, null], [390, 664, null], [360, 780, JSON.stringify({ bigText: true })]];
  for (const [w, h, pre] of sweep) { const o = await open(w, h, pre);
    await match(o.p, 3); await sleep(250); const r = await spy(o.p, 450);
    const tag = `${w}x${h}${pre ? ' Larger text' : ''}`;
    const uniq = {}; for (const s of r.seen) { const k = s.t + '|' + Math.round(s.x0) + '|' + Math.round(s.y); if (!uniq[k]) uniq[k] = s; }
    const all = Object.values(uniq), small = all.filter(s => s.fs * r.S * s.sc < 11.95 && s.t.trim());
    ok(`${tag}: every canvas text in a live match is 12 CSS px or more (${all.length} texts)`, small.length === 0 && all.length >= 10, JSON.stringify(small.slice(0, 6).map(s => s.t + ' ' + (s.fs * r.S).toFixed(1))));
    /* the HUD labels: the header (above the board) and the rail (x 380 on), boxes never overlap */
    const hud = all.filter(s => s.t.trim() && (s.y < 112 || s.x0 >= 380) && s.y < 840), box = s => [s.x0, s.y - 0.78 * s.fs * s.sc, s.x0 + s.w, s.y + 0.2 * s.fs * s.sc], hit = [];
    for (let i = 0; i < hud.length; i++) for (let j = i + 1; j < hud.length; j++) { const a = box(hud[i]), c = box(hud[j]);
      if (a[0] < c[2] - 1 && c[0] < a[2] - 1 && a[1] < c[3] - 1 && c[1] < a[3] - 1) hit.push(hud[i].t + ' / ' + hud[j].t); }
    ok(`${tag}: no two HUD labels overlap (${hud.length} labels in the header and the rail)`, hit.length === 0 && hud.length >= 6, JSON.stringify(hit.slice(0, 6)));
    const tierTxt = all.find(s => s.t === 'DEF' && s.x0 >= 382 && s.y >= 748 && s.y <= 832);
    ok(`${tag}: the HYPE readout names its tier (DEF) with three pips in the rail, and danger draws its X`, r.hud.tier === 'DEF' && r.hud.pips === 3 && !!tierTxt && r.hud.dangerX > 0, JSON.stringify({ tier: r.hud.tier, pips: r.hud.pips, at: tierTxt && [tierTxt.x0, tierTxt.y], x: r.hud.dangerX }));
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/match-${w}x${h}${pre ? '-bigtext' : ''}.png` });
    ok(`${tag}: no page errors`, o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  // the overlays at 360: the intro card, the countdown, the outro
  { const o = await open(360, 780); const res = {};
    await o.p.evaluate(() => window.CW_DEV.intro(6)); await sleep(150); res.intro = await spy(o.p, 300); if (SHOTS) await o.p.screenshot({ path: `${OUT}/intro-360.png` });
    await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.phase = 'count'; M.t = 0; M.count = 3; }); await sleep(100); res.count = await spy(o.p, 250);
    await o.p.evaluate(() => { window.CW_DEV.beginStage(6); }); for (let w = 0; w < 80; w++) { await sleep(100); if (await o.p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
    await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.of.dead = true; M.judge = { of: true }; }); await sleep(3200); res.outro = await spy(o.p, 400);
    const small = []; for (const k of ['intro', 'count', 'outro']) for (const s of res[k].seen) if (s.t.trim() && s.fs * res[k].S * s.sc < 11.95) small.push(k + ': ' + s.t.slice(0, 24) + ' ' + (s.fs * res[k].S).toFixed(1));
    ok('at 360 the intro card, the countdown and the outro draw every text 12 CSS px or more', small.length === 0 && res.intro.seen.length > 0 && res.outro.seen.length > 0, JSON.stringify(small.slice(0, 6)) + ' counts ' + [res.intro.seen.length, res.count.seen.length, res.outro.seen.length]);
    ok('overlays: no page errors', o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  // [B] the menus at 200 percent text: nothing spills sideways
  { const o = await open(360, 780); const spill = await o.p.evaluate(async () => { document.getElementById('stage').style.setProperty('--tx', '2'); const out = [];
      for (const scr of ['s-title', 's-select', 's-how', 's-set', 's-vs']) { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); if (scr === 's-select' && !document.querySelector('#ladder .foe')) document.getElementById('b-campaign').click(); document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); const sc = document.getElementById(scr); sc.classList.add('on');
        await new Promise(r => setTimeout(r, 60));
        for (const el of sc.querySelectorAll('.pad, .btn, .settingline, .foe, .helprow, .ribbon, #ladder')) { const cs = getComputedStyle(el); if (cs.display === 'none') continue; if (el.scrollWidth > el.clientWidth + 1) out.push(scr + ' ' + (el.id || el.className) + ' ' + el.scrollWidth + '>' + el.clientWidth); } }
      return out; });
    ok('at 200 percent text no menu row, button or column spills sideways at 360', spill.length === 0, JSON.stringify(spill.slice(0, 8))); await o.p.close(); }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p3b: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
