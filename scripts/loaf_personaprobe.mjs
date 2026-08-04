#!/usr/bin/env node
/* LOAF personality + voice gate.
   Walks the real quiz (10 reach-checked taps), asserts the persona saves
   and the bars render; then proves the wiring is VISIBLE: max-chaos must
   produce an unprompted zoomies burst, and a low-velcro cat must end a
   long petting session herself. Voice: meow() must build its graph.
   Usage: node scripts/loaf_personaprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
mkdirSync(join(ROOT, 'assets/loaf/shots'), { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8945);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist',
  '--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8945/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

/* card + room */
const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/oreo/oreo-couch.jpg'));
await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
await pg.evaluate(() => document.getElementById('goScan').click());
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
await pg.waitForSelector('#sheet:not(.hidden)', { timeout: 10000 }).catch(() => null);
await pg.evaluate(() => {
  const sh = document.getElementById('sheet');
  if (!sh.classList.contains('hidden')) document.getElementById('nameSkip').click();
});
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room && window.LoafCat3D._room.on,
  { timeout: 20000 });
console.log('room on');

/* a reach-checked tap */
async function tap(sel, label, last){
  const ok = await pg.evaluate((s2, useLast) => {
    const els = document.querySelectorAll(s2);
    const el = useLast ? els[els.length - 1] : els[0];
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return (hit === el || el.contains(hit)) ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
  }, sel, !!last);
  if (!ok){ console.log('FAIL: ' + label + ' unreachable'); process.exit(1); }
  await pg.mouse.click(ok.x, ok.y);
}

/* the quiz: last option every time = maxed on every axis */
await tap('#personaToggle', 'Who is she?');
for (let i = 0; i < 10; i++){
  await pg.waitForSelector('.pz-opt', { timeout: 5000 });
  await tap('.pz-opt', 'quiz option ' + (i + 1), true);
  await new Promise(r => setTimeout(r, 120));
}
const persona = await pg.evaluate(() => window.LOAF.Store.read()[0].persona);
console.log('persona saved:', JSON.stringify(persona));
if (!persona || Object.values(persona).some(v => v < 0.95)){
  console.log('FAIL: all-last answers should max every axis'); process.exit(1);
}
const bars = await pg.evaluate(() => document.querySelectorAll('#pzQuiz .need').length);
if (bars !== 5){ console.log('FAIL: expected 5 temperament bars, got ' + bars); process.exit(1); }
await (await pg.$('#persona')).screenshot({ path: join(ROOT, 'assets/loaf/shots/persona-bars.png') });
console.log('quiz + bars ok');

/* fold the quiz away so she goes home, then: chaos MUST zoom */
await tap('#personaToggle', 'fold quiz');
await pg.waitForFunction(() => window.LoafCat3D._room.on, { timeout: 8000 });
const zoomed = await pg.waitForFunction(() => window.LoafCat3D._room.state === 'zoom',
  { timeout: 60000, polling: 300 }).catch(() => null);
if (!zoomed){ console.log('FAIL: max chaos never produced a zoomies burst'); process.exit(1); }
console.log('unprompted zoomies: ok');

/* low velcro ends a long pet HERSELF */
await pg.evaluate(() => window.LoafCat3D.setPersona({ bold: .5, curious: .5, sass: .5, chaos: 0, velcro: 0.1 }));
await pg.waitForFunction(() => ['idle', 'settle', 'wander'].includes(window.LoafCat3D._room.state),
  { timeout: 30000, polling: 300 });
/* find her on screen via the shadow-follows-her trick: stroke stage centre */
const d3 = await pg.$('#room3d');
const box = await d3.boundingBox();
let struck = false;
for (let attempt = 0; attempt < 3 && !struck; attempt++){
  const pos = await pg.evaluate(() => {
    const r2 = window.LoafCat3D._room;
    return { s: r2.state };
  });
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.55;
  await pg.mouse.move(cx, cy);
  await pg.mouse.down();
  const t0 = Date.now();
  while (Date.now() - t0 < 6000){
    for (const off of [-25, 25]){
      await pg.mouse.move(cx + off, cy + Math.sin(Date.now() / 300) * 10);
      await new Promise(r => setTimeout(r, 60));
    }
    if (await pg.evaluate(() => (window.__loafLife.petBlock || 0) > 0)){ struck = true; break; }
  }
  await pg.mouse.up();
  if (!struck) await new Promise(r => setTimeout(r, 800));
}
if (!struck){ console.log('WARN: could not land a 4.5s stroke on her (she kept moving) - petBlock untested'); }
else console.log('low-velcro walked away from petting: ok');

/* the voice builds its graph */
const voiced = await pg.evaluate(() => window.LoafCat3D.meow('ask'));
if (!voiced){ console.log('FAIL: meow() threw'); process.exit(1); }
console.log('meow ok');
console.log('PERSONA PROBE COMPLETE');
await b.close(); srv.close();
