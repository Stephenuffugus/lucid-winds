#!/usr/bin/env node
/* LOAF multi-cat gate: scan TWO real cats (Bartholomew + Oreo), open the
   room, and the second cat must VISIT - her own body, her own coat. The
   two-cats-in-one-frame shot is the point: it must be READ, and the two
   must be tellable apart (that is the Two-Cat Test, live).
   Usage: node scripts/loaf_visitorprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/visitor');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8959);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8959/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }

async function mint(file){
  const input = await pg.$('#file');
  await input.uploadFile(join(ROOT, file));
  await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
  await pg.evaluate(() => document.getElementById('goScan').click());
  await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
  await pg.waitForSelector('#sheet:not(.hidden)', { timeout: 10000 }).catch(() => null);
  await pg.evaluate(() => {
    const s = document.getElementById('sheet');
    if (!s.classList.contains('hidden')) document.getElementById('nameSkip').click();
  });
}

/* 1. two cats on file: Oreo first, then Bartholomew (he becomes current) */
await mint('assets/loaf/refcats/oreo/oreo-couch.jpg');
console.log('cat one minted (Oreo)');
await pg.evaluate(() => document.querySelector('#again') && document.getElementById('again').click());
await pg.waitForSelector('#view-slot:not(.hidden)', { timeout: 10000 });
await mint('assets/loaf/refcats/barthalomew/bart-sidewalk.jpg');
console.log('cat two minted (Bartholomew)');
const nCards = await pg.evaluate(() => window.LOAF.Store.read().length);
if (nCards !== 2) die('expected 2 cards, got ' + nCards);

/* 2. the room: the resident is Bartholomew, and Oreo VISITS */
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room.on, { timeout: 20000 });
await new Promise(r => setTimeout(r, 900));
const v = await pg.evaluate(() => window.LoafCat3D._vis);
if (!v) die('no visitor spawned with 2 cats on file');
console.log('visitor present at ' + v.pos.map(n => n.toFixed(2)).join(','));

/* 3. she is ALIVE: her state machine must move within 30s */
const moved = await pg.waitForFunction(() =>
  window.LoafCat3D._vis && window.LoafCat3D._vis.state !== 'idle',
  { timeout: 30000, polling: 300 }).catch(() => null);
if (!moved) die('visitor never left idle in 30s');
console.log('visitor state: ' + await pg.evaluate(() => window.LoafCat3D._vis.state));

/* 4. THE SHOT: two cats, one frame, tellable apart. READ IT. */
await pg.evaluate(() => document.getElementById('room3d').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 500));
await (await pg.$('#room3d')).screenshot({ path: join(OUT, 'two-cats.png') });

/* 5. the resident's coat did NOT become the visitor's (painter restored) */
const dbg = await pg.evaluate(() => {
  const d = window.LoafCat3D._dbg();
  return { dnaBase: d.dna && d.dna.base, avg: d.coatStats && d.coatStats.avg };
});
const resident = await pg.evaluate(() => Room.card.dna.base);
if (dbg.dnaBase !== resident)
  die('painter left the wrong cat on the resident: ' + dbg.dnaBase + ' vs ' + resident);
console.log('resident coat intact (' + resident + '), avg ' + JSON.stringify(dbg.avg));

/* 6. leaving the room removes the visitor cleanly */
await pg.evaluate(() => document.getElementById('tabScan').click());
await new Promise(r => setTimeout(r, 600));
if (await pg.evaluate(() => !!window.LoafCat3D._vis)) die('visitor survived roomClose');
/* and coming back brings her back */
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.LoafCat3D._room.on, { timeout: 20000 });
await new Promise(r => setTimeout(r, 900));
if (!await pg.evaluate(() => !!window.LoafCat3D._vis)) die('visitor did not return');
console.log('visitor removed on close, returns on reopen. VISITOR PROBE COMPLETE');
console.log('READ THE SHOT: ' + OUT + '/two-cats.png');
await b.close(); srv.close();
