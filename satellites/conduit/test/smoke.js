// CONDUIT smoke tests — run before every merge:  node test/smoke.js
const { load } = require("./harness");
const G = load();
const { CFG } = G;

let pass = 0, fail = 0;
const ok = (name, cond, extra="") => {
  if(cond){ pass++; console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (extra?"  → "+extra:"")); }
};
const near = (a,b,eps=1e-6) => Math.abs(a-b)<=eps;
// Set a blob's mass inside a test without inventing or destroying mass: the
// ledger moves with it, so the invariant stays meaningful afterwards.
const setMass = (S,b,m) => { S.ledger.owned += m - b.mass; b.mass = m; };

// ── 1. the invariant, under a long random workout ────────────────────────────
console.log("\n[1] mass invariant under random play");
{
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
  const b = G.blobRef();
  b.mass = 100;
  ok("full body cannot enter a vent", CFG.squeezeAt <= b.mass);
  b.mass = 20;
  ok("thin body cannot force a door", b.mass <= CFG.forceAt);
}

// ── 7. pathfinding and level integrity ───────────────────────────────────────
console.log("\n[7] level integrity");
{
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
  const b = G.blobRef();
  b.mass = CFG.envelop.minMass - 1;
  b.x = S.enemies[0].x + 0.4; b.y = S.enemies[0].y;
  G.startEnvelop();
  ok("a thin body cannot smother anything", S.act.verb === null);
}
{
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
  S.bodies.push({ x: S.enemies[1].x + 1, y: S.enemies[1].y, mass: 12, decay: 30 });
  for(let i=0;i<40;i++) G.step(0.016,{ax:0,ay:0});
  ok("a guard who finds a body escalates the site", S.site.alert >= 3, "alert="+S.site.alert);
}

// ── 10. shared source budget ─────────────────────────────────────────────────
console.log("\n[10] source capacity is a shared budget");
{
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
  const owned0 = S.ledger.owned, mass0 = G.blobRef().mass;
  G.ledgerDamage(10);
  ok("damage debits the authoritative total, not just the body",
     near(S.ledger.owned, owned0-10), "owned="+S.ledger.owned);
  ok("damage comes off the body too", near(G.blobRef().mass, mass0-10));
  ok("damage is booked as a debit", near(S.ledger.debits.damage, 10));
  ok("invariant survives damage", G.checkLedger());
}
{ // kills: ledger-damage, through the real contact path rather than the API
  const S = G.newGame();
  const b = G.blobRef(), e = S.enemies[0];
  const owned0 = S.ledger.owned;
  e.state = "hunt"; e.path = null;
  for(let i=0;i<40;i++){ e.x=b.x; e.y=b.y; G.step(0.016,{ax:0,ay:0}); }
  ok("a guard in contact actually takes mass off you", S.ledger.owned < owned0,
     "owned="+S.ledger.owned.toFixed(2));
  ok("invariant survives taking a hit", G.checkLedger());
}

