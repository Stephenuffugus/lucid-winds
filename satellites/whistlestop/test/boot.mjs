/* Does the page come up, and can a thumb get from the title to a rug with
   track on it.
   ⛔ every press here is a real PointerEvent on the element a thumb would land
   on. Nothing calls a handler and nothing uses a test hook to change screens.
   ⛔ a rug game is an easy place to ship a blank warm rectangle and call it
   atmosphere, so this gate READS PIXELS: the rug has to be there, and the track
   drawn on it has to be a different colour from the rug under it.
   Watched to fail by commenting out drawTrack, by leaving the canvas at its
   default size, and by making the first puzzle card locked. */
import { serve, open, reporter, waitFrames, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

for (const [w, h, tag] of [[667, 375, 'landscape'], [375, 667, 'portrait']]) {
  const { browser, page, errors } = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  await waitFrames(page, 3);

  say((await page.title()) === 'WHISTLESTOP', tag + ': the page says what it is');
  say((await page.evaluate(() => WHISTLESTOP_TEST.screen())) === 'Title', tag + ': and it opens on the title');

  /* a real thumb walks from the title to the first puzzle */
  const puzzles = await centre(page, '#btnPuzzles');
  say(!!puzzles && puzzles.h >= 48 && puzzles.onTop, tag + ': PUZZLES is a reachable 48 px target ('
    + (puzzles ? puzzles.w.toFixed(0) + 'x' + puzzles.h.toFixed(0) : 'missing') + ')');
  await tap(page, '#btnPuzzles');
  await waitFrames(page, 2);
  const card = await centre(page, '#puzzleList .card');
  say(!!card && card.h >= 64 && card.onTop, tag + ': the first puzzle card is a 64 px target on top');
  await tap(page, '#puzzleList .card');
  await waitFrames(page, 3);
  say((await page.evaluate(() => WHISTLESTOP_TEST.screen())) === 'Play', tag + ': and two taps put a rug on the screen');

  const st = await page.evaluate(() => {
    const S = WHISTLESTOP_TEST.state();
    return { edges: S.g.edges.length, nodes: S.g.nodes.length, trains: S.trains.length,
      stations: S.g.stations.length, junctions: Object.keys(S.g.junctions).length };
  });
  say(st.edges > 6, tag + ': there is track on it (' + st.edges + ' edges over ' + st.nodes + ' joints)');
  say(st.trains > 0, tag + ': and a train on it (' + st.trains + ')');
  say(st.stations === 2 && st.junctions === 1, tag + ': and two stations and one switch ('
    + st.stations + ', ' + st.junctions + ')');

  /* the picture itself */
  const px = await page.evaluate(() => {
    const S = WHISTLESTOP_TEST.state();
    const cv = document.getElementById('board');
    const c = cv.getContext('2d');
    const dpr = cv.width / cv.clientWidth;
    const read = (x, y) => {
      const d = c.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    /* ⛔ pick a length of track with NO TRAIN ON IT. The first draft sampled
       edge zero, which is where the engine is parked, so the "track" pixel it
       read was the red of the engine and the assertion would have passed on a
       game that drew no track at all. */
    const bodies = WHISTLESTOP_TEST.bodies(0);
    let e = null;
    for (const cand of S.g.edges) {
      const mx = (cand.ax + cand.bx) / 2, my = (cand.ay + cand.by) / 2;
      if (bodies.every(b => Math.hypot(b.x - mx, b.y - my) > 64)) { e = cand; break; }
    }
    if (!e) return { none: true };
    const on = WHISTLESTOP_TEST.toScreen((e.ax + e.bx) / 2, (e.ay + e.by) / 2);
    /* a point on the rug, a whole unit clear of any track */
    const r = WHISTLESTOP_TEST.rug();
    const off = WHISTLESTOP_TEST.toScreen((r.x0 + r.x1) / 2, r.y0 + 40);
    return { on: read(on.x, on.y), off: read(off.x, off.y), size: [cv.width, cv.height],
      client: [cv.clientWidth, cv.clientHeight] };
  });
  say(!px.none, tag + ': there is a length of track with no train standing on it');
  const diff = px.none ? 0
    : Math.abs(px.on[0] - px.off[0]) + Math.abs(px.on[1] - px.off[1]) + Math.abs(px.on[2] - px.off[2]);
  const warm = px.off && px.off[0] > px.off[1] && px.off[1] > px.off[2]
    && (px.off[0] + px.off[1] + px.off[2]) > 250;
  say(warm, tag + ': the rug is a warm wool colour, not black and not grey ('
    + px.off.join(',') + ')');
  say(diff > 24, tag + ': and the track is drawn on it in something else (' + px.on.join(',')
    + ' against ' + px.off.join(',') + ', ' + diff + ' apart)');
  /* the design call made in P1 step 2: the wood is the LIGHTEST thing in the
     room, so the eye lands on the track before anything else. A rug and a
     track in the same tone is the flat picture that pass got before. */
  const lum = c => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  say(!px.none && lum(px.on) > lum(px.off) + 40, tag + ': and the wood is clearly lighter than the wool ('
    + (px.none ? '?' : (lum(px.on) - lum(px.off)).toFixed(0)) + ' apart)');
  say(px.size[0] >= px.client[0], tag + ': the canvas is sized to its box ('
    + px.size.join('x') + ' for ' + px.client.join('x') + ')');
  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' BOOT FAILURE(S)'); process.exit(1); }
console.log('\nBOOT OK');
