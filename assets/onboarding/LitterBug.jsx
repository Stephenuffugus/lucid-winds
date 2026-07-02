import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, BookOpen, Trash2, FlaskConical, Search, X } from 'lucide-react';

/* ============================================================
   LITTER BUG — prototype v0.1
   ------------------------------------------------------------
   HOW TO ADD CONTENT (the whole point of this architecture):

   1. Add a new trash item -> push into TRASH_ITEMS below.
      Just needs: id, name, icon (emoji for now / swap to art),
      and 2-4 "tags". Tags are the secret sauce.

   2. Add a signature bug -> push into SIGNATURE_RECIPES.
      Explicit input pair -> bug id. These are the hand-crafted
      "hero" bugs people screenshot and post.

   3. Everything else -> emerges automatically.
      Any item-pair without an explicit recipe gets a procedural
      bug generated from the combined tag set. This is how you
      scale to 1000+ trash items without writing 500k recipes.
   ============================================================ */

// ────────────────────────────────────────────────────────────
// DATA LAYER  (this is what you'll be expanding to 1000+)
// ────────────────────────────────────────────────────────────

const TRASH_ITEMS = {
  banana_peel:    { name: 'Banana Peel',      icon: '🍌', tags: ['organic', 'soft', 'slippery'] },
  bottle_cap:     { name: 'Bottle Cap',       icon: '🔘', tags: ['metal', 'small', 'round'] },
  cig_butt:       { name: 'Cigarette Butt',   icon: '🚬', tags: ['organic', 'smoky', 'tiny'] },
  pizza_crust:    { name: 'Pizza Crust',      icon: '🍕', tags: ['organic', 'crusty', 'savory'] },
  coffee_cup:     { name: 'Coffee Cup',       icon: '☕', tags: ['paper', 'stained', 'warm'] },
  plastic_straw:  { name: 'Plastic Straw',    icon: '🥤', tags: ['plastic', 'long', 'hollow'] },
  newspaper:      { name: 'Crumpled News',    icon: '📰', tags: ['paper', 'inky', 'soft'] },
  broken_bulb:    { name: 'Broken Bulb',      icon: '💡', tags: ['glass', 'sharp', 'electric'] },
  lone_sock:      { name: 'Lone Sock',        icon: '🧦', tags: ['fabric', 'soft', 'stinky'] },
  dead_battery:   { name: 'Dead Battery',     icon: '🔋', tags: ['metal', 'electric', 'toxic'] },
  tin_can:        { name: 'Tin Can',          icon: '🥫', tags: ['metal', 'hollow', 'sharp'] },
  receipt:        { name: 'Faded Receipt',    icon: '🧾', tags: ['paper', 'inky', 'tiny'] },
  apple_core:     { name: 'Apple Core',       icon: '🍎', tags: ['organic', 'sweet', 'seedy'] },
  tea_bag:        { name: 'Used Tea Bag',     icon: '🫖', tags: ['organic', 'wet', 'stained'] },
  candy_wrapper:  { name: 'Candy Wrapper',    icon: '🍬', tags: ['plastic', 'shiny', 'sweet'] },
  eggshell:       { name: 'Eggshell',         icon: '🥚', tags: ['organic', 'fragile', 'pale'] },
  soda_can:       { name: 'Soda Can',         icon: '🥤', tags: ['metal', 'hollow', 'sweet'] },
  gum_wad:        { name: 'Chewed Gum',       icon: '🩷', tags: ['organic', 'sticky', 'sweet'] },
  foil_scrap:     { name: 'Foil Scrap',       icon: '✨', tags: ['metal', 'shiny', 'crinkly'] },
  cardboard:      { name: 'Wet Cardboard',    icon: '📦', tags: ['paper', 'wet', 'crusty'] },
};

