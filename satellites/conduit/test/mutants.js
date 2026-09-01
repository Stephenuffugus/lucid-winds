// CONDUIT mutation harness — the gate's own gate.
//
// HANDOFF-CONDUIT rule 3: "a gate you have not personally watched FAIL at least
// once is decoration." This file makes that a re-runnable artifact instead of a
// ritual. Each mutant breaks exactly one mechanic in a scratch copy of
// index.html, runs the full smoke suite against that copy, and records which
// assertions died.
//
//   KILLED   — at least one assertion caught the break. The gate is real.
//   SURVIVED — every assertion still passed while the mechanic was broken.
//              That names a decorative test. Fix the test, not the mutant.
//
// The real index.html is never written to; the suite is pointed at the scratch
// copy through the CONDUIT_HTML env var (see harness.js).
//
//   node test/mutants.js            run them all
//   node test/mutants.js splice     run the ones whose id matches
//
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SRC = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "conduit-mutants-"));

// Each mutant: a unique anchor in index.html, what it becomes, and the mechanic
// it destroys. `expect` is a substring of the assertion name that MUST go red.
//
// Not here on purpose: the drag's finger-versus-route-end desync. lastTouchTile
// only exists on the DOM input path, so a node level mutant of it can never be
// reached by this suite. That property is proved in test/controls.js instead,
// with real touch events. A mutant the suite cannot reach is noise, not a gate.
const MUTANTS = [
  { id: "ledger-reclaim-tax", why: "reclaim credits the blob but never debits owned",
    from: "  S.ledger.owned -= tax; S.ledger.debits.reclaimTax += tax;",
    to:   "  S.ledger.debits.reclaimTax += tax;",
    expect: "invariant" },

  { id: "ledger-damage", why: "damage leaves the blob but is never debited from owned",
    from: "  b.mass -= applied; S.ledger.owned -= applied; S.ledger.debits.damage += applied;",
    to:   "  b.mass -= applied; S.ledger.debits.damage += applied;",
    expect: "invariant" },

  { id: "ledger-overflow-discarded", why: "capacity overflow is thrown away instead of banked",
    from: "  if(over>0){ blob().mass -= over; S.ledger.owned -= over;\n    S.player.residue += over; S.ledger.toResidue += over; }",
    to:   "  if(over>0){ blob().mass -= over; S.ledger.owned -= over; }",
    expect: "residue" },

  { id: "route-self-cross", why: "conduit may cross itself",
    from: "  if(!CFG.allowSelfCross && d.path.some(p=>p[0]===x&&p[1]===y)) return;",
    to:   "  if(false) return;",
    expect: "cross itself" },

  { id: "route-non-adjacent", why: "a route may jump across the map in one step",
    from: "  if(Math.abs(last[0]-x)+Math.abs(last[1]-y)!==1) return;     // orthogonal, one tile",
    to:   "  if(false) return;",
    expect: "non-adjacent" },

  { id: "route-through-walls", why: "conduit may be laid through solid wall",
    from: "  if(!conduitable(x,y)) return;",
    to:   "  if(false) return;",
    expect: "" },

  { id: "cost-concealed-mult", why: "concealed tiles cost the same as open floor",
    from: "  return CFG.costPerTile * (expConduit(i)===2 && CONC[i] ? CFG.concealedMult",
    to:   "  return CFG.costPerTile * (false ? CFG.concealedMult",
    expect: "concealed tile costs 1.6" },

  { id: "cost-splice-inert", why: "the splice unlock stops making site wire free",
    from: "  if(S.player.traits.splice && onSiteWire(x,y)) return 0;",
    to:   "  if(false) return 0;",
    expect: "spliced" },

  { id: "power-budget-ignored", why: "one source powers unlimited devices",
    from: "    if(used[src.id]+dv.needs<=src.capacity){",
    to:   "    if(true){",
    expect: "budget" },

  { id: "squeeze-vent-open", why: "a full body can enter a squeeze only vent",
    from: "  if(t===VENT) return mass < CFG.squeezeAt;",
    to:   "  if(t===VENT) return true;",
    expect: "vent" },

  { id: "force-door-open", why: "a door is passable without forcing it",
    from: "  if(t===DOOR) return false;",
    to:   "  if(false) return false;",
    expect: "" },

  { id: "envelop-min-mass", why: "a thin body can smother",
    from: "  if(b.mass < CFG.envelop.minMass) return null;",
    to:   "  if(false) return null;",
    expect: "thin body cannot smother" },

  { id: "envelop-aware-target", why: "smother works on a guard that is already hunting you",
    from: "    if(!isUnaware(e)) continue;",
    to:   "    if(false) continue;",
    expect: "" },

  { id: "tap-free", why: "the tap noise costs nothing",
    from: "  b.mass-=CFG.tap.cost; S.ledger.owned-=CFG.tap.cost; S.ledger.debits.damage+=CFG.tap.cost;",
    to:   "  S.player.tapT=1.0;",
    expect: "tap costs mass" },

  { id: "douse-noop", why: "drinking a light leaves the floor lit",
    from: "    if(TT[idx(x,y)]===FLOOR) TT[idx(x,y)]=SHADOW; }",
    to:   "    ; }",
    expect: "dousing turns the pool to shadow" },

  { id: "body-not-evidence", why: "a guard walks past a corpse without escalating",
    from: "      bd.found=true; bump(3,\"body found\"); setGoal(e, bd.x, bd.y, \"investigate\"); } }",
    to:   "      bd.found=true; } }",
    expect: "body escalates" },

  { id: "reclaim-full-refund", why: "reclaim refunds 100 percent, the central tension is gone",
    from: "  const back = cost*CFG.reclaimRate, tax = cost-back;",
    to:   "  const back = cost, tax = 0;",
    expect: "75%" },

  { id: "min-blob-floor", why: "you may spend yourself below the hard floor",
    from: "  if(blob().mass - (d.cost + c) < CFG.minBlobMass){ toast(\"Not enough of you left.\"); return; }",
    to:   "  if(false){ return; }",
    expect: "" },

  { id: "enemy-walks-walls", why: "enemy pathing ignores geometry",
    from: "  const t=TT[idx(x,y)]; return t===FLOOR||t===SHADOW; }",
    to:   "  return true; }",
    expect: "" },

  { id: "los-never-blocked", why: "line of sight passes through solid wall",
    from: "    if(!inB(x,y)||TT[idx(x,y)]===WALL||TT[idx(x,y)]===DOOR) return false;",
    to:   "    if(false) return false;",
    expect: "line of sight" },

  { id: "conduit-conceal-spotted", why: "concealed conduit becomes spottable",
    from: "        const i=idx(p[0],p[1]); if(expConduit(i)===2) continue;   // concealed: never",
    to:   "        const i=idx(p[0],p[1]);",
    expect: "spot progress" },

  { id: "conceal-tier-downgrade", why: "concealed ground is scored as merely shadowed",
    from: "  if(CONC[i]) return 2; const t=TT[i];",
    to:   "  if(CONC[i]) return 1; const t=TT[i];",
    expect: "never discovered" },

  { id: "force-hold-per-axis", why: "the force hold is cleared by an axis with no input (the C1 bug, restored)",
    from: "  if(!pressing) S.player.forceT=0;",
    to:   "  if(!pressing || !vx) S.player.forceT=0;",
    expect: "grew while pressed" },

  { id: "no-lockdown-reachable", why: "escalation can never exceed the level it reads (the C2 bug, restored)",
    from: "               : S.site.alert<2 ? 2 : Math.min(4, S.site.alert+1);",
    to:   "               : Math.max(2, S.site.alert);",
    expect: "Lockdown" },

  { id: "spot-every-frame", why: "the sighting bump is not edge triggered",
    from: "    if(!e.seen){\n      e.seen=true;",
    to:   "    if(true){\n      e.seen=true;",
    expect: "every frame" },

  { id: "breaker-cannot-power", why: "lockdown skips every conduit, so the way out is dead (the C2 bug, restored)",
    from: "    if(S.site.lockdown && dv.kind!==\"breaker\") continue;",
    to:   "    if(S.site.lockdown) continue;",
    expect: "breaker can be energised" },

  { id: "lockdown-powers-everything", why: "a lockdown that cuts nothing",
    from: "    if(S.site.lockdown && dv.kind!==\"breaker\") continue;",
    to:   "    if(false) continue;",
    expect: "lockdown" },

  { id: "assist-through-walls", why: "the route assist ignores geometry",
    from: "      if(!conduitable(nx,ny)) continue;",
    to:   "      if(false) continue;",
    expect: "wall" },

  { id: "assist-not-cheapest", why: "the assist takes the shortest route, not the cheapest",
    from: "      const nd=d+tileCost(nx,ny);",
    to:   "      const nd=d+1;",
    expect: "true cheapest" },

  { id: "assist-lays-what-you-cannot-afford", why: "an unaffordable route is laid in part",
    from: "  if(blob().mass-price<CFG.minBlobMass){",
    to:   "  if(false){",
    expect: "refused" },

  { id: "restart-keeps-scan-phase", why: "a restart inherits the previous game's conduit scan phase",
    from: "  T=0; cscanT=0;",
    to:   "  T=0;",
    expect: "identically to the first" },

  { id: "ferro-touches-sim", why: "the render layer writes to game state",
    from: "  FX.r  += FX.rv*dt;",
    to:   "  FX.r  += FX.rv*dt; blob().x += dt*1e-6;",
    expect: "identical with the ferro layer" },

  { id: "ferro-spike-off-axis", why: "the longest spike no longer tracks the field",
    from: "    const al = Math.cos(th - fa);",
    to:   "    const al = Math.cos(th - fa + 0.35);",
    expect: "points along the field" },

  { id: "ferro-no-spikes", why: "the field strength stops deforming the outline",
    from: "    const k = 1 + 0.30 * s * pole + 0.55 * s * pole * cones + wob * (0.5 + 0.5 * s);",
    to:   "    const k = 1 + wob * (0.5 + 0.5 * s);",
    expect: "spikes further" },

  { id: "carry-and-absorb", why: "you eat the body you reached down to pick up",
    from: "    const carried = S.act.verb===\"drag\" && S.act.target===bd;",
    to:   "    const carried = false;",
    expect: "comes with you" },

  { id: "drag-not-slow", why: "carrying a body costs you no speed",
    from: "  if(S.act.verb===\"drag\")   sp*=CFG.drag.speedMult*(S.player.traits.dragMult||1);",
    to:   "  if(false) sp*=CFG.drag.speedMult;",
    expect: "slower than walking" },

  { id: "drag-silent", why: "dragging a body makes no noise",
    from: "      setGoal(e, b.x, b.y, \"investigate\"); }\n  }\n}",
    to:   "      ; }\n  }\n}",
    expect: "noise a patrol comes to" },

  { id: "drag-frees-hands", why: "you can plan routes while carrying a corpse",
    from: "  if(S.act.verb===\"drag\"||S.act.verb===\"cart\") return false;   // hands full",
    to:   "  if(false) return false;",
    expect: "hands are full" },

  { id: "peek-free", why: "recon costs nothing to hold",
    from: "  b.mass-=cost; S.ledger.owned-=cost; S.ledger.debits.damage+=cost;",
    to:   "  ;",
    expect: "costs mass while it is held" },

  { id: "peek-through-walls", why: "the tendril sees through solid rock",
    from: "    if(!inB(tx|0,ty|0)||TT[idx(tx|0,ty|0)]===WALL) break;",
    to:   "    if(!inB(tx|0,ty|0)) break;",
    expect: "stops at the wall" },

  { id: "cling-tunnels", why: "clinging lets you swim through solid rock",
    from: "    if(inB(nx,ny) && TT[idx(nx,ny)]!==WALL) return true; }\n  return false;\n}",
    to:   "    if(true) return true; }\n  return false;\n}",
    expect: "solid rock is not" },

  { id: "cling-no-benefit", why: "clinging does not lower your profile",
    from: "    if(S.player.clinging) secs*=1/CFG.cling.spotMult;   // half the profile",
    to:   "    if(false) secs*=1/CFG.cling.spotMult;",
    expect: "longer to be spotted" },

  { id: "pool-no-benefit", why: "flattening does not slow the spot",
    from: "    if(isPooled())        secs*=CFG.pool.spotMult;      // twice as slow to spot",
    to:   "    if(false) secs*=CFG.pool.spotMult;",
    expect: "more slowly" },

  { id: "pool-instant", why: "you are flat the moment you stop",
    from: "function isPooled(){ return S.player.stillT >= CFG.pool.sec && !S.act.verb; }",
    to:   "function isPooled(){ return !S.act.verb; }",
    expect: "not pooled the moment you stop" },

  { id: "cart-weightless", why: "a battery cart costs you no speed to push",
    from: "  if(S.act.verb===\"cart\")   sp*=CFG.cart.speedMult;     // heavier still",
    to:   "  if(false) sp*=CFG.cart.speedMult;",
    expect: "heavier than a body" },

  { id: "cart-through-walls", why: "the cart rolls through solid geometry",
    from: "  if(inB(tx,ty) && (TT[idx(tx,ty)]===FLOOR||TT[idx(tx,ty)]===SHADOW)){",
    to:   "  if(true){",
    expect: "never rolls into a wall" },

  { id: "source-teleports-power", why: "a source keeps feeding a run it has walked away from",
    from: "    const h=cd.path[0]; if(h[0]!==src.x||h[1]!==src.y) continue;   // it walked off",
    to:   "    ;",
    expect: "wheeling the source away" },

  { id: "coolant-no-battery", why: "a frozen guard is not a source",
    from: "  S.sources.push({ id:\"froz-\"+e.id, x:e.x|0, y:e.y|0, kind:\"frozen\",",
    to:   "  if(false) S.sources.push({ id:\"froz-\"+e.id, x:e.x|0, y:e.y|0, kind:\"frozen\",",
    expect: "becomes a source" },

  { id: "coolant-battery-persists", why: "the battery outlives the freeze",
    from: "  const i=S.sources.findIndex(s=>s.id===\"froz-\"+e.id);\n  if(i>=0) S.sources.splice(i,1);\n  if(e.state===\"frozen\")",
    to:   "  const i=-1;\n  if(i>=0) S.sources.splice(i,1);\n  if(e.state===\"frozen\")",
    expect: "battery is gone with it" },

  { id: "frozen-still-hunts", why: "a frozen guard keeps its senses and its legs",
    from: "    return;                                    // frozen: no senses, no legs",
    to:   "    ;",
    expect: "" },

  { id: "no-harvest-grace", why: "a body you just made is absorbed before you can choose to carry it",
    from: "    bd.grace=Math.max(0,(bd.grace===undefined?CFG.harvestGraceSec:bd.grace)-wdt);",
    to:   "    bd.grace=0;",
    expect: "offer to carry it" },

  { id: "floodlight-no-expose", why: "a floodlight lights ground without exposing it",
    from: "function expConduit(i){ if(LIT[i]) return 0;      // a floodlight beats cover",
    to:   "function expConduit(i){ if(false) return 0;",
    expect: "lit ground is exposed" },

  { id: "fan-no-push", why: "the fan blows and nothing moves",
    from: "      if(inB(nx|0,ny|0) && TT[idx(nx|0,ny|0)]!==WALL){ bd.x=nx; bd.y=ny; bd.found=false; }",
    to:   "      ;",
    expect: "shoves a body along" },

  { id: "fan-pushes-into-walls", why: "the fan shoves bodies through geometry",
    from: "      const nx=bd.x+dx, ny=bd.y+dy;\n      if(inB(nx|0,ny|0) && TT[idx(nx|0,ny|0)]!==WALL){",
    to:   "      const nx=bd.x+dx, ny=bd.y+dy;\n      if(true){",
    expect: "into a wall" },

  { id: "crane-harmless", why: "the crane drops on nothing",
    from: "      if((e.x|0)===dv.drop[0] && (e.y|0)===dv.drop[1]) killEnemy(e,\"crane\");",
    to:   "      ;",
    expect: "crushes what is under it" },

  { id: "crane-reaches-everywhere", why: "the crane crushes anything in the room",
    from: "      if((e.x|0)===dv.drop[0] && (e.y|0)===dv.drop[1]) killEnemy(e,\"crane\");",
    to:   "      killEnemy(e,\"crane\");",
    expect: "beside it" },

  { id: "doorlock-forgets-a-forced-door", why: "the lock shuts a door a body forced",
    from: "    else if(TT[i]===FLOOR) dv.forcedAlready=true;   // a body got here first",
    to:   "    ;",
    expect: "never shuts it behind you" },

  { id: "doorlock-never-shuts", why: "the lock opens but never closes, so it cannot trap anything",
    from: "      if(!occupied){ TT[i]=DOOR; dv.openedByLock=false; }",
    to:   "      ;",
    expect: "shuts it again" },

  { id: "camera-blind", why: "the camera is on and shows nothing",
    from: "    S.seen = S.enemies.filter(e => e.state!==\"dead\" &&",
    to:   "    S.seen = [].filter(e => e.state!==\"dead\" &&",
    expect: "shows you what it can see" },

  { id: "camera-sees-everything", why: "the camera ignores its own range",
    from: "      Math.hypot(e.x-dv.x, e.y-dv.y) <= CFG.camera.range).map(e=>e.id);",
    to:   "      true).map(e=>e.id);",
    expect: "only shows what is in range" },

  { id: "vehicle-never-flat", why: "the one shot battery is infinite",
    from: "      src.capacity=0; resolvePower();",
    to:   "      ;",
    expect: "runs out" },

  { id: "save-clobbers", why: "a write overwrites the whole save instead of merging",
    from: "  const disk=readSave();\n  const out=Object.assign({}, disk);",
    to:   "  const disk=readSave();\n  const out=BLANK_SAVE();",
    expect: "does not wipe another" },

  { id: "save-counters-set", why: "residue is set rather than added",
    from: "  if(patch.residueDelta) out.residue = (disk.residue||0) + patch.residueDelta;",
    to:   "  if(patch.residueDelta) out.residue = patch.residueDelta;",
    expect: "add rather than overwrite" },

  { id: "save-best-wrong-way", why: "a worse result overwrites a better one",
    from: "    out[k] = MEDAL_BETTER[k]>0 ? Math.max(disk[k],mine[k]) : Math.min(disk[k],mine[k]);",
    to:   "    out[k] = mine[k];",
    expect: "better one kept" },

  { id: "grind-pays-every-time", why: "a replay banks the full yield again",
    from: "  const banked=Math.max(0, S.player.residue-(prev.bestResidue||0));",
    to:   "  const banked=S.player.residue;",
    expect: "banks nothing" },

  { id: "trait-free", why: "traits cost nothing",
    from: "  if((sv.residue||0) < price) return false;",
    to:   "  if(false) return false;",
    expect: "" },

  { id: "trait-no-cap", why: "a trait can be bought past its cap",
    from: "  if(traitRank(sv,id) >= t.max) return false;",
    to:   "  if(false) return false;",
    expect: "caps where the table says" },

  { id: "traits-never-reach-the-run", why: "what you bought does not apply to a run",
    from: "  applyLights();\n  applyTraits();",
    to:   "  applyLights();",
    expect: "splice is on in the run" },

  { id: "capacity-moves-the-thresholds", why: "growing capacity scales the squeeze threshold",
    from: "  capacity:100, costPerTile:1, concealedMult:1.6, reclaimRate:0.75,",
    to:   "  capacity:100, costPerTile:1, concealedMult:1.6, reclaimRate:1.0,",
    expect: "refund itself is untouched" },

  { id: "resume-loses-the-wire", why: "a resumed run comes back without its conduits",
    from: "  S.conduits=r.conduits; S.bodies=r.bodies;",
    to:   "  S.bodies=r.bodies;",
    expect: "wire is still laid" },

  { id: "resume-restarts-the-clock", why: "a resumed run forgets how long it has taken",
    from: "  S.site={ ...r.site }; S.stats={ ...r.stats };",
    to:   "  S.site={ ...r.site };",
    expect: "clock did not restart" },

  { id: "level-template-shared", why: "a run edits the level it came from",
    from: "    sources: clone(L.sources),",
    to:   "    sources: L.sources,",
    expect: "clean copy of its level" },

  { id: "vent-blocks-wire", why: "a vent stops conduit as well as bodies, which kills level three",
    from: "  const t=TT[idx(x,y)]; return t!==WALL && t!==DOOR; }",
    to:   "  const t=TT[idx(x,y)]; return t!==WALL && t!==DOOR && t!==VENT; }",
    expect: "goes through the vent" },

  { id: "spot-decay-none", why: "spot progress never decays once you break line of sight",
    from: "  } else e.spot=Math.max(0, e.spot-CFG.spotDecay*dt);",
    to:   "  } else { }",
    expect: "decays" },

  { id: "draft-no-fill", why: "a drag that skips tiles no longer fills the gap",
    from: "  while(guard++<CFG.ui.draftFillMax){",
    to:   "  while(guard++<1){",
    expect: "fills in the ones between" },

  { id: "draft-no-corner", why: "a drag cannot turn a corner when the first axis is walled",
    from: "    if(!moved && dy){ draftStep(e[0], e[1]+dy); n=d.path[d.path.length-1];",
    to:   "    if(false && dy){ draftStep(e[0], e[1]+dy); n=d.path[d.path.length-1];",
    expect: "turns the corner" },

  { id: "zap-no-burn", why: "a zap costs the enemy but not the wire",
    from: "  const n=Math.min(CFG.zapBurnTiles, cd.path.length-k);",
    to:   "  const n=0;",
    expect: "burns exactly" },

  { id: "zap-books-elsewhere", why: "burned mass is filed under the wrong cause",
    from: "ledgerDestroy(c,cd,\"zapBurn\"); }",
    to:   "ledgerDestroy(c,cd); }",
    expect: "booked to zapBurn" },

  { id: "harvest-free", why: "harvesting a body credits nothing",
    from: "      bd.mass-=take; ledgerGain(take,\"harvest\"); }",
    to:   "      bd.mass-=take; }",
    expect: "harvests" },
];

