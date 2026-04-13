'use strict';
// 12 archetypes. tickMix keys are action names resolved by actions.js.
// Each tick = 1 in-game minute.

const ARCHETYPES = [
  {
    name: 'Completionist',
    sessionMinutes: rng => rng.int(30, 75),
    sessionsPerDay: rng => rng.int(1, 2),
    dropoutChance: 0.01,
    tickMix: { playGame: 0.35, mintPlant: 0.15, dropWild: 0.12, collectFeral: 0.12, tendStranger: 0.12, breed: 0.07, idle: 0.07 },
    unlockReactionMs: 2000
  },
  {
    name: 'Grinder',
    sessionMinutes: rng => rng.int(45, 120),
    sessionsPerDay: rng => rng.int(1, 3),
    dropoutChance: 0.05,
    tickMix: { playGame: 0.75, mintPlant: 0.15, dropWild: 0.02, collectFeral: 0.02, tendStranger: 0.01, breed: 0.02, idle: 0.03 },
    unlockReactionMs: 60000
  },
  {
    name: 'Explorer',
    sessionMinutes: rng => rng.int(15, 45),
    sessionsPerDay: rng => rng.int(1, 3),
    dropoutChance: 0.02,
    tickMix: { playGame: 0.25, mintPlant: 0.08, dropWild: 0.25, collectFeral: 0.22, tendStranger: 0.12, breed: 0.03, idle: 0.05 },
    unlockReactionMs: 3000
  },
  {
    name: 'Social',
    sessionMinutes: rng => rng.int(20, 50),
    sessionsPerDay: rng => rng.int(2, 4),
    dropoutChance: 0.03,
    tickMix: { playGame: 0.25, mintPlant: 0.05, dropWild: 0.1, collectFeral: 0.1, tendStranger: 0.42, breed: 0.03, idle: 0.05 },
    unlockReactionMs: 3000
  },
  {
    name: 'Drifter',
    sessionMinutes: rng => rng.int(1, 4),
    sessionsPerDay: rng => rng.int(3, 8),
    dropoutChance: 0.1,
    tickMix: { playGame: 0.4, mintPlant: 0.1, dropWild: 0.1, collectFeral: 0.15, tendStranger: 0.1, breed: 0.05, idle: 0.1 },
    unlockReactionMs: 30000
  },
  {
    name: 'Binger',
    sessionMinutes: rng => rng.int(100, 180),
    sessionsPerDay: rng => 1,
    dropoutChance: 0.5,
    tickMix: { playGame: 0.5, mintPlant: 0.12, dropWild: 0.1, collectFeral: 0.1, tendStranger: 0.08, breed: 0.05, idle: 0.05 },
    unlockReactionMs: 5000
  },
  {
    name: 'Cautious',
    sessionMinutes: rng => rng.int(10, 25),
    sessionsPerDay: rng => rng.int(1, 2),
    dropoutChance: 0.03,
    tickMix: { playGame: 0.45, mintPlant: 0.1, dropWild: 0.05, collectFeral: 0.05, tendStranger: 0.05, breed: 0.02, idle: 0.28 },
    unlockReactionMs: 120000
  },
  {
    name: 'Chaos',
    sessionMinutes: rng => rng.int(5, 60),
    sessionsPerDay: rng => rng.int(1, 5),
    dropoutChance: 0.08,
    tickMix: { playGame: 0.16, mintPlant: 0.14, dropWild: 0.14, collectFeral: 0.14, tendStranger: 0.14, breed: 0.14, idle: 0.14 },
    unlockReactionMs: 10000
  },
  {
    name: 'Puzzler',
    sessionMinutes: rng => rng.int(20, 60),
    sessionsPerDay: rng => rng.int(1, 2),
    dropoutChance: 0.02,
    tickMix: { playGame: 0.85, mintPlant: 0.08, dropWild: 0.01, collectFeral: 0.01, tendStranger: 0.01, breed: 0.02, idle: 0.02 },
    unlockReactionMs: 90000
  },
  {
    name: 'Breeder',
    sessionMinutes: rng => rng.int(20, 60),
    sessionsPerDay: rng => rng.int(1, 3),
    dropoutChance: 0.03,
    tickMix: { playGame: 0.3, mintPlant: 0.25, dropWild: 0.03, collectFeral: 0.05, tendStranger: 0.05, breed: 0.28, idle: 0.04 },
    unlockReactionMs: 5000
  },
  {
    name: 'Casual',
    sessionMinutes: rng => rng.int(5, 12),
    sessionsPerDay: rng => (rng.next() < 0.43 ? 1 : 0),  // ~3 days/week
    dropoutChance: 0.06,
    tickMix: { playGame: 0.5, mintPlant: 0.08, dropWild: 0.08, collectFeral: 0.1, tendStranger: 0.12, breed: 0.02, idle: 0.1 },
    unlockReactionMs: 60000
  },
  {
    name: 'Lapser',
    sessionMinutes: rng => rng.int(10, 30),
    sessionsPerDay: rng => 1,      // session happens; days-off handled externally
    dropoutChance: 0.0,            // day-off pattern modeled in run loop
    tickMix: { playGame: 0.45, mintPlant: 0.12, dropWild: 0.1, collectFeral: 0.1, tendStranger: 0.1, breed: 0.05, idle: 0.08 },
    unlockReactionMs: 30000,
    lapser: true                   // flag: 1 day on, 7 days off, back on day 8...
  },
  // ═══ HYBRID ARCHETYPES (round 2) ═══
  {
    name: 'Wanderer',   // Explorer + Cautious hybrid: walks a lot, short contemplative sessions
    sessionMinutes: rng => rng.int(15, 30),
    sessionsPerDay: rng => rng.int(1, 3),
    dropoutChance: 0.02,
    tickMix: { playGame: 0.2, mintPlant: 0.05, dropWild: 0.2, collectFeral: 0.2, tendStranger: 0.15, breed: 0.02, idle: 0.18 },
    unlockReactionMs: 8000
  },
  {
    name: 'Streaker',   // Daily login obsessed, short sessions, maximize streak
    sessionMinutes: rng => rng.int(5, 15),
    sessionsPerDay: rng => 1,
    dropoutChance: 0.015,   // very sticky — chasing the streak
    tickMix: { playGame: 0.5, mintPlant: 0.1, dropWild: 0.1, collectFeral: 0.1, tendStranger: 0.1, breed: 0.02, idle: 0.08 },
    unlockReactionMs: 10000
  },
  {
    name: 'Gardener',   // Greenhouse-only, barely touches Wild
    sessionMinutes: rng => rng.int(20, 50),
    sessionsPerDay: rng => rng.int(1, 2),
    dropoutChance: 0.025,
    tickMix: { playGame: 0.4, mintPlant: 0.25, dropWild: 0.02, collectFeral: 0.02, tendStranger: 0.02, breed: 0.2, idle: 0.09 },
    unlockReactionMs: 20000
  },
  {
    name: 'Naturalist', // Completionist-style but prefers observation over combat
    sessionMinutes: rng => rng.int(25, 60),
    sessionsPerDay: rng => rng.int(1, 2),
    dropoutChance: 0.015,
    tickMix: { playGame: 0.25, mintPlant: 0.1, dropWild: 0.15, collectFeral: 0.15, tendStranger: 0.15, breed: 0.05, idle: 0.15 },
    unlockReactionMs: 5000
  },
  {
    name: 'Weekender',  // Only plays Sat/Sun but long sessions
    sessionMinutes: rng => rng.int(60, 150),
    sessionsPerDay: rng => 1,
    dropoutChance: 0.05,
    tickMix: { playGame: 0.4, mintPlant: 0.15, dropWild: 0.1, collectFeral: 0.15, tendStranger: 0.1, breed: 0.05, idle: 0.05 },
    unlockReactionMs: 8000,
    weekender: true   // day % 7 in [5,6]
  },
  {
    name: 'Commuter',   // Micro-session during commute, twice daily, medium patience
    sessionMinutes: rng => rng.int(8, 18),
    sessionsPerDay: rng => 2,
    dropoutChance: 0.025,
    tickMix: { playGame: 0.6, mintPlant: 0.1, dropWild: 0.08, collectFeral: 0.1, tendStranger: 0.06, breed: 0.02, idle: 0.04 },
    unlockReactionMs: 15000
  }
];

module.exports = { ARCHETYPES };
