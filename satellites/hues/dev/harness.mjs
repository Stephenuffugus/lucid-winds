/* HUES headless harness (Packet H1, 2026-10-08). Shared by every gate and by shots.mjs.

   A static server for the repo root, Chrome from the repo's own puppeteer, and helpers that drive
   the REAL page with REAL touch input (page.touchscreen), never el.click().

   Every driver below reads globals the pre-H1 build also has (G, hsv2rgb, rgbStr, renderControls,
   renderYours, Store, K, applyEquippedBorder, getMissions, pickMissions), so a gate can be watched
   RED on the old build:
     HUES_REV=<git rev>   serve satellites/hues/index.html from that revision
     MUSIC_REV=<git rev>  serve /music-unlocks.js from that revision
     --plant=<name>       serve a deliberately broken copy (PLANTS below). A plant whose anchor is
                          not found throws: an invalid plant is a failure, never a pass.

   Network: lucidwinds.com absolute URLs are answered from the repo; Firebase, analytics, cloud
   functions and /music/ audio are aborted; Google Fonts are fetched for real unless FONTS=0. The
   root service worker is stubbed out so it cannot cache or reorder anything under test. */
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { createRequire } from 'module';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { inflateSync } from 'zlib';

export const ROOT = normalize(join(fileURLToPath(import.meta.url), '../../../../'));
const require = createRequire(join(ROOT, 'package.json'));
const puppeteer = require('puppeteer');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const arg = (name, dflt = null) => { const a = process.argv.find((x) => x.startsWith('--' + name + '=')); return a ? a.slice(name.length + 3) : dflt; };

/* ---------- plants: source mutations of the served index.html ---------- */
export const PLANTS = {
  /* the music hold flag removed: the boot card comes back and folds into the floating pill */
  pill: [['window.SWS_MUSIC_HOLD=true;', 'window.SWS_MUSIC_HOLD=false;']],
  /* the round start brightness flash re-enabled on the target swatch */
  flash: [['.cell{flex:1;', '.cell .frame.flash .swatch{animation:flash .5s ease}@keyframes flash{0%{filter:brightness(1)}30%{filter:brightness(1.4)}100%{filter:brightness(1)}}\n  .cell{flex:1;'],
          ['renderControls();renderYours();startTimer(G.cur.time);}', 'targetFrame.classList.remove("flash");void targetFrame.offsetWidth;targetFrame.classList.add("flash");renderControls();renderYours();startTimer(G.cur.time);}']],
  /* a dash back in player copy */
  lockin: [['lock:"Locked before time ran out"', 'lock:"Lock-in bonus"']],
  /* a 48px target shrunk */
  shrink: [['</style>', '#lockBtn{padding:6px!important}\n</style>']],
  /* the mission save read without validation again */
  novalidate: [['function getMissions(){const m=readMissions();', 'function getMissions(){let m=null;try{const r=Store.g(K.miss);m=r?JSON.parse(r):null;}catch(e){m=null;}if(!m||m.date!==todayStr()){m={date:todayStr(),items:pickMissions()};Store.s(K.miss,JSON.stringify(m));}return m;}\nfunction _unusedGetMissions(){const m=readMissions();']],
  /* the double lock guard removed */
  doublelock: [['function lockGuess(timeout){if(G.locked)return;G.locked=true;cancelAnimationFrame(G.raf);lockBtn.disabled=true;', 'function lockGuess(timeout){G.locked=true;cancelAnimationFrame(G.raf);']],
  /* a release over the button counts as a lock */
  releaselock: [['lockBtn.addEventListener("click",()=>lockGuess(false));', 'lockBtn.addEventListener("click",()=>lockGuess(false));document.addEventListener("pointerup",e=>{const r=lockBtn.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)lockGuess(false);},true);']],
};
function applyPlant(src, name) {
  const steps = PLANTS[name]; if (!steps) throw new Error('unknown plant ' + name);
  let out = src;
  for (const [from, to] of steps) {
    const n = out.split(from).length - 1;
    if (n !== 1) throw new Error('plant "' + name + '" does not apply: anchor found ' + n + ' times: ' + from.slice(0, 60));
    out = out.replace(from, to);
  }
  return out;
}

