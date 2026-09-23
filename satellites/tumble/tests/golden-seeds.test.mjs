// GOLDEN SEEDS (DESIGN-T2 phase 0.2): "every sock ever found is a permanent seed", written as a test.
//
// 2,000 seeds, sha256("tumble-golden-<i>") for i = 0 to 1999, covering every patternFamily value 0 to 15
// (the field holds 0 to 15 and ten families exist, so today 10 to 15 wrap round to families 0 to 5).
// For each seed this pins three things in golden-seeds.json, in order, separated by semicolons:
//
//     <specKey> ; <the family it resolves to> ; <an FNV-1a hash of its painted 96 px tile>
//
// It must pass UNCHANGED at the end of EVERY phase of Build 2. When phase 5 adds pattern families it must add
// them behind a generator version mark, so a seed minted before the mark keeps the sock it has always painted
// in every Drawer and every Odd Bin. If this suite goes red, some player's sock changed.
//
// Regenerate ONLY for a painter change the Director has approved: node tests/golden-seeds.test.mjs --update
import { suite } from './lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { decode, paint, specKey, bytesHash, seedFrom, FAMILIES } from '../engine/sockgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const N = 2000;
const SIZE = 96;
const SEP = ';';
const FILE = new URL('./golden-seeds.json', import.meta.url).pathname;
const masks = SILHOUETTES.map((s) => buildMask(s));

const seedAt = (i) => seedFrom('tumble-golden-' + i);

function rowFor(i) {
  const spec = decode(seedAt(i));
  const tile = paint(spec, masks[spec.silhouette], { size: SIZE });
  return [specKey(spec), spec.family, bytesHash(tile)].join(SEP);
}

const t0 = performance.now();
const rows = Array.from({ length: N }, (_, i) => rowFor(i));
const ms = performance.now() - t0;
const counts = new Array(16).fill(0);
for (let i = 0; i < N; i++) counts[decode(seedAt(i)).patternFamily]++;

if (process.argv.includes('--update') || !existsSync(FILE)) {
  writeFileSync(FILE, JSON.stringify({
    note: 'The permanent seed promise (DESIGN-T2 phase 0.2). 2,000 seeds sha256("tumble-golden-<i>"), i = 0 to 1999, in order. Each row is "<specKey>;<family>;<FNV-1a of the 96 px tile>". Recorded before sockgen was touched for Build 2. Regenerate only for an approved painter change: node tests/golden-seeds.test.mjs --update',
    size: SIZE, count: N, families: FAMILIES.length, familyCounts: counts, rows,
  }, null, 1) + '\n');
  console.log('  info  golden-seeds.json written');
}

const { ok, done } = suite('golden-seeds');
const g = JSON.parse(readFileSync(FILE, 'utf8'));

ok(g.count === N && g.rows.length === N, `${N} seeds pinned (the file holds ${g.rows.length})`);
ok(g.size === SIZE, `tiles are painted at ${SIZE} px (the file says ${g.size})`);

// every seed still decodes to the same fields, resolves to the same family and paints the same bytes.
// The three are counted INDEPENDENTLY: a changed family must not let the tile check skip itself.
const badKey = [], badFam = [], badTile = [];
for (let i = 0; i < N; i++) {
  const was = String(g.rows[i]).split(SEP), now = rows[i].split(SEP);
  if (was[0] !== now[0]) badKey.push(`${i}: ${was[0]} to ${now[0]}`);
  if (was[1] !== now[1]) badFam.push(`${i}: ${was[1]} to ${now[1]}`);
  if (was[2] !== now[2]) badTile.push(`${i}: ${was[2]} to ${now[2]}`);
}
const some = (a, n) => (a.length ? ': ' + a.slice(0, n).join('; ') + (a.length > n ? ' and more' : '') : '');
ok(badKey.length === 0, `every seed decodes to the fields it always had (${badKey.length} changed${some(badKey, 3)})`);
ok(badFam.length === 0, `every seed resolves to the pattern family it always had (${badFam.length} changed${some(badFam, 4)})`);
ok(badTile.length === 0, `every seed paints the bytes it always painted (${badTile.length} changed${some(badTile, 4)})`);