const filter = process.argv[2];
const list = filter ? MUTANTS.filter(m => m.id.includes(filter)) : MUTANTS;

function runOne(m) {
  if (SRC.split(m.from).length - 1 !== 1) {
    return { ...m, status: "ANCHOR", fails: [], note:
      `anchor appears ${SRC.split(m.from).length - 1} times, expected exactly 1` };
  }
  const file = path.join(TMP, m.id + ".html");
  fs.writeFileSync(file, SRC.replace(m.from, m.to));
  let out = "";
  try {
    out = execFileSync(process.execPath, [path.join(__dirname, "smoke.js")],
      { env: { ...process.env, CONDUIT_HTML: file }, encoding: "utf8" });
  } catch (e) {
    // a non-zero exit is the normal, healthy outcome for a mutant
    out = (e.stdout || "") + (e.stderr || "");
  }
  const fails = out.split("\n").filter(l => l.startsWith("  FAIL"))
                   .map(l => l.replace(/^ {2}FAIL {2}/, "").split("  →")[0].trim());
  // A mutant that makes the suite throw instead of fail is still killed, but say so.
  const crashed = !/\d+ passed, \d+ failed/.test(out);
  return { ...m, status: fails.length || crashed ? "KILLED" : "SURVIVED", fails, crashed };
}

