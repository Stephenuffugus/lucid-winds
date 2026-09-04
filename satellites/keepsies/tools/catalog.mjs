/**
 * The catalog, generated from the design's own tables.
 *
 *   node tools/catalog.mjs          write src/data/marbles.json
 *   node tools/catalog.mjs --check  fail if the JSON is stale against the doc
 *
 * DESIGN 10 says the catalog is "generated from tables in this doc" and it means
 * it: names, tiers, classes, passives, actives and lore are read out of
 * `docs/DESIGN.md` and nowhere else. Type them twice and they disagree; the doc
 * is where Stephen writes, so the doc wins.
 *
 * ⛔ THREE OF THE SIX SECTIONS ARE NOT PLAIN TABLES and each needs its own hand.
 *   10.2 COMMONS is a table, but ONE ROW packs six marbles: "Cat's Eye: Banana /
 *        Blue Jay / Grass Snake / Ember / Beet / Inkwell" with a x6 recipe. It
 *        expands to six entries or the count is wrong by five.
 *   10.3 UNCOMMONS is BOLD PROSE under group headings, not a table at all. The
 *        heading gives the class, the bold names are the marbles, and a
 *        parenthesis after a name is a note about it rather than another marble.
 *   10.4 to 10.7 are tables, but 10.6 and 10.7 carry a Figure or a Boss column
 *        where the others carry a Class.
 *
 * Everything the tables do not carry (palettes, recipe parameters, density
 * overrides) lives in `src/data/marbles.overrides.json` and is merged by id, so
 * a tuning change is a data change and nobody ever edits the design for a number.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = join(ROOT, 'docs', 'DESIGN.md');
const OUT = join(ROOT, 'src', 'data', 'marbles.json');
const OVERRIDES = join(ROOT, 'src', 'data', 'marbles.overrides.json');
const CHECK = process.argv.includes('--check');

const doc = readFileSync(DOC, 'utf8');

/** The text of one numbered section, up to the next heading of the same depth. */
function section(n) {
  const re = new RegExp('^### ' + n.replace('.', '\\.') + '[^\\n]*\\n([\\s\\S]*?)(?=^### |^## )', 'm');
  const m = doc.match(re);
  if (!m) throw new Error('catalog: DESIGN.md has no section ' + n);
  return m[1];
}

/** Markdown table rows as arrays of trimmed cells, header and rule dropped. */
function rows(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|$/.test(t)) continue;                    // the ---- rule
    const cells = t.slice(1, -1).split('|').map(c => c.trim());
    if (/^(name|boss|league)$/i.test(cells[0])) continue;       // the header
    out.push(cells);
  }
  return out;
}

const id = (name) => name.toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const strip = (s) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

/** "**Old Bones** — immune to first crack..." becomes {id, name, text}. */
function ability(cell) {
  if (!cell || cell === '—' || cell.toLowerCase() === 'null') return null;
  const m = cell.match(/\*\*([^*]+)\*\*\s*[—-]?\s*(.*)$/);
  if (!m) return { id: id(strip(cell)), name: strip(cell), text: '' };
  return { id: id(m[1]), name: strip(m[1]), text: strip(m[2]) };
}

const CLASS_MAP = {
  agate: 'agate', glass: 'glass', stone: 'stone', steel: 'steel', clay: 'clay',
  fantasy: 'fantasy', 'agate/stone': 'agate'
};
function classOf(word, fallback) {
  if (!word) return fallback;
  const w = strip(word).toLowerCase().split(/[\s/]+/)[0];
  return CLASS_MAP[w] || fallback;
}

const marbles = [];
/**
 * ⛔ A NUMBER WRITTEN INTO PROSE IS STILL A NUMBER. DESIGN gives two marbles a
 * hardness inside their passive text and nowhere else: Mercury is steel with
 * "−hardness (0.8)" and Kiln Kiss is clay with "agate hardness (1.3)". Left in
 * the sentence, bodySpec never saw them, so the inspect card called Mercury
 * "shrugs it off" directly above its own passive saying its hardness is 0.8.
 * `test/words.mjs` found it, by noticing that the softest word in the game could
 * never print. The number is DESIGN's, unchanged: this only carries it.
 */
function arenaFrom(m) {
  const text = [(m.passive || {}).text, (m.active || {}).text].filter(Boolean).join(' ');
  const hit = text.match(/hardness\s*\((\d+(?:\.\d+)?)\)/i);
  return hit ? { hardness: parseFloat(hit[1]) } : null;
}

