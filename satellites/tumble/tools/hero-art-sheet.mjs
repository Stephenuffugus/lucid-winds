// Writes docs/HERO-ART-PROMPTS.md: the prompt sheet for painted hero sock DECALS (24 Sep 2026, Stephen: "they kind of
// look like s*** ... what would be the best move to make improvement so these all look better?"). One style paragraph
// for every prompt, then one line per hero from data/heroes/*.json (name, flavour, the recipe's own colours).
//   node tools/hero-art-sheet.mjs
import { readFileSync, readdirSync, writeFileSync } from 'fs';
const ROOT = new URL('..', import.meta.url).pathname;
const dir = ROOT + 'data/heroes/';
const packs = JSON.parse(readFileSync(ROOT + 'data/hero-socks.json', 'utf8')).packs;
const out = [];
const P = (s = '') => out.push(s);
P('# TUMBLE hero socks, the decal art sheet (24 September 2026)');
P();
P('Stephen: "I just unlocked something like the seed socks from the hero 3 pack and they make me a little concerned cuz they kind of');
P('look like s*** ... I want to make sure they look good." A hero sock is painted from a recipe of flat shapes; the painter now draws');
P('hero emblems bigger, with ink that holds at play size and the knit through the fill (engine/sockgen.js, hero recipes only). This');
P('sheet is the second step: a painted DECAL per hero, laid over the recipe\'s own emblem place, the way the finds art is laid over');
P('the find recipes.');
P();
P('## How the art comes in (wired)');
P();
P('Drop a PNG per hero at `satellites/tumble/assets/heroes/<id>.png` (the ids are below) and list the ids you dropped in');
P('`satellites/tumble/assets/heroes/manifest.json` as a JSON array of strings. The game paints the recipe first and lays the');
P('decal over the emblem the moment the file is there, at the size and place the recipe gives the emblem, on both faces of the');
P('sock; a missing file leaves the recipe showing. Size: 512 x 512, TRANSPARENT background, the object filling about 85 percent');
P('of the square, centred. The decal REPLACES the emblem only: the sock\'s colour, stripes, cuff, heel and toe stay the recipe\'s.');
P();
P('## One style, pasted at the top of EVERY prompt (this is the continuity)');
P();
P('> A single small motif for a knitted sock, on a transparent background, centred, filling most of a square frame. It looks');
P('> KNITTED IN, like intarsia or a chunky embroidery: soft blocky edges that follow a knit grid, a little visible yarn texture,');
P('> two or three flat colours plus one dark outline colour, no gradients, no shadows, no background, no text unless the line');
P('> below asks for a word, no people, no hands. Bold and simple enough to read at the size of a thumbnail. Square, 1024 x 1024.');
P();
P('Then one line for the sock (below), with its colours. Keep the same seed or reference image across a pack if the tool allows');
P('(ChatGPT: one conversation per pack, "same style as the last one"). Generate the ten of one pack together, look at them side');
P('by side at thumbnail size, and only then the next pack. Motifs that are a repeating pattern (marked PATTERN) do not need a');
P('decal: the painter repeats them and they read already.');
P();
for (const f of readdirSync(dir).sort()) {
  const j = JSON.parse(readFileSync(dir + f, 'utf8'));
  const pack = packs.find((p) => p.id === j.pack.id) || j.pack;
  P(`### ${pack.name} (${j.pack.id})`);
  P();
  for (const h of j.heroes) {
    const em = (h.recipe.layers || []).find((l) => l.type === 'emblem');
    const mo = (h.recipe.layers || []).find((l) => l.type === 'motif');
    const C = h.recipe.colors || {};
    const used = new Set();
    const walk = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk); for (const [k, v] of Object.entries(o)) { if ((k === 'color' || k === 'edge') && typeof v === 'string' && C[v]) used.add(v); walk(v); } };
    walk(em || mo || {});
    const cols = [...used].map((k) => `${k} ${C[k]}`).join(', ') || Object.entries(C).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(', ');
    const text = (em && em.shapes || []).find((s) => s.sdf === 'text');
    P(`- \`${h.id}\` **${h.name}** ${em ? '' : mo ? '(PATTERN, no decal needed) ' : ''}: ${h.flavor || ''} Colours: ${cols}. Sock body ${C.body || ''}.${text ? ` The word on it: "${text.text}".` : ''}`);
  }
  P();
}
writeFileSync(ROOT + 'docs/HERO-ART-PROMPTS.md', out.join('\n') + '\n');
console.log('docs/HERO-ART-PROMPTS.md', out.length, 'lines');
