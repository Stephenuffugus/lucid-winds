/* The make gate (BUILD-PLAN.md T0.5b): fixtures/make.html over the test server. Two synthetic photos are painted by the
 * test on a blank page and saved by page.screenshot as 600x1200 PNGs: a pure vertical gradient (H-cap-1: the canvas
 * path is within 2 per channel of the test's own area average), and the gradient with bright and dark rectangles (the
 * room the save flow writes). Each is fed through the plain chooser with uploadFile; Download JSON is pressed with a real
 * touch; the downloaded fixture validates in Node through the page's own record codec; MAKE_DEV.blocks() equals the
 * core loader's block list plus shell-capture; and the page asks the server for nothing but itself and ../index.html.
 * SB_SHOTS=<dir> also writes the t05b-make shots at 412x915 and 360x780 with both previews up (then LOOK at them).
 * Watched red by CAPTURE_BGR (H-cap-1: the canvas path reads its channels in the wrong order); MAKE_RE_DRIFT and
 * BITMAP_LEAK are the lint's. */
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { serve, launch, newPage, reporter, sleep, GAME } from './harness.mjs';
const require = createRequire(import.meta.url);
const { loadCoreFull, ORDER } = require('../tools/core-loader.js');
const { readPNG, downscaleRGB } = require('../tools/capture-oracle.js');

const R = reporter('MAKE');
const SHOTS = '/tmp/claude-1000/shutterbug-shots/t05b-gate', DL = join(SHOTS, 'downloads');
rmSync(SHOTS, { recursive: true, force: true }); mkdirSync(DL, { recursive: true });
const SB = loadCoreFull(process.env.SB_PAGE || join(GAME, 'index.html')).SB;

