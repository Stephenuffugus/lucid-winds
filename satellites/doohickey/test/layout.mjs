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

  /* ⛔ THE WORKBENCH, IN PORTRAIT. Three bands, and each of them has to be an
     object rather than a margin: the job card above the paper, the board on the
     page, the drawer with the parts and GO under it. The board itself cannot
     grow, the levels are designed landscape and the scene is the scene, so what
     is asserted is what the band SITS IN. */
  if (h > w) {
    const bands = await page.evaluate(() => {
      const V = DOOHICKEY_TEST.view(), C = DOOHICKEY_TEST.config();
      const b = document.getElementById('board').getBoundingClientRect();
      const top = V.oy + (0 - V.camY) * V.k * V.zoom + V.H / 2;
      const bot = V.oy + (C.SCENE_H - V.camY) * V.k * V.zoom + V.H / 2;
      const card = document.getElementById('goalCard').getBoundingClientRect();
      const tray = document.getElementById('tray').getBoundingClientRect();
      const go = document.getElementById('btnGo').getBoundingClientRect();
      return { top, bot, H: V.H, W: V.W, k: V.k, kWide: V.W / C.SCENE_W,
        card: { t: card.top, b: card.bottom }, tray: { t: tray.top, b: tray.bottom },
        go: { t: go.top, b: go.bottom }, drawerTop: V.drawerTop,
        name: document.getElementById('goalName').textContent,
        sub: document.getElementById('goalSub').textContent };
    });
    const fifth = bands.H / 5;
    say(bands.top >= fifth, at + ' the band above the board is a fifth of the screen or more ('
      + bands.top.toFixed(0) + ' against ' + fifth.toFixed(0) + ')');
    say(bands.bot - bands.top >= fifth, at + ' the board itself is ('
      + (bands.bot - bands.top).toFixed(0) + ')');
    say(bands.H - bands.bot >= fifth, at + ' and so is the drawer band below it ('
      + (bands.H - bands.bot).toFixed(0) + ')');
    /* ⛔ AND THE BOARD NEVER PAID FOR IT. The width binds at every portrait size
       or the workbench has been built by shrinking the thing it is a bench for.
       This is the assertion the whole item turns on. */
    say(Math.abs(bands.k - bands.kWide) < 1e-6, at + ' the board is still exactly as big as the width allows ('
      + bands.k.toFixed(4) + ' against ' + bands.kWide.toFixed(4) + ')');
    /* the three bands hold what they are supposed to hold, and in order */
    say(bands.card.b <= bands.top + 1, at + ' the job card is in the top band, clear of the board ('
      + bands.card.b.toFixed(0) + ' against ' + bands.top.toFixed(0) + ')');
    say(bands.tray.t >= bands.bot - 1, at + ' the drawer starts below the board ('
      + bands.tray.t.toFixed(0) + ' against ' + bands.bot.toFixed(0) + ')');
    say(bands.go.t >= bands.tray.b - 1, at + ' and GO is on the drawer front, under the tiles ('
      + bands.go.t.toFixed(0) + ' against ' + bands.tray.b.toFixed(0) + ')');
    say(bands.name.length > 2 && /par \d/.test(bands.sub),
      at + ' the card says what the level is and what it is for: ' + JSON.stringify(bands.name + ', ' + bands.sub));
    /* ⛔ nothing overlaps, by elementFromPoint at each one's centre. The job
       card is NOT in this list and the first draft of it was: the card is a
       readout, it is pointer-events:none like the rest of the chrome, and a
       thumb at its centre lands on the board underneath, which is correct. A
       gate that asks a readout to behave like a control is asking for the wrong
       thing. The card's own claim, that it is clear of the board, is the rect
       assertion above. */
    const own = await page.evaluate(() => {
      const ids = ['btnGo', 'btnUndo', 'btnMenu'];
      const out = [];
      for (const id of ids) {
        const e = document.getElementById(id);
        if (!e || e.hidden) continue;
        const r = e.getBoundingClientRect();
        const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        out.push({ id, ok: !!t && (t === e || e.contains(t) || e.contains(t.parentNode)),
          got: t ? (t.id || t.className) : 'nothing' });
      }
      return out;
    });
    say(own.every(o => o.ok), at + ' each of the workbench pieces owns its own centre'
      + (own.every(o => o.ok) ? '' : ': ' + own.filter(o => !o.ok).map(o => o.id + ' hit ' + o.got).join(', ')));
  }

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
