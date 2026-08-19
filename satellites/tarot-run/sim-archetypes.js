// Tarot Run — multi-archetype stress harness.
//
// WHY THIS EXISTS, READ FIRST:
//   Raw sim win-rate is a KNOWN-BAD proxy (see BALANCE.md / RESUME.md). The
//   engine is real here, but a bot is not a person. So this file does NOT
//   report "the win rate" as truth and you must NOT tune a knob to it.
//   What it DOES give you is *shape* and *deltas*:
//     - Does a player who understands the B11 web (Comboist) meaningfully
//       out-survive a button-masher? If yes, the depth is real & rewarded.
//       If they're equal, the synergy is cosmetic.
//     - Do the 4 Patrons diverge, or is one strictly dominant/weak?
//     - Where do runs die — a difficulty CURVE or a CLIFF?
//     - Retention proxies: run length, HP pressure shape, how often the
//       engine actually fires in practice, run-to-run variety.
//   It models the B10 Cut as a per-archetype outcome distribution (skilled
//   players nail the Sun more often) applying the SAME buff/curse the real
//   cutTheDeck() applies, so post-B10/B11 reality is reflected.
//
// Standalone: never required by index.html. Safe to run/commit. Tweak
// SEEDS / PATRONS / POLICIES at the bottom.

const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
/* ⛔ THE LARGEST inline block, not the FIRST one.
   This used to read html.match(/<script>...<\/script>/)[1], which takes the first
   block in the file. When the SWS embed protocol block was later added near the
   top of index.html, this harness silently stopped reading the game and started
   reading a fifteen line snippet instead. All five suites died at once, and the
   symptom was a ReferenceError on location.search that looked like a missing DOM
   stub rather than the harness testing the wrong code entirely.
   RESUME.md still claimed "test-cards 0 err + diag A-H + sim clean" on every build
   the whole time. Take the biggest block: the game is always the biggest block. */
const code = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).sort((a, b) => b.length - a.length)[0];

const domStub = `
  /* Stub location and history too. All five harnesses stubbed document, window,
     navigator and localStorage but NOT location, and then the SWS embed protocol
     block was added to the game, whose very first line reads location.search AT
     LOAD. That threw ReferenceError before a single assertion ran, so all five
     suites had been dead for some time while RESUME.md still claimed
     "test-cards 0 err + diag A-H + sim clean" on every build. A suite that cannot
     load looks exactly like a suite with nothing to say. */
  const location = { search:'', hash:'', href:'https://example.invalid/', pathname:'/', hostname:'example.invalid', protocol:'https:', origin:'https://example.invalid', replace(){}, assign(){}, reload(){} };
  const history = { length:1, back(){}, forward(){}, go(){}, pushState(){}, replaceState(){} };
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
    mulberry32, strHash, shuffleInPlace, pickRand, state
  };
`;
const game = eval(`(function(){${domStub}${code}; ${exposed} })()`);

const CB = game.CARD_BY_ID;

/* ---------- card role tagging (read from desc — the player can read it too) ---------- */
function roles(card){
  const d = card.desc || '';
  return {
    dmg:        (d.match(/(?:Strike|Pierce)\s+(\d+)/i) || [0,0])[1] | 0,
    blk:        (d.match(/Block\s+(\d+)/i) || [0,0])[1] | 0,
    heal:       (d.match(/Heal\s+(\d+)/i) || [0,0])[1] | 0,
    draw:       (d.match(/Draw\s+(\d+)/i) || [0,0])[1] | 0,
    pierce:     /Pierce/i.test(d),
    emberLay:   /Apply\s+\d+\s+Ember/i.test(d),
    emberPay:   /per\s+Ember|consume\s+all\s+Ember|enemy.?s\s+Ember/i.test(d),
    debuffApply:/Apply\s+(Weak|Vulnerable)/i.test(d),
    debuffPay:  /per\s+debuff/i.test(d),
    blockScale: /(half|quarter|third|a\s+third)\s+of\s+your\s+Block|equal\s+to\s+.*your\s+Block/i.test(d),
    healBridge: /healed\s+\d+\+?|HP\s+you\s+have\s+healed|half\s+the\s+HP/i.test(d),
  };
}

