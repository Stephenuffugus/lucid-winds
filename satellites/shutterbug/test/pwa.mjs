/* Browser gate `pwa` (BUILD-PLAN.md T1.11, section 1.5): with ?embed=1 and inside the wrapper iframe no service worker
 * registers; unframed the worker installs and caches.keys() holds exactly one shutterbug- cache with the six shell
 * files; offline, a reload still renders the title, plays the sample room and opens a shared link, with only the fleet's
 * four root files failing to load; the request log after the worker is active holds only the served set under the
 * game's folder and the fleet's root files; the update path: a copy stamped v2 (BUILD, CACHE, ?v=) served, two reloads,
 * the page shows the v2 BUILD and caches.keys() holds only shutterbug-v2, and the new worker causes no navigation.
 *
 * Watched red by REGISTER_WHEN_EMBEDDED, SW_WIPES_OTHER_CACHES, SW_CACHES_ROOT_FILES and RELOAD_ON_CONTROLLERCHANGE (the
 * last two also stopped by the lint), STAMP_SPLIT (the lint and deploy.sh). */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, GAME, GAME_PATH, sleep } from './harness.mjs';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const R = reporter('PWA');
const srv = await serve();
const browser = await launch();
const FLEET = ['/music-unlocks.js', '/music-catalog.js', '/music-tracks.js', '/music-player.js'];
const regs = page => page.evaluate(() => navigator.serviceWorker.getRegistrations().then(r => r.map(x => x.scope)));
const keys = page => page.evaluate(() => caches.keys());
try {
  /* framed or ?embed=1: no registration */
  { const { page } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, '?embed=1'); await ready(page); await sleep(1200);
    const r1 = await regs(page);
    await page.goto(srv.base + '/__wrap.html'); await sleep(2500);
    const r2 = await regs(page);
    R.say(r1.length === 0 && r2.length === 0, 'with ?embed=1 and inside the wrapper iframe no worker registers (' + r1.length + ', ' + r2.length + ')');
    await page.close(); }

  /* unframed: the worker, one cache, the shell files */
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  const seen = []; page.on('request', q => seen.push(q.url()));
  await gotoGame(page, srv.base); await ready(page);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  let ks = []; for (let k = 0; k < 30 && !ks.some(x => x.startsWith('shutterbug-')); k++) { await sleep(200); ks = await keys(page); }
  const shell = await page.evaluate(k => caches.open(k).then(c => c.keys()).then(rs => rs.map(r => new URL(r.url).pathname)), ks.find(x => x.startsWith('shutterbug-')) || 'none');
  const want = ['', 'index.html', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'].map(f => GAME_PATH + f);
  R.say(ks.filter(x => x.startsWith('shutterbug-')).length === 1 && ks[0] === 'shutterbug-v1' && want.every(w => shell.includes(w)) && shell.length === want.length, 'unframed the worker installs; caches.keys() holds one shutterbug- cache (' + ks.join(', ') + ') with the six shell files (' + shell.length + ')');

  /* the request log once the worker is active */
  await page.reload(); await ready(page); await sleep(500);
  const odd = seen.map(u => new URL(u)).filter(u => u.origin !== srv.base || !(u.pathname.startsWith(GAME_PATH) || FLEET.some(f => u.pathname === f))).map(u => u.href);
  R.say(odd.length === 0, 'the request log holds only the game\'s folder and the fleet\'s root files' + (odd.length ? ' (' + odd.slice(0, 4).join(', ') + ')' : ''));

  /* offline: the title, the sample room, a shared link */
  const link = await page.evaluate(() => window.SB.record.linkOf(location.origin, location.pathname, window.SB.ui.sampleRecord()));
  const before = errors.length;
  await page.setOfflineMode(true);
  await page.reload(); await ready(page);
  const title = await page.evaluate(() => document.getElementById('title').classList.contains('on'));
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample'); await page.evaluate(() => window.SB_DEV.step(30));
  const played = await page.evaluate(() => window.SB_DEV.screen() === 'play' && window.SB_DEV.state().frame >= 30);
  await page.goto(link); await ready(page);
  const card = await page.evaluate(() => document.getElementById('devcard').classList.contains('on'));
  const offErr = errors.slice(before).filter(e => !FLEET.some(f => e.includes(f.slice(1))) && !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e));
  const fleetOnly = errors.slice(before).filter(e => /Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(e)).length <= FLEET.length * 2;
  R.say(title && played && card && offErr.length === 0 && fleetOnly, 'offline a reload renders the title, plays the sample room and opens a shared link; only the fleet\'s root files fail' + (offErr.length ? ' (' + offErr.slice(0, 3).join(' ; ') + ')' : ''));
  await page.setOfflineMode(false);

  /* the update path: a copy stamped v2 */
  const dir = mkdtempSync(join(tmpdir(), 'sbpwa-'));
  const v2page = readFileSync(join(GAME, 'index.html'), 'utf8').replace(/SB\.BUILD = '[^']*'/, "SB.BUILD = 'sb-pwa-v2'").replace(/sw\.js\?v=[0-9A-Za-z._-]+/, 'sw.js?v=2');
  const v2sw = readFileSync(join(GAME, 'sw.js'), 'utf8').replace(/var BUILD = '[^']*'/, "var BUILD = 'sb-pwa-v2'").replace(/var CACHE = 'shutterbug-v[0-9A-Za-z._-]+'/, "var CACHE = 'shutterbug-v2'");
  writeFileSync(join(dir, 'index.html'), v2page); writeFileSync(join(dir, 'sw.js'), v2sw);
  process.env.SB_PAGE = join(dir, 'index.html'); process.env.SB_SW = join(dir, 'sw.js');
  await gotoGame(page, srv.base); await ready(page); await sleep(1500);
  let navs = 0; page.on('framenavigated', f => { if (f === page.mainFrame()) navs++; });
  await page.reload(); await ready(page); await sleep(1500);
  await page.reload(); await ready(page); await sleep(1500);
  const navsAfter = navs; await sleep(2000);
  const v2 = await page.evaluate(() => ({ build: window.SB.BUILD, keys: null }));
  ks = await keys(page);
  R.say(v2.build === 'sb-pwa-v2' && ks.filter(x => x.startsWith('shutterbug-')).join() === 'shutterbug-v2', 'a v2 copy served and two reloads: the page shows its BUILD (' + v2.build + ') and caches.keys() holds only shutterbug-v2 (' + ks.join(', ') + ')');
  R.say(navs === navsAfter, 'the new worker causes no navigation of its own (' + (navs - navsAfter) + ')');
  delete process.env.SB_PAGE; delete process.env.SB_SW;
  R.say(errors.slice(0, before).length === 0, 'zero page errors online' + (before ? ' (' + errors.slice(0, before).join(' ; ') + ')' : ''));
} finally { await browser.close(); await srv.close(); }
R.finish();
