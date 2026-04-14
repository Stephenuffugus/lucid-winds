// Headless test for the cosmetic-only LW_Comp friendship system.
// Replaces tests/companion-boosts.js (kept as historical reference).
//
//   node tests/companion-friendship.js
'use strict';
var fs = require('fs');
var vm = require('vm');

var FAILS = [];
function assert(cond, msg){
  if(!cond){FAILS.push(msg);console.log('  ❌ '+msg);}
  else console.log('  ✅ '+msg);
}

var html = fs.readFileSync('index.html', 'utf8');
var re = /<!-- ═══ COMPANION FRIENDSHIP SYSTEM[\s\S]*?<script>([\s\S]*?)<\/script>/;
var m = html.match(re);
if(!m){console.log('Could not extract LW_Comp block');process.exit(2);}
var src = m[1];

function makeCtx(){
  var lsStore = {};
  var ctx = {
    console:{log:function(){},warn:function(){},error:function(){}},
    document:{createElement:function(){return {};},getElementById:function(){return null;},head:{appendChild:function(){}}},
    localStorage:{
      getItem:function(k){return lsStore[k]==null?null:lsStore[k];},
      setItem:function(k,v){lsStore[k]=String(v);},
      removeItem:function(k){delete lsStore[k];}
    },
    window:null,
    _LW_inMultiplayer:false
  };
  ctx.window=ctx;
  ctx.window._toast=function(){};
  vm.createContext(ctx);
  vm.runInContext(src, ctx, {filename:'LW_Comp'});
  return ctx;
}

function equip(ctx, idx){
  ctx.localStorage.setItem('pw_active_companion', JSON.stringify({companion:idx}));
}

console.log('\n━━━ 1. Cosmetic-only — peek/use removed effects ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 32);
  assert(ctx.window.LW_Comp.peek('numbergarden') === null, 'peek returns null (no boost system)');
  assert(ctx.window.LW_Comp.use('numbergarden') === null, 'use returns null (no boost system)');
})();

console.log('\n━━━ 2. observeWin grants +1 XP per game won ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 36); // Heron
  assert(ctx.window.LW_Comp.friendship('heron').xp === 0, 'starts at 0');
  ctx.window.LW_Comp.observeWin('mines');
  assert(ctx.window.LW_Comp.friendship('heron').xp === 1, 'after 1 win → 1 XP');
  ctx.window.LW_Comp.observeWin('chess');
  ctx.window.LW_Comp.observeWin('sudoku');
  assert(ctx.window.LW_Comp.friendship('heron').xp === 3, 'after 3 wins → 3 XP');
})();

console.log('\n━━━ 3. Title progression Cub → Bonded → Beloved ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 32);
  // Bypass: write XP directly
  function setXP(xp){
    var f={};f.toad={xp:xp};
    ctx.localStorage.setItem('lw_companion_friendship',JSON.stringify(f));
  }
  setXP(0);
  assert(ctx.window.LW_Comp.friendship('toad').title === 'Cub', '0 XP → Cub');
  setXP(14);
  assert(ctx.window.LW_Comp.friendship('toad').title === 'Cub', '14 XP → Cub');
  setXP(15);
  assert(ctx.window.LW_Comp.friendship('toad').title === 'Bonded', '15 XP → Bonded');
  setXP(39);
  assert(ctx.window.LW_Comp.friendship('toad').title === 'Bonded', '39 XP → Bonded');
  setXP(40);
  assert(ctx.window.LW_Comp.friendship('toad').title === 'Beloved', '40 XP → Beloved');
  setXP(9999);
  assert(ctx.window.LW_Comp.friendship('toad').title === 'Beloved', 'past 40 → still Beloved (max)');
})();

console.log('\n━━━ 4. titleFor() helper ━━━');
(function(){
  var ctx = makeCtx();
  assert(ctx.window.LW_Comp.titleFor(1) === 'Cub', 'lv 1 → Cub');
  assert(ctx.window.LW_Comp.titleFor(2) === 'Bonded', 'lv 2 → Bonded');
  assert(ctx.window.LW_Comp.titleFor(3) === 'Beloved', 'lv 3 → Beloved');
})();

console.log('\n━━━ 5. Multiplayer guard blocks XP ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 33); // Phoenix
  ctx.window._LW_inMultiplayer = true;
  ctx.window.LW_Comp.observeWin('pollen');
  assert(ctx.window.LW_Comp.friendship('phoenix').xp === 0, 'no XP gained in multiplayer');
  ctx.window._LW_inMultiplayer = false;
  ctx.window.LW_Comp.observeWin('pollen');
  assert(ctx.window.LW_Comp.friendship('phoenix').xp === 1, 'XP resumes when multiplayer flag clears');
})();

console.log('\n━━━ 6. No companion equipped → no XP, no error ━━━');
(function(){
  var ctx = makeCtx();
  ctx.window.LW_Comp.observeWin('mines'); // no equip — should silently no-op
  assert(true, 'observeWin without equip does not throw');
  assert(ctx.window.LW_Comp.active() === null, 'active() returns null');
})();

console.log('\n━━━ 7. Unknown companion idx returns null slug ━━━');
(function(){
  var ctx = makeCtx();
  equip(ctx, 5); // not in IDX map
  assert(ctx.window.LW_Comp.active() === null, 'idx 5 → null slug');
  ctx.window.LW_Comp.observeWin('mines');
  // Should not crash, no friendship recorded for the unmapped idx
  var stored = JSON.parse(ctx.localStorage.getItem('lw_companion_friendship')||'{}');
  assert(Object.keys(stored).length === 0, 'no friendship written for unmapped companion');
})();

console.log('\n━━━ 8. registry() lists all 7 companions with friendship state ━━━');
(function(){
  var ctx = makeCtx();
  var reg = ctx.window.LW_Comp.registry();
  assert(reg.length === 7, 'registry has 7 entries');
  reg.forEach(function(r){
    assert(typeof r.slug === 'string' && typeof r.name === 'string' && typeof r.icon === 'string', r.slug + ' has slug+name+icon');
    assert(typeof r.title === 'string', r.slug + ' has title');
  });
})();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if(FAILS.length === 0){
  console.log('ALL 8 SUITES PASS ✓ (cosmetic-only friendship system verified)');
  process.exit(0);
} else {
  console.log('FAILED: '+FAILS.length);
  FAILS.forEach(function(f){console.log('  '+f);});
  process.exit(1);
}
