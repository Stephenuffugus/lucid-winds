#!/usr/bin/env node
/* Bubblenaut map validator — run after ANY change to the L array.
 *
 * Physics-derived laws (GRAV=1500, JUMP=-620, WALK=210, TILE=36):
 *   max rise  = 620^2/(2*1500)/36 ≈ 3.5 tiles → a climb step may rise ≤3
 *   max jump  ≈ 4.8 tiles across              → a hop may cross ≤4 columns
 * Structure laws: 19 rows × 15 cols, solid ceiling, solid side walls,
 * bottom row solid or wrap gaps, exactly one P and one Q, ≥2 critters.
 * Reachability: BFS over standable cells from P using walk/jump/drop/wrap;
 * every critter's landing spot must be reachable and ≥90% of all standable
 * cells must be reachable (pockets the player cannot enter are dead design).
 * Diversity: every map must be unique, and the report prints per-map
 * asymmetry + solid/platform mix so "all the same room" shows up as numbers.
 */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/var L=\[([\s\S]*?)\n\];/);
if (!m) { console.log('FAIL could not find var L'); process.exit(1); }
// strip comments, then pull the quoted rows per map
const body = m[1].replace(/\/\*[\s\S]*?\*\//g, '');
const maps = [];
body.split(/\],/).forEach(chunk => {
  const rows = [...chunk.matchAll(/"([^"]*)"/g)].map(x => x[1]);
  if (rows.length) maps.push(rows);
});

let fails = 0;
function bad(mi, msg) { console.log('FAIL map ' + (mi + 1) + ' (' + name(mi) + '): ' + msg); fails++; }
function name(mi) { return 'w' + (Math.floor(mi / 5) + 1) + 'r' + (mi % 5 + 1); }

if (maps.length !== 25) { console.log('FAIL expected 25 maps, found ' + maps.length); process.exit(1); }

