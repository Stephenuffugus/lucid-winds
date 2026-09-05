/**
 * KEEPSIES. The pot, the escrow, and the rule that stops a stranger taking your
 * best marble for a clay one.
 *
 * This is the thing the game is named after and the thing that makes a marble
 * worth caring about, so it is also the thing that must never lose one.
 *
 * ⛔ THE ESCROW IS WRITTEN BEFORE THE FIRST TURN, NOT AFTER THE LAST.
 * Staked marbles LEAVE both inventories and sit in a pot marked `inMatch` in the
 * save, and that write happens before a single shot is fired. If the tab is
 * closed, the phone dies or the browser reloads mid match, the next boot finds
 * `inMatch` and hands everything back. A marble can therefore never be in two
 * places, and it can never be in none: it is in an inventory or it is in the
 * pot, and `escrow_crash` kills the process between the two to prove it.
 *
 * ⛔ THE TIER MATCHED RULE REFUSES WITH A REASON. Equal count, one to three each,
 * at most one tier apart, and no common against a grail (DESIGN 12.1). A refusal
 * a player cannot understand is indistinguishable from a bug, so every one of
 * them says which rule it was and what would fix it.
 */
import * as SAVE from '../meta/save.js?v=20260905a';
import { TIER_ORDER, tierRank } from '../meta/tiers.js?v=20260905a';

/**
 * May these two stakes be played against each other?
 * @param {{tier:string}[]} mine
 * @param {{tier:string}[]} theirs
 * @returns {{ok:boolean, reason:string}}
 */
export function tierMatchOk(mine, theirs) {
  if (!mine.length || !theirs.length) return { ok: false, reason: 'Both of you have to put something up.' };
  if (mine.length > 3 || theirs.length > 3) return { ok: false, reason: 'Three marbles each is the most anyone stakes.' };
  if (mine.length !== theirs.length) {
    return { ok: false, reason: 'Same number each. You have ' + mine.length + ' up and they have ' + theirs.length + '.' };
  }
  const best = (a) => a.reduce((h, m) => Math.max(h, tierRank(m.tier)), 0);
  const worst = (a) => a.reduce((l, m) => Math.min(l, tierRank(m.tier)), TIER_ORDER.length);
  const gap = Math.abs(best(mine) - best(theirs));
  if (gap > 1) {
    return {
      ok: false,
      reason: 'Too far apart. A ' + TIER_ORDER[best(mine)] + ' does not play against a '
        + TIER_ORDER[best(theirs)] + '.'
    };
  }
  const spread = Math.abs(best(mine) - worst(theirs));
  if (spread >= tierRank('grail') && Math.min(worst(mine), worst(theirs)) === tierRank('common')) {
    return { ok: false, reason: 'Nobody plays a common against a grail.' };
  }
  return { ok: true, reason: '' };
}

/** What the opponent puts up: matched to yours, tier for tier, out of their own. */
export function matchTheirStake(mine, catalog, rng, opponentTiers) {
  const byTier = {};
  for (const m of catalog.marbles) {
    if (m.signature || m.stakeable === false) continue;
    (byTier[m.tier] || (byTier[m.tier] = [])).push(m);
  }
  const allowed = opponentTiers || TIER_ORDER;
  return mine.map((m) => {
    // the same tier if they carry it, otherwise the nearest one they do
    let tier = m.tier;
    if (allowed.indexOf(tier) < 0 || !(byTier[tier] || []).length) {
      let bestT = allowed[0], bestD = 99;
      for (const t of allowed) {
        if (!(byTier[t] || []).length) continue;
        const d = Math.abs(tierRank(t) - tierRank(m.tier));
        if (d < bestD) { bestD = d; bestT = t; }
      }
      tier = bestT;
    }
    const e = rng.pick(byTier[tier]);
    return { id: e.id, name: e.name, tier: e.tier, theirs: true };
  });
}

/**
 * Put the pot up. Marbles leave the inventory HERE, before anything is played.
 * @param {{uid:string,id:string,tier:string}[]} mine from the player's inventory
 * @param {{id:string,tier:string,name:string}[]} theirs the opponent's side
 * @param {string} opponent who is across from you
 */
export function escrow(mine, theirs, opponent) {
  const uids = mine.map(m => m.uid);
  let ok = false;
  SAVE.update((s) => {
    if (s.pot && s.pot.inMatch) return;                       // a pot is already up
    const have = new Set(s.inventory.map(i => i.uid));
    for (const uid of uids) if (!have.has(uid)) return;        // staking what you do not own
    const taken = [];
    s.inventory = s.inventory.filter((i) => {
      if (uids.indexOf(i.uid) < 0) return true;
      taken.push(i);
      return false;
    });
    s.pot = {
      inMatch: true,
      opponent: opponent || 'someone',
      mine: taken,
      theirs: theirs.slice(),
      at: Date.now()
    };
    ok = true;
  });
  return ok;
}

/**
 * The match ended. `winner` is 0 for the player, 1 for the opponent, or null for
 * a draw or an abandon, in which case everything goes back where it came from.
 * @returns {{won:object[], lost:object[], returned:object[]}}
 */
export function settle(winner) {
  const out = { won: [], lost: [], returned: [] };
  SAVE.update((s) => {
    const pot = s.pot;
    if (!pot || !pot.inMatch) return;
    if (winner === 0) {
      // you take theirs, and yours comes home
      for (const m of pot.mine) s.inventory.push(m);
      for (const t of pot.theirs) {
        s.inventory.push({
          id: t.id, uid: t.id + '-won-' + (s.inventory.length + 1) + '-' + pot.at,
          acquired: Date.now(), source: 'keepsies', wonFrom: pot.opponent, cosmeticSeed: 0.5
        });
        out.won.push(t);
      }
    } else if (winner === null) {
      for (const m of pot.mine) { s.inventory.push(m); out.returned.push(m); }
    } else {
      // they take yours. It does not come back, and that is the whole game.
      out.lost = pot.mine.slice();
      s.stats.lostToKeepsies = (s.stats.lostToKeepsies || 0) + pot.mine.length;
    }
    s.pot = { inMatch: false, escrow: [] };
  });
  return out;
}

/**
 * The first thing the game does on boot. If a pot was up when the tab closed,
 * everything in it goes back and the match never happened.
 * @returns {{recovered:number}}
 */
export function recoverOnBoot() {
  let recovered = 0;
  SAVE.update((s) => {
    const pot = s.pot;
    if (!pot || !pot.inMatch) return;
    for (const m of pot.mine) { s.inventory.push(m); recovered++; }
    s.pot = { inMatch: false, escrow: [] };
  });
  return { recovered };
}

/** Is a pot up right now? */
export function potUp() {
  const p = SAVE.load().pot;
  return !!(p && p.inMatch);
}

/** What is on the line, for the setup screen and the ceremony. */
export function currentPot() {
  const p = SAVE.load().pot;
  if (!p || !p.inMatch) return null;
  return { opponent: p.opponent, mine: p.mine.slice(), theirs: p.theirs.slice() };
}
