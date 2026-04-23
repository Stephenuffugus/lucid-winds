// Root Rush 4-move puzzle generator.
// Places random pieces around an X on row 2 cols 2-3, runs BFS solver,
// keeps only puzzles with optimal == 4 and at least 2 distinct non-X pieces
// appearing in the solution path.
//
// Usage: node scripts/rootrush_generate.js [count] [seed]

'use strict';

const { solve, validate } = require('./rootrush_solver.js');

const SZ = 6;
const X_ROW = 2;
const X_COL = 2;

let rngState = parseInt(process.argv[3] || '42', 10);
function rand() {
  // Mulberry32 PRNG
  rngState |= 0; rngState = (rngState + 0x6D2B79F5) | 0;
  let t = Math.imul(rngState ^ rngState >>> 15, 1 | rngState);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function randInt(n) { return Math.floor(rand() * n); }

function emptyGrid() {
  const g = [];
  for (let r = 0; r < SZ; r++) g.push(new Array(SZ).fill('.'));
  return g;
}

function placePiece(grid, id, orient, length, row, col) {
  // Returns true if placed, false if it would overlap.
  for (let k = 0; k < length; k++) {
    const r = orient === 'h' ? row : row + k;
    const c = orient === 'h' ? col + k : col;
    if (r < 0 || r >= SZ || c < 0 || c >= SZ) return false;
    if (grid[r][c] !== '.') return false;
  }
  for (let k = 0; k < length; k++) {
    const r = orient === 'h' ? row : row + k;
    const c = orient === 'h' ? col + k : col;
    grid[r][c] = id;
  }
  return true;
}

function gridToStrings(grid) { return grid.map(r => r.join('')); }

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.replace('X', '');

function generateCandidate() {
  const grid = emptyGrid();
  // X always at row 2 cols 2-3.
  placePiece(grid, 'X', 'h', 2, X_ROW, X_COL);
  // Place 4-7 other pieces randomly.
  const nPieces = 4 + randInt(4);
  let placed = 0;
  let tries = 0;
  const pieceIds = LETTERS.slice(0, nPieces);
  for (let i = 0; i < nPieces; i++) {
    while (tries < 200 && placed <= i) {
      tries++;
      const length = 2 + randInt(2);
      const orient = rand() < 0.5 ? 'h' : 'v';
      const row = randInt(orient === 'h' ? SZ : SZ - length + 1);
      const col = randInt(orient === 'h' ? SZ - length + 1 : SZ);
      // Block horizontal pieces on row 2 (they'd lock X if placed to the right).
      // Allow row 2 horizontal to the LEFT of X only.
      if (orient === 'h' && row === X_ROW && col > 1) continue;
      if (placePiece(grid, pieceIds[i], orient, length, row, col)) {
        placed++;
        break;
      }
    }
  }
  return gridToStrings(grid);
}

function analyze(grid) {
  const err = validate(grid);
  if (err) return { ok: false, reason: err };
  const { depth, path } = solve(grid, 25);
  if (depth < 0) return { ok: false, reason: 'unsolvable' };
  return { ok: true, depth, path };
}

function distinctPiecesInPath(path) {
  const s = new Set();
  for (const step of path) {
    const m = step.match(/^([A-Z])/);
    if (m) s.add(m[1]);
  }
  return s;
}

function fingerprintFirstMove(path) {
  // Structural fingerprint — first-move piece + direction, lets us dedupe very
  // similar starter moves and surface varied puzzles.
  return path[0] ? path[0].replace(/\s\d+$/, '') : '';
}

function gridFingerprint(grid) {
  // Dedupe near-identical grids (ignore labels — only shape matters).
  return grid.map(r => r.replace(/[A-Z]/g, (c) => c === 'X' ? 'X' : '#')).join('|');
}

function run() {
  const target = parseInt(process.argv[2] || '30', 10);
  const accepted = [];
  const seenGrids = new Set();
  const firstMoveCounts = {};
  let attempts = 0;
  while (accepted.length < target && attempts < 200000) {
    attempts++;
    const grid = generateCandidate();
    const fp = gridFingerprint(grid);
    if (seenGrids.has(fp)) continue;
    const res = analyze(grid);
    if (!res.ok) continue;
    if (res.depth !== 4) continue;
    const pcs = distinctPiecesInPath(res.path);
    if (pcs.size < 2) continue; // require varied solution
    // First-move diversity — cap any single (piece, direction) opener at 4.
    const fmv = fingerprintFirstMove(res.path);
    if ((firstMoveCounts[fmv] || 0) >= 4) continue;
    firstMoveCounts[fmv] = (firstMoveCounts[fmv] || 0) + 1;
    seenGrids.add(fp);
    accepted.push({ grid, depth: res.depth, path: res.path });
  }
  console.log(`Generated ${accepted.length} puzzles in ${attempts} attempts.\n`);
  accepted.forEach((p, i) => {
    console.log(`=== 4-move #${i + 1} ===`);
    console.log('  ' + p.grid.join('\n  '));
    console.log('  solution: ' + p.path.join(' → '));
    console.log('');
  });
  // Print in a form we can paste into rootrush.js
  console.log('\n── COPY-PASTE FORMAT ──');
  accepted.forEach((p, i) => {
    const gridLines = p.grid.map(g => `'${g}'`).join(',\n    ');
    console.log(`  { name:'Easy ${i + 4}', diff:'easy', optimal:4, grid:[\n    ${gridLines}\n  ]},`);
  });
}

run();
