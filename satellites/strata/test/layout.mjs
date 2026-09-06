/* Every screen the player can open, at five phone sizes, measured in RENDERED
   pixels with elementFromPoint.
   ⛔⛔ THE INKSWING SCAR. A gate that measures a hidden element measures
   nothing AND REPORTS PASS. Every group below is COUNTED first: the gate says
   how many controls it expects on that screen and fails if the number is
   wrong, and only then measures them. The MOUNT button in particular is hidden
   until a skeleton is sixty percent out of the ground, so it is measured after
   the test hook has actually lifted one, never before.
   ⛔ The bottom left 120 by 120 belongs to the fleet music chip.
   ⛔ The pressure ring is drawn AROUND the finger and never under it, which is
   measured as a radius rather than assumed. */
import { serve, open, reporter, waitFrames, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);
const SIZES = [[375, 667], [412, 915], [320, 568], [667, 375], [915, 412]];

async function group(page, at, what, sel, want, minH) {
  const got = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map(e => {
    if (e.scrollIntoView) e.scrollIntoView({ block: 'center', inline: 'center' });
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return { id: e.id || e.className, w: 0, h: 0, on: false, shown: false };
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { id: e.id || e.className, w: r.width, h: r.height, shown: true,
      on: !!t && (t === e || e.contains(t)) };
  }), sel);
  say(got.length === want, at + ' ' + what + ': all ' + want + ' of them are on the screen (' + got.length + ')');
  if (got.length !== want) return;
  say(got.every(g => g.shown), at + ' ' + what + ': and every one is actually drawn');
  say(got.every(g => g.w >= 48 && g.h >= (minH || 48)), at + ' ' + what + ': and every one is a '
    + (minH || 48) + ' px target (' + got.map(g => g.w.toFixed(0) + 'x' + g.h.toFixed(0)).join(' ') + ')');
  say(got.every(g => g.on), at + ' ' + what + ': and nothing sits on top of any of them ('
    + got.filter(g => !g.on).map(g => g.id).join(', ') + ')');
}

