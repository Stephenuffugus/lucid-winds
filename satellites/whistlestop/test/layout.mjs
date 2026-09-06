/* Every screen the player can open, at five phone sizes, measured in RENDERED
   pixels with elementFromPoint.
   ⛔ A 48 px CSS rule is not a 48 px target: this measures rectangles.
   ⛔⛔ THE INKSWING SCAR, WHICH IS WHY THIS GATE IS SHAPED THE WAY IT IS.
   A gate that measures a hidden element measures nothing AND REPORTS PASS.
   Inkswing's layout gate checked that no button sat on the paper, over four
   buttons every one of which is hidden until a sheet has a drawing on it, so
   it filtered an empty list for its whole life and went green while UNDO sat
   on the drawing. Every group below is therefore counted FIRST: the gate says
   how many controls it expects on that screen, fails if the number is wrong,
   and only then measures them. If a screen is not open, its controls are not
   measured and the count says so.
   ⛔ The bottom left 120 by 120 belongs to the fleet music chip and nothing of
   ours may sit in it while the player is building. */
import { serve, open, reporter, waitFrames, tap, tapAt, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);
const SIZES = [[667, 375], [915, 412], [375, 667], [320, 568], [412, 915]];

/* measure a named group of controls: it must be there, all of it, showing */
async function group(page, at, what, sel, want, minH) {
  const got = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map(e => {
    if (e.scrollIntoView) e.scrollIntoView({ block: 'center', inline: 'center' });
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return { id: e.id || e.className, w: 0, h: 0, on: false, shown: false };
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { id: e.id || e.className, w: r.width, h: r.height, shown: true,
      on: !!t && (t === e || e.contains(t)) };
  }), sel);
  say(got.length === want, at + ' ' + what + ': all ' + want + ' of them are on the screen ('
    + got.length + ')');
  if (got.length !== want) return;
  say(got.every(g => g.shown), at + ' ' + what + ': and every one is actually drawn');
  say(got.every(g => g.w >= 48 && g.h >= (minH || 48)), at + ' ' + what + ': and every one is a '
    + (minH || 48) + ' px target (' + got.map(g => g.w.toFixed(0) + 'x' + g.h.toFixed(0)).join(' ') + ')');
  say(got.every(g => g.on), at + ' ' + what + ': and nothing is sitting on top of any of them ('
    + got.filter(g => !g.on).map(g => g.id).join(', ') + ')');
}

