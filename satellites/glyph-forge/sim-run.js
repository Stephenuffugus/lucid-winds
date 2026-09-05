// Full run simulator. Greedy AI that picks the best damage combo each turn.
// Phase 7: in addition to the per-Sigil battery, this also runs a relic-impact
// matrix, champion level-scaling sanity, build-archetype detection, and a
// determinism assertion, then prints a single BALANCE VERDICT.
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const code = [...html.matchAll(/<script>([\s\S]+?)<\/script>/g)]
  .map(m => m[1]).find(b => /\bRUNES\s*=/.test(b));

const stubs = `
  const document = { getElementById: () => ({ addEventListener:()=>{}, classList:{add:()=>{},remove:()=>{},contains:()=>false}, appendChild:()=>{}, removeChild:()=>{}, setAttribute:()=>{}, getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), style:{}, innerHTML:'', textContent:'', onclick:null, dataset:{}, children:[], firstElementChild:{classList:{add:()=>{}},dataset:{},onclick:null,oncontextmenu:null,addEventListener:()=>{}}, querySelector:()=>({innerHTML:''}), querySelectorAll:()=>[], offsetWidth:0, offsetHeight:0 }), querySelectorAll:()=>[], createElement:()=>({className:'',innerHTML:'',textContent:'',style:{},classList:{add:()=>{}},dataset:{},onclick:null,oncontextmenu:null,firstElementChild:null,addEventListener:()=>{},remove:()=>{},getBoundingClientRect:()=>({left:0,top:0,width:0,height:0})}), body:{appendChild:()=>{}} };
  const window = { addEventListener:()=>{}, innerWidth:400 };
  const localStorage = { _s:{}, getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
  const navigator = { serviceWorker:null };
  const setTimeout = (fn)=>{ /* immediate, but don't recurse */ };
  const clearTimeout = ()=>{};
  const confirm = ()=>true;
`;

const game = eval(`(function(){${stubs}${code}; return { state, RUNES, ENEMIES, NAMED_COMBOS, resolveSpell, mulberry32, findComboName, onSpellBound, ensureRunDepth, RELICS, SIGILS, CHAMPIONS, TRANSMUTATIONS, lockIntent, executeIntent, netEnemyDamage };})()`);

// Replicate run logic locally so we don't need DOM-touching functions.
// grantRelics: optional array of relic ids force-bound at run start (relic matrix).
function newSim(seedStr, sigilId, grantRelics){
  const sg = (game.SIGILS||[]).find(s=>s.id===sigilId) || (game.SIGILS||[{id:'free',maxHp:50}])[0];
  const seed = (function(){
    let h = 1779033703 ^ seedStr.length;
    for(let i=0;i<seedStr.length;i++){
      h = Math.imul(h^seedStr.charCodeAt(i), 3432918353);
      h = (h<<13)|(h>>>19);
    }
    return h;
  })();
  const rng = game.mulberry32(seed);
  let deck = game.RUNES.filter(r=>r.starter).map(r=>r.id);
  for(let i=deck.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }

  const path = [];
  for(let i=0;i<13;i++){
    if(i===12) path.push({enemyId:'sovereign'});
    else {
      const tier = i<3 ? 1 : (i<7 ? 2 : 3);
      const candidates = game.ENEMIES.filter(e=>e.tier===tier && !e.boss);
      path.push({enemyId: candidates[Math.floor(rng()*candidates.length)].id});
    }
  }
  return {
    seed: seedStr, rngSeed: seed,
    encounterIdx: 0, hp: sg.maxHp||50, maxHp: sg.maxHp||50,
    deck, hand: [], discard: [], spell: [null,null,null],
    path, enemyHp: 0, enemyMaxHp: 0,
    fluency: 0,
    // depth (mirror startNewRun)
    sigil: sg.id, relics: (grantRelics||[]).slice(),
    champion: sg.champion ? { id: sg.champion, level:1, path:0 } : null,
    progression: { bound:[], revealed:[], prophecy:null, transmuted:[] },
    boundElements: [], castCount: 0,
    // Batch B: enemy intent (mirrors startNewRun; beginEnc locks the first action)
    turnInEnc: 0, intent: null, pendingUnleash: false,
    // Batch E: boss-counter pattern tally + phase latch
    patternTally: {}, bossPhaseSeen: 0,
    log: [], dmgLog: [], champPeakLevel: (sg.champion ? 1 : 0)
  };
}

