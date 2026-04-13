'use strict';
const { ACTIONS, ACTION_GATE } = require('./actions');

// Filter tickMix by available gates given current player level.
function availableMix(mix, gates, lvl) {
  const out = {};
  let total = 0;
  for (const k of Object.keys(mix)) {
    const gateKey = ACTION_GATE[k];
    if (gateKey && !gates[gateKey](lvl)) continue;
    out[k] = mix[k];
    total += mix[k];
  }
  if (total === 0) { out.playGame = 1; }
  return out;
}

function runSession(player, archetype, gates, minutes) {
  player.sessionsPlayed++;
  player.wildDropsToday = 0;
  for (let i = 0; i < minutes; i++) {
    const mix = availableMix(archetype.tickMix, gates, player.level);
    let action = player.rng.weighted(mix);

    // Priority override: if we have 30+ sunbeams, high chance to mint
    if (player.sunbeams >= 30 && gates.mintPlant(player.level) && player.rng.chance(0.5)) {
      action = 'mintPlant';
    }

    const fn = ACTIONS[action];
    const executed = fn ? fn(player) : false;
    if (!executed) {
      // fallback: play a game
      ACTIONS.playGame(player);
    }
    player.minutesPlayed++;
    if (player.level >= 12) return; // target reached, session can end early
  }
}

module.exports = { runSession, availableMix };
