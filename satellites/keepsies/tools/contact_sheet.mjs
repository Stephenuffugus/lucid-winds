/**
 * All sixty five marbles, rendered, in one picture.
 *
 *   node tools/contact_sheet.mjs
 *
 * The plan's instruction is exactly one sentence long and it is the whole point:
 * "renders all 65 in a grid at inspect quality and you LOOK at it: any two that
 * read the same at 64 px are a fault to fix."
 *
 * This is not a gate. A machine can tell you two palettes are different numbers;
 * it cannot tell you two marbles look like the same marble. That is a job for
 * eyes, and this makes the picture those eyes need.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const CELL = parseInt(process.argv[2] || '128', 10);
const COLS = 8;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const p = join(ROOT, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

const catalog = JSON.parse(readFileSync(join(ROOT, 'src/data/marbles.json'), 'utf8'));
const rows = Math.ceil(catalog.marbles.length / COLS);
const W = COLS * CELL;
const H = rows * (CELL + 22);

const page404 = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#14170f}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/lib/three.module.min.js"}}</script>
<canvas id="c" width="${W}" height="${H}"></canvas>
<div id="labels"></div>`;

const browser = await puppeteer.launch({
  headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:' + PORT + '/tools/_sheet.html', { waitUntil: 'load' }).catch(() => { });

/* The sheet is built in the page rather than served, so nothing extra is
   committed and the renderer is the game's own. */
await page.setContent(page404, { waitUntil: 'load' });
const result = await page.evaluate(async (cell, cols, tuning, marbles) => {
  const THREE = await import('/lib/three.module.min.js');
  const { RoomEnvironment } = await import('/lib/environments/RoomEnvironment.js');
  const { makeMarbleMaterial } = await import('/src/render/marbleMesh.js?v=20260905a');

  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setClearColor(0x14170f, 1);
  renderer.setSize(canvas.width, canvas.height, false);
  renderer.setScissorTest(true);

  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04);

  const scene = new THREE.Scene();
  scene.environment = env.texture;
  scene.environmentIntensity = tuning.render.envIntensity;
  scene.add(new THREE.HemisphereLight(0xdfe6d0, 0x241c15, 0.9));
  const key = new THREE.DirectionalLight(0xfff4dd, 2.1);
  key.position.set(-1.6, 3.0, 1.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd0ff, 0.6);
  rim.position.set(1.8, 1.1, -2.0);
  scene.add(rim);

  const geo = new THREE.SphereGeometry(1, 48, 24);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 20);
  cam.position.set(0, 0.35, 3.1);
  cam.lookAt(0, 0, 0);

  const labels = document.getElementById('labels');
  const rowsN = Math.ceil(marbles.length / cols);
  for (let i = 0; i < marbles.length; i++) {
    const m = marbles[i];
    const mat = makeMarbleMaterial(m.render, tuning, m.id);
    const mesh = new THREE.Mesh(geo, mat);
    // a real marble's size, relatively: a Peewee is visibly smaller than a taw
    mesh.scale.setScalar(m.diameterMm / 22);
    mesh.rotation.set(0.4, i * 0.7, 0.15);
    scene.add(mesh);
    const col = i % cols, row = Math.floor(i / cols);
    const x = col * cell, y = canvas.height - (row + 1) * (cell + 22) + 22;
    renderer.setViewport(x, y, cell, cell);
    renderer.setScissor(x, y, cell, cell);
    renderer.render(scene, cam);
    scene.remove(mesh);
    mat.dispose();
  }
  geo.dispose();
  return { drawn: marbles.length, w: canvas.width, h: canvas.height };
}, CELL, COLS, JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8')), catalog.marbles);

/* the labels go on afterwards, in 2D, so the WebGL frame is never disturbed */
const withLabels = await page.evaluate((cell, cols, names, w, h) => {
  const src = document.getElementById('c');
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const g = out.getContext('2d');
  g.drawImage(src, 0, 0);
  g.font = '11px system-ui, sans-serif';
  g.textAlign = 'center';
  for (let i = 0; i < names.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = col * cell + cell / 2;
    const cy = (row + 1) * (cell + 22) - 6;
    g.fillStyle = '#98a086';
    let t = names[i];
    while (g.measureText(t).width > cell - 6 && t.length > 4) t = t.slice(0, -2);
    g.fillText(t, cx, cy);
  }
  return out.toDataURL('image/png');
}, CELL, COLS, catalog.marbles.map(m => m.name), result.w, result.h);

const buf = Buffer.from(withLabels.split(',')[1], 'base64');
const { writeFileSync } = await import('node:fs');
writeFileSync(join(OUT, 'k2-contact-sheet.png'), buf);

await browser.close();
server.close();
console.log('drew ' + result.drawn + ' marbles at ' + CELL + ' px into docs/shots/k2-contact-sheet.png ('
  + result.w + ' by ' + result.h + ', ' + (buf.length / 1024).toFixed(0) + ' KB)');
console.log('CONTACT SHEET OK. Now OPEN IT: any two that read the same are a fault.');
