#!/usr/bin/env node
/* The shots, from where the PLAYER stands.
 *
 *   node tools/shots.mjs               all into docs/shots/
 *   node tools/shots.mjs p1-dive       one
 *
 * p1-dive is a six panel strip at 0.4 s of SIM time between panels: a real
 * thumb (pointer events) leans the kite into a dive and pulls it out.
 * p1-park is a high park at dusk (?hour=19). p2-mood is the mood screen, p2-mabel
 * the kite snagged in the crown, p2-stamp a Loop stamp flown by a real thumb. title-* are the title at the
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
if (want('p2-mood')) {
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await toField(page);
  await tap(page, '#btnMood');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'mood', { timeout: 20000 });
  await waitFrames(page, 3);
  save('p2-mood', await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p2-mabel')) {
  /* the kite placed low and to the right, into Mabel's crown; the shot is taken once the model says snagged */
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await toField(page);
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 34, el: 0.2, az: 0.70, launched: true }));
  await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.snagged; }, { timeout: 30000 }).catch(() => console.log('  p2-mabel: no snag in 30 s'));
  await waitFrames(page, 4);
  const st = await page.evaluate(() => window.UPDRAFT_DEV.state());
  console.log('  mabel: snagged ' + st.snagged + ' at alt ' + st.alt.toFixed(1));
  save('p2-mabel', await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p2-stamp')) {
  /* SCRIPTS.loop from sim.js, flown by a real thumb: hold with a lean of 0.8 for 3 s from 40 m; the shot is the stamp */
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await toField(page);
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 40, el: 0.68, az: 0, launched: true }));
  await waitFrames(page, 2);
  const home = { x: 187, y: 470 };
  let shot = null;
  await flyScript(page, home, [{ t: 0, hold: true, lean: 0.8 }, { t: 5, hold: false, lean: 0 }], 6,
    async () => { if (!shot) { const on = await page.evaluate(() => document.getElementById('stamp').classList.contains('on')); if (on) { await waitFrames(page, 2); shot = await page.screenshot({ type: 'png' }); } } });
  const st = await page.evaluate(() => window.UPDRAFT_DEV.state());
  console.log('  stamp: ' + JSON.stringify(st.stamps) + (shot ? '' : '  NO STAMP SEEN, shooting the end'));
  save('p2-stamp', shot || await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p2-journal')) {
  /* a journal with a few flights in it, written to the save before the page boots; then the pause door */
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.evaluate(() => localStorage.setItem('lw_updraft_v1', JSON.stringify({ v: 1, journal: { bestAlt: 67, longest: 214, tricks: { 'Loop': 4, 'Dive Bomb': 2, 'Stall Save': 1 }, hours: 0.42, flights: 9 }, kite: 'diamond', mood: 'fresh' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
  await toField(page);
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 20000 });
  await tap(page, '#btnJournal');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'journal', { timeout: 20000 });
  await waitFrames(page, 3);
  save('p2-journal', await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p2-kites')) {
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.evaluate(() => localStorage.setItem('lw_updraft_v1', JSON.stringify({ v: 1, journal: { bestAlt: 67, longest: 214, tricks: { 'Loop': 4 }, hours: 0.7, flights: 9 }, kite: 'delta', mood: 'fresh' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
  await toField(page);
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 20000 });
  await tap(page, '#btnKites');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'kites', { timeout: 20000 });
  await waitFrames(page, 3);
  save('p2-kites', await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p2-landing')) {
  /* the landing flourish: the kite placed low on a released line in Gentle sinks to the grass; the shot is 0.9 s of sim after the model says it landed */
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.evaluate(() => localStorage.setItem('lw_updraft_v1', JSON.stringify({ v: 1, journal: { bestAlt: 0, longest: 0, tricks: {}, hours: 0, flights: 0 }, kite: 'diamond', mood: 'gentle' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
  await toField(page);
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 14, el: 0.35, az: 0.1, launched: true }));
  await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.ended; }, { timeout: 60000 }).catch(() => console.log('  p2-landing: no landing in 60 s'));
  const t0 = await page.evaluate(() => window.UPDRAFT_DEV.state().t);
  await untilSim(page, t0 + 0.9, 10000).catch(() => {});
  const st = await page.evaluate(() => window.UPDRAFT_DEV.state());
  console.log('  landing: ended ' + st.ended + ' tip ' + JSON.stringify(st.tip) + ' screen ' + await page.evaluate(() => window.UPDRAFT_DEV.screen()));
  save('p2-landing', await page.screenshot({ type: 'png' }));
  await browser.close();
}
if (want('p3-realwind')) {
  /* Real Wind on, from an hour cache written into the save before boot (no network in a shot); the mood screen with the fourth card, then the field with the wind line */
  const { browser, page } = await open(base, { width: 375, height: 667 });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.evaluate(() => localStorage.setItem('lw_updraft_v1', JSON.stringify({ v: 1, journal: { bestAlt: 0, longest: 0, tricks: {}, hours: 0, flights: 0 }, kite: 'diamond', mood: 'fresh', settings: { sound: 1, motion: 1, realWind: 1, haptics: 1 }, weatherCache: { t: Math.floor(Date.now() / 1000), mph: 9.2, dir: 270 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
  await toField(page);
  await tap(page, '#btnMood');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'mood', { timeout: 20000 });
  await waitFrames(page, 3);
  save('p3-realwind', await page.screenshot({ type: 'png' }));
  await tap(page, '#btnMoodBack');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 30, el: 0.8, az: 0.1, launched: true }));
  await untilSim(page, 2);
  save('p3-realwind-field', await page.screenshot({ type: 'png' }));
  await browser.close();
}
close();
const over = wrote.filter(w => w.kb > 200);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
