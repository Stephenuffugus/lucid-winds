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
/* Which mode to play. Pangkah goes straight through Play; anything else is
   picked off the Modes sheet, which needs the rungs that open it. */
const MODE = (process.argv[7] || 'pangkah').toLowerCase();
const MODE_ROW = { pangkah:null, pass:'Pass the phone', uri:'Uri', taya:'Taya',
                   tujlub:'Target range', field:'The Field' };
const MODE_NEED = { pangkah:0, pass:0, uri:5, taya:10, tujlub:15, field:24 };
if (!(MODE in MODE_ROW)) { console.error('unknown mode: ' + MODE); process.exit(2); }

/* ⛔ THE FALLBACK RUN. `--nogl` makes every WebGL context request throw before a
   line of the page has run, which is a device with no WebGL, and then asserts
   that the 2D game boots, plays and draws with ZERO page errors and that the
   setting says one calm sentence about it. No picture, no difference, and never
   an error screen. */
const NOGL = process.argv.includes('--nogl');
/* ⛔ THE HOSTILE EYE. `--worst` stops the game's own frame loop and DRIVES the
   view by hand into the states a round only reaches by accident and never on
   demand: both tops out on the rail, one of them lying over, the lean at the
   simulation's maximum, the two of them inside each other, the fall at its
   highest point, and the camera at the hardest punch the game ever throws
   (burst, 1.44). These pictures are DRIVEN, not played, and they are labelled
   that way; the point is to look at the corners of the envelope on purpose
   rather than hope a round wanders into one while somebody is watching. */
