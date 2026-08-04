#!/usr/bin/env node
/* LOAF clip verification: play each gait and screenshot phases across the
   cycle. The Muybridge plates are the bar - READ THESE BY EYE against them.
   Usage: node scripts/loaf3d_clipshots.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = 'assets/loaf/shots/clips';
mkdirSync(join(ROOT, OUT), { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8937);

/* clip name -> [duration seconds, shot count] (24fps authoring) */
const CLIPS = [ ['Walk', 40 / 24, 4], ['Gallop', 22 / 24, 4],
                ['Pounce', 44 / 24, 6], ['Wiggle', 32 / 24, 3] ];

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 720, height: 900 });
pg.on('pageerror', e => console.log('PAGE ERR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8937/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D.setDNA, { timeout: 30000 });
await pg.evaluate(() => {
  document.getElementById('view-room').classList.remove('hidden');
  document.getElementById('tunerBody').classList.remove('hidden');
  document.getElementById('tuner').scrollIntoView();
});
/* side-on view - gaits are judged from the side, like the plates */
await pg.evaluate(() => window.LoafCat3D.setDNA({ base: '#8A7156', marking: '#241C14',
  white: '#F2EFE8', eye: '#A8B860', nose: '#C4756A', pattern: 'mackerel',
  whiteGrade: 1.5, seed: 7, floof: 0.35, chonk: 0.5, ear: 0.5, muzzle: 0.45 }));
await new Promise(r => setTimeout(r, 1200));

for (const [clip, dur, n] of CLIPS) {
  for (let i = 0; i < n; i++) {
    /* restart the clip fresh each shot, then wait to the target phase */
    await pg.evaluate(c => window.LoafCat3D.play(c, true), clip);
    await new Promise(r => setTimeout(r, 60 + (dur * 1000 * i) / n));
    const el = await pg.$('#stage3d');
    await el.screenshot({ path: join(ROOT, OUT, `${clip.toLowerCase()}-${i}.png`) });
  }
  console.log('shot', clip);
}
await b.close(); srv.close();
console.log('done ->', OUT);
