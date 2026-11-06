/**
 * THE FRONT DOOR. Play Keepsies the way a thumb does, at 375 x 667.
 *
 *   node tools/frontdoor.mjs [outdir] [mode] [ringFt] [noaim]
 *     mode: first (the four minutes) | more (five matches, onboarding skipped) | all | feel (m3 step 12, KP_VP=412x915: the new input by touch, its worst angles)
 *
 * Not a gate, and deliberately not one: the gates feed the Knuckle through
 * `_feed()` for determinism, which skips `begin()` and the "is it your turn"
 * check a real pointer goes through. On 2026-09-04 twenty one green gates and
 * twenty nine dead mutants sat over a game that soft locked on the second
 * calibration snap, and this driver found it in its first minute. Run it after
 * anything that touches input, the beats, the screens or the camera, and OPEN
 * the pictures it writes.
 *
 * Every button is found by what is under its centre and tapped with a real
 * touch. Every snap is a pointerdown, a real time brace of pointermoves, a
 * burst of moves timed in real milliseconds and a pointerup dispatched to the
 * canvas, because under the software rasteriser the page draws at two or three
 * frames a second and a flick through the browser's own input pipeline takes
 * two and a half seconds and reads as a nudge. The dev hook is used to READ
 * state and to run the physics to rest, as the gates do.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');
const OUT = process.argv[2] || '/tmp/keepsies-frontdoor';
const MODE = process.argv[3] || 'all';
const RING = parseInt(process.argv[4] || '0', 10);      // 'more' mode: the ring size to play at, 0 = leave it
const AIM = process.argv[5] !== 'noaim';                 // aim the flick at a marble, the way a thumb does
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg' };   // Astra's art (an svg served as anything else is never drawn)
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
const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1'
  + (process.env.KP_QUALITY ? '&quality=' + process.env.KP_QUALITY : '');   // this box detects low; a Pixel 9 draws high

const browser = await puppeteer.launch({
  headless: 'new', protocolTimeout: 240000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
const VP = (process.env.KP_VP || '375x667').split('x').map(Number);
await page.setViewport({ width: VP[0], height: VP[1], deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text().slice(0, 200)); });

const T0 = Date.now();
const secs = () => ((Date.now() - T0) / 1000).toFixed(1);
const lines = [];
const log = (s) => { const l = '[' + secs() + 's] ' + s; console.log(l); lines.push(l); };
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let shotN = 0;
async function shot(name) {
  const f = String(++shotN).padStart(2, '0') + '-' + name + '.png';
  await page.screenshot({ path: join(OUT, f) });
  log('shot ' + f);
}
const state = () => page.evaluate(() => window.KEEPSIES_DEV.state());
const said = () => page.evaluate(() => document.getElementById('say').textContent);
const beat = () => page.evaluate(() => window.KEEPSIES_DEV.beat());
const frames = (n) => page.evaluate(() => window.KEEPSIES_DEV.settleCamera(30));
/** Wait for the page's own frame loop to draw at least one more frame. */
async function nextFrame(maxMs) {
  const f0 = (await state()).frames; const t0 = Date.now();
  while (Date.now() - t0 < (maxMs || 2500)) { await wait(60); if ((await state()).frames > f0) return true; }
  return false;
}

/** A real tap, at what is under the control's centre. */
async function tap(id, opts) {
  if (opts && opts.scroll) {
    await page.evaluate((id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'center' }); }, id);
    await wait(150);
  }
  const b = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el || el.offsetParent === null) return null;
    const r = el.getBoundingClientRect();
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
    let hit = document.elementFromPoint(cx, cy);
    while (hit && hit.id !== id && hit.parentElement) hit = hit.parentElement;
    return { cx, cy, w: Math.round(r.width), h: Math.round(r.height), hitId: hit ? hit.id : null, text: (el.textContent || '').trim().slice(0, 40), disabled: !!el.disabled };
  }, id);
  if (!b) { log('TAP ' + id + ': NOT VISIBLE'); return null; }
  if (b.hitId !== id) { log('TAP ' + id + ': BLOCKED by #' + b.hitId + ' at ' + b.cx + ',' + b.cy); return null; }
  if (b.disabled) { log('TAP ' + id + ': DISABLED (' + b.text + ')'); return null; }
  await page.touchscreen.tap(b.cx, b.cy);
  log('tap ' + id + ' "' + b.text + '" ' + b.w + 'x' + b.h + ' at ' + b.cx + ',' + b.cy);
  return b;
}

/** Finger down at x,y and a brace of `moves` pointermoves; the finger STAYS down. */
async function brace(x, y, moves) {
  // the settle is measured in time, so the hold is real time: `moves` x 16 ms
  return page.evaluate((x, y, moves) => new Promise((done) => {
    const c = document.getElementById('stage');
    const ev = (type, px, py) => c.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: px, clientY: py, bubbles: true, cancelable: true, buttons: 1 }));
    ev('pointerdown', x, y);
    let k = 0;
    const iv = setInterval(() => {
      ev('pointermove', x + ((k & 1) ? 0.3 : -0.3), y);
      if (++k >= moves) { clearInterval(iv); done(window.KEEPSIES_DEV.state().knuckle); }
    }, 16);
  }), x, y, moves);
}

/** The flick: a burst of pointermoves over `ms` real milliseconds, then up. */
async function flickBurst(x, y, o) {
  return page.evaluate((x, y, o) => {
    const c = document.getElementById('stage');
    const ev = (type, px, py, b) => c.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: px, clientY: py, bubbles: true, cancelable: true, buttons: b }));
    // keep the jitter window warm so the settle survives the gap since the brace
    for (let k = 0; k < 20; k++) ev('pointermove', x + ((k & 1) ? 0.3 : -0.3), y, 1);
    const steps = 9, t1 = performance.now();
    let px = x, py = y;
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      px = x + (o.dx || 0) * f; py = y - o.dist * f;
      if (o.curve) px += Math.sin(f * Math.PI) * o.curve;
      ev('pointermove', px, py, 1);
      const w = performance.now(); while (performance.now() - w < o.ms / steps) { }
    }
    ev('pointerup', px, py, 0);
    const d = window.KEEPSIES_DEV;
    const s = d.state();
    return { flickMs: performance.now() - t1, aim: s.lastAim, simulating: !!(s.match && s.match.simulating), say: document.getElementById('say').textContent, slip: d.slipShowing() };
  }, x, y, o);
}

