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

/* the brace, held still until the reticle has settled */
await page.evaluate(async () => {
  const d = window.KEEPSIES_DEV;
  const t = d.state().match.taw;
  const c = document.getElementById('stage');
  c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 5, clientX: t.x, clientY: t.y, bubbles: true }));
  for (let i = 0; i < 90; i++) {
    c.dispatchEvent(new PointerEvent('pointermove', { pointerId: 5, clientX: t.x, clientY: t.y, bubbles: true }));
  }
});
await wait(1600);
await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  const t = d.state().match.taw;
  const c = document.getElementById('stage');
  for (let i = 0; i < 40; i++) {
    c.dispatchEvent(new PointerEvent('pointermove', { pointerId: 5, clientX: t.x, clientY: t.y, bubbles: true }));
  }
});
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
