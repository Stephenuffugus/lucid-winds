/* Dewball forge GATE: every model the index names exists, parses through the vendored
 * r147 GLTFLoader + meshopt decoder in a real browser, and draws in two sets; a kind
 * whose file is missing falls back to its primitive and the world still renders.
 *
 *   node satellites/dewball/tools/forge/gate-glb.mjs                       production index (assets/3d/)
 *   node satellites/dewball/tools/forge/gate-glb.mjs --base tools/forge/glbtest/
 *   ... --world w1            one world (default: every world the index touches, one page each)
 *   ... --block teapot        the server 404s that kind's file: proves the primitive fallback
 *   ... --plant missing       an index naming a file that does not exist: MUST go red
 *   ... --plant empty         an index naming nothing: no loader download, primitives, green
 *   ... --shot out.png        a 915x412 picture from the player camera once loading settles
 *
 * Last line is GATE_GLB_PASS or GATE_GLB_FAIL. ⛔ A gate you have not watched fail is
 * decoration: --plant missing is how it is watched failing.
 * ⛔ One browser, one world per page, on this one core box.
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

let base = arg('base', 'assets/3d/');
if (!base.endsWith('/')) base += '/';
const plant = arg('plant', null), block = arg('block', null), shot = arg('shot', null), onlyWorld = arg('world', null);
const virtual = {};
let index;
if (plant === 'missing') { base = '__gate/'; index = { kinds: { teacup: { glb: 'nope-teacup.glb' } } }; virtual['/__gate/index.json'] = JSON.stringify(index); }
else if (plant === 'empty') { base = '__gate/'; index = { kinds: {} }; virtual['/__gate/index.json'] = JSON.stringify(index); }
else {
  const ip = path.join(GAME, base, 'index.json');
  index = fs.existsSync(ip) ? JSON.parse(fs.readFileSync(ip, 'utf8')) : { kinds: {} };
}
const kinds = Object.keys(index.kinds || {});
const fails = [];

/* stage 1, the disk: every named file is there, every kind is a kind */
const cat = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest.json'), 'utf8'));
const byId = Object.fromEntries(cat.kinds.map(k => [k.id, k]));
for (const k of kinds) {
  const f = '/' + base + index.kinds[k].glb;
  if (virtual[f] === undefined && !fs.existsSync(path.join(GAME, base, index.kinds[k].glb))) fails.push('missing file ' + base + index.kinds[k].glb);
  if (!byId[k]) fails.push('not a kind in the catalogue: ' + k);
}

/* stage 2, the browser: one page per world */
const worlds = onlyWorld ? [onlyWorld]
  : kinds.length ? ['w1', 'w2', 'w3', 'w4', 'w5', 'w7', 'w6'].filter(w => kinds.some(k => byId[k] && byId[k].worlds.some(x => x.w === w)))
  : ['w1'];
const srv = await serve({ block: block && index.kinds[block] ? [index.kinds[block].glb] : [], virtual });
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const results = [];
try {
  for (const wid of worlds) {
    const page = await browser.newPage();
    await page.setViewport({ width: 915, height: 412 });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    const logFrom = srv.log.length;
    await page.goto(srv.url + 'index.html?dbtest=1&dbseed=12345&dbglb=' + encodeURIComponent(base), { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.DB_DEV && window.DB_DEV.meshes', { timeout: 20000 });
    const n = await page.evaluate(id => { const w = window.DB_DEV.worlds().find(x => x.id === id); if (!w) return 0; window.DB_DEV.start('level', w.n); return w.n; }, wid);
    if (!n) { fails.push(wid + ': no such world'); await page.close(); continue; }
    await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 120000, polling: 250 });
    const r = await page.evaluate(() => { const D = window.DB_DEV; D.camSettle(); D.render(); return { m: D.meshes(), p: D.perf() }; });
    const asked = srv.log.slice(logFrom);
    const used = kinds.filter(k => byId[k] && byId[k].worlds.some(x => x.w === wid));
    const why = [];
    if (!kinds.length) {
      if (r.m.st !== -1) why.push('empty index but loader state ' + r.m.st);
      if (asked.some(p => p.endsWith('GLTFLoader.js'))) why.push('empty index still downloaded GLTFLoader.js');
    } else {
      if (r.m.st !== 2) why.push('loader state ' + r.m.st + ' ' + JSON.stringify(r.m.err));
      for (const k of used) {
        const ready = r.m.ready.includes(k), failed = r.m.failed.includes(k), lod = r.m.lod[k];
        if (k === block) {
          if (!failed) why.push(k + ' was blocked but did not fail over');
          if (lod) why.push(k + ' was blocked but still has a model set');
        } else {
          if (!ready) why.push(k + (failed ? ' FAILED: ' + r.m.err.filter(e => e.indexOf(k) === 0).join(' | ') : ' never finished loading'));
          else if (byId[k].role !== 'mover' && !lod) why.push(k + ' ready but drawing no model set');
          else if (lod && (lod.near + lod.far > lod.n || lod.near + lod.far === 0)) why.push(k + ' split is impossible ' + JSON.stringify(lod));
        }
      }
    }
    if (errs.length) why.push('page errors: ' + errs.join(' | '));
    if (!(r.p.calls > 0)) why.push('rendered nothing (calls ' + r.p.calls + ')');
    if (shot) await page.screenshot({ path: path.resolve(shot) });
    results.push({ world: wid, loader: r.m.st, ready: r.m.ready.length, failed: r.m.failed, lod: r.m.lod, calls: r.p.calls, tris: r.p.tris, why });
    why.forEach(w => fails.push(wid + ': ' + w));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }

for (const r of results) console.log(JSON.stringify(r));
if (fails.length) { console.log('GATE_GLB_FAIL ' + fails.length + ' problem(s):\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('GATE_GLB_PASS ' + (plant ? 'plant=' + plant + ' ' : '') + 'base=' + base + ' kinds=' + kinds.length + ' worlds=' + worlds.join(',') + (block ? ' blocked=' + block : ''));
