#!/usr/bin/env node
/* THE DOODADS SHELF, with a real thumb (docs/GEAR-DOODADS-SEP08.md, the Updraft half).
 *
 *   node test/doodads.mjs
 *
 * Every RULE of the shelf lives in sim.js (the bank, the physics, the spinner's
 * law, the bell against its gust, the messenger, the unlocks, the copy). What
 * only a browser can say is here:
 *   1. a save from before the shelf, with no doodad field, loads with its
 *      journal intact and wears nothing, and a save that wears one round trips
 *   2. DOODADS is a 48 px door on the kites screen; the shelf is nine chips, each
 *      48 px by elementFromPoint, none in the music chip's corner or the top band
 *   3. a locked chip is a silhouette whose second line is its feat; a real tap
 *      on it toasts the feat in full and wears nothing
 *   4. a real tap on an open chip wears it, one at a time: the chip lights, the
 *      save carries it, the kite on the grass wears it at once, the card shows it
 *   5. every doodad PAINTS on the flying kite (a differential off the canvas)
 * ⛔ every chip is tapped at a point elementFromPoint says is the chip.
 * ⛔ every assertion here was watched red under a planted mutation before it
 * was trusted (the plan's SESSION STATE, 2026-09-08).
 * UPDRAFT_DEV.place puts the kite aloft for the ink count, as test/kites.mjs
 * does; UPDRAFT_DEV.timeScale slows the clock while the frame is read.
 */
import { serve, open, reporter, tap, centre, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const KEY = 'lw_updraft_v1';
const screen = (page, n) => page.waitForFunction((n) => window.UPDRAFT_DEV.screen() === n, { timeout: 30000 }, n);
const dev = (page, fn, ...a) => page.evaluate(fn, ...a);
/* a save from BEFORE the shelf: no doodad field at all, a journal that has earned everything */
const RICH = { v: 1, journal: { bestAlt: 70, longest: 300, tricks: { 'Loop': 12, 'High Park': 1 }, hours: 3, flights: 20 }, kite: 'diamond', mood: 'gentle' };
const FRESH = { v: 1, journal: { bestAlt: 0, longest: 0, tricks: {}, hours: 0, flights: 0 }, kite: 'diamond', mood: 'gentle' };
const boot = async (page, save) => {
  await dev(page, (k, s) => { if (s) localStorage.setItem(k, JSON.stringify(s)); }, KEY, save);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
};
const readShelf = page => dev(page, () => [...document.querySelectorAll('#doodadShelf .dchip')].map(c => {
  const r = c.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { id: c.getAttribute('data-doodad'), locked: c.classList.contains('locked'), on: c.classList.contains('on'),
    w: r.width, h: r.height, left: r.left, top: r.top, right: r.right, bottom: r.bottom,
    hit: top === c || c.contains(top), nm: c.querySelector('.nm').textContent, sub: c.querySelector('.sub').textContent };
}));
/* a real tap on a chip: down, up and the click a finger makes, at the element
   elementFromPoint says is under the thumb */
const tapChip = async (page, chip) => {
  await page.evaluate((x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el) throw new Error('nothing under the thumb at ' + x + ',' + y);
    const o = { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
    el.dispatchEvent(new PointerEvent('pointerdown', o));
    el.dispatchEvent(new PointerEvent('pointerup', o));
    el.click();
  }, chip.left + chip.w / 2, chip.top + chip.h / 2);
  await waitFrames(page, 2);
};
const toShelf = async (page) => {
  await tap(page, '#btnPause'); await screen(page, 'pause');
  await tap(page, '#btnKites'); await screen(page, 'kites');
  await tap(page, '#btnDoodads'); await screen(page, 'doodads');
  await waitFrames(page, 2);
};
const clean = t => !/[-‐-―−!]/.test(t);
const shelfLaws = (chips, W, H, tag) => {
  const small = chips.filter(c => c.w < 48 || c.h < 48 || !c.hit);
  say(chips.length === 9 && small.length === 0, tag + ' nine chips, every one 48 px by elementFromPoint at its centre'
    + (small.length ? ': ' + small.map(c => c.id + ' ' + c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.hit ? '' : ' covered')).join(', ') : ' (' + chips.map(c => c.w.toFixed(0) + 'x' + c.h.toFixed(0)).join(' ') + ')'));
  const corner = chips.filter(c => c.left < 120 && c.bottom > H - 120), band = chips.filter(c => c.top < 70), off = chips.filter(c => c.bottom > H || c.right > W);
  say(corner.length === 0 && band.length === 0 && off.length === 0, tag + ' none sits in the music chip\'s corner, the top band, or off the screen'
    + (corner.length ? ' (corner: ' + corner.map(c => c.id).join(' ') + ')' : '') + (band.length ? ' (band: ' + band.map(c => c.id).join(' ') + ')' : '') + (off.length ? ' (off: ' + off.map(c => c.id).join(' ') + ')' : ''));
  say(chips.every(c => clean(c.nm) && clean(c.sub)), tag + ' no dash or exclamation point on any chip');
};

