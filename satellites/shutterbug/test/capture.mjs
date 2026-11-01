/* The capture gate (BUILD-PLAN.md T0.15, gate `capture`): a 900x1600 synthetic photo, painted here on a canvas in a
 * blank page (a bright ceiling bar, dark furniture blocks, a window rectangle) and saved as a PNG, fed through the
 * Choose a photo input with uploadFile:
 *   - the crop screen shows the overlay, and its solid count changes when a real touch drags the box;
 *   - Develop reaches the play screen through the reveal;
 *   - the record SB_DEV.level() exposes validates and, built in Node by harness.js --record-json, gives the page's
 *     exit and tabs;
 *   - SB_DEV.photoAlive() is false after the reveal;
 *   - no localStorage value holds data:image or is over 8 KB.
 * The levels item (QUESTIONS Q180, Stephen's ruling 31 Oct, "Floor becomes the ledge"), on a fresh page with the dev
 * flag (?perf=1), the sample room painted with bands and two plain photos:
 *   - on 4 rows of Walnut it develops at the default box, the hero on the band's top (above row 46; a 2 row band
 *     blurs into the row above it in the canvas downscale and leaves row 46 open, measured 31 Oct);
 *   - on 26 rows of Walnut, under 26 rows of Slate, and an all black photo, each refusal shows its own message, the
 *     floor and ceiling bands marked on the overlay, the black photo's overlay shaded and never blank;
 *   - a refusal no fallback names (the checkerboard) keeps the one old message;
 *   - the dev readout under the box names the rule that refused (lv.detail).
 * The auto crop (QUESTIONS Q96 ruling 3, Q181) moved those messages behind Develop: a refusing box at rest shows no
 * message, and Develop searches for the nearest box that builds; the messages per cause are seen with ?seek=0 (the
 * search skipped, the refusal's message at once on Develop). Without flags:
 *   - 26 rows of Walnut at the default box: no message at rest; Develop (one real tap, no drag) searches, the box is
 *     drawn where the search chose, no message while it shows, and the room developed is the chosen box's record;
 *   - the all black photo: the seek marker loops while it searches, then the dark message, the box where the player
 *     left it; no animation frame spends more than SEEK.SLICE_MS on the search (the builds in a worker), and with
 *     ?seekworker=0 (the builds on the page's thread) the search still spreads over frames and no frame that ran
 *     more than one build passed the budget.
 * Watched red by OVERLAY_STALE and PHOTO_HELD, for the levels item by MESSAGE_SINGLE, BAND_UNMARKED,
 * OVERLAY_BLANK_REFUSED and DEV_READOUT_MS_ONLY, and for the auto crop by SEEK_OFF, SEEK_NO_BUDGET, SEEK_BOX_UNMOVED,
 * SEEK_MESSAGE_AT_REST and SEEK_MESSAGE_WITH_BOX. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, leaveRoom } from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), GAME = join(HERE, '..');
/* the photo is the sample room painted: its palette grid laid exactly over the default crop (the room is known to be
   climbable, so Develop has a level to reach), a wall colour in the margins the crop leaves */
const SBN = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCoreFull(join(GAME, 'index.html')).SB;
const ROOM = JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record.rows, HEX = Array.from(SBN.palette.HEX);
const R = reporter('CAPTURE');
const FIX = n => JSON.parse(readFileSync(join(GAME, 'fixtures', n), 'utf8')).record.rows;
const banded = (from, to, d) => ROOM.map((r, y) => (y >= from && y < to ? d.repeat(24) : r));
const TMP = '/tmp/claude-1000/shutterbug-capture'; mkdirSync(TMP, { recursive: true });
const PHOTO = join(TMP, 'room-900x1600.png'), REC = join(TMP, 'record.json');
const srv = await serve();
const browser = await launch();