/**
 * One snap at the shooter. offY in taw radii, negative = thumb BELOW the centre
 * = backspin. offX = english. curve = a hooked path. ms = how long the flick takes.
 */
async function snap(opts) {
  const o = Object.assign({ moves: 90, dist: 280, ms: 40, offY: 0, offX: 0, curve: 0, label: 'snap', shotName: null, aim: AIM }, opts || {});
  const s = await state();
  const t = s.match && s.match.taw;
  if (!t) { log(o.label + ': NO TAW ON SCREEN'); return null; }
  const ax = t.x + o.offX * t.r, ay = t.y - o.offY * t.r;
  // a person aims: the flick points at a marble, not at the camera's idea of the middle.
  // Pick the live mib nearest the ring's edge that is within the 25 degree fine angle.
  if (o.aim && !o.dx) {
    const mibs = await page.evaluate(() => window.KEEPSIES_DEV.mibs());
    let best = null;
    for (const m of mibs) {
      if (!m.visible || m.sy >= t.y) continue;
      const ang = Math.atan2(m.sx - t.x, t.y - m.sy) * 180 / Math.PI;
      if (Math.abs(ang) > 24) continue;
      if (!best || m.ring > best.ring) best = Object.assign({ ang }, m);
    }
    if (best) { o.dx = Math.tan(best.ang * Math.PI / 180) * o.dist; o.target = best.uid + ' at ' + best.ang.toFixed(1) + ' deg'; }
  }
  const kn = await brace(ax, ay, o.moves);
  if (o.shotName) { await nextFrame(); await shot(o.shotName); }
  const r = await flickBurst(ax, ay, o);
  const aim = r.aim;
  const a = aim ? ('thumb ' + (aim.thumbSpeed || 0).toFixed(2) + ' m/s, power ' + (aim.power01 || 0).toFixed(2)
    + ', off ' + (aim.contactOffset ? aim.contactOffset.x.toFixed(2) + ',' + aim.contactOffset.y.toFixed(2) : '?')
    + ', wild ' + (aim.wildness01 || 0).toFixed(2) + (aim.slipped ? ', SLIPPED' : '')) : 'no aim';
  log(o.label + ': taw ' + Math.round(t.x) + ',' + Math.round(t.y) + ' r=' + Math.round(t.r) + (o.target ? ' aim ' + o.target : '')
    + ' | settle ' + kn.settle01.toFixed(2) + ' cone ' + kn.coneDeg.toFixed(1) + ' | flick ' + r.flickMs.toFixed(0) + 'ms | ' + a
    + ' | simulating=' + r.simulating + (r.slip ? ' SLIP CARD' : '') + ' | say: ' + r.say);
  return { aim, r };
}

/* ---- STATUES (KEEPSIES_BUILD_PLAN.md step 11): placed and moved by REAL touch drags, and checked ---- */
const fails = [];
function check(ok, msg) { log((ok ? 'ok    ' : 'FAIL  ') + msg); if (!ok) fails.push(msg); }

/** A finger down at `from`, `steps` moves to `to`, then up: puppeteer's touchscreen, so the game sees touches. */
async function drag(from, to, steps) {
  await page.touchscreen.touchStart(from.x, from.y);
  for (let k = 1; k <= steps; k++) { await page.touchscreen.touchMove(from.x + (to.x - from.x) * k / steps, from.y + (to.y - from.y) * k / steps); await wait(16); }
  await page.touchscreen.touchEnd();
}

/** The player's two placements (Dusty answers each by his rule), each landing where the finger lifted. */
async function statuesLeg() {
  for (let k = 0; k < 2; k++) {
    await page.waitForFunction(() => { const p = window.KEEPSIES_DEV.placing(); return p && p.placed % 2 === 0; }, { timeout: 15000 });
    await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(60));
    await wait(150);
    const pick = await page.evaluate((k) => {
      const d = window.KEEPSIES_DEV, shape = ['arch', 'loaf'][k];
      // a finger only reaches what is on the screen: a spot whose point is on the dirt above the tray
      const trayTop = document.getElementById('statueTray').getBoundingClientRect().top;
      const seen = d.spotsFor(shape).map(p => ({ p, s: d.projectGround(p.x, p.z) }))
        .filter(q => q.s.visible && q.s.x > 40 && q.s.x < innerWidth - 40 && q.s.y > 110 && q.s.y < trayTop - 30);
      const q = seen[(k * 7) % Math.max(1, seen.length)];
      const r = document.getElementById('st-' + shape).getBoundingClientRect();
      return q ? { shape, sp: q.p, tile: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, at: q.s } : null;
    }, k);
    if (!pick) { check(false, 'a legal spot on the screen for statue ' + (k + 1)); return; }
    await drag(pick.tile, { x: pick.at.x, y: pick.at.y }, 14);
    await wait(200);
    const want = await page.evaluate((x, y) => window.KEEPSIES_DEV.groundAt(x, y), pick.at.x, pick.at.y);
    const pend = ((await page.evaluate(() => window.KEEPSIES_DEV.placing())) || {}).pending;
    check(!!pend && !!want && Math.abs(pend.x - want.x) < 1e-9 && Math.abs(pend.z - want.z) < 1e-9,
      'statue ' + (k + 1) + ' (' + pick.shape + ') lands where the finger lifted: ' + JSON.stringify(pend) + ', the grid point under the finger ' + JSON.stringify(want));
    await tap('stConfirm'); await wait(250);
    const rec = (await page.evaluate(() => window.KEEPSIES_DEV.statues())).filter(s => s.owner === 0)[k];
    check(!!rec && !!want && rec.x === want.x && rec.z === want.z, 'and Confirm keeps it there: ' + JSON.stringify(rec));
    await shot('statue-placed-' + (k + 1));
  }
  await page.waitForFunction(() => !window.KEEPSIES_DEV.placing(), { timeout: 15000 }).catch(() => {});
  const all = await page.evaluate(() => window.KEEPSIES_DEV.statues());
  check(all.length === 4, 'four statues stand before the lag (two each): ' + JSON.stringify(all));
}