/* ---- 1. an old save, the door, the shelf, wearing, the round trip, the card, the ink: 375x667 ---- */
{
  const { browser, page, errors } = await open(base, { width: 375, height: 667 });
  await boot(page, RICH);
  const sv = await dev(page, (k) => JSON.parse(localStorage.getItem(k)), KEY);
  say(sv.doodad === undefined && sv.v === 1, 'the save on disk has no doodad field: a save from before the shelf');
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  const w0 = await dev(page, () => window.UPDRAFT_DEV.worn());
  say(w0.save === 'none' && w0.flight === 'none', 'and it loads wearing nothing (' + JSON.stringify(w0) + ')');
  await tap(page, '#btnPause'); await screen(page, 'pause');
  await tap(page, '#btnJournal'); await screen(page, 'journal');
  const rows = await dev(page, () => ({ alt: document.getElementById('jAlt').textContent, hours: document.getElementById('jHours').textContent,
    flights: document.getElementById('jFlights').textContent, stamps: document.getElementById('jStamps').textContent.replace(/\s+/g, ' ') }));
  say(/70 M/.test(rows.alt) && /3 H/.test(rows.hours) && /20/.test(rows.flights) && /Loop/.test(rows.stamps) && /12/.test(rows.stamps),
    'with its journal intact: ' + rows.alt + ', ' + rows.hours + ', ' + rows.flights + ', ' + rows.stamps);
  await tap(page, '#btnJournalBack'); await screen(page, 'pause');
  await tap(page, '#btnKites'); await screen(page, 'kites');
  const door = await centre(page, '#btnDoodads');
  say(!!door && door.w >= 48 && door.h >= 48 && door.onTop, 'DOODADS on the kites screen is 48 px and on top (' + (door ? door.w.toFixed(0) + 'x' + door.h.toFixed(0) : 'MISSING') + ')');
  const fits = await dev(page, () => { const b = document.getElementById('btnKitesBack').getBoundingClientRect(); return { back: Math.round(b.bottom), h: window.innerHeight }; });
  say(fits.back <= fits.h, 'and BACK still sits on the screen beside it (' + fits.back + ' of ' + fits.h + ')');
  await tap(page, '#btnDoodads'); await screen(page, 'doodads'); await waitFrames(page, 2);
  const bank = await dev(page, () => window.UPDRAFT_DEV.doodads());
  const chips = await readShelf(page);
  say(chips.map(c => c.id).join(',') === bank.map(d => d.id).join(','), 'the chips are the bank in its order (' + chips.map(c => c.id).join(' ') + ')');
  shelfLaws(chips, 375, 667, '375x667');
  say(chips.every(c => !c.locked), 'on a journal that has earned everything, every chip is open');
  say(chips.filter(c => c.on).length === 1 && chips.find(c => c.on).id === 'none', 'and NOTHING is the one lit');
  say(bank.every(d => clean(d.feat) && clean(d.line) && clean(d.name)), 'every feat and line the page can say is clean');
  const back = await centre(page, '#btnDoodadsBack');
  say(!!back && back.h >= 48 && back.onTop, 'BACK from the shelf is 48 px and on top');
  /* wear the ball, by a real tap */
  await tapChip(page, chips.find(c => c.id === 'ball'));
  const after = await readShelf(page);
  const w1 = await dev(page, () => window.UPDRAFT_DEV.worn());
  say(after.find(c => c.id === 'ball').on && !after.find(c => c.id === 'none').on && after.filter(c => c.on).length === 1, 'a real tap on the ball lights it and NOTHING goes out: one at a time');
  say(w1.save === 'ball' && w1.flight === 'ball', 'the save carries it and the kite on the grass wears it at once (' + JSON.stringify(w1) + ')');
  say(after.find(c => c.id === 'ball').sub === 'on the kite', 'and its chip says so (' + after.find(c => c.id === 'ball').sub + ')');
  const line = await dev(page, () => document.getElementById('doodadLine').textContent);
  say(/Bouncy ball/.test(line) && /anchor/.test(line) && /tail/.test(line), 'the line under the shelf is the ball\'s, and where it rides: "' + line + '"');
  const sv2 = await dev(page, (k) => JSON.parse(localStorage.getItem(k)), KEY);
  say(sv2.doodad === 'ball' && sv2.journal.bestAlt === 70 && sv2.journal.flights === 20 && sv2.v === 1,
    'the save on disk carries the field now, the journal and the version untouched (v ' + sv2.v + ', doodad ' + sv2.doodad + ', ' + sv2.journal.bestAlt + ' m, ' + sv2.journal.flights + ' flights)');
  /* wear the bell over it: one at a time */
  await tapChip(page, after.find(c => c.id === 'bell'));
  const after2 = await readShelf(page);
  const w2 = await dev(page, () => window.UPDRAFT_DEV.worn());
  say(after2.filter(c => c.on).length === 1 && after2.find(c => c.on).id === 'bell' && w2.save === 'bell' && w2.flight === 'bell', 'the bell over it takes the ball off: one doodad on the kite');
  /* the round trip: reload, the bell is still worn and the next flight wears it */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  const w3 = await dev(page, () => window.UPDRAFT_DEV.worn());
  const sv3 = await dev(page, (k) => JSON.parse(localStorage.getItem(k)), KEY);
  say(w3.save === 'bell' && w3.flight === 'bell' && sv3.journal.bestAlt === 70, 'after a reload the bell is still worn, the flight wears it, the journal is still there (' + JSON.stringify(w3) + ')');
  /* the card carries the worn doodad */
  await tap(page, '#btnPause'); await screen(page, 'pause');
  await tap(page, '#btnKites'); await screen(page, 'kites'); await waitFrames(page, 2);
  const card = await dev(page, () => {
    const cv = document.querySelector('#kiteDiamond canvas.kmark');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let ink = 0, sig = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 16) { ink++; sig = (sig * 31 + ((i >> 2) ^ d[i - 3] ^ (d[i - 2] << 8) ^ (d[i - 1] << 16))) % 1000003; }
    return { ink, sig, bare: window.UPDRAFT_DEV.kiteMarkSig('diamond', 'none'), bell: window.UPDRAFT_DEV.kiteMarkSig('diamond', 'bell') };
  });
  say(card.sig === card.bell.sig && card.sig !== card.bare.sig && card.bell.changed > 8, 'the Diamond\'s card carries the bell: its mark is the bell picture and not the bare one (' + card.bell.changed + ' pixels changed)');
  const marks = await dev(page, () => { const ids = window.UPDRAFT_DEV.doodads().map(d => d.id); return ids.filter(id => id !== 'none').map(id => { const m = window.UPDRAFT_DEV.kiteMarkSig('diamond', id); return { id, changed: m.changed, sig: m.sig }; }); });
  say(marks.every(m => m.changed > 8) && new Set(marks.map(m => m.sig)).size === marks.length, 'every doodad draws on the card, a differential against the bare mark, and no two are the same picture (' + marks.map(m => m.id + ':' + m.changed).join(' ') + ')');
  /* every doodad paints on the flying kite: worn by a real tap, then placed aloft */
  await tap(page, '#btnDoodads'); await screen(page, 'doodads'); await waitFrames(page, 2);
  const inks = [];
  for (const id of bank.map(d => d.id).filter(id => id !== 'none')) {
    const cs = await readShelf(page);
    await tapChip(page, cs.find(c => c.id === id));
    await tap(page, '#btnDoodadsBack'); await screen(page, 'kites');
    await tap(page, '#btnKitesBack'); await screen(page, 'pause');
    await tap(page, '#btnResume'); await screen(page, 'play');
    await dev(page, () => { window.UPDRAFT_DEV.timeScale(0.02); window.UPDRAFT_DEV.place({ L: 16, el: 0.8, az: -0.1, launched: true }); });
    await waitFrames(page, 3);
    const ink = await dev(page, () => window.UPDRAFT_DEV.doodadInk());
    inks.push({ id, ink: ink ? ink.ink : -1, worn: ink ? ink.doodad : '?' });
    await dev(page, () => { window.UPDRAFT_DEV.timeScale(1); window.UPDRAFT_DEV.place({ L: 8, el: 0, az: 0, launched: false }); });
    await waitFrames(page, 2);
    await toShelf(page);
  }
  say(inks.every(x => x.worn === x.id && x.ink >= 12), 'every doodad paints on the flying kite at 16 m of line, a differential off the canvas (' + inks.map(x => x.id + ':' + x.ink).join(' ') + ')');
  /* back to nothing, by a tap */
  await tapChip(page, (await readShelf(page)).find(c => c.id === 'none'));
  const w4 = await dev(page, () => window.UPDRAFT_DEV.worn());
  say(w4.save === 'none' && w4.flight === 'none', 'a tap on NOTHING takes it off (' + JSON.stringify(w4) + ')');
  say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