{ // kills: route-through-walls
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame(), b = G.blobRef();
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
  const S = G.newGame(), b = G.blobRef(), DOOR = G.tiles.DOOR;
  ok("a door is impassable at any mass",
     !G.passableBlob(35,14,CFG.capacity) && !G.passableBlob(35,14,10));
  b.x=35.5; b.y=16.2; setMass(S,b,CFG.forceAt-10);
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a body under the force threshold cannot open the door", G.TTat(35,14)===DOOR);
  ok("and it does not get through", b.y>14.9, "y="+b.y.toFixed(2));
}
{ // a clean approach at full mass opens it
  const S = G.newGame(), b = G.blobRef(), DOOR = G.tiles.DOOR;
  b.x=35.5; b.y=16.2;
  for(let i=0;i<240;i++) G.step(0.016,{ax:0,ay:-1});
  ok("a full body forces the door open", G.TTat(35,14)!==DOOR);
  ok("forcing a door is heard", S.site.alert>=1, "alert="+S.site.alert);
  ok("invariant survives forcing", G.checkLedger());
}
{ // regression, C1: growing while already pressed on the door must still force.
  // The per-axis force reset made this permanently impossible; harvest a body
  // beside a door and the door became unopenable.
  const S = G.newGame(), b = G.blobRef(), DOOR = G.tiles.DOOR;
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
  const S = G.newGame(), b = G.blobRef(), e = S.enemies[0];
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
  const S = G.newGame(), dr = S.enemies[1];
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
  const S = G.newGame();
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
  const S = G.newGame();
  G.beginDraft(9,16);
  G.draftTo(9,19);                                    // (9,18) is solid wall
  ok("a blocked drag stops at the obstacle", S.draft.path.length===2,
     S.draft.path.join(" "));
  G.draftTo(12,17);                                   // the finger moves somewhere legal
  ok("and the stroke is still alive afterwards", S.draft.path.length===5,
     S.draft.path.join(" "));
}
{ // when one axis is walled, try the other, or corners become impossible
  const S = G.newGame();
  G.beginDraft(9,16);
  G.draftTo(9,14);
  ok("reached the room D link tile", S.draft.path.length===3, S.draft.path.join(" "));
  ok("east of it really is wall", G.TTat(10,14)===G.tiles.WALL);
  G.draftTo(10,13);                                   // east is wall, north is open
  ok("a drag turns the corner when the first axis is blocked",
     S.draft.path.length===5, S.draft.path.join(" "));
}

{ // C1: the wire is a weapon that eats itself, and the burn has its own cause
  const S = G.newGame();
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
  const S = G.newGame(), b = G.blobRef();
  setMass(S,b,50);                                     // room to receive it
  S.bodies.push({ x:b.x, y:b.y, mass:CFG.harvest.sentry, decay:CFG.bodyDecaySec });
  const m0 = b.mass;
  for(let i=0;i<60;i++) G.step(0.016,{ax:0,ay:0});
  ok("standing on a body harvests it", b.mass > m0 + 1, "gained "+(b.mass-m0).toFixed(2));
  ok("a whole sentry is worth exactly its harvest value",
     near(b.mass - m0, CFG.harvest.sentry, 1e-6), "gained "+(b.mass-m0).toFixed(4));
  ok("the gain is credited, not conjured",
     near(S.ledger.credits.harvest, CFG.harvest.sentry, 1e-6));
  ok("the body is consumed", S.bodies.length === 0);
  ok("invariant survives a harvest", G.checkLedger());
}

{ // kills: spot-decay-none — being seen has to be reversible
  const S = G.newGame(), b = G.blobRef(), e = S.enemies[0];
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
  const S = G.newGame(), dr = S.enemies[1];
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
  const S = G.newGame(), b = G.blobRef(), e = S.enemies[0];
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
  const S = G.newGame(), b = G.blobRef(), e = S.enemies[0];
  for(let i=0;i<400 && S.site.alert<2;i++){ e.x=7.5; e.y=11.5; e.face=0; b.x=9.5; b.y=11.5;
    G.step(0.016,{ax:0,ay:0}); }
  const at = S.site.alert;
  for(let i=0;i<400;i++){ e.x=7.5; e.y=11.5; e.face=0; b.x=9.5; b.y=11.5;
    G.step(0.016,{ax:0,ay:0}); }
  ok("standing in his cone does not escalate every frame", S.site.alert===at,
     `${at} then ${S.site.alert}`);
}

{ // getting out: the breaker is the one thing you can still power
  const S = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame();
  const spr = S.devices.find(d=>d.kind==="sprinkler");
  const path = G.cheapestPath(9, 16, spr.x, spr.y);
  G.beginDraft(9,16);
  for(let i=1;i<path.length;i++) G.draftStep(path[i][0], path[i][1]);
  G.commitDraft();
  const byHand = S.conduits[0].cost, tilesByHand = S.conduits[0].path.length;

  const S2 = G.newGame();
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
  const S = G.newGame();
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
  const S = G.newGame(), b = G.blobRef();
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
  const S = G.newGame(), GW = CFG.grid.w, GH = CFG.grid.h;
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
  const S = G.newGame();
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
    const S = G.newGame();
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
    const S = G.newGame();
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
  const S = G.newGame(), b = G.blobRef();
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
  G.newGame();
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

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
