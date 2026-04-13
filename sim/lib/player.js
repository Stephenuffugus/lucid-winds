'use strict';
const { getLevel } = require('./xp');

function newPlayer(archetypeName, rng) {
  return {
    archetype: archetypeName,
    rng,
    xp: 0,
    level: 1,
    sunbeams: 0,
    dew: 0,
    plants: 1,          // gift plant from onboarding
    wildDrops: 0,       // total drops ever made
    wildDropsToday: 0,  // daily cap
    ferals: 0,
    strangersTended: 0,
    breedsDone: 0,
    minutesPlayed: 0,
    sessionsPlayed: 0,
    dayIndex: 0,
    dropped: false,         // abandoned before Lv 12?
    timeToLevel: {},        // { 2: 3, 3: 12, ... } minutes
    actionCounts: {},       // { playGame: 123, ... }
    unlockUsed: {},         // { nurseryTab: 1, wildDrop: 1, ... }
    lastActions: [],        // rolling recent to detect boredom
    boredomFlags: 0,
    firstWildDropMinute: null,
    eventLog: [],
    // bootstrap: gift plant = 10 bloom XP + 50 first-plant milestone = 60
    bootstrapXp: 60
  };
}

function applyBootstrap(p) {
  p.xp += p.bootstrapXp;
  p.level = getLevel(p.xp);
  p.eventLog.push({ m: 0, t: 'bootstrap', xp: p.bootstrapXp, lvl: p.level });
  for (let L = 2; L <= p.level; L++) {
    if (p.timeToLevel[L] == null) p.timeToLevel[L] = 0;
  }
}

function recordAction(p, name) {
  p.actionCounts[name] = (p.actionCounts[name] || 0) + 1;
  p.lastActions.push(name);
  if (p.lastActions.length > 30) p.lastActions.shift();
  if (p.lastActions.length >= 30) {
    const allSame = p.lastActions.every(a => a === p.lastActions[0] && a !== 'idle');
    if (allSame) p.boredomFlags++;
  }
}

function addXp(p, amount, source) {
  p.xp += amount;
  const prev = p.level;
  p.level = getLevel(p.xp);
  if (p.level > prev) {
    for (let L = prev + 1; L <= p.level; L++) {
      p.timeToLevel[L] = p.minutesPlayed;
    }
    p.eventLog.push({ m: p.minutesPlayed, t: 'level_up', lvl: p.level, src: source });
  }
}

module.exports = { newPlayer, applyBootstrap, recordAction, addXp };