const push = (m) => {
  if (marbles.some(x => x.id === m.id)) throw new Error('catalog: two marbles share the id ' + m.id);
  const arena = arenaFrom(m);
  if (arena) m.arena = arena;
  marbles.push(m);
};

/* --------------------------------------------------- 10.2 COMMONS, dust 5 */

for (const r of rows(section('10.2'))) {
  const [nameCell, recipeCell, loreCell] = r;
  const lore = (loreCell || '').replace(/^"|"$/g, '').replace(/^[^"]*"/, '').replace(/"$/, '').trim()
    || strip(loreCell || '');
  const cleanLore = strip((loreCell || '').replace(/^[^"]*"/, '').replace(/"[^"]*$/, '')) || strip(loreCell || '');
  // ⛔ the one row that is six marbles
  const packed = strip(nameCell).match(/^Cat's Eye:\s*(.+)$/);
  if (packed) {
    for (const colour of packed[1].split('/').map(x => x.trim())) {
      push({
        id: 'cats_eye_' + id(colour), name: "Cat's Eye " + colour,
        tier: 'common', class: 'glass', diameterMm: 16,
        // ⛔ THREE vanes, not one. DESIGN 10.2 writes the recipe as
        // "catsEye(1, color)" and the 1 is the number of COLOURS, not vanes: the
        // very next tier names a "Nine Vane" as the wilder variant, which only
        // makes sense against a normal one that has some. A single vane rendered
        // as one wide smear of colour and read as a stain rather than a blade.
        render: { type: 'procedural', recipe: 'catsEye', vaneCount: 3 },
        lore: cleanLore, passive: null, active: null, dust: 5, stakeable: true, source: 'starter'
      });
    }
    continue;
  }
  const name = strip(nameCell);
  if (!name) continue;
  const recipe = strip(recipeCell).toLowerCase();
  push({
    id: id(name), name,
    tier: 'common',
    class: /clay|chalk/.test(recipe) ? 'clay' : 'glass',
    diameterMm: /12\s*mm|peewee/i.test(recipeCell + name) ? 12 : 16,
    render: { type: 'procedural', recipe: recipe.indexOf('clay') === 0 ? 'clay' : 'clearGlass' },
    lore: cleanLore, passive: null, active: null, dust: 5, stakeable: true, source: 'starter'
  });
}

/* ------------------------------- 10.3 UNCOMMONS, bold prose under headings */

const UNCOMMON_CLASS = {
  swirls: 'glass', corkscrews: 'glass', 'patch/opaque': 'glass',
  steel: 'steel', stone: 'stone', wildcard: 'glass'
};
const UNCOMMON_RECIPE = {
  swirls: 'swirl', corkscrews: 'corkscrew', 'patch/opaque': 'patch',
  steel: 'steel', stone: 'agateBands', wildcard: 'clearGlass'
};
for (const line of section('10.3').split('\n')) {
  const m = line.match(/^([A-Za-z/]+):\s*(.+)$/);
  if (!m) continue;
  const group = m[1].toLowerCase();
  if (!(group in UNCOMMON_CLASS)) continue;
  // the bold runs are the marbles; a parenthesis after one is a note about it
  const names = [...m[2].matchAll(/\*\*([^*]+)\*\*/g)].map(x => x[1].trim());
  const loreMatch = m[2].match(/"([^"]+)"/);
  for (const name of names) {
    push({
      id: id(name), name,
      tier: 'uncommon',
      class: UNCOMMON_CLASS[group],
      diameterMm: 16,
      render: { type: 'procedural', recipe: name === 'Slag' ? 'slag' : UNCOMMON_RECIPE[group], seeded: name === 'Slag' },
      lore: loreMatch ? loreMatch[1] : '',
      passive: null, active: null, dust: 25, stakeable: true, source: 'pouch'
    });
  }
}

/* ------------------------------------- 10.4 RARES: passives, no actives yet */

for (const r of rows(section('10.4'))) {
  const [nameCell, classCell, passiveCell, loreCell] = r;
  const name = strip(nameCell);
  if (!name) continue;
  push({
    id: id(name), name,
    tier: 'rare',
    class: classOf(classCell, 'glass'),
    diameterMm: 16,
    render: { type: 'procedural', recipe: 'agateBands' },
    lore: strip((loreCell || '').replace(/^"|"$/g, '')),
    passive: ability(passiveCell), active: null,
    dust: 120, ransom: 400, stakeable: true, source: 'pouch'
  });
}

/* ------------------------------------------- 10.5 EPICS: passive and active */

for (const r of rows(section('10.5'))) {
  const [nameCell, roleCell, passiveCell, activeCell, loreCell] = r;
  const name = strip(nameCell);
  if (!name) continue;
  push({
    id: id(name), name,
    tier: 'epic',
    class: classOf(roleCell, 'glass'),
    role: strip(roleCell).split(/\s+/).slice(1).join(' ') || null,
    diameterMm: 16,
    render: { type: 'procedural', recipe: 'custom', seeded: /seeded/i.test(loreCell || '') },
    lore: strip((loreCell || '').replace(/\(seeded render\)/i, '').replace(/^"|"$/g, '')),
    passive: ability(passiveCell), active: ability(activeCell),
    dust: 600, ransom: 1500, stakeable: true, source: 'pouch'
  });
}

/* --------------------------------------- 10.6 GRAILS: glb sulphides, no dupes */

for (const r of rows(section('10.6'))) {
  const [nameCell, figureCell, passiveCell, activeCell, loreCell] = r;
  const name = strip(nameCell);
  if (!name) continue;
  push({
    id: id(name), name,
    tier: 'grail',
    class: 'glass',
    figure: strip(figureCell),
    diameterMm: 22,
    render: { type: 'glb', recipe: 'clearGlass', glb: 'assets/models/grails/' + id(name) + '.glb' },
    lore: strip((loreCell || '').replace(/^"|"$/g, '')),
    passive: ability(passiveCell), active: ability(activeCell),
    ransom: 5000, stakeable: true, source: 'grailPouch', noDupes: true
  });
}

/* ----------------- 10.7 BOSS SIGNATURES: exist nowhere else, never in a pouch */

for (const r of rows(section('10.7'))) {
  const [bossCell, sigCell, kitCell, loreCell] = r;
  const boss = strip(bossCell);
  if (!boss) continue;
  const sigName = (sigCell.match(/\*\*([^*]+)\*\*/) || [, strip(sigCell)])[1].trim();
  const bracket = (sigCell.match(/\(([^)]+)\)/) || [, ''])[1].toLowerCase();
  const tier = /grail/.test(bracket) ? 'grail' : (/epic/.test(bracket) ? 'epic' : 'rare');
  // the kit cell may hold a passive, or a passive and an active joined by a dot
  const parts = kitCell.split('·').map(x => x.trim());
  push({
    id: id(sigName), name: sigName,
    tier, class: classOf(bracket.split(/\s+/).find(w => CLASS_MAP[w]) || '', 'glass'),
    diameterMm: 16,
    render: { type: /grail/.test(bracket) ? 'glb' : 'procedural', recipe: 'custom' },
    lore: strip((loreCell || '').replace(/^"|"$/g, '')),
    passive: ability(parts[0]),
    active: parts.length > 1 ? ability(parts[1].replace(/^Active\s*/i, '')) : null,
    boss: id(boss), bossName: boss,
    stakeable: false, source: 'boss', signature: true
  });
}

/* ------------------------------------------------------------- the looks */

/**
 * A palette for every marble, chosen deterministically from its name.
 *
 * The design gives recipes for the commons and describes the rest in words. So
 * each marble gets a hue from its own name, spread around the wheel by the hash
 * so that no two neighbours in the catalog land near each other, and a recipe
 * that follows its class. Anything hand chosen goes in the overrides and wins.
 * The point is that all sixty five RENDER, distinctly, from the first day: the
 * contact sheet is only useful if there is something on it to compare.
 */
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function hsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  const to = (v) => ('0' + Math.round((v + m) * 255).toString(16)).slice(-2);
  return '#' + to(r) + to(g) + to(b);
}
const CLASS_RECIPE = { clay: 'clay', glass: 'clearGlass', agate: 'agateBands', stone: 'agateBands', steel: 'steel', fantasy: 'custom' };
for (const m of marbles) {
  const h = hash32(m.id);
  // a tenth of a degree of granularity, because whole degrees collided three
  // times in sixty five names and two marbles that look identical at 64 px are
  // a fault the contact sheet exists to catch
  const hue = (h % 3600) / 10;
  const light = m.class === 'clay' ? 0.42 : (m.class === 'steel' ? 0.52 : 0.46);
  const sat = m.class === 'steel' ? 0.06 : (m.class === 'clay' ? 0.34 : 0.62);
  if (!m.render.palette) {
    m.render.palette = [
      hsl(hue, sat, light * 0.55),                       // core, the deep one
      hsl((hue + 14) % 360, sat * 0.8, light * 1.35),    // skin
      hsl((hue + 190) % 360, sat * 0.9, 0.86)            // vane and rim, the contrast
    ];
  }
  if (m.render.recipe === 'custom' && m.tier !== 'epic' && m.tier !== 'grail' && !m.signature) {
    m.render.recipe = CLASS_RECIPE[m.class] || 'clearGlass';
  }
  if (m.render.recipe === 'agateBands' && m.class === 'glass') m.render.recipe = 'swirl';
  if (m.render.recipe === 'catsEye' && !m.render.vaneCount) m.render.vaneCount = 3;
  m.render.seed = (h >>> 8) / 16777216;
}

