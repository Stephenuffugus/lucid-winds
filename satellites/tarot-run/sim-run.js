// Tarot Run full-run simulator.
// Greedy AI that:
//  - Picks node order based on type (rest if low HP, treasure always, combat otherwise)
//  - Plays cards in combat heuristically: kill if possible, else block if threatened, else damage
//  - Picks rewards by synergy (favors dominant suit)

const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const code = html.match(/<script>([\s\S]+?)<\/script>/)[1];

const domStub = `
  const _stub = () => ({
    addEventListener:()=>{}, classList:{add:()=>{},remove:()=>{},contains:()=>false},
    appendChild:()=>{}, removeChild:()=>{}, setAttribute:()=>{}, getAttribute:()=>'',
    style:{}, innerHTML:'', textContent:'', onclick:null, oncontextmenu:null,
    dataset:{}, children:[], querySelector:_stub, querySelectorAll:()=>[],
    remove:()=>{}, offsetWidth:0, offsetHeight:0,
    getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),
    firstElementChild:null
  });
  const document = {
    getElementById: _stub, querySelector: _stub, querySelectorAll: () => [],
    createElement: _stub, body:{ appendChild:()=>{} }
  };
  const window = { addEventListener: ()=>{}, innerWidth:400 };
  const localStorage = { _s:{}, getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
  const navigator = { serviceWorker:null };
  const setTimeout = () => {};
  const clearTimeout = () => {};
  const confirm = () => true;
  const Image = function(){ return { onload:null, onerror:null, src:'' }; };
`;

const exposed = `
  return {
    ALL_CARDS, CARD_BY_ID, MAJOR_CARDS, MINOR_CARDS, ENEMIES, ENEMY_BY_ID, RELICS, SUIT_NAME,
    freshRun, startCombat, endTurn, playCard,
    dealDamage, dealPierce, gainBlock, healPlayer, drawCards,
    mulberry32, strHash, shuffleInPlace, pickRand,
    state
  };
`;

const game = eval(`(function(){${domStub}${code}; ${exposed} })()`);

