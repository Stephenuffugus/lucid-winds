'use strict';
const { BLOOM_XP } = require('./xp');
const { addXp, recordAction } = require('./player');
const R = require('./xp-rewards');

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
    R.onGameWin(p);
  } else {
    addXp(p, 1, 'game_loss');
    R.onGameLoss(p);
  }
  recordAction(p, 'playGame');
  R.onActionFirstTime(p, 'playGame');
  // Pattern XP: variety within a session (proxy: random game id from 0-29)
  R.onGamePlayed(p, 'g' + r.int(0, 29));
  p.eventLog.push({ m: p.minutesPlayed, t: 'playGame', won });
  return true;
}

// Mint plant: costs 30 sunbeams. Rarity weighted.
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
  R.onActionFirstTime(p, 'mintPlant');
  // Reading XP — small chance the player inspects their new plant
  if (r.chance(0.25)) R.onPostMintRead(p);
  p.eventLog.push({ m: p.minutesPlayed, t: 'mint', rarity, xp });
  return true;
}

// Drop a wild plant. 3/day cap.
function dropWild(p) {
  if (p.wildDropsToday >= 3) return false;
  if (p.plants < 2) return false;
  p.plants--;
  p.wildDrops++;
  p.wildDropsToday++;
  if (p.firstWildDropMinute == null) p.firstWildDropMinute = p.minutesPlayed;
  p.dew += 1;
  addXp(p, 1, 'dew');
  addXp(p, 3, 'wild_water');
  recordAction(p, 'dropWild');
  p.unlockUsed.wildDrop = 1;
  R.onActionFirstTime(p, 'dropWild');
  R.onActionFirstOfKind(p, 'dropWild');
  p.eventLog.push({ m: p.minutesPlayed, t: 'dropWild' });
  return true;
}

// Collect feral seed. ~60% success.
function collectFeral(p) {
  if (!p.rng.chance(0.6)) {
    p.eventLog.push({ m: p.minutesPlayed, t: 'feralFail' });
    return true;
  }
  p.ferals++;
  p.dew += 2;
  addXp(p, 2, 'feral');
  recordAction(p, 'collectFeral');
  p.unlockUsed.feralCollect = 1;
  R.onActionFirstTime(p, 'collectFeral');
  R.onActionFirstOfKind(p, 'collectFeral');
  R.onFeralCollected(p, 'sp' + p.rng.int(0, 9)); // 10 species pool
  p.eventLog.push({ m: p.minutesPlayed, t: 'feral' });
  return true;
}

// Tend stranger plant.
function tendStranger(p) {
  addXp(p, 10, 'tend');
  addXp(p, 5, 'tend_water');
  p.dew += 2;
  addXp(p, 2, 'dew');
  p.strangersTended++;
  recordAction(p, 'tendStranger');
  p.unlockUsed.strangerTend = 1;
  R.onActionFirstTime(p, 'tendStranger');
  R.onActionFirstOfKind(p, 'tendStranger');
  p.eventLog.push({ m: p.minutesPlayed, t: 'tend' });
  return true;
}

// Breed two plants.
function breed(p) {
  if (p.plants < 2) return false;
  addXp(p, 5, 'breed');
  p.breedsDone++;
  recordAction(p, 'breed');
  p.unlockUsed.greenhouseBreed = 1;
  R.onActionFirstTime(p, 'breed');
  R.onActionFirstOfKind(p, 'breed');
  p.eventLog.push({ m: p.minutesPlayed, t: 'breed' });
  return true;
}

function idle(p) {
  recordAction(p, 'idle');
  R.onIdleTick(p);
  return true;
}

const ACTIONS = { playGame, mintPlant, dropWild, collectFeral, tendStranger, breed, idle };

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
