#!/usr/bin/env node
// AURA OFF — ROSTER.md generator.
//
// Reads src/data/moves.js, src/data/packs.js and src/data/campaign.js and
// writes ROSTER.md.
// Nothing here is authored twice: every number, name, tier, pool size and drop
// on the page comes out of the data modules, so the documentation cannot drift
// away from the code. If a row in ROSTER.md is wrong, the data is wrong.
//
// The only prose this file owns is the small amount that describes MECHANICS
// rather than content — the "what the columns mean" notes and the one-line
// gloss on each quirk. Those are here, once, rather than being duplicated into
// twenty-five opponent records.
//
//   node tools/gen-docs.js            write ROSTER.md
//   node tools/gen-docs.js --check    exit 1 if ROSTER.md is stale, write nothing
//   node tools/gen-docs.js --stdout   print to stdout, write nothing
//
// Run it from anywhere: paths are resolved relative to this file.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

// BASE_MOVES, not MOVES. The doc must describe the game as it ships, and MOVES
// is a live binding that grows when a pack is owned — generating the roster
// from it would make ROSTER.md depend on who ran the generator. PACKS is read
// separately and gets its own section, because pack content is real content
// even when nobody has bought it.
import { BASE_MOVES as MOVES, PACKS, PACK_MOVES } from '../src/data/moves.js';
import {
  ACTS,
  OPPONENTS,
  FITS,
  STARTING_KIT,
  opponentsForAct
} from '../src/data/campaign.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'ROSTER.md');

/* -------------------------------------------------------------------------- */
/* PROSE THIS FILE OWNS                                                        */
/* -------------------------------------------------------------------------- */

// One line per quirk, describing what it DOES. Kept here because it is a rule
// of the engine, not a property of any one opponent.
const QUIRK_NOTES = {
  mirror: 'always reads your matchup',
  patient: 'dangerous from behind',
  frontrunner: 'runs away with it when ahead',
  punisher: 'makes you pay for repeating'
};

// The scoring mode, said in words. Derived from act.scoring, never hand-typed
// per act.
const SCORING_LABEL = {
  crowd: 'Crowd only',
  judges: 'Judges only',
  both: 'Crowd AND judges'
};

const EM = '—'; // em dash
const DASH = '—'; // the "no value" cell
const MID = '·'; // middle dot separator

/* -------------------------------------------------------------------------- */
/* SMALL HELPERS                                                               */
/* -------------------------------------------------------------------------- */

function pct(x) {
  return String(Math.round(x * 100));
}

function amp(x) {
  return Number(x).toFixed(2);
}

function skill(x) {
  return Number(x).toFixed(2);
}

/** Markdown table cells cannot contain a raw pipe. */
function cell(s) {
  return String(s === null || s === undefined ? DASH : s).replace(/\|/g, '\\|');
}

function table(headers, rows) {
  const head = '| ' + headers.join(' | ') + ' |';
  const rule = '|' + headers.map(function () { return '---'; }).join('|') + '|';
  const body = rows.map(function (r) { return '| ' + r.map(cell).join(' | ') + ' |'; });
  return [head, rule].concat(body).join('\n');
}

/** Sorted, de-duplicated list of every special actually used by a move. */
function specialsInUse(moves) {
  const seen = Object.create(null);
  moves.forEach(function (m) { if (m.special) seen[m.special] = true; });
  return Object.keys(seen).sort();
}

/* -------------------------------------------------------------------------- */
/* WHERE DOES A MOVE COME FROM                                                 */
/* -------------------------------------------------------------------------- */

/**
 * move id → the human-readable place you get it. Built from the campaign, so a
 * move that nobody drops and that is not in the starting kit comes back null
 * and gets counted as unreachable in the coverage block.
 */
