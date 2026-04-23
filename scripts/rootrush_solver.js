// Root Rush solver — BFS to find minimum moves from a given grid.
// Mirrors the in-game logic in games/rootrush.js (parse + BFS).
// Usage: node scripts/rootrush_solver.js
//
// Grid format: array of 6 strings of 6 chars each.
// '.' = empty, 'X' = special seed (horizontal length 2, row 2), A-Z = other pieces.

'use strict';

const SZ = 6;
const EXIT_ROW = 2;

function parseLevel(grid) {
  const cells = [];
  for (let r = 0; r < SZ; r++) {
    for (let c = 0; c < SZ; c++) cells.push(grid[r].charAt(c) === '.' ? null : grid[r].charAt(c));
  }
  const seen = {};
  const blist = [];
  for (let i = 0; i < SZ * SZ; i++) {
    const v = cells[i];
    if (!v || seen[v]) continue;
    seen[v] = true;
    const positions = [];
    for (let j = 0; j < SZ * SZ; j++) if (cells[j] === v) positions.push(j);
    const rows = positions.map(p => Math.floor(p / SZ));
    const cols = positions.map(p => p % SZ);
    const orient = (rows[0] === rows[rows.length - 1]) ? 'h' : 'v';
    blist.push({
      id: v, length: positions.length, orient,
      row: Math.min(...rows), col: Math.min(...cols),
      special: (v === 'X'),
    });
  }
  return blist;
}

function validate(grid) {
  // Strict checks: every piece must be contiguous h or v, length 2-6.
  const parsed = parseLevel(grid);
  const cells = [];
  for (let r = 0; r < SZ; r++) {
    for (let c = 0; c < SZ; c++) cells.push(grid[r].charAt(c) === '.' ? null : grid[r].charAt(c));
  }
  let x = null;
  for (const b of parsed) {
    if (b.length < 2) return `piece ${b.id} has length ${b.length} (< 2)`;
    if (b.length > 6) return `piece ${b.id} has length ${b.length} (> 6)`;
    // Check contiguity
    const expected = [];
    for (let k = 0; k < b.length; k++) {
      expected.push(b.orient === 'h' ? b.row * SZ + b.col + k : (b.row + k) * SZ + b.col);
    }
    for (const pos of expected) {
      if (cells[pos] !== b.id) return `piece ${b.id} not contiguous (missing cell ${pos})`;
    }
    if (b.special) {
      x = b;
      if (b.orient !== 'h') return `X must be horizontal`;
      if (b.length !== 2) return `X must be length 2`;
      if (b.row !== EXIT_ROW) return `X must be on row ${EXIT_ROW}`;
    }
  }
  if (!x) return 'no X piece';
  return null;
}

function serialize(blks) {
  const parts = blks.map(b => b.id + b.row + b.col);
  parts.sort();
  return parts.join(',');
}

function isWon(blks) {
  for (const b of blks) if (b.special && b.orient === 'h' && b.row === EXIT_ROW && b.col + b.length >= SZ) return true;
  return false;
}

function genMoves(blks) {
  const g = new Array(SZ * SZ).fill(null);
  for (const bb of blks) {
    for (let k = 0; k < bb.length; k++) {
      const cell = bb.orient === 'h' ? bb.row * SZ + bb.col + k : (bb.row + k) * SZ + bb.col;
      g[cell] = bb.id;
    }
  }
  const mvs = [];
  for (let idx = 0; idx < blks.length; idx++) {
    const b = blks[idx];
    const myCells = [];
    for (let kk = 0; kk < b.length; kk++) {
      const c = b.orient === 'h' ? b.row * SZ + b.col + kk : (b.row + kk) * SZ + b.col;
      myCells.push(c); g[c] = null;
    }
    if (b.orient === 'h') {
      for (let l = 1; b.col - l >= 0; l++) {
        if (g[b.row * SZ + b.col - l] !== null) break;
        mvs.push({ idx, delta: -l });
      }
      for (let rt = 1; b.col + b.length - 1 + rt < SZ; rt++) {
        if (g[b.row * SZ + b.col + b.length - 1 + rt] !== null) break;
        mvs.push({ idx, delta: rt });
      }
    } else {
      for (let u = 1; b.row - u >= 0; u++) {
        if (g[(b.row - u) * SZ + b.col] !== null) break;
        mvs.push({ idx, delta: -u });
      }
      for (let d = 1; b.row + b.length - 1 + d < SZ; d++) {
        if (g[(b.row + b.length - 1 + d) * SZ + b.col] !== null) break;
        mvs.push({ idx, delta: d });
      }
    }
    for (const c of myCells) g[c] = b.id;
  }
  return mvs;
}

