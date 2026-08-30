/* artkit — everything Stephen needs to make the 2D part art, generated from the
 * real catalogue so it can never drift from what the game actually contains.
 *
 * Three outputs:
 *   docs/ART-PROMPTS.md   one ready to paste prompt per part, using that part's
 *                         own description from sim2.js
 *   assets/parts/         the folders, with a .keep in each
 *   (stdout)              the ledger: what is done, what is missing
 *
 * ⛔ The prompts ask for a FLAT BLACK background on purpose. Image generators do
 * not give clean transparency, and flat black is what the studio's cutting
 * workflow already keys out. tools/artcut.js does the keying, so the raw output
 * of a generator is a valid input to this pipeline.
 *
 *   node tools/artkit.js            # write the prompt doc and the folders
 *   node tools/artkit.js --ledger   # just report what is present and missing
 */
const fs = require('fs');
const path = require('path');
const SIM = require('../src/sim2.js');

const ROOT = path.join(__dirname, '..');
const ART_EXT = '.webp';   // what artcut.py writes; see its header for why
const SLOTS = [
  ['core',    SIM.CORES,    'the lock chip that sits on top of the disc'],
  ['blade',   SIM.BLADES,   'the striking disc, the whole silhouette of the top'],
  ['assist',  SIM.ASSISTS,  'a shaped ring that clips under the blade'],
  ['ratchet', SIM.RATCHETS, 'the toothed collar between blade and tip'],
  ['bit',     SIM.BITS,     'the tip the top stands and spins on'],
];

/* What the picture has to do, per slot. This is not flavour; it is the reason
   the art either reads at 34 pixels on a chip or does not. */
const SHOT = {
  core:    'from slightly above and in front, lying flat, the face toward camera',
  blade:   'from slightly above at a three quarter angle so the rim and the edge both read',
  assist:  'nearly edge on, tilted just enough to show the ring is a ring',
  ratchet: 'from the side and a little above, so the teeth on the ring are countable',
  bit:     'from the side, point downward, standing as it would in the dish',
};
const TIER = { 1: 'It is a plain workshop part, honest and unremarkable',
               2: 'It is a better made part, cleaner machining, a little more care in it',
               3: 'It is a rare part with a history, visibly not standard issue' };

/* ⛔ THE PALETTE HAS TO VARY OR THE SET LOOKS LIKE ONE PART TWICE. The first
   version put "warm brass and dark steel" on all 112 prompts, which would come
   back as 112 pictures of the same object. The role already means something
   mechanically, so it gets to mean something materially too, and a tier three
   part defers to whatever material its own description names, because those
   descriptions are where the lore actually lives. */
const MATERIAL = {
  attack:  'hardened steel with a bright ground edge and heat colour near it, dark and hungry looking',
  stamina: 'light pale alloy, finely finished, almost delicate, very little mass in it',
  defense: 'thick blunt iron, heavy sections, chipped and dented from work',
  balance: 'plain honest brass and steel, evenly made, nothing exaggerated',
  utility: 'mixed materials, visibly assembled from more than one thing'
};

function tierOf(p) { return p.tier || 1; }

function promptFor(slot, part, blurb) {
  const bits = [];
  bits.push('A single ' + slot + ' for a spinning battle top: ' + blurb + '.');
  bits.push(part.desc || '');
  bits.push(TIER[tierOf(part)] + '.');
  /* A tier three part's own description almost always names its material, so
     prescribing one on top of it fights the lore. Let the description lead. */
  if (tierOf(part) < 3)
    bits.push('Made of ' + (MATERIAL[part.role] || MATERIAL.balance) + '.');
  else
    bits.push('Made of whatever the description above implies, and it should look like nothing else in the case.');
  bits.push('Shown ' + SHOT[slot] + '.');
  bits.push('One object only, centred, filling most of the frame, nothing else in the picture.');
  bits.push('Lit from the upper left, a soft specular along the top edge, deep shadow on the lower right.');
  bits.push('Flat pure black background, no shadow on the ground, no reflection, no surface under it.');
  bits.push('No text, no logo, no border, no frame, no packaging, no hand, no motion blur.');
  bits.push('Square image.');
  return bits.filter(Boolean).join(' ');
}

function ledger() {
  const rows = [];
  let have = 0, want = 0;
  for (const [slot, list] of SLOTS) {
    for (const p of list) {
      if (p.id === 'none') continue;            // the empty assist has no object
      want++;
      const f = path.join(ROOT, 'assets', 'parts', slot, p.id + ART_EXT);
      const ok = fs.existsSync(f);
      if (ok) have++;
      rows.push({ slot, id: p.id, name: p.name, ok,
                  kb: ok ? Math.round(fs.statSync(f).size / 1024) : 0 });
    }
  }
  for (const w of SIM.WEIGHTS) {
    if (w.id === 'none') continue;
    want++;
    const f = path.join(ROOT, 'assets', 'parts', 'weight', w.id + ART_EXT);
    const ok = fs.existsSync(f);
    if (ok) have++;
    rows.push({ slot: 'weight', id: w.id, name: w.name || w.id, ok,
                kb: ok ? Math.round(fs.statSync(f).size / 1024) : 0 });
  }
  return { rows, have, want };
}

