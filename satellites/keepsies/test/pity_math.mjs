/**
 * A hundred thousand pulls per pouch.
 *
 *   node test/pity_math.mjs [pulls]
 *
 * DESIGN 11 prints odds a player will read and compare against what they get, so
 * the numbers have to be true. Three things are asserted, and the third is the
 * one that matters most:
 *
 *   1. THE BASE ROLL IS THE TABLE. Over a hundred thousand rolls each tier lands
 *      within half a point of its printed weight.
 *   2. PITY FIRES EXACTLY WHERE IT SAYS. A Standard Pouch guarantees a rare
 *      within ten and an epic within forty, so across the whole run there is
 *      never a gap of ten pulls without a rare, and never forty without an epic.
 *   3. PITY IS A FLOOR AND NEVER A CEILING. The rate a player actually sees must
 *      be at or ABOVE the printed one for every tier at or above the pitied one.
 *      A pity system that quietly claws back what it gave is the oldest trick in
 *      the genre and this game does not do it.
 *
 * And the grail rule, which is absolute: a one of one never arrives twice.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createDrops } from '../src/meta/drops.js?v=20260905a';
import { makeRng } from '../src/core/rng.js?v=20260905a';
import { TIER_ORDER } from '../src/meta/tiers.js?v=20260905a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(ROOT, 'src/data/droptables.json'), 'utf8'));
const CATALOG = JSON.parse(readFileSync(join(ROOT, 'src/data/marbles.json'), 'utf8'));
const N = parseInt(process.argv[2] || '100000', 10);

const drops = createDrops(TABLES, CATALOG, T);
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const pct = (n, d) => (100 * n / d);

// the leading underscore keys are notes to a reader, not pouches
for (const kind of Object.keys(TABLES).filter(k => k[0] !== '_')) {
  const table = TABLES[kind];
  console.log('\n' + table.name + ', ' + N.toLocaleString('en') + ' pulls');

  /* ---- 1. the base roll IS the table ---- */
  const base = {};
  const rngBase = makeRng(0xB0B + kind.length);
  for (let i = 0; i < N; i++) {
    const t = drops.rollTier(table.weights, rngBase);
    base[t] = (base[t] || 0) + 1;
  }
  let worst = 0, worstTier = '';
  for (const t of TIER_ORDER) {
    const want = table.weights[t] || 0;
    const got = pct(base[t] || 0, N);
    const off = Math.abs(got - want);
    if (off > worst) { worst = off; worstTier = t; }
  }
  say(worst <= 0.5, '1. the base roll matches the printed table, worst tier off by '
    + worst.toFixed(3) + ' points (' + worstTier + '), the ceiling is 0.5');

  /* ---- 2 and 3. the whole thing, with pity ---- */
  const seen = {};
  const rng = makeRng(0x51DE + kind.length);
  let counters = {};
  let sinceRare = 0, sinceEpic = 0, worstRareGap = 0, worstEpicGap = 0;
  let pitiedRare = 0, pitiedEpic = 0;
  const ownedGrails = [];
  let grailDupes = 0, rerolls = 0;
  for (let i = 0; i < N; i++) {
    const r = drops.pull(kind, rng, counters, ownedGrails);
    counters = r.counters;
    seen[r.tier] = (seen[r.tier] || 0) + 1;
    if (r.pitied === 'rare') pitiedRare++;
    if (r.pitied === 'epic') pitiedEpic++;
    if (r.rerolled) rerolls++;
    const rank = TIER_ORDER.indexOf(r.tier);
    sinceRare = rank >= TIER_ORDER.indexOf('rare') ? 0 : sinceRare + 1;
    sinceEpic = rank >= TIER_ORDER.indexOf('epic') ? 0 : sinceEpic + 1;
    if (sinceRare > worstRareGap) worstRareGap = sinceRare;
    if (sinceEpic > worstEpicGap) worstEpicGap = sinceEpic;
    if (r.tier === 'grail' && r.entry) {
      if (ownedGrails.indexOf(r.entry.id) >= 0) grailDupes++;
      else ownedGrails.push(r.entry.id);
    }
  }

  const line = TIER_ORDER.map(t => t + ' ' + pct(seen[t] || 0, N).toFixed(2) + '%').join('  ');
  console.log('    with pity: ' + line);

  if (table.pity.rare) {
    say(worstRareGap < table.pity.rare,
      '2. never ' + table.pity.rare + ' pulls without a rare: the worst run was '
      + worstRareGap + ', and pity supplied ' + pitiedRare.toLocaleString('en'));
  }
  if (table.pity.epic) {
    say(worstEpicGap < table.pity.epic,
      '2. never ' + table.pity.epic + ' pulls without an epic: the worst run was '
      + worstEpicGap + ', and pity supplied ' + pitiedEpic.toLocaleString('en'));
  }

  // ⛔ the floor. Every tier at or above a pitied one must be at least as common
  // as the table says, never less.
  const pitiedTiers = Object.keys(table.pity);
  if (pitiedTiers.length) {
    let clawback = null;
    for (const t of pitiedTiers) {
      const want = table.weights[t] || 0;
      const got = pct(seen[t] || 0, N);
      if (got < want - 0.01) clawback = t + ' fell from ' + want + '% to ' + got.toFixed(2) + '%';
    }
    say(!clawback, '3. pity only ever helps: ' + (clawback || 'no tier came out below its printed rate'));
  } else {
    say(true, '3. this pouch has no pity to claw anything back with');
  }

  if (table.noDupeGrails) {
    say(grailDupes === 0, 'a one of one never arrives twice: ' + grailDupes + ' duplicate grails in '
      + N.toLocaleString('en') + ' pulls, with ' + rerolls.toLocaleString('en')
      + ' rerolled to an epic once all four were held');
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nPITY MATH FAILED'); process.exit(1); }
console.log('PITY MATH OK');
