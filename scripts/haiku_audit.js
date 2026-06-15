/*
 * Haiku bank audit — syllable + vocabulary + "show vs tell" report.
 *
 * Reads the live banks out of word-banks.js (no re-implementation) and reports:
 *   1. Syllable counts per line vs target (HAIKU_A/C + KIGO = 5, HAIKU_B = 7).
 *      Heuristic counter (Lingua-style): treat OFF-by-2+ as likely-real,
 *      OFF-by-1 as "ear-check" (English syllable heuristics are imperfect).
 *   2. Vocabulary frequency — overused content words, unique-word count, and
 *      opening-word monotony (how many lines start "The"/"And").
 *   3. "Tell, don't show" flags — lines leaning on abstraction/aphorism, which
 *      are the least haiku-like (the masters show a concrete image; they don't
 *      state a moral). Candidates for pruning/rewrite, NOT auto-changes.
 *
 * Run: node scripts/haiku_audit.js
 */
var fs = require('fs');
var window = {};
eval(fs.readFileSync(require('path').join(__dirname, '..', 'word-banks.js'), 'utf8'));
var B = window._LW_BANKS;

var BANKS = [
  { name: 'HAIKU_A', target: 5, lines: B.HAIKU_A },
  { name: 'HAIKU_B', target: 7, lines: B.HAIKU_B },
  { name: 'HAIKU_C', target: 5, lines: B.HAIKU_C },
  { name: 'KIGO_SPRING', target: 5, lines: B.KIGO_SPRING },
  { name: 'KIGO_SUMMER', target: 5, lines: B.KIGO_SUMMER },
  { name: 'KIGO_AUTUMN', target: 5, lines: B.KIGO_AUTUMN },
  { name: 'KIGO_WINTER', target: 5, lines: B.KIGO_WINTER }
];

// ---- heuristic syllable counter (best-effort) ----
function sylWord(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 2) return 1;
  // silent -ed after a non t/d consonant ("cooled","lived" = 1 syllable)
  w = w.replace(/([^aeiouytd])ed$/, '$1');
  // -es: its OWN syllable after a sibilant ("branches","ridges","horses");
  // otherwise the e is silent ("leaves","stones","comes","hides","pines").
  if (!/(?:s|x|z|ch|sh|ge|ce)es$/.test(w)) w = w.replace(/([^aeiouy])es$/, '$1');
  // silent trailing e, but NOT consonant+le ("cradle","able" keep their -le)
  if (/[^aeiouy]e$/.test(w) && !/[^aeiouy]le$/.test(w)) w = w.slice(0, -1);
  var m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}
function sylLine(line) {
  return line.split(/\s+/).reduce(function (n, wd) { return n + sylWord(wd); }, 0);
}

// ---- run syllable audit ----
console.log('================ SYLLABLE AUDIT (heuristic) ================');
var grossAll = [], earAll = [];
BANKS.forEach(function (bk) {
  var gross = [], ear = [];
  bk.lines.forEach(function (ln) {
    var c = sylLine(ln), d = c - bk.target;
    if (Math.abs(d) >= 2) gross.push(ln + '  [~' + c + ', want ' + bk.target + ']');
    else if (d !== 0) ear.push(ln + '  [~' + c + ', want ' + bk.target + ']');
  });
  console.log('\n' + bk.name + ' (' + bk.lines.length + ' lines, target ' + bk.target + '): ' +
    gross.length + ' likely-off, ' + ear.length + ' ear-check');
  gross.forEach(function (l) { console.log('   !! ' + l); });
  grossAll = grossAll.concat(gross); earAll = earAll.concat(ear);
});
console.log('\nTOTAL: ' + grossAll.length + ' likely-off (off by 2+), ' + earAll.length + ' ear-check (off by 1, heuristic-noisy)');

// ---- vocabulary audit (exact) ----
var STOP = {};
('the a an and or in on of to its it is through with past by no all what where when ' +
 'for from at as but not into out up down over under near each one this that their they ' +
 'them then than too so if be has have does do').split(' ').forEach(function (w) { STOP[w] = 1; });

var freq = {}, total = 0, openWord = {}, allLines = [];
BANKS.forEach(function (bk) { bk.lines.forEach(function (ln) { allLines.push(ln); }); });
allLines.forEach(function (ln) {
  var words = ln.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).filter(Boolean);
  var ow = words[0] || '';
  openWord[ow] = (openWord[ow] || 0) + 1;
  words.forEach(function (w) {
    if (STOP[w]) return;
    freq[w] = (freq[w] || 0) + 1; total++;
  });
});
var sorted = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; });
console.log('\n================ VOCABULARY AUDIT (exact) ================');
console.log('Lines: ' + allLines.length + ' | content-word tokens: ' + total + ' | unique content words: ' + sorted.length);
console.log('\nTop 30 most-used content words (overuse = "samey" risk):');
sorted.slice(0, 30).forEach(function (w, i) {
  console.log('   ' + (freq[w] + '').padStart(4) + '  ' + w + (i % 3 === 2 ? '' : ''));
});
console.log('\nHapax (used once) count: ' + sorted.filter(function (w) { return freq[w] === 1; }).length +
  '  — healthy variety lives here');

console.log('\nOpening-word monotony (top 8):');
Object.keys(openWord).sort(function (a, b) { return openWord[b] - openWord[a]; }).slice(0, 8).forEach(function (w) {
  console.log('   ' + (openWord[w] + '').padStart(4) + '  "' + w + '..."  (' + (100 * openWord[w] / allLines.length).toFixed(1) + '% of lines)');
});

// ---- "tell, don't show" flags ----
var ABSTRACT = ('faith love proof gift gifts favor lie truth hope fear regret grief joy peace ' +
  'patience wisdom mercy fate doom glory enough always never forever win wins won lesson ' +
  'teaches knows remembers learns forgives belongs matters').split(' ');
var ABS = {}; ABSTRACT.forEach(function (w) { ABS[w] = 1; });
var tells = [];
allLines.forEach(function (ln) {
  var words = ln.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/);
  if (words.some(function (w) { return ABS[w]; })) tells.push(ln);
});
console.log('\n================ "TELL, DON\'T SHOW" FLAGS ================');
console.log(tells.length + ' lines lean on abstraction/aphorism (least haiku-like — review for prune/rewrite):');
tells.slice(0, 40).forEach(function (l) { console.log('   ~ ' + l); });
if (tells.length > 40) console.log('   ... +' + (tells.length - 40) + ' more');
