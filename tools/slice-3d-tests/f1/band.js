// Part F1 (24 Oct): the REAL Endless chunk builder (endlessChunk, endlessLvl, endlessExtra, ffSegments) in the e2 vm harness.
// For many dives: how many world bands with a verb get it (Part D's promise), and the hazards per 400 m by depth.
// node band.js [dives]   (SRCF=<page> to run another copy)
var W=require('../e2/world.js'), ctx=W.ctx, vm=W.vm;
['endlessLvl','endlessExtra','endlessChunk','bandBack'].forEach(function(n){ vm.runInContext(W.grab(n), ctx); });
vm.runInContext('var END_LVL_PIN=null, ENDLESS_LVL_MAX=7;', ctx);
var N=+process.argv[2]||300, miss={}, tot={}, hz={};
for(var d=0; d<N; d++){
  var salt=(d*2654435761+12345)>>>0, fwi=d%8;
  var Wd={ ff:true, len:1e9, SW:9.2, floorY:-1e9, end:{ fwi:fwi, salt:salt, live:{}, k:-1 } }, i;
  ctx.ECH_LISTS.forEach(function(n){ Wd[n]=[]; });
  ctx.G_FFSALT=salt; ctx.G={ world:Wd };
  for(var k=0;k<24;k++){ vm.runInContext('endlessChunk(__W,'+k+')', Object.assign(ctx,{__W:Wd})); }
  // bands 0..7 (k 0..23): which have a verb, which got it
  for(var b=0;b<8;b++){ var id=ctx.WORLD_IDS[(fwi+b)%ctx.WORLD_IDS.length], vk=ctx.VERB_OF[id]; if(!vk)continue;
    tot[vk]=(tot[vk]||0)+1; if(Wd.end.vbK[b]==null)miss[vk]=(miss[vk]||0)+1; }
  ['crystals','wasps','thorns'].forEach(function(n){ Wd[n].forEach(function(e){ var q=Math.floor(e.ck/4); hz[q]=(hz[q]||0)+1; }); });
}
console.log(N+' dives, world bands that never got their verb:', Object.keys(tot).map(function(k){ return k+' '+(miss[k]||0)+' of '+tot[k]; }).join(', '));
console.log('crystals + wasps + thorns per dive, by 400 m:', Object.keys(hz).map(function(q){ return (q*400)+'-'+(q*400+400)+'m '+(hz[q]/N).toFixed(1); }).join(' | '));
