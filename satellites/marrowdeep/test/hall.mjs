#!/usr/bin/env node
/* THE HALL GATE (lane A, the A1 faults on the Hall's two sheets, 2026-09-14).
 *
 *   node test/hall.mjs
 *
 * Found by playing, not by any gate: COMMISSION took 40 Renown and painted
 * nothing; RAISE A FLOOR raised a stat chosen by `marrow % 4` and printed 3 for a
 * step that charged 6; WARD SHELF printed 15 for a slot that charged 45; UNLOCK
 * AN ORIGIN took the first of three it never showed; and the sheet indexed its
 * prices by the deepest UNLOCKED Depth while the engine charges by the deepest
 * COMPLETED one. Every one is a sheet saying a thing its tap does not do.
 *
 * THE LAWS, each through real taps on a page RELOADED into a fixture (the three
 * free characters are rolled by taps first; the fixture only fills the purse):
 *   1. A PRICE IS A DIFFERENTIAL. For every row, the number printed on it equals
 *      what the tap took out of the purse, read before and after. A refusal takes
 *      nothing. Asserted twice on the rows whose price moves (the ward shelf, the
 *      roster slot, a floor), because the second price is where two of the faults
 *      lived.
 *   2. RAISE A FLOOR raises the stat the thumb chose, and no other.
 *   3. COMMISSION: the thumb picks the slot; three relics of that slot are dealt;
 *      the deal SURVIVES A RELOAD (Renown already paid for it); the one kept goes
 *      to the drop screen, and the body it is put on wears it.
 *   4. UNLOCK AN ORIGIN unlocks the one the thumb picked from the three shown.
 *   5. No console or page error.
 */
import { serve, open, reporter, tap, waitScreen } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const { browser, page, errors } = await open(base, { width: 375, height: 667 });

/* three free characters, by taps */
await page.evaluate(n => window.MD_DEV.seed(n), 2);
await tap(page, '#btnBegin');
for (let i = 0; i < 3; i++) {
  await waitScreen(page, 'creation');
  await tap(page, '#btnRoll');
  await page.waitForFunction(() => document.querySelectorAll('#creCallings .card').length > 0, { timeout: 20000 });
  await tap(page, '#creCallings .card');
  await page.waitForFunction(() => { const b = document.getElementById('btnKeep'); return !!b && !b.hidden; }, { timeout: 20000 });
  await tap(page, '#btnKeep');
}
await page.waitForFunction(() => ['how', 'hall'].indexOf(window.MD_DEV.screen()) >= 0, { timeout: 20000 });
if (await page.evaluate(() => window.MD_DEV.screen()) === 'how') await tap(page, '#btnGotIt');
await waitScreen(page, 'hall');

/* the fixture: the same save with a purse and one Depth completed, reloaded into */
const reloadInto = async (save) => {
  await page.evaluate(s => window.MD_DEV.fixture(s), save).catch(() => {});
  await page.waitForFunction(() => !!window.MD_DEV && window.MD_DEV.ready === true && window.MD_DEV.screen() === 'title', { timeout: 30000 });
  await tap(page, '#btnBegin');
  await waitScreen(page, 'hall');
};
const fx = await page.evaluate(() => {
  const s = window.MD_DEV.save();
  s.account.renown = 600; s.account.renownLifetime = 600; s.account.marrow = 60;
  s.account.deepestCompleted = 2; s.account.questsCompleted = 3;
  return s;
});
await reloadInto(fx);

const purse = () => page.evaluate(() => {
  const a = window.MD_DEV.account();
  return { renown: a.renown, marrow: a.marrow, floors: Object.assign({}, a.creationFloors), ward: a.wardShelfSlots,
    roster: a.rosterSlots, legacy: a.legacySlots, origins: a.unlockedOrigins.slice(),
    offer: (a.commissionOffer || []).map(r => r.name) };
});
/* the number at the end of a card's title line, or null when it carries none */
const priceOn = (sel) => page.evaluate(sel => {
  const el = document.querySelector(sel);
  if (!el) return undefined;
  const t = (el.querySelector('.cname') || el).textContent;
  const m = /(\d+)\s*$/.exec(t.trim());
  return m ? Number(m[1]) : null;
}, sel);
const has = sel => page.evaluate(sel => !!document.querySelector(sel), sel);

