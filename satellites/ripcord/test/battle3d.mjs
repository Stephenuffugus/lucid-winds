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
/* A phone is device pixel ratio 2 and that is the default. The argument exists
   because this runs on a software rasteriser: at 2 the whole screen is a million
   fragments of physically based shading per frame, and being able to halve that
   is the difference between watching a round finish and watching a budget run
   out. Every picture kept in the repo is taken at 2. */
const DPR = parseFloat(process.argv[4] || '2');
/* Seconds to wait for a round to finish before giving up on the finish and drop
   pictures. The default keeps a routine run short; raise it when the pictures
   are the point. See the note where it is spent. */
const PATIENCE = parseFloat(process.argv[5] || '100');
/* Which rung to fight. The default is the first one, which is what a new player
   meets and what the four checks should be measured against. A higher one is how
   the finish picture gets taken inside a budget: on a software rasteriser this
   page runs at about one frame a second and the frame loop caps dt at 0.05, so
   the simulation advances at a twentieth of wall clock and a first rung round
   that lasts forty seconds takes thirteen minutes to watch. Against rung 23 the
   stock build is taken apart in a few seconds of it. */
const RUNG = parseInt(process.argv[6] || '0', 10);
const TAG = W + 'x' + H + (DPR === 2 ? '' : '@' + DPR);
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
await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });

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

console.log('battle3d gate, viewport ' + W + 'x' + H + ', device pixel ratio ' + DPR +
            ', rung ' + (RUNG + 1) + '\n');

/* ---------------------------------------------------------------- BOOT ---- */
await page.goto(URL_BASE, { waitUntil: 'load' });
await wait(900);

/* The toggle, through the save file, the way the playthrough gate seeds a rung:
   the state a player would reach by tapping it, reached without depending on a
   control that does not exist yet. Read, set the one field, write it back, so
   nothing else in the save is lost. */
await page.evaluate((rung) => {
  const k = 'ripcord.save.v1';
  let s = {};
  try { s = JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { s = {}; }
  s.settings = Object.assign({ sound: false, haptics: false, reduceMotion: false },
                             s.settings || {}, { battle3d: true, sound: false });
  s.seen = Object.assign({}, s.seen || {}, { motionAsked: 1 });
  if (rung > 0) { s.rung = rung; s.facing = rung; }
  localStorage.setItem(k, JSON.stringify(s));
}, RUNG);
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

const gap = () => page.evaluate(() => (window.__gap ? window.__gap() : null));
const fighting = await page.evaluate(() => document.getElementById('dock').classList.contains('hide'));
ok(fighting, 'the round is running');

/* The view loads its meshes on first use, so give it a bounded chance to finish
   before anything is timed against it. This is a WAIT, not a guarantee: if it
   never reports ready the line below says so and the four checks are still made
   on whatever is actually on the screen. */
let ready3d = false;
for (let i = 0; i < 90 && !ready3d; i++) {
  ready3d = await page.evaluate(() => !!(window.B3D && window.B3D.ready && window.B3D.ready()));
  if (!ready3d) await wait(400);
}
ok(ready3d, 'the 3D view reports itself ready' +
   (ready3d ? '' : ' (it never did, so the pictures below are of whatever did load)'));

/* What this machine is actually managing, because every budget below is spent
   in wall clock and the game is spending it in frames. Reported, never asserted
   on: this is a software rasteriser on two cores and it is not a phone. */
const fps = await page.evaluate(() => new Promise(res => {
  let n = 0; const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
                       else res(Math.round(n * 1000 / (performance.now() - t0))); };
  requestAnimationFrame(tick);
}));
console.log('  note  ' + fps + ' frames per second here. The frame loop caps dt at 0.05, so below' +
            ' 20fps\n        the simulation itself advances slower than wall clock.');

/* Wait for the PHYSICS, not for a clock.
   ⛔ The drop beat is a transform: for its first second the tops are drawn
   falling while the simulation has not stepped once. A 3D layer that animated
   only the fall would satisfy the motion check below without ever riding the
   sim. window.__gap is the game's own hook and it is the distance between the
   two tops: when it CHANGES, the physics clock is running. */
let g0 = null, moving = false;
for (let i = 0; i < 150 && !moving; i++) {
  await wait(300);
  const g = await gap();
  if (g === null || g === 99) continue;
  if (g0 === null) { g0 = g; continue; }
  if (Math.abs(g - g0) > 1e-4) moving = true;
}
ok(moving, 'the simulation is stepping, so the drop beat is over and this is a fight');

