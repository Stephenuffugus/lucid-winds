/* THE MOONWALK GATE (2026-09-18). Mikothy Jackson is the one character that hops BACKWARDS, and the day he was
   made was also the day the ORIGINAL Jimothy was found hopping backwards by accident (his two sideways paintings
   were in each other's slots). So this gate holds both halves of the same law, in the RUNNING game:

     1. Nobody else moonwalks: Jimothy is shown run-r on a right hop and run-l on a left hop, and those files FACE
        the way they are named (measured: the tail mass sits behind him).
     2. Mikothy is shown the file that faces AWAY from where he is going, on both sides.
     3. Every Mikothy frame exists, and his run files obey the file rule too (run-r faces right).
     4. He is found by hopping backwards MOONWALK_HOPS times, not one hop sooner, and forward hops never count.

   node test/moonwalk-check.mjs            the working tree
   node test/moonwalk-check.mjs --plant    serves today's game with ONLY `moonwalk:1` taken off Mikothy: checks 5 and 6 MUST FAIL.
                                           A gate you have not watched fail is decoration.
   Shots of the real frames mid hop land in /tmp/moonwalk-*.png. OPEN THEM. */
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
const require = createRequire('/workspaces/lucid-winds/package.json'); const puppeteer = require('puppeteer');
const PLANT = process.argv.includes('--plant'), PORT = 8974;
import { readFileSync } from 'node:fs';
const HERE = new URL('..', import.meta.url).pathname;
const src = readFileSync(HERE + 'index.html', 'utf8');
if (PLANT && !src.includes("secret:1, moonwalk:1,")) { console.log('the plant cannot find the moonwalk flag to remove'); process.exit(2); }
const PLANTED = PLANT ? src.replace("secret:1, moonwalk:1,", 'secret:1,') : null;
await serve(PORT, (p) => (PLANT && /stream-hop\/index\.html$/.test(p)) ? { body: PLANTED, headers: { 'Content-Type': 'text/html; charset=utf-8' } } : null);
let pass = 0, fail = 0; const ok = (c, m, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}${d ? '  [' + d + ']' : ''}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
let pg = await browser.newPage(); await pg.setViewport({ width: 412, height: 915, deviceScaleFactor: 3 });
const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/index.html?shtest=1`, { waitUntil: 'load', timeout: 60000 }); await wait(2500);
const has = await pg.evaluate(() => !!(window.SH_DEV && SH_DEV.wear && SH_DEV.pose && SH_DEV.backHops));   // ⛔ pose() already existed in the hook: a second `pose:` key was silently overridden
ok(has, 'the test hook can wear a character and read the pose and the backwards counter');
if (has) {
  const begin = async (id) => { await pg.evaluate((id) => { SH_DEV.show('s-play'); SH_DEV.start('endless'); SH_DEV.wear(id); }, id); await wait(1300);
    await pg.evaluate(() => { ['reward-later', 'sws-music-later'].forEach((i) => { const b = document.getElementById(i); if (b && b.offsetParent) b.click(); }); }); await wait(1800); };
  const poseDuring = async (dir, shot) => { await pg.evaluate((d) => SH_DEV.hop(d), dir); await wait(60); const p = await pg.evaluate(() => SH_DEV.state().hop ? SH_DEV.pose().pose : 'NO HOP');
    if (shot) await pg.screenshot({ path: shot, clip: { x: 40, y: 290, width: 330, height: 170 } }); await wait(650); return p; };
  // which way does a FILE face? a raccoon's ringed tail trails behind him: the side with more paint in the lower back half
  const faces = (path) => pg.evaluate(async (path) => { const im = new Image(); im.src = path + '?t=' + Math.random(); await im.decode(); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let l = 0, r = 0, top = 0, tl = 0, tr = 0;
    for (let yy = 0; yy < c.height; yy++) for (let xx = 0; xx < c.width; xx++) { const a = d[(yy * c.width + xx) * 4 + 3] > 40; if (!a) continue; if (yy < c.height * 0.45) { if (xx < c.width / 2) tl++; else tr++; } }
    return { headSide: tl > tr ? 'left' : 'right', tl, tr }; }, path);

  await begin('jimothy');
  const jr = await poseDuring('right', '/tmp/moonwalk-jimothy-right.png'), jl = await poseDuring('left', '/tmp/moonwalk-jimothy-left.png');
  ok(jr === 'hero/run-r' && jl === 'hero/run-l', 'Jimothy does NOT moonwalk: run-r on a right hop, run-l on a left hop', `${jr} / ${jl}`);
  const hr = await faces('assets/hero/run-r.png'), hl = await faces('assets/hero/run-l.png');
  ok(hr.headSide === 'right' && hl.headSide === 'left', 'the original Jimothy\'s files face the way they are named (his head is on the side he runs toward)', `run-r head ${hr.headSide}, run-l head ${hl.headSide}`);

  await begin('mikothy');
  const worn = await pg.evaluate(() => SH_DEV.state().chr && SH_DEV.state().chr.id);
  ok(worn === 'mikothy', 'Mikothy Jackson is in the roster and can be worn', String(worn));
  const mr = await poseDuring('right', '/tmp/moonwalk-mikothy-right.png'), ml = await poseDuring('left', '/tmp/moonwalk-mikothy-left.png');
  ok(mr === 'skins/mikothy/run-l', 'Mikothy hopping RIGHT is shown the file that faces LEFT (he slides backwards)', mr);
  ok(ml === 'skins/mikothy/run-r', 'Mikothy hopping LEFT is shown the file that faces RIGHT', ml);
  const mfr = await faces('assets/skins/mikothy/run-r.png').catch(() => null), mfl = await faces('assets/skins/mikothy/run-l.png').catch(() => null);
  ok(mfr && mfl && mfr.headSide === 'right' && mfl.headSide === 'left', 'his files still obey the file rule: run-r FACES right, run-l faces left (the moonwalk is a choice of file, never a flip)', mfr && mfl ? `run-r head ${mfr.headSide}, run-l head ${mfl.headSide}` : 'files missing');
  const missing = []; for (const f of ['idle', 'crouch', 'leap', 'land', 'run-l', 'run-r', 'dash-run', 'flee', 'coffee', 'magnet', 'umbrella', 'shield', 'scared', 'sit', 'eat', 'cheer', 'dizzy', 'splash', 'ko']) {
    const st = await pg.evaluate((u) => fetch(u).then((r) => r.status), `assets/skins/mikothy/${f}.png`); if (st !== 200) missing.push(f); }
  ok(missing.length === 0, 'all 19 of his frames are on disk', missing.join(', '));

  // found by hopping BACKWARDS, and only backwards. Fresh profile, plain Jimothy, never granted.
  await pg.close();
  const ctx = await (browser.createBrowserContext ? browser.createBrowserContext() : browser.createIncognitoBrowserContext());   // ⛔ NOT localStorage.clear(): the game saves PROG on its way out and puts the grant back
  pg = await ctx.newPage(); await pg.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 }); pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/index.html?shtest=1`, { waitUntil: 'load', timeout: 60000 }); await wait(2500);
  await pg.evaluate(() => { SH_DEV.show('s-play'); SH_DEV.start('endless'); }); await wait(1300);
  await pg.evaluate(() => { ['reward-later', 'sws-music-later'].forEach((i) => { const b = document.getElementById(i); if (b && b.offsetParent) b.click(); }); }); await wait(1800);
  const need = await pg.evaluate(() => (typeof MOONWALK_HOPS === 'number' ? MOONWALK_HOPS : 50));
  const hopWait = async (d) => { await pg.evaluate((d) => SH_DEV.hop(d), d); for (let i = 0; i < 40; i++) { await wait(25); if (!(await pg.evaluate(() => !!SH_DEV.state().hop))) break; } await wait(30); };
  let alive = true;
  for (let i = 0; i < 12 && alive; i++) { await hopWait('left'); await hopWait('right'); alive = await pg.evaluate(() => SH_DEV.state().phase === 'play'); }
  ok(!(await pg.evaluate(() => SH_DEV.owned('mikothy'))), 'a fresh player does not own him');
  ok((await pg.evaluate(() => SH_DEV.backHops())) === 0, 'sideways hops never count as backwards', 'backHops ' + (await pg.evaluate(() => SH_DEV.backHops())));
  // up one row then back one row: the two start rows are safe ground
  const rows = await pg.evaluate(() => [0, 1, 2].map((r) => SH_DEV.lane(r).type)); let done = 0, ownedEarly = false;
  for (let i = 0; i < need + 5 && done < need; i++) {
    await hopWait('up'); await hopWait('down'); done = await pg.evaluate(() => SH_DEV.backHops());
    if (done === need - 1) ownedEarly = await pg.evaluate(() => SH_DEV.owned('mikothy'));
    if (await pg.evaluate(() => SH_DEV.state().phase !== 'play')) { await pg.evaluate(() => { SH_DEV.start('endless'); }); await wait(3200); }
  }
  ok(done >= need, `${need} real backwards hops were made (start rows: ${rows.join(', ')})`, 'backHops ' + done);
  ok(!ownedEarly, `he is NOT found at ${need - 1}`);
  ok(await pg.evaluate(() => SH_DEV.owned('mikothy')), `he IS found at ${need}`);
}
ok(errs.length === 0, 'no page errors', errs.slice(0, 2).join(' | '));
await browser.close();
console.log(`\n${fail ? 'FAILED' : 'OK'}  ${pass} passed, ${fail} failed${PLANT ? '   (PLANT RUN: a failure here is the point)' : ''}`);
process.exit(fail ? 1 : 0);
