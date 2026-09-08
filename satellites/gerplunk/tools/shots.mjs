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
import { serve, open, ROOT, tap, flick, hold, resume, stroke, waitFrames } from '../test/harness.mjs';

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
  /* ⛔ ONCE PER PAGE. TO THE LAKE is under the lake once it is up, so a second
     tap lands on the water and throws; two blocks on the tall page each asked
     for it before this guard. */
  if (await page.evaluate(() => window.GERPLUNK_DEV.screen() === 'lake')) return;
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
  await tap(page, '.stone[data-id="skimmer"]');
  await waitFrames(page, 3);
}
/* P6: THE POINT AND ITS SPIT at five stances, minus 25 to plus 25, on the
   fresh save's bank. His Sep 08 words were "a black strip that if I turn it all
   it almost looks like it's a bridge", so the look is judged turned all the way
   into it and all the way away from it and at three stances between, at 412
   (all five) and at 375 (the two ends). The stance is put back after. */
const STANCES = [['m25', -25], ['m12', -12], ['0', 0], ['p12', 12], ['p25', 25]];
async function shootStances(page, key) {
  const names = STANCES.filter(([n]) => key === 'tall' || n === 'm25' || n === '0').map(([n, y]) => ['p6-spit-' + key + '-' + n, y]);
  if (!names.some(([n]) => want(n))) return;
  await toLake(page);
  const yaw0 = await page.evaluate(() => window.GERPLUNK_DEV.yaw());
  for (const [name, yaw] of names) {
    if (!want(name)) continue;
    await page.evaluate((y) => window.GERPLUNK_DEV.setYaw(y), yaw);
    await waitFrames(page, 3);
    const ink = await page.evaluate(() => { const k = window.GERPLUNK_DEV.landInk(); return { run: k.maxRun, frac: k.maxRunFrac, strip: k.strip, stripFrac: k.stripFrac }; });
    const line = await page.evaluate((y) => window.GERPLUNK_DEV.landLine(y), yaw);
    console.log('  (' + name + ': yaw ' + yaw + ', the bar ' + (line.covers ? 'covers' : 'is off') + ' the throw line; land in the bar\'s rows ' + ink.run.toFixed(0) + ' px, of it OVER WATER ' + ink.strip.toFixed(0) + ' px, ' + (ink.stripFrac * 100).toFixed(0) + '% of the width)');
    await shoot(page, name);
  }
  await page.evaluate((y) => window.GERPLUNK_DEV.setYaw(y), yaw0);
  await waitFrames(page, 2);
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
/* the same, WATCHED: the clock is let go, the last throw is allowed to sink
   and its rings to fade, and the flick is thrown again if it came out as a
   set down (on two cores it does, about one run in three). Returns the throw
   and the result once the stone is really in the air. */
async function throwWatched(page, size, at) {
  await page.evaluate(() => window.GERPLUNK_DEV.hold(null));
  await page.waitForFunction(() => { const s = window.GERPLUNK_DEV.state(); return !s.inFlight && s.rings === 0; }, { timeout: 30000 }).catch(() => {});
  await waitFrames(page, 3);
  /* ⛔ from 0.15 W with a 240 px arc, not the 0.32 W and 300 of the other
     throws: those release at x 400 on a 412 page and 388 on a 375, off the
     glass, which no thumb can do, and the first p7 shots had the frozen ring
     half off the right edge for that reason */
  const y0 = Math.round(size.height * 0.72), x0 = Math.round(size.width * 0.15);
  let flew = false;
  for (let go = 0; go < 4 && !flew; go++) {
    await flick(page, stroke({ x0, y0, arc: 240, ms: 150, rise: 0.55, hook: 0.7 }));
    flew = await page.evaluate(() => window.GERPLUNK_DEV.state().inFlight);
    if (!flew) await waitFrames(page, 4);
  }
  const res = await page.evaluate(() => window.GERPLUNK_DEV.lastResult());
  await page.evaluate((t) => window.GERPLUNK_DEV.hold(t), at(res));
  await waitFrames(page, 4);
  return { res, th: await page.evaluate(() => window.GERPLUNK_DEV.lastThrow()), rel: await page.evaluate(() => window.GERPLUNK_DEV.release()) };
}
/* P7: THE RELEASE AND THE CURVE (call 58). The clock held 120 ms into the
   throw: the ring frozen where the thumb let go, the angle line with the
   magic angle dotted beside it, the spin arc on the stone. Then the same throw
   held four seconds past its sink, when the rings have gone and the seam on
   the water is the throw's own line with its tag. At 412 the release is also
   composited with a thumb hovering where it let go, because the picture is
   drawn where the thumb WAS and the thumb rule says judge it with a hand in. */
async function shootRelease(page, browser, size, key) {
  if (!want('p7-release-' + key) && !want('p7-curve-' + key) && !want('p7-release-thumb')) return;
  await toLake(page);
  const t = await throwWatched(page, size, () => 0.12);
  console.log('  (p7 throw: v ' + t.th.v.toFixed(1) + ', theta ' + t.th.theta.toFixed(1) + ', spin ' + t.th.spin.toFixed(2) + '; ' + t.res.skips + ' skips, ' + t.res.distance.toFixed(1) + ' m, ' + t.res.ended + '; release at ' + (t.rel.x ? t.rel.x.toFixed(0) + ',' + t.rel.y.toFixed(0) + ' r ' + t.rel.r.toFixed(0) : '?') + ')');
  if (want('p7-release-' + key)) await shoot(page, 'p7-release-' + key);
  if (key === 'tall' && want('p7-release-thumb') && t.rel.x) {
    const shot = await page.screenshot({ type: 'png', encoding: 'base64' });
    const blank = await browser.newPage();
    await blank.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 2 });
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
    }, shot, t.rel.x, t.rel.y, 2);
    const p = join(OUT, 'p7-release-thumb.png');
    writeFileSync(p, await blank.screenshot({ type: 'png' }));
    await blank.close();
    const kb = statSync(p).size / 1024;
    wrote.push({ name: 'p7-release-thumb', kb });
    console.log('  ' + 'p7-release-thumb'.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : '') + '   (a thumb composited where it let go, ' + t.rel.x.toFixed(0) + ',' + t.rel.y.toFixed(0) + ')');
  }
  if (want('p7-curve-' + key)) {
    await page.evaluate((t) => window.GERPLUNK_DEV.hold(t), t.res.time + 4.2);
    await page.waitForFunction(() => { const s = window.GERPLUNK_DEV.state(); return s.sunk && s.rings === 0; }, { timeout: 15000 });
    /* ⛔ the plunk word runs on the WALL clock (1.7 s from the moment the
       page saw the sink) while the rings run on the held one, so under a
       held clock the word and the "your line" tag were on the water at once,
       which real play cannot produce (the word is gone at 1.7 s, the tag
       comes at 3.7); the word is waited out before the shot */
    await page.waitForFunction(() => !document.getElementById('plunk').classList.contains('on'), { timeout: 10000 });
    /* and the READOUT is waited for, not hoped for: the first curve shots
       caught the advice line on one page and the empty 200 ms between the
       two lines on the other, because a screenshot at 412x915 is most of a
       second on this box */
    await page.waitForFunction(() => /magic angle/.test(window.GERPLUNK_DEV.state().line), { timeout: 4000 }).catch(() => {});
    await waitFrames(page, 1);
    const sm = await page.evaluate(() => window.GERPLUNK_DEV.seam());
    console.log('  (the line reads ' + JSON.stringify(await page.evaluate(() => window.GERPLUNK_DEV.state().line)) + ')');
    console.log('  (the seam is ' + (sm.mine ? 'the throw\'s own' : 'the preview') + ', tagged ' + JSON.stringify(sm.tag) + (sm.sink ? ', sink ' + sm.sink.x.toFixed(1) + ' m, ' + sm.sink.y.toFixed(2) + ' m lateral, heading ' + sm.sink.heading.toFixed(1) : '') + ')');
    await shoot(page, 'p7-curve-' + key);
  }
  await page.evaluate(() => window.GERPLUNK_DEV.hold(null));
}