function draw(run){
  if(run.deck.length === 0){
    run.deck = run.discard.slice();
    run.discard = [];
    const rng = game.mulberry32(run.rngSeed + run.encounterIdx*1000 + run.hand.length);
    for(let i=run.deck.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [run.deck[i],run.deck[j]]=[run.deck[j],run.deck[i]]; }
  }
  if(run.deck.length > 0) run.hand.push(run.deck.shift());
}

function beginEnc(run){
  const e = game.ENEMIES.find(x=>x.id===run.path[run.encounterIdx].enemyId);
  const scale = 1 + (run.encounterIdx * 0.05);
  run.enemyHp = Math.floor(e.hp * scale);
  run.enemyMaxHp = run.enemyHp;
  run.spell = [null,null,null];
  if(run.encounterIdx > 0){
    run.hp = Math.min(run.maxHp, run.hp + 8);
  }
  while(run.hand.length < 5 && (run.deck.length > 0 || run.discard.length > 0)) draw(run);
  // Batch B: reset + lock the first intent via the SHARED game code (no drift)
  run.currentThreat = e.threat;
  run.turnInEnc = 0; run.intent = null; run.pendingUnleash = false;
  game.lockIntent(run);
}

function tryAllSpells(run){
  // brute force: try every combination of up to 3 from hand, return best.
  // Rank by NET damage (post-armor) so the AI correctly values pierce runes
  // against armored foes — flat armor otherwise preserves raw ordering.
  const hand = run.hand;
  let best = { damage: 0, indices: [] };
  const consider = (indices)=>{
    setSpell(run, indices);
    const r = sim(run);
    if(!r) return;
    const net = game.netEnemyDamage ? game.netEnemyDamage(run, r.damage, r) : r.damage;
    if(net > best.damage) best = { damage: net, indices: indices.slice(), result: r };
  };
  for(let i=0;i<hand.length;i++){
    consider([i]);
    for(let j=0;j<hand.length;j++){
      if(i===j) continue;
      consider([i, j]);
      for(let k=0;k<hand.length;k++){
        if(k===i||k===j) continue;
        consider([i, j, k]);
      }
    }
  }
  return best;
}

function setSpell(run, indices){
  run.spell = [null, null, null];
  indices.forEach((handIdx, slot) => run.spell[slot] = run.hand[handIdx]);
  run._stagedIdx = indices.slice();
}

function sim(run){
  game.state.run = run;
  // Mirror the REAL game: staging a rune SPLICES it out of run.hand
  // (handleHandTap), so resolveSpell sees the *leftover* hand — not the full
  // 5. Without this, hand-size mechanics (singularity ×hand, pandemonium sum
  // of hand basePowers, Broken Hourglass) are measured on an inflated hand and
  // every balance number drifts high. Exclude the staged indices, restore after.
  const staged = run._stagedIdx || [];
  const savedHand = run.hand;
  if(staged.length){ run.hand = savedHand.filter((_, i) => !staged.includes(i)); }
  const res = game.resolveSpell();
  run.hand = savedHand;
  return res;
}