function buildSourceIndex() {
  const actName = Object.create(null);
  ACTS.forEach(function (a) { actName[a.id] = a.name; });

  const src = Object.create(null);
  STARTING_KIT.forEach(function (id) { src[id] = '**starting move**'; });
  OPPONENTS.forEach(function (o) {
    if (!o.drop) return;
    if (src[o.drop]) return; // starting kit wins, and first drop wins a tie
    src[o.drop] = (actName[o.act] || o.act) + ' ' + EM + ' ' + o.name;
  });
  return src;
}

/* -------------------------------------------------------------------------- */
/* SECTIONS                                                                    */
/* -------------------------------------------------------------------------- */

function headerBlock() {
  return [
    '# Roster',
    '',
    '> Generated by `tools/gen-docs.js` from `src/data/moves.js`,',
    '> `src/data/packs.js` and `src/data/campaign.js`. **Do not edit by hand** ' + EM +
      ' every change here will be',
    '> overwritten. Change the data, then run `npm run docs`.',
    '>',
    '> Evidence tiers are defined in `AURA-BIBLE.md`: **V1** = documented by named',
    '> press inside a real aura battle, **V3** = our original design work.'
  ].join('\n');
}

function movesSection(source) {
  const rows = MOVES.map(function (m) {
    return [
      m.name,
      m.cat,
      m.tier,
      m.base,
      pct(m.up) + '/' + pct(m.lo),
      amp(m.idealAmp),
      m.special || DASH,
      source[m.id] || '**unreachable**'
    ];
  });

  return [
    '## Base moves ' + EM + ' ' + MOVES.length + ' total',
    '',
    table(
      ['Move', 'Cat', 'Tier', 'Base', 'Upper/Lower', 'Ideal amp', 'Special', 'Unlocked from'],
      rows
    ),
    '',
    '### What the columns mean',
    '',
    "- **Upper/Lower** " + EM + " how the move's motion is divided. Six-Seven is 100/0: the",
    '  legs are dead still, and that stillness is the whole trick. Aura Walk is 20/80.',
    '  Blending an upper-heavy move with a lower-heavy one scores far better than',
    '  stacking two of a kind.',
    '- **Ideal amp** ' + EM + ' the amplitude the crowd actually rewards. Score falls off on',
    '  **both sides**, harder above than below. FLEX wants restraint, BAIT wants full',
    '  commitment. See `engine/scoring.js:composure()`.',
    '- **Special** ' + EM + ' ' + specialsInUse(MOVES).join(', ')
  ].join('\n');
}

/**
 * One short machine-readable gloss per unlock condition. The `how` sentence is
 * the player-facing copy and lives in the data; this is the mechanic behind it,
 * so a reader can tell a flavour difference from a real one.
 */
function unlockCell(u) {
  if (!u) return DASH;
  if (u.on === 'pack') return 'with the pack';
  if (u.on === 'perform') return 'perform `' + u.after + '` ' + u.times + '×';
  if (u.on === 'crowd') {
    return 'crowd of ' + u.people + (u.after ? ' (after `' + u.after + '`)' : '');
  }
  return u.on;
}

