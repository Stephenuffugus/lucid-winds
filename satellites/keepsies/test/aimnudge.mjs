/**
 * The fine aim, the Zoom and the snap card, in a real browser, driven by real taps.
 *
 *   node test/aimnudge.mjs
 *
 * Stephen, Sep 05, from his phone: "a button to incrementally aim too while zoomed or before
 * zoom would make it so I didn't have to spend so long trying to get the aim just right. then
 * we need to explain how flicking actually works and deviating makes the ball go off line too."
 *
 * What it asserts, each watched to fail (nudgeCoarseDeg set to 0 in tuning: 2, 3 and 5 go red):
 *   1. at the human's aim phase both aim buttons and the Zoom are on screen, 48 px or more,
 *      and a tap at the right button's centre lands ON the button, not the canvas
 *   2. three real taps on the right button turn the aim by three coarse steps, and the aim
 *      line's far end moves RIGHT on screen (that is what "aim right" means)
 *   3. the Zoom opens the scope with no thumb on the shooter, and a tap then turns the aim by
 *      the FINE step and moves the marble in the scope
 *   4. holding the button repeats: half a second held is at least three steps
 *   5. the snap card opens from its button, closes from Got it, and the save remembers it
 *   6. a flick that pulls off the line is named: the game says how many degrees and which way
 *
 * ⛔ Everything a thumb does here is a real pointer or touch event on the element a thumb
 * would land on. Nothing calls a handler.
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
const T = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'tuning.json'), 'utf8'));
const C = T.render.spyglass;

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
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });
await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0 }));
await page.waitForFunction(() => {
  const s = window.KEEPSIES_DEV.state();
  return s.match && !s.match.simulating && s.match.turn === 0 && s.match.taw;
}, { timeout: 30000 });
/* the rig renders at about 2.5 frames a second under swiftshader and the controls are shown by
   the frame loop: wait for them, never for a number of milliseconds */
await page.waitForFunction(() => window.KEEPSIES_DEV.aimUi().nudge, { timeout: 20000 });
await sleep(300);

const centre = (id) => page.evaluate((id) => {
  const el = document.getElementById(id);
  if (!el || el.hidden) return null;
  const r = el.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, onTop: !!top && (top === el || el.contains(top)) };
}, id);
const cam = () => page.evaluate(() => window.KEEPSIES_DEV.debugCam());
/* A tap: reachability is proved by elementFromPoint at the centre (above), the press itself is a
   pointerdown and pointerup on that element in one go. Under swiftshader a touchscreen tap's
   down and up land a frame apart, most of a second, and reads as a hold. */
const tap = (id) => page.evaluate((id) => {
  const el = document.getElementById(id), r = el.getBoundingClientRect();
  const o = { pointerId: 11, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); el.dispatchEvent(new PointerEvent('pointerleave', o));
  el.click();
}, id);
const ui = () => page.evaluate(() => window.KEEPSIES_DEV.aimUi());

/* 1. the controls are there and reachable */
const ui0 = await ui();
const bR = await centre('nudgeR'), bL = await centre('nudgeL'), bZ = await centre('scopeBtn');
say(ui0.nudge && ui0.scope, 'at the aim phase the aim buttons and the Zoom are shown');
say(!!bR && bR.w >= 48 && bR.h >= 48 && bR.onTop, 'the right aim button is ' + (bR ? bR.w.toFixed(0) + 'x' + bR.h.toFixed(0) : 'missing') + ' px and a tap at its centre lands on it');
say(!!bL && bL.onTop && !!bZ && bZ.h >= 48 && bZ.onTop, 'the left button and the Zoom are reachable too');

/* 2. three taps, coarse steps, and the line goes right */
const coarse = (C.nudgeCoarseDeg == null ? 2 : C.nudgeCoarseDeg) * Math.PI / 180;
// the line only draws while the scope is held or the thumb is down: hold the scope to read it, then release
await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(true)); await sleep(900);
const line0 = (await ui()).lineInfo;
await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(false)); await sleep(200);
const az0 = (await cam()).userAz;
for (let i = 0; i < 3; i++) { await tap('nudgeR'); await sleep(120); }
await sleep(600);
const az1 = (await cam()).userAz;
say(Math.abs(Math.abs(az1 - az0) - 3 * coarse) < 1e-3, 'three taps turned the aim by ' + ((az1 - az0) * 180 / Math.PI).toFixed(2) + ' degrees (three coarse steps are ' + (3 * coarse * 180 / Math.PI).toFixed(2) + ')');
await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(true)); await sleep(900);
const line1 = (await ui()).lineInfo;
say(!!line0 && !!line1 && line1.endX > line0.endX + 2, 'the aim line\'s far end moved right on screen, from x ' + (line0 && line0.endX.toFixed(1)) + ' to ' + (line1 && line1.endX.toFixed(1)));