/** A move on my turn by a real drag, checked, then a real snap on my next turn: the snap still works after. */
async function moveLeg() {
  const why = await myTurn();
  if (why !== 'mine') { check(false, 'a turn of mine came for the move: ' + why); return; }
  // the HUD offers the move on the next frame of my turn: wait for it the way a player waits for a button to appear
  await page.waitForFunction(() => { const b = document.getElementById('moveStatue'); return b && !b.hidden && b.offsetParent !== null; }, { timeout: 8000 }).catch(() => {});
  if (!(await tap('moveStatue'))) { check(false, 'Move a statue is offered on my turn'); return; }
  check(true, 'Move a statue is offered on my turn');
  // the view eases to the whole ring in real time (the frame loop drives it): let it arrive before aiming a finger
  await wait(2200);
  const mv = await page.evaluate(() => {
    const d = window.KEEPSIES_DEV, ss = d.statues();
    const trayTop = document.getElementById('statueTray').getBoundingClientRect().top;
    // one of MINE that a finger can reach on the screen
    const k = ss.findIndex(q => { if (q.owner !== 0) return false; const p = d.projectGround(q.x, q.z, 0.02); return p.visible && p.x > 30 && p.x < innerWidth - 30 && p.y > 100 && p.y < trayTop - 20; });
    if (k < 0) return null;
    const s = ss[k];
    const spots = d.spotsFor(s.shape).filter(p => Math.hypot(p.x - s.x, p.z - s.z) > 0.1 && Math.hypot(p.x - s.x, p.z - s.z) <= 0.6)
      .map(p => ({ p, s: d.projectGround(p.x, p.z, 0) }))
      .filter(q => q.s.visible && q.s.x > 40 && q.s.x < innerWidth - 40 && q.s.y > 110 && q.s.y < trayTop - 30);
    const from = d.projectGround(s.x, s.z, 0.02);
    return spots.length && from.y < trayTop - 10 ? { k, from, to: spots[0].s } : null;
  });
  if (!mv) { check(false, 'a legal spot within two feet for the move'); await tap('stUndo'); return; }
  await drag(mv.from, mv.to, 14);
  await wait(200);
  const want = await page.evaluate((x, y) => window.KEEPSIES_DEV.groundAt(x, y), mv.to.x, mv.to.y);
  const pend = ((await page.evaluate(() => window.KEEPSIES_DEV.moving())) || {}).pending;
  check(!!pend && !!want && Math.abs(pend.x - want.x) < 1e-9 && Math.abs(pend.z - want.z) < 1e-9,
    'the moved statue lands where the finger lifted: ' + JSON.stringify(pend) + ', want ' + JSON.stringify(want));
  await shot('statue-move');
  await tap('stConfirm'); await wait(300);
  const after = (await page.evaluate(() => window.KEEPSIES_DEV.statues()))[mv.k];
  check(!!after && !!want && after.x === want.x && after.z === want.z, 'and Confirm moves it there: ' + JSON.stringify(after));
  const t = (await state()).match;
  check(t && t.turn === 1, 'and the move spends my turn (Dusty to shoot): turn ' + (t ? t.turn : '?'));
  const again = await myTurn();
  if (again !== 'mine') { check(again === 'ceremony' || again === 'over', 'my next turn came: ' + again); return; }
  const sn = await snap({ label: 'the snap after a move' });
  check(!!sn && !!sn.r && (sn.r.simulating || !!sn.aim), 'the snap still works after: ' + (sn && sn.r ? 'simulating=' + sn.r.simulating : 'no snap'));
  await settle();
}

/** Run the physics to rest through the dev hook, and let the camera follow. */
async function settle() {
  const k = await page.evaluate(() => { const d = window.KEEPSIES_DEV; const k = d.settle(1500); d.settleCamera(40); return k; });
  await wait(120);
  return k;
}

/** Bring the game to my turn, playing the AI through the dev hook. */
async function myTurn() {
  for (let i = 0; i < 60; i++) {
    const r = await page.evaluate(() => {
      const d = window.KEEPSIES_DEV;
      if (document.querySelector('.ceremony')) return 'ceremony';
      const s = d.state();
      if (s.screen !== 'match') return s.screen;
      if (!s.match) return 'nomatch';
      if (s.match.phase === 'over') return 'over';
      if (s.match.simulating) { d.settle(1500); d.settleCamera(30); return 'settled'; }
      if (s.match.turn !== 0) { d.playAiTurns(1); d.settleCamera(40); return 'ai'; }
      if (s.match.taw) return 'mine';
      d.settleCamera(30);
      return 'notaw';
    });
    if (r === 'mine' || r === 'ceremony' || r === 'over' || (r !== 'settled' && r !== 'ai' && r !== 'notaw' && r !== 'match')) return r;
    await wait(30);
  }
  return 'stuck';
}

/** Play the current match out with real snaps. */
async function playOut(label, maxShots, shotFirst) {
  let shots = 0;
  const cards = [];
  for (let i = 0; i < (maxShots || 40); i++) {
    const why = await myTurn();
    if (why !== 'mine') { log(label + ': stopped at "' + why + '" after ' + shots + ' of my shots'); return why; }
    const s = await state();
    const st = 'score ' + s.match.pocketed.join('-') + ', mibs ' + s.match.mibsLeft + ', shot ' + s.match.shots;
    const variant = i % 4 === 1 ? { offY: -0.7, ms: 58, dist: 260, label: label + ' mine ' + (shots + 1) + ' (backspin, medium) ' + st }
      : i % 4 === 3 ? { offX: 0.5, label: label + ' mine ' + (shots + 1) + ' (english) ' + st }
        : { label: label + ' mine ' + (shots + 1) + ' (clean, hard) ' + st };
    if (shotFirst && shots < shotFirst) variant.shotName = label + '-brace-' + (shots + 1);
    await snap(variant);
    shots++;
    await settle();
    if (shotFirst && shots <= shotFirst) await shot(label + '-after-' + shots);
    log(label + ': after mine ' + shots + ': ' + (await said()) + ' | ' + (await page.evaluate(() => { const s = window.KEEPSIES_DEV.state(); const lr = s.match.lastResolve || {}; return 'score ' + s.match.pocketed.join('-') + ' turn ' + s.match.turn + ' phase ' + s.match.phase + ' tech ' + s.match.techniques.join(',') + ' | struck ' + (lr.firstStruckUid || '-') + ' rest ' + (lr.tawRestDistanceToStruck == null ? '-' : lr.tawRestDistanceToStruck.toFixed(2)); })));
  }
  log(label + ': hit the shot cap');
  return 'cap';
}

