#!/usr/bin/env node
/* The shots, taken from where the PLAYER stands, at the three widths.
 *
 *   node tools/shots.mjs                 all of them into docs/shots/
 *   node tools/shots.mjs p1-flight       just one
 *
 * Every shot is driven by real taps and a real flick on the real canvas, the
 * same way the gates do it. The one liberty a camera takes that a gate may
 * not: GERPLUNK_DEV.hold(t) freezes the playback clock at a moment worth
 * photographing, because under swiftshader the page draws a few frames a
 * second and "mid skip" would otherwise be luck.
 *
 * Shape copied from satellites/fathom/tools/shots.mjs.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, flick, hold, stroke, waitFrames } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const SIZES = { tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 }, small: { width: 320, height: 568 } };
const LIMIT = 200 * 1024;
const { base, close } = await serve();
const wrote = [];
const want = n => !only || only.split(',').indexOf(n) >= 0;

async function shoot(page, name) {
  const buf = await page.screenshot({ type: 'png' });
  const p = join(OUT, name + '.png');
  writeFileSync(p, buf);
  const kb = statSync(p).size / 1024;
  wrote.push({ name, kb });
  console.log('  ' + name.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : ''));
}
async function toLake(page) {
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
  await tap(page, '.stone[data-id="skimmer"]');
  await waitFrames(page, 3);
}
/* a good throw from the middle of the water, then the clock held */
async function throwAndHold(page, size, at) {
  const y0 = Math.round(size.height * 0.72), x0 = Math.round(size.width * 0.32);
  await flick(page, stroke({ x0, y0, arc: 300, ms: 150, rise: 0.55, hook: 0.7 }));
  await page.waitForFunction(() => window.GERPLUNK_DEV.lastResult() !== null, { timeout: 10000 });
  const res = await page.evaluate(() => window.GERPLUNK_DEV.lastResult());
  const t = at(res);
  await page.evaluate((t) => window.GERPLUNK_DEV.hold(t), t);
  await waitFrames(page, 4);
  return res;
}

