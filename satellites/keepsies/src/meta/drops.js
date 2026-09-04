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
import * as SAVE from './save.js?v=20260904d';
import { TIER_ORDER } from './tiers.js?v=20260904d';

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
    if (!economy.spend(table.price, kind + ' pouch')) {
      return { ok: false, why: 'not enough sunbeams' };
    }
    const counters = (save.pity && save.pity[kind]) || {};
    const ownedGrails = save.inventory
      .map(i => (catalog.marbles.find(m => m.id === i.id) || {}))
      .filter(m => m.tier === 'grail').map(m => m.id);

    const res = pull(kind, rng, counters, ownedGrails);
    if (!res.entry) return { ok: false, why: 'the pouch was empty, which is a bug' };

    const already = save.inventory.some(i => i.id === res.entry.id);
    const dupe = already && res.entry.tier === 'grail';   // only grails never duplicate
    let dust = 0;
    if (dupe) {
      dust = economy.dustFor(res.entry.tier);
      economy.earn(dust, 'dust');
    } else {
      SAVE.merge({
        inventory: [{
          id: res.entry.id, uid: res.entry.id + '-' + Date.now().toString(36),
          acquired: Date.now(), source: 'pouch', cosmeticSeed: rng.next()
        }]
      });
    }
    SAVE.update((s) => {
      if (!s.pity) s.pity = {};
      s.pity[kind] = res.counters;
      s.stats.pouches = (s.stats.pouches || 0) + 1;
    });
    return { ok: true, entry: res.entry, tier: res.tier, dust, pitied: res.pitied, rerolled: res.rerolled };
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