const card = () => page.evaluate(() => Array.from(document.querySelectorAll('#results h2, #results .row, #rLevel, #rWhy, #rsHead, #rsName, #rsSay, #rsClock')).filter(e => e.offsetParent !== null).map(e => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '));

/* ------------------------------------------------------------------- go */

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });
await page.evaluate(() => window.KEEPSIES_DEV.wipeSave());
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });
log('booted fresh. quality=' + (await state()).quality + ' beat=' + (await beat()));

/* ---- m3 step 12: THE FEEL GATE. The new input by touch (page.touchscreen where the timing does not matter; on this box a frame takes a second, so a touch delivered through it arrives a second late, and the flick itself is the pointer burst the whole walk uses, with real timing). Asserts the shooter never jumps over 3 degrees and the shot leaves within 0.5 degrees of the aim line, and walks the worst angles on purpose. */
if (MODE === 'feel') {
  const [W, H] = VP, ft = RING || 5;
  const cam = () => page.evaluate(() => window.KEEPSIES_DEV.debugCam());
  const ts = () => page.evaluate(() => window.KEEPSIES_DEV.tawScreen());
  const deg = (r) => r * 180 / Math.PI, wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const bearing = (c) => Math.atan2(c.tawWorld.x, c.tawWorld.z);
  const rectOf = (id) => page.evaluate((id) => { const el = document.getElementById(id); if (!el || el.hidden || el.offsetParent === null) return null; const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, id);
  const settleCam = async () => { await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90)); await wait(150); };
  const lift = (x, y, id) => page.evaluate((x, y, id) => { document.getElementById('stage').dispatchEvent(new PointerEvent('pointerup', { pointerId: id || 7, pointerType: 'touch', isPrimary: !id, clientX: x, clientY: y, bubbles: true, cancelable: true })); }, x, y, id);
  async function newMatch(o) {
    await page.evaluate((o, ft) => window.KEEPSIES_DEV.start(Object.assign({ seed: 424242, forceFirst: 0, houseRules: { ringSizeFt: ft, statues: false } }, o || {})), o || {}, ft);
    await page.waitForFunction(() => { const D = window.KEEPSIES_DEV, s = D.state(); return s.match && !s.match.simulating && s.match.turn === 0 && s.match.taw && D.aimUi().nudge; }, { timeout: 60000 });
    await settleCam();
  }
  /** the opening's numbers: every one against the HUD */
  async function sizes(tag) {
    const c = await cam(), t = await ts(), [corners, rules, nudgeL, nudgeR, zoom, names] = await Promise.all(['corners', 'houseRules', 'nudgeL', 'nudgeR', 'scopeBtn', 'scores'].map(rectOf));
    const clr = (q) => (q ? Math.max(q.l - t.x, 0, t.x - q.r, q.t - t.y, 0, t.y - q.b) - t.grabR : null);
    const on = c.mibsOnScreen.filter(m => m.x >= 0 && m.x <= W && m.y >= 0 && m.y <= H).length;
    log(tag + ': shooter ' + c.shooterPx + ' px at ' + t.x.toFixed(0) + ',' + t.y.toFixed(0) + ', mibs ' + on + ' of ' + c.mibsOnScreen.length + ' on the screen (' + c.mibsOnScreen.map(m => m.px).sort((a, b) => a - b).slice(0, 1) + ' to ' + c.mibsOnScreen.map(m => m.px).sort((a, b) => b - a).slice(0, 1) + ' px), circle clear of corners ' + clr(corners) + ', rules ' + clr(rules) + ', nudges ' + clr(nudgeL) + ' ' + clr(nudgeR) + ', zoom ' + clr(zoom) + ', names foot ' + (names ? names.b.toFixed(0) : '-'));
    check(t.y + t.grabR <= (rules ? rules.t : H) + 0.5 && t.x - t.grabR >= -0.5 && t.x + t.grabR <= W + 0.5, tag + ': the whole circle is on the screen and clear of the chips');
    return { c, t };
  }
  await page.evaluate(() => window.KEEPSIES_DEV.skipOnboarding());
  await newMatch();
  check((await state()).match.phase === 'place', 'the match opens in the place phase');
  let { c: c0, t } = await sizes(W + 'x' + H + ' ' + ft + ' foot opening');

  /* the worst angle: a thumb resting still for 3 s in the place phase, off the circle */
  const off = { x: Math.min(W - 24, t.x + t.grabR + 28), y: t.y - 40 };
  await page.touchscreen.touchStart(off.x, off.y);
  await wait(3000);
  let c1 = await cam();
  check(Math.abs(wrapA(bearing(c1) - bearing(c0))) < 1e-4 && Math.abs(c1.azimuth - c0.azimuth) < 0.002, 'a thumb resting still for 3 s in the place phase moves nothing: bearing ' + deg(wrapA(bearing(c1) - bearing(c0))).toFixed(3) + ', camera ' + deg(c1.azimuth - c0.azimuth).toFixed(3) + ' degrees');
  /* the same finger drags: the shooter slides, never over 3 degrees a move, the camera still */
  let prev = c1, maxB = 0, maxA = 0;
  for (let k = 1; k <= 12; k++) { await page.touchscreen.touchMove(off.x - 4 * k, off.y); await wait(40); const c = await cam(); maxB = Math.max(maxB, Math.abs(deg(wrapA(bearing(c) - bearing(prev))))); maxA = Math.max(maxA, Math.abs(deg(c.azimuth - c1.azimuth))); prev = c; }
  check(maxB <= 3, 'a 48 px place drag: the shooter never jumps over 3 degrees (largest ' + maxB.toFixed(2) + ')');
  check(maxA <= 0.5, 'and the camera holds still under it (' + maxA.toFixed(2) + ')');
  const drag0 = Math.abs(prev.proj.x - c1.proj.x);
  check(drag0 > 20 && drag0 < 80, 'and the shooter keeps pace with the finger: ' + drag0.toFixed(1) + ' px for 48');
  await page.touchscreen.touchEnd();
  await settleCam();

  /* a brace commits the place; a slow lift is no shot */
  t = await ts();
  await brace(t.x, t.y, 12);
  await lift(t.x, t.y);
  await wait(200);
  check((await state()).match.phase === 'aim' && !(await state()).match.simulating, 'a brace on the circle commits the place and a still lift is no shot');
  await settleCam();

  /* an orbit off the circle */
  t = await ts();
  const c2 = await cam(), g = await page.evaluate(() => window.KEEPSIES_DEV.tuning().render.orbitRadPerPx);
  const oy = t.y - t.grabR - 90, ox = W * 0.2;
  await page.touchscreen.touchStart(ox, oy);
  for (let k = 1; k <= 10; k++) { await page.touchscreen.touchMove(ox + 10 * k, oy); await wait(30); }
  await page.touchscreen.touchEnd();
  await settleCam();
  const c3 = await cam(), t3 = await ts();
  check(Math.abs(Math.abs(c3.userAz - c2.userAz) - 100 * g) < 0.03, 'a 100 px orbit turns ' + deg(Math.abs(c3.userAz - c2.userAz)).toFixed(1) + ' degrees (the gain says ' + deg(100 * g).toFixed(1) + ')');
  check(Math.hypot(t3.x - t.x, t3.y - t.y) < 1.5, 'and the shooter holds its place: ' + Math.hypot(t3.x - t.x, t3.y - t.y).toFixed(2) + ' px');

  /* a dial turn: the thumb on the marble going sideways turns the aim and fires nothing */
  const a4 = await page.evaluate(() => window.KEEPSIES_DEV.aimNow());
  await page.touchscreen.touchStart(t3.x, t3.y); await wait(300);
  for (let k = 1; k <= 4; k++) { await page.touchscreen.touchMove(t3.x + 12 * k, t3.y); await wait(60); }
  await page.touchscreen.touchEnd(); await wait(300);
  await settleCam();
  const c4 = await cam(), t4 = await ts(), a4b = await page.evaluate(() => window.KEEPSIES_DEV.aimNow()), s4 = await state();
  check(!s4.match.simulating && JSON.stringify(a4) === JSON.stringify(a4b), 'a dial turn fires no shot');
  check(Math.abs(Math.abs(c4.userAz - c3.userAz) - 48 * g) < 0.03, 'and turns the aim ' + deg(Math.abs(c4.userAz - c3.userAz)).toFixed(1) + ' degrees (the gain says ' + deg(48 * g).toFixed(1) + ')');
  check(Math.hypot(t4.x - t3.x, t4.y - t3.y) < 1.5, 'and the shooter holds its place: ' + Math.hypot(t4.x - t3.x, t4.y - t3.y).toFixed(2) + ' px');

  /* a brace on the circle's edge, a forward flick: the shot leaves on the aim line */
  const c5 = await cam();
  const ex = t4.x + (t4.grabR - 6) * Math.sin(0.7), ey = t4.y + (t4.grabR - 6) * Math.cos(0.7);
  const kn = await brace(ex, ey, 60);
  check(kn.bracing, 'a thumb on the circle\'s edge braces (' + (t4.grabR - 6) + ' px from the centre)');
  const fl = await flickBurst(ex, ey, { dist: 240, ms: 45, dx: 0 });
  const dir = fl.aim && fl.aim.dir, off5 = dir ? deg(wrapA(Math.atan2(dir.x, dir.z) - wrapA(c5.azimuth + Math.PI))) : null;
  check(fl.simulating && dir && Math.abs(off5) <= 0.5, 'a forward flick fires, ' + (off5 === null ? '?' : off5.toFixed(3)) + ' degrees off the aim line (power ' + (fl.aim ? fl.aim.power01.toFixed(2) : '?') + ')');

  /* the hold and the watch: the camera never follows the shot */
  let maxT = 0, el = 0;
  for (let k = 0; k < 8; k++) { await wait(500); const c = await cam(); maxT = Math.max(maxT, Math.abs(deg(c.azimuth - c5.azimuth))); el = Math.max(el, c.cam.el); }
  check(maxT <= 2, 'while the shot plays the camera turns ' + maxT.toFixed(2) + ' degrees (under 2)');
  log('the watch frame reached ' + el.toFixed(1) + ' degrees (the aim frame stands at ' + c5.cam.el + ')');
  check(el > c5.cam.el + 2, 'and eases up and back to watch');
  await settle();

  /* LOOK, held on a real touch */
  let why = await myTurn();
  check(why === 'mine', 'my next turn comes: ' + why);
  await settleCam();
  const lk = await rectOf('topDown');
  await page.touchscreen.touchStart(lk.l + lk.w / 2, lk.t + lk.h / 2);
  await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el > 85, { timeout: 30000 }).catch(() => {});
  await wait(5000);
  const cL = await cam();
  check(cL.cam.el > 85 && cL.ringRect.x0 >= 4 && cL.ringRect.x1 <= W - 4 && cL.ringRect.y0 >= 60 && cL.ringRect.y1 <= H - 90, 'LOOK held: el ' + cL.cam.el + ', the chalk ' + cL.ringRect.x0 + ' to ' + cL.ringRect.x1 + ' by ' + cL.ringRect.y0 + ' to ' + cL.ringRect.y1);
  await page.touchscreen.touchEnd();
  await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el < 40, { timeout: 30000 }).catch(() => {});
  check((await cam()).cam.el < 40, 'and a lift lets it go');
  await settleCam();

  /* the worst angle: a second finger during the brace knuckles down, and neither pinches nor orbits */
  t = await ts();
  const c6 = await cam();
  await brace(t.x, t.y, 40);
  await page.evaluate((x, y) => { document.getElementById('stage').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 8, pointerType: 'touch', isPrimary: false, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: 1 })); }, W * 0.8, t.y - 200);
  await wait(200);
  const k6 = (await state()).knuckle;
  check(k6.knuckledDown, 'a second finger during the brace knuckles down');
  const f6 = await flickBurst(t.x, t.y, { dist: 240, ms: 45, dx: 0 });
  await lift(W * 0.8, t.y - 200, 8);
  const c7 = await cam(), cap = await page.evaluate(() => window.KEEPSIES_DEV.tuning().snap.knuckledPowerCap);
  check(f6.simulating && f6.aim && f6.aim.power01 <= cap + 1e-6, 'and the flick fires capped at ' + cap + ' (power ' + (f6.aim ? f6.aim.power01.toFixed(2) : '?') + ')');
  check(c7.userZoom === c6.userZoom && Math.abs(c7.userAz - c6.userAz) < 1e-3, 'and the second finger neither pinched nor orbited (zoom ' + c7.userZoom + ', orbit ' + deg(c7.userAz - c6.userAz).toFixed(2) + ' degrees)');
  await settle();

  /* the worst angle: the shooter walked across the seam, behind the cross. The long way round is 300 degrees: no sampled frame may turn even 30 */
  await newMatch({ seed: 515151 });
  await page.evaluate(() => window.KEEPSIES_DEV.placeAngle(Math.PI - 0.25));
  await settleCam();
  const c8 = await cam();
  let maxS = 0, last = c8.azimuth;
  log('at the seam the camera azimuth reads ' + deg(c8.azimuth).toFixed(1) + ' with the shooter at bearing ' + deg(bearing(c8)).toFixed(1));
  for (let k = 1; k <= 24; k++) {
    await page.evaluate((a) => window.KEEPSIES_DEV.placeAngle(a), Math.PI - 0.25 + k * 0.02);
    await wait(120);
    const c = await cam(); maxS = Math.max(maxS, Math.abs(deg(c.azimuth - last))); last = c.azimuth;
  }
  await settleCam();
  const c9 = await cam();
  check(maxS < 30, 'the shooter across the seam: the largest turn between samples is ' + maxS.toFixed(1) + ' degrees (the long way round is 300)');
  check(Math.abs(deg(c9.azimuth - c8.azimuth)) < 60 && c9.proj.visible && c9.proj.y < H, 'and it ends behind the shooter, ' + deg(c9.azimuth - c8.azimuth).toFixed(1) + ' degrees on, the shooter on the screen at ' + c9.proj.x + ',' + c9.proj.y);

  /* the worst angle: one mib left */
  await newMatch({ seed: 616161 });
  await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.pocketAllBut(1); });
  await wait(600); await settleCam();
  const end = await sizes(W + 'x' + H + ' ' + ft + ' foot, one mib left');
  const lone = end.c.mibsOnScreen[0];
  check(!!lone && lone.x >= 0 && lone.x <= W && lone.y >= 40 && lone.y < end.t.y, 'the last mib is on the screen above the shooter: ' + (lone ? lone.x + ',' + lone.y + ', ' + lone.px + ' px' : 'none'));

  /* the worst angle: calibration on this screen, to its end */
  await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.title(); D.calibrate(); });
  await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && s.match.taw; }, { timeout: 40000 });
  await settleCam();
  const tg = await page.evaluate(() => { const r = document.getElementById('calibSay').getBoundingClientRect(); return { t: window.KEEPSIES_DEV.groundTarget(), say: r.bottom }; });
  const tc = await ts();
  check(!!tg.t && tg.t.x > 0 && tg.t.x < W && tg.t.y > tg.say && tg.t.y < tc.y, 'the calibration target stands on the screen under the words: ' + JSON.stringify(tg));
  check(tc.y + tc.grabR <= H, 'and the circle is on the screen: foot ' + (tc.y + tc.grabR).toFixed(0) + ' of ' + H);
  for (let i = 1; i <= 3; i++) {
    await snap({ moves: 14, dist: 300, ms: 45, aim: false, label: 'calib ' + i });
    if (i < 3) { await settle(); await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && !s.match.simulating && s.match.taw; }, { timeout: 40000 }).catch(() => {}); await settleCam(); }
  }
  await wait(1200);
  const s9 = await state();
  check(s9.screen !== 'calib' && !!s9.calib.own, 'calibration ends and keeps its number: screen ' + s9.screen + ', max ' + s9.calib.max);
  log('errors: ' + (errors.length ? '\n  ' + errors.join('\n  ') : 'none'));
  check(errors.length === 0, 'no page errors');
  log(fails.length ? 'FEEL FAILED: ' + fails.length : 'FEEL OK');
  writeFileSync(join(OUT, 'log.txt'), lines.join('\n') + '\n');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
}