await shot('probe-' + TAG + '-mid.png');

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
/* ⛔ AND BACK TO THE FRONT. Reading the pictures happens on a second tab, and a
   backgrounded page has its animation frames throttled to a crawl: the finish
   watch below spent eight minutes staring at a page that was being given about
   one frame every five seconds, and reported an unfinished round about a round
   that had barely started. Same tab, second time it has bitten. */
await page.bringToFront();

ok(a.dom <= 0.90,
   '(b) the dish is not one flat colour (' + (a.dom * 100).toFixed(1) +
   '% is the commonest colour, ' + a.colours + ' distinct colours in ' + a.w + 'x' + a.h + ')');

const d = diff(a, b);
/* One percent of a 32 by 32 grid is ten cells. A scene that is not moving scores
   exactly zero here, because the renderer is a function of the state it was
   handed and two identical states give two identical pictures; every run with
   the simulation riding has scored between 2.6 and 6.4. Ten cells sits clear of
   both. */
ok(d.changedFrac >= 0.01,
   '(c) the dish changes over 600ms (' + (d.changedFrac * 100).toFixed(1) +
   '% of cells moved, mean difference ' + d.meanDiff.toFixed(2) + '/255)');

ok(errors.length === 0, '(d) no page errors' + (errors.length ? ':' : ''));
errors.forEach(e => console.log('        ' + e));

/* ------------------------------------------------------ A FINISH, AND A DROP
   A picture of two tops circling says nothing about the two moments that
   actually cost something to get right: the camera punch on a finish with a top
   lying over, and the fall at the start of a round. Both are photographed here,
   and both are BOUNDED: a round that outlasts the budget says so and leaves the
   picture untaken rather than hanging the gate.

   ⛔ Under a software GPU this page runs well below twenty frames a second and
   the frame loop caps dt at 0.05, so the simulation itself advances at roughly
   half of wall clock. A round that takes twenty seconds to play takes forty to
   watch. That is why these two are the last things done and why they have a
   ceiling. */
let finished = false;
/* ⛔ POLL SLOWLY. Every evaluate is a round trip into a page that is managing
   about one frame a second, and asking it twice a second was taking a real share
   of the frames the round needs in order to happen at all: the first version of
   this watched for five minutes and moved the simulation about six seconds.
   One question every two seconds, and the answer covers BOTH endings - a top
   went over, or the clock ran out and the dock came back. A detector that can
   only see one of the two endings reports "still fighting" about a finished
   round. */
for (let i = 0, n = Math.round(PATIENCE / 0.8); i < n && !finished; i++) {
  await wait(800);
  finished = await page.evaluate(() =>
    (window.__gap ? window.__gap() : 0) === 99 ||
    !document.getElementById('dock').classList.contains('hide'));
}
if (finished) {
  await shot('probe-' + TAG + '-finish.png');
} else {
  console.log('  note  the round had not finished inside ' + PATIENCE + 's, so there is no finish shot');
}

/* the drop, on a SECOND round, where the meshes are already in hand and the
   fall is not racing a download */
let secondRound = false;
if (finished) {
  for (let i = 0; i < 40 && !secondRound; i++) {
    await wait(500);
    secondRound = await page.evaluate(() =>
      !document.getElementById('dock').classList.contains('hide') &&
      !document.getElementById('menu').classList.contains('up'));
  }
}
if (secondRound) {
  await page.mouse.move(cx, cy - R);
  await page.mouse.down();
  for (let i = 1; i <= 62; i++) {
    const a = -Math.PI / 2 + (i / 46) * Math.PI * 2 * 2.2;
    await page.mouse.move(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
  }
  await page.mouse.up();
  await wait(300);
  await page.evaluate(() => document.getElementById('go').click());
  await shot('probe-' + TAG + '-launch.png');
} else {
  console.log('  note  no second round inside the budget, so there is no launch shot');
}

await shot('probe-' + TAG + '-late.png');

if (eye) await eye.close();
await browser.close();
server.close();

console.log('\nshots in docs/shots-3d/');
console.log(fails.length ? '\n' + fails.length + ' CHECK' + (fails.length > 1 ? 'S' : '') + ' FAILED'
                         : '\nBATTLE3D OK');
process.exit(fails.length ? 1 : 0);
