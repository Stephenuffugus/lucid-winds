#!/usr/bin/env node
/* THE ONE PLACE THE AUTHORED CONTENT BECOMES THE GAME'S DATA BLOCK.
 *
 *   node tools/data.mjs            rewrite the DATA block in index.html
 *   node tools/data.mjs --check    exit 1 if the block on disk is not what this would write
 *
 * It reads data/*.json and writes the literal between the markers
 * `// ---- DATA_START ----` and `// ---- DATA_END ----`.
 *
 * ⛔ THE FIELD CONTRACT, and it is the whole reason this tool exists rather than
 * a copy and paste. The authored files say `effects` and `text`; the engine
 * reads `eff` and `line`. Pasting them unchanged makes every unique and every
 * authored Trait SILENTLY INERT, and the engine's own guard against unknown
 * effect kinds passes vacuously because it iterates `t.eff || []` and an empty
 * list has no unknown kinds in it. So the normalisation happens HERE, on the
 * way in, and `sim.js --data` asserts the RELATIONSHIP (every record compiles
 * to at least one effect) rather than the spelling.
 *
 * ⛔ `traits.json` REPLACES the engine's seeded twelve, it does not merge with
 * them: eleven of its twenty four ids are the seeded ones and a twelfth differs
 * only by an underscore, so a merge would deal from a thirty six entry pool
 * weighted double for eleven Traits, with two different Ninth Hours one
 * character could own at once.
 *
 * ⛔ The eight Origins, eight Callings, the affix table, the six Sigils and the
 * five Depth names STAY IN THE ENGINE. DATA holds the eleven authored files and
 * nothing else. HANDOFF-MARROWDEEP section 4.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML_PATH = join(ROOT, 'index.html');
const START = '// ---- DATA_START ----';
const END = '// ---- DATA_END ----';
const CHECK = process.argv.includes('--check');

/* The eleven files, in the order a reader wants them. A file that appears in
   data/ and not here is a hard error, so a new bank cannot be added and then
   silently left out of the game. */
const FILES = [
  'challenges-might.json', 'challenges-grace.json', 'challenges-wits.json',
  'challenges-nerve.json', 'challenges-shapes.json',
  'bosses.json', 'traits.json', 'uniques.json',
  'names.json', 'relic-words.json', 'lines.json'
];

const onDisk = readdirSync(join(ROOT, 'data')).filter(f => f.endsWith('.json')).sort();
const listed = FILES.slice().sort();
if (onDisk.join('|') !== listed.join('|')) {
  console.error('data/ and the FILES list disagree.\n  on disk: ' + onDisk.join(', ') + '\n  listed:  ' + listed.join(', '));
  process.exit(2);
}

const read = f => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));

/* effects -> eff, text -> line. Everything else passes through untouched. */
function norm(rec) {
  const out = {};
  for (const k of Object.keys(rec)) {
    if (k === 'effects') out.eff = rec.effects;
    else if (k === 'text') out.line = rec.text;
    else out[k] = rec[k];
  }
  return out;
}
function byId(list) {
  const m = {};
  for (const rec of list) {
    if (m[rec.id]) { console.error('duplicate id in a bank: ' + rec.id); process.exit(2); }
    m[rec.id] = norm(rec);
  }
  return m;
}

const might = read('challenges-might.json');
const grace = read('challenges-grace.json');
const wits = read('challenges-wits.json');
const nerve = read('challenges-nerve.json');
const shapes = read('challenges-shapes.json');

/* ⛔ The SHAPE is the engine's, not the files'. `challenges` nests gate and chain
   per stat (R10.1) and keeps relay, vault, toll and open shared; `relicWords` is
   what the namer reads; `traits` is a MAP by id because the resolver looks one up
   and `uniques` is an ARRAY because the generator filters it by slot. Getting
   either of those two the wrong way round throws on the first relic rolled. */
const DATA = {
  challenges: {
    gate: { might: might.gate, grace: grace.gate, wits: wits.gate, nerve: nerve.gate },
    chain: { might: might.chain, grace: grace.chain, wits: wits.chain, nerve: nerve.chain },
    relay: shapes.relay, vault: shapes.vault, toll: shapes.toll, open: shapes.open
  },
  bosses: read('bosses.json').map(norm),
  traits: byId(read('traits.json')),
  uniques: read('uniques.json').map(norm),
  names: read('names.json'),
  relicWords: (function () { const w = read('relic-words.json'); return { affix: w.affix, base: w.base }; })(),
  lines: read('lines.json')
};

/* Pretty enough to read in a diff, tight enough not to bloat the page: arrays of
   strings go one per line, everything else is compact. */
function fmt(v, indent) {
  const pad = '  '.repeat(indent), pad1 = '  '.repeat(indent + 1);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    if (v.every(x => typeof x === 'string')) {
      return '[\n' + v.map(x => pad1 + JSON.stringify(x)).join(',\n') + '\n' + pad + ']';
    }
    return '[\n' + v.map(x => pad1 + fmt(x, indent + 1)).join(',\n') + '\n' + pad + ']';
  }
  if (v && typeof v === 'object') {
    const ks = Object.keys(v);
    if (!ks.length) return '{}';
    const flat = JSON.stringify(v);
    if (flat.length <= 110 && !ks.some(k => v[k] && typeof v[k] === 'object')) return flat;
    return '{\n' + ks.map(k => pad1 + JSON.stringify(k) + ': ' + fmt(v[k], indent + 1)).join(',\n') + '\n' + pad + '}';
  }
  return JSON.stringify(v);
}

const block = START + '\n/* Generated by tools/data.mjs from data/*.json. DO NOT HAND EDIT: the next run\n'
  + '   of that tool overwrites it, and tools/lint.mjs fails when the two drift.\n'
  + '   `effects` is normalised to `eff` and `text` to `line` on the way in. */\n'
  + 'var DATA_BANKS = ' + fmt(DATA, 0) + ';\n' + END;

const html = readFileSync(HTML_PATH, 'utf8');
const i = html.indexOf(START), j = html.indexOf(END);
if (i < 0 || j < 0) { console.error('index.html has no DATA markers'); process.exit(2); }
const next = html.slice(0, i) + block + html.slice(j + END.length);

if (CHECK) {
  if (next === html) { console.log('DATA OK  the block matches data/*.json'); process.exit(0); }
  console.error('DATA DRIFT  the block in index.html is not what data/*.json produces.\n'
    + '  Someone hand edited the block, or a bank changed without a rerun. Run: node tools/data.mjs');
  process.exit(1);
}
writeFileSync(HTML_PATH, next);
const C = DATA.challenges;
const counts = [
  'gate ' + Object.values(C.gate).reduce((n, a) => n + a.length, 0),
  'chain ' + Object.values(C.chain).reduce((n, a) => n + a.length, 0),
  'relay ' + C.relay.length, 'vault ' + C.vault.length, 'toll ' + C.toll.length, 'open ' + C.open.length,
  'bosses ' + DATA.bosses.length,
  'traits ' + Object.keys(DATA.traits).length,
  'uniques ' + DATA.uniques.length,
  'names ' + (DATA.names.first.length + DATA.names.second.length),
  'affix words ' + Object.keys(DATA.relicWords.affix).length
];
console.log('DATA WRITTEN  ' + (block.length / 1024).toFixed(1) + ' KB  ' + counts.join(', '));
