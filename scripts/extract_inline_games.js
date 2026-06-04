/*
 * Sky Wolf Studios — Inline-game extractor (READ-ONLY against index.html).
 *
 * Reads index.html, locates each inline mount function (GF/GY/GX/...),
 * extracts its body with a string-aware brace counter, wraps the
 * extracted body in an IIFE that registers window._gameFns[<id>] =
 * <fn>, and writes the result to /games/_inline/<id>.js.
 *
 * Does NOT modify index.html. Every output file is a sibling, not a
 * replacement.
 *
 * Run: node scripts/extract_inline_games.js
 */
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var OUT_DIR = path.join(ROOT, 'games', '_inline');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// id → mount-fn name (sorted by line order so we can pre-compute spans)
var INLINE_GAMES = [
  { id: 'farkle',        fn: 'GF',  approxStart: 66013 },
  { id: 'yahtzee',       fn: 'GY',  approxStart: 66359 },
  { id: 'doubleshutter', fn: 'GDS', approxStart: 66678 },
  { id: 'picross',       fn: 'GX',  approxStart: 66833 },
  { id: 'checkers',      fn: 'GCK', approxStart: 66867 },
  { id: 'reversi',       fn: 'GRV', approxStart: 67333 },
  { id: 'mastermind',    fn: 'GMM', approxStart: 67606 },
  { id: 'sokoban',       fn: 'GSK', approxStart: 68037 },
  { id: 'bloomwheel',    fn: 'GBW', approxStart: 68475 },
  { id: 'backgammon',    fn: 'GBG', approxStart: 68766 }
];

// ── String/comment-aware brace counter ──────────────────────────────────
function findFunctionEnd(text, startIdx) {
  var i = startIdx;
  var depth = 0;
  var inSingle = false, inDouble = false, inTemplate = false;
  var inLineComment = false, inBlockComment = false;
  // Skip past the opening { (we expect to find it right after `function NAME(args) `)
  while (i < text.length && text[i] !== '{') i++;
  if (i >= text.length) return -1;
  depth = 1; i++;

  while (i < text.length && depth > 0) {
    var ch = text[i];
    var nxt = text[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      i++; continue;
    }
    if (inBlockComment) {
      if (ch === '*' && nxt === '/') { inBlockComment = false; i += 2; continue; }
      i++; continue;
    }
    if (inSingle) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === "'") inSingle = false;
      i++; continue;
    }
    if (inDouble) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === '"') inDouble = false;
      i++; continue;
    }
    if (inTemplate) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === '`') inTemplate = false;
      i++; continue;
    }

    // Not in string / comment
    if (ch === '/' && nxt === '/') { inLineComment = true; i += 2; continue; }
    if (ch === '/' && nxt === '*') { inBlockComment = true; i += 2; continue; }
    if (ch === "'") { inSingle = true; i++; continue; }
    if (ch === '"') { inDouble = true; i++; continue; }
    if (ch === '`') { inTemplate = true; i++; continue; }
    if (ch === '{') { depth++; i++; continue; }
    if (ch === '}') { depth--; i++; if (depth === 0) return i; continue; }

    i++;
  }
  return -1;
}

function lineNumber(text, idx) {
  var ln = 1;
  for (var i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) ln++;
  return ln;
}

function extractGame(game) {
  // Locate the exact `function FN(...){` pattern near approxStart.
  var pattern = 'function ' + game.fn + '(';
  var searchFrom = Math.max(0, indexOfLine(src, game.approxStart - 5));
  var idx = src.indexOf(pattern, searchFrom);
  if (idx < 0) {
    return { ok: false, err: 'function ' + game.fn + ' not found near line ' + game.approxStart };
  }
  var endIdx = findFunctionEnd(src, idx);
  if (endIdx < 0) {
    return { ok: false, err: 'could not find closing brace for ' + game.fn };
  }
  var body = src.substring(idx, endIdx);
  return {
    ok: true,
    id: game.id,
    fn: game.fn,
    startLine: lineNumber(src, idx),
    endLine: lineNumber(src, endIdx - 1),
    body: body
  };
}

function indexOfLine(text, lineNo) {
  var ln = 1;
  for (var i = 0; i < text.length; i++) {
    if (ln === lineNo) return i;
    if (text.charCodeAt(i) === 10) ln++;
  }
  return text.length;
}

// ── Wrap an extracted function into an IIFE module ──────────────────────
function wrapAsModule(game, ex) {
  return [
    '/* ════════════════════════════════════════════════════════════════════',
    ' * Sky Wolf Studios — Inline game copy: ' + game.id,
    ' *',
    ' * COPY of the inline ' + game.fn + ' mount function from index.html',
    ' * lines ' + ex.startLine + '-' + ex.endLine + '.',
    ' *',
    ' * DUPLICATE, NEVER MOVE. The original code in index.html is the',
    ' * live source of truth for the in-LW play surface. This copy serves',
    ' * the /play/' + game.id + '.html shell only. To keep them aligned,',
    ' * re-run scripts/extract_inline_games.js whenever index.html\'s',
    ' * inline game block is edited.',
    ' * ════════════════════════════════════════════════════════════════════ */',
    '(function(){',
    "  'use strict';",
    '  var G=window._G;',
    '  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,',
    '      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,',
    '      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,',
    '      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;',
    '  window._gameFns=window._gameFns||{};',
    '',
    '  ' + ex.body.split('\n').join('\n  '),
    '',
    "  window._gameFns['" + game.id + "']=" + game.fn + ';',
    '})();',
    ''
  ].join('\n');
}

// ── Run ─────────────────────────────────────────────────────────────────
var results = [];
INLINE_GAMES.forEach(function(game){
  var ex = extractGame(game);
  if (!ex.ok) {
    results.push({ id: game.id, ok: false, err: ex.err });
    console.log('  ✗ ' + game.id + ' — ' + ex.err);
    return;
  }
  var modSrc = wrapAsModule(game, ex);
  var outPath = path.join(OUT_DIR, game.id + '.js');
  fs.writeFileSync(outPath, modSrc, 'utf8');
  results.push({
    id: game.id,
    ok: true,
    span: ex.startLine + '-' + ex.endLine,
    bytes: modSrc.length,
    path: 'games/_inline/' + game.id + '.js'
  });
  console.log('  ✓ ' + game.id + '  (lines ' + ex.startLine + '-' + ex.endLine + ', ' + modSrc.length + ' bytes) → ' + 'games/_inline/' + game.id + '.js');
});

var failed = results.filter(function(r){ return !r.ok; });
console.log('');
console.log(results.length - failed.length + ' / ' + results.length + ' inline games extracted.');
process.exit(failed.length === 0 ? 0 : 1);
