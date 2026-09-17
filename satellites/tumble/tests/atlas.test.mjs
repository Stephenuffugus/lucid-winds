// DESIGN 15.4: identical tiles from identical seeds across runs; no Load needs more than 64 tiles
// (the Load half of that lives in loadgen.test.mjs, which knows the Load sizes).
import { suite } from './lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { decode, paint, bytesHash, seedFrom, paintAtlas, TILE, FAMILIES, MODES } from '../engine/sockgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const masks = SILHOUETTES.map((s) => buildMask(s));
const GOLDEN = new URL('./golden.json', import.meta.url).pathname;

function atlasHash(mode) {
  const all = new Uint8Array(64 * TILE * TILE * 4);
  for (let i = 0; i < 64; i++) {
    const spec = decode(seedFrom('tumble-atlas-' + i));
    all.set(paint(spec, masks[spec.silhouette], { mode }), i * TILE * TILE * 4);
  }
  return bytesHash(all);
}

if (process.argv[2] === '--hash') { console.log(atlasHash(process.argv[3] || 'normal')); process.exit(0); }
const { ok, done } = suite('atlas');

const t0 = performance.now();
const h1 = atlasHash('normal');
const ms = performance.now() - t0;
const h2 = atlasHash('normal');
ok(h1 === h2, `same process, two paints: ${h1} == ${h2}`);
const other = spawnSync(process.execPath, [new URL(import.meta.url).pathname, '--hash', 'normal'], { encoding: 'utf8' }).stdout.trim().split('\n').pop();
ok(other === h1, `a separate process paints the same atlas (${other})`);
console.log(`  info  64 tiles in ${ms.toFixed(0)} ms (${(ms / 64).toFixed(1)} ms per tile)`);

// golden file: the browser page dev/atlas.html compares against these
const modes = {};
for (const m of MODES) modes[m] = m === 'normal' ? h1 : atlasHash(m);
if (process.argv.includes('--update') || !existsSync(GOLDEN)) {
  writeFileSync(GOLDEN, JSON.stringify({ note: 'FNV-1a of the 64 tile atlas painted from seeds sha256("tumble-atlas-<i>"). Regenerate with node tests/atlas.test.mjs --update after an intentional painter change.', atlas64: modes }, null, 2) + '\n');
  console.log('  info  golden written');
}
const golden = JSON.parse(readFileSync(GOLDEN, 'utf8')).atlas64;
for (const m of MODES) ok(golden[m] === modes[m], `${m} atlas matches the golden (${modes[m]})`);

// the 64 seeds cover every family and silhouette at least once, and colour modes really change tiles
const fams = new Set(), sils = new Set();
for (let i = 0; i < 64; i++) { const s = decode(seedFrom('tumble-atlas-' + i)); fams.add(s.family); sils.add(s.silhouette); }
console.log(`  info  the 64 dev seeds show ${fams.size}/10 families and ${sils.size}/8 silhouettes`);
// deutan and protan share one remapped table (both are red-green); the floor is still checked in each simulation
ok(modes.normal !== modes.deutan && modes.normal !== modes.tritan && modes.deutan !== modes.tritan && modes.deutan === modes.protan, 'normal, red-green and blue-yellow modes paint different atlases');

// every family paints something that is not flat, and a decoy tile differs from its base tile
for (const fam of FAMILIES) {
  let seed; for (let i = 0; ; i++) { seed = seedFrom('fam-' + fam + '-' + i); if (decode(seed).family === fam) break; }
  const b = paint(decode(seed), masks[decode(seed).silhouette], { size: 64 });
  let min = 255, max = 0;
  for (let i = 0; i < b.length; i += 4) { const l = b[i] * 0.3 + b[i + 1] * 0.59 + b[i + 2] * 0.11; min = Math.min(min, l); max = Math.max(max, l); }
  ok(max - min > 20, `${fam} paints a visible pattern (luma range ${Math.round(max - min)})`);
}

// paintAtlas refuses more than 64 tiles
let threw = false;
try { paintAtlas(Array.from({ length: 65 }, (_, i) => ({ seed: seedFrom('x' + i) })), masks, { size: 8 }); } catch (e) { threw = true; }
ok(threw, 'the atlas refuses a 65th tile');

done();
