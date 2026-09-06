#!/usr/bin/env node
/* The shots, from where the PLAYER stands.
 *
 *   node tools/shots.mjs               all into docs/shots/
 *   node tools/shots.mjs p1-dive       one
 *
 * p1-dive is a six panel strip at 0.4 s of SIM time between panels: a real
 * thumb (pointer events) leans the kite into a dive and pulls it out.
 * p1-park is a high park at dusk (?hour=19). title-* are the title at the
 * three widths. The one liberty a camera takes that a gate may not: the kite
 * is PLACED aloft through UPDRAFT_DEV.place so the strip is the dive and not
 * twenty seconds of launching. It says so here.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, flyScript, untilSim, waitFrames, thumbDown, thumbUp, sleep } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const want = n => !only || only === n;
const LIMIT = 200 * 1024;
const { base, close } = await serve();
const wrote = [];
function save(name, buf) {
  const p = join(OUT, name + '.png'); writeFileSync(p, buf);
  const kb = statSync(p).size / 1024; wrote.push({ name, kb });
  console.log('  ' + name.padEnd(18) + kb.toFixed(0).padStart(4) + ' KB' + (kb > 200 ? '   OVER THE 200 KB LIMIT' : ''));
}
async function toField(page) {
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
  await waitFrames(page, 3);
}
/* a strip of panels composed in a fresh page */
async function strip(browser, pngs, scale) {
  const page = await browser.newPage();
  const w = Math.round(375 * scale), h = Math.round(667 * scale);
  await page.setViewport({ width: w * pngs.length + 4 * (pngs.length - 1), height: h, deviceScaleFactor: 1 });
  const imgs = pngs.map(b => '<img src="data:image/png;base64,' + b.toString('base64') + '" style="width:' + w + 'px;height:' + h + 'px;display:block">').join('<div style="width:4px"></div>');
  await page.setContent('<body style="margin:0;background:#20303a;display:flex">' + imgs + '</body>');
  const buf = await page.screenshot({ type: 'png' });
  await page.close();
  return buf;
}

if (want('title-tall') || want('title-mid') || want('title-small')) {
  for (const [key, size] of Object.entries({ tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 }, small: { width: 320, height: 568 } })) {
    if (!want('title-' + key)) continue;
    const { browser, page } = await open(base, size);
    await page.setViewport({ ...size, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await waitFrames(page, 4);
    save('title-' + key, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
if (want('p1-dive')) {
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await toField(page);
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 20, el: 1.0, az: 0, launched: true }));
  await page.evaluate(() => window.UPDRAFT_DEV.timeScale(0.2));
  await waitFrames(page, 2);
  const home = { x: 187, y: 470 };
  const panels = [];
  let next = 0.9;
  await flyScript(page, home, [{ t: 0, hold: true, lean: 0.8 }, { t: 1.4, hold: true, lean: 0 }, { t: 1.9, hold: true, lean: 1 }, { t: 3.1, hold: true, lean: 0 }, { t: 4.5, hold: false, lean: 0 }], 4.6,
    async (t) => { if (t >= next && panels.length < 6) { panels.push(await page.screenshot({ type: 'png' })); next += 0.4; if (t >= next) next = t + 0.4; } });
  /* a slow frame can cross two thresholds at once; the next panel is then 0.4 s from NOW so the strip is always six */
  const st = await page.evaluate(() => window.UPDRAFT_DEV.state());
  console.log('  dive strip: ' + panels.length + ' panels, stamps ' + JSON.stringify(st.stamps) + ', min alt seen in sim ' + st.alt.toFixed(1));
  save('p1-dive', await strip(browser, panels, 0.5));
  save('p1-dive-last', panels[panels.length - 1]);
  await browser.close();
}
if (want('p1-park')) {
  const { browser, page } = await open(base, { width: 375, height: 667, query: '&hour=19' });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await toField(page);
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 60, el: 0.9, az: 0.15, launched: true }));
  await untilSim(page, 3);
  save('p1-park', await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p1-launch')) {
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await toField(page);
  await waitFrames(page, 2);
  save('p1-grass', await page.screenshot({ type: 'png' }));
  const home = { x: 187, y: 470 };
  for (let i = 0; i < 4; i++) { await thumbDown(page, home.x, home.y); await sleep(600); await thumbUp(page, home.x, home.y); await sleep(600); }
  await waitFrames(page, 2);
  save('p1-launch', await page.screenshot({ type: 'png' }));
  await browser.close();
}
close();
const over = wrote.filter(w => w.kb > 200);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
