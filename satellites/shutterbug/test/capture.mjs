/* The capture gate (BUILD-PLAN.md T0.15, gate `capture`): a 900x1600 synthetic photo, painted here on a canvas in a
 * blank page (a bright ceiling bar, dark furniture blocks, a window rectangle) and saved as a PNG, fed through the
 * Choose a photo input with uploadFile:
 *   - the crop screen shows the overlay, and its solid count changes when a real touch drags the box;
 *   - Develop reaches the play screen through the reveal;
 *   - the record SB_DEV.level() exposes validates and, built in Node by harness.js --record-json, gives the page's
 *     exit and tabs;
 *   - SB_DEV.photoAlive() is false after the reveal;
 *   - no localStorage value holds data:image or is over 8 KB.
 * Watched red by OVERLAY_STALE and PHOTO_HELD. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep } from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), GAME = join(HERE, '..');
const R = reporter('CAPTURE');
const TMP = '/tmp/claude-1000/shutterbug-capture'; mkdirSync(TMP, { recursive: true });
const PHOTO = join(TMP, 'room-900x1600.png'), REC = join(TMP, 'record.json');
const srv = await serve();
const browser = await launch();

try {
  /* the photo: painted, then shot to a PNG at exactly 900x1600 */
  {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate(() => {
      const c = document.getElementById('c').getContext('2d');
      c.fillStyle = '#b8b2a6'; c.fillRect(0, 0, 900, 1600);               /* the wall */
      c.fillStyle = '#fbfbf2'; c.fillRect(250, 40, 400, 60);              /* the ceiling light */
      c.fillStyle = '#cfe4f4'; c.fillRect(560, 300, 220, 260);            /* the window */
      c.fillStyle = '#3a2a22';
      for (const [x, y, w, h] of [[60, 1250, 360, 220], [520, 1100, 300, 370], [80, 760, 220, 40], [420, 620, 260, 40], [120, 420, 240, 40], [560, 900, 200, 40]]) c.fillRect(x, y, w, h);
      c.fillStyle = '#1f1a1d'; c.fillRect(0, 1530, 900, 70);              /* the floor */
    });
    const el = await page.$('#c');
    await el.screenshot({ path: PHOTO });
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
  const box = await page.evaluate(() => { const r = document.getElementById('cropbox').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
  const f = await page.touchscreen.touchStart(box.x, box.y);
  for (let k = 1; k <= 8; k++) { await f.move(box.x, box.y + k * 12); await sleep(30); }
  await f.end();
  await sleep(200);
  const o2 = await page.evaluate(() => window.SB_DEV.overlay());
  R.say(o2.builds > o1.builds && o2.solids !== o1.solids, 'dragging the box rebuilds the overlay and its solid count changes (' + o1.solids + ' to ' + o2.solids + ', ' + o2.builds + ' builds)');
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
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
