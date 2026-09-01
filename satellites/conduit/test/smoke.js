// CONDUIT smoke tests — run before every merge:  node test/smoke.js
const { load } = require("./harness");
const G = load();
const { CFG } = G;

let pass = 0, fail = 0;
const ok = (name, cond, extra="") => {
  if(cond){ pass++; console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (extra?"  → "+extra:"")); }
};
// Everything below section 1 was written against the coolant floor, which is
// the map the prototype shipped with. Pin it explicitly now that there is a
// level loader, so adding or reordering levels cannot silently re-point a
// hundred assertions at a different map.
const LVL = "site-02";
const TRAITSOF = id => G.TRAITS.find(t=>t.id===id);

const near = (a,b,eps=1e-6) => Math.abs(a-b)<=eps;
// Set a blob's mass inside a test without inventing or destroying mass: the
// ledger moves with it, so the invariant stays meaningful afterwards.
const setMass = (S,b,m) => { S.ledger.owned += m - b.mass; b.mass = m; };

// ── 1. the invariant, under a long random workout ────────────────────────────
console.log("\n[1] mass invariant under random play");
{
  const S = G.newGame(LVL);
  const rng = (()=>{ let a=99; return ()=>{ a=(a*1664525+1013904223)>>>0; return a/4294967296; }; })();
  let broke = null, nan = false;
  for(let i=0;i<20000;i++){
    const r = rng();
    if(r<0.55) G.step(0.016, { ax:(rng()*2-1), ay:(rng()*2-1) });
    else if(r<0.75){                                   // lay a random legal wire
      const src = S.sources[rng()<0.5?0:1];
      if(G.beginDraft(src.x, src.y)){
        let cx=src.x, cy=src.y;
        for(let k=0;k<8;k++){
          const d=[[1,0],[-1,0],[0,1],[0,-1]][(rng()*4)|0];
          G.draftStep(cx+d[0], cy+d[1]);
          const p=S.draft.path[S.draft.path.length-1]; cx=p[0]; cy=p[1]; }
        G.commitDraft(); }
    }
    else if(r<0.9 && S.conduits.length) G.startReclaim(S.conduits[(rng()*S.conduits.length)|0]);
    else G.step(0.016, { ax:0, ay:0 });
    if(!G.checkLedger()){ broke = { i, leak: S.ledger.leak }; break; }
    const b = G.blobRef();
    if(!isFinite(b.x)||!isFinite(b.y)||!isFinite(b.mass)){ nan = true; break; }
  }
  ok("invariant holds across 20k mixed ops", !broke, broke && JSON.stringify(broke));
  ok("no NaN in position or mass", !nan);
  ok("blob never below the hard floor while spending",
     G.blobRef().mass >= 0 - 1e-9);
}

// ── 2. routing rules ─────────────────────────────────────────────────────────
console.log("\n[2] routing rules");
{
  const S = G.newGame(LVL);
  const src = S.sources.find(s=>s.id==="sock-1");
  G.beginDraft(src.x, src.y);
  G.draftStep(src.x+1, src.y);
  G.draftStep(src.x+2, src.y);
  G.draftStep(src.x+1, src.y);                         // back onto itself
  ok("conduit cannot cross itself", S.draft.path.length===3,
     "len="+S.draft.path.length);
  G.draftStep(src.x+4, src.y);                         // non-adjacent jump
  ok("non-adjacent tiles are rejected", S.draft.path.length===3);
  const before = G.blobRef().mass;
  const cost = S.draft.cost;
  G.commitDraft();
  ok("laying debits the blob exactly", near(G.blobRef().mass, before-cost),
     `${G.blobRef().mass} vs ${before-cost}`);
  ok("cost equals sum of per-tile costs", near(S.conduits[0].cost, cost));
}

// ── 3. concealed tiles cost 1.6× ─────────────────────────────────────────────
console.log("\n[3] concealed cost multiplier");
{
  const S = G.newGame(LVL);
  const src = S.sources.find(s=>s.id==="sock-1");   // sits on the concealed spine
  G.beginDraft(src.x, src.y);
  G.draftStep(src.x+1, src.y);                      // (10,16) — concealed row
  const c = S.draft.costs[1];
  ok("concealed tile costs 1.6", near(c, CFG.costPerTile*CFG.concealedMult), "got "+c);
  G.draftStep(src.x+1, src.y-1);                    // (10,15) — shadow, not concealed
  ok("plain tile costs 1.0", near(S.draft.costs[2], CFG.costPerTile),
     "got "+S.draft.costs[2]);
}

// ── 4. reclaim returns exactly 75%, tax is booked ────────────────────────────
console.log("\n[4] reclaim math");
{
  const S = G.newGame(LVL);
  const src = S.sources.find(s=>s.id==="gen-1");
  G.beginDraft(src.x, src.y);
  let cy = src.y;
  for(let k=0;k<5;k++) G.draftStep(src.x, --cy);
  const laid = S.draft.cost;
  G.commitDraft();
  const afterLay = G.blobRef().mass;
  G.startReclaim(S.conduits[0]);
  for(let i=0;i<600;i++) G.step(0.016, {ax:0,ay:0});
  const recovered = G.blobRef().mass - afterLay;
  ok("refund is 75% of what was laid", near(recovered, laid*CFG.reclaimRate, 1e-6),
     `recovered ${recovered.toFixed(3)} of ${laid}`);
  ok("the 25% is booked as tax, not lost silently",
     near(S.ledger.debits.reclaimTax, laid*(1-CFG.reclaimRate), 1e-6));
  ok("empty conduit is removed", S.conduits.length===0);
  ok("invariant survives reclaim", G.checkLedger());
}

// ── 5. harvest overflow goes to residue, never evaporates ────────────────────
console.log("\n[5] capacity overflow");
{
  const S = G.newGame(LVL);
  const before = G.totalMass() + S.player.residue;
  G.ledgerGain(30, "harvest");                        // already at capacity
  ok("total mass is clamped to capacity", near(G.totalMass(), S.player.capacity));
  ok("overflow lands in residue", near(S.player.residue, 30), "residue="+S.player.residue);
  ok("nothing vanished", near(G.totalMass()+S.player.residue, before+30));
  ok("invariant holds after overflow", G.checkLedger());
}

// ── 6. thresholds are genuinely mutually exclusive ───────────────────────────
console.log("\n[6] the size inversion");
{
  ok("squeeze and force cannot both be true", CFG.squeezeAt < CFG.forceAt);
  const S = G.newGame(LVL);
  const b = G.blobRef();
  b.mass = 100;
  ok("full body cannot enter a vent", CFG.squeezeAt <= b.mass);
  b.mass = 20;
  ok("thin body cannot force a door", b.mass <= CFG.forceAt);
}

// ── 7. pathfinding and level integrity ───────────────────────────────────────
console.log("\n[7] level integrity");
{
  const S = G.newGame(LVL);
  const p1 = G.bfs(5,27, 22,21);                      // entry → generator
  ok("entry reaches the generator on foot", !!p1);
  const p2 = G.bfs(5,27, 12,8);                       // entry → trap room
  ok("entry reaches the trap room on foot", !!p2);
  const p3 = G.bfs(5,27, 44,28);                      // entry → exfil (sealed)
  ok("exfil chamber is sealed to normal movement (door or vent only)", !p3);
  ok("sentry patrol route is walkable",
     S.enemies[0].route.every(([x,y])=>!!G.bfs(5,27,x,y)));
  ok("line of sight is blocked by walls", !G.los(5,27, 44,4));
}

// ── 8. scripted solve: is the intended solution actually affordable? ─────────
console.log("\n[8] solvability — the designed route");
{
  const S = G.newGame(LVL);
  // wire A: socket (9,16) → sprinkler (16,5), up the concealed x=9 spine
  G.beginDraft(9,16);
  for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5);
  const costA = S.draft.cost; G.commitDraft();
  // wire B: generator (22,21) → plate (12,8), through the vent channel at x=18
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=21;x>=18;x--) G.draftStep(x,16);
  for(let y=15;y>=9;y--) G.draftStep(18,y);
  for(let x=17;x>=12;x--) G.draftStep(x,9);
  G.draftStep(12,8);
  const costB = S.draft.cost; G.commitDraft();

  const committed = costA + costB, left = G.blobRef().mass;
  console.log(`       wire A ${costA.toFixed(1)} · wire B ${costB.toFixed(1)}`
            + ` · committed ${committed.toFixed(1)} · body left ${left.toFixed(1)}`);
  ok("the intended solution is affordable", left >= CFG.minBlobMass, "left="+left.toFixed(1));
  ok("both devices power up", S.devices.find(d=>d.kind==="sprinkler").on
                           && S.devices.find(d=>d.kind==="plate").on);
  ok("the socket cannot power the plate (capacity lesson)",
     S.sources.find(s=>s.id==="sock-1").capacity < S.devices.find(d=>d.kind==="plate").needs);
  ok("solving it leaves you mid-sized — the liquidity squeeze",
     left > CFG.squeezeAt && left < CFG.forceAt, "left="+left.toFixed(1));

  // run the trap: let the sentry walk its route onto the wet plate
  let killed = false;
  for(let i=0;i<60*90 && !killed;i++){
    G.step(0.016, {ax:0,ay:0});
    killed = S.enemies[0].state === "dead";
  }
  ok("the sprinkler + plate trap actually kills the target", killed);
  ok("invariant survives a full trap cycle", G.checkLedger());

  if(killed){
    // economy after: harvest the body, reclaim both wires
    const b = G.blobRef(); const body = S.bodies[0];
    if(body){ b.x = body.x; b.y = body.y; for(let i=0;i<120;i++) G.step(0.016,{ax:0,ay:0}); }
    S.conduits.slice().forEach(c=>G.startReclaim(c));
    for(let i=0;i<60*20;i++) G.step(0.016,{ax:0,ay:0});
    const net = G.totalMass() + S.player.residue - S.stats.startMass;
    console.log(`       net after harvest + reclaim: ${net>=0?"+":""}${net.toFixed(1)} mass`
              + ` · residue ${S.player.residue.toFixed(1)} · tax paid `
              + `${S.ledger.debits.reclaimTax.toFixed(1)}`);
    ok("a clean solve is roughly mass-neutral, not ruinous", net > -25, "net="+net.toFixed(1));
    ok("invariant holds to the end", G.checkLedger());
  }
}

// ── 9. the prowl verbs ───────────────────────────────────────────────────────
console.log("\n[9] direct interaction layer");
{
  const S = G.newGame(LVL);
  const b = G.blobRef();
  const e = S.enemies[0];
  b.x = e.x + 0.4; b.y = e.y;                       // right on top of an unaware guard
  G.startEnvelop();
  ok("smother starts on an unaware guard at range", S.act.verb === "envelop");
  const before = b.mass;
  for(let i=0;i<200 && S.act.verb;i++){ b.x = e.x + 0.4; b.y = e.y; G.step(0.016,{ax:0,ay:0}); }
  ok("smother kills the guard", e.state === "dead");
  // the body drops at your feet, so one frame of harvest lands before we measure
  ok("smother costs mass", before - G.blobRef().mass >= CFG.envelop.cost - 0.5,
     "delta=" + (before - G.blobRef().mass).toFixed(2));
  ok("smother leaves a harvestable body", S.bodies.length === 1);
  ok("invariant survives a smother", G.checkLedger());
}
{
  const S = G.newGame(LVL);
  const b = G.blobRef();
  b.mass = CFG.envelop.minMass - 1;
  b.x = S.enemies[0].x + 0.4; b.y = S.enemies[0].y;
  G.startEnvelop();
  ok("a thin body cannot smother anything", S.act.verb === null);
}
{
  const S = G.newGame(LVL);
  const e = S.enemies[1];                            // the corridor drone
  const b = G.blobRef();
  b.x = e.x + 3; b.y = e.y;
  const owned = S.ledger.owned;
  G.tapNoise ? G.tapNoise() : null;
  ok("tap is exposed to the test surface", typeof G.tapNoise === "function");
  if(typeof G.tapNoise === "function"){
    ok("tap costs mass", S.ledger.owned < owned);
    ok("tap pulls a nearby patrol to you", e.state === "investigate");
  }
}
{
  const S = G.newGame(LVL);
  const L = S.lights.find(l => l.x === 12 && l.y === 16);
  const litBefore = G.TTat(12,16);
  const b = G.blobRef(); b.x = L.x + 0.5; b.y = L.y + 0.5;
  G.douseLight(L);
  ok("a light pool is exposed floor before dousing", litBefore === 1);
  ok("dousing turns the pool to shadow", G.TTat(12,16) === 2);
  ok("dousing costs mass", G.blobRef().mass < CFG.capacity);
  ok("invariant survives dousing", G.checkLedger());
}
{
  const S = G.newGame(LVL);
  S.bodies.push({ x: S.enemies[1].x + 1, y: S.enemies[1].y, mass: 12, decay: 30 });
  for(let i=0;i<40;i++) G.step(0.016,{ax:0,ay:0});
  ok("a guard who finds a body escalates the site", S.site.alert >= 3, "alert="+S.site.alert);
}