/* a thumb composited on a copy of the screenshot in a blank page, never by
   the game: a 90 px disc at the hold point and a 60 px bar down and to the
   right, a right hand's thumb body (the p5 and p7 shots draw the same one) */
async function withThumb(page, browser, size, name, tx, ty) {
  const shot = await page.screenshot({ type: 'png', encoding: 'base64' });
  const blank = await browser.newPage();
  await blank.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 2 });
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
  }, shot, tx, ty, 2);
  const p = join(OUT, name + '.png');
  writeFileSync(p, await blank.screenshot({ type: 'png' }));
  await blank.close();
  const kb = statSync(p).size / 1024;
  wrote.push({ name, kb });
  console.log('  ' + name.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : '') + '   (a thumb composited at ' + tx.toFixed(0) + ',' + ty.toFixed(0) + ')');
}
/* P8: THE COACH (call 57), every beat where the player meets it, on HIS save
   (seen.how and seen.turn set and nothing else, the way his phone had it on
   Sep 07): the wind up beat after the second unspun sink, the hook beat after
   a throw that curled, the faces beat under a slow thumb past the point (with
   a thumb composited on it at 412), the sheet with HOW TO THROW on it, the
   first line back on the water after that tap, and the slide lesson after the
   next sink. Real strokes and real taps; the clock is never held, because a
   beat is a line and the wait is the game's own 6.7 s after the sink. It
   reloads the page with the seeded save, so it runs LAST on its page. */
