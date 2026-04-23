// Hunt for Expert-tier Root Rush puzzles (21+ optimal moves).
//
// Approach: the original generator capped BFS at depth 25 and kept only
// puzzles where depth === 4. That filter ate every hard puzzle the search
// turned up. Here we uncap the BFS, generate lots of candidates, and bucket
// them by depth so we can cherry-pick the hardest.
//
// Runs for a fixed wall-clock budget (default 60s) since deep-BFS analysis is
// slow on dense boards. Prints top puzzles per bucket plus a paste-ready
// block if any 21+ levels surface.

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
  const g = [];
  for (let r = 0; r < SZ; r++) g.push(new Array(SZ).fill('.'));
  return g;
}
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

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.replace('X', '');

// Heavier density — hard puzzles need tight boards. Bias toward 7-10 pieces.
function generateCandidate() {
  const grid = emptyGrid();
  placePiece(grid, 'X', 'h', 2, X_ROW, X_COL);
  const nPieces = 7 + randInt(4); // 7..10
  const pieceIds = LETTERS.slice(0, nPieces);
  for (let i = 0; i < nPieces; i++) {
    let tries = 0;
    while (tries < 100) {
      tries++;
      const length = 2 + randInt(2);
      const orient = rand() < 0.5 ? 'h' : 'v';
      const row = randInt(orient === 'h' ? SZ : SZ - length + 1);
      const col = randInt(orient === 'h' ? SZ - length + 1 : SZ);
      if (orient === 'h' && row === X_ROW && col > 1) continue;
      if (placePiece(grid, pieceIds[i], orient, length, row, col)) break;
    }
  }
  return gridToStrings(grid);
}

function gridFingerprint(grid) {
  return grid.map(r => r.replace(/[A-Z]/g, (c) => c === 'X' ? 'X' : '#')).join('|');
}

function fmtCopy(grid, depth) {
  const gridLines = grid.map(g => `'${g}'`).join(',\n    ');
  return `  { name:'Expert X', diff:'expert', optimal:${depth}, grid:[\n    ${gridLines}\n  ]},`;
}

function run() {
  const seconds = parseFloat(process.argv[2] || '60');
  const budget = seconds * 1000;
  const t0 = Date.now();
  const seen = new Set();
  const buckets = {}; // depth -> [{grid,depth,path}]
  let attempts = 0, solvable = 0, skipped = 0;
  const deepCap = 40;
  while (Date.now() - t0 < budget) {
    attempts++;
    const grid = generateCandidate();
    const fp = gridFingerprint(grid);
    if (seen.has(fp)) { skipped++; continue; }
    seen.add(fp);
    const err = validate(grid);
    if (err) continue;
    const { depth, path } = solve(grid, deepCap);
    if (depth < 0) continue;
    solvable++;
    if (depth < 11) continue; // only care about hard+
    (buckets[depth] = buckets[depth] || []).push({ grid, depth, path });
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const depths = Object.keys(buckets).map(Number).sort((a, b) => a - b);
  console.log(`\nHunted ${elapsed}s · attempts ${attempts} · solvable ${solvable} · duplicates ${skipped}`);
  console.log('Depth histogram (11+):');
  for (const d of depths) console.log(`  ${d.toString().padStart(3)}: ${buckets[d].length}`);
  // Show the deepest 3 puzzles
  const all = [];
  for (const d of depths) for (const p of buckets[d]) all.push(p);
  all.sort((a, b) => b.depth - a.depth);
  const top = all.slice(0, 6);
  console.log('\nTop 6 hardest found:');
  for (const p of top) {
    console.log(`\n  depth ${p.depth}`);
    console.log('  ' + p.grid.join('\n  '));
    console.log('  ' + p.path.join(' → '));
  }
  // Expert block (21+) paste
  const expert = all.filter(p => p.depth >= 21);
  if (expert.length) {
    console.log(`\n=== PASTE-READY EXPERT BLOCK (${expert.length} puzzles ≥21 moves) ===\n`);
    expert.slice(0, 8).forEach((p, i) => {
      console.log(fmtCopy(p.grid, p.depth).replace('Expert X', `Expert ${i + 1}`));
    });
  } else {
    console.log('\nNo 21+ puzzles this run. Try a longer budget or re-seed.');
  }
}

run();
