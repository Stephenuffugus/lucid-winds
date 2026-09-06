/* The evidence. Every shot is taken from where the PLAYER stands, at the
 * player's own pixels, in both orientations.
 *
 *   node tools/shots.mjs            all of them
 *   node tools/shots.mjs p3         only the ones whose name contains p3
 *
 * ⛔ the walk to the moment is never skipped: the screens are reached by
 * pressing the same buttons a thumb presses, and only the SHUTTER is filtered.
 * ⛔ every shot waits for the opening line to fade, because a picture judged
 * with a toast across it is a picture of a toast.
 */
import { serve, open, waitFrames, sleep, tap, tapAt, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const R = n => Math.round(n);

const s = await serve();

async function withPage(w, h, fn) {
  const b = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  async function save(name, buf) {
    let out = buf;
    if (out.length > LIMIT) {
      /* drop the low bits rather than the resolution: a screenshot resized is
         a screenshot nobody can judge the type on */
      const b64 = await b.page.evaluate(async (bb) => {
        const im = new Image();
        await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + bb; });
        const cv = document.createElement('canvas');
        cv.width = im.width; cv.height = im.height;
        const c = cv.getContext('2d');
        c.drawImage(im, 0, 0);
        const d = c.getImageData(0, 0, cv.width, cv.height);
        for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
        c.putImageData(d, 0, 0);
        return cv.toDataURL('image/png').split(',')[1];
      }, out.toString('base64'));
      out = Buffer.from(b64, 'base64');
    }
    writeFileSync(join(OUT, name + '.png'), out);
    console.log('  ' + name + '.png  ' + (out.length / 1024).toFixed(0) + ' KB'
      + (out.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
  }
  const shot = async (name) => { await save(name, await b.page.screenshot({ type: 'png' })); };
  await fn(b.page, shot);
  await b.browser.close();
}
/* the hint fades on its own; a shot is judged on the composition */
const settle = async (page) => { await sleep(3800); await waitFrames(page, 2); };

/* ---- the feel test the plan makes a hard stop: a loop and NO TRAINS ---- */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await tap(page, '#btnBuild');
    await waitFrames(page, 2);
    await tap(page, '#slotList .card');
    await waitFrames(page, 2);
    await page.evaluate(() => {
      WHISTLESTOP_TEST.buildOps([['at', 5.2, 2.6, 0], ['rep', 2, 'straight'], ['rep', 4, 'curveR'],
        ['rep', 2, 'straight'], ['rep', 4, 'curveR']]);
    });
    await settle(page);
    if (want('p1-loop')) await shot('p1-loop-' + tag);
  });
}

/* ---- the title, and the two lists ---- */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await waitFrames(page, 3);
    if (want('p3-title')) await shot('p3-title-' + tag);
    await tap(page, '#btnPuzzles');
    await waitFrames(page, 2);
    if (want('p3-puzzles')) await shot('p3-puzzles-' + tag);
    await tap(page, '#btnSelectBack');
    await tap(page, '#btnHow');
    await waitFrames(page, 2);
    if (want('p3-how')) await shot('p3-how-' + tag);
  });
}

/* ---- the first puzzle, before and after ---- */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await tap(page, '#btnPuzzles');
    await waitFrames(page, 2);
    await tap(page, '#puzzleList .card');
    await settle(page);
    if (want('p2-first')) await shot('p2-first-' + tag);
    const j = (await page.evaluate(() => WHISTLESTOP_TEST.junctions()))[0];
    await tapAt(page, R(j.screen.x), R(j.screen.y));
    await tap(page, '#btnWhistle');
    await page.evaluate(() => WHISTLESTOP_TEST.advance(1.5));
    await waitFrames(page, 3);
    if (want('p2-running')) await shot('p2-running-' + tag);
    await page.evaluate(() => WHISTLESTOP_TEST.advance(8));
    await waitFrames(page, 3);
    if (want('p2-stars')) await shot('p2-stars-' + tag);
  });
}

