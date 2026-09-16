/* Gamepad gate for Jumping Jimothy (v2, 2026-09-16).
   v1 of this gate passed for two weeks while every pad Stephen could buy was broken: it only
   ever held an Xbox pad, and it only moved the ring once on a screen with nothing to scroll.
   Stephen's first real install (a PDP Afterglow Switch pad on Windows) found Y selecting,
   B going nowhere, a dead D-pad, a cursor that could not leave the screen, and lag.
   See plans/jimothy/HANDOFF-STEAM-PAD-SEP16.md.

   This boots the REAL page with ?shtest=1, replaces navigator.getGamepads before any script
   runs, and drives the REAL rAF poll by holding buttons for a few frames. Three pads:
     RAW   the Afterglow as Chromium on Windows reports it: no mapping, buttons Y B A X L R
           ZL ZR - + ..., D-pad on axis 9 as a hat (neutral 9/7), a trigger resting at -1
     XBOX  a standard mapping pad
     NPRO  a Nintendo Pro Controller under the standard mapping (A is on the right, index 1)
   Usage (from satellites/stream-hop): node test/gamepad-check.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
const ROOT = join(new URL('..', import.meta.url).pathname, '..', '..');   // repo root
const PORT = 8968;
const TYPES = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const f = join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  try { const body = readFileSync(f); const ext = (f.match(/\.[a-z]+$/) || [''])[0]; if (TYPES[ext]) r.setHeader('content-type', TYPES[ext]); r.end(body); } catch (e) { r.writeHead(404); r.end(); } }).listen(PORT);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage();
await pg.setViewport({ width: 640, height: 1136 });
const errs = [];
pg.on('pageerror', e => errs.push(e.message));
await pg.evaluateOnNewDocument(() => {
  const btn = () => ({ pressed: false, value: 0, touched: false });
  const HAT_NEUTRAL = 9 / 7;
  window.__pads = {
    RAW: () => ({ id: 'Afterglow Wired Controller for Nintendo Switch (Vendor: 0e6f Product: 0188)', index: 0, connected: true, mapping: '', timestamp: 0,
      axes: [0, 0, 0, 0, 0, -1, 0, 0, 0, HAT_NEUTRAL], buttons: Array.from({ length: 14 }, btn) }),
    XBOX: () => ({ id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0,
      axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, btn) }),
    NPRO: () => ({ id: 'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)', index: 0, connected: true, mapping: 'standard', timestamp: 0,
      axes: [0, 0, 0, 0], buttons: Array.from({ length: 18 }, btn) }),
  };
  window.__pad = window.__pads.RAW();
  navigator.getGamepads = () => [window.__pad];
  /* count every hit test, so a per-frame scan shows up as a number */
  const efp = Document.prototype.elementFromPoint;
  window.__efp = 0;
  Document.prototype.elementFromPoint = function (x, y) { window.__efp++; return efp.call(this, x, y); };
});
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const frames = n => pg.evaluate(n => new Promise(r => { let k = 0; (function f() { if (++k >= n) r(); else requestAnimationFrame(f); })(); }), n);
const wait = ms => new Promise(r => setTimeout(r, ms));
const use = async name => { await pg.evaluate(n => { window.__pad = window.__pads[n](); }, name); await frames(3); };
/* label -> index for the pad in use */
const IDX = {
  RAW: { A: 2, B: 1, X: 3, Y: 0, MINUS: 8, START: 9 },
  XBOX: { A: 0, B: 1, X: 2, Y: 3, MINUS: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 },
  NPRO: { A: 1, B: 0, X: 3, Y: 2, MINUS: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 },
};
let PAD = 'RAW';
async function press(label, hold = 3) {
  const i = IDX[PAD][label];
  await pg.evaluate(i => { window.__pad.buttons[i].pressed = true; window.__pad.buttons[i].value = 1; }, i);
  await frames(hold);
  await pg.evaluate(i => { window.__pad.buttons[i].pressed = false; window.__pad.buttons[i].value = 0; }, i);
  await frames(3);
}
const HAT = { up: -1, right: -1 + 2 * 2 / 7, down: -1 + 4 * 2 / 7, left: -1 + 6 * 2 / 7 };
async function dpad(dir, hold = 3) {
  if (PAD === 'RAW') {
    await pg.evaluate(v => { window.__pad.axes[9] = v; }, HAT[dir]);
    await frames(hold);
    await pg.evaluate(() => { window.__pad.axes[9] = 9 / 7; });
    await frames(3);
  } else await press(dir.toUpperCase(), hold);
}
async function stick(x, y, hold = 3) {
  await pg.evaluate((x, y) => { window.__pad.axes[0] = x; window.__pad.axes[1] = y; }, x, y);
  await frames(hold);
  await pg.evaluate(() => { window.__pad.axes[0] = 0; window.__pad.axes[1] = 0; });
  await frames(3);
}
const screen = () => pg.evaluate(() => { const s = document.querySelector('.screen.on:not(.leaving)'); return s ? s.id : 's-play'; });
const ringInfo = () => pg.evaluate(() => {
  const g = document.getElementById('pad-ring');
  if (!g || g.style.display === 'none') return null;
  const r = g.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const hit = document.elementFromPoint(cx, cy);
  const t = hit && (hit.closest('button,.btn,.lv-cell,.skincard,.settingline,.musrow') || hit);
  return { top: r.top, bottom: r.bottom, h: r.height, vh: innerHeight, id: t && t.id, cls: t && t.className, text: t && (t.textContent || '').trim().slice(0, 30) };
});
const open = async (btnId, scr) => { await pg.evaluate(id => document.getElementById(id).click(), btnId); await wait(700); await frames(4); return (await screen()) === scr; };
const dismissReward = () => pg.evaluate(() => { ['reward-later', 'sws-music-later'].forEach(id => { const b = document.getElementById(id); if (b && b.offsetParent) b.click(); }); });
/* the web title re-offers the daily reward on every visit (Steam has none); setup closes it */
const home = async (keepReward) => { await pg.evaluate(() => SH_DEV.show('s-title')); await wait(700); if (!keepReward) await dismissReward(); await frames(4); };

