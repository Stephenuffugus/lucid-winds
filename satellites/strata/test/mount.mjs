/* Putting a skeleton together and hanging it up.
   ⛔ NOTHING IN HERE CALLS A HANDLER. Bones are dragged out of the tray by real
   PointerEvents and dropped on the armature; the dedication is typed with real
   keystrokes; every button is pressed where elementFromPoint agrees a thumb
   would land.
   ⛔ The one thing the gate does NOT do with a thumb is the hour of brushing it
   takes to free fifty bones; that is the test hook `liftAll`, which calls the
   game's own rules. Everything about MOUNTING is done with a thumb.
   Watched to fail: by letting a bone snap into any slot, by offering MOUNT
   below the sixty percent rule, and by dropping the dedication. */
import { serve, open, reporter, waitFrames, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);

const { browser, page, errors } = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
await waitFrames(page, 2);
await tap(page, '#btnDig');
await waitFrames(page, 2);
await page.evaluate(() => STRATA_TEST.site(4242, 0));
await waitFrames(page, 2);

/* ---- MOUNT is not offered until enough of the animal is out ---- */
say(await page.evaluate(() => document.getElementById('btnMount').hidden),
  'MOUNT is not offered with the animal still in the ground');
const st = await page.evaluate(() => STRATA_TEST.liftAll());
await waitFrames(page, 2);
say(st.fraction >= 0.6, 'lifting it puts enough of it in the crate ('
  + (st.fraction * 100).toFixed(0) + ' percent, the rule is 60)');
const mount = await centre(page, '#btnMount');
say(!!mount && mount.h >= 56 && mount.onTop, 'and MOUNT is a 56 px target on top');
await tap(page, '#btnMount');
await waitFrames(page, 3);
say((await page.evaluate(() => STRATA_TEST.screen())) === 'Mount', 'it opens the bench');

const m0 = await page.evaluate(() => STRATA_TEST.mountState());
say(m0.out > 20, 'the bench has the whole crate on it (' + m0.out + ' bones)');
say(!m0.ready, 'and it will not name a skeleton nobody has set yet');
say(await page.evaluate(() => document.getElementById('btnKeepIt').disabled),
  'so NAME IT is out of reach');

