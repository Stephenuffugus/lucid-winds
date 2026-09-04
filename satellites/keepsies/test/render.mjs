/**
 * The black soap gate.
 *
 *   node test/render.mjs [width] [height] [dpr]
 *
 * A page that boots and paints nothing passes every unit test in the repository.
 * This one drives the real page in real Chrome on a software rasteriser and asks
 * four questions a green unit test cannot answer:
 *
 *   (a) zero page errors and zero console errors
 *   (b) the frame is not one flat colour        the black soap assertion: glass
 *       with nothing to reflect renders as a dark blob, and so does a scene with
 *       the lights off, and so does a canvas that never drew
 *   (c) the PLAY button is reachable by a thumb  located with elementFromPoint at
 *       its drawn centre and measured in RENDERED pixels, never el.click()
 *   (d) two frames 600 ms apart differ           the marble is RIDING the physics
 *       and not sitting in a still life
 *
 * Shape copied from satellites/ripcord/test/battle3d.mjs, including the reason
 * for the swiftshader flags: a headless Chrome with no flags has no WebGL at
 * all, so without them the fallback path would be the only path ever tested.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const W = parseInt(process.argv[2] || '375', 10);
const H = parseInt(process.argv[3] || '667', 10);
const DPR = parseFloat(process.argv[4] || '2');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp'
};
/* The fleet's music ladder is served from the SITE root, not from the game's
   folder, so a server that only knows this folder 404s it and the gate reports a
   page error on a file that is fine in production. Serve it from where it lives. */
const SITE = join(ROOT, '..', '..');
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];
const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT;
  const p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1';

const browser = await puppeteer.launch({
  headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });

const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('requestfailed', r => errors.push('requestfailed: ' + r.url() + ' ' + (r.failure() || {}).errorText));

/* The picture reader. A second blank page decodes the screenshot bytes and hands
   back small numbers instead of a megabyte of pixels: the share of the frame
   that is one quantised colour, and a 32x32 grid to difference against the next
   shot. It is reading the very bytes that were written to disk. */
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
        hist.set(((r >> 3) << 10) | ((gg >> 3) << 5) | (b >> 3), (hist.get(((r >> 3) << 10) | ((gg >> 3) << 5) | (b >> 3)) || 0) + 1);
        const cell = gy * N + Math.min(N - 1, (x * N / bmp.width) | 0);
        sig[cell * 3] += r; sig[cell * 3 + 1] += gg; sig[cell * 3 + 2] += b;
        cnt[cell]++;
      }
    }
    let top = 0;
    for (const v of hist.values()) if (v > top) top = v;
    let lum = 0;
    for (let i = 0; i < d.length; i += 4) lum += (d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722);
    lum /= (d.length / 4) * 255;
    for (let i = 0; i < N * N; i++) { const n = Math.max(1, cnt[i]); sig[i * 3] /= n; sig[i * 3 + 1] /= n; sig[i * 3 + 2] /= n; }
    return { dom: top / (bmp.width * bmp.height), colours: hist.size, lum, sig: [...sig] };
  }, buf.toString('base64'));
}

function diff(a, b) {
  let moved = 0, sum = 0;
  for (let i = 0; i < a.sig.length; i += 3) {
    const d = Math.abs(a.sig[i] - b.sig[i]) + Math.abs(a.sig[i + 1] - b.sig[i + 1]) + Math.abs(a.sig[i + 2] - b.sig[i + 2]);
    sum += d / 3;
    if (d / 3 > 2) moved++;
  }
  return { movedFrac: moved / (a.sig.length / 3), meanDiff: sum / (a.sig.length / 3) };
}

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });

/* (c) the control, proven the only honest way: what is actually under the pixel
   at the middle of the button, and how big the button really is at this width. */
const btn = await page.evaluate(() => {
  const b = document.getElementById('play');
  const r = b.getBoundingClientRect();
  const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
  const hit = document.elementFromPoint(cx, cy);
  return { w: r.width, h: r.height, hitId: hit ? hit.id : null, hitTag: hit ? hit.tagName : null, cx, cy };
});
say(btn.hitId === 'play', '(c) PLAY is what the thumb lands on at its centre: elementFromPoint gave '
  + (btn.hitId || btn.hitTag));
say(btn.h >= 48 && btn.w >= 48, '(c) PLAY measures ' + btn.w.toFixed(0) + ' by ' + btn.h.toFixed(0)
  + ' rendered px at ' + W + ' wide, the floor is 48');

await page.mouse.click(btn.cx, btn.cy);
/* DIRECTIONS BEFORE PLAY: the rules card stands between the title and the first
   match, and it is asserted here so nobody quietly removes it. */
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'rules', { timeout: 20000 });
const go = await page.evaluate(() => {
  const b = document.getElementById('rulesGo');
  const r = b.getBoundingClientRect();
  const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
  const hit = document.elementFromPoint(cx, cy);
  return { w: r.width, h: r.height, hitId: hit ? hit.id : null, cx, cy };
});
say(go.hitId === 'rulesGo' && go.h >= 48,
  '(c) the rules card comes before the first match and its button is '
  + go.w.toFixed(0) + ' by ' + go.h.toFixed(0) + ' rendered px');
await page.mouse.click(go.cx, go.cy);
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'match', { timeout: 20000 });
await page.evaluate(() => window.KEEPSIES_DEV.settle(1400));
await new Promise(r => setTimeout(r, 300));