const WORST = process.argv.includes('--worst');
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
  /* 2026-09-03: the fleet shell (/music-unlocks.js and friends) lives at the SITE root, one level
     above the games, and index.html includes it by absolute path. Serve it from there, the way the
     host does, instead of failing the gate on a 404 the player will never see. */
  let file = path.join(ROOT, rel);
  if (!fs.existsSync(file) && /^[a-z-]+\.js$/.test(rel)) file = path.join(ROOT, '..', '..', rel);
  const shell = file === path.join(ROOT, '..', '..', rel);
  if ((!file.startsWith(ROOT) && !shell) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
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

if (NOGL) {
  /* before a line of the page runs, and it survives the reload */
  await page.evaluateOnNewDocument(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (/webgl/i.test(String(type))) throw new Error('WebGL is disabled on this device');
      return real.apply(this, arguments);
    };
  });
}

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
async function dishShot(name, keep2D) {
  const clip = await dishRect();
  await page.bringToFront();
  if (!keep2D)
    await page.evaluate(() => { const c = document.getElementById('cv'); if (c) c.style.visibility = 'hidden'; });
  const buf = await page.screenshot({ clip, captureBeyondViewport: false });
  if (!keep2D)
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
await page.evaluate((rung, need) => {
  const k = 'ripcord.save.v1';
  let s = {};
  try { s = JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { s = {}; }
  s.settings = Object.assign({ sound: false, haptics: false, reduceMotion: false },
                             s.settings || {}, { battle3d: true, sound: false });
  s.seen = Object.assign({}, s.seen || {}, { motionAsked: 1 });
  if (rung > 0) { s.rung = rung; s.facing = rung; }
  if (need > 0) s.rung = Math.max(s.rung | 0, need);
  localStorage.setItem(k, JSON.stringify(s));
}, RUNG, MODE_NEED[MODE]);
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
if (MODE_ROW[MODE]) {
  await page.evaluate(() => document.getElementById('mModes').click());
  await wait(500);
  const picked = await page.evaluate((label) => {
    const b = [...document.querySelectorAll('#modesBody .rung')]
      .find(x => x.textContent.indexOf(label) === 0 || x.textContent.trim().indexOf(label) === 0);
    if (!b) return 'no row named ' + label;
    if (b.classList.contains('locked')) return label + ' is still locked';
    b.click();
    return '';
  }, MODE_ROW[MODE]);
  ok(picked === '', 'the ' + MODE + ' mode opens' + (picked ? ': ' + picked : ''));
} else {
  await page.evaluate(() => document.getElementById('mPlay').click());
}
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

/* ------------------------------------------------- THE FALLBACK RUN --------
   No WebGL on this device. Nothing here asks whether the 3D worked; it asks
   whether the GAME did. */
if (NOGL) {
  await shot('probe-nogl-' + TAG + '-battle.png');
  const bad = await page.evaluate(() => ({
    failed: !!(window.B3D && window.B3D.failed && window.B3D.failed()),
    ready:  !!(window.B3D && window.B3D.ready && window.B3D.ready()),
    canvas: (function () {
      const c = document.getElementById('b3d');
      if (!c) return 'absent';
      const r = c.getBoundingClientRect();
      return Math.round(r.width) + 'x' + Math.round(r.height);
    })()
  }));
  ok(bad.failed && !bad.ready, 'the 3D view reports that it could not start here');
  ok(bad.canvas === 'absent', 'and it left nothing behind on the page (#b3d is ' + bad.canvas + ')');

  /* the 2D game, still playing, still drawing, with its own canvas untouched */
  const p1 = await stat(await dishShot('probe-nogl-' + TAG + '-dish-1.png', true));
  await wait(600);
  const p2 = await stat(await dishShot('probe-nogl-' + TAG + '-dish-2.png', true));
  await page.bringToFront();
  ok(p1.dom <= 0.90, 'the 2D game is drawing the dish (' + (p1.dom * 100).toFixed(1) +
     '% is the commonest colour, ' + p1.colours + ' distinct colours)');
  const dd = diff(p1, p2);
  ok(dd.changedFrac >= 0.01, 'and it is playing (' + (dd.changedFrac * 100).toFixed(1) +
     '% of cells moved over 600ms)');

  /* one calm line in the setting, and only when it is true */
  await page.keyboard.press('Escape');
  await wait(700);
  await page.evaluate(() => document.getElementById('mSet').click());
  await wait(500);
  const note = await page.evaluate(() =>
    (document.getElementById('b3dNote') || {}).textContent || '');
  ok(note === '3D could not start on this device.',
     'the setting says one line about it' + (note ? ' ("' + note + '")' : ', but it says nothing'));
  await shot('probe-nogl-' + TAG + '-settings.png');

  ok(errors.length === 0, 'and there were no page errors at all' + (errors.length ? ':' : ''));
  errors.forEach(e => console.log('        ' + e));

  if (eye) await eye.close();
  await browser.close();
  server.close();
  console.log('\nshots in docs/shots-3d/');
  console.log(fails.length ? '\n' + fails.length + ' CHECK' + (fails.length > 1 ? 'S' : '') + ' FAILED'
                           : '\nBATTLE3D FALLBACK OK');
  process.exit(fails.length ? 1 : 0);
}

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
/* ---------------------------------------------- THE INFORMATION LAYER ------
   The tells and the armed marker are anchored through B3D.project when the 3D
   owns the dish. Two ways of showing it, because a picture alone would not tell
   you WHICH camera answered:

   the geometry - a tilted camera foreshortens the dish along the view's vertical
   and not across its width, so the same two radii must project to a shorter span
   up the screen than across it. A flat camera answers with a circle and the two
   spans are equal, so this fails if the wrong camera is being asked;

   and the picture - a real tell, fired through the game's own hook, photographed
   where it lands. */
const proj = await page.evaluate(() => {
  if (!window.B3D || !B3D.project) return null;
  const r = 0.10;
  const e = B3D.project(r, 0), w = B3D.project(-r, 0);
  const n = B3D.project(0, r), f = B3D.project(0, -r), c = B3D.project(0, 0);
  if (!e || !w || !n || !f || !c) return null;
  return { across: Math.abs(e.x - w.x), along: Math.abs(n.y - f.y),
           cx: c.x, cy: c.y, vw: innerWidth, vh: innerHeight };
});
ok(proj && proj.along > 4 && proj.along < proj.across * 0.85,
   'B3D.project answers with the tilted camera, not the flat one' +
   (proj ? ' (' + Math.round(proj.across) + 'px across the dish, ' +
           Math.round(proj.along) + 'px up it)' : ' (it answered nothing)'));
ok(proj && Math.abs(proj.cx - proj.vw / 2) < 2 && Math.abs(proj.cy - proj.vh / 2) < 40,
   'and the middle of the dish lands in the middle of the screen');

await page.evaluate(() => { if (window.__tellProbe) window.__tellProbe('lunge'); });
await wait(120);
await shot('probe-' + TAG + '-tell.png');

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

/* -------------------------------------------------------- THE HOSTILE EYE -- */
if (WORST) {
  const k = await page.evaluate(() => ({ R: SIM.K.arenaR, th: SIM.K.thetaMax }));
  console.log('  note  driving the view by hand: dish radius ' + k.R + 'm, lean ceiling ' +
              k.th + ' rad, camera punch 1.44 (a burst, the hardest the game throws)');
  /* the game's own loop stops here so a hand written state is the last word */
  await page.evaluate(() => {
    window.__raf = window.requestAnimationFrame;
    window.requestAnimationFrame = function () { return 0; };
  });
  await wait(400);
  const rim = k.R * 0.999, th = k.th;
  const top = (x, z, lx, lz, alive) =>
    ({ x, z, w: 600, phase: 3.1, lx, lz, alive, R: 0.0254, cfg: null });
  const cases = [
    ['worst-1-far-rail',  { A: top(0, -rim, 0, -th, true), B: top(0.03, -rim, 0, -th, false),
                            phase: 'play', dropProgress: 1, camz: 1.30 },
     'both out on the FAR rail, one lying over, ringout punch'],
    ['worst-2-near-rail', { A: top(0, rim, 0, th, false), B: top(-0.03, rim, 0, th, true),
                            phase: 'play', dropProgress: 1, camz: 1.30 },
     'both on the NEAR rail, the nearest one lying over'],
    ['worst-3-side-rail', { A: top(rim, 0, th, 0, true), B: top(-rim, 0, -th, 0, true),
                            phase: 'play', dropProgress: 1, camz: 1.44 },
     'opposite side rails at the lean ceiling, burst punch'],
    ['worst-4-inside',    { A: top(0, 0, th * 0.7, 0, true), B: top(0, 0, -th * 0.7, 0, true),
                            phase: 'play', dropProgress: 1, camz: 1.44 },
     'both tops in the same place, leaning apart'],
    ['worst-5-both-dead', { A: top(rim, 0, th, 0, false), B: top(0, -rim, 0, -th, false),
                            phase: 'play', dropProgress: 1, camz: 1.44 },
     'both lying over, one on a side rail and one on the far one'],
    ['worst-6-top-of-drop', { A: top(rim * 0.7, 0, 0, 0, true), B: top(-rim * 0.7, 0, 0, 0, true),
                            phase: 'drop', dropProgress: 0, camz: 1.44 },
     'the very top of the fall, with the camera punched in']
  ];
  /* Where the view thinks the FLOOR is, across the dish. project() puts a sim
     position on screen through the floor height it reads off the stadium mesh,
     so a screen y that climbs sharply at the last radius is the sampler walking
     up the rail wall instead of staying on the play surface. */
  const prof = await page.evaluate((R) => {
    const out = [];
    for (const f of [0, 0.25, 0.5, 0.72, 0.85, 0.95, 0.999]) {
      const p = window.B3D.project(0, -R * f);   // straight out to the far rim
      out.push(f.toFixed(3) + ':' + (p ? Math.round(p.y) : 'null'));
    }
    return out.join('  ');
  }, k.R);
  console.log('  note  screen y of the floor, out to the far rim: ' + prof);

  /* ⛔ #cv is hidden for these. The 2D layer is frozen along with the loop, so
     whatever it last drew - a tell, a banner - would sit in every picture like a
     ghost and read as a bug in the thing being photographed. */
  await page.evaluate(() => { document.getElementById('cv').style.visibility = 'hidden'; });
  for (const [name, st, what] of cases) {
    await page.evaluate(s2 => { window.B3D.sync(s2); }, st);
    await page.bringToFront();
    await page.screenshot({ path: path.join(OUT, 'probe-' + TAG + '-' + name + '.png') });
    console.log('  shot  ' + name + ': ' + what);
  }
  await page.evaluate(() => { document.getElementById('cv').style.visibility = ''; });
  await page.evaluate(() => { if (window.__raf) window.requestAnimationFrame = window.__raf; });
  ok(errors.length === 0, 'nothing in the corners of the envelope raised an error' +
     (errors.length ? ':' : ''));
  errors.forEach(e => console.log('        ' + e));
}

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
for (let i = 0, n = WORST ? 0 : Math.round(PATIENCE / 0.8); i < n && !finished; i++) {
  await wait(800);
  finished = await page.evaluate(() =>
    (window.__gap ? window.__gap() : 0) === 99 ||
    !document.getElementById('dock').classList.contains('hide'));
}
if (finished) {
  await shot('probe-' + TAG + '-finish.png');
} else if (!WORST) {
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
} else if (!WORST) {
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
