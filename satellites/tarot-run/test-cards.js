// Stress test: try playing every single card in isolation. Verify no card crashes.
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
const exposed = `return { ALL_CARDS, CARD_BY_ID, ENEMIES, ENEMY_BY_ID, freshRun, startCombat, state, mulberry32 };`;
const game = eval(`(function(){${domStub}${code}; ${exposed} })()`);

// For each card, place it in a controlled hand and play() it.
const errors = [];
const damages = [];

game.ALL_CARDS.forEach(card => {
  // build a minimal ctx
  game.state.run = game.freshRun('stress-' + card.id);
  game.startCombat('crown'); // big boss to absorb damage
  const ctx = { player: game.state.run.combatPlayer, enemy: game.state.run.combatEnemy, combat: game.state.run.combat, run: game.state.run };
  // give it 10 energy and 10 cards in hand so most effects work
  ctx.player.energy = 10;
  // Add some cards for the Devil/Death/Tower etc effects that ref hand
  ctx.player.hand.push({ cardId:'wands-1', reversed:false });
  ctx.player.hand.push({ cardId:'cups-1', reversed:false });
  ctx.player.hand.push({ cardId:'pents-1', reversed:false });
  // Make sure discard has at least one card for Judgement
  ctx.player.discard.push({ cardId:'swords-1', reversed:false });
  // Now try card.play
  const beforeEnemyHp = ctx.enemy.hp;
  const beforePlayerHp = ctx.player.hp;
  try {
    const result = card.play(ctx);
    const dmg = beforeEnemyHp - ctx.enemy.hp;
    damages.push({ id: card.id, name: card.name, dmg, cost: card.cost, hpDelta: ctx.player.hp - beforePlayerHp, result });
  } catch(e){
    errors.push({ card: card.name, error: e.message });
  }
});

// B24 — the Reversed (shadow) face is now a real effect: exercise every
// reversedPlay so the 56 new effects can't silently throw.
const revErrors = [];
let revCount = 0;
game.ALL_CARDS.forEach(card => {
  if(typeof card.reversedPlay !== 'function') return;
  revCount++;
  game.state.run = game.freshRun('rev-' + card.id);
  game.startCombat('crown');
  const ctx = { player: game.state.run.combatPlayer, enemy: game.state.run.combatEnemy, combat: game.state.run.combat, run: game.state.run };
  ctx.player.energy = 10;
  ctx.player.hand.push({ cardId:'wands-1', reversed:false });
  ctx.player.discard.push({ cardId:'swords-1', reversed:false });
  // seed combat-relative state so heal→/debuff→/block→ scalers have inputs
  ctx.combat.healedThisCombat = 12;
  ctx.player.block = 12;
  ctx.player.buffs.ward = 8;
  ctx.enemy.debuffs.burn = 3; ctx.enemy.debuffs.weak = 1; ctx.enemy.debuffs.vulnerable = 1;
  try {
    const r = card.reversedPlay(ctx);
    if(r === undefined || r === null) revErrors.push({ card: card.name + ' (rev)', error: 'returned nothing' });
  } catch(e){
    revErrors.push({ card: card.name + ' (rev)', error: e.message });
  }
});

console.log(`Cards tested: ${game.ALL_CARDS.length}  (+${revCount} reversed faces)`);
console.log(`Errors: ${errors.length + revErrors.length}`);
if(errors.length){ errors.forEach(e => console.log('  ✗ ' + e.card + ': ' + e.error)); }
if(revErrors.length){ revErrors.forEach(e => console.log('  ✗ ' + e.card + ': ' + e.error)); }

// Damage stats by suit
const suitDmg = {};
damages.forEach(d => {
  const card = game.CARD_BY_ID[d.id];
  suitDmg[card.suit] = suitDmg[card.suit] || [];
  suitDmg[card.suit].push(d);
});
console.log('\n=== DAMAGE PROFILE ===');
for(const [suit, list] of Object.entries(suitDmg)){
  const dmgs = list.filter(d=>d.dmg>0).map(d=>d.dmg);
  const max = dmgs.length ? Math.max(...dmgs) : 0;
  const avg = dmgs.length ? (dmgs.reduce((a,b)=>a+b,0)/dmgs.length).toFixed(1) : 0;
  console.log(`  ${suit}: ${list.length} cards, ${dmgs.length} deal damage, avg dmg=${avg}, max=${max}`);
}

console.log('\n=== TOP 10 DAMAGE CARDS ===');
damages.sort((a,b) => b.dmg - a.dmg);
damages.slice(0, 10).forEach(d => console.log(`  ${d.name.padEnd(28)} cost=${d.cost} dmg=${d.dmg}`));

console.log('\nDONE.');
