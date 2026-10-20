#!/usr/bin/env node
/* BUBBLENAUT shots: the real page in headless Chrome at a phone's size, driven through window.__bn.
 *
 *   node satellites/bubblenaut/tools/bnshot.mjs --out /tmp/bn-shots --scene hero [--vp 412x915x2.625,375x667x2]
 *
 * Every scene waits for the art it needs to report decoded (window.__bn.art) and FAILS the run if it never does,
 * so a shot can not quietly show the fallback shapes. Films are strips of frames cut around an actor at a fixed
 * interval: one frozen frame is not a look at an animation. Serves the repo root like audit_check.mjs. */
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? a.concat([[v.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : '1']]) : a), []));
const OUT = args.out || '/tmp/bn-shots'; fs.mkdirSync(OUT, { recursive: true });
const VPS = (args.vp || '412x915x2.625,375x667x2').split(',').map(v => { const [w, h, d] = v.split('x'); return { w: +w, h: +h, d: +d }; });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.css': 'text/css' };
const server = http.createServer((req, rep) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rep.writeHead(404); rep.end('nope'); return; }
  rep.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rep);
});
await new Promise(r => server.listen(0, r));
const URL0 = `http://127.0.0.1:${server.address().port}/satellites/bubblenaut/`;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const report = { url: URL0, scenes: [] };
const wait = ms => new Promise(r => setTimeout(r, ms));

async function openPage(vp, seed) {
  const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: vp.d, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(URL0, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => { localStorage.clear(); for (const k in s) localStorage.setItem(k, s[k]); }, Object.assign({ bn_seen: '1' }, seed || {}));
  await page.goto(URL0, { waitUntil: 'load' });
  // the shared music unlock card greets a first play; it is the platform's, not the game's art, and it covers the pads
  await page.addStyleTag({ content: '#sws-music-card,#sws-music-toast,#sws-music-chip,.sws-music-pill,.lwfb-tip{display:none!important}' });
  return { ctx, page, errs };
}
async function needArt(page, ids, budget = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < budget) {
    const a = await page.evaluate(() => window.__bn && window.__bn.art);
    if (a && ids.every(i => a[i] === 1)) return a;
    if (a && ids.some(i => a[i] === 'bad')) throw new Error('atlas refused (wrong decoded size): ' + JSON.stringify(a));
    await wait(200);
  }
  throw new Error('art never decoded: wanted ' + ids.join(',') + ' got ' + JSON.stringify(await page.evaluate(() => window.__bn.art)));
}
/* canvas CSS coords -> viewport coords */
async function toVp(page, x, y) {
  return page.evaluate((x, y) => { const r = document.getElementById('stage').getBoundingClientRect(); const s = r.width / 540; return { x: r.left + x * s, y: r.top + y * s, s }; }, x, y);
}
async function shot(page, name, vp, clip) {
  const file = path.join(OUT, `${name}-${vp.w}x${vp.h}.png`);
  await page.screenshot(clip ? { path: file, clip } : { path: file });
  return file;
}
/* a film: n frames every ms, clipped around the hero (or a fixed canvas box) */
async function film(page, name, vp, n, ms, box) {
  const files = [];
  for (let i = 0; i < n; i++) {
    let b = box;
    if (!b) { const h = await page.evaluate(() => window.__bn.hero); const c = await toVp(page, h.x - 50, h.y - 70); b = { x: c.x, y: c.y, width: 100 * c.s, height: 90 * c.s }; }
    else if (b.canvas) { const c = await toVp(page, b.x, b.y); b = { x: c.x, y: c.y, width: b.w * c.s, height: b.h * c.s }; }
    const f = path.join(OUT, `${name}-${vp.w}x${vp.h}-f${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: f, clip: b }); files.push(f); await wait(ms);
  }
  return files;
}
/* film around a moving target: fn is evaluated in the page and returns canvas {x,y} (or null to stop) */
async function filmAt(page, name, vp, n, ms, fn, w = 110, h = 100) {
  const files = [];
  for (let i = 0; i < n; i++) {
    const t = await page.evaluate(fn); if (!t) break;
    const c = await toVp(page, t.x - w / 2, t.y - h * 0.7);
    const f = path.join(OUT, `${name}-${vp.w}x${vp.h}-f${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: f, clip: { x: c.x, y: c.y, width: w * c.s, height: h * c.s } }); files.push(f); await wait(ms);
  }
  return files;
}
const WK = ['moss_moon', 'crystal_caverns', 'rust_belt', 'frost_ring', 'magma_core'];
async function worldScene(page, vp, rec, w) {
  await page.evaluate(() => window.__bn.t.god(true));
  await page.evaluate(n => window.__bn.t.level(n), w * 5);
  await needArt(page, ['hero', WK[w]]);
  await wait(1500); rec.push(await shot(page, `w${w + 1}-room`, vp));
  rec.push(...await filmAt(page, `w${w + 1}-move`, vp, 12, 110, '(() => { const c = window.__bn.crit; return c[0] ? { x: c[0].x, y: c[0].y } : null; })()'));
  await page.evaluate(() => window.__bn.t.trap(1)); await wait(400);
  rec.push(...await filmAt(page, `w${w + 1}-trapped`, vp, 3, 160, '(() => { const h = window.__bn.held; return h ? { x: h.x, y: h.y + 20 } : null; })()', 80, 80));
  await page.evaluate(() => window.__bn.t.heldT(5.4)); await wait(100);
  rec.push(...await filmAt(page, `w${w + 1}-struggle`, vp, 4, 90, '(() => { const h = window.__bn.held; return h ? { x: h.x, y: h.y + 20 } : null; })()', 80, 80));
  await page.evaluate(() => window.__bn.t.heldT(7.02)); await wait(30);
  rec.push(...await filmAt(page, `w${w + 1}-escape`, vp, 6, 70, '(() => { const c = window.__bn.crit; const e = c[c.length - 1]; return e ? { x: e.x, y: e.y } : null; })()'));
  await page.evaluate(() => window.__bn.t.trap(0)); await wait(500);
  const at = await page.evaluate(() => window.__bn.held);
  await page.evaluate(() => window.__bn.t.popHeld());
  rec.push(...await film(page, `w${w + 1}-popped`, vp, 5, 50, { canvas: 1, x: at.x - 45, y: at.y - 45, w: 90, h: 90 }));
  await wait(2500); rec.push(await shot(page, `w${w + 1}-later`, vp));
}
const press = (page, code, on) => page.evaluate((c, o) => window.__bn.t.press(c, o), code, on);
async function hold(page, code, ms) { await press(page, code, true); await wait(ms); await press(page, code, false); }