async function buy(label, sel, currency) {
  const p = await priceOn(sel);
  if (p === undefined) { say(false, label + ': there is no row ' + sel); return null; }
  const before = await purse();
  await tap(page, sel);
  const after = await purse();
  const took = before[currency] - after[currency];
  say(p !== null && took === p, label + ': printed ' + p + ' and took ' + took + ' ' + currency);
  return took;
}

/* ---- 1. the Renown sheet ------------------------------------------------------ */
await tap(page, '#btnSpendRenown');
await waitScreen(page, 'spend');
await buy('MEND', '#spBody [data-row="mend"]', 'renown');
const w1 = await buy('WARD SHELF, the first slot', '#spBody [data-row="wardSlot"]', 'renown');
const w2 = await buy('WARD SHELF, the second slot', '#spBody [data-row="wardSlot"]', 'renown');
say(w1 != null && w2 != null && w2 > w1, 'the second ward slot costs more than the first (' + w1 + ' then ' + w2 + ')');
{
  /* the roster is full of the three free characters, so RECRUIT refuses: it must take nothing */
  const marked = await page.evaluate(() => {
    const r = document.querySelector('#spBody [data-row="recruit"]');
    return r ? r.classList.contains('short') : null;
  });
  say(marked === true, 'RECRUIT is marked before the tap when the roster is full (' + marked + ')');
  const before = await purse();
  await tap(page, '#spBody [data-row="recruit"]');
  const after = await purse();
  say(before.renown === after.renown, 'a refused RECRUIT takes nothing (' + before.renown + ' then ' + after.renown + ')');
  const why = await page.evaluate(() => document.getElementById('spHave').textContent);
  say(/full|room/i.test(why), 'and the sheet says why: ' + JSON.stringify(why));
  say(new RegExp('\\b' + after.renown + ' renown in hand').test(why),
    'and the purse stays on the line beside the refusal (' + after.renown + ' renown)');
}

