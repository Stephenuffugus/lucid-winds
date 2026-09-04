/**
 * THE FRONT DOOR. Play Keepsies the way a thumb does, at 375 x 667.
 *
 *   node tools/frontdoor.mjs [outdir] [mode] [ringFt] [noaim]
 *     mode: first (the four minutes) | more (five matches, onboarding skipped) | all
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
  headless: 'new', protocolTimeout: 240000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
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
    if (RING) { for (let k = 0; k < 3; k++) { if ((await page.evaluate(() => window.KEEPSIES_DEV.houseRules().ringSizeFt)) === RING) break; await tap('hr-ringSizeFt'); await wait(150); } }
    else if (n === 4) { await tap('hr-ringSizeFt'); await wait(200); }
    if (n === 6 && !RING) { await tap('hr-bombing'); await wait(200); }
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
writeFileSync(join(OUT, 'log.txt'), lines.join('\n') + '\n');
await browser.close();
server.close();
