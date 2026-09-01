/* battle3d — the gate for the tilted camera 3D battle view.
 *
 *   node test/battle3d.mjs            375x667, the worst common phone
 *   node test/battle3d.mjs 320 568    the narrowest thing anyone still carries
 *   node test/battle3d.mjs 667 375    landscape
 *
 * It boots the REAL built game in a REAL browser with a software GPU, turns the
 * 3D battle view on through the save file the way a player's toggle would, plays
 * a real wind and a real launch, and then looks at the picture.
 *
 * Four things it will not let past:
 *   (a) a #b3d canvas exists and has a size
 *   (b) the dish is not one flat colour   — the black soap assertion. Metal with
 *       nothing to reflect renders as grey soap and a scene with no lights
 *       renders as a black disc, and both of those are a "successful" render.
 *   (c) two shots 600ms apart differ     — the tops are RIDING the simulation and
 *       not standing still at their spawn marks
 *   (d) zero page errors
 *
 * ⛔ (b) and (c) are measured with the 2D canvas HIDDEN. #cv sits on top of #b3d
 * and draws a whole moving game of its own; measuring the composite would let
 * the 2D layer answer both questions and the gate would go green on a 3D layer
 * that never rendered a pixel. The pictures saved for LOOKING at are the
 * composite, because that is what a player sees.
 *
 * ⛔ The dish region comes from the game's own geometry (RAD = min(W,H)*0.44
 * about the centre), so it is the same disc at every viewport and it exists
 * before #b3d does, which is what lets this gate fail honestly on day one.
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'shots-3d');
fs.mkdirSync(OUT, { recursive: true });

const W = parseInt(process.argv[2] || '375', 10);
const H = parseInt(process.argv[3] || '667', 10);
const TAG = W + 'x' + H;
const wait = ms => new Promise(r => setTimeout(r, ms));

const fails = [];
const ok = (cond, msg) => {
  console.log((cond ? '  ok    ' : '  FAIL  ') + msg);
  if (!cond) fails.push(msg);
  return cond;
};

/* Serve over http, not file://: on file:// the origin is "null", the manifest
   fetch is blocked by CORS and the service worker registration throws, and both
   land in the error list this gate is watching.
   ⛔ webp AND glb. The shots tool's map has neither, and a stadium served as
   application/octet-stream is a stadium the GLTFLoader will not parse. */
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
  '.webmanifest':'application/manifest+json', '.png':'image/png', '.webp':'image/webp',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml',
  '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.bin':'application/octet-stream' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_BASE = 'http://127.0.0.1:' + server.address().port + '/index.html';

/* Software GPU. A headless Chrome with no flags has no WebGL at all, so the
   fallback path would be the only path this ever tested. */
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--disable-dev-shm-usage',
         '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

/* The picture reader. A second, blank page decodes the screenshot bytes and
   hands back small numbers instead of a megabyte of pixels: the share of the
   image that is one quantised colour, and a 32x32 average grid to difference
   against the next shot. No image library, no dependency, and it is reading the
   very bytes that were written to disk. */
let eye = null;
async function stat(buf) {
  if (!eye) { eye = await browser.newPage(); await eye.goto('about:blank'); }
  return eye.evaluate(async (b64) => {
    const blob = await (await fetch('data:image/png;base64,' + b64)).blob();
    const bmp = await createImageBitmap(blob);
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data;
    const N = 32, sig = new Float64Array(N * N * 3), cnt = new Float64Array(N * N);
    const hist = new Map();
    for (let y = 0; y < bmp.height; y++) {
      const gy = Math.min(N - 1, (y * N / bmp.height) | 0);
      for (let x = 0; x < bmp.width; x++) {
        const i = (y * bmp.width + x) * 4;
        const r = d[i], gg = d[i + 1], b = d[i + 2];
        const key = ((r >> 3) << 10) | ((gg >> 3) << 5) | (b >> 3);
        hist.set(key, (hist.get(key) || 0) + 1);
        const cell = gy * N + Math.min(N - 1, (x * N / bmp.width) | 0);
        sig[cell * 3] += r; sig[cell * 3 + 1] += gg; sig[cell * 3 + 2] += b;
        cnt[cell]++;
      }
    }
    let top = 0;
    for (const v of hist.values()) if (v > top) top = v;
    const out = [];
    for (let k = 0; k < N * N; k++) {
      const n = cnt[k] || 1;
      out.push(sig[k * 3] / n, sig[k * 3 + 1] / n, sig[k * 3 + 2] / n);
    }
    return { w: bmp.width, h: bmp.height, dom: top / (bmp.width * bmp.height),
             colours: hist.size, sig: out };
  }, buf.toString('base64'));
}
function diff(a, b) {
  let changed = 0, sum = 0;
  const cells = a.sig.length / 3;
  for (let k = 0; k < cells; k++) {
    const dr = Math.abs(a.sig[k * 3] - b.sig[k * 3]);
    const dg = Math.abs(a.sig[k * 3 + 1] - b.sig[k * 3 + 1]);
    const db = Math.abs(a.sig[k * 3 + 2] - b.sig[k * 3 + 2]);
    const m = Math.max(dr, dg, db);
    sum += (dr + dg + db) / 3;
    if (m > 8) changed++;
  }
  return { changedFrac: changed / cells, meanDiff: sum / cells };
}

