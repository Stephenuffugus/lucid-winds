/* G5, THE WORST ANGLE (Lane D). The atlas exists because the edge answered a burst with 429. So:
   A. menu-0 and play-1 answer 429 (empty body) twice, then 200. Law: every boot frame and every image tag
      arrives anyway, through the retry ladder, within 30 s.
   B. menu-0 answers 429 for ever (the ladder shortened in memory to 50 ms steps so the gate is quick).
      Law: nothing hangs, every menu frame arrives from ITS OWN FILE once the ladder gives up on the sheet
      (a missing or broken sheet must never cost the art), the game's play sheets are untouched, and every
      image tag in the menu sheet shows its file. (Watched red Sep 16 on the first build, where a dead sheet
      left 0 of 30 menu frames and handed the canvas art to the procedural fallback.)
   Usage (from satellites/stream-hop):  node test/atlas-lockout.mjs [--plant]
   --plant turns the ladder off in memory (as test/sw-lockout.mjs does), and case A must go red. */
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { serve, ROOT } from './serve.mjs';
const PLANT = process.argv.includes('--plant');
const PORT = 8977;
const page0 = readFileSync(join(ROOT, 'satellites/stream-hop/index.html'), 'utf8');
const LADDER = 'if(im._tries<IMG_RETRY.length)';
if (!page0.includes(LADDER)) { console.log('the retry ladder was not found in index.html'); process.exit(2); }
let mode = 'A', hits = {};
const srv = await serve(PORT, (p) => {
  const m = p.match(/\/assets\/atlas\/(menu-0|play-1)\.png$/);
  if (p === '/satellites/stream-hop/' || p === '/satellites/stream-hop/index.html') {
    let html = page0;
    if (PLANT) html = html.replace(LADDER, 'if(false)');
    if (mode === 'B') html = html.replace('var IMG_RETRY=[2000,4000,8000,16000,32000,60000];', 'var IMG_RETRY=[50,50,50,50,50,50];');
    return { headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
  }
  if (!m) return null;
  hits[m[1]] = (hits[m[1]] || 0) + 1;
  if (mode === 'A' && hits[m[1]] <= 2) return { status: 429, body: '' };
  if (mode === 'B' && m[1] === 'menu-0') return { status: 429, body: '' };
  return null;
});
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const fails = [];
async function run(label) {
  hits = {};
  const ctx = await b.createBrowserContext();
  const pg = await ctx.newPage(); await pg.setViewport({ width: 412, height: 915 });
  await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/?shtest=1`, { waitUntil: 'load', timeout: 90000 });
  const t0 = Date.now();
  const r = await pg.evaluate(async () => {
    const A = window.JIMOTHY_ATLAS, t = performance.now();
    const menu = Object.keys(A.frames).filter(k => A.frames[k][0] === 'menu-0');
    const play = Object.keys(A.frames).filter(k => A.frames[k][0] === 'play-1');
    const all = menu.concat(play).map(k => ({ k, o: SH_DEV.img('assets/' + k + '.png') }));
    while (all.some(x => x.o._st === 0) && performance.now() - t < 30000) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 300));
    const tags = Array.from(document.querySelectorAll('img[data-g]')).filter(e => A.frames[e.getAttribute('data-g')] && A.frames[e.getAttribute('data-g')][0] === 'menu-0');
    return { secs: Math.round((performance.now() - t) / 100) / 10,
      menuReady: all.filter(x => menu.includes(x.k) && x.o._st === 1).length,
      menuFromFile: all.filter(x => menu.includes(x.k) && x.o._st === 1 && /assets\/(ui|how)\/.+\.png/.test(x.o.src)).length, menuFailed: all.filter(x => menu.includes(x.k) && x.o._st === -1).length, menu: menu.length,
      playReady: all.filter(x => play.includes(x.k) && x.o._st === 1).length, play: play.length,
      fromSheet: all.filter(x => x.o._st === 1 && /^blob:/.test(x.o.src)).length, total: all.length,
      pending: all.filter(x => x.o._st === 0).length,
      tagsBlob: tags.filter(e => /^blob:/.test(e.src)).length, tagsFile: tags.filter(e => /assets\/(ui|how)\/.+\.png/.test(e.src)).length,
      tagsEmpty: tags.filter(e => !e.getAttribute('src')).length, tags: tags.length };
  });
  await ctx.close();
  console.log(`  case ${label}: ${JSON.stringify(r)} sheet hits ${JSON.stringify(hits)}`);
  return r;
}
mode = 'A';
const a = await run('A (two 429s, then the sheets)');
if (a.pending) fails.push(`A: ${a.pending} frames still waiting after ${a.secs} s`);
if (a.menuReady !== a.menu || a.playReady !== a.play) fails.push(`A: menu ${a.menuReady}/${a.menu}, play ${a.playReady}/${a.play} ready`);
if (a.fromSheet !== a.total) fails.push(`A: ${a.total - a.fromSheet} of ${a.total} frames came as files, not from their sheets: the ladder did not bring the refused sheets in (sheet hits ${JSON.stringify(hits)})`);
if (a.tagsBlob !== a.tags) fails.push(`A: ${a.tags - a.tagsBlob} of ${a.tags} image tags are not on their sheet's frames (${a.tagsFile} on files, ${a.tagsEmpty} blank)`);
if (!PLANT) {
  mode = 'B';
  const c = await run('B (menu sheet refused for ever)');
  if (c.pending) fails.push(`B: ${c.pending} frames hang instead of failing`);
  if (c.menuFromFile !== c.menu) fails.push(`B: only ${c.menuFromFile} of ${c.menu} menu frames came from their own files (${c.menuFailed} failed)`);
  if (c.playReady !== c.play) fails.push(`B: play art ${c.playReady}/${c.play}; one refused sheet took the game's art down with it`);
  if (c.tagsFile !== c.tags || c.tagsEmpty) fails.push(`B: ${c.tags - c.tagsFile} of ${c.tags} image tags did not fall back to their files (${c.tagsEmpty} blank)`);
}
await b.close(); srv.close();
if (fails.length) { console.log(`ATLAS LOCKOUT FAILED${PLANT ? ' (PLANT)' : ''}\n  ` + fails.join('\n  ')); process.exit(1); }
console.log('ATLAS LOCKOUT OK: refused sheets arrive through the ladder, and a sheet refused for good hands its frames to their files');
