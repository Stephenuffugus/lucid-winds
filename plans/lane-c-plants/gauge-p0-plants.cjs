/* Plants for GAUGE's P0 laws: a folder copy per plant (satellites/math, satellites/gauge, tools/), each edit asserted to match
   exactly once, then the named gate run in the copy and its FAIL lines printed. Usage: node gauge-p0-plants.cjs [prefix] */
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const REPO = '/workspaces/lucid-winds', SP = __dirname;
const D = 'gauge/decimal.js', E = 'gauge/engine.js', C = 'gauge/content.js';
const PLANTS = [
  ['d1 places trimmed on parse', 'test/decimal.mjs', [[D, "return { whole: BigInt(m[1]), places: m[2] || '' };", "return { whole: BigInt(m[1]), places: (m[2] || '').replace(/0+$/, '') };"]]],
  ['d2 a leading point accepted', 'test/decimal.mjs', [[D, 'const PATTERN = /^(0|[1-9][0-9]*)(?:\\.([0-9]+))?$/;', 'const PATTERN = /^(0|[1-9][0-9]*)?(?:\\.([0-9]+))?$/;'], [D, "return { whole: BigInt(m[1]), places: m[2] || '' };", "return { whole: BigInt(m[1] || '0'), places: m[2] || '' };"]]],
  ['d3 compare by length first', 'test/decimal.mjs', [[D, 'const n = Math.max(parse(a).places.length, parse(b).places.length), x = scaled(a, n), y = scaled(b, n);\n  return x > y ? 1 : x < y ? -1 : 0;', 'const pa = parse(a), pb = parse(b);\n  if (pa.whole !== pb.whole) return pa.whole > pb.whole ? 1 : -1;\n  const x = BigInt(pa.places || \'0\'), y = BigInt(pb.places || \'0\');\n  return x > y ? 1 : x < y ? -1 : 0;']]],
  ['d4 add through floats', 'test/decimal.mjs', [[D, 'export function add(a, b) {\n  const n = Math.max(parse(a).places.length, parse(b).places.length);\n  return format(scaled(a, n) + scaled(b, n), n);\n}', 'export function add(a, b) {\n  parse(a); parse(b);\n  return String(parseFloat(a) + parseFloat(b));\n}']]],
  ['d5 a rational trimmed', 'test/decimal.mjs', [[D, "return { num: p.whole * pow10(n) + BigInt(p.places || '0'), den: pow10(n) };", "const t = p.places.replace(/0+$/, ''), m = t.length;\n  return { num: p.whole * pow10(m) + BigInt(t || '0'), den: pow10(m) };"]]],
  ['d6 same digits by value', 'test/decimal.mjs', [[D, '  return parse(a) && parse(b) && a === b;', '  return compare(a, b) === 0;']]],
  ['e1 L reads lengths not whole numbers', 'test/engine.mjs', [[E, "    const c = bigCmp(BigInt(a.places || '0'), BigInt(b.places || '0'));\n    if (c) return side(c);\n    return side(a.places.length - b.places.length);", "    if (a.places.length !== b.places.length) return side(a.places.length - b.places.length);\n    return side(bigCmp(BigInt(a.places || '0'), BigInt(b.places || '0')));"]]],
  ['e2 Z only in the tenths', 'test/engine.mjs', [[E, "const za = a.places.indexOf('0') >= 0, zb = b.places.indexOf('0') >= 0;", "const za = a.places[0] === '0', zb = b.places[0] === '0';"]]],
  ['e3 three L separators', 'test/engine.mjs', [[E, 'draw(r, POOLS.onlyL, 4)', 'draw(r, POOLS.onlyL, 3)'], [E, 'draw(r, POOLS.plain, 5)', 'draw(r, POOLS.plain, 6)']]],
  ['e4 no equal pairs', 'test/engine.mjs', [[E, 'draw(r, POOLS.equal, 2)', 'draw(r, POOLS.equal, 0)'], [E, 'draw(r, POOLS.plain, 5)', 'draw(r, POOLS.plain, 7)']]],
  ['e5 the first item shuffled away', 'test/engine.mjs', [[E, "return [Object.assign({}, FIRST)].concat(shuffle(r, body).map(x => sides(r, x)));", "return shuffle(r, [Object.assign({}, FIRST)].concat(body)).map(x => sides(r, x));"]]],
  /* ⛔ e6's first form removed only the A line, and the last line returns A anyway when two rules are above: it planted nothing */
  ['e6 A read as U', 'test/engine.mjs', [[E, "  if (c.above.indexOf('truth') >= 0 && c.above.length > 1) return 'A';\n", ''], [E, "  if (c.code) return c.code;\n  return 'A';", "  if (c.code) return c.code;\n  return 'U';"]]],
  ['e7 classified on accuracy', 'test/engine.mjs', [[E, '  const c = adaptClassify(responses, Object.assign({ rules: predict }, CLASSIFY));\n  if (!c.enough) return null;', "  const c = adaptClassify(responses, Object.assign({ rules: predict }, CLASSIFY));\n  if (!c.enough) return null;\n  if (responses.filter(x => x.answer === predict.truth(x.item)).length / responses.length >= 0.8) return 'U';"]]],
  ['e8 coded after six', 'test/engine.mjs', [[E, 'if (responses.length < CLASSIFY.minItems) return null;', 'if (responses.length < 6) return null;'], [E, "export const CLASSIFY = Object.freeze({ minItems: 12, minDiscriminating: 6, threshold: 0.8 });", "export const CLASSIFY = Object.freeze({ minItems: 6, minDiscriminating: 3, threshold: 0.8 });"]]],
  ['e9 nine divisions', 'test/engine.mjs', [[E, '  for (let i = 0; i < 10; i++) ticks.push(add(ticks[i], step));', '  for (let i = 0; i < 9; i++) ticks.push(add(ticks[i], step));']]],
  ['e10 S sent to zoom only', 'test/engine.mjs', [[E, "code === 'S' ? ['same', 'zoom']", "code === 'S' ? ['zoom']"]]],
  ['e11 an unseeded shuffle', 'test/engine.mjs', [[E, 'const j = Math.floor(r() * (i + 1));', 'const j = Math.floor(Math.random() * (i + 1));']]],
  ['z1 zoom one division off', 'test/engine.mjs', [[E, '    out.push({ from, places: p, index: digit });', '    out.push({ from, places: p, index: Math.min(9, digit + 1) });']]],
  ['z2 the thousandths never open', 'test/engine.mjs', [[E, '  for (; p <= places.length; p++) {', '  for (; p <= Math.min(2, places.length); p++) {']]],
  ['z3 five trailing and seven inner', 'test/engine.mjs', [[E, "pick(TRAILING, 'trailing', 'same').concat(pick(INNER, 'inner', 'different'))", "pick(TRAILING, 'trailing', 'same').slice(0, 5).concat(pick(INNER, 'inner', 'different').concat(pick(INNER, 'inner', 'different').slice(0, 1)))"]]],
  ['z4 a trailing pair the zero rule gets right', 'test/engine.mjs', [[E, "['3.60', '3.6'], ['0.9', '0.90'], ['4.1', '4.10']]);", "['3.60', '3.6'], ['0.08', '0.080'], ['0.06', '0.060'], ['0.04', '0.040'], ['0.02', '0.020'], ['0.01', '0.010'], ['0.03', '0.030']]);"]]],
  ['z5 scoreZoom on the last level only', 'test/engine.mjs', [[E, '  return { correct: path.length === want.length && path.every((x, i) => x === want[i].index) };', '  return { correct: path[path.length - 1] === want[want.length - 1].index };']]],
  ['l1 money in the copy', 'tools/lint.mjs', [[C, "go: 'Go on'", "go: 'Count your change'"]]],
  ['l2 a float on a decimal', 'tools/lint.mjs', [[E, "const side = c => (c > 0 ? 'left' : c < 0 ? 'right' : 'same');", "const side = c => (c > 0 ? 'left' : c < 0 ? 'right' : 'same');\nexport const asFloat = s => Number(s);"]]],
  ['l3 the point as hero', 'tools/lint.mjs', [[C, "startZoom: 'Zoom in'", "startZoom: 'Zoom past the decimal point'"]]],
  ['l4 an unstamped import', 'tools/lint.mjs', [[E, "'./decimal.js?v=20260916h'", "'./decimal.js'"]]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const Dir = path.join(SP, 'plant-gauge');
  fs.rmSync(Dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(Dir, 'satellites'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/math'), path.join(Dir, 'satellites/math'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/gauge'), path.join(Dir, 'satellites/gauge'), { recursive: true });
  fs.cpSync(path.join(REPO, 'tools'), path.join(Dir, 'tools'), { recursive: true });
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(Dir, 'satellites', file), s = fs.readFileSync(p, 'utf8');
    const n = s.split(from).length - 1;
    if (n !== 1) { console.log(name.padEnd(38) + 'NOT PLANTED (' + file + ' matches ' + n + ' times)'); planted = false; break; }
    fs.writeFileSync(p, s.replace(from, () => to));
  }
  if (!planted) continue;
  const r = spawnSync(process.execPath, [gate], { cwd: path.join(Dir, 'satellites/gauge'), encoding: 'utf8', timeout: 300000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const failLines = out.split('\n').filter(l => /FAIL/.test(l)).map(l => l.trim().slice(0, 190));
  console.log(name.padEnd(38) + (failLines.length ? failLines.join(' | ') : out.split('\n').filter(l => /OK$/.test(l)).join(' ') + '   <- planted nothing seen'));
}
fs.rmSync(path.join(SP, 'plant-gauge'), { recursive: true, force: true });
