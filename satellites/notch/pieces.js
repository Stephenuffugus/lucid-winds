/* NOTCH's pieces (plans/notch/HANDOFF-NOTCH.md 3.3 and 3.8). PURE: data only.
 *
 * Each piece is a set of unit cells on a grid (x right, y down), a name from carved things that code for no one (N4), and the
 * angle its wood grain runs at in the piece's own coordinates (3.9: the grain turns with the piece). Every piece here passed
 * test/shapes.mjs's laws when it was added: no turn of it is itself, no turn of its mirror is it, and its mirror at its best
 * angle overlaps it at least 0.05 less than the piece itself turned 12 degrees. They were found by enumerating every free
 * pentomino and hexomino (12 and 35) and keeping the eleven that pass (session scratch notch-bank.mjs, 2026-09-16).
 */
export const PIECES = Object.freeze({
  wren: Object.freeze({ name: 'wren', grain: 20, cells: Object.freeze([[0, 1], [1, 0], [1, 1], [2, 0], [3, 0]]) }),
  /* ⛔ sprout was first the Z pentomino, a half turn of itself, let in by a search whose raster put pixel centres on cell edges
     (test/shapes.mjs's header); the search run again with the corrected raster keeps this one in its place */
  sprout: Object.freeze({ name: 'sprout', grain: 75, cells: Object.freeze([[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]]) }),
  hook: Object.freeze({ name: 'hook', grain: 0, cells: Object.freeze([[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [3, 0]]) }),
  stair: Object.freeze({ name: 'stair', grain: 35, cells: Object.freeze([[0, 1], [0, 2], [1, 0], [1, 1], [2, 1], [3, 1]]) }),
  comb: Object.freeze({ name: 'comb', grain: 90, cells: Object.freeze([[0, 0], [0, 1], [1, 0], [2, 0], [2, 1], [3, 0]]) }),
  crank: Object.freeze({ name: 'crank', grain: 60, cells: Object.freeze([[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [2, 2]]) }),
  lantern: Object.freeze({ name: 'lantern', grain: 15, cells: Object.freeze([[0, 1], [0, 2], [1, 1], [1, 2], [2, 0], [2, 1]]) }),
  kite: Object.freeze({ name: 'kite', grain: 45, cells: Object.freeze([[0, 1], [1, 0], [1, 1], [1, 2], [2, 0], [3, 0]]) }),
  bridge: Object.freeze({ name: 'bridge', grain: 5, cells: Object.freeze([[0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1]]) }),
  rake: Object.freeze({ name: 'rake', grain: 80, cells: Object.freeze([[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0]]) }),
  ledge: Object.freeze({ name: 'ledge', grain: 30, cells: Object.freeze([[0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [3, 0]]) })
});

export const PIECE_IDS = Object.freeze(Object.keys(PIECES));
