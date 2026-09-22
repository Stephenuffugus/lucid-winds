// POCKET CHANGE (DESIGN-T2 phase 1). The whole coin rule set, pure, so Node can replay a Load.
//
// Coins are FOUND, never awarded for failing less. Every coin goes into the COIN JAR on the dryer top.
// The jar holds 0 to 24 cents; at 25 it rolls itself into a Quarter and economy.quarters goes up by one.
// Quarter prices are untouched (95 Quarters buys all eight machines and packs). Lint is untouched.
// A miss never takes back a coin already found: nothing in here subtracts.
//
// Every draw is a pure function of (the Load's seed, which moment, which time that moment has come round).
// It is NOT a stream, on purpose: two players on the same Daily who flip their socks in a different order
// still find the same coins, and a test can replay any Load without replaying the play.

export const PURSE = [
  { kind: 'penny', cents: 1, weight: 50 },
  { kind: 'nickel', cents: 5, weight: 25 },
  { kind: 'dime', cents: 10, weight: 15 },
  { kind: 'quarter', cents: 25, weight: 10 },
];
export const CENTS = { penny: 1, nickel: 5, dime: 10, quarter: 25 };
export const ROLL_AT = 25;          // 25 cents rolls a Quarter
export const FLIP_CHANCE = 0.35;    // a coin in the cuff of an inside out sock

const bySize = (small, regular, heavy, mountain) => ({ small, regular, heavy, mountain });

// Each moment is something she SEES and HEARS. `draws` is how many coins come out of the purse;
// `coin` is a fixed coin, which is not a draw at all.
export const MOMENTS = {
  door: { draws: bySize(1, 2, 3, 4), once: true, says: 'the dryer door opens' },
  flip: { draws: 1, chance: FLIP_CHANCE, cap: bySize(1, 2, 3, 4), says: 'a coin in the cuff' },
  trap: { draws: bySize(1, 2, 3, 4), once: true, says: 'the lint trap' },
  allFlipped: { coin: bySize('nickel', 'dime', 'dime', 'dime'), once: true, says: 'every sock the right way out' },
  clean: { coin: 'quarter', once: true, says: 'a Clean Load' },
  spotless: { coin: 'quarter', once: true, says: 'a Spotless Load' },
  big: { draws: bySize(0, 0, 2, 4), once: true, says: 'a big Load' },
  reunion: { draws: 1, says: 'a Reunion' },
};

const sizeOf = (m, size) => (m && typeof m === 'object' && !Array.isArray(m) ? (m[size] !== undefined ? m[size] : m.regular) : m);
export const drawsFor = (moment, size = 'regular') => { const M = MOMENTS[moment]; return M ? (sizeOf(M.draws, size) || 0) : 0; };
export const capFor = (moment, size = 'regular') => { const M = MOMENTS[moment]; return M && M.cap ? sizeOf(M.cap, size) : Infinity; };

// FNV-1a with a final mix, so neighbouring indices do not correlate
function h32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
const unit = (str) => h32(str) / 4294967296;

const TOTAL_WEIGHT = PURSE.reduce((a, c) => a + c.weight, 0);
// one coin out of the purse, by the odds above
export function drawCoin(u) {
  let t = u * TOTAL_WEIGHT;
  for (const c of PURSE) { if (t < c.weight) return { kind: c.kind, cents: c.cents }; t -= c.weight; }
  const last = PURSE[PURSE.length - 1];
  return { kind: last.kind, cents: last.cents };
}

// the index-th coin of this moment in this Load. Pure: same seed, same moment, same index, same coin.
export function coinAt(loadSeed, moment, index = 0) {
  return drawCoin(unit(`${loadSeed}|coin|${moment}|${index}`));
}
// does the index-th flip of this Load drop a coin at all?
export function flipPays(loadSeed, index = 0) {
  return unit(`${loadSeed}|flipgate|${index}`) < FLIP_CHANCE;
}

// Every coin a moment pays. Returns [] when the moment pays nothing at this size.
// `index` numbers the times this moment has come round (only `flip` and `reunion` come round more than once).
export function coinsFor(loadSeed, moment, { size = 'regular', index = 0 } = {}) {
  const M = MOMENTS[moment];
  if (!M) return [];
  if (M.coin) { const kind = sizeOf(M.coin, size); return [{ kind, cents: CENTS[kind], moment }]; }
  if (M.chance && !flipPays(loadSeed, index)) return [];
  const n = sizeOf(M.draws, size) || 0;
  const out = [];
  for (let k = 0; k < n; k++) out.push({ ...coinAt(loadSeed, moment, index * 8 + k), moment });
  return out;
}

// The jar. economy: { cents, quarters }. Returns what the room has to show: the coins in, the rolls out.
export function addCents(economy, cents) {
  const add = Math.max(0, Math.floor(Number(cents) || 0));
  let c = Math.max(0, Math.floor(Number(economy.cents) || 0)) + add;
  let rolled = 0;
  while (c >= ROLL_AT) { c -= ROLL_AT; rolled++; }
  economy.cents = c;
  economy.quarters = Math.max(0, Math.floor(Number(economy.quarters) || 0)) + rolled;
  return { added: add, cents: c, rolled };
}

// What the average draw is worth, printed by the economy test so the number is never a guess.
export const AVERAGE_DRAW = PURSE.reduce((a, c) => a + (c.weight / TOTAL_WEIGHT) * c.cents, 0);
