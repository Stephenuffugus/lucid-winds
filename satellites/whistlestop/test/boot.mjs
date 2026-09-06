/* Does the page come up, and is there anything on it.
   ⛔ a rug game is an easy place to ship a blank warm rectangle and call it
   atmosphere, so this gate READS PIXELS: the rug has to be there, and the
   track drawn on it has to be a different colour from the rug it is drawn on.
   Watched to fail by commenting out drawTrack, and again by leaving the canvas
   at its default size. */
import { serve, open, reporter, waitFrames } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

for (const [w, h, tag] of [[667, 375, 'landscape'], [375, 667, 'portrait']]) {
  const { browser, page, errors } = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  await waitFrames(page, 3);

  say((await page.title()) === 'WHISTLESTOP', tag + ': the page says what it is');
  const st = await page.evaluate(() => {
    const S = WHISTLESTOP_TEST.state();
    return { edges: S.g.edges.length, nodes: S.g.nodes.length, trains: S.trains.length };
  });
  say(st.edges > 6, tag + ': there is track on the rug (' + st.edges + ' edges over ' + st.nodes + ' joints)');
  say(st.trains > 0, tag + ': and a train on it (' + st.trains + ')');

  /* the picture itself. Sample the rug well away from the track, then sample a
     run of points ALONG an edge, and demand they differ. */
  const px = await page.evaluate(() => {
    const S = WHISTLESTOP_TEST.state();
    const cv = document.getElementById('board');
    const c = cv.getContext('2d');
    const dpr = cv.width / cv.clientWidth;
    const read = (x, y) => {
      const d = c.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const e = S.g.edges[0];
    const on = WHISTLESTOP_TEST.toScreen((e.ax + e.bx) / 2, (e.ay + e.by) / 2);
    /* a point on the rug a long way from any track */
    const b = WHISTLESTOP_TEST.toScreen(e.ax, e.ay);
    return { on: read(on.x, on.y), off: read(b.x, b.y - 60), size: [cv.width, cv.height],
      client: [cv.clientWidth, cv.clientHeight] };
  });
  const diff = Math.abs(px.on[0] - px.off[0]) + Math.abs(px.on[1] - px.off[1]) + Math.abs(px.on[2] - px.off[2]);
  say(px.off[0] > 120 && px.off[1] > 100, tag + ': the rug is a warm colour, not black (' + px.off.join(',') + ')');
  say(diff > 24, tag + ': and the track is drawn on it in something else (' + px.on.join(',')
    + ' against ' + px.off.join(',') + ', ' + diff + ' apart)');
  say(px.size[0] >= px.client[0], tag + ': the canvas is sized to its box ('
    + px.size.join('x') + ' for ' + px.client.join('x') + ')');
  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' BOOT FAILURE(S)'); process.exit(1); }
console.log('\nBOOT OK');
