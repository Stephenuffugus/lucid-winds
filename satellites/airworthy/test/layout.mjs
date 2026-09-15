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

  /* ⛔ THE MUSIC CHIP'S CORNER, AND EVERY BUTTON ON THE PAGE. This scanned
     `#chrome button, #resultCard button, #scrTrim button` and THROW IT is a
     SIBLING of the chrome, not a child of it, so the two biggest buttons in the
     game were never once looked at. THROW IT, centred at 190 px wide, ran from
     111 to 301 on a 412 phone and had sat in the chip's corner since it was
     built. The selector is the LAW now, every visible button, not a list of
     places somebody remembered. Found 2026-09-07 by opening a shot. */
  /* ⛔ the corner is read the way a thumb or the chip finds it: elementFromPoint
     on an 8 px grid over the bottom left 120 by 120, and anything that is a
     control or a caption of ours is a hit. Two scans before this one lied: the
     first read buttons only and called the corner empty while the Aileron dial
     (a range input and a .lbl) sat in it with the trim sheet up; the second read
     every control's getBoundingClientRect, which ignores clipping, so a dial row
     scrolled out of the sheet's column and invisible still reported a rect in the
     corner (the reviewer, 2026-09-08). What is under the point is the law. */
  const scanCorner = () => page.evaluate(() => {
    const seen = new Set(), out = [];
    const OURS = 'button, input, .lbl, .val, .cap, #doodadWhere, #doodadLine, #doodadShelf .chip';
    for (let x = 4; x < 120; x += 8) for (let y = innerHeight - 116; y < innerHeight; y += 8) {
      const el = document.elementFromPoint(x, y);
      const hit = el && (el.matches(OURS) ? el : el.closest(OURS));
      if (!hit || seen.has(hit)) continue;
      seen.add(hit);
      out.push((hit.id || hit.className) + ' at ' + x + ',' + y);
    }
    return out;
  });
  const corner = await scanCorner();
  say(corner.length === 0, at + ' the bottom left 120 by 120 is empty' + (corner.length ? ': ' + corner.join(', ') : ''));
  /* ⛔⛔ AND AGAIN WITH THE TWO BIG BUTTONS ACTUALLY ON THE SCREEN. THROW IT is
     only up inside a challenge and WHISTLE only while the plane is in the air,
     so the scan above runs on a gym field where neither exists: widening the
     selector to every button changed nothing at all until the STATE was set
     too. That is the empty screen scar, twice in one assertion. */
  await page.evaluate(() => { AIRWORTHY_TEST.toChallenge('gym-far'); });
  await waitFrames(page, 3);
  const slingUp = await page.evaluate(() => !document.getElementById('btnSling').hidden);
  say(slingUp, at + ' THROW IT is on the screen so it can be measured');
  const cornerA = await scanCorner();
  say(cornerA.length === 0, at + ' and with THROW IT up the corner is still empty'
    + (cornerA.length ? ': ' + cornerA.join(', ') : ''));
  await page.evaluate(() => {
    AIRWORTHY_TEST.toField();
    AIRWORTHY_TEST.earnWhistle();
    AIRWORTHY_TEST.launch(8, 0.6);
    AIRWORTHY_TEST.advance(0.6);
  });
  await waitFrames(page, 3);
  const whUp = await page.evaluate(() => !document.getElementById('btnWhistle').hidden);
  say(whUp, at + ' the WHISTLE is on the screen so it can be measured');
  const cornerB = await scanCorner();
  say(cornerB.length === 0, at + ' and with the WHISTLE up the corner is still empty'
    + (cornerB.length ? ': ' + cornerB.join(', ') : ''));
  const wRect = await centre(page, '#btnWhistle');
  say(!!wRect && wRect.h >= 47.5 && wRect.onTop, at + ' and it is a real target ('
    + (wRect ? wRect.w.toFixed(0) + 'x' + wRect.h.toFixed(0) + (wRect.onTop ? '' : ', COVERED') : 'missing') + ')');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); AIRWORTHY_TEST.toField(); });
  await waitFrames(page, 3);
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
  for (const sel of ['#dialElev', '#dialAil', '#doodadWhere', '#btnTrimDone']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' trim ' + sel + ' is 48 px and on top ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  /* THE DOODADS SHELF (docs/GEAR-DOODADS-SEP08.md), read off the page the way
     the fold gate reads the ladder: the bank says how many chips there are, the
     shelf holds them plus the empty seat, and every one is a rendered 48 px
     target a thumb lands on. A count typed here would go red the day a doodad
     is added, so the count comes from the game. */
  /* measured where the thumb finds it: the sheet opens at its top and the shelf
     is the first thing on it. The four centre() reads above each scroll their
     element into view and THROW IT is last, so on every size where the sheet
     scrolls the shelf had been pushed above the sheet's box and elementFromPoint
     found the stage behind it (watched: 667x375, 915x412 and 320x568 all read
     "covered" while 375x667, which scrolls 3 px, and 412x915 passed). */
  const scrolled = await page.evaluate(() => { const sh = document.getElementById('trimScroll'); const was = sh.scrollTop; sh.scrollTop = 0; return was; });
  await waitFrames(page, 1);
  const shelf = await page.evaluate(() => [...document.querySelectorAll('#doodadShelf .chip')].map(c => {
    const r = c.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { h: r.height, w: r.width, on: top === c || c.contains(top),
      clipped: c.scrollWidth > c.clientWidth + 2 || c.scrollHeight > c.clientHeight + 2 };
  }));
  const bank = await page.evaluate(() => AIRWORTHY_TEST.doodads().length);
  say(shelf.length === bank + 1, at + ' the shelf holds every doodad and an empty seat (' + shelf.length + ' chips for ' + bank + ')');
  say(shelf.length > 0 && shelf.every(c => c.h >= 48 && c.w >= 48),
    at + ' every doodad chip is a real target (' + shelf.map(c => c.w.toFixed(0) + 'x' + c.h.toFixed(0)).join(' ') + ')');
  say(shelf.every(c => c.on), at + ' and none of them is covered at the top of the sheet (THROW IT had scrolled it ' + scrolled.toFixed(0) + ' px)');
  say(shelf.every(c => !c.clipped), at + ' and none of their words are cut off');
  /* ⛔ the corner, WITH THE SHEET UP. NONE sat in the music chip's corner from
     the day the paperclip row was built, and no scan ever ran with the trim
     sheet open. This one does, and the sheet's chips and THROW IT are all
     buttons the scan sees. */
  const cornerT = await scanCorner();
  say(cornerT.length === 0, at + ' and with the trim sheet up the music corner is empty'
    + (cornerT.length ? ': ' + cornerT.join(', ') : ''));
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

  /* the workshop and the hangar */
  await page.evaluate(() => AIRWORTHY_TEST.shopStart());
  await waitFrames(page, 2);
  for (const sel of ['#btnShopBack', '#btnShopNext', '#shopBar']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' workshop ' + sel + ' is 48 px and on top ('
      + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
  }
  const chips = await page.evaluate(() => [...document.querySelectorAll('#shopChips .chip')].map(c => {
    const r = c.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { h: r.height, w: r.width, on: top === c || c.contains(top), clipped: c.scrollHeight > c.clientHeight + 2 };
  }));
  say(chips.length >= 2 && chips.every(c => c.h >= 48 && c.w >= 60),
    at + ' every fold chip is a real target (' + chips.map(c => c.w.toFixed(0) + 'x' + c.h.toFixed(0)).join(' ') + ')');
  say(chips.every(c => c.on), at + ' and none of them is covered');
  say(chips.every(c => !c.clipped), at + ' and none of their words are cut off');
  /* ⛔ CALL 69 (2026-09-15): THE BAR THE THUMB NEEDS GROWS WITH A TALL SCREEN. At 412 by 915 the paper
     was 530 px for one crease against a 60 px bar. On a portrait screen the bar is at least a tenth of
     the height, from 60 to 96 px; the paper is printed beside it because it gives up exactly that. */
  if (h > w) {
    const bb = await page.evaluate(() => ({ bar: document.getElementById('shopBar').getBoundingClientRect().height,
      paper: AIRWORTHY_TEST.sheetRect ? AIRWORTHY_TEST.sheetRect() : null }));
    const wantBar = Math.min(96, Math.max(60, 0.1 * h));
    say(bb.bar >= wantBar - 1, at + ' the press bar grows with a tall screen (' + bb.bar.toFixed(0) + ' px against '
      + wantBar.toFixed(0) + (bb.paper ? '; the paper ' + bb.paper.w.toFixed(0) + ' by ' + bb.paper.h.toFixed(0) : '') + ')');
  }
  /* ⛔ CALL 69: A ROW OF CHIPS READS AS ONE SHAPE. On crease 1 "heavier, and it stays" wraps to two lines
     where its siblings do not, and on crease 4 "Turned down" wraps its label; in every visual row the labels
     start at one height and the subtitles at one height, within a pixel. */
  const rowsOf = () => page.evaluate(() => {
    const rows = {};
    [...document.querySelectorAll('#shopChips .chip')].forEach(c => {
      const k = Math.round(c.getBoundingClientRect().top);
      const lab = c.firstElementChild ? c.firstElementChild.getBoundingClientRect().top : 0;
      const sub = c.querySelector('.sub') ? c.querySelector('.sub').getBoundingClientRect().top : 0;
      (rows[k] = rows[k] || []).push({ lab, sub });
    });
    return Object.values(rows).filter(r => r.length > 1).map(r => ({ n: r.length,
      lab: Math.max(...r.map(x => x.lab)) - Math.min(...r.map(x => x.lab)),
      sub: Math.max(...r.map(x => x.sub)) - Math.min(...r.map(x => x.sub)) }));
  });
  const uneven = [];
  for (const step of [0, 3]) {
    await page.evaluate((n) => { AIRWORTHY_TEST.shop().step = n; AIRWORTHY_TEST.shopRender(); }, step);
    await waitFrames(page, 1);
    (await rowsOf()).forEach(r => { if (r.lab > 1 || r.sub > 1) uneven.push('crease ' + (step + 1) + ': labels ' + r.lab.toFixed(0) + ' px apart, subtitles ' + r.sub.toFixed(0)); });
  }
  await page.evaluate(() => { AIRWORTHY_TEST.shop().step = 0; AIRWORTHY_TEST.shopRender(); });
  await waitFrames(page, 1);
  say(uneven.length === 0, at + ' every row of fold chips lines up its words, a wrap included' + (uneven.length ? ': ' + uneven.join('; ') : ''));
  /* ⛔ measure the room the PAPER has, not the height of the chrome: in
     landscape the chrome is a column down the side and is the full height of
     the screen while taking less than half of it. */
  const room = await page.evaluate(() => {
    const r = document.getElementById('shop').getBoundingClientRect();
    const all = innerWidth * innerHeight;
    const taken = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0))
      * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    return { free: (all - taken) / all, w: innerWidth, h: innerHeight };
  });
  say(room.free > 0.42, at + ' the paper gets most of the screen ('
    + (room.free * 100).toFixed(0) + ' percent free)');

  /* ⛔ MEASURED WHILE THE WORKSHOP IS UP. This scan used to run after the click
     into the hangar, when #shop is display:none, so every workshop button was a
     0 by 0 rectangle the loop skipped and the line read green over a BACK button
     that had sat in the chip's corner on every portrait phone (seen on the Sep 08
     crease 1 shots at 412 and 375; watched red the moment the scan moved). A
     gate that measures the empty screen is the Sep 06 scar, again. */
  /* the row's own words, on the crease where the button is longest. The .btn
     clip scan above runs on the field, when this row is display:none and its
     rectangles are 0 by 0, so a SAVE IT cut off at 320 px would pass it. */
  await page.evaluate(() => { AIRWORTHY_TEST.shop().step = AIRWORTHY_TEST.folds().length - 1; AIRWORTHY_TEST.shopRender(); });
  await waitFrames(page, 1);
  const rowWords = await page.evaluate(() => ['btnShopBack', 'btnShopNext'].map(id => {
    const el = document.getElementById(id);
    return { id, text: el.textContent, w: el.clientWidth, need: el.scrollWidth, cut: el.scrollWidth > el.clientWidth + 2 };
  }));
  say(rowWords.every(b => !b.cut) && rowWords[1].text === 'SAVE IT', at + ' BACK and SAVE IT each fit their button ('
    + rowWords.map(b => b.text + ' ' + b.need + ' in ' + b.w).join(', ') + ')');
  await page.evaluate(() => { AIRWORTHY_TEST.shop().step = 0; AIRWORTHY_TEST.shopRender(); });
  await waitFrames(page, 1);
  const cornerShop = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('#shop button')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push((el.id || el.className) + ' at ' + r.left.toFixed(0));
    }
    return out;
  });
  say(cornerShop.length === 0, at + ' the workshop keeps out of the music corner'
    + (cornerShop.length ? ': ' + cornerShop.join(', ') : ''));
  /* ⛔ THE RESERVE IS PORTRAIT'S ONLY. In landscape the chrome is a column down
     the right and the chip's corner is the paper's, so the row starts at the
     column's own content edge. The override that said so sat in a media block
     ABOVE the base rule; same specificity, later wins, so it never applied and
     the landscape row carried a 106 px hole nobody could see in a gate that
     only asks whether the words fit (found when a 220 px squeeze went red in
     landscape too). This reads the row where it stands, not the stylesheet. */
  if (w > h) {
    const edge = await page.evaluate(() => {
      const shop = document.getElementById('shop'), back = document.getElementById('btnShopBack');
      const s = shop.getBoundingClientRect(), b = back.getBoundingClientRect();
      const cs = getComputedStyle(shop);
      const content = s.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      return { back: b.left, content, gap: b.left - content };
    });
    say(Math.abs(edge.gap) <= 1, at + ' in landscape the row starts at the column edge, no reserve (BACK at '
      + edge.back.toFixed(0) + ', the column content edge at ' + edge.content.toFixed(0) + ')');
  }

  await page.evaluate(() => { AIRWORTHY_TEST.shopStart(); document.getElementById('btnHangar').click(); });
  await waitFrames(page, 2);
  for (const sel of ['#btnHangarBack']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, at + ' hangar ' + sel + ' is 48 px and on top');
  }
  const corner2 = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('#scrHangar button')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push(el.id || el.className);
    }
    return out;
  });
  say(corner2.length === 0, at + ' and so does the hangar'
    + (corner2.length ? ': ' + corner2.join(', ') : ''));

  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
if (fails.length) { console.log('\n' + fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('\nLAYOUT OK');