const report = [];
maps.forEach((map, mi) => {
  // structure
  if (map.length !== 19) return bad(mi, 'rows=' + map.length);
  map.forEach((row, r) => {
    if (row.length !== 15) bad(mi, 'row ' + r + ' len=' + row.length);
    if (/[^#=.PQe]/.test(row)) bad(mi, 'row ' + r + ' bad char');
  });
  if (map[0] !== '###############') bad(mi, 'ceiling not solid');
  for (let r = 1; r < 18; r++) {
    if (map[r][0] !== '#' || map[r][14] !== '#') bad(mi, 'side wall open at row ' + r);
  }
  if (/[^#.]/.test(map[18])) bad(mi, 'bottom row has non-#/. chars');
  const gaps = [];
  for (let c = 0; c < 15; c++) if (map[18][c] === '.') gaps.push(c);

  const P = [], Q = [], E = [];
  const g = map.map(row => row.split(''));
  for (let r = 0; r < 19; r++) for (let c = 0; c < 15; c++) {
    const ch = g[r][c];
    if (ch === 'P') { P.push([c, r]); g[r][c] = '.'; }
    if (ch === 'Q') { Q.push([c, r]); g[r][c] = '.'; }
    if (ch === 'e') { E.push([c, r]); g[r][c] = '.'; }
  }
  if (P.length !== 1) bad(mi, 'P count=' + P.length);
  if (Q.length !== 1) bad(mi, 'Q count=' + Q.length);
  if (E.length < 2) bad(mi, 'only ' + E.length + ' critters');

  const at = (c, r) => (c < 0 || c > 14) ? '#' : (r < 0 || r > 18) ? '.' : g[r][c];
  const standable = (c, r) => {
    if (r < 0 || r > 17 || at(c, r) !== '.') return false;
    if (r === 17) return at(c, 18) === '#';
    return at(c, r + 1) === '#' || at(c, r + 1) === '=';
  };
  const firstStandBelow = (c, r) => { for (let rr = Math.max(r, 0); rr <= 17; rr++) if (standable(c, rr)) return rr; return -1; };

  // BFS from P's landing cell
  const seen = new Set();
  const key = (c, r) => c + ',' + r;
  const start = [P[0][0], firstStandBelow(P[0][0], P[0][1])];
  const queue = [start];
  if (start[1] < 0) bad(mi, 'P has no landing');
  while (queue.length) {
    const [c, r] = queue.shift();
    if (r < 0 || seen.has(key(c, r))) continue;
    seen.add(key(c, r));
    const push = (c2, r2) => { if (r2 >= 0 && standable(c2, r2) && !seen.has(key(c2, r2))) queue.push([c2, r2]); };
    // walk + hop across (≤4 cols same row)
    for (let d = -4; d <= 4; d++) if (d) push(c + d, r);
    // jump up to 3 rows, within 3 cols
    for (let up = 1; up <= 3; up++) for (let d = -3; d <= 3; d++) push(c + d, r - up);
    // drop: step off the edge, land on the first standable below (±1 col)
    for (let d = -1; d <= 1; d++) {
      const rr = firstStandBelow(c + d, r + 1);
      if (rr >= 0) push(c + d, rr);
    }
    // wrap: standing next to a bottom gap column lets you fall out and
    // re-enter from the ceiling, drifting up to 4 columns on the way down
    if (gaps.length && r >= 15) {
      for (const gc of gaps) if (Math.abs(gc - c) <= 1) {
        for (let d = -4; d <= 4; d++) {
          const rr = firstStandBelow(gc + d, 0);
          if (rr >= 0) push(gc + d, rr);
        }
      }
    }
  }

  let standTotal = 0, standReach = 0;
  for (let r = 0; r <= 17; r++) for (let c = 1; c <= 13; c++) {
    if (standable(c, r)) { standTotal++; if (seen.has(key(c, r))) standReach++; }
  }
  const pct = standTotal ? (100 * standReach / standTotal) : 0;
  if (pct < 90) bad(mi, 'reachability ' + pct.toFixed(0) + '% (' + standReach + '/' + standTotal + ')');
  E.forEach(([c, r], i) => {
    const rr = firstStandBelow(c, r);
    if (rr < 0) {
      // falls clean through a wrap gap: legal, it re-enters from the top
      if (!(gaps.length && gaps.some(gc => Math.abs(gc - c) <= 0))) bad(mi, 'critter ' + (i + 1) + ' at ' + c + ',' + r + ' has no landing');
    } else if (!seen.has(key(c, rr))) bad(mi, 'critter ' + (i + 1) + ' lands unreachable at ' + c + ',' + rr);
  });

  // diversity numbers
  let solids = 0, plats = 0, asym = 0;
  for (let r = 1; r <= 17; r++) for (let c = 1; c <= 13; c++) {
    if (g[r][c] === '#') solids++;
    if (g[r][c] === '=') plats++;
    if (g[r][c] !== g[r][14 - c]) asym++;
  }
  report.push({ n: name(mi), e: E.length, solids, plats, asym, gaps: gaps.length, reach: pct.toFixed(0), sig: map.join('') });
});

// uniqueness
const sigs = new Set();
report.forEach((r, i) => { if (sigs.has(r.sig)) bad(i, 'DUPLICATE of an earlier map'); sigs.add(r.sig); });

console.log('map   critters solids plats asym wrapcols reach%');
report.forEach(r => console.log(
  r.n.padEnd(6) + String(r.e).padEnd(9) + String(r.solids).padEnd(7) + String(r.plats).padEnd(6) +
  String(r.asym).padEnd(5) + String(r.gaps).padEnd(9) + r.reach));
const asymCount = report.filter(r => r.asym > 0).length;
console.log('\nasymmetric rooms: ' + asymCount + '/25 · distinct maps: ' + sigs.size + '/25');
console.log(fails ? ('\n' + fails + ' FAILURES') : '\nALL MAPS VALID');
process.exit(fails ? 1 : 0);
