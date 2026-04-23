// Density-biased Expert hunter. Grows boards greedily, verifying solvability
// after each placement. Dense-solvable boards tend to yield harder puzzles.
//
// Usage: node scripts/rootrush_expert2.js [seconds] [seed]

'use strict';

const { solve, validate } = require('./rootrush_solver.js');

const SZ = 6;
const X_ROW = 2;
const X_COL = 2;

let rngState = parseInt(process.argv[3] || String(Date.now() & 0xffff), 10);
function rand() {
  rngState |= 0; rngState = (rngState + 0x6D2B79F5) | 0;
  let t = Math.imul(rngState ^ rngState >>> 15, 1 | rngState);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function randInt(n) { return Math.floor(rand() * n); }

function emptyGrid() {
  const g = []; for (let r = 0; r < SZ; r++) g.push(new Array(SZ).fill('.')); return g;
}
function copyGrid(g) { return g.map(row => row.slice()); }
function placePiece(grid, id, orient, length, row, col) {
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
function gridFingerprint(grid) {
  // grid is already an array of strings here
  return grid.map(r => r.replace(/[A-Z]/g, (c) => c === 'X' ? 'X' : '#')).join('|');
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.replace('X', '');

function quickSolvable(grid, cap = 20) {
  // cap solver depth to keep per-iteration cost bounded
  const { depth } = solve(gridToStrings(grid), cap);
  return depth >= 0;
}

function generateDense() {
  const grid = emptyGrid();
  placePiece(grid, 'X', 'h', 2, X_ROW, X_COL);
  const maxPieces = 8 + randInt(4); // 8..11
  const ids = LETTERS.slice(0, maxPieces);
  let pieceCount = 0;
  for (let i = 0; i < maxPieces; i++) {
    let placed = false;
    for (let tries = 0; tries < 40 && !placed; tries++) {
      const length = 2 + randInt(2);
      const orient = rand() < 0.5 ? 'h' : 'v';
      const row = randInt(orient === 'h' ? SZ : SZ - length + 1);
      const col = randInt(orient === 'h' ? SZ - length + 1 : SZ);
      if (orient === 'h' && row === X_ROW && col > 1) continue;
      const trial = copyGrid(grid);
      if (!placePiece(trial, ids[i], orient, length, row, col)) continue;
      // Accept only if still solvable
      if (!quickSolvable(trial, 15)) continue;
      // Commit
      for (let k = 0; k < length; k++) {
        const r = orient === 'h' ? row : row + k;
        const c = orient === 'h' ? col + k : col;
        grid[r][c] = ids[i];
      }
      placed = true;
      pieceCount++;
    }
    if (!placed) break;
  }
  return { grid: gridToStrings(grid), pieceCount };
}

function fmtCopy(grid, depth, idx) {
  const gridLines = grid.map(g => `'${g}'`).join(',\n    ');
  return `  { name:'Expert ${idx}', diff:'expert', optimal:${depth}, grid:[\n    ${gridLines}\n  ]},`;
}

function run() {
  const seconds = parseFloat(process.argv[2] || '120');
  const budget = seconds * 1000;
  const t0 = Date.now();
  const seen = new Set();
  const buckets = {};
  let attempts = 0, solvable = 0, duplicates = 0, totalPieces = 0;
  const deepCap = 45;
  while (Date.now() - t0 < budget) {
    attempts++;
    const { grid, pieceCount } = generateDense();
    totalPieces += pieceCount;
    const fp = gridFingerprint(grid);
    if (seen.has(fp)) { duplicates++; continue; }
    seen.add(fp);
    const err = validate(grid);
    if (err) continue;
    const { depth, path } = solve(grid, deepCap);
    if (depth < 0) continue;
    solvable++;
    if (depth < 11) continue;
    (buckets[depth] = buckets[depth] || []).push({ grid, depth, path });
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const avgPieces = (totalPieces / Math.max(attempts, 1)).toFixed(2);
  console.log(`\nDensity-biased hunt · ${elapsed}s · attempts ${attempts} · solvable ${solvable} · avg pieces/board ${avgPieces} · duplicates ${duplicates}`);
  const depths = Object.keys(buckets).map(Number).sort((a, b) => a - b);
  console.log('Depth histogram (11+):');
  for (const d of depths) console.log(`  ${d.toString().padStart(3)}: ${buckets[d].length}`);
  const all = [];
  for (const d of depths) for (const p of buckets[d]) all.push(p);
  all.sort((a, b) => b.depth - a.depth);
  console.log('\nTop 8 hardest:');
  for (const p of all.slice(0, 8)) {
    console.log(`\n  depth ${p.depth}`);
    console.log('  ' + p.grid.join('\n  '));
  }
  const expert = all.filter(p => p.depth >= 21);
  if (expert.length) {
    console.log(`\n=== PASTE BLOCK (${expert.length} puzzles ≥21 moves) ===\n`);
    expert.slice(0, 10).forEach((p, i) => console.log(fmtCopy(p.grid, p.depth, i + 1)));
  }
}

run();