const shotA = await page.screenshot({ path: join(OUT, 'k1-ring-' + W + '.png') });
const a = await stat(shotA);
/* ⛔ The threshold is 0.72, not Ripcord's 0.92, because 0.92 could not catch its
   own failure here. Watched: with every light removed, the sky removed and the
   clear colour black, this frame still read 57.5% dominant across 495 colours
   and PASSED. Two reasons, both worth knowing. The dirt is lit by the PMREM
   room environment, which survives deleting every light; and the marble's fake
   glass is lit by its own uniform, not by the scene, so it looks the same in the
   dark. A gate you have not watched fail is decoration, and this one was.

   It sat at 0.45 while K0 framed one marble close up. A Ringer board framed at
   three metres is legitimately mostly dirt and reads 56%, so the flat colour
   test alone cannot separate a real board from a dead one at this distance. The
   LUMINANCE BAND below is what actually catches the dark now: the same lights
   off scene reads 0.7 percent against a floor of 16. */
say(a.dom < 0.72, '(b) the frame is not one flat colour: the commonest colour is '
  + (a.dom * 100).toFixed(1) + '% of it, across ' + a.colours + ' colours');
say(a.lum > 0.16 && a.lum < 0.90, '(b) the frame is lit: mean luminance '
  + (a.lum * 100).toFixed(1) + '%, the band is 16 to 90');

/* (d) a real snap through the real Knuckle, then two frames 600 ms apart. A
   still life would give the same picture twice; a marble under physics will not. */
await page.evaluate(() => {
  const t = window.KEEPSIES_DEV.state().match.taw;
  if (!t) return null;
  const out = [];
  for (let i = 0; i <= 18; i++) out.push({ x: t.x, y: t.y - (300 * i / 18), t: 1000 + 55 * i / 18 });
  return window.KEEPSIES_DEV.flick(out);
});
await new Promise(r => setTimeout(r, 120));
const b1 = await stat(await page.screenshot());
await new Promise(r => setTimeout(r, 600));
const b2 = await stat(await page.screenshot());
const d = diff(b1, b2);
say(d.movedFrac > 0.02, '(d) two frames 600 ms apart differ: ' + (d.movedFrac * 100).toFixed(1)
  + '% of cells moved, mean difference ' + d.meanDiff.toFixed(2) + ' of 255');

const st = await page.evaluate(() => { window.KEEPSIES_DEV.settle(1400); return window.KEEPSIES_DEV.state(); });
say(st.match && st.match.shots >= 1, '(d) the match is being played: ' + st.match.shots
  + ' shots, ' + st.match.mibsLeft + ' mibs left in the ring, pocketed ' + st.match.pocketed.join(' and '));

say(errors.length === 0, '(a) zero page errors' + (errors.length ? ': ' + errors.slice(0, 4).join(' | ') : ''));

/* the small screen, and the worst angle a player can find */
await page.setViewport({ width: 320, height: 568, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: join(OUT, 'k1-ring-320.png') });
const small = await page.evaluate(() => {
  const b = document.getElementById('pause').getBoundingClientRect();
  return { w: b.width, h: b.height };
});
say(small.h >= 48 && small.w >= 48, '(c) the Pause control measures ' + small.w.toFixed(0) + ' by '
  + small.h.toFixed(0) + ' rendered px at 320 wide');

/* The worst angle, on purpose: the camera driven BELOW the ground plane, looking
   up through it. A disc drawn one sided shows the whole world through its own
   floor and no green gate has ever noticed that by itself. */
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await new Promise(r => setTimeout(r, 300));
// the lowest a PLAYER can actually get: the rig clamps at the ground
const low = await page.evaluate(() => window.KEEPSIES_DEV.camera(30, -40, 0.9));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: join(OUT, 'k1-ring-lowest.png') });
say(low.elevationDeg >= 0, '(e) the camera cannot go under the ground: asked for -40 degrees, got '
  + low.elevationDeg + ' degrees');
// and what is down there anyway, forced, because the shot is the evidence
await page.evaluate(() => window.KEEPSIES_DEV.camera(30, -22, 0.9, { allowUnder: true }));
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: join(OUT, 'k1-ring-under.png') });

writeFileSync(join(OUT, 'k1-render-report.txt'),
  'render gate ' + new Date().toISOString() + '\n'
  + 'flat colour share ' + (a.dom * 100).toFixed(1) + '%, ' + a.colours + ' colours\n'
  + 'cells moved in 600 ms ' + (d.movedFrac * 100).toFixed(1) + '%, mean diff ' + d.meanDiff.toFixed(2) + '\n'
  + 'PLAY ' + btn.w.toFixed(0) + 'x' + btn.h.toFixed(0) + ' px, Pause at 320 ' + small.w.toFixed(0) + 'x' + small.h.toFixed(0) + ' px\n'
  + 'page errors ' + errors.length + '\n');

await browser.close();
server.close();

console.log('\nshots in docs/shots: k1-ring-375.png, k1-ring-320.png, k1-ring-lowest.png, k1-ring-under.png');
console.log(fails.length ? '\n' + fails.length + ' FAILED\nRENDER FAILED' : '\nRENDER OK');
process.exit(fails.length ? 1 : 0);