function packsSection() {
  if (!PACKS.length) return ['## Packs ' + EM + ' none', '', 'No regional packs ship yet.'].join('\n');

  const out = [
    '## Packs ' + EM + ' ' + PACKS.length + ', ' + PACK_MOVES.length + ' moves',
    '',
    'Ownable sets layered on the base ' + MOVES.length + '. **Own none and everything above',
    'is exactly what ships** ' + EM + ' same deck, same unlock chain, same balance numbers.',
    'A pack adds range, never power: no pack move out-scores the best base move in its',
    'own category, or the best base move carrying the same special. Packs never unlock',
    'through the campaign ' + EM + ' beating an opponent is the base game\'s channel and all',
    'twenty-four drops are spoken for, so a pack opens up inside itself.',
    '',
    'Every pack move is **V3**. The scenes are documented; the gestures are ours.'
  ];

  PACKS.forEach(function (pk) {
    const rows = pk.moves.map(function (m) {
      return [
        m.name,
        m.cat,
        m.tier,
        m.base,
        pct(m.up) + '/' + pct(m.lo),
        amp(m.idealAmp),
        m.special || DASH,
        unlockCell(m.unlock)
      ];
    });

    out.push('');
    out.push('### ' + pk.name + ' ' + EM + ' ' + pk.region);
    out.push('');
    out.push('> ' + pk.blurb);
    out.push('');
    out.push('*' + pk.routeNote + '*');
    out.push('');
    out.push(table(
      ['Move', 'Cat', 'Tier', 'Base', 'Upper/Lower', 'Ideal amp', 'Special', 'Opens on'],
      rows
    ));
  });

  out.push('');
  out.push('**Not measured by the balance sim.** `test/balance-sim.js` plays the base ' +
    MOVES.length + ' only,');
  out.push('which is correct for the numbers it reports and means the anti-creep rules in');
  out.push('`test/validate.js` are the only thing holding pack power down. Extending the sim');
  out.push('to sweep pack ownership is open work.');

  return out.join('\n');
}

function fitsSection() {
  const rows = FITS.map(function (f) {
    return [f.name, sign(f.crowd), sign(f.judges), f.note || DASH];
  });
  return [
    '## Fits ' + EM + ' ' + FITS.length,
    '',
    'Chosen before the fight. A judge called a real winner on his shoes before he moved.',
    '',
    table(['Fit', 'Crowd', 'Judges', 'Note'], rows)
  ].join('\n');
}

function sign(n) {
  return (n >= 0 ? '+' : '') + n;
}

/** The bold "Scoring:" line under an act heading. */
function scoringLine(act) {
  const parts = [SCORING_LABEL[act.scoring] || act.scoring];
  if (act.repeatsPunished) parts.push('repeats punished');
  if (act.scoring === 'judges') parts.push(act.unstable ? 'the deck is moving' : 'composure over noise');

  const avg = opponentsForAct(act.id).reduce(function (s, o) { return s + o.skill; }, 0) /
    Math.max(1, opponentsForAct(act.id).length);

  let line = '**Scoring: ' + parts.join(' ' + MID + ' ') + '**';
  if (act.unstable) line += ' ' + MID + ' unstable ground';
  line += ' ' + MID + ' avg skill ' + skill(avg);
  return line;
}

function quirkCell(q) {
  if (!q) return DASH;
  const note = QUIRK_NOTES[q];
  return '`' + q + '`' + (note ? ' ' + EM + ' ' + note : '');
}

function opponentsSection() {
  const out = ['## Opponents ' + EM + ' ' + OPPONENTS.length + ' across ' + ACTS.length + ' acts'];

  ACTS.forEach(function (act) {
    const roster = opponentsForAct(act.id);
    const rows = roster.map(function (o) {
      return [
        o.name + (o.boss ? ' **(boss)**' : ''),
        skill(o.skill),
        quirkCell(o.quirk),
        o.pool.length + ' move' + (o.pool.length === 1 ? '' : 's'),
        o.drop || DASH
      ];
    });

    out.push('');
    out.push('### ' + act.name);
    out.push('');
    out.push('*' + act.setting + '* ' + EM + ' ' + act.teaches);
    out.push('');
    out.push(scoringLine(act));
    out.push('');
    out.push(table(['Opponent', 'Skill', 'Quirk', 'Pool', 'Drops'], rows));
  });

  return out.join('\n');
}