/* ---- 2. a fresh journal at 412x915: everything locked but NOTHING, a locked tap wears nothing, one flight opens the ribbon ---- */
{
  const { browser, page, errors } = await open(base, { width: 412, height: 915 });
  await boot(page, FRESH);
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  await toShelf(page);
  const chips = await readShelf(page);
  shelfLaws(chips, 412, 915, '412x915');
  const bank = await dev(page, () => window.UPDRAFT_DEV.doodads());
  say(chips.filter(c => c.locked).map(c => c.id).join(' ') === bank.filter(d => d.id !== 'none').map(d => d.id).join(' '), 'on a fresh journal every chip but NOTHING is a locked silhouette');
  say(chips.filter(c => c.locked).every(c => c.sub === bank.find(d => d.id === c.id).featShort && c.sub.length > 2), 'and each locked chip\'s second line is its feat (' + chips.filter(c => c.locked).map(c => c.id + ': ' + c.sub).join(', ') + ')');
  /* the locked tap: the game's own tap, on the ribbon, wears nothing and says the feat */
  await tapChip(page, chips.find(c => c.id === 'ribbon'));
  const toastText = await dev(page, () => document.getElementById('toast').textContent);
  const toastOn = await dev(page, () => document.getElementById('toast').classList.contains('on'));
  const wl = await dev(page, () => window.UPDRAFT_DEV.worn());
  const afterL = await readShelf(page);
  say(toastOn && toastText === bank.find(d => d.id === 'ribbon').feat + '.', 'a tap on a locked chip toasts its feat in full: "' + toastText + '"');
  say(wl.save === 'none' && wl.flight === 'none' && !afterL.find(c => c.id === 'ribbon').on && afterL.find(c => c.id === 'none').on,
    'and wears nothing: the save, the flight and the chip all say NOTHING (' + JSON.stringify(wl) + ')');
  const svL = await dev(page, (k) => JSON.parse(localStorage.getItem(k)), KEY);
  say(svL.doodad === undefined || svL.doodad === 'none', 'the save on disk agrees: no field was written, or it says none (' + svL.doodad + ')');
  /* the same on the spinner, the one everybody will try */
  await tapChip(page, afterL.find(c => c.id === 'spinner'));
  const ws = await dev(page, () => window.UPDRAFT_DEV.worn());
  say(ws.save === 'none' && /Dragon/.test(await dev(page, () => document.getElementById('toast').textContent)), 'the spinner too: locked behind the Dragon, a tap says so and wears nothing');
  say(errors.length === 0, '412x915 nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  /* one flight opens the ribbon tail and nothing else */
  await boot(page, Object.assign({}, FRESH, { journal: Object.assign({}, FRESH.journal, { flights: 1 }) }));
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  await toShelf(page);
  const c1 = await readShelf(page);
  say(!c1.find(c => c.id === 'ribbon').locked && c1.filter(c => c.locked).length === 7, 'one flight in the journal opens the ribbon tail and nothing else');
  await tapChip(page, c1.find(c => c.id === 'ribbon'));
  const wr = await dev(page, () => window.UPDRAFT_DEV.worn());
  say(wr.save === 'ribbon' && wr.flight === 'ribbon', 'and a tap on it wears it (' + JSON.stringify(wr) + ')');
  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' DOODADS FAILURE(S)'); process.exit(1); }
console.log('DOODADS OK');