await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/index.html?shtest=1`, { waitUntil: 'load', timeout: 60000 });
await wait(2500);

console.log('── RAW Switch-style pad (the Afterglow)');
ok(await screen() === 's-splash', 'starts on the splash');
await press('A'); await wait(900);
ok(await screen() !== 's-splash', 'A (raw index 2) leaves the splash (now ' + await screen() + ')');
await home(true);
/* the web build greets a returning player with the daily reward; B must close it WITHOUT claiming */
const rewardUp = await pg.evaluate(() => { const b = document.getElementById('reward-later'); return !!(b && b.offsetParent); });
if (rewardUp) {
  await press('B'); await wait(400);
  const rw = await pg.evaluate(() => { const b = document.getElementById('reward-later'); return !!(b && b.offsetParent); });
  ok(!rw, 'B closes the daily reward with Later');
  await wait(500); await frames(3);
}
/* the web build also slides up a song card from the shared music script (Steam strips it); B says Later to it */
const songUp = await pg.evaluate(() => { const b = document.getElementById('sws-music-later'); return !!(b && b.offsetParent); });
if (songUp) {
  await press('B'); await wait(400);
  ok(await pg.evaluate(() => { const b = document.getElementById('sws-music-later'); return !(b && b.offsetParent); }), 'B closes the web song card with Later');
  await wait(400); await frames(3);
}
let r0 = await ringInfo();
ok(!!r0, 'a cursor appears on the menu without pressing anything  ' + JSON.stringify(r0));
const scr0 = await screen();
await press('Y'); await wait(500);
ok(await screen() === scr0, 'Y (raw index 0) does NOT press anything');
const before = await ringInfo();
await dpad('down');
const afterDown = await ringInfo();
ok(before && afterDown && afterDown.top > before.top, 'the hat D-pad moves the cursor down (' + (before && before.text) + ' -> ' + (afterDown && afterDown.text) + ')');
await dpad('up');
const afterUp = await ringInfo();
ok(afterUp && before && Math.abs(afterUp.top - before.top) < 2, 'the hat D-pad moves it back up (' + (afterUp && afterUp.text) + ')');

console.log('── Settings: music switch and B');
ok(await open('b-set', 's-set'), 'settings open');
const music0 = await pg.evaluate(() => document.getElementById('tg-music').classList.contains('on'));
let onMusic = false;
for (let i = 0; i < 8 && !onMusic; i++) { const ri = await ringInfo(); if (ri && /Music/.test(ri.text || '')) { onMusic = true; break; } await dpad('down'); }
if (!onMusic) for (let i = 0; i < 10 && !onMusic; i++) { await dpad('up'); const ri = await ringInfo(); if (ri && /^Music/.test(ri.text || '')) onMusic = true; }
ok(onMusic, 'the cursor reaches the Music switch');
await press('A');
const music1 = await pg.evaluate(() => document.getElementById('tg-music').classList.contains('on'));
ok(music1 !== music0, 'A flips the Music switch (' + music0 + ' -> ' + music1 + ')');
await press('A');
await press('B'); await wait(700);
ok(await screen() !== 's-set', 'B leaves Settings (now ' + await screen() + ')');

console.log('── Minus toggles the music anywhere');
const m0 = await pg.evaluate(() => document.getElementById('tg-music').classList.contains('on'));
await press('MINUS');
const m1 = await pg.evaluate(() => ({ on: document.getElementById('tg-music').classList.contains('on'), tip: (document.getElementById('pad-tip') || {}).textContent }));
ok(m1.on !== m0 && /Music/.test(m1.tip || ''), 'Minus flips the music and says so  ' + JSON.stringify(m1));
await press('MINUS');

console.log('── How to Play scrolls, and B leaves from the top');
await home();
ok(await open('b-how', 's-how'), 'how to play opens');
const pad = () => pg.evaluate(() => { const p = document.querySelector('#s-how .pad'); return { top: p.scrollTop, max: p.scrollHeight - p.clientHeight }; });
const p0 = await pad();
ok(p0.max > 100, 'how to play is taller than the window (' + p0.max + 'px to scroll)');
await wait(300); await frames(10);
const trig0 = await pad();
ok(trig0.top === p0.top, 'a trigger resting at -1 does not scroll the page (' + p0.top + ' -> ' + trig0.top + ')');
await dpad('down'); await wait(450);
const p1 = await pad();
ok(p1.top > p0.top + 40, 'D-pad down scrolls the text (' + p0.top + ' -> ' + p1.top + ')');
for (let i = 0; i < 12; i++) { await dpad('down'); await wait(250); }
const p2 = await pad(); const rEnd = await ringInfo();
ok(p2.top >= p2.max - 4, 'holding on reaches the bottom (' + p2.top + ' of ' + p2.max + ')');
ok(rEnd && /Got it/.test(rEnd.text || '') && rEnd.bottom <= rEnd.vh, 'and the cursor lands on Got it, on screen  ' + JSON.stringify(rEnd));
await pg.evaluate(() => { document.querySelector('#s-how .pad').scrollTop = 0; }); await frames(3);
await press('B'); await wait(700);
ok(await screen() !== 's-how', 'B leaves How to Play from the top (now ' + await screen() + ')');

console.log('── Prize Bin: the screen follows the cursor');
await home();
ok(await open('b-skins', 's-skins'), 'prize bin opens');
const bin = () => pg.evaluate(() => { const p = document.querySelector('#s-skins .pad'); return { top: p.scrollTop, max: p.scrollHeight - p.clientHeight }; });
const b0 = await bin();
let offscreen = 0, maxTop = 0, visits = new Set();
for (let i = 0; i < 40; i++) {
  await dpad('down'); await wait(260);
  const ri = await ringInfo();
  if (!ri || ri.top < -2 || ri.bottom > ri.vh + 2) offscreen++;
  else visits.add(ri.text + '|' + Math.round(ri.top));
  maxTop = Math.max(maxTop, (await bin()).top);
}
const b1 = await bin();
ok(b0.max > 300, 'the bin is taller than the window (' + b0.max + 'px)');
ok(maxTop >= b1.max - 4, 'going down scrolls all the way to the bottom (' + maxTop + ' of ' + b1.max + ')');
ok(offscreen <= 2, 'the cursor stayed on screen (' + offscreen + ' of 40 presses hid it)');
const idle0 = await pg.evaluate(() => window.__efp);
await frames(90);
const idle1 = await pg.evaluate(() => window.__efp);
ok(idle1 - idle0 === 0, 'no hit testing while the pad sits still (' + (idle1 - idle0) + ' calls in 90 frames)');
await press('B'); await wait(700);
ok(await screen() !== 's-skins', 'B leaves the Prize Bin (now ' + await screen() + ')');

console.log('── Badges: tap one to see it');
await home();
ok(await open('b-ach', 's-ach'), 'badges open');
await dpad('down'); await wait(200);
let onBadge = await ringInfo();
for (let i = 0; i < 4 && !(onBadge && /skincard/.test(onBadge.cls || '')); i++) { await dpad('down'); await wait(200); onBadge = await ringInfo(); }
ok(onBadge && /skincard/.test(onBadge.cls || ''), 'the cursor reaches a badge  ' + JSON.stringify(onBadge));
await press('A'); await wait(400);
const card = await pg.evaluate(() => ({ on: document.getElementById('bin-reveal').classList.contains('on'), name: document.getElementById('br-name').textContent, bio: document.getElementById('br-bio').textContent }));
ok(card.on && card.name.length > 1 && card.bio.length > 5, 'A opens the badge card with what it is for  ' + JSON.stringify(card));
await press('B'); await wait(400);
const shut = await pg.evaluate(() => document.getElementById('bin-reveal').classList.contains('on'));
ok(!shut && await screen() === 's-ach', 'B closes the card and stays on Badges');
await press('B'); await wait(700);
ok(await screen() !== 's-ach', 'B again leaves Badges');

console.log('── In a run');
await pg.evaluate(() => { SH_DEV.show('s-play'); SH_DEV.start('endless'); });
await frames(20);
const st = () => pg.evaluate(() => { const g = SH_DEV.state(); return { r: g.cr.r, x: Math.round(g.cr.x), hop: g.hop ? (g.hop.dir || g.hop.d || 'hop') : null, buf: g.buf || null, phase: g.phase }; });
const s0 = await st();
await stick(0.72, 0.8, 12); await frames(40);
const s1 = await st();
ok(s1.x === s0.x && s1.r !== s0.r, 'a diagonal stick push hops forward only, never sideways  ' + JSON.stringify({ s0, s1 }));
const s2 = await st();
await dpad('down'); await frames(40);
const s3 = await st();
ok(s3.r !== s2.r, 'the hat D-pad hops forward  ' + JSON.stringify({ s2, s3 }));
await press('START'); await frames(4);
ok(await screen() === 's-pause', 'Start (plus) pauses');
await press('B'); await frames(4);
ok(await screen() === 's-play', 'B resumes');

console.log('── Fable review fixes');
/* A in a run hops forward and clears the coach card */
await pg.evaluate(() => { SH_DEV.show('s-play'); SH_DEV.start('endless'); }); await frames(20);
const a0 = await st();
await press('A'); await frames(40);
const a1 = await st();
ok(a1.r !== a0.r && a1.x === a0.x, 'A hops forward in a run  ' + JSON.stringify({ a0, a1 }));
/* no menu cursor over the death animation */
await pg.evaluate(() => SH_DEV.hurt('squish')); let ringDying = 0;
for (let i = 0; i < 12; i++) { await frames(5); if (await screen() !== 's-play') break; if (await ringInfo()) ringDying++; }
ok(ringDying === 0, 'no cursor while Jimothy is dying (' + ringDying + ' samples showed one)');
for (let i = 0; i < 40 && await screen() !== 's-go'; i++) await wait(100);
ok(await screen() === 's-go', 'the run ends on game over');
/* even with Keep going on screen, the cursor starts on Hop again */
await pg.evaluate(() => { const c = document.getElementById('go-continue'); c.style.display = ''; c.disabled = false; SH_DEV.show('s-how'); });
await wait(300); await pg.evaluate(() => { SH_DEV.show('s-go'); }); await wait(900); await dismissReward(); await frames(4);
const goRing = await ringInfo();
ok(goRing && goRing.id === 'go-retry', 'game over seats the cursor on Hop again, not on a caps spend  ' + JSON.stringify(goRing));
await pg.evaluate(() => { document.getElementById('go-continue').style.display = 'none'; });
/* a stick held into a new run does not hop until it comes home */
await pg.evaluate(() => { window.__pad.axes[1] = 0.9; });
await pg.evaluate(() => { SH_DEV.show('s-play'); SH_DEV.start('endless'); }); await frames(20);
const h0 = await st(); await frames(60); const h1 = await st();
await pg.evaluate(() => { window.__pad.axes[1] = 0; }); await frames(4);
ok(h1.r === h0.r, 'a stick held into a new run does not hop by itself  ' + JSON.stringify({ h0, h1 }));
await stick(0, 0.9, 4); await frames(30);
const h2 = await st();
ok(h2.r !== h1.r, 'after it comes home the stick hops again  ' + JSON.stringify({ h1, h2 }));
/* one sideways lean of a third of a second is one lane */
const l0 = await st();
await stick(0.9, 0.2, 20); await frames(30);
const l1 = await st();
ok(Math.abs(l1.x - l0.x) === 60, 'a short sideways lean moves one lane (' + l0.x + ' -> ' + l1.x + ')');
await pg.evaluate(() => { SH_DEV.show('s-title'); }); await wait(700); await dismissReward(); await frames(4);
/* Left on a single column goes nowhere */
await dpad('down'); await wait(200);
const col0 = await ringInfo();
await dpad('left'); const col1 = await ringInfo();
ok(col0 && col1 && col0.text === col1.text, 'Left on a one-column menu stays put (' + (col0 && col0.text) + ' -> ' + (col1 && col1.text) + ')');
/* the soundtrack rows are reachable and A plays one */
ok(await open('b-music', 's-music') || await pg.evaluate(() => { SH_DEV.show('s-music'); return true; }), 'soundtrack opens');
await wait(600); await frames(4);
let onRow = null;
for (let i = 0; i < 6 && !onRow; i++) { const ri = await ringInfo(); if (ri && /musrow/.test(ri.cls || '')) onRow = ri; else await dpad('down'); }
ok(!!onRow, 'the cursor reaches a song row  ' + JSON.stringify(onRow));
await dpad('down');
const song0 = await pg.evaluate(() => SH_DEV.music ? JSON.stringify(SH_DEV.music()) : '');
await press('A'); await wait(400);
const song1 = await pg.evaluate(() => SH_DEV.music ? JSON.stringify(SH_DEV.music()) : '');
ok(song1 !== song0, 'A on a song row plays it  ' + song0.slice(0, 60) + ' -> ' + song1.slice(0, 60));
await press('B'); await wait(700);
ok(await screen() !== 's-music', 'B leaves the soundtrack');
/* B on the intro skips it */
await home();
await pg.evaluate(() => document.getElementById('set-intro').click()); await wait(900); await dismissReward(); await frames(4);
ok(await screen() === 's-intro', 'the intro plays');
await press('B'); await wait(700);
ok(await screen() !== 's-intro', 'B skips the intro (now ' + await screen() + ')');
/* a trigger that was pulled once and let go parks at -1 and stops scrolling */
await home();
ok(await open('b-how', 's-how'), 'how to play opens for the trigger check');
await pg.evaluate(() => { window.__pad.axes[5] = 0; }); await frames(3);
await pg.evaluate(() => { window.__pad.axes[5] = -1; }); await wait(1200); await frames(3);
await pg.evaluate(() => { document.querySelector('#s-how .pad').scrollTop = 300; }); await frames(20);
const parked = await pg.evaluate(() => document.querySelector('#s-how .pad').scrollTop);
ok(parked === 300, 'a trigger parked at -1 stops scrolling the page (300 -> ' + parked + ')');
await pg.evaluate(() => { document.querySelector('#s-how .pad').scrollTop = 0; });
/* a second device at index 0 cannot mute the pad the player is using */
await pg.evaluate(() => { const idle = { id: 'Some Wheel (Vendor: 046d Product: c24f)', index: 0, connected: true, mapping: '', timestamp: 1, axes: [0, 0, 0, 0], buttons: [] };
  window.__pad.index = 1; window.__pad.timestamp = 5; navigator.getGamepads = () => [idle, window.__pad]; });
await frames(3);
await press('B'); await wait(700);
ok(await screen() !== 's-how', 'with a wheel at index 0, B on the real pad still goes back');
await pg.evaluate(() => { window.__pad.index = 0; navigator.getGamepads = () => [window.__pad]; });

console.log('── XBOX standard pad');
PAD = 'XBOX'; await use('XBOX');
await home();
ok(await open('b-set', 's-set'), 'settings open');
await press('B'); await wait(700);
ok(await screen() !== 's-set', 'B (index 1) leaves Settings');
await home();
ok(await open('b-set', 's-set'), 'settings open again');
const rx = await ringInfo();
await dpad('down');
const rx2 = await ringInfo();
ok(rx && rx2 && rx2.top > rx.top, 'D-pad buttons move the cursor');
let onMusicX = false;
for (let i = 0; i < 10 && !onMusicX; i++) { const ri = await ringInfo(); if (ri && /^Music/.test(ri.text || '')) { onMusicX = true; break; } await dpad('up'); }
const mx0 = await pg.evaluate(() => document.getElementById('tg-music').classList.contains('on'));
await press('A');
const mx1 = await pg.evaluate(() => document.getElementById('tg-music').classList.contains('on'));
ok(onMusicX && mx1 !== mx0, 'A (index 0) flips the Music switch (' + mx0 + ' -> ' + mx1 + ', reached ' + onMusicX + ' ' + JSON.stringify(await ringInfo()) + ')');
await press('A');

console.log('── Nintendo Pro pad under the standard mapping');
PAD = 'NPRO'; await use('NPRO');
await pg.evaluate(() => { SH_DEV.show('s-set'); }); await wait(700); await frames(4);
await press('B'); await wait(700);
ok(await screen() !== 's-set', 'B (index 0, the bottom button) leaves Settings');
await pg.evaluate(() => { SH_DEV.show('s-set'); }); await wait(700); await frames(4);
await press('A'); await wait(300);   // index 1 must press, not go back
ok(await screen() === 's-set', 'A (index 1, the right button) does not go back');

console.log('── Swap A and B');
PAD = 'XBOX'; await use('XBOX');
await pg.evaluate(() => { const r = document.getElementById('set-padswap-row'); if (r.style.display === 'none') throw new Error('row hidden'); r.click(); });
const swapped = await pg.evaluate(() => JSON.parse(localStorage.getItem('sh_set') || '{}').padSwap === true);
ok(swapped, 'the swap switch is shown once a pad is seen, and saves');
await press('A'); await wait(700);    // index 0 is now back
ok(await screen() !== 's-set', 'with the swap on, index 0 goes back');
await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('sh_set')); s.padSwap = false; localStorage.setItem('sh_set', JSON.stringify(s)); });

console.log('── A crisp canvas');
const px = () => pg.evaluate(() => ({ w: document.getElementById('game').width, dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight }));
const expect = p => Math.round(540 * Math.min(2.5, Math.max(1, p.dpr * Math.min(p.vw / 540, p.vh / 960))));
let c1 = await px();
ok(c1.w === expect(c1), 'canvas matches the window (' + c1.w + ' px wide, expected ' + expect(c1) + ')');
await pg.evaluate(() => { SH_DEV.show('s-play'); SH_DEV.start('endless'); }); await frames(20);
await pg.evaluate(() => { SH_DEV.show('s-pause'); }); await frames(4);
await pg.setViewport({ width: 1920, height: 1080 }); await wait(500);
let c2 = await px();
ok(c2.w === expect(c2), 'canvas follows a 1920x1080 window (' + c2.w + ' px wide, expected ' + expect(c2) + ')');
const lit = await pg.evaluate(() => { const c = document.getElementById('game'), x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4000) if (d[i] > 0) n++; return n; });
ok(lit > 20, 'the paused frame survives the resize (' + lit + ' lit samples)');

ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
await b.close(); srv.close();
console.log(fails.length ? 'GAMEPAD FAILED (' + fails.length + ')' : 'GAMEPAD OK');
process.exit(fails.length ? 1 : 0);
