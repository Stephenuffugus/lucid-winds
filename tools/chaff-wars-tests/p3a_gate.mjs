// Pop N Lock Part 3a gate (v1.11): the page in real px, the comfort settings, the copy.
// [A] the page's own shake() and hap() in a node vm (Reduce motion and Screen shake stop the shake; Vibration stops hap);
//     the source's player copy has no exclamation mark. [B] the page at 412 x 915, 375 x 812, 360 x 780 and a phone in
//     Safari with its bars (390 x 664): every line of copy on every screen renders 12 CSS px or more, every control 48 px
//     (settings rows 56), the back button's zone 48 px; real taps on a settings row's LABEL flip it; Reduce motion, Larger
//     text, the music hold in a match, the safe area kept out of the stage; no exclamation mark or dash in the text a
//     player reads. [C] looks: the settings and the title at 360, the settings with Larger text.
// node p3a_gate.mjs [pageFile] [outDir] [noShots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/';
const PAGE = process.argv[2] || 'index.html', OUT = process.argv[3] || '/tmp/claude-1000/pnl/p3a', SHOTS = !process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(DIR + PAGE, 'utf8');
let pass = 0, fail = 0;
function ok(name, cond, detail) { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + '  -> ' + String(detail).slice(0, 700)); } }
function grab(name) { const i = SRC.indexOf('function ' + name + '('); if (i < 0) throw new Error('no ' + name);
  let j = SRC.indexOf('{', i), d = 0, k = j; for (; k < SRC.length; k++) { const c = SRC[k]; if (c === '{') d++; else if (c === '}') { d--; if (d === 0) break; } } return SRC.slice(i, k + 1); }

