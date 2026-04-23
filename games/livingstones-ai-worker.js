// ═══ LIVING STONES — Go AI Worker ═══
// Pure-JS Michi-style MCTS. ES5, no deps. Web Worker (no DOM).
// Protocol:
//   in:  {cmd:'boardsize', n:9}
//        {cmd:'clear_board'}
//        {cmd:'play', color:'B'|'W', move:'D4'|'pass'}
//        {cmd:'genmove', color:'W', playouts:4000}
//   out: {type:'move', move:'E5'|'pass'|'resign'}
//        {type:'thinking', progress:0.42}
//        {type:'ready'}
'use strict';

var EMPTY = 0, BLACK = 1, WHITE = 2;
var N = 9;                    // board size
var NN = 81;                  // N*N
var board = null;             // flat Int8Array length NN
var toPlay = BLACK;
var koPoint = -1;             // simple ko: illegal point for next move, -1 if none
var lastWasPass = false;
var history = [];             // array of {board, toPlay, ko}
var moveCount = 0;

// ——— coordinate helpers ———
// GTP coords: columns A..T skipping I, so A=0,B=1,...,H=7,J=8,K=9...
var COL_LETTERS = 'ABCDEFGHJKLMNOPQRST';
function idx(r, c) { return r * N + c; }
function rc(i) { return [Math.floor(i / N), i % N]; }
function coordFromIdx(i) {
  if (i < 0) return 'pass';
  var p = rc(i);
  // rows: bottom row = 1, top row = N. (Standard GTP.)
  return COL_LETTERS.charAt(p[1]) + (N - p[0]);
}
function idxFromCoord(s) {
  if (!s || s === 'pass' || s === 'PASS') return -1;
  s = s.toUpperCase();
  var col = COL_LETTERS.indexOf(s.charAt(0));
  var row = N - parseInt(s.substring(1), 10);
  if (col < 0 || isNaN(row) || row < 0 || row >= N) return -2;
  return idx(row, col);
}

function setSize(n) {
  N = n; NN = n * n;
  board = new Int8Array(NN);
  toPlay = BLACK; koPoint = -1; lastWasPass = false; history = []; moveCount = 0;
}

function clearBoard() {
  for (var i = 0; i < NN; i++) board[i] = EMPTY;
  toPlay = BLACK; koPoint = -1; lastWasPass = false; history = []; moveCount = 0;
}

// Neighbors of i (up to 4 indices).
function neighbors(i) {
  var r = Math.floor(i / N), c = i % N;
  var out = [];
  if (r > 0) out.push(i - N);
  if (r < N - 1) out.push(i + N);
  if (c > 0) out.push(i - 1);
  if (c < N - 1) out.push(i + 1);
  return out;
}

// BFS group + liberty count. Returns {stones:[], libs:count, libSet:{i:true}}
function groupAt(b, i) {
  var color = b[i];
  if (color === EMPTY) return null;
  var visited = {}; visited[i] = true;
  var stones = [i];
  var libSet = {};
  var stack = [i];
  while (stack.length) {
    var p = stack.pop();
    var nb = neighbors(p);
    for (var k = 0; k < nb.length; k++) {
      var q = nb[k];
      if (visited[q]) continue;
      if (b[q] === EMPTY) { libSet[q] = true; }
      else if (b[q] === color) { visited[q] = true; stones.push(q); stack.push(q); }
    }
  }
  var libs = 0; for (var x in libSet) libs++;
  return { stones: stones, libs: libs, libSet: libSet };
}