console.log(`\nCONDUIT mutation sweep — ${list.length} mutants\n`);
const results = list.map(m => {
  const r = runOne(m);
  const tag = r.status === "KILLED" ? "  kill " : r.status === "ANCHOR" ? "  ANCH " : "  LIVE ";
  console.log(`${tag}${r.id.padEnd(26)} ${r.why}`);
  if (r.status === "ANCHOR") console.log(`         ${r.note}`);
  else if (r.status === "KILLED") {
    console.log(`         killed by: ${r.crashed ? "suite crashed" : r.fails.slice(0, 3).join(" | ")}`
              + (r.fails.length > 3 ? ` (+${r.fails.length - 3} more)` : ""));
    if (r.expect && !r.fails.some(f => f.toLowerCase().includes(r.expect.toLowerCase())) && !r.crashed)
      console.log(`         NOTE: expected an assertion naming "${r.expect}" to catch this`);
  } else {
    console.log(`         nothing caught it. This mechanic has no real assertion.`);
  }
  return r;
});

const live = results.filter(r => r.status === "SURVIVED");
const anchor = results.filter(r => r.status === "ANCHOR");
console.log(`\n${results.length - live.length - anchor.length} killed, ${live.length} survived, ${anchor.length} stale anchors\n`);
if (live.length) console.log("DECORATIVE GATES: " + live.map(r => r.id).join(", ") + "\n");
if (anchor.length) console.log("STALE MUTANTS (code moved, update the anchor): " + anchor.map(r => r.id).join(", ") + "\n");
process.exit(live.length || anchor.length ? 1 : 0);