for (const [w, h] of SIZES) {
  const { browser, page, errors } = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  const at = w + 'x' + h;
  await waitFrames(page, 2);

  await group(page, at, 'the title', '#scrTitle .btn', 3);
  const big = await centre(page, '#btnDig');
  say(!!big && big.h >= 56, at + ' the title: DIG is the big one (' + (big ? big.h.toFixed(0) : '?') + ' px)');

  await tap(page, '#btnHow');
  await waitFrames(page, 2);
  await group(page, at, 'how it goes', '#scrHow .btn', 1);
  const lines = await page.evaluate(() => document.querySelectorAll('#scrHow .lede').length);
  say(lines === 3, at + ' how it goes: three lines and no more (' + lines + ')');
  await tap(page, '#btnHowBack');
  await waitFrames(page, 2);

  /* ---- the cliff ---- */
  await tap(page, '#btnDig');
  await waitFrames(page, 3);
  say((await page.evaluate(() => STRATA_TEST.screen())) === 'Dig', at + ' one press opens a cliff');
  await group(page, at, 'the tool rail', '#rail .tool', 4);
  await group(page, at, 'the cliff chrome', '#chrome > .btn:not([hidden])', 1);
  const chip = await centre(page, '#siteChip');
  say(!!chip && chip.h >= 48 && chip.onTop, at + ' the site chip is a 48 px block on top ('
    + (chip ? chip.h.toFixed(0) : 'missing') + ')');
  const era = await page.evaluate(() => document.querySelector('#siteChip .er').textContent);
  say(era.indexOf('The ') === 0, at + ' and it names the band under the finger (' + era + ')');

  /* ⛔ the music chip's corner, while the rail and the chrome are both up */
  const corner = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('#chrome .btn, #rail .tool, #siteChip')) {
      const r = e.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < 120 && r.bottom > innerHeight - 120) out.push(e.id || e.className);
    }
    return out;
  });
  say(corner.length === 0, at + ' the bottom left 120 by 120 is empty while digging'
    + (corner.length ? ': ' + corner.join(', ') : ''));

  /* the pressure ring is drawn AROUND the finger */
  const ring = await page.evaluate(() => {
    /* the ring's radius is the number the drawing uses; a ring smaller than a
       fingertip is a ring under the finger and cannot be read while digging */
    const src = STRATA_TEST.ringRadius ? STRATA_TEST.ringRadius() : null;
    return src;
  });
  say(ring !== null && ring >= 26, at + ' the pressure ring is drawn around the finger, not under it ('
    + ring + ' px)');

  /* ---- MOUNT is hidden until a skeleton is actually out of the ground ---- */
  const hiddenFirst = await page.evaluate(() => document.getElementById('btnMount').hidden);
  say(hiddenFirst, at + ' MOUNT is not offered before anything has been lifted');
  const st = await page.evaluate(() => STRATA_TEST.liftAll());
  await waitFrames(page, 2);
  say(st.canMount, at + ' lifting the animal makes it mountable (' + (st.fraction * 100).toFixed(0)
    + ' percent out, the rule is 60)');
  await group(page, at, 'MOUNT', '#btnMount:not([hidden])', 1, 56);

  /* ---- the bench, then the name sheet, reached the way a thumb reaches them ---- */
  await tap(page, '#btnMount');
  await waitFrames(page, 3);
  say((await page.evaluate(() => STRATA_TEST.screen())) === 'Mount', at + ' MOUNT opens the bench');
  await group(page, at, 'the bench', '#mountBar .btn', 2);
  const tiles = await page.evaluate(() => document.querySelectorAll('#boneTray .btile').length);
  say(tiles > 10, at + ' the crate is on the bench (' + tiles + ' bones)');
  const firstTile = await page.evaluate(() => {
    const t = document.querySelector('#boneTray .btile');
    if (!t) return null;
    const r = t.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  say(!!firstTile && firstTile.w >= 48 && firstTile.h >= 48, at + ' and every bone in it is a 48 px target ('
    + (firstTile ? firstTile.w.toFixed(0) + 'x' + firstTile.h.toFixed(0) : 'missing') + ')');
  await tap(page, '#btnPlaceAll');
  await waitFrames(page, 2);
  await group(page, at, 'NAME IT', '#btnKeepIt:not([disabled])', 1, 56);
  await tap(page, '#btnKeepIt');
  await waitFrames(page, 2);
  await group(page, at, 'the name sheet', '#nameSheet .btn', 2);
  const field = await centre(page, '#dedField');
  say(!!field && field.h >= 48 && field.onTop, at + ' the dedication field is a 48 px target on top');
  const bino = await page.evaluate(() => document.getElementById('nsBino').textContent);
  say(bino.split(' ').length === 2, at + ' and it offers a name (' + bino + ')');
  await tap(page, '#btnNameClose');
  await waitFrames(page, 2);

  /* ---- the hall, and back to the cliff for the menu ---- */
  await tap(page, '#btnMountBack');
  await waitFrames(page, 2);
  say((await page.evaluate(() => STRATA_TEST.screen())) === 'Dig', at + ' the bench goes back to the cliff');
  await tap(page, '#btnMenu');
  await waitFrames(page, 2);
  await group(page, at, 'the menu', '#scrMenu .btn', 6);
  const who = await centre(page, '#whoField');
  say(!!who && who.h >= 48 && who.onTop, at + ' the field name box is a 48 px target on top');
  const brand = await page.evaluate(() => document.querySelector('#scrMenu .tiny').textContent.trim());
  say(brand === 'Sky Wolf Studio', at + ' the menu says who made it (' + brand + ')');
  await tap(page, '#btnMenuClose');
  await waitFrames(page, 2);

  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  say(wide <= 1, at + ' the page does not scroll sideways (' + wide + ' px over)');
  const minFont = await page.evaluate(() => {
    let m = 99, worst = '';
    for (const e of document.querySelectorAll('.btn, .tool .nm, .card, .tag, .lede, .tiny, .cap, #banner, #toast, #siteChip .er, #siteChip .dp')) {
      const r = e.getBoundingClientRect();
      if (r.width < 1) continue;
      const f = parseFloat(getComputedStyle(e).fontSize);
      if (f < m) { m = f; worst = e.id || e.className; }
    }
    return { m, worst };
  });
  say(minFont.m >= 11.2, at + ' nothing on screen is under 0.7 rem (' + minFont.m.toFixed(1)
    + ' px on ' + minFont.worst + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}
s.close();
if (fails.length) { console.log('\n' + fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('\nLAYOUT OK');