const SIGNATURE_RECIPES = [
  { inputs: ['banana_peel', 'bottle_cap'],   bug: 'slipbeetle' },
  { inputs: ['cig_butt', 'dead_battery'],    bug: 'smogfly' },
  { inputs: ['pizza_crust', 'cardboard'],    bug: 'crustcrawler' },
  { inputs: ['coffee_cup', 'tea_bag'],       bug: 'caffeinemoth' },
  { inputs: ['plastic_straw', 'gum_wad'],    bug: 'strawworm' },
  { inputs: ['newspaper', 'receipt'],        bug: 'inkmite' },
  { inputs: ['broken_bulb', 'foil_scrap'],   bug: 'lampbeetle' },
  { inputs: ['lone_sock', 'apple_core'],     bug: 'sockroach' },
  { inputs: ['dead_battery', 'tin_can'],     bug: 'voltworm' },
  { inputs: ['eggshell', 'candy_wrapper'],   bug: 'yolkmite' },
  { inputs: ['soda_can', 'plastic_straw'],   bug: 'sodacicada' },
  { inputs: ['foil_scrap', 'broken_bulb'],   bug: 'glintfly' },
];

const SIGNATURE_BUGS = {
  slipbeetle:    { name: 'Slipbeetle',    icon: '🪲', rarity: 'common',   desc: 'A nervous fellow with metallic carapace. Skitters on potassium-slick legs.' },
  smogfly:       { name: 'Smogfly',       icon: '🪰', rarity: 'uncommon', desc: 'Wings shimmer with battery acid. Leaves a faint tar trail. Cough not at it.' },
  crustcrawler:  { name: 'Crustcrawler',  icon: '🐛', rarity: 'common',   desc: 'Lives in the seams of soggy boxes. Surprisingly affectionate. Smells faintly of pepperoni.' },
  caffeinemoth:  { name: 'Caffeinemoth',  icon: '🦋', rarity: 'uncommon', desc: 'Vibrates at 4am. Drawn to anything warm and bitter. Powdered with stale espresso.' },
  strawworm:     { name: 'Strawworm',     icon: '🪱', rarity: 'common',   desc: 'A tubular grub that breathes through one nostril. Sticky end, hollow middle.' },
  inkmite:       { name: 'Inkmite',       icon: '🦟', rarity: 'common',   desc: 'Writes microscopic gossip on leaves. Hates being misquoted.' },
  lampbeetle:    { name: 'Lampbeetle',    icon: '🐞', rarity: 'rare',     desc: 'Bioluminescent at the worst times. Shards of bulb form a crown. Photogenic.' },
  sockroach:     { name: 'Sockroach',     icon: '🪳', rarity: 'common',   desc: 'You do not want this one. Yes you do. No you don\'t. Yes.' },
  voltworm:      { name: 'Voltworm',      icon: '⚡', rarity: 'rare',     desc: 'A live wire with legs. Tingles to hold. Definitely do not lick.' },
  yolkmite:      { name: 'Yolkmite',      icon: '🐣', rarity: 'uncommon', desc: 'A confused baby. Half shell, half candy. Smells like Easter morning.' },
  sodacicada:    { name: 'Sodacicada',    icon: '🦗', rarity: 'uncommon', desc: 'Hums at the pitch of a freshly opened can. Carbonated abdomen.' },
  glintfly:      { name: 'Glintfly',      icon: '✨', rarity: 'rare',     desc: 'Pure reflection. You can never see it directly, only its dazzle.' },
};

// ────────────────────────────────────────────────────────────
// PROCEDURAL BUG GENERATION  (the "1000+ items" trick)
// Any item pair without a signature recipe gets a procedurally
// named bug derived from the combined tag set. Deterministic
// (same inputs always produce the same bug), so it feels like
// "real" discovery, not random slop.
// ────────────────────────────────────────────────────────────