if (MODE === 'all' || MODE === 'first') {
  await shot('title');
  await tap('play');
  await wait(900);
  await shot('calib-1');
  log('calib screen. say: ' + (await page.evaluate(() => document.getElementById('calibSay').textContent)) + ' beat=' + (await beat()));
  const cal = [{ dist: 300, ms: 45 }, { dist: 320, ms: 35 }, { dist: 260, ms: 40 }];
  for (let i = 1; i <= 3; i++) {
    await snap(Object.assign({ moves: 12, label: 'calib snap ' + i, shotName: i === 1 ? 'calib-thumb-on' : null }, cal[i - 1]));
    await wait(250);
    if (i === 1) await shot('calib-in-flight');
    const c = await page.evaluate(() => ({ say: document.getElementById('calibSay').textContent, st: window.KEEPSIES_DEV.state().calibrating, screen: window.KEEPSIES_DEV.state().screen }));
    log('calib ' + i + ': ' + JSON.stringify(c));
    if (i < 3) { await settle(); await nextFrame(); await nextFrame(); log('calib ' + i + ': marble back? taw=' + JSON.stringify(((await state()).match || {}).taw) + ' turn=' + ((await state()).match || {}).turn); }
  }
  await settle();
  await nextFrame(); await nextFrame();
  log('after calibration: screen=' + (await state()).screen + ' beat=' + (await beat()) + ' calib=' + JSON.stringify((await state()).calib));
  await shot('rules');
  await tap('rulesGo');
  await wait(500);
  await shot('setup-first');
  log('setup: beat=' + (await beat()) + ' rules=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.houseRules())) + ' anteHidden=' + (await page.evaluate(() => document.getElementById('ante').hidden)) + ' opp="' + (await page.evaluate(() => document.getElementById('oppLine').textContent)) + '"');
  await tap('setupGo');
  await wait(900);
  await frames();
  await wait(300);
  await shot('board-first');
  log('board: say=' + (await said()) + ' beat=' + (await beat()) + ' match=' + JSON.stringify((await state()).match));

  // the break
  {
    const why = await myTurn();
    await wait(300);
    log('first turn: ' + why + ' say=' + (await said()) + ' taw=' + JSON.stringify(((await state()).match || {}).taw));
    if (why === 'mine') {
      const s = await state(); const t = s.match.taw;
      const k1 = await brace(t.x, t.y, 30);
      await wait(600);
      await shot('brace-early');
      const k2 = await page.evaluate((x, y) => {
        const c = document.getElementById('stage');
        for (let k = 0; k < 60; k++) c.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x + ((k & 1) ? 0.3 : -0.3), clientY: y, bubbles: true, buttons: 1 }));
        return window.KEEPSIES_DEV.state().knuckle;
      }, t.x, t.y);
      await wait(600);
      await shot('brace-settled');
      log('brace: after 30 moves settle ' + k1.settle01.toFixed(2) + ' cone ' + k1.coneDeg.toFixed(1) + '; after 90 settle ' + k2.settle01.toFixed(2) + ' cone ' + k2.coneDeg.toFixed(2) + '; assist dots ' + (await page.evaluate(() => window.KEEPSIES_DEV.assistDots())) + '; reticle ' + (await page.evaluate(() => { const r = document.getElementById('reticle'); return r.hidden ? 'hidden' : r.style.width + ' ' + r.style.borderColor; })));
      const r = await flickBurst(t.x, t.y, { dist: 300, ms: 35 });
      log('BREAK: flick ' + r.flickMs.toFixed(0) + ' ms, thumb ' + (r.aim && r.aim.thumbSpeed || 0).toFixed(2) + ' power ' + (r.aim && r.aim.power01 || 0).toFixed(2) + ' say=' + r.say);
      await page.evaluate(() => window.KEEPSIES_DEV.tick(45));
      await wait(200);
      await shot('break-in-motion');
      await settle();
      await shot('break-settled');
      const s2 = await state();
      log('break settled: pocketed ' + s2.match.pocketed.join('-') + ', mibs left ' + s2.match.mibsLeft + ', turn ' + s2.match.turn + ', phase ' + s2.match.phase + ', beat=' + (await beat()) + ' say=' + (await said()));
    }
  }
  // the sticking beat
  {
    const why = await myTurn();
    log('sticking turn: ' + why + ' beat=' + (await beat()) + ' say=' + (await said()));
    if (why === 'mine') {
      await snap({ offY: -0.6, dist: 220, ms: 70, label: 'STICK (backspin, medium)', shotName: 'stick-brace' });
      await page.evaluate(() => window.KEEPSIES_DEV.tick(40));
      await wait(200);
      await shot('stick-in-motion');
      await settle();
      const s2 = await state();
      log('stick settled: techniques ' + s2.match.techniques.join(',') + ' beat=' + (await beat()) + ' say=' + (await said()) + ' toast=' + (await page.evaluate(() => { const t = document.getElementById('toast'); return t.hidden ? 'hidden' : t.textContent.trim().replace(/\s+/g, ' '); })));
      await shot('stick-settled');
    }
  }
  // a wild one, then a brush that is too soft to count
  {
    let why = await myTurn();
    if (why === 'mine') {
      await snap({ dist: 260, ms: 45, curve: 90, label: 'WILD (hooked path)' });
      await settle();
      log('wild: say=' + (await said()) + ' toast=' + (await page.evaluate(() => { const t = document.getElementById('toast'); return t.hidden ? 'hidden' : t.textContent.trim().replace(/\s+/g, ' '); })));
    }
    why = await myTurn();
    if (why === 'mine') {
      const s = await state(); const t = s.match.taw;
      await brace(t.x, t.y, 40);
      const r = await flickBurst(t.x, t.y, { dist: 14, ms: 200 });
      await wait(300);
      log('brush: thumb ' + (r.aim ? r.aim.thumbSpeed.toFixed(2) : 'none') + ' say=' + r.say + ' simulating=' + r.simulating + ' slip=' + r.slip + ' turn still mine=' + ((await state()).match.turn === 0));
      await shot('after-brush');
      // and a top down look, the way a person pokes at buttons
      await tap('topDown'); await wait(200); await frames(); await wait(300);
      await shot('topdown');
      await tap('topDown'); await wait(200); await frames();
      // and the pause
      await tap('pause'); await wait(300); await shot('pause'); await tap('resume'); await wait(200);
    }
  }
  const end = await playOut('match1', 40, 0);
  log('match 1 ended "' + end + '". screen=' + (await state()).screen + ' beat=' + (await beat()) + ' stats=' + JSON.stringify((await state()).match));
  await wait(600);
  await shot('match1-end');
  log('results: ' + (await card()));
  await tap('again');
  await wait(900);
  await shot('tin');
  log('after REMATCH: screen=' + (await state()).screen + ' beat=' + (await beat()));
  await tap('heir-lutz');
  await wait(300);
  await shot('tin-picked');
  await tap('tinTake');
  await wait(900);
  await shot('collection-after-tin');
  log('collection: screen=' + (await state()).screen + ' beat=' + (await beat()) + ' inventory=' + (await page.evaluate(() => window.KEEPSIES_DEV.inventory())) + ' collBack="' + (await page.evaluate(() => document.getElementById('collBack').textContent)) + '" wallet=' + (await page.evaluate(() => document.getElementById('collWallet').textContent)));
  await page.evaluate(() => document.getElementById('collection').scrollTo(0, 400)); await wait(300);
  await shot('collection-scrolled');
  await page.evaluate(() => document.getElementById('collection').scrollTo(0, 0)); await wait(200);
  await tap('tile-lutz');
  await wait(800);
  await shot('inspect-lutz');
  await tap('inspectBack');
  await wait(500);
  await tap('collBack');
  await wait(700);
  await shot('setup-keeps');
  log('setup for keeps: beat=' + (await beat()) + ' say=' + (await page.evaluate(() => document.getElementById('anteSay').textContent)) + ' staked=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.stakeNow())) + ' playDisabled=' + (await page.evaluate(() => document.getElementById('setupGo').disabled)) + ' rules=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.houseRules())));
  await tap('setupGo');
  await wait(900);
  await frames();
  await shot('board-keeps');
  log('keeps board: pot=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.pot())) + ' say=' + (await said()) + ' inventory=' + (await page.evaluate(() => window.KEEPSIES_DEV.inventory())));
  const end2 = await playOut('match2', 40, 1);
  log('match 2 ended "' + end2 + '"');
  if (end2 === 'ceremony') { await wait(350); await shot('ceremony'); await wait(900); await shot('ceremony-2'); }
  await page.waitForFunction(() => !document.querySelector('.ceremony'), { timeout: 15000 }).catch(() => log('ceremony did not end by itself'));
  await wait(400);
  await shot('after-keeps');
  log('after keeps: screen=' + (await state()).screen + ' beat=' + (await beat()) + ' | ' + (await card()));
  log('first four minutes done at ' + secs() + ' s of rig time');
}