for (const [w, h] of SIZES) {
  const { browser, page, errors } = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  const at = w + 'x' + h;
  await waitFrames(page, 2);

  /* ---- the title ---- */
  await group(page, at, 'the title', '#scrTitle .btn', 3);
  const big = await centre(page, '#btnBuild');
  say(!!big && big.h >= 56, at + ' the title: BUILD is the big one (' + (big ? big.h.toFixed(0) : '?') + ' px)');

  /* ---- how to play ---- */
  await tap(page, '#btnHow');
  await waitFrames(page, 2);
  await group(page, at, 'how to play', '#scrHow .btn', 1);
  const lines = await page.evaluate(() => [...document.querySelectorAll('#scrHow .lede')].length);
  say(lines === 3, at + ' how to play: three lines and no more (' + lines + ')');
  await tap(page, '#btnHowBack');
  await waitFrames(page, 2);

  /* ---- the puzzle list ---- */
  await tap(page, '#btnPuzzles');
  await waitFrames(page, 2);
  await group(page, at, 'the puzzle list', '#puzzleList .card', 2, 64);
  await group(page, at, 'the puzzle list', '#scrSelect .btn.ghost', 1);

  /* ---- a puzzle, being played ---- */
  await tap(page, '#puzzleList .card');
  await waitFrames(page, 3);
  say((await page.evaluate(() => WHISTLESTOP_TEST.screen())) === 'Play', at + ' a puzzle opens');
  await group(page, at, 'the puzzle screen', '#chrome > .btn:not([hidden])', 3);
  const goal = await page.evaluate(() => {
    const g = document.getElementById('goalLine');
    const r = g.getBoundingClientRect();
    return { hidden: g.hidden, w: r.width, h: r.height, text: g.textContent.length };
  });
  say(!goal.hidden && goal.w > 100 && goal.text > 20, at + ' the puzzle screen: the goal is written on it ('
    + goal.text + ' characters)');

  /* ---- the win card, reached by actually winning ---- */
  await page.evaluate(() => {
    const j = WHISTLESTOP_TEST.junctions()[0];
    return j;
  });
  const j0 = (await page.evaluate(() => WHISTLESTOP_TEST.junctions()))[0];
  await tapAt(page, R(j0.screen.x), R(j0.screen.y));
  await waitFrames(page, 2);
  await tap(page, '#btnWhistle');
  await page.evaluate(() => WHISTLESTOP_TEST.advance(8));
  await waitFrames(page, 2);
  const won = await page.evaluate(() => !!WHISTLESTOP_TEST.result());
  say(won, at + ' one flip and the whistle wins the first puzzle');
  if (won) {
    await group(page, at, 'the win card', '#winCard .btn', 3);
    const next = await centre(page, '#btnNext');
    say(!!next && next.h >= 56, at + ' the win card: NEXT is the big one (' + (next ? next.h.toFixed(0) : '?') + ')');
    await tap(page, '#btnWinMenu');
    await waitFrames(page, 2);
  }

  /* ---- building ---- */
  await tap(page, '#btnSelectBack');
  await waitFrames(page, 2);
  await tap(page, '#btnBuild');
  await waitFrames(page, 2);
  await group(page, at, 'the rug list', '#slotList .card', 3, 64);
  await tap(page, '#slotList .card');
  await waitFrames(page, 3);
  await page.evaluate(() => WHISTLESTOP_TEST.buildOps([['at', 4, 4, 0], ['rep', 3, 'straight'], ['p', 'yR']]));
  await waitFrames(page, 3);
  await group(page, at, 'the build screen', '#chrome > .btn:not([hidden])', 5);
  await group(page, at, 'the tray', '#tray .tile', 7);

  /* the handles, only once a piece is really selected */
  const mid = await page.evaluate(() => WHISTLESTOP_TEST.pieceMidScreen(1));
  await tapAt(page, R(mid.x), R(mid.y));
  await waitFrames(page, 2);
  const sel = await page.evaluate(() => WHISTLESTOP_TEST.select());
  say(sel >= 0, at + ' a piece can be picked up so the handles exist to measure (' + sel + ')');
  if (sel >= 0) {
    await group(page, at, 'the handles', '#handles .btn', 3);
    const hb = await page.evaluate(() => WHISTLESTOP_TEST.handleBox());
    say(hb.left >= -1 && hb.top >= -1 && hb.right <= w + 1 && hb.bottom <= h + 1,
      at + ' the handles stay on the screen (' + [hb.left, hb.top, hb.right, hb.bottom].map(R).join(',') + ')');
  }

  /* ⛔ the music chip's corner, while the player is building, which is the
     busiest this screen ever gets */
  const corner = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('#chrome .btn, #tray .tile, #handles .btn')) {
      const r = e.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push(e.id || e.getAttribute('data-piece') || e.className);
    }
    return out;
  });
  say(corner.length === 0, at + ' the bottom left 120 by 120 is empty while building'
    + (corner.length ? ': ' + corner.join(', ') : ''));

  /* ---- the two sheets ---- */
  await tap(page, '#btnTrains');
  await waitFrames(page, 2);
  await group(page, at, 'the train tray', '#engineRow .btn', 4);
  await group(page, at, 'the train tray', '#carsRow .btn', 2);
  await tap(page, '#btnTrainClose');
  await waitFrames(page, 2);
  await tap(page, '#btnMenu');
  await waitFrames(page, 2);
  await group(page, at, 'the menu', '#scrMenu .btn', 7);
  const brand = await page.evaluate(() => document.querySelector('#scrMenu .tiny').textContent.trim());
  say(brand === 'Sky Wolf Studio', at + ' the menu says who made it (' + brand + ')');
  await tap(page, '#btnMenuClose');
  await waitFrames(page, 2);

  /* ---- and the page itself ---- */
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  say(wide <= 1, at + ' the page does not scroll sideways (' + wide + ' px over)');
  const minFont = await page.evaluate(() => {
    let m = 99, worst = '';
    for (const e of document.querySelectorAll('.btn, .card, .tag, .lede, .tiny, .cap, #goalLine, #hint, #toast')) {
      const r = e.getBoundingClientRect();
      if (r.width < 1) continue;
      const f = parseFloat(getComputedStyle(e).fontSize);
      if (f < m) { m = f; worst = e.id || e.className; }
    }
    return { m, worst };
  });
  say(minFont.m >= 11.2, at + ' nothing on screen is under 0.7 rem (' + minFont.m.toFixed(1)
    + ' px on ' + minFont.worst + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('\nLAYOUT OK');
