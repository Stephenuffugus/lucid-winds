/* THE DOODADS SHELF, with a real thumb (docs/GEAR-DOODADS-SEP08.md).
 *
 *   node test/doodads.mjs
 *
 * Every RULE of the shelf lives in sim.js (the bank, the physics, the Brick
 * law, the ball's two landings, the unlocks, the copy). What only a browser
 * can say is here: the shelf is on the trim sheet at 48 px a chip and out of
 * the music corner; a locked doodad is a silhouette that says its feat and a
 * tap on it tapes nothing on; an open one is taped on by a tap and moved by a
 * tap on the plane; the result card carries the thing that flew, the ball's
 * second landing and the Brick's badge line reach the card; the hangar keeps
 * the field through its own writer; a record from before the shelf loads; and
 * a locked doodad does not ride in on a shared link.
 * ⛔ every chip is tapped at a point elementFromPoint says is the chip.
 * ⛔ every assertion here was watched red under a planted mutation before it
 * was trusted (the plan's SESSION STATE, 2026-09-08).
 */
import { serve, open, reporter, waitFrames, tap, tapAt, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const SAVE_KEY = 'lw_airworthy_v1';

const readShelf = (page) => page.evaluate(() => [...document.querySelectorAll('#doodadShelf .chip')].map(c => {
  const r = c.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { id: c.getAttribute('data-doodad'), locked: c.classList.contains('locked'), lit: c.classList.contains('on'),
    h: r.height, w: r.width, left: r.left, top: r.top, bottom: r.bottom,
    hit: top === c || c.contains(top), nm: c.querySelector('.nm').textContent, sub: c.querySelector('.sub').textContent };
}));
const tapChip = async (page, chip) => { await tapAt(page, chip.left + chip.w / 2, chip.top + chip.h / 2); await waitFrames(page, 2); };
const spec = (page) => page.evaluate(() => AIRWORTHY_TEST.spec());

/* ---- 1. the shelf at 375x667 with nothing earned but one flight ---- */
{
  const { browser, page, errors } = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
  await page.evaluate(() => {
    AIRWORTHY_TEST.clearMedals(); AIRWORTHY_TEST.toField();
    AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 2);
  await tap(page, '#btnTrim');
  await waitFrames(page, 2);
  say(await page.evaluate(() => AIRWORTHY_TEST.trimOpen()), 'TRIM opens the sheet');
  const bank = await page.evaluate(() => AIRWORTHY_TEST.doodads());
  const chips = await readShelf(page);
  say(chips.length === bank.length + 1 && chips[0].id === 'none',
    'the shelf holds every doodad in the bank and an empty seat first (' + chips.length + ' chips for ' + bank.length + ')');
  say(chips.every(c => c.h >= 48 && c.w >= 48), 'every chip is a 48 px target ('
    + chips.map(c => c.w.toFixed(0) + 'x' + c.h.toFixed(0)).join(' ') + ')');
  say(chips.every(c => c.hit), 'and a thumb at its centre lands on it');
  say(chips.every(c => !(c.left < 120 && c.bottom > 667 - 120)), 'and none of them sits in the music chip\'s corner');
  say(chips.every(c => c.top > 667 * 0.12), 'and none of them is in the top band (first at ' + Math.round(chips[0].top) + ' px)');
  say(chips.find(c => c.id === 'none').lit && !chips.some(c => c.id !== 'none' && c.lit), 'with nothing taped on, the empty seat is the one lit');
  say(!chips.find(c => c.id === 'clip').locked, 'the paperclip is open with nothing earned');
  say(!chips.find(c => c.id === 'eyes').locked, 'and the googly eyes opened on that one flight');
  const shut = chips.filter(c => c.locked);
  say(shut.length === bank.filter(d => !d.open).length && shut.length >= 5,
    'every doodad not yet earned is a silhouette (' + shut.length + ' shut: ' + shut.map(c => c.id).join(', ') + ')');
  say(shut.every(c => /bronze|silver|gold/.test(c.sub)), 'and each silhouette says its feat (' + shut.map(c => c.sub).join(', ') + ')');
  const open0 = chips.filter(c => !c.locked && c.id !== 'none');
  say(open0.every(c => / g$/.test(c.sub)), 'and each open one says its weight (' + open0.map(c => c.nm + ' ' + c.sub).join(', ') + ')');

  /* a REAL tap on a locked chip */
  const penny = chips.find(c => c.id === 'penny');
  say(!!penny && penny.locked, 'the penny is shut with no bronze');
  await tapChip(page, penny);
  const after = await page.evaluate(() => ({ d: AIRWORTHY_TEST.spec().doodad, c: AIRWORTHY_TEST.spec().clip,
    toast: document.getElementById('toast').textContent, on: document.getElementById('toast').classList.contains('on') }));
  say(after.c === 'none', 'a tap on a locked doodad tapes nothing on (the plane still carries ' + after.c + ')');
  say(after.on && /Win a bronze to tape this on/.test(after.toast), 'and it says the feat: "' + after.toast + '"');
  say((await readShelf(page)).find(c => c.id === 'none').lit, 'and the empty seat stays lit');

  const wh = await centre(page, '#doodadWhere');
  say(!!wh && wh.h >= 48 && wh.onTop, 'the where canvas is a real target (' + (wh ? wh.h.toFixed(0) + ' px' : 'missing') + ')');
  const go = await centre(page, '#btnTrimDone');
  say(!!go && go.h >= 48 && go.onTop && (go.x - go.w / 2) >= 120,
    'THROW IT is 48 px, on top, and keeps out of the music corner (left edge ' + (go ? (go.x - go.w / 2).toFixed(0) : '?') + ')');
  const rings0 = await page.evaluate(() => AIRWORTHY_TEST.doodadRings());
  say(rings0.length === 0, 'with nothing taped on there is no ring to tap (' + rings0.length + ')');

  /* one bronze opens the penny, through the game's own count */
  await page.evaluate(() => { AIRWORTHY_TEST.earnMedal('gym-far', 'bronze'); AIRWORTHY_TEST.renderDoodads(); });
  await waitFrames(page, 1);
  const chips2 = await readShelf(page);
  const penny2 = chips2.find(c => c.id === 'penny');
  say(!!penny2 && !penny2.locked && / g$/.test(penny2.sub), 'one bronze opens the penny and its chip says its weight (' + penny2.sub + ')');
  say(chips2.find(c => c.id === 'spinner').locked && /gold/.test(chips2.find(c => c.id === 'spinner').sub),
    'and the spinner is still shut, asking for a gold (' + chips2.find(c => c.id === 'spinner').sub + ')');
  await tapChip(page, penny2);
  const sp1 = await spec(page);
  say(sp1.doodad === 'penny' && sp1.clip === 'nose', 'a tap tapes it on at its first place (' + sp1.doodad + ' ' + sp1.clip + ')');
  const line1 = await page.evaluate(() => document.getElementById('doodadLine').textContent);
  say(/Penny/.test(line1) && /on the nose/.test(line1) && /2\.5 g/.test(line1), 'and the line says what, where and how heavy: "' + line1 + '"');
  const rings = await page.evaluate(() => AIRWORTHY_TEST.doodadRings());
  say(rings.length === 2 && rings.some(r => r.place === 'nose' && r.here) && rings.some(r => r.place === 'mid' && !r.here),
    'the plane shows both places a penny can go (' + rings.map(r => r.place + (r.here ? ' *' : '')).join(', ') + ')');
  const gap = rings.length === 2 ? Math.hypot(rings[0].x - rings[1].x, rings[0].y - rings[1].y) : 0;
  say(gap >= 48, 'and the two rings are a whole thumb apart (' + gap.toFixed(0) + ' px)');
  say(rings.every(r => r.x > 0 && r.x < 375 && r.y > 0 && r.y < 667 && r.radius >= 24), 'and both are on the screen at a 48 px radius');
  const mid = rings.find(r => r.place === 'mid');
  const hitEl = await tapAt(page, mid.x, mid.y);
  await waitFrames(page, 2);
  const sp2 = await spec(page);
  say(hitEl === 'doodadWhere' && sp2.clip === 'mid', 'a tap on the middle ring moves it there (landed on ' + hitEl + ', now ' + sp2.clip + ')');
  say(/in the middle/.test(await page.evaluate(() => document.getElementById('doodadLine').textContent)), 'and the line follows it');
  const chips3 = await readShelf(page);
  say(chips3.find(c => c.id === 'penny').lit && !chips3.find(c => c.id === 'none').lit, 'the penny chip is the one lit now');
  await tapChip(page, chips3.find(c => c.id === 'none'));
  const sp3 = await spec(page);
  say(sp3.clip === 'none', 'the empty seat takes it off again (' + sp3.clip + ')');
  await tapChip(page, chips3.find(c => c.id === 'penny'));
  say((await spec(page)).clip === 'nose', 'and the penny goes back to its first place when taped on again');

  /* THROW IT with the penny on: the card shows what flew */
  await tap(page, '#btnTrimDone');
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 2);
  const card = await page.evaluate(() => ({ on: document.getElementById('resultCard').classList.contains('on'),
    shown: !document.getElementById('resultDoodad').hidden, r: AIRWORTHY_TEST.result() }));
  say(card.on && card.shown, 'the result card draws the doodad that flew');
  say(card.r && card.r.bounces === 0 && !card.r.folded, 'and a penny neither bounces nor folds the wing');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- 2. the ball lands twice and the Brick earns its badge, on the phone he carries ---- */
{
  const { browser, page, errors } = await open(s.base, { width: 412, height: 915, deviceScaleFactor: 1 });
  await page.evaluate(() => {
    AIRWORTHY_TEST.clearMedals();
    ['gym-far', 'gym-hang', 'gym-desk'].forEach(id => AIRWORTHY_TEST.earnMedal(id, 'silver'));
    AIRWORTHY_TEST.toField({ noseFolds: 2, nose: 'pointed', wing: 0.5 });
    AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 2);
  await tap(page, '#btnTrim');
  await waitFrames(page, 2);
  const chips = await readShelf(page);
  say(chips.every(c => c.h >= 48 && c.hit) && chips.every(c => !(c.left < 120 && c.bottom > 915 - 120)),
    '412x915: every chip is a 48 px target a thumb lands on, out of the corner');
  const ball = chips.find(c => c.id === 'ball');
  say(!!ball && !ball.locked, 'three silvers open the bouncy ball');
  say(chips.find(c => c.id === 'spinner').locked, 'and not the spinner');
  await tapChip(page, ball);
  say((await spec(page)).doodad === 'ball' && (await spec(page)).clip === 'nose', 'the ball goes on the nose');
  await tap(page, '#btnTrimDone');
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 2);
  const b = await page.evaluate(() => ({ r: AIRWORTHY_TEST.result(), line: document.getElementById('resultLine').textContent }));
  say(b.r && b.r.bounces === 1, 'the ball plane bounced once on the way to its landing (' + (b.r ? b.r.bounces : '?') + ')');
  say(/Down at [0-9.]+ m, up, and down again at [0-9.]+ m\./.test(b.line), 'and the card says so: "' + b.line.replace(/\s+/g, ' ').slice(0, 120) + '"');
  const bx = b.line.match(/Down at ([0-9.]+) m, up, and down again at ([0-9.]+) m/);
  say(!!bx && Number(bx[2]) > Number(bx[1]) && Math.abs(Number(bx[2]) - b.r.distance) < 0.06,
    'and the second landing is the distance on the card (' + (bx ? bx[1] + ' then ' + bx[2] : '?') + ' against ' + b.r.distance.toFixed(2) + ')');

  /* the Brick */
  await page.evaluate(() => AIRWORTHY_TEST.earnMedal('gym-far', 'gold'));
  await tap(page, '#btnTrim');
  await waitFrames(page, 2);
  const chips2 = await readShelf(page);
  const spinner = chips2.find(c => c.id === 'spinner');
  say(!!spinner && !spinner.locked, 'one gold opens the fidget spinner');
  await tapChip(page, spinner);
  const sp = await spec(page);
  say(sp.doodad === 'spinner' && sp.clip === 'wing', 'and it goes on the wing, the only place it can (' + sp.clip + ')');
  say((await page.evaluate(() => AIRWORTHY_TEST.doodadRings())).length === 1, 'so there is one ring and nothing to move it to');
  await tap(page, '#btnTrimDone');
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 2);
  const k = await page.evaluate(() => ({ r: AIRWORTHY_TEST.result(), line: document.getElementById('resultLine').textContent,
    name: document.getElementById('resultName').textContent, seen: AIRWORTHY_TEST.seen() }));
  say(k.r && k.r.klass === 'brick' && k.name === 'The Brick', 'the namer calls it The Brick (' + k.name + ')');
  say(k.r && k.r.distance < 2 && k.r.folded, 'down inside two metres with the wing folded in the hand (' + (k.r ? k.r.distance.toFixed(2) : '?') + ' m)');
  say(/The wing folded in your hand\./.test(k.line), 'the card says the wing folded');
  say(/A badge for that\. Everyone does it once\./.test(k.line) && k.seen.badges && k.seen.badges.brick === 1,
    'and the first Brick earns its badge line');
  await page.evaluate(() => { document.getElementById('btnResultDone').click(); AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish(); });
  await waitFrames(page, 2);
  const k2 = await page.evaluate(() => ({ r: AIRWORTHY_TEST.result(), line: document.getElementById('resultLine').textContent }));
  say(k2.r.klass === 'brick' && !/A badge for that/.test(k2.line), 'the second Brick is still a Brick and the badge is said once');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- 3. the hangar: a record from before the shelf, then a round trip through the game's own writer ---- */
{
  const OLD = { v: 1, nextId: 2, seen: { flown: 1 }, settings: { sound: 1, motion: 1, steadyHands: 0 },
    medals: { 'gym-far': 'bronze' }, scores: {}, ghosts: {},
    hangar: [{ id: 1, name: 'Gary', klass: null, best: null, throws: 0,
      spec: { nose: 'pointed', noseFolds: 3, wing: 0.5, fins: 'none', dihedral: 0.4, precision: 0.8, elev: 0, ail: 0, clip: 'nose' } }] };
  const { browser, page, errors } = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
  await page.evaluate((k, o) => localStorage.setItem(k, JSON.stringify(o)), SAVE_KEY, OLD);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.AIRWORTHY_TEST && window.AIRWORTHY_TEST.frames() > 2, { timeout: 30000 });
  const h = await page.evaluate(() => AIRWORTHY_TEST.hangar());
  say(h.length === 1 && h[0].name === 'Gary', 'a hangar saved before the shelf still loads (' + h.length + ' plane)');
  say(h[0].spec.doodad === 'clip' && h[0].spec.clip === 'nose', 'and its clip reads as a paperclip on the nose (' + h[0].spec.doodad + ' ' + h[0].spec.clip + ')');
  await tap(page, '#btnFly');
  await waitFrames(page, 2);
  const m = await page.evaluate(() => {
    const sp = AIRWORTHY_TEST.spec(), bare = Object.assign({}, sp, { clip: 'none' });
    return { doodad: sp.doodad, clip: sp.clip,
      grams: (AIRWORTHY_TEST.fly(sp, { angle: 8, power: 0.5 }).derived.mass - AIRWORTHY_TEST.fly(bare, { angle: 8, power: 0.5 }).derived.mass) * 1000 };
  });
  say(m.doodad === 'clip' && m.clip === 'nose' && Math.abs(m.grams - 1) < 1e-6,
    'TO THE GYM flies that plane with the gram it always carried (' + m.grams.toFixed(3) + ' g)');
  /* tape the penny on in the middle, fly, and let the hangar's own writer keep it */
  await page.evaluate(() => { AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish(); });
  await waitFrames(page, 2);
  await tap(page, '#btnTrim');
  await waitFrames(page, 2);
  const chips = await readShelf(page);
  await tapChip(page, chips.find(c => c.id === 'penny'));
  const rings = await page.evaluate(() => AIRWORTHY_TEST.doodadRings());
  const mid = rings.find(r => r.place === 'mid');
  say(!!mid, 'the penny is on and the middle ring is there to tap');
  if (mid) { await tapAt(page, mid.x, mid.y); await waitFrames(page, 2); }
  say((await spec(page)).doodad === 'penny' && (await spec(page)).clip === 'mid', 'the penny is in the middle');
  await tap(page, '#btnTrimDone');
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 2);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.AIRWORTHY_TEST && window.AIRWORTHY_TEST.frames() > 2, { timeout: 30000 });
  const h2 = await page.evaluate(() => AIRWORTHY_TEST.hangar());
  say(h2.length === 1 && h2[0].throws === 2, 'after two flights the hangar has the same one plane with two throws (' + (h2[0] ? h2[0].throws : '?') + ')');
  say(h2[0].spec.doodad === 'penny' && h2[0].spec.clip === 'mid',
    'and it remembers the doodad and its place through its own writer (' + h2[0].spec.doodad + ' ' + h2[0].spec.clip + ')');
  say(h2[0].spec.noseFolds === 3 && h2[0].spec.nose === 'pointed' && Math.abs(h2[0].spec.precision - 0.8) < 1e-9,
    'and the fold underneath is untouched');
  /* the hangar card draws it: the plan view's canvas has ink where the penny sits */
  await page.evaluate(() => { document.getElementById('btnHangar').click(); });
  await waitFrames(page, 3);
  const cardInk = await page.evaluate(() => {
    const cv = document.querySelector('#scrHangar canvas');
    if (!cv) return null;
    const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height).data;
    let copper = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] > 150 && d[i] < 210 && d[i + 1] > 90 && d[i + 1] < 140 && d[i + 2] < 90) copper++;
    return copper;
  });
  say(cardInk !== null && cardInk > 20, 'and the hangar card draws the penny on the plane (' + cardInk + ' copper pixels)');

  /* the link: a locked doodad does not ride in, an earned one does */
  const link = await page.evaluate(() => AIRWORTHY_TEST.link({ nose: 'pointed', noseFolds: 2, wing: 0.5, fins: 'none',
    dihedral: 0.4, precision: 0.8, elev: 0, ail: 0, clip: 'wing', doodad: 'spinner' }));
  const hash = link.slice(link.indexOf('#'));
  const gotShut = await page.evaluate((hh) => { AIRWORTHY_TEST.importHash(hh); return AIRWORTHY_TEST.spec(); }, hash);
  say(gotShut.clip === 'none' && gotShut.doodad === 'clip' && gotShut.noseFolds === 2,
    'a shared plane with a spinner arrives with nothing taped on when the spinner is not earned (' + gotShut.doodad + ' ' + gotShut.clip + ')');
  const gotOpen = await page.evaluate((hh) => { AIRWORTHY_TEST.earnMedal('gym-far', 'gold'); AIRWORTHY_TEST.importHash(hh); return AIRWORTHY_TEST.spec(); }, hash);
  say(gotOpen.clip === 'wing' && gotOpen.doodad === 'spinner', 'and with the gold it comes through on the wing (' + gotOpen.doodad + ' ' + gotOpen.clip + ')');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' DOODADS FAILURE(S)'); process.exit(1); }
console.log('DOODADS OK');
