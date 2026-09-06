/*
 * Sky Wolf Studio — Inline-game extractor (READ-ONLY against index.html).
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
    ' * Sky Wolf Studio — Inline game copy: ' + game.id,
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

// ── SHA-256 helper for the drift watchdog baseline ──────────────────────
var crypto = require('crypto');
function sha256(s){ return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }

// ── Run ─────────────────────────────────────────────────────────────────
var results = [];
var sourceHashes = {};
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
  sourceHashes[game.id] = {
    sha256: sha256(ex.body),
    span: ex.startLine + '-' + ex.endLine,
    bytes: ex.body.length
  };
  results.push({
    id: game.id,
    ok: true,
    span: ex.startLine + '-' + ex.endLine,
    bytes: modSrc.length,
    path: 'games/_inline/' + game.id + '.js'
  });
  console.log('  ✓ ' + game.id + '  (lines ' + ex.startLine + '-' + ex.endLine + ', ' + modSrc.length + ' bytes) → ' + 'games/_inline/' + game.id + '.js');
});

// Hash the shared dice library too: the dice games depend on it via
// games/_inline/_dice_lib.js.
//
// ⛔⛔ THIS USED TO BE A HARDCODED LINE WINDOW, allLines.slice(65910, 66010),
// and it rotted exactly the way you would expect. index.html grew by about 207
// lines, the window slid off the dice code entirely and came to rest on a
// puzzle grid rotation and a chess cloneBoard, and the drift watchdog spent
// who knows how long reporting "_dice_lib DRIFTED" about code that has nothing
// to do with dice. Worse, the remedy it printed, re-running this script, would
// have re-baselined the WRONG hundred lines and gone green forever.
//
// So: find it by marker, the same way the ten games are found, and refuse to
// guess if the markers are not exactly where they should be. A wrong hash is
// worse than no hash, because a wrong hash looks like a passing test.
var DICE_START = 'window.LW_DICE={';
var DICE_LAST  = 'window._LW_tumble=function';   // the LAST member of the block
var diceBlock;
(function () {
  var startIdx = src.indexOf(DICE_START);
  if (startIdx < 0 || src.indexOf(DICE_START, startIdx + 1) >= 0)
    throw new Error('dice lib: expected exactly one "' + DICE_START + '" in index.html');
  var lastIdx = src.indexOf(DICE_LAST);
  if (lastIdx < 0 || src.indexOf(DICE_LAST, lastIdx + 1) >= 0)
    throw new Error('dice lib: expected exactly one "' + DICE_LAST + '" in index.html');
  if (lastIdx < startIdx)
    throw new Error('dice lib: ' + DICE_LAST + ' appears before ' + DICE_START);
  var endIdx = findFunctionEnd(src, lastIdx);
  if (endIdx < 0) throw new Error('dice lib: could not find the end of ' + DICE_LAST);
  // include the trailing semicolon if there is one
  if (src.charAt(endIdx) === ';') endIdx++;
  diceBlock = src.slice(startIdx, endIdx);
  var startLine = lineNumber(src, startIdx), endLine = lineNumber(src, endIdx - 1);
  sourceHashes['_dice_lib'] = {
    sha256: sha256(diceBlock),
    span: startLine + '-' + endLine,
    bytes: diceBlock.length
  };
  console.log('  \u2713 _dice_lib  (lines ' + startLine + '-' + endLine + ', ' +
    diceBlock.length + ' bytes, found by marker)');
  console.log('      first line: ' + diceBlock.split('\n')[0].slice(0, 72));
  var dl = diceBlock.split('\n');
  console.log('      last line:  ' + dl[dl.length - 1].slice(0, 72));
})();

// Write the drift watchdog baseline. test_inline_drift.js reads this to
// detect when an inline game in index.html has been edited without the
// extractor being re-run.
var hashesPath = path.join(OUT_DIR, '.source_hashes.json');
fs.writeFileSync(
  hashesPath,
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    note: 'Baseline hashes of inline-game source regions in index.html. Re-run scripts/extract_inline_games.js after editing any inline game so the shell copies and these hashes stay aligned. scripts/test_inline_drift.js reads this file and fails if the live source diverges.',
    hashes: sourceHashes
  }, null, 2) + '\n',
  'utf8'
);

var failed = results.filter(function(r){ return !r.ok; });
console.log('');
console.log(results.length - failed.length + ' / ' + results.length + ' inline games extracted.');
console.log('Wrote drift-watchdog baseline to ' + path.relative(ROOT, hashesPath));
process.exit(failed.length === 0 ? 0 : 1);
