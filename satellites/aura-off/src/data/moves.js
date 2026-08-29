// AURA OFF — the move library. A thin aggregator, nothing else.
//
// The twenty-seven moves live in three category files, one per corner of the
// triangle (CONTRACT.md §5). This file exists so that every consumer — the
// engine, the UI, the simulator, the doc generator — imports ONE list in ONE
// order and can never disagree about what the library is.
//
// It contains no data of its own and no rules. If a number here looks wrong,
// it is wrong in `moves.flex.js`, `moves.flow.js` or `moves.bait.js`.
//
// ORDER IS THE CONTRACT'S ORDER. §9 lists FLEX, then FLOW, then BAIT, and the
// deck grid, the roster generator and `createMatch`'s default deck all inherit
// that order by reading MOVES front to back.

import { FLEX_MOVES } from './moves.flex.js';
import { FLOW_MOVES } from './moves.flow.js';
import { BAIT_MOVES } from './moves.bait.js';

export { FLEX_MOVES, FLOW_MOVES, BAIT_MOVES };

/**
 * Every move, in CONTRACT.md §9 build order.
 * @type {ReadonlyArray<Object>}
 */
export const MOVES = Object.freeze(
  [].concat(FLEX_MOVES, FLOW_MOVES, BAIT_MOVES)
);

/**
 * id → move. Built once at module load.
 * `battle.js` keeps its own memoised index for the hot path; this one is for
 * everybody else (the deck grid, the result screen, the validator).
 * @type {Readonly<Object<string, Object>>}
 */
export const MOVES_BY_ID = Object.freeze(MOVES.reduce(function (map, m) {
  if (m && m.id) map[m.id] = m;
  return map;
}, Object.create(null)));

/**
 * Look one up. Returns null rather than undefined so a missing id reads the
 * same way everywhere.
 * @param {string} id
 * @returns {Object|null}
 */
export function moveById(id) {
  return MOVES_BY_ID[id] || null;
}

/**
 * Every move in one category, library order preserved.
 * @param {'FLEX'|'FLOW'|'BAIT'} cat
 * @returns {Object[]}
 */
export function movesByCategory(cat) {
  return MOVES.filter(function (m) { return m.cat === cat; });
}

/** Move ids, library order. */
export const MOVE_IDS = Object.freeze(MOVES.map(function (m) { return m.id; }));

export default MOVES;
