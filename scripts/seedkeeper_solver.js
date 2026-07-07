// Seedkeeper engine harness: extracts the REAL engine from the HTML, unit-tests
// mechanics, renders ASCII, and BFS-solves levels to produce guaranteed solutions.
'use strict';
const fs = require('fs'), vm = require('vm');
const HTML = process.argv[2] || 'satellites/seedkeeper/index.html';
const html = fs.readFileSync(HTML, 'utf8');
const eng = html.slice(html.indexOf('/* ENGINE_START */'), html.indexOf('/* ENGINE_END */'));
// extract LEVELS array + the post-fixups
let ls = html.indexOf('var LEVELS=[');
let le = html.indexOf('LEVELS[0].need=3;', ls);
if (le < 0) le = html.indexOf('/* fix up', ls); // fallback
let levelsSrc = html.slice(ls, html.indexOf(';', le) + 1);
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(eng + '\n' + levelsSrc + '\nthis.API={T,CH2T,DIRS,SK_parse,SK_turn,SK_clone,SK_moveKeeper,SK_stepMonsters,SK_idx,LEVELS};', ctx);
const { T, SK_parse, SK_turn, SK_clone, LEVELS } = ctx.API;
const T2CH = {}; for (const k in T) T2CH[T[k]] = k;

function ascii(st) {
  const lines = [];
  for (let y = 0; y < st.h; y++) {
    let row = '';
    for (let x = 0; x < st.w; x++) {
      const idx = y * st.w + x; let ch;
      if (st.keeper.x === x && st.keeper.y === y) ch = '@';
      else {
        let mon = null; for (const m of st.monsters) if (m.alive && m.x === x && m.y === y) mon = m;
        let blk = false; for (const b of st.blocks) if (b.x === x && b.y === y) blk = true;
        if (mon) ch = String(mon.type);
        else if (blk) ch = 'B';
        else if (st.bombs[x + ',' + y]) ch = '*';
        else if (st.items[x + ',' + y]) { const it = st.items[x + ',' + y]; ch = it.k === 'seed' ? 'o' : it.k === 'key' ? it.c.toUpperCase() : 'b'; }
        else { const t = st.terr[idx]; ch = { 0: '.', 1: '#', 2: '~', 3: '^', 4: 'i', 5: 'd', 6: ',', 7: 'X', 8: 'S', 9: '?', 10: 'T', 11: 't', 12: '+', 13: '@', 14: '<', 15: '>', 16: 'A', 17: 'V', 18: 'R', 19: 'G', 20: 'B', 21: 'Y' }[t] || ' '; }
      }
      row += ch;
    }
    lines.push(row);
  }
  return lines.join('\n');
}

function stateKey(st) {
  let s = st.keeper.x + ',' + st.keeper.y + '|' + st.inv.seeds + '|' + st.inv.keys.r + st.inv.keys.g + st.inv.keys.b + st.inv.keys.y +
    '|' + (st.inv.boots.water ? 1 : 0) + (st.inv.boots.fire ? 1 : 0) + (st.inv.boots.ice ? 1 : 0) + (st.inv.boots.force ? 1 : 0);
  s += '|' + st.blocks.map(b => b.x + ',' + b.y).sort().join(';');
  s += '|' + st.terr.join('');
  s += '|' + Object.keys(st.items).sort().join(';');
  s += '|' + st.monsters.map(m => m.alive ? m.x + ',' + m.y + ',' + m.dir : 'x').join(';');
  s += '|' + Object.keys(st.bombs).sort().join(';');
  return s;
}

// BFS solver
function solve(levelIdx, cap) { return solveDef(LEVELS[levelIdx], cap); }
function solveDef(def, cap) {
  cap = cap || 500000;
  const start = SK_parse(def);
  if (start.won) return { moves: 0, sol: '' };
  const q = [start]; let head = 0;
  const seen = new Set([stateKey(start)]);
  const prev = new Map(); prev.set(stateKey(start), null);
  const MCH = ['U', 'R', 'D', 'L'];
  let count = 1;
  while (head < q.length) {
    if (count > cap) return { moves: -1, capped: true, states: count };
    const cur = q[head++]; const curKey = stateKey(cur);
    for (let d = 0; d < 4; d++) {
      const ns = SK_clone(cur);
      const r = SK_turn(ns, d);
      if (!r.moved) continue;
      if (ns.dead) continue;
      const key = stateKey(ns);
      if (seen.has(key)) continue;
      seen.add(key); count++;
      prev.set(key, { pk: curKey, mv: MCH[d] });
      if (ns.won) {
        let path = [], k = key;
        while (prev.get(k)) { path.unshift(prev.get(k).mv); k = prev.get(k).pk; }
        return { moves: path.length, sol: path.join(''), states: count };
      }
      q.push(ns);
    }
  }
  return { moves: -1, states: count };
}

if (require.main === module) {
  const cmd = process.argv[3];
  if (cmd === 'view') { const st = SK_parse(LEVELS[+process.argv[4]]); console.log(ascii(st)); console.log('need', st.need, 'seeds', st.seedTotal); }
  else if (cmd === 'solve') { const i = +process.argv[4]; const r = solve(i, +(process.argv[5] || 500000)); console.log('L' + i, LEVELS[i].name, '→', r.moves < 0 ? (r.capped ? 'CAPPED@' + r.states : 'UNSOLVABLE@' + r.states) : (r.moves + ' moves: ' + r.sol)); }
  else { // solve all
    for (let i = 0; i < LEVELS.length; i++) { const r = solve(i); console.log('L' + i + ' ' + (LEVELS[i].name + '').padEnd(18) + (r.moves < 0 ? (r.capped ? 'CAPPED (' + r.states + ')' : 'UNSOLVABLE (' + r.states + ')') : r.moves + ' moves  ' + r.sol)); }
  }
}
module.exports = { solve, solveDef, ascii, SK_parse, SK_turn, SK_clone, LEVELS, T };
