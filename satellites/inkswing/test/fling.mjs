/* THE THROW, MADE BY A REAL FINGER.
 *
 *   node test/fling.mjs
 *
 * ⛔ THE DRAWING IS ITS THROW LIST, and this is the gate that holds it there. A
 * pointer goes down on the bob, drags it away, and lets go MOVING; what the game
 * makes of that is measured, and then the ink that appears on the sheet is
 * counted off the layers themselves rather than taken on trust.
 */
import { serve, open, reporter, waitFrames, centre, tap } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

/* a real drag: down on the bob, a run of moves, and a release that is still
   moving. The last samples are twelve pixels apart so the release window has a
   velocity in it. */
async function fling(dx, dy, steps = 9) {
  const at = await T(() => window.INKSWING_TEST.penScreen());
  const put = (type, x, y) => T((type, x, y) => {
    const el = document.getElementById('stage');
    el.dispatchEvent(new PointerEvent(type, { pointerId: 31, pointerType: 'touch',
      isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, type, x, y);
  await put('pointerdown', at.x, at.y);
  for (let i = 1; i <= steps; i++) {
    await put('pointermove', at.x + dx * i / steps, at.y + dy * i / steps);
  }
  await put('pointerup', at.x + dx, at.y + dy);
  return at;
}

try {
  const bob = await T(() => window.INKSWING_TEST.penScreen());
  const onBob = await T((x, y) => {
    const e = document.elementFromPoint(x, y);
    return e ? e.id : null;
  }, Math.round(bob.x), Math.round(bob.y));
  say(onBob === 'stage', 'the bob is on the sheet and nothing is on top of it (' + onBob + ')');
  const vp = await T(() => ({ w: window.innerWidth, h: window.innerHeight }));
  say(bob.x > 40 && bob.x < vp.w - 40 && bob.y > 60 && bob.y < vp.h - 60,
    'and it is on the screen where a thumb can reach it ('
    + bob.x.toFixed(0) + ',' + bob.y.toFixed(0) + ')');

  /* ---- one throw ---- */
  say((await T(() => window.INKSWING_TEST.sheet().throws.length)) === 0, 'the sheet starts empty');
  await fling(-64, 64);
  await waitFrames(page, 3);
  const one = await T(() => ({ n: window.INKSWING_TEST.sheet().throws.length,
    A: window.INKSWING_TEST.sheet().throws.length ? window.INKSWING_TEST.sheet().throws[0].pend[0].A : 0,
    drawing: window.INKSWING_TEST.drawing() }));
  say(one.n === 1, 'a drag on the bob and a release is one throw (' + one.n + ')');
  say(Math.abs(one.A) > 80, 'and it is a real swing (' + Math.abs(one.A).toFixed(0) + ' units)');
  say(one.drawing, 'and the pen is down');

  /* ---- and the ink appears ---- */
  const before = await T(() => window.INKSWING_TEST.inked());
  await T(() => window.INKSWING_TEST.advance(3));
  await waitFrames(page, 3);
  const after = await T(() => window.INKSWING_TEST.inked());
  say(after > before, 'three seconds of swinging puts ink on the paper ('
    + before + ' to ' + after + ' inked pixels)');
  const frac = await T(() => window.INKSWING_TEST.inkedFraction());
  say(frac > 0.001, 'and it is a drawing, not a dot (' + (frac * 100).toFixed(3)
    + ' percent of the sheet has ink on it, about ' + after + ' pixels)');
  const grew = await T(() => {
    const a = window.INKSWING_TEST.inked();
    window.INKSWING_TEST.advance(3);
    return { a: a, b: window.INKSWING_TEST.inked() };
  });
  say(grew.b > grew.a, 'and it keeps growing while the pendulum keeps swinging ('
    + grew.a + ' to ' + grew.b + ')');

  /* ⛔ THE PEN IS WHERE THE MATHS SAYS IT IS, not wherever the drawing ended up */
  const agree = await T(() => {
    const S = window.INKSWING_TEST.sim();
    const p = S.posAt(window.INKSWING_TEST.sheet(), window.INKSWING_TEST.t());
    const pen = window.INKSWING_TEST.pen();
    return Math.hypot(p.x - pen.x, p.y - pen.y);
  });
  say(agree < 1e-9, 'the bob is exactly where the closed form puts it (' + agree.toExponential(1) + ')');

  /* ---- a second ink is a second layer, and UNDO takes it off ---- */
  say((await T(() => window.INKSWING_TEST.layers())) === 1, 'one ink is one layer');
  await tap(page, '#ink-oxblood');
  await waitFrames(page, 2);
  say((await T(() => window.INKSWING_TEST.ink())) === 'oxblood', 'the ink rail changes the ink');
  await T(() => { window.INKSWING_TEST.state().drawing = false; });
  await fling(70, -50);
  await waitFrames(page, 3);
  await T(() => window.INKSWING_TEST.advance(3));
  await waitFrames(page, 3);
  const two = await T(() => ({ layers: window.INKSWING_TEST.layers(),
    throws: window.INKSWING_TEST.sheet().throws.length }));
  say(two.throws === 2, 'a second fling is a second throw (' + two.throws + ')');
  say(two.layers === 2, 'in a second ink, on its own layer (' + two.layers + ')');
  /* the buttons appear when the pen stops, so stop it first and then measure */
  await T(() => { window.INKSWING_TEST.state().drawing = false; });
  await waitFrames(page, 3);
  const undoBtn = await centre(page, '#btnUndo');
  say(!!undoBtn && undoBtn.onTop && undoBtn.h >= 47.5,
    'UNDO is a 48 px target (' + (undoBtn ? undoBtn.h.toFixed(0) : 0) + ')');
  await tap(page, '#btnUndo');
  await waitFrames(page, 3);
  const undone = await T(() => ({ layers: window.INKSWING_TEST.layers(),
    throws: window.INKSWING_TEST.sheet().throws.length, inked: window.INKSWING_TEST.inked() }));
  say(undone.layers === 1, 'UNDO takes the last ink off (' + undone.layers + ' layers)');
  say(undone.throws === 1, 'and its throw with it (' + undone.throws + ')');
  const backFrac = await T(() => window.INKSWING_TEST.inkedFraction());
  say(backFrac > 0.001, 'and leaves the first drawing alone (' + (backFrac * 100).toFixed(3)
    + ' percent of the sheet still inked)');

  /* ---- tear off ---- */
  const idBefore = await T(() => window.INKSWING_TEST.sheet().id);
  await tap(page, '#btnTear');
  await waitFrames(page, 2);
  await tap(page, '#btnTear');
  await waitFrames(page, 3);
  const torn = await T(() => ({ throws: window.INKSWING_TEST.sheet().throws.length,
    inked: window.INKSWING_TEST.inked(), layers: window.INKSWING_TEST.layers(),
    id: window.INKSWING_TEST.sheet().id, t: window.INKSWING_TEST.t() }));
  say(torn.throws === 0 && torn.layers === 0, 'TEAR OFF leaves a blank sheet');
  say(torn.inked === 0, 'with no ink on it (' + torn.inked + ')');
  say(torn.t === 0, 'and the clock back at nought');
  say(torn.id !== idBefore, 'and it is a new sheet (' + idBefore + ' to ' + torn.id + ')');
  /* ⛔ and a tear off takes TWO presses. A drawing somebody spent a minute on
     must not be one tap from gone. */
  await fling(-60, 60);
  await waitFrames(page, 2);
  await T(() => window.INKSWING_TEST.advance(2));
  await tap(page, '#btnTear');
  await waitFrames(page, 2);
  say((await T(() => window.INKSWING_TEST.sheet().throws.length)) === 1,
    'one press on TEAR OFF only asks the question');

  /* ---- SAND: poured, piled, and tipped off ---- */
  await T(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'single', mode: 'sand' });
    sh.throws.push(S.flingToThrow(sh, { x: 300, y: 200 }, { x: -460, y: 620 }, 0, 'irongall'));
    window.INKSWING_TEST.loadSheet(sh);
    window.INKSWING_TEST.state().drawing = true;
    window.INKSWING_TEST.advance(4);
  });
  await waitFrames(page, 3);
  const sand = await T(() => ({ s: window.INKSWING_TEST.sand(),
    inked: window.INKSWING_TEST.inkedFraction() }));
  say(sand.s.live > 200, 'sand mode pours real grains that are still loose ('
    + sand.s.live + ' of them)');
  await T(() => { window.INKSWING_TEST.advance(20); });
  await waitFrames(page, 3);
  const piled = await T(() => ({ s: window.INKSWING_TEST.sand(),
    inked: window.INKSWING_TEST.inkedFraction() }));
  say(piled.s.live <= 2500, 'and it never carries more than a few thousand loose at once ('
    + piled.s.live + ')');
  say(piled.inked > 0.0005, 'while the older ones are baked into the tray ('
    + (piled.inked * 100).toFixed(3) + ' percent of it)');
  /* ⛔ TILT ONLY EVER MOVES SAND. Ink is permanent and that contrast is the
     point of having two materials. */
  /* ⛔ measured as the grains MOVING, not as them leaving: one tilt at thirty two
     milliseconds slides a grain about ten units on a sheet twelve hundred deep,
     so counting what fell off the edge measures nothing. */
  const beforeTip = await T(() => window.INKSWING_TEST.sand());
  await T(() => {
    window.INKSWING_TEST.settings().tilt = 1;
    for (let i = 0; i < 12; i++) window.INKSWING_TEST.tilt(30, 0);
  });
  await waitFrames(page, 2);
  const tipped = await T(() => window.INKSWING_TEST.sand());
  say(tipped.cy > beforeTip.cy + 20,
    'tipping the phone slides the loose grains down it (centre of the sand from '
    + beforeTip.cy.toFixed(0) + ' to ' + tipped.cy.toFixed(0) + ')');
  /* ⛔ the pen has to have STOPPED first, or the tray fills up again behind the
     brush, which is correct behaviour and made this assertion look broken. */
  await T(() => { window.INKSWING_TEST.state().drawing = false; window.INKSWING_TEST.brush(); });
  /* ⛔ AND IT HAS TO SLIDE, not just vanish. A brush that clears the tray on a
     timer without moving anything passes "the tray is clean" perfectly. */
  await waitFrames(page, 4);
  const midBrush = await T(() => window.INKSWING_TEST.sand());
  say(midBrush.live === 0 || midBrush.cy > tipped.cy,
    'the brush is sweeping the sand down the tray, not just deleting it (centre '
    + tipped.cy.toFixed(0) + ' to ' + midBrush.cy.toFixed(0) + ')');
  for (let i = 0; i < 120 && (await T(() => window.INKSWING_TEST.sand().brushing)); i++) {
    await waitFrames(page, 3);
  }
  const brushed = await T(() => ({ s: window.INKSWING_TEST.sand(),
    inked: window.INKSWING_TEST.inkedFraction() }));
  say(brushed.s.live === 0 && brushed.inked < 0.0001,
    'and the brush takes the whole tray back to felt (' + brushed.s.live + ' grains, '
    + (brushed.inked * 100).toFixed(4) + ' percent)');
  /* and back in ink, a tilt does nothing at all */
  await T(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'single', mode: 'ink' });
    sh.throws.push(S.flingToThrow(sh, { x: 300, y: 200 }, { x: -460, y: 620 }, 0, 'irongall'));
    window.INKSWING_TEST.loadSheet(sh);
    window.INKSWING_TEST.state().drawing = true;
    window.INKSWING_TEST.advance(8);
    window.INKSWING_TEST.state().drawing = false;
  });
  await waitFrames(page, 3);
  const inkBefore = await T(() => window.INKSWING_TEST.inkedFraction());
  await T(() => { window.INKSWING_TEST.tilt(40, 40); window.INKSWING_TEST.tilt(40, 40); });
  await waitFrames(page, 3);
  const inkAfter = await T(() => window.INKSWING_TEST.inkedFraction());
  say(inkBefore > 0.0005 && Math.abs(inkAfter - inkBefore) < 1e-9,
    'ink does not pour off when the phone is tipped (' + (inkBefore * 100).toFixed(3)
    + ' percent before and after)');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' FLING FAILURE(S)'); process.exit(1); }
console.log('FLING OK');
