/* The shots, from where the player stands.
   ⛔ the SHUTTER is gated by the filter, never the walk to the moment. */
import { serve, open, waitFrames, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const s = await serve();

async function withPage(w, h, fn) {
  const b = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  /* ⛔ the first boot hint is a three second toast and every shot was taken
     inside it, so every shot had "Grab the brass bob" written across the
     drawing. It is dismissed before the shutter, not suppressed in the game. */
  await b.page.evaluate(() => {
    /* ⛔ a MutationObserver that removes the class the observer watches is a
       loop that hung the render thread and timed the shot tool out. The hint is
       simply emptied and its element pushed off screen. */
    const h = document.getElementById('hint');
    h.textContent = '';
    h.classList.remove('on');
    h.style.display = 'none';
  });
  const save = async (name, buf) => {
    let out = buf;
    if (out.length > LIMIT) {
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
  };
  const shot = async (name) => { await save(name, await b.page.screenshot({ type: 'png' })); };
  await fn(b.page, shot, save);
  await b.browser.close();
}

/* ⛔ THE FEEL TEST. One thrown ellipse decaying into a spiral, at twenty seconds
   and at the end. If the line reads as a uniform vector stroke the width by
   speed and the wet edge are wrong. */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    const S = INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'single' });
    sh.throws.push(S.flingToThrow(sh, { x: 300, y: 140 }, { x: -520, y: 700 }, 0, 'irongall'));
    INKSWING_TEST.loadSheet(sh);
    INKSWING_TEST.state().drawing = true;
    INKSWING_TEST.advance(20);
    INKSWING_TEST.state().drawing = false;
  });
  await waitFrames(page, 3);
  if (want('p1-spiral')) await shot('p1-spiral');
  await page.evaluate(() => { INKSWING_TEST.finish(); });
  await waitFrames(page, 3);
  if (want('p1-done')) await shot('p1-done');
});

/* a 3:2 knot, mid draw, which is the picture the whole game is for */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    const S = INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.throws.push(S.flingToThrow(sh, { x: 320, y: 260 }, { x: -480, y: 620 }, 0, 'indigo'));
    INKSWING_TEST.loadSheet(sh);
    INKSWING_TEST.setInk('indigo');
    INKSWING_TEST.state().drawing = true;
    INKSWING_TEST.advance(26);
  });
  await waitFrames(page, 3);
  if (want('p2-knot')) await shot('p2-knot');
  /* and two inks laid over each other, which is what layering is for */
  await page.evaluate(() => {
    const S = INKSWING_TEST.sim();
    const sh = INKSWING_TEST.sheet();
    INKSWING_TEST.setInk('oxblood');
    sh.throws.push(S.flingToThrow(sh, { x: -280, y: 200 }, { x: 520, y: 380 }, 26, 'oxblood'));
    INKSWING_TEST.advance(30);
    INKSWING_TEST.state().drawing = false;
  });
  await waitFrames(page, 3);
  if (want('p2-layers')) await shot('p2-layers');
});
/* the rig screen with the sliders on C4 and G4 and the interval named */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    /* the rig screen is worth shooting with a PAIR on it, because the interval
       line is the thing it exists to say, and the pair is locked until three
       drawings are kept */
    const S = INKSWING_TEST.sim();
    for (let i = 0; i < 3; i++) INKSWING_TEST.save().folio.push({ rig: 'single', lengths: [12, 12], throws: [] });
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    INKSWING_TEST.loadSheet(sh);
    document.getElementById('rigChip').click();
  });
  await waitFrames(page, 3);
  if (want('p2-rig')) await shot('p2-rig');
});

/* sand: poured, and mid brush */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    const S = INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'gimbal', lengths: [12, 19], mode: 'sand' });
    sh.throws.push(S.flingToThrow(sh, { x: 300, y: 240 }, { x: -460, y: 600 }, 0, 'irongall'));
    INKSWING_TEST.loadSheet(sh);
    INKSWING_TEST.state().drawing = true;
    /* poured the way it is poured in play, a frame at a time */
    for (let i = 0; i < 320; i++) INKSWING_TEST.advance(0.05);
    INKSWING_TEST.state().drawing = false;
  });
  await waitFrames(page, 3);
  if (want('p3-sand')) await shot('p3-sand');
});
/* the poster, as a picture of a picture */
await withPage(375, 667, async (page, shot, save) => {
  const png = await page.evaluate(async () => {
    const S = INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.id = 3;
    sh.throws.push(S.flingToThrow(sh, { x: 320, y: 240 }, { x: -500, y: 660 }, 0, 'indigo'));
    sh.throws.push(S.flingToThrow(sh, { x: -260, y: 200 }, { x: 540, y: 320 }, 10, 'oxblood'));
    INKSWING_TEST.loadSheet(sh);
    INKSWING_TEST.save().name = 'Stephen';
    const big = INKSWING_TEST.poster('plate');
    /* down to something a person can look at in a folder */
    const cv = document.createElement('canvas');
    cv.width = 560; cv.height = 700;
    const c = cv.getContext('2d');
    c.drawImage(big, 0, 0, 560, 700);
    return cv.toDataURL('image/png').split(',')[1];
  });
  if (want('p3-poster')) await save('p3-poster', Buffer.from(png, 'base64'));
});
/* the three sizes the plan names */
for (const [w, h, tag] of [[412, 915, 'p3-412'], [375, 667, 'p3-375'], [320, 568, 'p3-320']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => {
      const S = INKSWING_TEST.sim();
      const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
      sh.throws.push(S.flingToThrow(sh, { x: 300, y: 230 }, { x: -470, y: 620 }, 0, 'indigo'));
      INKSWING_TEST.loadSheet(sh);
      INKSWING_TEST.setInk('indigo');
      INKSWING_TEST.state().drawing = true;
      INKSWING_TEST.advance(22);
    });
    await waitFrames(page, 3);
    if (want(tag)) await shot(tag);
  });
}

s.close();
console.log('shots done');
