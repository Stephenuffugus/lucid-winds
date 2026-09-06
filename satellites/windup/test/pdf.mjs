/* THE PRINTABLE STRIP.
 *
 *   node test/pdf.mjs
 *
 * ⛔ this one leaves the screen and becomes a real object, and a wrong number in
 * it wastes somebody's paper and their trust. So the file is opened and read:
 * it has to be a PDF, it has to have one page for every 250 mm of strip, and
 * the number of holes drawn in it has to be the number of holes in the strip.
 * Nothing here proves the SPACING is right against a real Kikkerland strip.
 * That is why the button says beta and why section 11 asks Stephen to print one.
 */
import { serve, open, reporter, waitFrames, centre } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

try {
  const made = await T(() => {
    window.WINDUP_TEST.setStrip(window.WINDUP_TEST.sim().STARTERS.twinkle.holes.slice(), 'Twinkle Twinkle');
    const m = window.WINDUP_TEST.makePdf();
    return { text: m.text, pages: m.pages, holes: m.holes,
      strip: window.WINDUP_TEST.strip().holes.length,
      len: window.WINDUP_TEST.sim().stripLength(window.WINDUP_TEST.strip()),
      cfg: window.WINDUP_TEST.config() };
  });
  say(made.text.indexOf('%PDF-1.4') === 0, 'it is a PDF, and it says so in the first eight bytes');
  say(made.text.indexOf('%%EOF') > 0, 'and it ends the way one does');
  say(/xref\n0 \d+/.test(made.text), 'and it carries a cross reference table');
  say(/trailer[\s\S]*\/Root 1 0 R/.test(made.text), 'and a trailer that points at the catalogue');
  const pageCount = (made.text.match(/\/Type \/Page[^s]/g) || []).length;
  const runMM = Math.min(250, 297 - 34);
  const wantPages = Math.max(1, Math.ceil(made.len * made.cfg.MM_PER_STEP / runMM));
  say(pageCount === wantPages,
    'one page for every ' + runMM + ' mm of strip: ' + made.len + ' eighths is '
    + (made.len * made.cfg.MM_PER_STEP).toFixed(0) + ' mm, so ' + wantPages
    + ' page' + (wantPages > 1 ? 's' : '') + ' (' + pageCount + ')');
  say(made.holes === made.strip,
    'and every hole on the strip is drawn on it (' + made.holes + ' of ' + made.strip + ')');
  /* a circle is four beziers, so four `c` operators and one `f` per hole */
  const curves = (made.text.match(/ c\n/g) || []).length;
  say(curves === made.strip * 4,
    'each one drawn as four curves, because a PDF has no circle (' + curves + ')');
  say(made.text.indexOf('/BaseFont /Helvetica') > 0, 'and the only font in it is one every reader has');
  say(/beta/i.test(made.text), 'and it says beta on the page itself');
  say(made.text.indexOf('Sky Wolf Studio') > 0, 'and who made it');
  say(made.text.indexOf('Twinkle Twinkle') > 0, 'and what the song is called');
  /* the page is A4 and the strip is the width the paper really is */
  const box = made.text.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
  say(!!box && Math.abs(Number(box[1]) - 210 * 72 / 25.4) < 1 && Math.abs(Number(box[2]) - 297 * 72 / 25.4) < 1,
    'the page is A4 in points (' + (box ? box[1] + ' by ' + box[2] : 'no MediaBox') + ')');

  /* a long strip really does spill onto a second page */
  const long = await T(() => {
    const holes = [];
    for (let i = 0; i < 120; i++) holes.push([i * 2, i % 15]);
    window.WINDUP_TEST.setStrip(holes, 'A long one');
    const m = window.WINDUP_TEST.makePdf();
    return { pages: m.pages, holes: m.holes, strip: 120,
      part: m.text.indexOf('part 2 of') > 0 };
  });
  say(long.pages >= 2, 'a strip longer than a page runs onto the next one (' + long.pages + ')');
  say(long.holes === long.strip, 'and no hole is lost at the join (' + long.holes + ')');
  say(long.part, 'and the sheets say which is which');

  /* an empty strip still makes a printable page */
  const empty = await T(() => {
    window.WINDUP_TEST.setStrip([], 'Blank');
    const m = window.WINDUP_TEST.makePdf();
    return { pages: m.pages, holes: m.holes, ok: m.text.indexOf('%PDF-1.4') === 0 };
  });
  say(empty.ok && empty.pages === 1 && empty.holes === 0,
    'an empty strip is still a page of blank paper you can cut out');

  /* ---- and the picture ---- */
  const png = await T(() => {
    window.WINDUP_TEST.setStrip(window.WINDUP_TEST.sim().STARTERS.birthday.holes.slice(), 'Happy Birthday');
    const cv = window.WINDUP_TEST.stripPng();
    const c = cv.getContext('2d');
    const d = c.getImageData(0, 0, cv.width, cv.height).data;
    let dark = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 300) dark++;
    return { w: cv.width, h: cv.height, dark: dark, px: d.length / 4 };
  });
  say(png.w > 200 && png.h > 100, 'the strip picture is a picture (' + png.w + ' by ' + png.h + ')');
  say(png.dark > 200, 'with holes in it (' + png.dark + ' dark pixels)');
  say(png.dark < png.px * 0.25, 'and it is paper with holes, not a black rectangle');

  /* the three buttons a thumb has to reach */
  await T(() => { document.getElementById('btnMenu').click(); document.getElementById('btnExport').click(); });
  await waitFrames(page, 3);
  for (const sel of ['#btnExpAudio', '#btnExpImage', '#btnExpPdf']) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= 55, sel + ' is a 56 px target (' + (c ? c.h.toFixed(0) : 0) + ')');
  }
  const beta = await T(() => document.getElementById('scrExport').textContent);
  say(/beta/i.test(beta), 'and the screen says the printable strip is beta');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' PDF FAILURE(S)'); process.exit(1); }
console.log('PDF OK');
