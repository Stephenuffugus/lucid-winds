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
  await page.evaluate(() => DOOHICKEY_TEST.start(5));
  await page.evaluate(() => DOOHICKEY_TEST.solution());
  await waitFrames(page, 2);

  /* the build screen */
  for (const sel of ['#btnUndo', '#btnRedo', '#btnMenu', '#btnGo']) {
    const r = await centre(page, sel);
    say(!!r && r.w >= 48 && r.h >= 48 && r.onTop,
      at + ' ' + sel + ' is a real target (' + (r ? r.w.toFixed(0) + 'x' + r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  const tiles = await page.evaluate(() => [...document.querySelectorAll('#tray .tile')].map(t => {
    t.scrollIntoView({ inline: 'center' });
    const r = t.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { part: t.getAttribute('data-part'), w: r.width, h: r.height, on: top === t || t.contains(top) };
  }));
  say(tiles.length >= 4, at + ' the tray shows every part of the level (' + tiles.length + ')');
  say(tiles.every(t => t.w >= 48 && t.h >= 48), at + ' and every tile is 48 px');
  say(tiles.every(t => t.on), at + ' and none of them is covered ('
    + tiles.filter(t => !t.on).map(t => t.part).join(', ') + ')');

  /* the music chip's corner */
  const corner = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('#chrome button, #tray button, #handles button')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push(el.id || el.className);
    }
    return out;
  });
  say(corner.length === 0, at + ' the bottom left 120 by 120 is empty' + (corner.length ? ': ' + corner.join(', ') : ''));

  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  say(wide <= 1, at + ' the page does not scroll sideways (' + wide + ' px over)');

  /* the handles, wherever the part is */
  const hOk = await page.evaluate(() => {
    const parts = DOOHICKEY_TEST.parts();
    const out = [];
    for (const i of [0, Math.floor(parts.length / 2), parts.length - 1]) {
      const p = parts[i];
      const pt = DOOHICKEY_TEST.toScreen(p.x, p.y);
      const o = { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true,
        clientX: pt.x, clientY: pt.y };
      const cv = document.getElementById('board');
      cv.dispatchEvent(new PointerEvent('pointerdown', o));
      cv.dispatchEvent(new PointerEvent('pointerup', o));
      const h = document.getElementById('handles');
      const r = h.getBoundingClientRect();
      out.push({ i, on: h.classList.contains('on'), left: r.left, top: r.top,
        right: r.right, bottom: r.bottom, w: innerWidth, hgt: innerHeight });
    }
    return out;
  });
  const bad = hOk.filter(o => o.on && (o.left < 0 || o.top < 0 || o.right > o.w || o.bottom > o.hgt));
  say(bad.length === 0, at + ' the handle row stays on the screen wherever the part is ('
    + hOk.filter(o => o.on).length + ' of 3 selected)');

  /* every screen the player can open */
  await tap(page, '#btnMenu');
  await waitFrames(page, 2);
  for (const sel of ['#btnLevels', '#btnSound', '#btnMotion', '#btnFree', '#btnClear', '#btnMenuClose']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' menu ' + sel + ' is 48 px and on top ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  await tap(page, '#btnLevels');
  await waitFrames(page, 2);
  const cards = await page.evaluate(() => [...document.querySelectorAll('#levelList .card')].map(c => {
    c.scrollIntoView({ block: 'center' });
    const r = c.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { h: r.height, on: top === c || c.contains(top) };
  }));
  /* the law, not the literal: a card for every level the game has */
  const want = await page.evaluate(() => DOOHICKEY_TEST.levelCount());
  say(cards.length === want && want >= 10, at + ' the level list has a card for every level ('
    + cards.length + ' of ' + want + ')');
  say(cards.every(c => c.h >= 64), at + ' and every card is 64 px tall');
  say(cards.every(c => c.on), at + ' and none of them is covered');
  const minFont = await page.evaluate(() => {
    let m = 99;
    for (const el of document.querySelectorAll('.card, .btn, .tag, .lede, .tiny, #partCount')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      m = Math.min(m, parseFloat(getComputedStyle(el).fontSize));
    }
    return m;
  });
  say(minFont >= 11.2, at + ' and nothing on screen is under 0.7 rem (' + minFont.toFixed(1) + ' px)');

  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('\nLAYOUT OK');