/* The dish, in CSS pixels, exactly where the game puts it. */
const dishRect = () => page.evaluate(() => {
  const w = innerWidth, h = innerHeight, r = Math.min(w, h) * 0.44;
  return { x: Math.round(w / 2 - r), y: Math.round(h / 2 - r),
           width: Math.round(r * 2), height: Math.round(r * 2) };
});

/* A shot of the 3D layer alone: hide the 2D canvas, photograph the dish, put it
   back. Nothing else in the page is touched and the game keeps running.

   ⛔ bringToFront before EVERY capture. The picture reader below is a second
   tab, and a backgrounded renderer stops producing frames, so the first
   captureScreenshot after using it never returns and the run dies on a protocol
   timeout three minutes later. That looked exactly like a hung game. */
async function dishShot(name) {
  const clip = await dishRect();
  await page.bringToFront();
  await page.evaluate(() => { const c = document.getElementById('cv'); if (c) c.style.visibility = 'hidden'; });
  const buf = await page.screenshot({ clip, captureBeyondViewport: false });
  await page.evaluate(() => { const c = document.getElementById('cv'); if (c) c.style.visibility = ''; });
  if (name) fs.writeFileSync(path.join(OUT, name), buf);
  return buf;
}
const shot = async (name) => {
  await page.bringToFront();
  await page.screenshot({ path: path.join(OUT, name) });
  return name;
};

console.log('battle3d gate, viewport ' + TAG + ', device pixel ratio 2\n');

/* ---------------------------------------------------------------- BOOT ---- */
await page.goto(URL_BASE, { waitUntil: 'load' });
await wait(900);

/* The toggle, through the save file, the way the playthrough gate seeds a rung:
   the state a player would reach by tapping it, reached without depending on a
   control that does not exist yet. Read, set the one field, write it back, so
   nothing else in the save is lost. */
