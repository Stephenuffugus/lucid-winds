// Pop N Lock Part 3b gate (v1.11): the canvas HUD in real px and the launch gate's sweep.
// [A] a live campaign match with six digit scores on both sides at 412 x 915, 375 x 812, 360 x 780, a phone in Safari with
//     its bars (390 x 664), Larger text, and an iPhone SE in Safari (375 x 548) with and without Larger text: every canvas
//     text renders 12 CSS px or more, no two HUD labels overlap and the header ends left of the rival card, the score is
//     never smaller than YOUR PLOT, the rival plate's lines end above the rival's frame, every rival name fits its card,
//     the HYPE readout names its tier with pips, the danger X shows over the pair that spawns on it. [B] the intro card,
//     the countdown and the outro at 360 draw 12 CSS px or more; at 390 x 664 with Larger text the intro's hint sits
//     clear of every pest's taunt and the outro's clear of the longest. [C] the menus at 200 percent text spill nowhere;
//     at 412 x 915 the title and the result keep their button rows side by side and the title fits without scrolling.
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
const BIG = JSON.stringify({ bigText: true });
/* the fail watch runs one block (P3B_BLOCKS=A|B|C) and, in A, the sizes it names (P3B_SWEEP=412x915,375x548b; b = Larger text) */
const BLOCKS = process.env.P3B_BLOCKS || 'ABC', ONLY = process.env.P3B_SWEEP ? process.env.P3B_SWEEP.split(',') : null;
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h, pre) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((pre) => { try { localStorage.setItem('lwfb_explained', '1'); if (pre) localStorage.setItem('cw_set', pre); else localStorage.removeItem('cw_set'); } catch (e) {} }, pre || null);
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
  return { p, errs }; }
const toFight = async p => { for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; } };
async function match(p, stage) { await p.evaluate(n => window.CW_DEV.beginStage(n), stage); await toFight(p);
  await p.evaluate(() => { const M = window.CW_DEV.match(); M.pf.gravMs = 1e9; M.of.react = 1e9; M.pf.pending = 14; M.of.pending = 13; M.pf.cancelN = 6; M.pf.cancelT = 1e9;
    M.pf.hype = 70; M.pf.hypeTier = 3; M.pf.flashDanger = 1e9; M.of.flashDanger = 1e9; M.pf.score = 123456; M.of.score = 123456;
    if (M.pf.cur) { M.pf.cur.r = 1; M.pf.cur.c = 2; M.pf.cur.rot = 0; }   /* the pair where it spawns: on the danger X's cell */
    M.pf.floats.push({ x: 0, y: 0, txt: 'FRESH x2', life: 50, big: true, fld: M.pf }); M.of.floats.push({ x: 0, y: 0, txt: 'DENIED', life: 50, big: true, fld: M.of }); }); }
/* every fillText for a while: its text, size, place and box (from measureText, the align and a maxWidth that narrows it) */
const spy = (p, ms) => p.evaluate(async (ms) => { const c2 = document.getElementById('game').getContext('2d'), orig = c2.fillText, seen = [];
  /* floats at their resting size (life under 0.82 has no punch), so a small float cannot hide behind its 1.5x pop */
  try { const M = window.CW_DEV.match(); for (const f of [M.pf, M.of]) if (f && f.floats) for (const fl of f.floats) if (fl.life > 0.81) fl.life = 0.81; } catch (e) {}
  c2.fillText = function (t, x, y, mw) { const m = /(\d+(?:\.\d+)?)px/.exec(c2.font), fs = m ? +m[1] : 0, w0 = c2.measureText(t).width, w = (mw !== undefined && w0 > mw) ? mw : w0, al = c2.textAlign, tr = c2.getTransform();
    const x0 = (al === 'center' ? x - w / 2 : al === 'right' || al === 'end' ? x - w : x); seen.push({ t: String(t), fs, x0: tr.a * x0 + tr.e, y: tr.d * y + tr.f, w: w * tr.a, sc: tr.a, nar: w0 ? w / w0 : 1 }); return orig.apply(this, arguments); };
  await new Promise(r => setTimeout(r, ms)); c2.fillText = orig; return { seen, S: window.CW_DEV.comfort().s, hud: JSON.parse(JSON.stringify(window.CW_DEV.hud())) }; }, ms);
