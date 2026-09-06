/* THE LAYOUT, MEASURED WHERE A THUMB LANDS.
 *
 *   node test/layout.mjs
 *
 * ⛔ RENDERED pixels at the sizes real phones are, and reachability proved with
 * elementFromPoint rather than by reading CSS. A 48 px rule checked against a
 * stylesheet is a 48 px rule checked against a hope.
 * ⛔ the bottom left 120 by 120 belongs to the fleet's music chip and nothing of
 * this game may be under it.
 */
import { serve, open, reporter, centre, waitFrames, tapAt } from './harness.mjs';

const site = await serve();
const { fails, say } = reporter();
const SIZES = [[412, 915, '412'], [375, 667, '375'], [320, 568, '320']];

for (const [W, H, tag] of SIZES) {
  const { browser, page, errors } = await open(site.base, { width: W, height: H, deviceScaleFactor: 1 });
  const T = (fn, ...a) => page.evaluate(fn, ...a);

  /* ---- the box screen ---- */
  for (const [sel, min] of [['#btnPunch', 56], ['#btnMenu', 48], ['#nameChip', 48]]) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= min - 0.5,
      tag + ': ' + sel + ' is ' + (c ? c.h.toFixed(0) : 0) + ' px and reachable (floor ' + min + ')');
  }
  const chip = await T(() => {
    const r = document.getElementById('btnPunch').getBoundingClientRect();
    const n = document.getElementById('nameChip').getBoundingClientRect();
    const m = document.getElementById('btnMenu').getBoundingClientRect();
    const H = window.innerHeight;
    const bad = [r, n, m].filter(b => b.left < 120 && b.bottom > H - 120);
    return bad.length;
  });
  say(chip === 0, tag + ': the bottom left 120 by 120 is left for the music chip');

  /* the crank has to be inside the screen and clear of the chrome */
  const hub = await T(() => {
    const h = window.WINDUP_TEST.layout().hub;
    return { x: h.x, y: h.y, r: h.r, W: window.innerWidth, H: window.innerHeight };
  });
  say(hub.x > 40 && hub.x < hub.W - 20 && hub.y > 80 && hub.y < hub.H - 60,
    tag + ': the crank is on the screen (' + hub.x.toFixed(0) + ',' + hub.y.toFixed(0) + ')');
  say(hub.x - 46 - 15 > 120 || hub.y + 46 + 15 < hub.H - 120,
    tag + ': and its handle never swings into the music chip');
  const onHub = await T((x, y) => {
    const e = document.elementFromPoint(x, y);
    return e ? e.id : null;
  }, Math.round(hub.x), Math.round(hub.y));
  say(onHub === 'stage', tag + ': and a thumb on the hub lands on the box, not on a button');

  /* ---- the punch screen ---- */
  await T(() => { document.getElementById('btnPunch').click(); window.WINDUP_TEST.setStrip([], 'L'); });
  await waitFrames(page, 3);
  for (const sel of ['#btnPlay', '#btnDice', '#btnClear', '#btnPunchDone']) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= 47.5,
      tag + ': ' + sel + ' is ' + (c ? c.h.toFixed(0) : 0) + ' px and reachable');
  }
  const P = await T(() => window.WINDUP_TEST.punchLayout());
  say(P.rowH >= 24, tag + ': a strip row is at least 24 px tall (' + P.rowH.toFixed(1) + ')');
  say(P.stepPx >= 22, tag + ': and an eighth is at least 22 px wide (' + P.stepPx.toFixed(1) + ')');

  /* ⛔ THE PART THAT MATTERS. A 24 px row is under the 48 px law, and the plan
     allows it only if a thumb that lands anywhere in the row punches THAT row.
     So: every row, tapped at its middle and near both its edges. */
  let wrong = 0, tested = 0;
  for (let row = 0; row < 15; row++) {
    for (const f of [0, 0.38, -0.38]) {
      const at = await T((row, f) => {
        const p = window.WINDUP_TEST.punchXY(3, row);
        const P = window.WINDUP_TEST.punchLayout();
        return { x: p.x, y: p.y + f * P.rowH };
      }, row, f);
      await tapAt(page, Math.round(at.x), Math.round(at.y));
      await waitFrames(page, 2);
      const holes = await T(() => window.WINDUP_TEST.strip().holes.slice());
      tested++;
      if (holes.length !== 1 || holes[0][1] !== row || holes[0][0] !== 3) wrong++;
      await T(() => window.WINDUP_TEST.setStrip([], 'L'));
    }
  }
  say(wrong === 0, tag + ': every one of the fifteen rows takes a tap at its middle and'
    + ' near both its edges and punches THAT row (' + (tested - wrong) + ' of ' + tested + ')');

  say(errors.length === 0, tag + ': nothing landed on the console'
    + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
