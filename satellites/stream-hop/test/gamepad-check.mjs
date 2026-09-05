/* Gamepad gate for Jumping Jimothy. Boots the real page with ?shtest=1 and a FAKE
   standard-mapping gamepad (navigator.getGamepads is replaced before any script
   runs), then drives the REAL rAF poll loop by holding a button for two frames:
   A on the splash starts the game; D-pad on the title moves the focus ring onto a
   real button and A presses it; in a run D-pad down hops forward through queueHop
   and Start pauses / resumes. Usage: node test/gamepad-check.mjs  (from stream-hop) */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
const ROOT = join(new URL('..', import.meta.url).pathname, '..', '..');   // repo root
const srv = createServer((q, r) => { try { r.end(readFileSync(join(ROOT, decodeURIComponent(q.url.split('?')[0])))); } catch (e) { r.writeHead(404); r.end(); } }).listen(8968);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 640, height: 1136 });
await pg.evaluateOnNewDocument(() => {
  const btn = () => ({ pressed: false, value: 0, touched: false });
  window.__pad = { id: 'Fake Xbox (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, btn) };
  navigator.getGamepads = () => [window.__pad];
});
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const frames = n => pg.evaluate(n => new Promise(r => { let k = 0; (function f() { if (++k >= n) r(); else requestAnimationFrame(f); })(); }), n);
async function tap(i, holdFrames = 2) { await pg.evaluate(i => { window.__pad.buttons[i].pressed = true; window.__pad.buttons[i].value = 1; }, i); await frames(holdFrames); await pg.evaluate(i => { window.__pad.buttons[i].pressed = false; window.__pad.buttons[i].value = 0; }, i); await frames(2); }
async function stick(x, y, holdFrames = 2) { await pg.evaluate((x, y) => { window.__pad.axes[0] = x; window.__pad.axes[1] = y; }, x, y); await frames(holdFrames); await pg.evaluate(() => { window.__pad.axes[0] = 0; window.__pad.axes[1] = 0; }); await frames(2); }
const screen = () => pg.evaluate(() => { const s = document.querySelector('.screen.on:not(.leaving)'); return s ? s.id : 's-play'; });
await pg.goto('http://127.0.0.1:8968/satellites/stream-hop/index.html?shtest=1', { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
console.log('── splash');
ok(await screen() === 's-splash', 'starts on the splash');
await tap(0); await new Promise(r => setTimeout(r, 900));
ok(await screen() !== 's-splash', 'A on the splash starts the game (now ' + await screen() + ')');
console.log('── menu focus');
const menu = await screen();
await tap(13);   // dpad down
let ring = await pg.evaluate(() => { const g = document.getElementById('pad-ring'); if (!g || g.style.display === 'none') return null; const r = g.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { w: r.width, h: r.height, over: el && (el.closest('button,.btn,.lv-cell,.skincard') || el).tagName + '#' + ((el.closest('button,.btn,.lv-cell,.skincard') || el).id || '') + ' "' + ((el.closest('button,.btn,.lv-cell,.skincard') || el).textContent || '').trim().slice(0, 24) + '"' }; });
ok(!!ring && ring.w > 40, 'D-pad down draws the focus ring on the ' + menu + ' screen  ' + JSON.stringify(ring));
const under = () => pg.evaluate(() => { const g = document.getElementById('pad-ring').getBoundingClientRect(); const el = document.elementFromPoint(g.left + g.width / 2, g.top + g.height / 2); const b = el && (el.closest('button,.btn,.lv-cell,.skincard') || el); return b ? (b.id || b.className) + ':' + (b.textContent || '').trim().slice(0, 16) : null; });
const before = await under();
await tap(13);
const after = await under();
ok(after !== before, 'a second D-pad down moves the ring to another button (' + before + ' -> ' + after + ')');
await stick(0, -1);
const after2 = await under();
ok(after2 === before, 'left stick up moves it back (' + after2 + ')');
await tap(0); await new Promise(r => setTimeout(r, 700));
const afterA = await screen();
ok(afterA !== menu || await pg.evaluate(() => !!document.querySelector('[id].on:not(.screen)')), 'A presses the focused button (screen ' + menu + ' -> ' + afterA + ')');
console.log('── in a run');
await pg.evaluate(() => { SH_DEV.screen('s-play'); SH_DEV.start('endless'); });
await frames(5);
const r0 = await pg.evaluate(() => ({ r: SH_DEV.state().cr.r, phase: SH_DEV.state().phase, started: SH_DEV.state().started }));
await tap(13); await frames(30);
const r1 = await pg.evaluate(() => ({ r: SH_DEV.state().cr.r, hop: !!SH_DEV.state().hop, buf: SH_DEV.state().buf, started: SH_DEV.state().started }));
ok(r1.r !== r0.r || r1.hop || r1.buf || (!r0.started && r1.started), 'D-pad down hops forward through queueHop  ' + JSON.stringify({ before: r0, after: r1 }));
const ringInPlay = await pg.evaluate(() => { const g = document.getElementById('pad-ring'); return !g || g.style.display === 'none'; });
ok(ringInPlay, 'no focus ring during a run');
await tap(9); await frames(3);
ok(await screen() === 's-pause', 'Start pauses (screen ' + await screen() + ')');
await tap(9); await frames(3);
ok(await screen() === 's-play', 'Start again resumes (screen ' + await screen() + ')');
await tap(1); await frames(3);
ok(await screen() === 's-pause', 'B pauses too');
await b.close(); srv.close();
console.log(fails.length ? 'GAMEPAD FAILED (' + fails.length + ')' : 'GAMEPAD OK');
process.exit(fails.length ? 1 : 0);
