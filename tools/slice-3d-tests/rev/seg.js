// Run the REAL ffSegments and endlessChunk with every mesh/art call stubbed (no stub can draw from the dive's rng: it is local)
var fs=require('fs'), vm=require('vm');
var SRC=fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html','utf8');
function grab(name){ var i=SRC.indexOf('function '+name+'('); if(i<0)throw new Error('no '+name);
  var j=SRC.indexOf('{',i), d=0, k=j; for(;k<SRC.length;k++){ var c=SRC[k]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0)break; } } return SRC.slice(i,k+1); }
function stubObj(){ var o=function(){ return P; }; var P=new Proxy(o,{ get:function(t,k){ if(k==='position'||k==='scale'||k==='rotation')return {set:function(){},x:0,y:0,z:0}; if(k===Symbol.toPrimitive)return function(){ return 0; }; return P; }, set:function(){ return true; }, construct:function(){ return P; }, apply:function(){ return P; } }); return P; }
var S=stubObj();
var fruitN=(SRC.match(/var FRUIT=\[([\s\S]*?)\n\];/)[1].match(/\{n:/g)||[]).length;
var ctx={ Math:Math, console:console, THREE:S, addMesh:function(m){ return m; }, slabUV:function(){}, boxUV:function(){}, jellyMat:function(){ return S; },
  fruitAt:function(){ return {}; }, swingFruit:function(){ return {}; }, waspAt:function(){ return {}; }, plankAt:function(){ return {}; },
  boomAt:function(){ return {}; }, thornAt:function(){ return {}; }, crystal:function(){ return {}; },
  FRUIT:Array.apply(null,Array(fruitN)).map(function(){ return {r:1}; }), PINATA:{r:1}, GOLDF:{r:1}, WOOD_D:0, CAP:0,
  HZ:null, SLB:null, MESHSINK:null, ECHL:[], ECH_H:100, ENDLESS_BAND:300, VERBS_OFF:false,
  WORLD_IDS:['mossy_canyon','frost_chasm','ember_kiln','glowcave','orchard_loft','lantern_night','deep_tide','clockwork_well'],
  VERB_OF:{ orchard_loft:'chime', lantern_night:'lantern', frost_chasm:'ice', ember_kiln:'loaf' },
  VERB_HOST:{ chime:'branch', lantern:'branch', ice:'stack', loaf:'stack' },
  ECH_LISTS:['blocks','items','crystals','pads','slabs','wasps','planks','thorns','verbs'],
  chimeAt:function(V,g,SW,x,y){ V.push({kind:'tube', y:y}); }, lanternLineAt:function(V,g,SW,ws,y){ V.push({kind:'rope', y:y}); },
  iceAt:function(V,A,g,SW,ws,x,y){ V.push({kind:'ice', x:x, y:y}); A.pads.push({x:x,y:y-8.5,r:2,up:true}); }, loafAt:function(V,g,ws,x,y){ V.push({kind:'loaf', x:x, y:y}); },
  worldSet:function(id){ return {id:id, wall:S, wallR:S, ledge:S, shelf:S, slab:S, trim:S, back:{map:{repeat:{set:function(){}}}}}; },
  bandBack:function(){ return S; }, ffDecor:function(){}, depthRing:function(){}
};
vm.createContext(ctx);
['mulberry32','ffSegments','endlessChunk'].forEach(function(n){ vm.runInContext(grab(n), ctx); });
module.exports={ctx:ctx, vm:vm};
if(require.main===module){
  // Endless: every middle chunk (k%3===1) of the chime and lantern worlds' bands, many salts
  var placed={}, total={};
  for(var salt=1; salt<=400; salt++){
    for(var fwi=0; fwi<8; fwi++){
      var W={ SW:9.2, end:{fwi:fwi, salt:(salt*2654435761)>>>0, live:{}, k:-1} }; ctx.ECH_LISTS.forEach(function(n){ W[n]=[]; });
      for(var band=0; band<11; band++){
        var k=band*3+1, wi=(fwi+band)%8, kind=ctx.VERB_OF[ctx.WORLD_IDS[wi]]; if(!kind)continue;
        var before=W.verbs.length; ctx.endlessChunk(W, k);
        total[kind]=(total[kind]||0)+1; if(W.verbs.length>before)placed[kind]=(placed[kind]||0)+1;
      }
    }
  }
  for(var kd in total)console.log(kd, 'placed in', placed[kd]||0, 'of', total[kd], ((placed[kd]||0)/total[kd]*100).toFixed(1)+'%');
}