const box = s => [s.x0, s.y - 0.78 * s.fs * s.sc, s.x0 + s.w, s.y + 0.2 * s.fs * s.sc];
const over = (a, c) => a[0] < c[2] - 1 && c[0] < a[2] - 1 && a[1] < c[3] - 1 && c[1] < a[3] - 1;
try {
  await sleep(500);
  if (BLOCKS.includes('A')) console.log('[A] a live match');
  const sweep = [[412, 915, null], [375, 812, null], [360, 780, null], [390, 664, null], [360, 780, BIG], [375, 548, null], [375, 548, BIG]];
  for (const [w, h, pre] of sweep) { if (!BLOCKS.includes('A') || (ONLY && !ONLY.includes(`${w}x${h}${pre ? 'b' : ''}`))) continue; const o = await open(w, h, pre);
    await match(o.p, 3); await sleep(250); const r = await spy(o.p, 450);
    const tag = `${w}x${h}${pre ? ' Larger text' : ''}`;
    const uniq = {}; for (const s of r.seen) { const k = s.t + '|' + Math.round(s.x0) + '|' + Math.round(s.y); if (!uniq[k]) uniq[k] = s; }
    const all = Object.values(uniq), small = all.filter(s => s.fs * r.S * s.sc < 11.95 && s.t.trim());
    ok(`${tag}: every canvas text in a live match is 12 CSS px or more (${all.length} texts)`, small.length === 0 && all.length >= 10, JSON.stringify(small.slice(0, 6).map(s => s.t + ' ' + (s.fs * r.S).toFixed(1))));
    /* the HUD: the header, the rail above the rival's board and the HYPE plate (the boards' floats rise over the boards by design) */
    const hud = all.filter(s => s.t.trim() && (s.y < 112 || (s.x0 >= 380 && (s.y < 340 || s.y >= 740))) && s.y < 840), hit = [];
    for (let i = 0; i < hud.length; i++) for (let j = i + 1; j < hud.length; j++) if (over(box(hud[i]), box(hud[j]))) hit.push(hud[i].t + ' / ' + hud[j].t);
    const pastCard = all.filter(s => s.t.trim() && s.y < 112 && s.x0 + s.w > 379);
    ok(`${tag}: no two HUD labels overlap and the header ends left of the rival card (${hud.length} labels)`, hit.length === 0 && pastCard.length === 0 && hud.length >= 6, JSON.stringify({ hit: hit.slice(0, 6), pastCard: pastCard.map(s => s.t + ' ' + (s.x0 + s.w).toFixed(0)) }));
    const yp = all.find(s => s.t === 'YOUR PLOT'), sc = all.find(s => s.y < 112 && Math.abs(s.x0 - 66) < 1 && /^[\d.,\s  ]+$/.test(s.t) && s.t.replace(/\D/g, '') === '123456');
    ok(`${tag}: the score is never smaller than its label, YOUR PLOT`, !!yp && !!sc && sc.fs >= yp.fs, JSON.stringify({ yp: yp && yp.fs, score: sc && sc.fs }));
    const plate = all.filter(s => s.t.trim() && s.x0 >= 382 && s.y > 280 && s.y < 420), foot = r.hud.ofY - 15.5, low = plate.filter(s => s.y + 0.2 * s.fs * s.sc > foot + 0.5);
    ok(`${tag}: the rival plate's lines end above the rival's frame (its top band at ${foot}${r.hud.rTall ? ', the score on its own line' : ''})`, plate.length >= 2 && low.length === 0, JSON.stringify({ low: low.map(s => s.t + ' ' + (s.y + 0.2 * s.fs * s.sc).toFixed(1)), n: plate.length }));
    const rv = plate.find(s => s.t === 'RIVAL'), rs = plate.find(s => s.t.replace(/\D/g, '') === '123456');
    ok(`${tag}: the rival plate names its rival beside or over a six digit score`, !!rv && !!rs && !over(box(rv), box(rs)), JSON.stringify({ rival: !!rv, score: !!rs }));
    const names = await o.p.evaluate(() => { const out = []; for (let i = 0; window.CW_DEV.words(i); i++) { const f = window.CW_DEV.nameFit(i); out.push({ nm: window.CW_DEV.words(i).nm, f: f.f, n: f.L.length, w: Math.round(f.w), ob: f.ob }); } return { out, flo: Math.ceil(12 / window.CW_DEV.comfort().s) }; });
    const nb = names.out.filter(x => x.n > 2 || x.f < names.flo || (x.w > 146 && x.f > names.flo) || x.w > 146 / 0.75 || x.ob > 72);
    const tight = names.out.filter(x => x.w > 146).map(x => x.nm + ' ' + Math.round(14600 / x.w) + '%');
    ok(`${tag}: every rival name fits its card on two lines at 12 CSS px or more, shrunk before it is narrowed, never under 75 percent (${names.out.length} names${tight.length ? '; narrowed: ' + tight.join(', ') : ''})`, names.out.length >= 10 && nb.length === 0, JSON.stringify(nb.slice(0, 4)));
    const tierTxt = all.find(s => s.t === 'DEF' && s.x0 >= 382 && s.y >= 748 && s.y <= 832);
    ok(`${tag}: the HYPE readout names its tier (DEF) with three pips in the rail, and danger draws its X`, r.hud.tier === 'DEF' && r.hud.pips === 3 && !!tierTxt && r.hud.dangerX > 0, JSON.stringify({ tier: r.hud.tier, pips: r.hud.pips, at: tierTxt && [tierTxt.x0, tierTxt.y], x: r.hud.dangerX }));
    /* the X's centre (the spawn cell's, column 2 row 1 of the board at 16,112 in 58 px cells) over the pair that sits there */
    const xp = await o.p.evaluate(() => { const cv = document.getElementById('game'), k = cv.width / 540, d = cv.getContext('2d').getImageData(Math.round(161 * k), Math.round(141 * k), 1, 1).data; return [d[0], d[1], d[2]]; });
    ok(`${tag}: the danger X shows over the pair that spawns on it (its centre reads the X's cream)`, Math.abs(xp[0] - 240) <= 24 && Math.abs(xp[1] - 233) <= 24 && Math.abs(xp[2] - 216) <= 24, JSON.stringify(xp));
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/match-${w}x${h}${pre ? '-bigtext' : ''}.png` });
    if (w === 412) { await o.p.evaluate(() => { window.CW_DEV.match().of.score = 12345678; }); const r7 = await spy(o.p, 200);   /* longer than the six digits the plate is laid out for */
      const rv7 = r7.seen.filter(s => s.t === 'RIVAL'), rs7 = r7.seen.filter(s => s.t.replace(/\D/g, '') === '12345678' && s.x0 >= 382), hit7 = rv7.some(a => rs7.some(c => over(box(a), box(c))));
      ok(`${tag}: a rival score too long to sit beside RIVAL never prints over it (RIVAL steps aside)`, rs7.length > 0 && !hit7 && rs7.every(c => c.x0 >= 387), JSON.stringify({ rival: rv7.length, score: rs7.length, hit7, x0: rs7[0] && rs7[0].x0 })); }
    ok(`${tag}: no page errors`, o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  if (BLOCKS.includes('B')) console.log('[B] the overlays');
  if (BLOCKS.includes('B')) { const o = await open(360, 780); const res = {};
    await o.p.evaluate(() => window.CW_DEV.intro(6)); await sleep(150); res.intro = await spy(o.p, 300); if (SHOTS) await o.p.screenshot({ path: `${OUT}/intro-360.png` });
    await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.phase = 'count'; M.t = 0; M.count = 3; }); await sleep(100); res.count = await spy(o.p, 250);
    await o.p.evaluate(() => { window.CW_DEV.beginStage(6); }); await toFight(o.p);
    await o.p.evaluate(() => { const M = window.CW_DEV.match(); M.of.dead = true; M.judge = { of: true }; }); await sleep(3200); res.outro = await spy(o.p, 400);
    const small = []; for (const k of ['intro', 'count', 'outro']) for (const s of res[k].seen) if (s.t.trim() && s.fs * res[k].S * s.sc < 11.95) small.push(k + ': ' + s.t.slice(0, 24) + ' ' + (s.fs * res[k].S).toFixed(1));
    ok('at 360 the intro card, the countdown and the outro draw every text 12 CSS px or more', small.length === 0 && res.intro.seen.length > 0 && res.outro.seen.length > 0, JSON.stringify(small.slice(0, 6)) + ' counts ' + [res.intro.seen.length, res.count.seen.length, res.outro.seen.length]);
    ok('overlays: no page errors', o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  /* Larger text at a phone in Safari and at an iPhone SE in Safari: every pest's intro taunt, and the outro line that wraps the most */
  for (const [w, h] of [[390, 664], [375, 548]]) { if (!BLOCKS.includes('B')) break; const o = await open(w, h, BIG), tag = `${w}x${h} Larger text`; const bad = []; let n = 0, most = 0;
    while (await o.p.evaluate(k => !!window.CW_DEV.words(k), n)) n++;
    for (let i = 0; i < n; i++) { await o.p.evaluate(k => window.CW_DEV.intro(k), i); await sleep(120); const r = await spy(o.p, 160);
      const hint = r.seen.find(s => s.t === 'tap to start'); if (!hint) { bad.push(i + ': no hint'); continue; }
      const lines = r.seen.filter(s => s !== hint && s.t !== 'tap to start' && s.y > 600 && s.y <= hint.y + 1); most = Math.max(most, new Set(lines.map(s => Math.round(s.y))).size);
      for (const l of lines) if (over(box(l), box(hint))) { bad.push(i + ': ' + l.t.slice(0, 24)); break; } }
    ok(`${tag}: the intro's hint sits clear of the taunt for every pest (${n} pests, up to ${most} taunt lines)`, n >= 10 && bad.length === 0, JSON.stringify(bad.slice(0, 6)));
    /* the outro: the line that wraps the most, the pest's losing line after a win or its taunt after a loss */
    const pick = await o.p.evaluate(() => { const c = document.getElementById('game').getContext('2d'); c.font = 'italic ' + window.CW_DEV.lab(17) + 'px system-ui'; let best = -1, bi = 0, bk = 'lose';
      const wraps = t => { const ws = ('"' + t + '"').split(' '); let line = '', k = 1; for (const w of ws) { const tt = line ? line + ' ' + w : w; if (line && c.measureText(tt).width > 400) { k++; line = w; } else line = tt; } return k; };
      for (let i = 0; window.CW_DEV.words(i); i++) for (const key of ['lose', 'taunt']) { const k = wraps(window.CW_DEV.words(i)[key]); if (k > best) { best = k; bi = i; bk = key; } }
      return { bi, best, bk }; });
    await o.p.evaluate(k => window.CW_DEV.beginStage(k), pick.bi); await toFight(o.p);
    await o.p.evaluate(who => { const M = window.CW_DEV.match(); M[who].dead = true; M.judge = {}; M.judge[who] = true; }, pick.bk === 'lose' ? 'of' : 'pf'); await sleep(3400); const r = await spy(o.p, 400);
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/outro-${w}x${h}-bigtext.png` });
    const said = '"' + (await o.p.evaluate((k, key) => window.CW_DEV.words(k)[key], pick.bi, pick.bk)) + '"';   /* the pest's own line, not the dimmed HUD under it */
    const hint = r.seen.find(s => s.t === 'tap to continue'), lines = hint ? r.seen.filter(s => s.t.length > 2 && said.indexOf(s.t) >= 0 && s.y > 690) : [];
    const hitO = lines.filter(l => over(box(l), box(hint))).map(l => l.t.slice(0, 24));
    ok(`${tag}: the outro's hint sits clear of the pest's line (stage ${pick.bi + 1}, its ${pick.bk === 'lose' ? 'losing line after a win' : 'taunt after a loss'}, ${pick.best} lines)`, !!hint && new Set(lines.map(l => Math.round(l.y))).size >= pick.best && hitO.length === 0, JSON.stringify({ hint: !!hint, lines: lines.length, hitO }));
    ok(`${tag} overlays: no page errors`, o.errs.length === 0, JSON.stringify(o.errs)); await o.p.close(); }
  if (BLOCKS.includes('C')) console.log('[C] the menus');
  if (BLOCKS.includes('C')) { const o = await open(360, 780); const spill = await o.p.evaluate(async () => { document.getElementById('stage').style.setProperty('--tx', '2'); const out = [];
      for (const scr of ['s-title', 's-select', 's-how', 's-set', 's-vs']) { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); if (scr === 's-select' && !document.querySelector('#ladder .foe')) document.getElementById('b-campaign').click(); document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); const sc = document.getElementById(scr); sc.classList.add('on');
        await new Promise(r => setTimeout(r, 60));
        for (const el of sc.querySelectorAll('.pad, .btn, .settingline, .foe, .helprow, .ribbon, #ladder')) { const cs = getComputedStyle(el); if (cs.display === 'none') continue; if (el.scrollWidth > el.clientWidth + 1) out.push(scr + ' ' + (el.id || el.className) + ' ' + el.scrollWidth + '>' + el.clientWidth); } }
      return out; });
    ok('at 200 percent text no menu row, button or column spills sideways at 360', spill.length === 0, JSON.stringify(spill.slice(0, 8))); await o.p.close(); }
  for (const pre of [null, BIG]) { if (!BLOCKS.includes('C')) break; const o = await open(412, 915, pre);
    const t = await o.p.evaluate(async () => { const out = { rows: [], scroll: -1 };
      for (const scr of ['s-title', 's-go']) { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); const sc = document.getElementById(scr); sc.classList.add('on'); await new Promise(r => setTimeout(r, 80));
        for (const row of sc.querySelectorAll('.row')) { const bs = [...row.children].filter(e => e.classList.contains('btn') && getComputedStyle(e).display !== 'none'); if (bs.length > 1) out.rows.push(scr + ':' + bs.map(e => Math.round(e.getBoundingClientRect().top)).join('/')); }
        if (scr === 's-title') { const pad = sc.querySelector('.pad'); out.scroll = pad.scrollHeight - pad.clientHeight; } }
      document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); document.getElementById('s-title').classList.add('on'); return out; });
    const split = t.rows.filter(rw => new Set(rw.split(':')[1].split('/')).size > 1);
    if (SHOTS) await o.p.screenshot({ path: `${OUT}/title-412${pre ? '-bigtext' : ''}.png` });
    ok(`412x915${pre ? ' Larger text' : ''}: the title and the result keep their button rows side by side, and the title fits without scrolling (${t.rows.length} rows)`, t.rows.length >= 3 && split.length === 0 && t.scroll >= 0 && t.scroll <= 1, JSON.stringify({ split, scroll: t.scroll, rows: t.rows }));
    await o.p.close(); }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p3b: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
