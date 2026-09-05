/**
 * The build stamp.
 *
 *   node tools/stamp.mjs            check, prints STAMP OK or the offenders
 *   node tools/stamp.mjs --bump 20260905a   rewrite every ?v= and version.json
 *
 * WHY EVERY IMPORT CARRIES ITS OWN QUERY. The host edge caches aggressively and
 * a bare URL stays pinned for days, so a deploy that does not change a URL does
 * not reach a returning player. And ES MODULE IMPORTS ARE SEPARATE URLS: a `?v=`
 * on the entry script does NOT propagate to what it imports. Aura Off learned
 * that one the expensive way. So the stamp lives in the committed bytes of every
 * relative import, which is what the host actually serves.
 *
 * WHY lib/ IS EXEMT AND MUST STAY EXEMPT. three.js and Rapier are vendored byte
 * frozen. They are never edited, so they never need busting, and a query on them
 * would only defeat the cache that should be holding them. If a version ever
 * changes, the FOLDER changes name.
 *
 * Node ignores a query on a relative import, so `core/` still runs headless from
 * the same source the browser fetches. That is proven, not assumed.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUMP = process.argv.includes('--bump') ? process.argv[process.argv.indexOf('--bump') + 1] : null;

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (name !== 'node_modules') walk(p, out); }
    else out.push(p);
  }
  return out;
}

/* ⛔ THE TESTS, THE HARNESS AND THE TOOLS ARE STAMPED TOO. They import the same
   modules with the same queries, and Node treats a different query as a DIFFERENT
   MODULE with its own state: a test importing `save.js?v=a` beside a module that
   imports `save.js?v=b` gets two saves that do not see each other's writes. */
const FILES = [
  ...walk(join(ROOT, 'src'), []).filter(f => f.endsWith('.js')),
  ...walk(join(ROOT, 'test'), []).filter(f => f.endsWith('.mjs') || f.endsWith('.js')),
  ...walk(join(ROOT, 'sim'), []).filter(f => f.endsWith('.mjs') || f.endsWith('.js')),
  ...walk(join(ROOT, 'tools'), []).filter(f => f.endsWith('.mjs') || f.endsWith('.js')),
  join(ROOT, 'index.html'),
  join(ROOT, 'manifest.json')
];

/* Every reference to a file this game serves. Bare specifiers (three) are the
   import map's job; /music-unlocks.js belongs to the fleet and is not ours to
   stamp; anything under lib/ is byte frozen and must carry no query at all. */
/* ⛔ `fetch(` IS A REFERENCE TOO. The three data files are fetched, not imported,
   and the first stamp left them at the old query: a retuned tuning.json would have
   reached a returning phone as the cached old one. */
const REF = /(?:from\s+|import\s*\(\s*|fetch\s*\(\s*|src\s*=\s*|href\s*=\s*)(['"])([^'"]+)\1/g;

function classify(spec) {
  if (/^https?:/.test(spec) || spec.startsWith('//')) return 'external';
  if (spec.startsWith('/')) return 'fleet';
  if (!spec.startsWith('.') && !spec.startsWith('src/') && !spec.startsWith('lib/')
    && !/^[a-z0-9._-]+\.(js|json|png|html)/i.test(spec)) return 'bare';
  if (/(^|\/)lib\//.test(spec)) return 'lib';
  return 'ours';
}

const version = JSON.parse(readFileSync(join(ROOT, 'src/version.json'), 'utf8'));
const BUILD = BUMP || version.build;

/* ⛔ AND EVERY LITERAL `?v=` TOKEN, WHATEVER IT IS ATTACHED TO. A test that builds
   its import as `join(ROOT, 'x.js') + '?v=20260905a'`, a manifest's `"src":`, a
   `start_url`: none of those are a `from` or an `import(`, and the first bump
   left six files a build behind. Node then held TWO copies of `save.js`, one per
   query, and the progression gate wiped one and read the other. */
const TOKEN = /\?v=\d{8}[a-z]\b/g;

if (BUMP) {
  let changed = 0;
  for (const f of FILES) {
    const src = readFileSync(f, 'utf8');
    let out = src.replace(REF, (whole, q, spec) => {
      if (classify(spec) !== 'ours') return whole;
      const clean = spec.split('?')[0];
      return whole.replace(spec, clean + '?v=' + BUMP);
    });
    out = out.replace(TOKEN, '?v=' + BUMP);
    if (out !== src) { writeFileSync(f, out); changed++; }
  }
  writeFileSync(join(ROOT, 'src/version.json'), JSON.stringify({ build: BUMP, phase: version.phase }) + '\n');
  console.log('stamped ' + changed + ' files to ' + BUMP);
  process.exit(0);
}

const bad = [];

/* The import map is JSON inside a script tag, so none of REF's forms reach it,
   and the first version of this checker silently skipped the one place `three`
   is bound. A rule that cannot see the file it governs is not a rule. */
function importMapSpecs(html) {
  const m = html.match(/<script[^>]*type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return [];
  let map;
  try { map = JSON.parse(m[1]); } catch (e) { return ['(the import map is not valid JSON)']; }
  return Object.values(map.imports || {});
}
for (const spec of importMapSpecs(readFileSync(join(ROOT, 'index.html'), 'utf8'))) {
  if (spec.indexOf('(') === 0) { bad.push('index.html: ' + spec); continue; }
  const kind = classify(spec);
  if (kind === 'lib' && spec.indexOf('?') >= 0)
    bad.push('index.html import map: "' + spec + '" is a vendored lib and must carry no query');
  if (kind === 'ours' && spec.indexOf('?v=' + BUILD) < 0)
    bad.push('index.html import map: "' + spec + '" is not stamped ?v=' + BUILD);
}

for (const f of FILES) {
  const src = readFileSync(f, 'utf8');
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    if (m[0] !== '?v=' + BUILD) bad.push(relative(ROOT, f) + ': "' + m[0] + '" is stale, want ?v=' + BUILD);
  }
  REF.lastIndex = 0;
  while ((m = REF.exec(src))) {
    const spec = m[2];
    const kind = classify(spec);
    const rel = relative(ROOT, f);
    if (kind === 'ours') {
      const q = spec.indexOf('?v=');
      if (q < 0) bad.push(rel + ': "' + spec + '" carries no ?v=');
      else if (spec.slice(q + 3) !== BUILD) bad.push(rel + ': "' + spec + '" is stale, want ?v=' + BUILD);
    } else if (kind === 'lib') {
      if (spec.indexOf('?') >= 0) bad.push(rel + ': "' + spec + '" is a vendored lib and must carry no query');
    }
  }
}

if (bad.length) {
  console.log('STAMP FAILED, build is ' + BUILD);
  for (const b of bad) console.log('  ' + b);
  process.exit(1);
}
console.log('every relative import in src, index.html and manifest.json carries ?v=' + BUILD
  + ', and nothing under lib/ carries a query');
console.log('STAMP OK');