/* ---- the second puzzle, which is the game rather than the toy ---- */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => WHISTLESTOP_TEST.puzzle(1));
    await settle(page);
    if (want('p2-crossing')) await shot('p2-crossing-' + tag);
    /* the bump, which is the thing the puzzle is about */
    await page.evaluate(() => {
      const j = WHISTLESTOP_TEST.junctions().find(q => q.lever === 1);
      if (j) WHISTLESTOP_TEST.state().g.junctions[j.node].lever = 0;
    });
    await tap(page, '#btnWhistle');
    await page.evaluate(() => WHISTLESTOP_TEST.advance(4));
    await waitFrames(page, 3);
    if (want('p2-bump')) await shot('p2-bump-' + tag);
  });
}

/* ---- Swap, the sixth puzzle: two trains changing ends on a passing loop ---- */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => WHISTLESTOP_TEST.puzzle(5));
    await settle(page);
    if (want('p2-swap')) await shot('p2-swap-' + tag);
    /* the two flips the answer needs, and then the moment the two trains are
       abreast: one on the loop, one on the single line it was blocking */
    /* ⛔ THE ANSWER IS READ OFF THE PUZZLE, NOT TYPED IN HERE. These were the
       literals 2 and 11, and when Swap grew one tile between its lower two
       switches on 2026-09-07 every index past ten moved by one: piece 11 became
       a straight, `g.junctions[...]` came back undefined and the tool died with
       "Cannot set properties of undefined". A camera that hardcodes a puzzle's
       internals breaks the day the puzzle is edited, which is the day somebody
       most wants to look at it. */
    await page.evaluate(() => {
      const st = WHISTLESTOP_TEST.state(), g = st.g;
      const sol = st.puzzle.solution;
      for (const step of sol) g.junctions[g.pieces[step.piece].nodes[0]].lever = step.to;
    });
    await tap(page, '#btnWhistle');
    await page.evaluate(() => WHISTLESTOP_TEST.advance(4.7));
    await waitFrames(page, 3);
    if (want('p2-swap')) await shot('p2-swappass-' + tag);
  });
}

/* ---- the rug, built and running, at four phone sizes ---- */
for (const [w, h] of [[915, 412], [667, 375], [412, 915], [375, 667], [320, 568]]) {
  await withPage(w, h, async (page, shot) => {
    await tap(page, '#btnBuild');
    await waitFrames(page, 2);
    await tap(page, '#slotList .card');
    await waitFrames(page, 2);
    await page.evaluate(() => {
      WHISTLESTOP_TEST.buildOps([['at', 4.4, 2.6, 0], ['rep', 2, 'straight'], ['rep', 4, 'curveR'],
        ['rep', 2, 'straight'], ['rep', 4, 'curveR']]);
      const S = WHISTLESTOP_TEST.state();
      WHISTLESTOP_TEST.addTrain('red', S.g.edges[0].id, 10, 3);
      WHISTLESTOP_TEST.addTrain('blue', S.g.edges[6].id, 10, 2);
    });
    await tap(page, '#btnWhistle');
    await page.evaluate(() => WHISTLESTOP_TEST.advance(1.7));
    await settle(page);
    if (want('p3-size')) await shot('p3-' + w + 'x' + h);
  });
}

/* ---- a rug arriving by link, mid montage ---- */
await withPage(667, 375, async (page, shot) => {
  await tap(page, '#btnBuild');
  await waitFrames(page, 2);
  await tap(page, '#slotList .card');
  await waitFrames(page, 2);
  await page.evaluate(() => {
    WHISTLESTOP_TEST.buildOps([['at', 3.4, 2.6, 0], ['rep', 3, 'straight'], ['rep', 4, 'curveR'],
      ['rep', 3, 'straight'], ['rep', 4, 'curveR']]);
  });
  const link = await page.evaluate(() => WHISTLESTOP_TEST.link());
  await page.evaluate(h => WHISTLESTOP_TEST.importHash(h), link.slice(link.indexOf('#')));
  await sleep(1500);
  await waitFrames(page, 2);
  if (want('p3-arriving')) await shot('p3-arriving');
});

s.close();
console.log('shots done');
