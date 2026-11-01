#!/usr/bin/env node
/* CLIMB's shots (QUESTIONS Q221, the climb rules), against the local test server only (the gates'
 * server, rooted at this worktree), 412x915 at 3 device px a CSS px, touch on. Each photo is picked through the real
 * file input on a fresh page (a first room), then: the crop screen at rest; one real tap on Develop (and the auto crop's
 * search, if the box refuses); the reveal held at its resolve and at its light up; the room in play; the room after six real jumps.
 * Each line printed names the record's version and biome byte, the biome played and the enemy kinds, then the level's
 * rules, whether the fallback kept today's level, its tabs, stones, passes and the main ascent's film share.
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-climb.mjs <outdir> <photo.png> [...]
 *
 * THEN OPEN EVERY IMAGE AND LOOK: name three things wrong in each before calling the step done. */
import { serve, launch, newPage, gotoGame, ready, tap } from '../../satellites/shutterbug/test/harness.mjs';
import { mkdirSync } from 'node:fs';
import { basename } from 'node:path';

const OUT = process.argv[2], PHOTOS = process.argv.slice(3);
if (!OUT || !PHOTOS.length) { console.log('usage: shots-climb.mjs <outdir> <photo.png> [...]'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = await serve();
const browser = await launch();
const problems = [];
try {
  for (const photo of PHOTOS) {
    const name = basename(photo, '.png');
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const shot = async tag => { const f = OUT + '/' + name + '-412x915-' + tag + '.png'; await page.screenshot({ path: f }); console.log('  ' + f); };
    const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await page.$('#filechoose')).uploadFile(photo);
    await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 15000 }, d).catch(() => {});
    const rest = await page.evaluate(() => window.SB_DEV.overlay());
    await shot('1-crop');
    await tap(page, '#develop');
    /* the reveal: wait for it to start (after the search's show, if the box refused), then hold the loop and its clock */
    await page.waitForFunction(() => window.SB.ui.reveal && window.SB.ui.reveal.on, { timeout: 60000 }).catch(() => {});
    await page.evaluate(() => window.SB_DEV.hold(true));
    for (const [tag, ms] of [['2-resolve', 700], ['3-light', 1350]]) { await page.evaluate(ms => window.SB_DEV.revealAt(ms), ms); await sleep(120); await shot(tag); }
    await page.evaluate(() => window.SB_DEV.hold(false));
    await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 }).catch(() => {});
    await sleep(400);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await shot('4-play');
    /* the level as played: the record the page built, its rules, the fallback, the film share of the main ascent */
    const lvInfo = await page.evaluate(() => {
      const SB = window.SB, l = window.SB_DEV.level(), rec = l ? SB.record.decode(l.code) : null, lv = rec ? SB.pipeline.build(rec, {}) : null;
      if (!lv || lv.needsCrop) return null;
      const w = lv.w, n = w * lv.h, st = Array.from(lv.ascent.nodes).filter(v => v < n), onTab = st.filter(v => lv.tab[v + w]).length;
      return { rules: rec.rules, climb: lv.climb, fallback: !!lv.repair.wholeFallback, tabs: lv.repair.tabs, film: Math.round(100 * onTab / st.length), stones: (lv.repair.stones || []).length, passes: lv.repair.passes };
    });
    console.log(name + ': ' + JSON.stringify(lvInfo));
    /* the hero walked up: a run of real key presses (right, then jumps), so the shot is the level being played */
    await page.evaluate(() => window.SB_DEV.hold(true));
    for (let k = 0; k < 6; k++) { await page.keyboard.down('KeyZ'); await page.evaluate(() => window.SB_DEV.step(10)); await page.keyboard.up('KeyZ'); await page.evaluate(() => window.SB_DEV.step(30)); }
    await shot('5-played');
    const info = await page.evaluate(() => {
      const SB = window.SB, l = window.SB_DEV.level(), st = window.SB_DEV.state(), rec = l ? SB.record.decode(l.code) : null, K = ['', 'moth', 'icicle', 'jelly', 'crawler', 'spark'];
      return { v: rec && rec.v, byte: rec && rec.biome, grid: rec ? SB.palette.BIOMES[SB.pipeline.biomeOf(rec.pal, rec.pal.length)] : null, biome: st ? SB.palette.BIOMES[st.biome] : null,
        kinds: st ? st.enemies.filter(e => e.kind > 0).map(e => K[e.kind]) : [], seek: (window.SB.ui.seekInfo() || {}).builds || 0 };
    });
    console.log(name + ': needsCrop at rest ' + rest.needsCrop + ', search builds ' + info.seek + ', record v' + info.v + ' biome byte ' + info.byte + ' (the grid alone ' + info.grid + '), plays ' + info.biome + ', enemies ' + JSON.stringify(info.kinds));
    if (errors.length) problems.push(name + ': ' + errors.join(' ; '));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
console.log(problems.length ? 'PAGE ERRORS: ' + problems.join(' | ') : 'zero page errors');
