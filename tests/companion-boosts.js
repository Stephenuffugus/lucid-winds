// Headless companion-boost test harness.
// Loads the LW_Comp script block from index.html and runs every boost
// through peek / use / observeWin under solo + multiplayer conditions,
// asserting the documented behaviour in docs/COMPANION_BOOSTS_SPEC.md.
//
// Runs clean: node tests/companion-boosts.js
// Exits 1 if any assertion fails.
'use strict';
var fs = require('fs');
var vm = require('vm');

var FAILS = [];
function assert(cond, msg){
  if(!cond){FAILS.push(msg);console.log('  ❌ '+msg);}
  else console.log('  ✅ '+msg);
}

// Load LW_Comp IIFE by slicing it out of index.html.
var html = fs.readFileSync('index.html', 'utf8');
var re = /<!-- ═══ COMPANION BOOST SYSTEM[\s\S]*?<script>([\s\S]*?)<\/script>/;
var m = html.match(re);
if(!m){console.log('Could not extract LW_Comp block from index.html');process.exit(2);}
var src = m[1];

function makeCtx(){
  var lsStore = {};
  var ctx = {
    console: {log:function(){}, warn:function(){}, error:function(){}},
    document: {createElement:function(){return {};}, getElementById:function(){return null;}, head:{appendChild:function(){}}},
    localStorage: {
      getItem:function(k){return lsStore[k]==null?null:lsStore[k];},
      setItem:function(k,v){lsStore[k]=String(v);},
      removeItem:function(k){delete lsStore[k];}
    },
    window: null,
    _LW_inMultiplayer: false
  };
  ctx.window = ctx;
  // Stub toast so use() doesn't throw.
  ctx.window._toast = function(){};
  vm.createContext(ctx);
  vm.runInContext(src, ctx, {filename:'LW_Comp'});
  return ctx;
}

function equip(ctx, idx){
  var names = {32:'The Toad', 33:'The Phoenix', 34:'Baby Mammoth', 35:'Raccoon', 36:'Great Blue Heron', 37:'Garden Spider', 38:'The Beholder'};
  ctx.localStorage.setItem('pw_active_companion', JSON.stringify({companion:idx, name:names[idx]}));
}

function setFriendship(ctx, slug, xp){
  var f = {};
  var raw = ctx.localStorage.getItem('lw_companion_friendship');
  if(raw) try{f=JSON.parse(raw);}catch(e){}
  f[slug] = {xp:xp};
  ctx.localStorage.setItem('lw_companion_friendship', JSON.stringify(f));
}

// ═══ TESTS ═══════════════════════════════════════════════════════════

console.log('\n━━━ 1. No companion equipped → peek/use return null ━━━');
(function(){
  var ctx = makeCtx();
  assert(ctx.window.LW_Comp.peek('numbergarden') === null, 'peek returns null');
  assert(ctx.window.LW_Comp.use('numbergarden') === null, 'use returns null');
})();

console.log('\n━━━ 2. Toad at each friendship level ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 32);
  setFriendship(ctx, 'toad', 0);
  assert(ctx.window.LW_Comp.peek('numbergarden').value === 10, 'Lv 1 → +10s');
  setFriendship(ctx, 'toad', 15);
  assert(ctx.window.LW_Comp.peek('numbergarden').value === 15, 'Lv 2 at 15 XP → +15s');
  setFriendship(ctx, 'toad', 40);
  assert(ctx.window.LW_Comp.peek('numbergarden').value === 25, 'Lv 3 at 40 XP → +25s');
  assert(ctx.window.LW_Comp.peek('mines') === null, 'Toad does not fire in mines');
})();

console.log('\n━━━ 3. Phoenix at each level + Challenge-only plumbing ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 33);
  setFriendship(ctx, 'phoenix', 0);
  assert(ctx.window.LW_Comp.peek('stonegarden').value === 1, 'Lv 1 → 1 revive');
  setFriendship(ctx, 'phoenix', 15);
  assert(ctx.window.LW_Comp.peek('stonegarden').value === 2, 'Lv 2 → 2 revives');
  setFriendship(ctx, 'phoenix', 40);
  assert(ctx.window.LW_Comp.peek('stonegarden').value === 3, 'Lv 3 → 3 revives (+ restore)');
})();

console.log('\n━━━ 4. Mammoth stability values ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 34);
  setFriendship(ctx, 'mammoth', 0);
  assert(Math.abs(ctx.window.LW_Comp.peek('stonegarden').value - 0.15) < 1e-9, 'Lv 1 → 0.15');
  setFriendship(ctx, 'mammoth', 15);
  assert(Math.abs(ctx.window.LW_Comp.peek('stonegarden').value - 0.25) < 1e-9, 'Lv 2 → 0.25');
  setFriendship(ctx, 'mammoth', 40);
  assert(Math.abs(ctx.window.LW_Comp.peek('stonegarden').value - 0.40) < 1e-9, 'Lv 3 → 0.40');
})();