const TAG_PREFIXES = {
  organic: 'Mold', metal: 'Rust', plastic: 'Synth', paper: 'Pulp', glass: 'Glint',
  fabric: 'Lint', wet: 'Drip', sharp: 'Spike', soft: 'Squish', shiny: 'Gleam',
  hollow: 'Echo', tiny: 'Mite', round: 'Orb', long: 'Snake', smoky: 'Ash',
  electric: 'Volt', toxic: 'Bile', stained: 'Splotch', sweet: 'Sugar',
  savory: 'Brine', sticky: 'Tack', slippery: 'Slick', crusty: 'Crust',
  inky: 'Quill', warm: 'Ember', fragile: 'Husk', pale: 'Bone', stinky: 'Whiff',
  seedy: 'Pip', crinkly: 'Crinkle',
};
const BUG_SUFFIXES = ['fly', 'beetle', 'mite', 'moth', 'worm', 'roach', 'gnat', 'wasp', 'cicada', 'tick'];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateProceduralBug(id1, id2) {
  const [a, b] = [id1, id2].sort();
  const key = `proc_${a}__${b}`;
  const tags = [...new Set([...TRASH_ITEMS[a].tags, ...TRASH_ITEMS[b].tags])];
  const h = hashCode(key);
  const prefix = TAG_PREFIXES[tags[h % tags.length]] || 'Odd';
  const suffix = BUG_SUFFIXES[h % BUG_SUFFIXES.length];
  const icon = ['🐜','🦟','🪲','🪳','🪰','🦗','🕷️','🪱','🐛','🦋'][h % 10];
  const rarity = h % 20 === 0 ? 'rare' : h % 5 === 0 ? 'uncommon' : 'common';
  return {
    id: key,
    name: `${prefix}${suffix}`,
    icon,
    rarity,
    desc: `An unclassified hybrid born of ${TRASH_ITEMS[a].name.toLowerCase()} and ${TRASH_ITEMS[b].name.toLowerCase()}. Field notes pending.`,
    procedural: true,
  };
}

function findBugForCombo(id1, id2) {
  if (!id1 || !id2) return null;
  const match = SIGNATURE_RECIPES.find(r =>
    (r.inputs[0] === id1 && r.inputs[1] === id2) ||
    (r.inputs[0] === id2 && r.inputs[1] === id1)
  );
  if (match) return { id: match.bug, ...SIGNATURE_BUGS[match.bug], procedural: false };
  return generateProceduralBug(id1, id2);
}

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