// ── 10. shared source budget ─────────────────────────────────────────────────
console.log("\n[10] source capacity is a shared budget");
{
  const S = G.newGame(LVL);
  G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();      // socket → sprinkler (20)
  ok("sprinkler runs off the socket", S.devices.find(d=>d.kind==="sprinkler").on);
  G.beginDraft(9,16); for(let y=15;y>=11;y--) G.draftStep(9,y);
  for(let x=10;x<=14;x++) G.draftStep(x,11); G.commitDraft();     // socket → speaker (10)
  const sock = S.sources.find(s=>s.id==="sock-1");
  ok("socket capacity exactly covers sprinkler + speaker",
     sock.capacity === 30 && S.devices.find(d=>d.kind==="speaker").on);
  ok("invariant holds with two wires on one source", G.checkLedger());
}

// ── 11. the progression layer re-reads old levels ────────────────────────────
console.log("\n[11] metroid layer: same level, different meaning");
{
  const S = G.newGame(LVL);
  ok("the site's own wiring exists from level one", S.siteWires.length > 0);
  ok("it is inert without the unlock", S.player.traits.splice === false);

  // locked: routing along the site run costs full price
  const lockedCost = G.tileCost(18,15);
  S.player.traits.splice = true;
  const splicedCost = G.tileCost(18,15);
  ok("locked, a site-wire tile costs normal mass", lockedCost > 0);
  ok("spliced, the same tile costs nothing", splicedCost === 0);

  // the same route, priced both ways — this is the re-read, quantified
  S.player.traits.splice = false;
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=21;x>=18;x--) G.draftStep(x,16);
  for(let y=15;y>=9;y--) G.draftStep(18,y);
  for(let x=17;x>=12;x--) G.draftStep(x,9);
  G.draftStep(12,8);
  const before = S.draft.cost;
  S.draft = null;

  S.player.traits.splice = true;
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=21;x>=18;x--) G.draftStep(x,16);
  for(let y=15;y>=9;y--) G.draftStep(18,y);
  for(let x=17;x>=12;x--) G.draftStep(x,9);
  G.draftStep(12,8);
  const after = S.draft.cost;
  console.log(`       the designed route costs ${before.toFixed(1)} locked, `
            + `${after.toFixed(1)} spliced — ${(before-after).toFixed(1)} mass freed`);
  ok("splicing genuinely changes the economics of an old level", after < before - 5);
  G.commitDraft();
  ok("but powering over the site's run trips its panel", S.site.alert >= 1);
  ok("invariant holds with zero-cost tiles in the path", G.checkLedger());
}

// ── 12. the gates that were decoration ───────────────────────────────────────
// Added 2026-09-01 (C1). `node test/mutants.js` broke eight core mechanics one
// at a time and the 57-assertion suite stayed green for all eight: the damage
// path of the ledger, routing through walls, the shared source budget, lockdown
// cutting power, the squeeze threshold, the force threshold, smother's
// unaware-only rule, and concealed conduit never being spotted. The old checks
// for those compared constants to each other instead of running the code.
// Each block below names the mutant it must kill.
console.log("\n[12] mechanics that had no real assertion");

{ // kills: ledger-damage
  const S = G.newGame(LVL);
  const owned0 = S.ledger.owned, mass0 = G.blobRef().mass;
  G.ledgerDamage(10);
  ok("damage debits the authoritative total, not just the body",
     near(S.ledger.owned, owned0-10), "owned="+S.ledger.owned);
  ok("damage comes off the body too", near(G.blobRef().mass, mass0-10));
  ok("damage is booked as a debit", near(S.ledger.debits.damage, 10));
  ok("invariant survives damage", G.checkLedger());
}
{ // kills: ledger-damage, through the real contact path rather than the API
  const S = G.newGame(LVL);
  const b = G.blobRef(), e = S.enemies[0];
  const owned0 = S.ledger.owned;
  e.state = "hunt"; e.path = null;
  for(let i=0;i<40;i++){ e.x=b.x; e.y=b.y; G.step(0.016,{ax:0,ay:0}); }
  ok("a guard in contact actually takes mass off you", S.ledger.owned < owned0,
     "owned="+S.ledger.owned.toFixed(2));
  ok("invariant survives taking a hit", G.checkLedger());
}

{ // kills: route-through-walls
  const S = G.newGame(LVL);
  G.beginDraft(9,16);
  const n0 = S.draft.path.length;
  G.draftStep(9,17);                                  // corridor floor, legal
  ok("a legal neighbour extends the route", S.draft.path.length===n0+1);
  G.draftStep(9,18);                                  // solid wall below the corridor
  ok("conduit cannot be laid through a wall", S.draft.path.length===n0+1,
     "len="+S.draft.path.length);
  ok("the wall really is solid", G.TTat(9,18)===G.tiles.WALL);
}

{ // kills: power-budget-ignored — the capacity lesson, actually run
  const S = G.newGame(LVL);
  G.beginDraft(9,16);
  for(let y=15;y>=9;y--) G.draftStep(9,y);
  for(let x=10;x<=12;x++) G.draftStep(x,9);
  G.draftStep(12,8);
  G.commitDraft();
  const plate = S.devices.find(d=>d.kind==="plate");
  const sock  = S.sources.find(s=>s.id==="sock-1");
  ok("a wire physically reaches the plate",
     S.conduits.length===1 && S.conduits[0].path.length>1);
  ok("the socket cannot fund it, so the plate stays dark", !plate.on);
  ok("and its wire never goes live", !S.conduits[0].live);
  ok("a source never spends past its capacity",
     ((S.powerUsed&&S.powerUsed[sock.id])||0) <= sock.capacity,
     "used="+((S.powerUsed&&S.powerUsed[sock.id])||0));
}

{ // kills: power-lockdown-noop
  const S = G.newGame(LVL);
  G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
  const spr = S.devices.find(d=>d.kind==="sprinkler"), cd = S.conduits[0];
  ok("the sprinkler is live before the lockdown", spr.on && cd.live);
  const committed = cd.cost;
  G.bump(4, "test");
  ok("alert 4 is a lockdown", S.site.lockdown===true);
  ok("lockdown kills every live wire", !cd.live);
  ok("lockdown turns the devices off", !spr.on);
  ok("lockdown disarms you, it does not confiscate you", near(cd.cost, committed));
  ok("invariant survives a lockdown", G.checkLedger());
}