function applyCast(run){
  const result = sim(run);
  if(!result) return null;
  // mirror cast(): bind elements, fire transmutations/prophecy, advance counter
  if(game.onSpellBound) try{ game.onSpellBound(run, result.presentRunes||[], result); }catch(e){}
  run.castCount = (run.castCount||0) + 1;
  // Batch C1: enemy armor (shared helper, unless the spell pierces)
  const netDmg = game.netEnemyDamage ? game.netEnemyDamage(run, result.damage, result) : result.damage;
  run.enemyHp = Math.max(0, run.enemyHp - netDmg);
  if(result.burn > 0) run.burns = (run.burns||0) + result.burn;  // mirror cast(): Wildfire DoT
  if(result.healing) run.hp = Math.min(run.maxHp, run.hp + result.healing);

  // remove placed runes from hand, push to discard
  const placedIds = run.spell.filter(Boolean);
  placedIds.forEach(id => {
    const idx = run.hand.indexOf(id);
    if(idx !== -1) run.hand.splice(idx, 1);
    run.discard.push(id);
  });
  run.spell = [null,null,null];

  // bonus draw
  for(let i=0;i<(result.bonusDraw||0);i++) draw(run);

  // refill to 5
  while(run.hand.length < 5 && (run.deck.length>0 || run.discard.length>0)) draw(run);

  result.netDamage = netDmg;   // actual damage that landed (post-armor)
  return result;
}

function enemyAttack(run, stunned){
  // Batch B: identical to the real game's enemyTurn — resolve the telegraphed
  // intent (stun skips it) then lock the next. Shared code = zero drift.
  if(run.burns > 0){ run.enemyHp = Math.max(0, run.enemyHp - run.burns); run.burns = 0; }  // mirror enemyTurn burn tick
  if(!stunned) game.executeIntent(run);
  if(run.hp > 0) game.lockIntent(run);
}

function rewardChoice(run){
  // Smarter AI: weigh by rarity AND synergy (matches existing deck element/shape).
  let pool;
  if(run.encounterIdx < 4) pool = game.RUNES.filter(r=>r.rarity==='common'||r.rarity==='uncommon');
  else if(run.encounterIdx < 9) pool = game.RUNES.filter(r=>r.rarity==='uncommon'||r.rarity==='rare');
  else pool = game.RUNES.filter(r=>r.rarity==='rare'||r.rarity==='mythic');
  // Phase 5 progressive reveal: deep runes need their element bound this run
  const sg = (game.SIGILS||[]).find(s=>s.id===run.sigil);
  const bound = new Set([...(run.boundElements||[]), sg&&sg.element].filter(Boolean));
  pool = pool.filter(r => (r.rarity==='common'||r.rarity==='uncommon') || bound.has(r.element));
  if(pool.length < 3) pool = game.RUNES.filter(r=>r.rarity==='common'||r.rarity==='uncommon');
  const rng = game.mulberry32(run.rngSeed + run.encounterIdx*31);
  const offered = [];
  while(offered.length < 3 && pool.length > 0){
    const idx = Math.floor(rng()*pool.length);
    const r = pool[idx];
    if(!offered.find(o=>o.id===r.id)) offered.push(r);
    pool = pool.filter(x=>x.id!==r.id);
  }
  // Score each offered rune: rarity rank + element-match bonus + shape-match bonus
  const rank = { mythic:8, rare:5, uncommon:3, common:1 };
  const allCards = run.deck.concat(run.discard, run.hand);
  const elCounts = {}, shCounts = {};
  allCards.forEach(id => {
    const r = game.RUNES.find(x=>x.id===id);
    if(r){
      elCounts[r.element] = (elCounts[r.element]||0)+1;
      shCounts[r.shape] = (shCounts[r.shape]||0)+1;
    }
  });
  const score = (r) => rank[r.rarity] + (elCounts[r.element]||0)*0.5 + (shCounts[r.shape]||0)*0.3;
  offered.sort((a,b)=>score(b)-score(a));
  const picked = offered[0];
  // only heal if critically low
  if(run.hp < 8){
    run.hp = Math.min(run.maxHp, run.hp + 8);
    run.log.push(`  reward: healed +8 (hp ${run.hp})`);
    return null;
  }
  run.deck.push(picked.id);
  run.log.push(`  reward: ${picked.name} (${picked.rarity}) [score=${score(picked).toFixed(1)}]`);
  return picked;
}

