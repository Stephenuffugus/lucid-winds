/* G2, EVERY FRAME IS ITS FILE (Lane D). For every key in assets/atlas/map.js the loader's own object
   (SH_DEV.img) must be an <img> on a blob URL, and it is compared with the loose PNG it replaced through
   getImageData, drawn 1:1 AND drawn at a quarter size at a fractional position (the game downscales most art,
   and Chrome filters a downscaled canvas differently from a downscaled image: the first version of the atlas
   handed back canvases and put crisper, aliased sprites on the board while a 1:1 check stayed green).
   PNG is lossless, so the law is ZERO differing bytes at both scales, across every frame. A built in plant runs
   every time: a canvas copy of one frame must FAIL the quarter size comparison, or this gate is blind to the
   fault it exists for. The image tags: every data-g and menu glyph tag carries its frame's blob URL, and that
   URL draws to the file's pixels.
   Usage (from satellites/stream-hop):  node test/atlas-identity.mjs [--plant]
   --plant serves a map with one frame's x moved by one pixel, and this gate must go red. */
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { serve, ROOT } from './serve.mjs';
const PLANT = process.argv.includes('--plant');
const PORT = 8974, MAP = '/satellites/stream-hop/assets/atlas/map.js';
const mapSrc = readFileSync(join(ROOT, 'satellites/stream-hop/assets/atlas/map.js'), 'utf8');
const planted = mapSrc.replace(/("ui\/glyph-music":\["[^"]+",)(\d+)/, (m, a, x) => a + (+x + 1));
if (PLANT && planted === mapSrc) { console.log('PLANT DID NOT APPLY'); process.exit(2); }
const srv = await serve(PORT, p => (PLANT && p === MAP) ? { headers: { 'Content-Type': 'text/javascript' }, body: planted } : null);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 412, height: 915 });
const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/?shtest=1`, { waitUntil: 'load', timeout: 90000 });
const res = await pg.evaluate(async () => {
  const A = window.JIMOTHY_ATLAS, keys = Object.keys(A.frames);
  const objs = keys.map(k => SH_DEV.img('assets/' + k + '.png'));           // asking for all of them fetches every later sheet too
  const t0 = performance.now();
  while (objs.some(o => o._st === 0) && performance.now() - t0 < 120000) await new Promise(r => setTimeout(r, 200));
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  const px = (src, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0); return x.getImageData(0, 0, w, h).data; };
  const qpx = (src, w, h) => { const qw = Math.ceil(w / 4) + 2, qh = Math.ceil(h / 4) + 2, c = document.createElement('canvas');
    c.width = qw; c.height = qh; const x = c.getContext('2d'); x.drawImage(src, 0.3, 0.7, w / 4, h / 4); return x.getImageData(0, 0, qw, qh).data; };
  const diff = (a, b) => { if (a.length !== b.length) return -1; let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };
  const out = { frames: keys.length, notReady: [], notAtlas: [], bad: [], sheets: Object.keys(A.sheets).length, plant: null };
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i], o = objs[i];
    if (o._st !== 1) { out.notReady.push(k + ':' + o._st); continue; }
    if (!(o instanceof HTMLImageElement) || !/^blob:/.test(o.src)) { out.notAtlas.push(k + ' ' + (o.src || o.tagName).slice(0, 40)); continue; }
    const f = await load('assets/' + k + '.png?ident=1');
    if (!f) { out.bad.push(k + ' (file did not load)'); continue; }
    if (f.naturalWidth !== o.naturalWidth || f.naturalHeight !== o.naturalHeight) { out.bad.push(k + ' size'); continue; }
    const W = f.naturalWidth, H = f.naturalHeight;
    const n = diff(px(f, W, H), px(o, W, H)), q = diff(qpx(f, W, H), qpx(o, W, H));
    if (n !== 0) out.bad.push(k + ' ' + n + ' bytes at 1:1');
    if (q !== 0) out.bad.push(k + ' ' + q + ' bytes at a quarter');
    if (k === 'hero/idle') {                                               // the built in plant
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.getContext('2d').drawImage(o, 0, 0);
      out.plant = diff(qpx(f, W, H), qpx(cv, W, H));
    }
  }
  // the image tags
  const tags = Array.from(document.querySelectorAll('img[data-g]')).map(e => ({ e, rel: e.getAttribute('data-g') }))
    .concat(['ic-endless', 'ic-set', 'ic-games', 'ic-skins', 'ic-support'].map(id => document.getElementById(id))
      .filter(Boolean).map(e => ({ e, rel: null })));
  out.tags = tags.length; out.tagBad = [];
  const t1 = performance.now();
  while (tags.some(t => !/^blob:/.test(t.e.src)) && performance.now() - t1 < 30000) await new Promise(r => setTimeout(r, 200));
  for (const t of tags) {
    if (!/^blob:/.test(t.e.src)) { out.tagBad.push((t.rel || t.e.id) + ' src ' + t.e.src.slice(-40)); continue; }
    if (!t.rel) continue;                                                  // menu glyph ids: blob is the claim, pixels are held by data-g below
    const frame = SH_DEV.img('assets/' + t.rel + '.png');
    if (frame.src !== t.e.src) { out.tagBad.push(t.rel + ' carries a different URL from its frame'); continue; }
    const [bi, fi] = [await load(t.e.src), await load('assets/' + t.rel + '.png?ident=2')];
    if (!bi || !fi) { out.tagBad.push(t.rel + ' did not decode'); continue; }
    const n = diff(px(bi, fi.naturalWidth, fi.naturalHeight), px(fi, fi.naturalWidth, fi.naturalHeight));
    if (n !== 0) out.tagBad.push(t.rel + ' ' + n + ' bytes');
  }
  return out;
});
await b.close(); srv.close();
const fails = [];
if (res.notAtlas.length) fails.push(`${res.notAtlas.length} keys are not blob backed atlas images: ${res.notAtlas.slice(0, 5)}`);
if (!(res.plant > 0)) fails.push(`the built in plant did not fire: a canvas copy of hero/idle matched at a quarter size (${res.plant}), so this gate cannot see a canvas source`);
if (res.notReady.length) fails.push(`${res.notReady.length} frames never painted: ${res.notReady.slice(0, 5)}`);
if (res.bad.length) fails.push(`${res.bad.length} frames differ from their files: ${res.bad.slice(0, 8).join(', ')}`);
if (res.tagBad.length) fails.push(`${res.tagBad.length} image tags wrong: ${res.tagBad.slice(0, 8).join(', ')}`);
if (res.frames < 196) fails.push(`only ${res.frames} frames in the map; the six folders hold 196 PNGs`);
if (errs.length) fails.push('page errors: ' + errs.join(' | '));
console.log(`  frames ${res.frames} across ${res.sheets} sheets, image tags ${res.tags}; built in plant: a canvas copy differs in ${res.plant} bytes at a quarter size`);
if (fails.length) { console.log(`ATLAS IDENTITY FAILED${PLANT ? ' (PLANT)' : ''}\n  ` + fails.join('\n  ')); process.exit(1); }
console.log(`ATLAS IDENTITY OK: ${res.frames} frames and ${res.tags} image tags, zero differing bytes`);
