// Every content table, imported once. The browser game, the Node harness and the reference
// evaluator all read these same files; nothing in sim/ hard-codes content.
import RULES from '../data/rules.json' with { type: 'json' };
import STONES from '../data/stones.json' with { type: 'json' };
import CUTS from '../data/cuts.json' with { type: 'json' };
import INCLUSIONS from '../data/inclusions.json' with { type: 'json' };
import SETTINGS from '../data/settings.json' with { type: 'json' };
import ECLIPSES from '../data/eclipses.json' with { type: 'json' };
import LANTERNS from '../data/lanterns.json' with { type: 'json' };
import POUCHES from '../data/pouches.json' with { type: 'json' };
import PRICES from '../data/prices.json' with { type: 'json' };
import TARGETS from '../data/targets.json' with { type: 'json' };
import SHOP from '../data/shop.json' with { type: 'json' };
import FEATURES from '../data/features.json' with { type: 'json' };
import NAMES from '../data/names.json' with { type: 'json' };
import VIGILS from '../data/vigils.json' with { type: 'json' };

const byId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));

export function buildData(over = {}) {
  const d = {
    rules: RULES, stones: STONES, cuts: CUTS, inclusions: INCLUSIONS, settings: SETTINGS, eclipses: ECLIPSES,
    lanterns: LANTERNS, pouches: POUCHES, prices: PRICES, targets: TARGETS, shop: SHOP, features: FEATURES, names: NAMES, vigils: VIGILS,
    ...over,
  };
  d.stone = byId(d.stones);
  d.cut = byId(d.cuts);
  d.inclusion = byId(d.inclusions);
  d.setting = byId(d.settings);
  d.eclipse = byId(d.eclipses);
  d.lantern = byId(d.lanterns);
  return d;
}

export const DATA = buildData();
