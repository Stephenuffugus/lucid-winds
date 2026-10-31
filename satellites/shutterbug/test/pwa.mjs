/* Browser gate `pwa` (BUILD-PLAN.md T1.11, section 1.5): with ?embed=1 and inside the wrapper iframe no service worker
 * registers; unframed the worker installs and caches.keys() holds exactly one shutterbug- cache with the six shell
 * files; offline, a reload still renders the title, plays the sample room and opens a shared link, with only the fleet's
 * four root files failing to load; the request log after the worker is active holds only the served set under the
 * game's folder and the fleet's root files; the update path: a copy stamped v2 (BUILD, CACHE, ?v=) served, two reloads,
 * the page shows the v2 BUILD and caches.keys() holds only the copy's cache, another game's cache planted before it is
 * still there, and the new worker causes no navigation (counted from before the v2 load); after a controlled reload the
 * shutterbug- cache holds nothing outside the game's folder (the M1 review); a foreign cache planted before the install
 * holding this page's URLs with another body never answers the offline shell (the card review, sb-m1-2: the worker reads
 * its own cache only). The cache name is read from the worker being served, and the update copy's is always another.
 *
 * Watched red by REGISTER_WHEN_EMBEDDED, SW_WIPES_OTHER_CACHES, SW_CACHES_ROOT_FILES and RELOAD_ON_CONTROLLERCHANGE (each
 * also by the lint), STAMP_SPLIT (the lint and deploy.sh), SW_MATCHES_ANY_CACHE (this gate alone). */
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
/* the stamp under test, from the worker being served (a red watch copy under SB_SW, else the game's own): the gate never
   holds a cache name of its own, so a stamp moves it with no edit here (sb-m1-2: it held shutterbug-v1, and its update
   copy, stamped shutterbug-v2, would have equalled the new live name and proved no update at all) */
const CACHE = (readFileSync(process.env.SB_SW || join(GAME, 'sw.js'), 'utf8').match(/var CACHE = '(shutterbug-v[0-9A-Za-z._-]+)'/) || [])[1] || 'none';
const NEXT = 'shutterbug-vpwa-next';
/* offline for the page AND the worker: page.setOfflineMode reaches the page's own network only, and the worker's fetch()
   is its own target's (sb-m1-2: probed, the server still answered the "offline" reload's navigation through the worker,
   so the offline checks had been run online since T1.11). Every service worker target is put offline by CDP too, and
   the server's request log proves nothing reached it. */