/* ---- 3. COMMISSION: choose the slot, see three, survive a reload, keep one --------- */
{
  const p = await priceOn('#spBody [data-row="commission"]');
  const before = await purse();
  await tap(page, '#spBody [data-row="commission"]');
  const slots = await page.evaluate(() => Array.from(document.querySelectorAll('#spBody [data-slot]')).map(e => e.getAttribute('data-slot')));
  say(slots.length === 8, 'COMMISSION asks which slot first, all eight (' + slots.join(', ') + ')');
  const midway = await purse();
  say(midway.renown === before.renown, 'and choosing is free until a slot is tapped');
  await tap(page, '#spBody [data-slot="charm"]');
  const paid = await purse();
  say(p != null && before.renown - paid.renown === p, 'COMMISSION printed ' + p + ' and took ' + (before.renown - paid.renown));
  const dealt = await page.evaluate(() => Array.from(document.querySelectorAll('#spBody [data-relic]')).map(e => e.textContent));
  say(dealt.length === 3 && dealt.every(t => /CHARM/.test(t)), 'three relics are dealt and every one is a Charm (' + dealt.length + ')');
  say(paid.offer.length === 3, 'the deal is in the save before anything is kept (' + paid.offer.length + ')');

  /* close the app on the deal: the Renown is spent, so the deal must still be there */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => !!window.MD_DEV && window.MD_DEV.ready === true && window.MD_DEV.screen() === 'title', { timeout: 30000 });
  await tap(page, '#btnBegin');
  await waitScreen(page, 'hall');
  await tap(page, '#btnSpendRenown');
  await waitScreen(page, 'spend');
  const afterReload = await purse();
  say(afterReload.renown === paid.renown, 'the reload charged nothing again (' + paid.renown + ' then ' + afterReload.renown + ')');
  await tap(page, '#spBody [data-row="commission"]');
  const again = await page.evaluate(() => Array.from(document.querySelectorAll('#spBody [data-relic]')).map(e => e.getAttribute('data-name')));
  say(again.length === 3 && again.join('|') === paid.offer.join('|'),
    'after a reload the same three wait, unpaid for twice (' + again.join(', ') + ')');
  const dealLine = await page.evaluate(() => document.getElementById('spHave').textContent);
  say(/BACK/.test(dealLine), 'the deal says that BACK leaves it waiting (' + JSON.stringify(dealLine) + ')');
  /* ⛔ Watched on H3 (the deal kept in memory only): with no card to tap the first
     draft THREW here, which still exits red but ends the gate mid page with a browser
     open. A missing card is a FAIL line, and the rest of the walk is skipped by name. */
  const keep = again[1];
  if (!(await has('#spBody [data-relic="1"]'))) {
    say(false, 'there is no second relic card to keep, so the drop screen and the wearing are not checked');
    /* BACK steps a sub sheet back to its sheet and the sheet back to the Hall, so it
       may take two; the Marrow half below starts from the Hall or it proves nothing */
    for (let i = 0; i < 3 && (await page.evaluate(() => window.MD_DEV.screen())) !== 'hall'; i++) {
      await tap(page, '#btnSpendBack').catch(() => {});
    }
  } else {
    await tap(page, '#spBody [data-relic="1"]');
    const reached = await waitScreen(page, 'drop').then(() => true).catch(() => false);
    say(reached, 'keeping a relic opens the drop screen');
    if (reached) {
      const onDrop = await page.evaluate(() => document.querySelector('#dropCard .cname').textContent);
      say(onDrop === keep, 'the one kept is the one on the drop screen (' + JSON.stringify(onDrop) + ')');
      const who = await page.evaluate(() => window.MD_DEV.state().roster.filter(c => c.alive)[0].id);
      await tap(page, '#dropTargets .tgt');
      await waitScreen(page, 'hall');
      const worn = await page.evaluate(id => {
        const c = window.MD_DEV.state().roster.filter(r => r.id === id)[0];
        return c && c.gear.charm ? c.gear.charm.name : null;
      }, who);
      say(worn === keep, 'and the body it was put on wears it (' + JSON.stringify(worn) + ')');
      const cleared = await purse();
      say(cleared.offer.length === 0, 'the other two are gone from the save');

      /* A2.4: rarity in words where a relic is WORN, which the layout walk never reaches
         because it takes the Renown on every drop: the Character screen's tile, and a
         second Commission's drop target for the body already wearing the first */
      const TIER = /\b(COMMON|UNCOMMON|RARE|RELIC)\b/;
      await tap(page, '#btnRoster');
      await waitScreen(page, 'roster');
      const row = await page.evaluate(id => window.MD_DEV.state().roster.findIndex(c => c.id === id) + 1, who);
      await tap(page, `#rosterList .rostrow:nth-child(${row})`);
      await waitScreen(page, 'character');
      /* ⛔ innerText, not textContent: the tier word and the name are two block lines, and
         textContent glues them into "UNCOMMONEchoing", where no word boundary exists, so the
         first draft of this law failed a tile that says its tier perfectly well */
      const tile = await page.evaluate(() => { const t = document.querySelector('#chBody .slot.full'); return t ? t.innerText : null; });
      say(!!tile && TIER.test(tile), 'the worn relic\'s tile on the Character screen names its tier (' + JSON.stringify(tile) + ')');
      await tap(page, '#btnCharBack');
      await waitScreen(page, 'roster');
      await tap(page, '#btnRosterBack');
      await waitScreen(page, 'hall');
      await tap(page, '#btnSpendRenown');
      await waitScreen(page, 'spend');
      await tap(page, '#spBody [data-row="commission"]');
      await tap(page, '#spBody [data-slot="charm"]');
      if (await has('#spBody [data-relic="0"]')) {
        await tap(page, '#spBody [data-relic="0"]');
        await waitScreen(page, 'drop');
        const wearing = await page.evaluate(() => { const w = document.querySelector('#dropTargets .tgt .wearing'); return w ? w.textContent : null; });
        say(!!wearing && TIER.test(wearing), 'a drop target already wearing a relic names its tier (' + JSON.stringify(wearing) + ')');
        await tap(page, '#btnSalvage');
        await waitScreen(page, 'hall');
      } else {
        say(false, 'a second Commission dealt no relic to keep, so the wearing target is not checked');
        for (let i = 0; i < 3 && (await page.evaluate(() => window.MD_DEV.screen())) !== 'hall'; i++) await tap(page, '#btnSpendBack').catch(() => {});
      }
    }
  }
}