function quirksSection() {
  const used = Object.create(null);
  OPPONENTS.forEach(function (o) { if (o.quirk) used[o.quirk] = true; });

  // Contract order, filtered to what the campaign actually uses, then anything
  // the campaign uses that the contract did not list (so a new quirk shows up
  // here instead of silently vanishing).
  const order = ['mirror', 'patient', 'frontrunner', 'punisher'];
  const ids = order.filter(function (q) { return used[q]; })
    .concat(Object.keys(used).filter(function (q) { return order.indexOf(q) === -1; }).sort());

  const rows = ids.map(function (q) {
    const count = OPPONENTS.filter(function (o) { return o.quirk === q; }).length;
    return ['`' + q + '`', QUIRK_NOTES[q] || DASH, count];
  });

  return ['## Quirks', '', table(['Quirk', 'Effect', 'Carried by'], rows)].join('\n');
}

function coverageSection(source) {
  const cats = ['FLEX', 'FLOW', 'BAIT'];
  const catCounts = cats.map(function (c) {
    return c + ' ' + MOVES.filter(function (m) { return m.cat === c; }).length;
  });

  const tiers = ['V1', 'V3'];
  const tierCounts = tiers.map(function (t) {
    return t + ' ' + MOVES.filter(function (m) { return m.tier === t; }).length;
  });

  const unreachable = MOVES.filter(function (m) { return !source[m.id]; })
    .map(function (m) { return m.id; });

  const lines = [
    '## Coverage',
    '',
    '- Categories: ' + catCounts.join(' ' + MID + ' '),
    '- Evidence: ' + tierCounts.join(' ' + MID + ' '),
    '- Starting kit: ' + STARTING_KIT.join(', '),
    '- Unreachable moves: ' + (unreachable.length ? unreachable.join(', ') : 'none')
  ];

  // A move dropped by two different opponents is a content bug, not a rendering
  // one, but the roster is where you would notice it.
  const dropCount = Object.create(null);
  OPPONENTS.forEach(function (o) {
    if (o.drop) dropCount[o.drop] = (dropCount[o.drop] || 0) + 1;
  });
  const dupes = Object.keys(dropCount).filter(function (id) { return dropCount[id] > 1; }).sort();
  lines.push('- Duplicate drops: ' + (dupes.length ? dupes.join(', ') : 'none'));

  const bosses = OPPONENTS.filter(function (o) { return o.boss; }).length;
  lines.push('- Bosses: ' + bosses + ' ' + MID + ' rounds per battle: 9');

  if (PACKS.length) {
    lines.push('- Packs: ' + PACKS.length + ' ' + MID + ' ' +
      PACKS.map(function (p) { return p.name + ' (' + p.region + ', ' + p.moves.length + ')'; })
        .join(' ' + MID + ' '));
    lines.push('- Pack moves reachable from the campaign: none ' + MID +
      ' every pack opens up inside itself');
  }

  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* BUILD                                                                       */
/* -------------------------------------------------------------------------- */

export function renderRoster() {
  const source = buildSourceIndex();
  return [
    headerBlock(),
    movesSection(source),
    packsSection(),
    fitsSection(),
    opponentsSection(),
    quirksSection(),
    coverageSection(source)
  ].join('\n\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  const md = renderRoster();
  const shortPath = relative(process.cwd(), OUT) || 'ROSTER.md';

  if (args.indexOf('--stdout') !== -1) {
    process.stdout.write(md);
    return 0;
  }

  if (args.indexOf('--check') !== -1) {
    const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    if (current === md) {
      console.log('ROSTER.md is up to date (' + MOVES.length + ' base moves, ' +
        PACK_MOVES.length + ' pack moves, ' + OPPONENTS.length + ' opponents).');
      return 0;
    }
    console.error('ROSTER.md is STALE. Run `npm run docs`.');
    return 1;
  }

  writeFileSync(OUT, md, 'utf8');
  console.log(
    'wrote ' + shortPath + ' ' + EM + ' ' + MOVES.length + ' base moves, ' +
    PACKS.length + ' packs (' + PACK_MOVES.length + ' moves), ' +
    OPPONENTS.length + ' opponents, ' + ACTS.length + ' acts, ' + FITS.length + ' fits'
  );
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(main());
}
