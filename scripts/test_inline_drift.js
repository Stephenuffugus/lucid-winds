/*
 * Sky Wolf Studio — Inline-game drift watchdog.
 *
 * When Stephen edits an inline game inside index.html (Three Sisters
 * is the only one left hub-only; the other 10 inline games live in
 * index.html as live source AND are duplicated into /games/_inline/
 * for the standalone /play/<id>.html shells), the shell copies go
 * silently stale until somebody re-runs scripts/extract_inline_games.js.
 *
 * This watchdog catches that. It re-extracts each inline function
 * body's exact span from the LIVE index.html, hashes it, and compares
 * against the baseline written by extract_inline_games.js
 * (games/_inline/.source_hashes.json). Any mismatch → exits non-zero
 * with a message telling Stephen exactly which game to re-extract.
 *
 * READ-ONLY against index.html. Modifies nothing.
 *
 * Run: node scripts/test_inline_drift.js
 * Exits non-zero on any drift or missing baseline.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var ROOT = path.join(__dirname, '..');
var BASELINE_PATH = path.join(ROOT, 'games', '_inline', '.source_hashes.json');

// Same mount-function list as extract_inline_games.js (single source of
// truth would be nicer; for now keep in sync manually — these are
// stable names tied to index.html structure).
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

// The shared LW_DICE / _LW_tumble block. The dice games (farkle, yahtzee,
// doubleshutter) depend on it; if it drifts, _dice_lib.js needs regenerating.
//
// ⛔⛔ This was a hardcoded line range, '65911-66010', and it rotted. index.html
// grew about 207 lines, the range slid off the dice code onto a puzzle grid
// rotation and a chess cloneBoard, and this watchdog reported "_dice_lib
// DRIFTED" about code that has nothing to do with dice. Its printed remedy
// would then have re-baselined the wrong hundred lines and gone green forever.
// Find it by marker, and throw rather than guess if the markers are not there:
// a wrong comparison is worse than none, because it looks like a passing test.
var DICE_START = 'window.LW_DICE={';
var DICE_LAST  = 'window._LW_tumble=function';   // the LAST member of the block

function sha256(s){ return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }

function findFunctionEnd(text, startIdx) {
  var i = startIdx;
  var depth = 0;
  var inSingle = false, inDouble = false, inTemplate = false;
  var inLineComment = false, inBlockComment = false;
  while (i < text.length && text[i] !== '{') i++;
  if (i >= text.length) return -1;
  depth = 1; i++;
  while (i < text.length && depth > 0) {
    var ch = text[i], nxt = text[i + 1];
    if (inLineComment)   { if (ch === '\n') inLineComment = false; i++; continue; }
    if (inBlockComment)  { if (ch === '*' && nxt === '/') { inBlockComment = false; i += 2; continue; } i++; continue; }
    if (inSingle)        { if (ch === '\\') { i += 2; continue; } if (ch === "'") inSingle = false; i++; continue; }
    if (inDouble)        { if (ch === '\\') { i += 2; continue; } if (ch === '"') inDouble = false; i++; continue; }
    if (inTemplate)      { if (ch === '\\') { i += 2; continue; } if (ch === '`') inTemplate = false; i++; continue; }
    if (ch === '/' && nxt === '/') { inLineComment = true;  i += 2; continue; }
    if (ch === '/' && nxt === '*') { inBlockComment = true; i += 2; continue; }
    if (ch === "'")               { inSingle = true;   i++; continue; }
    if (ch === '"')               { inDouble = true;   i++; continue; }
    if (ch === '`')               { inTemplate = true; i++; continue; }
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

function indexOfLine(text, lineNo) {
  var ln = 1;
  for (var i = 0; i < text.length; i++) {
    if (ln === lineNo) return i;
    if (text.charCodeAt(i) === 10) ln++;
  }
  return text.length;
}

function extractBody(src, game){
  var pattern = 'function ' + game.fn + '(';
  var searchFrom = Math.max(0, indexOfLine(src, game.approxStart - 5));
  var idx = src.indexOf(pattern, searchFrom);
  if (idx < 0) return { ok: false, err: 'function ' + game.fn + ' not found near line ' + game.approxStart };
  var endIdx = findFunctionEnd(src, idx);
  if (endIdx < 0) return { ok: false, err: 'unbalanced braces in ' + game.fn };
  return {
    ok: true,
    body: src.substring(idx, endIdx),
    startLine: lineNumber(src, idx),
    endLine: lineNumber(src, endIdx - 1)
  };
}

function findBlockEnd(text, startIdx){
  var i = startIdx, depth = 0;
  while (i < text.length && text[i] !== '{') i++;
  if (i >= text.length) return -1;
  depth = 1; i++;
  var inS=false,inD=false,inT=false,inL=false,inB=false;
  while (i < text.length && depth > 0) {
    var ch = text[i], nx = text[i+1];
    if (inL){ if (ch === '\n') inL = false; i++; continue; }
    if (inB){ if (ch === '*' && nx === '/'){ inB=false; i+=2; continue; } i++; continue; }
    if (inS){ if (ch === '\\'){ i+=2; continue; } if (ch === "'") inS=false; i++; continue; }
    if (inD){ if (ch === '\\'){ i+=2; continue; } if (ch === '"') inD=false; i++; continue; }
    if (inT){ if (ch === '\\'){ i+=2; continue; } if (ch === '`') inT=false; i++; continue; }
    if (ch === '/' && nx === '/'){ inL=true; i+=2; continue; }
    if (ch === '/' && nx === '*'){ inB=true; i+=2; continue; }
    if (ch === "'"){ inS=true; i++; continue; }
    if (ch === '"'){ inD=true; i++; continue; }
    if (ch === '`'){ inT=true; i++; continue; }
    if (ch === '{'){ depth++; i++; continue; }
    if (ch === '}'){ depth--; i++; if (depth === 0) return i; continue; }
    i++;
  }
  return -1;
}
function extractDiceBlock(src){
  var a = src.indexOf(DICE_START);
  if (a < 0 || src.indexOf(DICE_START, a + 1) >= 0)
    throw new Error('dice lib: expected exactly one "' + DICE_START + '" in index.html');
  var b = src.indexOf(DICE_LAST);
  if (b < 0 || src.indexOf(DICE_LAST, b + 1) >= 0)
    throw new Error('dice lib: expected exactly one "' + DICE_LAST + '" in index.html');
  if (b < a) throw new Error('dice lib: ' + DICE_LAST + ' appears before ' + DICE_START);
  var end = findBlockEnd(src, b);
  if (end < 0) throw new Error('dice lib: could not find the end of ' + DICE_LAST);
  if (src.charAt(end) === ';') end++;
  return src.slice(a, end);
}

// ─── Run ─────────────────────────────────────────────────────────────────
console.log('\n=== Inline-game drift watchdog ===');

if (!fs.existsSync(BASELINE_PATH)) {
  console.log('  ✗ Baseline file not found: ' + path.relative(ROOT, BASELINE_PATH));
  console.log('    Run `node scripts/extract_inline_games.js` first to create it.');
  process.exit(1);
}

var baseline;
try { baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')); }
catch (e) {
  console.log('  ✗ Could not parse baseline JSON: ' + e.message);
  process.exit(1);
}

if (!baseline.hashes || typeof baseline.hashes !== 'object') {
  console.log('  ✗ Baseline file is missing the `hashes` object.');
  process.exit(1);
}

var src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var drifted = [];
var missing = [];
var ok = [];

INLINE_GAMES.forEach(function(game){
  var base = baseline.hashes[game.id];
  if (!base) {
    missing.push(game.id);
    return;
  }
  var ex = extractBody(src, game);
  if (!ex.ok) {
    drifted.push({ id: game.id, kind: 'extract-failed', err: ex.err });
    return;
  }
  var liveHash = sha256(ex.body);
  if (liveHash === base.sha256) {
    ok.push({ id: game.id, span: ex.startLine + '-' + ex.endLine });
  } else {
    drifted.push({
      id: game.id,
      kind: 'hash-mismatch',
      baselineSpan: base.span,
      baselineHash: base.sha256.slice(0, 12),
      liveSpan: ex.startLine + '-' + ex.endLine,
      liveHash: liveHash.slice(0, 12),
      sizeBaseline: base.bytes,
      sizeLive: ex.body.length
    });
  }
});

// Dice lib check
var diceBase = baseline.hashes._dice_lib;
if (diceBase) {
  var diceLive = extractDiceBlock(src);
  var diceLiveHash = sha256(diceLive);
  if (diceLiveHash === diceBase.sha256) {
    ok.push({ id: '_dice_lib', span: diceBase.span });
  } else {
    drifted.push({
      id: '_dice_lib',
      kind: 'hash-mismatch',
      baselineSpan: diceBase.span,
      baselineHash: diceBase.sha256.slice(0, 12),
      liveSpan: diceBase.span,
      liveHash: diceLiveHash.slice(0, 12),
      sizeBaseline: diceBase.bytes,
      sizeLive: diceLive.length
    });
  }
} else {
  missing.push('_dice_lib');
}

ok.forEach(function(o){
  console.log('  ✓ ' + o.id + '  in-sync  (lines ' + o.span + ')');
});

drifted.forEach(function(d){
  if (d.kind === 'extract-failed') {
    console.log('  ✗ ' + d.id + '  — could not re-extract from index.html: ' + d.err);
  } else {
    console.log('  ✗ ' + d.id + '  DRIFTED'
      + '  baseline=' + d.baselineHash + ' (' + d.baselineSpan + ', ' + d.sizeBaseline + ' bytes)'
      + '  live=' + d.liveHash + ' (' + d.liveSpan + ', ' + d.sizeLive + ' bytes)');
  }
});

missing.forEach(function(m){
  console.log('  ⚠ ' + m + '  — present in code but missing from baseline. Re-run extractor.');
});

var problemCount = drifted.length + missing.length;
console.log('\n' + ok.length + ' in-sync, ' + drifted.length + ' drifted, ' + missing.length + ' missing.');

if (problemCount > 0) {
  console.log('\nDRIFT DETECTED. To resync:');
  console.log('  node scripts/extract_inline_games.js');
  console.log('  node scripts/smoke_shells.js   # confirm shells still mount');
  console.log('  git add games/_inline/ scripts/extract_inline_games.js');
  console.log('  git commit -m "Resync inline-game shell copies after index.html edit"');
  process.exit(1);
}

console.log('All inline-game shell copies are aligned with index.html.');
process.exit(0);
