/* The editor, driven by real pointers in both orientations.
   ⛔ nothing in here calls a handler. Every press is a PointerEvent at a point
   elementFromPoint agrees a thumb would land on. */
import { serve, open, reporter, waitFrames, sleep, tap, tapAt, centre, drag, dragEnd, pinch } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

for (const [W, H, tag] of [[667, 375, 'landscape'], [375, 667, 'portrait']]) {
  const { browser, page, errors } = await open(s.base, { width: W, height: H, deviceScaleFactor: 1 });
  await page.evaluate(() => DOOHICKEY_TEST.start(0));
  await waitFrames(page, 2);

  /* the tray is there and it counts */
  const tray = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('#tray .tile')];
    return tiles.map(t => ({ part: t.getAttribute('data-part'), n: t.querySelector('.n').textContent,
      r: t.getBoundingClientRect() })).map(o => ({ part: o.part, n: o.n, w: o.r.width, h: o.r.height }));
  });
  say(tray.length >= 2, tag + ': the tray has the level\'s parts in it (' + tray.map(t => t.part + ' x' + t.n).join(', ') + ')');
  say(tray.every(t => t.w >= 48 && t.h >= 48), tag + ': and every tile is a 48 px target ('
    + tray.map(t => t.w.toFixed(0) + 'x' + t.h.toFixed(0)).join(' ') + ')');

  /* ---- a real drag from the tray onto the sheet places a part on a cell ---- */
  const tile = await centre(page, '#tray .tile[data-part="plank"]');
  say(!!tile && tile.onTop, tag + ': the plank tile is reachable');
  const target = await page.evaluate(() => DOOHICKEY_TEST.toScreen(288, 168));
  await drag(page, Math.round(tile.x), Math.round(tile.y), Math.round(target.x), Math.round(target.y), 10);
  await dragEnd(page, Math.round(target.x), Math.round(target.y));
  await waitFrames(page, 2);
  const placed = await page.evaluate(() => DOOHICKEY_TEST.parts());
  say(placed.length === 1 && placed[0].type === 'plank', tag + ': a drag from the tray places a plank ('
    + placed.length + ' parts)');
  if (placed.length) {
    say(placed[0].x % 24 === 0 && placed[0].y % 24 === 0, tag + ': and its centre is on a cell ('
      + placed[0].x + ',' + placed[0].y + ')');
  }
  const left = await page.evaluate(() => DOOHICKEY_TEST.trayLeft('plank'));
  say(left === 2, tag + ': and the tray count went down (' + left + ' of 3 left)');

  /* ---- the handles are 48 px and ABOVE the part ---- */
  const sel = await page.evaluate(() => DOOHICKEY_TEST.select());
  say(sel === 0, tag + ': the part it placed is the selected one');
  const rot = await centre(page, '#hRot');
  say(!!rot && rot.w >= 48 && rot.h >= 48 && rot.onTop, tag + ': the turn handle is a 48 px target on top');
  const partPt = await page.evaluate(() => {
    const p = DOOHICKEY_TEST.parts()[0];
    return DOOHICKEY_TEST.toScreen(p.x, p.y);
  });
  say(!!rot && rot.y < partPt.y - 30, tag + ': and the handles sit above the part, not under the thumb ('
    + (rot ? (partPt.y - rot.y).toFixed(0) : '?') + ' px above)');

  /* a real tap on the turn handle moves it exactly one detent */
  const before = await page.evaluate(() => DOOHICKEY_TEST.parts()[0].rot);
  await tap(page, '#hRot');
  await waitFrames(page, 2);
  const after = await page.evaluate(() => DOOHICKEY_TEST.parts()[0].rot);
  const detent = await page.evaluate(() => 15 * Math.PI / 180);
  say(Math.abs((after - before) - detent) < 1e-6, tag + ': a tap on the dial turns it one detent ('
    + ((after - before) / detent).toFixed(2) + ' detents)');

  /* ---- a drag onto an occupied cell shows the red ghost and places nothing ---- */
  const tile2 = await centre(page, '#tray .tile[data-part="plank"]');
  await drag(page, Math.round(tile2.x), Math.round(tile2.y), Math.round(target.x), Math.round(target.y), 10);
  const ghost = await page.evaluate(() => {
    const g = DOOHICKEY_TEST.ghost();
    return g ? { ok: g.ok, type: g.type } : null;
  });
  say(!!ghost && ghost.ok === false, tag + ': dropping onto an occupied cell shows the red ghost');
  await dragEnd(page, Math.round(target.x), Math.round(target.y));
  await waitFrames(page, 2);
  const after2 = await page.evaluate(() => DOOHICKEY_TEST.parts().length);
  say(after2 === 1, tag + ': and it places nothing (' + after2 + ' parts)');

  /* ---- undo takes back the LAST thing done, one step at a time ---- */
  await tap(page, '#btnUndo');
  await waitFrames(page, 2);
  const un1 = await page.evaluate(() => DOOHICKEY_TEST.parts());
  say(un1.length === 1 && Math.abs(un1[0].rot - before) < 1e-9,
    tag + ': one undo takes back the turn and leaves the part (' + un1.length + ' parts, rot '
    + (un1.length ? (un1[0].rot / (Math.PI / 12)).toFixed(2) : '?') + ' detents)');
  await tap(page, '#btnUndo');
  await waitFrames(page, 2);
  const un2 = await page.evaluate(() => DOOHICKEY_TEST.parts().length);
  say(un2 === 0, tag + ': and a second undo takes back the placement (' + un2 + ')');
  const trayBack = await page.evaluate(() => DOOHICKEY_TEST.trayLeft('plank'));
  say(trayBack === 3, tag + ': and the tray has it again (' + trayBack + ' of 3)');
  await tap(page, '#btnRedo');
  await tap(page, '#btnRedo');
  await waitFrames(page, 2);
  const redone = await page.evaluate(() => DOOHICKEY_TEST.parts());
  say(redone.length === 1, tag + ': and two redos bring it back (' + redone.length + ')');
  say(redone.length === 1 && Math.abs(redone[0].rot - after) < 1e-9,
    tag + ': with the turn it had');

  /* ---- dragging a placed part off the sheet returns it to the tray ---- */
  const here = await page.evaluate(() => {
    const p = DOOHICKEY_TEST.parts()[0];
    return DOOHICKEY_TEST.toScreen(p.x, p.y);
  });
  const off = await page.evaluate(() => DOOHICKEY_TEST.toScreen(-70, 216));
  await drag(page, Math.round(here.x), Math.round(here.y), Math.round(off.x), Math.round(off.y), 12);
  await dragEnd(page, Math.round(off.x), Math.round(off.y));
  await waitFrames(page, 2);
  const gone = await page.evaluate(() => ({ n: DOOHICKEY_TEST.parts().length, left: DOOHICKEY_TEST.trayLeft('plank') }));
  say(gone.n === 0 && gone.left === 3, tag + ': dragging a part off the sheet puts it back in the tray ('
    + gone.n + ' placed, ' + gone.left + ' in the tray)');

  /* ---- two fingers spreading zoom the view ---- */
  const z0 = await page.evaluate(() => DOOHICKEY_TEST.view().zoom);
  await pinch(page, Math.round(W / 2), Math.round(H / 2), 60, 220, 10);
  await waitFrames(page, 2);
  const z1 = await page.evaluate(() => DOOHICKEY_TEST.view().zoom);
  say(z1 > z0 * 1.4, tag + ': two fingers spreading zoom in (' + z0.toFixed(2) + ' to ' + z1.toFixed(2) + ')');
  await pinch(page, Math.round(W / 2), Math.round(H / 2), 220, 60, 10);
  await waitFrames(page, 2);
  const z2 = await page.evaluate(() => DOOHICKEY_TEST.view().zoom);
  say(z2 < z1 * 0.8, tag + ': and closing them zooms back out (' + z2.toFixed(2) + ')');

  /* ---- GO copies the machine, so a run can never edit the board ---- */
  await page.evaluate(() => { DOOHICKEY_TEST.solution(); });
  await waitFrames(page, 2);
  const beforeRun = await page.evaluate(() => JSON.stringify(DOOHICKEY_TEST.parts()));
  const goBtn = await centre(page, '#btnGo');
  say(!!goBtn && goBtn.h >= 56 && goBtn.onTop, tag + ': GO is a 56 px target on top');
  await tap(page, '#btnGo');
  await page.evaluate(() => DOOHICKEY_TEST.advance(1.4));
  await waitFrames(page, 2);
  const running = await page.evaluate(() => DOOHICKEY_TEST.state().running);
  say(running, tag + ': GO starts the run');
  const stopBtn = await centre(page, '#btnStop');
  say(!!stopBtn && stopBtn.h >= 56 && stopBtn.onTop, tag + ': STOP is a 56 px target on top');
  await tap(page, '#btnStop');
  await waitFrames(page, 2);
  const afterRun = await page.evaluate(() => JSON.stringify(DOOHICKEY_TEST.parts()));
  say(afterRun === beforeRun, tag + ': and stopping leaves the machine exactly as it was');
  say(!(await page.evaluate(() => DOOHICKEY_TEST.state().running)), tag + ': and the run is over');

  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
if (fails.length) { console.log('\n' + fails.length + ' EDIT FAILURE(S)'); process.exit(1); }
console.log('\nEDIT OK');