function runOne(seedStr, sigilId, grantRelics){
  const run = newSim(seedStr, sigilId, grantRelics);
  beginEnc(run);
  let turnLimit = 200;
  while(turnLimit-- > 0){
    if(run.hp <= 0) break;
    if(run.encounterIdx >= 13) break;

    // pick best spell
    const best = tryAllSpells(run);
    if(best.indices.length === 0){
      run.log.push(`  ! no playable spell?`);
      break;
    }
    setSpell(run, best.indices);
    const spellRunes = best.indices.map(i=>run.hand[i]).filter(Boolean);
    const result = applyCast(run);
    const _shown = (result.netDamage != null ? result.netDamage : result.damage);
    run.log.push(`  T${run.encounterIdx+1} cast [${spellRunes.join('+')}] dmg=${_shown} enemy=${run.enemyHp}/${run.enemyMaxHp}`);
    run.dmgLog.push({ enc: run.encounterIdx, runes: spellRunes.slice(), dmg: _shown });

    if(run.enemyHp <= 0){
      run.log.push(`  >> defeated ${game.ENEMIES.find(e=>e.id===run.path[run.encounterIdx].enemyId).name}`);
      run.fluency += 1;
      // mirror showRewardModal branching: champion -> relic -> rune
      if(run.champion && (run.encounterIdx===3 || run.encounterIdx===7 || run.encounterIdx===11)){
        run.champion.level = (run.champion.level||1) + 1;
        run.champPeakLevel = Math.max(run.champPeakLevel||0, run.champion.level);
        run.log.push(`  champion -> lvl ${run.champion.level}`);
      } else if([2,5,9].includes(run.encounterIdx)){
        const owned = new Set(run.relics);
        let rp = (game.RELICS||[]).filter(x=>!x.hidden && !owned.has(x.id) && (x.rarity!=='mythic' || (game.state.meta.runsCompleted||0)>=1));
        const rank = { mythic:4, rare:3, uncommon:2, common:1 };
        rp.sort((a,b)=>(rank[b.rarity]||0)-(rank[a.rarity]||0));
        if(rp[0]){ run.relics.push(rp[0].id); run.log.push(`  relic: ${rp[0].name}`); }
        else rewardChoice(run);
      } else {
        rewardChoice(run);
      }
      run.encounterIdx += 1;
      if(run.encounterIdx >= 13){
        run.log.push(`*** VICTORY *** in run "${seedStr}"`);
        break;
      }
      beginEnc(run);
    } else {
      enemyAttack(run, result.stun);
      run.log.push(`  enemy attacks; hp=${run.hp}`);
    }
  }
  return run;
}

/* ====================================================================
   ANALYSIS HELPERS
   ==================================================================== */
const NUM_RUNS = 100;
const RELIC_RUNS = 35;          // lower per-cell count for the relic matrix
const SIGIL_IDS = (game.SIGILS||[{id:'free'}]).map(s=>s.id);
const RUNE_BY_ID = {};
game.RUNES.forEach(r=>{ RUNE_BY_ID[r.id] = r; });

