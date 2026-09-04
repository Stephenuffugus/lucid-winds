/**
 * The Knuckle, in a real browser, driven by real pointer events.
 *
 *   node test/knuckle.mjs
 *
 * The gesture is the game, so this asks the five questions DESIGN 7 makes
 * promises about, and it asks them of the AimSource the RUNNING GAME produced,
 * not of a function called in isolation:
 *
 *   1. a straight fast flick through the centre gives power over 0.8 and
 *      wildness under 0.1
 *   2. the same path at a quarter of the speed gives power under 0.3, and it is
 *      still a legal shot rather than a cancel
 *   3. a flick from under the marble's centre gives a NEGATIVE contact offset y,
 *      which is backspin, which is the stop shot
 *   4. a hooked path gives wildness over 0.5
 *   5. a slow tap cancels and the turn count does not change
 *
 * ⛔ THE BRACE IS PROVEN BY elementFromPoint AT THE SHOOTER'S SCREEN CENTRE,
 * never by calling a handler. A handler you call yourself proves the handler
 * exists, not that a thumb can reach it.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');

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
  headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });
// a match where the player shoots first, so the shooter is on screen and ours
await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0 }));
await settleToPlayerTurn();

/* Wait for the board to be the player's AND for the camera to have finished
   moving to it. Reading the shooter's screen position the instant the match is
   created gives a stale camera and a shooter apparently off the bottom of the
   world, which is how the first run of this gate reported y = 1117. */
async function settleToPlayerTurn() {
  await page.waitForFunction(() => {
    const s = window.KEEPSIES_DEV.state();
    return s.match && !s.match.simulating && s.match.turn === 0 && s.match.taw;
  }, { timeout: 30000 });
  await new Promise(r => setTimeout(r, 260));
}

/* ---- the brace, proven the only honest way ---- */
const taw = await page.evaluate(() => window.KEEPSIES_DEV.state().match.taw);
say(!!taw, 'the shooter is on screen at ' + (taw ? taw.x.toFixed(0) + ',' + taw.y.toFixed(0)
  + ' with a ' + taw.r.toFixed(0) + ' px grab radius' : 'NOWHERE'));

const hit = await page.evaluate((t) => {
  const el = document.elementFromPoint(Math.round(t.x), Math.round(t.y));
  return { id: el ? el.id : null, tag: el ? el.tagName : null };
}, taw);
say(hit.id === 'stage', 'what a thumb lands on at the shooter\'s centre is the game canvas, not a HUD panel: '
  + (hit.id || hit.tag));
say(taw.grabR * 2 >= 48, 'the shooter\'s grab area measures ' + (taw.grabR * 2).toFixed(0)
  + ' rendered px across at 375 wide (drawn ' + (taw.r * 2).toFixed(0) + '), the floor is 48');

/* ---- a real pointer gesture, sampled the way a thumb is ---- */
async function gesture(from, dx, dy, ms, steps, hookDeg) {
  await page.evaluate(() => window.KEEPSIES_DEV.followShot());
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const a = (hookDeg || 0) * Math.PI / 180 * f;
    const rx = dx * f * Math.cos(a) - dy * f * Math.sin(a);
    const ry = dx * f * Math.sin(a) + dy * f * Math.cos(a);
    pts.push({ x: from.x + rx, y: from.y + ry, t: ms * f });
  }
  return page.evaluate((pts, t0) => {
    const s = pts.map(p => ({ x: p.x, y: p.y, t: t0 + p.t }));
    return window.KEEPSIES_DEV.flick(s);
  }, pts, 1000);
}

