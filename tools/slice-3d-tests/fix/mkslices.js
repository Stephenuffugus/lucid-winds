// Builds the row 17 slice and the late art.json slice from the suite, with PAGE (a page path) settable for the fail-watch
const fs = require('fs'), D = __dirname + '/';
const s = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs', 'utf8');
const i1 = s.indexOf('/* ---- 1. corrupt save');
const i17 = s.lastIndexOf('/*', s.indexOf("console.log('\\n[17]"));
const iLate = s.indexOf('/* SS08 with a late art.json');
const iEnd = s.indexOf("console.log('\\n=== slice-3d");
const ib = s.indexOf('async function bootAt'), ibe = s.indexOf('async function clickCentre'), ice = s.indexOf('\n}\n', ibe) + 3;
if ([i1, i17, iLate, iEnd, ib].some(v => v < 0)) throw new Error('markers');
let head = s.slice(0, i1).replace("const URL = BASE + '/satellites/slice-3d/?dev=1';", "const URL = BASE + (process.env.PAGE || '/satellites/slice-3d/') + '?dev=1';");
if (head.indexOf('process.env.PAGE') < 0) throw new Error('URL line');
const helpers = s.slice(ib, ice) + '\n', foot = s.slice(iEnd);
fs.writeFileSync(D + 'row17.mjs', head + helpers + s.slice(i17, iLate) + foot);
fs.writeFileSync(D + 'late.mjs', head + helpers + s.slice(iLate, iEnd) + foot);
console.log('slices written');
