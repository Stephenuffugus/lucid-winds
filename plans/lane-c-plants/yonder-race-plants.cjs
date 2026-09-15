/* Plants for THE RACE: `lint` plants run tools/lint.mjs on a folder copy (quick); `G1`..`G3` groups run test/race.mjs
   on a folder copy. Every edit asserts its match first and is written before the next. Usage: node yonder-race-plants.cjs lint|G1|G2|G3 */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const LINT = [
  ['l10 an auto move on a timer', 'race.js', "    sound('flip');\n", "    sound('flip');\n    setTimeout(() => { step(pos + 1); }, 600);\n"],
  ['l11 a hold that steps', 'race.js', "  function reset() {", "  const hold = () => { step(pos + 1); };\n  function reset() {"],
  ['l12 a step on the animation clock', 'race.js', "  window.addEventListener('resize', () => { place(); });", "  window.addEventListener('resize', () => { place(); });\n  requestAnimationFrame(() => {});"]
];
const GROUPS = {
  G1: [
    ['r01 the track wraps', 'index.html', '#track { display: flex; flex-wrap: nowrap;', '#track { display: flex; flex-wrap: wrap;'],
    ['r02 a card turns over an unwalked count', 'race.js', "    if (remaining > 0 || pos >= SQUARES) return false;", "    if (pos >= SQUARES) return false;"]
  ],
  G2: [
    ['r03 a tap moves two squares', 'race.js', "    pos = n;\n    remaining = pos >= SQUARES ? 0 : remaining - 1;", "    pos = Math.min(SQUARES, n + (remaining > 1 ? 1 : 0));\n    remaining = pos >= SQUARES ? 0 : Math.max(0, remaining - (pos - n + 1));"],
    ['r04 a numeral not named', 'race.js', "    speak(n);\n", "    if (n % 2) speak(n);\n"],
    /* ⛔ the first r05 and r07 put their rule at the START of the real rule, whose own later declarations overrode them:
       nothing was planted and the gate stayed green on those two. Both now add a rule after every other. */
    ['r05 a round card', 'index.html', '</style>', '  #card { border-radius: 50%; }\n</style>']
  ],
  G3: [
    ['r06 a deal not the engine\'s', 'race.js', "const m = moves[dealt++ % DECK];", "const m = moves[(dealt++ + 1) % DECK];"],
    ['r07 small squares', 'index.html', '</style>', '  #track .square { width: 40px; min-width: 40px; height: 40px; min-height: 40px; }\n</style>'],
    ['r08 two squares ahead accepted', 'race.js', "    if (remaining <= 0 || n !== pos + 1 || n > SQUARES) return false;", "    if (remaining <= 0 || n > pos + 2 || n <= pos || n > SQUARES) return false;"]
  ],
  G4: [
    ['r05 a round card', 'index.html', '</style>', '  #card { border-radius: 50%; }\n</style>'],
    ['r07 small squares', 'race.js', "    sq.textContent = String(n);", "    sq.textContent = String(n);\n    sq.style.cssText = 'width:40px;min-width:40px;height:40px;min-height:40px';"]
  ]
};
const which = process.argv[2];
const plants = which === 'lint' ? LINT.map(p => [p]) : [GROUPS[which]];
for (const group of plants) {
  const dir = path.join(SP, 'rplant-' + which);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'yonder'), dir]);
  /* the lint imports the fleet's dupkeys from three folders up; put a copy there */
  if (which === 'lint') { fs.mkdirSync(path.join(dir, '..', 'tools'), { recursive: true }); fs.copyFileSync('/workspaces/lucid-winds/tools/dupkeys.mjs', path.join(dir, '..', 'tools', 'dupkeys.mjs')); }
  for (const [name, file, from, to] of group) {
    const p = path.join(dir, 'yonder', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
    fs.writeFileSync(p, src.replace(from, () => to));
    console.log('planted ' + name);
  }
  const cmd = which === 'lint' ? 'tools/lint.mjs' : 'test/race.mjs';
  const r = spawnSync('node', [path.join(dir, 'yonder', cmd)], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  console.log(((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.slice(0, 240)).join('\n'));
  fs.rmSync(dir, { recursive: true, force: true });
}