const SCENES = {
  async hero(page, vp, rec) {
    await needArt(page, ['hero', 'fx']);
    await page.evaluate(() => window.__bn.t.level(0));
    await wait(900); rec.push(await shot(page, 'hero-room1', vp));
    rec.push(...await film(page, 'hero-spawn', vp, 1, 0));
    await hold(page, 'KeyS', 90); await wait(30); rec.push(...await film(page, 'hero-blow', vp, 4, 60));
    await press(page, 'KeyD', true); await wait(250); rec.push(...await film(page, 'hero-run', vp, 6, 70)); await press(page, 'KeyD', false);
    await wait(500); await press(page, 'KeyA', true); rec.push(...await film(page, 'hero-turn', vp, 3, 50)); await press(page, 'KeyA', false);
    await wait(600); await press(page, 'KeyW', true); await wait(40); await press(page, 'KeyW', false); rec.push(...await film(page, 'hero-jump', vp, 8, 70));
    await wait(1200); await page.evaluate(() => window.__bn.t.hurt()); await wait(40); rec.push(await shot(page, 'hero-hurt', vp));
    await wait(2400);
    await page.evaluate(() => { window.__bn.t.hurt(); });
    await wait(2400);
    await page.evaluate(() => window.__bn.t.hurt()); rec.push(...await film(page, 'hero-die', vp, 6, 150));
    await wait(1600); rec.push(await shot(page, 'hero-over', vp));
  },
  async cheer(page, vp, rec) {
    await needArt(page, ['hero', 'fx']);
    await page.evaluate(() => window.__bn.t.level(0)); await wait(900);
    await page.evaluate(() => window.__bn.t.clearCritters()); await wait(700);
    rec.push(await shot(page, 'hero-cheer', vp)); rec.push(...await film(page, 'hero-cheer', vp, 6, 120));
  },
  async w1(page, vp, rec) { await worldScene(page, vp, rec, 0); },
  async w2(page, vp, rec) { await worldScene(page, vp, rec, 1); },
  async w3(page, vp, rec) { await worldScene(page, vp, rec, 2); },
  async w4(page, vp, rec) { await worldScene(page, vp, rec, 3); },
  async w5(page, vp, rec) { await worldScene(page, vp, rec, 4); },
  async rooms(page, vp, rec) {
    await page.evaluate(() => window.__bn.t.god(true));
    for (let w = 0; w < 5; w++) {
      await page.evaluate(n => window.__bn.t.level(n), w * 5 + (+(args.room || 0)));
      await needArt(page, ['hero', WK[w]].concat(args.need ? args.need.split('+').map(x => x.replace('W', WK[w])) : []));
      await wait(1300); rec.push(await shot(page, `room-w${w + 1}`, vp));
    }
  },
  async bounce(page, vp, rec) {
    await page.evaluate(() => window.__bn.t.god(true));
    await page.evaluate(() => window.__bn.t.level(10)); await needArt(page, ['rust_belt']); await wait(600);
    // the jelly nearest the right wall is walked into it, then the one going left into the left wall
    await page.evaluate(() => { const b = window.__bn; b.t.moveCritter(0, 540 - 36 - 22, 300); });
    rec.push(...await filmAt(page, 'bounce-right', vp, 8, 45, '(() => { const c = window.__bn.crit[0]; return c ? { x: c.x, y: c.y } : null; })()'));
    await page.evaluate(() => { const b = window.__bn; b.t.moveCritter(1, 36 + 22, 300); });
    rec.push(...await filmAt(page, 'bounce-left', vp, 8, 45, '(() => { const c = window.__bn.crit[1]; return c ? { x: c.x, y: c.y } : null; })()'));
  },
  async walls(page, vp, rec) {
    await page.evaluate(() => window.__bn.t.god(true));
    await page.evaluate(() => window.__bn.t.level(0)); await needArt(page, ['hero', 'tiles_moss_moon', 'bg_moss_moon']); await wait(700);
    await press(page, 'KeyA', true); await wait(900);
    const h = await page.evaluate(() => window.__bn.hero); rec.push(JSON.stringify(h));
    rec.push(...await film(page, 'wall-pip', vp, 1, 0, { canvas: 1, x: 0, y: h.y - 70, w: 160, h: 90 }));
    await press(page, 'KeyA', false);
    await page.evaluate(() => window.__bn.t.level(15)); await needArt(page, ['frost_ring', 'tiles_frost_ring']); await wait(600);
    await page.evaluate(() => window.__bn.t.moveCritter(0, 540 - 36 - 14, 90 + 4 * 36 - 1));
    rec.push(...await filmAt(page, 'wall-frost', vp, 6, 60, '(() => { const c = window.__bn.crit[0]; return c ? { x: c.x, y: c.y } : null; })()', 120, 90));
  },
  async items(page, vp, rec) {
    await page.evaluate(() => window.__bn.t.god(true));
    await page.evaluate(() => window.__bn.t.level(0)); await needArt(page, ['hero', 'fx', 'items', 'moss_moon', 'tiles_moss_moon', 'bg_moss_moon']); await wait(900);
    // a flying bubble, close
    await hold(page, 'KeyS', 60);
    rec.push(...await filmAt(page, 'bubble-fly', vp, 3, 60, '(() => { const h = window.__bn.hero; return { x: h.x + 60, y: h.y + 25 }; })()', 120, 80));
    // a held bubble with its crescent, then its pop
    await page.evaluate(() => window.__bn.t.trap(0)); await wait(500);
    rec.push(...await filmAt(page, 'bubble-held', vp, 1, 0, '(() => { const h = window.__bn.held; return h ? { x: h.x, y: h.y + 22 } : null; })()', 80, 80));
    const at = await page.evaluate(() => window.__bn.held);
    await page.evaluate(() => window.__bn.t.popHeld());
    rec.push(...await film(page, 'fx-pop', vp, 5, 40, { canvas: 1, x: at.x - 45, y: at.y - 45, w: 90, h: 90 }));
    await wait(1200);
    rec.push(...await film(page, 'treasure', vp, 3, 200, { canvas: 1, x: at.x - 50, y: at.y - 30, w: 100, h: 160 }));
    // an escape's burst
    await page.evaluate(() => window.__bn.t.trap(0)); await wait(400);
    const at2 = await page.evaluate(() => window.__bn.held);
    await page.evaluate(() => window.__bn.t.heldT(7.02));
    rec.push(...await film(page, 'fx-escape', vp, 5, 40, { canvas: 1, x: at2.x - 50, y: at2.y - 50, w: 100, h: 100 }));
    await wait(1500); rec.push(await shot(page, 'items-room', vp));
    rec.push(...await film(page, 'hud', vp, 1, 0, { canvas: 1, x: 340, y: 0, w: 200, h: 90 }));
    // the collection screen
    await page.evaluate(() => { window.__bn.t.god(false); }); await page.keyboard.press('Escape'); await wait(300);
    await page.evaluate(() => document.getElementById('b-col').click()); await wait(600);
    rec.push(await shot(page, 'collection', vp));
  },
  async title(page, vp, rec) {
    await wait(1500); rec.push(await shot(page, 'title', vp));
    await page.evaluate(() => { localStorage.setItem('bn_furthest', '13'); }); await page.reload({ waitUntil: 'load' });
    await page.addStyleTag({ content: '#sws-music-card,#sws-music-toast,#sws-music-chip,.sws-music-pill,.lwfb-tip{display:none!important}' });
    await wait(1500); rec.push(await shot(page, 'title-continue', vp));
  },
  async lives(page, vp, rec) {
    const out = {};
    await page.evaluate(() => window.__bn.t.level(3)); await wait(800);
    for (let i = 0; i < 3; i++) { await page.evaluate(() => window.__bn.t.hurt()); await wait(300); }
    await page.waitForFunction(() => document.getElementById('s-over').classList.contains('on'), { timeout: 15000 });
    rec.push(await shot(page, 'over', vp));
    await page.click('#over-again'); await wait(700);
    out.startOver = await page.evaluate(() => window.__bn.state.players.map(p => p.lives));
    for (let i = 0; i < 3; i++) { await page.evaluate(() => window.__bn.t.hurt()); await wait(300); }
    await page.waitForFunction(() => document.getElementById('s-over').classList.contains('on'), { timeout: 15000 });
    await page.click('#over-back'); await wait(400);
    out.beforeResume = await page.evaluate(() => { const e = document.getElementById('b-resume'); const r = e.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const stack = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).slice(0, 5).map(x => x.id || x.className || x.tagName);
      return { rect: [r.x, r.y, r.width, r.height].map(Math.round), hit: hit && (hit.id || hit.className || hit.tagName), stack,
        screens: [...document.querySelectorAll('.screen.on')].map(x => x.id), overDisp: getComputedStyle(document.getElementById('s-over')).display }; });
    await page.click('#b-resume'); await wait(700);
    out.afterResume = await page.evaluate(() => window.__bn.state);
    out.continued = out.afterResume.players.map(p => p.lives);
    rec.push(JSON.stringify(out)); console.log('LIVES', JSON.stringify(out));
    if (!(out.startOver[0] === 3 && out.continued[0] === 3)) throw new Error('lives not reset: ' + JSON.stringify(out));
  },
  async how(page, vp, rec) {
    await needArt(page, ['hero']);
    await page.evaluate(() => document.getElementById('b-how').click()); await wait(900);
    rec.push(await shot(page, 'how', vp));
  },
};
for (const vp of VPS) for (const name of (args.scene || 'hero').split(',')) {
  const { ctx, page, errs } = await openPage(vp, null); const rec = []; let err = null;
  try { await SCENES[name](page, vp, rec); } catch (e) { err = String(e.message || e); }
  report.scenes.push({ scene: name, vp: `${vp.w}x${vp.h}`, files: rec.length, err, pageErrors: errs, art: await page.evaluate(() => window.__bn && window.__bn.art).catch(() => null) });
  await ctx.close();
}
await browser.close(); server.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.scenes.map(s => ({ scene: s.scene, vp: s.vp, files: s.files, err: s.err, pageErrors: s.pageErrors.slice(0, 3) })), null, 1));
process.exit(report.scenes.some(s => s.err || s.pageErrors.length) ? 1 : 0);
