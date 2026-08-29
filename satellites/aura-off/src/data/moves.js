// AURA OFF — the move library. A thin aggregator, nothing else.
//
// The twenty-seven BASE moves live in three category files, one per corner of
// the triangle (CONTRACT.md §5). Regional PACK moves live in `packs.js`. This
// file exists so that every consumer — the engine, the UI, the simulator, the
// doc generator — imports ONE list in ONE order and can never disagree about
// what the library is.
//
// It contains no data of its own and no rules. If a number here looks wrong,
// it is wrong in `moves.flex.js`, `moves.flow.js`, `moves.bait.js` or
// `packs.js`.
//
// ORDER IS THE CONTRACT'S ORDER. §9 lists FLEX, then FLOW, then BAIT, and the
// deck grid, the roster generator and `createMatch`'s default deck all inherit
// that order by reading MOVES front to back.
//
// -----------------------------------------------------------------------------
// PACKS, AND WHY `MOVES` IS A `let`
// -----------------------------------------------------------------------------
//
// A pack is a named, ownable set of moves layered on top of the base twenty-
// seven. Owning one has to make its moves real everywhere at once — the deck
// grid, `moveById`, the blend picker, the result screen — without every one of
// those call sites learning what a pack is.
//
// So MOVES, MOVES_BY_ID and MOVE_IDS are `let` and get REBUILT when ownership
// changes. ES module imports are live bindings, so `import { MOVES }` picks up
// the new array with no work at the call site and no subscription mechanism.
// `src/main.js` reads MOVES inside `boot()`, so a store that writes ownership
// before boot gets a pack-aware library for free, and `main.js` never changes.
//
// Two consequences worth knowing:
//
//   · DEFAULT EXPORT IS `export { MOVES as default }`, NOT `export default
//     MOVES`. The second form snapshots the value at module evaluation and
//     would silently keep handing out the base 27 forever after a pack was
//     owned. The re-export form is a live binding. Do not "simplify" it back.
//
//   · ANYTHING THAT COPIES `MOVES` INTO ITS OWN LONG-LIVED CONST AT MODULE LOAD
//     freezes at whatever ownership was set then. That is fine for a match in
//     progress — the deck should not change mid-battle — and wrong for anything
//     that outlives a match. Read MOVES when you need it.
//
// BASE ORDER NEVER MOVES. Pack moves are appended AFTER the twenty-seven, in
// pack release order, so base indices 0..26 mean the same thing whether you own
// nothing or everything. `test/validate.js` checks exactly that.
//
// Ownership is DATA. Nothing in this file or in `packs.js` knows about money,
// and neither should ever learn: `setOwnedPacks()` is the whole store surface.

import { FLEX_MOVES } from './moves.flex.js';
import { FLOW_MOVES } from './moves.flow.js';
import { BAIT_MOVES } from './moves.bait.js';
import {
  PACKS,
  PACK_IDS,
  PACKS_BY_ID,
  PACK_MOVES,
  PACK_MOVES_BY_ID,
  packById,
  movesInPack,
  packOfMove
} from './packs.js';

export { FLEX_MOVES, FLOW_MOVES, BAIT_MOVES };
export { PACKS, PACK_IDS, PACKS_BY_ID, PACK_MOVES, PACK_MOVES_BY_ID, packById, movesInPack };

/**
 * The base library: twenty-seven moves in CONTRACT.md §9 build order, with no
 * pack content in it, ever. This is the thing the contract tables in
 * `test/validate.js` are compared against, and the thing that has to stay a
 * complete, winnable game on its own.
 * @type {ReadonlyArray<Object>}
 */
export const BASE_MOVES = Object.freeze(
  [].concat(FLEX_MOVES, FLOW_MOVES, BAIT_MOVES)
);

/** Base ids, library order. */
export const BASE_MOVE_IDS = Object.freeze(BASE_MOVES.map(function (m) { return m.id; }));

/**
 * Everything that EXISTS — base moves then every pack move, ownership ignored.
 * This is the CATALOGUE, not the library. The validator and the doc generator
 * read it because they have to see content the player has not bought; the game
 * reads `MOVES`.
 * @type {ReadonlyArray<Object>}
 */
export const CATALOG = Object.freeze([].concat(BASE_MOVES, PACK_MOVES));

/** id → move, ownership ignored. */
export const CATALOG_BY_ID = Object.freeze(CATALOG.reduce(function (map, m) {
  if (m && m.id) map[m.id] = m;
  return map;
}, Object.create(null)));

