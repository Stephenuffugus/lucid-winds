'use strict';
// XP reward architecture helpers — mirrors docs/XP_REWARD_ARCHITECTURE.md.
// Every helper returns the XP granted (0 if deduped) so session.js can
// log / account. All state lives on the player object.

const { addXp } = require('./player');

function ensureState(p) {
  if (!p.xpSeen) p.xpSeen = {};            // one-time flags
  if (!p.xpDaily) p.xpDaily = {};          // daily flags { key: dayIndex }
  if (!p.xpCooldown) p.xpCooldown = {};    // { key: lastMinute }
  if (p.presenceSessionCount == null) p.presenceSessionCount = 0;
  if (p.presenceDayCount == null) p.presenceDayCount = 0;
  if (p.presenceDayIndex == null) p.presenceDayIndex = -1;
  if (!p.gamesThisSession) p.gamesThisSession = new Set();
  if (p.lastSessionDay == null) p.lastSessionDay = -1;
  if (p.lastActions == null) p.lastActions = [];
  if (!p.winStreak) p.winStreak = 0;
  if (p.speciesSet == null) p.speciesSet = new Set();
}

function grantOnce(p, id, amt, reason) {
  ensureState(p);
  if (p.xpSeen[id]) return 0;
  p.xpSeen[id] = 1;
  addXp(p, amt, reason);
  p.eventLog.push({ m: p.minutesPlayed, t: 'xp_once', id, amt });
  return amt;
}

function grantDaily(p, id, amt, reason) {
  ensureState(p);
  if (p.xpDaily[id] === p.dayIndex) return 0;
  p.xpDaily[id] = p.dayIndex;
  addXp(p, amt, reason);
  p.eventLog.push({ m: p.minutesPlayed, t: 'xp_daily', id, amt });
  return amt;
}

function grantCooldown(p, id, amt, reason, minSec) {
  ensureState(p);
  const last = p.xpCooldown[id] || -Infinity;
  if (p.minutesPlayed - last < (minSec / 60)) return 0;
  p.xpCooldown[id] = p.minutesPlayed;
  addXp(p, amt, reason);
  p.eventLog.push({ m: p.minutesPlayed, t: 'xp_cd', id, amt });
  return amt;
}

// DISCOVERY XP — first touch of each surface (approximated in sim as
// "the player has now exercised this kind of interaction"). Fires on
// the first time the archetype performs each action. Aligns with
// TAB_FIRST grants (~5 XP each, ~55 XP ceiling in the real UI).
function onActionFirstTime(p, actionName) {
  const discoveryMap = {
    playGame:     { id: 'disc_game',     amt: 5 },
    mintPlant:    { id: 'disc_mint',     amt: 8 },   // opens greenhouse carousel, card flip, drawer etc. — bundle
    dropWild:     { id: 'disc_wild',     amt: 15 },  // first wild drop ALSO opens map, backpack first use, etc
    collectFeral: { id: 'disc_feral',    amt: 8 },
    tendStranger: { id: 'disc_tend',     amt: 5 },
    breed:        { id: 'disc_breed',    amt: 8 },
  };
  const d = discoveryMap[actionName];
  if (!d) return 0;
  return grantOnce(p, d.id, d.amt, 'discover');
}

// TUTORIAL-PROXY XP — first-of-kind bonuses layered on top of the
// action's normal XP. Per doc §H, total pool ~100 XP.
function onActionFirstOfKind(p, actionName) {
  const tutMap = {
    mintPlant:    50,  // already in bootstrap for first plant; skip
    dropWild:     15,
    collectFeral: 10,
    tendStranger: 15,
    breed:        15,
  };
  const xp = tutMap[actionName];
  if (!xp || actionName === 'mintPlant') return 0;
  return grantOnce(p, 'first_' + actionName, xp, 'first_of_kind');
}

