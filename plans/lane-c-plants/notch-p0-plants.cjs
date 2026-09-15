/* Plants for NOTCH's P0 laws: a folder copy per plant (satellites/math, satellites/notch, tools/), each edit asserted to match
   exactly once, then the named gate run in the copy and its FAIL lines printed. Usage: node notch-p0-plants.cjs [prefix] */
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const REPO = '/workspaces/lucid-winds', SP = __dirname;
const B = 'notch/pieces.js', J = 'notch/project.js', E = 'notch/engine.js', C = 'notch/content.js';
const addPiece = (id, cells) => [B, "  ledge: Object.freeze({", "  " + id + ": Object.freeze({ name: '" + id + "', grain: 10, cells: Object.freeze(" + JSON.stringify(cells) + ") }),\n  ledge: Object.freeze({"];
const PLANTS = [
  ['s1 a piece that is its own mirror', 'test/shapes.mjs', [addPiece('tee', [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]])]],
  ['s2 a piece a half turn makes itself', 'test/shapes.mjs', [addPiece('zed', [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]])]],
  ['s3 a mirror that nearly fits', 'test/shapes.mjs', [addPiece('jay', [[1, 0], [1, 1], [1, 2], [1, 3], [0, 3], [2, 1], [0, 0]])]],
  ['s4 a piece twice (its mirror)', 'test/shapes.mjs', [addPiece('hookback', [[0, 0], [0, 1], [0, 2], [-1, 0], [-2, 0], [-3, 0]])]],
  ['s5 a piece in two parts', 'test/shapes.mjs', [addPiece('split', [[0, 0], [2, 0], [3, 0], [3, 1], [0, 1], [4, 1]])]],
  ['s6 a bank of seven', 'test/shapes.mjs', ['ledge', 'rake', 'bridge', 'kite'].map(id => [B, new RegExp('  ' + id + ': Object\\.freeze\\(\\{[^\\n]*\\n').exec(fs.readFileSync(path.join(REPO, 'satellites', B), 'utf8'))[0], ''])],
  ['p1 rotationZ clockwise', 'test/project.mjs', [[J, 'return [c, -s, 0, 0, s, c, 0, 0,', 'return [c, s, 0, 0, -s, c, 0, 0,']]],
  ['p2 a sign wrong in Rodrigues', 'test/project.mjs', [[J, 't * x * x + c, t * x * y - s * z,', 't * x * x + c, t * x * y + s * z,']]],
  ['p3 no perspective', 'test/project.mjs', [[J, 'return [cx + scale * q[0] / depth, cy - scale * q[1] / depth];', 'return [cx + scale * q[0] / focal, cy - scale * q[1] / focal];']]],
  ['p4 y not flipped', 'test/project.mjs', [[J, 'cy - scale * q[1] / depth', 'cy + scale * q[1] / depth']]],
  ['p5 multiply transposed', 'test/project.mjs', [[J, 's += a[r * 4 + k] * b[k * 4 + c];', 's += b[r * 4 + k] * a[k * 4 + c];']]],
  ['p6 a division by zero', 'test/project.mjs', [[J, '  if (!(depth > 1e-9)) return null;\n', '']]],
  ['e1 only 90 and 180', 'test/engine.mjs', [[E, 'const bag = shuffle(r, DISPARITIES.concat(DISPARITIES)).slice(0, SESSION_LENGTH);', 'const bag = shuffle(r, [90, 180, 90, 180, 90, 180, 90, 180, 90, 180, 90, 180]);']]],
  ['e2 a stage 2 session with no foil', 'test/engine.mjs', [[E, 'const foils = stage >= 2 ? 1 + Math.floor(r() * 3) : 0;', 'const foils = stage >= 2 ? Math.floor(r() * 3) : 0;']]],
  ['e3 foils at stage 1', 'test/engine.mjs', [[E, 'const foils = stage >= 2 ? 1 + Math.floor(r() * 3) : 0;', 'const foils = 1 + Math.floor(r() * 3);']]],
  ['e4 a tolerance of 4', 'test/engine.mjs', [[E, 'const STAGE_TWO = [9, 7, 6];', 'const STAGE_TWO = [9, 7, 4];']]],
  ['e5 a mirror that seats', 'test/engine.mjs', [[E, 'return !task.isMirror && angleOff(angle) <= task.tolerance;', 'return angleOff(angle) <= task.tolerance;']]],
  ['e6 keys of 20 degrees', 'test/engine.mjs', [[E, 'export const KEY_STEP = 15;', 'export const KEY_STEP = 20;']]],
  ['e7 no wrap', 'test/engine.mjs', [[E, 'return ((((a + 180) % 360) + 360) % 360) - 180;', 'return a;']]],
  ['e8 always turned one way', 'test/engine.mjs', [[E, 'const sign = r() < 0.5 ? 1 : -1;', 'const sign = 1;']]],
  ['e9 FIND with the piece twice', 'test/engine.mjs', [[E, 'regions.push({ pieceId, mirror: true, turn: Math.floor(r() * 4) });', 'regions.push({ pieceId, mirror: false, turn: Math.floor(r() * 4) });']]],
  ['e10 an unseeded shuffle', 'test/engine.mjs', [[E, 'const j = Math.floor(r() * (i + 1));', 'const j = Math.floor(Math.random() * (i + 1));']]],
  ['e11 a clock in the engine', 'test/engine.mjs', [[E, 'export const KEY_STEP = 15;', 'export const KEY_STEP = 15;\nexport const BORN = Date.now();']]],
  ['l1 a digit a child reads', 'tools/lint.mjs', [[C, "again: 'Again'", "again: 'Again 2'"]]],
  ['l2 ability made fixed', 'tools/lint.mjs', [[C, "go: 'Go on'", "go: 'You are a natural'"]]],
  ['l3 an unstamped import', 'tools/lint.mjs', [[E, "'./pieces.js?v=20260916e'", "'./pieces.js'"]]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const D = path.join(SP, 'plant-notch');
  fs.rmSync(D, { recursive: true, force: true });
  fs.mkdirSync(path.join(D, 'satellites'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/math'), path.join(D, 'satellites/math'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/notch'), path.join(D, 'satellites/notch'), { recursive: true });
  fs.cpSync(path.join(REPO, 'tools'), path.join(D, 'tools'), { recursive: true });
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(D, 'satellites', file), s = fs.readFileSync(p, 'utf8');
    const n = s.split(from).length - 1;
    if (n !== 1) { console.log(name.padEnd(38) + 'NOT PLANTED (' + file + ' matches ' + n + ' times)'); planted = false; break; }
    fs.writeFileSync(p, s.replace(from, () => to));
  }
  if (!planted) continue;
  const r = spawnSync(process.execPath, [gate], { cwd: path.join(D, 'satellites/notch'), encoding: 'utf8', timeout: 300000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const failLines = out.split('\n').filter(l => /FAIL/.test(l)).map(l => l.trim().slice(0, 190));
  console.log(name.padEnd(38) + (failLines.length ? failLines.join(' | ') : out.split('\n').filter(l => /OK$/.test(l)).join(' ') + '   <- planted nothing seen'));
}
fs.rmSync(path.join(SP, 'plant-notch'), { recursive: true, force: true });