if (MODE === 'all' || MODE === 'more') {
  if (MODE === 'more') {
    await page.evaluate(() => window.KEEPSIES_DEV.skipOnboarding());
    await page.evaluate(() => window.KEEPSIES_DEV.title());
    // a player who skipped the beats still calibrates once and reads the rules once
    await tap('play'); await wait(600);
    if ((await state()).screen === 'calib') {
      for (let i = 1; i <= 3; i++) { await snap({ moves: 12, dist: 300, ms: 45, label: 'calib ' + i }); await settle(); await nextFrame(); await nextFrame(); }
      await settle(); await nextFrame(); await nextFrame();
    }
    if ((await state()).screen === 'rules') { await tap('rulesGo'); await wait(400); }
    log('more: ready at ' + (await state()).screen + ' calib=' + JSON.stringify((await state()).calib));
  }
  for (let n = 3; n <= 7; n++) {
    let s = await state();
    if (s.screen === 'ransom') { await shot('ransom-' + n); await tap('rsLater'); await wait(400); s = await state(); }
    if (s.screen === 'results') { await tap('again'); await wait(500); }
    else if (s.screen === 'title') { await tap('play'); await wait(500); }
    else if (s.screen === 'setup') { }
    s = await state();
    if (s.screen !== 'setup') { log('match ' + n + ': expected setup, got ' + s.screen); await shot('unexpected-' + n); break; }
    if (RING) { for (let k = 0; k < 4; k++) { if ((await page.evaluate(() => window.KEEPSIES_DEV.houseRules().ringSizeFt)) === RING) break; await tap('hr-ringSizeFt'); await wait(150); } }
    else if (n === 4) { await tap('hr-ringSizeFt'); await wait(200); }
    if (n === 6 && !RING) { await tap('hr-bombing'); await wait(200); }
    // match 3 is played with STATUES on (m2 step 11): placed and moved by real touches
    if (n === 3) { await tap('hr-statues'); await wait(200); }
    if (n === 4) { await tap('hr-statues'); await wait(200); }
    const staked = await page.evaluate(() => window.KEEPSIES_DEV.stakeNow());
    if (!staked.length) {
      const id = n === 5 ? 'stake-cats_eye_banana' : (n === 7 ? 'stake-lutz' : 'stake-dirt_plain');
      (await tap(id, { scroll: true })) || (await tap('stake-dirt_plain', { scroll: true }));
    }
    await wait(300);
    if (n === 3 || n === 5 || n === 7) await shot('setup-' + n);
    log('match ' + n + ' setup: rules=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.houseRules())) + ' say="' + (await page.evaluate(() => document.getElementById('anteSay').textContent)) + '" staked=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.stakeNow())));
    if (!(await tap('setupGo'))) { log('match ' + n + ': PLAY not tappable'); await shot('play-blocked-' + n); break; }
    await wait(600);
    await frames();
    if (n === 3) { await shot('statues-tray-3'); await statuesLeg(); await moveLeg(); }
    if (n === 4) { await wait(200); await shot('board-' + n); }
    const end = await playOut('match' + n, 60, 0);
    const sm = await state();
    log('match ' + n + ' ended "' + end + '": ' + (sm.match ? sm.match.shots + ' shots, pocketed ' + sm.match.pocketed.join('-') + ', techniques ' + sm.match.techniques.join(',') : ''));
    if (end === 'ceremony') { await wait(300); await shot('ceremony-' + n); }
    await page.waitForFunction(() => !document.querySelector('.ceremony'), { timeout: 15000 }).catch(() => log('ceremony did not end by itself'));
    await wait(400);
    await shot('end-' + n);
    log('match ' + n + ' card: ' + (await card()) + ' | inventory ' + (await page.evaluate(() => window.KEEPSIES_DEV.inventory())));
  }
  let s = await state();
  if (s.screen === 'ransom') { await shot('ransom-final'); await tap('rsLater'); await wait(400); }
  await tap('toTitle'); await wait(400);
  await shot('title-after');
  await tap('collect'); await wait(900);
  await shot('collection-later');
  log('collection later: wallet=' + JSON.stringify(await page.evaluate(() => window.KEEPSIES_DEV.wallet())) + ' progress=' + JSON.stringify(await page.evaluate(() => { const p = window.KEEPSIES_DEV.progress(); return { level: p.level, xp: p.xp, toNext: p.toNext }; })));
  await page.evaluate(() => document.getElementById('pouches').scrollIntoView({ block: 'center' }));
  await wait(300);
  await shot('pouches');
  const bought = await tap('pouch-standard', { scroll: true });
  await wait(600);
  log('pouch: ' + (bought ? 'bought. ' : 'not bought. ') + (await page.evaluate(() => window.KEEPSIES_DEV.pouchSay())));
  await shot('after-pouch');
  await tap('collBack'); await wait(300);
}

log('errors: ' + (errors.length ? '\n  ' + errors.join('\n  ') : 'none'));
if (fails.length) { log('STATUE CHECKS FAILED: ' + fails.length); process.exitCode = 1; }
else if (MODE === 'all' || MODE === 'more') log('STATUE CHECKS OK');
writeFileSync(join(OUT, 'log.txt'), lines.join('\n') + '\n');
await browser.close();
server.close();
