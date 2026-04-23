// Verify every level in games/rootrush.js solves in its declared optimal count.

'use strict';

const fs = require('fs');
const { solve, validate } = require('./rootrush_solver.js');

const src = fs.readFileSync('games/rootrush.js', 'utf8');
// Extract the LEVELS array as a JS literal. Quick-and-dirty: find "var LEVELS=[" and balance brackets.
const start = src.indexOf('var LEVELS=[');
if (start < 0) { console.error('LEVELS not found'); process.exit(1); }
let depth = 0, i = src.indexOf('[', start);
const arrStart = i;
for (; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; if (depth === 0) break; }
}
const literal = src.slice(arrStart, i + 1);
// eslint-disable-next-line no-eval
const LEVELS = eval(literal);

let ok = 0, bad = 0;
for (const L of LEVELS) {
  const err = validate(L.grid);
  if (err) { console.log(`❌ ${L.name}: invalid — ${err}`); bad++; continue; }
  const { depth } = solve(L.grid, Math.max(30, L.optimal + 5));
  if (depth < 0) { console.log(`❌ ${L.name}: unsolvable`); bad++; continue; }
  if (depth !== L.optimal) {
    console.log(`⚠ ${L.name}: declared ${L.optimal}, actual ${depth}`);
    bad++;
  } else {
    ok++;
  }
}
console.log(`\n${ok}/${LEVELS.length} levels verified. ${bad} issues.`);
