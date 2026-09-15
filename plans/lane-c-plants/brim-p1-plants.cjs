/* Plants for BRIM's MATCHING gate: a folder copy of satellites/{math,crease,brim} (from PLANT_SAT, the frozen copy MATCHING
   passed on) per plant, its edits asserted exactly once, test/matching.mjs run in the copy, its FAIL lines printed.
   Usage: node brim-p1-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['m1 water before the choice', [['render.js', "  v.water.style.height = '0px';\n  v.water.style.visibility = 'hidden';", "  v.water.style.height = '8px';\n  v.water.style.visibility = 'visible';"]]],
  ['m2 a hover that fills', [['main.js', "el('left').addEventListener('click', () => choose('left'));", "el('left').addEventListener('click', () => choose('left'));\nel('left').addEventListener('pointerover', () => fillTo(vessels.left, value(pair.left), 1));"]]],
  ['m3 two glasses not alike', [['index.html', '  #right .water { background: #9c7d95; }', '  #right .water { background: #9c7d95; }\n  #right .glass { width: 100px; }']]],
  ['m4 the other glass first', [['main.js', "    fillTo(vessels[result.side], value(pair[result.side]), Math.min(1, p / 0.5));\n    fillTo(vessels[other], value(pair[other]), Math.max(0, Math.min(1, (p - 0.5) / 0.5)));", "    fillTo(vessels[other], value(pair[other]), Math.min(1, p / 0.5));\n    fillTo(vessels[result.side], value(pair[result.side]), Math.max(0, Math.min(1, (p - 0.5) / 0.5)));"]]],
  ['m5 a level that never settles', [['render.js', '  if (p >= 1) return value;', '  if (p >= 1) return Math.min(1, value * 1.04);']]],
  ['m6 a verdict in the caption', [['content.js', "  return equal ? t(larger) + ' ' + COPY.same + ' ' + t(smaller) : t(larger) + ' ' + COPY.more + ' ' + t(smaller);", "  return 'Right, ' + (equal ? t(larger) + ' ' + COPY.same + ' ' + t(smaller) : t(larger) + ' ' + COPY.more + ' ' + t(smaller));"]]],
  ['m7 wrong rounds fill slower', [['main.js', "  const ms = reduced() ? 0 : REVEAL, other = result.side === 'left' ? 'right' : 'left';", "  const ms = reduced() ? 0 : (result.correct ? REVEAL : REVEAL * 1.6), other = result.side === 'left' ? 'right' : 'left';"]]],
  ['m8 less motion still animates', [['main.js', "  const ms = reduced() ? 0 : REVEAL, other = result.side === 'left' ? 'right' : 'left';", "  const ms = REVEAL, other = result.side === 'left' ? 'right' : 'left';"]]],
  ['m9 a seed off by one', [['main.js', 'const r = rng(CONFIG.seed >>> 0);', 'const r = rng((CONFIG.seed + 1) >>> 0);']]],
  ['m10 the other side scored', [['main.js', '  const s = scoreChoice(pair, side);', "  const s = scoreChoice(pair, side === 'left' ? 'right' : 'left');"]]],
  ['m11 next too short', [['index.html', '  #next { min-width: 64px; min-height: 56px; }', '  #next { min-width: 30px; min-height: 30px; width: 30px; height: 30px; padding: 0; }']]],
  ['m12 no focus back on a glass', [['main.js', '  startRound();\n  if (byKey) vessels.left.button.focus();\n}', '  startRound();\n}']]]
];
const only = process.argv[2];
for (const [name, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'brimp1plant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const g of ['math', 'crease', 'brim']) execFileSync('cp', ['-r', path.join(SAT, g), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'brim', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) { console.log(name.padEnd(34) + 'NOT PLANTED: the match is not exactly once in ' + file); planted = false; break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = spawnSync('node', [path.join(dir, 'brim', 'test', 'matching.mjs')], { encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 210));
  console.log(name.padEnd(34) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)') + (r.signal ? ' [killed ' + r.signal + ']' : ''));
  fs.rmSync(dir, { recursive: true, force: true });
}