/* ---------- static server ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const REVS = { '/satellites/hues/index.html': process.env.HUES_REV, '/music-unlocks.js': process.env.MUSIC_REV };
const memo = {};
async function fileFor(p) {
  if (p.endsWith('/')) p += 'index.html';
  let body = null;
  if (REVS[p]) body = memo[p] ||= execSync('git show ' + REVS[p] + ':' + p.slice(1), { cwd: ROOT, maxBuffer: 1 << 26 });
  else {
    const f = normalize(join(ROOT, decodeURIComponent(p)));
    if (!f.startsWith(ROOT)) throw new Error('outside root');
    const st = await stat(f); if (!st.isFile()) throw new Error('not a file');
    body = await readFile(f);
  }
  const plant = process.env.HUES_PLANT;
  if (plant && p === '/satellites/hues/index.html') body = Buffer.from(applyPlant(body.toString('utf8'), plant));
  return { body, type: MIME[extname(p)] || 'application/octet-stream' };
}
let SERVER = null, PORT = 0;
export async function serve() {
  if (SERVER) return PORT;
  if (process.env.HUES_PLANT) await fileFor('/satellites/hues/index.html');   /* throws now if the plant does not apply */
  SERVER = createServer(async (q, r) => {
    try { const { body, type } = await fileFor(q.url.split('?')[0]); r.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }); r.end(body); }
    catch (e) { r.writeHead(404, { 'content-type': 'text/plain' }); r.end('404'); }
  });
  await new Promise((res) => SERVER.listen(0, '127.0.0.1', res));
  PORT = SERVER.address().port; return PORT;
}
export function stop() { if (SERVER) SERVER.close(); SERVER = null; }

/* ---------- browser ---------- */
export async function launch() {
  await serve();
  return puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--force-color-profile=srgb', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
}
const BLOCK = /\/firebasejs\/|googletagmanager|google-analytics|cloudfunctions\.net|\/music\/v\d|\/api\/feedback/;
const NOISE = /Failed to load resource|net::ERR|favicon|ERR_FAILED|the server responded with a status of 404/i;
async function route(req) {
  const u = req.url();
  if (BLOCK.test(u)) return req.abort();
  if (/^https:\/\/(www\.)?lucidwinds\.com\//.test(u)) {
    try { const p = new URL(u).pathname; const { body, type } = await fileFor(p); return req.respond({ status: 200, contentType: type, body }); }
    catch (e) { return req.respond({ status: 404, body: '' }); }
  }
  if (process.env.FONTS === '0' && /fonts\.(googleapis|gstatic)\.com/.test(u)) return req.abort();
  return req.continue();
}

/* open the game in a FRESH browser context (empty storage) at w x h.
   seed: localStorage written before any page script runs (a returning save).
   query: the page query (hstest=1 turns on the game's own inert test hook). */
