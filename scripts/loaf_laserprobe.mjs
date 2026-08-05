#!/usr/bin/env node
/* LOAF laser gate: the dot must be huntable.
   Select the Laser tool, press the dot into the room, sprint it, then hold
   it still - she must stalk in, wiggle, pounce and CATCH it, and the
   session must pay out on release. Usage: node scripts/loaf_laserprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/laser');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8943);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8943/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

/* card + room */
const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/barthalomew/bart-sidewalk.jpg'));
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

/* select the laser tool */
const picked = await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('#tools .tool')].find(x => /Laser/i.test(x.textContent));
  if (!btn) return false;
  btn.click(); return true;
});
if (!picked){ console.log('FAIL: no Laser tool button'); process.exit(1); }
console.log('laser tool selected');

/* the app promises to LAND you on the room (and re-asserts against the
   card view's in-flight smooth scroll) - hold it to that before measuring */
await pg.waitForFunction(
  () => document.getElementById('room3d').getBoundingClientRect().y >= 0,
  { timeout: 4000, polling: 100 });
/* press the dot in and play well: sprints, then stillness near the centre */
const d3 = await pg.$('#room3d');
const box = await d3.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height * 0.62;
/* engagement diagnostics: if the press misses, we must know WHERE it went */
const under = await pg.evaluate((x, y) => {
  const el = document.elementFromPoint(x, y);
  return el ? el.tagName + '#' + (el.id || '(no id)') : 'NOTHING (off-viewport?)';
}, cx, cy);
console.log('press at', Math.round(cx) + ',' + Math.round(cy),
  'box.y=' + Math.round(box.y), 'under:', under);
await pg.mouse.move(cx, cy);
await pg.mouse.down();
const engaged = await pg.waitForFunction(() => window.LoafCat3D._room.laser.on,
  { timeout: 5000 }).catch(() => null);
if (!engaged){
  const diag = await pg.evaluate((x, y) => ({
    at: (() => { const el = document.elementFromPoint(x, y);
      return el ? el.tagName + '#' + (el.id || '') : 'NOTHING'; })(),
    scrollY: window.scrollY,
    boxY: document.getElementById('room3d').getBoundingClientRect().y,
    state: window.LoafCat3D._room.state,
    toy: window.LoafCat3D._room.bridge && window.LoafCat3D._room.bridge.toy()
  }), cx, cy);
  console.log('FAIL: laser never engaged. diag:', JSON.stringify(diag));
  process.exit(1);
}
for (let lap = 0; lap < 3; lap++){                    /* sprint bursts */
  for (let i = 0; i < 10; i++){
    await pg.mouse.move(cx + Math.sin(i * 1.1 + lap) * 120, cy + Math.cos(i * 0.9) * 60);
    await new Promise(r => setTimeout(r, 40));
  }
  if (lap === 1){                                     /* dot away from her: shoot */
    await pg.mouse.move(cx - 130, cy + 30);
    await new Promise(r => setTimeout(r, 500));
    await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await d3.screenshot({ path: join(OUT, 'laser-stalk.png') });
  }
  await pg.mouse.move(cx, cy);
  await new Promise(r => setTimeout(r, 1200));        /* stillness */
}
console.log('state:', await pg.evaluate(() => window.LoafCat3D._room.state),
  'meter:', await pg.evaluate(() => Math.round(window.LoafCat3D._room.laser.meter)));

/* hold still until she catches it */
const caught = await pg.waitForFunction(() => window.LoafCat3D._room.laser.catches > 0,
  { timeout: 60000, polling: 400 }).catch(() => null);
if (!caught){
  console.log('FAIL: she never caught the dot (state=' +
    await pg.evaluate(() => window.LoafCat3D._room.state) + ')');
  process.exit(1);
}
console.log('CAUGHT IT. catches:', await pg.evaluate(() => window.LoafCat3D._room.laser.catches));
await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
await d3.screenshot({ path: join(OUT, 'laser-catch.png') });

/* release: the session must pay out */
await pg.mouse.up();
await new Promise(r => setTimeout(r, 700));
const note = await pg.evaluate(() => document.getElementById('roomNote').textContent);
console.log('session note:', note);
if (!/time|caught|opinions/i.test(note)){ console.log('FAIL: no session payout note'); process.exit(1); }
console.log('LASER PROBE COMPLETE');
await b.close(); srv.close();
