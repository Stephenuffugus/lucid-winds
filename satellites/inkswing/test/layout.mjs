/* THE LAYOUT, MEASURED WHERE A THUMB LANDS.
 *
 *   node test/layout.mjs
 *
 * ⛔ RENDERED pixels at the sizes real phones are, and reachability proved with
 * elementFromPoint rather than by reading CSS. A 48 px rule checked against a
 * stylesheet is a 48 px rule checked against a hope.
 * ⛔ the bottom left 120 by 120 belongs to the fleet's music chip and nothing of
 * this game may be under it.
 */
import { serve, open, reporter, centre, waitFrames, tapAt } from './harness.mjs';

const site = await serve();
const { fails, say } = reporter();
const SIZES = [[412, 915, '412'], [375, 667, '375'], [320, 568, '320']];

for (const [W, H, tag] of SIZES) {
  const { browser, page, errors } = await open(site.base, { width: W, height: H, deviceScaleFactor: 1 });
  const T = (fn, ...a) => page.evaluate(fn, ...a);

  /* ---- the sheet screen ---- */
  for (const [sel, min] of [['#rigChip', 48], ['#btnRigHide', 48], ['#btnMenu', 48]]) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= min - 0.5,
      tag + ': ' + sel + ' is ' + (c ? c.h.toFixed(0) : 0) + ' px and reachable (floor ' + min + ')');
  }
  /* the five ink chips down the right edge */
  const chips = await T(() => [...document.querySelectorAll('#inkRail .chip')].map(b => {
    const r = b.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { id: b.id, w: r.width, h: r.height, on: t === b || b.contains(t) };
  }));
  /* ⛔ SIX: the five named inks and the one that opens the wheel. Widened to the
     LAW rather than to the number: the five named ones must be there and the
     wheel must be last, because the named inks are the ones worth reaching for
     first (docs/REFERENCE.md A3). */
  say(chips.length === 6, tag + ': five inks and the wheel are on the rail (' + chips.length + ')');
  say(chips.length === 6 && chips[5].id === 'ink-more',
    tag + ': and the wheel is the last chip, not the first (' + chips.map(c => c.id).join(', ') + ')');
  say(chips.every(c => c.h >= 47.5 && c.w >= 47.5),
    tag + ': and every one of them is a 48 px target');
  say(chips.every(c => c.on), tag + ': and none of them is covered');

  /* ⛔⛔ AND THE BUTTONS HAVE TO BE ON THE SCREEN WHILE WE MEASURE THEM. Every
     action button is hidden until a sheet has a throw on it, so both of the
     checks below were reading an EMPTY LIST and had never once been able to
     fail. A drawing is loaded here first, and the frame is let run so
     syncActions can un hide them, because a gate that cannot fail is not
     evidence. Found 2026-09-06 by a screenshot: UNDO was sitting on the paper
     at 375 while this gate said no button was. */
  await T(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.throws.push(S.flingToThrow(sh, { x: 300, y: 220 }, { x: -480, y: 640 }, 0, 'indigo'));
    window.INKSWING_TEST.loadSheet(sh);
  });
  await waitFrames(page, 3);
  const shown = await T(() => ['btnKeep', 'btnTear', 'btnUndo', 'btnShare']
    .filter(id => !document.getElementById(id).hidden));
  say(shown.length === 4, tag + ': the four action buttons are showing so they can be measured ('
    + shown.join(', ') + ')');
  for (const id of shown) {
    const c = await centre(page, '#' + id);
    say(!!c && c.onTop && c.h >= 47.5,
      tag + ': ' + id + ' is ' + (c ? c.h.toFixed(0) : 0) + ' px and reachable');
  }
  /* ⛔ AND THE CHIPS ARE MEASURED AGAIN NOW, with all four buttons up. Measured
     only on the empty sheet above, the rail on a tall phone sat under UNDO and
     TEAR OFF for a day and this gate said none of them was covered. */
  const chips2 = await T(() => [...document.querySelectorAll('#inkRail .chip')].map(b => {
    const r = b.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { id: b.id, on: t === b || b.contains(t), top: t ? (t.id || t.tagName) : 'nothing' };
  }));
  say(chips2.every(c => c.on), tag + ': and with the four buttons up no chip is under a button'
    + (chips2.every(c => c.on) ? '' : ' (' + chips2.filter(c => !c.on).map(c => c.id + ' under ' + c.top).join(', ') + ')'));

  /* ⛔ the bottom left 120 by 120 belongs to the fleet's music chip */
  const clash = await T(() => {
    const H = window.innerHeight;
    const ids = ['rigChip', 'btnRigHide', 'btnMenu', 'btnKeep', 'btnTear', 'btnUndo', 'btnFinish', 'btnShare'];
    return ids.filter(id => {
      const e = document.getElementById(id);
      if (!e || e.hidden) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.left < 120 && r.bottom > H - 120;
    });
  });
  say(clash.length === 0, tag + ': the bottom left 120 by 120 is left for the music chip'
    + (clash.length ? ': ' + clash.join(', ') : ''));

  /* the bob has to be somewhere a thumb can start a throw from */
  const bob = await T(() => window.INKSWING_TEST.penScreen());
  const vp = await T(() => ({ w: window.innerWidth, h: window.innerHeight }));
  say(bob.x > 50 && bob.x < vp.w - 50 && bob.y > 70 && bob.y < vp.h - 70,
    tag + ': the bob is on the screen with room to swing at it ('
    + bob.x.toFixed(0) + ',' + bob.y.toFixed(0) + ')');
  const onBob = await T((x, y) => {
    const e = document.elementFromPoint(x, y);
    return e ? e.id : null;
  }, Math.round(bob.x), Math.round(bob.y));
  say(onBob === 'stage', tag + ': and a thumb on it lands on the sheet, not on a button');

  /* the whole sheet has to be visible: a drawing half off the screen is a
     drawing nobody can judge */
  const fit = await T(() => {
    const V = window.INKSWING_TEST.view(), C = window.INKSWING_TEST.config();
    const w = C.SHEET_W * V.ppu, h = C.SHEET_H * V.ppu;
    return { left: V.ox - w / 2, right: V.ox + w / 2, top: V.oy - h / 2, bottom: V.oy + h / 2,
      W: window.innerWidth, H: window.innerHeight };
  });
  say(fit.left >= -1 && fit.right <= fit.W + 1 && fit.top >= -1 && fit.bottom <= fit.H + 1,
    tag + ': the whole sheet is on the screen (' + fit.left.toFixed(0) + ' to '
    + fit.right.toFixed(0) + ' across, ' + fit.top.toFixed(0) + ' to ' + fit.bottom.toFixed(0) + ' down)');

  /* ⛔ AND NOTHING SITS ON THE PAPER. A button over the drawing is a button you
     press while trying to look at it, and the drawing is the product. */
  const over = await T(() => {
    const V = window.INKSWING_TEST.view(), C = window.INKSWING_TEST.config();
    const sheet = { l: V.ox - C.SHEET_W * V.ppu / 2, r: V.ox + C.SHEET_W * V.ppu / 2,
      t: V.oy - C.SHEET_H * V.ppu / 2, b: V.oy + C.SHEET_H * V.ppu / 2 };
    const ids = ['btnKeep', 'btnTear', 'btnUndo', 'btnFinish', 'btnShare', 'rigChip', 'btnRigHide', 'btnMenu'];
    return ids.filter(id => {
      const e = document.getElementById(id);
      if (!e || e.hidden) return false;
      const r = e.getBoundingClientRect();
      if (r.width < 1) return false;
      return r.right > sheet.l && r.left < sheet.r && r.bottom > sheet.t && r.top < sheet.b;
    });
  });
  say(over.length === 0, tag + ': no button is sitting on the paper'
    + (over.length ? ': ' + over.join(', ') : ''));

  /* ---- the colour sheet ---- */
  await T(() => document.getElementById('ink-more').click());
  await waitFrames(page, 3);
  say((await T(() => window.INKSWING_TEST.screen())) === 'colour',
    tag + ': the last chip opens the colour sheet');
  for (const sel of ['#hueRing', '#depth', '#nibFine', '#nibMed', '#nibBroad', '#btnColourUse', '#btnColourBack']) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= 47.5,
      tag + ': ' + sel + ' is ' + (c ? c.h.toFixed(0) : 0) + ' px and reachable');
  }
  /* ⛔ measured off the rect, not off a field. The first draft of this line read
     `ring.inView`, which this harness's centre() does not return, so it was
     undefined and the assertion could only ever fail. A gate that cannot pass is
     the same fault as one that cannot fail, wearing the other coat. */
  /* ⛔ back to the top first. centre() scrolls what it measures, so by the time
     the loop above reached BACK the sheet was scrolled and the ring read as
     forty pixels off the top of the screen. The claim is that it is all there
     when the sheet OPENS, so that is where it is measured from. */
  const ring = await T(() => {
    document.getElementById('scrColour').scrollTop = 0;
    const r = document.getElementById('hueRing').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height,
      left: r.left, top: r.top, right: r.right, bottom: r.bottom,
      W: window.innerWidth, H: window.innerHeight };
  });
  say(ring.left >= 0 && ring.top >= 0 && ring.right <= ring.W && ring.bottom <= ring.H,
    tag + ': the whole hue ring is on the screen (' + ring.left.toFixed(0) + ' to '
    + ring.right.toFixed(0) + ' across, ' + ring.top.toFixed(0) + ' to ' + ring.bottom.toFixed(0) + ' down)');
  /* ⛔ AND EVERY FULL SCREEN LEAVES THE MUSIC CHIP'S CORNER ALONE, SCROLLED TO
     THE END. These screens are scrolling columns of full width buttons, so the
     honest check is at the bottom of the scroll, where the last button lands.
     Only what is actually inside the viewport counts: a button below the fold is
     not in the corner. */
  const cornerCheck = (id) => T((id) => {
    const sc = document.getElementById(id);
    sc.scrollTop = sc.scrollHeight;
    const H = window.innerHeight;
    return [...sc.querySelectorAll('button, input, canvas')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.top < H && r.bottom > 0 && r.left < 120 && r.bottom > H - 120;
    }).map(e => e.id || e.textContent.trim().slice(0, 12));
  }, id);
  const clash2 = await cornerCheck('scrColour');
  say(clash2.length === 0, tag + ': and the colour sheet leaves the bottom left corner alone'
    + (clash2.length ? ': ' + clash2.join(', ') : ''));
  await T(() => { document.getElementById('scrColour').scrollTop = 0; });
  /* a tap on the ring picks a hue, and USE THIS INK puts it on the rail */
  const before = await T(() => window.INKSWING_TEST.mixed());
  await tapAt(page, Math.round(ring.x + ring.w * 0.36), Math.round(ring.y));
  await waitFrames(page, 2);
  await T(() => document.getElementById('btnColourUse').click());
  await waitFrames(page, 3);
  const after = await T(() => ({ mixed: window.INKSWING_TEST.mixed(),
    screen: window.INKSWING_TEST.screen(),
    chip: (document.getElementById('ink-more') || {}).className }));
  say(before === null && /^#[0-9a-f]{6}$/.test(after.mixed || ''),
    tag + ': a tap on the ring and USE THIS INK mixes an ink (' + after.mixed + ')');
  say(after.screen === 'sheet' && (after.chip || '').indexOf('on') >= 0,
    tag + ': and it closes back to the sheet with the chip marked (' + after.chip + ')');
  await T(() => document.getElementById('ink-irongall').click());
  await waitFrames(page, 2);
  say((await T(() => window.INKSWING_TEST.mixed())) === null,
    tag + ': and picking a named ink puts the mixed one away again');

  /* ---- the rig screen ---- */
  await T(() => document.getElementById('rigChip').click());
  await waitFrames(page, 3);
  for (const sel of ['#lenA', '#lenB', '#bobBrass', '#modeInk', '#btnRigBack']) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= 47.5,
      tag + ': ' + sel + ' is ' + (c ? c.h.toFixed(0) : 0) + ' px and reachable');
  }
  const cards = await T(() => [...document.querySelectorAll('#rigList .card')].map(b => {
    const r = b.getBoundingClientRect();
    return { h: r.height, id: b.getAttribute('data-rig') };
  }));
  say(cards.length === 4, tag + ': the four rigs are all listed (' + cards.length + ')');
  const clash3 = await cornerCheck('scrRig');
  say(clash3.length === 0, tag + ': and the rig screen leaves the corner alone too'
    + (clash3.length ? ': ' + clash3.join(', ') : ''));
  say(cards.every(c => c.h >= 72), tag + ': and every card is 72 px tall ('
    + cards.map(c => c.h.toFixed(0)).join(',') + ')');

  say(errors.length === 0, tag + ': nothing landed on the console'
    + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