{ // kills: squeeze-vent-open — the size inversion, run rather than asserted
  const S = G.newGame(LVL), b = G.blobRef();
  ok("a full body is refused by the vent", !G.passableBlob(18,14,CFG.capacity));
  ok("a thin body is admitted", G.passableBlob(18,14,CFG.squeezeAt-1));
  ok("the threshold is exact, not approximate", !G.passableBlob(18,14,CFG.squeezeAt));
  b.x=18.5; b.y=15.6; setMass(S,b,CFG.capacity);
  for(let i=0;i<120;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a full body cannot walk into the vent", b.y>14.9, "y="+b.y.toFixed(2));
  setMass(S,b,CFG.squeezeAt-10);
  for(let i=0;i<180;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a thin body flows through it", b.y<14, "y="+b.y.toFixed(2));
  ok("invariant survives the squeeze", G.checkLedger());
}

{ // kills: force-door-open — the other half of the inversion
  const S = G.newGame(LVL), b = G.blobRef(), DOOR = G.tiles.DOOR;
  ok("a door is impassable at any mass",
     !G.passableBlob(35,14,CFG.capacity) && !G.passableBlob(35,14,10));
  b.x=35.5; b.y=16.2; setMass(S,b,CFG.forceAt-10);
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a body under the force threshold cannot open the door", G.TTat(35,14)===DOOR);
  ok("and it does not get through", b.y>14.9, "y="+b.y.toFixed(2));
}
{ // a clean approach at full mass opens it
  const S = G.newGame(LVL), b = G.blobRef(), DOOR = G.tiles.DOOR;
  b.x=35.5; b.y=16.2;
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a full body forces the door open", G.TTat(35,14)!==DOOR);
  ok("forcing a door is heard", S.site.alert>=1, "alert="+S.site.alert);
  ok("invariant survives forcing", G.checkLedger());
}
{ // regression, C1: growing while already pressed on the door must still force.
  // The per-axis force reset made this permanently impossible; harvest a body
  // beside a door and the door became unopenable.
  const S = G.newGame(LVL), b = G.blobRef(), DOOR = G.tiles.DOOR;
  b.x=35.5; b.y=16.2; setMass(S,b,CFG.forceAt-10);
  for(let i=0;i<60;i++) G.step(0.016,{ax:0,ay:-1});     // settle, too thin to force
  ok("a thin body settles against the door without opening it", G.TTat(35,14)===DOOR);
  setMass(S,b,CFG.capacity);                            // a harvest lands, you swell
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a body that grew while pressed can still force the door",
     G.TTat(35,14)!==DOOR, "forceT="+S.player.forceT.toFixed(3));
  ok("invariant survives forcing after a swell", G.checkLedger());
}

{ // kills: envelop-aware-target — the rule that keeps direct verbs honest
  const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[0];
  b.x = e.x + 0.4; b.y = e.y;
  e.state = "hunt";
  G.startEnvelop();
  ok("you cannot smother a guard that is hunting you", S.act.verb===null);
  e.state = "patrol"; e.spot = 0.9;
  G.startEnvelop();
  ok("nor one that has half noticed you", S.act.verb===null);
  e.spot = 0;
  G.startEnvelop();
  ok("but an unaware one at the same range is fair game", S.act.verb==="envelop");
}

{ // kills: conduit-conceal-spotted and conceal-tier-downgrade
  const S = G.newGame(LVL), dr = S.enemies[1];
  G.beginDraft(9,16); for(let x=10;x<=16;x++) G.draftStep(x,16); G.commitDraft();
  const cd = S.conduits[0];
  ok("that run is entirely on concealed ground",
     cd.path.every(p=>G.CONCat(p[0],p[1])===1));
  for(let i=0;i<600;i++){ dr.x=13.5; dr.y=16.5; dr.face=0; dr.state="patrol";
    G.step(0.016,{ax:0,ay:0}); }
  ok("concealed conduit is never discovered, however long he stands over it",
     !cd.discovered);
  // a NaN spot value would also never reach 1, and would look exactly like this
  ok("and it accrues no spot progress at all, NaN included",
     !(cd.spot > 0) && !Number.isNaN(cd.spot), "spot="+cd.spot);
}
{ // C1 route drawing. A drag that skips tiles, or is blocked for a moment,
  // must not kill the rest of the stroke.
  const S = G.newGame(LVL);
  G.beginDraft(9,16);
  G.draftTo(9,12);                                    // a four tile jump
  ok("a drag that skips tiles fills in the ones between",
     S.draft.path.length===5, "len="+S.draft.path.length);
  ok("and the filled tiles are the straight line",
     S.draft.path.every(p=>p[0]===9) &&
     S.draft.path.map(p=>p[1]).join()==="16,15,14,13,12", S.draft.path.join(" "));
  G.draftTo(12,12);
  ok("the stroke keeps going after a fill", S.draft.path.length===8,
     "len="+S.draft.path.length);
}
{ // a blocked step costs one tile, not the rest of the stroke
  const S = G.newGame(LVL);
  G.beginDraft(9,16);
  G.draftTo(9,19);                                    // (9,18) is solid wall
  ok("a blocked drag stops at the obstacle", S.draft.path.length===2,
     S.draft.path.join(" "));
  G.draftTo(12,17);                                   // the finger moves somewhere legal
  ok("and the stroke is still alive afterwards", S.draft.path.length===5,
     S.draft.path.join(" "));
}
{ // when one axis is walled, try the other, or corners become impossible
  const S = G.newGame(LVL);
  G.beginDraft(9,16);
  G.draftTo(9,14);
  ok("reached the room D link tile", S.draft.path.length===3, S.draft.path.join(" "));
  ok("east of it really is wall", G.TTat(10,14)===G.tiles.WALL);
  G.draftTo(10,13);                                   // east is wall, north is open
  ok("a drag turns the corner when the first axis is blocked",
     S.draft.path.length===5, S.draft.path.join(" "));
}

{ // C1: the wire is a weapon that eats itself, and the burn has its own cause
  const S = G.newGame(LVL);
  G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
  const cd = S.conduits[0], e = S.enemies[0];
  ok("the wire is live before the guard steps on it", cd.live);
  const before = cd.path.length, hp0 = e.hp, owned0 = S.ledger.owned;
  e.x = 12.5; e.y = 5.5;                              // standing on the run
  G.step(0.016, {ax:0,ay:0});
  ok("a guard standing on a live wire takes the zap",
     e.hp === hp0 - CFG.liveConduitZap, `hp ${hp0} to ${e.hp}`);
  ok("and it burns exactly zapBurnTiles of the run",
     cd.path.length === before - CFG.zapBurnTiles, `${before} to ${cd.path.length}`);
  ok("the burn is booked to zapBurn, not to a catch all",
     S.ledger.debits.zapBurn > 0 && S.ledger.debits.destroyed === 0,
     `zapBurn=${S.ledger.debits.zapBurn} destroyed=${S.ledger.debits.destroyed}`);
  ok("burned mass is gone, not refunded", S.ledger.owned < owned0);
  ok("invariant survives a zap burn", G.checkLedger());
  ok("a burnt run no longer reaches its device",
     !S.devices.find(d=>d.kind==="sprinkler").on);
}

{ // kills: harvest-free — the credit side of the economy
  const S = G.newGame(LVL), b = G.blobRef();
  setMass(S,b,50);                                     // room to receive it
  S.bodies.push({ x:b.x, y:b.y, mass:CFG.harvest.sentry, decay:CFG.bodyDecaySec });
  const m0 = b.mass;
  // long enough to clear the choose-to-carry grace window AND drain the body
  for(let i=0;i<260;i++) G.step(0.016,{ax:0,ay:0});
  ok("standing on a body harvests it", b.mass > m0 + 1, "gained "+(b.mass-m0).toFixed(2));
  ok("a whole sentry is worth exactly its harvest value",
     near(b.mass - m0, CFG.harvest.sentry, 1e-6), "gained "+(b.mass-m0).toFixed(4));
  ok("the gain is credited, not conjured",
     near(S.ledger.credits.harvest, CFG.harvest.sentry, 1e-6));
  ok("the body is consumed", S.bodies.length === 0);
  ok("invariant survives a harvest", G.checkLedger());
}

{ // kills: spot-decay-none — being seen has to be reversible
  const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[0];
  const pin = () => { e.x=7.5; e.y=11.5; e.face=0; };
  b.x = 9.5; b.y = 11.5;                               // two tiles in front of him, lit
  for(let i=0;i<120 && e.spot<0.4;i++){ pin(); G.step(0.016,{ax:0,ay:0}); }
  const peak = e.spot;
  ok("standing in a cone accrues spot progress", peak > 0.05, "spot="+peak.toFixed(3));
  ok("and it stops short of a spot in that time", peak < 1);
  b.x = 40; b.y = 27;                                  // gone, out of range and sight
  for(let i=0;i<90;i++){ pin(); G.step(0.016,{ax:0,ay:0}); }
  ok("spot progress decays once you break the sightline", e.spot === 0,
     peak.toFixed(3)+" then "+e.spot.toFixed(3));
}

{ // the positive control: the same guard, an exposed run, does find it
  const S = G.newGame(LVL), dr = S.enemies[1];
  G.beginDraft(9,16); G.draftStep(9,15);
  for(let x=10;x<=16;x++) G.draftStep(x,15); G.commitDraft();
  const cd = S.conduits[0];
  ok("that run is not concealed", cd.path.some(p=>G.CONCat(p[0],p[1])!==1));
  let found = false;
  for(let i=0;i<900 && !found;i++){ dr.x=13.5; dr.y=16.5; dr.face=-Math.PI/2;
    dr.state="patrol"; G.step(0.016,{ax:0,ay:0}); found = cd.discovered; }
  ok("an exposed run under a patrol is found", found, "spot="+cd.spot);
  ok("finding a wire raises the alert", S.site.alert>=1);
}

// ── 13. the lockdown loop, which did not exist ───────────────────────────────
// C2. Two independent bugs made the whole fifth alert state dead. Nothing in the
// game ever bumped past 3, so alert 4 was unreachable; and resolvePower skipped
// every conduit while lockdown was true, so the breaker could never come on, and
// alertDecaySec[4] is Infinity. It could not be entered and could not be left.
console.log("\n[13] lockdown, and the way out of it");

{ // getting there: repeated sightings climb the ladder
  const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[0];
  const spot = () => {                              // stand in front of him until seen
    e.seen = false; e.spot = 0;
    b.x = e.x + 2; b.y = e.y;
    for(let i=0;i<400 && e.spot<1;i++){ e.x=7.5; e.y=11.5; e.face=0; b.x=9.5; b.y=11.5;
      G.step(0.016,{ax:0,ay:0}); }
  };
  spot(); ok("a first sighting takes the site to Search", S.site.alert===2, "alert="+S.site.alert);
  spot(); ok("a second sighting takes it to Alarm",       S.site.alert===3, "alert="+S.site.alert);
  spot(); ok("a third sighting takes it to Lockdown",     S.site.alert===4, "alert="+S.site.alert);
  ok("Lockdown cuts the power", S.site.lockdown===true);
  ok("and it does not decay on its own", CFG.alertDecaySec[4] === Infinity);
}

{ // one sighting must not walk the whole ladder on its own
  const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[0];
  for(let i=0;i<400 && S.site.alert<2;i++){ e.x=7.5; e.y=11.5; e.face=0; b.x=9.5; b.y=11.5;
    G.step(0.016,{ax:0,ay:0}); }
  const at = S.site.alert;
  for(let i=0;i<400;i++){ e.x=7.5; e.y=11.5; e.face=0; b.x=9.5; b.y=11.5;
    G.step(0.016,{ax:0,ay:0}); }
  ok("standing in his cone does not escalate every frame", S.site.alert===at,
     `${at} then ${S.site.alert}`);
}

{ // getting out: the breaker is the one thing you can still power
  const S = G.newGame(LVL);
  G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
  const spr = S.devices.find(d=>d.kind==="sprinkler");
  ok("the sprinkler is live before the lockdown", spr.on);
  G.bump(4,"test");
  ok("lockdown kills the ordinary device", !spr.on);

  // socket to breaker, laid in the dark. This is the routing puzzle the design
  // calls the lockdown loop.
  G.beginDraft(9,16);
  for(let x=10;x<=39;x++) G.draftStep(x,16);
  for(let y=17;y<=20;y++) G.draftStep(39,y);
  for(let x=40;x<=44;x++) G.draftStep(x,20);
  G.draftStep(44,21);
  const reached = S.draft.path[S.draft.path.length-1];
  ok("a route reaches the breaker in the dark",
     reached[0]===44 && reached[1]===21, reached.join(","));
  G.commitDraft();
  const brk = S.devices.find(d=>d.kind==="breaker");
  ok("the breaker can be energised during a lockdown", brk.on);
  ok("but nothing else can be", !spr.on);
  G.step(0.016,{ax:0,ay:0});
  ok("powering the breaker ends the lockdown", S.site.lockdown===false);
  ok("and drops the site to Search, not to Calm", S.site.alert===2, "alert="+S.site.alert);
  ok("the ordinary device comes back with the power", spr.on);
  ok("invariant survives the whole lockdown loop", G.checkLedger());
  ok("the peak is remembered for the Ghost medal", S.site.peak===4);
}

// ── 14. route assist ─────────────────────────────────────────────────────────
// C2. Tap a source, tap a machine, take the cheapest legal path, then drag to
// edit. The assist proposes; draftStep still lays, so the legality rules and the
// price cannot drift apart between the two ways of drawing a route.
console.log("\n[14] route assist");

{
  const S = G.newGame(LVL);
  const src = S.sources.find(s=>s.id==="sock-1"), spr = S.devices.find(d=>d.kind==="sprinkler");
  const path = G.cheapestPath(src.x, src.y, spr.x, spr.y);
  ok("the assist finds a route", !!path && path.length > 1);
  ok("it starts at the source and ends at the machine",
     path[0][0]===src.x && path[0][1]===src.y &&
     path[path.length-1][0]===spr.x && path[path.length-1][1]===spr.y);
  ok("it never passes through a wall",
     path.every(p=>G.TTat(p[0],p[1])!==G.tiles.WALL));
  ok("it never passes through a door",
     path.every(p=>G.TTat(p[0],p[1])!==G.tiles.DOOR));
  ok("every step is orthogonal and exactly one tile",
     path.every((p,i)=>i===0 || Math.abs(p[0]-path[i-1][0])+Math.abs(p[1]-path[i-1][1])===1));
  ok("it never crosses itself",
     new Set(path.map(p=>p.join(","))).size === path.length);
}

{ // the price must be the same whichever way the route was drawn
  const S = G.newGame(LVL);
  const spr = S.devices.find(d=>d.kind==="sprinkler");
  const path = G.cheapestPath(9, 16, spr.x, spr.y);
  G.beginDraft(9,16);
  for(let i=1;i<path.length;i++) G.draftStep(path[i][0], path[i][1]);
  G.commitDraft();
  const byHand = S.conduits[0].cost, tilesByHand = S.conduits[0].path.length;

  const S2 = G.newGame(LVL);
  const before = G.blobRef().mass;
  const laid = G.autoRoute(9, 16, spr.x, spr.y);
  ok("the assist lays the whole route", laid === path.length, `laid ${laid} of ${path.length}`);
  ok("the assist lays the same tiles as the hand", S2.conduits[0].path.length === tilesByHand);
  ok("and costs exactly what that path costs by hand",
     near(S2.conduits[0].cost, byHand), `${S2.conduits[0].cost} vs ${byHand}`);
  ok("and charges the body exactly that",
     near(before - G.blobRef().mass, byHand));
  ok("it powers the machine it was aimed at",
     S2.devices.find(d=>d.kind==="sprinkler").on);
  ok("invariant survives the assist", G.checkLedger());
}

{ // cheapest, not merely legal
  const S = G.newGame(LVL);
  const spr = S.devices.find(d=>d.kind==="sprinkler");
  const auto = G.cheapestPath(9, 16, spr.x, spr.y);
  const autoCost = auto.slice(1).reduce((a,p)=>a+G.tileCost(p[0],p[1]), 0);
  const hand = [[9,16]];
  for(let y=15;y>=5;y--) hand.push([9,y]);
  for(let x=10;x<=16;x++) hand.push([x,5]);
  const handCost = hand.slice(1).reduce((a,p)=>a+G.tileCost(p[0],p[1]), 0);
  console.log(`       assist ${autoCost.toFixed(1)} vs the designed hand route ${handCost.toFixed(1)}`
            + `  (concealed ground costs ${CFG.concealedMult}x, so the cheap way is the exposed way)`);
  ok("the assist is never worse than the route a person would draw",
     autoCost <= handCost + 1e-9, `${autoCost} vs ${handCost}`);
  ok("and it buys that with exposure, which is the whole trade",
     auto.filter(p=>G.CONCat(p[0],p[1])===1).length <
     hand.filter(p=>G.CONCat(p[0],p[1])===1).length);
}

{ // a route you cannot afford is refused whole, never laid in part
  const S = G.newGame(LVL), b = G.blobRef();
  setMass(S, b, 10);
  const n = S.conduits.length, m = b.mass;
  const laid = G.autoRoute(9, 16, 16, 5);
  ok("an unaffordable route is refused, not half laid",
     laid === null && S.conduits.length === n, `laid=${laid} conduits=${S.conduits.length}`);
  ok("and it costs nothing to be told no", near(G.blobRef().mass, m));
  ok("invariant survives a refusal", G.checkLedger());
}

{ // "cheapest" needs an oracle that is not the same algorithm checking itself.
  // Relax every edge until nothing changes: slow, obviously correct, and it uses
  // only the game's own tileCost and conduitable, so it cannot inherit a bug
  // from the search under test.
  const S = G.newGame(LVL), GW = CFG.grid.w, GH = CFG.grid.h;
  const trueCheapest = (sx,sy,tx,ty) => {
    const dist = new Float64Array(GW*GH).fill(Infinity);
    dist[sy*GW+sx] = 0;
    for(let it=0; it<GW*GH; it++){
      let changed = false;
      for(let y=0;y<GH;y++) for(let x=0;x<GW;x++){
        const i=y*GW+x; if(!isFinite(dist[i])) continue;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nx=x+dx, ny=y+dy;
          if(nx<0||ny<0||nx>=GW||ny>=GH) continue;
          if(!G.conduitable(nx,ny)) continue;
          const ni=ny*GW+nx, nd=dist[i]+G.tileCost(nx,ny);
          if(nd < dist[ni]-1e-12){ dist[ni]=nd; changed=true; }
        }
      }
      if(!changed) break;
    }
    return dist[ty*GW+tx];
  };
  for(const [sx,sy,tx,ty,name] of [
        [9,16, 16,5,  "the sprinkler"],
        [22,21, 12,8, "the plate"],
        [9,16, 14,11, "the speaker"],
        [9,16, 44,21, "the breaker"]]){
    const path = G.cheapestPath(sx,sy,tx,ty);
    const got  = path ? path.slice(1).reduce((a,q)=>a+G.tileCost(q[0],q[1]), 0) : Infinity;
    const best = trueCheapest(sx,sy,tx,ty);
    ok("the assist route to "+name+" is the true cheapest, not merely short",
       near(got, best, 1e-9), `${got.toFixed(2)} vs an optimum of ${best.toFixed(2)}`);
  }
}

