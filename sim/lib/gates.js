'use strict';
// Each gate returns true if the capability is unlocked at the given level.
// Capability keys:
//   nurseryTab, wildTab, wildDrop, feralCollect, strangerTend,
//   sinks (mystery/slots/weather), classPick, greenhouseBreed,
//   classXp, potsShop, boostersShop, fruitHarvest
//   mintPlant (always true in both — gated by 30 sunbeams, not level)

// GATES_A — current shipped game behavior (per index.html canSee + ungated features)
const GATES_A = {
  nurseryTab:      lvl => true,         // currently visible from start
  wildTab:         lvl => true,         // wildTab gated by plant count in code, but level-wise: always
  wildDrop:        lvl => true,         // ungated
  feralCollect:    lvl => true,         // ungated
  strangerTend:    lvl => lvl >= 5,
  sinks:           lvl => true,         // keeper-bar buttons currently visible
  classPick:       lvl => lvl >= 7,
  greenhouseBreed: lvl => lvl >= 7,
  classXp:         lvl => lvl >= 7,
  potsShop:        lvl => true,
  boostersShop:    lvl => true,
  fruitHarvest:    lvl => lvl >= 10,
  mintPlant:       lvl => true
};

// GATES_B — proposed ladder from docs/TUTORIAL_PROGRESSION.md
const GATES_B = {
  nurseryTab:      lvl => lvl >= 2,
  wildTab:         lvl => lvl >= 3,
  wildDrop:        lvl => lvl >= 3,
  feralCollect:    lvl => lvl >= 4,
  strangerTend:    lvl => lvl >= 5,
  sinks:           lvl => lvl >= 6,
  classPick:       lvl => lvl >= 7,
  greenhouseBreed: lvl => lvl >= 7,
  classXp:         lvl => lvl >= 8,
  potsShop:        lvl => lvl >= 9,
  boostersShop:    lvl => lvl >= 10,
  fruitHarvest:    lvl => lvl >= 10,
  mintPlant:       lvl => true
};

module.exports = { GATES_A, GATES_B };