function simRun(seedStr, opts={}){
  const log = [];
  const trace = (s)=> { if(opts.verbose) console.log(s); log.push(s); };

  game.state.run = game.freshRun(seedStr);
  const run = game.state.run;

  for(let floorIdx = 0; floorIdx < 15; floorIdx++){
    if(run.hp <= 0) break;
    const floor = run.path[floorIdx];

    // pick best node (heuristic)
    let nodeIdx = 0;
    if(floor.nodes.length > 1){
      const wantRest = run.hp < run.maxHp * 0.5;
      const ranks = floor.nodes.map((node, i) => {
        let s = 0;
        if(node.type === 'treasure') s = 100;
        else if(node.type === 'rest') s = wantRest ? 80 : 20;
        else if(node.type === 'event') s = 40;
        else if(node.type === 'combat') s = 30;
        else if(node.type === 'elite') s = run.hp > run.maxHp * 0.7 ? 50 : 10;
        return { i, s };
      });
      ranks.sort((a,b)=>b.s-a.s);
      nodeIdx = ranks[0].i;
    }
    floor.chosenNode = nodeIdx;
    const node = floor.nodes[nodeIdx];
    run.floor = floorIdx;

    if(node.type === 'combat' || node.type === 'elite' || node.type === 'boss'){
      // run combat
      game.startCombat(node.enemyId);
      const result = simCombat(node, log, opts.verbose);
      if(!result.won){
        trace(`  FLOOR ${floorIdx} (${node.type}/${node.enemyId}): LOSS at hp ${run.hp}`);
        run.hp = 0;
        break;
      }
      // sim reward (just take 1st card always — simple greedy)
      const rewardPool = node.type === 'boss' || node.type === 'elite'
        ? game.ALL_CARDS.filter(c => c.rarity === 'rare')
        : (floorIdx < 4 ? game.ALL_CARDS.filter(c => c.rarity==='common'||c.rarity==='uncommon')
          : (floorIdx < 9 ? game.ALL_CARDS.filter(c => c.rarity==='uncommon'||c.rarity==='rare')
            : game.ALL_CARDS.filter(c => c.rarity==='rare')));
      const rng = game.mulberry32(run.rngSeed + floorIdx * 31);
      const offered = [];
      const pool = rewardPool.slice();
      game.shuffleInPlace(pool, rng);
      for(const c of pool){ if(offered.length >= 3) break; if(!offered.find(o=>o.id===c.id)) offered.push(c); }

      // smart pick: prefer high-power cards in our dominant suit
      const ownedSuitCt = {};
      run.deck.forEach(e => { const c = game.CARD_BY_ID[e.cardId]; ownedSuitCt[c.suit] = (ownedSuitCt[c.suit]||0)+1; });
      const score = (c) => {
        let s = 1;
        if(c.suit !== 'major') s += (ownedSuitCt[c.suit]||0) * 0.5;
        if(c.suit === 'major') s += 2;
        s += (c.arcanaNum || 0) * 0.15;
        if(c.cost === 0) s += 1.5;
        return s;
      };
      offered.sort((a,b)=>score(b)-score(a));
      // skip if hp low → grab gold for safety (but mostly take)
      if(run.hp < run.maxHp * 0.3){
        // skip
      } else {
        run.deck.push({ cardId: offered[0].id, reversed: false });
      }
      run.combat = null; run.combatPlayer = null; run.combatEnemy = null;
      floor.completed = true;
      // sim heal/gold flow happens in advanceFloor; we just simulate
      run.hp = Math.min(run.maxHp, run.hp); // already reflects post-combat
      run.gold += 10 + Math.floor(floorIdx * 1.5);
      trace(`  FLOOR ${floorIdx} (${node.type}/${node.enemyId}): WIN, hp ${run.hp}, took ${offered[0].name}, deck=${run.deck.length}`);
    } else if(node.type === 'rest'){
      const heal = Math.floor(run.maxHp * 0.4);
      run.hp = Math.min(run.maxHp, run.hp + heal);
      floor.completed = true;
      trace(`  FLOOR ${floorIdx} (rest): healed ${heal}, hp ${run.hp}`);
    } else if(node.type === 'treasure'){
      const undiscovered = game.RELICS.filter(r => !run.relics.includes(r.id));
      if(undiscovered.length > 0){
        const rng = game.mulberry32(run.rngSeed + floorIdx * 199);
        game.shuffleInPlace(undiscovered, rng);
        run.relics.push(undiscovered[0].id);
        trace(`  FLOOR ${floorIdx} (treasure): got ${undiscovered[0].name}`);
      } else run.gold += 30;
      floor.completed = true;
    } else if(node.type === 'event'){
      // sim event: 60% beneficial (heal/card), 40% costly
      const rng = game.mulberry32(run.rngSeed + floorIdx * 433);
      if(rng() < 0.6){
        run.hp = Math.min(run.maxHp, run.hp + 10);
        trace(`  FLOOR ${floorIdx} (event): heal 10`);
      } else {
        run.hp = Math.max(1, run.hp - 6);
        // add a random card
        const pool = game.ALL_CARDS.filter(c => c.rarity==='uncommon' && c.suit !== 'major');
        const card = pool[Math.floor(rng()*pool.length)];
        run.deck.push({ cardId: card.id, reversed: false });
        trace(`  FLOOR ${floorIdx} (event): -6 hp, +${card.name}`);
      }
      floor.completed = true;
    }
  }
  const won = run.path[14].completed && run.hp > 0;
  return { won, floor: run.path.findIndex(f => !f.completed), endHp: run.hp, deck: run.deck, log };
}

function simCombat(node, log, verbose){
  const run = game.state.run;
  const trace = (s)=> { if(verbose) console.log(s); log.push(s); };
  let turnLimit = 60;
  while(turnLimit-- > 0){
    if(run.combatEnemy.hp <= 0) return { won: true };
    if(run.combatPlayer.hp <= 0) return { won: false };

    // pick best card to play
    const idx = pickBestCard();
    if(idx === -1){
      // end turn
      try { game.endTurn(); }
      catch(e){ trace('  ! endTurn error: ' + e.message); return { won: false }; }
      continue;
    }
    try { game.playCard(idx); }
    catch(e){ trace('  ! playCard error: ' + e.message + ' idx=' + idx); return { won: false }; }
    // resolve any pending choice automatically (rough)
    if(run.combat.pendingChoice){
      run.combat.pendingChoice = null;
    }
  }
  return { won: run.combatEnemy.hp <= 0 };
}

