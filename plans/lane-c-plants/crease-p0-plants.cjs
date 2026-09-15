/* Plants for CREASE's P0 laws: each plant is a folder copy of satellites/math and satellites/crease with one fault written
   (its match asserted first), then the named gate run in the copy and its FAIL lines printed.
   Usage: node crease-p0-plants.cjs [bank|engine|lint] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = {
  bank: [
    ['b1 a grade 4 denominator called grade 3', 'bank.js', "const gradeOfDenominator = d => GRADE_DENOMINATORS[3].includes(d) ? 3", "const gradeOfDenominator = d => GRADE_DENOMINATORS[3].includes(d) || d === 5 ? 3"],
    ['b2 a tag renamed', 'bank.js', "export const TAGS = Object.freeze(['unit-inversion',", "export const TAGS = Object.freeze(['unit-fraction-inversion',"],
    ['b3 a seed item dropped', 'bank.js', "  item('benchmark-half', '7/15'),\n", ""],
    ['b4 a tag with no grade 3 item', 'bank.js', "  item('benchmark-half', '3/8'),\n  item('benchmark-half', '5/8'),\n", ""],
    ['b5 an item that is not near a half', 'bank.js', "  item('benchmark-half', '4/9'),", "  item('benchmark-half', '4/9'),\n  item('benchmark-half', '1/8'),"]
  ],
  engine: [
    ['e1 grade 3 served tenths', 'engine.js', "const ds = GRADE_DENOMINATORS[state.grade].filter(d => d !== 100);", "const ds = GRADE_DENOMINATORS[4].filter(d => d !== 100);"],
    ['e2 repeats let through', 'engine.js', "    if (!recent.includes(key(n, d))) return { n, d, trap: null };", "    return { n, d, trap: null };"],
    ['e3 a whole that cannot hold it', 'engine.js', "    const fits = WHOLES.filter(w => w >= value);", "    const fits = WHOLES.slice();"],
    ['e4 no back mix to 1', 'engine.js', "  const mustBeOne = state.sinceOne >= RECENT;", "  const mustBeOne = false;"],
    ['e5 error not over the whole', 'engine.js', "  const pae = Math.abs(placement - value) / task.whole;", "  const pae = Math.abs(placement - value);"],
    ['e6 the stack on the second', 'engine.js', "if (chainStep === 3) task.stackReveal = true;", "if (chainStep === 2) task.stackReveal = true;"],
    ['e7 a looser first band', 'engine.js', "export const TOLERANCE = Object.freeze([0.10, 0.07,", "export const TOLERANCE = Object.freeze([0.12, 0.07,"],
    ['e8 an unseeded strip', 'engine.js', "    strip: lineGeometry(r)", "    strip: lineGeometry(Math.random)"]
  ],
  lint: [
    ['l1 Date in the bank', 'bank.js', "export const TAGS", "const MADE = Date.now();\nexport const TAGS"],
    ['l2 an unstamped import', 'engine.js', "import { FRACTION_BANK, GRADE_DENOMINATORS } from './bank.js?v=20260915a';", "import { FRACTION_BANK, GRADE_DENOMINATORS } from './bank.js';"],
    /* ⛔ the first l3 put both keys on one line, and tools/dupkeys.mjs reports a duplicate only across lines (its header
       says so): the plant planted nothing the law was built to see. Now two lines, the case the tool exists for. */
    ['l3 a key twice', 'bank.js', "export const GRADE_DENOMINATORS = Object.freeze({\n  3: Object.freeze([2, 3, 4, 6, 8]),", "export const GRADE_DENOMINATORS = Object.freeze({\n  3: Object.freeze([2, 3, 4, 6, 8]),\n  3: Object.freeze([2, 3, 4]),"]
  ]
};
const which = process.argv[2] || 'bank';
for (const [name, file, from, to] of PLANTS[which]) {
  const dir = path.join(SP, 'cplant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'sat'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'tools'), { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'crease'), path.join(dir, 'sat')]);
  fs.copyFileSync('/workspaces/lucid-winds/tools/dupkeys.mjs', path.join(dir, 'tools', 'dupkeys.mjs'));
  const p = path.join(dir, 'sat', 'crease', file), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
  fs.writeFileSync(p, src.replace(from, () => to));
  const gate = which === 'lint' ? 'tools/lint.mjs' : 'test/' + which + '.mjs';
  const r = spawnSync('node', [path.join(dir, 'sat', 'crease', gate)], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 600000 });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error/.test(l)).map(l => l.trim().slice(0, 200));
  console.log(name.padEnd(40) + (lines.length ? lines.join(' | ') : 'NOTHING (the plant was not seen)'));
}
fs.rmSync(path.join(SP, 'cplant'), { recursive: true, force: true });