// RETURN XP — fires on session start if gap from lastSessionDay ≥ threshold.
function onSessionStart(p) {
  ensureState(p);
  const gap = p.lastSessionDay < 0 ? 0 : (p.dayIndex - p.lastSessionDay);
  let granted = 0;

  // Daily open (first session of the day)
  if (p.lastSessionDay !== p.dayIndex) {
    addXp(p, 5, 'return_daily');
    p.eventLog.push({ m: p.minutesPlayed, t: 'return', gap: 1, amt: 5 });
    granted += 5;

    // ≥24h gap (gap≥2 days means they skipped at least 1 day)
    if (gap >= 2) {
      addXp(p, 15, 'return_24h');
      p.eventLog.push({ m: p.minutesPlayed, t: 'return', gap, amt: 15 });
      granted += 15;
    }
    if (gap >= 4) {
      // Fires once per threshold crossing (using dayIndex as unique key)
      const id = 'return_3d_@' + p.dayIndex;
      grantOnce(p, id, 40, 'return_3d');
      granted += 40;
    }
    if (gap >= 8) {
      const id = 'return_7d_@' + p.dayIndex;
      grantOnce(p, id, 100, 'return_7d');
      granted += 100;
    }
  }

  p.lastSessionDay = p.dayIndex;
  // Reset per-session counters
  p.presenceSessionCount = 0;
  p.gamesThisSession = new Set();
  // Reset per-day presence counter on new day
  if (p.presenceDayIndex !== p.dayIndex) {
    p.presenceDayIndex = p.dayIndex;
    p.presenceDayCount = 0;
  }
  return granted;
}

// PRESENCE XP — call once per idle tick. 1 XP, cap 5/session, 10/day.
// Requires cooldown of 60s (in sim, 1 tick = 1 min, so natural).
function onIdleTick(p) {
  ensureState(p);
  if (p.presenceSessionCount >= 5) return 0;
  if (p.presenceDayCount >= 10) return 0;
  p.presenceSessionCount++;
  p.presenceDayCount++;
  addXp(p, 1, 'presence');
  p.eventLog.push({ m: p.minutesPlayed, t: 'presence' });
  return 1;
}

// READING/DWELL XP — fires when an archetype "reads" the plant it just
// minted. Approximate as a small chance each mint is followed by a read.
function onPostMintRead(p) {
  // 10% chance archetype reads a new plant's haiku + DNA ledger.
  // Haiku: 2 XP (unique-key per plant, cap 5/day). DNA: 3 XP (one-time per plant).
  // We approximate with daily cap only; "plant hash" = plants count.
  ensureState(p);
  const haikuId = 'haiku_' + p.plants;
  if (grantDaily(p, 'haiku_daily_cap', 0, '')) {} // placeholder
  // Simple approximation: each read rewards 2 (haiku) + 3 (DNA) = 5 XP, once per new mint.
  return grantOnce(p, 'read_plant_' + p.plants, 5, 'read_plant');
}

// PATTERN XP — 3 different games in a session
function onGamePlayed(p, gameId) {
  ensureState(p);
  p.gamesThisSession.add(gameId);
  if (p.gamesThisSession.size === 3) {
    return grantDaily(p, 'three_games', 10, 'pattern_three_games');
  }
  return 0;
}

// MASTERY XP — win streak 3/5
function onGameWin(p) {
  ensureState(p);
  p.winStreak++;
  if (p.winStreak === 3) {
    return grantCooldown(p, 'streak_3', 5, 'mastery_streak3', 600);
  }
  if (p.winStreak === 5) {
    return grantCooldown(p, 'streak_5', 15, 'mastery_streak5', 1200);
  }
  return 0;
}
function onGameLoss(p) {
  ensureState(p);
  p.winStreak = 0;
}

// FERAL SPECIES PATTERN — 5 different feral species
function onFeralCollected(p, speciesId) {
  ensureState(p);
  p.speciesSet.add(speciesId);
  if (p.speciesSet.size === 5) {
    return grantOnce(p, 'five_species', 20, 'pattern_species5');
  }
  return 0;
}

module.exports = {
  grantOnce, grantDaily, grantCooldown,
  onActionFirstTime, onActionFirstOfKind,
  onSessionStart, onIdleTick, onPostMintRead,
  onGamePlayed, onGameWin, onGameLoss, onFeralCollected
};