function applyMove(blks, mv) {
  const out = blks.map(b => ({ ...b }));
  const nb = out[mv.idx];
  if (nb.orient === 'h') nb.col += mv.delta; else nb.row += mv.delta;
  return out;
}

function solve(grid, maxDepth = 40) {
  const start = parseLevel(grid);
  if (isWon(start)) return { depth: 0, path: [] };
  const queue = [{ blks: start, depth: 0, path: [] }];
  const visited = {};
  visited[serialize(start)] = true;
  while (queue.length) {
    const node = queue.shift();
    if (node.depth > maxDepth) return { depth: -1, path: [] };
    const moves = genMoves(node.blks);
    for (const mv of moves) {
      const nb = applyMove(node.blks, mv);
      const humanMv = `${node.blks[mv.idx].id}${node.blks[mv.idx].orient === 'h' ? (mv.delta > 0 ? ' right ' : ' left ') : (mv.delta > 0 ? ' down ' : ' up ')}${Math.abs(mv.delta)}`;
      if (isWon(nb)) return { depth: node.depth + 1, path: [...node.path, humanMv] };
      const key = serialize(nb);
      if (!visited[key]) {
        visited[key] = true;
        queue.push({ blks: nb, depth: node.depth + 1, path: [...node.path, humanMv] });
      }
    }
  }
  return { depth: -1, path: [] };
}

// ── Candidates ─────────────────────────────────────────────────────────────
// Hand-authored tutorials (3 moves each, distinct concepts)
const CANDIDATES = [
  {
    name: 'Tutorial 1 — parallel blockers',
    note: 'Two vertical blockers side-by-side above the exit row. Move each up, then slide out.',
    grid: [
      'CCC...',
      '....AB',
      '..XXAB',
      '......',
      'D..EEE',
      'DFF...',
    ],
  },
  {
    name: 'Tutorial 2 — unblock the unblocker',
    note: 'A is trapped between C above and MM below. Move MM, then A, then X.',
    grid: [
      'JJ...C',
      '.....C',
      '..XX.A',
      '.....A',
      '....MM',
      '..KKK.',
    ],
  },
  {
    name: 'Tutorial 3 — clear the roof',
    note: 'A is pinned by H above and B below. Slide H off-axis, then A goes up, then X out.',
    grid: [
      '..HHH.',
      '....A.',
      '..XXA.',
      '....B.',
      '....B.',
      '..GGGG',
    ],
  },
];

function fmt(grid) { return grid.join('\n  '); }

module.exports = { solve, validate, parseLevel };

if (require.main === module) {
  for (const c of CANDIDATES) {
    const err = validate(c.grid);
    if (err) {
      console.log(`❌ ${c.name}: ${err}`);
      console.log('  ' + fmt(c.grid));
      continue;
    }
    const { depth, path } = solve(c.grid);
    const mark = depth === 3 ? '✓' : `⚠ depth=${depth}`;
    console.log(`${mark} ${c.name}`);
    console.log('  note: ' + c.note);
    console.log('  grid:\n  ' + fmt(c.grid));
    console.log('  solution (' + depth + ' moves): ' + path.join(' → '));
    console.log('');
  }
}
