#!/usr/bin/env node
/* LOAF full walk: the REAL flow, end to end, with a REAL photo.
   Upload -> segment+read -> meter -> scan -> mint -> name -> "Meet her in
   3D" -> Room tab -> tuner open, 3D cat painted. Every tap is reach-checked
   with elementFromPoint at the control's centre - el.click() proves nothing.
   Usage: node scripts/loaf_fullwalk.mjs [photo] */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const PHOTO = process.argv[2] || 'assets/loaf/refcats/barthalomew/bart-sidewalk.jpg';
const OUT = join(ROOT, 'assets/loaf/shots/walk');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8938);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 375, height: 667 });        /* a real phone */
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8938/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

/* a tap that proves the control is actually reachable where it claims to be */
async function tap(sel, label){
  await pg.waitForSelector(sel, { visible: true, timeout: 30000 });
  const ok = await pg.evaluate(s => {
    const el = document.querySelector(s);
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return hit === el || el.contains(hit) ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
  }, sel);
  if (!ok){ console.log('FAIL: ' + label + ' is not reachable at its centre'); process.exit(1); }
  await pg.mouse.click(ok.x, ok.y);
  console.log('tap ok:', label);
}

/* 1. upload the photo through the real input */
const input = await pg.$('#file');
await input.uploadFile(join(ROOT, PHOTO));
console.log('uploaded', PHOTO);

/* 2. meter appears (segmentation runs inside intake - cold CPU load is slow) */
await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
await pg.screenshot({ path: join(OUT, '1-meter.png') });
console.log('meter shown');

/* 3. run the scan */
await tap('#goScan', 'PRINT THE CARD');
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
console.log('card minted');

/* 4. name her via the auto-opened sheet */
await pg.waitForSelector('#sheet:not(.hidden)', { timeout: 10000 }).catch(() => null);
if (await pg.evaluate(() => !document.getElementById('sheet').classList.contains('hidden'))){
  await pg.type('#nameField', 'Barthalomew');
  await tap('#nameSave', 'Set name');
}
await new Promise(r => setTimeout(r, 600));
await pg.screenshot({ path: join(OUT, '2-card.png') });

/* 5. the bridge: Meet her in 3D */
await tap('#makeAvatar', 'Meet her in 3D');
await new Promise(r => setTimeout(r, 1500));
const state = await pg.evaluate(() => ({
  roomShown: !document.getElementById('view-room').classList.contains('hidden'),
  tunerOpen: !document.getElementById('tunerBody').classList.contains('hidden'),
  stageShown: !document.getElementById('stage3d').classList.contains('hidden')
}));
console.log('state:', JSON.stringify(state));
if (!state.roomShown || !state.tunerOpen || !state.stageShown){
  console.log('FAIL: bridge did not land in the open 3D tuner'); process.exit(1);
}
await new Promise(r => setTimeout(r, 1200));               /* let the coat paint */
await pg.screenshot({ path: join(OUT, '3-tuner.png') });
const stageEl = await pg.$('#stage3d');
await stageEl.screenshot({ path: join(OUT, '4-avatar.png') });
console.log('WALK COMPLETE');
await b.close(); srv.close();