await page.evaluate(() => {
  const k = 'ripcord.save.v1';
  let s = {};
  try { s = JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { s = {}; }
  s.settings = Object.assign({ sound: false, haptics: false, reduceMotion: false },
                             s.settings || {}, { battle3d: true, sound: false });
  s.seen = Object.assign({}, s.seen || {}, { motionAsked: 1 });
  localStorage.setItem(k, JSON.stringify(s));
});
await page.reload({ waitUntil: 'load' });
await wait(900);

const seeded = await page.evaluate(() => {
  try { return !!(JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}').settings || {}).battle3d; }
  catch (e) { return false; }
});
ok(seeded, 'the 3D battle setting survives a reload in the save file');

await page.evaluate(() => { const b = document.querySelector('#howto [data-close]'); if (b) b.click(); });
await wait(600);

/* ------------------------------------------------------------- A BATTLE ---- */
await page.evaluate(() => document.getElementById('mPlay').click());
await wait(700);

const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.20;
await page.mouse.move(cx, cy - R);
await page.mouse.down();
for (let i = 1; i <= 62; i++) {
  const a = -Math.PI / 2 + (i / 46) * Math.PI * 2 * 2.2;
  const rr = R * (1 + 0.10 * Math.sin(i * 0.7));
  await page.mouse.move(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
}
await page.mouse.up();
await wait(400);
const wound = await page.evaluate(() => document.getElementById('card').classList.contains('up'));
ok(wound, 'the wind graded, so there is a launch to make');

await page.evaluate(() => document.getElementById('go').click());

/* Wait for the PHYSICS, not for a clock.
   ⛔ The drop beat is a transform: for its first second the tops are drawn
   falling while the simulation has not stepped once. A software GPU runs this
   page at well under ten frames a second, so "wait 1400ms" landed mid drop, and
   a 3D layer that only animated the fall would have satisfied the motion check
   without ever riding the sim. window.__gap is the game's own hook and it is the
   distance between the two tops: when it CHANGES, the physics clock is running. */
const gap = () => page.evaluate(() => (window.__gap ? window.__gap() : null));
let g0 = null, moving = false;
for (let i = 0; i < 60 && !moving; i++) {
  await wait(200);
  const g = await gap();
  if (g === null || g === 99) continue;
  if (g0 === null) { g0 = g; continue; }
  if (Math.abs(g - g0) > 1e-4) moving = true;
}
ok(moving, 'the simulation is stepping, so the drop beat is over and this is a fight');
const fighting = await page.evaluate(() => document.getElementById('dock').classList.contains('hide'));
ok(fighting, 'the round is running');

/* The view loads its meshes on first use, so give it a bounded chance to finish
   before photographing it. This is a WAIT, not a guarantee: if it never reports
   ready the line below says so and the four checks are still made on whatever is
   actually on the screen. */
let ready3d = false;
for (let i = 0; i < 60 && !ready3d; i++) {
  ready3d = await page.evaluate(() => !!(window.B3D && window.B3D.ready && window.B3D.ready()));
  if (!ready3d) await wait(400);
}
ok(ready3d, 'the 3D view reports itself ready' +
   (ready3d ? '' : ' (it never did, so the pictures below are of whatever did load)'));

await shot('probe-' + TAG + '-battle.png');

/* ------------------------------------------------------------ THE FOUR ---- */
const canvas = await page.evaluate(() => {
  const c = document.getElementById('b3d');
  if (!c) return { there: false };
  const r = c.getBoundingClientRect();
  const cvv = document.getElementById('cv');
  return { there: true, w: Math.round(r.width), h: Math.round(r.height),
           bw: c.width, bh: c.height,
           before: !!(cvv && c.compareDocumentPosition(cvv) & Node.DOCUMENT_POSITION_FOLLOWING) };
});
ok(canvas.there && canvas.w > 0 && canvas.h > 0,
   '(a) a #b3d canvas exists with a size' +
   (canvas.there ? ' (' + canvas.w + 'x' + canvas.h + ' css, ' + canvas.bw + 'x' + canvas.bh + ' backing)'
                 : ' — there is no #b3d element in the page'));
if (canvas.there)
  ok(canvas.before, '     and it sits BEFORE #cv, so the 2D layer draws over it');

/* Both pictures BEFORE either is read, so the 600ms is 600ms of game and not
   600ms plus however long the reader took. */
const bufA = await dishShot('probe-' + TAG + '-dish-1.png');
await wait(600);
const bufB = await dishShot('probe-' + TAG + '-dish-2.png');
const a = await stat(bufA), b = await stat(bufB);

ok(a.dom <= 0.90,
   '(b) the dish is not one flat colour (' + (a.dom * 100).toFixed(1) +
   '% is the commonest colour, ' + a.colours + ' distinct colours in ' + a.w + 'x' + a.h + ')');

const d = diff(a, b);
ok(d.changedFrac >= 0.02,
   '(c) the dish changes over 600ms (' + (d.changedFrac * 100).toFixed(1) +
   '% of cells moved, mean difference ' + d.meanDiff.toFixed(2) + '/255)');

ok(errors.length === 0, '(d) no page errors' + (errors.length ? ':' : ''));
errors.forEach(e => console.log('        ' + e));

await shot('probe-' + TAG + '-late.png');

if (eye) await eye.close();
await browser.close();
server.close();

console.log('\nshots in docs/shots-3d/');
console.log(fails.length ? '\n' + fails.length + ' CHECK' + (fails.length > 1 ? 'S' : '') + ' FAILED'
                         : '\nBATTLE3D OK');
process.exit(fails.length ? 1 : 0);
