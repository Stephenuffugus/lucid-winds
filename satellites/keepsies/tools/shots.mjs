/**
 * The screenshots, taken from where the PLAYER stands.
 *
 *   node tools/shots.mjs [width] [height]
 *
 * Not a gate. This exists because a green gate is not a look: every visual phase
 * ends with somebody opening these files and naming three things wrong in each
 * one before the Director does.
 *
 * It shoots the brace with the reticle settled, the instant after a break, the
 * top down view, the result card, and then the worst angle a player can reach.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');
const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const W = parseInt(process.argv[2] || '375', 10);
const H = parseInt(process.argv[3] || '667', 10);
const TAG = W === 375 ? '' : '-' + W;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
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
  headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });

const shot = async (name) => {
  await page.screenshot({ path: join(OUT, name + TAG + '.png') });
  console.log('  ' + name + TAG + '.png');
};
const wait = (ms) => new Promise(r => setTimeout(r, ms));

await shot('k1-title');

/* beat 4 of the onboarding: the tin, and the heirloom laid on a cloth */
await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  d.beatSkip();                     // "I have played marbles before", which lands ON the tin
  d.tin();
});
await wait(900);
await shot('k2-tin');
await page.evaluate(() => { const b = document.getElementById('heir-lutz'); if (b) b.click(); });
await wait(400);
await shot('k2-tin-picked');
await page.evaluate(() => { const b = document.getElementById('tinTake'); if (b) b.click(); });
await wait(900);
await page.evaluate(() => window.KEEPSIES_DEV.title());
await page.evaluate(() => window.KEEPSIES_DEV.rules());
await wait(250);
await shot('k1-rules');
await page.evaluate(() => window.KEEPSIES_DEV.collection());
await wait(900);
await shot('k2-collection');
await page.evaluate(() => window.KEEPSIES_DEV.inspect('bloodstone_aggie'));
await wait(800);
await shot('k2-inspect');
/* a GRAIL on the turntable, as it renders today: the shader recipe that stands in for the
   Meshy sculpt (ART_ASSETS item 2). The prompt for the sculpt is not written until this
   has been looked at, which is that file's own rule. */
await page.evaluate(() => window.KEEPSIES_DEV.inspect('the_drowned_knight'));
await wait(800);
await shot('k2-inspect-grail');

/* the setup screen with a real pot on it, because "nothing was up" is the least
   interesting thing a result card can say about a game called Keepsies */
await page.evaluate(() => { window.KEEPSIES_DEV.setup(); window.KEEPSIES_DEV.stake('dirt_plain'); });
await wait(500);
await shot('k1-setup');
/* go() is the same door the PLAY button uses, so the pot really goes up */
await page.evaluate(() => window.KEEPSIES_DEV.go({ seed: 909090, forceFirst: 0 }));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(60));
await wait(400);
await shot('k1-board');

/* the brace, held still until the reticle has settled. The settle is measured
   in TIME (knuckle.js), so the hold is a real 1.6 s of pointermoves and not a
   burst of ninety in one tick. */
await page.evaluate(() => new Promise((done) => {
  const d = window.KEEPSIES_DEV;
  const t = d.state().match.taw;
  const c = document.getElementById('stage');
  c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 5, clientX: t.x, clientY: t.y, bubbles: true }));
  const t0 = performance.now();
  let k = 0;
  const iv = setInterval(() => {
    c.dispatchEvent(new PointerEvent('pointermove', { pointerId: 5, clientX: t.x + ((k++ & 1) ? 0.3 : -0.3), clientY: t.y, bubbles: true }));
    if (performance.now() - t0 > 1600) { clearInterval(iv); done(d.state().knuckle.settle01); }
  }, 16);
}));
await wait(350);
await shot('k1-brace');

/* the break, caught while the marbles are still moving */
await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  const t = d.state().match.taw;
  const pts = [];
  for (let i = 0; i <= 18; i++) pts.push({ x: t.x, y: t.y - 300 * i / 18, t: 1000 + 55 * i / 18 });
  d.flick(pts);
  d.tick(70);
});
await wait(200);
await shot('k1-break');

await page.evaluate(() => window.KEEPSIES_DEV.settle(1500));
await wait(200);

/* THE END GAME, from the Director's phone (2026-09-04): "almost impossible to hit the
   last couple marbles, there needs to be a zoom aim something". Reached through the
   real pocket rule (pocketAllBut places the rest outside the ring and the next step
   pockets them), framed by the same frameShot a thumb gets, and every number printed
   is read back from debugCam so the ledger carries measurements, not descriptions.
   The orbit and the pinch are dispatched as REAL pointer events on the canvas, outside
   the marble, which is DESIGN 7.7's coarse aim and used to be overwritten every frame. */
const cam = () => page.evaluate(() => {
  const c = window.KEEPSIES_DEV.debugCam();
  return { mibs: c.mibsLeft, dist: c.cam.dist, az: c.azimuth, userAz: c.userAz, userZoom: c.userZoom, t: c.frameInfo && c.frameInfo.t };
});
const full = await cam();
await page.evaluate(() => window.KEEPSIES_DEV.pocketAllBut(2));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90));
await wait(300);
const two = await cam();
await shot('k2-endgame-two');
await page.evaluate(() => window.KEEPSIES_DEV.pocketAllBut(1));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90));
await wait(300);
const one = await cam();
await shot('k2-endgame-one');

/* the spyglass: a REAL brace on the taw with one mib left, held 1.7 s so the cone has settled,
   then let go without a flick (under the cancel band, never a wasted turn) */