try {
  /* the photo: painted, then shot to a PNG at exactly 900x1600 */
  {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate((rows, hex) => {
      const c = document.getElementById('c').getContext('2d'), cw = 800 / 24, ch = 1600 / 48;
      c.fillStyle = '#' + hex[4]; c.fillRect(0, 0, 900, 1600);
      rows.forEach((r, y) => [...r].forEach((d, x) => { c.fillStyle = '#' + hex[parseInt(d, 16)]; c.fillRect(Math.round(50 + x * cw), Math.round(y * ch), Math.ceil(cw), Math.ceil(ch)); }));
    }, ROOM, HEX);
    const el = await page.$('#c');
    await el.screenshot({ path: PHOTO });
    await page.close();
  }
  /* the levels item's photos, painted the same way: the grid exactly over the default crop */
  const LEVELS = [
    ['floor-ok', banded(44, 48, '7')], ['floor-tall', banded(22, 48, '7')], ['ceiling-tall', banded(0, 26, '2')],
    ['black', Array(48).fill('0'.repeat(24))], ['checker', FIX('synthetic/checkerboard.json')]];
  for (const [name, rows] of LEVELS) {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate((rows, hex) => {
      const c = document.getElementById('c').getContext('2d'), cw = 800 / 24, ch = 1600 / 48;
      c.fillStyle = '#' + hex[4]; c.fillRect(0, 0, 900, 1600);
      rows.forEach((r, y) => [...r].forEach((d, x) => { c.fillStyle = '#' + hex[parseInt(d, 16)]; c.fillRect(Math.round(50 + x * cw), Math.round(y * ch), Math.ceil(cw), Math.ceil(ch)); }));
    }, rows, HEX);
    await (await page.$('#c')).screenshot({ path: join(TMP, name + '.png') });
    await page.close();
  }
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, 'perf=1&seek=0');
    await ready(page, { reveal: true });
    const input = await page.$('#filechoose');
    const COPY = await page.evaluate(() => Object.assign({}, window.SB.ui.COPY));
    /* the photo at rest (the dev readout read here, before Develop writes its own), then, for a refusal, Develop with
       the search skipped: the message, the band and the dashed Develop */
    const shoot = async name => {
      const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
      await input.uploadFile(join(TMP, name + '.png'));
      await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
      const rest = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { shown: !document.getElementById('tighter').hidden, dev: document.getElementById('cropsay').textContent, stuck: document.getElementById('crop').classList.contains('stuck') }));
      if (!rest.needsCrop) return rest;
      await page.evaluate(() => document.getElementById('develop').click());
      await page.waitForFunction(() => !document.getElementById('tighter').hidden, { timeout: 5000 }).catch(() => {});
      return page.evaluate(dev => Object.assign(window.SB_DEV.overlay(), { shown: !document.getElementById('tighter').hidden, dev: dev, stuck: document.getElementById('crop').classList.contains('stuck') }), rest.dev);
    };
    const ok = await shoot('floor-ok');
    R.say(ok.needsCrop === false && ok.spawnRow >= 40 && ok.spawnRow < 46 && !ok.shown && !ok.stuck, 'levels: the sample room on 4 rows of Walnut develops at the default box, the hero on the band\'s top (needsCrop ' + ok.needsCrop + ', spawn row ' + ok.spawnRow + ', the message ' + (ok.shown ? 'shown' : 'hidden') + ')');
    const fl = await shoot('floor-tall');
    R.say(fl.needsCrop && fl.cause === 'floor' && fl.shown && fl.says === COPY.tighterFloor, 'levels: the floor refusal says "' + COPY.tighterFloor + '" (cause ' + fl.cause + ', shown ' + fl.shown + ', it says "' + fl.says + '")');
    R.say(fl.marked > 0 && fl.band && fl.marked === 48 - fl.band.floor && fl.drawn > 0, 'levels: the overlay marks the floor band, its ' + fl.marked + ' rows from row ' + (fl.band && fl.band.floor) + ' down (' + fl.drawn + ' cells shaded)');
    R.say(typeof fl.detail === 'string' && fl.detail.length > 0 && fl.dev.includes(fl.detail) && fl.dev.includes('floor'), 'levels: the dev readout names the rule that refused ("' + fl.dev + '")');
    const ce = await shoot('ceiling-tall');
    R.say(ce.needsCrop && ce.cause === 'ceiling' && ce.shown && ce.says === COPY.tighterCeiling && ce.marked > 0 && ce.band && ce.marked === ce.band.ceiling - 1, 'levels: the ceiling refusal says "' + COPY.tighterCeiling + '" and the overlay marks its band (cause ' + ce.cause + ', it says "' + ce.says + '", ' + ce.marked + ' rows marked, band ' + JSON.stringify(ce.band) + ')');
    const bk = await shoot('black');
    R.say(bk.needsCrop && bk.cause === 'dark' && bk.shown && bk.says === COPY.tighterDark, 'levels: the black photo\'s refusal says "' + COPY.tighterDark + '" (cause ' + bk.cause + ', it says "' + bk.says + '")');
    R.say(bk.drawn > 1000, 'levels: the black photo\'s overlay shades its grid, never a blank box (' + bk.drawn + ' cells shaded of ' + bk.solids + ' solid)');
    const cb = await shoot('checker');
    R.say(cb.needsCrop && cb.cause === null && cb.shown && cb.says === COPY.tighter, 'levels: a refusal no fallback names keeps the one old message (the checkerboard: cause ' + cb.cause + ', it says "' + cb.says + '")');
    R.say(errors.length === 0, 'levels: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* AUTOCROP (Q181): the player's page, no flags. 26 rows of Walnut refuse at the default box; Develop finds a box */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const input = await page.$('#filechoose'), SEEK = await page.evaluate(() => Object.assign({}, window.SB.capture.SEEK));
    const load = async name => {
      const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
      await input.uploadFile(join(TMP, name + '.png'));
      await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
      return page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { stuck: document.getElementById('crop').classList.contains('stuck') }));
    };
    const rest = await load('floor-tall');
    R.say(rest.needsCrop === true && !rest.shown && !rest.stuck, 'autocrop: 26 rows of Walnut refuse at the default box and say nothing at rest, Develop live (needsCrop ' + rest.needsCrop + ', the message ' + (rest.shown ? 'shown: "' + rest.says + '"' : 'hidden') + ', Develop ' + (rest.stuck ? 'dashed' : 'live') + ')');
    await tap(page, '#develop');
    await page.waitForFunction(() => { const s = window.SB_DEV.overlay().seek; return s && s.phase !== 'seek'; }, { timeout: 20000 }).catch(() => {});
    const show = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { screen: window.SB_DEV.screen() }));
    const sk = show.seek || {}, ch = sk.chosen, dr = sk.drawn || {};
    const at = ch ? { left: sk.ox + ch.x * sk.k, top: sk.oy + ch.y * sk.k, width: ch.w * sk.k } : null;
    const near = (a, b) => Math.abs(a - b) <= 1;
    R.say(sk.phase === 'show' && ch && JSON.stringify(ch) !== JSON.stringify(sk.from) && sk.builds >= 1 && show.screen === 'crop' && JSON.stringify(show.crop) === JSON.stringify(ch),
      'autocrop: one tap on Develop, no drag, and the search finds a box that builds (' + (sk.builds || 0) + ' builds, ' + (sk.mode || 'no') + ' mode, ' + Math.round(sk.ms || 0) + ' ms, the box ' + JSON.stringify(sk.from) + ' to ' + JSON.stringify(ch) + ', phase ' + sk.phase + ')');
    R.say(at && near(dr.left, at.left) && near(dr.top, at.top) && near(dr.width, at.width), 'autocrop: the box is drawn where the search chose it (drawn ' + JSON.stringify(dr) + ', the chosen box on screen ' + JSON.stringify(at) + ')');
    R.say(sk.phase === 'show' && !show.shown && !show.stuck && show.needsCrop === false, 'autocrop: no message while the chosen box shows (the message ' + (show.shown ? 'shown: "' + show.says + '"' : 'hidden') + ', needsCrop ' + show.needsCrop + ')');
    await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 }).catch(() => {});
    const dev = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), code: window.SB_DEV.level() && window.SB_DEV.level().code, chosen: window.SB.ui.seekInfo().code }));
    R.say(dev.screen === 'play' && dev.code && dev.code === dev.chosen, 'autocrop: it develops by itself, the room the chosen box\'s record (screen ' + dev.screen + ', the room\'s code ' + (dev.code === dev.chosen ? 'is' : 'is not') + ' the chosen box\'s)');
    await leaveRoom(page);
    await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
    /* the black photo: nothing in it builds */
    const bk0 = await load('black');
    await tap(page, '#develop');
    const mk = await page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(() => r(Object.assign(window.SB_DEV.overlay().seek || {}, { seeking: window.SB_DEV.overlay().seeking })), 120))));
    await page.waitForFunction(() => { const s = window.SB_DEV.overlay().seek; return s && s.phase !== 'seek'; }, { timeout: 30000 }).catch(() => {});
    const bk = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { stuck: document.getElementById('crop').classList.contains('stuck'), copy: Object.assign({}, window.SB.ui.COPY) }));
    const bs = bk.seek || {};
    R.say(mk.seeking && mk.marker && mk.frames >= 1, 'autocrop: the seek marker shows while the search runs (searching ' + mk.seeking + ', the marker ' + (mk.marker ? 'shown' : 'hidden') + ', ' + (mk.frames || 0) + ' frames drawn)');
    R.say(bs.phase === 'none' && bs.builds >= 1 && bk.shown && bk.says === bk.copy.tighterDark && bk.stuck && !bs.marker && JSON.stringify(bk.crop) === JSON.stringify(bk0.crop),
      'autocrop: a photo nothing builds ends on its message, the box where the player left it (phase ' + bs.phase + ', ' + bs.builds + ' builds of ' + bs.candidates + ' boxes, it says "' + bk.says + '", the box ' + JSON.stringify(bk.crop) + ')');
    R.say(bs.slices >= 2 && bs.sliceMax <= SEEK.SLICE_MS, 'autocrop: the search spreads over ' + bs.slices + ' frames and none spends more than ' + SEEK.SLICE_MS + ' ms on it (the longest ' + (bs.sliceMax || 0).toFixed(1) + ' ms, ' + bs.mode + ' mode)');
    R.say(errors.length === 0, 'autocrop: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* AUTOCROP: the builds on the page's own thread (no worker): still spread over frames under the budget */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, 'seekworker=0');
    await ready(page, { reveal: true });
    const SLICE = await page.evaluate(() => window.SB.capture.SEEK.SLICE_MS);
    const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await page.$('#filechoose')).uploadFile(join(TMP, 'black.png'));
    await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
    await tap(page, '#develop');
    await page.waitForFunction(() => { const s = window.SB_DEV.overlay().seek; return s && s.phase !== 'seek'; }, { timeout: 60000 }).catch(() => {});
    const ms = await page.evaluate(() => window.SB_DEV.overlay().seek || {});
    R.say(ms.mode === 'main' && ms.phase === 'none' && ms.slices >= 2 && ms.multiOver === 0, 'autocrop: without a worker the builds spread over ' + ms.slices + ' frames and no frame that ran more than one build passed ' + SLICE + ' ms (' + ms.multiOver + ' did; the longest ' + (ms.sliceMax || 0).toFixed(1) + ' ms, ' + ms.builds + ' builds, ' + ms.mode + ' mode)');
    R.say(errors.length === 0, 'autocrop: zero page errors without a worker' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* LEVELSR: the dev readout is the dev flag's alone; a player's crop screen never shows the rule that refused */
  {
    const { page } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await page.$('#filechoose')).uploadFile(join(TMP, 'floor-tall.png'));
    await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
    const np = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { dev: document.getElementById('cropsay').textContent, shown: !document.getElementById('tighter').hidden }));
    R.say(np.needsCrop && np.dev === '', 'levels: without the dev flag the crop screen shows no readout (needsCrop ' + np.needsCrop + ', the readout "' + np.dev + '")');
    await page.close();
  }
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page, { reveal: true });
  const input = await page.$('#filechoose');
  await input.uploadFile(PHOTO);
  await page.waitForFunction(() => window.SB_DEV.screen() === 'crop' && window.SB_DEV.overlay().builds > 0, { timeout: 10000 }).catch(() => {});
  const o1 = await page.evaluate(() => window.SB_DEV.overlay());
  R.say(o1 && o1.builds > 0 && o1.solids > 0, 'the crop screen shows the pipeline\'s overlay (' + (o1 ? o1.builds + ' builds, ' + o1.solids + ' solid cells' : 'none') + ')');
  /* a real touch drags the box down: the overlay rebuilds and its solid count changes */
  /* the default crop spans the photo's height, so a real touch drags the box sideways */
  const box = await page.evaluate(() => { const r = document.getElementById('cropbox').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
  const f = await page.touchscreen.touchStart(box.x, box.y);
  for (let k = 1; k <= 8; k++) { await f.move(box.x - k * 6, box.y); await sleep(30); }
  await sleep(150);
  /* read while the finger is still down: the overlay follows the box as it moves, not only when it rests */
  const o2 = await page.evaluate(() => window.SB_DEV.overlay());
  await f.end();
  await sleep(200);
  R.say(o2.builds > o1.builds && o2.solids !== o1.solids && o2.full === false, 'dragging the box rebuilds the overlay as it moves, before the finger lifts, and its solid count changes (' + o1.solids + ' to ' + o2.solids + ', ' + o2.builds + ' builds, the box at x ' + o2.crop.x + ')');
  /* the same photo chosen again: the default crop, the room as painted. The wait is on the decode landing (the drag's
     own last rebuild satisfied a wait on builds, and Develop then raced the decode: 3 runs in 6 failed on 30 Oct) */
  const d0 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  await input.uploadFile(PHOTO);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d0).catch(() => {});
  await tap(page, '#develop');
  await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 8000 }).catch(() => {});
  const lv = await page.evaluate(() => ({ s: window.SB_DEV.screen(), l: window.SB_DEV.level(), alive: window.SB_DEV.photoAlive(), tabs: window.SB_DEV.tabs() }));
  R.say(lv.s === 'play', 'Develop reaches the play screen through the reveal (' + lv.s + ')');
  R.say(lv.alive === false, 'the photo is released when the reveal ends (photoAlive ' + lv.alive + ')');
  writeFileSync(REC, JSON.stringify({ code: lv.l.code }));
  let node = null;
  try { node = JSON.parse(execFileSync('node', [join(GAME, 'harness.js'), '--record-json', REC], { encoding: 'utf8' }).trim().split('\n').pop()); } catch (e) { node = { error: String(e.message).slice(0, 200) }; }
  R.say(node && node.valid === true && node.exit === lv.l.exit && node.tabs === lv.tabs, 'the record validates and, built in Node, gives the page\'s exit and tabs (Node ' + JSON.stringify(node) + ', page exit ' + lv.l.exit + ' tabs ' + lv.tabs + ')');
  const store = await page.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; out.push([k, v.length, v.includes('data:image')]); } return out; });
  R.say(store.every(([, n, img]) => n <= 8192 && !img), 'no localStorage value holds an image or is over 8 KB (' + (store.map(([k, n]) => k + ' ' + n).join(', ') || 'none stored') + ')');
  /* the race itself, forced: a retake whose decode lands after Develop is dropped, never pulling the player back to the
     crop nor releasing the photo the reveal shows (the room left by Pause and its card's Title: QUESTIONS Q94) */
  await leaveRoom(page);
  await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
  const d1 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  await input.uploadFile(PHOTO);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d1).catch(() => {});
  await page.evaluate(() => { const dec = window.SB.capture.decode; window.SB.capture.decode = f => new Promise(r => setTimeout(r, 600)).then(() => dec(f)); });
  await input.uploadFile(PHOTO);
  await tap(page, '#develop');
  const raced = await page.evaluate(() => new Promise(r => setTimeout(() => r({ s: window.SB_DEV.screen(), alive: window.SB_DEV.photoAlive(), decodes: window.SB_DEV.overlay().decodes }), 1200)));
  R.say(raced.s !== 'crop' && raced.s !== 'title' && raced.decodes === d1 + 1, 'a retake decoding past Develop is dropped: the screen stays ' + raced.s + ' (not the crop), the late decode not shown (' + (raced.decodes - d1) + ' landed)');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