export async function open(browser, o = {}) {
  const { w = 412, h = 915, dpr = 1, seed = null, query = 'hstest=1', settleMs = 1300, ctx = null } = o;
  const context = ctx || await browser.createBrowserContext();
  const page = await context.newPage();
  page._ctx = context;
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
  page._errors = [];
  page.on('pageerror', (e) => page._errors.push(String((e && e.message) || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) page._errors.push('console: ' + m.text()); });
  await page.evaluateOnNewDocument(() => {
    try { if (navigator.serviceWorker) navigator.serviceWorker.register = () => Promise.resolve({ scope: '/' }); } catch (e) {}
    window.__hues = { alerts: [], confirms: [], shares: [], clip: [], canvas: [] };
    window.alert = (m) => { window.__hues.alerts.push(String(m)); };
    window.confirm = (m) => { window.__hues.confirms.push(String(m)); return true; };
    try { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t) => { window.__hues.clip.push(String(t)); } } }); } catch (e) {}
    try { navigator.share = async (d) => { window.__hues.shares.push(JSON.stringify(d && { text: d.text, url: d.url })); }; navigator.canShare = () => false; } catch (e) {}
    try { const P = CanvasRenderingContext2D.prototype, f = P.fillText, s = P.strokeText;
      P.fillText = function (t, ...a) { window.__hues.canvas.push(String(t)); return f.call(this, t, ...a); };
      P.strokeText = function (t, ...a) { window.__hues.canvas.push(String(t)); return s.call(this, t, ...a); }; } catch (e) {}
  });
  if (seed) await page.evaluateOnNewDocument((s) => { try { if (!localStorage.getItem('__hues_seeded')) { for (const k in s) localStorage.setItem(k, s[k]); localStorage.setItem('__hues_seeded', '1'); } } catch (e) {} }, seed);
  await page.setRequestInterception(true);
  page.on('request', (req) => { route(req).catch(() => {}); });
  await page.goto('http://127.0.0.1:' + PORT + '/satellites/hues/?' + query, { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await sleep(settleMs);
  return page;
}
export async function close(page) { try { await page._ctx.close(); } catch (e) {} }

/* ---------- reading the page ---------- */
/* the presentation state derived from the DOM alone, so it works on the pre-H1 build too */
export const presentState = (page) => page.evaluate(() => {
  const on = (id) => { const e = document.getElementById(id); return !!e && e.classList.contains('on'); };
  const sm = document.getElementById('shareModal'); if (sm && getComputedStyle(sm).display !== 'none') return 'share';
  if (on('rulesOv')) return 'rules';
  if (on('game')) { const b = document.getElementById('breakdown'); return b && b.classList.contains('show') ? 'review' : 'play'; }
  if (on('result')) return 'result'; if (on('shop')) return 'shop'; return 'menu';
});
export const declaredState = (page) => page.evaluate(() => document.documentElement.getAttribute('data-hues'));
/* floating chrome that belongs to the fleet, not to Hues */
export const CHROME = ['#sws-music-card', '#sws-music-pill', '#sws-music-toast', '#sws-music-chip', '.lwfb-fab'];
export const visible = (page, sels) => page.evaluate((sels) => {
  const out = [];
  for (const sel of sels) document.querySelectorAll(sel).forEach((el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return;
    for (let p = el.parentElement; p; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || parseFloat(c.opacity) < 0.05) return; }
    if (r.width < 1 || r.height < 1 || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return;
    out.push({ sel, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48) });
  });
  return out;
}, sels);
export const rect = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
export const intersects = (a, b) => !!a && !!b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
export const describe = (list) => list.map((c) => c.sel + ' at ' + c.x + ',' + c.y + ' ' + c.w + 'x' + c.h + (c.text ? ' "' + c.text + '"' : '')).join('; ');

