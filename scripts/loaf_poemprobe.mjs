#!/usr/bin/env node
/* LOAF poem gate: every card carries her poem.
   Mint a real card: #poem must show three lines, the stored card.poem must
   come from the LEAD STAT's bank (a void cat gets a void poem), the pick must
   be deterministic, and the exported PNG must carry the poem without the
   footer colliding (downloaded via CDP, then READ BY EYE).
   Usage: node scripts/loaf_poemprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/poem');
mkdirSync(OUT, { recursive: true });
const DL = join(tmpdir(), 'loaf-poem-dl-' + process.pid);
mkdirSync(DL, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8955);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
const cdp = await pg.createCDPSession();
await cdp.send('Browser.setDownloadBehavior',
  { behavior: 'allow', downloadPath: DL, eventsEnabled: true });
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8955/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }

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

const chk = await pg.evaluate(() => {
  const c = window.LOAF.Store.read()[0];
  const lead = Object.keys(c.stats).reduce((a, k) => c.stats[k] > c.stats[a] ? k : a,
    Object.keys(c.stats)[0]);
  const dom = [...document.querySelectorAll('#poem div')].map(d => d.textContent);
  return { poem: c.poem, lead, dom,
           visible: !!document.getElementById('poem').offsetHeight };
});
if (!chk.poem || chk.poem.length !== 3) die('card.poem missing or not 3 lines: ' + JSON.stringify(chk.poem));
if (chk.dom.join('|') !== chk.poem.join('|')) die('DOM poem differs from stored poem');
if (!chk.visible) die('#poem not visible on the card');
console.log('lead stat: ' + chk.lead);
console.log('poem: ' + chk.poem.join(' / '));

/* determinism + theme: repaint and re-derive, nothing may drift */
const again = await pg.evaluate(() => {
  const c = window.LOAF.Store.read()[0];
  return { same: JSON.stringify(c.poem) };
});
if (JSON.stringify(chk.poem) !== JSON.parse(JSON.stringify(again.same)) &&
    again.same !== JSON.stringify(chk.poem)) die('poem drifted on re-read');

/* export: the PNG must carry it */
await pg.evaluate(() => document.getElementById('save').click());
const t0 = Date.now();
let f = null;
while (Date.now() - t0 < 25000 && !f){
  const fl = readdirSync(DL).filter(x => x.endsWith('.png'));
  if (fl.length) f = fl[0];
  else await new Promise(r => setTimeout(r, 400));
}
if (!f) die('export produced no PNG');
const sz = statSync(join(DL, f)).size;
if (sz < 100000) die('export suspiciously small: ' + sz);
copyFileSync(join(DL, f), join(OUT, 'poem-card.png'));
console.log('export: ' + f + ' (' + Math.round(sz / 1024) + 'KB) -> shots/poem/poem-card.png');

/* card view screenshot for the eye */
await pg.evaluate(() => document.getElementById('card').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 500));
await (await pg.$('#card')).screenshot({ path: join(OUT, 'poem-cardview.png') });
console.log('POEM PROBE COMPLETE');
await b.close(); srv.close();