// Plays stone on b at i for color. Returns {ok:bool, captured:[i...], newKo:i|-1}
// Does NOT check ko (caller does). Rejects suicide.
function tryPlay(b, i, color) {
  if (i < 0 || i >= NN) return { ok: false };
  if (b[i] !== EMPTY) return { ok: false };
  var opp = color === BLACK ? WHITE : BLACK;
  b[i] = color;
  var captured = [];
  var nb = neighbors(i);
  for (var k = 0; k < nb.length; k++) {
    var q = nb[k];
    if (b[q] === opp) {
      var g = groupAt(b, q);
      if (g.libs === 0) {
        for (var j = 0; j < g.stones.length; j++) {
          b[g.stones[j]] = EMPTY;
          captured.push(g.stones[j]);
        }
      }
    }
  }
  // suicide check
  var mg = groupAt(b, i);
  if (mg.libs === 0) {
    // revert
    b[i] = EMPTY;
    for (var m = 0; m < captured.length; m++) b[captured[m]] = opp;
    return { ok: false };
  }
  // simple ko: if exactly one stone captured and our new stone is alone with 1 liberty
  var newKo = -1;
  if (captured.length === 1 && mg.stones.length === 1 && mg.libs === 1) {
    newKo = captured[0];
  }
  return { ok: true, captured: captured, newKo: newKo };
}

// Wrapper respecting ko on the "real" game state only.
function playOnReal(i, color) {
  if (i === -1) {
    // pass
    history.push({ko: koPoint, lastPass: lastWasPass});
    lastWasPass = true;
    koPoint = -1;
    toPlay = color === BLACK ? WHITE : BLACK;
    moveCount++;
    return { ok: true, pass: true };
  }
  if (i === koPoint) return { ok: false, ko: true };
  var res = tryPlay(board, i, color);
  if (!res.ok) return res;
  history.push({ko: koPoint, lastPass: lastWasPass});
  koPoint = res.newKo;
  lastWasPass = false;
  toPlay = color === BLACK ? WHITE : BLACK;
  moveCount++;
  return res;
}

// ——— MCTS with random rollouts ———
// Node: {i, color, visits, wins, children, parent, untried, toPlayNext}
// State is cloned on expansion via cheap Int8Array copy.

function cloneBoard(b) {
  var c = new Int8Array(NN); c.set(b); return c;
}

// Fills allowed with indices of legal non-eye-filling moves for color on b (given ko).
// Returns array of indices.
function legalMoves(b, color, ko) {
  var out = [];
  for (var i = 0; i < NN; i++) {
    if (b[i] !== EMPTY) continue;
    if (i === ko) continue;
    // skip own-eye filling to prevent stupid self-destruction in rollouts
    if (isEye(b, i, color)) continue;
    // quick legality: try play on scratch
    var sc = cloneBoard(b);
    var r = tryPlay(sc, i, color);
    if (r.ok) out.push(i);
  }
  return out;
}

// Simple eye detection: all 4 orthogonal neighbors are same color or off-board,
// and >=3 of 4 diagonals are same color (2 if on edge, matching Michi).
function isEye(b, i, color) {
  var r = Math.floor(i / N), c = i % N;
  var nb = neighbors(i);
  for (var k = 0; k < nb.length; k++) {
    if (b[nb[k]] !== color) return false;
  }
  // diagonals
  var diag = [];
  if (r > 0 && c > 0) diag.push(idx(r - 1, c - 1));
  if (r > 0 && c < N - 1) diag.push(idx(r - 1, c + 1));
  if (r < N - 1 && c > 0) diag.push(idx(r + 1, c - 1));
  if (r < N - 1 && c < N - 1) diag.push(idx(r + 1, c + 1));
  var edge = diag.length < 4;
  var bad = 0;
  for (var j = 0; j < diag.length; j++) {
    if (b[diag[j]] !== color) bad++;
  }
  if (edge) return bad === 0;
  return bad <= 1;
}

// Random rollout from (b, color, ko). Returns +1 if BLACK wins area score, -1 else.
// Uses Tromp-Taylor-ish area scoring with simple komi 7.5 (only relevant for W as player, but we use 0.5 here since Black has no komi in our UI).
// Canonical 9×9 komi is 7.5; 13×13 typically 6.5. Old 0.5 was wrong and
// made AI systematically overvalue Black.
var KOMI = 7.5;
function currentKomi(){ return N<=9 ? 7.5 : 6.5; }
var ROLLOUT_LIMIT = 240;

