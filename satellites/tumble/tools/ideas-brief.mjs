#!/usr/bin/env node
// IDEAS-BRIEF.md: ONE self contained document Stephen uploads to ChatGPT, Grok and the others to ask for ideas.
// The prose is tools/ideas-brief.head.md; Part 5 is generated from the game's own data here, so it is exact.
// (Tiny World's first outside answers proposed about thirty rows the engine could not load, because they were
// answering a summary. Never hand an outside model a summary of the data: hand it the data.)
//   node tools/ideas-brief.mjs            writes docs/IDEAS-BRIEF.md (and a .txt twin for phones that refuse .md)
// Regenerate after any change to data/, src/economy.js or engine/sockgen.js.
import { readFileSync, writeFileSync } from 'fs';
import { FIELDS, FAMILIES, MOTIFS, CUFFS, CONDITIONS } from '../engine/sockgen.js';
import { CAL } from '../src/economy.js';
import { RUSH } from '../src/session.js';
import { SIZES } from '../src/loadgen.js';
import { VERSION } from '../src/config.js';

const root = new URL('..', import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL('data/' + f, root), 'utf8'));
const U = read('unlocks.json').items, H = read('hero-socks.json'), C = read('clothesline.json'), L = read('lore.json');
const price = (c) => Object.entries(c || {}).map(([k, v]) => `${v} ${k === 'lint' ? 'Lint' : k === 'quarters' ? 'Quarters' : 'Reunions'}`).join(' + ') || 'free (you start with it)';
const look = (l) => Object.entries(l || {}).filter(([k]) => k !== 'url').map(([k, v]) => `${k} ${v}`).join(', ');
const cell = (s) => String(s == null ? '' : s).replace(/\|/g, '/').replace(/\n/g, ' ');
const out = [];
const P = (s = '') => out.push(s);