/* ------------------------------------------------------- merge and verify */

let overrides = {};
if (existsSync(OVERRIDES)) overrides = JSON.parse(readFileSync(OVERRIDES, 'utf8'));
for (const m of marbles) {
  const o = overrides[m.id];
  if (!o) continue;
  if (o.render) { Object.assign(m.render, o.render); delete o.render; }
  Object.assign(m, o);
}

const counts = {};
for (const m of marbles) counts[m.tier] = (counts[m.tier] || 0) + 1;
/* ⛔ The boss signatures ARE rares, epics and a grail, and the design's own
   heading counts them inside the sixty five. So the per tier expectations are
   over the DESIGNED marbles, and the signatures are counted separately: the
   first version double counted them and reported sixteen rares against a want
   of fourteen on a catalog that was exactly right. */
const designed = marbles.filter(m => !m.signature);
const dCounts = {};
for (const m of designed) dCounts[m.tier] = (dCounts[m.tier] || 0) + 1;
const EXPECT = { common: 14, uncommon: 20, rare: 14, epic: 8, grail: 4 };

const problems = [];
for (const tier of Object.keys(EXPECT)) {
  if ((dCounts[tier] || 0) !== EXPECT[tier]) {
    problems.push(tier + ' holds ' + (dCounts[tier] || 0) + ' designed marbles, want ' + EXPECT[tier]);
  }
}
const signatures = marbles.filter(m => m.signature).length;
if (signatures !== 5) problems.push('there are ' + signatures + ' boss signatures, want 5');
if (marbles.length !== 65) problems.push('the catalog holds ' + marbles.length + ' marbles, want 65');
for (const m of marbles) {
  if (!m.name) problems.push(m.id + ' has no name');
  if (!m.render || !m.render.recipe) problems.push(m.id + ' has no render recipe');
  if (!m.passive && (m.tier === 'rare' || m.tier === 'epic' || m.tier === 'grail')) {
    problems.push(m.id + ' is a ' + m.tier + ' with no passive, and DESIGN 10.4 says rares behave');
  }
  // signatures follow their boss, not the tier ladder: The Pit Boss's House Edge
  // is an epic with a passive and no active, exactly as DESIGN 10.7 writes it
  if (m.tier === 'epic' && !m.active && !m.signature) problems.push(m.id + ' is an epic with no active');
  if (m.tier === 'rare' && m.active && !m.signature) {
    problems.push(m.id + ' is a rare with an active, and DESIGN 10.4 says no actives below epic');
  }
}