/* ---- three real drags, each to its own slot ---- */
const drag = (from, to) => page.evaluate(async (from, to) => {
  const tile = document.querySelector('#boneTray .btile[data-bone="' + from.id + '"]');
  if (!tile) throw new Error('no tile for bone ' + from.id);
  /* ⛔ SCROLL TO IT FIRST, the way a thumb does. The crate holds fifty bones in
     one scrolling row, so all but six of them are off the side of the screen at
     any moment; measuring one where it is not is measuring the scroll position
     rather than the layout. That the row is that long at all is written into
     the morning report. */
  tile.scrollIntoView({ block: 'nearest', inline: 'center' });
  await new Promise(r2 => setTimeout(r2, 60));
  const r = tile.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  if (!top || !tile.contains(top)) throw new Error('the tile for bone ' + from.id + ' is covered');
  const cv = document.getElementById('mountCv');
  const cr = cv.getBoundingClientRect();
  const mk = (t, el, x, y) => el.dispatchEvent(new PointerEvent(t, { pointerId: 9, pointerType: 'touch',
    isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  mk('pointerdown', tile, r.left + r.width / 2, r.top + r.height / 2);
  for (let i = 1; i <= 8; i++) {
    mk('pointermove', window, r.left + r.width / 2 + (cr.left + to.x - r.left - r.width / 2) * i / 8,
      r.top + r.height / 2 + (cr.top + to.y - r.top - r.height / 2) * i / 8);
  }
  mk('pointerup', window, cr.left + to.x, cr.top + to.y);
}, from, to);

/* ⛔ THE TRAY IS ONE TILE PER KIND SINCE 2026-09-07 (Director call 15), so this
   walked a list of bone ids and threw "no tile for bone 27" at the first rib
   that was not the first rib. A tile carries the NEXT unplaced bone of its kind,
   which is the thing a thumb actually picks up, so the gate reads the tray and
   drags what the tray is offering. */
const trayNow = () => page.evaluate(() => [...document.querySelectorAll('#boneTray .btile')]
  .filter(t => !t.classList.contains('gone'))
  .map(t => ({ id: +t.getAttribute('data-bone'), kind: t.getAttribute('data-kind'),
    left: +(t.querySelector('.bn') ? t.querySelector('.bn').textContent : 0) })));
const tray0 = await trayNow();
say(tray0.length > 1 && tray0.length <= 12,
  'the crate is one tile per kind of bone, not one per bone (' + tray0.length + ' tiles for '
  + (await page.evaluate(() => STRATA_TEST.bones(0).filter(b => b.out).length)) + ' bones)');
say(tray0.every(t => t.left >= 1), 'and every tile says how many of that bone are left ('
  + tray0.map(t => t.kind + ' ' + t.left).join(', ') + ')');

/* ⛔ AND THE WHOLE CRATE FITS THE SCREEN, which is the entire point of grouping
   it. At 58 px tiles with an 8 px gap the sixth kind was half off the right edge
   of a 375 phone and a player still had to scroll to see what they had, which is
   the fault call 15 was about. Measured off the tiles' own rectangles. */
const trayFit = await page.evaluate(() => {
  const row = document.getElementById('boneTray');
  const tiles = [...row.querySelectorAll('.btile')];
  if (!tiles.length) return null;
  const r = row.getBoundingClientRect();
  const last = tiles[tiles.length - 1].getBoundingClientRect();
  const first = tiles[0].getBoundingClientRect();
  return { rowW: Math.round(r.width), needed: Math.round(last.right - first.left),
    scrolls: row.scrollWidth > row.clientWidth + 1, tile: Math.round(first.height) };
});
say(trayFit && !trayFit.scrolls, 'and the whole crate fits the screen without scrolling ('
  + (trayFit ? trayFit.needed + ' px of ' + trayFit.rowW : '?') + ')');
say(trayFit && trayFit.tile >= 48, 'with every tile still a 48 px target ('
  + (trayFit ? trayFit.tile : 0) + ' px)');

let placedOk = 0;
const wanted = [tray0[0], tray0[Math.floor(tray0.length / 2)], tray0[tray0.length - 1]];
for (const t of wanted) {
  const id = (await trayNow()).find(x => x.kind === t.kind);
  if (!id) continue;
  const slot = await page.evaluate((i) => STRATA_TEST.slotScreen(i), id.id);
  await drag({ id: id.id }, slot);
  await waitFrames(page, 2);
  if ((await page.evaluate(() => STRATA_TEST.placedIds())).indexOf(id.id) >= 0) placedOk++;
}
say(placedOk === 3, 'three real drags off three kinds set three bones in their slots ('
  + placedOk + ' of 3)');

/* ⛔ and the tile MOVES ON: having placed one rib, the ribs tile now offers the
   next rib and says one fewer. A tile that kept offering a bone already on the
   armature would be a dead control that looks alive. */
const trayAfter = await trayNow();
console.log('  ---   the crate after three placements: '
  + (await page.evaluate(() => [...document.querySelectorAll('#boneTray .btile')]
      .map(t => t.getAttribute('data-kind') + ':' + (t.querySelector('.bn') ? t.querySelector('.bn').textContent : '?')
        + (t.classList.contains('gone') ? ' (spent)' : '')).join(', '))));
const firstKind = wanted[0].kind;
const was = tray0.find(t => t.kind === firstKind), now = trayAfter.find(t => t.kind === firstKind);
/* ⛔ NO `!now ||` ESCAPE. The first version of these two lines let a missing
   tile count as a pass, and a missing tile was exactly the fault: the bench
   marked a tile spent because the one bone it happened to be offering had been
   placed, so twenty six vertebrae still in the crate were greyed out and the
   gate said ok. It printed "vertebra:27 (spent)" in the note above and passed. */
say(!!now || was.left === 1, 'the kind is still in the crate when it has more in it');
say(was.left === 1 ? !now : (!!now && now.left === was.left - 1),
  'and the tile it came from counts one fewer (' + firstKind + ': ' + was.left
  + ' to ' + (now ? now.left : 0) + ')');
say(was.left === 1 ? !now : (!!now && now.id !== was.id),
  'and offers the next one of its kind rather than the one just placed');
const m1 = await page.evaluate(() => STRATA_TEST.mountState());
say(m1.done === 3, 'and the bench counts them (' + m1.done + ' of ' + m1.out + ')');
say(!m1.ready, 'and it still will not name a half set skeleton');

/* ---- a bone dropped somewhere that is not its slot stays in the tray ---- */
const spare = await page.evaluate(() => {
  /* ⛔ a bone the TRAY is offering, not just any unplaced bone: since the crate
     groups by kind, only the next of each kind has a tile to drag from. */
  const t = document.querySelector('#boneTray .btile:not(.gone)');
  return t ? +t.getAttribute('data-bone') : -1;
});
const wrong = await page.evaluate((id) => {
  const p = STRATA_TEST.slotScreen(id);
  return { x: p.x + 150, y: p.y + 120 };
}, spare);
await drag({ id: spare }, wrong);
await waitFrames(page, 2);
say((await page.evaluate(() => STRATA_TEST.placedIds())).indexOf(spare) < 0,
  'a bone dropped a long way from its slot stays in the crate');

/* ---- the rest of them, and the name ---- */
await tap(page, '#btnPlaceAll');
await waitFrames(page, 2);
const m2 = await page.evaluate(() => STRATA_TEST.mountState());
say(m2.done === m2.out && m2.ready, 'setting the rest makes it a skeleton (' + m2.done + ' of ' + m2.out + ')');
const keep = await centre(page, '#btnKeepIt');
say(!!keep && keep.h >= 56 && keep.onTop, 'and NAME IT is a 56 px target on top');
await tap(page, '#btnKeepIt');
await waitFrames(page, 2);
const bino = await page.evaluate(() => document.getElementById('nsBino').textContent);
say(bino.split(' ').length === 2, 'the name sheet offers a binomial (' + bino + ')');
const hist = await page.evaluate(() => document.getElementById('nsHist').textContent);
say(hist.split(/\s+/).length >= 12, 'and a line of natural history (' + hist.split(/\s+/).length + ' words)');

/* a real typed dedication */
await page.click('#dedField');
await page.keyboard.type('Penny');
await waitFrames(page, 1);
say((await page.evaluate(() => document.getElementById('dedField').value)) === 'Penny',
  'the dedication field takes a real name');
await tap(page, '#btnKeep');
await waitFrames(page, 3);
say((await page.evaluate(() => STRATA_TEST.screen())) === 'Hall', 'keeping it opens the hall');
const museum = await page.evaluate(() => STRATA_TEST.museum());
say(museum.length === 1, 'and there is one specimen in it (' + museum.length + ')');
say(/ pennyi$/.test(museum[0].name), 'named for Penny (' + museum[0].name + ')');
say(museum[0].dedicated === true, 'and marked as a dedication');
say(['Pristine', 'Sound', 'Repaired', 'Patched'].indexOf(museum[0].condition) >= 0,
  'with a condition on the placard (' + museum[0].condition + ')');

const plinth = await page.evaluate(() => {
  const p = document.querySelector('#hall .plinth');
  if (!p) return null;
  const r = p.getBoundingClientRect();
  return { w: r.width, h: r.height, nm: p.querySelector('.placard .nm').textContent,
    sub: p.querySelector('.placard .sub').textContent,
    onTop: (() => { const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!t && (t === p || p.contains(t)); })() };
});
say(!!plinth && plinth.w >= 120, 'the hall shows a plinth (' + (plinth ? plinth.w.toFixed(0) : 'none') + ' px wide)');
say(!!plinth && plinth.nm === museum[0].name, 'with the name on the placard');
say(!!plinth && plinth.sub.split('\n').length === 3,
  'and the era, the discoverer and the condition on three lines of their own');
say(!!plinth && plinth.onTop, 'and nothing sitting on top of it');

/* it survives a reload, because a museum that forgets is not a museum */
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.STRATA_TEST && STRATA_TEST.frames() > 2, { timeout: 30000 });
const kept = await page.evaluate(() => STRATA_TEST.museum());
say(kept.length === 1 && kept[0].name === museum[0].name,
  'and it is still there after the page is closed and opened again');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
if (fails.length) { console.log('\n' + fails.length + ' MOUNT FAILURE(S)'); process.exit(1); }
console.log('\nMOUNT OK');