function classifyRun(run){
  const tally = { 'mono-element':0, 'shape-stack':0, 'xmult-payoff':0, retrigger:0, pandemonium:0, other:0 };
  (run.dmgLog||[]).forEach(rec=>{
    const objs = rec.runes.map(id=>RUNE_BY_ID[id]).filter(Boolean);
    if(objs.length===0){ tally.other++; return; }
    const tags = objs.reduce((a,o)=>a.concat(o.tags||[]),[]);
    const els = new Set(objs.map(o=>o.element));
    const shapes = new Set(objs.map(o=>o.shape));
    const w = Math.max(1, rec.dmg);
    if(rec.runes.includes('pandemonium')) tally.pandemonium += w;
    else if(tags.includes('retrigger') || rec.runes.includes('ouroboros') || rec.runes.includes('echo') || rec.runes.includes('recursion') || rec.runes.includes('twin')) tally.retrigger += w;
    else if(tags.includes('xmult')) tally['xmult-payoff'] += w;
    else if(objs.length>=3 && els.size===1) tally['mono-element'] += w;
    else if(objs.length>=3 && shapes.size===1) tally['shape-stack'] += w;
    else tally.other += w;
  });
  let best='other', bestV=-1;
  Object.entries(tally).forEach(([k,v])=>{ if(k!=='other' && v>bestV){ bestV=v; best=k; } });
  if(bestV<=0) best='other';
  return best;
}

function runFingerprint(run){
  return run.encounterIdx + '|' + (run.dmgLog||[]).map(r=>r.enc+':'+r.runes.join('+')+'='+r.dmg).join(',');
}

/* ====================================================================
   1. PER-SIGIL BALANCE BATTERY
   ==================================================================== */
console.log(`Running ${NUM_RUNS} AI playthroughs per Sigil (${SIGIL_IDS.join(', ')})...\n`);

function battery(sigilId){
  let wins=0; const lossEnc={}; let peak=[]; let dmgs=[];
  const runs=[];
  for(let i=0;i<NUM_RUNS;i++){
    const run = runOne('sim-'+i, sigilId);
    runs.push(run);
    if(run.encounterIdx >= 13) wins++;
    else lossEnc[run.encounterIdx] = (lossEnc[run.encounterIdx]||0)+1;
    const ds = run.log.filter(l=>l.includes('dmg=')).map(l=>{ const m=l.match(/dmg=(\d+)/); return m?+m[1]:0; });
    dmgs = dmgs.concat(ds); peak.push(Math.max(0,...ds));
  }
  return {
    sigilId, wins,
    pct: wins/NUM_RUNS*100,
    bossLoss: lossEnc[12]||0,
    avgDmg: dmgs.length ? dmgs.reduce((a,b)=>a+b,0)/dmgs.length : 0,
    peakMax: Math.max(...peak),
    lossEnc, runs,
  };
}

const results = SIGIL_IDS.map(battery);
console.log('=== PER-SIGIL WIN RATE (greedy AI, 100 runs each) ===');
results.forEach(r=>{
  const flag = r.pct>70 ? '  ⚠ TOO EASY' : r.pct<15 ? '  ⚠ TOO HARD' : '';
  console.log(`  ${r.sigilId.padEnd(7)} ${String(r.wins).padStart(3)}/100 (${r.pct.toFixed(0)}%)  bossLosses=${r.bossLoss}  avgDmg=${r.avgDmg.toFixed(1)}  peakMax=${r.peakMax}${flag}`);
});
const overall = results.reduce((a,r)=>a+r.wins,0) / (results.length*NUM_RUNS) * 100;
console.log(`\nOverall win rate: ${overall.toFixed(1)}%   [healthy band 30-55% greedy AI]`);
const easy = results.filter(r=>r.pct>70), hard = results.filter(r=>r.pct<15);
if(easy.length) console.log(`⚠ Trivial Sigils: ${easy.map(r=>r.sigilId).join(', ')} · nerf their boon/curated pool`);
if(hard.length) console.log(`⚠ Brutal Sigils:  ${hard.map(r=>r.sigilId).join(', ')} · the seal is too costly`);
if(!easy.length && !hard.length) console.log(`✓ All Sigils inside the healthy band, depth power is balanced.`);
const free = results.find(r=>r.sigilId==='free');
if(free) console.log(`\nBaseline (Free Inscription): ${free.pct.toFixed(1)}%  (Phase-2 reference ~37-41%)`);

/* ====================================================================
   2. PER-RELIC IMPACT MATRIX
   ==================================================================== */
