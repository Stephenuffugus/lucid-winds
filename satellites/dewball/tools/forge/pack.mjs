/* Dewball forge PACK: fitted GLBs -> the served folder, production flags, plus the
 * index.json the game reads.
 *
 *   node satellites/dewball/tools/forge/pack.mjs <fitted dir> <served dir> [--kinds a,b] [--merge]
 *
 * gltfpack -cc -kn -km -kv -noq, the plan's flags: -kv is mandatory (gltfpack strips
 * TEXCOORD_0 when it thinks no material reads a texture: the LOAF cat scar), -noq because
 * quantisation once broke a mesh in this repo, -cc is meshopt compression (decoded by the
 * vendored r147 meshopt_decoder.js, proven by the Phase 1 gate). --merge keeps entries of
 * an existing index.json that this run did not touch.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const [inDir, outDir] = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!inDir || !outDir) { console.log('usage: pack.mjs <fitted dir> <served dir> [--kinds a,b] [--merge]'); process.exit(2); }
const ki = process.argv.indexOf('--kinds');
const only = ki > 0 ? new Set(process.argv[ki + 1].split(',')) : null;
fs.mkdirSync(outDir, { recursive: true });
const ip = path.join(outDir, 'index.json');
const index = process.argv.includes('--merge') && fs.existsSync(ip) ? JSON.parse(fs.readFileSync(ip, 'utf8')) : { kinds: {} };
index.kinds = index.kinds || {};
let n = 0;
for (const f of fs.readdirSync(inDir).filter(f => f.endsWith('.glb')).sort()) {
  const kind = f.slice(0, -4);
  if (only && !only.has(kind)) continue;
  const src = path.join(inDir, f), dst = path.join(outDir, f);
  execFileSync('gltfpack', ['-cc', '-kn', '-km', '-kv', '-noq', '-i', src, '-o', dst], { stdio: 'pipe' });
  index.kinds[kind] = { glb: f };
  console.log(`pack ${kind.padEnd(14)} ${String(fs.statSync(src).size).padStart(8)} -> ${String(fs.statSync(dst).size).padStart(8)} bytes`);
  n++;
}
fs.writeFileSync(ip, JSON.stringify(index, null, 1) + '\n');
console.log(`packed ${n}, index lists ${Object.keys(index.kinds).length} kind(s): ${path.relative(process.cwd(), ip)}`);