/* ---------- the Cut (B10) modelled as an outcome distribution per archetype ---------- */
// effects mirror cutTheDeck() exactly: strong=+2 Str, faint=+1 Str, tower=Weak 2, silent=none
const CUT_EFFECT = {
  strong: p => { p.buffs.strength = (p.buffs.strength||0) + 2; },
  faint:  p => { p.buffs.strength = (p.buffs.strength||0) + 1; },
  tower:  p => { p.debuffs.weak  = (p.debuffs.weak||0)  + 2; },
  silent: () => {},
};
function rollCut(dist, rng){
  const r = rng(); let acc = 0;
  for(const k of ['strong','faint','silent','tower']){ acc += dist[k]||0; if(r < acc) return k; }
  return 'silent';
}

/* ---------- combat policies ---------- */
function baseScore(card, R, ctx, needsBlock){
  let s = 0;
  if(R.dmg >= ctx.enemy.hp && !R.blockScale) s += 1000;
  s += R.dmg * 1.5;
  if(R.pierce) s += R.dmg * 0.5;
  s += needsBlock ? R.blk * 1.4 : R.blk * 0.5;
  s += (ctx.player.hp < ctx.player.maxHp * 0.6) ? R.heal * 1.3 : R.heal * 0.4;
  s += R.draw * 2;
  s -= card.cost * 0.5;
  return s;
}
function chainHint(card, ctx){
  // riding The Chain: same-suit minor as the live chain (Major is wild)
  if(card.suit === 'major') return 6;
  if(ctx.combat.chainSuit && card.suit === ctx.combat.chainSuit) return 8 + (ctx.combat.chainCount||0)*3;
  if(!ctx.combat.chainSuit) return 3;
  return 0;
}
const POLICIES = {
  // button-masher: biggest immediate stat, blind to synergy & Chain. Bad at the Cut.
  masher: {
    cut:{ strong:0.12, faint:0.18, silent:0.45, tower:0.25 },
    pick(ctx, needsBlock){
      let best=-1,bs=-Infinity;
      const h=ctx.player.hand;
      for(let i=0;i<h.length;i++){ const c=CB[h[i].cardId];
        if(c.cost>ctx.player.energy) continue;
        if(c.suit==='major'&&ctx.combat.currentMajorCast) continue;
        const s=baseScore(c, roles(c), ctx, needsBlock);
        if(s>bs){bs=s;best=i;} }
      return bs<0?-1:best;
    }
  },
  // suit-loyalist: leans into one suit hard to ride The Chain. Average Cut.
  chainer: {
    cut:{ strong:0.22, faint:0.26, silent:0.34, tower:0.18 },
    pick(ctx, needsBlock){
      let best=-1,bs=-Infinity;
      const h=ctx.player.hand;
      for(let i=0;i<h.length;i++){ const c=CB[h[i].cardId];
        if(c.cost>ctx.player.energy) continue;
        if(c.suit==='major'&&ctx.combat.currentMajorCast) continue;
        const R=roles(c);
        let s=baseScore(c,R,ctx,needsBlock) + chainHint(c,ctx)*1.4;
        if(s>bs){bs=s;best=i;} }
      return bs<0?-1:best;
    }
  },
  // engaged player who GETS the B11 web: sets up Ember/debuffs/Block, then cashes in. Good Cut.
  comboist: {
    cut:{ strong:0.42, faint:0.30, silent:0.20, tower:0.08 },
    pick(ctx, needsBlock){
      const h=ctx.player.hand, E=ctx.enemy;
      const ember = (E.debuffs&&E.debuffs.burn)||0;
      const vuln  = (E.debuffs&&E.debuffs.vulnerable)||0;
      const debuffN = E.debuffs ? Object.entries(E.debuffs).filter(([k,v])=>v>0&&k!=='strength').length : 0;
      const healed = (ctx.combat&&ctx.combat.healedThisCombat)||0;
      let best=-1,bs=-Infinity;
      for(let i=0;i<h.length;i++){ const c=CB[h[i].cardId];
        if(c.cost>ctx.player.energy) continue;
        if(c.suit==='major'&&ctx.combat.currentMajorCast) continue;
        const R=roles(c);
        let s=baseScore(c,R,ctx,needsBlock) + chainHint(c,ctx);
        // cash in what's already set up
        if(R.emberPay)  s += ember>0 ? 14 + ember*5 : -6;
        if(R.debuffPay) s += debuffN>0 ? 10 + debuffN*5 : -4;
        if(R.blockScale)s += ctx.player.block*0.6;
        if(R.healBridge)s += healed>=12 ? 16 : -4;
        if(!E.debuffs.vulnerable===false && vuln>0 && R.dmg>=8 && !R.pierce) s += 8; // hit the open seam
        // lay setup early when nothing is brewing
        if(R.emberLay && ember===0)        s += 7;
        if(R.debuffApply && debuffN===0)   s += 6;
        if((R.blockScale||R.healBridge) && ctx.player.block<6 && healed<8) s -= 5; // don't fire payoff dry
        if(s>bs){bs=s;best=i;} }
      return bs<0?-1:best;
    }
  },
  // cautious survivor: prioritises Block/Heal/Ward, only swings when safe. Average Cut.
  turtle: {
    cut:{ strong:0.22, faint:0.28, silent:0.34, tower:0.16 },
    pick(ctx, needsBlock){
      let best=-1,bs=-Infinity;
      const h=ctx.player.hand;
      const lowHp = ctx.player.hp < ctx.player.maxHp*0.65;
      for(let i=0;i<h.length;i++){ const c=CB[h[i].cardId];
        if(c.cost>ctx.player.energy) continue;
        if(c.suit==='major'&&ctx.combat.currentMajorCast) continue;
        const R=roles(c);
        let s=baseScore(c,R,ctx,needsBlock);
        s += R.blk*1.3 + (lowHp?R.heal*1.6:R.heal*0.7);
        if(/Ward/i.test(c.desc)) s += 6;
        if(R.dmg>=ctx.enemy.hp) s += 1000;
        if(s>bs){bs=s;best=i;} }
      return bs<0?-1:best;
    }
  },
};