{ // no route at all, rather than a wrong one
  const S = G.newGame(LVL);
  ok("there is no route into a sealed chamber", G.cheapestPath(9,16, 44,28) === null ||
     G.cheapestPath(9,16,44,28).every(p=>G.TTat(p[0],p[1])!==G.tiles.WALL));
  ok("and none from inside solid rock", G.cheapestPath(0,0, 16,5) === null);
}

// ── 15. the ferro layer is a renderer, not a rule ────────────────────────────
// C3. The 2D tile sim is the source of truth forever; anything else is a
// renderer. Comparing two runs with the flag off and on would prove nothing on
// its own, because nothing renders headless and a step that never ran looks
// exactly like a step that changed nothing. So the ferro run also drives the
// whole feel layer, updateFX and fieldTarget and ferroBlob, every frame. If any
// of that writes to game state, these signatures diverge.
console.log("\n[15] the ferro layer is a renderer, not a rule");
{
  const signature = (S) => JSON.stringify({
    m:G.blobRef().mass.toFixed(9), x:G.blobRef().x.toFixed(9), y:G.blobRef().y.toFixed(9),
    owned:S.ledger.owned.toFixed(9), alert:S.site.alert, peak:S.site.peak,
    lock:S.site.lockdown, laid:S.stats.tilesLaid, res:S.player.residue.toFixed(9),
    cond:S.conduits.map(c=>c.path.length+":"+c.cost.toFixed(6)+":"+c.live+":"+c.discovered).join("|"),
    en:S.enemies.map(e=>e.x.toFixed(9)+","+e.y.toFixed(9)+","+e.hp+","+e.state+","+(e.spot||0).toFixed(9)).join("|"),
    bod:S.bodies.map(b=>b.x.toFixed(6)+","+b.mass.toFixed(6)).join("|"),
    wet:S.devices.map(d=>d.on).join(""),
    deb:JSON.stringify(S.ledger.debits), cred:JSON.stringify(S.ledger.credits),
  });
  const run = (ferro) => {
    CFG.ferroRender = ferro;
    const S = G.newGame(LVL);
    G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
    for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
    const marks = [];
    for(let i=0;i<4000;i++){
      G.step(0.016, { ax:Math.sin(i*0.017), ay:Math.cos(i*0.011) });
      if(ferro){
        G.updateFX(0.016);
        G.fieldTarget(G.blobRef());
        if(i%97===0) G.ferroBlob(0,0,10,G.fx.fa,G.fx.fs,G.fx.seed,G.fx.detail);
      }
      if(i%500===0) marks.push(signature(S));
    }
    marks.push(signature(S));
    return marks.join("//");
  };
  const off = run(false), on = run(true);
  ok("the simulation is identical with the ferro layer off and on", off===on,
     off===on ? "" : "the renderer moved the game");
  ok("and the run was long enough to be worth comparing", off.length > 2000,
     "signature length "+off.length);
  CFG.ferroRender = true;
}
{ // C3, found by the assertion above while it was looking for something else:
  // a restart has to be a fresh game. cscanT, the conduit scan phase, lived
  // outside S and newGame did not reset it, so the second game in a page
  // inherited the first one's timing and diverged.
  const play = () => {
    const S = G.newGame(LVL);
    G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
    for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
    for(let i=0;i<2500;i++) G.step(0.016, { ax:Math.sin(i*0.017), ay:Math.cos(i*0.011) });
    return JSON.stringify({
      m:G.blobRef().mass.toFixed(9), x:G.blobRef().x.toFixed(9), y:G.blobRef().y.toFixed(9),
      alert:S.site.alert, owned:S.ledger.owned.toFixed(9),
      en:S.enemies.map(e=>e.x.toFixed(9)+","+e.y.toFixed(9)+","+e.hp+","+e.state).join("|"),
      cond:S.conduits.map(c=>c.path.length+":"+c.discovered).join("|") });
  };
  const a = play(), b = play(), c = play();
  ok("the second game plays identically to the first", a===b, "a restart is not fresh");
  ok("and so does the third", a===c);
}

{ // the feel layer must be stable, not merely non interfering
  CFG.ferroRender = true;
  const S = G.newGame(LVL), b = G.blobRef();
  for(let i=0;i<600;i++){ G.step(0.016,{ax:0,ay:0}); G.updateFX(0.016); }
  const fx = G.fx;
  ok("the render radius settles on the true radius",
     Math.abs(fx.r - CFG.radius(b.mass)) < 0.005, `${fx.r} vs ${CFG.radius(b.mass)}`);
  ok("no NaN anywhere in the feel layer",
     [fx.r,fx.rv,fx.swell,fx.ripple,fx.fa,fx.fs].every(v=>isFinite(v)), JSON.stringify(fx));
  setMass(S,b,100);
  for(let i=0;i<600;i++){ G.step(0.016,{ax:0,ay:0}); G.updateFX(0.016); }
  ok("and it settles again after a big change of mass",
     Math.abs(fx.r - CFG.radius(b.mass)) < 0.005, `${fx.r} vs ${CFG.radius(b.mass)}`);
  ok("the field strength stays inside its bounds",
     fx.fs >= CFG.ferro.fieldMin-1e-9 && fx.fs <= CFG.ferro.fieldMax+1e-9, "fs="+fx.fs);
}
{ // the outline has to be geometry, not noise
  CFG.ferroRender = true;
  G.newGame(LVL);
  const pts = G.ferroBlob(0, 0, 20, 0, 1, 0.7, 96);
  ok("the outline has the detail it was asked for", pts.length === 96);
  ok("every point is finite", pts.every(p=>isFinite(p[0])&&isFinite(p[1])));
  const rad = pts.map(p=>Math.hypot(p[0],p[1]));
  ok("no point collapses to the centre or runs away",
     Math.min(...rad) > 20*0.5 && Math.max(...rad) < 20*2.6,
     `${Math.min(...rad).toFixed(2)} to ${Math.max(...rad).toFixed(2)}`);
  // the longest spike must point along the field, because the shape is information
  for(const fa of [0, 1.1, -2.4, 3.0]){
    const p = G.ferroBlob(0,0,20,fa,1,0.7,720);
    let bi=0; for(let i=1;i<p.length;i++)
      if(Math.hypot(p[i][0],p[i][1]) > Math.hypot(p[bi][0],p[bi][1])) bi=i;
    const ang = Math.atan2(p[bi][1], p[bi][0]);
    let d = Math.abs(((ang-fa+Math.PI*3)%(Math.PI*2))-Math.PI);
    ok("the longest spike points along the field at "+fa.toFixed(1),
       d < 0.06, "off by "+(d*180/Math.PI).toFixed(2)+" degrees");
  }
  const flat = G.ferroBlob(0,0,20,0,0,0.7,180).map(p=>Math.hypot(p[0],p[1]));
  const spiky = G.ferroBlob(0,0,20,0,1,0.7,180).map(p=>Math.hypot(p[0],p[1]));
  ok("a strong field spikes further than a weak one",
     Math.max(...spiky) > Math.max(...flat)*1.25,
     `${Math.max(...flat).toFixed(1)} to ${Math.max(...spiky).toFixed(1)}`);
}

// ── 16. the prowl verbs ──────────────────────────────────────────────────────
// C4, addendum 1 section 2, in its priority order. The rule that keeps both
// layers alive is that a direct verb handles ONE ISOLATED problem: it must be
// cheap, immediate, and carry a cost that makes it suicide the moment the target
// has a witness. Each block below tests the cost, not just that the verb runs.
console.log("\n[16] the prowl verbs");

{ // drag a body: slow, loud, hands full
  const S = G.newGame(LVL), b = G.blobRef();
  S.bodies.push({ x:b.x+0.6, y:b.y, mass:CFG.harvest.sentry, decay:CFG.bodyDecaySec });
  ok("a body in reach can be picked up", !!G.dragTarget());
  ok("drag starts", G.startDrag() && S.act.verb==="drag");
  const bod = S.bodies[0], x0 = bod.x;
  for(let i=0;i<120;i++) G.step(0.016,{ax:1,ay:0});
  ok("the body comes with you", bod.x > x0 + 0.5, `${x0.toFixed(2)} to ${bod.x.toFixed(2)}`);
  ok("it stays within arm's reach", Math.hypot(bod.x-b.x, bod.y-b.y) < 1.5,
     "gap "+Math.hypot(bod.x-b.x,bod.y-b.y).toFixed(2));
  // Hands full, isolated. After walking, canFlow is already false on stillness
  // alone, so asserting it there proves nothing: settle first, confirm flow IS
  // available, and only then pick the body up.
  G.dropBody();
  for(let i=0;i<40;i++) G.step(0.016,{ax:0,ay:0});
  ok("standing still and unseen, flow is available", G.canFlow()===true);
  G.startDrag();
  ok("but not with your hands full", G.canFlow()===false);
  // past the grace window, standing still, holding it: carrying must still beat
  // absorbing, or the grace window is quietly doing the work instead of the rule
  const held = S.bodies[0];
  for(let i=0;i<Math.ceil(CFG.harvestGraceSec/0.016)+200;i++) G.step(0.016,{ax:0,ay:0});
  ok("a body you are carrying is never absorbed, however long you hold it",
     S.bodies.includes(held) && held.mass > CFG.harvest.sentry-0.01,
     "mass "+(held?held.mass.toFixed(2):"gone"));
  ok("invariant survives a drag", G.checkLedger());
  G.dropBody();
  ok("and you can put it down", S.act.verb===null);
}
{ // dragging is SLOW, which is the cost that makes it suicide when watched
  const walk = (dragging) => {
    const S=G.newGame(LVL), b=G.blobRef();
    if(dragging){ S.bodies.push({x:b.x+0.6,y:b.y,mass:12,decay:30}); G.startDrag(); }
    const x0=b.x;
    for(let i=0;i<120;i++) G.step(0.016,{ax:1,ay:0});
    return b.x-x0;
  };
  const free=walk(false), heavy=walk(true);
  ok("dragging is slower than walking", heavy < free*0.75,
     `${free.toFixed(2)} free against ${heavy.toFixed(2)} carrying`);
}
{ // and LOUD: it pulls anyone near enough to hear it, with no sightline at all,
  // so what brought him is the noise and nothing else
  const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[1];
  e.x = 26.5; e.y = 16.5;                     // corridor
  b.x = 26.5; b.y = 21.5;                     // generator hall, wall between them
  ok("he cannot see you from there", !G.los(e.x,e.y,b.x,b.y));
  S.bodies.push({ x:b.x+0.5, y:b.y, mass:12, decay:30 });
  G.startDrag();
  let came=false;
  // pin him: the point is whether the noise reaches him, not whether his patrol
  // happens to carry him out of earshot first
  for(let i=0;i<200;i++){ if(e.state==="patrol"){ e.x=26.5; e.y=16.5; }
    G.step(0.016,{ax:0,ay:0});
    if(e.state==="investigate") came=true; }
  // sampled along the way, not only at the end: he can arrive, look around and
  // go back to his route inside the window
  ok("carrying a body makes noise a patrol comes to", came, "ended "+e.state);
  ok("and he is coming to where the noise was", !!e.target);
  ok("the noise is what brought him, not a sightline", !G.los(e.x,e.y,b.x,b.y) || came);
}
{ // C4: a body you just made has to be carryable, or the verb is unreachable.
  // A smother leaves you standing on it and absorbing one takes under a second.
  const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[0];
  b.x = e.x + 0.4; b.y = e.y;
  G.startEnvelop(false);
  for(let i=0;i<200 && S.act.verb;i++){ b.x=e.x+0.4; b.y=e.y; G.step(0.016,{ax:0,ay:0}); }
  ok("the smother left a body", S.bodies.length===1);
  ok("and it is still there a moment later, not already absorbed",
     (G.step(0.016,{ax:0,ay:0}), S.bodies.length===1));
  ok("so the button can offer to carry it", G.contextVerb().id==="drag",
     "offers "+G.contextVerb().id);
  ok("the grace window is what makes that possible", S.bodies[0].grace > 0,
     "grace "+S.bodies[0].grace);
  // and once the window passes, standing on it absorbs it as before
  for(let i=0;i<200 && S.bodies.length;i++) G.step(0.016,{ax:0,ay:0});
  ok("after the window, standing on it still absorbs it", S.bodies.length===0);
  ok("invariant survives the grace window", G.checkLedger());
}