/** Look one up in the catalogue, owned or not. Null rather than undefined. */
export function catalogMoveById(id) {
  return CATALOG_BY_ID[id] || null;
}

/** Which pack a move id belongs to, or null for a base move. */
export const packOf = packOfMove;

/* -------------------------------------------------------------------------- */
/* OWNERSHIP — the entire store surface                                        */
/* -------------------------------------------------------------------------- */

/** Owned pack ids, always in PACKS release order, always deduplicated. */
let _owned = Object.freeze([]);

function index(list) {
  return Object.freeze(list.reduce(function (map, m) {
    if (m && m.id) map[m.id] = m;
    return map;
  }, Object.create(null)));
}

/**
 * Every move currently available: the base twenty-seven, then the moves of each
 * owned pack in release order. A LIVE BINDING — see the header.
 * @type {ReadonlyArray<Object>}
 */
export let MOVES = BASE_MOVES;

/**
 * id → move, for the currently owned library. `battle.js` keeps its own
 * memoised index for the hot path; this one is for everybody else (the deck
 * grid, the result screen, the validator). A LIVE BINDING.
 * @type {Readonly<Object<string, Object>>}
 */
export let MOVES_BY_ID = index(BASE_MOVES);

/** Move ids, library order. A LIVE BINDING. */
export let MOVE_IDS = Object.freeze(BASE_MOVE_IDS.slice());

function rebuild() {
  let list = BASE_MOVES;
  if (_owned.length) {
    list = BASE_MOVES.slice();
    for (let i = 0; i < _owned.length; i++) {
      list = list.concat(movesInPack(_owned[i]));
    }
    list = Object.freeze(list);
  }
  MOVES = list;
  MOVES_BY_ID = index(list);
  MOVE_IDS = Object.freeze(list.map(function (m) { return m.id; }));
}

/**
 * Which packs are owned right now. Returns a frozen array in release order —
 * safe to hand straight to a save file.
 * @returns {ReadonlyArray<string>}
 */
export function ownedPacks() {
  return _owned;
}

/** Is this pack owned? */
export function isPackOwned(id) {
  return _owned.indexOf(id) !== -1;
}

/**
 * Replace the owned set. THE ONLY WRITE A STORE NEEDS.
 *
 * Unknown ids are DROPPED SILENTLY rather than throwing, because the realistic
 * caller is save data written by an older or newer build: a pack id we do not
 * ship yet must degrade to "you own nothing extra", never to a boot crash.
 * Duplicates collapse, and the result is sorted into PACKS release order so the
 * library is deterministic regardless of what order the ids arrived in.
 *
 * @param {Iterable<string>} ids
 * @returns {ReadonlyArray<string>} the ids that were actually accepted
 */
export function setOwnedPacks(ids) {
  const wanted = Object.create(null);
  if (ids) {
    const list = Array.isArray(ids) ? ids : Array.from(ids);
    for (let i = 0; i < list.length; i++) {
      const id = list[i];
      if (typeof id === 'string' && PACKS_BY_ID[id]) wanted[id] = true;
    }
  }
  _owned = Object.freeze(PACK_IDS.filter(function (id) { return wanted[id]; }));
  rebuild();
  return _owned;
}

/** Add one pack. Unknown id is a no-op. Returns the owned set. */
export function ownPack(id) {
  return setOwnedPacks(_owned.concat([id]));
}

/** Remove one pack. Returns the owned set. */
export function disownPack(id) {
  return setOwnedPacks(_owned.filter(function (x) { return x !== id; }));
}

/* -------------------------------------------------------------------------- */
/* LOOKUPS                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Look one up in the CURRENT library. Returns null rather than undefined so a
 * missing id reads the same way everywhere — and an unowned pack move is a
 * missing id, deliberately. Use `catalogMoveById` when you need to describe
 * content the player does not have (a store card, the roster generator).
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

/**
 * The pack moves a player can reach right now: every move of every owned pack.
 * Ownership gets you the pack; the moves inside it still unlock along the
 * pack's own ladder (`move.unlock`, see `packs.js`), which is the game's job,
 * not this file's.
 * @returns {Object[]}
 */
export function ownedPackMoves() {
  return MOVES.slice(BASE_MOVES.length);
}

// LIVE BINDING — not `export default MOVES`, which would snapshot. See header.
export { MOVES as default };
