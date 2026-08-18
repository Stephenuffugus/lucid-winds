

// Test harness: extract game logic from index.html and stress it
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
// The page has an embed-protocol <script> block before the game logic; select
// the block that actually defines the game (was the first block before the
// embed shim was added), so extraction is stable regardless of block order.
const code = [...html.matchAll(/<script>([\s\S]+?)<\/script>/g)]
  .map(m => m[1]).find(b => /\bRUNES\s*=/.test(b));

// Stub the DOM bits we don't need so the code can execute in Node
const stubs = `
  const document = {
    getElementById: () => ({
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      getBoundingClientRect: () => ({ left:0, top:0, width:0, height:0, right:0, bottom:0 }),
      style: {},
      innerHTML: '',
      textContent: '',
      onclick: null, oncontextmenu: null, onmouseup: null,
      dataset: {},
      children: [],
      firstElementChild: { classList: { add: () => {} }, dataset: {}, onclick: null, oncontextmenu: null },
      querySelector: () => ({ innerHTML: '' }),
      querySelectorAll: () => [],
      offsetWidth: 0, offsetHeight: 0,
    }),
    querySelectorAll: () => [],
    createElement: () => ({
      className: '', innerHTML: '', textContent: '', style: {},
      classList: { add: () => {}, remove: () => {} }, dataset: {},
      onclick: null, oncontextmenu: null, firstElementChild: null,
      addEventListener: () => {}, remove: () => {},
      getBoundingClientRect: () => ({ left:0, top:0, width:0, height:0 }),
    }),
    body: { appendChild: () => {} },
  };
  const window = { addEventListener: () => {}, innerWidth: 400 };
  const localStorage = {
    _s: {},
    getItem(k){ return this._s[k] || null; },
    setItem(k,v){ this._s[k]=v; },
  };
  const navigator = { serviceWorker: null };
  const setTimeout = (fn)=>{}; // no-op so we don't run animations
  const clearTimeout = ()=>{};
  const confirm = () => true;
`;

const wrapped = `(function(){
  ${stubs}
  ${code}
  return { state, RUNES, ENEMIES, NAMED_COMBOS, resolveSpell, mulberry32, findComboName, startNewRun, cast, drawOne, beginEncounter, lockIntent, executeIntent, netEnemyDamage };
})();`;

const game = eval(wrapped);

console.log('=== SMOKE TEST: rune count and balance ===');
console.log('Total runes:', game.RUNES.length);
console.log('  Common:    ', game.RUNES.filter(r=>r.rarity==='common').length);
console.log('  Uncommon:  ', game.RUNES.filter(r=>r.rarity==='uncommon').length);
console.log('  Rare:      ', game.RUNES.filter(r=>r.rarity==='rare').length);
console.log('  Mythic:    ', game.RUNES.filter(r=>r.rarity==='mythic').length);
console.log('Starter:     ', game.RUNES.filter(r=>r.starter).length);
console.log('Enemies:     ', game.ENEMIES.length);
console.log('Named combos:', game.NAMED_COMBOS.length);

console.log('\n=== ELEMENT/SHAPE COVERAGE ===');
const elements = {}, shapes = {};
game.RUNES.forEach(r => {
  elements[r.element] = (elements[r.element]||0) + 1;
  shapes[r.shape] = (shapes[r.shape]||0) + 1;
});
console.log('Elements:', elements);
console.log('Shapes:  ', shapes);

// Now: simulate spells by directly building a fake state (skip render which needs DOM)
function simSpell(runeIds, options = {}) {
  game.state.run = {
    seed: 'test',
    rngSeed: 12345,
    encounterIdx: options.encounterIdx ?? 0,
    hp: options.hp || 30,
    maxHp: 30,
    deck: [],
    hand: options.hand || ['ember','drop','stone','gust','hollow'],
    discard: [],
    spell: [...runeIds, null, null, null].slice(0, 3),
    path: [{ enemyId: 'cinder' }],
    currentThreat: 1,
    enemyHp: 100,
    enemyMaxHp: 100,
  };
  if(options.favorite) game.state.meta.runeUseCount[options.favorite] = 100;
  return game.resolveSpell();
}

console.log('\n=== BASELINE: solo runes ===');
['ember','stone','quake','singularity'].forEach(id => {
  const r = simSpell([id]);
  console.log(`  ${id.padEnd(14)} -> dmg ${r ? r.damage : 'null'}`);
});

