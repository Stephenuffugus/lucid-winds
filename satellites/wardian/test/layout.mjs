/* Every screen at 375x667, then 320 and 412, measured in RENDERED pixels with
   elementFromPoint, on every screen the player can actually open.
   ⛔ a 48 px CSS rule is not a 48 px target: this measures rectangles.
   ⛔ the bottom left 120x120 belongs to the fleet music chip and nothing of
   ours may sit in it. */
import { serve, open, reporter, waitFrames, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const WIDTHS = [[375, 667], [320, 568], [412, 915]];

for (const [w, h] of WIDTHS) {
  const { browser, page, errors } = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  const at = w + 'x' + h;
  await page.evaluate(() => { WARDIAN_TEST.advance(700, 'daily'); });
  await waitFrames(page, 2);

  /* the home screen */
  for (const sel of ['#chipDay', '#btnMenu', '#btnPhoto']) {
    const r = await centre(page, sel);
    say(!!r && r.w >= 44 && r.h >= 44 && r.onTop,
      at + ' ' + sel + ' is a real target (' + (r ? r.w.toFixed(0) + 'x' + r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  /* the music chip's corner */
  const corner = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('#chrome button, #pouchBar button')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push(el.id || el.className);
    }
    return out;
  });
  say(corner.length === 0, at + ' the bottom left 120 by 120 is empty' + (corner.length ? ': ' + corner.join(', ') : ''));

  /* the page never scrolls sideways */
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  say(wide <= 1, at + ' the page does not scroll sideways (' + wide + ' px over)');

  /* every screen the player can open */
  await tap(page, '#btnMenu');
  await waitFrames(page, 2);
  for (const sel of ['#btnJournal', '#btnPouch', '#btnSettings', '#btnAbout', '#btnMenuClose']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' menu ' + sel + ' is 48 px and on top ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  await tap(page, '#btnJournal');
  await waitFrames(page, 2);
  const jr = await page.evaluate(() => {
    const list = document.getElementById('journalList');
    const spreads = list.querySelectorAll('.spread');
    const letters = list.querySelectorAll('.letter');
    let minFont = 99, overflow = 0, clipped = 0;
    for (const el of list.querySelectorAll('.nm, .bd, .letter')) {
      const cs = getComputedStyle(el);
      minFont = Math.min(minFont, parseFloat(cs.fontSize));
      const r = el.getBoundingClientRect();
      if (r.right > innerWidth + 1 || r.left < -1) overflow++;
      if (el.scrollHeight > el.clientHeight + 2 && cs.overflow !== 'visible') clipped++;
    }
    return { spreads: spreads.length, letters: letters.length, minFont, overflow, clipped,
      listW: list.getBoundingClientRect().width, root: document.documentElement.scrollWidth };
  });
  say(jr.spreads === 11, at + ' the journal has a page for all eleven (' + jr.spreads + ')');
  say(jr.letters >= 1, at + ' and at least one loose note in it (' + jr.letters + ')');
  say(jr.minFont >= 11.2, at + ' and nothing in it is under 0.7 rem (' + jr.minFont.toFixed(1) + ' px)');
  say(jr.overflow === 0, at + ' and nothing hangs off the side of it (' + jr.overflow + ')');
  say(jr.clipped === 0, at + ' and no text is cut off inside its box (' + jr.clipped + ')');
  const back = await centre(page, '#btnJournalBack');
  say(!!back && back.h >= 48 && back.onTop, at + ' the way back out is reachable');

  await tap(page, '#btnJournalBack');
  await tap(page, '#btnMenu');
  await tap(page, '#btnPouch');
  await waitFrames(page, 2);
  const pr = await page.evaluate(() => {
    const rows = document.querySelectorAll('#pouchList .shoprow');
    let small = 0, over = 0, names = [];
    /* ⛔ scroll each one into view BEFORE asking what is on top of it. A pouch
       is a list and a list scrolls; measuring a row below the fold measures the
       scroll position, not the layout. */
    for (const b of document.querySelectorAll('#pouchList .buy')) {
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      if (r.height < 48 || r.width < 44) small++;
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!(top === b || b.contains(top))) { over++; names.push(b.getAttribute('data-buy')); }
    }
    return { rows: rows.length, small, over, names };
  });
  say(pr.rows >= 9, at + ' the pouch has its rows (' + pr.rows + ')');
  say(pr.small === 0, at + ' and every buy button is a 48 px target (' + pr.small + ' too small)');
  say(pr.over === 0, at + ' and none of them is covered (' + pr.over + (pr.over ? ': ' + pr.names.join(', ') : '') + ')');

  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('\nLAYOUT OK');