await page.evaluate(() => new Promise((done) => {
  const d = window.KEEPSIES_DEV;
  const t = d.state().match.taw;
  const c = document.getElementById('stage');
  c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, clientX: t.x, clientY: t.y, bubbles: true }));
  const t0 = performance.now();
  let k = 0;
  const iv = setInterval(() => {
    c.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, clientX: t.x + ((k++ & 1) ? 0.3 : -0.3), clientY: t.y, bubbles: true }));
    if (performance.now() - t0 > 1700) { clearInterval(iv); done(); }
  }, 16);
}));
await wait(150);
await shot('k2-endgame-spyglass');
console.log('  spyglass: ' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.debugCam().spy)));
await page.evaluate(() => {
  const t = window.KEEPSIES_DEV.state().match.taw || { x: 187, y: 600 };
  document.getElementById('stage').dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, clientX: t.x, clientY: t.y, bubbles: true }));
});
await wait(300);
console.log('  endgame lean: full ' + full.mibs + ' mibs at ' + full.dist + ' m, two at ' + two.dist + ' m, one at ' + one.dist + ' m (t ' + one.t + ')');

/* a real one finger orbit, dispatched outside the marble so the Knuckle does not claim it */
await page.evaluate(() => new Promise((done) => {
  const c = document.getElementById('stage');
  let x = 40, y = 120, k = 0;
  c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, clientX: x, clientY: y, bubbles: true, isPrimary: true }));
  const iv = setInterval(() => {
    x += 12; k++;
    c.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, clientX: x, clientY: y, bubbles: true, isPrimary: true }));
    if (k >= 10) { clearInterval(iv); c.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, clientX: x, clientY: y, bubbles: true, isPrimary: true })); done(); }
  }, 16);
}));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90));
await wait(300);
const orbited = await cam();
await shot('k2-endgame-orbit');
console.log('  orbit survives: azimuth ' + one.az + ' -> ' + orbited.az + ' (userAz ' + orbited.userAz + '), distance ' + one.dist + ' -> ' + orbited.dist);

/* a real pinch, two pointers spreading apart, which is zoom IN */
await page.evaluate(() => new Promise((done) => {
  const c = document.getElementById('stage');
  let a = 170, b = 205, k = 0;
  const ev = (type, id, x) => c.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: 420, bubbles: true }));
  ev('pointerdown', 7, a); ev('pointerdown', 8, b);
  const iv = setInterval(() => {
    a -= 7; b += 7; k++;
    ev('pointermove', 7, a); ev('pointermove', 8, b);
    if (k >= 8) { clearInterval(iv); ev('pointerup', 7, a); ev('pointerup', 8, b); done(); }
  }, 16);
}));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90));
await wait(300);
const pinched = await cam();
await shot('k2-endgame-pinch');
console.log('  pinch survives: distance ' + orbited.dist + ' -> ' + pinched.dist + ' (userZoom ' + pinched.userZoom + ')');

await page.evaluate(() => {
  const b = document.getElementById('topDown');
  const r = b.getBoundingClientRect();
  const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
  if (hit) hit.click();
});
await wait(900);
await shot('k1-topdown');
await page.evaluate(() => {
  const b = document.getElementById('topDown');
  const r = b.getBoundingClientRect();
  const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
  if (hit) hit.click();
});
await wait(600);

/* play it out to a result card */
for (let i = 0; i < 60; i++) {
  const done = await page.evaluate(() => {
    const d = window.KEEPSIES_DEV;
    d.playAiTurns(40);
    d.settleCamera(50);
    const s = d.state();
    // the ceremony is an end too, and it is over in under two seconds: a loop
    // that only stops at 'results' photographs the card and never the ceremony
    if (document.querySelector('.ceremony .cer-marble')) return true;
    if (s.screen === 'results') return true;
    if (!s.match || s.match.simulating || s.match.turn !== 0 || !s.match.taw) return false;
    const t = s.match.taw;
    const pts = [];
    for (let k = 0; k <= 18; k++) pts.push({ x: t.x, y: t.y - 300 * k / 18, t: 1000 + 55 * k / 18 });
    d.flick(pts);
    d.settle(1500);
    return false;
  });
  if (done) break;
  await wait(40);
}
/* the ceremony, caught while the marble is crossing the screen */
await wait(420);
await shot('k1-ceremony');
await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip());
await wait(400);
await shot('k1-results');

/* a level up, which is the only line on the result card that is news */
await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  d.grantXp(1000);                     // sit just under the next level
  const p = d.progress();
  d.grantXp(Math.max(0, p.needed - p.xp - 60));
  d.setup(); d.stake('dirt_plain'); d.go({ seed: 424242, forceFirst: 0 });
  d.forceEnd(0);
});
await wait(300);
await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip());
await wait(500);
await shot('k2-levelup');

/* the offer card: lose a rare on purpose and photograph what a player is shown */
await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  d.grantMarble('bloodstone_aggie');
  d.grantSunbeams(1000);
  d.setup();
  d.stake('bloodstone_aggie');
  d.go({ seed: 313131, forceFirst: 1 });
  d.forceEnd(1);
});
await wait(500);
await shot('k2-loss-ceremony');
await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip());
await wait(600);
await shot('k2-ransom');
await page.evaluate(() => { const b = document.getElementById('rsLater'); if (b) b.click(); });
await wait(400);
await shot('k2-loss-results');
await page.evaluate(() => window.KEEPSIES_DEV.collection());
await wait(900);
await shot('k2-offers');

/* the worst angle a player can reach, and then the one they cannot */
await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 909090, forceFirst: 0 }));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(60));
await wait(300);
await page.evaluate(() => window.KEEPSIES_DEV.camera(20, -40, 1.2));
await wait(400);
await shot('k1-lowest');
await page.evaluate(() => window.KEEPSIES_DEV.camera(20, -25, 1.2, { allowUnder: true }));
await wait(400);
await shot('k1-under');

await browser.close();
server.close();
console.log('SHOTS OK');
