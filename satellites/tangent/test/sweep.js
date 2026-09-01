// TANGENT solvability sweep — release-time sweep 0.2 s steps x 60 per level.
// Regression gates (BUILD-HANDOFF.md sect 14): no level below 5 landing
// windows; hazard levels keep crashes > 0. Run: node test/sweep.js
const { load, trial } = require("./harness");

const HAZARD_LEVELS = [2, 3, 4, 6]; // Not the nearest, Around the heavy, Threading, Two minds
const T = load();
let fail = 0;
console.log("level                 | lands | crashes | lost/miss | first window");
for(let i = 0; i < T.LEVELS.length; i++){
  let lands = 0, crashes = 0, other = 0, first = null;
  for(let k = 1; k <= 60; k++){
    const t = k * 0.2;
    const r = trial(T, i, t);
    if(r.outcome === "land"){ lands++; if(first === null) first = t; }
    else if(r.outcome === "crash") crashes++;
    else other++;
  }
  const name = T.LEVELS[i].name.padEnd(21);
  console.log(`${name} |  ${String(lands).padStart(2)}   |   ${String(crashes).padStart(2)}    |    ${String(other).padStart(2)}     | ${first === null ? "NONE" : first.toFixed(1) + " s"}`);
  if(lands < 5){ console.log(`  FAIL ${T.LEVELS[i].name}: ${lands} landing windows, gate is 5`); fail++; }
  if(HAZARD_LEVELS.includes(i) && crashes === 0){ console.log(`  FAIL ${T.LEVELS[i].name}: hazard level with zero crashes`); fail++; }
}
console.log(fail ? `\nSWEEP FAIL (${fail})` : "\nSWEEP OK");
process.exit(fail ? 1 : 0);
