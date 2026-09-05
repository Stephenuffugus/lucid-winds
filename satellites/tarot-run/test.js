// Tarot Run mechanics test — runs combat headless to verify code paths.
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

// Wrap code to capture internals (functions are already top-level scoped, so we just expose what we need)
const exposed = `
  return {
    ALL_CARDS, CARD_BY_ID, MAJOR_CARDS, MINOR_CARDS, ENEMIES, ENEMY_BY_ID, RELICS,
    freshRun, startCombat, endTurn, playCard, advanceFloor, generatePath,
    dealDamage, dealPierce, gainBlock, healPlayer, drawCards,
    mulberry32, strHash, shuffleInPlace,
    state,
    triggerAspect, resolveEnemyIntent
  };
`;

const game = eval(`(function(){${domStub}${code}; ${exposed} })()`);

// Test 1: basic structural checks
console.log('=== STRUCTURAL ===');
/* ⛔ 78 is the TAROT DECK, and ALL_CARDS deliberately includes CURSES on top of
   it, so this line printed "79 (expect 78)" on every run and was not a bug. A
   mismatch that is always there teaches people to ignore the one that matters.
   The deck itself is checked exactly, below: 22 major + 56 minor. */
const _expectCards = 78 + game.ALL_CARDS.filter(c => c.suit === 'curse').length;
console.log('Total cards:', game.ALL_CARDS.length, '(expect ' + _expectCards + ' = 78 tarot + curses)',
  game.ALL_CARDS.length === _expectCards ? 'OK' : '*** MISMATCH ***');
console.log('  Major:', game.MAJOR_CARDS.length, '(expect 22)');
console.log('  Minor:', game.MINOR_CARDS.length, '(expect 56)');
console.log('  Distinct ids:', new Set(game.ALL_CARDS.map(c=>c.id)).size);

const suitCounts = {};
game.ALL_CARDS.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit]||0)+1; });
console.log('Suit distribution:', suitCounts);

const rarityCounts = {};
game.ALL_CARDS.forEach(c => { rarityCounts[c.rarity] = (rarityCounts[c.rarity]||0)+1; });
console.log('Rarity distribution:', rarityCounts);

console.log('Enemies:', game.ENEMIES.length, ' Relics:', game.RELICS.length);

// Test 2: freshRun & generatePath
console.log('\n=== RUN SETUP ===');
const run = game.freshRun('test-seed');
console.log('Starter deck size:', run.deck.length);
console.log('Starter cards:', run.deck.map(c => c.cardId).join(', '));
console.log('Path floors:', run.path.length, '(expect 15)');
console.log('Floor 14 is boss?', run.path[14].nodes[0].type === 'boss');
console.log('Starting relic:', run.relics);

// Test 3: try a combat
console.log('\n=== COMBAT FLOW ===');
game.state.run = run;
run.floor = 0;
run.path[0].chosenNode = 0;
run.currentNode = run.path[0].nodes[0];
const combatNode = run.path[0].nodes[0];
game.startCombat(combatNode.enemyId);
console.log('After startCombat:');
console.log('  Combat exists?', !!run.combat);
console.log('  Enemy:', game.ENEMY_BY_ID[combatNode.enemyId].name, 'HP', run.combatEnemy.hp);
console.log('  Hand size:', run.combatPlayer.hand.length);
console.log('  Draw pile size:', run.combatPlayer.draw.length);
console.log('  Energy:', run.combatPlayer.energy);
console.log('  Prophecy:', run.combat.reading.join(' → '), '(progress', run.combat.prophecyProgress + ')');

// Play the first playable card
console.log('\n=== PLAY CARDS ===');
let turn = 0;
while(run.combatEnemy.hp > 0 && run.combatPlayer.hp > 0 && turn < 30){
  // try to play each card in hand
  let played = false;
  for(let i = run.combatPlayer.hand.length - 1; i >= 0; i--){
    const entry = run.combatPlayer.hand[i];
    const card = game.CARD_BY_ID[entry.cardId];
    if(run.combatPlayer.energy >= card.cost){
      const cardName = card.name;
      const beforeEnemyHp = run.combatEnemy.hp;
      const beforeBlock = run.combatPlayer.block;
      try {
        game.playCard(i);
        played = true;
        const dmgDone = beforeEnemyHp - run.combatEnemy.hp;
        const blockGained = run.combatPlayer.block - beforeBlock;
        console.log(`  T${run.combat.turn} play ${cardName} (cost ${card.cost}) → dmg ${dmgDone}, block ${blockGained}, energy ${run.combatPlayer.energy}, hp ${run.combatPlayer.hp}, enemyHp ${run.combatEnemy.hp}`);
        if(run.combatEnemy.hp <= 0) { console.log('  >> ENEMY DEFEATED'); break; }
      } catch(e){
        console.log('  ! ERROR playing ' + cardName + ': ' + e.message);
        played = false;
        break;
      }
      break;
    }
  }
  if(!played){
    // end turn
    try {
      console.log(`  T${run.combat.turn} END TURN. hp=${run.combatPlayer.hp} enemyHp=${run.combatEnemy.hp} (intent was: ${run.combatEnemy.intent ? run.combatEnemy.intent.desc : ', '})`);
      game.endTurn();
    } catch(e){
      console.log('  ! ERROR ending turn: ' + e.message);
      break;
    }
    turn++;
  }
  if(run.combatEnemy.hp <= 0) break;
  if(run.combatPlayer.hp <= 0){ console.log('  >> PLAYER DEFEATED'); break; }
}
console.log('Combat ended. Player hp:', run.combatPlayer.hp, 'Enemy hp:', run.combatEnemy.hp);

console.log('\nDONE');