function randomRollout(b, color, ko) {
  var consecPass = 0;
  var steps = 0;
  while (consecPass < 2 && steps < ROLLOUT_LIMIT) {
    steps++;
    // pick a random legal non-eye move
    var tries = 0, played = false;
    var maxTries = 12;
    while (tries++ < maxTries) {
      var i = (Math.random() * NN) | 0;
      if (b[i] !== EMPTY) continue;
      if (i === ko) continue;
      if (isEye(b, i, color)) continue;
      var r = tryPlay(b, i, color);
      if (r.ok) {
        ko = r.newKo;
        consecPass = 0;
        played = true;
        break;
      }
    }
    if (!played) {
      // fall back: enumerate legal, else pass
      var moves = legalMoves(b, color, ko);
      if (moves.length === 0) {
        consecPass++; ko = -1;
      } else {
        var pick = moves[(Math.random() * moves.length) | 0];
        var r2 = tryPlay(b, pick, color);
        ko = r2.newKo;
        consecPass = 0;
      }
    }
    color = color === BLACK ? WHITE : BLACK;
  }
  // area score
  return scoreBoard(b) > 0 ? 1 : -1;
}

// Tromp-Taylor-ish area scoring: stones + territory. Returns black - white - komi.
function scoreBoard(b) {
  var bScore = 0, wScore = 0;
  var seen = new Int8Array(NN);
  for (var i = 0; i < NN; i++) {
    if (b[i] === BLACK) bScore++;
    else if (b[i] === WHITE) wScore++;
    else if (!seen[i]) {
      // BFS empty region, check bordering colors
      var stack = [i]; seen[i] = 1;
      var region = [i];
      var borders = 0; // 1=black touches, 2=white touches, 3=both
      while (stack.length) {
        var p = stack.pop();
        var nb = neighbors(p);
        for (var k = 0; k < nb.length; k++) {
          var q = nb[k];
          if (b[q] === EMPTY) {
            if (!seen[q]) { seen[q] = 1; stack.push(q); region.push(q); }
          } else if (b[q] === BLACK) borders |= 1;
          else if (b[q] === WHITE) borders |= 2;
        }
      }
      if (borders === 1) bScore += region.length;
      else if (borders === 2) wScore += region.length;
    }
  }
  return bScore - wScore - currentKomi();
}

// MCTS node (flat).
function newNode(parent, moveIdx, color) {
  return {
    parent: parent,
    move: moveIdx,      // the move that led here (from parent's perspective)
    color: color,       // color to play at this node
    visits: 0,
    wins: 0,            // wins from perspective of root player
    children: null,     // array once expanded
    untried: null       // array of candidate move indices
  };
}

function uctSelect(node) {
  var best = null, bestScore = -Infinity;
  var logN = Math.log(node.visits + 1);
  var C = 1.3;
  for (var i = 0; i < node.children.length; i++) {
    var ch = node.children[i];
    var s;
    if (ch.visits === 0) s = 1e9 + Math.random();
    else s = (ch.wins / ch.visits) + C * Math.sqrt(logN / ch.visits);
    if (s > bestScore) { bestScore = s; best = ch; }
  }
  return best;
}

