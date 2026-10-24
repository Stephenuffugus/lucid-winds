// which lists each chunk range fills (real builder): planks and pads come only with the level (never in endlessExtra)
var W=require('../e2/world.js'), ctx=W.ctx, vm=W.vm;
['endlessLvl','endlessExtra','endlessChunk','bandBack'].forEach(function(n){ vm.runInContext(W.grab(n), ctx); });
vm.runInContext('var END_LVL_PIN=null, ENDLESS_LVL_MAX=7;', ctx);
[99,7,31,5,77].forEach(function(seed){ var Wd={ ff:true, len:1e9, SW:9.2, floorY:-1e9, end:{ fwi:seed%8, salt:seed, live:{}, k:-1 } };
  ctx.ECH_LISTS.forEach(function(n){ Wd[n]=[]; }); ctx.G_FFSALT=seed; ctx.G={ world:Wd };
  for(var k=0;k<10;k++)vm.runInContext('endlessChunk(__W,'+k+')', Object.assign(ctx,{__W:Wd}));
  var c=function(n,a,b){ return Wd[n].filter(function(e){ return e.ck>=a&&e.ck<=b; }).length; };
  console.log('seed', seed, 'planks k0-1', c('planks',0,1), 'k6-9', c('planks',6,9), '| pads k0', c('pads',0,0), 'k6-9', c('pads',6,9)); });