async function shootCoach(page, browser, size, key) {
  const names = ['p8-coach-wind-', 'p8-coach-hook-', 'p8-coach-faces-', 'p8-sheet-', 'p8-coach-flick-', 'p8-coach-turn-'].map(n => n + key).concat(key === 'tall' ? ['p8-coach-faces-thumb'] : []);
  if (!names.some(want)) return;
  await page.evaluate(() => localStorage.setItem('lw_gerplunk_v1', JSON.stringify({ v: 1, seen: { how: 1, turn: 1 }, yaw: 0 })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.GERPLUNK_DEV && window.GERPLUNK_DEV.frames() > 2, { timeout: 20000 });
  await toLake(page);
  const lines = await page.evaluate(() => window.GERPLUNK_DEV.coach().lines);
  const y0 = Math.round(size.height * 0.72), x0 = Math.round(size.width * 0.15);
  const UNSPUN = { x0, y0, arc: 240, ms: 150, rise: 0.55, hook: 0, n: 14 };
  const HOOKED = { x0, y0, arc: 240, ms: 150, rise: 0.55, hook: 0.7, n: 14 };
  const settle = async () => {
    await page.waitForFunction(() => { const s = window.GERPLUNK_DEV.state(); return !s.inFlight && s.rings === 0; }, { timeout: 40000 }).catch(() => {});
    await waitFrames(page, 3);
  };
  const throwTo = async (opts) => {
    for (let go = 0; go < 4; go++) {
      const before = await page.evaluate(() => window.GERPLUNK_DEV.save().throws);
      await flick(page, stroke(opts));
      const got = await page.waitForFunction((n) => window.GERPLUNK_DEV.save().throws === n, { timeout: 20000 }, before + 1).then(() => true).catch(() => false);
      if (got) return true;
      await settle();
    }
    return false;
  };
  const waitLine = (text) => page.waitForFunction((t) => window.GERPLUNK_DEV.state().line === t, { timeout: 16000 }, text).then(() => true).catch(() => false);
  const report = (name, ok) => console.log('  (' + name + ': the line reads ' + (ok ? 'the beat' : 'SOMETHING ELSE') + ')');
  await throwTo(UNSPUN); await settle(); await throwTo(UNSPUN);
  const w = await waitLine(lines.wind); report('p8-coach-wind-' + key, w);
  if (want('p8-coach-wind-' + key)) await shoot(page, 'p8-coach-wind-' + key);
  await settle(); await throwTo(HOOKED);
  const h = await waitLine(lines.hook); report('p8-coach-hook-' + key, h);
  if (want('p8-coach-hook-' + key)) await shoot(page, 'p8-coach-hook-' + key);
  await settle();
  await page.evaluate(() => window.GERPLUNK_DEV.setYaw(0));
  await waitFrames(page, 2);
  const pts = Array.from({ length: 25 }, (_, i) => ({ x: x0 + i * 10, y: y0, dt: i ? 50 : 0 }));
  await hold(page, pts);
  await waitFrames(page, 3);
  const f = await page.evaluate((t) => window.GERPLUNK_DEV.state().line === t, lines.faces); report('p8-coach-faces-' + key, f);
  console.log('  (the thumb is down at ' + (x0 + 240) + ',' + y0 + ', the lake at ' + (await page.evaluate(() => window.GERPLUNK_DEV.yaw())).toFixed(1) + ' degrees)');
  if (want('p8-coach-faces-' + key)) await shoot(page, 'p8-coach-faces-' + key);
  if (key === 'tall' && want('p8-coach-faces-thumb')) await withThumb(page, browser, size, 'p8-coach-faces-thumb', x0 + 240, y0);
  await resume(page, [{ x: x0 + 244, y: y0, dt: 60 }, { x: x0 + 246, y: y0, dt: 80 }]);
  await waitFrames(page, 2);
  await tap(page, '#btnMenu');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 10000 });
  await waitFrames(page, 3);
  if (want('p8-sheet-' + key)) await shoot(page, 'p8-sheet-' + key);
  await tap(page, '#btnHow');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 10000 });
  await waitFrames(page, 3);
  report('p8-coach-flick-' + key, await page.evaluate((t) => window.GERPLUNK_DEV.state().line === t, lines.how));
  if (want('p8-coach-flick-' + key)) await shoot(page, 'p8-coach-flick-' + key);
  await throwTo(HOOKED);
  const t = await waitLine(lines.turn); report('p8-coach-turn-' + key, t);
  if (want('p8-coach-turn-' + key)) await shoot(page, 'p8-coach-turn-' + key);
  await settle();
}