// Run MCTS from current real state for `color` with `playouts` budget.
function mcts(rootColor, playouts) {
  var rootBoard = cloneBoard(board);
  var rootKo = koPoint;
  var root = newNode(null, -99, rootColor);
  root.untried = legalMoves(rootBoard, rootColor, rootKo);
  // always allow pass as last resort
  root.untried.push(-1);
  root.children = [];

  var progressStep = Math.max(1, (playouts / 20) | 0);

  for (var p = 0; p < playouts; p++) {
    // Walk from root, replaying moves on a scratch board.
    var sc = cloneBoard(rootBoard);
    var ko = rootKo;
    var node = root;
    var col = rootColor;

    // 1. Selection
    while (node.untried.length === 0 && node.children.length > 0) {
      node = uctSelect(node);
      if (node.move === -1) { ko = -1; }
      else {
        var pr = tryPlay(sc, node.move, col);
        if (pr.ok) ko = pr.newKo;
      }
      col = col === BLACK ? WHITE : BLACK;
    }

    // 2. Expansion
    if (node.untried.length > 0) {
      var pick = (Math.random() * node.untried.length) | 0;
      var mv = node.untried[pick];
      node.untried.splice(pick, 1);
      if (mv === -1) { ko = -1; }
      else {
        var pr2 = tryPlay(sc, mv, col);
        if (!pr2.ok) {
          // illegal now (became illegal due to prior path) — skip
          p--; continue;
        }
        ko = pr2.newKo;
      }
      var child = newNode(node, mv, col === BLACK ? WHITE : BLACK);
      child.children = [];
      child.untried = legalMoves(sc, child.color, ko);
      child.untried.push(-1);
      node.children.push(child);
      node = child;
      col = child.color;
    }

    // 3. Rollout
    var result = randomRollout(sc, col, ko); // +1 black wins, -1 white wins

    // 4. Backprop — from root-player perspective
    var rootPerspectiveWin = (rootColor === BLACK && result > 0) || (rootColor === WHITE && result < 0);
    var n = node;
    while (n !== null) {
      n.visits++;
      if (rootPerspectiveWin) n.wins++;
      n = n.parent;
    }

    if ((p % progressStep) === 0) {
      self.postMessage({ type: 'thinking', progress: p / playouts });
    }
  }

  // pick child with most visits
  var best = null;
  for (var i = 0; i < root.children.length; i++) {
    var c = root.children[i];
    if (!best || c.visits > best.visits) best = c;
  }
  if (!best) return -1; // pass
  // resign if winrate really bad
  if (best.visits > 20 && (best.wins / best.visits) < 0.10) return -2;
  return best.move;
}

// ——— message handler ———
self.onmessage = function(ev) {
  var msg = ev.data || {};
  if (msg.cmd === 'ping') {
    // Handshake — main thread sends this immediately after attaching
    // its onmessage listener, guaranteeing this 'ready' is delivered.
    self.postMessage({ type: 'ready' });
  } else if (msg.cmd === 'boardsize') {
    setSize(msg.n || 9);
    self.postMessage({ type: 'ready' });
  } else if (msg.cmd === 'clear_board') {
    clearBoard();
    self.postMessage({ type: 'ready' });
  } else if (msg.cmd === 'play') {
    var color = msg.color === 'W' ? WHITE : BLACK;
    var i = idxFromCoord(msg.move);
    playOnReal(i, color);
    self.postMessage({ type: 'ack' });
  } else if (msg.cmd === 'genmove') {
    var color2 = msg.color === 'W' ? WHITE : BLACK;
    toPlay = color2;
    var playouts = msg.playouts || 2000;
    var mv = mcts(color2, playouts);
    if (mv === -2) {
      self.postMessage({ type: 'move', move: 'resign' });
      return;
    }
    // Bug fix: was ignoring playOnReal's return value. If MCTS chose an
    // illegal move (rare race with ko expiring across rollout boundaries),
    // the worker would still post the move and the local board would
    // reject it — silent worker/local desync. Now if the move is illegal
    // on the real board, we fall back to a pass.
    var pres = playOnReal(mv, color2);
    if (pres && pres.ok) {
      self.postMessage({ type: 'move', move: coordFromIdx(mv) });
    } else {
      self.postMessage({ type: 'move', move: 'pass' });
    }
  }
};

// initial default size
setSize(9);
// DO NOT auto-fire 'ready' on load — the main thread can't have its
// onmessage listener attached before the worker starts running, so an
// auto-ready can be lost. Instead the main thread sends a 'ping'
// command and we respond, guaranteeing the listener is attached.
// (Keeping the cmd handler also responds to legacy first-ready calls.)
