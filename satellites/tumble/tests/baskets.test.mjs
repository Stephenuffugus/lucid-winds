// PHASE 8, THE BASKETS (DESIGN-T2): "Eight baskets as `look` data over the styles that exist, plus two new styles:
// Enamel Wash Tub, Rope Coil Basket, The Open Suitcase, Little Red Wagon (new style), Upside Down Umbrella (new
// style), Brown Paper Grocery Bag, Wool Felt Bin, Sunday Bread Basket. Each has its landing sound (phase 7.1)."
//
// A basket is round in the physics (a ring of wall slats and rim capsules, scored by distance from its middle), so a
// new basket is a LOOK: it plays exactly like the wicker one it replaces. This holds the data; dev/shots-baskets.mjs
// holds what the page builds from it (every basket drawn, inside its envelope, nothing standing in the ball's path).
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { BASKET_MATERIAL, BASKET_STYLE_MATERIAL } from '../src/audio.js';
import { deltaE } from '../engine/color.js';

const { ok, done } = suite('baskets');
const unlocks = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url)));
const baskets = unlocks.items.filter((i) => i.cat === 'basket');
const byName = new Map(baskets.map((b) => [b.name, b]));

// the design's eight, and the material each lands in, written out by hand (7.1's five: wicker, wire, cloth, enamel,
// plastic; a leather case and a paper bag land soft, like cloth; a tin wagon rings like enamel)
const EIGHT = {
  'Enamel Wash Tub': 'enamel', 'Rope Coil Basket': 'cloth', 'The Open Suitcase': 'cloth', 'Little Red Wagon': 'enamel',
  'Upside Down Umbrella': 'cloth', 'Brown Paper Grocery Bag': 'cloth', 'Wool Felt Bin': 'cloth', 'Sunday Bread Basket': 'wicker',
};
const missing = Object.keys(EIGHT).filter((n) => !byName.has(n));
ok(!missing.length, `the design's eight baskets are in the shop${missing.length ? ': missing ' + missing.join(', ') : ''}`);

const eight = Object.keys(EIGHT).map((n) => byName.get(n)).filter(Boolean);
{
  // earned with Lint, never Quarters and never money (his paying call: nothing sold), and not given at the start
  const bad = eight.filter((b) => !(b.cost && b.cost.lint > 0 && Object.keys(b.cost).length === 1) || b.start);
  ok(eight.length === 8 && !bad.length, `each is bought with Lint alone and none is free at the start${bad.length ? ': ' + bad.map((b) => b.name).join(', ') : ''}`);
}
{
  // a LOOK, not an advantage: the full size and the standard rim of the wicker basket
  const bad = eight.filter((b) => (b.look.radius || 1) !== 1 || (b.look.rim || 'standard') !== 'standard');
  ok(eight.length === 8 && !bad.length, `each plays exactly like the wicker basket: full size, standard rim${bad.length ? ': ' + bad.map((b) => `${b.name} ${b.look.radius} ${b.look.rim}`).join(', ') : ''}`);
}
{
  const bad = [];
  for (const b of eight) {
    const m = BASKET_STYLE_MATERIAL[b.look.style];
    if (m !== EIGHT[b.name]) bad.push(`${b.name} lands like ${m} (want ${EIGHT[b.name]})`);
    if (!BASKET_MATERIAL[m]) bad.push(`${b.name}: no sound for ${m}`);
  }
  ok(eight.length === 8 && !bad.length, `each lands in its own material${bad.length ? ': ' + bad.join('; ') : ''}`);
}
{
  // the two new styles are new, and the other six are drawn over a style of their own (no two share one)
  const styles = eight.map((b) => b.look.style);
  const byStyle = (n) => (byName.get(n) || { look: {} }).look.style;
  ok(byStyle('Little Red Wagon') === 'wagon' && byStyle('Upside Down Umbrella') === 'umbrella' && new Set(styles).size === 8,
    `the wagon and the umbrella are their own styles, and the eight are eight different styles (${styles.join(', ')})`);
}
{
  // NO TWINS on the shelf: two baskets of one style must differ clearly in both their colours (the dryers' law)
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const bad = [];
  for (let i = 0; i < baskets.length; i++) for (let j = i + 1; j < baskets.length; j++) {
    const a = baskets[i].look, b = baskets[j].look;
    if (a.style !== b.style) continue;
    const d1 = deltaE(rgb(a.color), rgb(b.color)), d2 = deltaE(rgb(a.color2 || a.color), rgb(b.color2 || b.color));
    if (d1 < 12 && d2 < 12) bad.push(`${baskets[i].name} and ${baskets[j].name} (dE ${d1.toFixed(1)}, ${d2.toFixed(1)})`);
  }
  ok(!bad.length, `no two baskets are twins (${baskets.length} on the shelf)${bad.length ? ': ' + bad.join('; ') : ''}`);
}
{
  // what the shelf costs, said out loud: Lint only, at about 67 a Regular Load (tests/economy.test.mjs)
  const lint = eight.reduce((s, b) => s + ((b.cost && b.cost.lint) || 0), 0);
  const perLoad = 200 / 3;
  const inBand = eight.every((b) => b.cost.lint >= 200 && b.cost.lint <= 1000);
  ok(eight.length === 8 && inBand, `the eight cost 200 to 1,000 Lint each, ${lint} in all: ${Math.round(lint / perLoad)} Regular Loads, ${(lint / perLoad / 3).toFixed(1)} days at three a day`);
}

done();
