/* Every screen at 375x667, then 320 and 412, measured in RENDERED pixels with
   elementFromPoint, on every screen the player can actually open.
   ⛔ a 48 px CSS rule is not a 48 px target: this measures rectangles.
   ⛔ the bottom left 120x120 belongs to the fleet music chip and nothing of
   ours may sit in it. */
import { serve, open, reporter, waitFrames, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const WIDTHS = [[667, 375], [915, 412], [375, 667], [320, 568], [412, 915]];

for (const [w, h] of WIDTHS) {
  const { browser, page, errors } = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  const at = w + 'x' + h;

  /* the title */
  for (const sel of ['#btnFly', '#btnWorkshop', '#btnTunnel', '#btnHow']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' ' + sel + ' is a real target ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  await tap(page, '#btnFly');
  await waitFrames(page, 2);
  for (const sel of ['#btnBack', '#btnMenu']) {
    const r = await centre(page, sel);
    say(!!r && r.w >= 48 && r.h >= 48 && r.onTop, at + ' ' + sel + ' is a real target in the gym');
  }

  /* the music chip's corner */
  const corner = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('#chrome button, #resultCard button, #scrTrim button')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push(el.id || el.className);
    }
    return out;
  });
  say(corner.length === 0, at + ' the bottom left 120 by 120 is empty' + (corner.length ? ': ' + corner.join(', ') : ''));
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  say(wide <= 1, at + ' the page does not scroll sideways (' + wide + ' px over)');

  /* the result card and the trim sheet */
  await page.evaluate(() => { AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish(); });
  await waitFrames(page, 2);
  for (const sel of ['#btnTrim', '#btnAgain', '#btnResultDone']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' result ' + sel + ' is 48 px and on top ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  await tap(page, '#btnTrim');
  await waitFrames(page, 2);
  for (const sel of ['#dialElev', '#dialAil', '#clipNone', '#clipNose', '#clipMid', '#btnTrimDone']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' trim ' + sel + ' is 48 px and on top ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  const minFont = await page.evaluate(() => {
    let m = 99;
    for (const el of document.querySelectorAll('.btn, .lbl, .val, .cap, #hud, #resultLine, .tiny, .lede')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      m = Math.min(m, parseFloat(getComputedStyle(el).fontSize));
    }
    return m;
  });
  say(minFont >= 11.2, at + ' and nothing on screen is under 0.7 rem (' + minFont.toFixed(1) + ' px)');
  const clipped = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll('.btn, #resultName, #resultLine')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (el.scrollWidth > el.clientWidth + 2 || r.right > innerWidth + 1 || r.left < -1) n++;
    }
    return n;
  });
  say(clipped === 0, at + ' and nothing is cut off (' + clipped + ')');

  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('\nLAYOUT OK');