const srv = await serve();
const browser = await launch();
try {
  /* the two photos, painted here and shot at 600x1200, device pixel ratio 1 */
  const painter = await browser.newPage();
  await painter.setViewport({ width: 600, height: 1200, deviceScaleFactor: 1 });
  const paint = async (rects, path) => {
    await painter.setContent('<body style="margin:0"><canvas id="c" width="600" height="1200"></canvas></body>');
    await painter.evaluate(rects => {
      const cx = document.getElementById('c').getContext('2d'), g = cx.createLinearGradient(0, 0, 0, 1200);
      g.addColorStop(0, 'rgb(236, 226, 205)'); g.addColorStop(1, 'rgb(52, 46, 60)');
      cx.fillStyle = g; cx.fillRect(0, 0, 600, 1200);
      for (const [x, y, w, h, c] of rects) { cx.fillStyle = c; cx.fillRect(x, y, w, h); }
    }, rects);
    await painter.screenshot({ path, clip: { x: 0, y: 0, width: 600, height: 1200 } });
  };
  const GRAD = join(SHOTS, 'gradient-600x1200.png'), ROOM = join(SHOTS, 'room-600x1200.png');
  await paint([], GRAD);
  /* the room photo: the sample room itself, each cell a 25 px block of its palette colour, so the save round trips a
     climbable room through decode, crop, downscale and nearest */
  const sample = [];
  SB.SAMPLE_ROOM.forEach((row, y) => [...row].forEach((ch, x) => { const c = SB.palette.RGB[parseInt(ch, 16)]; sample.push([x * 25, y * 25, 25, 25, 'rgb(' + c.join(',') + ')']); }));
  await paint(sample, ROOM);
  await painter.close();

  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  const cdp = await page.createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL });
  const before = srv.requests.length;
  await page.goto(srv.base + '/satellites/shutterbug/fixtures/make.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.MAKE_DEV && window.MAKE_DEV.blocks().length > 0, { timeout: 30000 });
  const blocks = await page.evaluate(() => window.MAKE_DEV.blocks());
  R.say(JSON.stringify(blocks) === JSON.stringify(ORDER.concat(['shell-capture'])), 'make.html ran the core blocks in the loader\'s order, then shell-capture (' + blocks.join(' ') + ')');

  /* H-cap-1: the gradient through the canvas path against the test's own area average */
  const chooser = await page.$('#pick');
  await chooser.uploadFile(GRAD);
  await page.waitForFunction(() => window.MAKE_DEV.lastRGB() !== null, { timeout: 30000 });
  const rgb = Uint8Array.from(await page.evaluate(() => Array.from(window.MAKE_DEV.lastRGB())));
  const want = downscaleRGB(readPNG(GRAD), SB.GRID.W, SB.GRID.H);
  let worst = 0, at = -1;
  for (let i = 0; i < want.length; i++) { const d = Math.abs(want[i] - rgb[i]); if (d > worst) { worst = d; at = i; } }
  R.say(worst <= 2, 'H-cap-1: the canvas path on the gradient is within 2 per channel of the area average (worst ' + worst + (at >= 0 ? ' at cell ' + Math.floor(at / 3) : '') + ')');

  /* the save flow on the room photo: the next photo, a name, Download JSON by a real touch */
  await chooser.uploadFile(ROOM);
  const nx = await page.evaluate(() => { const el = document.getElementById('next'); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.touchscreen.tap(nx.x, nx.y);
  await page.waitForFunction(() => document.getElementById('name').value === 'room-600x1200', { timeout: 30000 });
  await sleep(300);
  const save = await page.evaluate(() => { const el = document.getElementById('save'); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; });
  R.say(save.w >= 48 && save.h >= 48, 'Download JSON measures ' + save.w.toFixed(0) + 'x' + save.h.toFixed(0) + ' (48 px or more)');
  await page.touchscreen.tap(save.x, save.y);
  let file = null;
  for (let k = 0; k < 50 && !file; k++) { const f = readdirSync(DL).filter(n => n.endsWith('.json')); if (f.length) file = join(DL, f[0]); else await sleep(100); }
  R.say(!!file && file.endsWith('room-600x1200.json'), 'the download is room-600x1200.json (' + (file || 'nothing') + ')');
  let saved = null, built = null;
  if (file) {
    const fx = JSON.parse(readFileSync(file, 'utf8'));
    let ok = true, why = '';
    try { SB.record.validate(fx.record); SB.record.fromJSON(fx.record); } catch (e) { ok = false; why = e.message; }
    R.say(ok, 'the downloaded record validates with the page\'s record codec in Node' + (why ? ' (' + why + ')' : ''));
    R.say(fx.v === 1 && fx.source === 'make.html' && fx.expect && Object.keys(fx.expect).length === 0 && fx.record.w === SB.GRID.W && fx.record.h === SB.GRID.H,
      'the fixture is the v1 form: source make.html, an empty expect, ' + fx.record.w + 'x' + fx.record.h);
    let same = 0;
    fx.record.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === SB.SAMPLE_ROOM[y][x]) same++; });
    R.say(same >= Math.round(0.95 * 24 * 48), 'the photo of the sample room round trips: ' + same + ' of 1152 cells keep their colour (95% or more)');
    saved = fx.record;
    const lv = SB.pipeline.build(SB.record.fromJSON(fx.record), {});
    R.say(!lv.needsCrop && lv.exit >= 0, 'the saved room builds in Node: ' + (lv.needsCrop ? 'needsCrop (' + lv.why + ')' : lv.solid.reduce((a, v) => a + v, 0) + ' solid cells, ' + lv.plat.reduce((a, v) => a + v, 0) + ' one way cells, the exit at ' + lv.exit));
    built = lv.needsCrop ? null : lv;
  }
  /* the overlay draws the saved record: each 24x48 cell's centre pixel is the cell's palette colour (this room needs a
     crop, so nothing is hatched over it); then the 36x64 preview opens on a real tap, painted */
  const over = await page.evaluate(() => {
    const o = document.getElementById('over'), cs = o.width / 24, d = o.getContext('2d').getImageData(0, 0, o.width, o.height).data, mid = [], off = [];
    const at = (x, y) => { const i = (y * o.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    for (let y = 0; y < 48; y++) for (let x = 0; x < 24; x++) { mid.push(at(x * cs + (cs >> 1), y * cs + (cs >> 1))); off.push(at(x * cs + 1, y * cs + 1)); }
    return { mid, off, rec: window.MAKE_DEV.lastRecord() };
  });
  let wrong = -1, why = '';
  for (let c = 0; c < 24 * 48 && wrong < 0 && built; c++) {
    const want = SB.palette.RGB[parseInt(over.rec.rows[Math.floor(c / 24)][c % 24], 16)];
    /* a solid cell is its colour under the overlay's rgba(13, 12, 16, 0.55), sampled off the hatch line */
    if (built.solid[c]) { const px = over.off[c], dim = want.map((v, k) => Math.round([13, 12, 16][k] * 0.55 + v * 0.45)); if (px.some((v, k) => Math.abs(v - dim[k]) > 1)) { wrong = c; why = 'a solid cell ' + px.join(',') + ', not its dimmed colour ' + dim.join(','); } }
    else if (over.mid[c].some((v, k) => v !== want[k])) { wrong = c; why = 'an open cell not its colour: ' + over.mid[c].join(','); }
  }
  R.say(!!built && wrong < 0, 'the 24x48 overlay draws the saved room as built: open cells in their palette colour, solid cells dimmed and hatched' + (wrong >= 0 ? ' (cell ' + wrong + ', ' + why + ')' : ''));
  /* what the eye gets: the overlay as the SCREEN shows it (a clip of the canvas's content box) holds every open cell's
     palette colour, so nothing on the page dims or covers the previews */
  const box = await page.evaluate(() => { const o = document.getElementById('over'); o.scrollIntoView({ block: 'center' }); const r = o.getBoundingClientRect(); return { x: r.left + o.clientLeft + window.scrollX, y: r.top + o.clientTop + window.scrollY, width: o.clientWidth, height: o.clientHeight }; });   /* a clip is in document coordinates */
  const clipFile = join(SHOTS, 'overlay-clip.png');
  await page.screenshot({ path: clipFile, clip: box });
  const clip = readPNG(clipFile), sx = clip.w / 24, sy = clip.h / 48;
  let dim = 0, firstDim = '';
  for (let c = 0; c < 24 * 48 && built; c++) {
    if (built.solid[c]) continue;
    const want = SB.palette.RGB[parseInt(over.rec.rows[Math.floor(c / 24)][c % 24], 16)];
    const i = (Math.floor((Math.floor(c / 24) + 0.5) * sy) * clip.w + Math.floor((c % 24 + 0.5) * sx)) * clip.bpp;
    const got = [clip.px[i], clip.px[i + 1], clip.px[i + 2]];
    if (got.some((v, k) => Math.abs(v - want[k]) > 3)) { dim++; if (!firstDim) firstDim = 'cell ' + c + ' shows ' + got.join(',') + ' for ' + want.join(','); }
  }
  R.say(!!built && dim === 0, 'on screen the overlay shows each open cell in its palette colour: nothing dims or covers it' + (dim ? ' (' + dim + ' cells off, ' + firstDim + ')' : ''));
  const fineBtn = await page.evaluate(() => { const el = document.getElementById('fine'); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.touchscreen.tap(fineBtn.x, fineBtn.y);
  await page.waitForFunction(() => !document.getElementById('finefig').classList.contains('hide'), { timeout: 5000 }).catch(() => {});
  await sleep(200);
  const fine = await page.evaluate(() => {
    const fig = document.getElementById('finefig'), o = document.getElementById('finev'), d = o.getContext('2d').getImageData(0, 0, o.width, o.height).data, seen = new Set();
    for (let i = 0; i < d.length; i += 4 * 7) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
    return { shown: getComputedStyle(fig).display !== 'none', w: o.width, h: o.height, colours: seen.size };
  });
  R.say(fine.shown && fine.w === 108 && fine.h === 192 && fine.colours >= 3, 'a real tap opens the 36x64 preview beside the room, painted (' + fine.w + 'x' + fine.h + ', ' + fine.colours + ' colours)');
  const asked = srv.requests.slice(before).map(u => u.split('?')[0]);
  const other = asked.filter(u => u !== '/satellites/shutterbug/fixtures/make.html' && u !== '/satellites/shutterbug/index.html');
  R.say(other.length === 0, 'the page asked the server for itself and ../index.html only' + (other.length ? ' (also: ' + other.join(', ') + ')' : ''));
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();

  if (process.env.SB_SHOTS) {
    mkdirSync(process.env.SB_SHOTS, { recursive: true });
    for (const [w, h] of [[412, 915], [360, 780]]) {
      const { page: p } = await newPage(browser, { width: w, height: h });
      await p.goto(srv.base + '/satellites/shutterbug/fixtures/make.html', { waitUntil: 'load' });
      await p.waitForFunction(() => window.MAKE_DEV && window.MAKE_DEV.blocks().length > 0, { timeout: 30000 });
      await (await p.$('#pick')).uploadFile(ROOM);
      await p.waitForFunction(() => window.MAKE_DEV.lastRecord() !== null, { timeout: 30000 });
      const f = await p.evaluate(() => { const el = document.getElementById('fine'); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await p.touchscreen.tap(f.x, f.y);
      await p.waitForFunction(() => !document.getElementById('finefig').classList.contains('hide'), { timeout: 5000 }).catch(() => {});
      await sleep(400);
      await p.evaluate(() => window.scrollTo(0, 0));
      const file = join(process.env.SB_SHOTS, 't05b-make-' + w + 'x' + h + '.png');
      await p.screenshot({ path: file, fullPage: true });
      console.log('  shot  ' + file);
      await p.close();
    }
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
