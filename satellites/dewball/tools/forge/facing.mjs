/* Dewball forge FACING: which way does a fitted model look? One picture per file, seen from
 * above and from the side, with a red arrow on the game's +Z, the way movers walk
 * (stepMovers: velocity (sin rot, cos rot), rotation.y = rot). A creature whose head is not
 * at the arrow walks sideways or backwards; fix it with dewfit's --yaw kind=degrees.
 *
 *   node satellites/dewball/tools/forge/facing.mjs --files tools/forge/fitted/t2/ant.glb,... --out <dir> [--front 1]
 *   (--front 1: the right panel looks at the model's FRONT from +Z instead of its side)
 *
 * Paths are relative to the game folder (the page loads them through serve.mjs). Writes
 * <out>/<name>-facing.png. ⛔ Open every picture; a red arrow is not a look.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..', '..');
const puppeteer = require(path.resolve(GAME, '..', '..', 'node_modules', 'puppeteer'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const files = arg('files', '').split(',').filter(Boolean);
const out = path.resolve(arg('out', '.'));
if (!files.length) { console.log('usage: --files a.glb,b.glb --out dir'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>
 body{margin:0;background:#f3efe4;font:14px sans-serif;color:#333} #l{position:absolute;left:8px;top:6px} #r{position:absolute;left:368px;top:6px}
</style></head><body><canvas id="c" width="720" height="360"></canvas><div id="l">from above</div><div id="r">from the side (+Z to the right)</div>
<script src="/three.min.js"></script><script src="/GLTFLoader.js"></script><script src="/meshopt_decoder.js"></script>
<script>
window.look = function(url){ return new Promise(function(ok, bad){
  var c = document.getElementById('c'), r = new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true });
  r.setScissorTest(true);
  var sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xffffff, 0x8a8170, 0.9)); var d = new THREE.DirectionalLight(0xffffff, 0.6); d.position.set(3, 6, 4); sc.add(d);
  var L = new THREE.GLTFLoader(); if (window.MeshoptDecoder) L.setMeshoptDecoder(window.MeshoptDecoder);
  L.load(url, function(g){
    sc.add(g.scene); var b = new THREE.Box3().setFromObject(g.scene), s = b.getSize(new THREE.Vector3()), m = b.getCenter(new THREE.Vector3());
    var R = Math.max(s.x, s.y, s.z) * 0.75;
    var arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(m.x, b.max.y + R * 0.05, m.z), R * 1.25, 0xd02020, R * 0.3, R * 0.18);
    sc.add(arrow);
    var top = new THREE.OrthographicCamera(-R, R, R, -R, 0.01, R * 40); top.position.set(m.x, b.max.y + R * 10, m.z); top.up.set(0, 0, -1); top.lookAt(m.x, m.y, m.z);
    var side = new THREE.OrthographicCamera(-R, R, R, -R, 0.01, R * 40);
    if (window.FRONT) side.position.set(m.x, m.y + R * 2, m.z + R * 10); else side.position.set(m.x - R * 10, m.y, m.z);
    side.lookAt(m.x, m.y, m.z);
    r.setClearColor(0xf3efe4);
    r.setViewport(0, 0, 360, 360); r.setScissor(0, 0, 360, 360); r.render(sc, top);
    r.setViewport(360, 0, 360, 360); r.setScissor(360, 0, 360, 360); r.render(sc, side);
    ok({ size: [s.x, s.y, s.z].map(function(v){ return +v.toFixed(2); }) });
  }, undefined, function(e){ bad(String(e && e.message || e)); });
}); };
</script></body></html>`;

const srv = await serve({ virtual: { '/__facing/index.html': PAGE } });
const browser = await puppeteer.launch({ headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const fails = [];
try {
  for (const f of files) {
    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 360 });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(srv.url + '__facing/index.html', { waitUntil: 'load' });
    try {
      if (arg('front', null)) await page.evaluate(() => { window.FRONT = 1; document.getElementById('r').textContent = 'from the front (+Z), a little above'; });
      const r = await page.evaluate(u => window.look(u), '/' + f.replace(/^\/+/, ''));
      const name = path.basename(path.dirname(f)) + '-' + path.basename(f, '.glb');
      const file = path.join(out, name + '-facing.png');
      await page.screenshot({ path: file });
      console.log(path.relative(process.cwd(), file), JSON.stringify(r));
    } catch (e) { fails.push(f + ': ' + e.message); }
    if (errs.length) fails.push(f + ': page errors ' + errs.join(' | '));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
if (fails.length) { console.log('FACING_FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('FACING ' + files.length + ' written to ' + path.relative(process.cwd(), out));