console.log('\n━━━ 5. Beholder safe-cell counts ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 38);
  setFriendship(ctx, 'beholder', 0);
  assert(ctx.window.LW_Comp.peek('mines').value === 3, 'Lv 1 → 3 cells');
  setFriendship(ctx, 'beholder', 15);
  assert(ctx.window.LW_Comp.peek('mines').value === 5, 'Lv 2 → 5 cells');
  setFriendship(ctx, 'beholder', 40);
  assert(ctx.window.LW_Comp.peek('mines').value === 7, 'Lv 3 → 7 cells');
  assert(ctx.window.LW_Comp.peek('stonegarden') === null, 'Beholder does not fire in stonegarden');
})();

console.log('\n━━━ 6. One-use-per-session lock ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 38);
  setFriendship(ctx, 'beholder', 0);
  var first = ctx.window.LW_Comp.use('mines');
  assert(first === 3, 'first use returns 3');
  var p1 = ctx.window.LW_Comp.peek('mines');
  assert(p1.used === true, 'peek.used flag set after first use');
  // use() again — returns value but NO XP gain
  var friends1 = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship'));
  var second = ctx.window.LW_Comp.use('mines');
  var friends2 = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship'));
  assert(second === 3, 'repeat use returns value');
  assert(friends1.beholder.xp === friends2.beholder.xp, 'repeat use does NOT grant extra XP');
})();

console.log('\n━━━ 7. Session boundary (gameId change) resets used-flag ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 38);
  setFriendship(ctx, 'beholder', 0);
  ctx.window.LW_Comp.use('mines');
  assert(ctx.window.LW_Comp.peek('mines').used === true, 'mines flag set');
  // Switch "games" — peek for a different id resets used state
  ctx.window.LW_Comp.peek('stonegarden');
  var back = ctx.window.LW_Comp.peek('mines');
  assert(back.used === false, 'returning to mines resets used-flag (fresh session)');
})();

console.log('\n━━━ 8. MULTIPLAYER HARD-GATE ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 32); // Toad
  setFriendship(ctx, 'toad', 0);
  ctx.window._LW_inMultiplayer = true;
  assert(ctx.window.LW_Comp.peek('numbergarden') === null, 'peek blocked in multiplayer');
  assert(ctx.window.LW_Comp.use('numbergarden') === null, 'use blocked in multiplayer');
  var f1 = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship')||'{}');
  ctx.window.LW_Comp.observeWin('numbergarden');
  var f2 = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship')||'{}');
  assert(JSON.stringify(f1)===JSON.stringify(f2), 'observeWin grants NO XP in multiplayer');
  // Clear flag → boosts return
  ctx.window._LW_inMultiplayer = false;
  assert(ctx.window.LW_Comp.peek('numbergarden') !== null, 'peek restored after flag clears');
})();

console.log('\n━━━ 9. observeWin grants XP outside boost-matched games ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 32); // Toad
  setFriendship(ctx, 'toad', 0);
  // Win an UNRELATED game — XP should grant
  ctx.window.LW_Comp.observeWin('chess');
  var f = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship'));
  assert(f.toad.xp === 1, 'observeWin on unrelated game grants +1 XP');
  // Win a boost-matched game — should NOT double-dip via observeWin
  var start = f.toad.xp;
  ctx.window.LW_Comp.observeWin('numbergarden');
  f = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship'));
  assert(f.toad.xp === start, 'observeWin on boost-matched game SKIPS (use() is the canonical grant)');
})();

console.log('\n━━━ 10. Level-up at thresholds 15 and 40 ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 32);
  setFriendship(ctx, 'toad', 14);
  assert(ctx.window.LW_Comp.friendship('toad').lv === 1, '14 XP → Lv 1');
  setFriendship(ctx, 'toad', 15);
  assert(ctx.window.LW_Comp.friendship('toad').lv === 2, '15 XP → Lv 2');
  setFriendship(ctx, 'toad', 39);
  assert(ctx.window.LW_Comp.friendship('toad').lv === 2, '39 XP → Lv 2');
  setFriendship(ctx, 'toad', 40);
  assert(ctx.window.LW_Comp.friendship('toad').lv === 3, '40 XP → Lv 3');
  setFriendship(ctx, 'toad', 9999);
  assert(ctx.window.LW_Comp.friendship('toad').lv === 3, 'past 40 → still Lv 3 (max)');
})();

console.log('\n━━━ 11. Unknown companion idx returns null ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 5); // arbitrary non-boost companion
  assert(ctx.window.LW_Comp.active() === null, 'idx 5 → no boost slug');
  assert(ctx.window.LW_Comp.peek('mines') === null, 'no boost fires for unmapped idx');
})();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if(FAILS.length === 0){
  console.log('ALL 11 SUITES · ALL ASSERTIONS PASS ✓');
  process.exit(0);
} else {
  console.log('FAILED: '+FAILS.length);
  FAILS.forEach(function(f){console.log('  '+f);});
  process.exit(1);
}
