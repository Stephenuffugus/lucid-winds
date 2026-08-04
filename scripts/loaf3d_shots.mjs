#!/usr/bin/env node
/* LOAF 3D coat painter — LOOK pass.
   Serves the repo, opens loaf.html headless with real (SwiftShader) WebGL,
   unhides the tuner stage, drives LoafCat3D.setDNA through a spread of very
   different cats, and screenshots each one. The shots are the deliverable:
   READ THEM BY EYE. Usage: node scripts/loaf3d_shots.mjs [outDir] */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = process.argv[2] || 'assets/loaf/shots';
mkdirSync(join(ROOT, OUT), { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css' };
const srv = createServer(async (req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try {
    const b = await readFile(p);
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(b);
  } catch (e) { res.writeHead(404); res.end('nope'); }
});
await new Promise(r => srv.listen(8931, r));

const CATS = [
  ['tabby-default', null],                                     /* boot state */
  ['void-black', { base: '#1A1714', marking: '#0A0906', white: '#F2EADF', eye: '#E8B23F',
    nose: '#2A2226', pattern: 'solid', whiteGrade: 0, whiteEdge: 0.5, seed: 11, chonk: 0.55, ear: 0.5, muzzle: 0.45, floof: 0.3 }],
  ['ginger-classic-bib', { base: '#D9822B', marking: '#A34F14', white: '#F6EFE2', eye: '#C8963F',
    nose: '#E09AA6', pattern: 'classic', whiteGrade: 3.0, whiteEdge: 0.5, seed: 22, chonk: 0.7, ear: 0.5, muzzle: 0.5, floof: 0.35 }],
  ['calico', { base: '#D9822B', marking: '#241B12', white: '#F6EFE2', eye: '#8FB84A',
    nose: '#E09AA6', pattern: 'calico', whiteGrade: 6.4, whiteEdge: 0.7, seed: 33, chonk: 0.5, ear: 0.55, muzzle: 0.45, floof: 0.4 }],
  ['colourpoint', { base: '#EFE3D2', marking: '#4A3328', white: '#F6EFE2', eye: '#7AA8E8',
    nose: '#8A5A52', pattern: 'point', whiteGrade: 0, whiteEdge: 0.5, seed: 44, chonk: 0.35, ear: 0.75, muzzle: 0.6, floof: 0.2 }],
  ['grey-mackerel-socks', { base: '#8C8C94', marking: '#3D3D46', white: '#F2EFE9', eye: '#B8D24A',
    nose: '#6E5A60', pattern: 'mackerel', whiteGrade: 2.9, whiteEdge: 0.4, seed: 55, chonk: 0.6, ear: 0.5, muzzle: 0.4, floof: 0.6 }],
  /* morph extremes: these two must look VISIBLY different or the tuner lies */
  ['morphs-min', { base: '#9A7248', marking: '#4A3320', white: '#F2EADF', eye: '#C8D94A',
    nose: '#E09AA6', pattern: 'solid', whiteGrade: 0, seed: 1, chonk: 0, ear: 0, muzzle: 0, floof: 0 }],
  ['morphs-max', { base: '#9A7248', marking: '#4A3320', white: '#F2EADF', eye: '#C8D94A',
    nose: '#E09AA6', pattern: 'solid', whiteGrade: 0, seed: 1, chonk: 1, ear: 1, muzzle: 1, floof: 1 }]
];

const browser = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 720, height: 900 });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await page.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await page.goto('http://127.0.0.1:8931/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

const ok = await page.waitForFunction(
  () => window.LoafCat3D && window.LoafCat3D.setDNA, { timeout: 30000 }).catch(() => null);
if (!ok) { console.log('FAIL: LoafCat3D.setDNA never appeared'); process.exit(1); }

/* pure CSS unhide of the stage - the module is already live and rendering */
await page.evaluate(() => {
  document.getElementById('view-room').classList.remove('hidden');
  document.getElementById('tunerBody').classList.remove('hidden');
  document.getElementById('tuner').scrollIntoView();
});
await new Promise(r => setTimeout(r, 900));

for (const [name, dna] of CATS) {
  if (dna) await page.evaluate(d => window.LoafCat3D.setDNA(d), dna);
  await new Promise(r => setTimeout(r, 900));          /* 512px repaint lands at ~260ms */
  const el = await page.$('#stage3d');
  await el.screenshot({ path: join(ROOT, OUT, name + '.png') });
  console.log('shot', name);
}
/* one wide shot of the whole tuner for framing/context */
await page.screenshot({ path: join(ROOT, OUT, 'wide-tuner.png') });
await browser.close();
srv.close();
console.log('done ->', OUT);
