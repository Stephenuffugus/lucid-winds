/* Dewball forge REACT FILM: the world reacts (10 Oct 2026), FILMED, not frozen: one bump per kind from the
 * player's camera, a strip of frames from just before the hit to the settle, so a person can see the rock.
 *   node satellites/dewball/tools/forge/react_film.mjs --world 2 --kinds teddy,robot --D 30 --out <dir>
 * Writes <out>/<kind>-strip.png (frames left to right, 100 ms apart) and prints how far the top moved. */
import path from 'path';
import { createRequire } from 'module';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const GAME = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const puppeteer = require(path.resolve(GAME, '..', '..', 'node_modules', 'puppeteer'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const yawOff = +arg('yaw', 0), world = +arg('world', 2), kinds = arg('kinds', 'teddy').split(','), D = +arg('D', 30), out = arg('out', '.');
const srv = await serve({});
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const { execFileSync } = await import('child_process');
for (const kind of kinds) {
  const page = await browser.newPage(); await page.setViewport({ width: 412, height: 915 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(srv.url + 'index.html?dbtest=1&dbseed=12345', { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.meshes', { timeout: 20000 });
  const tgt = await page.evaluate((w, d, kind) => { const B = window.DB_DEV; B.start('level', w); B.setD(d);
    const s = B.state(); let best = null, bd = 1e18;
    for (const o of s.objects) if (o.k === kind) { const q = (o.x - s.ballX) ** 2 + (o.z - s.ballY) ** 2; if (q < bd) { bd = q; best = o; } }
    if (!best) return null; const ang = 0.7, gap = d * 1.6 + best.s * 0.5;
    B.setPos(best.x + Math.cos(ang) * gap, best.z + Math.sin(ang) * gap); B.endFirstRun && B.endFirstRun();
    B.camSettle(); B.aimAt(best.x, best.z, 0.5); B.render(); return { x: best.x, z: best.z, s: best.s, ang }; }, world, D, kind);
  if (!tgt) { console.log(kind, 'not found'); await page.close(); continue; }
  await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 120000, polling: 250 });
  const files = [];
  for (let fr = 0; fr < 9; fr++) {
    await page.evaluate((t) => { const B = window.DB_DEV; for (let k = 0; k < 6; k++) { B.roll(-Math.cos(t.ang), -Math.sin(t.ang)); B.step(1 / 60); }
      if (t.yo) B.setCam(Math.atan2(t.x - B.state().ballX, t.z - B.state().ballY) + t.yo, 0.55); else B.aimAt(t.x, t.z, 0.5); B.render(); }, Object.assign({ yo: yawOff }, tgt));
    const f = path.join(out, `${kind}-f${fr}.png`); await page.screenshot({ path: f, clip: { x: 0, y: 180, width: 412, height: 520 } }); files.push(f);
  }
  const rk = await page.evaluate(() => window.DB_DEV.react());
  execFileSync('python3', ['-c', `
import sys
from PIL import Image
fs=sys.argv[2:]; ims=[Image.open(f).convert('RGB') for f in fs]; w,h=ims[0].size
s=Image.new('RGB',(w*len(ims)//2,h//2)); [s.paste(im.resize((w//2,h//2)),(i*w//2,0)) for i,im in enumerate(ims)]; s.save(sys.argv[1])`, path.join(out, `${kind}-strip.png`), ...files]);
  console.log(kind, 'size', tgt.s, 'kicks', rk.kicks, 'errors', errs.length ? errs.join(' | ') : 'none');
  await page.close();
}
await browser.close(); await srv.close();