{ // and it is disposal: a body you moved is no longer a body someone found
  const S = G.newGame(LVL), b = G.blobRef();
  S.bodies.push({ x:b.x+0.5, y:b.y, mass:12, decay:30, found:true });
  G.startDrag();
  for(let i=0;i<40;i++) G.step(0.016,{ax:1,ay:0});
  ok("moving a found body clears the find", S.bodies[0].found===false);
}

{ // peek: recon that costs you for as long as you hold it
  const S = G.newGame(LVL), b = G.blobRef();
  b.x = 8.5; b.y = 20.5; S.player.face = 0;
  const m0 = b.mass;
  S.player.peeking = true;
  for(let i=0;i<60;i++) G.step(0.016,{ax:0,ay:0});
  ok("peeking costs mass while it is held", b.mass < m0 - 0.5,
     `${m0.toFixed(2)} to ${b.mass.toFixed(2)}`);
  ok("about a mass a second", Math.abs((m0-b.mass) - CFG.peek.costPerSec*60*0.016) < 0.05,
     "spent "+(m0-b.mass).toFixed(3));
  ok("the tendril reaches out", S.player.peekR > 0.5, "r="+S.player.peekR);
  ok("invariant survives a peek", G.checkLedger());
  S.player.peeking = false;
}
{ // the tendril looks ROUND a corner, never through the wall
  const S = G.newGame(LVL), b = G.blobRef();
  b.x = 4.5; b.y = 20.5; S.player.face = Math.PI;      // west, into the room wall
  S.player.peeking = true;
  for(let i=0;i<30;i++) G.step(0.016,{ax:0,ay:0});
  ok("the tendril stops at the wall", S.player.peekR < 2, "r="+S.player.peekR);
  ok("and it never reaches its full range through solid rock",
     S.player.peekR < CFG.peek.range);
  S.player.peeking = false;
}
{ // it refuses rather than killing you
  const S = G.newGame(LVL), b = G.blobRef();
  setMass(S,b,CFG.peek.minMass+0.2);
  S.player.peeking = true;
  for(let i=0;i<200;i++) G.step(0.016,{ax:0,ay:0});
  ok("peek stops before it spends you below its floor", b.mass >= CFG.peek.minMass-1e-6,
     "mass="+b.mass.toFixed(3));
  ok("and it lets go by itself", S.player.peeking===false);
}

{ // cling: onto a wall FACE, never into solid rock
  const S = G.newGame(LVL), b = G.blobRef();
  b.x = 3.5; b.y = 20.5;                                // beside the room A wall
  ok("there is a wall to climb here", !!G.clingTarget());
  ok("cling starts", G.startCling() && S.player.clinging===true);
  ok("a wall face is passable while clinging", G.passableBlob(2,20,b.mass));
  ok("but solid rock is not, or you could tunnel through it",
     !G.passableBlob(0,0,b.mass), "0,0 wallSurface="+G.wallSurface(0,0));
  ok("you cannot lay wire from up there", G.canFlow()===false);
  G.stopCling();
  ok("and you come down onto floor, not inside a wall",
     S.player.clinging===false && G.TTat(b.x|0,b.y|0)!==G.tiles.WALL);
  ok("invariant survives a climb", G.checkLedger());
}
{ // clinging halves your profile, which is the whole point of it
  const seen = (cling) => {
    const S=G.newGame(LVL), b=G.blobRef(), e=S.enemies[0];
    S.player.clinging=cling;
    b.x=9.5; b.y=11.5;
    let n=0;
    for(;n<600 && e.spot<0.9;n++){ e.x=7.5; e.y=11.5; e.face=0; G.step(0.016,{ax:0,ay:0}); }
    return n;
  };
  const open=seen(false), stuck=seen(true);
  ok("clinging takes longer to be spotted", stuck > open*1.5,
     `${open} frames in the open against ${stuck} up the wall`);
}

{ // pool: hold still and flatten
  const S = G.newGame(LVL), b = G.blobRef();
  ok("you are not pooled the moment you stop", G.isPooled()===false);
  for(let i=0;i<Math.ceil(CFG.pool.sec/0.016)+10;i++) G.step(0.016,{ax:0,ay:0});
  ok("holding still flattens you", G.isPooled()===true, "stillT="+S.player.stillT.toFixed(2));
  G.step(0.016,{ax:1,ay:0});
  ok("and moving breaks it", G.isPooled()===false);
}
{ // pooled buys time before a spot. Same position, same guard, same window: the
  // only difference is whether the body is flat, forced by holding stillT down
  // rather than by moving, so proximity and exposure cannot creep in.
  const measure = (pool) => {
    const S = G.newGame(LVL), b = G.blobRef(), e = S.enemies[0];
    b.x = 9.5; b.y = 11.5;
    for(let i=0;i<Math.ceil(CFG.pool.sec/0.016)+20;i++){
      if(!pool) S.player.stillT = 0;
      e.x=7.5; e.y=11.5; e.face=Math.PI;              // looking away while it settles
      G.step(0.016,{ax:0,ay:0});
    }
    const pooled = G.isPooled();
    e.spot = 0;
    for(let i=0;i<40;i++){
      if(!pool) S.player.stillT = 0;
      e.x=7.5; e.y=11.5; e.face=0;                    // now he turns round
      G.step(0.016,{ax:0,ay:0});
    }
    return { pooled, spot:e.spot };
  };
  const flat = measure(true), upright = measure(false);
  ok("holding still really does pool you", flat.pooled===true);
  ok("and denying the stillness really does not", upright.pooled===false);
  ok("a pooled body accrues spot more slowly", flat.spot < upright.spot*0.75,
     `${flat.spot.toFixed(3)} flat against ${upright.spot.toFixed(3)} upright`);
  ok("about half as fast, which is what CFG says",
     Math.abs(flat.spot*CFG.pool.spotMult - upright.spot) < 0.03,
     `${(flat.spot*CFG.pool.spotMult).toFixed(3)} vs ${upright.spot.toFixed(3)}`);
}

{ // the action button and the thing it does come from one function, so the label
  // a player reads can never drift from what happens
  const S = G.newGame(LVL), b = G.blobRef();
  ok("with nothing in reach it offers a tap", G.contextVerb().id==="tap");
  S.bodies.push({ x:b.x+0.5, y:b.y, mass:12, decay:30 });
  ok("a body in reach offers to carry it", G.contextVerb().id==="drag");
  G.doContextVerb();
  ok("and the button does what it said", S.act.verb==="drag");
  ok("while carrying, it offers to put it down", G.contextVerb().id==="drop");
  G.doContextVerb();
  ok("and it does", S.act.verb===null);
  S.bodies.length = 0;
  b.x = 3.5; b.y = 20.5;
  ok("beside a wall it offers to climb", G.contextVerb().id==="cling");
  G.doContextVerb();
  ok("clinging, it offers to come down", G.contextVerb().id==="uncling");
  G.doContextVerb();
  ok("and it does", S.player.clinging===false);
}

// ── 17. the battery cart and the coolant combo ───────────────────────────────
// C4 items 5 and 6. The cart moves the SOURCE instead of extending the wire; the
// coolant vent turns the thing hunting you into the thing powering you.
console.log("\n[17] moving a source, and freezing a guard into one");

{ // the cart rolls, slowly, and only on floor
  const S = G.newGame(LVL), b = G.blobRef();
  const cart = S.sources.find(s=>s.id==="cart-1");
  ok("the level has a cart you can push", !!cart && cart.movable===true);
  b.x = cart.x + 1.2; b.y = cart.y + 0.5;
  ok("standing beside it, it offers to push", G.contextVerb().id==="cart");
  ok("push starts", G.startCart() && S.act.verb==="cart");
  const x0 = cart.x;
  for(let i=0;i<200;i++) G.step(0.016,{ax:1,ay:0});
  ok("the cart comes with you", cart.x > x0, `${x0} to ${cart.x}`);
  ok("invariant survives a push", G.checkLedger());
  ok("pushing a cart leaves no hands for wiring", G.canFlow()===false);
}
{ // The cart follows where you stand, so it can only be driven at illegal ground
  // by standing somewhere it cannot follow you. Thin, in the vent, is exactly
  // that: the blob fits and the cart must not.
  const S = G.newGame(LVL), b = G.blobRef();
  const cart = S.sources.find(s=>s.id==="cart-1");
  cart.x = 18; cart.y = 16; cart.fx = undefined;
  setMass(S, b, CFG.squeezeAt-10);
  b.x = 18.5; b.y = 15.6;
  ok("thin enough for the vent", b.mass < CFG.squeezeAt);
  G.startCart();
  let bad = null;
  for(let i=0;i<400 && !bad;i++){
    G.step(0.016,{ax:0,ay:-1});
    const t = G.TTat(cart.x, cart.y);
    if(t!==G.tiles.FLOOR && t!==G.tiles.SHADOW) bad = `${cart.x},${cart.y} tile ${t}`;
  }
  ok("the blob went where the cart cannot", b.y < 15, "blob y="+b.y.toFixed(2));
  ok("and the cart never followed onto illegal ground, sampled every frame",
     !bad, bad);
  ok("invariant survives that", G.checkLedger());
}

{ // and it is slower than carrying a body, which is slower than walking
  // all three from the same spot, in the same direction, with room to move: the
  // first attempt walked the free case into a wall and measured the wall
  const go = (setup) => {
    const S=G.newGame(LVL), b=G.blobRef();
    b.x=20.5; b.y=21.5;                       // generator hall, nine tiles of room east
    setup(S,b);
    const x0=b.x; for(let i=0;i<120;i++) G.step(0.016,{ax:1,ay:0}); return b.x-x0; };
  const free = go(()=>{});
  const body = go((S,b)=>{ S.bodies.push({x:b.x+0.6,y:b.y,mass:12,decay:30}); G.startDrag(); });
  const cart = go((S,b)=>{ const c=S.sources.find(s=>s.id==="cart-1");
                           c.x=21; c.y=21; c.fx=undefined; G.startCart(); });
  console.log(`       walking ${free.toFixed(2)} · carrying ${body.toFixed(2)}`
            + ` · pushing ${cart.toFixed(2)} tiles in two seconds`);
  ok("a cart is heavier than a body", cart < body);
  ok("and a body is heavier than nothing", body < free);
}
{ // a run dies when its source is wheeled out from under it. The run has to be
  // genuinely LIVE first, or the assertion is satisfied by a wire that was never
  // powered: the first version of this ended on a tile with no device on it.
  const S = G.newGame(LVL);
  const cart = S.sources.find(s=>s.id==="cart-1");
  const col = S.devices.find(d=>d.kind==="coolant");
  cart.x = 23; cart.y = 22;                       // in the generator hall
  G.beginDraft(cart.x, cart.y);
  for(let y=21; y>=16; y--) G.draftStep(23, y);
  for(let x=24; x<=col.x; x++) G.draftStep(x, 16);
  G.commitDraft();
  const cd = S.conduits[0];
  ok("a wire can be laid from the cart", S.conduits.length===1);
  ok("and it reaches a machine the cart can actually run",
     cart.capacity >= col.needs && cd.path[cd.path.length-1][0]===col.x);
  ok("so the run is live", cd.live===true, "live="+cd.live);
  ok("and the machine is on", col.on===true);
  cart.x += 1; G.resolvePower();
  ok("wheeling the source away kills the run it was feeding", !cd.live);
  ok("and the machine goes off with it", !col.on);
  ok("but the mass stays committed, it is still your wire", cd.cost > 0);
  ok("invariant survives the source walking off", G.checkLedger());
}

