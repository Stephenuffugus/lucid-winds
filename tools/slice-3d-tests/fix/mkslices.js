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
const i20 = s.indexOf('/* ---- 20. Part E3'), e19 = i20 >= 0 ? i20 : iEnd, i21 = s.indexOf('/* ---- 21. Part E4'), e20 = i21 >= 0 ? i21 : iEnd;
fs.writeFileSync(D + 'row19.mjs', head + helpers + s.slice(i19, e19) + foot);   /* Part E2 (and the paint check after it) */
if (i20 >= 0) fs.writeFileSync(D + 'row20.mjs', head + helpers + s.slice(i20, e20) + foot);   /* Part E3, the Daily */
if (i21 >= 0) { const e21 = s.indexOf('/* ---- 23. Part F3'); fs.writeFileSync(D + 'row21.mjs', head + helpers + s.slice(i21, e21 >= 0 ? e21 : iEnd) + foot); }   /* Part E4, the bosses */
const i8 = s.indexOf("console.log('\\n[8]"), i9 = s.indexOf('/* ---- 9.');
if (i8 >= 0 && i9 > i8) fs.writeFileSync(D + 'row8.mjs', head + helpers + s.slice(i8, i9) + foot);   /* the title layout */
const i10 = s.indexOf('/* ---- 10. SS21'), i11 = s.indexOf('/* ---- 11. SS21/SS20');
if (i10 >= 0 && i11 > i10) fs.writeFileSync(D + 'row10.mjs', head + helpers + s.slice(i10, i11) + foot);   /* Endless: no floor, the ring, the ramp (24 Oct) */
const i23 = s.indexOf('/* ---- 23. Part F3'); if (i23 >= 0) fs.writeFileSync(D + 'row23.mjs', head + helpers + s.slice(i23, s.indexOf('/* ---- 24. Part F4') >= 0 ? s.indexOf('/* ---- 24. Part F4') : s.indexOf('/* ---- 22. Part F2')) + foot);   /* Part F3, the boss lob and pay */
const i24 = s.indexOf('/* ---- 24. Part F4'); if (i24 >= 0) fs.writeFileSync(D + 'row24.mjs', head + helpers + s.slice(i24, s.indexOf('/* ---- 22. Part F2')) + foot);   /* Part F4, Slivers and prices */
const i16 = s.indexOf('/* ---- 16. Part C'), e16 = s.indexOf('/* ---- 17'); if (i16 >= 0 && e16 > i16) fs.writeFileSync(D + 'row16.mjs', head + helpers + s.slice(i16, e16) + foot);   /* Part C: the shelf and its prices */
const i22 = s.indexOf('/* ---- 22. Part F2');
if (i22 >= 0) fs.writeFileSync(D + 'row22.mjs', head + helpers + s.slice(i22, iEnd) + foot);   /* Part F2, the knife over the ground */
const i2 = s.indexOf('/* ---- 2. the core loop'); if (i2 < 0) throw new Error('row 2 marker');
fs.writeFileSync(D + 'row1.mjs', head + s.slice(i1, i2) + foot);   /* the corrupt save boots (Part E1 added two) */
console.log('slices written');
