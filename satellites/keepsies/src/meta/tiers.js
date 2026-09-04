/**
 * The tier ladder, and nothing else.
 *
 * It lives in its own file with NO imports because everything needs it and one
 * of those things is `meta/drops.js`, which has to run headless: it used to take
 * this from `meta/collection.js`, which imports three, so the pity gate could
 * not load the module it was meant to be testing.
 */
export const TIER_ORDER = ['common', 'uncommon', 'rare', 'epic', 'grail'];
export const TIER_LABEL = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', grail: 'Grail'
};
/** How rare, as a number, for comparisons. */
export const tierRank = (t) => TIER_ORDER.indexOf(t);