{ // the coolant combo, which the plan makes mandatory
  const S = G.newGame(LVL);
  const col = S.devices.find(d=>d.kind==="coolant");
  ok("the level has a coolant vent", !!col);
  const sock = S.sources.find(s=>s.id==="sock-1");
  ok("the socket can just about run the vent on its own",
     sock.capacity >= col.needs, `${sock.capacity} against ${col.needs}`);
  ok("but then it has nothing left for the sprinkler",
     sock.capacity - col.needs < S.devices.find(d=>d.kind==="sprinkler").needs,
     `${sock.capacity - col.needs} spare`);
  // generator to the vent
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=23;x<=30;x++) G.draftStep(x,16);
  G.commitDraft();
  ok("the generator can run it", col.on, "needs "+col.needs);

  const e = S.enemies[1];
  e.x = 30.5; e.y = 16.5; e.state="patrol";
  G.step(0.016,{ax:0,ay:0});
  ok("a guard who walks into it freezes", e.state==="frozen", "state="+e.state);
  ok("and stops being able to see you", e.spot===0);
  {
    // Cut the vent first. While it runs it re-freezes him every frame, which
    // would mask a frozen guard who had kept his senses: the interesting state
    // is frozen with the vent already off.
    S.conduits.slice().forEach(c=>G.startReclaim(c));
    for(let i=0;i<300;i++) G.step(0.016,{ax:0,ay:0});   // long enough to retract
    ok("the vent is off but he is still frozen", !col.on && e.state==="frozen",
       `on=${col.on} state=${e.state} left=${(e.frozen||0).toFixed(1)}s`);
    const b2=G.blobRef(), fx=e.x, fy=e.y;
    b2.x=e.x+1.5; b2.y=e.y;
    for(let i=0;i<125;i++) G.step(0.016,{ax:0,ay:0});
    ok("a frozen guard accrues no spot at all, stood in front of", (e.spot||0)===0,
       "spot="+e.spot);
    ok("and he does not move", e.x===fx && e.y===fy, `${fx},${fy} to ${e.x},${e.y}`);
    ok("and he is still frozen", e.state==="frozen");
  }
  const froz = S.sources.find(s=>s.id==="froz-"+e.id);
  ok("a frozen guard becomes a source", !!froz, "no source appeared");
  ok("worth what its mass is worth",
     froz.capacity === Math.round(CFG.harvest[e.kind]*CFG.coolant.capacityMult),
     "capacity "+(froz && froz.capacity));
  ok("you can route from it", !!G.cheapestPath(froz.x, froz.y, 14, 11));
  ok("invariant survives a freeze", G.checkLedger());

  // the freeze runs out on its own now that the vent is dead
  for(let i=0;i<Math.ceil(CFG.coolant.freezeSec/0.016)+120;i++) G.step(0.016,{ax:0,ay:0});
  ok("and then he thaws", e.state!=="frozen", "state="+e.state);
  ok("and the battery is gone with it",
     !S.sources.find(s=>s.id==="froz-"+e.id));
  ok("invariant survives the thaw", G.checkLedger());
}
{ // killing a frozen guard must not leave a battery behind
  const S = G.newGame(LVL), e = S.enemies[0];
  G.freezeEnemy(e);
  ok("frozen, there is a battery", !!S.sources.find(s=>s.id==="froz-"+e.id));
  G.killEnemy(e, "test");
  ok("killed, there is not", !S.sources.find(s=>s.id==="froz-"+e.id));
  ok("and it left a body to harvest", S.bodies.length===1);
}

// ── 18. the device orchestra ─────────────────────────────────────────────────
// C4 item 6. Every device must explain itself when tapped, print what it needs
// when unpowered, and have at least one designed interaction with another device
// or verb. Each block tests the PARTNER, not just that the switch flips.
console.log("\n[18] the device orchestra");

const power = (S, from, tiles) => {          // helper: run a wire and commit it
  G.beginDraft(from[0], from[1]);
  for(const t of tiles) G.draftStep(t[0], t[1]);
  G.commitDraft();
};

{ // every device explains itself, or it does not ship
  const S = G.newGame(LVL);
  const kinds = new Set(S.devices.map(d=>d.kind));
  ok("the site has the device list C4 asks for",
     ["sprinkler","plate","speaker","breaker","coolant","floodlight","fan","crane",
      "doorlock","camera"].every(k=>kinds.has(k)),
     [...kinds].join(","));
  ok("every device declares what it needs", S.devices.every(d=>d.needs>0));
  ok("and starts off", S.devices.every(d=>d.on===false));
  ok("every source declares a capacity", S.sources.every(s=>s.capacity>0));
}

{ // FLOODLIGHT partners with drink-a-light and with concealed ground: it exposes
  // the very cover a route was relying on
  const S = G.newGame(LVL);
  const fld = S.devices.find(d=>d.kind==="floodlight");
  const inside = [34, 8];
  ok("that ground is not lit to begin with", G.LITat(inside[0],inside[1])===0);
  const before = G.expConduit(G.idx(inside[0],inside[1]));
  S.player.traits.splice = false;
  fld.on = true; G.tickDevices(0.016);
  ok("a live floodlight lights its area", G.LITat(inside[0],inside[1])===1);
  ok("and lit ground is exposed, whatever cover it had",
     G.expConduit(G.idx(inside[0],inside[1]))===0);
  fld.on = false; G.tickDevices(0.016);
  ok("switching it off gives the cover back",
     G.expConduit(G.idx(inside[0],inside[1]))===before);
}
{ // and it beats a concealed spine, which is the interesting case
  const S = G.newGame(LVL);
  const fld = S.devices.find(d=>d.kind==="floodlight");
  fld.area = [8,14,10,16];                      // over the concealed x=9 spine
  ok("that spine is concealed", G.CONCat(9,15)===1);
  ok("and unlit it is never spotted", G.expConduit(G.idx(9,15))===2);
  fld.on = true; G.tickDevices(0.016);
  ok("a floodlight exposes even a concealed run", G.expConduit(G.idx(9,15))===0);
}

{ // FAN partners with drag: it moves a body you are not holding
  const S = G.newGame(LVL);
  const fan = S.devices.find(d=>d.kind==="fan");
  S.bodies.push({ x:fan.x+2, y:fan.y, mass:12, decay:30, found:true });
  const bd = S.bodies[0], x0 = bd.x;
  fan.on = true;
  for(let i=0;i<200;i++) G.step(0.016,{ax:0,ay:0});
  ok("a live fan shoves a body along", bd.x < x0, `${x0} to ${bd.x}`);
  ok("and a body it moved is no longer a body someone found", bd.found===false);
}
{ // and it stops at the wall. The fan only reaches four tiles, so a body has to
  // start inside that reach AND have a wall inside it, or nothing is ever pushed
  // and the check cannot fail. Pointed south from (38,11) the room ends at y 14.
  const S = G.newGame(LVL);
  const fan = S.devices.find(d=>d.kind==="fan");
  fan.dir = [0, 1]; fan.on = true;
  S.bodies.push({ x:fan.x, y:fan.y+1, mass:12, decay:30 });
  const bd = S.bodies[0];
  ok("the room ends two tiles that way", G.TTat(fan.x, fan.y+3)===G.tiles.WALL);
  ok("and the body starts inside the fan's reach", Math.abs(bd.y-fan.y)<=4);
  let through = null;
  for(let i=0;i<500 && !through;i++){
    G.step(0.016,{ax:0,ay:0});
    if(G.TTat(bd.x|0, bd.y|0)===G.tiles.WALL) through = `${bd.x|0},${bd.y|0}`;
  }
  ok("it never shoves one into a wall, sampled every frame", !through, through);
  ok("and the body stops at the last legal tile", bd.y <= fan.y+2, "y="+bd.y);
}
{ // and it partners with the speaker as a second lure, with a shorter reach
  const S = G.newGame(LVL);
  const fan = S.devices.find(d=>d.kind==="fan");
  const e = S.enemies[1];
  e.x = fan.x + 3; e.y = fan.y; e.state = "patrol";
  fan.on = true;
  let came = false;
  for(let i=0;i<200 && !came;i++){ G.step(0.016,{ax:0,ay:0});
    if(e.state==="investigate") came = true; }
  ok("a live fan is loud enough to investigate", came, "state="+e.state);
}

{ // CRANE partners with anything that puts something under it
  const S = G.newGame(LVL);
  const crn = S.devices.find(d=>d.kind==="crane");
  const e = S.enemies[1];
  e.x = crn.drop[0] + 0.5; e.y = crn.drop[1] + 0.5;
  crn.on = true;
  G.step(0.016,{ax:0,ay:0});
  ok("a live crane crushes what is under it", e.state==="dead");
  ok("and leaves a body", S.bodies.length===1);
  ok("invariant survives a crushing", G.checkLedger());
}
{ // it is harmless to anything not standing there, which is what makes the lure
  // the interesting half of it
  const S = G.newGame(LVL);
  const crn = S.devices.find(d=>d.kind==="crane");
  const e = S.enemies[1];
  e.x = crn.drop[0] + 3.5; e.y = crn.drop[1] + 0.5;
  crn.on = true;
  for(let i=0;i<60;i++){ e.x = crn.drop[0]+3.5; e.y = crn.drop[1]+0.5;
    G.step(0.016,{ax:0,ay:0}); }
  ok("but it cannot reach anything standing beside it", e.state!=="dead");
}

{ // DOOR LOCK partners with the force threshold: power instead of mass
  const S = G.newGame(LVL), b = G.blobRef();
  const lck = S.devices.find(d=>d.kind==="doorlock");
  ok("the door starts shut", G.TTat(lck.door[0], lck.door[1])===G.tiles.DOOR);
  setMass(S, b, CFG.forceAt-20);
  ok("and you are far too thin to force it", b.mass < CFG.forceAt);
  lck.on = true; G.tickDevices(0.016);
  ok("power opens it without any mass at all",
     G.TTat(lck.door[0], lck.door[1])!==G.tiles.DOOR);
  lck.on = false; G.tickDevices(0.016);
  ok("and cutting the power shuts it again, which is how you trap a patrol",
     G.TTat(lck.door[0], lck.door[1])===G.tiles.DOOR);
}
{ // but a door a body forced stays forced, whatever the lock does afterwards
  const S = G.newGame(LVL), b = G.blobRef();
  const lck = S.devices.find(d=>d.kind==="doorlock");
  b.x = lck.door[0]+0.5; b.y = lck.door[1]+2.2;
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a full body forces it", G.TTat(lck.door[0], lck.door[1])!==G.tiles.DOOR);
  for(let i=0;i<120;i++) G.step(0.016,{ax:0,ay:0});
  ok("and the lock leaves it alone",
     G.TTat(lck.door[0], lck.door[1])!==G.tiles.DOOR);
  // the case that actually needs the memory: power the lock, then cut it. Without
  // remembering that a body opened this door, cutting the power shuts it on you.
  b.x = 20.5; b.y = 21.5;                          // out of the doorway
  lck.on = true;  G.tickDevices(0.016);
  lck.on = false; G.tickDevices(0.016);
  ok("and the lock never shuts a door a body forced, even after being cycled",
     G.TTat(lck.door[0], lck.door[1])!==G.tiles.DOOR);
}

{ // CAMERA partners with peek and pulse: the same recon, without the mass
  const S = G.newGame(LVL), b = G.blobRef();
  const cam = S.devices.find(d=>d.kind==="camera");
  const e = S.enemies[1];
  e.x = cam.x + 2; e.y = cam.y;
  const m0 = b.mass;
  cam.on = true;
  G.step(0.016,{ax:0,ay:0});
  ok("a live camera shows you what it can see", !!S.seen && S.seen.includes(e.id),
     JSON.stringify(S.seen));
  ok("and it costs nothing to watch", G.blobRef().mass === m0);
  e.x = cam.x + CFG.camera.range + 4;
  G.step(0.016,{ax:0,ay:0});
  ok("it only shows what is in range", !S.seen.includes(e.id));
  cam.on = false;
  G.step(0.016,{ax:0,ay:0});
  ok("and off, it shows nothing", !S.seen);
}

