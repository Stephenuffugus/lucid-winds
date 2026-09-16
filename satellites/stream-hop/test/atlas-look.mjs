/* G4, THE LOOK: the atlas must be invisible. Two things, same page, same seed:
   1. a canvas hash of a frozen, seeded Adventure frame (rAF stubbed, Date and Math.random fixed, the game
      stepped by its own SH_DEV hooks), once with assets/atlas/map.js BLOCKED (the old per file path) and
      once with the atlas. The law: the two hashes are equal, and neither frame is blank.
   2. four shots at 412 x 915 for a person to OPEN: title, a run with a power, the help screen, the costume
      shelf. Written to plans/jimothy/shots/<label>-<name>.jpg. A green hash is not a look.
   Usage (from satellites/stream-hop):  node test/atlas-look.mjs <label> [--no-shots]
   The label names the shots (before, after). Exit 1 when the hashes differ or a frame is blank. */
import puppeteer from 'puppeteer';
import { createHash } from 'crypto';
import { statSync } from 'fs';
import { join } from 'path';
import { serve, ROOT } from './serve.mjs';
const label = process.argv[2] || 'after';
const SHOTS = !process.argv.includes('--no-shots');
const PORT = 8971, URL0 = `http://127.0.0.1:${PORT}/satellites/stream-hop/?shtest=1`;
let blockMap = false;
const srv = await serve(PORT, p => (blockMap && p === '/satellites/stream-hop/assets/atlas/map.js') ? { status: 404, body: '' } : null);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const fails = [];
const settle = pg => pg.waitForFunction(() => { if (!window.SH_DEV || !SH_DEV.art) return false;
  var a = SH_DEV.art(); return a.n > 0 && a.pending === 0; }, { timeout: 120000, polling: 250 });

async function frozenHash(block) {
  blockMap = block;
  const ctx = await b.createBrowserContext();
  const pg = await ctx.newPage(); await pg.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await pg.evaluateOnNewDocument(() => {
    var s = 0x2f6b1d; Math.random = function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    Date.now = function () { return 1789560000000; }; performance.now = function () { return 1000; };
    window.requestAnimationFrame = function () { return 0; };
  });
  await pg.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await pg.evaluate(() => document.fonts.ready);
  await settle(pg);
  const atlasOn = await pg.evaluate(() => !!window.JIMOTHY_ATLAS);
  await pg.evaluate(() => { var D = SH_DEV; D.start('adventure', 1); D.spawnPow('coffee');
    for (var i = 0; i < 4; i++) D.hopFwd(); D.spawnCoin(); for (var j = 0; j < 90; j++) D.step(0.016); });
  await settle(pg);                     // anything the run asked for (a later sheet, a pose) is in before the frame
  const out = await pg.evaluate(() => { SH_DEV.render(); var c = document.getElementById('game');
    var d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, ink = 0;
    for (var i = 3; i < d.length; i += 4) if (d[i]) ink++;
    var a = SH_DEV.art();
    return { url: c.toDataURL('image/png'), w: c.width, h: c.height, ink: ink, ready: a.ready, n: a.n }; });
  await ctx.close();
  return { atlasOn, hash: createHash('sha1').update(out.url).digest('hex'), w: out.w, h: out.h, ink: out.ink, ready: out.ready, n: out.n };
}

async function shots() {
  blockMap = false;
  const ctx = await b.createBrowserContext();
  const pg = await ctx.newPage(); await pg.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await pg.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await settle(pg);
  const shot = async name => { const f = join(ROOT, 'plans/jimothy/shots', `${label}-${name}.jpg`);
    await new Promise(r => setTimeout(r, 900)); await pg.screenshot({ path: f, type: 'jpeg', quality: 72 });
    const kb = Math.round(statSync(f).size / 1024); console.log(`  shot ${label}-${name}.jpg ${kb} KB`);
    if (kb >= 200) fails.push(`${name} shot is ${kb} KB, the law is under 200`); };
  /* a real tap on the element's centre, and only after proving that centre belongs to it (an overlay swallowed
     the first version's tap on the Prize Bin and the "skins" shot was the title) */
  const tapId = async (id, optional) => {
    const at = await pg.evaluate(id => { var e = document.getElementById(id); if (!e) return null; var r = e.getBoundingClientRect();
      if (!r.width) return null; var x = r.x + r.width / 2, y = r.y + r.height / 2, hit = document.elementFromPoint(x, y);
      return { x: x, y: y, mine: !!hit && (hit === e || e.contains(hit)), hit: hit ? (hit.id || hit.className || hit.tagName) : null }; }, id);
    if (!at) { if (!optional) fails.push(`#${id} is not on screen`); return false; }
    if (!at.mine) { fails.push(`#${id}'s centre belongs to ${at.hit}, so a tap there presses something else`); return false; }
    await pg.touchscreen.tap(at.x, at.y); await new Promise(r => setTimeout(r, 700)); return true; };
  await new Promise(r => setTimeout(r, 1500));
  await tapId('sws-music-later', true);          // a fresh visitor gets the song card and the daily reward at once
  const toTitle = async () => { await pg.evaluate(() => SH_DEV.show('s-title'));   // showing the title offers the daily reward again
    await new Promise(r => setTimeout(r, 900)); await tapId('reward-later', true); };
  await toTitle(); await shot('title');
  await pg.evaluate(() => SH_DEV.show('s-how')); await settle(pg); await shot('how');
  await toTitle();
  await tapId('b-skins'); await settle(pg);
  const onShelf = await pg.evaluate(() => { var e = document.getElementById('s-skins'); return !!e && e.classList.contains('on'); });
  if (!onShelf) fails.push('the Prize Bin tap did not open the costume shelf');
  await shot('skins');
  await pg.evaluate(() => { SH_DEV.start('adventure', 1); SH_DEV.spawnPow('coffee'); });
  await new Promise(r => setTimeout(r, 1500));
  await pg.evaluate(() => { SH_DEV.hopFwd(); SH_DEV.hopFwd(); SH_DEV.spawnPow('umbrella'); });
  await settle(pg); await shot('run');
  await ctx.close();
}

const off = await frozenHash(true);
const on = await frozenHash(false);
console.log('  map blocked:', JSON.stringify(off));
console.log('  atlas on:   ', JSON.stringify(on));
if (off.atlasOn) fails.push('the blocked run still had an atlas, so the comparison compares nothing');
if (off.hash !== on.hash) fails.push(`canvas differs with the atlas: ${off.hash} vs ${on.hash}`);
for (const r of [off, on]) { if (r.ink < r.w * r.h * 0.5) fails.push(`a frame is mostly blank (${r.ink} of ${r.w * r.h} pixels inked)`);
  if (r.ready < r.n) fails.push(`${r.n - r.ready} of ${r.n} images never loaded before the frame`); }
if (SHOTS) await shots();
await b.close(); srv.close();
if (fails.length) { console.log('ATLAS LOOK FAILED\n  ' + fails.join('\n  ')); process.exit(1); }
console.log(`ATLAS LOOK OK (${label}): the frame is identical with and without the atlas${on.atlasOn ? '' : ' (NOTE: this page has no atlas yet, so both runs used the per file path)'}`);
