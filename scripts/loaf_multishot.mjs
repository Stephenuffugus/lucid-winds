#!/usr/bin/env node
/* LOAF multi-shot gate: two photos beat one.
   The acid test from the round-3 scoreboard: bart-garden (crouch hides the
   bib, white reads 0 — an honest miss) merged with bart-sidewalk (bib
   visible) must produce a read with white PRESENT, coat still dark. Second
   and third photos arrive through the REAL file chooser off the reach-checked
   Add-another-photo button. Usage: node scripts/loaf_multishot.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8951);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8951/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }
const scan = () => pg.evaluate(() => {
  const s = window.LOAF._scan();
  return { shots: s.shots, whiteGrade: s.dna && s.dna.whiteGrade,
           pattern: s.dna && s.dna.pattern, base: s.dna && s.dna.base,
           mergedShots: s.dna && s.dna._read && s.dna._read.shots };
});
async function tapChooser(sel, file, what){
  /* the meter view smooth-scrolls itself after the photo decodes, so settle,
     measure at the last moment, and retry if the page moved under the tap */
  for (let attempt = 0; attempt < 3; attempt++){
    await pg.evaluate(s =>
      document.querySelector(s).scrollIntoView({ block: 'center', behavior: 'instant' }), sel);
    await new Promise(r => setTimeout(r, 700));
    const box = await (await pg.$(sel)).boundingBox();
    if (!box) die(what + ': no box');
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const hit = await pg.evaluate((s, x, y) => {
      const el = document.querySelector(s), at = document.elementFromPoint(x, y);
      return !!(at && (at === el || el.contains(at)));
    }, sel, cx, cy);
    if (!hit){
      if (attempt === 2) die(what + ': centre of ' + sel + ' is covered');
      continue;
    }
    const chooser = await Promise.all([
      pg.waitForFileChooser({ timeout: 8000 }).catch(() => null),
      pg.mouse.click(cx, cy)
    ]).then(r => r[0]);
    if (chooser){ await chooser.accept([file]); return; }
    if (attempt === 2) die(what + ': tap never opened the file chooser');
  }
}

/* shot 1: the garden crouch — the known white miss */
const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/barthalomew/bart-garden.jpg'));
await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
const one = await scan();
console.log('garden alone:', JSON.stringify(one));
if (one.shots !== 1) die('shot count after first photo: ' + one.shots);

/* shot 2: the sidewalk — the bib is visible here */
await tapChooser('#addShot', join(ROOT, 'assets/loaf/refcats/barthalomew/bart-sidewalk.jpg'), 'add shot');
await pg.waitForFunction(() => window.LOAF._scan().shots === 2, { timeout: 120000 });
const two = await scan();
console.log('merged 2 shots:', JSON.stringify(two));
if (two.mergedShots !== 2) die('merged _read.shots wrong: ' + two.mergedShots);
if (!(two.whiteGrade > one.whiteGrade)) die('merge did not recover the hidden white ('
  + one.whiteGrade + ' -> ' + two.whiteGrade + ')');
if (two.whiteGrade < 2) die('merged whiteGrade still near zero: ' + two.whiteGrade);
const L = await pg.evaluate(h => {
  const p = [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  return 0.2126*p[0] + 0.7152*p[1] + 0.0722*p[2];
}, two.base);
if (L > 90) die('merged base is not a dark coat: ' + two.base + ' (L=' + Math.round(L) + ')');
const label = await pg.evaluate(() => document.getElementById('addShot').textContent);
if (!/2 of 3/.test(label)) die('button label did not count: ' + label);
console.log('white recovered: ' + one.whiteGrade + ' -> ' + two.whiteGrade
  + ', base ' + two.base + ' (dark ok), label "' + label + '"');

/* shot 3: portrait — then the button must retire */
await tapChooser('#addShot', join(ROOT, 'assets/loaf/refcats/barthalomew/bart-portrait.jpg'), 'third shot');
await pg.waitForFunction(() => window.LOAF._scan().shots === 3, { timeout: 120000 });
const three = await scan();
console.log('merged 3 shots:', JSON.stringify(three));
const hidden = await pg.evaluate(() => document.getElementById('addShot').classList.contains('hidden'));
if (!hidden) die('add button still visible at 3 shots');
if (three.whiteGrade < 2) die('third shot lost the white: ' + three.whiteGrade);

/* the card must carry the merged read */
await pg.evaluate(() => document.getElementById('goScan').click());
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
const cardDNA = await pg.evaluate(() => {
  const c = window.LOAF.Store.read()[0];
  return { whiteGrade: c.dna.whiteGrade, shots: c.dna._read && c.dna._read.shots };
});
console.log('minted card dna:', JSON.stringify(cardDNA));
if (cardDNA.whiteGrade !== three.whiteGrade) die('card lost the merged white');
if (cardDNA.shots !== 3) die('card lost the shot count');
console.log('MULTISHOT PROBE COMPLETE');
await b.close(); srv.close();