{ // VEHICLE BATTERY: one shot, and the shot is the point
  const S = G.newGame(LVL);
  const veh = S.sources.find(s=>s.id==="veh-1");
  ok("the site has a one shot source", !!veh && veh.burst===true);
  ok("it can run the heaviest thing on the site",
     veh.capacity >= Math.max(...S.devices.map(d=>d.needs)));
  const brk = S.devices.find(d=>d.kind==="breaker");
  power(S, [veh.x, veh.y], (()=>{ const t=[];
    for(let y=veh.y-1;y>=brk.y;y--) t.push([veh.x,y]);
    for(let x=veh.x+1;x<=brk.x;x++) t.push([x,brk.y]);
    return t; })());
  const cd = S.conduits[0];
  const end = cd.path[cd.path.length-1];
  ok("a wire from it reaches the breaker", end[0]===brk.x && end[1]===brk.y,
     end.join(","));
  ok("and it goes live", cd.live===true);
  for(let i=0;i<Math.ceil(CFG.vehicle.burstSec/0.016)+30;i++) G.step(0.016,{ax:0,ay:0});
  ok("it runs out", veh.capacity===0, "capacity "+veh.capacity);
  ok("and the run it was feeding dies with it", !cd.live);
  ok("but the mass is still yours to reclaim", cd.cost>0);
  ok("invariant survives a battery going flat", G.checkLedger());
}

// ── 19. the curriculum ───────────────────────────────────────────────────────
// C5. Every level ships with a scripted solve that must survive any CFG change,
// and every level has to be beatable two ways, or it is a lock rather than a
// puzzle. Level one: one source, one machine it can afford, one patrol, and the
// machine only fires on the tile the patrol has to cross.
console.log("\n[19] the curriculum");

{ // level one is shaped the way the plan says level one is shaped
  const S = G.newGame("site-01");
  ok("level one loads", S.level==="site-01", S.level);
  ok("it has exactly one source", S.sources.length===1);
  const cap = S.sources[0].capacity;
  ok("one machine that source can afford",
     S.devices.filter(d=>d.needs<=cap).length===1);
  ok("and one it cannot, which is an affordance to walk past and wonder about",
     S.devices.filter(d=>d.needs> cap).length===1);
  ok("one patrol", S.enemies.length===1);
  ok("the site's own wiring is drawn, and inert",
     S.siteWires.length>0 && S.player.traits.splice===false);
  const b = G.blobRef();
  ok("the exfil is reachable on foot", !!G.bfs(b.x, b.y, S.exfil.x, S.exfil.y));
  ok("and the patrol's route is walkable",
     S.enemies[0].route.every(([x,y])=>!!G.bfs(b.x,b.y,x,y)));
}

{ // path one: wire the crane and let the patrol walk under it
  const S = G.newGame("site-01");
  const src = S.sources[0], crn = S.devices.find(d=>d.kind==="crane");
  G.beginDraft(src.x, src.y);
  G.draftStep(src.x, src.y-1);
  for(let x=src.x+1; x<=crn.x; x++) G.draftStep(x, crn.y);
  G.commitDraft();
  const cost = S.conduits[0].cost, left = G.blobRef().mass;
  console.log(`       level one, the wire: ${cost.toFixed(1)} laid, ${left.toFixed(1)} left`);
  ok("the socket can afford the crane", crn.on===true, "needs "+crn.needs+" of "+src.capacity);
  ok("and laying it does not beggar you", left > CFG.squeezeAt, "left="+left.toFixed(1));
  let killed=false;
  for(let i=0;i<60*90 && !killed;i++){ G.step(0.016,{ax:0,ay:0});
    killed = S.enemies[0].state==="dead"; }
  ok("the crane takes the patrol on the tile it has to cross", killed);
  const body = S.bodies[0];
  ok("and leaves a body", !!body);
  if(body){
    const b=G.blobRef(); b.x=body.x; b.y=body.y;
    for(let i=0;i<300;i++) G.step(0.016,{ax:0,ay:0});
    ok("which harvests", S.ledger.credits.harvest > 0);
  }
  S.conduits.slice().forEach(c=>G.startReclaim(c));
  for(let i=0;i<60*20;i++) G.step(0.016,{ax:0,ay:0});
  ok("the wire comes home", S.conduits.length===0);
  const b=G.blobRef(); b.x=S.exfil.x+0.5; b.y=S.exfil.y+0.5;
  G.step(0.016,{ax:0,ay:0});
  ok("and the level is won", !!S.result && S.result.ok===true,
     S.result?JSON.stringify(S.result.medals):"no result");
  const net = G.totalMass()+S.player.residue-S.stats.startMass;
  console.log(`       level one by wire: net ${net>=0?"+":""}${net.toFixed(1)} mass,`
            + ` ${S.stats.tilesLaid} tiles, peak alert ${S.site.peak}`);
  ok("invariant holds through the whole level", G.checkLedger());
}

{ // path two: walk up and smother him, no wire at all
  const S = G.newGame("site-01");
  const b = G.blobRef(), e = S.enemies[0];
  b.x = e.x + 0.4; b.y = e.y;
  G.startEnvelop(false);
  for(let i=0;i<300 && S.act.verb;i++){ b.x=e.x+0.4; b.y=e.y; G.step(0.016,{ax:0,ay:0}); }
  ok("the same level falls to a smother, with no wire at all", e.state==="dead");
  ok("and nothing was laid", S.stats.tilesLaid===0);
  for(let i=0;i<300;i++) G.step(0.016,{ax:0,ay:0});
  b.x=S.exfil.x+0.5; b.y=S.exfil.y+0.5;
  G.step(0.016,{ax:0,ay:0});
  ok("and it is won that way too", !!S.result && S.result.ok===true);
  const net = G.totalMass()+S.player.residue-S.stats.startMass;
  console.log(`       level one by hand: net ${net>=0?"+":""}${net.toFixed(1)} mass,`
            + ` ${S.stats.tilesLaid} tiles, peak alert ${S.site.peak}`);
  ok("invariant holds that way too", G.checkLedger());
}

{ // the metroid re-read, on level one: the same map, a different game
  G.clearSave();
  const route = (S) => {
    const src=S.sources[0], crn=S.devices.find(d=>d.kind==="crane");
    G.beginDraft(src.x, src.y);
    for(let x=src.x+1; x<=crn.x; x++) G.draftStep(x, 20);
    G.draftStep(crn.x, crn.y);
    return S.draft.cost;
  };
  const locked = route(G.newGame("site-01"));
  G.writeSave({ residueDelta:900 }); G.buyTrait("splice");
  const S2 = G.newGame("site-01");
  ok("splice is live", S2.player.traits.splice===true);
  const spliced = route(S2);
  console.log(`       level one down its own cable channel: ${locked.toFixed(1)} locked, `
            + `${spliced.toFixed(1)} spliced`);
  ok("the same route on the same map costs visibly less",
     spliced < locked*0.35, `${locked} then ${spliced}`);
  ok("in fact it costs nothing at all, which is the whole unlock", spliced===0);
  G.commitDraft();
  ok("but riding the facility's own run trips its panel", S2.site.alert>=1,
     "alert="+S2.site.alert);
  ok("and the machine still comes on", S2.devices.find(d=>d.kind==="crane").on===true);
  ok("invariant holds with a route that cost nothing", G.checkLedger());
  G.clearSave();
}

{ // level two also falls two ways, which is the rule for every level
  const A = G.newGame(LVL);
  const eA = A.enemies[0], bA = G.blobRef();
  bA.x = eA.x + 0.4; bA.y = eA.y;
  G.startEnvelop(false);
  for(let i=0;i<300 && A.act.verb;i++){ bA.x=eA.x+0.4; bA.y=eA.y; G.step(0.016,{ax:0,ay:0}); }
  ok("level two falls to a smother, with no wire", eA.state==="dead" && A.stats.tilesLaid===0);
  const B = G.newGame(LVL);
  G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=21;x>=18;x--) G.draftStep(x,16);
  for(let y=15;y>=9;y--) G.draftStep(18,y);
  for(let x=17;x>=12;x--) G.draftStep(x,9);
  G.draftStep(12,8); G.commitDraft();
  let killed=false;
  for(let i=0;i<60*90 && !killed;i++){ G.step(0.016,{ax:0,ay:0});
    killed = B.enemies[0].state==="dead"; }
  ok("and it falls to the wire", killed && B.stats.tilesLaid>0);
}

// Spend yourself into wire until you fit a vent: a long deliberate loop through
// the hall, which is exactly the play DESIGN section 3.1.3 asks the level to
// teach. Stops as soon as the projected body is thin enough.
const spendIntoWire = (S, stopAt) => {
  // Row 17 carries the walled-off second vent mouth at x 24 and 25, so the loop
  // runs row 20, then row 18, then row 17 only as far as the wall.
  const pts=[[5,20]];
  for(let x=6;x<=30;x++) pts.push([x,20]);
  pts.push([30,19]); pts.push([30,18]);
  for(let x=29;x>=3;x--) pts.push([x,18]);
  pts.push([3,17]);
  for(let x=4;x<=23;x++) pts.push([x,17]);
  G.beginDraft(5,19);
  for(const [x,y] of pts){
    if(G.blobRef().mass - S.draft.cost <= stopAt) break;
    G.draftStep(x,y);
  }
  G.commitDraft();
};

// ── level three: the size inversion, and what the wire can do that you cannot ─
{
  const S = G.newGame("site-03");
  const b = G.blobRef();
  ok("level three loads", S.level==="site-03");
  ok("the gallery cannot be walked into", !G.bfs(b.x, b.y, 20, 12));
  ok("its exit is inside the gallery", !G.bfs(b.x, b.y, S.exfil.x, S.exfil.y));
  ok("a full body will not fit the vent", !G.passableBlob(16,16,CFG.capacity));
  ok("a thin one will", G.passableBlob(16,16,CFG.squeezeAt-1));
  ok("but a wire fits it at any size", G.conduitable(16,16));
  ok("and a route through it reaches the machine inside",
     !!G.cheapestPath(5,19, 20,14));
  const sock=S.sources[0], spk=S.devices.find(d=>d.kind==="speaker");
  ok("the speaker can be reached and never funded",
     !!G.cheapestPath(5,19, spk.x,spk.y) && spk.needs > sock.capacity,
     `needs ${spk.needs} of ${sock.capacity}`);
  ok("and the facility's own wiring is the other thing you cannot use yet",
     S.siteWires.length>0 && S.player.traits.splice===false);
  ok("going thin means giving up the takedown, which is the whole inversion",
     CFG.squeezeAt < CFG.envelop.minMass, `${CFG.squeezeAt} against ${CFG.envelop.minMass}`);
}

{ // path one: take him from outside, through a vent your body cannot use
  const S = G.newGame("site-03");
  const crn = S.devices.find(d=>d.kind==="crane");
  const path = G.cheapestPath(5,19, crn.x,crn.y);
  G.beginDraft(5,19);
  for(let i=1;i<path.length;i++) G.draftStep(path[i][0], path[i][1]);
  G.commitDraft();
  ok("the route goes through the vent", S.conduits[0].path.some(p=>p[0]===16&&p[1]===16));
  ok("and the crane comes on", crn.on===true);
  let killed=false;
  for(let i=0;i<60*120 && !killed;i++){ G.step(0.016,{ax:0,ay:0});
    killed = S.enemies[0].state==="dead"; }
  ok("it takes the target while you are still outside", killed);
  const b=G.blobRef();
  console.log(`       level three by wire: ${S.conduits[0].cost.toFixed(1)} laid,`
            + ` body ${b.mass.toFixed(1)}, and he never saw you`);
  ok("but you are still too fat to follow it in", b.mass >= CFG.squeezeAt);
  // so you keep spending until you fit. The wire you leave is why you fit.
  spendIntoWire(S, CFG.squeezeAt-6);
  const left=G.blobRef().mass;
  console.log(`       then spent down to ${left.toFixed(1)} to fit the vent`);
  ok("spending yourself into wire is what makes you thin enough",
     left < CFG.squeezeAt, "mass="+left.toFixed(1));
  b.x=16.5; b.y=16.9;
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("and then you fit through it", b.y < 15.5, "y="+b.y.toFixed(2));
  b.x=S.exfil.x+0.5; b.y=S.exfil.y+0.5;
  G.step(0.016,{ax:0,ay:0});
  ok("and out", !!S.result && S.result.ok===true);
  ok("invariant holds", G.checkLedger());
}