const out = {
  _: 'GENERATED by tools/catalog.mjs from docs/DESIGN.md sections 10.2 to 10.7. Do not edit. Numbers and palettes that the design does not carry live in marbles.overrides.json and are merged by id.',
  generatedFrom: 'docs/DESIGN.md',
  count: marbles.length,
  counts,
  marbles
};
const json = JSON.stringify(out, null, 1) + '\n';

console.log('designed  commons ' + (dCounts.common || 0) + '  uncommons ' + (dCounts.uncommon || 0)
  + '  rares ' + (dCounts.rare || 0) + '  epics ' + (dCounts.epic || 0) + '  grails ' + (dCounts.grail || 0)
  + '   = ' + designed.length);
console.log('signatures ' + signatures + '  (' + marbles.filter(m => m.signature).map(m => m.name).join(', ') + ')');
console.log('total   ' + marbles.length + ' of 65');

if (problems.length) {
  console.log('\n' + problems.length + ' problem' + (problems.length > 1 ? 's' : '') + ':');
  for (const p of problems.slice(0, 12)) console.log('  ' + p);
  console.log('CATALOG FAILED');
  process.exit(1);
}

if (CHECK) {
  const have = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (have !== json) {
    console.log('\nsrc/data/marbles.json is STALE against docs/DESIGN.md. Run node tools/catalog.mjs');
    console.log('CATALOG FAILED');
    process.exit(1);
  }
  console.log('\nthe generated catalog matches src/data/marbles.json exactly');
} else {
  writeFileSync(OUT, json);
  console.log('\nwrote src/data/marbles.json');
}
console.log('CATALOG OK');
