#!/usr/bin/env node
/* LOAF BLIND PAIR SHEET (A5). A LOOK tool, not a gate: run once per candidate.
   Each photo goes through the real flow (chooser picks the biggest cat, the
   "Does this look like her?" sheet takes the given chips, then the card),
   and her 3D self is shot in one fixed pose, angle and scale in day light.
   Each row is a pair, sides shuffled, labelled only A and B. The key (which
   side is the owner's cat) goes to <out>.key.txt, never onto the sheet.
   Usage: node scripts/loaf_pair.mjs --pairs mine.jpg:stranger.jpg,...
          [--chips "Narrowed eyes||;..."] [--seed n] [--out sheet.png]
   --chips: per photo, in the order the photos appear in --pairs, ';' between
   photos, '|' between chips on one photo. */
import { createRequire } from 'module';
import { createServer } from 'http';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const puppeteer = createRequire('/workspaces/sws-tools/package.json')('puppeteer');

const ROOT = new URL('..', import.meta.url).pathname;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAIRS = (arg('pairs', '') || '').split(',').filter(Boolean).map(p => p.split(':'));
const CHIPS = (arg('chips', '') || '').split(';');
const OUT = arg('out', '/tmp/loaf-pairs.png');
let seed = +arg('seed', 20261102) >>> 0;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
if (!PAIRS.length || PAIRS.some(p => p.length !== 2)){ console.log('need --pairs a.jpg:b.jpg,...'); process.exit(1); }

const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8953);
const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const done = code => { b.close(); srv.close(); process.exit(code); };
const abs = p => p.startsWith('/') ? p : join(ROOT, p);
try {
  const pg = await b.newPage();
  await pg.setViewport({ width: 375, height: 667 });
  pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
  const cache = {};
  async function shoot(photo, chips){
    const key = photo + '#' + (chips || '');
    if (cache[key]) return cache[key];
    await pg.goto('http://127.0.0.1:8953/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });
    await (await pg.$('#file')).uploadFile(abs(photo));
    await pg.waitForSelector('#view-meter:not(.hidden), #view-choose:not(.hidden)', { timeout: 120000 });
    if (await pg.$('#view-choose:not(.hidden)')){
      await pg.evaluate(() => document.getElementById('chooseGo').click());
      await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 60000 });
    }
    await pg.evaluate(() => document.getElementById('goScan').click());
    await pg.waitForSelector('#view-check:not(.hidden)', { timeout: 60000 });
    for (const label of (chips || '').split('|').filter(Boolean)){
      const ok = await pg.evaluate(l => {
        const x = [...document.querySelectorAll('#view-check .chip2')].find(e => e.textContent.trim() === l);
        if (x) x.click(); return !!x; }, label);
      if (!ok) console.log('NOTE: no chip "' + label + '" for ' + photo);
    }
    await pg.evaluate(() => document.getElementById('checkYes').click());
    await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
    await pg.waitForFunction(() => window.LoafCat3D && LoafCat3D._pairShot, { timeout: 60000 });
    await new Promise(r => setTimeout(r, 1200));           /* the 512 coat lands */
    return (cache[key] = await pg.evaluate(() => LoafCat3D._pairShot()));
  }
  const rows = [], key = [];
  let ci = 0;
  for (let i = 0; i < PAIRS.length; i++){
    const [mine, other] = PAIRS[i];
    const a = await shoot(mine, CHIPS[ci++]), o = await shoot(other, CHIPS[ci++]);
    const flip = rnd() < 0.5;
    rows.push(flip ? [o, a] : [a, o]);
    key.push((i + 1) + ': ' + (flip ? 'B' : 'A') + ' is ' + mine + (CHIPS[ci - 2] ? ' (' + CHIPS[ci - 2] + ')' : '') + '; the other is ' + other);
    console.log('pair ' + (i + 1) + ' shot');
  }
  const url = await pg.evaluate(async rows => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const S = 512, gap = 14, lab = 54;
    const c = document.createElement('canvas');
    c.width = lab + 2 * S + gap; c.height = rows.length * (S + gap);
    const g = c.getContext('2d'); g.fillStyle = '#150E1D'; g.fillRect(0, 0, c.width, c.height);
    g.font = 'bold 34px sans-serif';
    for (let i = 0; i < rows.length; i++){
      const y = i * (S + gap);
      g.fillStyle = '#EFE4D2'; g.fillText(String(i + 1), 14, y + 44);
      for (let k = 0; k < 2; k++){
        g.drawImage(await load(rows[i][k]), lab + k * (S + gap), y, S, S);
        g.fillStyle = 'rgba(21,14,29,.72)'; g.fillRect(lab + k * (S + gap) + 10, y + 10, 46, 46);
        g.fillStyle = '#FFB23F'; g.fillText(k ? 'B' : 'A', lab + k * (S + gap) + 20, y + 46);
      }
    }
    return c.toDataURL('image/png');
  }, rows);
  writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64'));
  writeFileSync(OUT + '.key.txt', key.join('\n') + '\n');
  console.log('wrote ' + OUT + ' and its key ' + OUT + '.key.txt');
  done(0);
} catch (e) { console.log('PAIR FAILED:', e.message); done(1); }