console.log('\n=== SYNERGY: 3x same element ===');
const r3fire = simSpell(['ember','ember','ember']);
console.log(`  3x Ember (Fire): ${r3fire.damage} (elementMult ${r3fire.elementMult}x, shapeMult ${r3fire.shapeMult}x)`);

const r3earth = simSpell(['stone','stone','stone']);
console.log(`  3x Stone (Earth/Burst): ${r3earth.damage} (elementMult ${r3earth.elementMult}x, shapeMult ${r3earth.shapeMult}x)`);

console.log('\n=== ECHO TEST ===');
const echo = simSpell(['stone','echo']);
console.log(`  Stone + Echo: ${echo.damage} (Stone base 3, Echo repeats Stone -> expect 6)`);

const echoTwice = simSpell(['stone','echo','echo']);
console.log(`  Stone + Echo + Echo: ${echoTwice.damage} (each Echo triggers left)`);

console.log('\n=== TWIN TEST ===');
const twin = simSpell(['stone','twin']);
console.log(`  Stone + Twin: ${twin.damage} (Twin gives slot 0 +2 repeats, so Stone fires 3x = 9 base)`);

console.log('\n=== SURGE TEST ===');
const surge = simSpell(['ember','surge','ember']);
console.log(`  Ember + Surge + Ember: ${surge.damage} (Surge +50% to both neighbors)`);

console.log('\n=== AURORA TEST (3 different elements) ===');
const aurora = simSpell(['ember','drop','aurora']);
console.log(`  Ember + Drop + Aurora (3 elements): ${aurora.damage} (5x multiplier expected)`);

console.log('\n=== SINGULARITY TEST (hand size mult) ===');
const sing = simSpell(['ember','singularity'], { hand: ['a','b','c','d','e','f','g','h'] });
console.log(`  Ember + Singularity, hand=8: ${sing.damage} (Ember 2 x 8 = 16 base)`);

console.log('\n=== RECURSION STACK TEST ===');
const r1 = simSpell(['ember','recursion']);
const r2 = simSpell(['recursion','ember','recursion']);
console.log(`  Ember + Recursion: ${r1.damage} (expect 2 * 2 = 4)`);
console.log(`  Recursion + Ember + Recursion: ${r2.damage} (expect 2 * 3 = 6)`);

console.log('\n=== OUROBOROS TEST ===');
const oboro = simSpell(['ember','ouroboros']);
console.log(`  Ember + Ouroboros: ${oboro.damage} (full spell re-casts once = doubled)`);

console.log('\n=== TRISKELION TEST ===');
const trisk = simSpell(['ember','ember','triskel']);
const trisk2 = simSpell(['tally','tally','triskel']);
console.log(`  3x same element (Fire, Fire, Triskel-Order): ${trisk.damage} (NOT all same element)`);
console.log(`  3x Order (Tally Tally Triskel): ${trisk2.damage} (all same! 3x mult)`);

console.log('\n=== TIDEWALL: scales with missing HP ===');
const tide = simSpell(['tidewall'], { hp: 5 });
console.log(`  Tidewall at 5/30 HP: ${tide.damage} (1 base + 25 missing = 26)`);

console.log('\n=== HUNT FOR BROKEN COMBOS ===');
// Try all 3-rune combinations of mythics + multipliers
const heavies = ['recursion','pandemonium','singularity','aurora','ouroboros','twin','triskel','wildfire','surge','beacon','echo','mirror'];
let max = { dmg: 0, combo: null };
const samples = [];
for(let i=0;i<heavies.length;i++){
  for(let j=0;j<heavies.length;j++){
    for(let k=0;k<heavies.length;k++){
      const combo = [heavies[i], heavies[j], heavies[k]];
      try {
        const r = simSpell(combo, { hand: Array(10).fill('ember') });
        if(r && r.damage > max.dmg){
          max = { dmg: r.damage, combo: combo.slice(), result: r };
        }
        if(r && r.damage > 50) samples.push({ combo: combo.join(' + '), dmg: r.damage });
      } catch(e) {
        // some combinations may throw — log them
        console.log('  ERROR:', combo.join('+'), '->', e.message.slice(0, 80));
      }
    }
  }
}
console.log('Highest damage combo found:', max.combo?.join(' + '), '=>', max.dmg);
console.log('Sample big hits:');
samples.sort((a,b)=>b.dmg-a.dmg).slice(0, 10).forEach(s => console.log('  ', s.dmg.toString().padStart(6), '|', s.combo));

