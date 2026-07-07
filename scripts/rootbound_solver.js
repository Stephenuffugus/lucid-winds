// Rootbound (Klotski) BFS solver + level tools.
// Board: 4 cols (W) x 5 rows (H). Exit gate: bottom-centre (cols 1,2).
// Goal: the 2x2 piece (CC) reaches top-left (row 3, col 1) so it occupies the
// bottom-centre and can slide out the gate.
// A "move" = sliding one piece any number of cells in a straight line (the
// classic Klotski convention, matching the drag-a-block gesture in the game).
'use strict';
var W = 4, H = 5;
var DIM = { CC: [2, 2], V: [1, 2], H: [2, 1], S: [1, 1] }; // [w,h]

// Parse a 5-row grid (array of 4-char strings). Distinct letters = distinct
// pieces; '.' = empty. Piece type inferred from bounding box.
function parse(grid) {
  var byLetter = {};
  for (var r = 0; r < H; r++) for (var c = 0; c < W; c++) {
    var ch = grid[r][c];
    if (ch === '.') continue;
    (byLetter[ch] = byLetter[ch] || []).push([r, c]);
  }
  var pieces = [];
  for (var k in byLetter) {
    var cells = byLetter[k];
    var minr = 99, minc = 99, maxr = -1, maxc = -1;
    for (var i = 0; i < cells.length; i++) {
      minr = Math.min(minr, cells[i][0]); maxr = Math.max(maxr, cells[i][0]);
      minc = Math.min(minc, cells[i][1]); maxc = Math.max(maxc, cells[i][1]);
    }
    var w = maxc - minc + 1, h = maxr - minr + 1, type;
    if (w === 2 && h === 2) type = 'CC';
    else if (w === 1 && h === 2) type = 'V';
    else if (w === 2 && h === 1) type = 'H';
    else if (w === 1 && h === 1) type = 'S';
    else throw new Error('bad piece "' + k + '" ' + w + 'x' + h);
    pieces.push({ t: type, r: minr, c: minc });
  }
  return pieces;
}

function occGrid(pieces) {
  var g = new Array(W * H); for (var i = 0; i < g.length; i++) g[i] = -1;
  for (var p = 0; p < pieces.length; p++) {
    var pc = pieces[p], d = DIM[pc.t];
    for (var yy = 0; yy < d[1]; yy++) for (var xx = 0; xx < d[0]; xx++) g[(pc.r + yy) * W + (pc.c + xx)] = p;
  }
  return g;
}

// canonical key: per-cell shape letter (same-shape pieces interchangeable)
function keyOf(pieces) {
  var g = new Array(W * H); for (var i = 0; i < g.length; i++) g[i] = '.';
  for (var p = 0; p < pieces.length; p++) {
    var pc = pieces[p], d = DIM[pc.t];
    for (var yy = 0; yy < d[1]; yy++) for (var xx = 0; xx < d[0]; xx++) g[(pc.r + yy) * W + (pc.c + xx)] = pc.t[0];
  }
  return g.join('');
}

function ccPiece(pieces) { for (var i = 0; i < pieces.length; i++) if (pieces[i].t === 'CC') return pieces[i]; return null; }
function isGoal(pieces) { var cc = ccPiece(pieces); return cc && cc.r === 3 && cc.c === 1; }

// successors: [pieces', pieceIdx, dr, dc, dist]
function successors(pieces) {
  var g = occGrid(pieces), out = [];
  var dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (var pi = 0; pi < pieces.length; pi++) {
    var pc = pieces[pi], d = DIM[pc.t];
    for (var di = 0; di < 4; di++) {
      var dr = dirs[di][0], dc = dirs[di][1], dist = 0;
      var cr = pc.r, cc = pc.c;
      while (true) {
        var nr = cr + dr, nc = cc + dc;
        // check the leading edge cells at new position are in-bounds and empty (or self)
        if (nr < 0 || nc < 0 || nr + d[1] > H || nc + d[0] > W) break;
        var ok = true;
        for (var yy = 0; yy < d[1] && ok; yy++) for (var xx = 0; xx < d[0]; xx++) {
          var owner = g[(nr + yy) * W + (nc + xx)];
          if (owner !== -1 && owner !== pi) { ok = false; break; }
        }
        if (!ok) break;
        cr = nr; cc = nc; dist++;
        var np = pieces.slice();
        np[pi] = { t: pc.t, r: cr, c: cc };
        out.push([np, pi, dr, dc, dist]);
      }
    }
  }
  return out;
}

// BFS. Returns { moves, path } where path = list of {t, fromR, fromC, toR, toC}.
function solve(grid, cap) {
  var start = Array.isArray(grid) ? parse(grid) : grid.slice();
  cap = cap || 400000;
  var startKey = keyOf(start);
  if (isGoal(start)) return { moves: 0, path: [], states: 1 };
  var q = [start], head = 0;
  var prev = {}; prev[startKey] = null; // key -> {pkey, move}
  var seen = {}; seen[startKey] = true;
  var count = 1;
  while (head < q.length) {
    if (count > cap) return { moves: -1, path: null, states: count, capped: true };
    var cur = q[head++]; var curKey = keyOf(cur);
    var succ = successors(cur);
    for (var s = 0; s < succ.length; s++) {
      var np = succ[s][0], key = keyOf(np);
      if (seen[key]) continue;
      seen[key] = true; count++;
      var moveRec = { pi: succ[s][1], fromR: cur[succ[s][1]].r, fromC: cur[succ[s][1]].c, toR: np[succ[s][1]].r, toC: np[succ[s][1]].c, t: cur[succ[s][1]].t };
      prev[key] = { pkey: curKey, move: moveRec };
      if (isGoal(np)) {
        // reconstruct
        var path = [], k = key;
        while (prev[k]) { path.unshift(prev[k].move); k = prev[k].pkey; }
        return { moves: path.length, path: path, states: count };
      }
      q.push(np);
    }
  }
  return { moves: -1, path: null, states: count }; // unsolvable
}

function validate(grid) {
  // structural checks: exactly one CC, covered cells count, exit reachable dims
  var pieces; try { pieces = parse(grid); } catch (e) { return e.message; }
  var ccs = pieces.filter(function (p) { return p.t === 'CC'; });
  if (ccs.length !== 1) return 'need exactly one 2x2 piece, found ' + ccs.length;
  // overlap / bounds
  var g = new Array(W * H).fill(0);
  for (var i = 0; i < pieces.length; i++) {
    var pc = pieces[i], d = DIM[pc.t];
    if (pc.r < 0 || pc.c < 0 || pc.r + d[1] > H || pc.c + d[0] > W) return 'piece out of bounds';
    for (var yy = 0; yy < d[1]; yy++) for (var xx = 0; xx < d[0]; xx++) {
      var idx = (pc.r + yy) * W + (pc.c + xx); if (g[idx]) return 'overlap'; g[idx] = 1;
    }
  }
  return null;
}

module.exports = { W: W, H: H, DIM: DIM, parse: parse, keyOf: keyOf, solve: solve, validate: validate, occGrid: occGrid, isGoal: isGoal };
