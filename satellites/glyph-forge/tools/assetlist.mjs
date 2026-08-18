/* Generate the COMPLETE art asset list straight from the live game data in
   index.html (the source of truth). Covers every visual category — runes,
   enemies, relics (incl. hidden transmutation rewards), sigils, champions,
   transmutation triads, plus the static UI / background / logo assets.

   Outputs in the repo root:
     ART_ASSETLIST.md   — readable, grouped by category
     ART_ASSETLIST.csv  — one row per asset (open in Drive → becomes a Sheet)

   Run:  node tools/assetlist.mjs
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = [...html.matchAll(/<script>([\s\S]+?)<\/script>/g)]
  .map(m => m[1]).find(b => /\bRUNES\s*=/.test(b));

const stubs = `
  const document = { getElementById: () => ({ addEventListener:()=>{}, classList:{add:()=>{},remove:()=>{},contains:()=>false}, appendChild:()=>{}, setAttribute:()=>{}, getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), style:{}, innerHTML:'', textContent:'', onclick:null, dataset:{}, querySelector:()=>({}), querySelectorAll:()=>[] }), querySelectorAll:()=>[], createElement:()=>({style:{},classList:{add:()=>{}},dataset:{}}), body:{appendChild:()=>{}} };
  const window = { addEventListener:()=>{}, innerWidth:400 };
  const localStorage = { _s:{}, getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
  const navigator = { serviceWorker:null, vibrate:()=>{} };
  const setTimeout = ()=>{}; const clearTimeout = ()=>{}; const setInterval = ()=>{};
  const confirm = ()=>true; const performance = { now:()=>0 };
`;
const G = eval(`(function(){${stubs}${code}; return { RUNES, ENEMIES, RELICS, SIGILS, CHAMPIONS, TRANSMUTATIONS };})()`);

const clean = s => (s == null ? '' : String(s).replace(/\s+/g, ' ').trim());
const rows = [];   // {category, slot, filename, name, meta, dimensions, brief}
const add = (category, slot, name, meta, dimensions, brief) =>
  rows.push({ category, slot, filename: slot + '.png', name: clean(name), meta: clean(meta), dimensions, brief: clean(brief) });

// Shared per-category style cue (kept out of every row to keep the sheet lean —
// see the "Style" note at the top of each category section instead).
const STYLE = 'illuminated-manuscript, aged parchment, gold-and-ink';

// 1. RUNES — the cards
for (const r of G.RUNES)
  add('Rune card', `rune-${r.id}`, r.name,
      `${r.element} · ${r.shape} · ${r.rarity}${r.starter ? ' · starter' : ''} · glyph ${r.glyph || ''}`,
      '512x512 (in 5:7 card)',
      `${r.desc || `A ${r.element}/${r.shape} rune.`} ${r.element}-palette glow.`);

// 2. ENEMIES — portraits (round crop)
for (const e of G.ENEMIES)
  add('Enemy portrait', `enemy-${e.id}`, e.name,
      `tier ${e.tier} · ${e.tag}${e.armor ? ' · armored' : ''}${e.boss ? ' · BOSS' : ''} · glyph ${e.glyph || ''}`,
      e.boss ? '1024² round' : '512² round',
      `${e.desc || ''} ${e.tag} mood${e.boss ? ', imposing final-boss presence' : ''}.`);

// 3. RELICS — offered + hidden transmutation rewards
for (const r of G.RELICS)
  add(r.hidden ? 'Relic (transmutation reward)' : 'Relic', `relic-${r.id}`, r.name,
      `${r.rarity}${r.hidden ? ' · hidden reward' : ''}`,
      '256² icon',
      `${r.desc || ''} Ornate artifact icon, rarity-tinted frame.`);

// 4. SIGILS — the run-start bonds
for (const s of G.SIGILS) {
  const meta = [s.blessed && `blesses ${s.blessed}`, s.sealed && `seals ${s.sealed}`].filter(Boolean).join(' · ');
  add('Sigil', `sigil-${s.id}`, s.name, meta || (s.rarity || ''),
      '512² emblem',
      `${s.desc || s.blurb || ''} Heraldic bond-emblem, wax-seal feel.`);
}

// 5. CHAMPIONS — meta-progression avatars (CHAMPIONS may be an object map)
const champs = Array.isArray(G.CHAMPIONS) ? G.CHAMPIONS : Object.entries(G.CHAMPIONS || {}).map(([id, c]) => ({ id, ...c }));
for (const c of champs)
  add('Champion', `champion-${c.id}`, c.name || c.id, clean(c.desc || c.blurb || ''),
      '512² portrait',
      `Patron avatar, half-length heraldic portrait.`);

// 6. TRANSMUTATION triads — the fusion chase art
for (const t of G.TRANSMUTATIONS)
  add('Transmutation crest', `tx-${(t.id || '').replace(/^tx-/, '')}`, t.name || t.id,
      `triad: ${(t.members || []).join(' + ')}`,
      '512² crest',
      `Fused crest of ${(t.members || []).join(' + ')}; radiant, "ascended".`);

// 7. STATIC — logo, frames, backgrounds, HUD icons (not data-driven)
const STATIC = [
  ['Logo',        'title-mark',      'Title Mark',        '1024x1024 (transparent)', 'Central ritual mark / logo sigil; reads at 200px inside a gold circle; dramatic, symmetrical, mystical.'],
  ['Background',  'bg-tier1',        'Biome — Threshold', '1080x1920 (portrait)',    'Tier-1 backdrop: a candlelit scriptorium threshold. Dark, warm, low detail so the card UI reads on top.'],
  ['Background',  'bg-tier2',        'Biome — The Deeps',  '1080x1920 (portrait)',    'Tier-2 backdrop: flooded lower stacks / drowned library. Cool teal, moody.'],
  ['Background',  'bg-tier3',        'Biome — The Works',  '1080x1920 (portrait)',    'Tier-3 backdrop: brass clockwork archive. Amber, ordered, ominous.'],
  ['Background',  'bg-boss',         'Biome — The Signatory', '1080x1920 (portrait)', 'Boss backdrop for The Sovereign: a vast void-lit contract chamber. Purple-black, awe.'],
  ['Card frame',  'frame-common',    'Card Frame — Common',   '512x716 (9-slice)',  'Parchment 5:7 card border, restrained.'],
  ['Card frame',  'frame-uncommon',  'Card Frame — Uncommon', '512x716 (9-slice)',  'As common with a verdigris accent.'],
  ['Card frame',  'frame-rare',      'Card Frame — Rare',     '512x716 (9-slice)',  'As common with a violet accent + subtle filigree.'],
  ['Card frame',  'frame-mythic',    'Card Frame — Mythic',   '512x716 (9-slice)',  'Ornate gold frame, animated-glow ready.'],
  ['UI icon',     'ui-hp',           'HUD — Health',      '64x64 (transparent)', 'Heart / life-glyph for the HP readout.'],
  ['UI icon',     'ui-fluency',      'HUD — Fluency',     '64x64 (transparent)', 'The ✦ fluency mark (stacking damage boost).'],
  ['UI icon',     'ui-armor',        'HUD — Armor',       '64x64 (transparent)', 'The ⛊ armor/ward shield used in enemy + breakdown UI.'],
  ['UI icon',     'ui-intent-attack','Intent — Attack',   '64x64 (transparent)', 'Enemy ATTACK telegraph glyph.'],
  ['UI icon',     'ui-intent-charge','Intent — Charge',   '64x64 (transparent)', 'Enemy CHARGING→UNLEASH telegraph glyph.'],
  ['UI icon',     'ui-intent-mend',  'Intent — Mend',     '64x64 (transparent)', 'Enemy MEND (heals + strikes) telegraph glyph.'],
];
for (const [cat, slot, name, dim, brief] of STATIC) add(cat, slot, name, '', dim, brief);

// ---- write CSV ----
const esc = v => `"${String(v).replace(/"/g, '""')}"`;
const header = ['Category', 'Asset slot / id', 'Filename', 'Name', 'Details', 'Dimensions', 'Art brief', 'Status'];
const csv = [header.map(esc).join(',')]
  .concat(rows.map(r => [r.category, r.slot, r.filename, r.name, r.meta, r.dimensions, r.brief, 'TODO'].map(esc).join(',')))
  .join('\n');
fs.writeFileSync(path.join(root, 'ART_ASSETLIST.csv'), csv);

// ---- write Markdown ----
const byCat = {};
for (const r of rows) (byCat[r.category] ||= []).push(r);
let md = `# Glyph Forge — Complete Art Asset List\n\n`;
md += `Generated from the live game data in \`index.html\` via \`node tools/assetlist.mjs\`. `;
md += `**${rows.length} assets** across ${Object.keys(byCat).length} categories.\n\n`;
md += `Drop finished art into \`/art-slots/\` using the **Filename** column — the game auto-loads \`art-slots/{slot}.png\` wherever that \`data-art-slot\` appears. Keep one consistent palette per category (illuminated-manuscript / aged-parchment / gold-and-ink).\n\n`;
md += `| # | Category | Count |\n|--:|---|--:|\n`;
Object.entries(byCat).forEach(([c, list], i) => { md += `| ${i + 1} | ${c} | ${list.length} |\n`; });
md += `\n---\n`;
for (const [cat, list] of Object.entries(byCat)) {
  md += `\n## ${cat} (${list.length})\n\n`;
  md += `| Filename | Name | Details | Dimensions | Art brief |\n|---|---|---|---|---|\n`;
  for (const r of list)
    md += `| \`${r.filename}\` | **${r.name}** | ${r.meta} | ${r.dimensions} | ${r.brief} |\n`;
}
fs.writeFileSync(path.join(root, 'ART_ASSETLIST.md'), md);

console.log(`Wrote ART_ASSETLIST.md + ART_ASSETLIST.csv — ${rows.length} assets:`);
for (const [c, list] of Object.entries(byCat)) console.log(`  ${list.length.toString().padStart(3)}  ${c}`);
