/* THE FOLIO SHOWS WHAT YOU KEPT (Play queue round four).
 *
 *   node test/folio.mjs
 *
 * KEEP saved up to 48 drawings and the folio screen showed a title and BACK, because nothing ever filled the list.
 * This gate keeps a real drawing with the real KEEP button, RELOADS the page (a kept drawing that only lives in
 * memory is not kept), opens THE FOLIO from the menu, and requires a tile for it, newest first, that opens large
 * and can be taken out with the two tap confirm. Watched to fail with renderFolio emptied.
 */
import { serve, open, reporter, waitFrames, tap, sleep } from './harness.mjs';

const site = await serve();
const { fails, say } = reporter();
const { browser, page, errors } = await open(site.base, { width: 412, height: 915 });
const T = (fn, ...a) => page.evaluate(fn, ...a);
try {
  /* an empty folio says how to fill it */
  await tap(page, '#btnMenu'); await waitFrames(page, 2);
  await tap(page, '#btnFolio'); await waitFrames(page, 2);
  const empty = await T(() => ({ tiles: INKSWING_TEST.folioTiles(), text: document.getElementById('folioList').innerText }));
  say(empty.tiles === 0 && /KEEP/.test(empty.text), 'an empty folio says how to keep a drawing ("' + empty.text.slice(0, 50) + '")');
  await tap(page, '#btnFolioBack'); await waitFrames(page, 1);
  await tap(page, '#btnMenuClose'); await waitFrames(page, 2);

  /* two drawings, kept with the real button */
  for (const ink of ['indigo', 'oxblood']) {
    await T((ink) => {
      const S = INKSWING_TEST.sim();
      const sh = S.newSheet({ rig: 'single' });
      sh.throws.push(S.flingToThrow(sh, { x: 260, y: 200 }, { x: -420, y: 560 }, 0, ink));
      INKSWING_TEST.loadSheet(sh);
      INKSWING_TEST.state().drawing = true; INKSWING_TEST.advance(8); INKSWING_TEST.state().drawing = false;
    }, ink);
    await waitFrames(page, 3);
    await tap(page, '#btnKeep'); await waitFrames(page, 2);
  }
  const kept = await T(() => INKSWING_TEST.folio().length);
  say(kept === 2, 'KEEP put two drawings in the folio (' + kept + ')');

  /* reload: the folio is read back from the save */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.INKSWING_TEST && INKSWING_TEST.frames() > 2, { timeout: 30000 });
  await tap(page, '#btnMenu'); await waitFrames(page, 2);
  await tap(page, '#btnFolio'); await waitFrames(page, 2); await sleep(400);
  const after = await T(() => ({ tiles: INKSWING_TEST.folioTiles(), first: (document.querySelector('#folioList .ftile .sub') || {}).textContent,
    firstInk: INKSWING_TEST.folio()[0].throws[0].ink }));
  say(after.tiles === 2, 'after a reload the folio shows both kept drawings (' + after.tiles + ' tiles)');
  say(after.firstInk === 'oxblood', 'newest first: the first tile is the drawing kept last (' + after.firstInk + ')');
  /* the thumbnail has ink on it, not just the cream */
  const inked = await T(() => { const cv = document.querySelector('#folioList .ftile canvas'); if (!cv) return 0; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 200 || d[i + 2] < 180) n++; return n; });
  say(inked > 50, 'and its thumbnail is drawn (' + inked + ' inked pixels)');

  /* a tile opens large; REMOVE asks, then removes */
  await tap(page, '#folioList .ftile'); await waitFrames(page, 2);
  say((await T(() => INKSWING_TEST.screen())) === 'folioone', 'a tile opens the drawing large');
  await tap(page, '#btnFolioRemove'); await waitFrames(page, 1);
  const armed = await T(() => ({ n: INKSWING_TEST.folio().length, label: document.getElementById('btnFolioRemove').textContent }));
  say(armed.n === 2 && /AGAIN/.test(armed.label), 'the first REMOVE only asks (' + armed.label + ')');
  await tap(page, '#btnFolioRemove'); await waitFrames(page, 2);
  const gone = await T(() => ({ n: INKSWING_TEST.folio().length, tiles: INKSWING_TEST.folioTiles(), screen: INKSWING_TEST.screen() }));
  say(gone.n === 1 && gone.tiles === 1 && gone.screen === 'folio', 'the second takes it out and goes back to the folio (' + gone.n + ' left)');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
} finally {
  await browser.close(); site.close && site.close();
}
if (fails.length) { console.log(fails.length + ' FOLIO FAILURE(S)'); process.exit(1); }
console.log('FOLIO OK');