export default function LitterBug() {
  const [inventory, setInventory] = useState({ banana_peel: 2, bottle_cap: 2, coffee_cup: 1 });
  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);
  const [discoveredBugs, setDiscoveredBugs] = useState({}); // id -> bug
  const [view, setView] = useState('lab'); // 'lab' | 'bugdex'
  const [lastResult, setLastResult] = useState(null);
  const [forageFlash, setForageFlash] = useState(false);
  const [log, setLog] = useState([
    { id: 1, text: 'Begin field study. The alley awaits.', kind: 'note' },
  ]);

  const trashIds = Object.keys(TRASH_ITEMS);
  const inventoryList = Object.entries(inventory).filter(([, c]) => c > 0);

  function pushLog(text, kind = 'note') {
    setLog(l => [{ id: Date.now() + Math.random(), text, kind }, ...l].slice(0, 6));
  }

  function forage() {
    const drops = 1 + Math.floor(Math.random() * 3);
    const found = [];
    const next = { ...inventory };
    for (let i = 0; i < drops; i++) {
      const id = trashIds[Math.floor(Math.random() * trashIds.length)];
      next[id] = (next[id] || 0) + 1;
      found.push(TRASH_ITEMS[id].name);
    }
    setInventory(next);
    setForageFlash(true);
    setTimeout(() => setForageFlash(false), 600);
    pushLog(`Scrounged: ${found.join(', ')}`, 'forage');
  }

  function placeInSlot(id) {
    if (!inventory[id]) return;
    if (slot1 === null) setSlot1(id);
    else if (slot2 === null) setSlot2(id);
    else return; // both full
  }

  function clearSlot(which) {
    if (which === 1) setSlot1(null);
    else setSlot2(null);
  }

  function combine() {
    if (!slot1 || !slot2) return;
    const bug = findBugForCombo(slot1, slot2);
    const bugId = bug.id || bug.name;
    const isNew = !discoveredBugs[bugId];

    // consume the two trash items
    const next = { ...inventory };
    next[slot1] = Math.max(0, (next[slot1] || 0) - 1);
    next[slot2] = Math.max(0, (next[slot2] || 0) - 1);
    setInventory(next);

    // record discovery
    setDiscoveredBugs(d => ({ ...d, [bugId]: { ...bug, id: bugId } }));
    setLastResult({ ...bug, id: bugId, isNew });
    pushLog(
      isNew ? `New species! ${bug.name} catalogued.` : `Bred another ${bug.name}.`,
      isNew ? 'discovery' : 'forage'
    );

    setSlot1(null);
    setSlot2(null);
  }

  const totalSignature = Object.keys(SIGNATURE_BUGS).length;
  const discoveredSignature = Object.values(discoveredBugs).filter(b => !b.procedural).length;

  return (
    <div className="lb-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Nunito:wght@400;600;800&display=swap');

        .lb-root {
          --paper: #f3ead4;
          --paper-shadow: #e6d9b8;
          --ink: #2a2018;
          --ink-soft: #5a4a36;
          --moss: #4a6741;
          --moss-deep: #2f4a2a;
          --rust: #b85433;
          --rust-deep: #8a3a20;
          --gold: #c89a3a;
          --cream: #faf3df;
          font-family: 'Nunito', system-ui, sans-serif;
          color: var(--ink);
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 20% 10%, rgba(184,84,51,0.08), transparent 50%),
            radial-gradient(ellipse at 80% 90%, rgba(74,103,65,0.10), transparent 50%),
            var(--paper);
          background-attachment: fixed;
          position: relative;
          padding: 1.5rem 1rem 4rem;
        }
        .lb-root::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(42,32,24,0.12) 1px, transparent 0);
          background-size: 4px 4px;
          opacity: 0.4;
          mix-blend-mode: multiply;
          z-index: 0;
        }
        .lb-root > * { position: relative; z-index: 1; }

        .lb-header {
          text-align: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 2px dashed var(--ink-soft);
        }
        .lb-title {
          font-family: 'Fraunces', serif;
          font-weight: 800;
          font-size: clamp(2.2rem, 7vw, 3.4rem);
          letter-spacing: -0.02em;
          line-height: 0.95;
          margin: 0;
          color: var(--moss-deep);
        }
        .lb-title em {
          font-style: italic;
          color: var(--rust);
          font-weight: 600;
        }
        .lb-subtitle {
          font-family: 'Caveat', cursive;
          font-size: 1.4rem;
          color: var(--ink-soft);
          margin: 0.25rem 0 0;
          transform: rotate(-1deg);
          display: inline-block;
        }

        .lb-tabs {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin: 1rem 0 1.5rem;
        }
        .lb-tab {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.5rem 1rem;
          border: 2px solid var(--ink);
          background: var(--cream);
          color: var(--ink);
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .lb-tab:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--ink); }
        .lb-tab.active {
          background: var(--moss);
          color: var(--cream);
          border-color: var(--moss-deep);
          box-shadow: 2px 2px 0 var(--moss-deep);
        }

        .lb-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 820px) {
          .lb-grid { grid-template-columns: 1.1fr 1fr; }
        }

        .lb-panel {
          background: var(--cream);
          border: 2px solid var(--ink);
          border-radius: 12px;
          padding: 1rem 1.1rem;
          box-shadow: 4px 4px 0 var(--ink);
          position: relative;
        }
        .lb-panel-title {
          font-family: 'Fraunces', serif;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--moss-deep);
        }
        .lb-panel-title small {
          font-family: 'Caveat', cursive;
          font-weight: 400;
          font-size: 1.05rem;
          color: var(--ink-soft);
          text-transform: none;
          letter-spacing: 0;
          margin-left: auto;
        }

        .lb-forage {
          width: 100%;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 1.05rem;
          padding: 0.85rem 1rem;
          background: var(--rust);
          color: var(--cream);
          border: 2px solid var(--rust-deep);
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 3px 3px 0 var(--rust-deep);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .lb-forage:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--rust-deep); }
        .lb-forage:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--rust-deep); }
        .lb-forage.flash { animation: lb-shake 0.5s ease; }
        @keyframes lb-shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-3px) rotate(-1deg); }
          75% { transform: translateX(3px) rotate(1deg); }
        }

        .lb-inv {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 0.5rem;
        }
        .lb-inv-item {
          background: var(--paper);
          border: 1.5px solid var(--ink-soft);
          border-radius: 8px;
          padding: 0.5rem 0.25rem;
          cursor: pointer;
          text-align: center;
          position: relative;
          transition: all 0.1s ease;
        }
        .lb-inv-item:hover {
          background: var(--gold);
          border-color: var(--ink);
          transform: translateY(-2px);
        }
        .lb-inv-item:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }
        .lb-inv-icon { font-size: 1.6rem; line-height: 1; }
        .lb-inv-name {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--ink-soft);
          margin-top: 0.2rem;
          line-height: 1.1;
        }
        .lb-inv-count {
          position: absolute;
          top: -6px; right: -6px;
          background: var(--moss-deep);
          color: var(--cream);
          font-family: 'Fraunces', serif;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 0.05rem 0.4rem;
          border-radius: 999px;
          border: 1.5px solid var(--cream);
        }
        .lb-empty {
          padding: 1rem;
          text-align: center;
          font-family: 'Caveat', cursive;
          font-size: 1.15rem;
          color: var(--ink-soft);
        }

        .lb-incubator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 0.5rem;
          background:
            repeating-linear-gradient(
              45deg,
              var(--paper) 0 8px,
              var(--paper-shadow) 8px 9px
            );
          border-radius: 10px;
          border: 2px dashed var(--moss-deep);
          margin-bottom: 0.75rem;
        }
        .lb-slot {
          width: 78px; height: 78px;
          border: 2px dashed var(--ink-soft);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.2rem;
          background: var(--cream);
          position: relative;
          cursor: pointer;
        }
        .lb-slot.empty {
          font-family: 'Caveat', cursive;
          font-size: 1rem;
          color: var(--ink-soft);
        }
        .lb-slot-x {
          position: absolute; top: 4px; right: 4px;
          background: var(--rust); color: var(--cream);
          border: none; border-radius: 999px;
          width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .lb-plus {
          font-family: 'Fraunces', serif;
          font-weight: 800;
          font-size: 1.6rem;
          color: var(--moss-deep);
        }

        .lb-combine {
          width: 100%;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.75rem;
          background: var(--moss);
          color: var(--cream);
          border: 2px solid var(--moss-deep);
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 3px 3px 0 var(--moss-deep);
          transition: all 0.1s ease;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .lb-combine:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--moss-deep); }
        .lb-combine:disabled { opacity: 0.4; cursor: not-allowed; }

        .lb-result {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--paper);
          border: 2px solid var(--gold);
          border-radius: 10px;
          text-align: center;
          animation: lb-pop 0.5s cubic-bezier(.2,1.6,.4,1);
        }
        @keyframes lb-pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .lb-result.new { border-color: var(--rust); background: linear-gradient(135deg, #fff5e0, var(--paper)); }
        .lb-result-icon { font-size: 3rem; line-height: 1; }
        .lb-result-name {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 800;
          font-size: 1.5rem;
          margin: 0.25rem 0 0;
          color: var(--moss-deep);
        }
        .lb-result-desc {
          font-family: 'Caveat', cursive;
          font-size: 1.1rem;
          color: var(--ink-soft);
          margin: 0.3rem auto 0;
          max-width: 320px;
          line-height: 1.3;
        }
        .lb-result-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          margin-top: 0.5rem;
        }
        .lb-result-tag.new { background: var(--rust); color: var(--cream); }
        .lb-result-tag.dup { background: var(--ink-soft); color: var(--cream); }
        .lb-result-tag.proc { background: var(--gold); color: var(--ink); margin-left: 0.3rem; }

        .lb-log {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1.5px dashed var(--ink-soft);
        }
        .lb-log-entry {
          font-family: 'Caveat', cursive;
          font-size: 1.05rem;
          color: var(--ink-soft);
          margin-bottom: 0.15rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        .lb-log-entry:first-child { opacity: 1; color: var(--ink); }
        .lb-log-entry.discovery { color: var(--rust-deep); font-weight: 700; }

        /* BUGDEX */
        .lb-dex-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }
        .lb-dex-card {
          background: var(--paper);
          border: 2px solid var(--ink);
          border-radius: 10px;
          padding: 0.75rem 0.5rem;
          text-align: center;
          position: relative;
          transition: transform 0.15s ease;
        }
        .lb-dex-card:hover { transform: rotate(-1deg) translateY(-2px); }
        .lb-dex-card.locked {
          background: repeating-linear-gradient(
            45deg, var(--paper) 0 6px, var(--paper-shadow) 6px 7px
          );
          opacity: 0.7;
        }
        .lb-dex-icon { font-size: 2.4rem; line-height: 1; }
        .lb-dex-icon.locked { filter: blur(6px) grayscale(1); }
        .lb-dex-name {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 700;
          font-size: 0.95rem;
          margin: 0.25rem 0 0;
          color: var(--moss-deep);
        }
        .lb-dex-rarity {
          font-family: 'Caveat', cursive;
          font-size: 0.95rem;
          color: var(--ink-soft);
        }
        .lb-dex-rarity.rare { color: var(--rust); font-weight: 700; }
        .lb-dex-rarity.uncommon { color: var(--gold); font-weight: 700; }
        .lb-dex-desc {
          font-family: 'Caveat', cursive;
          font-size: 0.9rem;
          color: var(--ink-soft);
          margin-top: 0.25rem;
          line-height: 1.15;
        }
        .lb-dex-proc-badge {
          position: absolute; top: -8px; right: -8px;
          background: var(--gold);
          color: var(--ink);
          font-family: 'Fraunces', serif;
          font-weight: 800;
          font-size: 0.65rem;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          border: 1.5px solid var(--ink);
        }

        .lb-progress {
          background: var(--cream);
          border: 2px solid var(--ink);
          border-radius: 999px;
          height: 22px;
          overflow: hidden;
          margin-bottom: 1rem;
          position: relative;
        }
        .lb-progress-fill {
          background: linear-gradient(90deg, var(--moss), var(--moss-deep));
          height: 100%;
          transition: width 0.4s ease;
        }
        .lb-progress-text {
          position: absolute;
          inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--cream);
          text-shadow: 0 0 4px var(--ink);
        }

        .lb-footer {
          text-align: center;
          margin-top: 2rem;
          font-family: 'Caveat', cursive;
          font-size: 1.05rem;
          color: var(--ink-soft);
          transform: rotate(-0.5deg);
        }
      `}</style>

      <header className="lb-header">
        <h1 className="lb-title">Litter <em>Bug</em></h1>
        <p className="lb-subtitle">~ a field journal of synthetic entomology ~</p>
      </header>

      <div className="lb-tabs">
        <button
          className={`lb-tab ${view === 'lab' ? 'active' : ''}`}
          onClick={() => setView('lab')}
        >
          <FlaskConical size={16} /> The Lab
        </button>
        <button
          className={`lb-tab ${view === 'bugdex' ? 'active' : ''}`}
          onClick={() => setView('bugdex')}
        >
          <BookOpen size={16} /> Bugdex
          <span style={{
            background: 'var(--cream)', color: 'var(--moss-deep)',
            padding: '0 0.4rem', borderRadius: 999, fontSize: '0.75rem',
            marginLeft: 4
          }}>
            {Object.keys(discoveredBugs).length}
          </span>
        </button>
      </div>

      {view === 'lab' && (
        <div className="lb-grid">
          {/* LEFT: foraging + inventory */}
          <section className="lb-panel">
            <button className={`lb-forage ${forageFlash ? 'flash' : ''}`} onClick={forage}>
              <Search size={18} /> Scrounge the Alley
            </button>

            <h2 className="lb-panel-title">
              <Trash2 size={18} /> Bin
              <small>{inventoryList.reduce((s, [, c]) => s + c, 0)} pieces</small>
            </h2>

            {inventoryList.length === 0 ? (
              <div className="lb-empty">Your bin is empty. Go scrounge.</div>
            ) : (
              <div className="lb-inv">
                {inventoryList.map(([id, count]) => {
                  const item = TRASH_ITEMS[id];
                  const inUse = (slot1 === id ? 1 : 0) + (slot2 === id ? 1 : 0);
                  const available = count - inUse;
                  return (
                    <button
                      key={id}
                      className="lb-inv-item"
                      onClick={() => placeInSlot(id)}
                      disabled={available <= 0 || (slot1 && slot2)}
                      title={`${item.name} — tags: ${item.tags.join(', ')}`}
                    >
                      <div className="lb-inv-icon">{item.icon}</div>
                      <div className="lb-inv-name">{item.name}</div>
                      <div className="lb-inv-count">{available}</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="lb-log">
              {log.map(entry => (
                <div key={entry.id} className={`lb-log-entry ${entry.kind}`}>
                  ✦ {entry.text}
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: incubator */}
          <section className="lb-panel">
            <h2 className="lb-panel-title">
              <Sparkles size={18} /> The Incubator
              <small>tap two & combine</small>
            </h2>

            <div className="lb-incubator">
              <div
                className={`lb-slot ${!slot1 ? 'empty' : ''}`}
                onClick={() => slot1 && clearSlot(1)}
              >
                {slot1 ? (
                  <>
                    {TRASH_ITEMS[slot1].icon}
                    <button className="lb-slot-x" onClick={(e) => { e.stopPropagation(); clearSlot(1); }}>
                      <X size={12} />
                    </button>
                  </>
                ) : 'slot 1'}
              </div>
              <div className="lb-plus">+</div>
              <div
                className={`lb-slot ${!slot2 ? 'empty' : ''}`}
                onClick={() => slot2 && clearSlot(2)}
              >
                {slot2 ? (
                  <>
                    {TRASH_ITEMS[slot2].icon}
                    <button className="lb-slot-x" onClick={(e) => { e.stopPropagation(); clearSlot(2); }}>
                      <X size={12} />
                    </button>
                  </>
                ) : 'slot 2'}
              </div>
            </div>

            <button
              className="lb-combine"
              onClick={combine}
              disabled={!slot1 || !slot2}
            >
              <Sparkles size={16} /> Incubate
            </button>

            {lastResult && (
              <div className={`lb-result ${lastResult.isNew ? 'new' : ''}`}>
                <div className="lb-result-icon">{lastResult.icon}</div>
                <h3 className="lb-result-name">{lastResult.name}</h3>
                <p className="lb-result-desc">{lastResult.desc}</p>
                <span className={`lb-result-tag ${lastResult.isNew ? 'new' : 'dup'}`}>
                  {lastResult.isNew ? '✦ New Species' : 'Already Catalogued'}
                </span>
                {lastResult.procedural && (
                  <span className="lb-result-tag proc">Hybrid</span>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {view === 'bugdex' && (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <section className="lb-panel">
            <h2 className="lb-panel-title">
              <BookOpen size={18} /> Signature Species
              <small>{discoveredSignature} / {totalSignature} catalogued</small>
            </h2>
            <div className="lb-progress">
              <div className="lb-progress-fill" style={{ width: `${(discoveredSignature / totalSignature) * 100}%` }} />
              <div className="lb-progress-text">{Math.round((discoveredSignature / totalSignature) * 100)}%</div>
            </div>

            <div className="lb-dex-grid">
              {Object.entries(SIGNATURE_BUGS).map(([id, bug]) => {
                const found = discoveredBugs[id];
                return (
                  <div key={id} className={`lb-dex-card ${!found ? 'locked' : ''}`}>
                    <div className={`lb-dex-icon ${!found ? 'locked' : ''}`}>{bug.icon}</div>
                    <h3 className="lb-dex-name">{found ? bug.name : '???'}</h3>
                    <div className={`lb-dex-rarity ${bug.rarity}`}>{found ? bug.rarity : 'unknown'}</div>
                    {found && <p className="lb-dex-desc">{bug.desc}</p>}
                  </div>
                );
              })}
            </div>

            {/* Procedural hybrids section */}
            {Object.values(discoveredBugs).some(b => b.procedural) && (
              <>
                <h2 className="lb-panel-title" style={{ marginTop: '1.5rem' }}>
                  <Sparkles size={18} /> Field Hybrids
                  <small>emergent combinations</small>
                </h2>
                <div className="lb-dex-grid">
                  {Object.values(discoveredBugs).filter(b => b.procedural).map(bug => (
                    <div key={bug.id} className="lb-dex-card">
                      <span className="lb-dex-proc-badge">hybrid</span>
                      <div className="lb-dex-icon">{bug.icon}</div>
                      <h3 className="lb-dex-name">{bug.name}</h3>
                      <div className={`lb-dex-rarity ${bug.rarity}`}>{bug.rarity}</div>
                      <p className="lb-dex-desc">{bug.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <p className="lb-footer">
        prototype v0.1 · {Object.keys(TRASH_ITEMS).length} trash · {totalSignature} signature bugs · ∞ hybrids
      </p>
    </div>
  );
}