console.log('\n=== ENEMY INTENT (Batch B): determinism + damage neutrality ===');
function intentSeq(seed, enemyId, turns){
  const enemy = game.ENEMIES.find(e=>e.id===enemyId);
  const run = { rngSeed:seed, encounterIdx:0, currentThreat:enemy.threat,
    enemyHp:9999, enemyMaxHp:9999, hp:1e9, maxHp:1e9, turnInEnc:0, intent:null,
    pendingUnleash:false, path:[{enemyId}], relics:[] };
  const seq=[]; let dmg=0;
  for(let i=0;i<turns;i++){
    game.lockIntent(run);
    seq.push(run.intent.kind[0]);
    const before = run.hp; game.executeIntent(run); dmg += (before - run.hp);
  }
  return { seq:seq.join(''), avg: dmg/turns, threat: enemy.threat };
}
let intentOK = true;
['fenmote','revenant','cinder','glasswyrm','sovereign'].forEach(id=>{
  const A = intentSeq(98765, id, 400);
  const B = intentSeq(98765, id, 400);
  const det = A.seq === B.seq;
  // attack, charge cycles, and mend all average to ~threat per turn (mend deals
  // full damage + heals), so a no-Sigil run takes ~the same total. Band: ±12%.
  const ratio = A.avg / A.threat;
  const neutral = ratio > 0.88 && ratio < 1.12;
  if(!det || !neutral) intentOK = false;
  console.log(`  ${id.padEnd(10)} threat=${A.threat} avgDmg/turn=${A.avg.toFixed(2)} (${(ratio*100).toFixed(0)}% of threat) det=${det?'PASS':'FAIL'} ${neutral?'':'⚠ off-band'}`);
});
console.log(intentOK ? '  ✓ intents deterministic & damage ≈ flat-threat baseline' : '  ✗ INTENT REGRESSION');

console.log('\n=== ENEMY ARMOR + PIERCE (Batch C1) ===');
function netVs(enemyId, raw, result){
  return game.netEnemyDamage({ path:[{enemyId}], encounterIdx:0 }, raw, result || {});
}
const armEnemy = game.ENEMIES.find(e=>e.armor); // Brass Revenant, armor 3
let armorOK = true;
const checks = [
  ['raw 20 vs armor',        netVs(armEnemy.id, 20, {}),                 20 - armEnemy.armor],
  ['raw 20 trueDamage',      netVs(armEnemy.id, 20, {trueDamage:true}),  20],
  ['raw 20 ignoreWard',      netVs(armEnemy.id, 20, {ignoreWard:true}),  20],
  ['raw 2 fully blocked',    netVs(armEnemy.id, 2, {}),                  0],
  ['unarmored (cinder) 20',  netVs('cinder', 20, {}),                    20],
];
console.log(`  armored foe: ${armEnemy.name} armor=${armEnemy.armor}`);
checks.forEach(([label, got, want])=>{
  if(got !== want) armorOK = false;
  console.log(`  ${label.padEnd(22)} ${got} (expect ${want}) ${got===want?'':'⚠'}`);
});
console.log(armorOK ? '  ✓ armor shaves flat; pierce (trueDamage/ignoreWard) bypasses' : '  ✗ ARMOR REGRESSION');

console.log('\n=== ENEMY HP CHECK ===');
game.ENEMIES.forEach(e => console.log(`  T${e.tier} ${e.name.padEnd(18)} HP:${e.hp} Threat:${e.threat} ${e.boss?'[BOSS]':''}`));

console.log('\n=== COMBO NAME DETECTION ===');
[
  ['ember','ember','ember'],
  ['echo','echo','ember'],
  ['echo','mirror','ember'],
  ['singularity','ember','ember'],
  ['ember','drop','stone'],
  ['ember','drop','aurora'],
].forEach(c => {
  const runeObjs = c.map(id => game.RUNES.find(r=>r.id===id));
  const match = game.findComboName(runeObjs);
  console.log(`  ${c.join(' + ').padEnd(34)} -> ${match ? match.name : '(no name)'}`);
});

console.log('\nDONE');