for (const key of Object.keys(SIZES)) {
  const size = SIZES[key];
  const { browser, page, errors } = await open(base, size);
  if (want('title-' + key)) { await waitFrames(page, 4); await shoot(page, 'title-' + key); }
  if (key === 'tall' || key === 'mid') await shootStances(page, key);
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
    await shootRelease(page, browser, size, key);
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
  /* the coach's shots reload with a seeded save, so they follow every shot on
     this page that plays the fresh one, and precede the daily ones, which
     reload with their own seed and close the browser at the end */
  if (key === 'mid') await shootCoach(page, browser, size, key);
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
  /* the fresh lake, BEFORE any throw on this page: since the p7 shots throw
     from the tall page, taking this after them caught a held clock artefact
     (the plunk word on the wall clock over the "your line" tag on the held
     one) that no real play can produce, and it was not the fresh lake */
  if (key !== 'mid' && want('p1-lake-' + key)) {
    await toLake(page);
    await waitFrames(page, 3);
    await shoot(page, 'p1-lake-' + key);
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
    /* the held wind up is let go as the throw it was, so the next shot does
       not start inside somebody else's touch */
    await resume(page, pts.slice(36));
    await page.waitForFunction(() => !window.GERPLUNK_DEV.state().inFlight, { timeout: 40000 }).catch(() => {});
  }
  if (key === 'tall') await shootRelease(page, browser, size, key);
  if (key === 'tall') await shootCoach(page, browser, size, key);
  if (errors.length) console.log('  ERRORS at ' + key + ': ' + errors.join(' | '));
  await browser.close();
  console.log('  (' + size.width + 'x' + size.height + ' done)');
}

close();
const over = wrote.filter(w => w.kb > LIMIT / 1024);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