/* ---------- reward drafting per archetype ---------- */
function draft(offered, run, policy){
  const own={}; run.deck.forEach(e=>{ const c=CB[e.cardId]; own[c.suit]=(own[c.suit]||0)+1; });
  const dom = Object.entries(own).filter(([k])=>k!=='major').sort((a,b)=>b[1]-a[1])[0];
  const domSuit = dom?dom[0]:null;
  const sc=(c)=>{ const R=roles(c); let s=1+(c.arcanaNum||0)*0.12; if(c.cost===0)s+=1.2;
    if(c.suit==='major')s+=2.5;
    if(policy==='comboist'){ if(R.emberLay||R.emberPay||R.debuffApply||R.debuffPay||R.blockScale||R.healBridge)s+=4;
      if(c.suit===domSuit)s+=2; }
    else if(policy==='chainer'){ if(c.suit===domSuit)s+=4; }
    else if(policy==='turtle'){ s+=R.blk*0.4+R.heal*0.4; if(/Ward/i.test(c.desc))s+=2; }
    else { s+=R.dmg*0.3; if(c.suit===domSuit)s+=1; } // masher
    return s; };
  return offered.slice().sort((a,b)=>sc(b)-sc(a))[0];
}

/* ---------- one full run ---------- */
function simRun(seedStr, patronId, polName){
  const policy = POLICIES[polName];
  game.state.run = game.freshRun(seedStr, patronId);
  const run = game.state.run;
  const stat = { turns:0, combats:0, hpLostInCombat:0, cut:{strong:0,faint:0,silent:0,tower:0},
                 fired:{ember:0,debuff:0,block:0,heal:0} };

  for(let f=0; f<15; f++){
    if(run.hp<=0) break;
    const floor=run.path[f];
    let ni=0;
    if(floor.nodes.length>1){
      const wantRest=run.hp<run.maxHp*0.5;
      ni=floor.nodes.map((nd,i)=>{ let s=0;
        if(nd.type==='treasure')s=100; else if(nd.type==='rest')s=wantRest?80:20;
        else if(nd.type==='event')s=40; else if(nd.type==='combat')s=30;
        else if(nd.type==='elite')s=run.hp>run.maxHp*0.7?50:10; return {i,s}; })
        .sort((a,b)=>b.s-a.s)[0].i;
    }
    floor.chosenNode=ni; const node=floor.nodes[ni]; run.floor=f;

    if(node.type==='combat'||node.type==='elite'||node.type==='boss'){
      game.startCombat(node.enemyId);
      // model the Cut (B10) for this archetype
      const crng=game.mulberry32(run.rngSeed + f*7919 + 13);
      const out=rollCut(policy.cut, crng); stat.cut[out]++; CUT_EFFECT[out](run.combatPlayer);
      const hp0=run.combatPlayer.hp;
      const res=simCombat(policy, stat);
      stat.combats++;
      if(!res){ run.hp=0; break; }
      stat.hpLostInCombat += Math.max(0, hp0 - run.combatPlayer.hp);
      run.hp = run.combatPlayer.hp;
      // reward
      const pool = (node.type==='boss'||node.type==='elite') ? game.ALL_CARDS.filter(c=>c.rarity==='rare')
        : (f<4?game.ALL_CARDS.filter(c=>c.rarity==='common'||c.rarity==='uncommon')
          : f<9?game.ALL_CARDS.filter(c=>c.rarity==='uncommon'||c.rarity==='rare')
            : game.ALL_CARDS.filter(c=>c.rarity==='rare'));
      const rng=game.mulberry32(run.rngSeed+f*31); const p=pool.slice(); game.shuffleInPlace(p,rng);
      const off=[]; for(const c of p){ if(off.length>=3)break; if(!off.find(o=>o.id===c.id))off.push(c); }
      if(run.hp>=run.maxHp*0.3 && off.length){ run.deck.push({cardId:draft(off,run,polName).id,reversed:false}); }
      run.combat=run.combatPlayer=run.combatEnemy=null;
      floor.completed=true; run.gold+=10+Math.floor(f*1.5);
    } else if(node.type==='rest'){
      run.hp=Math.min(run.maxHp, run.hp+Math.floor(run.maxHp*0.4)); floor.completed=true;
    } else if(node.type==='treasure'){
      const u=game.RELICS.filter(r=>!run.relics.includes(r.id));
      if(u.length){ const rng=game.mulberry32(run.rngSeed+f*199); game.shuffleInPlace(u,rng); run.relics.push(u[0].id);} else run.gold+=30;
      floor.completed=true;
    } else if(node.type==='event'){
      const rng=game.mulberry32(run.rngSeed+f*433);
      if(rng()<0.6) run.hp=Math.min(run.maxHp,run.hp+10);
      else { run.hp=Math.max(1,run.hp-6);
        const pl=game.ALL_CARDS.filter(c=>c.rarity==='uncommon'&&c.suit!=='major');
        run.deck.push({cardId:pl[Math.floor(rng()*pl.length)].id,reversed:false}); }
      floor.completed=true;
    }
  }
  const won = run.path[14].completed && run.hp>0;
  return { won, floor: run.path.findIndex(f=>!f.completed), endHp: run.hp,
           deckSize: run.deck.length, stat };
}