/* ---------- driving the page with real touch ---------- */
export async function tap(page, sel, { timeout = 6000 } = {}) {
  await page.waitForSelector(sel, { visible: true, timeout });
  const el = await page.$(sel);
  await el.scrollIntoView();
  const b = await el.boundingBox();
  if (!b) throw new Error('no box for ' + sel);
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
}
export async function tapText(page, root, text) {
  const sel = await page.evaluate((root, text) => {
    const els = [...document.querySelectorAll(root + ' button')]; const el = els.find((e) => e.textContent.trim().toLowerCase().startsWith(text.toLowerCase()));
    if (!el) return null; el.setAttribute('data-hues-gate', text); return '[data-hues-gate="' + text + '"]';
  }, root, text);
  if (!sel) throw new Error('no button "' + text + '" in ' + root);
  await tap(page, sel);
}
export const waitFor = (page, fn, timeout = 6000, ...a) => page.waitForFunction(fn, { timeout, polling: 50 }, ...a);
export const playing = (page) => waitFor(page, () => { const g = document.getElementById('game'); const b = document.getElementById('breakdown'); return g && g.classList.contains('on') && b && !b.classList.contains('show') && (typeof G !== "undefined" && G) && !G.locked; }, 8000).then(() => sleep(250));
/* fix the round's two colors (works on the old build: plain globals) */
export const setPair = (page, t, y) => page.evaluate((t, y) => { G.cur.target = { ...t }; targetSwatch.style.background = rgbStr(hsv2rgb(t.h, t.s, t.v)); G.guess = { ...y }; renderControls(); renderYours(); }, t, y);
/* exact | close (a few dE away, passes) | far (fails at every difficulty) */
export const guess = (page, how) => page.evaluate((how) => {
  const t = G.cur.target; let y;
  if (how === 'exact') y = { ...t };
  else if (how === 'close') y = { h: (t.h + 9) % 360, s: t.s, v: t.v };
  else { const v = t.v > 0.6 ? 0.06 : 0.98; y = { h: (t.h + 180) % 360, s: t.s > 0.6 ? 0.08 : 1, v }; }
  G.guess = y; renderControls(); renderYours();
}, how);
export const setTimeFrac = (page, f) => page.evaluate((f) => { G.endT = performance.now() + G.dur * f; }, f);
export async function lock(page) {
  await tap(page, '#lockBtn');
  await waitFor(page, () => document.getElementById('breakdown').classList.contains('show'), 6000);
  await sleep(480);
}
export async function next(page) { await tap(page, '#bdNext'); await sleep(450); }
/* a whole Daily set from the first round: hows = five guesses */
export async function playSet(page, hows = ['close', 'close', 'close', 'close', 'close']) {
  for (let i = 0; i < hows.length; i++) { await playing(page); await guess(page, hows[i]); await lock(page); await next(page); }
  await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(450);
}
export async function startMode(page, mode) {
  await tap(page, '[data-mode="' + mode + '"]');
  await sleep(350);
  if (await page.evaluate(() => document.getElementById('rulesOv').classList.contains('on'))) { await tap(page, '#rulesGo'); }
  await playing(page);
}
export async function toMenu(page) {
  if (await page.evaluate(() => document.getElementById('game').classList.contains('on') && !document.getElementById('breakdown').classList.contains('show'))) await tap(page, '#gMenu');
  else if (await page.evaluate(() => document.getElementById('result').classList.contains('on'))) await tapText(page, '#resActions', 'Menu');
  else if (await page.evaluate(() => document.getElementById('shop').classList.contains('on'))) await tap(page, '#shopBack');
  await waitFor(page, () => document.getElementById('menu').classList.contains('on'), 6000); await sleep(350);
}

/* ---------- pixels: a minimal PNG decoder (8 bit RGB/RGBA, non interlaced) ---------- */
export function decodePNG(buf) {
  let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; if (data[8] !== 8 || data[12] !== 0) throw new Error('PNG: only 8 bit, non interlaced'); }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (!bpp) throw new Error('PNG: color type ' + ct);
  const raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, px: (x, y) => { const i = (Math.round(y) * w + Math.round(x)) * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
}
export async function snap(page) { return decodePNG(await page.screenshot({ type: 'png' })); }

/* ---------- a tiny report ---------- */
export function reporter(name) {
  let pass = 0, fail = 0; const fails = [];
  return {
    t(label, ok, detail) { if (ok) { pass++; console.log('  ok    ' + label); } else { fail++; fails.push(label); console.log('  FAIL  ' + label + (detail ? '   <- ' + detail : '')); } },
    done() { console.log('\n' + name + (process.env.HUES_PLANT ? ' [plant ' + process.env.HUES_PLANT + ']' : '') + (process.env.HUES_REV ? ' [HUES_REV ' + process.env.HUES_REV + ']' : '') + ': ' + pass + ' ok, ' + fail + ' failed'); stop(); process.exit(fail ? 1 : 0); },
    get failed() { return fail; },
  };
}
export function plantFromArgs() { const p = arg('plant'); if (p) process.env.HUES_PLANT = p; return p; }
