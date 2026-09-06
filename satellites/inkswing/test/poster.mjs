/* THE POSTER, AT PRINT SIZE.
 *
 *   node test/poster.mjs
 *
 * ⛔ The poster is RE DRAWN from the throw list at two thousand pixels, never
 * scaled up from the screen, and this gate opens the pixels to check it: the
 * right size, ink on the paper rather than an empty page, and a caption in the
 * bottom rows that says what the drawing is.
 */
import { serve, open, reporter, waitFrames, centre, tap } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

const measure = (kind) => page.evaluate(async (kind) => {
  const cv = window.INKSWING_TEST.poster(kind);
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const band = (fromF, toF) => {
    const y0 = Math.round(H * fromF), y1 = Math.round(H * toF);
    const d = c.getImageData(0, y0, W, y1 - y0).data;
    let ink = 0, n = 0, sum = 0;
    for (let i = 0; i < d.length; i += 4 * 5) {
      n++;
      const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
      sum += l;
      /* "ink" means a pixel that is not the ground it was drawn on */
      if (Math.abs(l - (kind === 'dark' ? 26 : 238)) > 26) ink++;
    }
    return { ink: ink / n, mean: sum / n };
  };
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  return { w: W, h: H, art: band(0.12, 0.80), caption: band(0.88, 0.99),
    top: band(0.0, 0.04), bytes: blob ? blob.size : 0, type: blob ? blob.type : '' };
}, kind);

try {
  await T(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.id = 7;
    sh.throws.push(S.flingToThrow(sh, { x: 320, y: 240 }, { x: -500, y: 660 }, 0, 'indigo'));
    sh.throws.push(S.flingToThrow(sh, { x: -260, y: 200 }, { x: 540, y: 320 }, 10, 'oxblood'));
    window.INKSWING_TEST.loadSheet(sh);
    window.INKSWING_TEST.save().name = 'Stephen';
  });
  await waitFrames(page, 3);

  const plate = await measure('plate');
  say(plate.w === 2048 && plate.h === 2560,
    'the poster is 2048 by 2560 (' + plate.w + ' by ' + plate.h + ')');
  say(plate.type === 'image/png', 'and it is a PNG (' + plate.type + ')');
  say(plate.bytes > 20000, 'with a real drawing in it (' + (plate.bytes / 1024).toFixed(0) + ' KB)');
  say(plate.art.ink > 0.02, 'there is ink across the middle of it ('
    + (plate.art.ink * 100).toFixed(1) + ' percent of that band)');
  say(plate.top.ink < 0.02, 'and the margin at the top is clean ('
    + (plate.top.ink * 100).toFixed(2) + ' percent)');
  /* ⛔ THE CAPTION IS THE POINT OF THE PLATE. Without it the poster is a print
     of a squiggle; with it, it says what the drawing IS. */
  /* ⛔ the threshold is set so that losing the CAPTION LINE fails, not just so
     that losing the whole band does: with only the studio credit left the band
     still reads about one percent, and a poster whose caption says nothing about
     the drawing is a print of a squiggle. */
  say(plate.caption.ink > 0.018, 'and the bottom rows carry the caption ('
    + (plate.caption.ink * 100).toFixed(2) + ' percent of that band is not paper)');

  const bare = await measure('bare');
  say(bare.caption.ink < plate.caption.ink,
    'the bare layout has no caption on it (' + (bare.caption.ink * 100).toFixed(2)
    + ' against ' + (plate.caption.ink * 100).toFixed(2) + ')');
  say(bare.art.ink > 0.02, 'but it still has the drawing (' + (bare.art.ink * 100).toFixed(1) + ')');

  const dark = await measure('dark');
  say(dark.art.mean < 90, 'the dark layout is on felt (mean brightness ' + dark.art.mean.toFixed(0) + ')');
  say(dark.art.ink > 0.02, 'and the lines on it are pale enough to read ('
    + (dark.art.ink * 100).toFixed(1) + ' percent)');
  say(plate.art.mean > 150, 'while the plate is on cream (' + plate.art.mean.toFixed(0) + ')');

  /* the caption says what it is */
  const caption = await T(() => {
    /* the caption is drawn, so read it out of the code that built it rather than
       out of the pixels: the pixels are checked above */
    const sh = window.INKSWING_TEST.sheet();
    const S = window.INKSWING_TEST.sim();
    return { rig: S.RIGS[sh.rig].name,
      interval: S.intervalName(S.wForSemitone(sh.lengths[0]), S.wForSemitone(sh.lengths[1])),
      inks: new Set(sh.throws.map(t => t.ink)).size, name: window.INKSWING_TEST.save().name };
  });
  say(caption.interval === 'a fifth' && caption.inks === 2 && caption.name === 'Stephen',
    'and it has something to say: ' + caption.rig + ', ' + caption.interval + ', '
    + caption.inks + ' inks, thrown by ' + caption.name);

  /* the three cards and the button */
  await T(() => { document.getElementById('btnMenu').click(); document.getElementById('btnPoster').click(); });
  await waitFrames(page, 3);
  const cards = await T(() => [...document.querySelectorAll('#posterList .card')].map(b => {
    const r = b.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { k: b.getAttribute('data-poster'), h: r.height, on: t === b || b.contains(t) };
  }));
  say(cards.length === 3 && cards.every(c => c.h >= 72 && c.on),
    'the three layouts are all 72 px and reachable (' + cards.map(c => c.k).join(', ') + ')');
  const exp = await centre(page, '#btnPosterExport');
  say(!!exp && exp.onTop && exp.h >= 55, 'EXPORT is a 56 px target (' + (exp ? exp.h.toFixed(0) : 0) + ')');
  await tap(page, '#posterList .card:nth-child(2)');
  await waitFrames(page, 2);
  say((await T(() => window.INKSWING_TEST.state().poster)) === 'dark', 'and tapping one chooses it');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' POSTER FAILURE(S)'); process.exit(1); }
console.log('POSTER OK');