console.log(`\n=== PER-RELIC IMPACT (force-granted at run start, ${RELIC_RUNS} runs/Sigil/relic) ===`);
function relicWinRate(grant){
  let wins=0, total=0;
  SIGIL_IDS.forEach(sid=>{
    for(let i=0;i<RELIC_RUNS;i++){
      total++;
      const run = runOne('rlc-'+i, sid, grant);
      if(run.encounterIdx >= 13) wins++;
    }
  });
  return { pct: wins/total*100, wins, total };
}
const baseline = relicWinRate([]);
console.log(`  (control: no relic)            ${baseline.pct.toFixed(1)}%  (${baseline.wins}/${baseline.total})`);
const offerableRelics = (game.RELICS||[]).filter(r=>!r.hidden);
const relicRows = offerableRelics.map(rel=>{
  const r = relicWinRate([rel.id]);
  return { id:rel.id, name:rel.name, rarity:rel.rarity, pct:r.pct, delta:r.pct - baseline.pct };
});
relicRows.sort((a,b)=>b.delta-a.delta);
const overpowered=[], dead=[];
relicRows.forEach(row=>{
  const sign = row.delta>=0 ? '+' : '';
  let flag='';
  if(row.delta > 25){ flag='  ⚠ OVERPOWERED'; overpowered.push(row); }
  else if(row.delta < 2){ flag='  ⚠ DEAD'; dead.push(row); }
  console.log(`  ${row.name.padEnd(24)} ${row.pct.toFixed(1).padStart(5)}%  Δ ${sign}${row.delta.toFixed(1)}pts  (${row.rarity})${flag}`);
});

/* ====================================================================
   3. CHAMPION LEVEL SCALING SANITY
   ==================================================================== */
console.log(`\n=== CHAMPION LEVEL SCALING (avg win-rate by final Champion level) ===`);
const byLevel = {};
results.forEach(res=>{
  res.runs.forEach(run=>{
    if(!run.champion) return;
    const lv = run.champPeakLevel || run.champion.level || 1;
    byLevel[lv] = byLevel[lv] || { wins:0, total:0 };
    byLevel[lv].total++;
    if(run.encounterIdx >= 13) byLevel[lv].wins++;
  });
});
const lvKeys = Object.keys(byLevel).map(Number).sort((a,b)=>a-b);
if(lvKeys.length===0){
  console.log('  (no Champion-bearing runs in the battery)');
} else {
  lvKeys.forEach(lv=>{
    const c = byLevel[lv];
    console.log(`  Level ${lv}: ${(c.total?c.wins/c.total*100:0).toFixed(1)}% win  (${c.wins}/${c.total} runs)`);
  });
  let monotone=true;
  for(let i=1;i<lvKeys.length;i++){
    const lo = byLevel[lvKeys[i-1]], hi = byLevel[lvKeys[i]];
    if((hi.total?hi.wins/hi.total*100:0) + 5 < (lo.total?lo.wins/lo.total*100:0)) monotone=false;
  }
  console.log(monotone ? '  ✓ Champion scaling is monotone-ish.' : '  ⚠ Champion scaling inverts, check apply() curves.');
}

/* ====================================================================
   4. BUILD-ARCHETYPE DETECTION
   ==================================================================== */