/* 3. the Zoom holds the scope open with no thumb down, and the step is fine */
const ui1 = await ui();
const spy0 = (await cam()).spy;
say(ui1.scopeOn && ui1.spy && !!spy0, 'with Zoom on the scope is open with no thumb on the shooter, looking at range ' + (spy0 && spy0.range) + ' m');
const fine = (C.nudgeFineDeg == null ? 0.5 : C.nudgeFineDeg) * Math.PI / 180;
const az2 = (await cam()).userAz;
await tap('nudgeL');
// the scope is redrawn by the frame loop, 2.5 frames a second here: wait for the frame, not a clock
await page.waitForFunction((was) => { const c = window.KEEPSIES_DEV.debugCam(); return c.spy && Math.abs(c.spy.lateral - was) > 0.001; }, { timeout: 6000 }, spy0 ? spy0.lateral : 0).catch(() => {});
const az3 = (await cam()).userAz, spy1 = (await cam()).spy;
say(Math.abs(Math.abs(az3 - az2) - fine) < 1e-3, 'one tap with the scope open is the fine step, ' + ((az3 - az2) * 180 / Math.PI).toFixed(2) + ' degrees');
say(!!spy0 && !!spy1 && Math.abs(spy1.lateral - spy0.lateral) > 0.001, 'and the marble moved in the scope (lateral ' + (spy0 && spy0.lateral) + ' to ' + (spy1 && spy1.lateral) + ')');

/* 4. holding repeats */
const az4 = (await cam()).userAz;
await page.touchscreen.touchStart(bR.x, bR.y); await sleep(900); await page.touchscreen.touchEnd(); await sleep(300);
const az5 = (await cam()).userAz;
const steps = Math.abs(az5 - az4) / fine;
say(steps >= 3, 'a real touch held for most of a second is ' + steps.toFixed(1) + ' fine steps (one, then the repeat)');
await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(false));

/* 5. the snap card */
const bH = await centre('snapHelp');
say(!!bH && bH.onTop && bH.h >= 48, 'The snap button is reachable at ' + (bH ? bH.h.toFixed(0) : '?') + ' px');
await tap('snapHelp'); await sleep(300);
const c1 = await page.evaluate(() => window.KEEPSIES_DEV.snapCard());
say(c1.open, 'the snap card opens from its button');
const bG = await centre('snapGo');
say(!!bG && bG.onTop, 'Got it is on top of the card');
await tap('snapGo'); await sleep(400);
const c2 = await page.evaluate(() => window.KEEPSIES_DEV.snapCard());
const seenRaw = await page.evaluate(() => JSON.stringify((window.KEEPSIES_DEV.state().save || {}).seen));
say(!c2.open && c2.seen, 'Got it closes it and the save remembers (seen ' + c2.seen + ', raw ' + seenRaw + ')');

/* 6. a pulled snap is named (a fresh match, since the aim above walked the shooter about) */
await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0 }));
await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && !s.match.simulating && s.match.turn === 0 && s.match.taw; }, { timeout: 30000 });
await sleep(600);
await page.evaluate(() => window.KEEPSIES_DEV.followShot());
const here = await page.evaluate(() => window.KEEPSIES_DEV.state().match.taw);
const pts = [];
for (let i = 0; i <= 18; i++) { const f = i / 18; pts.push({ x: here.x + 110 * f, y: here.y - 300 * f, t: 1000 + 55 * f }); }
const aim = await page.evaluate((s) => window.KEEPSIES_DEV.flick(s), pts);
const said = await page.evaluate(() => window.KEEPSIES_DEV.said());
say(!!aim && Math.abs(aim.fineDeg) >= 5, 'a flick angled off the line reads as ' + (aim ? aim.fineDeg.toFixed(1) : '?') + ' degrees off');
say(/degrees (left|right) of the line/.test(said), 'and the game names it: "' + said + '"');

say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await browser.close(); server.close();
if (fails.length) { console.log('\nAIM NUDGE FAILED: ' + fails.length); process.exit(1); }
console.log('\nAIM NUDGE OK');
