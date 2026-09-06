/* A DRAWING SENT DOWN A LINK.
 *
 *   node test/share.mjs
 *
 * ⛔ THE DRAWING IS ITS THROW LIST. This is the gate that means it: a sheet is
 * made in one browser, the link is opened in another that has never seen the
 * game, and the two pens are required to be in the same place at the same time
 * all the way through. Not the same picture by eye. The same numbers.
 */
import { serve, open, reporter, waitFrames, centre, tap } from './harness.mjs';

const site = await serve();
const { fails, say } = reporter();

/* ---- the sender ---- */
const A = await open(site.base, { width: 375, height: 667 });
const TA = (fn, ...a) => A.page.evaluate(fn, ...a);
let link = '', want = null;
try {
  await TA(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.throws.push(S.flingToThrow(sh, { x: 300, y: 220 }, { x: -480, y: 640 }, 0, 'indigo'));
    sh.throws.push(S.flingToThrow(sh, { x: -240, y: 180 }, { x: 520, y: 300 }, 9, 'oxblood'));
    window.INKSWING_TEST.loadSheet(sh);
    window.INKSWING_TEST.state().drawing = true;
    window.INKSWING_TEST.advance(20);
    window.INKSWING_TEST.state().drawing = false;
  });
  await waitFrames(A.page, 3);
  const shareBtn = await centre(A.page, '#btnShare');
  say(!!shareBtn && shareBtn.onTop && shareBtn.h >= 47.5,
    'SHARE is reachable once there is something to share (' + (shareBtn ? shareBtn.h.toFixed(0) : 0) + ' px)');
  link = await TA(() => window.INKSWING_TEST.shareLink());
  say(link.indexOf('#s=') > 0, 'a drawing makes a link (' + link.length + ' characters)');
  say(link.length < 400, 'and it is short enough to send in a message');
  want = await TA(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = window.INKSWING_TEST.sheet();
    const out = [];
    for (let t = 0; t <= 30; t += 0.5) { const p = S.posAt(sh, t); out.push([p.x, p.y]); }
    return { path: out, rig: sh.rig, lengths: sh.lengths, throws: sh.throws.length,
      inks: sh.throws.map(t => t.ink) };
  });
} finally {
  await A.browser.close();
}

/* ---- the recipient, in a browser that has never seen this game ---- */
const hash = link.slice(link.indexOf('#'));
const B = await open(site.base, { width: 375, height: 667, query: hash });
const TB = (fn, ...a) => B.page.evaluate(fn, ...a);
try {
  await waitFrames(B.page, 3);
  const got = await TB(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = window.INKSWING_TEST.sheet();
    const out = [];
    for (let t = 0; t <= 30; t += 0.5) { const p = S.posAt(sh, t); out.push([p.x, p.y]); }
    return { path: out, rig: sh.rig, lengths: sh.lengths, throws: sh.throws.length,
      inks: sh.throws.map(t => t.ink), screen: window.INKSWING_TEST.screen(),
      folio: window.INKSWING_TEST.folio().length, drawing: window.INKSWING_TEST.drawing() };
  });
  say(got.rig === want.rig, 'the rig came down the link (' + got.rig + ')');
  say(JSON.stringify(got.lengths) === JSON.stringify(want.lengths),
    'and the lengths (' + JSON.stringify(got.lengths) + ')');
  say(got.throws === want.throws, 'and both throws (' + got.throws + ')');
  say(JSON.stringify(got.inks) === JSON.stringify(want.inks),
    'and the inks they were thrown in (' + JSON.stringify(got.inks) + ')');
  /* ⛔ THE ASSERTION THE WHOLE FORMAT EXISTS FOR */
  let worst = 0;
  for (let i = 0; i < want.path.length; i++) {
    worst = Math.max(worst, Math.hypot(want.path[i][0] - got.path[i][0],
      want.path[i][1] - got.path[i][1]));
  }
  say(worst < 1.5, 'and the pen is in the same place at the same time, all the way through ('
    + worst.toFixed(3) + ' units of a thousand, at its worst over thirty seconds)');
  say(got.drawing, 'it opens as a drawing being made, not as a finished picture');
  say(got.folio === 0, 'and it is not on their shelf until they say so');

  /* the keep button */
  const keep = await centre(B.page, '#btnKeepMine');
  say(!!keep && keep.onTop && keep.h >= 55,
    'KEEP IN MY FOLIO is a 56 px target (' + (keep ? keep.h.toFixed(0) : 0) + ')');
  await tap(B.page, '#btnKeepMine');
  await waitFrames(B.page, 3);
  const kept = await TB(() => ({ folio: window.INKSWING_TEST.folio().length,
    rig: window.INKSWING_TEST.folio()[0] ? window.INKSWING_TEST.folio()[0].rig : '' }));
  say(kept.folio === 1 && kept.rig === want.rig, 'and keeping it puts it in the folio');
  await B.page.reload({ waitUntil: 'load' });
  await B.page.waitForFunction(() => window.INKSWING_TEST && window.INKSWING_TEST.frames() > 2, { timeout: 30000 });
  say((await TB(() => window.INKSWING_TEST.folio().length)) === 1, 'and it is still there after a reload');

  /* ⛔ a link is a stranger's text */
  const junk = await TB(() => window.INKSWING_TEST.openLink('#s=absolutely-not-a-drawing'));
  say(junk === false, 'rubbish in a link opens nothing');
  const empty = await TB(() => window.INKSWING_TEST.openLink('#s='));
  say(empty === false, 'and neither does an empty one');

  /* ---- the daily ratio ---- */
  const daily = await TB(() => {
    const a = window.INKSWING_TEST.dailyRig(1757116800000);
    const b = window.INKSWING_TEST.dailyRig(1757116800000 + 3600000);
    const c = window.INKSWING_TEST.dailyRig(1757116800000 + 86400000 * 3);
    return { a: a, b: b, c: c };
  });
  say(JSON.stringify(daily.a) === JSON.stringify(daily.b),
    'the ratio of the day is the same all day (' + JSON.stringify(daily.a) + ')');
  say(JSON.stringify(daily.a) !== JSON.stringify(daily.c), 'and a different one three days later');
  say(daily.a.lengths.every(l => l >= 0 && l <= 24) && !!daily.a.rig,
    'and it is always a rig with lengths that fit the sliders');

  say(B.errors.length === 0, 'no page errors' + (B.errors.length ? ': ' + B.errors.slice(0, 3).join(' | ') : ''));
} finally {
  await B.browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' SHARE FAILURE(S)'); process.exit(1); }
console.log('SHARE OK');