// the set really does exercise all sixteen values of the 4 bit field, including the six that wrap today
ok(counts.every((c) => c > 0), `every patternFamily value 0 to 15 is covered (least used: ${Math.min(...counts)} seeds)`);
const pinned = g.familyCounts || [];
const drift = counts.filter((c, v) => (pinned[v] || 0) !== c).length;
ok(drift === 0, `the seeds fall into the same sixteen buckets as when this was recorded (${drift} buckets moved)`);

// VERSION 2 (DESIGN-T2 5.2): the same 2,000 seeds with the mark `~g.2`, pinned the day version 2 started minting. A
// marked seed is as permanent as an unmarked one: from 24 September they are in Drawers. Values 10 to 15 resolve to
// the six version 2 families here instead of wrapping. Recorded once, never regenerated except for an approved
// painter change: node tests/golden-seeds.test.mjs --update-v2
{
  const FILE2 = new URL('./golden-seeds-v2.json', import.meta.url).pathname;
  const rows2 = Array.from({ length: N }, (_, i) => {
    const spec = decode(seedAt(i) + '~g.2');
    return [specKey(spec), spec.family, bytesHash(paint(spec, masks[spec.silhouette], { size: SIZE }))].join(SEP);
  });
  if (process.argv.includes('--update-v2') || !existsSync(FILE2)) {
    writeFileSync(FILE2, JSON.stringify({
      note: 'The permanent seed promise for VERSION 2 seeds (DESIGN-T2 5.2). The same 2,000 seeds as golden-seeds.json with the mark ~g.2, recorded the day version 2 started minting. Each row is "<specKey>;<family>;<FNV-1a of the 96 px tile>". Regenerate only for an approved painter change: node tests/golden-seeds.test.mjs --update-v2',
      size: SIZE, count: N, rows: rows2,
    }, null, 1) + '\n');
    console.log('  info  golden-seeds-v2.json written');
  }
  const g2 = JSON.parse(readFileSync(FILE2, 'utf8'));
  const moved = [];
  for (let i = 0; i < N; i++) if (g2.rows[i] !== rows2[i]) moved.push(i);
  ok(g2.count === N && moved.length === 0, `every version 2 seed decodes, resolves and paints as it did the day version 2 began (${moved.length} changed${moved.length ? ': ' + moved.slice(0, 4).join(', ') : ''})`);
  const own = rows2.filter((r, i) => counts && decode(seedAt(i)).patternFamily >= 10 && !FAMILIES.includes(r.split(SEP)[1])).length;
  ok(own === counts.slice(10).reduce((a, b) => a + b, 0), `and every marked seed with a value of 10 or more has a version 2 family of its own (${own})`);
  // the knit grain is seeded from the whole seed string, so a marked seed's grain differs from its unmarked twin's
  // (as every decoy's does). Handed the same grain, a marked seed of the first ten families must paint EXACTLY its
  // twin: the mark chooses the family and nothing else about the drawing.
  let same = 0, old = 0;
  for (let i = 0; i < N; i++) {
    const a = decode(seedAt(i)), b = decode(seedAt(i) + '~g.2');
    if (a.patternFamily >= 10) continue;
    old++;
    if (bytesHash(paint({ ...b, seed: a.seed }, masks[a.silhouette], { size: SIZE })) === rows[i].split(SEP)[2]) same++;
  }
  ok(old > 1000 && same === old, `while a marked seed of the first ten families, handed its twin's grain, paints its unmarked twin exactly (${same} of ${old})`);
}

const wrapped = counts.slice(10).reduce((a, b) => a + b, 0);
console.log(`  info  ${wrapped} of ${N} seeds hold a patternFamily of 10 or more: the socks a new family would repaint`);
console.log(`  info  ${N} tiles painted in ${(ms / 1000).toFixed(1)} s`);

done();
