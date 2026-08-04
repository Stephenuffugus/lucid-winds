#!/usr/bin/env node
/* LOAF essence check: real photos through the REAL pipeline.
   photo -> readCatFromPhoto (the on-device reader) -> DNA -> 3D cat -> shot.
   Prints each reader verdict; shots land next to the source photos.
   Usage: node scripts/loaf3d_photocheck.mjs [dir-with-jpgs] */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = process.argv[2] || 'assets/loaf/refcats';
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8935);

const browser = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 720, height: 900 });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await page.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await page.goto('http://127.0.0.1:8935/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });
await page.waitForFunction(() => window.LoafCat3D && window.LoafCat3D.setDNA, { timeout: 30000 });
await page.evaluate(() => {
  document.getElementById('view-room').classList.remove('hidden');
  document.getElementById('tunerBody').classList.remove('hidden');
  document.getElementById('tuner').scrollIntoView();
});
await new Promise(r => setTimeout(r, 600));

for (const f of readdirSync(join(ROOT, DIR)).filter(f => /\.(jpe?g|png)$/i.test(f))) {
  const dna = await page.evaluate(async url => {
    const im = new Image();
    await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = url; });
    const cv = document.createElement('canvas');
    cv.width = im.width; cv.height = im.height;
    cv.getContext('2d').drawImage(im, 0, 0);
    const d = window.LOAF.readCatFromPhoto(cv);
    if (d) window.LoafCat3D.setDNA(window.LOAF.migrateDNA(d));
    return d;
  }, '/' + DIR + '/' + f);
  console.log(f, '->', dna ? JSON.stringify({ pattern: dna.pattern, base: dna.base,
    marking: dna.marking, whiteStyle: dna.whiteStyle, whiteGrade: dna.whiteGrade,
    floof: dna.floof, eye: dna.eye }) : 'READER RETURNED NULL');
  if (!dna) continue;
  await new Promise(r => setTimeout(r, 900));
  const el = await page.$('#stage3d');
  await el.screenshot({ path: join(ROOT, DIR, f.replace(/\.\w+$/, '') + '-3d.png') });
}
await browser.close(); srv.close();
console.log('done ->', DIR);
