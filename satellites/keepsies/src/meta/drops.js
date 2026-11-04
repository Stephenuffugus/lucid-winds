/**
 * The pouches.
 *
 * Two paths into the collection by design: pouches, which cost sunbeams, and
 * keepsies, which costs nerve. No real money anywhere, ever (DESIGN 11).
 *
 * ⛔ PITY IS A FLOOR, NOT A REPLACEMENT. The weights in `droptables.json` are
 * the base roll and the pity counters sit on top of them, so the rate a player
 * actually sees is always at or above the printed table. Anyone comparing the
 * two should get the same answer or a better one, never a worse one, and the
 * `pity_math` gate asserts exactly that over a hundred thousand pulls.
 *
 * ⛔ THE COUNTER IS PER POUCH TYPE and it survives a reload, because a pity
 * counter that resets when you close the tab is not a promise, it is a tease.
 * It lives in the save beside the wallet.
 *
 * ⛔ A DUPE GRAIL NEVER HAPPENS. DESIGN 10.6 is absolute about it: reroll to the
 * highest epic instead. A one of one that arrives twice is not a one of one.
 */
import * as SAVE from './save.js?v=20261105a';
import { event as provEvent } from './provenance.js?v=20261105a';
import { TIER_ORDER } from './tiers.js?v=20261105a';

/**
 * @param {object} tables parsed droptables.json
 * @param {object} catalog parsed marbles.json
 * @param {object} tuning
 */
export function createDrops(tables, catalog, tuning) {
  const byTier = {};
  for (const m of catalog.marbles) {
    // signatures and anything the design marks unstakeable never come out of a pouch
    if (m.signature || m.source === 'boss') continue;
    (byTier[m.tier] || (byTier[m.tier] = [])).push(m);
  }

  /** The base roll, with no pity applied. This is the table, exactly. */
  function rollTier(weights, rng) {
    let total = 0;
    for (const t of TIER_ORDER) total += weights[t] || 0;
    let r = rng.next() * total;
    for (const t of TIER_ORDER) {
      const w = weights[t] || 0;
      if (r < w) return t;
      r -= w;
    }
    return TIER_ORDER[0];
  }

  /**
   * One pull, pity included. Pure: it takes the counters in and hands them back
   * out, so the gate can run a hundred thousand of these with no storage at all.
   *
   * @param {string} kind standard, collector or grail
   * @param {{next:()=>number, pick:(a:any[])=>any}} rng
   * @param {{rare?:number, epic?:number}} counters pulls since each was last seen
   * @param {string[]} ownedGrails ids the player already has
   */
  function pull(kind, rng, counters, ownedGrails) {
    const table = tables[kind];
    if (!table) throw new Error('drops: no pouch called "' + kind + '"');
    const c = { rare: counters.rare || 0, epic: counters.epic || 0 };

    let tier = rollTier(table.weights, rng);
    let pitied = null;

    // the floor, checked from the rarest down so a pity epic is not downgraded
    // to a pity rare on the same pull
    if (table.pity.epic && c.epic + 1 >= table.pity.epic && rankOf(tier) < rankOf('epic')) {
      tier = 'epic'; pitied = 'epic';
    } else if (table.pity.rare && c.rare + 1 >= table.pity.rare && rankOf(tier) < rankOf('rare')) {
      tier = 'rare'; pitied = 'rare';
    }

    // counters advance AFTER the decision: a pull that produced a rare resets
    // the rare counter, and anything rarer resets it too
    if (rankOf(tier) >= rankOf('rare')) c.rare = 0; else c.rare++;
    if (rankOf(tier) >= rankOf('epic')) c.epic = 0; else c.epic++;

    let pool = byTier[tier] || byTier.common || [];
    let rerolled = false;
    if (tier === 'grail' && table.noDupeGrails) {
      const fresh = pool.filter(m => ownedGrails.indexOf(m.id) < 0);
      if (!fresh.length) {
        // ⛔ never a second copy of a one of one: the highest epic instead
        pool = byTier.epic || pool;
        tier = 'epic';
        rerolled = true;
      } else pool = fresh;
    }
    const entry = pool.length ? rng.pick(pool) : null;
    return { tier, entry, counters: c, pitied, rerolled };
  }

  const rankOf = (t) => TIER_ORDER.indexOf(t);

  /** The whole thing, against the save: spend, pull, keep or dust, remember. */
  function open(kind, rng, economy) {
    const table = tables[kind];
    if (!table) throw new Error('drops: no pouch called "' + kind + '"');
    const save = SAVE.load();
    if (save.wallet.sunbeams < table.price) return { ok: false, why: 'not enough sunbeams' };
    const counters = (save.pity && save.pity[kind]) || {};
    const ownedGrails = save.inventory
      .map(i => (catalog.marbles.find(m => m.id === i.id) || {}))
      .filter(m => m.tier === 'grail').map(m => m.id);

    const res = pull(kind, rng, counters, ownedGrails);
    if (!res.entry) return { ok: false, why: 'the pouch was empty, which is a bug' };

    const already = save.inventory.some(i => i.id === res.entry.id);
    const dupe = already && res.entry.tier === 'grail';   // only grails never duplicate
    const dust = dupe ? economy.dustFor(res.entry.tier) : 0;
    const now = Date.now();
    const item = dupe ? null : { id: res.entry.id, uid: res.entry.id + '-' + now.toString(36),
      acquired: now, source: 'pouch', cosmeticSeed: rng.next() };
    /* ⛔ ONE TRANSACTION (step 6). The price, the pity counters, the drawn marble (or its dust) and its first
       provenance event are written together, BEFORE anything is shown: a tab closed on the reveal has paid
       for exactly what it holds. A second tab that spent the money first leaves nothing written at all. */
    let ok = false;
    SAVE.update((s) => {
      if (s.wallet.sunbeams < table.price) return;
      s.wallet.sunbeams -= table.price;
      s.stats.spent = (s.stats.spent || 0) + table.price;
      if (dupe) { s.wallet.sunbeams += dust; s.stats.earned = (s.stats.earned || 0) + dust; }
      else {
        if (!s.inventory.some(i => i.uid === item.uid)) s.inventory.push(item);
        s.provenance = s.provenance || [];
        s.provenance.push(provEvent('owned', item.uid, { at: now, why: 'pouch' }));
      }
      if (!s.pity) s.pity = {};
      s.pity[kind] = res.counters;
      s.stats.pouches = (s.stats.pouches || 0) + 1;
      ok = true;
    });
    if (!ok) return { ok: false, why: 'not enough sunbeams' };
    if (economy.notify) {
      economy.notify({ kind: 'spend', amount: table.price, reason: kind + ' pouch' });
      if (dust) economy.notify({ kind: 'earn', amount: dust, reason: 'dust' });
    }
    return { ok: true, entry: res.entry, tier: res.tier, dust, pitied: res.pitied, rerolled: res.rerolled, uid: item ? item.uid : null };
  }

  /** How many pulls until the next guarantee, for the "next rare in N" line. */
  function nextGuarantee(kind) {
    const table = tables[kind];
    const c = (SAVE.load().pity || {})[kind] || {};
    const out = {};
    if (table.pity.rare) out.rare = Math.max(0, table.pity.rare - (c.rare || 0));
    if (table.pity.epic) out.epic = Math.max(0, table.pity.epic - (c.epic || 0));
    return out;
  }

  return { pull, open, nextGuarantee, rollTier, tables, poolFor: (t) => byTier[t] || [] };
}