function simCombat(policy, stat){
  const run=game.state.run;
  let lim=80;
  while(lim-->0){
    if(run.combatEnemy.hp<=0) return true;
    if(run.combatPlayer.hp<=0) return false;
    const ctx={ player:run.combatPlayer, enemy:run.combatEnemy, combat:run.combat, run };
    const intent=ctx.enemy.intent;
    const inc = intent&&intent.type==='attack' ? intent.value*(intent.count||1) : 0;
    const needsBlock = inc > ctx.player.block;
    const before = { ember:(ctx.enemy.debuffs.burn||0), dbf:Object.keys(ctx.enemy.debuffs||{}).length,
                     blk:ctx.player.block, heal:(ctx.combat.healedThisCombat||0) };
    const idx = policy.pick(ctx, needsBlock);
    if(idx===-1){ try{ game.endTurn(); stat.turns++; }catch(e){ return false; } continue; }
    const played = CB[ctx.player.hand[idx].cardId];
    try{ game.playCard(idx); }catch(e){ return false; }
    const R=roles(played);
    if(R.emberPay  && before.ember>0) stat.fired.ember++;
    if(R.debuffPay && before.dbf>0)   stat.fired.debuff++;
    if(R.blockScale&& before.blk>=8)  stat.fired.block++;
    if(R.healBridge&& before.heal>=12)stat.fired.heal++;
    if(run.combat.pendingChoice) run.combat.pendingChoice=null;
  }
  return run.combatEnemy.hp<=0;
}

/* ============================ RUN THE MATRIX ============================ */
const PATRONS=['magician','priestess','empress','emperor'];
const POLS=['masher','chainer','comboist','turtle'];
const SEEDS = parseInt(process.env.SEEDS||'40',10);

const M={}; // M[patron][pol] = aggregate
for(const pt of PATRONS){ M[pt]={};
  for(const po of POLS){
    const a={ w:0,n:SEEDS,floors:[],endHp:0,turns:0,combats:0,hpLost:0,
              cut:{strong:0,faint:0,silent:0,tower:0}, fired:{ember:0,debuff:0,block:0,heal:0}, deck:0 };
    for(let s=0;s<SEEDS;s++){
      const r=simRun(`x-${pt}-${po}-${s}`, pt, po);
      if(r.won) a.w++;
      a.floors.push(r.won?15:r.floor);
      a.endHp+=r.endHp; a.deck+=r.deckSize;
      a.turns+=r.stat.turns; a.combats+=r.stat.combats; a.hpLost+=r.stat.hpLostInCombat;
      for(const k in a.cut)a.cut[k]+=r.stat.cut[k];
      for(const k in a.fired)a.fired[k]+=r.stat.fired[k];
    }
    M[pt][po]=a;
  }
}
const pct=(x,n)=>(100*x/n).toFixed(0)+'%';
const med=(arr)=>{ const s=arr.slice().sort((a,b)=>a-b); return s[Math.floor(s.length/2)]; };
const avg=(x,n)=>(x/n).toFixed(1);

