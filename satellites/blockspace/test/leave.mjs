/* Blockspace leave gate (2026-09-16). Leaving Blockspace for another page on the site HUNG: the
   browser answered the next page in 50 ms and then never switched to it, because putting a page
   with a live WebGL context into the back/forward cache stalled (measured on the live site: every
   one of 141 arcade pages left in a median 276 ms, Blockspace never did; with the bfcache off, or
   the context lost first, it left in under 700 ms). The law, with Chrome's defaults ON:
     1. a player's build is saved as they leave
     2. leaving for another page of the site takes under 3 s
     3. coming BACK gives a working page: a live WebGL context and the build still there
   node test/leave.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
const HERE = new URL('.', import.meta.url).pathname, ROOT = join(HERE, '..', '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let p = join(ROOT, u.endsWith('/') ? u + 'index.html' : u); if (!existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); }).listen(8979);
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 60000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage(); await pg.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = 'http://127.0.0.1:8979';
await pg.goto(BASE + '/satellites/blockspace/?shtest=1', { waitUntil: 'load', timeout: 60000 }); await sleep(1500);
await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w && !w.hidden) document.getElementById('wStart').click(); });
const placed = await pg.evaluate(() => { const n = BS.S.P.blocks.length; BS.placeAt([12, 0, 12], [0, 0, 0, 0, 0, 0], [0, 0, 0], 0, false); BS.placeAt([13, 0, 12], [1, 1, 1, 1, 1, 1], [0, 0, 0], 0, false); return { before: n, after: BS.S.P.blocks.length, id: BS.S.P.id }; });
ok(placed.after === placed.before + 2, 'two blocks placed before leaving (' + placed.before + ' to ' + placed.after + ')');
await pg.evaluate(() => { window.__sameHeap = 1; });
const t0 = Date.now(); let left = true;
try { await pg.goto(BASE + '/portal/?from=blockspace', { waitUntil: 'domcontentloaded', timeout: 8000 }); } catch (e) { left = false; }
const leaveMs = Date.now() - t0;
ok(left && leaveMs < 3000, 'leaving for another page of the site takes under 3 s (' + (left ? leaveMs + ' ms' : 'still stuck after 8 s') + ')');
if (left) {
  const saved = await pg.evaluate((id) => { try { const p = JSON.parse(localStorage.getItem('bs_p_' + id) || 'null'); return p ? p.blocks.length : -1; } catch (e) { return -2; } }, placed.id);
  ok(saved === placed.after, 'the build was saved as the player left (' + saved + ' blocks on disk)');
  let back = true;
  try { await pg.goBack({ waitUntil: 'load', timeout: 20000 }); } catch (e) { back = false; }
  await sleep(2500);
  const st = back ? await pg.evaluate(() => ({ restored: window.__sameHeap === 1, url: location.pathname, lost: !!(window.BS && BS.renderer.getContext().isContextLost()), blocks: window.BS ? BS.S.P.blocks.length : -1 })).catch(e => ({ err: e.message })) : { err: 'no back' };
  ok(back && st.url === '/satellites/blockspace/', 'BACK returns to Blockspace (' + JSON.stringify(st) + ')');
  ok(st.lost === false, 'and its WebGL context is alive');
  ok(st.blocks === placed.after, 'and the build is still there (' + st.blocks + ' blocks)');
  /* this browser does a fresh load on BACK here (restored: false above), so the page shown FROM the
     cache is driven directly: the handler must reload, and the reload must bring the build back */
  await pg.evaluate(() => { window.__sameHeap2 = 1; });
  const nav = pg.waitForNavigation({ waitUntil: 'load', timeout: 10000 }).then(() => true, () => false);
  await pg.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  const reloaded = await nav;
  await sleep(2000);
  const st2 = reloaded ? await pg.evaluate(() => ({ fresh: window.__sameHeap2 !== 1, lost: !!(window.BS && BS.renderer.getContext().isContextLost()), blocks: window.BS ? BS.S.P.blocks.length : -1 })).catch(e => ({ err: e.message })) : { err: 'no reload' };
  ok(reloaded && st2.fresh, 'a page shown from the back/forward cache reloads (' + JSON.stringify(st2) + ')');
  ok(st2.lost === false && st2.blocks === placed.after, 'and comes up with a live context and the build');
}
await b.close().catch(() => {}); srv.close();
if (fails.length) { console.log('LEAVE FAILED: ' + fails.length); process.exit(1); }
console.log('LEAVE OK');
