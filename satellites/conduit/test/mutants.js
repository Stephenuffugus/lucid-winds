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
    from: "  if(t===WALL||t===DOOR) return false;",
    to:   "  if(t===WALL) return false;",
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
    from: "function expConduit(i){ if(CONC[i]) return 2; const t=TT[i];",
    to:   "function expConduit(i){ if(CONC[i]) return 1; const t=TT[i];",
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
