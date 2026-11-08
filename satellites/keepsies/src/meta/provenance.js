/**
 * Provenance (KEEPSIES_BUILD_PLAN.md step 6; Astra's ship first number 3): every marble you hold carries its
 * history as an APPEND ONLY list of events in the save, so a won marble is a story and not just a count.
 *
 *   { eid, uid, kind, at, opp, match, why }    kind: owned, won, lost, reclaimed, showcased
 *
 * ⛔ NOTHING HERE INVENTS A PAST. An event is written by the thing that happened: a pouch buy writes `owned`
 * inside its own transaction, the tin writes `owned` and `showcased`, the match writes `won` and `lost` only
 * AFTER its result transaction has settled the pot, and a buy back writes `reclaimed`. No previous owner is
 * ever made up (Astra: "Do not invent previous owners as if they were actual players").
 */
import * as SAVE from './save.js?v=20261107a';

export const KINDS = ['owned', 'won', 'lost', 'reclaimed', 'showcased'];
let n = 0;

/** One event. `o` carries opp (the opponent's printed name), match (the match id) and why (the source). */
export function event(kind, uid, o) {
  const x = o || {};
  const at = x.at || Date.now();
  return { eid: 'e' + at.toString(36) + (n++).toString(36) + kind[0], uid, kind, at,
    opp: x.opp || null, match: x.match || null, why: x.why || null };
}

/** Append events (merge dedupes by eid, so a second tab cannot write one twice). */
export function record(events) { if (events && events.length) SAVE.merge({ provenance: events }); }

/** A marble's own history, oldest first. */
export function historyOf(save, uid) {
  if (!uid) return [];
  return (save.provenance || []).filter(e => e.uid === uid).sort((a, b) => a.at - b.at);
}

const SOURCE = { pouch: 'Out of a pouch', starter: "Out of Dusty's tin", clay: 'Out of the clay pool', boss: 'Taken off a boss' };

/** The one line an event reads as: "Won off Dusty Coyle"; a reclaimed marble reads Returned. */
export function lineFor(e) {
  switch (e.kind) {
    case 'won': return 'Won off ' + (e.opp || 'an opponent');
    case 'lost': return 'Lost to ' + (e.opp || 'an opponent');
    case 'reclaimed': return 'Returned';
    case 'showcased': return 'Put in the case';
    default: return SOURCE[e.why] || 'Yours';
  }
}