const swSessions = [];
async function offline(browser, page, on) {
  await page.setOfflineMode(on);
  for (const t of browser.targets().filter(x => x.type() === 'service_worker')) {
    let s = swSessions.find(x => x.t === t);
    if (!s) { s = { t, c: await t.createCDPSession() }; await s.c.send('Network.enable'); swSessions.push(s); }
    await s.c.send('Network.emulateNetworkConditions', { offline: on, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  }
  return browser.targets().filter(x => x.type() === 'service_worker').length;
}
const FOREIGN = 'FOREIGN SHELL from another cache';
try {
  /* framed or ?embed=1: no registration */
  { const { page } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, '?embed=1'); await ready(page); await sleep(1200);
    const r1 = await regs(page);
    await page.goto(srv.base + '/__wrap.html'); await sleep(2500);
    const r2 = await regs(page);
    /* before the install: another cache on the origin holding the game's two shell URLs (the root worker's lw-assets
       caches every navigation it serves); caches.match() with no cacheName would find it first, by creation order */
    await page.evaluate((path, body) => caches.open('lw-assets').then(c => Promise.all(['', 'index.html'].map(f => c.put(new Request(location.origin + path + f), new Response('<!doctype html><title>foreign</title><p>' + body, { headers: { 'content-type': 'text/html' } }))))), GAME_PATH, FOREIGN);
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
  R.say(ks.filter(x => x.startsWith('shutterbug-')).length === 1 && ks.find(x => x.startsWith('shutterbug-')) === CACHE && want.every(w => shell.includes(w)) && shell.length === want.length, 'unframed the worker installs; caches.keys() holds one shutterbug- cache, ' + CACHE + ' (' + ks.join(', ') + ') with the six shell files (' + shell.length + ')');

  /* the request log once the worker is active; the fleet's root files answered by the network, never the worker */
  const rootSeen = [], viaSW = [];
  page.on('response', r => { const u = new URL(r.url()); if (FLEET.includes(u.pathname)) { rootSeen.push(u.pathname); if (r.fromServiceWorker()) viaSW.push(u.pathname); } });
  await page.reload(); await ready(page); await sleep(500);
  R.say(rootSeen.length > 0 && viaSW.length === 0, 'under the worker the fleet\'s root files come from the network, never the worker (' + rootSeen.length + ' seen' + (viaSW.length ? ', through the worker: ' + viaSW.join(', ') : '') + ')');
  const odd = seen.map(u => new URL(u)).filter(u => u.origin !== srv.base || !(u.pathname.startsWith(GAME_PATH) || FLEET.some(f => u.pathname === f))).map(u => u.href);
  R.say(odd.length === 0, 'the request log holds only the game\'s folder and the fleet\'s root files' + (odd.length ? ' (' + odd.slice(0, 4).join(', ') + ')' : ''));
  /* the worker, now controlling, has kept nothing outside its folder: the fleet's root files are the site's, never
     cached under shutterbug- (the M1 review: only the lint stood here) */
  const cached = await page.evaluate(() => caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('shutterbug-')).map(k => caches.open(k).then(c => c.keys())))).then(all => all.flat().map(r => new URL(r.url).pathname)));
  const outside = cached.filter(p2 => !p2.startsWith(GAME_PATH));
  R.say(cached.length > 0 && outside.length === 0, 'after a controlled reload the shutterbug- cache holds only the game\'s folder (' + cached.length + ' entries' + (outside.length ? '; outside: ' + outside.join(', ') : '') + ')');

  /* offline: the title, the sample room, a shared link */
  const link = await page.evaluate(() => window.SB.record.linkOf(location.origin, location.pathname, window.SB.ui.sampleRecord()));
  const before = errors.length;
  const workers = await offline(browser, page, true);
  const asked = srv.requests.length;
  await page.reload();
  const shellOf = await page.evaluate(f => ({ foreign: document.documentElement.outerHTML.includes(f), title: !!document.getElementById('title') }), FOREIGN);
  R.say(!shellOf.foreign && shellOf.title, 'offline the shell comes from the worker\'s own cache, never another cache on the origin holding the same URL (' + (shellOf.foreign ? 'the foreign copy answered' : shellOf.title ? 'its own' : 'no title') + ')');
  await ready(page);
  const title = await page.evaluate(() => document.getElementById('title').classList.contains('on'));
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample'); await page.evaluate(() => window.SB_DEV.step(30));
  const played = await page.evaluate(() => window.SB_DEV.screen() === 'play' && window.SB_DEV.state().frame >= 30);
  await page.goto(link); await ready(page);
  const card = await page.evaluate(() => document.getElementById('devcard').classList.contains('on'));
  const reached = srv.requests.slice(asked);
  R.say(workers > 0 && reached.length === 0, 'offline means offline: the page and its worker (' + workers + ' worker target) reach the server for nothing' + (reached.length ? ' (' + reached.slice(0, 4).join(', ') + ')' : ''));
  const offErr = errors.slice(before).filter(e => !FLEET.some(f => e.includes(f.slice(1))) && !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e));
  const fleetOnly = errors.slice(before).filter(e => /Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(e)).length <= FLEET.length * 2;
  R.say(title && played && card && offErr.length === 0 && fleetOnly, 'offline a reload renders the title, plays the sample room and opens a shared link; only the fleet\'s root files fail' + (offErr.length ? ' (' + offErr.slice(0, 3).join(' ; ') + ')' : ''));
  await offline(browser, page, false);
  /* detached once online again: a session left on the old worker held its activate (the update kept the old cache) */
  for (const s of swSessions.splice(0)) await s.c.detach().catch(() => {});

  /* the update path: a copy stamped v2 */
  const dir = mkdtempSync(join(tmpdir(), 'sbpwa-'));
  /* the v2 copies are made from the page and the worker being served (a red watch mutant's copy under SB_PAGE or
     SB_SW: the M1 review found the update path built from the clean files, so the update never ran the mutant) */
  const v2page = readFileSync(process.env.SB_PAGE || join(GAME, 'index.html'), 'utf8').replace(/SB\.BUILD = '[^']*'/, "SB.BUILD = 'sb-pwa-v2'").replace(/sw\.js\?v=[0-9A-Za-z._-]+/, 'sw.js?v=pwa-next');
  const v2sw = readFileSync(process.env.SB_SW || join(GAME, 'sw.js'), 'utf8').replace(/var BUILD = '[^']*'/, "var BUILD = 'sb-pwa-v2'").replace(/var CACHE = 'shutterbug-v[0-9A-Za-z._-]+'/, "var CACHE = '" + NEXT + "'");
  writeFileSync(join(dir, 'index.html'), v2page); writeFileSync(join(dir, 'sw.js'), v2sw);
  /* another game's cache on the same origin (every satellite shares lucidwinds.com): the update must leave it (the
     M1 review: no foreign cache was planted, and the check read only shutterbug- keys) */
  await page.evaluate(() => caches.open('another-game-v1').then(c => c.put(new Request(location.origin + '/another-game/'), new Response('kept'))));
  process.env.SB_PAGE = join(dir, 'index.html'); process.env.SB_SW = join(dir, 'sw.js');
  /* the navigation counter from before the v2 load (the M1 review: attached after it, it missed the window where the
     v2 worker claims the page): the gate's own three loads, and nothing else */
  let navs = 0; page.on('framenavigated', f => { if (f === page.mainFrame()) navs++; });
  await gotoGame(page, srv.base); await ready(page); await sleep(1500);
  await page.reload(); await ready(page); await sleep(1500);
  await page.reload(); await ready(page); await sleep(1500);
  await sleep(2000);
  const v2 = await page.evaluate(() => ({ build: window.SB.BUILD, keys: null }));
  ks = await keys(page);
  R.say(v2.build === 'sb-pwa-v2' && CACHE !== NEXT && ks.filter(x => x.startsWith('shutterbug-')).join() === NEXT, 'a v2 copy served and two reloads: the page shows its BUILD (' + v2.build + ') and caches.keys() holds only ' + NEXT + ', not ' + CACHE + ' (' + ks.join(', ') + ')');
  R.say(ks.includes('another-game-v1'), 'the update leaves another game\'s cache on the origin alone (' + ks.join(', ') + ')');
  R.say(navs === 3, 'the new worker causes no navigation of its own (' + navs + ' main frame navigations for the gate\'s own 3)');
  delete process.env.SB_PAGE; delete process.env.SB_SW;
  R.say(errors.slice(0, before).length === 0, 'zero page errors online' + (before ? ' (' + errors.slice(0, before).join(' ; ') + ')' : ''));
} finally { await browser.close(); await srv.close(); }
R.finish();