console.log(`\n=== BUILD ARCHETYPE WIN-RATE (dominant line per run, all Sigils) ===`);
const arch = {};
results.forEach(res=>{
  res.runs.forEach(run=>{
    const a = classifyRun(run);
    arch[a] = arch[a] || { wins:0, total:0 };
    arch[a].total++;
    if(run.encounterIdx >= 13) arch[a].wins++;
  });
});
const archRows = Object.entries(arch).map(([name,c])=>({
  name, total:c.total, wins:c.wins,
  pct: c.total ? c.wins/c.total*100 : 0,
  share: c.total / (results.length*NUM_RUNS) * 100
})).sort((a,b)=>b.share-a.share);
archRows.forEach(row=>{
  console.log(`  ${row.name.padEnd(13)} share ${row.share.toFixed(1).padStart(5)}%  win ${row.pct.toFixed(1).padStart(5)}%  (${row.wins}/${row.total})`);
});
const playable = archRows.filter(r=>r.name!=='other');
const domArch = playable.slice().sort((a,b)=>b.share-a.share)[0];
const archDominant = domArch && domArch.share > 60 ? domArch : null;
if(archDominant) console.log(`  ⚠ '${archDominant.name}' is played in ${archDominant.share.toFixed(0)}% of runs, strategy diversity is thin.`);
else console.log('  ✓ No single archetype exceeds 60% of runs, strategy space is varied.');

/* ====================================================================
   5. DETERMINISM ASSERTION
   ==================================================================== */
console.log(`\n=== DETERMINISM ASSERTION (same seed + Sigil twice) ===`);
let detPass = true;
SIGIL_IDS.forEach(sid=>{
  const a = runOne('determinism-probe', sid);
  const b = runOne('determinism-probe', sid);
  const ok = runFingerprint(a) === runFingerprint(b) && a.encounterIdx === b.encounterIdx;
  if(!ok) detPass = false;
  console.log(`  ${sid.padEnd(7)} encIdx ${a.encounterIdx}/${b.encounterIdx}  casts ${a.dmgLog.length}/${b.dmgLog.length}  ${ok ? 'PASS' : 'FAIL'}`);
});
console.log(detPass
  ? '  ✓ DETERMINISM PASS · identical reruns.'
  : '  ✗ DETERMINISM FAIL · reruns diverge; Phase-6 fix regressed.');

/* ====================================================================
   BALANCE VERDICT
   ==================================================================== */
console.log(`\n================  BALANCE VERDICT  ================`);
const verdicts = [];
if(easy.length) verdicts.push(`Overpowered Sigil(s): ${easy.map(r=>r.sigilId+' '+r.pct.toFixed(0)+'%').join(', ')}.`);
if(hard.length) verdicts.push(`Brutal Sigil(s): ${hard.map(r=>r.sigilId+' '+r.pct.toFixed(0)+'%').join(', ')}.`);
if(!easy.length && !hard.length) verdicts.push(`Sigils balanced (all 15-70%, overall ${overall.toFixed(0)}%).`);
if(overpowered.length) verdicts.push(`Overpowered relic(s): ${overpowered.map(r=>r.name+' (+'+r.delta.toFixed(0)+'pts)').join(', ')}.`);
if(dead.length) verdicts.push(`Dead relic(s) (<+2pts): ${dead.map(r=>r.name).join(', ')}.`);
if(!overpowered.length && !dead.length) verdicts.push(`Relics balanced (+2..+25 pts each).`);
if(relicRows[0]) verdicts.push(`Strongest relic: ${relicRows[0].name} (Δ+${relicRows[0].delta.toFixed(1)}). Weakest: ${relicRows[relicRows.length-1].name} (Δ${(relicRows[relicRows.length-1].delta>=0?'+':'')}${relicRows[relicRows.length-1].delta.toFixed(1)}).`);
if(archDominant) verdicts.push(`Dominant strategy: '${archDominant.name}' (${archDominant.share.toFixed(0)}% of runs).`);
else if(playable.length) verdicts.push(`Strategy diversity OK; most common '${(domArch||playable[0]).name}' ${((domArch||playable[0]).share).toFixed(0)}%.`);
verdicts.push(`Determinism: ${detPass ? 'PASS' : 'FAIL'}.`);
verdicts.forEach(v=>console.log(`• ${v}`));
const anyAlarm = easy.length || hard.length || overpowered.length || dead.length || archDominant || !detPass;
console.log(anyAlarm ? `\nVERDICT: tuning needed, see flagged items.` : `\nVERDICT: depth systems balanced; determinism holds.`);
console.log(`===================================================`);