function report() {
  const { rows, have, want } = ledger();
  const bySlot = {};
  for (const r of rows) (bySlot[r.slot] = bySlot[r.slot] || []).push(r);
  console.log('\nRIPCORD ART LEDGER      ' + have + ' of ' + want + ' done\n');
  for (const slot of Object.keys(bySlot)) {
    const g = bySlot[slot];
    const done = g.filter(r => r.ok).length;
    const bar = '='.repeat(Math.round(done / g.length * 24)).padEnd(24, '.');
    console.log('  ' + slot.padEnd(8) + ' [' + bar + '] ' +
                String(done).padStart(2) + '/' + String(g.length).padEnd(3) +
                (done < g.length ? '  next: ' + g.filter(r => !r.ok).slice(0, 4)
                                    .map(r => r.id).join(' ') : '  done'));
  }
  console.log('\n  ' + (want - have) + ' still to make.' +
    (have ? '  Largest so far ' + Math.max(...rows.filter(r => r.ok).map(r => r.kb)) + 'KB.' : '') + '\n');
  return { have, want };
}

if (process.argv.includes('--ledger')) { report(); process.exit(0); }

/* ---- folders ---- */
for (const [slot] of SLOTS.concat([['weight']])) {
  const d = path.join(ROOT, 'assets', 'parts', slot);
  fs.mkdirSync(d, { recursive: true });
  const keep = path.join(d, '.keep');
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
}
fs.mkdirSync(path.join(ROOT, 'assets', 'parts', '_raw'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'parts', '_raw', '.keep'), '');

/* ---- the prompt doc ---- */
let md = `# RIPCORD — part art, one prompt per part

Generated by \`node tools/artkit.js\` from the live catalogue in \`sim2.js\`.
If a part is renamed or added, regenerate this rather than editing it.

## How this works

1. Generate a picture from the prompt below. **Flat pure black background** is
   asked for on purpose: generators do not give clean transparency, and black is
   what the cutting step keys out.
2. Save it into \`assets/parts/_raw/\` named after the part, any size, any format:
   \`cleaver.png\`, \`cleaver.jpg\`, \`cleaver.webp\` all work.
3. Run \`node tools/artcut.js\`. It keys the background, trims to the object,
   squares it up, sizes it and writes the game ready file into
   \`assets/parts/blade/cleaver.png\`.
4. Reload the game. It is there. Nothing else to wire.

Missing art is the normal state. Every part without a file is drawn in code
exactly as it is today, so you can do these in any order and stop any time.

Check progress at any point with \`node tools/artkit.js --ledger\`.

## What makes a part picture work here

The same image has to read at **34 pixels** on a workshop chip and at about
**150 pixels** on the card you get when you win it. That is the whole design
constraint, and it means:

- **Silhouette first.** If the shape is not recognisable as a black cut-out, no
  amount of detail will save it at chip size.
- **One object, centred, filling the frame.** No ground, no shadow under it, no
  scene, no props.
- **No frame and no text baked in.** The game draws its own frame; art with a
  border in it fights the UI and cannot be re-used.
- **Keep the value range wide.** A part that is all mid-grey disappears against
  the workshop background, which is a warm near-black.

`;

for (const [slot, list, blurb] of SLOTS) {
  const real = list.filter(p => p.id !== 'none');
  md += `\n---\n\n## ${slot.charAt(0).toUpperCase() + slot.slice(1)} — ${real.length}\n\n`;
  md += `Saved as \`assets/parts/${slot}/<id>.webp\`. Shot ${SHOT[slot]}.\n`;
  for (const p of real) {
    md += `\n### ${p.name}  \`${p.id}.png\`\n`;
    md += `*${p.role || 'balance'}${p.tier ? ', tier ' + p.tier : ''}` +
          `${p.ability ? ', move: ' + p.ability : ''}` +
          `${p.drawback ? ', drawback: ' + p.drawback : ''}*\n\n`;
    md += '```\n' + promptFor(slot, p, blurb) + '\n```\n';
  }
}

md += `\n---\n\n## Weights — 3\n\nSaved as \`assets/parts/weight/<id>.webp\`. Small metal blanks that bolt into the
holes under a blade. Shot from slightly above, lying flat.\n`;
for (const w of SIM.WEIGHTS) {
  if (w.id === 'none') continue;
  md += `\n### ${w.name || w.id}  \`${w.id}.png\`\n\n`;
  md += '```\nA single small machined counterweight for a spinning battle top, a ' +
        (w.id === 'chip' ? 'thin light disc' : w.id === 'slug' ? 'medium cylindrical slug' :
         'short heavy block') + '. One object only, centred, filling most of the frame. ' +
        'Machined metal, warm brass and dark steel, lit from the upper left. ' +
        'Flat pure black background, no shadow, no surface under it. ' +
        'No text, no logo, no border. Square image.\n```\n';
}

fs.writeFileSync(path.join(ROOT, 'docs', 'ART-PROMPTS.md'), md);
console.log('docs/ART-PROMPTS.md written  (' + md.split('\n').length + ' lines)');
console.log('assets/parts/{core,blade,assist,ratchet,bit,weight,_raw}/ ready');
report();
