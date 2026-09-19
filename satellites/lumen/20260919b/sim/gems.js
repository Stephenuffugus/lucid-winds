// Gem records, seeded IDs, generated names, prices. Pure.
import { DATA } from './data.js';
import { hash } from './rng.js';

// gemId = hash(runSeed, dropIndex): drives the look, the name and Phantom's extra channel.
export const gemIdFor = (runSeed, dropIndex) => hash(runSeed, 'gem', dropIndex) >>> 0;

export function gemName(gem, data = DATA) {
  const N = data.names;
  const id = gem.gemId >>> 0;
  const a = N.first[id % N.first.length];
  const b = N.second[Math.floor(id / N.first.length) % N.second.length];
  const stone = data.stone[gem.stone].name;
  return `${a} ${b} ${stone} No. ${id % N.numberMod}`;
}

// "mirror:ruby" -> { cut, stone }
export function parseGemSpec(spec) {
  const [cut, stone] = spec.split(':');
  return { cut, stone };
}

export function sameKind(a, b) {
  return a.cut === b.cut && a.stone === b.stone && a.tier === b.tier && (a.inclusion || null) === (b.inclusion || null);
}

export function gemPrice(gem, data = DATA) {
  const P = data.prices;
  const rarity = data.cut[gem.cut].rarity;
  return P.gem[rarity] + (gem.inclusion ? P.inclusionAdd : 0);
}

export function sellPrice(gem, sellFraction, data = DATA) {
  const f = sellFraction || data.prices.sell;
  return Math.floor((gemPrice(gem, data) * f.num) / f.den);
}

export function settingPrice(id, data = DATA) {
  const p = data.prices.settings[id];
  return p !== undefined ? p : data.prices.settingDefault;
}
