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
 * Watched red by OVERLAY_STALE and PHOTO_HELD, and for the levels item by MESSAGE_SINGLE, BAND_UNMARKED,
 * OVERLAY_BLANK_REFUSED and DEV_READOUT_MS_ONLY. */
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
    await gotoGame(page, srv.base, 'perf=1');
    await ready(page, { reveal: true });
    const input = await page.$('#filechoose');
    const COPY = await page.evaluate(() => Object.assign({}, window.SB.ui.COPY));
    const shoot = async name => {
      const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
      await input.uploadFile(join(TMP, name + '.png'));
      await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
      return page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { shown: !document.getElementById('tighter').hidden, dev: document.getElementById('cropsay').textContent, stuck: document.getElementById('crop').classList.contains('stuck') }));
    };
    const ok = await shoot('floor-ok');
    R.say(ok.needsCrop === false && ok.spawnRow >= 40 && ok.spawnRow < 46 && !ok.shown && !ok.stuck, 'levels: the sample room on 4 rows of Walnut develops at the default box, the hero on the band\'s top (needsCrop ' + ok.needsCrop + ', spawn row ' + ok.spawnRow + ', the message ' + (ok.shown ? 'shown' : 'hidden') + ')');
    const fl = await shoot('floor-tall');
    R.say(fl.needsCrop && fl.cause === 'floor' && fl.shown && fl.says === COPY.tighterFloor, 'levels: the floor refusal says "' + COPY.tighterFloor + '" (cause ' + fl.cause + ', shown ' + fl.shown + ', it says "' + fl.says + '")');
    R.say(fl.marked > 0 && fl.band && fl.marked === 48 - fl.band.floor && fl.solids > 0, 'levels: the overlay marks the floor band, its ' + fl.marked + ' rows from row ' + (fl.band && fl.band.floor) + ' down (' + fl.solids + ' solid cells drawn)');
    R.say(typeof fl.detail === 'string' && fl.detail.length > 0 && fl.dev.includes(fl.detail) && fl.dev.includes('floor'), 'levels: the dev readout names the rule that refused ("' + fl.dev + '")');
    const ce = await shoot('ceiling-tall');
    R.say(ce.needsCrop && ce.cause === 'ceiling' && ce.shown && ce.says === COPY.tighterCeiling && ce.marked > 0 && ce.band && ce.marked === ce.band.ceiling - 1, 'levels: the ceiling refusal says "' + COPY.tighterCeiling + '" and the overlay marks its band (cause ' + ce.cause + ', it says "' + ce.says + '", ' + ce.marked + ' rows marked, band ' + JSON.stringify(ce.band) + ')');
    const bk = await shoot('black');
    R.say(bk.needsCrop && bk.cause === 'dark' && bk.shown && bk.says === COPY.tighterDark, 'levels: the black photo\'s refusal says "' + COPY.tighterDark + '" (cause ' + bk.cause + ', it says "' + bk.says + '")');
    R.say(bk.solids > 1000, 'levels: the black photo\'s overlay shades its grid, never a blank box (' + bk.solids + ' solid cells drawn)');
    const cb = await shoot('checker');
    R.say(cb.needsCrop && cb.cause === null && cb.shown && cb.says === COPY.tighter, 'levels: a refusal no fallback names keeps the one old message (the checkerboard: cause ' + cb.cause + ', it says "' + cb.says + '")');
    R.say(errors.length === 0, 'levels: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
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
