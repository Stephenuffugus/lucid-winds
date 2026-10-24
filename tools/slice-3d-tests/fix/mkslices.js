// Builds the row 17, late art.json and row 18 slices from the suite, with PAGE (a page path) settable for the fail-watch
const fs = require('fs'), D = __dirname + '/';
const s = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs', 'utf8');
const i1 = s.indexOf('/* ---- 1. corrupt save');
const i17 = s.lastIndexOf('/*', s.indexOf("console.log('\\n[17]"));
const iLate = s.indexOf('/* SS08 with a late art.json');
const iEnd = s.indexOf("console.log('\\n=== slice-3d");
const i18 = s.indexOf('/* ---- 18. Part E1');
const ib = s.indexOf('async function bootAt'), ibe = s.indexOf('async function clickCentre'), ice = s.indexOf('\n}\n', ibe) + 3;
if ([i1, i17, iLate, iEnd, ib, i18].some(v => v < 0)) throw new Error('markers');
let head = s.slice(0, i1).replace("const URL = BASE + '/satellites/slice-3d/?dev=1';", "const URL = BASE + (process.env.PAGE || '/satellites/slice-3d/') + '?dev=1';");
if (head.indexOf('process.env.PAGE') < 0) throw new Error('URL line');
const helpers = s.slice(ib, ice) + '\n', foot = s.slice(iEnd);
fs.writeFileSync(D + 'row17.mjs', head + helpers + s.slice(i17, iLate) + foot);
fs.writeFileSync(D + 'late.mjs', head + helpers + s.slice(iLate, i18) + foot);
const i19 = s.indexOf('/* ---- 19. Part E2'); if (i19 < 0) throw new Error('row 19 marker');
fs.writeFileSync(D + 'row18.mjs', head + helpers + s.slice(i18, i19) + foot);   /* Part E1 (and the reload check after it) */
const i20 = s.indexOf('/* ---- 20. Part E3'), e19 = i20 >= 0 ? i20 : iEnd;
fs.writeFileSync(D + 'row19.mjs', head + helpers + s.slice(i19, e19) + foot);   /* Part E2 (and the paint check after it) */
if (i20 >= 0) fs.writeFileSync(D + 'row20.mjs', head + helpers + s.slice(i20, iEnd) + foot);   /* Part E3, the Daily */
const i8 = s.indexOf("console.log('\\n[8]"), i9 = s.indexOf('/* ---- 9.');
if (i8 >= 0 && i9 > i8) fs.writeFileSync(D + 'row8.mjs', head + helpers + s.slice(i8, i9) + foot);   /* the title layout */
const i2 = s.indexOf('/* ---- 2. the core loop'); if (i2 < 0) throw new Error('row 2 marker');
fs.writeFileSync(D + 'row1.mjs', head + s.slice(i1, i2) + foot);   /* the corrupt save boots (Part E1 added two) */
console.log('slices written');