/* ---- 2 and 1. the Marrow sheet --------------------------------------------------- */
await tap(page, '#btnSpendMarrow');
await waitScreen(page, 'spend');
{
  await tap(page, '#spBody [data-row="floor"]');
  const stats = await page.evaluate(() => Array.from(document.querySelectorAll('#spBody [data-pick]')).map(e => e.getAttribute('data-pick')));
  say(stats.join(',') === 'might,grace,wits,nerve', 'RAISE A FLOOR asks which stat (' + stats.join(', ') + ')');
  const f0 = await purse();
  const t1 = await buy('RAISE A FLOOR on GRACE, to d6', '#spBody [data-pick="grace"]', 'marrow');
  const f1 = await purse();
  say(f1.floors.grace === 6 && ['might', 'wits', 'nerve'].every(k => f1.floors[k] === f0.floors[k]),
    'it raised GRACE and nothing else ' + JSON.stringify(f1.floors));
  const t2 = await buy('RAISE A FLOOR on GRACE again, to d8', '#spBody [data-pick="grace"]', 'marrow');
  say(t1 != null && t2 != null && t2 > t1, 'the d8 step costs more than the d6 step (' + t1 + ' then ' + t2 + ')');
  const f2 = await purse();
  say(f2.floors.grace === 8, 'GRACE now never rolls under d8 (' + f2.floors.grace + ')');
  const top = await priceOn('#spBody [data-pick="grace"]');
  const before = await purse();
  await tap(page, '#spBody [data-pick="grace"]');
  const after = await purse();
  say(top === null && before.marrow === after.marrow, 'at the top floor the card carries no price and a tap takes nothing (' + top + ')');
  await tap(page, '#btnSpendBack');
}
await buy('ROSTER SLOT, the first', '#spBody [data-row="rosterSlot"]', 'marrow');
await buy('ROSTER SLOT, the second', '#spBody [data-row="rosterSlot"]', 'marrow');
await buy('LEGACY SLOT', '#spBody [data-row="legacySlot"]', 'marrow');
{
  const p = await priceOn('#spBody [data-row="origin"]');
  const before = await purse();
  await tap(page, '#spBody [data-row="origin"]');
  const offered = await page.evaluate(() => Array.from(document.querySelectorAll('#spBody [data-origin]')).map(e => e.getAttribute('data-origin')));
  say(offered.length === 3 && offered.every(o => before.origins.indexOf(o) < 0),
    'UNLOCK AN ORIGIN shows three locked Origins (' + offered.join(', ') + ')');
  const midway = await purse();
  say(midway.marrow === before.marrow, 'and looking is free');
  const pick = offered[2];
  await tap(page, '#spBody [data-origin="' + pick + '"]');
  const after = await purse();
  say(after.origins.indexOf(pick) >= 0 && after.origins.length === before.origins.length + 1,
    'the one the thumb picked is unlocked (' + pick + '), and only it');
  say(p != null && before.marrow - after.marrow === p, 'UNLOCK AN ORIGIN printed ' + p + ' and took ' + (before.marrow - after.marrow));
}

/* at 412 wide the sheet's cards sit in the middle: they packed left with ~57 px of dead
   space on the right. Measured against the DEVICE width the viewport was given. */
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const gaps = await page.evaluate(() => {
  const c = document.querySelector('#scr-spend.on #spBody .card');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { left: r.left, right: 412 - r.right };
});
say(!!gaps && Math.abs(gaps.left - gaps.right) <= 2, 'at 412 wide the sheet cards are centred ('
  + (gaps ? gaps.left.toFixed(0) + ' px left, ' + gaps.right.toFixed(0) + ' px right' : 'no card on an open sheet') + ')');

say(errors.length === 0, 'no console or page error' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await browser.close();
close();
console.log(fails.length ? '\nHALL FAILED: ' + fails.length : '\nHALL OK');
process.exit(fails.length ? 1 : 0);
