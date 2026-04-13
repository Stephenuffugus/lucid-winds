'use strict';
// Mirrors RANKS[] from index.html ~43886-43937 (50 levels).
const RANKS = [
  { lvl: 1, title: 'Seedling', xp: 0 },
  { lvl: 2, title: 'Sprout', xp: 25 },
  { lvl: 3, title: 'Young Shoot', xp: 75 },
  { lvl: 4, title: 'Budding', xp: 175 },
  { lvl: 5, title: 'Tender', xp: 350 },
  { lvl: 6, title: 'Grower', xp: 600 },
  { lvl: 7, title: 'Cultivator', xp: 950 },
  { lvl: 8, title: 'Forager', xp: 1400 },
  { lvl: 9, title: 'Gardener', xp: 2000 },
  { lvl: 10, title: 'Naturalist', xp: 2800 },
  { lvl: 11, title: 'Herbalist', xp: 3800 },
  { lvl: 12, title: 'Botanist', xp: 5000 },
  { lvl: 13, title: 'Warden', xp: 6500 },
  { lvl: 14, title: 'Rootwalker', xp: 8500 },
  { lvl: 15, title: 'Grove Tender', xp: 11000 },
  { lvl: 16, title: 'Pathfinder', xp: 14000 },
  { lvl: 17, title: 'Sage', xp: 17500 },
  { lvl: 18, title: 'Archivist', xp: 22000 },
  { lvl: 19, title: 'Curator', xp: 27500 },
  { lvl: 20, title: 'Verdant', xp: 34000 }
];

function getRank(totalXp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXp >= RANKS[i].xp) return RANKS[i];
  }
  return RANKS[0];
}

function getLevel(totalXp) {
  return getRank(totalXp).lvl;
}

function xpForLevel(lvl) {
  const r = RANKS.find(r => r.lvl === lvl);
  return r ? r.xp : Infinity;
}

// Bloom XP by rarity tier
const BLOOM_XP = {
  Common: 10, Uncommon: 15, Rare: 20, Epic: 25,
  Legendary: 40, Mythic: 60, Cosmic: 100
};

module.exports = { RANKS, getRank, getLevel, xpForLevel, BLOOM_XP };