{ // path two: spend yourself thin, get in, then take yourself back and do it by hand
  const S = G.newGame("site-03");
  const b = G.blobRef();
  spendIntoWire(S, CFG.squeezeAt-6);
  const committed=S.conduits[0].cost;
  ok("laying a long loop makes you thin", G.blobRef().mass < CFG.squeezeAt,
     "mass="+G.blobRef().mass.toFixed(1));
  ok("and too thin to smother anything", G.blobRef().mass < CFG.envelop.minMass);
  b.x=16.5; b.y=16.9;
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("thin, you fit through the vent", b.y < 15.5, "y="+b.y.toFixed(2));
  // and now take yourself back out of the wire, at the usual price
  G.startReclaim(S.conduits[0]);
  for(let i=0;i<60*60 && S.conduits.length; i++) G.step(0.016,{ax:0,ay:0});
  console.log(`       level three by hand: committed ${committed.toFixed(1)},`
            + ` back to ${G.blobRef().mass.toFixed(1)} after the tax`);
  ok("pulling it home makes you heavy again, inside",
     G.blobRef().mass >= CFG.envelop.minMass, "mass="+G.blobRef().mass.toFixed(1));
  ok("and the tax was charged for the shape you chose",
     S.ledger.debits.reclaimTax > committed*0.2);
  const e=S.enemies[0];
  b.x=e.x+0.4; b.y=e.y;
  G.startEnvelop(false);
  for(let i=0;i<400 && S.act.verb;i++){ b.x=e.x+0.4; b.y=e.y; G.step(0.016,{ax:0,ay:0}); }
  ok("which is what lets you take him by hand", e.state==="dead");
  b.x=S.exfil.x+0.5; b.y=S.exfil.y+0.5;
  G.step(0.016,{ax:0,ay:0});
  ok("and out that way too", !!S.result && S.result.ok===true);
  ok("invariant holds", G.checkLedger());
}

{ // a level must never edit the level it came from
  const A = G.newGame("site-01");
  A.devices[0].on = true; A.devices[0].needs = 999;
  A.sources[0].x = 41; A.enemies[0].route[0][0] = 41;
  A.lights[0].out = true; A.siteWires[0][0][0] = 41;
  const B = G.newGame("site-01");
  ok("a second game gets a clean copy of its level",
     B.devices[0].on===false && B.devices[0].needs!==999 && B.sources[0].x!==41 &&
     B.enemies[0].route[0][0]!==41 && B.lights[0].out===false &&
     B.siteWires[0][0][0]!==41,
     JSON.stringify({on:B.devices[0].on, needs:B.devices[0].needs, sx:B.sources[0].x}));
}

// ── 20. persistence, traits and the anti grind rule ──────────────────────────
// C5. Headless there is no localStorage, so the store falls back to memory and
// this exercises the real save path rather than a stub. Kept last, and it clears
// the save on the way in, because a trait bought here would follow every game.
console.log("\n[20] what survives the run");

{ // read modify write, which is the whole point: two tabs each writing the whole
  // object clobber each other, so counters ADD and bests take the better value
  G.clearSave();
  ok("a fresh save is blank",
     G.readSave().residue===0 && Object.keys(G.readSave().traits).length===0);
  G.writeSave({ residueDelta:10 });
  G.writeSave({ traits:{ splice:1 } });          // as if another tab did it
  G.writeSave({ residueDelta:5 });
  const sv=G.readSave();
  ok("counters add rather than overwrite", sv.residue===15, "residue="+sv.residue);
  ok("and a write to one field does not wipe another", sv.traits.splice===1);
  G.writeSave({ site:{ id:"t", ghost:3, tiles:40, economy:5, speed:90, runs:1 } });
  G.writeSave({ site:{ id:"t", ghost:1, tiles:55, economy:2, speed:70, runs:1 } });
  const st=G.readSave().sites.t;
  ok("a lower peak alert is the better one kept", st.ghost===1, "ghost="+st.ghost);
  ok("fewer tiles is the better one kept", st.tiles===40, "tiles="+st.tiles);
  ok("more mass is the better one kept", st.economy===5, "economy="+st.economy);
  ok("less time is the better one kept", st.speed===70, "speed="+st.speed);
  ok("and the run count adds", st.runs===2, "runs="+st.runs);
}

{ // the anti grind rule: a replay banks only the improvement
  G.clearSave();
  const bank = (residue) => {
    const S=G.newGame("site-01");
    S.player.residue = residue;
    S.enemies.forEach(e=>{ e.state="dead"; });
    const b=G.blobRef(); b.x=S.exfil.x+0.5; b.y=S.exfil.y+0.5;
    G.step(0.016,{ax:0,ay:0});
    return S.result ? S.result.banked : null;
  };
  const first = bank(20);
  ok("a first clear banks what it earned", first===20, "banked "+first);
  ok("and the save holds it", G.readSave().residue===20, G.readSave().residue);
  const same = bank(20);
  ok("replaying it for the same yield banks nothing", same===0, "banked "+same);
  ok("so farming an easy site pays nothing", G.readSave().residue===20);
  const better = bank(31);
  ok("a better run banks only the improvement", better===11, "banked "+better);
  ok("which is what lands in the save", G.readSave().residue===31, G.readSave().residue);
  const worse = bank(5);
  ok("and a worse run banks nothing", worse===0, "banked "+worse);
}

{ // traits: they cost, they cap, and the price climbs
  G.clearSave();
  G.writeSave({ residueDelta:500 });
  const ins = TRAITSOF("insulation");
  ok("insulation starts at rank zero", G.traitRank(G.readSave(),"insulation")===0);
  const p1=G.traitCost(G.readSave(),"insulation");
  ok("buying it costs residue", G.buyTrait("insulation")===true);
  ok("and takes the price", G.readSave().residue===500-p1, G.readSave().residue);
  ok("the rank went up", G.traitRank(G.readSave(),"insulation")===1);
  ok("and the next rank costs more",
     G.traitCost(G.readSave(),"insulation") > p1,
     `${p1} then ${G.traitCost(G.readSave(),"insulation")}`);
  while(G.buyTrait("insulation"));
  ok("it caps where the table says it caps",
     G.traitRank(G.readSave(),"insulation")===ins.max, G.traitRank(G.readSave(),"insulation"));
  ok("and buying past the cap fails rather than charging you",
     G.buyTrait("insulation")===false);
}
{ // and you cannot buy what you cannot afford
  G.clearSave();
  G.writeSave({ residueDelta:5 });
  const before=G.readSave().residue;
  ok("a trait you cannot afford is refused", G.buyTrait("splice")===false);
  ok("and being refused costs nothing", G.readSave().residue===before, G.readSave().residue);
  ok("and you did not quietly get it anyway", G.traitRank(G.readSave(),"splice")===0);
}

{ // and the one that must never exist
  ok("there is no trait that sells the reclaim RATE",
     !G.TRAITS.some(t=>/reclaim ?rate/i.test(t.id+" "+t.name+" "+t.desc)),
     G.TRAITS.map(t=>t.id).join(","));
  ok("but reclaim SPEED is on the table, which is the honest version of it",
     G.TRAITS.some(t=>t.id==="reclaimSpeed"));
  ok("and the refund itself is untouched by any of them",
     CFG.reclaimRate===0.75);
}

{ // traits have to reach the run, not just the save
  G.clearSave();
  G.writeSave({ residueDelta:900 });
  const before = G.newGame("site-01");
  ok("with nothing bought, splice is off", before.player.traits.splice===false);
  ok("and pulse reaches its base range",
     before.player.traits.pulseRange===CFG.pulseRange);
  ok("and reclaim runs at its base speed",
     before.player.traits.reclaimSpeed===CFG.reclaimSpeed);
  ok("and capacity is the base capacity", before.player.capacity===CFG.capacity);
  G.buyTrait("splice"); G.buyTrait("pulseRange"); G.buyTrait("reclaimSpeed");
  G.buyTrait("capacity");
  const after = G.newGame("site-01");
  ok("bought, splice is on in the run", after.player.traits.splice===true);
  ok("pulse reaches further", after.player.traits.pulseRange===CFG.pulseRange+2);
  ok("reclaim pulls home faster", after.player.traits.reclaimSpeed===CFG.reclaimSpeed+2);
  ok("and capacity grew", after.player.capacity===CFG.capacity+20);
  ok("but the thresholds did NOT move with it, which is the whole tension",
     CFG.squeezeAt===30 && CFG.forceAt===70);
}

{ // splice re-prices an old level, which is the point of the metroid layer
  G.clearSave();
  const locked = G.newGame(LVL);
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=21;x>=18;x--) G.draftStep(x,16);
  for(let y=15;y>=9;y--) G.draftStep(18,y);
  for(let x=17;x>=12;x--) G.draftStep(x,9);
  G.draftStep(12,8);
  const before = locked.draft.cost;
  G.writeSave({ residueDelta:900 });
  G.buyTrait("splice");
  const spliced = G.newGame(LVL);
  ok("splice is live from the save", spliced.player.traits.splice===true);
  G.beginDraft(22,21);
  for(let y=20;y>=16;y--) G.draftStep(22,y);
  for(let x=21;x>=18;x--) G.draftStep(x,16);
  for(let y=15;y>=9;y--) G.draftStep(18,y);
  for(let x=17;x>=12;x--) G.draftStep(x,9);
  G.draftStep(12,8);
  const after = spliced.draft.cost;
  console.log(`       the same route: ${before.toFixed(1)} locked, ${after.toFixed(1)} spliced`
            + `, ${(before-after).toFixed(1)} mass freed`);
  ok("the same route on the same map costs visibly less", after < before-5,
     `${before} then ${after}`);
  G.commitDraft();
  ok("and riding the site's own run trips its panel", spliced.site.alert>=1);
  G.clearSave();
}

{ // suspend and resume mid heist
  G.clearSave();
  const S = G.newGame(LVL);
  G.beginDraft(9,16); for(let y=15;y>=5;y--) G.draftStep(9,y);
  for(let x=10;x<=16;x++) G.draftStep(x,5); G.commitDraft();
  const b=G.blobRef(); b.x=12.5; b.y=9.5;
  for(let i=0;i<200;i++) G.step(0.016,{ax:0,ay:0});
  const snap = { mass:b.mass, x:b.x, y:b.y, owned:S.ledger.owned,
                 cost:S.conduits[0].cost, tiles:S.conduits[0].path.length,
                 live:S.conduits[0].live, devices:S.devices.filter(d=>d.on).map(d=>d.id).join(","),
                 alert:S.site.alert, time:S.stats.time, laid:S.stats.tilesLaid };
  ok("suspending a live run works", G.suspendRun()===true);
  ok("and it is on disk", !!G.readSave().run);
  G.newGame("site-01");                      // wander off and start something else
  ok("resuming brings the run back", G.resumeRun()===true);
  const R=G.S, rb=G.blobRef();
  ok("the same level", R.level===LVL, R.level);
  ok("the body is where it was",
     Math.abs(rb.x-snap.x)<1e-9 && Math.abs(rb.y-snap.y)<1e-9, `${rb.x},${rb.y}`);
  ok("with the mass it had", Math.abs(rb.mass-snap.mass)<1e-9);
  ok("the ledger is intact", Math.abs(R.ledger.owned-snap.owned)<1e-9);
  ok("the wire is still laid", R.conduits.length===1 &&
     R.conduits[0].path.length===snap.tiles && Math.abs(R.conduits[0].cost-snap.cost)<1e-9);
  // Not "it is live": whether it still was depends on whether a guard stepped on
  // it in those two hundred frames. What has to survive is that it comes back the
  // way it went in.
  ok("and its power state came back the way it went in",
     R.conduits[0].live===snap.live, `${snap.live} then ${R.conduits[0].live}`);
  ok("and so did whatever it was running",
     R.devices.filter(d=>d.on).map(d=>d.id).join(",")===snap.devices,
     `${snap.devices} then ${R.devices.filter(d=>d.on).map(d=>d.id).join(",")}`);
  ok("the alert is where it was", R.site.alert===snap.alert);
  ok("the clock did not restart", Math.abs(R.stats.time-snap.time)<1e-9);
  ok("invariant survives a suspend and resume", G.checkLedger());
  G.clearSave();
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