console.log(`\n================  TAROT RUN — ARCHETYPE STRESS  (${SEEDS} seeds/cell)  ================`);
console.log(`NOTE: win% is a SHAPE signal, not a target. Read the deltas, not the digits.\n`);

console.log(`--- 1. SURVIVAL MATRIX  (win% · median death floor /15) ---`);
console.log(`Patron      | masher        | chainer       | comboist      | turtle`);
for(const pt of PATRONS){
  const row=POLS.map(po=>{ const a=M[pt][po]; return `${pct(a.w,a.n).padStart(4)} f${String(med(a.floors)).padStart(2)}`; });
  console.log(`${pt.padEnd(11)} | ${row.join('   | ')}`);
}

console.log(`\n--- 2. DOES SKILL PAY?  (comboist − masher win%, per Patron) ---`);
for(const pt of PATRONS){
  const c=M[pt].comboist, m=M[pt].masher;
  const d=(100*(c.w/c.n - m.w/m.n)).toFixed(0);
  console.log(`  ${pt.padEnd(10)} comboist ${pct(c.w,c.n)} vs masher ${pct(m.w,m.n)}  →  ${d>0?'+':''}${d} pts`);
}

console.log(`\n--- 3. PATRON SPREAD  (comboist win% range = balance) ---`);
{ const v=PATRONS.map(pt=>100*M[pt].comboist.w/M[pt].comboist.n);
  console.log(`  low ${Math.min(...v).toFixed(0)}%  high ${Math.max(...v).toFixed(0)}%  spread ${(Math.max(...v)-Math.min(...v)).toFixed(0)} pts`);
  PATRONS.forEach(pt=>console.log(`    ${pt.padEnd(10)} ${pct(M[pt].comboist.w,SEEDS)}`)); }

console.log(`\n--- 4. RUN SHAPE (comboist): is there a curve or a cliff? ---`);
for(const pt of PATRONS){
  const a=M[pt].comboist; const h={};
  a.floors.forEach(f=>h[f]=(h[f]||0)+1);
  let bar=''; for(let f=0;f<=15;f++){ if(h[f]) bar+=` f${f}:${h[f]}`; }
  console.log(`  ${pt.padEnd(10)} deaths/wins by floor →${bar}`);
}

console.log(`\n--- 5. RETENTION PROXIES (comboist, avg/run) ---`);
for(const pt of PATRONS){
  const a=M[pt].comboist;
  console.log(`  ${pt.padEnd(10)} turns ${avg(a.turns,a.n)}  fights ${avg(a.combats,a.n)}  HP-lost/fight ${avg(a.hpLost,a.combats)}  endHP ${avg(a.endHp,a.n)}  deck ${avg(a.deck,a.n)}`);
}

console.log(`\n--- 6. IS THE ENGINE ACTUALLY REACHABLE? (comboist, total fires across ${SEEDS*4} runs) ---`);
{ let e=0,d=0,b=0,h=0,co=0;
  for(const pt of PATRONS){ const a=M[pt].comboist; e+=a.fired.ember;d+=a.fired.debuff;b+=a.fired.block;h+=a.fired.heal;co+=a.combats; }
  console.log(`  Ember detonations: ${e}   Debuff payoffs: ${d}   Block→fist: ${b}   Heal→damage: ${h}   (over ${co} fights)`);
  console.log(`  → engine fires ${((e+d+b+h)/co).toFixed(2)}× per fight under skilled play`); }

console.log(`\n--- 7. THE CUT (B10) outcome mix actually rolled ---`);
for(const po of POLS){
  let s=0,f=0,si=0,t=0,n=0;
  for(const pt of PATRONS){ const a=M[pt][po]; s+=a.cut.strong;f+=a.cut.faint;si+=a.cut.silent;t+=a.cut.tower;n+=a.combats; }
  console.log(`  ${po.padEnd(9)} Sun ${pct(s,n)}  faint ${pct(f,n)}  silent ${pct(si,n)}  Tower ${pct(t,n)}`);
}
console.log(`\n(Interpretation + recommendations are printed by the wrapper / given in chat —`);
console.log(` nothing here is auto-applied. Tune by the user's felt playtest, not these digits.)\n`);