const cases = [
  { id: 'a hard straight flick through the centre', d: [0, -300], ms: 55, hook: 0 },
  { id: 'the same path at a quarter of the speed', d: [0, -300], ms: 220, hook: 0 },
  { id: 'a flick from under the centre', d: [0, -300], ms: 55, hook: 0, rel: { x: 0, y: 0.85 } },
  { id: 'a flick from above the centre', d: [0, -300], ms: 55, hook: 0, rel: { x: 0, y: -0.85 } },
  { id: 'a hooked path', d: [0, -300], ms: 55, hook: 55 },
  { id: 'a slow tap', d: [0, -6], ms: 200, hook: 0 }
];
const got = {};
for (const c of cases) {
  // ⛔ Re read where the shooter is RIGHT NOW. The camera damps toward its
  // framing every frame, so a position captured before the match started is a
  // different marble by the time the flick happens, and every contact offset
  // measured against it is nonsense.
  const here = await page.evaluate(() => window.KEEPSIES_DEV.state().match.taw);
  if (!here) { say(false, c.id + ': the shooter was not on screen'); continue; }
  const at = c.rel ? { x: here.x + c.rel.x * here.r, y: here.y + c.rel.y * here.r } : here;
  const aim = await gesture(at, c.d[0], c.d[1], c.ms, 18, c.hook);
  got[c.id] = aim;
  console.log('  ' + c.id.padEnd(42) + (aim
    ? 'thumb ' + aim.thumbSpeed.toFixed(2) + '  power ' + aim.power01.toFixed(3)
    + '  offset ' + aim.contactOffset.x.toFixed(2) + ',' + aim.contactOffset.y.toFixed(2)
    + '  wild ' + aim.wildness01.toFixed(2)
    : 'CANCELLED'));
  // put the match back where it was so each case starts from the same board
  await page.evaluate(() => window.KEEPSIES_DEV.settle(1400));
  await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0 }));
  await settleToPlayerTurn();
}

const fast = got['a hard straight flick through the centre'];
const slow = got['the same path at a quarter of the speed'];
const under = got['a flick from under the centre'];
const over = got['a flick from above the centre'];
const hook = got['a hooked path'];
const tap = got['a slow tap'];

say(!!fast && fast.power01 > 0.8, '1. a hard flick gives power ' + (fast ? fast.power01.toFixed(3) : 'nothing') + ', the floor is 0.80');
say(!!fast && fast.wildness01 < 0.1, '1. and wildness ' + (fast ? fast.wildness01.toFixed(3) : '?') + ', the ceiling is 0.10');
say(!!slow && slow.power01 < 0.3, '2. a quarter speed push gives power ' + (slow ? slow.power01.toFixed(3) : 'CANCELLED') + ', the ceiling is 0.30');
say(!!slow, '2. and it is still a legal shot, not a cancel');
say(!!under && under.contactOffset.y < -0.2, '3. from under the centre the contact offset y is '
  + (under ? under.contactOffset.y.toFixed(2) : '?') + ', which is backspin');
say(!!over && over.contactOffset.y > 0.2, '3. from above it is ' + (over ? over.contactOffset.y.toFixed(2) : '?') + ', which is follow');
say(!!hook && hook.wildness01 > 0.5, '4. a hooked path gives wildness ' + (hook ? hook.wildness01.toFixed(2) : '?') + ', the floor is 0.50');
say(tap === null, '5. a slow tap is not a shot at all');

/* ---- and the cancel really did cost nothing ---- */
const before = await page.evaluate(() => window.KEEPSIES_DEV.state().match.shots);
const nowTaw = await page.evaluate(() => window.KEEPSIES_DEV.state().match.taw);
await gesture(nowTaw || { x: 187, y: 400 }, 0, -6, 200, 8, 0);
const after = await page.evaluate(() => window.KEEPSIES_DEV.state().match.shots);
say(before === after, '5. and the turn count did not move: ' + before + ' shots before, ' + after + ' after');

/* ---- the pull back fallback produces the same struct ---- */
await page.evaluate(() => window.KEEPSIES_DEV.setPullback(true));
const pbTaw = await page.evaluate(() => window.KEEPSIES_DEV.state().match.taw);
const pb = await page.evaluate((t) => window.KEEPSIES_DEV.drag(
  { x: t.x, y: t.y }, { x: t.x, y: t.y + 150 }, { x: 0, y: -0.5 }), pbTaw || { x: 187, y: 400 });
say(!!pb && pb.assist === 'pullback' && pb.power01 > 0.5 && pb.wildness01 === 0,
  'the pull back fallback makes the same AimSource: power ' + (pb ? pb.power01.toFixed(2) : '?')
  + ', wildness ' + (pb ? pb.wildness01 : '?') + ', flagged ' + (pb ? pb.assist : '?'));
await page.evaluate(() => window.KEEPSIES_DEV.setPullback(false));

say(errors.length === 0, 'zero page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

await browser.close();
server.close();
console.log(fails.length ? '\n' + fails.length + ' FAILED\nKNUCKLE FAILED' : '\nKNUCKLE OK');
process.exit(fails.length ? 1 : 0);