console.log('[A] the page\'s own functions, in a node vm; the copy in the source');
{ const run = (calm, shakeOn) => { const ctx = { SHAKE: { t: 0, dur: 1, amp: 0 }, CALM: calm, SET: { shake: shakeOn } }; vm.createContext(ctx); vm.runInContext(grab('shake'), ctx); ctx.shake(6, 200); return ctx.SHAKE.t; };
  const both = run(false, true), calm = run(true, true), off = run(false, false);
  ok('the screen shakes by default, and neither Reduce motion nor Screen shake off lets it', both === 200 && calm === 0 && off === 0, JSON.stringify({ both, calm, off })); }
{ const run = (on) => { const calls = []; const ctx = { SET: { haptics: on }, navigator: { vibrate: ms => calls.push(ms) } }; vm.createContext(ctx); vm.runInContext(grab('hap'), ctx); ctx.hap(16); return calls.length; };
  ok('Vibration off stops every buzz (all ten go through hap)', run(true) === 1 && run(false) === 0, JSON.stringify({ on: run(true), off: run(false) })); }
{ /* player copy in the script: a quoted string with letters that carries an exclamation mark */
  const js = SRC.replace(/<style[\s\S]*?<\/style>/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const bangs = (js.match(/'[^'\n]*[A-Za-z][^'\n]*'/g) || []).concat(js.match(/"[^"\n]*[A-Za-z][^"\n]*"/g) || []).filter(q => /[A-Za-z][^'"]*!/.test(q) && !/!=|![a-zA-Z(._$]|\|\||&&/.test(q));
  ok('no quoted player string in the page carries an exclamation mark (the floats, the share lines, Copied)', bangs.length === 0, JSON.stringify(bangs.slice(0, 8))); }

console.log('[B] the page');
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
async function open(w, h, pre) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((pre) => { try { localStorage.setItem('lwfb_explained', '1'); if (pre) localStorage.setItem('cw_set', pre); } catch (e) {}
    if (!pre) { try { localStorage.removeItem('cw_set'); } catch (e) {} }   /* one browser shares localStorage: a page with no settings starts clean */
  }, pre || null);
  await p.goto(`http://127.0.0.1:${PORT}/${PAGE}?cwdev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete', { timeout: 60000 });
  const cdp = await p.target().createCDPSession();
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  return { p, errs, T }; }
/* every visible element on a screen that holds its own text, and every control, measured as RENDERED px */
const measure = (p, screen) => p.evaluate((screen) => {
  if (screen === 's-select' && !document.querySelector('#ladder .foe')) document.getElementById('b-campaign').click();   /* setup only: builds the ladder rows to measure */
  document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); const sc = document.getElementById(screen); sc.classList.add('on');
  const S = window.CW_DEV.comfort().s, out = { small: [], tiny: [], rows: [], texts: 0, controls: 0, bang: [], dash: [] };
  const inStage = el => !!el.closest('#stage');
  for (const el of sc.querySelectorAll('*')) { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (own) { out.texts++; const fsz = parseFloat(cs.fontSize) * (inStage(el) ? S : 1); if (fsz < 11.95) out.small.push(own.slice(0, 30) + ' ' + fsz.toFixed(1));
      if (/!/.test(own)) out.bang.push(own.slice(0, 40)); if (/[‐-―]|[A-Za-z]-[A-Za-z]| - /.test(own)) out.dash.push(own.slice(0, 40)); }
    const ctl = el.matches('button, input, .foe, .settingline, .swsback') ;
    if (ctl) { out.controls++; const need = el.matches('.settingline') ? 55.5 : 47.5; if (r.height < need || r.width < 47.5) out.tiny.push((el.id || el.className || el.tagName) + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0)); } }
  return out; }, screen);
try {
  await sleep(500);
  const sizes = [[412, 915], [375, 812], [360, 780], [390, 664]];
  for (const [w, h] of sizes) { const o = await open(w, h); const bad = {}, seen = {};
    for (const scr of ['s-title', 's-select', 's-how', 's-set', 's-vs', 's-go']) { const m = await measure(o.p, scr); seen[scr] = m.texts + '/' + m.controls;
      if (m.small.length || m.tiny.length || m.texts < 2 || m.controls < 1) bad[scr] = { small: m.small.slice(0, 4), tiny: m.tiny.slice(0, 4), texts: m.texts, controls: m.controls }; }
    if (w === 412) console.log('     measured (texts/controls): ' + JSON.stringify(seen));
    ok(`${w}x${h}: every line of copy on every screen is 12 CSS px or more, every control 48 (settings rows 56)`, Object.keys(bad).length === 0, JSON.stringify(bad));
    await o.p.close(); }
  const { p, errs, T } = await open(412, 915);
  // the copy a player reads: no exclamation mark, no dash
  { const all = { bang: [], dash: [] }; for (const scr of ['s-title', 's-select', 's-how', 's-set', 's-vs', 's-go']) { const m = await measure(p, scr); all.bang.push(...m.bang); all.dash.push(...m.dash); }
    ok('no exclamation mark and no dash in the text on any screen', all.bang.length === 0 && all.dash.length === 0, JSON.stringify(all)); }
  // a real tap on a settings row's LABEL flips it; Reduce motion cycles and calms the page; Larger text grows the copy
  { await p.evaluate(() => { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); document.getElementById('s-set').classList.add('on'); });
    const at = sel => p.evaluate(sel => { const el = [...document.querySelectorAll('#s-set .settingline > span')].find(e => e.textContent.indexOf(sel) === 0); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return [r.left + 8, r.top + r.height / 2]; }, sel);
    const tap = async (xy, id) => { await T('touchStart', [[xy[0], xy[1], id]]); await sleep(40); await T('touchEnd', [[xy[0], xy[1], id]]); await sleep(150); };
    const s0 = await p.evaluate(() => window.CW_DEV.comfort().set.sound); await tap(await at('Sound'), 51); const s1 = await p.evaluate(() => window.CW_DEV.comfort().set.sound);
    const fs0 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#s-set .settingline > span')).fontSize));
    await tap(await at('Larger text'), 52); const fs1 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#s-set .settingline > span')).fontSize));
    await tap(await at('Reduce motion'), 53); const rm = await p.evaluate(() => ({ calm: window.CW_DEV.comfort().calm, cls: document.body.classList.contains('calm'), val: document.getElementById('tg-motion').textContent }));
    ok('a real tap on a settings row\'s label flips it (only the switch answered before)', s1 === !s0, JSON.stringify({ s0, s1 }));
    ok('Larger text grows the copy by a quarter', Math.abs(fs1 / fs0 - 1.25) < 0.02, JSON.stringify({ fs0, fs1 }));
    ok('Reduce motion cycles to On and calms the page (the game\'s flag and the page\'s class)', rm.calm === true && rm.cls && rm.val === 'On', JSON.stringify(rm));
    await tap(await at('Reduce motion'), 54); await tap(await at('Reduce motion'), 55); await tap(await at('Larger text'), 56); await tap(await at('Sound'), 57); }
  // the back button's zone in a match: a 48 CSS px square from its corner answers
  { await p.evaluate(() => window.CW_DEV.beginStage(0)); for (let w = 0; w < 80; w++) { await sleep(100); if (await p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
    const z = await p.evaluate(() => { const b = document.getElementById('b-home'), st = document.getElementById('stage').getBoundingClientRect(); const x = st.left + 47, y = st.top + 47, el = document.elementFromPoint(x, y); return { hit: el && el.id, x, y }; });
    ok('in a match the back button answers anywhere in a 48 CSS px square at the stage\'s corner', z.hit === 'b-home', JSON.stringify(z));
    /* the fleet's song card and pill: hidden while the match runs, untouched (never held, which loses the song), back on the menus */
    const mu = await p.evaluate(async () => { const mk = id => { const d = document.createElement('div'); d.id = id; d.textContent = 'song'; d.style.cssText = 'position:fixed;left:8px;bottom:8px;display:block'; document.body.appendChild(d); return d; };
      const card = mk('sws-music-card'), pill = mk('sws-music-pill'); const inMatch = [getComputedStyle(card).display, getComputedStyle(pill).display];
      document.body.classList.remove('playing'); const onMenu = [getComputedStyle(card).display, getComputedStyle(pill).display]; document.body.classList.add('playing'); card.remove(); pill.remove(); return { inMatch, onMenu }; });
    ok('a match hides the fleet\'s song card and pill off the tray, and the menus show them again (nothing is closed or lost)', mu.inMatch.every(d => d === 'none') && mu.onMenu.every(d => d === 'block'), JSON.stringify(mu));
    await p.evaluate(() => window.CW_DEV.match() && 0); }
  // the safe area: a 40 px top inset keeps the stage (and the back button in it) below the notch
  { const o375 = await open(375, 667); await o375.p.evaluate(() => window.CW_DEV.beginStage(0)); for (let w = 0; w < 80; w++) { await sleep(100); if (await o375.p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
    const sa = await o375.p.evaluate(async () => { const st = document.createElement('style'); st.textContent = '#sat-probe{padding-top:40px !important}'; document.head.appendChild(st); window.dispatchEvent(new Event('resize'));
      await new Promise(r => setTimeout(r, 100)); const a = document.getElementById('stage').getBoundingClientRect().top, bh = document.getElementById('b-home').getBoundingClientRect().top; st.remove(); window.dispatchEvent(new Event('resize')); return { stageTop: a, home: bh }; });
    await o375.p.close();
    ok('a 40 px top safe area keeps the stage and the back button below it (a 375 x 667 match, where the stage meets the top)', sa.stageTop >= 39.5 && sa.home >= 40, JSON.stringify(sa)); }
  { const bt = await p.evaluate(() => ({ t: document.getElementById('b-bgm').textContent, a: document.getElementById('b-bgm').getAttribute('aria-pressed') }));
    ok('the 80s beat button says what a tap does, in words (Play beat), and its state for a screen reader', /Play beat/.test(bt.t) && bt.a === 'false', JSON.stringify(bt)); }
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
  /* the back button's zone at 360 wide, where the old clipped zone reached only 46.7 CSS px */
  { const o = await open(360, 780); await o.p.evaluate(() => window.CW_DEV.beginStage(0)); for (let w = 0; w < 80; w++) { await sleep(100); if (await o.p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
    const z = await o.p.evaluate(() => { const st = document.getElementById('stage').getBoundingClientRect(); const el = document.elementFromPoint(st.left + 47.5, st.top + 47.5); return el && el.id; }); await o.p.close();
    ok('at 360 wide the back button answers 47.5 CSS px from the stage\'s corner (its old zone was clipped to 46.7)', z === 'b-home', z); }
  { const o = await open(320, 460); await o.p.evaluate(() => window.CW_DEV.beginStage(0)); for (let w = 0; w < 80; w++) { await sleep(100); if (await o.p.evaluate(() => window.CW_DEV.match().phase === 'fight')) break; }
    const zw = await o.p.evaluate(() => { const st = document.getElementById('stage').getBoundingClientRect(), S = window.CW_DEV.comfort().s; const el = document.elementFromPoint(st.left + 40 * S, st.top + 116 * S); return { hit: el && el.id, S }; }); await o.p.close();
    ok('on a tiny stage (320 x 460) the back zone stops above the well: a tap in the top row is the board\'s', zw.hit === 'game', JSON.stringify(zw)); }
  { const o = await open(360, 780, JSON.stringify({ bigText: true })); const lc = await o.p.evaluate(() => { const back = document.getElementById('sws-back').getBoundingClientRect().bottom; let top = 1e9;
      for (const el of document.querySelectorAll('#s-title > .pad > *')) { const cs = getComputedStyle(el); if (cs.display === 'none' || el.getBoundingClientRect().height < 4 || el.style.flex) continue; top = Math.min(top, el.getBoundingClientRect().top); } return { back, top }; }); await o.p.close();
    ok('with Larger text at 360 the title\'s logo starts below the back button (it covered the logo)', lc.top >= lc.back, JSON.stringify(lc)); }
  { const o = await open(412, 915); const kb = await o.p.evaluate(() => { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); document.getElementById('s-set').classList.add('on');
      const row = document.getElementById('tg-sound').parentNode; row.focus(); return { role: row.getAttribute('role'), tab: row.getAttribute('tabindex'), checked: row.getAttribute('aria-checked'), was: window.CW_DEV.comfort().set.sound, focused: document.activeElement === row }; });
    await o.p.keyboard.press('Enter'); await sleep(100); const after = await o.p.evaluate(() => ({ now: window.CW_DEV.comfort().set.sound, checked: document.getElementById('tg-sound').parentNode.getAttribute('aria-checked') })); await o.p.close();
    ok('a settings row is a switch a keyboard and a screen reader can use (role, focus, Enter, aria-checked)', kb.role === 'switch' && kb.tab === '0' && kb.focused && after.now === !kb.was && after.checked === String(after.now), JSON.stringify({ kb, after })); }
  /* a stored Larger text and Reduce motion apply on the first load, before any screen change */
  { const o = await open(412, 915, JSON.stringify({ bigText: true, motion: 'on' })); const at = await o.p.evaluate(() => ({ big: document.body.classList.contains('bigtext'), calm: document.body.classList.contains('calm') })); await o.p.close();
    ok('stored Larger text and Reduce motion are applied on the first load (they waited for a screen change)', at.big && at.calm, JSON.stringify(at)); }
  if (SHOTS) { await p.close();
    for (const [w, h, scr, pre, name] of [[360, 780, 's-set', null, 'settings-360'], [360, 780, 's-title', null, 'title-360'], [360, 780, 's-set', JSON.stringify({ bigText: true }), 'settings-bigtext-360'], [360, 780, 's-how', null, 'how-360']]) {
      const o = await open(w, h, pre); await o.p.evaluate((scr) => { document.querySelectorAll('.screen').forEach(e => e.classList.remove('on')); document.getElementById(scr).classList.add('on'); }, scr);
      await sleep(300); await o.p.screenshot({ path: `${OUT}/${name}.png` }); await o.p.close(); } }
} finally { await b.close(); srv.kill(); }
console.log(`\n=== pop n lock p3a: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
