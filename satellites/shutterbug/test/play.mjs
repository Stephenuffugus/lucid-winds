/* Browser gate `play` (BUILD-PLAN.md T0.8a, section 5.6).
 *
 * The sample room climbed to the clear card by REAL key events: the loop held (SB_DEV.hold(true)), and between key
 * downs and ups the sim advanced an exact number of steps with SB_DEV.step(n), each step sampling the real input
 * latch (the one way a real event maps to an exact step count under swiftshader's few frames a second). Then a real
 * touch on Again leaves nothing painted over the play area. Then one UNHELD check proves the real loop: with a key
 * held and the loop running, every step sampled the key, at most four steps ran in any frame, and the accumulator's
 * books balance (steps x 16.67 ms + what is owed + what stalls dropped = the frame time it was given).
 *
 * Watched red by CLEAR_NO_RESTART (Again leaves the card painted) and ACCUMULATOR_DT_FLOAT (the loop steps by the raw
 * frame delta). T0.8b extends this gate with the same climb by real touches on the strip. */
import { readFileSync } from 'node:fs';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, centre } from './harness.mjs';

const R = reporter('PLAY');
const climb = JSON.parse(readFileSync(new URL('./climb-sample-room.json', import.meta.url), 'utf8'));
const KEYS = { 1: 'ArrowLeft', 2: 'ArrowRight', 4: 'KeyZ' };
const srv = await serve();
const browser = await launch();

async function replayKeys(page, runs) {
  let down = 0;
  for (const [n, mask] of runs) {
    for (const bit of [1, 2, 4]) if ((down & bit) && !(mask & bit)) await page.keyboard.up(KEYS[bit]);
    for (const bit of [1, 2, 4]) if (!(down & bit) && (mask & bit)) await page.keyboard.down(KEYS[bit]);
    down = mask;
    await page.evaluate(n => window.SB_DEV.step(n), n);
  }
  for (const bit of [1, 2, 4]) if (down & bit) await page.keyboard.up(KEYS[bit]);
}

try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));      /* held before the room starts: no live step can slip in */
  await tap(page, '#sample');
  R.say(await page.evaluate(() => window.SB_DEV.screen()) === 'play', 'a real touch on "Try the sample room" opens the play screen');
  const f0 = await page.evaluate(() => window.SB_DEV.frames());
  await replayKeys(page, climb.runs);
  const total = climb.runs.reduce((a, r) => a + r[0], 0);
  const st = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), s: window.SB_DEV.state(), frames: window.SB_DEV.frames(), rec: window.SB_DEV.recording() }));
  R.say(st.frames - f0 === total, 'the held loop ran exactly the script\'s ' + total + ' steps (' + (st.frames - f0) + ')');
  R.say(st.s && st.s.room.cleared === 1, 'the climb by real key events reaches the lamp: the room is clear');
  R.say(st.screen === 'clear', 'the clear card is up (screen ' + st.screen + ')');
  const words = st.rec.reduce((a, r) => a + r[0], 0);
  R.say(words === total, 'the recorder kept one word per step (' + words + ')');
  const clearBox = await centre(page, '#clear');
  R.say(!!clearBox && clearBox.onTop, 'the clear card is painted and on top');
  await tap(page, '#again');
  const after = await page.evaluate(() => {
    const view = document.getElementById('view').getBoundingClientRect();
    const top = document.elementFromPoint(view.left + view.width / 2, view.top + view.height * 0.35);
    const card = getComputedStyle(document.getElementById('clear'));
    return { screen: window.SB_DEV.screen(), frame: window.SB_DEV.state().frame, onCanvas: top && top.id === 'view', cardShown: card.display !== 'none' };
  });
  R.say(after.screen === 'play' && after.frame === 0, 'a real touch on Again restarts the room (screen ' + after.screen + ', frame ' + after.frame + ')');
  R.say(!after.cardShown && after.onCanvas, 'Again leaves nothing painted over the play area');

  /* the unheld check: the real loop, a real key held */
  await page.evaluate(() => window.SB_DEV.hold(false));
  const a0 = await page.evaluate(() => ({ f: window.SB_DEV.frames(), loop: window.SB_DEV.perf().loop }));
  await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(f => window.SB_DEV.frames() >= f + 40, { timeout: 60000, polling: 20 }, a0.f);
  await page.keyboard.up('ArrowLeft');
  await page.evaluate(() => window.SB_DEV.hold(true));
  const a1 = await page.evaluate(() => ({ f: window.SB_DEV.frames(), loop: window.SB_DEV.perf().loop, rec: window.SB_DEV.recording() }));
  /* the books cover only the steps the accumulator ran (SB_DEV.step's steps are the held gate's, outside the clock) */
  const L = a1.loop, books = L.accSteps * L.stepMs + L.acc + L.dropped - L.consumed;
  R.say(L.accSteps >= 40 && Math.abs(books) < 0.01, 'the accumulator\'s books balance: ' + L.accSteps + ' steps x ' + L.stepMs.toFixed(3) + ' ms + owed + dropped = consumed (off by ' + books.toFixed(4) + ' ms over ' + L.raf + ' frames, ' + L.stalls + ' stalls)');
  R.say(L.maxSteps <= 4, 'never more than four steps in one frame (max ' + L.maxSteps + ')');
  const flat = a1.rec.flatMap(([n, w]) => Array(n).fill(w));
  const firstL = flat.findIndex(w => w & 1), lastL = flat.length - 1 - [...flat].reverse().findIndex(w => w & 1);
  const gaps = flat.slice(firstL, lastL + 1).filter(w => !(w & 1)).length;
  R.say(firstL >= 0 && lastL - firstL + 1 >= 39 && gaps === 0, 'with the key held every step sampled it (' + (lastL - firstL + 1) + ' steps, ' + gaps + ' missed)');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
