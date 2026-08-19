/* Generate the definitive art asset list straight from the live game data
   in index.html (the source of truth — ASSET_MANIFEST.json goes stale when
   content changes). Outputs two files in the repo root:

     ART_CARDLIST.csv  — open in Google Drive → becomes a trackable Sheet
     ART_CARDLIST.md   — same data, readable at a glance

   Run:  node tools/cardlist.mjs
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = html.match(/<script>([\s\S]+?)<\/script>/)[1];

const stubs = `
  const document = { getElementById: () => ({ addEventListener:()=>{}, classList:{add:()=>{},remove:()=>{},contains:()=>false}, appendChild:()=>{}, setAttribute:()=>{}, getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), style:{}, innerHTML:'', textContent:'', onclick:null, dataset:{}, querySelector:()=>({}), querySelectorAll:()=>[] }), querySelectorAll:()=>[], createElement:()=>({style:{},classList:{add:()=>{}},dataset:{}}), body:{appendChild:()=>{}} };
  const window = { addEventListener:()=>{}, innerWidth:400 };
  const localStorage = { _s:{}, getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
  const navigator = { serviceWorker:null, vibrate:()=>{} };
  const setTimeout = ()=>{}; const clearTimeout = ()=>{}; const setInterval = ()=>{};
  const confirm = ()=>true; const performance = { now:()=>0 };
`;
const game = eval(`(function(){${stubs}${code}; return { RUNES, ENEMIES, NAMED_COMBOS, SIGILS };})()`);

// optional: existing art concepts (prompt text) keyed by slot id
let concepts = {};
try {
  const man = JSON.parse(fs.readFileSync(path.join(root, 'ASSET_MANIFEST.json'), 'utf8'));
  for (const cat of Object.values(man.categories || {}))
    for (const s of (cat.slots || [])) concepts[s.id] = s.concept || s.subject || s.notes || '';
} catch {}

const RARITY_DIM = { common:'512x512', uncommon:'512x512', rare:'512x512', mythic:'512x512' };
const rows = [];

// 1. the cards (runes)
for (const r of game.RUNES) {
  const slot = `rune-${r.id}`;
  rows.push({
    Category: 'CARD (rune)',
    Slot: `art-slots/${slot}.png`,
    Name: r.name,
    Element: r.element || '',
    Shape: r.shape || '',
    Rarity: r.rarity || '',
    Power: r.basePower != null ? r.basePower : '',
    Size: '512x512',
    Effect: (r.desc || '').replace(/\s+/g, ' ').trim(),
    ArtConcept: concepts[slot] || (concepts[slot] === '' ? '' : '⚠ NEW — no concept yet, needs art direction'),
    Status: '',
  });
}
// 2. enemies
for (const e of game.ENEMIES) {
  const slot = `enemy-${e.id}`;
  rows.push({
    Category: e.boss ? 'ENEMY (BOSS)' : 'ENEMY',
    Slot: `art-slots/${slot}.png`,
    Name: e.name,
    Element: '', Shape: '', Rarity: e.boss ? 'boss' : `tier ${e.tier||''}`,
    Power: `HP ${e.hp||''}`,
    Size: '512x512',
    Effect: `threat ${e.threat||''}${e.tag?` · tag ${e.tag}`:''}`,
    ArtConcept: concepts[slot] || '⚠ NEW — no concept yet',
    Status: '',
  });
}
// 3. branding
rows.push({ Category:'BRAND', Slot:'art-slots/title-mark.png', Name:'Title Mark', Element:'', Shape:'', Rarity:'', Power:'', Size:'1024x1024', Effect:'Game logo sigil, reads inside a circular gold frame', ArtConcept: concepts['title-mark']||'', Status:'' });
rows.push({ Category:'BRAND', Slot:'art-slots/icon-192.png', Name:'PWA Icon (small)', Element:'', Shape:'', Rarity:'', Power:'', Size:'192x192', Effect:'Home-screen icon — derive from title-mark', ArtConcept:'', Status:'' });
rows.push({ Category:'BRAND', Slot:'art-slots/icon-512.png', Name:'PWA Icon (large)', Element:'', Shape:'', Rarity:'', Power:'', Size:'512x512', Effect:'Splash/install icon — derive from title-mark', ArtConcept:'', Status:'' });

// ---- CSV ----
const cols = ['Category','Slot','Name','Element','Shape','Rarity','Power','Size','Effect','ArtConcept','Status'];
const esc = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v; };
const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => esc(r[c])).join(','))).join('\n');
fs.writeFileSync(path.join(root, 'ART_CARDLIST.csv'), csv + '\n');

// ---- Markdown ----
const cards = rows.filter(r => r.Category.startsWith('CARD'));
const byRar = {};
for (const c of cards) (byRar[c.Rarity] ||= []).push(c);
let md = `# Glyph Forge — Art Card List\n\n`;
md += `_Generated from index.html (source of truth). ${cards.length} rune cards · ${rows.length} total assets. Regenerate: \`node tools/cardlist.mjs\`._\n\n`;
md += `Drop finished art into \`art-slots/\` with the exact filename in the **Slot** column; it hot-loads live (graceful placeholder until then).\n\n`;
for (const rar of ['common','uncommon','rare','mythic']) {
  if (!byRar[rar]) continue;
  md += `## ${rar[0].toUpperCase()+rar.slice(1)} runes (${byRar[rar].length})\n\n`;
  md += `| Card | Slot file | Element · Shape | Pwr | Effect |\n|---|---|---|---|---|\n`;
  for (const c of byRar[rar]) md += `| ${c.Name} | \`${c.Slot}\` | ${c.Element} · ${c.Shape} | ${c.Power} | ${c.Effect} |\n`;
  md += `\n`;
}
const en = rows.filter(r => r.Category.startsWith('ENEMY'));
md += `## Enemies (${en.length})\n\n| Name | Slot file | Tier | ${''} |\n|---|---|---|---|\n`;
for (const c of en) md += `| ${c.Name} | \`${c.Slot}\` | ${c.Rarity} | ${c.Effect} |\n`;
md += `\n## Branding (3)\n\n| Asset | Slot file | Size |\n|---|---|---|\n`;
for (const c of rows.filter(r => r.Category==='BRAND')) md += `| ${c.Name} | \`${c.Slot}\` | ${c.Size} |\n`;
fs.writeFileSync(path.join(root, 'ART_CARDLIST.md'), md);

console.log(`Wrote ART_CARDLIST.csv + ART_CARDLIST.md — ${cards.length} cards, ${en.length} enemies, ${rows.length} assets total.`);