for (const key of Object.keys(SIZES)) {
  const size = SIZES[key];
  const { browser, page, errors } = await open(base, size);
  if (want('title-' + key)) { await waitFrames(page, 4); await shoot(page, 'title-' + key); }
  if (key === 'mid') {
    await toLake(page);
    if (want('p1-shore')) { await waitFrames(page, 3); await shoot(page, 'p1-shore'); }
    if (want('p1-flight') || want('p1-gerplunk')) {
      const res = await throwAndHold(page, size, r => Math.max(0.3, r.time * 0.42));
      console.log('  (the throw: ' + res.skips + ' skips, ' + res.distance.toFixed(1) + ' m, ' + res.ended + ')');
      if (want('p1-flight')) await shoot(page, 'p1-flight');
      if (want('p1-gerplunk')) {
        await page.evaluate((t) => window.GERPLUNK_DEV.hold(t), res.time + 0.7);
        await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 10000 });
        await waitFrames(page, 3);
        await shoot(page, 'p1-gerplunk');
      }
    }
    /* P2: the bank with a hand's records on it, and the same date's bank at
       career 1000, where the bed has stopped gifting the skimmer and a rare can
       sit on the pebbles. Both are the real bank after a reload of a seeded save. */
    if (want('p2-bank') || want('p2-bank-late') || want('p2-lee') || want('p2-bay')) {
      /* p2-lee and p2-bay are the same bank with the saved stance turned past the
         point and past the bay mouth, the way a returning player arrives */
      for (const [name, career, yaw] of [['p2-bank', 12, null], ['p2-bank-late', 1000, null], ['p2-lee', 12, -20], ['p2-bay', 12, 20]]) {
        if (!want(name)) continue;
        await page.evaluate(([career, yaw]) => {
          const s = JSON.parse(localStorage.getItem('lw_gerplunk_v1') || '{}');
          s.career = career; s.best = career >= 1000 ? 17 : 7; s.seen = { how: 1 };
          s.bestByStone = career >= 1000 ? { skimmer: 17, seaglass: 15, shale: 9, sandstone: 6, heavyflat: 8, fossil: 12, quartz: 14, granite: 1 } : { skimmer: 7, sandstone: 3 };
          if (yaw !== null) s.yaw = yaw;
          localStorage.setItem('lw_gerplunk_v1', JSON.stringify(s));
        }, [career, yaw]);
        await page.reload({ waitUntil: 'load' });
        await page.waitForFunction(() => window.GERPLUNK_DEV && window.GERPLUNK_DEV.frames() > 2, { timeout: 20000 });
        await tap(page, '#btnPlay');
        await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
        await waitFrames(page, 4);
        const offer = await page.evaluate(() => window.GERPLUNK_DEV.offer());
        const day = await page.evaluate(() => window.GERPLUNK_DEV.day());
        console.log('  (' + name + ' offers ' + offer.join(', ') + '; day water ' + day.water + ', face ' + day.face.face + ' on ' + day.face.water + ')');
        await shoot(page, name);
      }
    }
  }
  if (key === 'mid' && (want('p2-daily') || want('p2-card') || want('p2-card-link'))) {
    /* the daily lake: a save with two throws today shows the strip on the lake;
       five throws today shows the card; a link opens a fresh page on the sender's card */
    const day = await page.evaluate(() => window.GERPLUNK_DEV.daily().day);
    const five = [{ skips: 7, dist: 12.3 }, { skips: 11, dist: 18.0 }, { skips: 4, dist: 6.9 }, { skips: 15, dist: 25.4 }, { skips: 9, dist: 14.1 }];
    for (const [name, n] of [['p2-daily', 2], ['p2-card', 5]]) {
      if (!want(name)) continue;
      await page.evaluate(([day, throws]) => {
        const s = JSON.parse(localStorage.getItem('lw_gerplunk_v1') || '{}');
        s.daily = { day, throws }; s.seen = { how: 1 }; s.best = 15;
        localStorage.setItem('lw_gerplunk_v1', JSON.stringify(s));
      }, [day, five.slice(0, n)]);
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => window.GERPLUNK_DEV && window.GERPLUNK_DEV.frames() > 2, { timeout: 20000 });
      await tap(page, '#btnPlay');
      await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
      await tap(page, '#btnMenu');
      await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 10000 });
      await tap(page, '#btnDaily');
      await waitFrames(page, 4);
      console.log('  (' + name + ': screen ' + await page.evaluate(() => window.GERPLUNK_DEV.screen()) + ')');
      await shoot(page, name);
    }
    if (want('p2-card-link')) {
      const link = await page.evaluate(() => window.GERPLUNK_DEV.dailyLink());
      await browser.close();
      const fresh = await open(base, { width: size.width, height: size.height, query: link.slice(link.indexOf('#')) });
      await waitFrames(fresh.page, 4);
      await shoot(fresh.page, 'p2-card-link');
      await fresh.browser.close();
      console.log('  (' + size.width + 'x' + size.height + ' done)');
      continue;
    }
  }
  /* P4: the WIND UP, the thumb still down and the spin ring part filled. The
     thumb is held mid circle rather than at the throw, because the ring is the
     only thing in the game that exists before the stone leaves and it is the
     thing this shot is for. It is taken at 412 and at 375. */
  if ((key === 'tall' || key === 'mid') && want('p4-windup-' + key)) {
    if (key === 'tall') await toLake(page);
    const y0 = Math.round(size.height * 0.72), x0 = Math.round(size.width * 0.32);
    const pts = stroke({ x0, y0, arc: 300, ms: 150, rise: 0.55, hook: 0, n: 14, loops: 2 });
    await hold(page, pts.slice(0, 36));
    await waitFrames(page, 4);
    const sp = await page.evaluate(() => window.GERPLUNK_DEV.spin());
    console.log('  (the wind up: bank ' + sp.bank.toFixed(2) + ', ring r ' + sp.r.toFixed(0) + ' about ' + sp.x.toFixed(0) + ',' + sp.y.toFixed(0) + ', thumb at ' + sp.tx.toFixed(0) + ',' + sp.ty.toFixed(0) + ')');
    await shoot(page, 'p4-windup-' + key);
    /* P5: THE SAME WIND UP WITH A THUMB ON IT. p4-windup-tall passed the look
       on Sep 07 with a ring of 26 to 42 px in it, because there is no thumb in
       the shot, and the Director's line 11 was that he cannot see the ring
       behind his. So a thumb goes on: a 90 px disc at the hold point (a pad is
       12 to 16 mm, and a Pixel 9 CSS px is 0.158 mm) and a 60 px bar running
       down and to the right, a right hand's thumb body. It is drawn onto a copy
       of the screenshot in a blank page, never by the game, and it is judged
       BEFORE the clean shot is. */
    if (key === 'tall' && want('p5-windup-thumb')) {
      const shot = await page.screenshot({ type: 'png', encoding: 'base64' });
      const blank = await browser.newPage();
      await blank.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 2 });
      /* the composite is shown at the phone's own size and SCREENSHOT, not
         exported with toDataURL: the canvas encoder writes the same picture at
         368 KB, the screenshot encoder at 160 */
      await blank.evaluate(async (src, tx, ty, dpr) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + src;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.style.cssText = 'display:block;width:' + (img.width / dpr) + 'px;height:' + (img.height / dpr) + 'px';
        document.body.style.margin = '0';
        document.body.appendChild(c);
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        g.scale(dpr, dpr);
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(196,146,118,0.97)'; g.lineWidth = 60;
        g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + 500, ty + 500); g.stroke();
        g.fillStyle = 'rgba(206,156,126,0.97)';
        g.beginPath(); g.arc(tx, ty, 45, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(120,70,50,0.6)'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(tx, ty, 45, 0, Math.PI * 2); g.stroke();
      }, shot, sp.tx, sp.ty, 2);
      const p = join(OUT, 'p5-windup-thumb.png');
      writeFileSync(p, await blank.screenshot({ type: 'png' }));
      await blank.close();
      const kb = statSync(p).size / 1024;
      wrote.push({ name: 'p5-windup-thumb', kb });
      console.log('  ' + 'p5-windup-thumb'.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : '') + '   (a thumb composited at ' + sp.tx.toFixed(0) + ',' + sp.ty.toFixed(0) + ')');
    }
  }
  if (key !== 'mid' && want('p1-lake-' + key)) {
    await toLake(page);
    await waitFrames(page, 3);
    await shoot(page, 'p1-lake-' + key);
  }
  if (errors.length) console.log('  ERRORS at ' + key + ': ' + errors.join(' | '));
  await browser.close();
  console.log('  (' + size.width + 'x' + size.height + ' done)');
}

close();
const over = wrote.filter(w => w.kb > LIMIT / 1024);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