P('---');
P('# PART 5. THE DATA (generated from the game files, so it is exact)');
P();
P(`## 5.1 Everything a player can unlock today (${U.length} items). Do not propose these again.`);
const CATS = [['basket', 'Baskets'], ['dryer', 'Dryers'], ['decor', 'The room'], ['radio', 'Radio stations'], ['ball', 'Ball styles'], ['trail', 'Shot trails'], ['pack', 'Hero sock packs'], ['reunion', 'Things that arrive by Reunion, never bought']];
for (const [cat, title] of CATS) {
  const items = U.filter((i) => i.cat === cat);
  P();
  P(`### ${title} (${items.length})`);
  P();
  if (cat === 'decor') {
    const slots = [...new Set(items.map((i) => i.look.slot))];
    P('| slot | items (price in Lint) |'); P('|---|---|');
    for (const s of slots) P(`| \`${s}\` (${items.filter((i) => i.look.slot === s).length}) | ${items.filter((i) => i.look.slot === s).map((i) => `${cell(i.name)} (${i.cost.lint})`).join(' · ')} |`);
    P();
    P('Three of them in full, for the voice:');
    P();
    for (const i of [items.find((x) => x.look.slot === 'rug'), items.find((x) => x.look.slot === 'poster'), items.find((x) => x.look.slot === 'cat')].filter(Boolean)) P(`- **${i.name}** (${price(i.cost)}; ${look(i.look)}): ${i.desc}`);
    continue;
  }
  P('| name | price | look | what the player reads |'); P('|---|---|---|---|');
  for (const i of items) P(`| ${cell(i.name)} | ${price(i.cost)}${i.requires ? ', needs ' + i.requires : ''} | ${cell(look(i.look))} | ${cell(i.desc)} |`);
}
P();
P(`## 5.2 The hero socks that exist (${H.heroes.length}). Do not propose these again; match their voice.`);
for (const pk of H.packs) {
  const hs = H.heroes.filter((h) => h.pack === pk.id);
  P();
  P(`### ${pk.name} (${hs.length} socks${pk.cost ? ', ' + pk.cost + ' Quarters' : ', never sold'}): "${pk.blurb}"`);
  P();
  P('| sock | silhouette | rarity | flavor line |'); P('|---|---|---|---|');
  for (const h of hs) P(`| ${cell(h.name)} | ${h.silhouette} | ${h.rarity}${h.source && h.source !== 'pack' ? ' (' + h.source + ' only)' : ''} | ${cell(h.flavor)} |`);
}
P();
P('## 5.3 The Clothesline: pegs are earned by DOING, never bought');
P();
P('| peg | how it is earned | what it gives |'); P('|---|---|---|');
for (const p of C.pegs) P(`| ${cell(p.name)} | ${cell(p.hint)} | ${cell(p.effect)}${p.eyes ? ' **(an Eyes peg: each one raises the difficulty ceiling by one tier)**' : ''} |`);
P();
P(`The stats a peg can watch today: ${C.stats.map((s) => '`' + s + '`').join(' ')}.`);
P();
P('## 5.4 The economy, exactly as the code pays it');
P();
const sum = (k) => U.reduce((n, i) => n + ((i.cost || {})[k] || 0), 0), cnt = (k) => U.filter((i) => (i.cost || {})[k] !== undefined).length;
P(`- **Lint** per Load = ${CAL.lintPerPair} per matched pair, plus ${CAL.lintPerMade} per ball that lands in the basket, plus a tidiness bonus in Laundry Day (Spotless +${Math.round(CAL.tidy.spotless * 100)} percent, Tidy +${Math.round(CAL.tidy.tidy * 100)} percent) or, in Rush, 1 Lint per ${CAL.rushPointsPerLint} points. A Regular Load of ${SIZES.regular} pairs pays about 40 to 80. The design target: a relaxed player doing three Regular Loads a day earns about 200 Lint.`);
P('- **Quarters** per Load = **1 for a Clean Load** (when the Load ends, every ball is in the basket and none is left on the floor; a missed ball can be picked up and thrown again) **plus 1 for a Spotless Load** (Laundry Day only: ZERO missed shots in the whole Load AND every inside out sock flipped before it was balled). So 0, 1 or 2 a Load, and nothing else in the game pays a Quarter. The design target was about 3 a day. The director, playing it: "we dont seem to get quarters."');
P(`- **Reunions**: one each time an odd sock from the Odd Bin finds its mate in a later Load. Impossible socks arrive at ${CAL.impossibleAt.join(', ')} Reunions.`);
P(`- **What it all costs**: ${cnt('lint')} things priced in Lint, ${sum('lint').toLocaleString('en-US')} Lint in all (about ${Math.round(sum('lint') / 200)} days at the target). ${cnt('quarters')} things priced in Quarters, **${sum('quarters')} Quarters in all**: the dryers ${U.filter((i) => i.cat === 'dryer' && i.cost.quarters).map((i) => i.cost.quarters).join(', ')} and ${U.filter((i) => i.cat === 'pack').length} hero packs at ${U.find((i) => i.cat === 'pack').cost.quarters} each. ${cnt('reunions')} things arrive by Reunions alone, the last at ${Math.max(...U.map((i) => (i.cost || {}).reunions || 0))}.`);
P(`- **Loads**: ${Object.entries(SIZES).map(([k, v]) => `${k} ${v} pairs`).join(', ')}. Regular opens after 5 Loads, Heavy after 20, Mountain after 50. Difficulty runs from tier 0 to tier 8: more decoys, and more socks inside out (up to 40 percent).`);
P(`- **Rush powers** cost streak dots, never money: ${Object.entries(RUSH.powers).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
P();
P(`## 5.5 The story so far: ${L.pages.length} pages from the Odd Bin, in the socks' own voice`);
P();
P('| page | arrives at | title | who is talking |'); P('|---|---|---|---|');
for (const p of L.pages) P(`| ${p.id} | ${p.at} Reunions | ${cell(p.title)} | ${cell(p.speaker)} |`);
P();
P(`The first page, so you can hear it: "${cell((L.pages[0].body || []).join(' ')).slice(0, 420)}..."`);
P();
P('## 5.6 The procedural sock: nine fields, and what is full');
P();
P('| field | bits | values | room left |'); P('|---|---|---|---|');
const used = { silhouette: 8, patternFamily: FAMILIES.length, cuffStyle: CUFFS.length, condition: CONDITIONS.length };
for (const f of FIELDS) { const max = 1 << f.bits, u = used[f.key]; P(`| \`${f.key}\` | ${f.bits} | ${max} | ${u ? (max - u ? `**${max - u} free** (${u} used)` : 'FULL, frozen') : f.key === 'motif' ? 'FULL, frozen (32 shapes x mirror x density)' : 'a number, not a list'} |`); }
P();
P(`- **Pattern families (${FAMILIES.length} of 16):** ${FAMILIES.join(', ')}.`);
P(`- **Motif shapes (32, frozen):** ${MOTIFS.join(', ')}.`);
P(`- **Cuffs (8, frozen):** ${CUFFS.join(', ')}.`);
P(`- **Conditions (4, frozen):** ${CONDITIONS.join(', ')}. Any sock may also arrive inside out.`);
P('- **Silhouettes (8, frozen; each is a real 3D model):** ankle, crew, knee, dress, toe, slipper, baby, novelty.');
P('- A **decoy** is a real sock with ONE field changed: the palette a few steps round the wheel, the stripe rhythm, a mirrored motif, the heel and toe contrast, the silhouette. Telling a twin from a decoy IS the game.');
P();

const head = readFileSync(new URL('tools/ideas-brief.head.md', root), 'utf8').replace('{{STAMP}}', process.env.STAMP || VERSION);
const doc = head.trimEnd() + '\n\n' + out.join('\n') + '\n';
writeFileSync(new URL('docs/IDEAS-BRIEF.md', root), doc);
writeFileSync(new URL('docs/IDEAS-BRIEF.txt', root), doc);
// The copy a PHONE can save: /dl/TUMBLE-IDEAS-BRIEF.md is served as an attachment (the repo's .htaccess matches the
// name). A plain .md URL opens as a page on a phone and cannot be saved (Stephen, Sep 21 2026).
writeFileSync(new URL('../../dl/TUMBLE-IDEAS-BRIEF.md', root), doc);
console.log(`docs/IDEAS-BRIEF.md written: ${doc.length} characters, ${doc.split('\n').length} lines, ${U.length} items, ${H.heroes.length} heroes, ${C.pegs.length} pegs`);
