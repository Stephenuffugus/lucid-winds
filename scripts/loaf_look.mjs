#!/usr/bin/env node
/* LOAF LOOK: ONE image per visual step (LOAF_BUILD_PLAN.md, the testing law).
   Scans a real photo through the real flow, opens the room, and writes one
   PNG with a panel per light set. Not a gate: open the image and read it.
   Usage: node scripts/loaf_look.mjs [--photo p] [--lights day,dusk,night]
          [--out file.png] [--wait ms] */
import { createRequire } from 'module';
/* Chrome lives in /workspaces/sws-tools (START-HERE); the repo has no node_modules */
const puppeteer = createRequire('/workspaces/sws-tools/package.json')('puppeteer');
import { createServer } from 'http';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PHOTO = arg('photo', 'assets/loaf/refcats/black.jpg');
const LIGHTS = arg('lights', 'day,dusk,night').split(',');
const OUT = arg('out', '/tmp/loaf-look.png');
const WAIT = +arg('wait', 2200);

const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8951);
const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const done = code => { b.close(); srv.close(); process.exit(code); };
try {
  const pg = await b.newPage();
  await pg.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
  pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
  await pg.goto('http://127.0.0.1:8951/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });
  await (await pg.$('#file')).uploadFile(join(ROOT, PHOTO));
  await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
  await pg.evaluate(() => document.getElementById('goScan').click());
  await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
  await pg.waitForSelector('#sheet:not(.hidden)', { timeout: 8000 }).catch(() => null);
  await pg.evaluate(() => {
    const s = document.getElementById('sheet');
    if (s && !s.classList.contains('hidden')) document.getElementById('nameSkip').click();
  });
  await pg.evaluate(() => document.getElementById('tabRoom').click());
  await pg.waitForFunction(() => window.LoafCat3D && LoafCat3D._room && LoafCat3D._room.on, { timeout: 30000 });
  const shots = [];
  for (const k of LIGHTS){
    await pg.evaluate(k => LoafCat3D._light(k), k);
    await new Promise(r => setTimeout(r, WAIT));
    const el = await pg.$('#room3d');
    await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
    shots.push({ k, b64: (await el.screenshot()).toString('base64') });
  }
  const url = await pg.evaluate(async shots => {
    const ims = await Promise.all(shots.map(s => new Promise(r => {
      const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s.b64; })));
    const w = ims[0].width, h = ims[0].height, gap = 12;
    const c = document.createElement('canvas');
    c.width = ims.length * w + (ims.length - 1) * gap; c.height = h + 44;
    const g = c.getContext('2d');
    g.fillStyle = '#150E1D'; g.fillRect(0, 0, c.width, c.height);
    g.font = '28px monospace'; g.fillStyle = '#EFE4D2';
    ims.forEach((im, i) => { g.drawImage(im, i * (w + gap), 44); g.fillText(shots[i].k, i * (w + gap) + 8, 32); });
    return c.toDataURL('image/png');
  }, shots);
  writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + OUT + ' (' + LIGHTS.join(', ') + ', ' + PHOTO + ')');
  done(0);
} catch (e) { console.log('LOOK FAILED:', e.message); done(1); }
