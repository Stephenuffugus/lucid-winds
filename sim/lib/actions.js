'use strict';
const { BLOOM_XP } = require('./xp');
const { addXp, recordAction } = require('./player');

// Realistic per-minute activity grants. Each returns true if executed.
// Gates: the session loop checks gate availability before selecting.

// Typical game: ~1 minute = 1 round. Win rate ~70%. Sunbeams per win ~3-5.
function playGame(p) {
  const r = p.rng;
  const won = r.chance(0.7);
  if (won) {
    const beams = r.int(3, 5);
    p.sunbeams += beams;
    addXp(p, beams * 2, 'game');
  } else {
    addXp(p, 1, 'game_loss');  // small consolation
  }
  recordAction(p, 'playGame');
  p.eventLog.push({ m: p.minutesPlayed, t: 'playGame', won });
  return true;
}

// Mint plant: costs 30 sunbeams. Rarity weighted (common-heavy for new players).
function mintPlant(p) {
  if (p.sunbeams < 30) return false;
  p.sunbeams -= 30;
  const r = p.rng;
  const roll = r.next();
  let rarity;
  if (roll < 0.60) rarity = 'Common';
  else if (roll < 0.82) rarity = 'Uncommon';
  else if (roll < 0.93) rarity = 'Rare';
  else if (roll < 0.98) rarity = 'Epic';
  else if (roll < 0.995) rarity = 'Legendary';
  else if (roll < 0.999) rarity = 'Mythic';
  else rarity = 'Cosmic';
  const xp = BLOOM_XP[rarity];
  p.plants++;
  addXp(p, xp, 'mint_' + rarity);
  recordAction(p, 'mintPlant');
  p.unlockUsed.mintPlant = 1;
  p.eventLog.push({ m: p.minutesPlayed, t: 'mint', rarity, xp });
  return true;
}

// Drop a wild plant. 3/day cap. Removes from greenhouse.
function dropWild(p) {
  if (p.wildDropsToday >= 3) return false;
  if (p.plants < 2) return false; // won't strip last plant
  p.plants--;
  p.wildDrops++;
  p.wildDropsToday++;
  if (p.firstWildDropMinute == null) p.firstWildDropMinute = p.minutesPlayed;
  // water own wild plant grant (3 XP) + 1 Dew from the action
  p.dew += 1;
  addXp(p, 1, 'dew');
  addXp(p, 3, 'wild_water');
  recordAction(p, 'dropWild');
  p.unlockUsed.wildDrop = 1;
  p.eventLog.push({ m: p.minutesPlayed, t: 'dropWild' });
  return true;
}

// Collect feral seed: 2 Dew → 2 XP. ~60% success (challenge game).
function collectFeral(p) {
  if (!p.rng.chance(0.6)) {
    p.eventLog.push({ m: p.minutesPlayed, t: 'feralFail' });
    return true; // time still spent
  }
  p.ferals++;
  p.dew += 2;
  addXp(p, 2, 'feral');
  recordAction(p, 'collectFeral');
  p.unlockUsed.feralCollect = 1;
  p.eventLog.push({ m: p.minutesPlayed, t: 'feral' });
  return true;
}

// Tend stranger plant: 10 XP + 5 XP water + dew
function tendStranger(p) {
  addXp(p, 10, 'tend');
  addXp(p, 5, 'tend_water');
  p.dew += 2;
  addXp(p, 2, 'dew');
  p.strangersTended++;
  recordAction(p, 'tendStranger');
  p.unlockUsed.strangerTend = 1;
  p.eventLog.push({ m: p.minutesPlayed, t: 'tend' });
  return true;
}

// Breed two plants. 5 XP cross-pollinate. Needs 2+ plants.
function breed(p) {
  if (p.plants < 2) return false;
  addXp(p, 5, 'breed');
  p.breedsDone++;
  recordAction(p, 'breed');
  p.unlockUsed.greenhouseBreed = 1;
  p.eventLog.push({ m: p.minutesPlayed, t: 'breed' });
  return true;
}

function idle(p) {
  recordAction(p, 'idle');
  return true;
}

const ACTIONS = { playGame, mintPlant, dropWild, collectFeral, tendStranger, breed, idle };

// Map action -> required gate key (or null)
const ACTION_GATE = {
  playGame:      null,
  mintPlant:     'mintPlant',
  dropWild:      'wildDrop',
  collectFeral:  'feralCollect',
  tendStranger:  'strangerTend',
  breed:         'greenhouseBreed',
  idle:          null
};

module.exports = { ACTIONS, ACTION_GATE };