function pickBestCard(){
  // Score cards: priorities are
  //  1. Killing the enemy this turn = max priority
  //  2. Block sufficient to negate enemy intent
  //  3. Pierce > damage (vs blocking enemies)
  //  4. Cheap cards first to maximize plays per turn
  const run = game.state.run;
  const ctx = { player: run.combatPlayer, enemy: run.combatEnemy, combat: run.combat, run };
  const hand = ctx.player.hand;
  if(hand.length === 0) return -1;
  const enemy = ctx.enemy;
  const intent = enemy.intent;
  const incomingDmg = intent && intent.type === 'attack' ? (intent.value * (intent.count||1)) : 0;
  const needsBlock = incomingDmg > ctx.player.block;

  let best = -1; let bestScore = -Infinity;
  for(let i=0;i<hand.length;i++){
    const card = game.CARD_BY_ID[hand[i].cardId];
    if(card.cost > ctx.player.energy) continue;
    if(card.suit === 'major' && ctx.combat.currentMajorCast) continue;
    let s = 0;
    // estimate damage from desc
    const dmgMatch = card.desc.match(/(?:Strike|Pierce) (\d+)/i);
    const blkMatch = card.desc.match(/Block (\d+)/i);
    const healMatch = card.desc.match(/Heal (\d+)/i);
    const drawMatch = card.desc.match(/Draw (\d+)/i);
    const dmg = dmgMatch ? parseInt(dmgMatch[1]) : 0;
    const blk = blkMatch ? parseInt(blkMatch[1]) : 0;
    const heal = healMatch ? parseInt(healMatch[1]) : 0;
    const draw = drawMatch ? parseInt(drawMatch[1]) : 0;
    if(dmg >= enemy.hp) s += 1000; // can kill
    s += dmg * 1.5;
    if(card.desc.includes('Pierce')) s += dmg * 0.5; // bonus, ignores block
    if(needsBlock) s += blk * 1.4;
    else s += blk * 0.6;
    if(ctx.player.hp < ctx.player.maxHp * 0.6) s += heal * 1.3;
    else s += heal * 0.5;
    s += draw * 2;
    // cost efficiency
    s -= card.cost * 0.5;
    if(s > bestScore){ bestScore = s; best = i; }
  }
  // If nothing has positive value, end turn
  if(bestScore < 0) return -1;
  return best;
}

// Run 50 sims
const NUM = 50;
let wins = 0;
const lossFloor = {};
const reachedHist = {};
let totalDeckSize = 0;
let totalEndHp = 0;
for(let i=0;i<NUM;i++){
  const r = simRun('sim-' + i);
  if(r.won) { wins++; reachedHist[15] = (reachedHist[15]||0)+1; }
  else {
    lossFloor[r.floor] = (lossFloor[r.floor]||0) + 1;
    reachedHist[r.floor] = (reachedHist[r.floor]||0) + 1;
  }
  totalDeckSize += r.deck.length;
  totalEndHp += r.endHp;
}

console.log(`\n=== AGGREGATE (${NUM} runs) ===`);
console.log(`Win rate: ${wins}/${NUM} (${(wins/NUM*100).toFixed(1)}%)`);
console.log(`Avg deck size at end: ${(totalDeckSize/NUM).toFixed(1)}`);
console.log(`Avg end HP: ${(totalEndHp/NUM).toFixed(1)}`);
console.log(`\nLoss-by-floor distribution:`);
for(let i=0;i<=15;i++){
  if(reachedHist[i]){
    const bar = '█'.repeat(reachedHist[i]);
    const label = i === 15 ? 'WIN' : `flr${String(i).padStart(2)}`;
    console.log(`  ${label}: ${bar} (${reachedHist[i]})`);
  }
}

// One verbose sample
console.log(`\n=== SAMPLE RUN (sim-7) ===`);
const sample = simRun('sim-7-verbose', { verbose: true });
console.log(`Result: ${sample.won ? 'WIN' : 'LOSS on floor ' + sample.floor} (final hp ${sample.endHp}, deck ${sample.deck.length})`);
