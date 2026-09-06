/* Building a railway with a thumb, in both orientations.
   ⛔ NOTHING IN HERE CALLS A HANDLER. Every piece is dragged out of the tray by
   a real pointer press at a point elementFromPoint agrees a thumb would land
   on, and dropped at the open end a player would aim for.
   ⛔ Every assertion measures the GAME, not the gate: the loop is counted off
   the graph, the chime is read out of the log of sounds the game actually
   played, and the tray count is read off the DOM.
   Watched to fail: by setting SNAP_DIST to nothing (no loop), by dropping the
   eighth curve one unit short (no chime), by making undo a no op, and by
   deleting the pinch handler. */
import { serve, open, reporter, waitFrames, tap, tapAt, centre, drag, dragEnd, pinch } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);

for (const [W, H, tag] of [[667, 375, 'landscape'], [375, 667, 'portrait']]) {
  const { browser, page, errors } = await open(s.base, { width: W, height: H, deviceScaleFactor: 1 });
  await waitFrames(page, 2);
  /* a real thumb: title, BUILD, the first rug */
  await tap(page, '#btnBuild');
  await waitFrames(page, 2);
  await tap(page, '#slotList .card');
  await waitFrames(page, 3);
  say((await page.evaluate(() => WHISTLESTOP_TEST.screen())) === 'Play',
    tag + ': two taps from the title reach an empty rug');

  const tiles = await page.evaluate(() => [...document.querySelectorAll('#tray .tile')].map(t => {
    const r = t.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { piece: t.getAttribute('data-piece'), w: r.width, h: r.height, on: top === t || t.contains(top) };
  }));
  say(tiles.length === 7, tag + ': the tray holds the whole wooden vocabulary (' + tiles.length + ')');
  say(tiles.every(t => t.w >= 48 && t.h >= 48), tag + ': and every tile is a 48 px target ('
    + tiles.map(t => t.w.toFixed(0)).join(' ') + ')');
  say(tiles.every(t => t.on), tag + ': and none of them is covered ('
    + tiles.filter(t => !t.on).map(t => t.piece).join(', ') + ')');

  /* ---- eight real drags of the curve tile make one closed ring ---- */
  const curve = await centre(page, '#tray .tile[data-piece="curveR"]');
  say(!!curve && curve.onTop, tag + ': the curve tile is reachable');
  await page.evaluate(() => WHISTLESTOP_TEST.clearEvents());
  for (let i = 0; i < 8; i++) {
    /* where a player would aim: the open end of what is already down. The
       first piece has nothing to aim at, so it goes in the middle. */
    const to = await page.evaluate(() => {
      const ends = WHISTLESTOP_TEST.openEnds();
      if (!ends.length) { const v = WHISTLESTOP_TEST.view(); return { x: v.w * 0.42, y: v.h * 0.34 }; }
      const last = ends.reduce((a, b) => (b.piece >= a.piece ? b : a));
      return last.screen;
    });
    const tile = await centre(page, '#tray .tile[data-piece="curveR"]');
    await drag(page, R(tile.x), R(tile.y), R(to.x), R(to.y), 9);
    await dragEnd(page, R(to.x), R(to.y));
    await waitFrames(page, 2);
    const n = await page.evaluate(() => WHISTLESTOP_TEST.pieces().length);
    if (n !== i + 1) { say(false, tag + ': drag ' + (i + 1) + ' of eight put a curve down (' + n + ' on the rug)'); break; }
  }
  const built = await page.evaluate(() => ({
    pieces: WHISTLESTOP_TEST.pieces().length,
    loops: WHISTLESTOP_TEST.loops(),
    parts: WHISTLESTOP_TEST.components(),
    open: WHISTLESTOP_TEST.openEnds().length,
    heard: WHISTLESTOP_TEST.events()
  }));
  say(built.pieces === 8, tag + ': eight drags put eight curves on the rug (' + built.pieces + ')');
  say(built.loops === 1, tag + ': and they close into one ring (' + built.loops + ' loops)');
  say(built.parts === 1, tag + ': which is one railway (' + built.parts + ')');
  say(built.open === 0, tag + ': with no open end left (' + built.open + ')');
  say(built.heard.filter(e => e === 'klk').length >= 7, tag + ': every snap made the klk ('
    + built.heard.filter(e => e === 'klk').length + ')');
  say(built.heard.indexOf('chime') >= 0, tag + ': and closing the ring rang the chime');

  /* ---- undo takes back the last piece and reopens the end ---- */
  const undo = await centre(page, '#btnUndo');
  say(!!undo && undo.w >= 48 && undo.h >= 48 && undo.onTop, tag + ': UNDO is a 48 px target on top');
  await tap(page, '#btnUndo');
  await waitFrames(page, 2);
  const un = await page.evaluate(() => ({ n: WHISTLESTOP_TEST.pieces().length,
    loops: WHISTLESTOP_TEST.loops(), open: WHISTLESTOP_TEST.openEnds().length }));
  say(un.n === 7 && un.loops === 0 && un.open === 2,
    tag + ': one undo takes back the last curve and opens the ring again ('
    + un.n + ' pieces, ' + un.loops + ' loops, ' + un.open + ' open ends)');
  await tap(page, '#btnRedo');
  await waitFrames(page, 2);
  const re = await page.evaluate(() => ({ n: WHISTLESTOP_TEST.pieces().length, loops: WHISTLESTOP_TEST.loops() }));
  say(re.n === 8 && re.loops === 1, tag + ': and redo puts it back (' + re.n + ' pieces, ' + re.loops + ' loops)');

  /* ---- the handles are 48 px and ABOVE the piece, never under the thumb ---- */
  /* ⛔ the MIDDLE of the piece. Tapping a curve's origin is tapping the joint
     it shares with its neighbour, and the first draft of this gate aimed there
     and then complained that the wrong piece was picked up. */
  const pt = await page.evaluate(() => WHISTLESTOP_TEST.pieceMidScreen(3));
  await tapAt(page, R(pt.x), R(pt.y));
  await waitFrames(page, 2);
  const sel = await page.evaluate(() => WHISTLESTOP_TEST.select());
  say(sel === 3, tag + ': a tap in the middle of a piece picks that piece up (' + sel + ')');
  for (const id of ['#hTurn', '#hFlip', '#hDel']) {
    const b = await centre(page, id);
    say(!!b && b.w >= 48 && b.h >= 48 && b.onTop, tag + ' ' + id + ' is a 48 px target on top ('
      + (b ? b.w.toFixed(0) + 'x' + b.h.toFixed(0) + (b.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  const hb = await page.evaluate(() => WHISTLESTOP_TEST.handleBox());
  say(hb.on && hb.bottom < pt.y - 20, tag + ': and the row sits above the piece, not under the finger ('
    + (pt.y - hb.bottom).toFixed(0) + ' px above)');
  say(hb.left >= 0 && hb.top >= 0 && hb.right <= W + 1 && hb.bottom <= H + 1,
    tag + ': and it stays on the screen');

  /* a real tap on the turn handle turns the piece and leaves the ring alone or
     breaks it, but it must MOVE something */
  const before = await page.evaluate(() => JSON.stringify(WHISTLESTOP_TEST.pieces()[WHISTLESTOP_TEST.select()]));
  const wasRot = await page.evaluate(() => WHISTLESTOP_TEST.pieces()[WHISTLESTOP_TEST.select()].rot);
  await tap(page, '#hTurn');
  await waitFrames(page, 2);
  const after = await page.evaluate(() => JSON.stringify(WHISTLESTOP_TEST.pieces()[WHISTLESTOP_TEST.select()]));
  const nowRot = await page.evaluate(() => WHISTLESTOP_TEST.pieces()[WHISTLESTOP_TEST.select()].rot);
  say(before !== after, tag + ': a tap on the turn handle turns it');
  /* ⛔ the first version of this line ended in "|| before !== after", which is
     the assertion above it, so it could not fail. A turn re-snaps, so the piece
     may end up re-anchored to a different neighbour: what is actually promised
     is that it lands on a detent, never between two. */
  const detents = (nowRot - wasRot) * 4 / Math.PI;
  say(Math.abs(detents - Math.round(detents)) < 1e-6 && Math.round(detents) !== 0,
    tag + ': and it lands on a detent, never between two (' + detents.toFixed(4) + ')');
  await tap(page, '#btnUndo');
  await waitFrames(page, 2);

  /* ---- a piece dragged off the rug goes back in the box ---- */
  const n0 = await page.evaluate(() => WHISTLESTOP_TEST.pieces().length);
  const from = await page.evaluate(() => WHISTLESTOP_TEST.pieceScreen(5));
  const off = await page.evaluate(() => {
    const r = WHISTLESTOP_TEST.rug();
    return WHISTLESTOP_TEST.toScreen(r.x0 - 300, (r.y0 + r.y1) / 2);
  });
  await drag(page, R(from.x), R(from.y), R(off.x), R(off.y), 12);
  await dragEnd(page, R(off.x), R(off.y));
  await waitFrames(page, 2);
  const n1 = await page.evaluate(() => WHISTLESTOP_TEST.pieces().length);
  const stillThere = await page.evaluate(() => document.querySelectorAll('#tray .tile').length);
  say(n1 === n0 - 1, tag + ': a piece dragged off the rug leaves it (' + n0 + ' to ' + n1 + ')');
  say(stillThere === 7, tag + ': and the tray still offers every piece (' + stillThere + ')');

  /* ---- two fingers ---- */
  const z0 = await page.evaluate(() => WHISTLESTOP_TEST.view().zoom);
  await pinch(page, R(W / 2), R(H / 2), 70, 240, 10);
  await waitFrames(page, 2);
  const z1 = await page.evaluate(() => WHISTLESTOP_TEST.view().zoom);
  say(z1 > z0 * 1.4, tag + ': two fingers spreading zoom in (' + z0.toFixed(2) + ' to ' + z1.toFixed(2) + ')');
  await pinch(page, R(W / 2), R(H / 2), 240, 70, 10);
  await waitFrames(page, 2);
  const z2 = await page.evaluate(() => WHISTLESTOP_TEST.view().zoom);
  say(z2 < z1 * 0.8, tag + ': and closing them zooms back out (' + z2.toFixed(2) + ')');

  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' BUILD FAILURE(S)'); process.exit(1); }
console.log('\nBUILD OK');
