// Summarize ESLint JSON output: total by rule + filter no-undef
// noise (cross-IIFE refs in this single-file vanilla JS codebase) down
// to truly-undefined names that grep can't locate in index.html.
//
// Usage: `npm run lint:summary` after a `npm run lint` JSON report
// is written to /tmp/eslint-report.json. See package.json scripts.
var fs = require('fs');
var path = require('path');

var REPORT = '/tmp/eslint-report.json';
if (!fs.existsSync(REPORT)) {
  console.error('No report at ' + REPORT + '. Run `npm run lint:summary` (writes report first).');
  process.exit(2);
}

var html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));

// Build defined-identifier set from declarations in index.html.
var defined = new Set();
function add(m){ if (m) defined.add(m); }

[
  /function\s+([\w$]+)/g,
  /\b(?:var|let|const)\s+([\w$]+)/g,
  /window\.([\w$]+)\s*=/g,
  /window\[['"]([\w$]+)['"]\]\s*=/g,
  /(?:^|[\s,{])\s*([\w$]+)\s*:\s*function/gm,
  /catch\s*\(\s*([\w$]+)\s*\)/g
].forEach(function(re){
  var m;
  while ((m = re.exec(html)) !== null) add(m[1]);
});

// Multi-var declarations
var mv = html.matchAll(/\b(?:var|let|const)\s+([^;=\n{(]+)/g);
for (var entry of mv) {
  entry[1].split(',').forEach(function(part){
    var t = part.trim().replace(/[\s=].*$/, '');
    if (/^[\w$]+$/.test(t)) defined.add(t);
  });
}

// Function args
var fa = html.matchAll(/function\s*[\w$]*\s*\(([^)]*)\)/g);
for (var f of fa) {
  f[1].split(',').forEach(function(a){
    var t = a.trim();
    if (/^[\w$]+$/.test(t)) defined.add(t);
  });
}

// Categorize messages
var total = 0;
var byRule = {};
var trueTypos = {};
report.forEach(function(file){
  file.messages.forEach(function(m){
    total++;
    var k = m.ruleId || '(parse)';
    byRule[k] = (byRule[k] || 0) + 1;
    if (m.ruleId === 'no-undef') {
      var match = m.message.match(/^'([^']+)' is not defined/);
      if (match && !defined.has(match[1])) {
        trueTypos[match[1]] = trueTypos[match[1]] || [];
        trueTypos[match[1]].push(m.line);
      }
    }
  });
});

console.log('=== ESLint Summary ===');
console.log('Total findings: ' + total);
console.log('');
console.log('By rule:');
Object.entries(byRule).sort(function(a,b){return b[1]-a[1];}).forEach(function(e){
  console.log('  ' + String(e[1]).padStart(6) + '  ' + e[0]);
});

var typoList = Object.entries(trueTypos).sort(function(a,b){return b[1].length-a[1].length;});
console.log('');
console.log('Truly undefined identifiers (after grep cross-check): ' + typoList.length);
typoList.slice(0, 40).forEach(function(e){
  console.log('  ' + String(e[1].length).padStart(4) + '  ' + e[0] + '  (first @ L' + e[1][0] + ')');
});
